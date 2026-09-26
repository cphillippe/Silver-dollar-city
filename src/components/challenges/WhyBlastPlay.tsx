import { useEffect, useMemo, useRef, useState } from 'react'
import { EASY, easyFacingLine, easyWhyLine } from '../../lib/easy'
import { GEM_BURST, playGemPop, prefersReducedMotion } from '../../lib/juice'
import { holdSuccessBeat } from '../../lib/successBeat'
import {
  applyHoldMiss,
  HOLD_BLAST_START,
  HOLD_LOCKED_STAMP,
  HOLD_MISS_FACE,
  whyBlastChoices,
  whyBlastExtras,
} from '../../lib/whyBlast'
import { MatchTakeaway } from '../HeldTriad'
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
 * Correct → blast + LOCKED!. Wrong → shake + Miss −25, then Main idea · why-true · From
 * teach sheet with Try again so the kid learns before the next tap.
 * Easy Clear: miss badge lives on the sheet only (no HUD dup); claim gets Main idea label
 * on miss teach (1.4.139) and live arena (1.4.141).
 * Easy Clear 1.4.156: ≤720px arena-first chrome thin so chips + claim keep the phone (#193).
 * Easy Clear 1.4.161: miss teach omits PlainTalk stack — triad + Try again only (#207).
 * Easy Clear 1.4.170: ≤720 peels outer eyebrow + quiet From in sortHold.css so arena stays above fold.
 * Easy Clear 1.4.190: ≤720 fills purple void in sortHold.css (invent Fun/Clear).
 * Easy Clear 1.4.202: ≤720 zeros cta-dock margin-top so chips→CTA close (fill 190 stays).
 * Easy Clear 1.4.210: ≤720 closes hud→arena purple gap — tighten why-blast gaps (fill 190 / dock 202 stay; Shot wake).
 * Easy Clear 1.4.217: phone portrait extends fill+dock+hud so Hold hud→arena closes (invent Fun/Clear).
 * Easy Clear 1.4.242: phone portrait extends HUD peel 170 so eyebrow + quiet From hide on tall phones (invent Fun/Clear).
 * Easy Clear 1.4.194: ≤720 grows journal quiz shell so Lock In card fills purple void (Fixes #251).
 * Easy Clear 1.4.195: ≤720 grows journal miss-teach shell so feedback card fills purple void (Fixes #252).
 */

// Easy Clear 1.4.212: ≤720 mid-question quiz packs residual lower-third padding (Fixes #274).
// Easy Clear 1.4.226: phone portrait extends fill 194 + pad-zero 212 so Lock In quiz closes bottom-half void (Fixes #298).
// Easy Clear 1.4.237: tall-phone strengthens fill 226 (height 100% · flex 1 1 0 · arena absorb · cta-dock static) so Lock In quiz closes bottom-half void (Fixes #316).
// Easy Clear 1.4.247: tall-phone cream-card fill — paint parchment recall-gate · dark ink · denser arena · dock pin — closes Shot 240 purple residual (Fixes #333).
// Easy Clear 1.4.254: tall-phone cream shell fill — opaque app-body + journal live-quiz cream plate · solid recall-gate (no purple-gold gradient) · cream dock floor pin — closes Shot 250 purple residual after 247 (Fixes #346).
// Easy Clear 1.4.213: ≤720 feedback packs residual bottom padding (Fixes #275).
// Easy Clear 1.4.227: phone portrait extends fill 195 + pad-zero 213 so Lock In feedback closes bottom-half void (Fixes #299).
// Easy Clear 1.4.238: tall-phone strengthens fill 227 (height 100% · flex 1 1 0 · why-miss-teach absorb · cta-dock static) so Lock In feedback closes bottom-half void (Fixes #317).
// Easy Clear 1.4.248: tall-phone cream-card fill — paint parchment recall-gate · transparent why-miss-teach · dark ink · dock pin — closes Shot 240 purple residual (Fixes #334).
// Easy Clear 1.4.255: tall-phone cream shell fill — opaque app-body + journal miss-teach cream plate · solid recall-gate (no purple-gold gradient) · cream dock floor pin · horizontal overflow pin (no left clip) — closes Shot 250 purple residual after 248 (Fixes #347).
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
  const [missTeach, setMissTeach] = useState(false)
  const [retryJuice, setRetryJuice] = useState(false)
  const beat = holdSuccessBeat(claim, easyWhyLine(reason), source)
  const ctaRef = useRef<HTMLDivElement | null>(null)
  const missesRef = useRef(0)
  const doneRef = useRef(false)
  const reduced = prefersReducedMotion()

  useEffect(() => {
    missesRef.current = misses
  }, [misses])

  useEffect(() => {
    if (!locked) return
    const frame = window.requestAnimationFrame(() => {
      ctaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    })
    const auto = window.setTimeout(() => finish(), reduced ? 420 : 1200)
    return () => {
      window.cancelAnimationFrame(frame)
      window.clearTimeout(auto)
    }
  }, [locked])

  function finish() {
    if (doneRef.current) return
    doneRef.current = true
    onDone({ clean: missesRef.current === 0 })
  }

  function miss(line: string) {
    if (locked || tossing || missTeach || gone.includes(line)) return
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
      setMissTeach(true)
    }, reduced ? 180 : 420)
  }

  function retryAfterTeach() {
    if (locked || !missTeach) return
    setMissTeach(false)
    setMissFlash(false)
    setRetryJuice(true)
    playGemPop('bonus')
    window.setTimeout(() => setRetryJuice(false), reduced ? 280 : 650)
  }

  function hit() {
    if (locked || tossing || missTeach || doneRef.current) return
    setMissFlash(false)
    setMissTeach(false)
    setLocked(true)
    playGemPop('win')
  }

  function pick(line: string) {
    if (gone.includes(line) || tossing || missTeach) return
    if (line === reason) hit()
    else miss(line)
  }

  return (
    <div
      className={`why-blast ${shake ? 'is-shake' : ''} ${locked ? 'is-yes is-win' : ''} ${missFlash ? 'is-miss' : ''} ${missTeach ? 'is-miss-teach' : ''} ${retryJuice ? 'is-retry-juice' : ''}`}
    >
      <WinBurst play={locked} stamp={HOLD_LOCKED_STAMP} />
      <div className="why-blast-hud">
        {/* Easy Clear 1.4.139: miss teach sheet already prints .why-miss-badge — skip HUD dup. */}
        {missTeach ? null : (
          <p className="next-tap">
            {locked ? EASY.keepThis : retryJuice ? EASY.oneMoreTry : EASY.tapWhy}
          </p>
        )}
        <p className="why-score" aria-live="polite">
          {score}
        </p>
      </div>
      {missFlash && !missTeach ? (
        <p className="miss-banner" role="status">
          <strong className="miss-plus">{HOLD_MISS_FACE}</strong>
        </p>
      ) : null}
      {missTeach ? (
        <article className="why-miss-teach pop-in" role="status" aria-live="polite">
          <p className="why-miss-badge">{EASY.missTeachBadge}</p>
          <p className="why-claim recall-line rehearse-stem">
            <span className="why-miss-label">{EASY.mainIdea}</span>
            {easyFacingLine(id, claim)}
          </p>
          <p className="why-miss-reason">
            <span className="why-miss-label">{EASY.whyTrueLabel}</span>
            {easyWhyLine(reason)}
          </p>
          {source ? (
            <p className="held-from">
              {EASY.sayFrom} {source}
            </p>
          ) : null}
          {/* Easy Clear 1.4.161: miss sheet = triad + Try again — PlainTalk teach stays on Learn / first claim (#207). */}
          <div className="cta-dock" ref={ctaRef}>
            <button type="button" className="btn gold xl why-miss-retry" onClick={retryAfterTeach}>
              {EASY.tryAgain}
            </button>
          </div>
        </article>
      ) : (
        <div className="why-arena">
          {/* Easy Clear 1.4.190/194/195: ≤720 fills purple void in sortHold.css (invent Fun/Clear · Fixes #251/#252). */}
          {chips.map((line, index) => {
            const tossed = tossing === line || gone.includes(line)
            return (
              <button
                key={line}
                type="button"
                className={`why-chip match-card recall-card slot-${index} float-${index} ${tossed ? 'is-toss' : ''} ${gone.includes(line) ? 'is-gone' : ''} ${locked ? 'is-clear' : ''} ${locked && line === reason ? 'is-lock' : ''} ${retryJuice && !gone.includes(line) ? 'is-retry-pulse' : ''}`}
                onClick={() => pick(line)}
                disabled={locked || tossed}
              >
                {easyWhyLine(line)}
              </button>
            )
          })}
          <p className="why-claim recall-line rehearse-stem">
            {/* Easy Clear 1.4.141: live arena names Main idea — same family as miss teach 139 + Learn 140. */}
            <span className="why-miss-label">{EASY.mainIdea}</span>
            {easyFacingLine(id, claim)}
          </p>
          {locked ? null : (
            <p className="held-from quiet">
              {EASY.sayFrom} {source}
            </p>
          )}
          {locked
            ? GEM_BURST.slice(0, 6).map((i) => (
                <span key={i} className="why-pop" style={{ ['--i' as string]: i }} aria-hidden />
              ))
            : null}
        </div>
      )}
      {locked ? (
        <>
          <MatchTakeaway lineId={id} title={beat.title} />
          <div className="cta-dock" ref={ctaRef}>
            <button
              type="button"
              className="btn primary xl recall-done"
              onClick={finish}
            >
              {EASY.saved}
            </button>
          </div>
        </>
      ) : null}
    </div>
  )
}
