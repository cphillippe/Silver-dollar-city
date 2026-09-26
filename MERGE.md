# 1.4.266 Easy Father Dash tall residual cream (Fixes #366)

**Branch:** `fix/366-easy-father-dash-tall-residual` → `main`
**Status:** Not merged. Do not wake Shot (wake at 1.4.270).

## What changed
Easy Father Dash left a purple void between the timing slider and HOLD TO RUN on tall portrait viewports after the 1.4.257 cream peel. The live DOM is `main.challenge-page.is-puzzle` > `.play.is-father-run` > `.run-speech` + `.run-rail` + `.cta-dock.run-dock`. Those 257 selectors already paint cream at `max-height: 920px`. Above that cap the play keeps its purple-gold gradient and the dock’s auto margin parks the button on that plate.

1.4.266 keeps the 257 rules and adds `@media (max-height: 920px), (min-height: 921px)` in `src/styles/welcome.css` for Easy Father Dash only:

- opaque `#fff6e8` (`background-image: none`) on the full-bleed app-body, puzzle shell, and dash plate
- sunset run-scene stays a fixed art strip
- dark ink on the kicker, caption, score, and speech; timing rail stays visible
- HOLD TO RUN pinned with `margin-top: auto` on a cream floor

The play topbar stays the purple dusk wash. Android `versionName` stays `1.4.113`. `docs/` is synced from `dist/` and `qa-seed.html` is preserved.

## Checks
- `npm run test:city`
- `npm run test:css`
- `npm run test:core`
- `node scripts/check-panel-blast.mjs`
- `npm run build`
- `git diff --check`
