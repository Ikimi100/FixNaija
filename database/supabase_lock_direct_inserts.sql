-- =====================================================================
--  FixNaija — LOCK THE FORMS BEHIND THE BOT CHECK  (optional, last step)
--
--  ⚠ RUN THIS ONLY AFTER the Cloudflare Turnstile setup in
--    docs/FORM-PROTECTION-SETUP.md is finished AND you have made one test
--    registration, one test report and one test volunteer application
--    on the live site that all worked.
--
--  WHAT THIS DOES
--   Until now anyone holding the public key could write straight into
--   your tables, skipping the website (and the bot check). After this,
--   the ONLY way in is through the "secure-submit" edge function, which
--   refuses anything that did not pass Cloudflare Turnstile.
--
--  If forms ever stop working after this, run the UNDO block at the
--  bottom — it puts things back exactly as they were.
-- =====================================================================

begin;

drop policy if exists "Public can register"           on public.registrations;
drop policy if exists "Public can report issues"      on public.community_reports;
revoke insert on public.registrations     from anon, authenticated;
revoke insert on public.community_reports from anon, authenticated;

do $$
begin
  if to_regclass('public.volunteers') is not null then
    execute 'drop policy if exists "Public can apply to volunteer" on public.volunteers';
    execute 'revoke insert on public.volunteers from anon, authenticated';
  end if;
  if to_regclass('public.pu_agents') is not null then
    execute 'drop policy if exists "Public can sign up as agent" on public.pu_agents';
    execute 'revoke insert on public.pu_agents from anon, authenticated';
  end if;
end $$;

commit;


-- ---------- UNDO · reopen direct submissions (only if something broke) -----
-- begin;
-- create policy "Public can register"      on public.registrations     for insert to anon, authenticated with check (true);
-- create policy "Public can report issues" on public.community_reports for insert to anon, authenticated with check (true);
-- grant insert on public.registrations, public.community_reports to anon, authenticated;
-- create policy "Public can apply to volunteer" on public.volunteers for insert to anon, authenticated
--   with check (consent = true and status = 'new' and admin_notes is null);
-- grant insert on public.volunteers to anon, authenticated;
-- create policy "Public can sign up as agent" on public.pu_agents for insert to anon, authenticated
--   with check (consent = true and status = 'new' and admin_notes is null);
-- grant insert on public.pu_agents to anon, authenticated;
-- commit;
