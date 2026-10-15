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
 * Easy cross (1.4.490).
 * Nearby lamps wait a little less. The cross does not fire.
 * Locked until round 12 is cleared, so rounds 1–12 never see it.
 * Hard never offers it. The cross has no power of its own. It helps us remember.
 */

export const CROSS_ID = 'cross'

/** Sparks to plant the cross. One cross a night. */
export const CROSS_COST = 8

/** One cross a night. A second cross would not stack. */
export const CROSS_CAP = 1

/** Plate reach before the road-overlap clip. Same ring as a free level I lamp. */
export const CROSS_RANGE = 114

/**
 * How much of the wait nearby lamps give up.
 * Step 1 is the planted cross. The next two buys raise it.
 */
export const CROSS_SOONER = [0.1, 0.15, 0.2] as const

export const CROSS_LABEL = 'Cross'

/** Scholars' card line. The cross has no verse inside this string. */
export const CROSS_CARD = 'The cross helps us remember Jesus died and rose for us.'

/** Same cite shape as the bell and incense cards. */
export const CROSS_VERSE_CITE = 'Hebrews 12:2, RSV'

export function isCross(id: string | null | undefined): boolean {
  return id === CROSS_ID
}

/** Paths live on the plot, so the step stays on this cross. */
export function crossPathKey(plotId: string): string {
  return `${CROSS_ID}@${plotId}`
}

export function crossCount(plants: Record<string, string>): number {
  let count = 0
  for (const type of Object.values(plants)) {
    if (type === CROSS_ID) count += 1
  }
  return count
}

export function crossRoom(plants: Record<string, string>): boolean {
  return crossCount(plants) < CROSS_CAP
}

/**
 * A2 and mazes offer the cross on the clear after round 12, then on every later round.
 * The wave of round 12 itself stays closed. Hard never does.
 */
export function crossUnlocked(easy: boolean, waveIndex: number, phase: string): boolean {
  if (!easy) return false
  const round = Math.floor(waveIndex) + 1
  if (round > 12) return true
  return phase === 'boost' && round >= 12
}

/** Path step 0, 1, or 2. Planted is 0. Two buys reach the last step. */
export function crossRank(paths: LampPaths | undefined): number {
  const rank = Math.floor(paths?.strong ?? 0)
  if (rank < 0) return 0
  return Math.min(CROSS_SOONER.length - 1, rank)
}

/** Fraction of the wait a nearby lamp gives up. 0.1 means ten percent sooner. */
export function crossSooner(rank: number): number {
  const step = crossRank({ far: 0, strong: rank })
  return CROSS_SOONER[step] ?? CROSS_SOONER[0]
}

/**
 * Wait left after the cross. A miss, or no cross, leaves the wait as it was.
 * `pace` is 1 when the lamp is outside every cross.
 */
export function applyCrossWait(wait: number, pace: number): number {
  if (!(pace > 0) || pace >= 1) return wait
  return wait * pace
}

export function crossUpgradeCost(rank: number): number {
  const at = crossRank({ far: 0, strong: rank })
  if (at >= CROSS_SOONER.length - 1) return 0
  return TREE_STEP_COST[at] ?? 0
}

export function canUpgradeCross(paths: LampPaths): PathBuy {
  const rank = crossRank(paths)
  if (rank >= CROSS_SOONER.length - 1) {
    return { ok: false, cost: 0, reason: 'That is the last step.' }
  }
  return { ok: true, cost: crossUpgradeCost(rank), reason: '' }
}

export function crossPlateReach(plotId: string): number {
  const at = lampAnchor(plotId)
  return lampReach(plotId, CROSS_RANGE + hillRangeBonus(at), pathClearance(at))
}

/** Place one cross. A second cross, or a pad that already holds a pillar, does nothing. */
export function plantCross(map: Record<string, string>, pad: string): Record<string, string> {
  if (!crossRoom(map)) return map
  const standing = map[pad]
  if (standing && standing !== CROSS_ID) return map
  return { ...map, [pad]: CROSS_ID }
}

/**
 * Pace for a lamp at this point. 1 means the wait is unchanged.
 * The strongest cross in range wins. Crosses do not stack.
 */
export function crossPaceFor(
  plants: Record<string, string>,
  runPaths: Record<string, LampPaths> | undefined,
  at: { x: number; y: number },
): number {
  let sooner = 0
  for (const [id, type] of Object.entries(plants)) {
    if (type !== CROSS_ID) continue
    const reach = crossPlateReach(id)
    const crossAt = lampAnchor(id)
    const inside = Math.hypot(crossAt.x - at.x, crossAt.y - at.y) <= reach
    if (!inside) continue
    sooner = Math.max(sooner, crossSooner(crossRank(pathsOf(runPaths, crossPathKey(id)))))
  }
  if (sooner <= 0) return 1
  return 1 - sooner
}

export function applyCrossStep(
  plotId: string,
  runPaths: Record<string, LampPaths>,
  sparks: number,
): PathSpend {
  const key = crossPathKey(plotId)
  const current = pathsOf(runPaths, key)
  const buy = canUpgradeCross(current)
  if (!buy.ok) {
    return { ok: false, paths: runPaths, sparks, note: buy.reason, cost: 0 }
  }
  if (sparks < buy.cost) {
    return { ok: false, paths: runPaths, sparks, note: `Need ${buy.cost} sparks`, cost: buy.cost }
  }
  const next = crossRank(current) + 1
  return {
    ok: true,
    paths: { ...runPaths, [key]: { ...current, strong: next } },
    sparks: sparks - buy.cost,
    note: `Sooner ${Math.round(crossSooner(next) * 100)}%`,
    cost: buy.cost,
  }
}

/** Pip text for the planted step. 10%, 15%, or 20%. */
export function crossMark(paths: LampPaths | undefined): string {
  return `${Math.round(crossSooner(crossRank(paths)) * 100)}%`
}
