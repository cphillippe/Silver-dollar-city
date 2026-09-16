import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { EASY, easyWhoWhere } from '../../lib/easy'
import {
  buildGemPuzzle,
  cellKey,
  cellsStillNeeded,
  gemHue,
  isStraightPath,
  matchBonusWord,
  matchGemWord,
  sameCell,
  snapFingerPath,
  tryAddToPath,
  type GemCoord,
} from '../../lib/gemSearch'
import { lineBonusPoints } from '../../lib/matchBonus'
import { gemBonusBeat, gemTargetBeat, matchClearBeat } from '../../lib/successBeat'
import { storyPanelsFor, type StoryPanel } from '../../lib/storyPanels'
import { GEM_BURST, playGemPop, prefersReducedMotion } from '../../lib/juice'
import { useProgress } from '../../store/progress'
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
  const { progress, recordMatchBonus, recordMatchMiss } = useProgress()
  const [round, setRound] = useState(() => Date.now())
  const puzzle = useMemo(() => buildGemPuzzle(lineId, round), [lineId, round])
  const panels = useMemo(
    () => beats ?? storyPanelsFor(lineId, puzzle.words.length),
    [beats, lineId, puzzle.words.length],
  )
  const [found, setFound] = useState<string[]>([])
  const [bonusFound, setBonusFound] = useState<string[]>([])
  const [bonusCleared, setBonusCleared] = useState<string[]>([])
  const [opened, setOpened] = useState(0)
  const [flipping, setFlipping] = useState<number | null>(null)
  const [path, setPath] = useState<GemCoord[]>([])
  const [burst, setBurst] = useState<string[]>([])
  const [hint, setHint] = useState<string[]>([])
  const [misses, setMisses] = useState(0)
  const [shake, setShake] = useState(false)
  const [toast, setToast] = useState('')
  const [toastWhy, setToastWhy] = useState('')
  const [toastBonus, setToastBonus] = useState(false)
  const [toastMiss, setToastMiss] = useState(false)
  const [plusFlash, setPlusFlash] = useState(false)
  const [comboFlash, setComboFlash] = useState(0)
  const [status, setStatus] = useState<'play' | 'ok'>('play')
  const [winStamp, setWinStamp] = useState(false)
  const drag = useRef(false)
  const moved = useRef(false)
  const pathRef = useRef<GemCoord[]>([])
  const rawRef = useRef<GemCoord[]>([])
  const foundRef = useRef<string[]>([])
  const bonusRef = useRef<string[]>([])
  const comboRef = useRef(0)
  const replayToast = useRef(false)
  const cleared = useRef(false)
  const home = easyWhoWhere(lineId)
  const needed = cellsStillNeeded(puzzle, found)
  const nextWord = puzzle.words.find((word) => !found.includes(word.id))
  const left = puzzle.words.length - found.length
  const bonusPts = lineBonusPoints(progress, lineId)
  const clearBeat = matchClearBeat(lineId)

  function writePath(next: GemCoord[] | ((current: GemCoord[]) => GemCoord[])) {
    setPath((current) => {
      const value = typeof next === 'function' ? next(current) : next
      pathRef.current = value
      return value
    })
  }

  function resetBoard(keepTaught: boolean) {
    foundRef.current = []
    bonusRef.current = []
    pathRef.current = []
    rawRef.current = []
    if (!keepTaught) cleared.current = false
    setFound([])
    setBonusFound([])
    setBonusCleared([])
    setPath([])
    setBurst([])
    setHint([])
    setMisses(0)
    setToast('')
    setToastWhy('')
    setToastBonus(false)
    setToastMiss(false)
    setPlusFlash(false)
    setComboFlash(0)
    comboRef.current = 0
    setStatus('play')
    setWinStamp(false)
    setOpened(0)
    setFlipping(null)
  }

  useEffect(() => {
    setRound(Date.now())
    resetBoard(false)
    // line change only — new Match deal, not the leftover extras
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lineId])

  useEffect(() => {
    if (round === 0) return
    resetBoard(true)
    if (replayToast.current) {
      replayToast.current = false
      flashToast('One more Match. Find the gems.')
    }
    // extra try / One more Match reshuffle
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round])

  function flashToast(line: string, why = '', bonus = false, miss = false) {
    setToast(line)
    setToastWhy(why)
    setToastBonus(bonus)
    setToastMiss(miss)
    window.setTimeout(
      () =>
        setToast((current) => {
          if (current !== line) return current
          setToastWhy('')
          setToastBonus(false)
          setToastMiss(false)
          return ''
        }),
      bonus || miss ? 2800 : 1800,
    )
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
    const beat = gemTargetBeat(
      puzzle.words.find((word) => word.label === wordLabel) ?? {
        id: wordLabel,
        text: wordLabel.toUpperCase(),
        label: wordLabel,
        kind: 'idea',
      },
    )
    flashToast(beat.title, beat.why)
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

  function explodeBonus(cells: GemCoord[], label: string) {
    const need = cellsStillNeeded(puzzle, foundRef.current)
    const pop = cells.filter((cell) => !need.has(cellKey(cell)))
    const keys = pop.map(cellKey)
    setBurst(keys)
    setBonusCleared((current) => [...current, ...keys])
    playGemPop('bonus')
    setPlusFlash(true)
    window.setTimeout(() => setPlusFlash(false), 900)
    const beat = gemBonusBeat(label)
    flashToast(beat.title, beat.why, true)
    window.setTimeout(() => setBurst([]), 640)
  }

  function teachHint(count: number) {
    if (!nextWord) return
    const trail = puzzle.paths[nextWord.id] ?? []
    if (count >= 4 && trail.length) {
      setHint(trail.map(cellKey))
      return
    }
    if (count >= 2) {
      const first = trail[0]
      setHint(first ? [cellKey(first)] : [])
    }
  }

  function finishBoard() {
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
      comboRef.current += 1
      if (comboRef.current >= 2) {
        setComboFlash(comboRef.current)
        window.setTimeout(() => setComboFlash(0), 700)
      }
      explode(nextPath, hit.label, done, nextFound.length)
      if (done) finishBoard()
      return true
    }
    const extra = matchBonusWord(nextPath, puzzle, bonusRef.current)
    if (extra) {
      const nextBonus = [...bonusRef.current, extra.id]
      bonusRef.current = nextBonus
      setBonusFound(nextBonus)
      writePath([])
      setMisses(0)
      comboRef.current += 1
      if (comboRef.current >= 2) {
        setComboFlash(comboRef.current)
        window.setTimeout(() => setComboFlash(0), 700)
      }
      recordMatchBonus(lineId)
      explodeBonus(nextPath, extra.label)
      return true
    }
    return false
  }

  function missIfSwipe(nextPath: GemCoord[]) {
    const line = snapFingerPath(nextPath, puzzle.size)
    writePath(line)
    if (submit(line)) return
    if (line.length < 2) {
      writePath([])
      return
    }
    setShake(true)
    playGemPop('miss')
    comboRef.current = 0
    const count = misses + 1
    setMisses(count)
    onMiss()
    const straight = isStraightPath(line)
    const why = !straight || line.length < 3 ? EASY.bonusMissStraight : EASY.bonusMissWord
    recordMatchMiss(lineId)
    if (count >= 2 && nextWord) {
      flashToast(EASY.missPenalty, `Try this word: ${nextWord.label}.`, false, true)
    } else {
      flashToast(EASY.missPenalty, why, false, true)
    }
    teachHint(count)
    window.setTimeout(() => {
      setShake(false)
      writePath([])
    }, 420)
  }

  function applyCell(cell: GemCoord, mode: 'tap' | 'drag') {
    if (status === 'ok') return
    if (mode === 'drag') {
      const raw = rawRef.current
      const last = raw[raw.length - 1]
      if (!last) rawRef.current = [cell]
      else if (!sameCell(last, cell)) rawRef.current = [...raw, cell]
      const line = snapFingerPath(rawRef.current, puzzle.size)
      writePath(line)
      submit(line)
      return
    }
    const current = pathRef.current
    let next = current
    if (!current.length) {
      next = [cell]
    } else if (sameCell(current[current.length - 1]!, cell)) {
      next = current
    } else {
      const trial = tryAddToPath(current, cell, puzzle.size)
      if (trial.length > current.length) next = trial
      else next = [cell]
    }
    rawRef.current = next
    const line = snapFingerPath(next, puzzle.size)
    writePath(line)
    submit(line)
  }

  function onCellDown(event: ReactPointerEvent<HTMLDivElement>, cell: GemCoord) {
    if (status === 'ok') return
    event.preventDefault()
    event.stopPropagation()
    drag.current = true
    moved.current = false
    setShake(false)
    rawRef.current = [cell]
    applyCell(cell, 'tap')
  }

  function onBoardMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (!drag.current || status === 'ok') return
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
    const nextPath = rawRef.current.length ? rawRef.current : pathRef.current
    if (!nextPath.length) return
    if (moved.current || nextPath.length >= 3) {
      missIfSwipe(nextPath)
    }
  }

  function replay() {
    replayToast.current = true
    setRound((current) => current + 1)
  }

  const selected = new Set(path.map(cellKey))

  return (
    <div
      className={`play is-gem-search is-panel-blast ${shake ? 'is-shake' : ''} ${status === 'ok' ? 'is-win' : ''} ${burst.length ? 'is-boom' : ''} ${plusFlash ? 'is-bonus-pop' : ''}`}
      style={{ ['--gem-size' as string]: puzzle.size }}
      onPointerUp={onBoardUp}
      onPointerCancel={onBoardUp}
    >
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
      {status === 'play' ? (
        <p className="gem-bonus-hint is-loud">{EASY.bonusHint}</p>
      ) : null}
      {puzzle.planted.length ? (
        <ul className="gem-words is-bonus" aria-label="Bonus words">
          {puzzle.planted.map((word) => (
            <li
              key={word.id}
              className={`gem-word is-bonus ${bonusFound.includes(word.id) ? 'is-found' : ''}`}
            >
              <span className="gem-word-label">{word.label}</span>
              <span className="gem-word-kind">bonus</span>
            </li>
          ))}
        </ul>
      ) : null}
      {plusFlash ? (
        <p className="bonus-plus" aria-hidden>
          +100
        </p>
      ) : null}
      {comboFlash > 1 ? (
        <p className="gem-combo" role="status">
          Combo ×{comboFlash}
        </p>
      ) : null}
      <div className="gem-stage">
      {toastBonus && toast ? (
        <p className="bonus-banner" role="status">
          <strong>{toast}</strong>
          {toastWhy ? <span>{toastWhy}</span> : null}
        </p>
      ) : toastMiss && toast ? (
        <p className="miss-banner" role="status">
          <strong>{toast}</strong>
          {toastWhy ? <span>{toastWhy}</span> : null}
        </p>
      ) : toast ? (
        <p className="match-toast gem-toast is-yes" role="status">
          <strong>{toast}</strong>
          {toastWhy ? <span className="toast-why">{toastWhy}</span> : null}
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
        <WinBurst play={winStamp} stamp={EASY.matchWin} />
        {puzzle.letters.flatMap((row, r) =>
          row.map((letter, c) => {
            const key = `${r}:${c}`
            const popping = burst.includes(key)
            const kept = needed.has(key)
            const targetClear = !kept && puzzle.words.some((word) => {
              if (!found.includes(word.id)) return false
              return (puzzle.paths[word.id] ?? []).some((cell) => cell.r === r && cell.c === c)
            })
            const bonusClear = !kept && bonusCleared.includes(key)
            const cellClear = targetClear || bonusClear
            return (
              <div
                key={key}
                role="gridcell"
                data-gem-cell
                data-r={r}
                data-c={c}
                onPointerDown={(event) => onCellDown(event, { r, c })}
                className={`gem-cell hue-${gemHue(letter, r, c)} ${selected.has(key) ? 'is-sel' : ''} ${popping ? 'is-burst' : ''} ${cellClear ? 'is-clear' : ''} ${kept && found.length > 0 && !selected.has(key) ? 'is-live' : ''} ${hint.includes(key) ? 'is-hint' : ''} ${popping && bonusClear ? 'is-bonus-burst' : ''}`}
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
      </div>
      <p className={`match-score ${plusFlash || comboFlash > 1 ? 'is-juice' : ''}`}>
        {left} left · {found.length} / {puzzle.words.length} found
        {bonusFound.length ? ` · ${bonusFound.length} bonus` : ''}
        {bonusPts ? <span className="bonus-pts"> · +{bonusPts} bonus</span> : null}
      </p>
      {status === 'ok' ? (
        <>
          <p className="match-yes" role="status">
            <strong>{clearBeat.title}</strong>
            <span>{clearBeat.why}</span>
          </p>
          <div className="cta-dock">
            <button
              type="button"
              className="btn primary xl snap-bins"
              onClick={() => onEasyStop?.('hold')}
            >
              {EASY.holdNext}
            </button>
            <button
              type="button"
              className="btn gold xl more-match"
              data-match-again
              onClick={replay}
            >
              {EASY.moreMatch}
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
