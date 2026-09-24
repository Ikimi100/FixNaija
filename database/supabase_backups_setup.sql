-- =====================================================================
--  FixNaija — AUTOMATIC WEEKLY BACKUPS
--  Run in: Supabase Dashboard → SQL Editor → New query → paste → Run
--  Needs: supabase_security_hardening.sql (for is_admin()).
--
--  WHAT THIS DOES
--   • Every Sunday at 03:00 Nigeria time (02:00 GMT) it copies your
--     supporter tables into a private "backups" area of the database:
--     registrations, community reports, volunteers, polling unit agents,
--     news, form options and the admin list.
--   • It keeps the newest 4 weekly copies and removes older ones.
--   • It takes the first copy straight away.
--   • The backups area is NOT reachable from the website or the public key.
--     Only you (in the Supabase dashboard) and the admin page's
--     "Back up now" button can use it.
--
--  IMPORTANT: these copies live in the same Supabase project. They protect
--  you from mistakes (rows deleted or overwritten), not from losing the whole
--  project. For that, also use "Download full copy" on the admin page from
--  time to time and keep the file somewhere safe (not in the GitHub repo).
--
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

create schema if not exists backups;
revoke all on schema backups from public, anon, authenticated;

create table if not exists backups.snapshots (
  id         bigserial primary key,
  taken_at   timestamptz not null default now(),
  suffix     text not null unique,
  row_counts jsonb not null default '{}'::jsonb
);
revoke all on backups.snapshots from public, anon, authenticated;
alter table backups.snapshots enable row level security;   -- extra lock: no policies = no access from the website keys

-- copy every supporter table into backups.<table>_<date>
create or replace function backups.take_snapshot(keep int default 4)
returns jsonb
language plpgsql
security definer
set search_path = public, backups
as $$
declare
  tables text[] := array['registrations','community_reports','volunteers','pu_agents','news','form_options','admins'];
  sfx    text   := to_char(clock_timestamp() at time zone 'Africa/Lagos', 'YYYYMMDD_HH24MISS');
  t      text;
  n      bigint;
  counts jsonb  := '{}'::jsonb;
  old    record;
begin
  foreach t in array tables loop
    if to_regclass('public.' || t) is not null then
      execute format('create table backups.%I as table public.%I', t || '_' || sfx, t);
      execute format('alter table backups.%I enable row level security', t || '_' || sfx);
      execute format('select count(*) from backups.%I', t || '_' || sfx) into n;
      counts := counts || jsonb_build_object(t, n);
    end if;
  end loop;
  insert into backups.snapshots (suffix, row_counts) values (sfx, counts);

  -- keep only the newest `keep` copies
  for old in select * from backups.snapshots order by taken_at desc offset greatest(keep, 1) loop
    foreach t in array tables loop
      execute format('drop table if exists backups.%I', t || '_' || old.suffix);
    end loop;
    delete from backups.snapshots where id = old.id;
  end loop;
  return counts;
end;
$$;
revoke all on function backups.take_snapshot(int) from public, anon, authenticated;

-- for the admin page: list of copies (admins only)
create or replace function public.backup_status()
returns table (taken_at timestamptz, row_counts jsonb)
language plpgsql
stable
security definer
set search_path = public, backups
as $$
begin
  if not public.is_admin() then
    raise exception 'admins only' using errcode = '42501';
  end if;
  return query select s.taken_at, s.row_counts from backups.snapshots s order by s.taken_at desc;
end;
$$;
revoke all on function public.backup_status() from public, anon;
grant execute on function public.backup_status() to authenticated;

-- for the admin page: "Back up now" (admins only)
create or replace function public.backup_now()
returns jsonb
language plpgsql
security definer
set search_path = public, backups
as $$
begin
  if not public.is_admin() then
    raise exception 'admins only' using errcode = '42501';
  end if;
  return backups.take_snapshot(4);
end;
$$;
revoke all on function public.backup_now() from public, anon;
grant execute on function public.backup_now() to authenticated;

commit;

-- ---------- the weekly timer (Supabase Cron / pg_cron) ----------------------
do $$
begin
  begin
    create extension if not exists pg_cron;
  exception when others then
    raise warning 'Could not switch on pg_cron here (%). Turn it on in Dashboard → Integrations → Cron, then run this file again.', sqlerrm;
    return;
  end;
  -- Sunday 02:00 GMT = 03:00 in Nigeria. Re-running replaces the same job.
  perform cron.schedule('fixnaija-weekly-backup', '0 2 * * 0', 'select backups.take_snapshot(4)');
end $$;

-- ---------- the first copy, right now -----------------------------------------
select backups.take_snapshot(4) as first_backup;


-- =====================================================================
--  HANDY QUERIES (run on their own when needed)
-- =====================================================================
-- List your copies:
--   select taken_at, row_counts from backups.snapshots order by taken_at desc;
--
-- See the weekly job and its recent runs:
--   select jobname, schedule, active from cron.job;
--   select status, start_time, return_message from cron.job_run_details order by start_time desc limit 5;
--
-- RESTORE registrations that were deleted by mistake (put the copy's date in).
-- The one-per-phone rule is paused for the restore, then switched back on:
--   alter table public.registrations disable trigger registrations_one_per_phone;
--   insert into public.registrations
--   select * from backups.registrations_20260928_030000 b
--   where not exists (select 1 from public.registrations r where r.id = b.id);
--   alter table public.registrations enable trigger registrations_one_per_phone;
--
-- Stop the weekly job:
--   select cron.unschedule('fixnaija-weekly-backup');
