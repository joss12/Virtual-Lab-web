export const id = "classes-and-oop";
export const titleEn = "Classes & OOP";
export const titleFr = "Classes et POO";

export const content = {
  en: `# Classes & Object-Oriented Programming

## The Problem Classes Solve

Imagine you're building a banking app. You need to manage 1000 bank accounts. Each account has a balance, an owner, and operations like deposit and withdraw.

Without classes, you'd do this:

\`\`\`python
# Without classes — fragile, repetitive, unorganized
alice_balance = 1000
alice_owner = "Alice"

bob_balance = 500
bob_owner = "Bob"

def deposit(balance, amount):
    return balance + amount

def withdraw(balance, amount):
    if amount > balance:
        print("Insufficient funds")
        return balance
    return balance - amount

alice_balance = deposit(alice_balance, 200)
# Problem: alice_balance and alice_owner are separate variables
# Nothing connects them. Easy to mix up.
# For 1000 accounts: 2000 variables. Chaos.
\`\`\`

With a class, you bundle the data AND the operations that belong together into one neat package:

\`\`\`python
# With classes — organized, reusable, clear
class BankAccount:
    def __init__(self, owner, balance=0):
        self.owner = owner
        self.balance = balance

    def deposit(self, amount):
        self.balance += amount

    def withdraw(self, amount):
        if amount > self.balance:
            print("Insufficient funds")
            return
        self.balance -= amount

alice = BankAccount("Alice", 1000)
bob   = BankAccount("Bob",   500)

alice.deposit(200)
bob.withdraw(100)
# alice and bob are completely independent — no confusion
\`\`\`

## The Mental Model: A Blueprint and Its Buildings

The best analogy for classes and objects is an **architect's blueprint**:

\`\`\`
Blueprint (Class):            Buildings (Objects/Instances):
  Defines what a house          Each actual house built from it
  looks like in general.        is different:
  - has rooms                     - House 1: 3 bedrooms, red door
  - has a door                    - House 2: 5 bedrooms, blue door
  - has windows                   - House 3: 2 bedrooms, white door

The blueprint is not a house.   Each building IS a house.
You can't live in a blueprint.  You can live in a building.
\`\`\`

In Python:
\`\`\`
Class  = the blueprint  (defined once)
Object = a built house  (created as many times as you need)
\`\`\`

## Your First Class

\`\`\`python
class Dog:
    # __init__ is the "constructor" — runs when you create a new Dog
    # self refers to the specific dog being created
    def __init__(self, name, breed, age):
        self.name  = name
        self.breed = breed
        self.age   = age

    def bark(self):
        print(f"{self.name} says: Woof!")

    def describe(self):
        print(f"{self.name} is a {self.age}-year-old {self.breed}.")

    def birthday(self):
        self.age += 1
        print(f"Happy birthday {self.name}! Now {self.age} years old.")

# Create objects (instances) from the class
dog1 = Dog("Rex",   "Labrador", 3)
dog2 = Dog("Bella", "Poodle",   5)

# Each dog is independent
dog1.bark()       # Rex says: Woof!
dog2.bark()       # Bella says: Woof!
dog1.describe()   # Rex is a 3-year-old Labrador.
dog2.describe()   # Bella is a 5-year-old Poodle.

dog1.birthday()   # Happy birthday Rex! Now 4 years old.
print(dog1.age)   # 4
print(dog2.age)   # 5 — Bella is unaffected
\`\`\`

## Understanding self

\`\`\`self\` is the single most confusing thing for beginners. Here's the clear explanation:

\`\`\`python
class Dog:
    def bark(self):
        print(f"{self.name} says: Woof!")

dog1 = Dog("Rex",   "Labrador", 3)
dog2 = Dog("Bella", "Poodle",   5)

dog1.bark()
# Python translates this to: Dog.bark(dog1)
# self = dog1 inside the method

dog2.bark()
# Python translates this to: Dog.bark(dog2)
# self = dog2 inside the method
\`\`\`

\`\`\`
When you call: dog1.bark()
Python secretly does: Dog.bark(dog1)

'self' is just a name for "the specific object this method was called on".
It's not magic — Python passes the object as the first argument automatically.
That's why ALL methods have 'self' as their first parameter.
\`\`\`

## Attributes: Instance vs Class

There are two places to store data in a class:

\`\`\`python
class Car:
    # CLASS attribute — shared by ALL cars
    wheels = 4
    total_cars_made = 0

    def __init__(self, make, model, year):
        # INSTANCE attributes — unique to EACH car
        self.make  = make
        self.model = model
        self.year  = year
        Car.total_cars_made += 1

car1 = Car("Toyota", "Camry",  2020)
car2 = Car("Honda",  "Civic",  2022)
car3 = Car("Ford",   "Mustang",2019)

print(car1.make)
print(car2.make)

print(car1.wheels)
print(car2.wheels)
print(Car.total_cars_made)
\`\`\`

## Methods: The Three Types

\`\`\`python
class Temperature:
    def __init__(self, celsius):
        self.celsius = celsius

    def to_fahrenheit(self):
        return self.celsius * 9/5 + 32

    def describe(self):
        f = self.to_fahrenheit()
        if self.celsius < 0:
            feeling = "freezing"
        elif self.celsius < 20:
            feeling = "cold"
        elif self.celsius < 30:
            feeling = "warm"
        else:
            feeling = "hot"
        return f"{self.celsius}°C / {f:.1f}°F — {feeling}"

    @classmethod
    def from_fahrenheit(cls, fahrenheit):
        celsius = (fahrenheit - 32) * 5/9
        return cls(celsius)

    @staticmethod
    def is_valid(celsius):
        return celsius >= -273.15

t1 = Temperature(25)
print(t1.describe())

t2 = Temperature.from_fahrenheit(98.6)
print(f"{t2.celsius:.1f}°C")

print(Temperature.is_valid(-300))
print(Temperature.is_valid(20))
\`\`\`

## Inheritance — Building on Existing Classes

\`\`\`python
class Animal:
    def __init__(self, name, age):
        self.name = name
        self.age  = age

    def eat(self):
        print(f"{self.name} is eating.")

    def sleep(self):
        print(f"{self.name} is sleeping.")

    def describe(self):
        return f"{self.name} (age {self.age})"

class Dog(Animal):
    def __init__(self, name, age, breed):
        super().__init__(name, age)
        self.breed = breed

    def bark(self):
        print(f"{self.name} says: Woof!")

    def describe(self):
        return f"{self.name} the {self.breed} (age {self.age})"

class Cat(Animal):
    def __init__(self, name, age, indoor):
        super().__init__(name, age)
        self.indoor = indoor

    def meow(self):
        print(f"{self.name} says: Meow!")

    def describe(self):
        location = "indoor" if self.indoor else "outdoor"
        return f"{self.name} the {location} cat (age {self.age})"

dog = Dog("Rex",  3, "Labrador")
cat = Cat("Luna", 2, True)

dog.eat()
cat.sleep()
dog.bark()
cat.meow()

print(dog.describe())
print(cat.describe())
\`\`\`

\`\`\`
Why super().__init__(...) ?

When Dog.__init__ runs, it must also set up the Animal part
(name, age). super().__init__() calls Animal's __init__ to do that.
Without it, self.name and self.age would never be set.

Think of it as: "first do everything the parent does, then do my extra stuff."
\`\`\`

## Special Methods (Dunder Methods)

\`\`\`python
class Book:
    def __init__(self, title, author, pages):
        self.title  = title
        self.author = author
        self.pages  = pages

    def __str__(self):
        return f"'{self.title}' by {self.author}"

    def __repr__(self):
        return f"Book(title={self.title!r}, author={self.author!r}, pages={self.pages})"

    def __len__(self):
        return self.pages

    def __eq__(self, other):
        return self.title == other.title and self.author == other.author

    def __lt__(self, other):
        return self.pages < other.pages

book1 = Book("Python 101",  "Alice", 350)
book2 = Book("Clean Code",  "Bob",   431)
book3 = Book("Python 101",  "Alice", 350)

print(book1)
print(repr(book1))
print(len(book1))
print(book1 == book3)
print(book1 == book2)

books = [book2, book1]
books.sort()
print([b.title for b in books])
\`\`\`

## A Complete Real-World Example

\`\`\`python
class ShoppingCart:
    """A shopping cart that tracks items and calculates totals."""

    def __init__(self, owner):
        self.owner = owner
        self.items = []

    def add_item(self, name, price, quantity=1):
        """Add an item to the cart."""
        for item in self.items:
            if item["name"] == name:
                item["qty"] += quantity
                print(f"Updated {name}: now {item['qty']} in cart.")
                return

        self.items.append({"name": name, "price": price, "qty": quantity})
        print(f"Added {quantity}x {name} @ \${price:.2f}")

    def remove_item(self, name):
        """Remove an item from the cart."""
        self.items = [i for i in self.items if i["name"] != name]
        print(f"Removed {name} from cart.")

    def total(self):
        """Calculate the total price."""
        return sum(i["price"] * i["qty"] for i in self.items)

    def receipt(self):
        """Print a formatted receipt."""
        print(f"\\n{'='*35}")
        print(f"  Cart for: {self.owner}")
        print(f"{'='*35}")

        if not self.items:
            print("  (empty)")

        for item in self.items:
            line_total = item["price"] * item["qty"]
            print(f"  {item['name']:<15} {item['qty']}x \${item['price']:.2f} = \${line_total:.2f}")

        print(f"{'─'*35}")
        print(f"  {'TOTAL':<20} \${self.total():.2f}")
        print(f"{'='*35}")

    def __len__(self):
        return sum(i["qty"] for i in self.items)

    def __str__(self):
        return f"Cart({self.owner}, {len(self)} items, \${self.total():.2f})"


cart = ShoppingCart("Alice")
cart.add_item("Apple",    0.99, 3)
cart.add_item("Bread",    2.49)
cart.add_item("Coffee",   8.99)
cart.add_item("Apple",    0.99, 2)

cart.receipt()

print(f"\\n{cart}")
print(f"Items: {len(cart)}")

cart.remove_item("Bread")
cart.receipt()
\`\`\`

## Common Mistakes to Avoid

\`\`\`python
class Dog:
    def bark():
        print("Woof")

dog = Dog()
dog.bark()

class Dog:
    def bark(self):
        print("Woof")

class Counter:
    def __init__(self):
        self.count = 0

    def increment(self):
        self.count += 1

class Student:
    def __init__(self, name, grades=None):
        self.name   = name
        self.grades = grades if grades is not None else []
\`\`\`

## Quick Reference

\`\`\`python
class MyClass:
    class_var = "shared"

    def __init__(self, x):
        self.x = x

    def method(self):
        return self.x

    @classmethod
    def class_method(cls):
        return cls.class_var

    @staticmethod
    def static_method(a, b):
        return a + b

obj = MyClass(42)
print(obj.x)
print(obj.method())
print(MyClass.class_method())
print(MyClass.static_method(3, 4))

class Child(MyClass):
    def __init__(self, x, y):
        super().__init__(x)
        self.y = y

    def method(self):
        return f"{self.x}, {self.y}"
\`\`\`
`,

  fr: `# Classes et Programmation Orientée Objet

## Le problème que les classes résolvent

Sans classes, gérer des données liées est chaotique — des variables éparpillées partout, rien qui les connecte. Les classes **regroupent les données et les opérations** qui vont ensemble en un seul paquet organisé.

## Le modèle mental : un plan et ses bâtiments

\`\`\`
Plan (Classe) :               Bâtiments (Objets/Instances) :
  Définit ce qu'une maison      Chaque maison construite est
  ressemble en général.         différente :
  - a des pièces                  - Maison 1 : 3 chambres, porte rouge
  - a une porte                   - Maison 2 : 5 chambres, porte bleue
  - a des fenêtres

Le plan n'est pas une maison.   Chaque bâtiment EST une maison.
\`\`\`

## Votre première classe

\`\`\`python
class Chien:
    def __init__(self, nom, race, age):
        self.nom  = nom
        self.race = race
        self.age  = age

    def aboyer(self):
        print(f"{self.nom} dit : Ouaf !")

    def anniversaire(self):
        self.age += 1
        print(f"Joyeux anniversaire {self.nom} ! Maintenant {self.age} ans.")

chien1 = Chien("Rex",   "Labrador", 3)
chien2 = Chien("Bella", "Caniche",  5)

chien1.aboyer()
chien2.aboyer()
chien1.anniversaire()
print(chien2.age)
\`\`\`

## Comprendre self

\`\`\`python
chien1.aboyer()
# Python traduit ceci en : Chien.aboyer(chien1)
# self = chien1 à l'intérieur de la méthode
\`\`\`

## Héritage — Construire sur des classes existantes

\`\`\`python
class Animal:
    def __init__(self, nom, age):
        self.nom = nom
        self.age = age

    def manger(self):
        print(f"{self.nom} mange.")

class Chien(Animal):
    def __init__(self, nom, age, race):
        super().__init__(nom, age)
        self.race = race

    def aboyer(self):
        print(f"{self.nom} dit : Ouaf !")

chien = Chien("Rex", 3, "Labrador")
chien.manger()
chien.aboyer()
\`\`\`

## Erreurs courantes à éviter

\`\`\`python
class Chien:
    def aboyer(self):
        print("Ouaf")

class Compteur:
    def __init__(self):
        self.compte = 0

    def incrementer(self):
        self.compte += 1

class Etudiant:
    def __init__(self, nom, notes=None):
        self.nom   = nom
        self.notes = notes if notes is not None else []
\`\`\`
`,
};

export const starterCode = {
  default: `# Classes & OOP — Practice

class BankAccount:
    def __init__(self, owner, balance=0):
        self.owner   = owner
        self.balance = balance
        self.history = []

    def deposit(self, amount):
        if amount <= 0:
            print("Deposit amount must be positive.")
            return

        self.balance += amount
        self.history.append(f"+\${amount:.2f}")

        print(f"{self.owner} deposited \${amount:.2f}. Balance: \${self.balance:.2f}")

    def withdraw(self, amount):
        if amount <= 0:
            print("Withdrawal amount must be positive.")
            return

        if amount > self.balance:
            print(f"Insufficient funds. Balance: \${self.balance:.2f}")
            return

        self.balance -= amount
        self.history.append(f"-\${amount:.2f}")

        print(f"{self.owner} withdrew \${amount:.2f}. Balance: \${self.balance:.2f}")

    def statement(self):
        print(f"\\n=== Account: {self.owner} ===")

        for entry in self.history:
            print(f"  {entry}")

        print(f"  Balance: \${self.balance:.2f}")

    def __str__(self):
        return f"BankAccount({self.owner}, \${self.balance:.2f})"


alice = BankAccount("Alice", 1000)
bob   = BankAccount("Bob", 500)

alice.deposit(250)
alice.withdraw(100)
alice.withdraw(2000)

bob.deposit(1000)
bob.withdraw(300)

alice.statement()
bob.statement()

print(alice)
print(bob)
`,
};

export const exerciseEn = `Build a Library system using classes.

Create a class 'Book' with:
  - title, author, year, available (True by default)
  - checkout() method — marks book as unavailable
  - return_book() method — marks book as available
  - __str__ method — readable description

Create a class 'Library' with:
  - name, books (empty list)
  - add_book(book) — add a Book object
  - find_by_author(author) — return all books by that author
  - available_books() — return all books currently available
  - show_catalog() — print all books with their status

Test: create a library, add 5+ books, check out 2, show catalog.`;

export const exerciseFr = `Construisez un système de bibliothèque avec des classes.

Créez une classe 'Livre' avec :
  - titre, auteur, annee, disponible (True par défaut)
  - methode emprunter() — marque le livre comme indisponible
  - methode retourner() — marque le livre comme disponible
  - methode __str__ — description lisible

Créez une classe 'Bibliotheque' avec :
  - nom, livres (liste vide)
  - ajouter_livre(livre) — ajouter un objet Livre
  - chercher_par_auteur(auteur) — retourner tous les livres de cet auteur
  - livres_disponibles() — retourner tous les livres disponibles
  - afficher_catalogue() — afficher tous les livres avec leur statut

Test : créez une bibliothèque, ajoutez 5+ livres, empruntez-en 2, affichez le catalogue.`;

export const solutionCode = {
  default: `class Book:
    def __init__(self, title, author, year):
        self.title     = title
        self.author    = author
        self.year      = year
        self.available = True

    def checkout(self):
        if not self.available:
            print(f"'{self.title}' is already checked out.")
            return False

        self.available = False
        print(f"'{self.title}' checked out.")
        return True

    def return_book(self):
        if self.available:
            print(f"'{self.title}' was not checked out.")
            return

        self.available = True
        print(f"'{self.title}' returned.")

    def __str__(self):
        status = "available" if self.available else "checked out"
        return f"'{self.title}' by {self.author} ({self.year}) — {status}"


class Library:
    def __init__(self, name):
        self.name  = name
        self.books = []

    def add_book(self, book):
        self.books.append(book)
        print(f"Added: {book.title}")

    def find_by_author(self, author):
        return [b for b in self.books if b.author.lower() == author.lower()]

    def available_books(self):
        return [b for b in self.books if b.available]

    def show_catalog(self):
        print(f"\\n=== {self.name} ===")

        if not self.books:
            print("  No books.")
            return

        for book in self.books:
            status = "✓" if book.available else "✗"
            print(f"  [{status}] {book}")

        avail = len(self.available_books())
        print(f"  {avail}/{len(self.books)} available")


lib = Library("City Library")

lib.add_book(Book("Python 101", "Alice Smith", 2022))
lib.add_book(Book("Clean Code", "Bob Jones", 2008))
lib.add_book(Book("The Pragmatic Dev", "Alice Smith", 2019))
lib.add_book(Book("Design Patterns", "Carol White", 1994))
lib.add_book(Book("Fluent Python", "Bob Jones", 2022))

lib.show_catalog()

lib.books[0].checkout()
lib.books[2].checkout()

lib.show_catalog()

print("\\nBooks by Alice Smith:")

for book in lib.find_by_author("Alice Smith"):
    print(f"  {book}")
`,
};

export const quiz = {
  en: [
    {
      question: "What is the purpose of __init__ in a Python class?",
      options: [
        "It runs when the class is defined — like a setup function for the class itself",
        "It is the constructor — it runs automatically when you create a new object, setting up that object's initial data.",
        "It is optional and only needed when you want default values",
        "It defines class-level attributes shared by all instances",
      ],
      correct: 1,
    },
    {
      question:
        "Why does every instance method have 'self' as its first parameter?",
      options: [
        "It is just a convention with no technical meaning",
        "Python automatically passes the current object as the first argument. self receives that object.",
        "self allows the method to call other methods in the class",
        "self is required by Python's syntax but serves no logical purpose",
      ],
      correct: 1,
    },
    {
      question: "What does super().__init__(...) do in a child class?",
      options: [
        "It creates a new instance of the parent class",
        "It calls the parent class's __init__ method to set up inherited attributes.",
        "It imports all methods from the parent class",
        "It prevents the child class from overriding the parent's methods",
      ],
      correct: 1,
    },
    {
      question:
        "What is the difference between a class attribute and an instance attribute?",
      options: [
        "Class attributes are faster to access than instance attributes",
        "A class attribute is shared by all instances. An instance attribute belongs to one object.",
        "Instance attributes must be strings, class attributes can be any type",
        "There is no difference — both are stored the same way",
      ],
      correct: 1,
    },
    {
      question:
        "Why is using a mutable default argument like def __init__(self, items=[]) dangerous?",
      options: [
        "Lists cannot be used as default arguments in Python",
        "The default list is created once and shared across instances.",
        "It causes a syntax error in Python 3",
        "It only causes problems when the list has more than 10 items",
      ],
      correct: 1,
    },
  ],

  fr: [
    {
      question: "Quel est le but de __init__ dans une classe Python ?",
      options: [
        "Il s'exécute quand la classe est définie",
        "C'est le constructeur — il s'exécute automatiquement quand vous créez un nouvel objet.",
        "Il est optionnel",
        "Il définit les attributs de classe partagés",
      ],
      correct: 1,
    },
    {
      question:
        "Pourquoi chaque méthode d'instance a-t-elle 'self' comme premier paramètre ?",
      options: [
        "C'est juste une convention",
        "Python passe automatiquement l'objet actuel comme premier argument. self reçoit cet objet.",
        "self permet à la méthode d'appeler d'autres méthodes",
        "self n'a aucun but logique",
      ],
      correct: 1,
    },
    {
      question: "Que fait super().__init__(...) dans une classe enfant ?",
      options: [
        "Cela crée une nouvelle instance de la classe parente",
        "Cela appelle la méthode __init__ de la classe parente.",
        "Cela importe toutes les méthodes",
        "Cela empêche la classe enfant de remplacer les méthodes",
      ],
      correct: 1,
    },
    {
      question:
        "Quelle est la différence entre un attribut de classe et un attribut d'instance ?",
      options: [
        "Les attributs de classe sont plus rapides",
        "Un attribut de classe est partagé. Un attribut d'instance appartient à un seul objet.",
        "Les attributs d'instance doivent être des chaînes",
        "Il n'y a pas de différence",
      ],
      correct: 1,
    },
    {
      question:
        "Pourquoi utiliser un argument par défaut mutable comme def __init__(self, items=[]) est-il dangereux ?",
      options: [
        "Les listes ne peuvent pas être utilisées",
        "La liste par défaut est créée une seule fois et partagée entre les instances.",
        "Cela cause une erreur de syntaxe",
        "Cela ne cause des problèmes qu'avec plus de 10 éléments",
      ],
      correct: 1,
    },
  ],
};
