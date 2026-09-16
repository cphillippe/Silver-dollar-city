import { packLesson } from '../content/packCatalog.ts'
import { evidenceFor } from '../content/evidence.ts'
import { easyChromeLine, easyWhoWhere } from './easy.ts'
import {
  BONUS_WORD_MAX,
  COMMON_BONUS_WORDS,
  isKidFriendlyBonusWord,
  isPlantableBonusWord,
  isPreferredPlantWord,
} from './commonBonusWords.ts'

export type GemKind = 'person' | 'place' | 'idea'

export interface GemWord {
  id: string
  text: string
  label: string
  kind: GemKind
}

export interface GemCoord {
  r: number
  c: number
}

export interface GemPuzzle {
  id: string
  size: number
  words: GemWord[]
  letters: string[][]
  paths: Record<string, GemCoord[]>
  /** Curated lesson words that are not required chips. */
  bonusPool: string[]
  /** Planted or discovered bonus words on this board. */
  bonus: GemWord[]
  /** Bonus words placed on purpose so extras are actually findable. */
  planted: GemWord[]
  bonusPaths: Record<string, GemCoord[]>
}

const STOP = new Set([
  'THE',
  'AND',
  'FOR',
  'THAT',
  'THIS',
  'WITH',
  'FROM',
  'WHO',
  'ONE',
  'WAS',
  'ARE',
  'NOT',
  'BUT',
  'HIS',
  'HER',
  'HIM',
  'YOU',
  'YOUR',
  'OUR',
  'ITS',
  'HAD',
  'HAS',
  'HAVE',
  'BEEN',
  'THEY',
  'THEM',
  'THEN',
  'THAN',
  'ALSO',
  'INTO',
  'ONLY',
  'JUST',
  'LIKE',
  'OVER',
  'AFTER',
  'BEFORE',
  'ABOUT',
  'WHEN',
  'WHAT',
  'WHICH',
  'WHILE',
  'WHERE',
  'THERE',
  'THEIR',
  'STILL',
  'DOES',
  'DID',
  'CAN',
  'MAY',
  'WILL',
  'WOULD',
  'COULD',
  'SHOULD',
  'BEING',
  'BECAUSE',
  'THEN',
  'THAN',
  'OFF',
  'OUT',
  'OWN',
  'HOW',
  'WHY',
  'ALL',
  'ANY',
  'EACH',
  'MORE',
  'MOST',
  'SOME',
  'SUCH',
  'VERY',
  'MUCH',
  'MANY',
  'TELLS',
  'TELL',
  'SAYS',
  'SAID',
  'ASKS',
  'ASK',
  'LIVES',
  'LIVE',
  'LINE',
  'MAIN',
  'IDEA',
  'TRUE',
  'SHORT',
])

const FILL = 'AEIOURSTLNCMDHPYGBKWFVJX'.split('')

const EASY_DIRS: GemCoord[] = [
  { r: 0, c: 1 },
  { r: 1, c: 0 },
  { r: 1, c: 1 },
]

const GRID = 8
const MIN_LEN = 3
const MAX_LEN = 8
const MAX_WORDS = 4
const BONUS_MAX_LEN = BONUS_WORD_MAX
export const MIN_BONUS_PLANT = 4
export const MAX_BONUS_PLANT = 6
const SHARED_BONUS = ['HELP', 'CARE', 'KIND', 'GIFT', 'ROAD', 'BED', 'GAP']

/**
 * Short English extras (3–6). Straight-line Set lookup.
 * Lesson chips stay required; planted extras shuffle from the dict and only score BONUS! +100.
 */
const COMMON_BONUS = COMMON_BONUS_WORDS

/** Authored extras plus common board words. Lesson text fills the rest. */
const LESSON_BONUS: Record<string, string[]> = {
  'ph-road': ['ROAD', 'HELP', 'HURT', 'CARE', 'OIL', 'INN', 'KIND', 'GAP'],
  'ph-father': ['GAP', 'SON', 'HUG', 'RUN', 'HOME', 'ARMS', 'RING'],
  'ph-debt': ['DEBT', 'KING', 'JAIL', 'SUM', 'PEER'],
  'wb-creed': ['CREED', 'DIED', 'ROSE', 'PAUL', 'NAMES'],
  'wb-women': ['TOMB', 'WOMEN', 'DAWN', 'TOLD'],
  'daily-lantern': ['LAMP', 'HILL', 'CITY', 'LIGHT'],
  'daily-stars': ['SKY', 'STARS', 'MAKER', 'SPEAK'],
  'daily-cosmos': ['WORLD', 'LIFE', 'FIT', 'GIVEN'],
  'hl-moral': ['DUTY', 'HEART', 'RIGHT', 'KNOW'],
  'fg-order': ['ORDER', 'HOLD', 'WORLD', 'CHRIST'],
  'fg-reason': ['LIGHT', 'MIND', 'KNOW', 'WORD'],
  'fg-ought': ['OUGHT', 'HEART', 'LAW', 'NATURE'],
  'fg-ground': ['GOD', 'LIVE', 'MOVE', 'GROUND'],
}

export function lettersOnly(text: string): string {
  return text.toUpperCase().replace(/[^A-Z]/g, '')
}

export function titleWord(text: string): string {
  const raw = text.trim()
  if (!raw) return raw
  return raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase()
}

function tokens(text: string): string[] {
  return text
    .split(/[^A-Za-z]+/)
    .map((part) => part.toUpperCase())
    .filter((part) => part.length >= MIN_LEN && part.length <= MAX_LEN && !STOP.has(part))
}

function hashSeed(text: string): number {
  let h = 2166136261
  for (let i = 0; i < text.length; i += 1) {
    h = Math.imul(h ^ text.charCodeAt(i), 16777619)
  }
  return h >>> 0
}

function rng(seed: number) {
  let s = seed || 1
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0
    return s / 4294967296
  }
}

function shuffleSeed<T>(items: T[], rand: () => number): T[] {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rand() * (i + 1))
    const current = copy[i]
    const swap = copy[j]
    if (current === undefined || swap === undefined) continue
    copy[i] = swap
    copy[j] = current
  }
  return copy
}

function addWord(list: GemWord[], text: string, kind: GemKind) {
  const letters = lettersOnly(text)
  if (letters.length < MIN_LEN || letters.length > MAX_LEN) return
  if (list.some((word) => word.text === letters)) return
  list.push({
    id: `${kind}-${letters.toLowerCase()}`,
    text: letters,
    label: titleWord(letters),
    kind,
  })
}

/** Claim, person, place, and short idea words from the current Easy pack lesson. */
export function gemWordsFor(lineId: string): GemWord[] {
  const lesson = packLesson(lineId)
  const home = easyWhoWhere(lineId)
  const claim = lesson?.claim || evidenceFor(lineId)?.claim || ''
  const picked: GemWord[] = []

  addWord(picked, home.who, 'person')
  const placeBits = home.place.split(/\s+/).filter(Boolean)
  addWord(picked, placeBits[placeBits.length - 1] ?? home.place, 'place')

  const claimBits = tokens(claim)
  const longClaim = claimBits.filter((bit) => bit.length >= 7).sort((a, b) => b.length - a.length)
  const shortClaim = claimBits.filter((bit) => bit.length <= 6).sort((a, b) => b.length - a.length)
  if (longClaim[0]) addWord(picked, longClaim[0], 'idea')
  for (const bit of shortClaim) {
    if (picked.length >= MAX_WORDS) break
    addWord(picked, bit, 'idea')
  }

  const term = lesson?.easy.word?.term
  const easyFace = easyChromeLine(claim)
  const extra = [
    ...tokens(easyFace),
    ...tokens(lesson?.easy.learn ?? ''),
    ...tokens(lesson?.easy.gloss ?? ''),
    ...tokens(term ?? ''),
  ].filter((bit) => bit.length <= 6)
  for (const bit of extra) {
    if (picked.length >= MAX_WORDS) break
    addWord(picked, bit, 'idea')
  }

  if (picked.length < 3) {
    addWord(picked, 'KEEP', 'idea')
    addWord(picked, 'TRUE', 'idea')
  }
  return picked.slice(0, MAX_WORDS)
}

function inBonusBand(bit: string): boolean {
  return bit.length >= MIN_LEN && bit.length <= BONUS_MAX_LEN
}

/** STOP is for required-chip tokens only — too-common 3-letter dict words still score. */
function plantBitOk(bit: string): boolean {
  return inBonusBand(bit) && !STOP.has(bit)
}

function bonusBitOk(bit: string): boolean {
  return inBonusBand(bit)
}

function collidesRequired(text: string, chips: Set<string>): boolean {
  if (chips.has(text)) return true
  for (const chip of chips) {
    if (chip.includes(text) || text.includes(chip)) return true
  }
  return false
}

/** Fresh extras for this board — shuffled dict, kid-friendly, not required chips. */
export function plantCandidates(chips: Set<string>, rand: () => number): string[] {
  const prefer: string[] = []
  const rest: string[] = []
  for (const text of COMMON_BONUS_WORDS) {
    if (!isPlantableBonusWord(text) || !plantBitOk(text) || collidesRequired(text, chips)) continue
    if (isPreferredPlantWord(text)) prefer.push(text)
    else rest.push(text)
  }
  return [...shuffleSeed(prefer, rand), ...shuffleSeed(rest, rand)]
}

/** Small curated pool — lesson words only, never required chips. */
export function bonusWordsFor(lineId: string): string[] {
  const lesson = packLesson(lineId)
  const targets = new Set(gemWordsFor(lineId).map((word) => word.text))
  const authored = LESSON_BONUS[lineId] ?? []
  const fromText = [
    ...tokens(lesson?.easy.learn ?? ''),
    ...tokens(lesson?.easy.gloss ?? ''),
    ...tokens(lesson?.easy.word?.term ?? ''),
    ...tokens(lesson?.easy.hint ?? ''),
    ...tokens(lesson?.claim ?? ''),
    ...tokens(easyChromeLine(lesson?.claim ?? '')),
    ...tokens(easyChromeLine(lesson?.plain ?? '')),
  ]
  const seen = new Set<string>()
  const pool: string[] = []
  for (const bit of [...authored, ...fromText, ...SHARED_BONUS]) {
    if (!plantBitOk(bit) || targets.has(bit) || seen.has(bit)) continue
    seen.add(bit)
    pool.push(bit)
  }
  return pool
}

function makeBonusWord(text: string): GemWord {
  return {
    id: `bonus-${text.toLowerCase()}`,
    text,
    label: titleWord(text),
    kind: 'idea',
  }
}

function emptyGrid(size: number): (string | '')[][] {
  return Array.from({ length: size }, () => Array.from({ length: size }, () => ''))
}

function canPlace(
  grid: (string | '')[][],
  word: string,
  start: GemCoord,
  dir: GemCoord,
): boolean {
  const size = grid.length
  for (let i = 0; i < word.length; i += 1) {
    const r = start.r + dir.r * i
    const c = start.c + dir.c * i
    if (r < 0 || c < 0 || r >= size || c >= size) return false
    const cell = grid[r]?.[c]
    const letter = word[i]
    if (cell && cell !== letter) return false
  }
  return true
}

function writeWord(
  grid: (string | '')[][],
  word: string,
  start: GemCoord,
  dir: GemCoord,
): GemCoord[] {
  const path: GemCoord[] = []
  for (let i = 0; i < word.length; i += 1) {
    const r = start.r + dir.r * i
    const c = start.c + dir.c * i
    const row = grid[r]
    if (!row) continue
    row[c] = word[i] ?? ''
    path.push({ r, c })
  }
  return path
}

function placeFallback(grid: (string | '')[][], word: string): GemCoord[] | null {
  const dir = { r: 0, c: 1 }
  for (let row = 0; row < grid.length; row += 1) {
    const start = { r: row, c: 0 }
    if (!canPlace(grid, word, start, dir)) continue
    return writeWord(grid, word, start, dir)
  }
  for (let r = 0; r < grid.length; r += 1) {
    for (let c = 0; c < grid.length; c += 1) {
      const start = { r, c }
      if (!canPlace(grid, word, start, dir)) continue
      return writeWord(grid, word, start, dir)
    }
  }
  return null
}

export function gemHue(letter: string, r: number, c: number): number {
  return (letter.charCodeAt(0) + r * 3 + c * 5) % 6
}

function tryPlaceWord(
  grid: (string | '')[][],
  word: string,
  starts: GemCoord[],
  rand: () => number,
): GemCoord[] | null {
  const dirs = shuffleSeed(EASY_DIRS, rand)
  const spots = shuffleSeed(starts, rand)
  for (const dir of dirs) {
    for (const start of spots) {
      if (!canPlace(grid, word, start, dir)) continue
      return writeWord(grid, word, start, dir)
    }
  }
  return null
}

function scanBonusOnBoard(
  letters: string[][],
  pool: string[],
  taken: Set<string>,
): { word: GemWord; path: GemCoord[] }[] {
  const allow = new Set(pool)
  const found: { word: GemWord; path: GemCoord[] }[] = []
  const seen = new Set(taken)
  const size = letters.length
  for (let r = 0; r < size; r += 1) {
    for (let c = 0; c < size; c += 1) {
      for (const dir of EASY_DIRS) {
        for (let len = MIN_LEN; len <= BONUS_MAX_LEN; len += 1) {
          const path: GemCoord[] = []
          let ok = true
          for (let i = 0; i < len; i += 1) {
            const rr = r + dir.r * i
            const cc = c + dir.c * i
            if (rr < 0 || cc < 0 || rr >= size || cc >= size) {
              ok = false
              break
            }
            path.push({ r: rr, c: cc })
          }
          if (!ok) continue
          const spelled = pathLetters(path, letters)
          if (!allow.has(spelled) || seen.has(spelled)) continue
          seen.add(spelled)
          found.push({ word: makeBonusWord(spelled), path })
        }
      }
    }
  }
  return found
}

export function buildGemPuzzle(lineId: string, salt = 0): GemPuzzle {
  const words = gemWordsFor(lineId)
  const bonusPool = bonusWordsFor(lineId)
  const size = GRID
  const rand = rng(salt === 0 ? hashSeed(lineId) : hashSeed(`${lineId}:${salt}`))
  const grid = emptyGrid(size)
  const paths: Record<string, GemCoord[]> = {}
  const bonusPaths: Record<string, GemCoord[]> = {}
  const bonus: GemWord[] = []
  const starts: GemCoord[] = []
  for (let r = 0; r < size; r += 1) {
    for (let c = 0; c < size; c += 1) starts.push({ r, c })
  }

  words
    .slice()
    .sort((a, b) => b.text.length - a.text.length)
    .forEach((word) => {
      paths[word.id] = tryPlaceWord(grid, word.text, starts, rand) ?? placeFallback(grid, word.text) ?? []
    })

  const plantedWords: GemWord[] = []
  const planted = new Set<string>()
  const targets = new Set(words.map((word) => word.text))
  for (const text of plantCandidates(targets, rand)) {
    if (plantedWords.length >= MAX_BONUS_PLANT) break
    const placed = tryPlaceWord(grid, text, starts, rand) ?? placeFallback(grid, text)
    if (!placed) continue
    const word = makeBonusWord(text)
    plantedWords.push(word)
    bonus.push(word)
    bonusPaths[word.id] = placed
    planted.add(text)
  }

  const letters = grid.map((row) =>
    row.map((cell) => {
      if (cell) return cell
      return FILL[Math.floor(rand() * FILL.length)] ?? 'A'
    }),
  )

  const taken = new Set([...words.map((word) => word.text), ...planted])
  const scanPool = [
    ...new Set([
      ...bonusPool,
      ...[...COMMON_BONUS].filter((text) => isKidFriendlyBonusWord(text)),
    ]),
  ]
  for (const hit of scanBonusOnBoard(letters, scanPool, taken)) {
    bonus.push(hit.word)
    bonusPaths[hit.word.id] = hit.path
  }

  return { id: lineId, size, words, letters, paths, bonusPool, bonus, planted: plantedWords, bonusPaths }
}

export function sameCell(a: GemCoord, b: GemCoord) {
  return a.r === b.r && a.c === b.c
}

function sameTrail(a: GemCoord[], b: GemCoord[]): boolean {
  if (a.length !== b.length) return false
  return a.every((cell, i) => sameCell(cell, b[i]!))
}

function trailMatches(placed: GemCoord[], path: GemCoord[]): boolean {
  if (sameTrail(placed, path)) return true
  return sameTrail([...placed].reverse(), path)
}

export function cellKey(cell: GemCoord) {
  return `${cell.r}:${cell.c}`
}

export function isAdjacent(a: GemCoord, b: GemCoord) {
  const dr = b.r - a.r
  const dc = b.c - a.c
  return dr >= -1 && dr <= 1 && dc >= -1 && dc <= 1 && !(dr === 0 && dc === 0)
}

const SNAP_DIRS: GemCoord[] = [
  { r: 0, c: 1 },
  { r: 0, c: -1 },
  { r: 1, c: 0 },
  { r: -1, c: 0 },
  { r: 1, c: 1 },
  { r: 1, c: -1 },
  { r: -1, c: 1 },
  { r: -1, c: -1 },
]

function chebyshev(a: GemCoord, b: GemCoord): number {
  return Math.max(Math.abs(a.r - b.r), Math.abs(a.c - b.c))
}

function buildRay(start: GemCoord, dir: GemCoord, len: number, size: number): GemCoord[] | null {
  const path: GemCoord[] = []
  for (let i = 0; i < len; i += 1) {
    const r = start.r + dir.r * i
    const c = start.c + dir.c * i
    if (r < 0 || c < 0 || r >= size || c >= size) return null
    path.push({ r, c })
  }
  return path
}

/** Straight line of steps after the first cell — Easy word-search swipe. */
export function isStraightPath(path: GemCoord[]): boolean {
  if (path.length < 2) return false
  const first = path[0]
  const second = path[1]
  if (!first || !second) return false
  const dr = second.r - first.r
  const dc = second.c - first.c
  if (dr === 0 && dc === 0) return false
  if (Math.abs(dr) > 1 || Math.abs(dc) > 1) return false
  for (let i = 2; i < path.length; i += 1) {
    const prev = path[i - 1]
    const next = path[i]
    if (!prev || !next) return false
    if (next.r - prev.r !== dr || next.c - prev.c !== dc) return false
  }
  return true
}

/** Snap a wobbly finger trail to the nearest row, column, or diagonal. */
export function snapFingerPath(path: GemCoord[], size = GRID): GemCoord[] {
  if (path.length < 2 || size < 2) return path
  if (isStraightPath(path)) return path
  const start = path[0]
  if (!start) return path
  let best: GemCoord[] | null = null
  let bestScore = -Infinity
  for (const dir of SNAP_DIRS) {
    let hits = 0
    let maxT = 0
    const denom = dir.r * dir.r + dir.c * dir.c
    if (!denom) continue
    for (const cell of path) {
      const t = Math.round(((cell.r - start.r) * dir.r + (cell.c - start.c) * dir.c) / denom)
      if (t < 0) continue
      const on = { r: start.r + dir.r * t, c: start.c + dir.c * t }
      if (on.r < 0 || on.c < 0 || on.r >= size || on.c >= size) continue
      if (chebyshev(cell, on) > 1) continue
      hits += 1
      if (t > maxT) maxT = t
    }
    const len = Math.min(MAX_LEN, maxT + 1)
    if (len < 2) continue
    const line = buildRay(start, dir, len, size)
    if (!line) continue
    const last = path[path.length - 1]!
    const score = hits * 100 + len * 10 - chebyshev(last, line[line.length - 1]!)
    if (score > bestScore) {
      bestScore = score
      best = line
    }
  }
  return best ?? path
}

export function pathLetters(path: GemCoord[], letters: string[][]): string {
  return path.map((cell) => letters[cell.r]?.[cell.c] ?? '').join('')
}

function reverseLetters(text: string): string {
  return text.split('').reverse().join('')
}

export function pathSpellings(path: GemCoord[], letters: string[][]): string[] {
  const fwd = pathLetters(path, letters)
  const back = reverseLetters(fwd)
  return fwd === back ? [fwd] : [fwd, back]
}

/** First straight (or reverse) run of `word` on the letter grid. */
export function findStraightSpelling(letters: string[][], word: string): GemCoord[] | null {
  const size = letters.length
  for (let r = 0; r < size; r += 1) {
    for (let c = 0; c < size; c += 1) {
      for (const dir of EASY_DIRS) {
        const path: GemCoord[] = []
        let ok = true
        for (let i = 0; i < word.length; i += 1) {
          const rr = r + dir.r * i
          const cc = c + dir.c * i
          if (rr < 0 || cc < 0 || rr >= size || cc >= size) {
            ok = false
            break
          }
          path.push({ r: rr, c: cc })
        }
        if (!ok) continue
        const spelled = pathLetters(path, letters)
        if (spelled === word) return path
        if (reverseLetters(spelled) === word) return [...path].reverse()
      }
    }
  }
  return null
}

/** Non-chip extra: curated lesson pool or a common English word on the board.
 * Exact 3–6 letter dict swipe scores even when those letters sit inside a longer chip. */
export function isBonusSpelling(text: string, puzzle: GemPuzzle): boolean {
  if (!bonusBitOk(text)) return false
  if (puzzle.words.some((word) => word.text === text)) return false
  if (puzzle.bonusPool.includes(text)) return true
  return COMMON_BONUS.has(text) && isKidFriendlyBonusWord(text)
}

export function tryAddToPath(path: GemCoord[], next: GemCoord, size = GRID): GemCoord[] {
  if (path.some((cell) => sameCell(cell, next))) {
    if (path.length >= 2 && sameCell(path[path.length - 2]!, next)) {
      return path.slice(0, -1)
    }
    return path
  }
  const last = path[path.length - 1]
  if (!last) return [next]
  if (chebyshev(last, next) > 2) return path
  return snapFingerPath([...path, next], size)
}

export function matchGemWord(path: GemCoord[], puzzle: GemPuzzle, found: string[]): GemWord | null {
  const line = snapFingerPath(path, puzzle.size)
  if (!isStraightPath(line)) return null
  const spells = pathSpellings(line, puzzle.letters)
  return (
    puzzle.words.find((word) => spells.includes(word.text) && !found.includes(word.id)) ?? null
  )
}

/**
 * Finger-up Miss after a swipe. No penalty if this gesture already scored
 * a chip or bonus, or if the snapped path is empty / a single cell.
 */
export function shouldMissAfterSwipe(scoredThisGesture: boolean, lineLength: number): boolean {
  if (scoredThisGesture) return false
  if (lineLength < 2) return false
  return true
}

/** Extra word on a straight line — not a required chip. Forward or reverse swipe. */
export function matchBonusWord(
  path: GemCoord[],
  puzzle: GemPuzzle,
  foundBonus: string[],
): GemWord | null {
  const line = snapFingerPath(path, puzzle.size)
  if (!isStraightPath(line)) return null
  const spells = pathSpellings(line, puzzle.letters)
  if (puzzle.words.some((word) => spells.includes(word.text))) return null
  const plantedHit = puzzle.planted.find((word) => {
    if (foundBonus.includes(word.id) || foundBonus.includes(word.text)) return false
    const placed = puzzle.bonusPaths[word.id]
    return Boolean(placed && trailMatches(placed, line))
  })
  if (plantedHit) return plantedHit
  const spelled = spells.find((text) => isBonusSpelling(text, puzzle))
  if (!spelled) return null
  const word = puzzle.bonus.find((item) => item.text === spelled) ?? makeBonusWord(spelled)
  if (foundBonus.includes(word.id) || foundBonus.includes(spelled)) return null
  return word
}


/** Cells still required by planted bonus words the player has not found yet. */
export function cellsNeededByOpenPlanted(puzzle: GemPuzzle, foundBonus: string[]): Set<string> {
  const need = new Set<string>()
  for (const word of puzzle.planted) {
    if (foundBonus.includes(word.id) || foundBonus.includes(word.text)) continue
    for (const cell of puzzle.bonusPaths[word.id] ?? []) need.add(cellKey(cell))
  }
  return need
}

export function cellsStillNeeded(puzzle: GemPuzzle, found: string[]): Set<string> {
  const need = new Set<string>()
  for (const word of puzzle.words) {
    if (found.includes(word.id)) continue
    for (const cell of puzzle.paths[word.id] ?? []) need.add(cellKey(cell))
  }
  return need
}
