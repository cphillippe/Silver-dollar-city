import type { CityPlotId, CityStage } from '../../lib/city.ts'
import { abilityRange, defendPads, dist, padStage, towerCooldown } from '../../lib/defend.ts'
import type { ProgressState } from '../../types.ts'
import { nightPath } from '../path/index.ts'
import type { NightPoint } from '../types.ts'

export interface NightTowersModule {
  /** Lots that can hold a lamp right now. */
  pads(progress: ProgressState): CityPlotId[]
  anchor(id: CityPlotId): NightPoint
  /** Where a shot leaves the lamp. */
  muzzle(id: CityPlotId): NightPoint
  stage(id: CityPlotId, progress: ProgressState): CityStage
  range(id: CityPlotId, ability: string, progress: ProgressState): number
  cooldown(id: CityPlotId, progress: ProgressState): number
  inRange(id: CityPlotId, ability: string, progress: ProgressState, target: NightPoint): boolean
}

export const nightTowers: NightTowersModule = {
  pads: defendPads,
  anchor: (id) => nightPath.anchor(id),
  muzzle: (id) => {
    const at = nightPath.anchor(id)
    return { x: at.x, y: at.y - 16 }
  },
  stage: padStage,
  range: (id, ability, progress) => abilityRange(ability, padStage(id, progress), progress),
  cooldown: (id, progress) => towerCooldown(padStage(id, progress)),
  inRange: (id, ability, progress, target) =>
    dist(nightPath.anchor(id), target) <= nightTowers.range(id, ability, progress),
}
