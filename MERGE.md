# ready-easy-fun-clear-191 — 1.4.191 Easy Story Creek ≤720 fill purple void

**PR:** (pending push)
**Branch:** `ship/easy-fun-clear-191` → `main`
**Version:** 1.4.191
**Peel:** (pending commit)
**Tip:** (pending)
**Base live:** 1.4.190 (`a89b482`, PR #247 Easy Hold ≤720 fill purple void on main)
**CoS merges — do NOT merge from this hop.** Manager pings CoS only when mergeable.

## Shot wake
**Shot pack incoming separately — stay on invent.** Do NOT wake Shot from this hop. CoS wakes Shot after 190 (already live); this hop does not ping Shot.

## How picked
Open Issues: **#161** Dig/Hard/NW/Town parked. **#160** cheap-hop infra. No open Easy Fun/Clear issue.
1.4.190 Easy Hold fill live on main. Invent Fun/Clear — densest remaining Easy trail different from recent Hold/Father/Link/Build/Samaritan/Match/LockIn/Sort/Snap/Creed: **Easy Story Creek (Samaritan road maze)** had HUD peel **1.4.175** / compress **1.4.153** only — capped 5/7 `maze-board` + centered stage hug the top so the gold card leaves empty purple under the board (Match 184 / Hold 190 fill family).

## Chosen climb
Single Easy Fun/Clear polish: **Easy Story Creek ≤720 fill purple void** — grow `play.is-road-maze` shell + stretch `maze-stage` / `maze-board` so beats · board fill the portrait.

## What fixed
- `src/styles/maze.css`: `@media (max-height: 720px)` — `.play.is-road-maze` `flex: 1 1 auto`; `.maze-stage` `flex: 1` + `align-items: stretch`; `.maze-board` `flex: 1` + `height: 100%` + `max-height: none` + `aspect-ratio: auto`; beats / score / CTA stay `flex: 0`
- `src/components/challenges/RoadMazePlay.tsx`: thin 1.4.191 comment
- Android `versionName` left at **1.4.113**
- Version **1.4.191** atop live **1.4.190**

## Deferred (do NOT climb this hop)
- Dig Reveal / Hard / NW / Town / stores / Pack B / Home map candy
- Match 184 / Lock In win-end 185 / Samaritan Sequence 186 / Sort 183 / Snap 182 / Creed 181 / Build Argument 187 / Link 188 / Father Dash 189 / Hold 190 / Manage 180 / letterbox (already on main)
- Journal held clear chrome further peel
- Story Creek HUD peel 1.4.175 / compress 1.4.153 (different surface; still applies ≤720)

## Gemini
MODEL=gemini-flash-latest — Invent Fun/Clear (no open Easy Fun/Clear issue). Invent API key present but not AIza AI Studio shape. Manager-steered invent. Notes: `notes-gemini.txt` (+ `/workspace/silver-city-art/notes-gemini-191.txt`).

## Files peeled
- `src/styles/maze.css`
- `src/components/challenges/RoadMazePlay.tsx`
- `scripts/check-city.mjs`, `scripts/check-road-maze.mjs`, `scripts/check-panel-blast.mjs`
- `src/config/app.ts`, `package.json`, `package-lock.json`
- `src/content/changelog.ts`
- `notes-gemini.txt`
- `docs/` (Pages rebuild `index-DHWgUIcG.js` / `index-D6C8cq2K.css`)
- `MERGE.md`

## Checks
- `npm run test:city` ✓
- `npm run test:arcade` ✓
- `npm run build` → `docs/` ✓

## Status
**MERGEABLE CLEAN** — ready for CoS merge after green. Do NOT merge from this hop. Do NOT wake Shot.
