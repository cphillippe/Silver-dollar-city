import { createContext, useContext } from 'react'
import { dailyForDate } from '../content/daily'
import { evidenceFor } from '../content/evidence'
import { STORY } from '../content/story'
import {
  areas,
  findPlayable,
  journalEntries,
  journalForChallenge,
  pillarFor,
  totalChallenges,
} from '../content'
import { isEasy } from '../lib/easy'
import { localDateKey } from '../lib/dates'
import { dueTraces, nextGapLabel, type ReviewEvent } from '../lib/memory'
import { sessionDue, type RecallLaterState } from '../lib/recall'
import {
  emptyProgress,
  loadSave,
  persistSave,
  STORAGE_KEY,
  type SaveMeta,
} from '../lib/save'
import { districtMastery, type StarCount } from '../lib/stars'
import { isStreakLive, trailDaysRequired } from '../lib/streak'
import type { AppTheme, Area, Challenge, ProgressState, View } from '../types'
import type { CityPlotId } from '../lib/city'

export { STORAGE_KEY, emptyProgress }
export type { SaveMeta }

export function loadProgress(): ProgressState {
  return loadAppSave().progress
}

export function loadSaveMeta(): SaveMeta {
  return loadAppSave().meta
}

export function loadAppSave(): { progress: ProgressState; meta: SaveMeta } {
  const loaded = loadSave()
  const progress = withPillars(loaded.progress)
  return { progress, meta: loaded.meta }
}

function withPillars(progress: ProgressState): ProgressState {
  const memory = { ...progress.memory }
  let changed = false
  for (const [id, trace] of Object.entries(memory)) {
    if (!trace.pillar || trace.pillar === 'unspecified') {
      memory[id] = { ...trace, pillar: pillarFor(id) }
      changed = true
    }
  }
  return changed ? { ...progress, memory } : progress
}

export function saveProgress(state: ProgressState): SaveMeta {
  return persistSave(state)
}

export function isAreaComplete(area: Area, completed: string[]): boolean {
  return area.challenges.every((challenge) => completed.includes(challenge.id))
}

/** Witness Square opens after this many Story Creek walks — Unpayable can wait. */
export const HOLLOW_WALKS_TO_WITNESS = 2

export function hollowWalksDone(completed: string[]): number {
  const hollow = areas.find((item) => item.id === 'parable-hollow')
  if (!hollow) return 0
  return hollow.challenges.filter((challenge) => completed.includes(challenge.id))
    .length
}

export function areaGateCopy(areaId: string, completed: string[], easy = false): string {
  if (areaId === 'witness-bench') {
    const have = hollowWalksDone(completed)
    return easy
      ? `This street is locked. Finish 2 Jesus stories at the creek (${have}/2), then the square opens.`
      : `Walk ${HOLLOW_WALKS_TO_WITNESS} scenes in Story Creek (${have}/${HOLLOW_WALKS_TO_WITNESS}) — then Silas. Unpayable can wait.`
  }
  const area = areas.find((item) => item.id === areaId)
  const previous = area
    ? areas.find((item) => item.order === area.order - 1)
    : undefined
  if (previous) {
    return easy
      ? `This street is locked. Finish ${previous.title} first, then this lot opens.`
      : `Finish ${previous.title}, then the path opens.`
  }
  return easy ? 'This street is locked. Finish the walk before it first.' : 'This gate is still closed.'
}

export function isAreaUnlocked(areaId: string, completed: string[]): boolean {
  const area = areas.find((item) => item.id === areaId)
  if (!area) return false
  if (area.order === 1) return true
  const previous = areas.find((item) => item.order === area.order - 1)
  if (!previous) return false
  if (area.id === 'witness-bench') {
    return hollowWalksDone(completed) >= HOLLOW_WALKS_TO_WITNESS
  }
  return isAreaComplete(previous, completed)
}

/** Area to walk when this lot is still gated. */
export function gateWalkArea(areaId: string): string {
  if (areaId === 'witness-bench') return 'parable-hollow'
  const area = areas.find((item) => item.id === areaId)
  const previous = area
    ? areas.find((item) => item.order === area.order - 1)
    : undefined
  return previous?.id ?? areaId
}

export function nextChallengeInArea(
  area: Area,
  completed: string[],
): Challenge | undefined {
  return area.challenges.find((challenge) => !completed.includes(challenge.id))
}

/** Skip the district essay — glowing roof goes straight into the next walk. */
export function nextWalkView(areaId: string, completed: string[]): View {
  const area = areas.find((item) => item.id === areaId)
  if (!area) return { name: 'hub' }
  const challenge = nextChallengeInArea(area, completed)
  if (challenge) {
    return { name: 'challenge', areaId: area.id, challengeId: challenge.id }
  }
  return { name: 'area', areaId: area.id }
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
  later?: RecallLaterState,
) {
  return sessionDue(progress, today, later)[0]
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
    return {
      kind: 'daily',
      title: 'Today’s Trail',
      detail: `${dailyForDate(today, progress.dailyDates.filter((d) => d !== today).length).challenge.title} · about a minute`,
    }
  }

  if (!progress.started) {
    return {
      kind: 'welcome',
      title: 'Begin in Story Creek',
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
        detail: areaGateCopy(area.id, progress.completed),
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
    detail: isEasy(progress)
      ? 'Every area is open. Sit with the journal — or choose a sentence to remember.'
      : 'Every area is open. Sit with the journal — or rehearse a takeaway.',
  }
}

function journalFocusForTrace(id: string) {
  return journalForChallenge(id)?.id ?? journalEntries.find((entry) => entry.id === id)?.id ?? id
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
  const due = sessionDue(progress, today)
    .map((trace) => ({
      trace,
      brief: evidenceFor(trace.id),
      entry:
        journalForChallenge(trace.id) ??
        journalEntries.find((item) => item.id === trace.id),
    }))
    .find((item) => item.brief)
  if (due) {
    const claim = due.brief?.claim ?? due.entry?.title ?? 'A held line'
    const go = {
      name: 'journal' as const,
      focusId: due.entry?.id ?? journalFocusForTrace(due.trace.id),
      autoQuiz: true,
    }
    if (isEasy(progress)) {
      return {
        title: 'Choose the sentence to remember.',
        detail: `${claim} · due this morning`,
        cta: 'Choose the sentence to remember.',
        go,
      }
    }
    return {
      title: STORY.tapTakeaway,
      detail: `${claim} · due this morning`,
      cta: STORY.tapTakeaway,
      go,
    }
  }

  if (!dailyDoneToday(progress, today)) {
    return {
      title: isEasy(progress) ? 'Read today’s story.' : 'Next walk',
      detail: isEasy(progress)
        ? `${dailyForDate(today, progress.dailyDates.filter((d) => d !== today).length).challenge.title} · today’s trail`
        : `${dailyForDate(today, progress.dailyDates.filter((d) => d !== today).length).challenge.title} · today’s trail · fold, then rehearse the claim`,
      cta: isEasy(progress) ? 'Read today’s story.' : 'Walk today’s trail',
      go: { name: 'daily' },
    }
  }

  const upcoming = Object.values(progress.memory)
    .filter((trace) => trace.nextReviewAt > today)
    .sort((a, b) => a.nextReviewAt.localeCompare(b.nextReviewAt))[0]
  const goal = getNextGoal(progress, today)

  if (upcoming) {
    const brief = evidenceFor(upcoming.id)
    return {
      title: isEasy(progress) ? 'Choose the sentence to remember.' : STORY.tapTakeaway,
      detail: `${brief?.claim ?? findPlayable(upcoming.id)?.challenge.title ?? 'A held line'} · ${nextGapLabel(upcoming, today)}`,
      cta: isEasy(progress) ? 'Choose the sentence to remember.' : STORY.tapTakeaway,
      go: {
        name: 'journal',
        focusId: journalFocusForTrace(upcoming.id),
        autoQuiz: true,
      },
    }
  }

  if (goal.kind === 'challenge' && goal.areaId && goal.challengeId) {
    return {
      title: 'Next on the trail',
      detail: goal.detail,
      cta: 'Open this walk',
      go: {
        name: 'challenge',
        areaId: goal.areaId,
        challengeId: goal.challengeId,
      },
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
      detail: isEasy(progress)
        ? 'Sit with a journal page, or choose a sentence to remember.'
        : 'Sit with a journal page, or rehearse a takeaway.',
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

function matchesRehearseScope(
  scope: string | undefined,
  id: string,
  entryArea?: string,
  pillar?: string,
) {
  const place = pillar || pillarFor(id)
  if (!scope || scope === 'porch' || scope === 'daily-trail') {
    return id.startsWith('daily-') || entryArea === 'daily-trail'
  }
  return place === scope || entryArea === scope
}

/** Due first, else a held line — never a vague replay. */
export function rehearseGo(
  progress: ProgressState,
  scope?: string,
  today = localDateKey(),
): View {
  const dueItems = dueForRecall(progress, today).filter((item) => item.brief)
  const due =
    dueItems.find((item) =>
      matchesRehearseScope(
        scope,
        item.trace.id,
        item.entry?.areaId,
        item.trace.pillar,
      ),
    ) ?? (scope && scope !== 'porch' && scope !== 'daily-trail' ? undefined : dueItems[0])

  if (due) {
    return {
      name: 'journal',
      focusId: due.entry?.id ?? due.trace.id,
      autoQuiz: true,
    }
  }

  const heldNewest = [...progress.held].reverse()
  const held =
    heldNewest.find((id) =>
      matchesRehearseScope(
        scope,
        id,
        journalForChallenge(id)?.areaId,
        progress.memory[id]?.pillar,
      ),
    ) ?? (scope && scope !== 'porch' && scope !== 'daily-trail' ? undefined : heldNewest[0])

  if (held) {
    return {
      name: 'journal',
      focusId: journalFocusForTrace(held),
      autoQuiz: true,
    }
  }

  if (scope && scope !== 'porch' && scope !== 'daily-trail') {
    const page = journalEntries.find(
      (entry) => entry.areaId === scope && progress.journal.includes(entry.id),
    )
    if (page) {
      return { name: 'journal', focusId: page.id, autoQuiz: true }
    }
  }

  return { name: 'journal' }
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
  saveMeta: SaveMeta
  missed: string[]
  start: () => void
  completeChallenge: (areaId: string, challengeId: string) => string[]
  completeDaily: (dateKey: string) => string[]
  recordStars: (challengeId: string, stars: StarCount) => StarCount
  recordHeld: (evidenceId: string) => void
  recordReview: (event: ReviewEvent) => StarCount
  snoozeReviews: (ids: string[], today: string) => void
  markMiss: (challengeId: string) => void
  recordNight: (dateKey: string) => void
  setTheme: (theme: AppTheme) => void
  setEasyMode: (easy: boolean) => void
  upgradeBuilding: (id: CityPlotId) => void
  reset: () => void
  importSaveText: (raw: string) => { ok: true } | { ok: false; error: string }
}

export const ProgressContext = createContext<ProgressApi | null>(null)

export function useProgress(): ProgressApi {
  const value = useContext(ProgressContext)
  if (!value) {
    throw new Error('useProgress must be used within ProgressProvider')
  }
  return value
}
