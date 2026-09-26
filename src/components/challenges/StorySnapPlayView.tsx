import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react'
import { EASY, easyWhoWhere } from '../../lib/easy'
import {
  allBeatsLocked,
  applyMissScore,
  applyOpenScore,
  applySnapScore,
  beatByIndex,
  beatPastGate,
  beatProgress,
  GATE_AT,
  inSnapWindow,
  nextBeatIndex,
  SNAPS_TO_OPEN,
  STORY_SNAP_AGAIN,
  STORY_SNAP_BEATS,
  STORY_SNAP_CLAIM,
  STORY_SNAP_HINT,
  STORY_SNAP_SNAP,
  STORY_SNAP_WIN,
  STORY_OPEN_SCORE,
  SNAP_SCORE,
  travelMs,
  type StorySnapPhase,
} from '../../lib/storySnap'
// Live tree: playGemPop from '../../lib/juice'. Pack keeps the same import path.
import { playGemPop, prefersReducedMotion } from '../../lib/juice'
import type { StoryPanel } from '../../lib/storyPanels'

interface StorySnapPlayProps {
  lineId: string
  beats?: StoryPanel[]
  onMiss: () => void
  onClear?: () => void
  onEasyStop?: (dest: 'hold' | 'home') => void
}

/**
 * Story Snap — three beats fly under a gate; tap on time to lock the strip.
 * After three SNAP!s → STORY OPEN! → claim → Lock In. One more snap loops.
 * Easy Clear 1.4.182: ≤720 peels HUD eyebrow + who·where in storySnap.css (stage·strip·pad first).
 * Easy Clear 1.4.197: ≤720 fills purple void — grow play + stretch snap-stage (HUD 182 stays).
 * Easy Clear 1.4.209: ≤720 zeros cta-dock margin-top so pad→CTA close (peel 197 stays).
 */

export function StorySnapPlayView({
  lineId,
  beats: _beats,
  onMiss,
  onClear,
  onEasyStop,
}: StorySnapPlayProps) {
  void _beats
  const home = easyWhoWhere(lineId)
  const reduced = prefersReducedMotion()
  const duration = travelMs(reduced)

  const [phase, setPhase] = useState<StorySnapPhase>('ready')
  const [lockedIds, setLockedIds] = useState<string[]>([])
  const [flyIndex, setFlyIndex] = useState(0)
  const [progress, setProgress] = useState(0)
  const [score, setScore] = useState(0)
  const [toast, setToast] = useState('')
  const [plusFlash, setPlusFlash] = useState('')
  const [winStamp, setWinStamp] = useState('')
  const [shake, setShake] = useState(false)
  const [claimShown, setClaimShown] = useState(false)
  const [attempt, setAttempt] = useState(0)

  const phaseRef = useRef<StorySnapPhase>('ready')
  const lockedRef = useRef<string[]>([])
  const flyRef = useRef(0)
  const elapsedRef = useRef(0)
  const progressRef = useRef(0)
  const cleared = useRef(false)
  const frame = useRef(0)
  const lastTick = useRef(0)
  const snappable = useRef(false)

  const flying = useMemo(() => beatByIndex(flyIndex), [flyIndex])
  const inWindow = inSnapWindow(progress)

  function flashToast(line: string) {
    setToast(line)
    window.setTimeout(() => setToast((current) => (current === line ? '' : current)), 1400)
  }

  function writeProgress(next: number) {
    progressRef.current = next
    setProgress(next)
  }

  function resetRound(nextAttempt: number) {
    phaseRef.current = 'ready'
    lockedRef.current = []
    flyRef.current = 0
    elapsedRef.current = 0
    lastTick.current = 0
    snappable.current = false
    cleared.current = false
    writeProgress(0)
    setAttempt(nextAttempt)
    setPhase('ready')
    setLockedIds([])
    setFlyIndex(0)
    setScore(0)
    setPlusFlash('')
    setWinStamp('')
    setShake(false)
    setClaimShown(false)
    flashToast(nextAttempt > 0 ? `${STORY_SNAP_AGAIN}. ${STORY_SNAP_HINT}` : STORY_SNAP_HINT)
  }

  function replay() {
    resetRound(attempt + 1)
  }

  function startFly(nextIndex: number) {
    flyRef.current = nextIndex
    elapsedRef.current = 0
    lastTick.current = 0
    snappable.current = true
    phaseRef.current = 'fly'
    writeProgress(0)
    setFlyIndex(nextIndex)
    setPhase('fly')
  }

  useEffect(() => {
    resetRound(0)
    return () => window.cancelAnimationFrame(frame.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lineId])

  useEffect(() => {
    function tick(now: number) {
      frame.current = window.requestAnimationFrame(tick)
      if (phaseRef.current !== 'fly') return
      const prev = lastTick.current || now
      lastTick.current = now
      const dt = Math.min(50, now - prev)
      const nextElapsed = elapsedRef.current + dt
      elapsedRef.current = nextElapsed
      const nextProgress = beatProgress(nextElapsed, duration)
      writeProgress(nextProgress)
      if (beatPastGate(nextProgress) && snappable.current) {
        // Floated past the gate without a snap — Miss −25, beat recycles.
        snappable.current = false
        recycleBeat(true)
      }
    }
    frame.current = window.requestAnimationFrame(tick)
    return () => window.cancelAnimationFrame(frame.current)
  }, [duration])

  function recycleBeat(penalize: boolean) {
    if (phaseRef.current === 'open') return
    if (penalize) {
      playGemPop('miss')
      setScore((pts) => applyMissScore(pts))
      setShake(true)
      window.setTimeout(() => setShake(false), 340)
      onMiss()
      flashToast(`Miss −${SNAP_SCORE}`)
    }
    const idx = nextBeatIndex(lockedRef.current)
    window.setTimeout(() => {
      if (phaseRef.current === 'open') return
      startFly(idx)
    }, penalize ? 380 : 120)
  }

  function lockSnap() {
    if (phaseRef.current !== 'fly' || !snappable.current) return
    if (!inSnapWindow(progressRef.current)) {
      snappable.current = false
      recycleBeat(true)
      return
    }
    snappable.current = false
    phaseRef.current = 'snap'
    setPhase('snap')
    const beat = beatByIndex(flyRef.current)
    if (!lockedRef.current.includes(beat.id)) {
      lockedRef.current = [...lockedRef.current, beat.id]
      setLockedIds(lockedRef.current)
    }
    playGemPop('find')
    setScore((pts) => applySnapScore(pts))
    setPlusFlash(`+${SNAP_SCORE}`)
    setWinStamp(STORY_SNAP_SNAP)
    flashToast(STORY_SNAP_SNAP)
    window.setTimeout(() => setPlusFlash(''), 700)
    window.setTimeout(() => setWinStamp((current) => (current === STORY_SNAP_SNAP ? '' : current)), 520)

    if (allBeatsLocked(lockedRef.current) || lockedRef.current.length >= SNAPS_TO_OPEN) {
      window.setTimeout(() => openStory(), reduced ? 80 : 420)
      return
    }
    const idx = nextBeatIndex(lockedRef.current)
    window.setTimeout(() => startFly(idx), reduced ? 60 : 360)
  }

  function openStory() {
    if (phaseRef.current === 'open') return
    phaseRef.current = 'open'
    setPhase('open')
    playGemPop('win')
    setScore((pts) => applyOpenScore(pts))
    setPlusFlash(`+${STORY_OPEN_SCORE}`)
    setWinStamp(STORY_SNAP_WIN)
    setClaimShown(true)
    window.setTimeout(() => setPlusFlash(''), 900)
    if (!cleared.current) {
      cleared.current = true
      onClear?.()
    }
  }

  function onPadDown(event: ReactPointerEvent<HTMLButtonElement>) {
    if (phaseRef.current === 'open') return
    event.preventDefault()
    if (phaseRef.current === 'ready') {
      startFly(nextBeatIndex(lockedRef.current))
      return
    }
    if (phaseRef.current === 'fly') lockSnap()
  }

  function onPadKeyDown(event: ReactKeyboardEvent<HTMLButtonElement>) {
    if (event.code !== 'Space' && event.key !== ' ') return
    event.preventDefault()
    if (phaseRef.current === 'ready') {
      startFly(nextBeatIndex(lockedRef.current))
      return
    }
    if (phaseRef.current === 'fly') lockSnap()
  }

  const beatLeftPct = progress * 100
  const padLabel =
    phase === 'open'
      ? EASY.holdNext
      : phase === 'ready'
        ? 'Tap to start'
        : inWindow
          ? 'SNAP!'
          : 'Wait…'

  return (
    <div
      className={`play is-story-snap ${inWindow && phase === 'fly' ? 'is-glow' : ''} ${phase === 'open' ? 'is-win' : ''} ${shake ? 'is-shake' : ''}`}
    >
      <p className="eyebrow">Story Snap</p>
      {/* 1.4.163 / #209: Learn already showed short story — omit STORY_SNAP_TEACH reprint; pad·strip·gate teach mechanic */}
      <p className="quiet easy-who-where-line">
        {home.who} · {home.place}
      </p>

      <div className="snap-strip" aria-label="Story strip">
        {STORY_SNAP_BEATS.map((beat) => (
          <span
            key={beat.id}
            className={`snap-chip ${lockedIds.includes(beat.id) ? 'is-locked' : ''}`}
          >
            {lockedIds.includes(beat.id) ? beat.label : '·'}
          </span>
        ))}
      </div>

      <div className="snap-stage" aria-live="polite">
        <div className="snap-gate" aria-hidden />
        <div className="snap-lane">
          {phase === 'fly' || phase === 'snap' ? (
            <div
              className="snap-beat"
              style={{ left: `${beatLeftPct}%`, ['--gate' as string]: `${GATE_AT * 100}%` }}
            >
              <span className="snap-beat-label">{flying.label}</span>
              <span className="snap-beat-text">{flying.text}</span>
            </div>
          ) : null}
        </div>
        {winStamp ? (
          <div className="win-stamp-wrap">
            <p className="win-stamp">{winStamp}</p>
          </div>
        ) : null}
        {plusFlash ? <p className="bonus-plus">{plusFlash}</p> : null}
        {toast ? <p className="match-toast">{toast}</p> : null}
      </div>

      {claimShown ? (
        <p className="snap-claim" role="status">
          {STORY_SNAP_CLAIM}
        </p>
      ) : null}

      <p className="match-score is-juice" aria-label={`Score ${score}`}>
        {score}
      </p>

      <button
        type="button"
        className="btn gold xl snap-pad"
        onPointerDown={onPadDown}
        onKeyDown={onPadKeyDown}
        aria-label={padLabel}
      >
        {padLabel}
      </button>

      <div className="cta-dock">
        {phase === 'open' ? (
          <>
            <button type="button" className="btn primary xl" onClick={() => onEasyStop?.('hold')}>
              {EASY.holdNext}
            </button>
            <button type="button" className="text-link" onClick={replay}>
              {STORY_SNAP_AGAIN}
            </button>
          </>
        ) : (
          <button type="button" className="text-link" onClick={() => onEasyStop?.('home')}>
            Home
          </button>
        )}
      </div>
    </div>
  )
}
