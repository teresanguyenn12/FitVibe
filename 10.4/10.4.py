# Write a function called chop that takes a list, modifies it by removing the first and
# last elements, and returns None.

def chop(lst):
    if len(lst) >= 2:
        del lst[0]
        del lst[-1]
    return None

# Example usage
l = [1, 2, 3, 4, 5]
chop(l)
print("Modified list after chop:", l)