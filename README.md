# LocallyCurated

🌐 **Live at https://locallycurated.co**

A biweekly Bay Area events digest. Tell us your topics + neighborhoods, we send a personalized list of newly announced concerts, food fests, meetups, art shows, and conferences. Sources: scrapers (Funcheap, Eventbrite, Ticketmaster, Luma) + organizer self-submission moderated through an admin page.

## Quickstart

```bash
cd ~/locallycurated
cp .env.example .env.local
# fill in DATABASE_URL, RESEND_API_KEY, ADMIN_PASSWORD, CRON_SECRET

npm install
npm run db:generate   # create migration from schema
npm run db:migrate    # apply to database
npm run dev
```

Open http://localhost:3000.

## Stack

- **Next.js 15** (App Router) on Vercel
- **Postgres** via Drizzle ORM (Neon or Supabase recommended)
- **Resend** for email delivery
- **Vercel Cron** for scheduled scrape + digest jobs
- **Tailwind CSS** for styling

## Routes

| Path | What |
| --- | --- |
| `/` | Public signup (email + topics + Bay Area area) |
| `/submit` | Organizer submission form (queued for review) |
| `/admin` | Moderation queue + manual event entry (password-gated) |
| `/admin/login` | Admin login |
| `/api/cron/scrape` | Daily — runs all scrapers, upserts events |
| `/api/cron/digest` | Biweekly — sends personalized digests |
| `/api/unsubscribe?id=…` | One-click unsubscribe |

## Cron schedule (Vercel)

Defined in [`vercel.json`](./vercel.json):

- `/api/cron/scrape` — daily at 08:00 UTC
- `/api/cron/digest` — every other Sunday at 16:00 UTC

Vercel sends `Authorization: Bearer $CRON_SECRET` automatically when `CRON_SECRET` is set as an env var.

## Digest semantics — important

Per product decision: the digest contains events **announced (discovered) in the last 14 days**, not events happening in the next 14 days. A DJ tour announced today for next October still gets sent. Past events (whose `starts_at` is already gone) are filtered out before sending so we don't recommend stale stuff.

The query is in [`src/lib/digest.ts`](src/lib/digest.ts) — adjust `LOOKBACK_DAYS` there.

## Scrapers

Each scraper lives in `src/lib/scrapers/<name>.ts` and exports a `scrape*` function returning `ScrapedEvent[]`. The orchestrator in `index.ts` upserts on `(source, sourceId)` so reruns are idempotent.

| Source | Status | Notes |
| --- | --- | --- |
| **Eventbrite** | Working | Scrapes JSON-LD from public city pages (6 Bay Area cities). |
| **Luma** | Working | Scrapes JSON-LD from city discover pages. Tech/AI-leaning. |
| **Funcheap** | Working | SF RSS feed. Topic inference via keyword matching. |
| **Venues** (combined) | Working | The Independent, The Chapel, GAMH, Public Works — see `venues.ts`. |
| Ticketmaster | Working (needs key) | Discovery API, 50-mile radius around SF. Set `TICKETMASTER_API_KEY`. |
| Headless (Playwright) | Helper available, unused | `headless.ts` is in place for venues that genuinely need a browser. Local-only — too heavy for Vercel cron. Plan: GitHub Actions runner. |

Run a single scraper locally:

```bash
npm run scrape:funcheap
```

Add a new scraper: drop a file in `src/lib/scrapers/`, register it in `index.ts`.

## Topics & areas

Edit [`src/lib/topics.ts`](src/lib/topics.ts) to add categories or Bay Area regions. The signup form, submission form, admin form, and digest filter all read from this single source.

## Out of scope for v1

- Organizer accounts/dashboards (just a submission form for now)
- Paid promotion tiers
- Multi-city expansion
- Recommendation ML
- Calendar sync (.ics)
- Mobile app

## Deploying to Vercel

1. `vercel link`
2. Add env vars: `DATABASE_URL`, `RESEND_API_KEY`, `RESEND_FROM`, `RESEND_WEBHOOK_SECRET`, `ADMIN_PASSWORD`, `ADMIN_EMAIL`, `CRON_SECRET`, `NEXT_PUBLIC_SITE_URL`
3. `vercel --prod`
4. Cron jobs auto-register from `vercel.json`
