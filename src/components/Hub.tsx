import type { CSSProperties } from 'react'
import { areas } from '../content'
import { AreaIcon } from './icons'
import {
  areaProgress,
  getNextGoal,
  isAreaComplete,
  isAreaUnlocked,
  useProgress,
} from '../store/progress'
import type { View } from '../types'

interface HubProps {
  onNavigate: (view: View) => void
}

export function Hub({ onNavigate }: HubProps) {
  const { progress } = useProgress()
  const goal = getNextGoal(progress)

  return (
    <main className="hub">
      <header className="page-head">
        <p className="eyebrow">Silver City map</p>
        <h1>The unending trail</h1>
        <p>
          Five districts, one case. Complete an area to unbar the next gate.
          Cards you earn wait in the Evidence Journal.
        </p>
      </header>

      <ol className="trail">
        {areas.map((area, index) => {
          const unlocked = isAreaUnlocked(area.id, progress.completed)
          const complete = isAreaComplete(area, progress.completed)
          const { done, total } = areaProgress(area, progress.completed)
          const current = goal.areaId === area.id && !complete

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
              <div className="station-emblem">
                <AreaIcon name={area.icon} />
              </div>
              <div className="station-body">
                <p className="station-kicker">
                  {complete ? 'Charted' : unlocked ? 'Open' : 'Gated'} · District{' '}
                  {area.order}
                </p>
                <h2>{area.title}</h2>
                <p>{area.blurb}</p>
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
                    ? 'Still gated'
                    : complete
                      ? 'Walk again'
                      : current
                        ? 'Continue here'
                        : 'Enter'}
                </button>
              </div>
            </li>
          )
        })}
      </ol>

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
