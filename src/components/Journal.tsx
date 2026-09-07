import { useState } from 'react'
import { areas, journalEntries } from '../content'
import { evidenceForJournal } from '../content/evidence'
import { guideForArea } from '../content/story'
import { localDateKey } from '../lib/dates'
import { isDue, nextGapLabel } from '../lib/memory'
import { starLegend } from '../lib/stars'
import { Avatar } from './Avatar'
import { Landmark } from './Landmark'
import { RecallGate } from './RecallGate'
import { ShareInvite } from './ShareInvite'
import { StarRow } from './StarRow'
import {
  dailyDoneToday,
  dueCount,
  dueForRecall,
  journalCompletion,
  nextRebuildHint,
  useProgress,
} from '../store/progress'
import { trailDaysRequired } from '../lib/streak'
import type { JournalEntry, MemoryTrace, View } from '../types'

interface JournalProps {
  focusId?: string
  autoQuiz?: boolean
  onNavigate: (view: View) => void
}

export function Journal({ focusId, autoQuiz, onNavigate }: JournalProps) {
  const { progress, recordReview } = useProgress()
  const today = localDateKey()
  const { open, total, percent } = journalCompletion(progress)
  const trailNotes = journalEntries.filter((entry) => entry.areaId === 'daily-trail')
  const districtChapters = areas.map((area) => ({
    area,
    entries: journalEntries.filter((entry) => entry.areaId === area.id),
  }))
  const heldCount = progress.held.length
  const dueItems = dueForRecall(progress, today).filter((item) => item.brief)
  const waiting = dueCount(progress, today)
  const trailOpen = !dailyDoneToday(progress, today)
  const nextStep = nextRebuildHint(progress, today)
  const focusedEntry = journalEntries.find(
    (entry) => entry.id === focusId || entry.unlockAfter === focusId,
  )
  const focusedOpen = Boolean(
    focusedEntry && progress.journal.includes(focusedEntry.id),
  )
  const focusedBrief = focusedEntry
    ? evidenceForJournal(focusedEntry.unlockAfter, focusedEntry.id)
    : undefined

  if (autoQuiz && focusedEntry && focusedOpen && focusedBrief) {
    return (
      <main className="journal is-rehearse">
        <button
          type="button"
          className="text-link"
          onClick={() =>
            onNavigate({ name: 'journal', focusId: focusedEntry.id })
          }
        >
          ← Journal
        </button>
        <section className="rehearse-anchor">
          <p className="eyebrow">Next recommended · Rehearse this</p>
          <h1>{focusedEntry.title}</h1>
          <p className="quiet">
            Tap the claim, then the reason. The long page stays face-down until
            the line is yours.
          </p>
          <RecallGate
            brief={focusedBrief}
            mode="review"
            kicker="Rehearse this"
            onHeld={(result) => {
              recordReview({
                id: focusedBrief.id,
                pillar: focusedEntry.areaId,
                kind: 'recall',
                today,
                clean: result.clean,
                peeked: false,
                elaborated: false,
              })
              onNavigate({ name: 'journal', focusId: focusedEntry.id })
            }}
          />
        </section>
      </main>
    )
  }

  return (
    <main className="journal">
      <section className="next-rebuild">
        <p className="eyebrow">Next recommended</p>
        <h2>{nextStep.title}</h2>
        <p>{nextStep.detail}</p>
        <button
          type="button"
          className="btn primary"
          onClick={() => onNavigate(nextStep.go)}
        >
          {nextStep.cta}
        </button>
      </section>

      <header className="page-head journal-head">
        <p className="eyebrow">Evidence Journal</p>
        <h1>What you can still say</h1>
        <p>
          {open} of {total} unsealed · {percent}% of the dossier · {heldCount}{' '}
          lines held from memory
          {waiting ? ` · ${waiting} due to dust off` : ''}. Open pages start
          face-down — rebuild the claim, then read. Forgetting is why a page
          comes back.
        </p>
        <div
          className="journal-meter"
          role="img"
          aria-label={`${percent} percent of the journal unsealed, ${heldCount} held, ${waiting} due`}
        >
          <span style={{ width: `${percent}%` }} />
        </div>
        <p className="journal-split">
          {open} unsealed · {total - open} sealed · {heldCount} held
          {waiting ? ` · ${waiting} due this morning` : ''}
        </p>
      </header>

      {dueItems.length > 0 ? (
        <section className="journal-chapter due-chapter">
          <div className="chapter-head">
            <Avatar who="juniper" size="sm" />
            <div>
              <h2>Due this morning</h2>
              <p>
                Time to dust these off. The trail mixes districts on purpose —
                never as a scolding.
              </p>
            </div>
          </div>
          {trailOpen ? (
            <button
              type="button"
              className="btn primary"
              onClick={() => onNavigate({ name: 'daily' })}
            >
              Walk today’s trail
            </button>
          ) : (
            <p className="quiet">
              This morning’s walk is marked. Remaining pages rest until a later
              sunrise.
            </p>
          )}
          <div className="card-grid">
            {dueItems.map((item) => (
              <article key={item.trace.id} className="dossier is-open is-due">
                <Landmark pillar={item.trace.pillar} compact />
                <p className="eyebrow">Due this morning</p>
                <h3>{item.entry?.title ?? item.brief?.claim}</h3>
                <p className="quiet">{item.brief?.claim}</p>
                <StarRow
                  count={progress.stars[item.trace.id] ?? 0}
                  compact
                  label={starLegend(progress.stars[item.trace.id] ?? 0)}
                />
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <section className="journal-chapter">
        <div className="chapter-head">
          <Avatar who="juniper" size="sm" />
          <div>
            <h2>Trail notes</h2>
            <p>Juniper’s pages — they open when you return, not only when you clear a district.</p>
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
              stars={progress.stars[entry.unlockAfter] ?? progress.stars[entry.id]}
              held={progress.held.includes(entry.unlockAfter) || progress.held.includes(entry.id)}
              trace={progress.memory[entry.unlockAfter] ?? progress.memory[entry.id]}
              today={today}
            />
          ))}
        </div>
      </section>

      {districtChapters.map(({ area, entries }) => (
        <section key={area.id} className="journal-chapter">
          <div className="chapter-head">
            <Avatar who={guideForArea(area.id).id} size="sm" />
            <div>
              <h2>{area.title}</h2>
              <p>
                {guideForArea(area.id).name} · {area.subtitle}
              </p>
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
                held={progress.held.includes(entry.unlockAfter)}
                trace={progress.memory[entry.unlockAfter]}
                today={today}
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
  held,
  trace,
  today,
}: {
  entry: JournalEntry
  open: boolean
  focused: boolean
  mystery?: boolean
  daysWalked?: number
  stars?: 1 | 2 | 3
  held?: boolean
  trace?: MemoryTrace
  today: string
}) {
  const { recordHeld, recordReview } = useProgress()
  const need = trailDaysRequired(entry.unlockAfter)
  const brief = evidenceForJournal(entry.unlockAfter, entry.id)
  const due = trace ? isDue(trace, today) : false
  const [face, setFace] = useState<'recall' | 'read'>(held ? 'read' : 'recall')
  const [quizAgain, setQuizAgain] = useState(
    Boolean(focused && open && brief && (!held || due)),
  )

  return (
    <article
      id={entry.id}
      className={`dossier ${open ? 'is-open' : mystery ? 'is-mystery' : 'is-sealed'} ${focused ? 'is-focus' : ''} ${held ? 'is-held' : ''} ${due ? 'is-due' : ''}`}
    >
      {open ? (
        <>
          <Landmark pillar={entry.areaId} compact />
          <div className="dossier-marks">
            {stars ? (
              <StarRow count={stars} compact label={starLegend(stars)} />
            ) : null}
            {stars ? <span className="held-mark">{starLegend(stars)}</span> : null}
            {due ? <span className="due-mark">Due this morning</span> : null}
            {held && !due ? <span className="held-mark">Held</span> : null}
          </div>
          {trace && !due ? (
            <p className="quiet">{nextGapLabel(trace, today)}</p>
          ) : null}
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
                Rehearse this
              </button>
            </>
          ) : brief && quizAgain ? (
            <>
              <p className="eyebrow">Rehearse this</p>
              <RecallGate
                brief={brief}
                pillar={entry.areaId}
                kicker={due ? 'Rehearse this' : 'Journal recall'}
                mode={due ? 'review' : 'encode'}
                onHeld={(result) => {
                  if (due) {
                    recordReview({
                      id: brief.id,
                      pillar: entry.areaId,
                      kind: 'recall',
                      today,
                      clean: result.clean,
                      peeked: false,
                      elaborated: false,
                    })
                  } else {
                    recordHeld(brief.id)
                  }
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
