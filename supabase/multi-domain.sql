-- ============================================================================
--  MULTI-DOMAIN SIGN-IN  —  @southfayette.org (staff) + @lions.net (students)
--
--  The original _is_school() compared against ONE hardcoded domain, so every
--  student on the second domain was rejected at the join gate with
--  "not_school_account", no matter how Google was configured. This replaces
--  the single domain with a list. Every RPC that calls _is_school() keeps
--  working unchanged.
--
--  Add or remove a domain by editing _school_domains() below and re-running
--  this file. Keep the list tight: any address on a listed domain can join a
--  class, so never add a public mail provider.
--
--  Safe to re-run.
--
--  ⚠ RUN THIS AFTER google-auth.sql, ALWAYS.
--  google-auth.sql defines _is_school() against ONE hardcoded domain. This file
--  replaces it with a list. Because google-auth.sql advertises itself as safe to
--  re-run, re-running it silently reverts _is_school() to the single domain and
--  every @lions.net student is rejected with "not_school_account" while the
--  dashboard still looks perfectly healthy. If you ever re-run google-auth.sql,
--  re-run this file straight afterwards. supabase/check-installed.sql detects it.
-- ============================================================================

-- staff domain first, student domain second; order is not significant
create or replace function _school_domains() returns text[]
language sql immutable as $$ select array['southfayette.org','lions.net']::text[] $$;

-- kept so anything still calling it resolves to the primary (staff) domain
create or replace function _school_domain() returns text
language sql immutable as $$ select 'southfayette.org'::text $$;

create or replace function _is_school() returns boolean
language sql stable set search_path = public as $$
  select exists (
    select 1 from unnest(_school_domains()) d
    where lower(coalesce(_email(),'')) like ('%@' || d)
  );
$$;

-- Which domain is this caller on? Lets the app tell staff from students
-- without hardcoding either domain in the front end.
create or replace function _email_domain() returns text
language sql stable set search_path = public as $$
  select nullif(split_part(lower(coalesce(_email(),'')), '@', 2), '');
$$;

-- Sign-in surface for the front end: is this account allowed, and is it staff?
-- Teacher status still comes from the teachers table (supabase/teachers.sql),
-- never from the domain alone — being on the staff domain does not grant the
-- dashboard.
--
-- Not currently called by the app: auth.js enforces the domain list client-side
-- and the server enforces it inside every RPC via _is_school(), so nothing needs
-- an extra round trip. Kept because it is the one place to ask "what does the
-- server think I am?" when debugging a sign-in problem:
--   select ctf_whoami();   -- run while signed in as the account in question
create or replace function ctf_whoami()
returns json language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then return json_build_object('signed_in', false); end if;
  return json_build_object(
    'signed_in', true,
    'email',     lower(coalesce(_email(),'')),
    'domain',    _email_domain(),
    'school',    _is_school(),
    'staff',     _email_domain() = _school_domain(),
    'teacher',   _is_teacher()
  );
end $$;
revoke all on function ctf_whoami() from public, anon;
grant execute on function ctf_whoami() to authenticated;

notify pgrst, 'reload schema';
