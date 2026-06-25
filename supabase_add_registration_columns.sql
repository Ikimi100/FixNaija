-- FixNaija — add new registration columns
-- Run this in Supabase: Dashboard > SQL Editor > New query > paste > Run.
-- Safe to re-run (uses IF NOT EXISTS).

ALTER TABLE registrations
  ADD COLUMN IF NOT EXISTS membership_status    text,
  ADD COLUMN IF NOT EXISTS gender               text,
  ADD COLUMN IF NOT EXISTS marital_status       text,
  ADD COLUMN IF NOT EXISTS age_group            text,
  ADD COLUMN IF NOT EXISTS religion             text,
  ADD COLUMN IF NOT EXISTS occupation           text,
  ADD COLUMN IF NOT EXISTS ethnic_group         text,
  ADD COLUMN IF NOT EXISTS digital_skills       text,
  ADD COLUMN IF NOT EXISTS mobilization_skills  text;
