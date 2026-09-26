# ready-easy-fun-clear-194 — 1.4.194 Easy Lock In quiz ≤720 fill purple void (Fixes #251)

**PR:** https://github.com/cphillippe/Silver-dollar-city/pull/255
**Branch:** `ship/easy-fun-clear-194` → `main`
**Version:** 1.4.194
**Peel:** `f1e0129` (`f1e0129f97579477858cb20a9ee9b3b0914be69d`)
**Tip:** `199ef5a` (`199ef5a26a20e65319eb02c9830216df23693e0f`)
**Base live:** 1.4.193 (`9e8bef5`, PR #254 Easy Match ≤720 fill grid→footer purple void on main)
**CoS merges — do NOT merge from this hop.** Manager pings CoS only when mergeable.

## Shot wake
**Do NOT wake Shot from this hop.** CoS wakes Shot on 10th ships (next 1.4.200); this hop does not ping Shot.

## How picked
Open Issues: **#251** Easy Lock In quiz ≤720 bottom third purple void (P1 phone-fail, Shot 1.4.190 `04-easy-lockin.png`) — this hop.
**#252** Lock In feedback / **#253** Father — deferred next climbs; do not pack.
**#161** Dig/Hard/NW/Town parked. **#160** cheap-hop infra.

## Chosen climb
Single Easy Fun/Clear polish: **Easy Lock In quiz (WhyBlast mid-question) ≤720 fill purple void** — grow `app-body` · `journal.is-rehearse` · `rehearse-anchor` · `recall-gate` so the gold quiz card fills the portrait (Fixes #251). Hold arena stretch 1.4.190 stays inside the card; miss teach (#252) / win-end 185 untouched.

## What fixed
- `src/styles/sortHold.css`: `@media (max-height: 720px)` — Easy Lock In live quiz: `app-body:has(.journal.is-rehearse .why-blast:not(.is-miss-teach):not(.is-win))` flex fill; `journal` / `rehearse-anchor` / `recall-gate.is-easy-hold` `flex: 1 1 auto`
- `src/components/challenges/WhyBlastPlay.tsx`: thin 1.4.194 comment
- Android `versionName` left at **1.4.113**
- Version **1.4.194** atop live **1.4.193**

## Deferred (do NOT climb this hop)
- Dig Reveal / Hard / NW / Town / stores / Pack B / Home map candy
- **#252** Lock In feedback bottom void / **#253** Father slider→CTA
- Match 193 / Hold arena 190 / Creed 192 / Story Creek 191 / Hold win-end 185 / Build / Link / Father Dash / Samaritan / Sort / Snap (already on main or other issues)

## Gemini
MODEL=gemini-flash-latest — Shot pack 1.4.190 vision FAIL on Lock In quiz (`gemini-vision.json` / `04-easy-lockin.png`). Invent API key present but not AIza AI Studio shape. Manager-steered + issue #251. Notes: `notes-gemini.txt` (+ `/workspace/silver-city-art/notes-gemini-194.txt`).

## Files peeled
- `src/styles/sortHold.css`
- `src/components/challenges/WhyBlastPlay.tsx`
- `scripts/check-city.mjs`, `scripts/check-panel-blast.mjs`
- `src/config/app.ts`, `package.json`, `package-lock.json`
- `src/content/changelog.ts`
- `notes-gemini.txt`
- `docs/` (Pages rebuild `index-DEzZq_YF.js` / `index-CPWkDwwh.css`)
- `MERGE.md`

## Checks
- `npm run test:city` ✓
- `npm run test:arcade` ✓
- `npm run build` → `docs/` ✓

## Status
**MERGEABLE CLEAN** — ready for CoS merge after green. Do NOT merge from this hop. Do NOT wake Shot.
