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
    default: "LocallyCurated — A Bay Area Field Guide",
    template: "%s · LocallyCurated",
  },
  description:
    "A biweekly dispatch of newly announced Bay Area concerts, food fests, art shows, meetups, and more — tailored to your taste.",
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
    title: "LocallyCurated — A Bay Area Field Guide",
    description:
      "A biweekly dispatch of newly announced Bay Area concerts, food fests, art shows, meetups, and more — tailored to your taste.",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "LocallyCurated — A Bay Area Field Guide",
    description:
      "A biweekly dispatch of newly announced Bay Area events.",
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
      "Biweekly dispatch of newly announced Bay Area events: concerts, food fests, art shows, meetups, and more.",
    areaServed: {
      "@type": "Place",
      name: "San Francisco Bay Area",
    },
    sameAs: [],
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
