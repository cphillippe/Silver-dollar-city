import { roadCoverLength, roadCoverRank, type LampGround } from '../../lib/lampPlace.ts'
import type { NightMapSeat } from './fromPack.ts'

/** Level I reach on open ground. */
export const LEVEL_I_REACH = 114

export interface RatedSeat extends NightMapSeat {
  length: number
  rank: 'good' | 'some' | 'far'
}

/** Ghost rank for these seats on this road, at level I. */
export function rateMapSeats(
  seats: readonly NightMapSeat[],
  path: LampGround['path'],
  range = LEVEL_I_REACH,
): RatedSeat[] {
  return seats.map((seat) => {
    const length = roadCoverLength(seat, range, path)
    return { ...seat, length, rank: roadCoverRank(length) }
  })
}

/**
 * Up to `count` Good seats, spread across the plate.
 * The first is the longest stretch. Each next one sits far from the ones already chosen.
 */
export function spreadGoodSeats(rated: readonly RatedSeat[], count = 4): RatedSeat[] {
  const good = rated.filter((seat) => seat.rank === 'good').sort((a, b) => b.length - a.length)
  if (good.length <= count) return good.slice()
  const chosen: RatedSeat[] = [good[0]]
  const rest = good.slice(1)
  while (chosen.length < count && rest.length > 0) {
    let bestAt = 0
    let bestGap = -1
    for (let i = 0; i < rest.length; i += 1) {
      let gap = Infinity
      for (const seat of chosen) {
        gap = Math.min(gap, Math.hypot(seat.x - rest[i].x, seat.y - rest[i].y))
      }
      if (gap > bestGap) {
        bestGap = gap
        bestAt = i
      }
    }
    const [next] = rest.splice(bestAt, 1)
    chosen.push(next)
  }
  return chosen
}
