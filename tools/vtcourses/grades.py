"""Rebuild grade and attrition figures from VT's published grade distributions.

Source is the public mirror named in docs/methodology.md. VT's own University
DataCommons hosts the authoritative version but requires a VT PID, so this
extract (AY2019-20 through 2021-22) is the most recent data obtainable without
one -- every GPA in the guide inherits that ceiling.

Aggregation matches the guide's stated method:
    GPA        enrollment-weighted by Graded Enrollment
    withdrawal Withdraws / (Withdraws + Graded Enrollment)
"""

from __future__ import annotations

import argparse
import csv
import io
import json
from collections import defaultdict
from datetime import UTC, datetime
from pathlib import Path

import httpx

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "data" / "generated" / "grades.json"

CSV_URL = (
    "https://raw.githubusercontent.com/jrudman25/CourseSearch/HEAD/"
    "Grade%20Distribution.csv"
)

# Anything below this is statistical noise; methodology.md calls it out.
THIN_ENROLLMENT = 40


def _float(value: str) -> float | None:
    try:
        return float(str(value).replace(",", "").strip())
    except (TypeError, ValueError):
        return None


def _int(value: str) -> int:
    v = _float(value)
    return int(v) if v is not None else 0


class Accumulator:
    """Enrollment-weighted GPA plus withdrawal counts."""

    def __init__(self) -> None:
        self.gpa_weighted = 0.0
        self.enrolled = 0
        self.withdraws = 0
        self.sections = 0

    def add(self, gpa: float | None, enrolled: int, withdraws: int) -> None:
        if gpa is not None and enrolled:
            self.gpa_weighted += gpa * enrolled
        self.enrolled += enrolled
        self.withdraws += withdraws
        self.sections += 1

    def result(self) -> dict:
        denominator = self.withdraws + self.enrolled
        return {
            "gpa": round(self.gpa_weighted / self.enrolled, 2) if self.enrolled else None,
            "withdraw_pct": (
                round(100 * self.withdraws / denominator, 1) if denominator else None
            ),
            "enrolled": self.enrolled,
            "withdraws": self.withdraws,
            "sections": self.sections,
            "thin": self.enrolled < THIN_ENROLLMENT,
        }


def aggregate(rows: list[dict], subject: str) -> dict:
    by_course: dict[str, Accumulator] = defaultdict(Accumulator)
    by_instructor: dict[str, dict[str, Accumulator]] = defaultdict(
        lambda: defaultdict(Accumulator)
    )
    titles: dict[str, str] = {}
    years: set[str] = set()

    for row in rows:
        if (row.get("Subject") or "").strip() != subject:
            continue
        number = (row.get("Course No.") or "").strip()
        if not number:
            continue

        gpa = _float(row.get("GPA", ""))
        enrolled = _int(row.get("Graded Enrollment", ""))
        withdraws = _int(row.get("Withdraws", ""))
        instructor = (row.get("Instructor") or "").strip() or "Unknown"

        by_course[number].add(gpa, enrolled, withdraws)
        by_instructor[number][instructor].add(gpa, enrolled, withdraws)
        titles.setdefault(number, (row.get("Course Title") or "").strip())
        years.add((row.get("Academic Year") or "").strip())

    courses = {}
    for number, acc in sorted(by_course.items()):
        instructors = [
            {"name": name, **stats.result()}
            for name, stats in by_instructor[number].items()
        ]
        # Best GPA first, which is the order the guide's tables use.
        instructors.sort(key=lambda i: (i["gpa"] is None, -(i["gpa"] or 0)))
        courses[number] = {
            "title": titles.get(number, ""),
            **acc.result(),
            "instructors": instructors,
        }

    return {"courses": courses, "years": sorted(y for y in years if y)}


def scrape(subject: str = "CS", url: str = CSV_URL) -> dict:
    with httpx.Client(timeout=120, follow_redirects=True) as client:
        resp = client.get(url)
        resp.raise_for_status()

    # The mirror is served with a BOM.
    rows = list(csv.DictReader(io.StringIO(resp.text.lstrip("﻿"))))
    if not rows:
        raise RuntimeError("grade CSV parsed to zero rows")

    result = aggregate(rows, subject)
    if not result["courses"]:
        raise RuntimeError(f"no rows for subject {subject!r} -- column names changed?")

    return {
        "scraped_at": datetime.now(UTC).isoformat(timespec="seconds"),
        "source": url,
        "subject": subject,
        "academic_years": result["years"],
        "total_rows": len(rows),
        "subject_rows": sum(c["sections"] for c in result["courses"].values()),
        "courses": result["courses"],
    }


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--subject", default="CS")
    ap.add_argument("--out", type=Path, default=OUT)
    args = ap.parse_args()

    data = scrape(args.subject)
    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n")
    print(
        f"wrote {len(data['courses'])} {args.subject} courses "
        f"from {data['subject_rows']} section rows "
        f"({', '.join(data['academic_years'])}) -> {args.out}"
    )


if __name__ == "__main__":
    main()
