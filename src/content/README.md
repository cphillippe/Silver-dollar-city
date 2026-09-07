# Adding areas and challenges

Silver City is content-driven. The game engine does not need to change when you add a district.

1. Create a module in `src/content/` that exports an `Area`.
2. Register it in the `areas` array in `src/content/index.ts` (order matters).
3. Add matching `JournalEntry` records in `src/content/journal.ts`, with `unlockAfter` set to a challenge id.
4. Add a one-line **claim + reason + source** in `src/content/evidence.ts` (required for the Recall Loop).
5. If the district has a guide, add them in `src/content/story.ts` and `src/components/Avatar.tsx`.

6. If the district is on the overworld, add its challenge ids to the lists in `src/lib/city.ts` so the building can rise.

See also [`CONTRIBUTING.md`](../../CONTRIBUTING.md).

Supported puzzle `kind` values:

- `sequence` — order tiles; the chain checks itself when full
- `match` — snap left/right pairs (locks on a hit, flashes on a miss)
- `build-argument` — slot a chain; leave decoys in the bank
- `sort` — keep-or-toss bins

Keep citations real. Prefer honest framing of what an argument claims versus what it proves. Teaching copy belongs in `deeper` / journal cards so it appears after a solve. If the evidence line is not crisp, the Recall Loop will feel like homework — keep it short enough to snap.

Spacing lives in `src/lib/memory.ts` (`SPACE_DAYS = 1, 3, 7, 21`). Do not add a separate flashcard UI. Daily Trail should prefer a due `nextReviewAt` over brand-new copy, mixed across districts.

Story and faces live in `src/content/story.ts` and `src/components/Avatar.tsx`. Keep dialogue light. Do not sermonize. New guides need a matching portrait in the same line weight and circular frame.
