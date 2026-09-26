# 1.4.267 Easy Manage sheet purple bar (Fixes #367)

**Branch:** `fix/367-easy-manage-purple-bar` → `main`
**Status:** Not merged. Do not wake Shot (wake at 1.4.270).

## What changed
Easy Manage lot sheet left a dark purple bar at the bottom-right after the 1.4.258 black-void peel. The live DOM is the body portal `.mind-map.is-manage` > `.mind-map-card`. The card stays `min(100%, 420px)`, and `place-items: unset` drops `align-items: center`, so the plate sits on the left. Width rules from 1.4.230 / 1.4.258 only force `100vw` at `max-width: 430px` or `max-height: 920px`. Above both caps the right gap sits over the hidden Easy Home dock and the dusk body shows through. The 258 `::after` belt is that same strip when the 920 query matches and the plate does not cover it.

1.4.267 keeps the 258 rules and adds `@media (max-height: 920px), (min-height: 921px)` in `src/styles/welcome.css` for the Easy Manage sheet only (`html[data-easy='on']`):

- overlay stretches with `width: auto` and left/right 0 (no `100vw` shift)
- card is full-bleed (`width: 100%`, square bottom, opaque `#241050`)
- safe-area padding sits inside the plate (empty-lot keeps its compact padding)
- the `::after` purple belt is `content: none`

Map peek above the sheet stays. Home map when Manage is closed is unchanged. Android `versionName` stays `1.4.113`. `docs/` is synced from `dist/` and `qa-seed.html` is preserved.

## Checks
- `npm run test:city`
- `npm run test:css`
- `npm run test:core`
- `node scripts/check-panel-blast.mjs`
- `npm run build`
- `git diff --check`
