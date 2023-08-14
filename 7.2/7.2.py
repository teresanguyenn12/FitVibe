def eval_loop():
    result = None
    while True:
        user_input = input("Enter a Python expression (or 'done' to exit): ")
        if user_input == 'done':
            break
        try:
            result = eval(user_input)
            print(result)
        except Exception as e:
            print("Error:", e)
    return result

last_result = eval_loop()
print("Last result:", last_result)
