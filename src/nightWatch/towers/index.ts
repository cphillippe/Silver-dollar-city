import type { CityPlotId, CityStage } from '../../lib/city.ts'
import { abilityRange, defendPads, dist, padStage, towerCooldown } from '../../lib/defend.ts'
import { hillRangeBonus } from '../maps/features.ts'
import { isFreeSpot, lampAnchor, pathClearance } from '../path/data.ts'
import type { ProgressState } from '../../types.ts'
import { nightParts } from '../parts/index.ts'
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
  anchor(id: string): NightPoint
  /** Where a shot leaves the lamp. */
  muzzle(id: string): NightPoint
  stage(id: string, progress: ProgressState): CityStage
  range(
    id: string,
    ability: string,
    progress: ProgressState,
    runTier?: Record<string, number>,
    /** Easy Far steps. Added before the road-overlap rule. Hard passes 0. */
    extra?: number,
  ): number
  cooldown(id: string, progress: ProgressState): number
  inRange(
    id: string,
    ability: string,
    progress: ProgressState,
    target: NightPoint,
    runTier?: Record<string, number>,
    extra?: number,
  ): boolean
  /** Idle vs firing lamp art — Parts registry wins when filled. */
  lampSrc(pose: NightLampPose): string
  lampPose(hot: boolean): NightLampPose
  /** Top-left for an SVG <image> rooted at the lot anchor. */
  lampImageBox(): { x: number; y: number; w: number; h: number }
}

function seatStage(id: string, progress: ProgressState) {
  // A free seat is a basic lamp. It does not borrow a cottage's city stage.
  return isFreeSpot(id) ? 'empty' : padStage(id as CityPlotId, progress)
}

export const nightTowers: NightTowersModule = {
  pads: defendPads,
  anchor: (id) => lampAnchor(id),
  muzzle: (id) => {
    const at = lampAnchor(id)
    const { h, footY } = TOWER_LAMP_SPRITE
    return { x: at.x, y: at.y - (h - footY) + 10 }
  },
  stage: (id, progress) => seatStage(id, progress),
  /**
   * Hit radius. The plant ghost draws this same value for the same seat,
   * so the ring on screen is the ring that hits.
   * A free seat adds `FREE_LAMP_RANGE_BONUS` on every tier (1.4.392).
   */
  range: (id, ability, progress, runTier, extra = 0) => {
    const at = lampAnchor(id)
    return lampReach(
      id,
      freeLampBase(id, abilityRange(ability, seatStage(id, progress), progress, runTier)) +
        Math.max(0, extra) +
        hillRangeBonus(at),
      pathClearance(at),
    )
  },
  cooldown: (id, progress) => towerCooldown(seatStage(id, progress)),
  inRange: (id, ability, progress, target, runTier, extra = 0) =>
    dist(lampAnchor(id), target) <= nightTowers.range(id, ability, progress, runTier, extra),
  lampSrc: (pose) => nightParts.src('lamp', pose) ?? LOCAL_LAMP[pose],
  lampPose: (hot) => (hot ? 'firing' : 'idle'),
  lampImageBox: () => {
    const { w, h, footY } = TOWER_LAMP_SPRITE
    return { x: -w / 2, y: -(h - footY), w, h }
  },
}

/**
 * How long one auto-shot stays readable on a phone.
 * Basic lamps wait 700ms, so the range ring can return to a dashed idle.
 */
/**
 * Thinnest road overlap that still counts as covering the path (1.4.384).
 * Witness Square sits about 76 units off the bend. A 96 reach nicks it by ~20
 * and pops the whole wave, so the exit leak never runs. A thinner nick misses.
 */
export const LAMP_ROAD_OVERLAP = 24

/**
 * Extra reach for a lamp planted on open ground (1.4.392, kept in 1.4.393).
 * City seats stay on `towerRange`. Free level I is 114 and covers a gap of
 * 90 units once the overlap floor is applied. A lamp set farther back does
 * not get a bigger level I — levels II and III each add 18 (132, then 150),
 * which is how a set-back lamp reaches the road.
 */
export const FREE_LAMP_RANGE_BONUS = 18

function freeLampBase(id: string, base: number): number {
  return isFreeSpot(id) ? base + FREE_LAMP_RANGE_BONUS : base
}

/**
 * How far this lamp can hit.
 * The East porch keeps the seat-to-road bridge from 1.4.348.
 * Other seats use their own reach, and a circle that would only nick the road
 * stops one unit short of it.
 */
export function lampReach(plotId: string, base: number, roadGap: number): number {
  if (plotId === 'porch') return base + roadGap
  if (!(base > 0)) return 0
  if (base < roadGap + LAMP_ROAD_OVERLAP) return Math.min(base, Math.max(0, roadGap - 1))
  return base
}

export const SHOT_JUICE_MS = 500

/**
 * A planted lamp shoots on its own once its cooldown has elapsed.
 * `frozen` is the debug pause only — Still holds walkers and lamps keep shooting.
 */
export function lampReadyToFire(
  lastFiredAt: number,
  now: number,
  cooldownMs: number,
  frozen: boolean,
): boolean {
  if (frozen) return false
  return now >= lastFiredAt + cooldownMs
}

/** Sparks when the hit turns the walker. A graze pays nothing. Tough pays more than one. */
export function sparkAwardForHit(down: boolean, pay = 1): number {
  if (!down) return 0
  const sparks = Math.floor(pay)
  return sparks > 0 ? sparks : 1
}
