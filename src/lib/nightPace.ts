/**
 * Night Watch pace (1.4.381).
 * The road starts at normal speed. 3× opens on wave 3, after Still and Mend,
 * and stays off until the player taps it on.
 */

export const NIGHT_PACE_NORMAL = 1
export const NIGHT_PACE_FAST = 3

/** Wave index (0-based) when the 3× control opens. One unlock after the skills. */
export const PACE_UNLOCK_WAVE = 2

export type PaceFace = 'locked' | 'open' | 'fast'

export function paceUnlocked(waveIndex: number): boolean {
  return waveIndex >= PACE_UNLOCK_WAVE
}

/** Locked, available at 1×, or running at 3×. A locked wave never runs fast. */
export function paceFace(unlocked: boolean, fastOn: boolean): PaceFace {
  if (!unlocked) return 'locked'
  return fastOn ? 'fast' : 'open'
}

export function paceScale(unlocked: boolean, fastOn: boolean): number {
  return paceFace(unlocked, fastOn) === 'fast' ? NIGHT_PACE_FAST : NIGHT_PACE_NORMAL
}

export function paceRateLabel(face: PaceFace): string {
  return face === 'open' ? '1×' : '3×'
}

export function paceNote(face: PaceFace): string {
  if (face === 'locked') return 'Locked'
  if (face === 'fast') return 'Active'
  return 'Available'
}

export function paceAria(face: PaceFace, unlockWave = PACE_UNLOCK_WAVE): string {
  if (face === 'locked') {
    return `3× speed. Locked until wave ${unlockWave + 1}.`
  }
  if (face === 'fast') return 'Speed 3× active. Tap for normal speed.'
  return 'Speed 1× available. Tap to run at 3×.'
}

/**
 * Cap a wall-clock step, then stretch it. 1× keeps the old 50ms cap.
 * Easy lamps read this same step as their clock (1.4.412). Dividing the
 * cooldown by 3 and comparing it to the wall clock let a slow frame fire
 * the lamps at full 3× while the walkers were still capped.
 */
export function pacedDt(wallDtSec: number, scale: number): number {
  const capped = Math.min(0.05, Math.max(0, wallDtSec))
  const pace = scale === NIGHT_PACE_FAST ? NIGHT_PACE_FAST : NIGHT_PACE_NORMAL
  return capped * pace
}

/** Wall-clock cooldown. Hard still uses this. Easy lamps use `pacedDt` instead. */
export function pacedCooldown(cooldownMs: number, scale: number): number {
  const pace = scale === NIGHT_PACE_FAST ? NIGHT_PACE_FAST : NIGHT_PACE_NORMAL
  return cooldownMs / pace
}
