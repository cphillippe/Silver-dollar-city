/** Easy map chain. A2 is the cottages. The rest open when the previous map's unlock round is cleared. */
export const NIGHT_MAP_IDS = ['a2', 'far-hills', 'map03', 'map04', 'map05', 'map06'] as const

export type NightMapId = (typeof NIGHT_MAP_IDS)[number]

/** Easy: clearing this round opens the next map. */
export const EASY_MAP_UNLOCK_ROUND = 8

/**
 * Hard does not open this chain. The number stays 10 so a shared gate
 * cannot move it when Easy changes.
 */
export const HARD_MAP_UNLOCK_ROUND = 10

export function mapUnlockRound(easy: boolean): number {
  return easy ? EASY_MAP_UNLOCK_ROUND : HARD_MAP_UNLOCK_ROUND
}

/** True when clearing this 1-based round records the map and opens the next one. */
export function clearOpensNextMap(easy: boolean, roundCleared: number): boolean {
  return easy && Math.floor(roundCleared) >= mapUnlockRound(true)
}

export type MapBest = Partial<Record<NightMapId, number>>

export interface NightMapProgress {
  farHills?: boolean
  mazeBeat?: readonly string[]
  mapBest?: MapBest
}

export const NIGHT_MAP_BADGE: Record<NightMapId, string> = {
  a2: 'A2',
  'far-hills': 'Far Hills',
  map03: 'Peppermint',
  map04: 'Caramel',
  map05: 'Licorice',
  map06: 'Blueberry',
}

export const NIGHT_MAP_NAME: Record<NightMapId, string> = {
  a2: 'Silver City',
  'far-hills': 'The Far Hills',
  map03: 'Peppermint Pass',
  map04: 'Caramel Canyon',
  map05: 'Licorice Woods',
  map06: 'Blueberry Bog',
}

export function isNightMapId(value: unknown): value is NightMapId {
  return typeof value === 'string' && (NIGHT_MAP_IDS as readonly string[]).includes(value)
}

/**
 * Playtest names in map order. map02 is Far Hills. map03–map06 are those maps.
 * A real slug passes through.
 */
const MAP_QUERY_ALIAS: Record<string, NightMapId> = {
  map02: 'far-hills',
  map03: 'map03',
  map04: 'map04',
  map05: 'map05',
  map06: 'map06',
}

export function nightMapQueryId(raw: string | null | undefined): NightMapId | null {
  if (!raw) return null
  if (isNightMapId(raw)) return raw
  return MAP_QUERY_ALIAS[raw] ?? null
}

export function previousMap(id: NightMapId): NightMapId | null {
  const index = NIGHT_MAP_IDS.indexOf(id)
  return index > 0 ? NIGHT_MAP_IDS[index - 1] : null
}

/** Why a locked map stays shut. Silver City has no previous map. */
export function mapLockReason(id: NightMapId): string | null {
  const prev = previousMap(id)
  if (!prev) return null
  return `Beat round ${EASY_MAP_UNLOCK_ROUND} on ${NIGHT_MAP_NAME[prev]} to unlock`
}

export function nextMap(id: NightMapId): NightMapId | null {
  const index = NIGHT_MAP_IDS.indexOf(id)
  return index >= 0 && index < NIGHT_MAP_IDS.length - 1 ? NIGHT_MAP_IDS[index + 1] : null
}

function bestMeetsGate(best: MapBest | undefined, id: NightMapId): boolean {
  const round = best?.[id]
  return typeof round === 'number' && round >= EASY_MAP_UNLOCK_ROUND
}

/** Map ids whose stored best already meets the Easy gate. */
export function mapsUnlockedByBest(best: MapBest | undefined): NightMapId[] {
  if (!best) return []
  return NIGHT_MAP_IDS.filter((id) => bestMeetsGate(best, id))
}

function mapBeaten(id: NightMapId, state: NightMapProgress): boolean {
  if (state.mazeBeat?.includes(id)) return true
  return bestMeetsGate(state.mapBest, id)
}

/**
 * A2 is always open. Far Hills also opens from an Easy round 25.
 * Every later map stays locked until each map before it has cleared the
 * Easy unlock round (`mazeBeat`, or a stored best at least that high).
 * A later id alone does not open that map or the one after it.
 */
export function mapIsOpen(id: NightMapId, state: NightMapProgress): boolean {
  if (id === 'a2') return true
  if (id === 'far-hills' && state.farHills === true) return true
  const index = NIGHT_MAP_IDS.indexOf(id)
  if (index <= 0) return false
  for (let i = 0; i < index; i += 1) {
    if (!mapBeaten(NIGHT_MAP_IDS[i], state)) return false
  }
  return true
}

/**
 * Easy clear of `roundCleared` (1-based) raises that map's best.
 * At the Easy gate it also records the unlock flag. Hard writes nothing.
 */
export function applyNightMapClear(
  state: NightMapProgress,
  easy: boolean,
  map: NightMapId,
  roundCleared: number,
): NightMapProgress & { opened: boolean } {
  const mazeBeat = state.mazeBeat ? [...state.mazeBeat] : undefined
  const mapBest = state.mapBest ? { ...state.mapBest } : undefined
  if (!easy || !Number.isInteger(roundCleared) || roundCleared < 1) {
    return { farHills: state.farHills, mazeBeat, mapBest, opened: false }
  }
  const round = Math.min(25, roundCleared)
  const nextBest: MapBest = { ...mapBest, [map]: Math.max(mapBest?.[map] ?? 0, round) }
  const beat = [...(mazeBeat ?? [])]
  let opened = false
  if (clearOpensNextMap(true, round) && !beat.includes(map)) {
    beat.push(map)
    opened = true
  }
  return {
    farHills: state.farHills,
    mazeBeat: beat.length > 0 ? beat : undefined,
    mapBest: nextBest,
    opened,
  }
}
