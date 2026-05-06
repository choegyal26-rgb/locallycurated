// Shared schema.org Event JSON-LD scraper. Many event platforms (Eventbrite,
// Luma, Meetup, …) embed schema.org Event objects in <script type="application/ld+json">
// for SEO. This module fetches a page, finds those blocks, and walks the
// (nested) structure to pull out Event nodes — regardless of whether they're
// directly in @graph, ItemList.itemListElement, or anywhere else.
import * as cheerio from "cheerio";
import type { ScrapedEvent } from "./index";
import { inferTopics } from "./topic-inference";

export type LdEvent = {
  "@type"?: string | string[];
  name?: string;
  description?: string;
  url?: string;
  startDate?: string;
  endDate?: string;
  image?: string | { url?: string } | string[];
  eventAttendanceMode?: string;
  location?:
    | {
        "@type"?: string;
        name?: string;
        address?: { addressLocality?: string };
      }
    | { "@type"?: string }[];
};

const UA =
  "Mozilla/5.0 (compatible; LocallyCuratedBot/0.1; +https://locallycurated.co)";

function parseDate(s: string | undefined): Date | null {
  if (!s) return null;
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
}

function pickImage(image: LdEvent["image"]): string | null {
  if (!image) return null;
  if (typeof image === "string") return image;
  if (Array.isArray(image)) return typeof image[0] === "string" ? image[0] : null;
  return image.url ?? null;
}

function pickVenue(location: LdEvent["location"]): {
  name: string | null;
  city: string | null;
} {
  if (!location) return { name: null, city: null };
  const raw = Array.isArray(location) ? location[0] : location;
  if (!raw || typeof raw !== "object") return { name: null, city: null };
  const loc = raw as {
    name?: string;
    address?: { addressLocality?: string };
  };
  return {
    name: typeof loc.name === "string" ? loc.name : null,
    city:
      typeof loc.address?.addressLocality === "string"
        ? loc.address.addressLocality
        : null,
  };
}

function isEvent(node: unknown): node is LdEvent {
  if (!node || typeof node !== "object") return false;
  const t = (node as LdEvent)["@type"];
  if (!t) return false;
  if (Array.isArray(t)) return t.includes("Event") || t.some((v) => v.endsWith("Event"));
  return t === "Event" || t.endsWith("Event");
}

function extractEvents(json: unknown): LdEvent[] {
  const out: LdEvent[] = [];
  const visit = (node: unknown) => {
    if (!node) return;
    if (Array.isArray(node)) {
      node.forEach(visit);
      return;
    }
    if (typeof node !== "object") return;
    const obj = node as Record<string, unknown>;
    if (isEvent(obj)) out.push(obj as LdEvent);
    if ("item" in obj) visit(obj.item);
    if ("itemListElement" in obj) visit(obj.itemListElement);
    if ("@graph" in obj) visit(obj["@graph"]);
  };
  visit(json);
  return out;
}

export type JsonLdSource = {
  /** Page URL to fetch. */
  url: string;
  /** Area ID (sf, east-bay, etc.) — applied to every event scraped from this page. */
  area: string | null;
  /** Optional fallback topics when keyword inference yields nothing. */
  defaultTopics?: string[];
};

export async function scrapeJsonLd(source: JsonLdSource): Promise<ScrapedEvent[]> {
  const res = await fetch(source.url, {
    redirect: "follow",
    headers: {
      "user-agent": UA,
      accept: "text/html,application/xhtml+xml",
    },
  });
  if (!res.ok) {
    console.warn(`[jsonld] ${source.url} → ${res.status}`);
    return [];
  }
  const html = await res.text();
  const $ = cheerio.load(html);

  const events: LdEvent[] = [];
  $('script[type="application/ld+json"]').each((_, el) => {
    const raw = $(el).contents().text().trim();
    if (!raw) return;
    try {
      events.push(...extractEvents(JSON.parse(raw)));
    } catch {
      // ignore unparseable blocks
    }
  });

  return events
    .filter((e) => e.url && e.name)
    .map((e): ScrapedEvent => {
      const venue = pickVenue(e.location);
      const isOnline =
        e.eventAttendanceMode?.includes("OnlineEventAttendanceMode") ?? false;
      const inferred = inferTopics(`${e.name} ${e.description ?? ""}`);
      const topics =
        inferred.length > 0 ? inferred : (source.defaultTopics ?? []);
      return {
        title: e.name!,
        description: e.description ?? null,
        url: e.url!,
        venue: venue.name,
        city: venue.city,
        area: source.area,
        topics,
        startsAt: parseDate(e.startDate),
        endsAt: parseDate(e.endDate),
        isOnline,
        imageUrl: pickImage(e.image),
        sourceId: e.url!,
        submitterEmail: null,
      };
    });
}

export async function scrapeMany(
  sources: JsonLdSource[],
  options: { delayMs?: number } = {},
): Promise<ScrapedEvent[]> {
  const delay = options.delayMs ?? 600;
  const all: ScrapedEvent[] = [];
  for (const src of sources) {
    try {
      const events = await scrapeJsonLd(src);
      all.push(...events);
      await new Promise((r) => setTimeout(r, delay));
    } catch (err) {
      console.error(`[jsonld] ${src.url} failed`, err);
    }
  }
  // dedupe by URL — events appear on multiple regional pages near boundaries
  const seen = new Set<string>();
  return all.filter((e) => {
    if (seen.has(e.url)) return false;
    seen.add(e.url);
    return true;
  });
}
