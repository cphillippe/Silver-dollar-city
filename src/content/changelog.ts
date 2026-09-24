/** Player-facing notes for Settings → What’s new. Add a row per pack or app drop. */
export interface ChangeNote {
  version: string
  title: string
  when: string
  items: string[]
}

export const CHANGELOG: ChangeNote[] = [
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
