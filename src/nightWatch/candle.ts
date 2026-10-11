import { lampAnchor, pathClearance } from './path/data.ts'
import { hillRangeBonus } from './maps/features.ts'
import { lampReach } from './towers/index.ts'
import {
  freshLampPaths,
  PATH_LABEL,
  pathsOf,
  TREE_STEP_COST,
  type LampPaths,
  type PathBuy,
  type PathSpend,
  type TreePath,
} from './upgradeTree.ts'

/**
 * Easy candle stand (1.4.445).
 * A cheap short lamp you plant in a row. It is not a fifth pillar tool.
 * The candle has no power of its own. It helps people pray and remember God.
 * Damage on the road is only a game effect.
 */

export const CANDLE_ID = 'candle'

/** Sparks to plant one candle after it unlocks. A pillar lamp stays at 5. */
export const CANDLE_COST = 3

/** How many candles one night can hold. Past this the row stops. */
export const CANDLE_CAP = 6

/** A2 round that opens the candle. Mazes offer it from the first plant. */
export const CANDLE_FROM_ROUND = 3

/** Combat reach before the road-overlap rule. Shorter than a level I lamp (114). */
export const CANDLE_RANGE = 62

/** Auto-shot wait. A little quicker than a level I lamp (700). */
export const CANDLE_COOLDOWN_MS = 480

export const CANDLE_DAMAGE = 1

/** Another candle inside this radius adds a little damage. */
export const CANDLE_LINK = 78

export const CANDLE_LINK_DAMAGE = 1

/** Extra damage from nearby candles. A row of 3–4 fills this. */
export const CANDLE_LINK_CAP = 2

/** Each path stops at 2. The path you do not take deep still gets step 1. */
export const CANDLE_STEP_MAX = 2

/** Extra reach for one Far step. Not the pillar Far-1 road bonus. */
export const CANDLE_FAR_STEP = 14

export const CANDLE_LOCK = 'One path goes to two. This one stops at one.'

export const CANDLE_LABEL = 'Candle'

export const CANDLE_INTRO = 'New lamp · Candle'

/** Biblical Scholar card line. */
export const CANDLE_CARD = 'A small candle is a sign of a prayer for someone.'

/** John 1:5, RSV. */
export const CANDLE_VERSE = 'The light shines in the darkness, and the darkness has not overcome it.'

export const CANDLE_VERSE_CITE = 'John 1:5, RSV'

/** History & Philosophy line. */
export const CANDLE_HELP = 'One small light helps; many lights together fill the dark.'

export function isCandle(id: string | null | undefined): boolean {
  return id === CANDLE_ID
}

/** Paths live on the plot, so one buy does not raise every candle. */
export function candlePathKey(plotId: string): string {
  return `${CANDLE_ID}@${plotId}`
}

export function candleCount(plants: Record<string, string>): number {
  let count = 0
  for (const type of Object.values(plants)) {
    if (type === CANDLE_ID) count += 1
  }
  return count
}

export function candleRoom(plants: Record<string, string>): boolean {
  return candleCount(plants) < CANDLE_CAP
}

/**
 * A2 opens on the clear after round 2, so a row can be down before round 3.
 * A maze offers the candle from the start. Hard never does.
 */
export function candleUnlocked(
  easy: boolean,
  waveIndex: number,
  maze: boolean,
  phase: string,
): boolean {
  if (!easy) return false
  if (maze) return true
  const round = Math.floor(waveIndex) + 1
  if (round >= CANDLE_FROM_ROUND) return true
  if (phase === 'boost' && round + 1 >= CANDLE_FROM_ROUND) return true
  return false
}

/** Place a candle. Other candles stay. A full row or a taken pillar pad does nothing. */
export function plantCandle(
  map: Record<string, string>,
  pad: string,
): Record<string, string> {
  if (!candleRoom(map)) return map
  const standing = map[pad]
  if (standing && standing !== CANDLE_ID) return map
  return { ...map, [pad]: CANDLE_ID }
}

export function candleNeighbors(plotId: string, plants: Record<string, string>): number {
  const at = lampAnchor(plotId)
  let near = 0
  for (const [id, type] of Object.entries(plants)) {
    if (id === plotId || type !== CANDLE_ID) continue
    const other = lampAnchor(id)
    if (Math.hypot(other.x - at.x, other.y - at.y) <= CANDLE_LINK) near += 1
  }
  return near
}

export function candleLinkBonus(neighbors: number): number {
  const near = Math.max(0, Math.floor(neighbors) || 0)
  return Math.min(CANDLE_LINK_CAP, near * CANDLE_LINK_DAMAGE)
}

function clampStep(rank: number | undefined): number {
  if (!rank || rank < 0) return 0
  return Math.min(CANDLE_STEP_MAX, Math.floor(rank))
}

export function candleFarBonus(paths: LampPaths): number {
  return clampStep(paths.far) * CANDLE_FAR_STEP
}

/** Game damage. Nearby candles add a little, then the cap holds. */
export function candleDamage(paths: LampPaths, neighbors: number): number {
  const strong = clampStep(paths.strong)
  const base = CANDLE_DAMAGE + (strong >= 2 ? 1 : 0)
  return base + candleLinkBonus(neighbors)
}

export function candleCooldown(paths: LampPaths): number {
  const strong = clampStep(paths.strong)
  if (strong >= 2) return 320
  if (strong >= 1) return 400
  return CANDLE_COOLDOWN_MS
}

export function candlePlateReach(plotId: string, farBonus = 0): number {
  const at = lampAnchor(plotId)
  const base = CANDLE_RANGE + Math.max(0, farBonus) + hillRangeBonus(at)
  return lampReach(plotId, base, pathClearance(at))
}

export function candleRoadNote(plotId: string, farBonus = 0): string {
  const at = lampAnchor(plotId)
  const held = Math.max(0, farBonus)
  const meets = (bonus: number) => {
    const range = candlePlateReach(plotId, bonus)
    return range > 0 && pathClearance(at) <= range
  }
  if (meets(held)) return ''
  if (held < CANDLE_FAR_STEP && meets(CANDLE_FAR_STEP)) return 'Reaches on Far step 1'
  if (held < CANDLE_FAR_STEP * 2 && meets(CANDLE_FAR_STEP * 2)) return 'Reaches on Far step 2'
  return 'Too far from the road'
}

export interface CandleStrike {
  damage: number
  rangeBonus: number
  cooldownMs: number
  splash: number
  splashFrac: number
  outer: number
  outerFrac: number
}

export function candleStrike(paths: LampPaths, neighbors: number): CandleStrike {
  return {
    damage: candleDamage(paths, neighbors),
    rangeBonus: candleFarBonus(paths),
    cooldownMs: candleCooldown(paths),
    splash: 0,
    splashFrac: 0,
    outer: 0,
    outerFrac: 0,
  }
}

export function canTakeCandle(paths: LampPaths, path: TreePath): PathBuy {
  const rank = clampStep(paths[path])
  const other = clampStep(paths[path === 'far' ? 'strong' : 'far'])
  if (rank >= CANDLE_STEP_MAX) return { ok: false, cost: 0, reason: 'This path is full.' }
  if (rank >= 1 && other >= CANDLE_STEP_MAX) return { ok: false, cost: 0, reason: CANDLE_LOCK }
  return { ok: true, cost: TREE_STEP_COST[rank] ?? 0, reason: '' }
}

export function candleStepLocked(paths: LampPaths, path: TreePath, step: number): boolean {
  if (step < 2) return false
  if (clampStep(paths[path]) >= step) return false
  const other = clampStep(paths[path === 'far' ? 'strong' : 'far'])
  return other >= CANDLE_STEP_MAX
}

export function applyCandleStep(
  plotId: string,
  runPaths: Record<string, LampPaths>,
  sparks: number,
  path: TreePath,
): PathSpend {
  const key = candlePathKey(plotId)
  const current = pathsOf(runPaths, key)
  const buy = canTakeCandle(current, path)
  const label = PATH_LABEL[path]
  if (!buy.ok) return { ok: false, paths: runPaths, sparks, note: buy.reason, cost: 0 }
  if (sparks < buy.cost) {
    return { ok: false, paths: runPaths, sparks, note: `Need ${buy.cost} sparks`, cost: buy.cost }
  }
  const next = current[path] + 1
  return {
    ok: true,
    paths: { ...runPaths, [key]: { ...current, [path]: next } },
    sparks: sparks - buy.cost,
    note: `${label} ${next}`,
    cost: buy.cost,
  }
}

/** Empty paths for a candle that has not been bought up yet. */
export function freshCandlePaths(): LampPaths {
  return freshLampPaths()
}
