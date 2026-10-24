-- © 2026 Robert Reasey, South Fayette School District. Licensed CC BY-NC 4.0 (attribution required, no commercial use). See LICENSE.md.
-- ============================================================================
--  DATA RETENTION (v33.1)  —  run AFTER signin-log.sql and attempt-log.sql,
--  BEFORE lockdown.sql. Safe to re-run.
--
--  Data that no longer exists can't leak. After 30 days:
--    • signin_rejects rows are deleted (emails of accounts that were turned away).
--    • attempt_events.guess is blanked (the text a student typed). The attempt
--      row itself stays, so wrong-try counts and timing in teacher reports
--      don't change.
--
--  It runs by itself: every insert into those two tables has a 2% chance of
--  running the cleanup (a few times a day in a normal school week), and the
--  weekly GitHub Action calls cron_purge_old_data() too.
--  The teacher can also run it now: select cron_purge_old_data(); in the SQL Editor.
-- ============================================================================

create or replace function _purge_old_data() returns json
language plpgsql security definer set search_path = public as $$
declare a int := 0; b int := 0; c int := 0;
begin
  if to_regclass('public.signin_rejects') is not null then
    delete from signin_rejects where last_at < now() - interval '30 days';
    get diagnostics a = row_count;
  end if;
  if to_regclass('public.attempt_events') is not null then
    update attempt_events set guess = null where guess is not null and created_at < now() - interval '30 days';
    get diagnostics b = row_count;
  end if;
  -- 33.2: assigned vocab quiz attempts (names, answers, scores) 30 days after they were taken
  if to_regclass('public.vocab_quiz_attempts') is not null then
    delete from vocab_quiz_attempts where coalesce(submitted_at, started_at) < now() - interval '30 days';
    get diagnostics c = row_count;
  end if;
  return json_build_object('ok', true, 'rejects_deleted', a, 'guesses_blanked', b, 'quiz_attempts_deleted', c);
end $$;
revoke all on function _purge_old_data() from public, anon, authenticated;

create or replace function _purge_tick() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if random() < 0.02 then perform _purge_old_data(); end if;
  return null;
end $$;
revoke all on function _purge_tick() from public, anon, authenticated;

do $$
begin
  if to_regclass('public.signin_rejects') is not null then
    execute 'drop trigger if exists purge_tick on signin_rejects';
    execute 'create trigger purge_tick after insert on signin_rejects for each statement execute function _purge_tick()';
  end if;
  if to_regclass('public.attempt_events') is not null then
    execute 'drop trigger if exists purge_tick on attempt_events';
    execute 'create trigger purge_tick after insert on attempt_events for each statement execute function _purge_tick()';
  end if;
end $$;

-- weekly GitHub Action (service-role key only, like cron_snapshot_all_classes)
create or replace function cron_purge_old_data() returns json
language sql security definer set search_path = public as $$ select _purge_old_data(); $$;
revoke all on function cron_purge_old_data() from public, anon, authenticated;
grant execute on function cron_purge_old_data() to service_role;

select _purge_old_data();   -- clear anything already past 30 days
