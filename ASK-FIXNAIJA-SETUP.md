# Ask FixNaija — Setup Guide (free, with Google Gemini)

The `ask-fixnaija.html` page works **right now in demo mode** (canned answers). To make it a real, live AI assistant **for free**, get a Google Gemini API key (no credit card), deploy the included Supabase Edge Function, and connect it. ~15–20 minutes.

Your secret API key lives **only on the server** (Supabase) — it is never exposed in the website code.

---

## Part A — Get a FREE Gemini API key (no card)

1. Go to **Google AI Studio**: https://aistudio.google.com/app/apikey (sign in with any Google account).
2. Click **"Create API key"**.
3. Choose **"Create API key in new project"** (this keeps it on a free-only project).
4. Copy the key — it starts with **`AIza...`**. Keep it private.

> ⚠️ **Do NOT enable billing on that Google project.** On Gemini, the moment a project has billing enabled, the free tier disappears for it. Leave it free-only.
>
> Note: on the free tier, Google may use inputs/outputs to improve their models — fine for public civic Q&A, but don't put private data through it.

---

## Part B — Deploy the function (Supabase)

You'll need **Node.js** installed (check with `node -v`). Open **PowerShell** and go to your site folder:
```
cd "C:\Users\HP\Downloads\FixNaija Website"
```

**1. Log in to Supabase**
```
npx supabase login
```

**2. Link your project** (find YOUR_PROJECT_REF in your Supabase dashboard URL)
```
npx supabase link --project-ref YOUR_PROJECT_REF
```

**3. Add your Gemini key as a secret** (server-side only)
```
npx supabase secrets set GEMINI_API_KEY=AIza-your-key-here
```

**4. Deploy the function** (code is already in `supabase/functions/ask-fixnaija/`)
```
npx supabase functions deploy ask-fixnaija --no-verify-jwt
```

---

## Part C — Connect the website

Open `ask-fixnaija.html`, find the `CONFIG` block near the bottom, and fill in both values:
```js
var CONFIG = {
  SUPABASE_URL: "https://YOUR_PROJECT_REF.supabase.co",
  SUPABASE_ANON_KEY: "your-public-anon-key"   // Supabase → Settings → API → anon/public key
};
```
The anon key is safe in the website (it's the public key). Your Gemini key stays secret on the server.

**Save and reload.** The status dot flips from "Demo mode" to "● Online" and the assistant gives live answers.

---

## Free-tier limits (plenty for a movement site)
- Gemini's free Flash models allow roughly **250–1,500 requests/day** — far more than enough for civic Q&A.
- The function already caps history to the last 12 messages and replies to 700 tokens.

## Good to know
- **Model:** defaults to `gemini-2.5-flash`. If Google changes the recommended free model, set a different one without editing code:
  ```
  npx supabase secrets set GEMINI_MODEL=gemini-flash-latest
  npx supabase functions deploy ask-fixnaija --no-verify-jwt
  ```
- **Switching providers later:** the function also supports Anthropic (`ANTHROPIC_API_KEY`) and OpenAI (`OPENAI_API_KEY`). Whichever key is set is used (Gemini takes priority).
- **Abuse protection (recommended before launch):** because the function is public (`--no-verify-jwt`), consider adding simple rate-limiting or a Cloudflare Turnstile check.
- **Tuning the assistant:** edit `SYSTEM_PROMPT` in `index.ts` to change tone/scope, then redeploy.
- **Security:** never paste your `AIza...` key into any `.html` file or commit it to git. It belongs only in `supabase secrets`.
- If you ever exceed the free quota, the page shows an error bubble — ask me to add a graceful fallback to the demo answers so it's never blank.
