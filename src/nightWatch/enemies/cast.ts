import type { WalkerKind } from '../../types.ts'

/** One climb guy. Faces stay the six walker portraits — labels make 7–13 distinct. */
export interface NightCastGuy {
  id: string
  label: string
  kind: WalkerKind
  text: string
  lore: string
}

/**
 * Climb roster. Level N (nights cleared + 1) unlocks guys 1..N.
 * No new face art — kinds reuse the six portraits.
 */
export const NIGHT_CAST: NightCastGuy[] = [
  {
    id: 'accuser',
    label: 'Accuser',
    kind: 'skeptic',
    text: 'Mercy is optional',
    lore: 'He says mercy is a trick.',
  },
  {
    id: 'cold-heart',
    label: 'Cold Heart',
    kind: 'image-bearer',
    text: 'Only your own',
    lore: 'He keeps every good thing for himself.',
  },
  {
    id: 'mockery',
    label: 'Mockery',
    kind: 'spiritual',
    text: 'Keep walking',
    lore: 'He laughs and tells you to walk past.',
  },
  {
    id: 'tempter',
    label: 'Tempter',
    kind: 'pagan',
    text: 'Trade your lamp',
    lore: 'He wants your lamp for a shiny lie.',
  },
  {
    id: 'despair',
    label: 'Despair',
    kind: 'physical',
    text: 'Only atoms speak',
    lore: 'He says nothing kind is real.',
  },
  {
    id: 'whisper',
    label: 'Whisper',
    kind: 'metaphysical',
    text: 'Mind is weather',
    lore: 'He says your thoughts are only wind.',
  },
  {
    id: 'sneer',
    label: 'Sneer',
    kind: 'skeptic',
    text: "You're wrong",
    lore: 'He sneers before you finish.',
  },
  {
    id: 'mirror',
    label: 'Mirror',
    kind: 'image-bearer',
    text: 'Look at you',
    lore: 'He shows a face that will not love.',
  },
  {
    id: 'scoff',
    label: 'Scoff',
    kind: 'spiritual',
    text: 'Nice try',
    lore: 'He laughs at every prayer.',
  },
  {
    id: 'idol',
    label: 'Idol',
    kind: 'pagan',
    text: 'Many tired gods',
    lore: 'He offers a crowd of little gods.',
  },
  {
    id: 'weight',
    label: 'Weight',
    kind: 'physical',
    text: 'Too heavy',
    lore: 'He piles on until the lamp drops.',
  },
  {
    id: 'fog',
    label: 'Fog',
    kind: 'metaphysical',
    text: 'Nothing is clear',
    lore: 'He hides the road in a gray fog.',
  },
  {
    id: 'doubt',
    label: 'Doubt',
    kind: 'skeptic',
    text: 'Are you sure',
    lore: 'He asks until you forget the truth.',
  },
]

const NIGHT_CAST_IDS = new Set(NIGHT_CAST.map((guy) => guy.id))

export function isNightCastId(id: string): boolean {
  return NIGHT_CAST_IDS.has(id)
}

export function nightCastById(id: string): NightCastGuy | undefined {
  return NIGHT_CAST.find((guy) => guy.id === id)
}

/** Level = nights cleared + 1. Level 1 is guy 1 only; level 13+ is the full roster. */
export function unlockedNightCast(cleared: number): NightCastGuy[] {
  const nights = Number.isFinite(cleared) ? Math.max(0, Math.floor(cleared)) : 0
  const count = Math.min(NIGHT_CAST.length, nights + 1)
  return NIGHT_CAST.slice(0, count)
}

/** Known cast ids only, first-seen order, no duplicates. Unknown junk drops. */
export function normalizeMet(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  const next: string[] = []
  for (const item of value) {
    if (typeof item !== 'string' || !NIGHT_CAST_IDS.has(item) || next.includes(item)) continue
    next.push(item)
  }
  return next
}
