# 1.4.268 Easy Hold dock arcade punch invent

**Branch:** `fix/268-easy-fun-clear-invent` → `main`
**Status:** Not merged. Do not wake Shot (wake at 1.4.270).

## What changed
Story Creek HOLD on tall phones (~390×844) still used the 1.4.156 HUD compress only at `max-height: 720px`, so the dock CTA and timing juice stayed quiet after the cream quiz plate. 1.4.268 adds `@media (max-height: 920px), (min-height: 921px)` in `src/styles/welcome.css` for Easy Hold dock chrome only (`html[data-easy='on']` live `.why-blast`, not miss-teach):

- HUD gaps and next-tap compress climb past the 720 cap
- score, miss, and LOCKED juice punch gold (or miss pink) on the cream plate
- win dock CTA is a 64px gold button with dark ink
- claim stays dark-ink readable

Father Dash timing rail, Match, Samaritan, Manage, and miss-teach feedback stay on their peels. Android `versionName` stays `1.4.113`. `docs/` is synced from `dist/` and `qa-seed.html` is preserved.

## Checks
- `npm run test:city`
- `npm run test:css`
- `npm run test:core`
- `node scripts/check-panel-blast.mjs`
- `npm run build`
- `git diff --check`
