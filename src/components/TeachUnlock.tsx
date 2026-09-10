import type { Challenge, SequenceItem } from '../types'
import type { EvidenceBrief } from '../content/evidence'
import { plainFor } from '../content/plain'
import { isEasy } from '../lib/easy'
import { WORDS, schoolWordsFor } from '../lib/words'
import { learningBeat } from '../lib/learning'
import { learningPicture, toolForEvidence } from '../lib/watchTools'
import { useProgress } from '../store/progress'
import { GemMark } from './GemMark'
import { WordGloss } from './WordGloss'

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

/** Story and picture first. Then teach “claim,” then the line. Quiz stays locked. */
export function TeachUnlock({ brief, kind, onUnlock, unlock, beats }: TeachUnlockProps) {
  const { progress } = useProgress()
  const easy = isEasy(progress)
  const tool = toolForEvidence(brief.id)
  const picture = learningPicture(brief.id, tool)
  const plain = plainFor(brief.id)
  const story = easy && plain ? plain.teach : brief.reason
  const school = schoolWordsFor(brief.id, easy)
  return (
    <section className="recall-gate is-encode teach-gate" aria-label="Today’s line">
      <p className="eyebrow">{easy ? 'Learn first' : 'Learn'}</p>
      {picture ? <GemMark gem={picture} size="sm" /> : null}
      <p className="teach-reason">{story}</p>
      <WordGloss words={school} extra={easy ? plain?.word : undefined} />
      <p className="quiet">A claim is what we hold to be true.</p>
      <p className="eyebrow hold-kicker">The claim you will hold</p>
      <p className="recall-line rehearse-stem">{brief.claim}</p>
      {easy ? (
        <>
          <p className="quiet">
            <strong>{WORDS.reason.term}</strong> — {WORDS.reason.sense}. {WORDS.source.term} —{' '}
            {WORDS.source.sense}: {brief.source}.
          </p>
          <p className="quiet">You will hold this same line. Then you can use it at night.</p>
        </>
      ) : (
        <>
          <p className="quiet">
            {WORDS.source.term} — {WORDS.source.sense}: {brief.source}.
          </p>
          <p className="quiet">Pictured as {learningBeat(brief.id)}.</p>
          <p className="quiet">
            Acquire — learn this line so you can hold it. Hold this line to deploy{' '}
            {tool?.label ?? 'Love'} on the night road.
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
