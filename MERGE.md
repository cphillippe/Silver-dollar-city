# ready-easy-fun-clear-197 — 1.4.197 Easy Story Snap ≤720 fill purple void

**PR:** https://github.com/cphillippe/Silver-dollar-city/pull/258
**Branch:** `ship/easy-fun-clear-197` → `main`
**Version:** 1.4.197
**Peel:** `ea520d1` (`ea520d1c52dd5f2b4cfafcb51a695b62b112e147`)
**Tip:** `9d30fb2` (`9d30fb2b19180a77dce1c0889a56bc73c7588c86`)
**Base live:** 1.4.196 (`ceb0d31`, PR #257 Easy Father ≤720 close slider→CTA purple gap on main)
**CoS merges — do NOT merge from this hop.** Manager pings CoS only when mergeable.

## Shot wake
**Do NOT wake Shot from this hop.** CoS wakes Shot on 10th ships (next 1.4.200); this hop does not ping Shot. Keep inventing toward that.

## How picked
Open Issues: **#161** Dig/Hard/NW/Town parked. **#160** cheap-hop infra. No open Easy Fun/Clear issue.
1.4.196 Easy Father slider→CTA live on main. Shot 190 fails #250–#253 already peeled as 193–196 — do NOT re-peel.
Invent Fun/Clear — densest remaining Easy trail different from recent Match/LockIn/Father/Hold/Creed/Story Creek/Sort/Build/Link/Samaritan: **Easy Story Snap** had HUD peel **1.4.182** / compress **1.4.152** / teach-omit **1.4.163** only — capped `snap-stage` (min-height 8.5rem) hugs the top so the gold card leaves empty purple under the Hold pad (Match 184 / Creed 192 / Story Creek 191 fill family).

## Chosen climb
Single Easy Fun/Clear polish: **Easy Story Snap ≤720 fill purple void** — grow `play.is-story-snap` shell + stretch `snap-stage` so strip · stage · pad fill the portrait.

## What fixed
- `src/styles/storySnap.css`: `@media (max-height: 720px)` — `.play.is-story-snap` `flex: 1 1 auto`; `.snap-stage` `flex: 1` + `min-height: 0` (overrides capped 8.5rem); strip / score / pad / CTA stay `flex: 0`; HUD 182 hide eyebrow/who·where stays
- `src/components/challenges/StorySnapPlayView.tsx`: thin 1.4.197 comment
- Android `versionName` left at **1.4.113**
- Version **1.4.197** atop live **1.4.196**

## Deferred (do NOT climb this hop)
- Dig Reveal / Hard / NW / Town / stores / Pack B / Home map candy
- Match 193 / Lock In quiz 194 / Lock In feedback 195 / Father 196 / Hold arena 190 / Creed 192 / Story Creek 191 / Sort 183 / Build / Link / Samaritan / Manage / letterbox (already on main)
- Journal held clear chrome further peel
- Story Snap HUD peel 1.4.182 / compress 1.4.152 / teach-omit 1.4.163 (different surface; still applies ≤720)

## Gemini
MODEL=gemini-flash-latest — Invent Fun/Clear (no open Easy Fun/Clear issue). Invent API key present but not AIza AI Studio shape. Manager-steered invent. Notes: `notes-gemini.txt` (+ `/workspace/silver-city-art/notes-gemini-197.txt`).

## Files peeled
- `src/styles/storySnap.css`
- `src/components/challenges/StorySnapPlayView.tsx`
- `scripts/check-city.mjs`, `scripts/check-panel-blast.mjs`
- `src/config/app.ts`, `package.json`, `package-lock.json`
- `src/content/changelog.ts`
- `notes-gemini.txt`
- `docs/` (Pages rebuild `index-CIZYq87t.js` / `index-Cl_8kURm.css`)
- `MERGE.md`

## Checks
- `npm run test:city` ✓
- `npm run test:arcade` ✓
- `npm run build` → `docs/` ✓

## Status
**MERGEABLE CLEAN** — ready for CoS merge after green. Do NOT merge from this hop. Do NOT wake Shot.
