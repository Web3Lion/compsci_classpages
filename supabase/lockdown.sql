-- © 2026 Robert Reasey, South Fayette School District. Licensed CC BY-NC 4.0 (attribution required, no commercial use). See LICENSE.md.
-- ============================================================================
--  LOCKDOWN (v33.0)  —  run LAST, and re-run after any SQL file that adds a new
--  table or a new function. Safe to re-run any time.
--
--  1. Row level security ON for every table in public. No policies are added,
--     so the public anon key can't read or write any table directly; all access
--     goes through the site's checked RPCs (security definer functions).
--  2. Internal helpers (functions whose name starts with _) can't be called from
--     the browser. They still run inside the site's RPCs (which run as the
--     owner). Before this, anyone could call e.g. _br_game_won / _ad_pay over
--     /rest/v1/rpc and award themselves wins or XP.
--  4. (33.2) passcode-era functions from schema.sql are dropped.
--  3. ctf_allowed_emails_public no longer hands out the whole allow-list; it
--     returns only the signed-in caller's own email when it's on the list
--     (same JSON shape, so auth.js keeps working unchanged).
--
--  Postgres keeps grants on CREATE OR REPLACE, so re-running an older file does
--  not undo this. A function that is DROPPED and re-created gets the default
--  grant again — install-check flags that, re-run this file to fix it.
-- ============================================================================

do $$
declare r record;
begin
  for r in select c.relname from pg_class c join pg_namespace n on n.oid = c.relnamespace
            where n.nspname = 'public' and c.relkind in ('r','p') and not c.relrowsecurity loop
    execute format('alter table public.%I enable row level security', r.relname);
  end loop;

  for r in select p.oid::regprocedure as sig from pg_proc p join pg_namespace n on n.oid = p.pronamespace
            where n.nspname = 'public' and p.proname like '\_%'
              and not exists (select 1 from pg_depend d where d.objid = p.oid and d.deptype = 'e') loop
    execute format('revoke all on function %s from public, anon, authenticated', r.sig);
  end loop;
end $$;

do $$
begin
  if to_regclass('public.allowed_emails') is not null then
    execute $f$
      create or replace function ctf_allowed_emails_public()
      returns json language sql stable security definer set search_path = public as $b$
        select coalesce((select json_agg(a.email) from allowed_emails a
                          where auth.uid() is not null and a.email = lower(coalesce(_email(), ''))), '[]'::json);
      $b$ $f$;
    execute 'grant execute on function ctf_allowed_emails_public() to anon, authenticated';
  end if;
end $$;

-- 33.2: retire the passcode-era functions from schema.sql. Nothing on the site calls them
-- (Google sign-in replaced them), but anyone holding the old teacher passcode could still
-- read rosters / integrity logs or delete a class, and ctf_cheat let anyone log events
-- against any student id. Re-running schema.sql brings them back: re-run this file after.
drop function if exists ctf_teacher_classes(text);
drop function if exists ctf_teacher_create_class(text,text,text,text);
drop function if exists ctf_teacher_delete_class(text,uuid);
drop function if exists ctf_teacher_roster(text,uuid);
drop function if exists ctf_teacher_flags(text,uuid,int);
drop function if exists ctf_teacher_cheats(text,uuid,int);
drop function if exists ctf_teacher_freeze(text,uuid,date[]);
drop function if exists ctf_teacher_reset_pin(text,uuid,text);
drop function if exists ctf_teacher_set_handle(text,uuid,text);
drop function if exists ctf_join(text,text,text);
drop function if exists ctf_sync(uuid,text,int,int,int,int,jsonb,jsonb,jsonb);
drop function if exists ctf_cheat(uuid,text,text);
drop function if exists ctf_flag(uuid,text,text,text,text,text,int,int,int,boolean);
drop function if exists ctf_rename(uuid,text,text);
drop function if exists ctf_leaderboard(uuid);

-- 33.2: the Day 0 warm-up (Cyber 1/2 "Are You a Target?" + AP CSP Student Info) is retired.
-- Cyber 1/2, AP CSP and Web3 all use one Google Form; every stored response is deleted here.
drop function if exists ctf_target_warmup_submit(text,text,text,jsonb);
drop function if exists ctf_t_target_warmup(text,int);
drop table if exists target_warmup_responses;

-- 33.4: integrity logging retired. Every stored event is deleted and any insert
-- (CTF focus/paste/devtools, vocab quiz violations) is silently dropped.
create or replace function _no_cheat_log() returns trigger
language plpgsql as $fn$ begin return null; end $fn$;
revoke all on function _no_cheat_log() from public, anon, authenticated;

do $blk$
begin
  if to_regclass('public.cheat_events') is not null then
    delete from cheat_events;
    drop trigger if exists no_cheat_log on cheat_events;
    create trigger no_cheat_log before insert on cheat_events for each row execute function _no_cheat_log();
  end if;
end $blk$;

-- install-check reads this: what is still open
create or replace function _lockdown_gaps() returns json
language sql stable security definer set search_path = public as $$
  select json_build_object(
    'tables', coalesce((select json_agg(c.relname order by c.relname) from pg_class c join pg_namespace n on n.oid = c.relnamespace
                         where n.nspname = 'public' and c.relkind in ('r','p') and not c.relrowsecurity), '[]'::json),
    'fns', coalesce((select json_agg(p.proname order by p.proname) from pg_proc p join pg_namespace n on n.oid = p.pronamespace
                      where n.nspname = 'public' and p.proname like '\_%'
                        and not exists (select 1 from pg_depend d where d.objid = p.oid and d.deptype = 'e')
                        and (has_function_privilege('anon', p.oid, 'execute') or has_function_privilege('authenticated', p.oid, 'execute'))), '[]'::json),
    'legacy', coalesce((select json_agg(p.proname order by p.proname) from pg_proc p join pg_namespace n on n.oid = p.pronamespace
                         where n.nspname = 'public' and p.proname in ('ctf_teacher_classes','ctf_teacher_roster','ctf_teacher_cheats','ctf_teacher_delete_class','ctf_join','ctf_sync','ctf_cheat','ctf_flag','ctf_rename','ctf_leaderboard')), '[]'::json));
$$;
revoke all on function _lockdown_gaps() from public, anon, authenticated;
