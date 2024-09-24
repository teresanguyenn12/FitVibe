# Write a function named choose_from_hist that takes a histogram as
# defined in Section 11.2 and returns a random value from the histogram,
# chosen with probability in proportion to frequency. For example, for this histogram:
#  >>> t = ['a', 'a', 'b']
# >>> hist = histogram(t)
# >>> hist
# {'a': 2, 'b': 1}
# your function should return 'a' with probability 2/3 and 'b' with probability 1/3.

import random

def choose_from_hist(hist):
    total_freq = sum(hist.values()) #calculate the total frequency
    random_num = random.randint(1, total_freq) #generate a random number between 1 and 'total_freq'

    for word, freq in hist.items():
        random_num -= freq #random_num is decremented by the frequency of the current word
        if random_num <= 0:
            return word

histogram = {'a':2, 'b':1}
chosen_word = choose_from_hist(histogram)
print("Chosen word:", chosen_word)