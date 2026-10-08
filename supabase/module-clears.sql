-- ============================================================================
--  MODULE CLEARS  (v6.0)  —  rewards for clearing a whole module AND its boss.
--
--  The CTF page calls ctf_module_clear() once per module, the moment the last
--  flag and the BEAT NEMESIS boss are both done. The first call records the
--  clear and its class rank (1 = first in class, the Vanguard), then drops two
--  packs into the student's items:
--    Module NN Clear Crate   in-game items (the class crate, or the default)
--    Module NN Coin Pack     coins, paid when the student opens it
--  Later calls return the stored clear and send nothing.
--
--  SERVER CHECK (6.0.2): the clear is only accepted when the server's own logs
--  agree. Every flag key in module_manifest for that course + module must have
--  a capture row in flag_events for the student, and — when the guide is on for
--  the class — a boss_wins row must exist for that module. The manifest is
--  written by the teacher dashboard (ctf_t_sync_manifest) every time it loads,
--  straight from ctf-data/<course>.js, so it follows content edits. Until a
--  teacher has opened the dashboard once, clears wait ('no_manifest') and the
--  CTF page retries on the student's next visit.
--
--  Teachers can set the crate contents + coin amount per class from the Send
--  Rewards tab (ctf_t_set_crate). The same contents are used for every module.
--
--  Run AFTER reward-items.sql (6.0 version, with packs) and coins-cosmetics.sql.
--  Safe to re-run.
-- ============================================================================

create table if not exists module_clears (
  student_id uuid not null references students(id) on delete cascade,
  class_id   uuid not null references classes(id) on delete cascade,
  module     int  not null,
  rank       int  not null,
  cleared_at timestamptz not null default now(),
  primary key (student_id, module)
);
create index if not exists module_clears_class on module_clears (class_id, module, cleared_at);
alter table module_clears enable row level security;

create table if not exists module_manifest (
  course     text not null,
  module     int  not null,
  flag_keys  text[] not null,
  updated_at timestamptz not null default now(),
  primary key (course, module)
);
alter table module_manifest enable row level security;

create table if not exists boss_wins (
  student_id uuid not null references students(id) on delete cascade,
  module     int  not null,
  won_at     timestamptz not null default now(),
  primary key (student_id, module)
);
alter table boss_wins enable row level security;

create table if not exists class_crates (
  class_id   uuid primary key references classes(id) on delete cascade,
  contents   jsonb not null,
  coins      int   not null default 100,
  updated_by text,
  updated_at timestamptz not null default now()
);
alter table class_crates enable row level security;
-- no policies: the security-definer functions below are the only way in

create or replace function _default_crate()
returns jsonb language sql immutable as $$
  select '[{"k":"hint2","n":1},{"k":"mystery","n":1},{"k":"lucky","n":1},{"k":"shield","n":1},{"k":"shard","n":1}]'::jsonb
$$;

-- ---- teacher dashboard: publish the flag list for every module of a course -----
-- p_manifest: {"1":["ap-m1a#0","ap-m1a#1",...], "2":[...]}  (vault flags excluded)
create or replace function ctf_t_sync_manifest(p_course text, p_manifest jsonb)
returns json language plpgsql security definer set search_path = public as $$
declare k text; v_n int := 0;
begin
  if not _is_teacher() then return json_build_object('error','not_teacher'); end if;
  if p_course is null or jsonb_typeof(p_manifest) <> 'object' then return json_build_object('error','bad_manifest'); end if;
  for k in select jsonb_object_keys(p_manifest) loop
    if k !~ '^\d{1,2}$' or jsonb_typeof(p_manifest->k) <> 'array' then continue; end if;
    insert into module_manifest (course, module, flag_keys, updated_at)
      values (left(p_course,20), k::int,
              (select coalesce(array_agg(left(x,80)), '{}') from jsonb_array_elements_text(p_manifest->k) x), now())
      on conflict (course, module) do update set flag_keys = excluded.flag_keys, updated_at = now();
    v_n := v_n + 1;
  end loop;
  delete from module_manifest where course = p_course and not (p_manifest ? module::text);
  return json_build_object('ok', true, 'modules', v_n);
end $$;
revoke all on function ctf_t_sync_manifest(text, jsonb) from public, anon;
grant execute on function ctf_t_sync_manifest(text, jsonb) to authenticated;

-- ---- student: record a boss win (BEAT NEMESIS / the guide's gauntlet) ----------
create or replace function ctf_boss_win(p_student uuid, p_module int)
returns json language plpgsql security definer set search_path = public as $$
begin
  if not _owns_student(p_student) then return json_build_object('error','not_yours'); end if;
  if p_module is null or p_module < 0 or p_module > 99 then return json_build_object('error','bad_module'); end if;
  insert into boss_wins (student_id, module) values (p_student, p_module) on conflict do nothing;
  return json_build_object('ok', true);
end $$;
revoke all on function ctf_boss_win(uuid, int) from public, anon;
grant execute on function ctf_boss_win(uuid, int) to authenticated;

-- ---- student: report a module clear ------------------------------------------
create or replace function ctf_module_clear(p_student uuid, p_module int)
returns json language plpgsql security definer set search_path = public as $$
declare v_class uuid; v_rank int; v_old module_clears; v_c jsonb; v_coins int; v_tag text;
        v_crate reward_items; v_cp reward_items; v_course text; v_keys text[]; v_missing text[]; v_persona boolean;
begin
  if not _owns_student(p_student) then return json_build_object('error','not_yours'); end if;
  if p_module is null or p_module < 0 or p_module > 99 then return json_build_object('error','bad_module'); end if;
  select * into v_old from module_clears where student_id = p_student and module = p_module;
  if found then return json_build_object('ok', true, 'already', true, 'rank', v_old.rank, 'cleared_at', v_old.cleared_at); end if;

  select class_id into v_class from students where id = p_student for update;
  select c.course, coalesce((to_jsonb(c)->>'persona_on')::boolean, false) into v_course, v_persona
    from classes c where c.id = v_class;

  -- the server check: its own capture log + boss log must show the clear
  select flag_keys into v_keys from module_manifest where course = v_course and module = p_module;
  if v_keys is null or cardinality(v_keys) = 0 then return json_build_object('error','no_manifest'); end if;
  select coalesce(array_agg(k), '{}') into v_missing
    from unnest(v_keys) k
    where not exists (select 1 from flag_events f where f.student_id = p_student and f.flag_key = k);
  if cardinality(v_missing) > 0 then
    return json_build_object('error','not_cleared', 'missing', to_json(v_missing[1:40]), 'missing_count', cardinality(v_missing));
  end if;
  if v_persona and not exists (select 1 from boss_wins where student_id = p_student and module = p_module) then
    return json_build_object('error','no_boss');
  end if;

  select count(*) + 1 into v_rank from module_clears where class_id = v_class and module = p_module;
  insert into module_clears (student_id, class_id, module, rank) values (p_student, v_class, p_module, v_rank);

  select contents, coins into v_c, v_coins from class_crates where class_id = v_class;
  v_c := _pack_clean(coalesce(v_c, _default_crate()));
  v_coins := greatest(0, least(500, coalesce(v_coins, 100)));
  v_tag := 'Module ' || lpad(p_module::text, 2, '0');

  if jsonb_array_length(v_c) > 0 then
    insert into reward_items (class_id, student_id, kind, label, note, source, contents)
      values (v_class, p_student, 'pack', v_tag || ' Clear Crate', 'You cleared ' || v_tag || ' and beat the boss.', 'clear', v_c)
      returning * into v_crate;
  end if;
  if v_coins > 0 then
    insert into reward_items (class_id, student_id, kind, label, note, source, contents)
      values (v_class, p_student, 'pack', v_tag || ' Coin Pack', v_coins || ' coins for clearing ' || v_tag || '.', 'clear',
              jsonb_build_array(jsonb_build_object('k','coins','n',v_coins)))
      returning * into v_cp;
  end if;

  return json_build_object('ok', true, 'rank', v_rank, 'cleared_at', now(),
    'items', (select coalesce(json_agg(x), '[]'::json) from (
       select row_to_json(v_crate) x where v_crate.id is not null
       union all select row_to_json(v_cp) where v_cp.id is not null) t));
end $$;
revoke all on function ctf_module_clear(uuid, int) from public, anon;
grant execute on function ctf_module_clear(uuid, int) to authenticated;

-- ---- student: my clears (trophy wall) -----------------------------------------
create or replace function ctf_my_clears(p_student uuid)
returns json language plpgsql security definer set search_path = public as $$
begin
  if not _owns_student(p_student) then return json_build_object('error','not_yours'); end if;
  return coalesce((select json_agg(json_build_object('module', module, 'rank', rank, 'cleared_at', cleared_at) order by module)
    from module_clears where student_id = p_student), '[]'::json);
end $$;
revoke all on function ctf_my_clears(uuid) from public, anon;
grant execute on function ctf_my_clears(uuid) to authenticated;

-- ---- teacher: who cleared what (Mentors) ---------------------------------------
create or replace function ctf_t_module_clears(p_class uuid)
returns json language plpgsql security definer set search_path = public as $$
begin
  if not _is_teacher() then return json_build_object('error','not_teacher'); end if;
  return coalesce((select json_agg(row_to_json(t)) from (
    select m.student_id, s.handle, m.module, m.rank, m.cleared_at
    from module_clears m join students s on s.id = m.student_id
    where m.class_id = p_class order by m.module, m.cleared_at) t), '[]'::json);
end $$;
revoke all on function ctf_t_module_clears(uuid) from public, anon;
grant execute on function ctf_t_module_clears(uuid) to authenticated;

-- ---- teacher: read / set the class crate -----------------------------------------
create or replace function ctf_t_crate(p_class uuid)
returns json language plpgsql security definer set search_path = public as $$
declare v class_crates;
begin
  if not _is_teacher() then return json_build_object('error','not_teacher'); end if;
  select * into v from class_crates where class_id = p_class;
  return json_build_object('contents', coalesce(v.contents, _default_crate()), 'coins', coalesce(v.coins, 100),
                           'custom', v.class_id is not null, 'updated_at', v.updated_at);
end $$;
revoke all on function ctf_t_crate(uuid) from public, anon;
grant execute on function ctf_t_crate(uuid) to authenticated;

create or replace function ctf_t_set_crate(p_class uuid, p_contents jsonb, p_coins int)
returns json language plpgsql security definer set search_path = public as $$
declare v_c jsonb := _pack_clean(p_contents);
begin
  if not _is_teacher() then return json_build_object('error','not_teacher'); end if;
  insert into class_crates (class_id, contents, coins, updated_by, updated_at)
    values (p_class, v_c, greatest(0, least(500, coalesce(p_coins,100))), lower(coalesce(_email(),'')), now())
    on conflict (class_id) do update set contents = excluded.contents, coins = excluded.coins,
      updated_by = excluded.updated_by, updated_at = now();
  return json_build_object('ok', true, 'contents', v_c);
end $$;
revoke all on function ctf_t_set_crate(uuid, jsonb, int) from public, anon;
grant execute on function ctf_t_set_crate(uuid, jsonb, int) to authenticated;

notify pgrst, 'reload schema';
