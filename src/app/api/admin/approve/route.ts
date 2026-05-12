import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db, events } from "@/lib/db";
import { isAdmin } from "@/lib/auth";
import { sendSubmissionApproved } from "@/lib/submission-emails";

export async function POST(req: Request) {
  if (!(await isAdmin())) return new NextResponse("Unauthorized", { status: 401 });
  const form = await req.formData();
  const id = String(form.get("id") ?? "");
  if (!id) return new NextResponse("missing id", { status: 400 });

  const updated = await db
    .update(events)
    .set({ status: "approved" })
    .where(eq(events.id, id))
    .returning();

  const row = updated[0];
  // Only notify if it was a submission (has submitterEmail) and the row exists.
  if (row?.submitterEmail) {
    const result = await sendSubmissionApproved({
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
      submitterEmail: row.submitterEmail,
    }).catch((e) => ({ sent: false as const, error: String(e) }));
    console.log("[approve] submitter notification:", result);
  }

  return NextResponse.redirect(new URL("/admin", req.url), { status: 303 });
}
