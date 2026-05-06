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
  const summary = await sendBiweeklyDigests({ dryRun });
  return NextResponse.json({ ok: true, dryRun, summary });
}
