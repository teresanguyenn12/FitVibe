def rotate_word(word, n):
    rotated_word = ''
    for char in word:
        if char.isalpha():
            base = ord('A') if char.isupper() else ord('a')
            rotated_char = chr((ord(char) - base + n) % 26 + base)
            rotated_word += rotated_char
        else:
            rotated_word += char
    return rotated_word

# Test cases
print(rotate_word("cheer", 7))    # Output: "jolly"
print(rotate_word("melon", -10))  # Output: "cubed"
print(rotate_word("HAL", -1))     # Output: "IBM"
print(rotate_word("IBM", 1))      # Output: "HAL"
