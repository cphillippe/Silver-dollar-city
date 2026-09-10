import type { CSSProperties } from 'react'
import { getArea } from '../content'
import { AREA_LINES, guideForArea } from '../content/story'
import { Avatar, Say } from './Avatar'
import { Landmark } from './Landmark'
import { kindLabel } from './icons'
import { isEasy } from '../lib/easy'
import { starLegend } from '../lib/stars'
import { StarRow } from './StarRow'
import {
  areaGateCopy,
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
  const guide = guideForArea(area.id)
  const lines = AREA_LINES[area.id]

  return (
    <main className="area-page">
      <button
        type="button"
        className="text-link"
        onClick={() => onNavigate({ name: 'hub' })}
      >
        ← The town
      </button>

      <header
        className="area-hero"
        style={{ '--accent': area.accent } as CSSProperties}
      >
        <div className="area-hero-cast">
          <Avatar who={guide.id} size="xl" />
          <Avatar who="river" size="md" />
        </div>
        <Landmark pillar={area.id} compact />
        <p className="eyebrow">{guide.role} · in town</p>
        <h1>{area.title}</h1>
        <p className="progress-line">
          {done} of {total}
          {complete ? ' · street’s standing' : ''}
          {mastery.earned ? ` · ${mastery.earned}★` : ''}
        </p>
      </header>

      {lines ? <Say who={guide.id} line={complete ? lines.after : lines.hello} /> : null}

      {!unlocked ? (
        <p className="locked-note">
          {areaGateCopy(area.id, progress.completed, isEasy(progress))}
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
                      <StarRow
                        count={progress.stars[challenge.id]}
                        compact
                        label={starLegend(progress.stars[challenge.id])}
                      />
                    ) : null}
                  </span>
                  <span className="row-status">
                    {doneHere
                      ? starLegend(progress.stars[challenge.id] ?? 0)
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
          Keep building
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
            Walk with {guide.shortName}
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
