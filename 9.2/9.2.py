def has_no_e(word):
    for letter in word:
        if letter == 'e':
            return False
    return True
print(has_no_e("hello"))