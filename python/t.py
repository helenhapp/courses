from tkinter import *

window = Tk()
window.geometry("300x200")


l = Label(window, text="name: ")
l.pack(side=LEFT)

e = Entry(window, font=("Arial", 14), width=20)
e.pack(side=LEFT)

window.mainloop()