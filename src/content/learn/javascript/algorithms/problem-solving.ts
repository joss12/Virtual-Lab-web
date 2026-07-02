export const id = "problem-solving";
export const titleEn = "Problem Solving";
export const titleFr = "Résolution de problèmes";

export const content = {
  en: `# Problem Solving

## The Gap Between Knowing and Doing

You now know Big O, sorting, searching, recursion, and data structures in JavaScript. But there's a gap between knowing these tools and knowing **which one to reach for** when you see a problem you've never seen before.

Problem solving is a learnable skill. It has a repeatable method. This lesson teaches that method — and then drills it on real problems.

\`\`\`javascript
// Junior developer mindset: "I don't know how to solve this."
// Senior developer mindset: "I don't know the answer YET.
//                            But I know exactly how to find it."

// The difference is PROCESS. This lesson gives you that process.
\`\`\`

## The 5-Step Framework

Every problem — from trivial to Google-interview-hard — responds to the same process:

\`\`\`
Step 1: UNDERSTAND  — What exactly is being asked?
Step 2: EXPLORE     — Work through examples by hand
Step 3: PLAN        — Identify the pattern, choose the approach
Step 4: CODE        — Implement cleanly
Step 5: REVIEW      — Test edge cases, verify complexity
\`\`\`

**Never skip Steps 1-3.** Most bugs and wrong solutions come from jumping straight to Step 4.

## Step 1: Understand — Ask Before You Type

Before writing a single character of code, answer these questions:

\`\`\`javascript
// For ANY problem, ask:

// INPUT:
//   What type is the input? (array, string, number, object, graph?)
//   What are the constraints? (size? range? always valid?)
//   Can input be empty? null? negative?

// OUTPUT:
//   What exactly should be returned?
//   What format? What type?
//   Multiple answers or just one?

// EDGE CASES:
//   What if input is empty?
//   What if no answer exists?
//   What if there are duplicates?
//   What if all elements are the same?

// Example problem: "Given an array of integers, find the two numbers
//                  that add up to a target sum."

// Questions to ask:
// - Return the values or the indices?  (indices, as it turns out)
// - Can there be multiple pairs?       (problem guarantees exactly one)
// - Can the same element be used twice? (no)
// - What if no pair exists?            (guaranteed to exist)
// - What if array is empty or length 1? (won't happen per constraints)
// - Can numbers be negative?           (yes)
\`\`\`

## Step 2: Explore — Solve Examples by Hand

Before thinking about code, pick 2-3 concrete examples and trace through them manually. This reveals the pattern.

\`\`\`javascript
// Problem: find longest substring without repeating characters
// Input:   "abcabcbb"
// Output:  3 (the substring "abc")

// Trace by hand:
// Position: a b c a b c b b
// Index:    0 1 2 3 4 5 6 7

// Window: [a]         → length 1, no repeats
// Window: [a,b]       → length 2, no repeats
// Window: [a,b,c]     → length 3, no repeats  ← max so far = 3
// Window: [a,b,c,a]   → 'a' repeats! Shrink from left until clear
//   Remove 'a': [b,c,a]  → length 3, no repeats
// Window: [b,c,a,b]   → 'b' repeats! Shrink:
//   Remove 'b': [c,a,b]  → length 3
// Window: [c,a,b,c]   → 'c' repeats! Shrink:
//   Remove 'c': [a,b,c]  → length 3
// Window: [a,b,c,b]   → 'b' repeats! Shrink:
//   Remove 'a': [b,c,b]  → 'b' still repeats!
//   Remove 'b': [c,b]    → length 2

// Pattern discovered: sliding window — expand right, shrink left on repeat
// THEN write the code. Never before.
\`\`\`

## Step 3: Plan — The Pattern Catalog

Before coding, identify which pattern applies. Most problems map to one of these eight:

\`\`\`javascript
// PATTERN 1: TWO POINTERS
// When: sorted array, find pair/triplet, compare ends
// How:  left=0, right=end, move toward each other based on comparison
const twoPointers = (sortedArr, target) => {
    let left = 0, right = sortedArr.length - 1;
    while (left < right) {
        const sum = sortedArr[left] + sortedArr[right];
        if      (sum === target) return [left, right];
        else if (sum < target)  left++;
        else                    right--;
    }
    return null;
};

// PATTERN 2: SLIDING WINDOW
// When: "longest/shortest subarray/substring" with some condition
// How:  expand window right, shrink from left when condition violated
const slidingWindow = (s) => {
    let left = 0, maxLen = 0;
    const seen = new Map();
    for (let right = 0; right < s.length; right++) {
        if (seen.has(s[right]) && seen.get(s[right]) >= left) {
            left = seen.get(s[right]) + 1;
        }
        seen.set(s[right], right);
        maxLen = Math.max(maxLen, right - left + 1);
    }
    return maxLen;
};

// PATTERN 3: HASH MAP / SET
// When: "find duplicate", "two sum", "group by property", "first unique"
// How:  store seen values or mappings; O(1) lookup replaces O(N) scan
const hashPattern = (arr) => {
    const freq = new Map();
    for (const x of arr) freq.set(x, (freq.get(x) ?? 0) + 1);
    return freq;
};

// PATTERN 4: BINARY SEARCH
// When: sorted data, or "find minimum X satisfying condition" (answer space search)
// How:  if condition is monotone → binary search on the answer range
const binarySearchPattern = (sortedArr, target) => {
    let left = 0, right = sortedArr.length - 1;
    while (left <= right) {
        const mid = Math.floor((left + right) / 2);
        if      (sortedArr[mid] === target) return mid;
        else if (sortedArr[mid] < target)   left  = mid + 1;
        else                                right = mid - 1;
    }
    return -1;
};

// PATTERN 5: DFS / BFS
// When: trees, graphs, "find all paths", "connected components"
// DFS → recursion or stack → explores deep first
// BFS → queue → explores level by level, finds shortest path
const dfsPattern = (node, visited = new Set()) => {
    visited.add(node);
    for (const neighbor of node.neighbors ?? []) {
        if (!visited.has(neighbor)) dfsPattern(neighbor, visited);
    }
    return visited;
};

// PATTERN 6: DYNAMIC PROGRAMMING
// When: "count ways", "min/max cost", overlapping subproblems
// How:  memoize recursion OR build bottom-up table
const dpPattern = (coins, amount) => {
    const dp = new Array(amount + 1).fill(Infinity);
    dp[0] = 0;
    for (let a = 1; a <= amount; a++) {
        for (const coin of coins) {
            if (coin <= a) dp[a] = Math.min(dp[a], 1 + dp[a - coin]);
        }
    }
    return dp[amount] === Infinity ? -1 : dp[amount];
};

// PATTERN 7: GREEDY
// When: locally optimal choices lead to globally optimal result
// How:  sort, then always pick the best available option
// Example: minimum intervals to cover a range, activity selection

// PATTERN 8: DIVIDE AND CONQUER
// When: problem splits into independent subproblems
// How:  split, solve recursively, combine
// Example: merge sort, maximum subarray (Kadane's), closest pair of points
\`\`\`

## A Complete Walkthrough: Two Sum

\`\`\`javascript
// PROBLEM: Given array and target, return indices of two numbers that sum to target.
// Exactly one solution. Cannot use same element twice.

// STEP 1 — UNDERSTAND:
// Input:  array of integers (can be negative), target integer
// Output: [i, j] where nums[i] + nums[j] === target
// Edge:   guaranteed exactly one solution exists

// STEP 2 — EXPLORE:
// nums=[2,7,11,15], target=9
//   2+7=9 ✓ → [0,1]
// nums=[3,2,4], target=6
//   3+2=5 ✗, 3+4=7 ✗, 2+4=6 ✓ → [1,2]
// nums=[3,3], target=6
//   3+3=6 ✓ → [0,1]  (different indices, same value — ok)

// STEP 3 — PLAN:
// Brute force: try every pair → O(N²)
// Better: for each num, we need (target - num) to exist
//   Store index of each num in a Map as we go
//   For each num: check if complement is already in Map → O(1)
//   One pass: O(N) time, O(N) space
// Pattern: HASH MAP

// STEP 4 — CODE:
function twoSum(nums, target) {
    const seen = new Map();   // value → index

    for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];

        if (seen.has(complement)) {
            return [seen.get(complement), i];
        }

        seen.set(nums[i], i);   // store AFTER checking — can't use same element twice
    }

    return [];   // no solution (problem guarantees this won't happen)
}

// STEP 5 — REVIEW:
console.log(twoSum([2,7,11,15], 9));    // [0,1] ✓
console.log(twoSum([3,2,4],     6));    // [1,2] ✓
console.log(twoSum([3,3],       6));    // [0,1] ✓
console.log(twoSum([-1,0,1,2], 0));    // [0,2] ✓ handles negatives
// Complexity: O(N) time, O(N) space ✓
\`\`\`

## A Complete Walkthrough: Sliding Window

\`\`\`javascript
// PROBLEM: Longest substring without repeating characters.
// Input:  "abcabcbb"
// Output: 3

// PLAN (from Step 2 trace above): SLIDING WINDOW
// - 'left' is the left boundary of our current valid window
// - 'right' expands to grow the window each iteration
// - Map tracks the last seen index of each character
// - When we see a repeat inside our window, jump left past it

function lengthOfLongestSubstring(s) {
    const lastSeen = new Map();   // char → last index seen
    let left   = 0;
    let maxLen = 0;

    for (let right = 0; right < s.length; right++) {
        const char = s[right];

        // If char was seen AND it's inside our current window:
        if (lastSeen.has(char) && lastSeen.get(char) >= left) {
            // Jump left past the previous occurrence
            left = lastSeen.get(char) + 1;
        }

        lastSeen.set(char, right);
        maxLen = Math.max(maxLen, right - left + 1);
    }

    return maxLen;
}

console.log(lengthOfLongestSubstring("abcabcbb"));  // 3 ("abc")
console.log(lengthOfLongestSubstring("bbbbb"));     // 1 ("b")
console.log(lengthOfLongestSubstring("pwwkew"));    // 3 ("wke")
console.log(lengthOfLongestSubstring(""));          // 0
console.log(lengthOfLongestSubstring("dvdf"));      // 3 ("vdf")
// Complexity: O(N) time — each character visited at most twice
//             O(min(N,M)) space — M = character set size
\`\`\`

## A Complete Walkthrough: Dynamic Programming

\`\`\`javascript
// PROBLEM: Minimum coins to make a target amount.
// Coins = [1, 5, 10, 25], amount = 36 → 3 (25+10+1)

// STEP 1 — UNDERSTAND:
// Can use each coin unlimited times.
// Return -1 if impossible.

// STEP 2 — EXPLORE:
// amount=6:  5+1 = 2 coins
// amount=11: 10+1 = 2 coins
// amount=36: 25+10+1 = 3 coins (greedy works here but not always!)

// STEP 3 — PLAN: DP
// Recognize DP: "minimum number" + overlapping subproblems
// Key insight: minCoins(36) = 1 + min(
//     minCoins(36-1),  minCoins(36-5),
//     minCoins(36-10), minCoins(36-25)
// )
// Build bottom-up: solve for 0,1,2,...,amount
// dp[i] = minimum coins for amount i

// STEP 4 — CODE:
function minCoins(coins, amount) {
    const dp = new Array(amount + 1).fill(Infinity);
    dp[0] = 0;   // base case: 0 coins to make amount 0

    for (let a = 1; a <= amount; a++) {
        for (const coin of coins) {
            if (coin <= a) {
                dp[a] = Math.min(dp[a], 1 + dp[a - coin]);
            }
        }
    }

    return dp[amount] === Infinity ? -1 : dp[amount];
}

// STEP 5 — REVIEW:
console.log(minCoins([1,5,10,25], 36));   // 3  (25+10+1)
console.log(minCoins([1,5,10,25], 11));   // 2  (10+1)
console.log(minCoins([2],         3));    // -1 (impossible)
console.log(minCoins([1,2,5],     11));   // 3  (5+5+1)

// STEP 5 — Trace dp for coins=[1,5] amount=7:
// dp[0]=0
// dp[1]=1   (1 coin of 1)
// dp[2]=2   (2 coins of 1)
// dp[3]=3
// dp[4]=4
// dp[5]=1   (1 coin of 5)
// dp[6]=2   (5+1)
// dp[7]=3   (5+1+1)
\`\`\`

## Recognizing Patterns from Keywords

\`\`\`javascript
// "Pair/triplet that sums to X"         → Two pointers or Hash map
// "Longest/shortest subarray/window"    → Sliding window
// "Does X exist in sorted array"        → Binary search
// "Find minimum X satisfying condition" → Binary search on answer space
// "All paths in graph"                  → DFS
// "Shortest path in graph"              → BFS
// "Count ways to do X"                  → Dynamic programming
// "Minimum/maximum cost"                → DP or Greedy
// "Top K elements"                      → Heap (priority queue)
// "Frequency of elements"               → Hash map + Map/Counter
// "Parentheses / brackets"              → Stack
// "Intervals / scheduling"              → Sort by start + greedy/heap
// "Cycle in linked list"                → Two pointers (fast/slow)
// "Rotate / shift array"                → Reversal trick or modulo
// "String permutation / anagram"        → Sort or frequency map
// "Matrix traversal"                    → DFS/BFS with visited set
\`\`\`

## Optimization: From Working to Fast

Once you have a working solution, make it faster with these moves:

\`\`\`javascript
// OPTIMIZATION MOVE 1: Replace array lookup with Set/Map
// Symptom: arr.includes() or arr.indexOf() inside a loop
// Cost: O(N²) → Fix: O(N)

// Before:
function hasDuplicate_slow(arr) {
    for (let i = 0; i < arr.length; i++) {
        if (arr.indexOf(arr[i]) !== i) return true;   // O(N) inside O(N)
    }
    return false;
}
// After:
function hasDuplicate_fast(arr) {
    return new Set(arr).size !== arr.length;   // O(N) total
}

// OPTIMIZATION MOVE 2: Precompute outside the loop
// Symptom: same computation repeated every iteration
// Cost: O(N²) → Fix: O(N)

// Before:
function sumExcluding_slow(arr, exclude) {
    return arr.filter(x => !exclude.includes(x)).reduce((s,n)=>s+n,0);
    //                           ↑ O(N) per element = O(N²)
}
// After:
function sumExcluding_fast(arr, exclude) {
    const excludeSet = new Set(exclude);   // O(N) once
    return arr.filter(x => !excludeSet.has(x)).reduce((s,n)=>s+n,0);
    //                           ↑ O(1) per element = O(N)
}

// OPTIMIZATION MOVE 3: Process in a single pass instead of multiple
// Symptom: multiple filter/map/reduce chains
// Cost: O(3N) → Fix: O(N) (constant matters here)

// Before: three separate passes
function process_slow(arr) {
    const filtered  = arr.filter(x => x > 0);
    const doubled   = filtered.map(x => x * 2);
    const sum       = doubled.reduce((s,n) => s+n, 0);
    return sum;
}
// After: one pass with reduce
function process_fast(arr) {
    return arr.reduce((sum, x) => x > 0 ? sum + x * 2 : sum, 0);
}

// OPTIMIZATION MOVE 4: Use the right data structure from the start
// Symptom: push to array then sort repeatedly
// Cost: O(N log N) per push → Fix: O(log N) with a heap

// OPTIMIZATION MOVE 5: Binary search instead of linear scan
// Symptom: find() on a sorted array
// Cost: O(N) → Fix: O(log N)
\`\`\`

## Practice Problems by Pattern

\`\`\`javascript
// HASH MAP: Group Anagrams
function groupAnagrams(words) {
    const groups = new Map();
    for (const word of words) {
        const key = [...word].sort().join("");   // sorted chars = canonical form
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key).push(word);
    }
    return [...groups.values()];
}
console.log(groupAnagrams(["eat","tea","tan","ate","nat","bat"]));
// [["eat","tea","ate"],["tan","nat"],["bat"]]

// TWO POINTERS: Container With Most Water
function maxWater(heights) {
    let left = 0, right = heights.length - 1, maxArea = 0;
    while (left < right) {
        const area = (right - left) * Math.min(heights[left], heights[right]);
        maxArea = Math.max(maxArea, area);
        // Move the shorter wall inward — only hope for improvement
        if (heights[left] < heights[right]) left++;
        else                                right--;
    }
    return maxArea;
}
console.log(maxWater([1,8,6,2,5,4,8,3,7]));   // 49

// SLIDING WINDOW: Maximum Sum Subarray of Size K
function maxSumSubarray(nums, k) {
    let windowSum = nums.slice(0, k).reduce((s,n)=>s+n, 0);
    let maxSum    = windowSum;
    for (let i = k; i < nums.length; i++) {
        windowSum += nums[i] - nums[i - k];   // slide: add right, remove left
        maxSum = Math.max(maxSum, windowSum);
    }
    return maxSum;
}
console.log(maxSumSubarray([2,1,5,1,3,2], 3));   // 9 (5+1+3)

// BINARY SEARCH ON ANSWER: Minimum Maximum
function splitArrayMinMax(nums, k) {
    // Can we split nums into k parts where each part sum ≤ limit?
    const canSplit = (limit) => {
        let groups = 1, current = 0;
        for (const n of nums) {
            if (current + n > limit) { groups++; current = 0; }
            current += n;
        }
        return groups <= k;
    };

    let left = Math.max(...nums), right = nums.reduce((s,n)=>s+n,0);
    while (left < right) {
        const mid = Math.floor((left + right) / 2);
        if (canSplit(mid)) right = mid;
        else               left  = mid + 1;
    }
    return left;
}
console.log(splitArrayMinMax([7,2,5,10,8], 2));   // 18 ([7,2,5] and [10,8])

// KADANE'S ALGORITHM: Maximum Subarray (Greedy/DP hybrid)
function maxSubarray(nums) {
    // At each position: extend current subarray OR start fresh
    // Start fresh when current sum becomes negative — it only hurts us
    let maxSum = nums[0], currentSum = nums[0];
    for (let i = 1; i < nums.length; i++) {
        currentSum = Math.max(nums[i], currentSum + nums[i]);
        maxSum     = Math.max(maxSum, currentSum);
    }
    return maxSum;
}
console.log(maxSubarray([-2,1,-3,4,-1,2,1,-5,4]));   // 6 ([4,-1,2,1])
\`\`\`

## The Problem-Solving Mindset

\`\`\`javascript
// 1. It's OK to not know immediately.
//    Real engineers search, ask colleagues, read documentation.
//    The skill is knowing WHAT to search and HOW to verify the answer.

// 2. Start with brute force.
//    A working O(N²) solution is infinitely better than no solution.
//    Get it working. Then optimize. Never the other way around.

// 3. Explain your thinking.
//    In interviews: think aloud.
//    At work: rubber duck debug.
//    Explaining a problem often reveals the solution.

// 4. Stuck? Try a smaller example.
//    Can't solve [1,2,3,4,5]? Solve [1], then [1,2].
//    The pattern becomes obvious at tiny scale.

// 5. Stuck longer? Write what you KNOW.
//    Write the function signature.
//    Write the base cases.
//    Write one concrete example in comments.
//    Often starting the code unlocks the rest.

// 6. Learn from every problem you solve.
//    After solving: what PATTERN was this?
//    Where have I seen this pattern before?
//    How would I recognize it faster next time?

// The master pattern-recognizer isn't smarter —
// they've just seen more problems and labeled them correctly.
// Every problem you do now is a template for the next one.
\`\`\`

## Quick Reference Cheat Sheet

\`\`\`javascript
// ─── Framework ───────────────────────────────────────────
// 1. UNDERSTAND  (inputs, outputs, constraints, edge cases)
// 2. EXPLORE     (work 2-3 examples by hand)
// 3. PLAN        (identify pattern BEFORE coding)
// 4. CODE        (implement cleanly)
// 5. REVIEW      (test edge cases, verify complexity)

// ─── Pattern Triggers ────────────────────────────────────
// Pair/triplet sum          → Two pointers or Hash map
// Longest/shortest window   → Sliding window
// Sorted + find value       → Binary search
// Min X satisfying cond     → Binary search on answer space
// All paths / exists path   → DFS
// Shortest path             → BFS
// Count ways / min/max      → Dynamic programming
// Top K                     → Heap
// Frequency / grouping      → Hash map
// Brackets                  → Stack
// Intervals                 → Sort + greedy/heap
// Fast/slow cycle           → Two pointers

// ─── Optimization Moves ──────────────────────────────────
// arr.includes() in loop    → Convert to Set first
// Repeated computation      → Precompute outside loop
// Multiple array passes     → Combine into one reduce
// Push+sort repeated        → Use a heap
// find() on sorted          → Binary search
\`\`\`
`,

  fr: `# Résolution de problèmes

## Le cadre en 5 étapes

\`\`\`
Étape 1 : COMPRENDRE  (entrées, sorties, contraintes, cas limites)
Étape 2 : EXPLORER    (résoudre 2-3 exemples à la main)
Étape 3 : PLANIFIER   (identifier le pattern AVANT de coder)
Étape 4 : CODER       (implémenter proprement)
Étape 5 : RÉVISER     (tester les cas limites, vérifier la complexité)
\`\`\`

## Reconnaissance rapide des patterns

\`\`\`javascript
// "Paire/triplet qui somme à X"          → Deux pointeurs ou Hash map
// "Fenêtre la plus longue/courte"        → Fenêtre glissante
// "Existe dans tableau trié"             → Recherche binaire
// "Minimum X satisfaisant condition"     → Recherche binaire sur réponses
// "Tous les chemins dans graphe"         → DFS
// "Chemin le plus court"                 → BFS
// "Compter les façons / min / max coût"  → Programmation dynamique
// "Top K éléments"                       → Tas (Heap)
// "Fréquence / groupement"               → Table de hachage
// "Parenthèses"                          → Pile
\`\`\`

## Exemple complet : Two Sum

\`\`\`javascript
// COMPRENDRE : indices de deux nombres dont la somme = cible
// EXPLORER   : [2,7,11,15] cible=9 → 2+7=9 → [0,1]
// PLANIFIER  : Table de hachage — pour chaque x, chercher (cible-x)

function deuxSomme(nums, cible) {
    const vus = new Map();   // valeur → index

    for (let i = 0; i < nums.length; i++) {
        const complement = cible - nums[i];
        if (vus.has(complement)) return [vus.get(complement), i];
        vus.set(nums[i], i);   // stocker APRÈS vérification
    }
    return [];
}

console.log(deuxSomme([2,7,11,15], 9));   // [0, 1]
console.log(deuxSomme([3,2,4],     6));   // [1, 2]
\`\`\`

## Mouvements d'optimisation

\`\`\`javascript
// arr.includes() dans une boucle → Convertir en Set d'abord (O(N²) → O(N))
// Calcul répété                  → Précalculer en dehors de la boucle
// Plusieurs passes sur tableau   → Combiner en un seul reduce
// find() sur tableau trié        → Recherche binaire
\`\`\`
`,
};

export const starterCode = {
  default: `// Problem Solving — JavaScript Practice
// Apply the 5-step framework to each problem

// ─── PROBLEM 1: Two Sum (Hash Map pattern) ───────────────
function twoSum(nums, target) {
    const seen = new Map();
    for (let i = 0; i < nums.length; i++) {
        const comp = target - nums[i];
        if (seen.has(comp)) return [seen.get(comp), i];
        seen.set(nums[i], i);
    }
    return [];
}

console.log("=== Two Sum ===");
console.log(twoSum([2,7,11,15], 9));    // [0,1]
console.log(twoSum([3,2,4],     6));    // [1,2]
console.log(twoSum([3,3],       6));    // [0,1]
console.log(twoSum([-1,0,1,2],  0));   // [0,2]

// ─── PROBLEM 2: Sliding Window ───────────────────────────
function longestUnique(s) {
    const last = new Map();
    let left = 0, max = 0;
    for (let right = 0; right < s.length; right++) {
        if (last.has(s[right]) && last.get(s[right]) >= left)
            left = last.get(s[right]) + 1;
        last.set(s[right], right);
        max = Math.max(max, right - left + 1);
    }
    return max;
}

console.log("\\n=== Longest Unique Substring ===");
console.log(longestUnique("abcabcbb"));   // 3
console.log(longestUnique("bbbbb"));      // 1
console.log(longestUnique("pwwkew"));     // 3
console.log(longestUnique(""));           // 0

// ─── PROBLEM 3: Dynamic Programming ─────────────────────
function minCoins(coins, amount) {
    const dp = new Array(amount + 1).fill(Infinity);
    dp[0] = 0;
    for (let a = 1; a <= amount; a++)
        for (const c of coins)
            if (c <= a) dp[a] = Math.min(dp[a], 1 + dp[a - c]);
    return dp[amount] === Infinity ? -1 : dp[amount];
}

console.log("\\n=== Minimum Coins ===");
console.log(minCoins([1,5,10,25], 36));   // 3
console.log(minCoins([1,2,5],     11));   // 3
console.log(minCoins([2],          3));   // -1

// ─── PROBLEM 4: Two Pointers ─────────────────────────────
function maxWater(heights) {
    let left = 0, right = heights.length - 1, best = 0;
    while (left < right) {
        best = Math.max(best, (right-left) * Math.min(heights[left], heights[right]));
        heights[left] < heights[right] ? left++ : right--;
    }
    return best;
}

console.log("\\n=== Container With Most Water ===");
console.log(maxWater([1,8,6,2,5,4,8,3,7]));   // 49
console.log(maxWater([1,1]));                    // 1

// ─── PROBLEM 5: Kadane's Algorithm ───────────────────────
function maxSubarray(nums) {
    let maxSum = nums[0], cur = nums[0];
    for (let i = 1; i < nums.length; i++) {
        cur    = Math.max(nums[i], cur + nums[i]);
        maxSum = Math.max(maxSum, cur);
    }
    return maxSum;
}

console.log("\\n=== Maximum Subarray ===");
console.log(maxSubarray([-2,1,-3,4,-1,2,1,-5,4]));   // 6
console.log(maxSubarray([1]));                          // 1
console.log(maxSubarray([-1,-2,-3]));                   // -1
`,
};

export const exerciseEn = `Apply the 5-step framework to each problem.
Write your understanding and plan in comments before coding.

1. VALID ANAGRAM (Hash Map)
   Given two strings s and t, return true if t is an anagram of s.
   isAnagram("anagram", "nagaram") → true
   isAnagram("rat", "car") → false
   Must be O(N) time and O(1) space (26 lowercase letters → bounded space).

2. MEETING ROOMS (Sorting + Greedy)
   Given intervals [[start,end],...], find the minimum number of
   meeting rooms needed so no two meetings overlap simultaneously.
   minRooms([[0,30],[5,10],[15,20]]) → 2
   Hint: events = starts (+1) and ends (-1) sorted by time.

3. FIND DUPLICATE (Two Pointers on array as linked list)
   Given an array of N+1 integers where each is in [1,N],
   there is exactly one duplicate. Find it in O(N) time, O(1) space.
   findDuplicate([1,3,4,2,2]) → 2
   findDuplicate([3,1,3,4,2]) → 3
   Hint: treat each value as a pointer to the next index (Floyd's cycle).

4. LONGEST INCREASING SUBSEQUENCE (DP)
   Find the length of the longest strictly increasing subsequence.
   LIS([10,9,2,5,3,7,101,18]) → 4  ([2,3,7,101] or [2,5,7,101])
   LIS([0,1,0,3,2,3])         → 4
   LIS([7,7,7,7,7])            → 1`;

export const exerciseFr = `Appliquez le cadre en 5 étapes à chaque problème.

1. ANAGRAMME VALIDE (Table de hachage)
   Retourner true si t est un anagramme de s. O(N) temps, O(1) espace.

2. SALLES DE RÉUNION (Tri + Glouton)
   Nombre minimum de salles pour qu'aucune réunion ne se chevauche.
   minSalles([[0,30],[5,10],[15,20]]) → 2

3. TROUVER LE DOUBLON (Deux pointeurs Floyd)
   Tableau de N+1 entiers dans [1,N], exactement un doublon.
   Trouver en O(N) temps, O(1) espace.

4. PLUS LONGUE SOUS-SÉQUENCE CROISSANTE (Programmation dynamique)
   LPS([10,9,2,5,3,7,101,18]) → 4`;

export const solutionCode = {
  default: `// 1. Valid Anagram — O(N) time, O(1) space
function isAnagram(s, t) {
    if (s.length !== t.length) return false;
    // 26-element array for a-z — O(1) space (bounded by alphabet)
    const count = new Array(26).fill(0);
    for (let i = 0; i < s.length; i++) {
        count[s.charCodeAt(i) - 97]++;   // increment for s
        count[t.charCodeAt(i) - 97]--;   // decrement for t
    }
    return count.every(c => c === 0);    // all must cancel out
}

console.log("=== Anagram ===");
console.log(isAnagram("anagram", "nagaram"));   // true
console.log(isAnagram("rat",     "car"));       // false
console.log(isAnagram("ab",      "a"));         // false

// 2. Meeting Rooms — O(N log N)
// Plan: every start adds a room needed, every end frees one.
// Sort all events by time, process in order, track max concurrent.
function minRooms(intervals) {
    const events = [];
    for (const [start, end] of intervals) {
        events.push([start,  1]);   // room needed
        events.push([end,   -1]);   // room freed
    }
    // Sort by time; ties: ends (-1) before starts (+1) = end before next starts
    events.sort((a, b) => a[0] !== b[0] ? a[0] - b[0] : a[1] - b[1]);

    let current = 0, maxRooms = 0;
    for (const [, change] of events) {
        current  += change;
        maxRooms  = Math.max(maxRooms, current);
    }
    return maxRooms;
}

console.log("\\n=== Meeting Rooms ===");
console.log(minRooms([[0,30],[5,10],[15,20]]));   // 2
console.log(minRooms([[7,10],[2,4]]));            // 1  (don't overlap)
console.log(minRooms([[0,10],[10,20]]));           // 1  (end before next start)
console.log(minRooms([[1,5],[2,6],[3,7]]));        // 3

// 3. Find Duplicate — Floyd's cycle detection O(N) time, O(1) space
// Insight: treat each value as a pointer to the next index.
// If arr=[1,3,4,2,2]: 0→1→3→2→4→2→4→... cycle at 2!
// Phase 1: find meeting point inside cycle (fast/slow pointers)
// Phase 2: find cycle entrance = the duplicate
function findDuplicate(nums) {
    // Phase 1: detect cycle
    let slow = nums[0];
    let fast = nums[0];
    do {
        slow = nums[slow];
        fast = nums[nums[fast]];
    } while (slow !== fast);

    // Phase 2: find entrance to cycle (= duplicate number)
    let pointer = nums[0];
    while (pointer !== slow) {
        pointer = nums[pointer];
        slow    = nums[slow];
    }
    return slow;
}

console.log("\\n=== Find Duplicate ===");
console.log(findDuplicate([1,3,4,2,2]));   // 2
console.log(findDuplicate([3,1,3,4,2]));   // 3
console.log(findDuplicate([1,1]));          // 1

// 4. Longest Increasing Subsequence — O(N²) DP
// dp[i] = length of LIS ending at index i
function LIS(nums) {
    if (nums.length === 0) return 0;
    const dp = new Array(nums.length).fill(1);  // every element alone = LIS of 1

    for (let i = 1; i < nums.length; i++) {
        for (let j = 0; j < i; j++) {
            if (nums[j] < nums[i]) {
                dp[i] = Math.max(dp[i], dp[j] + 1);
                // "if I extend the LIS ending at j with nums[i]"
            }
        }
    }
    return Math.max(...dp);
}

console.log("\\n=== LIS ===");
console.log(LIS([10,9,2,5,3,7,101,18]));   // 4  ([2,3,7,101])
console.log(LIS([0,1,0,3,2,3]));            // 4  ([0,1,2,3])
console.log(LIS([7,7,7,7,7]));              // 1  (all same — no STRICTLY increasing)
console.log(LIS([1,2,3,4,5]));              // 5  (already sorted)
`,
};

export const quiz = {
  en: [
    {
      question:
        "Why should you never skip the 'Explore' step and jump straight to coding?",
      options: [
        "The Explore step is only necessary for graph and tree problems",
        "Working through concrete examples manually reveals the underlying pattern — you discover HOW the solution works before trying to express it in code. Jumping straight to code usually means writing code that solves the wrong problem, misses edge cases that would have been obvious in examples, or implements a suboptimal approach that you discover too late to change cleanly.",
        "The Explore step is required by coding interview guidelines",
        "Working examples manually makes the code run faster at runtime",
      ],
      correct: 1,
    },
    {
      question:
        "How does Kadane's algorithm decide whether to extend the current subarray or start fresh?",
      options: [
        "It always extends the current subarray and trims it at the end",
        "At each element, it computes max(nums[i], currentSum + nums[i]). If currentSum is negative, adding it to nums[i] makes the result SMALLER than nums[i] alone — so starting fresh (just nums[i]) is better. If currentSum is positive, extending is better. This greedy local decision provably leads to the global maximum subarray sum.",
        "It uses dynamic programming to try all O(N²) subarrays and track the maximum",
        "It sorts the array first then uses two pointers to find the maximum",
      ],
      correct: 1,
    },
    {
      question:
        "The meeting rooms problem: why does treating starts as +1 and ends as -1 work?",
      options: [
        "It converts the 2D interval problem into a 1D sorting problem",
        "Each meeting start requires allocating a new room (+1 rooms needed). Each meeting end frees a room (-1). Processing all events sorted by time and tracking the running sum gives the current number of rooms in use at any moment. The maximum of this running sum is the minimum rooms needed — because that's the peak of concurrent meetings.",
        "The +1/-1 technique only works when meetings don't share end/start times",
        "It works because meetings always end before new ones start in the test cases",
      ],
      correct: 1,
    },
    {
      question:
        "Why can you use Floyd's cycle detection to find a duplicate in an array where values are in [1,N]?",
      options: [
        "Because arrays with values in [1,N] are always sorted enabling fast lookup",
        "Treating each value as a pointer to the next index creates a linked list. With values in [1,N] and N+1 elements, by the pigeonhole principle there must be a duplicate. The duplicate value means two positions point to the same index — creating a cycle. The cycle's entrance (where both pointers meet after reset) IS the duplicate value. This gives O(N) time and O(1) space — no visited array needed.",
        "Floyd's algorithm works on any array regardless of value range",
        "The algorithm only finds duplicates if they appear exactly twice",
      ],
      correct: 1,
    },
    {
      question:
        "When should you use binary search on the answer space instead of searching an array?",
      options: [
        "When the array is too large to fit in memory",
        "When the answer you're looking for exists in a RANGE and feasibility is monotone: if answer X works, then X+1 (or X-1) also works. Instead of checking all possible answers linearly, you binary search the range [min_answer, max_answer]. For each midpoint, you check feasibility in O(N). This turns O(N × K) brute force into O(N log K) — examples: minimum ship speed, minimum max subarray, k-th smallest in sorted matrix.",
        "When the array contains both positive and negative numbers",
        "When you need to find multiple answers instead of just one",
      ],
      correct: 1,
    },
  ],
  fr: [
    {
      question:
        "Pourquoi ne jamais sauter l'étape 'Explorer' et passer directement au codage ?",
      options: [
        "L'étape Explorer n'est nécessaire que pour les problèmes de graphes et arbres",
        "Travailler des exemples concrets manuellement révèle le pattern sous-jacent — vous découvrez COMMENT la solution fonctionne avant d'essayer de l'exprimer en code. Sauter directement au code signifie généralement écrire du code qui résout le mauvais problème, manque des cas limites évidents dans les exemples, ou implémente une approche sous-optimale.",
        "L'étape Explorer est requise par les directives d'entretiens de codage",
        "Travailler les exemples manuellement rend le code plus rapide à l'exécution",
      ],
      correct: 1,
    },
    {
      question:
        "Comment l'algorithme de Kadane décide-t-il d'étendre le sous-tableau ou de repartir à zéro ?",
      options: [
        "Il étend toujours le sous-tableau actuel et le taille à la fin",
        "À chaque élément, il calcule max(nums[i], sommeActuelle + nums[i]). Si sommeActuelle est négative, l'ajouter à nums[i] rend le résultat PLUS PETIT que nums[i] seul — donc repartir à zéro est mieux. Si sommeActuelle est positive, étendre est mieux. Cette décision locale greedy mène au maximum global.",
        "Il utilise la programmation dynamique pour essayer tous les O(N²) sous-tableaux",
        "Il trie d'abord le tableau puis utilise deux pointeurs",
      ],
      correct: 1,
    },
    {
      question:
        "Pour les salles de réunion : pourquoi traiter les débuts comme +1 et les fins comme -1 fonctionne-t-il ?",
      options: [
        "Cela convertit le problème 2D en un problème de tri 1D",
        "Chaque début de réunion nécessite d'allouer une nouvelle salle (+1). Chaque fin libère une salle (-1). Traiter tous les événements triés par temps et suivre la somme courante donne le nombre de salles en cours d'utilisation à tout moment. Le maximum de cette somme est le minimum de salles nécessaires.",
        "La technique +1/-1 ne fonctionne que quand les réunions ne partagent pas les heures de fin/début",
        "Cela fonctionne car les réunions se terminent toujours avant que de nouvelles ne commencent",
      ],
      correct: 1,
    },
    {
      question:
        "Pourquoi peut-on utiliser la détection de cycle de Floyd pour trouver un doublon dans un tableau où les valeurs sont dans [1,N] ?",
      options: [
        "Car les tableaux avec des valeurs dans [1,N] sont toujours triés permettant une recherche rapide",
        "Traiter chaque valeur comme un pointeur vers l'index suivant crée une liste chaînée. Avec des valeurs dans [1,N] et N+1 éléments, par le principe des tiroirs il doit y avoir un doublon. La valeur en double fait que deux positions pointent vers le même index — créant un cycle. L'entrée du cycle est la valeur dupliquée. Cela donne O(N) temps et O(1) espace.",
        "L'algorithme de Floyd fonctionne sur n'importe quel tableau indépendamment de la plage de valeurs",
        "L'algorithme ne trouve que les doublons qui apparaissent exactement deux fois",
      ],
      correct: 1,
    },
    {
      question:
        "Quand devriez-vous utiliser la recherche binaire sur l'espace des réponses plutôt que sur un tableau ?",
      options: [
        "Quand le tableau est trop grand pour tenir en mémoire",
        "Quand la réponse existe dans une PLAGE et que la faisabilité est monotone : si la réponse X fonctionne, alors X+1 (ou X-1) aussi. Au lieu de vérifier toutes les réponses possibles linéairement, vous faites une recherche binaire sur [réponse_min, réponse_max]. Pour chaque milieu, vous vérifiez la faisabilité en O(N). Cela transforme O(N × K) en O(N log K).",
        "Quand le tableau contient à la fois des nombres positifs et négatifs",
        "Quand vous devez trouver plusieurs réponses au lieu d'une seule",
      ],
      correct: 1,
    },
  ],
};
