-- ============================================================================
--  NO NAMES (v36)  —  the database keeps school emails only, never real names.
--
--  Blanks every stored name and forces the name columns to '' on any future
--  insert/update, so no function (old or new) can save one:
--    roster_entries.full_name      (roster CSV import)
--    teachers.full_name            (Settings → Teachers)
--    vocab_quiz_attempts.student_name  (was copied from the Google account)
--    auth.users.raw_user_meta_data / auth.identities.identity_data
--                                  (Supabase Auth copies the Google name + photo here
--                                  on every sign-in; the keys are stripped)
--  Students table never stored names. Everything that showed a name now falls
--  back to the email. Run after vocab-quizzes.sql, before lockdown.sql. Safe to re-run.
-- ============================================================================

update roster_entries      set full_name    = '' where full_name    <> '';
update teachers            set full_name    = '' where full_name    <> '';
update vocab_quiz_attempts set student_name = '' where student_name <> '';

create or replace function _blank_full_name() returns trigger
language plpgsql as $fn$
begin
  new.full_name := '';
  return new;
end $fn$;

create or replace function _blank_student_name() returns trigger
language plpgsql as $fn$
begin
  new.student_name := '';
  return new;
end $fn$;

drop trigger if exists no_names on roster_entries;
create trigger no_names before insert or update on roster_entries
  for each row execute function _blank_full_name();

drop trigger if exists no_names on teachers;
create trigger no_names before insert or update on teachers
  for each row execute function _blank_full_name();

drop trigger if exists no_names on vocab_quiz_attempts;
create trigger no_names before insert or update on vocab_quiz_attempts
  for each row execute function _blank_student_name();

-- the Google account name is no longer read at all
create or replace function _vq_jwt_name() returns text
language sql stable as $fn$ select ''::text $fn$;

revoke all on function _blank_full_name() from public, anon, authenticated;
revoke all on function _blank_student_name() from public, anon, authenticated;
revoke all on function _vq_jwt_name() from public, anon, authenticated;

-- ---- Supabase Auth: strip the Google name + photo it copies on every sign-in ----
create or replace function _strip_name_keys(j jsonb) returns jsonb
language sql immutable as $fn$
  select coalesce(j, '{}'::jsonb) - array['full_name','name','given_name','family_name','nickname','picture','avatar_url','preferred_username']
$fn$;

create or replace function _strip_auth_user_names() returns trigger
language plpgsql security definer set search_path = public as $fn$
begin
  new.raw_user_meta_data := _strip_name_keys(new.raw_user_meta_data);
  return new;
end $fn$;

create or replace function _strip_auth_identity_names() returns trigger
language plpgsql security definer set search_path = public as $fn$
begin
  new.identity_data := _strip_name_keys(new.identity_data);
  return new;
end $fn$;

update auth.users      set raw_user_meta_data = _strip_name_keys(raw_user_meta_data)
 where raw_user_meta_data ?| array['full_name','name','given_name','family_name','nickname','picture','avatar_url','preferred_username'];
update auth.identities set identity_data = _strip_name_keys(identity_data)
 where identity_data ?| array['full_name','name','given_name','family_name','nickname','picture','avatar_url','preferred_username'];

drop trigger if exists no_names on auth.users;
create trigger no_names before insert or update of raw_user_meta_data on auth.users
  for each row execute function _strip_auth_user_names();
drop trigger if exists no_names on auth.identities;
create trigger no_names before insert or update of identity_data on auth.identities
  for each row execute function _strip_auth_identity_names();

revoke all on function _strip_name_keys(jsonb) from public, anon, authenticated;
revoke all on function _strip_auth_user_names() from public, anon, authenticated;
revoke all on function _strip_auth_identity_names() from public, anon, authenticated;
