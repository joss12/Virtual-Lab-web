export const id = "unit-converter";
export const titleEn = "Unit Converter";
export const titleFr = "Convertisseur d'unités";
export const descriptionEn =
  "Build a multi-category unit converter handling length, weight, temperature and more.";
export const descriptionFr =
  "Construisez un convertisseur d'unités multi-catégories gérant longueur, poids, température et plus.";

export const steps = [
  {
    titleEn: "Step 1 — Conversion Data Structure",
    titleFr: "Étape 1 — Structure de données de conversion",
    contentEn: `## Step 1 — Conversion Data Structure

Before any logic, the most important decision is **how to represent the conversion relationships**. The design choice here determines everything else.

The cleanest approach: store all units relative to a **base unit**. Every unit has a factor that converts it to the base. To convert from A to B: first convert A to base, then base to B.

\`\`\`
Length base: meters
  kilometer = 1000 meters  → factor: 1000
  meter     = 1 meter      → factor: 1
  centimeter = 0.01 meters → factor: 0.01
  foot      = 0.3048 meters → factor: 0.3048

Convert 5 kilometers to feet:
  5 km × 1000 (km→meters) = 5000 meters
  5000 ÷ 0.3048 (meters→feet) = 16,404 feet
\`\`\`

Temperature is the exception — it uses offsets, not just factors. We handle it separately with explicit formulas.`,

    contentFr: `## Étape 1 — Structure de données de conversion

L'approche la plus propre : stocker toutes les unités par rapport à une **unité de base**. Chaque unité a un facteur qui la convertit vers la base.

\`\`\`
Base longueur : mètres
  kilomètre  → facteur : 1000
  mètre      → facteur : 1
  centimètre → facteur : 0.01
  pied       → facteur : 0.3048
\`\`\`

La température est l'exception — elle utilise des décalages, pas seulement des facteurs.`,

    starterCode: {
      default: `// Step 1: Conversion data structure

const UNITS = {
    length: {
        label: "Length",
        base:  "meter",
        units: {
            kilometer:  { label: "Kilometer",  symbol: "km",   factor: 1000     },
            meter:      { label: "Meter",       symbol: "m",    factor: 1        },
            centimeter: { label: "Centimeter",  symbol: "cm",   factor: 0.01     },
            millimeter: { label: "Millimeter",  symbol: "mm",   factor: 0.001    },
            mile:       { label: "Mile",        symbol: "mi",   factor: 1609.344 },
            yard:       { label: "Yard",        symbol: "yd",   factor: 0.9144   },
            foot:       { label: "Foot",        symbol: "ft",   factor: 0.3048   },
            inch:       { label: "Inch",        symbol: "in",   factor: 0.0254   },
        },
    },

    weight: {
        label: "Weight",
        base:  "kilogram",
        units: {
            tonne:     { label: "Tonne",      symbol: "t",   factor: 1000      },
            kilogram:  { label: "Kilogram",   symbol: "kg",  factor: 1         },
            gram:      { label: "Gram",       symbol: "g",   factor: 0.001     },
            milligram: { label: "Milligram",  symbol: "mg",  factor: 0.000001  },
            pound:     { label: "Pound",      symbol: "lb",  factor: 0.453592  },
            ounce:     { label: "Ounce",      symbol: "oz",  factor: 0.028349  },
        },
    },

    // Temperature handled specially — uses formulas not factors
    temperature: {
        label: "Temperature",
        base:  "celsius",
        units: {
            celsius:    { label: "Celsius",    symbol: "°C" },
            fahrenheit: { label: "Fahrenheit", symbol: "°F" },
            kelvin:     { label: "Kelvin",     symbol: "K"  },
        },
    },

    speed: {
        label: "Speed",
        base:  "mps",
        units: {
            mps:  { label: "Meters/second",  symbol: "m/s",  factor: 1          },
            kph:  { label: "Km/hour",        symbol: "km/h", factor: 1 / 3.6    },
            mph:  { label: "Miles/hour",     symbol: "mph",  factor: 0.44704    },
            knot: { label: "Knot",           symbol: "kn",   factor: 0.514444   },
        },
    },
};

// Explore the structure
console.log("=== Available Categories ===");
Object.entries(UNITS).forEach(([key, cat]) => {
    const unitList = Object.keys(cat.units).join(", ");
    console.log(\`  \${cat.label}: \${unitList}\`);
});

// Show details for length
console.log("\\n=== Length Units (base: meter) ===");
Object.entries(UNITS.length.units).forEach(([key, unit]) => {
    console.log(\`  \${unit.label} (\${unit.symbol}): factor = \${unit.factor}\`);
});
`,
    },
    expectedOutput: `=== Available Categories ===
  Length: kilometer, meter, centimeter, millimeter, mile, yard, foot, inch
  Weight: tonne, kilogram, gram, milligram, pound, ounce
  Temperature: celsius, fahrenheit, kelvin
  Speed: mps, kph, mph, knot

=== Length Units (base: meter) ===
  Kilometer (km): factor = 1000
  Meter (m): factor = 1
  Centimeter (cm): factor = 0.01
  Millimeter (mm): factor = 0.001
  Mile (mi): factor = 1609.344
  Yard (yd): factor = 0.9144
  Foot (ft): factor = 0.3048
  Inch (in): factor = 0.0254`,
  },

  {
    titleEn: "Step 2 — The Core Conversion Engine",
    titleFr: "Étape 2 — Le moteur de conversion",
    contentEn: `## Step 2 — The Core Conversion Engine

Now we build the conversion logic. The algorithm is:

\`\`\`
convert(value, fromUnit, toUnit, category):
  1. fromBase = value × fromUnit.factor   (convert to base unit)
  2. result   = fromBase ÷ toUnit.factor  (convert from base to target)

Example: 5 km to feet
  1. 5 × 1000 = 5000 meters (base)
  2. 5000 ÷ 0.3048 = 16,404.2 feet
\`\`\`

Temperature needs special formulas:
\`\`\`
°C → °F: (C × 9/5) + 32
°F → °C: (F - 32) × 5/9
°C → K:  C + 273.15
K  → °C: K - 273.15
\`\`\`

The implementation converts everything to Celsius first (our base), then to the target.`,

    contentFr: `## Étape 2 — Le moteur de conversion

L'algorithme de conversion :

\`\`\`
convertir(valeur, unitéDépart, unitéArrivée, catégorie) :
  1. versBase = valeur × facteur(unitéDépart)
  2. résultat = versBase ÷ facteur(unitéArrivée)
\`\`\`

La température nécessite des formules spéciales :
\`\`\`
°C → °F : (C × 9/5) + 32
°F → °C : (F - 32) × 5/9
°C → K  : C + 273.15
\`\`\``,

    starterCode: {
      default: `// Step 2: Conversion engine

const UNITS = {
    length: {
        base: "meter",
        units: {
            kilometer:  { label: "Kilometer",  symbol: "km", factor: 1000 },
            meter:      { label: "Meter",      symbol: "m",  factor: 1 },
            centimeter: { label: "Centimeter", symbol: "cm", factor: 0.01 },
            foot:       { label: "Foot",       symbol: "ft", factor: 0.3048 },
            inch:       { label: "Inch",       symbol: "in", factor: 0.0254 },
            mile:       { label: "Mile",       symbol: "mi", factor: 1609.344 },
        },
    },
    weight: {
        base: "kilogram",
        units: {
            kilogram: { label: "Kilogram", symbol: "kg", factor: 1 },
            gram:     { label: "Gram",     symbol: "g",  factor: 0.001 },
            pound:    { label: "Pound",    symbol: "lb", factor: 0.453592 },
            ounce:    { label: "Ounce",    symbol: "oz", factor: 0.028349 },
        },
    },
    temperature: {
        base: "celsius",
        units: {
            celsius:    { label: "Celsius",    symbol: "°C" },
            fahrenheit: { label: "Fahrenheit", symbol: "°F" },
            kelvin:     { label: "Kelvin",     symbol: "K"  },
        },
    },
};

// Temperature: convert to Celsius first (base), then to target
function convertTemperature(value, from, to) {
    let celsius;

    // Step 1: to Celsius (base)
    if      (from === "celsius")    celsius = value;
    else if (from === "fahrenheit") celsius = (value - 32) * 5 / 9;
    else if (from === "kelvin")     celsius = value - 273.15;
    else throw new Error(\`Unknown unit: \${from}\`);

    // Step 2: from Celsius to target
    if      (to === "celsius")      return celsius;
    else if (to === "fahrenheit")   return celsius * 9 / 5 + 32;
    else if (to === "kelvin")       return celsius + 273.15;
    else throw new Error(\`Unknown unit: \${to}\`);
}

// General: factor-based conversion
function convertUnit(value, from, to, category) {
    if (category === "temperature") {
        return convertTemperature(value, from, to);
    }

    const cat = UNITS[category];
    if (!cat) throw new Error(\`Unknown category: \${category}\`);

    const fromUnit = cat.units[from];
    const toUnit   = cat.units[to];
    if (!fromUnit) throw new Error(\`Unknown unit: \${from}\`);
    if (!toUnit)   throw new Error(\`Unknown unit: \${to}\`);

    // Convert: value → base unit → target unit
    const inBase = value * fromUnit.factor;
    return inBase / toUnit.factor;
}

function format(value, decimals = 6) {
    // Remove trailing zeros, max 6 decimal places
    return parseFloat(value.toFixed(decimals)).toString();
}

// Test conversions
console.log("=== Length Conversions ===");
const lengthTests = [
    [1,    "kilometer",  "mile"],
    [5,    "kilometer",  "foot"],
    [100,  "centimeter", "inch"],
    [1,    "mile",       "kilometer"],
    [1,    "foot",       "centimeter"],
];
lengthTests.forEach(([val, from, to]) => {
    const result = convertUnit(val, from, to, "length");
    const fSymbol = UNITS.length.units[from].symbol;
    const tSymbol = UNITS.length.units[to].symbol;
    console.log(\`  \${val} \${fSymbol} = \${format(result)} \${tSymbol}\`);
});

console.log("\\n=== Weight Conversions ===");
const weightTests = [
    [1,   "kilogram", "pound"],
    [1,   "pound",    "gram"],
    [500, "gram",     "ounce"],
];
weightTests.forEach(([val, from, to]) => {
    const result = convertUnit(val, from, to, "weight");
    console.log(\`  \${val} \${UNITS.weight.units[from].symbol} = \${format(result)} \${UNITS.weight.units[to].symbol}\`);
});

console.log("\\n=== Temperature Conversions ===");
const tempTests = [
    [0,   "celsius",    "fahrenheit"],
    [100, "celsius",    "fahrenheit"],
    [32,  "fahrenheit", "celsius"],
    [0,   "celsius",    "kelvin"],
    [300, "kelvin",     "celsius"],
    [-40, "celsius",    "fahrenheit"],  // -40 is same in both!
];
tempTests.forEach(([val, from, to]) => {
    const result = convertUnit(val, from, to, "temperature");
    const fSym   = UNITS.temperature.units[from].symbol;
    const tSym   = UNITS.temperature.units[to].symbol;
    console.log(\`  \${val}\${fSym} = \${format(result, 2)}\${tSym}\`);
});
`,
    },
    expectedOutput: `=== Length Conversions ===
  1 km = 0.621371 mi
  5 km = 16404.199 ft
  100 cm = 39.3701 in
  1 mi = 1.609344 km
  1 ft = 30.48 cm

=== Weight Conversions ===
  1 kg = 2.204624 lb
  1 lb = 453.592 g
  500 g = 17.637 oz

=== Temperature Conversions ===
  0°C = 32.00°F
  100°C = 212.00°F
  32°F = 0.00°C
  0°C = 273.15K
  300K = 26.85°C
  -40°C = -40.00°F`,
  },

  {
    titleEn: "Step 3 — Parsing Input Expressions",
    titleFr: "Étape 3 — Analyser les expressions d'entrée",
    contentEn: `## Step 3 — Parsing Input Expressions

Real unit converters accept natural language expressions like \`"5 km to miles"\` or \`"100°C in fahrenheit"\`. This step adds a parser.

Parsing is the process of converting raw text into structured data. Our parser needs to extract:
- The numeric value (including decimals and negatives)
- The source unit (may be a symbol like "km" or a full name like "kilometer")
- The target unit

\`\`\`
"5 km to miles"        → { value: 5,    from: "km",   to: "miles" }
"100°C in fahrenheit"  → { value: 100,  from: "°C",   to: "fahrenheit" }
"-40 F to celsius"     → { value: -40,  from: "F",    to: "celsius" }
"1.5 pounds to grams"  → { value: 1.5,  from: "pounds", to: "grams" }
\`\`\`

We also build a **symbol/alias lookup** so users can type "km", "kilometer", or "kilometers" and all resolve to the same unit key.`,

    contentFr: `## Étape 3 — Analyser les expressions d'entrée

Notre analyseur doit extraire :
- La valeur numérique
- L'unité source (symbole comme "km" ou nom complet comme "kilometer")
- L'unité cible

\`\`\`
"5 km vers miles"       → { value: 5,    from: "km",   to: "miles" }
"100°C en fahrenheit"   → { value: 100,  from: "°C",   to: "fahrenheit" }
"-40 F vers celsius"    → { value: -40,  from: "F",    to: "celsius" }
\`\`\``,

    starterCode: {
      default: `// Step 3: Expression parser + symbol lookup

const UNITS = {
    length: { base: "meter", units: {
        kilometer:  { label:"Kilometer",  symbol:"km",   factor:1000      },
        meter:      { label:"Meter",      symbol:"m",    factor:1         },
        centimeter: { label:"Centimeter", symbol:"cm",   factor:0.01      },
        foot:       { label:"Foot",       symbol:"ft",   factor:0.3048    },
        inch:       { label:"Inch",       symbol:"in",   factor:0.0254    },
        mile:       { label:"Mile",       symbol:"mi",   factor:1609.344  },
    }},
    weight: { base:"kilogram", units: {
        kilogram: { label:"Kilogram",  symbol:"kg", factor:1         },
        gram:     { label:"Gram",      symbol:"g",  factor:0.001     },
        pound:    { label:"Pound",     symbol:"lb", factor:0.453592  },
        ounce:    { label:"Ounce",     symbol:"oz", factor:0.028349  },
    }},
    temperature: { base:"celsius", units: {
        celsius:    { label:"Celsius",    symbol:"°C" },
        fahrenheit: { label:"Fahrenheit", symbol:"°F" },
        kelvin:     { label:"Kelvin",     symbol:"K"  },
    }},
};

// Build lookup: symbol/alias → { unitKey, category }
function buildLookup(units) {
    const lookup = new Map();

    Object.entries(units).forEach(([category, cat]) => {
        Object.entries(cat.units).forEach(([key, unit]) => {
            const entry = { key, category };

            // Index by: key, symbol (lower), label (lower), label plural
            [
                key,
                unit.symbol.toLowerCase().replace(/°/g, ""),
                unit.symbol.toLowerCase(),
                unit.label.toLowerCase(),
                unit.label.toLowerCase() + "s",  // plural: "feet" exception below
            ].forEach(alias => lookup.set(alias, entry));
        });
    });

    // Common irregular plurals and aliases
    const aliases = {
        "feet": { key: "foot", category: "length" },
        "ft":   { key: "foot", category: "length" },
        "inches": { key: "inch", category: "length" },
        "miles":  { key: "mile", category: "length" },
        "pounds": { key: "pound", category: "weight" },
        "lbs":    { key: "pound", category: "weight" },
        "ounces": { key: "ounce", category: "weight" },
        "oz":     { key: "ounce", category: "weight" },
        "c":      { key: "celsius",    category: "temperature" },
        "f":      { key: "fahrenheit", category: "temperature" },
        "k":      { key: "kelvin",     category: "temperature" },
        "celsius":    { key: "celsius",    category: "temperature" },
        "fahrenheit": { key: "fahrenheit", category: "temperature" },
        "kelvin":     { key: "kelvin",     category: "temperature" },
    };
    Object.entries(aliases).forEach(([alias, entry]) => lookup.set(alias, entry));

    return lookup;
}

const LOOKUP = buildLookup(UNITS);

function resolveUnit(input) {
    return LOOKUP.get(input.toLowerCase().replace(/°/g, "").trim()) ?? null;
}

// Parse "5 km to miles", "100C in F", "-40 fahrenheit to celsius"
function parseExpression(expr) {
    const pattern = /^(-?\d+\.?\d*)\s*([a-zA-Z°\/]+)\s+(?:to|in|into|→)\s+([a-zA-Z°\/\s]+)$/i;
    const match   = expr.trim().match(pattern);

    if (!match) return { ok: false, error: \`Cannot parse: "\${expr}"\` };

    const [, rawValue, rawFrom, rawTo] = match;
    const value = parseFloat(rawValue);

    if (isNaN(value)) return { ok: false, error: \`Invalid number: \${rawValue}\` };

    const from = resolveUnit(rawFrom.trim());
    const to   = resolveUnit(rawTo.trim());

    if (!from) return { ok: false, error: \`Unknown unit: "\${rawFrom}"\` };
    if (!to)   return { ok: false, error: \`Unknown unit: "\${rawTo}"\` };
    if (from.category !== to.category)
        return { ok: false, error: \`Category mismatch: \${from.category} vs \${to.category}\` };

    return { ok: true, value, from, to };
}

// Test parser
const expressions = [
    "5 km to miles",
    "100 C in F",
    "1.5 pounds to grams",
    "32 fahrenheit to celsius",
    "500 oz to kg",
    "bad input here",
    "5 km to pounds",   // category mismatch
];

console.log("=== Expression Parser ===");
expressions.forEach(expr => {
    const result = parseExpression(expr);
    if (result.ok) {
        const { value, from, to } = result;
        console.log(\`  ✓ "\${expr}"\`);
        console.log(\`    → \${value} \${from.key} (\${from.category}) to \${to.key}\`);
    } else {
        console.log(\`  ✗ "\${expr}"\`);
        console.log(\`    → Error: \${result.error}\`);
    }
});
`,
    },
    expectedOutput: `=== Expression Parser ===
  ✓ "5 km to miles"
    → 5 kilometer (length) to mile
  ✓ "100 C in F"
    → 100 celsius (temperature) to fahrenheit
  ✓ "1.5 pounds to grams"
    → 1.5 pound (weight) to gram
  ✓ "32 fahrenheit to celsius"
    → 32 fahrenheit (temperature) to celsius
  ✓ "500 oz to kg"
    → 500 ounce (weight) to kilogram
  ✗ "bad input here"
    → Error: Cannot parse: "bad input here"
  ✗ "5 km to pounds"
    → Error: Category mismatch: length vs weight`,
  },

  {
    titleEn: "Step 4 — Conversion History and Favorites",
    titleFr: "Étape 4 — Historique et favoris",
    contentEn: `## Step 4 — Conversion History and Favorites

A useful converter remembers what you've converted. This step adds:

1. **History** — last N conversions, most recent first
2. **Favorites** — save frequent conversions by name
3. **Statistics** — which categories are used most

The history is a fixed-size sliding window — when it reaches max capacity, the oldest entry is removed. This is implemented with a simple array where we unshift new entries and pop old ones:

\`\`\`javascript
if (history.length >= MAX_HISTORY) history.pop();   // remove oldest
history.unshift(newEntry);                           // add at front (most recent)
\`\`\`

Favorites are stored in a Map with a user-chosen name as the key — allowing instant O(1) lookup of saved conversions.`,

    contentFr: `## Étape 4 — Historique et favoris

1. **Historique** — N dernières conversions, la plus récente en premier
2. **Favoris** — sauvegarder les conversions fréquentes par nom

L'historique est une fenêtre glissante de taille fixe :

\`\`\`javascript
if (historique.length >= MAX_HISTORIQUE) historique.pop();   // retirer le plus ancien
historique.unshift(nouvelleEntree);                           // ajouter en tête
\`\`\``,

    starterCode: {
      default: `// Step 4: History and favorites

const MAX_HISTORY = 10;

// Inline converter (simplified for this step)
function convert(value, fromKey, toKey, category) {
    const factors = {
        length: { kilometer:1000, meter:1, centimeter:0.01, foot:0.3048, inch:0.0254, mile:1609.344 },
        weight: { kilogram:1, gram:0.001, pound:0.453592, ounce:0.028349 },
    };
    if (category === "temperature") {
        let c = fromKey === "celsius" ? value : fromKey === "fahrenheit" ? (value-32)*5/9 : value-273.15;
        return toKey === "celsius" ? c : toKey === "fahrenheit" ? c*9/5+32 : c+273.15;
    }
    return value * factors[category][fromKey] / factors[category][toKey];
}

class ConverterApp {
    #history   = [];        // most recent first
    #favorites = new Map(); // name → {value, from, to, category}
    #stats     = new Map(); // category → count

    doConversion(value, fromKey, toKey, category) {
        const result = convert(value, fromKey, toKey, category);
        const entry  = {
            value, fromKey, toKey, category, result,
            timestamp: new Date().toLocaleTimeString(),
        };

        // Add to history (sliding window)
        if (this.#history.length >= MAX_HISTORY) this.#history.pop();
        this.#history.unshift(entry);

        // Update stats
        this.#stats.set(category, (this.#stats.get(category) ?? 0) + 1);

        return result;
    }

    saveFavorite(name, value, fromKey, toKey, category) {
        this.#favorites.set(name.toLowerCase(), { value, fromKey, toKey, category });
        return \`Saved as "\${name}"\`;
    }

    runFavorite(name) {
        const fav = this.#favorites.get(name.toLowerCase());
        if (!fav) return null;
        return this.doConversion(fav.value, fav.fromKey, fav.toKey, fav.category);
    }

    showHistory(n = 5) {
        const items = this.#history.slice(0, n);
        if (items.length === 0) { console.log("  No history yet."); return; }
        console.log(\`  Last \${items.length} conversions:\`);
        items.forEach((e, i) => {
            const res = parseFloat(e.result.toFixed(4));
            console.log(\`    \${i+1}. \${e.value} \${e.fromKey} → \${res} \${e.toKey} (\${e.timestamp})\`);
        });
    }

    showFavorites() {
        if (this.#favorites.size === 0) { console.log("  No favorites yet."); return; }
        console.log(\`  Favorites (\${this.#favorites.size}):\`);
        this.#favorites.forEach((fav, name) => {
            console.log(\`    "\${name}": \${fav.value} \${fav.fromKey} → \${fav.toKey}\`);
        });
    }

    showStats() {
        if (this.#stats.size === 0) { console.log("  No stats yet."); return; }
        const sorted = [...this.#stats.entries()].sort((a,b) => b[1]-a[1]);
        console.log("  Category usage:");
        sorted.forEach(([cat, count]) => {
            const bar = "█".repeat(count);
            console.log(\`    \${cat.padEnd(12)} \${bar} (\${count})\`);
        });
    }
}

// Demo
const app = new ConverterApp();

// Do some conversions
const convs = [
    [5,   "kilometer", "mile",       "length"],
    [100, "celsius",   "fahrenheit", "temperature"],
    [1,   "kilogram",  "pound",      "weight"],
    [10,  "meter",     "foot",       "length"],
    [72,  "fahrenheit","celsius",    "temperature"],
    [500, "gram",      "ounce",      "weight"],
    [26,  "mile",      "kilometer",  "length"],
];

console.log("=== Performing Conversions ===");
convs.forEach(([v, from, to, cat]) => {
    const result = app.doConversion(v, from, to, cat);
    console.log(\`  \${v} \${from} = \${parseFloat(result.toFixed(4))} \${to}\`);
});

// Save favorites
console.log("\\n=== Saving Favorites ===");
console.log(app.saveFavorite("body temp",   37, "celsius",   "fahrenheit", "temperature"));
console.log(app.saveFavorite("marathon",  42.195, "kilometer", "mile",       "length"));
console.log(app.saveFavorite("stone",        1, "kilogram",  "pound",      "weight"));

// Run favorites
console.log("\\n=== Running Favorites ===");
["body temp", "marathon", "stone"].forEach(name => {
    const result = app.runFavorite(name);
    console.log(\`  "\${name}" → \${parseFloat(result.toFixed(4))}\`);
});

// Show history and stats
console.log("\\n=== History ===");
app.showHistory(5);

console.log("\\n=== Favorites ===");
app.showFavorites();

console.log("\\n=== Statistics ===");
app.showStats();
`,
    },
    expectedOutput: `=== Performing Conversions ===
  5 kilometer = 3.1069 mile
  100 celsius = 212 fahrenheit
  1 kilogram = 2.2046 pound
  10 meter = 32.8084 foot
  72 fahrenheit = 22.2222 celsius
  500 gram = 17.637 ounce
  26 mile = 41.8429 kilometer

=== Saving Favorites ===
  Saved as "body temp"
  Saved as "marathon"
  Saved as "stone"

=== Running Favorites ===
  "body temp" → 98.6
  "marathon" → 26.2188
  "stone" → 2.2046

=== History ===
  Last 5 conversions:
    1. 1 kilogram → 2.2046 pound (...)
    2. 37 celsius → 98.6 fahrenheit (...)
    3. 42.195 kilometer → 26.2188 mile (...)
    4. 26 mile → 41.8429 kilometer (...)
    5. 500 gram → 17.637 ounce (...)

=== Favorites ===
  Favorites (3):
    "body temp": 37 celsius → fahrenheit
    "marathon": 42.195 kilometer → mile
    "stone": 1 kilogram → pound

=== Statistics ===
  Category usage:
    length       ████ (4)
    temperature  ███ (3)
    weight       ███ (3)`,
  },

  {
    titleEn: "Step 5 — Batch Conversion and Comparison",
    titleFr: "Étape 5 — Conversion par lot et comparaison",
    contentEn: `## Step 5 — Batch Conversion and Comparison

Two features that make a converter genuinely useful:

**Batch conversion** — convert one value to all units in a category at once. Type "5 km" and see the equivalent in miles, feet, yards, inches — all simultaneously. This is done by iterating over all units in the category and converting each.

**Comparison** — convert multiple values of the same unit side by side. Useful for comparing options: "Which is bigger, 5 miles or 10 km?"

\`\`\`javascript
// Batch: 5 km in all length units
convertToAll(5, "kilometer", "length")
→ { meter: 5000, centimeter: 500000, foot: 16404, inch: 196850, mile: 3.1 }

// Comparison: which is further?
compare([5, "mile"], [10, "kilometer"], "length")
→ { winner: "5 miles", by: "1.6 km" }
\`\`\``,

    contentFr: `## Étape 5 — Conversion par lot et comparaison

**Conversion par lot** — convertir une valeur vers toutes les unités d'une catégorie à la fois.

**Comparaison** — convertir plusieurs valeurs de la même unité côte à côte.

\`\`\`javascript
// Par lot : 5 km dans toutes les unités de longueur
convertirVersToutes(5, "kilometer", "length")
→ { meter: 5000, centimeter: 500000, foot: 16404, ... }
\`\`\``,

    starterCode: {
      default: `// Step 5: Batch conversion and comparison

const UNITS = {
    length: { base:"meter", units: {
        kilometer:  { label:"Kilometer",  symbol:"km", factor:1000     },
        meter:      { label:"Meter",      symbol:"m",  factor:1        },
        centimeter: { label:"Centimeter", symbol:"cm", factor:0.01     },
        millimeter: { label:"Millimeter", symbol:"mm", factor:0.001    },
        foot:       { label:"Foot",       symbol:"ft", factor:0.3048   },
        inch:       { label:"Inch",       symbol:"in", factor:0.0254   },
        mile:       { label:"Mile",       symbol:"mi", factor:1609.344 },
        yard:       { label:"Yard",       symbol:"yd", factor:0.9144   },
    }},
    weight: { base:"kilogram", units: {
        tonne:    { label:"Tonne",    symbol:"t",  factor:1000     },
        kilogram: { label:"Kilogram", symbol:"kg", factor:1        },
        gram:     { label:"Gram",     symbol:"g",  factor:0.001    },
        pound:    { label:"Pound",    symbol:"lb", factor:0.453592 },
        ounce:    { label:"Ounce",    symbol:"oz", factor:0.028349 },
    }},
    temperature: { base:"celsius", units: {
        celsius:    { label:"Celsius",    symbol:"°C" },
        fahrenheit: { label:"Fahrenheit", symbol:"°F" },
        kelvin:     { label:"Kelvin",     symbol:"K"  },
    }},
};

function convertValue(value, fromKey, toKey, category) {
    if (category === "temperature") {
        let c = fromKey === "celsius" ? value : fromKey === "fahrenheit" ? (value-32)*5/9 : value-273.15;
        return toKey === "celsius" ? c : toKey === "fahrenheit" ? c*9/5+32 : c+273.15;
    }
    const cat = UNITS[category];
    return value * cat.units[fromKey].factor / cat.units[toKey].factor;
}

// Convert one value to ALL units in the category
function convertToAll(value, fromKey, category) {
    const cat = UNITS[category];
    const results = {};

    Object.entries(cat.units).forEach(([key, unit]) => {
        if (key === fromKey) {
            results[key] = { value, label: unit.label, symbol: unit.symbol, isSource: true };
        } else {
            const converted = convertValue(value, fromKey, key, category);
            results[key] = { value: converted, label: unit.label, symbol: unit.symbol, isSource: false };
        }
    });

    return results;
}

// Compare multiple values side by side (convert all to base unit)
function compareValues(items, category) {
    // items = [{value, unit, label}]
    const withBase = items.map(item => ({
        ...item,
        inBase: category === "temperature"
            ? convertValue(item.value, item.unit, "celsius", "temperature")
            : convertValue(item.value, item.unit, UNITS[category].base, category),
    }));

    const sorted  = [...withBase].sort((a, b) => b.inBase - a.inBase);
    const largest = sorted[0];
    const smallest = sorted[sorted.length - 1];

    return { sorted, largest, smallest };
}

// Display batch conversion nicely
function displayBatch(value, fromKey, category) {
    const results = convertToAll(value, fromKey, category);
    const fromUnit = UNITS[category].units[fromKey];

    console.log(\`  \${value} \${fromUnit.symbol} (\${fromUnit.label}):\`);
    Object.values(results).forEach(r => {
        const formatted = parseFloat(r.value.toFixed(4));
        const marker    = r.isSource ? " ← (source)" : "";
        console.log(\`    \${r.symbol.padEnd(5)} \${formatted.toString().padStart(15)}\${marker}\`);
    });
}

// ─── Batch Conversions ────────────────────────────────────
console.log("=== 1 Mile in All Length Units ===");
displayBatch(1, "mile", "length");

console.log("\\n=== 1 Kilogram in All Weight Units ===");
displayBatch(1, "kilogram", "weight");

console.log("\\n=== 100°C in All Temperature Units ===");
const tempResults = convertToAll(100, "celsius", "temperature");
Object.values(tempResults).forEach(r => {
    const val = parseFloat(r.value.toFixed(2));
    console.log(\`  \${r.symbol}: \${val}\`);
});

// ─── Comparison ───────────────────────────────────────────
console.log("\\n=== Distance Comparison ===");
const distances = [
    { value: 5,    unit: "mile",       label: "5 miles"     },
    { value: 10,   unit: "kilometer",  label: "10 km"       },
    { value: 8000, unit: "meter",      label: "8000 meters" },
    { value: 15,   unit: "kilometer",  label: "15 km"       },
];

const { sorted } = compareValues(distances, "length");
sorted.forEach((item, i) => {
    const km = parseFloat((item.inBase / 1000).toFixed(3));
    console.log(\`  \${i+1}. \${item.label.padEnd(15)} = \${km} km\`);
});

console.log("\\n=== Weight Comparison ===");
const weights = [
    { value: 2,   unit: "pound",    label: "2 lbs" },
    { value: 1,   unit: "kilogram", label: "1 kg" },
    { value: 500, unit: "gram",     label: "500g" },
    { value: 32,  unit: "ounce",    label: "32 oz" },
];
const { sorted: wSorted } = compareValues(weights, "weight");
wSorted.forEach((item, i) => {
    const g = parseFloat((item.inBase * 1000).toFixed(1));
    console.log(\`  \${i+1}. \${item.label.padEnd(12)} = \${g} g\`);
});
`,
    },
    expectedOutput: `=== 1 Mile in All Length Units ===
  1 mi (Mile):
    km          1.6093
    m        1609.344 ← (source mapped)
    cm      160934.4
    mm     1609344
    ft        5280
    in       63360
    mi            1 ← (source)
    yd         1760

=== 1 Kilogram in All Weight Units ===
  1 kg (Kilogram):
    t          0.001
    kg             1 ← (source)
    g           1000
    lb        2.2046
    oz       35.274

=== 100°C in All Temperature Units ===
  °C: 100
  °F: 212
  K: 373.15

=== Distance Comparison ===
  1. 15 km          = 15 km
  2. 10 km          = 10 km
  3. 8000 meters    = 8 km
  4. 5 miles        = 8.047 km

=== Weight Comparison ===
  1. 32 oz          = 907.2 g
  2. 2 lbs          = 907.2 g
  3. 1 kg           = 1000 g
  4. 500g           = 500 g`,
  },

  {
    titleEn: "Step 6 — The Complete Converter Class",
    titleFr: "Étape 6 — La classe Converter complète",
    contentEn: `## Step 6 — The Complete Converter Class

This final step assembles everything into a clean \`UnitConverter\` class — a complete, production-quality converter.

The class brings together:
- The full unit database (length, weight, temperature, speed, area, volume)
- Expression parsing ("5 km to miles")
- Batch conversion (one value to all units)
- History (last 20 conversions)
- Favorites (saved named conversions)
- Smart formatting (adaptive decimal places)

**Smart formatting** is worth highlighting. A naive \`toFixed(4)\` gives:
- \`0.0001\` for very small values (loses precision)
- \`100000.0000\` for large values (unnecessary decimals)

Instead we use \`toPrecision\` to show a fixed number of significant figures, giving clean output at any scale.`,

    contentFr: `## Étape 6 — La classe Converter complète

Cette étape assemble tout en une classe \`UnitConverter\` propre.

Le **formatage intelligent** est particulièrement intéressant. Un simple \`toFixed(4)\` donne des résultats laids pour les très petites ou très grandes valeurs. À la place, nous utilisons \`toPrecision\` pour afficher un nombre fixe de chiffres significatifs.`,

    starterCode: {
      default: `// Step 6: Complete UnitConverter class

class UnitConverter {
    static #UNITS = {
        length: { label:"Length", base:"meter", units: {
            kilometer:  { label:"Kilometer",  symbol:"km",  factor:1000,        aliases:["km","kilometers","kilometre","kilomètres"] },
            meter:      { label:"Meter",      symbol:"m",   factor:1,           aliases:["m","meters","metre","mètres"] },
            centimeter: { label:"Centimeter", symbol:"cm",  factor:0.01,        aliases:["cm","centimeters","centimetre"] },
            millimeter: { label:"Millimeter", symbol:"mm",  factor:0.001,       aliases:["mm","millimeters"] },
            mile:       { label:"Mile",       symbol:"mi",  factor:1609.344,    aliases:["mi","miles","mile"] },
            yard:       { label:"Yard",       symbol:"yd",  factor:0.9144,      aliases:["yd","yards","yard"] },
            foot:       { label:"Foot",       symbol:"ft",  factor:0.3048,      aliases:["ft","feet","foot"] },
            inch:       { label:"Inch",       symbol:"in",  factor:0.0254,      aliases:["in","inches","inch"] },
        }},
        weight: { label:"Weight", base:"kilogram", units: {
            tonne:    { label:"Tonne",    symbol:"t",  factor:1000,     aliases:["t","tonnes","tonne"] },
            kilogram: { label:"Kilogram", symbol:"kg", factor:1,        aliases:["kg","kilograms","kilogram"] },
            gram:     { label:"Gram",     symbol:"g",  factor:0.001,    aliases:["g","grams","gram"] },
            pound:    { label:"Pound",    symbol:"lb", factor:0.453592, aliases:["lb","lbs","pounds","pound"] },
            ounce:    { label:"Ounce",    symbol:"oz", factor:0.028349, aliases:["oz","ounces","ounce"] },
        }},
        temperature: { label:"Temperature", base:"celsius", units: {
            celsius:    { label:"Celsius",    symbol:"°C", aliases:["c","celsius","°c","cel"] },
            fahrenheit: { label:"Fahrenheit", symbol:"°F", aliases:["f","fahrenheit","°f","fahr"] },
            kelvin:     { label:"Kelvin",     symbol:"K",  aliases:["k","kelvin"] },
        }},
        speed: { label:"Speed", base:"mps", units: {
            mps:  { label:"m/s",  symbol:"m/s",  factor:1,        aliases:["mps","m/s","ms"] },
            kph:  { label:"km/h", symbol:"km/h", factor:1/3.6,    aliases:["kph","kmh","km/h"] },
            mph:  { label:"mph",  symbol:"mph",  factor:0.44704,  aliases:["mph"] },
            knot: { label:"knot", symbol:"kn",   factor:0.514444, aliases:["kn","knot","knots"] },
        }},
    };

    #history   = [];
    #favorites = new Map();
    #lookup;

    constructor() {
        this.#buildLookup();
    }

    #buildLookup() {
        this.#lookup = new Map();
        Object.entries(UnitConverter.#UNITS).forEach(([category, cat]) => {
            Object.entries(cat.units).forEach(([key, unit]) => {
                const entry = { key, category };
                (unit.aliases ?? [key]).forEach(a =>
                    this.#lookup.set(a.toLowerCase().replace(/°/g,""), entry)
                );
            });
        });
    }

    #resolveUnit(input) {
        return this.#lookup.get(input.toLowerCase().replace(/°/g,"").trim()) ?? null;
    }

    #convertRaw(value, fromKey, toKey, category) {
        if (category === "temperature") {
            let c = fromKey==="celsius" ? value : fromKey==="fahrenheit" ? (value-32)*5/9 : value-273.15;
            return toKey==="celsius" ? c : toKey==="fahrenheit" ? c*9/5+32 : c+273.15;
        }
        const units = UnitConverter.#UNITS[category].units;
        return value * units[fromKey].factor / units[toKey].factor;
    }

    #format(value) {
        if (value === 0) return "0";
        const abs = Math.abs(value);
        if (abs >= 1000 || abs < 0.001) return parseFloat(value.toPrecision(6)).toString();
        return parseFloat(value.toFixed(6)).toString();
    }

    // ── Public API ────────────────────────────────────────
    convert(value, fromInput, toInput) {
        const from = this.#resolveUnit(fromInput);
        const to   = this.#resolveUnit(toInput);
        if (!from) return { ok:false, error:\`Unknown unit: "\${fromInput}"\` };
        if (!to)   return { ok:false, error:\`Unknown unit: "\${toInput}"\` };
        if (from.category !== to.category)
            return { ok:false, error:\`Category mismatch: \${from.category} ≠ \${to.category}\` };

        const result   = this.#convertRaw(value, from.key, to.key, from.category);
        const fromUnit = UnitConverter.#UNITS[from.category].units[from.key];
        const toUnit   = UnitConverter.#UNITS[to.category].units[to.key];
        const entry    = { value, fromKey:from.key, toKey:to.key,
                           fromSym:fromUnit.symbol, toSym:toUnit.symbol,
                           category:from.category, result,
                           formatted:\`\${value} \${fromUnit.symbol} = \${this.#format(result)} \${toUnit.symbol}\` };

        if (this.#history.length >= 20) this.#history.pop();
        this.#history.unshift(entry);
        return { ok:true, result, formatted:entry.formatted };
    }

    parse(expr) {
        const m = expr.trim().match(/^(-?\\d+\\.?\\d*)\\s*([a-zA-Z\\/°]+)\\s+(?:to|in|into|→)\\s+(.+)$/i);
        if (!m) return { ok:false, error:\`Cannot parse: "\${expr}"\` };
        const value = parseFloat(m[1]);
        if (isNaN(value)) return { ok:false, error:"Invalid number" };
        return this.convert(value, m[2].trim(), m[3].trim());
    }

    toAll(value, fromInput) {
        const from = this.#resolveUnit(fromInput);
        if (!from) return null;
        const cat = UnitConverter.#UNITS[from.category];
        return Object.entries(cat.units).map(([key, unit]) => ({
            key, label:unit.label, symbol:unit.symbol,
            value: this.#convertRaw(value, from.key, key, from.category),
            isSource: key === from.key,
        }));
    }

    saveFavorite(name, value, fromInput, toInput) {
        const from = this.#resolveUnit(fromInput);
        const to   = this.#resolveUnit(toInput);
        if (!from || !to) return false;
        this.#favorites.set(name.toLowerCase(), { value, fromKey:from.key, toKey:to.key, category:from.category });
        return true;
    }

    runFavorite(name) {
        const fav = this.#favorites.get(name.toLowerCase());
        if (!fav) return null;
        return this.convert(fav.value, fav.fromKey, fav.toKey);
    }

    get history()   { return [...this.#history]; }
    get favorites() { return [...this.#favorites.entries()]; }
    get categories(){ return Object.keys(UnitConverter.#UNITS); }
}

// ── Full demo ─────────────────────────────────────────────
const converter = new UnitConverter();

console.log("=== Direct Conversions ===");
[
    [100,  "celsius",    "fahrenheit"],
    [1,    "mile",       "km"],
    [70,   "kg",         "lbs"],
    [100,  "mph",        "kph"],
    [1000, "meters",     "feet"],
].forEach(([v, f, t]) => {
    const { formatted, ok, error } = converter.convert(v, f, t);
    console.log(\`  \${ok ? "✓" : "✗"} \${ok ? formatted : error}\`);
});

console.log("\\n=== Expression Parsing ===");
[
    "5 km to miles",
    "37 celsius in fahrenheit",
    "150 lbs to kg",
    "60 mph to kph",
    "bad expression",
].forEach(expr => {
    const { formatted, ok, error } = converter.parse(expr);
    console.log(\`  \${ok ? "✓" : "✗"} "\${expr}" → \${ok ? formatted : error}\`);
});

console.log("\\n=== Batch: 1 kg in all weight units ===");
converter.toAll(1, "kg").forEach(({ label, symbol, value, isSource }) => {
    const mark = isSource ? " ←" : "";
    console.log(\`  \${label.padEnd(12)} \${symbol.padEnd(5)} \${parseFloat(value.toPrecision(6))}\${mark}\`);
});

console.log("\\n=== Favorites ===");
converter.saveFavorite("body temp", 37, "celsius", "fahrenheit");
converter.saveFavorite("marathon",  42.195, "km", "miles");
converter.saveFavorite("stone",     1, "kg", "lbs");

["body temp", "marathon", "stone"].forEach(name => {
    const { formatted } = converter.runFavorite(name);
    console.log(\`  "\${name}": \${formatted}\`);
});

console.log("\\n=== History (last 5) ===");
converter.history.slice(0, 5).forEach((e, i) => {
    console.log(\`  \${i+1}. \${e.formatted}\`);
});
`,
    },
    expectedOutput: `=== Direct Conversions ===
  ✓ 100 °C = 212 °F
  ✓ 1 mi = 1.60934 km
  ✓ 70 kg = 154.324 lb
  ✓ 100 mph = 160.934 km/h
  ✓ 1000 m = 3280.84 ft

=== Expression Parsing ===
  ✓ "5 km to miles" → 5 km = 3.10686 mi
  ✓ "37 celsius in fahrenheit" → 37 °C = 98.6 °F
  ✓ "150 lbs to kg" → 150 lb = 68.0389 kg
  ✓ "60 mph to kph" → 60 mph = 96.5606 km/h
  ✗ "bad expression" → Cannot parse: "bad expression"

=== Batch: 1 kg in all weight units ===
  Tonne        t      0.001
  Kilogram     kg     1 ←
  Gram         g      1000
  Pound        lb     2.20462
  Ounce        oz     35.274

=== Favorites ===
  "body temp": 37 °C = 98.6 °F
  "marathon": 42.195 km = 26.2188 mi
  "stone": 1 kg = 2.20462 lb

=== History (last 5) ===
  1. 1 kg = 2.20462 lb
  2. 42.195 km = 26.2188 mi
  3. 37 °C = 98.6 °F
  4. 60 mph = 96.5606 km/h
  5. 150 lb = 68.0389 kg`,
  },
];
