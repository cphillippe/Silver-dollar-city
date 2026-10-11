# WIRING — Story Strip packs v1 (one thin CloudAgent hop, Monday after Resource's read)

Base read: cphillippe/Silver-dollar-city main @ 3c8bda20 (1.4.430, 2026-10-09 6:10 PM PT). Packs were built read-only; nothing pushed.
Strips: daily-lantern (3), daily-creed (3), fg-reason (4). 10 new art keys, no existing key is replaced.
Each strip folder has: assets/*.webp + *.png (512×512 RGBA), manifest.json, snippet.ts, README.md (every string), <id>-v1-contact.png.

## Steps (single PR, Easy only, bump to the next free version)
1. Copy art: for each strip, `assets/<key>.webp` → `src/assets/story-strip/<key>.webp`
   (webp only is what sequenceArt.ts imports; png is kept here as the master, like beat3-rest).
   Keys: lantern1-dark lantern2-lamp lantern3-found · dcreed1-rose dcreed2-tell dcreed3-letter · reason1-think reason2-ground reason3-light reason4-stands
2. `src/lib/sequenceArt.ts` — paste from each `snippet.ts`:
   - the import lines (top), rows into `SEQUENCE_ART`, rows into `CUTOUT_BACKDROP`,
   - `SEQUENCE_CROP` rows (daily-lantern, daily-creed — 3-card portrait crop like daily-rest),
   - `SEQUENCE_FIGURE` row (fg-reason `reason3-light`, cue 'Jesus').
   Because fg-reason items now carry `art`, resolveSequenceVisual returns the cutout before the FoundationArt branch. Leave FOUNDATION_IDS alone (fg-ground / fg-mover still use it).
3. Items arrays (REPLACE `items: [...]` only; title/prompt/context/teachOnWrong/deeper untouched):
   - `src/content/daily.ts` → challenge id `daily-lantern` (pool `trail-lantern`) and `daily-creed` (pool `trail-creed`)
   - `src/content/firstGate.ts` → challenge id `fg-reason`
   Item `id`s and `text` (Hard face) are unchanged, so saves and Hard play are unaffected. New fields: art, shortCaption, easyShortCaption, winCaption, role, easyRole.
4. `src/lib/sequenceVerse.ts` → replace the three SEQUENCE_VERSES entries. Quote, ref and kicker are byte-identical to live; only `easyLead` is added.
5. `src/lib/easyChrome.ts` → add the `EASY_STRIP_FACE` rows. This is how the Easy takeaway / "Tap the main idea you kept" faces change WITHOUT touching pack XML claims, so scripts/check-packs.mjs asserts stay green:
   - fg-reason claim must still match /mind you already trust/ and easy.hold.why /Christ/ → we only re-face it to "Your mind works because God gives it light."
   - daily-lantern claim is locked ("A lamp is meant to be seen.", STORY_SNAP_CLAIM) → not changed.
   - daily-creed claim must match /Christ/ → only re-faced.
   NOTE: EASY_STRIP_FACE is keyed by exact text app-wide. "The mind needs a real ground." (fg-reason ideaLabel / links caption) gets re-faced to "God gives your mind light." everywhere Easy shows it. That is the Biblical Scholar header fix; confirm the 1.4.416 Why Gate header actually goes through easyFacingLine — if not, change that header's Easy string directly to "Your mind works because God gives it light."
6. Changelog row (src/content/changelog.ts), e.g. title "Three more stories get pictures"; items: "The porch lamp, Older than the letter, and Trust needs a ground show real pictures on Easy." / "The Easy win line explains hard Bible words above the verse. The Bible words stay the same."
7. Checks: `npm run build` + existing scripts (check-packs, check-learning). Prove on Easy at 375×667, 412×915, 768×1024: every card shows art (no GemMark / FoundationArt), 3-card crops keep heads whole, the "Jesus" chip sits on Jesus in reason3-light, win screen fits.

## Not in this pack (same reviewer batch, do in the same hop only if cheap)
- fg-ought is a sort, not a strip. Biblical Scholar's header/takeaway: "God wrote right and wrong on your heart." (Romans 2:15). Pack claim must still match /Rocks cannot write/ → add an EASY_STRIP_FACE row 'Rocks cannot write the law you already trust.' → 'God wrote right and wrong on your heart.' and the header string.
- Layout flag: SequencePlay renders `<figcaption>{kicker}</figcaption>` ABOVE `easyLead`. Biblical Scholar wants the plain line ABOVE the label (ph-road "JESUS SAID" fix). For these three, the label is correct for the quote, but if that hop moves easyLead above figcaption globally, these packs need no change.

## Rebuild / regenerate
`_work/gen_packs_v1.py frame:take` (needs GEMINI_API_KEY; logs every call in _work/calls.log), `_work/fit_pack.py` (fit + webp/png + contact sheets), `_work/write_pack.py` (single source for every string → manifest/snippet/README).
