-- © 2026 Robert Reasey, South Fayette School District. Licensed CC BY-NC 4.0 (attribution required, no commercial use). See LICENSE.md.
-- ============================================================================
--  DUEL RECORD + SPECTATOR (v26.3)
--  * ctf_duel_record(student): Flag Duel + Vocab Duel wins/played, the last 8
--    duels, and Weekly Duel Champion weeks (most duel wins in the class that
--    week, at least 1; ties share it). Shown on the student profile.
--  * ctf_t_duels_watch(class): every live student duel in the class for the
--    projector spectator page (duel-watch.html). Never returns vocab terms.
--  Run after arena-duels.sql + vocab-duels.sql. Safe to re-run.
-- ============================================================================

create or replace function _dr_rows(p_class uuid)
returns table (student_id uuid, kind text, at timestamptz, won boolean, sid uuid)
language sql stable security definer set search_path = public as $$
  select p.student_id, 'flag'::text, d.finished_at, coalesce(p.won, false), d.id
    from arena_duels d join arena_duel_players p on p.duel_id = d.id
   where d.class_id = p_class and d.status = 'done' and not p.forfeit
  union all
  select p.student_id, 'vocab'::text, s.finished_at,
         (p.mvp or (s.ends_at is null and exists (select 1 from vd_fights f where f.session_id = s.id and f.winner = p.student_id))), s.id
    from vd_sessions s join vd_players p on p.session_id = s.id
   where s.class_id = p_class and s.kind = 'duel' and s.status = 'done' and p.left_at is null
$$;

create or replace function ctf_duel_record(p_student uuid)
returns json language plpgsql security definer set search_path = public as $$
declare me students;
begin
  select * into me from students where id = p_student and auth_user_id = auth.uid();
  if me.id is null then return json_build_object('error','not_yours'); end if;
  return (
    with r as (select * from _dr_rows(me.class_id)),
    wk as (select date_trunc('week', at) w, student_id, count(*) filter (where won) wins from r group by 1, 2),
    champ as (select x.w, x.student_id from wk x where x.wins > 0 and x.wins = (select max(y.wins) from wk y where y.w = x.w))
    select json_build_object(
      'flag',  json_build_object('played', (select count(*) from r where student_id = me.id and kind = 'flag'),
                                 'wins',   (select count(*) from r where student_id = me.id and kind = 'flag' and won)),
      'vocab', json_build_object('played', (select count(*) from r where student_id = me.id and kind = 'vocab'),
                                 'wins',   (select count(*) from r where student_id = me.id and kind = 'vocab' and won)),
      'champ_weeks', (select count(*) from champ where student_id = me.id and w < date_trunc('week', now())),
      'leading_now', exists (select 1 from champ where student_id = me.id and w = date_trunc('week', now())),
      'week_wins', coalesce((select wins from wk where student_id = me.id and w = date_trunc('week', now())), 0),
      'recent', (select coalesce(json_agg(x order by x.at desc), '[]'::json) from (
          select r1.kind, r1.at, r1.won,
                 (select string_agg(st.handle, ', ') from r r2 join students st on st.id = r2.student_id
                   where r2.sid = r1.sid and r2.student_id <> me.id) as vs
            from r r1 where r1.student_id = me.id order by r1.at desc limit 8) x)
    ));
end $$;

create or replace function ctf_t_duels_watch(p_class uuid)
returns json language plpgsql security definer set search_path = public as $$
declare r record;
begin
  if not _is_teacher() then return json_build_object('error','not_teacher'); end if;
  perform _ad_tidy(p_class);
  for r in select id from vd_sessions where class_id = p_class and kind = 'duel' and status = 'live' loop
    perform _vd_tidy(r.id);
  end loop;
  return json_build_object('now', now(),
    'flag', (select coalesce(json_agg(row_to_json(t) order by t.started_at), '[]'::json) from (
      select d.id, d.code, d.modules, d.started_at, d.ends_at,
        (select coalesce(json_agg(json_build_object('id', p.student_id, 'handle', s.handle, 'points', p.points, 'caps', p.caps, 'forfeit', p.forfeit) order by p.joined_at), '[]'::json)
           from arena_duel_players p join students s on s.id = p.student_id where p.duel_id = d.id) as players,
        (select coalesce(json_agg(json_build_object('handle', s.handle, 'pts', k.pts, 'at', k.at, 'bounty', k.bounty) order by k.at desc), '[]'::json)
           from (select * from arena_duel_caps where duel_id = d.id order by at desc limit 8) k join students s on s.id = k.student_id) as feed
        from arena_duels d where d.class_id = p_class and d.status = 'live') t),
    'vocab', (select coalesce(json_agg(row_to_json(t) order by t.started_at), '[]'::json) from (
      select v.id, v.code, v.modules, v.started_at, v.ends_at, v.ends_at is not null as brawl,
        (select coalesce(json_agg(json_build_object('id', p.student_id, 'handle', s.handle, 'wins', p.wins) order by p.joined_at), '[]'::json)
           from vd_players p join students s on s.id = p.student_id where p.session_id = v.id and p.left_at is null) as players,
        (select coalesce(json_agg(json_build_object('a', a.handle, 'b', b.handle, 'hp1', f.hp1, 'hp2', f.hp2)), '[]'::json)
           from vd_fights f join students a on a.id = f.p1 join students b on b.id = f.p2 where f.session_id = v.id and f.status = 'live') as fights,
        (select coalesce(json_agg(json_build_object('who', w.handle, 'loser', l.handle, 'at', f.ended_at, 'revenge', f.revenge, 'bounty', f.bounty) order by f.ended_at desc), '[]'::json)
           from (select * from vd_fights where session_id = v.id and status = 'done' and winner is not null order by ended_at desc limit 8) f
           join students w on w.id = f.winner join students l on l.id = case when f.winner = f.p1 then f.p2 else f.p1 end) as kos
        from vd_sessions v where v.class_id = p_class and v.kind = 'duel' and v.status = 'live') t)
  );
end $$;

do $$
declare f text;
begin
  execute 'revoke all on function _dr_rows(uuid) from public, anon, authenticated';
  foreach f in array array['ctf_duel_record(uuid)', 'ctf_t_duels_watch(uuid)'] loop
    execute format('revoke all on function %s from public, anon', f);
    execute format('grant execute on function %s to authenticated', f);
  end loop;
end $$;
notify pgrst, 'reload schema';
