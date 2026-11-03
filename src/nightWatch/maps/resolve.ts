import { isNightMapId, mapIsOpen, nightMapQueryId, type NightMapId } from './chain.ts'

export type { NightMapId } from './chain.ts'

export interface NightMapChoice {
  easy: boolean
  /** Easy round 25 has already been held. That still opens Far Hills. */
  unlocked: boolean
  /** Map ids whose Easy unlock round has been cleared. */
  mazeBeat?: readonly string[]
  /** Best Easy round cleared on each map. A best at the unlock round opens the next map. */
  mapBest?: Partial<Record<NightMapId, number>>
  saved?: string
  /** playtest=1 or the debug freeze. */
  playtest: boolean
  /** `?nwMap=` when playtest is on. */
  query: string | null
  /** A pick made on this visit. Null until the player taps the picker. */
  session: NightMapId | null
}

function open(id: NightMapId, choice: NightMapChoice): boolean {
  return mapIsOpen(id, { farHills: choice.unlocked, mazeBeat: choice.mazeBeat, mapBest: choice.mapBest })
}

/**
 * A2 is the night everyone starts on. Later maps open after the Easy unlock
 * round on the one before them. A playtest jump can open any map. Hard never leaves A2.
 */
export function resolveNightMap(choice: NightMapChoice): NightMapId {
  if (!choice.easy) return 'a2'
  if (choice.session === 'a2') return 'a2'
  if (choice.session && (open(choice.session, choice) || choice.playtest)) return choice.session
  const asked = nightMapQueryId(choice.query)
  if (choice.playtest && asked && asked !== 'a2') return asked
  if (choice.saved && isNightMapId(choice.saved) && open(choice.saved, choice)) return choice.saved
  return 'a2'
}
