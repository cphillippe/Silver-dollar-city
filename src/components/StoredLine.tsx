import { isEasy, EASY } from '../lib/easy'
import { WORDS } from '../lib/words'
import { useProgress } from '../store/progress'
import type { Learning } from '../types'
import { GemMark } from './GemMark'
import { DigDeeper } from './DigDeeper'
import { PlainTalk } from './PlainTalk'

interface StoredLineProps {
  learning: Learning
  when?: string
}

/** After a win: one spoken claim. Reason and source live in Dig deeper. */
export function StoredLine({ learning, when }: StoredLineProps) {
  const { progress } = useProgress()
  const easy = isEasy(progress)
  return (
    <article className="stored-line is-spoken" aria-label="Stored learning">
      <p className="eyebrow">Say this out loud</p>
      {learning.picture ? <GemMark gem={learning.picture} size="md" /> : null}
      {easy ? <p className="quiet">{EASY.claimTeach}</p> : null}
      <p className="stored-claim">{learning.claim}</p>
      {easy ? <PlainTalk id={learning.id} /> : null}
      {easy ? (
        <p className="quiet">
          <strong>{WORDS.reason.term}</strong> — {WORDS.reason.sense}.{' '}
          <strong>{WORDS.source.term}</strong> — {WORDS.source.sense}.
        </p>
      ) : null}
      <DigDeeper
        id={learning.id}
        compact
        why={learning.reason}
        source={learning.source}
      />
      {when ? <p className="quiet">{when}</p> : null}
    </article>
  )
}
