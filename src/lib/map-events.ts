import { and, desc, eq, gte, isNull, or, sql as drizzleSql } from "drizzle-orm";
import { db, events } from "@/lib/db";
import { findVenueCoords } from "@/lib/venue-coords";
import { formatShortDate } from "@/lib/issue";

export type MapPin = {
  lat: number;
  lng: number;
  meta: string; // e.g. "MISSION · WED 6/11"
  title: string;
  sub: string;
};

/**
 * Pull recent approved events that have a venue we can geo-locate,
 * shape them into pins for the homepage map. Ordered by most recently
 * announced first (matches "just announced" framing).
 */
export async function getMapPins(limit = 8): Promise<MapPin[]> {
  const since = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);

  const rows = await db
    .select({
      title: events.title,
      venue: events.venue,
      area: events.area,
      startsAt: events.startsAt,
      url: events.url,
    })
    .from(events)
    .where(
      and(
        eq(events.status, "approved"),
        gte(events.discoveredAt, since),
        or(
          isNull(events.startsAt),
          drizzleSql`${events.startsAt} >= NOW()`,
        ),
      ),
    )
    .orderBy(desc(events.discoveredAt))
    .limit(60); // fetch more, filter to ones with coord matches

  // Dedupe: at most one pin per venue (keep most-recently-announced).
  // Multiple shows at the same address create overlapping pins that
  // tangle the label collision resolution.
  const seenVenues = new Set<string>();
  const pins: MapPin[] = [];
  for (const r of rows) {
    const coords = findVenueCoords(r.venue);
    if (!coords) continue;
    const venueKey = (r.venue ?? "").toLowerCase().trim();
    if (seenVenues.has(venueKey)) continue;
    seenVenues.add(venueKey);

    const [lat, lng] = coords;
    const areaLabel = (r.area ?? "BAY AREA").toUpperCase().replace(/-/g, " ");
    const datePart = r.startsAt ? formatShortDate(r.startsAt) : "TBD";
    pins.push({
      lat,
      lng,
      meta: `${areaLabel} · ${datePart}`,
      title: r.title,
      sub: r.venue ?? "",
    });
    if (pins.length >= limit) break;
  }
  return pins;
}
