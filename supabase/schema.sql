-- ============================================================================
--  CTF PLATFORM — SUPABASE SCHEMA  (run once in the Supabase SQL editor)
-- ============================================================================
--  Security model for this MVP (no real auth yet — anonymous per-class handles):
--    * Tables have RLS ON with NO policies  -> the anon key cannot touch them.
--    * Every student action goes through a SECURITY DEFINER function below,
--      which is the only thing granted to the anon role. Students therefore
--      cannot read the class roster, read each other's PINs/progress, or scrape
--      cheat logs — they can only join, sync their own row, and log their own
--      events. When Google SSO lands we tighten further with per-user policies.
--    * PINs are never sent in the clear: the browser sends sha256(pin) only.
-- ============================================================================

create extension if not exists pgcrypto;

-- ---- TABLES ---------------------------------------------------------------
create table if not exists classes (
  id            uuid primary key default gen_random_uuid(),
  course        text not null,                    -- cyber1 | cyber2 | apcsp | web3
  name          text not null,                    -- e.g. "Period 3"
  code          text not null unique,             -- join code, e.g. CYBER-7F3K
  frozen_dates  date[] not null default '{}',     -- teacher streak-freeze (holidays / no class)
  created_at    timestamptz not null default now()
);

create table if not exists students (
  id          uuid primary key default gen_random_uuid(),
  class_id    uuid not null references classes(id) on delete cascade,
  handle      text not null,                       -- anonymous display name (filtered client-side)
  pin_hash    text not null,                       -- sha256(pin)
  created_at  timestamptz not null default now(),
  last_seen   timestamptz not null default now()
);
-- one handle per class, case-insensitive
create unique index if not exists students_class_handle_uniq
  on students (class_id, lower(handle));

create table if not exists progress (
  student_id   uuid primary key references students(id) on delete cascade,
  course       text not null,
  points       int  not null default 0,
  bonus        int  not null default 0,
  solved_count int  not null default 0,
  total_count  int  not null default 0,
  state        jsonb not null default '{}'::jsonb, -- full engine state (solved keys, retry, earned, streak, badges…)
  streak       jsonb not null default '{}'::jsonb,
  badges       jsonb not null default '{}'::jsonb,
  updated_at   timestamptz not null default now()
);

create table if not exists cheat_events (
  id          bigint generated always as identity primary key,
  student_id  uuid references students(id) on delete cascade,
  class_id    uuid references classes(id) on delete cascade,
  course      text,
  handle      text,
  kind        text,        -- paste | focus | canary | copy | devtools
  detail      text,
  created_at  timestamptz not null default now()
);
create index if not exists cheat_events_class_idx on cheat_events (class_id, created_at desc);

-- ---- LOCK DOWN: RLS on, no policies (anon reaches tables only via functions) ----
alter table classes      enable row level security;
alter table students     enable row level security;
alter table progress     enable row level security;
alter table cheat_events enable row level security;

-- ---- RPCs (SECURITY DEFINER) ----------------------------------------------

-- Join a class (first time) or resume (returning / new device). Returns the
-- student id + class info + any stored progress for cross-device merge.
create or replace function ctf_join(p_code text, p_handle text, p_pin_hash text)
returns json language plpgsql security definer set search_path = public as $$
declare
  v_class classes; v_student students; v_prog progress; v_resumed boolean := false;
begin
  if coalesce(trim(p_handle),'') = '' then raise exception 'empty_handle'; end if;
  if coalesce(p_pin_hash,'') = ''      then raise exception 'empty_pin';    end if;

  select * into v_class from classes where upper(code) = upper(trim(p_code));
  if not found then raise exception 'class_not_found'; end if;

  select * into v_student from students
    where class_id = v_class.id and lower(handle) = lower(trim(p_handle));

  if found then
    if v_student.pin_hash <> p_pin_hash then raise exception 'bad_pin'; end if;
    v_resumed := true;
    update students set last_seen = now() where id = v_student.id;
  else
    insert into students (class_id, handle, pin_hash)
      values (v_class.id, trim(p_handle), p_pin_hash)
      returning * into v_student;
    insert into progress (student_id, course) values (v_student.id, v_class.course);
  end if;

  select * into v_prog from progress where student_id = v_student.id;

  return json_build_object(
    'student_id', v_student.id,
    'class_id',   v_class.id,
    'course',     v_class.course,
    'class_name', v_class.name,
    'frozen',     v_class.frozen_dates,
    'resumed',    v_resumed,
    'progress',   case when v_prog.student_id is null then null else row_to_json(v_prog) end
  );
end $$;

-- Push the browser's current state up. Verifies the PIN so nobody can overwrite
-- another student's row.
create or replace function ctf_sync(
  p_student uuid, p_pin_hash text,
  p_points int, p_bonus int, p_solved int, p_total int,
  p_state jsonb, p_streak jsonb, p_badges jsonb
) returns void language plpgsql security definer set search_path = public as $$
declare v_student students;
begin
  select * into v_student from students where id = p_student;
  if not found then raise exception 'no_student'; end if;
  if v_student.pin_hash <> p_pin_hash then raise exception 'bad_pin'; end if;

  update progress set
    points = p_points, bonus = p_bonus,
    solved_count = p_solved, total_count = p_total,
    state = coalesce(p_state,'{}'::jsonb),
    streak = coalesce(p_streak,'{}'::jsonb),
    badges = coalesce(p_badges,'{}'::jsonb),
    updated_at = now()
  where student_id = p_student;

  update students set last_seen = now() where id = p_student;
end $$;

-- Log an integrity event. Deliberately low-friction (no PIN) — it only ever
-- inserts a row tied to this student, and it never reduces the student's XP.
create or replace function ctf_cheat(p_student uuid, p_kind text, p_detail text)
returns void language plpgsql security definer set search_path = public as $$
declare v_student students; v_class classes;
begin
  select * into v_student from students where id = p_student;
  if not found then return; end if;
  select * into v_class from classes where id = v_student.class_id;
  insert into cheat_events (student_id, class_id, course, handle, kind, detail)
    values (v_student.id, v_student.class_id, v_class.course, v_student.handle,
            left(coalesce(p_kind,''),32), left(coalesce(p_detail,''),400));
end $$;

-- Only the functions are exposed to the browser; tables stay sealed.
revoke all on function ctf_join(text,text,text) from public;
revoke all on function ctf_sync(uuid,text,int,int,int,int,jsonb,jsonb,jsonb) from public;
revoke all on function ctf_cheat(uuid,text,text) from public;
grant execute on function ctf_join(text,text,text) to anon;
grant execute on function ctf_sync(uuid,text,int,int,int,int,jsonb,jsonb,jsonb) to anon;
grant execute on function ctf_cheat(uuid,text,text) to anon;

-- ---- FLAG COMPLETION LOG (per-flag, with time-to-solve) --------------------
create table if not exists flag_events (
  id           bigint generated always as identity primary key,
  student_id   uuid references students(id) on delete cascade,
  class_id     uuid references classes(id) on delete cascade,
  course       text,
  handle       text,
  flag_key     text,        -- unique key within a challenge (e.g. "m1-crypto#0")
  challenge_id text,
  title        text,
  level        text,        -- Easy | Medium | Hard | null
  points       int,         -- XP actually earned (after time/retry/taint)
  secs         int,         -- seconds from first focus to solve; -1 = untimed (mini-game)
  retries      int,
  tainted      boolean,     -- solved after a paste/focus/canary flag
  created_at   timestamptz not null default now()
);
-- one row per (student, flag); a resync of the same solve is ignored
create unique index if not exists flag_events_student_key_uniq
  on flag_events (student_id, flag_key);
create index if not exists flag_events_class_idx on flag_events (class_id, created_at desc);
alter table flag_events enable row level security;

-- single-teacher access: store sha256(passcode). Seed one row (see bottom).
create table if not exists teacher_config (
  id          int primary key default 1,
  pass_hash   text not null,
  constraint teacher_config_singleton check (id = 1)
);
alter table teacher_config enable row level security;

create or replace function ctf_flag(
  p_student uuid, p_pin_hash text, p_key text, p_challenge text,
  p_title text, p_level text, p_points int, p_secs int,
  p_retries int, p_tainted boolean
) returns void language plpgsql security definer set search_path = public as $$
declare v_student students; v_class classes;
begin
  select * into v_student from students where id = p_student;
  if not found then return; end if;
  if v_student.pin_hash <> p_pin_hash then raise exception 'bad_pin'; end if;
  select * into v_class from classes where id = v_student.class_id;
  insert into flag_events (student_id, class_id, course, handle, flag_key, challenge_id,
                           title, level, points, secs, retries, tainted)
    values (v_student.id, v_student.class_id, v_class.course, v_student.handle,
            left(coalesce(p_key,''),80), left(coalesce(p_challenge,''),80),
            left(coalesce(p_title,''),200), left(coalesce(p_level,''),16),
            coalesce(p_points,0), coalesce(p_secs,-1), coalesce(p_retries,0), coalesce(p_tainted,false))
  on conflict (student_id, flag_key) do nothing;
end $$;

revoke all on function ctf_flag(uuid,text,text,text,text,text,int,int,int,boolean) from public;
grant execute on function ctf_flag(uuid,text,text,text,text,text,int,int,int,boolean) to anon;

-- ---- TEACHER RPCs (all guarded by the passcode; sealed from students) -------
-- BRUTE-FORCE LOCKOUT. The teacher RPCs are callable by anon (guarded only by
-- the passcode), and teacher.html is public on GitHub, so the call shape is
-- known. Without this, a passcode could be guessed as fast as the network
-- allows. Rule: 5 failures inside 15 min -> locked for 15 min. A success
-- clears the counter. Counted globally (single teacher), so no IP is stored.
create table if not exists teacher_auth_attempts (
  id            int primary key default 1,
  fails         int not null default 0,
  first_fail_at timestamptz,
  locked_until  timestamptz,
  constraint teacher_auth_attempts_singleton check (id = 1)
);
alter table teacher_auth_attempts enable row level security;

-- IMPORTANT: this gate must NEVER `raise` on a bad passcode. PostgREST runs each
-- RPC in one transaction, so raising would roll back the failure-counter UPDATE
-- and the lockout could never trigger. Instead it RETURNS a status string and
-- the callers turn a non-'ok' status into a json error payload (a normal return
-- commits the counter).
--   'ok' | 'no_teacher_config' | 'bad_pass' | 'locked_out_until_HH24:MI'
create or replace function _teacher_gate(p_pass text) returns text
language plpgsql security definer set search_path = public as $$
declare
  v text;
  a teacher_auth_attempts;
  win  constant interval := interval '15 minutes';
  lim  constant int      := 5;
begin
  insert into teacher_auth_attempts (id) values (1) on conflict (id) do nothing;
  select * into a from teacher_auth_attempts where id = 1 for update;

  if a.locked_until is not null and a.locked_until > now() then
    return 'locked_out_until_' || to_char(a.locked_until,'HH24:MI');
  end if;

  select pass_hash into v from teacher_config where id = 1;
  if v is null then return 'no_teacher_config'; end if;

  if v <> coalesce(p_pass,'') then
    if a.first_fail_at is null or a.first_fail_at < now() - win then
      update teacher_auth_attempts
         set fails = 1, first_fail_at = now(), locked_until = null where id = 1;
    else
      update teacher_auth_attempts
         set fails = a.fails + 1,
             locked_until = case when a.fails + 1 >= lim then now() + win else null end
       where id = 1;
    end if;
    return 'bad_pass';
  end if;

  update teacher_auth_attempts
     set fails = 0, first_fail_at = null, locked_until = null where id = 1;
  return 'ok';
end $$;

drop function if exists _teacher_ok(text);

-- all classes with live student counts
create or replace function ctf_teacher_classes(p_pass text)
returns json language plpgsql security definer set search_path = public as $$
declare g text;
begin
  g := _teacher_gate(p_pass); if g <> 'ok' then return json_build_object('error', g); end if;
  return coalesce((select json_agg(row_to_json(t) order by t.course, t.name) from (
    select c.id, c.course, c.name, c.code, c.frozen_dates, c.created_at,
           (select count(*) from students s where s.class_id = c.id) as student_count
    from classes c
  ) t), '[]'::json);
end $$;

create or replace function ctf_teacher_create_class(p_pass text, p_course text, p_name text, p_code text)
returns json language plpgsql security definer set search_path = public as $$
declare v_class classes; g text;
begin
  g := _teacher_gate(p_pass); if g <> 'ok' then return json_build_object('error', g); end if;
  if coalesce(trim(p_name),'') = '' then raise exception 'empty_name'; end if;
  if coalesce(trim(p_code),'') = '' then raise exception 'empty_code'; end if;
  insert into classes (course, name, code)
    values (p_course, trim(p_name), upper(trim(p_code)))
    returning * into v_class;
  return row_to_json(v_class);
exception when unique_violation then raise exception 'code_taken';
end $$;

drop function if exists ctf_teacher_delete_class(text,uuid);
create or replace function ctf_teacher_delete_class(p_pass text, p_class uuid)
returns json language plpgsql security definer set search_path = public as $$
declare g text;
begin
  g := _teacher_gate(p_pass); if g <> 'ok' then return json_build_object('error', g); end if;
  delete from classes where id = p_class;
  return json_build_object('ok', true);
end $$;

-- roster + progress for one class
create or replace function ctf_teacher_roster(p_pass text, p_class uuid)
returns json language plpgsql security definer set search_path = public as $$
declare g text;
begin
  g := _teacher_gate(p_pass); if g <> 'ok' then return json_build_object('error', g); end if;
  return coalesce((select json_agg(row_to_json(t) order by t.points desc) from (
    select s.id, s.handle, s.created_at, s.last_seen,
           coalesce(p.points,0) as points, coalesce(p.bonus,0) as bonus,
           coalesce(p.solved_count,0) as solved_count, coalesce(p.total_count,0) as total_count,
           coalesce(p.streak,'{}'::jsonb) as streak, coalesce(p.badges,'{}'::jsonb) as badges,
           p.updated_at,
           (select count(*) from cheat_events ce where ce.student_id = s.id) as cheat_count
    from students s left join progress p on p.student_id = s.id
    where s.class_id = p_class
  ) t), '[]'::json);
end $$;

create or replace function ctf_teacher_flags(p_pass text, p_class uuid, p_limit int default 500)
returns json language plpgsql security definer set search_path = public as $$
declare g text;
begin
  g := _teacher_gate(p_pass); if g <> 'ok' then return json_build_object('error', g); end if;
  return coalesce((select json_agg(row_to_json(t)) from (
    select handle, challenge_id, title, level, points, secs, retries, tainted, created_at
    from flag_events where class_id = p_class
    order by created_at desc limit greatest(1, least(p_limit, 2000))
  ) t), '[]'::json);
end $$;

create or replace function ctf_teacher_cheats(p_pass text, p_class uuid, p_limit int default 500)
returns json language plpgsql security definer set search_path = public as $$
declare g text;
begin
  g := _teacher_gate(p_pass); if g <> 'ok' then return json_build_object('error', g); end if;
  return coalesce((select json_agg(row_to_json(t)) from (
    select handle, kind, detail, created_at from cheat_events
    where class_id = p_class order by created_at desc limit greatest(1, least(p_limit, 2000))
  ) t), '[]'::json);
end $$;

-- set the streak-freeze dates (holidays / no-class days) for a class
drop function if exists ctf_teacher_freeze(text,uuid,date[]);
create or replace function ctf_teacher_freeze(p_pass text, p_class uuid, p_dates date[])
returns json language plpgsql security definer set search_path = public as $$
declare g text;
begin
  g := _teacher_gate(p_pass); if g <> 'ok' then return json_build_object('error', g); end if;
  update classes set frozen_dates = coalesce(p_dates, '{}') where id = p_class;
  return json_build_object('ok', true);
end $$;

-- reset a student's PIN (kid forgot it) — sets a new sha256(pin)
drop function if exists ctf_teacher_reset_pin(text,uuid,text);
create or replace function ctf_teacher_reset_pin(p_pass text, p_student uuid, p_pin_hash text)
returns json language plpgsql security definer set search_path = public as $$
declare g text;
begin
  g := _teacher_gate(p_pass); if g <> 'ok' then return json_build_object('error', g); end if;
  update students set pin_hash = p_pin_hash where id = p_student;
  return json_build_object('ok', true);
end $$;

revoke all on function ctf_teacher_classes(text)                     from public;
revoke all on function ctf_teacher_create_class(text,text,text,text) from public;
revoke all on function ctf_teacher_delete_class(text,uuid)           from public;
revoke all on function ctf_teacher_roster(text,uuid)                 from public;
revoke all on function ctf_teacher_flags(text,uuid,int)              from public;
revoke all on function ctf_teacher_cheats(text,uuid,int)             from public;
revoke all on function ctf_teacher_freeze(text,uuid,date[])          from public;
revoke all on function ctf_teacher_reset_pin(text,uuid,text)         from public;
grant execute on function ctf_teacher_classes(text)                     to anon;
grant execute on function ctf_teacher_create_class(text,text,text,text) to anon;
grant execute on function ctf_teacher_delete_class(text,uuid)           to anon;
grant execute on function ctf_teacher_roster(text,uuid)                 to anon;
grant execute on function ctf_teacher_flags(text,uuid,int)              to anon;
grant execute on function ctf_teacher_cheats(text,uuid,int)             to anon;
grant execute on function ctf_teacher_freeze(text,uuid,date[])          to anon;
grant execute on function ctf_teacher_reset_pin(text,uuid,text)         to anon;

-- ---- SEED YOUR CLASSES (edit + run; the teacher page will do this later) ----
-- insert into classes (course, name, code) values
--   ('cyber1', 'Cyber 1 · Period 1', 'CY1-P1-7F3K'),
--   ('cyber2', 'Cyber 2 · Period 2', 'CY2-P2-4M9Q'),
--   ('apcsp',  'AP CSP · Period 3',  'CSP-P3-2K8R'),
--   ('web3',   'Web 3.0 · Period 4', 'WEB-P4-6H1T');


-- ============================================================================
--  PROFILE: leaderboard + student-initiated rename  (added for profile.html)
-- ============================================================================

-- Top 5 XP earners in a class. Returns ONLY display names + position — never
-- the scores themselves, so students can't compare exact XP with each other.
create or replace function ctf_leaderboard(p_class uuid)
returns json language plpgsql security definer set search_path = public as $$
begin
  return coalesce((select json_agg(row_to_json(t)) from (
    select row_number() over (order by (coalesce(pr.points,0) + coalesce(pr.bonus,0)) desc,
                                       pr.updated_at asc) as pos,
           st.handle
    from students st
    join progress pr on pr.student_id = st.id
    where st.class_id = p_class
      and (coalesce(pr.points,0) + coalesce(pr.bonus,0)) > 0
    order by (coalesce(pr.points,0) + coalesce(pr.bonus,0)) desc, pr.updated_at asc
    limit 5
  ) t), '[]'::json);
end $$;

-- Server-side backstop for display names. The real filter is client-side
-- (name-filter.js); this catches the obvious cases if someone calls the RPC
-- directly. The teacher can always overwrite a name from the dashboard.
create or replace function _name_ok(p_handle text) returns boolean
language plpgsql immutable set search_path = public as $$
declare
  v text := lower(trim(coalesce(p_handle,'')));
  n text;
  bad text[] := array[
    'fuck','shit','bitch','cunt','dick','cock','penis','vagina','pussy','tits','boob','nigg','fag',
    'retard','whore','slut','rape','nazi','hitler','kkk','porn','sex','anal','anus','cum','jizz',
    'wank','horny','milf','boner','turd','douche','prick','twat','thot','hoe','bastard','queer',
    'tranny','spic','chink','kike','meth','cocaine','heroin','suicide','kys','lynch','terror',
    'teacher','admin','principal','moderator','official'
  ];
  w text;
begin
  if length(v) < 3 or length(v) > 18 then return false; end if;
  if v !~ '^[a-z0-9 ._-]+$' then return false; end if;
  if v !~ '[a-z]' then return false; end if;
  -- collapse common leetspeak, then strip to letters only
  n := translate(v, '0134578!@$|+', 'oieasbtiaasit');
  n := regexp_replace(n, '[^a-z]', '', 'g');
  if length(n) < 3 then return false; end if;
  foreach w in array bad loop
    if position(w in n) > 0 then return false; end if;
  end loop;
  return true;
end $$;

-- A student changes their own display name (PIN-verified). Returns the stored
-- handle so the client can adopt whatever the server actually saved.
create or replace function ctf_rename(p_student uuid, p_pin_hash text, p_handle text)
returns json language plpgsql security definer set search_path = public as $$
declare v_student students; v_new text := trim(coalesce(p_handle,''));
begin
  select * into v_student from students where id = p_student;
  if not found then return json_build_object('error','no_student'); end if;
  if v_student.pin_hash <> coalesce(p_pin_hash,'') then return json_build_object('error','bad_pin'); end if;
  if not _name_ok(v_new) then return json_build_object('error','not_allowed'); end if;
  if exists (select 1 from students where class_id = v_student.class_id
               and lower(handle) = lower(v_new) and id <> p_student) then
    return json_build_object('error','handle_taken');
  end if;

  update students set handle = v_new where id = p_student;
  -- keep denormalized handles on the log tables in step
  update flag_events  set handle = v_new where student_id = p_student;
  update cheat_events set handle = v_new where student_id = p_student;
  return json_build_object('ok', true, 'handle', v_new);
end $$;

revoke all on function ctf_leaderboard(uuid) from public;
revoke all on function ctf_rename(uuid,text,text) from public;
grant execute on function ctf_leaderboard(uuid) to anon;
grant execute on function ctf_rename(uuid,text,text) to anon;

-- Teacher sets or resets a student's display name. Bypasses the word filter
-- only in the sense that the teacher is trusted; length/charset still apply.
create or replace function ctf_teacher_set_handle(p_pass text, p_student uuid, p_handle text)
returns json language plpgsql security definer set search_path = public as $$
declare g text; v_student students; v_new text := trim(coalesce(p_handle,''));
begin
  g := _teacher_gate(p_pass); if g <> 'ok' then return json_build_object('error', g); end if;
  select * into v_student from students where id = p_student;
  if not found then return json_build_object('error','no_student'); end if;
  if length(v_new) < 3 or length(v_new) > 18 or v_new !~ '^[A-Za-z0-9 ._-]+$' then
    return json_build_object('error','bad_name');
  end if;
  if exists (select 1 from students where class_id = v_student.class_id
               and lower(handle) = lower(v_new) and id <> p_student) then
    return json_build_object('error','handle_taken');
  end if;

  update students set handle = v_new where id = p_student;
  update flag_events  set handle = v_new where student_id = p_student;
  update cheat_events set handle = v_new where student_id = p_student;
  return json_build_object('ok', true, 'handle', v_new);
end $$;

revoke all on function ctf_teacher_set_handle(text,uuid,text) from public;
grant execute on function ctf_teacher_set_handle(text,uuid,text) to anon;
