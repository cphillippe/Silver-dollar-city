import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type KeyboardEvent as ReactKeyboardEvent } from 'react'
import { EASY, easyWhoWhere } from '../../lib/easy'
import {
  aimMerge,
  ballAt,
  BOWL_HEIGHT,
  BOWL_WIDTH,
  CLAIM_MERGE_HINT,
  CLAIM_MERGE_WIN,
  canDrop,
  createMergeGame,
  DANGER_Y,
  dragGrab,
  dropNext,
  grabBall,
  highestMergeRank,
  MERGE_MISS_FACE,
  MERGE_SKINS,
  mergeBeatsOpened,
  mergeSkin,
  releaseGrab,
  resetMergeRound,
  stepMerge,
  WIN_RANK,
  type MergeBall,
  type MergeEvent,
  type MergeState,
} from '../../lib/claimMerge'
import { GEM_BURST, playGemPop, prefersReducedMotion } from '../../lib/juice'
import { MatchTakeaway } from '../HeldTriad'
import type { StoryPanel } from '../../lib/storyPanels'
import { WinBurst } from './WinBurst'

interface ClaimMergePlayProps {
  lineId: string
  beats?: StoryPanel[]
  onMiss: () => void
  onClear?: () => void
  onEasyStop?: (dest: 'hold' | 'home') => void
}

const SHARDS = [0, 1, 2, 3, 4, 5, 6, 7]

function bowlPoint(node: HTMLElement, event: { clientX: number; clientY: number }) {
  const box = node.getBoundingClientRect()
  const x = ((event.clientX - box.left) / box.width) * BOWL_WIDTH
  const y = ((event.clientY - box.top) / box.height) * BOWL_HEIGHT
  return { x, y }
}

export function ClaimMergePlay({
  lineId,
  beats,
  onMiss,
  onClear,
  onEasyStop,
}: ClaimMergePlayProps) {
  void beats
  const home = easyWhoWhere(lineId)
  const reduced = prefersReducedMotion()
  const stateRef = useRef<MergeState>(createMergeGame(Date.now() % 9999))
  const [view, setView] = useState(stateRef.current)
  const [toast, setToast] = useState('')
  const [toastMiss, setToastMiss] = useState(false)
  const [comboFlash, setComboFlash] = useState(0)
  const [pops, setPops] = useState<{ id: number; x: number; y: number; rank: number; miss?: boolean }[]>([])
  const [plus, setPlus] = useState('')
  const [shake, setShake] = useState(false)
  const [cued, setCued] = useState(true)
  const bowlRef = useRef<HTMLDivElement | null>(null)
  const aiming = useRef(false)
  const grabbing = useRef(false)
  const cleared = useRef(false)
  const popId = useRef(0)
  const last = useRef(0)
  const peak = highestMergeRank(view.balls)
  const opened = mergeBeatsOpened(peak, view.won)

  function publish(next: MergeState) {
    stateRef.current = next
    setView(next)
    juiceEvents(next.events)
  }

  function juiceEvents(events: MergeEvent[]) {
    for (const event of events) {
      if (event.kind === 'merge') {
        playGemPop(event.rank && event.rank >= WIN_RANK - 1 ? 'win' : event.combo && event.combo > 1 ? 'bonus' : 'find')
        if (event.combo && event.combo > 1) {
          setComboFlash(event.combo)
          window.setTimeout(() => setComboFlash(0), 880)
        }
        if (event.points) {
          setPlus(`+${event.points}`)
          window.setTimeout(() => setPlus(''), 700)
        }
        if (event.x !== undefined && event.y !== undefined && event.rank !== undefined) {
          const id = popId.current + 1
          popId.current = id
          setPops((current) => [...current.slice(-6), { id, x: event.x ?? 0, y: event.y ?? 0, rank: event.rank ?? 0 }])
          window.setTimeout(() => {
            setPops((current) => current.filter((pop) => pop.id !== id))
          }, 920)
        }
        setToast('')
        setToastMiss(false)
        setCued(false)
      } else if (event.kind === 'miss') {
        playGemPop('miss')
        setShake(true)
        setToast(MERGE_MISS_FACE)
        setToastMiss(true)
        setCued(false)
        onMiss()
        if (event.x !== undefined && event.y !== undefined) {
          const id = popId.current + 1
          popId.current = id
          setPops((current) => [...current.slice(-6), { id, x: event.x ?? 0, y: event.y ?? 0, rank: 1, miss: true }])
          window.setTimeout(() => {
            setPops((current) => current.filter((pop) => pop.id !== id))
          }, 720)
        }
        window.setTimeout(() => setShake(false), 420)
        window.setTimeout(() => {
          setToast((current) => (current === MERGE_MISS_FACE ? '' : current))
          setToastMiss(false)
        }, 980)
      } else if (event.kind === 'win') {
        playGemPop('win')
        if (!cleared.current) {
          cleared.current = true
          onClear?.()
        }
      } else if (event.kind === 'overflow') {
        playGemPop('miss')
        setShake(true)
        setToast('Bowl full')
        setToastMiss(true)
        window.setTimeout(() => setShake(false), 420)
      } else if (event.kind === 'drop') {
        playGemPop('find')
        setCued(false)
      }
    }
  }

  useEffect(() => {
    let frame = 0
    last.current = performance.now()
    const tick = (time: number) => {
      const dt = reduced ? 0.032 : (time - last.current) / 1000
      last.current = time
      const current = stateRef.current
      if (!current.won && !current.overflow) {
        const next = stepMerge(current, dt, time)
        if (next !== current) publish(next)
        else if (next.events.length) juiceEvents(next.events)
      }
      frame = window.requestAnimationFrame(tick)
    }
    frame = window.requestAnimationFrame(tick)
    return () => window.cancelAnimationFrame(frame)
    // mount loop only
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced])

  function replay() {
    cleared.current = false
    setToast('')
    setToastMiss(false)
    setPops([])
    setPlus('')
    setComboFlash(0)
    setCued(true)
    publish(resetMergeRound(Date.now() % 9999, performance.now(), view.won ? 0 : view.score))
  }

  function onBowlDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (view.won || view.overflow) return
    const node = bowlRef.current
    if (!node) return
    event.preventDefault()
    const point = bowlPoint(node, event)
    const hit = ballAt(stateRef.current, point.x, point.y)
    if (hit && !hit.dropping && stateRef.current.droppingId === null) {
      grabbing.current = true
      aiming.current = false
      setCued(false)
      publish(grabBall(stateRef.current, hit.id))
      event.currentTarget.setPointerCapture(event.pointerId)
      return
    }
    if (!canDrop(stateRef.current)) return
    aiming.current = true
    grabbing.current = false
    publish(aimMerge(stateRef.current, point.x))
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  function onBowlMove(event: ReactPointerEvent<HTMLDivElement>) {
    const node = bowlRef.current
    if (!node) return
    const point = bowlPoint(node, event)
    if (grabbing.current && stateRef.current.grabId !== null) {
      publish(dragGrab(stateRef.current, point.x, point.y))
      return
    }
    if (aiming.current) publish(aimMerge(stateRef.current, point.x))
  }

  function onBowlUp() {
    if (grabbing.current) {
      grabbing.current = false
      publish(releaseGrab(stateRef.current, performance.now()))
      return
    }
    if (aiming.current) {
      aiming.current = false
      publish(dropNext(stateRef.current, performance.now()))
    }
  }

  function onBowlKey(event: ReactKeyboardEvent<HTMLDivElement>) {
    if (view.won || view.overflow) return
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault()
      const delta = event.key === 'ArrowLeft' ? -22 : 22
      publish(aimMerge(stateRef.current, stateRef.current.aimX + delta))
      return
    }
    if (event.key === ' ' || event.code === 'Space' || event.key === 'Enter') {
      event.preventDefault()
      publish(dropNext(stateRef.current, performance.now()))
    }
  }

  const cueDied = cued && !view.won && !view.overflow
    ? view.balls.filter((ball) => ball.rank === 1 && !ball.dropping)
    : []
  const showCue = cueDied.length >= 2
  const nextSkin = mergeSkin(view.nextRank)
  const previewSkin = mergeSkin(view.previewRank)
  const ghostX = view.aimX
  const ghostR = nextSkin.radius

  return (
    <div
      className={`play is-claim-merge ${shake ? 'is-shake' : ''} ${view.won ? 'is-win' : ''} ${view.overflow ? 'is-full' : ''} ${comboFlash > 1 ? 'is-combo' : ''}`}
    >
      {/* Easy Clear 1.4.147: omit mergeHunt .sort-how — Drop chip · smash hint · ladder already teach the bowl (Fixes #184; Clear family with Maze 1.4.143 / Father 1.4.144). */}
      {/* Easy Clear 1.4.159: ≤720 bowl-first — thin HUD · ladder; Drop chip stays (Fixes #205; Story Snap / maze ≤720 family). */}
      {/* Easy Clear 1.4.181: ≤720 peels HUD — hide who·where kicker + rung names so bowl · Drop stay above fold (Father 173 / maze 175 family). */}
      {/* Easy Clear 1.4.192: ≤720 fills purple void — grow play + stretch merge-bowl (Match 184 / Story Creek 191 fill family). */}
      <p className="story-kicker">
        {home.who} · {home.place}
      </p>
      <div className="merge-hud">
        <p className={`merge-score ${plus ? 'is-juice' : ''}`} aria-live="polite">
          {view.score}
        </p>
        {view.won ? (
          <p className="merge-next-label">Creed</p>
        ) : (
          <div className="merge-next" aria-label="Next candy">
            <span className={`merge-mini hue-${nextSkin.hue}`}>{nextSkin.rank === 0 ? '' : nextSkin.label}</span>
            <span className="merge-next-label">Next</span>
            <span className={`merge-mini is-preview hue-${previewSkin.hue}`}>{previewSkin.rank === 0 ? '' : previewSkin.label}</span>
          </div>
        )}
      </div>
      {comboFlash > 1 ? (
        <p className="bonus-banner merge-combo" role="status">
          <strong>COMBO x{comboFlash}</strong>
        </p>
      ) : toastMiss && toast ? (
        <p className="miss-banner" role="status">
          <strong>{toast}</strong>
        </p>
      ) : null}
      {plus ? (
        <p className="bonus-plus" aria-hidden>
          {plus}
        </p>
      ) : null}
      <div
        ref={bowlRef}
        className="merge-bowl"
        role="application"
        tabIndex={0}
        aria-label="Candy merge bowl"
        onPointerDown={onBowlDown}
        onPointerMove={onBowlMove}
        onPointerUp={onBowlUp}
        onPointerCancel={onBowlUp}
        onKeyDown={onBowlKey}
        style={{ ['--bowl-w' as string]: `${BOWL_WIDTH}px`, ['--bowl-h' as string]: `${BOWL_HEIGHT}px` }}
      >
        <WinBurst play={view.won} stamp={CLAIM_MERGE_WIN} />
        <span className="merge-danger" style={{ top: `${(DANGER_Y / BOWL_HEIGHT) * 100}%` }} />
        {!view.won && !view.overflow ? (
          <>
            <span
              className="merge-drop-guide"
              style={{ left: `${(ghostX / BOWL_WIDTH) * 100}%` }}
            />
            <span
              className={`merge-ghost is-loud hue-${nextSkin.hue}`}
              style={{
                left: `${(ghostX / BOWL_WIDTH) * 100}%`,
                width: ghostR * 2,
                height: ghostR * 2,
              }}
            />
            <span
              className="merge-drop-chip"
              style={{ left: `${(ghostX / BOWL_WIDTH) * 100}%` }}
            >
              Drop
            </span>
          </>
        ) : null}
        {showCue ? (
          <p className="merge-smash-hint" role="status">
            Smash the Died pair
          </p>
        ) : null}
        {view.balls.map((ball) => (
          <MergeCandy key={ball.id} ball={ball} cue={showCue && ball.rank === 1} />
        ))}
        {pops.map((pop) => (
          <span
            key={pop.id}
            className={`merge-pop hue-${mergeSkin(pop.rank).hue} ${pop.miss ? 'is-miss' : ''}`}
            style={{
              left: `${(pop.x / BOWL_WIDTH) * 100}%`,
              top: `${(pop.y / BOWL_HEIGHT) * 100}%`,
              width: 48 + pop.rank * 16,
              height: 48 + pop.rank * 16,
            }}
          >
            {SHARDS.map((i) => (
              <i key={i} style={{ ['--i' as string]: i }} />
            ))}
            {GEM_BURST.slice(0, 4).map((i) => (
              <b key={i} style={{ ['--i' as string]: i }} />
            ))}
          </span>
        ))}
      </div>
      <ol className="merge-ladder" aria-label="Candy sizes">
        {MERGE_SKINS.map((skin) => (
          <li
            key={skin.rank}
            className={`merge-rung hue-${skin.hue} ${peak >= skin.rank ? 'is-lit' : ''} ${opened > skin.rank ? 'is-past' : ''}`}
          >
            <span className="merge-rung-dot" />
            <span className="merge-rung-name">{skin.rank === 0 ? 'Pip' : skin.label}</span>
          </li>
        ))}
      </ol>
      {view.won ? (
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
            <button type="button" className="btn gold xl" onClick={replay}>
              One more bowl
            </button>
            <button type="button" className="btn xl" onClick={() => onEasyStop?.('home')}>
              {EASY.home}
            </button>
          </div>
        </>
      ) : view.overflow ? (
        <div className="cta-dock">
          <p className="quiet">{CLAIM_MERGE_HINT}</p>
          <button type="button" className="btn primary xl snap-bins" onClick={replay}>
            Merge again
          </button>
        </div>
      ) : null}
    </div>
  )
}

function MergeCandy({ ball, cue }: { ball: MergeBall; cue?: boolean }) {
  const skin = mergeSkin(ball.rank)
  const showWord = skin.rank > 0
  return (
    <span
      className={`merge-ball hue-${skin.hue} ${ball.held ? 'is-held' : ''} ${ball.dropping ? 'is-drop' : ''} ${ball.rank >= WIN_RANK ? 'is-lock' : ''} ${cue ? 'is-cue' : ''}`}
      data-merge-ball={ball.id}
      data-rank={ball.rank}
      style={{
        left: `${(ball.x / BOWL_WIDTH) * 100}%`,
        top: `${(ball.y / BOWL_HEIGHT) * 100}%`,
        width: ball.r * 2,
        height: ball.r * 2,
      }}
    >
      {showWord ? <strong>{skin.label}</strong> : <em />}
    </span>
  )
}
