import { NextResponse } from "next/server";
import { isCronAuthorized } from "@/lib/auth";
import { runAllScrapers } from "@/lib/scrapers";

export const maxDuration = 300;
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  if (!isCronAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const results = await runAllScrapers();
  return NextResponse.json({ ok: true, results });
}
