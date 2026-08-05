# 4000-level courses

[← back to index](../README.md) · [1000](1000-level.md) · [2000](2000-level.md) · [3000](3000-level.md)

Thirty-seven entries — every elective, both required 4000-level slots (theory elective and capstone), and
the independent-study vehicles. Grouped by area; the master table in the [README](../README.md) links
directly to each.

**Jump to:** [Theory electives](#theory-electives) · [Databases](#databases) ·
[Systems, networks, architecture](#systems-networks-architecture) ·
[Security](#security) · [AI and data](#ai-and-data) · [Ethics and information](#ethics-and-information) ·
[Capstones](#capstones) · [Seminar, special topics, independent work](#seminar-special-topics-and-independent-work)

---

## Theory electives

You must take exactly one of CS 4104, 4114, 4124, or 4134 (or graduate CS 5104 / 5114). They are not
equivalent in difficulty or value.

### CS 4104: Data and Algorithm Analysis

**3 credits · Fall, Spring, Summer · THEORY ELECTIVE**
**Prerequisites:** CS 3114 (C or better) and (MATH 3034 or MATH 3134)

| Avg GPA | Withdraw | Enrolled | RMP quality | RMP difficulty |
|---:|---:|---:|---|---:|
| 3.09 | 3.5% | 642 | **1.00 (n=5)** | 5.00 |

Data structures and algorithms from an analytical perspective: theoretical analysis of efficiency, comparing
algorithms on space and run-time, analytical methods for theoretical and practical performance bounds, and
constraints affecting problem solvability.

**The most useful theory elective and the worst-reviewed course in the department.** The subject matter is
what employers mean when they say "algorithms," and it is the natural continuation of CS 3114.

The teaching is the problem, and the reviews name names. **Adrian Sandu** drew three separate one-star
reviews in early 2026 — reads slides in monotone, never works an example problem, has "not ONCE solved a word
problem (the kinds of problems on tests and homeworks)." **T.M. Murali** drew 2024 reviews alleging he
ridiculed and humiliated students in class.

| Instructor | GPA | Withdraw | n |
|---|---:|---:|---:|
| Ji | 3.45 | 4% | 122 |
| Heath | 3.32 | 1% | 76 |
| Sandu | 3.26 | 0% | 83 |
| Hamouda | 3.19 | 0% | 74 |
| Murali | 2.80 | 7% | 115 |
| Raghvendra | 2.76 | 4% | 133 |

Note that the grades are *fine*. This is the clearest case in the dataset of GPA completely failing to
capture the experience — the five RMP ratings all describe the same two instructors, so treat the 1.00 as a
verdict on specific sections, not on the subject.

> **Usefulness 8/10 · Teaching D · Take it, but check the roster first**

---

### CS 4114: Introduction to Formal Languages and Automata Theory

**3 credits · Fall, Spring · THEORY ELECTIVE**
**Prerequisites:** MATH 3134 or MATH 3034 — note there is **no CS prerequisite**

| Avg GPA | Withdraw | Enrolled |
|---:|---:|---:|
| 3.27 | **0.3%** | 299 |

Formal languages and the correspondence between language classes and the automata that recognize them:
formal definitions of grammars and acceptors, deterministic and nondeterministic systems, grammar ambiguity,
finite state and pushdown automata, and normal forms.

**The path of least resistance for the theory requirement.** A 0.3% withdrawal rate across 299 students is
essentially nobody. Modest direct career value, but solid grounding if you later take compilers.

> **Usefulness 4/10 · Teaching B**

---

### CS 4124: Theory of Computation

**3 credits · THEORY ELECTIVE**
**Prerequisites:** MATH 3134 or MATH 3034

| Avg GPA | Withdraw | Enrolled |
|---:|---:|---:|
| **2.22** | 9.3% | 49 |

Theoretical analysis of the computational process: abstract programs, classes of computational machines and
their equivalence, recursive function theory, unsolvable problems, Church's thesis, Kleene's theorem, program
equivalence, generability, acceptability, decidability.

**The lowest GPA of any CS course in the dataset**, across three sections. Maximum difficulty, minimum
industry return.

Choose this only if you are heading toward a theory PhD and want the signal on your transcript.

> **Usefulness 3/10 · Teaching D**

---

### CS 4134: Quantum Computation and Information Processing

**3 credits · Fall, Spring · THEORY ELECTIVE**
**Prerequisites:** see catalog

No grade or rating data — recently introduced.

Quantum states and phenomena; quantum communication concepts including superdense coding and teleportation;
classical and quantum circuits and gate sets; quantum algorithms compared to classical ones; quantum
computational complexity classes; density operators, measurements, quantum channels; error correction and the
stabilizer formalism.

Intellectually the most interesting theory option and the one with the least near-term payoff. It counts as
your theory elective, which makes it a legitimate choice if the subject genuinely grabs you — the
opportunity cost is CS 4104, not a free slot.

> **Usefulness 3/10 · Teaching n/d**

---

## Databases

### CS 4604: Introduction to Database Management Systems

**3 credits · Fall, Spring, Summer**
**Prerequisites:** CS 3114 (C or better), senior standing

| Avg GPA | Withdraw | Enrolled | RMP quality | RMP difficulty | Would take again |
|---:|---:|---:|---|---:|---:|
| 3.42 | **0.6%** | 173 | **5.00 (n=9)** | 2.00 | 100% |

Basic database models and their corresponding logical and physical data structures; comparison of models;
logical data design and database usage; relationships, implementation, data integrity, performance
considerations, applications.

**The best usefulness-to-pain ratio in the entire catalog.** SQL, relational modeling, normalization,
indexing, and transactions — skills you will use in your first week at almost any software job — taught by
instructors students rate perfectly. A 0.6% withdrawal rate and a perfect 5.00 across nine ratings is a
combination nothing else in the department matches.

| Instructor | GPA | Withdraw | n |
|---|---:|---:|---:|
| Hamouda | 3.59 | 1% | 79 |
| Chen | 3.18 | 0% | 69 |

**Sally Hamouda** — "hands down the best prof at VT... very lenient grader as well, it takes a royal screwup
to get a bad grade." **Sehrish Nizamani** draws five separate 5/5 reviews across 2025-26, singled out for
teaching SQL properly: "she teaches SQL very clearly and makes sure we understand how to write queries
properly, not just memorize them. She also explains things like data modeling and normalization in a simple
way."

Note the senior-standing requirement — you cannot front-load this one, which is a genuine shame given how
much of the rest of the degree it would make more concrete.

> **Usefulness 9/10 · Teaching A · Non-negotiable if you want a software job**

---

## Systems, networks, architecture

### CS 4224: Linux Kernel Programming

**3 credits · Spring only**
**Prerequisites:** see catalog — CS 3214 expected

| Avg GPA | Withdraw | Enrolled |
|---:|---:|---:|
| 3.18 | **0.0%** | 32 |

Design and internal organization of the Linux kernel: kernel subsystems, boot process, memory management,
process and thread model, scheduling, interrupt and exception handling, the virtual file system and concrete
file systems, block I/O and the I/O scheduler, the network stack, device drivers. You modify existing kernel
code and design, implement, test, and evaluate new kernel modules, with kernel and full-stack debugging
throughout.

**The best-kept secret in the catalog.** Zero withdrawals across the sample window. Nothing else available to
an undergraduate signals systems competence this loudly, and the debugging skills transfer everywhere.

> **Usefulness 8/10 for systems and infrastructure, 4/10 otherwise · Teaching A−**

---

### CS 4234: Parallel Computation

**3 credits · Fall, Spring**
**Prerequisites:** CS 3214 (C or better)

| Avg GPA | Withdraw | Enrolled |
|---:|---:|---:|
| 3.48 | 2.9% | 33 |

Parallel computer architectures, models of parallel computation, interconnection networks, parallel algorithm
development and analysis, programming paradigms and languages for parallel computation, performance
measurement and evaluation.

The natural follow-on to CS 3214, and increasingly relevant given where hardware is heading.

> **Usefulness 6/10 · Teaching n/d**

---

### CS 4254: Computer Network Architecture and Programming

**3 credits · Fall, Spring**
**Prerequisites:** see catalog — CS 3214 expected

| Avg GPA | Withdraw | Enrolled |
|---:|---:|---:|
| 3.32 | 1.2% | 85 |

Computer network architecture and programming network services: DNS, email and MIME, HTTP, SNMP, multimedia;
wired, wireless, and satellite architectures; the OSI model with emphasis on upper layers; congestion
control, quality of service, routing; the Internet protocol suite (IP, TCP, ARP, RARP); server design,
connectionless and concurrent.

Fills the single biggest gap CS 3214 leaves. Low withdrawal, reasonable grades, and directly applicable to
backend and infrastructure work.

> **Usefulness 8/10 · Teaching B (thin data)**

---

### CS 4304: Compiler Design and Implementation

**3 credits · offered sporadically — check the timetable early**
**Prerequisites:** CS 3214 (C or better)

No recent grade data.

Theory, design, and implementation of a large language translator system: lexical analysis, syntactic
analysis, code generation, and optimization. You build a full translator.

One of the two or three courses that permanently changes how you read code. It does not run every year, so
plan around it rather than assuming availability.

> **Usefulness 7/10 · Teaching n/d**

---

### CS 4504: Computer Organization III

**3 credits · Spring**
**Prerequisites:** ECE 2500 or CS 3214 or ECE 3504 (C or better)

| Avg GPA | Withdraw | Enrolled |
|---:|---:|---:|
| **2.60** | 10.5% | 17 |

Structure, elements, and analysis of modern enterprise computers: performance evaluation of commercial
computing, past and emerging technology trends, the impact of parallelism at multiple levels of architecture,
memory and storage, Amdahl's Law, Flynn's Taxonomy.

The lowest GPA at the 4000 level — but on only 17 students across two sections, so treat that as indicative
rather than settled. Worthwhile if you are heading toward hardware or architecture; largely redundant after
CS 2505, 2506, and 3214 otherwise.

> **Usefulness 5/10 · Teaching n/d**

---

### CS 4414: Issues in Scientific Computing

**3 credits · Fall, Spring**
**Prerequisites:** differential equations, MATH 3214, and a programming course

| Avg GPA | Withdraw | Enrolled |
|---:|---:|---:|
| 3.80 | 0.0% | 5 |

Theory and techniques of modern computational mathematics: computing environments, computational linear
algebra, optimization, approximation, parameter identification, finite difference and finite element methods,
symbolic computation. Project-oriented, modeling physical systems with production software.

Highly domain-specific. Five students in the sample window — the numbers mean almost nothing.

> **Usefulness 4/10 · Teaching n/d**

---

## Security

### CS 4264: Principles of Computer Security

**3 credits**
**Prerequisites:** CS 3214 (C or better) or ECE equivalent · corequisite for CS 4274

| Avg GPA | Withdraw | Enrolled |
|---:|---:|---:|
| 3.60 | 1.1% | 350 |

Survey of computer security design principles and models for software systems: cryptographic models and
methods; modern techniques for robust operating systems, software, web applications, large-scale networks,
and data protection; privacy models and techniques; contemporary computer and network security examples.

| Instructor | GPA | Withdraw | n |
|---|---:|---:|---:|
| Rahaman | 3.85 | 0% | 42 |
| Yao | 3.82 | 0% | 63 |
| Hicks | 3.55 | 2% | 108 |
| Chung | 3.45 | 1% | 137 |

**No bad option on the instructor bench** — the tightest spread of any elective in the department, which is
itself a signal about how the course is run. High value even if you never work in security; the
threat-modeling instinct transfers to all engineering.

> **Usefulness 8/10 · Teaching B+**

---

### CS 4164: Future of Security

**3 credits · Fall, Spring**
**Prerequisites:** see catalog

| Avg GPA | Withdraw | Enrolled |
|---:|---:|---:|
| 3.67 | 0.0% | 19 |

Identification and analysis of complex real-world security problems and threats to people, organizations, and
nations across domains, roles, and future scenarios: crisis communication, decision-making tools, ethical
principles, and problem-solving methods before, during, and after conflicts, disasters, and attacks. Uses an
experiential learning facility.

Scenario- and policy-oriented rather than technical. Part of the Secure Computing major. Very light.

> **Usefulness 3/10 · Teaching n/d**

See also [CS 3274 Software Reverse Engineering](3000-level.md#cs-3274-software-reverse-engineering) — the
most technically demanding security course available, and the highest withdrawal rate in the dataset.

---

## AI and data

### CS 4804: Introduction to Artificial Intelligence

**3 credits · Fall, Spring**
**Prerequisites:** CS 3114 (C or better), senior standing

| Avg GPA | Withdraw | Enrolled | RMP |
|---:|---:|---:|---|
| 3.44 | 0.9% | 115 | 5.00 (n=3, thin) |

Problem solving, game playing, and computer vision: search trees and graphs, game trees, block world vision,
syntactic pattern recognition, object matching, natural language, robotics.

Classical AI. The catalog description reads dated, but search, adversarial search, and constraint reasoning
are durable material. **Tu Vu**, formerly of DeepMind, draws a strong 2026 review: "extremely knowledgeable
about all things AI/LLM and gives great lectures... prioritizes learning over assignments."

> **Usefulness 6/10 · Teaching A (thin data)**

---

### CS 4824: Machine Learning

**3 credits · Fall, Spring**
**Prerequisites:** CS 3114 and a statistics course

| Avg GPA | Withdraw | Enrolled |
|---:|---:|---:|
| **2.89** | 10.8% | 265 |

Algorithms and principles of machine learning, focused on perception problems in computer vision, natural
language processing, and robotics: representing uncertainty, learning from data, supervised learning,
ensemble methods, unsupervised learning, structured models, learning theory, reinforcement learning. Includes
a technical project on real-world datasets.

**The rigorous ML option** — actual mathematics and actual model implementation, not library calls. The
hardest of the AI-family electives by a wide margin, with the third-lowest GPA at the 4000 level and a
double-digit withdrawal rate.

| Instructor | GPA | Withdraw | n |
|---|---:|---:|---:|
| Jin | 3.20 | 10% | 62 |
| Huang | 3.18 | 7% | 53 |
| Hilal | 2.66 | 2% | 54 |
| Wyatt | 2.43 | **23%** | 57 |

> **Usefulness 8/10 · Teaching C+ · Take this over CS 3804 if ML is the career rather than the tool**

---

### CS 4654: Intermediate Data Analytics and Machine Learning

**3 credits · Fall, Spring**
**Prerequisites:** (STAT/CMDA/CS 3654) and a statistics course

| Avg GPA | Withdraw | Enrolled |
|---:|---:|---:|
| 3.66 | 0.0% | 10 |

Supervised and unsupervised learning strategies: regression, generalized linear models, regularization,
dimension reduction, tree-based classification methods, clustering, advanced naive Bayes, neural networks.

The practitioner's counterpart to CS 4824 — methods applied rather than derived. Good paired with it, weak as
a substitute for it.

> **Usefulness 6/10 · Teaching n/d**

---

### CS 4204: Computer Graphics

**3 credits**
**Prerequisites:** CS 3114 and MATH 2114

| Avg GPA | Withdraw | Enrolled |
|---:|---:|---:|
| 3.41 | 1 of 10 students | 10 |

Hardware and software techniques for displaying graphical information: 2D and 3D geometry and
transformations, clipping and windowing, software systems, interactive graphics, shading, hidden surface
elimination, perspective depth, modeling and realism.

The real graphics course, as opposed to CS 3744. Strong if you are heading toward games, simulation,
visualization, or rendering. The sample is ten students, so the numbers carry no weight.

> **Usefulness 5/10 generally, 9/10 for graphics careers · Teaching n/d**

---

### CS 4144: Competitive Problem Solving II

**3 credits**
**Prerequisites:** CS 2114 and the CS 2144 lineage

No data — recently introduced.

Advanced algorithms, data structures, and implementation techniques through judged competitive programming:
advanced searching and graph algorithms, advanced dynamic programming, linear programming techniques,
computational geometry, numerical algorithms, plus optimization for efficiency.

The continuation of [CS 2144](2000-level.md#cs-2144-competitive-problem-solving-i), and the same verdict:
unusually direct technical-interview and ICPC preparation, for credit.

> **Usefulness 6/10 generally, 8/10 for interview preparation · Teaching n/d**

---

## Ethics and information

### CS 4014: Algorithms & Society

**3 credits · Fall, Spring · Pathways 3 + 11**
**Prerequisites:** junior standing

No data — recently introduced.

Social perspectives on algorithms and their implications for class, gender, race, ethnicity, geography, and
disability status; critical thinking about the impacts of computing and the role of social values in design;
machine learning, privacy, and the sociotechnical infrastructure surrounding algorithms.

⚠️ The department's course-offerings page lists this as **"CS 4101 Algorithm and Society."** The catalog
number is **CS 4014**. Verify against the timetable before registering.

Genuinely worthwhile material with minimal technical content — and you already have CS 3604 covering adjacent
ground as a core requirement.

> **Usefulness 3/10 · Teaching n/d**

---

### CS 4624: Multimedia, Hypertext and Information Access

**3 credits · CAPSTONE-ELIGIBLE**
**Prerequisites:** see catalog

| Avg GPA | Withdraw | Enrolled |
|---:|---:|---:|
| 3.43 | 0.4% | 244 |

Architectures, concepts, data, hardware, methods, models, software, standards, structures, and technologies
for networked multimedia information systems, hypertext and hypermedia, videoconferencing, authoring and
electronic publishing, and information access — capture, representation, linking, storage, compression,
browsing, search, retrieval.

A soft capstone with a dated framing. Low risk, low technical return — but it *does* satisfy the capstone
requirement, which is worth something if your schedule is tight.

> **Usefulness 3/10 · Teaching n/d**

---

### CS 4634: Design of Information

**3 credits · CAPSTONE-ELIGIBLE**
**Prerequisites:** CS 3114 and CS 3724 (C or better)

| Avg GPA | Withdraw | Enrolled |
|---:|---:|---:|
| 3.32 | **0.0%** | 45 |

The higher-order properties that turn data into information: analysis of user needs, user comprehension and
local semantics, design of information organization, and design of information display appropriate to use and
setting.

Same category as CS 4624 — an easy capstone, light on engineering.

> **Usefulness 3/10 · Teaching n/d**

---

## Capstones

You need exactly one 4000-level capstone. As of Fall 2025, enrolling requires passing grades in **CS 2506 and
CS 3114**. Choose by what you want to talk about in interviews.

### CS 4094: Computer Science Capstone

**3 credits · Fall, Spring, Summer**
**Prerequisites:** CS 2506 and CS 3114

No data — recently introduced.

Senior capstone integrating prior coursework: team-based approach to open-ended real-world problems covering
problem formulation, requirements definition, design, and implementation, with written and oral presentation
of results.

The generic default, and the most widely available option.

> **Usefulness 7/10 · Teaching n/d**

---

### CS 4284: Systems & Networking Capstone

**3 credits**
**Prerequisites:** CS 3114 and CS 3214 (C or better)

| Avg GPA | Withdraw | Enrolled |
|---:|---:|---:|
| 3.76 | 0.7% | 145 |

Advanced topics in computer systems and networking: distributed and parallel processing, emerging
architectures, novel systems management and networking design, fault tolerance, robust and secure data
management. Team-based, open-ended, with design and documentation of advanced systems.

**The best capstone if you took CS 3214 and liked it.** The most technically substantial of the set.

> **Usefulness 8/10 · Teaching B+**

---

### CS 4704: Software Engineering Capstone

**3 credits**
**Prerequisites:** CS 3704 (C or better), or CS 3714 or CS 3754

| Avg GPA | Withdraw | Enrolled |
|---:|---:|---:|
| 3.85 | 0.3% | 384 |

Senior project integrating software engineering knowledge: team-based problem formulation, requirements
engineering, architecture, design, implementation, integration, documentation, and delivery of a system that
solves a real-world problem.

The largest and most conventional capstone, and the highest GPA of the set. Good portfolio material, low
risk.

> **Usefulness 7/10 · Teaching B+**

---

### CS 4274: Secure Computing Capstone

**3 credits · Fall, Spring**
**Prerequisites:** CS 3114 and CS 3214 · **corequisite CS 4264**

| Avg GPA | Withdraw | Enrolled |
|---:|---:|---:|
| 3.62 | 0.0% | 17 |

Advanced cybersecurity and secure computing: threat modeling through identification and analysis of security
threats; reasoning about the efficacy, complexity, cost, and ethical tradeoffs of security systems;
team-based work on open-ended security problems.

Note the **corequisite** — you take this alongside CS 4264, not after it. That trips up schedules regularly.

> **Usefulness 7/10 for security careers · Teaching n/d**

---

### CS 4664: Data-Centric Computing Capstone

**3 credits · Fall, Spring · usually restricted to Data-Centric Computing majors**
**Prerequisites:** CS 3114 plus data coursework

| Avg GPA | Withdraw | Enrolled | RMP |
|---:|---:|---:|---|
| 3.77 | 0.0% | 18 | 3.75 (n=4, thin) |

Project-based course on deriving insights from real-world data: team-based end-to-end projects spanning the
full data science workflow — problem statement, research questions, collection, preparation and cleaning,
iterative analysis and interpretation, synthesis into a written report and an interactive executable
codebase.

Check eligibility before planning around it.

> **Usefulness 7/10 · Teaching B**

---

### CS 4784: Human-Computer Interaction Capstone

**3 credits · Fall, Spring · usually restricted to CS majors with the HCI minor**
**Prerequisites:** CS 3724 (C or better), senior standing

| Avg GPA | Withdraw | Enrolled |
|---:|---:|---:|
| 3.76 | 0.0% | 118 |

Team-based, end-to-end, integrative interface design project drawn from departmental expertise: virtual and
augmented reality, embodied cognition, visualization, semiotic engineering, game design, personal information
management, mobile computing, design tools, educational technology, digital democracy.

> **Usefulness 5/10 generally, 8/10 for product or design careers · Teaching n/d**

---

### CS 4644: Creative Computing Studio

**3 credits · CAPSTONE-ELIGIBLE**
**Prerequisites:** CS 3724 (C or better)

| Avg GPA | Withdraw | Enrolled |
|---:|---:|---:|
| 3.75 | 1.1% | 91 |

Capstone at the intersection of arts and technology: intensive immersion in game design, interactive art,
digital music, and immersive virtual reality, with teams conducting an end-to-end integrative design project.

Genuinely fun, low rigor. A legitimate choice if you have a specific portfolio piece in mind.

> **Usefulness 4/10 · Teaching n/d**

---

### CS 4884: Computational Biology and Bioinformatics Capstone

**3 credits**
**Prerequisites:** CS 3824 lineage

| Avg GPA | Withdraw | Enrolled |
|---:|---:|---:|
| 3.39 | 2.8% | 35 |

Team-based work on open-ended problems in computational biology and bioinformatics: algorithms for CBB,
computational models for biological systems, structure-function analysis of biomolecules, genomic data
analysis and mining, computational genomics, systems biology.

> **Usefulness 4/10 generally, 9/10 for biotech or health tech · Teaching n/d**

---

### CS 4774: Human-Computer Interaction Design Experience

**3 credits · Fall, Spring · HCI minors only**
**Prerequisites:** CS 3724 and (HIST/SOC/STS 2604) and COMM 2084

**Explicitly not for CS major credit.** Listed here only so it isn't confused with CS 4784, which is the
capstone-eligible version.

---

## Seminar, special topics, and independent work

### CS 4944: Seminar

**1 credit · Fall · REQUIRED**
**Prerequisites:** CS 3604

One credit, senior year. An administrative requirement.

> **Usefulness 1/10 · Teaching n/d**

---

### CS 4894: Special Topics in Computer Science

**3 credits · repeatable twice, max 9 credits**
**Prerequisites:** CS 2114 and CS 2505

Advanced undergraduate topics in the design, development, use, and impact of CS solutions or software
systems. Named examples in the catalog: blockchain systems, DevOps, new programming languages, social media
software, software as a service, micro-services, end-user programming systems.

**Frequently the most current material in the department** — this is where DevOps and microservices content
actually lives, and neither has a standing course. Check what is running each term; quality tracks the
instructor rather than the course number.

> **Usefulness variable, up to 8/10 for a well-run DevOps or microservices section · Teaching n/d**

---

### CS 4974: Independent Study

**1–19 credits, variable**

| Avg GPA | Withdraw | Enrolled |
|---:|---:|---:|
| 3.89 | 0.0% | 15 |

Worth real consideration if there is a specific faculty member whose work interests you. The ratio of
learning to bureaucracy is excellent, and it is the one course you can shape entirely.

> **Usefulness 7/10, entirely dependent on the advisor · Teaching n/d**

---

### CS 4984: Special Study

**1–19 credits, variable**

| Avg GPA | Withdraw | Enrolled |
|---:|---:|---:|
| 3.70 | 1.8% | 107 |

Has historically carried "Machine Learning Capstone" among other topics. Value is entirely
topic-dependent.

> **Usefulness variable · Teaching n/d**

---

### CS 4994: Undergraduate Research

**1–19 credits, variable**

| Avg GPA | Withdraw | Enrolled |
|---:|---:|---:|
| 4.00 | 0.0% | 12 |

**The highest-leverage credits available to an undergraduate** if you are considering graduate school, and
strong signal for industry research roles.

Approach faculty in your junior year, not your senior spring. The students who get the most out of this
started the conversation a year before they enrolled.

> **Usefulness 8/10 if graduate-school-bound, 4/10 otherwise · Teaching n/d**

---

### CS 4954 / 4964: Study Abroad and Field Study

**1–19 credits, variable**

Administrative vehicles for credit earned outside the standard course structure.

---

[← 3000-level](3000-level.md) · [back to index](../README.md) · see also
[professors](professors.md) and [tracks](tracks.md)
