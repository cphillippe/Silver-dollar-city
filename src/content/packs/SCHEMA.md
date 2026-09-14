# Silver City content packs — schemaVersion 3

Per-area XML is the **content source of truth** for Learn → Match → Hold. TypeScript modules adapt packs into the play engine (puzzles, Night Watch, and chrome stay in TS).

## Files

| File | Role |
| --- | --- |
| `index.xml` | Pack manifest (`schemaVersion="3"`). Lists area files. May include East porch / trail lessons. |
| `parable-hollow.xml` | Story Creek |
| `witness-bench.xml` | Witness Square |
| `observatory.xml` | Sky Watch |
| `first-gate.xml` | Why Gate |
| `high-lookout.xml` | Meaning Ridge |

One XML file per district area, plus `index.xml`.

## Root

```xml
<packIndex schemaVersion="3" id="core-v0" title="Core trail">
  <area file="parable-hollow.xml" id="parable-hollow" />
  …
</packIndex>
```

Area documents:

```xml
<area schemaVersion="3" id="parable-hollow" order="1" title="Story Creek" …>
  <blurb>…</blurb>
  <intro>…</intro>
  <lesson id="ph-road" title="The Good Samaritan">…</lesson>
</area>
```

## Lesson

- **Held claim** (`<claim>`) is identical and plain on every tier.
- **`<plain>`** restates the claim in short speech. It does not replace the stored line.
- **`<source>`** is the citation.
- **`<loci>`** names who keeps the line and where it lives (Match place / person).

Each lesson has three tiers:

| Tier | Points | Hold `levelUpTo` | Hold `onFail` |
| --- | --- | --- | --- |
| `<easy points="10" easyOrder="N">` | 10 | `medium` | `easy` |
| `<medium points="12">` | 12 | `hard` | `easy` |
| `<hard points="15">` | 15 | (omit — top) | `easy` |

`easyOrder` is global across all packs. The Easy trail walks **all 35 facts** in that order. First is Mercy at Story Creek (`ph-road`).

### Tier body

- **`<learn>`** — teach-before-test. Easy stays kid-plain. Hard teach may go deeper. No skeptic hedges in takeaways. Fine-tuning stays Designer-first. `daily-stars` stays pure positive (heavens speak of a Maker).
- **`<match>`** — sentence ↔ place ↔ person (loci). Same held claim on every tier.
- **`<hold>`** — claim + why chips. `levelUpTo` Easy → Medium → Hard. `onFail="easy"` always.

Journal scores **best tier** per idea (10 / 12 / 15) and shows that score on the page. Failing Hold drops the idea back to Easy play without erasing the best score.

## Voice

Apologist. Daily-stars pure positive. Designer on fine-tuning. No skeptic hedges in takeaways. Designer may still fine-tune copy in these files — the engine must not invent conflicting lesson text once a pack is loaded.
