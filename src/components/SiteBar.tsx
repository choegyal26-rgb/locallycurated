import Link from "next/link";
import Image from "next/image";

type Props = {
  /** Issue line right side. e.g. { primary: "Issue №47", secondary: "Sunday · June 22" } */
  issue: { primary: string; secondary: string };
  /** Active page for nav styling — affects which links show */
  variant?: "home" | "preferences";
};

export function SiteBar({ issue, variant = "home" }: Props) {
  return (
    <header className="bar">
      <div className="left">
        <Link
          href="/"
          className="wordmark"
          aria-label="Locally Curated — a Bay Area events dispatch"
        >
          <Image
            className="wm-badge"
            src="/wordmark.png"
            alt="Locally Curated"
            width={356}
            height={253}
            priority
          />
          <span className="wm-stack">
            <span className="tag">
              <b>A Bay Area</b>
              <span>Events Dispatch</span>
            </span>
          </span>
        </Link>
      </div>
      <div className="right">
        <div className="issue">
          <b>{issue.primary}</b>
          <span>
            {issue.secondary.includes("·") ? (
              <>
                {issue.secondary.split("·")[0].trim()}{" "}
                <span className="dot">·</span>{" "}
                {issue.secondary.split("·").slice(1).join("·").trim()}
              </>
            ) : (
              issue.secondary
            )}
          </span>
        </div>
        <nav className="nav">
          {variant === "preferences" && (
            <Link className="back" href="/">
              <svg width="14" height="10" viewBox="0 0 14 10" fill="none">
                <path
                  d="M14 5H1M6 1L1 5l5 4"
                  stroke="currentColor"
                  strokeWidth="1.6"
                />
              </svg>
              Back to map
            </Link>
          )}
          <Link href="/#how">How it works</Link>
          {variant === "home" && <Link href="/subscribe">Subscribe</Link>}
          <Link href="/submit">Submit</Link>
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <span>LOCALLYCURATED · A BAY AREA FIELD GUIDE</span>
      <span className="colophon">
        Set in Fraunces, Archivo &amp; JetBrains Mono · Printed on the open web
      </span>
      <span>© MMXXVI</span>
    </footer>
  );
}
