# Playtest — Silver City: Unending Evidence

Two bars, scored equally. A dry lesson that nobody finishes fails. A candy puzzle that leaves no claim behind also fails.

| Bar | Question |
| --- | --- |
| **Fun / polish** | Would you open this again tonight? Snappy? Clear? Delightful? |
| **Evidence retention** | After the page folds, can you say the **claim** and **one reason**? |

## Release smoke (short)

Run before a public URL or APK drop. Do not skip the retention chrome.

1. Cold open → 60-second lead **before** companions → Begin the trail → Daily puzzle (Goal + today’s idea) → fold → takeaway. Footer absent on Trail. Then Map: mostly empty town, east porch glowing.
2. Hub overworld: complete walks and watch Hollow / Bench / lamps construct. Grown city has lit roofs and a gold “build next” ring.
2. Hub: “Progress saved on this device”. Settings → Export JSON, copy share code, Import pasted code (use a second browser profile or reset+import). Stars/journal/Daily survive.
3. Two Hollow walks unlock Witness. Star key readable: `1★ first walk · 2★ held after a rest · 3★ held and said back`.
4. Journal: no What’s-next footer; due cards + takeaway copy at the top when a line is due.
5. Settings → Show placeholders: hub banner and between-districts appear; Trail/Journal still have no ad over Keep/Toss or the takeaway. Hide slots again for playtest.
6. Reload / Android APK: same save key; version in Settings matches `package.json`.
7. `npm test` and `npm run android:apk`.

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
3. **Public play URL** — Pages needs an owner toggle; first tunnel was blocked by Vite `allowedHosts`. **Shipped:** `allowedHosts` allowlist (localhost + `.trycloudflare.com`), not `true`. Tunnel `vite preview` on **127.0.0.1** — do not expose `vite --host` / the dev server on a public tunnel.
4. **Peek / clean stars** — peek now says it will not count as clean.
5. **Match remaining pairs** — `N left` is on the board.

## Follow-up (2026-09-07, after 4/5 clarity)

1. **Local date / device-day footer** — Pretty weekday uses local getters + local noon. Under the trail date: `Device day · YYYY-MM-DD` from `localDateKey()`. **If that key is still yesterday while your wall clock is today, the browser/`Date` is on yesterday** (frozen VM clock, wrong OS timezone). The app is reading the device, not UTC.
2. **Cast on welcome** — River and Juniper named as Christian companions on the first screen.
3. **Keep / Toss** — Keep = belongs, Toss = set aside. Peek line is always visible: *won’t count as a clean recall.*
4. **~390px overflow** — Topbar wraps (Reset stays on-screen). Headings/chips/journal wrap. No horizontal scroll.
5. **Miss copy** — Sequence names the step that broke; first miss is a nudge, second miss still folds in `teachOnWrong`. Kicker is *Not yet*, not *Think again*.
6. **Fun 4/5 delight** — Goal bar no longer covers Keep/Toss (shell scrolls in the body). Miss shake is punchier. Say-back is a bonus snap with Skip always visible; correct chip still grants elaboration. Sort tiles (Keep/Toss) sit above the bins so the first tap is the game. Snap-the-bins is an explicit lock (no silent auto-commit); miss shake holds ~0.8s.

## Retention pass (2026-09-07, Fun 5 / Clarity 5 / Retention 3)

Playtest said evidence retention is the remaining gap, and the footer still ate Keep/Toss/Snap on short viewports.

1. **Puzzle chrome** — The What’s next footer **collapses on Trail and challenge screens**. Short heights (~390–430px and short laptops) also shrink the top bar and hide Say/Landmark during the puzzle so Keep/Toss and Lock in the sort stay on-screen.
2. **Takeaway, above the fold** — After a solve, the puzzle and burst chrome fold away. Choose the one-sentence takeaway you can repeat tomorrow, then choose why it stands. Claim chips first (no extra Fold-the-page tap). A snapped claim echoes in large type, then stays visible while you pick the reason.
3. **Witness Bench** — Unlocks after **two** Parable Hollow walks, not Unpayable. Hub copy: *Two Hollow walks open this.*
4. **Journal Next recommended** — If a page is due (or waiting), the button is the takeaway line and jumps straight into that claim rebuild, not a long journal scroll.

## What still sucks

1. Four-puzzle districts plus say-back every time is a long sitting. Skip must stay.
2. GitHub Pages is the nicest durable URL but **only the repo owner can flip Settings → Pages**. Until then use the live Chrome tunnel.
3. Debug APK sideload is still worse than a web link for friends.
4. A stale service worker on `localhost:4173` can serve yesterday’s JS to a tester. Hard-reload or use a new host.

## Immersion pass (2026-09-07)

Fun path toward 5: the hub should feel like coming home to a place, not a menu with a map skin.

- **Town reacts:** Built!/Lit! overlay names the person who lives there. Real portraits stand on plots with speech bubbles; walkers on the street; extra oaks/windows as a district fills; porch smoke when the lamp is up. Empty lots are earth and timber, not HUD dashes.
- **In-world lines:** short `TOWN_VOICE` (Juniper, Mercy, Silas…) — not dump walls. District pages dropped the intro essay; guide `Say` + one blurb stay.
- **Post-win:** after takeaway/reason, a character meets you with “See the town” (or the next roof on the same street). Recall/Journal/Daily dust-off unchanged.
- **Less chrome:** no star-key dump on the hub; Map tab is Town; street directory is tucked under **Who lives where**; puzzle goal lives in the lead line, not a second paragraph.

## Fun pass (2026-09-07, Fun 4 → 5)

Playtest: town only breathed lightly; scroll/text killed the climb.

- **Every win returns to town.** No skip to the next puzzle. Takeaway → why it stands → **See the town**. The one-more is the glowing roof.
- **Town moves:** camera punches in, roof pops, NPCs bounce. Mid-district walks play **Grew!** (new oak / window) even when the stage stays Built. Flags, creek, lamps, folk keep moving while you sit on the hub. Celebrate animations (sprout / wave / roof kick) beat idle sway so the lot actually jumps.
- **Shorter post-win:** chips, then one fat See-the-town button. No essay card. No win-dump panel. Hub hides the What’s-next footer. Glowing roof skips the district list and opens the next walk.

Retention still: sort → takeaway chip → why it stands → journal / spaced dust-off.

## Fun pass (lock-in juice, 2026-09-07)

Bill: Keep/Toss + Lock-in stay. Fun has to hit like a mobile match game.

- **One screen:** first sort fits the viewport. Title is screen-reader only. Clue is a text link. Keep/Toss is one short line. No “Won’t count as clean” until you peek.
- **Lock-in explosion:** on success a gold **Locked!** stamp hits, the board flashes, a shock ring expands, tiles pop and fly clear, sparks burst (~1.3s), then short takeaway chips. Reading chrome hides during the burst. Progress saves after the juice so the board is not remounted mid-pop.
- Town still grows after **See the town**. The dopamine spike is the lock-in burst, not a wall of text.

Retention still: sort → takeaway chip → why it stands → journal / spaced dust-off.

## Fun + Learner pass (2026-09-07)

Closed playtest: Fun 4 · Clarity 5 · Retention 5 · Learnability 4. Lock-in explode and Trail sort one-screen stayed PASS.

- **Intro + Town one-screen:** cold open no longer stacks a second screen of cast/copy. Town hub kills the nested page scroll — map fills, Who-lives-where stays folded.
- **Keep/Toss unmistakable:** Keep = belongs (green), Toss = a distractor (cedar). Bins say it. Clue stays optional.
- **Return hook:** coming back to Town plays **Still lit** (camera punch, lamps, folk) and a short “lamp waits tomorrow” line. Growth is visible, not a label dump.
- Lock-in stamp holds a gold seal-glow; explode stays.

Retention still: sort → takeaway chip → why it stands → journal / spaced dust-off.

## Stop-ship: truthful takeaway (2026-09-07)

Clarity fell 5 → 3 when post-win chips inverted a just-kept line (Night air: “Wonder and measurement can share a roof” expanded into “Wonder is the enemy of science”).

- **Encode (right after lock-in):** claim chip is only `brief.claim`; Why-it-stands chip is only `brief.reason`. No shuffled inversions on the first hold.
- **Review / dust-off:** decoys stay, but they are not word-flips of the keep tiles.
- **Sort grid:** Keep/Toss leaves holes — tile seats do not reflow.
- **Return copy:** built/lit lots say **Still lit** / held, not Keep building.

Done when a cold player’s locked takeaway and the Why-it-stands chip say the same idea.

## Fun climb: locked seats (2026-09-08)

Copy-truth PASS. Fun 4 · Clarity 5 · Retention 4 · Learnability 4. Do not regress encode chips.

- **Seats stay put:** 2×2 tracks are fixed (`--sort-seat`). Keep/Toss leaves a same-size chair (green Keep / cedar Toss tint). Bins cannot grow into the board mid-sort.
- Lock-in explode, one-screen intro/Town, Still lit, Keep · belongs / Toss · aside stay.
- Light Learner mark: ✓ on Keep, × on Toss — no extra reading.

Done when tile positions stay predictable through a Keep/Toss and Night air copy-truth still holds.

## Takeaway ownership (2026-09-08)

Board-wide: after several Keeps, one line became the takeaway with no say. Felt picked-for.

- **Encode:** if more than one Keep has a why, tap which Keep is today’s takeaway, then Why-it-stands for **that** line.
- Seats stay put. Copy-truth stays. Lock-in explode stays.
- Silent auto-pick is gone on multi-Keep sorts.

Done when a cold player can say why THAT claim is the takeaway and rehearse it without feeling picked-for.

## Seat ghosts + Keep-pick air (2026-09-08)

Ownership PASS. Learner: seats reflowed again (empty chairs + hiding the board after the last Keep).

- **Ghosts stay in the chair** — dimmed Keep/Toss text, same-size seat. Board is not `display: none` on ready.
- **Keep-pick** chips have more padding and gap. Lock-in hold is 1100ms — explode stays.
- Ownership and copy-truth stay.

Done when seats stay put again and Keep-pick isn’t cramped.

## Every-path seats + first-beat affordance (2026-09-08)

Playtest: Fun 5 · Clarity 5 · Retention 5 · Learnability 4. Night air ghosts, Keep-pick air, lock-in ~1.1s, tap-the-Keep, copy-truth stay.

Learner: seats were stable on Night air only. Mercy / Hollow (Jericho order) packed remaining stones.

- **Every sort/order path** uses locked same-size ghost seats — Hollow sequence, Keep/Toss, and build-a-chain. Tiles do not pack.
- **First sequencing beat:** **1 · 2 · 3** tap the next stone. The next number glows. No extra essay.

Done when Learner can pass seats on Hollow/mercy and the first beat feels less like homework.

## First order as a game (2026-09-08)

Playtest: Fun 5 · Clarity 5 · Retention 5 · Learnability 4. Jericho seats PASS. Ownership / copy-truth / Fun 5 stay.

Learner: five face-up sentences still felt like a quiz.

- **Two live stones:** the next beat plus one decoy. Face-down chairs hold the rest. No pack.
- **1 2 3 4 5** HUD: the next number beats gold. The empty chair pulses. Live stones glow.
- A wrong tap shakes; the right stone is always among the two. No extra essay. Fold still keeps claim / reason / source.

Done when first sequencing feels playful enough for Learnability 5.

## Teach before the test (2026-09-08)

Usage tight. Observatory Premise 2 broke the screen (slot grew, board clipped).

- **Any premise order:** build slots are same-size chairs. Filling Premise 2 first cannot blow the layout.
- **Teach first** on Daily Trail (Night air / early trail) and Observatory: claim · reason · source, then Unlock. Dust-off skips the gate.
- Fun 5 seats, ownership, copy-truth, lock-in, Hollow seats stay.

Done when Premise 2 is stable and that path sees teaching before the quiz.

## Buildable town (2026-09-08)

Usage tight. Town was a labeled map. Bill wants a place you BUILD.

- **Build next → something better:** timber, then wood roof, then gold roof / lamps / oaks / windows. Streets pack, then light.
- **Homes:** Juniper, Mercy, Silas, Nora, Ansel, Hope, River stand on their porch when that plot unlocks.
- Teach-before-test, Premise 2 seats, Fun 5, ownership, copy-truth, lock-in stay.

Done when a cold player feels they are upgrading a real town as they learn.

## Block-choice glitches (2026-09-08)

Usage tight. Bill: “Glitches in the block choices” on the buildable-city build.

What glitched:
- **Keep/Toss:** long lines grew the chip and clipped the Keep/Toss hit targets — tap selected the tile instead of Keep.
- **Jericho two-choice:** a new decoy flipped after each beat (cards jumped); taps during shake double-fired; first miss left a stuck wrong state.
- **Observatory slots:** `overflow: auto` stole taps; Premise labels weren’t in the hit target; Unlock could ghost-click the first stone.

What we fixed:
- Seats keep a reserved Keep/Toss row (44px). Chip text clamps. No overlap.
- Decoy stays put until used. Shake locks input. Miss returns to idle.
- Slots clip (no scroll-steal). Whole slot including the label is tappable. Unlock arms 360ms.

Seats, teach-first, Premise 2 chairs, town upgrades, ownership, copy-truth, lock-in stay.

Done when block choices feel solid on mobile 390×844.

## Observatory slots fit the phone (2026-09-08)

Bill: the Premise / Conclusion screen does not fit. He cannot tap **Premise 1**.

- Slots sit above the stones. Premise 1 is on-screen first.
- Each slot is one row: label + same-size seat. The board does not scroll; long text scrolls inside a seat.
- Fill any order. Teach-before-test and the town stay.

Done when Premise 1 is tappable on ~390×844 and the screen does not cut off.

## Jericho two-pick (2026-09-08)

Bill: Jericho looked like homework — 1–5 chrome, empty 2×2 ghosts, stacked cards, a vertical empty 1–5 list.

- Progressive orders (4+ stones): slim step dots + **two live stones only**. Ghost chairs and the empty chain stay off-screen.
- Tap one of the two. Decoy still stays until used. Fold claim / reason / source stays.
- Keep/Toss seats, Observatory Premise 1, teach-before-test, town look, ownership, copy-truth — unchanged.

Done when Jericho reads as a clean two-pick game on ~390×844.

## Look climb (2026-09-08)

Bill: “Looks cheap should look most enjoyable.” One look pass. No playtest fan-out.

- Town: warmer dusk, moon, wood/gold roofs, packed-then-lit streets, richer oaks. Upgrade stages unchanged.
- Porch folk: larger portraits, gold ring, lamp glow on lit homes. Avatars warmer, less black-circle.
- Trail / Observatory / Jericho: cream stones, quieter “Tap a stone” / Keep·Toss chrome, slimmer play topbar. Reset stays off the puzzle chrome.
- Seats, teach-before-test, ownership, copy-truth, Lock-in explode, local save — unchanged.

Done when a cold glance feels enjoyable, not cheap.

## Tooling note (npm audit)

`uuid` 7.x via `@capacitor/cli` (GHSA-w5hq-g745-h8pq) is **tooling-only**. Do not `npm audit fix --force` (it wants to downgrade Capacitor). Upgrade when a CLI release pulls `uuid >= 11.1.1`. Details in `SECURITY_REVIEW.md`.

## Tone

Warm. Missing a day: *the trail waits*. A rested page: *Time to dust off this one.* Never “you failed.”
