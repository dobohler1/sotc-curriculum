# SOTC — Context Document

## Overview
This file contains reference materials, platform details, curriculum inventory, and observations across all SOTC programs. For event-specific details, see the individual spec files. For governing design rules, see `intent.md`.

---

## Programs

### John Muir (Year-Long School Placement)
- **Format:** Year-long after-school Python robotics program at John Muir middle school, blended with sports (basketball). 45-minute coding sessions.
- **Platform:** LEGO SPIKE Prime, Python (MicroPython via SPIKE App v3)
- **Instructor:** Coach G (assigned by SOTC, Dorian supervises)
- **Google Classroom code:** w4m3nvl6
- **Students:** Started with 26, dropped to 12-14 active. Mostly 7th-8th grade remaining; 6th graders dropped disproportionately.
- **Two factors drove the >1/3 dropout:** (1) jumping straight to Python without word-block scaffolding, and (2) the assigned instructor struggles with classroom management — can't speak up, hold attention, or redirect students. Kids do what they want unless Dorian is physically present. This is a staffing problem as much as a curriculum problem.
- **Key finding:** Students with prior word-block experience (Vincent, Jacob, Winston) dramatically outperformed newcomers. Only 3 of ~14 active students reached Proficient by mid-program.
- **Differentiation model:** Three-tier table system (Red = beginners, Yellow = struggling but some foundation, Green = advanced/independent). Student names hardcoded into slide decks.

#### JohnMuir File Inventory (`JohnMuir/`)

**Slides** (`slides/`)

| File | Slides | Content |
|------|--------|---------|
| `Session1_CodeClinic.html` | 8 | Type Program BLUE/GOLD, common fixes table, port mapping, submit to GC |
| `Session2_ProveIt.html` | 9 | Bug hunt warm-up (3 bugs), work time, live demo, 0-3 scoring rubric, submit |
| `Session3_SensorRecon.html` | 13 | CAN vs CAN'T framing, distance + color sensors, `while True`/`break`, sensor troubleshooting |
| `Session4_TheGauntlet.html` | 14 | Full toolkit review, obstacle course layout, `if/elif/else`, starter code, tuning guide, course runs |

**Assignments** (`assignments/`)

| File | Points | Content |
|------|--------|---------|
| `Assignment4_CodeClinic.html` | 100 | Paste working code (BLUE or GOLD). Minimal — just get something submitted. |
| `Assignment4_Template.html` | — | Student template for Assignment 4 |
| `Assignment5_ProveIt.html` | 100 | Code + "what does it do" (2-3 sentences) + explain one line. Tests understanding, not just execution. |
| `Assignment5_Template.html` | — | Student template for Assignment 5 |
| `Assignment6_ShowcaseRoutine.html` | 100 | Green Table only. 6 requirements: 4 movements, 2 sounds, light matrix, `for` loop, custom function, return-to-start. Detailed scoring rubric (20/10/10/15/15/20/10). |
| `Assignment6_Template.html` | — | Student template for Assignment 6 |
| `Assignment7_SensorRecon.html` | 100 | Distance sensor obstacle detection + avoidance. 4 requirements. Reference code provided with "YOUR CODE BELOW" marker. Includes useful commands table and reflection questions. |
| `Assignment8_TheGauntlet.html` | 100 | Autonomous obstacle course. 5 requirements. Full starter code + tuning guide table. 4-part submission: code, performance, changes made, "if you had more time." |

**Instructor Materials** (`instructor/`)

| File | Content |
|------|---------|
| `CoachG_PrepGuide_Sessions1-2.html` | Minute-by-minute timing, student groupings with names, common pitfalls, scripted callouts, demo procedures |
| `CoachG_PrepGuide_Sessions3-4.html` | Sensor setup, hardware verification checklist, student-specific assignments, challenge extensions |
| `ReferencePrograms_BlueGold.html` | Clean printable reference: Program BLUE (drive forward) and Program GOLD (beep & spin) with port mapping table |

**Data & Admin** (`data/`)

| File | Content |
|------|---------|
| `Attendance.csv` | 26 students, 15 dates (Dec 2025 - Feb 2026). Top: Winston Zhou (15/15). Several at 1/15. |
| `ProgressReport.csv` | Student-by-student: code score (A-D), worksheet score, observations. Mastery: 2 students. Proficient: 1. Multiple with zero submissions. |
| `ClassSnapshot_Feb2026.html` | Comprehensive mid-program analysis. Enrollment status, academic tiers, priority interventions, staffing notes. |

**Reference** (`reference/`)

| File | Content |
|------|---------|
| `pythonKnowledgeBase.txt` | 110KB LEGO SPIKE Prime Python documentation (motors, sensors, variables, syntax) |
| `LecturesAndActivities.pdf` | 3.3MB comprehensive reference |
| `ForGrade_ImportingLibraries.pdf` | Student submission samples — importing libraries |
| `ForGrade_BasicMovement.pdf` | Student submission samples — basic movement worksheet |

**Design** (`design/`)

| File | Content |
|------|---------|
| `GeminiCurriculumConversation.txt` | 3,354 lines. Multi-week conversation with Gemini AI: curriculum design, student work analysis, individual grading, "Robo-Athlete Academy" framing, detailed session planning, staffing gap analysis. Key decisions made here: Blue/Gold dual-code approach, basketball exit incentive, KPP assessment framework, role-based engagement (Markies as Tech Inspector, Vincent's Referee Bot). |

#### JohnMuir Curriculum Observations

**Progression:**
- Session 1 → Session 2: Smooth. Type code → explain code. Low conceptual jump.
- Session 2 → Session 3: Steep. Explain one line → sensor loops, continuous driving, conditionals, `break`. Given that most students were still at Developing or below, this likely hit hard — compounded by classroom management.
- Session 3 → Session 4: Moderate. Sensor detection → full obstacle course. Builds naturally if Session 3 landed.

**Strengths:**
- Consistent dark-theme visual design across all slide decks
- Every session opens with a single clear goal ("Today's Goal: ...")
- Red/Yellow/Green differentiation built into every deck, not bolted on
- Assignments escalate naturally: paste code → explain code → sensor code → autonomous navigation
- Troubleshooting tables address real observed student errors (`awalt`, `light matrix`, missing colon)
- Basketball exit incentive threaded throughout — practical motivation lever
- Bug hunt in Session 2 is a great teaching moment (find 3 bugs, first correct answers demo first)
- Tuning guide in Assignment 8 makes iteration concrete, not abstract

**Issues to address if reusing:**
- **Student names hardcoded in all slides.** Table assignments reference specific students (Angelo, Prince, Vincent, etc.). Every slide deck needs name updates for a new cohort.
- **Assignment numbering starts at 4.** Assignments 1-3 presumably existed in a prior format or were word-block era. Confusing for students entering mid-stream.
- **No student templates for Assignments 7 and 8.** Assignments 4-6 have separate template files; 7-8 embed answer boxes directly. Format inconsistency.
- **Port assumptions vary.** Slides use ports 0,1 (A,B) for motors and port.F for distance sensor. Teacher report noted students using C/D. The port check slide in Session 1 addresses this, but it remains a friction point.
- **Session 3-4 assume Sessions 1-2 landed.** Starter code in later sessions builds on code students should have mastered. With only 3 proficient students at mid-program, most were likely still stuck on basic syntax when sensors were introduced.
- **Assignment 6 (Showcase Routine) is effectively unreachable** for anyone outside Green Table. Requirements include `for` loops and custom functions — concepts not yet taught in the slides. Only appropriate for students with prior experience.

---

### Jack & Jill Cluster Showcase (One-Off Event)
- **Format:** 1-hour standalone robotics showcase for a Jack & Jill cluster
- **Platform:** LEGO SPIKE Prime, Word Blocks (SPIKE 3 app)
- **Audience:** Grades 6-8 kids + their mothers (sign-up conversion goal)
- **Details:** See `jack_and_jill_showcase.md`
- **Files:** See `JackJill/` directory

---

### Allen Temple Math Hour (Recurring Program)
- **Format:** Competitive team-based math game sessions at Allen Temple Baptist Church, part of Science on the Court (SOTC). Runs alongside sports programming.
- **Audience:** Grades 1-7 (ages 6-13). Wide age range in every session — younger and older students compete simultaneously.
- **Location:** Allen Temple, Bay Area (families from Oakland, Castro Valley, San Ramon, San Leandro, Richmond, Hayward, Moraga)
- **Enrollment:** 42 students registered, peak attendance ~29 in a single session. 8 students attended all 5 tracked sessions.
- **Instructors:** Dorian + Coach G + Coach Christian

#### How a Session Works
1. 4 teams (Red, Blue, Gold, Green) compete across ~4 rounds
2. Each round (5 min): instructor shows a problem with two difficulty tiers
   - **Tier A** (Grades 1-3) and **Tier B** (Grades 4-7) solve simultaneously
   - 3-minute silent work period, then pencils down
   - Team captains (older students) verify answers
3. **Scoring:** Max 6 pts per round — 2 pts Tier A, 2 pts Tier B, 2 pts bonus (good questions or catching errors)
4. **Level-up rule:** Younger student doing older tier = counts. Older student doing younger tier = does not count.

#### Math Hour File Inventory (`math/`)

**Instructor Materials**

| File | Content |
|------|---------|
| `SOTC_Instructor_Handout.md` | Complete competition rulebook: game flow, tier levels, scoring, round timing script with exact callouts, score sheet templates, late arrival procedures, troubleshooting, opening/closing scripts |
| `SOTC_Instructor_Handout.html` | HTML version of above (formatted for printing) |
| `SOTC Math Competition - Instructor Handout.pdf` | PDF version (5 pages, professional formatting) |
| `SOTC VISUAL PROBLEM DESIGN GUIDE` | Design principles for visual math problems: one idea per problem, <12 words, numbers bigger than words, icon anchors, color coding (Blue=Distance, Green=Time, Orange=Speed, Purple=Angle), scaffolding order (fill-in → multiple choice → open answer) |

**Games & Competition Problems**

| File | Content |
|------|---------|
| `jeopardy_math_game.html` | Fully interactive Jeopardy board: 5 categories x 5 questions (25 total), two-tier system (Tier A grades 1-3, Tier B grades 4-7), timer, score tracking, answer reveal. Sports-themed. |
| `jeopardy_math_game_v2.html` | Updated version with different questions (same structure) |
| `jeopardy_rules.html` | Rules and game management guide with color-coded callout boxes and team badges |
| `generate_jeopardy.py` | Python script that uses Claude API to auto-generate new Jeopardy games. Auto-versions output files. Customizable themes (default: "sports"). Validates JSON structure, both tiers, math accuracy. Uses `claude-sonnet-4-20250514`. |
| `SOTC Math Comp.pdf` | Original competition problem set |
| `SOTC_Math_Comp_Solutions.md` | Full solutions: 4 quarters (Warm-Up, Practice Court, Game Stats, Championship), 4 tiers each. Basketball-themed. Includes step-by-step solutions, common mistakes, teacher guidance, partial credit notes. |
| `SOTC_Math_Comp_Solutions.html` | HTML version of solutions (color-coded answer boxes) |

**Student Assessments** (`StudentsAssessments/`)

| File | Content |
|------|---------|
| `1st Grade Assessment.pdf` | Grade 1 diagnostic assessment |
| `2nd grade assessment.pdf` | Grade 2 diagnostic assessment |
| `3rd Grade Assessment .pdf` | Grade 3 diagnostic assessment |
| `4th Grade Assessment.pdf` | Grade 4 diagnostic assessment |

**Data & Admin**

| File | Content |
|------|---------|
| `2_5_Allen Temple Roster - Attendance.csv` | 42 students, 5 sessions tracked (Jan-Feb 2026). Age range 6-13. Peak: 29 students (2/3/26). |
| `ATRoster.csv` | Email list (41 entries): parents + staff. Has some duplicates. |
| `SquaresapceEmailList.csv` | Squarespace export: 27 entries with full contact info, addresses, mailing list membership. All tagged "Allen Temple" / "Science on the Court". |

**Feedback**

| File | Content |
|------|---------|
| `Feedback on Thursday Jan 29.txt` | Post-session reflection. Only got through 2 of 4 problems. Teams unclear on rules, instructors unfamiliar with game. Lukewarm student reception. 6th grade captains absent (homework). Positive: homework session helped with fractions, parents appreciated feedback. Coach notes: Coach G eating/drinking while teaching, Coach Christian needs positive coaching approach vs. punitive. |

**Reference**

| File | Content |
|------|---------|
| `MathStandards.pdf` | Math standards reference (5 pages, likely Common Core alignment) |
| `Art of Problem Solving - Prealgebra.pdf` | Full AOPS textbook (81MB). Reference for problem design. |

#### Math Hour Observations

**Strengths:**
- The two-tier system (Tier A grades 1-3, Tier B grades 4-7) solves the wide age range problem elegantly — same session, same competition, different difficulty
- Level-up rule encourages younger students to stretch without letting older students coast
- Team captain model (older students verifying answers) creates natural peer leadership
- `generate_jeopardy.py` is a force multiplier — new game content on demand via Claude API
- Visual problem design guide enforces accessibility: problems solvable by looking, not reading (critical for grades 1-2)
- Basketball/sports theming matches the SOTC brand and the physical activity sessions

**Issues to address:**
- **Execution gap.** The Jan 29 feedback is blunt: rules unclear, instructors unfamiliar with the game, only 2 of 4 problems completed, lukewarm reception. The materials are good but the delivery needs work — same pattern as JohnMuir.
- **Instructor readiness.** Coach G and Coach Christian both flagged for behavior issues (eating while teaching, punitive coaching style). Materials alone won't fix this.
- **No assessments for grades 5-7.** Diagnostic assessments exist for grades 1-4 only. The older tier (grades 4-7) is partially uncovered.
- **Filename issues.** Leading space on "SOTC VISUAL PROBLEM DESIGN GUIDE", trailing space on "3rd Grade Assessment .pdf", misspelling "SquaresapceEmailList". Minor but messy.
- **Duplicate formats.** Instructor handout exists as .md, .html, and .pdf — three copies of the same content. Solutions exist as .md and .html.
- **Flat directory structure.** 23 files in one folder mixing games, assessments, admin data, feedback, and an 81MB textbook. Could benefit from subdirectories like JohnMuir.

---

## Source Materials (General Reference)

### /SOTC/lego
- **2026 Car Lesson.pdf** (56 pages) — Full 6-session curriculum: build, drive, turns, sensors, Python, competition
- **Session1_Slides.md** / **Session1_Student_Worksheet.md/.docx** — Detailed Session 1 materials with Python code
- **WordBlocks.pdf** — SPIKE 3 word blocks reference
- **Digital Sign.pdf** — LEGO Education lesson on light matrix (45-90 min, grades 6-8)
- **SPIKE - Pair Programming.pdf** — Driver/Navigator role lesson (45 min)
- **SPIKE Python Communicating with Sounds.pdf** — Beep/sound programming lesson
- **CommentsOnLego.txt** — Dorian's design notes on blending car building, lights, and coding approaches

---

## SPIKE 3 Word Blocks (Actual Syntax)
The SPIKE 3 app uses natural-language word blocks, NOT Python-syntax blocks. Key blocks:

### Movement (pink, gear icon)
- `set movement motors to A+B` — assigns motor ports
- `set movement speed to 50 %` — speed range -100 to 100, negative = reverse
- `move forward for 2 seconds` — dropdown for forward/backward, units: cm/inches/seconds/degrees/rotations
- `move backward for 2 seconds` — same block, dropdown changed
- `set 1 motor rotation to 17.5 cm moved` — distance calibration
- `stop moving`

### Sound (purple)
- `play beep 60 for 0.2 seconds` — number is MIDI pitch (not Hz), higher = higher pitch
- `play sound Cat Meow 1 until done` — preset sounds library
- `set volume to 100 %`

### Light (orange)
- `turn on [pattern] for 2 seconds` — click pattern grid to draw on 5x5 matrix
- `turn on [pattern]` — stays lit until changed
- `turn off 5x5 light matrix`

### Control (orange)
- `wait 1 seconds`

### Events (yellow, hat block)
- `when program starts` — always present at top

---

## SPIKE Prime Python Quick Reference
Key patterns used across JohnMuir curriculum:

### Core Structure
```python
from hub import light_matrix, sound, port
import motor_pair, distance_sensor, runloop

motor_pair.pair(motor_pair.PAIR_1, 0, 1)  # ports A=0, B=1, C=2, D=3, E=4, F=5

async def main():
    # code here
runloop.run(main())
```

### Reference Programs
- **Program BLUE** (drive forward): `move_for_time(PAIR_1, 2000, 0, velocity=50)` + light_matrix "GO"/"DONE"
- **Program GOLD** (beep & spin): `sound.beep(800, 500, 100)` + `move_for_time(PAIR_1, 1500, 100, velocity=30)`

### Common Student Errors (from JohnMuir data)
- `awalt` instead of `await`
- `light matrix` instead of `light_matrix` (space vs underscore)
- Missing colon after `async def main()`
- No indentation inside function body
- Port number mismatch (code says A/B but motors in C/D)

---

## Lessons Learned (Cross-Program)
- **Word blocks first.** Python as a reveal, not as the hands-on tool.
- **Pair programming works.** Driver/Navigator roles keep both kids engaged.
- **Common hardware blockers:** robot not connected (check green dot), motors in wrong ports, kids adding duplicate setup blocks
- **Let the beep moment breathe.** Kids experimenting with sounds = energy in the room = parents watching
- **The "mom moments":** (1) robot moves for the first time, (2) beep experimentation, (3) Python reveal side-by-side, (4) race runs
- **Curriculum doesn't fix bad instruction.** The JohnMuir dropout was initially attributed entirely to the Python jump, but classroom management was at least equally responsible. Good materials in the hands of an instructor who can't hold the room still fail. Future placements need to vet instructor presence, not just content knowledge.
- **The syntax wall is real.** Multiple JohnMuir students understood concepts but couldn't execute due to typos. The gap between "gets the idea" and "can type it correctly" is wider than expected for this age group.
- **Attendance ≠ engagement.** Angelo attended 13/15 sessions but submitted zero work. Presence without output is a red flag that needs intervention, not credit.
- **Instructors must know the game before game day.** Allen Temple Jan 29 session failed partly because instructors were unfamiliar with the competition rules. Dry-run the format with staff before running it with students.
- **Wide age ranges need parallel tracks, not one-size-fits-all.** The Allen Temple two-tier system (Tier A/B) works. Single-difficulty activities across grades 1-7 will lose both ends.
- **Coach professionalism matters.** Coach G eating/drinking while teaching, Coach Christian using punitive approach — these undermine credibility with parents and students. Address directly.

---

## Event/Program Index
| Program | Type | File(s) | Status |
|---------|------|---------|--------|
| John Muir | Year-long school placement | `JohnMuir/` directory | Active (mid-program) |
| Jack & Jill Cluster Showcase | One-off event | `jack_and_jill_showcase.md` + `JackJill/` | Complete |
| Allen Temple Math Hour | Recurring program | `math/` directory | Active |
