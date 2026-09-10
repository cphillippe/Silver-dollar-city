import type { Challenge, SequenceItem } from '../types'
import type { EvidenceBrief } from '../content/evidence'
import { learningBeat } from '../lib/learning'
import { learningPicture, toolForEvidence } from '../lib/watchTools'
import { GemMark } from './GemMark'

interface TeachUnlockProps {
  brief: EvidenceBrief
  kind: Challenge['kind']
  onUnlock: () => void
  unlock?: string
  beats?: SequenceItem[]
}

export function unlockLabel(kind: Challenge['kind']) {
  if (kind === 'sort') return 'Unlock the sort'
  if (kind === 'sequence') return 'Unlock the order'
  if (kind === 'build-argument') return 'Unlock the stones'
  if (kind === 'link') return 'Unlock the links'
  return 'Unlock the pairs'
}

/** Claim · reason · source first. The quiz stays locked until this tap. */
export function TeachUnlock({ brief, kind, onUnlock, unlock, beats }: TeachUnlockProps) {
  const tool = toolForEvidence(brief.id)
  const picture = learningPicture(brief.id, tool)
  return (
    <section className="recall-gate is-encode teach-gate" aria-label="Today’s line">
      <p className="eyebrow">Acquire · {brief.source}</p>
      {picture ? <GemMark gem={picture} size="sm" /> : null}
      <p className="recall-line rehearse-stem">{brief.claim}</p>
      <p className="teach-reason">{brief.reason}</p>
      <p className="quiet">Pictured as {learningBeat(brief.id)}.</p>
      <p className="quiet">
        Hold this line to deploy {tool?.label ?? 'Love'} on the night road.
      </p>
      {beats && beats.length > 0 ? (
        <ol className="teach-beats">
          {beats.map((beat) => (
            <li key={beat.id}>{beat.text}</li>
          ))}
        </ol>
      ) : null}
      <button type="button" className="btn primary xl" onClick={onUnlock}>
        {unlock ?? unlockLabel(kind)}
      </button>
    </section>
  )
}
