-- © 2026 Robert Reasey, South Fayette School District. Licensed CC BY-NC 4.0 (attribution required, no commercial use). See LICENSE.md.
-- ============================================================================
--  CLASS DUEL WAITING ROOM (v29.0)
--  The teacher opens a waiting room for a Team Battle, Vocab Battle, Boss
--  Raid or (32.1) Duel Bracket. Students open lobby.html from their course home:
--  they see their squad, who else is here, and a 5-second countdown (32.1; was 10)
--  when the teacher presses Start.
--  When the battle goes live, every student in the room is sent into it.
--  Latecomers still get the "Your team needs you" announcements.
--  Run after squads.sql. Works with team-battles.sql / vocab-duels.sql /
--  raids.sql when those are installed (checked at run time). Safe to re-run.
-- ============================================================================

create table if not exists class_lobbies (
  class_id   uuid primary key references classes(id) on delete cascade,
  kind       text not null check (kind in ('team','vocab','raid','bracket')),
  status     text not null default 'open' check (status in ('open','counting','started','closed')),
  start_at   timestamptz,
  opened_at  timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table class_lobbies enable row level security;
alter table class_lobbies drop constraint if exists class_lobbies_kind_check;
alter table class_lobbies add constraint class_lobbies_kind_check check (kind in ('team','vocab','raid','bracket'));

create table if not exists lobby_presence (
  class_id   uuid not null references classes(id) on delete cascade,
  student_id uuid not null references students(id) on delete cascade,
  last_seen  timestamptz not null default now(),
  primary key (class_id, student_id)
);
alter table lobby_presence enable row level security;

-- which class battle is live right now (tables are optional)
create or replace function _lobby_live(p_class uuid) returns text
language plpgsql stable security definer set search_path = public as $$
declare v boolean;
begin
  if to_regclass('public.team_battles') is not null then
    execute 'select exists (select 1 from team_battles where class_id = $1 and status = ''live'')' into v using p_class;
    if v then return 'team'; end if;
  end if;
  if to_regclass('public.vd_sessions') is not null then
    execute 'select exists (select 1 from vd_sessions where class_id = $1 and kind = ''class'' and status = ''live'' and ends_at > now())' into v using p_class;
    if v then return 'vocab'; end if;
  end if;
  if to_regclass('public.raids') is not null then
    execute 'select exists (select 1 from raids where class_id = $1 and status = ''live'')' into v using p_class;
    if v then return 'raid'; end if;
  end if;
  if to_regclass('public.brackets') is not null then
    execute 'select exists (select 1 from brackets where class_id = $1 and status = ''live'')' into v using p_class;
    if v then return 'bracket'; end if;
  end if;
  return null;
end $$;

-- open / counting rooms go stale after 90 minutes; started rooms close 3 minutes after the battle ends
create or replace function _lobby_get(p_class uuid) returns class_lobbies
language plpgsql security definer set search_path = public as $$
declare l class_lobbies;
begin
  select * into l from class_lobbies where class_id = p_class;
  if l.class_id is null then return l; end if;
  if (l.status in ('open','counting') and l.opened_at < now() - interval '90 minutes')
     or (l.status = 'started' and l.updated_at < now() - interval '3 minutes' and _lobby_live(p_class) is null) then
    update class_lobbies set status = 'closed', updated_at = now() where class_id = p_class returning * into l;
  end if;
  return l;
end $$;

-- 32.1: students with no squad (brackets let them play); teacher mirror rows are left out
create or replace function _lobby_loose(p_class uuid, p_me uuid) returns json
language plpgsql stable security definer set search_path = public as $$
declare j json; tf boolean := to_regprocedure('_vd_is_teacher_row(text)') is not null;
begin
  execute 'select coalesce(json_agg(json_build_object(''id'', s.id, ''handle'', s.handle, ''me'', s.id = $2,
      ''here'', exists (select 1 from lobby_presence lp where lp.class_id = $1 and lp.student_id = s.id and lp.last_seen > now() - interval ''15 seconds''))
      order by s.handle), ''[]''::json)
    from students s where s.class_id = $1 and s.group_id is null' ||
    case when tf then ' and not _vd_is_teacher_row(to_jsonb(s)->>''email'')' else '' end
    into j using p_class, p_me;
  return j;
end $$;

create or replace function _lobby_teams(p_class uuid, p_me uuid) returns json
language sql stable security definer set search_path = public as $$
  select json_build_object(
    'teams', (select coalesce(json_agg(json_build_object('id', g.id, 'name', g.name, 'color', g.color,
                'members', (select coalesce(json_agg(json_build_object('id', s.id, 'handle', s.handle, 'me', s.id = p_me,
                              'here', exists (select 1 from lobby_presence lp where lp.class_id = p_class and lp.student_id = s.id and lp.last_seen > now() - interval '15 seconds'))
                              order by s.handle), '[]'::json)
                            from students s where s.group_id = g.id)
              ) order by g.sort, g.name), '[]'::json)
              from class_groups g where g.class_id = p_class
               and exists (select 1 from students s where s.group_id = g.id)),
    'ungrouped', (select count(*) from students s where s.class_id = p_class and s.group_id is null),
    'loose', _lobby_loose(p_class, p_me),
    'here', (select count(*) from lobby_presence lp where lp.class_id = p_class and lp.last_seen > now() - interval '15 seconds')
  );
$$;

-- ---- student -------------------------------------------------------------------
-- p_here = true from lobby.html (marks presence); false from announcements (peek only)
create or replace function ctf_lobby_state(p_student uuid, p_here boolean default false)
returns json language plpgsql security definer set search_path = public as $$
declare me students; l class_lobbies; g class_groups;
begin
  select * into me from students where id = p_student and auth_user_id = auth.uid();
  if me.id is null then return json_build_object('error','not_yours'); end if;
  l := _lobby_get(me.class_id);
  if p_here and l.class_id is not null and l.status <> 'closed' then
    insert into lobby_presence (class_id, student_id, last_seen) values (me.class_id, me.id, now())
      on conflict (class_id, student_id) do update set last_seen = now();
  end if;
  select * into g from class_groups where id = me.group_id;
  return json_build_object('now', now(), 'me', me.id, 'handle', me.handle,
    'lobby', case when l.class_id is null or l.status = 'closed' then null else json_build_object('kind', l.kind, 'status', l.status, 'start_at', l.start_at, 'opened_at', l.opened_at) end,
    'live', _lobby_live(me.class_id),
    'team', case when g.id is null then null else json_build_object('id', g.id, 'name', g.name, 'color', g.color) end,
    'bg', (select to_jsonb(c)->'battle_bg' from classes c where c.id = me.class_id),
    'room', case when p_here then _lobby_teams(me.class_id, me.id) end);
end $$;

-- ---- teacher -------------------------------------------------------------------
create or replace function ctf_t_lobby_state(p_class uuid)
returns json language plpgsql security definer set search_path = public as $$
declare l class_lobbies;
begin
  if not _is_teacher() then return json_build_object('error','not_teacher'); end if;
  l := _lobby_get(p_class);
  return json_build_object('now', now(),
    'lobby', case when l.class_id is null or l.status = 'closed' then null else json_build_object('kind', l.kind, 'status', l.status, 'start_at', l.start_at, 'opened_at', l.opened_at) end,
    'live', _lobby_live(p_class), 'room', _lobby_teams(p_class, null));
end $$;

create or replace function ctf_t_lobby_open(p_class uuid, p_kind text)
returns json language plpgsql security definer set search_path = public as $$
begin
  if not _is_teacher() then return json_build_object('error','not_teacher'); end if;
  if p_kind not in ('team','vocab','raid','bracket') then return json_build_object('error','bad_kind'); end if;
  delete from lobby_presence where class_id = p_class and last_seen < now() - interval '1 minute';
  insert into class_lobbies (class_id, kind, status, start_at, opened_at, updated_at) values (p_class, p_kind, 'open', null, now(), now())
    on conflict (class_id) do update set kind = excluded.kind, status = 'open', start_at = null, opened_at = now(), updated_at = now();
  return json_build_object('ok', true);
end $$;

-- p_status: 'counting' (with p_secs), 'started' (battle is live), 'open' (abort countdown), 'closed'
create or replace function ctf_t_lobby_set(p_class uuid, p_status text, p_secs int default 5)
returns json language plpgsql security definer set search_path = public as $$
begin
  if not _is_teacher() then return json_build_object('error','not_teacher'); end if;
  if p_status not in ('open','counting','started','closed') then return json_build_object('error','bad_status'); end if;
  update class_lobbies set status = p_status, updated_at = now(),
    start_at = case when p_status = 'counting' then now() + make_interval(secs => least(60, greatest(3, coalesce(p_secs, 5)))) when p_status = 'open' then null else start_at end
   where class_id = p_class;
  return json_build_object('ok', true, 'now', now(), 'start_at', (select start_at from class_lobbies where class_id = p_class));
end $$;

do $$
declare f text;
begin
  foreach f in array array['_lobby_live(uuid)', '_lobby_get(uuid)', '_lobby_teams(uuid,uuid)', '_lobby_loose(uuid,uuid)'] loop
    execute format('revoke all on function %s from public, anon, authenticated', f);
  end loop;
  foreach f in array array['ctf_lobby_state(uuid,boolean)', 'ctf_t_lobby_state(uuid)', 'ctf_t_lobby_open(uuid,text)', 'ctf_t_lobby_set(uuid,text,int)'] loop
    execute format('revoke all on function %s from public, anon', f);
    execute format('grant execute on function %s to authenticated', f);
  end loop;
end $$;
notify pgrst, 'reload schema';
