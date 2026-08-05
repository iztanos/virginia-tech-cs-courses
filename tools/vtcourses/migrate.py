"""One-time migration: docs/*.md -> data/*.json.

After this runs, data/ is the source of truth and the level docs plus the
README master table are regenerated from it by gendocs.py. Prose-only pages
(professors, tracks, methodology) stay hand-written -- they hold no numbers a
scraper can refresh, so decomposing them would add risk and buy nothing.
"""

from __future__ import annotations

import json
import re
from pathlib import Path

from .md import Table, clean, intnum, is_table, num, split_paragraphs

ROOT = Path(__file__).resolve().parents[2]
DOCS = ROOT / "docs"
DATA = ROOT / "data"

LEVELS = [1000, 2000, 3000, 4000]

HEADING = re.compile(r"^###\s+CS\s+(?P<nums>\d{4}(?:\s*/\s*\d{4})*)\s*:\s*(?P<title>.+)$")
CREDITS = re.compile(r"^\*\*(?P<meta>.*credits?.*)\*\*$", re.M | re.I)
PREREQ = re.compile(r"^\*\*Prerequisites?:\*\*\s*(?P<v>.+)$", re.M)
VERDICT = re.compile(r"Usefulness\s+(?P<use>[^·]+?)\s*(?:·|$)", re.I)
TEACHING = re.compile(r"Teaching\s+(?P<t>n/d|[A-F][+−\-]?)", re.I)


def slugify(heading: str) -> str:
    """GitHub's anchor algorithm, which the guide's internal links rely on."""
    s = heading.strip().lower()
    s = re.sub(r"[^\w\s-]", "", s)
    return re.sub(r"[\s_]+", "-", s).strip("-")


def parse_entry(chunk: str, level: int) -> dict:
    lines = chunk.strip("\n").splitlines()
    if not lines[0].strip().startswith("### "):
        raise ValueError(f"entry does not start with a heading: {lines[0]!r}")

    heading_text = lines[0].strip()[4:].strip()
    # Some entries are editorial asides ("A note on CS 2704") rather than
    # courses; they carry no numbers and are passed through as prose.
    m = HEADING.match(lines[0].strip())
    numbers = re.findall(r"\d{4}", m.group("nums")) if m else []
    title = m.group("title").strip() if m else heading_text

    entry: dict = {
        "id": f"cs-{numbers[0]}" if numbers else slugify(heading_text),
        "numbers": numbers,
        "title": title,
        "level": level,
        "heading": heading_text,
        "anchor": slugify(heading_text),
        "is_course": bool(numbers),
        "body": [],
    }

    for para in split_paragraphs("\n".join(lines[1:])):
        entry["body"].append(_classify(para, entry))

    _derive(entry)
    return entry


def _classify(para: str, entry: dict) -> dict:
    """Turn a paragraph into a body block, hoisting data out of tables."""
    if is_table(para):
        tbl = Table.parse(para)
        key = "instructors" if clean(tbl.header[0]).lower() == "instructor" else "stats"
        # A course can carry several tables; index them so order survives.
        slot = entry.setdefault(f"{key}_tables", [])
        slot.append(tbl.to_json())
        return {"t": key, "i": len(slot) - 1}

    if para.lstrip().startswith(">"):
        entry["verdict_raw"] = para
        return {"t": "verdict"}

    if CREDITS.search(para) or PREREQ.search(para):
        entry["header_raw"] = para
        return {"t": "header"}

    return {"t": "p", "v": para}


def _derive(entry: dict) -> None:
    """Extract the machine-readable fields the website filters and sorts on."""
    header = entry.pop("header_raw", None)
    if header:
        entry["header"] = header
        cm = CREDITS.search(header)
        meta = cm.group("meta") if cm else ""
        parts = [p.strip() for p in meta.split("·")]
        entry["credits"] = parts[0] if parts else None
        entry["terms"] = [t for t in ("Fall", "Spring", "Summer", "Winter") if t in meta]
        entry["flags"] = [
            p for p in parts[1:] if p.isupper() or p.lower().startswith("pathways")
        ]
        pm = PREREQ.search(header)
        entry["prerequisites"] = pm.group("v").strip() if pm else None

    verdict = entry.pop("verdict_raw", None)
    if verdict:
        entry["verdict"] = verdict
        um = VERDICT.search(verdict)
        if um:
            raw_use = um.group("use").strip()
            entry["usefulness"] = intnum(raw_use) if "/" in raw_use else None
            entry["usefulness_raw"] = clean(raw_use)
        tm = TEACHING.search(verdict)
        if tm:
            entry["teaching"] = clean(tm.group("t"))

    for tbl_json in entry.get("stats_tables", []):
        tbl = Table.from_json(tbl_json)
        head = [clean(h).lower() for h in tbl.header]
        if "avg gpa" in head and len(tbl.rows) == 1:
            entry["stats"] = _stats_row(head, tbl.rows[0])
            break

    instructors = []
    for tbl_json in entry.get("instructors_tables", []):
        tbl = Table.from_json(tbl_json)
        head = [clean(h).lower() for h in tbl.header]
        for row in tbl.rows:
            cells = dict(zip(head, row))
            instructors.append(
                {
                    "name": clean(cells.get("instructor", "")),
                    "gpa": num(cells.get("gpa", "")),
                    "withdraw_pct": num(cells.get("withdraw", "")),
                    "n": intnum(cells.get("n", "")),
                }
            )
    if instructors:
        entry["instructors"] = instructors


def _stats_row(head: list[str], row: list[str]) -> dict:
    cells = dict(zip(head, row))
    rmp = cells.get("rmp quality", "")
    n = re.search(r"n=(\d+)", rmp)
    return {
        "gpa": num(cells.get("avg gpa", "")),
        "withdraw_pct": num(cells.get("withdraw", "")),
        "enrolled": intnum(cells.get("enrolled", "")),
        "rmp_quality": num(rmp) if "thin" not in rmp.lower() else None,
        "rmp_n": int(n.group(1)) if n else None,
        "rmp_difficulty": num(cells.get("rmp difficulty", "")),
        "would_take_again_pct": num(cells.get("would take again", "")),
    }


def parse_level_doc(path: Path, level: int) -> tuple[dict, list[dict]]:
    chunks = re.split(r"\n---\n", path.read_text())
    head, *middle = chunks
    foot = middle.pop() if middle and "###" not in middle[-1] else ""

    # 4000-level groups its entries under "## Theory electives" and similar.
    # Those chunks carry no data, so they ride along as verbatim markdown.
    entries: list[dict] = []
    order: list[dict] = []
    for chunk in middle:
        if chunk.strip().startswith("### "):
            entry = parse_entry(chunk, level)
            entries.append(entry)
            order.append({"t": "course", "id": entry["id"]})
        else:
            order.append({"t": "md", "v": chunk.strip("\n")})

    page = {
        "level": level,
        "head": head.strip("\n"),
        "foot": foot.strip("\n"),
        "chunks": order,
    }
    return page, entries


def parse_readme(path: Path) -> dict:
    """Keep the README verbatim except the master table, which is generated."""
    sections = re.split(r"\n---\n", path.read_text())
    master_idx = next(
        (i for i, s in enumerate(sections) if "| Course | Title |" in s), None
    )
    if master_idx is None:
        raise ValueError("master table not found in README")

    section = sections[master_idx]
    table_txt = "\n".join(
        ln for ln in section.splitlines() if ln.lstrip().startswith("|")
    )
    tbl = Table.parse(table_txt)
    before, after = section.split(table_txt, 1)

    return {
        "sections": sections,
        "master_index": master_idx,
        "master_before": before,
        "master_after": after,
        "master_header": tbl.header,
        "master_align": tbl.align,
        "master_rows": tbl.rows,
    }


def main() -> None:
    DATA.mkdir(exist_ok=True)
    pages, courses = [], []
    for level in LEVELS:
        page, entries = parse_level_doc(DOCS / f"{level}-level.md", level)
        pages.append(page)
        courses.extend(entries)

    (DATA / "courses.json").write_text(
        json.dumps({"courses": courses}, indent=2, ensure_ascii=False) + "\n"
    )
    (DATA / "pages.json").write_text(
        json.dumps(
            {"levels": pages, "readme": parse_readme(ROOT / "README.md")},
            indent=2,
            ensure_ascii=False,
        )
        + "\n"
    )
    print(f"wrote {len(courses)} entries across {len(pages)} level pages")


if __name__ == "__main__":
    main()
