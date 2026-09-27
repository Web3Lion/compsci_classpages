-- ============================================================================
--  SCHEDULED UNLOCKS  (v2.0)  —  open a locked module or flag at a set time.
--
--  The teacher picks a date/time on the Locks & Guide tab. There is no cron:
--  due unlocks are applied the next time ANYONE reads the class gates (a
--  student loading the arena, the teacher dashboard). The arena also re-reads
--  the gates at the moment of the next pending unlock, so an open tab updates
--  on time.
--
--  Run AFTER class-gates.sql, squads.sql and objectives.sql — it redefines
--  ctf_gates / ctf_t_gates / ctf_t_classes as a superset of all three, so it
--  must be the LAST file to define them. Re-run it after any re-run of
--  class-gates.sql, squads.sql, objectives.sql or google-auth.sql.
-- ============================================================================

-- columns the superset functions below read (no-ops when already present)
alter table classes add column if not exists locked_modules int[]  not null default '{}';
alter table classes add column if not exists locked_flags   text[] not null default '{}';
alter table classes add column if not exists persona_on     boolean not null default false;
alter table classes add column if not exists answer_key_on  boolean not null default false;
alter table classes add column if not exists ultimate_flags_on boolean not null default true;
alter table classes add column if not exists squads_on      boolean not null default false;
alter table classes add column if not exists objectives_on  boolean not null default false;

create table if not exists unlock_schedule (
  id         uuid primary key default gen_random_uuid(),
  class_id   uuid not null references classes(id) on delete cascade,
  kind       text not null check (kind in ('module','flag')),
  target     text not null,                -- module number as text, or challenge id
  unlock_at  timestamptz not null,
  created_by text,
  created_at timestamptz not null default now(),
  done_at    timestamptz
);
create index if not exists unlock_schedule_class on unlock_schedule (class_id, unlock_at);
alter table unlock_schedule enable row level security;

create or replace function _apply_unlocks(p_class uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from unlock_schedule where class_id = p_class and done_at is null and unlock_at <= now()) then return; end if;
  update classes c set
    locked_modules = coalesce(array(select m from unnest(c.locked_modules) m
      where m::text not in (select target from unlock_schedule u
        where u.class_id = p_class and u.kind = 'module' and u.done_at is null and u.unlock_at <= now())), '{}'),
    locked_flags = coalesce(array(select f from unnest(c.locked_flags) f
      where f not in (select target from unlock_schedule u
        where u.class_id = p_class and u.kind = 'flag' and u.done_at is null and u.unlock_at <= now())), '{}')
  where c.id = p_class;
  update unlock_schedule set done_at = now() where class_id = p_class and done_at is null and unlock_at <= now();
end $$;
revoke all on function _apply_unlocks(uuid) from public, anon, authenticated;

create or replace function _next_unlock(p_class uuid)
returns timestamptz language sql stable security definer set search_path = public as $$
  select min(unlock_at) from unlock_schedule where class_id = p_class and done_at is null
$$;

-- ---- gates, redefined to apply due unlocks first ------------------------------
-- Same shape as objectives.sql's version (lock lists are safe to hand to the
-- client — see class-gates.sql), plus ultimate/frozen dates and next_unlock.
create or replace function ctf_gates(p_class uuid)
returns json language plpgsql security definer set search_path = public as $$
declare v json;
begin
  perform _apply_unlocks(p_class);
  select json_build_object(
    'locked_modules', coalesce(c.locked_modules,'{}'),
    'locked_flags',   coalesce(c.locked_flags,'{}'),
    'persona_on',     coalesce(c.persona_on,false),
    'answer_key_on',  coalesce(c.answer_key_on,false),
    'squads_on',      coalesce(c.squads_on,false),
    'objectives_on',  coalesce(c.objectives_on,false),
    'ultimate_flags_on', coalesce(c.ultimate_flags_on,true),
    'frozen_dates',   coalesce(c.frozen_dates,'{}'),
    'next_unlock',    _next_unlock(p_class)
  ) into v from classes c where c.id = p_class;
  return coalesce(v, json_build_object(
    'locked_modules','{}','locked_flags','{}',
    'persona_on',false,'answer_key_on',false,'squads_on',false,'objectives_on',false));
end $$;

create or replace function ctf_t_gates(p_class uuid)
returns json language plpgsql security definer set search_path = public as $$
declare v json;
begin
  if not _is_teacher() then return json_build_object('error','not_teacher'); end if;
  perform _apply_unlocks(p_class);
  select json_build_object(
    'locked_modules', coalesce(locked_modules,'{}'),
    'locked_flags',   coalesce(locked_flags,'{}'),
    'persona_on',     persona_on,
    'answer_key_on',  answer_key_on,
    'ultimate_flags_on', ultimate_flags_on,
    'course',         course,
    'name',           name,
    'next_unlock',    _next_unlock(p_class)
  ) into v from classes where id = p_class;
  return coalesce(v, json_build_object('error','no_class'));
end $$;

create or replace function ctf_t_classes()
returns json language plpgsql security definer set search_path = public as $$
declare r record;
begin
  if not _is_teacher() then return json_build_object('error','not_teacher'); end if;
  for r in select distinct class_id from unlock_schedule where done_at is null and unlock_at <= now() loop
    perform _apply_unlocks(r.class_id);
  end loop;
  return coalesce((select json_agg(row_to_json(t) order by t.course, t.name) from (
    select c.id, c.course, c.name, c.code, c.frozen_dates, c.created_at,
           coalesce(c.locked_modules,'{}') as locked_modules,
           coalesce(c.locked_flags,'{}')   as locked_flags,
           c.persona_on, c.answer_key_on, c.ultimate_flags_on,
           coalesce(c.squads_on,false)     as squads_on,
           coalesce(c.objectives_on,false) as objectives_on,
           (select count(*) from students s where s.class_id = c.id) as student_count
    from classes c
  ) t), '[]'::json);
end $$;

-- ---- teacher: schedule / list / cancel ----------------------------------------
-- Scheduling a target that already has a pending unlock replaces it.
create or replace function ctf_t_schedule_unlock(p_class uuid, p_kind text, p_target text, p_at timestamptz)
returns json language plpgsql security definer set search_path = public as $$
declare v_id uuid;
begin
  if not _is_teacher() then return json_build_object('error','not_teacher'); end if;
  if p_kind not in ('module','flag') then return json_build_object('error','bad_kind'); end if;
  if p_at is null then return json_build_object('error','no_time'); end if;
  delete from unlock_schedule where class_id = p_class and kind = p_kind and target = p_target and done_at is null;
  insert into unlock_schedule (class_id, kind, target, unlock_at, created_by)
    values (p_class, p_kind, p_target, p_at, lower(coalesce(_email(),''))) returning id into v_id;
  return json_build_object('ok', true, 'id', v_id);
end $$;

create or replace function ctf_t_unlock_schedule(p_class uuid)
returns json language plpgsql security definer set search_path = public as $$
begin
  if not _is_teacher() then return json_build_object('error','not_teacher'); end if;
  perform _apply_unlocks(p_class);
  return coalesce((select json_agg(row_to_json(t) order by t.unlock_at) from (
    select id, kind, target, unlock_at, done_at from unlock_schedule
    where class_id = p_class and (done_at is null or done_at > now() - interval '7 days')
  ) t), '[]'::json);
end $$;

create or replace function ctf_t_cancel_unlock(p_id uuid)
returns json language plpgsql security definer set search_path = public as $$
begin
  if not _is_teacher() then return json_build_object('error','not_teacher'); end if;
  delete from unlock_schedule where id = p_id and done_at is null;
  return json_build_object('ok', true);
end $$;

do $$
declare f text;
begin
  foreach f in array array[
    'ctf_gates(uuid)', 'ctf_t_gates(uuid)', 'ctf_t_classes()',
    'ctf_t_schedule_unlock(uuid,text,text,timestamptz)', 'ctf_t_unlock_schedule(uuid)', 'ctf_t_cancel_unlock(uuid)'
  ] loop
    execute format('revoke all on function %s from public, anon', f);
    execute format('grant execute on function %s to authenticated', f);
  end loop;
end $$;

notify pgrst, 'reload schema';
