# ready-easy-fun-clear-193 — 1.4.193 Easy Match ≤720 fill grid→footer purple void (Fixes #250)

**PR:** https://github.com/cphillippe/Silver-dollar-city/pull/254
**Branch:** `ship/easy-fun-clear-193` → `main`
**Version:** 1.4.193
**Peel:** `79e8f41` (`79e8f416ec2589408ec61750c5d6e04b45299feb`)
**Tip:** `b3937db` (`b3937db9a4e6742dc5c63b969a3263fdda35f8e6`)
**Base live:** 1.4.192 (`5f1e3ce`, PR #249 Easy Creed merge ≤720 fill purple void on main)
**CoS merges — do NOT merge from this hop.** Manager pings CoS only when mergeable.

## Shot wake
**Do NOT wake Shot from this hop.** CoS wakes Shot on 10th ships (next 1.4.200); this hop does not ping Shot.

## How picked
Open Issues: **#250** Easy Match ≤720 empty purple between grid and footer (P1 phone-fail, Shot 1.4.190 `03-easy-match.png`) — this hop.
**#251** Lock In quiz / **#252** Lock In feedback / **#253** Father — deferred next climbs; do not pack.
**#161** Dig/Hard/NW/Town parked. **#160** cheap-hop infra.

## Chosen climb
Single Easy Fun/Clear polish: **Easy Match (GemSearch letter grid) ≤720 fill grid→footer purple void** — grow `play.is-gem-search.is-panel-blast.is-story-docked` shell + stretch `gem-scroll` / `gem-stage` / `gem-board` so dock · letter grid · match-score fill the portrait (Fixes #250). Picture-deal Match 1.4.184 (#238) untouched.

## What fixed
- `src/styles/gem.css`: `@media (max-height: 720px)` — `.play.is-gem-search.is-panel-blast.is-story-docked` `flex: 1 1 auto`; stretch `.gem-scroll` / `.gem-stage`; `.gem-board` `flex: 1` + `height: 100%` + `max-height: none` + `aspect-ratio: auto`; dock / match-score / CTA stay `flex: 0`
- `src/components/challenges/GemSearchPlay.tsx`: thin 1.4.193 comment
- Android `versionName` left at **1.4.113**
- Version **1.4.193** atop live **1.4.192**

## Deferred (do NOT climb this hop)
- Dig Reveal / Hard / NW / Town / stores / Pack B / Home map candy
- **#251** Lock In quiz empty purple / **#252** Lock In feedback bottom void / **#253** Father slider→CTA
- Match picture-deal 184 / Creed fill 192 / Story Creek 191 / Hold 190 / Build / Link / Father Dash / Samaritan / Sort / Snap (already on main or other issues)
- How/say peel 1.4.168 (different surface; still applies ≤720)

## Gemini
MODEL=gemini-flash-latest — Shot pack 1.4.190 vision FAIL on Match (`gemini-vision.json`). Invent API key present but not AIza AI Studio shape. Manager-steered + issue #250. Notes: `notes-gemini.txt` (+ `/workspace/silver-city-art/notes-gemini-193.txt`).

## Files peeled
- `src/styles/gem.css`
- `src/components/challenges/GemSearchPlay.tsx`
- `scripts/check-city.mjs`, `scripts/check-panel-blast.mjs`
- `src/config/app.ts`, `package.json`, `package-lock.json`
- `src/content/changelog.ts`
- `notes-gemini.txt`
- `docs/` (Pages rebuild `index-Dm2u0r6v.js` / `index-BLD9gSX6.css`)
- `MERGE.md`

## Checks
- `npm run test:city` ✓
- `npm run test:arcade` ✓
- `npm run build` → `docs/` ✓

## Status
**MERGEABLE CLEAN** — ready for CoS merge after green. Do NOT merge from this hop. Do NOT wake Shot.
