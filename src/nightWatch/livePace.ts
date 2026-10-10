import {
  applyBossExitLeak,
  applyEasyPaceLeaks,
  easyClearHeart,
  easyGlowTapDamage,
  easyLiveSpawnT,
  easyRoundHeartCap,
  easyTapArmored,
} from '../lib/defend.ts'
import { DEFEND_ANCHOR, pathClearance, pathPoint } from './path/data.ts'
import { easyRound as liveRound, type EasyRound } from './rounds.ts'
import { lampStrike, type LampPaths } from './upgradeTree.ts'
import {
  BOSS_PACE,
  easyBossHp,
  easyBossRound,
  easyJumpLoad,
  easyLatePush,
  easyWalkerHp,
  gaitForSlot,
  walkerHp,
  walkerPace,
  type WalkerGait,
} from './walkers.ts'

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
}

interface LiveRules {
  round: (index: number) => EasyRound
  bossHp: (index: number) => number
  latePush: (index: number) => number
  walker: (kind: number, bonus: number, gait: WalkerGait | undefined, roundIndex: number) => number
}

function liveRules(): LiveRules {
  return {
    round: liveRound,
    bossHp: easyBossHp,
    latePush: easyLatePush,
    walker: easyWalkerHp,
  }
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
): PaceLive {
  const rules = frozen ? rules436() : liveRules()
  const round = rules.round(roundIndex)
  const bossRound = easyBossRound(roundIndex)
  const total = round.count + (bossRound ? 1 : 0)
  const bonus = round.hp + rules.latePush(roundIndex)
  const lamps = PLATE.map((seat, index) => {
    const rank = paths[index] ?? { far: 0, strong: 0 }
    const strike = lampStrike(rank)
    const range = plateReach(seat.id, 96 + strike.rangeBonus, seat.gap) * LIVE_RING_SCALE
    return { ...seat, strike, range, cool: 0 }
  })
  const raiders: {
    t: number
    hp: number
    dead: boolean
    pace: number
    gait?: string
    boss: boolean
    chip: number
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
  let graceUntil = 0
  let lostRound = 0
  let bossFate: PaceLive['boss'] = bossRound ? 'up' : 'none'
  const dt = 1 / 60
  const spawnEvery = 3.8 * round.spawn
  const live = () => raiders.filter((raider) => !raider.dead)
  const finish = (result: PaceLive['result']): PaceLive => ({
    result,
    taps,
    bossLamp,
    bossTap,
    bossMax,
    hearts,
    boss: bossFate,
  })
  if (hearts <= 0) return finish('lost')
  while (time < 180) {
    spawnAt += dt
    tapAt += dt
    let leaked = 0
    let bossThrough = false
    for (const raider of raiders) {
      if (raider.dead) continue
      raider.t += 0.01 * round.speed * raider.pace * dt
      if (raider.t >= 1) {
        raider.dead = true
        if (raider.boss) {
          bossFate = 'leak'
          bossThrough = true
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
    if (spawned < total && live().length < 3 && (spawnNow || spawnAt >= spawnEvery || spawned === 0)) {
      spawnNow = false
      spawnAt = 0
      const boss = bossRound && spawned === round.count
      const gait = boss ? undefined : gaitForSlot(round, spawned)
      const hp = boss ? rules.bossHp(roundIndex) : rules.walker(2, bonus, gait, roundIndex)
      if (boss) bossMax = hp
      raiders.push({
        t: easyLiveSpawnT(round.speed * (boss ? BOSS_PACE : walkerPace(gait))),
        hp,
        dead: false,
        pace: boss ? BOSS_PACE : walkerPace(gait),
        gait,
        boss,
        chip: 0,
      })
      spawned += 1
    }
    for (const lamp of lamps) {
      lamp.cool -= dt
      if (lamp.cool > 0) continue
      let best: (typeof raiders)[number] | null = null
      let bestD = lamp.range
      for (const raider of live()) {
        const point = pathPoint(raider.t)
        const distance = Math.hypot(lamp.x - point.x, lamp.y - point.y)
        if (distance <= bestD) {
          best = raider
          bestD = distance
        }
      }
      if (!best) continue
      lamp.cool = lamp.strike.cooldownMs / 1000
      const apply = (raider: (typeof raiders)[number] | null, amount: number) => {
        if (!raider || raider.dead || amount <= 0) return
        const dealt = Math.min(raider.hp, amount)
        raider.hp -= dealt
        if (raider.boss) bossLamp += dealt
        if (raider.hp <= 0) {
          raider.dead = true
          spawnNow = true
          if (raider.boss) bossFate = 'kill'
        }
      }
      apply(best, lamp.strike.damage)
      if (lamp.strike.splash > 0) {
        let pick: (typeof raiders)[number] | null = null
        let pickD = lamp.range * lamp.strike.splashFrac
        for (const raider of live()) {
          if (raider === best || raider.dead) continue
          const point = pathPoint(raider.t)
          const distance = Math.hypot(lamp.x - point.x, lamp.y - point.y)
          if (distance <= pickD) {
            pick = raider
            pickD = distance
          }
        }
        apply(pick, lamp.strike.splash)
      }
      if (lamp.strike.outer > 0) {
        let pick: (typeof raiders)[number] | null = null
        let pickD = lamp.range * (1 + lamp.strike.outerFrac)
        for (const raider of live()) {
          if (raider === best || raider.dead) continue
          const point = pathPoint(raider.t)
          const distance = Math.hypot(lamp.x - point.x, lamp.y - point.y)
          if (distance > lamp.range && distance <= pickD) {
            pick = raider
            pickD = distance
          }
        }
        apply(pick, lamp.strike.outer)
      }
    }
    if (tapAt >= tapEvery && live().length > 0) {
      tapAt = 0
      const walking = live().sort((a, b) => b.t - a.t)
      const cue = walking.find(
        (raider) => !easyTapArmored(roundIndex, raider.gait, raider.boss) || raider.chip < 4,
      )
      if (cue) {
        const dmg = easyGlowTapDamage(cue.hp, cue.chip, easyTapArmored(roundIndex, cue.gait, cue.boss))
        if (dmg > 0) {
          cue.chip += dmg
          cue.hp -= dmg
          taps += 1
          if (cue.boss) bossTap += dmg
          if (cue.hp <= 0) {
            cue.dead = true
            if (cue.boss) bossFate = 'kill'
          }
        }
      }
    }
    if (spawned >= total && live().length === 0) {
      if (bossRound && bossFate !== 'kill') return finish('lost')
      return finish(hearts > 0 ? 'clear' : 'lost')
    }
    time += dt
  }
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
): readonly LampPaths[] {
  if (kind === 'none') return BARE_LAMPS
  if (kind === 'ceiling') return CEILING_LAMPS
  const owned = easyJumpLoad(roundIndex).lamps
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
