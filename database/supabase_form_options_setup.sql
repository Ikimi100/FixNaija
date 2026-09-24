-- ============================================================
-- FixNaija Movement — Registration form options
-- Lets you add / rename / hide / reorder the dropdown choices on
-- register.html from form-options.html — no code, no GitHub push.
--
-- Run this ONCE in your Supabase project:
--   Dashboard → SQL Editor → New query → paste → Run
-- Safe to re-run: it never duplicates or overwrites your choices.
-- ============================================================

create extension if not exists pgcrypto;

-- ---------- Table ----------
create table if not exists public.form_options (
  id          uuid primary key default gen_random_uuid(),
  field       text not null,               -- which dropdown, e.g. 'group_name', 'occupation'
  value       text not null,               -- what gets saved on the registration
  label       text,                        -- what people see in the dropdown
  sort_order  integer not null default 0,  -- position in the list (lowest first)
  active      boolean not null default true, -- FALSE = hidden from the form
  created_at  timestamptz default now(),
  updated_at  timestamptz default now(),
  constraint form_options_field_value_key unique (field, value)
);

create index if not exists form_options_field_idx
  on public.form_options (field, sort_order);

-- keep updated_at fresh
create or replace function public.set_form_options_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists form_options_updated_at on public.form_options;
create trigger form_options_updated_at
  before update on public.form_options
  for each row execute function public.set_form_options_updated_at();

-- ---------- Row Level Security ----------
alter table public.form_options enable row level security;

-- The public registration form can read the VISIBLE choices only
drop policy if exists "Public read active form options" on public.form_options;
create policy "Public read active form options" on public.form_options
  for select using (active = true);

-- Logged-in admins (same Supabase Auth login as the Command Room) manage everything
drop policy if exists "Authenticated manage form options" on public.form_options;
create policy "Authenticated manage form options" on public.form_options
  for all to authenticated using (true) with check (true);

grant select on public.form_options to anon, authenticated;
grant insert, update, delete on public.form_options to authenticated;

-- ---------- Seed: every choice currently on register.html ----------
insert into public.form_options (field, value, label, sort_order)
values
  ('group_name', 'New Registration', 'New Registration — I''m registering myself', 10),
  ('group_name', 'PAA FIX NAIJA', 'PAA FIX NAIJA', 20),
  ('group_name', 'BENUE ARISE FOR PAA', 'BENUE ARISE FOR PAA', 30),
  ('group_name', 'IBBN – EL BUBA', 'IBBN – EL BUBA', 40),
  ('group_name', 'New Green Congress (NGC)', 'New Green Congress (NGC)', 50),
  ('group_name', 'United for Adewole Progress 2027', 'United for Adewole Progress 2027', 60),
  ('group_name', 'Prince Adewole Adebayo Grassroots Movement (PAAGM)', 'Prince Adewole Adebayo Grassroots Movement (PAAGM)', 70),
  ('group_name', 'Dominion Force Association of Nigeria', 'Dominion Force Association of Nigeria', 80),
  ('group_name', '19 Northern Stars', '19 Northern Stars', 90),
  ('group_name', 'RESURRECTION PRAYING MOTHER OF NATION', 'RESURRECTION PRAYING MOTHER OF NATION', 100),
  ('group_name', 'YOWICAN', 'YOWICAN', 110),
  ('group_name', 'GREAT NIGERIA AMBASSADORS', 'GREAT NIGERIA AMBASSADORS', 120),
  ('group_name', 'MISSIONARIES GRASSROOTS SUPPORT FOR NIGERIA', 'MISSIONARIES GRASSROOTS SUPPORT FOR NIGERIA', 130),
  ('group_name', 'NATIONAL KINGDOM VANGUARD', 'NATIONAL KINGDOM VANGUARD', 140),
  ('group_name', 'CAMPUS ACTION FOR NIGERIA', 'CAMPUS ACTION FOR NIGERIA', 150),
  ('group_name', 'MOVEMENT FOR PROGRESSIVE NIGERIA', 'MOVEMENT FOR PROGRESSIVE NIGERIA', 160),
  ('group_name', 'NIGERIA INTERCESSORS MOVEMENT', 'NIGERIA INTERCESSORS MOVEMENT', 170),
  ('group_name', 'Muslims Mobilisation Group', 'Muslims Mobilisation Group', 180),
  ('group_name', 'SOUTH SOUTH COALITION FOR ADEBAYO', 'SOUTH SOUTH COALITION FOR ADEBAYO', 190),
  ('group_name', 'SOUTH EAST FOR GOOD GOVERNANCE', 'SOUTH EAST FOR GOOD GOVERNANCE', 200),
  ('group_name', 'SOUTH WEST ALLIANCE FOR PROGRESS', 'SOUTH WEST ALLIANCE FOR PROGRESS', 210),
  ('group_name', 'EASTERN BLOC FOR DEMOCRACY', 'EASTERN BLOC FOR DEMOCRACY', 220),
  ('group_name', 'NEW NIGERIA MOVEMENT OF SOUTH SOUTH REGION', 'NEW NIGERIA MOVEMENT OF SOUTH SOUTH REGION', 230),
  ('group_name', 'NORTH WEST YOUTH MOVEMENT FOR ADEWOLE', 'NORTH WEST YOUTH MOVEMENT FOR ADEWOLE', 240),
  ('group_name', 'AGENDA FOR PROGRESSIVE NIGERIA', 'AGENDA FOR PROGRESSIVE NIGERIA', 250),
  ('group_name', 'ASSOCIATION FOR BETTER NIGERIA', 'ASSOCIATION FOR BETTER NIGERIA', 260),
  ('group_name', 'PROJECT-7000', 'PROJECT-7000', 270),
  ('group_name', 'AFENIFERE NATIONAL YOUTH COUNCIL (ANYC)', 'AFENIFERE NATIONAL YOUTH COUNCIL (ANYC)', 280),
  ('group_name', 'KANO DEMOCRACY COALITION OF FULANI (IDC -FULANI)', 'KANO DEMOCRACY COALITION OF FULANI (IDC -FULANI)', 290),
  ('group_name', 'NORTHERN COALITION NETWORK (NCN)', 'NORTHERN COALITION NETWORK (NCN)', 300),
  ('group_name', 'SOCIAL MEDIA AWARENESS AMS PROMOTION DEVELOPMENT ASSOCIATION (SMAPDA)', 'SOCIAL MEDIA AWARENESS AMS PROMOTION DEVELOPMENT ASSOCIATION (SMAPDA)', 310),
  ('group_name', 'SOUTHERN NIGERIA FOR ADEBAYO', 'SOUTHERN NIGERIA FOR ADEBAYO', 320),
  ('group_name', 'SOUTH EAST FOR DEMOCRACY', 'SOUTH EAST FOR DEMOCRACY', 330),
  ('group_name', 'COCIN - Church of Christ in Nations', 'COCIN - Church of Christ in Nations', 340),
  ('group_name', 'ECWA - (Evangelical Church Winning All)', 'ECWA - (Evangelical Church Winning All)', 350),
  ('group_name', 'NKST - (Nongo u Kristu u I Ser u Sha Tar)', 'NKST - (Nongo u Kristu u I Ser u Sha Tar)', 360),
  ('group_name', 'ERCC - (Evangelical Reformed Church of Christ)', 'ERCC - (Evangelical Reformed Church of Christ)', 370),
  ('group_name', 'CRCN - (Christian Reformed Church of Nigeria)', 'CRCN - (Christian Reformed Church of Nigeria)', 380),
  ('group_name', 'WESTERN REGION COALITION FOR ADEBAYO', 'WESTERN REGION COALITION FOR ADEBAYO', 390),
  ('group_name', 'NUMAN FEDERATION CARNIVAL TROUPES', 'NUMAN FEDERATION CARNIVAL TROUPES', 400),
  ('group_name', 'GREAT NIGERIA MOVEMENT', 'GREAT NIGERIA MOVEMENT', 410),
  ('group_name', 'AbegShift4PAA2027', 'AbegShift4PAA2027', 420),
  ('group_name', 'HEKAN (United Church of Christ in Nigeria, UCCN)', 'HEKAN (United Church of Christ in Nigeria, UCCN)', 430),
  ('group_name', 'GOOD GOVERNANCE FOR THE PEOPLE SUPPORT GROUP', 'GOOD GOVERNANCE FOR THE PEOPLE SUPPORT GROUP', 440),
  ('membership_status', 'Volunteer', 'Volunteer', 10),
  ('membership_status', 'Active Member', 'Active Member', 20),
  ('membership_status', 'Financial Contributor', 'Financial Contributor', 30),
  ('gender', 'Male', 'Male', 10),
  ('gender', 'Female', 'Female', 20),
  ('marital_status', 'Single', 'Single', 10),
  ('marital_status', 'Married', 'Married', 20),
  ('age_group', '18-25', '18–25', 10),
  ('age_group', '26-35', '26–35', 20),
  ('age_group', '36-45', '36–45', 30),
  ('age_group', '46-55', '46–55', 40),
  ('age_group', '56-70', '56–70', 50),
  ('age_group', 'Above 70', 'Above 70', 60),
  ('religion', 'Christian', 'Christian', 10),
  ('religion', 'Muslim', 'Muslim', 20),
  ('religion', 'Traditional', 'Traditional', 30),
  ('religion', 'Others', 'Others', 40),
  ('occupation', 'Civil Servant', 'Civil Servant', 10),
  ('occupation', 'Business/Professional', 'Business/Professional', 20),
  ('occupation', 'Artisan', 'Artisan', 30),
  ('occupation', 'Farmer', 'Farmer', 40),
  ('occupation', 'Small Scale Business/Self-Employed', 'Small Scale Business / Self-Employed', 50),
  ('occupation', 'Market Woman', 'Market Woman', 60),
  ('occupation', 'Road Transport Worker', 'Road Transport Worker', 70),
  ('occupation', 'Unemployed', 'Unemployed', 80),
  ('occupation', 'Student', 'Student', 90),
  ('occupation', 'Gospel Minister', 'Gospel Minister', 100),
  ('occupation', 'Imam', 'Imam', 110),
  ('digital_skills', 'High', 'High', 10),
  ('digital_skills', 'Average', 'Average', 20),
  ('digital_skills', 'None', 'None', 30),
  ('mobilization_skills', 'High', 'High', 10),
  ('mobilization_skills', 'Average', 'Average', 20),
  ('mobilization_skills', 'None', 'None', 30)
on conflict (field, value) do nothing;

-- Done. Open form-options.html, sign in, and manage your choices.
