import Link from "next/link";
import { TOPICS, AREAS } from "@/lib/topics";

export default function Home() {
  return (
    <div className="mx-auto max-w-5xl px-6">
      <Hero />
      <Marquee />
      <HowItWorks />
      <SamplePreview />
      <SignupCard />
      <OrganizerCTA />
      <FAQ />
    </div>
  );
}

function Hero() {
  return (
    <section className="relative pt-10 sm:pt-16 pb-12 grain rounded-3xl">
      <div className="relative max-w-3xl">
        <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-[var(--accent)]">
          <span className="inline-block w-6 h-px bg-[var(--accent)]" />
          A biweekly Bay Area dispatch
        </span>
        <h1 className="serif mt-5 text-5xl sm:text-6xl leading-[1.05] tracking-tight">
          You missed it because{" "}
          <span className="italic text-[var(--plum)]">nobody told you</span>.
        </h1>
        <p className="mt-6 text-lg sm:text-xl text-[var(--ink-soft)] leading-relaxed max-w-2xl">
          Concerts, food fests, art openings, AI meetups, comedy nights — every
          two weeks we surface what just got announced near you, filtered to the
          things you actually care about.
        </p>
        <div className="mt-8 flex items-center gap-4">
          <a
            href="#signup"
            className="inline-flex items-center gap-2 rounded-full bg-[var(--ink)] text-[var(--bg)] px-6 py-3 font-medium hover:bg-[var(--accent)] transition-colors"
          >
            Get the next digest
            <span aria-hidden>→</span>
          </a>
          <Link
            href="#sample"
            className="text-sm underline underline-offset-4 decoration-[var(--accent)] hover:text-[var(--accent)]"
          >
            See a sample
          </Link>
        </div>
      </div>
      <DecorativeStamp />
    </section>
  );
}

function DecorativeStamp() {
  return (
    <svg
      viewBox="0 0 200 200"
      aria-hidden
      className="hidden md:block absolute right-4 top-12 w-44 h-44 text-[var(--accent)] opacity-80"
    >
      <defs>
        <path
          id="circ"
          d="M 100, 100 m -78, 0 a 78,78 0 1,1 156,0 a 78,78 0 1,1 -156,0"
        />
      </defs>
      <circle
        cx="100"
        cy="100"
        r="92"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
      />
      <circle
        cx="100"
        cy="100"
        r="64"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
      />
      <text fill="currentColor" fontSize="11" letterSpacing="3">
        <textPath href="#circ" startOffset="0">
          BAY AREA · BIWEEKLY · CURATED · BAY AREA · BIWEEKLY · CURATED ·
        </textPath>
      </text>
      <text
        x="100"
        y="95"
        textAnchor="middle"
        fill="currentColor"
        fontSize="10"
        fontWeight="600"
        letterSpacing="2"
      >
        EST.
      </text>
      <text
        x="100"
        y="115"
        textAnchor="middle"
        fill="currentColor"
        fontSize="22"
        fontWeight="700"
      >
        2026
      </text>
    </svg>
  );
}

function Marquee() {
  const items = [
    "Outside Lands",
    "Funcheap",
    "AI Tinkerers",
    "Eventbrite",
    "The Independent",
    "Ferry Building",
    "Resident Advisor",
    "Lu.ma",
    "Stern Grove",
    "Ticketmaster",
    "SFMOMA",
    "Punch Line",
  ];
  return (
    <section className="my-10 border-y border-[var(--line)] py-5 overflow-hidden">
      <div className="flex items-center gap-3 text-xs uppercase tracking-widest text-neutral-500 mb-3">
        <span className="w-6 h-px bg-neutral-400" />
        Pulling from
      </div>
      <div className="relative w-full overflow-hidden">
        <div className="marquee flex gap-10 whitespace-nowrap text-2xl serif text-neutral-700">
          {[...items, ...items].map((item, i) => (
            <span key={i} className="flex items-center gap-10">
              {item}
              <span aria-hidden className="text-[var(--accent)]">
                ◆
              </span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    {
      n: "01",
      title: "Tell us your taste",
      body: "Pick the topics that move you — DJs, food, AI, art, comedy — and the parts of the Bay you actually go to.",
    },
    {
      n: "02",
      title: "We do the doomscrolling",
      body: "Our scrapers comb venue calendars, ticket sites, and event platforms daily. Organizers can submit directly too.",
    },
    {
      n: "03",
      title: "One email, every two weeks",
      body: "A short list of what was just announced — not a flood, not yesterday's news. Everything still upcoming.",
    },
  ];
  return (
    <section id="how" className="py-16">
      <SectionHeader eyebrow="How it works" title="No more missed announcements." />
      <div className="grid sm:grid-cols-3 gap-6 mt-8">
        {steps.map((s) => (
          <div
            key={s.n}
            className="rounded-2xl bg-white border border-[var(--line)] p-6"
          >
            <div className="text-xs tracking-widest text-[var(--accent)]">
              STEP {s.n}
            </div>
            <h3 className="mt-3 serif text-2xl">{s.title}</h3>
            <p className="mt-3 text-[var(--ink-soft)] leading-relaxed">
              {s.body}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

function SamplePreview() {
  const sample = [
    {
      area: "San Francisco",
      tag: "Music",
      title: "Floating Points · Live at The Midway",
      meta: "Sat, Jun 21 · 9:00 PM · The Midway",
      blurb:
        "First Bay Area date in three years. Tickets dropped Tuesday — selling fast.",
      accent: "var(--accent)",
    },
    {
      area: "East Bay",
      tag: "Food & Drink",
      title: "Oakland Night Market · Jingletown",
      meta: "Fri–Sun, Jun 13 · 5:00 PM · Jingletown",
      blurb:
        "60+ vendors. Lao sticky rice, Salvadoran pupusas, and a sound system from Lower Bottoms.",
      accent: "var(--gold)",
    },
    {
      area: "South Bay",
      tag: "Tech & AI",
      title: "AI Tinkerers · Robotics Demo Night",
      meta: "Wed, Jun 18 · 6:30 PM · Palo Alto",
      blurb:
        "Five teams showing what they built this month. RSVP-only, free pizza, real demos (no decks).",
      accent: "var(--plum)",
    },
  ];

  return (
    <section id="sample" className="py-16">
      <SectionHeader
        eyebrow="A sample digest"
        title="What lands in your inbox."
      />
      <div className="mt-8 rounded-3xl bg-white border border-[var(--line)] p-6 sm:p-10 shadow-sm">
        <div className="flex items-center justify-between text-xs uppercase tracking-widest text-neutral-500 pb-4 border-b border-[var(--line)]">
          <span>Issue №14 · Bay Area</span>
          <span>Sun, Jun 8 · 9:00 AM</span>
        </div>
        <h3 className="serif text-3xl mt-6">12 newly announced events for you</h3>
        <p className="mt-2 text-[var(--ink-soft)]">
          Filtered to <em>Music · Food · Tech</em> across SF, East Bay, South Bay.
        </p>

        <div className="mt-6 divide-y divide-[var(--line)]">
          {sample.map((e, i) => (
            <article
              key={i}
              className="py-5 flex flex-col sm:flex-row sm:items-baseline gap-3 sm:gap-6"
            >
              <div className="sm:w-32 shrink-0">
                <span
                  className="inline-block text-[10px] uppercase tracking-widest font-semibold px-2 py-0.5 rounded-full"
                  style={{
                    color: e.accent,
                    background: "color-mix(in oklab, " + e.accent + " 15%, white)",
                  }}
                >
                  {e.tag}
                </span>
                <div className="text-xs text-neutral-500 mt-1.5">{e.area}</div>
              </div>
              <div className="flex-1">
                <h4 className="serif text-xl leading-snug">{e.title}</h4>
                <div className="text-xs text-neutral-500 mt-1">{e.meta}</div>
                <p className="mt-1.5 text-sm text-[var(--ink-soft)]">
                  {e.blurb}
                </p>
              </div>
            </article>
          ))}
          <div className="py-5 flex items-center text-sm text-neutral-500">
            <span className="dot-leader flex-1 h-3 mr-3 text-neutral-300" />
            <span>+9 more events</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function SignupCard() {
  return (
    <section id="signup" className="py-12">
      <SectionHeader eyebrow="Sign up" title="Tell us what you'd hate to miss." />
      <form
        action="/api/subscribe"
        method="POST"
        className="mt-8 rounded-3xl bg-white border border-[var(--line)] p-6 sm:p-10 space-y-8 shadow-sm"
      >
        <div className="grid sm:grid-cols-[1fr_auto] gap-3 items-end">
          <div className="flex-1">
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="you@bay.area"
              className="w-full rounded-lg border border-neutral-300 px-4 py-3 text-base outline-none focus:border-[var(--accent)] bg-[var(--bg)]"
            />
          </div>
        </div>

        <fieldset>
          <legend className="text-sm font-medium mb-3">
            What are you into?{" "}
            <span className="text-neutral-500 font-normal">
              (pick at least one)
            </span>
          </legend>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {TOPICS.map((t) => (
              <label
                key={t.id}
                className="group flex items-center gap-2 rounded-lg border border-[var(--line)] px-3 py-2.5 cursor-pointer hover:border-[var(--accent)] has-[:checked]:bg-[var(--accent-soft)] has-[:checked]:border-[var(--accent)]"
              >
                <input
                  type="checkbox"
                  name="topics"
                  value={t.id}
                  className="accent-[var(--accent)]"
                />
                <span className="text-sm">{t.label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="text-sm font-medium mb-3">
            Where in the Bay?{" "}
            <span className="text-neutral-500 font-normal">(pick any)</span>
          </legend>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {AREAS.map((a) => (
              <label
                key={a.id}
                className="flex items-center gap-2 rounded-lg border border-[var(--line)] px-3 py-2.5 cursor-pointer hover:border-[var(--accent)] has-[:checked]:bg-[var(--accent-soft)] has-[:checked]:border-[var(--accent)]"
              >
                <input
                  type="checkbox"
                  name="areas"
                  value={a.id}
                  className="accent-[var(--accent)]"
                />
                <span className="text-sm">{a.label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="flex flex-col sm:flex-row sm:items-center gap-4 pt-2">
          <button
            type="submit"
            className="rounded-full bg-[var(--ink)] text-[var(--bg)] px-7 py-3 font-medium hover:bg-[var(--accent)] transition-colors"
          >
            Subscribe — it's free
          </button>
          <p className="text-xs text-neutral-500">
            Every other Sunday. One-click unsubscribe in every email.
          </p>
        </div>
      </form>
    </section>
  );
}

function OrganizerCTA() {
  return (
    <section className="py-16">
      <div className="rounded-3xl bg-[var(--ink)] text-[var(--bg)] p-8 sm:p-12 grid sm:grid-cols-[1fr_auto] gap-6 items-center">
        <div>
          <span className="text-xs uppercase tracking-[0.18em] text-[var(--gold)]">
            For organizers
          </span>
          <h3 className="serif text-3xl sm:text-4xl mt-3">
            Throwing something? Tell our subscribers.
          </h3>
          <p className="mt-3 text-neutral-300 max-w-xl">
            If you're putting on a show, fest, supper club, or meetup — submit
            it once and we'll route it to the right people. Free during the
            launch period.
          </p>
        </div>
        <Link
          href="/submit"
          className="inline-flex items-center gap-2 rounded-full bg-[var(--accent)] text-white px-6 py-3 font-medium hover:bg-white hover:text-[var(--ink)] transition-colors whitespace-nowrap"
        >
          Submit an event →
        </Link>
      </div>
    </section>
  );
}

function FAQ() {
  const items = [
    {
      q: "How is this different from Eventbrite or Funcheap?",
      a: "We don't list everything — we filter. You pick topics and neighborhoods, and we send you only events newly announced in the last two weeks that match. Less scrolling, less FOMO.",
    },
    {
      q: "Why biweekly instead of weekly?",
      a: "Because announcement cycles aren't weekly. Sending too often means thin issues. Sending biweekly means each digest has real meat.",
    },
    {
      q: "Is the Bay Area only for now?",
      a: "Yes — SF, East Bay, Peninsula, South Bay, and North Bay. Other cities later if it works.",
    },
    {
      q: "How do you decide what to include?",
      a: "Scrapers pull from venue sites, ticket platforms, and event aggregators. Organizers can submit directly. A human reviews submissions before they go in your inbox.",
    },
  ];
  return (
    <section className="py-16">
      <SectionHeader eyebrow="FAQ" title="Reasonable questions." />
      <div className="mt-8 grid sm:grid-cols-2 gap-x-10 gap-y-6">
        {items.map((it) => (
          <div key={it.q} className="border-t border-[var(--line)] pt-5">
            <h4 className="serif text-xl">{it.q}</h4>
            <p className="mt-2 text-[var(--ink-soft)] leading-relaxed">
              {it.a}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

function SectionHeader({
  eyebrow,
  title,
}: {
  eyebrow: string;
  title: string;
}) {
  return (
    <div>
      <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-[var(--accent)]">
        <span className="inline-block w-6 h-px bg-[var(--accent)]" />
        {eyebrow}
      </span>
      <h2 className="serif mt-3 text-4xl tracking-tight">{title}</h2>
    </div>
  );
}
