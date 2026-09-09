import type { CSSProperties } from 'react'
import { BURST_SPARKS } from '../../lib/juice'

export function WinBurst({
  play,
  stamp = 'Locked!',
}: {
  play: boolean
  stamp?: string
}) {
  if (!play) return null
  return (
    <div className="win-burst" aria-hidden>
      <span className="win-flash" />
      <span className="win-ring" />
      <span className="win-stamp-wrap">
        <strong className="win-stamp">{stamp}</strong>
      </span>
      {BURST_SPARKS.map((i) => (
        <span
          key={i}
          className={`win-spark ${i % 3 === 0 ? 'is-shard' : ''}`}
          style={{ ['--i' as string]: i } as CSSProperties}
        />
      ))}
    </div>
  )
}

