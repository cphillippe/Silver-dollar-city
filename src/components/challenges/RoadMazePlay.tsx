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
  canHelp,
  canWin,
  MAZE_COLS,
  MAZE_HURT,
  MAZE_INN,
  MAZE_ITEMS,
  MAZE_ROWS,
  MAZE_START,
  mazeBeatsOpened,
  mazeBlockedHint,
  mazeCaption,
  mazeGoal,
  isMazeRoad,
  mazeItemAt,
  mazeKey,
  mazeSame,
  MAZE_HELP_SCORE,
  MAZE_INN_SCORE,
  MAZE_ITEM_SCORE,
  ROAD_MAZE_AGAIN,
  ROAD_MAZE_CLAIM,
  ROAD_MAZE_HINT,
  ROAD_MAZE_WIN,
  shortestMazePath,
  swipeStep,
  type MazeCoord,
  type MazeItemId,
} from '../../lib/roadMaze'
import { mazeWinBeat } from '../../lib/successBeat'
import { GEM_BURST, playGemPop, prefersReducedMotion } from '../../lib/juice'
import { storyPanelsFor, type StoryPanel } from '../../lib/storyPanels'
import { StoryPanelArt } from '../StoryPanelArt'
import panelHelp from '../../assets/story/panel-help.webp'
import panelHurt from '../../assets/story/panel-hurt.webp'
import { WinBurst } from './WinBurst'

interface RoadMazePlayProps {
  lineId: string
  beats?: StoryPanel[]
  onMiss: () => void
  onClear?: () => void
  onEasyStop?: (dest: 'hold' | 'home') => void
}

const STEP_MS = 64
const POP_SHARDS = [0, 1, 2, 3, 4]

export function RoadMazePlay({
  lineId,
  beats,
  onMiss: _onMiss,
  onClear,
  onEasyStop,
}: RoadMazePlayProps) {
  const panels = useMemo(() => beats ?? storyPanelsFor(lineId), [beats, lineId])
  const home = easyWhoWhere(lineId)
  const reduced = prefersReducedMotion()
  const [at, setAt] = useState<MazeCoord>(MAZE_START)
  const [got, setGot] = useState<MazeItemId[]>([])
  const [helped, setHelped] = useState(false)
  const [won, setWon] = useState(false)
  const [toast, setToast] = useState('')
  const [toastWhy, setToastWhy] = useState('')
  const [shake, setShake] = useState(false)
  const [hintCell, setHintCell] = useState<string>('')
  const [flipping, setFlipping] = useState<number | null>(null)
  const [winStamp, setWinStamp] = useState(false)
  const [plusFlash, setPlusFlash] = useState('')
  const [walking, setWalking] = useState(false)
  const [score, setScore] = useState(0)
  const [combo, setCombo] = useState(0)
  const [popAt, setPopAt] = useState('')
  const [kitPop, setKitPop] = useState('')
  const [comboFlash, setComboFlash] = useState(0)
  const atRef = useRef(at)
  const gotRef = useRef(got)
  const helpedRef = useRef(helped)
  const wonRef = useRef(won)
  const walkRef = useRef(0)
  const swipe = useRef<{ x: number; y: number } | null>(null)
  const usedTap = useRef(false)
  const misses = useRef(0)
  const openedRef = useRef(1)
  const cleared = useRef(false)

  const opened = mazeBeatsOpened(got, helped, won)
  const goal = mazeGoal(got, helped)
  const caption = mazeCaption(got, helped, won)
  const latest = panels[Math.min(opened, panels.length) - 1]

  useEffect(() => {
    atRef.current = at
  }, [at])

  useEffect(() => {
    if (opened === openedRef.current) return
    const index = opened - 1
    openedRef.current = opened
    setFlipping(index)
    window.setTimeout(() => setFlipping((current) => (current === index ? null : current)), 520)
  }, [opened])

  function flashToast(line: string, why = '') {
    setToast(line)
    setToastWhy(why)
    window.setTimeout(() => {
      setToast((current) => {
        if (current !== line) return current
        setToastWhy('')
        return ''
      })
    }, why ? 2000 : 1400)
  }

  function bumpHint(count: number) {
    if (count < 2) return
    setHintCell(mazeKey(goal.at))
    flashToast(goal.hint)
  }

  function juiceCollect(cell: MazeCoord, itemId: MazeItemId) {
    setCombo((n) => {
      const next = n + 1
      if (next >= 2) {
        setComboFlash(next)
        window.setTimeout(() => setComboFlash(0), 700)
      }
      return next
    })
    setScore((pts) => pts + MAZE_ITEM_SCORE)
    setPopAt(mazeKey(cell))
    setKitPop(itemId)
    setPlusFlash(`+${MAZE_ITEM_SCORE}`)
    window.setTimeout(() => setPopAt(''), 420)
    window.setTimeout(() => setKitPop(''), 480)
    window.setTimeout(() => setPlusFlash(''), 800)
  }

  function replay() {
    window.clearTimeout(walkRef.current)
    atRef.current = MAZE_START
    gotRef.current = []
    helpedRef.current = false
    wonRef.current = false
    cleared.current = false
    misses.current = 0
    openedRef.current = 1
    setAt(MAZE_START)
    setGot([])
    setHelped(false)
    setWon(false)
    setWinStamp(false)
    setToast('')
    setToastWhy('')
    setPlusFlash('')
    setHintCell('')
    setWalking(false)
    setFlipping(null)
    setScore(0)
    setCombo(0)
    setPopAt('')
    setKitPop('')
    setComboFlash(0)
  }

  function blocked(message: string) {
    setShake(true)
    playGemPop('miss')
    misses.current += 1
    flashToast(message)
    bumpHint(misses.current)
    window.setTimeout(() => setShake(false), 360)
  }

  function collectHere(cell: MazeCoord, nextGot: MazeItemId[], nextHelped: boolean) {
    const item = mazeItemAt(cell)
    if (item && !nextGot.includes(item.id)) {
      const bag = [...nextGot, item.id]
      gotRef.current = bag
      setGot(bag)
      playGemPop('bonus')
      juiceCollect(cell, item.id)
      flashToast(item.yes, item.why)
      return bag
    }
    if (mazeSame(cell, MAZE_HURT) && !nextHelped && canHelp(nextGot)) {
      helpedRef.current = true
      setHelped(true)
      playGemPop('find')
      setScore((pts) => pts + MAZE_HELP_SCORE)
      setPlusFlash(`+${MAZE_HELP_SCORE}`)
      setPopAt(mazeKey(cell))
      window.setTimeout(() => setPopAt(''), 420)
      window.setTimeout(() => setPlusFlash(''), 800)
      flashToast('Yes · You stopped.', 'You bind him and take him on.')
      return nextGot
    }
    return nextGot
  }

  function finishIfWon(cell: MazeCoord, bag: MazeItemId[], nextHelped: boolean) {
    if (!canWin(bag, nextHelped, cell) || wonRef.current) return
    wonRef.current = true
    setWon(true)
    setToast('')
    setToastWhy('')
    setScore((pts) => pts + MAZE_INN_SCORE)
    playGemPop('win')
    if (!cleared.current) {
      cleared.current = true
      onClear?.()
    }
    window.setTimeout(() => setWinStamp(true), reduced ? 40 : 280)
  }

  function landOn(cell: MazeCoord) {
    atRef.current = cell
    setAt(cell)
    const bag = collectHere(cell, gotRef.current, helpedRef.current)
    if (mazeSame(cell, MAZE_HURT) && !helpedRef.current && !canHelp(bag)) {
      flashToast('Get oil and cloth first.')
    } else if (mazeSame(cell, MAZE_INN) && !canWin(bag, helpedRef.current, cell)) {
      flashToast(mazeBlockedHint(cell, bag, helpedRef.current))
    }
    finishIfWon(cell, bag, helpedRef.current)
  }

  function walkPath(path: MazeCoord[]) {
    if (walking || wonRef.current) return
    const steps = path.slice(1)
    if (!steps.length) return
    window.clearTimeout(walkRef.current)
    setWalking(true)
    let i = 0
    const tick = () => {
      const next = steps[i]
      if (!next) {
        setWalking(false)
        return
      }
      landOn(next)
      i += 1
      if (i >= steps.length) {
        setWalking(false)
        return
      }
      walkRef.current = window.setTimeout(tick, reduced ? 30 : STEP_MS)
    }
    tick()
  }

  function tryGo(target: MazeCoord) {
    if (wonRef.current || walking) return
    if (!isFiniteCell(target)) return
    const here = atRef.current
    if (mazeSame(here, target)) return
    const path = shortestMazePath(here, target)
    if (!path) {
      blocked(mazeBlockedHint(target, gotRef.current, helpedRef.current))
      return
    }
    walkPath(path)
  }

  function onCellDown(event: ReactPointerEvent<HTMLButtonElement>, cell: MazeCoord) {
    event.preventDefault()
    event.stopPropagation()
    usedTap.current = true
    tryGo(cell)
  }

  function onBoardDown(event: ReactPointerEvent<HTMLDivElement>) {
    swipe.current = { x: event.clientX, y: event.clientY }
  }

  function onBoardUp(event: ReactPointerEvent<HTMLDivElement>) {
    const start = swipe.current
    swipe.current = null
    if (usedTap.current) {
      usedTap.current = false
      return
    }
    if (!start || walking || wonRef.current) return
    const dx = event.clientX - start.x
    const dy = event.clientY - start.y
    if (Math.abs(dx) < 24 && Math.abs(dy) < 24) return
    const step =
      Math.abs(dx) > Math.abs(dy)
        ? swipeStep(atRef.current, 0, dx)
        : swipeStep(atRef.current, dy, 0)
    if (!step) {
      blocked(ROAD_MAZE_HINT)
      return
    }
    walkPath([atRef.current, step])
  }

  function onBoardKey(event: ReactKeyboardEvent<HTMLDivElement>) {
    if (wonRef.current || walking) return
    const map: Record<string, MazeCoord | undefined> = {
      ArrowUp: swipeStep(atRef.current, -1, 0) ?? undefined,
      ArrowDown: swipeStep(atRef.current, 1, 0) ?? undefined,
      ArrowLeft: swipeStep(atRef.current, 0, -1) ?? undefined,
      ArrowRight: swipeStep(atRef.current, 0, 1) ?? undefined,
    }
    const step = map[event.key]
    if (!step) return
    event.preventDefault()
    walkPath([atRef.current, step])
  }

  const win = mazeWinBeat()

  return (
    <div
      className={`play is-road-maze ${shake ? 'is-shake' : ''} ${won ? 'is-win' : ''} ${helped ? 'is-helped' : ''}`}
      style={{ ['--maze-cols' as string]: MAZE_COLS, ['--maze-rows' as string]: MAZE_ROWS }}
    >
      <p className="sort-how">{EASY.mazeHunt}</p>
      <p className="story-kicker">
        {home.who} · {home.place}
      </p>
      <ol className="run-thumbs" aria-label="Story beats" style={{ ['--story-n' as string]: panels.length }}>
        {panels.map((panel, index) => {
          const open = index < opened
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
        {won ? ROAD_MAZE_CLAIM : (latest?.text ?? caption)}
      </p>
      <ul className="maze-kit" aria-label="Help to collect">
        {MAZE_ITEMS.map((item) => (
          <li key={item.id} className={`maze-kit-item is-${item.id} ${got.includes(item.id) ? 'is-got' : ''} ${kitPop === item.id ? 'is-pop' : ''}`}>
            <span className="maze-kit-icon" aria-hidden />
            <span>{item.label}</span>
          </li>
        ))}
      </ul>
      {toast ? (
        <p className={`match-toast gem-toast is-yes`} role="status">
          <strong>{toast}</strong>
          {toastWhy ? <span className="toast-why">{toastWhy}</span> : null}
        </p>
      ) : null}
      {plusFlash ? (
        <p className="bonus-plus" aria-hidden>
          {plusFlash}!
        </p>
      ) : null}
      {comboFlash > 1 ? (
        <p className="maze-combo" role="status">
          Combo ×{comboFlash}
        </p>
      ) : null}
      <div
        className="maze-board"
        role="grid"
        aria-label="Jericho road"
        tabIndex={0}
        onPointerDown={onBoardDown}
        onPointerUp={onBoardUp}
        onPointerCancel={() => {
          swipe.current = null
        }}
        onKeyDown={onBoardKey}
      >
        <WinBurst play={winStamp} stamp={ROAD_MAZE_WIN} />
        {Array.from({ length: MAZE_ROWS }, (_, r) =>
          Array.from({ length: MAZE_COLS }, (__, c) => {
            const cell = { r, c }
            const road = isRoadCell(cell)
            const here = mazeSame(at, cell)
            const hurt = mazeSame(cell, MAZE_HURT)
            const inn = mazeSame(cell, MAZE_INN)
            const item = mazeItemAt(cell)
            const taken = item ? got.includes(item.id) : false
            const glow = hintCell === mazeKey(cell)
            return (
              <button
                key={mazeKey(cell)}
                type="button"
                role="gridcell"
                disabled={won}
                data-maze-cell
                data-r={r}
                data-c={c}
                onPointerDown={(event) => {
                  if (!road) {
                    event.preventDefault()
                    blocked(ROAD_MAZE_HINT)
                    return
                  }
                  onCellDown(event, cell)
                }}
                className={`maze-cell ${road ? 'is-road' : 'is-rock'} ${here ? 'is-here' : ''} ${hurt ? 'is-hurt' : ''} ${inn ? 'is-inn' : ''} ${item && !taken ? `is-item is-${item.id}` : ''} ${glow ? 'is-hint' : ''} ${popAt === mazeKey(cell) ? 'is-pop' : ''}`}
              >
                {here ? (
                  <span className="maze-actor is-you">
                    <img src={panelHelp} alt="" draggable={false} />
                  </span>
                ) : null}
                {hurt && !here && !helped ? (
                  <span className="maze-actor is-hurt">
                    <img src={panelHurt} alt="" draggable={false} />
                  </span>
                ) : null}
                {helped && here ? <span className="maze-carry" aria-hidden /> : null}
                {inn ? <span className="maze-inn" aria-hidden /> : null}
                {item && !taken && !here ? <span className={`maze-drop is-${item.id}`} aria-hidden /> : null}
                {popAt === mazeKey(cell)
                  ? POP_SHARDS.map((i) => (
                      <i key={i} className="maze-shard" style={{ ['--i' as string]: i }} />
                    ))
                  : null}
                {popAt === mazeKey(cell)
                  ? GEM_BURST.slice(0, 4).map((i) => (
                      <b key={`p-${i}`} className="maze-burst" style={{ ['--i' as string]: i }} />
                    ))
                  : null}
              </button>
            )
          }),
        )}
        {won ? (
          <div className="maze-win-art" aria-hidden>
            <StoryPanelArt scene="neighbor" media={panels[panels.length - 1]?.media} />
          </div>
        ) : null}
      </div>
      <p className={`match-score ${plusFlash ? 'is-juice' : ''}`}>
        {score}
        {' · '}
        {got.length} / 3 help
        {helped ? ' · he is with you' : ''}
      </p>
      {won ? (
        <>
          <p className="match-yes" role="status">
            <strong>{win.title}</strong>
            <span>{win.why}</span>
          </p>
          <div className="cta-dock">
            <button
              type="button"
              className="btn primary xl snap-bins"
              onClick={() => onEasyStop?.('hold')}
            >
              {EASY.holdNext}
            </button>
            <button type="button" className="btn gold xl" data-maze-again onClick={replay}>
              {ROAD_MAZE_AGAIN}
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

function isRoadCell(cell: MazeCoord) {
  return isMazeRoad(cell)
}

function isFiniteCell(cell: MazeCoord) {
  return Number.isFinite(cell.r) && Number.isFinite(cell.c)
}
