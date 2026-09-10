import { deeperLinksFor, eraLabel, type DeeperSurface } from '../content/deeper'

interface DigDeeperProps {
  id: string
  surface?: DeeperSurface
  compact?: boolean
}

/** Openable Dig deeper list. Ancient / pre-Reform first; modern believing voices only. */
export function DigDeeper({ id, surface = 'hold', compact = false }: DigDeeperProps) {
  const links = deeperLinksFor(id, surface)
  if (links.length === 0) return null

  const list = (
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
  )

  if (compact) {
    return (
      <details className="dig-deeper is-compact">
        <summary>Dig deeper</summary>
        {list}
      </details>
    )
  }

  return (
    <nav className="dig-deeper" aria-label="Dig deeper">
      <p className="eyebrow">Dig deeper</p>
      {list}
    </nav>
  )
}
