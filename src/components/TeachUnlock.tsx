import type { Challenge, SequenceItem } from '../types'
import type { EvidenceBrief } from '../content/evidence'
import { plainFor } from '../content/plain'
import { isEasy } from '../lib/easy'
import { learningBeat } from '../lib/learning'
import { learningPicture, toolForEvidence } from '../lib/watchTools'
import { useProgress } from '../store/progress'
import { GemMark } from './GemMark'
import { PlainTalk } from './PlainTalk'

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
  const { progress } = useProgress()
  const easy = isEasy(progress)
  const tool = toolForEvidence(brief.id)
  const picture = learningPicture(brief.id, tool)
  const plain = plainFor(brief.id)
  const reason = easy && plain ? plain.teach : brief.reason
  return (
    <section className="recall-gate is-encode teach-gate" aria-label="Today’s line">
      <p className="eyebrow">{easy ? `Learn · ${brief.source}` : `Acquire · ${brief.source}`}</p>
      {picture ? <GemMark gem={picture} size="sm" /> : null}
      <p className="recall-line rehearse-stem">{brief.claim}</p>
      <PlainTalk id={brief.id} />
      <p className="teach-reason">{reason}</p>
      {easy ? (
        <p className="quiet">You will hold this same line. Then you can use it at night.</p>
      ) : (
        <>
          <p className="quiet">Pictured as {learningBeat(brief.id)}.</p>
          <p className="quiet">
            Hold this line to deploy {tool?.label ?? 'Love'} on the night road.
          </p>
        </>
      )}
      {beats && beats.length > 0 && !easy ? (
        <ol className="teach-beats">
          {beats.map((beat) => (
            <li key={beat.id}>{beat.text}</li>
          ))}
        </ol>
      ) : null}
      {beats && beats.length > 0 && easy ? (
        <ol className="teach-beats is-easy">
          {beats.slice(0, 4).map((beat) => (
            <li key={beat.id}>{beat.text}</li>
          ))}
        </ol>
      ) : null}
      <button type="button" className="btn primary xl" onClick={onUnlock}>
        {unlock ?? (easy ? 'Got it — unlock the play' : unlockLabel(kind))}
      </button>
    </section>
  )
}
