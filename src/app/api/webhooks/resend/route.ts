import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { db, subscribers } from "@/lib/db";
import { eq, isNull, and } from "drizzle-orm";

export const dynamic = "force-dynamic";

const TOLERANCE_SECONDS = 5 * 60;

type ResendEvent = {
  type: string;
  created_at?: string;
  data?: {
    email_id?: string;
    to?: string[] | string;
    from?: string;
    subject?: string;
    bounce?: { type?: string; subType?: string; message?: string };
    [k: string]: unknown;
  };
};

export async function POST(req: Request) {
  const secret = process.env.RESEND_WEBHOOK_SECRET;
  if (!secret) {
    console.error("[resend-webhook] RESEND_WEBHOOK_SECRET not set");
    return NextResponse.json({ error: "Not configured" }, { status: 500 });
  }

  const svixId = req.headers.get("svix-id");
  const svixTimestamp = req.headers.get("svix-timestamp");
  const svixSignature = req.headers.get("svix-signature");
  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json({ error: "Missing svix headers" }, { status: 400 });
  }

  const ts = parseInt(svixTimestamp, 10);
  if (Number.isNaN(ts) || Math.abs(Date.now() / 1000 - ts) > TOLERANCE_SECONDS) {
    return NextResponse.json({ error: "Timestamp out of tolerance" }, { status: 400 });
  }

  const rawBody = await req.text();

  // Secret format: whsec_<base64>. Decode the part after the prefix.
  const secretBytes = Buffer.from(secret.replace(/^whsec_/, ""), "base64");
  const signedContent = `${svixId}.${svixTimestamp}.${rawBody}`;
  const expected = createHmac("sha256", secretBytes).update(signedContent).digest("base64");

  // Header format: "v1,sig1 v1,sig2 ..." — any match is valid.
  const valid = svixSignature
    .split(" ")
    .map((s) => s.split(",")[1])
    .some((sig) => {
      if (!sig) return false;
      const a = Buffer.from(sig);
      const b = Buffer.from(expected);
      return a.length === b.length && timingSafeEqual(a, b);
    });

  if (!valid) {
    console.warn("[resend-webhook] signature mismatch");
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let event: ResendEvent;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const recipients = normalizeRecipients(event.data?.to);
  console.log(`[resend-webhook] ${event.type} → ${recipients.join(", ")}`);

  // Only act on permanent failures and complaints — soft bounces are transient.
  const shouldUnsubscribe =
    event.type === "email.complained" ||
    (event.type === "email.bounced" && isPermanentBounce(event));

  if (!shouldUnsubscribe || recipients.length === 0) {
    return NextResponse.json({ ok: true, action: "ignored", type: event.type });
  }

  const updated: string[] = [];
  for (const email of recipients) {
    const result = await db
      .update(subscribers)
      .set({ unsubscribedAt: new Date() })
      .where(
        and(eq(subscribers.email, email.toLowerCase()), isNull(subscribers.unsubscribedAt)),
      )
      .returning({ id: subscribers.id });
    if (result.length > 0) updated.push(email);
  }

  console.log(`[resend-webhook] unsubscribed ${updated.length} (${event.type}):`, updated);
  return NextResponse.json({ ok: true, action: "unsubscribed", count: updated.length });
}

function normalizeRecipients(to: string[] | string | undefined): string[] {
  if (!to) return [];
  if (typeof to === "string") return [to];
  return to;
}

function isPermanentBounce(event: ResendEvent): boolean {
  const t = (event.data?.bounce?.type ?? "").toLowerCase();
  // Resend currently emits "Permanent" / "Transient" / "Undetermined".
  // Treat anything not explicitly transient as permanent to be safe — undetermined
  // bounces still tank reputation if you keep sending.
  return t !== "transient";
}
