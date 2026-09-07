# Playtest — Silver City: Unending Evidence

Two bars, scored equally. A dry lesson that nobody finishes fails. A candy puzzle that leaves no claim behind also fails.

| Bar | Question |
| --- | --- |
| **Fun / polish** | Would you open this again tonight? Snappy? Clear? Delightful? |
| **Evidence retention** | After the page folds, can you say the **claim** and **one reason**? |

## Session (required coverage)

1. Cold open — is the goal obvious in 15 seconds?
2. Today’s Trail + fold/recall.
3. **Parable Hollow end-to-end** (sequence, sort, match, sort).
4. **Witness Bench** — at least two challenges.
5. Journal — does it feel rewarding?
6. Daily / streak / stars / dust-off if due.
7. Mobile ~390px and desktop.
8. Fail on purpose, peek, reload — progress stays.

## Self-test

Close the teaching. Speak: **claim**, **one reason**, **source** if you can. Mark pass / thin / gone.

## What we actually played (2026-09-07)

Fresh browser pass on the production preview, then a second pass on the dev server after a Keep/Toss fix.

| Walk | Result |
| --- | --- |
| Cold open | Goal is obvious: *Play a short puzzle. Fold the page. Keep one claim you can still say tomorrow.* |
| Daily Trail · Come and rest | Sequence solved; recall completed; streak 1; tomorrow teaser shown. |
| Hollow · Jericho (sequence) | First-miss: shake + “try the chain again,” no essay dump. Then solved + recall. |
| Hollow · Father’s run (sort) | First Keep/Toss (bin-only) **blocked** testers — tiles did not land. **Fixed:** each tile has Keep / Toss; bins auto-check when full. Re-test: pass. |
| Hollow · Pictures of the kingdom (match) | All four pairs; peek labeled as not clean. |
| Hollow · Unpayable account (sort) | Keep-only the contradiction line. Pass with new buttons. |
| Bench · What Paul received | Creed order (died, buried, raised, appeared). Pass. |
| Bench · Why historians call it early | Keep the careful dating claim. Pass. |
| Journal |  After Hollow + two Bench walks: unsealed pages, mystery trail notes, Held count, face-down rebuild. Felt like a dossier, not a trophy case. |
| Reload | Progress persisted (streak, held, journal). |
| Mobile ~390px | Hub/nav readable; no overflow on the trail card. |
| Spaced dust-off (earlier same-day pass) | Hub *Time to dust off this one*; Journal *Due this morning*; Jericho resurfaced; 1★ → 3★ after rest + say-back. |

## Cold open re-test (this pass)

New user, storage cleared. **Clarity 5/5** in ≤15s.

- Purpose, quoted: *Silver City is a puzzle trail: play a short game, fold the page, and keep evidence you can still say tomorrow.*
- Who: *River and Juniper are Christian companions on this trail. You walk as River; Juniper keeps the first lamp with you.*
- **One** button: **Begin the trail**. No duplicate Continue. No map, no district list.
- Begin goes to today’s short puzzle, not the five-district map.

## Rubric

| Bar | Score | Notes |
| --- | --- | --- |
| Fun / “one more puzzle” | 4/5 | Sequence and match pull you forward. Sort was the bounce until Keep/Toss sat on the tile. |
| Clarity | 5/5 | Cold open states the product in one line; one Begin button; map waits until after a walk. |
| Learning lock-in | 5/5 | Fold → claim → reason, journal face-down, later dust-off of the same walk. |
| Pacing | 4/5 | Daily ~a minute. “I’ll say it later” keeps a four-puzzle district from stalling. |
| Tone | 5/5 | Invite, not a pew. Dust-off never shames the gap. |
| Polish / bugs | 4/5 | Keep/Toss blocker is fixed. Reload holds. Old service-worker cache on a reused localhost port can lie — friends on a fresh host are fine. |
| Return hook | 5/5 | Tomorrow teaser, mystery trail notes, due pages, streak without guilt. |

## Bounce points (ranked)

1. **Keep/Toss drop** — tap-bin-only failed testers (blocking). **Shipped:** Keep/Toss on each tile; bin still accepts a selected tile; auto-check when full; tap a binned line to pull it back.
2. **Goal in 15 seconds** — story lede was pretty but slow. **Shipped:** gold line on welcome.
3. **Public play URL** — Pages needs an owner toggle; first tunnel was blocked by Vite `allowedHosts`. **Shipped:** `allowedHosts: true`; live tunnel; StackBlitz preview URL; `docs/` + Pages one-click.
4. **Peek / clean stars** — peek now says it will not count as clean.
5. **Match remaining pairs** — `N left` is on the board.

## Follow-up (2026-09-07, after 4/5 clarity)

1. **Local date / device-day footer** — Pretty weekday uses local getters + local noon. Under the trail date: `Device day · YYYY-MM-DD` from `localDateKey()`. **If that key is still yesterday while your wall clock is today, the browser/`Date` is on yesterday** (frozen VM clock, wrong OS timezone). The app is reading the device, not UTC.
2. **Cast on welcome** — River and Juniper named as Christian companions on the first screen.
3. **Keep / Toss** — Keep = belongs, Toss = set aside. Peek line is always visible: *won’t count as a clean recall.*
4. **~390px overflow** — Topbar wraps (Reset stays on-screen). Headings/chips/journal wrap. No horizontal scroll.
5. **Miss copy** — Sequence names the step that broke; first miss is a nudge, second miss still folds in `teachOnWrong`. Kicker is *Not yet*, not *Think again*.
6. **Fun 4/5 delight** — Goal bar no longer covers Keep/Toss (shell scrolls in the body). Miss shake is punchier. Say-back is a bonus snap with Skip always visible; correct chip still grants elaboration. Sort tiles (Keep/Toss) sit above the bins so the first tap is the game. Snap-the-bins is an explicit lock (no silent auto-commit); miss shake holds ~0.8s.

## What still sucks

1. Four-puzzle districts plus say-back every time is a long sitting. Skip must stay.
2. GitHub Pages is the nicest durable URL but **only the repo owner can flip Settings → Pages**. Until then use the live Chrome tunnel.
3. Debug APK sideload is still worse than a web link for friends.
4. A stale service worker on `localhost:4173` can serve yesterday’s JS to a tester. Hard-reload or use a new host.

## Tone

Warm. Missing a day: *the trail waits*. A rested page: *Time to dust off this one.* Never “you failed.”
