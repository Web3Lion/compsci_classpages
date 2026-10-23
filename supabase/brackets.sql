-- © 2026 Robert Reasey, South Fayette School District. Licensed CC BY-NC 4.0 (attribution required, no commercial use). See LICENSE.md.
-- ============================================================================
--  DUEL BRACKETS + BATTLE BACKGROUNDS (v27.0)
--  The teacher starts a single-elimination bracket for chosen students
--  (picked from squads). Seeds = current XP (points + bonus); top seeds get
--  byes up to 4/8/16/32. Every match is best of 3:
--    * flag bracket: a game = race to 3 flag points (Easy 1 / Med 2 / Hard 3)
--      on flags the player hasn't captured. If a player runs out of open flags
--      the game becomes a vocab tiebreak fight.
--    * vocab bracket: a game = a normal vocab fight (300 hp, 4 hits).
--  Matches start by themselves once both players are on the bracket page;
--  60 s no-show = forfeit. First-round losers drop into a consolation bracket.
--  Rewards when it ends: champion +25, runner-up +15, semifinalists +10,
--  consolation champion +10, everyone else who played +5.
--  31.6: rematch pool. Anyone knocked out (and not headed to the consolation
--  bracket) is paired at random with another knocked-out player who is on the
--  page. Pool matches are 1 game, no XP, no places; they stop when the bracket ends.
--  31.7: sudden death option (brackets.sudden): every match is 1 game. A vocab/binary
--  game is 5 questions, first correct answer scores; a wrong answer locks you out of
--  that question. Most points after 5 wins; tied = next point wins.
--  31.8: no-show / gone-missing forfeit is 30 s (was 60). _br_tree carries q + last_t
--  (the last settled answer) for the projector big screen; students get last_opp.
--  Also: classes.battle_bg = the teacher's animated background per page.
--  Run after vocab-duels.sql (+ module-clears.sql for flag brackets). Safe to re-run.
-- ============================================================================

alter table classes add column if not exists battle_bg jsonb not null default '{}'::jsonb;

create table if not exists brackets (
  id          uuid primary key default gen_random_uuid(),
  class_id    uuid not null references classes(id) on delete cascade,
  course      text not null,
  kind        text not null check (kind in ('flag','vocab')),
  modules     int[] not null default '{}',
  flag_keys   text[] not null default '{}',
  pool        jsonb not null default '[]'::jsonb,
  modes       text[] not null default '{}',
  status      text not null default 'live' check (status in ('live','done','cancelled')),
  size        int not null,
  cons_size   int,
  champion    uuid,
  created_by  text,
  created_at  timestamptz not null default now(),
  finished_at timestamptz
);
create index if not exists brackets_class on brackets (class_id, created_at desc);
alter table brackets enable row level security;

create table if not exists bracket_entrants (
  bracket_id uuid not null references brackets(id) on delete cascade,
  student_id uuid not null references students(id) on delete cascade,
  seed       int  not null,
  xp         int  not null default 0,
  last_seen  timestamptz not null default 'epoch',
  played     boolean not null default false,
  place      text,
  xp_paid    int  not null default 0,
  primary key (bracket_id, student_id)
);
alter table bracket_entrants enable row level security;

create table if not exists bracket_matches (
  id         uuid primary key default gen_random_uuid(),
  bracket_id uuid not null references brackets(id) on delete cascade,
  side       text not null default 'main' check (side in ('main','cons','pool')),
  round      int  not null,
  slot       int  not null,
  a          uuid, b uuid,
  wa         int  not null default 0, wb int not null default 0,
  status     text not null default 'wait' check (status in ('wait','ready','live','done')),
  winner     uuid,
  bye        boolean not null default false,
  forfeit    boolean not null default false,
  ready_at   timestamptz,
  game_no    int  not null default 0,
  game_kind  text,
  game_at    timestamptz,
  next_at    timestamptz,
  ga         int  not null default 0, gb int not null default 0,
  hp_a       int  not null default 300, hp_b int not null default 300,
  n          int  not null default 0,
  term_t text, term_d text, mode text, puzzle text, shift int, term_at timestamptz,
  used       text[] not null default '{}',
  last_t text, last_by uuid, last_game uuid,
  unique (bracket_id, side, round, slot)
);
alter table bracket_matches enable row level security;
alter table bracket_matches drop constraint if exists bracket_matches_side_check;
alter table bracket_matches add constraint bracket_matches_side_check check (side in ('main','cons','pool'));
alter table bracket_matches add column if not exists done_at timestamptz;
-- 31.7: sudden death = 1 game per match; vocab games are 5 questions (most correct wins, tie = next correct wins)
alter table brackets add column if not exists sudden boolean not null default false;
alter table bracket_matches add column if not exists q int not null default 0;
alter table bracket_matches add column if not exists lock_a boolean not null default false;
alter table bracket_matches add column if not exists lock_b boolean not null default false;

create table if not exists bracket_caps (
  match_id   uuid not null references bracket_matches(id) on delete cascade,
  game_no    int  not null,
  student_id uuid not null references students(id) on delete cascade,
  flag_key   text not null,
  pts        int  not null,
  at         timestamptz not null default now(),
  primary key (match_id, student_id, flag_key)
);
alter table bracket_caps enable row level security;

-- ---- helpers -----------------------------------------------------------------
create or replace function _br_order(p_n int) returns int[]
language plpgsql immutable as $$
declare arr int[] := array[1]; nx int[]; s int; m int;
begin
  while cardinality(arr) < p_n loop
    m := cardinality(arr) * 2 + 1; nx := '{}';
    foreach s in array arr loop nx := nx || s || (m - s); end loop;
    arr := nx;
  end loop;
  return arr;
end $$;

create or replace function _br_pow2(p_n int) returns int
language sql immutable as $$ select greatest(2, power(2, ceil(log(2, greatest(p_n, 2)::numeric)))::int); $$;

create or replace function _br_open(p_student uuid, p_keys text[]) returns int
language sql stable security definer set search_path = public as $$
  select count(*)::int from unnest(p_keys) k
   where not exists (select 1 from flag_events f where f.student_id = p_student and f.flag_key = k);
$$;

create or replace function _br_new_term(p_match uuid) returns void
language plpgsql security definer set search_path = public as $$
declare m bracket_matches; br brackets; t jsonb; v_used text[]; k int := 1 + floor(random() * 25)::int; v_mode text;
begin
  select * into m from bracket_matches where id = p_match;
  select * into br from brackets where id = m.bracket_id;
  v_used := m.used;
  if (select count(*) from jsonb_array_elements(br.pool) e where not (e->>'t' = any(v_used))) = 0 then v_used := '{}'; end if;
  select e into t from jsonb_array_elements(br.pool) e
   where not (e->>'t' = any(v_used)) and e->>'t' is distinct from m.term_t order by random() limit 1;
  if t is null then select e into t from jsonb_array_elements(br.pool) e order by random() limit 1; end if;
  v_mode := (select x from unnest(coalesce(nullif(br.modes, '{}'::text[]), array['cipher','unscramble','decrypt','bank'])) x order by random() limit 1);
  update bracket_matches set n = n + 1, term_t = t->>'t', term_d = t->>'d', term_at = now(), used = v_used || (t->>'t'), mode = v_mode, lock_a = false, lock_b = false,
    shift  = case when v_mode = 'cipher' then k end,
    puzzle = case v_mode when 'cipher' then _vd_cipher(upper(t->>'t'), k) when 'unscramble' then _vd_shuffle(t->>'t')
                         when 'bank' then _vd_bank(br.pool, t->>'t') else null end
   where id = p_match;
end $$;

create or replace function _br_start_game(p_match uuid) returns void
language plpgsql security definer set search_path = public as $$
declare m bracket_matches; br brackets; v_kind text;
begin
  select * into m from bracket_matches where id = p_match;
  select * into br from brackets where id = m.bracket_id;
  v_kind := br.kind;
  if v_kind = 'flag' and (_br_open(m.a, br.flag_keys) = 0 or _br_open(m.b, br.flag_keys) = 0) then v_kind := 'vocab'; end if;
  update bracket_matches set status = 'live', game_no = game_no + 1, game_kind = v_kind, game_at = now(), next_at = null,
    ga = 0, gb = 0, q = 0, hp_a = 300, hp_b = 300 where id = p_match;
  update bracket_entrants set played = true where bracket_id = m.bracket_id and student_id in (m.a, m.b);
  if v_kind = 'vocab' then perform _br_new_term(p_match); end if;
end $$;

-- builds one side's tree from students already ordered best seed first
create or replace function _br_build(p_bracket uuid, p_side text, p_ids uuid[]) returns int
language plpgsql security definer set search_path = public as $$
declare v_n int := cardinality(p_ids); v_size int; v_ord int[]; r int; i int; v_a uuid; v_b uuid; v_id uuid;
begin
  v_size := _br_pow2(v_n); v_ord := _br_order(v_size);
  r := 1;
  while (v_size / power(2, r))::int >= 1 loop
    for i in 1 .. (v_size / power(2, r))::int loop
      insert into bracket_matches (bracket_id, side, round, slot) values (p_bracket, p_side, r, i) on conflict do nothing;
    end loop;
    r := r + 1;
  end loop;
  for i in 1 .. v_size / 2 loop
    v_a := case when v_ord[2*i-1] <= v_n then p_ids[v_ord[2*i-1]] end;
    v_b := case when v_ord[2*i]   <= v_n then p_ids[v_ord[2*i]]   end;
    update bracket_matches set a = v_a, b = v_b,
      status = case when v_a is not null and v_b is not null then 'ready' else 'wait' end,
      ready_at = case when v_a is not null and v_b is not null then now() end
     where bracket_id = p_bracket and side = p_side and round = 1 and slot = i returning id into v_id;
    if (v_a is null) <> (v_b is null) then
      update bracket_matches set status = 'done', bye = true, winner = coalesce(v_a, v_b) where id = v_id;
    end if;
  end loop;
  for v_id in select id from bracket_matches where bracket_id = p_bracket and side = p_side and round = 1 and bye loop
    perform _br_advance(v_id);
  end loop;
  return v_size;
end $$;

create or replace function _br_finish(p_bracket uuid) returns void
language plpgsql security definer set search_path = public as $$
declare br brackets; v_r int; fm bracket_matches; e record; v_amt int; v_lbl text;
begin
  select * into br from brackets where id = p_bracket;
  if br.status <> 'live' then return; end if;
  select max(round) into v_r from bracket_matches where bracket_id = p_bracket and side = 'main';
  select * into fm from bracket_matches where bracket_id = p_bracket and side = 'main' and round = v_r;
  update bracket_entrants set place = 'champion' where bracket_id = p_bracket and student_id = fm.winner;
  update bracket_entrants set place = 'runner_up' where bracket_id = p_bracket and student_id = case when fm.winner = fm.a then fm.b else fm.a end;
  if v_r >= 2 then
    update bracket_entrants set place = 'semi' where bracket_id = p_bracket and place is null and student_id in (
      select case when m.winner = m.a then m.b else m.a end from bracket_matches m
       where m.bracket_id = p_bracket and m.side = 'main' and m.round = v_r - 1 and not m.bye);
  end if;
  if coalesce(br.cons_size, 0) > 0 then
    update bracket_entrants set place = 'cons_champ' where bracket_id = p_bracket and place is null and student_id = (
      select winner from bracket_matches where bracket_id = p_bracket and side = 'cons' order by round desc limit 1);
  end if;
  for e in select * from bracket_entrants where bracket_id = p_bracket and xp_paid = 0 loop
    v_amt := case e.place when 'champion' then 25 when 'runner_up' then 15 when 'semi' then 10 when 'cons_champ' then 10 else case when e.played then 5 else 0 end end;
    v_lbl := case e.place when 'champion' then 'Bracket champion' when 'runner_up' then 'Bracket runner-up' when 'semi' then 'Bracket semifinalist'
                          when 'cons_champ' then 'Consolation bracket champion' else 'Bracket played' end;
    if v_amt > 0 then
      update bracket_entrants set xp_paid = v_amt where bracket_id = p_bracket and student_id = e.student_id;
      perform _vd_pay(e.student_id, v_amt, v_lbl);
    end if;
  end loop;
  update bracket_matches set status = 'done', game_kind = null, next_at = null, done_at = now() where bracket_id = p_bracket and side = 'pool' and status <> 'done';
  update brackets set status = 'done', finished_at = now(), champion = fm.winner where id = p_bracket;
end $$;

-- 31.6: out of the bracket for good (lost, nothing left to play, not waiting on the consolation draw)
create or replace function _br_out(p_bracket uuid, p_student uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from bracket_matches x where x.bracket_id = p_bracket and x.side in ('main','cons') and not x.bye and x.status = 'done'
                   and p_student in (x.a, x.b) and x.winner is distinct from p_student)
     and not exists (select 1 from bracket_matches x where x.bracket_id = p_bracket and x.side in ('main','cons') and x.status <> 'done' and p_student in (x.a, x.b))
     and not ((select cons_size from brackets where id = p_bracket) is null
              and exists (select 1 from bracket_matches x where x.bracket_id = p_bracket and x.side = 'main' and x.round = 1 and not x.bye and x.status = 'done'
                            and p_student in (x.a, x.b) and x.winner is distinct from p_student));
$$;

-- 31.6: pair knocked-out players who are on the page; fewest past rematches first, then random
create or replace function _br_pool(p_bracket uuid) returns void
language plpgsql security definer set search_path = public as $$
declare v_ids uuid[]; v_a uuid; v_b uuid; v_slot int;
begin
  select coalesce(array_agg(e.student_id order by random()), '{}') into v_ids from bracket_entrants e
   where e.bracket_id = p_bracket and e.last_seen > now() - interval '20 seconds' and _br_out(p_bracket, e.student_id)
     and not exists (select 1 from bracket_matches x where x.bracket_id = p_bracket and x.side = 'pool' and e.student_id in (x.a, x.b)
                      and (x.status <> 'done' or x.done_at > now() - interval '5 seconds'));
  while cardinality(v_ids) >= 2 loop
    v_a := v_ids[1];
    select x into v_b from unnest(v_ids[2:]) x
     order by (select count(*) from bracket_matches m where m.bracket_id = p_bracket and m.side = 'pool' and ((m.a = v_a and m.b = x) or (m.a = x and m.b = v_a))), random() limit 1;
    select coalesce(max(slot), 0) + 1 into v_slot from bracket_matches where bracket_id = p_bracket and side = 'pool';
    insert into bracket_matches (bracket_id, side, round, slot, a, b, status, ready_at) values (p_bracket, 'pool', 1, v_slot, v_a, v_b, 'ready', now());
    v_ids := array_remove(array_remove(v_ids, v_a), v_b);
  end loop;
end $$;

-- winner moves on; builds the consolation side once round 1 is over; finishes the bracket
create or replace function _br_advance(p_match uuid) returns void
language plpgsql security definer set search_path = public as $$
declare m bracket_matches; br brackets; nx bracket_matches; v_max int; v_l uuid[];
begin
  select * into m from bracket_matches where id = p_match;
  if m.winner is null or m.side = 'pool' then return; end if;
  select * into br from brackets where id = m.bracket_id;
  select max(round) into v_max from bracket_matches where bracket_id = m.bracket_id and side = m.side;
  if m.round < v_max then
    if m.slot % 2 = 1 then
      update bracket_matches set a = m.winner where bracket_id = m.bracket_id and side = m.side and round = m.round + 1 and slot = (m.slot + 1) / 2 returning * into nx;
    else
      update bracket_matches set b = m.winner where bracket_id = m.bracket_id and side = m.side and round = m.round + 1 and slot = (m.slot + 1) / 2 returning * into nx;
    end if;
    if nx.a is not null and nx.b is not null and nx.status = 'wait' then
      update bracket_matches set status = 'ready', ready_at = now() where id = nx.id;
    end if;
  end if;
  if m.side = 'main' and br.cons_size is null
     and not exists (select 1 from bracket_matches where bracket_id = m.bracket_id and side = 'main' and round = 1 and status <> 'done') then
    select coalesce(array_agg(x.l order by e.xp desc, random()), '{}') into v_l from (
      select case when winner = a then b else a end as l from bracket_matches
       where bracket_id = m.bracket_id and side = 'main' and round = 1 and not bye) x
      join bracket_entrants e on e.bracket_id = m.bracket_id and e.student_id = x.l;
    if cardinality(v_l) >= 2 then
      update brackets set cons_size = _br_pow2(cardinality(v_l)) where id = m.bracket_id;
      perform _br_build(m.bracket_id, 'cons', v_l);
    else
      update brackets set cons_size = 0 where id = m.bracket_id;
    end if;
  end if;
  select * into br from brackets where id = m.bracket_id;
  if br.cons_size is not null
     and not exists (select 1 from bracket_matches where bracket_id = m.bracket_id and side = 'main' and round = v_max and status <> 'done')
     and (br.cons_size = 0 or not exists (select 1 from bracket_matches x where x.bracket_id = m.bracket_id and x.side = 'cons'
              and x.round = (select max(round) from bracket_matches where bracket_id = m.bracket_id and side = 'cons') and x.status <> 'done')) then
    perform _br_finish(m.bracket_id);
  end if;
end $$;

create or replace function _br_match_over(p_match uuid, p_winner uuid, p_forfeit boolean default false) returns void
language plpgsql security definer set search_path = public as $$
begin
  update bracket_matches set status = 'done', winner = p_winner, forfeit = p_forfeit, game_kind = null, next_at = null, done_at = now()
   where id = p_match and status <> 'done';
  if found then perform _br_advance(p_match); end if;
end $$;

create or replace function _br_game_won(p_match uuid, p_winner uuid) returns void
language plpgsql security definer set search_path = public as $$
declare m bracket_matches;
begin
  update bracket_matches set wa = wa + case when p_winner = a then 1 else 0 end, wb = wb + case when p_winner = b then 1 else 0 end,
    last_game = p_winner, game_kind = null, next_at = now() + interval '5 seconds'
   where id = p_match and status = 'live' and game_kind is not null returning * into m;
  if m.id is null then return; end if;
  if m.wa >= 2 or m.wb >= 2 or m.side = 'pool' or (select sudden from brackets where id = m.bracket_id) then perform _br_match_over(m.id, p_winner); end if;
end $$;

-- 31.7 sudden death: a question is settled (scored, timed out, or both locked out)
create or replace function _br_sd_next(p_match uuid) returns void
language plpgsql security definer set search_path = public as $$
declare m bracket_matches;
begin
  update bracket_matches set q = q + 1 where id = p_match returning * into m;
  if (m.q >= 5 and m.ga <> m.gb) or (m.q < 5 and abs(m.ga - m.gb) > 5 - m.q) then
    perform _br_game_won(m.id, case when m.ga > m.gb then m.a else m.b end);
  else perform _br_new_term(m.id); end if;
end $$;

create or replace function _br_is_sd(p_match uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce(b.sudden, false) and m.side <> 'pool' from bracket_matches m join brackets b on b.id = m.bracket_id where m.id = p_match;
$$;

create or replace function _br_tidy(p_bracket uuid) returns void
language plpgsql security definer set search_path = public as $$
declare br brackets; m record; pa boolean; pb boolean;
begin
  if p_bracket is null then return; end if;
  perform pg_advisory_xact_lock(hashtext('br:' || p_bracket::text));
  select * into br from brackets where id = p_bracket;
  if br.id is null or br.status <> 'live' then return; end if;
  perform _br_pool(p_bracket);
  for m in select x.* from bracket_matches x where x.bracket_id = p_bracket and x.status in ('ready','live') loop
    select last_seen > now() - interval '20 seconds' into pa from bracket_entrants where bracket_id = p_bracket and student_id = m.a;
    select last_seen > now() - interval '20 seconds' into pb from bracket_entrants where bracket_id = p_bracket and student_id = m.b;
    pa := coalesce(pa, false); pb := coalesce(pb, false);
    if m.status = 'ready' then
      if pa and pb then perform _br_start_game(m.id);
      elsif m.ready_at < now() - interval '30 seconds' and (pa or pb) then perform _br_match_over(m.id, case when pa then m.a else m.b end, true);
      end if;
      continue;
    end if;
    -- live: 30 s gone = forfeit (31.8; was 60)
    if not pa and pb and not exists (select 1 from bracket_entrants where bracket_id = p_bracket and student_id = m.a and last_seen > now() - interval '30 seconds') then
      perform _br_match_over(m.id, m.b, true); continue; end if;
    if not pb and pa and not exists (select 1 from bracket_entrants where bracket_id = p_bracket and student_id = m.b and last_seen > now() - interval '30 seconds') then
      perform _br_match_over(m.id, m.a, true); continue; end if;
    if m.game_kind is null and m.next_at <= now() then perform _br_start_game(m.id); continue; end if;
    if m.game_kind = 'vocab' and m.term_at < now() - interval '45 seconds' then
      update bracket_matches set last_t = term_t, last_by = null where id = m.id;
      if br.sudden and m.side <> 'pool' then perform _br_sd_next(m.id); else perform _br_new_term(m.id); end if;
    elsif m.game_kind = 'flag' and ((_br_open(m.a, br.flag_keys) = 0 and m.ga < 3) or (_br_open(m.b, br.flag_keys) = 0 and m.gb < 3)) then
      update bracket_matches set game_kind = 'vocab', hp_a = 300, hp_b = 300, ga = 0, gb = 0, q = 0 where id = m.id;   -- out of open flags: vocab tiebreak
      perform _br_new_term(m.id);
    end if;
  end loop;
end $$;

-- ---- flag scoring -------------------------------------------------------------
create or replace function _br_score() returns trigger
language plpgsql security definer set search_path = public as $$
declare v_pts int; r record; v_g int;
begin
  v_pts := case lower(coalesce(new.level,'')) when 'hard' then 3 when 'medium' then 2 else 1 end;
  for r in
    select m.id, m.bracket_id, m.a, m.b, m.game_no from bracket_matches m join brackets b on b.id = m.bracket_id
     where m.status = 'live' and m.game_kind = 'flag' and b.status = 'live' and new.student_id in (m.a, m.b) and new.flag_key = any(b.flag_keys)
  loop
    perform pg_advisory_xact_lock(hashtext('br:' || r.bracket_id::text));
    insert into bracket_caps (match_id, game_no, student_id, flag_key, pts) values (r.id, r.game_no, new.student_id, new.flag_key, v_pts)
      on conflict do nothing;
    if found then
      if new.student_id = r.a then update bracket_matches set ga = ga + v_pts where id = r.id and game_kind = 'flag' returning ga into v_g;
      else update bracket_matches set gb = gb + v_pts where id = r.id and game_kind = 'flag' returning gb into v_g; end if;
      if v_g >= 3 then perform _br_game_won(r.id, new.student_id); end if;
    end if;
  end loop;
  return new;
end $$;
drop trigger if exists bracket_score on flag_events;
create trigger bracket_score after insert on flag_events for each row execute function _br_score();

-- ---- views ---------------------------------------------------------------------
create or replace function _br_tree(p_bracket uuid) returns json
language sql stable security definer set search_path = public as $$
  select json_build_object(
    'entrants', (select coalesce(json_agg(json_build_object('id', e.student_id, 'handle', s.handle, 'seed', e.seed, 'xp', e.xp, 'place', e.place, 'xp_paid', e.xp_paid,
                   'here', e.last_seen > now() - interval '20 seconds') order by e.seed), '[]'::json)
                   from bracket_entrants e join students s on s.id = e.student_id where e.bracket_id = p_bracket),
    'matches', (select coalesce(json_agg(json_build_object('id', m.id, 'side', m.side, 'round', m.round, 'slot', m.slot, 'a', m.a, 'b', m.b,
                   'wa', m.wa, 'wb', m.wb, 'status', m.status, 'winner', m.winner, 'bye', m.bye, 'forfeit', m.forfeit, 'game_no', m.game_no,
                   'game_kind', m.game_kind, 'ga', m.ga, 'gb', m.gb, 'hp_a', m.hp_a, 'hp_b', m.hp_b, 'ready_at', m.ready_at, 'next_at', m.next_at, 'q', m.q, 'last_t', m.last_t)
                   order by m.side, m.round, m.slot), '[]'::json) from bracket_matches m where m.bracket_id = p_bracket)
  );
$$;

create or replace function _br_head(br brackets) returns json
language sql stable as $$
  select json_build_object('id', br.id, 'kind', br.kind, 'status', br.status, 'modules', br.modules, 'size', br.size,
    'cons_size', br.cons_size, 'champion', br.champion, 'sudden', br.sudden, 'created_at', br.created_at, 'finished_at', br.finished_at);
$$;

-- ---- student -------------------------------------------------------------------
create or replace function ctf_br_state(p_student uuid)
returns json language plpgsql security definer set search_path = public as $$
declare me students; br brackets; m bracket_matches; v_a boolean;
begin
  select * into me from students where id = p_student and auth_user_id = auth.uid();
  if me.id is null then return json_build_object('error','not_yours'); end if;
  select b.* into br from brackets b join bracket_entrants e on e.bracket_id = b.id and e.student_id = me.id
   where b.class_id = me.class_id and (b.status = 'live' or (b.status = 'done' and b.finished_at > now() - interval '15 minutes'))
   order by (b.status = 'live') desc, b.created_at desc limit 1;
  if br.id is not null and br.status = 'live' then
    update bracket_entrants set last_seen = now() where bracket_id = br.id and student_id = me.id;
    perform _br_tidy(br.id);
    select * into br from brackets where id = br.id;
  end if;
  if br.id is not null then
    select * into m from bracket_matches where bracket_id = br.id and (a = me.id or b = me.id) and not bye
     order by (status in ('ready','live')) desc, (status = 'wait') desc, ready_at desc nulls last, round desc limit 1;
  end if;
  v_a := m.a = me.id;
  return json_build_object('now', now(), 'me', me.id, 'handle', me.handle,
    'bg', (select battle_bg from classes where id = me.class_id),
    'bracket', case when br.id is null then null else _br_head(br) end,
    'tree', case when br.id is null then null else _br_tree(br.id) end,
    'out', case when br.id is null then false else _br_out(br.id, me.id) end,
    'pool_w', (select count(*) from bracket_matches x where x.bracket_id = br.id and x.side = 'pool' and x.winner = me.id),
    'pool_l', (select count(*) from bracket_matches x where x.bracket_id = br.id and x.side = 'pool' and x.winner is not null and x.winner <> me.id and me.id in (x.a, x.b)),
    'match', case when m.id is null then null else json_build_object(
      'id', m.id, 'side', m.side, 'round', m.round, 'status', m.status, 'game_no', m.game_no, 'game_kind', m.game_kind, 'next_at', m.next_at, 'ready_at', m.ready_at,
      'opp', (select handle from students where id = case when v_a then m.b else m.a end),
      'my_games', case when v_a then m.wa else m.wb end, 'opp_games', case when v_a then m.wb else m.wa end,
      'my_pts', case when v_a then m.ga else m.gb end, 'opp_pts', case when v_a then m.gb else m.ga end,
      'my_hp', case when v_a then m.hp_a else m.hp_b end, 'opp_hp', case when v_a then m.hp_b else m.hp_a end,
      'won', case when m.status = 'done' then m.winner = me.id end, 'forfeit', m.forfeit,
      'last_game_mine', m.last_game = me.id,
      'n', m.n, 'def', case when m.game_kind = 'vocab' then m.term_d end, 'mode', case when m.game_kind = 'vocab' then m.mode end,
      'shift', case when m.game_kind = 'vocab' then m.shift end,
      'puzzle', case when m.game_kind <> 'vocab' then null when m.mode = 'decrypt' then _vd_mask(m.term_t, m.id::text || ':' || m.n, _vd_leak(m.term_at)) else m.puzzle end,
      'len', case when m.game_kind = 'vocab' then length(_vd_norm(m.term_t)) end,
      'last_t', m.last_t, 'last_mine', m.last_by = me.id,
      'last_opp', m.last_by is not null and m.last_by <> me.id,
      'q', m.q, 'locked', case when v_a then m.lock_a else m.lock_b end,
      'open', case when br.kind = 'flag' then _br_open(me.id, br.flag_keys) end
    ) end);
end $$;

create or replace function ctf_br_answer(p_student uuid, p_match uuid, p_n int, p_guess text)
returns json language plpgsql security definer set search_path = public as $$
declare me students; m bracket_matches; v_a boolean; v_hp int;
begin
  select * into me from students where id = p_student and auth_user_id = auth.uid();
  if me.id is null then return json_build_object('error','not_yours'); end if;
  select * into m from bracket_matches where id = p_match;
  if m.id is null or (m.a <> me.id and m.b <> me.id) then return json_build_object('error','not_your_match'); end if;
  perform pg_advisory_xact_lock(hashtext('br:' || m.bracket_id::text));
  select * into m from bracket_matches where id = p_match;
  if m.status <> 'live' or m.game_kind is distinct from 'vocab' then return json_build_object('error','over'); end if;
  if m.n <> p_n then return json_build_object('stale', true); end if;
  if _vd_norm(p_guess) = '' then return json_build_object('error','empty'); end if;
  update bracket_entrants set last_seen = now() where bracket_id = m.bracket_id and student_id = me.id;
  v_a := m.a = me.id;
  if _br_is_sd(m.id) then
    if (v_a and m.lock_a) or (not v_a and m.lock_b) then return json_build_object('locked', true); end if;
    if _vd_norm(p_guess) = _vd_norm(m.term_t) then
      update bracket_matches set ga = ga + case when v_a then 1 else 0 end, gb = gb + case when v_a then 0 else 1 end, last_t = term_t, last_by = me.id where id = m.id returning * into m;
      update bracket_matches set hp_a = greatest(0, 300 - 60 * gb), hp_b = greatest(0, 300 - 60 * ga) where id = m.id;
      perform _br_sd_next(m.id);
      return json_build_object('correct', true, 'term', m.term_t, 'sd', true);
    end if;
    update bracket_matches set lock_a = lock_a or v_a, lock_b = lock_b or not v_a where id = m.id returning * into m;
    if m.lock_a and m.lock_b then
      update bracket_matches set last_t = term_t, last_by = null where id = m.id;
      perform _br_sd_next(m.id);
    end if;
    return json_build_object('correct', false, 'sd', true, 'both', m.lock_a and m.lock_b);
  end if;
  if _vd_norm(p_guess) = _vd_norm(m.term_t) then
    if v_a then update bracket_matches set hp_b = greatest(0, hp_b - 75), last_t = term_t, last_by = me.id where id = m.id returning hp_b into v_hp;
    else update bracket_matches set hp_a = greatest(0, hp_a - 75), last_t = term_t, last_by = me.id where id = m.id returning hp_a into v_hp; end if;
    if v_hp <= 0 then perform _br_game_won(m.id, me.id); else perform _br_new_term(m.id); end if;
    return json_build_object('correct', true, 'term', m.term_t, 'ko', v_hp <= 0);
  end if;
  if v_a then update bracket_matches set hp_a = greatest(0, hp_a - 25) where id = m.id returning hp_a into v_hp;
  else update bracket_matches set hp_b = greatest(0, hp_b - 25) where id = m.id returning hp_b into v_hp; end if;
  if v_hp <= 0 then update bracket_matches set last_t = term_t, last_by = null where id = m.id; perform _br_game_won(m.id, case when v_a then m.b else m.a end); end if;
  return json_build_object('correct', false, 'ko', v_hp <= 0);
end $$;

create or replace function ctf_br_titles(p_student uuid)
returns json language plpgsql security definer set search_path = public as $$
declare me students;
begin
  select * into me from students where id = p_student and auth_user_id = auth.uid();
  if me.id is null then return json_build_object('error','not_yours'); end if;
  return json_build_object(
    'titles', (select count(*) from brackets where champion = me.id and status = 'done'),
    'finals', (select count(*) from bracket_entrants e join brackets b on b.id = e.bracket_id where e.student_id = me.id and e.place in ('champion','runner_up')));
end $$;

create or replace function ctf_bg(p_student uuid)
returns json language sql stable security definer set search_path = public as $$
  select coalesce((select c.battle_bg from students s join classes c on c.id = s.class_id where s.id = p_student and s.auth_user_id = auth.uid()), '{}'::jsonb)::json;
$$;

-- ---- teacher -------------------------------------------------------------------
create or replace function ctf_t_bg(p_class uuid)
returns json language plpgsql stable security definer set search_path = public as $$
begin
  if not _is_teacher() then return json_build_object('error','not_teacher'); end if;
  return (select battle_bg from classes where id = p_class)::json;
end $$;

create or replace function ctf_t_bg_set(p_class uuid, p_bg jsonb)
returns json language plpgsql security definer set search_path = public as $$
declare k text; v jsonb := '{}'::jsonb;
begin
  if not _is_teacher() then return json_build_object('error','not_teacher'); end if;
  for k in select jsonb_object_keys(coalesce(p_bg, '{}'::jsonb)) loop
    if k in ('bracket','duel','projector','spectator','arena') and p_bg->>k in ('rain','grid','hex','aurora','course','off') then
      v := v || jsonb_build_object(k, p_bg->>k);
    end if;
  end loop;
  update classes set battle_bg = v where id = p_class;
  return json_build_object('ok', true, 'bg', v);
end $$;

create or replace function ctf_t_br_setup(p_class uuid)
returns json language plpgsql security definer set search_path = public as $$
begin
  if not _is_teacher() then return json_build_object('error','not_teacher'); end if;
  return json_build_object(
    'squads', (select coalesce(json_agg(json_build_object('id', g.id, 'name', g.name, 'color', g.color,
                 'members', (select coalesce(json_agg(json_build_object('id', s.id, 'handle', s.handle, 'login', to_jsonb(s)->>'email',
                               'xp', coalesce(p.points, 0) + coalesce(p.bonus, 0)) order by coalesce(p.points, 0) + coalesce(p.bonus, 0) desc), '[]'::json)
                             from students s left join progress p on p.student_id = s.id
                            where s.group_id = g.id and not _vd_is_teacher_row(to_jsonb(s)->>'email'))) order by g.sort, g.name), '[]'::json)
               from class_groups g where g.class_id = p_class),
    'ungrouped', (select coalesce(json_agg(json_build_object('id', s.id, 'handle', s.handle, 'login', to_jsonb(s)->>'email',
                    'xp', coalesce(p.points, 0) + coalesce(p.bonus, 0)) order by coalesce(p.points, 0) + coalesce(p.bonus, 0) desc), '[]'::json)
                  from students s left join progress p on p.student_id = s.id
                 where s.class_id = p_class and s.group_id is null and not _vd_is_teacher_row(to_jsonb(s)->>'email')),
    'manifest', (select coalesce(json_agg(json_build_object('module', module, 'flags', cardinality(flag_keys)) order by module), '[]'::json)
                   from module_manifest where course = (select course from classes where id = p_class)),
    'live', (select id from brackets where class_id = p_class and status = 'live' limit 1),
    'bg', (select battle_bg from classes where id = p_class));
end $$;

drop function if exists ctf_t_br_create(uuid,text,int[],jsonb,text[],uuid[]);
create or replace function ctf_t_br_create(p_class uuid, p_kind text, p_modules int[], p_pool jsonb, p_modes text[], p_students uuid[], p_sudden boolean default false)
returns json language plpgsql security definer set search_path = public as $$
declare c classes; v_keys text[] := '{}'; v_pool jsonb; v_ids uuid[]; v_id uuid; v_size int;
begin
  if not _is_teacher() then return json_build_object('error','not_teacher'); end if;
  select * into c from classes where id = p_class;
  if c.id is null then return json_build_object('error','no_class'); end if;
  if p_kind not in ('flag','vocab') then return json_build_object('error','bad_kind'); end if;
  if exists (select 1 from brackets where class_id = p_class and status = 'live') then return json_build_object('error','bracket_live'); end if;
  if coalesce(cardinality(p_modules), 0) = 0 then return json_build_object('error','no_modules'); end if;
  v_pool := _vd_pool(p_pool);
  if jsonb_array_length(v_pool) < 4 then return json_build_object('error','too_few_terms'); end if;
  if p_kind = 'flag' then
    select coalesce(array_agg(k), '{}') into v_keys from module_manifest m, unnest(m.flag_keys) k where m.course = c.course and m.module = any(p_modules);
    if cardinality(v_keys) = 0 then return json_build_object('error','no_manifest'); end if;
  end if;
  select coalesce(array_agg(s.id order by coalesce(p.points, 0) + coalesce(p.bonus, 0) desc, random()), '{}') into v_ids
    from students s left join progress p on p.student_id = s.id
   where s.class_id = p_class and s.id = any(coalesce(p_students, '{}')) and not _vd_is_teacher_row(to_jsonb(s)->>'email');
  if cardinality(v_ids) < 2 then return json_build_object('error','need_two'); end if;
  if cardinality(v_ids) > 32 then return json_build_object('error','too_many'); end if;
  insert into brackets (class_id, course, kind, modules, flag_keys, pool, modes, size, created_by, sudden)
    values (p_class, c.course, p_kind, p_modules, v_keys, v_pool, _vd_modes(p_modes), _br_pow2(cardinality(v_ids)), lower(coalesce(_email(), '')), coalesce(p_sudden, false))
    returning id into v_id;
  insert into bracket_entrants (bracket_id, student_id, seed, xp)
    select v_id, x.id, x.ord, coalesce(p.points, 0) + coalesce(p.bonus, 0)
      from unnest(v_ids) with ordinality as x(id, ord) left join progress p on p.student_id = x.id;
  v_size := _br_build(v_id, 'main', v_ids);
  return json_build_object('ok', true, 'id', v_id, 'size', v_size);
end $$;

create or replace function ctf_t_br_state(p_class uuid)
returns json language plpgsql security definer set search_path = public as $$
declare br brackets;
begin
  if not _is_teacher() then return json_build_object('error','not_teacher'); end if;
  select * into br from brackets where class_id = p_class and (status = 'live' or (status = 'done' and finished_at > now() - interval '1 day'))
   order by (status = 'live') desc, created_at desc limit 1;
  if br.id is not null then perform _br_tidy(br.id); select * into br from brackets where id = br.id; end if;
  return json_build_object('now', now(), 'bg', (select battle_bg from classes where id = p_class),
    'bracket', case when br.id is null then null else _br_head(br) end,
    'tree', case when br.id is null then null else _br_tree(br.id) end);
end $$;

create or replace function ctf_t_br_cancel(p_bracket uuid)
returns json language plpgsql security definer set search_path = public as $$
begin
  if not _is_teacher() then return json_build_object('error','not_teacher'); end if;
  update brackets set status = 'cancelled', finished_at = now() where id = p_bracket and status = 'live';
  return json_build_object('ok', true);
end $$;

do $$
declare f text;
begin
  foreach f in array array['_br_tree(uuid)', '_br_tidy(uuid)', '_br_open(uuid,text[])', '_br_out(uuid,uuid)', '_br_pool(uuid)', '_br_sd_next(uuid)', '_br_is_sd(uuid)'] loop
    execute format('revoke all on function %s from public, anon, authenticated', f);
  end loop;
  foreach f in array array[
    'ctf_br_state(uuid)', 'ctf_br_answer(uuid,uuid,int,text)', 'ctf_br_titles(uuid)', 'ctf_bg(uuid)',
    'ctf_t_bg(uuid)', 'ctf_t_bg_set(uuid,jsonb)', 'ctf_t_br_setup(uuid)', 'ctf_t_br_create(uuid,text,int[],jsonb,text[],uuid[],boolean)',
    'ctf_t_br_state(uuid)', 'ctf_t_br_cancel(uuid)'
  ] loop
    execute format('revoke all on function %s from public, anon', f);
    execute format('grant execute on function %s to authenticated', f);
  end loop;
end $$;
notify pgrst, 'reload schema';
