import type { Metadata } from "next";
import { Fraunces, Archivo, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
  variable: "--font-fraunces",
  display: "swap",
});
const archivo = Archivo({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-archivo",
  display: "swap",
});
const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://locallycurated.co";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "LocallyCurated | Bay Area Events Newsletter",
    template: "%s · LocallyCurated",
  },
  description:
    "A biweekly Bay Area events newsletter with newly announced concerts, food fests, art shows, meetups, and things to do around San Francisco, Oakland, and the Bay.",
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
    title: "LocallyCurated | Bay Area Events Newsletter",
    description:
      "A biweekly Bay Area events newsletter with newly announced concerts, food fests, art shows, meetups, and things to do around San Francisco, Oakland, and the Bay.",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "LocallyCurated | Bay Area Events Newsletter",
    description:
      "A biweekly newsletter of newly announced Bay Area events.",
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
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: "LocallyCurated",
        url: SITE_URL,
        description:
          "Biweekly Bay Area events newsletter covering newly announced concerts, food fests, art shows, meetups, and more.",
        areaServed: {
          "@type": "Place",
          name: "San Francisco Bay Area",
        },
        sameAs: [],
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        name: "LocallyCurated",
        alternateName: "Locally Curated",
        url: SITE_URL,
        description:
          "A biweekly Bay Area events newsletter covering newly announced concerts, food fests, art shows, meetups, and things to do.",
        inLanguage: "en-US",
        publisher: { "@id": `${SITE_URL}/#organization` },
      },
    ],
  };

  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${archivo.variable} ${mono.variable}`}
    >
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
