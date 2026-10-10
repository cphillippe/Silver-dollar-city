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
 * Every later map opens when the previous map's round 10 boss is beaten.
 */
export function mapIsOpen(
  id: NightMapId,
  state: { farHills?: boolean; mazeBeat?: readonly string[] },
): boolean {
  if (id === 'a2') return true
  if (id === 'far-hills' && state.farHills === true) return true
  const prev = previousMap(id)
  return prev != null && (state.mazeBeat?.includes(prev) ?? false)
}
