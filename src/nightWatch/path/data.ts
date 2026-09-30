import type { CityPlotId } from '../../lib/city.ts'
import type { NightPoint } from '../types.ts'

/**
 * A2 candy plate — painted yellow-road centerline, polyline only.
 * Enters off the bottom edge (below the teal cottage), S-curves up, and leaves
 * through the top edge; the plate paints no gate or bush end inside the frame.
 * Points are evenly spaced (~14 units) because `pathPoint` gives each segment equal t.
 */
export const DEFEND_PATH: NightPoint[] = [
  { x: 349, y: 420 },
  { x: 338, y: 411 },
  { x: 326, y: 404 },
  { x: 314, y: 398 },
  { x: 304, y: 388 },
  { x: 298, y: 375 },
  { x: 295, y: 362 },
  { x: 295, y: 348 },
  { x: 300, y: 334 },
  { x: 307, y: 323 },
  { x: 318, y: 314 },
  { x: 330, y: 306 },
  { x: 343, y: 300 },
  { x: 356, y: 295 },
  { x: 369, y: 290 },
  { x: 382, y: 286 },
  { x: 395, y: 281 },
  { x: 409, y: 277 },
  { x: 422, y: 272 },
  { x: 434, y: 266 },
  { x: 447, y: 259 },
  { x: 459, y: 252 },
  { x: 469, y: 242 },
  { x: 477, y: 231 },
  { x: 483, y: 218 },
  { x: 485, y: 204 },
  { x: 485, y: 190 },
  { x: 481, y: 177 },
  { x: 474, y: 164 },
  { x: 465, y: 154 },
  { x: 455, y: 145 },
  { x: 443, y: 137 },
  { x: 431, y: 131 },
  { x: 418, y: 124 },
  { x: 405, y: 118 },
  { x: 392, y: 113 },
  { x: 380, y: 107 },
  { x: 367, y: 101 },
  { x: 355, y: 94 },
  { x: 343, y: 86 },
  { x: 332, y: 77 },
  { x: 322, y: 67 },
  { x: 315, y: 55 },
  { x: 311, y: 42 },
  { x: 310, y: 28 },
  { x: 309, y: 14 },
  { x: 311, y: 0 },
]

/** Lot seats on the A2 plate — open ground and candy cottage yards beside the road. */
export const DEFEND_ANCHOR: Record<CityPlotId, NightPoint> = {
  lookout: { x: 405, y: 200 },
  observatory: { x: 505, y: 124 },
  hollow: { x: 212, y: 336 },
  journal: { x: 566, y: 212 },
  bench: { x: 448, y: 320 },
  lamps: { x: 344, y: 258 },
  gate: { x: 384, y: 378 },
  porch: { x: 384, y: 52 },
}

/** The plate paints the road; the SVG road layers stay empty so they don't fight it. */
export const NIGHT_ROAD_D = ''

export function pathPoint(t: number): NightPoint {
  const clamped = Math.min(1, Math.max(0, t))
  const scaled = clamped * (DEFEND_PATH.length - 1)
  const i = Math.min(DEFEND_PATH.length - 2, Math.floor(scaled))
  const local = scaled - i
  const a = DEFEND_PATH[i]
  const b = DEFEND_PATH[i + 1]
  return { x: a.x + (b.x - a.x) * local, y: a.y + (b.y - a.y) * local }
}
