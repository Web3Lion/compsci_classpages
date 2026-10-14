-- © 2026 Robert Reasey, South Fayette School District. Licensed CC BY-NC 4.0 (attribution required, no commercial use). See LICENSE.md.
-- ============================================================================
--  TEAM BATTLES (v22.0)  —  the teacher pits the class's squads against each
--  other in the CTF arena. Teacher-only: students can't start, join or change one.
--
--  Teams are the class's existing groups (class_groups / Squads), 2–4 of them.
--  The teacher picks modules and a length (5/10/15/20/45 min, or no clock and
--  ends it by hand). Starting a battle switches Squads on for the class, ends
--  any student Flag Duels in that class, and blocks new ones until it finishes.
--  Every student (except teacher rows) must be in a team, or the start is refused.
--
--  Scoring: a capture of a flag in those modules during the battle earns duel
--  points (Easy 1 / Medium 2 / Hard 3), counted by a trigger on flag_events, so
--  only flags the student had never captured count. Team score = team points
--  ÷ members who captured at least one flag ("played"), so team size doesn't
--  decide it.
--
--  At the end: each player who played gets +5 XP, players on the top team
--  (ties share) get +10 more, and each team's top scorer is its MVP.
--  Flag keys come from module_manifest (published by teacher.html).
--
--  Run AFTER class-groups.sql, squads.sql, teacher-xp.sql, module-clears.sql,
--  arena-duels.sql. Safe to re-run.
-- ============================================================================

create table if not exists team_battles (
  id          uuid primary key default gen_random_uuid(),
  class_id    uuid not null references classes(id) on delete cascade,
  course      text not null,
  modules     int[] not null,
  flag_keys   text[] not null,
  minutes     int,                 -- 22.1: always set (default 15); older rows may be null
  status      text not null default 'live' check (status in ('live','done','cancelled')),
  started_at  timestamptz not null default now(),
  ends_at     timestamptz,
  finished_at timestamptz,
  created_by  text
);
create index if not exists team_battles_class on team_battles (class_id, started_at desc);
alter table team_battles enable row level security;

create table if not exists team_battle_teams (
  battle_id uuid not null references team_battles(id) on delete cascade,
  group_id  uuid not null,
  name      text not null,
  color     text,
  won       boolean not null default false,
  primary key (battle_id, group_id)
);
alter table team_battle_teams enable row level security;

create table if not exists team_battle_players (
  battle_id  uuid not null references team_battles(id) on delete cascade,
  student_id uuid not null references students(id) on delete cascade,
  group_id   uuid not null,
  points     int  not null default 0,
  caps       int  not null default 0,
  xp         int  not null default 0,
  mvp        boolean not null default false,
  primary key (battle_id, student_id)
);
create index if not exists team_battle_players_student on team_battle_players (student_id);
-- 22.1: a player can exit any time; they stop scoring, don't count toward the average, and get no XP
alter table team_battle_players add column if not exists left_at timestamptz;
alter table team_battle_players enable row level security;

create table if not exists team_battle_caps (
  battle_id  uuid not null references team_battles(id) on delete cascade,
  student_id uuid not null references students(id) on delete cascade,
  flag_key   text not null,
  title      text,
  pts        int  not null,
  at         timestamptz not null default now(),
  primary key (battle_id, student_id, flag_key)
);
alter table team_battle_caps enable row level security;

-- ---- helpers -----------------------------------------------------------------
create or replace function _tb_is_teacher_row(p_email text) returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce(p_email,'') <> ''
     and (lower(p_email) = lower(_teacher_email()) or exists (select 1 from teachers t where t.email = lower(p_email)));
$$;

create or replace function _tb_pay(p_student uuid, p_amount int, p_reason text) returns void
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
    values (v_class, p_student, 'team-battle', p_amount, p_reason);
end $$;

-- team standings: avg = points / players who captured at least one flag
create or replace function _tb_teams(p_battle uuid) returns json
language sql stable security definer set search_path = public as $$
  select coalesce(json_agg(row_to_json(t) order by t.avg desc, t.total desc, t.name), '[]'::json) from (
    select tm.group_id as id, tm.name, tm.color, tm.won,
           coalesce(sum(p.points),0)::int as total,
           count(p.student_id)::int as members,
           count(p.student_id) filter (where p.caps > 0)::int as played,
           coalesce(round(sum(p.points)::numeric / nullif(count(p.student_id) filter (where p.caps > 0),0), 2), 0) as avg
      from team_battle_teams tm
      left join team_battle_players p on p.battle_id = tm.battle_id and p.group_id = tm.group_id and p.left_at is null
     where tm.battle_id = p_battle
     group by tm.group_id, tm.name, tm.color, tm.won
  ) t;
$$;

create or replace function _tb_finish(p_battle uuid, p_award boolean default true) returns void
language plpgsql security definer set search_path = public as $$
declare b team_battles; v_top numeric; t record; p record;
begin
  select * into b from team_battles where id = p_battle for update;
  if not found or b.status <> 'live' then return; end if;
  if not p_award then
    update team_battles set status = 'cancelled', finished_at = now() where id = p_battle; return;
  end if;
  select max(avg) into v_top from json_to_recordset(_tb_teams(p_battle)) as x(id uuid, avg numeric);
  if coalesce(v_top,0) > 0 then
    update team_battle_teams tm set won = true
      from json_to_recordset(_tb_teams(p_battle)) as x(id uuid, avg numeric)
     where tm.battle_id = p_battle and tm.group_id = x.id and x.avg = v_top;
  end if;
  -- MVP: top points on each team (ties share), only if they scored
  update team_battle_players p set mvp = true
   where p.battle_id = p_battle and p.points > 0 and p.left_at is null
     and p.points = (select max(q.points) from team_battle_players q where q.battle_id = p_battle and q.group_id = p.group_id and q.left_at is null);
  for p in select pl.*, tm.won from team_battle_players pl join team_battle_teams tm on tm.battle_id = pl.battle_id and tm.group_id = pl.group_id
            where pl.battle_id = p_battle and pl.caps > 0 and pl.left_at is null loop
    if p.won then
      update team_battle_players set xp = 15 where battle_id = p_battle and student_id = p.student_id;
      perform _tb_pay(p.student_id, 15, 'Team battle win (+10) and played (+5)');
    else
      update team_battle_players set xp = 5 where battle_id = p_battle and student_id = p.student_id;
      perform _tb_pay(p.student_id, 5, 'Team battle played');
    end if;
  end loop;
  update team_battles set status = 'done', finished_at = now() where id = p_battle;
end $$;

create or replace function _tb_tidy(p_class uuid) returns void
language plpgsql security definer set search_path = public as $$
declare r record;
begin
  for r in select id from team_battles where class_id = p_class and status = 'live' and ends_at is not null and ends_at <= now() loop
    perform _tb_finish(r.id, true);
  end loop;
  -- a no-clock battle nobody ended is cancelled after 2 hours
  update team_battles set status = 'cancelled', finished_at = now()
   where class_id = p_class and status = 'live' and ends_at is null and started_at < now() - interval '2 hours';
end $$;

-- ---- scoring -----------------------------------------------------------------
create or replace function _tb_score() returns trigger
language plpgsql security definer set search_path = public as $$
declare v_pts int; r record;
begin
  v_pts := case lower(coalesce(new.level,'')) when 'hard' then 3 when 'medium' then 2 else 1 end;
  for r in
    select b.id from team_battles b join team_battle_players p on p.battle_id = b.id
     where p.student_id = new.student_id and b.status = 'live' and p.left_at is null
       and (b.ends_at is null or now() < b.ends_at) and new.flag_key = any(b.flag_keys)
  loop
    insert into team_battle_caps (battle_id, student_id, flag_key, title, pts)
      values (r.id, new.student_id, new.flag_key, left(coalesce(new.title,''),120), v_pts)
      on conflict do nothing;
    if found then
      update team_battle_players set points = points + v_pts, caps = caps + 1
       where battle_id = r.id and student_id = new.student_id;
    end if;
  end loop;
  return new;
end $$;
drop trigger if exists team_battle_score on flag_events;
create trigger team_battle_score after insert on flag_events
  for each row execute function _tb_score();

-- ---- Flag Duels pause while a battle is live --------------------------------
create or replace function _tb_live(p_class uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from team_battles where class_id = p_class and status = 'live'
                  and (ends_at is null or ends_at > now()));
$$;
create or replace function _tb_block_duels() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if _tb_live(new.class_id) then raise exception 'team_battle_live'; end if;
  return new;
end $$;
do $$
begin
  if to_regclass('public.arena_duels') is not null then
    execute 'drop trigger if exists team_battle_no_duels on arena_duels';
    execute 'create trigger team_battle_no_duels before insert on arena_duels for each row execute function _tb_block_duels()';
  end if;
end $$;

-- ---- teacher -----------------------------------------------------------------
-- teams, who is ungrouped, and the live (or most recent) battle
create or replace function ctf_t_tb_setup(p_class uuid)
returns json language plpgsql security definer set search_path = public as $$
begin
  if not _is_teacher() then return json_build_object('error','not_teacher'); end if;
  perform _tb_tidy(p_class);
  return json_build_object(
    'squads_on', (select coalesce(squads_on,false) from classes where id = p_class),
    'teams', (select coalesce(json_agg(row_to_json(t) order by t.sort, t.name), '[]'::json) from (
      select g.id, g.name, g.color, g.sort,
             (select count(*) from students s where s.group_id = g.id and not _tb_is_teacher_row(s.email))::int as members
        from class_groups g where g.class_id = p_class) t),
    'ungrouped', (select coalesce(json_agg(s.handle order by s.handle), '[]'::json) from students s
                   where s.class_id = p_class and s.group_id is null and not _tb_is_teacher_row(s.email)),
    'battle', (select row_to_json(b) from (select id, status, modules, minutes, started_at, ends_at, finished_at
                 from team_battles where class_id = p_class order by started_at desc limit 1) b),
    'manifest', (select coalesce(json_agg(json_build_object('module', module, 'flags', cardinality(flag_keys)) order by module), '[]'::json)
                   from module_manifest where course = (select course from classes where id = p_class))
  );
end $$;

-- deals every student into p_n teams at random (creates "Team A".."Team D" if
-- the class has fewer groups). Students in any other group are moved too.
create or replace function ctf_t_tb_randomize(p_class uuid, p_n int)
returns json language plpgsql security definer set search_path = public as $$
declare v_n int := greatest(2, least(4, coalesce(p_n,2))); v_ids uuid[]; v_have int; i int; r record; k int := 0;
  v_names text[] := array['Team A','Team B','Team C','Team D']; v_cols text[] := array['#3a86ff','#ff5d73','#2ec27e','#f4a300'];
begin
  if not _is_teacher() then return json_build_object('error','not_teacher'); end if;
  if _tb_live(p_class) then return json_build_object('error','battle_live'); end if;
  select array_agg(id order by sort, name) into v_ids from class_groups where class_id = p_class;
  v_have := coalesce(cardinality(v_ids), 0);
  for i in (v_have + 1)..v_n loop
    insert into class_groups (class_id, name, color, sort)
      values (p_class, coalesce((select n from unnest(v_names) n where not exists
                 (select 1 from class_groups g where g.class_id = p_class and lower(g.name) = lower(n)) limit 1), 'Team ' || i || ' ' || substr(md5(random()::text),1,3)),
              v_cols[i], i)
      returning id into r;
    v_ids := coalesce(v_ids, '{}') || r.id;
  end loop;
  v_ids := v_ids[1:v_n];
  for r in select id from students where class_id = p_class and not _tb_is_teacher_row(email) order by random() loop
    update students set group_id = v_ids[(k % v_n) + 1] where id = r.id;
    k := k + 1;
  end loop;
  return json_build_object('ok', true, 'teams', v_n, 'students', k);
end $$;

create or replace function ctf_t_tb_start(p_class uuid, p_modules int[], p_minutes int)
returns json language plpgsql security definer set search_path = public as $$
declare c classes; v_keys text[]; v_teams int; v_un int; v_id uuid;
begin
  if not _is_teacher() then return json_build_object('error','not_teacher'); end if;
  select * into c from classes where id = p_class;
  if not found then return json_build_object('error','no_class'); end if;
  perform _tb_tidy(p_class);
  if _tb_live(p_class) then return json_build_object('error','battle_live'); end if;
  -- 22.1: every battle has a clock; no length given = 15 minutes
  p_minutes := coalesce(p_minutes, 15);
  if p_minutes not in (5,10,15,20,45) then return json_build_object('error','bad_minutes'); end if;
  if coalesce(cardinality(p_modules),0) = 0 then return json_build_object('error','no_modules'); end if;
  select coalesce(array_agg(k), '{}') into v_keys
    from module_manifest m, unnest(m.flag_keys) k where m.course = c.course and m.module = any(p_modules);
  if cardinality(v_keys) = 0 then return json_build_object('error','no_manifest'); end if;
  select count(*) into v_un from students where class_id = p_class and group_id is null and not _tb_is_teacher_row(email);
  if v_un > 0 then return json_build_object('error','ungrouped', 'count', v_un); end if;
  select count(distinct group_id) into v_teams from students where class_id = p_class and group_id is not null and not _tb_is_teacher_row(email);
  if v_teams < 2 then return json_build_object('error','need_two_teams'); end if;
  if v_teams > 4 then return json_build_object('error','too_many_teams', 'count', v_teams); end if;

  update classes set squads_on = true where id = p_class;
  if to_regclass('public.arena_duels') is not null then
    execute 'update arena_duels set status = ''cancelled'', finished_at = now() where class_id = $1 and status in (''lobby'',''live'')' using p_class;
  end if;
  insert into team_battles (class_id, course, modules, flag_keys, minutes, ends_at, created_by)
    values (p_class, c.course, p_modules, v_keys, p_minutes,
            now() + make_interval(mins => p_minutes), lower(coalesce(_email(),'')))
    returning id into v_id;
  insert into team_battle_teams (battle_id, group_id, name, color)
    select v_id, g.id, g.name, g.color from class_groups g
     where g.class_id = p_class and exists (select 1 from students s where s.group_id = g.id and not _tb_is_teacher_row(s.email));
  insert into team_battle_players (battle_id, student_id, group_id)
    select v_id, s.id, s.group_id from students s
     where s.class_id = p_class and s.group_id is not null and not _tb_is_teacher_row(s.email);
  return json_build_object('ok', true, 'id', v_id);
end $$;

create or replace function ctf_t_tb_end(p_battle uuid, p_award boolean default true)
returns json language plpgsql security definer set search_path = public as $$
begin
  if not _is_teacher() then return json_build_object('error','not_teacher'); end if;
  update team_battles set ends_at = least(coalesce(ends_at, now()), now()) where id = p_battle and status = 'live';
  perform _tb_finish(p_battle, coalesce(p_award, true));
  return json_build_object('ok', true);
end $$;

-- full projector view (teacher): teams, every player, live feed
create or replace function ctf_t_tb_state(p_class uuid)
returns json language plpgsql security definer set search_path = public as $$
declare b team_battles;
begin
  if not _is_teacher() then return json_build_object('error','not_teacher'); end if;
  perform _tb_tidy(p_class);
  select * into b from team_battles where class_id = p_class order by started_at desc limit 1;
  if b.id is null then return json_build_object('now', now(), 'battle', null); end if;
  return json_build_object('now', now(), 'battle', json_build_object(
    'id', b.id, 'status', b.status, 'modules', b.modules, 'minutes', b.minutes,
    'started_at', b.started_at, 'ends_at', b.ends_at, 'finished_at', b.finished_at,
    'teams', _tb_teams(b.id),
    'players', (select coalesce(json_agg(json_build_object('team', p.group_id, 'handle', s.handle, 'points', p.points,
                  'caps', p.caps, 'mvp', p.mvp, 'xp', p.xp, 'left', p.left_at is not null) order by (p.left_at is null) desc, p.points desc, s.handle), '[]'::json)
                from team_battle_players p join students s on s.id = p.student_id where p.battle_id = b.id),
    'feed', (select coalesce(json_agg(json_build_object('team', p.group_id, 'handle', s.handle, 'title', k.title, 'pts', k.pts, 'at', k.at) order by k.at desc), '[]'::json)
             from (select * from team_battle_caps where battle_id = b.id order by at desc limit 12) k
             join students s on s.id = k.student_id join team_battle_players p on p.battle_id = b.id and p.student_id = k.student_id)
  ));
end $$;

-- ---- student: the arena bar (team totals only; own points; MVP names at the end)
create or replace function ctf_tb_state(p_student uuid)
returns json language plpgsql security definer set search_path = public as $$
declare me students; b team_battles; mine team_battle_players;
begin
  select * into me from students where id = p_student and auth_user_id = auth.uid();
  if me.id is null then return json_build_object('error','not_yours'); end if;
  perform _tb_tidy(me.class_id);
  select b2.* into b from team_battles b2 join team_battle_players p on p.battle_id = b2.id
   where p.student_id = me.id and p.left_at is null
     and (b2.status = 'live' or (b2.status = 'done' and b2.finished_at > now() - interval '3 minutes'))
   order by b2.started_at desc limit 1;
  if b.id is null then return json_build_object('now', now(), 'battle', null); end if;
  select * into mine from team_battle_players where battle_id = b.id and student_id = me.id;
  return json_build_object('now', now(), 'battle', json_build_object(
    'id', b.id, 'status', b.status, 'modules', b.modules, 'minutes', b.minutes, 'ends_at', b.ends_at,
    'teams', _tb_teams(b.id), 'my_team', mine.group_id,
    'me', json_build_object('points', mine.points, 'caps', mine.caps, 'xp', mine.xp, 'mvp', mine.mvp),
    'mvps', case when b.status = 'done' then (select coalesce(json_agg(json_build_object('team', p.group_id, 'handle', s.handle, 'points', p.points)), '[]'::json)
              from team_battle_players p join students s on s.id = p.student_id where p.battle_id = b.id and p.mvp) else '[]'::json end
  ));
end $$;

-- ---- student: exit the battle any time ------------------------------------
create or replace function ctf_tb_leave(p_student uuid)
returns json language plpgsql security definer set search_path = public as $$
declare me students;
begin
  select * into me from students where id = p_student and auth_user_id = auth.uid();
  if me.id is null then return json_build_object('error','not_yours'); end if;
  update team_battle_players p set left_at = now()
    from team_battles b
   where b.id = p.battle_id and b.status = 'live' and p.student_id = me.id and p.left_at is null;
  return json_build_object('ok', true);
end $$;

do $$
declare f text;
begin
  foreach f in array array[
    'ctf_tb_leave(uuid)',
    'ctf_t_tb_setup(uuid)', 'ctf_t_tb_randomize(uuid,int)', 'ctf_t_tb_start(uuid,int[],int)',
    'ctf_t_tb_end(uuid,boolean)', 'ctf_t_tb_state(uuid)', 'ctf_tb_state(uuid)'
  ] loop
    execute format('revoke all on function %s from public, anon', f);
    execute format('grant execute on function %s to authenticated', f);
  end loop;
  foreach f in array array[
    '_tb_is_teacher_row(text)', '_tb_pay(uuid,int,text)', '_tb_teams(uuid)', '_tb_finish(uuid,boolean)',
    '_tb_tidy(uuid)', '_tb_score()', '_tb_live(uuid)', '_tb_block_duels()'
  ] loop
    execute format('revoke all on function %s from public, anon, authenticated', f);
  end loop;
end $$;

notify pgrst, 'reload schema';
