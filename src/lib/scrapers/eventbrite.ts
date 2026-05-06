import type { ScrapedEvent } from "./index";
import { scrapeMany } from "./jsonld";

// Eventbrite's public events search API was deprecated in 2020 — only org
// owners can list their own events via the API now. So for broad Bay Area
// discovery we scrape Eventbrite's public city pages, which embed schema.org
// Event JSON-LD in <script type="application/ld+json"> for SEO.

export async function scrapeEventbrite(): Promise<ScrapedEvent[]> {
  return scrapeMany([
    { url: "https://www.eventbrite.com/d/ca--san-francisco/all-events/", area: "sf" },
    { url: "https://www.eventbrite.com/d/ca--oakland/all-events/", area: "east-bay" },
    { url: "https://www.eventbrite.com/d/ca--berkeley/all-events/", area: "east-bay" },
    { url: "https://www.eventbrite.com/d/ca--san-jose/all-events/", area: "south-bay" },
    { url: "https://www.eventbrite.com/d/ca--palo-alto/all-events/", area: "south-bay" },
    { url: "https://www.eventbrite.com/d/ca--san-mateo/all-events/", area: "peninsula" },
  ]);
}
