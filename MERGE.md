# ready-easy-fun-clear-192 — 1.4.192 Easy Creed merge ≤720 fill purple void

**PR:** (pending create)
**Branch:** `ship/easy-fun-clear-192` → `main`
**Version:** 1.4.192
**Peel:**  ()
**Tip:**  ()
**Base live:** 1.4.191 (`5d8e11e`, PR #248 Easy Story Creek ≤720 fill purple void on main)
**CoS merges — do NOT merge from this hop.** Manager pings CoS only when mergeable.

## Shot wake
**Shot pack incoming separately — stay on invent.** Do NOT wake Shot from this hop. CoS wakes Shot on 10th ships (next 1.4.200); this hop does not ping Shot.

## How picked
Open Issues: **#161** Dig/Hard/NW/Town parked. **#160** cheap-hop infra. No open Easy Fun/Clear issue.
1.4.191 Easy Story Creek fill live on main. Invent Fun/Clear — densest remaining Easy trail different from recent Story Creek/Hold/Father/Link/Build/Samaritan/Match/LockIn: **Easy Creed merge** had HUD peel **1.4.181** / bowl-first **1.4.159** only — capped `merge-bowl` (max-height + aspect-ratio) hugs the top so the gold card leaves empty purple under the bowl (Match 184 / Story Creek 191 fill family).

## Chosen climb
Single Easy Fun/Clear polish: **Easy Creed merge ≤720 fill purple void** — grow `play.is-claim-merge` shell + stretch `merge-bowl` so score · ladder · bowl fill the portrait.

## What fixed
- `src/index.css`: `@media (max-height: 720px)` — `.play.is-claim-merge` `flex: 1 1 auto`; `.merge-bowl` `flex: 1` + `height: auto` + `max-height: none` + `aspect-ratio: auto`; HUD / ladder / banners stay `flex: 0`
- `src/components/challenges/ClaimMergePlay.tsx`: thin 1.4.192 comment
- Android `versionName` left at **1.4.113**
- Version **1.4.192** atop live **1.4.191**

## Deferred (do NOT climb this hop)
- Dig Reveal / Hard / NW / Town / stores / Pack B / Home map candy
- Match 184 / Lock In win-end 185 / Samaritan Sequence 186 / Sort 183 / Snap 182 / Story Creek 191 / Hold 190 / Build Argument 187 / Link 188 / Father Dash 189 / Manage 180 / letterbox (already on main)
- Journal held clear chrome further peel
- Creed HUD peel 1.4.181 / bowl-first 1.4.159 (different surface; still applies ≤720)

## Gemini
MODEL=gemini-flash-latest — Invent Fun/Clear (no open Easy Fun/Clear issue). Invent API key present but not AIza AI Studio shape. Manager-steered invent. Notes: `notes-gemini.txt` (+ `/workspace/silver-city-art/notes-gemini-192.txt`).

## Files peeled
- `src/index.css`
- `src/components/challenges/ClaimMergePlay.tsx`
- `scripts/check-city.mjs`, `scripts/check-panel-blast.mjs`
- `src/config/app.ts`, `package.json`, `package-lock.json`
- `src/content/changelog.ts`
- `notes-gemini.txt`
- `docs/` (Pages rebuild `index-Bt-xAwB3.js` / `index-8DeF8_vH.css`)
- `MERGE.md`

## Checks
- `npm run test:city` ✓
- `npm run test:arcade` ✓
- `npm run build` → `docs/` ✓

## Status
**MERGEABLE CLEAN** — ready for CoS merge after green. Do NOT merge from this hop. Do NOT wake Shot.
