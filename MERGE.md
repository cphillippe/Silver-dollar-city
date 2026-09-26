# 1.4.264 Easy Lock In feedback tall residual cream (Fixes #364)

**Branch:** `fix/364-easy-lockin-feedback-tall-residual` → `main`
**Status:** Not merged. Do not wake Shot (wake at 1.4.270).

## What changed
Easy Lock In miss feedback left a purple void under NOT QUITE on tall portrait viewports after the 1.4.255 cream peel. The live DOM is `main.journal.is-rehearse` > `.rehearse-anchor` > `section.recall-gate.is-easy-hold` > `.why-blast.is-miss-teach` > `article.why-miss-teach`. Those 255 selectors already paint cream at `max-height: 920px`. Above that cap the feedback plate keeps its purple-gold gradient and the stack hugs the top.

1.4.264 keeps the 255 rules and adds `@media (max-height: 920px), (min-height: 921px)` in `src/styles/welcome.css` for miss/feedback only:

- opaque `#fff6e8` (`background-image: none`) on the full-bleed app-body, miss-teach shell, recall-gate, and why-miss-teach plate
- dark ink `#2a2118` on claim and reason
- Try again pinned with `margin-top: auto` on a cream dock, solid gold so it stays readable
- horizontal overflow pin so the #347 left clip does not return

Live quiz stays on the 1.4.263 peel. The play topbar stays the purple dusk wash. Android `versionName` stays `1.4.113`. `docs/` is synced from `dist/` and `qa-seed.html` is preserved.

## Checks
- `npm run test:city`
- `npm run test:css`
- `npm run test:core`
- `node scripts/check-panel-blast.mjs`
- `npm run build`
- `git diff --check`
