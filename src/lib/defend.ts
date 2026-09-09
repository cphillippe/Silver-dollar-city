import { CITY_PLOTS, plotStage, type CityPlotId, type CityStage } from './city.ts'
import { prefersReducedMotion } from './juice.ts'
import type { ProgressState } from '../types.ts'

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

export const RAID_LINES = [
  'Mercy is optional',
  'Neighbor means your own',
  'Keep walking',
  'Classify and leave',
  'The priest did enough',
]

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

export function waveSpeed(): number {
  return prefersReducedMotion() ? 0.042 : 0.086
}

export function waveSpawnEvery(): number {
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

export type WatchAbility = 'love' | 'logic' | 'reason' | 'science'

export const WATCH_ABILITIES: WatchAbility[] = ['love', 'logic', 'reason', 'science']

export const WATCH_ABILITY_LABEL: Record<WatchAbility, string> = {
  love: 'Love',
  logic: 'Logic',
  reason: 'Reason',
  science: 'Science',
}

export const WATCH_ABILITY_GEM: Record<WatchAbility, 'heart' | 'star' | 'cup' | 'lamp'> = {
  love: 'heart',
  logic: 'star',
  reason: 'cup',
  science: 'lamp',
}

const LOGIC_KEYS = [
  'wb-creed',
  'wb-early',
  'wb-method',
  'wb-women',
  'fg-mover',
  'fg-contingent',
  'fg-kalam',
  'daily-creed',
  'daily-names',
]
const REASON_KEYS = ['hl-moral', 'hl-mind', 'hl-meaning', 'hl-beauty', 'fg-limits']
const SCIENCE_KEYS = [
  'ob-tuning',
  'ob-design',
  'ob-leibniz',
  'ob-life',
  'daily-stars',
  'daily-life',
  'daily-cosmos',
]

/** City of Heaven on the ridge — same seat as the overworld teaser. */
export const HEAVEN_POINT = { x: 572, y: 36 }

export function unlockedWatchAbilities(progress: ProgressState): WatchAbility[] {
  const held = new Set(progress.held ?? [])
  const completed = new Set(progress.completed ?? [])
  const known = (keys: string[]) => keys.some((id) => held.has(id) || completed.has(id))
  const next: WatchAbility[] = ['love']
  if (known(LOGIC_KEYS)) next.push('logic')
  if (known(REASON_KEYS)) next.push('reason')
  if (known(SCIENCE_KEYS)) next.push('science')
  return next
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

export function abilityRange(ability: WatchAbility, stage: CityStage): number {
  if (ability === 'love') return 640
  return towerRange(stage)
}

export function heavenSpeed(): number {
  return waveSpeed() * 1.7
}

export function dist(
  a: { x: number; y: number },
  b: { x: number; y: number },
): number {
  return Math.hypot(a.x - b.x, a.y - b.y)
}
