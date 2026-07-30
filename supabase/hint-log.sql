-- ============================================================================
--  HINT LOG  —  did a capture use its paid hint reveal.
--
--  ctf.js has always priced hints (HINT_COST, 10% of that flag's value) but
--  never told the backend when one was used — a teacher could see a capture's
--  points but not whether they were discounted for a hint. This adds one
--  column, threaded through the existing flag-capture RPC, so the Flag
--  Analytics tab can show a hint-purchase rate per flag.
--
--  Run AFTER google-auth.sql. Safe to re-run.
-- ============================================================================

alter table flag_events add column if not exists hint_used boolean not null default false;

create or replace function ctf_flag_google(
  p_student uuid, p_key text, p_challenge text, p_title text, p_level text,
  p_points int, p_secs int, p_retries int, p_tainted boolean, p_hint_used boolean default false
) returns json language plpgsql security definer set search_path = public as $$
declare v_student students; v_class classes;
begin
  select * into v_student from students where id = p_student and auth_user_id = auth.uid();
  if not found then return json_build_object('error','not_yours'); end if;
  select * into v_class from classes where id = v_student.class_id;

  insert into flag_events (student_id, class_id, course, handle, flag_key, challenge_id,
                           title, level, points, secs, retries, tainted, hint_used)
    values (v_student.id, v_student.class_id, v_class.course, v_student.handle,
            left(coalesce(p_key,''),80), left(coalesce(p_challenge,''),80),
            left(coalesce(p_title,''),200), left(coalesce(p_level,''),16),
            coalesce(p_points,0), coalesce(p_secs,-1), coalesce(p_retries,0), coalesce(p_tainted,false),
            coalesce(p_hint_used,false))
  on conflict (student_id, flag_key) do nothing;
  return json_build_object('ok', true);
end $$;

create or replace function ctf_t_flags(p_class uuid, p_limit int default 500)
returns json language plpgsql security definer set search_path = public as $$
begin
  if not _is_teacher() then return json_build_object('error','not_teacher'); end if;
  return coalesce((select json_agg(row_to_json(t)) from (
    select handle, challenge_id, title, level, points, secs, retries, tainted, hint_used, created_at
    from flag_events where class_id = p_class
    order by created_at desc limit greatest(1, least(p_limit, 2000))
  ) t), '[]'::json);
end $$;

do $$
declare f text;
begin
  foreach f in array array[
    'ctf_flag_google(uuid,text,text,text,text,int,int,int,boolean,boolean)',
    'ctf_t_flags(uuid,int)'
  ] loop
    execute format('revoke all on function %s from public, anon', f);
    execute format('grant execute on function %s to authenticated', f);
  end loop;
end $$;

-- the 9-arg version is superseded by the 10-arg one above
drop function if exists ctf_flag_google(uuid,text,text,text,text,int,int,int,boolean);

notify pgrst, 'reload schema';
