Silver City — area content packs (runtime source of truth)
==========================================================

appVersion: 1.4.50  (from src/config/app.ts on main)
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
  first-gate.xml       Why Gate / Ansel — 7 lessons
  high-lookout.xml     Meaning Ridge / Hope — 7 lessons
  index.xml            Pack list, Easy trail 1–35, holdRules, scoring, tools, trail notes, uiChrome
  SCHEMA.md            How the game should load packs (1:1 field map)

TOTALS
------
  Lessons (claim·reason·source street facts): 35
  Tiers per lesson: easy + medium + hard (35/35)
  Easy trail lines: 35 (easyOrder 1–35)
  Street facts: 35 (same as lessons)
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

EASY TRAIL ORDER (easyOrder 1–35)
---------------------------------
   1 ph-road          parable-hollow
   2 ph-father        parable-hollow
   3 ph-debt          parable-hollow
   4 wb-creed         witness-bench
   5 wb-women         witness-bench
   6 daily-lantern    parable-hollow
   7 daily-stars      observatory
   8 daily-cosmos     first-gate
   9 hl-moral         high-lookout
  10 ph-seeds         parable-hollow
  11 wb-early         witness-bench
  12 wb-method        witness-bench
  13 daily-names      witness-bench
  14 daily-creed      witness-bench
  15 daily-empty      witness-bench
  16 daily-gems       parable-hollow
  17 daily-seed       parable-hollow
  18 daily-neighbor   parable-hollow
  19 ob-tuning        observatory
  20 ob-design        observatory
  21 ob-leibniz       observatory
  22 ob-life          observatory
  23 daily-life       observatory
  24 fg-mover         first-gate
  25 fg-contingent    first-gate
  26 fg-kalam         first-gate
  27 fg-limits        first-gate
  28 daily-scroll     first-gate
  29 daily-isaiah     first-gate
  30 hl-mind          high-lookout
  31 hl-meaning       high-lookout
  32 hl-beauty        high-lookout
  33 daily-grace      high-lookout
  34 daily-rest       high-lookout
  35 daily-door       high-lookout

Sequence: former Easy 1–9 first; then finish Story Creek → Witness leftovers →
porch leftovers → Sky Watch → Why Gate → Meaning Ridge.

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
