import { EASY, isEasy } from '../lib/easy'
import { useProgress } from '../store/progress'
import type { Learning } from '../types'
import { GemMark } from './GemMark'
import { DigDeeper } from './DigDeeper'
import { HeldTriad } from './HeldTriad'
import { PlainTalk } from './PlainTalk'

interface StoredLineProps {
  learning: Learning
  when?: string
}

/** After a win: claim · reason · source kids can say tomorrow. */
/* Easy Clear 1.4.185: ≤720 fills empty purple bottom on Lock In win-end (sortHold.css; Fixes #239). */
/* Easy Clear 1.4.208: ≤720 closes triad→Home purple gap — tighten after-win/held-triad gaps (fill 185 stays). */
/* Easy Clear 1.4.231: phone portrait extends fill 185 + triad→Home 208 so StoredLine·Home close purple void (invent Fun/Clear). */
export function StoredLine({ learning, when }: StoredLineProps) {
  const { progress } = useProgress()
  const easy = isEasy(progress)
  return (
    <article className="stored-line is-spoken" aria-label="Stored learning">
      <p className="eyebrow">{easy ? EASY.sayTomorrow : 'Say this out loud'}</p>
      {learning.picture ? <GemMark gem={learning.picture} size="md" /> : null}
      {easy ? (
        <HeldTriad
          id={learning.id}
          claim={learning.claim}
          reason={learning.reason}
          source={learning.source}
        />
      ) : (
        <>
          <p className="stored-claim">{learning.claim}</p>
          <PlainTalk id={learning.id} />
          <DigDeeper
            id={learning.id}
            compact
            why={learning.reason}
            source={learning.source}
          />
        </>
      )}
      {when ? <p className="quiet">{when}</p> : null}
    </article>
  )
}
