/**
 * Easy wave cues (1.4.496).
 * The 3-2-1 is a screen hold before the live clock starts.
 * Pace sims do not read this module, so a round's outcome stays put.
 */

/** How long each big number stays up. */
export const WAVE_COUNT_STEP_MS = 600

/** 3, then 2, then 1. Walkers spawn when this list is finished. */
export const WAVE_COUNT = [3, 2, 1] as const

/** Full hold before the live clock moves. Three steps. */
export const WAVE_COUNT_MS = WAVE_COUNT_STEP_MS * WAVE_COUNT.length

/** Gold "Wave survived!" burst on an Easy clear. */
export const WAVE_SURVIVED_MS = 1200

export type WaveCountDigit = (typeof WAVE_COUNT)[number]

/** The number showing at this many milliseconds into the hold. Null when the hold is over. */
export function waveCountDigit(elapsedMs: number): WaveCountDigit | null {
  if (!(elapsedMs >= 0) || elapsedMs >= WAVE_COUNT_MS) return null
  const index = Math.floor(elapsedMs / WAVE_COUNT_STEP_MS)
  return WAVE_COUNT[index] ?? null
}

/** True while the clear burst should still be on screen. */
export function waveSurvivedOn(elapsedMs: number): boolean {
  return elapsedMs >= 0 && elapsedMs < WAVE_SURVIVED_MS
}
