-- ============================================================================
--  AUTOMATIC WEEKLY SNAPSHOT — schedules the Hall of Fame freeze so it happens
--  by itself at the start of each week, instead of relying on the teacher to
--  click "Snapshot Week." The manual button in teacher.html keeps working
--  (for backfills, or an early freeze) — both paths share the same snapshot
--  logic now, so results are identical either way.
--
--  Requires the pg_cron extension (Database > Extensions in the Supabase
--  dashboard — free tier does not include it; if pg_cron is unavailable,
--  keep using the manual button).
--
--  Run AFTER weekly-winners.sql.
-- ============================================================================

create extension if not exists pg_cron;

-- shared snapshot body — no auth check, callable only from other functions.
create or replace function _snapshot_week_for_class(p_class uuid, p_week date)
returns int language plpgsql security definer set search_path = public as $$
declare v_n int := 0;
begin
  delete from weekly_winners where class_id = p_class and week_start = p_week;
  insert into weekly_winners (class_id, week_start, pos, handle, xp)
  select p_class, p_week, pos, handle, xp from (
    select row_number() over (order by w.xp desc, st.handle asc) as pos, st.handle, w.xp
    from students st
    join (
      select student_id,
             coalesce(sum(points),0) +
             coalesce((select sum(amount) from xp_grants g where g.student_id = fe.student_id
                       and g.created_at >= p_week and g.created_at < p_week + interval '7 days'), 0) as xp
      from flag_events fe
      where fe.created_at >= p_week and fe.created_at < p_week + interval '7 days'
      group by student_id
      union all
      select g.student_id, coalesce(sum(g.amount),0)
      from xp_grants g
      where g.created_at >= p_week and g.created_at < p_week + interval '7 days'
        and g.student_id not in (select student_id from flag_events where created_at >= p_week and created_at < p_week + interval '7 days')
      group by g.student_id
    ) w on w.student_id = st.id
    where st.class_id = p_class and w.xp > 0
  ) t
  where pos <= 3;
  select count(*) into v_n from weekly_winners where class_id = p_class and week_start = p_week;
  return v_n;
end $$;
revoke all on function _snapshot_week_for_class(uuid,date) from public, anon, authenticated;

-- teacher-triggered path now just calls the shared body (same behavior as before)
create or replace function ctf_t_snapshot_week(p_class uuid)
returns json language plpgsql security definer set search_path = public as $$
declare v_week date := (_week_start_et() - interval '7 days')::date; v_n int;
begin
  if not _is_teacher() then return json_build_object('error','not_teacher'); end if;
  v_n := _snapshot_week_for_class(p_class, v_week);
  return json_build_object('week_start', v_week, 'saved', v_n);
end $$;

-- entry point: snapshots last week for every class. Safe to re-run
-- (upserts per class/week), so a missed/duplicate run just no-ops.
-- Callable two ways — pick ONE:
--   A) pg_cron (if your Supabase plan has the extension) — schedules itself, see below.
--   B) GitHub Actions cron hitting this as an RPC with the service_role key
--      (works on the free tier — see .github/workflows/weekly-snapshot.yml).
-- security definer + service_role-only grant: safe to expose over the REST RPC
-- endpoint since only the service_role key (never shipped to the browser) can call it.
create or replace function cron_snapshot_all_classes()
returns json language plpgsql security definer set search_path = public as $$
declare v_week date := (_week_start_et() - interval '7 days')::date; c record; v_total int := 0;
begin
  for c in select id from classes loop
    v_total := v_total + _snapshot_week_for_class(c.id, v_week);
  end loop;
  return json_build_object('week_start', v_week, 'saved', v_total);
end $$;
revoke all on function cron_snapshot_all_classes() from public, anon, authenticated;
grant execute on function cron_snapshot_all_classes() to service_role;

-- Option A only — uncomment if pg_cron is enabled (Database > Extensions):
-- select cron.unschedule('weekly-hall-of-fame-snapshot')
-- where exists (select 1 from cron.job where jobname = 'weekly-hall-of-fame-snapshot');
-- select cron.schedule('weekly-hall-of-fame-snapshot', '10 5 * * 1',
--   $$select cron_snapshot_all_classes()$$);
