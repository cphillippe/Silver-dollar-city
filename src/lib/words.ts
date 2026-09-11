/** Player-facing word school. Teach a term before using it — or bury it. */

export interface WordSense {
  term: string
  sense: string
  teach: string
}

export const WORDS = {
  claim: {
    term: 'Claim',
    sense: 'the main idea we hold to be true',
    teach: 'A claim is the main idea we hold to be true.',
  },
  hold: {
    term: 'Hold',
    sense: 'keep a true line you can still say tomorrow',
    teach: 'To hold a claim is to keep it so you can still say it tomorrow.',
  },
  reason: {
    term: 'Reason',
    sense: 'why the claim stands',
    teach: 'A reason is why the claim stands.',
  },
  source: {
    term: 'Source',
    sense: 'where the claim comes from',
    teach: 'A source is where the claim comes from.',
  },
  creed: {
    term: 'Creed',
    sense: 'an old shared belief',
    teach: 'A creed is an old shared belief the churches already said out loud.',
  },
  parable: {
    term: 'Parable',
    sense: 'a Jesus story',
    teach: 'A parable is a Jesus story that asks you to decide.',
  },
  fineTuning: {
    term: 'Fine-tuning',
    sense: 'life’s dials fit in a very narrow range',
    teach: 'Fine-tuning means life’s dials fit — the ranges that allow life are very tight.',
  },
  premise: {
    term: 'Premise',
    sense: 'a building block of an argument',
    teach: 'A premise is a building block of an argument.',
  },
  kalam: {
    term: 'Kalām',
    sense: 'the beginning argument — what starts still asks for a cause',
    teach: 'Kalām is the beginning argument: whatever begins still asks for a cause.',
  },
  upgrade: {
    term: 'Build this',
    sense: 'raise the next look you earned by learning, not by paying',
    teach: 'Build this means raise the next look you earned by learning — not by paying.',
  },
  deploy: {
    term: 'Deploy',
    sense: 'use a claim you held',
    teach: 'Deploy means use a claim you held — a claim is what we hold to be true.',
  },
} as const satisfies Record<string, WordSense>

export type WordKey = keyof typeof WORDS

const SCHOOL_BY_ID: Record<string, WordKey[]> = {
  'ph-road': ['parable'],
  'ph-father': ['parable'],
  'ph-seeds': ['parable'],
  'ph-debt': ['parable'],
  'daily-seed': ['parable'],
  'daily-gems': ['parable'],
  'daily-neighbor': ['parable'],
  'wb-creed': ['creed'],
  'wb-early': ['creed'],
  'daily-creed': ['creed'],
  'ob-tuning': ['fineTuning'],
  'ob-design': ['fineTuning', 'premise'],
  'daily-stars': ['fineTuning'],
  'fg-kalam': ['kalam'],
  'fg-mover': ['premise'],
  'fg-contingent': ['premise'],
  'fg-limits': ['creed'],
  'hl-moral': ['premise'],
}

/** Topic words to gloss before this walk uses them. Claim is always taught separately. */
export function schoolKeysFor(id: string): WordKey[] {
  return SCHOOL_BY_ID[id] ?? []
}

export function schoolWordsFor(
  id: string,
  easy: boolean,
): WordSense[] {
  const keys: WordKey[] = ['claim']
  if (easy) keys.push('hold', 'reason', 'source')
  keys.push(...schoolKeysFor(id))
  const seen = new Set<string>()
  const out: WordSense[] = []
  for (const key of keys) {
    const word = WORDS[key]
    if (seen.has(word.term)) continue
    seen.add(word.term)
    out.push(word)
  }
  return out
}

/** Easy puzzle leads: bury unread jargon; keep claim/parable/creed after they are taught. */
export function easyLead(id: string, prompt: string): string {
  if (id === 'ln-street') {
    return 'Tap the sentence, then the place, then the person. One story at a time.'
  }
  if (id === 'ph-father') {
    return 'Toss the wrong picks. Keep what Luke 15 is actually pressing.'
  }
  if (id === 'ph-seeds') {
    return 'Match each Jesus story to the main idea it is actually making.'
  }
  if (id === 'ph-debt') {
    return 'Sort the sentences. Only one belongs in the keep bin.'
  }
  if (id === 'daily-gems') {
    return 'Match each picture to the short main idea.'
  }
  if (id === 'wb-early' || id === 'wb-method') {
    return prompt.replace(/historical claim/, 'historical line').replace(/overclaims/, 'stretch')
  }
  if (id === 'fg-contingent') {
    return 'Stack the stones: things that might not have been still need a ground.'
  }
  if (id === 'fg-kalam') {
    return 'Keep the beginning argument. Toss the flattenings.'
  }
  return prompt.replace(/\bclaims\b/g, 'sentences').replace(/\bclaim\b/g, 'main idea')
}
