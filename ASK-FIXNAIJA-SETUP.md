# Ask FixNaija — Setup Guide (make the AI live)

The `ask-fixnaija.html` page works **right now in demo mode** (canned answers). To make it a real, live AI assistant, deploy the included Supabase Edge Function and add your API key. ~15 minutes.

You already use Supabase for the site, so this fits your existing stack. Your secret API key lives **only on the server** — it is never exposed in the website code.

---

## What you'll need
- The Supabase CLI installed (`npm install -g supabase`)
- Your existing Supabase project
- An API key from **either** Anthropic (Claude) **or** OpenAI

## Steps

**1. Log in and link your project**
```
supabase login
supabase link --project-ref YOUR_PROJECT_REF
```
(Find `YOUR_PROJECT_REF` in your Supabase dashboard URL.)

**2. Add your secret key** (pick one provider)
```
supabase secrets set ANTHROPIC_API_KEY=sk-ant-xxxxxxxx
```
or
```
supabase secrets set OPENAI_API_KEY=sk-xxxxxxxx
```

**3. Deploy the function** (the code is already in `supabase/functions/ask-fixnaija/`)
```
supabase functions deploy ask-fixnaija --no-verify-jwt
```

**4. Connect the website**
Open `ask-fixnaija.html`, find the `CONFIG` block near the bottom, and fill in:
```js
var CONFIG = {
  SUPABASE_URL: "https://YOUR_PROJECT_REF.supabase.co",
  SUPABASE_ANON_KEY: "your-public-anon-key"   // Settings → API → anon/public key
};
```
The anon key is safe to put in the website — it's the public key. Your AI key stays secret on the server.

**5. Save and reload.** The status dot changes from "Demo mode" to "Online" and the assistant gives full, live answers.

---

## Notes & good next steps
- **Cost control:** the function caps history to the last 12 messages and replies to 700 tokens. The default model is a small, cheap one (Claude Haiku / GPT-4o-mini) — fine for civic Q&A.
- **Abuse protection (recommended later):** because the function is public (`--no-verify-jwt`), consider adding simple rate-limiting or a Cloudflare Turnstile check before launch.
- **Tuning the assistant:** edit `SYSTEM_PROMPT` in `index.ts` to change its tone, scope, or add FixNaija-specific facts, then redeploy.
- **Security:** never paste your `ANTHROPIC_API_KEY` / `OPENAI_API_KEY` into any `.html` or commit it to git. It belongs only in `supabase secrets`.
