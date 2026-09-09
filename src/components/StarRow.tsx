import type { StarCount } from '../lib/stars'

interface StarRowProps {
  count?: StarCount | 0
  compact?: boolean
  label?: string
}

export function StarRow({ count = 0, compact, label }: StarRowProps) {
  return (
    <span
      className={`star-row ${compact ? 'is-compact' : ''} ${count ? 'has-stars' : ''}`}
      aria-label={label ?? `${count} of 3 stars`}
    >
      {[1, 2, 3].map((n) => (
        <span key={n} className={n <= count ? 'is-lit' : ''} aria-hidden>
          ★
        </span>
      ))}
    </span>
  )
}
