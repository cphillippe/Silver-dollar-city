# ready-easy-fun-clear-184 — 1.4.184 Easy Match ≤720 fill empty purple card (Fixes #238)

**PR:** https://github.com/cphillippe/Silver-dollar-city/pull/241
**Branch:** `ship/easy-fun-clear-184` → `main`
**Version:** 1.4.184
**Peel:**  ()
**Tip:**  ()
**Base live:** 1.4.183 (`29f015a`, PR #237 Easy Sort ≤720 board-first on main)
**CoS merges — do NOT merge from this hop.** Manager pings CoS only when mergeable.

## How picked
Open Issues: **#238** Easy Match empty purple card (P1 phone-fail, Shot 1.4.180 `03-easy-match.png`) — this hop.
**#239** Lock In miss / **#240** Samaritan — deferred next climbs; do not pack.
**#161** Dig/Hard/NW/Town parked. **#160** cheap-hop infra.

## Chosen climb
Single Easy Fun/Clear polish: **Easy Match (picture · main idea) ≤720 fill empty purple card** — grow `is-deal` match-grid into the play shell + stretch card rows so picture · MAIN IDEA fill the gold-bordered card (Fixes #238). Gem crossword 1.4.168 how/say peel untouched.

## What fixed
- `src/styles/match.css`: `@media (max-height: 720px)` on `.is-puzzle .play.is-match.is-deal` — `match-grid { flex: 1 1 auto; grid-template-rows: auto minmax(0,1.15fr) minmax(0,1fr) }`; stretch cards + scene; hide `.sort-how` (prompt lead already teaches)
- `src/components/challenges/MatchPlay.tsx`: thin 1.4.184 comment
- Android `versionName` left at **1.4.113**
- Version **1.4.184** atop live **1.4.183**

## Deferred (do NOT climb this hop)
- Dig Reveal / Hard / NW / Town / stores / Pack B / Home map candy
- **#239** Lock In miss empty purple / **#240** Samaritan top-cluster
- Sort 183 / Snap 182 / Creed 181 / Manage 180 / letterbox (already on main)
- Gem Match 168 how/say (different surface)

## Gemini
MODEL=gemini-flash-latest — Shot pack 1.4.180 vision FAIL on Match (`gemini-vision.json`). Invent API key present but not AIza AI Studio shape. Manager-steered + issue #238. Notes: `notes-gemini.txt` (+ `/workspace/silver-city-art/notes-gemini-184.txt`).

## Files peeled
- `src/styles/match.css`
- `src/components/challenges/MatchPlay.tsx`
- `scripts/check-city.mjs`, `scripts/check-panel-blast.mjs`
- `src/config/app.ts`, `package.json`, `package-lock.json`
- `src/content/changelog.ts`
- `notes-gemini.txt`
- `docs/` (Pages rebuild `index-Dh_Wcyhp.js` / `index-C-nrAQvE.css`)
- `MERGE.md`

## Checks
- `npm run test:city` ✓
- `npm run test:arcade` ✓
- `npm run build` → `docs/` ✓

## Status
**MERGEABLE CLEAN** (confirm after push) — ready for CoS merge after green. Do NOT merge from this hop.
