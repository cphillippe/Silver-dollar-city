import { packLesson } from '../content/packCatalog.ts'
import { evidenceFor } from '../content/evidence.ts'
import { easyChromeLine, easyWhoWhere } from './easy.ts'

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

export function buildGemPuzzle(lineId: string): GemPuzzle {
  const words = gemWordsFor(lineId)
  const size = GRID
  const rand = rng(hashSeed(lineId))
  const grid = emptyGrid(size)
  const paths: Record<string, GemCoord[]> = {}
  const starts: GemCoord[] = []
  for (let r = 0; r < size; r += 1) {
    for (let c = 0; c < size; c += 1) starts.push({ r, c })
  }

  words
    .slice()
    .sort((a, b) => b.text.length - a.text.length)
    .forEach((word) => {
      const dirs = shuffleSeed(EASY_DIRS, rand)
      const spots = shuffleSeed(starts, rand)
      let placed: GemCoord[] | null = null
      for (const dir of dirs) {
        for (const start of spots) {
          if (!canPlace(grid, word.text, start, dir)) continue
          placed = writeWord(grid, word.text, start, dir)
          break
        }
        if (placed) break
      }
      paths[word.id] = placed ?? placeFallback(grid, word.text) ?? []
    })

  const letters = grid.map((row) =>
    row.map((cell) => {
      if (cell) return cell
      return FILL[Math.floor(rand() * FILL.length)] ?? 'A'
    }),
  )

  return { id: lineId, size, words, letters, paths }
}

export function sameCell(a: GemCoord, b: GemCoord) {
  return a.r === b.r && a.c === b.c
}

export function cellKey(cell: GemCoord) {
  return `${cell.r}:${cell.c}`
}

export function isAdjacent(a: GemCoord, b: GemCoord) {
  const dr = b.r - a.r
  const dc = b.c - a.c
  return dr >= -1 && dr <= 1 && dc >= -1 && dc <= 1 && !(dr === 0 && dc === 0)
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

export function pathLetters(path: GemCoord[], letters: string[][]): string {
  return path.map((cell) => letters[cell.r]?.[cell.c] ?? '').join('')
}

export function tryAddToPath(path: GemCoord[], next: GemCoord): GemCoord[] {
  if (path.some((cell) => sameCell(cell, next))) {
    if (path.length >= 2 && sameCell(path[path.length - 2]!, next)) {
      return path.slice(0, -1)
    }
    return path
  }
  const last = path[path.length - 1]
  if (!last) return [next]
  if (!isAdjacent(last, next)) return path
  const trial = [...path, next]
  if (trial.length >= 3 && !isStraightPath(trial)) return path
  return trial
}

export function matchGemWord(path: GemCoord[], puzzle: GemPuzzle, found: string[]): GemWord | null {
  if (!isStraightPath(path)) return null
  const spelled = pathLetters(path, puzzle.letters)
  return puzzle.words.find((word) => word.text === spelled && !found.includes(word.id)) ?? null
}

export function cellsStillNeeded(puzzle: GemPuzzle, found: string[]): Set<string> {
  const need = new Set<string>()
  for (const word of puzzle.words) {
    if (found.includes(word.id)) continue
    for (const cell of puzzle.paths[word.id] ?? []) need.add(cellKey(cell))
  }
  return need
}
