-- ============================================================================
--  WEEKLY WINNERS ARCHIVE  —  snapshots top-3 for a class's week so past
--  winners survive after the week rolls over. Run AFTER board-leaderboard-weekly.sql.
--
--  ctf_t_snapshot_week(class): teacher-triggered, call it once after a week ends
--  (e.g. Monday morning) to freeze last week's top 3. Safe to re-run for the
--  same week — upserts on (class_id, week_start).
--  ctf_t_weekly_winners(class): teacher view of the archive, most recent first.
--  ctf_weekly_winners_google(class): student-facing version, same shape.
-- ============================================================================

create table if not exists weekly_winners (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references classes(id) on delete cascade,
  week_start date not null,
  pos int not null check (pos in (1,2,3)),
  handle text not null,
  xp int not null,
  created_at timestamptz not null default now(),
  unique(class_id, week_start, pos)
);
create index if not exists weekly_winners_class_idx on weekly_winners(class_id, week_start desc);

create or replace function ctf_t_snapshot_week(p_class uuid)
returns json language plpgsql security definer set search_path = public as $$
declare v_week date := (_week_start_et() - interval '7 days')::date; v_n int := 0;
begin
  if not _is_teacher() then return json_build_object('error','not_teacher'); end if;
  delete from weekly_winners where class_id = p_class and week_start = v_week;
  insert into weekly_winners (class_id, week_start, pos, handle, xp)
  select p_class, v_week, pos, handle, xp from (
    select row_number() over (order by w.xp desc, st.handle asc) as pos, st.handle, w.xp
    from students st
    join (
      select student_id,
             coalesce(sum(points),0) +
             coalesce((select sum(amount) from xp_grants g where g.student_id = fe.student_id
                       and g.created_at >= v_week and g.created_at < v_week + interval '7 days'), 0) as xp
      from flag_events fe
      where fe.created_at >= v_week and fe.created_at < v_week + interval '7 days'
      group by student_id
      union all
      select g.student_id, coalesce(sum(g.amount),0)
      from xp_grants g
      where g.created_at >= v_week and g.created_at < v_week + interval '7 days'
        and g.student_id not in (select student_id from flag_events where created_at >= v_week and created_at < v_week + interval '7 days')
      group by g.student_id
    ) w on w.student_id = st.id
    where st.class_id = p_class and w.xp > 0
  ) t
  where pos <= 3;
  select count(*) into v_n from weekly_winners where class_id = p_class and week_start = v_week;
  return json_build_object('week_start', v_week, 'saved', v_n);
end $$;

create or replace function ctf_t_weekly_winners(p_class uuid)
returns json language plpgsql security definer set search_path = public as $$
begin
  if not _is_teacher() then return json_build_object('error','not_teacher'); end if;
  return coalesce((select json_agg(row_to_json(t) order by t.week_start desc, t.pos)
    from (select week_start, pos, handle, xp from weekly_winners where class_id = p_class) t), '[]'::json);
end $$;

create or replace function ctf_weekly_winners_google(p_class uuid)
returns json language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from students where class_id = p_class and auth_user_id = auth.uid())
    then return json_build_object('error','not_yours'); end if;
  return coalesce((select json_agg(row_to_json(t) order by t.week_start desc, t.pos)
    from (select week_start, pos, handle, xp from weekly_winners where class_id = p_class) t), '[]'::json);
end $$;

grant execute on function ctf_t_snapshot_week(uuid) to anon, authenticated;
grant execute on function ctf_t_weekly_winners(uuid) to anon, authenticated;
grant execute on function ctf_weekly_winners_google(uuid) to anon, authenticated;
