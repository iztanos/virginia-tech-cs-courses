# Methodology

[← back to index](../README.md)

How the numbers in this guide were produced, what they can and cannot support, and how to reproduce or
extend them.

---

## Sources

| Signal | Source | Coverage | What it measures |
|---|---|---|---|
| **Grade / attrition** | VT Institutional Research grade distributions — 26,633 section-rows, of which 627 are CS | AY 2019-20 → 2021-22 | Enrollment-weighted mean GPA, withdrawal %, per course **and per instructor** |
| **Teaching quality** | RateMyProfessors GraphQL API — all 109 VT CS faculty, 829 individual ratings | ~2004 → **Aug 2026** | (clarity + helpfulness) / 2, difficulty, would-take-again, free-text comments |
| **Curriculum** | `catalog.vt.edu`, 2026-27 catalog | Current | Titles, credits, descriptions, prerequisites, theory and capstone sets |
| **Offering cadence** | `students.cs.vt.edu` course-offerings page | Current | Which terms each course actually runs |
| **Usefulness scores** | Editorial judgment | — | Career payoff, interview relevance, what the course unlocks |

The grade distribution extract is the public dataset mirrored at
[`github.com/jrudman25/CourseSearch`](https://github.com/jrudman25/CourseSearch). VT's own
[University DataCommons](https://udc.vt.edu/irdata/data/courses/grades) hosts the authoritative version but
requires a VT PID to access.

---

## Caveats — read these before quoting any number

**1. The grade data ends in Spring 2022.** It covers three academic years, two of which were affected by
COVID-era instruction and grading policy. Trends are directionally sound; individual GPA values are stale.
Anything that changed after Spring 2022 — new instructors, redesigned courses, the Fall 2025 capstone gate —
is not reflected in the grade columns.

**2. RateMyProfessors measures professors, not courses.** A course's aggregate rating is a referendum on
whoever happened to teach the sections that got reviewed. CS 4104 shows a 1.00/5 across five ratings — all
five describe two specific instructors. That is a real and useful signal about those sections. It is not a
verdict on algorithm analysis as a subject.

**3. RateMyProfessors is self-selected.** People with strong feelings post; the satisfied middle mostly does
not. Expect both tails to be overstated. Ratings are used here to identify repeated patterns, never to rank
on a single review.

**4. Small enrollments produce meaningless percentages.** CS 4204 shows one withdrawal out of ten students —
reporting that as "16.7%" would be misleading, so it isn't. CS 4414 has five students in the entire window.
Enrollment counts appear in every table so you can discount accordingly; anything under about 40 students
should be read as indicative only.

**5. Low GPA does not mean badly taught.** This is the most common misreading of grade data. CS 3214 has one
of the lowest GPAs in the major and is the best-run course in the department — the tell is its 4.4%
withdrawal rate in the hardest course students take. Conversely CS 3604 posts a 3.79 GPA with perfect
instructor ratings, and students say plainly that they learned nothing. See
[professors.md](professors.md#the-uncomfortable-pattern).

**6. Recently introduced courses have no history.** CS 2144, 3314, 3804, 4014, 4094, 4134, 4144, and 4274
postdate the grade extract. They are scored on content and curriculum role alone, and labeled as such.

---

## Scoring

**Usefulness (out of 10)** is career payoff, not intellectual merit. It weighs how often the skill gets used
in industry, how much downstream coursework the class unlocks, and interview relevance. CS 4134 Quantum
Computation is genuinely fascinating and scores a 3, because almost no graduating senior will use it within
five years. Required courses are scored on what they unlock, not on whether you have a choice about taking
them.

Where a course is valuable only within a specific path — CS 3274 for security, CS 4224 for systems — the
guide gives both numbers rather than averaging them into something misleading.

**Teaching (letter grade)** blends RateMyProfessors quality and would-take-again, withdrawal rate, the size
of the spread between instructors, and recurring themes in free-text comments. A course where every section
is adequate scores higher than one with a great instructor and a disastrous one at the same mean — because
you cannot reliably get the good section.

"n/d" means insufficient data. It is not a neutral score; it means unknown.

---

## Catalog discrepancies

The department's course-offerings page and the official catalog disagree in several places. **The catalog
governs, but verify against the live timetable before registering.**

| Discrepancy | Detail |
|---|---|
| **CS 4101 vs CS 4014** | The offerings page lists "CS 4101 Algorithm and Society." The catalog number is **CS 4014, Algorithms & Society**. Same course |
| **CS 4214 Simulation and Modeling** | Appears on the offerings page; **no entry in the current catalog**. Almost certainly retired |
| **CS 4570 Wireless Networks and Mobile Systems** | Same — listed on the offerings page, absent from the catalog |
| **CS 2704** | Present in the catalog as a stub with contact hours but no title or description. A dead course number |
| **CS 3984 "Entrepreneurship in Computer Science"** | A Special Study topic, not a standing course. Availability varies by term |
| **CS 3704 title** | Catalog reads "Intermediate Software Design and Engineering"; some department pages shorten it to "Intermediate Software Design" |

---

## What could not be obtained

- **Reddit** (r/VirginiaTech): blocked at the network layer for both automated fetching and direct requests. **No student-forum sentiment appears anywhere in this guide.** This is the largest gap — Reddit is where the most candid course discussion happens.
- **Coursicle** course-level review aggregates: rate-limited (HTTP 429) on every attempt.
- **VT SPOT** (Student Perceptions of Teaching), the official course evaluations: require a VT PID. These would be a materially better teaching-quality signal than RateMyProfessors if anyone with access wants to contribute an analysis.
- **University DataCommons** grade dashboard: requires a VT PID. The AY2019-22 public export is the most recent snapshot available without one.
- **Forward-looking instructor assignments**: not published far enough ahead to name who will teach what next year. Always check the timetable.

---

## Reproducing the data

**Grade distributions**

```bash
curl -sL -o vtgrades.csv \
  "https://raw.githubusercontent.com/jrudman25/CourseSearch/HEAD/Grade%20Distribution.csv"
```

Columns: `Academic Year, Term, Subject, Course No., Course Title, Instructor, GPA, A (%) … F (%),
Withdraws, Graded Enrollment, CRN, Credits`. Filter `Subject == "CS"`, then weight GPA by
`Graded Enrollment` and compute withdrawal as `Withdraws / (Withdraws + Graded Enrollment)`.

**RateMyProfessors**

The public GraphQL endpoint is `https://www.ratemyprofessors.com/graphql` with a static
`Authorization: Basic dGVzdDp0ZXN0` header. Virginia Tech's school ID is `U2Nob29sLTEzNDk=`.

Query `newSearch.teachers` with that `schoolID` to enumerate faculty (filter
`department == "Computer Science"`), then for each teacher node query `ratings` to get per-rating `class`,
`clarityRating`, `helpfulRating`, `difficultyRating`, `wouldTakeAgain`, `comment`, and `date`. Both
connections paginate via `pageInfo.endCursor`.

Course-level aggregates come from bucketing ratings by the four-digit number parsed out of the `class` field.

**Catalog**

```bash
curl -sL --compressed \
  -A "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/126 Safari/537.36" \
  "https://catalog.vt.edu/course-descriptions/cs/"
```

⚠️ `catalog.vt.edu` returns **HTTP 202 with an empty body** to default clients. A browser User-Agent is
required. The same applies to the degree-requirements page at
`catalog.vt.edu/undergraduate/college-engineering/computer-science/computer-science-bs/`.

---

## Contributing

The highest-value contribution by a wide margin is **a more recent grade extract**. Anyone with VT PID access
to University DataCommons can pull AY2022-23 onward, which would refresh every GPA and withdrawal figure in
this guide.

Also valuable:

- **SPOT evaluation data**, which measures teaching directly rather than through the RateMyProfessors selection filter
- **Course-level corrections** from students who have recently taken a course, especially the ones currently marked "n/d"
- **New-course data** for CS 2144, 3314, 3804, 4014, 4094, 4134, 4144, 4274

Open an issue or a pull request. Please include the source and date range for any numbers you add — every
figure in this guide is traceable to one of the sources above, and that should stay true.

[← back to index](../README.md) · [professors](professors.md) · [tracks](tracks.md)
