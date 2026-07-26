-- ============================================================================
--  ATTEMPT LOG  —  run AFTER schema.sql, google-auth.sql, teacher-reports.sql,
--  class-gates.sql, answer-key.sql.
--
--  Until now only the winning submission was recorded (with an aggregate retry
--  count). This adds a row per SUBMISSION so a teacher can open one flag for
--  one student and see the whole story: every guess, when it happened, how long
--  they'd been working, and which integrity events fired while that flag was
--  open.
--
--  Student guesses are NOT stored verbatim by default — see p_guess below.
-- ============================================================================

create table if not exists attempt_events (
  id           bigserial primary key,
  student_id   uuid not null references students(id) on delete cascade,
  class_id     uuid not null references classes(id)  on delete cascade,
  course       text not null,
  handle       text,
  flag_key     text not null,          -- challenge id, or "id#levelIndex"
  challenge_id text,
  title        text,
  level        text,
  correct      boolean not null default false,
  secs         int,                    -- seconds since the student opened the flag
  guess        text,                   -- short, sanitized; null unless enabled
  created_at   timestamptz not null default now()
);
alter table attempt_events enable row level security;   -- no policies: sealed
create index if not exists attempt_events_student_flag_idx on attempt_events (student_id, flag_key);
create index if not exists attempt_events_class_idx        on attempt_events (class_id, created_at desc);

-- Give integrity events flag context so "violations during this flag" is answerable.
alter table cheat_events add column if not exists flag_key text;
create index if not exists cheat_events_student_flag_idx on cheat_events (student_id, flag_key);

-- ---- student writes one attempt -------------------------------------------
create or replace function ctf_attempt_google(
  p_student uuid, p_key text, p_challenge text, p_title text, p_level text,
  p_correct boolean, p_secs int, p_guess text
) returns json language plpgsql security definer set search_path = public as $$
declare v_student students; v_class classes;
begin
  select * into v_student from students where id = p_student and auth_user_id = auth.uid();
  if not found then return json_build_object('error','not_yours'); end if;
  select * into v_class from classes where id = v_student.class_id;

  insert into attempt_events (student_id, class_id, course, handle, flag_key, challenge_id,
                              title, level, correct, secs, guess)
  values (v_student.id, v_student.class_id, v_class.course, v_student.handle,
          left(coalesce(p_key,''),80), left(coalesce(p_challenge,''),80),
          left(coalesce(p_title,''),200), left(coalesce(p_level,''),16),
          coalesce(p_correct,false), p_secs, left(nullif(p_guess,''),120));
  return json_build_object('ok', true);
end $$;

-- ---- cheat logging gains flag context --------------------------------------
create or replace function ctf_cheat_google(p_student uuid, p_kind text, p_detail text, p_flag text default null)
returns json language plpgsql security definer set search_path = public as $$
declare v_student students; v_class classes;
begin
  select * into v_student from students where id = p_student and auth_user_id = auth.uid();
  if not found then return json_build_object('error','not_yours'); end if;
  select * into v_class from classes where id = v_student.class_id;
  insert into cheat_events (student_id, class_id, course, handle, kind, detail, flag_key)
    values (v_student.id, v_student.class_id, v_class.course, v_student.handle,
            left(coalesce(p_kind,''),32), left(coalesce(p_detail,''),400), left(nullif(p_flag,''),80));
  return json_build_object('ok', true);
end $$;

-- ---- teacher: the full story of one flag for one student -------------------
create or replace function ctf_t_flag_detail(p_student uuid, p_key text)
returns json language plpgsql security definer set search_path = public as $$
declare v json;
begin
  if not _is_teacher() then return json_build_object('error','not_teacher'); end if;
  select json_build_object(
    'student', (select json_build_object('id', s.id, 'handle', s.handle, 'email', s.email)
                  from students s where s.id = p_student),
    'capture', (select row_to_json(f) from (
        select flag_key, challenge_id, title, level, points, secs, retries, tainted, created_at
        from flag_events where student_id = p_student and flag_key = p_key limit 1) f),
    'attempts', coalesce((select json_agg(row_to_json(a) order by a.created_at) from (
        select correct, secs, guess, created_at
        from attempt_events where student_id = p_student and flag_key = p_key) a), '[]'::json),
    'cheats', coalesce((select json_agg(row_to_json(c) order by c.created_at) from (
        select kind, detail, created_at
        from cheat_events where student_id = p_student and flag_key = p_key) c), '[]'::json),
    -- how the rest of the class did on the same flag, for context
    'class_avg_secs', (select round(avg(nullif(secs,-1))) from flag_events
                        where flag_key = p_key
                          and class_id = (select class_id from students where id = p_student)),
    'class_solves',   (select count(*) from flag_events
                        where flag_key = p_key
                          and class_id = (select class_id from students where id = p_student))
  ) into v;
  return v;
end $$;

do $$
declare f text;
begin
  foreach f in array array[
    'ctf_attempt_google(uuid,text,text,text,text,boolean,int,text)',
    'ctf_cheat_google(uuid,text,text,text)',
    'ctf_t_flag_detail(uuid,text)'
  ] loop
    execute format('revoke all on function %s from public, anon', f);
    execute format('grant execute on function %s to authenticated', f);
  end loop;
end $$;

-- the 3-arg cheat function is superseded by the 4-arg one above
drop function if exists ctf_cheat_google(uuid,text,text);

-- the student record must expose flag_key so the teacher UI can open one flag
create or replace function ctf_t_student(p_student uuid)
returns json language plpgsql security definer set search_path = public as $$
declare v json;
begin
  if not _is_teacher() then return json_build_object('error','not_teacher'); end if;
  select json_build_object(
    'student', (select row_to_json(t) from (
        select s.id, s.handle, s.email, s.created_at, s.last_seen,
               c.name as class_name, c.course,
               coalesce(p.points,0) as points, coalesce(p.bonus,0) as bonus,
               coalesce(p.solved_count,0) as solved_count,
               coalesce(p.total_count,0) as total_count,
               coalesce(p.streak,'{}'::jsonb) as streak,
               coalesce(p.badges,'{}'::jsonb) as badges,
               coalesce(p.state,'{}'::jsonb)  as state,
               p.updated_at
        from students s join classes c on c.id = s.class_id
        left join progress p on p.student_id = s.id
        where s.id = p_student) t),
    'flags', coalesce((select json_agg(row_to_json(f) order by f.created_at desc) from (
        select flag_key, challenge_id, title, level, points, secs, retries, tainted, created_at,
               (select count(*) from attempt_events a
                 where a.student_id = p_student and a.flag_key = fe.flag_key and not a.correct) as wrong_tries,
               (select count(*) from cheat_events ce
                 where ce.student_id = p_student and ce.flag_key = fe.flag_key) as flag_cheats
        from flag_events fe where student_id = p_student) f), '[]'::json),
    'cheats', coalesce((select json_agg(row_to_json(x) order by x.created_at desc) from (
        select kind, detail, flag_key, created_at from cheat_events
        where student_id = p_student limit 200) x), '[]'::json),
    'days', coalesce((select json_agg(day order by day) from activity_days
        where student_id = p_student), '[]'::json)
  ) into v;
  return v;
end $$;
revoke all on function ctf_t_student(uuid) from public, anon;
grant execute on function ctf_t_student(uuid) to authenticated;

notify pgrst, 'reload schema';
