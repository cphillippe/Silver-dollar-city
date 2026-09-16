import { useMemo, useState } from 'react'
import { EASY, easyFacingLine, easyWhyLine } from '../../lib/easy'
import { GEM_BURST, playGemPop } from '../../lib/juice'
import { holdSuccessBeat } from '../../lib/successBeat'
import {
  applyHoldMiss,
  HOLD_BLAST_START,
  HOLD_LOCKED_STAMP,
  HOLD_MISS_FACE,
  whyBlastChoices,
  whyBlastExtras,
} from '../../lib/whyBlast'
import { WinBurst } from './WinBurst'

interface WhyBlastPlayProps {
  id: string
  claim: string
  reason: string
  source: string
  packMisses: readonly string[]
  onDone: (result: { clean: boolean }) => void
}

/**
 * Easy Hold why-step: claim stays center, four why-chips float around it.
 * Correct → blast + LOCKED!. Wrong → shake + Miss −25 and that chip pops out.
 */
export function WhyBlastPlay({ id, claim, reason, source, packMisses, onDone }: WhyBlastPlayProps) {
  const chips = useMemo(
    () => whyBlastChoices(reason, packMisses, whyBlastExtras(id), easyWhyLine),
    [id, reason, packMisses.join('\0')],
  )
  const [gone, setGone] = useState<string[]>([])
  const [tossing, setTossing] = useState<string | null>(null)
  const [locked, setLocked] = useState(false)
  const [score, setScore] = useState(HOLD_BLAST_START)
  const [misses, setMisses] = useState(0)
  const [shake, setShake] = useState(false)
  const [missFlash, setMissFlash] = useState(false)
  const beat = holdSuccessBeat(claim, easyWhyLine(reason))

  function miss(line: string) {
    if (locked || tossing || gone.includes(line)) return
    setTossing(line)
    setShake(true)
    setMissFlash(true)
    playGemPop('miss')
    setScore((current) => applyHoldMiss(current))
    setMisses((count) => count + 1)
    window.setTimeout(() => {
      setGone((current) => [...current, line])
      setTossing(null)
      setShake(false)
    }, 420)
  }

  function hit() {
    if (locked || tossing) return
    setMissFlash(false)
    setLocked(true)
    playGemPop('win')
  }

  function pick(line: string) {
    if (gone.includes(line) || tossing) return
    if (line === reason) hit()
    else miss(line)
  }

  return (
    <div
      className={`why-blast ${shake ? 'is-shake' : ''} ${locked ? 'is-yes is-win' : ''} ${missFlash ? 'is-miss' : ''}`}
    >
      <WinBurst play={locked} stamp={HOLD_LOCKED_STAMP} />
      <div className="why-blast-hud">
        <p className="next-tap">{EASY.tapWhy}</p>
        <p className="why-score" aria-live="polite">
          {score}
        </p>
      </div>
      {missFlash ? (
        <p className="miss-banner" role="status">
          <strong className="miss-plus">{HOLD_MISS_FACE}</strong>
        </p>
      ) : null}
      <div className="why-arena">
        {chips.map((line, index) => {
          const tossed = tossing === line || gone.includes(line)
          return (
            <button
              key={line}
              type="button"
              className={`why-chip match-card recall-card slot-${index} float-${index} ${tossed ? 'is-toss' : ''} ${gone.includes(line) ? 'is-gone' : ''} ${locked ? 'is-clear' : ''} ${locked && line === reason ? 'is-lock' : ''}`}
              onClick={() => pick(line)}
              disabled={locked || tossed}
            >
              {easyWhyLine(line)}
            </button>
          )
        })}
        <p className="why-claim recall-line rehearse-stem">{easyFacingLine(id, claim)}</p>
        <p className="held-from quiet">
          {EASY.sayFrom} {source}
        </p>
        {locked
          ? GEM_BURST.slice(0, 6).map((i) => (
              <span key={i} className="why-pop" style={{ ['--i' as string]: i }} aria-hidden />
            ))
          : null}
      </div>
      {locked ? (
        <>
          <p className="match-yes" role="status">
            <strong>{beat.title}</strong>
            <span>{beat.why}</span>
          </p>
          <div className="cta-dock">
            <button
              type="button"
              className="btn primary xl recall-done"
              onClick={() => onDone({ clean: misses === 0 })}
            >
              {EASY.keepThis}
            </button>
          </div>
        </>
      ) : null}
    </div>
  )
}
