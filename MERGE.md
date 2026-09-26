# ready-easy-fun-clear-185 — 1.4.185 Easy Lock In ≤720 fill win-end purple void (Fixes #239)

**PR:** https://github.com/cphillippe/Silver-dollar-city/pull/242
**Branch:** `ship/easy-fun-clear-185` → `main`
**Version:** 1.4.185
**Peel:** `ffa04c1` (`ffa04c1022be63e645f2a64de7076c715e53fd35`)
**Tip:** `b0c496c` (`b0c496cce8a5ac518e8cd59982762f4f8c907a04`)
**Base live:** 1.4.184 (`e638288`, PR #241 Easy Match ≤720 fill empty purple card on main)
**CoS merges — do NOT merge from this hop.** Manager pings CoS only when mergeable.

## How picked
Open Issues: **#239** Easy Lock In win-end / feedback bottom purple void (P1 phone-fail, Shot 1.4.180 `05-easy-lockin-miss.png`; issue comment: vision = win-end fallback, miss teach not reached) — this hop.
**#240** Samaritan — deferred next climb; do not pack. **#238** Match already on main as 1.4.184.
**#161** Dig/Hard/NW/Town parked. **#160** cheap-hop infra.

## Chosen climb
Single Easy Fun/Clear polish: **Easy Lock In win-end / feedback ≤720 fill empty purple bottom** — grow `challenge-page.is-after:has(.stored-line)` after-win shell + `stored-line` gold card so SAY THIS TOMORROW · Home CTA · Juniper whisper fill the portrait (Fixes #239).

## What fixed
- `src/styles/sortHold.css`: `@media (max-height: 720px)` Easy `app-body:has(.is-after .stored-line)` flex fill; `.after-win` flex column; `.stored-line { flex: 1 1 auto; align-content: center }`; TownReturn pinned `flex: 0 0 auto`
- `src/components/StoredLine.tsx`: thin 1.4.185 comment
- Android `versionName` left at **1.4.113**
- Version **1.4.185** atop live **1.4.184**

## Deferred (do NOT climb this hop)
- Dig Reveal / Hard / NW / Town / stores / Pack B / Home map candy
- **#240** Samaritan top-cluster
- Match 184 / Sort 183 / Snap 182 / Creed 181 / Manage 180 / letterbox (already on main)
- Miss teach PlainTalk drop 1.4.161 / Lock In arena ≤720 1.4.170 (different surface)

## Gemini
MODEL=gemini-flash-latest — Shot pack 1.4.180 vision FAIL on Lock In win-end (`gemini-vision.json`). Invent API key present but not AIza AI Studio shape. Manager-steered + issue #239 comment. Notes: `notes-gemini.txt` (+ `/workspace/silver-city-art/notes-gemini-185.txt`).

## Files peeled
- `src/styles/sortHold.css`
- `src/components/StoredLine.tsx`
- `scripts/check-city.mjs`, `scripts/check-panel-blast.mjs`
- `src/config/app.ts`, `package.json`, `package-lock.json`
- `src/content/changelog.ts`
- `notes-gemini.txt`
- `docs/` (Pages rebuild `index-S5aan8XD.js` / `index-D0FDdba9.css`)
- `MERGE.md`

## Checks
- `npm run test:city` ✓
- `npm run test:arcade` ✓
- `npm run build` → `docs/` ✓

## Status
**MERGEABLE CLEAN** — ready for CoS merge after green. Do NOT merge from this hop.
