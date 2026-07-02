export const id = "objects";
export const titleEn = "Objects";
export const titleFr = "Objets";

export const content = {
  en: `# Objects

## What Is an Object and Why Does It Exist?

Arrays store ordered lists of values — they're great for collections of the same kind of thing (a list of scores, a list of names). But real-world data doesn't always fit a list. A user isn't just a collection of values — they're a collection of **named** values that belong together.

\`\`\`javascript
// Storing a user with an array — fragile and confusing
const user = ["Alice", 30, "alice@example.com", "Paris", true];

// Storing a user with an object — self-documenting
const user2 = {
    name:    "Alice",
    age:     30,
    email:   "alice@example.com",
    city:    "Paris",
    active:  true,
};
\`\`\`

**An object is a collection of key-value pairs** where each key is a string and each value can be anything.

## Creating Objects

\`\`\`javascript
const person = {
    name:  "Alice",
    age:   30,
    city:  "Paris",
};

const config = {};
config.theme = "dark";
config.language = "en";
config.fontSize = 16;

function Person(name, age) {
    this.name = name;
    this.age = age;
}

const alice = new Person("Alice", 30);
\`\`\`

## Reading and Writing Properties

\`\`\`javascript
const user = {
    name: "Alice",
    age: 30,
    "home city": "Paris",
};

console.log(user.name);
console.log(user.age);

user.age = 31;
user.email = "alice@ex.com";

console.log(user["home city"]);

const field = "name";
console.log(user[field]);

function getValue(obj, key) {
    return obj[key];
}

getValue(user, "name");
getValue(user, "age");
\`\`\`

## Checking If a Property Exists

\`\`\`javascript
const user = { name: "Alice", age: 30, score: 0 };

console.log("name" in user);
console.log("email" in user);
console.log("score" in user);

const obj = { x: undefined };

console.log("x" in obj);
console.log(obj.x !== undefined);

console.log(user.hasOwnProperty("name"));
console.log(Object.hasOwn(user, "name"));
\`\`\`

## Deleting Properties

\`\`\`javascript
const user = { name: "Alice", age: 30, tempToken: "abc123" };

delete user.tempToken;

console.log(user);
console.log("tempToken" in user);
\`\`\`

## Methods — Functions Inside Objects

\`\`\`javascript
const calculator = {
    value: 0,

    add(n) {
        this.value += n;
        return this;
    },

    subtract(n) {
        this.value -= n;
        return this;
    },

    multiply(n) {
        this.value *= n;
        return this;
    },

    reset() {
        this.value = 0;
        return this;
    },

    result() {
        return this.value;
    },
};

const answer = calculator
    .add(10)
    .multiply(3)
    .subtract(5)
    .result();

console.log(answer);
\`\`\`

## this — The Most Confusing Thing in JavaScript

\`\`\`javascript
const user = {
    name: "Alice",

    greet() {
        console.log(\`Hello, I'm \${this.name}\`);
    },

    greetArrow: () => {
        console.log(\`Hello, I'm \${this.name}\`);
    },
};

user.greet();
user.greetArrow();
\`\`\`

\`\`\`javascript
const timer = {
    seconds: 0,
    name: "My Timer",

    start() {
        setInterval(() => {
            this.seconds++;
            console.log(\`\${this.name}: \${this.seconds}s\`);
        }, 1000);
    },
};
\`\`\`

## Object Destructuring

\`\`\`javascript
const user = {
    name: "Alice",
    age: 30,
    email: "alice@example.com",
    address: {
        city: "Paris",
        country: "France",
    },
};

const { name, age, email } = user;

const { name: userName, age: userAge } = user;

const { name: n, role = "user", score = 0 } = user;

const {
    address: { city, country },
} = user;

const { name: personName, ...rest } = user;

function displayUser({ name, age, email, role = "user" }) {
    console.log(\`\${name} (age \${age}) — \${email} [\${role}]\`);
}

displayUser(user);
\`\`\`

## Spread and Object Merging

\`\`\`javascript
const defaults = {
    theme: "light",
    fontSize: 14,
    language: "en",
    notifications: true,
};

const userPrefs = {
    theme: "dark",
    fontSize: 18,
};

const config = { ...defaults, ...userPrefs };

const config2 = { ...userPrefs, ...defaults };

const updatedUser = { ...user, age: 31, role: "admin" };
\`\`\`

## Object.keys, Object.values, Object.entries

\`\`\`javascript
const scores = {
    Alice: 92,
    Bob: 78,
    Carol: 95,
    David: 61,
};

console.log(Object.keys(scores));
console.log(Object.values(scores));
console.log(Object.entries(scores));

const avg =
    Object.values(scores).reduce((s, n) => s + n, 0) /
    Object.keys(scores).length;

console.log(\`Average: \${avg}\`);

const passing = Object.entries(scores)
    .filter(([name, score]) => score >= 80)
    .map(([name, score]) => name);

console.log(\`Passing: \${passing.join(", ")}\`);

const ranked = Object.entries(scores)
    .sort(([, a], [, b]) => b - a)
    .map(([name, score], i) => \`\${i + 1}. \${name}: \${score}\`);

console.log(ranked.join("\\n"));

const doubled = Object.fromEntries(
    Object.entries(scores).map(([name, score]) => [name, score * 2])
);

console.log(doubled);
\`\`\`

## Computed Property Names

\`\`\`javascript
const field = "name";
const value = "Alice";

const obj = {
    [field]: value,
};

console.log(obj);

function createUser(key, val) {
    return { [key]: val };
}

createUser("email", "alice@ex.com");
createUser("age", 30);

const env = "production";

const config = {
    [env + "_url"]: "https://api.example.com",
    [env + "_timeout"]: 5000,
};

console.log(config);
\`\`\`

## Optional Chaining

\`\`\`javascript
const user = {
    name: "Alice",
    address: {
        city: "Paris",
    },
};

console.log(user.contact?.email);
console.log(user.address?.city);
console.log(user.address?.country);
console.log(user.address?.zip?.code);

const str = null;

console.log(str?.toUpperCase());
console.log(str?.length);

const users = null;

console.log(users?.[0]);

const city = user.address?.city ?? "Unknown city";
console.log(city);

const zip = user.address?.zip?.code ?? "No zip";
console.log(zip);

function getUserCity(response) {
    return response?.data?.user?.address?.city ?? "City not available";
}
\`\`\`

## Object Patterns

### Pattern 1: Configuration Object

\`\`\`javascript
function createButton({
    text,
    color = "blue",
    size = "medium",
    disabled = false,
    onClick,
}) {
    console.log(
        \`Button: \${text} [\${color}, \${size}\${disabled ? ", disabled" : ""}]\`
    );
}

createButton({
    text: "Submit",
    color: "green",
    onClick: () => console.log("submitted!"),
});
\`\`\`

### Pattern 2: Object as Namespace

\`\`\`javascript
const StringUtils = {
    capitalize: (str) => str.charAt(0).toUpperCase() + str.slice(1),
    truncate: (str, len) =>
        str.length > len ? str.slice(0, len) + "..." : str,
    isPalindrome: (str) => {
        const cleaned = str.toLowerCase().replace(/[^a-z]/g, "");
        return cleaned === cleaned.split("").reverse().join("");
    },
};

const MathUtils = {
    clamp: (value, min, max) => Math.min(Math.max(value, min), max),
    lerp: (start, end, t) => start + (end - start) * t,
    range: (start, end, step = 1) =>
        Array.from(
            { length: Math.ceil((end - start) / step) },
            (_, i) => start + i * step
        ),
};

console.log(StringUtils.capitalize("hello"));
console.log(StringUtils.truncate("Long text...", 8));
console.log(MathUtils.clamp(150, 0, 100));
console.log(MathUtils.range(0, 10, 2));
\`\`\`

### Pattern 3: Immutable Updates

\`\`\`javascript
const user = { name: "Alice", age: 30, role: "user" };

const updatedUser = { ...user, age: 31, role: "admin" };

const state = {
    user: {
        name: "Alice",
        settings: {
            theme: "light",
        },
    },
    count: 0,
};

const newState = {
    ...state,
    user: {
        ...state.user,
        settings: {
            ...state.user.settings,
            theme: "dark",
        },
    },
};

console.log(state.user.settings.theme);
console.log(newState.user.settings.theme);
\`\`\`

## Common Mistakes to Avoid

\`\`\`javascript
const counter = {
    count: 0,
    increment: () => {
        this.count++;
    },
};

counter.increment();
console.log(counter.count);

const counter2 = {
    count: 0,
    increment() {
        this.count++;
    },
};

const a = { x: 1 };
const b = a;

b.x = 99;

console.log(a.x);

const c = { ...a };

c.x = 100;

console.log(a.x);

const original = {
    name: "Alice",
    scores: [85, 92, 78],
};

const copy = { ...original };

copy.scores.push(100);

console.log(original.scores);

const deepCopy = {
    ...original,
    scores: [...original.scores],
};

deepCopy.scores.push(200);

console.log(original.scores);

const realDeepCopy = structuredClone(original);
\`\`\`
`,

  fr: `# Objets

## Qu'est-ce qu'un objet ?

Un objet est une **collection de paires clé-valeur** où chaque clé a une étiquette significative.

## Accès aux propriétés

\`\`\`javascript
const user = {
    name: "Alice",
    age: 30,
    "home city": "Paris",
};

console.log(user.name);

user.age = 31;

console.log(user["home city"]);

const champ = "name";

console.log(user[champ]);
\`\`\`

## this — La chose la plus confuse en JavaScript

\`\`\`javascript
const user = {
    name: "Alice",

    saluer() {
        console.log(\`Bonjour, je suis \${this.name}\`);
    },

    saluerFleche: () => {
        console.log(\`Bonjour, je suis \${this.name}\`);
    },
};

user.saluer();
user.saluerFleche();
\`\`\`

## Déstructuration d'objets

\`\`\`javascript
const user = {
    name: "Alice",
    age: 30,
    email: "alice@ex.com",
    role: "user",
};

const { name, age, email } = user;

const { name: nomUtilisateur } = user;

const { name: n, role = "user", score = 0 } = user;

function afficherUser({ name, age, role = "user" }) {
    console.log(\`\${name} (\${age}) [\${role}]\`);
}
\`\`\`

## Chaînage optionnel

\`\`\`javascript
const user = {
    name: "Alice",
    address: {
        city: "Paris",
    },
};

console.log(user.contact?.email);
console.log(user.address?.city);

const ville = user.address?.city ?? "Ville inconnue";

console.log(ville);
\`\`\`

## Erreur courante : référence vs valeur

\`\`\`javascript
const a = { x: 1 };
const b = a;

b.x = 99;

console.log(a.x);

const c = { ...a };

c.x = 100;

console.log(a.x);
\`\`\`
`,
};

export const starterCode = {
  default: `// Objects — Practice

// --- 1. Build and access ---
const product = {
    id: "PRD-001",
    name: "Mechanical Keyboard",
    price: 89.99,
    inStock: true,
    tags: ["tech", "peripherals", "home-office"],
    specs: {
        brand: "KeyTech",
        weight: "1.2kg",
        color: "Space Gray",
    },
};

console.log("=== Product Info ===");
console.log("Name:", product.name);
console.log("Price: $" + product.price);
console.log("In stock:", product.inStock);
console.log("First tag:", product.tags[0]);
console.log("Brand:", product.specs.brand);

// Dynamic key access
const fields = ["name", "price", "inStock"];

fields.forEach((f) => console.log(\`  \${f}: \${product[f]}\`));

// --- 2. Object.entries + chaining ---
const inventory = {
    Laptop: { price: 999, qty: 5 },
    Phone: { price: 699, qty: 12 },
    Tablet: { price: 499, qty: 0 },
    Monitor: { price: 349, qty: 3 },
};

console.log("\\n=== Inventory Analysis ===");

const inStock = Object.entries(inventory)
    .filter(([, item]) => item.qty > 0)
    .map(([name, item]) => \`\${name} ($\${item.price}) × \${item.qty}\`);

console.log("In stock:");

inStock.forEach((i) => console.log("  " + i));

const totalValue = Object.values(inventory).reduce(
    (sum, item) => sum + item.price * item.qty,
    0
);

console.log(\`Total inventory value: $\${totalValue.toLocaleString()}\`);

// --- 3. Immutable update ---
const user = {
    name: "Alice",
    age: 30,
    role: "user",
    score: 850,
};

const promoted = {
    ...user,
    role: "admin",
    score: user.score + 150,
};

console.log("\\n=== Immutable Update ===");
console.log("Original:", user);
console.log("Promoted:", promoted);
console.log("Same object?", user === promoted);

// --- 4. Optional chaining ---
const users = [
    {
        name: "Alice",
        address: {
            city: "Paris",
            zip: "75001",
        },
    },
    {
        name: "Bob",
        address: null,
    },
    {
        name: "Carol",
    },
];

console.log("\\n=== Optional Chaining ===");

users.forEach((u) => {
    const city = u.address?.city ?? "Unknown";
    const zip = u.address?.zip ?? "N/A";

    console.log(\`  \${u.name}: \${city} (\${zip})\`);
});
`,
};

export const exerciseEn = `Object mastery challenge.

1. Write a function 'groupBy(array, key)' that groups an array of objects
   by the value of a given key.

2. Write a function 'pick(obj, keys)' that returns a new object
   with only the specified keys.

3. Write a function 'deepMerge(target, source)' that merges two objects
   deeply — nested objects are merged, not overwritten.

4. Write 'flattenObject(obj, prefix="")' that flattens a nested object
   into dot-notation keys.`;

export const exerciseFr = `Défi de maîtrise des objets.

1. Écrivez 'grouperPar(tableau, cle)' qui groupe un tableau d'objets
   par la valeur d'une clé donnée.

2. Écrivez 'choisir(obj, cles)' qui retourne un nouvel objet
   avec seulement les clés spécifiées.

3. Écrivez 'fusionnerProfond(cible, source)' qui fusionne deux objets
   en profondeur — les objets imbriqués sont fusionnés, pas écrasés.

4. Écrivez 'aplatirObjet(obj, prefixe="")' qui aplatit un objet imbriqué
   en clés avec notation pointée.`;

export const solutionCode = {
  default: `// 1. groupBy
function groupBy(array, key) {
    return array.reduce((groups, item) => {
        const groupKey = item[key];

        if (!groups[groupKey]) {
            groups[groupKey] = [];
        }

        groups[groupKey].push(item);

        return groups;
    }, {});
}

const employees = [
    { dept: "Engineering", name: "Alice", salary: 95000 },
    { dept: "Marketing", name: "Bob", salary: 72000 },
    { dept: "Engineering", name: "Carol", salary: 105000 },
    { dept: "Marketing", name: "David", salary: 68000 },
    { dept: "HR", name: "Eve", salary: 65000 },
];

const byDept = groupBy(employees, "dept");

console.log("=== groupBy ===");

Object.entries(byDept).forEach(([dept, people]) => {
    console.log(\`  \${dept}: \${people.map((p) => p.name).join(", ")}\`);
});

// 2. pick
function pick(obj, keys) {
    return Object.fromEntries(
        keys.filter((k) => k in obj).map((k) => [k, obj[k]])
    );
}

const user = {
    name: "Alice",
    age: 30,
    email: "a@ex.com",
    role: "admin",
    password: "secret",
};

const safe = pick(user, ["name", "email", "role"]);

console.log("\\n=== pick ===");
console.log(safe);

// 3. deepMerge
function deepMerge(target, source) {
    const result = { ...target };

    for (const key in source) {
        if (
            source[key] !== null &&
            typeof source[key] === "object" &&
            !Array.isArray(source[key]) &&
            typeof target[key] === "object" &&
            target[key] !== null
        ) {
            result[key] = deepMerge(target[key], source[key]);
        } else {
            result[key] = source[key];
        }
    }

    return result;
}

const base = {
    a: 1,
    b: {
        x: 1,
        y: 2,
    },
    c: [1, 2],
};

const updates = {
    b: {
        y: 99,
        z: 3,
    },
    d: 4,
};

console.log("\\n=== deepMerge ===");
console.log(deepMerge(base, updates));

// 4. flattenObject
function flattenObject(obj, prefix = "") {
    return Object.entries(obj).reduce((flat, [key, value]) => {
        const fullKey = prefix ? \`\${prefix}.\${key}\` : key;

        if (
            value !== null &&
            typeof value === "object" &&
            !Array.isArray(value)
        ) {
            Object.assign(flat, flattenObject(value, fullKey));
        } else {
            flat[fullKey] = value;
        }

        return flat;
    }, {});
}

const nested = {
    user: {
        name: "Alice",
        address: {
            city: "Paris",
            zip: "75001",
        },
    },
    score: 95,
    tags: ["a", "b"],
};

console.log("\\n=== flattenObject ===");
console.log(flattenObject(nested));
`,
};

export const quiz = {
  en: [
    {
      question:
        "What is the difference between dot notation and bracket notation for object access?",
      options: [
        "Dot notation is faster at runtime than bracket notation",
        "Dot notation (obj.key) works when the key is a valid identifier known at write time. Bracket notation (obj[key]) is required for keys with special characters, keys with spaces, and most importantly when the key is stored in a VARIABLE.",
        "Bracket notation creates a copy of the value, dot notation returns a reference",
        "Dot notation only works for string values, bracket notation for all types",
      ],
      correct: 1,
    },
    {
      question:
        "Why should you almost never use arrow functions as object methods?",
      options: [
        "Arrow functions are slower than regular functions as object methods",
        "Arrow functions inherit 'this' from the lexical scope where they are defined, not from the object they belong to.",
        "Arrow functions cannot access other properties of the same object",
        "Arrow functions as object methods cannot accept parameters",
      ],
      correct: 1,
    },
    {
      question:
        "What does const copy = { ...original } do when original has a nested array?",
      options: [
        "It creates a complete deep copy — all nested values are independent",
        "It creates a shallow copy — top-level properties are copied, but nested objects and arrays are copied by reference.",
        "It throws an error — spread cannot copy objects with nested arrays",
        "The nested array is automatically serialized to a string to enable copying",
      ],
      correct: 1,
    },
    {
      question:
        "What does optional chaining (?.) return when the accessed property doesn't exist?",
      options: [
        "It throws a TypeError with a helpful message",
        "It returns undefined instead of throwing a TypeError.",
        "It returns null to indicate the property is missing",
        "It returns false to indicate the access failed",
      ],
      correct: 1,
    },
    {
      question: "What does Object.entries(obj) return and why is it useful?",
      options: [
        "It returns the number of properties in the object",
        "It returns an array of [key, value] pairs, enabling array methods like map, filter, reduce, and sort on object properties.",
        "It returns only the keys of the object as a string",
        "It returns a copy of the object in a different format",
      ],
      correct: 1,
    },
  ],

  fr: [
    {
      question:
        "Quelle est la différence entre la notation pointée et la notation crochet ?",
      options: [
        "La notation pointée est plus rapide à l'exécution",
        "La notation pointée fonctionne quand la clé est connue. La notation crochet est nécessaire pour les clés dynamiques ou avec caractères spéciaux.",
        "La notation crochet crée une copie, la notation pointée retourne une référence",
        "La notation pointée ne fonctionne que pour les valeurs chaînes",
      ],
      correct: 1,
    },
    {
      question:
        "Pourquoi ne faut-il presque jamais utiliser des fonctions fléchées comme méthodes d'objet ?",
      options: [
        "Les fonctions fléchées sont plus lentes que les fonctions régulières",
        "Les fonctions fléchées héritent de 'this' de la portée lexicale où elles sont définies, pas de l'objet.",
        "Les fonctions fléchées ne peuvent pas accéder aux autres propriétés du même objet",
        "Les fonctions fléchées ne peuvent pas accepter de paramètres",
      ],
      correct: 1,
    },
    {
      question:
        "Que fait const copie = { ...original } quand original a un tableau imbriqué ?",
      options: [
        "Cela crée une copie profonde complète",
        "Cela crée une copie superficielle : les objets et tableaux imbriqués restent partagés par référence.",
        "Cela lance une erreur",
        "Le tableau imbriqué est automatiquement sérialisé en chaîne",
      ],
      correct: 1,
    },
    {
      question:
        "Que retourne le chaînage optionnel (?.) quand la propriété n'existe pas ?",
      options: [
        "Il lance une TypeError",
        "Il retourne undefined au lieu de lancer une erreur.",
        "Il retourne null",
        "Il retourne false",
      ],
      correct: 1,
    },
    {
      question: "Que retourne Object.entries(obj) et pourquoi est-ce utile ?",
      options: [
        "Cela retourne le nombre de propriétés",
        "Cela retourne un tableau de paires [clé, valeur], permettant d'utiliser map, filter, reduce et sort.",
        "Cela retourne seulement les clés",
        "Cela retourne une copie de l'objet",
      ],
      correct: 1,
    },
  ],
};
