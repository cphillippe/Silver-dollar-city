import { useMemo, useState } from 'react'
import { shuffle } from '../lib/shuffle'
import { takeawayLines, type EvidenceBrief } from '../content/evidence'
import { STORY } from '../content/story'
import { EASY, easyChromeLine, easyFacingLine, isEasy, uniqueHoldChoices } from '../lib/easy'
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
  const claimFace = (line: string) => (easy ? easyFacingLine(brief.id, line) : line)
  const reasonFace = (line: string) => (easy ? easyChromeLine(line) : line)
  const claimOptions = useMemo(() => {
    if (encode) {
      const raw = own ? lines.map((item) => item.claim) : [brief.claim]
      return uniqueHoldChoices(raw, claimFace, raw[0] ?? brief.claim)
    }
    const pool = shuffle([...brief.claimChoices])
    const raw = easy
      ? shuffle(
          [brief.claim, pool.find((line) => line !== brief.claim)].filter(
            (line): line is string => Boolean(line),
          ),
        )
      : pool
    return uniqueHoldChoices(raw, claimFace, brief.claim)
  }, [brief.id, brief.claim, brief.claimChoices, encode, own, lines, easy])
  const reasonOptions = useMemo(() => {
    const correct = chosen?.reason ?? brief.reason
    if (encode) return uniqueHoldChoices([correct], reasonFace, correct)
    const pool = shuffle([...brief.reasonChoices])
    const raw = easy
      ? shuffle(
          [correct, pool.find((line) => line !== correct)].filter(
            (line): line is string => Boolean(line),
          ),
        )
      : pool
    return uniqueHoldChoices(raw, reasonFace, correct)
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

  const easyEncode = easy && encode
  const easyLineReady = !own || Boolean(chosen)
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
              : EASY.whyStands
            : deeper
              ? 'Tap Done when the sharper hold is clear.'
              : 'Tap Done when you have the reason.'
          : easy
            ? EASY.tapWhy
            : deeper
              ? 'What still makes this stand — not the first teach.'
              : 'Tap the reason that holds.'
        : easy
          ? EASY.rememberSentence
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

  if (easyEncode) {
    return (
      <section
        className={`recall-gate is-encode is-easy-hold ${shake ? 'is-shake' : ''} ${own ? 'is-own' : ''}`}
        aria-label={STORY.takeaway}
      >
        <p className="eyebrow">{brief.source ? brief.source : 'Hold'}</p>
        {!easyLineReady ? (
          <>
            <p className="teach-chip" role="note">
              {EASY.mainIdeaTeach}
            </p>
            <p className="next-tap">{EASY.rememberSentence}</p>
            <div className="recall-choices">
              {claimOptions.map((line) => (
                <button
                  key={line}
                  type="button"
                  className={`match-card recall-card ${flash === line ? 'is-flash' : ''}`}
                  onClick={() => pickClaim(line)}
                >
                  {easyFacingLine(brief.id, line)}
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <p className="teach-chip" role="note">
              {EASY.reasonTeach}
            </p>
            <p className="next-tap">{EASY.tapWhy}</p>
            <p className="recall-line rehearse-stem">
              {easyFacingLine(brief.id, heldClaim)}
            </p>
            <div className="reason-scroll">
              <p className="reason-held">{easyChromeLine(heldReason)}</p>
            </div>
            <div className="cta-dock">
              <button
                type="button"
                className="btn primary xl recall-done"
                onClick={() => settle(true)}
              >
                {EASY.keepThis}
              </button>
            </div>
          </>
        )}
      </section>
    )
  }

  return (
    <section
      className={`recall-gate ${shake ? 'is-shake' : ''} phase-${phase} ${encode ? 'is-encode' : 'is-review'} ${own ? 'is-own' : ''} ${deeper ? 'is-deeper' : ''}`}
      aria-label={STORY.takeaway}
    >
      <p className="eyebrow">{brief.source ? brief.source : 'Hold'}</p>
      <p className="next-tap">{nextTap}</p>
      {encode ? (
        <p className="learning-store">
          {picture ? <GemMark gem={picture} size="sm" /> : null}
          <span>Picture this: {beat}</span>
        </p>
      ) : (
        <p className="quiet">
          {deeper
            ? easy
              ? 'A new angle — not the first read again.'
              : 'A new angle on a line you already hold — not the first teach again.'
            : easy
              ? EASY.tapWhy
              : 'Rebuild the map — claim, then why it stands.'}
        </p>
      )}
      {deeper || easy ? null : <PlainTalk id={brief.id} />}

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
              {easy ? 'That line is yours to keep.' : 'That claim is yours to keep.'}
            </p>
          ) : null}
          <p className="recall-line rehearse-stem">
            {easy ? easyFacingLine(brief.id, heldClaim) : heldClaim}
          </p>
          {easy ? null : (
          <h2>
            {deeper ? 'A sharper hold' : STORY.whyItStands}
          </h2>
          )}
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
                  {easy ? easyChromeLine(line) : line}
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
