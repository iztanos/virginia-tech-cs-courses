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
    sections.json        live timetable              scraped, every 30 min
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
| Curated | `data/courses.json` | on commit | Usefulness /10, teaching grade, GPA, withdrawal %, RMP, per-instructor spread, prose |
| Sections | Banner Timetable of Classes | every 30 min | CRN, schedule type, modality, credits, capacity, meeting times, location, exam, open/full |
| Catalog | `catalog.vt.edu` | weekly | Official title, credits, description, prerequisites, corequisites, cross-listings, Pathways |

All three join on the four-digit course number.

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

---

## Automation

| Workflow | Trigger | Does |
|---|---|---|
| `scrape.yml` | `*/30 * * * *`, plus Mondays for the catalog | Scrapes, commits `data/generated/` only if something changed, then calls the deploy workflow |
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
