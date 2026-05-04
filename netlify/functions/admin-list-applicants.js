import { getSupabaseAdmin, json, requireAdminKey } from "./_adminShared.js";

export const handler = async (event) => {
  const denied = requireAdminKey(event);
  if (denied) return denied;

  const supabase = getSupabaseAdmin();
  if (!supabase)
    return json(500, { ok: false, error: "Supabase not configured" });

  if (event.httpMethod !== "GET") {
    return json(405, { ok: false, error: "Method not allowed" });
  }

  const status = String(
    event.queryStringParameters?.status || "pending",
  ).trim();

  const { data, error } = await supabase
    .from("applicants")
    .select("id, created_at, name, email, phone, craft, links, role, status")
    .order("created_at", { ascending: false });

  if (error) return json(500, { ok: false, error: error.message });

  return json(200, { ok: true, status, applicants: data || [] });
};
