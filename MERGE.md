# ready-easy-fun-clear-199 — 1.4.199 Easy Link ≤720 close choices→CTA purple gap

**PR:** (pending)
**Branch:** `ship/easy-fun-clear-199` → `main`
**Version:** 1.4.199
**Peel:** `95314a2` (`95314a2773b6ace3686a30448003aff5e2db920a`)
**Tip:** `95314a2` (`95314a2773b6ace3686a30448003aff5e2db920a`)
**Base live:** 1.4.198 (`ff7dcbf`, PR #259 Easy Sort ≤720 fill purple void on main)
**CoS merges — do NOT merge from this hop.** Manager pings CoS only when mergeable.

## Shot wake
**Do NOT wake Shot from this hop.** CoS wakes Shot on 10th ships (next **1.4.200**); this hop is last invent before Shot cadence. Do not claim 1.4.200. Do not ping Shot.

## How picked
Open Issues: **#161** Dig/Hard/NW/Town parked. **#160** cheap-hop infra. No open Easy Fun/Clear issue.
1.4.198 Easy Sort fill live on main. Shot 190 fails #250–#253 already peeled as 193–196 — do NOT re-peel. Story Snap 197 / Sort 198 invent fills already on main.
Invent Fun/Clear — densest remaining Easy trail different from Sort 198 / Story Snap 197: **Easy Link** had fill peel **1.4.188** only — global `.link-dock { margin-top: auto }` still steals free space after fill so the gold card leaves empty purple between picture choices and the bottom dock (Father 196 dock-margin family).

## Chosen climb
Single Easy Fun/Clear polish: **Easy Link ≤720 close choices→CTA purple gap** — zero `.play.is-easy-link .link-dock` `margin-top` so `link-col` flex:1 absorbs the portrait.

## What fixed
- `src/index.css`: `@media (max-height: 720px)` — `.play.is-easy-link .link-dock` `margin-top: 0` (global auto margin was stealing free space after fill 188)
- `src/components/challenges/LinkPlay.tsx`: thin 1.4.199 comment
- Android `versionName` left at **1.4.113**
- Version **1.4.199** atop live **1.4.198**

## Deferred (do NOT climb this hop)
- Dig Reveal / Hard / NW / Town / stores / Pack B / Home map candy
- Sort 198 / Story Snap 197 / Match 193 / Lock In quiz 194 / Lock In feedback 195 / Father 196 / Hold arena 190 / Creed 192 / Story Creek 191 / Build / Samaritan / Link fill 188 / Manage / letterbox (already on main)
- Journal held clear chrome further peel
- Link fill peel 1.4.188 (different surface; still applies ≤720)
- **1.4.200** Shot wake (do not invent as 200)

## Gemini
MODEL=gemini-flash-latest — Invent Fun/Clear (no open Easy Fun/Clear issue). Invent API key present but not AIza AI Studio shape. Manager-steered invent. Notes: `notes-gemini.txt` (+ `/workspace/silver-city-art/notes-gemini-199.txt`).

## Files peeled
- `src/index.css`
- `src/components/challenges/LinkPlay.tsx`
- `scripts/check-city.mjs`, `scripts/check-panel-blast.mjs`
- `src/config/app.ts`, `package.json`, `package-lock.json`
- `src/content/changelog.ts`
- `notes-gemini.txt`
- `docs/` (Pages rebuild `index-BalTfmT6.js` / `index-3ZkQ0f3B.css`)
- `MERGE.md`

## Checks
- `npm run test:city` ✓
- `npm run test:arcade` ✓
- `npm run build` → `docs/` ✓

## Status
**MERGEABLE CLEAN** — ready for CoS merge after green. Do NOT merge from this hop. Do NOT wake Shot.
