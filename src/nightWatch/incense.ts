import { hillRangeBonus } from './maps/features.ts'
import { lampAnchor, pathClearance } from './path/data.ts'
import { lampReach } from './towers/index.ts'
import {
  pathsOf,
  TREE_STEP_COST,
  type LampPaths,
  type PathBuy,
  type PathSpend,
} from './upgradeTree.ts'

/**
 * Easy incense (1.4.475).
 * A cloud that adds a little to a glowing tap. It does not shoot, and it does not tick.
 * Locked until round 9 is cleared, so rounds 1–9 never see it.
 * Hard never offers it. The smoke has no power of its own. It reminds us that prayers rise.
 */

export const INCENSE_ID = 'incense'

/** Sparks to plant the incense. One cloud a night. */
export const INCENSE_COST = 8

/** One incense a night. A second cloud would not stack. */
export const INCENSE_CAP = 1

/**
 * Plate reach before the road-overlap clip and the path's extra reach.
 * A candle is 100. The cloud starts there.
 */
export const INCENSE_RANGE = 100

/**
 * Extra tap damage at each step.
 * Step 1 is the planted cloud. The next two buys stay on this row.
 */
export const INCENSE_TAP = [1, 1, 2] as const

/** Extra plate reach at each step. The first buy and the second buy each add 20. */
export const INCENSE_REACH_STEP = [0, 20, 20] as const

/** How long the cloud keeps helping after a walker leaves it. Only the last step lingers. */
export const INCENSE_LINGER = [0, 0, 0.6] as const

/**
 * A glowing tap is 1. The cloud adds 1 or 2.
 * Together they stay at or under 3, even when a bell is planted beside the cloud.
 */
export const TAP_BONUS_CAP = 3

export const INCENSE_LABEL = 'Incense'

/** Scholars' card line. The smoke rises. It does not strike. */
export const INCENSE_CARD = 'Rising smoke reminds us our prayers rise to God.'

/** Same cite shape as the bell card. */
export const INCENSE_VERSE_CITE = 'Ps 141:2, RSV'

export function isIncense(id: string | null | undefined): boolean {
  return id === INCENSE_ID
}

/** Paths live on the plot, so the cloud stays on this incense. */
export function incensePathKey(plotId: string): string {
  return `${INCENSE_ID}@${plotId}`
}

export function incenseCount(plants: Record<string, string>): number {
  let count = 0
  for (const type of Object.values(plants)) {
    if (type === INCENSE_ID) count += 1
  }
  return count
}

export function incenseRoom(plants: Record<string, string>): boolean {
  return incenseCount(plants) < INCENSE_CAP
}

/**
 * A2 and mazes offer incense on the clear after round 9, then on every later round.
 * The wave of round 9 itself stays closed. Hard never does.
 */
export function incenseUnlocked(easy: boolean, waveIndex: number, phase: string): boolean {
  if (!easy) return false
  const round = Math.floor(waveIndex) + 1
  if (round > 9) return true
  return phase === 'boost' && round >= 9
}

/** Path step 0, 1, or 2. Planted is 0. Two buys reach the last step. */
export function incenseRank(paths: LampPaths | undefined): number {
  const rank = Math.floor(paths?.strong ?? 0)
  if (rank < 0) return 0
  return Math.min(INCENSE_TAP.length - 1, rank)
}

/** Extra damage a tap gains at this step. 1, then 1, then 2. */
export function incenseTapBonus(rank: number): number {
  const step = incenseRank({ far: 0, strong: rank })
  return INCENSE_TAP[step] ?? INCENSE_TAP[0]
}

/** Extra reach at this step. Outside callers add it to `INCENSE_RANGE`. */
export function incenseReachStep(rank: number): number {
  const step = incenseRank({ far: 0, strong: rank })
  return INCENSE_REACH_STEP[step] ?? 0
}

/** Seconds the last step keeps helping. Earlier steps stay at 0. */
export function incenseLinger(rank: number): number {
  const step = incenseRank({ far: 0, strong: rank })
  return INCENSE_LINGER[step] ?? 0
}

/**
 * Cloud bonus that may be added to a tap that already landed.
 * A soaked walker or a shrugging boss gets nothing.
 */
export function incenseTapAdd(bonus: number, soaked: boolean, shrugging: boolean): number {
  if (soaked || shrugging) return 0
  return Math.max(0, Math.floor(bonus) || 0)
}

/**
 * Base tap plus the cloud. The sum stays at or under `TAP_BONUS_CAP`.
 * A base that is already over the cap, such as the round 5 opener, stays as it is.
 */
export function applyIncenseTap(base: number, bonus: number): number {
  const hit = Math.max(0, Math.floor(base) || 0)
  const extra = Math.max(0, Math.floor(bonus) || 0)
  if (extra <= 0) return hit
  return Math.min(Math.max(hit, TAP_BONUS_CAP), hit + extra)
}

export function incenseUpgradeCost(rank: number): number {
  const at = incenseRank({ far: 0, strong: rank })
  if (at >= INCENSE_TAP.length - 1) return 0
  return TREE_STEP_COST[at] ?? 0
}

export function canUpgradeIncense(paths: LampPaths): PathBuy {
  const rank = incenseRank(paths)
  if (rank >= INCENSE_TAP.length - 1) {
    return { ok: false, cost: 0, reason: 'As strong as it gets.' }
  }
  return { ok: true, cost: incenseUpgradeCost(rank), reason: '' }
}

export function incensePlateReach(plotId: string, rank = 0): number {
  const at = lampAnchor(plotId)
  const reach = INCENSE_RANGE + incenseReachStep(rank) + hillRangeBonus(at)
  return lampReach(plotId, reach, pathClearance(at))
}

/** Place one incense. A second cloud, or a pad that already holds a pillar, does nothing. */
export function plantIncense(
  map: Record<string, string>,
  pad: string,
): Record<string, string> {
  if (!incenseRoom(map)) return map
  const standing = map[pad]
  if (standing && standing !== INCENSE_ID) return map
  return { ...map, [pad]: INCENSE_ID }
}

/**
 * Strongest tap bonus on this point. No cloud, or a cloud that misses, is 0.
 * Overlapping clouds do not stack.
 */
export function incenseBonusFor(
  plants: Record<string, string>,
  runPaths: Record<string, LampPaths> | undefined,
  at: { x: number; y: number },
): number {
  let bonus = 0
  for (const [id, type] of Object.entries(plants)) {
    if (type !== INCENSE_ID) continue
    const rank = incenseRank(pathsOf(runPaths, incensePathKey(id)))
    const reach = incensePlateReach(id, rank)
    const cloudAt = lampAnchor(id)
    const inside = Math.hypot(cloudAt.x - at.x, cloudAt.y - at.y) <= reach
    if (!inside) continue
    bonus = Math.max(bonus, incenseTapBonus(rank))
  }
  return bonus
}

/** The cloud does not shoot. Lamps that shoot do not read this. */
export function incenseDamage(): number {
  return 0
}

export function applyIncenseStep(
  plotId: string,
  runPaths: Record<string, LampPaths>,
  sparks: number,
): PathSpend {
  const key = incensePathKey(plotId)
  const current = pathsOf(runPaths, key)
  const buy = canUpgradeIncense(current)
  if (!buy.ok) {
    return { ok: false, paths: runPaths, sparks, note: buy.reason, cost: 0 }
  }
  if (sparks < buy.cost) {
    return { ok: false, paths: runPaths, sparks, note: `Need ${buy.cost} sparks`, cost: buy.cost }
  }
  const next = incenseRank(current) + 1
  return {
    ok: true,
    paths: { ...runPaths, [key]: { ...current, strong: next } },
    sparks: sparks - buy.cost,
    note: `Tap +${incenseTapBonus(next)}`,
    cost: buy.cost,
  }
}

/** Pip text for the planted step. +1 or +2. */
export function incenseMark(paths: LampPaths | undefined): string {
  return `+${incenseTapBonus(incenseRank(paths))}`
}
