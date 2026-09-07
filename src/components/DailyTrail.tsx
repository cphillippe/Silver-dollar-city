import { useEffect, useState } from 'react'
import { findPlayable, pillarFor } from '../content'
import { dailyForDate } from '../content/daily'
import { evidenceFor } from '../content/evidence'
import { STORY } from '../content/story'
import { kindLabel } from './icons'
import {
  addLocalDays,
  assertLocalCalendar,
  formatDeviceLocalDate,
  localDateKey,
} from '../lib/dates'
import { streakAfterPlay } from '../lib/streak'
import { Avatar, Say } from './Avatar'
import { DeviceDay } from './DeviceDay'
import { Landmark } from './Landmark'
import { PuzzlePlay } from './PuzzlePlay'
import { RecallGate } from './RecallGate'
import { AdSlot } from './AdSlot'
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
  assertLocalCalendar(now)
  const today = localDateKey(now)
  const morningsBefore = progress.dailyDates.filter((d) => d !== today).length
  const tomorrow = dailyForDate(addLocalDays(today, 1))

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
      fresh,
      challenge: playable?.challenge ?? fresh.challenge,
      brief,
      pillar,
    }
  })

  const { isReview, fresh, challenge, brief, pillar } = session
  const [solved, setSolved] = useState(session.already)
  const [missed, setMissed] = useState(false)
  const [peeked, setPeeked] = useState(false)
  const [held, setHeld] = useState(
    () =>
      !brief ||
      (Boolean(progress.held.includes(brief.id)) && !isReview),
  )
  const [tone, setTone] = useState(() =>
    session.already
      ? streakAfterPlay(progress.lastDailyDate, today, progress.streak).tone
      : undefined,
  )

  const showTeaser = solved && held

  function finishPuzzle() {
    completeDaily(today)
    setTone(streakAfterPlay(progress.lastDailyDate, today, progress.streak).tone)
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

  const liveStreak = Math.max(progress.streak, solved || session.already ? 1 : 0)
  const rehearsing = solved && Boolean(brief) && !held

  useEffect(() => {
    if (!solved) return
    const body = document.querySelector('.app-body')
    body?.scrollTo({ top: 0, behavior: 'smooth' })
  }, [solved, rehearsing])

  return (
    <main className={`daily-page ${solved ? 'is-after' : 'is-puzzle'} ${rehearsing ? 'is-rehearse' : ''}`}>
      <button
        type="button"
        className="text-link"
        onClick={() => onNavigate({ name: 'hub' })}
      >
        ← City map
      </button>
      <div className="card-lead">
        <Avatar who="juniper" size={rehearsing ? 'sm' : 'lg'} />
        <div>
          <p className="eyebrow">
            Today’s Trail · {formatDeviceLocalDate(now)}
          </p>
          <DeviceDay now={now} />
          <h1>
            {rehearsing
              ? STORY.tapTakeaway
              : showTeaser
                ? 'A mark for this morning'
                : isReview
                  ? 'Time to dust off this one'
                  : challenge.title}
          </h1>
        </div>
      </div>
      {rehearsing || showTeaser ? null : (
        <>
          <Say
            who="juniper"
            line={
              isReview
                ? 'Forgetting is why the trail brings a page back. Same snap — no shame in dusting it off.'
                : STORY.dailyInvite
            }
          />
          <Landmark pillar={pillar} />
        </>
      )}

      {!solved ? (
        <>
          <p className="play-goal">{STORY.playGoal}</p>
          <p className="district-flavor">
            {isReview
              ? 'An older walk, mixed among the districts.'
              : fresh.districtFlavor}
          </p>
          <p className="eyebrow">{kindLabel(challenge.kind)}</p>
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

          {showTeaser ? (
            <>
              <div className="after-win-cta">
                <p className="streak-pill pop-in">
                  {tone === 'welcome-back'
                    ? 'The trail waited.'
                    : tone === 'first' || liveStreak <= 1
                      ? 'First mark.'
                      : `${Math.max(progress.streak, 1)} mornings.`}
                </p>
                <button
                  type="button"
                  className="btn primary xl"
                  onClick={() => onNavigate({ name: 'hub' })}
                >
                  See the town
                </button>
              </div>
              <p className="quiet teaser-inline">
                Tomorrow: {tomorrow.districtFlavor}
              </p>
              <AdSlot slot="after-daily" />
            </>
          ) : null}
        </section>
      )}
    </main>
  )
}
