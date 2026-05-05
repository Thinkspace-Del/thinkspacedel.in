/* eslint-disable no-undef */
import { Resend } from "resend";

function getResend() {
  const apiKey = (process.env.RESEND_API_KEY || "").trim();
  if (!apiKey) return null;
  return new Resend(apiKey);
}

function getEmailFrom() {
  // Example: "Thinkspace <noreply@buildwiththinkspace.in>"
  return (process.env.RESEND_FROM || "").trim();
}

function getAdminNotifyTo() {
  // Comma-separated list.
  return (process.env.ADMIN_NOTIFY_EMAILS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function safeEmail(value) {
  const v = String(value || "").trim();
  return v.includes("@") ? v : "";
}

async function sendEmail({ to, subject, html }) {
  const resend = getResend();
  const from = getEmailFrom();

  if (!resend || !from) {
    // Email is optional; don't break admin flows if not configured.
    return { skipped: true };
  }

  const res = await resend.emails.send({ from, to, subject, html });
  return { skipped: false, res };
}

export async function sendApplicantApprovedEmail({ applicant, approvedBy }) {
  const to = safeEmail(applicant?.email);
  if (!to) return { skipped: true };

  const name = String(applicant?.name || "there").trim() || "there";

  return sendEmail({
    to,
    subject: "You're approved — Thinkspace",
    html: `
      <div style="font-family: ui-sans-serif, system-ui; line-height: 1.5;">
        <h2>You're approved, ${name}.</h2>
        <p>Welcome to Thinkspace. Your application has been approved.</p>
        <p style="color:#666; font-size:12px;">Approved by: ${String(
          approvedBy || "admin",
        )}</p>
      </div>
    `,
  });
}

export async function sendApplicantRejectedEmail({ applicant }) {
  const to = safeEmail(applicant?.email);
  if (!to) return { skipped: true };

  const name = String(applicant?.name || "there").trim() || "there";

  return sendEmail({
    to,
    subject: "Update on your Thinkspace application",
    html: `
      <div style="font-family: ui-sans-serif, system-ui; line-height: 1.5;">
        <h2>Thanks for applying, ${name}.</h2>
        <p>We reviewed your application, and we can't move forward right now.</p>
        <p>You're welcome to apply again in the future.</p>
      </div>
    `,
  });
}

export async function sendAdminNotificationEmail({ type, applicant, approvedBy }) {
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
        : `Applicant update: ${name}`;

  return sendEmail({
    to,
    subject,
    html: `
      <div style="font-family: ui-sans-serif, system-ui; line-height: 1.5;">
        <h3>${subject}</h3>
        <ul>
          <li><b>Name:</b> ${name}</li>
          <li><b>Email:</b> ${email}</li>
          ${craft ? `<li><b>Craft:</b> ${craft}</li>` : ""}
          ${approvedBy ? `<li><b>Approved by:</b> ${String(approvedBy)}</li>` : ""}
        </ul>
      </div>
    `,
  });
}
