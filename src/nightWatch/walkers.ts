import { EASY_PLANT_PADS } from '../lib/nightPlants.ts'
import { EASY_LAMP_COST, WATCH_TOOLS } from '../lib/watchTools.ts'
import { TREE_STEP_COST, type LampPaths, type TreePath } from './upgradeTree.ts'
import { EASY_ROUNDS, type EasyRound } from './rounds.ts'

/**
 * Easy walker gaits (1.4.411, slice 1 of #604).
 * Plain walkers keep the round's own pace and health.
 * Fast is low health and a quicker step, so a longer reach catches them.
 * Tough is slow and thick, so a harder shot brings them down, and the kill pays more.
 * A third gait is not in this slice. Hard does not read this.
 */
export type WalkerGait = 'plain' | 'fast' | 'tough'

/** Multiplier on the round's walk speed. */
export const FAST_PACE = 1.75
/** Fast ignores the round's health bonus and stays this short. */
export const FAST_HP = 2
/** Multiplier on the round's walk speed. */
export const TOUGH_PACE = 0.88
/** Added on top of kind HP and the round's health bonus. */
export const TOUGH_HP_BONUS = 16
/** Sparks for turning a tough walker. Plain and fast still pay one. */
export const TOUGH_SPARK = 2

export function walkerPace(gait: WalkerGait | undefined): number {
  if (gait === 'fast') return FAST_PACE
  if (gait === 'tough') return TOUGH_PACE
  return 1
}

/** Kind HP plus the round bonus, then the gait. Fast stays at FAST_HP. */
export function walkerHp(kindHp: number, roundBonus: number, gait: WalkerGait | undefined): number {
  const kind = Math.max(1, Math.floor(kindHp) || 1)
  const bonus = Math.max(0, Math.floor(roundBonus) || 0)
  if (gait === 'fast') return FAST_HP
  if (gait === 'tough') return kind + bonus + TOUGH_HP_BONUS
  return kind + bonus
}

export function walkerSpark(gait: WalkerGait | undefined): number {
  return gait === 'tough' ? TOUGH_SPARK : 1
}

/** One spark per walker, plus one extra for each tough walker in the round. */
export function roundSparkPay(round: Pick<EasyRound, 'count' | 'fast' | 'tough'>): number {
  const count = Math.max(0, Math.floor(round.count) || 0)
  const tough = Math.max(0, Math.min(count, Math.floor(round.tough) || 0))
  return count + tough * (TOUGH_SPARK - 1)
}

const JUMP_PADS = EASY_PLANT_PADS
const JUMP_TOOLS = WATCH_TOOLS.map((tool) => tool.id)

/**
 * The buy order a natural spender actually takes.
 * Love goes to Strong 3 then Far 1, Logic to Strong 2, Reason to Strong 1
 * then Far 1. After that, each planted lamp finishes at Far 1 / Strong 3.
 * There is no fifth lamp and no fourth step.
 */
const NATURAL_PLAN: readonly { tool: number; path: TreePath; rank: number }[] = [
  { tool: 0, path: 'strong', rank: 1 },
  { tool: 0, path: 'strong', rank: 2 },
  { tool: 0, path: 'strong', rank: 3 },
  { tool: 0, path: 'far', rank: 1 },
  { tool: 1, path: 'strong', rank: 1 },
  { tool: 1, path: 'strong', rank: 2 },
  { tool: 2, path: 'strong', rank: 1 },
  { tool: 2, path: 'far', rank: 1 },
  { tool: 1, path: 'strong', rank: 3 },
  { tool: 1, path: 'far', rank: 1 },
  { tool: 2, path: 'strong', rank: 2 },
  { tool: 2, path: 'strong', rank: 3 },
  { tool: 3, path: 'strong', rank: 1 },
  { tool: 3, path: 'strong', rank: 2 },
  { tool: 3, path: 'strong', rank: 3 },
  { tool: 3, path: 'far', rank: 1 },
]

export interface EasyJumpLoad {
  sparks: number
  /** Pad id → tool id. Empty on round 1. */
  plants: Record<string, string>
  paths: Record<string, LampPaths>
  lamps: LampPaths[]
}

/**
 * What the natural spender owns when this round begins.
 * The first lamp is free. Later lamps cost `EASY_LAMP_COST`.
 * Sparks left are the bank after the buys they could afford.
 * Playtest jumps only. A normal night does not call this.
 */
export function easyJumpLoad(roundIndex: number): EasyJumpLoad {
  const index = Math.max(0, Math.floor(roundIndex) || 0)
  const lamps: LampPaths[] = [{ far: 0, strong: 0 }]
  let sparks = 0
  let step = 0
  for (let at = 0; at < index; at += 1) {
    const boss = easyBossRound(at) ? 1 + BOSS_CLEAR_SPARKS : 0
    sparks += roundSparkPay(EASY_ROUNDS[at]) + boss
    let guard = 0
    while (guard < 40) {
      guard += 1
      const next = NATURAL_PLAN[step]
      if (!next) break
      let planted = false
      while (lamps.length <= next.tool && lamps.length < JUMP_TOOLS.length) {
        if (sparks < EASY_LAMP_COST) break
        sparks -= EASY_LAMP_COST
        lamps.push({ far: 0, strong: 0 })
        planted = true
      }
      if (lamps.length <= next.tool) break
      const lamp = lamps[next.tool]
      if (lamp[next.path] >= next.rank) {
        step += 1
        continue
      }
      if (lamp[next.path] !== next.rank - 1) break
      const cost = TREE_STEP_COST[lamp[next.path]] ?? 0
      if (sparks < cost) break
      sparks -= cost
      lamp[next.path] += 1
      planted = true
      if (lamp[next.path] >= next.rank) step += 1
      if (!planted) break
    }
  }
  const plants: Record<string, string> = {}
  const paths: Record<string, LampPaths> = {}
  for (const tool of JUMP_TOOLS) paths[tool] = { far: 0, strong: 0 }
  lamps.forEach((lamp, at) => {
    const pad = JUMP_PADS[at]
    const tool = JUMP_TOOLS[at]
    if (!pad || !tool) return
    plants[pad] = tool
    paths[tool] = { far: lamp.far, strong: lamp.strong }
  })
  return { sparks, plants, paths, lamps: lamps.map((lamp) => ({ far: lamp.far, strong: lamp.strong })) }
}

/**
 * Sparks the natural spender still holds when this round begins.
 * Round 1 is still zero. Playtest jumps only.
 */
export function easyJumpSparkBank(roundIndex: number): number {
  return easyJumpLoad(roundIndex).sparks
}

/**
 * Spread the specials through the round so they are not one clump at the gate.
 * Tough is placed first. Fast fills plain slots after that.
 */
export function gaitPlan(round: Pick<EasyRound, 'count' | 'fast' | 'tough'>): WalkerGait[] {
  const count = Math.max(0, Math.floor(round.count) || 0)
  const plan: WalkerGait[] = Array.from({ length: count }, () => 'plain')
  const place = (want: number, gait: WalkerGait, salt: number) => {
    let left = Math.max(0, Math.min(count, Math.floor(want) || 0))
    if (left === 0) return
    const open = plan.filter((slot) => slot === 'plain').length
    left = Math.min(left, open)
    const stride = count / left
    let guard = 0
    let step = 0
    while (left > 0 && guard < count * 3) {
      const slot = Math.min(count - 1, Math.floor(salt + step * stride)) % count
      if (plan[slot] === 'plain') {
        plan[slot] = gait
        left -= 1
      }
      step += 1
      guard += 1
    }
  }
  place(round.tough, 'tough', 0)
  place(round.fast, 'fast', Math.max(1, Math.floor(count / 3)))
  return plan
}

export function gaitForSlot(
  round: Pick<EasyRound, 'count' | 'fast' | 'tough'>,
  slot: number,
): WalkerGait {
  const plan = gaitPlan(round)
  const index = Math.max(0, Math.floor(slot) || 0)
  return plan[index] ?? 'plain'
}

/** Boss step. Slower than a plain walker so the big shape stays readable. */
export const BOSS_PACE = 0.7

/** Easy rounds 5, 10, 15, 20, and 25. Hard does not read this. */
export function easyBossRound(index: number): boolean {
  const round = Math.floor(index) + 1
  return round > 0 && round % 5 === 0 && round <= 25
}

/**
 * Boss health. Round 5 stays the teaching bar (12). Rounds 6–9 stay 44.
 * Round 10 is 40: a Strong 3 porch ring plus taps land about 43, so the boss
 * falls and a lamp that never reaches still loses it.
 * Rounds 15, 20, and 25 used to be 200 / 260 / 320. Live play on 1.4.436 showed
 * a maxed lamp (Strong 3) land about 15 in the one ring that reaches the road,
 * plus four taps before the boss shrugs. The bar sits inside that budget.
 * A later, harder lamp still has to spend the pass. It does not delete the boss.
 */
export function easyBossHp(index: number): number {
  const round = Math.floor(index) + 1
  if (round <= 5) return 12
  if (round < 10) return 44
  // Round 10: lamps land about 15 and taps still count, for about 43 together.
  if (round === 10) return 40
  if (round <= 15) return 16
  if (round <= 20) return 17
  return 18
}

/**
 * Tough health from round 7 through 15.
 * One porch ring at Strong 3 lands about 15 during the pass. Four taps take 4
 * before the shrug, so a bar of 12 is a kill for Strong 3 and a leak for a
 * level I lamp (about 2). Rounds 1–6 keep `TOUGH_HP_BONUS` via `walkerHp`.
 */
export const EASY_TOUGH_WINDOW = 12

/** Live Easy walker health. Rounds 1–6 match `walkerHp`. Hard does not read this. */
export function easyWalkerHp(
  kindHp: number,
  roundBonus: number,
  gait: WalkerGait | undefined,
  roundIndex: number,
): number {
  const round = Math.floor(roundIndex) + 1
  if (gait !== 'tough' || round < 7 || round > 15) return walkerHp(kindHp, roundBonus, gait)
  return EASY_TOUGH_WINDOW
}

/** Extra sparks when an Easy boss round clears. A loss pays nothing. */
export const BOSS_CLEAR_SPARKS = 2

export function easyBossClearSparks(index: number): number {
  return easyBossRound(index) ? BOSS_CLEAR_SPARKS : 0
}

/**
 * Extra health from round 13 on, added to the table bonus.
 * Breather rounds take a smaller bump. The boss bar is separate.
 */
export function easyLatePush(index: number): number {
  const round = Math.floor(index) + 1
  if (round < 13) return 0
  if (round <= 14) return 12
  if (round === 15) return 18
  if (round === 16) return 10
  if (round <= 19) return 18
  if (round === 20) return 12
  return 20
}
