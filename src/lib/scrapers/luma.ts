import type { ScrapedEvent } from "./index";
import { scrapeMany } from "./jsonld";

// Luma (lu.ma → luma.com) renders schema.org Event JSON-LD on its city
// discover pages. Same shape as Eventbrite, so we reuse the JSON-LD helper.
//
// Luma is heavily skewed toward tech/AI/startup meetups, so we tag those as
// the default topic when keyword inference yields nothing — keeps low-signal
// titles like "May Mixer" classified usefully.

export async function scrapeLuma(): Promise<ScrapedEvent[]> {
  return scrapeMany([
    { url: "https://lu.ma/sf", area: "sf", defaultTopics: ["tech", "community"] },
    { url: "https://lu.ma/oakland", area: "east-bay", defaultTopics: ["tech", "community"] },
    { url: "https://lu.ma/berkeley", area: "east-bay", defaultTopics: ["tech", "community"] },
    { url: "https://lu.ma/san-jose", area: "south-bay", defaultTopics: ["tech", "community"] },
    { url: "https://lu.ma/palo-alto", area: "south-bay", defaultTopics: ["tech", "community"] },
  ]);
}
