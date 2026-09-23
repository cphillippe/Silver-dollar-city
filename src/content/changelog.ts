/** Player-facing notes for Settings → What’s new. Add a row per pack or app drop. */
export interface ChangeNote {
  version: string
  title: string
  when: string
  items: string[]
}

export const CHANGELOG: ChangeNote[] = [
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
