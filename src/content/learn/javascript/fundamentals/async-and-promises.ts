export const id = "async-and-promises";
export const titleEn = "Async & Promises";
export const titleFr = "Async et Promesses";

export const content = {
  en: `# Async & Promises

## The Problem: JavaScript Is Single-Threaded

JavaScript runs on a single thread — it can only do one thing at a time. This creates a serious problem when you need to wait for something: fetching data from an API, reading a file, waiting for a timer.

\`\`\`javascript
// The naive approach — if JavaScript BLOCKED during waits:
const data = fetchFromServer();   // ← blocks for 2 seconds
console.log(data);                // nothing runs during the 2 seconds
updateUI();                       // user sees frozen browser for 2 seconds

// This is how Java or Python work with blocking I/O.
// JavaScript was designed for browsers — a frozen browser is unacceptable.
\`\`\`

Instead, JavaScript uses an **event loop** — it starts an operation, continues running other code, and comes back to handle the result when it's ready. This is **asynchronous** programming.

\`\`\`
Synchronous (blocking):          Asynchronous (non-blocking):
  Do task A (takes 2s)             Start task A
  Wait...                          Do task B immediately
  Wait...                          Do task C immediately
  Task A done                      Task A finishes → handle result
  Do task B                        (B and C already done)
  Do task C
  Total: 4+ seconds                Total: 2+ seconds
\`\`\`

## Three Eras of Async JavaScript

JavaScript has had three generations of async syntax. You need to understand all three because you'll encounter all three in the real world.

### Era 1: Callbacks (The Old Way — Avoid When Possible)

A **callback** is a function you pass to another function, to be called when the async operation completes.

\`\`\`javascript
// Simulating async operations with setTimeout (works in browser JS)
function fetchUser(id, onSuccess, onError) {
    setTimeout(() => {
        if (id > 0) {
            onSuccess({ id, name: "User" + id, email: "user" + id + "@ex.com" });
        } else {
            onError(new Error("Invalid user ID"));
        }
    }, 100);   // simulates 100ms network delay
}

// Usage — pass callbacks for success and error
fetchUser(
    1,
    (user) => console.log("Got user:", user.name),   // success callback
    (err)  => console.log("Error:", err.message)      // error callback
);
console.log("This runs BEFORE the callback fires!");

// Output order:
// "This runs BEFORE the callback fires!"
// "Got user: User1"
// ↑ Proves JavaScript didn't block — it kept running
\`\`\`

### The Callback Hell Problem

Callbacks become a nightmare when you need to chain multiple async operations:

\`\`\`javascript
// Need to: fetch user → fetch their posts → fetch comments on first post
// With callbacks — "callback hell" / "pyramid of doom"

fetchUser(1, (user) => {
    fetchPosts(user.id, (posts) => {
        fetchComments(posts[0].id, (comments) => {
            fetchAuthor(comments[0].authorId, (author) => {
                // NOW we have everything — but we're 4 levels deep!
                console.log(author.name);
            }, (err) => handleError(err));
        }, (err) => handleError(err));
    }, (err) => handleError(err));
}, (err) => handleError(err));

// Problems:
// 1. Hard to read — logic buried in nested indentation
// 2. Error handling repeated at every level
// 3. Hard to debug — stack traces are confusing
// 4. Hard to refactor — changing one level affects everything
\`\`\`

### Era 2: Promises — A Better Way

A **Promise** is an object representing the eventual completion (or failure) of an async operation. Instead of passing callbacks in, you attach them to the Promise object.

\`\`\`javascript
// A Promise has three states:
// PENDING   → operation in progress
// FULFILLED → operation succeeded (has a value)
// REJECTED  → operation failed (has a reason/error)

// Creating a Promise
function fetchUser(id) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (id > 0) {
                resolve({ id, name: "User" + id, email: "user" + id + "@ex.com" });
            } else {
                reject(new Error("Invalid user ID"));
            }
        }, 100);
    });
}

// Using a Promise — .then() for success, .catch() for error
fetchUser(1)
    .then(user => {
        console.log("Got user:", user.name);
        return user;   // return value passes to next .then()
    })
    .catch(err => {
        console.log("Error:", err.message);
    })
    .finally(() => {
        console.log("Always runs — whether success or failure");
    });
\`\`\`

### Promise Chaining — The Solution to Callback Hell

\`\`\`javascript
function fetchUser(id)         { return new Promise(res => setTimeout(() => res({ id, name: "User" + id }), 50)); }
function fetchPosts(userId)    { return new Promise(res => setTimeout(() => res([{ id:1, title:"Post 1", userId }]), 50)); }
function fetchComments(postId) { return new Promise(res => setTimeout(() => res([{ id:1, text:"Comment", authorId:2 }]), 50)); }
function fetchAuthor(authorId) { return new Promise(res => setTimeout(() => res({ id: authorId, name:"Author Alice" }), 50)); }

// Each .then() receives the resolved value from the previous step
// Each .then() can return a new Promise — chaining continues
fetchUser(1)
    .then(user     => fetchPosts(user.id))
    .then(posts    => fetchComments(posts[0].id))
    .then(comments => fetchAuthor(comments[0].authorId))
    .then(author   => console.log("Final:", author.name))
    .catch(err     => console.log("Any error caught here:", err.message));
    // ONE catch handles errors from ANY step in the chain!

// Output (after ~200ms total):
// "Final: Author Alice"
\`\`\`

### Promise.all — Run Multiple Promises in Parallel

\`\`\`javascript
// Promise.all — starts ALL promises simultaneously, waits for ALL to finish
// Returns array of results in the SAME ORDER as input (not completion order)

const p1 = fetchUser(1);   // starts immediately
const p2 = fetchUser(2);   // starts immediately (parallel!)
const p3 = fetchUser(3);   // starts immediately (parallel!)

Promise.all([p1, p2, p3])
    .then(([user1, user2, user3]) => {
        console.log(user1.name, user2.name, user3.name);
    })
    .catch(err => {
        // If ANY promise rejects → the whole thing rejects
        console.log("At least one failed:", err.message);
    });
\`\`\`

### Promise.allSettled — When You Don't Want to Fail Fast

\`\`\`javascript
// Promise.allSettled — waits for ALL promises regardless of failures
// NEVER rejects — even if all promises fail

const promises = [
    Promise.resolve("success"),
    Promise.reject(new Error("oops")),
    Promise.resolve("also success"),
];

Promise.allSettled(promises).then(results => {
    results.forEach((result, i) => {
        if (result.status === "fulfilled") {
            console.log("Promise " + i + ": ✓ " + result.value);
        } else {
            console.log("Promise " + i + ": ✗ " + result.reason.message);
        }
    });
});
// Promise 0: ✓ success
// Promise 1: ✗ oops
// Promise 2: ✓ also success
\`\`\`

### Promise.race and Promise.any

\`\`\`javascript
// Promise.race — resolves/rejects with FIRST settled promise
// Use case: timeout pattern

function withTimeout(promise, ms) {
    const timeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Timeout after " + ms + "ms")), ms)
    );
    return Promise.race([promise, timeout]);
}

withTimeout(fetchUser(1), 500)
    .then(user => console.log("Got:", user.name))
    .catch(err => console.log("Failed:", err.message));

// Promise.any — resolves with FIRST fulfilled promise (ignores rejections)
// Only rejects if ALL promises reject
Promise.any([
    fetchUser(1),
    fetchUser(2),
    fetchUser(3),
])
.then(user => console.log("Fastest resolved:", user.name))
.catch(() => console.log("All failed"));
\`\`\`

## Era 3: Async/Await — The Modern Way

**async/await** is syntactic sugar over Promises — it makes async code look and behave like synchronous code. Under the hood, it's still Promises.

\`\`\`javascript
async function loadUserData(userId) {
    // 'await' pauses THIS function until the Promise resolves
    // Other code continues running — JavaScript isn't blocked!
    const user     = await fetchUser(userId);
    const posts    = await fetchPosts(user.id);
    const comments = await fetchComments(posts[0].id);
    const author   = await fetchAuthor(comments[0].authorId);

    return author.name;   // async function automatically wraps in Promise
}

// Call it — async function returns a Promise
loadUserData(1)
    .then(name => console.log("Author:", name))
    .catch(err => console.log("Error:", err.message));
\`\`\`

### Error Handling with try/catch

\`\`\`javascript
async function safeFetchUser(id) {
    try {
        const user = await fetchUser(id);
        console.log("Got user:", user.name);
        return user;
    } catch (err) {
        // Catches any rejection from ANY awaited promise in the try block
        console.log("Failed to fetch user:", err.message);
        return null;   // return a default/fallback value
    } finally {
        console.log("Fetch attempt complete");   // always runs
    }
}

// Handle errors for each operation independently
async function robustLoad(userId) {
    let user, posts;

    try {
        user = await fetchUser(userId);
    } catch (err) {
        console.log("User fetch failed — using guest");
        user = { id: 0, name: "Guest" };
    }

    try {
        posts = await fetchPosts(user.id);
    } catch (err) {
        console.log("Posts fetch failed — showing empty");
        posts = [];
    }

    return { user, posts };
}
\`\`\`

### Parallel vs Sequential with Async/Await

\`\`\`javascript
// SEQUENTIAL — awaiting one at a time (slow!)
async function sequential(ids) {
    const results = [];
    for (const id of ids) {
        const user = await fetchUser(id);   // waits for EACH before next
        results.push(user);
    }
    return results;
    // With 3 users taking 100ms each: ~300ms total
}

// PARALLEL — start all, then await all (fast!)
async function parallel(ids) {
    const promises = ids.map(id => fetchUser(id));  // all start immediately
    const results  = await Promise.all(promises);    // wait for all
    return results;
    // With 3 users taking 100ms each: ~100ms total — 3x faster!
}
\`\`\`

### Async/Await Rules and Gotchas

\`\`\`javascript
// Rule 1: 'await' can only be used inside 'async' functions
function notAsync() {
    const user = await fetchUser(1);   // SyntaxError!
}
async function isAsync() {
    const user = await fetchUser(1);   // ✓
}

// Rule 2: async function ALWAYS returns a Promise
async function getValue() { return 42; }
const result = getValue();
console.log(result);           // Promise { 42 } — not 42!
console.log(await getValue()); // 42 ← need to await it

// Rule 3: forEach doesn't work with async/await
const ids = [1, 2, 3];
// WRONG — forEach ignores returned Promises
ids.forEach(async id => {
    const user = await fetchUser(id);
    console.log(user.name);  // unpredictable order, not properly awaited
});

// RIGHT — use for...of for sequential async
for (const id of ids) {
    const user = await fetchUser(id);   // properly awaited
    console.log(user.name);
}

// RIGHT — use Promise.all for parallel async
const users = await Promise.all(ids.map(id => fetchUser(id)));
\`\`\`

## A Complete Real-World Example

\`\`\`javascript
function delay(ms, value, fail=false) {
    return new Promise((res, rej) =>
        setTimeout(() => fail ? rej(new Error("Failed")) : res(value), ms)
    );
}

const api = {
    getUser:  id  => delay(50, { id, name: "User" + id, email: "u" + id + "@ex.com" }),
    getPosts: uid => delay(60, [{ id:1, title:"My Post", likes:42 }]),
    getStats: ()  => delay(40, { views:1234, clicks:567 }),
};

async function withRetry(fn, maxAttempts = 3, delayMs = 100) {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            return await fn();
        } catch (err) {
            if (attempt === maxAttempts) throw err;
            console.log("  Attempt " + attempt + " failed, retrying...");
            await delay(delayMs * attempt);
        }
    }
}

async function loadDashboard(userId) {
    console.log("Loading dashboard for user " + userId + "...");
    const startTime = Date.now();

    let user;
    try {
        user = await api.getUser(userId);
        console.log("  ✓ User: " + user.name);
    } catch (err) {
        throw new Error("Cannot load dashboard: " + err.message);
    }

    const [postsResult, statsResult] = await Promise.allSettled([
        withRetry(() => api.getPosts(user.id)),
        withRetry(() => api.getStats()),
    ]);

    const posts = postsResult.status === "fulfilled" ? postsResult.value : [];
    const stats = statsResult.status === "fulfilled" ? statsResult.value : { views: 0, clicks: 0 };

    console.log("  ✓ Posts: " + posts.length + " loaded");
    console.log("  ✓ Stats: " + stats.views + " views");

    const elapsed = Date.now() - startTime;
    return { user, posts, stats, loadedIn: elapsed + "ms" };
}

loadDashboard(1)
    .then(data => {
        console.log("\n=== Dashboard Ready ===");
        console.log("  User:  " + data.user.name);
        console.log("  Posts: " + data.posts.length);
        console.log("  Views: " + data.stats.views);
        console.log("  Loaded in: " + data.loadedIn);
    })
    .catch(err => console.log("Dashboard failed:", err.message));
\`\`\`

## Common Mistakes to Avoid

\`\`\`javascript
// Mistake 1: Forgetting await — Promise instead of value
async function wrong1() {
    const user = fetchUser(1);   // no await! user is a Promise object
    console.log(user.name);      // undefined — Promise has no .name
}
async function right1() {
    const user = await fetchUser(1);   // awaited — user is the object
    console.log(user.name);            // "User1" ✓
}

// Mistake 2: Missing error handling — silent failures
async function wrong2() {
    const user = await fetchUser(-1);   // throws — nobody catches it!
    console.log(user.name);             // never reached
}
async function right2() {
    try {
        const user = await fetchUser(-1);
        console.log(user.name);
    } catch (err) {
        console.log("Handled:", err.message);   // ✓ caught
    }
}

// Mistake 3: Sequential when you need parallel
async function wrong3(ids) {
    const results = [];
    for (const id of ids) {
        results.push(await fetchUser(id));   // waits for each — slow
    }
    return results;
}
async function right3(ids) {
    return Promise.all(ids.map(id => fetchUser(id)));   // parallel — fast
}

// Mistake 4: async in forEach (doesn't await)
async function wrong4(ids) {
    ids.forEach(async id => {
        const user = await fetchUser(id);
        console.log(user.name);   // order unpredictable, not awaited
    });
    // Code here runs BEFORE any users are fetched!
}
async function right4(ids) {
    for (const id of ids) {
        const user = await fetchUser(id);   // properly sequential
        console.log(user.name);
    }
}
\`\`\`
`,

  fr: `# Async et Promesses

## Le problème : JavaScript est mono-thread

JavaScript ne peut faire qu'une chose à la fois. Sans async, attendre une réponse réseau gèlerait tout le navigateur.

## Les trois ères

### Ère 1 : Callbacks (éviter si possible)

\`\`\`javascript
// Un callback est une fonction passée à une autre,
// appelée quand l'opération se termine
function fetchUser(id, onSuccess, onError) {
    setTimeout(() => {
        if (id > 0) onSuccess({ id, name: "User" + id });
        else        onError(new Error("ID invalide"));
    }, 100);
}

fetchUser(1,
    user => console.log("Utilisateur :", user.name),
    err  => console.log("Erreur :", err.message)
);
\`\`\`

### Ère 2 : Promesses

\`\`\`javascript
// Une Promesse a trois états : PENDING → FULFILLED ou REJECTED
function fetchUser(id) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            id > 0 ? resolve({ id, name: "User" + id })
                   : reject(new Error("ID invalide"));
        }, 100);
    });
}

// Chaînage — remplace l'enfer des callbacks
fetchUser(1)
    .then(user => { console.log(user.name); return user; })
    .catch(err  => console.log("Erreur :", err.message))
    .finally(() => console.log("Terminé"));

// Parallèle
Promise.all([fetchUser(1), fetchUser(2)])
    .then(([u1, u2]) => console.log(u1.name, u2.name));
\`\`\`

### Ère 3 : Async/Await (la façon moderne)

\`\`\`javascript
// async/await est du sucre syntaxique sur les Promesses
async function loadData(userId) {
    try {
        const user  = await fetchUser(userId);
        const posts = await fetchPosts(user.id);
        return { user, posts };
    } catch (err) {
        console.log("Erreur :", err.message);
        return null;
    }
}

// Parallèle avec async/await
async function loadParallel(ids) {
    const users = await Promise.all(ids.map(id => fetchUser(id)));
    return users;
}
\`\`\`

## Erreur courante : forEach avec async

\`\`\`javascript
// FAUX — forEach n'attend pas les Promesses
ids.forEach(async id => {
    const user = await fetchUser(id);   // non attendu !
});

// CORRECT — for...of attend correctement
for (const id of ids) {
    const user = await fetchUser(id);   // ✓
}

// CORRECT — parallèle avec Promise.all
await Promise.all(ids.map(id => fetchUser(id)));   // ✓
\`\`\`
`,
};

export const starterCode = {
  default: `// Async & Promises — Practice
// We simulate async operations with delay() since we're in a code editor

function delay(ms, value, shouldFail = false) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (shouldFail) reject(new Error("Failed: " + value));
            else            resolve(value);
        }, ms);
    });
}

// Simulated async API
const api = {
    getUser:     id  => delay(50, { id, name: "User" + id, active: id % 2 === 0 }),
    getPosts:    uid => delay(40, [{ id:1, title:"Hello", userId:uid }, { id:2, title:"World", userId:uid }]),
    getProfile:  id  => delay(60, { id, bio: "Bio for user " + id, followers: id * 100 }),
    badEndpoint: ()  => delay(30, null, true),
};

// ─── Part 1: Promises ─────────────────────────────────────
console.log("=== Part 1: Promise Chain ===");

api.getUser(1)
    .then(user => {
        console.log("User:", user.name);
        return api.getPosts(user.id);
    })
    .then(posts => {
        console.log("Posts:", posts.map(p => p.title).join(", "));
    })
    .catch(err => console.log("Error:", err.message))
    .finally(() => console.log("Chain complete"));

// ─── Part 2: Promise.all (parallel) ──────────────────────
console.log("\\n=== Part 2: Parallel with Promise.all ===");

Promise.all([api.getUser(1), api.getUser(2), api.getUser(3)])
    .then(users => {
        console.log("All users:", users.map(u => u.name).join(", "));
    });

// ─── Part 3: Promise.allSettled ──────────────────────────
console.log("\\n=== Part 3: allSettled (handles failures) ===");

Promise.allSettled([
    api.getUser(1),
    api.badEndpoint(),
    api.getUser(3),
]).then(results => {
    results.forEach((r, i) => {
        if (r.status === "fulfilled")
            console.log("  Result " + i + ": ✓", r.value?.name ?? r.value);
        else
            console.log("  Result " + i + ": ✗", r.reason.message);
    });
});

// ─── Part 4: async/await ──────────────────────────────────
console.log("\\n=== Part 4: async/await ===");

async function loadUserProfile(userId) {
    try {
        const user = await api.getUser(userId);
        console.log("  Got user:", user.name);

        const [posts, profile] = await Promise.all([
            api.getPosts(user.id),
            api.getProfile(user.id),
        ]);
        console.log("  Posts:", posts.length);
        console.log("  Followers:", profile.followers);

        return { user, posts, profile };
    } catch (err) {
        console.log("  Error:", err.message);
        return null;
    }
}

loadUserProfile(2).then(data => {
    if (data) console.log("  Loaded:", data.user.name);
});

// ─── Part 5: Sequential vs Parallel timing ────────────────
console.log("\\n=== Part 5: Sequential vs Parallel ===");

async function sequential(ids) {
    const start   = Date.now();
    const results = [];
    for (const id of ids) {
        results.push(await api.getUser(id));
    }
    console.log("  Sequential: " + (Date.now() - start) + "ms (" + results.length + " users)");
    return results;
}

async function parallel(ids) {
    const start   = Date.now();
    const results = await Promise.all(ids.map(id => api.getUser(id)));
    console.log("  Parallel:   " + (Date.now() - start) + "ms (" + results.length + " users)");
    return results;
}

const ids = [1, 2, 3, 4, 5];
sequential(ids).then(() => parallel(ids));
`,
};

export const exerciseEn = `Async/Await challenges.

For all exercises, paste this setup at the top of your code:

    const delay = (ms, val, fail=false) => new Promise((res,rej) =>
        setTimeout(() => fail ? rej(new Error("Failed")) : res(val), ms)
    );
    const api = {
        getUser:  id  => delay(30, { id, name: "User" + id, score: id * 10 }),
        getPosts: uid => delay(20, [{ id:1, title:"Post", views: uid * 100 }]),
        getScore: id  => id % 3 === 0 ? delay(20, null, true) : delay(25, id * 15),
    };

1. Write async 'fetchWithFallback(id)' that:
   - Tries api.getUser(id)
   - Returns the user on success
   - Returns { id, name: "Guest", score: 0 } on any failure
   Test with id=1 (success) and simulate a failure case.

2. Write async 'loadUsersParallel(ids)' that fetches all users
   in parallel and returns only the ones with score > 20.
   loadUsersParallel([1,2,3,4,5]) should filter to score > 20.

3. Write async 'retryUntilSuccess(fn, maxTries)' that calls fn()
   and retries up to maxTries times if it fails.
   Test it with api.getScore(3) (always fails)
   and api.getScore(1) (succeeds first try).

4. Write async 'batchProcess(ids, batchSize)' that processes ids
   in batches of batchSize to avoid overwhelming the server.
   batchProcess([1,2,3,4,5,6], 2) processes [1,2] then [3,4] then [5,6].
   Returns all results in order.`;

export const exerciseFr = `Défis Async/Await.

Pour tous les exercices, collez cette configuration en haut de votre code :

    const delay = (ms, val, fail=false) => new Promise((res,rej) =>
        setTimeout(() => fail ? rej(new Error("Failed")) : res(val), ms)
    );
    const api = {
        getUser:  id  => delay(30, { id, name: "User" + id, score: id * 10 }),
        getPosts: uid => delay(20, [{ id:1, title:"Post", views: uid * 100 }]),
        getScore: id  => id % 3 === 0 ? delay(20, null, true) : delay(25, id * 15),
    };

1. Écrivez async 'fetchAvecFallback(id)' qui tente api.getUser(id)
   et retourne { id, name: "Guest", score: 0 } en cas d'échec.
   Testez avec id=1 (succès) et simulez un échec.

2. Écrivez async 'chargerUsersParallele(ids)' qui récupère tous
   les utilisateurs en parallèle et retourne seulement ceux avec score > 20.

3. Écrivez async 'reessayerJusquAuSucces(fn, maxTentatives)' qui
   appelle fn() et réessaie jusqu'à maxTentatives fois en cas d'échec.
   Testez avec api.getScore(3) (toujours echec) et api.getScore(1).

4. Écrivez async 'traiterParLots(ids, tailleLot)' qui traite les ids
   par lots pour ne pas surcharger le serveur.
   traiterParLots([1,2,3,4,5,6], 2) traite [1,2] puis [3,4] puis [5,6].`;

export const solutionCode = {
  default: `// Setup
const delay = (ms, val, fail=false) => new Promise((res,rej) =>
    setTimeout(() => fail ? rej(new Error("Failed:" + val)) : res(val), ms)
);
const api = {
    getUser:  id  => delay(30, { id, name: "User" + id, score: id * 10 }),
    getPosts: uid => delay(20, [{ id:1, title:"Post", views: uid * 100 }]),
    getScore: id  => id % 3 === 0 ? delay(20, null, true) : delay(25, id * 15),
};

// 1. fetchWithFallback
async function fetchWithFallback(id) {
    try {
        return await api.getUser(id);
    } catch (err) {
        console.log("  Fallback triggered: " + err.message);
        return { id, name: "Guest", score: 0 };
    }
}

async function run() {
    console.log("=== 1. fetchWithFallback ===");
    const user1 = await fetchWithFallback(1);
    console.log("  id=1: " + user1.name + " (score " + user1.score + ")");

    const origGetUser = api.getUser;
    api.getUser = () => Promise.reject(new Error("Network error"));
    const guest = await fetchWithFallback(99);
    console.log("  id=99 (fails): " + guest.name + " (score " + guest.score + ")");
    api.getUser = origGetUser;

    // 2. loadUsersParallel
    console.log("\\n=== 2. loadUsersParallel ===");
    async function loadUsersParallel(ids) {
        const users = await Promise.all(ids.map(id => api.getUser(id)));
        return users.filter(u => u.score > 20);
    }

    const filtered = await loadUsersParallel([1,2,3,4,5]);
    console.log("  Users with score > 20: " + filtered.map(u => u.name).join(", "));
    console.log("  Scores: " + filtered.map(u => u.score).join(", "));

    // 3. retryUntilSuccess
    console.log("\\n=== 3. retryUntilSuccess ===");
    async function retryUntilSuccess(fn, maxTries = 3) {
        let lastErr;
        for (let attempt = 1; attempt <= maxTries; attempt++) {
            try {
                const result = await fn();
                console.log("  Succeeded on attempt " + attempt);
                return result;
            } catch (err) {
                lastErr = err;
                console.log("  Attempt " + attempt + " failed: " + err.message);
            }
        }
        throw new Error("All " + maxTries + " attempts failed: " + lastErr.message);
    }

    const score1 = await retryUntilSuccess(() => api.getScore(1));
    console.log("  Score for id=1: " + score1);

    try {
        await retryUntilSuccess(() => api.getScore(3), 3);
    } catch (err) {
        console.log("  id=3 gave up: " + err.message);
    }

    // 4. batchProcess
    console.log("\\n=== 4. batchProcess ===");
    async function batchProcess(ids, batchSize) {
        const results = [];
        for (let i = 0; i < ids.length; i += batchSize) {
            const batch = ids.slice(i, i + batchSize);
            console.log("  Processing batch: [" + batch.join(",") + "]");
            const batchResults = await Promise.all(batch.map(id => api.getUser(id)));
            results.push(...batchResults);
        }
        return results;
    }

    const allUsers = await batchProcess([1,2,3,4,5,6], 2);
    console.log("  Total users loaded: " + allUsers.length);
    console.log("  Names: " + allUsers.map(u => u.name).join(", "));
}

run().catch(err => console.log("Unexpected error:", err.message));
`,
};

export const quiz = {
  en: [
    {
      question:
        "What is the difference between synchronous and asynchronous code in JavaScript?",
      options: [
        "Synchronous code runs faster because it doesn't need to wait",
        "Synchronous code executes line by line, blocking until each operation completes. Asynchronous code starts an operation and immediately continues executing other code — it comes back to handle the result when it's ready. JavaScript uses async to prevent blocking the single thread: a 2-second network request doesn't freeze the entire browser.",
        "Asynchronous code runs on a separate thread while synchronous uses the main thread",
        "Synchronous code uses callbacks while asynchronous uses Promises",
      ],
      correct: 1,
    },
    {
      question:
        "What are the three states of a Promise and what transitions are possible?",
      options: [
        "loading, success, error — any state can transition to any other",
        "PENDING (in progress), FULFILLED (succeeded with a value), REJECTED (failed with a reason). Transitions are one-way: PENDING → FULFILLED or PENDING → REJECTED. Once settled (fulfilled or rejected) a Promise's state NEVER changes — it's immutable. Attaching .then() to an already-fulfilled Promise still works — the callback fires asynchronously.",
        "waiting, done, failed — fulfilled and rejected can transition back to pending",
        "created, running, complete — these map to the three phases of a network request",
      ],
      correct: 1,
    },
    {
      question:
        "What is the difference between Promise.all and Promise.allSettled?",
      options: [
        "Promise.all is faster because it stops as soon as one Promise resolves",
        "Promise.all rejects immediately if ANY promise rejects — the other results are lost. Promise.allSettled waits for ALL promises regardless of outcome and returns an array of {status, value|reason} objects for each. Use all() when you need all to succeed. Use allSettled() when you want all results even with partial failures — like loading multiple optional UI widgets.",
        "Promise.allSettled only works with arrays of exactly 2 promises",
        "Promise.all preserves insertion order while allSettled returns by completion order",
      ],
      correct: 1,
    },
    {
      question: "Why doesn't async/await work correctly inside forEach?",
      options: [
        "forEach doesn't support arrow functions with the async keyword",
        "forEach expects a synchronous callback. When you pass an async function, it fires each callback and ignores the returned Promise — forEach doesn't await them. So all callbacks START simultaneously (like parallel) but forEach returns before any of them finish. Code after the forEach runs immediately with no results. Fix: use for...of for sequential, or Promise.all(arr.map(async fn)) for parallel.",
        "forEach reverses the execution order of async callbacks",
        "async functions return undefined when used inside forEach",
      ],
      correct: 1,
    },
    {
      question:
        "When should you use sequential await vs Promise.all for multiple async operations?",
      options: [
        "Always use Promise.all — it's always faster than sequential await",
        "Use sequential await (for...of with await) when operations DEPEND on each other — when you need the result of step 1 to start step 2. Use Promise.all when operations are INDEPENDENT — they can run simultaneously. Example: fetch user (sequential, needed first), then fetch posts AND profile in parallel (independent). Mixing both is the optimal pattern for most real-world data loading.",
        "Use sequential await when there are more than 5 operations to avoid server overload",
        "Promise.all should only be used when all operations hit the same endpoint",
      ],
      correct: 1,
    },
  ],
  fr: [
    {
      question:
        "Quelle est la différence entre le code synchrone et asynchrone en JavaScript ?",
      options: [
        "Le code synchrone est plus rapide car il n'a pas besoin d'attendre",
        "Le code synchrone s'exécute ligne par ligne, bloquant jusqu'à la fin de chaque opération. Le code asynchrone démarre une opération et continue immédiatement à exécuter d'autre code — il revient gérer le résultat quand il est prêt. JavaScript utilise l'async pour éviter de bloquer le thread unique.",
        "Le code asynchrone s'exécute sur un thread séparé tandis que le synchrone utilise le thread principal",
        "Le code synchrone utilise des callbacks tandis que l'asynchrone utilise des Promesses",
      ],
      correct: 1,
    },
    {
      question:
        "Quels sont les trois états d'une Promesse et quelles transitions sont possibles ?",
      options: [
        "chargement, succès, erreur — n'importe quel état peut transitionner vers n'importe quel autre",
        "PENDING (en cours), FULFILLED (réussi avec une valeur), REJECTED (échoué avec une raison). Les transitions sont unidirectionnelles : PENDING → FULFILLED ou PENDING → REJECTED. Une fois résolue, l'état d'une Promesse ne change JAMAIS — elle est immuable.",
        "attente, terminé, échoué — fulfilled et rejected peuvent revenir à pending",
        "créé, en cours, complet — ces trois phases d'une requête réseau",
      ],
      correct: 1,
    },
    {
      question:
        "Quelle est la différence entre Promise.all et Promise.allSettled ?",
      options: [
        "Promise.all est plus rapide car il s'arrête dès qu'une Promesse se résout",
        "Promise.all rejette immédiatement si UNE promesse rejette. Promise.allSettled attend TOUTES les promesses indépendamment du résultat et retourne un tableau de {status, value|reason} pour chacune. Utilisez all() quand toutes doivent réussir. Utilisez allSettled() quand vous voulez tous les résultats même avec des échecs partiels.",
        "Promise.allSettled ne fonctionne qu'avec exactement 2 promesses",
        "Promise.all préserve l'ordre d'insertion tandis qu'allSettled retourne par ordre de completion",
      ],
      correct: 1,
    },
    {
      question:
        "Pourquoi async/await ne fonctionne-t-il pas correctement dans forEach ?",
      options: [
        "forEach ne supporte pas les fonctions fléchées avec le mot-clé async",
        "forEach attend un callback synchrone. Quand vous passez une fonction async, il démarre chaque callback et ignore la Promesse retournée — forEach ne les attend pas. Tout le code après forEach s'exécute immédiatement sans résultats. Fix : utilisez for...of pour séquentiel, ou Promise.all(arr.map(async fn)) pour parallèle.",
        "forEach inverse l'ordre d'exécution des callbacks async",
        "Les fonctions async retournent undefined quand elles sont utilisées dans forEach",
      ],
      correct: 1,
    },
    {
      question:
        "Quand utiliser await séquentiel vs Promise.all pour plusieurs opérations async ?",
      options: [
        "Toujours utiliser Promise.all — c'est toujours plus rapide",
        "Utilisez await séquentiel (for...of avec await) quand les opérations DÉPENDENT les unes des autres — quand vous avez besoin du résultat de l'étape 1 pour démarrer l'étape 2. Utilisez Promise.all quand les opérations sont INDÉPENDANTES — elles peuvent s'exécuter simultanément. Mélanger les deux est le pattern optimal pour la plupart des cas.",
        "Utilisez await séquentiel quand il y a plus de 5 opérations",
        "Promise.all ne devrait être utilisé que quand toutes les opérations touchent le même endpoint",
      ],
      correct: 1,
    },
  ],
};
