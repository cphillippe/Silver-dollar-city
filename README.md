# Silver City: Unending Evidence

A progressive web app — playable in the browser — that walks the case for God as a mountain-town adventure. You move through themed districts, finish challenges, and fill an Evidence Journal. The trail always names a next step.

The product goal is **keeping the evidence**: claims, reasons, and sources you can still say after the page folds. Puzzles, streaks, and polish are the delivery system — the game has to be fun enough to play, or nothing is retained.

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

Installable as a PWA (Add to Home Screen) after a production build, or as an Android debug APK (below).

## Android debug APK

**Direct download (debug, sideload):**  
https://github.com/cphillippe/Silver-dollar-city/raw/cursor/silver-city-unending-evidence-8233/releases/silver_city_debug.apk

Same file in the repo: [`releases/silver_city_debug.apk`](https://github.com/cphillippe/Silver-dollar-city/blob/cursor/silver-city-unending-evidence-8233/releases/silver_city_debug.apk)

App id: `city.silver.unending` · name: **Silver City**. This is a **debug** build for testing, not a Play Store release.

**Install on a phone**

1. Open the download link on the phone (or copy the APK over USB/Drive).
2. Settings → Security → allow **Install unknown apps** for Chrome/Files.
3. Open the APK and tap Install.

Rebuild locally (needs Android SDK + JDK 17+, `ANDROID_HOME` or `ANDROID_SDK_ROOT`):

```bash
npm install
npm run android:apk
```

Gradle writes `android/app/build/outputs/apk/debug/app-debug.apk`. Copy it to `releases/silver_city_debug.apk` if you want the committed download file updated.

## How it works

1. **Today’s Trail** — one short puzzle each local calendar day (seeded by date, so the same day is the same walk). Completing it marks a gentle streak and unlocks trail notes in the journal. Miss a day and **the trail waits** — marks you already made stay. After a solve you see a locked **tomorrow teaser**.
2. **Recall Loop** — after the snap, the teaching folds. You rebuild **one claim + one reason** with the same card-snap feel. Two misses and the line is spoken, then you walk on. Held lines are the real score.
3. **Spaced re-ask** — a later morning may stir an older page. Same snap, no lecture.
4. **Map** — five districts on one trail. Completing a district unbars the next. Finished districts stay playable; stars record your best clear (3 = no miss, no peek).
5. **Puzzles** — order chains, snap-pairs, keep-or-toss bins, and build-the-argument.
6. **Evidence Journal** — unsealed vs sealed, % complete, mystery slots from Daily Trail. Open pages start face-down so the journal is a recall surface, not only a trophy case.
7. **What’s next** — a persistent goal bar. **Held** counts lines you rebuilt from memory.

## Daily Trail and streaks

- Timezone: the device’s local calendar (`YYYY-MM-DD`).
- Pick: `hash("silver-city-trail:" + date) % pool` over `src/content/daily.ts`.
- Streak: consecutive local days with a completed trail. A gap starts a new count (`The trail waited. Welcome back.`) without deleting journal cards, stars, or held lines.
- Trail notes unseal after 1, 2, 3, 5, and 7 **distinct** mornings (replaying today does not count twice).
- Stars on a daily walk use the same clean-solve rules as districts.

## Friend preview (no install)

Open the web app (dev or preview URL) and tap **Share a morning**. The pitch is not a high score. It asks a friend to try the walk, fold the page, and see what they can still say.

```bash
npm run dev          # local
npm run build && npm run preview
```

Playtest notes live in [`PLAYTEST.md`](PLAYTEST.md).

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

React 19, TypeScript, Vite, `vite-plugin-pwa`, Capacitor Android. No backend.
