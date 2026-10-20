/**
 * Built-app gold follower. Fresh save, 375×667 and 390×844.
 * Taps only the one visible filled gold. Play screens are scripted.
 */
import assert from 'node:assert/strict'
import { mkdirSync, writeFileSync } from 'node:fs'
import { chromium } from 'playwright'
import { build, preview } from 'vite'
import { evidenceForTier } from '../src/content/evidence.ts'
import { dailyForDate } from '../src/content/daily.ts'
import { findStraightSpelling } from '../src/lib/gemSearchGrid.ts'
import { gemWordsFor } from '../src/lib/gemSearch.ts'
import { EASY, easyChromeLine, easyWhyLine } from '../src/lib/easy.ts'
import { localDateKey } from '../src/lib/dates.ts'
import { SAVE_KIND } from '../src/lib/save.ts'
import { SAVE_SCHEMA_VERSION, STORAGE_KEY } from '../src/config/app.ts'

const SIZES = [
  [375, 667],
  [390, 844],
  [412, 915],
  [768, 1024],
]
const SHOTS = '/opt/cursor/artifacts/screenshots'

function playScreens(id) {
  return id === 'maze' || id === 'run' || id === 'gem' || id === 'quiz' || id === 'sort' || id === 'match' || id === 'sequence'
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
      hits.push({
        text: (el.innerText || el.getAttribute('aria-label') || '').replace(/\s+/g, ' ').trim(),
        w: Math.round(box.width),
        h: Math.round(box.height),
        disabled: Boolean(el.disabled),
      })
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
  if (!el) throw new Error('filled gold disappeared before the tap')
  await el.scrollIntoViewIfNeeded()
  const box = await el.boundingBox()
  await handle.dispose()
  if (!box) throw new Error('filled gold disappeared before the tap')
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2)
  return golds[0]
}

async function screenId(page) {
  return page.evaluate(() => {
    const main = document.querySelector('main')
    if (document.querySelector('.defend-page')) return 'night-watch'
    if (document.querySelector('.welcome')) return 'welcome'
    if (document.querySelector('.play.is-road-maze.is-win')) return 'maze-win'
    if (document.querySelector('.play.is-road-maze')) return 'maze'
    if (document.querySelector('.play.is-father-run.is-win')) return 'run-win'
    if (document.querySelector('.run-miss')) return 'run-fail'
    if (document.querySelector('.play.is-father-run')) return 'run'
    if (document.querySelector('.play.is-gem-search.is-win')) return 'gem-win'
    if (document.querySelector('.play.is-gem-search')) return 'gem'
    if (document.querySelector('.play.is-easy-sort.is-win, .play.is-easy-sort.is-ready')) return 'sort-done'
    if (document.querySelector('.play.is-easy-sort')) return 'sort'
    if (document.querySelector('.play.is-match.is-win')) return 'match-win'
    if (document.querySelector('.play.is-match')) return 'match'
    if (document.querySelector('.strip-board.is-win')) return 'sequence-win'
    if (document.querySelector('.strip-board')) return 'sequence'
    if (document.querySelector('.why-blast.is-yes, .why-blast.is-win')) return 'quiz-done'
    if (document.querySelector('.why-blast')) return 'quiz'
    if (document.querySelector('.daily-page.is-teach, .teach-gate')) return 'read-teach'
    if (document.querySelector('.daily-page')) return 'read'
    if (main?.classList.contains('hub')) return 'home'
    if (document.querySelector('.settings, main.settings')) return 'settings'
    return main?.getAttribute('aria-label') || main?.className || 'unknown'
  })
}

async function signature(page) {
  const id = await screenId(page)
  const golds = await filledGolds(page)
  const detail = await page.evaluate(() => {
    const claim = document.querySelector('.why-claim, .recall-line, .teach-reason')?.textContent || ''
    const whisper = document.querySelector('.easy-home-whisper')?.textContent || ''
    return `${claim} ${whisper}`.replace(/\s+/g, ' ').trim().slice(0, 80)
  })
  return { id, golds, detail, sig: `${id}|${golds.map((gold) => gold.text).join('/')}||${detail}` }
}

function key(cell) {
  return `${cell.r}:${cell.c}`
}

function shortest(from, to, open) {
  const start = key(from)
  const goal = key(to)
  if (!open.has(start) || !open.has(goal)) return null
  if (start === goal) return [from]
  const dirs = [
    { r: -1, c: 0 },
    { r: 1, c: 0 },
    { r: 0, c: -1 },
    { r: 0, c: 1 },
  ]
  const seen = new Set([start])
  const queue = [[from]]
  while (queue.length) {
    const trail = queue.shift()
    const last = trail[trail.length - 1]
    for (const dir of dirs) {
      const next = { r: last.r + dir.r, c: last.c + dir.c }
      const nextKey = key(next)
      if (!open.has(nextKey) || seen.has(nextKey)) continue
      const walk = [...trail, next]
      if (nextKey === goal) return walk
      seen.add(nextKey)
      queue.push(walk)
    }
  }
  return null
}

async function readCell(loc) {
  const r = Number(await loc.getAttribute('data-r'))
  const c = Number(await loc.getAttribute('data-c'))
  if (!Number.isFinite(r) || !Number.isFinite(c)) throw new Error('maze cell has no coordinates')
  return { r, c }
}

async function tapMaze(page, cell) {
  const loc = page.locator(`[data-maze-cell][data-r="${cell.r}"][data-c="${cell.c}"]`)
  await loc.scrollIntoViewIfNeeded()
  const box = await loc.boundingBox()
  if (!box) throw new Error(`maze cell ${cell.r},${cell.c} has no box`)
  const x = box.x + box.width / 2
  const y = box.y + box.height / 2
  await page.mouse.move(x, y)
  await page.mouse.down()
  await page.mouse.up()
}

const STEP_DIRS = [
  { r: -1, c: 0 },
  { r: 1, c: 0 },
  { r: 0, c: -1 },
  { r: 0, c: 1 },
]

async function roadKeys(page) {
  const keys = await page.locator('[data-maze-cell].is-road').evaluateAll((nodes) =>
    nodes.map((node) => `${node.getAttribute('data-r')}:${node.getAttribute('data-c')}`),
  )
  return new Set(keys)
}

async function shotHop(page, name) {
  const width = page.viewportSize()?.width
  if (width !== 375 && width !== 412 && width !== 768) return
  await page.screenshot({ path: `${SHOTS}/hop-a-${name}-${width}.png` })
}

async function assertNoNightWatch(page, where) {
  assert.equal(await page.locator('.easy-night-watch').count(), 0, `${where} hides Night Watch on the first day`)
}

async function assertMazeStart(page) {
  const how = page.locator('[data-maze-how]')
  await how.waitFor()
  const text = ((await how.innerText()) || '').replace(/\s+/g, ' ').trim()
  assert.equal(text, EASY.mazeHow)
  const box = await how.boundingBox()
  const view = page.viewportSize()
  assert.ok(box && view && box.y >= 0 && box.y + box.height <= view.height + 0.5, 'maze-how is inside the viewport')
  assert.equal(await page.locator('[data-maze-cell].is-hurt.is-goal').count(), 1, 'the hurt man wears the gold ring')
  const cells = await page.locator('[data-maze-cell]').evaluateAll((nodes) => {
    const viewH = window.innerHeight
    const viewW = window.innerWidth
    return {
      n: nodes.length,
      scrollY: window.scrollY,
      clipped: nodes.filter((node) => {
        const rect = node.getBoundingClientRect()
        return (
          rect.width <= 0 ||
          rect.top < -0.5 ||
          rect.left < -0.5 ||
          rect.bottom > viewH + 0.5 ||
          rect.right > viewW + 0.5
        )
      }).length,
    }
  })
  assert.equal(cells.n, 35, 'the maze is 5×7')
  assert.equal(cells.scrollY, 0, 'the maze does not scroll the window')
  assert.equal(cells.clipped, 0, 'every maze cell is inside the viewport')
  assert.equal((await filledGolds(page)).length, 0, 'the maze has no filled gold')
}

async function assertMazeDrag(page) {
  const at = await readCell(page.locator('[data-maze-cell].is-here'))
  const open = await roadKeys(page)
  const next = STEP_DIRS.map((dir) => ({ r: at.r + dir.r, c: at.c + dir.c })).find((cell) => open.has(key(cell)))
  if (!next) throw new Error('the pawn has no road neighbor')
  const rockBox = await page.locator('[data-maze-cell].is-rock').first().boundingBox()
  const pawnBox = await page.locator('[data-maze-cell].is-here').boundingBox()
  if (!rockBox || !pawnBox) throw new Error('maze drag boxes missing')
  await page.mouse.move(rockBox.x + rockBox.width / 2, rockBox.y + rockBox.height / 2)
  await page.mouse.down()
  await page.mouse.move(pawnBox.x + pawnBox.width / 2, pawnBox.y + pawnBox.height / 2, { steps: 8 })
  await page.mouse.up()
  assert.deepEqual(await readCell(page.locator('[data-maze-cell].is-here')), at, 'a drag that starts on rock does not move the pawn')
  const nextBox = await page.locator(`[data-maze-cell][data-r="${next.r}"][data-c="${next.c}"]`).boundingBox()
  const start = await page.locator('[data-maze-cell].is-here').boundingBox()
  if (!nextBox || !start) throw new Error('pawn drag boxes missing')
  await page.mouse.move(start.x + start.width / 2, start.y + start.height / 2)
  await page.mouse.down()
  await page.mouse.move(nextBox.x + nextBox.width / 2, nextBox.y + nextBox.height / 2, { steps: 8 })
  await page.mouse.up()
  await page.waitForFunction(
    ({ r, c }) => {
      const here = document.querySelector('[data-maze-cell].is-here')
      return here?.getAttribute('data-r') === String(r) && here?.getAttribute('data-c') === String(c)
    },
    next,
  )
  assert.deepEqual(await readCell(page.locator('[data-maze-cell].is-here')), next, 'a drag from the pawn steps one cell')
  assert.equal(await page.locator('[data-maze-how]').count(), 0, 'maze-how hides after the first step')
}

async function playRoad(page) {
  await page.locator('[data-maze-cell].is-here').waitFor()
  const at = await readCell(page.locator('[data-maze-cell].is-here'))
  const cells = page.locator('[data-maze-cell].is-road')
  const count = await cells.count()
  for (let i = 0; i < count; i += 1) {
    const cell = await readCell(cells.nth(i))
    if (cell.r === at.r && cell.c === at.c) continue
    await tapMaze(page, cell)
    break
  }
  await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => resolve(undefined))))
  const hurt = await readCell(page.locator('[data-maze-cell].is-hurt'))
  const inn = await readCell(page.locator('[data-maze-cell].is-inn'))
  await walkUntil(page, hurt, false)
  await page.locator('.play.is-road-maze.is-helped').waitFor({ timeout: 4000 })
  await shotHop(page, 'l1-after-help')
  await tapMaze(page, hurt)
  await page.locator('.play.is-road-maze.is-helped, .play.is-road-maze.is-win').waitFor()
  await walkUntil(page, inn, true)
  await page.locator('[data-maze-dock], .play.is-road-maze.is-win').first().waitFor({ timeout: 8000 })
}

async function playRoadAdjacent(page) {
  await page.locator('[data-maze-cell].is-here').waitFor()
  const hurt = await readCell(page.locator('[data-maze-cell].is-hurt'))
  const inn = await readCell(page.locator('[data-maze-cell].is-inn'))
  const at = await readCell(page.locator('[data-maze-cell].is-here'))
  const open = await roadKeys(page)
  const blocked = new Set(open)
  blocked.delete(key(hurt))
  const neighbors = STEP_DIRS.map((dir) => ({ r: hurt.r + dir.r, c: hurt.c + dir.c })).filter((cell) =>
    blocked.has(key(cell)),
  )
  let beside = null
  for (const cell of neighbors) {
    if (shortest(at, cell, blocked)) {
      beside = cell
      break
    }
  }
  if (!beside) throw new Error('no road beside the hurt man that avoids him')
  await walkUntil(page, beside, false)
  await page.locator('.play.is-road-maze.is-helped').waitFor({ timeout: 1000 })
  const how = ((await page.locator('[data-maze-how]').innerText()) || '').replace(/\s+/g, ' ').trim()
  assert.equal(how, EASY.mazeInnCue)
  assert.equal(await page.locator('[data-maze-cell].is-inn.is-goal').count(), 1, 'the pink house wears the gold ring')
  assert.equal(await page.locator('[data-maze-cell].is-hurt.is-goal').count(), 0, 'the hurt man drops the ring after Help')
  await shotHop(page, 'l1-after-help')
  await walkUntil(page, inn, true)
  await page.locator('[data-maze-next]').waitFor({ timeout: 8000 })
}

async function walkUntil(page, target, winOnArrival) {
  for (let guard = 0; guard < 40; guard += 1) {
    const hereLoc = page.locator('[data-maze-cell].is-here')
    if ((await hereLoc.count()) === 0) return
    const at = await readCell(hereLoc)
    if (at.r === target.r && at.c === target.c) return
    const keys = await page.locator('[data-maze-cell].is-road').evaluateAll((nodes) =>
      nodes.map((node) => `${node.getAttribute('data-r')}:${node.getAttribute('data-c')}`),
    )
    const open = new Set(keys)
    const path = shortest(at, target, open)
    if (!path || path.length < 2) throw new Error(`no road from ${key(at)} to ${key(target)}`)
    const next = path[1]
    await tapMaze(page, next)
    if (winOnArrival && next.r === target.r && next.c === target.c) {
      await page.locator('.win-stamp', { hasText: 'Helped!' }).waitFor({ timeout: 8000 })
      return
    }
    await page.waitForFunction(
      ({ r, c }) => {
        const here = document.querySelector('[data-maze-cell].is-here')
        return here?.getAttribute('data-r') === String(r) && here?.getAttribute('data-c') === String(c)
      },
      next,
    )
  }
  throw new Error(`maze walk did not reach ${key(target)}`)
}

async function readRunCue(page) {
  return page.evaluate(() => {
    const pad = document.querySelector('[data-run-pad="hold"]')
    if (!(pad instanceof HTMLElement)) return null
    const faces = [...pad.querySelectorAll('.run-pad-face')].filter(
      (el) => getComputedStyle(el).visibility !== 'hidden',
    )
    return {
      label: (pad.getAttribute('aria-label') || '').trim(),
      faces: faces.map((el) => (el.textContent || '').replace(/\s+/g, ' ').trim()),
      glow: pad.classList.contains('is-glow'),
    }
  })
}

async function releaseRun(page, kind) {
  const pad = page.locator('[data-run-pad="hold"]')
  await pad.waitFor({ timeout: 15000 })
  await pad.scrollIntoViewIfNeeded()
  const box = await pad.boundingBox()
  if (!box) throw new Error('run pad has no box')
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
  await page.mouse.down()
  if (kind === 'late') {
    const bad = []
    let sawTap = false
    let sawHold = false
    let shotCue = false
    const start = Date.now()
    while (Date.now() - start < 2600) {
      const snap = await readRunCue(page)
      const oneVerb = snap && snap.faces.length === 1 && snap.faces[0] === snap.label && (snap.label === 'Hold' || snap.label === 'Tap')
      const matchesGlow = Boolean(snap && (snap.glow ? snap.label === 'Tap' : snap.label === 'Hold'))
      if (!oneVerb || !matchesGlow) bad.push(snap)
      if (snap?.label === 'Tap') {
        sawTap = true
        if (!shotCue && page.viewportSize()?.width === 375) {
          await page.screenshot({ path: `${SHOTS}/run-pad-cue-375.png` })
          shotCue = true
        }
      }
      if (snap?.label === 'Hold') sawHold = true
      await page.waitForTimeout(80)
    }
    assert.equal(bad.length, 0, `run cue flipped ${JSON.stringify(bad.slice(0, 3))}`)
    assert.equal(sawHold, true, 'the pad says Hold between glows')
    assert.equal(sawTap, true, 'the pad says Tap on the glow')
  } else {
    await page.waitForTimeout(160)
    const snap = await readRunCue(page)
    assert.equal(snap?.faces?.length, 1, 'one run cue before the glow')
    assert.equal(snap?.label, 'Hold', 'early release is a hold')
    assert.equal(snap?.glow, false, 'early release is before the glow')
  }
  await page.mouse.up()
  await page.locator('.run-miss').waitFor({ timeout: 16000 })
  await page.waitForTimeout(400)
}

async function tapRunFailGold(page) {
  const btn = page.locator('.run-miss .btn.primary')
  await btn.waitFor()
  const cls = (await btn.getAttribute('class')) || ''
  assert.match(cls, /\bprimary\b/, 'run-fail gold is .btn.primary')
  assert.doesNotMatch(cls, /\bgold\b/, 'run-fail gold is not the pale .btn.gold')
  const golds = await filledGolds(page)
  assert.equal(golds.length, 1, `run-fail has one filled gold ${JSON.stringify(golds)}`)
  await btn.click()
  await page.waitForTimeout(250)
  assert.equal(await page.locator('[aria-label="Choose a map"]').count(), 0, 'run-fail gold did not open Choose a map')
  assert.equal(await page.locator('.nw-map-overlay').count(), 0, 'run-fail gold did not open the map overlay')
  assert.equal(await page.locator('.defend-page').count(), 0, 'run-fail gold did not open Night Watch')
  assert.equal(await page.locator('.play.is-father-run').count(), 1, 'run-fail gold stays on the father run')
}

/** Gold-only. Miss 1 is a late glow release. Miss 2 is an early release, then Keep going. */
async function hugFatherHuman(page) {
  await releaseRun(page, 'late')
  const again = ((await page.locator('.run-miss .btn.primary').innerText()) || '').replace(/\s+/g, ' ').trim()
  assert.equal(again, 'Run again', 'miss 1 gold is Run again')
  assert.equal(await page.locator('[data-run-keep]').count(), 0, 'miss 1 has no Keep going')
  await tapRunFailGold(page)
  await page.locator('[data-run-pad="hold"]').waitFor()

  await releaseRun(page, 'early')
  const keep = page.locator('[data-run-keep]')
  const keepLabel = ((await keep.innerText()) || '').replace(/\s+/g, ' ').trim()
  assert.equal(keepLabel, 'Keep going', 'miss 2 gold is Keep going')
  const keepCls = (await keep.getAttribute('class')) || ''
  assert.match(keepCls, /\bprimary\b/, 'Keep going is .btn.primary')
  const plain = page.locator('.run-miss [data-run-again]')
  assert.equal(await plain.count(), 1, 'Run again stays visible')
  const plainText = ((await plain.innerText()) || '').replace(/\s+/g, ' ').trim()
  assert.equal(plainText, 'Run again', 'miss 2 plain label reads Run again')
  const plainCls = (await plain.getAttribute('class')) || ''
  assert.doesNotMatch(plainCls, /\bprimary\b/, 'Run again is a plain button on miss 2')
  const ink = await plain.evaluate((el) => getComputedStyle(el).color)
  const channels = ink.match(/\d+/g)?.map(Number) ?? []
  assert.ok(channels.length >= 3 && Math.max(...channels.slice(0, 3)) < 80, `Run again ink is dark (${ink})`)
  const golds = await filledGolds(page)
  assert.equal(golds.length, 1, `miss 2 has one filled gold ${JSON.stringify(golds)}`)
  assert.match(golds[0].text, /Keep going/)
  await page.screenshot({ path: `${SHOTS}/run-fail-keep-going-375.png` })
  await page.screenshot({ path: `${SHOTS}/fail-2-run-again-375.png` })
  await tapRunFailGold(page)
  await page.locator('.play.is-father-run.is-win .btn.primary').waitFor({ timeout: 8000 })
}

async function hugFather(page) {
  const pad = page.locator('[data-run-pad="hold"]')
  await pad.waitFor({ timeout: 15000 })
  await pad.scrollIntoViewIfNeeded()
  const press = async () => {
    const box = await pad.boundingBox()
    if (!box) throw new Error('run pad has no box')
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
    await page.mouse.down()
  }
  await press()
  const start = Date.now()
  while (Date.now() - start < 12000) {
    if (await page.locator('.play.is-father-run.is-win').count()) {
      await page.mouse.up().catch(() => {})
      return
    }
    if (await page.locator('.run-miss').count()) {
      await page.mouse.up().catch(() => {})
      throw new Error('father run missed')
    }
    let label = null
    try {
      label = await pad.getAttribute('aria-label', { timeout: 500 })
    } catch {
      if (await page.locator('.play.is-father-run.is-win').count()) {
        await page.mouse.up().catch(() => {})
        return
      }
      continue
    }
    if (label === 'Tap' || (label && label.includes('Let go'))) {
      await page.mouse.up()
      await page.waitForTimeout(30)
      await press()
      await page.waitForTimeout(90)
    } else {
      await page.waitForTimeout(50)
    }
  }
  throw new Error('father run did not hug')
}

async function readGrid(page) {
  return page.evaluate(() => {
    const cells = [...document.querySelectorAll('[data-gem-cell]')]
    let size = 0
    for (const cell of cells) {
      size = Math.max(size, Number(cell.getAttribute('data-r')) + 1, Number(cell.getAttribute('data-c')) + 1)
    }
    const grid = Array.from({ length: size }, () => Array(size).fill(''))
    for (const cell of cells) {
      const r = Number(cell.getAttribute('data-r'))
      const c = Number(cell.getAttribute('data-c'))
      grid[r][c] = (cell.querySelector('.gem-letter')?.textContent || '').trim()
    }
    return grid
  })
}

async function readBoardGeom(page) {
  return page.evaluate(() => {
    const cells = [...document.querySelectorAll('[data-gem-cell]')]
    const byRow = new Map()
    const cellSizes = []
    let visibleLetters = 0
    for (const cell of cells) {
      const r = Number(cell.getAttribute('data-r'))
      const box = cell.getBoundingClientRect()
      const row = byRow.get(r) ?? { top: Math.round(box.top), height: box.height }
      row.top = Math.min(row.top, Math.round(box.top))
      row.height = Math.max(row.height, box.height)
      byRow.set(r, row)
      cellSizes.push({ w: box.width, h: box.height })
      const letter = cell.querySelector('.gem-letter')
      const text = (letter?.textContent || '').trim()
      if (!letter || !text) continue
      const style = getComputedStyle(letter)
      const color = style.color
      const transparent = color === 'transparent' || color === 'rgba(0, 0, 0, 0)'
      if (Number(style.opacity) > 0.5 && !transparent) visibleLetters += 1
    }
    const boardEl = document.querySelector('.gem-board')
    const boardBox = boardEl ? boardEl.getBoundingClientRect() : null
    const rows = [...byRow.entries()]
      .sort((a, b) => a[0] - b[0])
      .map(([r, info]) => ({ r, top: info.top, height: info.height }))
    return {
      count: cells.length,
      rows,
      cells: cellSizes,
      visibleLetters,
      board: boardBox
        ? { w: boardBox.width, h: boardBox.height, top: boardBox.top, right: boardBox.right, bottom: boardBox.bottom, left: boardBox.left }
        : null,
      clearCount: document.querySelectorAll('.gem-cell.is-clear').length,
    }
  })
}

function assertWinBoard(before, after, gridBefore, gridAfter, width, height) {
  assert.equal(before.count, 64, `${width} gem cells before`)
  assert.equal(after.count, before.count, `${width} gem cells changed`)
  assert.equal(after.count, 64, `${width} gem cells after`)
  assert.equal(before.rows.length, 8, `${width} rows before`)
  assert.equal(after.rows.length, before.rows.length, `${width} row count changed`)
  for (const shot of [before, after]) {
    const ids = shot.rows.map((row) => row.r)
    assert.ok(ids.includes(0) && ids.includes(7), `${width} bounding rows ${ids}`)
    for (const row of shot.rows) assert.ok(row.height > 0, `${width} row ${row.r} collapsed`)
    const tops = shot.rows.map((row) => row.top)
    assert.equal(new Set(tops).size, 8, `${width} row tops ${tops}`)
    for (let i = 1; i < tops.length; i += 1) {
      assert.ok(tops[i] > tops[i - 1], `${width} row tops ${tops}`)
    }
  }
  const heights = after.rows.map((row) => row.height)
  const spread = Math.max(...heights) - Math.min(...heights)
  assert.ok(spread <= 1, `${width} row height spread ${spread.toFixed(2)} [${heights.join(',')}]`)
  for (const cell of after.cells) {
    assert.ok(Math.abs(cell.w - cell.h) <= 2, `${width} cell ${cell.w.toFixed(1)}x${cell.h.toFixed(1)}`)
  }
  assert.ok(after.board, `${width} missing board rect`)
  assert.ok(
    Math.abs(after.board.w - after.board.h) <= 2,
    `${width} board ${after.board.w.toFixed(1)}x${after.board.h.toFixed(1)}`,
  )
  assert.ok(after.board.top >= -0.5 && after.board.left >= -0.5, `${width} board origin`)
  assert.ok(after.board.right <= width + 0.5, `${width} board right ${after.board.right}`)
  assert.ok(after.board.bottom <= height + 0.5, `${width} board bottom ${after.board.bottom}`)
  assert.equal(after.visibleLetters, 64, `${width} visible letters`)
  assert.equal(after.clearCount, 0, `${width} is-clear cells on win`)
  assert.deepEqual(gridAfter, gridBefore, `${width} letter grid changed`)
}

async function measureGemPoints(page, path) {
  return page.evaluate((cells) => {
    return cells.map(({ r, c }) => {
      const el = document.querySelector(`[data-gem-cell][data-r="${r}"][data-c="${c}"]`)
      if (!(el instanceof HTMLElement)) return null
      const box = el.getBoundingClientRect()
      const x = box.left + box.width / 2
      const y = box.top + box.height / 2
      return { x, y, r, c, hit: document.elementsFromPoint(x, y).includes(el) }
    })
  }, path)
}

async function dragPath(page, path) {
  await page.locator('.gem-board').scrollIntoViewIfNeeded()
  let points = await measureGemPoints(page, path)
  if (points.some((point) => !point?.hit)) {
    const anchor = path[Math.floor(path.length / 2)]
    await page
      .locator(`[data-gem-cell][data-r="${anchor.r}"][data-c="${anchor.c}"]`)
      .scrollIntoViewIfNeeded()
    points = await measureGemPoints(page, path)
  }
  if (points.some((point) => !point?.hit)) {
    throw new Error(`gem cells not hittable ${JSON.stringify(points)}`)
  }
  await page.mouse.move(points[0].x, points[0].y)
  await page.mouse.down()
  for (let i = 1; i < points.length; i += 1) {
    const from = points[i - 1]
    const to = points[i]
    const diagonal = path[i].r !== path[i - 1].r && path[i].c !== path[i - 1].c
    if (diagonal) {
      // Stay inside the start cell, then land on the target. A straight step
      // between centers clips the corner neighbor and snaps off the word.
      await page.mouse.move(from.x + (to.x - from.x) * 0.28, from.y + (to.y - from.y) * 0.28)
      await page.mouse.move(to.x, to.y)
    } else {
      await page.mouse.move(to.x, to.y, { steps: 8 })
    }
  }
  await page.mouse.up()
}

async function playGem(page, lineId = 'ob-tuning', { watchLast = false } = {}) {
  await page.locator('[data-gem-cell]').first().waitFor()
  const words = gemWordsFor(lineId).map((word) => word.text)
  const juice = { burst: 0, pop: false }
  for (const word of words) {
    if (await page.locator('.play.is-gem-search.is-win').count()) return juice
    // Match reseeds once on mount (line effect bumps the round). Wait until the letters sit still.
    let letters = await readGrid(page)
    for (let attempt = 0; attempt < 8; attempt += 1) {
      await page.waitForTimeout(40)
      const next = await readGrid(page)
      if (JSON.stringify(next) === JSON.stringify(letters)) {
        letters = next
        break
      }
      letters = next
    }
    const path = findStraightSpelling(letters, word)
    if (!path) throw new Error(`${lineId} word ${word} is not on the board`)
    const foundBefore = await page.locator('.match-teach-chip.is-found').count()
    const expectJuice = watchLast && word === words[words.length - 1]
    if (expectJuice) {
      await page.evaluate(() => {
        window.__gemJuice = 0
        const until = performance.now() + 2500
        const watch = () => {
          const pop = document.querySelector('.gem-find-pop')
          const burst = document.querySelectorAll('.gem-cell.is-burst').length
          if (pop && burst > 0) {
            const box = pop.getBoundingClientRect()
            const opacity = Number(getComputedStyle(pop).opacity)
            if (box.height > 0 && opacity > 0.15) window.__gemJuice = Math.max(window.__gemJuice, burst)
          }
          if (!window.__gemJuice && performance.now() < until) requestAnimationFrame(watch)
        }
        requestAnimationFrame(watch)
      })
    }
    const landed = async () => {
      try {
        const handle = await page.waitForFunction(
          (count) =>
            document.querySelectorAll('.match-teach-chip.is-found').length > count ||
            Boolean(document.querySelector('.play.is-gem-search.is-win')),
          foundBefore,
          { timeout: 1800 },
        )
        await handle.dispose()
        return true
      } catch {
        return false
      }
    }
    await dragPath(page, path)
    let saw = await landed()
    if (!saw) {
      await dragPath(page, path)
      saw = await landed()
    }
    if (!saw) {
      const toast = ((await page.locator('.miss-banner, .match-toast, .bonus-banner').first().textContent().catch(() => '')) || '').replace(/\s+/g, ' ').trim()
      throw new Error(`${lineId} drag missed ${word} path=${JSON.stringify(path)} toast=${toast || 'none'}`)
    }
    if (expectJuice) {
      await page.waitForFunction(() => window.__gemJuice > 0, undefined, { timeout: 1200 }).catch(() => {})
      juice.burst = await page.evaluate(() => window.__gemJuice || 0)
      juice.pop = juice.burst > 0
    }
    await page.waitForTimeout(280)
  }
  await page.locator('.play.is-gem-search.is-win').waitFor({ timeout: 8000 })
  return juice
}

async function lockInFace(page) {
  await page.locator('.why-blast-hud .next-tap').waitFor({ timeout: 8000 })
  await page.locator('button.why-chip').first().waitFor()
  return page.evaluate(() => {
    const header = document.querySelector('.why-blast-hud .next-tap')
    const chips = [...document.querySelectorAll('button.why-chip')].filter((el) => {
      const style = getComputedStyle(el)
      const box = el.getBoundingClientRect()
      return style.visibility !== 'hidden' && style.display !== 'none' && box.height > 4
    })
    const headerBox = header ? header.getBoundingClientRect() : null
    let covered = false
    if (headerBox) {
      for (const chip of chips) {
        const box = chip.getBoundingClientRect()
        const overlap =
          box.bottom > headerBox.top + 0.5 &&
          box.top < headerBox.bottom - 0.5 &&
          box.right > headerBox.left + 0.5 &&
          box.left < headerBox.right - 0.5
        if (overlap) covered = true
      }
    }
    const marks = chips.map((el) => {
      const style = getComputedStyle(el)
      const classes = [...el.classList]
        .filter((name) => !/^slot-\d+$/.test(name) && !/^float-\d+$/.test(name))
        .sort()
        .join(' ')
      return [style.animationName, style.outlineStyle, style.outlineWidth, style.backgroundColor, classes].join('|')
    })
    let descender = false
    if (header) {
      const range = document.createRange()
      range.selectNodeContents(header)
      const ink = range.getBoundingClientRect()
      const box = header.getBoundingClientRect()
      descender = ink.height > 8 && ink.bottom <= box.bottom + 0.5 && ink.top >= box.top - 0.5
    }
    return {
      tap: header ? header.innerText.replace(/\s+/g, ' ').trim() : '',
      cue: document.querySelectorAll('[data-drag-cue], .why-drag-cue, .is-first-cue').length,
      covered,
      unique: new Set(marks).size > 1,
      descender,
      lineHeight: header ? getComputedStyle(header).lineHeight : '',
    }
  })
}

function assertSharedCards(face, where) {
  assert.equal(face.tap, 'Drag the card that shows why.', where)
  assert.equal(face.cue, 0, `${where} has no separate drag line`)
  assert.equal(face.unique, false, `${where} gives no card a unique highlight`)
  assert.equal(face.covered, false, `${where} keeps the cards under the header`)
}

async function dragWhy(page, id) {
  const brief = evidenceForTier(id, 'easy')
  assert.ok(brief, `evidence for ${id}`)
  const why = easyWhyLine(brief.reason)
  const face = await lockInFace(page)
  assertSharedCards(face, id)
  assert.equal((await filledGolds(page)).length, 0, 'Lock In play has no gold button')
  if (page.viewportSize()?.width === 375) {
    assert.equal(face.descender, true, `${id} keeps the g descender (${face.lineHeight})`)
    await page.screenshot({ path: `${SHOTS}/lock-in-drag-cue-375.png` })
  }
  const chip = page.locator('button.why-chip', { hasText: why }).first()
  await chip.waitFor()
  const box = await chip.boundingBox()
  if (!box) throw new Error('why chip has no box')
  const x = box.x + box.width / 2
  const y = box.y + box.height / 2
  await page.mouse.move(x, y)
  await page.mouse.down()
  await page.mouse.move(x + 48, y + 20, { steps: 8 })
  await page.mouse.up()
  await page.locator('.why-blast.is-yes, .why-blast.is-win').first().waitFor({ timeout: 8000 })
  assert.equal(await page.locator('[data-drag-cue], .why-drag-cue').count(), 0)
}

async function answerQuiz(page, id) {
  const brief = evidenceForTier(id, 'easy')
  assert.ok(brief, `evidence for ${id}`)
  const why = easyWhyLine(brief.reason)
  const chip = page.locator('button.why-chip', { hasText: why }).first()
  await chip.waitFor({ timeout: 8000 })
  const box = await chip.boundingBox()
  if (!box) throw new Error('why chip has no box')
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2)
  await page.locator('.why-blast.is-yes, .why-blast.is-win').first().waitFor({ timeout: 8000 })
}

async function solveMatch(page, challenge) {
  for (const pair of challenge.pairs) {
    const claim = page.locator('.match-col.is-claims button', { hasText: pair.right }).first()
    await claim.waitFor()
    await claim.click()
    await page.waitForTimeout(200)
  }
  const next = page.getByRole('button', { name: 'Lock In next' })
  if (await next.count()) await next.click()
}

async function solveSort(page, challenge) {
  for (let i = 0; i < challenge.tiles.length; i += 1) {
    const line = ((await page.locator('.sort-one-line').innerText()) || '').replace(/\s+/g, ' ')
    const tile = challenge.tiles.find((item) => {
      const face = easyChromeLine(item.text)
      return line.includes(face.slice(0, 28)) || line.includes(item.text.slice(0, 28))
    })
    if (!tile) throw new Error(`sort line not in the daily: ${line}`)
    await page.getByRole('button', { name: tile.bin === 'keep' ? 'Keep' : 'Toss', exact: true }).click()
    await page.waitForTimeout(150)
  }
}

async function solveSequence(page, challenge) {
  for (const item of challenge.items) {
    const label = item.easyText || item.text
    await page.getByRole('button', { name: label, exact: true }).click()
    await page.waitForTimeout(180)
  }
}

async function finishRead(page, puzzle) {
  const kind = puzzle.challenge.kind
  if (kind === 'match') await solveMatch(page, puzzle.challenge)
  else if (kind === 'sort') await solveSort(page, puzzle.challenge)
  else if (kind === 'sequence') await solveSequence(page, puzzle.challenge)
  else throw new Error(`day-2 daily kind ${kind} is not in the early pool solver`)
  for (let guard = 0; guard < 10; guard += 1) {
    if ((await page.locator('.daily-page').count()) === 0 && (await screenId(page)) === 'home') return
    const quizOpen = await page.locator('.why-blast').count()
    const quizWon = await page.locator('.why-blast.is-yes, .why-blast.is-win').count()
    if (quizOpen && !quizWon) {
      await answerQuiz(page, puzzle.challenge.id)
      continue
    }
    const step = page.locator('.why-blast .btn.primary, .town-return .btn.primary').first()
    if (await step.count()) {
      await step.click()
      await page.waitForTimeout(250)
      continue
    }
    await page.waitForTimeout(200)
  }
  assert.equal(await screenId(page), 'home', `day-2 Read returns Home (${puzzle.challenge.kind})`)
}

export async function checkGoldenLive() {
  await build({ logLevel: 'warn' })
  const server = await preview({
    preview: { host: '127.0.0.1', port: 0 },
    logLevel: 'warn',
  })
  const address = server.httpServer?.address()
  const port = typeof address === 'object' && address ? address.port : 4173
  const origin = `http://127.0.0.1:${port}/`
  const browser = await launchBrowser()
  const traces = []
  mkdirSync(SHOTS, { recursive: true })
  try {
    for (const [width, height] of SIZES) {
      const trace = []
      const seen = new Set()
      const context = await browser.newContext({ viewport: { width, height } })
      const page = await context.newPage()
      const errors = []
      page.on('pageerror', (error) => errors.push(String(error)))
      await page.goto(origin)
      await page.locator('.welcome').waitFor()

      async function stamp(label) {
        const shot = await signature(page)
        trace.push(`${width}x${height} ${label} ${shot.sig} n=${shot.golds.length}`)
        assert.ok(!seen.has(shot.sig), `repeated screen ${shot.sig}`)
        seen.add(shot.sig)
        assert.notEqual(shot.id, 'night-watch', 'gold follower opened Night Watch')
        assert.equal(await page.locator('.defend-page').count(), 0)
        if (playScreens(shot.id)) assert.equal(shot.golds.length, 0, `${label} play screen has a filled gold`)
        else assert.equal(shot.golds.length, 1, `${label} needs one filled gold ${JSON.stringify(shot.golds)}`)
        return shot
      }

      let shot = await stamp('welcome')
      assert.equal(shot.id, 'welcome')
      assert.equal(shot.golds[0].disabled, false)
      await tapFilledGold(page)
      await page.locator('main.hub').waitFor()

      shot = await stamp('home-fresh')
      assert.equal(shot.id, 'home')
      const freshDock = (await page.locator('.easy-home-whisper').innerText()).replace(/\s+/g, ' ').trim()
      const freshGift = (await page.locator('.easy-build-gift').innerText()).replace(/\s+/g, ' ').trim()
      assert.equal(freshDock, 'Start your first road.', 'first Home dock is a first road')
      assert.equal(freshGift, 'Start your first road.', 'first Home gift matches the dock')
      assert.doesNotMatch(`${freshDock} ${freshGift}`, /One more/, 'One more waits until a road is done')
      assert.doesNotMatch(shot.golds[0].text, /Read/, 'first session gold is not Read')
      assert.match(await page.locator('.easy-home-steps li').first().innerText(), /tomorrow/)
      assert.equal(shot.golds[0].disabled, false, 'session 1 lesson step stays enabled')
      assert.equal(await page.locator('.easy-night-watch').count(), 0, 'Night Watch is hidden before the first Lock In')
      if (width === 375) await page.screenshot({ path: `${SHOTS}/easy-home-fresh-375.png` })
      await shotHop(page, 'home-1')
      await tapFilledGold(page)

      await page.locator('.play.is-road-maze').waitFor()
      await stamp('maze')
      await shotHop(page, 'l1-start')
      if (width === 375 && height === 667) {
        await assertMazeStart(page)
        await assertMazeDrag(page)
      }
      if (width === 375 || width === 768) await playRoadAdjacent(page)
      else await playRoad(page)
      await page.locator('[data-maze-next]').waitFor()
      shot = await stamp('maze-win')
      await shotHop(page, 'l1-helped')
      assert.equal(shot.id, 'maze-win')
      assert.match(shot.golds[0].text, /Lock In/)
      await tapFilledGold(page)

      await page.locator('.why-blast').waitFor()
      await stamp('quiz-road')
      await answerQuiz(page, 'ph-road')
      await page.locator('.why-blast.is-yes .btn.primary, .why-blast.is-win .btn.primary').first().waitFor()
      shot = await stamp('quiz-road-done')
      assert.match(shot.golds[0].text, /Continue/)
      assert.match(await page.locator('.why-got-it').innerText(), /You got it/)
      if (width === 375) await page.screenshot({ path: `${SHOTS}/lock-in-you-got-it-375.png` })
      await tapFilledGold(page)

      await page.locator('main.hub').waitFor()
      shot = await stamp('home-after-road')
      assert.equal(await page.locator('.easy-night-watch').count(), 0, 'Night Watch stays hidden on the first day')
      await shotHop(page, 'home-2')
      const roadGift = (await page.locator('.easy-build-gift').innerText()).replace(/\s+/g, ' ')
      assert.doesNotMatch(roadGift, /Build this/, 'Home gift does not say Build this while gold is Run')
      assert.match(roadGift, /run/i)
      assert.match(shot.golds[0].text, /Run/)
      if (width === 375) {
        await page.screenshot({ path: `${SHOTS}/easy-home-after-lock-in-375.png` })
        await page.screenshot({ path: `${SHOTS}/home-run-copy-375.png` })
      }
      await tapFilledGold(page)

      await page.locator('[data-run-pad], .play.is-father-run').first().waitFor()
      await stamp('run')
      await hugFather(page)
      await page.locator('.play.is-father-run.is-win .btn.primary').waitFor()
      shot = await stamp('run-win')
      assert.equal(shot.id, 'run-win')
      assert.match(shot.golds[0].text, /Lock In/)
      await tapFilledGold(page)
      await page.locator('.why-blast').waitFor()
      await stamp('quiz-father')
      const fatherFace = await lockInFace(page)
      assertSharedCards(fatherFace, 'ph-father')
      if (width === 375) {
        assert.equal(fatherFace.descender, true, `ph-father keeps the g descender (${fatherFace.lineHeight})`)
        await page.screenshot({ path: `${SHOTS}/lock-in-father-375.png` })
      }
      await answerQuiz(page, 'ph-father')
      await page.locator('.why-blast.is-yes .btn.primary, .why-blast.is-win .btn.primary').first().waitFor()
      shot = await stamp('quiz-father-done')
      assert.match(shot.golds[0].text, /Continue/)
      assert.match(await page.locator('.why-got-it').innerText(), /You got it/)
      await tapFilledGold(page)

      await page.locator('main.hub').waitFor()
      shot = await stamp('home-tuning')
      await assertNoNightWatch(page, 'home-tuning')
      assert.doesNotMatch(shot.golds[0].text, /Read/)
      assert.match(shot.golds[0].text, /Find the words/)
      assert.doesNotMatch(shot.golds[0].text, /gems/)
      const tuningWhisper = ((await page.locator('.easy-home-whisper').innerText()) || '').replace(/\s+/g, ' ').trim()
      assert.match(tuningWhisper, /Find the words at Sky Watch/)
      assert.doesNotMatch(tuningWhisper, /gems/)
      await tapFilledGold(page)

      await page.locator('.play.is-gem-search').waitFor()
      await stamp('gem')
      const gemBefore = await readBoardGeom(page)
      const gridBefore = await readGrid(page)
      const juice = await playGem(page, 'ob-tuning', { watchLast: true })
      assert.ok(juice.burst > 0, `${width} last find burst`)
      assert.equal(juice.pop, true, `${width} last find pop`)
      await page.locator('.play.is-gem-search.is-win .btn.primary').waitFor()
      await page.waitForFunction(() => document.querySelectorAll('.gem-cell.is-burst').length === 0)
      const gemAfter = await readBoardGeom(page)
      const gridAfter = await readGrid(page)
      assertWinBoard(gemBefore, gemAfter, gridBefore, gridAfter, width, height)
      const stack = await page.evaluate(() => {
        const box = (sel) => {
          const el = document.querySelector(sel)
          if (!el) return null
          const r = el.getBoundingClientRect()
          return { top: r.top, bottom: r.bottom, left: r.left, right: r.right, height: r.height }
        }
        const play = document.querySelector('.play.is-gem-search.is-win')
        return {
          board: box('.gem-board'),
          stamp: box('.win-stamp-wrap'),
          take: box('.match-yes'),
          dock: box('.cta-dock'),
          gold: box('.play.is-gem-search.is-win .cta-dock .btn.primary'),
          scrollY: window.scrollY,
          playScroll: play ? play.scrollTop : 0,
          innerHeight: window.innerHeight,
          stampText: (document.querySelector('.win-stamp')?.textContent || '').replace(/\s+/g, ' ').trim(),
        }
      })
      assert.match(stack.stampText, /MATCHED!/i, `${width} win stamp`)
      assert.ok(stack.board && stack.stamp && stack.board.bottom <= stack.stamp.top + 0.5, `${width} board overlaps MATCHED`)
      assert.ok(stack.stamp && stack.take && stack.stamp.bottom <= stack.take.top + 0.5, `${width} MATCHED overlaps the takeaway`)
      assert.ok(stack.take && stack.dock && stack.take.bottom <= stack.dock.top + 0.5, `${width} takeaway overlaps the dock`)
      if (width === 375 && height === 667) {
        assert.equal(stack.scrollY, 0, '375 win did not scroll the window')
        assert.equal(stack.playScroll, 0, '375 win did not scroll the play')
        assert.ok(stack.gold, '375 gold button')
        assert.ok(stack.gold.top >= 0 && stack.gold.bottom <= stack.innerHeight, `375 Lock In next ${stack.gold.top}-${stack.gold.bottom} of ${stack.innerHeight}`)
      }
      trace.push(
        `${width}x${height} gem-geom cells=${gemAfter.count} rows=${gemAfter.rows.length} letters=${gemAfter.visibleLetters} clear=${gemAfter.clearCount} board=${gemAfter.board.w.toFixed(1)}x${gemAfter.board.h.toFixed(1)} rowH=${gemAfter.rows.map((row) => row.height.toFixed(1)).join(',')} tops=${gemAfter.rows.map((row) => row.top).join(',')} gold=${stack.gold ? Math.round(stack.gold.bottom) : 'none'}/${height} stamp=${stack.stampText}`,
      )
      shot = await stamp('gem-win')
      assert.equal(shot.id, 'gem-win')
      assert.equal(shot.golds.length, 1, 'gem-win has one gold')
      assert.match(shot.golds[0].text, /Lock In/)
      assert.doesNotMatch(shot.golds[0].text, /One more/)
      const homeInk = await page.locator('.cta-dock .btn', { hasText: 'Home' }).evaluate((el) => getComputedStyle(el).color)
      const channels = homeInk.match(/\d+/g)?.map(Number) ?? []
      assert.ok(channels.length >= 3 && Math.max(...channels.slice(0, 3)) < 90, `Home ink is readable (${homeInk})`)
      if (width === 375 || width === 412 || width === 768) {
        await page.screenshot({ path: `${SHOTS}/gem-win-${width}.png` })
        await page.screenshot({ path: `${SHOTS}/L3-wordsearch-matched-win-${width}.png` })
      }
      await tapFilledGold(page)
      await page.locator('.why-blast').waitFor()
      shot = await stamp('quiz-tuning')
      assert.equal(shot.id, 'quiz', 'word-search gold opens the Lock In quiz')
      assert.equal(await page.locator('.play.is-gem-search').count(), 0, 'the gold tap did not replay the word search')

      if (width === 375 || width === 412 || width === 768) {
        await dragWhy(page, 'ob-tuning')
        shot = await stamp('quiz-tuning-done')
        assert.match(shot.golds[0].text, /Continue/)
        assert.equal(await page.locator('[data-drag-cue], .why-drag-cue').count(), 0)
        await tapFilledGold(page)
        await page.locator('main.hub').waitFor()
        shot = await stamp('home-after-tuning')
        await assertNoNightWatch(page, 'home-after-tuning')
        assert.match(shot.golds[0].text, /Find the words/)
        const creek = ((await page.locator('.easy-home-whisper').innerText()) || '').replace(/\s+/g, ' ').trim()
        assert.match(creek, /Find the words at Story Creek/)
        assert.doesNotMatch(creek, /Sky Watch|gems/)
        if (width === 375) {
          await page.screenshot({ path: `${SHOTS}/home-after-lesson-3-375.png` })
          await page.getByRole('button', { name: 'Settings' }).click()
          await page.locator('.settings-card').first().waitFor()
          const eyebrow = (await page.locator('.settings-card').first().locator('.eyebrow').innerText()).trim()
          assert.equal(eyebrow.toLowerCase(), 'reading', 'Settings opens on the Reading card')
          await page.screenshot({ path: `${SHOTS}/settings-reading-375.png` })
          await page.getByRole('button', { name: '← Home' }).click()
          await page.locator('main.hub').waitFor()
        }

        await tapFilledGold(page)
        await page.locator('.play.is-gem-search').waitFor()
        await playGem(page, 'ph-debt')
        await page.locator('.play.is-gem-search.is-win .btn.primary').waitFor()
        await tapFilledGold(page)
        await page.locator('.why-blast').waitFor()
        await dragWhy(page, 'ph-debt')
        await tapFilledGold(page)
        await page.locator('main.hub').waitFor()
        shot = await stamp('home-5')
        await assertNoNightWatch(page, 'home-5')
        assert.equal(shot.golds.length, 1, 'Home 5 has one gold')
        const home5 = ((await page.locator('.easy-home-whisper').innerText()) || '').replace(/\s+/g, ' ').trim()
        assert.match(home5, /Find the words at Why Gate Arch\./)
        await shotHop(page, 'home-5')

        await tapFilledGold(page)
        await page.locator('.play.is-gem-search').waitFor()
        await playGem(page, 'fg-order')
        await page.locator('.play.is-gem-search.is-win .btn.primary').waitFor()
        await tapFilledGold(page)
        await page.locator('.why-blast').waitFor()
        await dragWhy(page, 'fg-order')
        await tapFilledGold(page)
        await page.locator('main.hub').waitFor()
        shot = await stamp('home-6')
        await assertNoNightWatch(page, 'home-6')
        assert.equal(shot.golds.length, 1, 'Home 6 has one gold')
        assert.match(shot.golds[0].text, /Find the words/)
        const home6 = ((await page.locator('.easy-home-whisper').innerText()) || '').replace(/\s+/g, ' ').trim()
        assert.match(home6, /More words at Why Gate Arch, part 2\./)
        assert.notEqual(home6, home5, 'Home 6 moves on from Home 5')
        await shotHop(page, 'home-6')

        await tapFilledGold(page)
        await page.locator('.play.is-gem-search').waitFor()
        const reasonLetters = await readGrid(page)
        for (const word of gemWordsFor('fg-reason')) {
          assert.ok(findStraightSpelling(reasonLetters, word.text), `fg-reason shows ${word.text}`)
        }
        assert.equal((await filledGolds(page)).length, 0, 'the word search has no filled gold')
      }

      assert.equal(errors.join('\n'), '', `${width} page errors`)
      traces.push(trace.join('\n'))
      await context.close()
    }

    const today = localDateKey()
    const puzzle = dailyForDate(today, 1)
    const daySave = {
      kind: SAVE_KIND,
      schemaVersion: SAVE_SCHEMA_VERSION,
      appVersion: '1.4.503',
      savedAt: '2026-10-18T00:00:00.000Z',
      progress: {
        started: true,
        easyMode: true,
        theme: 'candy',
        completed: [],
        lastDailyDate: '2020-01-01',
        dailyDates: ['2020-01-01'],
        held: ['ph-road'],
        easyHeld: ['ph-road'],
      },
    }
    const context = await browser.newContext({ viewport: { width: 375, height: 667 } })
    await context.addInitScript(
      ([key, raw]) => {
        localStorage.clear()
        localStorage.setItem(key, raw)
      },
      [STORAGE_KEY, JSON.stringify(daySave)],
    )
    const page = await context.newPage()
    await page.goto(origin)
    await page.locator('main.hub').waitFor()
    const home = await signature(page)
    traces.push(`day-2 home ${home.sig} n=${home.golds.length} daily=${puzzle.challenge.kind}:${puzzle.challenge.id}`)
    assert.equal(home.golds.length, 1, 'day-2 home has one gold')
    assert.match(home.golds[0].text, /Read/, 'day-2 home gold is Read')
    assert.equal(await page.locator('.easy-night-watch').count(), 1, 'day-2 Home shows Night Watch')
    const dayNw = await page.locator('.easy-night-watch button').getAttribute('class')
    assert.doesNotMatch(dayNw || '', /gold|primary/, 'day-2 Night Watch stays secondary')
    assert.doesNotMatch(await page.locator('.easy-home-steps li').first().innerText(), /tomorrow/)
    await tapFilledGold(page)
    await page.locator('.daily-page, .teach-gate').first().waitFor()
    const teach = await signature(page)
    traces.push(`day-2 teach ${teach.sig} n=${teach.golds.length}`)
    assert.equal(teach.golds.length, 1, 'Read teach has one gold')
    await tapFilledGold(page)
    await finishRead(page, puzzle)
    await page.locator('main.hub').waitFor()
    if (await page.locator('.scene-ad').count()) {
      traces.push('day-2 quiet pause sits over Home; continue, then the lesson gold')
      await page.getByRole('button', { name: 'Continue the trail' }).click()
      await page.locator('.scene-ad').waitFor({ state: 'detached' })
    }
    const after = await signature(page)
    traces.push(`day-2 after-read ${after.sig} n=${after.golds.length}`)
    assert.equal(after.golds.length, 1, 'after Read, Home has one gold')
    assert.doesNotMatch(after.golds[0].text, /Read/, 'after Read, gold is the next Easy lesson')
    assert.equal(after.golds[0].disabled, false, 'the next lesson step is enabled after Read')
    await context.close()

    const proveSave = {
      kind: SAVE_KIND,
      schemaVersion: SAVE_SCHEMA_VERSION,
      appVersion: '1.4.496',
      savedAt: '2026-10-15T00:00:00.000Z',
      progress: {
        started: true,
        easyMode: true,
        theme: 'candy',
        completed: [],
        lastDailyDate: '2026-10-14',
        held: [],
        easyHeld: ['ph-road'],
      },
    }
    const prove = await browser.newContext({ viewport: { width: 375, height: 667 } })
    await prove.addInitScript(
      ([key, raw]) => {
        localStorage.clear()
        localStorage.setItem(key, raw)
      },
      [STORAGE_KEY, JSON.stringify(proveSave)],
    )
    const provePage = await prove.newPage()
    await provePage.goto(origin)
    await provePage.locator('.easy-night-watch button').waitFor()
    assert.equal(await provePage.locator('.easy-night-watch').count(), 1, 'a save with no open-day key still shows Night Watch')
    const proveNw = await provePage.locator('.easy-night-watch button').getAttribute('class')
    assert.doesNotMatch(proveNw || '', /gold|primary/, 'the seeded Night Watch card is not gold')
    traces.push('live-prove seed shows Night Watch')
    await prove.close()

    const human = await browser.newContext({ viewport: { width: 375, height: 667 } })
    const humanPage = await human.newPage()
    const humanErrors = []
    humanPage.on('pageerror', (error) => humanErrors.push(String(error)))
    await humanPage.goto(origin)
    await humanPage.locator('.welcome').waitFor()
    const humanTrace = []
    const humanSeen = new Set()
    async function humanStamp(label) {
      const shot = await signature(humanPage)
      humanTrace.push(`375x667 human ${label} ${shot.sig} n=${shot.golds.length}`)
      assert.ok(!humanSeen.has(shot.sig), `human repeated screen ${shot.sig}`)
      humanSeen.add(shot.sig)
      assert.notEqual(shot.id, 'night-watch', 'human gold follower opened Night Watch')
      if (playScreens(shot.id)) assert.equal(shot.golds.length, 0, `${label} play screen has a filled gold`)
      else assert.equal(shot.golds.length, 1, `${label} needs one filled gold ${JSON.stringify(shot.golds)}`)
      return shot
    }
    await humanStamp('welcome')
    await tapFilledGold(humanPage)
    await humanPage.locator('main.hub').waitFor()
    await humanStamp('home-fresh')
    const humanFresh = (await humanPage.locator('.easy-build-gift').innerText()).replace(/\s+/g, ' ').trim()
    assert.equal(humanFresh, 'Start your first road.')
    await tapFilledGold(humanPage)
    await humanPage.locator('.play.is-road-maze').waitFor()
    await humanStamp('maze')
    await playRoad(humanPage)
    await humanPage.locator('[data-maze-next]').waitFor()
    await humanStamp('maze-win')
    await tapFilledGold(humanPage)
    await humanPage.locator('.why-blast').waitFor()
    await humanStamp('quiz-road')
    await answerQuiz(humanPage, 'ph-road')
    await humanPage.locator('.why-blast.is-yes .btn.primary').waitFor()
    await humanStamp('quiz-road-done')
    await tapFilledGold(humanPage)
    await humanPage.locator('main.hub').waitFor()
    await humanStamp('home-after-road')
    await tapFilledGold(humanPage)
    await humanPage.locator('[data-run-pad], .play.is-father-run').first().waitFor()
    await humanStamp('run')
    await hugFatherHuman(humanPage)
    await humanStamp('run-win')
    await tapFilledGold(humanPage)
    await humanPage.locator('.why-blast').waitFor()
    await humanStamp('quiz-father')
    await answerQuiz(humanPage, 'ph-father')
    await humanPage.locator('.why-got-it').waitFor()
    const humanGot = await humanStamp('quiz-father-done')
    assert.match(humanGot.golds[0].text, /Continue/)
    await tapFilledGold(humanPage)
    await humanPage.locator('main.hub').waitFor()
    const humanHome = await humanStamp('home-tuning')
    const humanGift = (await humanPage.locator('.easy-build-gift').innerText()).replace(/\s+/g, ' ')
    assert.doesNotMatch(humanGift, /Build this/)
    assert.doesNotMatch(humanHome.golds[0].text, /Read/)
    assert.match(humanHome.golds[0].text, /Find the words/)
    assert.match(
      ((await humanPage.locator('.easy-home-whisper').innerText()) || '').replace(/\s+/g, ' '),
      /Find the words at Sky Watch/,
    )
    await tapFilledGold(humanPage)
    await humanPage.locator('.play.is-gem-search').waitFor()
    await humanStamp('gem')
    await playGem(humanPage)
    await humanPage.locator('.play.is-gem-search.is-win .btn.primary').waitFor()
    const humanGem = await humanStamp('gem-win')
    assert.match(humanGem.golds[0].text, /Lock In/)
    await tapFilledGold(humanPage)
    await humanPage.locator('.why-blast').waitFor()
    const humanScience = await humanStamp('quiz-tuning')
    assert.equal(humanScience.id, 'quiz', 'human-like Run still reaches ob-tuning Lock In')
    assert.equal(await humanPage.locator('.play.is-gem-search').count(), 0)
    assert.equal(humanErrors.join('\n'), '', 'human page errors')
    traces.push(humanTrace.join('\n'))
    await human.close()
  } finally {
    await browser.close()
    await server.close()
  }
  const text = traces.join('\n\n')
  mkdirSync('/opt/cursor/artifacts', { recursive: true })
  writeFileSync('/opt/cursor/artifacts/golden-live-trace.txt', text)
  console.log(text)
  console.log('check-golden-live: ok')
}

if (process.argv[1] && import.meta.url.endsWith(process.argv[1].split('/').pop())) {
  await checkGoldenLive()
}
