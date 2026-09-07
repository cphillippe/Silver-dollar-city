import { useEffect, useState } from 'react'
import { getArea, getChallenge } from '../content'
import { evidenceFor } from '../content/evidence'
import { STORY } from '../content/story'
import { localDateKey } from '../lib/dates'
import { isDue } from '../lib/memory'
import { PuzzlePlay } from './PuzzlePlay'
import { RecallGate } from './RecallGate'
import {
  getNextGoal,
  isAreaComplete,
  isAreaUnlocked,
  useProgress,
} from '../store/progress'
import type { View } from '../types'

interface ChallengeScreenProps {
  areaId: string
  challengeId: string
  onNavigate: (view: View) => void
}

export function ChallengeScreen({
  areaId,
  challengeId,
  onNavigate,
}: ChallengeScreenProps) {
  const { completeChallenge, recordReview, markMiss, progress } = useProgress()
  const area = getArea(areaId)
  const challenge = getChallenge(areaId, challengeId)
  const brief = evidenceFor(challengeId)
  const today = localDateKey()
  const replay = Boolean(challenge && progress.completed.includes(challenge.id))
  const [reviewing] = useState(
    Boolean(
      brief &&
        progress.memory[brief.id] &&
        isDue(progress.memory[brief.id], today),
    ),
  )
  const [showNext, setShowNext] = useState(false)
  const [attemptMissed, setAttemptMissed] = useState(false)
  const [attemptPeeked, setAttemptPeeked] = useState(false)
  const [recalled, setRecalled] = useState(false)

  useEffect(() => {
    if (!showNext) return
    const body = document.querySelector('.app-body')
    body?.scrollTo({ top: 0, behavior: 'smooth' })
  }, [showNext])

  if (!area || !challenge) {
    return (
      <main className="page">
        <p>That challenge is not on the trail.</p>
      </main>
    )
  }

  const unlocked = isAreaUnlocked(area.id, progress.completed)
  const index = area.challenges.findIndex((item) => item.id === challenge.id)
  const priorDone = area.challenges
    .slice(0, index)
    .every((item) => progress.completed.includes(item.id))

  if (!unlocked || !priorDone) {
    return (
      <main className="page">
        <p>This challenge is still gated. Return to the district map.</p>
        <button
          type="button"
          className="btn primary"
          onClick={() => onNavigate({ name: 'area', areaId })}
        >
          Back to {area.title}
        </button>
      </main>
    )
  }

  function solved() {
    completeChallenge(areaId, challengeId)
    setShowNext(true)
    if (!brief) {
      setRecalled(true)
      return
    }
    if (!reviewing) {
      recordReview({
        id: brief.id,
        pillar: areaId,
        kind: 'encode',
        today,
        clean: !attemptMissed && !attemptPeeked,
        peeked: attemptPeeked,
        elaborated: false,
      })
    }
  }

  function settleRecall(result: { clean: boolean }) {
    setRecalled(true)
    if (!brief) return
    if (reviewing) {
      recordReview({
        id: brief.id,
        pillar: areaId,
        kind: 'recall',
        today,
        clean: result.clean && !attemptMissed && !attemptPeeked,
        peeked: attemptPeeked,
        elaborated: Boolean(progress.memory[brief.id]?.elaborated),
      })
    }
  }

  function goNext() {
    const latest = {
      ...progress,
      completed: progress.completed.includes(challengeId)
        ? progress.completed
        : [...progress.completed, challengeId],
    }
    const areaNow = getArea(areaId)
    const areaDone = areaNow ? isAreaComplete(areaNow, latest.completed) : false

    if (replay) {
      onNavigate({ name: 'hub' })
      return
    }

    if (areaDone) {
      onNavigate({ name: 'hub' })
      return
    }

    const goal = getNextGoal({ ...latest, started: true })

    if (goal.kind === 'challenge' && goal.areaId && goal.challengeId) {
      onNavigate({
        name: 'challenge',
        areaId: goal.areaId,
        challengeId: goal.challengeId,
      })
      return
    }

    onNavigate({ name: 'hub' })
  }

  const canProceed = showNext && (!brief || recalled)
  const rehearsing = showNext && Boolean(brief) && !recalled
  const areaWillComplete = isAreaComplete(area, [
    ...progress.completed,
    challengeId,
  ])
  const nextTitle = area.challenges[index + 1]?.title

  return (
    <main
      className={`challenge-page ${showNext ? 'is-after' : 'is-puzzle'} ${rehearsing ? 'is-rehearse' : ''}`}
    >
      <button
        type="button"
        className="text-link"
        onClick={() => onNavigate({ name: 'area', areaId })}
      >
        ← {area.title}
      </button>

      {!showNext ? (
        <>
          <h1>{challenge.title}</h1>
          <p className="play-goal">{STORY.playGoal}</p>
          <PuzzlePlay
            challenge={challenge}
            onMiss={() => {
              setAttemptMissed(true)
              markMiss(challenge.id)
            }}
            onPeek={() => setAttemptPeeked(true)}
            onSolved={solved}
          />
        </>
      ) : (
        <section className="after-win">
          {brief && !recalled ? (
            <div className="rehearse-anchor">
              <RecallGate
                brief={brief}
                mode={reviewing ? 'review' : 'encode'}
                kicker={STORY.takeaway}
                onHeld={settleRecall}
              />
            </div>
          ) : null}

          {canProceed ? (
            <div className="after-win-cta">
              <button type="button" className="btn primary xl" onClick={goNext}>
                {replay || areaWillComplete || !nextTitle
                  ? 'See the town'
                  : `Next: ${nextTitle}`}
              </button>
            </div>
          ) : null}
        </section>
      )}
    </main>
  )
}
