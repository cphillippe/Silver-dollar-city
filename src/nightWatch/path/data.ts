import type { CityPlotId } from '../../lib/city.ts'
import type { NightPoint } from '../types.ts'

/** A2 candy plate — yellow road centerline (gate BR → UL), polyline only. */
export const DEFEND_PATH: NightPoint[] = [
  { x: 568, y: 382 },
  { x: 492, y: 382 },
  { x: 492, y: 352 },
  { x: 528, y: 328 },
  { x: 448, y: 312 },
  { x: 272, y: 296 },
  { x: 456, y: 256 },
  { x: 352, y: 186 },
  { x: 46, y: 132 },
]

/** Lot seats on the A2 plate — aligned to candy cottages beside the road. */
export const DEFEND_ANCHOR: Record<CityPlotId, NightPoint> = {
  lookout: { x: 320, y: 108 },
  observatory: { x: 472, y: 178 },
  hollow: { x: 128, y: 328 },
  journal: { x: 468, y: 228 },
  bench: { x: 488, y: 328 },
  lamps: { x: 192, y: 268 },
  gate: { x: 568, y: 382 },
  porch: { x: 46, y: 132 },
}

function polylineD(points: readonly NightPoint[]): string {
  if (points.length === 0) return ''
  const [first, ...rest] = points
  return `M${first.x} ${first.y}${rest.map((p) => ` L${p.x} ${p.y}`).join('')}`
}

/** Drawn road — keep in step with `DEFEND_PATH`. */
export const NIGHT_ROAD_D = polylineD(DEFEND_PATH)

export function pathPoint(t: number): NightPoint {
  const clamped = Math.min(1, Math.max(0, t))
  const scaled = clamped * (DEFEND_PATH.length - 1)
  const i = Math.min(DEFEND_PATH.length - 2, Math.floor(scaled))
  const local = scaled - i
  const a = DEFEND_PATH[i]
  const b = DEFEND_PATH[i + 1]
  return { x: a.x + (b.x - a.x) * local, y: a.y + (b.y - a.y) * local }
}
