# 1.4.270 Easy one-more win-end dock invent (Shot wake)

**Branch:** `fix/270-easy-fun-clear-invent-shot-wake` → `main`
**Status:** Not merged. Do not wake Shot.

## Shot wake 1.4.270
Manager/CoS wakes Shot pack 1.4.270 after merge. This hop does NOT run vision or wake Shot.

## What changed
After an Easy win, the one-more / continue dock was still quiet on tall phones. Dock compress from the ≤720 peels (Lock In triad→Home, picture-Match score→CTA) stopped at 920, Match demoted “One more Match”, and Snap left “One more snap” as a text link.

1.4.270 adds `@media (max-height: 920px), (min-height: 921px)` in `src/styles/matchWin.css` for Easy win-end docks only:

- Match gem win: “One more Match” is an arcade-gold CTA; the claim stays dark on cream; the win stamp stays a label
- Picture Match win: “Lock In next” punches gold; the board art stays
- Story Snap win: “One more snap” punches gold; the claim stays a readable chip
- Lock In win-end: Home continue punches gold; the triad claim stays light on the card; the ≤720 pack climbs past 920
- Hold win continue stays on the 1.4.268 punch; this hop only keeps that win claim readable

Mid-game HUD, Dig, Hard, Night Watch, Town, stores, and Home map candy stay parked. Android `versionName` stays `1.4.113`. `docs/` is synced from `dist/` and `qa-seed.html` is preserved.

## Checks
- `npm run test:city`
- `npm run test:css`
- `npm run test:core`
- `node scripts/check-panel-blast.mjs`
- `npm run build`
- `git diff --check`
