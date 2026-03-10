# Session 1: Build & Basic Movement
## SPIKE Prime | Grades 6-8

---

## Slide 1: Title
**Driving with Signals**
- Today: Build a car, make it move, add lights and sound
- You'll write real Python code!

---

## Slide 2: Build Your Driving Base
- Follow the build instructions provided
- **Important Setup:**
  - Left motor → Port A
  - Right motor → Port B
- When done: wheels should spin freely

**Check:** Can you push your robot and have it roll smoothly?

---

## Slide 3: Your First Python Program
**Type this code exactly:**

```python
from hub import light_matrix
from hub import motor_pair
import runloop

motor_pair.pair(motor_pair.PAIR_1, 0, 1)

async def main():
    light_matrix.show_image(light_matrix.IMAGE_HAPPY)
    motor_pair.move_for_time(motor_pair.PAIR_1, 2000, 0, velocity=50)

runloop.run(main())
```

**Run it!** What happens?

---

## Slide 4: Understanding the Code
| Line | What it does |
|------|--------------|
| `from hub import light_matrix` | Lets us use the lights |
| `from hub import motor_pair` | Lets us control both motors together |
| `motor_pair.pair(motor_pair.PAIR_1, 0, 1)` | Connects Port A (0) and Port B (1) |
| `light_matrix.show_image(...)` | Shows a picture on the 5x5 display |
| `move_for_time(..., 2000, ...)` | Move for 2000 milliseconds (2 seconds) |
| `velocity=50` | Speed (try changing this!) |

---

## Slide 5: Try It - Experiment
Change ONE thing at a time and test:

1. Change `velocity=50` to `velocity=30` → What happens?
2. Change `2000` to `4000` → What happens?
3. Change `IMAGE_HAPPY` to `IMAGE_HEART` → What happens?

**Write down what you discover!**

---

## Slide 6: Adding Reverse with Beep
Real cars have a reverse light AND a beeping sound. Let's add both!

```python
from hub import light_matrix, sound
from hub import motor_pair
import runloop

motor_pair.pair(motor_pair.PAIR_1, 0, 1)

async def main():
    # Drive forward with happy face
    light_matrix.show_image(light_matrix.IMAGE_HAPPY)
    motor_pair.move_for_time(motor_pair.PAIR_1, 2000, 0, velocity=50)

    await runloop.sleep_ms(500)

    # Reverse with light and beep
    light_matrix.show_image(light_matrix.IMAGE_SAD)
    sound.beep(800, 200, 100)
    motor_pair.move_for_time(motor_pair.PAIR_1, 2000, 0, velocity=-50)

    light_matrix.clear()

runloop.run(main())
```

---

## Slide 7: Understanding Reverse & Sound
**What's new?**

| Code | Meaning |
|------|---------|
| `from hub import light_matrix, sound` | Now we can use sound too! |
| `velocity=-50` | Negative = reverse |
| `sound.beep(800, 200, 100)` | Beep at 800Hz, for 200ms, volume 100 |
| `await runloop.sleep_ms(500)` | Wait half a second |

---

## Slide 8: Try It - Customize Your Beep
The beep command: `sound.beep(frequency, duration, volume)`

- **frequency**: pitch (higher number = higher pitch)
- **duration**: how long in milliseconds
- **volume**: 0-100

**Experiment:**
- Try `sound.beep(400, 500, 100)` - lower, longer beep
- Try `sound.beep(1200, 100, 50)` - higher, shorter, quieter

---

## Slide 9: Repeating Beeps
You can make the beep repeat using a loop:

```python
from hub import light_matrix, sound
from hub import motor_pair
import runloop

motor_pair.pair(motor_pair.PAIR_1, 0, 1)

async def reverse_beep():
    for i in range(4):
        sound.beep(800, 200, 100)
        await runloop.sleep_ms(400)

async def main():
    light_matrix.show_image(light_matrix.IMAGE_HAPPY)
    motor_pair.move_for_time(motor_pair.PAIR_1, 2000, 0, velocity=50)

    await runloop.sleep_ms(500)

    light_matrix.show_image(light_matrix.IMAGE_SAD)
    await reverse_beep()
    motor_pair.move_for_time(motor_pair.PAIR_1, 2000, 0, velocity=-50)

    light_matrix.clear()

runloop.run(main())
```

**Note:** `for i in range(4)` repeats the beep 4 times.

---

## Slide 10: Final Challenge
**The 10-Foot Round Trip**

Your robot must:
1. Drive forward in a straight line for exactly **10 feet**
2. Stop
3. Reverse back to the **exact starting position**
4. Beep while reversing (like a real truck!)

**Rules:**
- You must figure out the code yourself
- Use what you learned today
- Test and adjust until it works!

**Hints to consider:**
- How long (in milliseconds) does it take to travel 10 feet?
- What velocity will you use?
- Does forward time = reverse time?

**Scoring:**
- Completes 10 feet forward: 5 points
- Returns within 12 inches of start: 5 points
- Returns within 6 inches of start: 10 points
- Beeps during reverse: 5 points

---

*End of Session 1*
