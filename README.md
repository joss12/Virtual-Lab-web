<div align="center">

# vlab_

**See inside the machine.**

A virtual computer lab — interactive 3D hardware, guided coding projects that run in your browser, and study tracks from silicon to SQL.

[Live demo](#) · [Built by eddymouity.dev](https://eddymouity.dev)

<!-- Screenshot: drop a capture of the landing page here -->
<!-- ![vlab landing page](docs/screenshot-landing.png) -->

</div>

---

## What is vlab?

vlab teaches how computers actually work — no degree needed. Every PC component is explained with interactive 3D models and real-time data flow visualization, then reinforced with quizzes, guided projects, and a leaderboard to keep you honest.

**Core areas:**

- 🔩 **Study** — deep guides for 10 components, keyboard to GPU
- 🖥️ **3D Lab** — an interactive motherboard with live data flow and power visualization
- 🧠 **OS & Databases** — how software meets the hardware
- 💻 **Learn** — Python, JavaScript, and SQL tracks with an in-browser code runner (no install, no server round-trip)
- 🛠️ **Guided projects** — step-by-step builds with starter code and expected output
- ❓ **Quiz, Glossary, Specs, Benchmarks, Fix** — test, look up, compare, troubleshoot
- 🏆 **Leaderboard & progress tracking** — synced to your account

## How the in-browser code runner works

Code executes entirely client-side — nothing is sent to a server:

| Language   | Engine                                   |
| ---------- | ---------------------------------------- |
| Python     | [Pyodide](https://pyodide.org) (WebAssembly CPython) |
| JavaScript | Sandboxed `Function` with captured console |
| SQL        | [sql.js](https://sql.js.org) (SQLite compiled to WASM) |

Engines are lazy-loaded from CDN only when a lesson needs them.

## Tech stack

- **Framework:** Next.js 16 (App Router, Turbopack)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **i18n:** next-intl — full English 🇬🇧 / French 🇫🇷 support
- **State:** Zustand
- **Content:** Markdown lessons rendered with react-markdown + remark-gfm
- **Auth & data:** JWT auth against a separate REST API (deployed on Render)

## Getting started

```bash
# 1. Clone
git clone https://github.com/joss12/vlab-web.git
cd vlab-web

# 2. Install
pnpm install

# 3. Configure environment
cp .env.example .env.local
# then set NEXT_PUBLIC_API_URL to your backend URL

# 4. Run
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) — you'll be redirected to your locale (`/en` or `/fr`).

### Production build

```bash
pnpm build
pnpm start
```

## Project structure

```
src/
├── app/[locale]/        # localized routes (study, lab, quiz, learn, ...)
│   └── learn/[language]/  # lesson tracks + guided projects
├── components/          # UI (layout, lab, ...)
├── content/             # lesson & project content
├── i18n/                # next-intl request config
├── lib/                 # API client, helpers
├── messages/            # en.json / fr.json translations
├── store/               # Zustand stores
└── types/               # shared global type declarations
```

## Roadmap

- [ ] More guided projects per language track
- [ ] Additional locales
- [ ] Expanded 3D lab scenarios

---

<div align="center">

Built with ☕ by [Eddy](https://eddymouity.dev) · © 2026 vlab

</div>
