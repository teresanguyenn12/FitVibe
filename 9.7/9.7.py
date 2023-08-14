def double_letters(word):
    for i in range(len(word) - 5):
        if word[i] == word[i + 1] and word[i + 2] == word[i + 3] and word[i + 4] == word[i + 5]:
            return True
    return False

def find_word(file_path):
    with open(file_path, 'r') as file:
        words = file.read().split()

    for word in words:
        if double_letters(word):
            return word

    return None

def main():
    file_path = "words.txt"
    word_with_three_consecutive_double_letters = find_word(file_path)

    if word_with_three_consecutive_double_letters:
        print(f"The word with three consecutive double letters is: {word_with_three_consecutive_double_letters}")
    else:
        print("No word with three consecutive double letters found in the file.")

if __name__ == "__main__":
    main()
