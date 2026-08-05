"""Scrape the official CS course catalog from catalog.vt.edu.

catalog.vt.edu answers default clients with HTTP 202 and an empty body, so a
browser User-Agent is mandatory. Course entries are `div.courseblock` elements
whose fields are marked with `detail-*` classes; blocks without a `detail-code`
are nested description fragments and are skipped.
"""

from __future__ import annotations

import argparse
import json
import re
from dataclasses import asdict, dataclass
from datetime import UTC, datetime
from pathlib import Path

import httpx
import lxml.html

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "data" / "generated" / "catalog.json"

URL = "https://catalog.vt.edu/course-descriptions/{subject}/"
UA = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
    "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36"
)

_WS = re.compile(r"\s+")
_CODE = re.compile(r"^([A-Z]{2,4})\s*(\d{4})$")
_LABEL = re.compile(
    r"^(Prerequisite\(s\)|Corequisite\(s\)|Cross-Listed With|"
    r"Pathway Concept Area\(s\)|Repeatability|Instructional Contact Hours):\s*",
    re.I,
)

FIELDS = {
    "detail-prereq": "prerequisites",
    "detail-coreq": "corequisites",
    "detail-cross_listed": "cross_listed",
    "detail-pathway": "pathways",
    "detail-repeatability": "repeatability",
    "detail-contact_hours": "contact_hours",
}


@dataclass
class CatalogCourse:
    subject: str
    number: str
    title: str
    credits: str
    description: str
    prerequisites: str | None = None
    corequisites: str | None = None
    cross_listed: str | None = None
    pathways: str | None = None
    repeatability: str | None = None
    contact_hours: str | None = None


def _text(el) -> str:
    return _WS.sub(" ", el.text_content()).replace("\xa0", " ").strip()


def _pick(block, cls: str) -> str | None:
    found = block.xpath(f'.//*[contains(@class, "{cls}")]')
    if not found:
        return None
    return _LABEL.sub("", _text(found[0])).strip() or None


def parse(html: str) -> list[CatalogCourse]:
    doc = lxml.html.fromstring(html)
    courses = []

    for block in doc.xpath('//div[contains(@class, "courseblock")]'):
        code_el = block.xpath('.//*[contains(@class, "detail-code")]')
        if not code_el:
            continue  # a nested description fragment, not a course
        m = _CODE.match(_text(code_el[0]))
        if not m:
            continue

        # The description is the block's own prose, minus every labelled field.
        described = block.xpath('.//*[contains(@class, "courseblockextra")]')
        description = " ".join(_text(p) for p in described[:1]) if described else ""

        # The catalog renders these as "- Computer Systems" and "(3 credits)".
        title = (_pick(block, "detail-title") or "").lstrip("-").strip()
        credits = (_pick(block, "detail-hours_html") or "").strip("()").strip()

        course = CatalogCourse(
            subject=m.group(1),
            number=m.group(2),
            title=title,
            credits=credits,
            description=description,
        )
        for cls, attr in FIELDS.items():
            setattr(course, attr, _pick(block, cls))
        courses.append(course)

    return courses


def scrape(subject: str = "cs") -> dict:
    with httpx.Client(headers={"User-Agent": UA}, timeout=60, follow_redirects=True) as client:
        resp = client.get(URL.format(subject=subject.lower()))
        resp.raise_for_status()
        if not resp.text.strip():
            raise RuntimeError("catalog returned an empty body -- User-Agent rejected?")
        courses = parse(resp.text)

    if not courses:
        raise RuntimeError("catalog page parsed to zero courses -- markup changed?")

    return {
        "scraped_at": datetime.now(UTC).isoformat(timespec="seconds"),
        "source": URL.format(subject=subject.lower()),
        "subject": subject.upper(),
        "courses": [asdict(c) for c in courses],
    }


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--subject", default="cs")
    ap.add_argument("--out", type=Path, default=OUT)
    args = ap.parse_args()

    data = scrape(args.subject)
    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n")
    print(f"wrote {len(data['courses'])} catalog courses -> {args.out}")


if __name__ == "__main__":
    main()
