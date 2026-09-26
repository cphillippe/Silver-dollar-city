# ready-easy-fun-clear-200 — 1.4.200 Easy Creed ≤720 close bowl→CTA purple gap

**PR:** https://github.com/cphillippe/Silver-dollar-city/pull/261
**Branch:** `ship/easy-fun-clear-200` → `main`
**Version:** 1.4.200
**Peel:** `ccd47bd` (`ccd47bd598616ef141be8c2ea4043fd3589c2014`)
**Tip:** `9aa1b1d` (`9aa1b1d3212004241d5c7aeb6e9a2436efd75d5a`)
**Base live:** 1.4.199 (`709df26`, PR #260 Easy Link ≤720 close choices→CTA purple gap on main)
**CoS merges — do NOT merge from this hop.** Manager pings CoS only when mergeable.

## Shot wake
**This hop IS the every-10 Shot wake version (1.4.200).** Ship invent peel only. **Do NOT wake Shot from this hop.** Do NOT run Gemini vision. CoS wakes Shot after this merge (same pattern as 1.4.190).

## How picked
Open Issues: **#161** Dig/Hard/NW/Town parked. **#160** cheap-hop infra. No open Easy Fun/Clear issue.
1.4.199 Easy Link choices→CTA live on main. Shot 190 fails #250–#253 already peeled as 193–196 — do NOT re-peel. Story Snap 197 / Sort 198 / Link 199 invents already on main.
Invent Fun/Clear — densest remaining Easy trail different from Link 199 / Sort 198 / Story Snap 197: **Easy Creed merge** had fill peel **1.4.192** / HUD **181** / bowl-first **159** — global `.cta-dock { margin-top: auto }` still steals free space on win/overflow so the gold card leaves empty purple between bowl · ladder and the Hold / One more dock (Father 196 / Link 199 dock-margin family).

## Chosen climb
Single Easy Fun/Clear polish: **Easy Creed ≤720 close bowl→CTA purple gap** — zero `.play.is-claim-merge .cta-dock` `margin-top` so `merge-bowl` flex:1 absorbs the portrait.

## What fixed
- `src/index.css`: `@media (max-height: 720px)` — `.play.is-claim-merge .cta-dock` `margin-top: 0` (global auto margin was stealing free space after fill 192)
- `src/components/challenges/ClaimMergePlay.tsx`: thin 1.4.200 comment
- Android `versionName` left at **1.4.113**
- Version **1.4.200** atop live **1.4.199** (Shot wake version)

## Deferred (do NOT climb this hop)
- Dig Reveal / Hard / NW / Town / stores / Pack B / Home map candy
- Link 199 / Sort 198 / Story Snap 197 / Match 193 / Lock In quiz 194 / Lock In feedback 195 / Father 196 / Hold arena 190 / Creed fill 192 / Story Creek 191 / Build / Samaritan / Manage / letterbox (already on main)
- Journal held clear chrome further peel
- Creed fill 192 / HUD 181 / bowl-first 159 (different surface; still applies ≤720)
- Waking Shot / Gemini vision (CoS after merge)

## Gemini
MODEL=gemini-flash-latest — Invent Fun/Clear (no open Easy Fun/Clear issue). Invent API key present but not AIza AI Studio shape. Manager-steered invent. Notes: `notes-gemini.txt` (+ `/workspace/silver-city-art/notes-gemini-200.txt`). Do NOT run Shot vision this hop.

## Files peeled
- `src/index.css`
- `src/components/challenges/ClaimMergePlay.tsx`
- `scripts/check-city.mjs`, `scripts/check-panel-blast.mjs`
- `src/config/app.ts`, `package.json`, `package-lock.json`
- `src/content/changelog.ts`
- `notes-gemini.txt`
- `docs/` (Pages rebuild `index-BuOSbVAG.js` / `index-W8Owv5qi.css`)
- `MERGE.md`

## Checks
- `npm run test:city` ✓
- `npm run test:arcade` ✓
- `npm run build` → `docs/` ✓

## Status
**MERGEABLE CLEAN** — ready for CoS merge after green. Do NOT merge from this hop. Do NOT wake Shot (CoS after merge).
