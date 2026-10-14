-- © 2026 Robert Reasey, South Fayette School District. Licensed CC BY-NC 4.0 (attribution required, no commercial use). See LICENSE.md.
-- ============================================================================
--  TEACHER MIRROR (v20.0)  —  a teacher plays the CTF once and shows up on the
--  leaderboard of EVERY class they own in that course, with the same score.
--
--  How it works:
--    • When a teacher account's progress row is synced, a trigger copies it to
--      the same Google account's row in every other class of that course whose
--      owner_email is the teacher (or has no owner).
--    • Missing rows are created on the first sync, with the same hacker name
--      (a number is added only if a student in that class already has it).
--    • Nothing marks the row as a teacher anywhere students can see it.
--    • Teacher rows never receive module clears (Mentor / Vanguard ranks),
--      Clear Crates, Coin Packs, or any other reward item, so students keep
--      every first-place clear and prize.
--
--  Only the leaderboard numbers are mirrored (XP, solved count, engine state,
--  streak, badges). Flag captures stay logged in the class you played in, so
--  Flag Analytics for the other periods isn't skewed.
--
--  Run AFTER google-auth.sql, teachers.sql and teacher-xp.sql. Uses triggers,
--  so no other file overwrites it. Safe to re-run.
-- ============================================================================

create or replace function _is_teacher_email(p text) returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce(p,'') <> ''
     and (lower(p) = lower(_teacher_email()) or exists (select 1 from teachers t where t.email = lower(p)));
$$;
revoke all on function _is_teacher_email(text) from public, anon, authenticated;

create or replace function _teacher_mirror() returns trigger
language plpgsql security definer set search_path = public as $$
declare s students; c classes; r record; h text; n int;
begin
  if pg_trigger_depth() > 1 then return new; end if;
  select * into s from students where id = new.student_id;
  if not found or s.auth_user_id is null or not _is_teacher_email(s.email) then return new; end if;
  select * into c from classes where id = s.class_id;

  -- make sure the teacher has a row in every class of this course they own
  for r in
    select cl.id from classes cl
     where cl.course = c.course and cl.id <> c.id
       and lower(coalesce(cl.owner_email, s.email)) = lower(s.email)
       and not exists (select 1 from students x where x.class_id = cl.id and x.auth_user_id = s.auth_user_id)
  loop
    h := s.handle; n := 1;
    while exists (select 1 from students x where x.class_id = r.id and lower(x.handle) = lower(h)) loop
      n := n + 1; h := left(s.handle, 20) || n::text;
    end loop;
    insert into students (class_id, handle, auth_user_id, email) values (r.id, h, s.auth_user_id, s.email);
  end loop;

  insert into progress (student_id, course)
    select x.id, c.course from students x join classes cl on cl.id = x.class_id
     where x.auth_user_id = s.auth_user_id and cl.course = c.course and x.id <> s.id
       and lower(coalesce(cl.owner_email, s.email)) = lower(s.email)
  on conflict (student_id) do nothing;

  update progress p set
    points        = new.points,
    bonus         = new.bonus,
    client_bonus  = new.client_bonus,
    teacher_bonus = new.teacher_bonus,
    solved_count  = new.solved_count,
    total_count   = new.total_count,
    state         = new.state,
    streak        = new.streak,
    badges        = new.badges,
    updated_at    = now()
  from students x join classes cl on cl.id = x.class_id
  where p.student_id = x.id and x.auth_user_id = s.auth_user_id
    and cl.course = c.course and x.id <> s.id
    and lower(coalesce(cl.owner_email, s.email)) = lower(s.email);

  update students x set last_seen = now()
    from classes cl
   where cl.id = x.class_id and cl.course = c.course
     and x.auth_user_id = s.auth_user_id and x.id <> s.id
     and lower(coalesce(cl.owner_email, s.email)) = lower(s.email);
  return new;
end $$;

drop trigger if exists teacher_mirror on progress;
create trigger teacher_mirror after update on progress
  for each row execute function _teacher_mirror();

-- ---- teacher rows never take a clear or a prize from a student --------------
create or replace function _teacher_no_rewards() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if exists (select 1 from students s where s.id = new.student_id and _is_teacher_email(s.email)) then
    return null;   -- silently skip the insert
  end if;
  return new;
end $$;

do $$
begin
  if exists (select 1 from information_schema.tables where table_schema='public' and table_name='module_clears') then
    execute 'drop trigger if exists teacher_no_clear on module_clears';
    execute 'create trigger teacher_no_clear before insert on module_clears for each row execute function _teacher_no_rewards()';
  end if;
  if exists (select 1 from information_schema.tables where table_schema='public' and table_name='reward_items') then
    execute 'drop trigger if exists teacher_no_items on reward_items';
    execute 'create trigger teacher_no_items before insert on reward_items for each row execute function _teacher_no_rewards()';
  end if;
end $$;

revoke all on function _teacher_mirror() from public, anon, authenticated;
revoke all on function _teacher_no_rewards() from public, anon, authenticated;

notify pgrst, 'reload schema';
