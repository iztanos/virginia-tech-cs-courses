import CourseSearch, { type SearchRow } from "@/components/CourseSearch";
import { getDataset, gradeRank } from "@/lib/data";

export default function Home() {
  const { courses, terms, scrapedAt } = getDataset();

  const rows: SearchRow[] = courses.map((c) => ({
    id: c.id,
    numbers: c.numbers,
    title: c.title,
    level: c.level,
    credits: c.credits ?? null,
    flags: c.flags ?? [],
    usefulness: c.usefulness ?? null,
    usefulnessRaw: c.usefulness_raw ?? null,
    teaching: c.teaching ?? null,
    teachingRank: gradeRank(c.teaching),
    gpa: c.stats?.gpa ?? null,
    withdrawPct: c.stats?.withdraw_pct ?? null,
    enrolled: c.stats?.enrolled ?? null,
    rmpQuality: c.stats?.rmp_quality ?? null,
    rmpN: c.stats?.rmp_n ?? null,
    offeredTermNames: c.offeredTermNames,
    sectionCount: c.sectionCount,
    openCount: c.openCount,
    // Everything a search box should be able to hit, flattened once at build.
    haystack: [
      c.numbers.join(" "),
      c.title,
      c.flags?.join(" "),
      c.prerequisites,
      c.catalog?.description,
      c.instructors?.map((i) => i.name).join(" "),
      c.body.map((b) => (b.t === "p" ? b.v : "")).join(" "),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase(),
  }));

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Every VT CS course, ranked and cross-checked</h1>
        <p className="mt-2 max-w-3xl text-neutral-600 dark:text-neutral-400">
          Career usefulness and teaching quality are scored separately &mdash; they correlate less
          than you would expect. Section counts come from VT&rsquo;s live Timetable of Classes.
        </p>
        <p className="mt-2 text-xs text-neutral-500">
          {scrapedAt
            ? `Timetable last scraped ${new Date(scrapedAt).toUTCString()}.`
            : "Timetable data not yet scraped — run the timetable scraper."}
        </p>
      </div>

      <CourseSearch rows={rows} termNames={terms.map((t) => t.name)} />
    </>
  );
}
