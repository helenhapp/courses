import json
from tkinter import *
from tkinter import filedialog

window = Tk()
window.title("Listbox")
window.geometry("420x420")

BG = "#D5F2E4"
window.config(bg=BG)

frame1 = Frame(window, bg=BG)
frame1.pack(pady=10)

entry = Entry(frame1, width=16, font=("Arial", 14))
entry.pack(padx=10, side=LEFT)


def add_word():
    word = entry.get().strip()

    if word != "" and word not in words.get(0, END):
        words.insert(END, word)
        entry.delete(0, END)
        label.config(text=f"Words: {words.size()}")


add_btn = Button(frame1, text="Add", command=add_word, font=("Arial", 14))
add_btn.pack(padx=10, side=LEFT)

words = Listbox(
    window,
    font=("Arial", 14),
    height=8,
    width=25,
    selectbackground="#FBC5BF",
    selectforeground="#EB5012",
    exportselection=False,
)
words.pack(pady=10)


def delete_word():
    selected = words.curselection()

    if len(selected) > 0:
        index = selected[0]
        words.delete(index)
        label.config(text=f"Words: {words.size()}")


delete_btn = Button(
    window,
    text="Delete selected",
    command=delete_word,
    font=("Arial", 14),
)
delete_btn.pack(pady=5)


def save_words():
    all_words = list(words.get(0, END))

    if len(all_words) == 0:
        return

    filepath = filedialog.asksaveasfilename(
        defaultextension=".json",
        filetypes=[("JSON files", "*.json"), ("All files", "*.*")],
    )

    if filepath != "":
        with open(filepath, "w", encoding="utf-8") as file:
            json.dump(all_words, file, ensure_ascii=False, indent=2)


save_btn = Button(
    window,
    text="Save words to JSON",
    command=save_words,
    font=("Arial", 14),
)
save_btn.pack(pady=5)

label = Label(
    window,
    text="Words: 0",
    font=("Arial", 14, "italic bold"),
    fg="green",
    bg=BG,
)
label.pack(pady=10)

window.eval("tk::PlaceWindow . center")
window.mainloop()
