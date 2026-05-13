import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://locallycurated.co";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "LocallyCurated — Bay Area events, biweekly",
    template: "%s · LocallyCurated",
  },
  description:
    "A biweekly digest of newly announced Bay Area concerts, food fests, art shows, meetups, and more — tailored to your taste.",
  keywords: [
    "Bay Area events",
    "San Francisco events",
    "Oakland events",
    "Berkeley events",
    "SF concerts",
    "Bay Area newsletter",
    "events newsletter",
    "Bay Area things to do",
  ],
  authors: [{ name: "LocallyCurated" }],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "LocallyCurated",
    title: "LocallyCurated — Bay Area events, biweekly",
    description:
      "A biweekly digest of newly announced Bay Area concerts, food fests, art shows, meetups, and more — tailored to your taste.",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "LocallyCurated — Bay Area events, biweekly",
    description:
      "A biweekly digest of newly announced Bay Area concerts, food fests, art shows, meetups, and more.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "LocallyCurated",
    url: SITE_URL,
    description:
      "Biweekly digest of newly announced Bay Area events: concerts, food fests, art shows, meetups, and more.",
    areaServed: {
      "@type": "Place",
      name: "San Francisco Bay Area",
    },
    sameAs: [],
  };

  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <header className="mx-auto max-w-5xl px-6 pt-8 pb-2 flex items-baseline justify-between">
          <Link
            href="/"
            className="text-lg font-semibold tracking-tight flex items-center gap-2"
          >
            <span
              aria-hidden
              className="inline-block w-2.5 h-2.5 rounded-full bg-[var(--accent)]"
            />
            LocallyCurated
          </Link>
          <nav className="text-sm text-neutral-600 flex gap-5">
            <Link href="/#how" className="hover:text-[var(--accent)]">
              How it works
            </Link>
            <Link href="/submit" className="hover:text-[var(--accent)]">
              Submit an event
            </Link>
          </nav>
        </header>
        <main>{children}</main>
        <footer className="mx-auto max-w-5xl px-6 py-12 mt-12 border-t border-[var(--line)] text-xs text-neutral-500 flex flex-wrap justify-between gap-3">
          <span>
            © {new Date().getFullYear()} LocallyCurated · Made for the Bay
          </span>
          <span className="flex gap-4">
            <Link href="/submit" className="hover:text-[var(--ink)]">
              For organizers
            </Link>
            <a href="mailto:hello@locallycurated.co" className="hover:text-[var(--ink)]">
              Contact
            </a>
          </span>
        </footer>
      </body>
    </html>
  );
}
