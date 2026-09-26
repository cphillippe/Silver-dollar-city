/** Player-facing notes for Settings → What’s new. Add a row per pack or app drop. */
export interface ChangeNote {
  version: string
  title: string
  when: string
  items: string[]
}

export const CHANGELOG: ChangeNote[] = [
  {
    version: '1.4.156',
    title: 'Lock In: short-phone arena thin',
    when: '2026-09-25',
    items: [
      'Easy Lock In (WhyBlast) on ≤720px tall: thin HUD · chips · claim so the arena keeps the phone — miss teach stays readable (Story Snap ≤720 family; Fixes #193)',
    ],
  },
  {
    version: '1.4.155',
    title: 'Easy Home: short next-step whisper',
    when: '2026-09-25',
    items: [
      'Easy Home dock whisper: mazeHome / runHome are short next-step (“One more road/run”) — no full mazeHunt/runHunt how reprint on taller phones (play how-dedupe 1.4.143/144 stay; Fixes #192)',
    ],
  },
  {
    version: '1.4.154',
    title: 'Father run: short-phone speech thin',
    when: '2026-09-25',
    items: [
      'Easy Father run on ≤720px tall: compress hired-hand speech chrome (kicker · line · bar · count) so pad + timer stay readable without scrolling (keep timer; Fixes #191)',
    ],
  },
  {
    version: '1.4.153',
    title: 'Samaritan road: default board-first',
    when: '2026-09-25',
    items: [
      'Easy Samaritan road default Find/walk: peel help-phase chrome compress onto default play — thumbs · caption · beats thin so the board keeps the phone (board-first after how-dedupe 1.4.143; Fixes #190)',
    ],
  },
  {
    version: '1.4.152',
    title: 'Story Snap: short-phone teach thin',
    when: '2026-09-25',
    items: [
      'Easy Story Snap on ≤720px tall: pad owns how (quiet Tap-when hint off); snap-teach stays a thin strip so the lane keeps the phone (maze help-phase family; Fixes #189)',
    ],
  },
  {
    version: '1.4.151',
    title: 'BuildArgument: one how line on Easy',
    when: '2026-09-25',
    items: [
      'Easy BuildArgument: skip redundant premise .sort-how when PuzzleHint/lead already teach — one–two chrome lines (Clear family with Sort how 1.4.138 / lead≈hint 1.4.145; Fixes #188)',
    ],
  },
  {
    version: '1.4.150',
    title: 'Easy Home: Match-first coach',
    when: '2026-09-25',
    items: [
      'Easy Home cold coach: Match → Learn → Lock In — “now” highlights Match (real next play); Learn stays a re-read, not a false first step (Fixes #187)',
    ],
  },
  {
    version: '1.4.149',
    title: 'Cold Start Easy: Home before Match',
    when: '2026-09-25',
    items: [
      'Cold Start Easy: Welcome → Easy Home (palace map + Learn→Match→Lock In coach) before Match — reopen of 1.4.112 KEEP→link routing (Fixes #186)',
    ],
  },
  {
    version: '1.4.148',
    title: 'Challenge: one title line on Easy',
    when: '2026-09-25',
    items: [
      'Easy ChallengeScreen (area Sort·Sequence): hide puzzle-title — match LinkScreen Easy null title so only PuzzleLead shows on short phones (Clear family with Link Easy title; Fixes #185)',
    ],
  },
  {
    version: '1.4.147',
    title: 'Creed merge: one how line',
    when: '2026-09-25',
    items: [
      'Easy creed merge: omit redundant Drop/Smash .sort-how — Drop chip · smash hint · ladder already teach the bowl (Clear family with Samaritan maze 1.4.143 / Father run 1.4.144; Fixes #184)',
    ],
  },
  {
    version: '1.4.146',
    title: 'Sequence: one lead line on Easy',
    when: '2026-09-25',
    items: [
      'Easy Sequence: skip PuzzleHint when it near-dupes PuzzleLead Keep/Toss (fg-reason / fg-ground) — one task line above tap-the-next-stone steps (Clear family with Sort lead≈hint 1.4.145)',
    ],
  },
  {
    version: '1.4.145',
    title: 'Sort: one lead line on Easy',
    when: '2026-09-25',
    items: [
      'Easy Sort: skip PuzzleHint when it near-dupes PuzzleLead Keep/Toss (fg-order / fg-ought) — one task line; .sort-how still off when hint text exists (Clear family with Match/Sort how dedupe 1.4.137/138)',
    ],
  },
  {
    version: '1.4.144',
    title: 'Father run: one how line',
    when: '2026-09-25',
    items: [
      'Easy Father run: omit redundant Hold/glow .sort-how — run-pad, miss toast, and story-caption already teach the dash (Clear family with Samaritan maze 1.4.143 / Match·Sort how dedupe)',
    ],
  },
  {
    version: '1.4.143',
    title: 'Samaritan road: one how line',
    when: '2026-09-25',
    items: [
      'Easy Samaritan road: omit redundant mazeHunt .sort-how — maze-beats · story-caption · score already teach Find · Help · Inn (Clear family with Match/Sort how dedupe 1.4.137/138)',
    ],
  },
  {
    version: '1.4.142',
    title: 'Lock In: one claim-pick cue',
    when: '2026-09-25',
    items: [
      'Easy Lock In claim-pick: drop stacked Main idea teach-chip above next-tap — one action cue (“Tap the main idea you kept”) after Learn triad 1.4.140 + Lock In Main idea labels 1.4.139/141',
    ],
  },
  {
    version: '1.4.141',
    title: 'Lock In: live Main idea label',
    when: '2026-09-25',
    items: [
      'Easy Lock In why-blast: label the live arena claim Main idea (same Clear family as miss teach 1.4.139 + Learn HeldTriad 1.4.140) so play reads Main idea · tap why — not a bare claim card until you miss',
    ],
  },
  {
    version: '1.4.140',
    title: 'Learn: one Main idea · why · From triad',
    when: '2026-09-25',
    items: [
      'Easy Learn: drop orphan “The main idea you will keep” claim above HeldTriad — one full triad Main idea · Why this is true · From (Clear family with Lock In miss 1.4.139)',
    ],
  },
  {
    version: '1.4.139',
    title: 'Lock In: miss teach Main idea · why · From',
    when: '2026-09-25',
    items: [
      'Easy Lock In miss teach: one miss badge (sheet only — no HUD dup); claim line labeled Main idea so teach reads Main idea · Why this is true · From (Clear family with Match/Sort how dedupe)',
    ],
  },
  {
    version: '1.4.138',
    title: 'Sort: one how line on Easy',
    when: '2026-09-25',
    items: [
      'Easy Sort: keep PuzzleHint teach line; skip redundant Keep/Toss .sort-how when the easy hint shows (one how line — Clear family with Match 1.4.137)',
    ],
  },
  {
    version: '1.4.137',
    title: 'Match: one how line on Easy',
    when: '2026-09-25',
    items: [
      'Easy Match: dedupe PuzzleHint when it repeats EASY.matchHow — keep a single .sort-how line (daily-gems, daily-lantern, daily-door, ph-seeds)',
    ],
  },
  {
    version: '1.4.136',
    title: 'Home map: plant Easy folk + soften candy roads',
    when: '2026-09-25',
    items: [
      'Easy Home: folk lift/nudge onto Pack A candy seats (East porch, gate, lookout) — portraits lowered, purple seat ovals hidden on Easy',
      'Easy Home: hide SVG street/creek overlays when candy map-bg already paints valley paths; hard trail keeps whisper-tan connectors',
    ],
  },
  {
    version: '1.4.135',
    title: 'Home map plate fix: candy image fill + folk portraits',
    when: '2026-09-25',
    items: [
      'Pack A candy plots: stylesheet fill:none !important on .city-plot-img so SVG image viewports no longer paint light plates through cutout alpha (Pages, East porch)',
      'TownFolk and welcome folk: replaced foreignObject HTML Avatar with clipped SVG portrait images (walker pattern) — no rectangular chrome behind circular faces',
    ],
  },
  {
    version: '1.4.134',
    title: 'Flatten memory-palace map bg under plot seats',
    when: '2026-09-25',
    items: [
      'Home map background replaced with flattened candy valley plate — continuous grass under hollow, gate, and porch seats (0% brown dirt cake at anchors)',
      'Pack A plot cutouts and 1.4.133 CSS cascade fix unchanged; streets, creek, plots, and HeavenCity stay SVG overlays',
    ],
  },
  {
    version: '1.4.133',
    title: 'Clean candy cascade fix: no plates, no gold rings',
    when: '2026-09-25',
    items: [
      'Home map: candy plot killers moved after is-built/is-lit/is-next stage rules so fill/stroke/filter no longer paint white plates through cutout alpha',
      'Pack A (porch, gate, journal, hollow): hit circles and ready rings no longer inherit gold stroke; next halo softens on easy Pack A lots',
      'PlotImageArt belt-and-suspenders fill="none" stroke="none" on candy raster images',
    ],
  },
  {
    version: '1.4.132',
    title: 'Clean candy Home: Pack A cutouts + memory-palace bg',
    when: '2026-09-25',
    items: [
      'Easy-trail Pack A (porch, gate, journal, hollow) plot webps replaced with clean candy cutouts — building only, no dirt cake or floating grass pads (Bill lock)',
      'Home map background: geometric SVG hills/sky replaced with candy memory-palace valley plate; streets, creek, plots, and HeavenCity stay SVG overlays',
      'Candy plot glow rings removed — bg owns ground, lit/next selection no longer paints cheap yellow halos on raster plots',
    ],
  },
  {
    version: '1.4.131',
    title: 'Pack A true alpha + map overlay fix',
    when: '2026-09-25',
    items: [
      'Easy-trail Pack A plot webps replaced with true RGBA alpha cutouts — no white plates behind porch, gate, journal, or hollow',
      'Home map: grey/dark mid-map overlay blob fixed — group fill/stroke/filter no longer paints on candy raster plots',
      'Lit/next glow scoped to the plot image instead of the SVG group bounding box',
    ],
  },
  {
    version: '1.4.130',
    title: 'Home map candy plot images',
    when: '2026-09-25',
    items: [
      'Easy-trail Pack A: porch, gate, journal, and hollow use slight-iso candy webp art on the Home map — phone-big landmarks',
      'SVG side-elevation fallback kept for bench, lamps, observatory, lookout, and empty/staked lots',
      'Hit circles, tags, sparks, and TownFolk unchanged',
    ],
  },
  {
    version: '1.4.129',
    title: 'Samaritan HELP contain',
    when: '2026-09-25',
    items: [
      'HELP phase: hurt + Help pill stay inside the cell — no gold-arena clip; one affordance (skip duplicate you face on help cue)',
      'HELP phase chrome compress — beat row + thumbs shrink so the board fills the phone',
      'Caption uses maze teach line (“Stop. Help the hurt man.”) during HELP, not walk-past panel text',
    ],
  },
  {
    version: '1.4.128',
    title: 'Cursor hop guardrails / peel map',
    when: '2026-09-25',
    items: [
      '`.cursor/rules/cursor-hop-efficiency.mdc` — agents open peeled modules first (CityPlotArt, gemSearchGrid, cityModel, scoped CSS)',
      'No gameplay change — Dig/Hard/NW/Town/stores/Match/Lock In parked',
    ],
  },
  {
    version: '1.4.127',
    title: 'TS peels for cheap hops',
    when: '2026-09-25',
    items: [
      'Peel CityMap plot/SVG art → city/CityPlotArt.tsx; shell (camera, beats, mind-map) stays in CityMap (~726 LOC)',
      'Peel gemSearch grid placement/fill/snap → gemSearchGrid.ts; puzzle orchestration + MATCH_CHIPS stay in gemSearch.ts',
      'Peel city model math → cityModel.ts; city.ts keeps storage re-exports — Dig/Hard/NW/Town/stores/Match/Lock In parked',
    ],
  },
  {
    version: '1.4.126',
    title: 'CSS peels + scoped tests',
    when: '2026-09-24',
    items: [
      'Peel match/city/defend/maze/gem/sortHold/welcome/win sheets from tip index.css — Keep Manage denser (1.4.122–124) + Samaritan road flush (1.4.125)',
      'Scoped npm test / test:* via run-checks + readAppCss so peeled CSS stays visible to asserts',
      'Infra only — Dig/Hard/NW/Town/stores/Match/Lock In parked',
    ],
  },
  {
    version: '1.4.125',
    title: 'Samaritan road flush on phone',
    when: '2026-09-24',
    items: [
      'Easy Samaritan road / Mercy · Story Creek: maze board fills ~390px play width (kill dvh width-cap gutters); bigger tiles + actors',
      'Bigger HURT MAN / HELP / INN beat faces; compress how/kicker/thumbs/caption chrome so the board gets the space',
      'Gold/purple Easy chrome + walk/Help/hurt-man path from 1.4.110/116 kept — Dig/Hard/NW/Town/stores/Home Manage/Match/Lock In parked',
    ],
  },
  {
    version: '1.4.124',
    title: 'Manage sheet keeps map visible',
    when: '2026-09-24',
    items: [
      'Easy Manage: bottom sheet (~half phone) so the Home candy map stays visible above — no opaque wall over the lot',
      'Light scrim only; skip the one-shot zoom pulse while Manage is open so the map does not move under a hidden card',
      'PLACE·PERSON·MAIN IDEA stay compact from 1.4.122; Dig/Hard/NW/Town/stores/Match/Lock In/Road maze parked',
    ],
  },
  {
    version: '1.4.123',
    title: 'Lock In miss recovery',
    when: '2026-09-24',
    items: [
      'Easy Lock In miss: wrong why-chip opens a compact teach sheet (claim · why-true · From source) with Try again — chip stays gone, one-more juice on retry; Dig/Hard/NW/Town/stores/Home/Match parked',
      'Easy RecallGate teach after two misses: Try again returns to the reason ask instead of ending the Hold cold',
      'Phone ~390: compress empty Easy Hold / why-arena chrome so miss teach fits without sparse gaps',
    ],
  },
  {
    version: '1.4.122',
    title: 'Manage tight + whole map visible',
    when: '2026-09-24',
    items: [
      'Easy Manage lot sheet: compress empty padding so PLACE·PERSON·MAIN IDEA hug content (side-by-side Place+Person); Walk CTA stays big — Dig/Match/Home layout parked',
      'Easy Home full-viewport map: show the entire map (preserveAspectRatio meet / contain letterbox) instead of cover-slice crop that hid edges',
      'Map zoom juice: Build this / tap lot / upgrade briefly zooms toward that place, then settles back to the full map — not a sticky crop',
    ],
  },
  {
    version: '1.4.121',
    title: 'Home map fills the phone',
    when: '2026-09-24',
    items: [
      'Easy Home: map is the whole-screen surface under the purple/gold menu; Build It + Match/Lock In sit in a thin bottom dock overlay — no mid-page card, no stacked button columns shrinking the map; Dig/Hard/stores stay parked',
    ],
  },
  {
    version: '1.4.120',
    title: 'Home Build It · big map',
    when: '2026-09-24',
    items: [
      'Easy Home: Build It is a real card (gift + Build this opens the next lot); map is the hero (~62vh); Match/Lock In/Learn stay compact; Extra streets packs stay parked off Easy Home; map overlays quieter',
    ],
  },
  {
    version: '1.4.119',
    title: 'Match flush grid',
    when: '2026-09-24',
    items: [
      'Easy Match letter board: tiles stay flush in straight columns and rows on phone width — no overlap or jagged gaps between candy cells',
    ],
  },
  {
    version: '1.4.118',
    title: 'Easy menu consistent',
    when: '2026-09-24',
    items: [
      'Easy chrome: Home · Lock In · Settings top menu everywhere after Welcome; ← Home always lands on Home; compact matching header on Home/Settings/Learn/Match/Lock In; Reset this Easy walk plainly named in Settings',
    ],
  },
  {
    version: '1.4.117',
    title: 'Lock In win stays',
    when: '2026-09-24',
    items: [
      'After the correct why-chip: LOCKED! and the gold chip stay visible, Keep scrolls into view, and the Hold beat continues on its own — no hunting for a vanished win',
    ],
  },
  {
    version: '1.4.116',
    title: 'Hurt man works',
    when: '2026-09-24',
    items: [
      'Samaritan road: tap the hurt man walks one step toward him (no full teleport); after find, a Help label sits on his cell so the mercy beat completes',
    ],
  },
  {
    version: '1.4.115',
    title: 'Easy Match phone polish',
    when: '2026-09-24',
    items: [
      'Easy Match on a short phone: the teach dock stays a thin strip so the candy board keeps the swipe, the loci sheet hands the next finger back to the letters, find / BONUS / +1000 each land as one punch, and after Matched! Lock In next is the loud button',
    ],
  },
  {
    version: '1.4.114',
    title: 'Match crossword perfect',
    when: '2026-09-23',
    items: [
      'Easy Match: short-phone teach dock keeps the board swipe plane; loci sheet dismiss hands the next finger to the board; find / BONUS / dock +1000 each get one punch; teach chips plant before fill; after Matched! Lock In next is the loud CTA',
    ],
  },
  {
    version: '1.4.113',
    title: 'Welcome Easy-only',
    when: '2026-09-23',
    items: [
      'Welcome hides Hard and Easy/Hard twin toggles — one Start Easy message (reasons to believe); Hard stays in Settings only',
    ],
  },
  {
    version: '1.4.112',
    title: 'Start Easy · Learn → Match → Lock In',
    when: '2026-09-23',
    items: [
      'New-user Easy trail: Welcome primary CTA is Start Easy (Hard stays quiet); Easy Home shows a Learn → Match → Lock In coach strip under the map until Match ready and the line is held',
    ],
  },
  {
    version: '1.4.111',
    title: 'Home is a memory palace',
    when: '2026-09-23',
    items: [
      'Easy Home: town map is the primary visual (person · place · idea); Match / Lock In / Learn sit under the map — Night Watch and Hard town chrome stay parked',
    ],
  },
  {
    version: '1.4.110',
    title: 'Real Samaritan road maze',
    when: '2026-09-23',
    items: [
      'Samaritan road: tap/swipe/arrows move one open-road step at a time — no far-tap auto-walk; walls matter; Hurt → Help → Inn stays the mercy walk',
    ],
  },
  {
    version: '1.4.109',
    title: 'Perfect Match · Easy teach chips',
    when: '2026-09-22',
    items: [
      'Match teach: every Easy shelf lesson has authored who/where/idea/keep MATCH_CHIPS + a kid say sentence — Perfect Match teaching unit, not claim-token scrape; Why Gate keep/sky scenes stay (no creek filler off Story Creek)',
    ],
  },
  {
    version: '1.4.108',
    title: 'Freemium chrome polish',
    when: '2026-09-22',
    items: [
      'Freemium chrome polish: Support, Shop, and soft pause copy keep the earn path clear while stores stay parked',
    ],
  },
]

/** Resolve What’s new copy for a version (falls back to newest). */
export function latestChange(version: string): ChangeNote {
  const note = CHANGELOG.find((item) => item.version === version) ?? CHANGELOG[0]
  if (!note) {
    return { version, title: 'Easy core trail', when: '', items: [] }
  }
  return note
}
