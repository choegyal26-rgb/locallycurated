import Link from "next/link";
import { SiteBar, SiteFooter } from "@/components/SiteBar";
import {
  currentIssueNumber,
  nextDispatchDate,
  formatDispatchDate,
} from "@/lib/issue";

export default function Thanks() {
  const issueNo = currentIssueNumber();
  const dispatchLabel = formatDispatchDate(nextDispatchDate());

  return (
    <main className="frame">
      <SiteBar
        issue={{ primary: `Issue № ${issueNo}`, secondary: dispatchLabel }}
        variant="home"
      />
      <section className="pref-masthead" style={{ padding: "120px 0 60px" }}>
        <p className="pref-crumb">
          <span className="dash"></span>YOU&apos;RE ON THE LIST
        </p>
        <h1>
          You&apos;re <em>in</em>.
        </h1>
        <p className="deck">
          Your first dispatch lands <em>{dispatchLabel}</em>. Watch your inbox
          for a welcome note — that&apos;s the only email you&apos;ll see from us
          this week.
        </p>
        <p className="deck" style={{ marginTop: 18 }}>
          Know an event others might miss?{" "}
          <Link
            href="/submit"
            style={{ color: "var(--accent)", borderBottom: "1px solid currentColor" }}
          >
            Submit it →
          </Link>
        </p>
      </section>
      <SiteFooter />
    </main>
  );
}
