-- ============================================================================
--  TEACHER XP GRANTS  —  hand XP to a student for work the site can't see.
--
--  Participation, a good question, helping a neighbor, a paper worksheet, or
--  making good a challenge the site itself got wrong. Multi-level like every
--  other flag on the site — Easy/Medium/Hard = 50/100/150 XP — capped at ±150
--  per grant (server-enforced), logged with who granted it and why.
--
--  THE DOUBLE-COUNT TRAP, AND HOW THIS AVOIDS IT
--  progress.bonus is CLIENT-owned: the student's browser pushes its local bonus
--  on every sync, and sync.js merges server/local with Math.max. So a teacher
--  grant written straight into `bonus` would ride up into the student's local
--  state, come back on the next push, and get added again — XP that inflates on
--  its own. Instead:
--
--    teacher_bonus  server-owned, only this file's grant function writes it
--    client_bonus   the last value the student's browser pushed
--    bonus          derived = client_bonus + teacher_bonus   (what everything reads)
--
--  The sync functions are redefined below to recover client_bonus from the
--  pushed value:  client_bonus = greatest(p_bonus - teacher_bonus, 0), then
--  bonus = client_bonus + teacher_bonus. Idempotent: pushing the same number
--  repeatedly can't grow it, and the student still SEES the granted XP because
--  `bonus` is what the pull returns.
--
--  Every existing report already sums points + bonus, so nothing else changes:
--  leaderboards, squad standings, class averages and CSV exports pick granted XP
--  up automatically.
--
--  Run AFTER schema.sql and google-auth.sql. Safe to re-run.
--  ⚠ If you ever re-run schema.sql or google-auth.sql, re-run this file after:
--     they redefine ctf_sync / ctf_sync_google without the teacher_bonus math.
-- ============================================================================

alter table progress add column if not exists teacher_bonus int not null default 0;
alter table progress add column if not exists client_bonus  int not null default 0;

-- seed client_bonus from whatever is already there, once
update progress set client_bonus = bonus
 where client_bonus = 0 and bonus > 0 and teacher_bonus = 0;

create table if not exists xp_grants (
  id            uuid primary key default gen_random_uuid(),
  class_id      uuid not null references classes(id) on delete cascade,
  student_id    uuid not null references students(id) on delete cascade,
  teacher_email text,
  amount        int  not null,
  reason        text,
  created_at    timestamptz not null default now()
);
create index if not exists xp_grants_class on xp_grants (class_id, created_at desc);
create index if not exists xp_grants_student on xp_grants (student_id, created_at desc);

alter table xp_grants enable row level security;
-- no policies: the security-definer functions below are the only way in

-- ---- teacher: grant (or claw back) XP --------------------------------------
-- p_amount is clamped to ±100 per call. Total teacher_bonus never goes below 0,
-- so a deduction can't make a student's XP negative.
create or replace function ctf_t_grant_xp(p_student uuid, p_amount int, p_reason text)
returns json language plpgsql security definer set search_path = public as $$
declare v_class uuid; v_amt int; v_tb int; v_cb int; v_new int;
begin
  if not _is_teacher() then return json_build_object('error','not_teacher'); end if;

  select class_id into v_class from students where id = p_student;
  if v_class is null then return json_build_object('error','no_student'); end if;

  v_amt := greatest(-150, least(150, coalesce(p_amount, 0)));
  if v_amt = 0 then return json_build_object('error','zero_amount'); end if;

  insert into progress (student_id, course, points, bonus)
    select p_student, c.course, 0, 0 from classes c where c.id = v_class
    on conflict (student_id) do nothing;

  select coalesce(teacher_bonus,0), coalesce(client_bonus, bonus, 0)
    into v_tb, v_cb from progress where student_id = p_student;

  v_new := greatest(0, coalesce(v_tb,0) + v_amt);

  update progress
     set teacher_bonus = v_new,
         bonus         = coalesce(v_cb,0) + v_new,
         updated_at    = now()
   where student_id = p_student;

  insert into xp_grants (class_id, student_id, teacher_email, amount, reason)
  values (v_class, p_student, lower(coalesce(_email(),'')), v_new - coalesce(v_tb,0),
          nullif(btrim(coalesce(p_reason,'')), ''));

  return json_build_object('ok', true, 'granted', v_new - coalesce(v_tb,0),
    'teacher_bonus', v_new, 'bonus', coalesce(v_cb,0) + v_new);
end $$;
revoke all on function ctf_t_grant_xp(uuid, int, text) from public, anon;
grant execute on function ctf_t_grant_xp(uuid, int, text) to authenticated;

-- ---- teacher: same grant to many students at once --------------------------
-- Participation is usually a group act (a table, a squad, everyone who showed
-- up). Same ±100 clamp, one log row per student so the history stays per-child.
create or replace function ctf_t_grant_xp_bulk(p_students uuid[], p_amount int, p_reason text)
returns json language plpgsql security definer set search_path = public as $$
declare v_id uuid; v_n int := 0; v_r json;
begin
  if not _is_teacher() then return json_build_object('error','not_teacher'); end if;
  if p_students is null or array_length(p_students,1) is null then
    return json_build_object('error','no_students'); end if;

  foreach v_id in array p_students loop
    v_r := ctf_t_grant_xp(v_id, p_amount, p_reason);
    if (v_r->>'ok') = 'true' then v_n := v_n + 1; end if;
  end loop;

  return json_build_object('ok', true, 'students', v_n,
    'amount', greatest(-150, least(150, coalesce(p_amount,0))));
end $$;
revoke all on function ctf_t_grant_xp_bulk(uuid[], int, text) from public, anon;
grant execute on function ctf_t_grant_xp_bulk(uuid[], int, text) to authenticated;

-- ---- teacher: undo a grant --------------------------------------------------
-- Reverses the amount and removes the log row, so an accidental +50 doesn't
-- leave a +50 / -50 pair to explain. Floors the running total at 0.
create or replace function ctf_t_undo_grant(p_grant uuid)
returns json language plpgsql security definer set search_path = public as $$
declare v_g xp_grants; v_tb int; v_cb int; v_new int;
begin
  if not _is_teacher() then return json_build_object('error','not_teacher'); end if;

  select * into v_g from xp_grants where id = p_grant;
  if not found then return json_build_object('error','no_grant'); end if;

  select coalesce(teacher_bonus,0), coalesce(client_bonus, bonus, 0)
    into v_tb, v_cb from progress where student_id = v_g.student_id;

  v_new := greatest(0, coalesce(v_tb,0) - v_g.amount);

  update progress
     set teacher_bonus = v_new,
         bonus         = coalesce(v_cb,0) + v_new,
         updated_at    = now()
   where student_id = v_g.student_id;

  delete from xp_grants where id = p_grant;

  return json_build_object('ok', true, 'undone', v_g.amount, 'teacher_bonus', v_new);
end $$;
revoke all on function ctf_t_undo_grant(uuid) from public, anon;
grant execute on function ctf_t_undo_grant(uuid) to authenticated;

-- ---- teacher: the grant log -------------------------------------------------
create or replace function ctf_t_xp_grants(p_class uuid, p_limit integer default 200)
returns json language plpgsql security definer set search_path = public as $$
begin
  if not _is_teacher() then return json_build_object('error','not_teacher'); end if;
  return coalesce((
    select json_agg(row_to_json(t)) from (
      select g.id, g.student_id, s.handle, g.amount, g.reason,
             g.teacher_email, g.created_at
      from xp_grants g join students s on s.id = g.student_id
      where g.class_id = p_class
      order by g.created_at desc
      limit greatest(coalesce(p_limit,200),1)
    ) t), '[]'::json);
end $$;
revoke all on function ctf_t_xp_grants(uuid, integer) from public, anon;
grant execute on function ctf_t_xp_grants(uuid, integer) to authenticated;

-- ---- sync, redefined so a grant can't be overwritten or double-counted -----
create or replace function ctf_sync_google(
  p_student uuid, p_points int, p_bonus int, p_solved int, p_total int,
  p_state jsonb, p_streak jsonb, p_badges jsonb
) returns json language plpgsql security definer set search_path = public as $$
declare v_student students; v_tb int; v_cb int;
begin
  select * into v_student from students where id = p_student and auth_user_id = auth.uid();
  if not found then return json_build_object('error','not_yours'); end if;

  insert into progress (student_id, course) select v_student.id, c.course from classes c
    where c.id = v_student.class_id on conflict (student_id) do nothing;

  select coalesce(teacher_bonus,0) into v_tb from progress where student_id = p_student;
  v_tb := coalesce(v_tb, 0);
  -- the client may be echoing back XP we granted; strip it before storing
  v_cb := greatest(coalesce(p_bonus,0) - v_tb, 0);

  update progress set
    points        = p_points,
    client_bonus  = v_cb,
    teacher_bonus = v_tb,
    bonus         = v_cb + v_tb,
    solved_count  = p_solved, total_count = p_total,
    state  = coalesce(p_state,'{}'::jsonb),
    streak = coalesce(p_streak,'{}'::jsonb),
    badges = coalesce(p_badges,'{}'::jsonb),
    updated_at = now()
  where student_id = p_student;

  update students set last_seen = now() where id = p_student;
  return json_build_object('ok', true, 'bonus', v_cb + v_tb, 'teacher_bonus', v_tb);
end $$;
revoke all on function ctf_sync_google(uuid, int, int, int, int, jsonb, jsonb, jsonb) from public, anon;
grant execute on function ctf_sync_google(uuid, int, int, int, int, jsonb, jsonb, jsonb) to authenticated;

notify pgrst, 'reload schema';
