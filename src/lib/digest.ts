import { and, arrayOverlaps, eq, gte, inArray, isNull, or, sql } from "drizzle-orm";
import { db, events, subscribers, digestLog } from "@/lib/db";
import { sendEmail, unsubscribeHeaders } from "@/lib/email";
import { currentIssueNumber } from "@/lib/issue";
import { format } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";

const TZ = "America/Los_Angeles";
const LOOKBACK_DAYS = 14;

type EventRow = typeof events.$inferSelect;

function fmt(d: Date | null) {
  if (!d) return "Date TBA";
  return formatInTimeZone(d, TZ, "EEE, MMM d · h:mm a zzz");
}

// Field-guide palette — mirrors globals.css. Email clients strip web
// fonts, so Fraunces → Georgia and JetBrains Mono → Courier fallbacks.
const PAPER = "#F5EFE2";
const CARD = "#F1E7CF";
const INK = "#15191C";
const INK_SOFT = "#3a352c";
const MUTED = "#5b5444";
const ACCENT = "#E94B1F";
const HAIRLINE = "rgba(21,25,28,0.25)";
const SERIF = "Georgia,'Times New Roman',serif";
const MONO = "'Courier New',Courier,monospace";

export function buildDigestHTML(opts: {
  events: EventRow[];
  topics: string[];
  unsubscribeUrl: string;
  preferencesUrl?: string;
}) {
  const { events: evs, topics, unsubscribeUrl, preferencesUrl } = opts;
  const issueNo = currentIssueNumber();
  const issueDate = formatInTimeZone(new Date(), TZ, "EEEE, MMMM d").toUpperCase();

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
        <div style="margin-top:34px;">
          <div style="font-family:${MONO};font-size:11px;letter-spacing:3px;text-transform:uppercase;color:${ACCENT};font-weight:bold;">
            &mdash;&nbsp;${escapeHtml(formatAreaName(area))}
          </div>
          ${list
            .map((e) => {
              const calUrl = buildGoogleCalendarUrl(e);
              return `
              <div style="border-top:1px solid ${HAIRLINE};margin-top:12px;padding:16px 0 4px 0;">
                <a href="${escapeAttr(e.url)}" style="font-family:${SERIF};color:${INK};text-decoration:none;font-size:20px;font-style:italic;line-height:1.25;">${escapeHtml(e.title)}</a>
                <div style="font-family:${MONO};color:${MUTED};font-size:11px;letter-spacing:1.5px;text-transform:uppercase;margin-top:6px;">${escapeHtml(fmt(e.startsAt))}${e.venue ? ` &middot; ${escapeHtml(e.venue)}` : ""}</div>
                ${e.description ? `<p style="font-family:${SERIF};color:${INK_SOFT};font-size:14px;line-height:1.55;margin:10px 0 0 0;">${escapeHtml(truncate(e.description, 220))}</p>` : ""}
                <div style="margin-top:10px;padding-bottom:10px;">
                  <a href="${escapeAttr(e.url)}" style="font-family:${MONO};display:inline-block;color:${ACCENT};font-size:12px;letter-spacing:1.5px;text-transform:uppercase;text-decoration:none;font-weight:bold;margin-right:18px;">Details &rarr;</a>
                  ${
                    calUrl
                      ? `<a href="${escapeAttr(calUrl)}" style="font-family:${MONO};display:inline-block;color:${MUTED};font-size:12px;letter-spacing:1.5px;text-transform:uppercase;text-decoration:underline;">+ Calendar</a>`
                      : ""
                  }
                </div>
              </div>`;
            })
            .join("")}
        </div>`,
    )
    .join("");

  return `<!doctype html><html><body style="background:${PAPER};margin:0;padding:28px 16px;">
  <div style="max-width:600px;margin:0 auto;">

    <!-- masthead -->
    <div style="text-align:center;padding-bottom:18px;">
      <div style="font-family:${MONO};font-size:11px;letter-spacing:3px;text-transform:uppercase;color:${MUTED};margin-bottom:10px;">
        &mdash; THE EVENTS DISPATCH &mdash;
      </div>
      <div style="font-family:${SERIF};font-size:34px;letter-spacing:-1px;color:${INK};font-weight:bold;">
        LOCALLY&nbsp;CURATED
      </div>
      <div style="font-family:${MONO};font-size:11px;letter-spacing:2px;text-transform:uppercase;color:${MUTED};margin-top:10px;">
        ISSUE &#8470;${issueNo} &nbsp;&middot;&nbsp; ${issueDate}
      </div>
    </div>

    <!-- card -->
    <div style="background:${CARD};border:1px solid ${INK};padding:28px 26px 20px 26px;">
      <div style="border-bottom:1px solid ${INK};padding-bottom:14px;">
        <span style="font-family:${SERIF};font-style:italic;font-size:17px;color:${INK};line-height:1.5;">${evs.length} ${evs.length === 1 ? "event" : "events"} just announced, matching <em>${escapeHtml(topics.join(", "))}</em>. All upcoming, none past.</span>
      </div>
      ${sections}
    </div>

    <!-- footer -->
    <div style="text-align:center;padding-top:18px;">
      <div style="font-family:${MONO};font-size:10px;letter-spacing:2px;text-transform:uppercase;color:${MUTED};line-height:2;">
        LOCALLYCURATED &middot; A BAY AREA FIELD GUIDE<br/>
        ${preferencesUrl ? `<a href="${escapeAttr(preferencesUrl)}" style="color:${MUTED};">Update your taste</a> &nbsp;&middot;&nbsp;` : ""}
        <a href="${escapeAttr(unsubscribeUrl)}" style="color:${MUTED};">Unsubscribe</a>
      </div>
      <div style="font-family:${SERIF};font-style:italic;font-size:12px;color:${INK_SOFT};margin-top:8px;">
        california &middot; est. mmxxiv
      </div>
    </div>

  </div></body></html>`;
}

function formatAreaName(area: string): string {
  return area.replace(/-/g, " ");
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
