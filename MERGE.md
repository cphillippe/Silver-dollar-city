# ready-easy-fun-clear-201 — 1.4.201 Easy Story Creek ≤720 close board→CTA purple gap

**PR:** https://github.com/cphillippe/Silver-dollar-city/pull/262
**Branch:** `ship/easy-fun-clear-201` → `main`
**Version:** 1.4.201
**Peel:** `772ed4a` (`772ed4a541b94d1869654c1e3937a574228c6041`)
**Tip:** `300e320` (`300e320ef7268378da168b29f73bf6bc29c82045`)
**Base live:** 1.4.200 (`3fba16e`, PR #261 Easy Creed ≤720 close bowl→CTA purple gap on main)
**CoS merges — do NOT merge from this hop.** Manager pings CoS only when mergeable.

## Shot wake
Shot woken for pack after 1.4.200 — Manager handles vision when PNGs arrive. **Do NOT wake Shot from this hop.** Do NOT run Gemini vision. Keep inventing Fun/Clear.

## How picked
Open Issues: **#161** Dig/Hard/NW/Town parked. **#160** cheap-hop infra. No open Easy Fun/Clear issue.
1.4.200 Easy Creed bowl→CTA live on main. Shot 190 fails #250–#253 already peeled as 193–196 — do NOT re-peel. Story Snap 197 / Sort 198 / Link 199 / Creed 200 invents already on main.
Invent Fun/Clear — densest remaining Easy trail different from Creed 200 / Link 199 / Sort 198 / Story Snap 197: **Easy Story Creek (Samaritan road maze)** had fill peel **1.4.191** / HUD **175** / compress **153** — global `.cta-dock { margin-top: auto }` still steals free space on win so the gold card leaves empty purple between board · score and the Hold / Again dock (Father 196 / Link 199 / Creed 200 dock-margin family).

## Chosen climb
Single Easy Fun/Clear polish: **Easy Story Creek ≤720 close board→CTA purple gap** — zero `.play.is-road-maze .cta-dock` `margin-top` so `maze-board` flex:1 absorbs the portrait.

## What fixed
- `src/styles/maze.css`: `@media (max-height: 720px)` — `.play.is-road-maze .cta-dock` `margin-top: 0` (global auto margin was stealing free space after fill 191)
- `src/components/challenges/RoadMazePlay.tsx`: thin 1.4.201 comment
- Android `versionName` left at **1.4.113**
- Version **1.4.201** atop live **1.4.200**

## Deferred (do NOT climb this hop)
- Dig Reveal / Hard / NW / Town / stores / Pack B / Home map candy
- Creed 200 / Link 199 / Sort 198 / Story Snap 197 / Match 193 / Lock In quiz 194 / Lock In feedback 195 / Father 196 / Hold arena 190 / Story Creek fill 191 / Build / Samaritan / Manage / letterbox (already on main)
- Journal held clear chrome further peel
- Story Creek fill 191 / HUD 175 / compress 153 (different surface; still applies ≤720)
- Shot vision / waking Shot (Manager)

## Gemini
MODEL=gemini-flash-latest — Invent Fun/Clear (no open Easy Fun/Clear issue). Invent API key present but not AIza AI Studio shape. Manager-steered invent. Notes: `notes-gemini.txt` (+ `/workspace/silver-city-art/notes-gemini-201.txt`). Do NOT run Shot vision this hop.

## Files peeled
- `src/styles/maze.css`
- `src/components/challenges/RoadMazePlay.tsx`
- `scripts/check-city.mjs`, `scripts/check-panel-blast.mjs`
- `src/config/app.ts`, `package.json`, `package-lock.json`
- `src/content/changelog.ts`
- `notes-gemini.txt`
- `docs/` (Pages rebuild `index-DNov9PFC.js` / `index-BvoOdNRG.css`)
- `MERGE.md`

## Checks
- `npm run test:city` ✓
- `npm run test:arcade` ✓
- `npm run build` → `docs/` ✓

## Status
**MERGEABLE CLEAN** — ready for CoS merge after green. Do NOT merge from this hop. Do NOT wake Shot.
