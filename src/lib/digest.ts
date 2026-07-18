import { and, arrayOverlaps, eq, gte, inArray, isNull, or, sql } from "drizzle-orm";
import { db, events, subscribers, digestLog } from "@/lib/db";
import { sendEmail, unsubscribeHeaders } from "@/lib/email";
import { format } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";

const TZ = "America/Los_Angeles";
const LOOKBACK_DAYS = 14;

type EventRow = typeof events.$inferSelect;

function fmt(d: Date | null) {
  if (!d) return "Date TBA";
  return formatInTimeZone(d, TZ, "EEE, MMM d · h:mm a zzz");
}

export function buildDigestHTML(opts: {
  events: EventRow[];
  topics: string[];
  unsubscribeUrl: string;
  preferencesUrl?: string;
}) {
  const { events: evs, topics, unsubscribeUrl, preferencesUrl } = opts;
  const grouped = new Map<string, EventRow[]>();
  for (const e of evs) {
    const key = e.area ?? (e.isOnline ? "Online" : "Bay Area");
    const arr = grouped.get(key) ?? [];
    arr.push(e);
    grouped.set(key, arr);
  }

  const sections = [...grouped.entries()]
    .map(
      ([area, list]) => `
        <h2 style="font-size:14px;text-transform:uppercase;letter-spacing:0.05em;color:#666;margin-top:32px;margin-bottom:8px;">${escapeHtml(area)}</h2>
        ${list
          .map((e) => {
            const calUrl = buildGoogleCalendarUrl(e);
            return `
              <div style="border-top:1px solid #eee;padding:16px 0;">
                <a href="${escapeAttr(e.url)}" style="color:#1a1a1a;text-decoration:none;font-size:18px;font-weight:600;">${escapeHtml(e.title)}</a>
                <div style="color:#666;font-size:13px;margin-top:4px;">${escapeHtml(fmt(e.startsAt))}${e.venue ? ` · ${escapeHtml(e.venue)}` : ""}</div>
                ${e.description ? `<p style="color:#444;font-size:14px;line-height:1.5;margin:8px 0 0 0;">${escapeHtml(truncate(e.description, 220))}</p>` : ""}
                <div style="margin-top:8px;">
                  <a href="${escapeAttr(e.url)}" style="display:inline-block;color:#d2603a;font-size:13px;font-weight:500;margin-right:16px;">Details →</a>
                  ${
                    calUrl
                      ? `<a href="${escapeAttr(calUrl)}" style="display:inline-block;color:#1a73e8;font-size:13px;font-weight:500;">Add to Google Calendar</a>`
                      : ""
                  }
                </div>
              </div>`;
          })
          .join("")}
      `,
    )
    .join("");

  return `<!doctype html><html><body style="font-family:ui-sans-serif,system-ui,sans-serif;background:#fdfaf4;margin:0;padding:24px;">
  <div style="max-width:600px;margin:0 auto;background:#fff;border:1px solid #eee;border-radius:16px;padding:32px;">
    <h1 style="font-size:24px;margin:0 0 8px 0;">LocallyCurated</h1>
    <p style="color:#666;margin:0 0 8px 0;">${evs.length} new ${evs.length === 1 ? "event" : "events"} announced in the last ${LOOKBACK_DAYS} days, matching: <em>${escapeHtml(topics.join(", "))}</em>.</p>
    ${sections}
    <p style="color:#999;font-size:12px;margin-top:32px;border-top:1px solid #eee;padding-top:16px;">
      You're getting this because you subscribed to LocallyCurated.
      ${preferencesUrl ? `<a href="${escapeAttr(preferencesUrl)}" style="color:#999;">Update your taste</a> ·` : ""}
      <a href="${escapeAttr(unsubscribeUrl)}" style="color:#999;">Unsubscribe</a>.
    </p>
  </div></body></html>`;
}

/**
 * Build an "Add to Google Calendar" URL with LocallyCurated branding
 * baked into the title and description so subscribers see the brand
 * every time they look at their calendar.
 *
 * Returns null when the event has no start date (can't create a cal entry).
 */
function buildGoogleCalendarUrl(e: EventRow): string | null {
  if (!e.startsAt) return null;
  const SITE_URL =
    process.env.NEXT_PUBLIC_SITE_URL || "https://locallycurated.co";

  const fmtCal = (d: Date): string =>
    // Google Calendar wants UTC in YYYYMMDDTHHmmssZ format.
    d
      .toISOString()
      .replace(/[-:]/g, "")
      .replace(/\.\d{3}/, "");

  const start = fmtCal(e.startsAt);
  // If no end time, default to 2 hours after start — a reasonable guess.
  const end = fmtCal(e.endsAt ?? new Date(e.startsAt.getTime() + 2 * 60 * 60 * 1000));

  const title = `${e.title} · via LocallyCurated`;
  const detailLines = [
    e.description ? truncate(e.description, 400) : "",
    "",
    `Event link: ${e.url}`,
    "",
    `Discovered through LocallyCurated — biweekly Bay Area events digest.`,
    SITE_URL,
  ]
    .filter(Boolean)
    .join("\n");

  const location = e.venue ?? (e.isOnline ? "Online" : e.area ?? "Bay Area");

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    dates: `${start}/${end}`,
    details: detailLines,
    location,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
function escapeAttr(s: string) {
  return escapeHtml(s);
}
function truncate(s: string, n: number) {
  return s.length > n ? s.slice(0, n - 1) + "…" : s;
}

export async function sendBiweeklyDigests(opts: { dryRun?: boolean } = {}) {
  const subs = await db
    .select()
    .from(subscribers)
    .where(and(eq(subscribers.confirmed, true), isNull(subscribers.unsubscribedAt)));

  const since = new Date(Date.now() - LOOKBACK_DAYS * 24 * 60 * 60 * 1000);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://locallycurated.co";

  // Idempotency: anyone already logged as sent within this issue window
  // is skipped, so a re-fired cron (retry, manual trigger, double
  // schedule) can never double-send the same issue. 10 days splits the
  // difference between the 14-day cadence and clock drift.
  const idempotencyWindow = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);
  const recentSends = opts.dryRun
    ? []
    : await db
        .select({ subscriberId: digestLog.subscriberId })
        .from(digestLog)
        .where(gte(digestLog.sentAt, idempotencyWindow));
  const alreadySent = new Set(recentSends.map((r) => r.subscriberId));

  const summary: {
    email: string;
    count: number;
    sent: boolean;
    skipped?: string;
    error?: string;
    id?: string;
  }[] = [];

  for (const sub of subs) {
    if (alreadySent.has(sub.id)) {
      summary.push({
        email: sub.email,
        count: 0,
        sent: false,
        skipped: "already-sent-this-issue",
      });
      continue;
    }
    const areaClause =
      sub.areas.length > 0
        ? or(
            isNull(events.area),
            inArray(events.area, sub.areas),
            eq(events.isOnline, true),
          )
        : undefined;

    const matched = await db
      .select()
      .from(events)
      .where(
        and(
          eq(events.status, "approved"),
          gte(events.discoveredAt, since),
          // Only include events that haven't already happened (NULL startsAt allowed).
          sql`(${events.startsAt} IS NULL OR ${events.startsAt} >= NOW())`,
          arrayOverlaps(events.topics, sub.topics),
          areaClause,
        ),
      )
      .orderBy(events.startsAt)
      .limit(40);

    if (matched.length === 0) {
      summary.push({ email: sub.email, count: 0, sent: false });
      continue;
    }

    const html = buildDigestHTML({
      events: matched,
      topics: sub.topics,
      unsubscribeUrl: `${siteUrl}/api/unsubscribe?id=${sub.id}`,
      preferencesUrl: `${siteUrl}/preferences?id=${sub.id}`,
    });

    let sendInfo: { sent: boolean; error?: string; id?: string } = {
      sent: false,
    };
    if (!opts.dryRun) {
      const result = await sendEmail({
        to: sub.email,
        subject: `Your Bay Area picks · ${format(new Date(), "MMM d")}`,
        html,
        headers: unsubscribeHeaders(sub.id),
      });
      if ("sent" in result && result.sent) {
        sendInfo = { sent: true, id: result.id };
        await db.insert(digestLog).values({
          subscriberId: sub.id,
          eventCount: String(matched.length),
        });
      } else if ("sent" in result) {
        sendInfo = { sent: false, error: result.error };
      } else {
        sendInfo = { sent: false, error: result.reason };
      }
    }
    summary.push({
      email: sub.email,
      count: matched.length,
      ...sendInfo,
    });
  }
  return summary;
}
