-- ============================================================================
--  INSTALL CHECK RPC  —  powers install-check.html (live "what's installed?").
--  Same checks as check-installed.sql, returned as JSON to the browser.
--  Reads the catalog only (plus the latest Hall of Fame week). Returns no
--  student data, so it is callable without signing in. Safe to re-run; order
--  doesn't matter — run it any time after schema.sql.
-- ============================================================================

create or replace function ctf_install_status()
returns json
language plpgsql
stable
security definer
set search_path = public
as $fn$
#variable_conflict use_column
declare
  v_rows json;
  v_snap text;
  v_n    int := 0;
begin
  select coalesce(json_agg(json_build_object(
           'grp', r.grp, 'step', r.step, 'file', r.file, 'feature', r.feature,
           'state', r.state, 'status', r.status) order by r.grp, r.ord), '[]'::json)
    into v_rows
  from (
    select c.step::text as step, c.file, c.feature,
      case when c.present then 'ok' else 'missing' end as state,
      case when c.present then '✅ installed' else '❌ NOT RUN — run this file' end as status,
      1 as grp, c.step as ord
    from (values
      (0, 'schema.sql', 'Core tables + original class-code sign-in', exists (select 1 from information_schema.tables where table_schema='public' and table_name='classes')),
      (1, 'google-auth.sql', 'Google sign-in, teacher identity', exists (select 1 from pg_proc p join pg_namespace n on n.oid = p.pronamespace where n.nspname='public' and p.proname='ctf_join_google')),
      (2, 'teacher-reports.sql', 'Roster, flag captures, attendance', exists (select 1 from information_schema.tables where table_schema='public' and table_name='activity_days')),
      (3, 'class-gates.sql', 'Module/flag locks, guide + answer-key + Ultimate Flags switches', exists (select 1 from information_schema.columns where table_schema='public' and table_name='classes' and column_name='locked_modules')),
      (4, 'answer-key.sql', 'Sealed answer key', exists (select 1 from information_schema.tables where table_schema='public' and table_name='answer_key')),
      (5, 'attempt-log.sql', 'Wrong-guess log + time-to-solve outliers', exists (select 1 from information_schema.tables where table_schema='public' and table_name='attempt_events')),
      (6, 'item-analysis.sql', 'Per-flag attempt/abandonment analytics', exists (select 1 from pg_proc p join pg_namespace n on n.oid = p.pronamespace where n.nspname='public' and p.proname='ctf_t_flag_attempts')),
      (7, 'class-groups.sql', 'Teacher groups (squads depend on this)', exists (select 1 from information_schema.tables where table_schema='public' and table_name='class_groups')),
      (8, 'squads.sql', 'Student-facing squads', exists (select 1 from information_schema.columns where table_schema='public' and table_name='classes' and column_name='squads_on')),
      (9, 'objectives.sql', 'Objective mastery reporting', exists (select 1 from information_schema.columns where table_schema='public' and table_name='classes' and column_name='objectives_on')),
      (10, 'pioneer.sql', 'Pioneer bonus — first in class to capture a flag', exists (select 1 from information_schema.tables where table_schema='public' and table_name='pioneer_claims')),
      (11, 'vocab-log.sql', 'Vocab time on task', exists (select 1 from pg_proc p join pg_namespace n on n.oid = p.pronamespace where n.nspname='public' and p.proname='ctf_t_vocab')),
      (12, 'vocab-sessions.sql', 'Per-run vocab audit trail', exists (select 1 from information_schema.tables where table_schema='public' and table_name='vocab_sessions')),
      (13, 'roster-csv.sql', 'CSV roster, move + remove students', exists (select 1 from information_schema.tables where table_schema='public' and table_name='roster_entries')),
      (14, 'teachers.sql', 'Multiple teacher accounts (staff + owner roles)', exists (select 1 from information_schema.tables where table_schema='public' and table_name='teachers')),
      (15, 'multi-domain.sql', 'Student sign-in from the second school domain', exists (select 1 from pg_proc p join pg_namespace n on n.oid = p.pronamespace where n.nspname='public' and p.proname='_school_domains')),
      (16, 'allowed-emails.sql', 'Extra allowed emails outside both domains', exists (select 1 from information_schema.tables where table_schema='public' and table_name='allowed_emails')),
      (17, 'teacher-xp.sql', 'Manual XP grants with a reason', exists (select 1 from information_schema.tables where table_schema='public' and table_name='xp_grants')),
      (18, 'hardmode-log.sql', 'Arena mini-game run log', exists (select 1 from information_schema.tables where table_schema='public' and table_name='hardmode_runs')),
      (19, 'hint-log.sql', 'Hint-used tracking per flag', exists (select 1 from information_schema.columns where table_schema='public' and table_name='flag_events' and column_name='hint_used')),
      (20, 'target-warmup.sql', 'Day-1 "Are You a Target?" warm-up', exists (select 1 from information_schema.tables where table_schema='public' and table_name='target_warmup_responses')),
      (21, 'signin-log.sql', 'Rejected sign-in log', exists (select 1 from information_schema.tables where table_schema='public' and table_name='signin_rejects')),
      (22, 'board-leaderboard.sql', 'Classroom leaderboard', exists (select 1 from pg_proc p join pg_namespace n on n.oid = p.pronamespace where n.nspname='public' and p.proname='ctf_t_leaderboard')),
      (23, 'board-leaderboard-weekly.sql', '"This Week" leaderboard mode', exists (select 1 from pg_proc p join pg_namespace n on n.oid = p.pronamespace where n.nspname='public' and p.proname='ctf_t_leaderboard_weekly')),
      (24, 'weekly-winners.sql', 'Hall of Fame weekly top 3', exists (select 1 from information_schema.tables where table_schema='public' and table_name='weekly_winners')),
      (25, 'weekly-snapshot-auto.sql', 'Monday auto-snapshot (GitHub Action)', exists (select 1 from pg_proc p join pg_namespace n on n.oid = p.pronamespace where n.nspname='public' and p.proname='cron_snapshot_all_classes')),
      (26, 'reward-items.sql', 'Reward items, spinner prizes, loot drops', exists (select 1 from information_schema.tables where table_schema='public' and table_name='reward_items')),
      (27, 'coins-cosmetics.sql', 'Coins + Coin Shop cosmetics', exists (select 1 from information_schema.tables where table_schema='public' and table_name='cosmetic_owned')),
      (28, 'class-pulse.sql', 'Live Class Pulse dashboard', exists (select 1 from information_schema.tables where table_schema='public' and table_name='presence')),
      (29, 'duels.sql', 'Head-to-head duels', exists (select 1 from information_schema.tables where table_schema='public' and table_name='duels')),
      (30, 'scheduled-unlocks.sql', 'Scheduled unlocks (run LAST of the gate files)', exists (select 1 from information_schema.tables where table_schema='public' and table_name='unlock_schedule')),
      (31, 'install-check.sql', 'Live status for install-check.html', exists (select 1 from pg_proc p join pg_namespace n on n.oid = p.pronamespace where n.nspname='public' and p.proname='ctf_install_status'))
    ) as c(step, file, feature, present)
  
    union all
    select '—', 'run order', 'objectives.sql must run after class-gates.sql + squads.sql',
      case when not exists (select 1 from information_schema.columns where table_schema='public' and table_name='classes' and column_name='objectives_on') then 'na' when coalesce(strpos((select pg_get_functiondef(p.oid) from pg_proc p join pg_namespace n on n.oid = p.pronamespace where n.nspname='public' and p.proname='ctf_gates' limit 1), 'objectives_on'), 0) > 0
             and coalesce(strpos((select pg_get_functiondef(p.oid) from pg_proc p join pg_namespace n on n.oid = p.pronamespace where n.nspname='public' and p.proname='ctf_t_classes' limit 1), 'objectives_on'), 0) > 0 then 'ok' else 'rerun' end,
      case when not exists (select 1 from information_schema.columns where table_schema='public' and table_name='classes' and column_name='objectives_on') then 'objectives.sql not run yet — nothing to check'
           when coalesce(strpos((select pg_get_functiondef(p.oid) from pg_proc p join pg_namespace n on n.oid = p.pronamespace where n.nspname='public' and p.proname='ctf_gates' limit 1), 'objectives_on'), 0) > 0
             and coalesce(strpos((select pg_get_functiondef(p.oid) from pg_proc p join pg_namespace n on n.oid = p.pronamespace where n.nspname='public' and p.proname='ctf_t_classes' limit 1), 'objectives_on'), 0) > 0
             then '✅ fine — ctf_gates + ctf_t_classes carry the objectives switch'
           else '⚠ RE-RUN objectives.sql, then scheduled-unlocks.sql' end,
      2, 1
  
    union all
    select '—', 'run order', 'attempt-log.sql must run after google-auth.sql + teacher-reports.sql',
      case when not exists (select 1 from information_schema.tables where table_schema='public' and table_name='attempt_events') then 'na' when coalesce(strpos((select pg_get_functiondef(p.oid) from pg_proc p join pg_namespace n on n.oid = p.pronamespace where n.nspname='public' and p.proname='ctf_cheat_google' limit 1), 'flag_key'), 0) > 0
             and coalesce(strpos((select pg_get_functiondef(p.oid) from pg_proc p join pg_namespace n on n.oid = p.pronamespace where n.nspname='public' and p.proname='ctf_t_student' limit 1), 'attempt'), 0) > 0 then 'ok' else 'rerun' end,
      case when not exists (select 1 from information_schema.tables where table_schema='public' and table_name='attempt_events') then 'attempt-log.sql not run yet — nothing to check'
           when coalesce(strpos((select pg_get_functiondef(p.oid) from pg_proc p join pg_namespace n on n.oid = p.pronamespace where n.nspname='public' and p.proname='ctf_cheat_google' limit 1), 'flag_key'), 0) > 0
             and coalesce(strpos((select pg_get_functiondef(p.oid) from pg_proc p join pg_namespace n on n.oid = p.pronamespace where n.nspname='public' and p.proname='ctf_t_student' limit 1), 'attempt'), 0) > 0
             then '✅ fine — cheat log + student report include attempts'
           else '⚠ RE-RUN attempt-log.sql' end,
      2, 2
  
    union all
    select '—', 'run order', 'multi-domain.sql must run after google-auth.sql',
      case when not exists (select 1 from pg_proc p join pg_namespace n on n.oid = p.pronamespace where n.nspname='public' and p.proname='_school_domains') then 'na' when coalesce(strpos((select pg_get_functiondef(p.oid) from pg_proc p join pg_namespace n on n.oid = p.pronamespace where n.nspname='public' and p.proname='_is_school' limit 1), '_school_domains'), 0) > 0 then 'ok' else 'rerun' end,
      case when not exists (select 1 from pg_proc p join pg_namespace n on n.oid = p.pronamespace where n.nspname='public' and p.proname='_school_domains') then 'multi-domain.sql not run yet — second-domain students CANNOT sign in — nothing to check'
           when coalesce(strpos((select pg_get_functiondef(p.oid) from pg_proc p join pg_namespace n on n.oid = p.pronamespace where n.nspname='public' and p.proname='_is_school' limit 1), '_school_domains'), 0) > 0
             then '✅ fine — _is_school() uses the domain list'
           else '⚠ RE-RUN multi-domain.sql, then allowed-emails.sql' end,
      2, 3
  
    union all
    select '—', 'run order', 'allowed-emails.sql must run after multi-domain.sql',
      case when not exists (select 1 from information_schema.tables where table_schema='public' and table_name='allowed_emails') then 'na' when coalesce(strpos((select pg_get_functiondef(p.oid) from pg_proc p join pg_namespace n on n.oid = p.pronamespace where n.nspname='public' and p.proname='_is_school' limit 1), 'allowed_emails'), 0) > 0 then 'ok' else 'rerun' end,
      case when not exists (select 1 from information_schema.tables where table_schema='public' and table_name='allowed_emails') then 'allowed-emails.sql not run yet — nothing to check'
           when coalesce(strpos((select pg_get_functiondef(p.oid) from pg_proc p join pg_namespace n on n.oid = p.pronamespace where n.nspname='public' and p.proname='_is_school' limit 1), 'allowed_emails'), 0) > 0
             then '✅ fine — _is_school() checks the allowlist'
           else '⚠ RE-RUN allowed-emails.sql' end,
      2, 4
  
    union all
    select '—', 'run order', 'teachers.sql must run after google-auth.sql',
      case when not exists (select 1 from information_schema.tables where table_schema='public' and table_name='teachers') then 'na' when coalesce(strpos((select pg_get_functiondef(p.oid) from pg_proc p join pg_namespace n on n.oid = p.pronamespace where n.nspname='public' and p.proname='_is_teacher' limit 1), 'teachers'), 0) > 0 then 'ok' else 'rerun' end,
      case when not exists (select 1 from information_schema.tables where table_schema='public' and table_name='teachers') then 'teachers.sql not run yet — only the owner email has dashboard access — nothing to check'
           when coalesce(strpos((select pg_get_functiondef(p.oid) from pg_proc p join pg_namespace n on n.oid = p.pronamespace where n.nspname='public' and p.proname='_is_teacher' limit 1), 'teachers'), 0) > 0
             then '✅ fine — _is_teacher() reads the teachers table'
           else '⚠ RE-RUN teachers.sql — added teachers are locked out' end,
      2, 5
  
    union all
    select '—', 'run order', 'teacher-xp.sql must run after google-auth.sql',
      case when not exists (select 1 from information_schema.tables where table_schema='public' and table_name='xp_grants') then 'na' when coalesce(strpos((select pg_get_functiondef(p.oid) from pg_proc p join pg_namespace n on n.oid = p.pronamespace where n.nspname='public' and p.proname='ctf_sync_google' limit 1), 'teacher_bonus'), 0) > 0 then 'ok' else 'rerun' end,
      case when not exists (select 1 from information_schema.tables where table_schema='public' and table_name='xp_grants') then 'teacher-xp.sql not run yet — nothing to check'
           when coalesce(strpos((select pg_get_functiondef(p.oid) from pg_proc p join pg_namespace n on n.oid = p.pronamespace where n.nspname='public' and p.proname='ctf_sync_google' limit 1), 'teacher_bonus'), 0) > 0
             then '✅ fine — sync preserves granted XP'
           else '⚠ RE-RUN teacher-xp.sql — granted XP is lost on sync' end,
      2, 6
  
    union all
    select '—', 'run order', 'hint-log.sql must run after google-auth.sql',
      case when not exists (select 1 from information_schema.columns where table_schema='public' and table_name='flag_events' and column_name='hint_used') then 'na' when coalesce(strpos((select pg_get_functiondef(p.oid) from pg_proc p join pg_namespace n on n.oid = p.pronamespace where n.nspname='public' and p.proname='ctf_flag_google' limit 1), 'hint_used'), 0) > 0 then 'ok' else 'rerun' end,
      case when not exists (select 1 from information_schema.columns where table_schema='public' and table_name='flag_events' and column_name='hint_used') then 'hint-log.sql not run yet — nothing to check'
           when coalesce(strpos((select pg_get_functiondef(p.oid) from pg_proc p join pg_namespace n on n.oid = p.pronamespace where n.nspname='public' and p.proname='ctf_flag_google' limit 1), 'hint_used'), 0) > 0
             then '✅ fine — captures record hint use'
           else '⚠ RE-RUN hint-log.sql' end,
      2, 7
  
    union all
    select '—', 'run order', 'weekly-snapshot-auto.sql must run after weekly-winners.sql',
      case when not exists (select 1 from pg_proc p join pg_namespace n on n.oid = p.pronamespace where n.nspname='public' and p.proname='cron_snapshot_all_classes') then 'na' when coalesce(strpos((select pg_get_functiondef(p.oid) from pg_proc p join pg_namespace n on n.oid = p.pronamespace where n.nspname='public' and p.proname='ctf_t_snapshot_week' limit 1), '_snapshot_week_for_class'), 0) > 0 then 'ok' else 'rerun' end,
      case when not exists (select 1 from pg_proc p join pg_namespace n on n.oid = p.pronamespace where n.nspname='public' and p.proname='cron_snapshot_all_classes') then 'weekly-snapshot-auto.sql not run yet — nothing to check'
           when coalesce(strpos((select pg_get_functiondef(p.oid) from pg_proc p join pg_namespace n on n.oid = p.pronamespace where n.nspname='public' and p.proname='ctf_t_snapshot_week' limit 1), '_snapshot_week_for_class'), 0) > 0
             then '✅ fine — manual + automatic snapshots share one code path'
           else '⚠ RE-RUN weekly-snapshot-auto.sql' end,
      2, 8
  
    union all
    select '—', 'run order', 'scheduled-unlocks.sql must run after the gate files',
      case when not exists (select 1 from information_schema.tables where table_schema='public' and table_name='unlock_schedule') then 'na' when coalesce(strpos((select pg_get_functiondef(p.oid) from pg_proc p join pg_namespace n on n.oid = p.pronamespace where n.nspname='public' and p.proname='ctf_gates' limit 1), '_apply_unlocks'), 0) > 0 then 'ok' else 'rerun' end,
      case when not exists (select 1 from information_schema.tables where table_schema='public' and table_name='unlock_schedule') then 'scheduled-unlocks.sql not run yet — nothing to check'
           when coalesce(strpos((select pg_get_functiondef(p.oid) from pg_proc p join pg_namespace n on n.oid = p.pronamespace where n.nspname='public' and p.proname='ctf_gates' limit 1), '_apply_unlocks'), 0) > 0
             then '✅ fine — ctf_gates applies scheduled unlocks'
           else '⚠ RE-RUN scheduled-unlocks.sql — a later file overwrote ctf_gates' end,
      2, 9
  ) as r;

  if exists (select 1 from information_schema.tables where table_schema='public' and table_name='weekly_winners') then
    execute 'select max(week_start)::text from weekly_winners' into v_snap;
    if v_snap is not null then
      execute 'select count(distinct class_id)::int from weekly_winners where week_start = $1::date'
        into v_n using v_snap;
    end if;
  end if;

  return json_build_object('rows', v_rows, 'last_snapshot', v_snap,
                           'snapshot_classes', v_n, 'checked_at', now());
end
$fn$;

revoke all on function ctf_install_status() from public;
grant execute on function ctf_install_status() to anon, authenticated;
