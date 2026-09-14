import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { EASY } from '../../lib/easy'
import {
  buildGemPuzzle,
  cellKey,
  cellsStillNeeded,
  gemHue,
  matchGemWord,
  tryAddToPath,
  type GemCoord,
} from '../../lib/gemSearch'
import { GEM_BURST, playGemPop } from '../../lib/juice'
import { WinBurst } from './WinBurst'

interface GemSearchPlayProps {
  lineId: string
  onMiss: () => void
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

export function GemSearchPlay({ lineId, onMiss, onEasyStop }: GemSearchPlayProps) {
  const puzzle = useMemo(() => buildGemPuzzle(lineId), [lineId])
  const [found, setFound] = useState<string[]>([])
  const [path, setPath] = useState<GemCoord[]>([])
  const [burst, setBurst] = useState<string[]>([])
  const [hint, setHint] = useState<string[]>([])
  const [misses, setMisses] = useState(0)
  const [shake, setShake] = useState(false)
  const [toast, setToast] = useState('')
  const [status, setStatus] = useState<'play' | 'ok'>('play')
  const drag = useRef(false)
  const pathRef = useRef<GemCoord[]>([])
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
    pathRef.current = []
    setPath([])
    setBurst([])
    setHint([])
    setMisses(0)
    setToast('')
    setStatus('play')
  }, [lineId])

  function flashToast(line: string) {
    setToast(line)
    window.setTimeout(() => setToast((current) => (current === line ? '' : current)), 1600)
  }

  function explode(cells: GemCoord[], wordLabel: string, done: boolean) {
    const keys = cells.map(cellKey)
    setBurst(keys)
    playGemPop(done ? 'win' : 'find')
    flashToast(`${wordLabel}!`)
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
    const hit = matchGemWord(nextPath, puzzle, found)
    if (hit) {
      const nextFound = [...found, hit.id]
      const done = nextFound.length === puzzle.words.length
      setFound(nextFound)
      writePath([])
      setHint([])
      setMisses(0)
      explode(nextPath, hit.label, done)
      if (done) {
        setStatus('ok')
      }
      return
    }
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

  function onDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (status === 'ok') return
    const cell = cellFromPoint(event.clientX, event.clientY)
    if (!cell) return
    drag.current = true
    event.currentTarget.setPointerCapture(event.pointerId)
    writePath([cell])
    setShake(false)
  }

  function onMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (!drag.current || status === 'ok') return
    const cell = cellFromPoint(event.clientX, event.clientY)
    if (!cell) return
    writePath((current) => tryAddToPath(current, cell))
  }

  function onUp() {
    if (!drag.current) return
    drag.current = false
    submit(pathRef.current)
  }

  const selected = new Set(path.map(cellKey))

  return (
    <div
      className={`play is-gem-search ${shake ? 'is-shake' : ''} ${status === 'ok' ? 'is-win' : ''} ${burst.length ? 'is-boom' : ''}`}
      style={{ ['--gem-size' as string]: puzzle.size }}
    >
      <WinBurst play={status === 'ok'} stamp={EASY.matchWin} />
      <p className="sort-how">{EASY.matchHunt}</p>
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
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
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
