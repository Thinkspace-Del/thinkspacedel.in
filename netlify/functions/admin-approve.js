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

  // 1) Fetch applicant
  const { data: applicant, error: fetchErr } = await supabase
    .from("applicants")
    .select("id, name, email, phone, craft, links, created_at")
    .eq("id", applicantId)
    .maybeSingle();

  if (fetchErr) return json(500, { ok: false, error: fetchErr.message });
  if (!applicant) return json(404, { ok: false, error: "Applicant not found" });

  const nowIso = new Date().toISOString();

  // 2) Insert into builders (role defaults to builder, but we set it explicitly)
  const builderPayload = {
    name: applicant.name ?? null,
    email: applicant.email ?? null,
    phone: applicant.phone ?? null,
    craft: applicant.craft ?? null,
    links: applicant.links ?? null,
    role: "builder",
    approvedBy,
    approvedOn: nowIso,
  };

  const { error: insErr } = await supabase
    .from("builders")
    .insert([builderPayload]);
  if (insErr) return json(500, { ok: false, error: insErr.message });

  // 3) Mark applicant as approved
  await supabase
    .from("applicants")
    .update({ role: "builder", status: "approved" })
    .eq("id", applicantId);

  return json(200, { ok: true, approvedOn: nowIso });
};
