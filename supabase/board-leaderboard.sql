-- ============================================================================
--  BOARD LEADERBOARD  —  full-class ranked list for the classroom-display page
--  (leaderboard.html). Teacher-only, unlike ctf_leaderboard_google (student,
--  top-5, no XP shown). This returns every student with progress > 0, full
--  XP, badge count and current streak, for a big-screen board a teacher
--  projects. Run AFTER schema.sql + google-auth.sql (+ teachers.sql if using
--  multiple teacher accounts).
-- ============================================================================

create or replace function ctf_t_leaderboard(p_class uuid)
returns json language plpgsql security definer set search_path = public as $$
begin
  if not _is_teacher() then return json_build_object('error','not_teacher'); end if;
  return coalesce((select json_agg(row_to_json(t) order by t.pos) from (
    select row_number() over (order by (coalesce(pr.points,0)+coalesce(pr.bonus,0)) desc,
                                       pr.updated_at asc) as pos,
           st.handle,
           (coalesce(pr.points,0)+coalesce(pr.bonus,0)) as xp,
           coalesce(pr.solved_count,0) as solved_count,
           coalesce(pr.total_count,0) as total_count,
           coalesce((pr.streak->>'count')::int, 0) as streak_count,
           coalesce(array_length(array(select jsonb_object_keys(pr.badges)), 1), 0) as badge_count
    from students st join progress pr on pr.student_id = st.id
    where st.class_id = p_class and (coalesce(pr.points,0)+coalesce(pr.bonus,0)) > 0
    order by (coalesce(pr.points,0)+coalesce(pr.bonus,0)) desc, pr.updated_at asc
  ) t), '[]'::json);
end $$;

grant execute on function ctf_t_leaderboard(uuid) to anon, authenticated;
