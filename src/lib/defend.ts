import type { ProgressState, WalkerKind } from '../types.ts'
import { CITY_PLOTS, plotStage, type CityPlotId, type CityStage } from './city.ts'
import { prefersReducedMotion } from './juice.ts'
import { toolTier, unlockedWatchTools, watchTool, WATCH_TOOLS } from './watchTools.ts'

export const DEFEND_BRIEF_ID = 'td-watch'
export const DEFEND_HEARTS = 3
export const DEFEND_WAVE_SIZE = 6

/** Main street — same curve the overworld draws. Raiders walk toward the porch. */
export const DEFEND_PATH: { x: number; y: number }[] = [
  { x: 70, y: 310 },
  { x: 148, y: 298 },
  { x: 220, y: 286 },
  { x: 300, y: 294 },
  { x: 400, y: 290 },
  { x: 498, y: 296 },
  { x: 560, y: 300 },
]

export const DEFEND_ANCHOR: Record<CityPlotId, { x: number; y: number }> = {
  lookout: { x: 520, y: 72 },
  observatory: { x: 464, y: 118 },
  hollow: { x: 108, y: 286 },
  journal: { x: 288, y: 248 },
  bench: { x: 350, y: 278 },
  lamps: { x: 258, y: 300 },
  gate: { x: 498, y: 268 },
  porch: { x: 564, y: 292 },
}

export const RAID_CAST: { text: string; kind: WalkerKind }[] = [
  { text: 'Mercy is optional', kind: 'skeptic' },
  { text: 'Neighbor means your own', kind: 'image-bearer' },
  { text: 'Keep walking', kind: 'spiritual' },
  { text: 'Classify and leave', kind: 'skeptic' },
  { text: 'The priest did enough', kind: 'image-bearer' },
  { text: 'Only atoms speak', kind: 'physical' },
  { text: 'The gods are many and tired', kind: 'pagan' },
  { text: 'Mind is only weather', kind: 'metaphysical' },
]

export const RAID_LINES = RAID_CAST.map((item) => item.text)

export function raidForWave(cleared: number, index: number): { text: string; kind: WalkerKind } {
  const loveKinds: WalkerKind[] = ['image-bearer', 'spiritual', 'skeptic']
  const pool =
    cleared < 1
      ? RAID_CAST.filter((item) => loveKinds.includes(item.kind))
      : RAID_CAST
  return pool[index % pool.length]
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

/** The one person Easy TAP shows. Mid-wave count stays 1. */
export function easyTapTarget<T extends { turned?: string }>(raiders: T[]): T | undefined {
  return raiders.find((item) => !item.turned)
}

export function easyTapPersonCount(raiders: { turned?: string }[]): number {
  return easyTapTarget(raiders) ? 1 : 0
}

export function waveSpeed(easy = false): number {
  if (easy) return prefersReducedMotion() ? 0.008 : 0.01
  return prefersReducedMotion() ? 0.042 : 0.086
}

export function waveSpawnEvery(easy = false): number {
  if (easy) return prefersReducedMotion() ? 4.2 : 3.8
  return prefersReducedMotion() ? 2.05 : 1.08
}

export function pathPoint(t: number): { x: number; y: number } {
  const clamped = Math.min(1, Math.max(0, t))
  const scaled = clamped * (DEFEND_PATH.length - 1)
  const i = Math.min(DEFEND_PATH.length - 2, Math.floor(scaled))
  const local = scaled - i
  const a = DEFEND_PATH[i]
  const b = DEFEND_PATH[i + 1]
  return { x: a.x + (b.x - a.x) * local, y: a.y + (b.y - a.y) * local }
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
): number {
  const tool = watchTool(ability)
  const tier = tool ? toolTier(tool, progress) : 1
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
