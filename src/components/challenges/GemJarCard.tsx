import { useEffect, useMemo, useRef, useState } from 'react'
import { EASY } from '../../lib/easy'
import { jarCaption, jarCrossing, jarState } from '../../lib/gemJar'
import { playGemPop, prefersReducedMotion } from '../../lib/juice'

const COUNT_START_MS = 250
const COUNT_MS = 700
const ORB_AT_MS = 950
const ORB_FLY_MS = 450
const SPARKS = [0, 1, 2, 3, 4, 5]

/** Card heights (px). The win board shrinks by this much so the win stack never grows. */
export const JAR_CARD_H = 46
export const JAR_CARD_REVEAL_H = 68

interface GemJarCardProps {
  /** Jar total when this board started. */
  before: number
  /** Every positive point this board earned. */
  boardPts: number
  /** Story words found on this board. */
  storyFound: number
  /** Highest jar step whose reveal already played. */
  seen: number
  /** Called once when a reveal plays, so it never plays twice. */
  onSeen: (step: number) => void
}

function fmt(n: number): string {
  return Math.round(n).toLocaleString('en-US')
}

/**
 * The Gem Jar on the Match win screen. It sits in the score line's slot and is decoration only:
 * it never takes focus, never covers the dock, and never delays Lock In next.
 */
export function GemJarCard(props: GemJarCardProps) {
  const { onSeen } = props
  // Frozen at mount: the reveal marks itself seen, which must not make it vanish.
  const [{ before, boardPts, storyFound, seen }] = useState(() => props)
  const after = before + boardPts
  const reduced = useMemo(() => prefersReducedMotion(), [])
  const crossing = useMemo(() => jarCrossing(before, after, seen), [before, after, seen])
  const [shown, setShown] = useState(reduced ? boardPts : 0)
  const [landed, setLanded] = useState(reduced)
  const [flying, setFlying] = useState(false)
  const [tipped, setTipped] = useState(false)
  const seenRef = useRef(onSeen)
  seenRef.current = onSeen

  useEffect(() => {
    if (reduced) {
      if (crossing) seenRef.current(crossing.step)
      return
    }
    let raf = 0
    const timers: number[] = []
    timers.push(
      window.setTimeout(() => {
        const t0 = performance.now()
        const tick = (now: number) => {
          const k = Math.min(1, (now - t0) / COUNT_MS)
          setShown(Math.round(boardPts * (1 - (1 - k) * (1 - k))))
          if (k < 1) raf = window.requestAnimationFrame(tick)
        }
        raf = window.requestAnimationFrame(tick)
      }, COUNT_START_MS),
    )
    timers.push(window.setTimeout(() => setFlying(true), ORB_AT_MS))
    timers.push(
      window.setTimeout(() => {
        setFlying(false)
        setLanded(true)
        setShown(boardPts)
        playGemPop('jar')
        if (crossing) {
          setTipped(true)
          seenRef.current(crossing.step)
        }
      }, ORB_AT_MS + ORB_FLY_MS),
    )
    return () => {
      window.cancelAnimationFrame(raf)
      for (const id of timers) window.clearTimeout(id)
    }
    // one run per win
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fromState = jarState(before)
  const toState = jarState(after)
  const fillPct = landed ? toState.fillPct : fromState.fillPct
  const revealed = landed && crossing
  const reveal = revealed
    ? crossing.skill
      ? `${EASY.skillNew}: ${crossing.skill.name} — ${crossing.skill.line}`
      : `${EASY.jarFull} ×${crossing.full}`
    : ''

  return (
    <div className="gem-jar-slot">
      <div
        className={`gem-jar ${crossing ? 'has-reveal' : ''} ${tipped ? 'is-tipped' : ''} ${flying ? 'is-flying' : ''}`}
        data-gem-jar
        role="status"
        aria-label={`${EASY.jarName} ${fmt(boardPts)}`}
      >
        <div className="gem-jar-row">
          <span className="gem-jar-name">{EASY.jarName}</span>
          <strong className="gem-jar-count" data-gem-jar-count>
            +{fmt(shown)}
          </strong>
          {storyFound > 0 ? (
            <span className="gem-jar-story" data-gem-story>
              {EASY.storyWinLabel} ×{storyFound}
            </span>
          ) : null}
          <span className="gem-jar-caption" data-gem-jar-caption>
            {jarCaption(landed ? after : before)}
          </span>
          <svg className="gem-jar-icon" viewBox="0 0 24 28" aria-hidden>
            <rect className="gem-jar-lid" x="6" y="1.5" width="12" height="4" rx="1.5" />
            <path
              className="gem-jar-glass"
              d="M5 7.5h14v2.2c1.6 1.2 2.4 2.8 2.4 4.6v7.2a4 4 0 0 1-4 4H6.6a4 4 0 0 1-4-4v-7.2c0-1.8.8-3.4 2.4-4.6z"
            />
            <rect
              className="gem-jar-level"
              x="4.6"
              y={26 - Math.max(2, (fillPct / 100) * 14)}
              width="14.8"
              height={Math.max(2, (fillPct / 100) * 14)}
              rx="1.5"
            />
          </svg>
          {flying ? <span className="gem-jar-orb" aria-hidden /> : null}
        </div>
        {reveal ? (
          <p className="gem-jar-reveal" data-gem-jar-reveal>
            {reveal}
          </p>
        ) : (
          <span className="gem-jar-bar" aria-hidden>
            <span className="gem-jar-fill" style={{ width: `${fillPct}%` }} />
          </span>
        )}
        {tipped
          ? SPARKS.map((i) => (
              <span key={i} className="gem-jar-spark" style={{ ['--i' as string]: i }} aria-hidden />
            ))
          : null}
      </div>
    </div>
  )
}
