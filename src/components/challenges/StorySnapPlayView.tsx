import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react'
import { EASY, easyWhoWhere, isEasy } from '../../lib/easy'
import {
  allBeatsLocked,
  applyDemoSnap,
  applyOpenScore,
  applySnapScore,
  demoCountsLocked,
  DEMO_TURN,
  lockedAfterMiss,
  missPointsLost,
  missToast,
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
import { useProgress } from '../../store/progress'

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
 * Easy Clear 1.4.223: phone portrait extends fill + pad→CTA so snap-stage·pad·CTA close purple void (invent Fun/Clear).
 * Easy Clear 1.4.241: phone portrait extends HUD peel 182 so eyebrow + who·where hide on tall phones (invent Fun/Clear).
 * Easy Fun 1.4.269: tall-phone Story Snap residual juice — HUD compress 182 (strip · chip) climbs past 720, snap CTA + score/miss juice go loud without crowding the snap board (invent Fun/Clear).
 * Easy Fun 1.4.270: tall-phone one-more win-end dock — One more snap punches gold, claim stays readable, snap board stays (invent Fun/Clear · Shot wake).
 */

export function StorySnapPlayView({
  lineId,
  beats: _beats,
  onMiss,
  onClear,
  onEasyStop,
}: StorySnapPlayProps) {
  void _beats
  const { progress: trail } = useProgress()
  const easy = isEasy(trail)
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
  const [demoOn, setDemoOn] = useState(false)

  const phaseRef = useRef<StorySnapPhase>('ready')
  const scoreRef = useRef(0)
  const demoRef = useRef(false)
  const stopping = useRef(false)
  const easyRef = useRef(easy)
  easyRef.current = easy
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

  function commitScore(next: number) {
    scoreRef.current = next
    setScore(next)
  }

  function resetRound(nextAttempt: number) {
    phaseRef.current = 'ready'
    lockedRef.current = []
    flyRef.current = 0
    elapsedRef.current = 0
    lastTick.current = 0
    snappable.current = false
    cleared.current = false
    stopping.current = false
    demoRef.current = false
    writeProgress(0)
    setAttempt(nextAttempt)
    setPhase('ready')
    setLockedIds([])
    setFlyIndex(0)
    commitScore(0)
    setDemoOn(false)
    setPlusFlash('')
    setWinStamp('')
    setShake(false)
    setClaimShown(false)
    flashToast(nextAttempt > 0 ? `${STORY_SNAP_AGAIN}. ${STORY_SNAP_HINT}` : STORY_SNAP_HINT)
  }

  function beginRound(nextAttempt: number) {
    resetRound(nextAttempt)
    if (!easyRef.current || nextAttempt !== 0) return
    demoRef.current = true
    setDemoOn(true)
    startFly(0)
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
    // A host line change while the story is open must not wipe the held card.
    // The fly loop belongs to the duration effect — cancelling it here would
    // freeze One more snap after that change.
    if (phaseRef.current === 'open') return
    beginRound(0)
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
      if (demoRef.current && inSnapWindow(nextProgress)) {
        lockDemo()
        return
      }
      if (beatPastGate(nextProgress) && snappable.current) {
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
      const lost = missPointsLost(scoreRef.current, easyRef.current)
      commitScore(scoreRef.current - lost)
      lockedRef.current = lockedAfterMiss(lockedRef.current)
      setLockedIds(lockedRef.current)
      setShake(true)
      window.setTimeout(() => setShake(false), 560)
      onMiss()
      flashToast(missToast(lost))
    }
    const idx = nextBeatIndex(lockedRef.current)
    window.setTimeout(() => {
      if (phaseRef.current === 'open') return
      startFly(idx)
    }, penalize ? 380 : 120)
  }

  function lockDemo() {
    if (!demoRef.current || phaseRef.current !== 'fly') return
    demoRef.current = false
    setDemoOn(false)
    snappable.current = false
    phaseRef.current = 'snap'
    setPhase('snap')
    const beat = beatByIndex(flyRef.current)
    lockedRef.current = demoCountsLocked(lockedRef.current, beat.id)
    setLockedIds(lockedRef.current)
    playGemPop('find')
    commitScore(applyDemoSnap(scoreRef.current))
    flashToast(DEMO_TURN)
    if (allBeatsLocked(lockedRef.current) || lockedRef.current.length >= SNAPS_TO_OPEN) {
      window.setTimeout(() => openStory(), reduced ? 80 : 420)
      return
    }
    const idx = nextBeatIndex(lockedRef.current)
    window.setTimeout(() => {
      if (phaseRef.current === 'open') return
      startFly(idx)
    }, reduced ? 60 : 360)
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
    commitScore(applySnapScore(scoreRef.current))
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
    commitScore(applyOpenScore(scoreRef.current))
    setPlusFlash(`+${STORY_OPEN_SCORE}`)
    setWinStamp(STORY_SNAP_WIN)
    setClaimShown(true)
    window.setTimeout(() => setPlusFlash(''), 900)
  }

  function holdWin() {
    if (phaseRef.current !== 'open' || stopping.current) return
    stopping.current = true
    if (!cleared.current) {
      cleared.current = true
      onClear?.()
    }
    onEasyStop?.('hold')
  }

  function onPadDown(event: ReactPointerEvent<HTMLButtonElement>) {
    if (phaseRef.current === 'open' || demoRef.current) return
    event.preventDefault()
    if (phaseRef.current === 'ready') {
      startFly(nextBeatIndex(lockedRef.current))
      return
    }
    if (phaseRef.current === 'fly') lockSnap()
  }

  function onPadKeyDown(event: ReactKeyboardEvent<HTMLButtonElement>) {
    if (event.code !== 'Space' && event.key !== ' ') return
    if (demoRef.current) return
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
      : demoOn
        ? 'Watch'
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
        <section className="snap-result" data-snap-hold="open" aria-label="Story open">
          <p className="win-stamp">{STORY_SNAP_WIN}</p>
          <ol className="snap-result-beats">
            {STORY_SNAP_BEATS.map((beat) => (
              <li key={beat.id}>{beat.label}</li>
            ))}
          </ol>
          <p className="snap-claim" role="status">
            {STORY_SNAP_CLAIM}
          </p>
          <p className="snap-result-score">{score}</p>
        </section>
      ) : (
        <p className="match-score is-juice" aria-label={`Score ${score}`}>
          {score}
        </p>
      )}

      <button
        type="button"
        className="btn gold xl snap-pad"
        onPointerDown={onPadDown}
        onKeyDown={onPadKeyDown}
        aria-label={padLabel}
      >
        {padLabel}
        {demoOn ? (
          <span className={`snap-ghost ${reduced ? 'is-still' : 'is-tap'}`} aria-hidden>
            <svg viewBox="0 0 72 96" width="44" height="58">
              <rect x="16" y="6" width="40" height="34" rx="14" fill="#ffe7c2" stroke="#5a3a12" strokeWidth="2" />
              <ellipse cx="14" cy="30" rx="9" ry="7" fill="#ffe7c2" stroke="#5a3a12" strokeWidth="2" />
              <rect x="29" y="28" width="14" height="60" rx="7" fill="#ffe7c2" stroke="#5a3a12" strokeWidth="2" />
              <rect x="32" y="76" width="8" height="8" rx="3" fill="#fff6e8" stroke="#5a3a12" strokeWidth="1.5" />
            </svg>
          </span>
        ) : null}
      </button>

      <div className="cta-dock">
        {phase === 'open' ? (
          <>
            <button type="button" className="btn primary xl" onClick={holdWin}>
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
