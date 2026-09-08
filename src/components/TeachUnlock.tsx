import type { Challenge } from '../types'
import type { EvidenceBrief } from '../content/evidence'

interface TeachUnlockProps {
  brief: EvidenceBrief
  kind: Challenge['kind']
  onUnlock: () => void
}

export function unlockLabel(kind: Challenge['kind']) {
  if (kind === 'sort') return 'Unlock the sort'
  if (kind === 'sequence') return 'Unlock the order'
  if (kind === 'build-argument') return 'Unlock the stones'
  return 'Unlock the pairs'
}

/** Claim · reason · source first. The quiz stays locked until this tap. */
export function TeachUnlock({ brief, kind, onUnlock }: TeachUnlockProps) {
  return (
    <section className="recall-gate is-encode teach-gate" aria-label="Today’s line">
      <p className="eyebrow">{brief.source}</p>
      <p className="recall-line rehearse-stem">{brief.claim}</p>
      <p className="teach-reason">{brief.reason}</p>
      <button type="button" className="btn primary xl" onClick={onUnlock}>
        {unlockLabel(kind)}
      </button>
    </section>
  )
}
