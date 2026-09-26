# ready-easy-fun-clear-195 — 1.4.195 Easy Lock In feedback ≤720 fill purple void (Fixes #252)

**PR:** (pending open)
**Branch:** `ship/easy-fun-clear-195` → `main`
**Version:** 1.4.195
**Peel:** `39976be` (`39976beb4eed82bb42afa417c9bb4a7c215e46fd`)
**Tip:** `4a32420` (`4a324207ef8c199ccf230a9158ef6dda35e9660c`)
**Base live:** 1.4.194 (`7ff1bf6`, PR #255 Easy Lock In quiz ≤720 fill purple void on main)
**CoS merges — do NOT merge from this hop.** Manager pings CoS only when mergeable.

## Shot wake
**Do NOT wake Shot from this hop.** CoS wakes Shot on 10th ships (next 1.4.200); this hop does not ping Shot.

## How picked
Open Issues: **#252** Easy Lock In feedback / miss teach ≤720 bottom purple void still (P1 phone-fail, Shot 1.4.190 `05-easy-lockin-miss.png`) — this hop.
**#253** Father — deferred next climb; do not pack. **#250** Match / **#251** Lock In quiz already on main as 1.4.193 / 1.4.194.
**#161** Dig/Hard/NW/Town parked. **#160** cheap-hop infra.

## Chosen climb
Single Easy Fun/Clear polish: **Easy Lock In feedback / miss teach ≤720 fill purple void** — grow `app-body` · `journal.is-rehearse` · `rehearse-anchor` · `recall-gate` + stretch `why-miss-teach` so Main idea · why-true · From · Try again fill the portrait (Fixes #252). Win-end StoredLine 1.4.185 / quiz shell 1.4.194 / Hold arena 1.4.190 untouched — different peel target.

## What fixed
- `src/styles/sortHold.css`: `@media (max-height: 720px)` — Easy Lock In miss teach: `app-body:has(.journal.is-rehearse .why-blast.is-miss-teach)` flex fill; `journal` / `rehearse-anchor` / `recall-gate.is-easy-hold` `flex: 1 1 auto`; `.why-blast.is-miss-teach .why-miss-teach` stretch + `justify-content: center`
- `src/components/challenges/WhyBlastPlay.tsx`: thin 1.4.195 comment
- Android `versionName` left at **1.4.113**
- Version **1.4.195** atop live **1.4.194**

## Deferred (do NOT climb this hop)
- Dig Reveal / Hard / NW / Town / stores / Pack B / Home map candy
- **#253** Father slider→CTA
- Match 193 / Lock In quiz 194 / Hold arena 190 / win-end StoredLine 185 / Creed 192 / Story Creek 191 / Build / Link / Father Dash / Samaritan / Sort / Snap (already on main or other issues)

## Gemini
MODEL=gemini-flash-latest — Shot pack 1.4.190 vision FAIL on Lock In feedback (`gemini-vision.json` / `05-easy-lockin-miss.png`). Invent API key present but not AIza AI Studio shape. Manager-steered + issue #252. Notes: `notes-gemini.txt` (+ `/workspace/silver-city-art/notes-gemini-195.txt`).

## Files peeled
- `src/styles/sortHold.css`
- `src/components/challenges/WhyBlastPlay.tsx`
- `scripts/check-city.mjs`, `scripts/check-panel-blast.mjs`
- `src/config/app.ts`, `package.json`, `package-lock.json`
- `src/content/changelog.ts`
- `notes-gemini.txt`
- `docs/` (Pages rebuild `index-CpukNI8a.js` / `index-Qsev-pH5.css`)
- `MERGE.md`

## Checks
- `npm run test:city` ✓
- `npm run test:arcade` ✓
- `npm run build` → `docs/` ✓

## Status
**MERGEABLE CLEAN** — ready for CoS merge after green. Do NOT merge from this hop. Do NOT wake Shot.
