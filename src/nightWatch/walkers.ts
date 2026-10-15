import { EASY_LAMP_COST, WATCH_TOOLS } from '../lib/watchTools.ts'
import { freeSpotId } from './path/data.ts'
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

/**
 * Playtest jump seats. Open ground the placement ghost calls Good,
 * spread from the gate toward the porch the way a kid would plant.
 * Named lots stay the gold rings. A jump does not use those weak seats.
 */
export const JUMP_GOOD_SEATS = [
  { x: 490, y: 1000 },
  { x: 250, y: 660 },
  { x: 420, y: 430 },
  { x: 450, y: 210 },
] as const

const JUMP_PADS = JUMP_GOOD_SEATS.map((seat) => freeSpotId(seat))
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
export function easyJumpLoad(roundIndex: number, tune: NightTune = A2_TUNE): EasyJumpLoad {
  const index = Math.max(0, Math.floor(roundIndex) || 0)
  const lamps: LampPaths[] = [{ far: 0, strong: 0 }]
  let sparks = 0
  let step = 0
  for (let at = 0; at < index; at += 1) {
    const boss = easyBossRound(at) ? 1 + BOSS_CLEAR_SPARKS : 0
    sparks += roundSparkPay(roundForTune(EASY_ROUNDS[at], at, tune)) + boss + easyClearSparkBonus(at)
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
 * Playtest `nwLamps`. Keeps the first lamps the jump would plant.
 * A missing cap returns the load unchanged, sparks included.
 * Round tables do not call this.
 */
export function capJumpPlants(load: EasyJumpLoad, cap: number | null): EasyJumpLoad {
  if (cap == null || cap >= load.lamps.length) return load
  const plants: Record<string, string> = {}
  const kept = Object.entries(load.plants).slice(0, Math.max(0, cap))
  const tools = new Set<string>()
  for (const [pad, tool] of kept) {
    plants[pad] = tool
    tools.add(tool)
  }
  const paths: Record<string, LampPaths> = {}
  for (const [tool, path] of Object.entries(load.paths)) {
    paths[tool] = tools.has(tool) ? { far: path.far, strong: path.strong } : { far: 0, strong: 0 }
  }
  return {
    sparks: load.sparks,
    plants,
    paths,
    lamps: load.lamps.slice(0, Math.max(0, cap)).map((lamp) => ({ far: lamp.far, strong: lamp.strong })),
  }
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

/**
 * Rounds 20 and 25. Slower than `BOSS_PACE` so a tapping player still has
 * the crown on the road after twenty-five seconds. Earlier bosses stay on
 * `BOSS_PACE`.
 */
export const SHOWDOWN_PACE = 0.26

export function easyShowdownBoss(index: number): boolean {
  const round = Math.floor(index) + 1
  return round === 20 || round === 25
}

export function easyBossPace(index: number): number {
  return easyShowdownBoss(index) ? SHOWDOWN_PACE : BOSS_PACE
}

/**
 * Easy crowns only (1.4.494). The last stretch of the road is slower.
 * A glow-window tapper needs that time. Earlier bosses, and Hard, stay put.
 * `0.65` is the last thirty-five percent of the plate path.
 */
export const EASY_CROWN_LAST_T = 0.65
export const EASY_CROWN_LAST_MUL = 0.4

export function easyCrownWalkMul(index: number, t: number, easy = true): number {
  if (!easy || !easyShowdownBoss(index)) return 1
  if (!(t >= EASY_CROWN_LAST_T)) return 1
  return EASY_CROWN_LAST_MUL
}

/** Easy rounds 5, 10, 15, 20, and 25. Hard does not read this. */
export function easyBossRound(index: number): boolean {
  const round = Math.floor(index) + 1
  return round > 0 && round % 5 === 0 && round <= 25
}

/**
 * Spawn id that wears the crown. One past the round's walkers.
 * `-1` when the round has no boss. Round 25's id is the table count.
 */
export function easyBossSpawnId(roundCount: number, roundIndex: number): number {
  if (!easyBossRound(roundIndex)) return -1
  return Math.max(0, Math.floor(roundCount) || 0)
}

/**
 * Landed-tap bar for an active player on a busy round.
 * The check-city model is one isolated round: lamps from `easyJumpLoad`,
 * three hearts, a tap every 0.28s, road mode. Breathers and rounds before 11
 * are not on that bar.
 */
export function easyBusyTapFloor(index: number): number {
  const round = Math.floor(index) + 1
  if (round < 11 || round > EASY_ROUNDS.length) return 0
  if (round === 12 || round === 16 || round === 20 || round === 24) return 0
  return 60
}

/**
 * Boss health. Round 5 stays the teaching bar (12). Rounds 6–9 stay 44.
 * Round 10 is 14 (1.4.493), then 120 through round 15, and 180 through round 19.
 * Rounds 20 and 25 are shorter bars on purpose. Lamp shots do not cut them.
 * A glowing tap does, so the fight is the taps and not a taller sponge.
 * Round 25 is 72 (1.4.491). Round 20 stays 64. Rounds 21–24 are not boss
 * rounds; the number stays 240 so a stray read does not invent a new bar.
 * Rounds 6–9 stay 44 so the round 6 snapshot does not move.
 */
/**
 * Easy round 10 lead boss (1.4.493).
 * The live Strong 1 layout deals 10 with lamps. Four soak taps make 14,
 * which fells this bar before the boss leaves. With no taps, 10 is not enough
 * and the boss leaks. Hard does not read this.
 */
export const EASY_R10_BOSS_HP = 14

export function easyBossHp(index: number): number {
  const round = Math.floor(index) + 1
  if (round <= 5) return 12
  if (round < 10) return 44
  if (round === 10) return EASY_R10_BOSS_HP
  if (round <= 15) return 120
  if (round < 20) return 180
  if (round === 20) return 64
  if (round < 25) return 240
  return 72
}

/**
 * Tough health on round 7, and on a maze round 6.
 * Round 8 and later use `EASY_TOUGH_OPEN` while taps still land.
 */
export const EASY_TOUGH_WINDOW = 20

/**
 * From round 8 the thick bar stays open to taps, so it has to be taller
 * than the four-chip shrug bar. A level I lamp plus taps still leaks it.
 * Round 7 keeps the shorter bar so that round does not become the wall.
 */
export const EASY_TOUGH_OPEN = 56

/**
 * Extra health from round 16 on, after a spender has already capped the lamps.
 * The build does not get stronger. The walkers do, so hearts slip and a
 * carried night ends in the late teens. A fresh round 25 with three hearts
 * can still win.
 */
export const EASY_LATE_BULK = 140

/**
 * A2 keeps armor at round 7, one tough on round 6, and +140 from round 16.
 * Maze maps pass `maze-v1`: armor at round 6, two toughs on round 6, +100 from round 11.
 */
export interface NightTune {
  armorFrom: number
  bulkFrom: number
  bulk: number
  r6tough: number
}

export const A2_TUNE: NightTune = {
  armorFrom: 7,
  bulkFrom: 16,
  bulk: EASY_LATE_BULK,
  r6tough: 1,
}

export const MAZE_V1_TUNE: NightTune = {
  armorFrom: 6,
  bulkFrom: 11,
  bulk: 100,
  r6tough: 2,
}

export function nightTune(rules?: string): NightTune {
  return rules === 'maze-v1' ? MAZE_V1_TUNE : A2_TUNE
}

/** Round 6's tough count, without editing the shared Easy table. */
export function roundForTune<T extends { tough: number }>(
  round: T,
  roundIndex: number,
  tune: NightTune = A2_TUNE,
): T {
  if (tune.r6tough === 1 || Math.floor(roundIndex) !== 5 || round.tough === tune.r6tough) return round
  return { ...round, tough: tune.r6tough }
}

/**
 * Far Hills walker health. A2 passes `1` and the table is unchanged.
 * Boss health is not scaled here.
 */
export function scaledWalkerHp(hp: number, hpMul: number): number {
  if (!(hpMul > 0) || hpMul === 1) return hp
  return Math.max(1, Math.round(hp * hpMul))
}

/** Live Easy walker health. Rounds 1–6 match `walkerHp`. Hard does not read this. */
export function easyWalkerHp(
  kindHp: number,
  roundBonus: number,
  gait: WalkerGait | undefined,
  roundIndex: number,
  tune: NightTune = A2_TUNE,
): number {
  const round = Math.floor(roundIndex) + 1
  const windowEnd = Math.min(15, tune.bulkFrom - 1)
  if (gait === 'tough' && round >= tune.armorFrom && round <= windowEnd) {
    return round >= 8 ? EASY_TOUGH_OPEN : EASY_TOUGH_WINDOW
  }
  const hp = walkerHp(kindHp, roundBonus, gait)
  if (round >= tune.bulkFrom && gait !== 'fast') return hp + tune.bulk
  return hp
}

/** Extra sparks when an Easy boss round clears. A loss pays nothing. */
export const BOSS_CLEAR_SPARKS = 2

export function easyBossClearSparks(index: number): number {
  return easyBossRound(index) ? BOSS_CLEAR_SPARKS : 0
}

/** One extra spark for clearing rounds 7, 8, and 9. Other rounds pay 0. */
export function easyClearSparkBonus(index: number): number {
  const round = Math.floor(index) + 1
  if (round >= 7 && round <= 9) return 1
  return 0
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
