import { deployLabel, withLearningBeat } from '../lib/learning'
import type { Learning } from '../types'
import { GemMark } from './GemMark'
import { DigDeeper } from './DigDeeper'

interface StoredLineProps {
  learning: Learning
  when?: string
}

/** The journal unit after encode — claim · reason · source · anchor · picture/beat · tool. */
export function StoredLine({ learning, when }: StoredLineProps) {
  const stored = withLearningBeat(learning)
  const tool = deployLabel(stored)
  return (
    <article className="stored-line" aria-label="Stored learning">
      <p className="eyebrow">Stored</p>
      <p className="memory-pipe">Acquired · Anchored · Pictured · Stored</p>
      {stored.picture ? <GemMark gem={stored.picture} size="md" /> : null}
      <p className="stored-claim">{stored.claim}</p>
      <p className="stored-reason">{stored.reason}</p>
      <p className="quiet">{stored.source}</p>
      <p className="learning-store">
        {stored.picture ? <GemMark gem={stored.picture} size="sm" /> : null}
        <span>
          Anchored to {stored.anchor}
          {stored.beat ? ` · pictured as ${stored.beat}` : ''}
          {tool ? ` · deploys as ${tool}` : ''}
        </span>
      </p>
      {when ? <p className="quiet">{when}</p> : null}
      <DigDeeper id={stored.id} />
    </article>
  )
}
