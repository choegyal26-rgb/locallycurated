import type { Metadata } from "next";
import { SiteBar, SiteFooter } from "@/components/SiteBar";

export const metadata: Metadata = {
  title: "Preferences saved",
  robots: { index: false, follow: false },
};

export default function PreferencesSavedPage() {
  return (
    <main className="frame">
      <SiteBar
        issue={{ primary: "Preferences", secondary: "Saved · All Set" }}
        variant="preferences"
      />
      <section
        className="masthead pref-masthead"
        style={{ textAlign: "left", padding: "60px 0 30px" }}
      >
        <p className="pref-crumb">
          <span className="dash"></span>PREFERENCES SAVED
        </p>
        <h1>
          Noted. <em>Duly noted.</em>
        </h1>
        <p className="deck">
          Your next dispatch will follow the new picks. Until then, the Bay
          keeps doing what it does — we&apos;ll keep watch.
        </p>
      </section>
      <SiteFooter />
    </main>
  );
}
