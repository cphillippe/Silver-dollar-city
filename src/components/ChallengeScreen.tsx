import { useState } from 'react'
import { areas, getArea, getChallenge, journalForChallenge } from '../content'
import { evidenceFor } from '../content/evidence'
import { guideForArea } from '../content/story'
import { kindLabel } from './icons'
import { PuzzlePlay } from './PuzzlePlay'
import { RecallGate } from './RecallGate'
import { Say } from './Avatar'
import { StarRow } from './StarRow'
import { starsFromAttempt } from '../lib/stars'
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
  const { completeChallenge, recordStars, recordHeld, markMiss, progress } =
    useProgress()
  const area = getArea(areaId)
  const challenge = getChallenge(areaId, challengeId)
  const brief = evidenceFor(challengeId)
  const guide = guideForArea(areaId)
  const replay = Boolean(challenge && progress.completed.includes(challenge.id))
  const [unlockedCards, setUnlockedCards] = useState<string[]>([])
  const [showNext, setShowNext] = useState(false)
  const [attemptMissed, setAttemptMissed] = useState(false)
  const [attemptPeeked, setAttemptPeeked] = useState(false)
  const [earned, setEarned] = useState(progress.stars[challengeId] ?? 0)
  const [lockedIn, setLockedIn] = useState(
    () => Boolean(brief && progress.held.includes(brief.id)),
  )

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
    const stars = starsFromAttempt(attemptMissed, attemptPeeked)
    const best = recordStars(challengeId, stars)
    const cards = completeChallenge(areaId, challengeId)
    setEarned(best)
    setUnlockedCards(cards)
    setShowNext(true)
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
    const goal = getNextGoal({ ...latest, started: true })

    if (replay) {
      onNavigate({ name: 'area', areaId })
      return
    }

    if (areaDone) {
      const following = areas.find((item) => item.order === (areaNow?.order ?? 0) + 1)
      if (following) {
        onNavigate({ name: 'area', areaId: following.id })
        return
      }
      onNavigate({ name: 'vista' })
      return
    }

    if (goal.kind === 'challenge' && goal.areaId && goal.challengeId) {
      onNavigate({
        name: 'challenge',
        areaId: goal.areaId,
        challengeId: goal.challengeId,
      })
      return
    }

    onNavigate({ name: 'area', areaId })
  }

  const card = journalForChallenge(challengeId)
  const bestBefore = progress.stars[challengeId] ?? 0
  const canProceed = !brief || lockedIn

  return (
    <main className="challenge-page">
      <button
        type="button"
        className="text-link"
        onClick={() => onNavigate({ name: 'area', areaId })}
      >
        ← {area.title}
      </button>
      <p className="eyebrow">
        {area.title} · {kindLabel(challenge.kind)}
        {replay ? ' · replay' : ''}
      </p>
      <h1>{challenge.title}</h1>
      <Say
        who={guide.id}
        line="Snap it like a game. Then fold my page and keep the line — that’s the whole walk."
      />
      {bestBefore ? (
        <p className="best-clear">
          Best clear <StarRow count={bestBefore} compact />
        </p>
      ) : null}

      <PuzzlePlay
        challenge={challenge}
        onMiss={() => {
          setAttemptMissed(true)
          markMiss(challenge.id)
        }}
        onPeek={() => setAttemptPeeked(true)}
        onSolved={solved}
      />

      {showNext ? (
        <section className="after-win">
          <div className="burst" aria-hidden>
            <span />
            <span />
            <span />
            <span />
          </div>
          <div className="daily-flourish">
            <StarRow count={earned || 1} />
            <p className="streak-pill">
              {earned === 3
                ? 'Clean solve — no mistakes, no peek.'
                : replay
                  ? 'Replay counted. Best stars are kept.'
                  : 'Nice snap. Now fold the page and rebuild the line.'}
            </p>
          </div>

          {brief && !lockedIn ? (
            <RecallGate
              brief={brief}
              onHeld={() => {
                recordHeld(brief.id)
                setLockedIn(true)
              }}
            />
          ) : null}

          {canProceed && unlockedCards.length > 0 && card ? (
            <article className="unlock-card pop-in">
              <p className="eyebrow">Evidence Journal</p>
              <h2>{card.title}</h2>
              <p>{card.body[0]}</p>
              <button
                type="button"
                className="text-link"
                onClick={() => onNavigate({ name: 'journal', focusId: card.id })}
              >
                Open the full card →
              </button>
            </article>
          ) : null}

          {canProceed ? (
            <button type="button" className="btn primary xl" onClick={goNext}>
              {replay
                ? 'Back to the district'
                : isAreaComplete(area, [...progress.completed, challengeId])
                  ? areas.find((item) => item.order === area.order + 1)
                    ? `Enter ${areas.find((item) => item.order === area.order + 1)?.title}`
                    : 'Stand at the lookout'
                  : `Next: ${area.challenges[index + 1]?.title ?? 'Continue'}`}
            </button>
          ) : null}
        </section>
      ) : null}
    </main>
  )
}
