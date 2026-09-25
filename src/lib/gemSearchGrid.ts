import {
  BONUS_WORD_MAX,
  COMMON_BONUS_WORDS,
  isPlantableBonusWord,
  isPreferredPlantWord,
} from './commonBonusWords.ts'
import type { GemCoord } from './gemSearch.ts'

const FILL = 'AEIOURSTLNCMDHPYGBKWFVJX'.split('')

export const STOP = new Set([
  'THE', 'AND', 'FOR', 'THAT', 'THIS', 'WITH', 'FROM', 'WHO', 'ONE', 'WAS', 'ARE', 'NOT',
  'BUT', 'HIS', 'HER', 'HIM', 'YOU', 'YOUR', 'OUR', 'ITS', 'HAD', 'HAS', 'HAVE', 'BEEN',
  'THEY', 'THEM', 'THEN', 'THAN', 'ALSO', 'INTO', 'ONLY', 'JUST', 'LIKE', 'OVER', 'AFTER',
  'BEFORE', 'ABOUT', 'WHEN', 'WHAT', 'WHICH', 'WHILE', 'WHERE', 'THERE', 'THEIR', 'STILL',
  'DOES', 'DID', 'CAN', 'MAY', 'WILL', 'WOULD', 'COULD', 'SHOULD', 'BEING', 'BECAUSE',
  'OFF', 'OUT', 'OWN', 'HOW', 'WHY', 'ALL', 'ANY', 'EACH', 'MORE', 'MOST', 'SOME',
  'SUCH', 'VERY', 'MUCH', 'MANY', 'TELLS', 'TELL', 'SAYS', 'SAID', 'ASKS', 'ASK',
  'LIVES', 'LIVE', 'LINE', 'MAIN', 'IDEA', 'TRUE', 'SHORT',
])

const EASY_DIRS: GemCoord[] = [
  { r: 0, c: 1 },
  { r: 1, c: 0 },
  { r: 1, c: 1 },
]

export const GRID_SIZE = 8
export const MIN_BONUS_PLANT = 4
export const MAX_BONUS_PLANT = 6

type Grid = (string | '')[][]

export function shuffleSeed<T>(items: T[], rand: () => number): T[] {
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

function inBonusBand(bit: string, minLength: number, maxLength: number): boolean {
  return bit.length >= minLength && bit.length <= maxLength
}

function plantBitOk(bit: string, minLength: number, maxLength: number): boolean {
  return inBonusBand(bit, minLength, maxLength) && !STOP.has(bit)
}

function collidesRequired(text: string, chips: Set<string>): boolean {
  if (chips.has(text)) return true
  for (const chip of chips) {
    if (chip.includes(text) || text.includes(chip)) return true
  }
  return false
}

/** Fresh extras for this board — shuffled dict, kid-friendly, not required chips. */
export function plantCandidates(
  chips: Set<string>,
  rand: () => number,
  minLength = 3,
  maxLength = BONUS_WORD_MAX,
): string[] {
  const prefer: string[] = []
  const rest: string[] = []
  for (const text of COMMON_BONUS_WORDS) {
    if (!isPlantableBonusWord(text) || !plantBitOk(text, minLength, maxLength) || collidesRequired(text, chips)) {
      continue
    }
    if (isPreferredPlantWord(text)) prefer.push(text)
    else rest.push(text)
  }
  return [...shuffleSeed(prefer, rand), ...shuffleSeed(rest, rand)]
}

export function emptyGrid(size: number): Grid {
  return Array.from({ length: size }, () => Array.from({ length: size }, () => ''))
}

export function canPlace(grid: Grid, word: string, start: GemCoord, dir: GemCoord): boolean {
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

export function writeWord(grid: Grid, word: string, start: GemCoord, dir: GemCoord): GemCoord[] {
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

export function placeFallback(grid: Grid, word: string): GemCoord[] | null {
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

export function tryPlaceWord(
  grid: Grid,
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

export function gemHue(letter: string, r: number, c: number): number {
  return (letter.charCodeAt(0) + r * 3 + c * 5) % 6
}

export function scanBonusOnBoard(
  letters: string[][],
  pool: string[],
  taken: Set<string>,
  minLength: number,
  maxLength: number,
): { text: string; path: GemCoord[] }[] {
  const allow = new Set(pool)
  const found: { text: string; path: GemCoord[] }[] = []
  const seen = new Set(taken)
  const size = letters.length
  for (let r = 0; r < size; r += 1) {
    for (let c = 0; c < size; c += 1) {
      for (const dir of EASY_DIRS) {
        for (let len = minLength; len <= maxLength; len += 1) {
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
          found.push({ text: spelled, path })
        }
      }
    }
  }
  return found
}

/** Letters already written (chips + planted) — payoff bag for dense fill. */
export function letterWeightsFromWords(words: string[]): string[] {
  const bag: string[] = []
  for (const word of words) {
    for (const ch of word.toUpperCase()) {
      if (ch >= 'A' && ch <= 'Z') bag.push(ch)
    }
  }
  return bag
}

/** High-frequency letters from plantable / bonus-pool words (3–6). */
export function letterWeightsFromBonusPool(pool: Iterable<string>): string[] {
  const counts = new Map<string, number>()
  for (const raw of pool) {
    const word = raw.toUpperCase()
    if (word.length < 3 || word.length > BONUS_WORD_MAX) continue
    for (const ch of word) {
      if (ch < 'A' || ch > 'Z') continue
      counts.set(ch, (counts.get(ch) ?? 0) + 1)
    }
  }
  const bag: string[] = []
  for (const [ch, n] of counts) {
    const weight = Math.max(1, Math.ceil(n / 3))
    for (let i = 0; i < weight; i += 1) bag.push(ch)
  }
  return bag.length ? bag : FILL.slice(0, 12)
}

function lettersOnGrid(grid: Grid): string[] {
  const bag: string[] = []
  for (const row of grid) {
    for (const cell of row) {
      if (cell) bag.push(cell)
    }
  }
  return bag
}

function pickLetter(bag: string[], rand: () => number): string {
  if (!bag.length) return FILL[Math.floor(rand() * FILL.length)] ?? 'A'
  return bag[Math.floor(rand() * bag.length)] ?? 'A'
}

/**
 * Payoff-biased fill — less dead/filler cells.
 * ~70% planted+chip letter bag, ~20% high-freq bonus-pool letters, ~10% FILL texture.
 */
export function fillGridDense(
  grid: Grid,
  rand: () => number,
  weightLetters: string[] = [],
): string[][] {
  const chipBag = weightLetters.length ? [...weightLetters] : lettersOnGrid(grid)
  const plantedBag = chipBag.length ? chipBag : FILL.slice(0, 12)
  const bonusBag = letterWeightsFromBonusPool(COMMON_BONUS_WORDS)
  const rareBag = FILL

  return grid.map((row) =>
    row.map((cell) => {
      if (cell) return cell
      const roll = rand()
      if (roll < 0.7) return pickLetter(plantedBag, rand)
      if (roll < 0.9) return pickLetter(bonusBag, rand)
      return pickLetter(rareBag, rand)
    }),
  )
}

/** Thin wrapper — callers stay stable; optional weightLetters from buildGemPuzzle. */
export function fillGrid(
  grid: Grid,
  rand: () => number,
  weightLetters: string[] = [],
): string[][] {
  return fillGridDense(grid, rand, weightLetters)
}

export function sameCell(a: GemCoord, b: GemCoord): boolean {
  return a.r === b.r && a.c === b.c
}

export function cellKey(cell: GemCoord): string {
  return `${cell.r}:${cell.c}`
}

export function isAdjacent(a: GemCoord, b: GemCoord): boolean {
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
export function snapFingerPath(path: GemCoord[], size = GRID_SIZE, maxLen = 8): GemCoord[] {
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
    const len = Math.min(maxLen, maxT + 1)
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

export function tryAddToPath(path: GemCoord[], next: GemCoord, size = GRID_SIZE, maxLen = 8): GemCoord[] {
  if (path.some((cell) => sameCell(cell, next))) {
    if (path.length >= 2 && sameCell(path[path.length - 2]!, next)) {
      return path.slice(0, -1)
    }
    return path
  }
  const last = path[path.length - 1]
  if (!last) return [next]
  if (chebyshev(last, next) > 2) return path
  return snapFingerPath([...path, next], size, maxLen)
}
