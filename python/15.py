age_input = input("Enter your age: ")
              
try:
    age = int(age_input)
except ValueError:
    print("It's not an integer!")
    age = None
 
print(f"User's age: {age}")