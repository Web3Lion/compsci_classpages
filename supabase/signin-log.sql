-- ============================================================================
--  SIGN-IN REJECT LOG  —  why a student couldn't get in.
--
--  A student whose Google account isn't on an allowed domain is signed straight
--  back out by auth.js, which is correct but silent: the student sees a short
--  refusal and the teacher sees nothing at all. Every such rejection is now
--  recorded here with the DOMAIN it came from, so the first student who tries
--  tells you what the real student domain is instead of anyone guessing.
--
--  This is a diagnostic, not a disciplinary log. It holds the email, the domain,
--  the reason, and which page it happened on — nothing else. One row per
--  (email, reason): repeat attempts bump a counter rather than piling up.
--
--  Note the deliberate absence of an _is_school() check on the writer: the whole
--  point is to hear from accounts that FAIL that check. The function is still
--  restricted to authenticated callers (Google sign-in succeeded, our gate is
--  what refused them) and it writes nothing but the caller's own JWT email.
--
--  Run AFTER google-auth.sql and multi-domain.sql. Safe to re-run.
-- ============================================================================

create table if not exists signin_rejects (
  id          uuid primary key default gen_random_uuid(),
  email       text not null,
  domain      text,
  reason      text not null default 'wrong_domain',
  page        text,
  attempts    integer not null default 1,
  first_at    timestamptz not null default now(),
  last_at     timestamptz not null default now()
);

create unique index if not exists signin_rejects_email_reason
  on signin_rejects (lower(email), reason);
create index if not exists signin_rejects_last_at on signin_rejects (last_at desc);

alter table signin_rejects enable row level security;
-- no policies on purpose: only the security-definer functions below touch it

-- ---- writer: the rejected account logs itself ------------------------------
-- Email comes from the JWT, never from the argument, so nobody can log noise as
-- somebody else. p_page is just a label ("ctf.html", "teacher.html").
create or replace function ctf_log_signin_reject(p_reason text, p_page text)
returns json language plpgsql security definer set search_path = public as $$
declare v_email text; v_domain text;
begin
  if auth.uid() is null then return json_build_object('ok', false); end if;
  v_email  := lower(coalesce(_email(), ''));
  if v_email = '' then return json_build_object('ok', false); end if;
  v_domain := nullif(split_part(v_email, '@', 2), '');

  insert into signin_rejects (email, domain, reason, page)
  values (v_email, v_domain, coalesce(nullif(p_reason,''),'wrong_domain'), nullif(p_page,''))
  on conflict (lower(email), reason) do update
    set attempts = signin_rejects.attempts + 1,
        last_at  = now(),
        page     = coalesce(nullif(excluded.page,''), signin_rejects.page),
        domain   = coalesce(excluded.domain, signin_rejects.domain);

  return json_build_object('ok', true);
end $$;
revoke all on function ctf_log_signin_reject(text, text) from public, anon;
grant execute on function ctf_log_signin_reject(text, text) to authenticated;

-- ---- teacher: read the log, grouped so the pattern is obvious --------------
-- Returns rows newest-first plus a per-domain roll-up: if 22 rejections share
-- one domain, that domain is the one missing from the allow-list.
create or replace function ctf_t_signin_rejects(p_limit integer default 200)
returns json language plpgsql security definer set search_path = public as $$
declare v_allowed text[];
begin
  if not _is_teacher() then return json_build_object('error','not_teacher'); end if;
  begin
    select _school_domains() into v_allowed;
  exception when others then v_allowed := array[_school_domain()];
  end;

  return json_build_object(
    'allowed', to_json(v_allowed),
    'rows', coalesce((
      select json_agg(row_to_json(t)) from (
        select r.email, r.domain, r.reason, r.page, r.attempts, r.first_at, r.last_at,
               (r.domain = any(v_allowed)) as domain_allowed
        from signin_rejects r
        order by r.last_at desc
        limit greatest(coalesce(p_limit,200), 1)
      ) t), '[]'::json),
    'domains', coalesce((
      select json_agg(row_to_json(d) order by d.attempts desc) from (
        select r.domain,
               count(*)::int          as accounts,
               sum(r.attempts)::int   as attempts,
               max(r.last_at)         as last_at,
               (r.domain = any(v_allowed)) as domain_allowed
        from signin_rejects r
        group by r.domain
      ) d), '[]'::json)
  );
end $$;
revoke all on function ctf_t_signin_rejects(integer) from public, anon;
grant execute on function ctf_t_signin_rejects(integer) to authenticated;

-- ---- teacher: clear the log ------------------------------------------------
-- Once a domain is added to the allow-list the old rows are just noise.
create or replace function ctf_t_signin_rejects_clear()
returns json language plpgsql security definer set search_path = public as $$
declare n integer;
begin
  if not _is_teacher() then return json_build_object('error','not_teacher'); end if;
  delete from signin_rejects;
  get diagnostics n = row_count;
  return json_build_object('ok', true, 'cleared', n);
end $$;
revoke all on function ctf_t_signin_rejects_clear() from public, anon;
grant execute on function ctf_t_signin_rejects_clear() to authenticated;

notify pgrst, 'reload schema';
