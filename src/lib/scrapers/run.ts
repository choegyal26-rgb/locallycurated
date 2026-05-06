// Local CLI runner: `npm run scrape:eventbrite` etc.
// Runs a single scraper without touching the database — useful for smoke tests.
import "dotenv/config";
import { scrapeFuncheap } from "./funcheap";
import { scrapeEventbrite } from "./eventbrite";
import { scrapeTicketmaster } from "./ticketmaster";
import { scrapeLuma } from "./luma";
import { scrapeVenues } from "./venues";

const REGISTRY = {
  funcheap: scrapeFuncheap,
  eventbrite: scrapeEventbrite,
  ticketmaster: scrapeTicketmaster,
  luma: scrapeLuma,
  venues: scrapeVenues,
} as const;

type Name = keyof typeof REGISTRY;

const target = process.argv[2] as Name | undefined;

(async () => {
  if (!target || !(target in REGISTRY)) {
    console.error(
      `Usage: tsx src/lib/scrapers/run.ts <${Object.keys(REGISTRY).join("|")}>`,
    );
    process.exit(1);
  }
  console.time(`[${target}]`);
  const found = await REGISTRY[target]();
  console.timeEnd(`[${target}]`);
  console.log(`Found ${found.length} events.`);
  console.log("Sample:");
  console.log(JSON.stringify(found.slice(0, 3), null, 2));
})();
