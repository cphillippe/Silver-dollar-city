import { useMemo, useState } from 'react'
import { shuffle } from '../lib/shuffle'
import type { EvidenceBrief } from '../content/evidence'

interface RecallGateProps {
  brief: EvidenceBrief
  kicker?: string
  onHeld: () => void
  onPassed?: () => void
}

type Phase = 'invite' | 'claim' | 'reason' | 'teach' | 'held'

/**
 * Same verbs as the puzzles: snap a line, then a reason.
 * Teaching folds first so the lock-in is retrieval — still a game, not a worksheet.
 */
export function RecallGate({
  brief,
  kicker = 'Lock it in',
  onHeld,
  onPassed,
}: RecallGateProps) {
  const claimOptions = useMemo(
    () => shuffle([...brief.claimChoices]),
    [brief.id, brief.claimChoices],
  )
  const reasonOptions = useMemo(
    () => shuffle([...brief.reasonChoices]),
    [brief.id, brief.reasonChoices],
  )
  const [phase, setPhase] = useState<Phase>('invite')
  const [misses, setMisses] = useState(0)
  const [flash, setFlash] = useState<string | null>(null)
  const [shake, setShake] = useState(false)

  function pick(line: string, correct: string, next: Phase) {
    if (line === correct) {
      setPhase(next)
      if (next === 'held') onHeld()
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
    }, 420)
  }

  function finishFromTeach() {
    setPhase('held')
    onHeld()
    onPassed?.()
  }

  return (
    <section className={`recall-gate ${shake ? 'is-shake' : ''} phase-${phase}`}>
      <p className="eyebrow">{kicker}</p>

      {phase === 'invite' ? (
        <>
          <h2>The page folds. Rebuild the line.</h2>
          <p>
            Same snap as the puzzle — one claim, then one reason. Close the
            teaching so it can stay.
          </p>
          <button
            type="button"
            className="btn primary xl"
            onClick={() => setPhase('claim')}
          >
            Fold the page
          </button>
        </>
      ) : null}

      {phase === 'claim' ? (
        <>
          <h2>Which claim did this walk lock in?</h2>
          <p className="quiet">From memory. The long page is face-down.</p>
          <div className="recall-choices">
            {claimOptions.map((line) => (
              <button
                key={line}
                type="button"
                className={`match-card recall-card ${flash === line ? 'is-flash' : ''}`}
                onClick={() => pick(line, brief.claim, 'reason')}
              >
                {line}
              </button>
            ))}
          </div>
        </>
      ) : null}

      {phase === 'reason' ? (
        <>
          <p className="streak-pill pop-in">Claim locked</p>
          <h2>Now the reason.</h2>
          <p className="quiet">Why does that claim stand?</p>
          <div className="recall-choices">
            {reasonOptions.map((line) => (
              <button
                key={line}
                type="button"
                className={`match-card recall-card ${flash === line ? 'is-flash' : ''}`}
                onClick={() => pick(line, brief.reason, 'held')}
              >
                {line}
              </button>
            ))}
          </div>
        </>
      ) : null}

      {phase === 'teach' ? (
        <>
          <h2>Say it with us — then it’s yours.</h2>
          <article className="unlock-card pop-in">
            <p className="eyebrow">{brief.source}</p>
            <p className="recall-line">{brief.claim}</p>
            <p>{brief.reason}</p>
          </article>
          <button type="button" className="btn primary xl" onClick={finishFromTeach}>
            I’ve got the line
          </button>
        </>
      ) : null}

      {phase === 'held' ? (
        <div className="held-stamp pop-in">
          <div className="burst" aria-hidden>
            <span />
            <span />
            <span />
            <span />
          </div>
          <p className="streak-pill">Held</p>
          <p className="recall-line">{brief.claim}</p>
          <p className="quiet">{brief.source}</p>
        </div>
      ) : null}
    </section>
  )
}
