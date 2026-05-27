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

function getWhatsAppCommunityLink() {
  const env = /** @type {any} */ (globalThis).process?.env;
  return (
    String(env?.WHATSAPP_COMMUNITY_LINK || "").trim() ||
    "https://chat.whatsapp.com/CyMEiK7RZLr5zYK4SklnXC"
  );
}

function emailFrame({ title, subtitle, badgeText, accent, bodyHtml }) {
  const safeTitle = escapeHtml(title);
  const safeSubtitle = escapeHtml(subtitle);
  const safeBadge = escapeHtml(badgeText);

  const safeAccent = String(accent || "#e4574b");

  return `
  <div style="margin:0;padding:0;background:#ffffff">
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#ffffff;padding:24px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:640px;border-radius:0;overflow:hidden;border:4px solid #0b0b0c;background:#ffffff;">
            <tr>
              <td style="padding:18px 20px;background:#ffffff;border-bottom:4px solid #0b0b0c">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td align="left" style="font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial;">
                      <div style="font-weight:900;letter-spacing:-0.02em;font-size:16px;color:#0b0b0c">Thinkspace</div>
                    </td>
                    <td align="right" style="font-family:ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;">
                      <span style="display:inline-block;padding:8px 12px;border-radius:0;border:2px solid #0b0b0c;background:#ffffff;color:#0b0b0c;font-size:10px;letter-spacing:0.22em;text-transform:uppercase;font-weight:900;">${safeBadge}</span>
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
                      <div style="font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial;color:#0b0b0c;font-size:36px;line-height:1.0;font-weight:900;letter-spacing:-0.04em;">${safeTitle}</div>
                      <div style="margin-top:12px;font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial;color:#2b2b2e;font-size:15px;line-height:1.6;">${safeSubtitle}</div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <tr>
              <td style="padding:18px 22px 22px 22px;">
                <div style="height:4px;background:${safeAccent};margin:6px 0 20px 0;"></div>

                <div style="font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial;color:#0b0b0c;font-size:15px;line-height:1.75;">
                  ${bodyHtml}
                </div>

                <div style="margin-top:18px;padding:14px 14px;border-radius:0;border:2px solid #0b0b0c;background:#ffffff;">
                  <div style="font-family:ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;color:#0b0b0c;font-size:10px;letter-spacing:0.18em;text-transform:uppercase;font-weight:900;">System</div>
                  <div style="margin-top:6px;font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial;color:#2b2b2e;font-size:12px;line-height:1.6;">
                    If you didn’t request this, you can ignore this email.
                  </div>
                </div>

                <div style="margin-top:18px;font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial;color:#2b2b2e;font-size:12px;line-height:1.6;">
                  — Thinkspace • <span style="color:${safeAccent};font-weight:900;">Build. No distractions.</span>
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
  const accent = "#e4574b";
  const safeName = escapeHtml(name);
  const safeApprovedBy = escapeHtml(approvedBy || "admin");
  const waLink = getWhatsAppCommunityLink();
  const waLinkSafe = escapeHtml(waLink);

  const html = emailFrame({
    title: `You’re approved, ${safeName}.`,
    subtitle:
      "Welcome to Thinkspace. Your application has been approved. We’ll follow up with next steps shortly.",
    badgeText: "approved",
    accent,
    bodyHtml: `
      <div style="padding:14px 14px;border-radius:0;border:2px solid #0b0b0c;background:#ffffff;">
        <div style="font-weight:900;color:#0b0b0c;">Join the Thinkspace WhatsApp community</div>
        <div style="margin-top:6px;color:#2b2b2e;font-size:13px;">This is where we’ll share updates and you can meet other members.</div>
        <div style="margin-top:12px;">
          <a href="${waLinkSafe}" target="_blank" rel="noreferrer" style="display:inline-block;background:#22c55e;color:#ffffff;text-decoration:none;font-weight:900;font-size:13px;padding:10px 14px;border-radius:0;border:2px solid #0b0b0c;">Join on WhatsApp</a>
        </div>
        <div style="margin-top:10px;color:#2b2b2e;font-size:12px;line-height:1.5;">
          If the button doesn’t work, copy/paste this link:<br />
          <span style="color:#0b0b0c;word-break:break-all;font-weight:800;">${waLinkSafe}</span>
        </div>
      </div>

      <p style="margin:14px 0 0 0;color:#2b2b2e;font-size:12px;">Actioned by: <b style="color:#0b0b0c;">${safeApprovedBy}</b></p>
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

  const accent = "#e4574b";
  const safeName = escapeHtml(name);

  const html = emailFrame({
    title: `Thanks for applying, ${safeName}.`,
    subtitle:
      "We reviewed your application. We can’t move forward right now, but we appreciate you taking the time.",
    badgeText: "update",
    accent,
    bodyHtml: `
      <p style="margin:0 0 14px 0;">This isn’t a reflection of your potential—just current fit and capacity.</p>
      <div style="padding:14px 14px;border-radius:0;border:2px solid #0b0b0c;background:#ffffff;">
        <div style="font-weight:900;color:#0b0b0c;">You can re-apply</div>
        <div style="margin-top:6px;color:#2b2b2e;font-size:13px;">If your work evolves or circumstances change, you’re welcome to apply again.</div>
      </div>
      <p style="margin:14px 0 0 0;color:#2b2b2e;font-size:12px;">If you have updates to share, just reply to this email.</p>
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
