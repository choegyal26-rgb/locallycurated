import type { Metadata } from "next";
import { eq } from "drizzle-orm";
import { SiteBar, SiteFooter } from "@/components/SiteBar";
import { db, subscribers } from "@/lib/db";
import { TOPICS, AREAS } from "@/lib/topics";

export const metadata: Metadata = {
  title: "Update your taste",
  description: "Change the topics and Bay Area regions in your dispatch.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const TOPIC_ICONS: Record<string, string> = {
  music: "♪",
  nightlife: "◐",
  food: "⊙",
  art: "◊",
  tech: "▴",
  comedy: "!",
  sports: "◯",
  outdoors: "▲",
  family: "✿",
  film: "▶",
  wellness: "~",
  community: "◈",
};

const AREA_TAGS: Record<string, string> = {
  sf: "37.77°N",
  "east-bay": "37.80°N",
  peninsula: "37.55°N",
  "south-bay": "37.34°N",
  "north-bay": "38.08°N",
};

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function PreferencesPage({
  searchParams,
}: {
  searchParams?: Promise<{ id?: string }>;
}) {
  const { id } = (await searchParams) ?? {};

  const sub =
    id && UUID_RE.test(id)
      ? (
          await db
            .select({
              id: subscribers.id,
              email: subscribers.email,
              topics: subscribers.topics,
              areas: subscribers.areas,
            })
            .from(subscribers)
            .where(eq(subscribers.id, id))
        )[0]
      : undefined;

  if (!sub) {
    return (
      <main className="frame">
        <SiteBar
          issue={{ primary: "Preferences", secondary: "Manage · Your Taste" }}
          variant="preferences"
        />
        <section
          className="masthead pref-masthead"
          style={{ textAlign: "left", padding: "60px 0 30px" }}
        >
          <p className="pref-crumb">
            <span className="dash"></span>MANAGE PREFERENCES
          </p>
          <h1>
            We couldn&apos;t find <em>that link</em>.
          </h1>
          <p className="deck">
            Preference links are personal — open the one from any LocallyCurated
            email footer. If yours stopped working, just{" "}
            <a href="/subscribe" style={{ textDecoration: "underline" }}>
              re-subscribe
            </a>{" "}
            with the same address; your spot updates in place.
          </p>
        </section>
        <SiteFooter />
      </main>
    );
  }

  const maskedEmail = maskEmail(sub.email);

  return (
    <main className="frame">
      <SiteBar
        issue={{ primary: "Preferences", secondary: "Manage · Your Taste" }}
        variant="preferences"
      />

      <section
        className="masthead pref-masthead"
        style={{ textAlign: "left", padding: "60px 0 30px" }}
      >
        <p className="pref-crumb">
          <span className="dash"></span>MANAGE PREFERENCES · {maskedEmail.toUpperCase()}
        </p>
        <h1>
          Taste <em>changes</em>. Update yours.
        </h1>
        <p className="deck">
          Adjust what we watch for and where. Your next dispatch reflects it
          immediately — no re-signup, no fuss.
        </p>
      </section>

      <form action="/api/preferences" method="POST" className="card">
        <input type="hidden" name="id" value={sub.id} />

        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            left: "-9999px",
            width: "1px",
            height: "1px",
            overflow: "hidden",
          }}
        >
          <label htmlFor="website">Leave this empty</label>
          <input
            id="website"
            name="website"
            type="text"
            tabIndex={-1}
            autoComplete="off"
          />
        </div>

        <div className="field-block">
          <p className="field-label">
            <span className="num">01 ·</span> What are you into?
            <small>pick at least one — pick many</small>
          </p>
          <div className="chips" role="group" aria-label="Interests">
            {TOPICS.map((t) => (
              <label className="chip" key={t.id}>
                <input
                  type="checkbox"
                  name="topics"
                  value={t.id}
                  defaultChecked={sub.topics.includes(t.id)}
                />
                <span className="box"></span>
                {t.label}
                <span className="ico">{TOPIC_ICONS[t.id] ?? "·"}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="field-block">
          <p className="field-label">
            <span className="num">02 ·</span> Where in the Bay?
            <small>pick the parts you actually go to</small>
          </p>
          <div className="chips regions" role="group" aria-label="Regions">
            {AREAS.map((a) => (
              <label className="chip" key={a.id}>
                <input
                  type="checkbox"
                  name="areas"
                  value={a.id}
                  defaultChecked={sub.areas.includes(a.id)}
                />
                <span className="box"></span>
                {a.label}
                <span className="ico">{AREA_TAGS[a.id] ?? ""}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="side-note">
          Prefer silence instead? There&apos;s a one-click unsubscribe at the
          bottom of every email — no hard feelings.
        </div>

        <div className="submit-row">
          <button type="submit" className="btn">
            <span>Save my taste</span>
            <svg width="20" height="12" viewBox="0 0 20 12" fill="none">
              <path d="M0 6H18M12 1l6 5-6 5" stroke="currentColor" strokeWidth="1.4" />
            </svg>
          </button>
          <span className="micro">
            <b>Takes effect next dispatch.</b> Nothing else changes.
          </span>
        </div>
      </form>

      <SiteFooter />
    </main>
  );
}

function maskEmail(email: string): string {
  const [user, domain] = email.split("@");
  if (!domain) return email;
  const visible = user.slice(0, 2);
  return `${visible}${"•".repeat(Math.max(1, user.length - 2))}@${domain}`;
}
