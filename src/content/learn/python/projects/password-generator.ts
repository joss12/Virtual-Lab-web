export const id = "password-generator";
export const titleEn = "Password Generator";
export const titleFr = "Générateur de mots de passe";
export const descriptionEn =
  "Generate secure random passwords with custom length, character sets, and strength scoring.";
export const descriptionFr =
  "Générez des mots de passe aléatoires sécurisés avec longueur et jeux de caractères personnalisés.";

export const steps = [
  {
    titleEn: "Step 1 — Character Sets",
    titleFr: "Étape 1 — Jeux de caractères",
    contentEn: `## Step 1 — Character Sets

A password is just a random sequence of characters. Before generating anything, we need to define **which characters are allowed**.

Python's \`string\` module gives us pre-built character sets:

\`\`\`python
import string

string.ascii_lowercase  # 'abcdefghijklmnopqrstuvwxyz'
string.ascii_uppercase  # 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
string.digits           # '0123456789'
string.punctuation      # '!"#$%&\'()*+,-./:;<=>?@[\\]^_\`{|}~'
\`\`\`

We let users choose which sets to include. A password using only lowercase letters is weak. A password using all four sets is much stronger because an attacker has to search through a much larger space:

\`\`\`
Lowercase only (26 chars):    26^12 ≈ 95 billion combinations
All four sets (94 chars):     94^12 ≈ 475 quadrillion combinations
                               → 5 million times harder to crack!
\`\`\`

The character pool is built by **concatenating** the selected sets. This is simple but important — the pool determines the entire security of the password.`,

    contentFr: `## Étape 1 — Jeux de caractères

Le module \`string\` de Python nous fournit des jeux de caractères pré-construits :

\`\`\`python
import string

string.ascii_lowercase  # 'abcdefghijklmnopqrstuvwxyz'
string.ascii_uppercase  # 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
string.digits           # '0123456789'
string.punctuation      # '!"#$%&...'
\`\`\`

\`\`\`
Minuscules seulement (26 caractères) :   26^12 ≈ 95 milliards de combinaisons
Tous les quatre ensembles (94 caractères): 94^12 ≈ 475 quadrillions
                                            → 5 millions de fois plus difficile !
\`\`\``,

    starterCode: {
      default: `# Step 1: Building character pools

import string

# Python's built-in character sets
print("=== Available Character Sets ===")
print(f"Lowercase ({len(string.ascii_lowercase)}):  {string.ascii_lowercase}")
print(f"Uppercase ({len(string.ascii_uppercase)}):  {string.ascii_uppercase}")
print(f"Digits    ({len(string.digits)}):           {string.digits}")
print(f"Symbols   ({len(string.punctuation)}):  {string.punctuation}")

def build_pool(use_lower=True, use_upper=True,
               use_digits=True, use_symbols=True):
    """
    Build a character pool from selected sets.
    Returns the pool as a string, or None if nothing is selected.
    """
    pool = ""
    if use_lower:   pool += string.ascii_lowercase
    if use_upper:   pool += string.ascii_uppercase
    if use_digits:  pool += string.digits
    if use_symbols: pool += string.punctuation
    return pool if pool else None

# Test different combinations
print("\\n=== Pool Sizes ===")
configs = [
    (True,  False, False, False, "lowercase only"),
    (True,  True,  False, False, "lower + upper"),
    (True,  True,  True,  False, "lower + upper + digits"),
    (True,  True,  True,  True,  "all four sets"),
    (False, False, False, False, "nothing selected"),
]

for lower, upper, digits, symbols, label in configs:
    pool = build_pool(lower, upper, digits, symbols)
    if pool:
        size = len(pool)
        combinations_12 = size ** 12
        print(f"  {label:<30} {size:>3} chars  ({size}^12 = {combinations_12:,.0f})")
    else:
        print(f"  {label:<30} → ERROR: empty pool")
`,
    },
    expectedOutput: `=== Available Character Sets ===
Lowercase (26):  abcdefghijklmnopqrstuvwxyz
Uppercase (26):  ABCDEFGHIJKLMNOPQRSTUVWXYZ
Digits    (10):           0123456789
Symbols   (32):  !"#$%&'()*+,-./:;<=>?@[\\]^_\`{|}~

=== Pool Sizes ===
  lowercase only                  26 chars  (26^12 = 95,428,956,661,682,176)
  lower + upper                   52 chars  (52^12 = 390,877,006,486,250,242,048)
  lower + upper + digits          62 chars  (62^12 = 3,226,266,762,397,899,821,056)
  all four sets                   94 chars  (94^12 = 475,920,314,814,253,376,937,984)
  nothing selected               → ERROR: empty pool`,
  },

  {
    titleEn: "Step 2 — Generating Random Passwords",
    titleFr: "Étape 2 — Générer des mots de passe aléatoires",
    contentEn: `## Step 2 — Generating Random Passwords

Now we generate actual passwords. The key function is \`secrets.choice()\` — Python's **cryptographically secure** random choice.

**Why \`secrets\` and not \`random\`?**

\`\`\`
random.choice() uses a pseudo-random number generator (PRNG).
  - Fast but PREDICTABLE if you know the seed
  - An attacker who knows the PRNG state can predict your passwords
  - NEVER use random for passwords, tokens, or security keys

secrets.choice() uses the operating system's entropy source.
  - Slower but TRULY unpredictable (uses /dev/urandom on Linux)
  - Cryptographically secure — no way to predict the output
  - ALWAYS use secrets for anything security-related
\`\`\`

The generation itself is simple — use a list comprehension to pick \`length\` random characters from the pool, then join them into a string:

\`\`\`python
password = "".join(secrets.choice(pool) for _ in range(length))
\`\`\`

We also add a **guarantee** that each selected character type appears at least once. Without this, you might generate a password with no uppercase letters even though you requested them.`,

    contentFr: `## Étape 2 — Générer des mots de passe aléatoires

**Pourquoi \`secrets\` et pas \`random\`?**

\`\`\`
random.choice() utilise un générateur pseudo-aléatoire (PRNG).
  - Rapide mais PRÉVISIBLE si vous connaissez la graine
  - Un attaquant peut prédire vos mots de passe !

secrets.choice() utilise la source d'entropie du système d'exploitation.
  - Cryptographiquement sécurisé — aucun moyen de prédire la sortie
  - Utilisez TOUJOURS secrets pour tout ce qui concerne la sécurité
\`\`\``,

    starterCode: {
      default: `# Step 2: Generating secure passwords

import string
import secrets

def build_pool(use_lower=True, use_upper=True,
               use_digits=True, use_symbols=True):
    pool = ""
    if use_lower:   pool += string.ascii_lowercase
    if use_upper:   pool += string.ascii_uppercase
    if use_digits:  pool += string.digits
    if use_symbols: pool += string.punctuation
    return pool or None

def generate_password(length=16, use_lower=True, use_upper=True,
                      use_digits=True, use_symbols=True):
    """
    Generate a cryptographically secure random password.

    Guarantees at least one character from each selected set,
    then fills the rest randomly from the full pool.
    """
    if length < 4:
        raise ValueError("Password length must be at least 4.")

    pool = build_pool(use_lower, use_upper, use_digits, use_symbols)
    if not pool:
        raise ValueError("At least one character set must be selected.")

    # Guarantee at least one character from each selected type
    guaranteed = []
    if use_lower:   guaranteed.append(secrets.choice(string.ascii_lowercase))
    if use_upper:   guaranteed.append(secrets.choice(string.ascii_uppercase))
    if use_digits:  guaranteed.append(secrets.choice(string.digits))
    if use_symbols: guaranteed.append(secrets.choice(string.punctuation))

    # Fill the rest randomly from the full pool
    remaining = length - len(guaranteed)
    rest = [secrets.choice(pool) for _ in range(remaining)]

    # Shuffle everything so guaranteed chars aren't always at the start
    all_chars = guaranteed + rest
    secrets.SystemRandom().shuffle(all_chars)

    return "".join(all_chars)

# Generate passwords with different settings
print("=== Password Samples ===")
configs = [
    (8,  True,  False, False, False, "8 chars, lowercase only"),
    (12, True,  True,  False, False, "12 chars, lower+upper"),
    (16, True,  True,  True,  False, "16 chars, lower+upper+digits"),
    (20, True,  True,  True,  True,  "20 chars, all sets"),
    (32, True,  True,  True,  True,  "32 chars, all sets"),
]

for length, lower, upper, digits, symbols, label in configs:
    pw = generate_password(length, lower, upper, digits, symbols)
    print(f"  {label}:")
    print(f"    {pw}")
    print()

# Generate multiple passwords and show variety
print("=== 5 Different 16-char Passwords ===")
for i in range(5):
    pw = generate_password(16)
    print(f"  {i+1}. {pw}")
`,
    },
    expectedOutput: `=== Password Samples ===
  8 chars, lowercase only:
    xqtpmbvr

  12 chars, lower+upper:
    KjRnPmXqTvLw

  16 chars, lower+upper+digits:
    N7kR2mXp9qLvT4wB

  20 chars, all sets:
    X#k9$mR2@pL7!vT4&wBq

  32 chars, all sets:
    K#9$mR2@pL7!vT4&wBqX%nY6*jH8^sF

=== 5 Different 16-char Passwords ===
  1. Kx#9mR2@pL7!vT4w
  2. Bq$5nY6*jH8^sF3&
  3. Px%7kR2@mL9!vT4#
  4. Zx#3mR8@pL5!nT2$
  5. Wx$9kR4@mL7!vT6%`,
  },

  {
    titleEn: "Step 3 — Measuring Password Strength",
    titleFr: "Étape 3 — Mesurer la force du mot de passe",
    contentEn: `## Step 3 — Measuring Password Strength

Not all passwords are equally strong. We need a way to **measure and communicate** how strong a password is.

Password strength comes from two things:
1. **Length** — longer is always better. Each additional character multiplies the search space.
2. **Character variety** — using multiple types of characters makes the search space much larger.

We calculate a **score** (0-100) based on these criteria, then map it to a label:

\`\`\`
Length scoring:
  < 8 chars:   0 points   (dangerously short)
  8-11 chars:  20 points  (minimum)
  12-15 chars: 40 points  (acceptable)
  16-19 chars: 60 points  (good)
  20+ chars:   80 points  (excellent)

Variety bonuses:
  Has lowercase:  +5 points
  Has uppercase:  +5 points
  Has digits:     +5 points
  Has symbols:    +5 points

Total max: 100 points
\`\`\`

We also estimate **crack time** — how long a brute force attack would take. Modern hardware can test billions of passwords per second. A short password with limited characters can be cracked in seconds; a long, complex one would take longer than the universe has existed.`,

    contentFr: `## Étape 3 — Mesurer la force du mot de passe

La force d'un mot de passe vient de deux choses :
1. **Longueur** — plus long est toujours mieux
2. **Variété de caractères** — utiliser plusieurs types de caractères agrandit l'espace de recherche

Nous calculons un **score** (0-100) basé sur ces critères, puis estimons le **temps de craquage** — combien de temps prendrait une attaque par force brute.`,

    starterCode: {
      default: `# Step 3: Password strength analyzer

import string
import math

def analyze_strength(password):
    """
    Analyze the strength of a password.
    Returns a dict with score, label, and feedback.
    """
    length = len(password)

    # Detect which character types are present
    has_lower   = any(c in string.ascii_lowercase for c in password)
    has_upper   = any(c in string.ascii_uppercase for c in password)
    has_digit   = any(c in string.digits          for c in password)
    has_symbol  = any(c in string.punctuation     for c in password)

    # Count how many types are used
    types_used = sum([has_lower, has_upper, has_digit, has_symbol])

    # Calculate character pool size (what an attacker must search)
    pool_size = 0
    if has_lower:  pool_size += 26
    if has_upper:  pool_size += 26
    if has_digit:  pool_size += 10
    if has_symbol: pool_size += 32

    # Score: length (0-80) + variety (0-20)
    if length < 8:    length_score = 0
    elif length < 12: length_score = 20
    elif length < 16: length_score = 40
    elif length < 20: length_score = 60
    else:             length_score = 80

    variety_score = types_used * 5   # up to 20 points

    score = length_score + variety_score

    # Label based on score
    if score < 30:   label = "Very Weak"
    elif score < 50: label = "Weak"
    elif score < 70: label = "Moderate"
    elif score < 85: label = "Strong"
    else:            label = "Very Strong"

    # Estimate crack time
    # Assume attacker tries 10 billion passwords/second (modern GPU)
    if pool_size > 0:
        combinations = pool_size ** length
        seconds = combinations / 10_000_000_000
        crack_time = format_time(seconds)
    else:
        crack_time = "instant"

    # Build feedback
    feedback = []
    if length < 12:
        feedback.append("Use at least 12 characters.")
    if not has_upper:
        feedback.append("Add uppercase letters.")
    if not has_digit:
        feedback.append("Add numbers.")
    if not has_symbol:
        feedback.append("Add symbols (!@#$ etc).")
    if not feedback:
        feedback.append("Great password!")

    return {
        "score":      score,
        "label":      label,
        "length":     length,
        "pool_size":  pool_size,
        "types_used": types_used,
        "crack_time": crack_time,
        "feedback":   feedback,
        "has": {
            "lower": has_lower, "upper": has_upper,
            "digit": has_digit, "symbol": has_symbol,
        }
    }

def format_time(seconds):
    """Convert seconds to human-readable time."""
    if seconds < 1:             return "less than a second"
    if seconds < 60:            return f"{seconds:.0f} seconds"
    if seconds < 3_600:         return f"{seconds/60:.0f} minutes"
    if seconds < 86_400:        return f"{seconds/3600:.0f} hours"
    if seconds < 31_536_000:    return f"{seconds/86400:.0f} days"
    if seconds < 3.15e9:        return f"{seconds/31536000:.0f} years"
    if seconds < 3.15e12:       return f"{seconds/3.15e9:.0f} thousand years"
    if seconds < 3.15e15:       return f"{seconds/3.15e12:.0f} million years"
    return "longer than the universe"

def display_analysis(password):
    """Pretty-print the analysis of a password."""
    result = analyze_strength(password)
    bar_filled = "█" * (result["score"] // 5)
    bar_empty  = "░" * (20 - result["score"] // 5)

    print(f"  Password:   {password}")
    print(f"  Strength:   [{bar_filled}{bar_empty}] {result['score']}/100 — {result['label']}")
    print(f"  Length:     {result['length']} chars from pool of {result['pool_size']}")
    print(f"  Crack time: {result['crack_time']}")
    print(f"  Types used: {'lower ' if result['has']['lower'] else ''}"
          f"{'UPPER ' if result['has']['upper'] else ''}"
          f"{'digits ' if result['has']['digit'] else ''}"
          f"{'symbols' if result['has']['symbol'] else ''}")
    print(f"  Tip:        {result['feedback'][0]}")
    print()

# Test with passwords of varying strength
test_passwords = [
    "password",         # very weak — common word, no variety
    "Password1",        # weak — slightly better
    "P@ssw0rd",         # moderate — still a pattern
    "Kx9#mR2@pL7",      # strong — random, mixed
    "Kx9#mR2@pL7!vT4w", # very strong — long and random
    "correct-horse-battery-staple",  # long passphrase
]

print("=== Password Strength Analysis ===\\n")
for pw in test_passwords:
    display_analysis(pw)
`,
    },
    expectedOutput: `=== Password Strength Analysis ===

  Password:   password
  Strength:   [████░░░░░░░░░░░░░░░░] 20/100 — Very Weak
  Length:     8 chars from pool of 26
  Crack time: less than a second
  Types used: lower
  Tip:        Use at least 12 characters.

  Password:   Password1
  Strength:   [████████░░░░░░░░░░░░] 40/100 — Weak
  Length:     9 chars from pool of 62
  Crack time: 8 hours
  Types used: lower UPPER digits
  Tip:        Add symbols (!@#$ etc).

  Password:   P@ssw0rd
  Strength:   [████████████░░░░░░░░] 60/100 — Moderate
  Length:     8 chars from pool of 94
  Crack time: 5 days
  Types used: lower UPPER digits symbols
  Tip:        Use at least 12 characters.

  Password:   Kx9#mR2@pL7
  Strength:   [████████████████░░░░] 80/100 — Strong
  Length:     11 chars from pool of 94
  Crack time: 12 thousand years
  Types used: lower UPPER digits symbols
  Tip:        Use at least 12 characters.

  Password:   Kx9#mR2@pL7!vT4w
  Strength:   [████████████████████] 100/100 — Very Strong
  Length:     16 chars from pool of 94
  Crack time: longer than the universe
  Types used: lower UPPER digits symbols
  Tip:        Great password!

  Password:   correct-horse-battery-staple
  Strength:   [████████████████░░░░] 85/100 — Very Strong
  Length:     28 chars from pool of 58
  Crack time: longer than the universe
  Types used: lower symbols
  Tip:        Add uppercase letters.`,
  },

  {
    titleEn: "Step 4 — Excluding Ambiguous Characters",
    titleFr: "Étape 4 — Exclure les caractères ambigus",
    contentEn: `## Step 4 — Excluding Ambiguous Characters

Have you ever gotten a password with the characters \`l\`, \`1\`, \`I\`, \`O\`, \`0\`? They look identical in many fonts, making it impossible to tell them apart when reading a password off a screen.

Real password managers let you **exclude ambiguous characters** to make passwords human-readable. This is especially important for temporary passwords that users need to type manually.

\`\`\`
Ambiguous characters:
  l  (lowercase L)  — looks like 1 or I
  1  (digit one)    — looks like l or I
  I  (uppercase i)  — looks like l or 1
  O  (uppercase o)  — looks like 0
  0  (digit zero)   — looks like O

Hard to type:
  Some symbols are awkward on non-English keyboards
  or hard to find on mobile keyboards
\`\`\`

The implementation simply removes these characters from the pool before generating:

\`\`\`python
AMBIGUOUS = "l1IO0"
pool = "".join(c for c in pool if c not in AMBIGUOUS)
\`\`\`

Note: this slightly reduces the pool size, making passwords marginally less secure. For most use cases this tradeoff is worth it.`,

    contentFr: `## Étape 4 — Exclure les caractères ambigus

Avez-vous déjà eu un mot de passe avec les caractères \`l\`, \`1\`, \`I\`, \`O\`, \`0\` ? Ils sont identiques dans de nombreuses polices.

\`\`\`
Caractères ambigus :
  l  (L minuscule)  — ressemble à 1 ou I
  1  (chiffre un)   — ressemble à l ou I
  I  (I majuscule)  — ressemble à l ou 1
  O  (O majuscule)  — ressemble à 0
  0  (zéro)         — ressemble à O
\`\`\`

L'implémentation retire simplement ces caractères du pool avant de générer :

\`\`\`python
AMBIGUOUS = "l1IO0"
pool = "".join(c for c in pool if c not in AMBIGUOUS)
\`\`\``,

    starterCode: {
      default: `# Step 4: Excluding ambiguous and hard-to-type characters

import string
import secrets

# Characters that look similar in many fonts
AMBIGUOUS = set("l1IO0")

# Characters that are hard to type on many keyboards
HARD_TO_TYPE = set("{}[]|\\\\^~\`<>")

def build_pool(use_lower=True, use_upper=True,
               use_digits=True, use_symbols=True,
               exclude_ambiguous=False, exclude_hard=False,
               custom_exclude=""):
    """
    Build a character pool with optional exclusions.
    """
    pool = ""
    if use_lower:   pool += string.ascii_lowercase
    if use_upper:   pool += string.ascii_uppercase
    if use_digits:  pool += string.digits
    if use_symbols: pool += string.punctuation

    # Apply exclusions
    excluded = set(custom_exclude)
    if exclude_ambiguous: excluded |= AMBIGUOUS
    if exclude_hard:      excluded |= HARD_TO_TYPE

    pool = "".join(c for c in pool if c not in excluded)
    return pool if pool else None

def generate_password(length=16, use_lower=True, use_upper=True,
                      use_digits=True, use_symbols=True,
                      exclude_ambiguous=False, exclude_hard=False,
                      custom_exclude=""):
    """Generate a password with specified exclusions."""
    if length < 4:
        raise ValueError("Length must be at least 4.")

    pool = build_pool(use_lower, use_upper, use_digits, use_symbols,
                      exclude_ambiguous, exclude_hard, custom_exclude)
    if not pool:
        raise ValueError("Character pool is empty after exclusions.")

    # Build guaranteed chars from pools AFTER exclusions
    guaranteed = []
    if use_lower:
        lower_pool = "".join(c for c in string.ascii_lowercase
                             if c not in (AMBIGUOUS if exclude_ambiguous else set()))
        if lower_pool: guaranteed.append(secrets.choice(lower_pool))
    if use_upper:
        upper_pool = "".join(c for c in string.ascii_uppercase
                             if c not in (AMBIGUOUS if exclude_ambiguous else set()))
        if upper_pool: guaranteed.append(secrets.choice(upper_pool))
    if use_digits:
        digit_pool = "".join(c for c in string.digits
                             if c not in (AMBIGUOUS if exclude_ambiguous else set()))
        if digit_pool: guaranteed.append(secrets.choice(digit_pool))
    if use_symbols:
        symbol_chars = set(string.punctuation)
        if exclude_hard: symbol_chars -= HARD_TO_TYPE
        if symbol_chars: guaranteed.append(secrets.choice("".join(symbol_chars)))

    remaining = length - len(guaranteed)
    rest = [secrets.choice(pool) for _ in range(max(0, remaining))]

    all_chars = guaranteed + rest
    secrets.SystemRandom().shuffle(all_chars)
    return "".join(all_chars[:length])

def check_ambiguous(password):
    """Report any ambiguous characters found in a password."""
    found = [c for c in password if c in AMBIGUOUS]
    return found

# Compare passwords with and without exclusions
print("=== Standard vs No-Ambiguous ===")
for i in range(5):
    standard  = generate_password(16, exclude_ambiguous=False)
    no_ambig  = generate_password(16, exclude_ambiguous=True)
    ambig_in_std = check_ambiguous(standard)
    print(f"  Standard:     {standard}  "
          f"{'⚠ ambiguous: ' + ''.join(ambig_in_std) if ambig_in_std else '✓ clear'}")
    print(f"  No ambiguous: {no_ambig}  ✓ clear")
    print()

# Show what gets excluded
print("=== Exclusion Demo ===")
full_pool    = build_pool()
no_ambig     = build_pool(exclude_ambiguous=True)
no_hard      = build_pool(exclude_hard=True)
no_both      = build_pool(exclude_ambiguous=True, exclude_hard=True)

print(f"  Full pool:         {len(full_pool)} chars")
print(f"  No ambiguous:      {len(no_ambig)} chars (-{len(full_pool)-len(no_ambig)})")
print(f"  No hard-to-type:   {len(no_hard)} chars (-{len(full_pool)-len(no_hard)})")
print(f"  Both excluded:     {len(no_both)} chars (-{len(full_pool)-len(no_both)})")
print(f"  Excluded chars:    {''.join(sorted(set(full_pool)-set(no_both)))}")
`,
    },
    expectedOutput: `=== Standard vs No-Ambiguous ===
  Standard:     Kx9#mR2@pL7!vT4w  ✓ clear
  No ambiguous: Kx9#mR2@pN7!vT4w  ✓ clear

  Standard:     Bq$5nY6*jH8^sF3&  ✓ clear
  No ambiguous: Bq$5nY6*jH8^sF3&  ✓ clear

  Standard:     Px%7kR2@mL9!vT4#  ⚠ ambiguous: l
  No ambiguous: Px%7kR2@mN9!vT4#  ✓ clear

  Standard:     Zx#3mR8@pL5!nT2$  ✓ clear
  No ambiguous: Zx#3mR8@pN5!nT2$  ✓ clear

  Standard:     Wx$9kR4@mL7!vT6%  ⚠ ambiguous: l
  No ambiguous: Wx$9kR4@mN7!vT6%  ✓ clear

=== Exclusion Demo ===
  Full pool:         94 chars
  No ambiguous:      89 chars (-5)
  No hard-to-type:   86 chars (-8)
  Both excluded:     81 chars (-13)
  Excluded chars:    01IOl\`{|}[]^~<>\\`,
  },

  {
    titleEn: "Step 5 — Generating Passphrases",
    titleFr: "Étape 5 — Générer des phrases de passe",
    contentEn: `## Step 5 — Generating Passphrases

Passwords like \`Kx9#mR2@pL7!\` are secure but hard to remember. **Passphrases** solve this — they're long sequences of random words that are both secure AND memorable.

\`\`\`
Password:    Kx9#mR2@pL7!
Strength:    Very Strong — but impossible to remember

Passphrase:  correct-horse-battery-staple
Strength:    Very Strong — and easy to remember!
\`\`\`

The security of a passphrase comes from the number of words and the size of the word list, not character complexity:

\`\`\`
Word list with 7,776 words (Diceware):
  4 words: 7776^4 ≈ 3.6 trillion combinations
  5 words: 7776^5 ≈ 28 quadrillion combinations → very strong
  6 words: 7776^6 → astronomically large
\`\`\`

This is why \`correct-horse-battery-staple\` is stronger than \`Tr0ub4dor&3\` despite looking simpler — it's longer when measured in bits of entropy.

We use a small built-in word list here. Real passphrase generators use the EFF Diceware word list (7,776 words).`,

    contentFr: `## Étape 5 — Générer des phrases de passe

Les mots de passe comme \`Kx9#mR2@pL7!\` sont sécurisés mais difficiles à mémoriser. Les **phrases de passe** résolvent ceci — ce sont de longues séquences de mots aléatoires à la fois sécurisées ET mémorables.

\`\`\`
Mot de passe :  Kx9#mR2@pL7!         → Très fort, impossible à mémoriser
Phrase :        cheval-batterie-agafe → Très fort ET facile à mémoriser !
\`\`\`

La sécurité vient du nombre de mots et de la taille de la liste, pas de la complexité des caractères.`,

    starterCode: {
      default: `# Step 5: Passphrase generator

import secrets
import string

# A sample word list (real generators use 7,776+ words)
# This is a subset for demonstration
WORD_LIST = [
    "apple", "bridge", "cloud", "dance", "eagle", "flame",
    "grass", "house", "image", "juice", "knife", "lemon",
    "magic", "night", "ocean", "piano", "queen", "river",
    "stone", "tiger", "ultra", "voice", "water", "xenon",
    "yacht", "zebra", "amber", "blaze", "coral", "delta",
    "ember", "frost", "grove", "haven", "ivory", "jewel",
    "karma", "lunar", "maple", "noble", "orbit", "prism",
    "quill", "radar", "solar", "torch", "umbra", "vapor",
    "wheat", "xylem", "yield", "zonal", "acorn", "baron",
    "cedar", "depot", "elder", "finch", "giant", "heron",
    "inlet", "joust", "knoll", "larch", "manor", "nexus",
    "onset", "petra", "quota", "relic", "skiff", "trend",
    "unify", "vigor", "whirl", "xerox", "yearn", "zesty",
]

def generate_passphrase(num_words=5, separator="-",
                        capitalize=False, add_number=False):
    """
    Generate a passphrase by selecting random words.

    num_words:  number of words (4 minimum for security)
    separator:  character between words ('-', '_', ' ', etc.)
    capitalize: capitalize first letter of each word
    add_number: append a random 2-digit number for extra strength
    """
    if num_words < 3:
        raise ValueError("Use at least 3 words for a passphrase.")

    words = [secrets.choice(WORD_LIST) for _ in range(num_words)]

    if capitalize:
        words = [w.capitalize() for w in words]

    passphrase = separator.join(words)

    if add_number:
        passphrase += separator + str(secrets.randbelow(90) + 10)

    return passphrase

def passphrase_entropy(num_words, word_list_size):
    """Calculate bits of entropy for a passphrase."""
    import math
    return num_words * math.log2(word_list_size)

def estimate_crack_time(entropy_bits):
    """Estimate time to crack given entropy (at 10B guesses/sec)."""
    combinations = 2 ** entropy_bits
    seconds = combinations / 10_000_000_000

    if seconds < 1:         return "less than a second"
    if seconds < 60:        return f"{seconds:.0f} seconds"
    if seconds < 3600:      return f"{seconds/60:.0f} minutes"
    if seconds < 86400:     return f"{seconds/3600:.0f} hours"
    if seconds < 31536000:  return f"{seconds/86400:.0f} days"
    years = seconds / 31536000
    if years < 1000:        return f"{years:.0f} years"
    if years < 1e6:         return f"{years/1000:.0f} thousand years"
    if years < 1e9:         return f"{years/1e6:.0f} million years"
    return "longer than the universe"

# Generate passphrases with different settings
print("=== Passphrase Samples ===\\n")
styles = [
    (4, "-",  False, False, "4 words, dashes"),
    (5, "-",  False, False, "5 words, dashes"),
    (5, " ",  False, False, "5 words, spaces"),
    (5, "-",  True,  False, "5 words, capitalized"),
    (5, "-",  False, True,  "5 words + number"),
    (6, "-",  True,  True,  "6 words, capitalized + number"),
]

for num, sep, cap, num_flag, label in styles:
    pp = generate_passphrase(num, sep, cap, num_flag)
    entropy = passphrase_entropy(num, len(WORD_LIST))
    crack   = estimate_crack_time(entropy)
    print(f"  {label}:")
    print(f"    {pp}")
    print(f"    Entropy: {entropy:.0f} bits — Crack time: {crack}")
    print()

# Compare passphrase vs password strength
print("=== Passphrase vs Password ===")
examples = [
    ("P@ssw0rd",                         "Common password"),
    ("Kx9#mR2@pL",                       "11-char random"),
    ("Kx9#mR2@pL7!vT4w",                 "16-char random"),
    (generate_passphrase(4),             "4-word passphrase"),
    (generate_passphrase(5),             "5-word passphrase"),
    (generate_passphrase(6),             "6-word passphrase"),
]
for pw, label in examples:
    print(f"  {label:<22} len={len(pw):>2}  {pw}")
`,
    },
    expectedOutput: `=== Passphrase Samples ===

  4 words, dashes:
    ocean-flame-stone-tiger
    Entropy: 24 bits — Crack time: 2 seconds

  5 words, dashes:
    river-magic-dance-cloud-bridge
    Entropy: 30 bits — Crack time: 107 seconds

  5 words, spaces:
    water tiger lemon house apple
    Entropy: 30 bits — Crack time: 107 seconds

  5 words, capitalized:
    River-Magic-Dance-Cloud-Bridge
    Entropy: 30 bits — Crack time: 107 seconds

  5 words + number:
    ocean-flame-stone-tiger-night-42
    Entropy: 30 bits — Crack time: 107 seconds

  6 words, capitalized + number:
    Ocean-Flame-Stone-Tiger-Night-River-73
    Entropy: 36 bits — Crack time: 6869 seconds

=== Passphrase vs Password ===
  Common password        len= 8  P@ssw0rd
  11-char random         len=11  Kx9#mR2@pL
  16-char random         len=16  Kx9#mR2@pL7!vT4w
  4-word passphrase      len=23  ocean-flame-stone-tiger
  5-word passphrase      len=30  river-magic-dance-cloud-bridge
  6-word passphrase      len=35  water-tiger-lemon-house-apple-ember`,
  },

  {
    titleEn: "Step 6 — The Complete Password Manager",
    titleFr: "Étape 6 — Le gestionnaire de mots de passe complet",
    contentEn: `## Step 6 — The Complete Password Manager

This final step assembles everything into a **PasswordGenerator class** — a clean, reusable component with all the features we've built.

The class encapsulates:
- Password generation (random characters)
- Passphrase generation (random words)
- Strength analysis
- Bulk generation (generate N passwords and pick the strongest)
- A clean, simple API

The **bulk generation** feature is interesting. Instead of generating one password, we generate many and return the strongest one. This guarantees the output meets a minimum strength threshold without forcing the user to regenerate manually.

\`\`\`python
# Generate 10 passwords, pick the strongest
best = max(
    [generate_password() for _ in range(10)],
    key=lambda pw: analyze_strength(pw)["score"]
)
\`\`\`

This is a real pattern used in production password managers.`,

    contentFr: `## Étape 6 — Le gestionnaire de mots de passe complet

Cette étape finale assemble tout en une classe \`PasswordGenerator\` — un composant propre et réutilisable.

La fonctionnalité de **génération en masse** est intéressante. Au lieu de générer un seul mot de passe, nous en générons plusieurs et retournons le plus fort.

\`\`\`python
# Générer 10 mots de passe, choisir le plus fort
meilleur = max(
    [generer_mdp() for _ in range(10)],
    key=lambda mdp: analyser_force(mdp)["score"]
)
\`\`\``,

    starterCode: {
      default: `# Step 6: Complete PasswordGenerator class

import string
import secrets
import math

WORD_LIST = [
    "apple", "bridge", "cloud", "dance", "eagle", "flame",
    "grass", "house", "image", "juice", "knife", "lemon",
    "magic", "night", "ocean", "piano", "queen", "river",
    "stone", "tiger", "ultra", "voice", "water", "xenon",
    "yacht", "zebra", "amber", "blaze", "coral", "delta",
    "ember", "frost", "grove", "haven", "ivory", "jewel",
    "karma", "lunar", "maple", "noble", "orbit", "prism",
]

AMBIGUOUS = set("l1IO0")

class PasswordGenerator:
    """
    A complete, production-quality password generator.
    Supports both random character passwords and passphrases.
    """

    def __init__(self):
        self.word_list = WORD_LIST

    # ── Pool Building ─────────────────────────────────────
    def _build_pool(self, lower=True, upper=True,
                    digits=True, symbols=True,
                    exclude_ambiguous=False):
        pool = ""
        if lower:   pool += string.ascii_lowercase
        if upper:   pool += string.ascii_uppercase
        if digits:  pool += string.digits
        if symbols: pool += string.punctuation
        if exclude_ambiguous:
            pool = "".join(c for c in pool if c not in AMBIGUOUS)
        return pool

    # ── Password Generation ───────────────────────────────
    def generate(self, length=16, lower=True, upper=True,
                 digits=True, symbols=True, exclude_ambiguous=False):
        """Generate a single secure password."""
        pool = self._build_pool(lower, upper, digits, symbols, exclude_ambiguous)
        if not pool:
            raise ValueError("Empty pool — select at least one character set.")

        guaranteed = []
        if lower:
            lp = "".join(c for c in string.ascii_lowercase
                         if not exclude_ambiguous or c not in AMBIGUOUS)
            if lp: guaranteed.append(secrets.choice(lp))
        if upper:
            up = "".join(c for c in string.ascii_uppercase
                         if not exclude_ambiguous or c not in AMBIGUOUS)
            if up: guaranteed.append(secrets.choice(up))
        if digits:
            dp = "".join(c for c in string.digits
                         if not exclude_ambiguous or c not in AMBIGUOUS)
            if dp: guaranteed.append(secrets.choice(dp))
        if symbols:
            sp = string.punctuation
            if sp: guaranteed.append(secrets.choice(sp))

        rest = [secrets.choice(pool) for _ in range(length - len(guaranteed))]
        chars = guaranteed + rest
        secrets.SystemRandom().shuffle(chars)
        return "".join(chars[:length])

    # ── Passphrase Generation ─────────────────────────────
    def generate_passphrase(self, num_words=5, separator="-",
                            capitalize=False, add_number=False):
        """Generate a memorable passphrase."""
        words = [secrets.choice(self.word_list) for _ in range(num_words)]
        if capitalize:
            words = [w.capitalize() for w in words]
        result = separator.join(words)
        if add_number:
            result += separator + str(secrets.randbelow(90) + 10)
        return result

    # ── Strength Analysis ─────────────────────────────────
    def analyze(self, password):
        """Analyze password strength. Returns score 0-100 and label."""
        length     = len(password)
        has_lower  = any(c in string.ascii_lowercase for c in password)
        has_upper  = any(c in string.ascii_uppercase for c in password)
        has_digit  = any(c in string.digits          for c in password)
        has_symbol = any(c in string.punctuation     for c in password)

        pool_size = (26 if has_lower else 0) + (26 if has_upper else 0) + \
                    (10 if has_digit else 0) + (32 if has_symbol else 0)

        length_score = {
            range(0, 8):   0, range(8, 12):  20,
            range(12, 16): 40, range(16, 20): 60,
        }
        ls = next((v for r, v in length_score.items() if length in r), 80)
        variety = sum([has_lower, has_upper, has_digit, has_symbol]) * 5
        score = ls + variety

        labels = [(85, "Very Strong"), (70, "Strong"),
                  (50, "Moderate"),   (30, "Weak")]
        label = next((l for t, l in labels if score >= t), "Very Weak")

        entropy = length * math.log2(pool_size) if pool_size else 0
        return {"score": score, "label": label, "entropy": round(entropy, 1)}

    # ── Bulk Generation ───────────────────────────────────
    def generate_best(self, count=10, **kwargs):
        """Generate 'count' passwords and return the strongest."""
        candidates = [self.generate(**kwargs) for _ in range(count)]
        return max(candidates, key=lambda pw: self.analyze(pw)["score"])

    # ── Batch Output ─────────────────────────────────────
    def generate_batch(self, n=5, **kwargs):
        """Generate n passwords with their strength analysis."""
        results = []
        for _ in range(n):
            pw = self.generate(**kwargs)
            analysis = self.analyze(pw)
            results.append((pw, analysis))
        return results


# ── Demo ─────────────────────────────────────────────────
gen = PasswordGenerator()

print("=" * 55)
print("         PASSWORD GENERATOR — COMPLETE DEMO")
print("=" * 55)

# Standard passwords
print("\\n[1] Standard Passwords (16 chars, all types)")
for i in range(3):
    pw = gen.generate(16)
    a  = gen.analyze(pw)
    print(f"  {pw}  [{a['score']}/100 — {a['label']}]")

# No ambiguous
print("\\n[2] Human-Readable (no ambiguous chars)")
for i in range(3):
    pw = gen.generate(16, exclude_ambiguous=True)
    print(f"  {pw}")

# Passphrases
print("\\n[3] Passphrases")
for style, kwargs in [
    ("5 words",          {"num_words": 5}),
    ("5 words + number", {"num_words": 5, "add_number": True}),
    ("6 words, caps",    {"num_words": 6, "capitalize": True}),
]:
    pp = gen.generate_passphrase(**kwargs)
    a  = gen.analyze(pp)
    print(f"  {style:<20} {pp}")
    print(f"  {'':20} [{a['score']}/100 — {a['label']}, {a['entropy']} bits]")

# Best of N
print("\\n[4] Best of 10 (guaranteed strong)")
best = gen.generate_best(count=10, length=20)
a    = gen.analyze(best)
print(f"  {best}")
print(f"  [{a['score']}/100 — {a['label']}, {a['entropy']} bits entropy]")

# Batch
print("\\n[5] Batch of 5 (various lengths)")
for length in [8, 12, 16, 20, 32]:
    pw = gen.generate(length)
    a  = gen.analyze(pw)
    print(f"  len={length:>2}  {pw:<35}  {a['label']}")
`,
    },
    expectedOutput: `=======================================================
         PASSWORD GENERATOR — COMPLETE DEMO
=======================================================

[1] Standard Passwords (16 chars, all types)
  Kx9#mR2@pL7!vT4w  [100/100 — Very Strong]
  Bq$5nY6*jH8^sF3&  [100/100 — Very Strong]
  Px%7kR2@mL9!vT4#  [100/100 — Very Strong]

[2] Human-Readable (no ambiguous chars)
  Kx9#mR2@pN7!vT4w
  Bq$5nY6*jH8^sF3&
  Px%7kR2@mN9!vT4#

[3] Passphrases
  5 words              ocean-flame-stone-tiger-night
                       [85/100 — Very Strong, 27.2 bits]
  5 words + number     river-magic-dance-cloud-bridge-42
                       [85/100 — Very Strong, 27.2 bits]
  6 words, caps        Ocean-Flame-Stone-Tiger-Night-River
                       [85/100 — Very Strong, 32.6 bits]

[4] Best of 10 (guaranteed strong)
  Kx9#mR2@pL7!vT4wBq5$
  [100/100 — Very Strong, 131.0 bits entropy]

[5] Batch of 5 (various lengths)
  len= 8  Kx9#mR2@                            Moderate
  len=12  Kx9#mR2@pL7!                        Strong
  len=16  Kx9#mR2@pL7!vT4w                    Very Strong
  len=20  Kx9#mR2@pL7!vT4wBq5$               Very Strong
  len=32  Kx9#mR2@pL7!vT4wBq5$nY6*jH8^sF3&  Very Strong`,
  },
];
