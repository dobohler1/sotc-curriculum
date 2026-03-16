# ============================================================
# SumoBot - Red Table Starter Code
# John Muir Robotics - LEGO SPIKE Prime
# ============================================================
# This code is READY TO RUN! But you can make it YOUR OWN
# by adjusting the three parameters below.
#
# HARDWARE SETUP:
#   - Drive motors on ports A (left) and B (right)
#   - Distance sensor on port D (facing forward)
# ============================================================

# --- IMPORTS -------------------------------------------------
# These load the modules we need to control the hub
from hub import light_matrix, sound
import motor_pair
import distance_sensor
import runloop

# --- YOUR PARAMETERS ----------------------------------------
# Try changing these to improve your bot's performance!

ATTACK_SPEED = 80       # How fast to charge (0-100). Higher = more aggressive.
SEARCH_SPEED = 30       # How fast to spin while looking (0-100). Lower = more careful.
DETECT_DISTANCE = 300   # How far away to detect opponent (in mm). 300mm = about 12 inches.

# --- SETUP ---------------------------------------------------
# Pair the two drive motors together so they work as a team.
# Port A (0) is left motor, Port B (1) is right motor.
motor_pair.pair(motor_pair.PAIR_1, 0, 1)


# --- COUNTDOWN FUNCTION -------------------------------------
# This runs a 3-second countdown before the match starts.
# The light matrix shows 3... 2... 1... then an angry face!
async def countdown():
    # Show "3" on the hub display
    light_matrix.write("3")
    await runloop.sleep_ms(1000)

    # Show "2" on the hub display
    light_matrix.write("2")
    await runloop.sleep_ms(1000)

    # Show "1" on the hub display
    light_matrix.write("1")
    await runloop.sleep_ms(1000)

    # Show an angry face - time to battle!
    light_matrix.show_image(light_matrix.IMAGE_ANGRY)
    await runloop.sleep_ms(500)


# --- MAIN PROGRAM -------------------------------------------
async def main():
    # Run the countdown before we start fighting
    await countdown()

    # Main battle loop - runs forever until the program is stopped
    while True:
        # STEP 1: Read the distance sensor on port D.
        # It returns distance in millimeters.
        # If nothing is detected, it returns -1.
        dist = distance_sensor.distance(3)

        # STEP 2: Decide what to do based on what we see.
        if dist != -1 and dist < DETECT_DISTANCE:
            # OPPONENT DETECTED! Charge straight forward!
            # steering=0 means go perfectly straight.
            motor_pair.move(motor_pair.PAIR_1, 0, velocity=ATTACK_SPEED)
        else:
            # No opponent in sight. Spin in place to search.
            # steering=100 means spin hard to the right.
            motor_pair.move(motor_pair.PAIR_1, 100, velocity=SEARCH_SPEED)

        # Small delay so the loop doesn't run too fast.
        # This gives the sensors time to update.
        await runloop.sleep_ms(50)


# --- START THE PROGRAM ---------------------------------------
# This line actually runs our main function.
runloop.run(main())
