-- ============================================================================
--  CLASS PULSE  (v2.0)  —  live "who's working on what" for pulse.html.
--
--  The arena pings every 30 s while the tab is visible: which flag is open,
--  misses on it, current combo. pulse.html polls ctf_t_pulse every 10 s.
--  One row per student (upsert), so the table never grows.
--
--  Run AFTER schema.sql, google-auth.sql, attempt-log.sql. Safe to re-run.
-- ============================================================================

create table if not exists presence (
  student_id uuid primary key references students(id) on delete cascade,
  class_id   uuid not null references classes(id) on delete cascade,
  page       text,
  flag_key   text,
  flag_title text,
  misses     int not null default 0,
  combo      numeric not null default 1,
  seen_at    timestamptz not null default now()
);
create index if not exists presence_class on presence (class_id, seen_at desc);
alter table presence enable row level security;

create or replace function ctf_presence_ping(
  p_student uuid, p_page text, p_flag text, p_title text, p_misses int, p_combo numeric
) returns json language plpgsql security definer set search_path = public as $$
declare v_class uuid;
begin
  select class_id into v_class from students where id = p_student and auth_user_id = auth.uid();
  if v_class is null then return json_build_object('error','not_yours'); end if;
  insert into presence (student_id, class_id, page, flag_key, flag_title, misses, combo, seen_at)
    values (p_student, v_class, left(p_page,40), left(p_flag,120), left(p_title,160),
            greatest(0, coalesce(p_misses,0)), coalesce(p_combo,1), now())
  on conflict (student_id) do update set
    page = excluded.page, flag_key = excluded.flag_key, flag_title = excluded.flag_title,
    misses = excluded.misses, combo = excluded.combo, seen_at = now();
  return json_build_object('ok', true);
end $$;

create or replace function ctf_t_pulse(p_class uuid)
returns json language plpgsql security definer set search_path = public as $$
declare v_today timestamptz := date_trunc('day', now());
begin
  if not _is_teacher() then return json_build_object('error','not_teacher'); end if;
  return json_build_object(
    'now', now(),
    'students', coalesce((select json_agg(row_to_json(t) order by t.seen_at desc nulls last, t.handle) from (
      select s.id, s.handle,
             coalesce(pr.points,0) + coalesce(pr.bonus,0) as xp,
             coalesce(pr.solved_count,0) as solved_count,
             p.seen_at, p.page, p.flag_key, p.flag_title, coalesce(p.misses,0) as misses, coalesce(p.combo,1) as combo,
             (select max(created_at) from flag_events fe where fe.student_id = s.id) as last_capture,
             (select count(*) from flag_events fe where fe.student_id = s.id and fe.created_at >= v_today) as captures_today,
             (select count(*) from attempt_events ae where ae.student_id = s.id and not ae.correct and ae.created_at >= v_today) as misses_today,
             (select count(*) from attempt_events ae where ae.student_id = s.id and not ae.correct
                and ae.flag_key = p.flag_key and ae.created_at >= now() - interval '30 minutes') as recent_misses
      from students s
      left join progress pr on pr.student_id = s.id
      left join presence p  on p.student_id = s.id
      where s.class_id = p_class
    ) t), '[]'::json),
    'feed', coalesce((select json_agg(row_to_json(f)) from (
      select handle, title, level, points, created_at from flag_events
      where class_id = p_class and created_at >= v_today
      order by created_at desc limit 30
    ) f), '[]'::json),
    'captures_15m', (select count(*) from flag_events where class_id = p_class and created_at >= now() - interval '15 minutes'),
    'captures_today', (select count(*) from flag_events where class_id = p_class and created_at >= v_today)
  );
end $$;

do $$
declare f text;
begin
  foreach f in array array[
    'ctf_presence_ping(uuid,text,text,text,int,numeric)', 'ctf_t_pulse(uuid)'
  ] loop
    execute format('revoke all on function %s from public, anon', f);
    execute format('grant execute on function %s to authenticated', f);
  end loop;
end $$;

notify pgrst, 'reload schema';
