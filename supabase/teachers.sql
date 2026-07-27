-- ============================================================================
--  TEACHER ACCOUNTS  —  more than one teacher.
--
--  Until now _is_teacher() compared the caller's email to a single hard-coded
--  address. This replaces that with a table, WITHOUT changing any of the ~40
--  RPCs that call _is_teacher(): they all keep working and simply start
--  answering "yes" for the additional accounts.
--
--  WHY A SEPARATE TABLE AND NOT A CHECKBOX ON THE ROSTER
--  A student belongs to one class. A teacher does not — teacher access is
--  school-wide, and every teacher RPC is class-agnostic. Putting teachers in a
--  class roster would imply the person only has access to that class, which is
--  not what the permission actually does, and would mix them into student
--  counts, leaderboards, and squads. So teachers live in their own small
--  table, managed from Settings.
--
--  THE OWNER IS PERMANENT
--  _teacher_email() (rnreasey@southfayette.org) is always a teacher, is always
--  an owner, and cannot be demoted or removed by anyone — including itself.
--  That guarantees the dashboard can never be locked out.
--
--  TWO ROLES
--    owner  — everything, including adding and removing other teachers
--    staff  — every teaching function: classes, rosters, gates, analytics,
--             the answer key. Cannot manage teacher accounts.
--
--  Safe to re-run.
--
--  ⚠ RUN THIS AFTER google-auth.sql, ALWAYS.
--  google-auth.sql pins _is_teacher() to a single email address. This file makes
--  it read the teachers table. Because google-auth.sql advertises itself as safe
--  to re-run, re-running it silently reverts _is_teacher() and every teacher you
--  added here loses dashboard access with no visible error. If you ever re-run
--  google-auth.sql, re-run this file straight afterwards.
--  supabase/check-installed.sql detects it.
-- ============================================================================

create table if not exists teachers (
  email      text primary key,
  role       text not null default 'staff' check (role in ('owner','staff')),
  full_name  text not null default '',
  note       text not null default '',
  added_by   text not null default '',
  created_at timestamptz not null default now(),
  last_seen  timestamptz
);
alter table teachers enable row level security;   -- no policies: sealed

-- the founding account, always present, always owner
insert into teachers (email, role, full_name, added_by)
  values (lower(_teacher_email()), 'owner', 'Course owner', 'system')
on conflict (email) do update set role = 'owner';

-- ---- the permission check, now table-driven ---------------------------------
create or replace function _is_teacher() returns boolean
language sql stable security definer set search_path = public as $$
  select auth.uid() is not null
     and (
       lower(coalesce(_email(),'')) = lower(_teacher_email())
       or exists (select 1 from teachers t
                  where t.email = lower(coalesce(_email(),'')))
     );
$$;

create or replace function _is_owner() returns boolean
language sql stable security definer set search_path = public as $$
  select auth.uid() is not null
     and (
       lower(coalesce(_email(),'')) = lower(_teacher_email())
       or exists (select 1 from teachers t
                  where t.email = lower(coalesce(_email(),'')) and t.role = 'owner')
     );
$$;

-- ---- who am I? --------------------------------------------------------------
-- The dashboard calls this on load so it can hide owner-only controls from a
-- staff teacher rather than letting them click something that will fail.
create or replace function ctf_t_whoami()
returns json language plpgsql security definer set search_path = public as $$
declare v_email text := lower(coalesce(_email(),''));
begin
  if not _is_teacher() then return json_build_object('teacher', false); end if;
  update teachers set last_seen = now() where email = v_email;
  return json_build_object(
    'teacher', true,
    'owner',   _is_owner(),
    'email',   v_email,
    'founder', v_email = lower(_teacher_email())
  );
end $$;
revoke all on function ctf_t_whoami() from public, anon;
grant execute on function ctf_t_whoami() to authenticated;

-- ---- list -------------------------------------------------------------------
create or replace function ctf_t_teachers()
returns json language plpgsql security definer set search_path = public as $$
begin
  if not _is_teacher() then return json_build_object('error','not_teacher'); end if;
  return coalesce((
    select json_agg(row_to_json(t) order by (t.role <> 'owner'), lower(t.email))
    from (
      select email, role, full_name, note, added_by, created_at, last_seen,
             (email = lower(_teacher_email())) as founder
      from teachers
    ) t
  ), '[]'::json);
end $$;
revoke all on function ctf_t_teachers() from public, anon;
grant execute on function ctf_t_teachers() to authenticated;

-- ---- add / update -----------------------------------------------------------
-- Owner only. The email must look like an address; it is lowercased so the
-- permission check can never miss on capitalisation. Adding an account here
-- does NOT create a login — the person signs in with their own Google account
-- and is recognised on arrival.
create or replace function ctf_t_teacher_save(
  p_email text, p_role text default 'staff',
  p_name text default '', p_note text default ''
) returns json language plpgsql security definer set search_path = public as $$
declare v_email text := lower(trim(coalesce(p_email,'')));
        v_role  text := lower(coalesce(p_role,'staff'));
begin
  if not _is_owner() then return json_build_object('error','not_owner'); end if;
  if v_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
    return json_build_object('error','bad_email');
  end if;
  if v_role not in ('owner','staff') then v_role := 'staff'; end if;

  -- the founding account can never be demoted
  if v_email = lower(_teacher_email()) then v_role := 'owner'; end if;

  insert into teachers (email, role, full_name, note, added_by)
    values (v_email, v_role, left(trim(coalesce(p_name,'')),120),
            left(trim(coalesce(p_note,'')),160), lower(coalesce(_email(),'')))
  on conflict (email) do update
    set role      = excluded.role,
        full_name = case when excluded.full_name <> '' then excluded.full_name else teachers.full_name end,
        note      = case when excluded.note      <> '' then excluded.note      else teachers.note      end;

  return json_build_object('ok', true, 'email', v_email, 'role', v_role);
end $$;
revoke all on function ctf_t_teacher_save(text, text, text, text) from public, anon;
grant execute on function ctf_t_teacher_save(text, text, text, text) to authenticated;

-- ---- remove -----------------------------------------------------------------
-- Owner only. Refuses to remove the founding account, and refuses to remove
-- the last remaining owner, so the dashboard can never be orphaned.
create or replace function ctf_t_teacher_remove(p_email text)
returns json language plpgsql security definer set search_path = public as $$
declare v_email text := lower(trim(coalesce(p_email,''))); v_owners int;
begin
  if not _is_owner() then return json_build_object('error','not_owner'); end if;
  if v_email = lower(_teacher_email()) then
    return json_build_object('error','founder');
  end if;

  select count(*) into v_owners from teachers where role = 'owner';
  if v_owners <= 1 and exists (select 1 from teachers where email = v_email and role = 'owner') then
    return json_build_object('error','last_owner');
  end if;

  delete from teachers where email = v_email;
  return json_build_object('ok', true);
end $$;
revoke all on function ctf_t_teacher_remove(text) from public, anon;
grant execute on function ctf_t_teacher_remove(text) to authenticated;

notify pgrst, 'reload schema';
