/**
 * Built-app gold follower. Fresh save, 375×667 and 390×844.
 * Taps only the one visible filled gold. Play screens are scripted.
 */
import assert from 'node:assert/strict'
import { mkdirSync, writeFileSync } from 'node:fs'
import { chromium } from 'playwright'
import { build, preview } from 'vite'
import { evidenceForTier } from '../src/content/evidence.ts'
import { DAILY_POOL, dailyForDate } from '../src/content/daily.ts'
import { findStraightSpelling } from '../src/lib/gemSearchGrid.ts'
import { gemWordsFor } from '../src/lib/gemSearch.ts'
import { EASY, easyChromeLine, easyFacingLine, easyReasonHint, easyWhyLine, easyWrongTap } from '../src/lib/easy.ts'
import { FATHER_RUN_HINT } from '../src/easyTrail/father/fatherRun.ts'
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

function isGoldPaint(value) {
  const re = /rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/g
  let match
  while ((match = re.exec(value || ''))) {
    const r = Number(match[1])
    const g = Number(match[2])
    const b = Number(match[3])
    if (r > 190 && g > 140 && b < 120 && r > b + 60 && g > b + 30) return true
  }
  return false
}

async function assertMazeOneGold(page, where) {
  assert.equal((await filledGolds(page)).length, 0, `${where} has no filled gold button`)
  const cues = await page.evaluate(() => {
    const goldish = (value) => {
      const re = /rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/g
      let match
      while ((match = re.exec(value || ''))) {
        const r = Number(match[1])
        const g = Number(match[2])
        const b = Number(match[3])
        if (r > 190 && g > 140 && b < 120 && r > b + 60 && g > b + 30) return true
      }
      return false
    }
    const here = document.querySelector('[data-maze-cell].is-here')
    const hereStyle = here ? getComputedStyle(here) : null
    const goldCells = [...document.querySelectorAll('[data-maze-cell]')].filter((el) => {
      const style = getComputedStyle(el)
      return goldish(style.boxShadow) || goldish(style.outlineColor) || goldish(style.borderColor)
    }).length
    return {
      goals: document.querySelectorAll('[data-maze-cell].is-goal').length,
      goldCells,
      hereShadow: hereStyle?.boxShadow || '',
      hereGold: hereStyle ? goldish(hereStyle.boxShadow) || goldish(hereStyle.outlineColor) : true,
    }
  })
  assert.equal(cues.goals, 1, `${where} has one goal pulse`)
  assert.equal(cues.goldCells, 1, `${where} has one gold maze cell`)
  assert.equal(cues.hereGold, false, `${where} pawn glow is not gold (${cues.hereShadow})`)
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

async function dragMazeThrough(page, cells) {
  const start = await page.locator('[data-maze-cell].is-here').boundingBox()
  if (!start) throw new Error('pawn drag has no box')
  await page.mouse.move(start.x + start.width / 2, start.y + start.height / 2)
  await page.mouse.down()
  for (const cell of cells) {
    const box = await page.locator(`[data-maze-cell][data-r="${cell.r}"][data-c="${cell.c}"]`).boundingBox()
    if (!box) throw new Error(`maze cell ${cell.r},${cell.c} has no box`)
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 8 })
  }
  await page.mouse.up()
  const last = cells[cells.length - 1]
  await page.waitForFunction(
    ({ r, c }) => {
      const here = document.querySelector('[data-maze-cell].is-here')
      return here?.getAttribute('data-r') === String(r) && here?.getAttribute('data-c') === String(c)
    },
    last,
    { timeout: 4000 },
  )
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
  await assertMazeOneGold(page, 'maze start')
  await page.screenshot({ path: `${SHOTS}/maze-375.png` })
}

async function assertMazeDrag(page) {
  const at = await readCell(page.locator('[data-maze-cell].is-here'))
  const open = await roadKeys(page)
  const rockBox = await page.locator('[data-maze-cell].is-rock').first().boundingBox()
  const pawnBox = await page.locator('[data-maze-cell].is-here').boundingBox()
  if (!rockBox || !pawnBox) throw new Error('maze drag boxes missing')
  await page.mouse.move(rockBox.x + rockBox.width / 2, rockBox.y + rockBox.height / 2)
  await page.mouse.down()
  await page.mouse.move(pawnBox.x + pawnBox.width / 2, pawnBox.y + pawnBox.height / 2, { steps: 8 })
  await page.mouse.up()
  assert.deepEqual(await readCell(page.locator('[data-maze-cell].is-here')), at, 'a drag that starts on rock does not move the pawn')

  const two = straightRun(at, open, 2)
  if (!two) throw new Error('no 2-tile straight from the pawn')
  await dragMazeThrough(page, two)
  assert.deepEqual(await readCell(page.locator('[data-maze-cell].is-here')), two[1], 'a 2-tile drag steps two road tiles')
  assert.equal(await page.locator('[data-maze-how]').count(), 0, 'maze-how hides after the first step')
  await assertMazeOneGold(page, 'maze after a straight drag')

  const mid = two[1]
  const openMid = await roadKeys(page)
  const three = straightRun(mid, openMid, 3)
  if (!three) throw new Error(`no 3-tile straight from ${key(mid)}`)
  await dragMazeThrough(page, three)
  assert.deepEqual(await readCell(page.locator('[data-maze-cell].is-here')), three[2], 'a 3-tile drag steps three road tiles')

  const here = await readCell(page.locator('[data-maze-cell].is-here'))
  const openHere = await roadKeys(page)
  const next = STEP_DIRS.map((dir) => ({ r: here.r + dir.r, c: here.c + dir.c })).find((cell) => openHere.has(key(cell)))
  if (!next) throw new Error('the pawn has no road neighbor')
  await dragMazeThrough(page, [next])
  assert.deepEqual(await readCell(page.locator('[data-maze-cell].is-here')), next, 'a 1-tile drag steps one cell')

  const parked = await readCell(page.locator('[data-maze-cell].is-here'))
  const openParked = await roadKeys(page)
  let far = null
  let farPath = null
  for (const roadKey of openParked) {
    const [r, c] = roadKey.split(':').map(Number)
    const cell = { r, c }
    const path = shortest(parked, cell, openParked)
    if (path && path.length > 3) {
      far = cell
      farPath = path
      break
    }
  }
  if (!far || !farPath) throw new Error('no far road tap')
  await tapMaze(page, far)
  await page.waitForTimeout(450)
  assert.deepEqual(
    await readCell(page.locator('[data-maze-cell].is-here')),
    farPath[1],
    'a far tap steps one road tile',
  )
  await assertMazeOneGold(page, 'maze after a far tap')
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
  await assertMazeOneGold(page, 'maze after Help')
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

async function watchMissMount(page) {
  await page.evaluate(() => {
    window.__missMountAt = 0
    window.__runPress = []
    if (window.__missObs) window.__missObs.disconnect()
    const stampMiss = () => {
      if (window.__missMountAt) return
      if (document.querySelector('.run-miss')) window.__missMountAt = performance.now()
    }
    const obs = new MutationObserver(stampMiss)
    obs.observe(document.body, { childList: true, subtree: true })
    window.__missObs = obs
    if (window.__runPressListener) {
      document.removeEventListener('pointerdown', window.__runPressListener.down, true)
      document.removeEventListener('pointerup', window.__runPressListener.up, true)
    }
    const listen = (type) => (event) => {
      window.__runPress.push({
        type,
        t: performance.now(),
        x: event.clientX,
        y: event.clientY,
      })
    }
    const down = listen('down')
    const up = listen('up')
    window.__runPressListener = { down, up }
    document.addEventListener('pointerdown', down, true)
    document.addEventListener('pointerup', up, true)
  })
}

async function mountAge(page, mountAt) {
  const now = await page.evaluate(() => performance.now())
  return now - mountAt
}

function pressesOnGold(log, mountAt, box) {
  return log.filter(
    (row) =>
      row.t >= mountAt &&
      row.x >= box.x - 2 &&
      row.x <= box.x + box.width + 2 &&
      row.y >= box.y - 2 &&
      row.y <= box.y + box.height + 2,
  )
}

/** Press the miss gold about 470 ms after it mounts, and let go by 500 ms. */
async function pressGoldInsideArm(page, mountAt, box) {
  const x = box.x + box.width / 2
  const y = box.y + box.height / 2
  await page.mouse.move(x, y)
  const tripStart = Date.now()
  await page.evaluate(() => performance.now())
  const rtt = Math.max(8, Date.now() - tripStart)
  const age = await mountAge(page, mountAt)
  const sendAt = 470 - 2 * rtt
  if (age < sendAt) {
    await page.evaluate(
      (ms) => new Promise((resolve) => window.setTimeout(resolve, ms)),
      sendAt - age,
    )
  }
  await page.mouse.down()
  await page.mouse.up()
  const log = await page.evaluate(() => window.__runPress.slice())
  const hits = pressesOnGold(log, mountAt, box)
  const down = hits.find((row) => row.type === 'down')
  const up = hits.find((row) => row.type === 'up' && (!down || row.t >= down.t))
  assert.ok(down, `miss gold received a press ${JSON.stringify(hits)}`)
  assert.ok(up, 'miss gold received a release')
  const downAge = down.t - mountAt
  const upAge = up.t - mountAt
  assert.ok(downAge >= 440 && downAge <= 495, `press is about 470 ms from the miss (${Math.round(downAge)})`)
  assert.ok(upAge <= 500, `release is at or before 500 ms (${Math.round(upAge)})`)
}

/** Click the same gold after the arm, with a real pointer. */
async function clickGoldAfterArm(page, mountAt, box) {
  const x = box.x + box.width / 2
  const y = box.y + box.height / 2
  const age = await mountAge(page, mountAt)
  if (age < 650) {
    await page.evaluate(
      (ms) => new Promise((resolve) => window.setTimeout(resolve, ms)),
      650 - age,
    )
  }
  await page.mouse.click(x, y)
  const log = await page.evaluate(() => window.__runPress.slice())
  const down = pressesOnGold(log, mountAt, box)
    .filter((row) => row.type === 'down')
    .at(-1)
  assert.ok(down, 'reset click landed on the miss gold')
  const clickAge = down.t - mountAt
  assert.ok(clickAge >= 620, `reset click is after about 650 ms (${Math.round(clickAge)})`)
}

async function releaseRun(page, shotMiss = false, inspect) {
  await watchMissMount(page)
  const pad = page.locator('[data-run-pad="hold"]')
  await pad.waitFor({ timeout: 15000 })
  await pad.scrollIntoViewIfNeeded()
  const box = await pad.boundingBox()
  if (!box) throw new Error('run pad has no box')
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
  await page.mouse.down()
  await page.waitForTimeout(160)
  const snap = await readRunCue(page)
  assert.equal(snap?.faces?.length, 1, 'one run cue')
  assert.equal(snap?.faces?.[0], 'Hold', 'the pad label stays Hold')
  assert.equal(snap?.label, 'Hold', 'the pad label stays Hold')
  assert.equal(snap?.glow, false, 'Easy pad does not flip to the pink Tap')
  await page.mouse.up()
  let sawLast = false
  const deadline = Date.now() + 18000
  while (Date.now() < deadline) {
    if (await page.locator('.run-miss').count()) break
    const count = ((await page.locator('.run-speech-count').innerText().catch(() => '')) || '')
      .replace(/\s+/g, ' ')
      .trim()
    if (!sawLast && /4 \/ 4 · Last line! Run!/.test(count)) {
      const cls = (await page.locator('.run-speech').getAttribute('class')) || ''
      assert.match(cls, /\bis-last\b/, 'phrase 4 is urgent, not a button')
      assert.doesNotMatch(cls, /\bprimary\b/)
      if (shotMiss) await page.screenshot({ path: `${SHOTS}/run-last-line-375.png` })
      sawLast = true
    }
    await page.waitForTimeout(40)
  }
  await page.locator('.run-miss').waitFor({ timeout: 1000 })
  assert.equal(sawLast, true, 'phrase 4 says Last line before the miss')
  const mountAt = await page.evaluate(() => window.__missMountAt || 0)
  assert.ok(mountAt > 0, 'MutationObserver saw the .run-miss mount')
  const retry = page.locator('.run-miss .btn.primary')
  const retryBox = await retry.boundingBox()
  if (!retryBox) throw new Error('miss gold has no box')
  await pressGoldInsideArm(page, mountAt, retryBox)
  assert.equal(await page.locator('.run-miss').count(), 1, 'a tap during arming does not reset the round')
  const during = ((await page.locator('.run-speech-count').innerText()) || '').replace(/\s+/g, ' ').trim()
  assert.equal(during, EASY.runAlmost, 'arming keeps the miss copy')
  assert.notEqual(during, '0 / 4')
  const hint = ((await page.locator('.run-miss-hint').innerText()) || '').replace(/\s+/g, ' ').trim()
  assert.equal(hint, FATHER_RUN_HINT)
  const closer = ((await page.locator('.run-miss .quiet').innerText()) || '').replace(/\s+/g, ' ').trim()
  assert.equal(closer, 'Try again — you start closer.')
  const golds = await filledGolds(page)
  assert.equal(golds.length, 1, `miss has one filled gold ${JSON.stringify(golds)}`)
  const goldCls = (await retry.getAttribute('class')) || ''
  assert.match(goldCls, /\bprimary\b/, 'run-fail gold is .btn.primary')
  assert.doesNotMatch(goldCls, /\bgold\b/, 'run-fail gold is not the pale .btn.gold')
  if (shotMiss) await page.screenshot({ path: `${SHOTS}/run-miss-almost-375.png` })
  if (inspect) await inspect()
  await clickGoldAfterArm(page, mountAt, retryBox)
  await page.locator('[data-run-pad="hold"]').waitFor({ timeout: 4000 })
  assert.equal(await page.locator('.run-miss').count(), 0, 'a click after the arm resets the miss')
  assert.equal(await page.locator('.play.is-father-run.is-win').count(), 0, 'the reset is not a hug')
  const resetCount = ((await page.locator('.run-speech-count').innerText()) || '').replace(/\s+/g, ' ').trim()
  assert.equal(resetCount, '0 / 4', 'the reset count is 0 / 4')
  assert.equal(await page.locator('[aria-label="Choose a map"]').count(), 0, 'run-fail gold did not open Choose a map')
  assert.equal(await page.locator('.nw-map-overlay').count(), 0, 'run-fail gold did not open the map overlay')
  assert.equal(await page.locator('.defend-page').count(), 0, 'run-fail gold did not open Night Watch')
  assert.equal(await page.locator('.play.is-father-run').count(), 1, 'run-fail gold stays on the father run')
}

/** Gold-only. Two real misses, then Keep going starts a close round the player still has to hold. */
async function hugFatherHuman(page) {
  await releaseRun(page, true, async () => {
    const again = ((await page.locator('.run-miss .btn.primary').innerText()) || '').replace(/\s+/g, ' ').trim()
    assert.equal(again, 'Run again', 'miss 1 gold is Run again')
    assert.equal(await page.locator('[data-run-keep]').count(), 0, 'miss 1 has no Keep going')
  })
  await page.locator('[data-run-pad="hold"]').waitFor()
  assert.equal(await page.locator('[data-run-how]').count(), 0, 'the rule does not return after Run again')
  assert.equal(await page.locator('.play.is-father-run.is-win').count(), 0, 'Run again does not hug')

  await releaseRun(page, false, async () => {
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
  })
  const assistPad = page.locator('[data-run-pad="hold"]')
  await assistPad.waitFor({ timeout: 4000 })
  assert.equal(await page.locator('.play.is-father-run.is-win').count(), 0, 'Keep going does not grant HUGGED')
  const assistBox = await assistPad.boundingBox()
  if (!assistBox) throw new Error('assisted pad has no box')
  await page.mouse.move(assistBox.x + assistBox.width / 2, assistBox.y + assistBox.height / 2)
  await page.mouse.down()
  await page.locator('.play.is-father-run.is-win').waitFor({ timeout: 5000 })
  await page.mouse.up().catch(() => {})
  await page.locator('.win-stamp', { hasText: 'Hugged!' }).waitFor({ timeout: 4000 })
  const winGolds = await filledGolds(page)
  assert.equal(winGolds.length, 1, `assisted win has one filled gold ${JSON.stringify(winGolds)}`)
  await page.screenshot({ path: `${SHOTS}/run-assisted-win-375.png` })
}

async function fatherRunEnd(page) {
  if (await page.locator('.play.is-father-run.is-win').count()) return 'win'
  if (await page.locator('.run-miss').count()) return 'miss'
  return ''
}

/** Press the hold pad. A hug unmounts the pad in the same turn as the glow tap. */
async function pressRunPad(page, pad) {
  const before = await fatherRunEnd(page)
  if (before) return before
  let box = null
  try {
    box = await pad.boundingBox({ timeout: 2000 })
  } catch {
    box = null
  }
  if (!box) {
    const after = await fatherRunEnd(page)
    if (after) return after
    const text = ((await page.locator('body').innerText().catch(() => '')) || '')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 240)
    throw new Error(`run pad has no box (${text})`)
  }
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
  await page.mouse.down()
  return 'down'
}

function finishFatherPress(state) {
  if (state === 'win') return 'win'
  if (state === 'miss') throw new Error('father run missed')
  if (state !== 'down') throw new Error('run pad has no box')
  return 'down'
}

async function hugFather(page) {
  const pad = page.locator('[data-run-pad="hold"]')
  await pad.waitFor({ timeout: 15000 })
  await pad.scrollIntoViewIfNeeded()
  const state = finishFatherPress(await pressRunPad(page, pad))
  if (state === 'win') return
  const start = Date.now()
  while (Date.now() - start < 12000) {
    const end = await fatherRunEnd(page)
    if (end === 'win') {
      await page.mouse.up().catch(() => {})
      return
    }
    if (end === 'miss') {
      await page.mouse.up().catch(() => {})
      throw new Error('father run missed')
    }
    const snap = await readRunCue(page)
    if (snap && (snap.label === 'Tap' || snap.glow || (snap.faces || []).some((face) => face !== 'Hold'))) {
      await page.mouse.up().catch(() => {})
      throw new Error(`Easy pad left Hold ${JSON.stringify(snap)}`)
    }
    await page.waitForTimeout(50)
  }
  await page.mouse.up().catch(() => {})
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

async function assertGemWinOneGold(page, label) {
  const view = page.viewportSize()
  if (view?.width !== 390 || view?.height !== 844) return
  const golds = await filledGolds(page)
  assert.equal(golds.length, 1, `${label} results one gold at 390 ${JSON.stringify(golds)}`)
  assert.match(golds[0].text, /Lock In/)
  const extras = await page.locator('.play.is-gem-search.is-win .cta-dock .btn:not(.primary)').evaluateAll((els) =>
    els.map((el) => {
      const style = getComputedStyle(el)
      return {
        text: (el.innerText || '').replace(/\s+/g, ' ').trim(),
        border: style.borderTopColor,
        bg: style.backgroundColor,
        img: style.backgroundImage,
      }
    }),
  )
  for (const button of extras) {
    assert.equal(isGoldPaint(button.border), false, `${label} ${button.text} border is not gold (${button.border})`)
    assert.equal(isGoldPaint(button.bg) || isGoldPaint(button.img), false, `${label} ${button.text} fill is not gold`)
  }
}

async function assertGemStart(page, lineId, { shot = false } = {}) {
  await page.locator('[data-gem-start]').waitFor()
  const hint = ((await page.locator('[data-gem-start]').innerText()) || '').replace(/\s+/g, ' ').trim()
  assert.equal(hint, EASY.bonusMissStraight, `${lineId} start hint`)
  assert.equal(await page.locator('[data-gem-start-cell].is-start-gold').count(), 1, `${lineId} one start pulse`)
  assert.equal((await filledGolds(page)).length, 0, `${lineId} word search has no filled gold`)
  if (shot) {
    await page.locator('[data-gem-start]').scrollIntoViewIfNeeded()
    await page.screenshot({ path: `${SHOTS}/word-search-start-375.png` })
  }
}

function spellsForward(letters, word, start) {
  const dirs = [
    { r: 0, c: 1 },
    { r: 1, c: 0 },
    { r: 1, c: 1 },
  ]
  return dirs.some((dir) => {
    for (let i = 0; i < word.length; i += 1) {
      const row = letters[start.r + dir.r * i]
      if (!row || row[start.c + dir.c * i] !== word[i]) return false
    }
    return word.length > 0
  })
}

async function playGem(page, lineId = 'ob-tuning', { watchLast = false, checkStart = false } = {}) {
  await page.locator('[data-gem-cell]').first().waitFor()
  const words = gemWordsFor(lineId).map((word) => word.text)
  const juice = { burst: 0, pop: false }
  let startChecked = false
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
    if (checkStart && !startChecked) {
      const view = page.viewportSize()
      await assertGemStart(page, lineId, {
        shot: view?.width === 375 && view?.height === 667 && lineId === 'ob-tuning',
      })
      startChecked = true
    }
    const path = findStraightSpelling(letters, word)
    if (!path) throw new Error(`${lineId} word ${word} is not on the board`)
    const foundBefore = await page.locator('.match-teach-chip.is-found').count()
    const expectJuice = watchLast && word === words[words.length - 1]
    if (expectJuice) {
      await page.evaluate(() => {
        window.__gemJuice = 0
        window.__gemJuiceStop = false
        const watch = () => {
          const pop = document.querySelector('.gem-find-pop')
          const burst = document.querySelectorAll('.gem-cell.is-burst').length
          if (pop && burst > 0) {
            const box = pop.getBoundingClientRect()
            const opacity = Number(getComputedStyle(pop).opacity)
            if (box.height > 0 && opacity > 0.15) window.__gemJuice = Math.max(window.__gemJuice, burst)
          }
          if (!window.__gemJuice && !window.__gemJuiceStop) requestAnimationFrame(watch)
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
    if (checkStart) {
      assert.equal(await page.locator('[data-gem-start]').count(), 0, `${lineId} start hint clears on the first find`)
      await page.waitForFunction(() => document.querySelectorAll('.gem-cell.is-burst').length === 0, undefined, {
        timeout: 4000,
      })
      const won = (await page.locator('.play.is-gem-search.is-win').count()) > 0
      const pulses = page.locator('[data-gem-start-cell].is-start-gold')
      if (won) {
        assert.equal(await pulses.count(), 0, `${lineId} no start pulse after MATCHED`)
      } else {
        await page.waitForFunction(
          () => document.querySelectorAll('[data-gem-start-cell].is-start-gold').length === 1,
          undefined,
          { timeout: 4000 },
        )
        const cells = await pulses.evaluateAll((els) =>
          els.map((el) => ({
            r: Number(el.getAttribute('data-r')),
            c: Number(el.getAttribute('data-c')),
            shadow: getComputedStyle(el).boxShadow,
          })),
        )
        assert.equal(cells.length, 1, `${lineId} one pulse after a find`)
        assert.equal(isGoldPaint(cells[0].shadow), true, `${lineId} pulse glow is gold`)
        const nextLabel = (
          (await page.locator('.match-teach-dock .match-teach-chip:not(.is-found) .match-teach-label').first().innerText()) || ''
        )
          .replace(/[^A-Za-z]/g, '')
          .toUpperCase()
        const lettersNow = await readGrid(page)
        assert.ok(
          spellsForward(lettersNow, nextLabel, cells[0]),
          `${lineId} pulse ${cells[0].r},${cells[0].c} is the first letter of ${nextLabel}`,
        )
      }
    }
    if (expectJuice) {
      await page.waitForFunction(() => window.__gemJuice > 0, undefined, { timeout: 2500 }).catch(() => {})
      await page.evaluate(() => {
        window.__gemJuiceStop = true
      })
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
  assert.equal(face.tap, 'Slide the card that shows why.', where)
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
  const claimGold = await page.locator('.why-claim').evaluate((el) => getComputedStyle(el).borderTopColor)
  assert.ok(isGoldPaint(claimGold), `${id} MAIN IDEA outline is the gold cue (${claimGold})`)
  if (page.viewportSize()?.width === 375) {
    assert.equal(face.descender, true, `${id} keeps the g descender (${face.lineHeight})`)
    await page.screenshot({ path: `${SHOTS}/lock-in-drag-cue-375.png` })
  }
  const chip = page.locator('button.why-chip', { hasText: why }).first()
  await chip.waitFor()
  const box = await chip.boundingBox()
  if (!box) throw new Error('why chip has no box')
  const x = box.x + Math.min(28, box.width / 2)
  const y = box.y + box.height / 2
  await page.mouse.move(x, y)
  await page.mouse.down()
  await page.mouse.move(x + 8, y, { steps: 3 })
  await page.waitForTimeout(60)
  assert.equal(await page.locator('.why-blast.is-yes, .why-blast.is-win').count(), 0, `${id} 8px slide does not pick`)
  await page.mouse.move(x + 20, y, { steps: 4 })
  await page.locator('.why-blast.is-yes, .why-blast.is-win').first().waitFor({ timeout: 8000 })
  await page.mouse.up()
  assert.equal(await page.locator('[data-drag-cue], .why-drag-cue').count(), 0)
}

async function assertLocked(page, label) {
  await page.locator('.why-blast.is-win .win-stamp').waitFor()
  const look = await page.evaluate(() => {
    const goldish = (value) => {
      const re = /rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/g
      let match
      while ((match = re.exec(value || ''))) {
        const r = Number(match[1])
        const g = Number(match[2])
        const b = Number(match[3])
        if (r > 190 && g > 140 && b < 120 && r > b + 60 && g > b + 30) return true
      }
      return false
    }
    const stamp = document.querySelector('.why-blast.is-win .win-stamp')
    const dock = document.querySelector('.why-blast.is-win .cta-dock')
    const arena = document.querySelector('.why-blast.is-win .why-arena')
    const keep = document.querySelector('.why-keep-card')
    const loose = [...document.querySelectorAll('.why-got-it, .why-blast .quiet')]
      .filter((el) => !el.closest('.why-keep-card'))
      .map((el) => (el.textContent || '').replace(/\s+/g, ' ').trim())
      .filter(Boolean)
    const stampStyle = stamp ? getComputedStyle(stamp) : null
    const dockStyle = dock ? getComputedStyle(dock) : null
    const arenaStyle = arena ? getComputedStyle(arena) : null
    return {
      stampText: (stamp?.textContent || '').replace(/\s+/g, ' ').trim(),
      stampBg: stampStyle?.backgroundColor || '',
      stampImg: stampStyle?.backgroundImage || '',
      stampGold: stampStyle ? goldish(stampStyle.backgroundColor) || goldish(stampStyle.backgroundImage) : true,
      btnBottom: Math.round(document.querySelector('.why-blast.is-win .btn.primary')?.getBoundingClientRect().bottom || 9999),
      inner: window.innerHeight,
      scrollY: window.scrollY,
      dockBg: dockStyle?.backgroundColor || '',
      arenaRadius: arenaStyle?.borderTopLeftRadius || '0px',
      keepText: keep ? (keep.innerText || '').replace(/\s+/g, ' ').trim() : '',
      loose,
    }
  })
  assert.match(look.stampText, /LOCKED!/)
  assert.equal(look.stampGold, false, `${label} stamp is not gold (${look.stampBg} ${look.stampImg})`)
  assert.match(look.stampImg, /213,\s*219,\s*227|154,\s*166,\s*178/, `${label} stamp is silver`)
  assert.ok(look.btnBottom <= look.inner + 1, `${label} Continue stays on screen (${look.btnBottom}/${look.inner})`)
  assert.equal(look.scrollY, 0, `${label} LOCKED does not scroll`)
  assert.match(look.dockBg, /rgba\(0,\s*0,\s*0,\s*0\)|transparent/, `${label} dock has no plate (${look.dockBg})`)
  assert.notEqual(parseFloat(look.arenaRadius), 0, `${label} answer panel is rounded (${look.arenaRadius})`)
  assert.match(look.keepText, /You got it/)
  assert.match(look.keepText, /Yes — keep this/)
  assert.deepEqual(look.loose, [], `${label} loose lines ${JSON.stringify(look.loose)}`)
  const golds = await filledGolds(page)
  assert.equal(golds.length, 1, `${label} LOCKED has one gold ${JSON.stringify(golds)}`)
  assert.match(golds[0].text, /Continue/)
  const view = page.viewportSize()
  if (view?.width === 375 && view?.height === 667) {
    await page.waitForTimeout(900)
    await page.screenshot({ path: `${SHOTS}/locked-${label}-375.png` })
  }
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

function hopSave(progress) {
  return {
    kind: SAVE_KIND,
    schemaVersion: SAVE_SCHEMA_VERSION,
    appVersion: '1.4.523',
    savedAt: '2026-10-21T00:00:00.000Z',
    progress: {
      started: true,
      easyMode: true,
      theme: 'candy',
      completed: [],
      held: [],
      easyHeld: [],
      easyTaught: ['ph-road'],
      lastDailyDate: '2020-01-01',
      dailyDates: ['2020-01-01'],
      ...progress,
    },
  }
}

async function openSeeded(browser, origin, progress) {
  const context = await browser.newContext({ viewport: { width: 375, height: 667 } })
  await context.addInitScript(
    ([storageKey, raw]) => {
      localStorage.clear()
      localStorage.setItem(storageKey, raw)
    },
    [STORAGE_KEY, JSON.stringify(hopSave(progress))],
  )
  const page = await context.newPage()
  const errors = []
  page.on('pageerror', (error) => errors.push(String(error)))
  await page.goto(origin)
  return { context, page, errors }
}

async function pointerClick(page, locator) {
  await locator.scrollIntoViewIfNeeded()
  const box = await locator.boundingBox()
  if (!box) throw new Error('pointer target has no box')
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2)
}

async function openRoadLockIn(page) {
  await page.locator('main.hub').waitFor()
  await pointerClick(page, page.getByRole('button', { name: 'Settings' }))
  const summary = page.locator('summary', { hasText: 'Developer · mini-game jumps' })
  await summary.waitFor()
  await pointerClick(page, summary)
  await pointerClick(page, page.getByRole('button', { name: 'ph-road · Lock In Why Blast', exact: true }))
}

async function tapWrongWhy(page, why) {
  const chips = page.locator('button.why-chip:not([disabled])')
  const count = await chips.count()
  for (let i = 0; i < count; i += 1) {
    const text = ((await chips.nth(i).innerText()) || '').replace(/\s+/g, ' ').trim()
    if (text === why) continue
    const box = await chips.nth(i).boundingBox()
    if (!box || box.height < 4) continue
    await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2)
    return
  }
  throw new Error('no wrong why chip')
}

async function tapWrongRecall(page, claim) {
  const cards = page.locator('button.recall-card')
  const count = await cards.count()
  for (let i = 0; i < count; i += 1) {
    const text = ((await cards.nth(i).innerText()) || '').replace(/\s+/g, ' ').trim()
    if (text === claim) continue
    await pointerClick(page, cards.nth(i))
    return
  }
  throw new Error('no wrong recall card')
}

async function proveNotQuite(browser, origin) {
  const brief = evidenceForTier('ph-road', 'easy')
  assert.ok(brief, 'ph-road easy brief')
  const why = easyWhyLine(brief.reason)
  const claim = easyFacingLine('ph-road', brief.claim)
  const hint = easyReasonHint(brief.reason)
  const answer = `${claim} — ${why}`

  const blast = await openSeeded(browser, origin, {})
  try {
    await openRoadLockIn(blast.page)
    await blast.page.locator('button.why-chip').first().waitFor()
    await tapWrongWhy(blast.page, why)
    await blast.page.locator('.why-miss-hint').waitFor()
    const firstHint = ((await blast.page.locator('.why-miss-hint').innerText()) || '').replace(/\s+/g, ' ').trim()
    assert.equal(firstHint, hint, 'first miss hints from the reason')
    assert.equal(await blast.page.locator('.why-miss-answer').count(), 0, 'first miss hides the right card')
    assert.ok(firstHint.length < why.length, 'the hint is shorter than the right card')
    const firstGolds = await filledGolds(blast.page)
    assert.equal(firstGolds.length, 1, `first miss one gold ${JSON.stringify(firstGolds)}`)
    assert.equal(firstGolds[0].text, 'Try again')
    await blast.page.screenshot({ path: `${SHOTS}/not-quite-first-375.png` })
    await pointerClick(blast.page, blast.page.locator('.why-miss-retry'))
    await blast.page.locator('button.why-chip:not(.is-gone)').first().waitFor()
    await tapWrongWhy(blast.page, why)
    await blast.page.locator('.why-miss-answer').waitFor()
    const second = ((await blast.page.locator('.why-miss-answer').innerText()) || '').replace(/\s+/g, ' ').trim()
    assert.equal(second, answer, 'second miss shows claim and reason on one line')
    assert.equal(await blast.page.locator('.why-miss-retry').count(), 0, 'second miss has no third retry')
    const secondGolds = await filledGolds(blast.page)
    assert.equal(secondGolds.length, 1, `second miss one gold ${JSON.stringify(secondGolds)}`)
    assert.equal(secondGolds[0].text, 'Continue')
    await blast.page.screenshot({ path: `${SHOTS}/not-quite-second-375.png` })
    await pointerClick(blast.page, blast.page.locator('.why-miss-continue'))
    await blast.page.locator('main.hub').waitFor()
    assert.equal(blast.errors.join('\n'), '', 'why-blast miss page errors')
  } finally {
    await blast.context.close()
  }

  const review = await openSeeded(browser, origin, {
    held: ['ph-road'],
    easyHeld: ['ph-road'],
    lessonScore: { 'ph-road': 10 },
    lessonTier: { 'ph-road': 'easy' },
  })
  try {
    await openRoadLockIn(review.page)
    await review.page.locator('button.recall-card').first().waitFor()
    assert.equal(await review.page.locator('.why-blast').count(), 0, 'Easy review uses RecallGate')
    await tapWrongRecall(review.page, claim)
    await review.page.locator('.why-miss-hint').waitFor()
    const reviewHint = ((await review.page.locator('.why-miss-hint').innerText()) || '').replace(/\s+/g, ' ').trim()
    assert.equal(reviewHint, hint, 'RecallGate first miss hints from the reason')
    assert.equal(await review.page.locator('.why-miss-answer').count(), 0)
    const reviewFirst = await filledGolds(review.page)
    assert.equal(reviewFirst.length, 1, `RecallGate first miss one gold ${JSON.stringify(reviewFirst)}`)
    assert.equal(reviewFirst[0].text, 'Try again')
    await pointerClick(review.page, review.page.locator('.why-miss-retry'))
    await review.page.locator('button.recall-card').first().waitFor()
    await tapWrongRecall(review.page, claim)
    await review.page.locator('.why-miss-answer').waitFor()
    const reviewAnswer = ((await review.page.locator('.why-miss-answer').innerText()) || '').replace(/\s+/g, ' ').trim()
    assert.equal(reviewAnswer, answer, 'RecallGate second miss is one line')
    assert.equal(await review.page.locator('.why-miss-retry').count(), 0)
    const reviewSecond = await filledGolds(review.page)
    assert.equal(reviewSecond.length, 1, `RecallGate second miss one gold ${JSON.stringify(reviewSecond)}`)
    assert.equal(reviewSecond[0].text, 'Continue')
    await pointerClick(review.page, review.page.locator('.why-miss-continue'))
    await review.page.locator('main.hub').waitFor()
    assert.equal(review.errors.join('\n'), '', 'recall miss page errors')
  } finally {
    await review.context.close()
  }
}

async function proveGemToast(browser, origin) {
  const gems = DAILY_POOL.find((item) => item.challenge.id === 'daily-gems')
  assert.ok(gems && gems.challenge.kind === 'match', 'daily-gems is a picture match')
  const seeded = await openSeeded(browser, origin, {})
  const page = seeded.page
  try {
    await page.goto(`${origin}?sequence=daily-gems`)
    await pointerClick(page, page.getByRole('button', { name: 'Find the gems' }))
    await page.locator('[data-match-picture]').waitFor()
    await page.waitForFunction(() => !document.querySelector('.is-arming'))
    const id = await page.locator('[data-match-picture]').first().getAttribute('data-match-picture')
    assert.ok(id, 'picture id')
    const pair = gems.challenge.pairs.find((item) => item.id === id)
    assert.ok(pair, `pair ${id}`)
    await pointerClick(page, page.locator(`[data-match-line]:not([data-match-line="${id}"])`).first())
    await page.locator('.match-toast').waitFor()
    const toast = ((await page.locator('.match-toast').innerText()) || '').replace(/\s+/g, ' ').trim()
    assert.equal(toast, easyWrongTap(pair.right))
    for (let guard = 0; guard < 4; guard += 1) {
      if (await page.locator('.play.is-match.is-win').count()) break
      const picture = page.locator('[data-match-picture]').first()
      await picture.waitFor()
      const pictureId = await picture.getAttribute('data-match-picture')
      await pointerClick(page, page.locator(`[data-match-line="${pictureId}"]`))
      await page.waitForTimeout(200)
    }
    await page.locator('.play.is-match.is-win').waitFor({ timeout: 4000 })
    assert.equal(await page.locator('.match-toast').count(), 0, 'MATCHED clears the wrong-tap toast')
    assert.doesNotMatch(await page.locator('.play.is-match').innerText(), /Wrong\. Tap this one/)
    assert.equal(seeded.errors.join('\n'), '', 'gem toast page errors')
  } finally {
    await seeded.context.close()
  }
}

// ---------------------------------------------------------------------------
// Easy Home map pan (#817). Real pointer, touch and key input only. Never el.click().
// ---------------------------------------------------------------------------
const HOME_SIZES = [
  [375, 667],
  [390, 844],
  [412, 915],
]
const TAP_SLOP = 8
const HOME_HOLLOW = ['ph-road', 'ph-father', 'ph-seeds', 'ph-debt']
const HOME_BENCH = ['wb-creed', 'wb-early', 'wb-method', 'wb-women']
const HOME_OBS = ['ob-tuning', 'ob-design', 'ob-leibniz', 'ob-life']
const HOME_GATE = ['fg-mover', 'fg-contingent', 'fg-kalam', 'fg-limits']
const HOME_LOOK = ['hl-moral', 'hl-mind', 'hl-meaning', 'hl-beauty']
const CHIP_PLOT = {
  'Story Creek': 'hollow',
  'Star lamps': 'lamps',
  Pages: 'journal',
  'Witness Square': 'bench',
  'East porch': 'porch',
}

export function homeProgress(kind) {
  const today = localDateKey()
  const days = ['2020-01-01', '2020-01-02', today]
  const built = (over) => ({ porch: 0, hollow: 0, bench: 0, observatory: 0, gate: 0, lookout: 0, journal: 0, lamps: 0, ...over })
  switch (kind) {
    case 'fresh':
      return {}
    case 'hollow-next':
      return { lastDailyDate: today, dailyDates: [today], cityBuilt: built({ porch: 2, hollow: 1 }) }
    case 'bench-next':
      return {
        lastDailyDate: today,
        dailyDates: days,
        completed: HOME_HOLLOW,
        cityBuilt: built({ porch: 4, hollow: 4, bench: 1 }),
      }
    case 'ready':
      return {
        lastDailyDate: today,
        dailyDates: days,
        completed: HOME_HOLLOW,
        cityBuilt: built({ porch: 4, hollow: 2, bench: 1 }),
      }
    case 'tall-dock':
      return {
        lastDailyDate: today,
        dailyDates: days,
        completed: HOME_HOLLOW,
        held: ['ph-road'],
        easyHeld: ['ph-road'],
        cityBuilt: built({ porch: 4, hollow: 4, bench: 1 }),
      }
    case 'late':
      return {
        lastDailyDate: today,
        dailyDates: days,
        completed: [...HOME_HOLLOW, ...HOME_BENCH, ...HOME_OBS, ...HOME_GATE, ...HOME_LOOK],
        journal: Array.from({ length: 12 }, (_, i) => `j-${i}`),
        stars: { a: 14 },
        cityBuilt: built({ porch: 4, hollow: 4, bench: 4, observatory: 4, gate: 4, lookout: 4, journal: 4, lamps: 2 }),
      }
    default:
      throw new Error(`unknown home seed ${kind}`)
  }
}

async function openHome(browser, origin, kind, [width, height], context = {}, progress = {}) {
  const ctx = await browser.newContext({ viewport: { width, height }, ...context })
  await ctx.addInitScript(
    ([storageKey, raw]) => {
      localStorage.clear()
      localStorage.setItem(storageKey, raw)
    },
    [STORAGE_KEY, JSON.stringify(hopSave({ ...homeProgress(kind), ...progress }))],
  )
  const page = await ctx.newPage()
  const errors = []
  page.on('pageerror', (error) => errors.push(String(error)))
  await page.goto(origin)
  await page.locator('main.hub').waitFor()
  return { ctx, page, errors, width, height }
}

async function settleHome(page) {
  await page.locator('.city-pan-viewport').waitFor()
  await page.waitForTimeout(500)
}

async function homeView(page) {
  return page.evaluate(() => {
    const vp = document.querySelector('.city-pan-viewport')
    const layer = document.querySelector('.city-pan-layer')
    const svg = layer?.querySelector('.city-svg')
    if (!vp || !layer || !svg) return null
    const vr = vp.getBoundingClientRect()
    const sr = svg.getBoundingClientRect()
    const scale = svg.clientWidth / 640
    const tx = new DOMMatrix(getComputedStyle(layer).transform).m41
    const dock = document.querySelector('.easy-home-dock')
    const plate = svg.querySelector(':scope > image')
    const pr = plate ? plate.getBoundingClientRect() : null
    return {
      scale,
      tx,
      panX: -tx / scale,
      maxX: 640 - vr.width / scale,
      viewW: vr.width / scale,
      vp: { left: vr.left, top: vr.top, right: vr.right, bottom: vr.bottom, width: vr.width, height: vr.height },
      dockTop: dock ? dock.getBoundingClientRect().top : vr.bottom,
      svgWidth: sr.width,
      plate: pr ? { left: pr.left, top: pr.top, right: pr.right, bottom: pr.bottom } : null,
    }
  })
}

async function plotCenter(page, id) {
  const points = await page.evaluate((plotId) => {
    const hit = document.querySelector(`g.city-plot[data-plot="${plotId}"] .city-plot-hit`)
    if (!hit) return []
    const r = hit.getBoundingClientRect()
    const out = []
    for (const [dx, dy] of [[0, 0], [0, -0.3], [0.3, 0], [-0.3, 0], [0, 0.3], [0.45, -0.2], [-0.45, 0.2]]) {
      const x = r.left + r.width / 2 + dx * r.width
      const y = r.top + r.height / 2 + dy * r.height
      const el = document.elementFromPoint(x, y)
      if (el && el.closest(`g.city-plot[data-plot="${plotId}"]`)) out.push({ x, y })
    }
    return out
  }, id)
  if (!points.length) throw new Error(`no clear point on plot ${id}`)
  return points[0]
}

async function mouseDrag(page, from, to, steps = 10) {
  await page.mouse.move(from.x, from.y)
  await page.mouse.down()
  await page.mouse.move(to.x, to.y, { steps })
  await page.mouse.up()
  await page.waitForTimeout(80)
}

async function mouseTap(page, at, jitter = 0) {
  await page.mouse.move(at.x, at.y)
  await page.mouse.down()
  if (jitter) await page.mouse.move(at.x + jitter, at.y, { steps: 2 })
  await page.mouse.up()
  await page.waitForTimeout(120)
}

async function touchDrag(page, from, to, steps = 8) {
  const cdp = await page.context().newCDPSession(page)
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: from.x, y: from.y }] })
  for (let i = 1; i <= steps; i += 1) {
    const x = from.x + ((to.x - from.x) * i) / steps
    const y = from.y + ((to.y - from.y) * i) / steps
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y }] })
  }
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
  await cdp.detach()
  await page.waitForTimeout(100)
}

/** Drag the same way again and again, past the clamp, about 2000 px in all. */
async function panExtreme(page, side) {
  const view = await homeView(page)
  const y = view.vp.top + view.vp.height * 0.25
  const reach = view.vp.width - 40
  const from = side === 'left' ? view.vp.left + 20 : view.vp.right - 20
  const to = side === 'left' ? from + reach : from - reach
  for (let i = 0; i < Math.ceil(2000 / reach); i += 1) await mouseDrag(page, { x: from, y }, { x: to, y }, 8)
  return homeView(page)
}

async function mapGoldCues(page) {
  return page.evaluate(() => {
    const vp = document.querySelector('.city-pan-viewport')?.getBoundingClientRect()
    const dockTop = document.querySelector('.easy-home-dock')?.getBoundingClientRect().top ?? 1e9
    const probe = document.createElement('i')
    document.body.append(probe)
    const rgb = (value) => {
      probe.style.color = ''
      probe.style.color = value
      const m = /rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/.exec(getComputedStyle(probe).color)
      return m ? [Number(m[1]), Number(m[2]), Number(m[3])] : null
    }
    const gold = (value) => {
      const c = value && value !== 'none' ? rgb(value) : null
      return Boolean(c && c[0] > 190 && c[1] > 140 && c[2] < 120 && c[0] > c[2] + 60)
    }
    const inView = (r) =>
      Boolean(vp) && r.width > 0 && r.height > 0 && r.right > vp.left && r.left < vp.right && r.bottom > vp.top && r.top < dockTop
    const shown = (el) => {
      const st = getComputedStyle(el)
      return st.display !== 'none' && st.visibility !== 'hidden' && Number(st.opacity) > 0
    }
    const cues = []
    for (const el of document.querySelectorAll('.city-next-halo')) {
      if (shown(el) && gold(getComputedStyle(el).stroke) && inView(el.getBoundingClientRect())) {
        const mark = el.closest('g.city-next-mark')
        const m = /translate\(\s*([-\d.]+)[ ,]+([-\d.]+)/.exec(mark?.getAttribute('transform') || '')
        cues.push({ kind: 'halo', x: m ? Number(m[1]) : null })
      }
    }
    for (const el of document.querySelectorAll('.city-plot.is-ready .city-plot-hit')) {
      if (shown(el) && gold(getComputedStyle(el).stroke) && inView(el.getBoundingClientRect())) {
        cues.push({ kind: 'ready-ring', x: Number(el.getAttribute('cx')) })
      }
    }
    for (const el of document.querySelectorAll('.city-plot .city-plot-select')) {
      if (getComputedStyle(el).display !== 'none' && inView(el.getBoundingClientRect())) {
        cues.push({ kind: 'select-ring', x: Number(el.getAttribute('cx')) })
      }
    }
    probe.remove()
    const rc = document.querySelector('.easy-map-recenter')
    return { cues, recenter: rc ? { gold: gold(getComputedStyle(rc).backgroundColor) || gold(getComputedStyle(rc).borderColor) } : null }
  })
}

async function cueTarget(page) {
  return page.evaluate(() => {
    const ready = document.querySelector('g.city-plot.is-ready')
    const next = document.querySelector('g.city-plot.is-next')
    const target = ready || next
    const hit = target?.querySelector('.city-plot-hit')
    return target ? { id: target.getAttribute('data-plot'), x: hit ? Number(hit.getAttribute('cx')) : null } : null
  })
}

async function chipPx(page) {
  return page.evaluate(() => {
    const out = []
    for (const text of document.querySelectorAll('.city-easy-chip text')) {
      const ctm = text.getScreenCTM()
      out.push(ctm ? ctm.a * parseFloat(getComputedStyle(text).fontSize) : 0)
    }
    return out
  })
}

// Bar 1: it opens centered on the current or next road.
async function proveHomeOpensOnTarget(browser, origin, size, errorsOut) {
  const where = `${size[0]}x${size[1]}`
  const cases = [
    ['fresh', 'porch', 'right'],
    ['hollow-next', 'hollow', 'left'],
    ['bench-next', 'bench', 'mid'],
    ['ready', 'hollow', 'left'],
    ['late', 'lamps', 'mid'],
  ]
  for (const [kind, expectId, clamp] of cases) {
    const { ctx, page, errors } = await openHome(browser, origin, kind, size)
    try {
      await settleHome(page)
      const view = await homeView(page)
      const target = await cueTarget(page)
      assert.equal(target?.id, expectId, `homePan opens: ${where} ${kind} targets ${expectId}`)
      const want = Math.min(view.maxX, Math.max(0, target.x - view.viewW / 2))
      assert.ok(Math.abs(view.panX - want) < 1.5, `homePan opens: ${where} ${kind} pan ${view.panX.toFixed(1)} is on ${want.toFixed(1)}`)
      if (clamp === 'right') assert.ok(Math.abs(view.panX - view.maxX) < 1.5, `${where} ${kind} opens at the right end`)
      if (clamp === 'left') assert.ok(view.panX < 1.5, `${where} ${kind} opens at the left end`)
      if (clamp === 'mid') {
        assert.ok(view.panX > 4 && view.panX < view.maxX - 4, `${where} ${kind} opens between the ends`)
        const screenX = view.vp.left + (target.x - view.panX) * view.scale
        assert.ok(
          Math.abs(screenX - (view.vp.left + view.vp.width / 2)) <= 3,
          `${where} ${kind} target sits mid-screen (${screenX.toFixed(1)})`,
        )
      }
      const screenX = view.vp.left + (target.x - view.panX) * view.scale
      assert.ok(screenX > view.vp.left + 8 && screenX < view.vp.right - 8, `${where} ${kind} target is in view`)
      assert.equal(await page.locator('.easy-map-recenter').count(), 0, `${where} ${kind} shows no center button at open`)
    } finally {
      errorsOut.push(...errors)
      await ctx.close()
    }
  }
}

// Bar 2: every unlocked plot and its label can be dragged fully into view.
async function proveHomeReach(browser, origin, size, errorsOut) {
  const where = `${size[0]}x${size[1]}`
  for (const kind of ['late', 'tall-dock']) {
    const { ctx, page, errors } = await openHome(browser, origin, kind, size)
    try {
      await settleHome(page)
      const plots = await page.evaluate(() =>
        [...document.querySelectorAll('g.city-plot[role="button"]')].map((el) => el.getAttribute('data-plot')),
      )
      assert.ok(plots.length >= (kind === 'late' ? 7 : 3), `${where} ${kind} has unlocked plots (${plots.join(',')})`)
      const reached = new Set()
      const chipsReached = new Set()
      const sample = async () => {
        const hits = await page.evaluate(() => {
          const vp = document.querySelector('.city-pan-viewport').getBoundingClientRect()
          const dockTop = document.querySelector('.easy-home-dock').getBoundingClientRect().top
          const inside = (r) => r.left >= vp.left - 0.5 && r.right <= vp.right + 0.5 && r.top >= vp.top - 0.5 && r.bottom <= dockTop + 0.5
          const plotsIn = []
          for (const el of document.querySelectorAll('g.city-plot[role="button"]')) {
            const hit = el.querySelector('.city-plot-hit')
            if (inside(hit.getBoundingClientRect())) plotsIn.push(el.getAttribute('data-plot'))
          }
          const chips = []
          for (const chip of document.querySelectorAll('.city-easy-chip')) {
            const label = [...chip.querySelectorAll('tspan')].map((t) => t.textContent).join(' ').trim()
            if (inside(chip.getBoundingClientRect())) chips.push(label)
          }
          return { plotsIn, chips }
        })
        for (const id of hits.plotsIn) reached.add(id)
        return hits
      }
      let view = await panExtreme(page, 'left')
      assert.ok(view.panX < 0.5, `${where} ${kind} reaches the left end`)
      const step = view.vp.width * 0.3
      const y = view.vp.top + view.vp.height * 0.25
      const perPlot = new Map()
      for (let i = 0; i < 40; i += 1) {
        const hits = await sample()
        for (const chip of hits.chips) chipsReached.add(chip)
        for (const id of hits.plotsIn) {
          const labels = hits.chips.map((c) => CHIP_PLOT[c]).filter(Boolean)
          if (!perPlot.has(id)) perPlot.set(id, labels.includes(id))
          else if (labels.includes(id)) perPlot.set(id, true)
        }
        view = await homeView(page)
        if (view.panX > view.maxX - 0.5) break
        await mouseDrag(page, { x: view.vp.right - 20, y }, { x: view.vp.right - 20 - step, y }, 6)
      }
      for (const id of plots) assert.ok(reached.has(id), `homePan reach: ${where} ${kind} ${id} can be dragged fully into view`)
      const chipPlots = plots.filter((id) => Object.values(CHIP_PLOT).includes(id))
      for (const id of chipPlots) assert.ok(perPlot.get(id), `homePan reach: ${where} ${kind} ${id} and its label share one fully visible view`)
      const named = await page.evaluate(() => document.querySelectorAll('.city-easy-chip').length)
      assert.ok(chipsReached.size >= named, `${where} ${kind} every name chip was fully visible once (${[...chipsReached].join('|')})`)
    } finally {
      errorsOut.push(...errors)
      await ctx.close()
    }
  }
}

// Bar 3: nothing hidden or unfinished can be panned into view, and no bleed or void shows.
async function proveHomeNoHidden(browser, origin, size, errorsOut) {
  const where = `${size[0]}x${size[1]}`
  for (const kind of ['fresh', 'bench-next', 'late']) {
    const { ctx, page, errors } = await openHome(browser, origin, kind, size)
    try {
      await settleHome(page)
      for (const side of ['left', 'right', 'mid']) {
        const view = side === 'mid' ? await homeView(page) : await panExtreme(page, side)
        const label = `${where} ${kind} ${side}`
        assert.ok(view.plate, `${label} has a plate`)
        assert.ok(view.plate.left <= view.vp.left + 0.6 && view.plate.right >= view.vp.right - 0.6, `homePan hidden: ${label} plate covers the width (${view.plate.left.toFixed(1)}..${view.plate.right.toFixed(1)})`)
        assert.ok(view.plate.top <= view.vp.top + 0.6, `${label} plate starts at the top`)
        assert.ok(view.plate.bottom >= view.dockTop - 0.6, `${label} plate reaches the dock (${view.plate.bottom.toFixed(1)} vs ${view.dockTop.toFixed(1)})`)
        const hidden = await page.evaluate(() => {
          const imgs = [...document.querySelectorAll('.city-svg image')].map((el) => el.getAttribute('href') || '')
          const stripSvgs = document.querySelectorAll('.city-stage-bleed svg').length
          const folkLamps = [...document.querySelectorAll('.city-folk .city-lamp')].filter((el) => getComputedStyle(el).display !== 'none').length
          return {
            eden: document.querySelectorAll('.city-eden').length,
            heaven: document.querySelectorAll('.city-heaven').length,
            streetLamps: document.querySelectorAll('.city-street-lamps').length,
            lots: document.querySelectorAll('.city-lot').length,
            stripSvgs,
            folkLamps,
            rough: imgs.filter((h) => /plot-observatory|plot-gate-scaffold|plot-lamps-scaffold|plot-lamps-built/.test(h)).length,
            heavenTab: [...document.querySelectorAll('[aria-label]')].filter((el) => /Heaven waits on the ridge/.test(el.getAttribute('aria-label'))).length,
          }
        })
        assert.deepEqual(
          { ...hidden, stripSvgs: Math.min(hidden.stripSvgs, 1) },
          { eden: 0, heaven: 0, streetLamps: 0, lots: 0, stripSvgs: Math.min(hidden.stripSvgs, 1), folkLamps: 0, rough: 0, heavenTab: 0 },
          `homePan hidden: ${label} shows nothing hidden or unfinished ${JSON.stringify(hidden)}`,
        )
        assert.ok(hidden.stripSvgs <= 1, `${label} only the strip under the dock is kept`)
      }
      const maxPan = (await homeView(page)).maxX
      assert.ok(maxPan >= 0, `${where} ${kind} pan range is non-negative`)
    } finally {
      errorsOut.push(...errors)
      await ctx.close()
    }
  }
  await proveHomeNoHiddenFounders(browser, origin, size, errorsOut)
}

// Bar 3, Founder's Lamp: the gift style keeps no folk lamp dots either.
async function proveHomeNoHiddenFounders(browser, origin, size, errorsOut) {
  const where = `${size[0]}x${size[1]}`
  const { ctx, page, errors } = await openHome(browser, origin, 'late', size, {}, { lampStyle: 'founders', firstSeen: '2026-10-01' })
  try {
    await settleHome(page)
    assert.equal(await page.locator('.city-overworld.is-style-founders').count(), 1, `${where} founders style is on`)
    for (const side of ['left', 'right', 'mid']) {
      if (side !== 'mid') await panExtreme(page, side)
      const folkLamps = await page.evaluate(
        () => [...document.querySelectorAll('.city-folk .city-lamp')].filter((el) => getComputedStyle(el).display !== 'none').length,
      )
      assert.equal(folkLamps, 0, `homePan hidden: ${where} founders ${side} shows no folk lamp dots (${folkLamps})`)
    }
  } finally {
    errorsOut.push(...errors)
    await ctx.close()
  }
}

// Bar 4: exactly one gold cue in view at open, on the target.
async function proveHomeOneGold(browser, origin, size, errorsOut) {
  const where = `${size[0]}x${size[1]}`
  for (const kind of ['fresh', 'hollow-next', 'bench-next', 'ready', 'late']) {
    const { ctx, page, errors } = await openHome(browser, origin, kind, size)
    try {
      await settleHome(page)
      const { cues, recenter } = await mapGoldCues(page)
      const target = await cueTarget(page)
      assert.equal(cues.length, 1, `homePan gold: ${where} ${kind} shows exactly one gold map cue ${JSON.stringify(cues)}`)
      assert.equal(cues[0].kind, 'halo', `${where} ${kind} the one cue is the halo`)
      assert.equal(cues[0].x, target.x, `${where} ${kind} the halo sits on ${target.id}`)
      assert.equal(recenter, null, `${where} ${kind} no center button at open`)
      assert.equal((await filledGolds(page)).length, 1, `${where} ${kind} the dock keeps its one filled gold`)
      const view = await homeView(page)
      await mouseDrag(page, { x: view.vp.left + view.vp.width * 0.8, y: view.vp.top + 120 }, { x: view.vp.left + view.vp.width * 0.2, y: view.vp.top + 120 })
      const after = await mapGoldCues(page)
      assert.ok(after.cues.length <= 1, `${where} ${kind} a drag adds no gold cue ${JSON.stringify(after.cues)}`)
      if (after.recenter) assert.equal(after.recenter.gold, false, `${where} ${kind} the center button is not gold`)
    } finally {
      errorsOut.push(...errors)
      await ctx.close()
    }
  }
}

// Bar 5: a drag never fires a plot tap. TAP_SLOP is 8 px.
async function proveHomeTapSlop(browser, origin, size, errorsOut) {
  const where = `${size[0]}x${size[1]}`
  const { ctx, page, errors } = await openHome(browser, origin, 'bench-next', size)
  try {
    await settleHome(page)
    const selected = () => page.locator('.city-plot.is-selected').count()
    const manage = () => page.locator('.mind-map').count()
    const bench = await plotCenter(page, 'bench')
    const before = await homeView(page)

    await mouseDrag(page, bench, { x: bench.x - 60, y: bench.y }, 6)
    let view = await homeView(page)
    assert.ok(Math.abs(view.panX - before.panX) > 20, `homePan tap: ${where} a drag that starts on a house moves the map`)
    assert.equal(await selected(), 0, `homePan tap: ${where} a drag that starts on a house selects nothing`)
    assert.equal(await manage(), 0, `${where} that drag opens no Manage`)

    const spot = await plotCenter(page, 'bench')
    await mouseDrag(page, { x: spot.x - 90, y: spot.y + 60 }, { x: spot.x, y: spot.y }, 6)
    assert.equal(await selected(), 0, `${where} a drag that ends on a house selects nothing`)

    const small = await plotCenter(page, 'bench')
    await mouseTap(page, small, TAP_SLOP - 1)
    assert.equal(await selected(), 1, `${where} a ${TAP_SLOP - 1}px wobble is still a tap`)
    await page.keyboard.press('Escape')
    assert.equal(await selected(), 0, `${where} Esc clears the chosen house`)

    const wide = await plotCenter(page, 'bench')
    const beforeWide = await homeView(page)
    await mouseTap(page, wide, TAP_SLOP + 1)
    assert.equal(await selected(), 0, `${where} a ${TAP_SLOP + 1}px move is a drag, not a tap`)
    assert.ok(Math.abs((await homeView(page)).panX - beforeWide.panX) > 0.5, `${where} a ${TAP_SLOP + 1}px move pans`)

    const one = await plotCenter(page, 'bench')
    await mouseTap(page, one, 3)
    assert.equal(await selected(), 1, `${where} tap selects with the gold ring`)
    assert.equal(await manage(), 0, `${where} the first tap does not open Manage`)
    const ring = await page.evaluate(() => {
      const el = document.querySelector('.city-plot.is-selected .city-plot-select')
      return el ? getComputedStyle(el).display : 'none'
    })
    assert.notEqual(ring, 'none', `${where} the chosen house shows its ring`)
    await page.waitForTimeout(400)

    const pan = await homeView(page)
    await mouseDrag(page, { x: pan.vp.left + pan.vp.width * 0.8, y: pan.vp.top + 90 }, { x: pan.vp.left + pan.vp.width * 0.3, y: pan.vp.top + 90 })
    assert.equal(await selected(), 1, `${where} a drag keeps the chosen house`)
    assert.equal(await manage(), 0, `${where} a drag opens no Manage`)

    const two = await plotCenter(page, 'bench')
    await mouseTap(page, two, 0)
    await page.locator('.mind-map').waitFor({ timeout: 4000 })
    assert.equal(await manage(), 1, `${where} the second tap opens Manage`)

    // Esc closes Manage first, then clears the chosen house.
    await page.keyboard.press('Escape')
    await page.locator('.mind-map').waitFor({ state: 'detached', timeout: 4000 })
    assert.equal(await selected(), 1, `${where} the first Esc keeps the chosen house`)
    await page.keyboard.press('Escape')
    assert.equal(await selected(), 0, `${where} the second Esc clears it`)

    // The dock never starts a pan.
    const dockBox = await page.locator('.easy-home-dock').boundingBox()
    const t0 = (await homeView(page)).tx
    const dock = { x: dockBox.x + dockBox.width / 2, y: dockBox.y + 14 }
    await mouseDrag(page, dock, { x: dock.x - 40, y: dock.y }, 5)
    await mouseDrag(page, dock, { x: dock.x + 40, y: dock.y }, 5)
    assert.equal((await homeView(page)).tx, t0, `homePan tap: ${where} a drag from the dock leaves the map where it was`)
  } finally {
    errorsOut.push(...errors)
    await ctx.close()
  }

  const touch = await openHome(browser, origin, 'bench-next', size, { hasTouch: true })
  try {
    await settleHome(touch.page)
    const view = await homeView(touch.page)
    const spot = await plotCenter(touch.page, 'bench')
    await touchDrag(touch.page, spot, { x: spot.x - 70, y: spot.y })
    assert.ok(Math.abs((await homeView(touch.page)).panX - view.panX) > 20, `${where} a finger drag pans the map`)
    assert.equal(await touch.page.locator('.city-plot.is-selected').count(), 0, `${where} a finger drag selects nothing`)
    // Chromium swallows a tap that follows a scroll gesture within a beat.
    await touch.page.waitForTimeout(700)
    const again = await plotCenter(touch.page, 'bench')
    await touch.page.touchscreen.tap(again.x, again.y)
    await touch.page.waitForTimeout(150)
    assert.equal(await touch.page.locator('.city-plot.is-selected').count(), 1, `${where} a finger tap selects`)
  } finally {
    errorsOut.push(...touch.errors)
    await touch.ctx.close()
  }
}

async function proveHomeClampAndCenter(browser, origin, size, errorsOut) {
  const where = `${size[0]}x${size[1]}`
  const { ctx, page, errors } = await openHome(browser, origin, 'hollow-next', size)
  try {
    await settleHome(page)
    const right = await panExtreme(page, 'right')
    assert.ok(Math.abs(right.panX - right.maxX) < 0.6, `homePan clamp: ${where} over-drag right stops at the plate edge (${right.panX.toFixed(1)} of ${right.maxX.toFixed(1)})`)
    assert.ok(right.plate.right >= right.vp.right - 0.6, `${where} no bleed past the right edge`)
    await page.waitForTimeout(100)
    const rc = page.locator('.easy-map-recenter')
    await rc.waitFor({ timeout: 3000 })
    const box = await rc.boundingBox()
    assert.ok(box.width >= 44 && box.height >= 44, `homePan recenter: ${where} button is ${box.width}x${box.height}`)
    assert.equal(await rc.getAttribute('aria-label'), 'Center the map on your house')
    assert.equal(await page.getByRole('button', { name: 'Center the map on your house' }).count(), 1, `${where} the center button has its name`)
    const paint = await page.evaluate(() => {
      const el = document.querySelector('.easy-map-recenter')
      const st = getComputedStyle(el)
      return { bg: st.backgroundColor, border: st.borderTopColor, img: st.backgroundImage, text: (el.textContent || '').trim() }
    })
    assert.equal(isGoldPaint(paint.bg) || isGoldPaint(paint.border), false, `${where} the center button is not gold ${JSON.stringify(paint)}`)
    assert.equal(paint.img, 'none', `${where} the center button draws no image`)
    assert.equal(paint.text, '', `${where} the center button has no baked text`)

    // A pan never starts on the center button.
    const t0 = (await homeView(page)).tx
    const at = { x: box.x + box.width / 2, y: box.y + box.height / 2 }
    await page.mouse.move(at.x, at.y)
    await page.mouse.down()
    await page.mouse.move(at.x - 40, at.y, { steps: 5 })
    await page.mouse.up()
    await page.waitForTimeout(100)
    assert.equal((await homeView(page)).tx, t0, `${where} a drag from the center button does not pan`)

    const left = await panExtreme(page, 'left')
    assert.ok(left.panX < 0.6, `${where} over-drag left stops at the plate edge (${left.panX.toFixed(1)})`)
    assert.ok(left.plate.left <= left.vp.left + 0.6, `${where} no bleed past the left edge`)
    assert.equal(await page.locator('.easy-map-recenter').count(), 0, `${where} the button hides at home`)

    await panExtreme(page, 'right')
    await rc.waitFor()
    const rb = await rc.boundingBox()
    await page.mouse.click(rb.x + rb.width / 2, rb.y + rb.height / 2)
    await page.waitForTimeout(600)
    const home = await homeView(page)
    assert.ok(home.panX < 1.5, `homePan recenter: ${where} the button brings the house back (${home.panX.toFixed(1)})`)
    assert.equal(await page.locator('.easy-map-recenter').count(), 0, `${where} the button goes away once home`)
    const hollow = await page.evaluate(() => {
      const r = document.querySelector('g.city-plot[data-plot="hollow"] .city-plot-hit').getBoundingClientRect()
      const vp = document.querySelector('.city-pan-viewport').getBoundingClientRect()
      return r.left >= vp.left - 0.5 && r.right <= vp.right + 0.5
    })
    assert.ok(hollow, `${where} the house is fully back in view`)
  } finally {
    errorsOut.push(...errors)
    await ctx.close()
  }
}

async function proveHomeKeys(browser, origin, size, errorsOut) {
  const where = `${size[0]}x${size[1]}`
  const { ctx, page, errors } = await openHome(browser, origin, 'bench-next', size)
  try {
    await settleHome(page)
    const start = await homeView(page)
    for (let i = 0; i < 14; i += 1) {
      const active = await page.evaluate(() => document.activeElement?.classList.contains('city-pan-viewport'))
      if (active) break
      await page.keyboard.press('Tab')
    }
    assert.equal(await page.evaluate(() => document.activeElement?.classList.contains('city-pan-viewport')), true, `${where} Tab reaches the map`)
    assert.equal(await page.locator('.city-pan-viewport').getAttribute('aria-label'), 'Map view. Use the arrow keys to look around.')
    await page.keyboard.press('ArrowLeft')
    await page.waitForTimeout(500)
    const left = await homeView(page)
    assert.ok(Math.abs(start.panX - left.panX - 48) < 1, `homePan keys: ${where} ArrowLeft pans 48 units (${start.panX.toFixed(1)} to ${left.panX.toFixed(1)})`)
    await page.keyboard.press('ArrowRight')
    await page.waitForTimeout(500)
    const back = await homeView(page)
    assert.ok(Math.abs(back.panX - start.panX) < 1, `${where} ArrowRight pans back 48 units (${back.panX.toFixed(1)})`)
    await page.keyboard.press('Shift+ArrowLeft')
    await page.waitForTimeout(500)
    const far = await homeView(page)
    assert.ok(Math.abs(start.panX - far.panX - 144) < 1, `${where} Shift+ArrowLeft pans three steps (${far.panX.toFixed(1)})`)
    await page.locator('.easy-map-recenter').waitFor({ timeout: 2000 })
    await page.keyboard.press('Home')
    await page.waitForTimeout(500)
    const home = await homeView(page)
    assert.ok(Math.abs(home.panX - start.panX) < 1, `${where} Home recenters`)
    assert.equal(await page.locator('.easy-map-recenter').count(), 0, `${where} the center button goes away`)
  } finally {
    errorsOut.push(...errors)
    await ctx.close()
  }

  const calm = await openHome(browser, origin, 'bench-next', size, { reducedMotion: 'reduce' })
  try {
    await settleHome(calm.page)
    const view = await homeView(calm.page)
    const y = view.vp.top + 100
    await calm.page.mouse.move(view.vp.left + 300, y)
    await calm.page.mouse.down()
    await calm.page.mouse.move(view.vp.left + 160, y, { steps: 3 })
    await calm.page.mouse.move(view.vp.left + 40, y, { steps: 2 })
    await calm.page.mouse.up()
    const first = (await homeView(calm.page)).tx
    await calm.page.waitForTimeout(60)
    const second = (await homeView(calm.page)).tx
    await calm.page.waitForTimeout(250)
    const third = (await homeView(calm.page)).tx
    assert.equal(first, second, `homePan reduced: ${where} a flick leaves no glide on the next frame`)
    assert.equal(second, third, `${where} the map stays put after a flick`)
    assert.notEqual(first, view.tx, `${where} the flick still panned`)
    await calm.page.locator('.city-pan-viewport').focus()
    const before = (await homeView(calm.page)).panX
    await calm.page.keyboard.press('ArrowLeft')
    await calm.page.waitForTimeout(40)
    assert.ok(Math.abs(before - (await homeView(calm.page)).panX - 48) < 1, `${where} reduced motion jumps the arrow step at once`)
  } finally {
    errorsOut.push(...calm.errors)
    await calm.ctx.close()
  }
}

async function proveHomeTabFocus(browser, origin, size, errorsOut) {
  const where = `${size[0]}x${size[1]}`
  const { ctx, page, errors } = await openHome(browser, origin, 'late', size)
  try {
    await settleHome(page)
    for (const id of ['porch', 'hollow']) {
      await panExtreme(page, id === 'porch' ? 'left' : 'right')
      const out = await page.evaluate((plotId) => {
        const r = document.querySelector(`g.city-plot[data-plot="${plotId}"] .city-plot-hit`).getBoundingClientRect()
        const vp = document.querySelector('.city-pan-viewport').getBoundingClientRect()
        return r.left < vp.left || r.right > vp.right
      }, id)
      assert.ok(out, `${where} ${id} starts off-screen`)
      await page.evaluate(() => document.querySelector('.city-pan-viewport').focus())
      let landed = false
      for (let i = 0; i < 20 && !landed; i += 1) {
        await page.keyboard.press('Tab')
        landed = await page.evaluate((plotId) => document.activeElement?.getAttribute('data-plot') === plotId, id)
      }
      assert.ok(landed, `${where} Tab reaches ${id}`)
      await page.waitForTimeout(500)
      const inView = await page.evaluate((plotId) => {
        const r = document.querySelector(`g.city-plot[data-plot="${plotId}"] .city-plot-hit`).getBoundingClientRect()
        const vp = document.querySelector('.city-pan-viewport').getBoundingClientRect()
        return { left: r.left - vp.left, right: vp.right - r.right }
      }, id)
      assert.ok(inView.left >= -0.5 && inView.right >= -0.5, `homePan focus: ${where} Tab focus pans ${id} into view ${JSON.stringify(inView)}`)
    }
  } finally {
    errorsOut.push(...errors)
    await ctx.close()
  }
}

async function proveHomeChips(browser, origin, size, errorsOut) {
  const { ctx, page, errors } = await openHome(browser, origin, 'fresh', size)
  try {
    await settleHome(page)
    const sizes = await chipPx(page)
    assert.ok(sizes.length > 0, `${size[0]}x${size[1]} Home has a name chip`)
    for (const px of sizes) assert.ok(px >= 12, `homePan chips: ${size[0]}x${size[1]} chip text is ${px.toFixed(1)} CSS px`)
    const view = await homeView(page)
    assert.ok(view.scale > 0.9, `${size[0]}x${size[1]} the map is bigger than the old fit (${view.scale.toFixed(2)})`)
  } finally {
    errorsOut.push(...errors)
    await ctx.close()
  }
}

async function proveHomeWideAndHard(browser, origin, errorsOut) {
  const wide = await openHome(browser, origin, 'late', [768, 1024])
  try {
    await wide.page.locator('.city-svg').waitFor()
    await wide.page.waitForTimeout(400)
    assert.equal(await wide.page.locator('.city-pan-viewport').count(), 0, 'homePan wide: 768 keeps the fit-to-width map')
    const spot = await plotCenter(wide.page, 'lamps')
    await mouseTap(wide.page, spot, 0)
    assert.equal(await wide.page.locator('.city-plot.is-selected').count(), 1, '768 a tap still chooses a house')
  } finally {
    errorsOut.push(...wide.errors)
    await wide.ctx.close()
  }

  // Ready lots without a candy still: main draws the gold ring on them. The next road is a different lot.
  const readySeed = {
    completed: [...HOME_HOLLOW, ...HOME_BENCH],
    cityBuilt: { porch: 4, hollow: 4, bench: 1, observatory: 0, gate: 0, lookout: 0, journal: 0, lamps: 0 },
  }
  const readyCue = (page) =>
    page.evaluate(() => {
      const next = document.querySelector('g.city-plot.is-next')
      const cx = (g) => Number(g?.querySelector('.city-plot-hit')?.getAttribute('cx'))
      const mark = document.querySelector('g.city-next-mark')
      const m = /translate\(\s*([-\d.]+)[ ,]+([-\d.]+)/.exec(mark?.getAttribute('transform') || '')
      const rings = [...document.querySelectorAll('g.city-plot.is-ready')].map((g) => ({
        id: g.getAttribute('data-plot'),
        candy: g.classList.contains('has-candy-img'),
        stroke: getComputedStyle(g.querySelector('.city-plot-hit')).stroke,
      }))
      return {
        nextId: next?.getAttribute('data-plot'),
        nextX: cx(next),
        haloX: m ? Number(m[1]) : null,
        rings,
        pan: document.querySelectorAll('.city-overworld.is-easy-pan').length,
      }
    })
  const ready768 = await openHome(browser, origin, 'ready', [768, 1024], {}, readySeed)
  try {
    await ready768.page.locator('.city-svg').waitFor()
    await ready768.page.waitForTimeout(500)
    const cue = await readyCue(ready768.page)
    const plain = cue.rings.filter((ring) => !ring.candy)
    assert.equal(cue.pan, 0, '768 is not in pan mode')
    assert.ok(plain.length >= 1, `768 seed has a ready lot without a candy still ${JSON.stringify(cue)}`)
    assert.ok(Math.abs(cue.haloX - cue.nextX) < 1, `768 the halo sits on the next road, as on main ${JSON.stringify(cue)}`)
    for (const ring of plain) assert.notEqual(ring.stroke, 'none', `768 the gold ready ring is present on ${ring.id}, as on main`)
  } finally {
    errorsOut.push(...ready768.errors)
    await ready768.ctx.close()
  }

  const readyPan = await openHome(browser, origin, 'ready', [390, 844], {}, readySeed)
  try {
    await settleHome(readyPan.page)
    const cue = await readyCue(readyPan.page)
    assert.equal(cue.pan, 1, '390 is in pan mode')
    assert.ok(cue.rings.length >= 1, `390 seed has a ready lot ${JSON.stringify(cue)}`)
    for (const ring of cue.rings) assert.equal(ring.stroke, 'none', `390 the ready ring is off in pan mode on ${ring.id}`)
  } finally {
    errorsOut.push(...readyPan.errors)
    await readyPan.ctx.close()
  }

  const hard = await openHome(browser, origin, 'late', [390, 844], {}, { easyMode: false })
  try {
    await hard.page.locator('.city-svg').waitFor()
    // Hard plays its own build and homecoming camera first. Wait for it to settle on the whole plate.
    await hard.page
      .waitForFunction(() => document.querySelector('.city-svg')?.getAttribute('viewBox') === '0 0 640 420', null, { timeout: 15000 })
      .catch(() => {})
    const probe = await hard.page.evaluate(() => ({
      viewport: document.querySelectorAll('.city-pan-viewport').length,
      layer: document.querySelectorAll('.city-pan-layer').length,
      recenter: document.querySelectorAll('.easy-map-recenter').length,
      viewBox: document.querySelector('.city-svg')?.getAttribute('viewBox'),
      eden: document.querySelectorAll('.city-eden').length,
      heaven: document.querySelectorAll('.city-heaven').length,
      streetLamps: document.querySelectorAll('.city-street-lamps').length,
      observatory: [...document.querySelectorAll('.city-svg image')].filter((el) => /plot-observatory/.test(el.getAttribute('href') || '')).length,
    }))
    assert.equal(probe.viewport + probe.layer + probe.recenter, 0, `homePan hard: Hard Home has no pan viewport ${JSON.stringify(probe)}`)
    assert.equal(probe.viewBox, '0 0 640 420', 'Hard Home keeps its viewBox')
    assert.equal(probe.eden, 1, 'Hard Home keeps the Eden vectors')
    assert.equal(probe.heaven, 1, 'Hard Home keeps the heaven city')
    assert.ok(probe.streetLamps >= 1, 'Hard Home keeps the street lamps')
    assert.ok(probe.observatory >= 1, 'Hard Home keeps the observatory still')
  } finally {
    errorsOut.push(...hard.errors)
    await hard.ctx.close()
  }
}

export async function proveHomePan(browser, origin) {
  const errors = []
  const lines = []
  for (const size of HOME_SIZES) {
    await proveHomeOpensOnTarget(browser, origin, size, errors)
    await proveHomeReach(browser, origin, size, errors)
    await proveHomeNoHidden(browser, origin, size, errors)
    await proveHomeOneGold(browser, origin, size, errors)
    await proveHomeTapSlop(browser, origin, size, errors)
    await proveHomeClampAndCenter(browser, origin, size, errors)
    await proveHomeKeys(browser, origin, size, errors)
    await proveHomeTabFocus(browser, origin, size, errors)
    await proveHomeChips(browser, origin, size, errors)
    lines.push(`home-pan ${size[0]}x${size[1]} ok`)
  }
  await proveHomeWideAndHard(browser, origin, errors)
  assert.deepEqual(errors, [], `homePan page errors: ${errors.join('\n')}`)
  lines.push('home-pan wide and hard ok')
  return lines
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
      if (width === 375 && height === 667) {
        await page.evaluate(() => {
          sessionStorage.setItem('silver-city-web-refresh', '9.9.9')
          window.dispatchEvent(new CustomEvent('silver-city-web-update', { detail: { version: '9.9.9' } }))
        })
        await page.locator('[data-web-refresh]').waitFor()
        const updateClass = await page.locator('[data-web-refresh] button', { hasText: 'Get the update' }).getAttribute('class')
        assert.equal(updateClass, 'btn', `update button stays non-gold (${updateClass})`)
        const welcomeGolds = await filledGolds(page)
        assert.equal(welcomeGolds.length, 1, `welcome banner keeps one gold ${JSON.stringify(welcomeGolds)}`)
        assert.match(welcomeGolds[0].text, /Start Easy/)
        await page.screenshot({ path: `${SHOTS}/welcome-update-banner-375.png` })
        const notNow = page.locator('[data-web-refresh] button', { hasText: 'Not now' })
        const notNowBox = await notNow.boundingBox()
        if (!notNowBox) throw new Error('update dismiss has no box')
        await page.mouse.click(notNowBox.x + notNowBox.width / 2, notNowBox.y + notNowBox.height / 2)
        await page.locator('[data-web-refresh]').waitFor({ state: 'detached' })
      }

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
      await assertLocked(page, 'ph-road')
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
      const how = page.locator('[data-run-how]')
      await how.waitFor()
      const howText = ((await how.innerText()) || '').replace(/\s+/g, ' ').trim()
      assert.equal(howText, EASY.runHow, 'the run rule shows once before the first press')
      const howBox = await how.boundingBox()
      assert.ok(howBox && howBox.height > 0, 'run-how has a box')
      assert.ok(howBox.y >= 0 && howBox.y + howBox.height <= height + 1, `run-how sits in the viewport (${howBox.y})`)
      if (width === 375 && height === 667) await page.screenshot({ path: `${SHOTS}/run-ready-375.png` })
      await hugFather(page)
      assert.equal(await page.locator('[data-run-how]').count(), 0, 'the rule hides after the first press')
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
      await assertLocked(page, 'ph-father')
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
      const juice = await playGem(page, 'ob-tuning', { watchLast: true, checkStart: true })
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
      await assertGemWinOneGold(page, 'ob-tuning')
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

      if (width === 375 || width === 390 || width === 412 || width === 768) {
        await dragWhy(page, 'ob-tuning')
        shot = await stamp('quiz-tuning-done')
        assert.match(shot.golds[0].text, /Continue/)
        await assertLocked(page, 'ob-tuning')
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
        await playGem(page, 'ph-debt', { checkStart: true })
        await page.locator('.play.is-gem-search.is-win .btn.primary').waitFor()
        await assertGemWinOneGold(page, 'ph-debt')
        await tapFilledGold(page)
        await page.locator('.why-blast').waitFor()
        await dragWhy(page, 'ph-debt')
        await assertLocked(page, 'ph-debt')
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
        await playGem(page, 'fg-order', { checkStart: true })
        await page.locator('.play.is-gem-search.is-win .btn.primary').waitFor()
        await assertGemWinOneGold(page, 'fg-order')
        await tapFilledGold(page)
        await page.locator('.why-blast').waitFor()
        await dragWhy(page, 'fg-order')
        await assertLocked(page, 'fg-order')
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
        await assertGemStart(page, 'fg-reason')
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
    await assertLocked(humanPage, 'ph-road')
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
    await assertLocked(humanPage, 'ph-father')
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
    await playGem(humanPage, 'ob-tuning', { checkStart: true })
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

    await proveNotQuite(browser, origin)
    await proveGemToast(browser, origin)
    traces.push('hop-b not-quite and gem toast')
    traces.push((await proveHomePan(browser, origin)).join('\n'))
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
