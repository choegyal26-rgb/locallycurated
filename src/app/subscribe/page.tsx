import type { Metadata } from "next";
import { SiteBar, SiteFooter } from "@/components/SiteBar";
import { TOPICS, AREAS } from "@/lib/topics";

export const metadata: Metadata = {
  title: "Tell us what you'd hate to miss",
  description:
    "Pick your topics and the parts of the Bay you actually go to. One curated dispatch every other Sunday.",
  alternates: { canonical: "/subscribe" },
};

// Icon glyphs paired with each topic id — keeps the design intent
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

// Approx latitude tag per area for the visual flourish
const AREA_TAGS: Record<string, string> = {
  sf: "37.77°N",
  "east-bay": "37.80°N",
  peninsula: "37.55°N",
  "south-bay": "37.34°N",
  "north-bay": "38.08°N",
};

export default function SubscribePage() {
  return (
    <main className="frame">
      <SiteBar
        issue={{ primary: "Subscribe", secondary: "Step 01 · Your Taste" }}
        variant="preferences"
      />

      <section className="masthead pref-masthead" style={{ textAlign: "left", padding: "60px 0 30px" }}>
        <p className="pref-crumb">
          <span className="dash"></span>STEP 01 · TELL US YOUR TASTE
        </p>
        <h1>
          Tell us what <em>you&apos;d hate</em> to miss.
        </h1>
        <p className="deck">
          We send one curated dispatch every other Sunday. The more we know about{" "}
          <em>your</em> Bay Area, the better the issue lands. Two minutes — we promise.
        </p>
      </section>

      <form action="/api/subscribe" method="POST" className="card">
        {/* Honeypot — hidden from real users, bots fill it */}
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
          <label className="field-label" htmlFor="email">
            <span className="num">01 ·</span> Email
            <small>where we send the letter</small>
          </label>
          <input
            id="email"
            name="email"
            className="email-input"
            type="email"
            placeholder="you@bay.area"
            required
          />
        </div>

        <div className="field-block">
          <p className="field-label">
            <span className="num">02 ·</span> What are you into?
            <small>pick at least one — pick many</small>
          </p>
          <div className="chips" role="group" aria-label="Interests">
            {TOPICS.map((t) => (
              <label className="chip" key={t.id}>
                <input type="checkbox" name="topics" value={t.id} />
                <span className="box"></span>
                {t.label}
                <span className="ico">{TOPIC_ICONS[t.id] ?? "·"}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="field-block">
          <p className="field-label">
            <span className="num">03 ·</span> Where in the Bay?
            <small>pick the parts you actually go to</small>
          </p>
          <div className="chips regions" role="group" aria-label="Regions">
            {AREAS.map((a) => (
              <label className="chip" key={a.id}>
                <input type="checkbox" name="areas" value={a.id} />
                <span className="box"></span>
                {a.label}
                <span className="ico">{AREA_TAGS[a.id] ?? ""}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="side-note">
          Every issue is hand-curated against your picks — never an algorithm, never a feed.
          Change your taste any time from the link in the email.
        </div>

        <div className="submit-row">
          <button type="submit" className="btn">
            <span>Subscribe — it&apos;s free</span>
            <svg width="20" height="12" viewBox="0 0 20 12" fill="none">
              <path d="M0 6H18M12 1l6 5-6 5" stroke="currentColor" strokeWidth="1.4" />
            </svg>
          </button>
          <span className="micro">
            <b>Every other Sunday.</b> One-click unsubscribe in every email.
          </span>
        </div>
      </form>

      <SiteFooter />
    </main>
  );
}
