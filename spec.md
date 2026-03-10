# Lesson Specification Template — SOTC Robotics

> **Governing document:** All specs must comply with `intent.md`. When in doubt, refer to the trade-off hierarchy and decision boundaries defined there.

---

## How to Use This File

Copy the template below for each new lesson or event. Fill in the bracketed fields. Delete any sections marked *[OPTIONAL]* that don't apply. The template is designed to work for:

- **One-off events** (1 hour, showcase/demo, unknown audience)
- **Single course sessions** (1 of N sessions, known students, builds on prior work)
- **Full course arcs** (the complete multi-session sequence)

Sections marked with `[ONE-OFF]` or `[COURSE]` indicate guidance that differs by format. Both are included — use whichever applies.

---

# SPEC: [Lesson Title]

## 1. Problem Statement

**Topic:** [e.g., Color Sensor Navigation, Basic Movement, Obstacle Avoidance]

**Format:**
- [ ] One-off event (standalone, no prior sessions, audience may include non-students)
- [ ] Course session (part of a sequence, builds on prior work)

**Duration:** [e.g., 60 minutes, 90 minutes]

**Core learning objective:** In one sentence, what should a student be able to DO after this lesson that they couldn't do before?
> [e.g., "Program a robot to move a precise distance and return to its starting position."]

**Component focus:** [e.g., distance sensor, color sensor, motors, light matrix, sound]

**Prior knowledge assumed:**
- `[ONE-OFF]` Assume zero experience with robotics, coding, or SPIKE Prime unless stated otherwise.
- `[COURSE]` List specific skills/concepts from prior sessions that this lesson builds on.
> [e.g., "Students can build a driving base and use word blocks to move forward/backward (Session 1-2)."]

**Skill range strategy:** *(Required — see intent.md, hard constraint)*
- **Floor (minimum):** What does success look like for the least experienced student?
> [e.g., "Drags 3 blocks, robot moves forward and back."]
- **Ceiling (stretch):** What does the advanced student work toward?
> [e.g., "Calibrates speed and duration to hit exact distance. Adds custom light/sound."]
- **Differentiation mechanism:** How does the activity naturally scale?
> [e.g., "Base challenge is pass/fail. Scoring rubric rewards precision — higher accuracy = more points. Bonus challenges for early finishers."]

---

## 2. Acceptance Criteria

> These define "done." The lesson plan is not complete until all applicable criteria are met.

### Student-facing criteria

**Before hands-on work begins, students will define their own acceptance criteria.**

- `[ONE-OFF]` Students write acceptance criteria AFTER the introductory activity, once they've seen the robot move at least once. Frame it as: *"What does your robot need to do to score full points?"* Minimum 2 sentences.
- `[COURSE]` Students write acceptance criteria BEFORE building/coding, as a spec for what their program should do. Minimum 3 sentences. This is a core engineering practice and should be treated as a graded deliverable.

Example student acceptance criteria:
> *"My robot will drive forward exactly 10 feet, stop, play a beep sound, then reverse back to within 6 inches of the start line."*

### Lesson plan criteria

- [ ] Contains a **concept introduction** (offline or live demo — see Section 3)
- [ ] Includes a **physical test case** the instructor can use to verify the robot works (e.g., "Robot stops before hitting a wall placed 12 inches away")
- [ ] Has a **low-floor entry activity** completable by a zero-experience student with guidance
- [ ] Has a **high-ceiling extension** for advanced students
- [ ] Includes an **instructor troubleshooting guide** for common failure modes
- [ ] `[ONE-OFF]` Contains at least one **visible "wow" moment** for non-student observers (parents, sponsors)
- [ ] `[ONE-OFF]` Ends with a **call to action** (sign-up info, flyer, next steps)
- [ ] `[COURSE]` Connects explicitly to the **prior session** (what we built on) and **next session** (what this enables)
- [ ] `[COURSE]` Includes a **submission/assessment checkpoint** (Google Classroom, live demo, worksheet)

---

## 3. Concept Introduction

> Every lesson needs a moment where the concept is explained before students start coding. The format depends on the event type and available time.

**Choose one:**

### Option A: Offline / Unplugged Activity (5-10 min)
*Best for: course sessions where you have time and want deeper conceptual grounding.*

Describe an activity that teaches the core concept without a computer. Examples:
- Students act as "robots" following verbal instructions from a partner (teaches sequencing)
- Students clap/snap/stomp patterns to communicate (teaches the idea behind sensor signals)
- Students sketch a maze on paper and write step-by-step directions (teaches algorithm thinking)

> [Describe your offline activity here]

### Option B: Live Demo + Question (2-3 min)
*Best for: one-off events, short sessions, or when you want to maximize hands-on time.*

Instructor demonstrates the finished behavior on a pre-built robot. Then asks one question:
> [e.g., "What did the robot just do? How did it know to stop?"]

Brief discussion (30 seconds), then straight to building.

### Option C: Inline Discovery (0 min dedicated)
*Best for: when the concept is simple enough to learn by doing.*

No separate intro. The worksheet/slides walk students through the concept as they build. The "aha" happens when the robot responds.

> **Guardrail:** Only use Option C when the concept is a single new block or a variation on something already learned (e.g., changing speed after students already know movement blocks). If the concept introduces a new category of thinking (sensors, conditionals, calibration), use Option A or B instead.

**Selected option:** [A / B / C]

---

## 4. Constraint Architecture

### Must do:
- [ ] [e.g., "Include a troubleshooting guide for the 5 most common failure modes"]
- [ ] [e.g., "Pair programming with Driver/Navigator roles"]
- [ ] [e.g., "All code must be tested on actual hardware before the lesson"]
- [ ] [Add more as needed]

### Must not do:
- [ ] `[COURSE]` Do not provide the final working code in the student handout. Students must construct or complete the program themselves. Starter code and intermediate checkpoints are fine.
- [ ] `[ONE-OFF]` *(This constraint is relaxed for one-off events. Showing complete block sequences is acceptable when time is limited and the goal is engagement + exposure.)*
- [ ] [e.g., "Do not introduce Python syntax in a word-block session"]
- [ ] [Add more as needed]

### Preferences:
- [ ] Pair programming (Driver/Navigator) as default grouping
- [ ] Casual, direct tone in all student-facing materials
- [ ] Competitive or timed elements where they serve learning (not just for fun)
- [ ] Sound/light customization moments — let kids experiment and make noise
- [ ] [Add more as needed]

---

## 5. Decomposition

> Break the lesson into timed subtasks. Every subtask must identify what the INSTRUCTOR does and what the STUDENTS do.

### `[ONE-OFF]` Example structure (60 min):

| Time | Subtask | Instructor | Students |
|------|---------|-----------|----------|
| 0:00-0:05 | A. Hook / Demo | Demo finished robot behavior. Ask one question. | Watch. React. |
| 0:05-0:10 | B. Setup | Pair students. Walk through app setup. | Pair up. Open app. Connect robot. |
| 0:10-0:25 | C. Guided build (Steps 1-3) | Live-code on projector. Walk room. | Follow slides, drag blocks, test each step. |
| 0:25-0:30 | D. Role switch + concept bridge | Announce switch. Show concept connection (e.g., Python reveal). | Switch roles. Rebuild from memory. |
| 0:30-0:45 | E. Challenge | Explain rules. Walk room during tuning. | Write acceptance criteria. Tune and test. |
| 0:45-0:55 | F. Competition / showcase | Emcee. Score runs. Demo advanced behavior. | Race/present. Watch demo. |
| 0:55-1:00 | G. Close | Walk through next steps. Hand out flyers. | Reflection. Talk to parents. |

### `[COURSE]` Example structure (90 min):

| Time | Subtask | Instructor | Students |
|------|---------|-----------|----------|
| 0:00-0:10 | A. Review + offline activity | Lead unplugged activity. Connect to prior session. | Participate. Discuss. |
| 0:10-0:20 | B. Spec writing | Introduce today's challenge. Model acceptance criteria. | Write 3-sentence acceptance criteria for their robot. |
| 0:20-0:25 | C. Demo + walkthrough | Show the target behavior on demo robot. Walk through first code steps. | Watch. Ask questions. |
| 0:25-0:55 | D. Build / code / test (30 min) | Walk room. Debug. Redirect. Differentiate by table. | Build and test iteratively. Log attempts. |
| 0:55-1:10 | E. Challenge | Explain advanced challenge or test case. | Attempt challenge. Iterate. |
| 1:10-1:20 | F. Demo / share | Facilitate student demos or competition. | Present. Watch peers. |
| 1:20-1:30 | G. Reflect + submit | Prompt reflection. Ensure submissions. | Complete worksheet. Submit via Google Classroom. |

### Your decomposition:

| Time | Subtask | Instructor | Students |
|------|---------|-----------|----------|
| | A. | | |
| | B. | | |
| | C. | | |
| | D. | | |
| | E. | | |
| | F. | | |
| | G. | | |

---

## 6. Materials & Deliverables

> List everything that must be created or prepared for this lesson.

### Deliverables (files to create):

| File | Format | Purpose |
|------|--------|---------|
| Slides | HTML (fullscreen, arrow-key nav) | Instructor presentation |
| Student worksheet | HTML → Google Doc | Guided activity + reflection |
| Instructor run sheet | HTML | Minute-by-minute cheat sheet |
| | | |
| | | |

### `[ONE-OFF]` Additional deliverables:

| File | Format | Purpose |
|------|--------|---------|
| Flyer | HTML → print PDF | Take-home for parents |
| Demo code | Python (.py) | Sensor demo on instructor's robot |

### Physical prep:

- [ ] Robot builds: [pre-built (default for events under 2 hours — see intent.md) / student-built]
- [ ] Sensors needed: [list which, which ports]
- [ ] Room setup: [tape lines, obstacles, table arrangement]
- [ ] Laptops: [SPIKE app open, worksheet loaded, Bluetooth paired]
- [ ] Printed materials: [flyers, worksheets if not digital]

---

## 7. Test Cases

> How do we know the lesson WORKS? Define at least one test case per category.

### Student test case (the robot)
> [e.g., "Place the robot at the start line. Run the program. Robot drives to the 10-foot mark, stops, beeps, and returns within 12 inches of the start line."]

### Instructor test case (the lesson)
> [e.g., "The slowest pair in the room has a moving robot by minute 15." / "At least 80% of teams complete the base challenge."]

### `[ONE-OFF]` Stakeholder test case (the audience)
> [e.g., "At least 3 parents ask about sign-ups before the flyer is handed out." / "Kids audibly react during the sensor demo."]

### Failure test case (early warning)
> Define what failure looks like and when it's still recoverable. This lets the instructor course-correct mid-lesson rather than discovering the lesson didn't work after it's over.
> [e.g., "If fewer than half the pairs have a moving robot by minute 15, stop and do a group debug on the projector." / "If no team scores above 10 pts on first race attempt, extend tuning time by 5 minutes and cut the sensor demo."]

---

## 8. Full Course Arc (Multi-Session Only)

> Use this section when speccing an entire course. Define the session sequence, what each session unlocks, and the dependencies between them.

### Session sequence:

| # | Title | Core Concept | Unlocks |
|---|-------|-------------|---------|
| 1 | [e.g., Build & Drive] | [e.g., Motor control, basic movement] | [e.g., Forward/backward, speed, duration] |
| 2 | | | |
| 3 | | | |
| 4 | | | |
| 5 | | | |
| 6 | | | |

### Dependencies:
> [e.g., "Session 4 requires the driving base from Session 1 and the turning skills from Session 3. Session 5 cannot start until students have completed at least one sensor activity."]

### Paradigm progression:
> Define when and how the transition happens between programming paradigms. Must comply with the scaffolded progression rule in intent.md — never skip the word-block stage to rush to Python.
> [e.g., "Sessions 1-3: Word Blocks only. Session 4: Word Blocks with Python shown side-by-side. Session 5-6: Python primary, Word Blocks available as reference."]

---

*Template version: 1.0 — Developed from Jack & Jill Cluster Showcase (March 2026)*
