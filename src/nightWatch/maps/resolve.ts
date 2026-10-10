export type NightMapId = 'a2' | 'far-hills'

export interface NightMapChoice {
  easy: boolean
  /** Easy round 25 has already been held. */
  unlocked: boolean
  saved?: string
  /** playtest=1 or the debug freeze. */
  playtest: boolean
  /** `?nwMap=` when playtest is on. */
  query: string | null
  /** A pick made on this visit. Null until the player taps the picker. */
  session: NightMapId | null
}

/**
 * A2 is the night everyone starts on. Far Hills is an Easy choice after
 * round 25, or a playtest jump. Hard never leaves A2.
 */
export function resolveNightMap(choice: NightMapChoice): NightMapId {
  if (!choice.easy) return 'a2'
  if (choice.session === 'a2') return 'a2'
  if (choice.session === 'far-hills' && (choice.unlocked || choice.playtest)) return 'far-hills'
  if (choice.playtest && choice.query === 'far-hills') return 'far-hills'
  if (choice.saved === 'far-hills' && choice.unlocked) return 'far-hills'
  return 'a2'
}
