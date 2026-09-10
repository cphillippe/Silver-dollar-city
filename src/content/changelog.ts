/** Player-facing notes for Settings → What’s new. Add a row per pack or app drop. */
export interface ChangeNote {
  version: string
  title: string
  when: string
  items: string[]
}

export const CHANGELOG: ChangeNote[] = [
  {
    version: '1.3.2',
    title: 'Town mind map',
    when: '2026-09-10',
    items: [
      'Tap a place on the town map to open its mind map — person, place, and the ideas you unlocked.',
      'Link the street: snap idea ↔ place ↔ person. Those links light nodes you can reopen from the map.',
      'River’s portrait is a cleaner fair-blonde candy face.',
    ],
  },
  {
    version: '1.3.1',
    title: 'River’s look',
    when: '2026-09-10',
    items: [
      'River — the traveler you play — is the fair blonde candy portrait on Welcome, town, and Settings.',
    ],
  },
  {
    version: '1.3.0',
    title: 'V0 launch',
    when: '2026-09-10',
    items: [
      'Candy faces live on the town; lamps, creek, and folk idle and cheer.',
      'Night Watch hits harder — tools stay below the board on a phone.',
      'Observatory teaches first, then two choices. Miss, Try again, finish.',
      'This list is the hook for later packs. Settings always shows the live version.',
    ],
  },
  {
    version: '1.2.0',
    title: 'Designer hold',
    when: '2026-09-09',
    items: [
      'Fine-tuning Hold stays Designer-first. The triad is only on two Observatory clues.',
    ],
  },
]

export function latestChange(version: string) {
  return CHANGELOG.find((note) => note.version === version) ?? CHANGELOG[0]
}
