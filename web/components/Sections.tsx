import type { Offering, Section } from "@/lib/data";

const BANNER_COMMENTS = "https://selfservice.banner.vt.edu/ssb/HZSKVTSC.P_ProcComments";

/** "202609" -> { term: "09", year: "2026" }, which is how Banner links a CRN. */
function splitTermCode(code: string) {
  return { year: code.slice(0, 4), term: code.slice(4) };
}

function meetingText(s: Section): string {
  if (!s.meetings.length) return "—";
  return s.meetings
    .map((m) =>
      m.begin ? `${m.days.trim()} ${m.begin}–${m.end}`.trim() : m.days.trim() || "Arranged",
    )
    .join(" · ");
}

function locationText(s: Section): string {
  const places = s.meetings.map((m) => m.location).filter(Boolean);
  return places.length ? [...new Set(places)].join(", ") : "—";
}

export default function Sections({ offerings }: { offerings: Offering[] }) {
  if (!offerings.length) {
    return (
      <section className="mt-8">
        <h2 className="text-lg font-semibold">On the timetable</h2>
        <p className="mt-2 text-sm text-neutral-500">
          No sections scheduled in any term currently published on VT&rsquo;s timetable.
        </p>
      </section>
    );
  }

  return (
    <section className="mt-8">
      <h2 className="text-lg font-semibold">On the timetable</h2>

      {offerings.map((offering) => {
        const { year, term } = splitTermCode(offering.code);
        const open = offering.sections.filter((s) => s.open).length;

        return (
          <div key={offering.code} className="mt-4">
            <h3 className="text-sm font-semibold">
              {offering.name}
              <span className="ml-2 font-normal text-neutral-500">
                {offering.sections.length} sections, {open} open
              </span>
            </h3>

            <div className="mt-2 overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-neutral-300 text-left dark:border-neutral-700">
                    <th className="px-2 py-1.5 font-semibold">CRN</th>
                    <th className="px-2 py-1.5 font-semibold">Type</th>
                    <th className="px-2 py-1.5 font-semibold">Modality</th>
                    <th className="px-2 py-1.5 font-semibold">Meets</th>
                    <th className="px-2 py-1.5 font-semibold">Location</th>
                    <th className="px-2 py-1.5 text-right font-semibold">Cap</th>
                    <th className="px-2 py-1.5 text-right font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {offering.sections.map((s) => (
                    <tr
                      key={s.crn}
                      className="border-b border-neutral-100 dark:border-neutral-900"
                    >
                      <td className="px-2 py-1.5 tabular-nums">
                        <a
                          href={`${BANNER_COMMENTS}?CRN=${s.crn}&TERM=${term}&YEAR=${year}&SUBJ=CS&CRSE=${s.number}&history=N`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-maroon underline-offset-2 hover:underline dark:text-orange"
                        >
                          {s.crn}
                        </a>
                      </td>
                      <td className="px-2 py-1.5">{s.schedule_type}</td>
                      <td className="px-2 py-1.5">{s.modality || "—"}</td>
                      <td className="whitespace-nowrap px-2 py-1.5">{meetingText(s)}</td>
                      <td className="px-2 py-1.5">{locationText(s)}</td>
                      <td className="px-2 py-1.5 text-right tabular-nums">{s.capacity ?? "—"}</td>
                      <td className="px-2 py-1.5 text-right">
                        {s.open ? (
                          <span className="text-green-600 dark:text-green-500">open</span>
                        ) : (
                          <span className="text-neutral-400">full</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}

      <p className="mt-3 text-xs text-neutral-500">
        VT&rsquo;s public timetable does not publish instructor assignments &mdash; the Instructor
        column reads &ldquo;N/A&rdquo; for every section. Open/full is derived by comparing the full
        listing against the timetable&rsquo;s &ldquo;only open sections&rdquo; filter. Click a CRN
        for enforced prerequisites and restrictions.
      </p>
    </section>
  );
}
