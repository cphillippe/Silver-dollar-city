import type { CityPlotId, CityStage } from '../../lib/city.ts'
import { abilityRange, defendPads, dist, padStage, towerCooldown } from '../../lib/defend.ts'
import type { ProgressState } from '../../types.ts'
import { nightParts } from '../parts/index.ts'
import { nightPath } from '../path/index.ts'
import type { NightPoint } from '../types.ts'

export type NightLampPose = 'idle' | 'firing'

/** Sprite footprint on the board (viewBox units); feet sit on the lot anchor. */
export const TOWER_LAMP_SPRITE = {
  w: 76,
  h: 76,
  /** Distance from anchor to sprite bottom (ground contact). */
  footY: 12,
}

const LOCAL_LAMP: Record<NightLampPose, string> = {
  idle: new URL('../../assets/night-watch/nw-tower-lamp-idle-cut.png', import.meta.url).href,
  firing: new URL('../../assets/night-watch/nw-tower-lamp-firing-cut.png', import.meta.url).href,
}

export interface NightTowersModule {
  /** Lots that can hold a lamp right now. */
  pads(progress: ProgressState): CityPlotId[]
  anchor(id: CityPlotId): NightPoint
  /** Where a shot leaves the lamp. */
  muzzle(id: CityPlotId): NightPoint
  stage(id: CityPlotId, progress: ProgressState): CityStage
  range(
    id: CityPlotId,
    ability: string,
    progress: ProgressState,
    runTier?: Record<string, number>,
  ): number
  cooldown(id: CityPlotId, progress: ProgressState): number
  inRange(
    id: CityPlotId,
    ability: string,
    progress: ProgressState,
    target: NightPoint,
    runTier?: Record<string, number>,
  ): boolean
  /** Idle vs firing lamp art — Parts registry wins when filled. */
  lampSrc(pose: NightLampPose): string
  lampPose(hot: boolean): NightLampPose
  /** Top-left for an SVG <image> rooted at the lot anchor. */
  lampImageBox(): { x: number; y: number; w: number; h: number }
}

export const nightTowers: NightTowersModule = {
  pads: defendPads,
  anchor: (id) => nightPath.anchor(id),
  muzzle: (id) => {
    const at = nightPath.anchor(id)
    const { h, footY } = TOWER_LAMP_SPRITE
    return { x: at.x, y: at.y - (h - footY) + 10 }
  },
  stage: padStage,
  range: (id, ability, progress, runTier) =>
    abilityRange(ability, padStage(id, progress), progress, runTier),
  cooldown: (id, progress) => towerCooldown(padStage(id, progress)),
  inRange: (id, ability, progress, target, runTier) =>
    dist(nightPath.anchor(id), target) <= nightTowers.range(id, ability, progress, runTier),
  lampSrc: (pose) => nightParts.src('lamp', pose) ?? LOCAL_LAMP[pose],
  lampPose: (hot) => (hot ? 'firing' : 'idle'),
  lampImageBox: () => {
    const { w, h, footY } = TOWER_LAMP_SPRITE
    return { x: -w / 2, y: -(h - footY), w, h }
  },
}
