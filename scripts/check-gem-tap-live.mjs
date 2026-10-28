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
const SHOT_ROOT = process.env.GEM_TAP_SHOT_ROOT ?? join(tmpdir(), 'gemsearch-fix')
const POP_SHOT_ROOT =
  process.env.GEM_POP_SHOT_ROOT ?? join(tmpdir(), 'gemsearch-fix', 'pops')

function savePayload() {
  const now = new Date()
  const today = [now.getFullYear(), String(now.getMonth() + 1).padStart(2, '0'), String(now.getDate()).padStart(2, '0')].join('-')
  return {
    kind: 'silver-city-save',
    schemaVersion: 1,
    appVersion: '1.4.550',
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
  const steps = path.length <= 3 ? 12 : 5
  const first = await cellCentre(page, path[0])
  await page.mouse.move(first.x, first.y)
  await page.mouse.down()
  for (const cell of path.slice(1)) {
    const at = await cellCentre(page, cell)
    await page.mouse.move(at.x, at.y, { steps })
  }
  await page.waitForTimeout(40)
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
    const play = document.querySelector('.play.is-gem-search.is-panel-blast')
    const dock = document.querySelector('.match-teach-dock, .story-strip.is-dock')
    const score = document.querySelector('.match-score, .gem-jar-slot')
    const cb = cell?.getBoundingClientRect()
    const bb = board?.getBoundingClientRect()
    const sb = stage?.getBoundingClientRect()
    const pr = play?.getBoundingClientRect()
    const style = play ? getComputedStyle(play) : null
    const padL = style ? parseFloat(style.paddingLeft) || 0 : 0
    const padR = style ? parseFloat(style.paddingRight) || 0 : 0
    const playTop = dock?.getBoundingClientRect().bottom ?? pr?.top ?? 0
    const playBottom = score?.getBoundingClientRect().top ?? pr?.bottom ?? window.innerHeight
    const playH = Math.max(0, playBottom - playTop)
    return {
      cellW: cb ? Math.round(cb.width) : 0,
      cellH: cb ? Math.round(cb.height) : 0,
      boardH: bb ? Math.round(bb.height) : 0,
      boardW: bb ? Math.round(bb.width) : 0,
      boardLeft: bb ? Math.round(bb.left) : 0,
      boardRight: bb ? Math.round(bb.right) : 0,
      cardInnerLeft: pr ? Math.round(pr.left + padL) : 0,
      cardInnerRight: pr ? Math.round(pr.right - padR) : 0,
      playH: Math.round(playH),
      stageH: sb ? Math.round(sb.height) : 0,
      boardY: bb ? Math.round(bb.y) : 0,
      vh: window.innerHeight,
      docH: document.documentElement.scrollHeight,
      scrollY: window.scrollY,
    }
  })
}

async function assertBoardInCard(page, tag) {
  const m = await layoutMetrics(page)
  assert.ok(m.boardW > 0, `${tag} board has width`)
  assert.ok(
    m.boardLeft >= m.cardInnerLeft - 1 && m.boardRight <= m.cardInnerRight + 1,
    `${tag} board inside card padding (${m.boardLeft}-${m.boardRight} in ${m.cardInnerLeft}-${m.cardInnerRight})`,
  )
}

async function assertPlayAreaFill(page, tag) {
  const m = await layoutMetrics(page)
  assert.ok(m.playH > 0, `${tag} play band has height`)
  const innerW = m.cardInnerRight - m.cardInnerLeft
  const target = Math.min(innerW, m.playH)
  assert.ok(
    Math.min(m.boardW, m.boardH) >= target * 0.7 - 4,
    `${tag} board fills >=70% of dock-to-score band (${Math.min(m.boardW, m.boardH)}/${target})`,
  )
}

async function assertNoPopOverlap(page, tag) {
  const hit = await page.evaluate(() => {
    const cells = [...document.querySelectorAll('[data-gem-cell]')].map((el) => el.getBoundingClientRect())
    const pops = [
      ...document.querySelectorAll('.gem-hint-slot .gem-score-pop, .gem-hint-slot .gem-find-pop, .gem-hint-slot .bonus-plus'),
      ...document.querySelectorAll('.gem-hint-slot .gem-combo, .gem-hint-slot .bonus-banner, .gem-hint-slot .miss-banner, .gem-hint-slot .match-toast'),
      ...document.querySelectorAll('.gem-score-pop, .gem-find-pop, .bonus-plus'),
      ...document.querySelectorAll('.gem-stage .bonus-banner, .gem-stage .miss-banner, .gem-stage .match-toast'),
    ]
      .filter((el) => {
        const style = getComputedStyle(el)
        return style.display !== 'none' && style.visibility !== 'hidden' && Number(style.opacity) > 0.05
      })
      .map((el) => el.getBoundingClientRect())
    for (const pop of pops) {
      if (pop.width < 1 || pop.height < 1) continue
      for (const cell of cells) {
        if (cell.width < 1) continue
        if (cell.left < pop.right && cell.right > pop.left && cell.top < pop.bottom && cell.bottom > pop.top) {
          return true
        }
      }
    }
    return false
  })
  assert.equal(hit, false, `${tag} no score pop overlaps a cell`)
}

async function assertNoBannerOverlap(page, tag) {
  const hit = await page.evaluate(() => {
    const cells = [...document.querySelectorAll('[data-gem-cell]')].map((el) => el.getBoundingClientRect())
    const banners = [
      ...document.querySelectorAll('.gem-hint-slot .bonus-banner, .gem-hint-slot .miss-banner, .gem-hint-slot .match-toast, .gem-hint-slot .gem-combo'),
      ...document.querySelectorAll('.gem-stage .bonus-banner, .gem-stage .miss-banner, .gem-stage .match-toast'),
    ]
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
    const before = await foundCount(page)
    if (mode === 'drag') await dragPath(page, path)
    else await tapPath(page, path, true)
    await page.waitForTimeout(mode === 'drag' ? 1100 : 900)
    let after = await foundCount(page)
    if (after === before && mode === 'drag') {
      await dragPath(page, path)
      await page.waitForTimeout(1100)
      after = await foundCount(page)
    }
    assert.equal(after, i + 1, `${lineId} ${mode} ${word} => ${i + 1}/4 (saw ${after})`)
    if (i === 0) {
      const after = await layoutMetrics(page)
      assert.equal(after.boardY, boardY0, `${lineId} board Y stable after first find (${boardY0} -> ${after.boardY})`)
      const hint = page.locator('[data-gem-start]')
      assert.equal(await hint.count(), 1, `${lineId} hint slot stays mounted`)
      assert.match((await hint.innerText()).trim(), /^\s*$/, `${lineId} hint text clears but slot remains`)
    }
    await assertNoBannerOverlap(page, `${lineId} ${word}`)
    await assertNoPopOverlap(page, `${lineId} ${word}`)
  }
  await page.locator('.play.is-gem-search.is-win').waitFor({ timeout: 15000 })
}

async function tapCell(page, cell) {
  const at = await cellCentre(page, cell)
  await page.touchscreen.tap(at.x, at.y)
}

async function assertWinNoScroll(page, tag) {
  await page.waitForTimeout(600)
  const bad = await page.evaluate(() => {
    const hits = []
    for (const sel of ['.challenge-page.is-puzzle', '.play.is-gem-search.is-win']) {
      const el = document.querySelector(sel)
      if (!el) continue
      if (el.scrollWidth > el.clientWidth + 1) hits.push(`${sel}-x`)
      if (el.scrollHeight > el.clientHeight + 1) hits.push(`${sel}-y`)
    }
    const card = document.querySelector('.play.is-gem-search.is-win .match-yes')
    if (card && (card.scrollWidth > card.clientWidth + 1 || card.scrollHeight > card.clientHeight + 1)) {
      hits.push('match-yes')
    }
    return hits
  })
  assert.deepEqual(bad, [], `${tag} win without scrollbars (${bad.join(', ')})`)
}

async function assertObTuningMisdragThenDrag(page, origin) {
  mkdirSync(POP_SHOT_ROOT, { recursive: true })
  await openLesson(page, origin, 'ob-tuning', 0)
  const board = buildGemPuzzle('ob-tuning', 0)
  const lark = board.words.find((word) => word.text === 'LARK')
  const steps = board.words.find((word) => word.text === 'STEPS')
  assert.ok(lark && steps, 'ob-tuning LARK and STEPS')
  await dragPath(page, board.paths[lark.id])
  await page.waitForTimeout(900)
  assert.equal(await foundCount(page), 1, 'LARK found by drag')
  const wrong = [
    { r: 0, c: 0 },
    { r: 0, c: 1 },
    { r: 0, c: 2 },
  ]
  await dragPath(page, wrong)
  await page.waitForTimeout(600)
  await dragPath(page, board.paths[steps.id])
  await page.waitForTimeout(1100)
  const after = await foundCount(page)
  if (after < 2) {
    await dragPath(page, board.paths[steps.id])
    await page.waitForTimeout(1100)
  }
  assert.equal(await foundCount(page), 2, 'STEPS drag works after mis-drag')
  await page.screenshot({ path: join(POP_SHOT_ROOT, 'ob-tuning-375-misdrag-then-drag.png') })
}

async function assertStepDragThenSteps(page, origin, w, shot = false) {
  mkdirSync(POP_SHOT_ROOT, { recursive: true })
  await openLesson(page, origin, 'ob-tuning', 0)
  const board = buildGemPuzzle('ob-tuning', 0)
  const steps = board.words.find((word) => word.text === 'STEPS')
  assert.ok(steps, 'ob-tuning STEPS chip')
  const full = board.paths[steps.id]
  const stepPath = full.slice(0, 4)
  await dragPath(page, stepPath)
  await page.waitForTimeout(800)
  assert.equal(await page.locator('.miss-banner').count(), 0, 'STEP drag release scores without Miss')
  assert.ok((await page.locator('.bonus-banner').count()) >= 1, 'STEP drag scores bonus banner')
  assert.equal(await foundCount(page), 0, 'STEP is bonus not a chip find')
  await dragPath(page, full)
  await page.waitForTimeout(900)
  assert.equal(await foundCount(page), 1, 'STEPS chip scores after STEP bonus')
  if (shot) {
    await page.screenshot({ path: join(POP_SHOT_ROOT, `ob-tuning-${w}-step-then-steps.png`) })
  }
}

async function assertStepPrefixThenStepsTap(page, origin) {
  await openLesson(page, origin, 'ob-tuning', 0)
  const board = buildGemPuzzle('ob-tuning', 0)
  const steps = board.words.find((word) => word.text === 'STEPS')
  const path = board.paths[steps.id]
  assert.ok(path.length >= 5, 'STEPS path length')
  for (const cell of path.slice(0, 4)) {
    await tapCell(page, cell)
    await page.waitForTimeout(300)
    assert.equal(await page.locator('.bonus-banner').count(), 0, 'STEP prefix tap scores no bonus banner')
  }
  await tapCell(page, path[4])
  await page.waitForTimeout(900)
  assert.equal(await foundCount(page), 1, 'STEPS completes after STEP prefix taps')
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
          const minCellH = w >= 390 ? 44 : 42
          assert.ok(
            layout0.cellW >= 42 && layout0.cellH >= minCellH,
            `${lineId} ${w}x${h} cells >= 42×${minCellH} (${layout0.cellW}x${layout0.cellH})`,
          )
          assert.ok(Math.abs(layout0.cellW - layout0.cellH) <= 1, `${lineId} ${w}x${h} cells square (${layout0.cellW}x${layout0.cellH})`)
          await assertBoardInCard(page, `${lineId} ${w}x${h}`)
          await assertPlayAreaFill(page, `${lineId} ${w}x${h}`)
          assert.ok(layout0.docH <= layout0.vh + 2 && layout0.scrollY === 0, `${lineId} ${w}x${h} no page scroll`)
          await playWords(page, lineId, mode)
          await assertWinNoScroll(page, `${lineId} ${w}x${h} ${mode}`)
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
          await assertBoardInCard(page, `${lineId} ${w}x${h} mid`)
          await assertPlayAreaFill(page, `${lineId} ${w}x${h} mid`)
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
          await assertBoardInCard(page, `${lineId} ${w}x${h} mid`)
          await assertPlayAreaFill(page, `${lineId} ${w}x${h} mid`)
          await page.screenshot({ path: join(SHOT_ROOT, `${lineId}-${w}-mid-after-find.png`) })
          await context.close()
        }
      }
    }
    {
      const context = await browser.newContext({
        viewport: { width: 375, height: 812 },
        hasTouch: true,
        isMobile: true,
      })
      await context.addInitScript(({ key, payload }) => {
        window.localStorage.setItem(key, JSON.stringify(payload))
      }, { key: STORAGE_KEY, payload: savePayload() })
      const page = await context.newPage()
      page.on('pageerror', (err) => errors.push(String(err)))
      await assertObTuningMisdragThenDrag(page, origin)
      await context.close()
    }
    {
      const context = await browser.newContext({
        viewport: { width: 390, height: 844 },
        hasTouch: true,
        isMobile: true,
      })
      await context.addInitScript(({ key, payload }) => {
        window.localStorage.setItem(key, JSON.stringify(payload))
      }, { key: STORAGE_KEY, payload: savePayload() })
      const page = await context.newPage()
      page.on('pageerror', (err) => errors.push(String(err)))
      await assertStepPrefixThenStepsTap(page, origin)
      await context.close()
    }
    for (const w of [375, 390]) {
      const context = await browser.newContext({
        viewport: { width: w, height: w === 375 ? 667 : 844 },
        isMobile: true,
      })
      await context.addInitScript(({ key, payload }) => {
        window.localStorage.setItem(key, JSON.stringify(payload))
      }, { key: STORAGE_KEY, payload: savePayload() })
      const page = await context.newPage()
      page.on('pageerror', (err) => errors.push(String(err)))
      await assertStepDragThenSteps(page, origin, w, true)
      await context.close()
    }
  } finally {
    await browser.close()
    await server.close()
  }
  assert.equal(errors.join('\n'), '', 'gem tap live: no page errors')
  console.log('check-gem-tap-live: ok')
}

if (import.meta.url.startsWith('file:') && process.argv[1]?.endsWith('check-gem-tap-live.mjs')) {
  await checkGemTapLive()
}
