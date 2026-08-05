import type { GradeCourse } from "@/lib/data";

/**
 * Recomputed from VT's published grade distributions on every scrape, so this
 * table includes the small-sample instructors the printed guide suppresses --
 * flagged rather than hidden.
 */
export default function GradeHistory({
  grades,
  years,
}: {
  grades: GradeCourse | null;
  years: string[];
}) {
  if (!grades || !grades.instructors.length) return null;

  const span = years.length ? `${years[0]} to ${years[years.length - 1]}` : "AY2019-22";

  return (
    <section className="mt-8">
      <h2 className="text-lg font-semibold">Instructor history</h2>
      <p className="mt-1 text-xs text-neutral-500">
        Enrollment-weighted, {span}. Withdrawal is withdraws / (withdraws + graded enrollment).
      </p>

      <div className="mt-3 overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-neutral-300 text-left dark:border-neutral-700">
              <th className="px-2 py-1.5 font-semibold">Instructor</th>
              <th className="px-2 py-1.5 text-right font-semibold">GPA</th>
              <th className="px-2 py-1.5 text-right font-semibold">Withdraw</th>
              <th className="px-2 py-1.5 text-right font-semibold">Students</th>
              <th className="px-2 py-1.5 text-right font-semibold">Sections</th>
            </tr>
          </thead>
          <tbody>
            {grades.instructors.map((i) => (
              <tr key={i.name} className="border-b border-neutral-100 dark:border-neutral-900">
                <td className="px-2 py-1.5">
                  {i.name}
                  {i.thin && (
                    <span
                      className="ml-1.5 text-xs text-neutral-400"
                      title="Under 40 students — indicative only"
                    >
                      thin
                    </span>
                  )}
                </td>
                <td className="px-2 py-1.5 text-right tabular-nums">
                  {i.gpa?.toFixed(2) ?? "—"}
                </td>
                <td className="px-2 py-1.5 text-right tabular-nums">
                  {i.withdraw_pct === null ? "—" : `${i.withdraw_pct}%`}
                </td>
                <td className="px-2 py-1.5 text-right tabular-nums">
                  {i.enrolled.toLocaleString()}
                </td>
                <td className="px-2 py-1.5 text-right tabular-nums">{i.sections}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-2 text-xs text-neutral-500">
        The extract ends in Spring 2022, so anything that changed since &mdash; new instructors,
        redesigned courses &mdash; is not reflected here. A low GPA does not mean a course is badly
        taught; read it alongside the withdrawal rate.
      </p>
    </section>
  );
}
