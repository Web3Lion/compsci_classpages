-- ============================================================================
--  ANSWER KEY STORAGE  —  run AFTER schema.sql, google-auth.sql,
--  teacher-reports.sql, class-gates.sql.
--
--  WHY THIS EXISTS: the answer plaintext must never be a static file on a
--  public GitHub Pages site — anyone could fetch answers.js directly without
--  ever loading the teacher page. The answers now live in a table that RLS
--  seals completely, reachable only through an _is_teacher() gated RPC.
--
--  One row, one jsonb blob: { "cyber1": {"id#0":"flag{...}"}, ... }
-- ============================================================================

create table if not exists answer_key (
  id         int primary key default 1,
  data       jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  constraint answer_key_singleton check (id = 1)
);
alter table answer_key enable row level security;   -- no policies: sealed

-- read (teacher only)
create or replace function ctf_t_answers()
returns json language plpgsql security definer set search_path = public as $$
declare v jsonb;
begin
  if not _is_teacher() then return json_build_object('error','not_teacher'); end if;
  select data into v from answer_key where id = 1;
  return json_build_object('ok', true, 'data', coalesce(v, '{}'::jsonb));
end $$;

-- write / replace (teacher only). Called once from the answer-key page when the
-- teacher uploads their local answers file.
create or replace function ctf_t_put_answers(p_data jsonb)
returns json language plpgsql security definer set search_path = public as $$
declare n int;
begin
  if not _is_teacher() then return json_build_object('error','not_teacher'); end if;
  insert into answer_key (id, data, updated_at) values (1, coalesce(p_data,'{}'::jsonb), now())
    on conflict (id) do update set data = excluded.data, updated_at = now();
  select count(*) into n from (
    select jsonb_object_keys(value) from jsonb_each(coalesce(p_data,'{}'::jsonb))
  ) t;
  return json_build_object('ok', true, 'count', n);
end $$;

do $$
declare f text;
begin
  foreach f in array array['ctf_t_answers()','ctf_t_put_answers(jsonb)'] loop
    execute format('revoke all on function %s from public, anon', f);
    execute format('grant execute on function %s to authenticated', f);
  end loop;
end $$;

notify pgrst, 'reload schema';
