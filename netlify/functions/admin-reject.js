import { getSupabaseAdmin, json, requireAdminKey } from "./_adminShared.js";

export const handler = async (event) => {
  const denied = requireAdminKey(event);
  if (denied) return denied;

  const supabase = getSupabaseAdmin();
  if (!supabase)
    return json(500, { ok: false, error: "Supabase not configured" });

  if (event.httpMethod !== "POST") {
    return json(405, { ok: false, error: "Method not allowed" });
  }

  let body = {};
  try {
    body = JSON.parse(event.body || "{}");
  } catch {
    return json(400, { ok: false, error: "Invalid JSON" });
  }

  const applicantId = String(body.applicantId || body.id || "").trim();
  const approvedBy = String(body.approvedBy || "").trim();

  if (!applicantId)
    return json(400, { ok: false, error: "Missing applicantId" });
  if (!approvedBy) return json(400, { ok: false, error: "Missing approvedBy" });

  await supabase
    .from("applicants")
    .update({ status: "rejected" })
    .eq("id", applicantId);

  return json(200, { ok: true });
};
