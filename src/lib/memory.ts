import { addLocalDays, hashString } from './dates.ts'
import type { MemoryTrace, StarCount } from '../types.ts'

/**
 * Gaps earned by a successful recall (local calendar days).
 * First recall after encode is same-day (nextReviewAt = today), then
 * this ladder: tomorrow’s Daily, then 3 / 7 / 21.
 */
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
    nextReviewAt: today,
    lastReviewAt: today,
    reviews: 0,
    cleanRecalls: 0,
    elaborated: false,
  }
}

export function isDue(trace: MemoryTrace, today: string): boolean {
  if (trace.lastReviewAt === today && trace.reviews > 0) return false
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
  return pickSessionDue(due, dateKey, lastPillar, 1)[0]
}

/** Mix pillars and take at most `cap` — never dump the whole library. */
export function pickSessionDue(
  due: MemoryTrace[],
  dateKey: string,
  lastPillar?: string,
  cap = 3,
): MemoryTrace[] {
  if (due.length === 0 || cap <= 0) return []
  const mixed = lastPillar
    ? due.filter((trace) => trace.pillar !== lastPillar)
    : due
  const pool = mixed.length > 0 ? mixed : due
  const sorted = [...pool].sort((a, b) =>
    a.pillar === b.pillar ? a.id.localeCompare(b.id) : a.pillar.localeCompare(b.pillar),
  )
  const index = hashString(`silver-city-space:${dateKey}`) % sorted.length
  const rotated = [...sorted.slice(index), ...sorted.slice(0, index)]
  const out: MemoryTrace[] = []
  const seen = new Set<string>()
  for (const trace of rotated) {
    if (out.length >= cap) break
    if (seen.has(trace.pillar)) continue
    out.push(trace)
    seen.add(trace.pillar)
  }
  for (const trace of rotated) {
    if (out.length >= cap) break
    if (out.some((item) => item.id === trace.id)) continue
    out.push(trace)
  }
  return out
}

export function recallsDoneToday(
  memory: Record<string, MemoryTrace>,
  today: string,
): number {
  return Object.values(memory).filter(
    (trace) => trace.lastReviewAt === today && trace.reviews > 0,
  ).length
}

export function applySuccess(trace: MemoryTrace, today: string): MemoryTrace {
  const gap = SPACE_DAYS[Math.min(SPACE_DAYS.length - 1, trace.intervalIndex)]
  const nextIndex = Math.min(SPACE_DAYS.length - 1, trace.intervalIndex + 1)
  return {
    ...trace,
    intervalIndex: nextIndex,
    nextReviewAt: addLocalDays(today, gap),
    lastReviewAt: today,
    reviews: trace.reviews + 1,
    cleanRecalls: trace.cleanRecalls + 1,
  }
}

/** Skip without a grade — the line waits until tomorrow. */
export function applySnooze(trace: MemoryTrace, today: string): MemoryTrace {
  return {
    ...trace,
    nextReviewAt: addLocalDays(today, 1),
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

export function nextGapLabel(trace: MemoryTrace, today: string, easy = false): string {
  if (isDue(trace, today)) {
    return trace.reviews === 0
      ? easy
        ? 'Read this again today'
        : 'Dust off today'
      : 'Due this morning'
  }
  if (trace.nextReviewAt === addLocalDays(today, 1)) return 'Returns tomorrow'
  return `Returns ${trace.nextReviewAt}`
}
