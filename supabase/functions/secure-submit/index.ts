// =====================================================================
// FixNaija — secure-submit  (Supabase Edge Function)
//
// The register, report and volunteer forms send their data here once the
// Cloudflare Turnstile bot check is switched on. This function:
//   1. asks Cloudflare whether the visitor passed the bot check,
//   2. keeps only the fields each form is allowed to send,
//   3. saves the row with the server key, and passes Supabase's answer
//      straight back, so the pages behave exactly as before
//      (e.g. the "phone already registered" message still works).
//
// Deploy (from the website folder):
//   npx supabase functions deploy secure-submit --no-verify-jwt
// Secret (from Cloudflare → Turnstile → your widget → Secret key):
//   npx supabase secrets set TURNSTILE_SECRET_KEY=0x4AAAA...
// Optional — only accept tokens issued on your own domains:
//   npx supabase secrets set ALLOWED_HOSTNAMES=www.fixnaijamovement.com.ng,fixnaijamovement.com.ng
//
// Full walkthrough: docs/FORM-PROTECTION-SETUP.md
// =====================================================================

type TableRule = { cols: string[]; fixed?: Record<string, unknown> };

// Only these columns can be written from the public forms.
// If you add a new field to a form, add its column name here too.
const TABLES: Record<string, TableRule> = {
  registrations: {
    cols: [
      "full_name", "email", "phone", "whatsapp", "group_name", "state", "lga", "ward",
      "polling_unit", "delimitation", "membership_status", "gender", "marital_status",
      "age_group", "religion", "occupation", "ethnic_group", "digital_skills",
      "mobilization_skills", "reason",
    ],
  },
  community_reports: {
    cols: [
      "reporter_name", "phone", "email", "whatsapp", "state", "lga", "ward", "landmark",
      "category", "issue_title", "issue_description", "submitted_at", "has_video",
      "video_filename", "video_size", "video_url",
    ],
    fixed: { status: "submitted" },
  },
  volunteers: {
    cols: ["full_name", "email", "phone", "state", "role", "time_commitment", "motivation", "consent"],
    fixed: { status: "new" },
  },
  pu_agents: {
    cols: [
      "full_name", "phone", "whatsapp", "email", "state", "lga", "ward", "polling_unit",
      "delimitation", "role", "registered_here", "experience", "has_smartphone", "consent",
    ],
    fixed: { status: "new" },
  },
};

const VERIFY_URL = Deno.env.get("TURNSTILE_VERIFY_URL") ??
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";
const MAX_BODY = 64 * 1024;

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
};

function reply(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
}

// the server key: new-style secret key if present, otherwise the legacy service_role key
function serverKey(): string {
  const dict = Deno.env.get("SUPABASE_SECRET_KEYS");
  if (dict) {
    try {
      const o = JSON.parse(dict) as Record<string, string>;
      const k = o.default ?? Object.values(o)[0];
      if (k) return String(k);
    } catch { /* fall through */ }
  }
  return Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
}

function clientIp(req: Request): string {
  return req.headers.get("cf-connecting-ip") ??
    (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim();
}

async function passedTurnstile(token: string, ip: string): Promise<{ ok: boolean; codes: string[] }> {
  const secret = Deno.env.get("TURNSTILE_SECRET_KEY");
  if (!secret) return { ok: false, codes: ["missing-secret-on-server"] };
  const form = new URLSearchParams({ secret, response: token });
  if (ip) form.set("remoteip", ip);
  try {
    const r = await fetch(VERIFY_URL, { method: "POST", body: form });
    const out = await r.json() as { success?: boolean; hostname?: string; "error-codes"?: string[] };
    if (!out.success) return { ok: false, codes: out["error-codes"] ?? ["failed"] };
    const allowed = (Deno.env.get("ALLOWED_HOSTNAMES") ?? "")
      .split(",").map((h) => h.trim().toLowerCase()).filter(Boolean);
    if (allowed.length && !allowed.includes(String(out.hostname ?? "").toLowerCase())) {
      return { ok: false, codes: ["hostname-not-allowed"] };
    }
    return { ok: true, codes: [] };
  } catch (_e) {
    return { ok: false, codes: ["verify-unreachable"] };
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });
  if (req.method !== "POST") return reply(405, { code: "METHOD_NOT_ALLOWED" });

  const raw = await req.text();
  if (raw.length > MAX_BODY) return reply(413, { code: "TOO_LARGE" });

  let body: { table?: string; row?: Record<string, unknown>; token?: string };
  try {
    body = JSON.parse(raw);
  } catch {
    return reply(400, { code: "BAD_JSON" });
  }

  const rule = TABLES[String(body.table ?? "")];
  if (!rule) return reply(400, { code: "UNKNOWN_FORM" });
  if (!body.row || typeof body.row !== "object" || Array.isArray(body.row)) {
    return reply(400, { code: "NO_DATA" });
  }
  if (!body.token) return reply(403, { code: "CAPTCHA_REQUIRED", message: "Bot check missing." });

  const check = await passedTurnstile(String(body.token), clientIp(req));
  if (!check.ok) {
    return reply(403, { code: "CAPTCHA_FAILED", message: "Bot check failed.", details: check.codes });
  }

  // keep only allowed, simple values
  const row: Record<string, unknown> = {};
  for (const col of rule.cols) {
    if (!(col in body.row)) continue;
    const v = body.row[col];
    if (v === null || ["string", "number", "boolean"].includes(typeof v)) row[col] = v;
  }
  Object.assign(row, rule.fixed ?? {});

  // report videos must live in this project's own report-videos bucket
  const base = (Deno.env.get("SUPABASE_URL") ?? "").replace(/\/+$/, "");
  if (body.table === "community_reports" && row.video_url != null) {
    const prefix = `${base}/storage/v1/object/public/report-videos/`;
    if (typeof row.video_url !== "string" || !row.video_url.startsWith(prefix)) {
      return reply(400, { code: "BAD_VIDEO_URL" });
    }
  }

  const key = serverKey();
  if (!base || !key) return reply(500, { code: "SERVER_NOT_CONFIGURED" });
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "apikey": key,
    "Prefer": "return=minimal",
  };
  if (key.startsWith("eyJ")) headers["Authorization"] = `Bearer ${key}`; // legacy service_role JWT

  const res = await fetch(`${base}/rest/v1/${body.table}`, {
    method: "POST",
    headers,
    body: JSON.stringify(row),
  });

  // hand Supabase's answer back unchanged (201 on success, 409 DUPLICATE_PHONE, …)
  const text = await res.text();
  return new Response(text || null, {
    status: res.status,
    headers: { ...CORS, "Content-Type": res.headers.get("content-type") ?? "application/json" },
  });
});
