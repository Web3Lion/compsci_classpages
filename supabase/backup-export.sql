-- ============================================================================
--  BACKUP EXPORT (v35)  —  teacher.html → Settings → "Export backup"
--
--  Lets a course OWNER download every public table as CSV (zipped in the
--  browser). Nothing new is stored. Read-only, owner-only, paged 2,000 rows
--  at a time. Run after teachers.sql; re-run lockdown.sql afterwards.
-- ============================================================================

-- every public table and its row count
create or replace function ctf_t_backup_tables() returns json
language plpgsql stable security definer set search_path = public as $fn$
declare r record; v_out json; v_list jsonb := '[]'::jsonb; v_n bigint;
begin
  if not _is_owner() then return json_build_object('error','not_owner'); end if;
  for r in select c.relname from pg_class c join pg_namespace n on n.oid = c.relnamespace
            where n.nspname = 'public' and c.relkind = 'r' order by c.relname loop
    execute format('select count(*) from public.%I', r.relname) into v_n;
    v_list := v_list || jsonb_build_object('t', r.relname, 'n', v_n);
  end loop;
  v_out := json_build_object('tables', v_list, 'at', now());
  return v_out;
end $fn$;

-- one page of one table as a JSON array of row objects
create or replace function ctf_t_backup_table(p_table text, p_offset int default 0) returns json
language plpgsql stable security definer set search_path = public as $fn$
declare v_rows json;
begin
  if not _is_owner() then return json_build_object('error','not_owner'); end if;
  if not exists (select 1 from pg_class c join pg_namespace n on n.oid = c.relnamespace
                  where n.nspname = 'public' and c.relkind = 'r' and c.relname = p_table) then
    return json_build_object('error','no_table');
  end if;
  execute format('select coalesce(json_agg(x), ''[]''::json) from (select * from public.%I order by 1 offset %s limit 2000) x',
                 p_table, greatest(coalesce(p_offset,0),0)) into v_rows;
  return json_build_object('rows', v_rows);
end $fn$;

revoke all on function ctf_t_backup_tables() from public, anon;
revoke all on function ctf_t_backup_table(text,int) from public, anon;
grant execute on function ctf_t_backup_tables() to authenticated;
grant execute on function ctf_t_backup_table(text,int) to authenticated;
