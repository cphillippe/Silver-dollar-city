import { areas, journalEntries } from '../content'
import { AreaIcon } from './icons'
import { useProgress } from '../store/progress'
import type { View } from '../types'

interface JournalProps {
  focusId?: string
  onNavigate: (view: View) => void
}

export function Journal({ focusId, onNavigate }: JournalProps) {
  const { progress } = useProgress()

  return (
    <main className="journal">
      <header className="page-head">
        <p className="eyebrow">Evidence Journal</p>
        <h1>What you have gathered</h1>
        <p>
          {progress.journal.length} of {journalEntries.length} cards. Each
          finished challenge leaves a page — sources included, claims bounded.
        </p>
      </header>

      {areas.map((area) => {
        const entries = journalEntries.filter((entry) => entry.areaId === area.id)
        return (
          <section key={area.id} className="journal-chapter">
            <div className="chapter-head">
              <span
                className="station-emblem sm"
                style={{ color: area.accent }}
              >
                <AreaIcon name={area.icon} />
              </span>
              <div>
                <h2>{area.title}</h2>
                <p>{area.subtitle}</p>
              </div>
            </div>
            <div className="card-grid">
              {entries.map((entry) => {
                const open = progress.journal.includes(entry.id)
                const focused = focusId === entry.id
                return (
                  <article
                    key={entry.id}
                    id={entry.id}
                    className={`dossier ${open ? 'is-open' : 'is-sealed'} ${focused ? 'is-focus' : ''}`}
                  >
                    {open ? (
                      <>
                        <p className="eyebrow">{entry.kicker}</p>
                        <h3>{entry.title}</h3>
                        {entry.body.map((paragraph) => (
                          <p key={paragraph}>{paragraph}</p>
                        ))}
                        <ul className="sources">
                          {entry.sources.map((source) => (
                            <li key={source}>{source}</li>
                          ))}
                        </ul>
                      </>
                    ) : (
                      <>
                        <p className="eyebrow">Sealed</p>
                        <h3>A card waits here</h3>
                        <p>
                          Complete the matching challenge in {area.title} to
                          unseal this page.
                        </p>
                      </>
                    )}
                  </article>
                )
              })}
            </div>
          </section>
        )
      })}

      <button
        type="button"
        className="btn ghost"
        onClick={() => onNavigate({ name: 'hub' })}
      >
        Return to the map
      </button>
    </main>
  )
}
