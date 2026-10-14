-- © 2026 Robert Reasey, South Fayette School District. Licensed CC BY-NC 4.0 (attribution required, no commercial use). See LICENSE.md.
-- ============================================================================
--  VOCAB DUELS (v23.0)  —  head-to-head vocabulary fights in the course guide's
--  arena (vocab-duel.html for students, vocab-battle.html for the teacher).
--
--  A fight is 2 players racing on the SAME term. The definition shows with
--  the term disguised as a Caesar cipher (shift shown) or as shuffled letter
--  tiles, picked at random each round. First correct answer hits the opponent
--  for 25% (4 hits = KO). A wrong answer costs the guesser 1/3 of a hit
--  (health is stored ×3: 300 hp, hit 75, self-hit 25). A term nobody solves in
--  45 s is swapped for a new one. Answers are checked on the server, and the
--  term itself is never sent to students until it's solved.
--
--  1v1 (kind 'duel'): a student picks modules, gets a 4-letter code, one
--  classmate joins, host starts. Winner +10 XP and +5 for playing; loser +5.
--  Forfeit (Leave) = no XP. Uses the class's Student duels switch (duels_on).
--
--  Class (kind 'class', teacher only): squads (2–4) battle for 5/10/15/20/45
--  min (default 15). Players with vocab-duel.html open are paired at random
--  with someone from a different team; after each KO both get a new opponent.
--  An odd player out waits for the next free opponent. Live pairs get different
--  terms. Team score = KOs ÷ teammates who fought. At the end: +5 XP for
--  everyone who fought, +10 more for the winning team (ties share), MVP = most
--  KOs per team. Players can exit any time (no XP).
--
--  Run AFTER google-auth.sql, teacher-xp.sql, class-groups.sql, squads.sql.
--  Safe to re-run.
-- ============================================================================

create table if not exists vd_sessions (
  id          uuid primary key default gen_random_uuid(),
  class_id    uuid not null references classes(id) on delete cascade,
  course      text not null,
  kind        text not null check (kind in ('duel','class')),
  host        uuid references students(id) on delete cascade,
  code        text,
  modules     int[] not null default '{}',
  pool        jsonb not null,
  minutes     int,
  status      text not null default 'lobby' check (status in ('lobby','live','done','cancelled')),
  created_at  timestamptz not null default now(),
  started_at  timestamptz,
  ends_at     timestamptz,
  finished_at timestamptz,
  created_by  text
);
create index if not exists vd_sessions_class on vd_sessions (class_id, created_at desc);
alter table vd_sessions enable row level security;

create table if not exists vd_players (
  session_id uuid not null references vd_sessions(id) on delete cascade,
  student_id uuid not null references students(id) on delete cascade,
  group_id   uuid,
  joined_at  timestamptz not null default now(),
  last_seen  timestamptz not null default now(),
  left_at    timestamptz,
  fights     int not null default 0,
  wins       int not null default 0,
  xp         int not null default 0,
  mvp        boolean not null default false,
  primary key (session_id, student_id)
);
create index if not exists vd_players_student on vd_players (student_id);
alter table vd_players enable row level security;

create table if not exists vd_teams (
  session_id uuid not null references vd_sessions(id) on delete cascade,
  group_id   uuid not null,
  name       text not null,
  color      text,
  won        boolean not null default false,
  primary key (session_id, group_id)
);
alter table vd_teams enable row level security;

create table if not exists vd_fights (
  id         uuid primary key default gen_random_uuid(),
  session_id uuid not null references vd_sessions(id) on delete cascade,
  p1         uuid not null references students(id) on delete cascade,
  p2         uuid not null references students(id) on delete cascade,
  hp1        int  not null default 300,
  hp2        int  not null default 300,
  n          int  not null default 0,
  term_t     text,
  term_d     text,
  mode       text,
  puzzle     text,
  shift      int,
  term_at    timestamptz,
  used       text[] not null default '{}',
  last_t     text,
  last_by    uuid,
  status     text not null default 'live' check (status in ('live','done')),
  winner     uuid,
  created_at timestamptz not null default now(),
  ended_at   timestamptz
);
create index if not exists vd_fights_session on vd_fights (session_id, status);
create index if not exists vd_fights_p1 on vd_fights (p1, status);
create index if not exists vd_fights_p2 on vd_fights (p2, status);
alter table vd_fights enable row level security;

-- ---- helpers -----------------------------------------------------------------
create or replace function _vd_norm(p text) returns text language sql immutable as $$
  select lower(regexp_replace(coalesce(p,''), '[^A-Za-z0-9]', '', 'g'));
$$;

create or replace function _vd_cipher(p text, k int) returns text language plpgsql immutable as $$
declare o text := ''; ch text; c int; i int;
begin
  for i in 1..coalesce(length(p),0) loop
    ch := substr(p, i, 1); c := ascii(ch);
    if c between 65 and 90 then o := o || chr(65 + (c - 65 + k) % 26);
    elsif c between 97 and 122 then o := o || chr(97 + (c - 97 + k) % 26);
    else o := o || ch; end if;
  end loop;
  return o;
end $$;

create or replace function _vd_shuffle(p text) returns text language plpgsql volatile as $$
declare letters text := regexp_replace(upper(coalesce(p,'')), '[^A-Z0-9]', '', 'g'); s text; i int;
begin
  for i in 1..8 loop
    select string_agg(x, '' order by random()) into s from regexp_split_to_table(letters, '') x;
    exit when length(letters) < 2 or s <> letters;
  end loop;
  return coalesce(s, letters);
end $$;

create or replace function _vd_is_teacher_row(p_email text) returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce(p_email,'') <> ''
     and (lower(p_email) = lower(_teacher_email()) or exists (select 1 from teachers t where t.email = lower(p_email)));
$$;

create or replace function _vd_in_quiz(p_student uuid) returns boolean
language plpgsql stable security definer set search_path = public as $$
declare v boolean := false;
begin
  if to_regclass('public.vocab_quiz_attempts') is null then return false; end if;
  execute 'select exists (select 1 from vocab_quiz_attempts where student_id = $1 and submitted_at is null
             and (deadline is null or deadline + interval ''2 minutes'' > now()))' into v using p_student;
  return coalesce(v, false);
end $$;

create or replace function _vd_pay(p_student uuid, p_amount int, p_reason text) returns void
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
    values (v_class, p_student, 'vocab-duel', p_amount, p_reason);
end $$;

-- cleans a client-sent term list: {t,d}, 3–24 letters/digits, one per term
create or replace function _vd_pool(p jsonb) returns jsonb
language sql immutable as $$
  select coalesce(jsonb_agg(jsonb_build_object('t', t, 'd', d)), '[]'::jsonb) from (
    select distinct on (_vd_norm(e->>'t')) left(btrim(e->>'t'), 40) as t, left(btrim(e->>'d'), 400) as d
      from jsonb_array_elements(case when jsonb_typeof(p) = 'array' then p else '[]'::jsonb end) e
     where length(_vd_norm(e->>'t')) between 3 and 24 and length(btrim(coalesce(e->>'d',''))) > 0
     limit 600
  ) x;
$$;

-- loads the next term into a fight: not the one just played, not one another
-- live pair in the session is on, and not repeated until the pool runs out
create or replace function _vd_new_term(p_fight uuid) returns void
language plpgsql security definer set search_path = public as $$
declare f vd_fights; s vd_sessions; t jsonb; k int; v_used text[];
begin
  select * into f from vd_fights where id = p_fight;
  select * into s from vd_sessions where id = f.session_id;
  v_used := f.used;
  select e into t from jsonb_array_elements(s.pool) e
   where (e->>'t') is distinct from f.term_t and not ((e->>'t') = any(v_used))
     and not exists (select 1 from vd_fights x where x.session_id = s.id and x.status = 'live' and x.id <> f.id and x.term_t = e->>'t')
   order by random() limit 1;
  if t is null then
    v_used := '{}';
    select e into t from jsonb_array_elements(s.pool) e where (e->>'t') is distinct from f.term_t order by random() limit 1;
  end if;
  if t is null then select e into t from jsonb_array_elements(s.pool) e order by random() limit 1; end if;
  k := 1 + floor(random() * 25)::int;
  update vd_fights set
    term_t = t->>'t', term_d = t->>'d', n = n + 1, term_at = now(),
    used = v_used || (t->>'t'),
    mode = case when random() < 0.5 then 'cipher' else 'unscramble' end
   where id = p_fight;
  update vd_fights set
    shift  = case when mode = 'cipher' then k else null end,
    puzzle = case when mode = 'cipher' then _vd_cipher(upper(term_t), k) else _vd_shuffle(term_t) end
   where id = p_fight;
end $$;

create or replace function _vd_finish_duel(p_session uuid) returns void
language plpgsql security definer set search_path = public as $$
declare f vd_fights; p record;
begin
  update vd_sessions set status = 'done', finished_at = now() where id = p_session and status = 'live';
  if not found then return; end if;
  select * into f from vd_fights where session_id = p_session order by created_at desc limit 1;
  for p in select * from vd_players where session_id = p_session and left_at is null loop
    if f.winner = p.student_id then
      update vd_players set xp = 15 where session_id = p_session and student_id = p.student_id;
      perform _vd_pay(p.student_id, 15, 'Vocab duel win (+10) and played (+5)');
    elsif f.winner is not null then
      update vd_players set xp = 5 where session_id = p_session and student_id = p.student_id;
      perform _vd_pay(p.student_id, 5, 'Vocab duel played');
    end if;
  end loop;
end $$;

create or replace function _vd_end_fight(p_fight uuid, p_winner uuid) returns void
language plpgsql security definer set search_path = public as $$
declare f vd_fights; s vd_sessions;
begin
  update vd_fights set status = 'done', winner = p_winner, ended_at = now()
   where id = p_fight and status = 'live' returning * into f;
  if f.id is null then return; end if;
  update vd_players set fights = fights + 1 where session_id = f.session_id and student_id in (f.p1, f.p2);
  if p_winner is not null then
    update vd_players set wins = wins + 1 where session_id = f.session_id and student_id = p_winner;
  end if;
  select * into s from vd_sessions where id = f.session_id;
  if s.kind = 'duel' then perform _vd_finish_duel(s.id); end if;
end $$;

create or replace function _vd_teams(p_session uuid) returns json
language sql stable security definer set search_path = public as $$
  select coalesce(json_agg(row_to_json(t) order by t.avg desc, t.kos desc, t.name), '[]'::json) from (
    select tm.group_id as id, tm.name, tm.color, tm.won,
           coalesce(sum(p.wins),0)::int as kos,
           count(p.student_id)::int as members,
           count(p.student_id) filter (where p.fights > 0)::int as fought,
           coalesce(round(sum(p.wins)::numeric / nullif(count(p.student_id) filter (where p.fights > 0),0), 2), 0) as avg
      from vd_teams tm
      left join vd_players p on p.session_id = tm.session_id and p.group_id = tm.group_id and p.left_at is null
     where tm.session_id = p_session
     group by tm.group_id, tm.name, tm.color, tm.won
  ) t;
$$;

create or replace function _vd_finish_class(p_session uuid, p_award boolean) returns void
language plpgsql security definer set search_path = public as $$
declare s vd_sessions; v_top numeric; p record;
begin
  select * into s from vd_sessions where id = p_session for update;
  if not found or s.status <> 'live' then return; end if;
  update vd_fights set status = 'done', ended_at = now() where session_id = p_session and status = 'live';
  if not p_award then
    update vd_sessions set status = 'cancelled', finished_at = now() where id = p_session; return;
  end if;
  select max(avg) into v_top from json_to_recordset(_vd_teams(p_session)) as x(id uuid, avg numeric);
  if coalesce(v_top,0) > 0 then
    update vd_teams tm set won = true
      from json_to_recordset(_vd_teams(p_session)) as x(id uuid, avg numeric)
     where tm.session_id = p_session and tm.group_id = x.id and x.avg = v_top;
  end if;
  update vd_players p set mvp = true
   where p.session_id = p_session and p.wins > 0 and p.left_at is null
     and p.wins = (select max(q.wins) from vd_players q where q.session_id = p_session and q.group_id = p.group_id and q.left_at is null);
  for p in select pl.student_id, coalesce(tm.won,false) as won from vd_players pl
             left join vd_teams tm on tm.session_id = pl.session_id and tm.group_id = pl.group_id
            where pl.session_id = p_session and pl.fights > 0 and pl.left_at is null loop
    if p.won then
      update vd_players set xp = 15 where session_id = p_session and student_id = p.student_id;
      perform _vd_pay(p.student_id, 15, 'Vocab battle win (+10) and played (+5)');
    else
      update vd_players set xp = 5 where session_id = p_session and student_id = p.student_id;
      perform _vd_pay(p.student_id, 5, 'Vocab battle played');
    end if;
  end loop;
  update vd_sessions set status = 'done', finished_at = now() where id = p_session;
end $$;

-- pairs every free, present player with someone free from a different team
create or replace function _vd_pair(p_session uuid) returns void
language plpgsql security definer set search_path = public as $$
declare a record; b uuid; v_id uuid;
begin
  for a in
    select p.student_id, p.group_id from vd_players p
     where p.session_id = p_session and p.left_at is null and p.last_seen > now() - interval '20 seconds'
     order by random()
  loop
    if exists (select 1 from vd_fights f where f.session_id = p_session and (f.p1 = a.student_id or f.p2 = a.student_id)
                and (f.status = 'live' or f.ended_at > now() - interval '4 seconds')) then continue; end if;
    select p.student_id into b from vd_players p
     where p.session_id = p_session and p.left_at is null and p.last_seen > now() - interval '20 seconds'
       and p.student_id <> a.student_id and p.group_id is distinct from a.group_id
       and not exists (select 1 from vd_fights f where f.session_id = p_session and (f.p1 = p.student_id or f.p2 = p.student_id)
                        and (f.status = 'live' or f.ended_at > now() - interval '4 seconds'))
     order by (select count(*) from vd_fights f where f.session_id = p_session
                and ((f.p1 = a.student_id and f.p2 = p.student_id) or (f.p2 = a.student_id and f.p1 = p.student_id))), random()
     limit 1;
    if b is not null then
      insert into vd_fights (session_id, p1, p2) values (p_session, a.student_id, b) returning id into v_id;
      perform _vd_new_term(v_id);
    end if;
  end loop;
end $$;

create or replace function _vd_tidy(p_session uuid) returns void
language plpgsql security definer set search_path = public as $$
declare s vd_sessions; f record; s1 boolean; s2 boolean;
begin
  if p_session is null then return; end if;
  perform pg_advisory_xact_lock(hashtext('vd:' || p_session::text));
  select * into s from vd_sessions where id = p_session;
  if not found then return; end if;
  if s.status = 'lobby' and s.created_at < now() - interval '15 minutes' then
    update vd_sessions set status = 'cancelled', finished_at = now() where id = s.id; return;
  end if;
  if s.status <> 'live' then return; end if;
  if s.kind = 'class' and now() >= s.ends_at then perform _vd_finish_class(s.id, true); return; end if;
  if s.kind = 'duel' and s.started_at < now() - interval '20 minutes' then
    update vd_fights set status = 'done', ended_at = now() where session_id = s.id and status = 'live';
    update vd_sessions set status = 'cancelled', finished_at = now() where id = s.id; return;
  end if;
  for f in select x.* from vd_fights x where x.session_id = s.id and x.status = 'live' loop
    select (p.left_at is not null or p.last_seen < now() - interval '45 seconds') into s1 from vd_players p where p.session_id = s.id and p.student_id = f.p1;
    select (p.left_at is not null or p.last_seen < now() - interval '45 seconds') into s2 from vd_players p where p.session_id = s.id and p.student_id = f.p2;
    if coalesce(s1,true) and coalesce(s2,true) then perform _vd_end_fight(f.id, null);
    elsif coalesce(s1,true) then perform _vd_end_fight(f.id, f.p2);
    elsif coalesce(s2,true) then perform _vd_end_fight(f.id, f.p1);
    elsif f.term_at < now() - interval '45 seconds' then
      update vd_fights set last_t = term_t, last_by = null where id = f.id;
      perform _vd_new_term(f.id);
    end if;
  end loop;
  if s.kind = 'class' then perform _vd_pair(s.id); end if;
end $$;

create or replace function _vd_class_live(p_class uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from vd_sessions where class_id = p_class and kind = 'class' and status = 'live' and ends_at > now());
$$;

-- the student's current session (lobby/live, or just finished)
create or replace function _vd_my_session(p_student uuid) returns uuid
language sql stable security definer set search_path = public as $$
  select s.id from vd_sessions s join vd_players p on p.session_id = s.id
   where p.student_id = p_student and p.left_at is null
     and (s.status in ('lobby','live') or (s.status = 'done' and s.finished_at > now() - interval '3 minutes'))
   order by (s.status in ('lobby','live')) desc, s.created_at desc limit 1;
$$;

-- ---- student -------------------------------------------------------------------
create or replace function ctf_vd_create(p_student uuid, p_modules int[], p_pool jsonb)
returns json language plpgsql security definer set search_path = public as $$
declare me students; c classes; v_pool jsonb; v_code text; v_id uuid; i int;
begin
  select * into me from students where id = p_student and auth_user_id = auth.uid();
  if me.id is null then return json_build_object('error','not_yours'); end if;
  select * into c from classes where id = me.class_id;
  if not coalesce((to_jsonb(c)->>'duels_on')::boolean, true) then return json_build_object('error','duels_off'); end if;
  if _vd_class_live(c.id) then return json_build_object('error','class_battle_live'); end if;
  if _vd_in_quiz(me.id) then return json_build_object('error','in_quiz'); end if;
  perform _vd_tidy(_vd_my_session(me.id));
  if exists (select 1 from vd_sessions s join vd_players p on p.session_id = s.id
              where p.student_id = me.id and p.left_at is null and s.status in ('lobby','live'))
    then return json_build_object('error','already_in_duel'); end if;
  v_pool := _vd_pool(p_pool);
  if jsonb_array_length(v_pool) < 4 then return json_build_object('error','too_few_terms'); end if;
  for i in 1..30 loop
    v_code := (select string_agg(substr('ABCDEFGHJKLMNPQRSTUVWXYZ', 1 + floor(random()*24)::int, 1), '') from generate_series(1,4));
    exit when not exists (select 1 from vd_sessions where class_id = c.id and code = v_code and status in ('lobby','live'));
  end loop;
  insert into vd_sessions (class_id, course, kind, host, code, modules, pool)
    values (c.id, c.course, 'duel', me.id, v_code, coalesce(p_modules,'{}'), v_pool) returning id into v_id;
  insert into vd_players (session_id, student_id) values (v_id, me.id);
  return json_build_object('ok', true, 'id', v_id, 'code', v_code);
end $$;

create or replace function ctf_vd_join(p_student uuid, p_code text)
returns json language plpgsql security definer set search_path = public as $$
declare me students; s vd_sessions;
begin
  select * into me from students where id = p_student and auth_user_id = auth.uid();
  if me.id is null then return json_build_object('error','not_yours'); end if;
  if _vd_class_live(me.class_id) then return json_build_object('error','class_battle_live'); end if;
  if _vd_in_quiz(me.id) then return json_build_object('error','in_quiz'); end if;
  select * into s from vd_sessions where class_id = me.class_id and kind = 'duel' and code = upper(btrim(coalesce(p_code,'')))
     and status in ('lobby','live') order by created_at desc limit 1;
  if s.id is null then return json_build_object('error','no_duel'); end if;
  if exists (select 1 from vd_players where session_id = s.id and student_id = me.id and left_at is null)
    then return json_build_object('ok', true, 'id', s.id); end if;
  if s.status <> 'lobby' then return json_build_object('error','started'); end if;
  if exists (select 1 from vd_sessions x join vd_players p on p.session_id = x.id
              where p.student_id = me.id and p.left_at is null and x.status in ('lobby','live'))
    then return json_build_object('error','already_in_duel'); end if;
  if (select count(*) from vd_players where session_id = s.id and left_at is null) >= 2
    then return json_build_object('error','full'); end if;
  insert into vd_players (session_id, student_id) values (s.id, me.id)
    on conflict (session_id, student_id) do update set left_at = null, last_seen = now();
  return json_build_object('ok', true, 'id', s.id);
end $$;

create or replace function ctf_vd_start(p_student uuid)
returns json language plpgsql security definer set search_path = public as $$
declare me students; s vd_sessions; v_other uuid; v_id uuid;
begin
  select * into me from students where id = p_student and auth_user_id = auth.uid();
  if me.id is null then return json_build_object('error','not_yours'); end if;
  select * into s from vd_sessions where host = me.id and kind = 'duel' and status = 'lobby' order by created_at desc limit 1 for update;
  if s.id is null then return json_build_object('error','no_lobby'); end if;
  select student_id into v_other from vd_players where session_id = s.id and student_id <> me.id and left_at is null limit 1;
  if v_other is null then return json_build_object('error','need_two'); end if;
  update vd_sessions set status = 'live', started_at = now() where id = s.id;
  update vd_players set last_seen = now() where session_id = s.id;
  insert into vd_fights (session_id, p1, p2) values (s.id, me.id, v_other) returning id into v_id;
  perform _vd_new_term(v_id);
  return json_build_object('ok', true);
end $$;

create or replace function ctf_vd_leave(p_student uuid)
returns json language plpgsql security definer set search_path = public as $$
declare me students; s vd_sessions; f vd_fights;
begin
  select * into me from students where id = p_student and auth_user_id = auth.uid();
  if me.id is null then return json_build_object('error','not_yours'); end if;
  select * into s from vd_sessions where id = _vd_my_session(me.id);
  if s.id is null or s.status not in ('lobby','live') then return json_build_object('ok', true); end if;
  perform pg_advisory_xact_lock(hashtext('vd:' || s.id::text));
  if s.status = 'lobby' then
    if s.host = me.id then update vd_sessions set status = 'cancelled', finished_at = now() where id = s.id;
    else delete from vd_players where session_id = s.id and student_id = me.id; end if;
    return json_build_object('ok', true);
  end if;
  update vd_players set left_at = now() where session_id = s.id and student_id = me.id;
  select * into f from vd_fights where session_id = s.id and status = 'live' and (p1 = me.id or p2 = me.id) limit 1;
  if f.id is not null then perform _vd_end_fight(f.id, case when f.p1 = me.id then f.p2 else f.p1 end); end if;
  return json_build_object('ok', true);
end $$;

create or replace function ctf_vd_answer(p_student uuid, p_fight uuid, p_n int, p_guess text)
returns json language plpgsql security definer set search_path = public as $$
declare me students; f vd_fights; s vd_sessions; v_opp uuid; v_mine boolean; v_hp int;
begin
  select * into me from students where id = p_student and auth_user_id = auth.uid();
  if me.id is null then return json_build_object('error','not_yours'); end if;
  select * into f from vd_fights where id = p_fight;
  if f.id is null or (f.p1 <> me.id and f.p2 <> me.id) then return json_build_object('error','not_your_fight'); end if;
  perform pg_advisory_xact_lock(hashtext('vd:' || f.session_id::text));
  select * into f from vd_fights where id = p_fight;
  select * into s from vd_sessions where id = f.session_id;
  if f.status <> 'live' or s.status <> 'live' or (s.kind = 'class' and now() >= s.ends_at) then return json_build_object('error','over'); end if;
  if f.n <> p_n then return json_build_object('stale', true); end if;
  if _vd_norm(p_guess) = '' then return json_build_object('error','empty'); end if;
  update vd_players set last_seen = now() where session_id = s.id and student_id = me.id;
  v_mine := f.p1 = me.id; v_opp := case when v_mine then f.p2 else f.p1 end;
  if _vd_norm(p_guess) = _vd_norm(f.term_t) then
    if v_mine then update vd_fights set hp2 = greatest(0, hp2 - 75), last_t = term_t, last_by = me.id where id = f.id returning hp2 into v_hp;
    else update vd_fights set hp1 = greatest(0, hp1 - 75), last_t = term_t, last_by = me.id where id = f.id returning hp1 into v_hp; end if;
    if v_hp <= 0 then perform _vd_end_fight(f.id, me.id); else perform _vd_new_term(f.id); end if;
    return json_build_object('correct', true, 'term', f.term_t, 'ko', v_hp <= 0);
  end if;
  if v_mine then update vd_fights set hp1 = greatest(0, hp1 - 25) where id = f.id returning hp1 into v_hp;
  else update vd_fights set hp2 = greatest(0, hp2 - 25) where id = f.id returning hp2 into v_hp; end if;
  if v_hp <= 0 then perform _vd_end_fight(f.id, v_opp); end if;
  return json_build_object('correct', false, 'ko', v_hp <= 0);
end $$;

-- everything the student page needs; also the heartbeat
create or replace function ctf_vd_state(p_student uuid)
returns json language plpgsql security definer set search_path = public as $$
declare me students; c classes; s vd_sessions; f vd_fights; v_sid uuid; mine vd_players; v_me boolean;
begin
  select * into me from students where id = p_student and auth_user_id = auth.uid();
  if me.id is null then return json_build_object('error','not_yours'); end if;
  select * into c from classes where id = me.class_id;
  v_sid := _vd_my_session(me.id);
  if v_sid is not null then
    update vd_players set last_seen = now() where session_id = v_sid and student_id = me.id;
    perform _vd_tidy(v_sid);
    v_sid := _vd_my_session(me.id);
  end if;
  select * into s from vd_sessions where id = v_sid;
  if s.id is not null then
    select * into mine from vd_players where session_id = s.id and student_id = me.id;
    select * into f from vd_fights where session_id = s.id and (p1 = me.id or p2 = me.id)
       and (status = 'live' or ended_at > now() - interval '6 seconds')
     order by (status = 'live') desc, created_at desc limit 1;
  end if;
  v_me := f.p1 = me.id;
  return json_build_object(
    'now', now(), 'me', me.id, 'handle', me.handle,
    'duels_on', coalesce((to_jsonb(c)->>'duels_on')::boolean, true),
    'class_live', _vd_class_live(c.id),
    'session', case when s.id is null then null else json_build_object(
      'id', s.id, 'kind', s.kind, 'code', s.code, 'status', s.status, 'host', s.host, 'modules', s.modules,
      'minutes', s.minutes, 'ends_at', s.ends_at, 'my_team', mine.group_id,
      'my', json_build_object('fights', mine.fights, 'wins', mine.wins, 'xp', mine.xp, 'mvp', mine.mvp),
      'players', (select coalesce(json_agg(json_build_object('id', p.student_id, 'handle', st.handle) order by p.joined_at), '[]'::json)
                    from vd_players p join students st on st.id = p.student_id where p.session_id = s.id and p.left_at is null and s.kind = 'duel'),
      'teams', case when s.kind = 'class' then _vd_teams(s.id) else '[]'::json end,
      'mvps', case when s.kind = 'class' and s.status = 'done' then (select coalesce(json_agg(json_build_object('team', p.group_id, 'handle', st.handle, 'wins', p.wins)), '[]'::json)
                from vd_players p join students st on st.id = p.student_id where p.session_id = s.id and p.mvp) else '[]'::json end,
      'winner_handle', case when s.kind = 'duel' and s.status = 'done' then (select st.handle from vd_fights x join students st on st.id = x.winner where x.session_id = s.id order by x.created_at desc limit 1) end
    ) end,
    'fight', case when f.id is null then null else json_build_object(
      'id', f.id, 'n', f.n, 'status', f.status,
      'my_hp', case when v_me then f.hp1 else f.hp2 end, 'opp_hp', case when v_me then f.hp2 else f.hp1 end,
      'opp', (select handle from students where id = case when v_me then f.p2 else f.p1 end),
      'def', f.term_d, 'mode', f.mode, 'puzzle', f.puzzle, 'shift', f.shift, 'term_at', f.term_at,
      'len', length(_vd_norm(f.term_t)),
      'last_t', f.last_t, 'last_mine', f.last_by = me.id, 'last_n', f.n - 1,
      'won', case when f.status = 'done' then f.winner = me.id end
    ) end
  );
end $$;

-- ---- teacher -------------------------------------------------------------------
create or replace function ctf_t_vd_setup(p_class uuid)
returns json language plpgsql security definer set search_path = public as $$
declare v_sid uuid;
begin
  if not _is_teacher() then return json_build_object('error','not_teacher'); end if;
  select id into v_sid from vd_sessions where class_id = p_class and kind = 'class' order by created_at desc limit 1;
  perform _vd_tidy(v_sid);
  return json_build_object(
    'teams', (select coalesce(json_agg(row_to_json(t) order by t.sort, t.name), '[]'::json) from (
      select g.id, g.name, g.color, g.sort,
             (select count(*) from students s where s.group_id = g.id and not _vd_is_teacher_row(s.email))::int as members
        from class_groups g where g.class_id = p_class) t),
    'ungrouped', (select coalesce(json_agg(s.handle order by s.handle), '[]'::json) from students s
                   where s.class_id = p_class and s.group_id is null and not _vd_is_teacher_row(s.email)));
end $$;

create or replace function ctf_t_vd_start(p_class uuid, p_modules int[], p_pool jsonb, p_minutes int)
returns json language plpgsql security definer set search_path = public as $$
declare c classes; v_pool jsonb; v_un int; v_teams int; v_id uuid; v_min int := coalesce(p_minutes, 15);
begin
  if not _is_teacher() then return json_build_object('error','not_teacher'); end if;
  select * into c from classes where id = p_class;
  if not found then return json_build_object('error','no_class'); end if;
  if _vd_class_live(p_class) then return json_build_object('error','battle_live'); end if;
  if v_min not in (5,10,15,20,45) then return json_build_object('error','bad_minutes'); end if;
  v_pool := _vd_pool(p_pool);
  if jsonb_array_length(v_pool) < 4 then return json_build_object('error','too_few_terms'); end if;
  select count(*) into v_un from students where class_id = p_class and group_id is null and not _vd_is_teacher_row(email);
  if v_un > 0 then return json_build_object('error','ungrouped', 'count', v_un); end if;
  select count(distinct group_id) into v_teams from students where class_id = p_class and group_id is not null and not _vd_is_teacher_row(email);
  if v_teams < 2 then return json_build_object('error','need_two_teams'); end if;
  if v_teams > 4 then return json_build_object('error','too_many_teams'); end if;
  update classes set squads_on = true where id = p_class;
  -- student 1v1 vocab duels in this class end (no XP)
  update vd_fights f set status = 'done', ended_at = now() from vd_sessions s
   where s.id = f.session_id and s.class_id = p_class and s.kind = 'duel' and s.status in ('lobby','live') and f.status = 'live';
  update vd_sessions set status = 'cancelled', finished_at = now() where class_id = p_class and kind = 'duel' and status in ('lobby','live');
  insert into vd_sessions (class_id, course, kind, modules, pool, minutes, status, started_at, ends_at, created_by)
    values (p_class, c.course, 'class', coalesce(p_modules,'{}'), v_pool, v_min, 'live', now(), now() + make_interval(mins => v_min), lower(coalesce(_email(),'')))
    returning id into v_id;
  insert into vd_teams (session_id, group_id, name, color)
    select v_id, g.id, g.name, g.color from class_groups g
     where g.class_id = p_class and exists (select 1 from students s where s.group_id = g.id and not _vd_is_teacher_row(s.email));
  insert into vd_players (session_id, student_id, group_id, last_seen)
    select v_id, s.id, s.group_id, 'epoch'::timestamptz from students s
     where s.class_id = p_class and s.group_id is not null and not _vd_is_teacher_row(s.email);
  return json_build_object('ok', true, 'id', v_id);
end $$;

create or replace function ctf_t_vd_end(p_session uuid, p_award boolean default true)
returns json language plpgsql security definer set search_path = public as $$
begin
  if not _is_teacher() then return json_build_object('error','not_teacher'); end if;
  perform pg_advisory_xact_lock(hashtext('vd:' || p_session::text));
  perform _vd_finish_class(p_session, coalesce(p_award, true));
  return json_build_object('ok', true);
end $$;

-- projector view: teams, live pairs (health only, never the term), KO feed, leaders
create or replace function ctf_t_vd_state(p_class uuid)
returns json language plpgsql security definer set search_path = public as $$
declare s vd_sessions;
begin
  if not _is_teacher() then return json_build_object('error','not_teacher'); end if;
  select * into s from vd_sessions where class_id = p_class and kind = 'class' order by created_at desc limit 1;
  if s.id is not null then perform _vd_tidy(s.id); select * into s from vd_sessions where id = s.id; end if;
  if s.id is null then return json_build_object('now', now(), 'session', null); end if;
  return json_build_object('now', now(), 'session', json_build_object(
    'id', s.id, 'status', s.status, 'modules', s.modules, 'minutes', s.minutes, 'ends_at', s.ends_at, 'finished_at', s.finished_at,
    'teams', _vd_teams(s.id),
    'present', (select count(*) from vd_players where session_id = s.id and left_at is null and last_seen > now() - interval '20 seconds')::int,
    'fights', (select coalesce(json_agg(json_build_object(
                  'a', a.handle, 'b', b.handle, 'ta', pa.group_id, 'tb', pb.group_id, 'hpa', f.hp1, 'hpb', f.hp2) order by f.created_at), '[]'::json)
               from vd_fights f join students a on a.id = f.p1 join students b on b.id = f.p2
               join vd_players pa on pa.session_id = s.id and pa.student_id = f.p1
               join vd_players pb on pb.session_id = s.id and pb.student_id = f.p2
              where f.session_id = s.id and f.status = 'live'),
    'feed', (select coalesce(json_agg(row_to_json(k) order by k.at desc), '[]'::json) from (
               select w.handle as winner, l.handle as loser, pw.group_id as team, f.ended_at as at
                 from vd_fights f join students w on w.id = f.winner
                 join students l on l.id = case when f.winner = f.p1 then f.p2 else f.p1 end
                 join vd_players pw on pw.session_id = s.id and pw.student_id = f.winner
                where f.session_id = s.id and f.winner is not null order by f.ended_at desc limit 10) k),
    'leaders', (select coalesce(json_agg(row_to_json(k)), '[]'::json) from (
               select st.handle, p.group_id as team, p.wins, p.fights, p.mvp, p.xp, p.left_at is not null as left
                 from vd_players p join students st on st.id = p.student_id
                where p.session_id = s.id and p.fights > 0 order by p.wins desc, p.fights, st.handle limit 12) k)
  ));
end $$;

create or replace function ctf_t_vd_end_all()
returns json language plpgsql security definer set search_path = public as $$
declare v_n int := 0; r record;
begin
  if not _is_teacher() then return json_build_object('error','not_teacher'); end if;
  for r in select s.id, s.kind from vd_sessions s join classes c on c.id = s.class_id
            where s.status in ('lobby','live') and lower(coalesce(c.owner_email, _email())) = lower(_email()) loop
    if r.kind = 'class' then perform _vd_finish_class(r.id, false);
    else
      update vd_fights set status = 'done', ended_at = now() where session_id = r.id and status = 'live';
      update vd_sessions set status = 'cancelled', finished_at = now() where id = r.id;
    end if;
    v_n := v_n + 1;
  end loop;
  return json_build_object('ok', true, 'ended', v_n);
end $$;

do $$
declare f text;
begin
  foreach f in array array[
    'ctf_vd_create(uuid,int[],jsonb)', 'ctf_vd_join(uuid,text)', 'ctf_vd_start(uuid)', 'ctf_vd_leave(uuid)',
    'ctf_vd_answer(uuid,uuid,int,text)', 'ctf_vd_state(uuid)',
    'ctf_t_vd_setup(uuid)', 'ctf_t_vd_start(uuid,int[],jsonb,int)', 'ctf_t_vd_end(uuid,boolean)',
    'ctf_t_vd_state(uuid)', 'ctf_t_vd_end_all()'
  ] loop
    execute format('revoke all on function %s from public, anon', f);
    execute format('grant execute on function %s to authenticated', f);
  end loop;
  foreach f in array array[
    '_vd_is_teacher_row(text)', '_vd_in_quiz(uuid)', '_vd_pay(uuid,int,text)', '_vd_new_term(uuid)',
    '_vd_finish_duel(uuid)', '_vd_end_fight(uuid,uuid)', '_vd_teams(uuid)', '_vd_finish_class(uuid,boolean)',
    '_vd_pair(uuid)', '_vd_tidy(uuid)', '_vd_class_live(uuid)', '_vd_my_session(uuid)'
  ] loop
    execute format('revoke all on function %s from public, anon, authenticated', f);
  end loop;
end $$;

notify pgrst, 'reload schema';
