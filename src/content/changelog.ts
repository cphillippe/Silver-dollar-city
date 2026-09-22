/** Player-facing notes for Settings → What’s new. Add a row per pack or app drop. */
export interface ChangeNote {
  version: string
  title: string
  when: string
  items: string[]
}

export const CHANGELOG: ChangeNote[] = [
  {
    version: '1.4.107',
    title: 'Match teach dock · readable contrast',
    when: '2026-09-22',
    items: [
      'Match teach: WHO/WHERE chips and the say sentence use high-contrast ink, solid borders, and readable pending/found word states',
      'Lock In: after LOCKED!, the screen scrolls and auto-scrolls to the Yes CTA so the action stays reachable on phone',
    ],
  },
  {
    version: '1.4.106',
    title: 'Match teach · connected Why Gate chips',
    when: '2026-09-21',
    items: [
      'Match teach: Why Gate boards use authored who/where/idea/keep chips + a building say sentence (e.g. Cosmo·Rock·Ground·God) — not four unconnected crossword words; LociStamp secondary; Mercy Story Creek comics stay',
    ],
  },
]
