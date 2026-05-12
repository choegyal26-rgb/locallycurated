import { sendEmail, type EmailResult } from "@/lib/email";

type SubmissionPayload = {
  id: string;
  title: string;
  url: string;
  venue: string | null;
  description: string | null;
  startsAt: Date | null;
  endsAt: Date | null;
  topics: string[];
  area: string | null;
  isOnline: boolean;
  submitterEmail: string;
};

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function fmtDate(d: Date | null): string {
  if (!d) return "(no date)";
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Los_Angeles",
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  }).format(d);
}

function adminUrl(): string {
  return `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://locallycurated.co"}/admin`;
}

export function buildAdminNotifyHTML(e: SubmissionPayload): string {
  const where = e.isOnline ? "Online" : (e.area ?? "(no area)");
  return `<!doctype html><html><body style="font-family:ui-sans-serif,system-ui,sans-serif;background:#fdfaf4;margin:0;padding:24px;">
  <div style="max-width:600px;margin:0 auto;background:#fff;border:1px solid #eee;border-radius:16px;padding:32px;">
    <p style="color:#666;font-size:12px;text-transform:uppercase;letter-spacing:0.05em;margin:0 0 8px 0;">New submission</p>
    <h1 style="font-size:22px;margin:0 0 16px 0;color:#1a1a1a;">${escapeHtml(e.title)}</h1>

    <table style="width:100%;border-collapse:collapse;font-size:14px;color:#333;">
      <tr><td style="padding:4px 0;color:#777;width:120px;">Submitter</td><td>${escapeHtml(e.submitterEmail)}</td></tr>
      <tr><td style="padding:4px 0;color:#777;">When</td><td>${escapeHtml(fmtDate(e.startsAt))}${e.endsAt ? ` → ${escapeHtml(fmtDate(e.endsAt))}` : ""}</td></tr>
      <tr><td style="padding:4px 0;color:#777;">Where</td><td>${escapeHtml(where)}${e.venue ? ` · ${escapeHtml(e.venue)}` : ""}</td></tr>
      <tr><td style="padding:4px 0;color:#777;">Topics</td><td>${escapeHtml(e.topics.join(", ") || "(none)")}</td></tr>
      <tr><td style="padding:4px 0;color:#777;vertical-align:top;">URL</td><td><a href="${escapeHtml(e.url)}" style="color:#d2603a;">${escapeHtml(e.url)}</a></td></tr>
    </table>

    ${
      e.description
        ? `<p style="font-size:14px;line-height:1.6;color:#333;margin:16px 0 0 0;border-top:1px solid #eee;padding-top:16px;">${escapeHtml(e.description)}</p>`
        : ""
    }

    <p style="margin-top:24px;">
      <a href="${escapeHtml(adminUrl())}" style="display:inline-block;background:#1a1a1a;color:#fff;padding:10px 18px;border-radius:8px;text-decoration:none;font-size:14px;">Review in admin →</a>
    </p>
  </div></body></html>`;
}

export function buildSubmitterReceiptHTML(e: SubmissionPayload): string {
  return `<!doctype html><html><body style="font-family:ui-serif,Georgia,Cambria,'Times New Roman',Times,serif;background:#fdfaf4;margin:0;padding:24px;">
  <div style="max-width:600px;margin:0 auto;background:#fff;border:1px solid #eee;border-radius:16px;padding:40px;">
    <h1 style="font-size:22px;margin:0 0 20px 0;font-weight:600;color:#1a1a1a;">Thanks for the submission.</h1>

    <p style="color:#1a1a1a;font-size:16px;line-height:1.7;margin:0 0 18px 0;">We got your event, <em>${escapeHtml(e.title)}</em>. Someone on the team will read through it within the next 48 hours, and you'll hear back either way.</p>

    <p style="color:#1a1a1a;font-size:16px;line-height:1.7;margin:0 0 18px 0;">If it's a fit, it'll go out in the next biweekly digest to subscribers whose interests match. If not, we'll let you know briefly so you're not left wondering.</p>

    <p style="color:#1a1a1a;font-size:16px;line-height:1.7;margin:0 0 18px 0;">Either way, thank you for adding to what's happening here.</p>

    <p style="color:#999;font-size:12px;margin-top:32px;border-top:1px solid #eee;padding-top:16px;font-family:ui-sans-serif,system-ui,sans-serif;">
      You're getting this because you submitted an event at locallycurated.co.
    </p>
  </div></body></html>`;
}

export function buildSubmitterApprovedHTML(e: SubmissionPayload): string {
  return `<!doctype html><html><body style="font-family:ui-serif,Georgia,Cambria,'Times New Roman',Times,serif;background:#fdfaf4;margin:0;padding:24px;">
  <div style="max-width:600px;margin:0 auto;background:#fff;border:1px solid #eee;border-radius:16px;padding:40px;">
    <h1 style="font-size:22px;margin:0 0 20px 0;font-weight:600;color:#1a1a1a;">Your event is in.</h1>

    <p style="color:#1a1a1a;font-size:16px;line-height:1.7;margin:0 0 18px 0;"><em>${escapeHtml(e.title)}</em> was approved and will appear in our next biweekly digest, going to any subscriber whose topics and area match.</p>

    <p style="color:#1a1a1a;font-size:16px;line-height:1.7;margin:0 0 18px 0;">Thanks for sharing it. The Bay is better when good things get found.</p>

    <p style="color:#999;font-size:12px;margin-top:32px;border-top:1px solid #eee;padding-top:16px;font-family:ui-sans-serif,system-ui,sans-serif;">
      You're getting this because you submitted an event at locallycurated.co.
    </p>
  </div></body></html>`;
}

export async function notifyAdminOfSubmission(
  e: SubmissionPayload,
): Promise<EmailResult> {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) {
    console.warn("[submission] ADMIN_EMAIL not set — skipping admin notify");
    return { skipped: true, reason: "ADMIN_EMAIL missing" };
  }
  return sendEmail({
    to: adminEmail,
    subject: `New submission: ${e.title}`,
    html: buildAdminNotifyHTML(e),
  });
}

export async function sendSubmissionReceipt(
  e: SubmissionPayload,
): Promise<EmailResult> {
  return sendEmail({
    to: e.submitterEmail,
    subject: "We got your submission",
    html: buildSubmitterReceiptHTML(e),
  });
}

export async function sendSubmissionApproved(
  e: SubmissionPayload,
): Promise<EmailResult> {
  return sendEmail({
    to: e.submitterEmail,
    subject: "Your event is in",
    html: buildSubmitterApprovedHTML(e),
  });
}
