import type { Dispatch, SetStateAction } from 'react'
import { pillarFor } from '../../content'
import type { EvidenceBrief } from '../../content/evidence'
import { STORY } from '../../content/story'
import { EASY, isEasy } from '../../lib/easy'
import { markLater, type RecallLaterState } from '../../lib/recall'
import { offerSupportToast } from '../../lib/supportToast'
import { needsTierHold } from '../../lib/tiers'
import { EasyBack } from '../../components/EasyBack'
import { RecallGate } from '../../components/RecallGate'
import { useProgress } from '../../store/progress'
import type { JournalEntry, View } from '../../types'

interface HoldPracticeProps {
  quizBrief: EvidenceBrief
  focusedEntry?: JournalEntry
  today: string
  /** Journal's recall-later state — it stays mounted when Hard skips back to the page. */
  setLater: Dispatch<SetStateAction<RecallLaterState>>
  onNavigate: (view: View) => void
}

/**
 * Lock In hold practice (A3). Journal owns the gate, including the #448 teach-gate.
 * Render no wrapper: Lock In CSS targets `.journal.is-rehearse > .text-link` and `.rehearse-anchor` directly.
 */
export function HoldPractice({ quizBrief, focusedEntry, today, setLater, onNavigate }: HoldPracticeProps) {
  const { progress, recordHeld, recordReview, recordLessonHold, snoozeReviews } = useProgress()
  const easy = isEasy(progress)
  const pillar = focusedEntry?.areaId ?? pillarFor(quizBrief.id)
  const firstHold = !progress.held.includes(quizBrief.id)
  const advancing = firstHold || needsTierHold(progress, quizBrief.id)
  return (
    <main className={`journal is-rehearse ${easy ? 'is-easy-hold-practice' : ''}`}>
      {easy ? (
        <EasyBack onNavigate={onNavigate} />
      ) : (
        <button type="button" className="text-link" onClick={() => onNavigate({ name: 'journal' })}>
          ← Journal
        </button>
      )}
      <section className="rehearse-anchor">
        <p className="eyebrow">{easy ? EASY.saved : 'Takeaway'}</p>
        {easy ? null : <h1>{focusedEntry?.title ?? STORY.tapTakeaway}</h1>}
        <RecallGate
          brief={quizBrief}
          mode={easy && advancing ? 'encode' : 'review'}
          visits={progress.memory[quizBrief.id]?.reviews ?? 0}
          kicker={STORY.tapTakeaway}
          onHeld={(result) => {
            if (easy && advancing) {
              recordHeld(quizBrief.id)
              recordReview({
                id: quizBrief.id,
                pillar,
                kind: 'encode',
                today,
                clean: result.clean,
                peeked: false,
                elaborated: false,
              })
              recordLessonHold(quizBrief.id, result.clean)
              offerSupportToast()
              onNavigate({ name: 'hub' })
              return
            }
            recordReview({
              id: quizBrief.id,
              pillar,
              kind: 'recall',
              today,
              clean: result.clean,
              peeked: false,
              elaborated: false,
            })
            if (!result.clean) recordLessonHold(quizBrief.id, false)
            onNavigate(
              easy
                ? { name: 'hub' }
                : focusedEntry
                  ? { name: 'journal', focusId: focusedEntry.id }
                  : { name: 'journal' },
            )
          }}
          onSkip={
            easy
              ? undefined
              : (how) => {
                  if (how === 'not-today') snoozeReviews([quizBrief.id], today)
                  setLater(markLater(today, [quizBrief.id], true))
                  onNavigate(
                    focusedEntry
                      ? { name: 'journal', focusId: focusedEntry.id }
                      : { name: 'journal' },
                  )
                }
          }
        />
      </section>
    </main>
  )
}
