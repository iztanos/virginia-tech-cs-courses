"""Collect r/VirginiaTech discussion threads per course via Reddit's official API.

Unauthenticated access is blocked outright: reddit.com/robots.txt itself returns
a "Blocked" page and /search.json returns HTTP 403 from datacenter addresses.
The supported route is OAuth, which is free but needs an app registered at
https://www.reddit.com/prefs/apps ("script" type is fine).

Set REDDIT_CLIENT_ID and REDDIT_CLIENT_SECRET. Without them this exits 0 without
writing anything, so the scheduled job stays green until credentials are added.

Reddit's API rules require a descriptive, contactable User-Agent and cap
app-only clients at 100 requests/minute; one request per course stays far under
that.
"""

from __future__ import annotations

import argparse
import json
import os
import sys
import time
from datetime import UTC, datetime
from pathlib import Path

import httpx

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "data" / "generated" / "reddit.json"
COURSES = ROOT / "data" / "courses.json"

TOKEN_URL = "https://www.reddit.com/api/v1/access_token"
API = "https://oauth.reddit.com"
SUBREDDIT = "VirginiaTech"

UA = "vt-cs-courses/0.1 by u/unknown (+https://github.com/tanushn-hub/virginia-tech-cs-courses)"
DELAY = 1.0
PER_COURSE = 8


def get_token(client_id: str, client_secret: str) -> str:
    resp = httpx.post(
        TOKEN_URL,
        data={"grant_type": "client_credentials"},
        auth=(client_id, client_secret),
        headers={"User-Agent": UA},
        timeout=30,
    )
    if resp.status_code == 401:
        raise RuntimeError("Reddit rejected the credentials (401) -- check id/secret")
    resp.raise_for_status()
    return resp.json()["access_token"]


def search(client: httpx.Client, query: str, limit: int) -> list[dict]:
    resp = client.get(
        f"{API}/r/{SUBREDDIT}/search",
        params={
            "q": query,
            "restrict_sr": 1,
            "sort": "relevance",
            "t": "all",
            "limit": limit,
        },
    )
    if resp.status_code == 429:
        # Back off once rather than hammering a rate limit.
        time.sleep(30)
        resp = client.get(
            f"{API}/r/{SUBREDDIT}/search",
            params={"q": query, "restrict_sr": 1, "sort": "relevance", "limit": limit},
        )
    resp.raise_for_status()

    threads = []
    for child in resp.json().get("data", {}).get("children", []):
        post = child.get("data", {})
        body = (post.get("selftext") or "").strip()
        threads.append(
            {
                "id": post.get("id"),
                "title": post.get("title"),
                "permalink": f"https://www.reddit.com{post.get('permalink', '')}",
                "score": post.get("score"),
                "num_comments": post.get("num_comments"),
                "created": datetime.fromtimestamp(
                    post.get("created_utc", 0), UTC
                ).date().isoformat(),
                "flair": post.get("link_flair_text"),
                # Enough to judge relevance without mirroring whole posts.
                "excerpt": body[:400] + ("…" if len(body) > 400 else ""),
            }
        )
    return threads


def course_numbers() -> list[str]:
    data = json.loads(COURSES.read_text())
    numbers: list[str] = []
    for course in data["courses"]:
        numbers.extend(course.get("numbers", []))
    return sorted(set(numbers))


def scrape(numbers: list[str], per_course: int) -> dict:
    client_id = os.environ.get("REDDIT_CLIENT_ID", "").strip()
    client_secret = os.environ.get("REDDIT_CLIENT_SECRET", "").strip()
    if not (client_id and client_secret):
        raise LookupError("missing credentials")

    token = get_token(client_id, client_secret)
    headers = {"Authorization": f"bearer {token}", "User-Agent": UA}

    courses: dict[str, list[dict]] = {}
    with httpx.Client(headers=headers, timeout=60) as client:
        for i, number in enumerate(numbers, 1):
            threads = search(client, f'"CS {number}"', per_course)
            if threads:
                courses[number] = threads
            if i % 20 == 0:
                print(f"  ...{i}/{len(numbers)} courses")
            time.sleep(DELAY)

    return {
        "scraped_at": datetime.now(UTC).isoformat(timespec="seconds"),
        "source": f"{API}/r/{SUBREDDIT}/search",
        "subreddit": SUBREDDIT,
        "thread_count": sum(len(v) for v in courses.values()),
        "courses": courses,
    }


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--per-course", type=int, default=PER_COURSE)
    ap.add_argument("--out", type=Path, default=OUT)
    args = ap.parse_args()

    try:
        data = scrape(course_numbers(), args.per_course)
    except LookupError:
        print(
            "REDDIT_CLIENT_ID / REDDIT_CLIENT_SECRET not set -- skipping Reddit.\n"
            "Register an app at https://www.reddit.com/prefs/apps to enable it."
        )
        return 0

    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n")
    print(
        f"wrote {data['thread_count']} threads across "
        f"{len(data['courses'])} courses -> {args.out}"
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
