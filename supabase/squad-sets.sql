-- © 2026 Robert Reasey, South Fayette School District. Licensed CC BY-NC 4.0 (attribution required, no commercial use). See LICENSE.md.
-- ============================================================================
--  SAVED TEAM SETS (v26.0) — the teacher saves the class's current squads under
--  a name ("Rows A/B", "Lab partners") and loads them back later, e.g. after a
--  Randomize. Loading recreates any missing squad by name and puts every
--  student back; students who joined after the save end up with no squad.
--  Run after class-groups.sql + squads.sql. Safe to re-run.
-- ============================================================================
create table if not exists squad_sets (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references classes(id) on delete cascade,
  name text not null,
  teams jsonb not null default '[]'::jsonb,   -- [{name, color, students:[uuid]}]
  created_at timestamptz not null default now()
);
create unique index if not exists squad_sets_name on squad_sets (class_id, lower(name));
alter table squad_sets enable row level security;

create or replace function ctf_t_squadset_list(p_class uuid)
returns json language plpgsql security definer set search_path = public as $$
begin
  if not _is_teacher() then return json_build_object('error','not_teacher'); end if;
  return (select coalesce(json_agg(json_build_object('id', s.id, 'name', s.name, 'created_at', s.created_at,
            'teams', (select coalesce(json_agg(json_build_object('name', t->>'name', 'color', t->>'color', 'n', jsonb_array_length(coalesce(t->'students','[]'::jsonb)))), '[]'::json)
                        from jsonb_array_elements(s.teams) t)) order by s.created_at desc), '[]'::json)
            from squad_sets s where s.class_id = p_class);
end $$;

create or replace function ctf_t_squadset_save(p_class uuid, p_name text)
returns json language plpgsql security definer set search_path = public as $$
declare v_name text := left(trim(coalesce(p_name,'')), 60); v_teams jsonb;
begin
  if not _is_teacher() then return json_build_object('error','not_teacher'); end if;
  if v_name = '' then return json_build_object('error','empty_name'); end if;
  select coalesce(jsonb_agg(jsonb_build_object('name', g.name, 'color', g.color,
           'students', (select coalesce(jsonb_agg(s.id), '[]'::jsonb) from students s where s.group_id = g.id)) order by g.sort, g.name), '[]'::jsonb)
    into v_teams from class_groups g where g.class_id = p_class;
  if jsonb_array_length(v_teams) = 0 then return json_build_object('error','no_teams'); end if;
  insert into squad_sets (class_id, name, teams) values (p_class, v_name, v_teams)
    on conflict (class_id, lower(name)) do update set teams = excluded.teams, created_at = now();
  return json_build_object('ok', true);
end $$;

create or replace function ctf_t_squadset_load(p_set uuid)
returns json language plpgsql security definer set search_path = public as $$
declare st squad_sets; t jsonb; i int := 0; v_gid uuid; v_live boolean := false; n int := 0;
begin
  if not _is_teacher() then return json_build_object('error','not_teacher'); end if;
  select * into st from squad_sets where id = p_set;
  if st.id is null then return json_build_object('error','no_set'); end if;
  if to_regclass('public.team_battles') is not null then
    execute 'select exists (select 1 from team_battles where class_id = $1 and status = ''live'')' into v_live using st.class_id;
  end if;
  if not v_live and to_regclass('public.vd_sessions') is not null then
    execute 'select exists (select 1 from vd_sessions where class_id = $1 and kind = ''class'' and status = ''live'' and ends_at > now())' into v_live using st.class_id;
  end if;
  if v_live then return json_build_object('error','battle_live'); end if;
  update students set group_id = null where class_id = st.class_id and group_id is not null;
  for t in select * from jsonb_array_elements(st.teams) loop
    i := i + 1;
    select id into v_gid from class_groups where class_id = st.class_id and lower(name) = lower(t->>'name') limit 1;
    if v_gid is null then
      insert into class_groups (class_id, name, color, sort) values (st.class_id, t->>'name', coalesce(t->>'color', '#3a86ff'), i) returning id into v_gid;
    end if;
    update students set group_id = v_gid
     where class_id = st.class_id and id in (select (x #>> '{}')::uuid from jsonb_array_elements(coalesce(t->'students','[]'::jsonb)) x);
    get diagnostics n = row_count;
  end loop;
  return json_build_object('ok', true);
end $$;

create or replace function ctf_t_squadset_delete(p_set uuid)
returns json language plpgsql security definer set search_path = public as $$
begin
  if not _is_teacher() then return json_build_object('error','not_teacher'); end if;
  delete from squad_sets where id = p_set;
  return json_build_object('ok', true);
end $$;

do $$
declare f text;
begin
  foreach f in array array['ctf_t_squadset_list(uuid)', 'ctf_t_squadset_save(uuid,text)', 'ctf_t_squadset_load(uuid)', 'ctf_t_squadset_delete(uuid)'] loop
    execute format('revoke all on function %s from public, anon', f);
    execute format('grant execute on function %s to authenticated', f);
  end loop;
end $$;
notify pgrst, 'reload schema';
