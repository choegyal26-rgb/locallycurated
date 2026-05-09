/**
 * One-off: send welcome email to specified existing subscribers.
 * Usage: tsx scripts/send-welcomes.ts email1 email2 ...
 * Pulls subscriber IDs from DB, sends a randomly-picked welcome variant.
 */
import { db, subscribers } from "../src/lib/db";
import { eq } from "drizzle-orm";
import { sendWelcome } from "../src/lib/welcome";

async function main() {
  const targets = process.argv.slice(2);
  if (targets.length === 0) {
    console.error("usage: tsx scripts/send-welcomes.ts <email> [email...]");
    process.exit(1);
  }
  for (const email of targets) {
    const rows = await db
      .select({ id: subscribers.id, email: subscribers.email })
      .from(subscribers)
      .where(eq(subscribers.email, email.toLowerCase().trim()));
    if (rows.length === 0) {
      console.log(`SKIP ${email} — not in DB`);
      continue;
    }
    const sub = rows[0];
    const result = await sendWelcome({ to: sub.email, subscriberId: sub.id });
    console.log(`${sub.email} →`, result);
  }
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
