from tkinter import *

window = Tk()
window.title("Pizza Builder")
window.geometry("350x300")


def calculate_price():
    price = 10.00  # базова ціна

    # Перевіряємо, чи обрано пепероні
    if pep_var.get() == True:
        price = price + 2.00

    # Перевіряємо, чи обрано гриби
    if mush_var.get() == True:
        price = price + 1.00

    price_label.config(text="Total: $" + str(price))


# Змінні для прапорців
pep_var = BooleanVar()
mush_var = BooleanVar()

# Віджети
title_label = Label(window, text="Pick Your Toppings", font=("Arial", 12, "bold"))
title_label.pack(pady=10)

pep_box = Checkbutton(
    window,
    text="Pepperoni (+$2.00)",
    variable=pep_var,
    command=calculate_price,
)
pep_box.pack(anchor="w", padx=20)

mush_box = Checkbutton(
    window,
    text="Mushrooms (+$1.00)",
    variable=mush_var,
    command=calculate_price,
)
mush_box.pack(anchor="w", padx=20)



price_label = Label(
    window,
    text="Total: $10.00",
    font=("Arial", 14, "bold"),
    fg="green",
)
price_label.pack(pady=20)

window.eval("tk::PlaceWindow . center")
window.mainloop()
