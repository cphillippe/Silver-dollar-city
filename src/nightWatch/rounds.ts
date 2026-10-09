/**
 * Easy Night Watch rounds (1.4.402, slice 1 of #602).
 * Append rows to climb toward R25. Hard does not read this table.
 * `count` is the walkers (and the spark pay, one spark each).
 * `speed` multiplies the Easy walk rate. `hp` is added to the kind's HP.
 * `spawn` multiplies the gap before the next walker. Below 1 comes sooner.
 */
export interface EasyRound {
  count: number
  speed: number
  hp: number
  spawn: number
}

export const EASY_ROUNDS: readonly EasyRound[] = [
  { count: 4, speed: 1, hp: 0, spawn: 1 },
  { count: 4, speed: 1.35, hp: 0, spawn: 0.95 },
  { count: 5, speed: 1.8, hp: 1, spawn: 0.9 },
  { count: 5, speed: 2.6, hp: 2, spawn: 0.85 },
  { count: 6, speed: 5.5, hp: 3, spawn: 0.75 },
  { count: 6, speed: 6.4, hp: 7, spawn: 0.72 },
]

export function easyRound(index: number): EasyRound {
  const last = EASY_ROUNDS.length - 1
  const i = Math.min(last, Math.max(0, Math.floor(index) || 0))
  return EASY_ROUNDS[i]
}

/** Phone label. Easy says "Round 3 of 6". Hard keeps "Wave 3/5". */
export function roundMark(index: number, total: number, easy: boolean): string {
  const n = Math.max(0, Math.floor(index) || 0) + 1
  const of = Math.max(n, Math.floor(total) || n)
  return easy ? `Round ${n} of ${of}` : `Wave ${n}/${of}`
}
