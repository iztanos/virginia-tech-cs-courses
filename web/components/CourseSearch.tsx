"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

export type SearchRow = {
  id: string;
  numbers: string[];
  title: string;
  level: number;
  credits: string | null;
  flags: string[];
  usefulness: number | null;
  usefulnessRaw: string | null;
  teaching: string | null;
  teachingRank: number;
  gpa: number | null;
  withdrawPct: number | null;
  enrolled: number | null;
  rmpQuality: number | null;
  rmpN: number | null;
  offeredTermNames: string[];
  sectionCount: number;
  openCount: number;
  haystack: string;
};

type SortKey =
  | "number"
  | "usefulness"
  | "teaching"
  | "gpa"
  | "withdraw"
  | "rating"
  | "sections";

const LEVELS = [1000, 2000, 3000, 4000];

export default function CourseSearch({
  rows,
  termNames,
}: {
  rows: SearchRow[];
  termNames: string[];
}) {
  const [query, setQuery] = useState("");
  const [levels, setLevels] = useState<number[]>([]);
  const [term, setTerm] = useState("");
  const [openOnly, setOpenOnly] = useState(false);
  const [minUse, setMinUse] = useState(0);
  const [sort, setSort] = useState<SortKey>("number");
  const [desc, setDesc] = useState(false);

  const filtered = useMemo(() => {
    const needles = query.toLowerCase().split(/\s+/).filter(Boolean);

    const out = rows.filter((r) => {
      if (needles.some((n) => !r.haystack.includes(n))) return false;
      if (levels.length && !levels.includes(r.level)) return false;
      if (term && !r.offeredTermNames.includes(term)) return false;
      if (openOnly && r.openCount === 0) return false;
      if (minUse && (r.usefulness ?? -1) < minUse) return false;
      return true;
    });

    const dir = desc ? -1 : 1;
    // Missing values always sort last, whichever direction the user picked.
    const cmp = (a: number | null, b: number | null) => {
      if (a === null && b === null) return 0;
      if (a === null) return 1;
      if (b === null) return -1;
      return (a - b) * dir;
    };

    return [...out].sort((a, b) => {
      switch (sort) {
        case "usefulness":
          return cmp(a.usefulness, b.usefulness) || a.numbers[0].localeCompare(b.numbers[0]);
        case "teaching":
          return (a.teachingRank - b.teachingRank) * dir;
        case "gpa":
          return cmp(a.gpa, b.gpa);
        case "withdraw":
          return cmp(a.withdrawPct, b.withdrawPct);
        case "rating":
          return cmp(a.rmpQuality, b.rmpQuality);
        case "sections":
          return cmp(a.sectionCount, b.sectionCount);
        default:
          return a.numbers[0].localeCompare(b.numbers[0]) * dir;
      }
    });
  }, [rows, query, levels, term, openOnly, minUse, sort, desc]);

  function toggleSort(key: SortKey) {
    if (sort === key) {
      setDesc(!desc);
    } else {
      setSort(key);
      // Bigger-is-better columns are most useful highest-first.
      setDesc(key === "usefulness" || key === "gpa" || key === "sections");
    }
  }

  function toggleLevel(level: number) {
    setLevels((prev) =>
      prev.includes(level) ? prev.filter((l) => l !== level) : [...prev, level],
    );
  }

  return (
    <div>
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search 3214, databases, capstone, kernel, security…"
        className="w-full rounded-lg border border-neutral-300 px-4 py-3 text-base outline-none focus:border-maroon dark:border-neutral-700 dark:bg-neutral-900 dark:focus:border-orange"
        aria-label="Search courses"
      />

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
        <div className="flex gap-1">
          {LEVELS.map((level) => (
            <button
              key={level}
              onClick={() => toggleLevel(level)}
              aria-pressed={levels.includes(level)}
              className={`rounded-md border px-2.5 py-1 ${
                levels.includes(level)
                  ? "border-maroon bg-maroon text-white dark:border-orange dark:bg-orange dark:text-neutral-950"
                  : "border-neutral-300 dark:border-neutral-700"
              }`}
            >
              {level}
            </button>
          ))}
        </div>

        <select
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          className="rounded-md border border-neutral-300 px-2 py-1 dark:border-neutral-700 dark:bg-neutral-900"
          aria-label="Offered in term"
        >
          <option value="">Any term</option>
          {termNames.map((t) => (
            <option key={t} value={t}>
              Offered {t}
            </option>
          ))}
        </select>

        <label className="flex items-center gap-1.5">
          <input
            type="checkbox"
            checked={openOnly}
            onChange={(e) => setOpenOnly(e.target.checked)}
          />
          Has open sections
        </label>

        <label className="flex items-center gap-1.5">
          Usefulness ≥
          <input
            type="range"
            min={0}
            max={10}
            value={minUse}
            onChange={(e) => setMinUse(Number(e.target.value))}
            className="w-28"
          />
          <span className="w-4 tabular-nums">{minUse}</span>
        </label>

        <span className="ml-auto text-neutral-500">
          {filtered.length} of {rows.length}
        </span>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-neutral-300 text-left dark:border-neutral-700">
              <Th onClick={() => toggleSort("number")} active={sort === "number"} desc={desc}>
                Course
              </Th>
              <th className="px-2 py-2 font-semibold">Title</th>
              <Th
                onClick={() => toggleSort("usefulness")}
                active={sort === "usefulness"}
                desc={desc}
                right
              >
                Use
              </Th>
              <Th
                onClick={() => toggleSort("teaching")}
                active={sort === "teaching"}
                desc={desc}
                right
              >
                Teach
              </Th>
              <Th onClick={() => toggleSort("gpa")} active={sort === "gpa"} desc={desc} right>
                GPA
              </Th>
              <Th
                onClick={() => toggleSort("withdraw")}
                active={sort === "withdraw"}
                desc={desc}
                right
              >
                W%
              </Th>
              <Th
                onClick={() => toggleSort("rating")}
                active={sort === "rating"}
                desc={desc}
                right
              >
                Rating
              </Th>
              <Th
                onClick={() => toggleSort("sections")}
                active={sort === "sections"}
                desc={desc}
                right
              >
                Sections
              </Th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr
                key={r.id}
                className="border-b border-neutral-100 hover:bg-neutral-50 dark:border-neutral-900 dark:hover:bg-neutral-900"
              >
                <td className="whitespace-nowrap px-2 py-2 font-medium">
                  <Link href={`/courses/${r.id}/`} className="text-maroon dark:text-orange">
                    CS {r.numbers.join(" / ")}
                  </Link>
                </td>
                <td className="px-2 py-2">
                  <Link href={`/courses/${r.id}/`}>{r.title}</Link>
                  {r.flags.map((f) => (
                    <span
                      key={f}
                      className="ml-1.5 rounded bg-neutral-200 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
                    >
                      {f}
                    </span>
                  ))}
                </td>
                <td className="px-2 py-2 text-right tabular-nums">{r.usefulnessRaw ?? "—"}</td>
                <td className="px-2 py-2 text-right">{r.teaching ?? "—"}</td>
                <td className="px-2 py-2 text-right tabular-nums">{r.gpa?.toFixed(2) ?? "—"}</td>
                <td className="px-2 py-2 text-right tabular-nums">
                  {r.withdrawPct === null ? "—" : `${r.withdrawPct}%`}
                </td>
                <td className="px-2 py-2 text-right tabular-nums">
                  {r.rmpQuality === null ? (
                    <span className="text-neutral-400">—</span>
                  ) : (
                    <span title={r.rmpN ? `${r.rmpN} ratings` : undefined}>
                      {r.rmpQuality.toFixed(2)}
                      {r.rmpN !== null && r.rmpN < 5 && (
                        <span className="ml-1 text-[10px] text-neutral-400">thin</span>
                      )}
                    </span>
                  )}
                </td>
                <td className="px-2 py-2 text-right tabular-nums">
                  {r.sectionCount === 0 ? (
                    <span className="text-neutral-400">—</span>
                  ) : (
                    <span title={r.offeredTermNames.join(", ")}>
                      {r.sectionCount}
                      {r.openCount > 0 && (
                        <span className="ml-1 text-green-600 dark:text-green-500">
                          {r.openCount} open
                        </span>
                      )}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <p className="py-10 text-center text-neutral-500">No courses match those filters.</p>
        )}
      </div>
    </div>
  );
}

function Th({
  children,
  onClick,
  active,
  desc,
  right,
}: {
  children: React.ReactNode;
  onClick: () => void;
  active: boolean;
  desc: boolean;
  right?: boolean;
}) {
  return (
    <th className={`px-2 py-2 font-semibold ${right ? "text-right" : ""}`}>
      <button onClick={onClick} className="hover:text-maroon dark:hover:text-orange">
        {children}
        <span className="ml-1 text-[10px] text-neutral-400">
          {active ? (desc ? "▼" : "▲") : ""}
        </span>
      </button>
    </th>
  );
}
