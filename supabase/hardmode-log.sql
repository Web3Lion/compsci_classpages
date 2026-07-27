-- ============================================================================
--  ARENA MINI-GAME RUNS  —  proof a student played, even when they scored 0.
--
--  The six Hard-tier vocab mini-games (Rapid Fire, Cipher Decode, Unscramble,
--  Speed Match, Definition Blitz, Word Search) only ever left a trace when they
--  paid XP: the capture row for the challenge's Hard flag. A run that timed out
--  at zero, or a student who played for three minutes and banked nothing, was
--  invisible — so "I did the decrypt game" couldn't be checked.
--
--  Every finished run now lands here: which game, on which challenge, score, XP,
--  and how long it ran. Separate from vocab_sessions (that table is the Vocab Lab
--  practice pages); these are arena runs tied to a specific CTF challenge.
--
--  Run AFTER schema.sql and google-auth.sql. Safe to re-run.
-- ============================================================================

create table if not exists hardmode_runs (
  id           bigserial primary key,
  student_id   uuid not null references students(id) on delete cascade,
  class_id     uuid not null references classes(id) on delete cascade,
  course       text,
  challenge_id text,
  game         text not null,
  score        int  not null default 0,
  xp           int  not null default 0,
  secs         int  not null default 0,
  banked       boolean not null default false,   -- did it pay XP
  played_at    timestamptz not null default now(),
  created_at   timestamptz not null default now()
);
alter table hardmode_runs enable row level security;   -- no policies: sealed
create index if not exists hardmode_runs_class   on hardmode_runs (class_id, created_at desc);
create index if not exists hardmode_runs_student on hardmode_runs (student_id, played_at desc);

-- ---- student logs one finished run -----------------------------------------
-- Scoped hard to the caller's own row. Values are clamped: a client can't claim
-- a 40-minute run or five-figure XP.
create or replace function ctf_hardmode_run_google(
  p_student uuid, p_challenge text, p_game text,
  p_score int, p_xp int, p_secs int, p_banked boolean
) returns json language plpgsql security definer set search_path = public as $$
declare v_s students; v_c classes;
begin
  select * into v_s from students where id = p_student and auth_user_id = auth.uid();
  if not found then return json_build_object('error','not_yours'); end if;
  select * into v_c from classes where id = v_s.class_id;

  insert into hardmode_runs (student_id, class_id, course, challenge_id, game,
                             score, xp, secs, banked)
  values (v_s.id, v_s.class_id, v_c.course,
          left(coalesce(p_challenge,''), 80), left(coalesce(p_game,'?'), 40),
          greatest(0, least(coalesce(p_score,0), 999)),
          greatest(0, least(coalesce(p_xp,0), 9999)),
          greatest(0, least(coalesce(p_secs,0), 3600)),
          coalesce(p_banked,false));

  return json_build_object('ok', true);
end $$;
revoke all on function ctf_hardmode_run_google(uuid, text, text, int, int, int, boolean) from public, anon;
grant execute on function ctf_hardmode_run_google(uuid, text, text, int, int, int, boolean) to authenticated;

-- ---- teacher reads the runs -------------------------------------------------
-- `suspect` marks an XP-paying run that went impossibly fast per point scored,
-- the same spirit as the vocab session check.
create or replace function ctf_t_hardmode_runs(p_class uuid, p_limit int default 400)
returns json language plpgsql security definer set search_path = public as $$
begin
  if not _is_teacher() then return json_build_object('error','not_teacher'); end if;
  return coalesce((
    select json_agg(row_to_json(t)) from (
      select r.id, r.student_id, s.handle, r.challenge_id, r.game,
             r.score, r.xp, r.secs, r.banked, r.played_at, r.created_at,
             (r.xp > 0 and r.score > 0 and r.secs::numeric / r.score < 2) as suspect
      from hardmode_runs r
      join students s on s.id = r.student_id
      where r.class_id = p_class
      order by r.created_at desc
      limit greatest(coalesce(p_limit,400),1)
    ) t), '[]'::json);
end $$;
revoke all on function ctf_t_hardmode_runs(uuid, int) from public, anon;
grant execute on function ctf_t_hardmode_runs(uuid, int) to authenticated;

notify pgrst, 'reload schema';
