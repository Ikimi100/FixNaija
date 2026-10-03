-- =====================================================================
--  FixNaija — COORDINATOR REFERRAL LINKS
--  Run in: Supabase Dashboard → SQL Editor → New query → paste → Run
--  Needs: supabase_security_hardening.sql (for is_admin()).
--
--  WHAT THIS DOES
--   • Creates a private "coordinators" list (admins only). Each coordinator
--     gets a short code, e.g. ada-482, and a personal link:
--        https://www.fixnaijamovement.com.ng/register.html?ref=ada-482
--   • Adds one optional column, referral_code, to registrations. People who
--     register through a coordinator's link carry that code; everyone else
--     is saved exactly as before (the column stays empty).
--   • referral_leaderboard(): admin-only totals per coordinator.
--   • referral_info(code): lets the register page say "Invited by Ada ·
--     Ikeja". It returns only the first name, LGA and state — never phone
--     numbers or any registration data.
--
--  Safe to run more than once. Nothing in your existing data is changed.
-- =====================================================================

begin;
set local client_min_messages = warning;

do $$
begin
  if to_regprocedure('public.is_admin()') is null then
    raise exception 'STOP: run database/supabase_security_hardening.sql first (it creates is_admin()).';
  end if;
end $$;

-- ---------- the coordinators list (admins only) ----------------------------
create table if not exists public.coordinators (
  id          bigint generated always as identity primary key,
  created_at  timestamptz not null default now(),
  code        text not null unique check (code ~ '^[a-z0-9-]{3,24}$'),
  full_name   text not null check (char_length(full_name) between 2 and 120),
  phone       text check (phone is null or char_length(phone) <= 32),
  state       text check (state is null or char_length(state) <= 80),
  lga         text check (lga is null or char_length(lga) <= 120),
  role        text check (role is null or char_length(role) <= 60),
  active      boolean not null default true
);

alter table public.coordinators enable row level security;
revoke all on public.coordinators from public, anon;
grant select, insert, update, delete on public.coordinators to authenticated;

drop policy if exists "Admins manage coordinators" on public.coordinators;
create policy "Admins manage coordinators" on public.coordinators
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ---------- registrations: one optional column ------------------------------
alter table public.registrations add column if not exists referral_code text;
alter table public.registrations drop constraint if exists registrations_referral_code_format;
alter table public.registrations add constraint registrations_referral_code_format
  check (referral_code is null or referral_code ~ '^[a-z0-9-]{3,24}$') not valid;
create index if not exists registrations_referral_code_idx
  on public.registrations (referral_code) where referral_code is not null;

-- ---------- public: "Invited by …" (first name, LGA and state only) ---------
create or replace function public.referral_info(p_code text)
returns table (first_name text, lga text, state text)
language sql
stable
security definer
set search_path = public
as $$
  select split_part(trim(c.full_name), ' ', 1), c.lga, c.state
  from public.coordinators c
  where c.code = lower(trim(p_code)) and c.active
  limit 1
$$;
revoke all on function public.referral_info(text) from public;
grant execute on function public.referral_info(text) to anon, authenticated;

-- ---------- admin: the leaderboard ------------------------------------------
create or replace function public.referral_leaderboard()
returns table (
  code text, full_name text, phone text, state text, lga text, role text,
  active boolean, created_at timestamptz,
  registrations bigint, last_7_days bigint, last_signup timestamptz
)
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
    select c.code, c.full_name, c.phone, c.state, c.lga, c.role, c.active, c.created_at,
           count(r.referral_code)::bigint,
           count(r.referral_code) filter (where r.created_at > now() - interval '7 days')::bigint,
           max(r.created_at)
    from public.coordinators c
    left join public.registrations r on r.referral_code = c.code
    group by c.id
    order by count(r.referral_code) desc, c.full_name;
end;
$$;
revoke all on function public.referral_leaderboard() from public, anon;
grant execute on function public.referral_leaderboard() to authenticated;

commit;

-- =====================================================================
--  HANDY QUERIES
-- =====================================================================
-- Registrations per code, including codes that are not on the list:
--   select referral_code, count(*) from public.registrations
--   where referral_code is not null group by 1 order by 2 desc;
--
-- Switch the feature off later (keeps the data):
--   drop function if exists public.referral_info(text);
