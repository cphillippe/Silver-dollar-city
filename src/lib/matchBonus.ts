import type { ProgressState } from '../types.ts'

/** Bill: 100 points for an extra try at the match. Not a Hold tier score. */
export const MATCH_BONUS_POINTS = 100
export const MATCH_MISS_POINTS = 25
export const MATCH_BONUS_MAX = 10_000
export const MATCH_EXTRA_MAX = 20

export function applyMatchBonus<T extends Pick<ProgressState, 'matchBonus' | 'matchExtra'>>(
  progress: T,
  id: string,
): Pick<ProgressState, 'matchBonus' | 'matchExtra'> {
  const prior = progress.matchBonus?.[id] ?? 0
  const extra = progress.matchExtra?.[id] ?? 0
  return {
    matchBonus: {
      ...(progress.matchBonus ?? {}),
      [id]: Math.min(MATCH_BONUS_MAX, prior + MATCH_BONUS_POINTS),
    },
    matchExtra: {
      ...(progress.matchExtra ?? {}),
      [id]: Math.min(MATCH_EXTRA_MAX, extra + 1),
    },
  }
}

/** Wrong swipe on extras — −25, floor 0. Does not touch extras banked or required chips. */
export function applyMatchMiss<T extends Pick<ProgressState, 'matchBonus'>>(
  progress: T,
  id: string,
): Pick<ProgressState, 'matchBonus'> {
  const prior = progress.matchBonus?.[id] ?? 0
  const next = Math.max(0, prior - MATCH_MISS_POINTS)
  const matchBonus = { ...(progress.matchBonus ?? {}) }
  if (next === 0) delete matchBonus[id]
  else matchBonus[id] = next
  return { matchBonus }
}

export function consumeMatchExtra<T extends Pick<ProgressState, 'matchExtra'>>(
  progress: T,
  id: string,
): Pick<ProgressState, 'matchExtra'> {
  const extra = progress.matchExtra?.[id] ?? 0
  const matchExtra = { ...(progress.matchExtra ?? {}) }
  if (extra <= 1) delete matchExtra[id]
  else matchExtra[id] = extra - 1
  return { matchExtra }
}

export function journalBonusPoints(progress: Pick<ProgressState, 'matchBonus'>): number {
  return Object.values(progress.matchBonus ?? {}).reduce((sum, value) => sum + value, 0)
}

export function lineBonusPoints(
  progress: Pick<ProgressState, 'matchBonus'>,
  id: string,
): number {
  return progress.matchBonus?.[id] ?? 0
}

export function lineExtraTries(
  progress: Pick<ProgressState, 'matchExtra'>,
  id: string,
): number {
  return progress.matchExtra?.[id] ?? 0
}

/** Journal / score face — always names the +100 when it happened. */
export function bonusFace(bonus: number | undefined): string {
  if (!bonus) return ''
  return `+${bonus} bonus`
}
