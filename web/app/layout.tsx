import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "VT CS Courses",
  description:
    "Search every Virginia Tech CS course by usefulness, teaching quality, and what is actually on the timetable this term.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="border-b border-neutral-200 dark:border-neutral-800">
          <div className="mx-auto flex max-w-6xl items-baseline gap-4 px-4 py-4">
            <Link href="/" className="text-lg font-bold text-maroon dark:text-orange">
              VT CS Courses
            </Link>
            <span className="text-sm text-neutral-500">
              usefulness · teaching quality · live timetable
            </span>
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>

        <footer className="mx-auto max-w-6xl px-4 py-10 text-xs text-neutral-500">
          Unofficial. Grade data AY2019&ndash;22; ratings through Aug 2026; sections scraped from
          VT&rsquo;s Timetable of Classes. Always verify against the timetable before registering.
        </footer>
      </body>
    </html>
  );
}
