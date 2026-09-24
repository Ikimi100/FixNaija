-- =====================================================================
--  FixNaija — PROTECT THE VOTE: polling unit agent sign-ups
--  Run in: Supabase Dashboard → SQL Editor → New query → paste → Run
--  Needs: supabase_security_hardening.sql (is_admin) — and, for the
--  one-per-phone rule, supabase_form_protection.sql.
--
--  WHAT THIS DOES
--   • Creates the "pu_agents" table that protect-the-vote.html saves to.
--   • The public can only SUBMIT (with consent). Only admins can read,
--     update (status / notes) or delete.
--   • One sign-up per phone number (same rule as registrations).
--   • pu_coverage(): for the admin page — per state, how many polling
--     units exist and how many already have at least one agent.
--  Safe to run more than once.
-- =====================================================================

begin;
set local client_min_messages = warning;

do $$
begin
  if to_regprocedure('public.is_admin()') is null then
    raise exception 'STOP: run database/supabase_security_hardening.sql first (it creates is_admin()).';
  end if;
end $$;

create table if not exists public.pu_agents (
  id              uuid primary key default gen_random_uuid(),
  created_at      timestamptz not null default now(),
  full_name       text not null check (char_length(full_name) between 2 and 120),
  phone           text not null check (char_length(phone) between 7 and 30),
  whatsapp        text check (whatsapp is null or char_length(whatsapp) <= 30),
  email           text check (email is null or char_length(email) <= 160),
  state           text not null check (char_length(state) <= 60),
  lga             text not null check (char_length(lga) <= 120),
  ward            text check (ward is null or char_length(ward) <= 200),
  polling_unit    text check (polling_unit is null or char_length(polling_unit) <= 300),
  delimitation    text check (delimitation is null or char_length(delimitation) <= 40),
  role            text not null check (role in ('Polling unit agent', 'Ward collation agent', 'LGA collation agent', 'Reserve / runner')),
  registered_here text check (registered_here is null or registered_here in ('Yes', 'No', 'Not sure')),
  experience      text check (experience is null or experience in ('First time', 'Served before')),
  has_smartphone  boolean not null default false,
  consent         boolean not null default false,
  status          text not null default 'new' check (status in ('new', 'contacted', 'trained', 'assigned', 'declined')),
  admin_notes     text check (admin_notes is null or char_length(admin_notes) <= 2000)
);
create index if not exists pu_agents_created_at_idx   on public.pu_agents (created_at desc);
create index if not exists pu_agents_delimitation_idx on public.pu_agents (delimitation);

alter table public.pu_agents enable row level security;
drop policy if exists "Public can sign up as agent" on public.pu_agents;
drop policy if exists "Admins read agents"          on public.pu_agents;
drop policy if exists "Admins update agents"        on public.pu_agents;
drop policy if exists "Admins delete agents"        on public.pu_agents;
create policy "Public can sign up as agent" on public.pu_agents
  for insert to anon, authenticated
  with check (consent = true and status = 'new' and admin_notes is null);
create policy "Admins read agents"   on public.pu_agents for select to authenticated using (public.is_admin());
create policy "Admins update agents" on public.pu_agents for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Admins delete agents" on public.pu_agents for delete to authenticated using (public.is_admin());

revoke all on public.pu_agents from anon;
grant insert                 on public.pu_agents to anon, authenticated;
grant select, update, delete on public.pu_agents to authenticated;

-- one sign-up per phone number (uses the function from supabase_form_protection.sql)
do $$
begin
  if to_regprocedure('public.block_duplicate_phone()') is not null then
    execute 'create index if not exists pu_agents_phone_key_idx on public.pu_agents (public.phone_key(phone))';
    execute 'drop trigger if exists pu_agents_one_per_phone on public.pu_agents';
    execute 'create trigger pu_agents_one_per_phone before insert on public.pu_agents
             for each row execute function public.block_duplicate_phone()';
  else
    raise warning 'Run supabase_form_protection.sql too, then run this file again, to switch on one-sign-up-per-phone.';
  end if;
end $$;

-- coverage per state, for the admin page (admins only)
create or replace function public.pu_coverage()
returns table (state text, total_pus bigint, covered_pus bigint, agents bigint)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'admins only' using errcode = '42501';
  end if;
  return query
    with t as (
      select p.state::text as st, count(*)::bigint as total from public.polling_units p group by p.state
    ), c as (
      select p.state::text as st, count(distinct p.delimitation)::bigint as covered
      from public.polling_units p
      join public.pu_agents a on a.delimitation = p.delimitation and a.status <> 'declined'
      group by p.state
    ), g as (
      select upper(trim(a.state)) as st, count(*)::bigint as n
      from public.pu_agents a where a.status <> 'declined' group by 1
    )
    select t.st, t.total, coalesce(c.covered, 0), coalesce(g.n, 0)
    from t left join c on c.st = t.st left join g on g.st = upper(trim(t.st))
    order by t.st;
end;
$$;
revoke all on function public.pu_coverage() from public, anon;
grant execute on function public.pu_coverage() to authenticated;

commit;

-- CHECK:  select * from public.pu_coverage();   -- (as an admin, from the admin page)
