import { pathPoint } from './path/data.ts'
import { easyRound } from './rounds.ts'
import { lampStrike, type LampPaths } from './upgradeTree.ts'

/**
 * Ordinary road seats used to tune slices 1 and 2.
 * The first two (gap about 68) are the 1.4.402 pair: Level I reach (114) covers the road.
 * Seats 3 and 4 sit further along the road, same kind of gap, so four planted lamps
 * cover more of the walk than two. A face tap once a second is `tapEvery`.
 * 0 means autofire only. One leaked walker fails the round, matching Easy.
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

const SEAT_GAP = ROAD_SEATS.map((lamp) => {
  let best = Infinity
  for (let t = 0; t <= 1; t += 0.002) {
    const point = pathPoint(t)
    best = Math.min(best, Math.hypot(lamp.x - point.x, lamp.y - point.y))
  }
  return best
})

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
