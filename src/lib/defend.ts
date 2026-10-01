import type { ProgressState, WalkerKind } from '../types.ts'
import { CITY_PLOTS, plotStage, type CityPlotId, type CityStage } from './city.ts'
import { prefersReducedMotion } from './juice.ts'
import { combatTier, deployFit, toolTier, unlockedWatchTools, watchTool, WATCH_TOOLS } from './watchTools.ts'

export const DEFEND_BRIEF_ID = 'td-watch'
export const DEFEND_HEARTS = 3
export const DEFEND_WAVE_SIZE = 6
/** Easy soft TD: cap live unturned walkers before spawning the next. */
export const EASY_WAVE_LIVE = 3

const EASY_SPAWN_T = [0.08, 0.18, 0.28] as const

export { DEFEND_ANCHOR, DEFEND_PATH, pathPoint } from '../nightWatch/path/data.ts'

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

/** Full six-kind cast. `cleared` does not narrow the pool (Fixes #452). */
export function raidForWave(_cleared: number, index: number): { text: string; kind: WalkerKind } {
  return RAID_CAST[index % RAID_CAST.length]
}

export function emptyDefense() {
  return { cleared: 0, nights: [] as string[] }
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

/** Easy walker face is HTML CSS px — not SVG viewBox units (those get crushed). */
export const EASY_WALKER_FACE_PX = 128
export const EASY_WALKER_HIT_PX = 160
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

export function easySpawnT(spawnIndex: number): number {
  return EASY_SPAWN_T[spawnIndex % EASY_SPAWN_T.length]
}

export function easyTapPersonCount(raiders: { turned?: string }[]): number {
  return easyTapTarget(raiders) ? 1 : 0
}

/** Easy TAP: a face tap always turns. Hard still matches tool to walker kind. */
export function easyTapFit(easy: boolean, toolId: string, kind: WalkerKind): 'match' | 'weak' {
  if (easy) return 'match'
  return deployFit(toolId, kind)
}

/** Easy wins on 6 downs even if a flyer is still on the board. Hard waits for an empty road. */
export function waveIsClear(
  easy: boolean,
  downed: number,
  spawned: number,
  walking: number,
): boolean {
  if (easy) return downed >= DEFEND_WAVE_SIZE
  return spawned >= DEFEND_WAVE_SIZE && walking === 0
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
  if (ability === 'love') return 640 + reach
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
