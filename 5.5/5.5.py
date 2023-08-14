# This is a sample Python script.

# Press ⌃R to execute it or replace it with your code.
# Press Double ⇧ to search everywhere for classes, files, tool windows, actions, and settings.

import turtle

def draw(t, length, n):
    if n == 0:
        t.fd(length)
        return
    angle = 60

    # Draw the first segment of the Koch curve
    draw(t, length / 3, n - 1)

    # Turn left by 60 degrees and draw the second segment
    t.lt(angle)
    draw(t, length / 3, n - 1)

    # Turn right by 120 degrees and draw the third segment
    t.rt(2 * angle)
    draw(t, length / 3, n - 1)

    # Turn left by 60 degrees and draw the fourth segment
    t.lt(angle)
    draw(t, length / 3, n - 1)

def main():
    window = turtle.Screen()
    window.bgcolor("white")
    turtle.speed(0)
    turtle.up()
    turtle.goto(-150, -50)
    turtle.down()
    turtle.pensize(2)
    draw(turtle, 300, 4)  # Adjust the size and recursion depth as desired
    window.exitonclick()

if __name__ == "__main__":
    main()


