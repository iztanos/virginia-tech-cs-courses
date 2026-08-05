"""Regenerate docs/*-level.md and the README master table from data/.

Prose blocks are emitted verbatim; only tables are re-rendered, so a run
against unmodified data reproduces the source files byte for byte. `--check`
exits non-zero when the working tree has drifted, which is what CI enforces.
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

from .md import Table

ROOT = Path(__file__).resolve().parents[2]
DOCS = ROOT / "docs"
DATA = ROOT / "data"

SEP = "\n\n---\n\n"


def render_course(course: dict) -> str:
    out = [f"### {course['heading']}"]
    for block in course["body"]:
        kind = block["t"]
        if kind == "p":
            out.append(block["v"])
        elif kind == "header":
            out.append(course["header"])
        elif kind == "verdict":
            out.append(course["verdict"])
        elif kind in ("stats", "instructors"):
            tbl = Table.from_json(course[f"{kind}_tables"][block["i"]])
            out.append(tbl.render())
        else:
            raise ValueError(f"unknown block type {kind!r}")
    return "\n\n".join(out)


def render_level(page: dict, by_id: dict[str, dict]) -> str:
    parts = [page["head"]]
    for chunk in page["chunks"]:
        parts.append(
            render_course(by_id[chunk["id"]]) if chunk["t"] == "course" else chunk["v"]
        )
    parts.append(page["foot"])
    return SEP.join(parts) + "\n"


def render_readme(readme: dict) -> str:
    sections = list(readme["sections"])
    table = Table(
        header=readme["master_header"],
        align=readme["master_align"],
        rows=readme["master_rows"],
    )
    sections[readme["master_index"]] = (
        readme["master_before"] + table.render() + readme["master_after"]
    )
    return "\n---\n".join(sections)


def build() -> dict[Path, str]:
    courses = json.loads((DATA / "courses.json").read_text())["courses"]
    pages = json.loads((DATA / "pages.json").read_text())
    by_id = {c["id"]: c for c in courses}

    out = {
        DOCS / f"{p['level']}-level.md": render_level(p, by_id) for p in pages["levels"]
    }
    out[ROOT / "README.md"] = render_readme(pages["readme"])
    return out


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument(
        "--check",
        action="store_true",
        help="verify files match data/ instead of writing them",
    )
    args = ap.parse_args()

    drifted = []
    for path, text in build().items():
        if args.check:
            if not path.exists() or path.read_text() != text:
                drifted.append(path.relative_to(ROOT))
        else:
            path.write_text(text)

    if args.check:
        if drifted:
            print("out of date with data/ -- run `python -m tools.vtcourses.gendocs`:")
            for p in drifted:
                print(f"  {p}")
            return 1
        print("docs are in sync with data/")
    else:
        print(f"regenerated {len(build())} files")
    return 0


if __name__ == "__main__":
    sys.exit(main())
