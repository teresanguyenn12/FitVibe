# Two words are anagrams if you can rearrange the letters from one to spell the other.
# Write a function called is_anagram that takes two strings and returns True if they are anagrams.


def is_anagram(word1, word2)
    return sorted(word1) == sorted(word2)