# Adding areas and challenges

Silver City is content-driven. The game engine does not need to change when you add a district or a later **content pack**.

**Pack path (V0 and after):**

1. New `Area` module in `src/content/` (copy an existing district file).
2. Push it onto `areas` in `src/content/index.ts` (order is the trail).
3. One row on `CONTENT_PACKS` in `src/content/packs.ts`.
4. A `CHANGELOG` row in `src/content/changelog.ts` (Settings → What’s new).
5. Journal cards, evidence briefs, optional `WATCH_TOOLS` row, city plot ids in `src/lib/city.ts`.
6. Bump `APP_VERSION` (`package.json`, `src/config/app.ts`, Android `versionName`) — do not bump save schema unless the save shape changes.

1. Create a module in `src/content/` that exports an `Area`.
2. Register it in the `areas` array in `src/content/index.ts` (order matters).
3. Add matching `JournalEntry` records in `src/content/journal.ts`, with `unlockAfter` set to a challenge id.
4. Add a one-line **claim + reason + source** in `src/content/evidence.ts` (required for the Recall Loop).
5. Name today’s idea in plain English on the challenge (`idea:`). Example: `faith and science can share the same sky`.
6. If the district has a guide, add them in `src/content/story.ts` and `src/components/Avatar.tsx`.

7. If the district is on the overworld, add its challenge ids to the lists in `src/lib/city.ts` so the building can rise.

See also [`CONTRIBUTING.md`](../../CONTRIBUTING.md).

Supported puzzle `kind` values:

- `sequence` — order tiles; the chain checks itself when full. Four-plus stones deal Jericho two-choice.
- `match` — snap left/right pairs (locks on a hit, flashes on a miss). Observatory ids (`ob-`) teach first, then two choices, with Try again.
- `build-argument` — slot a chain; leave decoys in the bank. Observatory ids deal two stones at a time.
- `sort` — keep-or-toss bins. A wrong bin bounces that tile.

Keep citations real. Prefer honest framing of what an argument claims versus what it proves. Teaching copy belongs in `deeper` / journal cards so it appears after a solve. Name the Christian idea in plain English (`idea`) so a stranger can see what they’re practicing before they tap. If the evidence line is not crisp, the Recall Loop will feel like homework — keep it short enough to snap.

Spacing lives in `src/lib/memory.ts` (`SPACE_DAYS = 1, 3, 7, 21`). Do not add a separate flashcard UI. Daily Trail should prefer a due `nextReviewAt` over brand-new copy, mixed across districts.

Story and faces live in `src/content/story.ts` and `src/components/Avatar.tsx`. Keep dialogue light. Do not sermonize. New guides need a matching portrait in the same line weight and circular frame.
