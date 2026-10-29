const JSON_HEADERS = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store",
  "x-content-type-options": "nosniff"
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: JSON_HEADERS });
}

function validKey(value) {
  return typeof value === "string" &&
    value.length >= 16 &&
    value.length <= 128 &&
    /^[A-Za-z0-9._~-]+$/.test(value) &&
    value !== "default";
}

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const key = url.searchParams.get("key") || "";
  if (!validKey(key)) return json({ ok: false, error: "A private sync key of 16–128 allowed characters is required." }, 400);
  if (!env.MINDFLOW_KV) return json({ ok: false, error: "Cloud sync is not configured. Bind a KV namespace named MINDFLOW_KV." }, 503);

  try {
    const record = await env.MINDFLOW_KV.get(`user:${key}`, { type: "json" });
    if (!record) return json({ ok: true, source: "cloudflare-kv", data: null });
    return json({ ok: true, source: "cloudflare-kv", data: record });
  } catch {
    return json({ ok: false, error: "Unable to read synced data." }, 500);
  }
}

export async function onRequestPost({ request, env }) {
  const contentType = request.headers.get("content-type") || "";
  if (!contentType.toLowerCase().includes("application/json")) {
    return json({ ok: false, error: "Content-Type must be application/json." }, 415);
  }
  const declaredLength = Number(request.headers.get("content-length") || 0);
  if (declaredLength > 100 * 1024) return json({ ok: false, error: "Payload exceeds 100 KB." }, 413);

  let body;
  try {
    const raw = await request.text();
    if (raw.length > 100 * 1024) return json({ ok: false, error: "Payload exceeds 100 KB." }, 413);
    body = JSON.parse(raw);
  } catch {
    return json({ ok: false, error: "Invalid JSON body." }, 400);
  }

  const key = body && body.key;
  if (!validKey(key)) return json({ ok: false, error: "A private sync key of 16–128 allowed characters is required." }, 400);
  if (!body.state || typeof body.state !== "object" || Array.isArray(body.state)) {
    return json({ ok: false, error: "A valid state object is required." }, 400);
  }
  if (!env.MINDFLOW_KV) return json({ ok: false, error: "Cloud sync is not configured. Bind a KV namespace named MINDFLOW_KV." }, 503);

  try {
    const record = { state: body.state, updatedAt: new Date().toISOString() };
    await env.MINDFLOW_KV.put(`user:${key}`, JSON.stringify(record), { expirationTtl: 60 * 60 * 24 * 365 });
    return json({ ok: true, stored: "cloudflare-kv", updatedAt: record.updatedAt });
  } catch {
    return json({ ok: false, error: "Unable to save synced data." }, 500);
  }
}
