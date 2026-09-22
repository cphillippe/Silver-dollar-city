import type { LociStampSpec } from '../lib/lociStamp'
import { Avatar } from './Avatar'

export type LociStampMode = 'hero' | 'dock'

interface LociStampProps {
  stamp: LociStampSpec
  mode?: LociStampMode
  className?: string
  /** Optional dock tap / expand handler */
  onTap?: () => void
  dockJuice?: number | null
}

/** Place landmark + Person + Idea chip — memory loci, not decoration-only comics. */
export function LociStamp({
  stamp,
  mode = 'hero',
  className = '',
  onTap,
  dockJuice = null,
}: LociStampProps) {
  const body = (
    <>
      <span className="loci-stamp-avatar" aria-hidden>
        <Avatar who={stamp.whoId} size={mode === 'dock' ? 'sm' : 'md'} />
      </span>
      <span className="loci-stamp-body">
        <span className="loci-stamp-place">{stamp.placeLabel}</span>
        <span className="loci-stamp-idea">{stamp.ideaShort}</span>
      </span>
      <span className="loci-stamp-pin" data-plot={stamp.plotId} aria-hidden>
        ⌖
      </span>
      {dockJuice ? (
        <span className="loci-stamp-juice" aria-hidden>
          +{dockJuice}
        </span>
      ) : null}
    </>
  )

  const cls = `loci-stamp is-${mode} ${className} ${dockJuice ? 'is-juice' : ''}`.trim()
  const label = `${stamp.placeLabel} · idea: ${stamp.ideaShort}`

  if (onTap) {
    return (
      <button type="button" className={cls} aria-label={label} onClick={onTap}>
        {body}
      </button>
    )
  }

  return (
    <div className={cls} aria-label={label} role="group">
      {body}
    </div>
  )
}
