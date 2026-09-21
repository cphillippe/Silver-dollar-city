import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { EASY, easyWhoWhere } from '../../lib/easy'
import {
  SOURCE_DIG_AGAIN,
  SOURCE_DIG_COMBO_MS,
  SOURCE_DIG_HINT,
  SOURCE_DIG_SCRUB_PX,
  SOURCE_DIG_TAP_SCORE,
  SOURCE_DIG_TIMEOUT,
  SOURCE_DIG_TIMER_EASY_MS,
  SOURCE_DIG_TIMER_HARD_MS,
  SOURCE_DIG_WIN,
  SOURCE_DIG_WIN_SCORE,
  seatTablets,
  type DigTablet,
} from '../../lib/sourceDig'
import { GEM_BURST, playGemPop, prefersReducedMotion } from '../../lib/juice'
import { MatchTakeaway } from '../HeldTriad'
import { WinBurst } from './WinBurst'
import '../../styles/digReveal.css'

interface SourceDigPlayProps {
  lineId: string
  /** Easy lane gets the longer clock. */
  easy?: boolean
  onMiss: () => void
  onClear?: () => void
  onEasyStop?: (dest: 'hold' | 'home') => void
}

const POP_SHARDS = [0, 1, 2, 3, 4]
const DUST = [0, 1, 2, 3]

export function SourceDigPlay({
  lineId,
  easy = true,
  onMiss,
  onClear,
  onEasyStop,
}: SourceDigPlayProps) {
  const home = easyWhoWhere(lineId)
  const reduced = prefersReducedMotion()
  const timerMs = easy ? SOURCE_DIG_TIMER_EASY_MS : SOURCE_DIG_TIMER_HARD_MS
  const [seed, setSeed] = useState(() => Date.now() % 9999)
  const seats = useMemo(() => seatTablets(lineId, seed), [lineId, seed])
  const [open, setOpen] = useState<number[]>([])
  const [scrub, setScrub] = useState<Record<number, number>>({})
  const [shake, setShake] = useState(false)
  const [toast, setToast] = useState('')
  const [won, setWon] = useState(false)
  const [winStamp, setWinStamp] = useState(false)
  const [score, setScore] = useState(0)
  const [plusFlash, setPlusFlash] = useState('')
  const [comboFlash, setComboFlash] = useState(0)
  const [popId, setPopId] = useState<number | null>(null)
  const [scrubbingId, setScrubbingId] = useState<number | null>(null)
  const [clockOn, setClockOn] = useState(false)
  const [remainingMs, setRemainingMs] = useState(timerMs)
  const comboRef = useRef(0)
  const lastFindAt = useRef(0)
  const cleared = useRef(false)
  const timedOut = useRef(false)
  const missOnce = useRef(false)
  const clockOnRef = useRef(false)
  const wonRef = useRef(false)
  const openRef = useRef<number[]>([])
  const scrubAcc = useRef<Record<number, number>>({})
  const lastPoint = useRef<{ x: number; y: number } | null>(null)
  const activeId = useRef<number | null>(null)
  const deadlineRef = useRef(0)
  const rafRef = useRef(0)

  useEffect(() => {
    openRef.current = open
  }, [open])

  useEffect(() => {
    wonRef.current = won
  }, [won])

  useEffect(() => {
    setRemainingMs(timerMs)
  }, [timerMs, seed])

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  function flashPlus(line: string) {
    setPlusFlash(line)
    window.setTimeout(() => setPlusFlash((current) => (current === line ? '' : current)), 800)
  }

  function stopClock() {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = 0
    }
  }

  function tickClock() {
    if (!clockOnRef.current || wonRef.current || timedOut.current) return
    const left = Math.max(0, deadlineRef.current - performance.now())
    setRemainingMs(left)
    if (left <= 0) {
      bury()
      return
    }
    rafRef.current = requestAnimationFrame(tickClock)
  }

  function armClock() {
    if (clockOnRef.current || wonRef.current || timedOut.current) return
    clockOnRef.current = true
    setClockOn(true)
    deadlineRef.current = performance.now() + timerMs
    setRemainingMs(timerMs)
    rafRef.current = requestAnimationFrame(tickClock)
  }

  function bury() {
    if (timedOut.current || wonRef.current) return
    timedOut.current = true
    clockOnRef.current = false
    setClockOn(false)
    stopClock()
    setRemainingMs(0)
    setScrubbingId(null)
    activeId.current = null
    lastPoint.current = null
    playGemPop('miss')
    setShake(true)
    setToast(SOURCE_DIG_TIMEOUT)
    if (!missOnce.current) {
      missOnce.current = true
      onMiss()
    }
    window.setTimeout(() => setShake(false), 360)
    window.setTimeout(() => {
      setToast((current) => (current === SOURCE_DIG_TIMEOUT ? '' : current))
      replay()
    }, 1100)
  }

  function replay() {
    stopClock()
    cleared.current = false
    timedOut.current = false
    missOnce.current = false
    comboRef.current = 0
    lastFindAt.current = 0
    clockOnRef.current = false
    wonRef.current = false
    openRef.current = []
    scrubAcc.current = {}
    lastPoint.current = null
    activeId.current = null
    deadlineRef.current = 0
    setSeed(Date.now() % 9999)
    setOpen([])
    setScrub({})
    setToast('One more dig. Scrub the dirt.')
    setWon(false)
    setWinStamp(false)
    setScore(0)
    setPlusFlash('')
    setComboFlash(0)
    setPopId(null)
    setScrubbingId(null)
    setClockOn(false)
    setRemainingMs(timerMs)
    window.setTimeout(
      () => setToast((current) => (current === 'One more dig. Scrub the dirt.' ? '' : current)),
      1400,
    )
  }

  function reveal(tablet: DigTablet) {
    if (wonRef.current || timedOut.current) return
    if (openRef.current.includes(tablet.id)) return
    playGemPop(openRef.current.length >= 2 ? 'win' : 'find')
    const now = performance.now()
    if (lastFindAt.current && now - lastFindAt.current <= SOURCE_DIG_COMBO_MS) {
      comboRef.current += 1
    } else {
      comboRef.current = 1
    }
    lastFindAt.current = now
    const dug = [...openRef.current, tablet.id]
    openRef.current = dug
    setOpen(dug)
    setToast('')
    setPopId(tablet.id)
    window.setTimeout(() => setPopId((current) => (current === tablet.id ? null : current)), 420)
    setScore((pts) => pts + SOURCE_DIG_TAP_SCORE)
    flashPlus(`+${SOURCE_DIG_TAP_SCORE}`)
    if (comboRef.current >= 2) {
      setComboFlash(comboRef.current)
      window.setTimeout(() => setComboFlash(0), 700)
    }
    if (dug.length >= seats.length) {
      stopClock()
      clockOnRef.current = false
      setClockOn(false)
      wonRef.current = true
      setWon(true)
      setScore((pts) => pts + SOURCE_DIG_WIN_SCORE)
      flashPlus(`+${SOURCE_DIG_WIN_SCORE}`)
      if (!cleared.current) {
        cleared.current = true
        onClear?.()
      }
      window.setTimeout(() => setWinStamp(true), reduced ? 40 : 280)
    }
  }

  function onDirtDown(tablet: DigTablet, event: ReactPointerEvent<HTMLElement>) {
    if (won || timedOut.current) return
    if (open.includes(tablet.id)) return
    event.preventDefault()
    event.currentTarget.setPointerCapture(event.pointerId)
    activeId.current = tablet.id
    lastPoint.current = { x: event.clientX, y: event.clientY }
    setScrubbingId(tablet.id)
    armClock()
  }

  function onDirtMove(tablet: DigTablet, event: ReactPointerEvent<HTMLElement>) {
    if (won || timedOut.current) return
    if (open.includes(tablet.id)) return
    if (activeId.current !== tablet.id) return
    if (!lastPoint.current) return
    const dx = event.clientX - lastPoint.current.x
    const dy = event.clientY - lastPoint.current.y
    lastPoint.current = { x: event.clientX, y: event.clientY }
    const step = Math.hypot(dx, dy)
    if (step <= 0) return
    armClock()
    const next = (scrubAcc.current[tablet.id] ?? 0) + step
    scrubAcc.current[tablet.id] = next
    setScrub((prev) => ({ ...prev, [tablet.id]: next }))
    if (next >= SOURCE_DIG_SCRUB_PX) {
      activeId.current = null
      lastPoint.current = null
      setScrubbingId(null)
      try {
        event.currentTarget.releasePointerCapture(event.pointerId)
      } catch {
        /* already released */
      }
      reveal(tablet)
    }
  }

  function onDirtUp(tablet: DigTablet, event: ReactPointerEvent<HTMLElement>) {
    if (activeId.current === tablet.id) {
      activeId.current = null
      lastPoint.current = null
      setScrubbingId(null)
      try {
        event.currentTarget.releasePointerCapture(event.pointerId)
      } catch {
        /* already released */
      }
    }
  }

  const secs = Math.ceil(remainingMs / 1000)
  const pulse = clockOn && remainingMs > 0 && remainingMs <= 3000
  const timerLabel = clockOn
    ? `${secs}s left`
    : `Scrub to start · ${Math.round(timerMs / 1000)}s`

  return (
    <div className={`play is-source-dig ${shake ? 'is-shake' : ''} ${won ? 'is-win' : ''}`}>
      <p className="sort-how">{EASY.digHunt}</p>
      <p className="story-kicker">
        {home.who} · {home.place}
      </p>
      <p
        className={`dig-timer ${pulse ? 'is-pulse' : ''} ${clockOn ? 'is-live' : 'is-armed'}`}
        role="timer"
        aria-live="polite"
        aria-atomic="true"
        aria-label={timerLabel}
      >
        <strong>{clockOn ? secs : Math.round(timerMs / 1000)}</strong>
        <span>{clockOn ? 's' : 's · scrub to start'}</span>
      </p>
      {toast ? (
        <p
          className={`match-toast gem-toast ${toast === SOURCE_DIG_TIMEOUT ? 'is-miss' : 'is-yes'}`}
          role="status"
        >
          <strong>{toast}</strong>
        </p>
      ) : null}
      {plusFlash ? (
        <p className="bonus-plus" aria-hidden>
          {plusFlash}!
        </p>
      ) : null}
      {comboFlash > 1 ? (
        <p className="dig-combo" role="status">
          Combo ×{comboFlash}
        </p>
      ) : null}
      <div
        className="dig-board"
        role="application"
        aria-label="Ancient source dig — scrub dirt off each tablet"
      >
        <WinBurst play={winStamp} stamp={SOURCE_DIG_WIN} />
        {seats.map((tablet) => {
          const flipped = open.includes(tablet.id)
          const popping = popId === tablet.id
          const stroked = scrub[tablet.id] ?? 0
          const progress = Math.min(1, stroked / SOURCE_DIG_SCRUB_PX)
          const scrubbing = scrubbingId === tablet.id && !flipped
          return (
            <button
              key={`${seed}-${tablet.id}`}
              type="button"
              className={`dig-tablet hue-${tablet.era} ${flipped ? 'is-open' : 'is-buried'} ${popping ? 'is-pop' : ''} ${scrubbing ? 'is-scrubbing' : ''}`}
              data-dig-tablet={tablet.id}
              disabled={won || flipped}
              aria-label={
                flipped
                  ? `${tablet.title}: ${tablet.bite}`
                  : `Buried tablet — scrub to reveal (${Math.round(progress * 100)}%)`
              }
            >
              {flipped ? (
                <>
                  <span className="dig-era">{tablet.era === 'scripture' ? 'Scripture' : 'Ancient'}</span>
                  <strong>{tablet.title}</strong>
                  <em>{tablet.bite}</em>
                </>
              ) : (
                <>
                  <span className="dig-era">Buried</span>
                  <strong>Scrub</strong>
                  <span
                    className={`dig-dirt ${scrubbing ? 'is-scrubbing' : ''}`}
                    style={{ ['--scrub' as string]: String(progress) }}
                    onPointerDown={(event) => onDirtDown(tablet, event)}
                    onPointerMove={(event) => onDirtMove(tablet, event)}
                    onPointerUp={(event) => onDirtUp(tablet, event)}
                    onPointerCancel={(event) => onDirtUp(tablet, event)}
                  >
                    <span className="dig-scrub-fill" aria-hidden />
                    {!reduced && scrubbing
                      ? DUST.map((i) => (
                          <i key={i} className="dig-dust" style={{ ['--i' as string]: i }} />
                        ))
                      : null}
                  </span>
                </>
              )}
              {popping
                ? POP_SHARDS.map((i) => (
                    <i key={i} className="dig-shard" style={{ ['--i' as string]: i }} />
                  ))
                : null}
              {popping
                ? GEM_BURST.slice(0, 4).map((i) => (
                    <b key={`p-${i}`} className="dig-burst" style={{ ['--i' as string]: i }} />
                  ))
                : null}
            </button>
          )
        })}
      </div>
      <p className="dig-hint quiet" aria-hidden>
        {SOURCE_DIG_HINT}
      </p>
      <p className={`match-score ${plusFlash ? 'is-juice' : ''}`}>
        {score}
        {' · '}
        {open.length} / {seats.length}
      </p>
      {won ? (
        <>
          <MatchTakeaway lineId={lineId} />
          <div className="cta-dock">
            <button
              type="button"
              className="btn primary xl snap-bins"
              onClick={() => onEasyStop?.('hold')}
            >
              {EASY.holdNext}
            </button>
            <button type="button" className="btn gold xl" data-dig-again onClick={replay}>
              {SOURCE_DIG_AGAIN}
            </button>
            <button type="button" className="btn xl" onClick={() => onEasyStop?.('home')}>
              {EASY.home}
            </button>
          </div>
        </>
      ) : null}
    </div>
  )
}
