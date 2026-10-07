import { WATCH_TOOLS } from './watchTools.ts'

/**
 * Night Watch plant slots (1.4.377).
 * The four sidebar types — Love, Logic, Reason, Science — are the only
 * towers. Each type has one slot. Planting spends it. Pull puts it back.
 * Sparks still raise that type I → II → III. No fifth type.
 */
export const PLANT_SLOT = 1

const TYPE_IDS = new Set(WATCH_TOOLS.map((tool) => tool.id))

export function isTowerType(id: string): boolean {
  return TYPE_IDS.has(id)
}

/** One of each unlocked type, on the first open pads, in sidebar order. */
export function starterPlants(
  pads: readonly string[],
  unlocked: readonly string[],
): Record<string, string> {
  const open = new Set(unlocked)
  const types = WATCH_TOOLS.map((tool) => tool.id).filter((id) => open.has(id))
  const map: Record<string, string> = {}
  types.forEach((ability, index) => {
    const pad = pads[index]
    if (pad) map[pad] = ability
  })
  return map
}

/** Place `ability` on `pad`. A type already on the road moves. Unknown ids do nothing. */
export function plantType(
  map: Record<string, string>,
  pad: string,
  ability: string,
): Record<string, string> {
  if (!isTowerType(ability)) return map
  const next: Record<string, string> = {}
  for (const [id, type] of Object.entries(map)) {
    if (id === pad || type === ability) continue
    next[id] = type
  }
  next[pad] = ability
  return next
}

/** Take a tower off the road. The last one stays. Returns null when refused. */
export function pullPlant(
  map: Record<string, string>,
  pad: string,
): Record<string, string> | null {
  if (!(pad in map)) return map
  if (Object.keys(map).length <= 1) return null
  const next = { ...map }
  delete next[pad]
  return next
}

/** 1 while that type is still in hand. 0 once it is on the road. */
export function slotLeft(map: Record<string, string>, ability: string): number {
  if (!isTowerType(ability)) return 0
  return Object.values(map).includes(ability) ? 0 : PLANT_SLOT
}
