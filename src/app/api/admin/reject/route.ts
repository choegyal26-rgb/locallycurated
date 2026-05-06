import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db, events } from "@/lib/db";
import { isAdmin } from "@/lib/auth";

export async function POST(req: Request) {
  if (!(await isAdmin())) return new NextResponse("Unauthorized", { status: 401 });
  const form = await req.formData();
  const id = String(form.get("id") ?? "");
  if (!id) return new NextResponse("missing id", { status: 400 });
  await db.update(events).set({ status: "rejected" }).where(eq(events.id, id));
  return NextResponse.redirect(new URL("/admin", req.url), { status: 303 });
}
