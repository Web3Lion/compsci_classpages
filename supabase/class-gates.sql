-- ============================================================================
--  CLASS GATES  —  run AFTER schema.sql, google-auth.sql, teacher-reports.sql.
--
--  Adds per-class teacher controls:
--    locked_modules  int[]     modules students cannot open yet
--    locked_flags    text[]    individual challenge ids that stay locked
--    persona_on      boolean   is the course guide awake? (default FALSE, so a
--                              course starts clean and the character ARRIVES
--                              when the teacher flips the switch)
--    answer_key_on   boolean   arms the teacher answer-key page
--
--  Locked flags are not hidden from students: the arena shows the title and an
--  enciphered prompt. Cracking it early is a legitimate head start, so the
--  lock list is safe to hand to the client.
-- ============================================================================

alter table classes add column if not exists locked_modules int[]  not null default '{}';
alter table classes add column if not exists locked_flags   text[] not null default '{}';
alter table classes add column if not exists persona_on     boolean not null default false;
alter table classes add column if not exists answer_key_on  boolean not null default false;
alter table classes add column if not exists ultimate_flags_on boolean not null default true;

-- ---- students read their own class's gates ----------------------------------
create or replace function ctf_gates(p_class uuid)
returns json language plpgsql security definer set search_path = public as $$
declare v json;
begin
  if not exists (select 1 from students where class_id = p_class and auth_user_id = auth.uid())
    then return json_build_object('error','not_yours'); end if;
  select json_build_object(
    'locked_modules', coalesce(locked_modules,'{}'),
    'locked_flags',   coalesce(locked_flags,'{}'),
    'persona_on',     persona_on,
    'ultimate_flags_on', ultimate_flags_on,
    'frozen_dates',   coalesce(frozen_dates,'{}')
  ) into v from classes where id = p_class;
  return coalesce(v, json_build_object('error','no_class'));
end $$;

-- ---- teacher writes them ----------------------------------------------------
create or replace function ctf_t_set_gates(
  p_class uuid, p_locked_modules int[], p_locked_flags text[],
  p_persona boolean, p_answer_key boolean, p_ultimate_flags boolean default null
) returns json language plpgsql security definer set search_path = public as $$
begin
  if not _is_teacher() then return json_build_object('error','not_teacher'); end if;
  update classes set
    locked_modules   = coalesce(p_locked_modules,'{}'),
    locked_flags     = coalesce(p_locked_flags,'{}'),
    persona_on       = coalesce(p_persona, persona_on),
    answer_key_on    = coalesce(p_answer_key, answer_key_on),
    ultimate_flags_on = coalesce(p_ultimate_flags, ultimate_flags_on)
  where id = p_class;
  return json_build_object('ok', true);
end $$;

-- ---- teacher reads them (answer key + gates tab) ---------------------------
create or replace function ctf_t_gates(p_class uuid)
returns json language plpgsql security definer set search_path = public as $$
declare v json;
begin
  if not _is_teacher() then return json_build_object('error','not_teacher'); end if;
  select json_build_object(
    'locked_modules', coalesce(locked_modules,'{}'),
    'locked_flags',   coalesce(locked_flags,'{}'),
    'persona_on',     persona_on,
    'answer_key_on',  answer_key_on,
    'ultimate_flags_on', ultimate_flags_on,
    'course',         course,
    'name',           name
  ) into v from classes where id = p_class;
  return coalesce(v, json_build_object('error','no_class'));
end $$;

-- include the gates anywhere the client already fetches class rows
create or replace function ctf_t_classes()
returns json language plpgsql security definer set search_path = public as $$
begin
  if not _is_teacher() then return json_build_object('error','not_teacher'); end if;
  return coalesce((select json_agg(row_to_json(t) order by t.course, t.name) from (
    select c.id, c.course, c.name, c.code, c.frozen_dates, c.created_at,
           coalesce(c.locked_modules,'{}') as locked_modules,
           coalesce(c.locked_flags,'{}')   as locked_flags,
           c.persona_on, c.answer_key_on, c.ultimate_flags_on,
           (select count(*) from students s where s.class_id = c.id) as student_count
    from classes c
  ) t), '[]'::json);
end $$;

do $$
declare f text;
begin
  foreach f in array array[
    'ctf_gates(uuid)',
    'ctf_t_set_gates(uuid,int[],text[],boolean,boolean,boolean)',
    'ctf_t_gates(uuid)'
  ] loop
    execute format('revoke all on function %s from public, anon', f);
    execute format('grant execute on function %s to authenticated', f);
  end loop;
end $$;

notify pgrst, 'reload schema';
