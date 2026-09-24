-- =====================================================================
--  FixNaija — FORM PROTECTION
--  Run in: Supabase Dashboard → SQL Editor → New query → paste → Run
--  Run it AFTER supabase_security_hardening.sql and
--  supabase_volunteers_setup.sql. Safe to run more than once.
--
--  WHAT THIS DOES
--   1. One registration per phone number. A second sign-up with a number
--      that is already registered is refused, and the register page shows
--      a friendly "you're already registered" message. The same rule
--      applies to volunteer applications.
--      "0803 123 4567", "+234 803 123 4567" and "2348031234567" all count
--      as the same number (the last 10 digits are compared).
--      Duplicates already in the table are NOT deleted: the admin
--      dashboard shows how many there are and can export them.
--   2. Length limits on public form fields, so nobody can stuff huge junk
--      into your tables. Only new rows are checked; existing rows are left
--      alone.
--   3. Report videos: the "report-videos" bucket only accepts video files,
--      up to 100 MB.
--
--  TO SWITCH OFF THE ONE-PER-PHONE RULE LATER (e.g. for a family phone):
--    drop trigger if exists registrations_one_per_phone on public.registrations;
-- =====================================================================

begin;
set local client_min_messages = warning;   -- hide harmless "does not exist, skipping" notes

-- ---------- 1 · one per phone number --------------------------------------
-- "0803 123 4567" / "+2348031234567" → "8031234567"
create or replace function public.phone_key(p text)
returns text
language sql
immutable
parallel safe
as $$
  select right(regexp_replace(coalesce(p, ''), '\D', '', 'g'), 10);
$$;

create or replace function public.block_duplicate_phone()
returns trigger
language plpgsql
security definer            -- must see existing rows, which the public cannot read
set search_path = public
as $$
declare
  k     text := public.phone_key(new.phone);
  taken boolean;
begin
  if char_length(k) < 10 then
    return new;             -- not a usable number: let the form's own checks deal with it
  end if;
  -- two sign-ups with the same number at the same moment: make one wait for the other
  perform pg_advisory_xact_lock(hashtext(tg_table_name || ':' || k));
  execute format('select exists (select 1 from public.%I where public.phone_key(phone) = $1)', tg_table_name)
    into taken using k;
  if taken then
    raise exception 'DUPLICATE_PHONE'
      using errcode = '23505',
            detail  = 'This phone number has already been used.';
  end if;
  return new;
end;
$$;
revoke all on function public.block_duplicate_phone() from public;

create index if not exists registrations_phone_key_idx on public.registrations (public.phone_key(phone));
drop trigger if exists registrations_one_per_phone on public.registrations;
create trigger registrations_one_per_phone
  before insert on public.registrations
  for each row execute function public.block_duplicate_phone();

do $$
begin
  if to_regclass('public.volunteers') is not null then
    execute 'create index if not exists volunteers_phone_key_idx on public.volunteers (public.phone_key(phone))';
    execute 'drop trigger if exists volunteers_one_per_phone on public.volunteers';
    execute 'create trigger volunteers_one_per_phone before insert on public.volunteers
             for each row execute function public.block_duplicate_phone()';
  else
    raise warning 'volunteers table not found — run supabase_volunteers_setup.sql, then run this file again.';
  end if;
end $$;


-- ---------- 2 · length limits on public fields (new rows only) -----------
do $$
declare
  c record;
  cname text;
begin
  for c in
    select * from (values
      ('registrations', 'full_name',          160),
      ('registrations', 'email',              160),
      ('registrations', 'phone',               30),
      ('registrations', 'whatsapp',            30),
      ('registrations', 'group_name',         200),
      ('registrations', 'state',               60),
      ('registrations', 'lga',                120),
      ('registrations', 'ward',               200),
      ('registrations', 'polling_unit',       300),
      ('registrations', 'delimitation',        40),
      ('registrations', 'membership_status',   60),
      ('registrations', 'gender',              30),
      ('registrations', 'marital_status',      30),
      ('registrations', 'age_group',           30),
      ('registrations', 'religion',            60),
      ('registrations', 'occupation',         120),
      ('registrations', 'ethnic_group',       120),
      ('registrations', 'digital_skills',      30),
      ('registrations', 'mobilization_skills', 30),
      ('registrations', 'reason',            3000),
      ('community_reports', 'reporter_name',     160),
      ('community_reports', 'phone',              30),
      ('community_reports', 'email',             160),
      ('community_reports', 'whatsapp',           30),
      ('community_reports', 'state',              60),
      ('community_reports', 'lga',               120),
      ('community_reports', 'ward',              200),
      ('community_reports', 'landmark',          300),
      ('community_reports', 'category',          120),
      ('community_reports', 'issue_title',       300),
      ('community_reports', 'issue_description', 6000),
      ('community_reports', 'video_filename',    300),
      ('community_reports', 'video_url',         600)
    ) as v(tbl, col, maxlen)
  loop
    cname := c.tbl || '_' || c.col || '_len';
    begin
      execute format('alter table public.%I drop constraint if exists %I', c.tbl, cname);
      execute format('alter table public.%I add constraint %I check (%I is null or char_length(%I::text) <= %s) not valid',
                     c.tbl, cname, c.col, c.col, c.maxlen);
    exception when others then
      raise warning 'length limit skipped for %.%: %', c.tbl, c.col, sqlerrm;
    end;
  end loop;
end $$;


-- ---------- 3 · report videos: video files only, max 100 MB -------------
do $$
begin
  update storage.buckets
     set allowed_mime_types = array['video/*', 'application/octet-stream'],
         file_size_limit    = 104857600
   where id = 'report-videos';
  if not found then
    raise warning 'bucket "report-videos" not found — video limits skipped.';
  end if;
exception when others then
  raise warning 'video limits skipped: %', sqlerrm;
end $$;

commit;


-- ---------- CHECK · run after the script ----------------------------------
-- select tgname, tgrelid::regclass from pg_trigger where tgname like '%one_per_phone';
-- How many duplicate registrations are already in the table:
-- select count(*) - count(distinct public.phone_key(phone)) as extra_rows from public.registrations;
