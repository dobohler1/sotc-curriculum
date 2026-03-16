# ============================================================
# SumoBot - Green Table Challenge Code
# John Muir Robotics - LEGO SPIKE Prime
# ============================================================
# You're building this bot from (almost) scratch!
# The imports and motor setup are done. Everything else is YOU.
#
# HARDWARE SETUP:
#   - Drive motors on ports A (left) and B (right)
#   - Distance sensor on port D (facing forward)
#   - Color sensor on port E (facing down) -- for Challenge 3+
# ============================================================

# --- IMPORTS -------------------------------------------------
from hub import light_matrix, sound
import motor_pair
import distance_sensor
import color_sensor
import runloop

# --- SETUP ---------------------------------------------------
motor_pair.pair(motor_pair.PAIR_1, 0, 1)


# =============================================================
# CHALLENGE 1: Countdown
# =============================================================
# Write an async function called "countdown" that:
#   - Displays "3" on the light matrix, waits 1 second
#   - Displays "2", waits 1 second
#   - Displays "1", waits 1 second
#   - Shows an image (like IMAGE_ANGRY) to signal the start
#
# Useful functions:
#   light_matrix.write("3")          -- show text on the display
#   light_matrix.show_image(light_matrix.IMAGE_ANGRY)  -- show an image
#   await runloop.sleep_ms(1000)     -- wait 1 second
# =============================================================


# =============================================================
# CHALLENGE 2: Search and Charge
# =============================================================
# Write the main battle loop inside an async def main():
#   - Call your countdown function first (use await)
#   - In a while True loop:
#       - Read the distance sensor on port D (port number 3)
#         distance_sensor.distance(3) returns mm, or -1 if nothing
#       - If an opponent is detected within range, charge forward
#         motor_pair.move(motor_pair.PAIR_1, 0, velocity=80)
#       - Otherwise, spin to search for them
#         motor_pair.move(motor_pair.PAIR_1, 100, velocity=30)
#       - Add a small delay: await runloop.sleep_ms(50)
#   - End the file with: runloop.run(main())
# =============================================================


# =============================================================
# CHALLENGE 3: Edge Detection
# =============================================================
# The sumo ring has a white border. Don't drive off the edge!
# Add a color sensor on port E (port number 4), facing DOWN.
#
# In your main loop, BEFORE checking for the opponent:
#   - Read the color sensor: color_sensor.color(4)
#   - It returns a color integer. White is 9 or 10.
#   - If you detect white, you're at the edge! Reverse immediately:
#       await motor_pair.move_for_time(motor_pair.PAIR_1, 500, 0, velocity=-60)
#     Then continue the loop (the "continue" keyword skips to
#     the next iteration of while True).
#
# This should be the FIRST check in your loop -- survival first!
# =============================================================


# =============================================================
# CHALLENGE 4: Multi-Distance Strategy
# =============================================================
# Not all encounters are the same! Use distance to pick your approach:
#
#   - If opponent is FAR (dist > 200mm but still detected):
#       Approach cautiously at half your normal attack speed.
#       This saves energy and keeps you in control.
#
#   - If opponent is CLOSE (dist <= 200mm and dist != -1):
#       Full speed charge! Hit them hard before they react.
#
#   - If nothing is detected (dist == -1):
#       Spin to search as before.
#
# You'll need to change your simple if/else into an
# if / elif / else chain.
# =============================================================


# =============================================================
# CHALLENGE 5: The Feint
# =============================================================
# Trick your opponent with a fake-out maneuver!
# When you detect an opponent, instead of just charging:
#
#   1. Charge forward briefly (maybe 300ms)
#      await motor_pair.move_for_time(motor_pair.PAIR_1, 300, 0, velocity=80)
#   2. Quickly reverse (maybe 200ms)
#      await motor_pair.move_for_time(motor_pair.PAIR_1, 200, 0, velocity=-60)
#   3. Then charge at FULL speed (100 velocity)
#      motor_pair.move(motor_pair.PAIR_1, 0, velocity=100)
#
# The idea: your opponent tries to push where you WERE,
# overextends, and then you slam into them from a better angle.
#
# THINK ABOUT: When should you feint vs. just charge?
# Maybe only feint when the opponent is far away?
# =============================================================


# =============================================================
# CHALLENGE 6: Victory Celebration
# =============================================================
# If your opponent falls off the ring, the distance sensor will
# read -1 (nothing detected) for a long time. Detect this!
#
# Strategy: Keep a counter that tracks how many loops in a row
# the distance sensor reads -1. If it stays -1 for about 3
# seconds (that's roughly 60 loops at 50ms each), celebrate!
#
#   - Show a happy face: light_matrix.show_image(light_matrix.IMAGE_HAPPY)
#   - Play a victory sound: sound.beep(880, 500, 100)
#   - Stop the motors: motor_pair.stop(motor_pair.PAIR_1)
#   - Wait a few seconds, then go back to searching
#
# Remember to reset your counter whenever you DO detect something!
# =============================================================
