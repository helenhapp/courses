import json


def make_new_score():
    name = input("Name: ")
    while name == "":
        name = input("Please enter the name: ")

    score = input("Score: ")
    try:
        score = int(score)
    except ValueError:
        print("That's not an integer!")
        score = None

    new_score = {"name": name, "score": score}

    return new_score


def add_new_score(file_name):
    with open(file_name, "r", encoding="utf-8") as file:
        scores = json.load(file)

    new_score = make_new_score()
    scores.append(new_score)

    with open(file_name, "w", encoding="utf-8") as file:
        json.dump(scores, file, ensure_ascii=False, indent=4)
        print("The file was successfully updated!")


add_new_score("scores.json")
