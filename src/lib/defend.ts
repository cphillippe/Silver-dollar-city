import {
  unlockedNightCast,
  type NightCastGuy,
} from '../nightWatch/enemies/cast.ts'
import { NIGHT_ENEMY_ROLE } from '../nightWatch/enemies/hp.ts'
import type { ProgressState, WalkerKind } from '../types.ts'
import { CITY_PLOTS, plotStage, type CityPlotId, type CityStage } from './city.ts'
import { EASY_ROUNDS, easyRound } from '../nightWatch/rounds.ts'
import { prefersReducedMotion } from './juice.ts'
import { combatTier, deployFit, toolTier, unlockedWatchTools, watchTool, WATCH_TOOLS } from './watchTools.ts'

export {
  isNightCastId,
  NIGHT_CAST,
  nightCastById,
  normalizeMet,
  unlockedNightCast,
} from '../nightWatch/enemies/cast.ts'
export type { NightCastGuy } from '../nightWatch/enemies/cast.ts'

export const DEFEND_BRIEF_ID = 'td-watch'
export const DEFEND_HEARTS = 3

export interface GateLeak {
  hearts: number
  /** Hearts removed this step. A gate shield reports 0. */
  lostHearts: number
  /** True when this leak emptied the night. */
  failed: boolean
}

/**
 * A walker that finishes the road leaks. Each leak costs one heart.
 * Empty hearts fail the night. A shield can forgive the cost.
 */
export function applyGateLeaks(hearts: number, leaked: number, shielded = false): GateLeak {
  const count = Number.isFinite(leaked) ? Math.max(0, Math.floor(leaked)) : 0
  const lostHearts = shielded || count === 0 ? 0 : count
  const next = Math.max(0, hearts - lostHearts)
  return { hearts: next, lostHearts, failed: lostHearts > 0 && next <= 0 }
}
export const DEFEND_WAVE_SIZE = 6
/** Hard night length. Easy reads `EASY_ROUNDS` instead. */
export const DEFEND_NIGHT_WAVES = 5

/** Easy is the round table. Hard stays five waves. */
export function nightLength(easy: boolean): number {
  return easy ? EASY_ROUNDS.length : DEFEND_NIGHT_WAVES
}
/** Waves 1–4 stay under the old six. Wave 5 is the denser upgrade gate. */
export const DEFEND_WAVE_PACK = [4, 4, 5, 5, 8] as const
/** Easy soft TD: cap live unturned walkers before spawning the next. */
export const EASY_WAVE_LIVE = 3

export { DEFEND_ANCHOR, DEFEND_PATH, pathClearance, pathPoint } from '../nightWatch/path/data.ts'

/** First six slots are one of each WalkerKind; later rows are extra taunts only. */
export const RAID_CAST: { text: string; kind: WalkerKind }[] = [
  { text: 'Mercy is optional', kind: 'skeptic' },
  { text: 'Only your own', kind: 'image-bearer' },
  { text: 'Keep walking', kind: 'spiritual' },
  { text: 'Trade your lamp', kind: 'pagan' },
  { text: 'Only atoms speak', kind: 'physical' },
  { text: 'Mind is weather', kind: 'metaphysical' },
  { text: "You're wrong", kind: 'skeptic' },
  { text: 'Many tired gods', kind: 'pagan' },
]

export const RAID_LINES = RAID_CAST.map((item) => item.text)

export function wavePackSize(waveIndex: number): number {
  const index = Math.min(
    DEFEND_WAVE_PACK.length - 1,
    Math.max(0, Math.floor(waveIndex) || 0),
  )
  return DEFEND_WAVE_PACK[index]
}

export interface WaveCombat {
  size: number
  /** Multiplier on the Easy/Hard walk speed. */
  speedScale: number
  /** Multiplier on the spawn gap. Below 1 spawns sooner. */
  spawnScale: number
  /** Added to the kind's base HP. Wave 5 Easy is the gate. */
  hpBonus: number
}

/**
 * Easy reads one row of the round table. Hard keeps a flat pace.
 * Walkers enter at the gate, so the crossing includes the whole road.
 */
export function waveCombat(waveIndex: number, easy: boolean): WaveCombat {
  if (easy) {
    const round = easyRound(waveIndex)
    return {
      size: round.count,
      speedScale: round.speed,
      spawnScale: round.spawn,
      hpBonus: round.hp,
    }
  }
  return { size: wavePackSize(waveIndex), speedScale: 1, spawnScale: 1, hpBonus: 0 }
}

/**
 * Climb pool is guys 1..level, level = cleared + 1.
 * Wave 5 biases toward tanks already in that pool — it never opens a locked guy.
 */
export function raidForWave(
  cleared: number,
  index: number,
  waveIndex = 0,
  easy = false,
): NightCastGuy {
  const pool = unlockedNightCast(cleared)
  const gate = !easy && waveIndex >= DEFEND_NIGHT_WAVES - 1
  if (gate) {
    const tanks = pool.filter((guy) => NIGHT_ENEMY_ROLE[guy.kind] === 'tank')
    if (tanks.length > 0 && index % 2 === 0) {
      return tanks[Math.floor(index / 2) % tanks.length]
    }
  }
  return pool[index % pool.length]
}

export function emptyDefense() {
  return { cleared: 0, nights: [] as string[], met: [] as string[] }
}

export function nightsCleared(progress: ProgressState): number {
  return progress.defense?.cleared ?? 0
}

export function padStage(id: CityPlotId, progress: ProgressState): CityStage {
  return plotStage(id, progress)
}

/** Built and lit lots can hold a lamp. The porch can hold one even as timber. */
export function defendPads(progress: ProgressState): CityPlotId[] {
  return CITY_PLOTS.map((plot) => plot.id).filter((id) => {
    const stage = plotStage(id, progress)
    if (id === 'porch') return stage !== 'empty'
    return stage === 'built' || stage === 'lit'
  })
}

export function towerRange(stage: CityStage): number {
  if (stage === 'lit') return 136
  if (stage === 'built') return 118
  return 96
}

export function towerCooldown(stage: CityStage): number {
  if (stage === 'lit') return 380
  if (stage === 'built') return 520
  return 700
}

/**
 * A2 path walker face in viewBox units. Sized for width-led contain on a tall phone
 * (whole 798×1134 plate); keeps ~40 CSS px once the stage is not height-shrunk.
 */
export const PATH_WALKER_FACE_U = 72
/** Tap hit radius on the path (same proportion as the original 36-wide / r22). */
export const PATH_WALKER_HIT_R = (PATH_WALKER_FACE_U * 22) / 36
/** Face center above the path anchor. The beam and the hit flash share it. */
export const PATH_WALKER_FACE_DY = -PATH_WALKER_FACE_U / 6

/**
 * Easy face tap in viewBox units, centered on the face.
 * At the 375-wide phone cover scale (~0.47) the disc is about 75 CSS px,
 * so a thumb lands on the gold ring and not the feet.
 */
export const EASY_FACE_HIT_R = 80

/** CSS px across the easy face disc at `scale` (board px per viewBox unit). */
export function easyFaceHitPx(scale: number): number {
  if (!(scale > 0)) return 0
  return EASY_FACE_HIT_R * 2 * scale
}

/**
 * Tap-juice face in CSS px. Brief squash → heaven only — keep it near the path face,
 * not a giant portrait (Fixes #469).
 */
export const EASY_WALKER_FACE_PX = 44
/** Juice wrapper only. Easy path taps use the face disc (`EASY_FACE_HIT_R`). */
export const EASY_WALKER_HIT_PX = 72
export const EASY_CUE_HOLD_MS = 1800
export const EASY_MISS_HOLD_MS = 1400

/** One Easy TAP mode: live wave, not plant / lost / win. */
export function easyTapMode(easy: boolean, phase: string, won: boolean): boolean {
  return easy && phase === 'wave' && !won
}

/** Front-most unturned walker — teach cue only (not the only live walker). */
export function easyTapTarget<T extends { turned?: string; t?: number }>(raiders: T[]): T | undefined {
  let pick: T | undefined
  let bestT = -1
  for (const item of raiders) {
    if (item.turned) continue
    const t = item.t ?? 0
    if (t >= bestT) {
      bestT = t
      pick = item
    }
  }
  return pick
}

export function easyHoldSpawn(walkingUnturned: number): boolean {
  return walkingUnturned >= EASY_WAVE_LIVE
}

/**
 * Every walker enters at the gate. Spacing comes from spawn timing
 * (`spawnEvery` / `holdSpawn`), not from starting partway up the road.
 */
export function easySpawnT(_spawnIndex: number): number {
  return 0
}

export function easyTapPersonCount(raiders: { turned?: string }[]): number {
  return easyTapTarget(raiders) ? 1 : 0
}

/** Easy TAP: a face tap always turns. Hard still matches tool to walker kind. */
export function easyTapFit(easy: boolean, toolId: string, kind: WalkerKind): 'match' | 'weak' {
  if (easy) return 'match'
  return deployFit(toolId, kind)
}

/**
 * A tap on a living walker face.
 * Easy always hits, even when no lamp reaches that walker.
 * Hard hits only when a lamp is in range.
 * A tap that misses the face is a miss for both.
 */
export function faceTapStrike(easy: boolean, onFace: boolean, lampInRange: boolean): 'hit' | 'miss' {
  if (!onFace) return 'miss'
  if (easy) return 'hit'
  return lampInRange ? 'hit' : 'miss'
}

/** Easy wins on 6 downs even if a flyer is still on the board. Hard waits for an empty road. */
export function waveIsClear(
  easy: boolean,
  downed: number,
  spawned: number,
  walking: number,
  size = DEFEND_WAVE_SIZE,
): boolean {
  if (easy) return downed >= size
  return spawned >= size && walking === 0
}

export function waveSpeed(easy = false): number {
  if (easy) return prefersReducedMotion() ? 0.008 : 0.01
  return prefersReducedMotion() ? 0.042 : 0.086
}

export function waveSpawnEvery(easy = false): number {
  if (easy) return prefersReducedMotion() ? 4.2 : 3.8
  return prefersReducedMotion() ? 2.05 : 1.08
}

/** Catalog ids. Later tools are more WATCH_TOOLS rows — do not hard-code a 4-id board. */
export type WatchAbility = string

export const WATCH_ABILITIES = WATCH_TOOLS.map((tool) => tool.id)

export const WATCH_ABILITY_LABEL: Record<string, string> = Object.fromEntries(
  WATCH_TOOLS.map((tool) => [tool.id, tool.label]),
)

/** City of Heaven on the ridge — same seat as the overworld teaser. */
export const HEAVEN_POINT = { x: 572, y: 36 }

export function unlockedWatchAbilities(progress: ProgressState): string[] {
  return unlockedWatchTools(progress).map((tool) => tool.id)
}

export function heavenPoint(
  from: { x: number; y: number },
  t: number,
  to = HEAVEN_POINT,
): { x: number; y: number } {
  const clamped = Math.min(1, Math.max(0, t))
  return {
    x: from.x + (to.x - from.x) * clamped,
    y: from.y + (to.y - from.y) * clamped,
  }
}

export function abilityRange(
  ability: string,
  stage: CityStage,
  progress: ProgressState,
  runTier?: Record<string, number>,
): number {
  const tool = watchTool(ability)
  const tier = runTier ? combatTier(ability, runTier) : tool ? toolTier(tool, progress) : 1
  const reach = (tier - 1) * 18
  return towerRange(stage) + reach
}

export function heavenSpeed(tier = 1, easy = false): number {
  return waveSpeed(easy) * (1.7 + Math.max(0, tier - 1) * 0.08)
}

export function dist(
  a: { x: number; y: number },
  b: { x: number; y: number },
): number {
  return Math.hypot(a.x - b.x, a.y - b.y)
}
