import { NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db, subscribers } from "@/lib/db";
import { TOPIC_IDS, AREA_IDS } from "@/lib/topics";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const Schema = z.object({
  id: z.string().regex(UUID_RE),
  topics: z.array(z.enum(TOPIC_IDS as [string, ...string[]])).min(1),
  areas: z.array(z.enum(AREA_IDS as [string, ...string[]])).default([]),
});

function asArray(v: FormDataEntryValue | FormDataEntryValue[] | null) {
  if (v == null) return [];
  return Array.isArray(v) ? v.map(String) : [String(v)];
}

export async function POST(req: Request) {
  const form = await req.formData();

  // Honeypot — same convention as the subscribe form.
  if (form.get("website")) {
    return NextResponse.redirect(new URL("/preferences/saved", req.url), {
      status: 303,
    });
  }

  const parsed = Schema.safeParse({
    id: form.get("id"),
    topics: form.getAll("topics"),
    areas: asArray(form.getAll("areas")),
  });
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input. Pick at least one topic." },
      { status: 400 },
    );
  }
  const { id, topics, areas } = parsed.data;

  const updated = await db
    .update(subscribers)
    .set({ topics, areas })
    .where(eq(subscribers.id, id))
    .returning({ id: subscribers.id });

  if (updated.length === 0) {
    return NextResponse.json({ error: "Unknown subscriber." }, { status: 404 });
  }

  return NextResponse.redirect(new URL("/preferences/saved", req.url), {
    status: 303,
  });
}
