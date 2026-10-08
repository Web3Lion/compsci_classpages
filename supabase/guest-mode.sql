-- © 2026 Robert Reasey, South Fayette School District. Licensed CC BY-NC 4.0 (attribution required, no commercial use). See LICENSE.md.
-- ============================================================================
--  GUEST MODE  —  let visitors (e.g. educators at a PD session) sign in with
--  ANY Google account and join ONE chosen class with just its code, for a
--  limited time. The teacher opens it from teacher.html → Settings; it closes
--  itself when the timer runs out.
--
--  How it works:
--    guest_mode           one row: which class is open to guests, and until when
--    _is_school_member()  the real school check (domain list OR allowed_emails)
--    _is_school()         member OR a guest window is open right now
--    ctf_join_google      a non-member may join ONLY the guest class, only while open
--  When the window closes, guest accounts are refused again everywhere; their
--  student rows and progress stay in the class until you remove them.
--
--  RUN ORDER: after google-auth.sql, multi-domain.sql and allowed-emails.sql.
--  This file redefines _is_school() and ctf_join_google(); re-running any of
--  those three files later silently turns guest mode off — re-run this one
--  straight afterwards. check-installed.sql / install-check.html detect it.
--
--  Google Cloud OAuth consent screen must be "External" AND published
--  ("In production"), or Google refuses outside accounts before this runs.
--
--  Safe to re-run.
-- ============================================================================

create table if not exists guest_mode (
  id         int primary key default 1 check (id = 1),
  class_id   uuid references classes(id) on delete set null,
  open_until timestamptz,
  set_by     text not null default '',
  updated_at timestamptz not null default now()
);
alter table guest_mode enable row level security;
insert into guest_mode (id) values (1) on conflict (id) do nothing;

-- ---- the real school check (what _is_school() was before this file) --------
create or replace function _is_school_member() returns boolean
language sql stable security definer set search_path = public as $$
  select auth.uid() is not null
     and (
       exists (
         select 1 from unnest(_school_domains()) d
         where lower(coalesce(_email(),'')) like ('%@' || d)
       )
       or exists (select 1 from allowed_emails a where a.email = lower(coalesce(_email(),'')))
     );
$$;

create or replace function _guest_open() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from guest_mode g where g.id = 1 and g.class_id is not null and g.open_until > now());
$$;

-- every RPC that calls _is_school() lets guests through while the window is
-- open; joining is still limited to the guest class (ctf_join_google below)
create or replace function _is_school() returns boolean
language sql stable security definer set search_path = public as $$
  select _is_school_member() or (auth.uid() is not null and _guest_open());
$$;

-- ---- join (same as google-auth.sql, plus the guest-class restriction) ------
create or replace function ctf_join_google(p_code text, p_handle text)
returns json language plpgsql security definer set search_path = public as $$
declare
  v_class classes; v_student students; v_prog progress;
  v_new text := trim(coalesce(p_handle,''));
begin
  if auth.uid() is null then return json_build_object('error','not_signed_in'); end if;

  select * into v_class from classes where upper(code) = upper(trim(p_code));
  if not found then
    if not _is_school() then return json_build_object('error','not_school_account'); end if;
    return json_build_object('error','class_not_found');
  end if;

  if not _is_school_member() then
    if not exists (select 1 from guest_mode g where g.id = 1 and g.class_id = v_class.id and g.open_until > now()) then
      return json_build_object('error', case when _guest_open() then 'not_guest_class' else 'not_school_account' end);
    end if;
  end if;

  select * into v_student from students
    where class_id = v_class.id and auth_user_id = auth.uid();

  if not found then
    if not _name_ok(v_new) then return json_build_object('error','not_allowed'); end if;
    if exists (select 1 from students where class_id = v_class.id and lower(handle) = lower(v_new)) then
      return json_build_object('error','handle_taken');
    end if;
    insert into students (class_id, handle, auth_user_id, email)
      values (v_class.id, v_new, auth.uid(), _email())
      returning * into v_student;
    insert into progress (student_id, course) values (v_student.id, v_class.course)
      on conflict (student_id) do nothing;
  else
    update students set last_seen = now() where id = v_student.id;
  end if;

  select * into v_prog from progress where student_id = v_student.id;

  return json_build_object(
    'student_id', v_student.id,
    'class_id',   v_class.id,
    'course',     v_class.course,
    'class_name', v_class.name,
    'handle',     v_student.handle,
    'frozen',     v_class.frozen_dates,
    'resumed',    v_prog.student_id is not null,
    'progress',   case when v_prog.student_id is null then null else row_to_json(v_prog) end
  );
end $$;

-- ---- public: is guest sign-in open right now? (client sign-in gate) --------
create or replace function ctf_guest_status()
returns json language sql stable security definer set search_path = public as $$
  select json_build_object('open', _guest_open(),
    'until', (select case when _guest_open() then open_until end from guest_mode where id = 1));
$$;
grant execute on function ctf_guest_status() to anon, authenticated;

-- ---- teacher: read + set ---------------------------------------------------
create or replace function ctf_t_guest()
returns json language plpgsql stable security definer set search_path = public as $$
declare v json;
begin
  if not _is_teacher() then return json_build_object('error','not_teacher'); end if;
  select json_build_object(
    'open',       _guest_open(),
    'class_id',   g.class_id,
    'class_name', c.name,
    'code',       c.code,
    'open_until', g.open_until,
    'set_by',     g.set_by,
    'guests',     (select count(*) from students s where s.class_id = g.class_id
                     and not exists (select 1 from unnest(_school_domains()) d where lower(coalesce(s.email,'')) like ('%@' || d))
                     and not exists (select 1 from allowed_emails a where a.email = lower(coalesce(s.email,''))))
  ) into v from guest_mode g left join classes c on c.id = g.class_id where g.id = 1;
  return v;
end $$;

-- p_minutes > 0 opens p_class for that long (max 12 h); 0 closes guest mode
create or replace function ctf_t_guest_set(p_class uuid, p_minutes int)
returns json language plpgsql security definer set search_path = public as $$
begin
  if not _is_teacher() then return json_build_object('error','not_teacher'); end if;
  if coalesce(p_minutes,0) <= 0 then
    update guest_mode set open_until = null, set_by = coalesce(_email(),''), updated_at = now() where id = 1;
    return json_build_object('ok', true, 'open', false);
  end if;
  if not exists (select 1 from classes where id = p_class) then return json_build_object('error','class_not_found'); end if;
  update guest_mode set class_id = p_class,
    open_until = now() + make_interval(mins => least(p_minutes, 720)),
    set_by = coalesce(_email(),''), updated_at = now()
  where id = 1;
  return ctf_t_guest();
end $$;
