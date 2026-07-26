-- ============================================================================
-- VOCAB SESSION AUDIT TRAIL
--
-- Practice XP used to be awarded entirely client-side with no per-session
-- record, which made the Vocabulary Lab the cheapest thing on the site to
-- farm and made it invisible to the time-to-solve outlier panel. Each
-- completed run now lands here as its own row.
--
-- Rows are queued locally by vocab-log.js (the vocab pages are not gated on
-- sign-in) and flushed by sync.js on the student's next arena visit, so a run
-- may arrive minutes or days after it happened. `played_at` is the client's
-- clock; `created_at` is ours. A big gap between the two is normal, not
-- suspicious.
--
-- (student_id, played_at, game) is unique so a replayed flush cannot double-
-- count the same run.
--
-- Safe to re-run.
-- ============================================================================

create table if not exists vocab_sessions (
  id          bigserial primary key,
  student_id  uuid not null references students(id) on delete cascade,
  class_id    uuid not null references classes(id)  on delete cascade,
  course      text not null default '',
  game        text not null,              -- cards | decrypt | match | quiz | cascade
  secs        int  not null default 0,    -- ACTIVE seconds in this run
  terms       int  not null default 0,
  accuracy    int  not null default 0,    -- 0-100
  xp          int  not null default 0,
  modules     int[] not null default '{}',
  played_at   timestamptz not null,       -- client clock
  created_at  timestamptz not null default now(),
  unique (student_id, played_at, game)
);
alter table vocab_sessions enable row level security;   -- no policies: sealed
create index if not exists vocab_sessions_class_idx   on vocab_sessions (class_id, created_at desc);
create index if not exists vocab_sessions_student_idx on vocab_sessions (student_id, played_at desc);

-- ---- student flushes a batch of finished runs -------------------------------
-- p_rows: [{"g":"quiz","d":184,"acc":92,"n":12,"xp":40,"m":[3],"ts":1753500000000}, ...]
-- Returns the newest accepted client timestamp so the client can clear its
-- queue up to exactly that point and keep anything that arrived mid-flush.
create or replace function ctf_vocab_sessions_google(p_student uuid, p_rows jsonb)
returns json language plpgsql security definer set search_path = public as $$
declare
  v_s students; v_c classes;
  r jsonb; v_ts timestamptz; v_game text; v_max bigint := 0; v_n int := 0;
  v_mods int[];
begin
  select * into v_s from students
    where id = p_student and auth_user_id = auth.uid();
  if not found then return json_build_object('error','not_yours'); end if;

  select * into v_c from classes where id = v_s.class_id;

  for r in select * from jsonb_array_elements(coalesce(p_rows,'[]'::jsonb)) loop
    v_game := lower(coalesce(r->>'g',''));
    if v_game not in ('cards','decrypt','match','quiz','cascade') then continue; end if;
    if coalesce((r->>'ts')::bigint, 0) <= 0 then continue; end if;

    v_ts := to_timestamp(((r->>'ts')::bigint) / 1000.0);
    -- a clock set to next year would poison "recent"; clamp anything ahead of us
    if v_ts > now() + interval '1 day' then v_ts := now(); end if;

    select coalesce(array_agg(x::int), '{}'::int[]) into v_mods
      from jsonb_array_elements_text(coalesce(r->'m','[]'::jsonb)) x
      where x ~ '^[0-9]+$';

    insert into vocab_sessions
      (student_id, class_id, course, game, secs, terms, accuracy, xp, modules, played_at)
    values (
      v_s.id, v_s.class_id, coalesce(v_c.course,''), v_game,
      greatest(0, least(86400, coalesce((r->>'d')::int, 0))),
      greatest(0, least(9999,  coalesce((r->>'n')::int, 0))),
      greatest(0, least(100,   coalesce((r->>'acc')::int, 0))),
      greatest(0, least(9999,  coalesce((r->>'xp')::int, 0))),
      coalesce(v_mods,'{}'::int[]), v_ts
    )
    on conflict (student_id, played_at, game) do nothing;

    v_n := v_n + 1;
    if (r->>'ts')::bigint > v_max then v_max := (r->>'ts')::bigint; end if;
  end loop;

  return json_build_object('ok', true, 'accepted', v_n, 'through', v_max);
end $$;
revoke all on function ctf_vocab_sessions_google(uuid, jsonb) from public, anon;
grant execute on function ctf_vocab_sessions_google(uuid, jsonb) to authenticated;

-- ---- teacher reads the session list ----------------------------------------
-- `suspect` marks a run that paid XP in implausibly little time: under 4
-- seconds per term, or any XP-paying run under 10 seconds. Flashcards pay no
-- XP so they are never marked.
create or replace function ctf_t_vocab_sessions(p_class uuid, p_limit int default 400)
returns json language plpgsql security definer set search_path = public as $$
begin
  if not _is_teacher() then return json_build_object('error','not_teacher'); end if;
  return coalesce((
    select json_agg(row_to_json(t) order by t.played_at desc)
    from (
      select v.id, v.game, v.secs, v.terms, v.accuracy, v.xp, v.modules,
             v.played_at, v.created_at, s.handle, s.id as student_id,
             (v.xp > 0 and (v.secs < 10 or (v.terms > 0 and v.secs::numeric / v.terms < 4))) as suspect
      from vocab_sessions v
      join students s on s.id = v.student_id
      where v.class_id = p_class
      order by v.played_at desc
      limit greatest(1, least(2000, coalesce(p_limit, 400)))
    ) t
  ), '[]'::json);
end $$;
revoke all on function ctf_t_vocab_sessions(uuid, int) from public, anon;
grant execute on function ctf_t_vocab_sessions(uuid, int) to authenticated;

notify pgrst, 'reload schema';
