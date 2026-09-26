# ready-easy-fun-clear-189 — 1.4.189 Easy Father Dash ≤720 fill purple void

**PR:** https://github.com/cphillippe/Silver-dollar-city/pull/246
**Branch:** `ship/easy-fun-clear-189` → `main`
**Version:** 1.4.189
**Peel:** `4151c77` (`4151c77f415210ea156996179f633fa60611a1ce`)
**Tip:** `add42ef` (`add42efe0b2bbbee7f8eef1da89b9a414a8a1955`)
**Base live:** 1.4.188 (`c82e112`, PR #245 Easy Link ≤720 fill purple void on main)
**CoS merges — do NOT merge from this hop.** Manager pings CoS only when mergeable.

## How picked
Open Issues: **#161** Dig/Hard/NW/Town parked. **#160** cheap-hop infra. No open Easy Fun/Clear issue.
1.4.188 Easy Link fill live on main. Shot wake at 1.4.190 — invent toward that.
Invent Fun/Clear — densest remaining Easy trail different from recent Match/LockIn/Samaritan/Sort/Snap/Creed/Build Argument/Link: **Easy Father Dash** had HUD peel **1.4.173** only — fixed 132px `run-scene` + speech + Hold pad hug the top so the gold card leaves empty purple under the pad (Match 184 / Link 188 fill family).

## Chosen climb
Single Easy Fun/Clear polish: **Easy Father Dash ≤720 fill purple void** — grow `play.is-father-run` shell + stretch `run-scene` so scene · speech · rail · pad fill the portrait.

## What fixed
- `src/index.css`: `@media (max-height: 720px)` — `.play.is-father-run` `flex: 1 1 auto`; `.run-scene` `flex: 1` + `height: auto` (overrides fixed 132px); speech / rail / pad stay `flex: 0`
- `src/components/challenges/FatherRunPlay.tsx`: thin 1.4.189 comment
- Android `versionName` left at **1.4.113**
- Version **1.4.189** atop live **1.4.188**

## Deferred (do NOT climb this hop)
- Dig Reveal / Hard / NW / Town / stores / Pack B / Home map candy
- Match 184 / Lock In 185 / Samaritan 186 / Sort 183 / Snap 182 / Creed 181 / Build Argument 187 / Link 188 / Manage 180 / letterbox (already on main)
- Journal held clear chrome further peel
- Father HUD peel 1.4.173 / speech thin 1.4.154 (different surface; still applies ≤720)

## Gemini
MODEL=gemini-flash-latest — Invent Fun/Clear (no open Easy Fun/Clear issue). Invent API key present but not AIza AI Studio shape. Manager-steered invent. Notes: `notes-gemini.txt` (+ `/workspace/silver-city-art/notes-gemini-189.txt`).

## Files peeled
- `src/index.css`
- `src/components/challenges/FatherRunPlay.tsx`
- `scripts/check-city.mjs`, `scripts/check-panel-blast.mjs`
- `src/config/app.ts`, `package.json`, `package-lock.json`
- `src/content/changelog.ts`
- `notes-gemini.txt`
- `docs/` (Pages rebuild `index-DVr6qfDU.js` / `index-D0wKAhnB.css`)
- `MERGE.md`

## Checks
- `npm run test:city` ✓
- `npm run test:arcade` ✓
- `npm run build` → `docs/` ✓

## Status
**MERGEABLE CLEAN** — ready for CoS merge after green. Do NOT merge from this hop.
