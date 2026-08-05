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

export type RmpComment = {
  professor: string;
  date: string;
  quality: number | null;
  difficulty: number | null;
  comment: string;
};

export type RmpCourse = {
  n: number;
  quality: number | null;
  difficulty: number | null;
  would_take_again_pct: number | null;
  professors: string[];
  recent_comments: RmpComment[];
};

export type GradeInstructor = {
  name: string;
  gpa: number | null;
  withdraw_pct: number | null;
  enrolled: number;
  withdraws: number;
  sections: number;
  thin: boolean;
};

export type GradeCourse = {
  title: string;
  gpa: number | null;
  withdraw_pct: number | null;
  enrolled: number;
  withdraws: number;
  sections: number;
  thin: boolean;
  instructors: GradeInstructor[];
};

export type RedditThread = {
  id: string;
  title: string;
  permalink: string;
  score: number;
  num_comments: number;
  created: string;
  flair: string | null;
  excerpt: string;
};

export type CourseRow = Course & {
  catalog: CatalogCourse | null;
  offerings: Offering[];
  offeredTermNames: string[];
  sectionCount: number;
  openCount: number;
  rmp: RmpCourse | null;
  grades: GradeCourse | null;
  reddit: RedditThread[];
};

export type Sources = {
  timetable: string | null;
  catalog: string | null;
  rmp: string | null;
  grades: string | null;
  reddit: string | null;
};

export type Dataset = {
  courses: CourseRow[];
  terms: { code: string; name: string }[];
  scrapedAt: string | null;
  catalogScrapedAt: string | null;
  sources: Sources;
  gradeYears: string[];
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
  const rmp = readJson<{ scraped_at: string; courses: Record<string, RmpCourse> }>("generated", "rmp.json");
  const grades = readJson<{
    scraped_at: string;
    academic_years: string[];
    courses: Record<string, GradeCourse>;
  }>("generated", "grades.json");
  const reddit = readJson<{ scraped_at: string; courses: Record<string, RedditThread[]> }>(
    "generated",
    "reddit.json",
  );

  const catalogByNumber = new Map<string, CatalogCourse>();
  for (const c of catalog?.courses ?? []) catalogByNumber.set(c.number, c);

  const terms = (timetable?.terms ?? []).map(({ code, name }) => ({ code, name }));

  // An entry can cover several numbers (CS 2964 / 2974 / 2984); take the first
  // number that any given source actually knows about.
  const pick = <T,>(numbers: string[], table: Record<string, T> | undefined): T | null => {
    for (const n of numbers) if (table?.[n]) return table[n];
    return null;
  };

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
        rmp: pick(course.numbers, rmp?.courses),
        grades: pick(course.numbers, grades?.courses),
        reddit: pick(course.numbers, reddit?.courses) ?? [],
      };
    });

  cached = {
    courses,
    terms,
    scrapedAt: timetable?.scraped_at ?? null,
    catalogScrapedAt: catalog?.scraped_at ?? null,
    gradeYears: grades?.academic_years ?? [],
    sources: {
      timetable: timetable?.scraped_at ?? null,
      catalog: catalog?.scraped_at ?? null,
      rmp: rmp?.scraped_at ?? null,
      grades: grades?.scraped_at ?? null,
      reddit: reddit?.scraped_at ?? null,
    },
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
