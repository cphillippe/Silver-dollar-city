import {
  applyBossExitLeak,
  applyEasyPaceLeaks,
  easyClearHeart,
  easyCrowdCap,
  easyGlowTapDamage,
  easyLeadBossShrug,
  easyLiveSpawnT,
  easyRoundHeartCap,
  easyTapArmored,
  EASY_LATE_LAMP_NICK,
} from '../lib/defend.ts'
import { INCENSE_COST, applyIncenseTap, incenseBonusFor } from './incense.ts'
import { BELL_COST, bellPaceFor, walkerSlowPace } from './bell.ts'
import { CROSS_COST, applyCrossWait, crossPaceFor } from './cross.ts'
import { nightSeedPlan, nightSeedShotWait, nightSeedSpawnScale } from './seed.ts'
import { boardFill } from './map/phoneFill.ts'
import { EASY_LAMP_COST } from '../lib/watchTools.ts'
import { DEFEND_ANCHOR, freeSpotId, isFreeSpot, lampAnchor, pathClearance, pathPick, pathPoint } from './path/data.ts'
import { easyRound as liveRound, type EasyRound } from './rounds.ts'
import {
  easyShotReach,
  FAR1_ROAD_REACH,
  lampStrike,
  TREE_STEP_COST,
  TREE_BONUS_COST,
  TREE_BONUS_MAX,
  TREE_CROSS_MAX,
  TREE_LATE_COST,
  TREE_STEP_MAX,
  type LampPaths,
} from './upgradeTree.ts'
import { FREE_LAMP_RANGE_BONUS, lampReach } from './towers/index.ts'
import {
  BOSS_PACE,
  easyLeadBossRoadPace,
  easyShowdownBoss,
  easyBossClearSparks,
  easyClearSparkBonus,
  easyBossHp,
  easyBossRound,
  easyJumpLoad,
  easyLatePush,
  easyWalkerHp,
  FAST_PACE,
  gaitForSlot,
  nightTune,
  roundForTune,
  scaledWalkerHp,
  walkerHp,
  walkerPace,
  type NightTune,
  type WalkerGait,
} from './walkers.ts'
import {
  faceInFog,
  featureSpeed,
  hillRangeBonus,
  miniHp,
  minisOnKill,
  splitFeature,
  type NightFeature,
} from './maps/features.ts'
import { waveRound, waveWalkerHp, type NightWave } from './maps/wave.ts'
import type { NightPoint } from './types.ts'

/**
 * 1.4.436 live play, center-aimed at 1×, fitted this ring.
 * The old sim parked four lamps on bends that each cover about a fifth of the
 * road, so a Strong 3 lamp melted bosses. On the plate the journal and the
 * bench sit past the overlap rule and never touch the road. The hollow clip
 * shrinks off the road at this scale. Only the porch bridge still reaches.
 * A Strong 3 shot on that bridge lands about 15 on a round-25 boss. Live
 * measured the same boss at 316→301 of 320 (~5%), and a natural spender lost
 * round 8 at about 64 taps. `0.55` is the scale that reproduces both.
 */
export const LIVE_RING_SCALE = 0.55

/** Active center aim. A try about every 0.28s while someone is walking. */
export const LIVE_TAP_EVERY = 0.28

/**
 * A person tapping the glowing face, a little slower than the active sim.
 * On the road before the post-round-15 step, this pace dies in the late teens
 * with every lamp full and sparks still in the bank.
 */
export const HUMAN_TAP_EVERY = 0.3

const LAMP_ROAD_OVERLAP = 24
const PLATE_SEATS = ['porch', 'hollow', 'journal', 'bench'] as const

function plateReach(plotId: string, base: number, roadGap: number): number {
  if (plotId === 'porch') return base + roadGap
  if (!(base > 0)) return 0
  if (base < roadGap + LAMP_ROAD_OVERLAP) return Math.min(base, Math.max(0, roadGap - 1))
  return base
}

const PLATE = PLATE_SEATS.map((id) => {
  const at = DEFEND_ANCHOR[id]
  return { id, x: at.x, y: at.y, gap: pathClearance(at) }
})

/** 1.4.436 round rows. Late retunes must not move the frozen scorer. */
const ROWS_436: readonly EasyRound[] = [
  { count: 4, speed: 1, hp: 0, spawn: 1, fast: 0, tough: 0 },
  { count: 4, speed: 1.35, hp: 0, spawn: 0.95, fast: 0, tough: 0 },
  { count: 5, speed: 1.8, hp: 1, spawn: 0.9, fast: 0, tough: 0 },
  { count: 5, speed: 2.6, hp: 2, spawn: 0.85, fast: 1, tough: 0 },
  { count: 7, speed: 6.4, hp: 6, spawn: 0.68, fast: 2, tough: 3 },
  { count: 7, speed: 6.4, hp: 8, spawn: 0.72, fast: 2, tough: 1 },
  { count: 9, speed: 6.2, hp: 24, spawn: 0.74, fast: 2, tough: 4 },
  { count: 6, speed: 5.8, hp: 16, spawn: 0.82, fast: 1, tough: 2 },
  { count: 9, speed: 6.3, hp: 28, spawn: 0.7, fast: 2, tough: 4 },
  { count: 9, speed: 6.4, hp: 32, spawn: 0.68, fast: 2, tough: 4 },
  { count: 9, speed: 6.5, hp: 36, spawn: 0.68, fast: 2, tough: 4 },
  { count: 5, speed: 6.0, hp: 18, spawn: 0.8, fast: 1, tough: 1 },
  { count: 7, speed: 6.5, hp: 28, spawn: 0.68, fast: 2, tough: 3 },
  { count: 7, speed: 6.6, hp: 34, spawn: 0.68, fast: 2, tough: 3 },
  { count: 8, speed: 6.6, hp: 42, spawn: 0.66, fast: 2, tough: 3 },
  { count: 6, speed: 6.2, hp: 36, spawn: 0.78, fast: 1, tough: 2 },
  { count: 8, speed: 6.6, hp: 42, spawn: 0.66, fast: 2, tough: 3 },
  { count: 8, speed: 6.7, hp: 44, spawn: 0.66, fast: 2, tough: 3 },
  { count: 9, speed: 6.7, hp: 44, spawn: 0.66, fast: 2, tough: 4 },
  { count: 7, speed: 6.3, hp: 40, spawn: 0.76, fast: 1, tough: 2 },
  { count: 8, speed: 6.7, hp: 44, spawn: 0.66, fast: 2, tough: 3 },
  { count: 9, speed: 6.8, hp: 46, spawn: 0.66, fast: 2, tough: 4 },
  { count: 9, speed: 6.8, hp: 46, spawn: 0.66, fast: 2, tough: 4 },
  { count: 8, speed: 6.4, hp: 42, spawn: 0.74, fast: 1, tough: 2 },
  { count: 9, speed: 6.8, hp: 46, spawn: 0.66, fast: 2, tough: 4 },
]

function bossHp436(index: number): number {
  const round = Math.floor(index) + 1
  if (round <= 5) return 12
  if (round <= 10) return 44
  if (round <= 15) return 200
  if (round <= 20) return 260
  return 320
}

function latePush436(index: number): number {
  const round = Math.floor(index) + 1
  if (round < 13) return 0
  if (round <= 14) return 12
  if (round === 15) return 18
  if (round === 16) return 10
  if (round <= 19) return 18
  if (round === 20) return 12
  return 20
}

export const NAMED_LAMPS: readonly LampPaths[] = [
  { far: 1, strong: 3 },
  { far: 0, strong: 2 },
  { far: 1, strong: 1 },
  { far: 0, strong: 0 },
]

export const CEILING_LAMPS: readonly LampPaths[] = [
  { far: 1, strong: 3 },
  { far: 1, strong: 3 },
  { far: 1, strong: 3 },
  { far: 1, strong: 3 },
]

export const BARE_LAMPS: readonly LampPaths[] = [
  { far: 0, strong: 0 },
  { far: 0, strong: 0 },
  { far: 0, strong: 0 },
  { far: 0, strong: 0 },
]

/** One extra shot source on the plate. The night spender does not buy these. */
export interface PaceShot {
  x: number
  y: number
  damage: number
  range: number
  /**
   * Range through round 6. A row's extra reach waits until the early bosses
   * are past, so a zero-tap row still loses round 5.
   * Omitted, `range` is used the whole night.
   */
  earlyRange?: number
  cooldownMs: number
  /**
   * Wait scale on a boss round in rounds 1–6.
   * Damage stays `damage` for walkers and for that boss.
   * Omitted, the shot keeps `cooldownMs`.
   */
  earlyPace?: number
  /**
   * Extra fraction on a walker. Bosses stay at `damage`.
   * A row of two is about a tenth more. A row of three is about a fifth more.
   */
  walkerBonus?: number
}

export interface PaceLive {
  result: 'clear' | 'lost' | 'timeout'
  taps: number
  /** Lamp damage that landed on the boss. */
  bossLamp: number
  /** Glowing taps that landed on the boss. */
  bossTap: number
  bossMax: number
  hearts: number
  boss: 'kill' | 'leak' | 'up' | 'none'
  /** Sparks this round paid, already rounded down. Boss-clear sparks are not included. */
  sparks: number
  /** Hit points lamps removed this round, walkers and the boss. */
  dealt: number
  /** Little berries released when a kill popped. */
  minis: number
  /** Seconds the boss was on the road. 0 when the round has no boss. */
  bossSec: number
  /** Set only for a pad-layout replay. Damage each planted lamp dealt. */
  byLamp?: PaceLampHurt[]
  /** Seconds from the round open until the boss spawned. Pad replays only. */
  bossAt?: number
}

/** One planted lamp in a pad-layout replay. */
export interface PaceLampHurt {
  id: string
  boss: number
  trash: number
  range: number
  gap: number
  /** Trash damage dealt while the boss was also inside this ring. */
  passed: number
}

/**
 * Named lots, or free seats, in place of the lead good seats.
 * Omitted, `paceEasyLive` stays on those seats. Bell and incense are
 * free plants. They do not shoot. A missing point leaves that plant out.
 */
export interface PacePadLayout {
  pads: readonly { id: string; far: number; strong: number }[]
  bellAt?: { x: number; y: number }
  incenseAt?: { x: number; y: number }
}

interface LiveRules {
  round: (index: number) => EasyRound
  bossHp: (index: number) => number
  latePush: (index: number) => number
  walker: (
    kind: number,
    bonus: number,
    gait: WalkerGait | undefined,
    roundIndex: number,
    tune?: NightTune,
  ) => number
}

/** Another map's roads and seats. Omitted fields keep the A2 night. */
export interface PaceMap {
  path: readonly NightPoint[]
  roads?: readonly { points: readonly NightPoint[]; share: number }[]
  seats: readonly { x: number; y: number }[]
  hpMul: number
  rules?: string
  /** Maze-v2 wave. Omitted, the round table and the cap of 3 stay as they are. */
  wave?: NightWave | null
  features?: readonly NightFeature[]
}

/** 1.4.437 boss bars, frozen so a later curve does not rewrite that porch fit. */
function bossHp437(index: number): number {
  const round = Math.floor(index) + 1
  if (round <= 5) return 12
  if (round < 10) return 44
  if (round === 10) return 40
  if (round <= 15) return 16
  if (round <= 20) return 17
  return 18
}

function walker437(
  kind: number,
  bonus: number,
  gait: WalkerGait | undefined,
  roundIndex: number,
): number {
  const round = Math.floor(roundIndex) + 1
  if (gait !== 'tough' || round < 7 || round > 15) return walkerHp(kind, bonus, gait)
  return 12
}

function rules437(): LiveRules {
  return {
    round: liveRound,
    bossHp: bossHp437,
    latePush: easyLatePush,
    walker: walker437,
  }
}

function currentRules(): LiveRules {
  return {
    round: liveRound,
    bossHp: easyBossHp,
    latePush: easyLatePush,
    walker: easyWalkerHp,
  }
}

/**
 * Good seats from the 1.4.437 phone nights.
 * The ghost said reaches=yes, and these four sit on that band, spread along the road.
 * Level I reach is 114. Each gap is inside that ring.
 */
export const LEAD_GOOD_SEATS = [
  { x: 490, y: 1000 },
  { x: 250, y: 660 },
  { x: 420, y: 430 },
  { x: 450, y: 210 },
] as const

/**
 * One cross beside the porch-end lamp. Rank 0, so that lamp waits ten percent less.
 * The other good seats sit outside this ring.
 */
export const HUMAN_CROSS_AT = { x: 514, y: 1000 } as const

export interface SeatReach {
  x: number
  y: number
  gap: number
  level: number
  far1: number
}

/** Gap and combat reach for the lead seats, level I and Far step 1. */
export function leadSeatTable(): SeatReach[] {
  return LEAD_GOOD_SEATS.map((seat) => {
    const gap = pathClearance(seat)
    const id = `at:${seat.x}:${seat.y}`
    const level = lampReach(id, 96 + FREE_LAMP_RANGE_BONUS, gap)
    const far1 = lampReach(id, 96 + FREE_LAMP_RANGE_BONUS + FAR1_ROAD_REACH, gap)
    return {
      x: seat.x,
      y: seat.y,
      gap: Math.round(gap),
      level: Math.round(level),
      far1: Math.round(far1),
    }
  })
}

function rules436(): LiveRules {
  return {
    round: (index) => ROWS_436[Math.min(ROWS_436.length - 1, Math.max(0, Math.floor(index) || 0))],
    bossHp: bossHp436,
    latePush: latePush436,
    walker: (kind, bonus, gait) => walkerHp(kind, bonus, gait),
  }
}

/**
 * One Easy round on the plate seats, with the live spawn and the fitted ring.
 * `frozen` replays 1.4.436 health. Otherwise the current tables are used.
 */
export function paceEasyLive(
  roundIndex: number,
  paths: readonly Pick<LampPaths, 'far' | 'strong'>[],
  heartsIn = 3,
  frozen = false,
  tapEvery = LIVE_TAP_EVERY,
  /**
   * `plate` is the 1.4.437 porch fit. `road437` is the good-seat night on those
   * frozen bars. `road` is the same seats on the current bars, with Far step 1 reach.
   */
  mode: 'plate' | 'road437' | 'road' = 'plate',
  /**
   * Another map's road and seats. Omitted, the A2 good seats and `pathPoint`
   * stay on the cottages.
   */
  map?: PaceMap,
  /** Extra shots on top of the pillar seats. Omitted, the round is unchanged. */
  shots: readonly PaceShot[] = [],
  /**
   * Playtest seed. Omitted, the round keeps the old first-shot and spawn gap.
   * The same number always plays the same wave.
   */
  seed?: number,
  /**
   * Extra damage on a glowing tap that already landed.
   * 0 leaves the round unchanged. A soaked or shrugging hit stays at 0 damage,
   * so this cannot add to a shrug.
   */
  tapBonus = 0,
  /**
   * A planted cross. Omitted, every lamp keeps its wait.
   * A lamp inside the ring waits less. The cross does not shoot.
   */
  crossAt?: { x: number; y: number },
  /**
   * Named lots instead of the lead good seats. Omitted, the round is unchanged.
   * Reach uses the live lot rule: city seats do not get the free-ground bonus.
   * On Easy, a city seat whose reach already meets the road keeps that reach.
   */
  padLayout?: PacePadLayout,
): PaceLive {
  const road = mode === 'road' || mode === 'road437' || Boolean(map)
  const roadPath = map?.path
  const hpMul = map?.hpMul ?? 1
  const tune = !frozen && map?.rules === 'maze-v1' ? nightTune('maze-v1') : nightTune()
  const roads =
    map?.roads && map.roads.length > 0
      ? map.roads
      : map?.path
        ? [{ points: map.path, share: 1 }]
        : null
  const seatList = map?.seats ?? LEAD_GOOD_SEATS
  const rules = frozen ? rules436() : mode === 'road' ? currentRules() : rules437()
  const table = rules.round(roundIndex)
  const wave = map?.wave ?? null
  const features = map?.features ?? []
  const tuned = roundForTune(table, roundIndex, tune)
  const round = wave ? waveRound(tuned, roundIndex, wave) : tuned
  const bossRound = easyBossRound(roundIndex)
  const total = round.count + (bossRound ? 1 : 0)
  const bonus = table.hp + rules.latePush(roundIndex)
  const lamps = padLayout
    ? padLayout.pads.map((pad) => {
        const rank = { far: pad.far, strong: pad.strong }
        const strike = lampStrike(rank)
        const at = lampAnchor(pad.id)
        const gap = pathClearance(at)
        const free = isFreeSpot(pad.id) ? FREE_LAMP_RANGE_BONUS : 0
        const range = lampReach(pad.id, 96 + free + easyShotReach(rank), gap, true)
        return {
          id: pad.id,
          x: at.x,
          y: at.y,
          gap,
          strike,
          range,
          cool: 0,
          earlyPace: undefined as number | undefined,
          walkerBonus: undefined as number | undefined,
        }
      })
    : road
    ? seatList.map((seat, index) => {
        const rank = paths[index] ?? { far: 0, strong: 0 }
        const strike = lampStrike(rank)
        const bonusReach = mode === 'road' || map ? easyShotReach(rank) : strike.rangeBonus
        const id = `at:${Math.round(seat.x)}:${Math.round(seat.y)}`
        const gap = roads
          ? Math.min(...roads.map((lane) => pathClearance(seat, lane.points)))
          : pathClearance(seat, roadPath)
        const hill = features.length ? hillRangeBonus(seat, features) : 0
        const range = lampReach(id, 96 + FREE_LAMP_RANGE_BONUS + bonusReach + hill, gap)
        return {
          id,
          x: seat.x,
          y: seat.y,
          gap,
          strike,
          range,
          cool: 0,
          earlyPace: undefined as number | undefined,
          walkerBonus: undefined as number | undefined,
        }
      })
    : PLATE.map((seat, index) => {
        const rank = paths[index] ?? { far: 0, strong: 0 }
        const strike = lampStrike(rank)
        const range = plateReach(seat.id, 96 + strike.rangeBonus, seat.gap) * LIVE_RING_SCALE
        return {
          ...seat,
          strike,
          range,
          cool: 0,
          earlyPace: undefined as number | undefined,
          walkerBonus: undefined as number | undefined,
        }
      })
  const crossPace = new Map<string, number>()
  if (crossAt) {
    const planted = { [`at:${Math.round(crossAt.x)}:${Math.round(crossAt.y)}`]: 'cross' }
    for (const lamp of lamps) crossPace.set(lamp.id, crossPaceFor(planted, undefined, lamp))
  }
  for (const shot of shots) {
    lamps.push({
      id: 'shot',
      x: shot.x,
      y: shot.y,
      gap: 0,
      strike: {
        damage: shot.damage,
        rangeBonus: 0,
        cooldownMs: shot.cooldownMs,
        splash: 0,
        splashFrac: 0,
        outer: 0,
        outerFrac: 0,
      },
      range: roundIndex < 6 && shot.earlyRange != null ? shot.earlyRange : shot.range,
      cool: 0,
      earlyPace: shot.earlyPace,
      walkerBonus: shot.walkerBonus,
    })
  }
  const raiders: {
    t: number
    hp: number
    dead: boolean
    pace: number
    gait?: string
    boss: boolean
    chip: number
    road?: readonly NightPoint[]
    maxHp: number
    spark: number
    mini: boolean
  }[] = []
  let spawned = 0
  let hearts = Math.max(0, heartsIn)
  let spawnAt = 0
  let spawnNow = false
  let tapAt = 0
  let time = 0
  let taps = 0
  let bossLamp = 0
  let bossTap = 0
  let bossMax = 0
  let dealt = 0
  let minis = 0
  let graceUntil = 0
  let lostRound = 0
  let bossSeen = -1
  let bossGone = -1
  const lampHurt = new Map<string, PaceLampHurt>()
  if (padLayout) {
    for (const lamp of lamps) {
      lampHurt.set(lamp.id, { id: lamp.id, boss: 0, trash: 0, range: lamp.range, gap: lamp.gap, passed: 0 })
    }
  }
  const bellPlants = padLayout?.bellAt ? { [freeSpotId(padLayout.bellAt)]: 'bell' } : null
  const incensePlants = padLayout?.incenseAt ? { [freeSpotId(padLayout.incenseAt)]: 'incense' } : null
  const bossBox: { fate: PaceLive['boss'] } = { fate: bossRound ? 'up' : 'none' }
  let sparkFloat = 0
  const dt = 1 / 60
  const plan = seed == null ? null : nightSeedPlan(seed)
  if (plan) {
    for (const lamp of lamps) {
      const pace = lamp.earlyPace && easyBossRound(roundIndex) && roundIndex < 6 ? lamp.earlyPace : 1
      lamp.cool = nightSeedShotWait((lamp.strike.cooldownMs / 1000) * pace, plan.shotFrac)
    }
  }
  const spawnEvery = 3.8 * table.spawn * (wave?.spawnMul ?? 1) * (plan ? nightSeedSpawnScale(plan.spawnFrac) : 1)
  // Maze waves keep their own cap. Frozen and plate nights stay at three.
  // The live road uses the same late caps as the board: 6 from round 7, 8 from round 11.
  // Maze waves keep their own cap. Frozen and plate nights stay at three.
  // The live road uses the same late caps as the board: 6 from round 7, 8 from round 11.
  // Maze waves keep their own cap. A map study with no wave, and the frozen
  // plate nights, stay at three. The live A2 road uses the board's caps:
  // 6 from round 7, 8 from round 11.
  const liveCap =
    wave?.liveCap ?? (!map && mode === 'road' && !frozen ? easyCrowdCap(roundIndex) : 3)
  const pack = wave?.pack ?? 1
  const sparkMul = wave?.sparkMul ?? 1
  const live = () => raiders.filter((raider) => !raider.dead)
  const finish = (result: PaceLive['result']): PaceLive => ({
    result,
    taps,
    bossLamp,
    bossTap,
    bossMax,
    hearts,
    boss: bossBox.fate,
    sparks: Math.floor(sparkFloat),
    dealt,
    minis,
    bossSec: bossSeen >= 0 && bossGone >= bossSeen ? bossGone - bossSeen : 0,
    ...(padLayout
      ? {
          byLamp: [...lampHurt.values()],
          bossAt: bossSeen,
        }
      : {}),
  })
  if (hearts <= 0) return finish('lost')
  while (time < 180) {
    spawnAt += dt
    tapAt += dt
    let leaked = 0
    let bossThrough = false
    for (const raider of raiders) {
      if (raider.dead) continue
      const at = pathPoint(raider.t, raider.road)
      const mul = features.length ? featureSpeed(at, features) : 1
      const bell =
        bellPlants && roundIndex >= 6 ? walkerSlowPace(1, bellPaceFor(bellPlants, undefined, at)) : 1
      raider.t += 0.01 * round.speed * raider.pace * mul * bell * dt
      if (raider.t >= 1) {
        raider.dead = true
        if (raider.boss) {
          bossBox.fate = 'leak'
          bossThrough = true
          if (bossGone < 0) bossGone = time
        } else leaked += 1
      }
    }
    if (bossThrough) {
      hearts = applyBossExitLeak(hearts).hearts
      return finish('lost')
    }
    if (leaked > 0) {
      const paced = applyEasyPaceLeaks(
        hearts,
        leaked,
        time * 1000,
        graceUntil,
        lostRound,
        false,
        easyRoundHeartCap(roundIndex),
      )
      hearts = paced.hearts
      graceUntil = paced.graceUntil
      lostRound = paced.lostThisRound
      if (paced.failed || hearts <= 0) return finish('lost')
    }
    let packLeft = 0
    if (spawned < total && live().length < liveCap && (spawnNow || spawnAt >= spawnEvery || spawned === 0)) {
      spawnNow = false
      spawnAt = 0
      packLeft = pack
    }
    while (packLeft > 0 && spawned < total && live().length < liveCap) {
      packLeft -= 1
      const boss = bossRound && spawned === round.count
      const gait = boss ? undefined : gaitForSlot(round, spawned)
      const hp = boss
        ? rules.bossHp(roundIndex)
        : wave
          ? waveWalkerHp(2, bonus, gait, roundIndex, tune, hpMul, wave)
          : scaledWalkerHp(rules.walker(2, bonus, gait, roundIndex, tune), hpMul)
      if (boss) bossMax = hp
      const lane = roads ? roads[pathPick(spawned, roads.map((item) => item.share))] : undefined
      if (boss) bossSeen = time
      raiders.push({
        t: easyLiveSpawnT(round.speed * (boss ? BOSS_PACE : walkerPace(gait))),
        hp,
        dead: false,
        pace: boss ? (mode === 'road' && !frozen && !map ? easyLeadBossRoadPace(roundIndex) : BOSS_PACE) : walkerPace(gait),
        gait,
        boss,
        chip: 0,
        road: lane?.points ?? roadPath,
        maxHp: hp,
        spark: boss || gait !== 'tough' ? 1 : 2,
        mini: false,
      })
      spawned += 1
    }
    const kill = (raider: (typeof raiders)[number], byLamp: boolean) => {
      raider.dead = true
      sparkFloat += raider.spark * sparkMul
      if (byLamp) spawnNow = true
      if (raider.boss) {
        bossBox.fate = 'kill'
        if (bossGone < 0) bossGone = time
      }
      const split = splitFeature(features)
      const born = minisOnKill(split, roundIndex, raider.gait, raider.boss, raider.mini)
      if (!split || born < 1) return
      minis += born
      for (let q = 0; q < born; q += 1) {
        const mini = miniHp(raider.maxHp, split)
        raiders.push({
          t: Math.max(0, raider.t - 0.02 * q),
          hp: mini,
          dead: false,
          pace: FAST_PACE * 0.8,
          gait: 'plain',
          boss: false,
          chip: 0,
          road: raider.road,
          maxHp: mini,
          spark: 0,
          mini: true,
        })
      }
    }
    for (const lamp of lamps) {
      lamp.cool -= dt
      if (lamp.cool > 0) continue
      let best: (typeof raiders)[number] | null = null
      let bestD = lamp.range
      const earlyBoss = easyBossRound(roundIndex) && roundIndex < 6
      for (const raider of live()) {
        const point = pathPoint(raider.t, raider.road)
        const distance = Math.hypot(lamp.x - point.x, lamp.y - point.y)
        if (distance <= bestD) {
          best = raider
          bestD = distance
        }
      }
      if (!best) continue
      const held = earlyBoss ? lamp.earlyPace : undefined
      const pace = held ?? 1
      const earlyHold = held != null
      lamp.cool = (lamp.strike.cooldownMs / 1000) * pace
      if (crossAt) lamp.cool = applyCrossWait(lamp.cool, crossPace.get(lamp.id) ?? 1)
      const apply = (raider: (typeof raiders)[number] | null, amount: number, byLamp: boolean) => {
        if (!raider || raider.dead || amount <= 0) return
        const hit = Math.min(raider.hp, amount)
        raider.hp -= hit
        dealt += hit
        if (raider.boss) bossLamp += hit
        const note = lampHurt.get(lamp.id)
        if (note) {
          if (raider.boss) note.boss += hit
          else {
            note.trash += hit
            const crown = raiders.find((other) => other.boss && !other.dead)
            if (crown) {
              const spot = pathPoint(crown.t, crown.road)
              if (Math.hypot(lamp.x - spot.x, lamp.y - spot.y) <= lamp.range) note.passed += hit
            }
          }
        }
        if (raider.hp <= 0) kill(raider, byLamp)
      }
      const rowExtra = (raider: { boss: boolean }) => {
        if (!lamp.walkerBonus) return 0
        if (earlyHold) return 0
        // Rounds 1–6, then every later boss. Splash and the outer nick use this too.
        if (raider.boss && roundIndex < 6) return 0
        if (raider.boss) return 0
        return lamp.walkerBonus
      }
      const lampHit = (raider: { boss: boolean } | null, amount: number) => {
        if (!(mode === 'road' && !frozen && !map) || roundIndex < 19 || roundIndex > 24) return amount
        if (raider && easyShowdownBoss(roundIndex) && raider.boss) return 0
        return Math.min(amount, EASY_LATE_LAMP_NICK)
      }
      apply(best, lampHit(best, lamp.strike.damage * (1 + rowExtra(best))), true)
      if (lamp.strike.splash > 0) {
        let pick: (typeof raiders)[number] | null = null
        let pickD = lamp.range * lamp.strike.splashFrac
        for (const raider of live()) {
          if (raider === best || raider.dead) continue
          const point = pathPoint(raider.t, raider.road)
          const distance = Math.hypot(lamp.x - point.x, lamp.y - point.y)
          if (distance <= pickD) {
            pick = raider
            pickD = distance
          }
        }
        apply(pick, lampHit(pick, lamp.strike.splash * (1 + (pick ? rowExtra(pick) : 0))), true)
      }
      if (lamp.strike.outer > 0) {
        let pick: (typeof raiders)[number] | null = null
        let pickD = lamp.range * (1 + lamp.strike.outerFrac)
        for (const raider of live()) {
          if (raider === best || raider.dead) continue
          const point = pathPoint(raider.t, raider.road)
          const distance = Math.hypot(lamp.x - point.x, lamp.y - point.y)
          if (distance > lamp.range && distance <= pickD) {
            pick = raider
            pickD = distance
          }
        }
        apply(pick, lampHit(pick, lamp.strike.outer * (1 + (pick ? rowExtra(pick) : 0))), true)
      }
    }
    if (tapAt >= tapEvery && live().length > 0) {
      tapAt = 0
      const walking = live().sort((a, b) => b.t - a.t)
      const leadBoss = (raider: { boss: boolean }) =>
        mode === 'road' && !map && !frozen && easyLeadBossShrug(roundIndex, raider.boss, tune.armorFrom)
      const showdownOpen = (raider: { boss: boolean }) =>
        mode === 'road' && !frozen && !map && raider.boss && easyShowdownBoss(roundIndex)
      const openTap = (raider: (typeof walking)[number]) => {
        if (features.length && faceInFog(pathPoint(raider.t, raider.road), features)) return false
        if (showdownOpen(raider)) return true
        const armored =
          easyTapArmored(roundIndex, raider.gait, raider.boss, tune.armorFrom) || leadBoss(raider)
        return !armored || raider.chip < 4
      }
      // Round 5 on the lead road: the crown is a hit even when a faster walker is ahead.
      // Other maps and later bosses stay on the lead tap, so those nights do not move.
      // A soaked boss gives the tap back to the lead.
      const bossCue =
        !map && roundIndex < 6
          ? walking.find((raider) => raider.boss && openTap(raider))
          : undefined
      const cue = bossCue ?? walking.find(openTap)
      if (cue) {
        const dmg = easyGlowTapDamage(
          cue.hp,
          cue.chip,
          showdownOpen(cue)
            ? false
            : easyTapArmored(roundIndex, cue.gait, cue.boss, tune.armorFrom) || leadBoss(cue),
          mode === 'road' && !map && roundIndex === 4 && cue.gait === 'tough' && (tune.armorFrom ?? 7) >= 7,
        )
        const cloud = incensePlants ? incenseBonusFor(incensePlants, undefined, pathPoint(cue.t, cue.road)) : 0
        const bonus = tapBonus + cloud
        const hit = dmg > 0 && bonus > 0 ? applyIncenseTap(dmg, bonus) : dmg
        if (hit > 0) {
          cue.chip += hit
          cue.hp -= hit
          taps += 1
          if (cue.boss) bossTap += hit
          if (cue.hp <= 0) kill(cue, false)
        }
      }
    }
    if (spawned >= total && live().length === 0) {
      if (bossRound && bossBox.fate !== 'kill') return finish('lost')
      return finish(hearts > 0 ? 'clear' : 'lost')
    }
    time += dt
  }
  if (bossSeen >= 0 && bossGone < 0) bossGone = time
  return finish('timeout')
}

/** 1.4.436 health, plate ring. Used to prove the scorer before the retune. */
export function paceEasy436(
  roundIndex: number,
  paths: readonly Pick<LampPaths, 'far' | 'strong'>[],
  heartsIn = 3,
): PaceLive {
  return paceEasyLive(roundIndex, paths, heartsIn, true)
}

export interface Campaign {
  dead: number | null
  rows: { round: number; result: PaceLive['result']; taps: number; hearts: number; boss: PaceLive['boss'] }[]
}

function campaignLamps(
  kind: 'none' | 'natural' | 'ceiling',
  roundIndex: number,
  tune: NightTune = nightTune(),
): readonly LampPaths[] {
  if (kind === 'none') return BARE_LAMPS
  if (kind === 'ceiling') return CEILING_LAMPS
  const owned = easyJumpLoad(roundIndex, tune).lamps
  const lamps = owned.map((lamp) => ({ far: lamp.far, strong: lamp.strong }))
  while (lamps.length < 4) lamps.push({ far: 0, strong: 0 })
  return lamps
}

/** A full night. Hearts carry. A clear gives one heart back, up to three. */
export function paceEasyCampaign(kind: 'none' | 'natural' | 'ceiling', frozen = false): Campaign {
  let hearts = 3
  const rows: Campaign['rows'] = []
  for (let index = 0; index < 25; index += 1) {
    const round = paceEasyLive(index, campaignLamps(kind, index), hearts, frozen)
    rows.push({
      round: index + 1,
      result: round.result,
      taps: round.taps,
      hearts: round.hearts,
      boss: round.boss,
    })
    if (round.result !== 'clear') return { dead: index + 1, rows }
    hearts = easyClearHeart(round.hearts)
  }
  return { dead: null, rows }
}

/**
 * The 1.4.437 good-seat night, then the current bars.
 * `437` freezes the bars from that build. `live` uses the current curve.
 */
export function paceEasyRoad(
  roundIndex: number,
  paths: readonly Pick<LampPaths, 'far' | 'strong'>[],
  heartsIn = 3,
  era: '437' | 'live' = 'live',
  tapEvery = LIVE_TAP_EVERY,
): PaceLive {
  return paceEasyLive(
    roundIndex,
    paths,
    heartsIn,
    false,
    tapEvery,
    era === '437' ? 'road437' : 'road',
  )
}

/**
 * Strong first, lowest lamp first. Far 1 waits until that lamp is at Strong 2,
 * then that Far is bought before Strong 2 on the next lamp.
 * Four lamps are already planted. Sparks only buy path steps. Bright is not one of them.
 */
export function strongFirstBuy(
  ranks: { far: number; strong: number }[],
  sparks: number,
): number {
  let bank = sparks
  let guard = 0
  while (guard < 40) {
    guard += 1
    const opts: { pri: number; rank: number; slot: number; path: 'far' | 'strong'; cost: number }[] = []
    ranks.forEach((rank, slot) => {
      if (rank.strong < 1) {
        opts.push({ pri: 0, rank: 0, slot, path: 'strong', cost: TREE_STEP_COST[0] ?? 3 })
      }
      if (rank.far < 1 && rank.strong >= 2) {
        opts.push({ pri: 1, rank: 0, slot, path: 'far', cost: TREE_STEP_COST[0] ?? 3 })
      }
      if (rank.strong >= 1 && rank.strong < 3) {
        opts.push({
          pri: 2,
          rank: rank.strong,
          slot,
          path: 'strong',
          cost: TREE_STEP_COST[rank.strong] ?? 0,
        })
      }
    })
    opts.sort((a, b) => a.pri - b.pri || a.rank - b.rank || a.slot - b.slot)
    const buy = opts.find((option) => option.cost <= bank)
    if (!buy) return bank
    bank -= buy.cost
    ranks[buy.slot][buy.path] += 1
  }
  return bank
}

/**
 * No-skill spender on a maze map. Four free lamps, Strong first, half sparks when the wave says so.
 * A2 campaigns keep `paceEasyMapCampaign`.
 */
export function paceMazeSpender(
  map: PaceMap,
  rounds = 20,
  tapEvery = LIVE_TAP_EVERY,
): Campaign {
  const ranks = Array.from({ length: Math.max(1, map.seats.length) }, () => ({ far: 0, strong: 0 }))
  let hearts = 3
  let bank = 0
  const rows: Campaign['rows'] = []
  for (let index = 0; index < rounds; index += 1) {
    const round = paceEasyLive(index, ranks, hearts, false, tapEvery, 'road', map)
    rows.push({
      round: index + 1,
      result: round.result,
      taps: round.taps,
      hearts: round.hearts,
      boss: round.boss,
    })
    if (round.result !== 'clear') return { dead: index + 1, rows }
    hearts = easyClearHeart(round.hearts)
    bank += round.sparks + easyBossClearSparks(index) + easyClearSparkBonus(index)
    bank = strongFirstBuy(ranks, bank)
  }
  return { dead: null, rows }
}

/** Same 25-round curve on another map. Walker health uses that map's multiplier. */
export function paceEasyMapCampaign(
  kind: 'none' | 'natural' | 'ceiling',
  map: PaceMap,
  rounds = 25,
  tapEvery = LIVE_TAP_EVERY,
): Campaign {
  let hearts = 3
  const rows: Campaign['rows'] = []
  for (let index = 0; index < rounds; index += 1) {
    const round = paceEasyLive(
      index,
      campaignLamps(kind, index, nightTune(map.rules)),
      hearts,
      false,
      tapEvery,
      'road',
      map,
    )
    rows.push({
      round: index + 1,
      result: round.result,
      taps: round.taps,
      hearts: round.hearts,
      boss: round.boss,
    })
    if (round.result !== 'clear') return { dead: index + 1, rows }
    hearts = easyClearHeart(round.hearts)
  }
  return { dead: null, rows }
}

export function paceEasyRoadCampaign(
  kind: 'none' | 'natural' | 'ceiling',
  era: '437' | 'live' = 'live',
): Campaign {
  let hearts = 3
  const rows: Campaign['rows'] = []
  const mode = era === '437' ? 'road437' : 'road'
  for (let index = 0; index < 25; index += 1) {
    const round = paceEasyLive(index, campaignLamps(kind, index), hearts, false, LIVE_TAP_EVERY, mode)
    rows.push({
      round: index + 1,
      result: round.result,
      taps: round.taps,
      hearts: round.hearts,
      boss: round.boss,
    })
    if (round.result !== 'clear') return { dead: index + 1, rows }
    hearts = easyClearHeart(round.hearts)
  }
  return { dead: null, rows }
}

/**
 * Same pillar plan as the road night, plus extra shots.
 * `tapEvery` above the round length is a zero-tap night.
 */
export function paceExtraNight(
  kind: 'none' | 'natural' | 'ceiling',
  shots: readonly PaceShot[] = [],
  tapEvery = LIVE_TAP_EVERY,
  seed?: number,
): { dead: number | null; dealt: number } {
  let hearts = 3
  let dealt = 0
  for (let index = 0; index < 25; index += 1) {
    const round = paceEasyLive(
      index,
      campaignLamps(kind, index),
      hearts,
      false,
      tapEvery,
      'road',
      undefined,
      shots,
      seed,
    )
    dealt += round.dealt
    if (round.result !== 'clear') return { dead: index + 1, dealt }
    hearts = easyClearHeart(round.hearts)
  }
  return { dead: null, dealt }
}

export interface BossRow {
  round: number
  hp: number
  /** Damage the ceiling build lands on the frozen 1.4.436 bar. */
  frozenDamage: number
  frozenHp: number
  /** Damage the same build lands on the current bar, and whether the boss dies. */
  damage: number
  boss: PaceLive['boss']
}

export interface LockInBuyRow {
  /** 1-based round about to start. */
  round: number
  /** Sparks left after the bonus steps bought before this wave. */
  sparks: number
  /** How many lamps already took the bonus step. */
  bought: number
  lamps: LampPaths[]
}

/**
 * A spender who has Lock In lessons on every pillar.
 * Steps I–III stay the natural plan. The bonus step is bought on Strong
 * as soon as the bank can pay, which is the pile after Far 1 / Strong 3.
 */
export function lockInBuyTable(): LockInBuyRow[] {
  const bought = [false, false, false, false]
  let spent = 0
  const rows: LockInBuyRow[] = []
  for (let index = 0; index < 25; index += 1) {
    const load = easyJumpLoad(index)
    let sparks = load.sparks - spent
    const lamps: LampPaths[] = []
    for (let slot = 0; slot < 4; slot += 1) {
      const lamp = load.lamps[slot] ?? { far: 0, strong: 0 }
      lamps.push({ far: lamp.far, strong: lamp.strong + (bought[slot] ? 1 : 0) })
    }
    for (let slot = 0; slot < 4; slot += 1) {
      const lamp = load.lamps[slot]
      if (!lamp || bought[slot]) continue
      if (lamp.strong < TREE_STEP_MAX || lamp.far > TREE_CROSS_MAX) continue
      if (sparks < TREE_BONUS_COST) break
      sparks -= TREE_BONUS_COST
      spent += TREE_BONUS_COST
      bought[slot] = true
      lamps[slot] = { far: lamp.far, strong: lamp.strong + 1 }
    }
    rows.push({ round: index + 1, sparks, bought: bought.filter(Boolean).length, lamps })
  }
  return rows
}

export interface HumanNight {
  dead: number | null
  /** Sparks still in the bank when the night stopped, including what the last round paid. */
  sparks: number
  /** True when every planted lamp is at the old cap, Strong 4 and Far 1, before a late buy. */
  full: boolean
  lamps: LampPaths[]
  rows: { round: number; result: PaceLive['result']; hearts: number; sparks: number }[]
}

/**
 * Lock-in spender at a human tap.
 * Steps I–IV stay the lock-in table, so rounds 1–15 do not see the new step.
 * After the round 15 clear the bank buys Strong 5, then Far 2, on each lamp.
 * `late` false is the 1.4.483 night, where that step did not exist.
 * `withCross` pays for one cross at round 13 and leaves it planted. The default night does not.
 */
export function paceEasyHumanCampaign(late = true, tapEvery = HUMAN_TAP_EVERY, withCross = false): HumanNight {
  const plan = lockInBuyTable()
  let hearts = 3
  let spent = 0
  let crossBought = false
  const deep = [0, 0, 0, 0]
  const cross = [0, 0, 0, 0]
  const rows: HumanNight['rows'] = []
  let sparks = 0
  let lamps: LampPaths[] = []
  const finish = (dead: number | null, earned: number): HumanNight => {
    const wallet = sparks + earned
    const full = lamps.length >= 4 && lamps.every((lamp) => lamp.strong >= TREE_BONUS_MAX && lamp.far >= 1 && lamp.strong < 5 && lamp.far < 2)
    return { dead, sparks: wallet, full, lamps, rows }
  }
  for (let index = 0; index < 25; index += 1) {
    sparks = plan[index].sparks - spent
    lamps = plan[index].lamps.map((lamp, slot) => ({
      far: lamp.far + cross[slot],
      strong: lamp.strong + deep[slot],
    }))
    if (late && index >= 15) {
      let guard = 0
      while (guard < 16) {
        guard += 1
        const deepSlot = deep.findIndex((n, i) => n < 1 && lamps[i].strong >= TREE_BONUS_MAX)
        if (deepSlot >= 0 && sparks >= TREE_LATE_COST) {
          sparks -= TREE_LATE_COST
          spent += TREE_LATE_COST
          deep[deepSlot] += 1
          lamps[deepSlot] = { ...lamps[deepSlot], strong: lamps[deepSlot].strong + 1 }
          continue
        }
        const crossSlot = cross.findIndex(
          (n, i) => n < 1 && lamps[i].far >= TREE_CROSS_MAX && lamps[i].strong >= TREE_BONUS_MAX,
        )
        if (crossSlot >= 0 && sparks >= TREE_LATE_COST) {
          sparks -= TREE_LATE_COST
          spent += TREE_LATE_COST
          cross[crossSlot] += 1
          lamps[crossSlot] = { ...lamps[crossSlot], far: lamps[crossSlot].far + 1 }
          continue
        }
        break
      }
    }
    let crossAt: { x: number; y: number } | undefined
    if (withCross && index >= 12) {
      if (!crossBought) {
        sparks -= CROSS_COST
        spent += CROSS_COST
        crossBought = true
      }
      crossAt = HUMAN_CROSS_AT
    }
    const round = crossAt
      ? paceEasyLive(index, lamps, hearts, false, tapEvery, 'road', undefined, [], undefined, 0, crossAt)
      : paceEasyLive(index, lamps, hearts, false, tapEvery, 'road')
    rows.push({ round: index + 1, result: round.result, hearts: round.hearts, sparks })
    if (round.result !== 'clear') return finish(index + 1, round.sparks)
    hearts = easyClearHeart(round.hearts)
  }
  return finish(null, 0)
}

/** Phone the round-10 plants were measured on. The board fills this box. */
export const LEAD_PAD_VIEW = { w: 375, h: 667 } as const

/** Bell bought on the round 7 clear. CSS px on that phone. */
export const LEAD_BELL_CSS = { x: 83, y: 138 } as const

/** Incense bought on the round 9 clear. CSS px on that phone. */
export const LEAD_INCENSE_CSS = { x: 18, y: 330 } as const

/** Love, Logic, Reason, Science on the four Easy rings, in rail order. */
export const LEAD_DEFAULT_PADS = [
  { id: 'porch', tool: 'love' },
  { id: 'hollow', tool: 'logic' },
  { id: 'journal', tool: 'reason' },
  { id: 'bench', tool: 'science' },
] as const

/** CSS px on the 375×667 board, turned into plate units. */
export function leadCssPlate(css: { x: number; y: number }): { x: number; y: number } {
  const view = boardFill(LEAD_PAD_VIEW)
  return {
    x: Math.round(view.x + css.x / view.scale),
    y: Math.round(view.y + css.y / view.scale),
  }
}

export interface LeadPadNight {
  dead: number | null
  /** Sparks in the bank after the last spend. 23 is the live round-10 bank. */
  sparks: number
  rows: {
    round: number
    result: PaceLive['result']
    hearts: number
    sparks: number
    bossLamp: number
    bossTap: number
    bossSec: number
    bossMax: number
    boss: PaceLive['boss']
    bossAt: number
    byLamp: PaceLampHurt[]
    ranks: { id: string; far: number; strong: number }[]
  }[]
}

/**
 * Easy night on the four default rings, from round 1.
 * The first lamp is free. The other three cost `EASY_LAMP_COST`.
 * Every planted lamp takes Strong 1, then one lamp takes Far 1 and another
 * takes Strong 2. Bell is bought on the round 7 clear. Incense is bought
 * on the round 9 clear. This is not the jump-load spender.
 */
export function paceEasyLeadPads(
  farPad: string,
  strongPad: string,
  tapEvery = HUMAN_TAP_EVERY,
  seed?: number,
): LeadPadNight {
  const ranks: Record<string, { far: number; strong: number }> = {
    porch: { far: 0, strong: 0 },
    hollow: { far: 0, strong: 0 },
    journal: { far: 0, strong: 0 },
    bench: { far: 0, strong: 0 },
  }
  let planted = 1
  let sparks = 0
  let hearts = 3
  let bell = false
  let incense = false
  const rows: LeadPadNight['rows'] = []
  const spend = (cleared: number) => {
    while (planted < LEAD_DEFAULT_PADS.length && sparks >= EASY_LAMP_COST) {
      sparks -= EASY_LAMP_COST
      planted += 1
    }
    for (let slot = 0; slot < planted; slot += 1) {
      const id = LEAD_DEFAULT_PADS[slot].id
      if (ranks[id].strong >= 1 || sparks < (TREE_STEP_COST[0] ?? 3)) continue
      sparks -= TREE_STEP_COST[0] ?? 3
      ranks[id] = { ...ranks[id], strong: 1 }
    }
    const armed = planted === LEAD_DEFAULT_PADS.length && LEAD_DEFAULT_PADS.every((pad) => ranks[pad.id].strong >= 1)
    if (armed && ranks[farPad] && ranks[farPad].far < 1 && sparks >= (TREE_STEP_COST[1] ?? 6)) {
      sparks -= TREE_STEP_COST[1] ?? 6
      ranks[farPad] = { ...ranks[farPad], far: 1 }
    }
    if (armed && ranks[strongPad] && ranks[strongPad].strong < 2 && sparks >= (TREE_STEP_COST[1] ?? 6)) {
      sparks -= TREE_STEP_COST[1] ?? 6
      ranks[strongPad] = { ...ranks[strongPad], strong: 2 }
    }
    if (cleared >= 6 && !bell && sparks >= BELL_COST) {
      sparks -= BELL_COST
      bell = true
    }
    if (cleared >= 8 && !incense && sparks >= INCENSE_COST) {
      sparks -= INCENSE_COST
      incense = true
    }
  }
  for (let index = 0; index < 10; index += 1) {
    const pads = LEAD_DEFAULT_PADS.slice(0, planted).map((pad) => ({
      id: pad.id,
      far: ranks[pad.id].far,
      strong: ranks[pad.id].strong,
    }))
    const round = paceEasyLive(
      index,
      [],
      hearts,
      false,
      tapEvery,
      'road',
      undefined,
      [],
      seed,
      0,
      undefined,
      {
        pads,
        bellAt: bell ? leadCssPlate(LEAD_BELL_CSS) : undefined,
        incenseAt: incense ? leadCssPlate(LEAD_INCENSE_CSS) : undefined,
      },
    )
    rows.push({
      round: index + 1,
      result: round.result,
      hearts: round.hearts,
      sparks,
      bossLamp: round.bossLamp,
      bossTap: round.bossTap,
      bossSec: round.bossSec,
      bossMax: round.bossMax,
      boss: round.boss,
      bossAt: round.bossAt ?? -1,
      byLamp: round.byLamp ?? [],
      ranks: pads,
    })
    if (round.result !== 'clear') return { dead: index + 1, sparks, rows }
    hearts = easyClearHeart(round.hearts)
    sparks += round.sparks + easyBossClearSparks(index) + easyClearSparkBonus(index)
    spend(index)
  }
  return { dead: null, sparks, rows }
}

/** Hearts carry. Bonus steps are in the kit before the wave they were bought for. */
export function paceEasyLockCampaign(): Campaign {
  let hearts = 3
  const rows: Campaign['rows'] = []
  const plan = lockInBuyTable()
  for (let index = 0; index < 25; index += 1) {
    const round = paceEasyLive(index, plan[index].lamps, hearts, false, LIVE_TAP_EVERY, 'road')
    rows.push({
      round: index + 1,
      result: round.result,
      taps: round.taps,
      hearts: round.hearts,
      boss: round.boss,
    })
    if (round.result !== 'clear') return { dead: index + 1, rows }
    hearts = easyClearHeart(round.hearts)
  }
  return { dead: null, rows }
}

/** R15 / R20 / R25. Ceiling build, three hearts, one round. */
export function bossDamageTable(): BossRow[] {
  return [14, 19, 24].map((index) => {
    const frozen = paceEasy436(index, CEILING_LAMPS, 3)
    const live = paceEasyLive(index, CEILING_LAMPS, 3, false)
    return {
      round: index + 1,
      hp: live.bossMax,
      frozenDamage: frozen.bossLamp + frozen.bossTap,
      frozenHp: frozen.bossMax,
      damage: live.bossLamp + live.bossTap,
      boss: live.boss,
    }
  })
}
