import Link from "next/link";
import { SiteBar, SiteFooter } from "@/components/SiteBar";
import PosterMap from "@/components/PosterMapClient";
import { getMapPins } from "@/lib/map-events";
import {
  currentIssueNumber,
  nextDispatchDate,
  formatDispatchDate,
} from "@/lib/issue";

export const revalidate = 600; // 10 min — map content refreshes regularly

export default async function Home() {
  const issueNo = currentIssueNumber();
  const dispatch = nextDispatchDate();
  const dispatchLabel = formatDispatchDate(dispatch);
  // Pull a balanced pool: up to 8 pins per region for the map poster.
  const pins = await getMapPins(8);

  return (
    <main className="frame">
      <SiteBar
        issue={{
          primary: `Issue № ${issueNo}`,
          secondary: dispatchLabel,
        }}
        variant="home"
      />

      <section className="masthead">
        <p className="kicker">
          — THE EVENTS DISPATCH FROM <b>LOCALLYCURATED</b>
        </p>
        <h1 className="title" style={{ fontSize: "110px" }}>
          bay area
        </h1>
      </section>
      <hr className="rule" />

      <div className="scaleRow">
        <div className="scale">
          <span>500 m</span>
          <svg width="84" height="8" viewBox="0 0 84 8">
            <line x1="2" y1="4" x2="82" y2="4" stroke="#3a352c" strokeWidth="0.8" />
            <line x1="2" y1="1" x2="2" y2="7" stroke="#3a352c" strokeWidth="0.8" />
            <line x1="42" y1="2" x2="42" y2="6" stroke="#3a352c" strokeWidth="0.6" />
            <line x1="82" y1="1" x2="82" y2="7" stroke="#3a352c" strokeWidth="0.8" />
          </svg>
        </div>
        <span className="cal">
          <em>california · est. mmxxiv</em>
        </span>
      </div>

      <section className="poster">
        <PosterMap pins={pins} issueNo={issueNo} dispatchLabel={dispatchLabel} />

        <div className="bayQuote q1">
          <small>FROM THE EDITORS</small>
          <span>
            you missed it
            <br />
            <em>because nobody</em>
            <br />
            told you.
          </span>
          <span className="tag">
            A fortnightly dispatch of Bay-Area
            <br />
            events just announced. Read in <em>three minutes.</em>
          </span>
        </div>
      </section>

      <section className="how" id="how">
        <p className="kicker">
          <span className="dash"></span>HOW IT WORKS
        </p>
        <h2>No more missed announcements.</h2>
        <div className="steps">
          <article className="step">
            <span className="sn">STEP 01</span>
            <h3>Tell us your taste</h3>
            <p>
              Pick the topics that move you — DJs, food, AI, art, comedy — and the parts of the
              Bay you actually go to.
            </p>
          </article>
          <article className="step">
            <span className="sn">STEP 02</span>
            <h3>
              We do the <em>doomscrolling</em>
            </h3>
            <p>
              Our scrapers comb venue calendars, ticket sites, and event platforms daily.
              Organizers can submit directly too.
            </p>
          </article>
          <article className="step">
            <span className="sn">STEP 03</span>
            <h3>One email, every two weeks</h3>
            <p>
              A short list of what was just announced — not a flood, not yesterday&apos;s news.
              Everything still upcoming.
            </p>
          </article>
        </div>
      </section>

      <section className="cta" id="sub">
        <div className="cta-inner">
          <p className="kicker">
            <span className="dash"></span>NEXT DISPATCH · {dispatchLabel.toUpperCase()}
          </p>
          <h3>
            Tell us <em>what you&apos;d</em> hate to miss.
          </h3>
          <p className="lede">
            Two minutes. Twelve categories. Five neighborhoods. We&apos;ll fold your picks into
            every issue starting this Sunday.
          </p>
          <Link className="big-btn" href="/subscribe">
            <span>Share your interests</span>
            <svg width="22" height="14" viewBox="0 0 22 14" fill="none">
              <path
                d="M0 7 H20 M14 1 L20 7 L14 13"
                stroke="currentColor"
                strokeWidth="1.4"
              />
            </svg>
          </Link>
          <p className="micro">Free · biweekly · one-click unsubscribe in every email.</p>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
