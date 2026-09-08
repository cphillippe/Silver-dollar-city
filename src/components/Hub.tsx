import { areas, findPlayable } from '../content'
import { STORY, townVoice } from '../content/story'
import { formatDeviceLocalDate, localDateKey } from '../lib/dates'
import { CITY_PLOTS, nextPlotId } from '../lib/city'
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
  nextWalkView,
  rehearseGo,
  useProgress,
} from '../store/progress'
import type { View } from '../types'

interface HubProps {
  onNavigate: (view: View) => void
}

export function Hub({ onNavigate }: HubProps) {
  const { progress } = useProgress()
  const today = localDateKey()
  const doneToday = dailyDoneToday(progress, today)
  const due = doneToday ? undefined : morningReview(progress, today)
  const duePlay = due ? findPlayable(due.id) : undefined
  const waiting = dueCount(progress, today)
  const goal = getNextGoal(progress, today)
  const nextId = nextPlotId(progress, doneToday)

  return (
    <main className="hub is-town" aria-label="The town">
      <CityMap onNavigate={onNavigate} />

      <section className="night-watch" aria-label="Night Watch">
        <div className="card-lead">
          <Avatar who="juniper" size="sm" />
          <div>
            <p className="eyebrow">{progress.defense.cleared ? 'Still watched' : 'Night Watch'}</p>
            <h2>Hold the night</h2>
            <p className="town-line">Built lots hold lamps.</p>
          </div>
        </div>
        <button
          type="button"
          className="btn gold"
          onClick={() => onNavigate({ name: 'defend' })}
        >
          Hold the night
        </button>
      </section>

      {due ? (
      <section
        className={`today-trail is-slim is-live`}
        aria-label="Today’s Trail"
      >
        <div className="card-lead">
          <Avatar who="juniper" size="md" />
          <div>
            <p className="eyebrow">Today’s Trail · {formatDeviceLocalDate()}</p>
            <DeviceDay />
            <h2>Time to dust off this one</h2>
          </div>
        </div>
        <Landmark pillar={due.pillar} compact />
        <p>
          {duePlay
            ? `${duePlay.challenge.title} · an older walk.`
            : 'An older page is waiting to be rebuilt.'}
        </p>
        <p className="quiet">
          {waiting > 1
            ? `${waiting} pages due · about a minute`
            : 'A spaced recall · about a minute'}
        </p>
        <button
          type="button"
          className="btn primary"
          onClick={() => onNavigate({ name: 'daily' })}
        >
          Dust this one off
        </button>
      </section>
      ) : null}

      <AdSlot slot="hub-banner" />

      <details className="street-drawer">
        <summary>Homes on the street</summary>
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
          const current = plot.id === nextId
          const streetVoice = townVoice(plot.id)

          return (
            <li
              key={plot.id}
              className={`${unlocked ? '' : 'is-locked'} ${current ? 'is-next' : ''}`}
            >
              <div className="street-name">
                <Avatar who={streetVoice.who} size="sm" />
                <div>
                  <strong>{plot.title}</strong>
                  {current ? <span className="street-next">Next</span> : null}
                </div>
              </div>
              <button
                type="button"
                className={`btn tiny ${complete && unlocked ? 'street-rehearse' : ''} ${current && unlocked && !complete ? 'gold' : ''}`}
                disabled={!unlocked}
                aria-label={complete && unlocked ? STORY.takeaway : undefined}
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
                      : nextWalkView(plot.areaId ?? 'parable-hollow', progress.completed),
                  )
                }}
              >
                {!unlocked
                  ? plot.areaId === 'witness-bench'
                    ? 'Two Hollow walks'
                    : 'Gated'
                  : complete
                    ? STORY.tapTakeaway
                    : current
                      ? plot.id === 'porch'
                        ? 'Walk next'
                        : 'Build next'
                      : 'Enter'}
              </button>
            </li>
          )
        })}
      </ol>
        {(progress.completed.length > 0 || doneToday) && <ShareInvite compact />}
      </details>

      <AdSlot slot="between-districts" />

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
