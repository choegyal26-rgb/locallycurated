/**
 * Issue number + next-dispatch helpers.
 *
 * Issue №1 was the first biweekly dispatch on ISSUE_EPOCH.
 * Each issue is 14 days apart. Next dispatch is the upcoming
 * even-ISO-week Sunday at 09:00 PT (= 16:00 UTC).
 */

// First Sunday of 2026 (even ISO week 1's dispatch day). Treat as Issue №1.
const ISSUE_EPOCH = new Date("2026-01-04T16:00:00Z");

export function currentIssueNumber(now: Date = new Date()): number {
  const days = Math.floor((now.getTime() - ISSUE_EPOCH.getTime()) / 86_400_000);
  return Math.max(1, Math.floor(days / 14) + 1);
}

export function nextDispatchDate(now: Date = new Date()): Date {
  // Walk forward to the next Sunday at 16:00 UTC that's on an even ISO week.
  const d = new Date(now);
  d.setUTCHours(16, 0, 0, 0);
  while (d <= now || d.getUTCDay() !== 0 || !isEvenIsoWeek(d)) {
    d.setUTCDate(d.getUTCDate() + 1);
  }
  return d;
}

function isEvenIsoWeek(d: Date): boolean {
  const t = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const day = t.getUTCDay() || 7;
  t.setUTCDate(t.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((+t - +yearStart) / 86_400_000 + 1) / 7);
  return week % 2 === 0;
}

export function formatDispatchDate(d: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Los_Angeles",
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(d);
}

export function formatShortDate(d: Date): string {
  // "M/D" for the magazine-style pin meta line.
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Los_Angeles",
    month: "numeric",
    day: "numeric",
  }).format(d);
}
