# ready-easy-fun-clear-198 — 1.4.198 Easy Sort ≤720 fill purple void

**PR:** https://github.com/cphillippe/Silver-dollar-city/pull/259
**Branch:** `ship/easy-fun-clear-198` → `main`
**Version:** 1.4.198
**Peel:** `67cf0b0` (`67cf0b07e3ebc2558e1a29dc70c2799f70002a82`)
**Tip:** `422fdcc` (`422fdcc533c0b03e54666db5bd5412937ef1b77f`)
**Base live:** 1.4.197 (`e5a43af`, PR #258 Easy Story Snap ≤720 fill purple void on main)
**CoS merges — do NOT merge from this hop.** Manager pings CoS only when mergeable.

## Shot wake
**Do NOT wake Shot from this hop.** CoS wakes Shot on 10th ships (next 1.4.200); this hop does not ping Shot. Keep inventing toward that.

## How picked
Open Issues: **#161** Dig/Hard/NW/Town parked. **#160** cheap-hop infra. No open Easy Fun/Clear issue.
1.4.197 Easy Story Snap fill live on main. Shot 190 fails #250–#253 already peeled as 193–196 — do NOT re-peel.
Invent Fun/Clear — densest remaining Easy trail different from Story Snap 197 / Match/LockIn/Father/Hold/Creed/Story Creek/Build/Link/Samaritan: **Easy Sort** had board-first peel **1.4.183** only — fixed `bank.is-sort` (108px×2) + capped `sort-bins` (102px) hug the top so the gold card leaves empty purple under the bins (Match 184 / Story Snap 197 / Creed 192 fill family).

## Chosen climb
Single Easy Fun/Clear polish: **Easy Sort ≤720 fill purple void** — grow `play.is-easy-sort` shell + stretch `bank.is-sort` seats / `sort-bins` so Keep·Toss fill the portrait.

## What fixed
- `src/styles/sortHold.css`: `@media (max-height: 720px)` — `.play.is-easy-sort` `flex: 1 1 auto`; `.bank.is-sort` stretch rows + `max-height: none`; `.sort-bins` / `.bin` grow; prompt / how / hint stay `flex: 0`; board-first 183 hide how/hint stays
- `src/components/challenges/SortPlay.tsx`: thin 1.4.198 comment
- Android `versionName` left at **1.4.113**
- Version **1.4.198** atop live **1.4.197**

## Deferred (do NOT climb this hop)
- Dig Reveal / Hard / NW / Town / stores / Pack B / Home map candy
- Story Snap 197 / Match 193 / Lock In quiz 194 / Lock In feedback 195 / Father 196 / Hold arena 190 / Creed 192 / Story Creek 191 / Build / Link / Samaritan / Manage / letterbox (already on main)
- Journal held clear chrome further peel
- Sort board-first 1.4.183 (different surface; still applies ≤720)

## Gemini
MODEL=gemini-flash-latest — Invent Fun/Clear (no open Easy Fun/Clear issue). Invent API key present but not AIza AI Studio shape. Manager-steered invent. Notes: `notes-gemini.txt` (+ `/workspace/silver-city-art/notes-gemini-198.txt`).

## Files peeled
- `src/styles/sortHold.css`
- `src/components/challenges/SortPlay.tsx`
- `scripts/check-city.mjs`, `scripts/check-panel-blast.mjs`
- `src/config/app.ts`, `package.json`, `package-lock.json`
- `src/content/changelog.ts`
- `notes-gemini.txt`
- `docs/` (Pages rebuild `index-BgKnFwDp.js` / `index-NetVQDiO.css`)
- `MERGE.md`

## Checks
- `npm run test:city` ✓
- `npm run test:arcade` ✓
- `npm run build` → `docs/` ✓

## Status
**MERGEABLE CLEAN** — ready for CoS merge after green. Do NOT merge from this hop. Do NOT wake Shot.
