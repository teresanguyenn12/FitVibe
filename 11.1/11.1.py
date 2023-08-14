#Write a function that reads the words in words.txt and
# stores them as keys in a dictionary. It doesn’t matter what the
# values are. Then you can use the in operator as a fast way to
# check whether a string is in the dictionary.

def word_dictionary(filename):
    word_dict{} #create a dictionary
    with open(filename, 'r') as file: #open the file in read mode
        for line in file:
            word = line.strip() #removes any leading or trailing whitespace characters from the file
            word_dict[word] = None
        return word_dict