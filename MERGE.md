# ready-easy-fun-clear-181 — 1.4.181 Easy Creed merge ≤720 HUD peel

**PR:** https://github.com/cphillippe/Silver-dollar-city/pull/235
**Branch:** `ship/easy-fun-clear-181` → `main`
**Version:** 1.4.181
**Tip:** `50518a6` (`50518a6bc8a7b76595ac7a8e238f8c611078fa01`)
**Base live:** 1.4.180 (`ea09832`, PR #234 Manage empty-lot header + compact sheet; atop 1.4.179 Easy Home letterbox #229)
**CoS merges — do NOT merge from this hop.** Manager pings CoS only when mergeable.

## How picked
Invent Fun/Clear — Gemini flash pick **A** Creed merge ≤720 HUD peel (hide kicker + compress ladder). After Father **1.4.173** / maze **1.4.175** hide-kicker peels, Creed still only tinied kicker (**1.4.159** bowl-first); densest remaining Easy trail Clear chrome.

## Rebase (urgent)
After #234 squash-merged to main (`ea09832`), PR #235 was based on letterbox **1.4.179** and went DIRTY/CONFLICTING. Rebuilt `ship/easy-fun-clear-181` onto `origin/main`:
- Kept Creed merge ≤720 peel (`index.css` hide kicker + rung names; tiny score; ClaimMergePlay comment)
- Accepted Manage empty-lot + letterbox from main (Hub/MindMap/CityMap / 1.4.180 CSS)
- **APP_VERSION / package version stayed 1.4.181** (changelog 1.4.181 atop 1.4.180)

## Chosen climb
Single Easy Fun/Clear polish: **Easy Creed merge ≤720 HUD peel** — hide who·where kicker + ladder rung names; tiny score so candy bowl + Drop chip stay above fold (complements 1.4.159 bowl-first; Father 1.4.173 / maze 1.4.175 hide-kicker family).

## What fixed
- `src/index.css`: `@media (max-height: 720px)` hides `.play.is-claim-merge .story-kicker` + `.merge-rung-name`; tinies `.merge-score`; keeps Drop chip + lit rung dots; bowl `max-height` from 1.4.159 retained; **1.4.180 empty-lot CSS kept from main**
- `src/components/challenges/ClaimMergePlay.tsx`: thin 1.4.181 comment
- Android `versionName` left at **1.4.113**
- Dig / Hard / map candy untouched

## Deferred (do NOT climb this hop)
- Dig Reveal / Hard / NW / Town / stores / Pack B
- Manage empty-lot / Home letterbox (already on main as 1.4.180 / 1.4.179)
- Story Snap ≤720 eyebrow/who-where further peel / Journal held clear chrome

## Gemini
MODEL=gemini-flash-latest — invent pick A approved. Notes: `notes-gemini.txt`.

## Files peeled
- `src/index.css`
- `src/components/challenges/ClaimMergePlay.tsx`
- `scripts/check-city.mjs`, `scripts/check-claim-merge.mjs`, `scripts/check-panel-blast.mjs`
- `src/config/app.ts`, `package.json`, `package-lock.json`
- `src/content/changelog.ts` (1.4.181 atop live 1.4.180)
- `notes-gemini.txt`
- `docs/` (Pages rebuild)
- `MERGE.md`

## Checks
- `npm run test:city` ✓
- `npm run test:arcade` ✓
- `npm run build` → `docs/` ✓
- GitHub PR: `mergeable: true`, `mergeStateStatus: CLEAN` (confirm after push)

## Status
**MERGEABLE CLEAN** (post-rebase onto 1.4.180) — ready for CoS merge after green. Do NOT merge from this hop.
