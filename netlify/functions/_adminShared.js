/* eslint-disable no-undef */
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

function json(statusCode, body) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
    body: JSON.stringify(body),
  };
}

export function hashKey(key) {
  return crypto
    .createHash("sha256")
    .update(String(key || ""))
    .digest("hex");
}

export function getSupabaseAdmin() {
  const url = process.env.VITE_SUPABASE_URL;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRole) return null;

  return createClient(url, serviceRole, {
    auth: { persistSession: false },
  });
}

export function requireAdminKey(event) {
  const expected = (process.env.ADMIN_REVIEW_KEY || "").trim();
  if (!expected) {
    return json(500, { ok: false, error: "Admin key not configured" });
  }

  const provided =
    event.headers?.["x-admin-key"] ||
    event.headers?.["X-Admin-Key"] ||
    event.queryStringParameters?.key ||
    "";

  if (!provided) return json(401, { ok: false, error: "Unauthorized" });

  const ok =
    crypto.timingSafeEqual(
      Buffer.from(hashKey(provided)),
      Buffer.from(hashKey(expected)),
    ) || false;

  if (!ok) return json(401, { ok: false, error: "Unauthorized" });
  return null;
}

export { json };
