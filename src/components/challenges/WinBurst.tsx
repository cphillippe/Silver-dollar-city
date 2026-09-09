import type { CSSProperties } from 'react'
import { BURST_SPARKS } from '../../lib/juice'

export function WinBurst({ play }: { play: boolean }) {
  if (!play) return null
  return (
    <div className="win-burst" aria-hidden>
      <span className="win-flash" />
      <span className="win-ring" />
      <span className="win-stamp-wrap">
        <strong className="win-stamp">Locked!</strong>
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

