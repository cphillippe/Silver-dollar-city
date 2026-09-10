import { deeperLinksFor, eraLabel, type DeeperSurface } from '../content/deeper'

interface DigDeeperProps {
  id: string
  surface?: DeeperSurface
  compact?: boolean
  /** Why the hold stands — shown inside Dig deeper, not as a lecture on the win. */
  why?: string
  source?: string
}

/** Openable Dig deeper list. Ancient / pre-Reform first; modern believing voices only. */
export function DigDeeper({
  id,
  surface = 'hold',
  compact = false,
  why,
  source,
}: DigDeeperProps) {
  const links = deeperLinksFor(id, surface)
  if (links.length === 0 && !why && !source) return null

  const list = links.length > 0 ? (
    <ul>
      {links.map((link) => (
        <li key={link.href}>
          <a href={link.href} target="_blank" rel="noopener noreferrer">
            {link.label}
          </a>
          <span className="quiet">
            {eraLabel(link.era)} · {link.source}
          </span>
        </li>
      ))}
    </ul>
  ) : null

  const body = (
    <>
      {why ? <p className="stored-reason">{why}</p> : null}
      {source ? <p className="quiet">{source}</p> : null}
      {list}
    </>
  )

  if (compact) {
    return (
      <details className="dig-deeper is-compact">
        <summary>Why it stands · Dig deeper</summary>
        {body}
      </details>
    )
  }

  return (
    <nav className="dig-deeper" aria-label="Dig deeper">
      <p className="eyebrow">Dig deeper</p>
      {body}
    </nav>
  )
}
