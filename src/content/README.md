# Adding areas and challenges

Silver City is content-driven. The game engine does not need to change when you add a district.

1. Create a module in `src/content/` that exports an `Area`.
2. Register it in the `areas` array in `src/content/index.ts` (order matters).
3. Add matching `JournalEntry` records in `src/content/journal.ts`, with `unlockAfter` set to a challenge id.

Supported puzzle `kind` values:

- `sequence` — order tiles; the chain checks itself when full
- `match` — snap left/right pairs (locks on a hit, flashes on a miss)
- `build-argument` — slot a chain; leave decoys in the bank
- `sort` — keep-or-toss bins

Keep citations real. Prefer honest framing of what an argument claims versus what it proves. Teaching copy belongs in `deeper` / journal cards so it appears after a solve.
