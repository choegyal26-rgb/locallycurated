import { NextResponse } from "next/server";
import { z } from "zod";
import { db, subscribers } from "@/lib/db";
import { TOPIC_IDS, AREA_IDS } from "@/lib/topics";
import { sql } from "drizzle-orm";

const Schema = z.object({
  email: z.string().email().toLowerCase().trim(),
  topics: z.array(z.enum(TOPIC_IDS as [string, ...string[]])).min(1),
  areas: z.array(z.enum(AREA_IDS as [string, ...string[]])).default([]),
});

function asArray(v: FormDataEntryValue | FormDataEntryValue[] | null) {
  if (v == null) return [];
  return Array.isArray(v) ? v.map(String) : [String(v)];
}

export async function POST(req: Request) {
  const form = await req.formData();
  const parsed = Schema.safeParse({
    email: form.get("email"),
    topics: form.getAll("topics"),
    areas: asArray(form.getAll("areas")),
  });
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input. Pick at least one topic and a valid email." },
      { status: 400 },
    );
  }
  const { email, topics, areas } = parsed.data;

  await db
    .insert(subscribers)
    .values({ email, topics, areas })
    .onConflictDoUpdate({
      target: subscribers.email,
      set: {
        topics,
        areas,
        unsubscribedAt: sql`NULL`,
      },
    });

  return NextResponse.redirect(new URL("/thanks", req.url), { status: 303 });
}
