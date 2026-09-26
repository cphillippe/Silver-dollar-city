import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react'
import { EASY, easyWhoWhere } from '../../lib/easy'
import { fatherWinBeat } from '../../lib/successBeat'
import { MatchTakeaway } from '../HeldTriad'
import {
  applyDash,
  beatsOpened,
  dashPhase,
  fatherStartProgress,
  FATHER_RUN_AGAIN,
  FATHER_RUN_CLAIM,
  FATHER_RUN_DASH_SCORE,
  FATHER_RUN_HINT,
  FATHER_RUN_HUG_SCORE,
  FATHER_RUN_WIN,
  HIRED_HAND_SPEECH,
  holdStep,
  hugBeforeSpeech,
  MIN_DASHES_TO_HUG,
  runOutcome,
  SPEECH_PHRASE_MS,
  speechIndexAt,
  speechPhraseAt,
  stumbleIfHeldThrough,
} from '../../lib/fatherRun'
import { GEM_BURST, playGemPop, prefersReducedMotion } from '../../lib/juice'
import { storyPanelsFor, type StoryPanel } from '../../lib/storyPanels'
import { StoryPanelArt } from '../StoryPanelArt'
import { FATHER_HUG_MEDIA, FATHER_RUN_FACE, FATHER_SON_FACE } from '../../content/panelBlast'
import { WinBurst } from './WinBurst'

interface FatherRunPlayProps {
  lineId: string
  beats?: StoryPanel[]
  onMiss: () => void
  onClear?: () => void
  onEasyStop?: (dest: 'hold' | 'home') => void
}

const DUST = [0, 1, 2, 3, 4]
const DASH_SHARDS = [0, 1, 2, 3, 4]

export function FatherRunPlay({
  lineId,
  beats,
  onMiss,
  onClear,
  onEasyStop,
}: FatherRunPlayProps) {
  const panels = useMemo(() => beats ?? storyPanelsFor(lineId), [beats, lineId])
  const home = easyWhoWhere(lineId)
  const reduced = prefersReducedMotion()
  const [attempt, setAttempt] = useState(0)
  const [progress, setProgress] = useState(0)
  const [holding, setHolding] = useState(false)
  const [phase, setPhase] = useState<'ready' | 'run' | 'hug' | 'miss'>('ready')
  const [elapsed, setElapsed] = useState(0)
  const [toast, setToast] = useState('')
  const [dashFlash, setDashFlash] = useState(false)
  const [winStamp, setWinStamp] = useState(false)
  const [flipping, setFlipping] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const [plusFlash, setPlusFlash] = useState('')
  const [comboFlash, setComboFlash] = useState(0)
  const dashCount = useRef(0)
  const holdingRef = useRef(false)
  const heldMsRef = useRef(0)
  const inWindowRef = useRef(false)
  const dashedWindowRef = useRef(false)
  const progressRef = useRef(0)
  const elapsedRef = useRef(0)
  const clockOn = useRef(false)
  const lastTick = useRef(0)
  const phaseRef = useRef<'ready' | 'run' | 'hug' | 'miss'>('ready')
  const cleared = useRef(false)
  const openedRef = useRef(1)
  const frame = useRef(0)

  const opened = beatsOpened(progress, panels.length)
  const phrase = clockOn.current || elapsed > 0 ? speechPhraseAt(elapsed) : HIRED_HAND_SPEECH[0]
  const spoken = clockOn.current || elapsed > 0 ? Math.min(HIRED_HAND_SPEECH.length, speechIndexAt(elapsed) + 1) : 0
  const dash = dashPhase(elapsed)
  const latest = panels[Math.min(opened, panels.length) - 1]
  const caption =
    phase === 'hug'
      ? FATHER_RUN_CLAIM
      : latest?.text ?? 'He is still a long way off.'

  function writeProgress(next: number) {
    progressRef.current = next
    setProgress(next)
  }

  function flashToast(line: string) {
    setToast(line)
    window.setTimeout(() => setToast((current) => (current === line ? '' : current)), 1400)
  }

  function resetRound(nextAttempt: number) {
    const start = fatherStartProgress(nextAttempt)
    holdingRef.current = false
    clockOn.current = false
    lastTick.current = 0
    elapsedRef.current = 0
    openedRef.current = beatsOpened(start, panels.length)
    phaseRef.current = 'ready'
    cleared.current = false
    writeProgress(start)
    setAttempt(nextAttempt)
    setHolding(false)
    setElapsed(0)
    setPhase('ready')
    setWinStamp(false)
    setDashFlash(false)
    setFlipping(null)
    setScore(0)
    setPlusFlash('')
    setComboFlash(0)
    dashCount.current = 0
    heldMsRef.current = 0
    inWindowRef.current = false
    dashedWindowRef.current = false
    flashToast(nextAttempt > 0 ? 'Closer this time. Hold — then press the glow.' : '')
  }

  function replay() {
    resetRound(0)
    flashToast('One more run. Hold — then press the glow.')
  }

  useEffect(() => {
    resetRound(0)
    return () => window.cancelAnimationFrame(frame.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lineId])

  useEffect(() => {
    if (opened !== openedRef.current && opened > openedRef.current) {
      const index = opened - 1
      openedRef.current = opened
      setFlipping(index)
      window.setTimeout(() => setFlipping((current) => (current === index ? null : current)), 480)
    }
  }, [opened])

  useEffect(() => {
    function tick(now: number) {
      frame.current = window.requestAnimationFrame(tick)
      const live = phaseRef.current
      if (live === 'hug' || live === 'miss') return
      if (!clockOn.current) return
      const prev = lastTick.current || now
      lastTick.current = now
      const dt = Math.min(0.05, (now - prev) / 1000)
      const nextElapsed = elapsedRef.current + dt * 1000
      elapsedRef.current = nextElapsed
      if (holdingRef.current) heldMsRef.current += dt * 1000
      else heldMsRef.current = 0
      const windowNow = dashPhase(nextElapsed).inWindow
      let nextProgress = holdStep(
        progressRef.current,
        dt,
        holdingRef.current,
        reduced,
        heldMsRef.current,
      )
      nextProgress = stumbleIfHeldThrough(
        nextProgress,
        inWindowRef.current,
        windowNow,
        holdingRef.current,
        dashedWindowRef.current,
      )
      if (inWindowRef.current && !windowNow) dashedWindowRef.current = false
      inWindowRef.current = windowNow
      progressRef.current = nextProgress
      setElapsed(nextElapsed)
      setProgress(nextProgress)
      const outcome = runOutcome(nextProgress, nextElapsed, dashCount.current)
      if (outcome === 'hug') {
        winRound()
        return
      }
      if (outcome === 'miss') {
        missRound()
      }
    }
    frame.current = window.requestAnimationFrame(tick)
    return () => window.cancelAnimationFrame(frame.current)
  }, [reduced])

  function winRound() {
    if (phaseRef.current === 'hug') return
    phaseRef.current = 'hug'
    holdingRef.current = false
    clockOn.current = false
    setHolding(false)
    setPhase('hug')
    writeProgress(1)
    playGemPop('win')
    setScore((pts) => pts + FATHER_RUN_HUG_SCORE)
    setPlusFlash(`+${FATHER_RUN_HUG_SCORE}`)
    window.setTimeout(() => setPlusFlash(''), 800)
    if (!cleared.current) {
      cleared.current = true
      onClear?.()
    }
    window.setTimeout(() => setWinStamp(true), reduced ? 40 : 280)
  }

  function missRound() {
    if (phaseRef.current === 'miss' || phaseRef.current === 'hug') return
    phaseRef.current = 'miss'
    holdingRef.current = false
    clockOn.current = false
    setHolding(false)
    setPhase('miss')
    playGemPop('miss')
    onMiss()
  }

  function beginHold(fromPad?: HTMLButtonElement, pointerId?: number) {
    if (phaseRef.current === 'hug' || phaseRef.current === 'miss') return
    if (fromPad && pointerId !== undefined) fromPad.setPointerCapture(pointerId)
    const wasHolding = holdingRef.current
    if (!clockOn.current) {
      clockOn.current = true
      lastTick.current = 0
      elapsedRef.current = 0
      phaseRef.current = 'run'
      setPhase('run')
      setElapsed(0)
    }
    const windowOpen = dashPhase(elapsedRef.current).inWindow
    if (windowOpen && !wasHolding) {
      const next = applyDash(progressRef.current)
      writeProgress(next)
      dashedWindowRef.current = true
      heldMsRef.current = 0
      setDashFlash(true)
      playGemPop('find')
      dashCount.current += 1
      setScore((pts) => pts + FATHER_RUN_DASH_SCORE)
      setPlusFlash(`+${FATHER_RUN_DASH_SCORE}`)
      if (dashCount.current >= MIN_DASHES_TO_HUG) {
        setComboFlash(dashCount.current)
        window.setTimeout(() => setComboFlash(0), 700)
      }
      flashToast('Mercy!')
      window.setTimeout(() => setDashFlash(false), 320)
      window.setTimeout(() => setPlusFlash(''), 800)
      if (hugBeforeSpeech(next, elapsedRef.current, dashCount.current)) {
        winRound()
        return
      }
    }
    holdingRef.current = true
    setHolding(true)
  }

  function onPadDown(event: ReactPointerEvent<HTMLButtonElement>) {
    if (phaseRef.current === 'hug' || phaseRef.current === 'miss') return
    event.preventDefault()
    beginHold(event.currentTarget, event.pointerId)
  }

  function onPadUp() {
    holdingRef.current = false
    setHolding(false)
  }

  function onPadKeyDown(event: ReactKeyboardEvent<HTMLButtonElement>) {
    if (event.code !== 'Space' && event.key !== ' ') return
    event.preventDefault()
    if (!holdingRef.current) beginHold()
  }

  function onPadKeyUp(event: ReactKeyboardEvent<HTMLButtonElement>) {
    if (event.code !== 'Space' && event.key !== ' ') return
    event.preventDefault()
    onPadUp()
  }

  const fatherLeft = 8 + progress * 64
  const sonLeft = 88 - progress * 6
  const speechPct = Math.min(100, (elapsed / (HIRED_HAND_SPEECH.length * SPEECH_PHRASE_MS)) * 100)

  return (
    <div
      className={`play is-father-run ${holding ? 'is-running' : ''} ${dash.inWindow && phase === 'run' ? 'is-glow' : ''} ${dashFlash ? 'is-dash' : ''} ${phase === 'hug' ? 'is-win is-hug' : ''} ${phase === 'miss' ? 'is-miss' : ''}`}
    >
      {/* Easy Clear 1.4.144: omit runHunt .sort-how — run-pad + toast + story-caption already teach Hold / glow. */}
      <p className="story-kicker">
        {home.who} · {home.place}
      </p>
      <div className="run-scene" aria-hidden>
        <WinBurst play={winStamp} stamp={FATHER_RUN_WIN} />
        <div className="run-sky" />
        <div className="run-haze" />
        <div className="run-house" />
        <div className="run-road">
          <span className="run-road-line" />
          <span className="run-road-line is-far" />
        </div>
        {holding
          ? DUST.map((i) => <span key={i} className="run-dust" style={{ ['--i' as string]: i }} />)
          : null}
        <div className="run-actor is-father" style={{ left: `${fatherLeft}%` }}>
          <img src={FATHER_RUN_FACE} alt="" draggable={false} />
        </div>
        <div className="run-actor is-son" style={{ left: `${sonLeft}%` }}>
          <img src={FATHER_SON_FACE} alt="" draggable={false} />
        </div>
        {dashFlash
          ? DASH_SHARDS.map((i) => (
              <i key={i} className="run-shard" style={{ ['--i' as string]: i, left: `${fatherLeft}%` }} />
            ))
          : null}
        {dashFlash
          ? GEM_BURST.slice(0, 4).map((i) => (
              <b key={`p-${i}`} className="run-burst" style={{ ['--i' as string]: i, left: `${fatherLeft}%` }} />
            ))
          : null}
        {phase === 'hug' ? (
          <div className="run-hug-art" aria-hidden>
            <StoryPanelArt scene="hug" media={FATHER_HUG_MEDIA} size="hero" />
          </div>
        ) : null}
        {phase === 'hug' ? <span className="run-hearts" /> : null}
        {plusFlash ? (
          <p className="bonus-plus" aria-hidden>
            {plusFlash}!
          </p>
        ) : null}
        {comboFlash > 1 ? (
          <p className="run-combo" role="status">
            Combo ×{comboFlash}
          </p>
        ) : null}
      </div>
      <p className={`match-score ${plusFlash ? 'is-juice' : ''}`}>{score}</p>
      <ol className="run-thumbs" aria-label="Story beats" style={{ ['--story-n' as string]: panels.length }}>
        {panels.map((panel, index) => {
          const open = index < opened || phase === 'hug'
          return (
            <li
              key={panel.id}
              data-beat={panel.beatId}
              className={`run-thumb ${open ? 'is-open' : ''} ${index === opened - 1 ? 'is-now' : ''} ${flipping === index ? 'is-flip' : ''}`}
            >
              <StoryPanelArt scene={panel.scene} media={panel.media} size="thumb" />
            </li>
          )
        })}
      </ol>
      <p className="story-caption" role="status">
        {caption}
      </p>
      {/* Easy Clear 1.4.154: keep speech + timer; short-height CSS compresses chrome — Fixes #191 */}
      {/* Easy Clear 1.4.173: ≤720 peels HUD (kicker · thumbs · caption) in index.css — pad/scene stay above fold. */}
      {/* Easy Clear 1.4.189: ≤720 fills purple void in index.css (invent Fun/Clear). */}
      {/* Easy Clear 1.4.196: ≤720 zeros cta-dock margin-top so slider→CTA gap closes (Fixes #253). */}
      {/* Easy Clear 1.4.204: ≤720 closes speech→rail purple gap (fill 189 / dock 196 stay). */}
      {/* Easy Clear 1.4.214: phone portrait extends fill+dock so slider→HOLD closes (Fixes #272). */}
      {/* Easy Clear 1.4.216: phone portrait extends speech→rail+pad so Dash rail→CTA closes (Fixes #283). */}
      {/* Easy Clear 1.4.229: phone portrait strengthens fill — overflow hidden · run-scene flex 1 1 0 · dock static so rail→CTA closes (Fixes #301). */}
      {/* Easy Clear 1.4.240: tall-phone strengthens fill 229 — ancestor height chain · run-scene flex 1 1 0 · dock static + clear sticky blur so rail→CTA closes (Fixes #319). */}
      {/* Easy Clear 1.4.250: tall-phone cream plate fill — paint parchment play · warm run-scene · dark ink · dock pin — closes Shot 240 purple residual (Fixes #336). */}
      {/* Easy Clear 1.4.257: tall-phone cream shell fill — opaque cream app-body + play shell · solid cream run plate · warm run-scene · cream HOLD TO RUN dock floor — closes Shot 250 purple void after 250 (Fixes #349). */}
      <div className={`run-speech ${phase === 'miss' ? 'is-done' : ''}`} aria-live="polite">
        <p className="run-speech-kicker">Hired-hand speech</p>
        <p className="run-speech-line">{phrase}</p>
        <span className="run-speech-bar" style={{ width: `${speechPct}%` }} />
        <p className="run-speech-count">
          {Math.min(spoken, HIRED_HAND_SPEECH.length)} / {HIRED_HAND_SPEECH.length}
        </p>
      </div>
      {phase === 'hug' || phase === 'miss' ? null : (
        <div className={`run-rail ${dash.inWindow ? 'is-hot' : ''}`} aria-hidden>
          <span className="run-rail-track" />
          <span className="run-rail-notch" />
          <span className="run-rail-gem" style={{ left: `${6 + dash.travel * 78}%` }} />
        </div>
      )}
      {toast && phase !== 'hug' ? (
        <p className="match-toast gem-toast" role="status">
          <strong>{toast}</strong>
        </p>
      ) : null}
      {phase === 'miss' ? (
        <div className="run-miss" role="status">
          <p className="run-miss-hint">{FATHER_RUN_HINT}</p>
          <p className="quiet">Try again — you start closer.</p>
          <div className="cta-dock run-dock">
            <button type="button" className="btn gold xl" onClick={() => resetRound(attempt + 1)}>
              Run again
            </button>
          </div>
        </div>
      ) : phase === 'hug' ? (
        <>
        <MatchTakeaway lineId={lineId} title={fatherWinBeat().title} />
        <div className="cta-dock">
          <button
            type="button"
            className="btn primary xl snap-bins"
            onClick={() => onEasyStop?.('hold')}
          >
            {EASY.holdNext}
          </button>
          <button type="button" className="btn gold xl" data-run-again onClick={replay}>
            {FATHER_RUN_AGAIN}
          </button>
          <button type="button" className="btn xl" onClick={() => onEasyStop?.('home')}>
            {EASY.home}
          </button>
        </div>
        </>
      ) : (
        <div className="cta-dock run-dock">
          <button
            type="button"
            className={`run-pad ${holding ? 'is-held' : ''} ${dash.inWindow ? 'is-glow' : ''}`}
            aria-pressed={holding}
            onPointerDown={onPadDown}
            onPointerUp={onPadUp}
            onPointerCancel={onPadUp}
            onKeyDown={onPadKeyDown}
            onKeyUp={onPadKeyUp}
          >
            {dash.inWindow && phase === 'run' ? 'Let go — press now!' : 'Hold to run'}
          </button>
        </div>
      )}
    </div>
  )
}
