# 1.4.269 Easy Story Snap residual juice invent

**Branch:** `fix/269-easy-fun-clear-invent` → `main`
**Status:** Not merged. Do not wake Shot (wake at 1.4.270).

## What changed
Story Snap on tall phones (~390×844) still used the 1.4.182 HUD compress (strip · chip) only at `max-height: 720px`, so the SNAP pad and score stayed quiet while full-size chips sat beside the board. 1.4.269 adds `@media (max-height: 920px), (min-height: 921px)` in `src/styles/storySnap.css` for Easy Story Snap chrome only:

- strip · chip compress climbs past the 720 cap
- SNAP pad and win dock CTA punch gold
- score is a gold pill; a miss turns score, toast, and stage border pink and shakes louder
- miss / snap toast overlays the stage so it does not push the beat lane

Hold, Father Dash, Match, Lock In, Samaritan, and Manage stay on their peels. Android `versionName` stays `1.4.113`. `docs/` is synced from `dist/` and `qa-seed.html` is preserved.

## Checks
- `npm run test:city`
- `npm run test:css`
- `npm run test:core`
- `node scripts/check-panel-blast.mjs`
- `npm run build`
- `git diff --check`
