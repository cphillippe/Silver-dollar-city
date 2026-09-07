import { useMemo, useState } from 'react'
import { shuffle } from '../lib/shuffle'
import type { EvidenceBrief } from '../content/evidence'
import { STORY } from '../content/story'

interface RecallGateProps {
  brief: EvidenceBrief
  kicker?: string
  pillar?: string
  mode?: 'encode' | 'review'
  onHeld: (result: { clean: boolean }) => void
}

type Phase = 'claim' | 'reason' | 'teach'

/**
 * Sort → takeaway → reason. Teaching only if the chips miss twice.
 */
export function RecallGate({
  brief,
  kicker = STORY.tapTakeaway,
  onHeld,
}: RecallGateProps) {
  const claimOptions = useMemo(
    () => shuffle([...brief.claimChoices]),
    [brief.id, brief.claimChoices],
  )
  const reasonOptions = useMemo(
    () => shuffle([...brief.reasonChoices]),
    [brief.id, brief.reasonChoices],
  )
  const [phase, setPhase] = useState<Phase>('claim')
  const [misses, setMisses] = useState(0)
  const [flash, setFlash] = useState<string | null>(null)
  const [shake, setShake] = useState(false)

  function pick(line: string, correct: string, next: Phase | 'done') {
    if (line === correct) {
      if (next === 'done') {
        onHeld({ clean: misses === 0 })
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

  function finishFromTeach() {
    onHeld({ clean: false })
  }

  return (
    <section
      className={`recall-gate ${shake ? 'is-shake' : ''} phase-${phase}`}
      aria-label={STORY.takeaway}
    >
      <p className="eyebrow">
        {kicker}
        {brief.source ? ` · ${brief.source}` : ''}
      </p>

      {phase === 'claim' ? (
        <>
          <h2>{STORY.tapTakeaway}</h2>
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
          <p className="recall-line rehearse-stem">{brief.claim}</p>
          <h2>{STORY.whyItStands}</h2>
          <div className="recall-choices">
            {reasonOptions.map((line) => (
              <button
                key={line}
                type="button"
                className={`match-card recall-card ${flash === line ? 'is-flash' : ''}`}
                onClick={() => pick(line, brief.reason, 'done')}
              >
                {line}
              </button>
            ))}
          </div>
        </>
      ) : null}

      {phase === 'teach' ? (
        <>
          <h2>Here’s the line.</h2>
          <article className="unlock-card pop-in">
            <p className="recall-line">{brief.claim}</p>
            <p>{brief.reason}</p>
          </article>
          <button type="button" className="btn primary xl" onClick={finishFromTeach}>
            Got it
          </button>
        </>
      ) : null}
    </section>
  )
}
