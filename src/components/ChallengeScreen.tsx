import { useState } from 'react'
import { areas, getArea, getChallenge, journalForChallenge } from '../content'
import { kindLabel } from './icons'
import { BuildArgumentPlay } from './challenges/BuildArgumentPlay'
import { MatchPlay } from './challenges/MatchPlay'
import { SequencePlay } from './challenges/SequencePlay'
import { SortPlay } from './challenges/SortPlay'
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
  const { completeChallenge, markMiss, missed, progress } = useProgress()
  const area = getArea(areaId)
  const challenge = getChallenge(areaId, challengeId)
  const [unlockedCards, setUnlockedCards] = useState<string[]>([])
  const [showNext, setShowNext] = useState(false)
  const [clean, setClean] = useState(false)

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
    const wasClean = !missed.includes(challengeId)
    const cards = completeChallenge(areaId, challengeId)
    setClean(wasClean)
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
      </p>
      <h1>{challenge.title}</h1>

      {challenge.kind === 'sort' ? (
        <SortPlay
          challenge={challenge}
          onMiss={() => markMiss(challenge.id)}
          onSolved={solved}
        />
      ) : null}
      {challenge.kind === 'sequence' ? (
        <SequencePlay
          challenge={challenge}
          onMiss={() => markMiss(challenge.id)}
          onSolved={solved}
        />
      ) : null}
      {challenge.kind === 'build-argument' ? (
        <BuildArgumentPlay
          challenge={challenge}
          onMiss={() => markMiss(challenge.id)}
          onSolved={solved}
        />
      ) : null}
      {challenge.kind === 'match' ? (
        <MatchPlay
          challenge={challenge}
          onMiss={() => markMiss(challenge.id)}
          onSolved={solved}
        />
      ) : null}

      {showNext ? (
        <section className="after-win">
          <div className="burst" aria-hidden>
            <span />
            <span />
            <span />
            <span />
          </div>
          {clean ? <p className="streak-pill">Clean solve · +insight</p> : null}
          {unlockedCards.length > 0 && card ? (
            <article className="unlock-card">
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
          <button type="button" className="btn primary xl" onClick={goNext}>
            {isAreaComplete(area, [...progress.completed, challengeId])
              ? areas.find((item) => item.order === area.order + 1)
                ? `Enter ${areas.find((item) => item.order === area.order + 1)?.title}`
                : 'Stand at the lookout'
              : `Next: ${area.challenges[index + 1]?.title ?? 'Continue'}`}
          </button>
        </section>
      ) : null}
    </main>
  )
}
