Silver City — area content packs (runtime source of truth)
==========================================================

appVersion: 1.4.64  (from src/config/app.ts on main)
schemaVersion: 3
generated: see each file’s generated= attribute (America/Chicago)
host: https://cphillippe.github.io/Silver-dollar-city/
source: cphillippe/Silver-dollar-city @ main (raw.githubusercontent.com harvest; no clone)

Engine loader climb next — these packs are the intended content source.

FILES
-----
  parable-hollow.xml   Story Creek / Mercy (+ East porch Juniper dailies) — 8 lessons
  witness-bench.xml    Witness Square / Silas — 7 lessons
  observatory.xml      Sky Watch / Nora — 6 lessons
  first-gate.xml       Why Gate / Ansel — 11 lessons
  high-lookout.xml     Meaning Ridge / Hope — 7 lessons
  index.xml            Pack list, Easy trail 1–39, holdRules, scoring, tools, trail notes, uiChrome
  SCHEMA.md            How the game should load packs (1:1 field map)

TOTALS
------
  Lessons (claim·reason·source street facts): 39
  Tiers per lesson: easy + medium + hard (39/39)
  Easy trail lines: 39 (easyOrder 1–39)
  Street facts: 39 (same as lessons)
  Excluded from lessons: td-watch (Love how-to → index <tools>)
                         j-trail-* (thank-you cards → index <trailNotes>)

THREE TIERS
-----------
  easy    plain kid/normie Learn→Match→Hold (shortStory); points=10
  medium  clearer than Hard, richer than Easy (mediumTeach); points=12
  hard    deeper teach (hardTeach/fullTeach); held claim still plain; points=15

  Held claim · reason · source are identical clear lines on all three tiers.

HOLD LEVEL-UP + FAIL → EASY
---------------------------
  easy Hold:   levelUpTo="medium"  onFail="easy"
  medium Hold: levelUpTo="hard"    onFail="easy"
  hard Hold:   (no levelUpTo)      onFail="easy"

  Fail Hold or fail level-up → retry Easy teach path (teach-before-test, not punish).
  See index.xml <holdRules> and SCHEMA.md.

JOURNAL SCORING (score per level / best tier held)
--------------------------------------------------
  Easy hold   = 10 points  (tier @points="10")
  Medium hold = 12 points  (tier @points="12")
  Hard hold   = 15 points  (tier @points="15")

  Journal shows score per level (tier). Each idea’s contribution = points of the
  **highest tier successfully held** for that idea (Hard = 15, not 10+12+15).
  Level-up Hold awards the higher tier’s points. On fail→Easy, award Easy only
  if Easy Hold succeeds.

  Encoded in: index.xml <scoring>, every lesson tier @points, journal
  scoreFromHeldTier="true". See SCHEMA.md.

EASY TRAIL ORDER (easyOrder 1–39)
---------------------------------
   1 ph-road          parable-hollow
   2 ph-father        parable-hollow
   3 ph-debt          parable-hollow
   4 fg-order         first-gate
   5 fg-reason        first-gate
   6 fg-ought         first-gate
   7 fg-ground        first-gate
   8 wb-creed         witness-bench
   9 wb-women         witness-bench
  10 daily-lantern    parable-hollow
  11 daily-stars      observatory
  12 daily-cosmos     first-gate
  13 hl-moral         high-lookout
  14 ph-seeds         parable-hollow
  15 wb-early         witness-bench
  16 wb-method        witness-bench
  17 daily-names      witness-bench
  18 daily-creed      witness-bench
  19 daily-empty      witness-bench
  20 daily-gems       parable-hollow
  21 daily-seed       parable-hollow
  22 daily-neighbor   parable-hollow
  23 ob-tuning        observatory
  24 ob-design        observatory
  25 ob-leibniz       observatory
  26 ob-life          observatory
  27 daily-life       observatory
  28 fg-mover         first-gate
  29 fg-contingent    first-gate
  30 fg-kalam         first-gate
  31 fg-limits        first-gate
  32 daily-scroll     first-gate
  33 daily-isaiah     first-gate
  34 hl-mind          high-lookout
  35 hl-meaning       high-lookout
  36 hl-beauty        high-lookout
  37 daily-grace      high-lookout
  38 daily-rest       high-lookout
  39 daily-door       high-lookout

Sequence: mercy-first Story Creek opening, then Why Gate foundation pack
(stepped unlock), then Witness leftovers → porch leftovers → Sky Watch
(fine-tuning stays here) → Why Gate cosmological walks → Meaning Ridge.

INCLUDED
--------
  Evidence briefs (claim, reason, source, choices) on each tier
  Easy plain teach/gloss/word (shortStory)
  Medium teach (mediumTeach)
  Area + daily challenge context/deeper/prompt/tiles (Hard)
  Street homes, Match clues, STREET_WHYS
  Journal pages keyed by unlockAfter (not gated)
  Hub/Easy uiChrome constants (index)

EXCLUDED / SEPARATE
-------------------
  td-watch Love how-to → <tools> (not a held claim)
  j-trail-* thank-you cards → <trailNotes>
  Dig-deeper external href dossiers — not player claim text
  Non-player code, art assets, save/migration logic

EDITING
-------
  See <howToEdit> in each areaPack and SCHEMA.md.
  Prefer flat tags; keep empty optional fields; preserve stable lesson ids.
  Do not clone/PR the game repo from this box harvest.
