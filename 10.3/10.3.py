# Write a function called middle that takes a list
#and returns a new list that contains all but the first and last elements.



def middle(lst):
    return lst[1:-1]

original_list = [1,2,3,4,5]
result = middle(original_list)
print("Middle elements: ",result)



