import type { RmpCourse } from "@/lib/data";

/**
 * RateMyProfessors is self-selected -- people with strong feelings post and the
 * satisfied middle mostly does not -- so comments are shown with their dates
 * and professor attached rather than distilled into a single verdict.
 */
export default function Ratings({ rmp }: { rmp: RmpCourse | null }) {
  if (!rmp || !rmp.n) return null;

  return (
    <section className="mt-8">
      <h2 className="text-lg font-semibold">Student ratings</h2>

      <div className="mt-2 flex flex-wrap gap-4 text-sm">
        <Figure label="Quality" value={rmp.quality} suffix="/5" />
        <Figure label="Difficulty" value={rmp.difficulty} suffix="/5" />
        <Figure label="Would retake" value={rmp.would_take_again_pct} suffix="%" />
        <span className="text-neutral-500">
          {rmp.n} rating{rmp.n === 1 ? "" : "s"} across {rmp.professors.length} instructor
          {rmp.professors.length === 1 ? "" : "s"}
        </span>
      </div>

      {rmp.n < 5 && (
        <p className="mt-2 text-xs text-amber-700 dark:text-amber-500">
          Fewer than five ratings &mdash; treat these numbers as anecdote, not signal.
        </p>
      )}

      {rmp.recent_comments.length > 0 && (
        <ul className="mt-4 space-y-3">
          {rmp.recent_comments.map((c, i) => (
            <li
              key={i}
              className="rounded-lg border border-neutral-200 px-3 py-2 dark:border-neutral-800"
            >
              <div className="flex flex-wrap items-baseline gap-x-2 text-xs text-neutral-500">
                <span className="font-semibold text-neutral-700 dark:text-neutral-300">
                  {c.professor}
                </span>
                <span>{c.date}</span>
                {c.quality !== null && <span>quality {c.quality}/5</span>}
                {c.difficulty !== null && <span>difficulty {c.difficulty}/5</span>}
              </div>
              <p className="mt-1 text-sm leading-relaxed">{c.comment}</p>
            </li>
          ))}
        </ul>
      )}

      <p className="mt-3 text-xs text-neutral-500">
        Source: RateMyProfessors, VT Computer Science faculty. Ratings measure individual
        instructors, not the course &mdash; a course aggregate is a referendum on whoever happened
        to teach the sections that got reviewed.
      </p>
    </section>
  );
}

function Figure({
  label,
  value,
  suffix,
}: {
  label: string;
  value: number | null;
  suffix: string;
}) {
  return (
    <span>
      <span className="text-neutral-500">{label} </span>
      <span className="font-semibold tabular-nums">
        {value === null ? "—" : `${value}${suffix}`}
      </span>
    </span>
  );
}
