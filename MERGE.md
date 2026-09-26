# 1.4.265 Easy Samaritan tall residual cream (Fixes #365)

**Branch:** `fix/365-easy-samaritan-tall-residual` → `main`
**Status:** Not merged. Do not wake Shot (wake at 1.4.270).

## What changed
Easy Samaritan / Story Creek mercy maze left purple voids between the HUD, the road board, and the find-line footer on tall portrait viewports after the 1.4.256 cream peel. The live DOM is `main.challenge-page.is-puzzle` > `.play.is-road-maze` > `.maze-beats` + `.maze-stage` > `.maze-board` + `.match-score`. Those 256 selectors already paint cream at `max-height: 920px`. Above that cap the play keeps its purple-gold gradient and the aspect-capped board sits in a transparent stage.

1.4.265 keeps the 256 rules and adds `@media (max-height: 920px), (min-height: 921px)` in `src/styles/welcome.css` for Easy Samaritan / road-maze only:

- opaque `#fff6e8` (`background-image: none`) on the full-bleed app-body, puzzle shell, play, maze-stage, and maze-board plate
- dark ink on the kicker, caption, and score so HUD and footer stay readable
- find-line / win dock pinned with `margin-top: auto` on a cream floor
- road tiles and target chips keep their own faces

The play topbar stays the purple dusk wash. Android `versionName` stays `1.4.113`. `docs/` is synced from `dist/` and `qa-seed.html` is preserved.

## Checks
- `npm run test:city`
- `npm run test:css`
- `npm run test:core`
- `node scripts/check-panel-blast.mjs`
- `npm run build`
- `git diff --check`
