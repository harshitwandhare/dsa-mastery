import type { Metadata } from "next";
import { JetBrains_Mono, Source_Sans_3 } from "next/font/google";

import { SiteHeader } from "@/components/site-header";
import "./globals.css";

const sans = Source_Sans_3({
  variable: "--font-sans-stack",
  subsets: ["latin"],
  display: "swap",
});

const mono = JetBrains_Mono({
  variable: "--font-mono-stack",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://dsa-mastery.vercel.app"),
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
  },
  robots: { index: true, follow: true },
};

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
    <html lang="en" className={`${sans.variable} ${mono.variable} h-full`}>
      <body className="flex min-h-full flex-col bg-bg text-text">
        <SiteHeader />
        <div className="flex-1">{children}</div>
        <footer className="border-t border-border-subtle px-5 py-8 text-sm text-text-faint">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3">
            <p>
              Generated from the curriculum markdown. The lessons are the source of truth.
            </p>
            <a
              className="hover:text-text"
              href="https://github.com/harshitwandhare/dsa-mastery"
              target="_blank"
              rel="noreferrer"
            >
              Source on GitHub
            </a>
          </div>
        </footer>
      </body>
    </html>
  );
}
