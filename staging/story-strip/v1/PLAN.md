# Story Strip packs v1 — weekend plan (Gemini only, no Cursor/CloudAgent, no pushes)
Written 2026-10-09 ~6:30 PM PT. Repo read via `gh api` (main @ 1.4.429 changelog).

## What the repo shows (src/lib/sequenceArt.ts → resolveSequenceVisual)
Order of fallback: item.art cutout → ph-road story-panel → FoundationArt (fg-reason/fg-ground/fg-mover) → GemMark.
| strip | frames | art today | Easy shelf order |
|---|---|---|---|
| ph-road | 5 | cutouts v3/v4 | 1 |
| wb-creed | 4 | cutouts | 8 |
| daily-rest | 3 | cutouts | 38 |
| fg-reason | 4 | FoundationArt (abstract, purple) | 5 |
| fg-ground | 4 | FoundationArt | 7 |
| daily-creed | 3 | **GemMark only** (no gem set → star) | 13 |
| daily-lantern | 3 | **GemMark only** (star/lamp/heart) | 15, early daily |
| fg-mover | 4 | FoundationArt | 28 |
| daily-scroll | 3 | **GemMark only** | 32 |

## Picks (3 upgrades, 0 new strips)
1. **daily-lantern** — early daily + Street Light lesson, but cards are bare gems. Story is concrete (night street, lamp, walker). Highest value per frame.
2. **daily-creed** — bare gems; Easter creed. Reuse the wb-creed cast (creed1–4 refs) so Jesus/Peter match.
3. **fg-reason** — earliest Why Gate strip (shelf 5), abstract art, and Biblical Scholar asked for the God-naming takeaway "Your mind works because God gives it light." (John 1:9).
Runner-up (next pack): daily-scroll (gems only, very drawable: scribe / compare / print).
No new strip: no obvious gap that a weekend art pack fixes; fg-ought is a sort, not a strip (its line goes to the header fix only).

## Per-frame approach
- gem-order-redesign STYLE (ph-road-v2) + magenta key → gr.cutout → RGBA 512, v3 margins (12/22/12).
- Refs: ph-road-v3 road1-lawyer (style + Jesus), art/creed*.png for creed cast.
- 1 take per frame, regenerate only failures. Target ≤ ~20 calls (~$1–1.5).
- Contact sheet per strip (full, 55px, 40px, grayscale).
