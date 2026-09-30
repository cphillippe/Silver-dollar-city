import type { CityPlotId } from '../../lib/city.ts'
import { DEFEND_ANCHOR, DEFEND_PATH, pathPoint } from '../../lib/defend.ts'
import type { NightPoint } from '../types.ts'

/** Drawn road curve. Walkers follow `points`, not this — keep both in step when the road moves. */
export const NIGHT_ROAD_D = 'M70 310 C 140 300, 200 280, 280 292 C 360 304, 430 286, 560 300'

export interface NightPathModule {
  /** Walker polyline, gate → porch. */
  readonly points: readonly NightPoint[]
  /** Where walkers enter (gate). */
  readonly start: NightPoint
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
