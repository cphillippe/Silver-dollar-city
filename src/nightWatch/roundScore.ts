import { pathPoint } from './path/data.ts'
import { easyRound } from './rounds.ts'

/**
 * Two ordinary road seats used to tune slice 1.
 * Gap is about 68, so Level I reach (114) and Level II (132) both cover the road.
 * A face tap once a second is `tapEvery`. 0 means autofire only.
 * One leaked walker fails the round, matching the live Easy clear rule.
 */
const ROAD_SEATS = [
  { x: 475, y: 766 },
  { x: 230, y: 680 },
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
  const lamps = tiers.map((tier, index) => ({
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
