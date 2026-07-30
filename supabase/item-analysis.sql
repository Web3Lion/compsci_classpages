-- ============================================================================
--  ITEM ANALYSIS  —  which flags get attempted and abandoned.
--
--  flag_events only records SUCCESS, so a flag that students open, fight with,
--  and give up on looks identical to a flag nobody reached. attempt_events has
--  the wrong guesses; this joins the two so a teacher can see the gap:
--
--    attempters   students who tried this flag at least once
--    solvers      students who eventually captured it
--    abandoned    tried and never captured  <- the number that matters
--    tries_given  wrong guesses those abandoners spent before quitting
--
--  A flag with many abandoners AND several tries each is usually a WORDING
--  problem: they understood enough to try repeatedly and still couldn't satisfy
--  the answer format. A flag abandoned after one try is more often a concept
--  they haven't been taught yet.
--
--  Requires attempt-log.sql (attempt_events). Run AFTER it. Safe to re-run.
-- ============================================================================

create or replace function ctf_t_flag_attempts(p_class uuid)
returns json language plpgsql security definer set search_path = public as $$
declare v_has boolean;
begin
  if not _is_teacher() then return json_build_object('error','not_teacher'); end if;

  select exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'attempt_events'
  ) into v_has;
  if not v_has then return json_build_object('error','no_attempt_log'); end if;

  return coalesce((
    select json_agg(row_to_json(t)) from (
      with tried as (
        select a.flag_key,
               a.student_id,
               count(*) filter (where not a.correct) as wrongs,
               min(a.created_at) as first_at,
               max(a.created_at) as last_at
        from attempt_events a
        join students s on s.id = a.student_id
        where s.class_id = p_class
        group by a.flag_key, a.student_id
      ),
      solved as (
        select f.flag_key, f.student_id
        from flag_events f
        where f.class_id = p_class
      )
      select tr.flag_key,
             count(*)::int                                            as attempters,
             count(so.student_id)::int                                 as solvers,
             (count(*) - count(so.student_id))::int                    as abandoned,
             coalesce(sum(tr.wrongs), 0)::int                          as wrong_total,
             coalesce(round(avg(tr.wrongs) filter (where so.student_id is null), 1), 0)
                                                                      as tries_given,
             max(tr.last_at)                                           as last_at
      from tried tr
      left join solved so
        on so.flag_key = tr.flag_key and so.student_id = tr.student_id
      group by tr.flag_key
    ) t
  ), '[]'::json);
end $$;
revoke all on function ctf_t_flag_attempts(uuid) from public, anon;
grant execute on function ctf_t_flag_attempts(uuid) to authenticated;

notify pgrst, 'reload schema';
