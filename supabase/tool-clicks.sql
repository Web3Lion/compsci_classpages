-- ============================================================================
--  TOOL CLICKS  —  how often each card on tools/index.html gets used.
--
--  Anonymous on purpose: Teacher Tools needs no sign-in, so the writer is open
--  to the anon role. It stores only the page, the card, the button, and the
--  time. No email, no IP, no user id.
--
--  Writes go through ctf_log_tool_click() (length-capped, no direct table
--  access). Only a teacher can read or clear the counts (teacher.html →
--  Settings → Tool clicks).
--
--  Run any time after google-auth.sql / teachers.sql (needs _is_teacher()).
--  Safe to re-run.
-- ============================================================================

create table if not exists tool_clicks (
  id      bigserial primary key,
  page    text not null,
  card    text not null,
  action  text,
  at      timestamptz not null default now()
);
create index if not exists tool_clicks_at on tool_clicks (at desc);
create index if not exists tool_clicks_page_card on tool_clicks (page, card);

alter table tool_clicks enable row level security;
-- no policies on purpose: only the security-definer functions below touch it

-- ---- writer: anyone on the page --------------------------------------------
create or replace function ctf_log_tool_click(p_page text, p_card text, p_action text default null)
returns json language plpgsql security definer set search_path = public as $$
begin
  if coalesce(trim(p_page),'') = '' or coalesce(trim(p_card),'') = '' then
    return json_build_object('ok', false);
  end if;
  insert into tool_clicks (page, card, action)
  values (left(trim(p_page), 60), left(trim(p_card), 80), nullif(left(trim(coalesce(p_action,'')), 60), ''));
  return json_build_object('ok', true);
end $$;
revoke all on function ctf_log_tool_click(text, text, text) from public;
grant execute on function ctf_log_tool_click(text, text, text) to anon, authenticated;

-- ---- teacher: counts per card + button -------------------------------------
create or replace function ctf_t_tool_clicks()
returns json language plpgsql security definer set search_path = public as $$
begin
  if not _is_teacher() then return json_build_object('error','not_teacher'); end if;
  return json_build_object(
    'since', (select min(at) from tool_clicks),
    'rows', coalesce((
      select json_agg(row_to_json(t) order by t.total desc) from (
        select page, card, coalesce(action,'') as action,
               count(*) filter (where at >= date_trunc('day', now() at time zone 'America/New_York') at time zone 'America/New_York')::int as today,
               count(*) filter (where at >= now() - interval '7 days')::int as week,
               count(*)::int as total,
               max(at) as last_at
        from tool_clicks
        group by page, card, coalesce(action,'')
      ) t), '[]'::json)
  );
end $$;
revoke all on function ctf_t_tool_clicks() from public, anon;
grant execute on function ctf_t_tool_clicks() to authenticated;

-- ---- teacher: reset the counts ---------------------------------------------
create or replace function ctf_t_tool_clicks_clear()
returns json language plpgsql security definer set search_path = public as $$
declare n integer;
begin
  if not _is_teacher() then return json_build_object('error','not_teacher'); end if;
  delete from tool_clicks;
  get diagnostics n = row_count;
  return json_build_object('ok', true, 'cleared', n);
end $$;
revoke all on function ctf_t_tool_clicks_clear() from public, anon;
grant execute on function ctf_t_tool_clicks_clear() to authenticated;

notify pgrst, 'reload schema';
