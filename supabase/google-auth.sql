-- ============================================================================
--  GOOGLE SSO MIGRATION  —  run AFTER schema.sql, once, in the SQL editor.
-- ----------------------------------------------------------------------------
--  What changes:
--    * Identity is now a real Google account (Supabase Auth), restricted to
--      the school domain. PINs are gone — Google handles cross-device.
--    * Students still choose an anonymous handle per class; the handle is what
--      appears on the leaderboard and the teacher roster. The teacher can see
--      the real email behind a handle (needed for grading) but students cannot.
--    * The teacher is identified by email, not a shared passcode.
--
--  Supabase dashboard steps (do these too):
--    1. Authentication -> Providers -> Google: enable, paste your Google Cloud
--       OAuth client id + secret.
--    2. In Google Cloud, add your site origin + the Supabase callback URL
--       (https://<project>.supabase.co/auth/v1/callback) as authorized URIs.
--    3. Authentication -> URL Configuration: set Site URL to your GitHub Pages
--       URL and add it to Redirect URLs.
-- ============================================================================

-- ---- who is who -------------------------------------------------------------
create or replace function _email() returns text
language sql stable set search_path = public as $$
  select lower(coalesce(auth.jwt() ->> 'email', ''));
$$;

-- Every student must be signed in with a school Google account.
create or replace function _school_domain() returns text
language sql immutable as $$ select 'southfayette.org'::text $$;

create or replace function _is_school() returns boolean
language sql stable set search_path = public as $$
  select _email() like ('%@' || _school_domain());
$$;

-- The single teacher account.
create or replace function _teacher_email() returns text
language sql immutable as $$ select 'rnreasey@southfayette.org'::text $$;

create or replace function _is_teacher() returns boolean
language sql stable set search_path = public as $$
  select _email() = _teacher_email();
$$;

-- ---- schema tweaks ----------------------------------------------------------
alter table students add column if not exists auth_user_id uuid;
alter table students add column if not exists email text;
alter table students alter column pin_hash drop not null;

-- one enrollment per google account per class
create unique index if not exists students_class_authuser_uniq
  on students (class_id, auth_user_id) where auth_user_id is not null;

-- classes gain an owner so a future second teacher is a small step
alter table classes add column if not exists owner_email text;
update classes set owner_email = _teacher_email() where owner_email is null;

-- ============================================================================
--  STUDENT RPCs  (authenticated role; identity comes from the JWT, never args)
-- ============================================================================

-- Which classes am I already in? Used by the arena to skip the gate entirely.
create or replace function ctf_my_classes()
returns json language plpgsql security definer set search_path = public as $$
begin
  if not _is_school() then return json_build_object('error','not_school_account'); end if;
  return coalesce((select json_agg(row_to_json(t)) from (
    select st.id as student_id, st.handle, c.id as class_id, c.course,
           c.name as class_name, c.code, c.frozen_dates
    from students st join classes c on c.id = st.class_id
    where st.auth_user_id = auth.uid()
  ) t), '[]'::json);
end $$;

-- Join a class by code (or resume if already joined). Handle is chosen by the
-- student and filtered client-side + by _name_ok() here.
create or replace function ctf_join_google(p_code text, p_handle text)
returns json language plpgsql security definer set search_path = public as $$
declare
  v_class classes; v_student students; v_prog progress;
  v_new text := trim(coalesce(p_handle,''));
begin
  if auth.uid() is null then return json_build_object('error','not_signed_in'); end if;
  if not _is_school() then return json_build_object('error','not_school_account'); end if;

  select * into v_class from classes where upper(code) = upper(trim(p_code));
  if not found then return json_build_object('error','class_not_found'); end if;

  -- already enrolled? resume, ignore the submitted handle
  select * into v_student from students
    where class_id = v_class.id and auth_user_id = auth.uid();

  if not found then
    if not _name_ok(v_new) then return json_build_object('error','not_allowed'); end if;
    if exists (select 1 from students where class_id = v_class.id and lower(handle) = lower(v_new)) then
      return json_build_object('error','handle_taken');
    end if;
    insert into students (class_id, handle, auth_user_id, email)
      values (v_class.id, v_new, auth.uid(), _email())
      returning * into v_student;
    insert into progress (student_id, course) values (v_student.id, v_class.course)
      on conflict (student_id) do nothing;
  else
    update students set last_seen = now() where id = v_student.id;
  end if;

  select * into v_prog from progress where student_id = v_student.id;

  return json_build_object(
    'student_id', v_student.id,
    'class_id',   v_class.id,
    'course',     v_class.course,
    'class_name', v_class.name,
    'handle',     v_student.handle,
    'frozen',     v_class.frozen_dates,
    'resumed',    v_prog.student_id is not null,
    'progress',   case when v_prog.student_id is null then null else row_to_json(v_prog) end
  );
end $$;

-- Push progress. No PIN: the row must belong to the caller's google account.
create or replace function ctf_sync_google(
  p_student uuid, p_points int, p_bonus int, p_solved int, p_total int,
  p_state jsonb, p_streak jsonb, p_badges jsonb
) returns json language plpgsql security definer set search_path = public as $$
declare v_student students;
begin
  select * into v_student from students where id = p_student and auth_user_id = auth.uid();
  if not found then return json_build_object('error','not_yours'); end if;

  insert into progress (student_id, course) select v_student.id, c.course from classes c
    where c.id = v_student.class_id on conflict (student_id) do nothing;

  update progress set
    points = p_points, bonus = p_bonus,
    solved_count = p_solved, total_count = p_total,
    state  = coalesce(p_state,'{}'::jsonb),
    streak = coalesce(p_streak,'{}'::jsonb),
    badges = coalesce(p_badges,'{}'::jsonb),
    updated_at = now()
  where student_id = p_student;

  update students set last_seen = now() where id = p_student;
  return json_build_object('ok', true);
end $$;

create or replace function ctf_flag_google(
  p_student uuid, p_key text, p_challenge text, p_title text, p_level text,
  p_points int, p_secs int, p_retries int, p_tainted boolean
) returns json language plpgsql security definer set search_path = public as $$
declare v_student students; v_class classes;
begin
  select * into v_student from students where id = p_student and auth_user_id = auth.uid();
  if not found then return json_build_object('error','not_yours'); end if;
  select * into v_class from classes where id = v_student.class_id;

  insert into flag_events (student_id, class_id, course, handle, flag_key, challenge_id,
                           title, level, points, secs, retries, tainted)
    values (v_student.id, v_student.class_id, v_class.course, v_student.handle,
            left(coalesce(p_key,''),80), left(coalesce(p_challenge,''),80),
            left(coalesce(p_title,''),200), left(coalesce(p_level,''),16),
            coalesce(p_points,0), coalesce(p_secs,-1), coalesce(p_retries,0), coalesce(p_tainted,false))
  on conflict (student_id, flag_key) do nothing;
  return json_build_object('ok', true);
end $$;

create or replace function ctf_cheat_google(p_student uuid, p_kind text, p_detail text)
returns json language plpgsql security definer set search_path = public as $$
declare v_student students; v_class classes;
begin
  select * into v_student from students where id = p_student and auth_user_id = auth.uid();
  if not found then return json_build_object('error','not_yours'); end if;
  select * into v_class from classes where id = v_student.class_id;
  insert into cheat_events (student_id, class_id, course, handle, kind, detail)
    values (v_student.id, v_student.class_id, v_class.course, v_student.handle,
            left(coalesce(p_kind,''),32), left(coalesce(p_detail,''),400));
  return json_build_object('ok', true);
end $$;

create or replace function ctf_rename_google(p_student uuid, p_handle text)
returns json language plpgsql security definer set search_path = public as $$
declare v_student students; v_new text := trim(coalesce(p_handle,''));
begin
  select * into v_student from students where id = p_student and auth_user_id = auth.uid();
  if not found then return json_build_object('error','not_yours'); end if;
  if not _name_ok(v_new) then return json_build_object('error','not_allowed'); end if;
  if exists (select 1 from students where class_id = v_student.class_id
               and lower(handle) = lower(v_new) and id <> p_student) then
    return json_build_object('error','handle_taken');
  end if;
  update students set handle = v_new where id = p_student;
  update flag_events  set handle = v_new where student_id = p_student;
  update cheat_events set handle = v_new where student_id = p_student;
  return json_build_object('ok', true, 'handle', v_new);
end $$;

-- Leaderboard: signed-in students only, and only for a class they belong to.
create or replace function ctf_leaderboard_google(p_class uuid)
returns json language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from students where class_id = p_class and auth_user_id = auth.uid())
    then return json_build_object('error','not_yours'); end if;
  return coalesce((select json_agg(row_to_json(t)) from (
    select row_number() over (order by (coalesce(pr.points,0)+coalesce(pr.bonus,0)) desc,
                                       pr.updated_at asc) as pos,
           st.handle
    from students st join progress pr on pr.student_id = st.id
    where st.class_id = p_class and (coalesce(pr.points,0)+coalesce(pr.bonus,0)) > 0
    order by (coalesce(pr.points,0)+coalesce(pr.bonus,0)) desc, pr.updated_at asc
    limit 5
  ) t), '[]'::json);
end $$;

-- ============================================================================
--  TEACHER RPCs  (email-gated — no shared passcode)
-- ============================================================================
create or replace function ctf_t_classes()
returns json language plpgsql security definer set search_path = public as $$
begin
  if not _is_teacher() then return json_build_object('error','not_teacher'); end if;
  return coalesce((select json_agg(row_to_json(t) order by t.course, t.name) from (
    select c.id, c.course, c.name, c.code, c.frozen_dates, c.created_at,
           (select count(*) from students s where s.class_id = c.id) as student_count
    from classes c
  ) t), '[]'::json);
end $$;

create or replace function ctf_t_create_class(p_course text, p_name text, p_code text)
returns json language plpgsql security definer set search_path = public as $$
declare v_class classes;
begin
  if not _is_teacher() then return json_build_object('error','not_teacher'); end if;
  if coalesce(trim(p_name),'') = '' then return json_build_object('error','empty_name'); end if;
  if exists (select 1 from classes where upper(code) = upper(trim(p_code)))
    then return json_build_object('error','code_taken'); end if;
  insert into classes (course, name, code, owner_email)
    values (p_course, trim(p_name), upper(trim(p_code)), _email())
    returning * into v_class;
  return json_build_object('id', v_class.id, 'course', v_class.course, 'name', v_class.name,
                           'code', v_class.code, 'frozen_dates', v_class.frozen_dates,
                           'student_count', 0);
end $$;

create or replace function ctf_t_delete_class(p_class uuid)
returns json language plpgsql security definer set search_path = public as $$
begin
  if not _is_teacher() then return json_build_object('error','not_teacher'); end if;
  delete from classes where id = p_class;
  return json_build_object('ok', true);
end $$;

-- roster now includes the google email so the teacher can match handle -> student
create or replace function ctf_t_roster(p_class uuid)
returns json language plpgsql security definer set search_path = public as $$
begin
  if not _is_teacher() then return json_build_object('error','not_teacher'); end if;
  return coalesce((select json_agg(row_to_json(t) order by t.points desc) from (
    select s.id, s.handle, s.email, s.created_at, s.last_seen,
           coalesce(p.points,0) as points, coalesce(p.bonus,0) as bonus,
           coalesce(p.solved_count,0) as solved_count, coalesce(p.total_count,0) as total_count,
           coalesce(p.streak,'{}'::jsonb) as streak, coalesce(p.badges,'{}'::jsonb) as badges,
           p.updated_at,
           (select count(*) from cheat_events ce where ce.student_id = s.id) as cheat_count
    from students s left join progress p on p.student_id = s.id
    where s.class_id = p_class
  ) t), '[]'::json);
end $$;

create or replace function ctf_t_flags(p_class uuid, p_limit int default 500)
returns json language plpgsql security definer set search_path = public as $$
begin
  if not _is_teacher() then return json_build_object('error','not_teacher'); end if;
  return coalesce((select json_agg(row_to_json(t)) from (
    select handle, challenge_id, title, level, points, secs, retries, tainted, created_at
    from flag_events where class_id = p_class
    order by created_at desc limit greatest(1, least(p_limit, 2000))
  ) t), '[]'::json);
end $$;

create or replace function ctf_t_cheats(p_class uuid, p_limit int default 500)
returns json language plpgsql security definer set search_path = public as $$
begin
  if not _is_teacher() then return json_build_object('error','not_teacher'); end if;
  return coalesce((select json_agg(row_to_json(t)) from (
    select handle, kind, detail, created_at from cheat_events
    where class_id = p_class order by created_at desc limit greatest(1, least(p_limit, 2000))
  ) t), '[]'::json);
end $$;

create or replace function ctf_t_freeze(p_class uuid, p_dates date[])
returns json language plpgsql security definer set search_path = public as $$
begin
  if not _is_teacher() then return json_build_object('error','not_teacher'); end if;
  update classes set frozen_dates = coalesce(p_dates,'{}') where id = p_class;
  return json_build_object('ok', true);
end $$;

create or replace function ctf_t_set_handle(p_student uuid, p_handle text)
returns json language plpgsql security definer set search_path = public as $$
declare v_student students; v_new text := trim(coalesce(p_handle,''));
begin
  if not _is_teacher() then return json_build_object('error','not_teacher'); end if;
  select * into v_student from students where id = p_student;
  if not found then return json_build_object('error','no_student'); end if;
  if length(v_new) < 3 or length(v_new) > 18 or v_new !~ '^[A-Za-z0-9 ._-]+$'
    then return json_build_object('error','bad_name'); end if;
  if exists (select 1 from students where class_id = v_student.class_id
               and lower(handle) = lower(v_new) and id <> p_student) then
    return json_build_object('error','handle_taken');
  end if;
  update students set handle = v_new where id = p_student;
  update flag_events  set handle = v_new where student_id = p_student;
  update cheat_events set handle = v_new where student_id = p_student;
  return json_build_object('ok', true, 'handle', v_new);
end $$;

create or replace function ctf_t_remove_student(p_student uuid)
returns json language plpgsql security definer set search_path = public as $$
begin
  if not _is_teacher() then return json_build_object('error','not_teacher'); end if;
  delete from students where id = p_student;
  return json_build_object('ok', true);
end $$;

-- ---- grants: signed-in users only. The anon role gets nothing new. ---------
do $$
declare f text;
begin
  foreach f in array array[
    'ctf_my_classes()',
    'ctf_join_google(text,text)',
    'ctf_sync_google(uuid,int,int,int,int,jsonb,jsonb,jsonb)',
    'ctf_flag_google(uuid,text,text,text,text,int,int,int,boolean)',
    'ctf_cheat_google(uuid,text,text)',
    'ctf_rename_google(uuid,text)',
    'ctf_leaderboard_google(uuid)',
    'ctf_t_classes()',
    'ctf_t_create_class(text,text,text)',
    'ctf_t_delete_class(uuid)',
    'ctf_t_roster(uuid)',
    'ctf_t_flags(uuid,int)',
    'ctf_t_cheats(uuid,int)',
    'ctf_t_freeze(uuid,date[])',
    'ctf_t_set_handle(uuid,text)',
    'ctf_t_remove_student(uuid)'
  ] loop
    execute format('revoke all on function %s from public, anon', f);
    execute format('grant execute on function %s to authenticated', f);
  end loop;
end $$;

-- ---- retire the passcode-era student RPCs ----------------------------------
-- (kept as a comment: uncomment once every student has signed in with Google)
-- drop function if exists ctf_join(text,text,text);
-- drop function if exists ctf_sync(uuid,text,int,int,int,int,jsonb,jsonb,jsonb);
-- drop function if exists ctf_cheat(uuid,text,text);
-- drop function if exists ctf_flag(uuid,text,text,text,text,text,int,int,int,boolean);
-- drop function if exists ctf_rename(uuid,text,text);
-- drop function if exists ctf_leaderboard(uuid);
