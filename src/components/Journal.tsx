import { useState } from 'react'
import { areas, journalEntries } from '../content'
import { evidenceForJournal } from '../content/evidence'
import { AreaIcon } from './icons'
import { RecallGate } from './RecallGate'
import { ShareInvite } from './ShareInvite'
import { StarRow } from './StarRow'
import { journalCompletion, useProgress } from '../store/progress'
import { trailDaysRequired } from '../lib/streak'
import type { JournalEntry, View } from '../types'

interface JournalProps {
  focusId?: string
  onNavigate: (view: View) => void
}

export function Journal({ focusId, onNavigate }: JournalProps) {
  const { progress } = useProgress()
  const { open, total, percent } = journalCompletion(progress)
  const trailNotes = journalEntries.filter((entry) => entry.areaId === 'daily-trail')
  const districtChapters = areas.map((area) => ({
    area,
    entries: journalEntries.filter((entry) => entry.areaId === area.id),
  }))
  const heldCount = progress.held.length

  return (
    <main className="journal">
      <header className="page-head">
        <p className="eyebrow">Evidence Journal</p>
        <h1>What you can still say</h1>
        <p>
          {open} of {total} unsealed · {percent}% of the dossier · {heldCount}{' '}
          lines held from memory. District cards open on a first clear. Mystery
          pages open when you return. Open pages start face-down — rebuild the
          claim, then read.
        </p>
        <div
          className="journal-meter"
          role="img"
          aria-label={`${percent} percent of the journal unsealed, ${heldCount} held`}
        >
          <span style={{ width: `${percent}%` }} />
        </div>
        <p className="journal-split">
          {open} unsealed · {total - open} sealed · {heldCount} held
        </p>
      </header>

      <section className="journal-chapter">
        <div className="chapter-head">
          <span className="station-emblem sm" style={{ color: 'var(--gold)' }}>
            ✦
          </span>
          <div>
            <h2>Trail notes</h2>
            <p>Pages that open by returning — not only by clearing a district.</p>
          </div>
        </div>
        <div className="card-grid">
          {trailNotes.map((entry) => (
            <JournalCard
              key={entry.id}
              entry={entry}
              open={progress.journal.includes(entry.id)}
              focused={focusId === entry.id}
              mystery
              daysWalked={progress.dailyDates.length}
              stars={progress.stars[entry.unlockAfter]}
              held={progress.held.includes(entry.unlockAfter) || progress.held.includes(entry.id)}
            />
          ))}
        </div>
      </section>

      {districtChapters.map(({ area, entries }) => (
        <section key={area.id} className="journal-chapter">
          <div className="chapter-head">
            <span className="station-emblem sm" style={{ color: area.accent }}>
              <AreaIcon name={area.icon} />
            </span>
            <div>
              <h2>{area.title}</h2>
              <p>{area.subtitle}</p>
            </div>
          </div>
          <div className="card-grid">
            {entries.map((entry) => (
              <JournalCard
                key={entry.id}
                entry={entry}
                open={progress.journal.includes(entry.id)}
                focused={focusId === entry.id}
                stars={progress.stars[entry.unlockAfter]}
                clean={progress.firstTry.includes(entry.unlockAfter)}
                held={progress.held.includes(entry.unlockAfter)}
              />
            ))}
          </div>
        </section>
      ))}

      <ShareInvite />

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

function JournalCard({
  entry,
  open,
  focused,
  mystery,
  daysWalked = 0,
  stars,
  clean,
  held,
}: {
  entry: JournalEntry
  open: boolean
  focused: boolean
  mystery?: boolean
  daysWalked?: number
  stars?: 1 | 2 | 3
  clean?: boolean
  held?: boolean
}) {
  const { recordHeld } = useProgress()
  const need = trailDaysRequired(entry.unlockAfter)
  const brief = evidenceForJournal(entry.unlockAfter, entry.id)
  const [face, setFace] = useState<'recall' | 'read'>(held ? 'read' : 'recall')
  const [quizAgain, setQuizAgain] = useState(Boolean(focused && open && brief && !held))

  return (
    <article
      id={entry.id}
      className={`dossier ${open ? 'is-open' : mystery ? 'is-mystery' : 'is-sealed'} ${focused ? 'is-focus' : ''} ${held ? 'is-held' : ''}`}
    >
      {open ? (
        <>
          <div className="dossier-marks">
            {stars ? <StarRow count={stars} compact /> : null}
            {clean || stars === 3 ? (
              <span className="clean-mark">Clean solve</span>
            ) : null}
            {held ? <span className="held-mark">Held</span> : null}
          </div>
          <p className="eyebrow">{entry.kicker}</p>
          <h3>{entry.title}</h3>

          {brief && face === 'recall' && !quizAgain ? (
            <>
              <p className="quiet">Face-down. Rebuild the line — then the page opens.</p>
              <button
                type="button"
                className="btn primary"
                onClick={() => setQuizAgain(true)}
              >
                Rebuild this line
              </button>
            </>
          ) : brief && quizAgain ? (
            <>
              <RecallGate
                brief={brief}
                kicker="Journal recall"
                onHeld={() => {
                  recordHeld(brief.id)
                  setFace('read')
                  setQuizAgain(false)
                }}
              />
              {held ? (
                <button
                  type="button"
                  className="text-link"
                  onClick={() => {
                    setQuizAgain(false)
                    setFace('read')
                  }}
                >
                  Read the page
                </button>
              ) : null}
            </>
          ) : (
            <>
              {entry.body.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
              <ul className="sources">
                {entry.sources.map((source) => (
                  <li key={source}>{source}</li>
                ))}
              </ul>
              {brief ? (
                <button
                  type="button"
                  className="btn ghost"
                  onClick={() => setQuizAgain(true)}
                >
                  Quiz me again
                </button>
              ) : null}
            </>
          )}
        </>
      ) : mystery ? (
        <>
          <p className="eyebrow">A mystery page</p>
          <h3>A trail note waits here</h3>
          <p>
            {need
              ? `Walk ${need} distinct morning${need === 1 ? '' : 's'} on Today’s Trail to unseal this — you have ${daysWalked}.`
              : 'Return for Daily Trail mornings to unseal this page.'}
          </p>
          <p className="quiet">The trail waits. Nothing here is taken back.</p>
        </>
      ) : (
        <>
          <p className="eyebrow">Sealed</p>
          <h3>A card waits here</h3>
          <p>Complete the matching challenge to unseal this page.</p>
        </>
      )}
    </article>
  )
}
