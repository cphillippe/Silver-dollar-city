#!/usr/bin/env node
/**
 * Easy word search tap path + chip-prefix bonus guard (ph-seeds, ob-tuning, hl-mind).
 * Real pointer / touch only. Boards pinned with ?gemSeed=0.
 */
import assert from 'node:assert/strict'
import { mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { chromium } from '@playwright/test'
import { createServer } from 'vite'
import { STORAGE_KEY } from '../src/config/app.ts'
import { buildGemPuzzle, gemWordsFor } from '../src/lib/gemSearch.ts'
import { packLesson } from '../src/content/packCatalog.ts'

const LESSONS = ['ph-seeds', 'ob-tuning', 'hl-mind']
const VIEWPORTS = [
  [375, 667],
  [390, 844],
]
const SHOT_ROOT =
  process.env.GEM_TAP_SHOT_ROOT ??
  (process.env.CI ? join(tmpdir(), 'gemsearch-fix') : '/cursor/stores/self/gemsearch-fix')

function savePayload() {
  const now = new Date()
  const today = [now.getFullYear(), String(now.getMonth() + 1).padStart(2, '0'), String(now.getDate()).padStart(2, '0')].join('-')
  return {
    kind: 'silver-city-save',
    schemaVersion: 1,
    appVersion: '1.4.543',
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
  await page.goto(`${origin}?gemSeed=${seed}`)
  await page.getByRole('main', { name: 'Home' }).waitFor()
  await pointerClick(page, page.getByRole('button', { name: 'Settings', exact: true }))
  await pointerClick(page, page.locator('details.settings-debug summary'))
  const label = packLesson(lineId)?.title ?? lineId
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

async function dragPath(page, path) {
  const first = await cellCentre(page, path[0])
  await page.mouse.move(first.x, first.y)
  await page.mouse.down()
  for (const cell of path.slice(1)) {
    const at = await cellCentre(page, cell)
    await page.mouse.move(at.x, at.y, { steps: 5 })
  }
  await page.mouse.up()
}

async function tapPath(page, path, touch = false) {
  for (const cell of path) {
    const at = await cellCentre(page, cell)
    if (touch) {
      await page.touchscreen.tap(at.x, at.y)
    } else {
      await page.mouse.move(at.x, at.y)
      await page.mouse.down()
      await page.mouse.up()
    }
    await page.waitForTimeout(250)
  }
}

async function foundCount(page) {
  return page.locator('.match-teach-chip.is-found').count()
}

async function layoutMetrics(page) {
  return page.evaluate(() => {
    const cell = document.querySelector('[data-gem-cell]')
    const board = document.querySelector('.gem-board')
    const stage = document.querySelector('.gem-stage')
    const cb = cell?.getBoundingClientRect()
    const bb = board?.getBoundingClientRect()
    const sb = stage?.getBoundingClientRect()
    return {
      cellW: cb ? Math.round(cb.width) : 0,
      cellH: cb ? Math.round(cb.height) : 0,
      boardH: bb ? Math.round(bb.height) : 0,
      stageH: sb ? Math.round(sb.height) : 0,
      boardY: bb ? Math.round(bb.y) : 0,
      vh: window.innerHeight,
      docH: document.documentElement.scrollHeight,
      scrollY: window.scrollY,
    }
  })
}

async function assertNoBannerOverlap(page, tag) {
  const hit = await page.evaluate(() => {
    const cells = [...document.querySelectorAll('[data-gem-cell]')].map((el) => el.getBoundingClientRect())
    const banners = [...document.querySelectorAll('.gem-stage .bonus-banner, .gem-stage .miss-banner, .gem-stage .match-toast')]
      .filter((el) => {
        const style = getComputedStyle(el)
        return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0'
      })
      .map((el) => el.getBoundingClientRect())
    for (const banner of banners) {
      if (banner.width < 1 || banner.height < 1) continue
      for (const cell of cells) {
        if (cell.width < 1) continue
        if (cell.left < banner.right && cell.right > banner.left && cell.top < banner.bottom && cell.bottom > banner.top) {
          return true
        }
      }
    }
    return false
  })
  assert.equal(hit, false, `${tag} no banner overlaps a cell`)
}

async function playWords(page, lineId, mode) {
  const letters = await page.evaluate(() => {
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
  const words = gemWordsFor(lineId).map((w) => w.text)
  let boardY0 = null
  for (let i = 0; i < words.length; i += 1) {
    const word = words[i]
    const path = locateWord(letters, word)
    assert.ok(path, `${lineId} locates ${word}`)
    if (boardY0 == null) {
      boardY0 = (await layoutMetrics(page)).boardY
    }
    if (mode === 'drag') await dragPath(page, path)
    else await tapPath(page, path, true)
    await page.waitForTimeout(900)
    assert.equal(await foundCount(page), i + 1, `${lineId} ${mode} ${word} => ${i + 1}/4`)
    if (i === 0) {
      const after = await layoutMetrics(page)
      assert.equal(after.boardY, boardY0, `${lineId} board Y stable after first find (${boardY0} -> ${after.boardY})`)
      const hint = page.locator('[data-gem-start]')
      assert.equal(await hint.count(), 1, `${lineId} hint slot stays mounted`)
      assert.match((await hint.innerText()).trim(), /^\s*$/, `${lineId} hint text clears but slot remains`)
    }
    await assertNoBannerOverlap(page, `${lineId} ${word}`)
  }
  await page.locator('.play.is-gem-search.is-win').waitFor({ timeout: 8000 })
}

async function assertPrefixDragNoBonus(page, lineId, word) {
  const letters = await page.evaluate(() => {
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
  const path = locateWord(letters, word)
  assert.ok(path && path.length >= 4, `${lineId} locates ${word}`)
  const prefix = path.slice(0, 3)
  const before = await foundCount(page)
  await dragPath(page, prefix)
  await page.waitForTimeout(700)
  assert.equal(await foundCount(page), before, `${lineId} ${word.slice(0, 3)} prefix drag scores no chip`)
  assert.equal(await page.locator('.bonus-banner').count(), 0, `${lineId} ${word.slice(0, 3)} prefix drag scores no bonus`)
}

export async function checkGemTapLive() {
  mkdirSync(SHOT_ROOT, { recursive: true })
  const server = await createServer({
    server: { host: '127.0.0.1', port: 0 },
    cacheDir: 'node_modules/.vite-gem-tap',
    logLevel: 'warn',
  })
  await server.listen()
  const address = server.httpServer?.address()
  const port = address && typeof address === 'object' ? address.port : 0
  assert.ok(port > 0, 'gem tap server has a port')
  const origin = `http://127.0.0.1:${port}/`
  const browser = await launchBrowser()
  const errors = []
  try {
    for (const [w, h] of VIEWPORTS) {
      for (const lineId of LESSONS) {
        for (const mode of ['tap', 'drag']) {
          const context = await browser.newContext({
            viewport: { width: w, height: h },
            hasTouch: mode === 'tap',
            isMobile: true,
          })
          await context.addInitScript(({ key, payload }) => {
            window.localStorage.setItem(key, JSON.stringify(payload))
          }, { key: STORAGE_KEY, payload: savePayload() })
          const page = await context.newPage()
          page.on('pageerror', (err) => errors.push(String(err)))
          await openLesson(page, origin, lineId, 0)
          const layout0 = await layoutMetrics(page)
          assert.ok(layout0.cellW >= 42 && layout0.cellH >= 42, `${lineId} ${w}x${h} cells >= 42px (${layout0.cellW}x${layout0.cellH})`)
          assert.ok(Math.abs(layout0.cellW - layout0.cellH) <= 1, `${lineId} ${w}x${h} cells square (${layout0.cellW}x${layout0.cellH})`)
          assert.ok(layout0.stageH >= layout0.vh * 0.7 - 2, `${lineId} ${w}x${h} stage >= 70vh (${layout0.stageH}/${layout0.vh})`)
          assert.ok(layout0.docH <= layout0.vh + 2 && layout0.scrollY === 0, `${lineId} ${w}x${h} no page scroll`)
          await playWords(page, lineId, mode)
          await page.screenshot({ path: join(SHOT_ROOT, `${lineId}-${w}-win-${mode}.png`) })
          await context.close()
        }
        if (lineId === 'ph-seeds' && w === 375) {
          const context = await browser.newContext({ viewport: { width: w, height: h }, isMobile: true })
          await context.addInitScript(({ key, payload }) => {
            window.localStorage.setItem(key, JSON.stringify(payload))
          }, { key: STORAGE_KEY, payload: savePayload() })
          const page = await context.newPage()
          await openLesson(page, origin, lineId, 0)
          await dragPath(page, locateWord(buildGemPuzzle(lineId, 0).letters, 'MICAH'))
          await page.waitForTimeout(900)
          await page.screenshot({ path: join(SHOT_ROOT, `${lineId}-${w}-mid-after-find.png`) })
          await assertPrefixDragNoBonus(page, lineId, 'PARABLE')
          await assertPrefixDragNoBonus(page, lineId, 'KINGDOM')
          await context.close()
        }
        if (lineId === 'ob-tuning' && w === 390) {
          const context = await browser.newContext({ viewport: { width: w, height: h }, isMobile: true })
          await context.addInitScript(({ key, payload }) => {
            window.localStorage.setItem(key, JSON.stringify(payload))
          }, { key: STORAGE_KEY, payload: savePayload() })
          const page = await context.newPage()
          await openLesson(page, origin, lineId, 0)
          await dragPath(page, locateWord(buildGemPuzzle(lineId, 0).letters, 'LARK'))
          await page.waitForTimeout(900)
          await page.screenshot({ path: join(SHOT_ROOT, `${lineId}-${w}-mid-after-find.png`) })
          await context.close()
        }
      }
    }
  } finally {
    await browser.close()
    await server.close()
  }
  assert.equal(errors.join('\n'), '', 'gem tap live: no page errors')
  console.log('check-gem-tap-live: ok')
}
