import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db, subscribers } from "@/lib/db";

export async function GET(req: Request) {
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "missing id" }, { status: 400 });
  await unsubscribe(id);
  return new NextResponse(
    "<html><body style='font-family:sans-serif;padding:48px;text-align:center'><h1>Unsubscribed.</h1><p>You won't receive any more digests.</p></body></html>",
    { headers: { "content-type": "text/html" } },
  );
}

// RFC 8058 one-click unsubscribe: mail providers (Gmail, Yahoo) POST to
// the List-Unsubscribe URL when the user taps their native unsubscribe
// button. Must succeed without any UI.
export async function POST(req: Request) {
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "missing id" }, { status: 400 });
  await unsubscribe(id);
  return NextResponse.json({ ok: true });
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function unsubscribe(id: string) {
  // Postgres throws on malformed uuids — treat them as a silent no-op
  // rather than a 500 (bots probe these links constantly).
  if (!UUID_RE.test(id)) return;
  await db
    .update(subscribers)
    .set({ unsubscribedAt: new Date() })
    .where(eq(subscribers.id, id));
}
