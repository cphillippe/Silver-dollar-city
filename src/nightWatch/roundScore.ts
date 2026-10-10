import {
  applyBossExitLeak,
  applyEasyPaceLeaks,
  easyGlowTapDamage,
  easyRoundHeartCap,
  easyTapArmored,
  easyTapSoaked,
} from '../lib/defend.ts'
import { NIGHT_PACE_FAST, pacedDt } from '../lib/nightPace.ts'
import { pathPoint } from './path/data.ts'
import { easyRound } from './rounds.ts'
import { lampStrike, type LampPaths } from './upgradeTree.ts'
import { easyBossHp, easyBossRound, easyLatePush, BOSS_PACE, gaitForSlot, walkerHp, walkerPace } from './walkers.ts'

/**
 * Ordinary road seats used to tune slices 1 and 2.
 * The first two (gap about 68) are the 1.4.402 pair: Level I reach (114) covers the road.
 * Seats 3 and 4 sit further along the road, same kind of gap, so four planted lamps
 * cover more of the walk than two. A face tap once a second is `tapEvery`.
 * 0 means autofire only. One leaked walker fails the scored round.
 * Live Easy spends a heart on that leak and ends the night only at 0 hearts.
 */
const ROAD_SEATS = [
  { x: 475, y: 766 },
  { x: 230, y: 680 },
  { x: 540, y: 560 },
  { x: 620, y: 260 },
] as const

function freeRange(gap: number, tier: number): number {
  const base = 96 + Math.max(0, tier - 1) * 18 + 18
  if (base < gap + 24) return Math.min(base, Math.max(0, gap - 1))
  return base
}

function seatGap(seats: readonly { x: number; y: number }[]): number[] {
  return seats.map((lamp) => {
    let best = Infinity
    for (let t = 0; t <= 1; t += 0.002) {
      const point = pathPoint(t)
      best = Math.min(best, Math.hypot(lamp.x - point.x, lamp.y - point.y))
    }
    return best
  })
}

const SEAT_GAP = seatGap(ROAD_SEATS)

/**
 * Seats a kid can plant (1.4.412). Each one sits just off the road on a bend,
 * so a level I ring covers a long stretch of the walk. The straight roadside
 * seats above cover about 8% of the path, and that made this sim lose round 5
 * with no taps while the phone cleared it. Score functions keep those seats.
 */
const LIVE_SEATS = [
  { x: 472, y: 192 },
  { x: 400, y: 736 },
  { x: 368, y: 552 },
  { x: 416, y: 384 },
] as const

const LIVE_GAP = seatGap(LIVE_SEATS)

export function scoreEasyRoad(
  roundIndex: number,
  tiers: readonly number[],
  tapEvery = 0,
): 'clear' | 'lost' | 'timeout' {
  const round = easyRound(roundIndex)
  const lamps = tiers.slice(0, ROAD_SEATS.length).map((tier, index) => ({
    x: ROAD_SEATS[index].x,
    y: ROAD_SEATS[index].y,
    tier,
    range: freeRange(SEAT_GAP[index], tier),
    cool: 0,
  }))
  const raiders: { t: number; hp: number; dead: boolean }[] = []
  let spawned = 0
  let downed = 0
  let hearts = 3
  let spawnAt = 0
  let spawnNow = false
  let tapAt = 0
  let time = 0
  const dt = 1 / 60
  const walk = 0.01 * round.speed
  const spawnEvery = 3.8 * round.spawn
  const live = () => raiders.filter((raider) => !raider.dead)
  while (time < 180) {
    spawnAt += dt
    tapAt += dt
    let leaked = 0
    for (const raider of raiders) {
      if (raider.dead) continue
      raider.t += walk * dt
      if (raider.t >= 1) {
        raider.dead = true
        leaked += 1
      }
    }
    hearts -= leaked
    if (hearts <= 0) return 'lost'
    if (spawned < round.count && live().length < 3 && (spawnNow || spawnAt >= spawnEvery || spawned === 0)) {
      spawnNow = false
      spawnAt = 0
      raiders.push({ t: 0, hp: 2 + round.hp, dead: false })
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
      lamp.cool = 0.7
      best.hp -= lamp.tier
      if (best.hp <= 0) {
        best.dead = true
        downed += 1
        spawnNow = true
      }
    }
    if (tapEvery > 0 && tapAt >= tapEvery) {
      tapAt = 0
      const front = live().sort((a, b) => b.t - a.t)[0]
      if (front) {
        const point = pathPoint(front.t)
        let tier = lamps[0].tier
        let bestD = Infinity
        for (const lamp of lamps) {
          const distance = Math.hypot(lamp.x - point.x, lamp.y - point.y)
          if (distance < bestD) {
            bestD = distance
            tier = lamp.tier
          }
        }
        front.hp -= tier
        if (front.hp <= 0) {
          front.dead = true
          downed += 1
          spawnNow = true
        }
      }
    }
    if (downed >= round.count) return 'clear'
    if (spawned >= round.count && live().length === 0 && downed < round.count) return 'lost'
    time += dt
  }
  return 'timeout'
}

/**
 * Same road and seats as `scoreEasyRoad`, with the Easy upgrade tree.
 * A face tap once a second uses the nearest lamp's main hit and ignores range.
 * Autofire can also nick one walker inside the ring (Strong) or just past it (Far).
 */
export function scoreEasyTree(
  roundIndex: number,
  paths: readonly Pick<LampPaths, 'far' | 'strong'>[],
  tapEvery = 0,
): 'clear' | 'lost' | 'timeout' {
  const round = easyRound(roundIndex)
  const lamps = paths.slice(0, ROAD_SEATS.length).map((rank, index) => {
    const strike = lampStrike({ far: rank.far, strong: rank.strong })
    const base = 114 + strike.rangeBonus
    const gap = SEAT_GAP[index]
    return {
      x: ROAD_SEATS[index].x,
      y: ROAD_SEATS[index].y,
      range: base < gap + 24 ? Math.min(base, Math.max(0, gap - 1)) : base,
      strike,
      cool: 0,
    }
  })
  const raiders: { t: number; hp: number; dead: boolean }[] = []
  let spawned = 0
  let downed = 0
  let hearts = 3
  let spawnAt = 0
  let spawnNow = false
  let tapAt = 0
  let time = 0
  const dt = 1 / 60
  const walk = 0.01 * round.speed
  const spawnEvery = 3.8 * round.spawn
  const live = () => raiders.filter((raider) => !raider.dead)
  const wound = (raider: (typeof raiders)[number], amount: number) => {
    if (raider.dead || amount <= 0) return
    raider.hp -= amount
    if (raider.hp <= 0) {
      raider.dead = true
      downed += 1
      spawnNow = true
    }
  }
  while (time < 180) {
    spawnAt += dt
    tapAt += dt
    let leaked = 0
    for (const raider of raiders) {
      if (raider.dead) continue
      raider.t += walk * dt
      if (raider.t >= 1) {
        raider.dead = true
        leaked += 1
      }
    }
    hearts -= leaked
    if (hearts <= 0) return 'lost'
    if (spawned < round.count && live().length < 3 && (spawnNow || spawnAt >= spawnEvery || spawned === 0)) {
      spawnNow = false
      spawnAt = 0
      raiders.push({ t: 0, hp: 2 + round.hp, dead: false })
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
      wound(best, lamp.strike.damage)
      const nick = (maxDist: number, minDist: number, amount: number) => {
        if (amount <= 0) return
        let pick: (typeof raiders)[number] | null = null
        let pickD = maxDist
        for (const raider of live()) {
          if (raider === best || raider.dead) continue
          const point = pathPoint(raider.t)
          const distance = Math.hypot(lamp.x - point.x, lamp.y - point.y)
          if (distance > minDist && distance <= pickD) {
            pick = raider
            pickD = distance
          }
        }
        if (pick) wound(pick, amount)
      }
      nick(lamp.range * lamp.strike.splashFrac, -1, lamp.strike.splash)
      nick(lamp.range * (1 + lamp.strike.outerFrac), lamp.range, lamp.strike.outer)
    }
    if (tapEvery > 0 && tapAt >= tapEvery) {
      tapAt = 0
      const front = live().sort((a, b) => b.t - a.t)[0]
      if (front) {
        const point = pathPoint(front.t)
        let damage = lamps[0]?.strike.damage ?? 1
        let bestD = Infinity
        for (const lamp of lamps) {
          const distance = Math.hypot(lamp.x - point.x, lamp.y - point.y)
          if (distance < bestD) {
            bestD = distance
            damage = lamp.strike.damage
          }
        }
        wound(front, damage)
      }
    }
    if (downed >= round.count) return 'clear'
    if (spawned >= round.count && live().length === 0 && downed < round.count) return 'lost'
    time += dt
  }
  return 'timeout'
}

export interface PaceRound {
  result: 'clear' | 'lost' | 'timeout'
  lampKills: number
  tapKills: number
  /** Taps that landed. Misses are attempts that did not. */
  taps: number
  attempts: number
  hearts: number
  /** Boss fate. `none` on a round with no boss. */
  boss: 'kill' | 'leak' | 'up' | 'none'
}

/**
 * A kid's tap (1.4.421). They aim at the walker who is glowing, then the
 * finger lands after a short wait. About 30% of tries miss the face.
 * A try that lands after that walker has stopped glowing does nothing.
 */
export const KID_TAP_WASTE = 0.3
export const KID_TAP_REACT_S = 0.45

/**
 * A kid burst. Four tries at about 4 per second, then a pause.
 * Waste and the short wait still apply. `burst` is off unless a caller asks.
 */
export const KID_BURST_GAP_S = 0.25
export const KID_BURST_TAPS = 4
export const KID_BURST_PAUSE_S = 1.5

/**
 * One Easy round with a clumsy tap. A try lands every `tapEvery` seconds
 * (default 3). While two walkers are out, about `offCue` of those tries
 * (default 0.2) hit a face that is not glowing and do nothing. The rest
 * hit the glowing face when the roll is within `hitChance` (default 0.7).
 * A glowing tap deals a flat hit, not the lamp's damage. A tap kill does not
 * pull the next walker forward. A paid leak costs one
 * heart, then grace and the per-round cap apply, on the game clock.
 * `pace` 3 runs three 1× steps per wall frame, so the round matches 1×.
 * The round is lost only at 0 hearts. `seed` keeps the misses the same from run to run.
 * `kid` uses the glowing-face wait above. The older hitChance / offCue rolls stay
 * when `kid` is false, so earlier nights keep their misses.
 * `burst` replaces `tapEvery` with four quick tries and a pause. It stays off
 * for the older nights.
 */
export function paceEasyTree(
  roundIndex: number,
  paths: readonly Pick<LampPaths, 'far' | 'strong'>[],
  heartsIn = 3,
  tapEvery = 3,
  hitChance = 0.7,
  seed = 1,
  offCue = 0.2,
  pace = 1,
  kid = false,
  burst = false,
): PaceRound {
  const round = easyRound(roundIndex)
  const bossRound = easyBossRound(roundIndex)
  const total = round.count + (bossRound ? 1 : 0)
  const bonus = round.hp + easyLatePush(roundIndex)
  const lamps = paths.slice(0, LIVE_SEATS.length).map((rank, index) => {
    const strike = lampStrike({ far: rank.far, strong: rank.strong })
    const base = 114 + strike.rangeBonus
    const gap = LIVE_GAP[index]
    return {
      x: LIVE_SEATS[index].x,
      y: LIVE_SEATS[index].y,
      range: base < gap + 24 ? Math.min(base, Math.max(0, gap - 1)) : base,
      strike,
      cool: 0,
    }
  })
  const raiders: {
    id: number
    t: number
    hp: number
    dead: boolean
    pace: number
    gait?: string
    boss: boolean
    chip: number
  }[] = []
  const pending: { at: number; id: number }[] = []
  let spawned = 0
  let downed = 0
  let hearts = Math.max(0, heartsIn)
  let spawnAt = 0
  let spawnNow = false
  let tapAt = 0
  let time = 0
  let lampKills = 0
  let tapKills = 0
  let taps = 0
  let attempts = 0
  let graceUntil = 0
  let lostRound = 0
  let bossFate: 'kill' | 'leak' | 'up' | 'none' = bossRound ? 'up' : 'none'
  const walk = 0.01 * round.speed
  const spawnEvery = 3.8 * round.spawn
  let rng = seed >>> 0 || 1
  const roll = () => {
    rng = (Math.imul(1664525, rng) + 1013904223) >>> 0
    return rng / 4294967296
  }
  const live = () => raiders.filter((raider) => !raider.dead)
  const finish = (result: PaceRound['result']): PaceRound => ({
    result,
    lampKills,
    tapKills,
    taps,
    attempts,
    hearts,
    boss: bossFate,
  })
  const wound = (raider: (typeof raiders)[number], amount: number, byTap: boolean) => {
    if (raider.dead || amount <= 0) return
    raider.hp -= amount
    if (raider.hp <= 0) {
      raider.dead = true
      downed += 1
      if (!byTap) spawnNow = true
      if (byTap) tapKills += 1
      else lampKills += 1
      if (raider.boss) bossFate = 'kill'
    }
  }
  const tapWound = (raider: (typeof raiders)[number]) => {
    const dmg = easyGlowTapDamage(
      raider.hp,
      raider.chip,
      easyTapArmored(roundIndex, raider.gait, raider.boss),
    )
    taps += 1
    if (dmg > 0) raider.chip += dmg
    wound(raider, dmg, true)
  }
  const tapGap = () => {
    if (!burst) return tapEvery
    const slot = attempts % KID_BURST_TAPS
    if (attempts > 0 && slot === 0) return KID_BURST_GAP_S + KID_BURST_PAUSE_S
    return KID_BURST_GAP_S
  }
  if (hearts <= 0) return finish('lost')
  const paceScale = pace === NIGHT_PACE_FAST ? NIGHT_PACE_FAST : 1
  const slices = paceScale
  const dt = pacedDt(1 / 60, paceScale) / slices
  while (time < 180) {
    spawnAt += dt
    tapAt += dt
    let leaked = 0
    let bossThrough = false
    for (const raider of raiders) {
      if (raider.dead) continue
      raider.t += walk * raider.pace * dt
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
      raiders.push({
        id: spawned + 1,
        t: 0,
        hp: boss ? easyBossHp(roundIndex) : walkerHp(2, bonus, gait),
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
      wound(best, lamp.strike.damage, false)
      const nick = (maxDist: number, minDist: number, amount: number) => {
        if (amount <= 0) return
        let pick: (typeof raiders)[number] | null = null
        let pickD = maxDist
        for (const raider of live()) {
          if (raider === best || raider.dead) continue
          const point = pathPoint(raider.t)
          const distance = Math.hypot(lamp.x - point.x, lamp.y - point.y)
          if (distance > minDist && distance <= pickD) {
            pick = raider
            pickD = distance
          }
        }
        if (pick) wound(pick, amount, false)
      }
      nick(lamp.range * lamp.strike.splashFrac, -1, lamp.strike.splash)
      nick(lamp.range * (1 + lamp.strike.outerFrac), lamp.range, lamp.strike.outer)
    }
    if (kid) {
      for (const shot of pending) {
        if (shot.at > time) continue
        shot.at = Infinity
        const aim = raiders.find((raider) => raider.id === shot.id)
        const walking = live().sort((a, b) => b.t - a.t)
        const front = walking[0]
        if (roll() < KID_TAP_WASTE || !aim || aim.dead || !front) continue
        const soaked = easyTapSoaked(roundIndex, { tapChip: aim.chip, gait: aim.gait, boss: aim.boss })
        if (soaked) {
          const next = walking.find(
            (raider) => !easyTapSoaked(roundIndex, { tapChip: raider.chip, gait: raider.gait, boss: raider.boss }),
          )
          if (next) tapWound(next)
          continue
        }
        if (front.id !== aim.id) continue
        tapWound(aim)
      }
    }
    if ((burst || tapEvery > 0) && tapAt >= tapGap() && live().length > 0) {
      tapAt = 0
      attempts += 1
      const walking = live().sort((a, b) => b.t - a.t)
      const openTap = (raider: (typeof walking)[number]) =>
        !easyTapSoaked(roundIndex, { tapChip: raider.chip, gait: raider.gait, boss: raider.boss })
      const cue = walking.find(openTap) ?? walking[0]
      if (kid) {
        if (cue) pending.push({ at: time + KID_TAP_REACT_S, id: cue.id })
      } else {
        const offFace = walking.length > 1 && roll() < offCue
        const hit = roll() <= hitChance
        if (!offFace && hit && cue) tapWound(cue)
      }
    }
    const fate: string = bossFate
    const bossOpen = bossRound && fate !== 'kill'
    if (downed >= total) return finish(bossOpen ? 'lost' : 'clear')
    if (spawned >= total && live().length === 0) {
      if (bossOpen) return finish('lost')
      return finish(hearts > 0 ? 'clear' : 'lost')
    }
    time += dt
  }
  return finish('timeout')
}
