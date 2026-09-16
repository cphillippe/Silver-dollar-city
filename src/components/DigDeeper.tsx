import { useState } from 'react'
import { deeperLinksFor, easyDigTaps, eraLabel, type DeeperLink, type DeeperSurface } from '../content/deeper'
import { EASY, isEasy } from '../lib/easy'
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

function EasyTapList({ taps }: { taps: DeeperLink[] }) {
  const [open, setOpen] = useState<string | null>(null)
  return (
    <ul className="dig-taps">
      {taps.map((link) => {
        const shown = open === link.href
        return (
          <li key={link.href}>
            <button
              type="button"
              className={`dig-tap hue-${link.era} ${shown ? 'is-open' : ''}`}
              onClick={() => setOpen(shown ? null : link.href)}
            >
              <strong>{link.label}</strong>
              <span className="quiet">{eraLabel(link.era)}</span>
            </button>
            {shown ? <p className="dig-bite">{link.source}</p> : null}
          </li>
        )
      })}
    </ul>
  )
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
  const taps = easyDigTaps(id, surface)
  if (easy) {
    if (taps.length === 0 && !why && !source) return null
    const body = (
      <>
        {why ? (
          <p className="stored-reason">
            <strong>{WORDS.reason.term}</strong> — {EASY.reasonSense}. {why}
          </p>
        ) : null}
        {source ? (
          <p className="quiet">
            <strong>{WORDS.source.term}</strong> — {EASY.sourceSense}: {source}
          </p>
        ) : null}
        {taps.length ? <EasyTapList taps={taps} /> : null}
      </>
    )
    if (compact) {
      return (
        <details className="dig-deeper is-compact is-easy-dig">
          <summary>Dig the names</summary>
          {body}
        </details>
      )
    }
    return (
      <nav className="dig-deeper is-easy-dig" aria-label="Dig deeper">
        <p className="eyebrow">Dig the names</p>
        {body}
      </nav>
    )
  }
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
