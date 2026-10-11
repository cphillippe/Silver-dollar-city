/**
 * Playtest seed (1.4.456).
 * A normal night ignores `nwSeed`. With `playtest=1`, the same number
 * lines up spawns and shots the same way every run.
 */

/** Null unless this URL is a playtest and `nwSeed` is a whole number. */
export function nightWatchSeed(search: string): number | null {
  const params = new URLSearchParams(search)
  if (params.get('playtest') !== '1') return null
  const raw = params.get('nwSeed')
  if (!raw || !/^\d+$/.test(raw)) return null
  const seed = Number(raw)
  if (!Number.isFinite(seed)) return null
  return Math.floor(seed)
}

/** Same seed, same sequence of values in 0–1. */
export function nightRoller(seed: number): () => number {
  let state = Math.floor(seed) >>> 0
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0
    return state / 4294967296
  }
}

let restoreRandom: (() => void) | null = null

/**
 * While a playtest seed is on, `Math.random` follows that seed.
 * A normal night, and a playtest with no `nwSeed`, keep the old roller.
 */
export function bindNightRoll(seed: number | null): void {
  if (restoreRandom) {
    restoreRandom()
    restoreRandom = null
  }
  if (seed == null) return
  const roll = nightRoller(seed)
  const prev = Math.random
  Math.random = roll
  restoreRandom = () => {
    Math.random = prev
  }
}

export interface NightSeedPlan {
  /** 0–1. Stretches or shortens the spawn gap by up to 15%. */
  spawnFrac: number
  /** 0–1. How far each lamp's wait has already run when the wave opens. */
  shotFrac: number
}

/** Two rolls. The same seed always returns the same plan. */
export function nightSeedPlan(seed: number): NightSeedPlan {
  const roll = nightRoller(seed)
  return { spawnFrac: roll(), shotFrac: roll() }
}

/**
 * Fixed step when a seed is on, matching the scorer's 1/60s.
 * The frame clock is capped at 50ms, so a slow phone and a fast phone
 * were not playing the same wave.
 */
export const NIGHT_SEED_STEP = 1 / 60

/** Spawn gap scale for this seed. Stays within 15% of the table. */
export function nightSeedSpawnScale(spawnFrac: number): number {
  return 0.85 + 0.3 * Math.min(1, Math.max(0, spawnFrac))
}

/** Seconds until the first shot. 0 fires on the first step. */
export function nightSeedShotWait(cooldownSec: number, shotFrac: number): number {
  const frac = Math.min(1, Math.max(0, shotFrac))
  return Math.max(0, cooldownSec) * (1 - frac)
}

/**
 * Game-clock time of the virtual previous shot.
 * Unseeded (`shotFrac` null) is already one full wait behind, so the lamp is ready.
 * Seeded, the mark is fixed at the wave open. Rebuilding it from "now" every
 * frame left the lamp short of the gate for the whole night.
 */
export function nightSeedFirstShotAt(shotFrac: number | null, shotAt: number, gate: number): number {
  const wait = Math.max(0, gate)
  if (shotFrac == null) return shotAt - wait
  const frac = Math.min(1, Math.max(0, shotFrac))
  return -wait * frac
}

/** Portrait offset for this seed. 0 keeps the unseeded heads. Nearby seeds do not share it. */
export function nightSeedFaceShift(seed: number, pool: number): number {
  const size = Math.max(1, Math.floor(pool) || 1)
  let state = Math.imul(Math.floor(seed) >>> 0, 0x45d9f3b) >>> 0
  state = Math.imul(state ^ (state >>> 16), 0x45d9f3b) >>> 0
  state = (state ^ (state >>> 16)) >>> 0
  return state % size
}

/**
 * How many fixed steps this frame may take, and the leftover to keep.
 * A short frame banks time instead of skipping the wave. A long frame
 * stops at `cap` so a background tab does not simulate the whole night.
 */
export function nightSeedSteps(
  carry: number,
  gameDt: number,
  cap = 12,
): { steps: number; carry: number } {
  const bank = Math.max(0, carry) + Math.max(0, gameDt)
  let steps = Math.floor((bank + 1e-6) / NIGHT_SEED_STEP)
  const limit = Math.max(1, Math.floor(cap))
  if (steps > limit) return { steps: limit, carry: 0 }
  return { steps, carry: bank - steps * NIGHT_SEED_STEP }
}
