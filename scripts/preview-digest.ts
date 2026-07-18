/**
 * One-off: send a preview of the redesigned digest to a single email,
 * using their real subscription + real matched events.
 * Usage: tsx scripts/preview-digest.ts [email]
 */
import { and, arrayOverlaps, eq, gte, isNull, inArray, or, sql } from "drizzle-orm";
import { db, events, subscribers } from "../src/lib/db";
import { buildDigestHTML } from "../src/lib/digest";
import { sendEmail, unsubscribeHeaders } from "../src/lib/email";

async function main() {
  const target = process.argv[2] ?? "choegyal26@gmail.com";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://locallycurated.co";

  const [sub] = await db
    .select()
    .from(subscribers)
    .where(eq(subscribers.email, target));
  if (!sub) throw new Error(`subscriber not found: ${target}`);

  const since = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
  const areaClause =
    sub.areas.length > 0
      ? or(isNull(events.area), inArray(events.area, sub.areas), eq(events.isOnline, true))
      : undefined;

  const matched = await db
    .select()
    .from(events)
    .where(
      and(
        eq(events.status, "approved"),
        gte(events.discoveredAt, since),
        sql`(${events.startsAt} IS NULL OR ${events.startsAt} >= NOW())`,
        arrayOverlaps(events.topics, sub.topics),
        areaClause,
      ),
    )
    .orderBy(events.startsAt)
    .limit(40);

  console.log(`matched ${matched.length} events for ${target}`);

  const html = buildDigestHTML({
    events: matched,
    topics: sub.topics,
    unsubscribeUrl: `${siteUrl}/api/unsubscribe?id=${sub.id}`,
    preferencesUrl: `${siteUrl}/preferences?id=${sub.id}`,
  });

  const result = await sendEmail({
    to: target,
    subject: "[preview] Redesigned dispatch — field guide look",
    html,
    headers: unsubscribeHeaders(sub.id),
  });
  console.log("send:", JSON.stringify(result));
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
