-- ============================================================================
--  CLASS GROUPS  —  run AFTER the other supabase/*.sql files.
--
--  Teacher-only groupings inside a class (lab partners, tables, reading groups,
--  intervention tiers). Students never see them: no student-facing RPC returns
--  a group, and the group tables are sealed by RLS like everything else.
--
--  A student belongs to at most one group per class. Deleting a group leaves
--  its students in the class, ungrouped.
-- ============================================================================

create table if not exists class_groups (
  id         uuid primary key default gen_random_uuid(),
  class_id   uuid not null references classes(id) on delete cascade,
  name       text not null,
  color      text,                         -- optional swatch for the roster
  sort       int  not null default 0,
  created_at timestamptz not null default now()
);
alter table class_groups enable row level security;   -- no policies: sealed
create index if not exists class_groups_class_idx on class_groups (class_id);
create unique index if not exists class_groups_class_name_uniq
  on class_groups (class_id, lower(name));

alter table students add column if not exists group_id uuid references class_groups(id) on delete set null;
create index if not exists students_group_idx on students (group_id);

-- ---- teacher: list ----------------------------------------------------------
create or replace function ctf_t_groups(p_class uuid)
returns json language plpgsql security definer set search_path = public as $$
begin
  if not _is_teacher() then return json_build_object('error','not_teacher'); end if;
  return coalesce((select json_agg(row_to_json(t) order by t.sort, t.name) from (
    select g.id, g.name, g.color, g.sort,
           (select count(*) from students s where s.group_id = g.id) as student_count,
           (select coalesce(round(avg(coalesce(p.points,0)+coalesce(p.bonus,0))),0)
              from students s left join progress p on p.student_id = s.id
             where s.group_id = g.id) as avg_xp
    from class_groups g where g.class_id = p_class
  ) t), '[]'::json);
end $$;

-- ---- teacher: create / rename / recolor -------------------------------------
create or replace function ctf_t_group_save(p_class uuid, p_id uuid, p_name text, p_color text)
returns json language plpgsql security definer set search_path = public as $$
declare v class_groups; v_name text := trim(coalesce(p_name,''));
begin
  if not _is_teacher() then return json_build_object('error','not_teacher'); end if;
  if length(v_name) < 1 or length(v_name) > 40 then return json_build_object('error','bad_name'); end if;
  if exists (select 1 from class_groups where class_id = p_class
               and lower(name) = lower(v_name) and (p_id is null or id <> p_id)) then
    return json_build_object('error','name_taken');
  end if;

  if p_id is null then
    insert into class_groups (class_id, name, color, sort)
      values (p_class, v_name, p_color,
              coalesce((select max(sort)+1 from class_groups where class_id = p_class), 0))
      returning * into v;
  else
    update class_groups set name = v_name, color = coalesce(p_color, color)
      where id = p_id and class_id = p_class returning * into v;
    if not found then return json_build_object('error','no_group'); end if;
  end if;
  return json_build_object('ok', true, 'id', v.id, 'name', v.name, 'color', v.color);
end $$;

create or replace function ctf_t_group_delete(p_id uuid)
returns json language plpgsql security definer set search_path = public as $$
begin
  if not _is_teacher() then return json_build_object('error','not_teacher'); end if;
  delete from class_groups where id = p_id;      -- students fall back to ungrouped
  return json_build_object('ok', true);
end $$;

-- ---- teacher: assign students (null group = remove from any group) ---------
create or replace function ctf_t_group_assign(p_students uuid[], p_group uuid)
returns json language plpgsql security definer set search_path = public as $$
declare n int;
begin
  if not _is_teacher() then return json_build_object('error','not_teacher'); end if;
  update students set group_id = p_group
   where id = any(coalesce(p_students,'{}'::uuid[]));
  get diagnostics n = row_count;
  return json_build_object('ok', true, 'moved', n);
end $$;

-- ---- roster carries the group so the teacher UI can label and filter -------
create or replace function ctf_t_roster(p_class uuid)
returns json language plpgsql security definer set search_path = public as $$
begin
  if not _is_teacher() then return json_build_object('error','not_teacher'); end if;
  return coalesce((select json_agg(row_to_json(t) order by t.points desc) from (
    select s.id, s.handle, s.email, s.created_at, s.last_seen,
           s.group_id, g.name as group_name, g.color as group_color,
           coalesce(p.points,0) as points, coalesce(p.bonus,0) as bonus,
           coalesce(p.solved_count,0) as solved_count, coalesce(p.total_count,0) as total_count,
           coalesce(p.streak,'{}'::jsonb) as streak, coalesce(p.badges,'{}'::jsonb) as badges,
           p.updated_at,
           (select count(*) from cheat_events ce where ce.student_id = s.id) as cheat_count
    from students s
    left join progress p on p.student_id = s.id
    left join class_groups g on g.id = s.group_id
    where s.class_id = p_class
  ) t), '[]'::json);
end $$;

do $$
declare f text;
begin
  foreach f in array array[
    'ctf_t_groups(uuid)',
    'ctf_t_group_save(uuid,uuid,text,text)',
    'ctf_t_group_delete(uuid)',
    'ctf_t_group_assign(uuid[],uuid)',
    'ctf_t_roster(uuid)'
  ] loop
    execute format('revoke all on function %s from public, anon', f);
    execute format('grant execute on function %s to authenticated', f);
  end loop;
end $$;

notify pgrst, 'reload schema';
