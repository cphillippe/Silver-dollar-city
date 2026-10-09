/**
 * Easy Night Watch rounds (1.4.404, slice 2 of #602).
 * R1–R6 are the 1.4.402 table. Append rows to climb; this slice stops at R25.
 * Hard does not read this table.
 * `count` is the walkers. Plain and fast pay one spark. Tough pays two.
 * `speed` multiplies the Easy walk rate. It stays at or under 6.8 so a walker
 * on a 375×667 phone is still readable and tappable. Late rounds lean on
 * count and HP. `hp` is added to the kind's HP.
 * `spawn` multiplies the gap before the next walker. Below 1 comes sooner.
 * Rounds 8, 12, 16, 20, and 24 are breathers: a little easier than the round before.
 * 1.4.408 softens rounds 7–12 so a lamp-heavy spender can hold them.
 * 1.4.410 raises round 5 to the round-6 walk pace and brings the next walker
 * a little sooner. HP and the walker count stay put. R1–R4 stay put.
 * 1.4.411 mixes Fast (from round 4) and Tough (from round 7) into `count`.
 * `fast` and `tough` are how many of that count use those gaits. The rest are plain.
 * 1.4.412 raises health and count from round 5, and mixes in more Fast and Tough,
 * so a lamp planted on a bend no longer clears round 5 by itself.
 * A third gait is not in this table.
 */
export interface EasyRound {
  count: number
  speed: number
  hp: number
  spawn: number
  /** Walkers in `count` that use the fast gait. */
  fast: number
  /** Walkers in `count` that use the tough gait. */
  tough: number
}

/** Walkers stay near the round-6 pace. Later slices should not blow past this. */
export const EASY_ROUND_SPEED_CAP = 6.8

export const EASY_ROUNDS: readonly EasyRound[] = [
  { count: 4, speed: 1, hp: 0, spawn: 1, fast: 0, tough: 0 },
  { count: 4, speed: 1.35, hp: 0, spawn: 0.95, fast: 0, tough: 0 },
  { count: 5, speed: 1.8, hp: 1, spawn: 0.9, fast: 0, tough: 0 },
  { count: 5, speed: 2.6, hp: 2, spawn: 0.85, fast: 1, tough: 0 },
  { count: 7, speed: 6.4, hp: 6, spawn: 0.66, fast: 2, tough: 3 },
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

export function easyRound(index: number): EasyRound {
  const last = EASY_ROUNDS.length - 1
  const i = Math.min(last, Math.max(0, Math.floor(index) || 0))
  return EASY_ROUNDS[i]
}

/** Phone label. Easy says "Round 3 of 25". Hard keeps "Wave 3/5". */
export function roundMark(index: number, total: number, easy: boolean): string {
  const n = Math.max(0, Math.floor(index) || 0) + 1
  const of = Math.max(n, Math.floor(total) || n)
  return easy ? `Round ${n} of ${of}` : `Wave ${n}/${of}`
}
