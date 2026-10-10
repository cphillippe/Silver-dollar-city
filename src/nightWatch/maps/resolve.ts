import { isNightMapId, mapIsOpen, type NightMapId } from './chain.ts'

export type { NightMapId } from './chain.ts'

export interface NightMapChoice {
  easy: boolean
  /** Easy round 25 has already been held. That still opens Far Hills. */
  unlocked: boolean
  /** Map ids whose round 10 boss has been beaten. */
  mazeBeat?: readonly string[]
  saved?: string
  /** playtest=1 or the debug freeze. */
  playtest: boolean
  /** `?nwMap=` when playtest is on. */
  query: string | null
  /** A pick made on this visit. Null until the player taps the picker. */
  session: NightMapId | null
}

function open(id: NightMapId, choice: NightMapChoice): boolean {
  return mapIsOpen(id, { farHills: choice.unlocked, mazeBeat: choice.mazeBeat })
}

/**
 * A2 is the night everyone starts on. Later maps open after round 10 on the
 * one before them. A playtest jump can open any map. Hard never leaves A2.
 */
export function resolveNightMap(choice: NightMapChoice): NightMapId {
  if (!choice.easy) return 'a2'
  if (choice.session === 'a2') return 'a2'
  if (choice.session && (open(choice.session, choice) || choice.playtest)) return choice.session
  if (choice.playtest && isNightMapId(choice.query) && choice.query !== 'a2') return choice.query
  if (choice.saved && isNightMapId(choice.saved) && open(choice.saved, choice)) return choice.saved
  return 'a2'
}
