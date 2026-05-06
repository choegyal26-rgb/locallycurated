import type { ScrapedEvent } from "./index";

const BAY_AREA_LATLONG = "37.7749,-122.4194";
const RADIUS_MILES = 50;

type TmEvent = {
  id: string;
  name: string;
  url: string;
  info?: string;
  dates?: { start?: { dateTime?: string } };
  classifications?: { segment?: { name?: string } }[];
  _embedded?: {
    venues?: { name?: string; city?: { name?: string } }[];
  };
  images?: { url: string; ratio?: string; width?: number }[];
};

function mapSegmentToTopics(segment?: string): string[] {
  if (!segment) return [];
  const s = segment.toLowerCase();
  if (s.includes("music")) return ["music"];
  if (s.includes("sport")) return ["sports"];
  if (s.includes("art") || s.includes("theatre") || s.includes("theater"))
    return ["art", "film"];
  if (s.includes("film")) return ["film"];
  if (s.includes("misc")) return [];
  return [];
}

export async function scrapeTicketmaster(): Promise<ScrapedEvent[]> {
  const apiKey = process.env.TICKETMASTER_API_KEY;
  if (!apiKey) {
    console.warn("[ticketmaster] TICKETMASTER_API_KEY not set — skipping");
    return [];
  }
  const url = new URL("https://app.ticketmaster.com/discovery/v2/events.json");
  url.searchParams.set("apikey", apiKey);
  url.searchParams.set("latlong", BAY_AREA_LATLONG);
  url.searchParams.set("radius", String(RADIUS_MILES));
  url.searchParams.set("unit", "miles");
  url.searchParams.set("size", "100");
  url.searchParams.set("sort", "date,asc");

  const res = await fetch(url, { headers: { accept: "application/json" } });
  if (!res.ok) {
    console.error("[ticketmaster] fetch failed", res.status);
    return [];
  }
  const data = (await res.json()) as { _embedded?: { events?: TmEvent[] } };
  const tmEvents = data._embedded?.events ?? [];

  return tmEvents.map((e): ScrapedEvent => {
    const venue = e._embedded?.venues?.[0];
    const segment = e.classifications?.[0]?.segment?.name;
    const startsAt = e.dates?.start?.dateTime
      ? new Date(e.dates.start.dateTime)
      : null;
    return {
      title: e.name,
      url: e.url,
      description: e.info ?? null,
      venue: venue?.name ?? null,
      city: venue?.city?.name ?? null,
      area: null,
      topics: mapSegmentToTopics(segment),
      startsAt,
      endsAt: null,
      isOnline: false,
      imageUrl: e.images?.find((i) => (i.width ?? 0) > 600)?.url ?? null,
      sourceId: e.id,
      submitterEmail: null,
    };
  });
}
