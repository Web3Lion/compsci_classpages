-- ============================================================================
--  WEEKLY LEADERBOARD  —  same shape as ctf_t_leaderboard / ctf_leaderboard_full_google
--  but scoped to the current week only (Sunday 12:00 AM through the following
--  Sunday 12:00 AM, America/New_York). XP = flag_events.points earned this week
--  + xp_grants.amount granted this week. Run AFTER schema.sql, google-auth.sql,
--  teacher-xp.sql, board-leaderboard.sql, teachers.sql.
--  23.4.1: teacher accounts count their captures from every period (see _week_board).
-- ============================================================================

create or replace function _week_start_et()
returns timestamptz language sql stable as $$
  select (date_trunc('day', now() at time zone 'America/New_York')
          - (extract(dow from (now() at time zone 'America/New_York'))::int) * interval '1 day')::timestamp
         at time zone 'America/New_York';
$$;

-- 23.4.1: one row per student in the class with this week's XP. A teacher
-- account (teacher-mirror.sql) counts captures + grants from ALL of its rows in
-- this course, so the teacher shows on every period's weekly board, unlabeled.
create or replace function _week_board(p_class uuid, p_start timestamptz)
returns table (student_id uuid, handle text, xp bigint, solved_count bigint)
language sql stable security definer set search_path = public as $$
  select st.id, st.handle::text,
         (coalesce((select sum(fe.points) from flag_events fe where fe.student_id = any(m.ids)
                     and fe.created_at >= p_start and fe.created_at < p_start + interval '7 days'),0)
        + coalesce((select sum(g.amount) from xp_grants g where g.student_id = any(m.ids)
                     and g.created_at >= p_start and g.created_at < p_start + interval '7 days'),0))::bigint,
         (select count(*) from flag_events fe where fe.student_id = any(m.ids)
            and fe.created_at >= p_start and fe.created_at < p_start + interval '7 days')
  from students st
  join classes c on c.id = st.class_id
  cross join lateral (select case
      when st.auth_user_id is not null and coalesce(st.email,'') <> ''
       and (lower(st.email) = lower(_teacher_email()) or exists (select 1 from teachers t where t.email = lower(st.email)))
      then array(select x.id from students x join classes cx on cx.id = x.class_id
                  where x.auth_user_id = st.auth_user_id and cx.course = c.course)
      else array[st.id] end as ids) m
  where st.class_id = p_class
$$;
revoke all on function _week_board(uuid, timestamptz) from public, anon, authenticated;

create or replace function ctf_t_leaderboard_weekly(p_class uuid)
returns json language plpgsql security definer set search_path = public as $$
begin
  if not _is_teacher() then return json_build_object('error','not_teacher'); end if;
  return coalesce((select json_agg(row_to_json(t) order by t.pos) from (
    select row_number() over (order by w.xp desc, w.handle asc) as pos,
           w.handle, w.xp, w.solved_count,
           coalesce(pr.total_count,0) as total_count,
           coalesce((pr.streak->>'count')::int, 0) as streak_count,
           coalesce(array_length(array(select jsonb_object_keys(pr.badges)), 1), 0) as badge_count
    from _week_board(p_class, _week_start_et()) w
    left join progress pr on pr.student_id = w.student_id
    where w.xp > 0
  ) t), '[]'::json);
end $$;

create or replace function ctf_leaderboard_full_google_weekly(p_class uuid)
returns json language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from students where class_id = p_class and auth_user_id = auth.uid())
    then return json_build_object('error','not_yours'); end if;
  return coalesce((select json_agg(row_to_json(t) order by t.pos) from (
    select row_number() over (order by w.xp desc, w.handle asc) as pos,
           w.handle, w.xp, w.solved_count,
           coalesce(pr.total_count,0) as total_count,
           coalesce((pr.streak->>'count')::int, 0) as streak_count,
           coalesce(array_length(array(select jsonb_object_keys(pr.badges)), 1), 0) as badge_count
    from _week_board(p_class, _week_start_et()) w
    left join progress pr on pr.student_id = w.student_id
    where w.xp > 0
  ) t), '[]'::json);
end $$;

grant execute on function _week_start_et() to anon, authenticated;
grant execute on function ctf_t_leaderboard_weekly(uuid) to anon, authenticated;
grant execute on function ctf_leaderboard_full_google_weekly(uuid) to anon, authenticated;
