-- ============================================================================
--  ALLOWED EXTERNAL EMAILS  —  grant sign-in to specific addresses outside the
--  two school Google Workspace domains, without opening a whole new domain.
--
--  Google Cloud OAuth consent screen must ALSO be set to "External" user type
--  (with the person added as a Test user if the app is still in Testing) —
--  with "Internal" selected there, Google itself refuses non-Workspace
--  accounts before this table is ever checked.
--
--  Run AFTER multi-domain.sql, ALWAYS. multi-domain.sql redefines _is_school()
--  from scratch; if you re-run it after this file, the external allowlist is
--  silently dropped and every added external email is rejected again.
--
--  Safe to re-run.
-- ============================================================================

create table if not exists allowed_emails (
  email      text primary key,
  note       text not null default '',
  added_by   text not null default '',
  created_at timestamptz not null default now()
);
alter table allowed_emails enable row level security;

-- ---- the permission check, now domain-list OR explicit-email ---------------
create or replace function _is_school() returns boolean
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

-- ---- list (any teacher can view; only an owner can add/remove below) -------
create or replace function ctf_t_allowed_emails()
returns json language plpgsql security definer set search_path = public as $$
begin
  if not _is_teacher() then return json_build_object('error','not_teacher'); end if;
  return coalesce((select json_agg(row_to_json(t) order by lower(t.email))
    from (select email, note, added_by, created_at from allowed_emails) t), '[]'::json);
end $$;

create or replace function ctf_t_allowed_email_save(p_email text, p_note text default '')
returns json language plpgsql security definer set search_path = public as $$
declare v_email text := lower(trim(coalesce(p_email,'')));
begin
  if not _is_owner() then return json_build_object('error','not_owner'); end if;
  if v_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then return json_build_object('error','bad_email'); end if;
  insert into allowed_emails (email, note, added_by)
    values (v_email, left(trim(coalesce(p_note,'')),160), lower(coalesce(_email(),'')))
  on conflict (email) do update
    set note = case when excluded.note <> '' then excluded.note else allowed_emails.note end;
  return json_build_object('ok', true, 'email', v_email);
end $$;

create or replace function ctf_t_allowed_email_remove(p_email text)
returns json language plpgsql security definer set search_path = public as $$
begin
  if not _is_owner() then return json_build_object('error','not_owner'); end if;
  delete from allowed_emails where email = lower(trim(coalesce(p_email,'')));
  return json_build_object('ok', true);
end $$;

do $$
declare f text;
begin
  foreach f in array array[
    'ctf_t_allowed_emails()',
    'ctf_t_allowed_email_save(text,text)',
    'ctf_t_allowed_email_remove(text)'
  ] loop
    execute format('revoke all on function %s from public, anon', f);
    execute format('grant execute on function %s to authenticated', f);
  end loop;
end $$;

notify pgrst, 'reload schema';
