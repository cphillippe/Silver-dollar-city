# Night Watch maps 1→15: how to make each one (Step 1, 2026-10-10)

Status: plan plus one test map. Nothing merged, no PRs, no pushes. I read the repo only through the GitHub MCP (main @ 6689c56).
Tools: `tools/nwmap.py` (guide → art → road lock → checks → sheet), `tools/blobs.py`, `tools/difficulty.py`. House style spec: `STYLE.md`; references in `ref/`. Test maps: `test-01/` (ovals, v1/v2), `test-01a/` (icons), `test-01b/` (road-only, **v6 = 3/3**).


# PHASE 2 (after 1.4.441): maze maps 2–6 — read this first

Bill, 10:38 AM PT: *"I need more and better mazes, that one is very very easy."* Staged: `maps/map02..map06/` (each has `map.json`, `art.webp`, `overlay.png`, the guide, and every art run). One sheet: `maps/contact_sheet_maps02-06.png`. Still nothing merged or pushed. I read the repo only through the GitHub MCP (main @ 2f952d6).

## P2.1 Sim port and calibration (`tools/nwsim.py`)

This is a standalone Python port of the repo's own Easy sim, `src/nightWatch/livePace.ts` `paceEasyLive(mode 'road', map)` + `paceEasyMapCampaign`. Pieces it brings in:
- `walkers.ts`: gaits, HP, boss HP, late push, and `easyJumpLoad`, which is the natural spender's buy order;
- `upgradeTree.ts`: `lampStrike`, `easyShotReach`;
- `towers` (`lampReach`, with its 24-unit overlap rule);
- `defend.ts`: leak grace, the heart cap, the boss exit, armored taps, `easyLiveSpawnT`;
- `rounds.ts` and `watchTools.ts`.

It reads `map.json` (all `paths[].points`, `share`, `seats`, `difficulty.hpMul`). The first 4 seats are the spender's lamp order.

Calibration (same seats the repo uses):

| Case | Known | Port |
|---|---|---|
| Far Hills 1.4.441 (live pack, hpMul 1.23), spender | changelog: "a spender reaches round 17" | **R17** (exact) |
| Far Hills, no upgrades | changelog: "stops around round 8" | **R8** (exact) |
| A2 (`LEAD_GOOD_SEATS`), no upgrades | R8 | **R8** (exact) |
| A2, spender | brief said ~R23 | **R18**. The repo's own comments (`EASY_LATE_BULK`: "a carried night ends in the late teens") and the 1.4.441 changelog agree with ~R17–18, so ~R23 looks like an older build's number. |

Three definitions:
- **Steady tapper**: natural spender buys, but taps every 0.45 s instead of the sim's 0.28 s. It must clear R1–R6.
- **Seat orders**: a kid doesn't always plant the 4 best seats. Every map is also run with 11 random picks of 4 of its Good seats, and we report the median, mean and range. **The ramp key is the mean spender death.**
- **Multi-path extension** (not in the repo yet): walker *n* gets a path by weighted round-robin on `share`, and lamps measure distance on each walker's own path.

## P2.2 What the sim says about "difficulty from the maze" (important)

Under today's Easy rules the round a spender dies on **barely depends on the maze**:
- 4 Strong-3 lamps shred R9–R15 even at 20% road coverage, and walker HP ×2 still gives R17.
- Death is pinned by HP walls in the round table: armored toughs at R7–8, the R10 and R15 bosses, and the +140 late bulk at R16.
- No-upgrades is pinned at **R8 by taps alone**. With zero lamp help the taps still clear R1–R7, so no maze can make it wall at R6–7.

So Bill's targets (spender R12–14, no-upgrades R6–7) can't be hit by geometry alone. I propose one shared ruleset for maze maps, **`maze-v1`**, and kept the per-map HP ramp gentle (1.15 → 1.30):
- toughs armored from **R6** (repo: R7), and R6 has **2** toughs (repo: 1);
- the late bulk starts at **R11** and is **+100** (repo: R16, +140).

With moderate bulk the maze matters a lot:
- live Far Hills under `maze-v1` still averages R15.3;
- A2-style 70–90% coverage never dies;
- the new mazes land at R9–14.

The honest split for map 2: ruleset ≈ −2 rounds (17 → 15.3), maze ≈ −1.5 rounds (15.3 → 13.8).

**Code hop needed** (Manager): read `difficulty.rules` in `easyWalkerHp` / `easyTapArmored` / the R6 row. That's 3 numbers. A2 keeps `a2`.

## P2.3 Maze metrics (`tools/maze.py`, also written into every `runN/map.json` as `_maze`)

All metrics are over the **walked** road. Live spawns each walker at `easyLiveSpawnT`, which is t≈0.23 on fast rounds and t≈0.50 on R1, so the first quarter of every road is never walked. That's a live quirk Manager should know about.

| Metric | Meaning |
|---|---|
| walkedLen | road length from t0=0.23 to the exit, summed over paths (shared stretches counted once) |
| turns, splits, merges, gates, crossings | bends ≥35°, fork nodes, join nodes, spawn gates, road crossings (from segments) |
| goodSeats / seats | of the auto seats (max 8), how many cover ≥140 u at range 114 |
| bestSeatPct | best single open spot's level-I coverage, % of the walked road |
| top4CoverPct / top4PerPathPct / top4Far1Pct | union coverage of the spender's 4 seats, overall, per walker path, and with Far 1 (162) |
| longestUncoveredTop4 | longest walked stretch outside all 4 rings |
| longestDeadRoad | longest walked stretch with no Good spot anywhere in reach |

Seats now come from a greedy pick: the spot with the most new level-I coverage, ≥110 apart, inside the phone band, never on derived decor. That greedy order is also the spender's lamp order.

## P2.4 Results (maps 2–6, all checks pass, mean spender death strictly falls)

| Map | Name | Roads | Walked road | Turns | Splits/merges/crossings | Good seats | Best seat | Top-4 cover (per path) | Top-4 with Far 1 | Longest uncovered | hpMul |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | A2 cottages (live) | 1 | 1397 | 5 | 0/0/0 | 5 | 28.6% | 91.0% (91.0) | 99.0% | 74 | 1.0 |
| 2 (live 1.4.441) | Far Hills as shipped | 1 | 1519 | 3 | 0/0/0 | 7 | 19.9% | 70.1% (70.1) | 90.0% | 172 | 1.23 |
| 2 | The Far Hills | 1 | 2220 | 8 | 0/0/0 | 6 | 18.3% | 46.2% (46.2) | 62.8% | 855 | 1.15 |
| 3 | Peppermint Pass | 2 | 2326 | 12 | 1/1/0 | 8 | 14.9% | 55.3% (64.1, 49.2) | 75.8% | 410 | 1.2 |
| 4 | Caramel Canyon | 2 | 2491 | 6 | 0/0/2 | 8 | 13.9% | 51.2% (51.8, 52.5) | 65.3% | 528 | 1.25 |
| 5 | Licorice Woods | 3 | 2201 | 10 | 1/1/0 | 8 | 23.3% | 59.4% (54.8, 54.8, 52.8) | 75.4% | 273 | 1.25 |
| 6 | Blueberry Bog | 3 | 2850 | 4 | 0/0/0 | 8 | 11.7% | 42.9% (45.5, 66.1, 17.6) | 65.1% | 508 | 1.3 |

| Map | Rules | Spender dies (best seats) | Spender over 12 seat orders: median / mean / range | No upgrades walls | Steady tapper R1–R6 | Hearts lost, fresh rounds | Art attempts | Checks |
|---|---|---|---|---|---|---|---|---|
| 1 A2 cottages (live) | a2 | R18 | R18.0 / 18 / R18–18 | R8.0 | 12/12 | 22 | – | – |
| 2 (live 1.4.441) Far Hills as shipped | a2 | R17 | R17.0 / 17 / R17–17 | R8.0 | 12/12 | 21 | – | – |
| 2 The Far Hills | maze-v1 | R13 | R13.5 / 13.83 / R12–17 | R7 | 12/12 | 30 | 2 | all pass |
| 3 Peppermint Pass | maze-v1 | R12 | R13.0 / 12.75 / R12–14 | R7 | 12/12 | 33 | 2 | all pass |
| 4 Caramel Canyon | maze-v1 | R14 | R12.0 / 12.17 / R9–14 | R7 | 12/12 | 28 | 5 | all pass |
| 5 Licorice Woods | maze-v1 | R12 | R11.0 / 10 / R7–13 | R7 | 10/12 | 33 | 3 | all pass |
| 6 Blueberry Bog | maze-v1 | R7 | R7.0 / 9.25 / R7–13 | R7 | 9/12 | 41 | 2 | all pass |

Ramp (mean spender death over seat orders): **13.8 → 12.8 → 12.2 → 10.0 → 9.3**, strictly falling. Map 2 meets Bill's bar:
- spender median R13.5 (best seats R13);
- no upgrades walls at R7;
- the steady tapper wins R1–R6 in 12 of 12 seat orders.

Maze levers used:
- legs ~200 u apart, so one seat covers a single leg;
- forks and lanes, with more walkers sent down the worse-covered lane (`share` 0.4/0.6 on map 3, 0.3/0.3/0.4 on map 6);
- a double crossing (map 4);
- two separate roads plus a fork (map 5);
- three parallel roads that 4 lamps can't all cover (map 6).

Every road stays inside the phone band (x 0.19–0.81). An earlier design that hugged the side borders was dropped: on a phone those walkers would be off screen and untappable.

Order note: the blueberry three-road map measured harder than the licorice two-road map, so they were swapped into slots 6 and 5.

## P2.5 Multi-road data format (`nw-map/2`) and checks for Manager's wiring hop

```ts
interface NightMapDefV2 extends Omit<NightMapDef, 'schema' | 'paths'> {
  schema: 'nw-map/2'
  segments: Record<string, [number, number][]>  // Catmull-Rom control points; a segment starts where the previous one ends
  paths: Array<{
    id: string                 // walker path id, e.g. 'west' (NightRaider.pathId)
    via: string[]              // segment ids spawn -> exit; shared segments repeat across paths
    share: number              // fraction of each round's walkers (sum 1); walker n -> weighted round-robin
    points: [number, number][] // generated: whole path resampled every 20 u (pathPoint(pathId, t))
    control: [number, number][]// generated, for reference
  }>
  difficulty: { rules: 'a2' | 'maze-v1'; hpMul: number; ... }
}
```

- **Nodes are derived, not stored.** A *split* is a segment followed by 2+ different segments. A *merge* is a segment reached from 2+. *Gates* are distinct first segments. *Crossings* are intersections of distinct segments away from joints.
- Each path is a full spawn→exit polyline. Walkers never switch paths at a split: the split is just the point where two paths stop sharing a segment. `pathPoint(pathId, t)` stays equal-t per path.
- **Code changes:**
  - `fromPack.ts`: read all `paths[]`, not only `paths[0]`;
  - `NightRaider.pathId`, assigned by `share`;
  - `pathClearance`/`lampSpotBlocked`: min over all paths;
  - `roadCoverLength`/the Good ghost: sum over paths, counting shared stretches once;
  - lamp targeting uses each raider's own path point;
  - `difficulty.rules` (P2.2).
- **Checks** (`nwmap.py guide/check` + `maze.py`):
  - every path starts and ends off-canvas or at an edge, and the walked part (t≥0.2) stays in x 0.19–0.81;
  - segment joints match exactly;
  - shares sum to 1;
  - non-adjacent legs of a path are ≥125 u apart (`tune_maze.separation_ok`);
  - coverage and Good seats are computed over all paths, plus per path (`top4PerPathPct`) so one lane can't be left bare by accident;
  - road lock and phantom checks run on all paths;
  - the vision check is told the designed layout (`art.roads`), so forks and crossings aren't "extra roads".

## P2.6 Art recipe v7/v7b (v6 + per-map palette + dense border)

- Same v6 pipeline: road-only guide (now tinted with the map's ground colour), softened A2 style ref, road lock, derived no-go zones and seats, all checks.
- `prompt_v7_maze.txt` adds:
  - a per-map palette (`art.ground`, `groundName`, cottage hues, bush words) via `tools/art_themes.py`;
  - a **dense natural edge border** (`art.border`: gumdrop hedges, peppermints, chocolate rocks, licorice twists, blueberries) that must leave a gap where a road exits;
  - **v7b**: "the roads in IMAGE 1 are final game data… never break a road into pieces".
- Check changes in this phase:
  - theme check judges the house/rendering family only (each map's ground is meant to differ);
  - "ui" no longer counts the requested scenery border (it had flagged map 2's hedges as a frame);
  - extra roads are judged against `art.roads`;
  - decor_ok needs ≥4 seats, ≥3 Good, ≥3 decor;
  - guide draws all road outlines before fills (a fork seam had leaked into map 3 run1).
- Consistency: art attempts per map were 2 / 2 / 5 / 3 / 2. Every failed run is listed in `maps/attempts.json`; all failures were real (bad palette contrast, Gemini moving or breaking roads, extra loops). The braid (map 4) and the licorice two-road map (map 5) only passed after their road ends were made straight edge exits.

Cost this phase: 14 image edits (`gemini-2.5-flash-image`, ~$0.039 each ≈ $0.55) plus 34 flash vision checks (≈ $0.04). **≈ $0.60** of the $3 budget.

## P2.7 Caveats

1. The sim is a port. It matches the repo's known numbers exactly, but it still assumes perfect center-aim taps (0.28 s), spawn-T shortcuts and the repo's seat-order model. Death rounds are quantized by the HP walls. Seat choice moves a map by up to ±3 rounds, which is why the ramp uses the mean over 12 seat orders.
2. `maze-v1` is a rule change, not geometry. Without it, no map can wall no-upgrades before R8, and the spender's death moves only between R15 and R17.
3. Good seats stayed at 6–8 per map (target 8 → 5). In the phone band the art leaves plenty of open ground. Cutting Good seats needs no-go decor hugging the bends: either a `keepout` field the game enforces, or cottages placed by the guide. That's the next lever.
4. Map 6's median is R7 because many seat picks lose at the first armored round, and its tapper wins 9 of 12. It's the steepest step; soften it with share 1/3 each if Bill finds it harsh.
5. Road-lock ghost edges: on maps 4–6 Gemini's road sat a few units off ours, so faint double edges show beside the locked road. They pass the checks, but take a human look.
6. Walkers spawn at t≈0.23–0.50 (live `easyLiveSpawnT`), so on these mazes the first quarter of each road is decoration. If Manager moves spawns to t=0 for maze maps, rerun `nwsim.py` (it will be easier).

---

## 0. How the live map works today (files I read)

| Thing | Where | Shape today |
|---|---|---|
| Canvas | `src/nightWatch/map/surface.ts` `NIGHT_MAP` | 798×1134 plate units, one opaque `nw-map-plate.webp`; `boardView` letterboxes the whole plate (desktop/Hard) |
| Phone camera | `src/nightWatch/map/phoneFill.ts` `boardFill` | Cover crop. On a 390×844 phone only about x 0.17–0.83 of the plate shows, so seats must sit inside that band. The road may run off-screen at its ends. |
| Walker road | `src/nightWatch/path/data.ts` `DEFEND_PATH: NightPoint[]` | One polyline in plate units, points about 20 apart. `pathPoint(t)` gives every segment equal t, so the spacing must stay even. |
| Seats | `DEFEND_ANCHOR: Record<CityPlotId, NightPoint>` plus free seats `at:x:y` (`freeSpotId`) | 8 city-lot seats; any open ground can take a free lamp |
| No-go ground | `src/lib/lampPlace.ts` `lampSpotBlocked` | `ROAD_BLOCK=46` around the road, plus hand-measured `HOUSES` ellipses, `FEATURES` discs, `EXTRA_ROADS`, `PORCH_PATHS`, and a 16-unit edge margin |
| Coverage ghost | `lampPlace.ts` `roadCoverLength` / `roadCoverRank` | Road length inside the ring: Good ≥140 (`ROAD_GOOD_LEN`), Some ≥18 (`ROAD_SOME_LEN`), otherwise Too far |
| Reach | `src/nightWatch/towers/index.ts` | Free lamp level I range 114 (`FREE_LAMP_RANGE_BONUS` 18), `LAMP_ROAD_OVERLAP` 24 |
| Rounds | `src/nightWatch/rounds.ts` `EASY_ROUNDS` (25 rows) | count/speed/hp/spawn/fast/tough, speed capped by `EASY_ROUND_SPEED_CAP`=6.8 |
| Walker HP | `src/nightWatch/enemies/hp.ts` `NIGHT_ENEMY_HP.easy` | swarm 2 / mid 2 / tank 3, plus the round `hp` |
| Unlock | `src/nightWatch/farHills.ts`, `src/components/FarHillsUnlock.tsx` | Text only ("New place unlocked!", "Coming soon") |

**What made map 1 hard:** the art came first, and then the road, houses, trees and porch paths were all measured off the painting by hand (`HOUSES`, `FEATURES`, `EXTRA_ROADS`, `PORCH_PATHS`). The fix is to flip the order: **data first, then art painted from the data.** The road and the no-go zones are known before any painting happens, so nothing needs measuring.

## 1. Map data schema (`nw-map/1`) — superseded for maze maps by `nw-map/2` (P2.5)

Coordinates are normalized 0..1 of the canvas. At load time they are multiplied by 798/1134 to get the plate units the code already uses. Real example: `test-01/map.json`.

```ts
interface NightMapDef {
  schema: 'nw-map/1'
  id: string                    // 'far-hills'
  order: number                 // 1..15
  name: string; badge: string   // 'The Far Hills' / 'Far Hills' (farHills.ts strings)
  unlock: { after: string | null; round: number; mode: 'easy' }   // beat previous map at R25
  canvas: { w: 798; h: 1134 }   // same plate as NIGHT_MAP; phone safe x 0.17..0.83
  plate: string                 // nw-map-<id>.webp, full opaque background (no alpha needed)
  paths: Array<{                // MULTIPATH: maps 1–2 must have length 1; length ≥2 allowed from map 3
    id: string                  // 'main', 'north', ...
    control: [number, number][] // hand-authored Catmull-Rom control points (the only thing a human draws)
    points: [number, number][]  // generated: resampled every 20 plate units -> DEFEND_PATH
    spawn: 'left'|'right'|'top'|'bottom'; exit: 'left'|'right'|'top'|'bottom'
    share: number               // fraction of each round's walkers on this path (sums to 1)
    joins?: { path: string; atT: number } // optional: lane merges into another path at t
  }>
  decor: Array<{ id: string; kind: 'cottage'|'trees'|'rock'; x: number; y: number; rx: number; ry: number }>
                                // replaces hand-measured HOUSES/FEATURES; also the art markers
  seats: Array<{ id: string; x: number; y: number }>   // replaces DEFEND_ANCHOR for this map
  checkRange: 114               // free level-I range used for the Good/Some stats
  difficulty: { score: number; hpMul: number; speedMul: number; countMul: number; startCashMul: number; rounds: 25 }
  art: { theme: string; ground: string; decorWords: string; mood: string }   // prompt variables
}
```

What changes in code for multipath, later and not today: `pathPoint(t)` becomes `pathPoint(pathId, t)`. Each `NightRaider` gets `pathId`, given out by `share`. `pathClearance` and `lampSpotBlocked` take the min over all paths. `roadCoverLength` and `roadCoverD` sum over all paths. Everything else in lampPlace.ts stays as it is.

## 2. Art recipe (the 3/3 version is v6: road-only guide + A2 style ref + road lock)

House style: see `STYLE.md`, taken from the live A2 board. In short: chunky 3/4-isometric gingerbread cottages with puffy frosting roofs, white piped-icing beads, candy-cane corner posts, heart or round windows, glossy clay shading, low-contrast outlines, dark indigo bushes and lollipops at the base, on deep violet ground with a flat butterscotch road.

**Pipeline (all scripted, same steps for every map, no hand fixes):**
1. `nwmap.py guide`: resample the road from `paths[].control` and run the data checks. With `guideStyle: "road"`, `guide.png` (832×1248, 2:3) shows **only** flat violet ground and our yellow road at 44 units wide, with no markers.
2. `nwmap.py art`: one `gemini-2.5-flash-image` edit with `IMAGE 1 = guide` and `IMAGE 2 = style reference` (`ref/a2-style-ref.png`) at aspect 2:3, then stretched to 798×1134.
   - The reference is 5 A2 house crops plus a bush crop, with the road painted out and soft-feathered onto plain violet. Plain rectangular crops made Gemini paint square light patches, and road scraps in the reference made it end the road at a house.
3. **Road lock** (`roadLock: true`): we repaint our own road band over the art, in Gemini's own sampled road colour, with a darker edge and a soft highlight. The road is then pixel-exact every time. It's a safety net: in all 3 v6 runs Gemini's own road was already 100% on the line before the lock.
4. `nwmap.py check`:
   - **derive decor** (option B): large textured non-ground blobs off the road become `decor` ellipses, replacing hand-measured `HOUSES`/`FEATURES`;
   - **auto-place seats**: 8 tower spots on open ground, 60–100 units from the road, inside the phone safe band, ≥110 apart, sorted by coverage;
   - writes `runN/map.json` and `runN/checks.json`.

**Prompt v6** (`prompt_v6_road.txt`):
- STYLE: match the reference exactly. Glossy clay candy, 3/4 iso, soft top-left light, low-contrast outlines, full-bleed, no frame.
- ROAD: same place and width, one unbroken band off the border at both ends, saturated #F7C531, keep a clear strip of plain violet one road-width wide on both sides.
- LAYOUT: exactly 3 cottages and 3–4 bush clusters, spread top, middle and bottom, wide open clearings beside every bend.
- SCENERY: four variables per map from `map.json.art` (`theme`, `ground`, `decorWords`, `mood`). `decorWords` carries the STYLE.md cottage spec plus that map's 3 cottage hues.
- NEVER: square patches, white snow roofs, flat front-view stickers, teal pom-pom trees, text, UI, characters, water, dark holes or flat blobs.

Option A (line-art icons as markers: `guideStyle: "icons"`, `prompt_v3_icons.txt`) scored 0/3 and was dropped. Gemini left the white tree-circle icons in all 3 runs, and in one run it also bent the road.

## 3. Auto-checks (`nwmap.py check`, written to `runN/checks.json`; usable = every check passes)

Data checks run before any art is made (`nwmap.py guide`):
- every seat is more than ROAD_BLOCK+8 from every path;
- every seat is inside the phone safe band (x 0.17–0.83);
- no seat is inside a decor ellipse;
- no decor touches a road;
- the script reports road length, bends, and Good seats.

Pixel checks on the art:

| Check | Pass rule |
|---|---|
| aspect | 798×1134 out, raw within 6% of the plate aspect |
| file size | webp q82 ≤ 350 KB (about 45 KB in practice) |
| road on line | ≥92% of polyline points read road-yellow (HSV hue 0.07–0.17, sat ≥0.45, val ≥0.6), 3×3 sample |
| no phantom road | ≤2% road-yellow pixels farther than 60 units from every path |
| contrast | road luminance − ground luminance (70 units off the road) ≥ 0.25 |
| seats open | seat disc r 22: ≤10% yellow, luminance sd ≤0.13, mean ≤0.55; ≤1 bad seat |
| **scenery on road** (road lock) | big objects Gemini painted inside the road core before the lock ≤1%, so the lock never cuts a house |
| **flat/dark blob** (`tools/blobs.py`) | no flat region (15 px local sd <0.02, area ≥1800, ≥38 RGB from ground) whose hue is ≥0.08 off the ground hue. Violet bush shading is allowed. Blobs under luminance 0.30 are reported as **dark** |
| markers painted | ovals guide: no oval ≥30% guide colour or flat. Icons guide: ≥30% painted. Road guide: ≥3 derived decor, ≥7 seats, ≥4 Good |
| no text/UI | `gemini-flash-latest` vision JSON: text, UI, extra roads |
| **theme match** | `gemini-flash-latest` compares the new map to `ref/a2-houses.png` (A2 cottage spec in the question). Needs `match: true` and score ≥7 |

Blob check against the old runs, confirmed:
- **run2 is flagged**: a dark teal-green flat blob at (0.10, 0.59), which is the one Bill saw. It also flags run2's leftover pink oval and the pale cream road slab.
- **run6 has no dark blob.** It is flagged for 3 flat pink ovals, which aren't dark.
- run5 is also flagged: a dark green leftover tree oval at (0.84, 0.93).
- Controls: the **live A2 board passes** with 0 blobs, and runs 3 and 4 have 0.

Theme check against the old runs: runs 1–6 all fail with scores of 1–3 ("flat front-view sticker houses with white snow roofs"). All A2-referenced runs scored 10.

Known gap: no scripted check yet for soft "halo" shoulders along the road, or a too-empty board edge. Those still rely on one human look at the contact sheet.

## 4. Difficulty ramp 1→15 (Easy) — formula version, superseded by the measured sim ramp (P2.4, `difficulty.json`; old file kept as `difficulty_v1_formula.json`)

One score per map. Map 1 is set to 100 and the target is **+9% per map**, so map 15 lands at about 3.35×. `tools/difficulty.py` checks that each step is between +6% and +12% (no flat steps, no spikes) and that maps 1–2 have one path.

```
D = 100 · H · C · √S · (L1/L)^0.6 · (G1/G)^0.4 · (1 + 0.30·(paths−1)) · (1/M)^0.5
```
- H: HP multiplier on the `EASY_ROUNDS` hp plus the kind's HP.
- C: walker count multiplier.
- S: speed multiplier, applied before the cap. `EASY_ROUND_SPEED_CAP` 6.8 still wins, so late rounds lean on HP and count.
- L: shortest walk from spawn to exit, in plate units.
- G: number of Good seats (cover ≥140 at range 114).
- M: start-cash multiplier.

Map 1 is measured from `DEFEND_PATH` and `DEFEND_ANCHOR`: L1 = 1808, 5 bends, G1 = 5 Good seats.

The layout knobs (paths, length, bends, seats, speed, count, cash) are scheduled by hand. H is then solved so D hits its target exactly. H drops a little at maps 3 and 10, where a new road arrives; that is on purpose, so the new idea comes with gentler numbers while the total score still climbs smoothly. **Multipath starts at map 3** (Bill's rule): maps 1–2 have one path, maps 3–9 have 2, maps 10–15 have 3.

| Map | Layout | Paths | Walk L | Bends | Seats | Good | Speed× | Count× | HP× | Cash× | Unlock | **Score** | Step |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | A2 cottages (live) | 1 | 1808 | 5 | 8 | 5 | 1.00 | 1.00 | 1.00 | 1.00 | start | **100.0** |  |
| 2 | Far Hills: long S, 3 bends (test-01) | 1 | 1966 | 3 | 8 | 6 | 1.00 | 1.00 | 1.23 | 1.00 | beat map 1 at R25 | **108.7** | +8.7% |
| 3 | fork: one road splits into 2 lanes, rejoin before exit | 2 | 1900 | 4 | 8 | 6 | 1.00 | 1.00 | 1.09 | 1.15 | beat map 2 at R25 | **119.2** | +9.7% |
| 4 | fork, lanes further apart | 2 | 1850 | 4 | 8 | 6 | 1.00 | 1.03 | 1.13 | 1.15 | beat map 3 at R25 | **129.4** | +8.6% |
| 5 | two gates, roads merge mid-map | 2 | 1800 | 4 | 8 | 5 | 1.02 | 1.05 | 1.10 | 1.15 | beat map 4 at R25 | **141.8** | +9.6% |
| 6 | two gates, merge late | 2 | 1750 | 5 | 8 | 5 | 1.02 | 1.06 | 1.15 | 1.12 | beat map 5 at R25 | **154.2** | +8.7% |
| 7 | two roads cross once (X) | 2 | 1700 | 5 | 7 | 5 | 1.03 | 1.08 | 1.20 | 1.12 | beat map 6 at R25 | **167.6** | +8.7% |
| 8 | cross + fork | 2 | 1650 | 5 | 7 | 5 | 1.04 | 1.10 | 1.24 | 1.10 | beat map 7 at R25 | **182.1** | +8.7% |
| 9 | two separate roads, no merge | 2 | 1600 | 5 | 7 | 4 | 1.05 | 1.12 | 1.19 | 1.10 | beat map 8 at R25 | **199.1** | +9.3% |
| 10 | three gates, two merges | 3 | 1560 | 6 | 7 | 4 | 1.05 | 1.12 | 1.08 | 1.20 | beat map 9 at R25 | **216.2** | +8.6% |
| 11 | three gates, one crossing | 3 | 1520 | 6 | 7 | 4 | 1.06 | 1.14 | 1.13 | 1.18 | beat map 10 at R25 | **237.0** | +9.6% |
| 12 | three roads, long straights | 3 | 1480 | 6 | 6 | 4 | 1.07 | 1.16 | 1.17 | 1.16 | beat map 11 at R25 | **257.1** | +8.5% |
| 13 | three roads, split at spawn | 3 | 1440 | 6 | 6 | 4 | 1.08 | 1.18 | 1.22 | 1.14 | beat map 12 at R25 | **281.0** | +9.3% |
| 14 | three roads, few bends near seats | 3 | 1400 | 7 | 6 | 3 | 1.09 | 1.20 | 1.13 | 1.12 | beat map 13 at R25 | **306.1** | +8.9% |
| 15 | finale: three roads, two crossings | 3 | 1360 | 7 | 6 | 3 | 1.10 | 1.22 | 1.18 | 1.10 | beat map 14 at R25 | **335.2** | +9.5% |
The weights (0.6, 0.4, 0.30 per extra path, 0.5) are a design guess. Before map 3 ships they get calibrated with the existing spender bot: on map 1 it reaches about R23, and each new map should land within ±1 round of map 1 when the bot plays with that map's knobs. If it doesn't, adjust the weight and re-solve H. The ramp stays monotonic by construction.

## 5. Test results: "The Far Hills" (map 2 candidate, one path, same map data in every run)

Data: one path, 1966 units, 3 bends. In v6 the decor and seats are derived per run: 5–7 decor, 8 seats, 8 Good.
All runs below have been re-scored with the current checks, including blob and theme.

| Version | Run | Usable | Theme | Why |
|---|---|---|---|---|
| v1 ovals, no ref | test-01/run1 | no | 1 | blob_ok, decor_ok, theme_ok (icons/ovals left: c1) |
| v1 ovals, no ref | test-01/run2 | no | 2 | road_ok, blob_ok, decor_ok, theme_ok (icons/ovals left: c3; road only 0% on line; dark blob [(0.102, 0.594)]) |
| v1 ovals, no ref | test-01/run3 | no | 2 | theme_ok |
| v2 ovals, no ref | test-01/run4 | no | 1 | theme_ok |
| v2 ovals, no ref | test-01/run5 | no | 3 | blob_ok, decor_ok, theme_ok (icons/ovals left: c1,t1; dark blob [(0.836, 0.934)]) |
| v2 ovals, no ref | test-01/run6 | no | 2 | seats_ok, blob_ok, decor_ok, theme_ok (icons/ovals left: c1,c2,c3) |
| v3 icons + ref | test-01a/run1 | no | 10 | decor_ok, no_text_ok (icons/ovals left: t1,t2,t3) |
| v3 icons + ref | test-01a/run2 | no | 10 | road_ok, seats_ok, decor_ok, no_text_ok (icons/ovals left: t1,t2,t3; road only 66% on line) |
| v3 icons + ref | test-01a/run3 | no | 10 | decor_ok (icons/ovals left: t1,t2,t3) |
| v3 road-only + ref | test-01b/run1 | no | 10 | road_ok (road only 61% on line) |
| v3 road-only + ref | test-01b/run2 | yes | 10 | all checks pass |
| v3 road-only + ref | test-01b/run3 | no | 10 | road_ok (road only 79% on line) |
| v4 road-only, "never end at a house" | test-01b/run4 | no | 10 | road_ok (road only 74% on line) |
| v4 road-only, "never end at a house" | test-01b/run5 | no | 10 | road_ok, phantom_ok (road only 56% on line) |
| v4 road-only, "never end at a house" | test-01b/run6 | no | 10 | road_ok (road only 59% on line) |
| v5 + road lock, road-free ref | test-01b/run7 | no | 10 | lock_ok (house on road route 11%) |
| v5 + road lock, road-free ref | test-01b/run8 | yes | 10 | all checks pass |
| v5 + road lock, road-free ref | test-01b/run9 | yes | 10 | all checks pass |
| **v6** + feathered ref, clear strip | test-01b/run10 | yes | 10 | all checks pass |
| **v6** + feathered ref, clear strip | test-01b/run11 | yes | 10 | all checks pass |
| **v6** + feathered ref, clear strip | test-01b/run12 | yes | 10 | all checks pass |

**Scores by version (same prompt within each set of 3):**

| Version | Score |
|---|---|
| v1 | 0/3 (theme fails) |
| v2 | 0/3 |
| v3 icons | 0/3 |
| v3 road | 1/3 |
| v4 road | 0/3 |
| v5 road+lock | 2/3 (run9 passes the checks but has visible square light patches behind the houses, copied from the tile edges in the reference; feathering the reference in v6 fixed it) |
| **v6 road+lock** | **3/3** |

**First version to reach 3/3 in a row with no hand fixes: v6.** In v6, Gemini's own road was 100% on the line in all 3 runs before the lock, nothing was painted on the road route, and theme scored 10/10 each time.

Lessons:
1. Coloured or line-art markers get left behind. A road-only guide plus decor derived by script avoids that.
2. The style reference fixes the theme (score 1–3 → 10), but it must not contain roads or hard tile edges. Gemini copies both.
3. Telling Gemini "never end the road at a house" made it do exactly that. Describe what you want, not the failure.
4. The road lock costs nothing and guarantees pixel-exact walker alignment.

Contact sheets (raw art | overlay with walker path, start/end, auto seats, derived decor ellipses, phone safe band):
- v6: `test-01b/contact_sheet_v6.png` (also `test-01b/contact_sheet.png`)
- v3, v4, v5: `test-01b/contact_sheet_v3.png`, `_v4.png`, `_v5.png`
- option A: `test-01a/contact_sheet.png`
- v1/v2: `test-01/contact_sheet.png`
- **Side-by-side with the live A2 board, plus a house close-up: `test-01b/side_by_side_A2_vs_run11.png`**

Pick for wiring: **test-01b/run11**: `art.webp` (about 45 KB) plus `run11/map.json` (derived decor and seats).
Taste notes for Bill:
- The edges are emptier than A2's dense bush border.
- Gemini paints a soft lighter shoulder along the road.
- The houses are close copies of the A2 set; per-map variety will come from the `decorWords` hues and theme.

## 6. Cost
- 21 image edits on gemini-2.5-flash-image (about 1,290 output tokens, about $0.039 each): **≈ $0.82**.
- About 80 flash vision checks (text/UI plus theme): about $0.04.
- **Total so far ≈ $0.86** of the $2 cap.
- A new map at v6 costs about $0.04 per attempt. Budget 3 attempts per map: 15 maps ≈ $2.

## 7. Next thin hop (one map, single path, Easy only)
1. Add `src/nightWatch/maps/` with `a2.ts`, today's `DEFEND_PATH`/`DEFEND_ANCHOR`/`HOUSES` wrapped as a `NightMapDef`, so the live map is unchanged. Also add `farHills.json` (from `test-01b/run11/map.json`) and `nw-map-far-hills.webp` (run11).
2. Add an `activeMap()` selector: A2 by default, Far Hills only after the Far Hills unlock in Easy. Hard always gets A2.
3. Point `path/data.ts`, `map/surface.ts` (`plate`) and `lampPlace.ts` (`HOUSES`/`FEATURES` from `decor`; extras empty for generated maps) at `activeMap()`. That's 3 files plus the tests.
4. Swap "Coming soon" in `FarHillsUnlock.tsx` for a Play button. Prove it with the R5 snapshot untouched on A2, plus one Far Hills spender run.
Multipath (`pathId` on walkers) is a separate hop before map 3. The guide and lock already draw every entry in `paths[]`.
