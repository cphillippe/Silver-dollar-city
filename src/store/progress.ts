import { createContext, useContext } from 'react'
import { areas, journalEntries, totalChallenges } from '../content'
import type { Area, Challenge, ProgressState } from '../types'

export const STORAGE_KEY = 'silver-city-progress-v1'

export const emptyProgress = (): ProgressState => ({
  started: false,
  completed: [],
  journal: [],
  firstTry: [],
})

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
  kind: 'challenge' | 'area' | 'vista' | 'welcome'
  title: string
  detail: string
  areaId?: string
  challengeId?: string
}

export function getNextGoal(progress: ProgressState): NextGoal {
  if (!progress.started) {
    return {
      kind: 'welcome',
      title: 'Begin in Parable Hollow',
      detail: 'The creek path is open. Stories first — then the longer case.',
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

export function cardsUnlockedBy(challengeId: string): string[] {
  return journalEntries
    .filter((entry) => entry.unlockAfter === challengeId)
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
  return progress.firstTry.length * 3 + progress.completed.length * 2
}

export function completionRatio(progress: ProgressState): number {
  if (totalChallenges === 0) return 0
  return progress.completed.length / totalChallenges
}

export interface ProgressApi {
  progress: ProgressState
  missed: string[]
  start: () => void
  completeChallenge: (areaId: string, challengeId: string) => string[]
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
