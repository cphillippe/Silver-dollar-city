# ready-easy-fun-clear-196 — 1.4.196 Easy Father ≤720 close slider→CTA purple gap (Fixes #253)

**PR:** (pending)
**Branch:** `ship/easy-fun-clear-196` → `main`
**Version:** 1.4.196
**Peel:** (pending)
**Tip:** (pending)
**Base live:** 1.4.195 (`ea5eba5`, PR #256 Easy Lock In feedback ≤720 fill purple void on main)
**CoS merges — do NOT merge from this hop.** Manager pings CoS only when mergeable.

## Shot wake
**Do NOT wake Shot from this hop.** CoS wakes Shot on 10th ships (next 1.4.200); this hop does not ping Shot.

## How picked
Open Issues: **#253** Easy Father ≤720 purple gap slider to CTA (P1 phone-fail, Shot 1.4.190 `07-father.png`) — this hop.
**#250** Match / **#251** Lock In quiz / **#252** Lock In feedback already on main as 1.4.193 / 1.4.194 / 1.4.195.
**#161** Dig/Hard/NW/Town parked. **#160** cheap-hop infra.

## Chosen climb
Single Easy Fun/Clear polish: **Easy Father timing ≤720 close slider→CTA purple gap** — zero `.cta-dock` / `.cta-dock.run-dock` `margin-top` so `run-scene` flex:1 (from 1.4.189) absorbs the portrait instead of a dead purple band between the timing slider and the Hold pad (Fixes #253). Match 193 / Lock In 194·195 / Hold arena 190 untouched — different peel target.

## What fixed
- `src/index.css`: `@media (max-height: 720px)` — Easy Father: `.play.is-father-run .cta-dock` / `.cta-dock.run-dock` `margin-top: 0` (global auto margin was stealing free space after fill 189)
- `src/components/challenges/FatherRunPlay.tsx`: thin 1.4.196 comment
- Android `versionName` left at **1.4.113**
- Version **1.4.196** atop live **1.4.195**

## Deferred (do NOT climb this hop)
- Dig Reveal / Hard / NW / Town / stores / Pack B / Home map candy
- Match 193 / Lock In quiz 194 / Lock In feedback 195 / Hold arena 190 / win-end StoredLine 185 / Creed 192 / Story Creek 191 / Build / Link / Father fill 189 / Samaritan / Sort / Snap (already on main or other issues)

## Gemini
MODEL=gemini-flash-latest — Shot pack 1.4.190 vision FAIL on Father (`gemini-vision.json` / `07-father.png`). Invent API key present but not AIza AI Studio shape. Manager-steered + issue #253. Notes: `notes-gemini.txt` (+ `/workspace/silver-city-art/notes-gemini-196.txt`).

## Files peeled
- `src/index.css`
- `src/components/challenges/FatherRunPlay.tsx`
- `scripts/check-city.mjs`, `scripts/check-panel-blast.mjs`
- `src/config/app.ts`, `package.json`, `package-lock.json`
- `src/content/changelog.ts`
- `notes-gemini.txt`
- `docs/` (Pages rebuild `index-C2CKVLEC.js` / `index-hl3RlArr.css`)
- `MERGE.md`

## Checks
- `npm run test:city` ✓
- `npm run test:arcade` ✓
- `npm run build` → `docs/` ✓

## Status
**MERGEABLE CLEAN** — ready for CoS merge after green. Do NOT merge from this hop. Do NOT wake Shot.
