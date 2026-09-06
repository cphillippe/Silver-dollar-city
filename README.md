# Silver City: Unending Evidence

A progressive web app — playable in the browser — that walks the case for God as a mountain-town adventure. You move through themed districts, finish challenges, and fill an Evidence Journal. The trail always names a next step.

The world is **Silver City**, named for this repository. The through-line is unending evidence: biblical narrative, eyewitness testimony, empirical clues, classical cosmological arguments, and later questions of mind, morality, meaning, and beauty.

The tone is respectful. Arguments are framed as claims with sources and limits — not slogans, and not mockery of doubt.

## Play

```bash
npm install
npm run dev
```

Then open the local URL Vite prints (usually `http://localhost:5173`).

Production build:

```bash
npm run build
npm run preview
```

Progress is stored in `localStorage` on this device (`silver-city-progress-v1`). Use **Reset** in the top bar to start over.

Installable as a PWA (Add to Home Screen) after a production build or when the service worker is registered.

## How it works

1. **Map** — five districts on one trail. Completing a district unbars the next.
2. **Area intro** — a short narrative, then a series of challenges.
3. **Challenges** — sequencing, multiple choice with teaching on every option, match-the-claims, “build the argument,” and short historical/philosophical scenarios.
4. **Evidence Journal** — each win unseals a card with sources.
5. **What’s next** — a persistent goal bar after you leave the welcome screen.

## Districts

| District | Pillar |
| --- | --- |
| Parable Hollow | Biblical narrative and lessons |
| The Witness Bench | Gospels, the 1 Corinthians 15 creed, historical method |
| The Observatory | Fine-tuning, “why something rather than nothing,” origin of life (carefully framed) |
| The First Gate | First mover, contingency, kalām — and what those arguments do *not* yet prove |
| The High Lookout | Morality, consciousness, meaning, beauty |

## Extending

Content lives in `src/content/`. The play engine reads typed modules; add an area, register it in `src/content/index.ts`, and attach journal cards in `src/content/journal.ts`. See `src/content/README.md`.

## Stack

React 19, TypeScript, Vite, `vite-plugin-pwa`. No backend.
