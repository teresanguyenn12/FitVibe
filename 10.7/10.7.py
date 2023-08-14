#Write a function called has_duplicates that takes a list and returns True
# if there is any element that appears more than once. It should not modify the original list.

def has_duplicates(lst):
    seen = set()
    for item in lst:
        if item in seen:
            return True
        seen.add(item)
    return False

