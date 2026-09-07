import { useEffect, useState } from 'react'
import { areas, getArea, getChallenge, journalForChallenge } from '../content'
import { evidenceFor } from '../content/evidence'
import { guideForArea } from '../content/story'
import { kindLabel } from './icons'
import { localDateKey } from '../lib/dates'
import { isDue } from '../lib/memory'
import { starLegend, type StarCount } from '../lib/stars'
import { PuzzlePlay } from './PuzzlePlay'
import { Landmark } from './Landmark'
import { RecallGate } from './RecallGate'
import { SayBack } from './SayBack'
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
  const [recallClean, setRecallClean] = useState(true)
  const [earned, setEarned] = useState<StarCount | 0>(progress.stars[challengeId] ?? 0)
  const [recalled, setRecalled] = useState(false)
  const [said, setSaid] = useState(false)

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

  function commitMemory(elaborated: boolean, text?: string, clean = recallClean) {
    if (!brief) {
      setSaid(true)
      return
    }
    const stars = recordReview({
      id: brief.id,
      pillar: areaId,
      kind: reviewing ? 'recall' : 'encode',
      today,
      clean: clean && !attemptMissed && !attemptPeeked,
      peeked: attemptPeeked,
      elaborated,
      text,
    })
    setEarned(stars)
    setSaid(true)
  }

  function solved() {
    const cards = completeChallenge(areaId, challengeId)
    setUnlockedCards(cards)
    setShowNext(true)
    if (!brief) {
      setRecalled(true)
      setSaid(true)
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
    setRecallClean(result.clean)
    setRecalled(true)
    if (brief && progress.memory[brief.id]?.elaborated) {
      commitMemory(true, undefined, result.clean)
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
  const canProceed = showNext && (!brief || (recalled && said))
  const rehearsing = showNext && Boolean(brief) && !recalled

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
          {area.title} · Rehearse this
          {replay ? ' · replay' : ''}
        </p>
      ) : (
        <p className="eyebrow">
          {area.title} · {kindLabel(challenge.kind)}
          {replay ? ' · replay' : ''}
          {reviewing ? ' · time to dust off' : ''}
        </p>
      )}
      <h1>{rehearsing ? 'Rehearse this' : challenge.title}</h1>
      {rehearsing ? null : (
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
        <PuzzlePlay
          challenge={challenge}
          onMiss={() => {
            setAttemptMissed(true)
            markMiss(challenge.id)
          }}
          onPeek={() => setAttemptPeeked(true)}
          onSolved={solved}
        />
      ) : (
        <section className="after-win">
          {brief && !recalled ? (
            <div className="rehearse-anchor">
              <p className="quiet">
                Folded. Tap the claim, then the reason — that’s the line that should stick.
              </p>
              <RecallGate
                brief={brief}
                mode={reviewing ? 'review' : 'encode'}
                kicker="Rehearse this"
                onHeld={settleRecall}
              />
            </div>
          ) : null}

          {brief && recalled && !said ? (
            <SayBack brief={brief} onDone={(result) => commitMemory(result.elaborated, result.text)} />
          ) : null}

          {canProceed ? (
            <div className="daily-flourish">
              <StarRow
                count={earned || 1}
                label={starLegend(earned || 1)}
              />
              <p className="streak-pill">
                {earned >= 3
                  ? 'Held after a rest, and said back.'
                  : earned === 2
                    ? 'Held after a rest.'
                    : reviewing
                      ? 'Time to dust off this one — then it can rest again.'
                      : '1★ first walk. A later morning will ask this line back.'}
              </p>
            </div>
          ) : null}

          {canProceed && unlockedCards.length > 0 && card ? (
            <article className="unlock-card pop-in">
              <p className="eyebrow">Evidence Journal</p>
              <h2>{card.title}</h2>
              <p>{card.body[0]}</p>
              <button
                type="button"
                className="text-link"
                onClick={() => onNavigate({ name: 'journal', focusId: card.id, autoQuiz: true })}
              >
                Rehearse this page →
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
      )}
    </main>
  )
}
