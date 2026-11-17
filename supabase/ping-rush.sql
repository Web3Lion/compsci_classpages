-- © 2026 Robert Reasey, South Fayette School District. Licensed CC BY-NC 4.0 (attribution required, no commercial use). See LICENSE.md.
-- ============================================================================
--  PING RUSH (v37.0)  —  whole-class speed quiz (ping-rush.html / ping-rush-play.html)
--  The teacher starts a game from a Google Sheet or course vocab; every student
--  answers the same question at once. Correct = 500–1,000 points (faster = more),
--  37.1: pace 'timed' (ends on timer / everyone done, teacher presses Next),
--  'teacher' (no timer; teacher presses Show answer, then Next) or 'auto' (next
--  question 8 s after the answer shows). Each question may carry its own time
--  ('t', 5–300 s, from a Time column in the sheet).
--  +100 on a 3-in-a-row streak. The question ends when time runs out or everyone
--  is done; the teacher moves on with Next. Students join through the Duel
--  Waiting Room (kind 'rush').
--  XP when it ends (38.0 standard): 1st +200, 2nd +150, 3rd +100 (score > 0), everyone else who
--  answered at least once +5. Teacher mirror rows are never paid.
--  Answers are graded on the server by text (lowercase letters/digits), never
--  by index. Typed guesses are not stored. Games older than 7 days are deleted
--  when the class starts a new one.
--  Run after waiting-room.sql and vocab-duels.sql (re-run waiting-room.sql first:
--  it now knows kind 'rush'). Safe to re-run.
-- ============================================================================

create table if not exists ping_rush (
  id          uuid primary key default gen_random_uuid(),
  class_id    uuid not null references classes(id) on delete cascade,
  status      text not null default 'live' check (status in ('live','done')),
  phase       text not null default 'q' check (phase in ('q','reveal')),
  qi          int  not null default 1,
  total       int  not null,
  qtime       int  not null default 20,
  questions   jsonb not null,
  q_ends      timestamptz,
  started_at  timestamptz not null default now(),
  finished_at timestamptz,
  paid        boolean not null default false
);
create index if not exists ping_rush_class on ping_rush (class_id, started_at desc);
alter table ping_rush add column if not exists pace text not null default 'timed';
alter table ping_rush add column if not exists q_start timestamptz;
alter table ping_rush add column if not exists revealed_at timestamptz;
alter table ping_rush drop constraint if exists ping_rush_pace_check;
alter table ping_rush add constraint ping_rush_pace_check check (pace in ('timed','teacher','auto'));

create table if not exists ping_players (
  rush_id    uuid not null references ping_rush(id) on delete cascade,
  student_id uuid not null references students(id) on delete cascade,
  score      int not null default 0,
  streak     int not null default 0,
  last_pts   int not null default 0,
  answered   int not null default 0,
  last_ok    timestamptz,
  last_seen  timestamptz not null default now(),
  primary key (rush_id, student_id)
);

create table if not exists ping_answers (
  rush_id    uuid not null,
  student_id uuid not null,
  qi         int  not null,
  ok         boolean not null default false,
  locked     boolean not null default false,
  pts        int not null default 0,
  tries      int not null default 0,
  last_try   timestamptz,
  primary key (rush_id, student_id, qi),
  foreign key (rush_id, student_id) references ping_players (rush_id, student_id) on delete cascade
);

alter table ping_rush    enable row level security;
alter table ping_players enable row level security;
alter table ping_answers enable row level security;

-- ---- helpers -----------------------------------------------------------------
create or replace function _pr_norm(p text) returns text language sql immutable as $fn$
  select lower(regexp_replace(coalesce(p, ''), '[^A-Za-z0-9]', '', 'g'));
$fn$;

-- display answer: drop "(…)" notes, first "/" alternative
create or replace function _pr_disp(p text) returns text language sql immutable as $fn$
  select coalesce(nullif(trim(split_part(regexp_replace(coalesce(p, ''), '\([^)]*\)', '', 'g'), '/', 1)), ''), trim(coalesce(p, '')));
$fn$;

-- letter outline for typed answers: letters/digits become "_", spaces and punctuation stay
create or replace function _pr_mask(p text) returns text language sql immutable as $fn$
  select regexp_replace(_pr_disp(p), '[A-Za-z0-9]', '_', 'g');
$fn$;

-- text, never index: multiple choice must match the answer; typed answers may match any "/" alternative
create or replace function _pr_ok(p_answer text, p_guess text, p_mc boolean) returns boolean language sql immutable as $fn$
  select _pr_norm(p_guess) <> '' and (
    _pr_norm(p_guess) = _pr_norm(p_answer)
    or (not p_mc and (
      _pr_norm(p_guess) = _pr_norm(_pr_disp(p_answer))
      or exists (select 1 from unnest(string_to_array(regexp_replace(coalesce(p_answer, ''), '\([^)]*\)', '', 'g'), '/')) x
                  where _pr_norm(x) <> '' and _pr_norm(x) = _pr_norm(p_guess)))));
$fn$;

create or replace function _pr_is_teacher_row(p_email text) returns boolean
language sql stable security definer set search_path = public as $fn$
  select coalesce(p_email, '') <> '' and exists (select 1 from teachers t where t.email = lower(p_email));
$fn$;

-- cleans the teacher-sent list: [{q, a, k: 'mc'|'fr', o: [choices]}]; mc keeps 2–4 distinct choices incl. the answer
create or replace function _pr_clean(p jsonb) returns jsonb
language plpgsql as $fn$
declare e jsonb; res jsonb := '[]'::jsonb; q text; a text; k text; o jsonb; opt text; seen text[]; t int;
begin
  if p is null or jsonb_typeof(p) <> 'array' then return res; end if;
  for e in select x from jsonb_array_elements(p) x limit 500 loop
    if jsonb_typeof(e) <> 'object' then continue; end if;
    q := left(trim(coalesce(e->>'q', '')), 400); a := left(trim(coalesce(e->>'a', '')), 160);
    k := case when e->>'k' = 'mc' then 'mc' else 'fr' end; o := '[]'::jsonb;
    if q = '' or _pr_norm(a) = '' then continue; end if;
    if k = 'mc' then
      seen := array[_pr_norm(a)]; o := jsonb_build_array(a);
      if jsonb_typeof(e->'o') = 'array' then
        for opt in select left(trim(x), 160) from jsonb_array_elements_text(e->'o') x loop
          exit when jsonb_array_length(o) >= 4;
          if _pr_norm(opt) = '' or _pr_norm(opt) = any(seen) then continue; end if;
          seen := seen || _pr_norm(opt); o := o || to_jsonb(opt);
        end loop;
      end if;
      if jsonb_array_length(o) < 2 then k := 'fr'; o := '[]'::jsonb;
      else select jsonb_agg(v order by random()) into o from jsonb_array_elements(o) v; end if;
    end if;
    t := case when coalesce(e->>'t', '') ~ '^[0-9]{1,3}$' then (e->>'t')::int end;
    if t is not null and (t < 5 or t > 300) then t := null; end if;
    res := res || jsonb_build_array(jsonb_build_object('q', q, 'a', a, 'k', k, 'o', o) || case when t is null then '{}'::jsonb else jsonb_build_object('t', t) end
                                    || case when lower(coalesce(e->>'x2', '')) in ('1', 'true', 'yes', 'y', 'x2', '2', 'double') then '{"x2": true}'::jsonb else '{}'::jsonb end);
  end loop;
  return res;
end $fn$;

create or replace function _pr_pay(p_student uuid, p_amount int, p_reason text) returns void
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
  insert into xp_grants (class_id, student_id, teacher_email, amount, reason) values (v_class, p_student, 'ping-rush', p_amount, p_reason);
end $fn$;

create or replace function _pr_secs(r ping_rush) returns int language sql immutable as $fn$
  select coalesce(nullif(r.questions -> (r.qi - 1) ->> 't', '')::int, r.qtime);
$fn$;

-- opens question r.qi: sets its start, and its end unless teacher-paced
create or replace function _pr_open(p_id uuid) returns void
language plpgsql security definer set search_path = public as $fn$
declare r ping_rush;
begin
  select * into r from ping_rush where id = p_id;
  update ping_rush set phase = 'q', q_start = now(), revealed_at = null,
         q_ends = case when r.pace = 'teacher' then null else now() + make_interval(secs => _pr_secs(r)) end
   where id = p_id;
end $fn$;

create or replace function _pr_reveal(p_id uuid) returns void
language plpgsql security definer set search_path = public as $fn$
declare r ping_rush;
begin
  select * into r from ping_rush where id = p_id;
  if r.id is null or r.status <> 'live' or r.phase <> 'q' then return; end if;
  update ping_players pl set
      last_pts = coalesce((select a.pts from ping_answers a where a.rush_id = pl.rush_id and a.student_id = pl.student_id and a.qi = r.qi and a.ok), 0),
      streak   = case when exists (select 1 from ping_answers a where a.rush_id = pl.rush_id and a.student_id = pl.student_id and a.qi = r.qi and a.ok) then pl.streak else 0 end
   where pl.rush_id = p_id;
  update ping_rush set phase = 'reveal', revealed_at = now() where id = p_id;
end $fn$;

create or replace function _pr_finish(p_id uuid) returns void
language plpgsql security definer set search_path = public as $fn$
declare r ping_rush; x record;
begin
  select * into r from ping_rush where id = p_id for update;
  if r.id is null then return; end if;
  if r.status = 'live' and r.phase = 'q' then perform _pr_reveal(p_id); end if;
  update ping_rush set status = 'done', finished_at = coalesce(finished_at, now()) where id = p_id;
  if r.paid then return; end if;
  for x in
    select pl.student_id, pl.score,
           row_number() over (order by pl.score desc, pl.last_ok asc nulls last) as place
      from ping_players pl join students s on s.id = pl.student_id
     where pl.rush_id = p_id and pl.answered > 0 and not _pr_is_teacher_row(to_jsonb(s)->>'email')
  loop
    perform _pr_pay(x.student_id,
      case when x.score > 0 and x.place = 1 then 200 when x.score > 0 and x.place = 2 then 150 when x.score > 0 and x.place = 3 then 100 else 5 end,   -- 38.0 XP standard
      'Ping Rush ' || case when x.score > 0 and x.place <= 3 then '#' || x.place else 'played' end);
  end loop;
  update ping_rush set paid = true where id = p_id;
end $fn$;

-- auto-reveal when time is up or every present player is done with the question
create or replace function _pr_tick(p_id uuid) returns ping_rush
language plpgsql security definer set search_path = public as $fn$
declare r ping_rush;
begin
  select * into r from ping_rush where id = p_id;
  if r.id is not null and r.status = 'live' and r.phase = 'reveal' and r.pace = 'auto' and r.revealed_at < now() - interval '8 seconds' then
    if r.qi >= r.total then perform _pr_finish(p_id); else update ping_rush set qi = qi + 1 where id = p_id; perform _pr_open(p_id); end if;
    select * into r from ping_rush where id = p_id;
    return r;
  end if;
  if r.id is not null and r.status = 'live' and r.phase = 'q' and r.pace <> 'teacher' and (
       now() >= r.q_ends
       or (exists (select 1 from ping_players pl where pl.rush_id = p_id and pl.last_seen > now() - interval '15 seconds')
           and not exists (select 1 from ping_players pl where pl.rush_id = p_id and pl.last_seen > now() - interval '15 seconds'
                             and not exists (select 1 from ping_answers a where a.rush_id = p_id and a.student_id = pl.student_id and a.qi = r.qi and (a.ok or a.locked))))) then
    perform _pr_reveal(p_id);
    select * into r from ping_rush where id = p_id;
  end if;
  return r;
end $fn$;

create or replace function _pr_board(p_id uuid, p_n int) returns json
language sql stable security definer set search_path = public as $fn$
  select coalesce(json_agg(json_build_object('h', h, 's', score, 'l', last_pts) order by score desc, last_ok asc nulls last), '[]'::json)
    from (select s.handle as h, pl.score, pl.last_pts, pl.last_ok
            from ping_players pl join students s on s.id = pl.student_id
           where pl.rush_id = p_id and (pl.answered > 0 or pl.last_seen > now() - interval '15 seconds')
           order by pl.score desc, pl.last_ok asc nulls last limit p_n) b;
$fn$;

create or replace function _pr_latest(p_class uuid) returns ping_rush
language sql stable security definer set search_path = public as $fn$
  select * from ping_rush where class_id = p_class order by started_at desc limit 1;
$fn$;

-- ---- teacher -------------------------------------------------------------------
drop function if exists ctf_t_pr_start(uuid, jsonb, int, int);
create or replace function ctf_t_pr_start(p_class uuid, p_questions jsonb, p_count int default 10, p_qtime int default 20, p_pace text default 'timed')
returns json language plpgsql security definer set search_path = public as $fn$
declare qs jsonb; v_total int; v_qtime int; v_id uuid; v_pace text := case when p_pace in ('teacher','auto') then p_pace else 'timed' end;
begin
  if not _is_teacher() then return json_build_object('error', 'not_teacher'); end if;
  if exists (select 1 from ping_rush where class_id = p_class and status = 'live') then return json_build_object('error', 'rush_live'); end if;
  qs := _pr_clean(p_questions);
  if jsonb_array_length(qs) < 4 then return json_build_object('error', 'too_few'); end if;
  v_total := least(greatest(coalesce(p_count, 10), 1), 500, jsonb_array_length(qs));   -- 37.3: 'ALL questions' sends 500
  v_qtime := least(greatest(coalesce(p_qtime, 20), 5), 120);
  select jsonb_agg(v) into qs from (select v from jsonb_array_elements(qs) v order by random() limit v_total) z;
  delete from ping_rush where class_id = p_class and status = 'done' and started_at < now() - interval '7 days';
  insert into ping_rush (class_id, total, qtime, questions, pace) values (p_class, v_total, v_qtime, qs, v_pace)
    returning id into v_id;
  perform _pr_open(v_id);
  return json_build_object('ok', true, 'id', v_id);
end $fn$;

create or replace function ctf_t_pr_state(p_class uuid)
returns json language plpgsql security definer set search_path = public as $fn$
declare r ping_rush; q jsonb; v_here int; v_tried int; v_ok int;
begin
  if not _is_teacher() then return json_build_object('error', 'not_teacher'); end if;
  r := _pr_latest(p_class);
  if r.id is null or (r.status = 'done' and r.finished_at < now() - interval '2 hours') then return json_build_object('now', now(), 'session', null); end if;
  r := _pr_tick(r.id);
  q := r.questions -> (r.qi - 1);
  select count(*) into v_here from ping_players where rush_id = r.id and last_seen > now() - interval '15 seconds';
  select count(*) filter (where tries > 0 or ok), count(*) filter (where ok) into v_tried, v_ok from ping_answers where rush_id = r.id and qi = r.qi;
  return json_build_object('now', now(), 'session', json_build_object(
    'id', r.id, 'status', r.status, 'phase', r.phase, 'qi', r.qi, 'total', r.total, 'qtime', r.qtime, 'q_ends', r.q_ends, 'finished_at', r.finished_at,
    'pace', r.pace, 'secs', _pr_secs(r), 'revealed_at', r.revealed_at,
    'x2', coalesce((q->>'x2')::boolean, false), 'next_x2', coalesce((r.questions -> r.qi ->> 'x2')::boolean, false),
    'q', q->>'q', 'k', q->>'k', 'o', case when q->>'k' = 'mc' then q->'o' end, 'mask', case when q->>'k' = 'fr' then _pr_mask(q->>'a') end,
    'a', case when r.phase = 'reveal' or r.status = 'done' then _pr_disp(q->>'a') end,
    'here', v_here, 'tried', v_tried, 'right', v_ok,
    'board', _pr_board(r.id, case when r.status = 'done' then 30 else 10 end)));
end $fn$;

-- phase q → reveal now; reveal → next question (or finish after the last)
create or replace function ctf_t_pr_next(p_class uuid)
returns json language plpgsql security definer set search_path = public as $fn$
declare r ping_rush;
begin
  if not _is_teacher() then return json_build_object('error', 'not_teacher'); end if;
  select * into r from ping_rush where class_id = p_class and status = 'live' order by started_at desc limit 1 for update;
  if r.id is null then return json_build_object('error', 'no_rush'); end if;
  if r.phase = 'q' then perform _pr_reveal(r.id);
  elsif r.qi >= r.total then perform _pr_finish(r.id);
  else update ping_rush set qi = qi + 1 where id = r.id; perform _pr_open(r.id);
  end if;
  return json_build_object('ok', true);
end $fn$;

-- 37.2: toggle double points (x2) on the NEXT question (questions[qi], 0-based)
create or replace function ctf_t_pr_double(p_class uuid)
returns json language plpgsql security definer set search_path = public as $fn$
declare r ping_rush; v boolean;
begin
  if not _is_teacher() then return json_build_object('error', 'not_teacher'); end if;
  select * into r from ping_rush where class_id = p_class and status = 'live' order by started_at desc limit 1 for update;
  if r.id is null then return json_build_object('error', 'no_rush'); end if;
  if r.qi >= r.total then return json_build_object('error', 'last'); end if;
  v := not coalesce((r.questions -> r.qi ->> 'x2')::boolean, false);
  update ping_rush set questions = jsonb_set(questions, array[r.qi::text, 'x2'], to_jsonb(v)) where id = r.id;
  return json_build_object('ok', true, 'x2', v);
end $fn$;

create or replace function ctf_t_pr_end(p_class uuid)
returns json language plpgsql security definer set search_path = public as $fn$
declare r ping_rush;
begin
  if not _is_teacher() then return json_build_object('error', 'not_teacher'); end if;
  select * into r from ping_rush where class_id = p_class and status = 'live' order by started_at desc limit 1;
  if r.id is null then return json_build_object('error', 'no_rush'); end if;
  perform _pr_finish(r.id);
  return json_build_object('ok', true);
end $fn$;

-- ---- student -------------------------------------------------------------------
create or replace function ctf_pr_state(p_student uuid)
returns json language plpgsql security definer set search_path = public as $fn$
declare me students; r ping_rush; q jsonb; pl ping_players; an ping_answers; v_rank int; v_of int; v_above int;
begin
  select * into me from students where id = p_student and auth_user_id = auth.uid();
  if me.id is null then return json_build_object('error', 'not_yours'); end if;
  r := _pr_latest(me.class_id);
  if r.id is null or (r.status = 'done' and r.finished_at < now() - interval '15 minutes') then return json_build_object('now', now(), 'status', null); end if;
  if r.status = 'live' then
    insert into ping_players (rush_id, student_id) values (r.id, me.id)
      on conflict (rush_id, student_id) do update set last_seen = now();
    r := _pr_tick(r.id);
  end if;
  select * into pl from ping_players where rush_id = r.id and student_id = me.id;
  select * into an from ping_answers where rush_id = r.id and student_id = me.id and qi = r.qi;
  q := r.questions -> (r.qi - 1);
  select count(*) + 1 into v_rank from ping_players x where x.rush_id = r.id and x.score > coalesce(pl.score, 0);
  select count(*) into v_of from ping_players x where x.rush_id = r.id and (x.answered > 0 or x.last_seen > now() - interval '15 seconds');
  select min(x.score) into v_above from ping_players x where x.rush_id = r.id and x.score > coalesce(pl.score, 0);
  return json_build_object('now', now(), 'id', r.id, 'status', r.status, 'phase', r.phase, 'qi', r.qi, 'total', r.total,
    'qtime', _pr_secs(r), 'q_ends', r.q_ends, 'pace', r.pace, 'handle', me.handle,
    'q', case when r.status = 'live' then q->>'q' end, 'k', q->>'k',
    'o', case when r.status = 'live' and q->>'k' = 'mc' then q->'o' end,
    'mask', case when r.status = 'live' and q->>'k' = 'fr' then _pr_mask(q->>'a') end,
    'a', case when r.phase = 'reveal' or r.status = 'done' then _pr_disp(q->>'a') end,
    'mine', json_build_object('ok', coalesce(an.ok, false), 'locked', coalesce(an.locked, false), 'pts', coalesce(an.pts, 0)),
    'score', coalesce(pl.score, 0), 'streak', coalesce(pl.streak, 0), 'rank', v_rank, 'of', greatest(v_of, 1),
    'gap', case when v_above is null then 0 else v_above - coalesce(pl.score, 0) end, 'x2', coalesce((q->>'x2')::boolean, false),
    'played', coalesce(pl.answered, 0) > 0,
    'top', case when r.status = 'done' then _pr_board(r.id, 3) end);
end $fn$;

create or replace function ctf_pr_answer(p_student uuid, p_rush uuid, p_qi int, p_answer text)
returns json language plpgsql security definer set search_path = public as $fn$
declare me students; r ping_rush; q jsonb; pl ping_players; an ping_answers; v_ok boolean; v_pts int; v_mc boolean;
begin
  select * into me from students where id = p_student and auth_user_id = auth.uid();
  if me.id is null then return json_build_object('error', 'not_yours'); end if;
  select * into r from ping_rush where id = p_rush and class_id = me.class_id for update;
  if r.id is null or r.status <> 'live' or r.phase <> 'q' or r.qi <> p_qi or (r.q_ends is not null and now() > r.q_ends + interval '1 second') then
    return json_build_object('error', 'closed');
  end if;
  insert into ping_players (rush_id, student_id) values (r.id, me.id)
    on conflict (rush_id, student_id) do update set last_seen = now() returning * into pl;
  insert into ping_answers (rush_id, student_id, qi) values (r.id, me.id, r.qi) on conflict do nothing;
  select * into an from ping_answers where rush_id = r.id and student_id = me.id and qi = r.qi for update;
  if an.ok or an.locked then return json_build_object('ok', an.ok, 'locked', an.locked, 'pts', an.pts); end if;
  if an.last_try is not null and an.last_try > now() - interval '400 milliseconds' then return json_build_object('error', 'slow'); end if;
  q := r.questions -> (r.qi - 1); v_mc := q->>'k' = 'mc';
  v_ok := _pr_ok(q->>'a', left(coalesce(p_answer, ''), 160), v_mc);
  if v_ok then
    v_pts := least(1000, round(500 + 500 * greatest(0, _pr_secs(r) - extract(epoch from (now() - coalesce(r.q_start, now())))) / greatest(_pr_secs(r), 1))::int)
             + case when pl.streak + 1 >= 3 then 100 else 0 end;
    if coalesce((q->>'x2')::boolean, false) then v_pts := v_pts * 2; end if;
    update ping_answers set ok = true, pts = v_pts, tries = tries + 1, last_try = now() where rush_id = r.id and student_id = me.id and qi = r.qi;
    update ping_players set score = score + v_pts, streak = streak + 1, answered = answered + case when an.tries = 0 then 1 else 0 end,
           last_ok = now(), last_seen = now() where rush_id = r.id and student_id = me.id;
    return json_build_object('ok', true, 'pts', v_pts, 'streak', pl.streak + 1);
  end if;
  update ping_answers set tries = tries + 1, last_try = now(), locked = v_mc where rush_id = r.id and student_id = me.id and qi = r.qi;
  update ping_players set answered = answered + case when an.tries = 0 then 1 else 0 end, last_seen = now() where rush_id = r.id and student_id = me.id;
  return json_build_object('ok', false, 'locked', v_mc);
end $fn$;

do $$
declare f text;
begin
  foreach f in array array['_pr_norm(text)', '_pr_disp(text)', '_pr_mask(text)', '_pr_ok(text,text,boolean)', '_pr_is_teacher_row(text)', '_pr_clean(jsonb)',
                           '_pr_pay(uuid,int,text)', '_pr_secs(ping_rush)', '_pr_open(uuid)', '_pr_reveal(uuid)', '_pr_finish(uuid)', '_pr_tick(uuid)', '_pr_board(uuid,int)', '_pr_latest(uuid)'] loop
    execute format('revoke all on function %s from public, anon, authenticated', f);
  end loop;
  foreach f in array array['ctf_t_pr_start(uuid,jsonb,int,int,text)', 'ctf_t_pr_state(uuid)', 'ctf_t_pr_next(uuid)', 'ctf_t_pr_double(uuid)', 'ctf_t_pr_end(uuid)',
                           'ctf_pr_state(uuid)', 'ctf_pr_answer(uuid,uuid,int,text)'] loop
    execute format('revoke all on function %s from public, anon', f);
    execute format('grant execute on function %s to authenticated', f);
  end loop;
end $$;
notify pgrst, 'reload schema';
