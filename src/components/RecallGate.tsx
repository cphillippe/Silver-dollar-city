import { useMemo, useState } from 'react'
import { shuffle } from '../lib/shuffle'
import { takeawayLines, type EvidenceBrief } from '../content/evidence'
import { STORY } from '../content/story'
import { EASY, isEasy } from '../lib/easy'
import { WORDS } from '../lib/words'
import { learningBeat } from '../lib/learning'
import { learningPicture, toolForEvidence } from '../lib/watchTools'
import { useProgress } from '../store/progress'
import { DigDeeper } from './DigDeeper'
import { GemMark } from './GemMark'
import { PlainTalk } from './PlainTalk'

interface RecallGateProps {
  brief: EvidenceBrief
  keeps?: { text: string; why?: string }[]
  kicker?: string
  pillar?: string
  mode?: 'encode' | 'review'
  onHeld: (result: { clean: boolean }) => void
}

type Phase = 'claim' | 'reason' | 'teach'

/**
 * Encode (right after lock-in): player taps the Keep they will hold, then
 * Why-it-stands for THAT line — no inversions, no silent auto-pick.
 * Review (dust-off): choose among decoys that are not word-flips of the keep.
 * After every tap: Next/Done or loud success/miss. Reason never sits still.
 */
export function RecallGate({
  brief,
  keeps,
  kicker = STORY.tapTakeaway,
  mode = 'encode',
  onHeld,
}: RecallGateProps) {
  const { progress } = useProgress()
  const easy = isEasy(progress)
  const encode = mode === 'encode'
  const tool = toolForEvidence(brief.id)
  const picture = learningPicture(brief.id, tool)
  const beat = learningBeat(brief.id)
  const lines = useMemo(() => takeawayLines(brief, keeps), [brief, keeps])
  const own = encode && lines.length > 1
  const [chosen, setChosen] = useState<(typeof lines)[0] | null>(own ? null : lines[0] ?? null)
  const claimOptions = useMemo(() => {
    if (encode) return own ? lines.map((item) => item.claim) : [brief.claim]
    const pool = shuffle([...brief.claimChoices])
    if (!easy) return pool
    const miss = pool.find((line) => line !== brief.claim)
    return shuffle([brief.claim, miss].filter((line): line is string => Boolean(line)))
  }, [brief.id, brief.claim, brief.claimChoices, encode, own, lines, easy])
  const reasonOptions = useMemo(() => {
    if (encode) return [chosen?.reason ?? brief.reason]
    const pool = shuffle([...brief.reasonChoices])
    if (!easy) return pool
    const correct = chosen?.reason ?? brief.reason
    const miss = pool.find((line) => line !== correct)
    return shuffle([correct, miss].filter((line): line is string => Boolean(line)))
  }, [brief.id, brief.reason, brief.reasonChoices, encode, chosen, easy])
  const [phase, setPhase] = useState<Phase>('claim')
  const [misses, setMisses] = useState(0)
  const [flash, setFlash] = useState<string | null>(null)
  const [shake, setShake] = useState(false)
  const [heldNote, setHeldNote] = useState(false)
  const [reasonLocked, setReasonLocked] = useState(false)
  const heldClaim = chosen?.claim ?? brief.claim
  const heldReason = chosen?.reason ?? brief.reason
  const confirmReason = encode || reasonOptions.length === 1 || reasonLocked

  const nextTap =
    phase === 'teach'
      ? 'Read this, then tap Got it.'
      : phase === 'reason'
        ? confirmReason
          ? easy
            ? reasonLocked
              ? 'That reason holds. Tap Done.'
              : 'Read why it stands, then tap Done.'
            : 'Tap Done when you have the reason.'
          : easy
            ? 'Tap the reason that still holds.'
            : 'Tap the reason that holds.'
        : easy
          ? encode
            ? 'Choose the sentence to remember.'
            : 'Tap the sentence you still remember.'
          : kicker

  function settle(clean: boolean) {
    onHeld({ clean })
  }

  function pick(line: string, correct: string, next: Phase | 'lock' | 'done') {
    if (line === correct) {
      if (next === 'done') {
        settle(misses === 0)
        return
      }
      if (next === 'lock') {
        setReasonLocked(true)
        setFlash(line)
        return
      }
      setPhase(next)
      return
    }
    const nextMisses = misses + 1
    setMisses(nextMisses)
    setFlash(line)
    setShake(true)
    window.setTimeout(() => {
      setShake(false)
      setFlash(null)
      if (nextMisses >= 2) setPhase('teach')
    }, 320)
  }

  function pickClaim(line: string) {
    if (encode && own) {
      const hit = lines.find((item) => item.claim === line)
      if (hit) {
        setChosen(hit)
        setHeldNote(true)
        setPhase('reason')
        return
      }
    }
    if (line === brief.claim || (encode && !own)) {
      setHeldNote(true)
    }
    pick(line, brief.claim, 'reason')
  }

  function finishFromTeach() {
    settle(false)
  }

  return (
    <section
      className={`recall-gate ${shake ? 'is-shake' : ''} phase-${phase} ${encode ? 'is-encode' : 'is-review'} ${own ? 'is-own' : ''}`}
      aria-label={STORY.takeaway}
    >
      <p className="eyebrow">{brief.source ? brief.source : 'Hold'}</p>
      <p className="next-tap">{nextTap}</p>
      {encode ? (
        easy ? (
          <p className="quiet">{EASY.claimTeach} You will hold this same line.</p>
        ) : (
          <p className="learning-store">
            {picture ? <GemMark gem={picture} size="sm" /> : null}
            <span>Picture this: {beat}</span>
          </p>
        )
      ) : (
        <p className="quiet">
          {easy
            ? `${EASY.claimTeach} Then the reason — why it stands.`
            : 'Rebuild the map — claim, then why it stands.'}
        </p>
      )}
      <PlainTalk id={brief.id} />

      {phase === 'claim' ? (
        <div className="recall-choices">
          {claimOptions.map((line) => (
            <button
              key={line}
              type="button"
              className={`match-card recall-card ${flash === line ? 'is-flash' : ''}`}
              onClick={() => pickClaim(line)}
            >
              {line}
            </button>
          ))}
        </div>
      ) : null}

      {phase === 'reason' ? (
        <>
          {heldNote ? (
            <p className="match-toast" role="status">
              <strong>Held.</strong>{' '}
              {easy ? 'That sentence is yours to remember.' : 'That claim is yours to keep.'}
            </p>
          ) : null}
          <p className="recall-line rehearse-stem">{heldClaim}</p>
          <h2>{easy ? `${WORDS.reason.term} — ${WORDS.reason.sense}` : STORY.whyItStands}</h2>
          {easy ? <p className="quiet">{WORDS.reason.teach}</p> : null}
          {reasonLocked ? (
            <p className="match-toast" role="status">
              <strong>That reason holds.</strong>
            </p>
          ) : null}
          {confirmReason ? (
            <>
              <p className="reason-held">{heldReason}</p>
              <button
                type="button"
                className="btn gold xl recall-done"
                onClick={() => settle(misses === 0)}
              >
                Done
              </button>
            </>
          ) : (
            <div className="recall-choices">
              {reasonOptions.map((line) => (
                <button
                  key={line}
                  type="button"
                  className={`match-card recall-card ${flash === line ? 'is-flash' : ''}`}
                  onClick={() => pick(line, heldReason, 'lock')}
                >
                  {line}
                </button>
              ))}
            </div>
          )}
        </>
      ) : null}

      {phase === 'teach' ? (
        <>
          <h2>Here’s the line.</h2>
          <article className="unlock-card pop-in">
            <p className="recall-line">{heldClaim}</p>
            <p>{heldReason}</p>
            <PlainTalk id={brief.id} teach />
          </article>
          <button type="button" className="btn primary xl" onClick={finishFromTeach}>
            Got it
          </button>
          <DigDeeper id={brief.id} />
        </>
      ) : null}
    </section>
  )
}
