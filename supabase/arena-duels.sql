-- © 2026 Robert Reasey, South Fayette School District. Licensed CC BY-NC 4.0 (attribution required, no commercial use). See LICENSE.md.
-- ============================================================================
--  FLAG DUELS (v21.0)  —  students race each other in the CTF arena.
--
--  A student opens arena-duel.html, picks modules + a time limit (2 / 5 / 10
--  min) and gets a 4-letter code. Up to 3 classmates join with the code. The
--  host presses Start. Until the timer ends, every flag a player captures in
--  those modules scores duel points: Easy 1 / Medium 2 / Hard 3 (other kinds 1).
--  Normal XP still applies to every capture as usual.
--
--  Scoring is server-side: a trigger on flag_events adds the points, so a
--  player can only score flags they hadn't captured before (flag_events is one
--  row per student per flag).
--
--  When time runs out: every player who didn't forfeit gets +5 XP, and the top
--  scorer(s) get +10 more (a tie pays +10 to each tied player). No winner bonus
--  when the top score is 0. Leaving the duel, or closing every arena/duel tab
--  for 90 seconds, forfeits (no XP).
--
--  Rules: min 2 / max 4 players, one duel at a time per student, same class
--  only, blocked while the student has a vocab quiz open, and a player with no
--  open flags in the picked modules can't join. Teachers can switch duels off
--  per class (classes.duels_on, default on).
--
--  Run AFTER schema.sql, google-auth.sql, teacher-xp.sql, hint-log.sql. Safe to re-run.
-- ============================================================================

alter table classes add column if not exists duels_on boolean not null default true;

create table if not exists arena_duels (
  id          uuid primary key default gen_random_uuid(),
  class_id    uuid not null references classes(id) on delete cascade,
  course      text not null,
  host        uuid not null references students(id) on delete cascade,
  code        text not null,
  modules     int[] not null,
  flag_keys   text[] not null,
  minutes     int  not null check (minutes in (2,5,10)),
  status      text not null default 'lobby' check (status in ('lobby','live','done','cancelled')),
  created_at  timestamptz not null default now(),
  started_at  timestamptz,
  ends_at     timestamptz,
  finished_at timestamptz
);
create index if not exists arena_duels_class on arena_duels (class_id, created_at desc);
alter table arena_duels enable row level security;

create table if not exists arena_duel_players (
  duel_id    uuid not null references arena_duels(id) on delete cascade,
  student_id uuid not null references students(id) on delete cascade,
  joined_at  timestamptz not null default now(),
  last_seen  timestamptz not null default now(),
  points     int  not null default 0,
  caps       int  not null default 0,
  forfeit    boolean not null default false,
  xp         int  not null default 0,
  won        boolean not null default false,
  primary key (duel_id, student_id)
);
create index if not exists arena_duel_players_student on arena_duel_players (student_id);
alter table arena_duel_players enable row level security;

create table if not exists arena_duel_caps (
  duel_id    uuid not null references arena_duels(id) on delete cascade,
  student_id uuid not null references students(id) on delete cascade,
  flag_key   text not null,
  title      text,
  pts        int  not null,
  at         timestamptz not null default now(),
  primary key (duel_id, student_id, flag_key)
);
alter table arena_duel_caps enable row level security;

-- ---- helpers -----------------------------------------------------------------
create or replace function _ad_me(p_student uuid) returns students
language sql stable security definer set search_path = public as $$
  select * from students where id = p_student and auth_user_id = auth.uid();
$$;

create or replace function _ad_in_quiz(p_student uuid) returns boolean
language plpgsql stable security definer set search_path = public as $$
declare v boolean := false;
begin
  if to_regclass('public.vocab_quiz_attempts') is null then return false; end if;
  execute 'select exists (select 1 from vocab_quiz_attempts where student_id = $1 and submitted_at is null
             and (deadline is null or deadline + interval ''2 minutes'' > now()))' into v using p_student;
  return coalesce(v, false);
end $$;

create or replace function _ad_open_count(p_student uuid, p_keys text[]) returns int
language sql stable security definer set search_path = public as $$
  select count(*)::int from unnest(p_keys) k
   where not exists (select 1 from flag_events f where f.student_id = p_student and f.flag_key = k);
$$;

-- pays XP the same way a teacher grant does (teacher_bonus survives every sync)
create or replace function _ad_pay(p_student uuid, p_amount int, p_reason text) returns void
language plpgsql security definer set search_path = public as $$
declare v_class uuid; v_tb int; v_cb int;
begin
  if coalesce(p_amount,0) <= 0 then return; end if;
  select class_id into v_class from students where id = p_student;
  if v_class is null then return; end if;
  insert into progress (student_id, course, points, bonus)
    select p_student, c.course, 0, 0 from classes c where c.id = v_class
    on conflict (student_id) do nothing;
  select coalesce(teacher_bonus,0), coalesce(client_bonus, bonus, 0) into v_tb, v_cb
    from progress where student_id = p_student;
  update progress set teacher_bonus = v_tb + p_amount, bonus = v_cb + v_tb + p_amount, updated_at = now()
   where student_id = p_student;
  insert into xp_grants (class_id, student_id, teacher_email, amount, reason)
    values (v_class, p_student, 'flag-duel', p_amount, p_reason);
end $$;

-- ends a duel once: forfeits idle players, pays XP, marks winners
create or replace function _ad_finish(p_duel uuid) returns void
language plpgsql security definer set search_path = public as $$
declare d arena_duels; v_top int; p record;
begin
  select * into d from arena_duels where id = p_duel for update;
  if not found or d.status <> 'live' or now() < d.ends_at then return; end if;
  update arena_duel_players set forfeit = true
   where duel_id = p_duel and not forfeit and last_seen < d.ends_at - interval '90 seconds';
  select max(points) into v_top from arena_duel_players where duel_id = p_duel and not forfeit;
  for p in select * from arena_duel_players where duel_id = p_duel and not forfeit loop
    if v_top > 0 and p.points = v_top then
      update arena_duel_players set won = true, xp = 15 where duel_id = p_duel and student_id = p.student_id;
      perform _ad_pay(p.student_id, 15, 'Flag duel win (+10) and played (+5)');
    else
      update arena_duel_players set xp = 5 where duel_id = p_duel and student_id = p.student_id;
      perform _ad_pay(p.student_id, 5, 'Flag duel played');
    end if;
  end loop;
  update arena_duels set status = 'done', finished_at = now() where id = p_duel;
end $$;

-- housekeeping for one class: stale lobbies cancel, finished duels pay out
create or replace function _ad_tidy(p_class uuid) returns void
language plpgsql security definer set search_path = public as $$
declare r record;
begin
  update arena_duels set status = 'cancelled', finished_at = now()
   where class_id = p_class and status = 'lobby' and created_at < now() - interval '15 minutes';
  for r in select id from arena_duels where class_id = p_class and status = 'live' and ends_at <= now() loop
    perform _ad_finish(r.id);
  end loop;
end $$;

-- ---- scoring: a capture during a live duel adds points ----------------------
-- 26.3: bounty: a capture that takes you past the leader (3+ pts) pays +1
alter table arena_duel_caps add column if not exists bounty boolean not null default false;
create or replace function _ad_score() returns trigger
language plpgsql security definer set search_path = public as $$
declare v_pts int; r record; v_my int; v_top int; v_b boolean;
begin
  v_pts := case lower(coalesce(new.level,'')) when 'hard' then 3 when 'medium' then 2 else 1 end;
  for r in
    select d.id from arena_duels d join arena_duel_players p on p.duel_id = d.id
     where p.student_id = new.student_id and not p.forfeit and d.status = 'live'
       and now() >= d.started_at and now() < d.ends_at and new.flag_key = any(d.flag_keys)
  loop
    select points into v_my from arena_duel_players where duel_id = r.id and student_id = new.student_id;
    select max(points) into v_top from arena_duel_players where duel_id = r.id and student_id <> new.student_id and not forfeit;
    v_b := coalesce(v_top, 0) >= 3 and coalesce(v_my, 0) <= v_top and coalesce(v_my, 0) + v_pts > v_top;
    insert into arena_duel_caps (duel_id, student_id, flag_key, title, pts, bounty)
      values (r.id, new.student_id, new.flag_key, left(coalesce(new.title,''),120), v_pts + case when v_b then 1 else 0 end, v_b)
      on conflict do nothing;
    if found then
      update arena_duel_players set points = points + v_pts + (case when v_b then 1 else 0 end), caps = caps + 1, last_seen = now()
       where duel_id = r.id and student_id = new.student_id;
    end if;
  end loop;
  return new;
end $$;
drop trigger if exists arena_duel_score on flag_events;
create trigger arena_duel_score after insert on flag_events
  for each row execute function _ad_score();

-- ---- student ---------------------------------------------------------------
create or replace function ctf_ad_create(p_student uuid, p_modules int[], p_minutes int, p_keys text[])
returns json language plpgsql security definer set search_path = public as $$
declare me students; c classes; v_code text; v_id uuid; v_keys text[]; i int;
begin
  me := _ad_me(p_student); if me.id is null then return json_build_object('error','not_yours'); end if;
  select * into c from classes where id = me.class_id;
  if not c.duels_on then return json_build_object('error','duels_off'); end if;
  perform _ad_tidy(c.id);
  if p_minutes not in (2,5,10) then return json_build_object('error','bad_minutes'); end if;
  if coalesce(cardinality(p_modules),0) = 0 then return json_build_object('error','no_modules'); end if;
  if _ad_in_quiz(me.id) then return json_build_object('error','in_quiz'); end if;
  if exists (select 1 from arena_duel_players p join arena_duels d on d.id = p.duel_id
              where p.student_id = me.id and d.status in ('lobby','live') and not p.forfeit)
    then return json_build_object('error','already_in_duel'); end if;
  select coalesce(array_agg(distinct left(k,80)), '{}') into v_keys from unnest(coalesce(p_keys,'{}')) k where k <> '';
  if cardinality(v_keys) = 0 or cardinality(v_keys) > 800 then return json_build_object('error','no_flags'); end if;
  if _ad_open_count(me.id, v_keys) = 0 then return json_build_object('error','no_open_flags'); end if;
  for i in 1..30 loop
    v_code := (select string_agg(substr('ABCDEFGHJKLMNPQRSTUVWXYZ', 1 + floor(random()*24)::int, 1), '') from generate_series(1,4));
    exit when not exists (select 1 from arena_duels where class_id = c.id and code = v_code and status in ('lobby','live'));
  end loop;
  insert into arena_duels (class_id, course, host, code, modules, flag_keys, minutes)
    values (c.id, c.course, me.id, v_code, p_modules, v_keys, p_minutes) returning id into v_id;
  insert into arena_duel_players (duel_id, student_id) values (v_id, me.id);
  return json_build_object('ok', true, 'id', v_id, 'code', v_code);
end $$;

create or replace function ctf_ad_join(p_student uuid, p_code text)
returns json language plpgsql security definer set search_path = public as $$
declare me students; d arena_duels; c classes;
begin
  me := _ad_me(p_student); if me.id is null then return json_build_object('error','not_yours'); end if;
  select * into c from classes where id = me.class_id;
  if not c.duels_on then return json_build_object('error','duels_off'); end if;
  perform _ad_tidy(c.id);
  select * into d from arena_duels where class_id = me.class_id and code = upper(btrim(coalesce(p_code,'')))
     and status in ('lobby','live') order by created_at desc limit 1;
  if d.id is null then return json_build_object('error','no_duel'); end if;
  if exists (select 1 from arena_duel_players where duel_id = d.id and student_id = me.id and not forfeit)
    then return json_build_object('ok', true, 'id', d.id); end if;
  if d.status <> 'lobby' then return json_build_object('error','started'); end if;
  if _ad_in_quiz(me.id) then return json_build_object('error','in_quiz'); end if;
  if exists (select 1 from arena_duel_players p join arena_duels x on x.id = p.duel_id
              where p.student_id = me.id and x.status in ('lobby','live') and not p.forfeit)
    then return json_build_object('error','already_in_duel'); end if;
  if (select count(*) from arena_duel_players where duel_id = d.id and not forfeit) >= 6
    then return json_build_object('error','full'); end if;
  if _ad_open_count(me.id, d.flag_keys) = 0 then return json_build_object('error','no_open_flags'); end if;
  insert into arena_duel_players (duel_id, student_id) values (d.id, me.id)
    on conflict (duel_id, student_id) do update set forfeit = false, last_seen = now();
  return json_build_object('ok', true, 'id', d.id);
end $$;

create or replace function ctf_ad_start(p_student uuid)
returns json language plpgsql security definer set search_path = public as $$
declare me students; d arena_duels;
begin
  me := _ad_me(p_student); if me.id is null then return json_build_object('error','not_yours'); end if;
  select * into d from arena_duels where host = me.id and status = 'lobby' order by created_at desc limit 1 for update;
  if d.id is null then return json_build_object('error','no_lobby'); end if;
  if (select count(*) from arena_duel_players where duel_id = d.id and not forfeit) < 2
    then return json_build_object('error','need_two'); end if;
  update arena_duels set status = 'live', started_at = now(), ends_at = now() + make_interval(mins => d.minutes) where id = d.id;
  update arena_duel_players set last_seen = now() where duel_id = d.id;
  return json_build_object('ok', true);
end $$;

-- leave = forfeit (live) or drop out (lobby). A host leaving a lobby cancels it.
create or replace function ctf_ad_leave(p_student uuid)
returns json language plpgsql security definer set search_path = public as $$
declare me students; d arena_duels;
begin
  me := _ad_me(p_student); if me.id is null then return json_build_object('error','not_yours'); end if;
  select d2.* into d from arena_duels d2 join arena_duel_players p on p.duel_id = d2.id
   where p.student_id = me.id and not p.forfeit and d2.status in ('lobby','live') order by d2.created_at desc limit 1;
  if d.id is null then return json_build_object('ok', true); end if;
  if d.status = 'lobby' then
    if d.host = me.id then update arena_duels set status = 'cancelled', finished_at = now() where id = d.id;
    else delete from arena_duel_players where duel_id = d.id and student_id = me.id; end if;
  else
    update arena_duel_players set forfeit = true where duel_id = d.id and student_id = me.id;
  end if;
  return json_build_object('ok', true);
end $$;

-- the student's current (or just-finished) duel; also the heartbeat
create or replace function ctf_ad_state(p_student uuid)
returns json language plpgsql security definer set search_path = public as $$
declare me students; c classes; d arena_duels;
begin
  me := _ad_me(p_student); if me.id is null then return json_build_object('error','not_yours'); end if;
  select * into c from classes where id = me.class_id;
  perform _ad_tidy(c.id);
  -- idle for 90s during a live duel = forfeit
  update arena_duel_players p set forfeit = true
    from arena_duels x
   where x.id = p.duel_id and x.class_id = c.id and x.status = 'live' and not p.forfeit
     and p.student_id <> me.id and p.last_seen < now() - interval '90 seconds';
  select d2.* into d from arena_duels d2 join arena_duel_players p on p.duel_id = d2.id
   where p.student_id = me.id
     and (d2.status in ('lobby','live') or (d2.status = 'done' and d2.finished_at > now() - interval '3 minutes'))
     and (not p.forfeit or d2.status = 'done')
   order by d2.created_at desc limit 1;
  if d.id is not null then
    update arena_duel_players set last_seen = now() where duel_id = d.id and student_id = me.id;
  end if;
  return json_build_object(
    'duels_on', c.duels_on, 'now', now(), 'me', me.id,
    'duel', case when d.id is null then null else json_build_object(
      'id', d.id, 'code', d.code, 'status', d.status, 'host', d.host, 'modules', d.modules,
      'minutes', d.minutes, 'started_at', d.started_at, 'ends_at', d.ends_at,
      'players', (select coalesce(json_agg(json_build_object(
          'id', p.student_id, 'handle', s.handle, 'points', p.points, 'caps', p.caps,
          'forfeit', p.forfeit, 'won', p.won, 'xp', p.xp,
          'open', _ad_open_count(p.student_id, d.flag_keys)) order by p.points desc, p.joined_at), '[]'::json)
        from arena_duel_players p join students s on s.id = p.student_id where p.duel_id = d.id),
      'feed', (select coalesce(json_agg(json_build_object('handle', s.handle, 'title', k.title, 'pts', k.pts, 'at', k.at, 'bounty', k.bounty, 'eq', to_jsonb(s)->'equipped') order by k.at desc), '[]'::json)
        from (select * from arena_duel_caps where duel_id = d.id order by at desc limit 8) k join students s on s.id = k.student_id)
    ) end);
end $$;

-- ---- teacher -----------------------------------------------------------------
create or replace function ctf_t_ad_set(p_class uuid, p_on boolean)
returns json language plpgsql security definer set search_path = public as $$
begin
  if not _is_teacher() then return json_build_object('error','not_teacher'); end if;
  update classes set duels_on = coalesce(p_on, true) where id = p_class;
  if not coalesce(p_on, true) then
    update arena_duels set status = 'cancelled', finished_at = now() where class_id = p_class and status = 'lobby';
  end if;
  return json_build_object('ok', true, 'on', coalesce(p_on, true));
end $$;

create or replace function ctf_t_ad_live(p_class uuid)
returns json language plpgsql security definer set search_path = public as $$
begin
  if not _is_teacher() then return json_build_object('error','not_teacher'); end if;
  perform _ad_tidy(p_class);
  return json_build_object(
    'on', (select duels_on from classes where id = p_class),
    'duels', (select coalesce(json_agg(row_to_json(t)), '[]'::json) from (
      select d.id, d.code, d.status, d.modules, d.minutes, d.started_at, d.ends_at, d.finished_at,
             (select coalesce(json_agg(json_build_object('handle', s.handle, 'points', p.points, 'forfeit', p.forfeit, 'won', p.won, 'xp', p.xp)
                      order by p.points desc), '[]'::json)
                from arena_duel_players p join students s on s.id = p.student_id where p.duel_id = d.id) as players
        from arena_duels d
       where d.class_id = p_class
         and (d.status in ('lobby','live') or (d.status = 'done' and d.finished_at > now() - interval '1 day'))
       order by d.created_at desc limit 20) t));
end $$;

-- cancels every lobby/live flag duel in the teacher's classes (no XP)
create or replace function ctf_t_ad_end_all()
returns json language plpgsql security definer set search_path = public as $$
declare v_n int;
begin
  if not _is_teacher() then return json_build_object('error','not_teacher'); end if;
  with x as (
    update arena_duels d set status = 'cancelled', finished_at = now()
      from classes c
     where c.id = d.class_id and d.status in ('lobby','live')
       and lower(coalesce(c.owner_email, _email())) = lower(_email())
    returning d.id
  ) select count(*) into v_n from x;
  return json_build_object('ok', true, 'ended', v_n);
end $$;

do $$
declare f text;
begin
  foreach f in array array[
    'ctf_ad_create(uuid,int[],int,text[])', 'ctf_ad_join(uuid,text)', 'ctf_ad_start(uuid)',
    'ctf_ad_leave(uuid)', 'ctf_ad_state(uuid)',
    'ctf_t_ad_set(uuid,boolean)', 'ctf_t_ad_live(uuid)', 'ctf_t_ad_end_all()'
  ] loop
    execute format('revoke all on function %s from public, anon', f);
    execute format('grant execute on function %s to authenticated', f);
  end loop;
  foreach f in array array[
    '_ad_me(uuid)', '_ad_in_quiz(uuid)', '_ad_open_count(uuid,text[])', '_ad_pay(uuid,int,text)',
    '_ad_finish(uuid)', '_ad_tidy(uuid)', '_ad_score()'
  ] loop
    execute format('revoke all on function %s from public, anon, authenticated', f);
  end loop;
end $$;

notify pgrst, 'reload schema';
