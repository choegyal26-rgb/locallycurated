import { SiteBar, SiteFooter } from "@/components/SiteBar";
import { currentIssueNumber, nextDispatchDate, formatDispatchDate } from "@/lib/issue";

export default function SubmitThanks() {
  return (
    <main className="frame">
      <SiteBar
        issue={{
          primary: `Issue № ${currentIssueNumber()}`,
          secondary: formatDispatchDate(nextDispatchDate()),
        }}
        variant="home"
      />
      <section className="pref-masthead" style={{ padding: "120px 0 60px" }}>
        <p className="pref-crumb">
          <span className="dash"></span>SUBMISSION RECEIVED
        </p>
        <h1>
          Thanks for the <em>heads up</em>.
        </h1>
        <p className="deck">
          We&apos;ll read it within 48 hours and let you know either way. If
          it&apos;s a fit, it goes out in the next biweekly dispatch.
        </p>
      </section>
      <SiteFooter />
    </main>
  );
}
