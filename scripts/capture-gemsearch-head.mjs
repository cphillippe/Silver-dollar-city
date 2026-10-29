#!/usr/bin/env node
/**
 * Proof shots for Easy Match tapfix at HEAD — mid after first find + win after tap.
 * Writes to GEMSEARCH_HEAD_DIR (default: os.tmpdir()/gemsearch-fix/head).
 */
import assert from 'node:assert/strict'
import { mkdirSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { chromium } from '@playwright/test'
import { createServer } from 'vite'
import { STORAGE_KEY } from '../src/config/app.ts'
import { buildGemPuzzle, gemWordsFor } from '../src/lib/gemSearch.ts'
import { packLesson } from '../src/content/packCatalog.ts'
import { withPlaytest1 } from './dev-ui-playtest.mjs'

const LESSONS = ['ph-seeds', 'ob-tuning', 'hl-mind']
const VIEWPORTS = [
  [375, 667],
  [390, 844],
  [412, 915],
]
const OUT = process.env.GEMSEARCH_HEAD_DIR ?? join(tmpdir(), 'gemsearch-fix', 'head')
const JAR_SETTLE_MS = 1500

function savePayload() {
  const now = new Date()
  const today = [now.getFullYear(), String(now.getMonth() + 1).padStart(2, '0'), String(now.getDate()).padStart(2, '0')].join('-')
  return {
    kind: 'silver-city-save',
    schemaVersion: 1,
    appVersion: '1.4.546',
    savedAt: now.toISOString(),
    progress: {
      started: true,
      easyMode: true,
      lastDailyDate: today,
      dailyDates: [today],
      completed: [],
      held: [],
      easyTaught: [],
      easyHeld: [],
      taught: [],
      journal: [],
      learnings: [],
      memory: {},
      matchLifetime: 0,
      matchSkillSeen: 0,
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

async function pointerClick(page, locator) {
  await locator.scrollIntoViewIfNeeded()
  const box = await locator.boundingBox()
  assert.ok(box && box.width > 0 && box.height > 0, 'pointer target has no box')
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
  await page.mouse.down()
  await page.mouse.up()
}

async function openLesson(page, origin, lineId, seed = 0) {
  await page.goto(withPlaytest1(`${origin}?gemSeed=${seed}`))
  await page.getByRole('main', { name: 'Home' }).waitFor()
  await pointerClick(page, page.getByRole('button', { name: 'Settings', exact: true }))
  await pointerClick(page, page.locator('details.settings-debug summary'))
  const title = packLesson(lineId)?.title ?? lineId
  await pointerClick(
    page,
    page.locator('details.settings-debug').getByRole('button', { name: new RegExp(`^${lineId} ·`) }).first(),
  )
  await page.locator('.gem-board').waitFor()
  const board = buildGemPuzzle(lineId, seed)
  assert.equal(
    (await page.evaluate(() => [...document.querySelectorAll('.gem-letter')].map((n) => n.textContent).join(''))),
    board.letters.map((row) => row.join('')).join(''),
    `${lineId} board matches gemSeed ${seed}`,
  )
  return board
}

function locateWord(letters, word) {
  const size = letters.length
  for (let r = 0; r < size; r += 1) {
    for (let c = 0; c < size; c += 1) {
      for (const [dr, dc] of [
        [0, 1],
        [1, 0],
        [1, 1],
        [0, -1],
        [-1, 0],
        [-1, -1],
        [1, -1],
        [-1, 1],
      ]) {
        const path = []
        let ok = true
        for (let i = 0; i < word.length; i += 1) {
          const rr = r + dr * i
          const cc = c + dc * i
          if (rr < 0 || rr >= size || cc < 0 || cc >= size || letters[rr][cc] !== word[i]) {
            ok = false
            break
          }
          path.push({ r: rr, c: cc })
        }
        if (ok && path.length === word.length) return path
      }
    }
  }
  return null
}

async function cellCentre(page, cell) {
  const box = await page.locator(`[data-gem-cell][data-r="${cell.r}"][data-c="${cell.c}"]`).boundingBox()
  assert.ok(box, `cell ${cell.r}:${cell.c} has no box`)
  return { x: box.x + box.width / 2, y: box.y + box.height / 2 }
}

async function tapPath(page, path) {
  for (const cell of path) {
    const at = await cellCentre(page, cell)
    await page.touchscreen.tap(at.x, at.y)
    await page.waitForTimeout(280)
  }
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

async function assertWinDockOnScreen(page, tag) {
  const dock = await page.evaluate(() => {
    const ih = window.innerHeight
    const pick = (sel) => {
      const el = document.querySelector(sel)
      if (!el) return null
      const r = el.getBoundingClientRect()
      return { top: r.top, bottom: r.bottom, ok: r.top >= 0 && r.bottom <= ih + 1 }
    }
    return {
      lockIn: pick('.play.is-gem-search.is-win .cta-dock .btn.primary'),
      home: pick('.play.is-gem-search.is-win .cta-dock .btn.xl:not(.primary):not(.more-match)'),
      ih,
    }
  })
  assert.ok(dock.lockIn?.ok, `${tag} Lock In on screen (${JSON.stringify(dock.lockIn)})`)
  assert.ok(dock.home?.ok, `${tag} Home on screen (${JSON.stringify(dock.home)})`)
}

async function snapMid(page, lineId, w, h) {
  const letters = buildGemPuzzle(lineId, 0).letters
  const first = gemWordsFor(lineId)[0]?.text
  assert.ok(first, `${lineId} has words`)
  const path = locateWord(letters, first)
  assert.ok(path, `${lineId} locates ${first}`)
  await tapPath(page, path)
  await page.waitForTimeout(900)
  await page.locator('.match-teach-chip.is-found').first().waitFor()
  const file = join(OUT, `${lineId}-${w}x${h}-mid.png`)
  await page.screenshot({ path: file, fullPage: false })
  return file
}

async function snapWin(page, lineId, w, h) {
  const words = gemWordsFor(lineId).map((w) => w.text)
  for (const word of words) {
    if (await page.locator('.play.is-gem-search.is-win').count()) break
    const path = locateWord(await readGrid(page), word)
    assert.ok(path, `${lineId} locates ${word}`)
    await tapPath(page, path)
    await page.waitForTimeout(900)
  }
  await page.locator('.play.is-gem-search.is-win').waitFor({ timeout: 12000 })
  await page.waitForFunction(() => document.querySelectorAll('.gem-cell.is-burst').length === 0)
  await page.waitForTimeout(JAR_SETTLE_MS)
  await assertWinDockOnScreen(page, `${lineId} ${w}x${h} win`)
  const file = join(OUT, `${lineId}-${w}x${h}-win-tap.png`)
  await page.screenshot({ path: file, fullPage: false })
  return file
}

export async function captureGemsearchHead() {
  mkdirSync(OUT, { recursive: true })
  const server = await createServer({
    server: { host: '127.0.0.1', port: 0 },
    cacheDir: 'node_modules/.vite-gem-head',
    logLevel: 'warn',
  })
  await server.listen()
  const address = server.httpServer?.address()
  const port = address && typeof address === 'object' ? address.port : 0
  const origin = `http://127.0.0.1:${port}/`
  const browser = await launchBrowser()
  const paths = []
  try {
    for (const [w, h] of VIEWPORTS) {
      for (const lineId of LESSONS) {
        for (const kind of ['mid', 'win']) {
          const context = await browser.newContext({
            viewport: { width: w, height: h },
            hasTouch: true,
            isMobile: true,
          })
          await context.addInitScript(({ key, payload }) => {
            window.localStorage.setItem(key, JSON.stringify(payload))
          }, { key: STORAGE_KEY, payload: savePayload() })
          const page = await context.newPage()
          await openLesson(page, origin, lineId, 0)
          if (kind === 'mid') paths.push(await snapMid(page, lineId, w, h))
          else paths.push(await snapWin(page, lineId, w, h))
          await context.close()
        }
      }
    }
  } finally {
    await browser.close()
    await server.close()
  }
  for (const p of paths) console.log(p)
  console.log(`capture-gemsearch-head: ${paths.length} shots in ${OUT}`)
}

if (import.meta.url.startsWith('file:') && process.argv[1]?.endsWith('capture-gemsearch-head.mjs')) {
  await captureGemsearchHead()
}
