# The professor lottery

[← back to index](../README.md)

**At Virginia Tech, which section you get matters more than which course you take.**

That is the single most actionable finding in this dataset. The same required course, taught the same
semester from the same syllabus, produces wildly different outcomes depending on who is at the front of the
room. Across the AY2019-22 grade data, the spread inside one course routinely reaches a full GPA point and
thirty percentage points of withdrawal rate.

---

## Spread inside a single course

Enrollment-weighted, AY2019-22. Only instructors with 40+ students in the window are shown.

| Course | Best | Worst | GPA gap | Withdrawal gap |
|---|---|---|---:|---:|
| [CS 2505](2000-level.md#cs-2505-computer-organization-i) | Tausif 3.78 (1% W) | Paul 2.63 (14% W) | **1.15** | 13 pts |
| [CS 3114](3000-level.md#cs-3114-data-structures-and-algorithms) | Edmison 3.72 (1% W) | Davis 2.62 · Sullivan 16% W | **1.10** | 15 pts |
| [CS 3304](3000-level.md#cs-3304-comparative-languages) | Gracanin 3.67 (4% W) | Gulzar 2.84 (15% W) | 0.83 | 11 pts |
| [CS 4824](4000-level.md#cs-4824-machine-learning) | Jin 3.20 (10% W) | Wyatt 2.43 (**23% W**) | 0.77 | 13 pts |
| [CS 1114](1000-level.md#cs-1114-introduction-to-software-design) | Kotut 3.04 (1% W) | Edwards 2.35 (**34% W**) | 0.69 | **33 pts** |
| [CS 4104](4000-level.md#cs-4104-data-and-algorithm-analysis) | Ji 3.45 (4% W) | Raghvendra 2.76 (4% W) | 0.69 | — |
| [CS 2114](2000-level.md#cs-2114-software-design-and-data-structures) | Farghally 3.50 (1% W) | Ellis 3.10 (5% W) | 0.40 | 4 pts |
| [CS 4264](4000-level.md#cs-4264-principles-of-computer-security) | Rahaman 3.85 (0% W) | Chung 3.45 (1% W) | 0.40 | 1 pt |
| [CS 3714](3000-level.md#cs-3714-mobile-software-development) | Esakia 3.72 | Balci 3.33 | 0.39 | — |
| [CS 2506](2000-level.md#cs-2506-computer-organization-ii) | Feng 2.86 (11% W) | Jian 2.52 · McQuain 17% W | 0.34 | 12 pts |
| [CS 3754](3000-level.md#cs-3754-cloud-software-development) | Esakia 3.68 (4% W) | Balci 3.34 (12% W) | 0.34 | 8 pts |
| [CS 3214](3000-level.md#cs-3214-computer-systems) | Williams 2.99 (3% W) | Hicks 2.78 (4% W) | 0.21 | 5 pts |

Two of these deserve note for the *opposite* reason. **CS 3214** and **CS 4264** have the tightest spreads in
the department — 0.21 and 0.40 GPA points respectively, with withdrawal rates clustered within a few points.
That consistency is itself evidence of a well-managed course, run as one course rather than as six
independent ones.

**CS 1114** is the extreme in the other direction: a 33-percentage-point withdrawal gap in a required
first-year course. One in three students in the worst-performing sections did not finish.

---

## Consistently praised, 2024–2026

Named where the recent RateMyProfessors record is both positive and substantial.

| Instructor | Courses | What students say |
|---|---|---|
| **Sally Hamouda** | 4604, 4104 | "Hands down the best prof at VT" — lecture content with lots of examples, lenient grading, consistently described as kind and available |
| **Sehrish Nizamani** | 4604, 2104 | Teaches SQL "clearly and makes sure we understand how to write queries properly, not just memorize them"; energetic, responsive, solicits feedback |
| **Mohammed Farghally** | 3114, 2114 | "By far the best professor I've had at VT"; good lecturer, generous leeway, best GPA and lowest withdrawal in both courses |
| **Dan Williams** | 3214 | "An incredible professor... made all the lecture material clear"; open to questions in a course where that matters |
| **David McPherson** | 1114, 2505, 3304 | Passionate and elaborative; "absolutely amazing... very engaging lectures" |
| **John Lewis** | 1064 | 4.22/5 across 88 ratings, 97% would take again — the strongest sustained record in the department |
| **Amun Kharel** | 3724 | "Always has engaging lectures and is passionate about what he teaches"; reasonable grader, flexible |
| **Tu Vu** | 4804 | Former DeepMind researcher; "extremely knowledgeable about all things AI/LLM and gives great lectures" |
| **Daniel Dunlap** | 3604 | Chill, engaging, visibly invested — though students note the course itself asks little of them |
| **Saad Nizamani** | 3704 | "Fair, great attitude, and always ready to help" |
| **D. Scott McCrickard** | 3724 | 3.91 GPA with zero withdrawals across 175 students |
| **Danfeng Yao** | 4264 | 3.82 GPA, 0% withdrawal |
| **Onyeka Emebo** | 2114 | Strong 2026 reviews |

---

## Consistently criticized, 2024–2026

These are patterns across multiple independent reviews in the recent window, not isolated complaints. They
describe teaching as students experienced it; they are not statements about anyone as a person.

| Instructor | Courses | Recurring theme |
|---|---|---|
| **Osman Balci** | 3714, 3754, 3704 | Six consecutive 1/5 ratings through 2026. Outdated content, unhelpful office hours, vague and contradictory direction, and repeated accounts of students being ridiculed for asking questions. Dissenting reviews describe him as blunt but knowledgeable |
| **Adrian Sandu** | 4104 | Three separate one-star reviews in early 2026: reads slides in monotone, never works an example problem, few resources beyond the textbook |
| **Denis Gracanin** | 3304, 3704 | "The most dysfunctional class I have ever taken at Virginia Tech"; vague project specifications, memorization-based exams. Note he simultaneously has the *highest* GPA in CS 3304 |
| **Yang Cao** | 3114 | A Spring 2025 section reported as going from 150 students to 40 before the drop deadline |
| **T.M. Murali** | 4104 | 2024 reviews alleging students were ridiculed and humiliated in class |
| **Stephen Edwards** | 1114 | Historically a 34% withdrawal rate across 267 students — the highest in the dataset |

---

## The uncomfortable pattern

**Grade generosity and teaching quality are close to uncorrelated at Virginia Tech.**

- **Denis Gracanin** holds the highest GPA in CS 3304 (3.67) and some of the worst reviews in the department.
- **Osman Balci** hands out easy As in CS 3754 while students describe the course as "mostly worthless."
- **CS 3604** posts a 3.79 GPA, perfect instructor ratings, and students who openly say they learned nothing.
- **CS 3214** posts a 2.92 GPA and is the best-run course in the major.
- **CS 4104** has perfectly respectable grades (3.09) and the worst teaching reviews on record.

Use GPA data to predict your grade. Use ratings and withdrawal rates to predict your education. They answer
different questions.

---

## How to use this

1. **Before registering, check the timetable for the instructor**, then check that name here and against RateMyProfessors directly for anything newer than August 2026.
2. **Weight withdrawal rate over GPA.** A high withdrawal rate means students committed enough to enroll decided mid-semester that finishing was not worth it. That is a stronger signal than a grade distribution, which is partly a policy choice.
3. **Prefer courses with tight instructor spreads.** CS 3214 and CS 4264 are safe registrations regardless of section. CS 1114, CS 3114, and CS 2505 are not.
4. **A single bad review is noise.** Six consecutive ones across two years are not. Every claim here rests on a repeated pattern or a hard number.

---

## Data note

Instructor-level grade figures come from VT's published grade distributions, AY2019-22, enrollment-weighted.
Quotes come from public RateMyProfessors reviews dated 2022–2026; the full pull was 829 ratings across all
109 VT CS faculty.

RateMyProfessors is self-selected — people with strong feelings are likelier to post — so it overstates
extremes in both directions. It is used here to identify *patterns*, never to rank instructors on a single
review. Two reviews of one CS 3724 instructor were excluded as personal insults rather than teaching
feedback.

Names appear because the instructor is the most actionable variable in the entire dataset — omitting them
would make the guide considerably less useful and no more fair.

[← back to index](../README.md) · [methodology](methodology.md)
