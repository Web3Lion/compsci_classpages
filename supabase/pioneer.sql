-- ============================================================================
-- PIONEER BONUS — first student in a class to capture a given flag.
--
-- The claim table is the referee: (class_id, flag_key) is the primary key, so
-- two students submitting the same flag in the same second cannot both win it.
-- Whoever's insert lands first gets the row; everyone else gets do-nothing.
--
-- The XP itself is added client-side to state.bonus and rides up on the normal
-- progress sync. The server's only job is deciding WHO, exactly once.
--
-- Safe to re-run.
-- ============================================================================

create table if not exists pioneer_claims (
  class_id   uuid not null references classes(id) on delete cascade,
  flag_key   text not null,
  student_id uuid not null references students(id) on delete cascade,
  handle     text not null default '',
  title      text not null default '',
  points     int  not null default 25,
  created_at timestamptz not null default now(),
  primary key (class_id, flag_key)
);
alter table pioneer_claims enable row level security;   -- no policies: sealed
create index if not exists pioneer_claims_student_idx on pioneer_claims (student_id);
create index if not exists pioneer_claims_class_idx   on pioneer_claims (class_id, created_at desc);

-- ---- student claims a flag --------------------------------------------------
-- Returns { pioneer: true, bonus: n } exactly once per class per flag.
-- Tainted captures never claim: the client simply doesn't call this for them.
create or replace function ctf_pioneer_google(p_student uuid, p_key text, p_title text)
returns json language plpgsql security definer set search_path = public as $$
declare
  v_student students;
  v_award   int := 25;
  v_key     text := left(coalesce(p_key, ''), 80);
  v_got     boolean := false;
begin
  if v_key = '' then return json_build_object('pioneer', false); end if;

  select * into v_student from students
    where id = p_student and auth_user_id = auth.uid();
  if not found then return json_build_object('error', 'not_yours'); end if;

  insert into pioneer_claims (class_id, flag_key, student_id, handle, title, points)
    values (v_student.class_id, v_key, v_student.id,
            coalesce(v_student.handle, ''), left(coalesce(p_title, ''), 200), v_award)
  on conflict (class_id, flag_key) do nothing;

  get diagnostics v_got = row_count;
  if v_got then
    return json_build_object('pioneer', true, 'bonus', v_award);
  end if;
  return json_build_object('pioneer', false);
end $$;
revoke all on function ctf_pioneer_google(uuid, text, text) from public, anon;
grant execute on function ctf_pioneer_google(uuid, text, text) to authenticated;

-- ---- teacher reads the board ------------------------------------------------
-- Who broke ground on what, newest first.
create or replace function ctf_t_pioneers(p_class uuid)
returns json language plpgsql security definer set search_path = public as $$
begin
  if not _is_teacher() then return json_build_object('error', 'not_teacher'); end if;

  return coalesce((
    select json_agg(row_to_json(t))
    from (
      select flag_key, handle, title, points, created_at
      from pioneer_claims
      where class_id = p_class
      order by created_at desc
      limit 300
    ) t
  ), '[]'::json);
end $$;
revoke all on function ctf_t_pioneers(uuid) from public, anon;
grant execute on function ctf_t_pioneers(uuid) to authenticated;

notify pgrst, 'reload schema';
