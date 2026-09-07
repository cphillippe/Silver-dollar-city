import { useEffect, useState } from 'react'
import { getArea, getChallenge } from '../content'
import { evidenceFor } from '../content/evidence'
import { STORY, townVoiceForArea } from '../content/story'
import { localDateKey } from '../lib/dates'
import { useJuiceHandoff } from '../lib/juice'
import { isDue } from '../lib/memory'
import { PuzzlePlay } from './PuzzlePlay'
import { RecallGate } from './RecallGate'
import { TownReturn } from './TownReturn'
import {
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
  const [reviewing] = useState(
    Boolean(
      brief &&
        progress.memory[brief.id] &&
        isDue(progress.memory[brief.id], today),
    ),
  )
  const { juiceDone: showNext, afterJuice } = useJuiceHandoff()
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
    afterJuice()
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
    onNavigate({ name: 'hub' })
  }

  const canProceed = showNext && (!brief || recalled)
  const rehearsing = showNext && Boolean(brief) && !recalled
  const voice = townVoiceForArea(areaId)

  return (
    <main
      className={`challenge-page ${showNext ? 'is-after' : 'is-puzzle'} ${rehearsing ? 'is-rehearse' : ''}`}
      aria-label={STORY.playGoal}
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
          <h1 className="puzzle-title">{challenge.title}</h1>
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
                kicker={STORY.tapTakeaway}
                onHeld={settleRecall}
              />
            </div>
          ) : null}

          {canProceed ? (
            <TownReturn
              who={voice.who}
              line={voice.afterWin}
              action="See the town"
              onGo={goNext}
            />
          ) : null}
        </section>
      )}
    </main>
  )
}
