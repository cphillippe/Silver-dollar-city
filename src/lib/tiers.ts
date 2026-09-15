import { packLesson } from '../content/packCatalog.ts'
import {
  TIER_LEVEL_UP,
  TIER_POINTS,
  isLessonTier,
  tierFromScore,
  type LessonTierId,
} from '../content/packTypes.ts'
import type { ProgressState } from '../types.ts'

export type { LessonTierId }

const RANK: Record<LessonTierId, number> = { easy: 1, medium: 2, hard: 3 }

export function tierRank(tier: LessonTierId): number {
  return RANK[tier]
}

export function currentLessonTier(
  progress: Pick<ProgressState, 'lessonTier'> | { lessonTier?: Record<string, LessonTierId> },
  id: string,
): LessonTierId {
  const raw = progress.lessonTier?.[id]
  return isLessonTier(raw) ? raw : 'easy'
}

export function bestLessonTier(
  progress: Pick<ProgressState, 'lessonScore'> | { lessonScore?: Record<string, number> },
  id: string,
): LessonTierId | undefined {
  return tierFromScore(progress.lessonScore?.[id])
}

export function lessonPoints(tier: LessonTierId, id?: string): number {
  const spec = id ? packLesson(id)?.[tier] : undefined
  return spec?.points ?? TIER_POINTS[tier]
}

export function needsTierHold(
  progress: Pick<ProgressState, 'lessonScore' | 'lessonTier' | 'easyHeld'>,
  id: string,
): boolean {
  const current = currentLessonTier(progress, id)
  const best = bestLessonTier(progress, id)
  if (!best) return (progress.easyHeld ?? []).includes(id) || current !== 'easy'
  return tierRank(best) < tierRank(current)
}

export function applyHoldSuccess<T extends Pick<ProgressState, 'lessonScore' | 'lessonTier'>>(
  progress: T,
  id: string,
): Pick<ProgressState, 'lessonScore' | 'lessonTier'> {
  const current = currentLessonTier(progress, id)
  const lesson = packLesson(id)
  const spec = lesson?.[current]
  const points = spec?.points ?? TIER_POINTS[current]
  const prior = progress.lessonScore?.[id] ?? 0
  const lessonScore = { ...(progress.lessonScore ?? {}), [id]: Math.max(prior, points) }
  const nextTier = spec?.hold.levelUpTo ?? TIER_LEVEL_UP[current]
  const lessonTier = { ...(progress.lessonTier ?? {}) }
  if (nextTier) lessonTier[id] = nextTier
  else lessonTier[id] = current
  return { lessonScore, lessonTier }
}

export function applyHoldFail<T extends Pick<ProgressState, 'lessonTier'>>(
  progress: T,
  id: string,
): Pick<ProgressState, 'lessonTier'> {
  return { lessonTier: { ...(progress.lessonTier ?? {}), [id]: 'easy' } }
}

export function journalHoldPoints(progress: Pick<ProgressState, 'lessonScore'>): number {
  return Object.values(progress.lessonScore ?? {}).reduce((sum, value) => sum + value, 0)
}

export function journalPoints(
  progress: Pick<ProgressState, 'lessonScore' | 'matchBonus'>,
): number {
  const hold = journalHoldPoints(progress)
  const bonus = Object.values(progress.matchBonus ?? {}).reduce((sum, value) => sum + value, 0)
  return hold + bonus
}

export function journalTierCounts(progress: Pick<ProgressState, 'lessonScore'>): {
  easy: number
  medium: number
  hard: number
} {
  const counts = { easy: 0, medium: 0, hard: 0 }
  for (const score of Object.values(progress.lessonScore ?? {})) {
    const tier = tierFromScore(score)
    if (tier) counts[tier] += 1
  }
  return counts
}

export function scoreFace(score: number | undefined): string {
  const tier = tierFromScore(score)
  if (tier === 'hard') return 'Hard 15'
  if (tier === 'medium') return 'Medium 12'
  if (tier === 'easy') return 'Easy 10'
  return ''
}
