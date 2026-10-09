-- ============================================================================
--  WEEKLY XP SUMMARY  —  teacher.html → "Weekly XP" tab
--  XP each student earned in each of the last N weeks (Sunday 12:00 AM to
--  Sunday 12:00 AM, America/New_York). XP = flag_events.points + xp_grants.amount,
--  the same definition the weekly leaderboard uses. Google name comes from the
--  enrollment list (roster_entries.full_name) when one was uploaded.
--  Run AFTER schema.sql, google-auth.sql, teacher-xp.sql, roster-csv.sql.
--  Safe to re-run.
-- ============================================================================

create or replace function _week_of_et(ts timestamptz)
returns date language sql immutable as $$
  select ((ts at time zone 'America/New_York')::date
          - extract(dow from (ts at time zone 'America/New_York'))::int);
$$;

create or replace function ctf_t_weekly_xp(p_class uuid, p_weeks int default 8)
returns json language plpgsql security definer set search_path = public as $$
declare
  v_n     int  := greatest(1, least(coalesce(p_weeks, 8), 26));
  v_this  date := _week_of_et(now());
  v_first date := v_this - (v_n - 1) * 7;
  v_from  timestamptz := (v_first::timestamp) at time zone 'America/New_York';
begin
  if not _is_teacher() then return json_build_object('error','not_teacher'); end if;
  return json_build_object(
    'weeks', (select json_agg(to_char(v_this - g * 7, 'YYYY-MM-DD') order by g)
              from generate_series(0, v_n - 1) g),
    'students', coalesce((select json_agg(row_to_json(t)) from (
      select s.id, s.handle, s.email,
             coalesce(nullif(re.full_name, ''), '') as full_name,
             coalesce((select json_object_agg(wk, xp) from (
                select to_char(wk, 'YYYY-MM-DD') as wk, sum(xp) as xp from (
                  select _week_of_et(fe.created_at) as wk, coalesce(fe.points, 0) as xp
                    from flag_events fe where fe.student_id = s.id and fe.created_at >= v_from
                  union all
                  select _week_of_et(g.created_at), coalesce(g.amount, 0)
                    from xp_grants g where g.student_id = s.id and g.created_at >= v_from
                ) x group by wk
             ) w), '{}'::json) as weeks
      from students s
      left join roster_entries re on re.class_id = s.class_id and lower(re.email) = lower(s.email)
      where s.class_id = p_class
    ) t), '[]'::json)
  );
end $$;

revoke all on function ctf_t_weekly_xp(uuid, int) from public, anon;
grant execute on function ctf_t_weekly_xp(uuid, int) to authenticated;

notify pgrst, 'reload schema';
