-- =====================================================================
--  FixNaija — SECURITY HARDENING
--  Run in: Supabase Dashboard → SQL Editor → New query
--
--  WHAT THIS DOES
--   1. Creates an "admins" list. Only emails on this list can use the
--      admin dashboard, news admin and form-options manager.
--   2. registrations + community_reports: the public can only SUBMIT
--      (insert). Nobody without an admin login can read, edit or
--      delete supporters' names, phones or reports.
--   3. news + form_options: the public can still read what is published,
--      but only admins can add / edit / delete.
--   4. Adds registration_count() — returns ONLY the total number of
--      registrations (no names, no phones) for the live counter on the
--      home page.
--
--  BEFORE YOU RUN
--   • Do STEP 0 first on its own (select just that query and click Run)
--     to see every account that can currently log in.
--   • The admin email is already set to fixnaijamovement@gmail.com (STEP 1).
--
--  AFTER YOU RUN
--   • Authentication → Sign In / Providers → Email → turn OFF
--     "Allow new users to sign up". Create admin accounts yourself from
--     Authentication → Users → "Add user".
--   • Log in to admin.html and check the dashboard still loads.
-- =====================================================================


-- ---------- STEP 0 · who can log in today? (run this line on its own first)
-- select id, email, created_at, last_sign_in_at from auth.users order by created_at;


begin;

-- ---------- STEP 1 · the admin list ---------------------------------------
create table if not exists public.admins (
  email    text primary key,
  added_at timestamptz not null default now()
);
alter table public.admins enable row level security;   -- no policies = invisible to the website
revoke all on public.admins from anon, authenticated;

-- admin(s) allowed to use admin.html, news-admin.html and form-options.html
-- (to add another admin later, add a line like  ('someone@gmail.com'),  above the last one)
insert into public.admins (email) values
  ('fixnaijamovement@gmail.com')
on conflict (email) do nothing;

-- safety stop: abort everything if the placeholder above was not replaced
do $$
begin
  if not exists (select 1 from public.admins where email not ilike '%@example.com') then
    raise exception 'STOP: put your real admin email in STEP 1, then run again.';
  end if;
  delete from public.admins where email ilike '%@example.com';
end $$;

-- is the logged-in user an admin?
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admins a
    where lower(a.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;


-- ---------- STEP 2 · supporters' data: submit-only for the public ----------
-- remove every old policy on these two tables, then add the safe set
do $$
declare r record;
begin
  for r in
    select policyname, tablename from pg_policies
    where schemaname = 'public' and tablename in ('registrations', 'community_reports')
  loop
    execute format('drop policy %I on public.%I', r.policyname, r.tablename);
  end loop;
end $$;

alter table public.registrations     enable row level security;
alter table public.community_reports enable row level security;

-- public: insert only
create policy "Public can register"      on public.registrations     for insert to anon, authenticated with check (true);
create policy "Public can report issues" on public.community_reports for insert to anon, authenticated with check (true);

-- admins: read / update / delete
create policy "Admins read registrations"   on public.registrations     for select to authenticated using (public.is_admin());
create policy "Admins update registrations" on public.registrations     for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Admins delete registrations" on public.registrations     for delete to authenticated using (public.is_admin());
create policy "Admins read reports"         on public.community_reports for select to authenticated using (public.is_admin());
create policy "Admins update reports"       on public.community_reports for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Admins delete reports"       on public.community_reports for delete to authenticated using (public.is_admin());

-- table-level grants to match (belt and braces)
revoke select, update, delete on public.registrations     from anon;
revoke select, update, delete on public.community_reports from anon;
grant  insert                 on public.registrations     to anon, authenticated;
grant  insert                 on public.community_reports to anon, authenticated;
grant  select, update, delete on public.registrations     to authenticated;
grant  select, update, delete on public.community_reports to authenticated;


-- ---------- STEP 3 · news + form options: only admins can change them -------
drop policy if exists "Authenticated manage news"         on public.news;
drop policy if exists "Admins manage news"                on public.news;
create policy "Admins manage news" on public.news
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Authenticated manage form options" on public.form_options;
drop policy if exists "Admins manage form options"        on public.form_options;
create policy "Admins manage form options" on public.form_options
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
-- (the existing "Public read published news" / "Public read active form options" policies stay as they are)


-- ---------- STEP 4 · live counter for the home page (count only, no data) ---
create or replace function public.registration_count()
returns bigint
language sql
stable
security definer
set search_path = public
as $$
  select count(*) from public.registrations;
$$;
revoke all on function public.registration_count() from public;
grant execute on function public.registration_count() to anon, authenticated;

commit;


-- ---------- CHECK · run after the script ----------------------------------
-- select tablename, policyname, roles, cmd from pg_policies
-- where schemaname = 'public'
--   and tablename in ('registrations','community_reports','news','form_options')
-- order by tablename, policyname;
--
-- select public.registration_count();   -- should return your total
