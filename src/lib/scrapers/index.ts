import type { NewEvent } from "@/lib/db/schema";
import { db, events } from "@/lib/db";
import { sql } from "drizzle-orm";
import { scrapeFuncheap } from "./funcheap";
import { scrapeEventbrite } from "./eventbrite";
import { scrapeTicketmaster } from "./ticketmaster";
import { scrapeLuma } from "./luma";
import { scrapeVenues } from "./venues";

export type ScrapedEvent = Omit<NewEvent, "source" | "status"> & {
  sourceId: string;
};

export type Scraper = {
  name: NewEvent["source"];
  run: () => Promise<ScrapedEvent[]>;
};

export const scrapers: Scraper[] = [
  { name: "funcheap", run: scrapeFuncheap },
  { name: "eventbrite", run: scrapeEventbrite },
  { name: "ticketmaster", run: scrapeTicketmaster },
  { name: "luma", run: scrapeLuma },
  { name: "venues", run: scrapeVenues },
];

export async function runAllScrapers() {
  const results: Record<string, { found: number; error?: string }> = {};
  for (const s of scrapers) {
    try {
      const found = await s.run();
      await upsertEvents(s.name, found);
      results[s.name] = { found: found.length };
    } catch (err) {
      console.error(`[scraper:${s.name}] failed`, err);
      results[s.name] = {
        found: 0,
        error: err instanceof Error ? err.message : String(err),
      };
    }
  }
  return results;
}

async function upsertEvents(
  source: NewEvent["source"],
  scraped: ScrapedEvent[],
) {
  if (scraped.length === 0) return;
  const rows: NewEvent[] = scraped.map((e) => ({
    ...e,
    source,
    status: "approved",
  }));
  await db
    .insert(events)
    .values(rows)
    .onConflictDoUpdate({
      target: [events.source, events.sourceId],
      set: {
        title: sql`EXCLUDED.title`,
        description: sql`EXCLUDED.description`,
        venue: sql`EXCLUDED.venue`,
        area: sql`EXCLUDED.area`,
        topics: sql`EXCLUDED.topics`,
        startsAt: sql`EXCLUDED.starts_at`,
        endsAt: sql`EXCLUDED.ends_at`,
        imageUrl: sql`EXCLUDED.image_url`,
        updatedAt: sql`NOW()`,
      },
    });
}
