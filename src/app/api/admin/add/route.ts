import { NextResponse } from "next/server";
import { z } from "zod";
import { db, events } from "@/lib/db";
import { isAdmin } from "@/lib/auth";
import { TOPIC_IDS, AREA_IDS } from "@/lib/topics";
import { randomUUID } from "node:crypto";

const Schema = z.object({
  title: z.string().min(3),
  url: z.string().url(),
  venue: z.string().optional().nullable(),
  area: z.enum(AREA_IDS as [string, ...string[]]).optional().nullable(),
  startsAt: z.string().min(1),
  description: z.string().optional().nullable(),
  topics: z.array(z.enum(TOPIC_IDS as [string, ...string[]])).default([]),
});

export async function POST(req: Request) {
  if (!(await isAdmin())) return new NextResponse("Unauthorized", { status: 401 });
  const form = await req.formData();
  const parsed = Schema.safeParse({
    title: form.get("title"),
    url: form.get("url"),
    venue: form.get("venue") || null,
    area: form.get("area") || null,
    startsAt: form.get("startsAt"),
    description: form.get("description") || null,
    topics: form.getAll("topics"),
  });
  if (!parsed.success) return NextResponse.json(parsed.error.flatten(), { status: 400 });
  const v = parsed.data;
  await db.insert(events).values({
    title: v.title,
    url: v.url,
    venue: v.venue ?? null,
    area: v.area ?? null,
    startsAt: new Date(v.startsAt),
    description: v.description ?? null,
    topics: v.topics,
    source: "manual",
    sourceId: `manual:${randomUUID()}`,
    status: "approved",
  });
  return NextResponse.redirect(new URL("/admin", req.url), { status: 303 });
}
