# ready-easy-fun-clear-204 — 1.4.204 Easy Father ≤720 close speech→rail purple gap

**PR:** https://github.com/cphillippe/Silver-dollar-city/pull/265
**Branch:** `ship/easy-fun-clear-204` → `main`
**Version:** 1.4.204
**Peel:** `0268634` (`0268634f0d9b8a2b5ea355a9d70c3c180fa5215d`)
**Tip:** `88cf602` (`88cf6020ebab9c71775eaa950d5ecc4359d88bb2`)
**Base live:** 1.4.203 (`b2cf654`, PR #264 Easy Build ≤720 fill free-place purple void on main)
**CoS merges — do NOT merge from this hop.** Manager pings CoS only when mergeable.

## Shot wake
Shot pack 1.4.200 still in flight — Manager handles vision. **Do NOT wake Shot from this hop.** Do NOT run Gemini vision. Keep inventing Fun/Clear.

## How picked
Open Issues: **#161** Dig/Hard/NW/Town parked. **#160** cheap-hop infra. No open Easy Fun/Clear issue.
1.4.203 Easy Build free-place fill live on main. Shot 190 fails #250–#253 already peeled as 193–196 — do NOT re-peel. Story Snap 197 / Sort 198 / Link 199 / Creed 200 / Story Creek 201 / Hold 202 / Build 203 invents already on main.
Invent Fun/Clear — densest remaining Easy trail different from Build 203 / Hold 202 / Creek 201 / Creed 200 / Link 199 / Sort 198 / Snap 197: **Easy Father Dash** had fill **1.4.189** / dock-margin **1.4.196** / HUD **173** / speech thin **154** — run-speech padding/margins + play gap still leave a thin purple band between the speech card and the timing rail before the Hold pad (Father dock-margin family).

## Chosen climb
Single Easy Fun/Clear polish: **Easy Father ≤720 close speech→rail purple gap** — zero `.run-speech` / `.run-rail` margins + tighten gap/padding so scene · speech · rail · pad pack tight.

## What fixed
- `src/index.css`: `@media (max-height: 720px)` — `.play.is-father-run` `gap: 2px`; `.run-speech` `margin: 0` + thinner padding; `.run-rail` `margin: 0` + height 14px; fill 189 / dock 196 / HUD 173 / speech 154 stay
- `src/components/challenges/FatherRunPlay.tsx`: thin 1.4.204 comment
- Android `versionName` left at **1.4.113**
- Version **1.4.204** atop live **1.4.203**

## Deferred (do NOT climb this hop)
- Dig Reveal / Hard / NW / Town / stores / Pack B / Home map candy
- Build 203 / Hold 202 / Story Creek 201 / Creed 200 / Link 199 / Sort 198 / Story Snap 197 / Match 193 / Lock In quiz 194 / Lock In feedback 195 / Father fill 189 / Father dock 196 / Samaritan / Manage / letterbox (already on main)
- Journal held clear chrome further peel
- Father fill 189 / dock 196 / HUD 173 / speech thin 154 (different surface; still applies ≤720)
- Shot vision / waking Shot (Manager)

## Gemini
MODEL=gemini-flash-latest — Invent Fun/Clear (no open Easy Fun/Clear issue). Invent API key present but not AIza AI Studio shape. Manager-steered invent. Notes: `notes-gemini.txt` (+ `/workspace/silver-city-art/notes-gemini-204.txt`). Do NOT run Shot vision this hop.

## Files peeled
- `src/index.css`
- `src/components/challenges/FatherRunPlay.tsx`
- `scripts/check-city.mjs`, `scripts/check-panel-blast.mjs`
- `src/config/app.ts`, `package.json`, `package-lock.json`
- `src/content/changelog.ts`
- `notes-gemini.txt`
- `docs/` (Pages rebuild `index-zTwpFbVb.js` / `index-Drw9tpZe.css`)
- `MERGE.md`

## Checks
- `npm run test:city` ✓
- `npm run test:arcade` ✓
- `npm run build` → `docs/` ✓

## Status
**MERGEABLE CLEAN** — ready for CoS merge after green. Do NOT merge from this hop. Do NOT wake Shot.
