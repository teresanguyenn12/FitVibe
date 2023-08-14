def use_only(word, available):
    for letter in word:
        if letter not in available:
            return False
        return True
