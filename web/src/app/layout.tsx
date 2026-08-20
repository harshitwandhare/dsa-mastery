import type { Metadata } from "next";
import { Fraunces, Inter, JetBrains_Mono } from "next/font/google";

import { CommandPalette } from "@/components/command-palette";
import { ServiceWorker } from "@/components/service-worker";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

/**
 * Fraunces carries the identity. It is a variable serif with optical sizing, so
 * a 40px page title and a 17px heading are drawn differently rather than
 * scaled, which is what makes headings read like a book rather than a UI.
 */
const display = Fraunces({
  variable: "--font-display-stack",
  subsets: ["latin"],
  display: "swap",
  axes: ["SOFT", "WONK", "opsz"],
});

const sans = Inter({
  variable: "--font-sans-stack",
  subsets: ["latin"],
  display: "swap",
});

const mono = JetBrains_Mono({
  variable: "--font-mono-stack",
  subsets: ["latin"],
  display: "swap",
});

const SITE = "https://dsa-mastery-delta.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: {
    default: "DSA Mastery — an interview curriculum you can run in the browser",
    template: "%s · DSA Mastery",
  },
  description:
    "A complete data-structures and algorithms curriculum written from first principles: 21 lessons, 315 indexed problems, 75 graded Python drills, and a Python runtime built into the page.",
  openGraph: {
    title: "DSA Mastery",
    description:
      "21 lessons, 315 problems, 75 graded drills, and Python running in the browser. Built from first principles for interview preparation.",
    type: "website",
    url: SITE,
  },
  twitter: {
    card: "summary_large_image",
    title: "DSA Mastery",
    description:
      "An interview curriculum you can run in the browser. No install, no account.",
  },
  robots: { index: true, follow: true },
};

/**
 * Applied before first paint so a reader who chose a theme never sees the other
 * one flash first. It runs from `dangerouslySetInnerHTML` because it has to
 * execute before React hydrates, and it is a fixed string with no interpolation.
 */
const THEME_SCRIPT = `
try {
  var stored = localStorage.getItem("theme");
  if (stored === "light" || stored === "dark") {
    document.documentElement.setAttribute("data-theme", stored);
  }
} catch (e) {}
`;

// Typed explicitly rather than with Next's generated `LayoutProps` global. That
// helper only exists after a build has written .next/types, so relying on it
// makes `tsc --noEmit` pass locally on a stale build directory and fail in CI,
// where type-checking runs before the build.
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${display.variable} ${sans.variable} ${mono.variable} h-full`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body className="flex min-h-full flex-col bg-bg text-text">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-accent focus:px-4 focus:py-2 focus:text-bg"
        >
          Skip to content
        </a>
        <ServiceWorker />
        <CommandPalette />
        <SiteHeader />
        <div id="main" className="flex-1">
          {children}
        </div>
        <SiteFooter />
      </body>
    </html>
  );
}
