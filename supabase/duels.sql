-- ============================================================================
--  HEAD-TO-HEAD DUELS  (v2.0)  —  two students race on the projector.
--
--  The teacher runs duel.html on the front screen and picks two students (or
--  runs a bracket). Each round the projector pushes one multiple-choice
--  question; both players answer on their own device (a prompt pops up on
--  their CTF / profile page). First correct answer takes the round. A wrong
--  answer locks that player out of the round. First to win a majority of
--  rounds (best of 3 / 5 / 7) wins the match and the XP pot.
--
--  Grading compares the chosen option's TEXT to the answer text (never an
--  index), per the project grading invariant. The answer is never sent to a
--  student until the round closes.
--
--  Run AFTER schema.sql, google-auth.sql, teacher-xp.sql. Safe to re-run.
-- ============================================================================

create table if not exists duels (
  id         uuid primary key default gen_random_uuid(),
  class_id   uuid not null references classes(id) on delete cascade,
  p1         uuid not null references students(id) on delete cascade,
  p2         uuid not null references students(id) on delete cascade,
  best_of    int  not null default 3,
  p1_score   int  not null default 0,
  p2_score   int  not null default 0,
  status     text not null default 'live' check (status in ('live','done','cancelled')),
  winner     uuid,
  pot        int  not null default 50,
  label      text,
  awarded    boolean not null default false,
  created_at timestamptz not null default now(),
  ended_at   timestamptz
);
create index if not exists duels_class on duels (class_id, created_at desc);
alter table duels enable row level security;

create table if not exists duel_rounds (
  id        uuid primary key default gen_random_uuid(),
  duel_id   uuid not null references duels(id) on delete cascade,
  n         int  not null,
  question  text not null,
  options   jsonb not null,
  answer    text not null,
  opened_at timestamptz not null default now(),
  closed_at timestamptz,
  winner    uuid
);
create index if not exists duel_rounds_duel on duel_rounds (duel_id, n);
alter table duel_rounds enable row level security;

create table if not exists duel_answers (
  round_id    uuid not null references duel_rounds(id) on delete cascade,
  student_id  uuid not null references students(id) on delete cascade,
  choice      text,
  correct     boolean not null,
  ms          int,
  answered_at timestamptz not null default now(),
  primary key (round_id, student_id)
);
alter table duel_answers enable row level security;

create or replace function _duel_need(p_best_of int) returns int language sql immutable as $$
  select (greatest(1, p_best_of) / 2) + 1
$$;

-- ---- teacher ------------------------------------------------------------------
create or replace function ctf_t_duel_start(p_class uuid, p_p1 uuid, p_p2 uuid,
  p_best_of int default 3, p_pot int default 50, p_label text default null)
returns json language plpgsql security definer set search_path = public as $$
declare v_id uuid;
begin
  if not _is_teacher() then return json_build_object('error','not_teacher'); end if;
  if p_p1 = p_p2 then return json_build_object('error','same_player'); end if;
  if (select count(*) from students where id in (p_p1, p_p2) and class_id = p_class) <> 2
    then return json_build_object('error','not_in_class'); end if;
  update duels set status = 'cancelled', ended_at = now() where class_id = p_class and status = 'live';
  insert into duels (class_id, p1, p2, best_of, pot, label)
    values (p_class, p_p1, p_p2, greatest(1, least(9, coalesce(p_best_of,3))), greatest(0, least(100, coalesce(p_pot,50))), p_label)
    returning id into v_id;
  return json_build_object('ok', true, 'id', v_id);
end $$;

create or replace function ctf_t_duel_round(p_duel uuid, p_question text, p_options jsonb, p_answer text)
returns json language plpgsql security definer set search_path = public as $$
declare v_n int; v_id uuid; v_d duels;
begin
  if not _is_teacher() then return json_build_object('error','not_teacher'); end if;
  select * into v_d from duels where id = p_duel;
  if v_d.id is null or v_d.status <> 'live' then return json_build_object('error','not_live'); end if;
  if v_d.winner is not null then return json_build_object('error','decided'); end if;
  if not (p_options @> to_jsonb(p_answer)) then return json_build_object('error','answer_not_in_options'); end if;
  update duel_rounds set closed_at = now() where duel_id = p_duel and closed_at is null;
  select coalesce(max(n),0) + 1 into v_n from duel_rounds where duel_id = p_duel;
  insert into duel_rounds (duel_id, n, question, options, answer)
    values (p_duel, v_n, p_question, p_options, p_answer) returning id into v_id;
  return json_build_object('ok', true, 'round_id', v_id, 'n', v_n);
end $$;

create or replace function ctf_t_duel_close_round(p_duel uuid)
returns json language plpgsql security definer set search_path = public as $$
begin
  if not _is_teacher() then return json_build_object('error','not_teacher'); end if;
  update duel_rounds set closed_at = now() where duel_id = p_duel and closed_at is null;
  return json_build_object('ok', true);
end $$;

create or replace function ctf_t_duel_state(p_duel uuid)
returns json language plpgsql security definer set search_path = public as $$
declare v_d duels; v_r duel_rounds;
begin
  if not _is_teacher() then return json_build_object('error','not_teacher'); end if;
  select * into v_d from duels where id = p_duel;
  if v_d.id is null then return json_build_object('error','no_duel'); end if;
  select * into v_r from duel_rounds where duel_id = p_duel order by n desc limit 1;
  return json_build_object(
    'id', v_d.id, 'status', v_d.status, 'best_of', v_d.best_of, 'need', _duel_need(v_d.best_of),
    'p1', v_d.p1, 'p2', v_d.p2, 'p1_score', v_d.p1_score, 'p2_score', v_d.p2_score,
    'p1_handle', (select handle from students where id = v_d.p1),
    'p2_handle', (select handle from students where id = v_d.p2),
    'winner', v_d.winner, 'pot', v_d.pot, 'awarded', v_d.awarded, 'label', v_d.label,
    'round', case when v_r.id is null then null else json_build_object(
      'id', v_r.id, 'n', v_r.n, 'question', v_r.question, 'options', v_r.options, 'answer', v_r.answer,
      'opened_at', v_r.opened_at, 'closed_at', v_r.closed_at, 'winner', v_r.winner,
      'answers', coalesce((select json_agg(json_build_object('student_id', student_id, 'choice', choice, 'correct', correct, 'ms', ms))
                           from duel_answers where round_id = v_r.id), '[]'::json)
    ) end,
    'now', now()
  );
end $$;

-- ends the match; p_award pays the pot to the winner through the normal XP-grant path
create or replace function ctf_t_duel_end(p_duel uuid, p_award boolean default true)
returns json language plpgsql security definer set search_path = public as $$
declare v_d duels; v_w uuid;
begin
  if not _is_teacher() then return json_build_object('error','not_teacher'); end if;
  select * into v_d from duels where id = p_duel for update;
  if v_d.id is null then return json_build_object('error','no_duel'); end if;
  v_w := coalesce(v_d.winner, case when v_d.p1_score > v_d.p2_score then v_d.p1
                                   when v_d.p2_score > v_d.p1_score then v_d.p2 else null end);
  update duel_rounds set closed_at = now() where duel_id = p_duel and closed_at is null;
  update duels set status = 'done', winner = v_w, ended_at = coalesce(ended_at, now()) where id = p_duel;
  if p_award and v_w is not null and not v_d.awarded and v_d.pot > 0 then
    perform ctf_t_grant_xp(v_w, v_d.pot, 'Duel win' || coalesce(' · ' || v_d.label, ''));
    update duels set awarded = true where id = p_duel;
  end if;
  return json_build_object('ok', true, 'winner', v_w,
    'winner_handle', (select handle from students where id = v_w));
end $$;

create or replace function ctf_t_duel_cancel(p_duel uuid)
returns json language plpgsql security definer set search_path = public as $$
begin
  if not _is_teacher() then return json_build_object('error','not_teacher'); end if;
  update duels set status = 'cancelled', ended_at = now() where id = p_duel and status = 'live';
  return json_build_object('ok', true);
end $$;

-- recent results for the projector's history strip
create or replace function ctf_t_duel_history(p_class uuid)
returns json language plpgsql security definer set search_path = public as $$
begin
  if not _is_teacher() then return json_build_object('error','not_teacher'); end if;
  return coalesce((select json_agg(row_to_json(t)) from (
    select d.id, d.label, d.p1_score, d.p2_score, d.ended_at,
           (select handle from students where id = d.p1) as p1_handle,
           (select handle from students where id = d.p2) as p2_handle,
           (select handle from students where id = d.winner) as winner_handle
    from duels d where d.class_id = p_class and d.status = 'done'
    order by d.ended_at desc limit 12
  ) t), '[]'::json);
end $$;

-- ---- student --------------------------------------------------------------------
create or replace function ctf_duel_poll(p_student uuid)
returns json language plpgsql security definer set search_path = public as $$
declare v_class uuid; v_d duels; v_r duel_rounds; v_me int; v_mine duel_answers;
begin
  select class_id into v_class from students where id = p_student and auth_user_id = auth.uid();
  if v_class is null then return json_build_object('error','not_yours'); end if;
  select * into v_d from duels
   where class_id = v_class and (p1 = p_student or p2 = p_student)
     and (status = 'live' or (status = 'done' and ended_at > now() - interval '20 seconds'))
   order by created_at desc limit 1;
  if v_d.id is null then return json_build_object('active', false); end if;
  v_me := case when v_d.p1 = p_student then 1 else 2 end;
  select * into v_r from duel_rounds where duel_id = v_d.id order by n desc limit 1;
  if v_r.id is not null then select * into v_mine from duel_answers where round_id = v_r.id and student_id = p_student; end if;
  return json_build_object(
    'active', true, 'duel_id', v_d.id, 'status', v_d.status, 'you', v_me,
    'best_of', v_d.best_of, 'need', _duel_need(v_d.best_of), 'label', v_d.label, 'pot', v_d.pot,
    'my_score',  case when v_me = 1 then v_d.p1_score else v_d.p2_score end,
    'opp_score', case when v_me = 1 then v_d.p2_score else v_d.p1_score end,
    'opp_handle', (select handle from students where id = case when v_me = 1 then v_d.p2 else v_d.p1 end),
    'won_match', case when v_d.winner is null then null else v_d.winner = p_student end,
    'round', case when v_r.id is null then null else json_build_object(
      'id', v_r.id, 'n', v_r.n, 'question', v_r.question, 'options', v_r.options,
      'closed', v_r.closed_at is not null,
      'answer', case when v_r.closed_at is not null then v_r.answer else null end,
      'answered', v_mine.round_id is not null, 'my_choice', v_mine.choice, 'my_correct', v_mine.correct,
      'won', case when v_r.winner is null then null else v_r.winner = p_student end
    ) end
  );
end $$;

create or replace function ctf_duel_answer(p_student uuid, p_round uuid, p_choice text)
returns json language plpgsql security definer set search_path = public as $$
declare v_r duel_rounds; v_d duels; v_ok boolean; v_ms int; v_other uuid; v_other_wrong boolean;
begin
  if not exists (select 1 from students where id = p_student and auth_user_id = auth.uid())
    then return json_build_object('error','not_yours'); end if;
  select * into v_r from duel_rounds where id = p_round for update;
  if v_r.id is null then return json_build_object('error','no_round'); end if;
  select * into v_d from duels where id = v_r.duel_id for update;
  if v_d.status <> 'live' or not (p_student in (v_d.p1, v_d.p2)) then return json_build_object('error','not_in_duel'); end if;
  if v_r.closed_at is not null then return json_build_object('error','closed'); end if;
  if exists (select 1 from duel_answers where round_id = p_round and student_id = p_student)
    then return json_build_object('error','already_answered'); end if;

  v_ok := lower(btrim(coalesce(p_choice,''))) = lower(btrim(v_r.answer));   -- text, never index
  v_ms := greatest(0, (extract(epoch from (clock_timestamp() - v_r.opened_at)) * 1000)::int);
  insert into duel_answers (round_id, student_id, choice, correct, ms) values (p_round, p_student, p_choice, v_ok, v_ms);

  if v_ok then
    update duel_rounds set winner = p_student, closed_at = now() where id = p_round;
    if p_student = v_d.p1 then update duels set p1_score = p1_score + 1 where id = v_d.id;
    else update duels set p2_score = p2_score + 1 where id = v_d.id; end if;
    update duels set winner = p_student
     where id = v_d.id and winner is null
       and greatest(p1_score, p2_score) >= _duel_need(best_of);
  else
    v_other := case when p_student = v_d.p1 then v_d.p2 else v_d.p1 end;
    select exists (select 1 from duel_answers where round_id = p_round and student_id = v_other and not correct) into v_other_wrong;
    if v_other_wrong then update duel_rounds set closed_at = now() where id = p_round; end if;   -- both missed: no point
  end if;
  return json_build_object('ok', true, 'correct', v_ok, 'ms', v_ms);
end $$;

do $$
declare f text;
begin
  foreach f in array array[
    'ctf_t_duel_start(uuid,uuid,uuid,int,int,text)', 'ctf_t_duel_round(uuid,text,jsonb,text)',
    'ctf_t_duel_close_round(uuid)', 'ctf_t_duel_state(uuid)', 'ctf_t_duel_end(uuid,boolean)',
    'ctf_t_duel_cancel(uuid)', 'ctf_t_duel_history(uuid)',
    'ctf_duel_poll(uuid)', 'ctf_duel_answer(uuid,uuid,text)'
  ] loop
    execute format('revoke all on function %s from public, anon', f);
    execute format('grant execute on function %s to authenticated', f);
  end loop;
end $$;

notify pgrst, 'reload schema';
