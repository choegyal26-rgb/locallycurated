import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { db, events, subscribers } from "@/lib/db";
import { eq, desc, sql } from "drizzle-orm";
import { TOPICS, AREAS } from "@/lib/topics";

export const dynamic = "force-dynamic";

export default async function AdminHome() {
  if (!(await isAdmin())) redirect("/admin/login");

  const pending = await db
    .select()
    .from(events)
    .where(eq(events.status, "pending"))
    .orderBy(desc(events.discoveredAt))
    .limit(50);

  const [{ subCount }] = await db
    .select({ subCount: sql<number>`count(*)::int` })
    .from(subscribers);

  const [{ approvedCount }] = await db
    .select({ approvedCount: sql<number>`count(*)::int` })
    .from(events)
    .where(eq(events.status, "approved"));

  return (
    <div className="mx-auto max-w-3xl px-6 pt-6 pb-24 space-y-10">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Admin</h1>
        <p className="mt-2 text-neutral-700">
          {subCount} subscribers · {approvedCount} approved events
        </p>
      </div>

      <section>
        <h2 className="text-xl font-semibold mb-3">
          Pending submissions ({pending.length})
        </h2>
        {pending.length === 0 && (
          <p className="text-neutral-500 text-sm">Nothing waiting.</p>
        )}
        <div className="space-y-3">
          {pending.map((e) => (
            <div
              key={e.id}
              className="rounded-xl bg-white border border-neutral-200 p-4"
            >
              <div className="flex justify-between items-start gap-4">
                <div>
                  <a
                    href={e.url}
                    target="_blank"
                    rel="noreferrer"
                    className="font-semibold hover:underline"
                  >
                    {e.title}
                  </a>
                  <div className="text-sm text-neutral-600 mt-1">
                    {e.area ?? "—"}
                    {e.venue ? ` · ${e.venue}` : ""}
                    {e.startsAt
                      ? ` · ${new Date(e.startsAt).toLocaleString("en-US", { timeZone: "America/Los_Angeles" })}`
                      : ""}
                  </div>
                  <div className="text-xs text-neutral-500 mt-1">
                    Topics: {e.topics.join(", ") || "—"} · From:{" "}
                    {e.submitterEmail ?? "(scraped)"}
                  </div>
                  {e.description && (
                    <p className="text-sm mt-2 text-neutral-700 line-clamp-3">
                      {e.description}
                    </p>
                  )}
                </div>
                <div className="flex flex-col gap-2 shrink-0">
                  <form action="/api/admin/approve" method="POST">
                    <input type="hidden" name="id" value={e.id} />
                    <button className="px-3 py-1.5 rounded-lg bg-[var(--accent)] text-white text-sm">
                      Approve
                    </button>
                  </form>
                  <form action="/api/admin/reject" method="POST">
                    <input type="hidden" name="id" value={e.id} />
                    <button className="px-3 py-1.5 rounded-lg border border-neutral-300 text-sm">
                      Reject
                    </button>
                  </form>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-3">Add an event manually</h2>
        <form
          action="/api/admin/add"
          method="POST"
          className="rounded-2xl bg-white border border-neutral-200 p-6 space-y-4"
        >
          <input
            name="title"
            required
            placeholder="Title"
            className="w-full rounded-lg border border-neutral-300 px-3 py-2"
          />
          <input
            name="url"
            type="url"
            required
            placeholder="URL"
            className="w-full rounded-lg border border-neutral-300 px-3 py-2"
          />
          <div className="grid sm:grid-cols-2 gap-3">
            <input
              name="venue"
              placeholder="Venue"
              className="w-full rounded-lg border border-neutral-300 px-3 py-2"
            />
            <select
              name="area"
              className="w-full rounded-lg border border-neutral-300 px-3 py-2"
            >
              <option value="">— Area —</option>
              {AREAS.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.label}
                </option>
              ))}
            </select>
          </div>
          <input
            name="startsAt"
            type="datetime-local"
            required
            className="w-full rounded-lg border border-neutral-300 px-3 py-2"
          />
          <textarea
            name="description"
            rows={3}
            placeholder="Description"
            className="w-full rounded-lg border border-neutral-300 px-3 py-2"
          />
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {TOPICS.map((t) => (
              <label
                key={t.id}
                className="flex items-center gap-2 text-sm border border-neutral-200 rounded-lg px-3 py-2"
              >
                <input type="checkbox" name="topics" value={t.id} />
                {t.label}
              </label>
            ))}
          </div>
          <button className="rounded-lg bg-[var(--accent)] text-white px-4 py-2 font-medium">
            Add event
          </button>
        </form>
      </section>
    </div>
  );
}
