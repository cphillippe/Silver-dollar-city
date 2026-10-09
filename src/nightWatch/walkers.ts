import type { EasyRound } from './rounds.ts'

/**
 * Easy walker gaits (1.4.411, slice 1 of #604).
 * Plain walkers keep the round's own pace and health.
 * Fast is low health and a quicker step, so a longer reach catches them.
 * Tough is slow and thick, so a harder shot brings them down, and the kill pays more.
 * A third gait is not in this slice. Hard does not read this.
 */
export type WalkerGait = 'plain' | 'fast' | 'tough'

/** Multiplier on the round's walk speed. */
export const FAST_PACE = 1.75
/** Fast ignores the round's health bonus and stays this short. */
export const FAST_HP = 2
/** Multiplier on the round's walk speed. */
export const TOUGH_PACE = 0.88
/** Added on top of kind HP and the round's health bonus. */
export const TOUGH_HP_BONUS = 16
/** Sparks for turning a tough walker. Plain and fast still pay one. */
export const TOUGH_SPARK = 2

export function walkerPace(gait: WalkerGait | undefined): number {
  if (gait === 'fast') return FAST_PACE
  if (gait === 'tough') return TOUGH_PACE
  return 1
}

/** Kind HP plus the round bonus, then the gait. Fast stays at FAST_HP. */
export function walkerHp(kindHp: number, roundBonus: number, gait: WalkerGait | undefined): number {
  const kind = Math.max(1, Math.floor(kindHp) || 1)
  const bonus = Math.max(0, Math.floor(roundBonus) || 0)
  if (gait === 'fast') return FAST_HP
  if (gait === 'tough') return kind + bonus + TOUGH_HP_BONUS
  return kind + bonus
}

export function walkerSpark(gait: WalkerGait | undefined): number {
  return gait === 'tough' ? TOUGH_SPARK : 1
}

/** One spark per walker, plus one extra for each tough walker in the round. */
export function roundSparkPay(round: Pick<EasyRound, 'count' | 'fast' | 'tough'>): number {
  const count = Math.max(0, Math.floor(round.count) || 0)
  const tough = Math.max(0, Math.min(count, Math.floor(round.tough) || 0))
  return count + tough * (TOUGH_SPARK - 1)
}

/**
 * Spread the specials through the round so they are not one clump at the gate.
 * Tough is placed first. Fast fills plain slots after that.
 */
export function gaitPlan(round: Pick<EasyRound, 'count' | 'fast' | 'tough'>): WalkerGait[] {
  const count = Math.max(0, Math.floor(round.count) || 0)
  const plan: WalkerGait[] = Array.from({ length: count }, () => 'plain')
  const place = (want: number, gait: WalkerGait, salt: number) => {
    let left = Math.max(0, Math.min(count, Math.floor(want) || 0))
    if (left === 0) return
    const open = plan.filter((slot) => slot === 'plain').length
    left = Math.min(left, open)
    const stride = count / left
    let guard = 0
    let step = 0
    while (left > 0 && guard < count * 3) {
      const slot = Math.min(count - 1, Math.floor(salt + step * stride)) % count
      if (plan[slot] === 'plain') {
        plan[slot] = gait
        left -= 1
      }
      step += 1
      guard += 1
    }
  }
  place(round.tough, 'tough', 0)
  place(round.fast, 'fast', Math.max(1, Math.floor(count / 3)))
  return plan
}

export function gaitForSlot(
  round: Pick<EasyRound, 'count' | 'fast' | 'tough'>,
  slot: number,
): WalkerGait {
  const plan = gaitPlan(round)
  const index = Math.max(0, Math.floor(slot) || 0)
  return plan[index] ?? 'plain'
}
