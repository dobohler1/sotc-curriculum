# SPEC: SumoBot Challenge

## 1. Problem Statement

**Topic:** SumoBot — Proximity Sensors, Torque, Gear Ratios, Center of Mass

**Format:**
- [x] Course session (part of a sequence, builds on prior work)

**Duration:** 2 sessions (~90 minutes each)
- Session 10a: Build & Program
- Session 10b: Competition

**Core learning objective:** Design and program an autonomous robot that detects an opponent using the distance sensor and attempts to push them out of a ring, while applying physics concepts (torque, gear ratios, center of mass) to gain a mechanical advantage.

**Component focus:** Distance sensor (detect opponent), color sensor (edge detection — ceiling), motors, gear ratios, structural design

**Prior knowledge assumed:**
Students can:
- Build and modify a SPIKE Prime driving base
- Write Python with async/await, while loops, if/elif/else
- Read distance sensor values and make decisions based on thresholds
- Define custom async functions
- Use motor_pair for movement (forward, reverse, turns, steering)
- Use light_matrix and sound for output

**Skill range strategy:**

- **Floor (Red Table — Angelo, Prince, Kazi, Kenneth, Markies, Xavier):**
  Receive nearly complete starter code. Adjust 3 parameters (attack speed, search speed, detection distance). Make one physical modification to their robot (add a pusher or lower the center of mass). Robot searches and charges. They compete.

- **Mid (Yellow Table — Alex, An, Jeremiah, Hector):**
  Receive code skeleton with the search and attack functions left incomplete. Must write the sensor logic themselves. Make 2+ physical modifications. Tune their strategy through testing.

- **Ceiling (Green Table — Vincent, Winston):**
  Write code from scratch. Add color sensor edge detection (don't drive out of ring). Implement multi-distance strategy (approach vs. charge). Experiment with gear ratios for torque vs. speed trade-off. Optional: feinting, retreat-and-counter, victory celebration.

- **Differentiation mechanism:** Everyone competes in the same bracket. The low floor means Red table has a fighting robot. The high ceiling means Green table has a *smart* fighting robot. The competition itself reveals the difference — which motivates the next round of learning.

---

## 2. Acceptance Criteria

### Student-facing criteria
Before Session 1 build time, students write acceptance criteria for their sumobot:
- Red Table: Minimum 2 sentences (template provided: "My robot will _____ when it detects an opponent. My robot will _____ when it can't find an opponent.")
- Yellow/Green Table: Minimum 3 sentences covering detection, attack strategy, and one physical design choice.

### Lesson plan criteria

- [x] Contains concept introduction (physics demo — see Section 3)
- [x] Physical test case: "Place two robots on starting lines. Press play on both. Within 10 seconds, at least one robot should detect and charge the other."
- [x] Low-floor entry: Red table has working sumo code with 3 parameter tweaks
- [x] High-ceiling extension: Edge detection, multi-distance strategy, gear ratio optimization
- [x] Troubleshooting guide for common failures
- [x] Connects to prior sessions (distance sensor from Sessions 8-9, while loops, custom functions)
- [x] Connects to next session (competition in Session 10b.
- [x] Submission checkpoint: code submitted via Google Classroom before competition

---

## 3. Concept Introduction

**Selected option: A — Offline/Unplugged Activity (10 min)**

### The Sumo Physics Demo (no robots)

**Part 1 — Center of Mass (3 min):**
Two volunteers stand in the ring (tape circle on floor). Round 1: both stand upright, try to push each other out. Round 2: one crouches low, wide stance. Ask the class: "Why is the crouching person harder to push?" → Lower center of mass = more stable.

**Part 2 — Torque vs Speed (3 min):**
Show two gear configurations on a demo robot (or use images on slides):
- Small gear driving large gear = MORE TORQUE (slow but powerful push)
- Large gear driving small gear = MORE SPEED (fast but weak push)
Ask: "For sumo, which do you want?" → Trick question — it depends on your strategy. A fast robot can dodge. A strong robot can push. Best robots balance both.

**Part 3 — Strategy (4 min):**
Show 3 sumo strategies on slides:
1. **Bull Rush:** Detect and charge full speed. Simple. Powerful if you hit.
2. **Searcher:** Spin to find opponent, then charge. Good if you lose track.
3. **Edge Dancer:** Stay near the center, let opponent come to you. Requires edge detection.
Ask each table to discuss: "Which strategy will you try first?"

---

## 4. Constraint Architecture

### Must do:
- [x] 3-second countdown before robots start (sumo tradition + safety)
- [x] Pair programming (Driver/Navigator) during code time
- [x] Every robot must be autonomous — no remote control, no touching after start
- [x] Include a troubleshooting guide for: sensor not detecting, robot driving out of ring, motors not strong enough
- [x] Test all starter code on actual hardware before the session
- [x] Physical ring must be ready before Session 1 (for testing)

### Must not do:
- [x] Do not provide Green table with finished code — challenge prompts only
- [x] Do not allow students to change motor port assignments during competition (lock hardware config in Session 1)
- [x] Do not skip the physics intro — the torque/center of mass concepts are a primary learning objective, not decoration

### Preferences:
- [x] Let students name their sumobots
- [x] Encourage physical modifications (pushers, wedges, weight distribution) — this is engineering
- [x] Sound effects during sumo add to the atmosphere (angry face on detection, battle cry beep)
- [x] Double-elimination bracket so no one is out after one loss

---

## 5. Decomposition

### Session 10a: Build & Program (~90 min)

| Time | Subtask | Instructor | Students |
|------|---------|-----------|----------|
| 0:00-0:10 | A. Sumo Physics Demo | Run the unplugged activity (push contest, gear demo, strategy discussion) | Participate. Discuss strategies at their table. |
| 0:10-0:15 | B. Rules & Ring | Explain sumo rules. Show the ring. Explain win conditions. | Listen. Ask questions. |
| 0:15-0:20 | C. Acceptance Criteria | Model an example. "Before you build, write down what your robot will do." | Write 2-3 sentence acceptance criteria on worksheet. |
| 0:20-0:40 | D. Build Time (20 min) | Walk room. Suggest modifications. Point out center of mass concepts in real time. | Modify driving base: add pusher, lower center of mass, adjust weight. Sketch design on worksheet. |
| 0:40-0:65 | E. Code Time (25 min) | Distribute code by table (Red=starter, Yellow=skeleton, Green=prompts). Walk room. Debug. | Write/modify sumo code. Test with distance sensor (hand in front = simulated opponent). |
| 0:65-0:80 | F. Test Matches (15 min) | Set up ring. Referee informal matches. Help teams identify problems. | Test against other robots in the ring. Tune parameters. Record results on worksheet. |
| 0:80-0:90 | G. Wrap & Submit | Remind: submit code to Google Classroom. Preview Session 10b bracket. | Submit code. Final tweaks. Name their sumobot. |

### Session 10b: Competition (~90 min)

| Time | Subtask | Instructor | Students |
|------|---------|-----------|----------|
| 0:00-0:10 | A. Final Tuning | Allow last-minute adjustments. No new code — parameter tweaks only. | Tune parameters. Test one practice match. |
| 0:10-0:15 | B. Bracket Reveal | Show bracket on projector. Explain double-elimination format. | Find their first opponent. |
| 0:15-0:55 | C. Tournament (40 min) | Referee matches. Announce play-by-play. Track bracket. | Compete. Watch. Cheer. Analyze between rounds. |
| 0:55-0:65 | D. Finals | Build hype. Run semifinal and final matches. | Compete or spectate. |
| 0:65-0:75 | E. Analysis | "Why did the winning robot win?" Lead discussion on torque, center of mass, code strategy. | Discuss. Connect their observations to the physics concepts from Session 1. |
| 0:75-0:85 | F. Reflection + Awards | Announce awards (see below). Hand out to winners. | Complete reflection on worksheet. |
| 0:85-0:90 | G. Clean Up | Robots disassembled or stored. | Pack up. |

### Awards:
- **Champion** — won the bracket
- **Best Design** — most creative physical modification (class vote)
- **Best Strategy** — smartest code approach (instructor pick)
- **Most Improved** — biggest jump from test matches to competition (instructor pick)

---

## 6. Materials & Deliverables

### Deliverables:

| File | Format | Purpose |
|------|--------|---------|
| SumoBot_Session1_Slides.html | HTML slides | Session 1 presentation |
| SumoBot_Session2_Slides.html | HTML slides | Session 10b.presentation |
| SumoBot_Worksheet.html | HTML → Google Doc | Spans both sessions (design, code, testing, reflection) |
| SumoBot_RedStarter.py | Python | Red table — nearly complete starter code |
| SumoBot_YellowSkeleton.py | Python | Yellow table — skeleton with TODOs |
| SumoBot_GreenPrompts.md | Markdown | Green table — challenge prompts only |
| SumoBot_RunSheet.html | HTML | Instructor guide for both sessions |

### Physical prep:

- [x] Sumo ring: 1.5ft radius (3ft diameter) circle. White tape on dark floor, or dark poster board with white tape border.
- [x] Two starting lines inside the ring, ~10 inches apart, marked with colored tape
- [x] Extra LEGO pieces available: gears (various sizes), beams, plates for pushers/wedges
- [x] Distance sensor on every robot (facing forward)
- [x] Color sensor available for Green table (facing down, for edge detection)
- [x] Laptops with SPIKE app, Google Classroom open
- [x] Bracket template (printed or on projector)
- [x] Timer for matches (60-second rounds)

---

## 7. Test Cases

### Student test case (the robot):
Place two sumobots on starting lines. Press play on both simultaneously. After the 3-second countdown, at least one robot should detect the other and drive toward it. Match ends when one robot is pushed out of the ring or 60 seconds elapse.

### Instructor test case (the lesson):
- Red table has a functioning sumo robot by minute 65 of Session 1.
- Every team competes in at least 2 matches in Session 10b.
- During the Session 10b.analysis, at least 3 students can articulate why center of mass or torque affected the outcome.

---

## 8. Sumo Rules

1. Robots start on their starting lines, facing each other.
2. Both drivers press Play at the same time.
3. 3-second countdown (programmed into the code). No movement during countdown.
4. Match begins. Robots are fully autonomous — no touching, no remote control.
5. First robot to be pushed completely out of the ring loses.
6. If neither robot is out after 60 seconds, the robot closer to the center wins.
7. If a robot stops moving (code crash, disconnection), it forfeits after 10 seconds.
8. Best of 3 rounds per match.
9. Double-elimination bracket — you need 2 losses to be eliminated.
