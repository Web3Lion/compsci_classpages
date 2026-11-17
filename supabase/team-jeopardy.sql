-- © 2026 Robert Reasey, South Fayette School District. Licensed CC BY-NC 4.0 (attribution required, no commercial use). See LICENSE.md.
-- ============================================================================
--  TEAM JEOPARDY (v38.0)  —  team-jeopardy.html (projector) / team-jeopardy-play.html
--  The teacher loads a Jeopardy sheet (row 1 categories, then question/answer rows;
--  the board is sent by the teacher's browser, the sheet link never leaves it).
--  Teams = the class squads. Teams take turns picking a tile (first tap on that
--  team counts; a random tile after 15 s; the teacher can also pick). Every student
--  answers every clue; each correct player adds the clue's value to their team.
--  Wrong answers cost nothing. Team score = team $ ÷ players on the team.
--  Daily Doubles: the picking team's correct players earn ×2.
--  XP (38.0 standard): every player on the 1st / 2nd / 3rd team who answered
--  +200 / +150 / +100, everyone else who answered +5; MVP (most $, ties share) +100.
--  Graded on the server by text, never index. Typed guesses are not stored.
--  Students join through the Duel Waiting Room (kind 'jeop').
--  Run after waiting-room.sql (re-run it first: it now knows kind 'jeop') and
--  ping-rush.sql (uses its _pr_ helpers). Safe to re-run.
-- ============================================================================

create table if not exists tj_games (
  id          uuid primary key default gen_random_uuid(),
  class_id    uuid not null references classes(id) on delete cascade,
  status      text not null default 'live' check (status in ('live','done')),
  phase       text not null default 'pick' check (phase in ('pick','q','rev')),
  board       jsonb not null,
  used        jsonb not null default '{}'::jsonb,
  dds         text[] not null default '{}',
  groups      uuid[] not null,
  pick_group  uuid,
  pick_ends   timestamptz,
  cur_li      int,
  cur_c       int,
  n           int not null default 0,
  q_ends      timestamptz,
  revealed_at timestamptz,
  ctime       int not null default 30,
  mult        int not null default 1,
  paid        boolean not null default false,
  started_at  timestamptz not null default now(),
  finished_at timestamptz
);
create index if not exists tj_games_class on tj_games (class_id, started_at desc);

create table if not exists tj_players (
  game_id    uuid not null references tj_games(id) on delete cascade,
  student_id uuid not null references students(id) on delete cascade,
  group_id   uuid,
  cash       int not null default 0,
  answered   int not null default 0,
  last_seen  timestamptz not null default 'epoch',
  primary key (game_id, student_id)
);

create table if not exists tj_answers (
  game_id    uuid not null,
  student_id uuid not null,
  n          int  not null,
  ok         boolean not null default false,
  pts        int not null default 0,
  tries      int not null default 0,
  last_try   timestamptz,
  primary key (game_id, student_id, n),
  foreign key (game_id, student_id) references tj_players (game_id, student_id) on delete cascade
);

alter table tj_games   enable row level security;
alter table tj_players enable row level security;
alter table tj_answers enable row level security;

-- ---- helpers -----------------------------------------------------------------
-- board from the teacher: {cats: [..≤8], levels: [[{q, a}..]..≤10]}
create or replace function _tj_clean(p jsonb) returns jsonb
language plpgsql as $fn$
declare cats jsonb := '[]'::jsonb; lv jsonb := '[]'::jsonb; row jsonb; cell jsonb; nc int; c int; r jsonb;
begin
  if p is null or jsonb_typeof(p->'cats') <> 'array' or jsonb_typeof(p->'levels') <> 'array' then return null; end if;
  select coalesce(jsonb_agg(to_jsonb(left(trim(x), 80))), '[]'::jsonb) into cats from (select x from jsonb_array_elements_text(p->'cats') x limit 8) z;
  nc := jsonb_array_length(cats);
  if nc < 1 then return null; end if;
  for r in select x from jsonb_array_elements(p->'levels') x limit 10 loop
    row := '[]'::jsonb;
    for c in 0 .. nc - 1 loop
      cell := case when jsonb_typeof(r) = 'array' then r -> c end;
      row := row || jsonb_build_array(jsonb_build_object('q', left(trim(coalesce(cell->>'q', '')), 500), 'a', left(trim(coalesce(cell->>'a', '')), 160)));
    end loop;
    lv := lv || jsonb_build_array(row);
  end loop;
  if jsonb_array_length(lv) < 1 then return null; end if;
  return jsonb_build_object('cats', cats, 'levels', lv);
end $fn$;

create or replace function _tj_cell(g tj_games, li int, c int) returns jsonb language sql immutable as $fn$
  select g.board -> 'levels' -> li -> c;
$fn$;
create or replace function _tj_ok_cell(x jsonb) returns boolean language sql immutable as $fn$
  select coalesce(x->>'q', '') <> '' and _pr_norm(x->>'a') <> '';
$fn$;
create or replace function _tj_val(g tj_games, li int) returns int language sql immutable as $fn$
  select (li + 1) * 100 * greatest(coalesce(g.mult, 1), 1);
$fn$;
-- text, never index: any "/" alternative, the answer without "(…)", or what is inside "(…)"
create or replace function _tj_right(p_answer text, p_guess text) returns boolean language sql immutable as $fn$
  select _pr_ok(p_answer, p_guess, false)
      or (_pr_norm(p_guess) <> '' and exists (select 1 from regexp_matches(coalesce(p_answer, ''), '\(([^)]*)\)', 'g') m where _pr_norm(m[1]) = _pr_norm(p_guess)));
$fn$;
create or replace function _tj_open_keys(g tj_games) returns text[] language sql immutable as $fn$
  select coalesce(array_agg(li || ':' || c), '{}') from
    generate_series(0, jsonb_array_length(g.board->'levels') - 1) li,
    generate_series(0, jsonb_array_length(g.board->'cats') - 1) c
   where _tj_ok_cell(g.board -> 'levels' -> li -> c) and not (g.used ? (li || ':' || c));
$fn$;

create or replace function _tj_teams(p_game uuid) returns json
language sql stable security definer set search_path = public as $fn$
  select coalesce(json_agg(row_to_json(t) order by t.avg desc, t.cash desc, t.name), '[]'::json) from (
    select gr.id, gr.name, gr.color, count(p.student_id)::int as n, coalesce(sum(p.cash), 0)::int as cash,
           coalesce(round(sum(p.cash)::numeric / nullif(count(p.student_id), 0)), 0)::int as avg
      from tj_games g cross join unnest(g.groups) gid join class_groups gr on gr.id = gid
      left join tj_players p on p.game_id = g.id and p.group_id = gr.id
     where g.id = p_game
     group by gr.id, gr.name, gr.color) t;
$fn$;

-- next team in order (after the current picker) that has someone on the page
create or replace function _tj_next_group(g tj_games) returns uuid
language plpgsql stable security definer set search_path = public as $fn$
declare n int := cardinality(g.groups); i int; start int := coalesce(array_position(g.groups, g.pick_group), 0); gid uuid;
begin
  for i in 1 .. n loop
    gid := g.groups[((start + i - 1) % n) + 1];
    if exists (select 1 from tj_players p where p.game_id = g.id and p.group_id = gid and p.last_seen > now() - interval '15 seconds') then return gid; end if;
  end loop;
  return g.groups[(start % n) + 1];
end $fn$;

create or replace function _tj_pay(p_student uuid, p_amount int, p_reason text) returns void
language plpgsql security definer set search_path = public as $fn$
declare v_class uuid; v_tb int; v_cb int;
begin
  if coalesce(p_amount, 0) <= 0 then return; end if;
  select class_id into v_class from students where id = p_student;
  if v_class is null then return; end if;
  insert into progress (student_id, course, points, bonus)
    select p_student, c.course, 0, 0 from classes c where c.id = v_class
    on conflict (student_id) do nothing;
  select coalesce(teacher_bonus, 0), coalesce(client_bonus, bonus, 0) into v_tb, v_cb from progress where student_id = p_student;
  update progress set teacher_bonus = v_tb + p_amount, bonus = v_cb + v_tb + p_amount, updated_at = now() where student_id = p_student;
  insert into xp_grants (class_id, student_id, teacher_email, amount, reason) values (v_class, p_student, 'team-jeopardy', p_amount, p_reason);
end $fn$;

create or replace function _tj_start_pick(p_game uuid) returns void
language plpgsql security definer set search_path = public as $fn$
declare g tj_games;
begin
  select * into g from tj_games where id = p_game;
  update tj_games set phase = 'pick', pick_group = _tj_next_group(g), pick_ends = now() + interval '15 seconds',
         cur_li = null, cur_c = null, q_ends = null, revealed_at = null where id = p_game;
end $fn$;

create or replace function _tj_open(p_game uuid, p_key text) returns boolean
language plpgsql security definer set search_path = public as $fn$
declare g tj_games; li int; c int;
begin
  select * into g from tj_games where id = p_game for update;
  if g.id is null or g.status <> 'live' or g.phase <> 'pick' or coalesce(p_key, '') !~ '^[0-9]{1,2}:[0-9]$' then return false; end if;
  li := split_part(p_key, ':', 1)::int; c := split_part(p_key, ':', 2)::int;
  if not (p_key = any(_tj_open_keys(g))) then return false; end if;
  update tj_games set phase = 'q', used = used || jsonb_build_object(p_key, true), cur_li = li, cur_c = c, n = n + 1,
         q_ends = now() + make_interval(secs => ctime), revealed_at = null, pick_ends = null where id = p_game;
  return true;
end $fn$;

create or replace function _tj_finish(p_game uuid) returns void
language plpgsql security definer set search_path = public as $fn$
declare g tj_games; x record; v_mvp int; v_amt int;
begin
  select * into g from tj_games where id = p_game for update;
  if g.id is null then return; end if;
  update tj_games set status = 'done', phase = 'rev', finished_at = coalesce(finished_at, now()) where id = p_game;
  if g.paid then return; end if;
  select max(cash) into v_mvp from tj_players where game_id = p_game and answered > 0;
  for x in
    select p.student_id, p.cash, coalesce(t.place, 99) as place
      from tj_players p
      left join (select y.id, dense_rank() over (order by y.avg desc) as place
                   from json_to_recordset(_tj_teams(p_game)) as y(id uuid, avg int) where y.avg > 0) t on t.id = p.group_id
      join students s on s.id = p.student_id
     where p.game_id = p_game and p.answered > 0 and not _pr_is_teacher_row(to_jsonb(s)->>'email')
  loop
    v_amt := case x.place when 1 then 200 when 2 then 150 when 3 then 100 else 5 end
           + case when coalesce(v_mvp, 0) > 0 and x.cash = v_mvp then 100 else 0 end;
    perform _tj_pay(x.student_id, v_amt, 'Team Jeopardy ' || case when x.place <= 3 then '#' || x.place || ' team' else 'played' end
      || case when coalesce(v_mvp, 0) > 0 and x.cash = v_mvp then ' + MVP' else '' end);
  end loop;
  update tj_games set paid = true where id = p_game;
end $fn$;

create or replace function _tj_tick(p_game uuid) returns tj_games
language plpgsql security definer set search_path = public as $fn$
declare g tj_games; ks text[];
begin
  select * into g from tj_games where id = p_game;
  if g.id is null or g.status <> 'live' then return g; end if;
  if g.phase = 'pick' then
    if not exists (select 1 from tj_players p where p.game_id = g.id and p.group_id = g.pick_group and p.last_seen > now() - interval '15 seconds')
       and exists (select 1 from tj_players p where p.game_id = g.id and p.last_seen > now() - interval '15 seconds') then
      update tj_games set pick_group = _tj_next_group(g) where id = g.id;
    end if;
    if now() >= g.pick_ends then
      ks := _tj_open_keys(g);
      if cardinality(ks) = 0 then perform _tj_finish(g.id); else perform _tj_open(g.id, ks[1 + floor(random() * cardinality(ks))::int]); end if;
    end if;
  elsif g.phase = 'q' then
    if now() >= g.q_ends
       or (exists (select 1 from tj_players p where p.game_id = g.id and p.last_seen > now() - interval '15 seconds')
           and not exists (select 1 from tj_players p where p.game_id = g.id and p.last_seen > now() - interval '15 seconds'
                             and not exists (select 1 from tj_answers a where a.game_id = g.id and a.student_id = p.student_id and a.n = g.n and a.ok))) then
      update tj_games set phase = 'rev', revealed_at = now() where id = g.id;
    end if;
  elsif g.phase = 'rev' and g.revealed_at < now() - interval '9 seconds' then
    if cardinality(_tj_open_keys(g)) = 0 then perform _tj_finish(g.id); else perform _tj_start_pick(g.id); end if;
  end if;
  select * into g from tj_games where id = p_game;
  return g;
end $fn$;

create or replace function _tj_latest(p_class uuid) returns tj_games
language sql stable security definer set search_path = public as $fn$
  select * from tj_games where class_id = p_class order by started_at desc limit 1;
$fn$;

-- board as values for the picker / projector: 0 = used or empty
create or replace function _tj_grid(g tj_games) returns json language sql immutable as $fn$
  select json_build_object('cats', g.board->'cats', 'rows', (
    select coalesce(json_agg(r order by li), '[]'::json) from (
      select li, (select json_agg(case when _tj_ok_cell(g.board->'levels'->li->c) and not (g.used ? (li || ':' || c)) then _tj_val(g, li) else 0 end order by c)
                    from generate_series(0, jsonb_array_length(g.board->'cats') - 1) c) as r
        from generate_series(0, jsonb_array_length(g.board->'levels') - 1) li) z));
$fn$;

create or replace function _tj_clue(g tj_games, p_answer boolean) returns json language sql immutable as $fn$
  select case when g.cur_li is null then null else json_build_object(
    'cat', g.board->'cats'->>g.cur_c, 'val', _tj_val(g, g.cur_li), 'dd', (g.cur_li || ':' || g.cur_c) = any(g.dds),
    'q', _tj_cell(g, g.cur_li, g.cur_c)->>'q', 'mask', _pr_mask(_tj_cell(g, g.cur_li, g.cur_c)->>'a'),
    'a', case when p_answer then _tj_cell(g, g.cur_li, g.cur_c)->>'a' end) end;
$fn$;

-- ---- teacher -------------------------------------------------------------------
create or replace function ctf_t_tj_start(p_class uuid, p_board jsonb, p_ctime int default 30, p_dd int default 1, p_mult int default 1, p_groups uuid[] default null)
returns json language plpgsql security definer set search_path = public as $fn$
declare b jsonb; v_sel uuid[]; v_id uuid; cells text[]; g tj_games;
begin
  if not _is_teacher() then return json_build_object('error', 'not_teacher'); end if;
  if exists (select 1 from tj_games where class_id = p_class and status = 'live') then return json_build_object('error', 'jeop_live'); end if;
  b := _tj_clean(p_board);
  if b is null then return json_build_object('error', 'bad_board'); end if;
  select coalesce(array_agg(gr.id order by gr.sort, gr.name), '{}') into v_sel from class_groups gr
   where gr.class_id = p_class and (coalesce(cardinality(p_groups), 0) = 0 or gr.id = any(p_groups))
     and exists (select 1 from students s where s.group_id = gr.id and not _pr_is_teacher_row(to_jsonb(s)->>'email'));
  if cardinality(v_sel) < 2 then return json_build_object('error', 'need_two_teams'); end if;
  delete from tj_games where class_id = p_class and status = 'done' and started_at < now() - interval '7 days';
  insert into tj_games (class_id, board, groups, ctime, mult)
    values (p_class, b, v_sel, least(greatest(coalesce(p_ctime, 30), 10), 120), case when p_mult = 2 then 2 else 1 end)
    returning * into g;
  select coalesce(array_agg(k order by random()), '{}') into cells from unnest(_tj_open_keys(g)) k
   where split_part(k, ':', 1)::int > 0 or jsonb_array_length(b->'levels') < 3;
  update tj_games set dds = cells[1:least(greatest(coalesce(p_dd, 1), 0), 2)], pick_group = v_sel[cardinality(v_sel)] where id = g.id;
  insert into tj_players (game_id, student_id, group_id)
    select g.id, s.id, s.group_id from students s
     where s.class_id = p_class and s.group_id = any(v_sel) and not _pr_is_teacher_row(to_jsonb(s)->>'email');
  perform _tj_start_pick(g.id);
  return json_build_object('ok', true, 'id', g.id);
end $fn$;

create or replace function ctf_t_tj_state(p_class uuid)
returns json language plpgsql security definer set search_path = public as $fn$
declare g tj_games; v_here int; v_tried int; v_ok int;
begin
  if not _is_teacher() then return json_build_object('error', 'not_teacher'); end if;
  g := _tj_latest(p_class);
  if g.id is null or (g.status = 'done' and g.finished_at < now() - interval '2 hours') then return json_build_object('now', now(), 'session', null); end if;
  g := _tj_tick(g.id);
  select count(*) into v_here from tj_players where game_id = g.id and last_seen > now() - interval '15 seconds';
  select count(*), count(*) filter (where ok) into v_tried, v_ok from tj_answers where game_id = g.id and n = g.n;
  return json_build_object('now', now(), 'session', json_build_object(
    'id', g.id, 'status', g.status, 'phase', g.phase, 'n', g.n, 'ctime', g.ctime, 'q_ends', g.q_ends, 'pick_ends', g.pick_ends,
    'pick', (select json_build_object('id', gr.id, 'name', gr.name, 'color', gr.color) from class_groups gr where gr.id = g.pick_group),
    'grid', _tj_grid(g), 'left', cardinality(_tj_open_keys(g)),
    'clue', _tj_clue(g, g.phase = 'rev' or g.status = 'done'),
    'here', v_here, 'tried', v_tried, 'right', v_ok,
    'teams', _tj_teams(g.id),
    'per', (select coalesce(json_agg(json_build_object('id', p.group_id, 'n', count_all, 'ok', count_ok)), '[]'::json) from (
              select p.group_id, count(*) as count_all, count(*) filter (where a.ok) as count_ok
                from tj_players p left join tj_answers a on a.game_id = p.game_id and a.student_id = p.student_id and a.n = g.n
               where p.game_id = g.id and (p.last_seen > now() - interval '15 seconds' or a.student_id is not null) group by p.group_id) p),
    'mvp', (select coalesce(json_agg(json_build_object('h', s.handle, 'c', p.cash, 'g', p.group_id) order by p.cash desc), '[]'::json)
              from (select * from tj_players where game_id = g.id and cash > 0 order by cash desc limit 3) p join students s on s.id = p.student_id)));
end $fn$;

create or replace function ctf_t_tj_pick(p_class uuid, p_key text)
returns json language plpgsql security definer set search_path = public as $fn$
declare g tj_games;
begin
  if not _is_teacher() then return json_build_object('error', 'not_teacher'); end if;
  select * into g from tj_games where class_id = p_class and status = 'live' order by started_at desc limit 1;
  if g.id is null then return json_build_object('error', 'no_game'); end if;
  return json_build_object('ok', _tj_open(g.id, p_key));
end $fn$;

-- q → reveal now; rev → next pick (or finish when the board is empty)
create or replace function ctf_t_tj_next(p_class uuid)
returns json language plpgsql security definer set search_path = public as $fn$
declare g tj_games;
begin
  if not _is_teacher() then return json_build_object('error', 'not_teacher'); end if;
  select * into g from tj_games where class_id = p_class and status = 'live' order by started_at desc limit 1 for update;
  if g.id is null then return json_build_object('error', 'no_game'); end if;
  if g.phase = 'q' then update tj_games set phase = 'rev', revealed_at = now() where id = g.id;
  elsif g.phase = 'rev' then
    if cardinality(_tj_open_keys(g)) = 0 then perform _tj_finish(g.id); else perform _tj_start_pick(g.id); end if;
  end if;
  return json_build_object('ok', true);
end $fn$;

create or replace function ctf_t_tj_end(p_class uuid)
returns json language plpgsql security definer set search_path = public as $fn$
declare g tj_games;
begin
  if not _is_teacher() then return json_build_object('error', 'not_teacher'); end if;
  select * into g from tj_games where class_id = p_class and status = 'live' order by started_at desc limit 1;
  if g.id is null then return json_build_object('error', 'no_game'); end if;
  perform _tj_finish(g.id);
  return json_build_object('ok', true);
end $fn$;

-- ---- student -------------------------------------------------------------------
create or replace function ctf_tj_state(p_student uuid)
returns json language plpgsql security definer set search_path = public as $fn$
declare me students; g tj_games; pl tj_players; an tj_answers; tm json; v_rank int; v_of int; v_avg int; v_win text;
begin
  select * into me from students where id = p_student and auth_user_id = auth.uid();
  if me.id is null then return json_build_object('error', 'not_yours'); end if;
  g := _tj_latest(me.class_id);
  if g.id is null or (g.status = 'done' and g.finished_at < now() - interval '15 minutes') then return json_build_object('now', now(), 'status', null); end if;
  select * into pl from tj_players where game_id = g.id and student_id = me.id;
  if pl.student_id is null then return json_build_object('now', now(), 'status', 'out', 'handle', me.handle); end if;
  if g.status = 'live' then
    update tj_players set last_seen = now() where game_id = g.id and student_id = me.id;
    g := _tj_tick(g.id);
  end if;
  select * into an from tj_answers where game_id = g.id and student_id = me.id and n = g.n;
  tm := _tj_teams(g.id);
  select r, a into v_rank, v_avg from (select (row_number() over ()) as r, (x->>'id')::uuid as id, (x->>'avg')::int as a from json_array_elements(tm) x) z where id = pl.group_id;
  v_of := json_array_length(tm); v_win := tm->0->>'name';
  return json_build_object('now', now(), 'id', g.id, 'status', g.status, 'phase', g.phase, 'n', g.n, 'handle', me.handle,
    'team', (select json_build_object('id', gr.id, 'name', gr.name, 'color', gr.color) from class_groups gr where gr.id = pl.group_id),
    'pick', (select json_build_object('id', gr.id, 'name', gr.name, 'color', gr.color) from class_groups gr where gr.id = g.pick_group),
    'mine_pick', g.phase = 'pick' and g.pick_group = pl.group_id, 'pick_ends', g.pick_ends, 'q_ends', g.q_ends, 'ctime', g.ctime,
    'grid', case when g.status = 'live' and g.phase = 'pick' and g.pick_group = pl.group_id then _tj_grid(g) end,
    'clue', case when g.status = 'live' and g.phase in ('q','rev') then _tj_clue(g, g.phase = 'rev') end,
    'ok', coalesce(an.ok, false), 'pts', coalesce(an.pts, 0), 'cash', pl.cash,
    'tavg', coalesce(v_avg, 0), 'trank', coalesce(v_rank, 0), 'tof', v_of, 'win', v_win);
end $fn$;

create or replace function ctf_tj_pick(p_student uuid, p_game uuid, p_key text)
returns json language plpgsql security definer set search_path = public as $fn$
declare me students; g tj_games; pl tj_players;
begin
  select * into me from students where id = p_student and auth_user_id = auth.uid();
  if me.id is null then return json_build_object('error', 'not_yours'); end if;
  select * into g from tj_games where id = p_game and class_id = me.class_id;
  select * into pl from tj_players where game_id = p_game and student_id = me.id;
  if g.id is null or pl.student_id is null or g.phase <> 'pick' or g.pick_group is distinct from pl.group_id then return json_build_object('error', 'not_your_pick'); end if;
  return json_build_object('ok', _tj_open(g.id, p_key));
end $fn$;

create or replace function ctf_tj_answer(p_student uuid, p_game uuid, p_n int, p_answer text)
returns json language plpgsql security definer set search_path = public as $fn$
declare me students; g tj_games; pl tj_players; an tj_answers; v_pts int;
begin
  select * into me from students where id = p_student and auth_user_id = auth.uid();
  if me.id is null then return json_build_object('error', 'not_yours'); end if;
  select * into g from tj_games where id = p_game and class_id = me.class_id for update;
  if g.id is null or g.status <> 'live' or g.phase <> 'q' or g.n <> p_n or now() > g.q_ends + interval '1 second' then return json_build_object('error', 'closed'); end if;
  select * into pl from tj_players where game_id = g.id and student_id = me.id;
  if pl.student_id is null then return json_build_object('error', 'not_playing'); end if;
  insert into tj_answers (game_id, student_id, n) values (g.id, me.id, g.n) on conflict do nothing;
  select * into an from tj_answers where game_id = g.id and student_id = me.id and n = g.n for update;
  if an.ok then return json_build_object('ok', true, 'pts', an.pts); end if;
  if an.last_try is not null and an.last_try > now() - interval '400 milliseconds' then return json_build_object('error', 'slow'); end if;
  update tj_players set last_seen = now(), answered = answered + case when an.tries = 0 then 1 else 0 end where game_id = g.id and student_id = me.id;
  if _tj_right(_tj_cell(g, g.cur_li, g.cur_c)->>'a', left(coalesce(p_answer, ''), 160)) then
    v_pts := _tj_val(g, g.cur_li) * case when (g.cur_li || ':' || g.cur_c) = any(g.dds) and pl.group_id = g.pick_group then 2 else 1 end;
    update tj_answers set ok = true, pts = v_pts, tries = tries + 1, last_try = now() where game_id = g.id and student_id = me.id and n = g.n;
    update tj_players set cash = cash + v_pts where game_id = g.id and student_id = me.id;
    return json_build_object('ok', true, 'pts', v_pts);
  end if;
  update tj_answers set tries = tries + 1, last_try = now() where game_id = g.id and student_id = me.id and n = g.n;
  return json_build_object('ok', false);
end $fn$;

do $$
declare f text;
begin
  foreach f in array array['_tj_clean(jsonb)', '_tj_cell(tj_games,int,int)', '_tj_ok_cell(jsonb)', '_tj_val(tj_games,int)', '_tj_right(text,text)', '_tj_open_keys(tj_games)',
                           '_tj_teams(uuid)', '_tj_next_group(tj_games)', '_tj_pay(uuid,int,text)', '_tj_start_pick(uuid)', '_tj_open(uuid,text)', '_tj_finish(uuid)',
                           '_tj_tick(uuid)', '_tj_latest(uuid)', '_tj_grid(tj_games)', '_tj_clue(tj_games,boolean)'] loop
    execute format('revoke all on function %s from public, anon, authenticated', f);
  end loop;
  foreach f in array array['ctf_t_tj_start(uuid,jsonb,int,int,int,uuid[])', 'ctf_t_tj_state(uuid)', 'ctf_t_tj_pick(uuid,text)', 'ctf_t_tj_next(uuid)', 'ctf_t_tj_end(uuid)',
                           'ctf_tj_state(uuid)', 'ctf_tj_pick(uuid,uuid,text)', 'ctf_tj_answer(uuid,uuid,int,text)'] loop
    execute format('revoke all on function %s from public, anon', f);
    execute format('grant execute on function %s to authenticated', f);
  end loop;
end $$;
notify pgrst, 'reload schema';
