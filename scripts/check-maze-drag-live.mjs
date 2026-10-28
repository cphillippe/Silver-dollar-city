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
import { MAZE_PRESETS, setMazePreset, MAZE_START } from '../src/lib/roadMaze.ts'

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
const SHOT_ROOT = join(tmpdir(), 'maze-drag-861')

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

async function startWalkerTrace(page) {
  await page.evaluate(() => {
    window.__mazeWalkerTrace = []
    const record = () => {
      const here = document.querySelector('[data-maze-cell].is-here')
      if (!(here instanceof HTMLElement)) return
      const r = here.getAttribute('data-r')
      const c = here.getAttribute('data-c')
      if (r == null || c == null) return
      const id = `${r}:${c}`
      const trace = window.__mazeWalkerTrace
      if (!trace.length || trace[trace.length - 1] !== id) trace.push(id)
    }
    record()
    window.__mazeWalkerRecord = record
    window.__mazeWalkerObserver = new MutationObserver(record)
    const board = document.querySelector('.maze-board')
    if (board) {
      window.__mazeWalkerObserver.observe(board, { attributes: true, subtree: true, attributeFilter: ['class'] })
    }
    window.__mazeWalkerPoll = window.setInterval(record, 20)
  })
}

async function stopWalkerTrace(page) {
  return page.evaluate(() => {
    window.__mazeWalkerRecord?.()
    window.clearInterval(window.__mazeWalkerPoll)
    window.__mazeWalkerObserver?.disconnect()
    return window.__mazeWalkerTrace ?? []
  })
}

async function dragDiagonalAcrossRocksToInn(page, from, to) {
  const startBox = await cellBox(page, from)
  const innBox = await cellBox(page, to)
  const sx = startBox.x + startBox.width / 2
  const sy = startBox.y + startBox.height / 2
  const ix = innBox.x + innBox.width / 2
  const iy = innBox.y + innBox.height / 2
  await page.mouse.move(sx, sy)
  await page.mouse.down()
  const steps = 36
  for (let i = 1; i <= steps; i += 1) {
    const t = i / steps
    await page.mouse.move(sx + (ix - sx) * t, sy + (iy - sy) * t, { steps: 12 })
    await page.waitForTimeout(55)
  }
  await page.mouse.up()
  const deadline = Date.now() + 25_000
  while (Date.now() < deadline) {
    if (await page.locator('.play.is-road-maze.is-win').count()) break
    const here = page.locator('[data-maze-cell].is-here')
    if ((await here.count()) > 0) {
      const cell = await readCell(here)
      if (cell.r === to.r && cell.c === to.c) break
    }
    await page.waitForTimeout(80)
  }
  await page.locator('.play.is-road-maze.is-win').waitFor({ timeout: 5000 })
}

async function dragMazeThrough(page, cells, midShotPath, opts = {}) {
  const start = await page.locator('[data-maze-cell].is-here').boundingBox()
  if (!start) throw new Error('pawn drag has no box')
  await page.mouse.move(start.x + start.width / 2, start.y + start.height / 2)
  await page.mouse.down()
  for (let i = 0; i < cells.length; i += 1) {
    const cell = cells[i]
    const box = await cellBox(page, cell)
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 14 })
    await page.waitForTimeout(40)
    if (midShotPath && i === 2) {
      await page.waitForTimeout(160)
      await page.screenshot({ path: midShotPath })
    }
  }
  await page.mouse.up()
  const last = cells[cells.length - 1]
  if (opts.allowWinEnd) {
    await page.waitForFunction(
      ({ r, c }) => {
        if (document.querySelector('.play.is-road-maze.is-win')) return true
        const here = document.querySelector('[data-maze-cell].is-here')
        return here?.getAttribute('data-r') === String(r) && here?.getAttribute('data-c') === String(c)
      },
      last,
      { timeout: 20_000 },
    )
    return
  }
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
    mkdirSync(SHOT_ROOT, { recursive: true })
    await page.screenshot({ path: join(SHOT_ROOT, 'maze-drag-before-375.png') })
  }

  let at = await readCell(page.locator('[data-maze-cell].is-here'))
  let open = await loadOpen()
  const lPath = findLPath(at, open, 2)
  assert.ok(lPath, `${label}: need an L-shaped 4-tile corridor`)
  const midShot = opts.capture375 ? join(SHOT_ROOT, 'maze-drag-l-mid-375.png') : undefined
  await dragMazeThrough(page, lPath, midShot)
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
    await page.screenshot({ path: join(SHOT_ROOT, 'maze-drag-after-375.png') })
  }
}

function presetRoadKeys(preset) {
  const keys = new Set()
  preset.roads.forEach((row, r) => {
    row.forEach((v, c) => {
      if (v) keys.add(`${r}:${c}`)
    })
  })
  return keys
}

async function scoreStatusLine(page) {
  const text = (await page.locator('.match-score').innerText()).replace(/\s+/g, ' ').trim()
  const parts = text.split(' · ')
  return parts[parts.length - 1] ?? text
}

/** #877: drag through the tile beside the hurt man must not count as helping him. */
async function provePassByNoHelp(page, label) {
  setMazePreset(0)
  let open = await roadKeys(page)
  const leg1 = shortestPath({ r: 0, c: 0 }, { r: 4, c: 2 }, open)
  assert.ok(leg1 && leg1.length >= 2, `${label}: need a road from 0,0 to 4,2`)
  await dragMazeThrough(page, leg1.slice(1))
  assert.deepEqual(await readCell(page.locator('[data-maze-cell].is-here')), { r: 4, c: 2 })

  open = await roadKeys(page)
  const at = await readCell(page.locator('[data-maze-cell].is-here'))
  const leg2 = shortestPath(at, { r: 6, c: 2 }, open)
  assert.ok(leg2 && leg2.length >= 2, `${label}: need a road from 4,2 to 6,2 around the rock`)
  await startWalkerTrace(page)
  await dragMazeThrough(page, leg2.slice(1))
  const passTrace = await stopWalkerTrace(page)
  for (const id of passTrace) {
    assert.ok(open.has(id), `${label}: pass-by drag must stay on road tiles, not ${id}`)
  }

  assert.equal(await page.locator('.play.is-road-maze.is-helped').count(), 0, `${label}: pass-by must not help`)
  assert.notEqual(await scoreStatusLine(page), 'He is with you', `${label}: pass-by must not show helped score line`)
}

/** #877 a2: lifting at 6,2 while the walker is still passing 4,3 must not help him. */
async function proveLiftMidWalkPastManNoHelp(page, label) {
  setMazePreset(0)
  let open = await roadKeys(page)
  const leg1 = shortestPath({ r: 0, c: 0 }, { r: 4, c: 2 }, open)
  assert.ok(leg1 && leg1.length >= 2, `${label}: need leg1 to 4,2`)
  await dragMazeThrough(page, leg1.slice(1))
  await waitHere(page, { r: 4, c: 2 })

  open = await roadKeys(page)
  const leg2 = shortestPath({ r: 4, c: 2 }, { r: 6, c: 2 }, open)
  assert.ok(leg2 && leg2.length >= 2, `${label}: need leg2 to 6,2`)
  assert.ok(
    leg2.some((cell) => cell.r === 4 && cell.c === 3),
    `${label}: leg2 must pass beside the hurt man`,
  )

  const start = await cellBox(page, { r: 4, c: 2 })
  const end = await cellBox(page, { r: 6, c: 2 })
  await page.mouse.move(start.x + start.width / 2, start.y + start.height / 2)
  await page.mouse.down()
  for (let i = 1; i < leg2.length; i += 1) {
    const cell = leg2[i]
    const box = await cellBox(page, cell)
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 6 })
    await page.waitForTimeout(25)
  }
  await page.mouse.move(end.x + end.width / 2, end.y + end.height / 2, { steps: 4 })
  await page.mouse.up()

  assert.equal(
    await page.locator('.play.is-road-maze.is-helped').count(),
    0,
    `${label}: finger up at 6,2 while queue drains must not help`,
  )
  assert.notEqual(await scoreStatusLine(page), 'He is with you')
  await waitHere(page, { r: 6, c: 2 }, 20_000)
  assert.equal(
    await page.locator('.play.is-road-maze.is-helped').count(),
    0,
    `${label}: ending at 6,2 after the queue drains must not help`,
  )
}

async function proveMazeHowMin13NoJump(page, label, width, height) {
  await page.locator('[data-maze-how]').waitFor()
  const howPx = await page.locator('[data-maze-how]').evaluate((el) => parseFloat(getComputedStyle(el).fontSize))
  assert.ok(howPx >= 13, `${label}: maze-how font is ${howPx}px (need ≥13px)`)
  const boardBefore = await page.locator('.maze-board').evaluate((el) => {
    const r = el.getBoundingClientRect()
    return { x: r.x, y: r.y, w: r.width, h: r.height }
  })
  mkdirSync(SHOT_ROOT, { recursive: true })
  await page.screenshot({ path: join(SHOT_ROOT, `maze-how-${width}x${height}-before.png`) })

  const at = await readCell(page.locator('[data-maze-cell].is-here'))
  const open = await roadKeys(page)
  const next = STEP_DIRS.map((dir) => ({ r: at.r + dir.r, c: at.c + dir.c })).find((cell) => open.has(key(cell)))
  assert.ok(next, `${label}: need a road step to hide maze-how`)
  await tapMaze(page, next)
  await waitHere(page, next)
  assert.equal(await page.locator('[data-maze-how]').count(), 0, `${label}: maze-how unmounts after the first step`)
  assert.ok(
    (await page.locator('.maze-how-slot').count()) > 0,
    `${label}: maze-how slot keeps layout space after the first step`,
  )
  const boardAfter = await page.locator('.maze-board').evaluate((el) => {
    const r = el.getBoundingClientRect()
    return { x: r.x, y: r.y, w: r.width, h: r.height }
  })
  await page.screenshot({ path: join(SHOT_ROOT, `maze-how-${width}x${height}-after.png`) })
  for (const dim of ['x', 'y', 'w', 'h']) {
    assert.ok(
      Math.abs(boardBefore[dim] - boardAfter[dim]) < 0.6,
      `${label}: maze-board ${dim} jumped ${boardBefore[dim]} → ${boardAfter[dim]}`,
    )
  }
}

async function sideRoadBesideHurt(page) {
  const hurt = await readCell(page.locator('[data-maze-cell].is-hurt'))
  const open = await roadKeys(page)
  for (const dir of STEP_DIRS) {
    const cell = { r: hurt.r + dir.r, c: hurt.c + dir.c }
    if (open.has(key(cell)) && !(cell.r === hurt.r && cell.c === hurt.c)) return cell
  }
  throw new Error('no road cell beside the hurt man')
}

/** #877: stopping beside the hurt man by drag or tap still helps him. */
async function proveSideTileStillHelps(page, label, origin) {
  setMazePreset(0)
  const beside = await sideRoadBesideHurt(page)
  let open = await roadKeys(page)
  let at = await readCell(page.locator('[data-maze-cell].is-here'))
  const dragPath = shortestPath(at, beside, open)
  assert.ok(dragPath && dragPath.length >= 2, `${label}: drag path to side tile`)
  await dragMazeThrough(page, dragPath.slice(1))
  await page.locator('.play.is-road-maze.is-helped').waitFor({ timeout: 8000 })

  await openFreshMaze(page, origin)
  await reachHelpPhase(page)
}

async function walkToCell(page, target) {
  for (let guard = 0; guard < 48; guard += 1) {
    const at = await readCell(page.locator('[data-maze-cell].is-here'))
    if (at.r === target.r && at.c === target.c) return
    const open = await roadKeys(page)
    const path = shortestPath(at, target, open)
    assert.ok(path && path.length >= 2, `walk ${key(at)} → ${key(target)}`)
    await tapMaze(page, path[1])
    await waitHere(page, path[1])
  }
  throw new Error(`stuck walking to ${key(target)}`)
}

/** #877: drag to inn (line may cut across rocks) visits road tiles only; win dock shows without an extra tap. */
async function proveDragInnWinDock(page, label) {
  const hurt = await readCell(page.locator('[data-maze-cell].is-hurt'))
  const inn = await readCell(page.locator('[data-maze-cell].is-inn'))
  const open = await roadKeys(page)
  let here = await readCell(page.locator('[data-maze-cell].is-here'))
  if (here.r !== hurt.r || here.c !== hurt.c) {
    await tapWalk(page, here, hurt, open)
    here = hurt
  }
  const path = shortestPath(here, inn, open)
  assert.ok(path && path.length >= 3, `${label}: need a multi-step road route around rocks to the inn`)
  await startWalkerTrace(page)
  // CoS: straight line from hurt man to inn crosses rock tiles; walker stays on roads (#861).
  await dragDiagonalAcrossRocksToInn(page, here, inn)
  if (!(await page.locator('.play.is-road-maze.is-win').count())) {
    const mid =
      (await page.locator('[data-maze-cell].is-here').count()) > 0
        ? await readCell(page.locator('[data-maze-cell].is-here'))
        : here
    const tail = shortestPath(mid, inn, open)
    assert.ok(tail && tail.length >= 2, `${label}: road tail to inn after diagonal drag`)
    await dragMazeThrough(page, tail.slice(1), undefined, { allowWinEnd: true })
  }
  await page.waitForFunction(
    ({ r, c }) => {
      window.__mazeWalkerRecord?.()
      if (document.querySelector('.play.is-road-maze.is-win')) return true
      const here = document.querySelector('[data-maze-cell].is-here')
      return here?.getAttribute('data-r') === String(r) && here?.getAttribute('data-c') === String(c)
    },
    inn,
    { timeout: 20_000 },
  )
  await page.locator('.play.is-road-maze.is-win').waitFor({ timeout: 8000 })
  await page.evaluate(
    ({ r, c }) => {
      window.__mazeWalkerRecord?.()
      const want = `${r}:${c}`
      const trace = window.__mazeWalkerTrace ?? []
      if (document.querySelector('.play.is-road-maze.is-win') && !trace.includes(want)) trace.push(want)
    },
    inn,
  )
  const trace = await stopWalkerTrace(page)
  assert.ok(trace.length >= 2, `${label}: walker trace recorded during drag to inn`)
  for (const id of trace) {
    assert.ok(open.has(id), `${label}: walker must not stand on rock/non-road ${id} (trace=${trace.join('→')})`)
  }
  assert.ok(
    trace.includes(key(inn)),
    `${label}: win only after the walker stands on the inn road tile (trace=${trace.join('→')})`,
  )
  await page.locator('[data-maze-again]').waitFor({ state: 'visible', timeout: 2000 })
}

/** #877: replay must paint the next preset before input and keep it on the first tap. */
async function proveReplayPresetStable(page, label) {
  setMazePreset(0)
  await reachHelpPhase(page)
  const inn = await readCell(page.locator('[data-maze-cell].is-inn'))
  const here = await readCell(page.locator('[data-maze-cell].is-here'))
  const open = await roadKeys(page)
  const winPath = shortestPath(here, inn, open)
  assert.ok(winPath && winPath.length >= 2, `${label}: need a road to the inn before replay`)
  await dragMazeThrough(page, winPath.slice(1), undefined, { allowWinEnd: true })
  await page.locator('[data-maze-again]').waitFor({ timeout: 20_000 })
  await page.locator('[data-maze-again]').click()
  await page.locator('.play.is-road-maze:not(.is-win) [data-maze-cell].is-here').waitFor({ timeout: 8000 })

  const preset = MAZE_PRESETS[1]
  const wantRoads = presetRoadKeys(preset)
  const wantHurt = { ...preset.hurt }

  async function snapshot() {
    return {
      roads: await roadKeys(page),
      hurt: await readCell(page.locator('[data-maze-cell].is-hurt')),
    }
  }

  const before = await snapshot()
  assert.deepEqual(before.hurt, wantHurt, `${label}: hurt cell matches preset B before input`)
  assert.deepEqual(before.roads, wantRoads, `${label}: road tiles match preset B before input`)

  const at = await readCell(page.locator('[data-maze-cell].is-here'))
  const tapNext = STEP_DIRS.map((dir) => ({ r: at.r + dir.r, c: at.c + dir.c })).find(
    (cell) => before.roads.has(key(cell)),
  )
  assert.ok(tapNext, `${label}: need a road tile to tap`)
  await tapMaze(page, tapNext)
  await waitHere(page, tapNext)

  const after = await snapshot()
  assert.deepEqual(after.hurt, wantHurt, `${label}: hurt cell unchanged after first tap`)
  assert.deepEqual(after.roads, wantRoads, `${label}: road layout unchanged after first tap`)
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
    await proveMazeHowMin13NoJump(page, `${where} maze-how`, width, height)
    await openFreshMaze(page, origin)
    await provePassByNoHelp(page, `${where} pass-by`)
    await openFreshMaze(page, origin)
    await proveLiftMidWalkPastManNoHelp(page, `${where} lift-mid-walk`)
    await openFreshMaze(page, origin)
    await proveSideTileStillHelps(page, `${where} side-tile`, origin)
    await proveMazeDragAcceptance(page, {
      label: `${where} phase 1`,
      capture375: width === 375 && height === 667,
      origin,
    })
    mkdirSync(SHOT_ROOT, { recursive: true })
    await page.screenshot({ path: join(SHOT_ROOT, `maze-drag-p1-${width}x${height}.png`) })

    await openFreshMaze(page, origin)
    await reachHelpPhase(page)
    await proveDragInnWinDock(page, `${where} drag-inn-dock`)
    await openFreshMaze(page, origin)
    await reachHelpPhase(page)
    await proveMazeDragAcceptance(page, { label: `${where} phase 2`, avoidInn: true })
    await page.screenshot({ path: join(SHOT_ROOT, `maze-drag-p2-${width}x${height}.png`) })

    await openFreshMaze(page, origin)
    await proveReplayPresetStable(page, `${where} replay`)
    console.log(`check-maze-drag-live: ${where} ok`)
  } finally {
    await ctx.close()
  }
}

export async function checkMazeDragLive() {
  mkdirSync(SHOT_ROOT, { recursive: true })
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
