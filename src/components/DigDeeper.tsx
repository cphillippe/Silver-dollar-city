import { deeperLinksFor, eraLabel, type DeeperSurface } from '../content/deeper'
import { isEasy } from '../lib/easy'
import { WORDS } from '../lib/words'
import { useProgress } from '../store/progress'

interface DigDeeperProps {
  id: string
  surface?: DeeperSurface
  compact?: boolean
  /** Why the hold stands — shown inside Dig deeper, not as a lecture on the win. */
  why?: string
  source?: string
}

/** Openable Dig deeper list. Scripture / Ancient / Classic / Modern · believing. */
export function DigDeeper({
  id,
  surface = 'hold',
  compact = false,
  why,
  source,
}: DigDeeperProps) {
  const { progress } = useProgress()
  const easy = isEasy(progress)
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
      {why ? (
        <p className="stored-reason">
          {easy ? (
            <>
              <strong>{WORDS.reason.term}</strong> — {WORDS.reason.sense}. {why}
            </>
          ) : (
            why
          )}
        </p>
      ) : null}
      {source ? (
        <p className="quiet">
          {easy ? (
            <>
              <strong>{WORDS.source.term}</strong> — {WORDS.source.sense}: {source}
            </>
          ) : (
            source
          )}
        </p>
      ) : null}
      {list}
    </>
  )

  if (compact) {
    return (
      <details className="dig-deeper is-compact">
        <summary>{easy ? 'Read more' : 'Why it stands · Dig deeper'}</summary>
        {body}
      </details>
    )
  }

  return (
    <nav className="dig-deeper" aria-label="Dig deeper">
      <p className="eyebrow">{easy ? 'Read more' : 'Dig deeper'}</p>
      {body}
    </nav>
  )
}
