# 1.4.261 Easy Learn tall residual cream (Fixes #361)

**PR:** https://github.com/cphillippe/Silver-dollar-city/pull/368
**Branch:** `fix/361-easy-learn-tall-residual` → `main`
**Implementation:** `11ec53e56a75665c8e56d63d27a7bc6af258ee29`
**Tip:** `87eb73279d362f09e7594a32abe47b8042ebbe81`
**Status:** MERGEABLE (`mergeStateStatus` CLEAN). Not merged.

## What changed
Easy Learn Short Story (Story Creek) left a purple void under the lesson on tall portrait viewports after the 1.4.252 cream peel. The live DOM is `main.challenge-page.is-teach` > `section.recall-gate.is-encode.teach-gate.easy-story-card`. Those 252 selectors already paint cream at `max-height: 920px`. Above that cap the card stays transparent over the dusk gradient and the lesson hugs the top.

1.4.261 keeps the 252 rules and adds `@media (max-height: 920px), (min-height: 921px)` in `src/styles/welcome.css` for this teach chrome only:

- opaque `#fff6e8` (`background-image: none`) on the full-bleed app-body, teach shell, story card, and dock
- dark ink `#2a2118` on claim / reason / source
- Help on the road and Skip reading pinned with `margin-top: auto` on a cream dock wash

The play topbar stays the purple dusk wash. Android `versionName` stays `1.4.113`. `docs/` is synced from `dist/` and `qa-seed.html` is preserved.

## Checks
- `npm run test:city`
- `npm run test:css`
- `npm run test:core`
- `node --experimental-strip-types scripts/check-panel-blast.mjs`
- `npm run build`
- `git diff --check`
