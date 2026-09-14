import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { EASY, easyWhoWhere } from '../../lib/easy'
import {
  applyDash,
  beatsOpened,
  dashPhase,
  fatherStartProgress,
  FATHER_RUN_CLAIM,
  FATHER_RUN_HINT,
  FATHER_RUN_WIN,
  HIRED_HAND_SPEECH,
  holdStep,
  hugBeforeSpeech,
  runOutcome,
  SPEECH_PHRASE_MS,
  speechIndexAt,
  speechPhraseAt,
} from '../../lib/fatherRun'
import { playGemPop, prefersReducedMotion } from '../../lib/juice'
import { storyPanelsFor, type StoryPanel } from '../../lib/storyPanels'
import { StoryPanelArt } from '../StoryPanelArt'
import { WinBurst } from './WinBurst'

interface FatherRunPlayProps {
  lineId: string
  beats?: StoryPanel[]
  onMiss: () => void
  onClear?: () => void
  onEasyStop?: (dest: 'hold' | 'home') => void
}

const DUST = [0, 1, 2, 3, 4]

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
  const holdingRef = useRef(false)
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
    flashToast(nextAttempt > 0 ? 'Closer this time. Hold — then press the glow.' : '')
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
      const nextProgress = holdStep(progressRef.current, dt, holdingRef.current, reduced)
      progressRef.current = nextProgress
      setElapsed(nextElapsed)
      setProgress(nextProgress)
      const outcome = runOutcome(nextProgress, nextElapsed)
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
    flashToast(FATHER_RUN_CLAIM)
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

  function onPadDown(event: ReactPointerEvent<HTMLButtonElement>) {
    if (phaseRef.current === 'hug' || phaseRef.current === 'miss') return
    event.preventDefault()
    event.currentTarget.setPointerCapture(event.pointerId)
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
    if (windowOpen && !wasHolding && !reduced) {
      const next = applyDash(progressRef.current)
      writeProgress(next)
      setDashFlash(true)
      playGemPop('find')
      flashToast('Mercy!')
      window.setTimeout(() => setDashFlash(false), 320)
      if (hugBeforeSpeech(next, elapsedRef.current)) {
        winRound()
        return
      }
    }
    holdingRef.current = true
    setHolding(true)
  }

  function onPadUp() {
    holdingRef.current = false
    setHolding(false)
  }

  const fatherLeft = 8 + progress * 64
  const sonLeft = 88 - progress * 6
  const speechPct = Math.min(100, (elapsed / (HIRED_HAND_SPEECH.length * SPEECH_PHRASE_MS)) * 100)

  return (
    <div
      className={`play is-father-run ${holding ? 'is-running' : ''} ${dash.inWindow && phase === 'run' ? 'is-glow' : ''} ${dashFlash ? 'is-dash' : ''} ${phase === 'hug' ? 'is-win is-hug' : ''} ${phase === 'miss' ? 'is-miss' : ''}`}
    >
      <WinBurst play={winStamp} stamp={FATHER_RUN_WIN} />
      <p className="sort-how">{EASY.runHunt}</p>
      <p className="story-kicker">
        {home.who} · {home.place}
      </p>
      <div className="run-scene" aria-hidden>
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
          <span className="run-body" />
          <span className="run-head" />
          <span className="run-robe" />
          <span className="run-leg is-a" />
          <span className="run-leg is-b" />
        </div>
        <div className="run-actor is-son" style={{ left: `${sonLeft}%` }}>
          <span className="run-body" />
          <span className="run-head" />
          <span className="run-robe" />
        </div>
        {phase === 'hug' ? (
          <div className="run-hug-art">
            <StoryPanelArt scene="hug" media={panels[panels.length - 1]?.media} />
          </div>
        ) : null}
        {phase === 'hug' ? <span className="run-hearts" /> : null}
      </div>
      <ol className="run-thumbs" aria-label="Story beats" style={{ ['--story-n' as string]: panels.length }}>
        {panels.map((panel, index) => {
          const open = index < opened || phase === 'hug'
          return (
            <li
              key={panel.id}
              data-beat={panel.beatId}
              className={`run-thumb ${open ? 'is-open' : ''} ${index === opened - 1 ? 'is-now' : ''} ${flipping === index ? 'is-flip' : ''}`}
            >
              <StoryPanelArt scene={panel.scene} media={panel.media} />
            </li>
          )
        })}
      </ol>
      <p className="story-caption" role="status">
        {caption}
      </p>
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
      {toast ? (
        <p className="match-toast gem-toast" role="status">
          <strong>{toast}</strong>
        </p>
      ) : null}
      {phase === 'miss' ? (
        <div className="run-miss" role="status">
          <p className="run-miss-hint">{FATHER_RUN_HINT}</p>
          <p className="quiet">Try again — you start closer.</p>
          <button type="button" className="btn gold xl" onClick={() => resetRound(attempt + 1)}>
            Run again
          </button>
        </div>
      ) : phase === 'hug' ? (
        <div className="cta-dock">
          <button
            type="button"
            className="btn primary xl snap-bins"
            onClick={() => onEasyStop?.('hold')}
          >
            {EASY.holdNext}
          </button>
          <button type="button" className="btn xl" onClick={() => onEasyStop?.('home')}>
            {EASY.home}
          </button>
        </div>
      ) : (
        <button
          type="button"
          className={`run-pad ${holding ? 'is-held' : ''} ${dash.inWindow ? 'is-glow' : ''}`}
          onPointerDown={onPadDown}
          onPointerUp={onPadUp}
          onPointerCancel={onPadUp}
        >
          {dash.inWindow && phase === 'run' ? 'Press again — mercy!' : 'Hold to run'}
        </button>
      )}
    </div>
  )
}
