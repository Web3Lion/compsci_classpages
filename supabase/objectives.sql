-- ============================================================================
--  OBJECTIVES  —  measuring the course objectives already named in every flag.
--
--  Run AFTER schema.sql, google-auth.sql, class-gates.sql. attempt-log.sql is
--  optional: wrong-guess counts come from it when present, and mastery falls
--  back to flag_events.retries when it isn't.
--
--  The objective -> flag mapping lives client-side in objectives.js, parsed
--  from the "Objective — X." line in each prompt. This file only ships the raw
--  per-student capture rows the mapping needs, so re-labelling an objective
--  never means a migration.
--
--  Student visibility is off by default and is a per-class teacher switch, the
--  same shape as squads: an objective breakdown is feedback, and a teacher
--  should choose when a class is ready to see it.
--
--  Safe to re-run.
-- ============================================================================

alter table classes add column if not exists objectives_on boolean not null default false;

-- ---- teacher: flip the switch ----------------------------------------------
create or replace function ctf_t_objectives_on(p_class uuid, p_on boolean)
returns json language plpgsql security definer set search_path = public as $$
begin
  if not _is_teacher() then return json_build_object('error','not_teacher'); end if;
  update classes set objectives_on = coalesce(p_on, false) where id = p_class;
  if not found then return json_build_object('error','no_class'); end if;
  return json_build_object('ok', true, 'objectives_on', coalesce(p_on, false));
end $$;

-- the class list and the student gate both carry it
create or replace function ctf_t_classes()
returns json language plpgsql security definer set search_path = public as $$
begin
  if not _is_teacher() then return json_build_object('error','not_teacher'); end if;
  return coalesce((select json_agg(row_to_json(t) order by t.course, t.name) from (
    select c.id, c.course, c.name, c.code, c.frozen_dates, c.created_at,
           coalesce(c.locked_modules,'{}') as locked_modules,
           coalesce(c.locked_flags,'{}')   as locked_flags,
           c.persona_on, c.answer_key_on,
           coalesce(c.squads_on,false)     as squads_on,
           coalesce(c.objectives_on,false) as objectives_on,
           (select count(*) from students s where s.class_id = c.id) as student_count
    from classes c
  ) t), '[]'::json);
end $$;
revoke all on function ctf_t_classes() from public, anon;
grant execute on function ctf_t_classes() to authenticated;

create or replace function ctf_gates(p_class uuid)
returns json language plpgsql security definer set search_path = public as $$
declare v json;
begin
  select json_build_object(
    'locked_modules', coalesce(c.locked_modules,'{}'),
    'locked_flags',   coalesce(c.locked_flags,'{}'),
    'persona_on',     coalesce(c.persona_on,false),
    'answer_key_on',  coalesce(c.answer_key_on,false),
    'squads_on',      coalesce(c.squads_on,false),
    'objectives_on',  coalesce(c.objectives_on,false)
  ) into v from classes c where c.id = p_class;
  return coalesce(v, json_build_object(
    'locked_modules','{}','locked_flags','{}',
    'persona_on',false,'answer_key_on',false,'squads_on',false,'objectives_on',false));
end $$;
revoke all on function ctf_gates(uuid) from public, anon;
grant execute on function ctf_gates(uuid) to authenticated;

-- ---- teacher: every capture in the class, one row per student per flag ------
-- Deliberately thin: flag_key, who, and the two facts mastery needs (was it
-- tainted, how many wrong guesses). The client joins these to objectives.
-- wrong_tries prefers the attempt log and falls back to the aggregate retry
-- count, so this works whether or not attempt-log.sql has been run.
create or replace function ctf_t_captures(p_class uuid)
returns json language plpgsql security definer set search_path = public as $$
declare v_has_attempts boolean;
begin
  if not _is_teacher() then return json_build_object('error','not_teacher'); end if;

  select exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'attempt_events'
  ) into v_has_attempts;

  if v_has_attempts then
    return coalesce((
      select json_agg(row_to_json(t))
      from (
        select f.student_id, f.handle, f.flag_key, f.level, f.secs,
               coalesce(f.tainted,false) as tainted,
               greatest(
                 coalesce(f.retries,0),
                 coalesce((select count(*) from attempt_events a
                            where a.student_id = f.student_id
                              and a.flag_key = f.flag_key
                              and not a.correct), 0)
               ) as wrong_tries,
               f.created_at
        from flag_events f
        where f.class_id = p_class
      ) t
    ), '[]'::json);
  end if;

  return coalesce((
    select json_agg(row_to_json(t))
    from (
      select f.student_id, f.handle, f.flag_key, f.level, f.secs,
             coalesce(f.tainted,false) as tainted,
             coalesce(f.retries,0) as wrong_tries,
             f.created_at
      from flag_events f
      where f.class_id = p_class
    ) t
  ), '[]'::json);
end $$;
revoke all on function ctf_t_captures(uuid) from public, anon;
grant execute on function ctf_t_captures(uuid) to authenticated;

-- ---- student: my own captures, for my own objective map --------------------
-- Same thin shape, scoped hard to the caller. Returns { on:false } while the
-- teacher switch is off, so the profile page shows nothing.
create or replace function ctf_my_captures(p_student uuid)
returns json language plpgsql security definer set search_path = public as $$
declare v_s students; v_c classes;
begin
  select * into v_s from students
    where id = p_student and auth_user_id = auth.uid();
  if not found then return json_build_object('error','not_yours'); end if;

  select * into v_c from classes where id = v_s.class_id;
  if not coalesce(v_c.objectives_on, false) then return json_build_object('on', false); end if;

  return json_build_object('on', true, 'captures', coalesce((
    select json_agg(row_to_json(t))
    from (
      select f.flag_key, f.level, coalesce(f.tainted,false) as tainted,
             coalesce(f.retries,0) as wrong_tries, f.created_at
      from flag_events f
      where f.student_id = v_s.id
    ) t
  ), '[]'::json));
end $$;
revoke all on function ctf_my_captures(uuid) from public, anon;
grant execute on function ctf_my_captures(uuid) to authenticated;

notify pgrst, 'reload schema';
