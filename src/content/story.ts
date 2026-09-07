export type CharacterId =
  | 'river'
  | 'juniper'
  | 'mercy'
  | 'silas'
  | 'nora'
  | 'ansel'
  | 'hope'

export interface Character {
  id: CharacterId
  name: string
  shortName: string
  role: string
  seeking: string
  areaId?: string
}

/** Small Christian cast. Light dialogue, not sermons. */
export const CAST: Record<CharacterId, Character> = {
  river: {
    id: 'river',
    name: 'River',
    shortName: 'River',
    role: 'Traveler',
    seeking: 'Whether the case for God can be walked, not only shouted.',
  },
  juniper: {
    id: 'juniper',
    name: 'Juniper',
    shortName: 'Juniper',
    role: 'Morning lantern',
    seeking: 'One honest line you can still say at breakfast.',
  },
  mercy: {
    id: 'mercy',
    name: 'Mercy Wren',
    shortName: 'Mercy',
    role: 'Parable-teller',
    seeking: 'Stories that ask what kind of neighbor you will be.',
    areaId: 'parable-hollow',
  },
  silas: {
    id: 'silas',
    name: 'Silas Page',
    shortName: 'Silas',
    role: 'Witness clerk',
    seeking: 'Names, dates, and what the first reports actually said.',
    areaId: 'witness-bench',
  },
  nora: {
    id: 'nora',
    name: 'Nora Vale',
    shortName: 'Nora',
    role: 'Observatory keeper',
    seeking: 'Wonder that is not afraid of a telescope.',
    areaId: 'observatory',
  },
  ansel: {
    id: 'ansel',
    name: 'Ansel Gate',
    shortName: 'Ansel',
    role: 'Gatekeeper',
    seeking: 'Why there is a world at all — and what that does not yet prove.',
    areaId: 'first-gate',
  },
  hope: {
    id: 'hope',
    name: 'Hope Lind',
    shortName: 'Hope',
    role: 'Lookout',
    seeking: 'Duty, mind, meaning, and beauty — without mocking the person still walking.',
    areaId: 'high-lookout',
  },
}

export const GUIDE_BY_AREA: Record<string, CharacterId> = {
  'parable-hollow': 'mercy',
  'witness-bench': 'silas',
  observatory: 'nora',
  'first-gate': 'ansel',
  'high-lookout': 'hope',
}

export function guideForArea(areaId: string): Character {
  return CAST[GUIDE_BY_AREA[areaId] ?? 'river']
}

export const STORY = {
  purpose:
    'Silver City is a puzzle trail: play a short game, fold the page, and keep evidence you can still say tomorrow.',
  who:
    'River and Juniper are Christian companions on this trail. You walk as River; Juniper keeps the first lamp with you.',
  premise:
    'Silver City is a puzzle trail: play a short game, fold the page, and keep evidence you can still say tomorrow.',
  welcomeJuniper:
    'You walk as River. I’m Juniper. One short puzzle — then we fold the page and keep the line.',
  welcomeRiver:
    'I’m River. I came to see if the case for God can be walked. If you’ll walk, I’ll try to remember.',
  dailyInvite: 'Lantern’s lit. Snap it, fold the page, keep the line. Later I’ll bring an older page back.',
  dailyHeld: 'That’s the line. Tomorrow I may cover a new card — or dust off one that’s rested.',
  trailWait: 'The trail waits. Your pages stay. Come when you can.',
}

export const AREA_LINES: Record<
  string,
  { hello: string; after: string }
> = {
  'parable-hollow': {
    hello:
      'Sit by the creek a minute. Jesus taught in pictures — not to hide the truth, but to make it walk around inside you.',
    after:
      'Keep the line, not my voice. Neighbor is the one who shows mercy. That’s a start.',
  },
  'witness-bench': {
    hello:
      'I copy names for a living. Paul stacked witnesses; I won’t sand the awkward parts. We’ll read what’s there.',
    after:
      'Early is not the same as easy. Hold the creed: died, buried, raised, appeared.',
  },
  observatory: {
    hello:
      'The dome is open. Bring wonder and a notebook. A psalm is not a telescope — and a telescope is not a shrug.',
    after:
      'If a line about the sky stuck, say it before you climb down the stairs.',
  },
  'first-gate': {
    hello:
      'The stone only asks why there is a world. We can walk that far together without pretending it is already the whole gospel.',
    after:
      'A first cause is already a great deal. It is not yet the sermon on the mount. That’s honesty, not a dodge.',
  },
  'high-lookout': {
    hello:
      'The wind up here is honest. Duty, mind, meaning, beauty — sit with them. You don’t have to finish the mountain tonight.',
    after:
      'If a hunger woke, don’t be ashamed of it. Hungers usually correspond to real countries.',
  },
}

export const VISTA_LINE =
  'Five walks, one trail. None of us is the evidence. We only kept you company while you gathered it. The Author, if he is real, is not smaller than a game.'
