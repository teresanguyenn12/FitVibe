# Write a program that reads a file, breaks each line into words,
# strips whitespace and punctuation from the words, and converts them to lowercase.

import string

def process_line(line):
    line = line.strip()
    line = line.translate()
    line = line.lower()

def process_file(file_name):
    with open(file_name, 'r') as file:
        for line in file:
            processed_line = process_line(line)
            words = processed_line.split()
            print(words)