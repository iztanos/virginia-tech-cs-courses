/**
 * Build-time data layer.
 *
 * Three sources are joined on the four-digit course number:
 *   data/courses.json           curated scores and prose (source of truth)
 *   data/generated/sections.json  live Banner timetable, refreshed by cron
 *   data/generated/catalog.json   official catalog, refreshed weekly
 *
 * Read with fs rather than imported so a scraper commit is picked up by the
 * next build without touching the module graph.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";

const DATA = join(process.cwd(), "..", "data");

export type Stats = {
  gpa: number | null;
  withdraw_pct: number | null;
  enrolled: number | null;
  rmp_quality: number | null;
  rmp_n: number | null;
  rmp_difficulty: number | null;
  would_take_again_pct: number | null;
};

export type Instructor = {
  name: string;
  gpa: number | null;
  withdraw_pct: number | null;
  n: number | null;
};

export type Block = { t: "p"; v: string } | { t: "header" | "verdict" } | { t: "stats" | "instructors"; i: number };

export type MdTable = { header: string[]; align: string[]; rows: string[][] };

export type Course = {
  id: string;
  numbers: string[];
  title: string;
  level: number;
  heading: string;
  anchor: string;
  is_course: boolean;
  body: Block[];
  header?: string;
  credits?: string | null;
  terms?: string[];
  flags?: string[];
  prerequisites?: string | null;
  verdict?: string;
  usefulness?: number | null;
  usefulness_raw?: string;
  teaching?: string;
  stats?: Stats;
  instructors?: Instructor[];
  stats_tables?: MdTable[];
  instructors_tables?: MdTable[];
};

export type Meeting = { days: string; begin: string; end: string; location: string };

export type Section = {
  crn: string;
  course: string;
  number: string;
  title: string;
  schedule_type: string;
  modality: string;
  credits: string;
  capacity: number | null;
  instructor: string;
  exam: string;
  meetings: Meeting[];
  open: boolean | null;
};

export type Term = { code: string; name: string; sections: Section[] };

export type CatalogCourse = {
  subject: string;
  number: string;
  title: string;
  credits: string;
  description: string;
  prerequisites: string | null;
  corequisites: string | null;
  cross_listed: string | null;
  pathways: string | null;
  repeatability: string | null;
  contact_hours: string | null;
};

export type Offering = { code: string; name: string; sections: Section[] };

export type CourseRow = Course & {
  catalog: CatalogCourse | null;
  offerings: Offering[];
  offeredTermNames: string[];
  sectionCount: number;
  openCount: number;
};

export type Dataset = {
  courses: CourseRow[];
  terms: { code: string; name: string }[];
  scrapedAt: string | null;
  catalogScrapedAt: string | null;
};

function readJson<T>(...parts: string[]): T | null {
  try {
    return JSON.parse(readFileSync(join(DATA, ...parts), "utf8")) as T;
  } catch {
    // The generated files are absent until the scrapers have run once; the
    // site must still build (and say so) on a fresh clone.
    return null;
  }
}

let cached: Dataset | null = null;

export function getDataset(): Dataset {
  if (cached) return cached;

  const curated = readJson<{ courses: Course[] }>("courses.json");
  const timetable = readJson<{ scraped_at: string; terms: Term[] }>("generated", "sections.json");
  const catalog = readJson<{ scraped_at: string; courses: CatalogCourse[] }>("generated", "catalog.json");

  const catalogByNumber = new Map<string, CatalogCourse>();
  for (const c of catalog?.courses ?? []) catalogByNumber.set(c.number, c);

  const terms = (timetable?.terms ?? []).map(({ code, name }) => ({ code, name }));

  const courses: CourseRow[] = (curated?.courses ?? [])
    .filter((c) => c.is_course)
    .map((course) => {
      const offerings: Offering[] = [];
      for (const term of timetable?.terms ?? []) {
        const sections = term.sections.filter((s) => course.numbers.includes(s.number));
        if (sections.length) offerings.push({ code: term.code, name: term.name, sections });
      }

      const sectionCount = offerings.reduce((n, o) => n + o.sections.length, 0);
      const openCount = offerings.reduce(
        (n, o) => n + o.sections.filter((s) => s.open).length,
        0,
      );

      return {
        ...course,
        catalog: catalogByNumber.get(course.numbers[0]) ?? null,
        offerings,
        offeredTermNames: offerings.map((o) => o.name),
        sectionCount,
        openCount,
      };
    });

  cached = {
    courses,
    terms,
    scrapedAt: timetable?.scraped_at ?? null,
    catalogScrapedAt: catalog?.scraped_at ?? null,
  };
  return cached;
}

/** Teaching letter grades, ordered so the table can sort on them. */
const GRADE_ORDER = ["A", "A−", "B+", "B", "B−", "C+", "C", "C−", "D+", "D", "F"];

export function gradeRank(grade?: string): number {
  if (!grade) return GRADE_ORDER.length + 1;
  const i = GRADE_ORDER.indexOf(grade.replace("-", "−"));
  return i === -1 ? GRADE_ORDER.length : i;
}
