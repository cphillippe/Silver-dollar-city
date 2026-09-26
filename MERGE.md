# ready-easy-fun-clear-186 — 1.4.186 Easy Samaritan ≤720 fill top-cluster purple void (Fixes #240)

**PR:** https://github.com/cphillippe/Silver-dollar-city/pull/243
**Branch:** `ship/easy-fun-clear-186` → `main`
**Version:** 1.4.186
**Peel:** `ae6ab04` (`ae6ab04fc3b0968fc76ddee32bf8561c1742f992`)
**Tip:** `f38f155` (`f38f1554950ee8e23ab8f94d17b2b303493ca9a7`)
**Base live:** 1.4.185 (`7deb4d2`, PR #242 Easy Lock In ≤720 fill win-end purple void on main)
**CoS merges — do NOT merge from this hop.** Manager pings CoS only when mergeable.

## How picked
Open Issues: **#240** Easy Samaritan top-cluster / bottom half purple void (P1 phone-fail, Shot 1.4.180 `06-samaritan.png`) — this hop.
**#238** Match / **#239** Lock In already on main as 1.4.184 / 1.4.185.
**#161** Dig/Hard/NW/Town parked. **#160** cheap-hop infra.

## Chosen climb
Single Easy Fun/Clear polish: **Easy Samaritan / Sequence order ≤720 fill top-cluster purple void** — grow `play.is-sequence.is-deal` shell + stretch `bank.is-order` stone tiles so instruction · progress · choice chips fill the portrait (Fixes #240).

## What fixed
- `src/styles/sortHold.css`: base `.play.is-sequence.is-deal` `flex: 0 → 1` so gold card fills; `@media (max-height: 720px)` `bank.is-order { flex: 1 1 auto; grid-auto-rows: minmax(0,1fr) }` + stretch chips
- `src/components/challenges/SequencePlay.tsx`: thin 1.4.186 comment
- Android `versionName` left at **1.4.113**
- Version **1.4.186** atop live **1.4.185**

## Deferred (do NOT climb this hop)
- Dig Reveal / Hard / NW / Town / stores / Pack B / Home map candy
- Match 184 / Lock In 185 / Sort 183 / Snap 182 / Creed 181 / Manage 180 / letterbox (already on main)
- Sequence how/lead/hint peel 1.4.171 (different surface; still applies ≤720)

## Gemini
MODEL=gemini-flash-latest — Shot pack 1.4.180 vision FAIL on Samaritan (`gemini-vision.json`). Invent API key present but not AIza AI Studio shape. Manager-steered + issue #240. Notes: `notes-gemini.txt` (+ `/workspace/silver-city-art/notes-gemini-186.txt`).

## Files peeled
- `src/styles/sortHold.css`
- `src/components/challenges/SequencePlay.tsx`
- `scripts/check-city.mjs`, `scripts/check-panel-blast.mjs`
- `src/config/app.ts`, `package.json`, `package-lock.json`
- `src/content/changelog.ts`
- `notes-gemini.txt`
- `docs/` (Pages rebuild `index-DVMgvvC5.js` / `index-W91YziJI.css`)
- `MERGE.md`

## Checks
- `npm run test:city` ✓
- `npm run test:arcade` ✓
- `npm run build` → `docs/` ✓

## Status
**MERGEABLE CLEAN** — ready for CoS merge after green. Do NOT merge from this hop.
