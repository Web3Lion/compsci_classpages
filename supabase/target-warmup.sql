-- ============================================================================
--  "ARE YOU A TARGET?" WARM-UP  —  Day 1 reflection, ungraded.
--
--  Runs before any student has joined a class or signed in (it's the very
--  first thing they see), so submission is anonymous-key insert, not tied to
--  a students row. Teacher review is read-only via _is_teacher().
--
--  Run AFTER schema.sql + google-auth.sql. Safe to re-run.
-- ============================================================================

create table if not exists target_warmup_responses (
  id          bigint generated always as identity primary key,
  course      text not null,
  name        text not null,
  period      text,
  answers     jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now()
);
create index if not exists target_warmup_course_idx on target_warmup_responses (course, created_at desc);

alter table target_warmup_responses enable row level security;

create or replace function ctf_target_warmup_submit(p_course text, p_name text, p_period text, p_answers jsonb)
returns json language plpgsql security definer set search_path = public as $$
begin
  if coalesce(trim(p_name),'') = '' then return json_build_object('error','empty_name'); end if;
  insert into target_warmup_responses (course, name, period, answers)
    values (left(coalesce(p_course,''),20), left(trim(p_name),80), left(coalesce(p_period,''),40), coalesce(p_answers,'{}'::jsonb));
  return json_build_object('ok', true);
end $$;

create or replace function ctf_t_target_warmup(p_course text, p_limit int default 500)
returns json language plpgsql security definer set search_path = public as $$
begin
  if not _is_teacher() then return json_build_object('error','not_teacher'); end if;
  return coalesce((select json_agg(row_to_json(t)) from (
    select id, name, period, answers, created_at
    from target_warmup_responses where course = p_course
    order by created_at desc limit greatest(1, least(p_limit, 5000))
  ) t), '[]'::json);
end $$;

do $$
declare f text;
begin
  execute 'revoke all on function ctf_target_warmup_submit(text,text,text,jsonb) from public';
  execute 'grant execute on function ctf_target_warmup_submit(text,text,text,jsonb) to anon, authenticated';
  execute 'revoke all on function ctf_t_target_warmup(text,int) from public, anon';
  execute 'grant execute on function ctf_t_target_warmup(text,int) to authenticated';
end $$;

notify pgrst, 'reload schema';
