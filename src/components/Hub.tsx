import { areas, findPlayable } from '../content'
import { dailyForDate } from '../content/daily'
import { STORY } from '../content/story'
import { formatDeviceLocalDate, localDateKey } from '../lib/dates'
import { STAR_KEY } from '../lib/stars'
import { CITY_PLOTS, nextPlotId, plotStage } from '../lib/city'
import { Avatar } from './Avatar'
import { DeviceDay } from './DeviceDay'
import { Landmark } from './Landmark'
import { ShareInvite } from './ShareInvite'
import { AdSlot } from './AdSlot'
import { CityMap } from './CityMap'
import {
  dailyDoneToday,
  dueCount,
  getNextGoal,
  isAreaComplete,
  isAreaUnlocked,
  morningReview,
  rehearseGo,
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
  const morningsBefore = progress.dailyDates.filter((d) => d !== today).length
  const daily = dailyForDate(today, morningsBefore)
  const doneToday = dailyDoneToday(progress, today)
  const due = doneToday ? undefined : morningReview(progress, today)
  const duePlay = due ? findPlayable(due.id) : undefined
  const waiting = dueCount(progress, today)
  const goal = getNextGoal(progress, today)
  const nextId = nextPlotId(progress, doneToday)

  return (
    <main className="hub">
      <header className="page-head town-head">
        <h1>The town</h1>
        <p>Tap the glow — that’s the next roof.</p>
      </header>

      <CityMap onNavigate={onNavigate} />

      <section
        className={`today-trail is-slim ${doneToday ? 'is-done' : 'is-live'}`}
        aria-label="Today’s Trail"
      >
        <div className="card-lead">
          <Avatar who="juniper" size="md" />
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
        {doneToday ? (
          <p>{streakCopy(progress, today)}</p>
        ) : (
          <>
            <p>
              {due
                ? duePlay
                  ? `${duePlay.challenge.title} · an older walk.`
                  : 'An older page is waiting to be rebuilt.'
                : daily.districtFlavor}
            </p>
            <p className="quiet">
              {due
                ? waiting > 1
                  ? `${waiting} pages due · about a minute`
                  : 'A spaced recall · about a minute'
                : 'One short puzzle · about a minute'}
            </p>
            <button
              type="button"
              className="btn primary"
              onClick={() => onNavigate({ name: 'daily' })}
            >
              {due ? 'Dust this one off' : 'Walk today’s trail'}
            </button>
          </>
        )}
      </section>

      <AdSlot slot="hub-banner" />

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

      <p className="star-key">{STAR_KEY}</p>
      <ol className="city-streets">
        {CITY_PLOTS.filter((plot) => plot.areaId || plot.id === 'porch').map((plot) => {
          const area = plot.areaId
            ? areas.find((item) => item.id === plot.areaId)
            : undefined
          const unlocked = plot.id === 'porch'
            ? true
            : area
              ? isAreaUnlocked(area.id, progress.completed)
              : false
          const complete = area
            ? isAreaComplete(area, progress.completed)
            : doneToday
          const stage = plotStage(plot.id, progress)
          const current = plot.id === nextId

          return (
            <li
              key={plot.id}
              className={`${unlocked ? '' : 'is-locked'} ${current ? 'is-next' : ''}`}
            >
              <div className="street-name">
                <strong>{plot.title}</strong>
                <span className="quiet">
                  {stage === 'empty'
                    ? area
                      ? 'Waiting'
                      : 'Waiting'
                    : stage === 'scaffold'
                      ? 'Rising'
                      : stage === 'built'
                        ? 'Standing'
                        : 'Lit'}
                </span>
              </div>
              <button
                type="button"
                className={`btn tiny ${complete && unlocked ? 'street-rehearse' : ''}`}
                disabled={!unlocked}
                onClick={() => {
                  if (complete) {
                    onNavigate(
                      rehearseGo(
                        progress,
                        plot.id === 'porch' ? 'porch' : plot.areaId,
                      ),
                    )
                    return
                  }
                  onNavigate(
                    plot.id === 'porch'
                      ? { name: 'daily' }
                      : { name: 'area', areaId: plot.areaId ?? 'parable-hollow' },
                  )
                }}
              >
                {!unlocked
                  ? plot.areaId === 'witness-bench'
                    ? 'Two Hollow walks'
                    : 'Gated'
                  : complete
                    ? STORY.takeaway
                    : 'Enter'}
              </button>
            </li>
          )
        })}
      </ol>

      <AdSlot slot="between-districts" />

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
