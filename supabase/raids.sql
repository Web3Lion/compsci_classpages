-- © 2026 Robert Reasey, South Fayette School District. Licensed CC BY-NC 4.0 (attribution required, no commercial use). See LICENSE.md.
-- ============================================================================
--  CLASS BOSS RAID (v28.0)
--  The whole class fights one boss (the course guide: NEMESIS / ADA / ORACLE…).
--  Every student gets their OWN vocab puzzle (no shouting answers); a correct
--  answer damages the boss, a wrong one lets the boss hit the class's shared
--  shield. Boss HP is set by the teacher. Shield 0 or clock out = raid lost.
--    Phase 1 (>66% hp): teacher's puzzle types, 45 s per term
--    Phase 2 (33–66%):  30 s per term
--    Phase 3 (<33%):    decrypt only, 20 s per term
--    Weak point: one random 15 s window, hits do 3×
--    Enrage: the last 60 s, damage both ways ×2
--  Hit = 10 dmg. Miss = 4 shield (of 100).
--  Win: everyone who hit the boss +15 XP, top damage (MVP, ties share) +10 more.
--  Loss: everyone who answered at least once +5.
--  Run after vocab-duels.sql (uses its puzzle helpers). Safe to re-run.
-- ============================================================================

create table if not exists raids (
  id          uuid primary key default gen_random_uuid(),
  class_id    uuid not null references classes(id) on delete cascade,
  course      text not null,
  modules     int[] not null default '{}',
  pool        jsonb not null,
  modes       text[] not null default '{}',
  hp_max      int  not null,
  hp          int  not null,
  shield      int  not null default 100,
  minutes     int  not null default 5,
  status      text not null default 'live' check (status in ('live','won','lost','cancelled')),
  started_at  timestamptz not null default now(),
  ends_at     timestamptz not null,
  weak_at     timestamptz,
  finished_at timestamptz,
  created_by  text
);
create index if not exists raids_class on raids (class_id, started_at desc);
alter table raids enable row level security;

create table if not exists raid_players (
  raid_id    uuid not null references raids(id) on delete cascade,
  student_id uuid not null references students(id) on delete cascade,
  dmg        int  not null default 0,
  hits       int  not null default 0,
  misses     int  not null default 0,
  last_seen  timestamptz not null default now(),
  n          int  not null default 0,
  term_t text, term_d text, mode text, puzzle text, shift int, term_at timestamptz,
  used       text[] not null default '{}',
  last_t     text,
  xp         int  not null default 0,
  mvp        boolean not null default false,
  primary key (raid_id, student_id)
);
alter table raid_players enable row level security;

create table if not exists raid_feed (
  id         bigserial primary key,
  raid_id    uuid not null references raids(id) on delete cascade,
  student_id uuid not null references students(id) on delete cascade,
  kind       text not null check (kind in ('hit','miss')),
  amount     int  not null,
  weak       boolean not null default false,
  at         timestamptz not null default now()
);
create index if not exists raid_feed_raid on raid_feed (raid_id, at desc);
alter table raid_feed enable row level security;

-- ---- helpers -----------------------------------------------------------------
create or replace function _raid_phase(r raids) returns int
language sql immutable as $$ select case when r.hp * 3 > r.hp_max * 2 then 1 when r.hp * 3 > r.hp_max then 2 else 3 end; $$;

create or replace function _raid_weak(r raids) returns boolean
language sql stable as $$ select r.weak_at is not null and now() >= r.weak_at and now() < r.weak_at + interval '15 seconds'; $$;

create or replace function _raid_enraged(r raids) returns boolean
language sql stable as $$ select now() >= r.ends_at - interval '60 seconds' and now() < r.ends_at; $$;

create or replace function _raid_ttl(p_phase int) returns interval
language sql immutable as $$ select case p_phase when 1 then interval '45 seconds' when 2 then interval '30 seconds' else interval '20 seconds' end; $$;

create or replace function _raid_term(p_raid uuid, p_student uuid) returns void
language plpgsql security definer set search_path = public as $$
declare r raids; pl raid_players; t jsonb; v_used text[]; k int := 1 + floor(random() * 25)::int; v_mode text;
begin
  select * into r from raids where id = p_raid;
  select * into pl from raid_players where raid_id = p_raid and student_id = p_student;
  v_used := pl.used;
  if (select count(*) from jsonb_array_elements(r.pool) e where not (e->>'t' = any(v_used))) = 0 then v_used := '{}'; end if;
  select e into t from jsonb_array_elements(r.pool) e
   where not (e->>'t' = any(v_used)) and e->>'t' is distinct from pl.term_t order by random() limit 1;
  if t is null then select e into t from jsonb_array_elements(r.pool) e order by random() limit 1; end if;
  v_mode := case when _raid_phase(r) = 3 then 'decrypt'
                 else (select x from unnest(coalesce(nullif(r.modes, '{}'::text[]), array['cipher','unscramble','decrypt','bank'])) x order by random() limit 1) end;
  update raid_players set n = n + 1, term_t = t->>'t', term_d = t->>'d', term_at = now(), used = v_used || (t->>'t'), mode = v_mode,
    shift  = case when v_mode = 'cipher' then k end,
    puzzle = case v_mode when 'cipher' then _vd_cipher(upper(t->>'t'), k) when 'unscramble' then _vd_shuffle(t->>'t')
                         when 'bank' then _vd_bank(r.pool, t->>'t') else null end
   where raid_id = p_raid and student_id = p_student;
end $$;

create or replace function _raid_finish(p_raid uuid, p_status text) returns void
language plpgsql security definer set search_path = public as $$
declare v_top int; pl record;
begin
  update raids set status = p_status, finished_at = now() where id = p_raid and status = 'live';
  if not found then return; end if;
  if p_status = 'cancelled' then return; end if;
  select max(dmg) into v_top from raid_players where raid_id = p_raid;
  for pl in select * from raid_players where raid_id = p_raid and (hits + misses) > 0 loop
    if p_status = 'won' and pl.dmg > 0 then
      if pl.dmg = v_top then
        update raid_players set xp = 25, mvp = true where raid_id = p_raid and student_id = pl.student_id;
        perform _vd_pay(pl.student_id, 25, 'Boss raid win (+15) and MVP (+10)');
      else
        update raid_players set xp = 15 where raid_id = p_raid and student_id = pl.student_id;
        perform _vd_pay(pl.student_id, 15, 'Boss raid win');
      end if;
    else
      update raid_players set xp = 5 where raid_id = p_raid and student_id = pl.student_id;
      perform _vd_pay(pl.student_id, 5, 'Boss raid played');
    end if;
  end loop;
end $$;

create or replace function _raid_tidy(p_raid uuid) returns void
language plpgsql security definer set search_path = public as $$
declare r raids;
begin
  select * into r from raids where id = p_raid;
  if r.id is null or r.status <> 'live' then return; end if;
  if r.hp <= 0 then perform _raid_finish(r.id, 'won');
  elsif r.shield <= 0 or now() >= r.ends_at then perform _raid_finish(r.id, 'lost');
  end if;
end $$;

create or replace function _raid_view(r raids) returns json
language sql stable security definer set search_path = public as $$
  select json_build_object('id', r.id, 'status', r.status, 'modules', r.modules, 'hp', r.hp, 'hp_max', r.hp_max, 'shield', r.shield,
    'phase', _raid_phase(r), 'weak', _raid_weak(r), 'weak_at', r.weak_at, 'enraged', _raid_enraged(r), 'started_at', r.started_at, 'ends_at', r.ends_at,
    'finished_at', r.finished_at, 'minutes', r.minutes,
    'players', (select count(*) from raid_players where raid_id = r.id and last_seen > now() - interval '20 seconds'),
    'top', (select coalesce(json_agg(json_build_object('id', p.student_id, 'handle', s.handle, 'dmg', p.dmg, 'hits', p.hits, 'mvp', p.mvp, 'xp', p.xp) order by p.dmg desc, p.hits desc), '[]'::json)
              from (select * from raid_players where raid_id = r.id and (hits + misses) > 0 order by dmg desc, hits desc limit 10) p join students s on s.id = p.student_id),
    'feed', (select coalesce(json_agg(json_build_object('who', s.handle, 'kind', f.kind, 'amount', f.amount, 'weak', f.weak, 'at', f.at) order by f.at desc), '[]'::json)
              from (select * from raid_feed where raid_id = r.id order by at desc limit 10) f join students s on s.id = f.student_id));
$$;

-- ---- student -------------------------------------------------------------------
create or replace function ctf_raid_state(p_student uuid, p_peek boolean default false)
returns json language plpgsql security definer set search_path = public as $$
declare me students; r raids; pl raid_players;
begin
  select * into me from students where id = p_student and auth_user_id = auth.uid();
  if me.id is null then return json_build_object('error','not_yours'); end if;
  select * into r from raids where class_id = me.class_id and (status = 'live' or finished_at > now() - interval '5 minutes')
   order by (status = 'live') desc, started_at desc limit 1;
  if r.id is null then return json_build_object('now', now(), 'raid', null); end if;
  perform pg_advisory_xact_lock(hashtext('raid:' || r.id::text));
  perform _raid_tidy(r.id);
  select * into r from raids where id = r.id;
  if p_peek then
    select * into pl from raid_players where raid_id = r.id and student_id = me.id;
    return json_build_object('now', now(), 'raid', json_build_object('id', r.id, 'status', r.status, 'hp', r.hp, 'hp_max', r.hp_max, 'ends_at', r.ends_at, 'joined', pl.student_id is not null));
  end if;
  if r.status = 'live' and not _vd_is_teacher_row(to_jsonb(me)->>'email') then
    insert into raid_players (raid_id, student_id) values (r.id, me.id) on conflict (raid_id, student_id) do update set last_seen = now();
    select * into pl from raid_players where raid_id = r.id and student_id = me.id;
    if pl.term_t is null or pl.term_at < now() - _raid_ttl(_raid_phase(r)) or (_raid_phase(r) = 3 and pl.mode <> 'decrypt') then
      if pl.term_t is not null then update raid_players set last_t = term_t where raid_id = r.id and student_id = me.id; end if;
      perform _raid_term(r.id, me.id);
    end if;
  end if;
  select * into pl from raid_players where raid_id = r.id and student_id = me.id;
  return json_build_object('now', now(), 'me', me.id, 'handle', me.handle,
    'bg', (select battle_bg from classes where id = me.class_id),
    'raid', _raid_view(r),
    'my', case when pl.student_id is null then null else json_build_object(
      'dmg', pl.dmg, 'hits', pl.hits, 'misses', pl.misses, 'xp', pl.xp, 'mvp', pl.mvp,
      'rank', (select count(*) + 1 from raid_players x where x.raid_id = r.id and x.dmg > pl.dmg),
      'n', pl.n, 'def', pl.term_d, 'mode', pl.mode, 'shift', pl.shift, 'term_at', pl.term_at, 'ttl', extract(epoch from _raid_ttl(_raid_phase(r)))::int,
      'puzzle', case when pl.mode = 'decrypt' then _vd_mask(pl.term_t, r.id::text || pl.student_id::text || ':' || pl.n, _vd_leak(pl.term_at)) else pl.puzzle end,
      'len', length(_vd_norm(pl.term_t)), 'last_t', pl.last_t) end);
end $$;

create or replace function ctf_raid_answer(p_student uuid, p_raid uuid, p_n int, p_guess text)
returns json language plpgsql security definer set search_path = public as $$
declare me students; r raids; pl raid_players; v_amt int; v_weak boolean;
begin
  select * into me from students where id = p_student and auth_user_id = auth.uid();
  if me.id is null then return json_build_object('error','not_yours'); end if;
  perform pg_advisory_xact_lock(hashtext('raid:' || p_raid::text));
  perform _raid_tidy(p_raid);
  select * into r from raids where id = p_raid;
  if r.id is null or r.class_id <> me.class_id or r.status <> 'live' then return json_build_object('error','over'); end if;
  select * into pl from raid_players where raid_id = r.id and student_id = me.id;
  if pl.student_id is null then return json_build_object('error','not_in_raid'); end if;
  if pl.n <> p_n then return json_build_object('stale', true); end if;
  if _vd_norm(p_guess) = '' then return json_build_object('error','empty'); end if;
  update raid_players set last_seen = now() where raid_id = r.id and student_id = me.id;
  v_weak := _raid_weak(r);
  if _vd_norm(p_guess) = _vd_norm(pl.term_t) then
    v_amt := 10 * (case when v_weak then 3 else 1 end) * (case when _raid_enraged(r) then 2 else 1 end);
    update raids set hp = greatest(0, hp - v_amt) where id = r.id;
    update raid_players set dmg = dmg + least(v_amt, r.hp), hits = hits + 1, last_t = term_t where raid_id = r.id and student_id = me.id;
    insert into raid_feed (raid_id, student_id, kind, amount, weak) values (r.id, me.id, 'hit', v_amt, v_weak);
    perform _raid_term(r.id, me.id);
    perform _raid_tidy(r.id);
    return json_build_object('correct', true, 'term', pl.term_t, 'dmg', v_amt, 'weak', v_weak);
  end if;
  v_amt := 4 * (case when _raid_enraged(r) then 2 else 1 end);
  update raids set shield = greatest(0, shield - v_amt) where id = r.id;
  update raid_players set misses = misses + 1 where raid_id = r.id and student_id = me.id;
  insert into raid_feed (raid_id, student_id, kind, amount) values (r.id, me.id, 'miss', v_amt);
  perform _raid_tidy(r.id);
  return json_build_object('correct', false, 'shield_hit', v_amt);
end $$;

-- ---- teacher -------------------------------------------------------------------
create or replace function ctf_t_raid_start(p_class uuid, p_hp int, p_minutes int, p_modules int[], p_pool jsonb, p_modes text[])
returns json language plpgsql security definer set search_path = public as $$
declare c classes; v_pool jsonb; v_min int := least(30, greatest(2, coalesce(p_minutes, 5))); v_hp int := least(100000, greatest(50, coalesce(p_hp, 500))); v_id uuid;
begin
  if not _is_teacher() then return json_build_object('error','not_teacher'); end if;
  select * into c from classes where id = p_class;
  if c.id is null then return json_build_object('error','no_class'); end if;
  if exists (select 1 from raids where class_id = p_class and status = 'live' and ends_at > now()) then return json_build_object('error','raid_live'); end if;
  update raids set status = 'cancelled', finished_at = now() where class_id = p_class and status = 'live';
  v_pool := _vd_pool(p_pool);
  if jsonb_array_length(v_pool) < 4 then return json_build_object('error','too_few_terms'); end if;
  insert into raids (class_id, course, modules, pool, modes, hp_max, hp, minutes, ends_at, weak_at, created_by)
    values (p_class, c.course, coalesce(p_modules, '{}'), v_pool, _vd_modes(p_modes), v_hp, v_hp, v_min,
            now() + make_interval(mins => v_min),
            now() + make_interval(secs => (60 + floor(random() * greatest(1, v_min * 60 - 150)))::int),
            lower(coalesce(_email(), '')))
    returning id into v_id;
  return json_build_object('ok', true, 'id', v_id);
end $$;

create or replace function ctf_t_raid_state(p_class uuid)
returns json language plpgsql security definer set search_path = public as $$
declare r raids;
begin
  if not _is_teacher() then return json_build_object('error','not_teacher'); end if;
  select * into r from raids where class_id = p_class and (status = 'live' or finished_at > now() - interval '1 day')
   order by (status = 'live') desc, started_at desc limit 1;
  if r.id is not null then perform _raid_tidy(r.id); select * into r from raids where id = r.id; end if;
  return json_build_object('now', now(), 'bg', (select battle_bg from classes where id = p_class),
    'raid', case when r.id is null then null else _raid_view(r) end);
end $$;

create or replace function ctf_t_raid_end(p_raid uuid)
returns json language plpgsql security definer set search_path = public as $$
begin
  if not _is_teacher() then return json_build_object('error','not_teacher'); end if;
  perform _raid_finish(p_raid, 'cancelled');
  return json_build_object('ok', true);
end $$;

do $$
declare f text;
begin
  foreach f in array array['ctf_raid_state(uuid,boolean)', 'ctf_raid_answer(uuid,uuid,int,text)',
    'ctf_t_raid_start(uuid,int,int,int[],jsonb,text[])', 'ctf_t_raid_state(uuid)', 'ctf_t_raid_end(uuid)'] loop
    execute format('revoke all on function %s from public, anon', f);
    execute format('grant execute on function %s to authenticated', f);
  end loop;
end $$;
notify pgrst, 'reload schema';
