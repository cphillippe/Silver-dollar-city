# ready-easy-fun-clear-190 — 1.4.190 Easy Hold ≤720 fill purple void

**PR:** https://github.com/cphillippe/Silver-dollar-city/pull/247
**Branch:** `ship/easy-fun-clear-190` → `main`
**Version:** 1.4.190
**Peel:** `d01e4c2` (`d01e4c2f61660d76907233df3901a13ee9844577`)
**Tip:** `76963b5` (`76963b546718da5ee167b298fb2c2e5a2674b041`)
**Base live:** 1.4.189 (`639a840`, PR #246 Easy Father Dash ≤720 fill purple void on main)
**CoS merges — do NOT merge from this hop.** Manager pings CoS only when mergeable.

## Shot wake
**Shot wakes after CoS merges this 1.4.190.** Do NOT wake Shot from this hop — CoS wakes Shot post-merge.

## How picked
Open Issues: **#161** Dig/Hard/NW/Town parked. **#160** cheap-hop infra. No open Easy Fun/Clear issue.
1.4.189 Easy Father Dash fill live on main. Shot wake at 1.4.190 — invent toward that.
Invent Fun/Clear — densest remaining Easy trail different from recent Match/LockIn/Samaritan/Sort/Snap/Creed/Build Argument/Link/Father Dash: **Easy Hold (WhyBlast live arena)** had chrome peels **1.4.156 / 1.4.170** only — chips hug content so the gold card leaves empty purple under the CTA (Match 184 / Father 189 fill family). Lock In win-end **1.4.185** was after-win stored-line — different surface.

## Chosen climb
Single Easy Fun/Clear polish: **Easy Hold ≤720 fill purple void** — grow `why-blast` shell + stretch `why-arena` chip rows so claim · chips fill the portrait.

## What fixed
- `src/styles/sortHold.css`: `@media (max-height: 720px)` — `.recall-gate.is-easy-hold:has(.why-blast)` / `.why-blast` `flex: 1 1 auto`; `.why-arena` `flex: 1` + `grid-template-rows: minmax(0,1fr) auto minmax(0,1fr)`; chips `height: 100%`; HUD / CTA / miss teach stay `flex: 0`
- `src/components/challenges/WhyBlastPlay.tsx`: thin 1.4.190 comment
- Android `versionName` left at **1.4.113**
- Version **1.4.190** atop live **1.4.189**

## Deferred (do NOT climb this hop)
- Dig Reveal / Hard / NW / Town / stores / Pack B / Home map candy
- Match 184 / Lock In win-end 185 / Samaritan 186 / Sort 183 / Snap 182 / Creed 181 / Build Argument 187 / Link 188 / Father Dash 189 / Manage 180 / letterbox (already on main)
- Journal held clear chrome further peel
- Hold arena-first 1.4.170 / short-phone 1.4.156 (different surface; still applies ≤720)

## Gemini
MODEL=gemini-flash-latest — Invent Fun/Clear (no open Easy Fun/Clear issue). Invent API key present but not AIza AI Studio shape. Manager-steered invent. Notes: `notes-gemini.txt` (+ `/workspace/silver-city-art/notes-gemini-190.txt`).

## Files peeled
- `src/styles/sortHold.css`
- `src/components/challenges/WhyBlastPlay.tsx`
- `scripts/check-city.mjs`, `scripts/check-panel-blast.mjs`
- `src/config/app.ts`, `package.json`, `package-lock.json`
- `src/content/changelog.ts`
- `notes-gemini.txt`
- `docs/` (Pages rebuild `index-DDeyzpVI.js` / `index-2llEk2Nu.css`)
- `MERGE.md`

## Checks
- `npm run test:city` ✓
- `npm run test:arcade` ✓
- `npm run build` → `docs/` ✓

## Status
**MERGEABLE CLEAN** — ready for CoS merge after green. Do NOT merge from this hop. **Shot wakes after this merges (CoS).**
