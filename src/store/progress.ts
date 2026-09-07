import { createContext, useContext } from 'react'
import { dailyForDate } from '../content/daily'
import { evidenceFor } from '../content/evidence'
import {
  areas,
  findPlayable,
  journalEntries,
  journalForChallenge,
  pillarFor,
  totalChallenges,
} from '../content'
import { localDateKey } from '../lib/dates'
import {
  dueTraces,
  emptyTrace,
  nextGapLabel,
  pickInterleaved,
  type ReviewEvent,
} from '../lib/memory'
import { districtMastery, type StarCount } from '../lib/stars'
import { isStreakLive, trailDaysRequired } from '../lib/streak'
import type { Area, Challenge, MemoryTrace, ProgressState, View } from '../types'

export const STORAGE_KEY = 'silver-city-progress-v1'

export const emptyProgress = (): ProgressState => ({
  started: false,
  completed: [],
  journal: [],
  firstTry: [],
  stars: {},
  dailyDates: [],
  streak: 0,
  bestStreak: 0,
  held: [],
  memory: {},
  elaborations: {},
})

function asMemoryMap(value: unknown): Record<string, MemoryTrace> {
  if (!value || typeof value !== 'object') return {}
  const next: Record<string, MemoryTrace> = {}
  for (const [key, raw] of Object.entries(value as Record<string, unknown>)) {
    if (!raw || typeof raw !== 'object') continue
    const item = raw as MemoryTrace
    next[key] = {
      id: typeof item.id === 'string' ? item.id : key,
      pillar: typeof item.pillar === 'string' ? item.pillar : pillarFor(key),
      intervalIndex: typeof item.intervalIndex === 'number' ? item.intervalIndex : 0,
      nextReviewAt: typeof item.nextReviewAt === 'string' ? item.nextReviewAt : localDateKey(),
      lastReviewAt: item.lastReviewAt,
      reviews: typeof item.reviews === 'number' ? item.reviews : 0,
      cleanRecalls: typeof item.cleanRecalls === 'number' ? item.cleanRecalls : 0,
      elaborated: Boolean(item.elaborated),
    }
  }
  return next
}

function asStringMap(value: unknown): Record<string, string> {
  if (!value || typeof value !== 'object') return {}
  const next: Record<string, string> = {}
  for (const [key, raw] of Object.entries(value as Record<string, unknown>)) {
    if (typeof raw === 'string') next[key] = raw
  }
  return next
}

function asStarMap(value: unknown): Record<string, StarCount> {
  if (!value || typeof value !== 'object') return {}
  const next: Record<string, StarCount> = {}
  for (const [key, raw] of Object.entries(value as Record<string, unknown>)) {
    if (raw === 1 || raw === 2 || raw === 3) next[key] = raw
  }
  return next
}

function migrateMemory(parsed: ProgressState): Record<string, MemoryTrace> {
  const memory = asMemoryMap(parsed.memory)
  const today = localDateKey()
  for (const id of parsed.held ?? []) {
    if (memory[id]) continue
    memory[id] = {
      ...emptyTrace(id, pillarFor(id), today),
      nextReviewAt: today,
      lastReviewAt: undefined,
    }
  }
  return memory
}

export function loadProgress(): ProgressState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return emptyProgress()
    const parsed = JSON.parse(raw) as ProgressState
    return {
      started: Boolean(parsed.started),
      completed: Array.isArray(parsed.completed) ? parsed.completed : [],
      journal: Array.isArray(parsed.journal) ? parsed.journal : [],
      firstTry: Array.isArray(parsed.firstTry) ? parsed.firstTry : [],
      lastAreaId: parsed.lastAreaId,
      lastChallengeId: parsed.lastChallengeId,
      stars: asStarMap(parsed.stars),
      dailyDates: Array.isArray(parsed.dailyDates) ? parsed.dailyDates : [],
      lastDailyDate: parsed.lastDailyDate,
      streak: typeof parsed.streak === 'number' ? parsed.streak : 0,
      bestStreak: typeof parsed.bestStreak === 'number' ? parsed.bestStreak : 0,
      held: Array.isArray(parsed.held) ? parsed.held : [],
      memory: migrateMemory(parsed),
      elaborations: asStringMap(parsed.elaborations),
      lastReviewPillar: parsed.lastReviewPillar,
    }
  } catch {
    return emptyProgress()
  }
}

export function saveProgress(state: ProgressState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

export function isAreaComplete(area: Area, completed: string[]): boolean {
  return area.challenges.every((challenge) => completed.includes(challenge.id))
}

export function isAreaUnlocked(areaId: string, completed: string[]): boolean {
  const area = areas.find((item) => item.id === areaId)
  if (!area) return false
  if (area.order === 1) return true
  const previous = areas.find((item) => item.order === area.order - 1)
  return previous ? isAreaComplete(previous, completed) : false
}

export function nextChallengeInArea(
  area: Area,
  completed: string[],
): Challenge | undefined {
  return area.challenges.find((challenge) => !completed.includes(challenge.id))
}

export interface NextGoal {
  kind: 'daily' | 'challenge' | 'area' | 'vista' | 'welcome'
  title: string
  detail: string
  areaId?: string
  challengeId?: string
}

export function dailyDoneToday(
  progress: ProgressState,
  today = localDateKey(),
): boolean {
  return progress.lastDailyDate === today || progress.dailyDates.includes(today)
}

export function morningReview(
  progress: ProgressState,
  today = localDateKey(),
) {
  const due = dueTraces(progress.memory, today).filter(
    (trace) => Boolean(findPlayable(trace.id) && evidenceFor(trace.id)),
  )
  return pickInterleaved(due, today, progress.lastReviewPillar)
}

export function dueForRecall(
  progress: ProgressState,
  today = localDateKey(),
) {
  return dueTraces(progress.memory, today).map((trace) => ({
    trace,
    brief: evidenceFor(trace.id),
    entry:
      journalForChallenge(trace.id) ??
      journalEntries.find((item) => item.id === trace.id),
  }))
}

export function dueCount(progress: ProgressState, today = localDateKey()) {
  return dueTraces(progress.memory, today).length
}

export function getNextGoal(
  progress: ProgressState,
  today = localDateKey(),
): NextGoal {
  if (!dailyDoneToday(progress, today)) {
    const due = morningReview(progress, today)
    return {
      kind: 'daily',
      title: 'Today’s Trail',
      detail: due
        ? 'Time to dust off a page · about a minute'
        : `${dailyForDate(today).challenge.title} · about a minute`,
    }
  }

  if (!progress.started) {
    return {
      kind: 'welcome',
      title: 'Begin in Parable Hollow',
      detail: 'After today’s short walk, the longer trail opens here.',
      areaId: 'parable-hollow',
    }
  }

  for (const area of areas) {
    if (!isAreaUnlocked(area.id, progress.completed)) {
      const previous = areas.find((item) => item.order === area.order - 1)
      return {
        kind: 'area',
        title: `${area.title} is still gated`,
        detail: previous
          ? `Finish every challenge in ${previous.title} to open the path.`
          : 'Keep walking the trail you have.',
        areaId: previous?.id,
      }
    }

    const challenge = nextChallengeInArea(area, progress.completed)
    if (challenge) {
      return {
        kind: 'challenge',
        title: `Next: ${challenge.title}`,
        detail: `${area.title} · ${challenge.kind.replace('-', ' ')}`,
        areaId: area.id,
        challengeId: challenge.id,
      }
    }
  }

  return {
    kind: 'vista',
    title: 'The lookout is yours',
    detail: 'Every area is open. Sit with the journal — or walk a path again.',
  }
}

export function nextRebuildHint(
  progress: ProgressState,
  today = localDateKey(),
): {
  title: string
  detail: string
  cta: string
  go: View
} {
  if (!dailyDoneToday(progress, today)) {
    const due = morningReview(progress, today)
    const playable = due ? findPlayable(due.id) : undefined
    return {
      title: due ? 'Next rebuild' : 'Next walk',
      detail: due
        ? `${playable?.challenge.title ?? 'An older page'} · due this morning · about a minute`
        : `${dailyForDate(today).challenge.title} · today’s trail · about a minute`,
      cta: due ? 'Dust this one off' : 'Walk today’s trail',
      go: { name: 'daily' },
    }
  }

  const upcoming = Object.values(progress.memory)
    .filter((trace) => trace.nextReviewAt > today)
    .sort((a, b) => a.nextReviewAt.localeCompare(b.nextReviewAt))[0]
  const goal = getNextGoal(progress, today)

  if (goal.kind === 'challenge' && goal.areaId && goal.challengeId) {
    const when = upcoming ? nextGapLabel(upcoming, today) : null
    return {
      title: 'Next on the trail',
      detail: when
        ? `${goal.detail}. Next recall: ${upcoming ? findPlayable(upcoming.id)?.challenge.title ?? 'a held line' : ''} · ${when}.`
        : goal.detail,
      cta: 'Open this walk',
      go: {
        name: 'challenge',
        areaId: goal.areaId,
        challengeId: goal.challengeId,
      },
    }
  }

  if (upcoming) {
    const playable = findPlayable(upcoming.id)
    const entry = journalForChallenge(upcoming.id)
    return {
      title: 'Next rebuild',
      detail: `${playable?.challenge.title ?? evidenceFor(upcoming.id)?.claim ?? 'A held line'} · ${nextGapLabel(upcoming, today)}`,
      cta: 'Open the page',
      go: { name: 'journal', focusId: entry?.id ?? upcoming.id },
    }
  }

  if (goal.kind === 'area' && goal.areaId) {
    return {
      title: 'Next on the trail',
      detail: goal.detail,
      cta: goal.title,
      go: { name: 'area', areaId: goal.areaId },
    }
  }

  if (goal.kind === 'vista') {
    return {
      title: 'Next rebuild',
      detail: 'Sit with a journal page, or walk a district again.',
      cta: 'Open the journal',
      go: { name: 'journal' },
    }
  }

  return {
    title: goal.title,
    detail: goal.detail,
    cta: 'Continue',
    go: { name: 'hub' },
  }
}

export function cardsUnlockedBy(challengeId: string): string[] {
  return journalEntries
    .filter((entry) => entry.unlockAfter === challengeId)
    .map((entry) => entry.id)
}

export function trailCardsForDays(days: number): string[] {
  return journalEntries
    .filter((entry) => {
      const need = trailDaysRequired(entry.unlockAfter)
      return need !== null && days >= need
    })
    .map((entry) => entry.id)
}

export function areaProgress(area: Area, completed: string[]): {
  done: number
  total: number
} {
  const done = area.challenges.filter((challenge) =>
    completed.includes(challenge.id),
  ).length
  return { done, total: area.challenges.length }
}

export function insightScore(progress: ProgressState): number {
  const starBonus = Object.values(progress.stars).reduce((sum, n) => sum + n, 0)
  return progress.firstTry.length * 3 + progress.completed.length * 2 + starBonus
}

export function completionRatio(progress: ProgressState): number {
  if (totalChallenges === 0) return 0
  return progress.completed.length / totalChallenges
}

export function journalCompletion(progress: ProgressState): {
  open: number
  total: number
  percent: number
} {
  const total = journalEntries.length
  const open = journalEntries.filter((entry) =>
    progress.journal.includes(entry.id),
  ).length
  return {
    open,
    total,
    percent: total === 0 ? 0 : Math.round((open / total) * 100),
  }
}

export function areaMastery(area: Area, stars: ProgressState['stars']) {
  return districtMastery(
    area.challenges.map((challenge) => challenge.id),
    stars,
  )
}

export function streakCopy(progress: ProgressState, today = localDateKey()): string {
  if (progress.streak <= 0) {
    return 'The trail is open whenever you are.'
  }
  if (dailyDoneToday(progress, today)) {
    return progress.streak === 1
      ? 'A first mark for this morning.'
      : `${progress.streak} mornings in a row — the town remembers your step.`
  }
  if (isStreakLive(progress.lastDailyDate, today)) {
    return `Yesterday’s mark is still warm. Today’s walk is waiting.`
  }
  return 'The trail waits. Your journal marks remain.'
}

export interface ProgressApi {
  progress: ProgressState
  missed: string[]
  start: () => void
  completeChallenge: (areaId: string, challengeId: string) => string[]
  completeDaily: (dateKey: string) => string[]
  recordStars: (challengeId: string, stars: StarCount) => StarCount
  recordHeld: (evidenceId: string) => void
  recordReview: (event: ReviewEvent) => StarCount
  markMiss: (challengeId: string) => void
  reset: () => void
}

export const ProgressContext = createContext<ProgressApi | null>(null)

export function useProgress(): ProgressApi {
  const value = useContext(ProgressContext)
  if (!value) {
    throw new Error('useProgress must be used within ProgressProvider')
  }
  return value
}
