import { fromZonedTime } from "date-fns-tz";

export const BAY_AREA_TZ = "America/Los_Angeles";

/**
 * Parse a `datetime-local` form value ("2026-08-21T18:00") as Bay Area
 * wall-clock time.
 *
 * `new Date("2026-08-21T18:00")` interprets an offset-less datetime in the
 * *server's* timezone. Vercel runs in UTC, so a submitter typing 6:00 PM got
 * stored as 18:00Z and advertised to subscribers as 11:00 AM Pacific. Every
 * form here collects Bay Area event times, so anchor them to Pacific.
 */
export function parseBayAreaLocal(value: string): Date {
  return fromZonedTime(value, BAY_AREA_TZ);
}
