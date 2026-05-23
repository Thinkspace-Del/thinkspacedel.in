import { getAdminNotifyTo, sendEmail } from "./_mailer.js";

function safeEmail(value) {
  const v = String(value || "").trim();
  return v.includes("@") ? v : "";
}

function escapeHtml(input) {
  return String(input ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function emailFrame({ title, subtitle, badgeText, accent, bodyHtml }) {
  const safeTitle = escapeHtml(title);
  const safeSubtitle = escapeHtml(subtitle);
  const safeBadge = escapeHtml(badgeText);

  return `
  <div style="margin:0;padding:0;background:#f5f7fb">
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#f5f7fb;padding:24px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:640px;border-radius:16px;overflow:hidden;border:1px solid #e6eaf2;background:#ffffff;">
            <tr>
              <td style="padding:18px 20px;background:linear-gradient(135deg, rgba(138, 148, 255, 0.12), rgba(255,255,255,0.85));border-bottom:1px solid #eef1f7">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td align="left" style="font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial;">
                      <div style="letter-spacing:0.24em;text-transform:uppercase;font-size:11px;color:#4b5563">Thinkspace</div>
                    </td>
                    <td align="right" style="font-family:ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;">
                      <span style="display:inline-block;padding:8px 12px;border-radius:999px;border:1px solid #e5e7eb;background:#ffffff;color:#111827;font-size:10px;letter-spacing:0.22em;text-transform:uppercase;">${safeBadge}</span>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <tr>
              <td style="padding:22px 22px 0 22px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="vertical-align:top;">
                      <div style="font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial;color:#0f172a;font-size:28px;line-height:1.15;font-weight:800;letter-spacing:-0.02em;">${safeTitle}</div>
                      <div style="margin-top:10px;font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial;color:#475569;font-size:14px;line-height:1.6;">${safeSubtitle}</div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <tr>
              <td style="padding:18px 22px 22px 22px;">
                <div style="height:1px;background:#eef1f7;margin:4px 0 18px 0;"></div>

                <div style="font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial;color:#111827;font-size:14px;line-height:1.7;">
                  ${bodyHtml}
                </div>

                <div style="margin-top:18px;padding:14px 14px;border-radius:14px;border:1px solid #e6eaf2;background:#f8fafc;">
                  <div style="font-family:ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;color:#64748b;font-size:11px;letter-spacing:0.16em;text-transform:uppercase;">System</div>
                  <div style="margin-top:6px;font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial;color:#475569;font-size:12px;line-height:1.6;">
                    If you didn’t request this, you can ignore this email.
                  </div>
                </div>

                <div style="margin-top:18px;font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial;color:#64748b;font-size:12px;line-height:1.6;">
                  — Thinkspace • <span style="color:${accent};font-weight:800;">Build. No distractions.</span>
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </div>
  `;
}

export async function sendApplicantReceivedEmail({ applicant }) {
  const to = safeEmail(applicant?.email);
  if (!to) return { skipped: true };

  const name = String(applicant?.name || "there").trim() || "there";

  await sendEmail({
    to,
    subject: "Application received — Thinkspace",
    html: `
      <div style="font-family: ui-sans-serif, system-ui; line-height: 1.5;">
        <h2>Signal received, ${name}.</h2>
        <p>We’ve received your application. We review applications weekly. You will receive an email when your application gets reviewed.</p>
        <p style="color:#666; font-size:12px;">— Thinkspace</p>
      </div>
    `,
  });

  return { skipped: false };
}

export async function sendApplicantApprovedEmail({ applicant, approvedBy }) {
  const to = safeEmail(applicant?.email);
  if (!to) return { skipped: true };

  const name = String(applicant?.name || "there").trim() || "there";
  const accent = "#9bff8a";
  const safeName = escapeHtml(name);
  const safeApprovedBy = escapeHtml(approvedBy || "admin");

  const html = emailFrame({
    title: `You’re approved, ${safeName}.`,
    subtitle:
      "Welcome to Thinkspace. Your application has been approved. We’ll follow up with next steps shortly.",
    badgeText: "approved",
    accent,
    bodyHtml: `
      <p style="margin:0 0 14px 0;">Here’s what happens next:</p>
      <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:separate;border-spacing:0 10px;">
        <tr>
          <td style="width:28px;vertical-align:top;">
            <div style="width:22px;height:22px;border-radius:999px;background:${accent};opacity:0.9;"></div>
          </td>
          <td style="vertical-align:top;">
    <div style="font-weight:800;color:#0f172a;">We’ll reach out</div>
    <div style="color:#475569;font-size:13px;">Keep an eye on this inbox for communication.</div>
          </td>
        </tr>
        <tr>
          <td style="width:28px;vertical-align:top;">
    <div style="width:22px;height:22px;border-radius:999px;background:#e2e8f0;"></div>
          </td>
          <td style="vertical-align:top;">
    <div style="font-weight:800;color:#0f172a;">Access setup</div>
    <div style="color:#475569;font-size:13px;">You’ll receive instructions to get started.</div>
          </td>
        </tr>
      </table>
  <p style="margin:14px 0 0 0;color:#64748b;font-size:12px;">Actioned by: <b style="color:#0f172a;">${safeApprovedBy}</b></p>
    `,
  });

  await sendEmail({
    to,
    subject: "You’re approved — Thinkspace",
    html,
  });

  return { skipped: false };
}

export async function sendApplicantRejectedEmail({ applicant }) {
  const to = safeEmail(applicant?.email);
  if (!to) return { skipped: true };

  const name = String(applicant?.name || "there").trim() || "there";

  const accent = "#ff6b6b";
  const safeName = escapeHtml(name);

  const html = emailFrame({
    title: `Thanks for applying, ${safeName}.`,
    subtitle:
      "We reviewed your application. We can’t move forward right now, but we appreciate you taking the time.",
    badgeText: "update",
    accent,
    bodyHtml: `
      <p style="margin:0 0 14px 0;">This isn’t a reflection of your potential—just current fit and capacity.</p>
      <div style="padding:14px 14px;border-radius:14px;border:1px solid #e6eaf2;background:#f8fafc;">
        <div style="font-weight:900;color:#0f172a;">You can re-apply</div>
        <div style="margin-top:6px;color:#475569;font-size:13px;">If your work evolves or circumstances change, you’re welcome to apply again.</div>
      </div>
      <p style="margin:14px 0 0 0;color:#64748b;font-size:12px;">If you have updates to share, just reply to this email.</p>
    `,
  });

  await sendEmail({
    to,
    subject: "Update on your Thinkspace application",
    html,
  });

  return { skipped: false };
}

export async function sendAdminNotificationEmail({
  type,
  applicant,
  approvedBy,
}) {
  const to = getAdminNotifyTo();
  if (!to.length) return { skipped: true };

  const name = String(applicant?.name || "(no name)");
  const email = String(applicant?.email || "(no email)");
  const craft = String(applicant?.craft || "");

  const subject =
    type === "approved"
      ? `Applicant approved: ${name}`
      : type === "rejected"
        ? `Applicant rejected: ${name}`
        : type === "received"
          ? `New application: ${name}`
          : `Applicant update: ${name}`;

  await sendEmail({
    to,
    subject,
    html: `
      <div style="font-family: ui-sans-serif, system-ui; line-height: 1.5;">
        <h3>${subject}</h3>
        <ul>
          <li><b>Name:</b> ${name}</li>
          <li><b>Email:</b> ${email}</li>
          ${craft ? `<li><b>Craft:</b> ${craft}</li>` : ""}
          ${approvedBy ? `<li><b>Action by:</b> ${String(approvedBy)}</li>` : ""}
        </ul>
      </div>
    `,
  });

  return { skipped: false };
}
