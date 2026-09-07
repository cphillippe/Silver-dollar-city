import { useState } from 'react'
import { getJournalEntry } from '../content'
import { dailyForDate } from '../content/daily'
import {
  evidenceFor,
  knownEvidenceIds,
  pickSpacedEvidence,
} from '../content/evidence'
import { STORY } from '../content/story'
import { kindLabel } from './icons'
import { addLocalDays, formatTrailDate, localDateKey } from '../lib/dates'
import { starsFromAttempt } from '../lib/stars'
import { streakAfterPlay } from '../lib/streak'
import { Avatar, Say } from './Avatar'
import { PuzzlePlay } from './PuzzlePlay'
import { RecallGate } from './RecallGate'
import { ShareInvite } from './ShareInvite'
import { StarRow } from './StarRow'
import { dailyDoneToday, streakCopy, useProgress } from '../store/progress'
import type { View } from '../types'

interface DailyTrailProps {
  onNavigate: (view: View) => void
}

export function DailyTrail({ onNavigate }: DailyTrailProps) {
  const { completeDaily, recordHeld, progress } = useProgress()
  const today = localDateKey()
  const daily = dailyForDate(today)
  const tomorrow = dailyForDate(addLocalDays(today, 1))
  const already = dailyDoneToday(progress, today)
  const todayBrief = evidenceFor(daily.challenge.id)
  const spaced = pickSpacedEvidence(
    today,
    knownEvidenceIds(progress),
    daily.challenge.id,
  )
  const [solved, setSolved] = useState(already)
  const [missed, setMissed] = useState(false)
  const [peeked, setPeeked] = useState(false)
  const [earned, setEarned] = useState(progress.stars[daily.challenge.id] ?? 0)
  const [newCards, setNewCards] = useState<string[]>([])
  const [todayHeld, setTodayHeld] = useState(
    () => Boolean(todayBrief && progress.held.includes(todayBrief.id)),
  )
  const [spacedHeld, setSpacedHeld] = useState(
    () => Boolean(spaced && progress.held.includes(spaced.id)),
  )
  const [tone, setTone] = useState(() =>
    already
      ? streakAfterPlay(progress.lastDailyDate, today, progress.streak).tone
      : undefined,
  )

  function finish() {
    const stars = starsFromAttempt(missed, peeked)
    const unlocked = completeDaily(today, daily.challenge.id, stars)
    setEarned(stars)
    setNewCards(unlocked)
    setTone(streakAfterPlay(progress.lastDailyDate, today, progress.streak).tone)
    setSolved(true)
  }

  const flourish = newCards[0] ? getJournalEntry(newCards[0]) : undefined
  const liveStreak = Math.max(progress.streak, solved || already ? 1 : 0)
  const showTeaser = solved && (!todayBrief || todayHeld) && (!spaced || spacedHeld)

  return (
    <main className="daily-page">
      <button
        type="button"
        className="text-link"
        onClick={() => onNavigate({ name: 'hub' })}
      >
        ← City map
      </button>
      <div className="card-lead">
        <Avatar who="juniper" size="lg" />
        <div>
          <p className="eyebrow">Today’s Trail · {formatTrailDate(today)}</p>
          <h1>{already || solved ? 'A mark for this morning' : daily.challenge.title}</h1>
        </div>
      </div>
      <Say
        who="juniper"
        line={solved ? (tone === 'welcome-back' ? STORY.trailWait : STORY.dailyHeld) : STORY.dailyInvite}
      />

      {!solved ? (
        <>
          <p className="district-flavor">{daily.districtFlavor}</p>
          <p className="eyebrow">{kindLabel(daily.challenge.kind)}</p>
          <PuzzlePlay
            challenge={daily.challenge}
            onMiss={() => setMissed(true)}
            onPeek={() => setPeeked(true)}
            onSolved={finish}
          />
        </>
      ) : (
        <section className="after-win daily-done">
          <div className="burst" aria-hidden>
            <span />
            <span />
            <span />
            <span />
          </div>
          <p className="streak-pill pop-in">
            {tone === 'welcome-back'
              ? 'The trail waited. Welcome back.'
              : tone === 'first' || liveStreak <= 1
                ? 'Your first mark on the trail.'
                : `${Math.max(progress.streak, 1)} mornings in a row.`}
          </p>
          <div className="daily-flourish">
            <StarRow count={earned || progress.stars[daily.challenge.id] || 1} />
            <p>
              {earned === 3
                ? 'A clean walk — no misses, no peek.'
                : 'A mark is a mark. You can snap this one again today for a cleaner star.'}
            </p>
          </div>

          {todayBrief && !todayHeld ? (
            <RecallGate
              brief={todayBrief}
              kicker="This morning’s line"
              onHeld={() => {
                recordHeld(todayBrief.id)
                setTodayHeld(true)
              }}
            />
          ) : null}

          {todayHeld && spaced && !spacedHeld ? (
            <RecallGate
              brief={spaced}
              kicker="An older page stirs"
              onHeld={() => {
                recordHeld(spaced.id)
                setSpacedHeld(true)
              }}
            />
          ) : null}

          {showTeaser ? (
            <>
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

              <article className="teaser-card" aria-label="Tomorrow’s trail, still closed">
                <p className="eyebrow">Tomorrow’s trail</p>
                <h2>A locked card waits</h2>
                <p className="district-flavor">{tomorrow.districtFlavor}</p>
                <p>{tomorrow.teaser}</p>
                <p className="quiet">
                  The puzzle stays covered until the next local morning. The
                  trail will be here — no hurry, no guilt. An older line may ask
                  to be rebuilt.
                </p>
              </article>

              <ShareInvite compact />

              <button
                type="button"
                className="btn ghost"
                onClick={() => {
                  setSolved(false)
                  setMissed(false)
                  setPeeked(false)
                  setNewCards([])
                  setTodayHeld(Boolean(todayBrief && progress.held.includes(todayBrief.id)))
                }}
              >
                Walk today’s puzzle again
              </button>
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
