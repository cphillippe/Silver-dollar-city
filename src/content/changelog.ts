/** Player-facing notes for Settings → What’s new. Add a row per pack or app drop. */
export interface ChangeNote {
  version: string
  title: string
  when: string
  items: string[]
}

export const CHANGELOG: ChangeNote[] = [
  {
    version: '1.4.37',
    title: 'Easy core loop',
    when: '2026-09-11',
    items: [
      'The First Gate is now Why Gate — the stop that asks why there is a world at all. Ansel Gate still keeps it.',
      'Easy home is still Match, Saved, and Night Watch — Town (soon) waits under Settings → More.',
      'Easy Night Watch finishes at 6/6. TAP n/6 is the score. Six face taps win the night.',
      'Match stays sentence → place → person with a named miss and Next.',
    ],
  },
  {
    version: '1.4.36',
    title: 'Easy core loop',
    when: '2026-09-11',
    items: [
      'Cast names now stick to place and idea: Juniper Wick, Silas Whitman, Nora Skye, Hope Ridge. River, Mercy Wren, and Ansel Gate stay.',
      'Easy home is still Match, Saved, and Night Watch — Town (soon) waits under Settings → More.',
      'Easy Night Watch finishes at 6/6. TAP n/6 is the score. Six face taps win the night.',
      'Match stays sentence → place → person with a named miss and Next.',
    ],
  },
  {
    version: '1.4.35',
    title: 'Easy core loop',
    when: '2026-09-11',
    items: [
      'Match uses a flat candy tile for Neighbor shows mercy — same simple shapes as the other cards. Mercy’s creek stays the creek tile.',
      'Easy home is still Match, Saved, and Night Watch — Town (soon) waits under Settings → More.',
      'Easy Night Watch finishes at 6/6. TAP n/6 is the score. Six face taps win the night.',
      'Match stays sentence → place → person with a named miss and Next.',
    ],
  },
  {
    version: '1.4.34',
    title: 'Easy core loop',
    when: '2026-09-11',
    items: [
      'Match shows the Jericho-road picture first on Neighbor shows mercy, then the words. Mercy’s creek still uses the creek tile.',
      'Easy home is still Match, Saved, and Night Watch — Town (soon) waits under Settings → More.',
      'Easy Night Watch finishes at 6/6. TAP n/6 is the score. Six face taps win the night.',
      'Match stays sentence → place → person with a named miss and Next.',
    ],
  },
  {
    version: '1.4.33',
    title: 'Easy core loop',
    when: '2026-09-11',
    items: [
      'Easy home has no Town map and no sticky fog box over the buttons. Match, Saved, and Night Watch sit clean on the page.',
      'Town (soon) waits under Settings → More. Hard still has the streets.',
      'Easy Hold is still the teach chip, one main-idea line, a scrollable reason, and Keep this.',
      'Easy Night Watch finishes at 6/6. Match stays sentence → place → person with a named miss.',
    ],
  },
  {
    version: '1.4.32',
    title: 'Easy core loop',
    when: '2026-09-11',
    items: [
      'Easy Hold is one line: the teach chip, the main idea, a scrollable reason, and Keep this. The sentence is not the button.',
      'Sticky Keep this / Done never covers the reason. Easy home is still Match, Saved, and Night Watch — Town (soon) waits under Settings → More.',
      'Easy Night Watch finishes at 6/6. TAP n/6 is the score. Six face taps win the night.',
      'Match stays sentence → place → person with a named miss and Next.',
    ],
  },
  {
    version: '1.4.31',
    title: 'Easy core loop',
    when: '2026-09-11',
    items: [
      'Easy home is Match, Saved, and Night Watch. The Town map waits under Settings → More as Town (soon).',
      'Easy Night Watch finishes at 6/6. TAP n/6 is the score. Six face taps win the night.',
      'Match stays sentence → place → person with a named miss and Next.',
      'Saved keeps the sentences you held. Dig deeper, What’s new, themes, and Heaven-growth theater wait under Settings → More.',
    ],
  },
  {
    version: '1.4.30',
    title: 'Easy core loop',
    when: '2026-09-11',
    items: [
      'Easy Town stays a full readable map. No Lit! zoom. Tap a building to Manage it, walk, or Build this.',
      'Easy Night Watch finishes at 6/6. TAP n/6 is the score. Six face taps win the night.',
      'Match stays sentence → place → person with a named miss and Next.',
      'Saved keeps the sentences you held. Dig deeper, What’s new, themes, and Heaven-growth theater wait under Settings → More.',
    ],
  },
  {
    version: '1.4.29',
    title: 'Easy core loop',
    when: '2026-09-11',
    items: [
      'Easy Town is Match, Hold, Night Watch, and a readable map. Tap a building to Manage it, walk, or Build this when you earned it.',
      'Easy Night Watch finishes at 6/6. TAP n/6 is the score. Six face taps win the night.',
      'Match stays sentence → place → person with a named miss and Next.',
      'Saved keeps the sentences you held. Dig deeper, What’s new, themes, and Heaven-growth theater wait under Settings → More.',
    ],
  },
  {
    version: '1.4.28',
    title: 'The town grows into Heaven',
    when: '2026-09-11',
    items: [
      'The map starts as Eden — porch, creek garden, a star on the ridge. Streets and houses appear as you walk, hold, and Build this.',
      'Heaven is earned. The trail climbs as you keep the lines. City of Heaven stands when the lookout is lit and the lines still hold.',
      'Easy Night Watch finishes at 6/6 — six face taps, or a clear win. Hearts stay hearts; TAP n/6 is the score.',
      'Town names stay in their slots while the town grows. Portraits and speech bubbles no longer cover the chips.',
      'Easy chrome uses plain instructions and examples — unkind sentence, not mean line; Keep/Toss tiles drop throttle, first-century banking, and contradiction.',
    ],
  },
  {
    version: '1.4.27',
    title: 'The town grows into Heaven',
    when: '2026-09-11',
    items: [
      'The map starts as Eden — porch, creek garden, a star on the ridge. Streets and houses appear as you walk, hold, and Build this.',
      'Heaven is earned. The trail climbs as you keep the lines. City of Heaven stands when the lookout is lit and the lines still hold.',
    ],
  },
  {
    version: '1.4.26',
    title: 'Town names sit in their own slots',
    when: '2026-09-11',
    items: [
      'Town chips stack so every full name stays readable at phone width — Parable Hollow, Witness Bench, East porch, Star lamps, Pages, City of Heaven.',
      'Portraits sit above the name band. Names no longer cover each other.',
    ],
  },
  {
    version: '1.4.25',
    title: 'Saved folds by section',
    when: '2026-09-11',
    items: [
      'Saved, Journal, and Profile fold by section. Tap a row to open it. The first section starts open.',
      'Each fold shows a short name and a count — not a wall of pages.',
      'Journal nests street pages under Places. Profile folds sentences, places, people, things you can use, and connections.',
    ],
  },
  {
    version: '1.4.24',
    title: 'Town map labels · Easy and Hard',
    when: '2026-09-11',
    items: [
      'Town map labels no longer pile up. The picture fills the panel — no purple empty bands.',
      'Witness Bench opens Manage. If the square is still locked, it says why and offers Walk Parable Hollow next.',
      'Reading is Easy and Hard. Claim teach stays once. Hard Night Watch is unchanged.',
    ],
  },
  {
    version: '1.4.23',
    title: 'Manage and Build this back on the map',
    when: '2026-09-11',
    items: [
      'Easy map names Manage and Build this again. Tap a creek or square lot to open it.',
      'Love shows the line you kept. Love, Logic, Reason, and Science stay on Easy Night Watch.',
      'A claim is the main idea we hold to be true — taught once on Easy.',
    ],
  },
  {
    version: '1.4.22',
    title: 'Tap the face · numbered match steps',
    when: '2026-09-11',
    items: [
      'Night Watch Easy freezes the glowing face under the arrow. Tap the face.',
      'A match keeps 1 · Sentence → 2 · Place → 3 · Person at the top.',
      'Easy Settings drop V0, unlocks, and streak wallpaper. Hard words stay on Hard.',
    ],
  },
  {
    version: '1.4.21',
    title: 'One Easy Night Watch path',
    when: '2026-09-11',
    items: [
      'Night Watch Easy is one glowing person and Love — tap the person for the whole wave.',
      'A match is three screens: pick, then Wrong. Tap this one: …, then Next.',
      'Hard Night Watch and Hard links stay the same.',
    ],
  },
  {
    version: '1.4.20',
    title: 'One person for the whole night',
    when: '2026-09-11',
    items: [
      'Night Watch keeps one glowing person and Love — tap the person for every tap, not just the first.',
      'Road lamps and locked tools stay hidden until that Easy night is done.',
      'A right match waits on Next before new cards show.',
    ],
  },
  {
    version: '1.4.19',
    title: 'One tap line at a time',
    when: '2026-09-11',
    items: [
      'A match now says Tap a sentence, then Tap a place, then Tap a person — one short line.',
      'A miss is one line: Wrong. Tap this one: Neighbor shows mercy.',
      'Night Watch hides locked tools while Tap this person is up, so only Love stays.',
    ],
  },
  {
    version: '1.4.18',
    title: 'Only one person on the road',
    when: '2026-09-11',
    items: [
      'Night Watch hides the road lamps while Tap this person is up, so only one glowing person is on the board.',
      'A wrong match starts Wrong. Tap This one. then names the card.',
      'Love says Love — tap the person until you tap.',
    ],
  },
  {
    version: '1.4.17',
    title: 'Only one person + tap order',
    when: '2026-09-11',
    items: [
      'Night Watch shows only the glowing person while Tap this person is up. Other walkers stay hidden until you tap them.',
      'Match says: Tap the sentence, then the place, then the person.',
      'A wrong match pulses the right card and marks it This one.',
    ],
  },
  {
    version: '1.4.16',
    title: 'One person to tap + plainer words',
    when: '2026-09-11',
    items: [
      'Night Watch shows one glowing person to tap. Other walkers fade and step aside.',
      'A wrong match names the exact card: Tap: “Neighbor shows mercy.”',
      'Easy labels say Saved sentences, Connections, and Things you can use.',
    ],
  },
  {
    version: '1.4.15',
    title: 'Big Night Watch people + next pick',
    when: '2026-09-11',
    items: [
      'Night Watch people are big and slow. They pause with Tap this person, then crawl.',
      'A wrong match says which sentence to pick next.',
      'Easy words stay short. Main idea stays after the one teach.',
    ],
  },
  {
    version: '1.4.14',
    title: 'Easy Wrong match + bigger Night Watch walkers',
    when: '2026-09-11',
    items: [
      'Easy miss copy is Wrong match plus a plain why — no neighbor-line jargon.',
      'Easy Night Watch walkers are bigger and slower. Hard pace stays.',
      'Love tool line: A true main idea can turn a mean line around. No cheap line on Easy chrome.',
      'First Easy teach chip: Main idea = the short true line we keep. Easy chrome prefers match over link.',
    ],
  },
  {
    version: '1.4.13',
    title: 'Easy kid-plain Journal + first Night Watch cue',
    when: '2026-09-11',
    items: [
      'Easy Journal meta is who · where · picture · tool — no Anchored, deploys, or after-quote dump.',
      'Easy chrome drops cheap claim, dossier, unsealed, soils, and Trail notes. Reason says why this is true.',
      'First Easy Night Watch pauses the walker with a pulse arrow: Tap this person.',
      'Link prompt: Pick the sentence that fits this story. Match miss: Wrong match — try again. Picture-match still Keep / Remove / Save your picks.',
    ],
  },
  {
    version: '1.4.12',
    title: 'Easy main idea lines + full lot names',
    when: '2026-09-10',
    items: [
      'Easy Night Watch, Journal, and Use chrome say main idea — not claim or Deploy wallpaper.',
      'Picture-match: Keep the right pictures. Remove wrong picks. Miss: Wrong pair — try a different main idea. Lock-in is Save your picks.',
      'Easy map labels are full names: Parable Hollow, Witness Bench, East porch.',
    ],
  },
  {
    version: '1.4.11',
    title: 'Easy main idea chrome + bigger map labels',
    when: '2026-09-10',
    items: [
      'Easy teaches “A claim is the main idea we hold to be true” once, then chrome says main idea only.',
      'Sort lock-in is Save your picks. Weak readings is wrong picks.',
      'Town map labels are bigger at phone size — Hollow, Porch, and Square.',
    ],
  },
  {
    version: '1.4.10',
    title: 'Easy short card + named next tap',
    when: '2026-09-10',
    items: [
      'Easy Tap this next names what opens — Tap this next — short Jesus story. The story is a short card with Continue and Skip reading, not a wall.',
      'Easy Town hides the Eden-to-Heaven legend dump. Link the street is Match sentence → place → person.',
      'A claim is the main idea we hold to be true — taught once, then Easy chrome says main idea. Parable Hollow gets a Jesus-story creek subtitle.',
    ],
  },
  {
    version: '1.4.9',
    title: 'Easy Tap this next',
    when: '2026-09-10',
    items: [
      'Easy Town keeps one gold Tap this next. Link and Night Watch stay in the tool row — not a stack of poetic cards.',
      'A Night Watch miss on Easy says: You missed the walker — tap the moving person.',
      'Easy manage and Night Watch drop scrapbook, deploy, held-line, and cheap-claim chrome. Dig deeper reads Read more. Claim is not wallpaper.',
    ],
  },
  {
    version: '1.4.8',
    title: 'Easy Link clue + one-tap Night Watch',
    when: '2026-09-10',
    items: [
      'Easy Link shows a short who/where/story clue with the picture so the first pick is learnable. A miss still says why that choice is wrong.',
      'Easy Night Watch is one tap: Do this, then tap the walker. No Unlock → Plant chain, and no “turn cheap lines toward heaven” on Easy chrome.',
      'Easy keeps plain verbs. Claim, hold, and deploy get a one-line gloss only when a locked tool needs them.',
    ],
  },
  {
    version: '1.4.7',
    title: 'Build this stays on screen',
    when: '2026-09-10',
    items: [
      'Manage is a phone-bottom sheet. Build this and Walk stay on screen at 390px — Dig deeper and tool tiles scroll above them.',
      'Night Watch in Easy still opens with one big Do this.',
    ],
  },
  {
    version: '1.4.6',
    title: 'Link starts with the picture',
    when: '2026-09-10',
    items: [
      'Link the street leads with a big picture when we have one — porch lamp, creek, bench, faces — then a short label. Not a wall of sentences.',
      'Dig deeper chips still read Scripture, Ancient, Classic, and Modern · believing.',
    ],
  },
  {
    version: '1.4.5',
    title: 'Sticky next tap',
    when: '2026-09-10',
    items: [
      'Build this, Walk, Done, and Next stay at the bottom of manage sheets and Link — no hunting below the fold.',
      'A wrong tap or a locked building says why, and what is still needed, in one sentence.',
      'Night Watch in Easy: what it is, then Do this. Deploy means use a claim you held.',
    ],
  },
  {
    version: '1.4.4',
    title: 'Recall, then Later',
    when: '2026-09-10',
    items: [
      'A held line is an offer, not a pin. Later keeps it for this walk. Not today waits until morning. No guilt.',
      'A sitting is about 3 pages — never the whole journal.',
      'A second look at a hold comes at a new angle, with Dig deeper — not the first teach again.',
      'Link the street leads with a picture when we have one: faces, creek, bench, porch lamp.',
    ],
  },
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
      'Why Gate journal: the kalām syllogism leads cleanly — what begins has a cause. Sources are Philoponus and al-Ghazālī first; Craig is the modern statement only.',
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
