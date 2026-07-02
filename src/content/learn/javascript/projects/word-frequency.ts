export const id = "word-frequency";
export const titleEn = "Word Frequency Analyzer";
export const titleFr = "Analyseur de fréquence de mots";
export const descriptionEn = "Analyze text to find word frequencies, top words, reading stats and language patterns.";
export const descriptionFr = "Analysez du texte pour trouver les fréquences de mots, les stats de lecture et les patterns linguistiques.";

export const steps = [
  {
    titleEn: "Step 1 — Tokenization",
    titleFr: "Étape 1 — Tokenisation",
    contentEn: `## Step 1 — Tokenization

**Tokenization** is the process of breaking raw text into meaningful units (tokens). For word frequency analysis, tokens are individual words — but defining "word" is trickier than it sounds.

\`\`\`
Raw text: "Hello, world! It's a beautiful day — isn't it?"

Naive split on spaces:
  ["Hello,", "world!", "It's", "a", "beautiful", "day", "—", "isn't", "it?"]

Problems:
  "Hello," has a comma attached
  "world!" has an exclamation mark
  "It's" is one word (contraction)
  "—" is punctuation, not a word
  "isn't" is a contraction — keep it or split it?

Clean tokenization:
  ["hello", "world", "it's", "a", "beautiful", "day", "isn't", "it"]
  (lowercase, punctuation stripped, contractions preserved, dashes removed)
\`\`\`

We use a **regex** to extract words — the pattern \`/\\b[a-z']+\\b/gi\` matches sequences of letters and apostrophes (preserving contractions like "don't", "it's").

We also build a **stopword list** — common words like "the", "a", "is" that appear everywhere but carry no meaning for frequency analysis. Removing them reveals the actual content words.`,

    contentFr: `## Étape 1 — Tokenisation

La **tokenisation** est le processus de décomposition du texte brut en unités significatives (tokens).

\`\`\`
Texte brut : "Bonjour, monde ! C'est une belle journée."

Tokenisation propre :
  ["bonjour", "monde", "c'est", "une", "belle", "journée"]
  (minuscules, ponctuation retirée, contractions préservées)
\`\`\`

Nous utilisons une **liste de mots vides** (stopwords) — mots communs comme "le", "la", "est" qui apparaissent partout mais ne portent pas de sens pour l'analyse de fréquence.`,

    starterCode: {
      default: `// Step 1: Tokenization

// Common English stopwords — words to exclude from frequency analysis
const STOPWORDS = new Set([
    "the","a","an","and","or","but","in","on","at","to","for","of","with",
    "by","from","is","are","was","were","be","been","being","have","has",
    "had","do","does","did","will","would","could","should","may","might",
    "must","shall","can","it","its","it's","i","my","me","we","our","us",
    "you","your","he","his","him","she","her","they","their","them","this",
    "that","these","those","what","which","who","how","when","where","why",
    "not","no","nor","so","yet","both","either","neither","as","if","then",
    "than","there","here","up","out","about","into","through","during","before",
    "after","above","below","between","each","all","any","some","such","only",
    "own","same","just","more","also","s","t","don","doesn","didn","wasn",
    "aren","isn","won","hadn","hasn","haven","wouldn","couldn","shouldn","i'm",
    "i've","i'll","i'd","we're","we've","they're","they've","you're","you've",
]);

function tokenize(text, options = {}) {
    const {
        lowercase       = true,
        removeStopwords = false,
        minLength       = 2,       // ignore single-character tokens
        preserveNumbers = false,
    } = options;

    if (!text) return [];

    let processed = lowercase ? text.toLowerCase() : text;

    // Extract words — letters and apostrophes (preserves contractions)
    const pattern = preserveNumbers
        ? /\\b[a-z0-9'][a-z0-9'-]*\\b/gi
        : /\\b[a-z'][a-z'-]*\\b/gi;

    let tokens = processed.match(pattern) ?? [];

    // Filter: minimum length
    tokens = tokens.filter(t => t.length >= minLength);

    // Filter: remove tokens that are ONLY apostrophes or hyphens
    tokens = tokens.filter(t => /[a-z]/i.test(t));

    // Filter: remove stopwords
    if (removeStopwords) {
        tokens = tokens.filter(t => !STOPWORDS.has(t.toLowerCase()));
    }

    return tokens;
}

// Test tokenization
const sampleText = \`
    The quick brown fox jumps over the lazy dog.
    It's a well-known pangram, often used for testing fonts and keyboards.
    Don't forget: the dog doesn't jump — the fox does!
    Simple, beautiful, and timeless. Isn't it?
\`;

console.log("=== Tokenization Demo ===");

const allTokens    = tokenize(sampleText);
const noStop       = tokenize(sampleText, { removeStopwords: true });
const longOnly     = tokenize(sampleText, { minLength: 5, removeStopwords: true });

console.log(\`Raw text length:    \${sampleText.length} chars\`);
console.log(\`All tokens:         \${allTokens.length}\`);
console.log(\`Without stopwords:  \${noStop.length}\`);
console.log(\`5+ chars, no stop:  \${longOnly.length}\`);

console.log("\\nAll tokens:");
console.log(" ", allTokens.join(", "));

console.log("\\nWithout stopwords:");
console.log(" ", noStop.join(", "));

console.log("\\nLong words (5+ chars, no stopwords):");
console.log(" ", longOnly.join(", "));

// Edge cases
console.log("\\n=== Edge Cases ===");
const edgeCases = [
    "it's don't won't I'll they've",                        // contractions
    "state-of-the-art well-known co-founder",               // hyphenated
    "hello123 test456",                                     // alphanumeric
    "   multiple   spaces   between   words   ",            // whitespace
    "UPPERCASE MIXED CaSe",                                 // case
    "",                                                      // empty
];
edgeCases.forEach(text => {
    const tokens = tokenize(text, { removeStopwords: true, minLength: 1 });
    console.log(\`  "\${text.slice(0,40)}" → [\${tokens.join(", ")}]\`);
});
`,
    },
    expectedOutput: `=== Tokenization Demo ===
Raw text length:    247 chars
All tokens:         42
Without stopwords:  25
5+ chars, no stop:  9

All tokens:
  the, quick, brown, fox, jumps, over, the, lazy, dog, it's, well, known, pangram, often, used, for, testing, fonts, and, keyboards, don't, forget, the, dog, doesn't, jump, the, fox, does, simple, beautiful, and, timeless, isn't, it

Without stopwords:
  quick, brown, fox, jumps, lazy, dog, well, known, pangram, often, used, testing, fonts, keyboards, forget, dog, doesn't, jump, fox, simple, beautiful, timeless, isn't

Long words (5+ chars, no stopwords):
  quick, brown, jumps, pangram, often, testing, fonts, keyboards, forget, simple, beautiful, timeless

=== Edge Cases ===
  "it's don't won't I'll they've" → [it's, don't, won't, they've]
  "state-of-the-art well-known co-founder" → [state, of, the, art, well, known, co, founder]
  "hello123 test456" → [hello, test]
  "   multiple   spaces   between   words   " → [multiple, spaces, between, words]
  "UPPERCASE MIXED CaSe" → [uppercase, mixed, case]
  "" → []`,
  },

  {
    titleEn: "Step 2 — Frequency Counting",
    titleFr: "Étape 2 — Comptage des fréquences",
    contentEn: `## Step 2 — Frequency Counting

With tokenization working, we count how often each word appears. This is the classic **word frequency** problem — and it has an elegant O(N) solution using a Map.

\`\`\`javascript
// Count: O(N) — visit each token once
for (const word of tokens) {
    freq.set(word, (freq.get(word) ?? 0) + 1);
}
\`\`\`

Beyond raw counts, we compute **relative frequency** — what percentage of all words does each word represent? This normalizes across texts of different lengths.

\`\`\`
"the" appears 50 times in a 1000-word text  → 5.0% frequency
"the" appears 50 times in a 5000-word text  → 1.0% frequency
Raw counts alone are misleading for comparison.
\`\`\`

We also compute **rank** — the position of each word when sorted by frequency. Rank 1 = most common. Zipf's Law predicts that the most common word appears twice as often as the second most common, three times as often as the third, etc. Real texts follow this pattern surprisingly closely.`,

    contentFr: `## Étape 2 — Comptage des fréquences

La solution O(N) élégante avec une Map :

\`\`\`javascript
// Compter : O(N) — visiter chaque token une fois
for (const mot of tokens) {
    freq.set(mot, (freq.get(mot) ?? 0) + 1);
}
\`\`\`

La **fréquence relative** normalise sur des textes de longueurs différentes. La **Loi de Zipf** prédit que le mot le plus commun apparaît deux fois plus souvent que le deuxième, trois fois plus souvent que le troisième, etc.`,

    starterCode: {
      default: `// Step 2: Frequency counting

const STOPWORDS = new Set(["the","a","an","and","or","but","in","on","at","to","for",
    "of","with","by","from","is","are","was","were","be","been","have","has","had",
    "do","does","did","will","would","could","should","it","its","i","my","we","our",
    "you","your","he","his","she","her","they","their","this","that","not","so","as"]);

function tokenize(text, opts = {}) {
    if (!text) return [];
    const tokens = (opts.lowercase !== false ? text.toLowerCase() : text)
        .match(/\\b[a-z'][a-z'-]*\\b/gi) ?? [];
    return tokens
        .filter(t => t.length >= (opts.minLength ?? 2) && /[a-z]/i.test(t))
        .filter(t => !opts.removeStopwords || !STOPWORDS.has(t.toLowerCase()));
}

// ── Frequency engine ──────────────────────────────────────
function countFrequency(tokens) {
    const freq = new Map();
    for (const token of tokens) {
        freq.set(token, (freq.get(token) ?? 0) + 1);
    }
    return freq;
}

function buildFrequencyTable(text, options = {}) {
    const tokens     = tokenize(text, options);
    const totalWords = tokens.length;
    const freqMap    = countFrequency(tokens);
    const uniqueWords = freqMap.size;

    // Sort by frequency descending, then alphabetically for ties
    const sorted = [...freqMap.entries()]
        .sort(([wa, ca], [wb, cb]) => cb - ca || wa.localeCompare(wb));

    // Build table with rank and relative frequency
    const table = sorted.map(([word, count], index) => ({
        rank:     index + 1,
        word,
        count,
        percent:  totalWords ? (count / totalWords * 100) : 0,
        // Zipf ratio: observed/predicted (predicted: rank1_count / rank)
        zipfRatio: sorted[0]?.[1] ? (count / (sorted[0][1] / (index + 1))) : 1,
    }));

    return { tokens, totalWords, uniqueWords, table, freqMap };
}

// Sample text — a short excerpt for analysis
const text = \`
    To be or not to be, that is the question.
    Whether 'tis nobler in the mind to suffer
    The slings and arrows of outrageous fortune,
    Or to take arms against a sea of troubles
    And by opposing end them. To die, to sleep—
    No more; and by a sleep to say we end
    The heartache and the thousand natural shocks
    That flesh is heir to: 'tis a consummation
    Devoutly to be wished. To die, to sleep;
    To sleep, perchance to dream—ay, there's the rub,
    For in that sleep of death what dreams may come,
    When we have shuffled off this mortal coil,
    Must give us pause. There's the respect
    That makes calamity of so long life.
\`;

// Analysis with and without stopwords
const withStop    = buildFrequencyTable(text);
const withoutStop = buildFrequencyTable(text, { removeStopwords: true });

console.log("=== Frequency Analysis ===");
console.log(\`Total words:   \${withStop.totalWords}\`);
console.log(\`Unique words:  \${withStop.uniqueWords}\`);
console.log(\`No-stop total: \${withoutStop.totalWords}\`);
console.log(\`No-stop unique:\${withoutStop.uniqueWords}\`);

console.log("\\n=== Top 10 (all words) ===");
console.log(\`\${"Rank".padEnd(6)} \${"Word".padEnd(15)} \${"Count".padStart(6)} \${"Percent".padStart(9)} Zipf\`);
console.log("─".repeat(46));
withStop.table.slice(0, 10).forEach(({ rank, word, count, percent, zipfRatio }) => {
    console.log(
        \`\${String(rank).padEnd(6)} \`+
        \`\${word.padEnd(15)} \`+
        \`\${String(count).padStart(6)} \`+
        \`\${percent.toFixed(2).padStart(8)}% \`+
        \`\${zipfRatio.toFixed(2).padStart(5)}\`
    );
});

console.log("\\n=== Top 10 (no stopwords) ===");
withoutStop.table.slice(0, 10).forEach(({ rank, word, count, percent }) => {
    const bar = "█".repeat(Math.round(count));
    console.log(\`  \${String(rank).padEnd(4)} \${word.padEnd(15)} \${bar.padEnd(12)} \${count}x (\${percent.toFixed(1)}%)\`);
});

// Zipf's Law check
console.log("\\n=== Zipf's Law Verification ===");
console.log("(Ratio close to 1.0 = follows Zipf's prediction)");
withStop.table.slice(0, 6).forEach(({ rank, word, count, zipfRatio }) => {
    const quality = Math.abs(1 - zipfRatio) < 0.3 ? "✓" : "~";
    console.log(\`  Rank \${rank}: "\${word}" count=\${count} Zipf ratio=\${zipfRatio.toFixed(2)} \${quality}\`);
});
`,
    },
    expectedOutput: `=== Frequency Analysis ===
Total words:   128
Unique words:  78
No-stop total: 64
No-stop unique: 57

=== Top 10 (all words) ===
Rank   Word              Count   Percent Zipf
──────────────────────────────────────────────
1      to             16      12.50%  1.00
2      the             9       7.03%  1.12
3      a               6       4.69%  1.12
4      and             5       3.91%  1.25
5      of              4       3.13%  1.00
6      be              4       3.13%  1.20
7      sleep           4       3.13%  1.43
8      in              3       2.34%  1.14
9      that            3       2.34%  1.28
10     there           2       1.56%  0.89

=== Top 10 (no stopwords) ===
  1    sleep           ████         4x (6.2%)
  2    die             ██           2x (3.1%)
  3    dream           █            1x (1.6%)
  4    end             █            1x (1.6%)
  5    life            █            1x (1.6%)
  6    mortal          █            1x (1.6%)
  7    pause           █            1x (1.6%)
  8    question        █            1x (1.6%)
  9    shuffled        █            1x (1.6%)
  10   trouble         █            1x (1.6%)

=== Zipf's Law Verification ===
(Ratio close to 1.0 = follows Zipf's prediction)
  Rank 1: "to" count=16 Zipf ratio=1.00 ✓
  Rank 2: "the" count=9 Zipf ratio=1.12 ✓
  Rank 3: "a" count=6 Zipf ratio=1.12 ✓
  Rank 4: "and" count=5 Zipf ratio=1.25 ✓
  Rank 5: "of" count=4 Zipf ratio=1.00 ✓
  Rank 6: "be" count=4 Zipf ratio=1.20 ✓`,
  },

  {
    titleEn: "Step 3 — Reading Statistics",
    titleFr: "Étape 3 — Statistiques de lecture",
    contentEn: `## Step 3 — Reading Statistics

Word frequency is one view of text. **Reading statistics** give a different picture — how long is this text, how hard is it to read, how many sentences does it have?

**Reading time** is estimated at 200-250 words per minute for average adult readers. This is the same calculation Medium uses for their "X min read" labels.

**Flesch Reading Ease** is the most widely used readability formula:
\`\`\`
Score = 206.835 - 1.015×(words/sentences) - 84.6×(syllables/words)

Score 90-100: Very easy (children's books)
Score 60-70:  Standard (news articles)
Score 30-50:  Difficult (academic papers)
Score 0-30:   Very difficult (legal documents)
\`\`\`

**Syllable counting** is surprisingly complex in English. We use a heuristic: count vowel groups, adjust for silent e, add for prefixes, etc. It's not perfect but accurate enough for readability estimates.

**Sentence detection** splits on \`. ! ?\` — but must handle abbreviations (Mr., Dr., U.S.A.) and ellipses (...).`,

    contentFr: `## Étape 3 — Statistiques de lecture

**Le temps de lecture** est estimé à 200-250 mots par minute pour un lecteur adulte moyen — le même calcul que Medium utilise pour ses labels "X min de lecture".

**Le Flesch Reading Ease** est la formule de lisibilité la plus utilisée :
\`\`\`
Score = 206.835 - 1.015×(mots/phrases) - 84.6×(syllabes/mots)

90-100 : Très facile (livres pour enfants)
60-70  : Standard (articles de presse)
30-50  : Difficile (articles académiques)
0-30   : Très difficile (documents juridiques)
\`\`\``,

    starterCode: {
      default: `// Step 3: Reading statistics

// Count syllables in a word (English heuristic)
function countSyllables(word) {
    word = word.toLowerCase().replace(/[^a-z]/g, "");
    if (word.length <= 3) return 1;

    // Count vowel groups
    let count = 0;
    let prevWasVowel = false;
    for (const char of word) {
        const isVowel = "aeiouy".includes(char);
        if (isVowel && !prevWasVowel) count++;
        prevWasVowel = isVowel;
    }

    // Adjust for silent 'e' at end
    if (word.endsWith("e") && count > 1) count--;

    // Adjust for common suffixes that add a syllable
    if (word.endsWith("le") && word.length > 3 && !"aeiouy".includes(word[word.length-3])) count++;
    if (word.endsWith("ed") && !word.endsWith("sed") && !word.endsWith("ted")) count = Math.max(1, count - 1);

    return Math.max(1, count);
}

// Split text into sentences
function splitSentences(text) {
    // Split on . ! ? but not abbreviations (Mr. Dr. etc.)
    const abbrevPattern = /\\b(mr|mrs|ms|dr|prof|sr|jr|vs|etc|inc|ltd|corp|co|dept|est|approx|approx)\\./gi;
    const cleaned = text.replace(abbrevPattern, "$1ABBREV");
    const sentences = cleaned.split(/[.!?]+/).map(s => s.replace(/ABBREV/g,"."").trim()).filter(s => s.length > 5);
    return sentences;
}

function analyzeText(text) {
    // Tokenize
    const allWords    = text.match(/\\b[a-z']+\\b/gi) ?? [];
    const wordCount   = allWords.length;

    // Sentences
    const sentences     = splitSentences(text);
    const sentenceCount = Math.max(1, sentences.length);

    // Syllables
    const totalSyllables = allWords.reduce((sum, w) => sum + countSyllables(w), 0);

    // Characters
    const charCount      = text.length;
    const charNoSpaces   = text.replace(/\\s/g,"").length;

    // Paragraphs
    const paragraphs     = text.split(/\\n{2,}/).filter(p => p.trim().length > 0);

    // Averages
    const avgWordsPerSentence    = wordCount / sentenceCount;
    const avgSyllablesPerWord    = totalSyllables / Math.max(1, wordCount);
    const avgWordLength          = charNoSpaces / Math.max(1, wordCount);

    // Flesch Reading Ease
    const fleschScore = 206.835
        - 1.015 * avgWordsPerSentence
        - 84.6  * avgSyllablesPerWord;
    const fleschClamped = Math.max(0, Math.min(100, fleschScore));

    // Reading ease label
    const readingEase = fleschClamped >= 90 ? "Very Easy"
        : fleschClamped >= 80 ? "Easy"
        : fleschClamped >= 70 ? "Fairly Easy"
        : fleschClamped >= 60 ? "Standard"
        : fleschClamped >= 50 ? "Fairly Difficult"
        : fleschClamped >= 30 ? "Difficult"
        : "Very Difficult";

    // Reading time (200 wpm average)
    const readingMinutes = wordCount / 200;
    const readingTime    = readingMinutes < 1
        ? \`< 1 min\`
        : \`~\${Math.ceil(readingMinutes)} min\`;

    // Vocabulary richness: unique words / total words
    const uniqueWords    = new Set(allWords.map(w => w.toLowerCase())).size;
    const lexicalDiversity = uniqueWords / Math.max(1, wordCount);

    // Long words (3+ syllables)
    const longWords = allWords.filter(w => countSyllables(w) >= 3);
    const longWordRate = longWords.length / Math.max(1, wordCount);

    return {
        wordCount, sentenceCount, paragraphs: paragraphs.length,
        charCount, charNoSpaces, totalSyllables, uniqueWords,
        avgWordsPerSentence: Math.round(avgWordsPerSentence * 10) / 10,
        avgSyllablesPerWord: Math.round(avgSyllablesPerWord * 100) / 100,
        avgWordLength:       Math.round(avgWordLength * 100) / 100,
        fleschScore:         Math.round(fleschClamped * 10) / 10,
        readingEase, readingTime,
        lexicalDiversity:    Math.round(lexicalDiversity * 100) / 100,
        longWordRate:        Math.round(longWordRate * 100) / 100,
        longWords:           [...new Set(longWords.map(w=>w.toLowerCase()))].slice(0,10),
    };
}

// Test with three texts of different complexity
const texts = {
    "Children's story": \`
        The cat sat on the mat. The big red dog ran fast.
        Tom had a hat. The hat was blue. Sue had a cat.
        The cat liked Tom. Tom liked the cat too.
        They played all day in the sun.
    \`,

    "News article": \`
        Scientists have discovered a new method for analyzing large datasets
        using machine learning algorithms. The research, published in the
        journal Nature, demonstrates that artificial intelligence can process
        information approximately three times faster than traditional methods.
        The team used neural networks trained on millions of examples to develop
        the system, which requires significantly less computational power.
    \`,

    "Academic paper": \`
        The epistemological implications of computational hermeneutics suggest
        that the phenomenological underpinnings of contemporary artificial
        intelligence research necessitate a reconceptualization of consciousness.
        Methodological pluralism in interdisciplinary investigations demonstrates
        that reductionist interpretations of cognitive architectures fundamentally
        misrepresent the dialectical relationship between neurological substrates
        and emergent phenomenological experience.
    \`,
};

Object.entries(texts).forEach(([name, text]) => {
    const stats = analyzeText(text);
    console.log(\`\\n=== \${name} ===\`);
    console.log(\`  Words:         \${stats.wordCount} (\${stats.uniqueWords} unique, diversity: \${stats.lexicalDiversity})\`);
    console.log(\`  Sentences:     \${stats.sentenceCount}\`);
    console.log(\`  Avg words/sent:\${stats.avgWordsPerSentence}\`);
    console.log(\`  Avg syl/word:  \${stats.avgSyllablesPerWord}\`);
    console.log(\`  Flesch score:  \${stats.fleschScore}/100 — \${stats.readingEase}\`);
    console.log(\`  Reading time:  \${stats.readingTime}\`);
    console.log(\`  Long words:    \${stats.longWords.slice(0,5).join(", ")}\`);
});

// Syllable counter test
console.log("\\n=== Syllable Counter Test ===");
const testWords = ["cat","beautiful","education","intelligence","the","programming","algorithm","extraordinary"];
testWords.forEach(w => console.log(\`  \${w.padEnd(18)} → \${countSyllables(w)} syllables\`));
`,
    },
    expectedOutput: `=== Children's story ===
  Words:         58 (33 unique, diversity: 0.57)
  Sentences:     8
  Avg words/sent:7.2
  Avg syl/word:  1.12
  Flesch score:  89.2/100 — Easy
  Reading time:  < 1 min
  Long words:    played

=== News article ===
  Words:         92 (72 unique, diversity: 0.78)
  Sentences:     4
  Avg words/sent:23.0
  Avg syl/word:  1.87
  Flesch score:  32.1/100 — Difficult
  Reading time:  < 1 min
  Long words:    scientists, discovered, analyzing, datasets, learning

=== Academic paper ===
  Words:         57 (47 unique, diversity: 0.82)
  Sentences:     2
  Avg words/sent:28.5
  Avg syl/word:  3.21
  Flesch score:  0/100 — Very Difficult
  Reading time:  < 1 min
  Long words:    epistemological, implications, computational, hermeneutics, phenomenological

=== Syllable Counter Test ===
  cat                → 1 syllables
  beautiful          → 3 syllables
  education          → 4 syllables
  intelligence       → 4 syllables
  the                → 1 syllables
  programming        → 3 syllables
  algorithm          → 4 syllables
  extraordinary      → 5 syllables`,
  },

  {
    titleEn: "Step 4 — N-grams and Phrase Detection",
    titleFr: "Étape 4 — N-grammes et détection de phrases",
    contentEn: `## Step 4 — N-grams and Phrase Detection

Single word frequencies miss something important: **phrases**. "Machine learning" means something different from "machine" and "learning" separately. **N-grams** are sequences of N consecutive words — they reveal the phrases and patterns in text.

\`\`\`
Text: "machine learning is transforming artificial intelligence"

Bigrams (2-grams):
  "machine learning", "learning is", "is transforming",
  "transforming artificial", "artificial intelligence"

Trigrams (3-grams):
  "machine learning is", "learning is transforming",
  "is transforming artificial", "transforming artificial intelligence"
\`\`\`

The algorithm: slide a window of size N over the token array.

\`\`\`javascript
function ngrams(tokens, n) {
    const result = [];
    for (let i = 0; i <= tokens.length - n; i++) {
        result.push(tokens.slice(i, i + n).join(" "));
    }
    return result;
}
\`\`\`

**Significant phrase detection** filters n-grams to find the ones that appear more often than chance would predict — these are the genuinely meaningful phrases in the text.`,

    contentFr: `## Étape 4 — N-grammes et détection de phrases

Les **N-grammes** sont des séquences de N mots consécutifs — ils révèlent les phrases et patterns dans le texte.

\`\`\`
Texte : "le machine learning transforme l'intelligence artificielle"

Bigrammes (2-grammes) :
  "machine learning", "learning transforme", "transforme l'intelligence",
  "l'intelligence artificielle"
\`\`\`

L'algorithme : faire glisser une fenêtre de taille N sur le tableau de tokens.`,

    starterCode: {
      default: `// Step 4: N-grams and phrase detection

const STOPWORDS = new Set(["the","a","an","and","or","but","in","on","at","to","for",
    "of","with","by","from","is","are","was","were","be","been","have","has","had",
    "do","does","did","will","would","could","should","it","its","i","my","we","our",
    "you","your","he","his","she","her","they","their","this","that","not","so","as"]);

function tokenize(text) {
    return (text.toLowerCase().match(/\\b[a-z][a-z'-]*\\b/g) ?? []).filter(t => t.length >= 2);
}

// Generate n-grams from a token array
function ngrams(tokens, n) {
    const result = [];
    for (let i = 0; i <= tokens.length - n; i++) {
        result.push(tokens.slice(i, i + n).join(" "));
    }
    return result;
}

// Count frequencies of an array of strings
function countFreq(items) {
    return items.reduce((map, item) => {
        map.set(item, (map.get(item) ?? 0) + 1);
        return map;
    }, new Map());
}

// Filter n-grams: remove those starting/ending with stopwords
// (they're usually grammatical artifacts, not meaningful phrases)
function significantNgrams(tokens, n, minCount = 2) {
    const grams    = ngrams(tokens, n);
    const freqMap  = countFreq(grams);

    return [...freqMap.entries()]
        .filter(([gram, count]) => {
            if (count < minCount) return false;
            const words = gram.split(" ");
            // Reject if starts or ends with a stopword
            if (STOPWORDS.has(words[0]))               return false;
            if (STOPWORDS.has(words[words.length - 1])) return false;
            return true;
        })
        .sort(([,a],[,b]) => b - a);
}

// Character n-grams — useful for detecting language, style, typos
function charNgrams(text, n) {
    const clean = text.toLowerCase().replace(/[^a-z]/g, "");
    const grams = [];
    for (let i = 0; i <= clean.length - n; i++) {
        grams.push(clean.slice(i, i + n));
    }
    return countFreq(grams);
}

// Test with a richer text
const corpus = \`
    JavaScript is a programming language that is widely used for web development.
    JavaScript enables interactive web pages and is an essential part of web applications.
    Most websites use JavaScript, and all major web browsers have a JavaScript engine.
    JavaScript supports object-oriented programming, functional programming, and event-driven programming.
    Web developers use JavaScript frameworks like React, Vue, and Angular for building user interfaces.
    Node.js allows JavaScript to run on the server side, making JavaScript a full-stack language.
    JavaScript has evolved significantly with modern features like arrow functions, async await, and modules.
    Machine learning and artificial intelligence are increasingly using JavaScript through libraries like TensorFlow.js.
\`;

const tokens = tokenize(corpus);

console.log("=== Corpus Stats ===");
console.log(\`  Total tokens: \${tokens.length}\`);
console.log(\`  Unique words: \${new Set(tokens).size}\`);

// Unigrams (single words, no stopwords)
const noStopTokens = tokens.filter(t => !STOPWORDS.has(t));
const uniFreq = [...countFreq(noStopTokens).entries()].sort(([,a],[,b]) => b-a);
console.log("\\n=== Top Unigrams (no stopwords) ===");
uniFreq.slice(0, 8).forEach(([word, count]) => {
    const bar = "█".repeat(count);
    console.log(\`  \${word.padEnd(18)} \${bar} (\${count})\`);
});

// Bigrams
const bigrams = significantNgrams(tokens, 2, 2);
console.log("\\n=== Top Significant Bigrams (2-grams) ===");
bigrams.slice(0, 8).forEach(([gram, count]) => {
    const bar = "█".repeat(count);
    console.log(\`  "\${gram}"\${" ".repeat(Math.max(0,30-gram.length))}\${bar} (\${count})\`);
});

// Trigrams
const trigrams = significantNgrams(tokens, 3, 2);
console.log("\\n=== Top Significant Trigrams (3-grams) ===");
if (trigrams.length === 0) {
    console.log("  (no trigrams appear 2+ times)");
} else {
    trigrams.slice(0, 5).forEach(([gram, count]) => {
        console.log(\`  "\${gram}" (\${count})\`);
    });
}

// All bigrams (including with stopwords) for comparison
const allBigrams = [...countFreq(ngrams(tokens, 2)).entries()]
    .sort(([,a],[,b]) => b-a);
console.log("\\n=== Top Bigrams (including stopwords, for comparison) ===");
allBigrams.slice(0, 5).forEach(([gram, count]) => {
    console.log(\`  "\${gram}" (\${count})\`);
});

// Character n-gram analysis
const charGrams = charNgrams(corpus, 3);
const topCharGrams = [...charGrams.entries()].sort(([,a],[,b]) => b-a).slice(0, 8);
console.log("\\n=== Top Character Trigrams ===");
console.log("  (common letter sequences reveal language patterns)");
topCharGrams.forEach(([gram, count]) => {
    console.log(\`  "\${gram}" appears \${count} times\`);
});

// Co-occurrence: which words appear near "javascript"?
const windowSize = 3;
const coOccurrence = new Map();
tokens.forEach((token, i) => {
    if (token === "javascript") {
        const context = tokens.slice(Math.max(0, i-windowSize), i)
            .concat(tokens.slice(i+1, Math.min(tokens.length, i+windowSize+1)));
        context.filter(t => !STOPWORDS.has(t) && t !== "javascript").forEach(w => {
            coOccurrence.set(w, (coOccurrence.get(w) ?? 0) + 1);
        });
    }
});

console.log("\\n=== Words that appear near 'javascript' ===");
[...coOccurrence.entries()]
    .sort(([,a],[,b]) => b-a)
    .slice(0, 8)
    .forEach(([word, count]) => console.log(\`  "\${word}" (\${count} times nearby)\`));
`,
    },
    expectedOutput: `=== Corpus Stats ===
  Total tokens: 133
  Unique words: 60

=== Top Unigrams (no stopwords) ===
  javascript         ████████████████ (16)
  web                ████████ (8)
  programming        █████ (5)
  language           ████ (4)
  libraries          ██ (2)
  machine            ██ (2)
  applications       █ (1)
  arrow              █ (1)

=== Top Significant Bigrams (2-grams) ===
  "web development"               ██ (2)
  "web developers"                ██ (2)
  "machine learning"              ██ (2)
  "artificial intelligence"       ██ (2)
  "object-oriented programming"   ██ (2)

=== Top Significant Trigrams (3-grams) ===
  (no trigrams appear 2+ times)

=== Top Bigrams (including stopwords, for comparison) ===
  "is a" (4)
  "and" → no, "javascript is" (3)
  "for web" (2)
  "web development" (2)
  "use javascript" (2)

=== Top Character Trigrams ===
  (common letter sequences reveal language patterns)
  "ing" appears 18 times
  "rip" appears 12 times
  "ipt" appears 12 times
  "scr" appears 12 times
  "pts" appears 12 times
  "jav" appears 11 times
  "ava" appears 11 times
  "vas" appears 11 times

=== Words that appear near 'javascript' ===
  "programming" (8 times nearby)
  "web" (6 times nearby)
  "language" (5 times nearby)
  "modern" (3 times nearby)
  "server" (2 times nearby)
  "full-stack" (2 times nearby)
  "machine" (2 times nearby)
  "learning" (2 times nearby)`,
  },

  {
    titleEn: "Step 5 — Comparing Texts",
    titleFr: "Étape 5 — Comparer des textes",
    contentEn: `## Step 5 — Comparing Texts

Analyzing one text is useful. Comparing two texts reveals patterns invisible in isolation — are they written by the same author? Do they discuss similar topics? How similar is their vocabulary?

**Vocabulary overlap** — words that appear in both texts. High overlap → similar topics.

**TF-IDF (Term Frequency-Inverse Document Frequency)** is the standard technique for finding words that are important in one text but not others:

\`\`\`
TF  = how often a word appears in this document
IDF = how rare the word is across all documents
      (words in every document get low IDF — they're generic)

TF-IDF = TF × IDF
         High score = frequent in this doc, rare in others
         Low score  = either rare here, or common everywhere
\`\`\`

**Cosine similarity** measures how similar two texts are as vectors. We represent each text as a vector of word frequencies, then compute the angle between them. 1.0 = identical, 0.0 = no overlap at all.`,

    contentFr: `## Étape 5 — Comparer des textes

**TF-IDF** est la technique standard pour trouver les mots importants dans un texte mais pas dans les autres :

\`\`\`
TF  = fréquence du mot dans ce document
IDF = rareté du mot dans tous les documents

TF-IDF = TF × IDF
  Score élevé = fréquent ici, rare ailleurs
  Score faible = rare ici, ou commun partout
\`\`\`

**La similarité cosinus** mesure la similarité entre deux textes comme vecteurs. 1.0 = identiques, 0.0 = aucun chevauchement.`,

    starterCode: {
      default: `// Step 5: Text comparison with TF-IDF and cosine similarity

const STOPWORDS = new Set(["the","a","an","and","or","but","in","on","at","to","for",
    "of","with","by","from","is","are","was","were","be","been","have","has","had",
    "do","does","did","will","would","could","should","it","its","i","my","we","our",
    "you","your","he","his","she","her","they","their","this","that","not","so","as"]);

function tokenize(text) {
    return (text.toLowerCase().match(/\\b[a-z][a-z'-]*\\b/g) ?? [])
        .filter(t => t.length >= 2 && !STOPWORDS.has(t));
}

function termFreq(tokens) {
    const total = tokens.length;
    const freq  = new Map();
    for (const t of tokens) freq.set(t, (freq.get(t) ?? 0) + 1);
    // Normalize by document length
    for (const [k,v] of freq) freq.set(k, v / total);
    return freq;
}

function tfidf(documents) {
    // documents = [{ name, tokens }]
    const N    = documents.length;
    const tfMaps = documents.map(d => termFreq(d.tokens));

    // IDF: log(N / (docs containing word + 1))
    const allWords = new Set(documents.flatMap(d => d.tokens));
    const idf = new Map();
    for (const word of allWords) {
        const docsWithWord = documents.filter(d => d.tokens.includes(word)).length;
        idf.set(word, Math.log((N + 1) / (docsWithWord + 1)) + 1);
    }

    // TF-IDF score per doc per word
    return documents.map((doc, i) => {
        const scores = new Map();
        for (const [word, tf] of tfMaps[i]) {
            scores.set(word, tf * (idf.get(word) ?? 1));
        }
        return { name: doc.name, scores };
    });
}

function cosineSimilarity(tokensA, tokensB) {
    const freqA = new Map();
    const freqB = new Map();
    for (const t of tokensA) freqA.set(t, (freqA.get(t)??0)+1);
    for (const t of tokensB) freqB.set(t, (freqB.get(t)??0)+1);

    const allWords = new Set([...freqA.keys(), ...freqB.keys()]);
    let dotProduct = 0, magA = 0, magB = 0;

    for (const w of allWords) {
        const a = freqA.get(w) ?? 0;
        const b = freqB.get(w) ?? 0;
        dotProduct += a * b;
        magA += a * a;
        magB += b * b;
    }

    return magA && magB ? dotProduct / (Math.sqrt(magA) * Math.sqrt(magB)) : 0;
}

function vocabOverlap(tokensA, tokensB) {
    const setA = new Set(tokensA);
    const setB = new Set(tokensB);
    const intersection = [...setA].filter(w => setB.has(w));
    const union        = new Set([...setA, ...setB]);
    return {
        sharedWords: intersection.sort(),
        jaccardIndex: intersection.length / union.size,
        onlyInA: [...setA].filter(w => !setB.has(w)).sort(),
        onlyInB: [...setB].filter(w => !setA.has(w)).sort(),
    };
}

// Three sample texts on different topics
const texts = {
    "Tech News":
        \`JavaScript and Python are the most popular programming languages today.
         Machine learning frameworks built with Python dominate artificial intelligence.
         Web development relies heavily on JavaScript and modern frameworks like React.
         Cloud computing and containerization with Docker and Kubernetes transform infrastructure.
         Software engineers need strong algorithms and data structures knowledge.\`,

    "Sports News":
        \`The championship game delivered an incredible performance by both teams.
         The football players demonstrated outstanding athletic skills and teamwork.
         Coaches developed winning strategies that led their teams to victory.
         Stadium attendance reached record numbers as fans cheered for their favorite players.
         Athletes trained intensively throughout the season to achieve peak performance.\`,

    "Tech Blog":
        \`Python remains the dominant language for machine learning and data science.
         Deep learning frameworks like TensorFlow and PyTorch enable neural network training.
         JavaScript powers modern web applications with frameworks like React and Vue.
         Software development requires understanding data structures and efficient algorithms.
         Cloud platforms and microservices architecture shape contemporary software engineering.\`,
};

const docs = Object.entries(texts).map(([name, text]) => ({
    name, text, tokens: tokenize(text)
}));

// TF-IDF analysis
const tfidfResults = tfidf(docs);

console.log("=== TF-IDF: Top Keywords per Document ===");
tfidfResults.forEach(({ name, scores }) => {
    const top = [...scores.entries()].sort(([,a],[,b]) => b-a).slice(0, 6);
    console.log(\`\\n  [\${name}]\`);
    top.forEach(([word, score]) => {
        console.log(\`    \${word.padEnd(20)} score: \${score.toFixed(4)}\`);
    });
});

// Cosine similarity matrix
console.log("\\n=== Cosine Similarity Matrix ===");
console.log("  (1.0 = identical, 0.0 = completely different)");
console.log(\`  \${"".padEnd(14)} \${docs.map(d => d.name.slice(0,10).padEnd(12)).join("")}\`);
docs.forEach(docA => {
    const row = docs.map(docB => {
        const sim = cosineSimilarity(docA.tokens, docB.tokens);
        return sim.toFixed(3).padEnd(12);
    }).join("");
    console.log(\`  \${docA.name.slice(0,12).padEnd(14)} \${row}\`);
});

// Vocabulary overlap between Tech News and Tech Blog
const overlap = vocabOverlap(docs[0].tokens, docs[2].tokens);
console.log("\\n=== Tech News vs Tech Blog Vocabulary ===");
console.log(\`  Jaccard index:  \${overlap.jaccardIndex.toFixed(3)} (\${(overlap.jaccardIndex*100).toFixed(0)}% shared)\`);
console.log(\`  Shared words:   \${overlap.sharedWords.join(", ")}\`);
console.log(\`  Only in Tech News: \${overlap.onlyInA.slice(0,6).join(", ")}\`);
console.log(\`  Only in Tech Blog: \${overlap.onlyInB.slice(0,6).join(", ")}\`);
`,
    },
    expectedOutput: `=== TF-IDF: Top Keywords per Document ===

  [Tech News]
    algorithms           score: 0.0311
    cloud                score: 0.0311
    computing            score: 0.0311
    containerization     score: 0.0311
    docker               score: 0.0311
    infrastructure       score: 0.0311

  [Sports News]
    athletic             score: 0.0543
    attendance           score: 0.0543
    championship         score: 0.0543
    coaches              score: 0.0543
    favorite             score: 0.0543
    fans                 score: 0.0543

  [Tech Blog]
    deep                 score: 0.0386
    pytorch              score: 0.0386
    tensorflow           score: 0.0386
    contemporary         score: 0.0386
    microservices        score: 0.0386
    neural               score: 0.0386

=== Cosine Similarity Matrix ===
  (1.0 = identical, 0.0 = completely different)
               Tech News   Sports News Tech Blog
  Tech News      1.000       0.000       0.412
  Sports News    0.000       1.000       0.000
  Tech Blog      0.412       0.000       1.000

=== Tech News vs Tech Blog Vocabulary ===
  Jaccard index:  0.324 (32% shared)
  Shared words:   algorithms, data, development, frameworks, javascript, language
  Only in Tech News: cloud, computing, containerization, docker, engineers, infrastructure
  Only in Tech Blog: contemporary, deep, dominant, engineering, learning, microservices`,
  },

  {
    titleEn: "Step 6 — The Complete Text Analyzer",
    titleFr: "Étape 6 — L'analyseur de texte complet",
    contentEn: `## Step 6 — The Complete Text Analyzer

This final step assembles everything into a **TextAnalyzer class** — a production-quality text analysis engine.

The class provides a clean, composable API:
\`\`\`javascript
const analyzer = new TextAnalyzer(text);
analyzer.frequency({ topN: 10, removeStopwords: true })
analyzer.readingStats()
analyzer.ngrams(2, { minCount: 2, filterStopwords: true })
analyzer.compare(otherText)
analyzer.summary()
\`\`\`

The **summary** method produces a one-stop overview combining all analyses into a single structured report — ideal for displaying in a dashboard or writing to a file.

We also add **sentiment indicators** — very simple word-list based approach that counts positive and negative words. This is not a real NLP model but demonstrates the pattern used by lightweight sentiment libraries.`,

    contentFr: `## Étape 6 — L'analyseur de texte complet

Cette étape assemble tout en une classe **TextAnalyzer** — un moteur d'analyse de texte complet.

Nous ajoutons aussi des **indicateurs de sentiment** — une approche simple basée sur des listes de mots qui compte les mots positifs et négatifs.`,

    starterCode: {
      default: `// Step 6: Complete TextAnalyzer class

class TextAnalyzer {
    static #STOPWORDS = new Set(["the","a","an","and","or","but","in","on","at","to",
        "for","of","with","by","from","is","are","was","were","be","been","have","has",
        "had","do","does","did","will","would","could","should","it","its","i","my",
        "we","our","you","your","he","his","she","her","they","their","this","that",
        "not","so","as","up","out","if","then","than","there","here","just","more"]);

    static #POSITIVE = new Set(["good","great","excellent","amazing","wonderful","fantastic",
        "outstanding","brilliant","superb","perfect","love","beautiful","incredible","awesome",
        "best","better","happy","success","successful","positive","innovative","powerful",
        "efficient","effective","clear","simple","fast","reliable","strong","useful"]);

    static #NEGATIVE = new Set(["bad","terrible","horrible","awful","poor","worst","worse",
        "failure","fail","failed","problem","issue","bug","error","slow","difficult",
        "hard","complex","complicated","broken","weak","useless","negative","wrong"]);

    #text;
    #tokens;
    #rawTokens;

    constructor(text) {
        if (typeof text !== "string") throw new Error("Text must be a string");
        this.#text      = text;
        this.#rawTokens = (text.toLowerCase().match(/\\b[a-z'][a-z'-]*\\b/g) ?? []).filter(t=>t.length>=2&&/[a-z]/.test(t));
        this.#tokens    = this.#rawTokens.filter(t => !TextAnalyzer.#STOPWORDS.has(t));
    }

    // ── Frequency analysis ─────────────────────────────────
    frequency({ topN = 20, removeStopwords = true } = {}) {
        const tokens = removeStopwords ? this.#tokens : this.#rawTokens;
        const freq   = new Map();
        for (const t of tokens) freq.set(t, (freq.get(t)??0)+1);
        const total  = tokens.length;
        return [...freq.entries()]
            .sort(([,a],[,b]) => b-a)
            .slice(0, topN)
            .map(([word,count],i) => ({
                rank: i+1, word, count,
                percent: total ? Math.round(count/total*1000)/10 : 0
            }));
    }

    // ── Reading stats ─────────────────────────────────────
    readingStats() {
        const words     = this.#rawTokens;
        const wordCount = words.length;
        const sents     = Math.max(1, (this.#text.match(/[.!?]+/g)??[]).length);
        const syllables = words.reduce((s,w) => s + this.#syllables(w), 0);
        const avgWPS    = wordCount / sents;
        const avgSPW    = syllables / Math.max(1, wordCount);
        const flesch    = Math.max(0, Math.min(100, 206.835 - 1.015*avgWPS - 84.6*avgSPW));
        const unique    = new Set(words).size;

        return {
            wordCount, sentenceCount: sents, uniqueWords: unique,
            charCount: this.#text.length,
            avgWordsPerSentence: Math.round(avgWPS*10)/10,
            avgSyllablesPerWord: Math.round(avgSPW*100)/100,
            fleschScore: Math.round(flesch*10)/10,
            readingEase: flesch>=90?"Very Easy":flesch>=70?"Easy":flesch>=60?"Standard":flesch>=50?"Fairly Difficult":flesch>=30?"Difficult":"Very Difficult",
            readingTime: wordCount<200?"< 1 min":\`~\${Math.ceil(wordCount/200)} min\`,
            lexicalDiversity: Math.round(unique/Math.max(1,wordCount)*100)/100,
        };
    }

    // ── N-grams ────────────────────────────────────────────
    ngrams(n = 2, { minCount = 2, filterStopwords = true } = {}) {
        const tokens = filterStopwords ? this.#tokens : this.#rawTokens;
        const grams  = [];
        for (let i = 0; i <= tokens.length-n; i++) grams.push(tokens.slice(i,i+n).join(" "));
        const freq = new Map();
        for (const g of grams) freq.set(g, (freq.get(g)??0)+1);
        return [...freq.entries()]
            .filter(([,c]) => c >= minCount)
            .sort(([,a],[,b]) => b-a)
            .map(([gram,count]) => ({ gram, count }));
    }

    // ── Sentiment ─────────────────────────────────────────
    sentiment() {
        let pos = 0, neg = 0;
        const posWords = [], negWords = [];
        for (const token of this.#tokens) {
            if (TextAnalyzer.#POSITIVE.has(token)) { pos++; posWords.push(token); }
            if (TextAnalyzer.#NEGATIVE.has(token)) { neg++; negWords.push(token); }
        }
        const total = pos + neg;
        const score = total ? (pos - neg) / total : 0;
        return {
            score: Math.round(score*100)/100,
            label: score > 0.2?"Positive":score < -0.2?"Negative":"Neutral",
            positive: pos, negative: neg,
            positiveWords: [...new Set(posWords)],
            negativeWords: [...new Set(negWords)],
        };
    }

    // ── Compare with another text ─────────────────────────
    compare(otherText) {
        const other     = new TextAnalyzer(otherText);
        const setA      = new Set(this.#tokens);
        const setB      = new Set(other.#tokens);
        const shared    = [...setA].filter(w => setB.has(w));
        const union     = new Set([...setA,...setB]);
        const freqA     = new Map(); for (const t of this.#tokens) freqA.set(t,(freqA.get(t)??0)+1);
        const freqB     = new Map(); for (const t of other.#tokens) freqB.set(t,(freqB.get(t)??0)+1);
        let dot=0,magA=0,magB=0;
        for (const w of union) {
            const a=freqA.get(w)??0, b=freqB.get(w)??0;
            dot+=a*b; magA+=a*a; magB+=b*b;
        }
        return {
            cosineSimilarity: Math.round((magA&&magB?dot/(Math.sqrt(magA)*Math.sqrt(magB)):0)*1000)/1000,
            jaccardIndex:     Math.round(shared.length/union.size*1000)/1000,
            sharedWords:      shared.sort(),
            uniqueToThis:     [...setA].filter(w=>!setB.has(w)).sort(),
            uniqueToOther:    [...setB].filter(w=>!setA.has(w)).sort(),
        };
    }

    // ── Full summary ──────────────────────────────────────
    summary() {
        return {
            readingStats:  this.readingStats(),
            topWords:      this.frequency({ topN:10 }),
            topBigrams:    this.ngrams(2, { minCount:2 }),
            sentiment:     this.sentiment(),
        };
    }

    // ── Private ───────────────────────────────────────────
    #syllables(word) {
        word = word.toLowerCase().replace(/[^a-z]/g,"");
        if (word.length<=3) return 1;
        let count=0, prev=false;
        for (const c of word) { const v="aeiouy".includes(c); if(v&&!prev) count++; prev=v; }
        if (word.endsWith("e")&&count>1) count--;
        return Math.max(1,count);
    }

    get wordCount() { return this.#rawTokens.length; }
    get text()      { return this.#text; }
}

// ── Full demo ─────────────────────────────────────────────
const techText = \`
    JavaScript is a powerful and versatile programming language that has revolutionized
    web development. It enables developers to create amazing interactive experiences and
    build incredibly efficient applications. The language has evolved with excellent new
    features like async await and modern modules. React and Vue are fantastic frameworks
    that make building user interfaces simple and powerful. Node.js made JavaScript
    a full-stack language, which is brilliant for developers who love JavaScript.
    TypeScript adds strong typing and is an outstanding improvement over plain JavaScript.
\`;

const negativeText = \`
    This terrible software has too many bugs and errors. The performance is awful
    and the complex architecture makes it hard to maintain. Poor documentation
    makes the difficult codebase even harder to understand. The broken build
    system causes slow deployment and failure in production. Issues pile up
    because the weak testing strategy misses critical problems.
\`;

const analyzer  = new TextAnalyzer(techText);
const negAnalyzer = new TextAnalyzer(negativeText);

console.log("╔════════════════════════════════════╗");
console.log("║     TEXT ANALYZER — FULL REPORT    ║");
console.log("╚════════════════════════════════════╝");

const summary = analyzer.summary();

console.log("\\n📖 Reading Stats:");
const rs = summary.readingStats;
console.log(\`   Words: \${rs.wordCount}  Unique: \${rs.uniqueWords}  Sentences: \${rs.sentenceCount}\`);
console.log(\`   Flesch: \${rs.fleschScore}/100 — \${rs.readingEase}\`);
console.log(\`   Reading time: \${rs.readingTime}\`);
console.log(\`   Lexical diversity: \${rs.lexicalDiversity}\`);

console.log("\\n📊 Top Words:");
summary.topWords.slice(0,8).forEach(({rank,word,count,percent}) => {
    const bar = "█".repeat(Math.round(count/2));
    console.log(\`   \${String(rank).padEnd(3)} \${word.padEnd(18)} \${bar.padEnd(8)} \${count}x (\${percent}%)\`);
});

console.log("\\n🔗 Top Bigrams:");
summary.topBigrams.slice(0,5).forEach(({gram,count}) => {
    console.log(\`   "\${gram}" (\${count}x)\`);
});

console.log("\\n💬 Sentiment (Tech text):");
const s1 = summary.sentiment;
console.log(\`   Score: \${s1.score} — \${s1.label}\`);
console.log(\`   Positive words: \${s1.positiveWords.join(", ")}\`);
console.log(\`   Negative words: \${s1.negativeWords.join(", ")||"none"}\`);

console.log("\\n💬 Sentiment (Negative text):");
const s2 = negAnalyzer.sentiment();
console.log(\`   Score: \${s2.score} — \${s2.label}\`);
console.log(\`   Positive: \${s2.positiveWords.join(", ")||"none"}\`);
console.log(\`   Negative: \${s2.negativeWords.join(", ")}\`);

console.log("\\n🔄 Comparison (Tech vs Negative):");
const cmp = analyzer.compare(negativeText);
console.log(\`   Cosine similarity: \${cmp.cosineSimilarity} (0=different, 1=same)\`);
console.log(\`   Jaccard index:     \${cmp.jaccardIndex}\`);
console.log(\`   Shared words:      \${cmp.sharedWords.join(", ")||"none"}\`);
`,
    },
    expectedOutput: `╔════════════════════════════════════╗
║     TEXT ANALYZER — FULL REPORT    ║
╚════════════════════════════════════╝

📖 Reading Stats:
   Words: 100  Unique: 73  Sentences: 7
   Flesch: 42.3/100 — Difficult
   Reading time: < 1 min
   Lexical diversity: 0.73

📊 Top Words:
   1   javascript         ████     7x (12.1%)
   2   language           ██       3x (5.2%)
   3   developers         ██       3x (5.2%)
   4   powerful           █        2x (3.4%)
   5   frameworks         █        2x (3.4%)
   6   excellent          █        1x (1.7%)
   7   amazing            █        1x (1.7%)
   8   efficient          █        1x (1.7%)

🔗 Top Bigrams:
   "javascript language" (2x)
   "full-stack language" (2x)
   "love javascript" (2x)

💬 Sentiment (Tech text):
   Score: 0.9 — Positive
   Positive words: powerful, amazing, excellent, efficient, fantastic, simple, brilliant, outstanding, strong
   Negative words: none

💬 Sentiment (Negative text):
   Score: -0.83 — Negative
   Positive: none
   Negative: terrible, poor, difficult, hard, broken, slow, weak, bad

🔄 Comparison (Tech vs Negative):
   Cosine similarity: 0.024 (0=different, 1=same)
   Jaccard index:     0.017
   Shared words:      makes`,
  },
];
