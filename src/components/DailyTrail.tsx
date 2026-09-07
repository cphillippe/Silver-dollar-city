import { useEffect, useState } from 'react'
import { findPlayable, getJournalEntry, pillarFor } from '../content'
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
import { SayBack } from './SayBack'
import { ShareInvite } from './ShareInvite'
import { StarRow } from './StarRow'
import { starLegend, type StarCount } from '../lib/stars'
import {
  dailyDoneToday,
  morningReview,
  streakCopy,
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
  const [recallClean, setRecallClean] = useState(true)
  const [held, setHeld] = useState(
    () =>
      !brief ||
      (Boolean(progress.held.includes(brief.id)) && !isReview),
  )
  const [said, setSaid] = useState(
    () =>
      !brief ||
      Boolean(progress.memory[brief.id]?.elaborated && !isReview),
  )
  const [earned, setEarned] = useState<StarCount | 0>(
    () => (brief && progress.stars[brief.id]) || 0,
  )
  const [newCards, setNewCards] = useState<string[]>([])
  const [tone, setTone] = useState(() =>
    session.already
      ? streakAfterPlay(progress.lastDailyDate, today, progress.streak).tone
      : undefined,
  )

  const showTeaser = solved && held && said

  function commitMemory(
    elaborated: boolean,
    text?: string,
    clean = recallClean,
  ) {
    if (!brief) {
      setSaid(true)
      return
    }
    const stars = recordReview({
      id: brief.id,
      pillar,
      kind: isReview ? 'recall' : 'encode',
      today,
      clean: clean && !missed && !peeked,
      peeked,
      elaborated,
      text,
    })
    setEarned(stars)
    setSaid(true)
  }

  function finishPuzzle() {
    const unlocked = completeDaily(today)
    setNewCards(unlocked)
    setTone(streakAfterPlay(progress.lastDailyDate, today, progress.streak).tone)
    if (brief && !isReview) {
      const stars = recordReview({
        id: brief.id,
        pillar,
        kind: 'encode',
        today,
        clean: !missed && !peeked,
        peeked,
        elaborated: false,
      })
      setEarned(stars)
    }
    setSolved(true)
  }

  function settleRecall(result: { clean: boolean }) {
    setRecallClean(result.clean)
    setHeld(true)
    if (brief && progress.memory[brief.id]?.elaborated) {
      commitMemory(true, undefined, result.clean)
    }
  }

  function settleSay(result: { elaborated: boolean; text?: string }) {
    commitMemory(result.elaborated, result.text)
  }

  const flourish = newCards[0] ? getJournalEntry(newCards[0]) : undefined
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
              ? 'Rehearse this'
              : showTeaser
                ? 'A mark for this morning'
                : isReview
                  ? 'Time to dust off this one'
                  : challenge.title}
          </h1>
        </div>
      </div>
      {rehearsing ? null : (
        <>
          <Say
            who="juniper"
            line={
              showTeaser
                ? tone === 'welcome-back'
                  ? STORY.trailWait
                  : STORY.dailyHeld
                : isReview
                  ? 'Forgetting is why the trail brings a page back. Same snap — no shame in dusting it off.'
                  : STORY.dailyInvite
            }
          />
          <Landmark pillar={pillar} />
        </>
      )}

      {!solved ? (
        <>
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
              <p className="quiet">
                Folded. One claim, then one reason — the wording that should stick.
              </p>
              <RecallGate
                brief={brief}
                mode={isReview ? 'review' : 'encode'}
                kicker="Rehearse this"
                onHeld={settleRecall}
              />
            </div>
          ) : null}

          {brief && held && !said ? (
            <SayBack brief={brief} onDone={settleSay} />
          ) : null}

          {showTeaser ? (
            <>
              <p className="streak-pill pop-in">
                {tone === 'welcome-back'
                  ? 'The trail waited. Welcome back.'
                  : tone === 'first' || liveStreak <= 1
                    ? 'Your first mark on the trail.'
                    : `${Math.max(progress.streak, 1)} mornings in a row.`}
              </p>
              <div className="daily-flourish">
                <StarRow
                  count={earned || 1}
                  label={starLegend(earned || 1)}
                />
                <p>
                  {earned >= 3
                    ? 'Held after a rest, and said back.'
                    : earned === 2
                      ? 'Held after a rest. The trail will ask again later.'
                      : '1★ first walk. A later morning will ask this line back.'}
                </p>
              </div>
              {flourish ? (
                <article className="unlock-card pop-in">
                  <p className="eyebrow">Journal flourish</p>
                  <h2>{flourish.title}</h2>
                  <p>{flourish.body[0]}</p>
                  <button
                    type="button"
                    className="text-link"
                    onClick={() =>
                      onNavigate({ name: 'journal', focusId: flourish.id })
                    }
                  >
                    Open the page →
                  </button>
                </article>
              ) : (
                <p className="quiet">{streakCopy(progress, today)}</p>
              )}

              <article
                className="teaser-card"
                aria-label="Tomorrow’s trail, still closed"
              >
                <p className="eyebrow">Tomorrow’s trail</p>
                <h2>A locked card waits</h2>
                <p className="district-flavor">{tomorrow.districtFlavor}</p>
                <p>{tomorrow.teaser}</p>
                <p className="quiet">
                  When a page is due, Juniper will dust it off — mixed among
                  the districts, never as punishment.
                </p>
              </article>

              <ShareInvite compact />
              <button
                type="button"
                className="btn primary xl"
                onClick={() => onNavigate({ name: 'hub' })}
              >
                Back to the map
              </button>
            </>
          ) : null}
        </section>
      )}
    </main>
  )
}
