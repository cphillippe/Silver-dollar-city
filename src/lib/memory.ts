import { addLocalDays, hashString } from './dates'
import type { MemoryTrace, StarCount } from '../types'

/** Expanding gaps after a successful recall (local calendar days). */
export const SPACE_DAYS = [1, 3, 7, 21] as const

export type ReviewKind = 'encode' | 'recall'

export interface ReviewEvent {
  id: string
  pillar: string
  kind: ReviewKind
  today: string
  clean: boolean
  peeked: boolean
  elaborated: boolean
  text?: string
}

export function emptyTrace(id: string, pillar: string, today: string): MemoryTrace {
  return {
    id,
    pillar,
    intervalIndex: 0,
    nextReviewAt: addLocalDays(today, SPACE_DAYS[0]),
    lastReviewAt: today,
    reviews: 0,
    cleanRecalls: 0,
    elaborated: false,
  }
}

export function isDue(trace: MemoryTrace, today: string): boolean {
  if (trace.lastReviewAt === today) return false
  return trace.nextReviewAt <= today
}

export function dueTraces(
  memory: Record<string, MemoryTrace>,
  today: string,
): MemoryTrace[] {
  return Object.values(memory).filter((trace) => isDue(trace, today))
}

/** Mix pillars: prefer a different district than yesterday’s review. */
export function pickInterleaved(
  due: MemoryTrace[],
  dateKey: string,
  lastPillar?: string,
): MemoryTrace | undefined {
  if (due.length === 0) return undefined
  const mixed = lastPillar
    ? due.filter((trace) => trace.pillar !== lastPillar)
    : due
  const pool = mixed.length > 0 ? mixed : due
  const sorted = [...pool].sort((a, b) =>
    a.pillar === b.pillar ? a.id.localeCompare(b.id) : a.pillar.localeCompare(b.pillar),
  )
  const index = hashString(`silver-city-space:${dateKey}`) % sorted.length
  return sorted[index]
}

export function applySuccess(trace: MemoryTrace, today: string): MemoryTrace {
  const nextIndex = Math.min(SPACE_DAYS.length - 1, trace.intervalIndex + 1)
  return {
    ...trace,
    intervalIndex: nextIndex,
    nextReviewAt: addLocalDays(today, SPACE_DAYS[nextIndex]),
    lastReviewAt: today,
    reviews: trace.reviews + 1,
    cleanRecalls: trace.cleanRecalls + 1,
  }
}

/** A miss brings it back tomorrow — forgetting is why the trail returns. */
export function applyMiss(trace: MemoryTrace, today: string): MemoryTrace {
  const nextIndex = Math.max(0, trace.intervalIndex - 1)
  return {
    ...trace,
    intervalIndex: nextIndex,
    nextReviewAt: addLocalDays(today, 1),
    lastReviewAt: today,
    reviews: trace.reviews + 1,
  }
}

export function masteryFromReview(
  current: StarCount | undefined,
  traceBefore: MemoryTrace | undefined,
  event: ReviewEvent,
  traceAfter: MemoryTrace,
): StarCount {
  let stars: StarCount = current && current >= 1 ? current : 1
  if (event.kind === 'encode') {
    return (stars >= 1 ? stars : 1) as StarCount
  }
  const spaced = Boolean(
    !event.peeked &&
      event.clean &&
      (traceBefore?.lastReviewAt
        ? traceBefore.lastReviewAt < event.today
        : traceBefore
          ? isDue(traceBefore, event.today)
          : false),
  )
  if (spaced) {
    stars = stars >= 2 ? stars : 2
    if (event.elaborated || traceAfter.cleanRecalls >= 2 || traceAfter.elaborated) {
      stars = 3
    }
  }
  return stars
}

export function nextGapLabel(trace: MemoryTrace, today: string): string {
  if (isDue(trace, today)) return 'Due this morning'
  if (trace.nextReviewAt === addLocalDays(today, 1)) return 'Returns tomorrow'
  return `Returns ${trace.nextReviewAt}`
}
