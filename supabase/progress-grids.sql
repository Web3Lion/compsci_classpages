-- ============================================================================
--  PROGRESS GRIDS  —  private daily self-monitoring (replaces the shared
--  "Grid Progress Monitoring Sheet").
--
--  The teacher creates a grid for a class (tasks like 1A, 1B ... each with a
--  short title, plus an optional due date). Each student sets a status per
--  task (Working / Have Question / Stuck / Need Help / Need Check / Done) with
--  an optional note, from their profile page, and checks in once per class day.
--
--  Confidentiality: the tables have RLS on and NO policies. Students reach
--  them only through RPCs that check the row belongs to their Google account,
--  so a student can only ever read or change their own row. Only a teacher
--  (_is_teacher()) can read the whole class.
--
--  Run AFTER schema.sql, google-auth.sql, teachers.sql, roster-csv.sql.
--  Safe to re-run.
-- ============================================================================

create table if not exists progress_grids (
  id          uuid primary key default gen_random_uuid(),
  class_id    uuid not null references classes(id) on delete cascade,
  title       text not null,
  tasks       jsonb not null default '[]'::jsonb,   -- [{"code":"1A","title":"..."}]
  due_at      timestamptz,
  is_open     boolean not null default true,
  created_by  text not null default '',
  created_at  timestamptz not null default now()
);
create index if not exists progress_grids_class on progress_grids (class_id, created_at desc);

create table if not exists progress_entries (
  grid_id     uuid not null references progress_grids(id) on delete cascade,
  student_id  uuid not null references students(id) on delete cascade,
  task_code   text not null,
  status      text not null check (status in ('working','question','stuck','check','done')),
  note        text not null default '',
  updated_by  text not null default 'student',
  updated_at  timestamptz not null default now(),
  primary key (grid_id, student_id, task_code)
);

create table if not exists progress_log (
  id          bigserial primary key,
  grid_id     uuid not null references progress_grids(id) on delete cascade,
  student_id  uuid not null references students(id) on delete cascade,
  task_code   text not null,
  status      text,
  note        text not null default '',
  by_who      text not null default 'student',
  at          timestamptz not null default now()
);
create index if not exists progress_log_grid on progress_log (grid_id, at desc);

create table if not exists progress_checkins (
  grid_id     uuid not null references progress_grids(id) on delete cascade,
  student_id  uuid not null references students(id) on delete cascade,
  day         date not null,
  at          timestamptz not null default now(),
  primary key (grid_id, student_id, day)
);

alter table progress_grids    enable row level security;
alter table progress_entries  enable row level security;
alter table progress_log      enable row level security;
alter table progress_checkins enable row level security;
-- no policies on purpose: only the security-definer functions below touch them

create or replace function _pg_today() returns date
language sql stable as $$ select (now() at time zone 'America/New_York')::date $$;

create or replace function _pg_tasks(p jsonb) returns jsonb
language sql immutable as $$
  select coalesce(jsonb_agg(jsonb_build_object('code', c, 'title', t) order by ord), '[]'::jsonb) from (
    select distinct on (upper(trim(x->>'code'))) upper(left(trim(x->>'code'),12)) as c,
           left(trim(coalesce(x->>'title','')),120) as t, ord
      from jsonb_array_elements(coalesce(p,'[]'::jsonb)) with ordinality e(x, ord)
     where trim(coalesce(x->>'code','')) <> ''
     order by upper(trim(x->>'code')), ord
  ) s
$$;

-- ============================================================================
--  STUDENT RPCs  (own row only)
-- ============================================================================
create or replace function pg_my_grids(p_student uuid)
returns json language plpgsql security definer set search_path = public as $$
declare st students;
begin
  select * into st from students where id = p_student and auth_user_id = auth.uid();
  if not found then return json_build_object('error','not_yours'); end if;
  return coalesce((select json_agg(row_to_json(t) order by t.created_at desc) from (
    select g.id, g.title, g.tasks, g.due_at, g.is_open, g.created_at,
           exists (select 1 from progress_checkins c where c.grid_id = g.id and c.student_id = st.id and c.day = _pg_today()) as checked_in_today,
           coalesce((select json_object_agg(e.task_code, json_build_object('status', e.status, 'note', e.note, 'updated_at', e.updated_at, 'by', e.updated_by))
                       from progress_entries e where e.grid_id = g.id and e.student_id = st.id), '{}'::json) as entries,
           coalesce((select json_agg(row_to_json(l) order by l.at desc) from (
              select task_code, status, note, by_who, at from progress_log
               where grid_id = g.id and student_id = st.id order by at desc limit 40) l), '[]'::json) as log,
           coalesce((select json_agg(day order by day desc) from (
              select day from progress_checkins where grid_id = g.id and student_id = st.id order by day desc limit 30) d), '[]'::json) as checkins
      from progress_grids g
     where g.class_id = st.class_id
       and (g.is_open or exists (select 1 from progress_entries e where e.grid_id = g.id and e.student_id = st.id))
  ) t), '[]'::json);
end $$;

create or replace function pg_set(p_student uuid, p_grid uuid, p_task text, p_status text, p_note text)
returns json language plpgsql security definer set search_path = public as $$
declare st students; g progress_grids; v_task text := upper(trim(coalesce(p_task,'')));
        v_note text := left(trim(coalesce(p_note,'')), 500);
begin
  select * into st from students where id = p_student and auth_user_id = auth.uid();
  if not found then return json_build_object('error','not_yours'); end if;
  select * into g from progress_grids where id = p_grid and class_id = st.class_id;
  if not found then return json_build_object('error','no_grid'); end if;
  if not g.is_open then return json_build_object('error','closed'); end if;
  if not exists (select 1 from jsonb_array_elements(g.tasks) x where upper(x->>'code') = v_task)
    then return json_build_object('error','no_task'); end if;
  if coalesce(p_status,'') = '' then
    delete from progress_entries where grid_id = g.id and student_id = st.id and task_code = v_task;
  else
    if p_status not in ('working','question','stuck','check','done') then return json_build_object('error','bad_status'); end if;
    insert into progress_entries (grid_id, student_id, task_code, status, note, updated_by, updated_at)
      values (g.id, st.id, v_task, p_status, v_note, 'student', now())
    on conflict (grid_id, student_id, task_code) do update
      set status = excluded.status, note = excluded.note, updated_by = 'student', updated_at = now();
  end if;
  insert into progress_log (grid_id, student_id, task_code, status, note, by_who)
    values (g.id, st.id, v_task, nullif(p_status,''), v_note, 'student');
  insert into progress_checkins (grid_id, student_id, day) values (g.id, st.id, _pg_today())
    on conflict do nothing;
  return json_build_object('ok', true);
end $$;

-- "Nothing changed today" check-in
create or replace function pg_checkin(p_student uuid, p_grid uuid)
returns json language plpgsql security definer set search_path = public as $$
declare st students; g progress_grids;
begin
  select * into st from students where id = p_student and auth_user_id = auth.uid();
  if not found then return json_build_object('error','not_yours'); end if;
  select * into g from progress_grids where id = p_grid and class_id = st.class_id;
  if not found then return json_build_object('error','no_grid'); end if;
  insert into progress_checkins (grid_id, student_id, day) values (g.id, st.id, _pg_today())
    on conflict do nothing;
  return json_build_object('ok', true);
end $$;

-- ============================================================================
--  TEACHER RPCs
-- ============================================================================
create or replace function pg_t_list(p_class uuid)
returns json language plpgsql security definer set search_path = public as $$
begin
  if not _is_teacher() then return json_build_object('error','not_teacher'); end if;
  return coalesce((select json_agg(row_to_json(t) order by t.created_at desc) from (
    select g.id, g.title, g.tasks, g.due_at, g.is_open, g.created_at,
           (select count(*) from students s where s.class_id = g.class_id)::int as students,
           (select count(*) from progress_checkins c where c.grid_id = g.id and c.day = _pg_today())::int as checked_today,
           (select count(*) from progress_entries e where e.grid_id = g.id and e.status = 'stuck')::int as stuck,
           (select count(*) from progress_entries e where e.grid_id = g.id and e.status = 'question')::int as question,
           (select count(*) from progress_entries e where e.grid_id = g.id and e.status = 'check')::int as need_check
      from progress_grids g where g.class_id = p_class
  ) t), '[]'::json);
end $$;

create or replace function pg_t_save(p_id uuid, p_class uuid, p_title text, p_tasks jsonb, p_due timestamptz, p_open boolean)
returns json language plpgsql security definer set search_path = public as $$
declare v_id uuid; v_tasks jsonb := _pg_tasks(p_tasks);
begin
  if not _is_teacher() then return json_build_object('error','not_teacher'); end if;
  if coalesce(trim(p_title),'') = '' then return json_build_object('error','empty_title'); end if;
  if jsonb_array_length(v_tasks) = 0 then return json_build_object('error','no_tasks'); end if;
  if p_id is null then
    insert into progress_grids (class_id, title, tasks, due_at, is_open, created_by)
      values (p_class, left(trim(p_title),120), v_tasks, p_due, coalesce(p_open,true), coalesce(_email(),''))
      returning id into v_id;
  else
    update progress_grids set title = left(trim(p_title),120), tasks = v_tasks, due_at = p_due,
      is_open = coalesce(p_open, is_open) where id = p_id returning id into v_id;
    if v_id is null then return json_build_object('error','no_grid'); end if;
  end if;
  return json_build_object('ok', true, 'id', v_id);
end $$;

create or replace function pg_t_delete(p_id uuid)
returns json language plpgsql security definer set search_path = public as $$
begin
  if not _is_teacher() then return json_build_object('error','not_teacher'); end if;
  delete from progress_grids where id = p_id;
  return json_build_object('ok', true);
end $$;

-- Whole-class grid: every student, their entries, today's check-in, and the log
create or replace function pg_t_grid(p_grid uuid, p_days int default 30)
returns json language plpgsql security definer set search_path = public as $$
declare g progress_grids;
begin
  if not _is_teacher() then return json_build_object('error','not_teacher'); end if;
  select * into g from progress_grids where id = p_grid;
  if not found then return json_build_object('error','no_grid'); end if;
  return json_build_object(
    'today', _pg_today(),
    'students', coalesce((select json_agg(row_to_json(t) order by lower(t.name)) from (
      select s.id as student_id, s.handle, s.email,
             coalesce(nullif(re.full_name,''), s.email, s.handle) as name,
             exists (select 1 from progress_checkins c where c.grid_id = g.id and c.student_id = s.id and c.day = _pg_today()) as checked_in_today,
             (select max(day) from progress_checkins c where c.grid_id = g.id and c.student_id = s.id) as last_checkin,
             coalesce((select json_object_agg(e.task_code, json_build_object('status', e.status, 'note', e.note, 'updated_at', e.updated_at, 'by', e.updated_by))
                         from progress_entries e where e.grid_id = g.id and e.student_id = s.id), '{}'::json) as entries
        from students s
        left join roster_entries re on re.class_id = s.class_id and re.email = lower(coalesce(s.email,''))
       where s.class_id = g.class_id
    ) t), '[]'::json),
    'log', coalesce((select json_agg(row_to_json(l) order by l.at desc) from (
      select student_id, task_code, status, note, by_who, at,
             (at at time zone 'America/New_York')::date as day
        from progress_log where grid_id = g.id and at >= now() - make_interval(days => greatest(coalesce(p_days,30),1))
       order by at desc limit 3000
    ) l), '[]'::json),
    'checkins', coalesce((select json_agg(json_build_object('student_id', student_id, 'day', day))
      from progress_checkins where grid_id = g.id and day >= _pg_today() - greatest(coalesce(p_days,30),1)), '[]'::json)
  );
end $$;

-- Teacher sets (or clears) a student's status, e.g. Done after checking
create or replace function pg_t_set(p_grid uuid, p_student uuid, p_task text, p_status text, p_note text)
returns json language plpgsql security definer set search_path = public as $$
declare v_task text := upper(trim(coalesce(p_task,''))); v_note text := left(trim(coalesce(p_note,'')), 500);
begin
  if not _is_teacher() then return json_build_object('error','not_teacher'); end if;
  if not exists (select 1 from progress_grids g join students s on s.class_id = g.class_id
                  where g.id = p_grid and s.id = p_student) then return json_build_object('error','no_grid'); end if;
  if coalesce(p_status,'') = '' then
    delete from progress_entries where grid_id = p_grid and student_id = p_student and task_code = v_task;
  else
    if p_status not in ('working','question','stuck','check','done') then return json_build_object('error','bad_status'); end if;
    insert into progress_entries (grid_id, student_id, task_code, status, note, updated_by, updated_at)
      values (p_grid, p_student, v_task, p_status, v_note, 'teacher', now())
    on conflict (grid_id, student_id, task_code) do update
      set status = excluded.status, note = excluded.note, updated_by = 'teacher', updated_at = now();
  end if;
  insert into progress_log (grid_id, student_id, task_code, status, note, by_who)
    values (p_grid, p_student, v_task, nullif(p_status,''), v_note, 'teacher');
  return json_build_object('ok', true);
end $$;

-- Copy a grid (title, tasks, due date) to other classes, e.g. other periods.
create or replace function pg_t_copy(p_grid uuid, p_classes uuid[])
returns json language plpgsql security definer set search_path = public as $$
declare n int;
begin
  if not _is_teacher() then return json_build_object('error','not_teacher'); end if;
  insert into progress_grids (class_id, title, tasks, due_at, is_open, created_by)
  select c.id, g.title, g.tasks, g.due_at, g.is_open, coalesce(_email(),'')
    from progress_grids g join classes c on c.id = any(coalesce(p_classes,'{}'::uuid[]))
   where g.id = p_grid and c.id <> g.class_id;
  get diagnostics n = row_count;
  return json_build_object('ok', true, 'copied', n);
end $$;
revoke all on function pg_t_copy(uuid, uuid[]) from public, anon;
grant execute on function pg_t_copy(uuid, uuid[]) to authenticated;

revoke all on function pg_my_grids(uuid) from public, anon;
revoke all on function pg_set(uuid, uuid, text, text, text) from public, anon;
revoke all on function pg_checkin(uuid, uuid) from public, anon;
revoke all on function pg_t_list(uuid) from public, anon;
revoke all on function pg_t_save(uuid, uuid, text, jsonb, timestamptz, boolean) from public, anon;
revoke all on function pg_t_delete(uuid) from public, anon;
revoke all on function pg_t_grid(uuid, int) from public, anon;
revoke all on function pg_t_set(uuid, uuid, text, text, text) from public, anon;
grant execute on function pg_my_grids(uuid) to authenticated;
grant execute on function pg_set(uuid, uuid, text, text, text) to authenticated;
grant execute on function pg_checkin(uuid, uuid) to authenticated;
grant execute on function pg_t_list(uuid) to authenticated;
grant execute on function pg_t_save(uuid, uuid, text, jsonb, timestamptz, boolean) to authenticated;
grant execute on function pg_t_delete(uuid) to authenticated;
grant execute on function pg_t_grid(uuid, int) to authenticated;
grant execute on function pg_t_set(uuid, uuid, text, text, text) to authenticated;

notify pgrst, 'reload schema';
