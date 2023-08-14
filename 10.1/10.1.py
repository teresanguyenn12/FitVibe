# Write a function called nested_sum that takes a
# list of lists of integers and adds up the elements from all of the nested lists
def nested_sum(lst):
    total = 0
    for inner_list in lst:
        for num in inner_list:
            total += num
    return total

# Example usage
nested_lists = [[1, 2, 3], [4, 5], [6, 7, 8, 9]]
result = nested_sum(nested_lists)
print("Sum of nested lists:", result)


