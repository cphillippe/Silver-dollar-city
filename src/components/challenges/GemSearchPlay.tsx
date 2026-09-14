import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { EASY, easyWhoWhere } from '../../lib/easy'
import {
  buildGemPuzzle,
  cellKey,
  cellsStillNeeded,
  gemHue,
  matchGemWord,
  sameCell,
  tryAddToPath,
  type GemCoord,
} from '../../lib/gemSearch'
import { storyPanelsFor, type StoryPanel } from '../../lib/storyPanels'
import { GEM_BURST, playGemPop, prefersReducedMotion } from '../../lib/juice'
import { StoryStrip } from '../StoryStrip'
import { WinBurst } from './WinBurst'

interface GemSearchPlayProps {
  lineId: string
  beats?: StoryPanel[]
  onMiss: () => void
  onClear?: () => void
  onEasyStop?: (dest: 'hold' | 'home') => void
}

const SHARDS = [0, 1, 2, 3, 4, 5, 6, 7]

function cellFromPoint(x: number, y: number): GemCoord | null {
  const hit = document.elementFromPoint(x, y)
  const node = hit instanceof Element ? hit.closest('[data-gem-cell]') : null
  if (!(node instanceof HTMLElement)) return null
  if (node.classList.contains('is-clear')) return null
  const r = Number(node.dataset.r)
  const c = Number(node.dataset.c)
  if (!Number.isFinite(r) || !Number.isFinite(c)) return null
  return { r, c }
}

export function GemSearchPlay({ lineId, beats, onMiss, onClear, onEasyStop }: GemSearchPlayProps) {
  const puzzle = useMemo(() => buildGemPuzzle(lineId), [lineId])
  const panels = useMemo(
    () => beats ?? storyPanelsFor(lineId, puzzle.words.length),
    [beats, lineId, puzzle.words.length],
  )
  const [found, setFound] = useState<string[]>([])
  const [opened, setOpened] = useState(0)
  const [flipping, setFlipping] = useState<number | null>(null)
  const [path, setPath] = useState<GemCoord[]>([])
  const [burst, setBurst] = useState<string[]>([])
  const [hint, setHint] = useState<string[]>([])
  const [misses, setMisses] = useState(0)
  const [shake, setShake] = useState(false)
  const [toast, setToast] = useState('')
  const [status, setStatus] = useState<'play' | 'ok'>('play')
  const [winStamp, setWinStamp] = useState(false)
  const drag = useRef(false)
  const moved = useRef(false)
  const pathRef = useRef<GemCoord[]>([])
  const foundRef = useRef<string[]>([])
  const cleared = useRef(false)
  const home = easyWhoWhere(lineId)
  const needed = cellsStillNeeded(puzzle, found)
  const nextWord = puzzle.words.find((word) => !found.includes(word.id))
  const left = puzzle.words.length - found.length

  function writePath(next: GemCoord[] | ((current: GemCoord[]) => GemCoord[])) {
    setPath((current) => {
      const value = typeof next === 'function' ? next(current) : next
      pathRef.current = value
      return value
    })
  }

  useEffect(() => {
    setFound([])
    foundRef.current = []
    pathRef.current = []
    cleared.current = false
    setPath([])
    setBurst([])
    setHint([])
    setMisses(0)
    setToast('')
    setStatus('play')
    setWinStamp(false)
    setOpened(0)
    setFlipping(null)
  }, [lineId])

  function flashToast(line: string) {
    setToast(line)
    window.setTimeout(() => setToast((current) => (current === line ? '' : current)), 1600)
  }

  function revealPanel(count: number) {
    const index = count - 1
    const delay = prefersReducedMotion() ? 0 : 180
    window.setTimeout(() => {
      setOpened(count)
      setFlipping(index)
      window.setTimeout(() => setFlipping((current) => (current === index ? null : current)), 520)
    }, delay)
  }

  function explode(cells: GemCoord[], wordLabel: string, done: boolean, foundCount: number) {
    const keys = cells.map(cellKey)
    setBurst(keys)
    playGemPop(done ? 'win' : 'find')
    flashToast(`${wordLabel}!`)
    revealPanel(foundCount)
    if (done) {
      window.setTimeout(() => {
        const rest: string[] = []
        puzzle.letters.forEach((row, r) => {
          row.forEach((_, c) => {
            const key = `${r}:${c}`
            if (!keys.includes(key)) rest.push(key)
          })
        })
        setBurst([...keys, ...rest])
      }, 160)
    }
    window.setTimeout(() => setBurst([]), done ? 880 : 520)
  }

  function teachHint(count: number) {
    if (!nextWord) return
    const trail = puzzle.paths[nextWord.id] ?? []
    if (count >= 4 && trail.length) {
      setHint(trail.map(cellKey))
      flashToast(`Try this word: ${nextWord.label}.`)
      return
    }
    if (count >= 2) {
      const first = trail[0]
      setHint(first ? [cellKey(first)] : [])
      flashToast(`Try this word: ${nextWord.label}.`)
    }
  }

  function submit(nextPath: GemCoord[]) {
    const hit = matchGemWord(nextPath, puzzle, foundRef.current)
    if (hit) {
      const nextFound = [...foundRef.current, hit.id]
      foundRef.current = nextFound
      const done = nextFound.length === puzzle.words.length
      setFound(nextFound)
      writePath([])
      setHint([])
      setMisses(0)
      explode(nextPath, hit.label, done, nextFound.length)
      if (done) {
        if (!cleared.current) {
          cleared.current = true
          onClear?.()
        }
        const stampAt = prefersReducedMotion() ? 80 : 880
        window.setTimeout(() => {
          setWinStamp(true)
          setStatus('ok')
        }, stampAt)
      }
      return true
    }
    return false
  }

  function missIfSwipe(nextPath: GemCoord[]) {
    if (submit(nextPath)) return
    if (nextPath.length < 3) {
      writePath([])
      return
    }
    setShake(true)
    playGemPop('miss')
    const count = misses + 1
    setMisses(count)
    onMiss()
    teachHint(count)
    window.setTimeout(() => {
      setShake(false)
      writePath([])
    }, 420)
  }

  function applyCell(cell: GemCoord, mode: 'tap' | 'drag') {
    if (status === 'ok' || cleared.current) return
    const current = pathRef.current
    let next = current
    if (!current.length) {
      next = [cell]
    } else if (sameCell(current[current.length - 1]!, cell)) {
      next = current
    } else {
      const trial = tryAddToPath(current, cell)
      if (trial.length > current.length) next = trial
      else if (mode === 'tap') next = [cell]
    }
    writePath(next)
    submit(next)
  }

  function onCellDown(event: ReactPointerEvent<HTMLDivElement>, cell: GemCoord) {
    if (status === 'ok' || cleared.current) return
    event.preventDefault()
    event.stopPropagation()
    drag.current = true
    moved.current = false
    setShake(false)
    applyCell(cell, 'tap')
  }

  function onBoardMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (!drag.current || status === 'ok' || cleared.current) return
    const cell = cellFromPoint(event.clientX, event.clientY)
    if (!cell) return
    const last = pathRef.current[pathRef.current.length - 1]
    if (last && sameCell(last, cell)) return
    moved.current = true
    applyCell(cell, 'drag')
  }

  function onBoardUp() {
    if (!drag.current) return
    drag.current = false
    if (moved.current && !matchGemWord(pathRef.current, puzzle, foundRef.current)) {
      missIfSwipe(pathRef.current)
    }
  }

  const selected = new Set(path.map(cellKey))

  return (
    <div
      className={`play is-gem-search is-panel-blast ${shake ? 'is-shake' : ''} ${status === 'ok' ? 'is-win' : ''} ${burst.length ? 'is-boom' : ''}`}
      style={{ ['--gem-size' as string]: puzzle.size }}
      onPointerUp={onBoardUp}
      onPointerCancel={onBoardUp}
    >
      <WinBurst play={winStamp} stamp={EASY.matchWin} />
      <p className="sort-how">{EASY.matchHunt}</p>
      <StoryStrip
        kicker={`${home.who} · ${home.place}`}
        panels={panels}
        opened={opened}
        flipping={flipping}
        complete={status === 'ok'}
      />
      <ul className="gem-words" aria-label="Words to find">
        {puzzle.words.map((word) => (
          <li
            key={word.id}
            className={`gem-word is-${word.kind} ${found.includes(word.id) ? 'is-found' : ''} ${nextWord?.id === word.id && misses >= 2 ? 'is-hint' : ''}`}
          >
            <span className="gem-word-label">{word.label}</span>
            <span className="gem-word-kind">
              {word.kind === 'person' ? 'person' : word.kind === 'place' ? 'place' : 'idea'}
            </span>
          </li>
        ))}
      </ul>
      {toast ? (
        <p className="match-toast gem-toast" role="status">
          <strong>{toast}</strong>
        </p>
      ) : null}
      <div
        className="gem-board"
        role="grid"
        aria-label="Letter gems"
        onPointerMove={onBoardMove}
        onPointerUp={onBoardUp}
        onPointerCancel={onBoardUp}
      >
        {puzzle.letters.flatMap((row, r) =>
          row.map((letter, c) => {
            const key = `${r}:${c}`
            const popping = burst.includes(key)
            const kept = needed.has(key)
            const cleared = !kept && puzzle.words.some((word) => {
              if (!found.includes(word.id)) return false
              return (puzzle.paths[word.id] ?? []).some((cell) => cell.r === r && cell.c === c)
            })
            return (
              <div
                key={key}
                role="gridcell"
                data-gem-cell
                data-r={r}
                data-c={c}
                onPointerDown={(event) => onCellDown(event, { r, c })}
                className={`gem-cell hue-${gemHue(letter, r, c)} ${selected.has(key) ? 'is-sel' : ''} ${popping ? 'is-burst' : ''} ${cleared ? 'is-clear' : ''} ${kept && found.length > 0 && !selected.has(key) ? 'is-live' : ''} ${hint.includes(key) ? 'is-hint' : ''}`}
              >
                <span className="gem-letter">{letter}</span>
                {popping
                  ? SHARDS.map((i) => (
                      <span
                        key={i}
                        className="gem-shard"
                        style={{ ['--i' as string]: i }}
                      />
                    ))
                  : null}
                {popping
                  ? GEM_BURST.slice(0, 4).map((i) => (
                      <span
                        key={`p-${i}`}
                        className="gem-pop"
                        style={{ ['--i' as string]: i }}
                      />
                    ))
                  : null}
              </div>
            )
          }),
        )}
      </div>
      <p className="match-score">
        {left} left · {found.length} / {puzzle.words.length} found
      </p>
      {status === 'ok' ? (
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
      ) : null}
    </div>
  )
}
