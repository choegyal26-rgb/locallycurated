import { NextResponse } from "next/server";
import { setAdminCookie } from "@/lib/auth";

export async function POST(req: Request) {
  const form = await req.formData();
  const password = String(form.get("password") ?? "");
  const ok = await setAdminCookie(password);
  if (!ok) {
    return NextResponse.redirect(new URL("/admin/login?error=1", req.url), {
      status: 303,
    });
  }
  return NextResponse.redirect(new URL("/admin", req.url), { status: 303 });
}
