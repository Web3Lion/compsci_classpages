-- ============================================================================
-- VOCAB TIME ON TASK — teacher read of the practice log.
--
-- vocab-log.js records per-game seconds into the student's state blob, under
-- state.vocabLog. That blob already rides up on the normal progress sync, so
-- nothing new is written from the client — this file only adds the teacher's
-- way to read it back, per class.
--
-- Shape returned per student:
--   { handle, email, total_secs, games: {quiz: 420, ...}, sessions, done,
--     best, last, recent, updated_at }
--
-- Safe to re-run.
-- ============================================================================

create or replace function ctf_t_vocab(p_class uuid)
returns json language plpgsql security definer set search_path = public as $$
begin
  if not _is_teacher() then return json_build_object('error','not_teacher'); end if;

  return coalesce((
    select json_agg(row_to_json(t) order by t.total_secs desc)
    from (
      select
        s.id,
        s.handle,
        s.email,
        coalesce(p.state -> 'vocabLog' -> 'totals',   '{}'::jsonb) as games,
        coalesce(p.state -> 'vocabLog' -> 'sessions', '{}'::jsonb) as sessions,
        coalesce(p.state -> 'vocabLog' -> 'done',     '{}'::jsonb) as done,
        coalesce(p.state -> 'vocabLog' -> 'best',     '{}'::jsonb) as best,
        coalesce(p.state -> 'vocabLog' -> 'last',     '{}'::jsonb) as last,
        coalesce(p.state -> 'vocabLog' -> 'recent',   '[]'::jsonb) as recent,
        coalesce((
          select sum((v.value)::int)
          from jsonb_each_text(coalesce(p.state -> 'vocabLog' -> 'totals', '{}'::jsonb)) v
          where v.value ~ '^[0-9]+$'
        ), 0) as total_secs,
        coalesce((
          select sum((v.value)::int)
          from jsonb_each_text(coalesce(p.state -> 'vocabXp', '{}'::jsonb)) v
          where v.value ~ '^[0-9]+$'
        ), 0) as practice_xp,
        p.updated_at
      from students s
      left join progress p on p.student_id = s.id
      where s.class_id = p_class
    ) t
  ), '[]'::json);
end $$;
revoke all on function ctf_t_vocab(uuid) from public, anon;
grant execute on function ctf_t_vocab(uuid) to authenticated;

notify pgrst, 'reload schema';
