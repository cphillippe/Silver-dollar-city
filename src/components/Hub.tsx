import type { CSSProperties } from 'react'
import { areas, findPlayable } from '../content'
import { dailyForDate } from '../content/daily'
import { guideForArea, STORY } from '../content/story'
import { addLocalDays, formatDeviceLocalDate, localDateKey } from '../lib/dates'
import { starLegend } from '../lib/stars'
import { Avatar } from './Avatar'
import { DeviceDay } from './DeviceDay'
import { Landmark } from './Landmark'
import { ShareInvite } from './ShareInvite'
import { StarRow } from './StarRow'
import {
  areaGateCopy,
  areaMastery,
  areaProgress,
  dailyDoneToday,
  dueCount,
  getNextGoal,
  isAreaComplete,
  isAreaUnlocked,
  morningReview,
  streakCopy,
  useProgress,
} from '../store/progress'
import type { View } from '../types'

interface HubProps {
  onNavigate: (view: View) => void
}

export function Hub({ onNavigate }: HubProps) {
  const { progress } = useProgress()
  const today = localDateKey()
  const daily = dailyForDate(today)
  const tomorrow = dailyForDate(addLocalDays(today, 1))
  const doneToday = dailyDoneToday(progress, today)
  const due = doneToday ? undefined : morningReview(progress, today)
  const duePlay = due ? findPlayable(due.id) : undefined
  const waiting = dueCount(progress, today)
  const goal = getNextGoal(progress, today)
  const dailyStars =
    (due && progress.stars[due.id]) || progress.stars[daily.challenge.id]

  return (
    <main className="hub">
      <header className="page-head">
        <p className="eyebrow">Silver City</p>
        <h1>What’s next</h1>
        <p>
          A puzzle trail for a line you can still say tomorrow. Today’s walk is
          first; the districts wait underneath.
        </p>
      </header>

      <section
        className={`today-trail ${doneToday ? 'is-done' : 'is-live'}`}
        aria-label="Today’s Trail"
      >
        <div className="card-lead">
          <Avatar who="juniper" size="lg" />
          <div>
            <p className="eyebrow">Today’s Trail · {formatDeviceLocalDate()}</p>
            <DeviceDay />
            <h2>
              {doneToday
                ? 'This morning is marked'
                : due
                  ? 'Time to dust off this one'
                  : daily.challenge.title}
            </h2>
          </div>
        </div>
        {due ? <Landmark pillar={due.pillar} compact /> : null}
        <p className="say-line">
          “
          {doneToday
            ? STORY.dailyHeld
            : due
              ? 'Forgetting is why the trail brings a page back. Same snap — no shame.'
              : STORY.dailyInvite}
          ”
        </p>
        <p>
          {doneToday
            ? streakCopy(progress, today)
            : due
              ? duePlay
                ? `${duePlay.challenge.title} · an older walk, mixed among the districts.`
                : 'An older page is waiting to be rebuilt.'
              : daily.districtFlavor}
        </p>
        {!doneToday ? (
          <p>
            {due
              ? waiting > 1
                ? `One dust-off this morning · ${waiting} pages are due · about a minute.`
                : 'A spaced recall · about a minute · the new walk can wait.'
              : 'One short puzzle · about a minute · same walk for this calendar day.'}
          </p>
        ) : (
          <div className="today-trail-meta">
            <StarRow
              count={dailyStars}
              label={starLegend(dailyStars ?? 0)}
            />
            <p className="teaser-inline">
              Tomorrow: {tomorrow.districtFlavor}. {tomorrow.teaser}
            </p>
          </div>
        )}
        {progress.streak > 0 ? (
          <p className="streak-mark">
            {doneToday
              ? `Streak ${progress.streak}`
              : progress.lastDailyDate
                ? streakCopy(progress, today)
                : 'The trail is open'}
          </p>
        ) : null}
        <button
          type="button"
          className="btn primary xl"
          onClick={() => onNavigate({ name: 'daily' })}
        >
          {doneToday
            ? 'See tomorrow’s teaser'
            : due
              ? 'Dust this one off'
              : 'Walk today’s trail'}
        </button>
      </section>

      {goal.kind !== 'daily' ? (
        <section className="next-card">
          <p className="eyebrow">On the longer trail</p>
          <h2>{goal.title}</h2>
          <p>{goal.detail}</p>
          <button
            type="button"
            className="btn gold"
            onClick={() => {
              if (goal.kind === 'vista') {
                onNavigate({ name: 'vista' })
                return
              }
              if (goal.challengeId && goal.areaId) {
                onNavigate({
                  name: 'challenge',
                  areaId: goal.areaId,
                  challengeId: goal.challengeId,
                })
                return
              }
              if (goal.areaId) {
                onNavigate({ name: 'area', areaId: goal.areaId })
              }
            }}
          >
            {goal.kind === 'challenge' && goal.title.startsWith('Next:')
              ? goal.title
              : goal.kind === 'area'
                ? `Open ${goal.areaId === 'parable-hollow' ? 'Parable Hollow' : 'the next district'}`
                : goal.kind === 'vista'
                  ? 'Stand at the lookout'
                  : 'Open the next walk'}
          </button>
        </section>
      ) : null}

      {progress.completed.length > 0 || doneToday ? (
      <ol className="trail">
        {areas.map((area, index) => {
          const unlocked = isAreaUnlocked(area.id, progress.completed)
          const complete = isAreaComplete(area, progress.completed)
          const { done, total } = areaProgress(area, progress.completed)
          const current = goal.areaId === area.id && !complete
          const mastery = areaMastery(area, progress.stars)
          const best = area.challenges.reduce(
            (max, challenge) => Math.max(max, progress.stars[challenge.id] ?? 0),
            0,
          )

          return (
            <li
              key={area.id}
              className={[
                'station',
                unlocked ? 'is-open' : 'is-locked',
                complete ? 'is-done' : '',
                current ? 'is-current' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              style={{ '--accent': area.accent } as CSSProperties}
            >
              {index > 0 ? <span className="trail-line" aria-hidden /> : null}
              <div className="station-emblem avatar-emblem">
                <Avatar who={guideForArea(area.id).id} size="lg" />
              </div>
              <div className="station-body">
                <p className="station-kicker">
                  {complete ? 'Charted' : unlocked ? 'Open' : 'Gated'} ·{' '}
                  {guideForArea(area.id).name}
                </p>
                <h2>{area.title}</h2>
                <p>{area.blurb}</p>
                {!unlocked ? (
                  <p className="quiet">{areaGateCopy(area.id, progress.completed)}</p>
                ) : null}
                <div className="station-mastery">
                  <StarRow
                    count={best as 0 | 1 | 2 | 3}
                    compact
                    label={starLegend((best as 0 | 1 | 2 | 3) || 0)}
                  />
                  <span>
                    {starLegend((best as 0 | 1 | 2 | 3) || 0)} · mastery{' '}
                    {mastery.earned}/{mastery.possible}
                  </span>
                </div>
                <div className="pips" aria-label={`${done} of ${total} complete`}>
                  {area.challenges.map((challenge) => (
                    <span
                      key={challenge.id}
                      className={
                        progress.completed.includes(challenge.id) ? 'on' : ''
                      }
                    />
                  ))}
                </div>
                <button
                  type="button"
                  className="btn primary"
                  disabled={!unlocked}
                  onClick={() => onNavigate({ name: 'area', areaId: area.id })}
                >
                  {!unlocked
                    ? area.id === 'witness-bench'
                      ? 'Two Hollow walks open this'
                      : 'Still gated'
                    : complete
                      ? 'Walk again'
                      : 'Enter this district'}
                </button>
              </div>
            </li>
          )
        })}
      </ol>
      ) : null}

      {(progress.completed.length > 0 || doneToday) && <ShareInvite compact />}

      {goal.kind === 'vista' ? (
        <button
          type="button"
          className="btn gold"
          onClick={() => onNavigate({ name: 'vista' })}
        >
          Stand at the lookout
        </button>
      ) : null}
    </main>
  )
}
