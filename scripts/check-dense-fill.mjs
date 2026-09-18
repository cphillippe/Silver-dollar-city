#!/usr/bin/env node
/**
 * Self-check: dense fill vs uniform FILL.
 * Reimplements fill weights in plain JS (no TS compile required).
 * Reports avg cells covered by required+planted paths and chip-letter hit rate on filled empties.
 */
const SIZE = 8
const FILL = 'AEIOURSTLNCMDHPYGBKWFVJX'.split('')
const DIRS = [
  { r: 0, c: 1 },
  { r: 1, c: 0 },
  { r: 1, c: 1 },
]

const SAMPLE_CHIPS = [
  ['JESUS', 'ROAD', 'HELP', 'KIND'],
  ['PAUL', 'LIGHT', 'CITY', 'WORD'],
  ['PETER', 'HOME', 'CARE', 'TRUE'],
  ['MARY', 'TOMB', 'DAWN', 'HOPE'],
  ['JOHN', 'LAMP', 'HILL', 'LIFE'],
]

const PREFER_PLANTS = [
  'BED', 'CAT', 'RUN', 'SON', 'GAP', 'HUG', 'SUN', 'DOG', 'MAP', 'JOY',
  'BALL', 'TREE', 'BOOK', 'GOLD', 'HAND', 'KEEP', 'LOVE', 'FISH', 'GATE', 'RAIN',
]

const BONUS_POOL = [
  ...PREFER_PLANTS,
  'HELP', 'CARE', 'KIND', 'GIFT', 'ROAD', 'REST', 'BEST', 'GIVE', 'COME', 'HOLD',
  'HEART', 'WORLD', 'LIGHT', 'WATER', 'STONE', 'CROSS', 'PEACE', 'GRACE', 'FAITH',
]

function rng(seed) {
  let s = seed >>> 0 || 1
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0
    return s / 4294967296
  }
}

function emptyGrid() {
  return Array.from({ length: SIZE }, () => Array.from({ length: SIZE }, () => ''))
}

function shuffle(items, rand) {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rand() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

function canPlace(grid, word, start, dir) {
  for (let i = 0; i < word.length; i += 1) {
    const r = start.r + dir.r * i
    const c = start.c + dir.c * i
    if (r < 0 || c < 0 || r >= SIZE || c >= SIZE) return false
    const cell = grid[r][c]
    if (cell && cell !== word[i]) return false
  }
  return true
}

function writeWord(grid, word, start, dir) {
  const path = []
  for (let i = 0; i < word.length; i += 1) {
    const r = start.r + dir.r * i
    const c = start.c + dir.c * i
    grid[r][c] = word[i]
    path.push({ r, c })
  }
  return path
}

function tryPlace(grid, word, rand) {
  const starts = []
  for (let r = 0; r < SIZE; r += 1) {
    for (let c = 0; c < SIZE; c += 1) starts.push({ r, c })
  }
  const dirs = shuffle(DIRS, rand)
  const spots = shuffle(starts, rand)
  for (const dir of dirs) {
    for (const start of spots) {
      if (!canPlace(grid, word, start, dir)) continue
      return writeWord(grid, word, start, dir)
    }
  }
  return null
}

function letterWeightsFromWords(words) {
  const bag = []
  for (const word of words) {
    for (const ch of word) {
      if (ch >= 'A' && ch <= 'Z') bag.push(ch)
    }
  }
  return bag
}

function letterWeightsFromBonusPool(pool) {
  const counts = new Map()
  for (const word of pool) {
    if (word.length < 3 || word.length > 6) continue
    for (const ch of word) {
      counts.set(ch, (counts.get(ch) ?? 0) + 1)
    }
  }
  const bag = []
  for (const [ch, n] of counts) {
    const weight = Math.max(1, Math.ceil(n / 3))
    for (let i = 0; i < weight; i += 1) bag.push(ch)
  }
  return bag.length ? bag : FILL.slice(0, 12)
}

function pick(bag, rand) {
  return bag[Math.floor(rand() * bag.length)] ?? 'A'
}

function fillUniform(grid, rand) {
  return grid.map((row) =>
    row.map((cell) => (cell ? cell : FILL[Math.floor(rand() * FILL.length)] ?? 'A')),
  )
}

function fillDense(grid, rand, weightLetters) {
  const plantedBag = weightLetters.length ? [...weightLetters] : FILL.slice(0, 12)
  const bonusBag = letterWeightsFromBonusPool(BONUS_POOL)
  return grid.map((row) =>
    row.map((cell) => {
      if (cell) return cell
      const roll = rand()
      if (roll < 0.7) return pick(plantedBag, rand)
      if (roll < 0.9) return pick(bonusBag, rand)
      return pick(FILL, rand)
    }),
  )
}

function coverStats(paths, plantedPaths, letters, weightBag) {
  const need = new Set()
  for (const path of [...paths, ...plantedPaths]) {
    for (const cell of path) need.add(`${cell.r}:${cell.c}`)
  }
  const covered = need.size
  const bag = new Set(weightBag)
  let emptyFilled = 0
  let chipLetterHits = 0
  // Count filled cells that were empty before fill by checking if cell is NOT on a planted path
  // Actually: cells not in need were either never written (impossible after fill) or filled.
  // Better: recount from pre-fill emptiness — pass preEmpty keys.
  return { covered, coveredPct: (covered / (SIZE * SIZE)) * 100, emptyFilled, chipLetterHits, bag }
}

function measureBoard(preGrid, paths, plantedPaths, letters, weightBag, preEmpty) {
  const need = new Set()
  for (const path of [...paths, ...plantedPaths]) {
    for (const cell of path) need.add(`${cell.r}:${cell.c}`)
  }
  const bag = new Set(weightBag)
  let emptyFilled = 0
  let chipLetterHits = 0
  for (const key of preEmpty) {
    const [r, c] = key.split(':').map(Number)
    const letter = letters[r][c]
    emptyFilled += 1
    if (bag.has(letter)) chipLetterHits += 1
  }
  return {
    covered: need.size,
    coveredPct: (need.size / (SIZE * SIZE)) * 100,
    planted: plantedPaths.length,
    emptyFilled,
    chipLetterHits,
    chipHitPct: emptyFilled ? (chipLetterHits / emptyFilled) * 100 : 0,
  }
}

function buildOnce(chips, seed, dense, denserPlant) {
  const rand = rng(seed)
  const grid = emptyGrid()
  const paths = []
  const plantedPaths = []
  const plantedTexts = []

  for (const word of [...chips].sort((a, b) => b.length - a.length)) {
    const path = tryPlace(grid, word, rand)
    if (path) paths.push(path)
  }

  const maxPlant = 6
  const plants = shuffle(PREFER_PLANTS, rand)
  for (const text of plants) {
    if (plantedPaths.length >= maxPlant) break
    if (chips.includes(text)) continue
    const path = tryPlace(grid, text, rand)
    if (!path) continue
    plantedPaths.push(path)
    plantedTexts.push(text)
  }

  if (denserPlant) {
    const denserCap = maxPlant + 2
    for (const text of shuffle(PREFER_PLANTS, rand)) {
      if (plantedPaths.length >= denserCap) break
      if (chips.includes(text) || plantedTexts.includes(text)) continue
      if (text.length > 4) continue
      const path = tryPlace(grid, text, rand)
      if (!path) continue
      plantedPaths.push(path)
      plantedTexts.push(text)
    }
  }

  const preEmpty = []
  for (let r = 0; r < SIZE; r += 1) {
    for (let c = 0; c < SIZE; c += 1) {
      if (!grid[r][c]) preEmpty.push(`${r}:${c}`)
    }
  }

  const weightBag = letterWeightsFromWords([...chips, ...plantedTexts])
  const letters = dense ? fillDense(grid, rand, weightBag) : fillUniform(grid, rand)
  return measureBoard(grid, paths, plantedPaths, letters, weightBag, preEmpty)
}

function avg(rows, key) {
  if (!rows.length) return 0
  return rows.reduce((s, r) => s + r[key], 0) / rows.length
}

function main() {
  const before = []
  const after = []
  for (let i = 0; i < SAMPLE_CHIPS.length; i += 1) {
    const chips = SAMPLE_CHIPS[i]
    for (let salt = 0; salt < 8; salt += 1) {
      const seed = (i + 1) * 10007 + salt * 97
      before.push(buildOnce(chips, seed, false, false))
      after.push(buildOnce(chips, seed, true, true))
    }
  }

  const fmt = (n) => n.toFixed(1)
  const report = (label, rows) => ({
    label,
    n: rows.length,
    coveredPct: fmt(avg(rows, 'coveredPct')),
    planted: fmt(avg(rows, 'planted')),
    chipHitPct: fmt(avg(rows, 'chipHitPct')),
  })

  const b = report('uniform FILL (before)', before)
  const a = report('dense 70/20/10 + plant bump (after)', after)

  console.log('Fun Match less-waste — dense fill self-check')
  console.log(`samples: ${b.n} boards × ${SIZE}×${SIZE}`)
  console.log('')
  console.log('| mode | avg covered% (req+plant paths) | avg planted | avg chip-letter hit% on filled empties |')
  console.log('| --- | --- | --- | --- |')
  console.log(`| ${b.label} | ${b.coveredPct}% | ${b.planted} | ${b.chipHitPct}% |`)
  console.log(`| ${a.label} | ${a.coveredPct}% | ${a.planted} | ${a.chipHitPct}% |`)
  console.log('')
  const dCover = Number(a.coveredPct) - Number(b.coveredPct)
  const dHit = Number(a.chipHitPct) - Number(b.chipHitPct)
  console.log(`delta covered%: ${dCover >= 0 ? '+' : ''}${dCover.toFixed(1)}`)
  console.log(`delta chip-letter hit% on filled empties: ${dHit >= 0 ? '+' : ''}${dHit.toFixed(1)}`)
  console.log('')
  if (dHit < 5) {
    console.error('WARN: expected chip-letter hit% to rise meaningfully under dense fill')
    process.exitCode = 1
  } else {
    console.log('OK: dense fill raises payoff letters in empty cells')
  }
}

main()
