import type { CSSProperties } from 'react'
import { getArea } from '../content'
import { AreaIcon, kindLabel } from './icons'
import { StarRow } from './StarRow'
import {
  areaMastery,
  areaProgress,
  isAreaComplete,
  isAreaUnlocked,
  nextChallengeInArea,
  useProgress,
} from '../store/progress'
import type { View } from '../types'

interface AreaViewProps {
  areaId: string
  onNavigate: (view: View) => void
}

export function AreaView({ areaId, onNavigate }: AreaViewProps) {
  const { progress } = useProgress()
  const area = getArea(areaId)

  if (!area) {
    return (
      <main className="page">
        <p>That district is not on the map.</p>
      </main>
    )
  }

  const unlocked = isAreaUnlocked(area.id, progress.completed)
  const complete = isAreaComplete(area, progress.completed)
  const { done, total } = areaProgress(area, progress.completed)
  const next = nextChallengeInArea(area, progress.completed)
  const mastery = areaMastery(area, progress.stars)

  return (
    <main className="area-page">
      <button
        type="button"
        className="text-link"
        onClick={() => onNavigate({ name: 'hub' })}
      >
        ← City map
      </button>

      <header
        className="area-hero"
        style={{ '--accent': area.accent } as CSSProperties}
      >
        <div className="station-emblem lg">
          <AreaIcon name={area.icon} />
        </div>
        <p className="eyebrow">{area.subtitle}</p>
        <h1>{area.title}</h1>
        <p className="progress-line">
          {done} of {total} challenges · {complete ? 'District complete — still playable' : 'In progress'}
        </p>
        <p className="progress-line quiet">
          Mastery {mastery.earned}/{mastery.possible} · replay to lift your stars
        </p>
      </header>

      <section className="narrative">
        {area.intro.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </section>

      {!unlocked ? (
        <p className="locked-note">
          This gate is still closed. Finish the district before it, then return.
        </p>
      ) : (
        <ol className="challenge-list">
          {area.challenges.map((challenge, index) => {
            const doneHere = progress.completed.includes(challenge.id)
            const playable =
              unlocked &&
              (doneHere ||
                area.challenges
                  .slice(0, index)
                  .every((item) => progress.completed.includes(item.id)))
            return (
              <li key={challenge.id}>
                <button
                  type="button"
                  className={`challenge-row ${doneHere ? 'is-done' : ''} ${playable ? '' : 'is-wait'}`}
                  disabled={!playable}
                  onClick={() =>
                    onNavigate({
                      name: 'challenge',
                      areaId: area.id,
                      challengeId: challenge.id,
                    })
                  }
                >
                  <span className="idx">{index + 1}</span>
                  <span className="challenge-meta">
                    <strong>{challenge.title}</strong>
                    <em>{kindLabel(challenge.kind)}</em>
                    {progress.stars[challenge.id] ? (
                      <StarRow count={progress.stars[challenge.id]} compact />
                    ) : null}
                  </span>
                  <span className="row-status">
                    {doneHere
                      ? progress.stars[challenge.id] === 3
                        ? 'Clean'
                        : 'Replay'
                      : playable
                        ? 'Play'
                        : 'Soon'}
                  </span>
                </button>
              </li>
            )
          })}
        </ol>
      )}

      {next && unlocked ? (
        <button
          type="button"
          className="btn primary xl"
          onClick={() =>
            onNavigate({
              name: 'challenge',
              areaId: area.id,
              challengeId: next.id,
            })
          }
        >
          Next: {next.title}
        </button>
      ) : null}

      {complete ? (
        <div className="area-replay">
          <button
            type="button"
            className="btn primary xl"
            onClick={() =>
              onNavigate({
                name: 'challenge',
                areaId: area.id,
                challengeId: area.challenges[0].id,
              })
            }
          >
            Replay from the first challenge
          </button>
          <button
            type="button"
            className="btn gold"
            onClick={() => onNavigate({ name: 'journal' })}
          >
            Read this district in the journal
          </button>
        </div>
      ) : null}
    </main>
  )
}
