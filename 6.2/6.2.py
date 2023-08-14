# This is a sample Python script.

# Press ⌃R to execute it or replace it with your code.
# Press Double ⇧ to search everywhere for classes, files, tool windows, actions, and settings.


def ark(m,n):
    if m == 0:
        return n + 1
    elif m > 0 & n == 0:
        return ark(m-1, 1)
    elif m > 0 & n > 0:
        return ark(m-1, ark(m, n - 1))




# See PyCharm help at https://www.jetbrains.com/help/pycharm/
