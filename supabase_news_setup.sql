-- ============================================================
-- FixNaija Movement — Latest News system
-- Run this ONCE in your Supabase project:
--   Dashboard → SQL Editor → New query → paste → Run
-- ============================================================

-- gen_random_uuid()
create extension if not exists pgcrypto;

-- ---------- Table ----------
create table if not exists public.news (
  id             uuid primary key default gen_random_uuid(),
  title          text not null,
  slug           text unique not null,
  category       text default 'Update',
  excerpt        text,
  body           text,                       -- one paragraph per line break
  image_url      text,                       -- e.g. images/news-774-network.jpg  OR  a full https URL
  author         text default 'FixNaija Movement',
  published_date date default current_date,
  featured       boolean default false,      -- TRUE = show on homepage timeline
  published      boolean default true,       -- FALSE = hidden draft
  created_at     timestamptz default now(),
  updated_at     timestamptz default now()
);

create index if not exists news_feed_idx
  on public.news (published, featured, published_date desc);

-- keep updated_at fresh
create or replace function public.set_news_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists news_updated_at on public.news;
create trigger news_updated_at
  before update on public.news
  for each row execute function public.set_news_updated_at();

-- ---------- Row Level Security ----------
alter table public.news enable row level security;

-- Anyone (the public website) can read PUBLISHED news only
drop policy if exists "Public read published news" on public.news;
create policy "Public read published news" on public.news
  for select using (published = true);

-- Logged-in admins (Supabase Auth) can create / edit / delete everything
drop policy if exists "Authenticated manage news" on public.news;
create policy "Authenticated manage news" on public.news
  for all to authenticated using (true) with check (true);

-- ---------- Seed: the 3 existing homepage stories ----------
insert into public.news (title, slug, category, excerpt, body, image_url, published_date, featured, published)
values
(
  'FixNaija Launches 774 LGA Network',
  '774-lga-network',
  'Milestone',
  'We have officially activated grassroots coordinators in all 774 Local Government Areas, creating the largest citizen-led accountability network in Nigeria''s history.',
  'In a historic step for grassroots organising in Nigeria, the FixNaija Movement has officially activated coordinators in all 774 Local Government Areas across the 36 states and the Federal Capital Territory.

The milestone caps months of painstaking ward-by-ward outreach, with volunteers travelling to market squares, motor parks, places of worship and village halls to identify and train credible community members willing to lead locally.

"This is not about politics — it is about ownership," said one of the national coordinators at the announcement. "For the first time, every single Local Government Area in Nigeria has a named, reachable FixNaija contact whose only job is to listen to residents and push for things that actually work."

Each LGA network is anchored by a coordinator and a small team of ward organisers. Together they run community town halls, document failing public projects, help residents understand their civic rights, and channel verified complaints to the people responsible for fixing them.

The 774 network now forms the backbone of FixNaija''s accountability work. In the coming weeks, every LGA team will receive a starter pack covering safeguarding, non-partisanship, and how to report a community issue through the movement''s digital tools.',
  'images/news-774-network.jpg',
  '2026-06-05', true, true
),
(
  'Youth Leaders Trained in Abuja',
  'youth-leaders-abuja',
  'Training',
  'Over 300 young community organizers completed intensive training on civic monitoring, digital advocacy, and peaceful mobilization at our Abuja leadership academy.',
  'More than 300 young Nigerians from across the federation gathered in Abuja this week for an intensive leadership programme designed to turn passion into disciplined, peaceful civic action.

Over several days at the FixNaija Leadership Academy, participants worked through practical sessions on civic monitoring, how to document a stalled public project, the basics of the Freedom of Information process, digital advocacy that avoids misinformation, and — crucially — how to organise gatherings that stay peaceful and lawful.

The cohort was deliberately diverse: students, traders, artisans, teachers and first-time organisers, drawn from every geopolitical zone. Many had never received any formal training in advocacy before.

"We are not raising a crowd, we are raising leaders," a facilitator told the room. "A leader knows the law, keeps records, tells the truth, and protects the people who follow them."

Graduates return to their states as certified FixNaija organisers, ready to set up monitoring teams in their own communities and mentor the next wave of volunteers. The academy plans to run regional editions so that training is never more than a day''s journey away from any willing Nigerian.',
  'images/news-youth-leaders.jpg',
  '2026-06-08', true, true
),
(
  'Community Project Tracking Begins',
  'community-project-tracking',
  'Accountability',
  'Our new digital platform lets citizens photograph, geotag, and report on local government projects — bringing transparency to every ward in Nigeria.',
  'FixNaija has begun rolling out community project tracking — a simple but powerful way for ordinary Nigerians to hold public projects to account using nothing more than the phone in their pocket.

Through the movement''s reporting tool, residents can photograph a road, borehole, school block or health centre, attach its location, and describe what they see: completed, abandoned, substandard, or never started. Each report is tied to a ward, so patterns become impossible to ignore.

The idea is disarmingly simple. Budgets are announced and contracts are awarded, but too often no one checks whether the work was ever done. By turning thousands of residents into honest witnesses, FixNaija is building a living, ward-level picture of what is really happening on the ground.

Early submissions are already coming in from pilot LGAs, ranging from proudly completed community projects to long-abandoned sites that swallowed public money. Verified reports are compiled and shared with the relevant authorities, with follow-ups tracked publicly.

"Sunlight is the best disinfectant," said a project lead. "When a community can show, with a photo and a date, exactly what was promised and what was delivered, excuses run out very quickly."

Residents who want to flag an issue in their area can do so through the Report an Issue page, and every coordinator across the 774 LGA network has been trained to help neighbours file accurate, respectful reports.',
  'images/news-project-tracking.jpg',
  '2026-06-10', true, true
)
on conflict (slug) do nothing;

-- Done. Your homepage will now show every row where featured = true AND published = true.
