import { getSupabaseAdmin, json } from "./_adminShared.js";
import {
  sendAdminNotificationEmail,
  sendApplicantReceivedEmail,
} from "./_smtpEmail.js";

export const handler = async (event) => {
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

  const applicantPayload = {
    name: body.name ?? null,
    email: body.email ?? null,
    phone: body.phone ?? null,
    craft: body.craft ?? null,
    links: body.links ?? null,
    status: "pending",
  };

  const { data, error } = await supabase
    .from("applicants")
    .insert([applicantPayload])
    .select("id, name, email, phone, craft, links, created_at")
    .maybeSingle();

  if (error) return json(500, { ok: false, error: error.message });

  // Emails (best-effort)
  try {
    await Promise.all([
      sendApplicantReceivedEmail({ applicant: data }),
      sendAdminNotificationEmail({ type: "received", applicant: data }),
    ]);
  } catch (e) {
    console.warn("Email send skipped/failed:", e?.message || e);
  }

  return json(200, { ok: true, applicantId: data?.id || null });
};
