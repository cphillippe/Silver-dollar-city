import type { ProgressState } from '../types.ts'

/** Bill: 100 points for an extra try at the match. Not a Hold tier score. */
export const MATCH_BONUS_POINTS = 100
/** Story word (one of the lesson's own related words). Same as the classic bonus. */
export const MATCH_STORY_POINTS = MATCH_BONUS_POINTS
/** Any other real word on the board. */
export const MATCH_GENERIC_POINTS = 50
export const MATCH_MISS_POINTS = 25
/** Bill: unlock/collapse of Match story strip — arcade +1000. */
export const MATCH_DOCK_JUICE_POINTS = 1000
export const MATCH_BONUS_MAX = 10_000
export const MATCH_EXTRA_MAX = 20
export const MATCH_LIFETIME_MAX = 10_000_000

type Lifetime = Pick<ProgressState, 'matchLifetime'>

function lifetimeAfter(progress: Partial<Lifetime>, add: number): number {
  return Math.min(MATCH_LIFETIME_MAX, (progress.matchLifetime ?? 0) + add)
}

export function applyMatchBonus<T extends Pick<ProgressState, 'matchBonus' | 'matchExtra'> & Partial<Lifetime>>(
  progress: T,
  id: string,
  points: number = MATCH_BONUS_POINTS,
): Pick<ProgressState, 'matchBonus' | 'matchExtra' | 'matchLifetime'> {
  const add = Math.max(0, Math.floor(points))
  const prior = progress.matchBonus?.[id] ?? 0
  const extra = progress.matchExtra?.[id] ?? 0
  return {
    matchBonus: {
      ...(progress.matchBonus ?? {}),
      [id]: Math.min(MATCH_BONUS_MAX, prior + add),
    },
    matchExtra: {
      ...(progress.matchExtra ?? {}),
      [id]: Math.min(MATCH_EXTRA_MAX, extra + 1),
    },
    matchLifetime: lifetimeAfter(progress, add),
  }
}

/** Story strip hero→dock collapse — +1000 arcade juice, no extra try. */
export function applyMatchDockJuice<T extends Pick<ProgressState, 'matchBonus'> & Partial<Lifetime>>(
  progress: T,
  id: string,
): Pick<ProgressState, 'matchBonus' | 'matchLifetime'> {
  const prior = progress.matchBonus?.[id] ?? 0
  return {
    matchBonus: {
      ...(progress.matchBonus ?? {}),
      [id]: Math.min(MATCH_BONUS_MAX, prior + MATCH_DOCK_JUICE_POINTS),
    },
    matchLifetime: lifetimeAfter(progress, MATCH_DOCK_JUICE_POINTS),
  }
}

/** Required-word find juice — persists the on-board +N pop into matchBonus (account score). */
export function applyMatchFind<T extends Pick<ProgressState, 'matchBonus'> & Partial<Lifetime>>(
  progress: T,
  id: string,
  points: number,
): Pick<ProgressState, 'matchBonus' | 'matchLifetime'> {
  const add = Math.max(0, Math.floor(points))
  if (!add) {
    return { matchBonus: { ...(progress.matchBonus ?? {}) }, matchLifetime: progress.matchLifetime ?? 0 }
  }
  const prior = progress.matchBonus?.[id] ?? 0
  return {
    matchBonus: {
      ...(progress.matchBonus ?? {}),
      [id]: Math.min(MATCH_BONUS_MAX, prior + add),
    },
    matchLifetime: lifetimeAfter(progress, add),
  }
}

/** Wrong swipe on extras — −25, floor 0. Does not touch extras banked, required chips, or the Gem Jar. */
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

export function applyJarSeen<T extends Partial<Pick<ProgressState, 'matchSkillSeen'>>>(
  progress: T,
  step: number,
): Pick<ProgressState, 'matchSkillSeen'> {
  return { matchSkillSeen: Math.max(progress.matchSkillSeen ?? 0, Math.max(0, Math.min(3, Math.floor(step)))) }
}
