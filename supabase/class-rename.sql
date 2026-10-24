-- © 2026 Robert Reasey, South Fayette School District. Licensed CC BY-NC 4.0 (attribution required, no commercial use). See LICENSE.md.
-- class-rename.sql (v25.0) — lets a teacher rename a class they own from teacher.html.
-- Run after google-auth.sql. Safe to re-run.
create or replace function ctf_t_rename_class(p_class uuid, p_name text)
returns json language plpgsql security definer set search_path = public as $$
declare v_name text := left(trim(coalesce(p_name,'')), 80);
begin
  if not _is_teacher() then return json_build_object('error','not_teacher'); end if;
  if v_name = '' then return json_build_object('error','empty_name'); end if;
  update classes set name = v_name where id = p_class and lower(owner_email) = lower(_email());
  if not found then return json_build_object('error','not_owner'); end if;
  return json_build_object('ok', true, 'name', v_name);
end $$;
grant execute on function ctf_t_rename_class(uuid, text) to authenticated;
