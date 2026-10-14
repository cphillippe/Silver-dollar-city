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
 * Easy bell (1.4.467).
 * A ring that slows walkers. It does not hurt them and it does not zap.
 * Locked until round 6 is cleared, so rounds 1–6 never see it.
 * The bell has no power of its own. It calls people to pray.
 */

export const BELL_ID = 'bell'

/** Sparks to plant the bell. Pillar lamps stay at 5. Candles stay at 3. */
export const BELL_COST = 6

/** One bell a night. A second ring would not stack. */
export const BELL_CAP = 1

/**
 * Plate reach before the road-overlap clip.
 * A free level I lamp is 114. The bell uses that same ring.
 */
export const BELL_RANGE = 114

/**
 * Slow at each step of the path.
 * Step 1 is the planted bell. The next two buys raise it.
 * 20%, then 30%, then 35%.
 */
export const BELL_SLOW = [0.2, 0.3, 0.35] as const

export const BELL_LABEL = 'Bell'

/** Scholars' card line. The object calls people. It does not strike. */
export const BELL_CARD =
  'Church bells call people to pray, and ring when someone needs help so neighbors come.'

export function isBell(id: string | null | undefined): boolean {
  return id === BELL_ID
}

/** Paths live on the plot, so the slow stays on this bell. */
export function bellPathKey(plotId: string): string {
  return `${BELL_ID}@${plotId}`
}

export function bellCount(plants: Record<string, string>): number {
  let count = 0
  for (const type of Object.values(plants)) {
    if (type === BELL_ID) count += 1
  }
  return count
}

export function bellRoom(plants: Record<string, string>): boolean {
  return bellCount(plants) < BELL_CAP
}

/**
 * A2 and mazes offer the bell on the clear after round 6, then on every later round.
 * The wave of round 6 itself stays closed. Hard never does.
 */
export function bellUnlocked(easy: boolean, waveIndex: number, phase: string): boolean {
  if (!easy) return false
  const round = Math.floor(waveIndex) + 1
  if (round > 6) return true
  return phase === 'boost' && round >= 6
}

/** Path step 0, 1, or 2. Planted is 0 (20%). Two buys reach 35%. */
export function bellRank(paths: LampPaths | undefined): number {
  const rank = Math.floor(paths?.strong ?? 0)
  if (rank < 0) return 0
  return Math.min(BELL_SLOW.length - 1, rank)
}

/** Fraction of walk speed the ring takes away. 0.2 means twenty percent slower. */
export function bellSlow(rank: number): number {
  const step = bellRank({ far: 0, strong: rank })
  return BELL_SLOW[step] ?? BELL_SLOW[0]
}

/** Pace multiplier. A miss leaves the walker at full pace. */
export function applyBellSlow(pace: number, rank: number, inReach: boolean): number {
  if (!inReach) return pace
  return pace * (1 - bellSlow(rank))
}

export function bellUpgradeCost(rank: number): number {
  const at = bellRank({ far: 0, strong: rank })
  if (at >= BELL_SLOW.length - 1) return 0
  return TREE_STEP_COST[at] ?? 0
}

export function canUpgradeBell(paths: LampPaths): PathBuy {
  const rank = bellRank(paths)
  if (rank >= BELL_SLOW.length - 1) {
    return { ok: false, cost: 0, reason: 'As slow as it gets.' }
  }
  return { ok: true, cost: bellUpgradeCost(rank), reason: '' }
}

export function bellPlateReach(plotId: string): number {
  const at = lampAnchor(plotId)
  return lampReach(plotId, BELL_RANGE + hillRangeBonus(at), pathClearance(at))
}

/** Place one bell. A second bell, or a pad that already holds a pillar, does nothing. */
export function plantBell(
  map: Record<string, string>,
  pad: string,
): Record<string, string> {
  if (!bellRoom(map)) return map
  const standing = map[pad]
  if (standing && standing !== BELL_ID) return map
  return { ...map, [pad]: BELL_ID }
}

/**
 * Strongest slow on this point. No bell, or a bell that misses, leaves pace at 1.
 * Overlapping bells do not stack.
 */
export function bellPaceFor(
  plants: Record<string, string>,
  runPaths: Record<string, LampPaths> | undefined,
  at: { x: number; y: number },
): number {
  let slow = 0
  for (const [id, type] of Object.entries(plants)) {
    if (type !== BELL_ID) continue
    const reach = bellPlateReach(id)
    const bellAt = lampAnchor(id)
    const inside = Math.hypot(bellAt.x - at.x, bellAt.y - at.y) <= reach
    if (!inside) continue
    slow = Math.max(slow, bellSlow(bellRank(pathsOf(runPaths, bellPathKey(id)))))
  }
  if (slow <= 0) return 1
  return 1 - slow
}

/** The bell deals nothing. Lamps that shoot do not read this. */
export function bellDamage(): number {
  return 0
}

export function applyBellStep(
  plotId: string,
  runPaths: Record<string, LampPaths>,
  sparks: number,
): PathSpend {
  const key = bellPathKey(plotId)
  const current = pathsOf(runPaths, key)
  const buy = canUpgradeBell(current)
  if (!buy.ok) {
    return { ok: false, paths: runPaths, sparks, note: buy.reason, cost: 0 }
  }
  if (sparks < buy.cost) {
    return { ok: false, paths: runPaths, sparks, note: `Need ${buy.cost} sparks`, cost: buy.cost }
  }
  const next = bellRank(current) + 1
  return {
    ok: true,
    paths: { ...runPaths, [key]: { ...current, strong: next } },
    sparks: sparks - buy.cost,
    note: `Slow ${Math.round(bellSlow(next) * 100)}%`,
    cost: buy.cost,
  }
}

/** Pip text for the planted step. 20%, 30%, or 35%. */
export function bellMark(paths: LampPaths | undefined): string {
  return `${Math.round(bellSlow(bellRank(paths)) * 100)}%`
}
