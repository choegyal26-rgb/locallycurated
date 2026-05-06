import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db, subscribers } from "@/lib/db";

export async function GET(req: Request) {
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "missing id" }, { status: 400 });
  await db
    .update(subscribers)
    .set({ unsubscribedAt: new Date() })
    .where(eq(subscribers.id, id));
  return new NextResponse(
    "<html><body style='font-family:sans-serif;padding:48px;text-align:center'><h1>Unsubscribed.</h1><p>You won't receive any more digests.</p></body></html>",
    { headers: { "content-type": "text/html" } },
  );
}
