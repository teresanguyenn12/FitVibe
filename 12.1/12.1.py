#Write a function called most_frequent that takes a string and prints the
# let- ters in decreasing order of frequency.
# Find text samples from several different languages and see how
# letter frequency varies between languages.

def most_frequent(text):
    letter_freq = {} #create a dictionary
    for char in text.lower(): #converts all characters to lowercase
        if char.isalpha(): #use method isalpha() to check if the current char is an alphabetical
            letter_freq[char] = letter_freq.get(char, 0) + 1

    sorted_freq = sorted(letter_freq.items(), key=lambda item: item[1], reverse=True)
    #create a sorted list containing theitems(key-value pairs) from letter_freq dict.
    #the 'key' argument is set to a lambda function that returns the frequency value of each item.
    # 'reverse=Trie' sorts the list in descending order of frequencies.
    for char, freq in sorted_freq:
        print(f"'{char}':{freq}")