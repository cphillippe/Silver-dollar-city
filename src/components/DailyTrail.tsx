import { useEffect, useState } from 'react'
import { findPlayable, pillarFor } from '../content'
import { dailyForDate } from '../content/daily'
import { evidenceFor } from '../content/evidence'
import { STORY, townVoice } from '../content/story'
import { localDateKey } from '../lib/dates'
import { PuzzlePlay } from './PuzzlePlay'
import { RecallGate } from './RecallGate'
import { TownReturn } from './TownReturn'
import {
  dailyDoneToday,
  morningReview,
  useProgress,
} from '../store/progress'
import type { View } from '../types'

interface DailyTrailProps {
  onNavigate: (view: View) => void
}

export function DailyTrail({ onNavigate }: DailyTrailProps) {
  const { completeDaily, recordReview, progress } = useProgress()
  const now = new Date()
  const today = localDateKey(now)
  const morningsBefore = progress.dailyDates.filter((d) => d !== today).length

  const [session] = useState(() => {
    const already = dailyDoneToday(progress, today)
    const due = already ? undefined : morningReview(progress, today)
    const reviewBrief = due ? evidenceFor(due.id) : undefined
    const isReview = Boolean(due && reviewBrief)
    const fresh = dailyForDate(today, morningsBefore)
    const playable =
      due && isReview
        ? findPlayable(due.id)
        : {
            areaId: pillarFor(fresh.challenge.id),
            challenge: fresh.challenge,
          }
    const brief = reviewBrief ?? evidenceFor(fresh.challenge.id)
    const pillar = due?.pillar ?? pillarFor(fresh.challenge.id)
    return {
      already,
      isReview,
      challenge: playable?.challenge ?? fresh.challenge,
      brief,
      pillar,
    }
  })

  const { isReview, challenge, brief, pillar } = session
  const [solved, setSolved] = useState(session.already)
  const [missed, setMissed] = useState(false)
  const [peeked, setPeeked] = useState(false)
  const [held, setHeld] = useState(
    () =>
      !brief ||
      (Boolean(progress.held.includes(brief.id)) && !isReview),
  )

  const showNext = solved && held

  function finishPuzzle() {
    completeDaily(today)
    if (brief && !isReview) {
      recordReview({
        id: brief.id,
        pillar,
        kind: 'encode',
        today,
        clean: !missed && !peeked,
        peeked,
        elaborated: false,
      })
    }
    setSolved(true)
  }

  function settleRecall(result: { clean: boolean }) {
    setHeld(true)
    if (!brief) return
    if (isReview) {
      recordReview({
        id: brief.id,
        pillar,
        kind: 'recall',
        today,
        clean: result.clean && !missed && !peeked,
        peeked,
        elaborated: Boolean(progress.memory[brief.id]?.elaborated),
      })
    }
  }

  const rehearsing = solved && Boolean(brief) && !held

  useEffect(() => {
    if (!solved) return
    const body = document.querySelector('.app-body')
    body?.scrollTo({ top: 0, behavior: 'smooth' })
  }, [solved, rehearsing])

  return (
    <main className={`daily-page ${solved ? 'is-after' : 'is-puzzle'} ${rehearsing ? 'is-rehearse' : ''}`} aria-label={STORY.playGoal}>
      <button
        type="button"
        className="text-link"
        onClick={() => onNavigate({ name: 'hub' })}
      >
        ← The town
      </button>

      {!solved ? (
        <>
          <h1>{isReview ? 'Time to dust off this one' : challenge.title}</h1>
          <PuzzlePlay
            challenge={challenge}
            onMiss={() => setMissed(true)}
            onPeek={() => setPeeked(true)}
            onSolved={finishPuzzle}
          />
        </>
      ) : (
        <section className="after-win daily-done">
          {brief && !held ? (
            <div className="rehearse-anchor">
              <RecallGate
                brief={brief}
                mode={isReview ? 'review' : 'encode'}
                kicker={STORY.tapTakeaway}
                onHeld={settleRecall}
              />
            </div>
          ) : null}

          {showNext ? (
            <TownReturn
              who={townVoice('porch').who}
              line={townVoice('porch').afterWin}
              action="See the town"
              onGo={() => onNavigate({ name: 'hub' })}
            />
          ) : null}
        </section>
      )}
    </main>
  )
}
