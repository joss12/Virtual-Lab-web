export const id = "dom-basics";
export const titleEn = "DOM Basics";
export const titleFr = "Les bases du DOM";

export const content = {
  en: `# DOM Basics

## What Is the DOM?

When a browser loads an HTML page, it doesn't just display it — it builds a **tree of JavaScript objects** representing every element on the page. This tree is called the **Document Object Model (DOM)**.

\`\`\`
HTML:                              DOM Tree:
<html>                             document
  <body>                           └── html
    <h1>Hello</h1>                      └── body
    <p>World</p>                             ├── h1 ("Hello")
  </body>                                   └── p  ("World")
</html>
\`\`\`

The DOM is the bridge between your HTML and your JavaScript. Every element, attribute, and piece of text is a **node** in this tree — and JavaScript can read, modify, add, or delete any of it in real time.

\`\`\`javascript
// The 'document' object is the entry point to the entire DOM
// It represents the HTML document itself

console.log(document.title);          // the page's <title>
console.log(document.URL);            // current page URL
console.log(document.body);           // the <body> element
console.log(document.documentElement); // the <html> element
\`\`\`

**Why does this matter?** Every interactive webpage you've ever used — dropdown menus, modal dialogs, live search, form validation, dark mode toggles — is built by JavaScript reading and modifying the DOM.

## Selecting Elements

Before you can do anything with an element, you need to **select** it — get a JavaScript reference to it. There are several ways to do this.

### querySelector and querySelectorAll — The Modern Approach

\`\`\`javascript
// querySelector — returns the FIRST matching element (or null if not found)
// Uses CSS selector syntax — if you know CSS, you already know this

const title     = document.querySelector("h1");           // by tag
const btn       = document.querySelector("#submit-btn");   // by ID
const firstItem = document.querySelector(".menu-item");    // by class (first match)
const input     = document.querySelector("input[type='email']"); // by attribute
const firstLi   = document.querySelector("ul > li");       // child combinator
const active    = document.querySelector(".nav-link.active"); // multiple classes

// If no match — returns null (not an error!)
const missing = document.querySelector("#nonexistent");
console.log(missing);   // null
// Always check for null before using:
if (missing) {
    missing.textContent = "Found!";
}

// querySelectorAll — returns ALL matching elements as a NodeList
const allItems    = document.querySelectorAll(".menu-item");
const allHeadings = document.querySelectorAll("h1, h2, h3");
const allInputs   = document.querySelectorAll("form input");

// NodeList is array-like but NOT a real array — convert to use array methods
const itemsArray = Array.from(allItems);
// OR use spread:
const itemsArray2 = [...allItems];

// But forEach works directly on NodeList:
allItems.forEach(item => {
    console.log(item.textContent);
});
\`\`\`

### Other Selectors (Know These Exist)

\`\`\`javascript
// getElementById — fastest, only for IDs (no # prefix)
const header = document.getElementById("main-header");

// getElementsByClassName — live HTMLCollection (updates automatically)
const cards = document.getElementsByClassName("card");

// getElementsByTagName — all elements of a type
const paragraphs = document.getElementsByTagName("p");

// Recommendation: use querySelector/querySelectorAll for everything.
// They're more flexible (CSS selectors) and return consistent types.
// The older methods exist but are rarely needed in modern code.
\`\`\`

## Reading and Modifying Content

Once you have an element, you can read or change its content, attributes, and styles.

### textContent vs innerHTML vs innerText

\`\`\`javascript
// Given: <p id="demo">Hello <strong>World</strong></p>
const p = document.querySelector("#demo");

// textContent — raw text, no HTML, SAFE (escapes HTML automatically)
console.log(p.textContent);   // "Hello World" (strips tags)
p.textContent = "<strong>Bold</strong>";
// Renders as literal text: <strong>Bold</strong>  (not bold!)
// textContent treats everything as plain text — no HTML parsing

// innerHTML — includes HTML tags, DANGEROUS with user input (XSS risk)
console.log(p.innerHTML);   // "Hello <strong>World</strong>"
p.innerHTML = "<strong>Bold</strong>";
// Renders as: Bold (actually bold!)
// DANGER: p.innerHTML = userInput  ← if userInput = "<script>evil()</script>"
// that script will EXECUTE. Never set innerHTML from untrusted data.

// innerText — visible text only (respects CSS visibility, slower)
console.log(p.innerText);   // "Hello World" (same as textContent here)
// innerText is slower because it triggers layout calculation
// Prefer textContent for reading/setting plain text

// Summary:
// textContent → always for text, always safe ✓
// innerHTML   → for trusted HTML only, never user input
// innerText   → only when you specifically need computed visibility
\`\`\`

### Attributes

\`\`\`javascript
// Given: <img id="avatar" src="photo.jpg" alt="Profile" data-user-id="42">
const img = document.querySelector("#avatar");

// Read attributes
console.log(img.getAttribute("src"));          // "photo.jpg"
console.log(img.getAttribute("alt"));          // "Profile"
console.log(img.getAttribute("data-user-id")); // "42"

// Set attributes
img.setAttribute("alt", "Updated profile photo");
img.setAttribute("src", "new-photo.jpg");

// Remove attributes
img.removeAttribute("data-user-id");

// Check if attribute exists
console.log(img.hasAttribute("src"));   // true
console.log(img.hasAttribute("href"));  // false

// PROPERTY vs ATTRIBUTE — important distinction
// Many attributes have corresponding JS properties (faster, typed)
const input = document.querySelector("input");
input.value        // string value (property)
input.checked      // boolean (property)
input.disabled     // boolean (property)

// Attribute: always a string
input.getAttribute("disabled")   // "disabled" or null (string)
// Property: correct type
input.disabled                   // true or false (boolean)

// For HTML standard attributes: use properties (faster)
// For custom data-* attributes: use getAttribute/setAttribute
\`\`\`

### CSS Classes

\`\`\`javascript
// classList is the modern way to work with CSS classes
// Given: <div id="card" class="card shadow rounded">

const card = document.querySelector("#card");

// Read
console.log(card.className);         // "card shadow rounded" (full string)
console.log(card.classList);         // DOMTokenList ["card", "shadow", "rounded"]

// Add
card.classList.add("active");        // ["card", "shadow", "rounded", "active"]
card.classList.add("a", "b", "c");   // add multiple at once

// Remove
card.classList.remove("shadow");     // ["card", "rounded", "active"]
card.classList.remove("a", "b");     // remove multiple

// Toggle — adds if absent, removes if present
card.classList.toggle("active");     // removes "active" (was present)
card.classList.toggle("active");     // adds "active" back
card.classList.toggle("dark", true); // force add (second arg = force)
card.classList.toggle("dark", false);// force remove

// Check
console.log(card.classList.contains("card"));   // true
console.log(card.classList.contains("hidden")); // false

// Replace
card.classList.replace("rounded", "circle");   // replaces one class

// This is the CORRECT way to do CSS-driven UI changes:
// Define styles in CSS, toggle classes in JS
// AVOID: element.style.display = "none" (mixes concerns)
// PREFER: element.classList.toggle("hidden") (CSS: .hidden { display: none })
\`\`\`

### Inline Styles (Use Sparingly)

\`\`\`javascript
const box = document.querySelector("#box");

// Read/write inline styles
box.style.backgroundColor = "red";    // camelCase in JS (background-color → backgroundColor)
box.style.fontSize         = "18px";  // values must include units
box.style.margin           = "10px 20px";
box.style.display          = "none";  // hide element

// Read computed styles (including from stylesheets, not just inline)
const computed = window.getComputedStyle(box);
console.log(computed.fontSize);     // e.g. "16px"
console.log(computed.display);      // e.g. "block"

// Remove inline style
box.style.backgroundColor = "";   // empty string = remove inline style

// Best practice: use classList + CSS instead of style directly
// EXCEPTION: when value is dynamic/computed (like animation position)
box.style.transform = \`translateX(\${x}px)\`;   // dynamic — ok for style
\`\`\`

## Creating and Inserting Elements

One of the most powerful DOM operations is creating new elements from scratch and inserting them into the page.

\`\`\`javascript
// Step 1: Create an element
const newDiv = document.createElement("div");

// Step 2: Set its properties
newDiv.textContent  = "I was created by JavaScript!";
newDiv.className    = "card highlight";
newDiv.id           = "dynamic-card";
newDiv.setAttribute("data-created", "true");

// Style it if needed
newDiv.style.padding    = "16px";
newDiv.style.background = "#1a2a4a";

// Step 3: Insert it into the DOM

const container = document.querySelector("#container");

// append — add at END of container (most common)
container.append(newDiv);

// prepend — add at BEGINNING of container
container.prepend(newDiv);

// insertBefore — insert before a specific child
const referenceNode = container.querySelector(".existing-item");
container.insertBefore(newDiv, referenceNode);

// Modern: insertAdjacentElement (very precise control)
// Positions: "beforebegin", "afterbegin", "beforeend", "afterend"
referenceNode.insertAdjacentElement("afterend", newDiv);
// "beforebegin" → before the element itself (as sibling before)
// "afterbegin"  → first child of the element
// "beforeend"   → last child of the element
// "afterend"    → after the element itself (as sibling after)

// insertAdjacentHTML — insert raw HTML string (careful with user input!)
container.insertAdjacentHTML("beforeend", "<p class='note'>Added!</p>");
\`\`\`

### Creating Multiple Elements Efficiently

\`\`\`javascript
// SLOW: appending inside a loop (causes multiple reflows)
const list = document.querySelector("#list");
const items = ["Apple", "Banana", "Cherry", "Date"];

// DON'T do this in a loop:
items.forEach(item => {
    const li = document.createElement("li");
    li.textContent = item;
    list.append(li);   // DOM reflow on every iteration!
});

// BETTER: DocumentFragment — batches DOM changes into one operation
const fragment = document.createDocumentFragment();
// fragment is an in-memory node — not part of the DOM yet
// modifying it doesn't trigger reflows

items.forEach(item => {
    const li = document.createElement("li");
    li.textContent = item;
    fragment.append(li);   // add to fragment (no reflow)
});

list.append(fragment);   // ONE reflow — all items added at once

// ALSO GOOD: Build HTML string, then insert once
const html = items.map(item => \`<li class="item">\${item}</li>\`).join("");
list.innerHTML = html;   // one DOM update, but loses existing content
// Use insertAdjacentHTML to ADD without clearing:
list.insertAdjacentHTML("beforeend", html);
\`\`\`

### Removing Elements

\`\`\`javascript
const element = document.querySelector("#to-remove");

// Modern — remove element from DOM
element.remove();

// Remove a child (older method — still used)
const parent = document.querySelector("#parent");
const child  = document.querySelector("#child");
parent.removeChild(child);

// Clear all children
parent.innerHTML = "";    // quick but loses event listeners
// OR:
while (parent.firstChild) {
    parent.removeChild(parent.firstChild);
}
\`\`\`

## Event Handling — Making Things Interactive

Events are how JavaScript responds to user actions — clicks, key presses, mouse movements, form submissions, and more.

### addEventListener — The Right Way

\`\`\`javascript
const button = document.querySelector("#my-button");

// addEventListener(eventType, callback)
button.addEventListener("click", function(event) {
    console.log("Button was clicked!");
    console.log(event);          // the Event object — full details
    console.log(event.target);   // the element that was clicked
    console.log(event.type);     // "click"
});

// Arrow function style (most common in modern code)
button.addEventListener("click", (event) => {
    console.log("Clicked:", event.target.textContent);
});

// Named function — useful when you need to remove the listener later
function handleClick(event) {
    console.log("Clicked!");
}
button.addEventListener("click", handleClick);
button.removeEventListener("click", handleClick);  // removes it
// NOTE: must pass the EXACT same function reference to remove
// This is why anonymous functions can't be removed!
\`\`\`

### The Event Object

\`\`\`javascript
document.addEventListener("click", (event) => {
    // Mouse events
    console.log(event.clientX, event.clientY);  // mouse position (viewport)
    console.log(event.pageX,   event.pageY);    // mouse position (page)
    console.log(event.target);                   // element clicked
    console.log(event.currentTarget);            // element with listener attached
    console.log(event.type);                     // "click"

    // Prevent default behavior (e.g. form submit, link navigation)
    event.preventDefault();

    // Stop event from bubbling to parent elements
    event.stopPropagation();
});

document.addEventListener("keydown", (event) => {
    console.log(event.key);       // "Enter", "a", "ArrowUp", etc.
    console.log(event.code);      // "KeyA", "Space", "ArrowUp" (physical key)
    console.log(event.ctrlKey);   // true if Ctrl was held
    console.log(event.shiftKey);  // true if Shift was held
    console.log(event.altKey);    // true if Alt was held

    if (event.key === "Enter") { console.log("Enter pressed!"); }
    if (event.ctrlKey && event.key === "s") {
        event.preventDefault();   // prevent browser save dialog
        console.log("Ctrl+S intercepted — saving...");
    }
});
\`\`\`

### Common Events

\`\`\`javascript
const input   = document.querySelector("input");
const form    = document.querySelector("form");
const element = document.querySelector(".box");

// Mouse events
element.addEventListener("click",       e => console.log("click"));
element.addEventListener("dblclick",    e => console.log("double click"));
element.addEventListener("mouseenter",  e => console.log("mouse entered"));
element.addEventListener("mouseleave",  e => console.log("mouse left"));
element.addEventListener("mousemove",   e => console.log(e.clientX, e.clientY));

// Keyboard events (attach to document or focusable elements)
document.addEventListener("keydown",  e => console.log("key down:", e.key));
document.addEventListener("keyup",    e => console.log("key up:", e.key));

// Form/input events
input.addEventListener("input",   e => console.log("typing:", e.target.value));
input.addEventListener("change",  e => console.log("changed:", e.target.value));
input.addEventListener("focus",   e => console.log("focused"));
input.addEventListener("blur",    e => console.log("blurred (lost focus)"));

form.addEventListener("submit", e => {
    e.preventDefault();   // prevent page reload!
    const data = new FormData(form);
    console.log(Object.fromEntries(data));
});

// Window/document events
window.addEventListener("resize", e => console.log(window.innerWidth));
window.addEventListener("scroll", e => console.log(window.scrollY));
document.addEventListener("DOMContentLoaded", e => console.log("DOM ready!"));
\`\`\`

### Event Delegation — One Listener for Many Elements

Event delegation is a powerful pattern that uses **event bubbling** — the fact that events "bubble up" through the DOM tree from the target to the root.

\`\`\`javascript
// PROBLEM: Adding a listener to each list item is inefficient
// Especially when items are added dynamically

// BAD: N listeners for N items
document.querySelectorAll(".list-item").forEach(item => {
    item.addEventListener("click", handleItemClick);
});
// If you add new items later, they have NO listener!

// GOOD: One listener on the PARENT, check what was clicked
const list = document.querySelector("#list");

list.addEventListener("click", (event) => {
    // event.target is the actual element clicked (could be child of li)
    // .closest() finds the nearest ancestor matching the selector
    const item = event.target.closest(".list-item");

    if (item) {   // null if click was outside a list item
        console.log("Item clicked:", item.textContent);
        console.log("Item ID:", item.dataset.id);
        item.classList.toggle("selected");
    }
});

// This works for items added LATER too — the listener is on the parent!
const newItem = document.createElement("li");
newItem.className = "list-item";
newItem.dataset.id = "99";
newItem.textContent = "Dynamically added";
list.append(newItem);   // automatically responds to clicks ✓

// How bubbling works:
// User clicks on <span> inside <li class="list-item">
// Click event fires on <span>
// Bubbles up to <li>    ← event.target.closest(".list-item") finds this
// Bubbles up to <ul>    ← our listener fires here
// Bubbles up to <body>
// Bubbles up to <html>
// Bubbles up to document
\`\`\`

## Traversing the DOM

Sometimes you need to navigate from one element to its relatives.

\`\`\`javascript
const element = document.querySelector(".item");

// PARENT
element.parentElement;            // immediate parent

// CHILDREN
element.children;                 // HTMLCollection of child ELEMENTS only
element.firstElementChild;        // first child element
element.lastElementChild;         // last child element
element.childElementCount;        // how many children

// SIBLINGS
element.nextElementSibling;       // next sibling element
element.previousElementSibling;   // previous sibling element

// Real example: highlight all siblings of a clicked element
list.addEventListener("click", event => {
    const clickedItem = event.target.closest("li");
    if (!clickedItem) return;

    // Remove highlight from all siblings
    [...clickedItem.parentElement.children].forEach(li => {
        li.classList.remove("highlighted");
    });

    // Add to clicked one
    clickedItem.classList.add("highlighted");
});
\`\`\`

## Data Attributes — Storing Data on Elements

\`\`\`javascript
// HTML: <button data-action="delete" data-user-id="42" data-confirm="true">Delete</button>
// data-* attributes store custom data on HTML elements

const btn = document.querySelector("button");

// Read with dataset (camelCase: data-user-id → userId)
console.log(btn.dataset.action);    // "delete"
console.log(btn.dataset.userId);    // "42" (always a STRING)
console.log(btn.dataset.confirm);   // "true" (string, not boolean!)

// Write
btn.dataset.status = "pending";     // adds data-status="pending"

// Remove
delete btn.dataset.action;

// Convert types manually
const userId  = parseInt(btn.dataset.userId, 10);     // "42" → 42
const confirm = btn.dataset.confirm === "true";        // "true" → true

// Real-world: delegation with data attributes
document.addEventListener("click", event => {
    const actionBtn = event.target.closest("[data-action]");
    if (!actionBtn) return;

    const action = actionBtn.dataset.action;
    const id     = parseInt(actionBtn.dataset.id, 10);

    if (action === "delete") deleteItem(id);
    if (action === "edit")   editItem(id);
    if (action === "view")   viewItem(id);
});
\`\`\`

## A Complete Example: Interactive Todo List

\`\`\`javascript
// This pulls together everything from this lesson

const input    = document.querySelector("#todo-input");
const addBtn   = document.querySelector("#add-btn");
const todoList = document.querySelector("#todo-list");

let todos = [];
let nextId = 1;

function render() {
    // Build all list items as a fragment
    const fragment = document.createDocumentFragment();

    todos.forEach(todo => {
        const li = document.createElement("li");
        li.className = \`todo-item\${todo.done ? " done" : ""}\`;
        li.dataset.id = todo.id;
        li.innerHTML = \`
            <span class="todo-text">\${escapeHTML(todo.text)}</span>
            <button data-action="toggle">✓</button>
            <button data-action="delete">✕</button>
        \`;
        fragment.append(li);
    });

    todoList.innerHTML = "";    // clear existing
    todoList.append(fragment);  // insert all at once
}

function escapeHTML(str) {
    // SAFE: prevent XSS by escaping HTML characters
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

function addTodo() {
    const text = input.value.trim();
    if (!text) return;
    todos.push({ id: nextId++, text, done: false });
    input.value = "";
    render();
}

// Event delegation on the list
todoList.addEventListener("click", event => {
    const btn  = event.target.closest("button[data-action]");
    if (!btn) return;

    const id     = parseInt(btn.closest(".todo-item").dataset.id, 10);
    const action = btn.dataset.action;

    if (action === "toggle") {
        todos = todos.map(t => t.id === id ? { ...t, done: !t.done } : t);
    }
    if (action === "delete") {
        todos = todos.filter(t => t.id !== id);
    }

    render();
});

// Add on button click
addBtn.addEventListener("click", addTodo);

// Add on Enter key
input.addEventListener("keydown", event => {
    if (event.key === "Enter") addTodo();
});

// Initial render
render();
\`\`\`

## Common Mistakes to Avoid

\`\`\`javascript
// Mistake 1: Running code before DOM is ready
// If script is in <head>, DOM elements don't exist yet
document.querySelector("#btn").addEventListener("click", ...);
// ← TypeError: Cannot read properties of null
// Fix A: put <script> at end of <body>
// Fix B: use DOMContentLoaded
document.addEventListener("DOMContentLoaded", () => {
    document.querySelector("#btn").addEventListener("click", ...);
});
// Fix C: add defer attribute to <script>: <script defer src="app.js">

// Mistake 2: innerHTML with user data — XSS vulnerability
const userInput = "<img src=x onerror='alert(document.cookie)'>";
element.innerHTML = userInput;   // EXECUTES THE SCRIPT — dangerous!
element.textContent = userInput; // SAFE — renders as literal text

// Mistake 3: Forgetting to check for null
const el = document.querySelector("#might-not-exist");
el.classList.add("active");   // TypeError if el is null!
// Fix:
el?.classList.add("active");   // optional chaining
// Or:
if (el) el.classList.add("active");

// Mistake 4: Removing anonymous listeners
const btn = document.querySelector("btn");
btn.addEventListener("click", () => console.log("click"));
btn.removeEventListener("click", () => console.log("click"));  // DOES NOT WORK
// Arrow functions create NEW function each time — they're not the same reference
// Fix: store the function in a variable
const handler = () => console.log("click");
btn.addEventListener("click", handler);
btn.removeEventListener("click", handler);   // works ✓
\`\`\`
`,

  fr: `# Les bases du DOM

## Qu'est-ce que le DOM ?

Quand un navigateur charge une page HTML, il construit un **arbre d'objets JavaScript** représentant chaque élément. C'est le **Document Object Model (DOM)** — le pont entre votre HTML et votre JavaScript.

## Sélectionner des éléments

\`\`\`javascript
// querySelector — retourne le PREMIER élément correspondant (ou null)
const titre    = document.querySelector("h1");
const btn      = document.querySelector("#submit-btn");
const premier  = document.querySelector(".menu-item");

// querySelectorAll — retourne TOUS les éléments correspondants
const tousItems = document.querySelectorAll(".menu-item");
tousItems.forEach(item => console.log(item.textContent));
\`\`\`

## Lire et modifier le contenu

\`\`\`javascript
const p = document.querySelector("#demo");

// textContent — texte brut, SÉCURISÉ (échappe le HTML automatiquement)
p.textContent = "Nouveau texte";

// innerHTML — interprète le HTML, DANGEREUX avec les données utilisateur
p.innerHTML = "<strong>Gras</strong>";  // rend réellement gras

// DANGER : ne JAMAIS faire ça avec des données utilisateur (XSS) :
// p.innerHTML = donneeUtilisateur;  ← peut exécuter du code malveillant !
\`\`\`

## Événements — Rendre les choses interactives

\`\`\`javascript
const btn = document.querySelector("#mon-bouton");

// addEventListener(typeEvenement, callback)
btn.addEventListener("click", (event) => {
    console.log("Cliqué !", event.target);
});

// Délégation d'événements — un seul listener pour plusieurs éléments
const liste = document.querySelector("#liste");
liste.addEventListener("click", (event) => {
    const item = event.target.closest(".item-liste");
    if (item) {
        item.classList.toggle("selectionne");
    }
});
// Fonctionne même pour les éléments ajoutés dynamiquement !
\`\`\`

## Créer et insérer des éléments

\`\`\`javascript
// Créer
const div = document.createElement("div");
div.textContent  = "Créé par JavaScript !";
div.className    = "carte";

// Insérer
const conteneur = document.querySelector("#conteneur");
conteneur.append(div);   // à la fin

// Pour plusieurs éléments : utiliser DocumentFragment (efficace)
const fragment = document.createDocumentFragment();
["Pomme", "Banane", "Cerise"].forEach(fruit => {
    const li = document.createElement("li");
    li.textContent = fruit;
    fragment.append(li);
});
conteneur.append(fragment);  // UN seul reflow
\`\`\`
`,
};

export const starterCode = {
  default: `// DOM Basics — Simulated Practice
// Since we're in a code editor (not a browser page),
// we simulate DOM operations and show what would happen.

// ─── Simulated DOM ────────────────────────────────────────
class SimElement {
    constructor(tag, attrs = {}) {
        this.tag        = tag;
        this.attrs      = { class: "", id: "", ...attrs };
        this.children   = [];
        this.textContent = "";
        this._events    = {};
        this.dataset    = {};
        this.style      = {};
        this.classList  = {
            _list: (attrs.class || "").split(" ").filter(Boolean),
            add:    function(...cls) { cls.forEach(c => { if (!this._list.includes(c)) this._list.push(c); }); },
            remove: function(...cls) { cls.forEach(c => { this._list = this._list.filter(x => x !== c); }); },
            toggle: function(cls)   { this._list.includes(cls) ? this.remove(cls) : this.add(cls); return this._list.includes(cls); },
            contains: function(cls) { return this._list.includes(cls); },
            toString: function()    { return this._list.join(" "); },
        };
    }
    setAttribute(k, v) { this.attrs[k] = v; }
    getAttribute(k)     { return this.attrs[k] ?? null; }
    append(...nodes)    { nodes.forEach(n => this.children.push(n)); }
    addEventListener(ev, fn) {
        if (!this._events[ev]) this._events[ev] = [];
        this._events[ev].push(fn);
    }
    dispatchEvent(ev, data = {}) {
        (this._events[ev] || []).forEach(fn => fn({ type: ev, target: this, ...data }));
    }
    toString() {
        const cls  = this.classList.toString();
        const id   = this.attrs.id ? \`#\${this.attrs.id}\` : "";
        const text = this.textContent ? \` "\${this.textContent}"\` : "";
        return \`<\${this.tag}\${id}\${cls ? "." + cls.replace(/ /g, ".") : ""}>\${text}</\${this.tag}>\`;
    }
}

// ─── Demo 1: Create and modify elements ───────────────────
console.log("=== Creating Elements ===");
const card = new SimElement("div", { class: "card", id: "main-card" });
card.textContent = "Hello World";

console.log("Initial:", card.toString());

card.classList.add("highlight", "shadow");
card.style.backgroundColor = "navy";
card.setAttribute("data-id", "42");

console.log("After changes:", card.toString());
console.log("Has 'highlight':", card.classList.contains("highlight"));
console.log("data-id:", card.getAttribute("data-id"));

// ─── Demo 2: classList operations ─────────────────────────
console.log("\\n=== classList Operations ===");
const btn = new SimElement("button", { class: "btn primary" });
btn.textContent = "Click me";

console.log("Before:", btn.classList.toString());
btn.classList.toggle("active");
console.log("After toggle:", btn.classList.toString());
btn.classList.remove("primary");
btn.classList.add("secondary", "large");
console.log("Final:", btn.classList.toString());

// ─── Demo 3: Event simulation ─────────────────────────────
console.log("\\n=== Event Handling ===");
const submitBtn = new SimElement("button");
submitBtn.textContent = "Submit";

let clickCount = 0;
submitBtn.addEventListener("click", (e) => {
    clickCount++;
    console.log(\`  Click #\${clickCount} on \${e.target.textContent}\`);
});
submitBtn.addEventListener("click", (e) => {
    console.log("  Second listener also fired!");
});

submitBtn.dispatchEvent("click");
submitBtn.dispatchEvent("click");

// ─── Demo 4: Building a list with fragment ─────────────────
console.log("\\n=== Building a List ===");
const ul = new SimElement("ul", { id: "fruits" });
const fruits = ["Apple", "Banana", "Cherry", "Date", "Elderberry"];

fruits.forEach((fruit, i) => {
    const li = new SimElement("li", { class: "fruit-item" });
    li.textContent = fruit;
    li.dataset.index = i;
    ul.append(li);
});

console.log(\`List has \${ul.children.length} items:\`);
ul.children.forEach(li => console.log(\`  - \${li.textContent}\`));

// ─── Demo 5: Data attributes ───────────────────────────────
console.log("\\n=== Data Attributes ===");
const actions = [
    { action: "edit",   id: 1, label: "Edit Alice"  },
    { action: "delete", id: 2, label: "Delete Bob"  },
    { action: "view",   id: 3, label: "View Carol"  },
];

actions.forEach(({ action, id, label }) => {
    const btn = new SimElement("button");
    btn.textContent    = label;
    btn.dataset.action = action;
    btn.dataset.id     = id;

    btn.addEventListener("click", (e) => {
        const { action, id } = e.target.dataset;
        console.log(\`  Action: \${action}, ID: \${id}\`);
    });

    btn.dispatchEvent("click");
});
`,
};

export const exerciseEn = `DOM challenge — build these components (simulated or in browser):

1. Write a function 'buildCard({ title, body, tags, onClick })' that
   creates a card element with:
   - An <h3> for the title
   - A <p> for the body text
   - A <div class="tags"> with a <span class="tag"> for each tag
   - A click handler on the whole card
   Return the element.

2. Write 'toggleTheme(element)' that:
   - Adds class "dark" and removes "light" if element has class "light"
   - Adds class "light" and removes "dark" if element has class "dark"
   - Defaults to adding "dark" if neither class exists
   
3. Write 'delegateEvents(parent, selector, eventType, handler)' that:
   - Attaches ONE listener to parent
   - Calls handler only when event.target matches selector
   - Passes (event, matchedElement) to handler
   This is the event delegation pattern generalized.

4. Write 'observeChanges(element, callback)' that calls callback
   whenever the element's classList changes, passing the new class list.
   (Simulate this with a Proxy or wrapper around classList methods)`;

export const exerciseFr = `Défi DOM — construisez ces composants :

1. Écrivez 'construireCarte({ titre, corps, tags, onClick })' qui
   crée un élément carte avec un h3, un p, des spans de tags et un
   gestionnaire de clic.

2. Écrivez 'basculerTheme(element)' qui alterne entre les classes
   "clair" et "sombre".

3. Écrivez 'deleguerEvenements(parent, selecteur, typeEv, handler)'
   qui attache UN seul listener au parent et appelle handler seulement
   quand la cible correspond au sélecteur.

4. Écrivez 'observerChangements(element, callback)' qui appelle
   callback chaque fois que classList de l'élément change.`;

export const solutionCode = {
  default: `// Simulated DOM helpers (same as starter)
class SimElement {
    constructor(tag, attrs = {}) {
        this.tag = tag; this.attrs = { class: "", ...attrs };
        this.children = []; this.textContent = ""; this._events = {};
        this.dataset = {}; this.style = {};
        this.classList = {
            _list: (attrs.class || "").split(" ").filter(Boolean),
            add(...c)        { c.forEach(x => { if (!this._list.includes(x)) this._list.push(x); }); },
            remove(...c)     { c.forEach(x => { this._list = this._list.filter(y => y !== x); }); },
            toggle(c)        { this._list.includes(c) ? this.remove(c) : this.add(c); },
            contains(c)      { return this._list.includes(c); },
            replace(o, n)    { const i = this._list.indexOf(o); if (i >= 0) this._list[i] = n; },
            toString()       { return this._list.join(" "); },
        };
    }
    setAttribute(k,v){ this.attrs[k]=v; }
    getAttribute(k)  { return this.attrs[k]??null; }
    append(...n)     { n.forEach(x=>this.children.push(x)); }
    addEventListener(ev,fn){ if(!this._events[ev])this._events[ev]=[]; this._events[ev].push(fn); }
    dispatchEvent(ev,data={}){ (this._events[ev]||[]).forEach(fn=>fn({type:ev,target:this,...data})); }
    toString()       { const c=this.classList.toString(); return \`<\${this.tag}\${c?'.'+c.replace(/ /g,'.'):''}>\${this.textContent||'['+this.children.length+' children]'}</\${this.tag}>\`; }
}
const CE = (tag, attrs) => new SimElement(tag, attrs);

// 1. buildCard
function buildCard({ title, body, tags = [], onClick }) {
    const card = CE("div", { class: "card" });

    const h3 = CE("h3");
    h3.textContent = title;
    card.append(h3);

    const p = CE("p");
    p.textContent = body;
    card.append(p);

    const tagsDiv = CE("div", { class: "tags" });
    tags.forEach(tag => {
        const span = CE("span", { class: "tag" });
        span.textContent = tag;
        tagsDiv.append(span);
    });
    card.append(tagsDiv);

    if (onClick) card.addEventListener("click", onClick);
    return card;
}

console.log("=== buildCard ===");
const card = buildCard({
    title: "JavaScript Fundamentals",
    body:  "Learn the basics of JS",
    tags:  ["js", "beginner", "web"],
    onClick: (e) => console.log("  Card clicked:", e.target.toString()),
});
console.log(card.toString());
console.log("Tags:", card.children[2].children.map(s => s.textContent));
card.dispatchEvent("click");

// 2. toggleTheme
function toggleTheme(element) {
    if (element.classList.contains("light")) {
        element.classList.remove("light");
        element.classList.add("dark");
    } else if (element.classList.contains("dark")) {
        element.classList.remove("dark");
        element.classList.add("light");
    } else {
        element.classList.add("dark");
    }
    return element.classList.toString();
}

console.log("\\n=== toggleTheme ===");
const body = CE("body", { class: "light" });
console.log("Start:", body.classList.toString());
console.log("Toggle 1:", toggleTheme(body));
console.log("Toggle 2:", toggleTheme(body));
const fresh = CE("body");
console.log("No class:", toggleTheme(fresh));

// 3. delegateEvents
function delegateEvents(parent, selector, eventType, handler) {
    parent.addEventListener(eventType, (event) => {
        // Simulate closest() by checking children
        const match = parent.children.find(child =>
            child.classList.contains(selector.replace(".", ""))
            && (child === event.target || child.children.includes(event.target))
        );
        if (match) handler(event, match);
    });
}

console.log("\\n=== delegateEvents ===");
const list = CE("ul");
["Alice", "Bob", "Carol"].forEach((name, i) => {
    const li = CE("li", { class: "list-item" });
    li.textContent = name;
    li.dataset.id  = i + 1;
    list.append(li);
});

delegateEvents(list, ".list-item", "click", (event, el) => {
    console.log(\`  Delegated click: \${el.textContent} (id=\${el.dataset.id})\`);
});

list.children.forEach(li => list.dispatchEvent("click", { target: li }));

// 4. observeChanges (wrapper approach)
function observeChanges(element, callback) {
    const original = element.classList;
    const wrap = (method) => (...args) => {
        original[method](...args);
        callback(original.toString());
    };
    element.classList = {
        ...original,
        add:    wrap("add"),
        remove: wrap("remove"),
        toggle: wrap("toggle"),
    };
}

console.log("\\n=== observeChanges ===");
const el = CE("div", { class: "base" });
observeChanges(el, (classes) => console.log("  Classes changed:", classes));

el.classList.add("active");
el.classList.add("highlight");
el.classList.remove("base");
el.classList.toggle("active");
`,
};

export const quiz = {
  en: [
    {
      question:
        "What is the difference between textContent and innerHTML, and when should you use each?",
      options: [
        "innerHTML is faster because it skips HTML parsing for plain text",
        "textContent gets or sets raw text — it treats everything as literal characters, automatically escaping HTML. innerHTML gets or sets HTML markup — it parses and renders tags. Always use textContent for user-generated content (safe, prevents XSS). Use innerHTML only for trusted HTML you control, never for anything a user typed.",
        "textContent only works on block elements, innerHTML works on all elements",
        "They are identical — innerHTML just adds HTML validation on top",
      ],
      correct: 1,
    },
    {
      question:
        "What is event delegation and why is it better than adding listeners to each element?",
      options: [
        "Event delegation is a way to run the same function for multiple event types simultaneously",
        "Event delegation uses event bubbling — events fire on the target then bubble up through ancestors. Instead of adding N listeners to N elements, you add ONE listener to a parent. The listener checks event.target to see what was clicked. Benefits: one listener instead of N, works for dynamically added elements that didn't exist when the listener was attached, and less memory usage.",
        "Event delegation prevents events from reaching the document root",
        "Event delegation is only useful for keyboard events, not mouse events",
      ],
      correct: 1,
    },
    {
      question:
        "Why should you use DocumentFragment when creating multiple DOM elements in a loop?",
      options: [
        "DocumentFragment is required to create more than 5 elements at once",
        "Every time you append an element to the live DOM, the browser recalculates layout (reflow) — an expensive operation. DocumentFragment is an in-memory node not attached to the DOM, so appending to it triggers no reflows. When you finally append the fragment to the DOM, ONE reflow handles all elements at once, making it dramatically faster for large lists.",
        "DocumentFragment automatically sorts elements alphabetically before insertion",
        "DocumentFragment prevents duplicate elements from being inserted",
      ],
      correct: 1,
    },
    {
      question:
        "Why can't you remove an event listener added with an anonymous arrow function?",
      options: [
        "Arrow functions are immutable and cannot be passed to removeEventListener",
        "removeEventListener requires the EXACT same function reference that was passed to addEventListener. Every time you write () => {} it creates a NEW function object — even if the code looks identical, it's a different reference in memory. Since you never stored the anonymous function anywhere, you have no reference to pass to removeEventListener. Fix: store the function in a variable first.",
        "Anonymous functions are automatically removed after one invocation",
        "removeEventListener only works with named function declarations, not expressions",
      ],
      correct: 1,
    },
    {
      question: "What does element.classList.toggle('active') do?",
      options: [
        "It adds 'active' if it's not present, and throws an error if it is present",
        "It adds the class if the element doesn't have it, and removes it if the element does have it — toggling between the two states. This is perfect for show/hide, dark/light mode, selected/unselected patterns. An optional second argument forces add (true) or remove (false): toggle('active', condition) is cleaner than an if/else with add/remove.",
        "It sets the element's class to only 'active', removing all other classes",
        "It blinks the element by repeatedly adding and removing the class",
      ],
      correct: 1,
    },
  ],
  fr: [
    {
      question: "Quelle est la différence entre textContent et innerHTML ?",
      options: [
        "innerHTML est plus rapide car il saute l'analyse HTML pour le texte simple",
        "textContent obtient ou définit du texte brut — il traite tout comme des caractères littéraux, échappant automatiquement le HTML. innerHTML obtient ou définit du balisage HTML — il analyse et rend les balises. Utilisez toujours textContent pour le contenu généré par l'utilisateur (sûr, prévient le XSS). Utilisez innerHTML seulement pour du HTML de confiance que vous contrôlez.",
        "textContent ne fonctionne que sur les éléments bloc, innerHTML sur tous",
        "Ils sont identiques — innerHTML ajoute juste une validation HTML",
      ],
      correct: 1,
    },
    {
      question:
        "Qu'est-ce que la délégation d'événements et pourquoi est-elle meilleure ?",
      options: [
        "La délégation d'événements exécute la même fonction pour plusieurs types d'événements",
        "La délégation utilise le bouillonnement — les événements se propagent de la cible vers les ancêtres. Au lieu d'ajouter N listeners à N éléments, vous en ajoutez UN au parent. Le listener vérifie event.target. Avantages : un seul listener, fonctionne pour les éléments ajoutés dynamiquement, moins d'utilisation mémoire.",
        "La délégation empêche les événements d'atteindre la racine du document",
        "La délégation n'est utile que pour les événements clavier",
      ],
      correct: 1,
    },
    {
      question:
        "Pourquoi utiliser DocumentFragment pour créer plusieurs éléments DOM dans une boucle ?",
      options: [
        "DocumentFragment est requis pour créer plus de 5 éléments à la fois",
        "Chaque fois que vous ajoutez un élément au DOM en direct, le navigateur recalcule la mise en page (reflow) — une opération coûteuse. DocumentFragment est un nœud en mémoire non attaché au DOM, donc pas de reflows. Quand vous ajoutez le fragment au DOM, UN seul reflow gère tous les éléments.",
        "DocumentFragment trie automatiquement les éléments alphabétiquement",
        "DocumentFragment empêche les doublons d'être insérés",
      ],
      correct: 1,
    },
    {
      question:
        "Pourquoi ne peut-on pas supprimer un listener ajouté avec une fonction fléchée anonyme ?",
      options: [
        "Les fonctions fléchées sont immuables et ne peuvent pas être passées à removeEventListener",
        "removeEventListener nécessite la MÊME référence de fonction exacte passée à addEventListener. Chaque fois que vous écrivez () => {}, cela crée un NOUVEL objet fonction — même si le code semble identique, c'est une référence différente en mémoire. Fix : stockez la fonction dans une variable d'abord.",
        "Les fonctions anonymes sont automatiquement supprimées après une invocation",
        "removeEventListener ne fonctionne qu'avec des déclarations de fonctions nommées",
      ],
      correct: 1,
    },
    {
      question: "Que fait element.classList.toggle('actif') ?",
      options: [
        "Il ajoute 'actif' s'il n'est pas présent, et lance une erreur s'il l'est",
        "Il ajoute la classe si l'élément ne l'a pas, et la supprime si l'élément l'a — basculant entre les deux états. C'est parfait pour afficher/masquer, mode sombre/clair, sélectionné/désélectionné. Un deuxième argument optionnel force l'ajout (true) ou la suppression (false).",
        "Il définit la classe de l'élément à seulement 'actif', supprimant toutes les autres",
        "Il fait clignoter l'élément en ajoutant et supprimant répétitivement la classe",
      ],
      correct: 1,
    },
  ],
};
