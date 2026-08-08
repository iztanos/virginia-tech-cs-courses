# How this repo works

The guide is a dataset with a website on top of it, not a folder of markdown.
This page explains where each number comes from, what refreshes itself, and
what you have to edit by hand.

---

## Layout

```
data/
  courses.json           curated scores + prose      SOURCE OF TRUTH, hand-edited
  pages.json             page chrome + master table  SOURCE OF TRUTH, hand-edited
  generated/
    sections.json        live timetable              scraped, twice a day
    catalog.json         official catalog            scraped, weekly
docs/
  1000-4000-level.md     GENERATED from data/ -- do not edit
  professors.md          hand-written prose
  tracks.md              hand-written prose
  methodology.md         hand-written prose
README.md                GENERATED from data/ -- do not edit
tools/vtcourses/         scrapers and the doc generator
web/                     Next.js + Tailwind static site
```

`docs/*-level.md` and `README.md` are build output. Editing them by hand works
until the next scrape overwrites your change, so CI fails the build if they
drift from `data/`. Edit `data/courses.json`, then run:

```bash
python -m tools.vtcourses.gendocs
```

The three prose pages are *not* generated. They contain no machine-refreshable
numbers, so decomposing them into JSON would add risk and buy nothing.

---

## Data sources

| Layer | Source | Refresh | What it gives |
|---|---|---|---|
| Curated | `data/courses.json` | on commit | Usefulness /10, teaching grade, editorial prose |
| Sections | Banner Timetable of Classes | every 30 min | CRN, schedule type, modality, credits, capacity, meeting times, location, exam, open/full |
| Catalog | `catalog.vt.edu` | weekly | Official title, credits, description, prerequisites, corequisites, cross-listings, Pathways |
| Ratings | RateMyProfessors GraphQL | weekly | Per-course quality, difficulty, would-take-again, recent comments with dates and instructor |
| Grades | VT grade distributions (public mirror) | weekly | Enrollment-weighted GPA and withdrawal, per course **and per instructor** |
| Discussion | Reddit official API | weekly, opt-in | r/VirginiaTech threads per course |

All of them join on the four-digit course number.

The scraped grade and rating layers reproduce the guide's own figures: the
grade extract returns 627 CS section rows and RateMyProfessors returns 829
ratings, matching `docs/methodology.md` exactly, and CS 3214 recomputes to
GPA 2.92 / 4.4% withdrawal / 3.63 quality / n=23 — the numbers in the printed
tables. The site prefers the scraped values and falls back to the curated
snapshot where a course has none.

---

## Scraper notes

Both scrapers are plain `httpx` + `lxml` and run without credentials.

**Timetable** (`tools/vtcourses/timetable.py`)

- `GET  /ssb/HZSKVTSC.P_DispRequest` — read the term dropdown, so newly
  published terms get picked up without a code change
- `POST /ssb/HZSKVTSC.P_ProcRequest` — one request per term
- The response is legacy Banner markup with unclosed `<tr>` tags, so rows are
  identified by cell count: 13 = a scheduled section, 12 = arranged hours
  (Begin/End merged into one cell), 10 = an `* Additional Times *` continuation
  of the row above
- **Seats remaining are not published** — only a section's capacity. Open/full
  is derived instead by fetching each term twice, once unfiltered and once with
  the timetable's own "ONLY OPEN Sections" filter, and diffing the CRN sets
- **Instructor assignments are not published either.** The Instructor column
  reads `N/A` for every section, in every term, for every subject — verified
  against the per-CRN detail page as well. Historical instructor data in this
  guide comes from the AY2019-22 grade extract, not from the timetable

**Catalog** (`tools/vtcourses/catalog.py`)

- `catalog.vt.edu` answers default clients with **HTTP 202 and an empty body**;
  a browser `User-Agent` is required
- Courses are `div.courseblock` elements with `detail-*` field classes; blocks
  without a `detail-code` are nested description fragments and are skipped
- Yields 157 CS courses, 73 of them undergraduate — which matches the course
  count in the guide

**RateMyProfessors** (`tools/vtcourses/rmp.py`)

- Public GraphQL endpoint; the `Authorization: Basic dGVzdDp0ZXN0` header is
  the site's own hardcoded `test:test` credential that every browser sends
- Two paginated connections: `newSearch.teachers` filtered to
  `department == "Computer Science"`, then `ratings` per teacher
- Ratings are bucketed into per-course aggregates by the four-digit number
  parsed out of each rating's free-text `class` field
- Quality is (clarity + helpfulness) / 2, matching the guide's definition
- 110 faculty, 829 ratings, 0.4s between requests

**Grade distributions** (`tools/vtcourses/grades.py`)

- Public CSV mirror; VT's own University DataCommons needs a VT PID
- GPA is enrollment-weighted; withdrawal is
  `Withdraws / (Withdraws + Graded Enrollment)`
- Covers AY2019-20 → 2021-22 and **cannot be extended without PID access** —
  every GPA on the site inherits that Spring 2022 ceiling
- Unlike the printed tables it keeps instructors under 40 students, flagged
  `thin` rather than dropped

**Reddit** (`tools/vtcourses/reddit.py`) — *opt-in, off by default*

- Anonymous access is blocked: `reddit.com/robots.txt` itself returns a
  "Blocked" page and `/search.json` returns 403 from datacenter addresses
- The supported route is OAuth. Register a "script" app at
  <https://www.reddit.com/prefs/apps>, then add `REDDIT_CLIENT_ID` and
  `REDDIT_CLIENT_SECRET` as repository secrets
- Without those the scraper prints a notice and exits 0, so the scheduled job
  stays green
- **This path has not been exercised against real credentials** — only the
  missing-credential and rejected-credential branches are verified

### Coursicle — deliberately not scraped

Coursicle answers every request with **HTTP 429 and a reCAPTCHA page** whose
own source comments describe it as scraping and DDoS protection. Its
`robots.txt` does allow the review URL patterns for a generic user-agent, but
the CAPTCHA is an access control regardless, and getting past it would mean
defeating it. It is left alone.

---

## Automation

| Workflow | Trigger | Does |
|---|---|---|
| `scrape.yml` | `*/30 * * * *` timetable; Mondays everything | Scrapes, commits `data/generated/` only if something changed, then calls the deploy workflow |
| `deploy.yml` | push to `main`, `workflow_dispatch`, or called by `scrape.yml` | Builds the static export and publishes it to GitHub Pages |
| `ci.yml` | pull requests and pushes | Fails if generated docs drift from `data/`; typechecks and builds the site |

`scrape.yml` calls `deploy.yml` directly rather than relying on its own commit
to trigger a push event — commits pushed with `GITHUB_TOKEN` deliberately do not
start new workflow runs.

Two GitHub behaviours worth knowing:

- Scheduled workflows run only on the default branch, and cron timing is
  best-effort — a `*/30` schedule can slip under load
- GitHub **disables scheduled workflows after 60 days without repository
  activity**. If the site stops updating, that is the first thing to check

---

## Local development

```bash
# scrapers (no credentials needed)
uv run --with httpx --with lxml python -m tools.vtcourses.timetable
uv run --with httpx --with lxml python -m tools.vtcourses.catalog
uv run --with httpx python -m tools.vtcourses.grades
uv run --with httpx python -m tools.vtcourses.rmp

# opt-in; no-ops without credentials
REDDIT_CLIENT_ID=... REDDIT_CLIENT_SECRET=... \
  uv run --with httpx python -m tools.vtcourses.reddit

# regenerate docs after editing data/courses.json
python -m tools.vtcourses.gendocs
python -m tools.vtcourses.gendocs --check   # what CI runs

# site
cd web && npm install && npm run dev        # http://localhost:3000
cd web && npm run build                     # static export to web/out
```

The site builds without `data/generated/` present — it just renders with no
section data and says so.

---

## Adding a subject beyond CS

Both scrapers take `--subject`. The curated layer is CS-only, so a second
subject would show live sections and catalog entries with no usefulness or
teaching scores attached. `data/courses.json` would need entries for it.
