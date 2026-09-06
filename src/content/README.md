# Adding areas and challenges

Silver City is content-driven. The game engine does not need to change when you add a district.

1. Create a module in `src/content/` that exports an `Area`.
2. Register it in the `areas` array in `src/content/index.ts` (order matters).
3. Add matching `JournalEntry` records in `src/content/journal.ts`, with `unlockAfter` set to a challenge id.

Supported `kind` values:

- `multiple-choice` — options with a `teach` note on every answer
- `scenario` — a richer stem, same engine as multiple choice
- `sequence` — items listed in correct order are shuffled in play
- `build-argument` — slots plus cards (mark weak claims `distractor: true`)
- `match` — left/right pairs

Keep citations real. Prefer honest framing of what an argument claims versus what it proves.
