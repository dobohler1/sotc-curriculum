# ============================================================
# SumoBot - Yellow Table Skeleton Code
# John Muir Robotics - LEGO SPIKE Prime
# ============================================================
# The structure is built for you, but YOU need to fill in the
# key logic! Look for the TODO comments below.
#
# HARDWARE SETUP:
#   - Drive motors on ports A (left) and B (right)
#   - Distance sensor on port D (facing forward)
# ============================================================

# --- IMPORTS -------------------------------------------------
from hub import light_matrix, sound
import motor_pair
import distance_sensor
import runloop

# --- PARAMETERS ----------------------------------------------
ATTACK_SPEED = 80       # How fast to charge (0-100)
SEARCH_SPEED = 30       # How fast to spin while searching (0-100)
DETECT_DISTANCE = 300   # Detection range in mm (about 12 inches)

# --- SETUP ---------------------------------------------------
# Pair the drive motors: Port A (0) = left, Port B (1) = right
motor_pair.pair(motor_pair.PAIR_1, 0, 1)


# --- COUNTDOWN (this part is done for you!) ------------------
async def countdown():
    light_matrix.write("3")
    await runloop.sleep_ms(1000)
    light_matrix.write("2")
    await runloop.sleep_ms(1000)
    light_matrix.write("1")
    await runloop.sleep_ms(1000)
    light_matrix.show_image(light_matrix.IMAGE_ANGRY)
    await runloop.sleep_ms(500)


# --- MAIN PROGRAM -------------------------------------------
async def main():
    # Run the countdown
    await countdown()

    # Main battle loop
    while True:

        # =====================================================
        # TODO 1: Read the distance sensor
        # =====================================================
        # Read the distance sensor on port D and store the
        # result in a variable called 'dist'.
        #
        # HINT: The distance sensor is on port D, which is
        # port number 3. Use distance_sensor.distance()
        # It returns millimeters, or -1 if nothing is detected.
        #
        # Your code here:


        # =====================================================
        # TODO 2: Charge at the opponent
        # =====================================================
        # Write an if statement that checks TWO things:
        #   1. dist is NOT equal to -1 (something is detected)
        #   2. dist is LESS THAN DETECT_DISTANCE (it's close enough)
        #
        # If both are true, drive forward at ATTACK_SPEED.
        #
        # HINT: Use motor_pair.move() with steering=0 for straight
        #       and velocity=ATTACK_SPEED for the speed.
        #       Combine conditions with "and".
        #
        # Your code here:


        # =====================================================
        # TODO 3: Search for the opponent
        # =====================================================
        # Write an else block: if no opponent was detected,
        # spin in place to search for them.
        #
        # HINT: Use motor_pair.move() with steering=100 to spin
        #       and velocity=SEARCH_SPEED for the speed.
        #
        # Your code here:


        # =====================================================
        # BONUS TODO: Add feedback when opponent is detected!
        # =====================================================
        # Can you make the hub react when it spots an opponent?
        # Ideas:
        #   - Change the light matrix image
        #     (try light_matrix.show_image(light_matrix.IMAGE_SKULL))
        #   - Play a beep with sound.beep(440, 200, 100)
        #     (frequency in Hz, duration in ms, volume 0-100)
        #
        # Your code here (inside the if block above):


        # Small delay so sensors can update
        await runloop.sleep_ms(50)


# --- START THE PROGRAM ---------------------------------------
runloop.run(main())
