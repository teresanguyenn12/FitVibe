import math

def mysqrt(a):
    x = a/2
    epsilon = 1e-10
    while True:
        y = (x + a/x)/2
        if abs(y - x) < epsilon:
            break
        x = y
    return x






def test_square_root():
    print("math.sqrt(a)  mysqrt(a)    diff")
    print("------------  ----------  -----------")
    for a in range(1, 10):
        sqrt_math = math.sqrt(a)
        sqrt_mysqrt = mysqrt(a)
        diff = abs(sqrt_math - sqrt_mysqrt)
        print(f"{a:<14} {sqrt_math:<12} {sqrt_mysqrt:<12} {diff}")

test_square_root()