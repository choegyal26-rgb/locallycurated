import { cookies } from "next/headers";

const COOKIE_NAME = "lc_admin";

export async function isAdmin() {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) return false;
  const c = await cookies();
  return c.get(COOKIE_NAME)?.value === password;
}

export async function setAdminCookie(password: string) {
  if (password !== process.env.ADMIN_PASSWORD) return false;
  const c = await cookies();
  c.set(COOKIE_NAME, password, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return true;
}

export async function clearAdminCookie() {
  const c = await cookies();
  c.delete(COOKIE_NAME);
}

export function isCronAuthorized(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const header = req.headers.get("authorization");
  return header === `Bearer ${secret}`;
}
