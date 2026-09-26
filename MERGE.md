# ready-easy-fun-clear-182 — 1.4.182 Easy Story Snap ≤720 HUD peel

**PR:** https://github.com/cphillippe/Silver-dollar-city/pull/236
**Branch:** `ship/easy-fun-clear-182` → `main`
**Version:** 1.4.182
**Peel:** (pending commit)
**Tip:** (pending)
**Base live:** 1.4.181 (`2fc3e89`, PR #235 Easy Creed merge ≤720 HUD on main; atop 1.4.180 Manage #234)
**CoS merges — do NOT merge from this hop.** Manager pings CoS only when mergeable.

## How picked
Open Issues scan: **#232** Manage → **1.4.180** on main. **#217** letterbox → **1.4.179** on main. **#231** Learn → **1.4.177**. **#161** parked. No open Easy Fun/Clear P1/P2 left.

Invent Fun/Clear — Gemini flash pick **A** Story Snap ≤720 HUD peel (hide eyebrow + who·where). Explicitly deferred in **1.4.181** MERGE notes. Creed **1.4.181** (#235) already on main — do not reopen / do not duplicate.

## Rebase (urgent)
After #235 squash-merged to main (`2fc3e89`), PR #236 went DIRTY/CONFLICTING (docs rename + version). Rebuilt `ship/easy-fun-clear-182` onto `origin/main`:
- Kept Story Snap ≤720 HUD peel (`storySnap.css` hide eyebrow + who·where; StorySnapPlayView comment)
- Accepted Creed merge 1.4.181 + Manage/letterbox from main
- **APP_VERSION / package version 1.4.182** (changelog 1.4.182 atop 1.4.181)

## Chosen climb
Single Easy Fun/Clear polish: **Easy Story Snap ≤720 HUD peel** — hide title eyebrow + who·where so stage · strip · pad stay above fold (Father 1.4.173 / maze 1.4.175 / Creed 1.4.181 hide-kicker family; complements 1.4.152 compress + 1.4.163 teach-omit).

## What fixed
- `src/styles/storySnap.css`: `@media (max-height: 720px)` `display:none` on `.play.is-story-snap .eyebrow` + `.easy-who-where-line`; keep strip · stage · pad compress from #189
- `src/components/challenges/StorySnapPlayView.tsx`: thin 1.4.182 comment
- Android `versionName` left at **1.4.113**
- Version **1.4.182** atop live **1.4.181**

## Deferred (do NOT climb this hop)
- Dig Reveal / Hard / NW / Town / stores / Pack B / Home map letterbox
- Manage empty-lot / Creed merge HUD (already on main as 1.4.180 / 1.4.181)
- Journal held clear chrome further peel

## Gemini
MODEL=gemini-flash-latest — invent pick A approved. Notes: `notes-gemini.txt` (+ `/workspace/silver-city-art/notes-gemini-182.txt`).

## Files peeled
- `src/styles/storySnap.css`
- `src/components/challenges/StorySnapPlayView.tsx`
- `scripts/check-city.mjs`, `scripts/check-story-snap.mjs`, `scripts/check-panel-blast.mjs`
- `src/config/app.ts`, `package.json`, `package-lock.json`
- `src/content/changelog.ts`
- `notes-gemini.txt`
- `docs/` (Pages rebuild)
- `MERGE.md`

## Checks
- `npm run test:city` ✓
- `npm run test:arcade` ✓
- `node scripts/check-story-snap.mjs` ✓
- `npm run build` → `docs/` ✓

## Status
**MERGEABLE CLEAN** (post-rebase onto 1.4.181) — ready for CoS merge after green. Do NOT merge from this hop.
