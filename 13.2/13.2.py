#Go to Project Gutenberg (http: // gutenberg. org ) and download your
# favorite out-of-copyright book in plain text format.
#Modify your program from the previous exercise to read the book you downloaded,
# skip over the header information at the beginning of the file, and process
# the rest of the words as before.
#Then modify the program to count the total number of words in the book,
#and the number of times each word is used.
#Print the number of different words used in the book

import string

def process_line(line, word_count):
    # Strip whitespace and punctuation, convert to lowercase
    line = line.strip()
    line = line.translate(str.maketrans("", "", string.punctuation))
    line = line.lower()
    words = line.split()

    for word in words:
        word_count[word] = word_count.get(word, 0) + 1

def process_file(file_name):
    word_count = {}
    skip_header = True

    with open(file_name, 'r') as file:
        for line in file:
            processed_line = process_line(line)
            words = processed_line.split()
            print(words)
    
# Replace 'input.txt' with the name of your file
process_file('input.txt')