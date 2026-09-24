-- =====================================================================
--  FixNaija — VOLUNTEERS (for volunteer.html + the admin dashboard)
--  Run in: Supabase Dashboard → SQL Editor → New query → paste → Run
--
--  NEEDS: database/supabase_security_hardening.sql to have been run
--         first (it creates the admins list and is_admin()).
--
--  WHAT THIS DOES
--   • Creates the "volunteers" table that the volunteer form saves to.
--   • The public can only SUBMIT an application (and must tick consent).
--   • Only admins can read, update (status / notes) or delete them.
--  Safe to run more than once.
-- =====================================================================

begin;
set local client_min_messages = warning;   -- hide harmless "does not exist, skipping" notes

do $$
begin
  if to_regprocedure('public.is_admin()') is null then
    raise exception 'STOP: run database/supabase_security_hardening.sql first (it creates is_admin()).';
  end if;
end $$;

create table if not exists public.volunteers (
  id              uuid primary key default gen_random_uuid(),
  created_at      timestamptz not null default now(),
  full_name       text not null check (char_length(full_name) between 2 and 120),
  email           text check (email is null or char_length(email) <= 160),
  phone           text not null check (char_length(phone) between 7 and 30),
  state           text not null check (char_length(state) <= 60),
  role            text not null check (char_length(role) <= 80),
  time_commitment text check (time_commitment is null or char_length(time_commitment) <= 40),
  motivation      text check (motivation is null or char_length(motivation) <= 2000),
  consent         boolean not null default false,
  status          text not null default 'new'
                  check (status in ('new', 'contacted', 'onboarded', 'declined')),
  admin_notes     text check (admin_notes is null or char_length(admin_notes) <= 2000)
);
create index if not exists volunteers_created_at_idx on public.volunteers (created_at desc);

alter table public.volunteers enable row level security;

drop policy if exists "Public can apply to volunteer" on public.volunteers;
drop policy if exists "Admins read volunteers"        on public.volunteers;
drop policy if exists "Admins update volunteers"      on public.volunteers;
drop policy if exists "Admins delete volunteers"      on public.volunteers;

-- public: submit only, with consent, and they cannot set the status or notes
create policy "Public can apply to volunteer" on public.volunteers
  for insert to anon, authenticated
  with check (consent = true and status = 'new' and admin_notes is null);

-- admins: read / update / delete
create policy "Admins read volunteers"   on public.volunteers for select to authenticated using (public.is_admin());
create policy "Admins update volunteers" on public.volunteers for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Admins delete volunteers" on public.volunteers for delete to authenticated using (public.is_admin());

revoke all on public.volunteers from anon;
grant insert                 on public.volunteers to anon, authenticated;
grant select, update, delete on public.volunteers to authenticated;

commit;

-- ---------- CHECK · run after the script ----------------------------------
-- select policyname, roles, cmd from pg_policies where tablename = 'volunteers';
