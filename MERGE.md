# ready-easy-fun-clear-202 — 1.4.202 Easy Hold ≤720 close chips→CTA purple gap

**PR:** https://github.com/cphillippe/Silver-dollar-city/pull/263
**Branch:** `ship/easy-fun-clear-202` → `main`
**Version:** 1.4.202
**Peel:** `bc5a761` (`bc5a761d14f565de88d0133fa01eb0f220fb0cee`)
**Tip:** `bc5a761` (`bc5a761d14f565de88d0133fa01eb0f220fb0cee`)
**Base live:** 1.4.201 (`71ec6da`, PR #262 Easy Story Creek ≤720 close board→CTA purple gap on main)
**CoS merges — do NOT merge from this hop.** Manager pings CoS only when mergeable.

## Shot wake
Shot pack 1.4.200 still in flight — Manager handles vision. **Do NOT wake Shot from this hop.** Do NOT run Gemini vision. Keep inventing Fun/Clear.

## How picked
Open Issues: **#161** Dig/Hard/NW/Town parked. **#160** cheap-hop infra. No open Easy Fun/Clear issue.
1.4.201 Easy Story Creek board→CTA live on main. Shot 190 fails #250–#253 already peeled as 193–196 — do NOT re-peel. Story Snap 197 / Sort 198 / Link 199 / Creed 200 / Story Creek 201 invents already on main.
Invent Fun/Clear — densest remaining Easy trail different from Creek 201 / Creed 200 / Link 199 / Sort 198 / Snap 197: **Easy Hold (WhyBlast live arena)** had fill peel **1.4.190** / arena-first **170** / short-phone **156** — `.cta-dock` still carries margin-top 4px/8px so free space sits as purple between chips and the next-tap dock (Father 196 / Link 199 / Creed 200 / Story Creek 201 dock-margin family). Live arena only — not quiz 194 / miss 195.

## Chosen climb
Single Easy Fun/Clear polish: **Easy Hold ≤720 close chips→CTA purple gap** — zero `.why-blast .cta-dock` / `.recall-gate.is-easy-hold .cta-dock` `margin-top` so `why-arena` flex:1 absorbs the portrait.

## What fixed
- `src/styles/sortHold.css`: `@media (max-height: 720px)` — `.recall-gate.is-easy-hold .cta-dock` / `.why-blast .cta-dock` `margin-top: 0` (short-phone 4px/8px was leaving a purple band after fill 190)
- `src/components/challenges/WhyBlastPlay.tsx`: thin 1.4.202 comment
- Android `versionName` left at **1.4.113**
- Version **1.4.202** atop live **1.4.201**

## Deferred (do NOT climb this hop)
- Dig Reveal / Hard / NW / Town / stores / Pack B / Home map candy
- Story Creek 201 / Creed 200 / Link 199 / Sort 198 / Story Snap 197 / Match 193 / Lock In quiz 194 / Lock In feedback 195 / Father 196 / Hold fill 190 / Build / Samaritan / Manage / letterbox (already on main)
- Journal held clear chrome further peel
- Hold fill 190 / arena-first 170 / short-phone 156 (different surface; still applies ≤720)
- Shot vision / waking Shot (Manager)

## Gemini
MODEL=gemini-flash-latest — Invent Fun/Clear (no open Easy Fun/Clear issue). Invent API key present but not AIza AI Studio shape. Manager-steered invent. Notes: `notes-gemini.txt` (+ `/workspace/silver-city-art/notes-gemini-202.txt`). Do NOT run Shot vision this hop.

## Files peeled
- `src/styles/sortHold.css`
- `src/components/challenges/WhyBlastPlay.tsx`
- `scripts/check-city.mjs`, `scripts/check-panel-blast.mjs`
- `src/config/app.ts`, `package.json`, `package-lock.json`
- `src/content/changelog.ts`
- `notes-gemini.txt`
- `docs/` (Pages rebuild `index-DKN2zyHH.js` / `index-skn40KZp.css`)
- `MERGE.md`

## Checks
- `npm run test:city` ✓
- `npm run test:arcade` ✓
- `npm run build` → `docs/` ✓

## Status
**MERGEABLE CLEAN** — ready for CoS merge after green. Do NOT merge from this hop. Do NOT wake Shot.
