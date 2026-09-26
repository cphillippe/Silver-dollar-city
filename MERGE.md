# ready-easy-fun-clear-183 — 1.4.183 Easy Sort ≤720 board-first

**PR:** https://github.com/cphillippe/Silver-dollar-city/pull/237
**Branch:** `ship/easy-fun-clear-183` → `main`
**Version:** 1.4.183
**Peel:** `be1334a` (`be1334a31b573a5c6eadbdf8309058ee67dc9fe9`)
**Tip:** `f380d78` (`f380d7847e1e195ea96d601da96f44c5e3d3946a`)
**Base live:** 1.4.182 (`2a5cce5`, PR #236 Easy Story Snap ≤720 HUD on main; atop 1.4.181 Creed #235)
**CoS merges — do NOT merge from this hop.** Manager pings CoS only when mergeable.

## How picked
Open Issues scan: **#161** Dig/Hard/NW/Town parked. **#160** cheap-hop continue (infra). No open Easy Fun/Clear P1/P2 left after #236 merged mid-flight.

Invent Fun/Clear — Gemini flash pick **A** Easy Sort ≤720 board-first. Sort is the sole core Easy trail minigame without a dedicated ≤720 fold peel (Match 168 / Sequence·Build 171 / Father 173 / Maze 175 / Creed 181 / Snap 182). Do not reopen Snap eyebrow / Creed merge / Manage / letterbox.

## Chosen climb
Single Easy Fun/Clear polish: **Easy Sort ≤720 board-first** — hide how + hint; clamp lead so Keep·Toss + bins stay above fold (Sequence/Build 1.4.171 / Match 1.4.168 ≤720 family).

## What fixed
- `src/styles/sortHold.css`: `@media (max-height: 720px)` hides `.play.is-easy-sort` `.sort-how` + `.easy-hint`/`.hint-peek`; clamps `.prompt` (`-webkit-line-clamp: 2`); gap 3px
- `src/components/challenges/SortPlay.tsx`: thin 1.4.183 comment
- Android `versionName` left at **1.4.113**
- Version **1.4.183** atop live **1.4.182**

## Deferred (do NOT climb this hop)
- Dig Reveal / Hard / NW / Town / stores / Pack B / Home map candy
- Story Snap / Creed merge / Manage / letterbox (already on main)
- Journal held clear chrome further peel / Easy Link ≤720

## Gemini
MODEL=gemini-flash-latest — invent pick A approved. Notes: `notes-gemini.txt` (+ `/workspace/silver-city-art/notes-gemini-183.txt`).

## Files peeled
- `src/styles/sortHold.css`
- `src/components/challenges/SortPlay.tsx`
- `scripts/check-city.mjs`, `scripts/check-panel-blast.mjs`
- `src/config/app.ts`, `package.json`, `package-lock.json`
- `src/content/changelog.ts`
- `notes-gemini.txt`
- `docs/` (Pages rebuild `index-D8rLdrE0.js` / `index-DWbnHx6a.css`)
- `MERGE.md`

## Checks
- `npm run test:city` ✓
- `npm run test:arcade` ✓
- `npm run build` → `docs/` ✓

## Status
**MERGEABLE CLEAN** — ready for CoS merge after green. Do NOT merge from this hop.
