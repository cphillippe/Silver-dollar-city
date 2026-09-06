import { useCallback, useMemo, useState, type ReactNode } from 'react'
import type { ProgressState } from '../types'
import {
  cardsUnlockedBy,
  emptyProgress,
  loadProgress,
  ProgressContext,
  saveProgress,
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
      markMiss,
      reset,
    }),
    [completeChallenge, markMiss, missed, progress, reset, start],
  )

  return (
    <ProgressContext.Provider value={api}>{children}</ProgressContext.Provider>
  )
}
