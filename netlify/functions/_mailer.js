/* eslint-disable no-undef */
import nodemailer from "nodemailer";

function required(name) {
  const v = (process.env[name] || "").trim();
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

function getFrom() {
  return (process.env.EMAIL_FROM || "").trim() || required("SMTP_USER");
}

export function getAdminNotifyTo() {
  return (process.env.ADMIN_NOTIFY_EMAILS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function createTransport() {
  const host = process.env.SMTP_HOST.trim();
  const port = Number(process.env.SMTP_PORT);
  const secure =
    String(process.env.SMTP_SECURE ?? "true")
      .trim()
      .toLowerCase() === "true";

  const user = required("SMTP_USER");
  const pass = required("SMTP_PASS");

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });
}

export async function sendEmail({ to, subject, text, html, replyTo }) {
  const transporter = createTransport();
  const from = getFrom();

  // Nodemailer accepts comma-separated string or string[]
  return transporter.sendMail({
    from,
    to,
    subject,
    text,
    html,
    replyTo,
  });
}
