def gcd(a, b):
    if b == 0:
        return a
    else:
        r = a % b
        return gcd(b, r)
