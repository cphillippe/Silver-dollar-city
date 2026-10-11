import {
  CANDLE_ID,
  candlePlateReach,
  candleRowSize,
  candleStrike,
  freshCandlePaths,
} from './candle.ts'
import { paceExtraNight, type PaceShot } from './livePace.ts'

/** A zero-tap night is longer than one round, so no glow taps land. */
const ZERO_TAP = 1e9

/**
 * Three candles on one stretch of the A2 road. Each links, so the row is x3.
 * Plate seats that clear the road block and still reach.
 */
export const CANDLE_ROW_SEATS: readonly CandleSeat[] = [
  { x: 348, y: 726 },
  { x: 390, y: 698 },
  { x: 446, y: 684 },
]

/** The same three candles, far enough apart that none of them link. */
export const CANDLE_SPREAD_SEATS: readonly CandleSeat[] = [
  { x: 586, y: 908 },
  { x: 530, y: 600 },
  { x: 628, y: 222 },
]

/** Six linked candles. The natural spender still stops inside rounds 18–23. */
export const CANDLE_SIX_SEATS: readonly CandleSeat[] = [
  { x: 628, y: 950 },
  { x: 572, y: 908 },
  { x: 544, y: 838 },
  { x: 488, y: 796 },
  { x: 432, y: 754 },
  { x: 432, y: 684 },
]

export interface CandleSeat {
  x: number
  y: number
}

/** Shots for these seats. A row shares one factor. Spread seats stay at the lone hit. */
export function candleShots(seats: readonly CandleSeat[]): PaceShot[] {
  const plants: Record<string, string> = {}
  for (const seat of seats) plants[`at:${seat.x}:${seat.y}`] = CANDLE_ID
  return seats.map((seat) => {
    const id = `at:${seat.x}:${seat.y}`
    const strike = candleStrike(freshCandlePaths(), candleRowSize(id, plants))
    return {
      x: seat.x,
      y: seat.y,
      damage: strike.damage,
      range: candlePlateReach(id, 0),
      cooldownMs: strike.cooldownMs,
    }
  })
}

/**
 * Pillars stay on the same plan. `taps` false is the zero-tap compare.
 * `dead` is the round the night stops, or null when all 25 clear.
 */
export function paceCandleNight(
  seats: readonly CandleSeat[],
  kind: 'none' | 'natural',
  taps: boolean,
): { dead: number | null; dealt: number } {
  const shots = candleShots(seats)
  return taps ? paceExtraNight(kind, shots) : paceExtraNight(kind, shots, ZERO_TAP)
}
