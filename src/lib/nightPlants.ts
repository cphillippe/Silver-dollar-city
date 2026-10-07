import type { CityPlotId } from './city.ts'
import { WATCH_TOOLS } from './watchTools.ts'

/**
 * Night Watch plant slots (1.4.378).
 * The four sidebar types — Love, Logic, Reason, Science — are the only
 * towers. Each type has one slot. Planting spends it. Pull puts it back.
 * Sparks still raise that type I → II → III. No fifth type.
 *
 * Easy Wave 1 does not wait on Lock In. City build progress used to leave
 * only the East porch, and the other three types stayed on the face-tap
 * miss. Easy always offers one ring per type, all four in hand.
 */
export const PLANT_SLOT = 1

/**
 * One open lot per type. Existing road seats — not new path art.
 * Sky Watch's seat sits under the phone Begin button, so Easy uses
 * the journal seat instead. That keeps four rings above the dock.
 */
export const EASY_PLANT_PADS: readonly CityPlotId[] = [
  'porch',
  'hollow',
  'journal',
  'bench',
]

const TYPE_IDS = new Set(WATCH_TOOLS.map((tool) => tool.id))

export function isTowerType(id: string): boolean {
  return TYPE_IDS.has(id)
}

/**
 * Types the rail can select and plant.
 * Easy: all four from Wave 1. Face-tap stays a combat miss, not a plant gate.
 * Hard: Lock In still opens each type.
 */
export function nightPlantTypes(easy: boolean, unlocked: readonly string[]): string[] {
  if (easy) return WATCH_TOOLS.map((tool) => tool.id)
  return unlocked.filter((id) => isTowerType(id))
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

/**
 * Take a tower off the road and return its slot.
 * The last lamp stays only when pulling it would leave zero towers and no
 * empty ring to plant again. An open ring, or any other tower, lets Pull through.
 * Returns null when refused. Omitting `openPads` keeps the last lamp (1.4.374).
 */
export function pullPlant(
  map: Record<string, string>,
  pad: string,
  openPads?: readonly string[],
): Record<string, string> | null {
  if (!(pad in map)) return map
  const left = Object.keys(map).length - 1
  const room =
    left >= 1 || (openPads ?? []).some((id) => id !== pad && !(id in map))
  if (!room) return null
  const next = { ...map }
  delete next[pad]
  return next
}

/** 1 while that type is still in hand. 0 once it is on the road. */
export function slotLeft(map: Record<string, string>, ability: string): number {
  if (!isTowerType(ability)) return 0
  return Object.values(map).includes(ability) ? 0 : PLANT_SLOT
}
