# Jack & Jill Cluster Showcase — Event Spec

## Overview
One-hour robotics activity designed to get kids excited about SOTC's 6-session LEGO SPIKE Prime course. Target audience is a local Jack & Jill cluster — both the kids (grades 6-8) and the mothers sponsoring the event. The goal is sign-ups: kids want to come back, moms see the value immediately.

## Key Design Decision
**Use Word Blocks, not Python, for the hands-on portion.** The JohnMuir data showed that text-based Python is too steep a jump for first exposure. Word Blocks give instant wins. Python is shown as a "reveal" moment (side-by-side comparison) but kids don't type it.

## Files Created for the Event

| File | Purpose |
|------|---------|
| `JackAndJill_Showcase_Slides.html` | 18-slide presentation (dark theme, arrow key nav, fullscreen) |
| `JackAndJill_Worksheet.html` | Student worksheet (open in browser → Select All → paste into Google Doc) |
| `JackAndJill_Flyer.html` | Print-ready take-home flyer (open in browser → print to PDF, letter size) |
| `JackAndJill_SensorDemo.py` | Python code for instructor's demo robot (obstacle avoidance) |
| `JackAndJill_RunSheet.html` | Minute-by-minute instructor cheat sheet |

## Activity Flow (1 Hour)

| Time | What Happens | Slides |
|------|-------------|--------|
| 0:00-0:03 | **Hook:** Instructor demos sensor robot live, then shows title slide | 1 |
| 0:03-0:05 | "What is a robot?" + Meet the robot parts | 2-3 |
| 0:05-0:08 | Pair up (Driver/Navigator), open SPIKE app, select Word Blocks | 4-5 |
| 0:08-0:15 | **Step 1:** 3 blocks → robot moves forward | 6-7 |
| 0:15-0:22 | **Step 2:** Add wait + backward → robot goes and comes back | 8 |
| 0:22-0:27 | **Step 3:** Add beep → backup beep. Kids experiment with pitch. | 9 |
| 0:27-0:30 | **Step 4:** Add light matrix faces (happy forward, sad backward) | 10 |
| 0:30-0:32 | **SWITCH** Driver/Navigator roles. Python Reveal (side-by-side) | 11-12 |
| 0:32-0:35 | Announce the 10-Foot Round Trip Race, explain scoring | 13-15 |
| 0:35-0:43 | Tuning time — kids experiment with duration and speed | 14 |
| 0:43-0:52 | **Official race runs** — 3 attempts per team, spectator event | 15 |
| 0:52-0:55 | **Sensor demo** — "The Robot That Thinks" | 16 |
| 0:55-1:00 | What comes next (6-session overview), closing, hand out flyers | 17-18 |

## Race Scoring (30 pts max)
- Reaches 10-foot line: 5 pts
- Returns within 12 inches of start: 5 pts
- Returns within 6 inches of start: 10 pts
- Beeps before reversing: 5 pts
- Light display changes (forward vs reverse): 5 pts

## Sensor Demo Robot Setup
- Left motor: Port A
- Right motor: Port B
- Distance sensor: Port D (facing forward)
- Code: `JackAndJill_SensorDemo.py` (paste into SPIKE Python editor)
- Behavior: drives forward continuously, when obstacle detected within 15cm → stops, double-beeps, reverses, pivots right 90 degrees, drives forward again exploring around
- Tunables: `OBSTACLE_CM`, `SPEED`, `REVERSE_MS`, `TURN_90_MS`
- Runs for ~30 seconds then stops with victory jingle

## Flyer Placeholders to Fill In
Search for `[` in `JackAndJill_Flyer.html`:
- `[Dates & Times TBD]`
- `[Location TBD]`
- `[Cost TBD]`
- `[email]`
- `[phone]`
- QR code image
- `sotc.org` URL

## Prep Checklist (Day Before)
- Pre-build all driving bases (wheels, 2 motors in A+B, hub charged)
- Attach distance sensor to Port D on one demo robot
- Load and test sensor demo code on demo robot
- Test every robot: hub on, Bluetooth connects to a laptop
- Open SPIKE app on every laptop
- Open Google Doc worksheet on every laptop
- Print flyers (one per family)
- Tape 10-foot track on floor (start line, 10-ft line, 12" return mark, 6" return mark)
- Set up 2-3 obstacles for sensor demo area
- Slides loaded on projector laptop
