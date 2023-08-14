#“Recently I had a visit with my mom and we realized that the two digits that make up
# my age when reversed resulted in her age.
# For example, if she’s 73, I’m 37. We wondered how often this has happened over the years
# but we got sidetracked with other topics and we never came up with an answer.
#When I got home I figured out that the digits of our ages have been reversible
# six times so far. I also figured out that if we’re lucky it would happen again
# in a few years, and if we’re really lucky it would happen one more time after that.
# In other words, it would have happened 8 times over all. So the question is, how old am I now?”
#Write a Python program that searches for solutions to this Puzzler. Hint: you might find the
# string method zfill useful.

def is_reversible(age1, age2):
    return age1 % 10 == age2 // 10 and age1 // 10 == age2 % 10

def find_age_pairs():
    count = 0
    for age1 in range(10, 100):
        age2 = int(str(age1)[::-1])
        if is_reversible(age1, age2):
            count += 1
            if count == 8:
                return age1
    return None

def main():
    age = find_age_pairs()
    if age is not None:
        print("The age that satisfies the conditions:", age)
    else:
        print("No solution found.")

if __name__ == "__main__":
    main()