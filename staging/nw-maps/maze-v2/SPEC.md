# maze-v2: more walkers plus one map feature (maps 2–6). Spec only, no art spent

Status: **approved by Manager and tuned** (2026-10-10). See section 7 for the final per-map values. Sections 1–4 are the approved spec; section 5's rough projection is superseded by `sim_table.md`. Maps 7–15 are on hold. A2 and its R5 snapshot are untouched. Nothing is merged or pushed. The repo was read through the GitHub tools at 1.4.442 (`9f36884`).

## 1. Calibration: why nwsim said "harder" than live

The live map JSONs are byte-identical to my staged `maps/map0X/map.json` (same git blob sha). Far Hills is `map02` with `maze-v1`. Map06 shares are forced to 1/3 in `fromPack.ts`.

**Root cause: Still and Mend.** `livePace.ts` never casts skills, but the live game does. Mend (`nightSkills.ts`) refills every heart and holds the gate for 4 s, with a 14 s cooldown. Easy also caps heart loss at 2 per round (`easyRoundHeartCap`). Together, a player who uses Mend cannot lose a run to ordinary leaks. Only a boss leak, or a boss still standing at the end, ends it. So live deaths land on boss rounds (R15, R20), and nwsim's R10–R14 deaths never happen. The two live runs with no skills (Peppermint, Far Hills no-upgrades) matched the old sim within one round.

Smaller causes, each worth 0–2 rounds:
- **Free lamps.** All 4 lamps are free to plant in live. The old natural plan paid 15 sparks for them.
- **Buy order.** NW Lead bought Strong first. The tree locks Far at 1 once Strong reaches 3, so the real ceiling is F1 S3.
- **Exact seats.** Worth 0 to +1.
- **Tap cadence.** About 0.1–0.15 s in the Far Hills and Blueberry runs, about 0.28 s or slower in the Peppermint run. The 0.28 s model already gets the death round right.
- **Boss taps.** The boss can be tapped even when it isn't the front walker.

Not causes:
- **Junction seats.** NW Lead's seats sit 45–87 plate units off a road, like ordinary Good seats.
- **Spawn point.** Same `easyLiveSpawnT` as the sim.
- **Walker shares.** Same `pathPick`.

`tools/nwlive.py` ports the live loop: `tick`, `fire`, `fireAtRaider`, skills, free lamps, Strong-first buys, and replayed buy logs. `tools/calib442.py` and `tools/ablate442.py` replay NW Lead's exact seats and buys. Seats were converted from 375×667 viewport pixels to the plate with the `boardFill` cover camera; the fitted board box is 590 px tall, 73 px from the top. Results are in `calibration.json`.

| Live case | Live | Old nwsim | Lead seats + buys, no skills | **nwlive (skills as used)** | Error |
|---|---|---|---|---|---|
| Far Hills spender (bought S4) | alive R20 | 14 | 12–13 | **alive R20** | 0 |
| Far Hills no upgrades | died R6 | 7 | 7 | **7** | +1 |
| Peppermint spender (0 skill uses) | died R12 | 13 | 12–13 | **12** (0.28 s) / 13 (0.12 s) | 0 / +1 |
| Caramel spender (no seats logged; staged seats used) | alive R20 | 12 | 14 | **alive R20** | 0 |
| Licorice spender | alive R20 | 10 | 10 | **alive R20** | 0 |
| Blueberry spender | died R15 boss | 10 | 11–12 | **15 (boss)** | 0 |

**What this means for targets.** With Mend, a spender only dies at a boss, so "dies R14/13/12/10/9" can only be measured for **a spender who doesn't use skills**. The projections below use that. For a skill user they also report the boss round where the run ends. If Bill wants deaths before R15 for players who use skills, the lever is a maze-v2 rule such as "Mend has 1 charge per round" or "Mend doesn't reset the 2-heart cap". That is Manager's call, and A2 would not change.

## 2. Wave model (maze maps only, `difficulty.wave`)

```json
"wave": {"countMulEarly": 1.5, "countMul": 2.0, "countFrom": 7, "hpScale": 0.8,
         "liveCap": 5, "spawnMul": 0.6, "pack": "perRoad", "sparkMul": 0.5}
```

- **Count.** Rounds 1–6 have ×1.5 walkers. From R7 on they have ×2. Toughs keep the table count, so the extra walkers are plain and fast ones.
- **HP.** Each walker's HP, including bulk, times `hpScale` (0.6–0.8). Round half up, minimum 1. Bosses don't change.
- **`liveCap` 5.** Replaces `EASY_WAVE_LIVE` = 3 on these maps, so the extra walkers are on the road at once instead of making the wave longer. `spawnMul` 0.6 shortens the gap between spawns.
- **`pack: perRoad`.** One spawn sends one walker down each road (pairs on maps 3–4, trios on 5–6), using the same `pathPick` shares.
- **`sparkMul` 0.5.** A pop pays half a spark, banked and rounded down at the clear, so twice the walkers doesn't mean twice the upgrades. Boss and clear bonuses stay the same.

## 3. One feature per map (`features[]`, normalized 0..1 coordinates, circle zones)

One small system: a feature is `{type, x, y, r, ...}`, tested against a walker's position on its own road, or against a lamp seat. Each map gets one intro note, shown once on that map's first R1 the same way the Still note is shown.

| Map | Feature | Data | Rule | Intro note | How the art shows it |
|---|---|---|---|---|---|
| map02 Far Hills | **Hilltop seat** | `{type:'hill', x:.411, y:.261, r:.045, rangeBonus:40}` | A lamp planted inside `r` gets +40 reach. The ghost ring shows the bigger ring. The spot is 100–135 units off the road, normally "Too far". | "Plant on the hilltop to see farther." | Small RGBA overlay: a grassy knoll with a soft glow ring. Off the road, so it could also be baked in later. |
| map03 Peppermint | **Candy-cane gates** | `{type:'sprint', x, y, r:.048, speedMul:1.8}`, one per road (`.344,.39` and `.654,.39`) | Walkers inside move ×1.8. | "Candy canes make walkers dash. Light up the road after them." | RGBA overlay: a striped arch over the road. Overlay, not baked, because road lock repaints the road. |
| map04 Caramel | **Sticky pools** | `{type:'sticky', x, y, r:.058, speedMul:0.5}` at `.699,.592` and `.561,.29` | Walkers inside move ×0.5. These are the comeback spots for the bigger crowds. | "Caramel slows walkers. Put a lamp near a pool." | RGBA overlay: an amber puddle on the road. |
| map05 Licorice | **Fog patches** | `{type:'fog', x, y, r:.10, noTap:true}` at `.266,.443` and `.761,.527` | A face inside fog has no glow and can't be tapped (the cue skips it). Lamps still hit it. | "Faces in the fog can't be tapped. Your lamps still see them." | RGBA overlay: a soft gray-violet mist, about 60% alpha, drawn above walkers. |
| map06 Blueberry | **Berry pop** (picked over the bog shortcut: more taps, easier to read on a phone) | `{type:'split', into:2, hpFrac:.2, minHp:2, fromRound:3, notFast:true, notBoss:true}` | A popped plain or tough walker drops 2 minis with 20% of its max HP (at least 2) at the same spot. Minis pay 0 sparks. | "Big berries pop into two little ones. Keep tapping!" | No art. Minis reuse the walker sprite at 0.7 scale with a pop puff. |

Art cost is about $0. All five are overlays or sprite reuse, and no map art needs regenerating. Optionally, 4 small sprites (knoll, cane arch, puddle, fog) could come from one cheap Gemini call each (about $0.15) or be drawn procedurally.

**Super-seats.** I'm leaving them alone. NW Lead's junction seats were ordinary Good seats. The hill is a bonus seat but wasn't in the best-scoring 4 on map02, so it's an option, not a must-pick.

## 4. How features are simulated

`tools/nwlive.py` has a `feat` dict:
- `seat_bonus(seat)` adds reach.
- `speed_at(walker)` multiplies pace.
- `fog_at(walker)` blocks taps.
- `split` spawns minis when a walker is popped.
- `count_mul`, `hp_scale`, `live_cap`, `spawn_mul`, `pack`, `spark_mul` cover the wave model.

`tools/v2_project.py` searches 10 random 4-seat combos from the top-7 pool (staged seats, NW Lead seats, and the hill seat). It plays Strong-first with a 0.28 s tap. It reports the best and average death for a spender with no skills, the best combo with skills, no-upgrades, a 1-lamp steady tapper at 0.45 s for R1–R6, and taps per round over R1–R10. Results are in `proj_map0X.json`.

## 5. Rough projection (no-skill spender, best seats; 20-round cap; "21" means survived)

| Map | Target | Today best / avg | **v2 hpScale** | v2 best / avg | With skills | No upgrades | Tapper R1–6 | Taps per round R1–10, today → v2 |
|---|---|---|---|---|---|---|---|---|
| map02 | 14 | 17 / 15.0 | 0.8 | **13** / 12.9 | alive R20 | 7 | yes | 45 → 63 (+40%) |
| map03 | 13 | 15 / 13.8 | 0.7 | **13** / 12.0 | alive R20 | 9 | yes | 47 → 57 (+21%) |
| map04 | 12 | 14 / 12.7 | 0.8 | **12** / 11.4 | alive R20 | 7 | yes | 42 → 54 (+29%) |
| map05 | 10 | 12 / 9.5 | 0.7 | **12** / 9.5 | R15 boss | 7 | yes | 43 → 53 (+23%) |
| map06 | 9 | 11 / 8.3 | 0.6 | **10** / 7.1 | R20 boss | 7 | no (fails today too) | 42 → 43 (0%) |

Caveats for these numbers:
- Deaths bunch at **R12**, where maze-v1's +100 bulk starts at R11, and at R5–R7. The best-seat number moves in steps.
- The map05 best result is still 2 over target. Map06 taps didn't rise, because splash kills the minis.
- The next pass should tune `hpScale` and `countMul` per map with a full seat search.
- Map06's tapper check should become "4 Level-I lamps, 0.45 s", since one lamp can't watch 3 roads.
- Map03 no-upgrades is R9; the target is 6–7.

## 6. Next hop (after approval)

1. Add `difficulty.wave` and `features[]` to map02–06 `map.json`. Put the projection tables in `maze-v2/`.
2. Wire it in the game: `fromPack` reads both fields; `liveCap` and `pack` in spawn; speed in `unturnedStep`; fog in `easyTapTarget`; hill in `hitRange`; split in `fire`. Plus overlay sprites and intro notes.
3. Settle the Mend question in §1 before using deaths before R15 as targets.

## 7. Approved and tuned (final values)

Manager's decisions:
- Mend stays as it is, and targets are projected against the no-skill spender.
- Waves, the 5 features, half-spark pops and per-road pairs/trios are approved.
- The steady-tapper check is 4 Level-I lamps, Strong-first buys and 0.45 s taps.
- Exact death rounds don't matter. More action does.

Per-map `difficulty.wave` (all maps share `countMul` 2 from R7, `liveCap` 5, `spawnMul` 0.6, `sparkMul` 0.5, and `pack: perRoad` on maps 3–6):

| Map | hpScale | countMulEarly (R1–6) | bulkRamp | Feature |
|---|---|---|---|---|
| map02 | 0.75 | 1.5 | [0.35, 0.7] | hill |
| map03 | 0.85 | 1.25 | [0.35, 0.7] | sprint gates |
| map04 | 1.0 | 1.5 | [0.35, 0.7] | sticky pools |
| map05 | 0.8 | 1.5 | [0.35, 0.7] | fog |
| map06 | 0.7 | 1.0 | [0.35, 0.7] | berry pop (split, from R3) |

- **`bulkRamp`** is a cheap fix for the R12 bunching. maze-v1's +100 late bulk now arrives as 35% at R11, 70% at R12 and 100% from R13, instead of jumping all at once. A plain walker goes 34 → ~73 → ~104 → 138 HP instead of 34 → 138.
- **`difficulty.rules` stays `maze-v1`.** The 1.4.442 `fromPack` treats any other value as A2. `wave` and `features` are new fields the hop must read.
- **Map06 shares** are written as 1/3 each, matching the live override.
- **`features[]` rows** carry `sprite`, `spriteAnchorPx` and `spritePxPerUnit: 2`. The game draws `overlays/<sprite>.png` at plate scale ÷ 2, with its anchor on `(x, y)`.
- **Draw order.** hill, gate and pool sit above the road and below walkers. Fog sits above walkers. pop.png is a 0.3 s burst at the pop point.
- **`featureNote`** is the one-line intro.

Overlays are in `overlays/`: hill, gate, pool, fog and pop, all `.png`. They're drawn procedurally by `overlays.py`, cost $0, and use real alpha with an 8 px transparent pad. `overlays/alpha_check.txt` shows border alpha 0 on every sprite, no white plate, and only icing or stripe highlights near white. Fog peaks at 0.85 alpha.

Final sim numbers are in `sim_table.md`. That run used a full seat search, about 1,500–1,900 campaigns per map, and NW Lead's seats among the starting sets. The contact sheet is `contact_sheet.png`.

Caveats:
- **Best-seat ramp is 14 / 13 / 13 / 12 / 9.** Map04 stays at 13 even at hpScale 1.0, because the sticky pools help lamps. Map05 is 12, against 10–11; hpScale 0.85+ breaks the steady tapper or falls off a cliff to R7–8.
- **Average seats are harsh on map03 (5.6) and map04 (6.3).** A random set of Good spots dies around R5–R6. The best seats survive much longer, so seat choice matters a lot more now. If kids struggle on these two maps, `countMulEarly` is the lever to lower.
- **Taps per round R1–R10 rise** by +7% (map03) to +80% (map02). Taps in R1–R6 alone drop slightly on maps 3, 5 and 6, because their early rounds were kept gentle for the tapper and no-upgrades targets.
- **Search limits.** The search is a heuristic local search on a 24 px grid, not an exhaustive one. A better seat set may exist; expect ±1 round. Today's best seats survive R20 on maps 2–3 with no skills, which matches "very very easy".
- **Untested assumption.** The sim assumes Still freezes lamps along with walkers. It doesn't affect these no-skill numbers.
