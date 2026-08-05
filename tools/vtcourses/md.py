"""Markdown table and paragraph helpers.

The guide's prose is hand-written and must survive a JSON round-trip untouched.
Only tables are decomposed into data, so only tables need a renderer that
reproduces the original bytes exactly.
"""

from __future__ import annotations

import re
from dataclasses import dataclass, field


def split_paragraphs(text: str) -> list[str]:
    """Split on blank lines, preserving each paragraph's internal newlines."""
    return [p for p in re.split(r"\n[ \t]*\n", text.strip("\n")) if p.strip()]


@dataclass
class Table:
    """A pipe table, kept close enough to the source to re-render byte-exactly."""

    header: list[str]
    align: list[str]
    rows: list[list[str]] = field(default_factory=list)

    @classmethod
    def parse(cls, block: str) -> Table:
        lines = [ln.strip() for ln in block.strip().splitlines() if ln.strip()]
        cells = [_split_row(ln) for ln in lines]
        return cls(header=cells[0], align=cells[1], rows=cells[2:])

    def render(self) -> str:
        out = ["| " + " | ".join(self.header) + " |", "|" + "|".join(self.align) + "|"]
        out += ["| " + " | ".join(r) + " |" for r in self.rows]
        return "\n".join(out)

    def to_json(self) -> dict:
        return {"header": self.header, "align": self.align, "rows": self.rows}

    @classmethod
    def from_json(cls, d: dict) -> Table:
        return cls(header=d["header"], align=d["align"], rows=[list(r) for r in d["rows"]])


def _split_row(line: str) -> list[str]:
    line = line.strip()
    if line.startswith("|"):
        line = line[1:]
    if line.endswith("|"):
        line = line[:-1]
    return [c.strip() for c in line.split("|")]


def is_table(block: str) -> bool:
    return block.lstrip().startswith("|")


# --- value coercion -------------------------------------------------------
# Cells carry markdown emphasis and footnote markers; the site wants numbers.

_BOLD = re.compile(r"\*\*|\*|`")
_FOOTNOTE = re.compile(r"[¹²³]")


def clean(cell: str) -> str:
    return _FOOTNOTE.sub("", _BOLD.sub("", cell)).strip()


def num(cell: str) -> float | None:
    """First number in a cell, ignoring emphasis, commas, %, and footnotes."""
    m = re.search(r"-?\d+(?:,\d{3})*(?:\.\d+)?", clean(cell))
    return float(m.group().replace(",", "")) if m else None


def intnum(cell: str) -> int | None:
    v = num(cell)
    return int(v) if v is not None else None
