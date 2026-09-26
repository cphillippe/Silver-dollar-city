# ready-easy-fun-clear-210 — 1.4.210 Easy Hold ≤720 close hud→arena purple gap

**PR:** (pending)
**Branch:** `ship/easy-fun-clear-210` → `main`
**Version:** 1.4.210
**Peel:** (pending)
**Tip:** (pending)
**Base live:** 1.4.209 (`0ca08c4`, PR #270 Easy Story Snap ≤720 close pad→CTA purple gap on main)
**CoS merges — do NOT merge from this hop.** Manager pings CoS only when mergeable.

## Shot wake
**This hop IS the every-10 Shot wake version (1.4.210)** — same pattern as 1.4.200 / 1.4.190. Ship normal invent; **do NOT wake Shot from this hop**; **do NOT run Gemini vision**. CoS wakes Shot after merge. Pack 200 still 7/8 Match pending — Manager handles vision when complete.

## How picked
Open Issues: **#161** Dig/Hard/NW/Town parked. **#160** cheap-hop infra. No open Easy Fun/Clear issue.
1.4.209 Easy Story Snap pad→CTA live on main. Shot 190 fails #250–#253 already peeled as 193–196 — do NOT re-peel. Story Snap grow 197 / Sort 198 / Link 199 / Creed 200 / Story Creek 201 / Hold dock 202 / Build 203 / Father 204 / Sequence 205 / Learn 206 / Match 207 / StoredLine 208 / Snap2 209 invents already on main.
Invent Fun/Clear — densest remaining Easy trail different from 197–209: **Easy Hold (WhyBlast live)** — after fill **1.4.190** / dock **1.4.202**, gap:6px / arena gap:8px still leave purple between next-tap hud and claim·chips.

## Chosen climb
Single Easy Fun/Clear polish: **Easy Hold ≤720 close hud→arena purple gap** — tighten why-blast + why-arena + hud gaps so next-tap · claim · chips pack tight.

## What fixed
- `src/styles/sortHold.css`: `@media (max-height: 720px)` — `.why-blast` `gap: 2px`; `.why-arena` `gap: 4px`; `.why-blast-hud` `gap: 2px`; fill 190 / dock 202 stay
- `src/components/challenges/WhyBlastPlay.tsx`: thin 1.4.210 comment (Shot wake)
- Android `versionName` left at **1.4.113**
- Version **1.4.210** atop live **1.4.209** (Shot wake version)

## Deferred (do NOT climb this hop)
- Dig Reveal / Hard / NW / Town / stores / Pack B / Home map candy
- Snap2 209 / StoredLine 208 / Match 207 / Learn 206 / Sequence 205 / Father 204 / Build 203 / Hold dock 202 / Story Creek 201 / Creed 200 / Link 199 / Sort 198 / Snap grow 197 / letter-grid 193 / Lock In quiz 194 / Lock In feedback 195 / Manage / letterbox (already on main)
- Hold fill 190 / arena-first 170 (different surface; still applies ≤720)
- Shot vision / waking Shot (CoS after merge; Manager)

## Gemini
MODEL=gemini-flash-latest — Invent Fun/Clear (no open Easy Fun/Clear issue). Invent API key present but not AIza AI Studio shape. Manager-steered invent. Notes: `notes-gemini.txt` (+ `/workspace/silver-city-art/notes-gemini-210.txt`). Do NOT run Shot vision this hop — CoS wakes Shot after merge.

## Files peeled
- `src/styles/sortHold.css`
- `src/components/challenges/WhyBlastPlay.tsx`

## Checks
- `npm run test:city` OK
- `npm run test:arcade` OK
- `npm run build` → `docs/` synced (qa-seed.html preserved)
- Android versionName **1.4.113** unchanged

## Mergeability
(pending)
