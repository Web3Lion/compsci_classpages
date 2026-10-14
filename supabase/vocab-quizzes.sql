-- ============================================================================
--  VOCAB QUIZZES  —  teacher-assigned vocab quizzes, a different version per
--  student. (teacher.html → Assigned Vocab Quizzes, student page quiz.html)
--
--  The teacher picks a term pool (e.g. 15 terms), how many to draw (e.g. 10)
--  and how many of each format (word-bank completion / matching / multiple
--  choice / type the term). When a student starts an attempt the SERVER draws
--  and shuffles their paper. The answer key stays in vocab_quiz_attempts.key
--  and is never returned to a student. Grading is server-side and compares
--  TEXT (normalized), never position. Typed answers forgive small typos.
--
--  Identity comes from the Google JWT: the student must be enrolled in the
--  quiz's class (students.auth_user_id). Name = enrollment list name
--  (roster_entries.full_name) when uploaded, else the Google account name.
--
--  Run AFTER schema.sql, google-auth.sql, teachers.sql, roster-csv.sql.
--  Safe to re-run.
-- ============================================================================

create table if not exists vocab_quizzes (
  id             uuid primary key default gen_random_uuid(),
  class_id       uuid not null references classes(id) on delete cascade,
  course         text not null default '',
  title          text not null,
  pool           jsonb not null,                 -- [{"t":"term","d":"definition"}]
  draw           int  not null,
  sections       jsonb not null,                 -- {"bank":5,"match":5,"mc":0,"typed":0}
  bank_extras    int  not null default 0,
  time_limit_min int  not null default 0,        -- 0 = untimed
  max_attempts   int  not null default 2,
  is_open        boolean not null default true,
  opens_at       timestamptz,
  due_at         timestamptz,
  created_by     text not null default '',
  created_at     timestamptz not null default now()
);
create index if not exists vocab_quizzes_class on vocab_quizzes (class_id, created_at desc);

create table if not exists vocab_quiz_attempts (
  id            uuid primary key default gen_random_uuid(),
  quiz_id       uuid not null references vocab_quizzes(id) on delete cascade,
  student_id    uuid not null references students(id) on delete cascade,
  attempt_no    int  not null,
  student_name  text not null default '',
  paper         jsonb not null,                  -- what the student sees
  key           jsonb not null,                  -- {"0":"term",...} never sent to students
  answers       jsonb not null default '{}'::jsonb,
  total         int  not null,
  score         int,
  missed        jsonb,
  focus_losses  int  not null default 0,
  pastes        int  not null default 0,
  started_at    timestamptz not null default now(),
  deadline      timestamptz,
  submitted_at  timestamptz,
  unique (quiz_id, student_id, attempt_no)
);
create index if not exists vocab_quiz_attempts_quiz on vocab_quiz_attempts (quiz_id, student_id);
-- integrity: leaving full screen / the tab / the window ends the attempt early;
-- it is graded on the answers so far and flagged for the teacher
alter table vocab_quiz_attempts add column if not exists violation text;
drop function if exists _vq_finalize(uuid);
drop function if exists vq_submit(uuid, jsonb, int, int);

alter table vocab_quizzes enable row level security;
alter table vocab_quiz_attempts enable row level security;
-- no policies on purpose: only the security-definer functions below touch them

-- ---- helpers ----------------------------------------------------------------
create or replace function _vq_norm(p text) returns text
language sql immutable as $$
  select trim(regexp_replace(regexp_replace(lower(coalesce(p,'')), '[^a-z0-9 ]', ' ', 'g'), '\s+', ' ', 'g'))
$$;

create or replace function _vq_lev(a text, b text) returns int
language plpgsql immutable as $$
declare la int := length(a); lb int := length(b); prev int[]; cur int[]; i int; j int; c int;
begin
  if la = 0 then return lb; end if;
  if lb = 0 then return la; end if;
  prev := array(select generate_series(0, lb));
  for i in 1..la loop
    cur := array[i];
    for j in 1..lb loop
      c := case when substr(a,i,1) = substr(b,j,1) then 0 else 1 end;
      cur := cur || least(cur[j] + 1, prev[j+1] + 1, prev[j] + c);
    end loop;
    prev := cur;
  end loop;
  return prev[lb+1];
end $$;

-- typed answers: exact after normalizing, or within 1 typo (5-8 chars) / 2 typos (9+)
create or replace function _vq_typed_ok(p_given text, p_ans text) returns boolean
language plpgsql immutable as $$
declare g text := _vq_norm(left(coalesce(p_given,''),200)); a text := _vq_norm(p_ans);
begin
  if g = '' then return false; end if;
  if g = a then return true; end if;
  return _vq_lev(g, a) <= case when length(a) <= 4 then 0 when length(a) <= 8 then 1 else 2 end;
end $$;

create or replace function _vq_status(q vocab_quizzes) returns text
language sql stable as $$
  select case
    when not q.is_open then 'closed'
    when q.opens_at is not null and now() < q.opens_at then 'not_yet'
    when q.due_at  is not null and now() >= q.due_at  then 'past_due'
    else 'open' end
$$;

-- Draw + shuffle one student's paper. Returns {paper, key, total}.
create or replace function _vq_build(q vocab_quizzes) returns jsonb
language plpgsql volatile set search_path = public as $$
declare
  v_all jsonb[]; v_n int; k text; cnt int; p int := 1; idx int := 0;
  v_slice jsonb[]; e jsonb; v_items jsonb; v_terms jsonb; v_opts jsonb; v_extra jsonb;
  v_sec jsonb; v_key jsonb := '{}'::jsonb; v_paper jsonb := '[]'::jsonb;
begin
  select array_agg(x order by random()) into v_all from jsonb_array_elements(q.pool) x;
  v_n := coalesce(array_length(v_all,1),0);
  foreach k in array array['bank','match','mc','typed'] loop
    cnt := least(greatest(coalesce((q.sections->>k)::int,0),0), q.draw - (p-1), v_n - (p-1));
    if cnt <= 0 then continue; end if;
    v_slice := v_all[p : p+cnt-1];
    p := p + cnt;
    v_items := '[]'::jsonb; v_terms := '[]'::jsonb;
    foreach e in array v_slice loop
      v_key := v_key || jsonb_build_object(idx::text, e->>'t');
      v_terms := v_terms || jsonb_build_array(e->>'t');
      if k = 'mc' then
        select jsonb_agg(z.t order by random()) into v_opts from (
          select e->>'t' as t
          union all
          (select o->>'t' from unnest(v_all) o
            where _vq_norm(o->>'t') <> _vq_norm(e->>'t') order by random() limit 3)
        ) z;
        v_items := v_items || jsonb_build_array(jsonb_build_object('i', idx, 'q', e->>'d', 'opts', v_opts));
      else
        v_items := v_items || jsonb_build_array(jsonb_build_object('i', idx, 'q', e->>'d'));
      end if;
      idx := idx + 1;
    end loop;
    v_sec := jsonb_build_object('kind', k, 'items', v_items);
    if k = 'bank' then
      select coalesce(jsonb_agg(o->>'t'), '[]'::jsonb) into v_extra from (
        select o from unnest(v_all[q.draw+1 : v_n]) o order by random() limit greatest(q.bank_extras,0)
      ) s;
      select jsonb_agg(x order by random()) into v_opts from jsonb_array_elements(v_terms || v_extra) x;
      v_sec := v_sec || jsonb_build_object('bank', v_opts);
    elsif k = 'match' then
      select jsonb_agg(x order by random()) into v_opts from jsonb_array_elements(v_terms) x;
      v_sec := v_sec || jsonb_build_object('choices', v_opts);
    end if;
    v_paper := v_paper || jsonb_build_array(v_sec);
  end loop;
  return jsonb_build_object('paper', v_paper, 'key', v_key, 'total', idx);
end $$;

-- Grade + close an attempt. Idempotent. With a violation the attempt is still
-- graded on the answers so far, flagged, and logged to cheat_events (Integrity tab).
create or replace function _vq_finalize(p_attempt uuid, p_violation text default null) returns void
language plpgsql set search_path = public as $$
declare a vocab_quiz_attempts; s jsonb; it jsonb; v_given text; v_ans text; v_ok boolean;
        v_score int := 0; v_missed jsonb := '[]'::jsonb; st students; c classes; q vocab_quizzes;
begin
  select * into a from vocab_quiz_attempts where id = p_attempt for update;
  if not found or a.submitted_at is not null then return; end if;
  for s in select * from jsonb_array_elements(a.paper) loop
    for it in select * from jsonb_array_elements(s->'items') loop
      v_given := coalesce(a.answers->>(it->>'i'), '');
      v_ans   := a.key->>(it->>'i');
      v_ok := case when s->>'kind' = 'typed' then _vq_typed_ok(v_given, v_ans)
                   else v_given <> '' and _vq_norm(v_given) = _vq_norm(v_ans) end;
      if v_ok then v_score := v_score + 1;
      else v_missed := v_missed || jsonb_build_array(jsonb_build_object(
             'kind', s->>'kind', 'q', it->>'q', 'given', left(v_given,200), 'a', v_ans));
      end if;
    end loop;
  end loop;
  update vocab_quiz_attempts set score = v_score, missed = v_missed, submitted_at = now(),
    violation = nullif(left(trim(coalesce(p_violation,'')), 60), '')
   where id = p_attempt;
  if coalesce(trim(p_violation),'') <> '' then
    select * into st from students where id = a.student_id;
    select * into c from classes where id = st.class_id;
    select * into q from vocab_quizzes where id = a.quiz_id;
    begin
      insert into cheat_events (student_id, class_id, course, handle, kind, detail)
        values (st.id, st.class_id, c.course, st.handle, 'quiz_violation',
                left('Vocab quiz "' || q.title || '" attempt ' || a.attempt_no || ' ended early (' || trim(p_violation) ||
                     '), scored ' || v_score || '/' || a.total, 400));
    exception when others then null;
    end;
  end if;
end $$;

-- close any timed attempt that ran out (2-minute grace for the auto-submit)
create or replace function _vq_expire(p_quiz uuid, p_student uuid) returns void
language plpgsql set search_path = public as $$
declare r record;
begin
  for r in select id from vocab_quiz_attempts
    where quiz_id = p_quiz and student_id = p_student and submitted_at is null
      and deadline is not null and now() > deadline + interval '2 minutes' loop
    perform _vq_finalize(r.id);
  end loop;
end $$;

create or replace function _vq_student_missed(m jsonb) returns jsonb
language sql immutable as $$
  select coalesce(jsonb_agg(x - 'a'), '[]'::jsonb) from jsonb_array_elements(coalesce(m,'[]'::jsonb)) x
$$;

create or replace function _vq_jwt_name() returns text
language sql stable as $$
  select left(coalesce(auth.jwt()->'user_metadata'->>'full_name', auth.jwt()->'user_metadata'->>'name', ''), 120)
$$;

-- ============================================================================
--  STUDENT RPCs
-- ============================================================================
create or replace function vq_info(p_quiz uuid)
returns json language plpgsql security definer set search_path = public as $$
declare q vocab_quizzes; st students; c classes; v_name text;
begin
  if auth.uid() is null then return json_build_object('error','not_signed_in'); end if;
  select * into q from vocab_quizzes where id = p_quiz;
  if not found then return json_build_object('error','no_quiz'); end if;
  select * into c from classes where id = q.class_id;
  select * into st from students where class_id = q.class_id and auth_user_id = auth.uid();
  if not found then
    return json_build_object('error','not_enrolled', 'course', q.course, 'class_name', c.name);
  end if;
  perform _vq_expire(q.id, st.id);
  -- an attempt still open when the page loads again means it was closed or reloaded
  perform _vq_finalize(id, 'closed or reloaded the quiz page') from vocab_quiz_attempts
   where quiz_id = q.id and student_id = st.id and submitted_at is null
     and started_at < now() - interval '20 seconds';
  select nullif(full_name,'') into v_name from roster_entries
   where class_id = q.class_id and email = lower(coalesce(st.email,'')) limit 1;
  return json_build_object(
    'title', q.title, 'course', q.course, 'class_name', c.name,
    'name', coalesce(v_name, nullif(_vq_jwt_name(),''), st.email, st.handle),
    'handle', st.handle, 'status', _vq_status(q),
    'opens_at', q.opens_at, 'due_at', q.due_at,
    'time_limit_min', q.time_limit_min, 'max_attempts', q.max_attempts, 'questions', q.draw,
    'in_progress', exists (select 1 from vocab_quiz_attempts where quiz_id = q.id and student_id = st.id and submitted_at is null),
    'attempts', coalesce((select json_agg(json_build_object(
        'no', attempt_no, 'score', score, 'total', total, 'submitted_at', submitted_at,
        'violation', violation, 'missed', _vq_student_missed(missed)) order by attempt_no)
      from vocab_quiz_attempts where quiz_id = q.id and student_id = st.id and submitted_at is not null), '[]'::json)
  );
end $$;

create or replace function vq_start(p_quiz uuid)
returns json language plpgsql security definer set search_path = public as $$
declare q vocab_quizzes; st students; a vocab_quiz_attempts; v_used int; v_b jsonb; v_name text;
begin
  if auth.uid() is null then return json_build_object('error','not_signed_in'); end if;
  select * into q from vocab_quizzes where id = p_quiz;
  if not found then return json_build_object('error','no_quiz'); end if;
  select * into st from students where class_id = q.class_id and auth_user_id = auth.uid();
  if not found then return json_build_object('error','not_enrolled'); end if;
  perform _vq_expire(q.id, st.id);

  select * into a from vocab_quiz_attempts
   where quiz_id = q.id and student_id = st.id and submitted_at is null
   order by attempt_no desc limit 1;
  -- an open attempt that is being re-opened means the page was closed or reloaded
  if found and a.started_at < now() - interval '20 seconds' then
    perform _vq_finalize(a.id, 'closed or reloaded the quiz page');
    return json_build_object('error','integrity_closed');
  end if;
  if not found then
    if _vq_status(q) <> 'open' then return json_build_object('error', _vq_status(q)); end if;
    select count(*) into v_used from vocab_quiz_attempts where quiz_id = q.id and student_id = st.id;
    if v_used >= q.max_attempts then return json_build_object('error','no_attempts_left'); end if;
    select nullif(full_name,'') into v_name from roster_entries
     where class_id = q.class_id and email = lower(coalesce(st.email,'')) limit 1;
    v_b := _vq_build(q);
    insert into vocab_quiz_attempts (quiz_id, student_id, attempt_no, student_name, paper, key, total, deadline)
      values (q.id, st.id, v_used + 1, coalesce(v_name, _vq_jwt_name(), ''),
              v_b->'paper', v_b->'key', (v_b->>'total')::int,
              case when q.time_limit_min > 0 then now() + make_interval(mins => q.time_limit_min) end)
      returning * into a;
  end if;
  return json_build_object('attempt_id', a.id, 'attempt_no', a.attempt_no, 'paper', a.paper,
    'answers', a.answers, 'deadline', a.deadline, 'now', now(), 'total', a.total,
    'title', q.title, 'max_attempts', q.max_attempts);
end $$;

create or replace function vq_save(p_attempt uuid, p_answers jsonb, p_focus int, p_pastes int)
returns json language plpgsql security definer set search_path = public as $$
declare a vocab_quiz_attempts;
begin
  select va.* into a from vocab_quiz_attempts va join students s on s.id = va.student_id
   where va.id = p_attempt and s.auth_user_id = auth.uid();
  if not found then return json_build_object('error','not_yours'); end if;
  if a.submitted_at is not null then return json_build_object('error','submitted'); end if;
  if a.deadline is not null and now() > a.deadline + interval '2 minutes' then
    perform _vq_finalize(a.id); return json_build_object('error','time_up');
  end if;
  if jsonb_typeof(p_answers) <> 'object' or pg_column_size(p_answers) > 40000 then
    return json_build_object('error','bad_answers'); end if;
  update vocab_quiz_attempts set answers = p_answers,
    focus_losses = greatest(focus_losses, least(coalesce(p_focus,0), 9999)),
    pastes = greatest(pastes, least(coalesce(p_pastes,0), 9999))
   where id = a.id;
  return json_build_object('ok', true);
end $$;

create or replace function vq_submit(p_attempt uuid, p_answers jsonb, p_focus int, p_pastes int, p_violation text default null)
returns json language plpgsql security definer set search_path = public as $$
declare a vocab_quiz_attempts; q vocab_quizzes; v_best int; v_used int;
begin
  select va.* into a from vocab_quiz_attempts va join students s on s.id = va.student_id
   where va.id = p_attempt and s.auth_user_id = auth.uid();
  if not found then return json_build_object('error','not_yours'); end if;
  if a.submitted_at is null and coalesce(trim(p_violation),'') <> '' then
    if jsonb_typeof(p_answers) = 'object' and pg_column_size(p_answers) <= 40000 then
      update vocab_quiz_attempts set answers = p_answers,
        focus_losses = greatest(focus_losses, least(coalesce(p_focus,0), 9999)),
        pastes = greatest(pastes, least(coalesce(p_pastes,0), 9999))
       where id = a.id;
    end if;
    perform _vq_finalize(a.id, p_violation);
  end if;
  if a.submitted_at is null then
    -- late answers past the grace window are ignored; the last autosave counts
    if (a.deadline is null or now() <= a.deadline + interval '2 minutes')
       and jsonb_typeof(p_answers) = 'object' and pg_column_size(p_answers) <= 40000 then
      update vocab_quiz_attempts set answers = p_answers,
        focus_losses = greatest(focus_losses, least(coalesce(p_focus,0), 9999)),
        pastes = greatest(pastes, least(coalesce(p_pastes,0), 9999))
       where id = a.id;
    end if;
    perform _vq_finalize(a.id);
  end if;
  select * into a from vocab_quiz_attempts where id = p_attempt;
  select * into q from vocab_quizzes where id = a.quiz_id;
  select max(score), count(*) into v_best, v_used from vocab_quiz_attempts
   where quiz_id = a.quiz_id and student_id = a.student_id;
  return json_build_object('score', a.score, 'total', a.total, 'attempt_no', a.attempt_no,
    'violation', a.violation,
    'missed', _vq_student_missed(a.missed), 'best', v_best,
    'attempts_left', greatest(q.max_attempts - v_used, 0), 'status', _vq_status(q));
end $$;

-- Quizzes for the student's class (course home glow + profile results).
-- Lists open / upcoming quizzes plus any quiz the student has attempted.
create or replace function vq_my_quizzes(p_student uuid)
returns json language plpgsql security definer set search_path = public as $$
declare st students;
begin
  select * into st from students where id = p_student and auth_user_id = auth.uid();
  if not found then return json_build_object('error','not_yours'); end if;
  return coalesce((select json_agg(row_to_json(t) order by t.created_at desc) from (
    select q.id, q.title, q.draw as questions, q.time_limit_min, q.max_attempts,
           q.opens_at, q.due_at, q.created_at, _vq_status(q) as status,
           (select count(*) from vocab_quiz_attempts a where a.quiz_id = q.id and a.student_id = st.id)::int as used,
           (select max(score) from vocab_quiz_attempts a where a.quiz_id = q.id and a.student_id = st.id) as best,
           (select max(total) from vocab_quiz_attempts a where a.quiz_id = q.id and a.student_id = st.id) as total,
           (select count(*) from vocab_quiz_attempts a where a.quiz_id = q.id and a.student_id = st.id and a.submitted_at is not null)::int as done,
           exists (select 1 from vocab_quiz_attempts a where a.quiz_id = q.id and a.student_id = st.id and a.submitted_at is null) as in_progress,
           coalesce((select json_agg(json_build_object('no', attempt_no, 'score', score, 'total', total,
                       'submitted_at', submitted_at, 'violation', violation, 'missed', _vq_student_missed(missed)) order by attempt_no)
                     from vocab_quiz_attempts a where a.quiz_id = q.id and a.student_id = st.id and a.submitted_at is not null), '[]'::json) as attempts
      from vocab_quizzes q
     where q.class_id = st.class_id
       and (_vq_status(q) in ('open','not_yet')
            or exists (select 1 from vocab_quiz_attempts a where a.quiz_id = q.id and a.student_id = st.id))
  ) t), '[]'::json);
end $$;

-- ============================================================================
--  TEACHER RPCs
-- ============================================================================
create or replace function vq_t_create(
  p_class uuid, p_title text, p_pool jsonb, p_draw int, p_sections jsonb,
  p_bank_extras int, p_time_limit int, p_max_attempts int, p_opens timestamptz, p_due timestamptz
) returns json language plpgsql security definer set search_path = public as $$
declare c classes; v_pool jsonb; v_n int; v_sum int; v_id uuid; v_sec jsonb;
begin
  if not _is_teacher() then return json_build_object('error','not_teacher'); end if;
  select * into c from classes where id = p_class;
  if not found then return json_build_object('error','no_class'); end if;
  if coalesce(trim(p_title),'') = '' then return json_build_object('error','empty_title'); end if;

  select coalesce(jsonb_agg(jsonb_build_object('t', left(trim(x->>'t'),120), 'd', left(trim(x->>'d'),600))), '[]'::jsonb)
    into v_pool from (
      select distinct on (_vq_norm(x->>'t')) x from jsonb_array_elements(coalesce(p_pool,'[]'::jsonb)) x
       where _vq_norm(x->>'t') <> '' and trim(coalesce(x->>'d','')) <> ''
    ) s;
  v_n := jsonb_array_length(v_pool);
  if v_n < 1 or v_n > 400 then return json_build_object('error','bad_pool'); end if;
  if coalesce(p_draw,0) < 1 or p_draw > v_n or p_draw > 100 then return json_build_object('error','bad_draw'); end if;

  v_sec := jsonb_build_object(
    'bank',  greatest(coalesce((p_sections->>'bank')::int,0),0),
    'match', greatest(coalesce((p_sections->>'match')::int,0),0),
    'mc',    greatest(coalesce((p_sections->>'mc')::int,0),0),
    'typed', greatest(coalesce((p_sections->>'typed')::int,0),0));
  v_sum := (v_sec->>'bank')::int + (v_sec->>'match')::int + (v_sec->>'mc')::int + (v_sec->>'typed')::int;
  if v_sum <> p_draw then return json_build_object('error','sections_must_equal_draw'); end if;
  if (v_sec->>'match')::int = 1 then return json_build_object('error','match_needs_two'); end if;
  if (v_sec->>'mc')::int > 0 and v_n < 2 then return json_build_object('error','mc_needs_two'); end if;

  insert into vocab_quizzes (class_id, course, title, pool, draw, sections, bank_extras,
                             time_limit_min, max_attempts, opens_at, due_at, created_by)
    values (p_class, c.course, left(trim(p_title),120), v_pool, p_draw, v_sec,
            least(greatest(coalesce(p_bank_extras,0),0),20),
            least(greatest(coalesce(p_time_limit,0),0),240),
            least(greatest(coalesce(p_max_attempts,2),1),10),
            p_opens, p_due, coalesce(_email(),''))
    returning id into v_id;
  return json_build_object('ok', true, 'id', v_id);
end $$;

create or replace function vq_t_set(p_id uuid, p_open boolean, p_opens timestamptz, p_due timestamptz,
                                    p_max_attempts int, p_time_limit int)
returns json language plpgsql security definer set search_path = public as $$
begin
  if not _is_teacher() then return json_build_object('error','not_teacher'); end if;
  update vocab_quizzes set is_open = coalesce(p_open, is_open), opens_at = p_opens, due_at = p_due,
    max_attempts = least(greatest(coalesce(p_max_attempts, max_attempts),1),10),
    time_limit_min = least(greatest(coalesce(p_time_limit, time_limit_min),0),240)
   where id = p_id;
  if not found then return json_build_object('error','no_quiz'); end if;
  return json_build_object('ok', true);
end $$;

create or replace function vq_t_delete(p_id uuid)
returns json language plpgsql security definer set search_path = public as $$
begin
  if not _is_teacher() then return json_build_object('error','not_teacher'); end if;
  delete from vocab_quizzes where id = p_id;
  return json_build_object('ok', true);
end $$;

create or replace function vq_t_list(p_class uuid)
returns json language plpgsql security definer set search_path = public as $$
begin
  if not _is_teacher() then return json_build_object('error','not_teacher'); end if;
  return coalesce((select json_agg(row_to_json(t) order by t.created_at desc) from (
    select q.id, q.title, q.draw, q.sections, q.bank_extras, q.time_limit_min, q.max_attempts,
           q.is_open, q.opens_at, q.due_at, q.created_at, _vq_status(q) as status,
           jsonb_array_length(q.pool) as pool_size,
           (select count(*) from students s where s.class_id = q.class_id)::int as students,
           (select count(distinct student_id) from vocab_quiz_attempts a where a.quiz_id = q.id and a.submitted_at is not null)::int as done,
           (select count(distinct student_id) from vocab_quiz_attempts a where a.quiz_id = q.id and a.submitted_at is null)::int as in_progress,
           (select count(*) from vocab_quiz_attempts a where a.quiz_id = q.id and a.violation is not null)::int as violations,
           (select round(avg(b.best * 100.0 / nullif(b.total,0))) from (
              select max(score) as best, max(total) as total from vocab_quiz_attempts a
               where a.quiz_id = q.id and a.submitted_at is not null group by student_id) b)::int as avg_pct
      from vocab_quizzes q where q.class_id = p_class
  ) t), '[]'::json);
end $$;

create or replace function vq_t_results(p_quiz uuid)
returns json language plpgsql security definer set search_path = public as $$
declare q vocab_quizzes;
begin
  if not _is_teacher() then return json_build_object('error','not_teacher'); end if;
  select * into q from vocab_quizzes where id = p_quiz;
  if not found then return json_build_object('error','no_quiz'); end if;
  return json_build_object(
    'pool', q.pool,
    'students', coalesce((select json_agg(row_to_json(t) order by lower(t.name)) from (
      select s.id as student_id, s.handle, s.email,
             coalesce(nullif(re.full_name,''),
                      (select nullif(student_name,'') from vocab_quiz_attempts a where a.quiz_id = q.id and a.student_id = s.id order by attempt_no desc limit 1),
                      s.email, s.handle) as name,
             (select count(*) from vocab_quiz_attempts a where a.quiz_id = q.id and a.student_id = s.id)::int as used,
             (select max(score) from vocab_quiz_attempts a where a.quiz_id = q.id and a.student_id = s.id) as best,
             (select max(total) from vocab_quiz_attempts a where a.quiz_id = q.id and a.student_id = s.id) as total,
             (select max(submitted_at) from vocab_quiz_attempts a where a.quiz_id = q.id and a.student_id = s.id) as last_at,
             exists (select 1 from vocab_quiz_attempts a where a.quiz_id = q.id and a.student_id = s.id and a.submitted_at is null) as in_progress,
             coalesce((select sum(focus_losses) from vocab_quiz_attempts a where a.quiz_id = q.id and a.student_id = s.id),0)::int as focus_losses,
             coalesce((select sum(pastes) from vocab_quiz_attempts a where a.quiz_id = q.id and a.student_id = s.id),0)::int as pastes,
             (select count(*) from vocab_quiz_attempts a where a.quiz_id = q.id and a.student_id = s.id and a.violation is not null)::int as violations,
             coalesce((select json_agg(json_build_object('no', attempt_no, 'score', score, 'total', total,
                         'started_at', started_at, 'submitted_at', submitted_at, 'missed', missed, 'violation', violation,
                         'focus_losses', focus_losses, 'pastes', pastes) order by attempt_no)
                       from vocab_quiz_attempts a where a.quiz_id = q.id and a.student_id = s.id), '[]'::json) as attempts
        from students s
        left join roster_entries re on re.class_id = s.class_id and re.email = lower(coalesce(s.email,''))
       where s.class_id = q.class_id
    ) t), '[]'::json),
    'most_missed', coalesce((select json_agg(row_to_json(m) order by m.n desc, m.term) from (
      select x->>'a' as term, count(*)::int as n
        from vocab_quiz_attempts a, jsonb_array_elements(coalesce(a.missed,'[]'::jsonb)) x
       where a.quiz_id = q.id group by x->>'a' order by count(*) desc limit 12
    ) m), '[]'::json),
    'seen', coalesce((select json_object_agg(term, n) from (
      select v as term, count(*)::int as n
        from vocab_quiz_attempts a, jsonb_each_text(a.key) k(i, v)
       where a.quiz_id = q.id and a.submitted_at is not null group by v
    ) s), '{}'::json)
  );
end $$;

-- Copy a quiz (same pool + settings) to other classes, e.g. other periods.
create or replace function vq_t_copy(p_quiz uuid, p_classes uuid[])
returns json language plpgsql security definer set search_path = public as $$
declare n int;
begin
  if not _is_teacher() then return json_build_object('error','not_teacher'); end if;
  insert into vocab_quizzes (class_id, course, title, pool, draw, sections, bank_extras,
                             time_limit_min, max_attempts, is_open, opens_at, due_at, created_by)
  select c.id, c.course, q.title, q.pool, q.draw, q.sections, q.bank_extras,
         q.time_limit_min, q.max_attempts, q.is_open, q.opens_at, q.due_at, coalesce(_email(),'')
    from vocab_quizzes q join classes c on c.id = any(coalesce(p_classes,'{}'::uuid[]))
   where q.id = p_quiz and c.id <> q.class_id;
  get diagnostics n = row_count;
  return json_build_object('ok', true, 'copied', n);
end $$;
revoke all on function vq_t_copy(uuid, uuid[]) from public, anon;
grant execute on function vq_t_copy(uuid, uuid[]) to authenticated;

-- Wipe one student's attempts so they can start over.
create or replace function vq_t_reset(p_quiz uuid, p_student uuid)
returns json language plpgsql security definer set search_path = public as $$
declare n int;
begin
  if not _is_teacher() then return json_build_object('error','not_teacher'); end if;
  delete from vocab_quiz_attempts where quiz_id = p_quiz and student_id = p_student;
  get diagnostics n = row_count;
  return json_build_object('ok', true, 'cleared', n);
end $$;

revoke all on function vq_my_quizzes(uuid) from public, anon;
grant execute on function vq_my_quizzes(uuid) to authenticated;
revoke all on function vq_info(uuid) from public, anon;
revoke all on function vq_start(uuid) from public, anon;
revoke all on function vq_save(uuid, jsonb, int, int) from public, anon;
revoke all on function vq_submit(uuid, jsonb, int, int, text) from public, anon;
revoke all on function vq_t_create(uuid, text, jsonb, int, jsonb, int, int, int, timestamptz, timestamptz) from public, anon;
revoke all on function vq_t_set(uuid, boolean, timestamptz, timestamptz, int, int) from public, anon;
revoke all on function vq_t_delete(uuid) from public, anon;
revoke all on function vq_t_list(uuid) from public, anon;
revoke all on function vq_t_results(uuid) from public, anon;
revoke all on function vq_t_reset(uuid, uuid) from public, anon;
grant execute on function vq_info(uuid) to authenticated;
grant execute on function vq_start(uuid) to authenticated;
grant execute on function vq_save(uuid, jsonb, int, int) to authenticated;
grant execute on function vq_submit(uuid, jsonb, int, int, text) to authenticated;
grant execute on function vq_t_create(uuid, text, jsonb, int, jsonb, int, int, int, timestamptz, timestamptz) to authenticated;
grant execute on function vq_t_set(uuid, boolean, timestamptz, timestamptz, int, int) to authenticated;
grant execute on function vq_t_delete(uuid) to authenticated;
grant execute on function vq_t_list(uuid) to authenticated;
grant execute on function vq_t_results(uuid) to authenticated;
grant execute on function vq_t_reset(uuid, uuid) to authenticated;
revoke all on function _vq_build(vocab_quizzes) from public, anon, authenticated;
revoke all on function _vq_finalize(uuid, text) from public, anon, authenticated;
revoke all on function _vq_expire(uuid, uuid) from public, anon, authenticated;

notify pgrst, 'reload schema';
