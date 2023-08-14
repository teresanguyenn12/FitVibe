def count():
    fin = open("words.txt")
    for line in fin:
        words = line.strip()
        if len(words) >= 20:
            print(words)
