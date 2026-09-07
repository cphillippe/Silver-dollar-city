import { useCallback, useMemo, useState, type ReactNode } from 'react'
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

  const completeDaily = useCallback(
    (dateKey: string, challengeId: string, stars: StarCount) => {
      const alreadyToday = progress.dailyDates.includes(dateKey)
      const nextCount = alreadyToday
        ? progress.dailyDates.length
        : progress.dailyDates.length + 1
      const unlocked = trailCardsForDays(nextCount).filter(
        (id) => !progress.journal.includes(id),
      )

      setProgress((current) => {
        const seenToday = current.dailyDates.includes(dateKey)
        const dates = seenToday
          ? current.dailyDates
          : [...current.dailyDates, dateKey]
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
          journal: [...new Set([...current.journal, ...trailCardsForDays(dates.length)])],
          stars: {
            ...current.stars,
            [challengeId]: bestStars(current.stars[challengeId], stars),
          },
        }
        saveProgress(next)
        return next
      })
      return unlocked
    },
    [progress.dailyDates, progress.journal],
  )

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
      recordStars,
      reset,
      start,
    ],
  )

  return (
    <ProgressContext.Provider value={api}>{children}</ProgressContext.Provider>
  )
}
