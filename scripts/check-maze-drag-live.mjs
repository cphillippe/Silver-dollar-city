#!/usr/bin/env node
/**
 * Easy L1 road maze — pointer drag acceptance (#861).
 * Real mouse drags at 375×667 and 390×844; phase 1 (find hurt man) and phase 2 (carry to inn).
 */
import assert from 'node:assert/strict'
import { existsSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { chromium } from 'playwright'
import { build, preview } from 'vite'
import { SAVE_KIND } from '../src/lib/save.ts'
import { SAVE_SCHEMA_VERSION, STORAGE_KEY } from '../src/config/app.ts'
import { APP_VERSION } from '../src/config/app.ts'
import { setMazePreset, MAZE_START } from '../src/lib/roadMaze.ts'

const VIEWPORTS = [
  [375, 667],
  [390, 844],
]
const STEP_DIRS = [
  { r: -1, c: 0 },
  { r: 1, c: 0 },
  { r: 0, c: -1 },
  { r: 0, c: 1 },
]
const ARTIFACT_SHOTS = '/opt/cursor/artifacts/screenshots'
const SHOT_ROOT = process.env.MAZE_DRAG_SHOT_ROOT ?? join(tmpdir(), 'maze-drag-live')

function key(cell) {
  return `${cell.r}:${cell.c}`
}

function freshSave() {
  return {
    kind: SAVE_KIND,
    schemaVersion: SAVE_SCHEMA_VERSION,
    appVersion: APP_VERSION,
    savedAt: new Date().toISOString(),
    progress: { started: true, easyMode: true, theme: 'candy', completed: [] },
  }
}

async function launchBrowser() {
  try {
    return await chromium.launch({ headless: true })
  } catch {
    return await chromium.launch({ headless: true, channel: 'chrome' })
  }
}

async function readCell(loc) {
  const r = Number(await loc.getAttribute('data-r'))
  const c = Number(await loc.getAttribute('data-c'))
  if (!Number.isFinite(r) || !Number.isFinite(c)) throw new Error('maze cell has no coordinates')
  return { r, c }
}

async function roadKeys(page) {
  const keys = await page.locator('[data-maze-cell].is-road').evaluateAll((nodes) =>
    nodes.map((node) => `${node.getAttribute('data-r')}:${node.getAttribute('data-c')}`),
  )
  return new Set(keys)
}

function straightRun(at, open, length) {
  for (const dir of STEP_DIRS) {
    const cells = []
    let cur = at
    for (let i = 0; i < length; i += 1) {
      const next = { r: cur.r + dir.r, c: cur.c + dir.c }
      if (!open.has(key(next))) break
      cells.push(next)
      cur = next
    }
    if (cells.length === length) return cells
  }
  return null
}

function findLPath(at, open, leg = 2) {
  for (const d1 of STEP_DIRS) {
    const first = []
    let cur = at
    let ok = true
    for (let i = 0; i < leg; i += 1) {
      cur = { r: cur.r + d1.r, c: cur.c + d1.c }
      if (!open.has(key(cur))) {
        ok = false
        break
      }
      first.push(cur)
    }
    if (!ok || first.length !== leg) continue
    for (const d2 of STEP_DIRS) {
      if (d1.r === d2.r && d1.c === d2.c) continue
      if (d1.r !== 0 && d2.r !== 0) continue
      if (d1.c !== 0 && d2.c !== 0) continue
      const second = []
      cur = first[first.length - 1]
      let ok2 = true
      for (let i = 0; i < leg; i += 1) {
        cur = { r: cur.r + d2.r, c: cur.c + d2.c }
        if (!open.has(key(cur))) {
          ok2 = false
          break
        }
        second.push(cur)
      }
      if (ok2 && second.length === leg) return [...first, ...second]
    }
  }
  return null
}

function findCellWithStraight(open, length) {
  for (const roadKey of open) {
    const [r, c] = roadKey.split(':').map(Number)
    const cell = { r, c }
    if (straightRun(cell, open, length)) return cell
  }
  return null
}

function shortestPath(from, to, open) {
  const start = key(from)
  const goal = key(to)
  if (!open.has(start) || !open.has(goal)) return null
  if (start === goal) return [from]
  const seen = new Set([start])
  const queue = [[from]]
  while (queue.length) {
    const trail = queue.shift()
    const last = trail[trail.length - 1]
    for (const dir of STEP_DIRS) {
      const next = { r: last.r + dir.r, c: last.c + dir.c }
      const id = key(next)
      if (!open.has(id) || seen.has(id)) continue
      const walk = [...trail, next]
      if (id === goal) return walk
      seen.add(id)
      queue.push(walk)
    }
  }
  return null
}

async function tapWalk(page, from, to, open) {
  const path = shortestPath(from, to, open)
  assert.ok(path && path.length >= 2, `tap walk ${key(from)} → ${key(to)}`)
  for (let i = 1; i < path.length; i += 1) {
    await tapMaze(page, path[i])
    await waitHere(page, path[i])
  }
}

function longestStraightFrom(at, open) {
  let best = null
  for (const dir of STEP_DIRS) {
    const cells = []
    let cur = at
    for (;;) {
      const next = { r: cur.r + dir.r, c: cur.c + dir.c }
      if (!open.has(key(next))) break
      cells.push(next)
      cur = next
    }
    if (cells.length >= 1 && (!best || cells.length > best.cells.length)) {
      best = { dir, cells }
    }
  }
  return best
}

async function cellBox(page, cell) {
  const box = await page.locator(`[data-maze-cell][data-r="${cell.r}"][data-c="${cell.c}"]`).boundingBox()
  if (!box) throw new Error(`maze cell ${cell.r},${cell.c} has no box`)
  return box
}

async function waitHere(page, cell, timeout = 15000) {
  await page.waitForFunction(
    ({ r, c }) => {
      const here = document.querySelector('[data-maze-cell].is-here')
      return here?.getAttribute('data-r') === String(r) && here?.getAttribute('data-c') === String(c)
    },
    cell,
    { timeout },
  )
}

async function dragMazeThrough(page, cells) {
  const start = await page.locator('[data-maze-cell].is-here').boundingBox()
  if (!start) throw new Error('pawn drag has no box')
  await page.mouse.move(start.x + start.width / 2, start.y + start.height / 2)
  await page.mouse.down()
  for (const cell of cells) {
    const box = await cellBox(page, cell)
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 14 })
    await page.waitForTimeout(40)
  }
  await page.mouse.up()
  const last = cells[cells.length - 1]
  try {
    await waitHere(page, last)
  } catch (error) {
    const here = await readCell(page.locator('[data-maze-cell].is-here'))
    throw new Error(`drag stuck at ${key(here)} wanted ${key(last)} path=${cells.map((c) => key(c)).join('→')}: ${error}`)
  }
}

async function dragMazePastEnd(page, path, dir, pastPx = 56) {
  const start = await page.locator('[data-maze-cell].is-here').boundingBox()
  if (!start) throw new Error('pawn drag has no box')
  await page.mouse.move(start.x + start.width / 2, start.y + start.height / 2)
  await page.mouse.down()
  for (const cell of path) {
    const box = await cellBox(page, cell)
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 10 })
  }
  const last = path[path.length - 1]
  const lastBox = await cellBox(page, last)
  const x = lastBox.x + lastBox.width / 2 + dir.c * pastPx
  const y = lastBox.y + lastBox.height / 2 + dir.r * pastPx
  await page.mouse.move(x, y, { steps: 8 })
  await page.mouse.up()
  await waitHere(page, last)
}

async function tapMaze(page, cell) {
  const box = await cellBox(page, cell)
  const x = box.x + box.width / 2
  const y = box.y + box.height / 2
  await page.mouse.move(x, y)
  await page.mouse.down()
  await page.mouse.up()
}

async function tapFilledGold(page) {
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
}

async function openFreshMaze(page, origin) {
  await page.goto(origin)
  if (await page.locator('.welcome').count()) await tapFilledGold(page)
  await page.locator('main.hub').waitFor({ timeout: 30_000 })
  await tapFilledGold(page)
  await page.locator('.play.is-road-maze').waitFor()
  await page.locator('[data-maze-cell].is-here').waitFor()
}

/**
 * Four drag asserts + tap from the current pawn tile.
 * @param {{ label?: string, capture375?: boolean, origin?: string, avoidInn?: boolean }} opts
 */
export async function proveMazeDragAcceptance(page, opts = {}) {
  const label = opts.label ?? 'maze drag'
  const origin = opts.origin

  async function loadOpen() {
    const open = await roadKeys(page)
    if (opts.avoidInn && (await page.locator('[data-maze-cell].is-inn').count())) {
      const inn = await readCell(page.locator('[data-maze-cell].is-inn'))
      open.delete(key(inn))
    }
    return open
  }

  if (opts.capture375) {
    mkdirSync(ARTIFACT_SHOTS, { recursive: true })
    await page.screenshot({ path: join(ARTIFACT_SHOTS, 'maze-drag-before-375.png') })
  }

  let at = await readCell(page.locator('[data-maze-cell].is-here'))
  let open = await loadOpen()
  const lPath = findLPath(at, open, 2)
  assert.ok(lPath, `${label}: need an L-shaped 4-tile corridor`)
  await dragMazeThrough(page, lPath)
  assert.deepEqual(
    await readCell(page.locator('[data-maze-cell].is-here')),
    lPath[lPath.length - 1],
    `${label}: L-drag through a turn ends under the finger (4 tiles)`,
  )

  for (const n of [2, 3, 4]) {
    if (origin) await openFreshMaze(page, origin)
    open = await loadOpen()
    at = await readCell(page.locator('[data-maze-cell].is-here'))
    let anchor = at
    let run = straightRun(anchor, open, n)
    if (!run) {
      anchor = findCellWithStraight(open, n)
      assert.ok(anchor, `${label}: need a ${n}-tile straight corridor`)
      await tapWalk(page, at, anchor, open)
      run = straightRun(anchor, open, n)
    }
    assert.ok(run, `${label}: ${n}-tile straight from ${key(anchor)}`)
    await dragMazeThrough(page, run)
    assert.deepEqual(
      await readCell(page.locator('[data-maze-cell].is-here')),
      run[n - 1],
      `${label}: ${n}-tile straight drag moves exactly ${n} tiles`,
    )
  }

  if (origin) await openFreshMaze(page, origin)
  open = await loadOpen()
  at = await readCell(page.locator('[data-maze-cell].is-here'))
  let straight = longestStraightFrom(at, open)
  if (!straight || straight.cells.length < 1) {
    const anchor = findCellWithStraight(open, 1)
    assert.ok(anchor, `${label}: need a corridor end to drag past`)
    await tapWalk(page, at, anchor, open)
    at = anchor
    straight = longestStraightFrom(at, open)
  }
  assert.ok(straight && straight.cells.length >= 1, `${label}: need a corridor end to drag past`)
  await dragMazePastEnd(page, straight.cells, straight.dir)
  assert.deepEqual(
    await readCell(page.locator('[data-maze-cell].is-here')),
    straight.cells[straight.cells.length - 1],
    `${label}: drag past corridor end stops on the last open tile`,
  )

  if (origin) await openFreshMaze(page, origin)
  open = await loadOpen()
  at = await readCell(page.locator('[data-maze-cell].is-here'))
  const tapNext = STEP_DIRS.map((dir) => ({ r: at.r + dir.r, c: at.c + dir.c })).find((cell) => open.has(key(cell)))
  assert.ok(tapNext, `${label}: need a tap target`)
  await tapMaze(page, tapNext)
  await waitHere(page, tapNext)
  assert.deepEqual(await readCell(page.locator('[data-maze-cell].is-here')), tapNext, `${label}: tap moves one tile`)

  if (opts.capture375) {
    await page.screenshot({ path: join(ARTIFACT_SHOTS, 'maze-drag-after-375.png') })
  }
}

async function reachHelpPhase(page) {
  const hurt = await readCell(page.locator('[data-maze-cell].is-hurt'))
  const at = await readCell(page.locator('[data-maze-cell].is-here'))
  const open = await roadKeys(page)
  const dirs = STEP_DIRS
  const neighbors = dirs
    .map((dir) => ({ r: hurt.r + dir.r, c: hurt.c + dir.c }))
    .filter((cell) => open.has(key(cell)) && !(cell.r === hurt.r && cell.c === hurt.c))
  let beside = neighbors.find((cell) => cell.r === at.r && cell.c === at.c)
  if (!beside) {
    for (const cell of neighbors) {
      const queue = [[at]]
      const seen = new Set([key(at)])
      let found = null
      while (queue.length && !found) {
        const trail = queue.shift()
        const last = trail[trail.length - 1]
        if (last.r === cell.r && last.c === cell.c) {
          found = trail
          break
        }
        for (const dir of dirs) {
          const next = { r: last.r + dir.r, c: last.c + dir.c }
          const id = key(next)
          if (!open.has(id) || seen.has(id)) continue
          seen.add(id)
          queue.push([...trail, next])
        }
      }
      if (found && found.length >= 2) {
        for (let i = 1; i < found.length; i += 1) {
          await tapMaze(page, found[i])
          await waitHere(page, found[i])
        }
        beside = cell
        break
      }
    }
  }
  assert.ok(beside, 'could not reach a tile beside the hurt man')
  await page.locator('.play.is-road-maze.is-helped').waitFor({ timeout: 8000 })
}

async function runViewport(browser, origin, width, height) {
  const ctx = await browser.newContext({ viewport: { width, height } })
  await ctx.addInitScript(
    ([storageKey, raw]) => {
      localStorage.clear()
      localStorage.setItem(storageKey, raw)
    },
    [STORAGE_KEY, JSON.stringify(freshSave())],
  )
  const page = await ctx.newPage()
  const where = `${width}x${height}`
  try {
    await openFreshMaze(page, origin)
    await proveMazeDragAcceptance(page, {
      label: `${where} phase 1`,
      capture375: width === 375 && height === 667,
      origin,
    })
    mkdirSync(SHOT_ROOT, { recursive: true })
    await page.screenshot({ path: join(SHOT_ROOT, `maze-drag-p1-${width}x${height}.png`) })

    await openFreshMaze(page, origin)
    await reachHelpPhase(page)
    await proveMazeDragAcceptance(page, { label: `${where} phase 2`, avoidInn: true })
    await page.screenshot({ path: join(SHOT_ROOT, `maze-drag-p2-${width}x${height}.png`) })
    console.log(`check-maze-drag-live: ${where} ok`)
  } finally {
    await ctx.close()
  }
}

export async function checkMazeDragLive() {
  setMazePreset(0)
  assert.deepEqual(MAZE_START, { r: 0, c: 0 })
  if (!existsSync(join(process.cwd(), 'dist/index.html'))) {
    await build({ logLevel: 'warn' })
  }
  const server = await preview({
    preview: { host: '127.0.0.1', port: 0 },
    logLevel: 'warn',
  })
  const address = server.httpServer?.address()
  const port = typeof address === 'object' && address ? address.port : 4173
  const origin = `http://127.0.0.1:${port}/`
  const browser = await launchBrowser()
  try {
    for (const [width, height] of VIEWPORTS) {
      await runViewport(browser, origin, width, height)
    }
  } finally {
    await browser.close()
    await server.close()
  }
}

if (import.meta.url.startsWith('file:') && process.argv[1]?.endsWith('check-maze-drag-live.mjs')) {
  await checkMazeDragLive()
}
