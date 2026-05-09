import { NextResponse } from "next/server";
import { isCronAuthorized } from "@/lib/auth";
import { sendBiweeklyDigests } from "@/lib/digest";

export const maxDuration = 300;
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  if (!isCronAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const url = new URL(req.url);
  const dryRun = url.searchParams.get("dry") === "1";
  const force = url.searchParams.get("force") === "1";

  // Cron fires every Sunday; gate to even ISO weeks so digests go out biweekly.
  // ?force=1 overrides for manual sends.
  if (!force && !isEvenIsoWeek(new Date())) {
    return NextResponse.json({ ok: true, skipped: "odd-iso-week" });
  }

  const summary = await sendBiweeklyDigests({ dryRun });
  return NextResponse.json({ ok: true, dryRun, summary });
}

function isEvenIsoWeek(d: Date) {
  const t = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const day = t.getUTCDay() || 7;
  t.setUTCDate(t.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((+t - +yearStart) / 86400000 + 1) / 7);
  return week % 2 === 0;
}
