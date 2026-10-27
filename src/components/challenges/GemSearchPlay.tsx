import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { goldButtonClass } from '../../content/goldenPath'
import { EASY, easyWhoWhere, isEasy } from '../../lib/easy'
import {
  buildGemPuzzle,
  cellKey,
  cellsNeededByOpenPlanted,
  cellsStillNeeded,
  bonusPointsFor,
  gemHue,
  isStoryWord,
  isStoryWordPrefix,
  isStraightPath,
  matchBonusWord,
  matchGemWord,
  sameCell,
  shouldMissAfterSwipe,
  snapFingerPath,
  tryAddToPath,
  type GemCoord,
} from '../../lib/gemSearch'
import { MATCH_DOCK_JUICE_POINTS } from '../../lib/matchBonus'
import { skillBonusPoints, skillsFor } from '../../lib/gemJar'
import { gemBonusBeat, matchClearBeat } from '../../lib/successBeat'
import { MatchTakeaway } from '../HeldTriad'
import { storyPanelsFor, type StoryPanel } from '../../lib/storyPanels'
import { GEM_BURST, playGemPop, prefersReducedMotion } from '../../lib/juice'
import { useProgress } from '../../store/progress'
import { matchChipsFor, matchChipRoleLabel } from '../../lib/gemSearch'
import { lociStampFor } from '../../lib/lociStamp'
import { LociStamp } from '../LociStamp'
import { StoryStrip } from '../StoryStrip'
import { WinBurst } from './WinBurst'
import { GemJarCard, JAR_CARD_H } from './GemJarCard'

interface GemSearchPlayProps {
  lineId: string
  beats?: StoryPanel[]
  onMiss: () => void
  onClear?: () => void
  onEasyStop?: (dest: 'hold' | 'home') => void
}

const SHARDS = [0, 1, 2, 3, 4, 5, 6, 7]

/** `?gemSeed=N` pins the deal for tests. Dev server only; production always deals fresh. */
function dealRound(): number {
  if (import.meta.env.DEV && typeof window !== 'undefined') {
    const raw = new URLSearchParams(window.location.search).get('gemSeed')
    const seed = raw == null ? NaN : Number(raw)
    if (Number.isInteger(seed) && seed >= 0) return seed
  }
  return Date.now()
}

function cellFromPoint(x: number, y: number): GemCoord | null {
  // Pointer capture keeps the gesture alive, but an expanded dock/overlay can still
  // be above the board in hit-testing. Search every painted layer for the gem cell.
  const nodes = document.elementsFromPoint(x, y)
  const node = nodes.find((candidate) => candidate instanceof HTMLElement && candidate.matches('[data-gem-cell]'))
  if (!(node instanceof HTMLElement)) return null
  if (node.classList.contains('is-clear')) return null
  const r = Number(node.dataset.r)
  const c = Number(node.dataset.c)
  if (!Number.isFinite(r) || !Number.isFinite(c)) return null
  return { r, c }
}

export function GemSearchPlay({ lineId, beats, onMiss, onClear, onEasyStop }: GemSearchPlayProps) {
  const { progress, recordMatchBonus, recordMatchDockJuice, recordMatchFind, recordMatchMiss, markJarSeen } =
    useProgress()
  const easy = isEasy(progress)
  const [round, setRound] = useState(dealRound)
  const puzzle = useMemo(() => buildGemPuzzle(lineId, round), [lineId, round])
  const panels = useMemo(
    () => beats ?? storyPanelsFor(lineId, puzzle.words.length),
    [beats, lineId, puzzle.words.length],
  )
  const [found, setFound] = useState<string[]>([])
  const [bonusFound, setBonusFound] = useState<string[]>([])
  const [bonusCleared, setBonusCleared] = useState<string[]>([])
  const [bonusGhosted, setBonusGhosted] = useState<string[]>([])
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
  const [findPop, setFindPop] = useState(0)
  const [lastAward, setLastAward] = useState(0)
  const [bonusPts, setBonusPts] = useState(0)
  const [storyFound, setStoryFound] = useState(0)
  const lifetimeNow = progress.matchLifetime ?? 0
  const lifetimeRef = useRef(lifetimeNow)
  lifetimeRef.current = lifetimeNow
  const [jarBefore, setJarBefore] = useState(lifetimeNow)
  const [sightKeys, setSightKeys] = useState<string[]>([])
  const boardPts = useRef(0)
  const jarSkills = useMemo(() => (easy ? skillsFor(jarBefore) : []), [easy, jarBefore])
  const [status, setStatus] = useState<'play' | 'ok'>('play')
  const [winStamp, setWinStamp] = useState(false)
  const [stripMode, setStripMode] = useState<'hero' | 'dock' | 'sheet'>('dock')
  const [dockJuice, setDockJuice] = useState<number | null>(null)
  const drag = useRef(false)
  const dragPointerId = useRef<number | null>(null)
  const moved = useRef(false)
  const pathRef = useRef<GemCoord[]>([])
  const rawRef = useRef<GemCoord[]>([])
  const foundRef = useRef<string[]>([])
  const bonusRef = useRef<string[]>([])
  const comboRef = useRef(0)
  const replayToast = useRef(false)
  const cleared = useRef(false)
  const scoredThisGesture = useRef(false)
  const dockJuiced = useRef(false)
  const boardPointer = useRef<HTMLElement | null>(null)
  const gemScrollRef = useRef<HTMLDivElement>(null)
  const stripRef = useRef(stripMode)
  const findUntil = useRef(0)
  stripRef.current = stripMode
  const home = easyWhoWhere(lineId)
  const matchChips = matchChipsFor(lineId)
  const lociStamp = lociStampFor(lineId)
  const sameFace = lineId === 'fg-reason' || lineId === 'fg-ought'
  const sayLine = sameFace ? lociStamp.ideaShort : (matchChips?.say ?? '')
  const needed = cellsStillNeeded(puzzle, found)
  const nextWord = puzzle.words.find((word) => !found.includes(word.id))
  const left = puzzle.words.length - found.length
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
    scoredThisGesture.current = false
    if (!keepTaught) cleared.current = false
    setFound([])
    setBonusFound([])
    setBonusCleared([])
    setBonusGhosted([])
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
    setFindPop(0)
    setLastAward(0)
    setBonusPts(0)
    setStoryFound(0)
    setSightKeys([])
    setJarBefore(lifetimeRef.current)
    boardPts.current = 0
    comboRef.current = 0
    setStatus('play')
    setWinStamp(false)
    setOpened(0)
    setFlipping(null)
    setStripMode('dock')
    setDockJuice(null)
    dockJuiced.current = false
  }

  useEffect(() => {
    setRound(dealRound())
    resetBoard(false)
    // line change only — new Match deal, not the leftover extras
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lineId])

  useEffect(() => {
    if (status !== 'ok' || !easy) return
    const scrollWinIntoView = () => {
      window.scrollTo(0, 0)
      const page = document.querySelector('.challenge-page.is-puzzle')
      if (page instanceof HTMLElement) page.scrollTop = 0
      gemScrollRef.current?.scrollTo(0, 0)
    }
    scrollWinIntoView()
    const id = window.requestAnimationFrame(scrollWinIntoView)
    return () => window.cancelAnimationFrame(id)
  }, [status, easy])

  useEffect(() => {
    if (round === 0) return
    resetBoard(true)
    if (replayToast.current) {
      replayToast.current = false
      flashToast('One more Match. Find the words.')
    }
    // extra try / One more Match reshuffle
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round])

  // Bonus Sight: once per board, shortly after the deal, one unfound planted word shimmers.
  useEffect(() => {
    if (!jarSkills.includes('sight')) return
    let clearId = 0
    const startId = window.setTimeout(() => {
      const open = puzzle.planted.filter((word) => !bonusRef.current.includes(word.id))
      const story = open.filter((word) => puzzle.lessonPlanted.includes(word.text))
      const pool = story.length ? story : open
      const pick = pool[Math.floor(Math.random() * pool.length)]
      if (!pick) return
      setSightKeys((puzzle.bonusPaths[pick.id] ?? []).map(cellKey))
      clearId = window.setTimeout(() => setSightKeys([]), 1600)
    }, 600)
    return () => {
      window.clearTimeout(startId)
      window.clearTimeout(clearId)
    }
  }, [puzzle, jarSkills])

  // Art flash 1.4.101: first unlock may enter hero briefly; auto-dock within ≤1.2s.
  // First paint stays docked (board-first). Hero is only the brief big→tiny intro.
  useEffect(() => {
    if (stripMode !== 'hero') return
    const ms = prefersReducedMotion() ? 0 : 1200
    const t = window.setTimeout(() => {
      setStripMode((current) => (current === 'hero' ? 'dock' : current))
    }, ms)
    return () => window.clearTimeout(t)
  }, [stripMode, lineId, round])

  function flashToast(line: string, why = '', bonus = false, miss = false) {
    setToast(line)
    setToastWhy(why)
    setToastBonus(bonus)
    setToastMiss(miss)
    // Miss −25 stays tight (no long soft lines). Bonus SNAG stays punchy. Find gets a beat longer.
    const holdMs = miss ? 1100 : bonus ? 2200 : 2000
    window.setTimeout(
      () =>
        setToast((current) => {
          if (current !== line) return current
          setToastWhy('')
          setToastBonus(false)
          setToastMiss(false)
          return ''
        }),
      holdMs,
    )
  }

  function endDrag(keepPath = false) {
    const node = boardPointer.current
    const pointerId = dragPointerId.current
    if (node && pointerId != null && node.hasPointerCapture?.(pointerId)) {
      node.releasePointerCapture(pointerId)
    }
    boardPointer.current = null
    drag.current = false
    dragPointerId.current = null
    if (keepPath) return
    rawRef.current = []
    writePath([])
  }

  function closeSheet() {
    // Dismiss owns this gesture. Drop any latched drag so the next finger can swipe.
    endDrag()
    setStripMode('dock')
  }

  function collapseStoryDock() {
    setStripMode((current) => (current === 'sheet' ? current : 'dock'))
    if (dockJuiced.current) return
    dockJuiced.current = true
    // Start +1000 only after the find pop has finished — one punch, not a twin flash.
    const delay = Math.max(0, findUntil.current - Date.now())
    window.setTimeout(() => {
      recordMatchDockJuice(lineId)
      boardPts.current += MATCH_DOCK_JUICE_POINTS
      setDockJuice(MATCH_DOCK_JUICE_POINTS)
      playGemPop('bonus')
      window.setTimeout(() => setDockJuice(null), prefersReducedMotion() ? 400 : 1200)
    }, delay)
  }

  function revealPanel(count: number) {
    const index = count - 1
    const delay = prefersReducedMotion() ? 0 : 180
    window.setTimeout(() => {
      setOpened(count)
      setFlipping(index)
      // Teach-chip Match stays docked so the board keeps the swipe plane.
      // Fixes #443: that dock rule covers every Match line. First find never
      // swaps the strip to hero — hero was an in-flow reflow that moved the grid.
      // Juice stays on the found trail, the score, and the dock.
      const heroFlash = count === 1 && !matchChips
      if (heroFlash) setStripMode('dock')
      window.setTimeout(() => {
        setFlipping((current) => (current === index ? null : current))
        if (count === 1) collapseStoryDock()
      }, prefersReducedMotion() ? 0 : 40)
    }, delay)
  }

  function explode(cells: GemCoord[], done: boolean, foundCount: number) {
    const keys = cells.map(cellKey)
    setBurst(keys)
    playGemPop(done ? 'win' : 'find')
    // Stronger find juice: large +N score pop (letter count as local stamp).
    const popPts = Math.max(25, cells.length * 10)
    const popMs = done ? 1200 : 980
    setFindPop(popPts)
    setLastAward(popPts)
    findUntil.current = prefersReducedMotion() ? Date.now() : Date.now() + popMs
    // Persist find juice to account matchBonus (Journal / profile total) — not toast-only.
    // One visual punch: the +N pop and the cell burst. No second "Yes" toast on this beat.
    recordMatchFind(lineId, popPts)
    boardPts.current += popPts
    window.setTimeout(() => setFindPop(0), popMs)
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
    // Longer burst stamp on required finds (keep explode).
    window.setTimeout(() => setBurst([]), done ? 980 : 720)
  }

  function explodeBonus(cells: GemCoord[], label: string, story: boolean, pts: number) {
    // Never delete letters still needed for lesson chips OR remaining planted bonuses.
    // Exclusive bonus cells clear; shared cells ghost/crack and stay playable.
    const needLesson = cellsStillNeeded(puzzle, foundRef.current)
    const needPlanted = cellsNeededByOpenPlanted(puzzle, bonusRef.current)
    const keep = new Set<string>([...needLesson, ...needPlanted])
    const clearKeys: string[] = []
    const ghostKeys: string[] = []
    for (const cell of cells) {
      const key = cellKey(cell)
      if (keep.has(key)) ghostKeys.push(key)
      else clearKeys.push(key)
    }
    if (clearKeys.length) {
      setBonusCleared((current) => [...current, ...clearKeys])
    }
    if (ghostKeys.length) {
      setBonusGhosted((current) => [...current, ...ghostKeys.filter((k) => !current.includes(k))])
    }
    const beat = gemBonusBeat(label, story, pts)
    // If a find pop is still on screen, wait so BONUS! is its own punch.
    const wait = Math.max(0, findUntil.current - Date.now())
    window.setTimeout(() => {
      setBurst([...clearKeys, ...ghostKeys])
      playGemPop('bonus')
      if (story) {
        flashToast(beat.title, beat.why)
      } else {
        setPlusFlash(true)
        window.setTimeout(() => setPlusFlash(false), 700)
        flashToast(beat.title, '', true)
      }
      window.setTimeout(() => setBurst([]), 640)
    }, wait)
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

  function submit(nextPath: GemCoord[], building = false) {
    const hit = matchGemWord(nextPath, puzzle, foundRef.current)
    if (hit) {
      const nextFound = [...foundRef.current, hit.id]
      foundRef.current = nextFound
      const done = nextFound.length === puzzle.words.length
      setFound(nextFound)
      scoredThisGesture.current = true
      writePath([])
      rawRef.current = []
      setHint([])
      setMisses(0)
      comboRef.current += 1
      if (comboRef.current >= 2) {
        setComboFlash(comboRef.current)
        window.setTimeout(() => setComboFlash(0), 1100)
      }
      explode(nextPath, done, nextFound.length)
      if (done) finishBoard()
      return true
    }
    if (building && isStoryWordPrefix(nextPath, puzzle, bonusRef.current)) return false
    if (puzzle.words.some((word) => {
      if (foundRef.current.includes(word.id)) return false
      const placed = puzzle.paths[word.id] ?? []
      if (placed.length <= nextPath.length) return false
      const same = (trail: GemCoord[]) => trail.slice(0, nextPath.length).every((cell, i) => cell.r === nextPath[i]!.r && cell.c === nextPath[i]!.c)
      return same(placed) || same([...placed].reverse())
    })) return false
    const extra = matchBonusWord(nextPath, puzzle, bonusRef.current)
    if (extra) {
      const nextBonus = [...bonusRef.current, extra.id]
      bonusRef.current = nextBonus
      setBonusFound(nextBonus)
      scoredThisGesture.current = true
      writePath([])
      rawRef.current = []
      setMisses(0)
      comboRef.current += 1
      if (comboRef.current >= 2) {
        setComboFlash(comboRef.current)
        window.setTimeout(() => setComboFlash(0), 1100)
      }
      const story = isStoryWord(extra.text, puzzle)
      const pts =
        bonusPointsFor(extra.text, puzzle) + skillBonusPoints(jarSkills, extra.text, comboRef.current)
      recordMatchBonus(lineId, pts)
      boardPts.current += pts
      setLastAward(pts)
      setBonusPts(pts)
      if (story) setStoryFound((count) => count + 1)
      explodeBonus(nextPath, extra.label, story, pts)
      return true
    }
    return false
  }

  function missIfSwipe(nextPath: GemCoord[]) {
    if (scoredThisGesture.current) {
      writePath([])
      rawRef.current = []
      return
    }
    const line = snapFingerPath(nextPath, puzzle.size)
    if (!shouldMissAfterSwipe(scoredThisGesture.current, line.length)) {
      writePath([])
      return
    }
    writePath(line)
    if (submit(line)) return
    if (!shouldMissAfterSwipe(scoredThisGesture.current, line.length)) {
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
    // Soft/empty swipe ≥3: Miss −25 tight — no long soft toast lines.
    const softEmpty = straight && line.length >= 3
    const why =
      count >= 2 && nextWord
        ? `Try this word: ${nextWord.label}`
        : softEmpty
          ? ''
          : !straight || line.length < 3
            ? EASY.bonusMissStraight
            : EASY.bonusMissWord
    recordMatchMiss(lineId)
    flashToast(EASY.missPenalty, why, false, true)
    teachHint(count)
    window.setTimeout(() => {
      setShake(false)
      writePath([])
    }, softEmpty ? 280 : 360)
  }

  function applyCell(cell: GemCoord, mode: 'tap' | 'drag') {
    if (status === 'ok') return
    if (mode === 'drag') {
      const raw = rawRef.current
      const last = raw[raw.length - 1]
      if (!last) rawRef.current = [cell]
      else if (!sameCell(last, cell)) rawRef.current = [...raw, cell]
      const line = snapFingerPath(rawRef.current, puzzle.size)
      // Keep the complete gesture visible; score only once on pointerup.
      writePath(line)
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
    submit(line, true)
  }

  function onCellDown(event: ReactPointerEvent<HTMLDivElement>, cell: GemCoord) {
    if (status === 'ok') return
    if (stripRef.current === 'sheet') return
    event.preventDefault()
    event.stopPropagation()
    // A lost pointerup (sheet ate it) used to latch drag and swallow the next swipe.
    if (drag.current) endDrag()
    drag.current = true
    dragPointerId.current = event.pointerId
    boardPointer.current = event.currentTarget
    const board = event.currentTarget.closest('.gem-board')
    if (board instanceof HTMLElement) {
      board.setPointerCapture?.(event.pointerId)
      boardPointer.current = board
    }
    moved.current = false
    scoredThisGesture.current = false
    setShake(false)
    rawRef.current = [cell]
    applyCell(cell, 'tap')
  }

  function onBoardMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (!drag.current || status === 'ok' || event.pointerId !== dragPointerId.current) return
    const cell = cellFromPoint(event.clientX, event.clientY)
    if (!cell) return
    const last = pathRef.current[pathRef.current.length - 1]
    if (last && sameCell(last, cell)) return
    moved.current = true
    applyCell(cell, 'drag')
  }

  function onBoardUp(event?: ReactPointerEvent<HTMLDivElement>) {
    if (!drag.current) return
    if (event && event.pointerId !== dragPointerId.current) return
    if (!moved.current && event) {
      const last = rawRef.current[rawRef.current.length - 1]
      const at = cellFromPoint(event.clientX, event.clientY)
      if (last && (!at || !sameCell(last, at))) moved.current = true
    }
    // A scored find already owns this gesture. Clear the trail and do not miss.
    if (scoredThisGesture.current) return endDrag()
    // A tap (no finger travel) keeps the built path so the next tap can extend it.
    if (!moved.current) return endDrag(true)
    const nextPath = rawRef.current.length ? rawRef.current.slice() : pathRef.current.slice()
    endDrag()
    if (nextPath.length >= 3) missIfSwipe(nextPath)
  }

  function onBoardCancel() {
    if (!drag.current && dragPointerId.current == null) return
    endDrag()
  }

  function replay() {
    replayToast.current = true
    setRound((current) => current + 1)
  }

  const selected = new Set(path.map(cellKey))
  const popOverlayActive =
    comboFlash > 1 || plusFlash || findPop > 0 || Boolean(toast) || toastBonus || toastMiss
  const hideStartHint = found.length > 0 || popOverlayActive

  return (
    <div
      className={`play is-gem-search is-panel-blast is-story-docked ${shake ? 'is-shake' : ''} ${status === 'ok' ? 'is-win' : ''} ${status === 'ok' && easy ? 'has-gem-jar' : ''} ${burst.length ? 'is-boom' : ''} ${plusFlash ? 'is-bonus-pop' : ''} ${findPop ? 'is-find-pop' : ''}`}
      style={{
        ['--gem-size' as string]: puzzle.size,
        ...(status === 'ok' && easy ? { ['--gem-jar-h' as string]: `${JAR_CARD_H}px` } : {}),
      }}
      onPointerUp={onBoardUp}
      onPointerCancel={onBoardCancel}
    >
      {/* Easy Clear 1.4.168: ≤720 peels how/say chrome in match.css — letter board + Lock In stay above fold (Hub/Snap/Father/Learn family). */}
      {/* Easy Clear 1.4.193: ≤720 fills purple void in gem.css (Fixes #250; Shot 1.4.190 / 03-easy-match). */}
      {/* Easy Clear 1.4.211: match-art-tight keeps the ≤720 board fill through the status counter (Fixes #273). */}
      {/* Easy Clear 1.4.225: phone portrait extends fill 193 + board stretch 211 so gem-board·status close bottom-third purple void (Fixes #297). */}
      {/* Easy Clear 1.4.236: tall-phone strengthens fill 225 (height 100% · gem-scroll/stage/board flex 1 1 0 · cta-dock position static) so gemSearch closes bottom-half purple void (Fixes #315). */}
      {/* Easy Clear 1.4.246: tall-phone cream board-plate fill (gem-scroll·stage parchment · warm board · denser stretch) so leftover is cream stage, not purple void (Fixes #332). */}
      {/* Easy Clear 1.4.253: tall-phone cream shell fill (opaque cream play + app-body · solid gem-scroll/stage · warm board · cream score/dock floor) so leftover is cream floor, not purple void after 246 (Fixes #345). */}
      {/* Easy Clear 1.4.262: tall residual cream floor (opaque cream play + app-body · solid gem-scroll/stage · found-counter pinned to cream floor above the 920 cap) so leftover between grid and counter is cream, not purple void after 253 (Fixes #362). */}
      {/* Easy Clear 1.4.259: phone portrait extends board-first HUD peel 168 + SNAG bonus tall-phone juice (invent Fun/Clear; panel-blast / SNAG only). */}
      {/* Easy Fun 1.4.270: tall-phone one-more win-end dock — One more Match punches gold, claim stays readable, stamp stays a label (invent Fun/Clear · Shot wake). */}
      {/* Easy Clear 1.4.271: pack gem-stage flex-start so the letter grid sits under the objective strip on tall phones — cream floor stays (Fixes #378). */}
      <p className="sort-how">{EASY.matchHunt}</p>
      {matchChips ? (
        <>
          <div className={`match-teach-dock ${status === 'ok' ? 'is-complete' : ''} ${stripMode === 'sheet' ? 'is-sheet-open' : ''}`}>
            {lociStamp ? (
              <LociStamp
                stamp={lociStamp}
                mode="dock"
                dockJuice={dockJuice}
                onTap={() => {
                  if (stripRef.current === 'sheet') closeSheet()
                  else {
                    endDrag()
                    setStripMode('sheet')
                  }
                }}
              />
            ) : null}
            <ul className="match-teach-chips" aria-label="Mind-map words to find">
              {puzzle.words.map((word) => (
                <li
                  key={word.id}
                  className={`match-teach-chip is-${word.role ?? word.kind} ${found.includes(word.id) ? 'is-found' : ''}`}
                >
                  <span className="match-teach-kind">{matchChipRoleLabel(word.role)}</span>
                  <span className="match-teach-label">{word.label}</span>
                </li>
              ))}
            </ul>
            <p
              className={`match-teach-say ${found.length === puzzle.words.length ? 'is-lit' : ''}`}
              role="status"
              aria-live="polite"
            >
              {sayLine.split(/(\s+)/).map((part: string, index: number) => {
                const plain = part.replace(/[^A-Za-z]/g, '').toUpperCase()
                const hit = puzzle.words.find((word) => word.text === plain)
                const on = hit ? found.includes(hit.id) : false
                if (!hit || !part.trim()) {
                  return <span key={`s-${index}`}>{part}</span>
                }
                return (
                  <span key={`s-${index}`} className={`match-teach-say-word ${on ? 'is-found' : 'is-pending'}`}>
                    {part}
                  </span>
                )
              })}
            </p>
          </div>
          {stripMode === 'sheet' && lociStamp ? (
            <div
              className="loci-sheet"
              role="dialog"
              aria-modal="true"
              aria-label="Place, person, and idea"
              onPointerDown={(event) => {
                event.stopPropagation()
              }}
              onPointerUp={(event) => {
                event.stopPropagation()
              }}
              onClick={() => closeSheet()}
            >
              <div
                className="loci-sheet-card"
                onPointerDown={(event) => event.stopPropagation()}
                onClick={(event) => event.stopPropagation()}
              >
                <button
                  type="button"
                  className="loci-sheet-close"
                  onClick={(event) => {
                    event.stopPropagation()
                    closeSheet()
                  }}
                  aria-label="Close loci stamp"
                >
                  Close
                </button>
                <LociStamp stamp={lociStamp} mode="hero" />
                <p className={`match-teach-say is-sheet ${found.length === puzzle.words.length ? 'is-lit' : ''}`}>
                  {sayLine}
                </p>
                <ul className="match-teach-chips" aria-label="Mind-map words">
                  {puzzle.words.map((word) => (
                    <li
                      key={word.id}
                      className={`match-teach-chip is-${word.role ?? word.kind} ${found.includes(word.id) ? 'is-found' : ''}`}
                    >
                      <span className="match-teach-kind">{matchChipRoleLabel(word.role)}</span>
                      <span className="match-teach-label">{word.label}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : null}
        </>
      ) : (
      <StoryStrip
        kicker={`${home.who} · ${home.place}`}
        panels={panels}
        opened={opened}
        flipping={flipping}
        complete={status === 'ok'}
        mode={stripMode}
        words={puzzle.words.map((word) => ({
          id: word.id,
          label: word.label,
          found: found.includes(word.id),
        }))}
        bonusWords={puzzle.planted.map((word) => ({
          id: word.id,
          label: word.label,
          found: bonusFound.includes(word.id),
        }))}
        bonusHint={EASY.bonusHint}
        dockJuice={dockJuice}
        onDockTap={() => setStripMode('sheet')}
        onSheetClose={() => closeSheet()}
      />
      )}
      <div className="gem-scroll" ref={gemScrollRef}>
      {easy && status !== 'ok' ? (
        <div className="gem-hint-slot">
          {puzzle.words[0] ? (
            <p
              className={`gem-start-hint${hideStartHint ? ' is-suppressed' : ''}${found.length && !popOverlayActive ? ' is-reserved' : ''}`}
              data-gem-start
              aria-hidden={hideStartHint}
            >
              {found.length === 0 && !popOverlayActive ? EASY.bonusMissStraight : '\u00a0'}
            </p>
          ) : null}
          {plusFlash ? (
            <p className="bonus-plus gem-score-pop" aria-hidden>
              +{bonusPts || 100}
            </p>
          ) : null}
          {findPop > 0 ? (
            <p className="gem-find-pop gem-score-pop" aria-hidden>
              +{findPop}
            </p>
          ) : null}
          {comboFlash > 1 ? (
            <p className="gem-combo is-loud" role="status">
              Combo ×{comboFlash}
            </p>
          ) : null}
          {toastBonus && toast ? (
            <p className="bonus-banner" role="status">
              <strong>{toast}</strong>
              {toastWhy ? <span>{toastWhy}</span> : null}
            </p>
          ) : null}
          {toastMiss && toast ? (
            <p className="miss-banner" role="status">
              <strong>{toast}</strong>
              {toastWhy ? <span>{toastWhy}</span> : null}
            </p>
          ) : null}
          {toast && !toastBonus && !toastMiss ? (
            <p className="match-toast gem-toast is-yes" role="status">
              <strong>{toast}</strong>
              {toastWhy ? <span className="toast-why">{toastWhy}</span> : null}
            </p>
          ) : null}
        </div>
      ) : null}
      {/* Board-first 1.4.99: StoryStrip dock is a flex header above this scroll; board fills leftover — zero overlay. */}
      {stripMode === 'hero' ? (
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
      ) : null}
      {!easy && comboFlash > 1 ? (
        <p className="gem-combo is-loud" role="status">
          Combo ×{comboFlash}
        </p>
      ) : null}
      <div className="gem-stage">
      {!easy && toastBonus && toast ? (
        <p className="bonus-banner" role="status">
          <strong>{toast}</strong>
          {toastWhy ? <span>{toastWhy}</span> : null}
        </p>
      ) : null}
      {!easy && toastMiss && toast ? (
        <p className="miss-banner" role="status">
          <strong>{toast}</strong>
          {toastWhy ? <span>{toastWhy}</span> : null}
        </p>
      ) : null}
      {!easy && toast && !toastBonus && !toastMiss ? (
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
        onPointerCancel={onBoardCancel}
      >
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
            const bonusGhost = !bonusClear && bonusGhosted.includes(key)
            const sharedFound = kept && found.some((wordId) =>
              (puzzle.paths[wordId] ?? []).some((cell) => cell.r === r && cell.c === c),
            )
            const cellClear = status !== 'ok' && (targetClear || bonusClear)
            const cellFound = status === 'ok' && (targetClear || sharedFound)
            const cellCracked = !bonusClear && (bonusGhost || sharedFound)
            const startCell = nextWord ? puzzle.paths[nextWord.id]?.[0] : undefined
            const startGold =
              easy &&
              status !== 'ok' &&
              startCell != null &&
              startCell.r === r &&
              startCell.c === c
            return (
              <div
                key={key}
                role="gridcell"
                data-gem-cell
                data-r={r}
                data-c={c}
                {...(startGold ? { 'data-gem-start-cell': '' } : {})}
                onPointerDown={(event) => onCellDown(event, { r, c })}
                className={`gem-cell hue-${gemHue(letter, r, c)} ${selected.has(key) ? 'is-sel' : ''} ${popping ? 'is-burst' : ''} ${cellClear ? 'is-clear' : ''} ${cellFound ? 'is-found' : ''} ${cellCracked ? 'is-cracked' : ''} ${hint.includes(key) ? 'is-hint' : ''} ${startGold ? 'is-start-gold' : ''} ${sightKeys.includes(key) && !bonusClear ? 'is-sight' : ''} ${popping && (bonusClear || bonusGhost) ? 'is-bonus-burst' : ''}`}
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
      {status === 'ok' && easy ? (
        <GemJarCard
          before={jarBefore}
          boardPts={boardPts.current}
          storyFound={storyFound}
          seen={progress.matchSkillSeen ?? 0}
          onSeen={markJarSeen}
        />
      ) : (
      <p className={`match-score ${plusFlash || findPop > 0 || comboFlash > 1 ? 'is-juice' : ''}`}>
        {left} left · {found.length} / {puzzle.words.length} found
        {bonusFound.length ? ` · ${bonusFound.length} bonus` : ''}
        {status === 'ok' && storyFound > 0 ? ` · ${EASY.storyWinLabel} ×${storyFound}` : ''}
        {lastAward > 0 ? <span className="bonus-pts"> · +{lastAward} bonus</span> : null}
      </p>
      )}
      </div>
      {status === 'ok' ? (
        <>
          <WinBurst play={winStamp} stamp={EASY.matchWin} />
          <MatchTakeaway lineId={lineId} title={sameFace ? lociStamp.ideaShort : clearBeat.title} />
          <div className="cta-dock">
            <button
              type="button"
              className={goldButtonClass('gem-win', 'lockInNext', 'snap-bins')}
              onClick={() => onEasyStop?.('hold')}
            >
              {EASY.holdNext}
            </button>
            <button
              type="button"
              className="btn xl more-match"
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
