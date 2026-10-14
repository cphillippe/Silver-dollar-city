/** Easy map chain. A2 is the cottages. The rest open when the previous map's round 10 boss falls. */
export const NIGHT_MAP_IDS = ['a2', 'far-hills', 'map03', 'map04', 'map05', 'map06'] as const

export type NightMapId = (typeof NIGHT_MAP_IDS)[number]

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

export function nextMap(id: NightMapId): NightMapId | null {
  const index = NIGHT_MAP_IDS.indexOf(id)
  return index >= 0 && index < NIGHT_MAP_IDS.length - 1 ? NIGHT_MAP_IDS[index + 1] : null
}

/**
 * A2 is always open. Far Hills also opens from an Easy round 25.
 * Every later map stays locked until each map before it has a round 10 boss
 * in `mazeBeat`. A later id alone does not open that map or the one after it.
 */
export function mapIsOpen(
  id: NightMapId,
  state: { farHills?: boolean; mazeBeat?: readonly string[] },
): boolean {
  if (id === 'a2') return true
  if (id === 'far-hills' && state.farHills === true) return true
  const index = NIGHT_MAP_IDS.indexOf(id)
  if (index <= 0) return false
  const beat = Array.isArray(state.mazeBeat) ? state.mazeBeat : []
  for (let i = 0; i < index; i += 1) {
    if (!beat.includes(NIGHT_MAP_IDS[i])) return false
  }
  return true
}
