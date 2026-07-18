import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY;
const from = process.env.RESEND_FROM ?? "LocallyCurated <onboarding@resend.dev>";

export const resend = apiKey ? new Resend(apiKey) : null;

export type EmailResult =
  | { skipped: true; reason: string }
  | { sent: true; id: string }
  | { sent: false; error: string };

export async function sendEmail(args: {
  to: string;
  subject: string;
  html: string;
  headers?: Record<string, string>;
}): Promise<EmailResult> {
  if (!resend) {
    console.warn("[email] RESEND_API_KEY not set — skipping send to", args.to);
    return { skipped: true, reason: "RESEND_API_KEY missing" };
  }
  const { data, error } = await resend.emails.send({ from, ...args });
  if (error) {
    console.error("[email] Resend rejected", args.to, error);
    return {
      sent: false,
      error: `${error.name ?? "error"}: ${error.message ?? "unknown"}`,
    };
  }
  console.log("[email] sent", args.to, "id:", data?.id);
  return { sent: true, id: data!.id };
}

/**
 * RFC 8058 one-click unsubscribe headers. Gmail and Yahoo require these
 * on bulk sends; without them, list mail gets throttled or spam-foldered.
 */
export function unsubscribeHeaders(subscriberId: string): Record<string, string> {
  const site = process.env.NEXT_PUBLIC_SITE_URL || "https://locallycurated.co";
  const url = `${site}/api/unsubscribe?id=${subscriberId}`;
  return {
    "List-Unsubscribe": `<${url}>`,
    "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
  };
}
