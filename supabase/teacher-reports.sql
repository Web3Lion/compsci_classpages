-- ============================================================================
--  TEACHER REPORTING  —  run AFTER schema.sql and google-auth.sql.
--
--  Adds:
--    * activity_days      one row per student per day they opened the arena,
--                         so the login report can show real attendance even
--                         when a student solved nothing that day.
--    * ctf_t_class_summary   class-level rollup for the Summary tab
--    * ctf_t_student(...)    one student's full record for the drill-down
--    * ctf_t_flag_stats(...) per-flag difficulty analytics
--    * ctf_t_attendance(...) the calendar grid data
-- ============================================================================

create table if not exists activity_days (
  student_id uuid not null references students(id) on delete cascade,
  day        date not null,
  hits       int  not null default 1,
  primary key (student_id, day)
);
alter table activity_days enable row level security;
create index if not exists activity_days_day_idx on activity_days (day);

-- Called by the arena on load. Cheap, idempotent per day.
create or replace function ctf_touch_day(p_student uuid)
returns json language plpgsql security definer set search_path = public as $$
declare v_student students;
begin
  select * into v_student from students where id = p_student and auth_user_id = auth.uid();
  if not found then return json_build_object('error','not_yours'); end if;
  insert into activity_days (student_id, day) values (p_student, current_date)
    on conflict (student_id, day) do update set hits = activity_days.hits + 1;
  update students set last_seen = now() where id = p_student;
  return json_build_object('ok', true);
end $$;

-- ---- class summary ----------------------------------------------------------
create or replace function ctf_t_class_summary(p_class uuid)
returns json language plpgsql security definer set search_path = public as $$
declare v json;
begin
  if not _is_teacher() then return json_build_object('error','not_teacher'); end if;
  select json_build_object(
    'students',      (select count(*) from students where class_id = p_class),
    'active_7d',     (select count(distinct student_id) from activity_days a
                        join students s on s.id = a.student_id
                       where s.class_id = p_class and a.day > current_date - 7),
    'avg_xp',        (select coalesce(round(avg(coalesce(p.points,0)+coalesce(p.bonus,0))),0)
                        from students s left join progress p on p.student_id = s.id
                       where s.class_id = p_class),
    'median_xp',     (select coalesce(round(percentile_cont(0.5) within group (
                          order by coalesce(p.points,0)+coalesce(p.bonus,0))),0)
                        from students s left join progress p on p.student_id = s.id
                       where s.class_id = p_class),
    'avg_pct',       (select coalesce(round(avg(case when coalesce(p.total_count,0) > 0
                          then p.solved_count::numeric / p.total_count * 100 else 0 end)),0)
                        from students s left join progress p on p.student_id = s.id
                       where s.class_id = p_class),
    'captures',      (select count(*) from flag_events where class_id = p_class),
    'avg_secs',      (select coalesce(round(avg(secs)),0) from flag_events
                       where class_id = p_class and secs >= 0),
    'tainted',       (select count(*) from flag_events where class_id = p_class and tainted),
    'integrity',     (select count(*) from cheat_events where class_id = p_class),
    'never_started', (select count(*) from students s
                        left join progress p on p.student_id = s.id
                       where s.class_id = p_class
                         and coalesce(p.solved_count,0) = 0),
    'best_streak',   (select coalesce(max((p.streak->>'best')::int),0)
                        from students s join progress p on p.student_id = s.id
                       where s.class_id = p_class)
  ) into v;
  return v;
end $$;

-- ---- one student's record ---------------------------------------------------
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
        select challenge_id, title, level, points, secs, retries, tainted, created_at
        from flag_events where student_id = p_student) f), '[]'::json),
    'cheats', coalesce((select json_agg(row_to_json(x) order by x.created_at desc) from (
        select kind, detail, created_at from cheat_events
        where student_id = p_student limit 200) x), '[]'::json),
    'days', coalesce((select json_agg(day order by day) from activity_days
        where student_id = p_student), '[]'::json)
  ) into v;
  return v;
end $$;

-- ---- per-flag analytics: which challenges are actually hard? ---------------
create or replace function ctf_t_flag_stats(p_class uuid)
returns json language plpgsql security definer set search_path = public as $$
begin
  if not _is_teacher() then return json_build_object('error','not_teacher'); end if;
  return coalesce((select json_agg(row_to_json(t) order by t.solves desc) from (
    select challenge_id,
           max(title) as title,
           max(level)  as level,
           count(*)                                as solves,
           coalesce(sum(retries),0)                as misses,
           round(avg(nullif(secs,-1)))             as avg_secs,
           min(nullif(secs,-1))                    as fast_secs,
           max(secs)                               as slow_secs,
           count(*) filter (where tainted)         as tainted,
           count(*) filter (where retries = 0)     as first_try
    from flag_events
    where class_id = p_class
    group by challenge_id
  ) t), '[]'::json);
end $$;

-- ---- attendance grid --------------------------------------------------------
-- Returns every (handle, day) pair in the window so the client can draw a
-- spreadsheet-style checkmark grid.
create or replace function ctf_t_attendance(p_class uuid, p_days int default 28)
returns json language plpgsql security definer set search_path = public as $$
begin
  if not _is_teacher() then return json_build_object('error','not_teacher'); end if;
  return json_build_object(
    'from', (current_date - greatest(1, least(p_days, 120)) + 1),
    'to',   current_date,
    'students', coalesce((select json_agg(row_to_json(s) order by s.handle) from (
        select id, handle from students where class_id = p_class) s), '[]'::json),
    'marks', coalesce((select json_agg(row_to_json(m)) from (
        select a.student_id, a.day, a.hits
        from activity_days a join students s on s.id = a.student_id
        where s.class_id = p_class
          and a.day > current_date - greatest(1, least(p_days, 120))) m), '[]'::json)
  );
end $$;

do $$
declare f text;
begin
  foreach f in array array[
    'ctf_touch_day(uuid)',
    'ctf_t_class_summary(uuid)',
    'ctf_t_student(uuid)',
    'ctf_t_flag_stats(uuid)',
    'ctf_t_attendance(uuid,int)'
  ] loop
    execute format('revoke all on function %s from public, anon', f);
    execute format('grant execute on function %s to authenticated', f);
  end loop;
end $$;

notify pgrst, 'reload schema';
