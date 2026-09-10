/** Player-facing notes for Settings → What’s new. Add a row per pack or app drop. */
export interface ChangeNote {
  version: string
  title: string
  when: string
  items: string[]
}

export const CHANGELOG: ChangeNote[] = [
  {
    version: '1.3.4',
    title: 'Easy mode',
    when: '2026-09-10',
    items: [
      'Easy mode: plainer words, bigger taps, fewer choices at once. Off by default — turn it on at Welcome or Settings → Reading.',
      'Teaches and Holds use shorter sentences and define hard words once. Creed is “old shared belief”; parable is “Jesus story”; mind map is “your scrapbook of links.” The claims stay the same.',
      'Town opens with one Do this next card. Link the street sits above the map, with a tap-idea → place → person demo and a plain takeaway after you match.',
    ],
  },
  {
    version: '1.3.3',
    title: 'Readable town',
    when: '2026-09-10',
    items: [
      'Profile gathers River’s unlocks — held ideas, places, people, tools, and mind-map links. Open it from Town or Settings.',
      'Dig deeper on Hold, Journal, mind map, and Profile: Scripture and the Fathers first; modern believing scholars only when the evidence is modern.',
      'Reset progress is buried in Settings → Danger zone and asks before it wipes the save. It is not on the town screen.',
      'Claims, journal, mind map, and link blocks wrap or scroll on a phone — no clipped takeaways.',
      'Isaiah 53’s Servant is the Jesus the church confesses. Witness, kalām, beauty, and life lines lead with the hold.',
    ],
  },
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
