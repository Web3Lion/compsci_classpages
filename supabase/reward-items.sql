-- ============================================================================
--  REWARD ITEMS  —  an inventory of items a student holds and chooses when to use.
--
--  TIMED (start a countdown when used; a second one of the same kind stacks on
--  the end of the first)
--    xp2x        2× XP on every capture · 24 hours
--    freeze      Streak Freeze: missed school days don't break the streak · 7 days
--    timefreeze  Time Freeze: flags pay full XP, no time decay · 10 minutes
--    squad       Squad Surge: 1.5× XP for everyone in the owner's squad · 1 hour
--  CHARGES (used = armed; the CTF page spends the charge when it triggers)
--    hint        Free Hint: next hint reveal costs no XP
--    retry       Retry Wipe: next capture on a missed flag ignores the retry cap
--    cooldown    Cooldown Skip: next wrong-answer lockout is skipped
--    shield      Firewall Shield: first wrong answer in the next boss fight is blocked
--    overclock   Overclock: first 5 answers of the next boss fight deal 2× damage
--    extralife   Extra Life: next boss fight starts at 125 integrity
--    lucky       Lucky Capture: next capture pays 3×
--    pioneer     Pioneer Boost: next first-to-solve bonus is doubled
--  INSTANT
--    xp500       +500 XP (via teacher_bonus + an xp_grants row, so every board counts it)
--    mystery     Mystery Box: becomes a random IN-GAME item (never a classroom prize)
--    voucher     Classroom prize (Homework Pass, test bonus…); used = redeemed
--
--  LOOT DROPS: each flag a student captures rolls once (server-side) for a 3%
--  chance at a random in-game item. Mystery Box and loot share one pool, and
--  that pool never contains 'voucher' — classroom prizes only come from you.
--
--  Run AFTER schema.sql, google-auth.sql, teacher-xp.sql. Safe to re-run
--  (also upgrades the earlier version of this file in place).
-- ============================================================================

create table if not exists reward_items (
  id          uuid primary key default gen_random_uuid(),
  class_id    uuid not null references classes(id) on delete cascade,
  student_id  uuid not null references students(id) on delete cascade,
  kind        text not null,
  label       text,
  note        text,
  source      text not null default 'teacher',
  granted_by  text,
  created_at  timestamptz not null default now(),
  used_at     timestamptz,
  starts_at   timestamptz,
  expires_at  timestamptz
);
alter table reward_items add column if not exists consumed_at timestamptz;
alter table reward_items drop constraint if exists reward_items_kind_check;
alter table reward_items add constraint reward_items_kind_check check (kind in (
  'xp2x','freeze','timefreeze','squad',
  'hint','retry','cooldown','shield','overclock','extralife','lucky','pioneer',
  'xp500','mystery','voucher'));
create index if not exists reward_items_student on reward_items (student_id, created_at desc);
create index if not exists reward_items_class   on reward_items (class_id, created_at desc);
alter table reward_items enable row level security;

create table if not exists loot_rolls (
  student_id uuid not null references students(id) on delete cascade,
  flag_key   text not null,
  rolled_at  timestamptz not null default now(),
  dropped    text,
  primary key (student_id, flag_key)
);
alter table loot_rolls enable row level security;
-- no policies on either table: the security-definer functions below are the only way in

create or replace function _reward_label(p_kind text)
returns text language sql immutable as $$
  select case p_kind
    when 'xp2x'       then '2× XP · 24 hours'
    when 'freeze'     then 'Streak Freeze · 1 week'
    when 'timefreeze' then 'Time Freeze · 10 min'
    when 'squad'      then 'Squad Surge · 1 hour'
    when 'hint'       then 'Free Hint'
    when 'retry'      then 'Retry Wipe'
    when 'cooldown'   then 'Cooldown Skip'
    when 'shield'     then 'Firewall Shield'
    when 'overclock'  then 'Overclock'
    when 'extralife'  then 'Extra Life'
    when 'lucky'      then 'Lucky Capture'
    when 'pioneer'    then 'Pioneer Boost'
    when 'xp500'      then '+500 Bonus XP'
    when 'mystery'    then 'Mystery Box'
    else 'Class Reward' end
$$;

create or replace function _reward_duration(p_kind text)
returns interval language sql immutable as $$
  select case p_kind
    when 'xp2x' then interval '24 hours' when 'freeze' then interval '7 days'
    when 'timefreeze' then interval '10 minutes' when 'squad' then interval '1 hour'
    else null end
$$;

-- Mystery Box + loot pool. In-game items only — no 'voucher', ever. Weights sum to 100.
create or replace function _roll_game_item()
returns text language plpgsql volatile as $$
declare r numeric := random() * 100; acc numeric := 0; rec record;
begin
  for rec in select * from (values
      ('hint',12),('retry',12),('cooldown',12),('timefreeze',10),('shield',10),('extralife',10),
      ('overclock',8),('lucky',7),('pioneer',6),('xp2x',4),('freeze',4),('squad',3),('xp500',2)
    ) v(k, w) loop
    acc := acc + rec.w;
    if r < acc then return rec.k; end if;
  end loop;
  return 'hint';
end $$;

create or replace function _owns_student(p_student uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from students where id = p_student and auth_user_id = auth.uid())
$$;

-- ---- teacher: send item(s) to one student, several, or the whole class -----
drop function if exists ctf_t_send_items(uuid[], text, text, text, text);
create or replace function ctf_t_send_items(
  p_students uuid[], p_kind text, p_label text default null,
  p_note text default null, p_source text default 'teacher', p_qty int default 1
) returns json language plpgsql security definer set search_path = public as $$
declare v_n int; v_q int := greatest(1, least(10, coalesce(p_qty,1)));
begin
  if not _is_teacher() then return json_build_object('error','not_teacher'); end if;
  if _reward_label(p_kind) = 'Class Reward' and p_kind <> 'voucher' then return json_build_object('error','bad_kind'); end if;
  if p_students is null or array_length(p_students,1) is null then return json_build_object('error','no_students'); end if;
  if p_kind = 'voucher' and nullif(btrim(coalesce(p_label,'')),'') is null then
    return json_build_object('error','need_label'); end if;

  insert into reward_items (class_id, student_id, kind, label, note, source, granted_by)
  select s.class_id, s.id, p_kind,
         coalesce(nullif(btrim(coalesce(p_label,'')),''), _reward_label(p_kind)),
         nullif(btrim(coalesce(p_note,'')),''),
         case when p_source = 'spinner' then 'spinner' else 'teacher' end,
         lower(coalesce(_email(),''))
  from students s cross join generate_series(1, v_q)
  where s.id = any(p_students);
  get diagnostics v_n = row_count;
  return json_build_object('ok', true, 'sent', v_n, 'students', v_n / v_q);
end $$;
revoke all on function ctf_t_send_items(uuid[], text, text, text, text, int) from public, anon;
grant execute on function ctf_t_send_items(uuid[], text, text, text, text, int) to authenticated;

-- ---- teacher: item log for a class ------------------------------------------
create or replace function ctf_t_items(p_class uuid, p_limit integer default 300)
returns json language plpgsql security definer set search_path = public as $$
begin
  if not _is_teacher() then return json_build_object('error','not_teacher'); end if;
  return coalesce((
    select json_agg(row_to_json(t)) from (
      select r.id, r.student_id, s.handle, r.kind, r.label, r.note, r.source, r.granted_by,
             r.created_at, r.used_at, r.starts_at, r.expires_at, r.consumed_at
      from reward_items r join students s on s.id = r.student_id
      where r.class_id = p_class
      order by r.created_at desc
      limit greatest(coalesce(p_limit,300),1)
    ) t), '[]'::json);
end $$;
revoke all on function ctf_t_items(uuid, integer) from public, anon;
grant execute on function ctf_t_items(uuid, integer) to authenticated;

-- ---- teacher: take back an item the student hasn't used yet ---------------
create or replace function ctf_t_revoke_item(p_item uuid)
returns json language plpgsql security definer set search_path = public as $$
begin
  if not _is_teacher() then return json_build_object('error','not_teacher'); end if;
  delete from reward_items where id = p_item and used_at is null;
  if not found then return json_build_object('error','already_used'); end if;
  return json_build_object('ok', true);
end $$;
revoke all on function ctf_t_revoke_item(uuid) from public, anon;
grant execute on function ctf_t_revoke_item(uuid) to authenticated;

-- ---- student: my items (+ Squad Surges a squadmate is running) -------------
create or replace function ctf_my_items(p_student uuid)
returns json language plpgsql security definer set search_path = public as $$
declare v_group uuid;
begin
  if not _owns_student(p_student) then return json_build_object('error','not_yours'); end if;
  -- read group_id via jsonb so this works even before class-groups.sql is run
  select nullif(to_jsonb(s)->>'group_id','')::uuid into v_group from students s where s.id = p_student;
  return json_build_object('now', now(), 'items', coalesce((
    select json_agg(row_to_json(t) order by t.created_at desc) from (
      select id, kind, label, note, source, created_at, used_at, starts_at, expires_at, consumed_at,
             false as shared, null::text as from_handle
      from reward_items where student_id = p_student
      union all
      select r.id, r.kind, r.label, r.note, r.source, r.created_at, r.used_at, r.starts_at, r.expires_at, r.consumed_at,
             true, s2.handle
      from reward_items r join students s2 on s2.id = r.student_id
      where v_group is not null and r.kind = 'squad' and r.expires_at > now()
        and r.student_id <> p_student and nullif(to_jsonb(s2)->>'group_id','')::uuid = v_group
    ) t), '[]'::json));
end $$;
revoke all on function ctf_my_items(uuid) from public, anon;
grant execute on function ctf_my_items(uuid) to authenticated;

-- ---- student: use an item ---------------------------------------------------
create or replace function ctf_use_item(p_student uuid, p_item uuid)
returns json language plpgsql security definer set search_path = public as $$
declare v reward_items; v2 reward_items; v_start timestamptz; v_tb int; v_cb int; v_bonus int; v_k text;
begin
  if not _owns_student(p_student) then return json_build_object('error','not_yours'); end if;
  select * into v from reward_items where id = p_item and student_id = p_student for update;
  if not found then return json_build_object('error','no_item'); end if;
  if v.used_at is not null then return json_build_object('error','already_used'); end if;

  if _reward_duration(v.kind) is not null then
    select greatest(now(), coalesce(max(expires_at), now())) into v_start
      from reward_items where student_id = p_student and kind = v.kind and expires_at > now();
    update reward_items set used_at = now(), starts_at = v_start,
           expires_at = v_start + _reward_duration(v.kind) where id = p_item;

  elsif v.kind = 'xp500' then
    insert into progress (student_id, course, points, bonus)
      select p_student, c.course, 0, 0 from classes c where c.id = v.class_id
      on conflict (student_id) do nothing;
    select coalesce(teacher_bonus,0), coalesce(client_bonus, bonus, 0) into v_tb, v_cb
      from progress where student_id = p_student;
    v_bonus := coalesce(v_cb,0) + coalesce(v_tb,0) + 500;
    update progress set teacher_bonus = coalesce(v_tb,0) + 500, bonus = v_bonus, updated_at = now()
      where student_id = p_student;
    insert into xp_grants (class_id, student_id, teacher_email, amount, reason)
      values (v.class_id, p_student, 'reward-item', 500, 'Reward item: +500 Bonus XP');
    update reward_items set used_at = now(), consumed_at = now() where id = p_item;

  elsif v.kind = 'mystery' then
    v_k := _roll_game_item();
    insert into reward_items (class_id, student_id, kind, label, note, source)
      values (v.class_id, p_student, v_k, _reward_label(v_k), 'From a Mystery Box', 'mystery')
      returning * into v2;
    update reward_items set used_at = now(), consumed_at = now() where id = p_item;

  elsif v.kind = 'voucher' then
    update reward_items set used_at = now(), consumed_at = now() where id = p_item;

  else  -- charge: armed until the CTF page spends it
    update reward_items set used_at = now() where id = p_item;
  end if;

  select * into v from reward_items where id = p_item;
  return json_build_object('ok', true, 'bonus', v_bonus, 'item', row_to_json(v),
                           'reveal', case when v2.id is null then null else row_to_json(v2) end);
end $$;
revoke all on function ctf_use_item(uuid, uuid) from public, anon;
grant execute on function ctf_use_item(uuid, uuid) to authenticated;

-- ---- student: the CTF page spent an armed charge ---------------------------
create or replace function ctf_consume_item(p_student uuid, p_item uuid)
returns json language plpgsql security definer set search_path = public as $$
begin
  if not _owns_student(p_student) then return json_build_object('error','not_yours'); end if;
  update reward_items set consumed_at = now()
   where id = p_item and student_id = p_student and used_at is not null and consumed_at is null;
  return json_build_object('ok', found);
end $$;
revoke all on function ctf_consume_item(uuid, uuid) from public, anon;
grant execute on function ctf_consume_item(uuid, uuid) to authenticated;

-- ---- student: loot roll after a capture (once per flag, 3%) ----------------
create or replace function ctf_loot_roll(p_student uuid, p_key text)
returns json language plpgsql security definer set search_path = public as $$
declare v_class uuid; v_k text; v2 reward_items;
begin
  if not _owns_student(p_student) then return json_build_object('error','not_yours'); end if;
  insert into loot_rolls (student_id, flag_key) values (p_student, left(coalesce(p_key,''),200))
    on conflict do nothing;
  if not found then return json_build_object('rolled', false); end if;
  if random() >= 0.03 then return json_build_object('rolled', true); end if;

  select class_id into v_class from students where id = p_student;
  v_k := _roll_game_item();
  insert into reward_items (class_id, student_id, kind, label, note, source)
    values (v_class, p_student, v_k, _reward_label(v_k), 'Loot drop', 'loot')
    returning * into v2;
  update loot_rolls set dropped = v_k where student_id = p_student and flag_key = left(coalesce(p_key,''),200);
  return json_build_object('rolled', true, 'item', row_to_json(v2));
end $$;
revoke all on function ctf_loot_roll(uuid, text) from public, anon;
grant execute on function ctf_loot_roll(uuid, text) to authenticated;

notify pgrst, 'reload schema';
