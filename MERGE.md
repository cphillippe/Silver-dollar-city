# ready-manage-empty-lot-180 — 1.4.180 Manage empty-lot header + compact sheet

**PR:** https://github.com/cphillippe/Silver-dollar-city/pull/234
**Branch:** `ship/manage-empty-lot-179` → `main` (alias `ship/manage-empty-lot-180`)
**Version:** 1.4.180
**Commit:** `f7303e7` (`f7303e7ca895c48a5c9d7618204e60fe7794a941` tip; peel `e7d1397`)
**Base live:** 1.4.178 (`60150e2`, PR #222 Witness Square candy hall on main; atop 1.4.177 #233)
**Fixes:** #232
**CoS merges — do NOT merge from this hop.** Manager pings CoS only when mergeable.

## How picked
Shot-pack climb from 1.4.170 `08-manage-or-snap.png` → issue **#232** (Manage empty lot — header gone / letterbox / dense sheet). Letterbox framing remains Map **#217** / **1.4.179** — not climbed. Map owns 1.4.178 Witness (+ letterbox 1.4.179) — not claimed. Retargeted Manage empty-lot **1.4.179→1.4.180**.

## Chosen climb
Single Easy Clear polish per **#232**: **Manage empty-lot header restore + compact Place·Person·Tool sheet**.

## What fixed
- `src/components/Hub.tsx`: `is-empty-lot` when `appliedTier(mindPlot)===0` (Easy Home + Town)
- `src/index.css`: empty-lot keeps AppShell topbar (undo 1.4.167 over-hide for this branch only); sheet `max-height: min(30dvh, 280px)`; Place·Person·Tool 3-col row; hug scroll (no stretch into purple)
- `src/components/MindMap.tsx`: `is-empty-lot` class; omit Easy place-sub on empty lot
- Android `versionName` left alone

## Deferred (do NOT climb this hop)
- Dig Reveal / Hard / NW / Town / stores / Pack B
- Map Witness → **1.4.178** / letterbox → **#217** / **1.4.179** (do not claim)
- Full-bleed map / snap points peek/half/full JS

## Gemini
`gemini-flash-latest` on `/workspace/silver-city-shots/1.4.170/08-manage-or-snap.png` (AQ. key OK): enormous blank purple letterboxing + cramped scroll-locked bottom sheet — **FAIL** (pre-fix). Notes: `notes-gemini.txt` (+ `/workspace/silver-city-art/notes-gemini-180.txt`).

## Files peeled
- `src/components/Hub.tsx`
- `src/components/MindMap.tsx`
- `src/index.css`
- `scripts/check-city.mjs`, `scripts/check-panel-blast.mjs`
- `src/config/app.ts`, `package.json`, `package-lock.json`
- `src/content/changelog.ts` (1.4.180 atop live 1.4.178 Witness)
- `notes-gemini.txt`
- `docs/` (Pages rebuild `index-D7FDBwP7.js` / `index-DoSC5yZC.css`)
- `MERGE.md`

## Checks
- `npm run test:city` ✓
- `npm run test:arcade` ✓
- `npm run build` → `docs/` ✓
- GitHub PR: `mergeable: true`, `mergeStateStatus: CLEAN` (no required checks configured on branch)

## Status
**MERGEABLE CLEAN** — ready for CoS merge after green. Do NOT merge from this hop.
