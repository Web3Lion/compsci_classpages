-- ============================================================================
--  WHAT'S INSTALLED?  —  paste this whole file into the Supabase SQL editor
--  and run it. ONE result table, in the order the files should be run.
--  Read the `status` column and work down the ❌ rows.
--
--  Reads nothing but the catalog. Changes nothing. Safe to run any time.
-- ============================================================================

select r.step, r.file, r.feature, r.status
from (

  -- ---- one row per add-on file ----------------------------------------------
  select
    c.step::text as step,
    c.file,
    c.feature,
    case when c.present then '✅ installed' else '❌ NOT RUN — run this file' end as status,
    1 as grp,          -- display group: files first, guards after
    c.step as ord      -- numeric sort key; sorting on the text would give 1,10,2,3…
  from (values
    (1, 'attempt-log.sql',    'Wrong-guess log + time-to-solve outliers',
        (select exists (select 1 from information_schema.tables
                        where table_schema='public' and table_name='attempt_events'))),
    (2, 'class-groups.sql',   'Teacher groups (squads depend on this)',
        (select exists (select 1 from information_schema.tables
                        where table_schema='public' and table_name='class_groups'))),
    (3, 'pioneer.sql',        'Pioneer bonus — first in class to capture a flag',
        (select exists (select 1 from information_schema.tables
                        where table_schema='public' and table_name='pioneer_claims'))),
    (4, 'vocab-log.sql',      'Vocab time on task',
        (select exists (select 1 from information_schema.routines
                        where routine_schema='public' and routine_name='ctf_t_vocab'))),
    (5, 'vocab-sessions.sql', 'Per-run vocab audit trail',
        (select exists (select 1 from information_schema.tables
                        where table_schema='public' and table_name='vocab_sessions'))),
    (6, 'roster-csv.sql',     'CSV roster, move + remove students',
        (select exists (select 1 from information_schema.tables
                        where table_schema='public' and table_name='roster_entries'))),
    (7, 'squads.sql',         'Student-facing squads',
        (select exists (select 1 from information_schema.columns
                        where table_schema='public' and table_name='classes'
                          and column_name='squads_on'))),
    (8, 'objectives.sql',     'Objective mastery reporting (run after squads.sql)',
        (select exists (select 1 from information_schema.columns
                        where table_schema='public' and table_name='classes'
                          and column_name='objectives_on'))),
    (9, 'teachers.sql',       'Multiple teacher accounts (staff + owner roles)',
        (select exists (select 1 from information_schema.tables
                        where table_schema='public' and table_name='teachers'))),
    (10,'multi-domain.sql',   'Student sign-in from @lions.net as well as @southfayette.org',
        (select exists (select 1 from pg_proc p
                        join pg_namespace n on n.oid = p.pronamespace
                        where n.nspname='public' and p.proname='_school_domains'))),
    (11,'signin-log.sql',     'Rejected sign-in log — which domain got turned away',
        (select exists (select 1 from information_schema.tables
                        where table_schema='public' and table_name='signin_rejects'))),
    (12,'teacher-xp.sql',     'Manual XP grants with a reason, ±100 per grant',
        (select exists (select 1 from information_schema.tables
                        where table_schema='public' and table_name='xp_grants'))),
    (13,'hardmode-log.sql',   'Arena mini-game run log (Decrypt, Rapid Fire, Speed Match…)',
        (select exists (select 1 from information_schema.tables
                        where table_schema='public' and table_name='hardmode_runs')))
  ) as c(step, file, feature, present)

  union all

  -- ---- guard 1: squads.sql before objectives.sql ----------------------------
  -- Both redefine ctf_t_classes/ctf_gates; only objectives.sql's version carries
  -- BOTH switches. If squads.sql ran last, the student objective map silently
  -- never appears. Fix: re-run objectives.sql on its own.
  select '—', 'run order', 'objectives.sql must run after squads.sql',
    case
      when not exists (select 1 from information_schema.columns
                       where table_schema='public' and table_name='classes'
                         and column_name='objectives_on')
        then 'objectives.sql not run yet — nothing to check'
      when (select pg_get_functiondef(p.oid) from pg_proc p
            join pg_namespace n on n.oid = p.pronamespace
            where n.nspname='public' and p.proname='ctf_gates' limit 1)
           like '%objectives_on%'
        then '✅ fine — ctf_gates carries both switches'
      else '⚠ RE-RUN objectives.sql — squads.sql overwrote ctf_gates'
    end,
    2, 1

  union all

  -- ---- guard 2: google-auth.sql clobbers the domain list --------------------
  -- google-auth.sql defines _is_school() against ONE hardcoded domain.
  -- multi-domain.sql replaces it with a list. Re-running google-auth.sql (it
  -- advertises itself as safe to re-run) silently reverts it, and every
  -- @lions.net student is rejected with not_school_account.
  select '—', 'run order', 'multi-domain.sql must run after google-auth.sql',
    case
      when not exists (select 1 from pg_proc p join pg_namespace n on n.oid=p.pronamespace
                       where n.nspname='public' and p.proname='_school_domains')
        then 'multi-domain.sql not run yet — students on the second domain CANNOT sign in'
      when (select pg_get_functiondef(p.oid) from pg_proc p
            join pg_namespace n on n.oid = p.pronamespace
            where n.nspname='public' and p.proname='_is_school' limit 1)
           like '%_school_domains%'
        then '✅ fine — _is_school() uses the domain list'
      else '⚠ RE-RUN multi-domain.sql — google-auth.sql reverted _is_school() to one domain'
    end,
    2, 2

  union all

  -- ---- guard 3: google-auth.sql clobbers multi-teacher ----------------------
  -- Same trap for _is_teacher(): google-auth.sql pins it to one email address,
  -- teachers.sql makes it table-driven. Reverting locks out every added teacher.
  select '—', 'run order', 'teachers.sql must run after google-auth.sql',
    case
      when not exists (select 1 from information_schema.tables
                       where table_schema='public' and table_name='teachers')
        then 'teachers.sql not run yet — only the owner email has dashboard access'
      when (select pg_get_functiondef(p.oid) from pg_proc p
            join pg_namespace n on n.oid = p.pronamespace
            where n.nspname='public' and p.proname='_is_teacher' limit 1)
           like '%teachers%'
        then '✅ fine — _is_teacher() reads the teachers table'
      else '⚠ RE-RUN teachers.sql — google-auth.sql reverted _is_teacher() to one email'
    end,
    2, 3

  union all

  -- ---- guard 4: sync must preserve teacher XP grants -------------------------
  -- teacher-xp.sql redefines ctf_sync_google so a student's push can't overwrite
  -- or double-count granted XP. Re-running google-auth.sql reverts it: grants
  -- then vanish on the student's next sync.
  select '—', 'run order', 'teacher-xp.sql must run after google-auth.sql',
    case
      when not exists (select 1 from information_schema.tables
                       where table_schema='public' and table_name='xp_grants')
        then 'teacher-xp.sql not run yet — no manual XP grants'
      when (select pg_get_functiondef(p.oid) from pg_proc p
            join pg_namespace n on n.oid = p.pronamespace
            where n.nspname='public' and p.proname='ctf_sync_google' limit 1)
           like '%teacher_bonus%'
        then '✅ fine — sync preserves granted XP'
      else '⚠ RE-RUN teacher-xp.sql — google-auth.sql reverted ctf_sync_google, granted XP will be lost on sync'
    end,
    2, 4

) as r
order by r.grp, r.ord;
