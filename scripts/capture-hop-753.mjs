#!/usr/bin/env node
/**
 * Issue #753 proof: fresh save, gold-path prefix, lesson 1 (ph-road) word search,
 * common bonus +50 toast. Shots → HOP753_OUT (default: OS temp dir / hop-753).
 */
import assert from 'node:assert/strict'
import { mkdirSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { chromium } from 'playwright'
import { createServer } from 'vite'
import { APP_VERSION, SAVE_SCHEMA_VERSION, STORAGE_KEY } from '../src/config/app.ts'
import { SAVE_KIND } from '../src/lib/save.ts'
import { buildGemPuzzle, bonusPointsFor, gemWordsFor, isBonusSpelling } from '../src/lib/gemSearch.ts'
import { findStraightSpelling } from '../src/lib/gemSearchGrid.ts'
import { MATCH_GENERIC_POINTS } from '../src/lib/matchBonus.ts'
import { COMMON_BONUS_WORDS, isPlantableBonusWord } from '../src/lib/commonBonusWords.ts'

const OUT = process.env.HOP753_OUT ?? join(tmpdir(), 'hop-753')
/** First word search on the golden path (after ph-road maze + ph-father run). */
const LINE = 'ob-tuning'
const SEED = 0
const VIEWPORTS = [
  [375, 667],
  [390, 844],
]

/** Cleared storage, then the golden-path state right before the first word search (ob-tuning). */
function goldPathSave() {
  const today = new Date().toISOString().slice(0, 10)
  return {
    kind: SAVE_KIND,
    schemaVersion: SAVE_SCHEMA_VERSION,
    appVersion: APP_VERSION,
    savedAt: new Date().toISOString(),
    progress: {
      started: true,
      easyMode: true,
      theme: 'candy',
      completed: [],
      held: ['ph-road', 'ph-father'],
      easyHeld: ['ph-road', 'ph-father'],
      easyTaught: ['ph-road', 'ph-father'],
      lessonScore: { 'ph-road': 10, 'ph-father': 10 },
      lessonTier: { 'ph-road': 'easy', 'ph-father': 'easy' },
      lastDailyDate: today,
      dailyDates: [today],
      cityBuilt: { porch: 2, hollow: 1, bench: 0, observatory: 0, gate: 0, lookout: 0, journal: 0, lamps: 0 },
    },
  }
}

async function launchBrowser() {
  try {
    return await chromium.launch({ headless: true })
  } catch {
    return await chromium.launch({ headless: true, channel: 'chrome' })
  }
}

async function filledGolds(page) {
  return page.evaluate(() => {
    const hits = []
    for (const el of document.querySelectorAll('button, a.btn')) {
      if (!(el instanceof HTMLElement)) continue
      if (el.closest('.easy-core')) continue
      if (el.closest('[hidden]')) continue
      const style = getComputedStyle(el)
      if (style.display === 'none' || style.visibility === 'hidden' || Number(style.opacity) === 0) continue
      const box = el.getBoundingClientRect()
      if (box.width <= 0 || box.height <= 0) continue
      const primary = el.classList.contains('primary')
      const coach = el.classList.contains('easy-coach-step') && Boolean(el.closest('li.is-now'))
      if (!primary && !coach) continue
      hits.push((el.innerText || el.getAttribute('aria-label') || '').replace(/\s+/g, ' ').trim())
    }
    return hits
  })
}

async function tapFilledGold(page) {
  const golds = await filledGolds(page)
  assert.equal(golds.length, 1, `one filled gold, saw ${JSON.stringify(golds)}`)
  const handle = await page.evaluateHandle(() => {
    for (const el of document.querySelectorAll('button, a.btn')) {
      if (!(el instanceof HTMLElement)) continue
      if (el.closest('.easy-core')) continue
      if (el.closest('[hidden]')) continue
      const style = getComputedStyle(el)
      if (style.display === 'none' || style.visibility === 'hidden' || Number(style.opacity) === 0) continue
      const box = el.getBoundingClientRect()
      if (box.width <= 0 || box.height <= 0) continue
      const primary = el.classList.contains('primary')
      const coach = el.classList.contains('easy-coach-step') && Boolean(el.closest('li.is-now'))
      if (!primary && !coach) continue
      return el
    }
    return null
  })
  const el = handle.asElement()
  assert.ok(el, 'filled gold element')
  await el.scrollIntoViewIfNeeded()
  const box = await el.boundingBox()
  await handle.dispose()
  assert.ok(box, 'filled gold box')
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2)
}

async function tapPath(page, path) {
  for (const cell of path) {
    const box = await page.locator(`[data-gem-cell][data-r="${cell.r}"][data-c="${cell.c}"]`).boundingBox()
    assert.ok(box, `cell ${cell.r}:${cell.c}`)
    await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2)
    await page.waitForTimeout(260)
  }
}

function gridsMatch(a, b) {
  if (a.length !== b.length) return false
  for (let r = 0; r < a.length; r += 1) {
    for (let c = 0; c < a[r].length; c += 1) {
      if (a[r][c] !== b[r][c]) return false
    }
  }
  return true
}

function boardForLiveGrid(letters) {
  for (let seed = 0; seed < 512; seed += 1) {
    const board = buildGemPuzzle(LINE, seed)
    if (gridsMatch(board.letters, letters)) return board
  }
  return null
}

function pickGenericBonus(board) {
  const chips = new Set(board.words.map((w) => w.text))
  for (const word of board.planted) {
    if (chips.has(word.text)) continue
    if (board.lessonPlanted.includes(word.text)) continue
    if (!isPlantableBonusWord(word.text)) continue
    if (bonusPointsFor(word.text, board) !== MATCH_GENERIC_POINTS) continue
    const path = board.bonusPaths[word.id]
    if (path?.length === word.text.length) return { text: word.text, path }
  }
  return null
}

function pickBonusOnGrid(letters, lineId) {
  const chips = new Set(gemWordsFor(lineId).map((w) => w.text))
  const prefer = ['BED', 'CAT', 'RUN', 'GAP', 'SUN', 'NET', 'YES', 'DOG', 'BIG', 'HAT']
  const tryList = [...prefer, ...COMMON_BONUS_WORDS].filter(
    (text, i, arr) => isPlantableBonusWord(text) && !chips.has(text) && arr.indexOf(text) === i,
  )
  for (const text of tryList) {
    const path = findStraightSpelling(letters, text)
    if (path) return { text, path }
  }
  return null
}

async function readGrid(page) {
  return page.evaluate(() => {
    const size = 8
    const grid = []
    for (let r = 0; r < size; r += 1) {
      const row = []
      for (let c = 0; c < size; c += 1) {
        const el = document.querySelector(`[data-gem-cell][data-r="${r}"][data-c="${c}"] .gem-letter`)
        row.push((el?.textContent ?? '').trim())
      }
      grid.push(row)
    }
    return grid
  })
}

async function goldPathToWordSearch(page) {
  if (await page.locator('.welcome').count()) {
    await tapFilledGold(page)
  }
  await page.locator('main.hub').waitFor({ timeout: 15000 })
  const findWords = page.getByRole('button', { name: /Find the words/i })
  if (await findWords.count()) {
    await findWords.first().click()
  } else {
    await page.locator('button.btn.xl', { hasText: /^Match$/ }).click({ force: true })
  }
  await page.locator('.gem-board').waitFor({ timeout: 15000 })
}

async function captureViewport(browser, origin, width, height) {
  const context = await browser.newContext({
    viewport: { width, height },
    hasTouch: true,
    isMobile: true,
  })
  await context.addInitScript(
    ([key, raw]) => {
      localStorage.clear()
      localStorage.setItem(key, raw)
    },
    [STORAGE_KEY, JSON.stringify(goldPathSave())],
  )
  const page = await context.newPage()
  await page.goto(`${origin}?gemSeed=${SEED}`)
  await goldPathToWordSearch(page)

  const board = buildGemPuzzle(LINE, SEED)
  const bonus = pickGenericBonus(board)
  assert.ok(bonus, 'seeded board has a generic planted bonus')
  await page.screenshot({ path: join(OUT, `board-${width}x${height}.png`) })
  await tapPath(page, bonus.path)
  await page.waitForTimeout(900)
  const toast = (
    (await page.locator('.match-toast.gem-toast, .miss-banner, .bonus-banner').first().textContent().catch(() => '')) ||
    ''
  )
    .replace(/\s+/g, ' ')
    .trim()
  assert.match(toast, /\+50|BONUS!/i, `bonus toast after ${bonus.text}: ${toast || 'none'}`)
  const shot = join(OUT, `bonus-${bonus.text}-${width}x${height}.png`)
  await page.screenshot({ path: shot })
  await context.close()
  return shot
}

async function main() {
  mkdirSync(OUT, { recursive: true })
  const server = await createServer({
    server: { host: '127.0.0.1', port: 0 },
    logLevel: 'warn',
  })
  await server.listen()
  const address = server.httpServer?.address()
  const port = typeof address === 'object' && address ? address.port : 5173
  const origin = `http://127.0.0.1:${port}/`
  const browser = await launchBrowser()
  const paths = []
  try {
    for (const [w, h] of VIEWPORTS) {
      paths.push(await captureViewport(browser, origin, w, h))
    }
  } finally {
    await browser.close()
    await server.close()
  }
  for (const p of paths) console.log(p)
  console.log(`capture-hop-753: ${paths.length} shots → ${OUT}`)
}

await main()
