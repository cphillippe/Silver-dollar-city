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
    name: 'Juniper Wick',
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
    name: 'Silas Whitman',
    shortName: 'Silas',
    role: 'Witness clerk',
    seeking: 'Names, dates, and what the first reports actually said.',
    areaId: 'witness-bench',
  },
  nora: {
    id: 'nora',
    name: 'Nora Skye',
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
    seeking: 'Why there is a world at all — and the God who answers it.',
    areaId: 'first-gate',
  },
  hope: {
    id: 'hope',
    name: 'Hope Ridge',
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
    'A 60-second Christian reasoning game: sort ideas, choose one takeaway, and remember why it stands tomorrow.',
  cityPromise: 'Keep the line — the town lights. Streets and landmarks rise when a claim holds.',
  who: 'You are River. Juniper is your guide. Each day you practice one Christian idea.',
  playGoal:
    'Goal: keep the lines that support today’s claim; toss the distractors; then choose the claim and reason you’ll remember.',
  takeaway:
    'Choose the one-sentence takeaway you can repeat tomorrow, then choose why it stands.',
  tapTakeaway: 'Tap the takeaway',
  whyItStands: 'Why it stands',
  lockSort: 'Lock in the sort.',
  premise:
    'A 60-second Christian reasoning game: sort ideas, choose one takeaway, and remember why it stands tomorrow.',
  welcomeJuniper:
    'You are River. I’m Juniper. Each day we practice one Christian idea — then you keep the takeaway.',
  welcomeRiver:
    'I’m River. I came to see if the case for God can be walked. If you’ll walk, I’ll try to remember.',
  dailyInvite:
    'Lantern’s lit. Sort the idea, lock it in, keep the takeaway. Later I’ll bring an older page back.',
  dailyHeld: 'That’s the line. Tomorrow I may cover a new card — or dust off one that’s rested.',
  trailWait: 'The trail waits. Your pages stay. Come when you can.',
}

export const AREA_LINES: Record<
  string,
  { hello: string; after: string }
> = {
  'parable-hollow': {
    hello:
      'Sit by the creek. Jesus taught in pictures so the truth could walk around inside you.',
    after:
      'Keep the line, not my voice. Neighbor is the one who shows mercy.',
  },
  'witness-bench': {
    hello:
      'I copy names on the square. Public reports live here — the creed is a ledger line, not a creek story.',
    after: 'Hold the creed: died, buried, raised, appeared.',
  },
  observatory: {
    hello: 'Dome’s open on the ridge. We look up. Fine-tuning lives with the sky.',
    after: 'If a sky line stuck, say it on the stairs.',
  },
  'first-gate': {
    hello: 'The stone only asks why there is a world. That’s as far as we walk tonight.',
    after: 'A first cause is a lot. It is not yet the sermon on the mount.',
  },
  'high-lookout': {
    hello: 'Wind’s honest up here. Duty, mind, meaning, beauty — sit with them.',
    after: 'If a hunger woke, don’t be ashamed. Hungers map to real countries.',
  },
}

/** Short in-world lines for the overworld — not essays. */
export const TOWN_VOICE: Record<
  string,
  {
    who: CharacterId
    here: string
    built: string
    lit: string
    unlocked: string
    afterWin: string
    grew: string
  }
> = {
  porch: {
    who: 'juniper',
    here: 'Lamp’s ready. Tap the glow.',
    built: 'Porch stood up.',
    lit: 'Lantern’s holding.',
    unlocked: 'East lot’s staked.',
    afterWin: 'The porch caught.',
    grew: 'Lamp kicked.',
  },
  hollow: {
    who: 'mercy',
    here: 'Creek path’s open.',
    built: 'Cabin’s standing.',
    lit: 'Oaks are lit.',
    unlocked: 'Mercy’s staking the lot.',
    afterWin: 'The creek grew.',
    grew: 'Another oak.',
  },
  bench: {
    who: 'silas',
    here: 'Ledger’s on the square.',
    built: 'Hall’s up.',
    lit: 'Names are warm.',
    unlocked: 'Silas unlocked the bench.',
    afterWin: 'The square filled.',
    grew: 'Another window.',
  },
  observatory: {
    who: 'nora',
    here: 'Dome’s waiting on the ridge.',
    built: 'Glass is set.',
    lit: 'Stars caught the glass.',
    unlocked: 'Nora opened the ridge.',
    afterWin: 'The ridge woke.',
    grew: 'Glass caught.',
  },
  gate: {
    who: 'ansel',
    here: 'East road’s asking why.',
    built: 'Arch is standing.',
    lit: 'Stone’s warm.',
    unlocked: 'Ansel unbarred the road.',
    afterWin: 'A gate rose.',
    grew: 'Stone settled.',
  },
  lookout: {
    who: 'hope',
    here: 'High wind. Come up.',
    built: 'Tower’s up.',
    lit: 'Ridge lantern’s on.',
    unlocked: 'Hope marked the climb.',
    afterWin: 'The ridge grew.',
    grew: 'Flag kicked.',
  },
  journal: {
    who: 'river',
    here: 'Pages live in that house.',
    built: 'Dossier house is up.',
    lit: 'Pages are glowing.',
    unlocked: 'A house for what you can still say.',
    afterWin: 'A page landed.',
    grew: 'Another page.',
  },
  lamps: {
    who: 'juniper',
    here: 'Street lamps remember the walks.',
    built: 'Lamps are up.',
    lit: 'The street remembered.',
    unlocked: 'First lamp on the street.',
    afterWin: 'A lamp caught.',
    grew: 'Another lamp.',
  },
}

export function townVoice(plotId: string) {
  return TOWN_VOICE[plotId] ?? TOWN_VOICE.porch
}

export function townVoiceForArea(areaId: string) {
  if (areaId === 'parable-hollow') return TOWN_VOICE.hollow
  if (areaId === 'witness-bench') return TOWN_VOICE.bench
  if (areaId === 'observatory') return TOWN_VOICE.observatory
  if (areaId === 'first-gate') return TOWN_VOICE.gate
  if (areaId === 'high-lookout') return TOWN_VOICE.lookout
  return TOWN_VOICE.porch
}

export function townAck(
  plotId: string,
  beat: 'Built!' | 'Lit!' | 'Unlocked' | 'Grew!',
  easy = false,
): string {
  const voice = townVoice(plotId)
  if (beat === 'Lit!') return voice.lit
  if (beat === 'Built!') {
    if (easy && plotId === 'journal') return 'Page house is up.'
    return voice.built
  }
  if (beat === 'Grew!') return voice.grew
  return voice.unlocked
}

export const VISTA_LINE =
  'Five walks, one trail. None of us is the evidence. We only kept you company while you gathered it. The Author, if he is real, is not smaller than a game.'
