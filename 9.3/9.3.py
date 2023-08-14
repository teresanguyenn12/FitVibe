def avoids(word, forbidden_letters):
    for letter in word:
        if letter in forbidden_letters:
            return False
    return True