import { deployLabel, withLearningBeat } from '../lib/learning'
import { isEasy } from '../lib/easy'
import { useProgress } from '../store/progress'
import type { Learning } from '../types'
import { GemMark } from './GemMark'
import { DigDeeper } from './DigDeeper'
import { PlainTalk } from './PlainTalk'

interface StoredLineProps {
  learning: Learning
  when?: string
}

/** The journal unit after encode — claim · reason · source · anchor · picture/beat · tool. */
export function StoredLine({ learning, when }: StoredLineProps) {
  const { progress } = useProgress()
  const easy = isEasy(progress)
  const stored = withLearningBeat(learning)
  const tool = deployLabel(stored)
  return (
    <article className="stored-line" aria-label="Stored learning">
      <p className="eyebrow">{easy ? 'You kept this line' : 'Stored'}</p>
      {easy ? null : <p className="memory-pipe">Acquired · Anchored · Pictured · Stored</p>}
      {stored.picture ? <GemMark gem={stored.picture} size="md" /> : null}
      <p className="stored-claim">{stored.claim}</p>
      <PlainTalk id={stored.id} />
      {easy ? null : <p className="stored-reason">{stored.reason}</p>}
      <p className="quiet">{stored.source}</p>
      {easy ? null : (
        <p className="learning-store">
          {stored.picture ? <GemMark gem={stored.picture} size="sm" /> : null}
          <span>
            Anchored to {stored.anchor}
            {stored.beat ? ` · pictured as ${stored.beat}` : ''}
            {tool ? ` · deploys as ${tool}` : ''}
          </span>
        </p>
      )}
      {when ? <p className="quiet">{when}</p> : null}
      <DigDeeper id={stored.id} />
    </article>
  )
}
