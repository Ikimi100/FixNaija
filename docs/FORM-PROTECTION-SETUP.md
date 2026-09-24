# FixNaija — form protection, volunteers, agents & backups: setup

This covers the register, report, volunteer and Protect the vote forms, and the automatic backups. **Part 1 is needed now** (the volunteer form saves nothing until you do it). Part 2 is the stronger bot check. It is optional, and nothing changes until you switch it on.

This folder (`docs/`), `database/` and `supabase/` stay in GitHub but are never put on the live website (see `.vercelignore`).

---

## Part 1 — run the database scripts (about 5 minutes)

Supabase → your project → **SQL Editor** → **New query**. For each file below, open it, copy everything, paste, and click **Run**. Do them in this order:

| # | File | What it does |
|---|------|--------------|
| 1 | `database/supabase_security_hardening.sql` | *Skip if you already ran it.* Makes supporters' data admin-only. |
| 2 | `database/supabase_volunteers_setup.sql` | Creates the **volunteers** table the volunteer form saves to. |
| 3 | `database/supabase_form_protection.sql` | Allows **one registration per phone number**, sets size limits on form fields, and makes the report-video bucket accept videos only (max 100 MB). |
| 4 | `database/supabase_pu_agents_setup.sql` | Creates the **pu_agents** table for the Protect the vote page (`protect-the-vote.html`), plus the polling-unit coverage numbers on the admin page. |
| 5 | `database/supabase_backups_setup.sql` | **Automatic weekly backups.** Every Sunday at 3am (Nigeria time) it copies your supporter tables into a private part of the database and keeps the last 4 copies. It also takes the first copy straight away. |

Every script is safe to run again.

Then: **Authentication → Sign In / Providers → Email → turn OFF "Allow new users to sign up"** (if you haven't already).

**Check it worked:**

- Open `volunteer.html`, apply with your own details, and it should say *"Thank you! Your application is in."*
- In `admin.html`, the new **Volunteers** section (button in the top bar) should show your application.
- Sign up on `protect-the-vote.html`. You should appear in the admin page's **Protect the vote** section, with your polling unit counted in the coverage.
- The admin page's **Data & backups** card should show the date of the first automatic copy. Press **Download full copy** now and then, and keep the file somewhere private (not in GitHub).

> If the backups script warns that it could not switch on pg_cron: in Supabase, go to **Integrations → Cron**, enable it, then run `supabase_backups_setup.sql` again.
- Register twice with the same phone number. The second time, the page should say *"This phone number is already registered."*

> To allow family members to share one phone number again later, run this in the SQL Editor:
> `drop trigger if exists registrations_one_per_phone on public.registrations;`

---

## Part 2 — Cloudflare Turnstile bot check (optional, about 20 minutes)

Part 1 already stops simple bots (a hidden trap field plus a "too fast to be human" check). But a determined person can still send fake sign-ups straight to Supabase with a script. Turnstile blocks that. It's free, and most real visitors never see a puzzle.

### A. Get your two keys from Cloudflare
1. Create a free account at <https://dash.cloudflare.com/sign-up>. Your domain does **not** need to be on Cloudflare.
2. In the dashboard, open **Turnstile**, then click **Add widget**.
3. Fill in:
   - **Widget name:** `FixNaija forms`
   - **Hostnames:** `fixnaijamovement.com.ng` and `www.fixnaijamovement.com.ng`. Add your `*.vercel.app` address too if people use it.
   - **Widget mode:** **Managed** (recommended).
4. Click **Create**. Copy the **Site key** (public) and the **Secret key** (private, never put it in a website file).

### B. Deploy the checker (same steps as the Ask FixNaija function)
In a terminal opened in the website folder:

```bash
npx supabase login
npx supabase link --project-ref bcdscsjqiqnzsthntutb
npx supabase secrets set TURNSTILE_SECRET_KEY=paste-your-SECRET-key-here
npx supabase secrets set ALLOWED_HOSTNAMES=www.fixnaijamovement.com.ng,fixnaijamovement.com.ng
npx supabase functions deploy secure-submit --no-verify-jwt
```

### C. Switch it on in the website
Open `assets/fixnaija-guard.js` and paste the **Site key** between the quotes near the top:

```js
var TURNSTILE_SITE_KEY = '0x4AAAAAAA...';
```

Commit and push to GitHub, then wait for the site to deploy.

### D. Test on the live site
Make one test **registration**, one test **report** and one test **volunteer application**. All three should succeed and show up in `admin.html`. You can delete the test rows in Supabase afterwards.

### E. Lock the door (last step)
Only once D works, run `database/supabase_lock_direct_inserts.sql` in the SQL Editor. After this, **the only way into your tables is through the bot check**.

If a form ever stops working after that, run the **UNDO** block at the bottom of the same file. It puts things back as they were.

---

## Good to know
- The bot check changes **how** a form is delivered, not **what** it saves. Registrations still arrive with exactly the same fields, so the admin counts are unaffected.
- If you add a new field to a form later, add its column name to the list at the top of `supabase/functions/secure-submit/index.ts` and deploy the function again. Otherwise that one field is dropped.
- To switch the bot check off, set `TURNSTILE_SITE_KEY` back to `''`. If you already ran step E, run its UNDO block first.
