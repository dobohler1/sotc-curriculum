# ============================================
# SENSOR DEMO — "The Robot That Thinks"
# Jack & Jill Showcase — Instructor Only
# ============================================
# Robot drives forward, detects obstacles with
# distance sensor, stops, beeps, turns, and
# keeps going. Runs for ~30 seconds then stops.
#
# SETUP:
#   - Left motor:     Port A
#   - Right motor:    Port B
#   - Distance sensor: Port D (facing forward)
# ============================================
# Two values you'll want to tune on the real robot:
#  - TURN_90_MS (line 22) — 650ms is a starting guess for a 90-degree pivot. If it turns too little, increase it. Too
#   much, decrease it.
#  - REVERSE_MS (line 21) — how far it backs up before turning. 800ms should be enough clearance.

from hub import light_matrix, sound
import motor_pair
import distance_sensor
import runloop

OBSTACLE_CM = 15       # stop when this close (cm)
SPEED = 40             # driving speed (%)
REVERSE_MS = 800       # how long to back up (ms)
TURN_90_MS = 650       # tune this for a 90-degree pivot right
LOOP_CYCLES = 600      # ~30 sec at 50ms per cycle

motor_pair.pair(motor_pair.PAIR_1, 0, 1)  # A=0, B=1

async def beep_warning():
    """Quick double-beep like a car sensor."""
    await sound.beep(880, 150, 100)
    await runloop.sleep_ms(100)
    await sound.beep(880, 150, 100)

async def reverse():
    """Back up to create space."""
    motor_pair.move(motor_pair.PAIR_1, 0, velocity=-SPEED)
    await runloop.sleep_ms(REVERSE_MS)
    motor_pair.stop(motor_pair.PAIR_1)

async def turn_right_90():
    """Pivot right ~90 degrees."""
    motor_pair.move(motor_pair.PAIR_1, 100, velocity=SPEED)
    await runloop.sleep_ms(TURN_90_MS)
    motor_pair.stop(motor_pair.PAIR_1)

async def main():
    light_matrix.show_image(light_matrix.IMAGE_HAPPY)

    for i in range(LOOP_CYCLES):
        # Read distance sensor on port D (index 3)
        dist = distance_sensor.distance(3)

        # dist returns mm, -1 if nothing detected
        if dist != -1 and dist < OBSTACLE_CM * 10:
            # Stop — obstacle ahead!
            motor_pair.stop(motor_pair.PAIR_1)
            light_matrix.show_image(light_matrix.IMAGE_SURPRISED)
            await beep_warning()

            # Back up to create room
            light_matrix.show_image(light_matrix.IMAGE_SAD)
            await reverse()

            # Turn right 90 degrees to explore around it
            light_matrix.show_image(light_matrix.IMAGE_SILLY)
            await turn_right_90()

            # Resume forward — try to get around the object
            light_matrix.show_image(light_matrix.IMAGE_HAPPY)
        else:
            # Coast is clear — drive forward
            motor_pair.move(motor_pair.PAIR_1, 0, velocity=SPEED)

        await runloop.sleep_ms(50)

    # Done — stop and celebrate
    motor_pair.stop(motor_pair.PAIR_1)
    light_matrix.show_image(light_matrix.IMAGE_HEART)
    await sound.beep(523, 200, 100)
    await sound.beep(659, 200, 100)
    await sound.beep(784, 400, 100)

runloop.run(main())
