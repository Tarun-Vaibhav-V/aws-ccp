# AWS CCP Academy

A free, neo-brutalist learning + mock-exam platform for the **AWS Certified Cloud Practitioner (CLF-C02)** exam. Built for the community — no login, no paywall.

- **12 learning modules** following the official AWS Cloud Practitioner Essentials curriculum
- **23 mock exams / 1,142 questions** with instant explanations and AWS doc links
- **Quiz engine** — practice mode (instant feedback) + timed exam mode (90 min, scored)
- **Mixed exam** (random 50 from the whole bank) and **Retry my mistakes** (spaced repetition)
- **Progress tracking** via browser localStorage (attempts, scores, streak, completed modules)
- Dark mode · fully responsive · AWS black/orange/purple theme

## Run locally

```bash
cd app
npm install
npm run dev      # http://localhost:5173  (auto-parses exams first)
```

## Build & deploy

```bash
npm run build    # outputs static site to app/dist
```

`dist/` is a static bundle — deploy anywhere:

- **Netlify** — connect the repo, base directory `app` (config in `netlify.toml`).
- **Vercel** — import repo, root `app`, framework "Vite".
- **GitHub Pages** — build with the repo name as base path:
  ```bash
  BASE_PATH="/<repo-name>/" npm run build
  ```
  then publish `app/dist`. Routing uses `HashRouter`, so no server rewrites are needed.

## Adding more exams (no code changes)

1. Drop a new `practice-exam-<N>.md` into `../quiz/practice-exam/` using either supported format:
   - Question, `- A.`/`- B.` options, then a `<details>` block containing `Correct Answer: B` (and optionally `Explanation: <url>`).
2. Run `npm run build:exams` (also runs automatically on `dev`/`build`).

The parser (`scripts/parse-exams.mjs`) normalizes both formats to JSON in `src/data/exams/`, and the app auto-discovers every exam file via `import.meta.glob` — it shows up in the UI with zero code changes.

## Project layout

```
app/
├─ scripts/parse-exams.mjs   # md -> JSON exam parser (the "add exams" engine)
├─ src/
│  ├─ data/exams/*.json       # auto-generated, auto-discovered
│  ├─ data/modules.js         # learning module content
│  ├─ lib/exams.js            # exam loader + mixed/retry builders
│  ├─ lib/storage.js          # localStorage progress
│  ├─ pages/                  # Dashboard, Modules, ModulePage, Exams, Quiz
│  └─ styles/brutalism.css    # neo-brutalism × AWS theme
└─ public/aws-logo.jpg
```
