import { useEffect, useState } from 'react'
import { getArea, getChallenge, journalForChallenge } from '../content'
import { evidenceFor } from '../content/evidence'
import { guideForArea, STORY } from '../content/story'
import { kindLabel } from './icons'
import { localDateKey } from '../lib/dates'
import { isDue } from '../lib/memory'
import { starLegend, type StarCount } from '../lib/stars'
import { PuzzlePlay } from './PuzzlePlay'
import { Landmark } from './Landmark'
import { RecallGate } from './RecallGate'
import { Say } from './Avatar'
import { StarRow } from './StarRow'
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
  const guide = guideForArea(areaId)
  const today = localDateKey()
  const replay = Boolean(challenge && progress.completed.includes(challenge.id))
  const [reviewing] = useState(
    Boolean(
      brief &&
        progress.memory[brief.id] &&
        isDue(progress.memory[brief.id], today),
    ),
  )
  const [unlockedCards, setUnlockedCards] = useState<string[]>([])
  const [showNext, setShowNext] = useState(false)
  const [attemptMissed, setAttemptMissed] = useState(false)
  const [attemptPeeked, setAttemptPeeked] = useState(false)
  const [earned, setEarned] = useState<StarCount | 0>(progress.stars[challengeId] ?? 0)
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
    const cards = completeChallenge(areaId, challengeId)
    setUnlockedCards(cards)
    setShowNext(true)
    if (!brief) {
      setRecalled(true)
      return
    }
    if (!reviewing) {
      const stars = recordReview({
        id: brief.id,
        pillar: areaId,
        kind: 'encode',
        today,
        clean: !attemptMissed && !attemptPeeked,
        peeked: attemptPeeked,
        elaborated: false,
      })
      setEarned(stars)
    }
  }

  function settleRecall(result: { clean: boolean }) {
    setRecalled(true)
    if (!brief) return
    if (reviewing) {
      const stars = recordReview({
        id: brief.id,
        pillar: areaId,
        kind: 'recall',
        today,
        clean: result.clean && !attemptMissed && !attemptPeeked,
        peeked: attemptPeeked,
        elaborated: Boolean(progress.memory[brief.id]?.elaborated),
      })
      setEarned(stars)
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

  const card = journalForChallenge(challengeId)
  const bestBefore = progress.stars[challengeId] ?? 0
  const canProceed = showNext && (!brief || recalled)
  const rehearsing = showNext && Boolean(brief) && !recalled
  const areaWillComplete = isAreaComplete(area, [
    ...progress.completed,
    challengeId,
  ])

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
      {rehearsing ? (
        <p className="eyebrow">
          {area.title} · Takeaway
          {replay ? ' · replay' : ''}
        </p>
      ) : showNext ? null : (
        <p className="eyebrow">
          {area.title} · {kindLabel(challenge.kind)}
          {replay ? ' · replay' : ''}
          {reviewing ? ' · time to dust off' : ''}
        </p>
      )}
      {showNext && !rehearsing ? null : (
        <h1>{rehearsing ? STORY.tapTakeaway : challenge.title}</h1>
      )}
      {rehearsing || showNext ? null : (
        <>
          <Say
            who={guide.id}
            line={
              reviewing
                ? 'This line has rested. Snap it again — forgetting is why it came back.'
                : 'Snap it like a game. Then fold my page and keep the line — that’s the whole walk.'
            }
          />
          <Landmark pillar={areaId} compact />
          {bestBefore ? (
            <p className="best-clear">
              Stars <StarRow count={bestBefore} compact label={starLegend(bestBefore)} />
              <span className="quiet">{starLegend(bestBefore)}</span>
            </p>
          ) : null}
        </>
      )}

      {!showNext ? (
        <>
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
                kicker={STORY.tapTakeaway}
                onHeld={settleRecall}
              />
            </div>
          ) : null}

          {canProceed ? (
            <div className="after-win-cta">
              <p className="streak-pill">
                {areaWillComplete && !replay
                  ? 'District held — the town rose.'
                  : earned >= 2
                    ? 'Held.'
                    : 'Line locked.'}
              </p>
              <button type="button" className="btn primary xl" onClick={goNext}>
                {replay
                  ? 'See the town'
                  : areaWillComplete
                    ? 'See the town'
                    : `Next: ${area.challenges[index + 1]?.title ?? 'Continue'}`}
              </button>
            </div>
          ) : null}

          {canProceed && unlockedCards.length > 0 && card ? (
            <p className="quiet teaser-inline">{card.title} unsealed.</p>
          ) : null}
        </section>
      )}
    </main>
  )
}
