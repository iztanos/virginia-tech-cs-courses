"""Scrape live section listings from VT's Banner Timetable of Classes.

The timetable never publishes seats-remaining, only a section's capacity. But
it does offer an "ONLY OPEN Sections" filter, so each term is fetched twice --
once unfiltered, once filtered -- and a section's open/full state is the
difference between the two CRN sets.

The markup is legacy Banner output with unclosed <tr> tags, so rows are located
by cell count rather than by structure:

    13 cells  a section with a scheduled meeting time
    12 cells  a section with arranged hours -- Begin/End are merged into one cell
    10 cells  an "* Additional Times *" continuation of the section above it
"""

from __future__ import annotations

import argparse
import json
import re
from dataclasses import asdict, dataclass, field
from datetime import UTC, datetime
from pathlib import Path

import httpx
import lxml.html

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "data" / "generated" / "sections.json"

BASE = "https://selfservice.banner.vt.edu/ssb"
FORM_URL = f"{BASE}/HZSKVTSC.P_DispRequest"
SEARCH_URL = f"{BASE}/HZSKVTSC.P_ProcRequest"

# Banner returns an empty body to default clients.
UA = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
    "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36"
)
CAMPUSES = {"0": "Blacksburg", "10": "Virtual", "4": "National Capital Region"}

_WS = re.compile(r"\s+")


@dataclass
class Meeting:
    days: str
    begin: str
    end: str
    location: str


@dataclass
class Section:
    crn: str
    course: str
    number: str
    title: str
    schedule_type: str
    modality: str
    credits: str
    capacity: int | None
    instructor: str
    exam: str
    meetings: list[Meeting] = field(default_factory=list)
    open: bool | None = None


def _text(el) -> str:
    return _WS.sub(" ", el.text_content()).replace("\xa0", " ").strip()


def discover_terms(client: httpx.Client) -> list[dict[str, str]]:
    """Read the term dropdown so newly published terms are picked up on their own."""
    html = lxml.html.fromstring(client.get(FORM_URL).text)
    options = html.xpath('//select[@name="TERMYEAR"]/option')
    terms, seen = [], set()
    for opt in options:
        code, name = opt.get("value", "").strip(), _text(opt)
        # The first option is a "Select Term" placeholder reusing a real code.
        if not code or name.lower().startswith("select") or code in seen:
            continue
        seen.add(code)
        terms.append({"code": code, "name": name})
    return terms


def fetch(client: httpx.Client, term: str, subject: str, campus: str, open_only: bool) -> str:
    resp = client.post(
        SEARCH_URL,
        data={
            "CAMPUS": campus,
            "TERMYEAR": term,
            "CORE_CODE": "AR%",
            "subj_code": subject,
            "SCHDTYPE": "%",
            "CRSE_NUMBER": "",
            "crn": "",
            "open_only": "on" if open_only else "",
            "sess_code": "%",
            "BTN_PRESSED": "FIND class sections",
            "inst_name": "",
        },
        headers={"Referer": FORM_URL},
    )
    resp.raise_for_status()
    return resp.text


def parse_sections(html: str) -> list[Section]:
    doc = lxml.html.fromstring(html)
    tables = doc.xpath('//table[@class="dataentrytable"]')
    if not tables:
        return []

    sections: list[Section] = []
    for row in tables[0].xpath(".//tr"):
        cells = [_text(td) for td in row.xpath("./td")]

        if len(cells) == 10 and "Additional Times" in cells[4]:
            if sections:
                sections[-1].meetings.append(
                    Meeting(days=cells[5], begin=cells[6], end=cells[7], location=cells[8])
                )
            continue

        if len(cells) not in (12, 13) or not cells[0].isdigit():
            continue

        # Arranged-hours rows merge Begin and End, shifting everything after.
        if len(cells) == 12:
            days, begin, end, location, exam = cells[8], "", "", cells[10], cells[11]
        else:
            days, begin, end, location, exam = cells[8], cells[9], cells[10], cells[11], cells[12]

        course = cells[1]
        number = course.split("-")[-1]
        section = Section(
            crn=cells[0],
            course=course,
            number=number,
            title=cells[2],
            schedule_type=cells[3],
            modality=cells[4],
            credits=cells[5],
            capacity=int(cells[6]) if cells[6].isdigit() else None,
            instructor=cells[7],
            exam=exam,
        )
        if days or begin or location:
            section.meetings.append(
                Meeting(days=days, begin=begin, end=end, location=location)
            )
        sections.append(section)

    return sections


def scrape(subject: str = "CS", campus: str = "0") -> dict:
    with httpx.Client(headers={"User-Agent": UA}, timeout=60, follow_redirects=True) as client:
        terms = discover_terms(client)
        out_terms = []
        for term in terms:
            sections = parse_sections(fetch(client, term["code"], subject, campus, False))
            open_crns = {
                s.crn for s in parse_sections(fetch(client, term["code"], subject, campus, True))
            }
            for section in sections:
                section.open = section.crn in open_crns
            out_terms.append({**term, "sections": [asdict(s) for s in sections]})
            print(
                f"  {term['name']:<14} {len(sections):>4} sections, "
                f"{len(open_crns):>4} open"
            )

    return {
        "scraped_at": datetime.now(UTC).isoformat(timespec="seconds"),
        "source": SEARCH_URL,
        "subject": subject,
        "campus": CAMPUSES.get(campus, campus),
        "terms": out_terms,
    }


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--subject", default="CS")
    ap.add_argument("--campus", default="0", choices=sorted(CAMPUSES))
    ap.add_argument("--out", type=Path, default=OUT)
    args = ap.parse_args()

    print(f"scraping {args.subject} sections ({CAMPUSES[args.campus]})")
    data = scrape(args.subject, args.campus)
    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n")

    total = sum(len(t["sections"]) for t in data["terms"])
    print(f"wrote {total} sections across {len(data['terms'])} terms -> {args.out}")


if __name__ == "__main__":
    main()
