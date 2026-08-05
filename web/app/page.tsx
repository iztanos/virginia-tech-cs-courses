import CourseSearch, { type SearchRow } from "@/components/CourseSearch";
import { getDataset, gradeRank } from "@/lib/data";

const SOURCE_LABELS: Record<string, string> = {
  timetable: "Timetable",
  catalog: "Catalog",
  rmp: "Ratings",
  grades: "Grades",
  reddit: "Reddit",
};

export default function Home() {
  const { courses, terms, scrapedAt, sources } = getDataset();

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
    // Prefer the freshly scraped figures, falling back to the guide's snapshot.
    gpa: c.grades?.gpa ?? c.stats?.gpa ?? null,
    withdrawPct: c.grades?.withdraw_pct ?? c.stats?.withdraw_pct ?? null,
    enrolled: c.grades?.enrolled ?? c.stats?.enrolled ?? null,
    rmpQuality: c.rmp?.quality ?? c.stats?.rmp_quality ?? null,
    rmpN: c.rmp?.n ?? c.stats?.rmp_n ?? null,
    offeredTermNames: c.offeredTermNames,
    sectionCount: c.sectionCount,
    openCount: c.openCount,
    // Everything a search box should be able to hit, flattened once at build:
    // titles, prose, catalog text, instructor names, student comments, threads.
    haystack: [
      c.numbers.join(" "),
      c.title,
      c.flags?.join(" "),
      c.prerequisites,
      c.catalog?.description,
      c.instructors?.map((i) => i.name).join(" "),
      c.grades?.instructors.map((i) => i.name).join(" "),
      c.rmp?.professors.join(" "),
      c.rmp?.recent_comments.map((r) => r.comment).join(" "),
      c.reddit.map((t) => t.title).join(" "),
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
        <p className="mt-3 text-xs text-neutral-500">
          {scrapedAt ? (
            <>
              Last refreshed —{" "}
              {Object.entries(sources)
                .filter(([, at]) => at)
                .map(
                  ([key, at]) =>
                    `${SOURCE_LABELS[key] ?? key} ${new Date(at as string)
                      .toISOString()
                      .slice(0, 10)}`,
                )
                .join(" · ")}
            </>
          ) : (
            "No scraped data yet — run the scrapers in tools/vtcourses."
          )}
        </p>
      </div>

      <CourseSearch rows={rows} termNames={terms.map((t) => t.name)} />
    </>
  );
}
