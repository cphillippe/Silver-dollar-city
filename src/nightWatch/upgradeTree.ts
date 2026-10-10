import { WATCH_TOOLS } from '../lib/watchTools.ts'

/**
 * Easy Night Watch upgrade tree (1.4.405).
 * Two paths, three steps. One path may reach 3. The other stops at 1.
 * Hard keeps the linear I–II–III spark bump and does not read this.
 */

export const TREE_PATHS = ['far', 'strong'] as const
export type TreePath = (typeof TREE_PATHS)[number]

/** Sparks for step 1, step 2, and step 3. The same row on every lamp and both paths. */
export const TREE_STEP_COST = [3, 6, 12] as const

/** Sparks for the Lock In bonus step. Steps 1–3 stay on the row above. */
export const TREE_BONUS_COST = 15

/** Same-pillar Lock In lessons needed before that bonus step can be bought. */
export const BONUS_LESSONS = 3

export const TREE_STEP_MAX = 3
/** Step 4. Locked until same-pillar Lock In lessons open it. Steps 1–3 do not read this. */
export const TREE_BONUS_MAX = 4
/** The path you do not take deep can still take its first step. */
export const TREE_CROSS_MAX = 1

export const TREE_LOCK = 'One path goes to three. This one stops at one.'

/** Shown on the bonus pip until Lock In lessons of this lamp's pillar open it. */
export const LESSON_LOCK = 'Learn in Lock In to unlock'

export const PATH_LABEL: Record<TreePath, string> = {
  far: 'Far',
  strong: 'Strong',
}

/** One line under the path name. Plain Easy words. */
export const PATH_LINE: Record<TreePath, string> = {
  far: 'Reaches farther',
  strong: 'Hits harder',
}

export interface LampPaths {
  far: number
  strong: number
}

export interface PathBuy {
  ok: boolean
  cost: number
  reason: string
  /** Set when the next step is the bonus tier and Lock In has not opened it. */
  gate?: 'lesson'
}

/** Lessons already held for this lamp, and the tester override. */
export interface BonusGate {
  lessons: number
  playtest: boolean
}

export interface PathSpend {
  ok: boolean
  paths: Record<string, LampPaths>
  sparks: number
  note: string
  cost: number
}

/**
 * What one lamp's steps do in combat.
 * Step 1 on either path does not change the main shot, so round 6 still needs a second step.
 * Far step 1 nicks a walker just past the ring. Strong step 1 nicks one inside it.
 * Far step 2 grows the ring. Strong step 2 raises the main hit to 2.
 * Step 3 is the late-night kit: Strong hits for 3 and shoots faster; Far reaches farther,
 * hits for 2, and shoots faster. A finished lamp is one of those, plus the other path's first step.
 */
export interface LampStrike {
  damage: number
  /** Added to the level-I reach before the road-overlap rule. */
  rangeBonus: number
  cooldownMs: number
  /** Extra hit on one walker inside this fraction of the ring. */
  splash: number
  splashFrac: number
  /** Extra hit on one walker just outside the ring. */
  outer: number
  outerFrac: number
}

export function freshLampPaths(): LampPaths {
  return { far: 0, strong: 0 }
}

export function freshRunPaths(): Record<string, LampPaths> {
  return Object.fromEntries(WATCH_TOOLS.map((tool) => [tool.id, freshLampPaths()]))
}

/**
 * Extra reach Far step 1 adds on the plate (1.4.438).
 * `lampStrike` still reports 0 so the older score seats stay put.
 * A free level I ring is 114. Plus 48 it meets a gap of about 138,
 * which is the open ground beside the road, not the far corners.
 */
export const FAR1_ROAD_REACH = 48

/** Combat reach bonus. Far step 1 grows the ring even though its strike bonus stays 0. */
export function easyShotReach(paths: LampPaths): number {
  const strike = lampStrike(paths)
  if (strike.rangeBonus > 0) return strike.rangeBonus
  if (clampRank(paths.far) >= 1) return FAR1_ROAD_REACH
  return 0
}

/** Sparks already spent on this lamp's steps. Pull gives them back. */
export function pathSparkSpend(paths: LampPaths): number {
  let total = 0
  for (const path of TREE_PATHS) {
    const rank = clampRank(paths[path])
    for (let step = 0; step < rank; step += 1) {
      total += step < TREE_STEP_COST.length ? (TREE_STEP_COST[step] ?? 0) : TREE_BONUS_COST
    }
  }
  return total
}

export function pathsOf(runPaths: Record<string, LampPaths> | undefined, toolId: string): LampPaths {
  const live = runPaths?.[toolId]
  return {
    far: clampRank(live?.far),
    strong: clampRank(live?.strong),
  }
}

function clampRank(rank: number | undefined): number {
  if (!rank || rank < 0) return 0
  return Math.min(TREE_BONUS_MAX, Math.floor(rank))
}

export function otherPath(path: TreePath): TreePath {
  return path === 'far' ? 'strong' : 'far'
}

/** Price of the next step when the path is already at `rank`. Full paths cost 0. */
export function stepPrice(rank: number): number {
  const at = Math.floor(rank)
  if (at === TREE_STEP_MAX) return TREE_BONUS_COST
  if (at < 0 || at >= TREE_BONUS_MAX) return 0
  return TREE_STEP_COST[at] ?? 0
}

function bonusOpen(gate: BonusGate | undefined): boolean {
  if (gate?.playtest) return true
  return (gate?.lessons ?? 0) >= BONUS_LESSONS
}

export function canTake(paths: LampPaths, path: TreePath, gate?: BonusGate): PathBuy {
  const rank = clampRank(paths[path])
  const other = clampRank(paths[otherPath(path)])
  if (rank >= TREE_BONUS_MAX) return { ok: false, cost: 0, reason: 'This path is full.' }
  if (rank >= TREE_CROSS_MAX && other >= 2) return { ok: false, cost: 0, reason: TREE_LOCK }
  if (rank >= TREE_STEP_MAX && !bonusOpen(gate)) {
    return { ok: false, cost: TREE_BONUS_COST, reason: LESSON_LOCK, gate: 'lesson' }
  }
  return { ok: true, cost: stepPrice(rank), reason: '' }
}

/** True when this step (1-based) cannot be bought because the other path went deep. */
export function stepLocked(paths: LampPaths, path: TreePath, step: number): boolean {
  if (step < 2) return false
  if (clampRank(paths[path]) >= step) return false
  return clampRank(paths[otherPath(path)]) >= 2
}

export function lampStrike(paths: LampPaths): LampStrike {
  const far = clampRank(paths.far)
  const strong = clampRank(paths.strong)
  let damage = 1
  let rangeBonus = 0
  let cooldownMs = 700
  let splash = 0
  let outer = 0
  if (strong >= 1) splash = 1
  if (strong >= 2) {
    damage = 2
    cooldownMs = 450
  }
  if (strong >= 3) {
    damage = 5
    cooldownMs = 280
  }
  if (strong >= 4) {
    cooldownMs = 180
  }
  if (far >= 1) outer = 1
  if (far >= 2) {
    rangeBonus = 24
    damage = Math.max(damage, 2)
  }
  if (far >= 3) {
    rangeBonus = 40
    damage = Math.max(damage, 4)
    cooldownMs = Math.min(cooldownMs, 280)
  }
  if (far >= 4) {
    rangeBonus = 48
  }
  return {
    damage,
    rangeBonus,
    cooldownMs,
    splash,
    splashFrac: 0.55,
    outer,
    outerFrac: 0.28,
  }
}

/** Compact lamp pip. The card spells the paths out. */
export function pathBadge(paths: LampPaths): string {
  const far = clampRank(paths.far)
  const strong = clampRank(paths.strong)
  if (far === 0 && strong === 0) return ''
  if (far > 0 && strong === 0) return `Far ${far}`
  if (strong > 0 && far === 0) return `Strong ${strong}`
  return `F${far} S${strong}`
}

export function applyPathStep(
  toolId: string,
  runPaths: Record<string, LampPaths>,
  sparks: number,
  path: TreePath,
  gate?: BonusGate,
): PathSpend {
  const current = pathsOf(runPaths, toolId)
  const buy = canTake(current, path, gate)
  const label = PATH_LABEL[path]
  if (!buy.ok) {
    return { ok: false, paths: runPaths, sparks, note: buy.reason, cost: 0 }
  }
  if (sparks < buy.cost) {
    return { ok: false, paths: runPaths, sparks, note: `Need ${buy.cost} sparks`, cost: buy.cost }
  }
  const next = current[path] + 1
  return {
    ok: true,
    paths: { ...runPaths, [toolId]: { ...current, [path]: next } },
    sparks: sparks - buy.cost,
    note: `${label} ${next}`,
    cost: buy.cost,
  }
}

/** Cheapest open buy, for the rail's broke line. Null when both paths are finished. */
export function cheapestOpen(paths: LampPaths): PathBuy | null {
  const open = TREE_PATHS.map((path) => canTake(paths, path)).filter((buy) => buy.ok)
  if (open.length === 0) return null
  return open.reduce((best, buy) => (buy.cost < best.cost ? buy : best))
}

export interface SpenderLamp {
  far: number
  strong: number
}

export interface SpenderRow {
  /** 1-based round whose pay was just spent. */
  round: number
  sparks: number
  lamps: SpenderLamp[]
  /** False once every planted lamp is 3/1 or 1/3 and four lamps are down. */
  open: boolean
}

/**
 * A spender finishes the path they started before opening the other one,
 * then plants the next lamp, and only then takes the cross-path step.
 * Strong is the path they open first. The full sink is still 3+6+12 on the
 * deep path plus 3 on the other, so four lamps are not finished before round 18.
 */
export function spendTreeNight(
  pays: readonly number[],
  lampCost: number,
): { doneAt: number | null; rows: SpenderRow[] } {
  const lamps: LampPaths[] = [freshLampPaths(), freshLampPaths()]
  let sparks = 0
  let doneAt: number | null = null
  const rows: SpenderRow[] = []
  for (let index = 0; index < pays.length; index += 1) {
    sparks += pays[index] ?? 0
    let guard = 0
    while (guard < 40) {
      guard += 1
      const deepening = lamps.some((lamp) =>
        TREE_PATHS.some((path) => lamp[path] >= 1 && canTake(lamp, path).ok),
      )
      const buy = cheapestAction(lamps, sparks, lampCost)
      if (!buy) break
      const band = buy.kind === 'step' ? buy.band : 3
      // Hold sparks for the next step on a path already started. A 3-spark
      // cross step would otherwise spend the bank that step 3 is waiting on.
      if (deepening && band > 0) break
      sparks -= buy.cost
      if (buy.kind === 'lamp') lamps.push(freshLampPaths())
      else lamps[buy.lamp] = { ...lamps[buy.lamp], [buy.path]: lamps[buy.lamp][buy.path] + 1 }
    }
    const open = cheapestAction(lamps, Number.POSITIVE_INFINITY, lampCost) !== null
    if (!open && doneAt === null) doneAt = index + 1
    rows.push({
      round: index + 1,
      sparks,
      lamps: lamps.map((lamp) => ({ far: lamp.far, strong: lamp.strong })),
      open,
    })
  }
  return { doneAt, rows }
}

function cheapestAction(
  lamps: LampPaths[],
  sparks: number,
  lampCost: number,
): { kind: 'step'; lamp: number; path: TreePath; cost: number; band: number } | { kind: 'lamp'; cost: number } | null {
  let best: { kind: 'step'; lamp: number; path: TreePath; cost: number; band: number } | null = null
  for (let index = 0; index < lamps.length; index += 1) {
    const lamp = lamps[index]
    for (const path of TREE_PATHS) {
      const buy = canTake(lamp, path)
      if (!buy.ok || buy.cost > sparks) continue
      const rank = lamp[path]
      const other = lamp[otherPath(path)]
      const band = rank >= 1 ? 0 : other === 0 && path === 'strong' ? 1 : other === 0 ? 2 : 4
      const better =
        !best ||
        band < best.band ||
        (band === best.band && buy.cost < best.cost) ||
        (band === best.band && buy.cost === best.cost && path === 'strong' && best.path === 'far')
      if (better) best = { kind: 'step', lamp: index, path, cost: buy.cost, band }
    }
  }
  const lampBand = 3
  if (lamps.length < WATCH_TOOLS.length && sparks >= lampCost) {
    if (!best || lampBand < best.band) return { kind: 'lamp', cost: lampCost }
  }
  if (best) return best
  return null
}
