-- ============================================================================
--  WEEKLY LEADERBOARD  —  same shape as ctf_t_leaderboard / ctf_leaderboard_full_google
--  but scoped to the current week only (Sunday 12:00 AM through the following
--  Sunday 12:00 AM, America/New_York). XP = flag_events.points earned this week
--  + xp_grants.amount granted this week. Run AFTER schema.sql, google-auth.sql,
--  teacher-xp.sql, board-leaderboard.sql.
-- ============================================================================

create or replace function _week_start_et()
returns timestamptz language sql stable as $$
  select (date_trunc('day', now() at time zone 'America/New_York')
          - (extract(dow from (now() at time zone 'America/New_York'))::int) * interval '1 day')::timestamp
         at time zone 'America/New_York';
$$;

create or replace function ctf_t_leaderboard_weekly(p_class uuid)
returns json language plpgsql security definer set search_path = public as $$
declare v_start timestamptz := _week_start_et(); v_end timestamptz := _week_start_et() + interval '7 days';
begin
  if not _is_teacher() then return json_build_object('error','not_teacher'); end if;
  return coalesce((select json_agg(row_to_json(t) order by t.pos) from (
    select row_number() over (order by w.xp desc, st.handle asc) as pos,
           st.handle, w.xp,
           w.solved_count,
           coalesce(pr.total_count,0) as total_count,
           coalesce((pr.streak->>'count')::int, 0) as streak_count,
           coalesce(array_length(array(select jsonb_object_keys(pr.badges)), 1), 0) as badge_count
    from students st
    join (
      select student_id,
             coalesce(sum(points),0) +
             coalesce((select sum(amount) from xp_grants g where g.student_id = fe.student_id
                       and g.created_at >= v_start and g.created_at < v_end), 0) as xp,
             count(*) as solved_count
      from flag_events fe
      where fe.created_at >= v_start and fe.created_at < v_end
      group by student_id
      union all
      select g.student_id, coalesce(sum(g.amount),0), 0
      from xp_grants g
      where g.created_at >= v_start and g.created_at < v_end
        and g.student_id not in (select student_id from flag_events where created_at >= v_start and created_at < v_end)
      group by g.student_id
    ) w on w.student_id = st.id
    left join progress pr on pr.student_id = st.id
    where st.class_id = p_class and w.xp > 0
  ) t), '[]'::json);
end $$;

create or replace function ctf_leaderboard_full_google_weekly(p_class uuid)
returns json language plpgsql security definer set search_path = public as $$
declare v_start timestamptz := _week_start_et(); v_end timestamptz := _week_start_et() + interval '7 days';
begin
  if not exists (select 1 from students where class_id = p_class and auth_user_id = auth.uid())
    then return json_build_object('error','not_yours'); end if;
  return coalesce((select json_agg(row_to_json(t) order by t.pos) from (
    select row_number() over (order by w.xp desc, st.handle asc) as pos,
           st.handle, w.xp,
           w.solved_count,
           coalesce(pr.total_count,0) as total_count,
           coalesce((pr.streak->>'count')::int, 0) as streak_count,
           coalesce(array_length(array(select jsonb_object_keys(pr.badges)), 1), 0) as badge_count
    from students st
    join (
      select student_id,
             coalesce(sum(points),0) +
             coalesce((select sum(amount) from xp_grants g where g.student_id = fe.student_id
                       and g.created_at >= v_start and g.created_at < v_end), 0) as xp,
             count(*) as solved_count
      from flag_events fe
      where fe.created_at >= v_start and fe.created_at < v_end
      group by student_id
      union all
      select g.student_id, coalesce(sum(g.amount),0), 0
      from xp_grants g
      where g.created_at >= v_start and g.created_at < v_end
        and g.student_id not in (select student_id from flag_events where created_at >= v_start and created_at < v_end)
      group by g.student_id
    ) w on w.student_id = st.id
    left join progress pr on pr.student_id = st.id
    where st.class_id = p_class and w.xp > 0
  ) t), '[]'::json);
end $$;

grant execute on function _week_start_et() to anon, authenticated;
grant execute on function ctf_t_leaderboard_weekly(uuid) to anon, authenticated;
grant execute on function ctf_leaderboard_full_google_weekly(uuid) to anon, authenticated;
