import type { CityPlotId } from '../../lib/city.ts'
import { DEFEND_ANCHOR, DEFEND_PATH, NIGHT_ROAD_D, pathPoint } from './data.ts'
import type { NightPoint } from '../types.ts'

export { DEFEND_ANCHOR, DEFEND_PATH, NIGHT_ROAD_D, pathPoint } from './data.ts'

export interface NightPathModule {
  /** Walker polyline on the plate's yellow road, painted gate (right edge) → top cottage. */
  readonly points: readonly NightPoint[]
  /** Where walkers enter (gate). */
  readonly start: NightPoint
  /** SVG road overlay; empty while the map plate paints the road. */
  readonly roadD: string
  /** Position along the polyline, t in [0, 1]. */
  pointAt(t: number): NightPoint
  /** Lot seat on the board (pads / lamps sit here). */
  anchor(id: CityPlotId): NightPoint
}

export const nightPath: NightPathModule = {
  points: DEFEND_PATH,
  start: DEFEND_PATH[0],
  roadD: NIGHT_ROAD_D,
  pointAt: pathPoint,
  anchor: (id) => DEFEND_ANCHOR[id],
}
