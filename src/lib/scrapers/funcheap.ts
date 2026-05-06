import * as cheerio from "cheerio";
import type { ScrapedEvent } from "./index";
import { inferTopics } from "./topic-inference";

// Funcheap consolidated to a single SF-centric feed; East Bay / Peninsula
// subdomains were retired. We default area to null and let downstream tagging
// or admin curation refine it. (Eventbrite gives us per-city area for free.)
const FUNCHEAP_FEEDS = [
  { url: "https://sf.funcheap.com/feed/", area: null as string | null },
];

function parseDate(s: string | undefined): Date | null {
  if (!s) return null;
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
}

export async function scrapeFuncheap(): Promise<ScrapedEvent[]> {
  const all: ScrapedEvent[] = [];
  for (const feed of FUNCHEAP_FEEDS) {
    try {
      const xml = await fetch(feed.url, {
        headers: { "user-agent": "LocallyCurated/0.1 (+contact via site)" },
      }).then((r) => r.text());
      const $ = cheerio.load(xml, { xmlMode: true });
      $("item").each((_, el) => {
        const $el = $(el);
        const title = $el.find("title").text().trim();
        const link = $el.find("link").text().trim();
        const description = $el.find("description").text().trim();
        const pubDate = parseDate($el.find("pubDate").text());
        if (!title || !link) return;
        const topics = inferTopics(`${title} ${description}`);
        all.push({
          title,
          url: link,
          description,
          startsAt: pubDate,
          area: feed.area,
          city: null,
          venue: null,
          topics,
          isOnline: false,
          imageUrl: null,
          sourceId: link,
          submitterEmail: null,
        });
      });
    } catch (err) {
      console.error(`[funcheap] feed ${feed.url} failed`, err);
    }
  }
  return all;
}
