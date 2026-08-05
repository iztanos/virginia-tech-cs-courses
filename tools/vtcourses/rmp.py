"""Scrape RateMyProfessors ratings for VT Computer Science faculty.

Uses the public GraphQL endpoint documented in docs/methodology.md. The
`Authorization: Basic dGVzdDp0ZXN0` header is the site's own hardcoded
`test:test` credential, sent by every visitor's browser.

Two paginated connections: `newSearch.teachers` to enumerate faculty, then
`ratings` per teacher. Ratings are bucketed into per-course aggregates by the
four-digit number parsed out of each rating's free-text `class` field, which is
why a rating for "CS3214" and one for "cs 3214" land together.

Quality is (clarity + helpfulness) / 2, matching the guide's definition.
"""

from __future__ import annotations

import argparse
import json
import re
import time
from collections import defaultdict
from datetime import UTC, datetime
from pathlib import Path
from typing import Any

import httpx

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "data" / "generated" / "rmp.json"

ENDPOINT = "https://www.ratemyprofessors.com/graphql"
AUTH = "Basic dGVzdDp0ZXN0"
VT_SCHOOL_ID = "U2Nob29sLTEzNDk="
DEPARTMENT = "Computer Science"

PAGE = 100
DELAY = 0.4  # be a polite client; this is someone else's free endpoint

TEACHERS_QUERY = """
query Teachers($id: ID!, $cursor: String) {
  newSearch {
    teachers(query: {schoolID: $id, fallback: true}, first: %d, after: $cursor) {
      pageInfo { hasNextPage endCursor }
      edges { node {
        id legacyId firstName lastName department
        avgRating avgDifficulty numRatings wouldTakeAgainPercent
      } }
    }
  }
}
""" % PAGE

RATINGS_QUERY = """
query Ratings($id: ID!, $cursor: String) {
  node(id: $id) {
    ... on Teacher {
      ratings(first: %d, after: $cursor) {
        pageInfo { hasNextPage endCursor }
        edges { node {
          class clarityRating helpfulRating difficultyRating
          wouldTakeAgain date comment
        } }
      }
    }
  }
}
""" % PAGE

_COURSE_NUM = re.compile(r"(\d{4})")


def _post(client: httpx.Client, query: str, variables: dict) -> dict:
    resp = client.post(ENDPOINT, json={"query": query, "variables": variables})
    resp.raise_for_status()
    payload = resp.json()
    if payload.get("errors"):
        raise RuntimeError(f"GraphQL error: {payload['errors']}")
    return payload["data"]


def fetch_faculty(client: httpx.Client, department: str) -> list[dict[str, Any]]:
    faculty, cursor = [], None
    while True:
        data = _post(client, TEACHERS_QUERY, {"id": VT_SCHOOL_ID, "cursor": cursor})
        conn = data["newSearch"]["teachers"]
        for edge in conn["edges"]:
            node = edge["node"]
            if (node.get("department") or "").strip() == department:
                faculty.append(node)
        if not conn["pageInfo"]["hasNextPage"]:
            return faculty
        cursor = conn["pageInfo"]["endCursor"]
        time.sleep(DELAY)


def fetch_ratings(client: httpx.Client, teacher_id: str) -> list[dict[str, Any]]:
    ratings, cursor = [], None
    while True:
        data = _post(client, RATINGS_QUERY, {"id": teacher_id, "cursor": cursor})
        conn = (data.get("node") or {}).get("ratings")
        if not conn:
            return ratings
        ratings.extend(edge["node"] for edge in conn["edges"])
        if not conn["pageInfo"]["hasNextPage"]:
            return ratings
        cursor = conn["pageInfo"]["endCursor"]
        time.sleep(DELAY)


def _quality(rating: dict) -> float | None:
    clarity, helpful = rating.get("clarityRating"), rating.get("helpfulRating")
    if clarity is None or helpful is None:
        return None
    return (clarity + helpful) / 2


def _mean(values: list[float]) -> float | None:
    return round(sum(values) / len(values), 2) if values else None


def aggregate(professors: list[dict]) -> dict[str, dict]:
    """Bucket every rating by course number to get per-course aggregates."""
    buckets: dict[str, list[dict]] = defaultdict(list)
    for prof in professors:
        for rating in prof["ratings"]:
            m = _COURSE_NUM.search(rating.get("class") or "")
            if m:
                buckets[m.group(1)].append({**rating, "professor": prof["name"]})

    courses = {}
    for number, ratings in buckets.items():
        qualities = [q for q in (_quality(r) for r in ratings) if q is not None]
        difficulties = [r["difficultyRating"] for r in ratings if r.get("difficultyRating")]
        retake = [r["wouldTakeAgain"] for r in ratings if r.get("wouldTakeAgain") in (0, 1)]

        recent = sorted(ratings, key=lambda r: r.get("date") or "", reverse=True)
        courses[number] = {
            "n": len(ratings),
            "quality": _mean(qualities),
            "difficulty": _mean(difficulties),
            "would_take_again_pct": round(100 * sum(retake) / len(retake)) if retake else None,
            "professors": sorted({r["professor"] for r in ratings}),
            "recent_comments": [
                {
                    "professor": r["professor"],
                    "date": (r.get("date") or "")[:10],
                    "quality": _quality(r),
                    "difficulty": r.get("difficultyRating"),
                    "comment": (r.get("comment") or "").strip(),
                }
                for r in recent[:10]
                if (r.get("comment") or "").strip()
            ],
        }
    return courses


def scrape(department: str = DEPARTMENT) -> dict:
    headers = {
        "Authorization": AUTH,
        "Content-Type": "application/json",
        "User-Agent": (
            "vt-cs-courses/0.1 "
            "(+https://github.com/tanushn-hub/virginia-tech-cs-courses)"
        ),
    }
    with httpx.Client(headers=headers, timeout=60) as client:
        faculty = fetch_faculty(client, department)
        print(f"  {len(faculty)} {department} faculty")

        professors = []
        for i, teacher in enumerate(faculty, 1):
            ratings = fetch_ratings(client, teacher["id"]) if teacher["numRatings"] else []
            name = f"{teacher['firstName']} {teacher['lastName']}".strip()
            professors.append(
                {
                    "id": teacher["id"],
                    "legacy_id": teacher.get("legacyId"),
                    "name": name,
                    "last_name": teacher["lastName"],
                    "department": teacher.get("department"),
                    "avg_rating": teacher.get("avgRating"),
                    "avg_difficulty": teacher.get("avgDifficulty"),
                    "num_ratings": teacher.get("numRatings"),
                    "would_take_again_pct": (
                        round(teacher["wouldTakeAgainPercent"])
                        if isinstance(teacher.get("wouldTakeAgainPercent"), (int, float))
                        and teacher["wouldTakeAgainPercent"] >= 0
                        else None
                    ),
                    "ratings": ratings,
                }
            )
            if i % 20 == 0:
                print(f"  ...{i}/{len(faculty)} faculty")
            time.sleep(DELAY)

    total = sum(len(p["ratings"]) for p in professors)
    print(f"  {total} ratings pulled")

    return {
        "scraped_at": datetime.now(UTC).isoformat(timespec="seconds"),
        "source": ENDPOINT,
        "school": "Virginia Tech",
        "department": department,
        "professor_count": len(professors),
        "rating_count": total,
        "professors": professors,
        "courses": aggregate(professors),
    }


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--department", default=DEPARTMENT)
    ap.add_argument("--out", type=Path, default=OUT)
    args = ap.parse_args()

    print(f"scraping RateMyProfessors: VT {args.department}")
    data = scrape(args.department)
    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n")
    print(f"wrote {data['rating_count']} ratings over {len(data['courses'])} courses -> {args.out}")


if __name__ == "__main__":
    main()
