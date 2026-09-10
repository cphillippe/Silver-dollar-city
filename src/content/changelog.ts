/** Player-facing notes for Settings → What’s new. Add a row per pack or app drop. */
export interface ChangeNote {
  version: string
  title: string
  when: string
  items: string[]
}

export const CHANGELOG: ChangeNote[] = [
  {
    version: '1.4.3',
    title: 'Classic sources',
    when: '2026-09-10',
    items: [
      'Dig deeper: Scripture and older witnesses when they fit; later faithful sources welcome when they help.',
      'Source chips read Scripture, Ancient, Classic, and Modern · believing.',
    ],
  },
  {
    version: '1.4.2',
    title: 'Done, then Build this',
    when: '2026-09-10',
    items: [
      'After you pick the reason that still holds, a gold Done waits — the quiz does not vanish on its own.',
      'Link the street still uses the 3-step wizard. After the third link: All 3 links complete, then Done.',
      'The building button is Build this. The success beat is still Built! You earn the next look by learning, not by paying.',
    ],
  },
  {
    version: '1.4.1',
    title: 'Plain next words',
    when: '2026-09-10',
    items: [
      'Easy names the next tap in plain words: Read today’s story, Choose the sentence to remember, Connect sentence → place → person.',
      'After you pick a sentence, Reason never sits still — you get Held, then Done (or a miss you can try again).',
      'Link the street is a 3-step wizard: one pick per step, checkmarks, then Link complete.',
      'A building you earned shows one Upgrade button. If you have not earned it yet, one sentence says what is missing. Upgrade still means a better building you earn by learning, not by paying.',
    ],
  },
  {
    version: '1.4.0',
    title: 'A city you build',
    when: '2026-09-10',
    items: [
      'The town map is a city of buildings. Tap a lot to manage it: see the level, who lives there, which ideas are lit, and Dig deeper.',
      'Upgrades are earned by learning — finishing walks, holding claims, Link the street, and journal pages. Tap Upgrade to raise the next look. You do not pay.',
      'Walk stays porch → creek → square → sky → gate → lookout → Heaven. Easy still teaches: a claim is what we hold to be true.',
    ],
  },
  {
    version: '1.3.9',
    title: 'The map tells the walk',
    when: '2026-09-10',
    items: [
      'Town lots have in-world reasons: Mercy’s pictures at the creek, Silas’s ledger on the square, Juniper’s lamp on the porch, Nora’s sky on the ridge, Ansel’s stone at the gate, Hope’s look over the town.',
      'The legend names the walk: porch lamp → creek stories → square names → ridge sky, then gate and lookout toward Heaven.',
      'Link the street still lights the same three spots. Easy still teaches a claim as what we hold to be true.',
    ],
  },
  {
    version: '1.3.8',
    title: 'Link lights the map',
    when: '2026-09-10',
    items: [
      'Link the street: each match lights a spot on the town map. Tap the place later to open that idea again.',
      'Easy still: you’ll reopen them from your scrapbook of links. One story at a time.',
    ],
  },
  {
    version: '1.3.7',
    title: 'Kalām, positively',
    when: '2026-09-10',
    items: [
      'First Gate journal: the kalām syllogism leads cleanly — what begins has a cause. Sources are Philoponus and al-Ghazālī first; Craig is the modern statement only.',
      'Witness Bench: Luke’s inquiry posture stands to be weighed.',
    ],
  },
  {
    version: '1.3.6',
    title: 'Teach the words',
    when: '2026-09-10',
    items: [
      'Hard words are taught first: a claim is what we hold to be true. Reason is why it stands. Source is where it comes from. Creed, parable, fine-tuning, and premise get a kid-plain gloss before they show up in play.',
      'Teach still comes before the Hold lock — story and picture first, then the claim. Easy mode uses stronger glosses. Mystery can wait until after the line is taught.',
      'Unread jargon (contingency, qualia, raw parameters) stays in Hard / Dig deeper, or is taught as “might not have been,” “felt redness,” and “life’s dials.” Kalām is taught as the beginning argument first.',
      'Easy mode is still off until you ask — Welcome checkbox or Settings → Reading.',
    ],
  },
  {
    version: '1.3.5',
    title: 'Say the line',
    when: '2026-09-10',
    items: [
      'After every win, one claim to say out loud. Why it stands and the source wait in Dig deeper — and on Profile.',
      'First session: one Do this next card. The town stays candy; it does not add a second primary tap under the map.',
      'Easy mode still off until you ask — Welcome checkbox or Settings → Reading.',
    ],
  },
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
      'Dig deeper: Scripture and older witnesses when they fit; later faithful sources welcome when they help.',
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
