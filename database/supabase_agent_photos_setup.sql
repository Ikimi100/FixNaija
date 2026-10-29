-- =====================================================================
--  FixNaija — PROTECT THE VOTE: agent passport photographs
--  Run in: Supabase Dashboard → SQL Editor → New query → paste → Run
--  Needs: supabase_security_hardening.sql (is_admin) and
--         supabase_pu_agents_setup.sql (the pu_agents table).
--
--  WHAT THIS DOES
--   • Creates a PRIVATE storage bucket, "agent-photos". Photos are never
--     public: only signed-in admins can see them (the admin page asks
--     Supabase for short-lived links).
--   • The sign-up page may only ADD a photo, as a JPEG under 3 MB, at a
--     random name like agents/0b6f…e2.jpg. It cannot list, open, replace
--     or delete anything.
--   • Adds pu_agents.photo_path, and from now on every NEW agent sign-up
--     must point at a photo that was really uploaded (INEC needs a
--     passport photograph for each party agent). Agents who signed up
--     before keep their rows; admins can add their photos later from the
--     admin page.
--
--  ORDER: run this, then push the website straight after (the old sign-up
--  page has no photo field, so it cannot save new agents once this runs).
--  Safe to run more than once.
-- =====================================================================

begin;
set local client_min_messages = warning;

do $$
begin
  if to_regprocedure('public.is_admin()') is null then
    raise exception 'STOP: run database/supabase_security_hardening.sql first (it creates is_admin()).';
  end if;
  if to_regclass('public.pu_agents') is null then
    raise exception 'STOP: run database/supabase_pu_agents_setup.sql first (it creates pu_agents).';
  end if;
end $$;

-- ---------- 1 · the private bucket ------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('agent-photos', 'agent-photos', false, 3145728, array['image/jpeg'])
on conflict (id) do update
  set public = false,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- ---------- 2 · who may do what with the photos ------------------------------
drop policy if exists "Agents add their photo"     on storage.objects;
drop policy if exists "Admins view agent photos"   on storage.objects;
drop policy if exists "Admins replace agent photos" on storage.objects;
drop policy if exists "Admins delete agent photos" on storage.objects;

-- anyone (the sign-up page, or an admin) may ADD one photo at a random name
create policy "Agents add their photo" on storage.objects
  for insert to anon, authenticated
  with check (
    bucket_id = 'agent-photos'
    and name ~ '^agents/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.jpg$'
  );
-- only admins can see, replace or delete them
create policy "Admins view agent photos" on storage.objects
  for select to authenticated
  using (bucket_id = 'agent-photos' and public.is_admin());
create policy "Admins replace agent photos" on storage.objects
  for update to authenticated
  using (bucket_id = 'agent-photos' and public.is_admin())
  with check (bucket_id = 'agent-photos' and public.is_admin());
create policy "Admins delete agent photos" on storage.objects
  for delete to authenticated
  using (bucket_id = 'agent-photos' and public.is_admin());

-- ---------- 3 · pu_agents.photo_path ----------------------------------------
alter table public.pu_agents add column if not exists photo_path text;
alter table public.pu_agents drop constraint if exists pu_agents_photo_path_format;
alter table public.pu_agents add constraint pu_agents_photo_path_format
  check (photo_path is null
         or photo_path ~ '^agents/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.jpg$');

-- does this photo really exist in the bucket? (answers yes/no only)
create or replace function public.agent_photo_exists(p_path text)
returns boolean
language sql
stable
security definer
set search_path = public, storage
as $$
  select exists (
    select 1 from storage.objects o
    where o.bucket_id = 'agent-photos' and o.name = p_path
  );
$$;
revoke all on function public.agent_photo_exists(text) from public;

-- every NEW sign-up needs an uploaded photo (applies to the page and to the
-- secure-submit edge function alike)
create or replace function public.pu_agents_require_photo()
returns trigger
language plpgsql
security definer
set search_path = public, storage
as $$
begin
  if new.photo_path is null or btrim(new.photo_path) = '' then
    raise exception 'PHOTO_REQUIRED' using errcode = 'P0001',
      detail = 'A passport photograph is required for every polling unit agent.';
  end if;
  if not public.agent_photo_exists(new.photo_path) then
    raise exception 'PHOTO_NOT_FOUND' using errcode = 'P0001',
      detail = 'The photo was not uploaded. Please add it again.';
  end if;
  return new;
end;
$$;
revoke all on function public.pu_agents_require_photo() from public;

drop trigger if exists pu_agents_photo_required on public.pu_agents;
create trigger pu_agents_photo_required
  before insert on public.pu_agents
  for each row execute function public.pu_agents_require_photo();

commit;

-- =====================================================================
--  CHECKS (optional)
-- =====================================================================
-- The bucket:            select id, public, file_size_limit, allowed_mime_types from storage.buckets where id = 'agent-photos';
-- Agents with a photo:   select count(*) filter (where photo_path is not null) as with_photo, count(*) as all_agents from public.pu_agents;
--
--  UNDO (makes the photo optional again; keeps photos and the column):
--    drop trigger if exists pu_agents_photo_required on public.pu_agents;
