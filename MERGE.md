# ready-manage-empty-lot-180 — 1.4.180 Manage empty-lot header + compact sheet

**PR:** https://github.com/cphillippe/Silver-dollar-city/pull/234
**Branch:** `ship/manage-empty-lot-179` → `main` (alias `ship/manage-empty-lot-180`)
**Version:** 1.4.180
**Peel:** `deac678` (`deac678355c6690fe83a77fd3aa4404fef13ac2c`)
**Tip:** `e5146df` (`e5146df4c49d86a76a601c4ffaf4f2bf0c88613d`) — plus MERGE tip-note commit on branch head
**Base live:** 1.4.179 (`5f9b148`, PR #229 Easy Home map fills the phone / Fixes #217; atop 1.4.178 Witness #222)
**Fixes:** #232
**CoS merges — do NOT merge from this hop.** Manager pings CoS only when mergeable.

## How picked
Shot-pack climb from 1.4.170 `08-manage-or-snap.png` → issue **#232** (Manage empty lot — header gone / letterbox / dense sheet). Letterbox framing landed as Map **#229** / **1.4.179** on main — kept intact on rebase. Map owns 1.4.178 Witness (+ letterbox 1.4.179) — not claimed. Retargeted Manage empty-lot **1.4.179→1.4.180**.

## Rebase (urgent)
After #229 squash-merged to main (`5f9b148`), GitHub update-branch 422 / PR dirty. Rebased `ship/manage-empty-lot-179` onto `origin/main`:
- Kept Manage empty-lot peel (Hub `is-empty-lot` topbar restore; MindMap compact empty-lot sheet)
- Kept Map letterbox / Home (`fillStage`, CityMap, cityModel, city.css) from main
- **APP_VERSION / package version stayed 1.4.180** (changelog 1.4.180 atop 1.4.179)

## Chosen climb
Single Easy Clear polish per **#232**: **Manage empty-lot header restore + compact Place·Person·Tool sheet**.

## What fixed
- `src/components/Hub.tsx`: `is-empty-lot` when `appliedTier(mindPlot)===0` (Easy Home + Town); `fillStage` from 1.4.179 kept
- `src/index.css`: empty-lot restores AppShell topbar; sheet `max-height: min(30dvh, 280px)`; Place·Person·Tool 3-col row; hug scroll
- `src/components/MindMap.tsx`: `is-empty-lot` class; omit Easy place-sub on empty lot
- Android `versionName` left alone (`1.4.113`)

## Deferred (do NOT climb this hop)
- Dig Reveal / Hard / NW / Town / stores / Pack B
- Map Witness / letterbox (already on main as 1.4.178 / 1.4.179)
- Full-bleed map / snap points peek/half/full JS

## Gemini
`gemini-flash-latest` on `/workspace/silver-city-shots/1.4.170/08-manage-or-snap.png` (AQ. key OK): enormous blank purple letterboxing + cramped scroll-locked bottom sheet — **FAIL** (pre-fix). Notes: `notes-gemini.txt` (+ `/workspace/silver-city-art/notes-gemini-180.txt`).

## Files peeled
- `src/components/Hub.tsx`
- `src/components/MindMap.tsx`
- `src/index.css`
- `scripts/check-city.mjs`, `scripts/check-panel-blast.mjs`
- `src/config/app.ts`, `package.json`, `package-lock.json`
- `src/content/changelog.ts` (1.4.180 atop live 1.4.179 letterbox)
- `notes-gemini.txt`
- `docs/` (Pages rebuild `index-qIrOlqlM.js` / `index-jgc3aF0b.css`)
- `MERGE.md`

## Checks
- `npm run test:city` ✓
- `npm run test:arcade` ✓
- `npm run build` → `docs/` ✓
- GitHub PR: `mergeable: true`, `mergeStateStatus: CLEAN` (confirm after push)

## Status
**MERGEABLE CLEAN** (post-rebase onto 1.4.179) — ready for CoS merge after green. Do NOT merge from this hop.
