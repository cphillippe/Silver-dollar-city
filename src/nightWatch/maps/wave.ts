import type { EasyRound } from '../rounds.ts'
import {
  easyWalkerHp,
  nightTune,
  scaledWalkerHp,
  type NightTune,
  type WalkerGait,
} from '../walkers.ts'

/**
 * Extra wave knobs on a maze map. Missing on A2.
 * `rules` stays `maze-v1`. These fields sit beside it.
 */
export interface NightWave {
  /** Walker count multiplier on rounds 1–6. */
  countMulEarly: number
  /** Walker count multiplier from `countFrom` on. */
  countMul: number
  /** First round (1-based) that uses `countMul`. */
  countFrom: number
  /** Applied after the map health multiplier. Round half up, minimum 1. Bosses skip it. */
  hpScale: number
  /** Fractions of the late bulk at the first rounds it exists. Later rounds take the full bulk. */
  bulkRamp: readonly number[]
  /** Walkers on the road at once. A2 stays at 3. */
  liveCap: number
  /** Multiplier on the spawn gap. Below 1 comes sooner. */
  spawnMul: number
  /** How many walkers one spawn sends. `perRoad` is one per road. */
  pack: number
  /** A pop pays this much of its spark, banked and rounded down. */
  sparkMul: number
}

let boundWave: NightWave | null = null

export function bindNightWave(wave: NightWave | null): void {
  boundWave = wave
}

export function boundNightWave(): NightWave | null {
  return boundWave
}

function finite(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback
}

/** Read `difficulty.wave`. A missing object is A2: no extra walkers. */
export function waveFromPack(raw: unknown, roads: number): NightWave | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null
  const row = raw as Record<string, unknown>
  const ramp = Array.isArray(row.bulkRamp)
    ? row.bulkRamp.filter((part): part is number => typeof part === 'number' && Number.isFinite(part))
    : []
  const pack =
    row.pack === 'perRoad'
      ? Math.max(1, Math.floor(roads) || 1)
      : Math.max(1, Math.floor(finite(row.pack, 1)) || 1)
  return {
    countMulEarly: finite(row.countMulEarly, 1),
    countMul: finite(row.countMul, 1),
    countFrom: Math.max(1, Math.floor(finite(row.countFrom, 7)) || 7),
    hpScale: finite(row.hpScale, 1),
    bulkRamp: ramp,
    liveCap: Math.max(1, Math.floor(finite(row.liveCap, 3)) || 3),
    spawnMul: finite(row.spawnMul, 1),
    pack,
    sparkMul: finite(row.sparkMul, 1),
  }
}

/**
 * More walkers. Tough keeps the count it already has.
 * Fast grows with the same multiplier, and never past the new count.
 */
export function waveRound(round: EasyRound, roundIndex: number, wave: NightWave): EasyRound {
  const at = Math.floor(roundIndex) + 1
  const mul = at >= wave.countFrom ? wave.countMul : wave.countMulEarly
  const count = Math.max(0, Math.ceil(round.count * mul - 1e-9))
  const fast = Math.min(count, Math.ceil(round.fast * mul))
  const tough = Math.min(count, round.tough)
  return { ...round, count, fast, tough }
}

/**
 * Maze health for one walker.
 * The late bulk arrives as the ramp (35% then 70%) and is full after that.
 * `hpScale` is last. Omit `wave` and this is the A2 number.
 */
export function waveWalkerHp(
  kindHp: number,
  roundBonus: number,
  gait: WalkerGait | undefined,
  roundIndex: number,
  tune: NightTune = nightTune(),
  hpMul = 1,
  wave: NightWave | null = null,
): number {
  let raw = easyWalkerHp(kindHp, roundBonus, gait, roundIndex, tune)
  if (wave && gait !== 'fast' && wave.bulkRamp.length > 0) {
    const at = Math.floor(roundIndex) + 1
    const step = at - tune.bulkFrom
    if (step >= 0 && step < wave.bulkRamp.length) {
      raw = raw - tune.bulk + Math.trunc(tune.bulk * wave.bulkRamp[step])
    }
  }
  let hp = scaledWalkerHp(raw, hpMul)
  if (wave && wave.hpScale > 0 && wave.hpScale !== 1) {
    hp = Math.max(1, Math.round(hp * wave.hpScale))
  }
  return hp
}
