# Silver City area pack schema (runtime content)

**Purpose:** These XML files are the intended **build/runtime content source of truth**. The game should load them (or a build step should compile them into the app) so Learn / Match / Hold / Journal / street map 1:1 from pack fields.

**Engine loader climb next** — packs + this schema only. No loader implementation in-repo from this harvest.

**schemaVersion:** `3` — three tiers per fact (`easy` / `medium` / `hard`) + Hold level-up / fail→Easy.

## Layout

```
silver-city-packs/
  index.xml              # pack list, Easy trail 1–42, holdRules, scoring, tools, trailNotes, uiChrome
  parable-hollow.xml     # Story Creek (+ East porch dailies)
  witness-bench.xml      # Witness Square
  observatory.xml        # Sky Watch
  first-gate.xml         # Why Gate
  high-lookout.xml       # Meaning Ridge
  stone-court.xml        # Stone Court (outside names after the Easy door)
  SCHEMA.md
  README.txt
```

One file per area/pillar. Editors change one street without opening others.

## Root: `<areaPack>`

| Attribute | Role |
|-----------|------|
| `id` | Area id (`parable-hollow`, …) — matches game `Area.id` |
| `schemaVersion` | Pack format version (`3`) |
| `appVersion` | Harvested `APP_VERSION` (e.g. `1.4.50`) |
| `generated` | ISO-8601 timestamp (America/Chicago offset) |
| `host` | Live game host URL |
| `title` / `place` / `person` / `personId` / `plotId` | Area chrome + street home |

Children: `howToEdit`, `meta`, `easyShelf`, `lessons`, `streetFacts`.

## Lesson: `<lesson>` (engine unit)

One claim·reason·source fact = one `<lesson>`. **Easy, Medium, and Hard share the same lesson** — tiers are tracks inside the fact, not forks.

| Attribute | Role |
|-----------|------|
| `id` | Stable evidence id (`ph-father`, …) — **engine key** |
| `place` / `person` | Street home |
| `tripleId` / `ideaId` / `ideaLabel` | Street Match bindings |
| `challengeKind` / `challengeTitle` | Area/daily challenge metadata |

### Three tracks (every lesson)

```xml
<lesson id="ph-father" place="…" person="…" …>
  <easy points="10" easyOrder="N">
    <learn> shortStory, mainIdea, loci, gloss, word, hint … </learn>
    <match> … </match>
    <hold levelUpTo="medium" onFail="easy"> claim, reason, source, why… (PLAIN) </hold>
  </easy>
  <medium points="12">
    <learn> mediumTeach, mainIdea, loci, gloss … </learn>
    <match> … </match>
    <hold levelUpTo="hard" onFail="easy"> same clear claim · reason · source </hold>
  </medium>
  <hard points="15">
    <learn> hardTeach / fullTeach, prompt, challengeTiles, teachOnWrong … </learn>
    <match> … </match>
    <hold onFail="easy"> same clear claim · reason · source (do not mysterious-ize) </hold>
  </hard>
  <journal scoreFromHeldTier="true">…</journal>
</lesson>
```

| Tier | Learn voice | Hold claim | Journal points |
|------|-------------|------------|----------------|
| **easy** | Plain kid/normie `shortStory`; teach-before-test; first Learn still idea+person+place | Clear / plain | `points="10"` |
| **medium** | `mediumTeach` — clearer than Hard, richer than Easy | **Same** clear line | `points="12"` |
| **hard** | Deeper / mysterious teach OK (`hardTeach` / `fullTeach`) | **Same** clear line | `points="15"` |

### `<learn>` by tier

| Tag | Tier | Maps to |
|-----|------|---------|
| `shortStory` | easy | Easy Learn body |
| `mediumTeach` | medium | Medium Learn body |
| `mainIdea` / `gloss` / `loci` | easy (+ copied on medium) | Main idea + street home |
| `hardTeach` / `fullTeach` | hard | Hard challenge context + deeper |
| `prompt` / `teachOnWrong` | hard | Challenge prompt / miss teach |
| `word/term` / `word/sense` / `hint` | easy (optional on medium) | Vocab chip |
| `challengeTiles` | hard | keep/discard/sequence/pair puzzle UIs |

### `<match>` → Match / Link the street

| Tag | Maps to |
|-----|---------|
| `sentenceCorrect` | Correct idea sentence (claim) |
| `sentenceMisses/miss` | Claim distractors |
| `placePrompt` / `personPrompt` / `ideaPrompt` | Link clues |
| `ideaLabel` | Short street caption |
| `whyEasy` / `whyMedium` / `whyHard` | Pre-match “why it lives here” (tier-specific) |

### `<hold>` → Hold / evidence quiz + level-up

| Tag / attr | Maps to |
|------------|---------|
| `claim` / `reason` / `source` | Evidence brief — **identical plain text on all tiers** |
| `whyCorrect` / `whyMisses` | Reason faces. Easy why-blast needs **≥3** unique misses (4 chips: 1 true + 3 toss). Engine invents orthodox extras if a pack is short. |
| `claimChoices` / `reasonChoices` | Quiz faces |
| `@levelUpTo` | Optional next tier: `medium` (from easy) or `hard` (from medium) |
| `@onFail` | Always `easy` — fail Hold or fail level-up → Easy teach path |

## Hold level-up + fail → Easy

Documented in `index.xml` `<holdRules>` and encoded on every tier’s `<hold>`:

1. **Level-up:** After (or during) Hold at the current tier, the player may attempt the next tier’s Hold faces (`levelUpTo`).
2. **Fail → Easy:** If they fail the level-up **or** fail Hold at the current tier, route to **Easy** Learn→Match→Hold for the same lesson (`onFail="easy"`). Teach-before-test retry — not punish.
3. **Hard** has no `levelUpTo` (top teach tier) but still `onFail="easy"`.
4. Held claim stays clear for kids/normies on **all** modes; Hard may use mysterious language only in teach.

## Journal scoring (Bill’s Journal)

Documented in `index.xml` `<scoring>` and encoded on every tier + journal:

| Difficulty | Points (`@points` on `<easy>` / `<medium>` / `<hard>`) |
|------------|--------------------------------------------------------|
| Easy | **10** |
| Medium | **12** |
| Hard | **15** |

Rules:

1. **Score per level (tier):** Journal may show a score contribution for each tier, but each **idea** (lesson/fact held) contributes from its **best tier successfully held** — not a sum of Easy+Medium+Hard.
2. **Best tier held:** If the player holds Hard for an idea, that idea is worth **15** (not 10+12+15). Medium hold without Hard = **12**; Easy only = **10**.
3. **Level-up Hold:** Award the higher tier’s points when the level-up Hold succeeds (replace the prior best for that idea).
4. **Fail → Easy:** On fail→Easy, award Easy points **only if** Easy Hold then succeeds.
5. Pack attrs: every lesson tier carries `@points`; each `<journal>` may set `scoreFromHeldTier="true"`. Index `<scoring>/<journal showScorePerLevel="true" scoreFromHeldTier="true"/>` is the global default.

## Easy trail order

All **42** facts sit on the Easy trail with `easyOrder` 1–42 (see `index.xml` `<easyShelf>`):

1. Keep mercy-first Story Creek opening (`ph-road`, `ph-father`, `ph-debt`).
2. Why Gate foundation pack next, stepped: `fg-order` → `fg-reason` → `fg-ought` → `fg-ground` (next opens after prior Hold).
3. After Dig deeper, Witness leftovers **Names that stay** pack, stepped: `daily-names` → `daily-creed` → `daily-empty` (next opens after prior Hold; source-dig arcade). Then porch leftovers → Sky Watch (fine-tuning stays here) → Why Gate cosmological walks → Meaning Ridge. After the Easy door, **Stone Court** pack, stepped: `sc-tacitus` → `sc-james` → `sc-pliny` (ancient-first source-dig; next opens after prior Hold).

Medium and Hard are available via mode select or Hold level-up — not a separate fact list.

## Content locks (Bill / CoS)

- Held claim stays clear for kids/normies on Easy, Medium, and Hard
- Hard may use mysterious language in teach; Lock-in/Hold claim stays plain
- Easy = Learn→Match→Hold teach-before-test; first Learn still idea+person+place
- Luke 10: Love tool / Compassion story / Mercy claim — don’t flatten
- Apologist voice; no skeptic hedges in takeaways
- `daily-stars` pure positive; fine-tuning Designer takeaway

## Index extras (`index.xml`)

- `<packs>` — six area files + lesson counts
- `<easyShelf>` — global Easy trail order 1–42 with `pack=` pointer
- `<holdRules>` — level-up on Hold; fail → Easy
- `<scoring>` — idea points by tier (10/12/15); journal showScorePerLevel + scoreFromHeldTier (best tier held)
- `<tools>` — `td-watch` Love how-to (not a held claim)
- `<trailNotes>` — `j-trail-*` thank-you cards
- `<uiChrome>` — player-facing hub/match/hold constants

## Loader sketch (for the climb)

1. Fetch or bundle `index.xml` → discover area files + `holdRules`.
2. Parse each `areaPack` → register lessons by `id`.
3. Easy mode: iterate all lessons ordered by `easy/@easyOrder` (1–42).
4. Medium / Hard mode: use `<medium>` / `<hard>` tracks on the same lesson id.
5. Street: build triples from each lesson’s `tripleId` / place / person / `ideaLabel`.
6. Hold: use that tier’s `claim` / `reason` / `source` + choices; honor `@levelUpTo` / `@onFail`.
7. Journal score: for each held idea, take `@points` of the **highest tier successfully held** (easy=10, medium=12, hard=15). Honor `index` `<scoring>` + per-tier `@points` + `journal/@scoreFromHeldTier`.
8. Ignore `<tools>` / `<trailNotes>` as claim lessons. Do not gate Journal.

## Validation

Well-formed XML 1.0, UTF-8. Every lesson must have `<easy>`, `<medium>`, and `<hard>`. Empty optional elements are intentional. Escape `&`, `<`, `>` in text.
