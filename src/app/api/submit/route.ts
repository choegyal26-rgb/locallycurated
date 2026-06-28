import { NextResponse } from "next/server";
import { z } from "zod";
import { db, events } from "@/lib/db";
import { TOPIC_IDS, AREA_IDS } from "@/lib/topics";
import {
  notifyAdminOfSubmission,
  sendSubmissionReceipt,
} from "@/lib/submission-emails";

const Schema = z.object({
  title: z.string().min(3).max(200),
  url: z.string().url(),
  venue: z.string().max(200).optional().nullable(),
  description: z.string().max(5000).optional().nullable(),
  startsAt: z.string().min(1),
  endsAt: z.string().optional().nullable(),
  topics: z.array(z.enum(TOPIC_IDS as [string, ...string[]])).min(1),
  area: z.enum(AREA_IDS as [string, ...string[]]).optional().nullable(),
  isOnline: z.coerce.boolean().optional().default(false),
  submitterEmail: z.string().email(),
});

export async function POST(req: Request) {
  const form = await req.formData();

  // Honeypot: hidden field that real users never fill.
  if (form.get("website")) {
    console.log("[submit] honeypot tripped");
    return NextResponse.redirect(new URL("/submit/thanks", req.url), {
      status: 303,
    });
  }

  const parsed = Schema.safeParse({
    title: form.get("title"),
    url: form.get("url"),
    venue: form.get("venue") || null,
    description: form.get("description") || null,
    startsAt: form.get("startsAt"),
    endsAt: form.get("endsAt") || null,
    topics: form.getAll("topics"),
    area: form.get("area") || null,
    isOnline: form.get("isOnline") === "1",
    submitterEmail: form.get("submitterEmail"),
  });
  if (!parsed.success) {
    const url = new URL("/submit", req.url);
    url.searchParams.set("error", "invalid");
    return NextResponse.redirect(url, { status: 303 });
  }
  const v = parsed.data;

  const inserted = await db
    .insert(events)
    .values({
      title: v.title,
      url: v.url,
      venue: v.venue ?? null,
      description: v.description ?? null,
      startsAt: new Date(v.startsAt),
      endsAt: v.endsAt ? new Date(v.endsAt) : null,
      topics: v.topics,
      area: v.area ?? null,
      isOnline: v.isOnline,
      source: "submission",
      status: "pending",
      submitterEmail: v.submitterEmail,
    })
    .returning();

  const row = inserted[0];
  if (row) {
    const payload = {
      id: row.id,
      title: row.title,
      url: row.url,
      venue: row.venue,
      description: row.description,
      startsAt: row.startsAt,
      endsAt: row.endsAt,
      topics: row.topics,
      area: row.area,
      isOnline: row.isOnline,
      submitterEmail: v.submitterEmail,
    };
    const [adminResult, submitterResult] = await Promise.all([
      notifyAdminOfSubmission(payload).catch((e) => ({ sent: false as const, error: String(e) })),
      sendSubmissionReceipt(payload).catch((e) => ({ sent: false as const, error: String(e) })),
    ]);
    console.log("[submission] admin:", adminResult, "submitter:", submitterResult);
  }

  return NextResponse.redirect(new URL("/submit/thanks", req.url), {
    status: 303,
  });
}
