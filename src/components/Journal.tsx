import { useState } from 'react'
import { areas, journalEntries, pillarFor } from '../content'
import { evidenceFor, evidenceForJournal } from '../content/evidence'
import { guideForArea, STORY } from '../content/story'
import { localDateKey } from '../lib/dates'
import { EASY, easyFacingLine, easyJournalMeta, isEasy } from '../lib/easy'
import { isDue, nextGapLabel } from '../lib/memory'
import { starLegend } from '../lib/stars'
import { deployLabel, findLearning, storedLearnings, withLearningBeat } from '../lib/learning'
import { watchTool } from '../lib/watchTools'
import { DigDeeper } from './DigDeeper'
import { SavedTree, SavedTreeSummary } from './SavedTree'
import { GemMark } from './GemMark'
import { Landmark } from './Landmark'
import { RecallGate } from './RecallGate'
import { ShareInvite } from './ShareInvite'
import { StarRow } from './StarRow'
import {
  dueCount,
  journalCompletion,
  nextRebuildHint,
  useProgress,
} from '../store/progress'
import { markLater, readLater, sessionDue } from '../lib/recall'
import { RecallOffer } from './RecallOffer'
import { trailDaysRequired } from '../lib/streak'
import type { JournalEntry, Learning, MemoryTrace, View } from '../types'

interface JournalProps {
  focusId?: string
  autoQuiz?: boolean
  onNavigate: (view: View) => void
}

export function Journal({ focusId, autoQuiz, onNavigate }: JournalProps) {
  const { progress, recordReview, snoozeReviews } = useProgress()
  const easy = isEasy(progress)
  const today = localDateKey()
  const { open, total, percent } = journalCompletion(progress)
  const trailNotes = journalEntries.filter((entry) => entry.areaId === 'daily-trail')
  const districtChapters = areas.map((area) => ({
    area,
    entries: journalEntries.filter((entry) => entry.areaId === area.id),
  }))
  const heldCount = progress.held.length
  const [later, setLater] = useState(() => readLater(today))
  const sessionItems = sessionDue(progress, today, later)
  const dueItems = sessionItems
    .map((trace) => ({
      trace,
      brief: evidenceFor(trace.id),
      entry:
        journalEntries.find((item) => item.unlockAfter === trace.id) ??
        journalEntries.find((item) => item.id === trace.id),
    }))
    .filter((item) => item.brief)
  const waiting = dueCount(progress, today)
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
  const quizBrief = focusedBrief ?? (focusId ? evidenceFor(focusId) : undefined)

  if (autoQuiz && quizBrief && (!focusedEntry || focusedOpen)) {
    const pillar = focusedEntry?.areaId ?? pillarFor(quizBrief.id)
    return (
      <main className="journal is-rehearse">
        <button
          type="button"
          className="text-link"
          onClick={() =>
            onNavigate(
              focusedEntry
                ? { name: 'journal', focusId: focusedEntry.id }
                : { name: 'journal' },
            )
          }
        >
          ← Journal
        </button>
        <section className="rehearse-anchor">
          <p className="eyebrow">{easy ? 'The sentence to remember' : 'Takeaway'}</p>
          <h1>{focusedEntry?.title ?? (easy ? EASY.rememberSentence : STORY.tapTakeaway)}</h1>
          <RecallGate
            brief={quizBrief}
            mode="review"
            visits={progress.memory[quizBrief.id]?.reviews ?? 0}
            kicker={STORY.tapTakeaway}
            onHeld={(result) => {
              recordReview({
                id: quizBrief.id,
                pillar,
                kind: 'recall',
                today,
                clean: result.clean,
                peeked: false,
                elaborated: false,
              })
              onNavigate(
                focusedEntry
                  ? { name: 'journal', focusId: focusedEntry.id }
                  : { name: 'journal' },
              )
            }}
            onSkip={(how) => {
              if (how === 'not-today') snoozeReviews([quizBrief.id], today)
              setLater(markLater(today, [quizBrief.id], true))
              onNavigate(
                focusedEntry
                  ? { name: 'journal', focusId: focusedEntry.id }
                  : { name: 'journal' },
              )
            }}
          />
        </section>
      </main>
    )
  }

  return (
    <main className={`journal ${dueItems.length ? 'has-due' : ''}`}>
      {dueItems.length > 0 ? (
        <section className="journal-chapter due-chapter">
          <RecallOffer
            items={dueItems.map((item) => ({
              id: item.trace.id,
              title: item.entry?.title ?? item.brief?.claim ?? 'A held line',
            }))}
            onOpen={(id) => {
              const hit = dueItems.find((item) => item.trace.id === id)
              onNavigate({
                name: 'journal',
                focusId: hit?.entry?.id ?? id,
                autoQuiz: true,
              })
            }}
            onLater={() =>
              setLater(markLater(today, dueItems.map((item) => item.trace.id), true))
            }
            onNotToday={() => {
              snoozeReviews(
                dueItems.map((item) => item.trace.id),
                today,
              )
              setLater(markLater(today, dueItems.map((item) => item.trace.id), true))
            }}
          />
        </section>
      ) : (
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
      )}

      <header className="page-head journal-head">
        <p className="eyebrow">{easy ? EASY.saved : 'Evidence Journal'}</p>
        <h1>What you can still say</h1>
        <p>
          {easy
            ? `${heldCount} sentences kept${waiting ? ` · ${waiting} due to read again` : ''}.`
            : `${open} of ${total} unsealed · ${percent}% of the dossier · ${heldCount} lines held from memory${waiting ? ` · ${waiting} due to dust off` : ''}. Forgetting is why a page comes back.`}
        </p>
        {easy ? null : (
        <>
        <div
          className="journal-meter"
          role="img"
          aria-label={
            easy
              ? `${percent} percent of journal pages open, ${heldCount} kept, ${waiting} due`
              : `${percent} percent of the journal unsealed, ${heldCount} held, ${waiting} due`
          }
        >
          <span style={{ width: `${percent}%` }} />
        </div>
        <p className="journal-split">
          {easy
            ? `${open} open · ${total - open} still closed · ${heldCount} kept`
            : `${open} unsealed · ${total - open} sealed · ${heldCount} held`}
          {waiting ? ` · ${waiting} due this morning` : ''}
        </p>
        </>
        )}
      </header>

      {progress.learnings.length > 0 ? (
        <SavedTree
          className="journal-chapter stored-chapter"
          startOpen={!focusedEntry || Boolean(focusId?.startsWith('learn-'))}
        >
          <SavedTreeSummary
            who="juniper"
            label={easy ? EASY.saved : 'Stored lines'}
            count={progress.learnings.length}
          />
          <p className="quiet saved-tree-lead">
            {easy
              ? 'Sentences you kept.'
              : 'Each learning is its own unit: claim · reason · source · anchor · picture · tool.'}
          </p>
          <div className="card-grid">
            {storedLearnings(progress).map((raw) => {
              const learning = withLearningBeat(raw)
              const tool = deployLabel(learning)
              const trace = progress.memory[learning.id]
              return (
                <article key={learning.id} id={`learn-${learning.id}`} className="dossier is-open is-stored">
                  <p className="eyebrow">Stored · {learning.source}</p>
                  {learning.picture ? <GemMark gem={learning.picture} size="sm" /> : null}
                  <h3>{easy ? easyFacingLine(learning.id, learning.claim) : learning.claim}</h3>
                  {easy ? null : (
                  <p>{learning.reason}</p>
                  )}
                  <p className="learning-store">
                    {learning.picture ? <GemMark gem={learning.picture} size="sm" /> : null}
                    <span>
                      {easy
                        ? easyJournalMeta({ ...learning, tool })
                        : `Anchored to ${learning.anchor}${learning.beat ? ` · pictured as ${learning.beat}` : ''}${tool ? ` · deploys as ${tool}` : ''}`}
                    </span>
                  </p>
                  {trace ? <p className="quiet">{nextGapLabel(trace, today, easy)}</p> : null}
                  {easy ? null : (
                  <DigDeeper
                    id={learning.id}
                    surface="journal"
                    why={learning.reason}
                    source={learning.source}
                  />
                  )}
                </article>
              )
            })}
          </div>
        </SavedTree>
      ) : null}

      {easy ? null : (
      <>
      <SavedTree
        className="journal-chapter"
        startOpen={
          focusedEntry?.areaId === 'daily-trail' ||
          (progress.learnings.length === 0 && !focusedEntry)
        }
      >
        <SavedTreeSummary
          who="juniper"
          label={easy ? 'Juniper’s pages' : 'Trail notes'}
          count={trailNotes.length}
        />
        <p className="quiet saved-tree-lead">
          {easy
            ? 'They open when you come back, not only when you finish a street.'
            : 'They open when you return, not only when you clear a district.'}
        </p>
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
              learning={
                findLearning(progress, entry.unlockAfter) ?? findLearning(progress, entry.id)
              }
              today={today}
            />
          ))}
        </div>
      </SavedTree>

      <SavedTree
        className="journal-chapter"
        startOpen={Boolean(focusedEntry && focusedEntry.areaId !== 'daily-trail')}
      >
        <SavedTreeSummary
          who="river"
          label="Places"
          count={districtChapters.reduce((n, chapter) => n + chapter.entries.length, 0)}
        />
        <p className="quiet saved-tree-lead">
          {easy
            ? 'Pages from each street you walked. Tap a street to open it.'
            : 'District chapters. Unsealed pages keep the claim.'}
        </p>
        {districtChapters.map(({ area, entries }) => (
          <SavedTree
            key={area.id}
            className="saved-tree-nested"
            startOpen={focusedEntry?.areaId === area.id}
          >
            <SavedTreeSummary
              who={guideForArea(area.id).id}
              label={area.shortTitle}
              count={entries.length}
            />
            <p className="quiet saved-tree-lead">
              {guideForArea(area.id).name} · {area.subtitle}
            </p>
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
                  learning={findLearning(progress, entry.unlockAfter)}
                  today={today}
                />
              ))}
            </div>
          </SavedTree>
        ))}
      </SavedTree>
      </>
      )}

      {easy ? null : <ShareInvite />}

      <button
        type="button"
        className="btn ghost"
        onClick={() => onNavigate({ name: 'hub' })}
      >
        {easy ? EASY.home : 'Return to the map'}
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
  learning,
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
  learning?: Learning
  today: string
}) {
  const { recordHeld, recordReview, snoozeReviews, progress } = useProgress()
  const easy = isEasy(progress)
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
            <p className="quiet">{nextGapLabel(trace, today, easy)}</p>
          ) : null}
          {learning ? (
            <p className="learning-store">
              {learning.picture ? <GemMark gem={learning.picture} size="sm" /> : null}
              <span>
                {easy
                  ? easyJournalMeta({
                      ...withLearningBeat(learning),
                      tool: learning.toolId
                        ? watchTool(learning.toolId)?.label ?? learning.toolId
                        : undefined,
                    })
                  : `Anchored to ${learning.anchor}${
                      withLearningBeat(learning).beat
                        ? ` · pictured as ${withLearningBeat(learning).beat}`
                        : ''
                    }${
                      learning.toolId
                        ? ` · deploys as ${watchTool(learning.toolId)?.label ?? learning.toolId}`
                        : ''
                    }`}
              </span>
            </p>
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
                {easy ? EASY.rememberSentence : STORY.tapTakeaway}
              </button>
            </>
          ) : brief && quizAgain ? (
            <>
              <p className="eyebrow">{easy ? EASY.rememberSentence : STORY.tapTakeaway}</p>
              <RecallGate
                brief={brief}
                kicker={due ? STORY.tapTakeaway : 'Journal recall'}
                mode={due ? 'review' : 'encode'}
                visits={trace?.reviews ?? 0}
                onSkip={
                  due
                    ? (how) => {
                        if (how === 'not-today') snoozeReviews([brief.id], today)
                        setFace('read')
                        setQuizAgain(false)
                      }
                    : undefined
                }
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
              <DigDeeper id={entry.unlockAfter} surface="journal" />
              {brief ? (
                <button
                  type="button"
                  className="btn ghost"
                  onClick={() => setQuizAgain(true)}
                >
                  {STORY.takeaway}
                </button>
              ) : null}
            </>
          )}
        </>
      ) : mystery ? (
        <>
          <p className="eyebrow">{easy ? 'A hidden page' : 'A mystery page'}</p>
          <h3>{easy ? 'A page waits here' : 'A trail note waits here'}</h3>
          <p>
            {need
              ? easy
                ? `Walk ${need} morning${need === 1 ? '' : 's'} on Today’s Trail to open this — you have ${daysWalked}.`
                : `Walk ${need} distinct morning${need === 1 ? '' : 's'} on Today’s Trail to unseal this — you have ${daysWalked}.`
              : easy
                ? 'Come back for Daily Trail mornings to open this page.'
                : 'Return for Daily Trail mornings to unseal this page.'}
          </p>
          <p className="quiet">The trail waits. Nothing here is taken back.</p>
        </>
      ) : (
        <>
          <p className="eyebrow">{easy ? 'Still closed' : 'Sealed'}</p>
          <h3>A card waits here</h3>
          <p>
            {easy
              ? 'Finish the matching walk to open this page.'
              : 'Complete the matching challenge to unseal this page.'}
          </p>
        </>
      )}
    </article>
  )
}
