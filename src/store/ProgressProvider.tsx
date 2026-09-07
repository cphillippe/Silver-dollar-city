import { useCallback, useMemo, useState, type ReactNode } from 'react'
import {
  applyMiss,
  applySuccess,
  emptyTrace,
  masteryFromReview,
  type ReviewEvent,
} from '../lib/memory'
import { bestStars, type StarCount } from '../lib/stars'
import { streakAfterPlay } from '../lib/streak'
import type { ProgressState } from '../types'
import {
  cardsUnlockedBy,
  emptyProgress,
  loadProgress,
  ProgressContext,
  saveProgress,
  trailCardsForDays,
  type ProgressApi,
} from './progress'

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [progress, setProgress] = useState<ProgressState>(() => loadProgress())
  const [missed, setMissed] = useState<string[]>([])

  const commit = useCallback((next: ProgressState) => {
    setProgress(next)
    saveProgress(next)
  }, [])

  const start = useCallback(() => {
    setProgress((current) => {
      const next = {
        ...current,
        started: true,
        lastAreaId: current.lastAreaId ?? 'parable-hollow',
      }
      saveProgress(next)
      return next
    })
  }, [])

  const markMiss = useCallback((challengeId: string) => {
    setMissed((current) =>
      current.includes(challengeId) ? current : [...current, challengeId],
    )
  }, [])

  const recordHeld = useCallback((evidenceId: string) => {
    setProgress((current) => {
      if (current.held.includes(evidenceId)) return current
      const next: ProgressState = {
        ...current,
        held: [...current.held, evidenceId],
      }
      saveProgress(next)
      return next
    })
  }, [])

  const recordReview = useCallback((event: ReviewEvent) => {
    let kept: StarCount = 1
    setProgress((current) => {
      const prior = current.memory[event.id]
      const base = prior ?? emptyTrace(event.id, event.pillar, event.today)
      const helped = event.peeked || !event.clean

      let nextTrace = base
      if (event.kind === 'encode') {
        nextTrace = prior
          ? {
              ...base,
              pillar: event.pillar,
              elaborated: base.elaborated || event.elaborated,
            }
          : {
              ...emptyTrace(event.id, event.pillar, event.today),
              elaborated: event.elaborated,
            }
      } else if (helped) {
        nextTrace = applyMiss(base, event.today)
      } else {
        nextTrace = applySuccess(base, event.today)
      }

      nextTrace = {
        ...nextTrace,
        elaborated: nextTrace.elaborated || event.elaborated,
      }

      kept = bestStars(
        current.stars[event.id],
        masteryFromReview(current.stars[event.id], prior, event, nextTrace),
      )
      const next: ProgressState = {
        ...current,
        memory: { ...current.memory, [event.id]: nextTrace },
        stars: { ...current.stars, [event.id]: kept },
        held: current.held.includes(event.id)
          ? current.held
          : [...current.held, event.id],
        lastReviewPillar: event.pillar,
        elaborations: event.text
          ? { ...current.elaborations, [event.id]: event.text }
          : current.elaborations,
      }
      saveProgress(next)
      return next
    })
    return kept
  }, [])

  const recordStars = useCallback((challengeId: string, stars: StarCount) => {
    let kept: StarCount = stars
    setProgress((current) => {
      kept = bestStars(current.stars[challengeId], stars)
      if (current.stars[challengeId] === kept) return current
      const next: ProgressState = {
        ...current,
        stars: { ...current.stars, [challengeId]: kept },
      }
      saveProgress(next)
      return next
    })
    return kept
  }, [])

  const completeChallenge = useCallback(
    (areaId: string, challengeId: string) => {
      const unlocked = cardsUnlockedBy(challengeId)
      setProgress((current) => {
        const already = current.completed.includes(challengeId)
        const next: ProgressState = {
          ...current,
          started: true,
          completed: already
            ? current.completed
            : [...current.completed, challengeId],
          journal: [...new Set([...current.journal, ...unlocked])],
          firstTry:
            already ||
            missed.includes(challengeId) ||
            current.firstTry.includes(challengeId)
              ? current.firstTry
              : [...current.firstTry, challengeId],
          lastAreaId: areaId,
          lastChallengeId: challengeId,
        }
        saveProgress(next)
        return next
      })
      return unlocked
    },
    [missed],
  )

  const completeDaily = useCallback((dateKey: string) => {
    let unlocked: string[] = []
    setProgress((current) => {
      const seenToday = current.dailyDates.includes(dateKey)
      const dates = seenToday
        ? current.dailyDates
        : [...current.dailyDates, dateKey]
      unlocked = trailCardsForDays(dates.length).filter(
        (id) => !current.journal.includes(id),
      )
      const update = streakAfterPlay(
        current.lastDailyDate,
        dateKey,
        current.streak,
      )
      const next: ProgressState = {
        ...current,
        started: true,
        dailyDates: dates,
        lastDailyDate: dateKey,
        streak: update.streak,
        bestStreak: Math.max(current.bestStreak, update.streak),
        journal: [
          ...new Set([...current.journal, ...trailCardsForDays(dates.length)]),
        ],
      }
      saveProgress(next)
      return next
    })
    return unlocked
  }, [])

  const reset = useCallback(() => {
    setMissed([])
    commit(emptyProgress())
  }, [commit])

  const api = useMemo<ProgressApi>(
    () => ({
      progress,
      missed,
      start,
      completeChallenge,
      completeDaily,
      recordStars,
      recordHeld,
      recordReview,
      markMiss,
      reset,
    }),
    [
      completeChallenge,
      completeDaily,
      markMiss,
      missed,
      progress,
      recordHeld,
      recordReview,
      recordStars,
      reset,
      start,
    ],
  )

  return (
    <ProgressContext.Provider value={api}>{children}</ProgressContext.Provider>
  )
}
