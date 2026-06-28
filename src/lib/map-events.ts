import { and, desc, eq, gte, isNull, or, sql as drizzleSql } from "drizzle-orm";
import { db, events } from "@/lib/db";
import { findEventCoords } from "@/lib/venue-coords";
import { formatShortDate } from "@/lib/issue";

export type MapPin = {
  lat: number;
  lng: number;
  meta: string; // e.g. "MISSION · WED 6/11"
  title: string;
  sub: string;
  url?: string;
};

const REGION_BOUNDS = {
  sf: { sw: [37.706, -122.52], ne: [37.82, -122.345] },
  eastbay: { sw: [37.74, -122.3], ne: [37.91, -122.15] },
  southbay: { sw: [37.27, -122.05], ne: [37.45, -121.8] },
} as const;

/**
 * Pull recent approved events that have a venue we can geo-locate,
 * shape them into pins for the homepage map. Ordered by most recently
 * announced first (matches "just announced" framing).
 */
export async function getMapPins(limitPerRegion = 8): Promise<MapPin[]> {
  const since = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);

  const rows = await db
    .select({
      title: events.title,
      venue: events.venue,
      area: events.area,
      city: events.city,
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
    .limit(240); // fetch more, then shape into balanced regional buckets

  const seenVenues = new Set<string>();
  const byRegion: Record<keyof typeof REGION_BOUNDS, MapPin[]> = {
    sf: [],
    eastbay: [],
    southbay: [],
  };

  for (const r of rows) {
    const seed = `${r.title}|${r.venue ?? ""}|${r.city ?? ""}|${r.area ?? ""}`;
    const coords = findEventCoords({
      venue: r.venue,
      city: r.city,
      area: r.area,
      jitterSeed: seed,
    });
    if (!coords) continue;

    const region = regionFor(coords[0], coords[1]);
    if (!region || byRegion[region].length >= limitPerRegion) continue;

    const venueKey = (r.venue ?? "").toLowerCase().trim();
    const dedupeKey = venueKey || `${region}:${r.title.toLowerCase().trim()}`;
    if (seenVenues.has(dedupeKey)) continue;
    seenVenues.add(dedupeKey);

    const [lat, lng] = coords;
    const areaLabel = regionLabel(region);
    const datePart = r.startsAt ? formatShortDate(r.startsAt) : "TBD";
    byRegion[region].push({
      lat,
      lng,
      meta: `${areaLabel} · ${datePart}`,
      title: r.title,
      sub: r.venue ?? "",
      url: r.url,
    });

    if (Object.values(byRegion).every((list) => list.length >= limitPerRegion)) {
      break;
    }
  }

  return [...byRegion.sf, ...byRegion.eastbay, ...byRegion.southbay];
}

function regionFor(lat: number, lng: number): keyof typeof REGION_BOUNDS | null {
  for (const [id, bounds] of Object.entries(REGION_BOUNDS) as [
    keyof typeof REGION_BOUNDS,
    (typeof REGION_BOUNDS)[keyof typeof REGION_BOUNDS],
  ][]) {
    if (
      lat >= bounds.sw[0] &&
      lat <= bounds.ne[0] &&
      lng >= bounds.sw[1] &&
      lng <= bounds.ne[1]
    ) {
      return id;
    }
  }
  return null;
}

function regionLabel(region: keyof typeof REGION_BOUNDS) {
  if (region === "eastbay") return "EAST BAY";
  if (region === "southbay") return "SOUTH BAY";
  return "SF";
}
