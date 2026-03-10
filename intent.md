# Intent Document — SOTC Robotics Curriculum

## Who This Is For
This document defines the design intent, trade-off hierarchy, and decision boundaries for AI-assisted curriculum development for SOTC (Science on the Central Coast), led by Dorian Bohler. Any AI agent working on SOTC materials should treat this as the governing document.

---

## Mission
Develop LEGO SPIKE Prime robotics curriculum that teaches real engineering and programming concepts to grades 6-8 students. The curriculum must produce genuine learning while making kids want to keep showing up.

---

## Trade-off Hierarchy

When priorities conflict, resolve them in this order:

### 1. Learning comes first
The student must walk away having learned something real — a concept, a skill, a way of thinking. Engagement without learning is entertainment. We're not doing entertainment.

### 2. Engagement is the vehicle
If the kid doesn't light up, the learning won't stick and they won't come back. Every activity must be designed to produce visible moments of excitement, discovery, or pride. But engagement serves learning — never the reverse.

### 3. Low floor, high ceiling (HARD CONSTRAINT)
Every single activity must have:
- **A low floor:** An entry point accessible to a student who has never written a line of code, never touched a robot, and may not be confident in STEM. They must be able to participate and succeed at a basic level.
- **A high ceiling:** A stretch path for the advanced student who finishes early. This could be a bonus challenge, a harder variant, a creative extension, or a transition to a more advanced tool (e.g., word blocks → Python).

This is non-negotiable. It applies to every lesson, worksheet, challenge, and activity. Design for it from the start — do not bolt it on after.

### 4. Assume unpredictable skill range (HARD CONSTRAINT)
Never design an activity assuming a known or uniform skill level. Every class may include complete beginners alongside students with prior coding experience. The curriculum must function across this range without separate tracks or prior screening. Differentiation happens within the activity, not before it.

### 5. Scaffolded progression over ambition
Don't skip steps. The progression is: physical building → visual blocks → text-based Python → sensors → autonomous behavior → competition. If time is short, cut content from the end — never collapse early steps to rush to advanced material. The JohnMuir data showed that skipping the word-block scaffolding stage and jumping to Python contributed to a >33% dropout rate — but the curriculum wasn't the only factor. Weak classroom management (instructor unable to hold attention or enforce focus) compounded the problem. Lesson: even good curriculum fails without an instructor who can command the room.

### 5a. Instructor capability is a hard dependency
Curriculum quality cannot compensate for an instructor who can't keep students engaged and on task. When SOTC places instructors in classrooms, they must be able to speak up, redirect, and hold attention independently — not just deliver content. If an instructor needs Dorian present to maintain control, that's a staffing problem, not a curriculum problem. Design materials to be instructor-friendly, but do not design around instructor weakness.

### 6. Visible outcomes for stakeholders
Parents, sponsors, and administrators are often watching. Design moments where the learning is visible to non-technical observers: a robot moving for the first time, a race, a side-by-side blocks-to-Python comparison. These moments are not separate from the curriculum — they are built into it.

### Ultimate Tiebreaker
When all else is equal: **Did the student learn something real, and do they want to come back to learn more?** Both parts must be true.

---

## Decision Boundaries

### The AI may decide autonomously:
- Python code snippets and word block sequences
- Slide design, layout, and visual styling
- Worksheet structure, question wording, and formatting
- Activity timing and pacing suggestions
- Rubrics, point values, and scoring systems
- Troubleshooting guides and instructor support materials
- Ordering and sequencing of steps within a session
- Challenge difficulty and scoring thresholds
- Tone and voice in student-facing materials (default: casual, direct, age-appropriate for middle school)
- Suggesting extensions or bonus challenges within existing curriculum scope

### The AI must escalate to Dorian:
- **Marketing and parent-facing messaging** — All flyers, program descriptions, emails, social media copy, and sign-up materials require Dorian's input and approval. The AI does not yet understand the different buyer personas (Jack & Jill mothers, school administrators, grant funders, etc.) and messaging that works for one audience may miss with another.
- **Which programming paradigm to use** (word blocks vs. Python vs. icon blocks) — This is a pedagogical decision with real consequences. Dorian decides based on audience, duration, and context.
- **What gets cut when time is short** — The AI can suggest what to cut, but Dorian makes the call.
- **Hardware setup decisions** — Which ports, which sensors, whether robots are pre-built or student-built. These depend on logistics the AI may not know.
- **Whether to scaffold or let students struggle on a specific task** — The AI can propose either approach, but Dorian decides based on the group.
- **Extending curriculum beyond current scope** — The AI can suggest new sessions or concepts, but Dorian decides whether to pursue them.

### No known "never touch" areas.
Dorian has not identified any topics, tools, or approaches that are categorically off-limits. Use good judgment and escalate if uncertain.

---

## Design Principles (Derived from Practice)

### Pair programming works
Driver/Navigator roles keep both students engaged and create natural peer support. Use it as the default for hands-on activities.

### Instant wins early, earned struggle later
The first activity in any session should guarantee success (robot moves, light turns on, sound plays). Challenges that require iteration and debugging come after the student has a working foundation.

### The beep moment matters
When kids experiment with sounds, lights, or creative customization, the room gets loud and fun. Let these moments breathe. They're not wasted time — they're the moments parents remember and kids talk about.

### Test, adjust, repeat
Frame iteration as engineering practice, not failure. The race challenge is designed so that no one gets it perfect on the first try. The tuning process IS the learning.

### Pre-build when time is short
For events under 2 hours, pre-build robot driving bases. Building is valuable but it's not the hook — coding and seeing the robot respond is. Save building for multi-session courses where there's time to do it properly.

### Assessment is completion-based by default
The goal is learning and return rate, not sorting students by performance. For course sessions, grade on completion and effort (did you write acceptance criteria? did you submit your worksheet? did you attempt the challenge?) rather than correctness. Rubric-scored competitions (like race scoring) are motivational tools, not grades. If formal grading is required by a school partner, escalate to Dorian — grading pressure can conflict with the "want to come back" principle.

---

## Context
- **Platform:** LEGO SPIKE Prime (SPIKE 3 app)
- **Grade levels:** 6-8 (ages 11-14)
- **Instructor:** Dorian Bohler, Physicist and SOTC Founder
- **Programming progression:** Word Blocks → Python
- **Key reference materials:** See `context.md` for platform details, curriculum inventory, and word block syntax. See event-specific spec files (e.g., `jack_and_jill_showcase.md`) for individual event details.
