-- ============================================================================
--  CLASS WIPE (v36)  —  teacher.html → Settings → Danger zone → "Delete all class data"
--
--  Empties a class but keeps the class itself (name, code, settings) so the
--  period can be reused. Deletes the class's students (and everything that
--  cascades from them: progress, captures, attempts, duels, rewards …) plus
--  every row in any public table that has a class_id column (roster upload,
--  squads, team sets, quizzes, progress grids, battles, brackets …).
--  New tables with a class_id are picked up automatically.
--
--  The caller must pass the exact phrase 'delete class data'.
--  Run after google-auth.sql; re-run lockdown.sql afterwards.
-- ============================================================================

create or replace function ctf_t_wipe_class(p_class uuid, p_confirm text)
returns json language plpgsql security definer set search_path = public as $fn$
declare r record; n bigint; v_total bigint := 0; v_students bigint := 0;
begin
  if not _is_teacher() then return json_build_object('error','not_teacher'); end if;
  if lower(trim(coalesce(p_confirm,''))) <> 'delete class data' then return json_build_object('error','bad_confirm'); end if;
  if not exists (select 1 from classes where id = p_class) then return json_build_object('error','no_class'); end if;

  for r in
    select c.relname
      from pg_class c
      join pg_namespace ns on ns.oid = c.relnamespace
      join pg_attribute a on a.attrelid = c.oid and a.attname = 'class_id' and not a.attisdropped
     where ns.nspname = 'public' and c.relkind = 'r' and c.relname not in ('classes','students')
     order by c.relname
  loop
    execute format('delete from public.%I where class_id = $1', r.relname) using p_class;
    get diagnostics n = row_count; v_total := v_total + n;
  end loop;

  delete from students where class_id = p_class;
  get diagnostics v_students = row_count;

  return json_build_object('ok', true, 'students', v_students, 'rows', v_total);
exception when others then
  return json_build_object('error', SQLERRM);
end $fn$;

revoke all on function ctf_t_wipe_class(uuid, text) from public, anon;
grant execute on function ctf_t_wipe_class(uuid, text) to authenticated;
