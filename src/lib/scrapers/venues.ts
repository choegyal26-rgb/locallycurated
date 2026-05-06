// Direct venue scrapers for SF music venues.
// Each venue has its own DOM, so we keep small per-venue parsers here rather
// than one mega-helper. They all return ScrapedEvent[] under source "venue"
// and include the venue name + area in the row.
import * as cheerio from "cheerio";
import type { ScrapedEvent } from "./index";
import { inferTopics } from "./topic-inference";

const UA =
  "Mozilla/5.0 (compatible; LocallyCuratedBot/0.1; +https://locallycurated.co)";

async function fetchHtml(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      redirect: "follow",
      headers: { "user-agent": UA, accept: "text/html,application/xhtml+xml" },
    });
    if (!res.ok) {
      console.warn(`[venues] ${url} → ${res.status}`);
      return null;
    }
    return res.text();
  } catch (err) {
    console.error(`[venues] ${url} failed`, err);
    return null;
  }
}

function defaultTopics(title: string, description?: string | null): string[] {
  const inferred = inferTopics(`${title} ${description ?? ""}`);
  // For music venues, default to "music" if keyword inference didn't catch it.
  return inferred.includes("music") || inferred.includes("nightlife")
    ? inferred
    : [...inferred, "music"];
}

// Parse a "month.day" or "MM.DD" date in current/next year context.
// e.g. "6.20" — assume next occurrence (this year if not yet passed, else next year).
function parseRelativeDate(monthDay: string): Date | null {
  const m = monthDay.trim().match(/^(\d{1,2})[./-](\d{1,2})$/);
  if (!m) return null;
  const month = parseInt(m[1], 10) - 1;
  const day = parseInt(m[2], 10);
  if (month < 0 || month > 11 || day < 1 || day > 31) return null;
  const now = new Date();
  let year = now.getFullYear();
  const candidate = new Date(year, month, day);
  if (candidate.getTime() < now.getTime() - 24 * 60 * 60 * 1000) {
    year += 1;
  }
  return new Date(year, month, day);
}

// "May 14" — same logic, infer year.
function parseMonthName(s: string): Date | null {
  const months = [
    "january","february","march","april","may","june",
    "july","august","september","october","november","december",
  ];
  const m = s.trim().match(/^([A-Za-z]+)\s+(\d{1,2})$/);
  if (!m) return null;
  const month = months.indexOf(m[1].toLowerCase());
  if (month < 0) return null;
  const day = parseInt(m[2], 10);
  const now = new Date();
  let year = now.getFullYear();
  const candidate = new Date(year, month, day);
  if (candidate.getTime() < now.getTime() - 24 * 60 * 60 * 1000) year += 1;
  return new Date(year, month, day);
}

// ---------- The Independent (TicketWeb plugin) ----------
// 60+ events on one homepage, clean .tw-event-item rows.

export async function scrapeIndependent(): Promise<ScrapedEvent[]> {
  const html = await fetchHtml("https://www.theindependentsf.com/");
  if (!html) return [];
  const $ = cheerio.load(html);
  const out: ScrapedEvent[] = [];

  $(".tw-event-item").each((_, el) => {
    const $el = $(el);
    const titleAnchor = $el.find(".tw-name a").first();
    const title = titleAnchor.text().trim();
    const url = titleAnchor.attr("href")?.trim();
    if (!title || !url) return;

    const dateStr = $el.find(".tw-event-date").first().text().trim(); // "6.20"
    const timeStr = $el.find(".tw-event-time").first().text().replace(/Show:\s*/i, "").trim();
    const startsAt = parseRelativeDate(dateStr);
    if (startsAt && timeStr) {
      const tm = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
      if (tm) {
        let h = parseInt(tm[1], 10) % 12;
        if (tm[3].toUpperCase() === "PM") h += 12;
        startsAt.setHours(h, parseInt(tm[2], 10));
      }
    }
    const support = $el.find(".tw-attractions span").map((_, x) => $(x).text().trim()).get().join(", ");
    const description = support ? `with ${support}` : null;
    const imageUrl = $el.find(".event-img").attr("src") ?? null;

    out.push({
      title,
      description,
      url,
      venue: "The Independent",
      city: "San Francisco",
      area: "sf",
      topics: defaultTopics(title, description),
      startsAt,
      endsAt: null,
      isOnline: false,
      imageUrl,
      sourceId: url,
      submitterEmail: null,
    });
  });

  return out;
}

// ---------- Shared See Tickets parser ----------
// Many venues (The Chapel, GAMH, Bimbo's, Slim's, …) embed See Tickets'
// .seetickets-list-event-container cards. The cards have a consistent shape:
//   - .seetickets-buy-btn[href]  → wl.seetickets.us/event/{slug}/{id}
//   - aria-label="Buy Tickets for X on May 14"  → title + date
//   - .see-showtime              → "7:30PM"
//   - .genre                     → "Alternative"
//   - img                        → poster
// We extract once, share the parser.

function parseSeeTicketsHTML(
  html: string,
  venue: { name: string; area: string; city: string },
): ScrapedEvent[] {
  const $ = cheerio.load(html);
  const out: ScrapedEvent[] = [];
  const seen = new Set<string>();

  $(".seetickets-list-event-container").each((_, el) => {
    const $el = $(el);
    const buyLink = $el.find('a[href*="wl.seetickets.us/event/"]').first();
    const url = buyLink.attr("href")?.split("?")[0] ?? null;
    if (!url) return;
    if (seen.has(url)) return;
    seen.add(url);

    let title = "";
    let date: Date | null = null;
    const aria = buyLink.attr("aria-label") ?? "";
    const ariaMatch = aria.match(
      /Buy Tickets for (.+?)\s+on\s+([A-Za-z]+\s+\d{1,2})\s*$/,
    );
    if (ariaMatch) {
      title = ariaMatch[1].replace(/^"|"$/g, "").trim();
      date = parseMonthName(ariaMatch[2]);
    } else {
      const slug = url.split("/event/")[1]?.split("/")[0] ?? "";
      title = slug
        .replace(/-/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());
    }

    const showtime = $el.find(".see-showtime").first().text().trim();
    if (date && showtime) {
      const tm = showtime.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
      if (tm) {
        let h = parseInt(tm[1], 10) % 12;
        if (tm[3].toUpperCase() === "PM") h += 12;
        date.setHours(h, parseInt(tm[2], 10));
      }
    }

    const genre = $el.find(".genre").first().text().trim() || null;
    const imageUrl = $el.find("img").first().attr("src") ?? null;

    out.push({
      title,
      description: genre,
      url,
      venue: venue.name,
      city: venue.city,
      area: venue.area,
      topics: defaultTopics(title, genre),
      startsAt: date,
      endsAt: null,
      isOnline: false,
      imageUrl,
      sourceId: url,
      submitterEmail: null,
    });
  });

  return out;
}

// ---------- The Chapel (See Tickets embed) ----------

export async function scrapeChapel(): Promise<ScrapedEvent[]> {
  const html = await fetchHtml("https://www.thechapelsf.com/music");
  if (!html) return [];
  return parseSeeTicketsHTML(html, {
    name: "The Chapel",
    area: "sf",
    city: "San Francisco",
  });
}

// ---------- Great American Music Hall (See Tickets embed) ----------
// gamh.com/calendar/ uses the same See Tickets card markup as The Chapel.
// (We thought this needed headless because seetickets.us itself is bot-blocked,
// but the venue site renders the cards server-side just fine.)

export async function scrapeGamh(): Promise<ScrapedEvent[]> {
  const html = await fetchHtml("https://gamh.com/calendar/");
  if (!html) return [];
  return parseSeeTicketsHTML(html, {
    name: "Great American Music Hall",
    area: "sf",
    city: "San Francisco",
  });
}

// ---------- Public Works (Tixr embed) ----------
// publicsf.com/calendar uses .event-item cards with .event-title, .event-date,
// .event-thumb, and a Tixr URL on the wrapping anchor. Date is "May 23" only —
// time isn't on the calendar, only on the Tixr detail page (which is
// Cloudflare-protected, so we settle for date-only for now).

export async function scrapePublicWorks(): Promise<ScrapedEvent[]> {
  const html = await fetchHtml("https://publicsf.com/calendar");
  if (!html) return [];
  const $ = cheerio.load(html);
  const out: ScrapedEvent[] = [];
  const seen = new Set<string>();

  $(".event-item").each((_, el) => {
    const $el = $(el);
    const anchor = $el.find('a[href*="tixr.com/groups/publicsf"]').first();
    const url = anchor.attr("href")?.split("?")[0] ?? null;
    if (!url) return;
    if (seen.has(url)) return;
    seen.add(url);

    const title = $el.find(".event-title").first().text().trim();
    if (!title) return;
    const dateStr = $el.find(".event-date").first().text().trim();
    const startsAt = parseMonthName(dateStr);
    const imageUrl = $el.find(".event-thumb img").first().attr("src") ?? null;

    out.push({
      title,
      description: null,
      url,
      venue: "Public Works",
      city: "San Francisco",
      area: "sf",
      // Public Works is a club/DJ venue — bias toward nightlife when keywords
      // don't catch (lots of titles are just artist names).
      topics: (() => {
        const t = defaultTopics(title);
        return t.includes("nightlife") ? t : [...t, "nightlife"];
      })(),
      startsAt,
      endsAt: null,
      isOnline: false,
      imageUrl,
      sourceId: url,
      submitterEmail: null,
    });
  });

  return out;
}

// ---------- The combined "venues" scraper ----------
// Adds new venues here as we build them. GAMH (See Tickets bot-blocked),
// Public Works (Tixr Cloudflare-protected), and Bottom of the Hill (90s
// inline-style HTML, brittle to parse) are skipped for v1 — see TODO below.

export async function scrapeVenues(): Promise<ScrapedEvent[]> {
  const all: ScrapedEvent[] = [];
  const sources = [scrapeIndependent, scrapeChapel, scrapeGamh, scrapePublicWorks];
  for (const fn of sources) {
    try {
      const events = await fn();
      all.push(...events);
      await new Promise((r) => setTimeout(r, 600));
    } catch (err) {
      console.error("[venues] scraper threw", err);
    }
  }
  return all;
}

// TODO v2:
// - Bottom of the Hill: their calendar is one giant table of inline-style
//   <font> tags with no semantic HTML. Doable with regex but fragile —
//   would want bespoke parser with extensive testing.
// - More venues to add: The Fillmore, August Hall, The Regency Ballroom,
//   1015 Folsom, Bimbo's 365 (likely See Tickets too — should plug in cleanly).
// - The headless.ts module is in place if we hit a venue that genuinely needs
//   browser rendering. Would run via GitHub Actions cron, not Vercel.
