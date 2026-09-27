-- ============================================================================
--  COINS + COSMETICS  (v2.0)  —  a second currency, separate from XP.
--
--  Students EARN coins from XP milestones: 1 coin for every 250 XP on the board
--  (points + bonus, the same number every leaderboard shows). Teachers can also
--  grant bonus coins. Coins are SPENT in the profile Coin Shop on cosmetics:
--    t_*  titles       shown under the handle on leaderboards / duels
--    c_*  name colors  the handle's color on leaderboards / duels
--    f_*  frames       a border treatment on the student's leaderboard row
--  Cosmetics never change XP, rank, or grades.
--
--  Balance = floor(xp / 250) + granted coins − coins spent. Spending never
--  lowers XP. Prices live in _cosmetic_price() below and MUST match cosmetics.js.
--
--  Run AFTER schema.sql, google-auth.sql, teacher-xp.sql. Safe to re-run.
-- ============================================================================

alter table students add column if not exists equipped jsonb not null default '{}'::jsonb;

create table if not exists cosmetic_owned (
  student_id uuid not null references students(id) on delete cascade,
  item_id    text not null,
  price      int  not null,
  bought_at  timestamptz not null default now(),
  primary key (student_id, item_id)
);
alter table cosmetic_owned enable row level security;

create table if not exists coin_grants (
  id         uuid primary key default gen_random_uuid(),
  class_id   uuid not null references classes(id) on delete cascade,
  student_id uuid not null references students(id) on delete cascade,
  amount     int  not null,
  reason     text,
  granted_by text,
  created_at timestamptz not null default now()
);
create index if not exists coin_grants_student on coin_grants (student_id);
alter table coin_grants enable row level security;

create or replace function _cosmetic_price(p_item text)
returns int language sql immutable as $$
  select case p_item
    -- titles
    when 't_script_kiddie' then 1  when 't_packet_sniffer' then 2  when 't_bit_flipper' then 2
    when 't_null_pointer'  then 3  when 't_kernel_panic'   then 3  when 't_honeypot'    then 3
    when 't_the_patch'     then 3  when 't_cryptkeeper'    then 4  when 't_root_access' then 4
    when 't_zero_day'      then 5  when 't_ghost_shell'    then 6  when 't_legend'      then 10
    -- name colors
    when 'c_mint' then 2  when 'c_ice' then 2  when 'c_pink' then 2
    when 'c_gold' then 3  when 'c_plasma' then 3  when 'c_aurora' then 6
    -- frames
    when 'f_pulse' then 4  when 'f_glitch' then 4  when 'f_circuit' then 5  when 'f_gold' then 8
    else null end
$$;
create or replace function _cosmetic_slot(p_item text)
returns text language sql immutable as $$
  select case left(coalesce(p_item,''), 2) when 't_' then 'title' when 'c_' then 'color' when 'f_' then 'frame' else null end
$$;

create or replace function _coin_state(p_student uuid)
returns json language plpgsql stable security definer set search_path = public as $$
declare v_xp int; v_earned int; v_granted int; v_spent int;
begin
  select coalesce(points,0) + coalesce(bonus,0) into v_xp from progress where student_id = p_student;
  v_xp := coalesce(v_xp, 0);
  v_earned := floor(v_xp / 250.0);
  select coalesce(sum(amount),0) into v_granted from coin_grants where student_id = p_student;
  select coalesce(sum(price),0)  into v_spent   from cosmetic_owned where student_id = p_student;
  return json_build_object(
    'xp', v_xp, 'per', 250,
    'earned', v_earned, 'granted', v_granted, 'spent', v_spent,
    'balance', greatest(0, v_earned + v_granted - v_spent),
    'next_at', (v_earned + 1) * 250,
    'owned', coalesce((select json_agg(item_id order by bought_at) from cosmetic_owned where student_id = p_student), '[]'::json),
    'equipped', coalesce((select equipped from students where id = p_student), '{}'::jsonb)
  );
end $$;

create or replace function ctf_my_coins(p_student uuid)
returns json language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from students where id = p_student and auth_user_id = auth.uid())
    then return json_build_object('error','not_yours'); end if;
  return _coin_state(p_student);
end $$;

create or replace function ctf_buy_cosmetic(p_student uuid, p_item text)
returns json language plpgsql security definer set search_path = public as $$
declare v_price int := _cosmetic_price(p_item); v_state json;
begin
  if not exists (select 1 from students where id = p_student and auth_user_id = auth.uid())
    then return json_build_object('error','not_yours'); end if;
  if v_price is null then return json_build_object('error','no_such_item'); end if;
  if exists (select 1 from cosmetic_owned where student_id = p_student and item_id = p_item)
    then return json_build_object('error','already_owned'); end if;
  perform 1 from students where id = p_student for update;           -- serialize double-clicks
  v_state := _coin_state(p_student);
  if (v_state->>'balance')::int < v_price then return json_build_object('error','not_enough_coins'); end if;
  insert into cosmetic_owned (student_id, item_id, price) values (p_student, p_item, v_price);
  -- auto-equip the first thing bought in an empty slot
  update students set equipped = equipped || jsonb_build_object(_cosmetic_slot(p_item), p_item)
   where id = p_student and not (equipped ? _cosmetic_slot(p_item));
  return _coin_state(p_student);
end $$;

-- p_item null = unequip that slot
create or replace function ctf_equip_cosmetic(p_student uuid, p_slot text, p_item text)
returns json language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from students where id = p_student and auth_user_id = auth.uid())
    then return json_build_object('error','not_yours'); end if;
  if p_slot not in ('title','color','frame') then return json_build_object('error','bad_slot'); end if;
  if p_item is null then
    update students set equipped = equipped - p_slot where id = p_student;
  else
    if _cosmetic_slot(p_item) <> p_slot then return json_build_object('error','wrong_slot'); end if;
    if not exists (select 1 from cosmetic_owned where student_id = p_student and item_id = p_item)
      then return json_build_object('error','not_owned'); end if;
    update students set equipped = equipped || jsonb_build_object(p_slot, p_item) where id = p_student;
  end if;
  return _coin_state(p_student);
end $$;

-- everyone's equipped cosmetics in one class (classmates + teacher)
create or replace function ctf_class_cosmetics(p_class uuid)
returns json language plpgsql security definer set search_path = public as $$
begin
  if not (_is_teacher() or exists (select 1 from students where class_id = p_class and auth_user_id = auth.uid()))
    then return json_build_object('error','not_allowed'); end if;
  return coalesce((select json_agg(json_build_object('handle', handle, 'equipped', equipped))
    from students where class_id = p_class and equipped <> '{}'::jsonb), '[]'::json);
end $$;

-- teacher: bonus coins (clamped ±20 per call)
create or replace function ctf_t_grant_coins(p_students uuid[], p_amount int, p_reason text default null)
returns json language plpgsql security definer set search_path = public as $$
declare v_amt int := greatest(-20, least(20, coalesce(p_amount,0))); v_n int;
begin
  if not _is_teacher() then return json_build_object('error','not_teacher'); end if;
  if v_amt = 0 then return json_build_object('error','zero'); end if;
  insert into coin_grants (class_id, student_id, amount, reason, granted_by)
    select s.class_id, s.id, v_amt, nullif(btrim(coalesce(p_reason,'')),''), lower(coalesce(_email(),''))
    from students s where s.id = any(p_students);
  get diagnostics v_n = row_count;
  return json_build_object('ok', true, 'students', v_n, 'amount', v_amt);
end $$;

-- teacher: coin balances for a class
create or replace function ctf_t_coins(p_class uuid)
returns json language plpgsql security definer set search_path = public as $$
begin
  if not _is_teacher() then return json_build_object('error','not_teacher'); end if;
  return coalesce((select json_agg(json_build_object('id', s.id, 'handle', s.handle) :: jsonb || (_coin_state(s.id))::jsonb order by s.handle)
    from students s where s.class_id = p_class), '[]'::json);
end $$;

do $$
declare f text;
begin
  foreach f in array array[
    'ctf_my_coins(uuid)', 'ctf_buy_cosmetic(uuid,text)', 'ctf_equip_cosmetic(uuid,text,text)',
    'ctf_class_cosmetics(uuid)', 'ctf_t_grant_coins(uuid[],int,text)', 'ctf_t_coins(uuid)'
  ] loop
    execute format('revoke all on function %s from public, anon', f);
    execute format('grant execute on function %s to authenticated', f);
  end loop;
end $$;
revoke all on function _coin_state(uuid) from public, anon, authenticated;

notify pgrst, 'reload schema';
