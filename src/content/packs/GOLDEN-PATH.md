# Golden path

`golden-path.xml` is the one Easy lesson order and the one filled-gold button on each screen. The app reads it through the pack embed. Area packs do not own this order.

Before you edit, check `package.json` `"version"` and the current `main` commit. Set `<goldenPath appVersion="…">` to the app version this edit ships with.

## Lesson order

Inside `<order>`, one `<line id="…" pack="…"/>` per Easy lesson, top to bottom. Positions 1 and 2 stay `ph-road` and `ph-father`. Every id must be a real lesson, once.

## Screen gold

Inside `<screens>`, one `<screen id="…" gold="…"/>` per screen in the code-known list. A play screen uses `gold="none"`. Every other screen has exactly one gold. These are never gold: `buildThis`, `nightWatch`, and a replay (`oneMore`, `oneMoreRoad`, `oneMoreMatch`, `oneMoreBowl`, `again`, `runAgain`, `digAgain`, `replay`).

Allowed gold for each screen:

| Screen | Allowed gold |
| --- | --- |
| welcome | startEasy |
| home | nextStep |
| read-teach | teachNext |
| sort-done | savePicks |
| maze-win, run-win, merge-win, dig-win, gem-win | lockInNext |
| recall-miss | tryAgain |
| read-recall-done | home |
| run-fail | runRetry |
| maze, run, sort, word-search, merge, dig, quiz, read-recall | none |

`<rules>` : `firstSession readFirst` must stay `false`. `returningDay readFirst` may be `true` (Read is gold on a later day, after a line is held).

## Move fine-tuning to lesson 3

1. Open `golden-path.xml`.
2. Put `<line id="ob-tuning" pack="observatory"/>` directly under `ph-father`.
3. Leave every other line in the same relative order.
4. Set `appVersion` if the app version changed.
5. Run `npm test`.
6. Open a pull request. Do not edit lesson sentences.

## A bad edit

`npm test` fails with a clear message if a lesson id is unknown, duplicated, or missing; if `ph-road` / `ph-father` are not first and second; if a screen id or gold target is unknown; if a non-play screen has no gold or any screen has two; if `buildThis` or `nightWatch` is gold; if the first session is Read-first; if a win screen gold is a replay; or if any XML still has `<easyShelf>`.
