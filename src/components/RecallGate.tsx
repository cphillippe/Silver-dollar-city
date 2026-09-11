import { useMemo, useState } from 'react'
import { shuffle } from '../lib/shuffle'
import { takeawayLines, type EvidenceBrief } from '../content/evidence'
import { STORY } from '../content/story'
import { EASY, easyFacingLine, easyMainIdea, isEasy } from '../lib/easy'
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
  /** Prior successful/failed recalls. 1+ means this is a later revisit. */
  visits?: number
  onHeld: (result: { clean: boolean }) => void
  onSkip?: (how: 'later' | 'not-today') => void
}

type Phase = 'claim' | 'reason' | 'teach'

/**
 * Encode (right after lock-in): player taps the Keep they will hold, then
 * Why-it-stands for THAT line — no inversions, no silent auto-pick.
 * Review (dust-off): choose among decoys that are not word-flips of the keep.
 * Later revisits start on a sharper reason ask and open Dig deeper — not the first teach again.
 * After every tap: Next/Done or loud success/miss. Reason never sits still.
 */
export function RecallGate({
  brief,
  keeps,
  kicker = STORY.tapTakeaway,
  mode = 'encode',
  visits = 0,
  onHeld,
  onSkip,
}: RecallGateProps) {
  const { progress } = useProgress()
  const easy = isEasy(progress)
  const encode = mode === 'encode'
  const deeper = !encode && visits >= 1
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
  const [phase, setPhase] = useState<Phase>(deeper ? 'reason' : 'claim')
  const [misses, setMisses] = useState(0)
  const [flash, setFlash] = useState<string | null>(null)
  const [shake, setShake] = useState(false)
  const [heldNote, setHeldNote] = useState(false)
  const [reasonLocked, setReasonLocked] = useState(false)
  const [sealed, setSealed] = useState(false)
  const heldClaim = chosen?.claim ?? brief.claim
  const heldReason = chosen?.reason ?? brief.reason
  const confirmReason = encode || reasonOptions.length === 1 || reasonLocked
  const showDeeperBeat = deeper && (sealed || reasonLocked || phase === 'teach')

  const nextTap =
    phase === 'teach'
      ? 'Read this, then tap Got it.'
      : phase === 'reason'
        ? confirmReason
          ? easy
            ? reasonLocked
              ? deeper
                ? 'That still holds. Tap Done.'
                : 'That reason holds. Tap Done.'
              : 'Read why this is true, then tap Done.'
            : deeper
              ? 'Tap Done when the sharper hold is clear.'
              : 'Tap Done when you have the reason.'
          : easy
            ? deeper
              ? 'Why is this still true?'
              : 'Tap the reason that still holds.'
            : deeper
              ? 'What still makes this stand — not the first teach.'
              : 'Tap the reason that holds.'
        : easy
          ? encode
            ? EASY.rememberSentence
            : deeper
              ? 'Which sentence was the hold?'
              : 'Tap the sentence you still remember.'
          : deeper
            ? 'Which sentence was the hold?'
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
    if (deeper) {
      if (line === brief.claim) {
        setHeldNote(true)
        setSealed(true)
        return
      }
      pick(line, brief.claim, 'done')
      return
    }
    pick(line, brief.claim, 'reason')
  }

  function finishFromTeach() {
    settle(false)
  }

  return (
    <section
      className={`recall-gate ${shake ? 'is-shake' : ''} phase-${phase} ${encode ? 'is-encode' : 'is-review'} ${own ? 'is-own' : ''} ${deeper ? 'is-deeper' : ''}`}
      aria-label={STORY.takeaway}
    >
      <p className="eyebrow">{brief.source ? brief.source : 'Hold'}</p>
      <p className="next-tap">{nextTap}</p>
      {encode ? (
        easy ? (
          <p className="quiet">You will keep this main idea.</p>
        ) : (
          <p className="learning-store">
            {picture ? <GemMark gem={picture} size="sm" /> : null}
            <span>Picture this: {beat}</span>
          </p>
        )
      ) : (
        <p className="quiet">
          {deeper
            ? easy
              ? 'A new angle — not the first read again.'
              : 'A new angle on a line you already hold — not the first teach again.'
            : easy
              ? 'Then the reason — why this is true.'
              : 'Rebuild the map — claim, then why it stands.'}
        </p>
      )}
      {deeper ? null : <PlainTalk id={brief.id} />}

      {phase === 'claim' ? (
        <>
          <div className="recall-choices">
            {claimOptions.map((line) => (
              <button
                key={line}
                type="button"
                className={`match-card recall-card ${flash === line ? 'is-flash' : ''} ${sealed && line === heldClaim ? 'is-locked' : ''}`}
                onClick={() => {
                  if (!sealed) pickClaim(line)
                }}
              >
                {easy ? easyFacingLine(brief.id, line) : line}
              </button>
            ))}
          </div>
          {sealed ? (
            <>
              <p className="match-toast" role="status">
                <strong>That still holds.</strong>
              </p>
              {showDeeperBeat ? <DigDeeper id={brief.id} compact /> : null}
              <div className="cta-dock">
                <button
                  type="button"
                  className="btn gold xl recall-done"
                  onClick={() => settle(misses === 0)}
                >
                  Done
                </button>
              </div>
            </>
          ) : null}
        </>
      ) : null}

      {phase === 'reason' ? (
        <>
          {heldNote ? (
            <p className="match-toast" role="status">
              <strong>Held.</strong>{' '}
              {easy ? 'That sentence is yours to remember.' : 'That claim is yours to keep.'}
            </p>
          ) : null}
          <p className="recall-line rehearse-stem">
            {easy ? easyFacingLine(brief.id, heldClaim) : heldClaim}
          </p>
          <h2>
            {deeper
              ? easy
                ? 'Why is this still true?'
                : 'A sharper hold'
              : easy
                ? `${WORDS.reason.term} — ${EASY.reasonSense}`
                : STORY.whyItStands}
          </h2>
          {reasonLocked ? (
            <p className="match-toast" role="status">
              <strong>{deeper ? 'That still holds.' : 'That reason holds.'}</strong>
            </p>
          ) : null}
          {confirmReason ? (
            <>
              <p className="reason-held">{heldReason}</p>
              {showDeeperBeat ? <DigDeeper id={brief.id} compact /> : null}
              <div className="cta-dock">
                <button
                  type="button"
                  className="btn gold xl recall-done"
                  onClick={() => settle(misses === 0)}
                >
                  Done
                </button>
              </div>
            </>
          ) : (
            <div className="recall-choices">
              {reasonOptions.map((line) => (
                <button
                  key={line}
                  type="button"
                  className={`match-card recall-card ${flash === line ? 'is-flash' : ''}`}
                  onClick={() =>
                    pick(line, heldReason, deeper ? 'claim' : 'lock')
                  }
                >
                  {easy ? easyMainIdea(line) : line}
                </button>
              ))}
            </div>
          )}
        </>
      ) : null}

      {phase === 'teach' ? (
        <>
          <h2>{deeper ? 'Here’s the sharper line.' : 'Here’s the line.'}</h2>
          <article className="unlock-card pop-in">
            <p className="recall-line">{easy ? easyFacingLine(brief.id, heldClaim) : heldClaim}</p>
            <p>{heldReason}</p>
            <PlainTalk id={brief.id} teach />
          </article>
          <button type="button" className="btn primary xl" onClick={finishFromTeach}>
            Got it
          </button>
          <DigDeeper id={brief.id} />
        </>
      ) : null}

      {!encode && onSkip ? (
        <div className="recall-skip">
          <button type="button" className="text-link" onClick={() => onSkip('later')}>
            Later
          </button>
          <button type="button" className="text-link" onClick={() => onSkip('not-today')}>
            Not today
          </button>
        </div>
      ) : null}
    </section>
  )
}
