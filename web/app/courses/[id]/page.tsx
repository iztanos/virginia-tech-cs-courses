import Link from "next/link";
import { notFound } from "next/navigation";

import Sections from "@/components/Sections";
import { getDataset, type MdTable } from "@/lib/data";
import { renderInline, renderMarkdown } from "@/lib/markdown";

export function generateStaticParams() {
  return getDataset().courses.map((c) => ({ id: c.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const course = getDataset().courses.find((c) => c.id === id);
  return course
    ? { title: `CS ${course.numbers.join("/")} ${course.title} — VT CS Courses` }
    : {};
}

export default async function CoursePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { courses } = getDataset();
  const course = courses.find((c) => c.id === id);
  if (!course) notFound();

  const stats = course.stats;

  return (
    <article>
      <Link href="/" className="text-sm text-maroon dark:text-orange">
        ← all courses
      </Link>

      <h1 className="mt-3 text-2xl font-bold">
        CS {course.numbers.join(" / ")}: {course.title}
      </h1>

      <div className="mt-2 flex flex-wrap gap-2 text-sm">
        {course.credits && <Pill>{course.credits}</Pill>}
        {(course.terms ?? []).map((t) => (
          <Pill key={t}>{t}</Pill>
        ))}
        {(course.flags ?? []).map((f) => (
          <Pill key={f} strong>
            {f}
          </Pill>
        ))}
        {course.usefulness_raw && <Pill strong>Usefulness {course.usefulness_raw}</Pill>}
        {course.teaching && <Pill strong>Teaching {course.teaching}</Pill>}
      </div>

      {course.prerequisites && (
        <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-400">
          <span className="font-semibold">Prerequisites:</span> {course.prerequisites}
        </p>
      )}

      {stats && (
        <dl className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <Stat label="Avg GPA" value={stats.gpa?.toFixed(2)} />
          <Stat
            label="Withdraw"
            value={stats.withdraw_pct === null ? undefined : `${stats.withdraw_pct}%`}
          />
          <Stat label="Enrolled" value={stats.enrolled?.toLocaleString()} />
          <Stat
            label="RMP quality"
            value={stats.rmp_quality ? `${stats.rmp_quality}` : undefined}
            note={stats.rmp_n ? `n=${stats.rmp_n}` : undefined}
          />
          <Stat label="RMP difficulty" value={stats.rmp_difficulty?.toString()} />
          <Stat
            label="Would retake"
            value={
              stats.would_take_again_pct === null ? undefined : `${stats.would_take_again_pct}%`
            }
          />
        </dl>
      )}

      <Sections offerings={course.offerings} />

      {course.catalog && (
        <section className="mt-8">
          <h2 className="text-lg font-semibold">Catalog</h2>
          <p className="mt-2 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
            {course.catalog.description}
          </p>
          {course.catalog.corequisites && (
            <p className="mt-2 text-sm">
              <span className="font-semibold">Corequisites:</span> {course.catalog.corequisites}
            </p>
          )}
          {course.catalog.pathways && (
            <p className="mt-1 text-sm">
              <span className="font-semibold">Pathways:</span> {course.catalog.pathways}
            </p>
          )}
          {course.catalog.cross_listed && (
            <p className="mt-1 text-sm">
              <span className="font-semibold">Cross-listed:</span> {course.catalog.cross_listed}
            </p>
          )}
        </section>
      )}

      <section className="guide mt-8 border-t border-neutral-200 pt-6 dark:border-neutral-800">
        <h2 className="text-lg font-semibold">From the guide</h2>
        {course.body.map((block, i) => {
          if (block.t === "p") return <Html key={i} html={renderMarkdown(block.v)} />;
          if (block.t === "verdict" && course.verdict)
            return <Html key={i} html={renderMarkdown(course.verdict)} />;
          if (block.t === "header") return null; // already shown as pills above
          if (block.t === "stats") return null; // already shown as the stat grid
          if (block.t === "instructors") {
            const table = course.instructors_tables?.[block.i];
            return table ? <Table key={i} table={table} /> : null;
          }
          return null;
        })}
      </section>
    </article>
  );
}

function Pill({ children, strong }: { children: React.ReactNode; strong?: boolean }) {
  return (
    <span
      className={`rounded-md px-2 py-0.5 text-xs ${
        strong
          ? "bg-maroon text-white dark:bg-orange dark:text-neutral-950"
          : "bg-neutral-200 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
      }`}
    >
      {children}
    </span>
  );
}

function Stat({ label, value, note }: { label: string; value?: string; note?: string }) {
  return (
    <div className="rounded-lg border border-neutral-200 px-3 py-2 dark:border-neutral-800">
      <dt className="text-[11px] uppercase tracking-wide text-neutral-500">{label}</dt>
      <dd className="text-lg font-semibold tabular-nums">
        {value ?? <span className="text-neutral-400">—</span>}
        {note && <span className="ml-1 text-xs font-normal text-neutral-500">{note}</span>}
      </dd>
    </div>
  );
}

function Table({ table }: { table: MdTable }) {
  return (
    <table>
      <thead>
        <tr>
          {table.header.map((h, i) => (
            <th key={i} dangerouslySetInnerHTML={{ __html: renderInline(h) }} />
          ))}
        </tr>
      </thead>
      <tbody>
        {table.rows.map((row, i) => (
          <tr key={i}>
            {row.map((cell, j) => (
              <td key={j} dangerouslySetInnerHTML={{ __html: renderInline(cell) }} />
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function Html({ html }: { html: string }) {
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
