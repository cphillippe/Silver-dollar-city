# Silver City: Unending Evidence

A progressive web app — playable in the browser — that walks the case for God as a mountain-town adventure. You move through themed districts, finish challenges, and fill an Evidence Journal. The trail always names a next step.

The product goal is **keeping the evidence**: claims, reasons, and sources you can still say after the page folds. Puzzles, streaks, polish, and a small Christian cast are the delivery system — the game has to be fun enough to play, or nothing is retained.

## Play now (no install)

**Open this in normal Chrome — live preview of this branch:**  
https://gzip-affect-oregon-tyler.trycloudflare.com/

That URL is a **new** Cloudflare origin in front of `vite preview` (HTTP 200). Skip older tunnels. Skip StackBlitz.

**GitHub Pages (one click, then it stays pretty):**  
https://cphillippe.github.io/Silver-dollar-city/

Repo owner: **Settings → Pages → Deploy from a branch** → `cursor/silver-city-unending-evidence-8233` → `/docs` → Save. The site is already in [`docs/`](docs/). Or set Source to **GitHub Actions** (workflow is on this branch).

## The story

**River** arrives in Silver City with a folded letter: the evidence is a trail, not a shout. **Juniper** lights the east porch each morning (Today’s Trail). Five Christians already live on the longer trail and walk with you — they will not lock you in a pew:

| Guide | District | Role |
| --- | --- | --- |
| Mercy Wren | Parable Hollow | Parable-teller |
| Silas Page | The Witness Bench | Witness clerk |
| Nora Vale | The Observatory | Observatory keeper |
| Ansel Gate | The First Gate | Gatekeeper |
| Hope Lind | The High Lookout | Lookout |

Portraits are original SVGs in one circular style (`src/components/Avatar.tsx`). Light dialogue, not sermons.

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

1. **Today’s Trail** — one short puzzle each local calendar day. If a page is **due for recall**, Juniper dusts that one off instead of only serving something new. Completing the walk marks a gentle streak and can unseal trail notes. Miss a day and **the trail waits** — marks you already made stay. After a solve you see a locked **tomorrow teaser**.
2. **Recall Loop** — after the snap, the teaching folds. You rebuild **one claim + one reason** (retrieval practice). Two misses and the line is spoken, then you walk on. A peek marks the attempt as helped. Held lines are the real score.
3. **Spacing** — each locked line stores `nextReviewAt` in `localStorage`. Clean recalls expand the gap (~1, then 3, then 7, then 21 local days). A miss or peek brings it back tomorrow, warmly: *Time to dust off this one.* The morning queue **interleaves districts** so you don’t drill one pillar in a block.
4. **Say it back** — optional, skippable once: pick the load-bearing premise, and (if you want) one local sentence in your own words. That teach-back is how a line reaches 3★.
5. **Map** — five districts on one trail. Completing a district unbars the next. Finished districts stay playable. Stars are **mastery**, not a no-miss trophy: 1★ first walk, 2★ held after a rest, 3★ held after a rest and said back (or a second clean recall later).
6. **Puzzles** — order chains, snap-pairs, keep-or-toss bins, and build-the-argument. Misses shake and retry before a fuller hint.
7. **Evidence Journal** — unsealed vs sealed, % complete, mystery slots from Daily Trail, **due-for-recall** pages, and landmark marks (visual + verbal cues). Open pages start face-down.
8. **What’s next** — a persistent goal bar. **Held** counts lines you rebuilt from memory. **Due** counts pages waiting to be dusted off.

## Recall Loop / spacing (for the player)

The science stays inside the game — not a flashcard deck.

- After you solve, the long page folds. You snap the claim, then the reason, the way you snapped the puzzle.
- Forgetting is expected. When a line has rested, Today’s Trail often **resurfaces that same walk** instead of only a brand-new puzzle. Copy stays warm: the trail brings it back because memory needs the practice, not because you failed.
- Gaps grow after a clean recall: **about 1 day, then 3, 7, then 21**. Peeking or missing keeps the line close (back tomorrow) without deleting stars you already earned.
- Journal cards show the landmark for that district and whether a page is due this morning. Dual cues: a picture of the place plus the sentence.
- Optional “say it back” (load-bearing premise + a private sentence) is skippable so it doesn’t kill pace. Doing it is how mastery reaches three stars.

Progress shape (same key `silver-city-progress-v1`): `memory[id].nextReviewAt`, `intervalIndex`, `elaborated`, plus `stars` 1–3.

## Daily Trail and streaks

- Timezone: the device’s local calendar (`YYYY-MM-DD`).
- New-content pick (when nothing is due): `hash("silver-city-trail:" + date) % pool` over `src/content/daily.ts`.
- Due pick (when something has rested): mix pillars, prefer a different district than last time (`src/lib/memory.ts`).
- Streak: consecutive local days with a completed trail. A gap starts a new count (`The trail waited. Welcome back.`) without deleting journal cards, stars, held lines, or the recall schedule.
- Trail notes unseal after 1, 2, 3, 5, and 7 **distinct** mornings (replaying today does not count twice).
- Stars follow mastery (encode → spaced recall → teach-back), not a same-session no-miss badge.

## Friend preview (no install)

**Play now (Chrome, new origin):** https://really-survey-consortium-modified.trycloudflare.com/

**After Pages is enabled:** https://cphillippe.github.io/Silver-dollar-city/

On the web app, tap **Share a morning**. The pitch is not a high score. It asks a friend to try the walk, fold the page, and see what they can still say.

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
