import { NextResponse } from "next/server";
import { getMapPins } from "@/lib/map-events";

export const dynamic = "force-dynamic";

/**
 * Public JSON feed of newly announced, geo-located events — the same
 * pins the homepage map renders. Shape matches the design handoff:
 * { events: [{ lat, lng, meta, title, sub, url }] }
 */
export async function GET() {
  const events = await getMapPins();
  return NextResponse.json(
    { events },
    {
      headers: {
        // Cache at the edge for 10 min; serve stale while revalidating.
        "cache-control": "public, s-maxage=600, stale-while-revalidate=3600",
        "access-control-allow-origin": "*",
      },
    },
  );
}
