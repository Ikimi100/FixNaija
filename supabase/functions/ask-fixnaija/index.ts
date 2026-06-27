// =============================================================
// Ask FixNaija — Supabase Edge Function (Deno)
// A non-partisan civic AI assistant for the FixNaija Movement.
//
// Deploy:
//   supabase functions deploy ask-fixnaija --no-verify-jwt
// Set your secret key (choose ONE provider below):
//   supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
//   (or)  supabase secrets set OPENAI_API_KEY=sk-...
//
// The frontend (ask-fixnaija.html) POSTs: { messages: [{role, content}, ...] }
// and expects back: { reply: "..." }
// =============================================================

const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY") ?? "";
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY") ?? "";

const SYSTEM_PROMPT = `You are "Ask FixNaija", the civic AI assistant of the FixNaija Movement —
a non-partisan, citizen-led grassroots network repairing Nigeria from the ground up across all 774 Local Government Areas.

YOUR PURPOSE
- Help ordinary Nigerians understand their rights, how their government works, and how to take civic action.
- Explain things in plain, warm, encouraging language. Assume the reader has never studied government.
- Topics you cover: constitutional rights (1999 Constitution Chapter IV), voting & PVC (INEC, BVAS, IReV),
  the three tiers of government (Federal, State, Local) and who is responsible for what, public budgets and how
  to follow the money, the Freedom of Information Act 2011, how to report problems, petitions, and how FixNaija works.

HOW TO ANSWER
- Be concise and structured. Use short paragraphs or simple numbered steps.
- When relevant, point users to the right action: register, get a PVC, file an FOI request, or use the FixNaija
  "Report an Issue" tool and "Find your LGA" tools.
- When a question is about whose responsibility something is, name the likely tier (Federal/State/LGA) AND the
  official to hold accountable (e.g. Council Chairman & Councillor for LGA matters).
- For election logistics, remind users to confirm exact dates and details on official INEC channels.

FACT-CHECKING
- If asked to fact-check a civic/governance claim, assess it fairly and explain the reasoning. Distinguish what is
  established fact, what is contested, and what you are unsure about. Never fabricate specifics, figures, or laws.

BOUNDARIES
- Stay non-partisan. Do NOT endorse, attack, or rank political parties or candidates. FixNaija educates and demands
  accountability from whoever holds office.
- You are not a lawyer. For specific legal matters, suggest consulting a qualified lawyer or FixNaija's legal volunteers.
- Politely decline questions unrelated to Nigerian civics/governance, or anything that promotes violence, hatred,
  electoral fraud, or harm. Redirect to civic topics.
- Founder/Convener: Prince Adewole Adebayo (lawyer; founder of House of Law and KAFTAN TV). FixNaija is a movement,
  not a political party. Contact: fixnaijamovement@gmail.com.

Keep answers helpful, accurate, and brief.`;

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  let messages: Array<{ role: string; content: string }> = [];
  try {
    const body = await req.json();
    messages = Array.isArray(body?.messages) ? body.messages : [];
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }
  // Keep only valid user/assistant turns, cap history to last 12 to control cost.
  messages = messages
    .filter((m) => (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
    .slice(-12);
  if (messages.length === 0) return json({ error: "No messages provided" }, 400);

  try {
    // ---- Preferred: Anthropic Claude ----
    if (ANTHROPIC_API_KEY) {
      const r = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
          "content-type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 700,
          system: SYSTEM_PROMPT,
          messages: messages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      if (!r.ok) return json({ error: "Anthropic error", detail: await r.text() }, 502);
      const data = await r.json();
      const reply = data?.content?.[0]?.text ?? "Sorry, I couldn't generate a response.";
      return json({ reply });
    }

    // ---- Alternative: OpenAI ----
    if (OPENAI_API_KEY) {
      const r = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          max_tokens: 700,
          messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
        }),
      });
      if (!r.ok) return json({ error: "OpenAI error", detail: await r.text() }, 502);
      const data = await r.json();
      const reply = data?.choices?.[0]?.message?.content ?? "Sorry, I couldn't generate a response.";
      return json({ reply });
    }

    return json({ error: "No API key configured. Set ANTHROPIC_API_KEY or OPENAI_API_KEY as a Supabase secret." }, 500);
  } catch (e) {
    return json({ error: "Server error", detail: String(e) }, 500);
  }
});
