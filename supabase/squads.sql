-- ============================================================================
--  SQUADS  —  student-facing teams, built by the teacher.
--
--  Run AFTER supabase/class-groups.sql. Squads reuse the class_groups table:
--  a squad IS a group that the teacher has chosen to show students. The
--  teacher-only uses of groups (intervention tiers, reading groups) keep
--  working exactly as before; the only difference is a per-class switch.
--
--  Why a switch and not always-on: naming a team publicly is a real classroom
--  decision. A group called "needs re-teach" must never appear on a student's
--  screen, so nothing is student-visible until the teacher turns it on for
--  that class. While it is off, ctf_squads returns { on: false } and the
--  arena shows nothing.
--
--  Standings are aggregate. A student sees squad totals and their own squad's
--  member handles, never another squad's individual students.
--
--  Safe to re-run.
-- ============================================================================

alter table classes add column if not exists squads_on boolean not null default false;

-- ---- teacher: flip the switch ----------------------------------------------
create or replace function ctf_t_squads_on(p_class uuid, p_on boolean)
returns json language plpgsql security definer set search_path = public as $$
begin
  if not _is_teacher() then return json_build_object('error','not_teacher'); end if;
  update classes set squads_on = coalesce(p_on, false) where id = p_class;
  if not found then return json_build_object('error','no_class'); end if;
  return json_build_object('ok', true, 'squads_on', coalesce(p_on, false));
end $$;

-- the class list carries the switch so the dashboard can show its state
create or replace function ctf_t_classes()
returns json language plpgsql security definer set search_path = public as $$
begin
  if not _is_teacher() then return json_build_object('error','not_teacher'); end if;
  return coalesce((select json_agg(row_to_json(t) order by t.course, t.name) from (
    select c.id, c.course, c.name, c.code, c.frozen_dates, c.created_at,
           coalesce(c.locked_modules,'{}') as locked_modules,
           coalesce(c.locked_flags,'{}')   as locked_flags,
           c.persona_on, c.answer_key_on, coalesce(c.squads_on,false) as squads_on,
           (select count(*) from students s where s.class_id = c.id) as student_count
    from classes c
  ) t), '[]'::json);
end $$;
revoke all on function ctf_t_classes() from public, anon;
grant execute on function ctf_t_classes() to authenticated;

-- ---- standings, shared by both sides ---------------------------------------
-- avg_xp is what ranks squads, not total: a squad of three should not lose to
-- a squad of six for being small. Both are returned so the teacher can see the
-- difference. Empty squads are included so a teacher can spot them.
create or replace function _squad_standings(p_class uuid)
returns json language sql stable security definer set search_path = public as $$
  select coalesce((
    select json_agg(row_to_json(t) order by t.avg_xp desc, lower(t.name))
    from (
      select g.id, g.name, g.color, g.sort,
             count(s.id) as members,
             coalesce(sum(coalesce(p.points,0) + coalesce(p.bonus,0)), 0) as total_xp,
             case when count(s.id) = 0 then 0
                  else round(avg(coalesce(p.points,0) + coalesce(p.bonus,0)))
             end as avg_xp,
             coalesce(sum(coalesce(p.solved_count,0)), 0) as solved,
             max(s.last_seen) as last_active
      from class_groups g
      left join students s on s.group_id = g.id
      left join progress p on p.student_id = s.id
      where g.class_id = p_class
      group by g.id, g.name, g.color, g.sort
    ) t
  ), '[]'::json);
$$;

-- ---- student: my squad + the standings -------------------------------------
-- Returns { on, squad: {...}|null, mates: [handles], standings: [...] }.
create or replace function ctf_squads(p_student uuid)
returns json language plpgsql security definer set search_path = public as $$
declare v_s students; v_c classes; v_squad json; v_mates json;
begin
  select * into v_s from students
    where id = p_student and auth_user_id = auth.uid();
  if not found then return json_build_object('error','not_yours'); end if;

  select * into v_c from classes where id = v_s.class_id;
  if not coalesce(v_c.squads_on, false) then return json_build_object('on', false); end if;

  if v_s.group_id is not null then
    select row_to_json(t) into v_squad from (
      select g.id, g.name, g.color from class_groups g where g.id = v_s.group_id
    ) t;
    -- own squad only: handles of teammates, best first, so the card can list them
    select coalesce(json_agg(row_to_json(m) order by m.xp desc), '[]'::json) into v_mates from (
      select s2.handle,
             coalesce(p2.points,0) + coalesce(p2.bonus,0) as xp,
             coalesce(p2.solved_count,0) as solved,
             (s2.id = v_s.id) as is_me
      from students s2
      left join progress p2 on p2.student_id = s2.id
      where s2.group_id = v_s.group_id
    ) m;
  end if;

  return json_build_object(
    'on', true,
    'squad', v_squad,
    'mates', coalesce(v_mates, '[]'::json),
    'standings', _squad_standings(v_s.class_id)
  );
end $$;

-- ---- teacher: the same standings, for the dashboard ------------------------
create or replace function ctf_t_squad_standings(p_class uuid)
returns json language plpgsql security definer set search_path = public as $$
begin
  if not _is_teacher() then return json_build_object('error','not_teacher'); end if;
  return _squad_standings(p_class);
end $$;

-- ---- teacher: even split ----------------------------------------------------
-- Convenience only, and deliberately dumb: it deals students into the squads
-- the TEACHER already made, strongest-first snaking so the squads start out
-- comparable. p_only_ungrouped leaves existing assignments alone.
create or replace function ctf_t_squads_autofill(p_class uuid, p_only_ungrouped boolean default true)
returns json language plpgsql security definer set search_path = public as $$
declare
  v_ids uuid[]; v_n int; v_i int := 0; v_dir int := 1; v_slot int := 1; v_moved int := 0;
  v_sid uuid;
begin
  if not _is_teacher() then return json_build_object('error','not_teacher'); end if;

  select array_agg(id order by sort, lower(name)) into v_ids
    from class_groups where class_id = p_class;
  v_n := coalesce(array_length(v_ids, 1), 0);
  if v_n = 0 then return json_build_object('error','no_squads'); end if;

  for v_sid in
    select s.id from students s
    left join progress p on p.student_id = s.id
    where s.class_id = p_class
      and (not coalesce(p_only_ungrouped, true) or s.group_id is null)
    order by (coalesce(p.points,0) + coalesce(p.bonus,0)) desc, s.created_at
  loop
    update students set group_id = v_ids[v_slot] where id = v_sid;
    v_moved := v_moved + 1;
    -- snake: 1,2,3,3,2,1,1,2,3… keeps the strongest players spread out
    if v_dir = 1 then
      if v_slot = v_n then v_dir := -1; else v_slot := v_slot + 1; end if;
    else
      if v_slot = 1 then v_dir := 1; else v_slot := v_slot - 1; end if;
    end if;
    v_i := v_i + 1;
  end loop;

  return json_build_object('ok', true, 'assigned', v_moved, 'squads', v_n);
end $$;

do $$
declare f text;
begin
  foreach f in array array[
    'ctf_t_squads_on(uuid,boolean)',
    'ctf_t_squad_standings(uuid)',
    'ctf_t_squads_autofill(uuid,boolean)',
    'ctf_squads(uuid)'
  ] loop
    execute format('revoke all on function %s from public, anon', f);
    execute format('grant execute on function %s to authenticated', f);
  end loop;
  execute 'revoke all on function _squad_standings(uuid) from public, anon';
end $$;

notify pgrst, 'reload schema';
