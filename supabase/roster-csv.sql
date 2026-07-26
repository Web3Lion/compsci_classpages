-- ============================================================================
-- ROSTER CSV + STUDENT MOVES
--
-- Two related teacher needs:
--
--  1. Upload a roster. Students still sign in with their own Google account —
--     this does not create accounts, and it never invents a handle. It records
--     WHO IS EXPECTED in a class, so the teacher can see who hasn't signed in
--     yet, and so a student's class can be found by email without them having
--     to type a code.
--
--  2. Move a student between classes without wiping their work. A move keeps
--     the student row (and therefore all progress, captures, attempts, and
--     integrity history) and just re-points class_id.
--
-- Safe to re-run.
-- ============================================================================

create table if not exists roster_entries (
  class_id   uuid not null references classes(id) on delete cascade,
  email      text not null,
  full_name  text not null default '',
  note       text not null default '',
  created_at timestamptz not null default now(),
  primary key (class_id, email)
);
alter table roster_entries enable row level security;   -- no policies: sealed
create index if not exists roster_entries_email_idx on roster_entries (email);

-- ---- import (upsert) a batch of rows ----------------------------------------
-- p_rows: [{"email":"a@b.org","full_name":"Ada L","note":"period 3"}, ...]
-- Emails are lowercased and trimmed. Re-importing the same list is a no-op
-- apart from refreshing names, so a teacher can paste an updated export.
create or replace function ctf_t_roster_import(p_class uuid, p_rows jsonb, p_replace boolean default false)
returns json language plpgsql security definer set search_path = public as $$
declare
  v_added int := 0; v_updated int := 0; v_bad int := 0;
  r jsonb; v_email text; v_name text; v_note text; v_existed boolean;
begin
  if not _is_teacher() then return json_build_object('error','not_teacher'); end if;
  if not exists (select 1 from classes where id = p_class) then
    return json_build_object('error','no_class');
  end if;

  if coalesce(p_replace, false) then
    delete from roster_entries where class_id = p_class;
  end if;

  for r in select * from jsonb_array_elements(coalesce(p_rows, '[]'::jsonb)) loop
    v_email := lower(trim(coalesce(r->>'email','')));
    v_name  := left(trim(coalesce(r->>'full_name','')), 120);
    v_note  := left(trim(coalesce(r->>'note','')), 120);

    -- must look like an email; anything else is counted and skipped
    if v_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
      v_bad := v_bad + 1;
      continue;
    end if;

    select true into v_existed from roster_entries
      where class_id = p_class and email = v_email;

    insert into roster_entries (class_id, email, full_name, note)
      values (p_class, v_email, v_name, v_note)
    on conflict (class_id, email) do update
      set full_name = case when excluded.full_name <> '' then excluded.full_name else roster_entries.full_name end,
          note      = case when excluded.note      <> '' then excluded.note      else roster_entries.note      end;

    if coalesce(v_existed, false) then v_updated := v_updated + 1; else v_added := v_added + 1; end if;
    v_existed := null;
  end loop;

  return json_build_object('ok', true, 'added', v_added, 'updated', v_updated, 'skipped', v_bad);
end $$;
revoke all on function ctf_t_roster_import(uuid, jsonb, boolean) from public, anon;
grant execute on function ctf_t_roster_import(uuid, jsonb, boolean) to authenticated;

-- ---- read the expected roster, matched against who actually signed in -------
create or replace function ctf_t_roster_expected(p_class uuid)
returns json language plpgsql security definer set search_path = public as $$
begin
  if not _is_teacher() then return json_build_object('error','not_teacher'); end if;
  return coalesce((
    select json_agg(row_to_json(t) order by t.joined, lower(t.full_name), t.email)
    from (
      select re.email, re.full_name, re.note, re.created_at,
             s.id as student_id, s.handle,
             (s.id is not null) as joined
      from roster_entries re
      left join students s
        on s.class_id = re.class_id and lower(s.email) = re.email
      where re.class_id = p_class
    ) t
  ), '[]'::json);
end $$;
revoke all on function ctf_t_roster_expected(uuid) from public, anon;
grant execute on function ctf_t_roster_expected(uuid) to authenticated;

-- ---- remove one expected row (a student who transferred out) ----------------
create or replace function ctf_t_roster_remove(p_class uuid, p_email text)
returns json language plpgsql security definer set search_path = public as $$
begin
  if not _is_teacher() then return json_build_object('error','not_teacher'); end if;
  delete from roster_entries
    where class_id = p_class and email = lower(trim(coalesce(p_email,'')));
  return json_build_object('ok', true);
end $$;
revoke all on function ctf_t_roster_remove(uuid, text) from public, anon;
grant execute on function ctf_t_roster_remove(uuid, text) to authenticated;

-- ---- move a student to another class, keeping all their work ----------------
-- Refuses if the target already has someone using that handle, so the class
-- leaderboard never shows two of the same name. Moving across COURSES is
-- allowed but flagged in the response: the flag keys won't match the new
-- course, so their solved count will read oddly until they re-earn it.
create or replace function ctf_t_move_student(p_student uuid, p_class uuid)
returns json language plpgsql security definer set search_path = public as $$
declare v_s students; v_from classes; v_to classes;
begin
  if not _is_teacher() then return json_build_object('error','not_teacher'); end if;

  select * into v_s from students where id = p_student;
  if not found then return json_build_object('error','no_student'); end if;

  select * into v_to from classes where id = p_class;
  if not found then return json_build_object('error','no_class'); end if;

  if v_s.class_id = v_to.id then return json_build_object('ok', true, 'same', true); end if;

  select * into v_from from classes where id = v_s.class_id;

  if exists (select 1 from students
             where class_id = v_to.id and lower(handle) = lower(v_s.handle)) then
    return json_build_object('error','handle_taken');
  end if;

  update students set class_id = v_to.id, group_id = null where id = p_student;
  update progress  set course  = v_to.course where student_id = p_student;

  -- history rows carry a class_id for the teacher's per-class views; move them
  -- with the student so their record follows them.
  update flag_events  set class_id = v_to.id, course = v_to.course where student_id = p_student;
  update cheat_events set class_id = v_to.id, course = v_to.course where student_id = p_student;
  begin
    update attempt_events set class_id = v_to.id, course = v_to.course where student_id = p_student;
  exception when undefined_table then null;
  end;
  begin
    update pioneer_claims set class_id = v_to.id where student_id = p_student;
  exception when undefined_table then null;
       when unique_violation then
         -- someone in the destination already broke ground on that flag
         delete from pioneer_claims where student_id = p_student and class_id = v_from.id;
  end;

  return json_build_object(
    'ok', true,
    'course_changed', (v_from.course is distinct from v_to.course),
    'from', v_from.name, 'to', v_to.name
  );
end $$;
revoke all on function ctf_t_move_student(uuid, uuid) from public, anon;
grant execute on function ctf_t_move_student(uuid, uuid) to authenticated;

-- ---- bulk remove ------------------------------------------------------------
create or replace function ctf_t_remove_students(p_students uuid[])
returns json language plpgsql security definer set search_path = public as $$
declare n int;
begin
  if not _is_teacher() then return json_build_object('error','not_teacher'); end if;
  delete from students where id = any(coalesce(p_students,'{}'::uuid[]));
  get diagnostics n = row_count;
  return json_build_object('ok', true, 'removed', n);
end $$;
revoke all on function ctf_t_remove_students(uuid[]) from public, anon;
grant execute on function ctf_t_remove_students(uuid[]) to authenticated;

-- ---- student-side: which class is my email rostered into? -------------------
-- Lets the join gate skip the class code when the teacher has uploaded a
-- roster. Returns only classes the caller's own email appears on.
create or replace function ctf_roster_lookup(p_course text)
returns json language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then return json_build_object('error','not_signed_in'); end if;
  if not _is_school() then return json_build_object('error','not_school_account'); end if;
  return coalesce((
    select json_agg(row_to_json(t))
    from (
      select c.id as class_id, c.name as class_name, c.code, c.course
      from roster_entries re
      join classes c on c.id = re.class_id
      where re.email = lower(_email())
        and (p_course is null or c.course = p_course)
    ) t
  ), '[]'::json);
end $$;
revoke all on function ctf_roster_lookup(text) from public, anon;
grant execute on function ctf_roster_lookup(text) to authenticated;

notify pgrst, 'reload schema';
