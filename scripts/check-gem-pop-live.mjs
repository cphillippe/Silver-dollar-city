#!/usr/bin/env node
/**
 * Easy Match: every score pop stays outside cell rects (combo, bonus banner, +N, Story toast).
 * Samples mid-animation and near-peak. Real pointer only. Refs #855.
 */
import assert from 'node:assert/strict'
import { mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { chromium } from '@playwright/test'
import { createServer } from 'vite'
import { STORAGE_KEY } from '../src/config/app.ts'
import { buildGemPuzzle, findStraightSpelling, isBonusSpelling, MATCH_CHIPS } from '../src/lib/gemSearch.ts'
import { debugMiniGames } from '../src/lib/debugPlays.ts'
import { withPlaytest1 } from './dev-ui-playtest.mjs'

const VIEWPORTS = [
  [375, 667],
  [375, 812],
  [390, 844],
  [412, 915],
]
const STEP_DRAG_SHOTS = [375, 390]
const WIN_HOME_LINES = ['hl-mind', 'ob-tuning']
const WIN_VIEWPORTS = [
  [375, 667],
  [375, 812],
  [390, 844],
  [412, 915],
]
const POP_SHOT_ROOT =
  process.env.GEM_POP_SHOT_ROOT ?? join(tmpdir(), 'gemsearch-fix', 'pops')

const POP_SELECTOR =
  '.gem-hint-slot .gem-combo, .gem-hint-slot .bonus-banner, .gem-hint-slot .gem-find-pop, .gem-hint-slot .bonus-plus, .gem-hint-slot .match-toast'

function savePayload({ lifetime = 5000, seen = 2 } = {}) {
  const now = new Date()
  const today = [now.getFullYear(), String(now.getMonth() + 1).padStart(2, '0'), String(now.getDate()).padStart(2, '0')].join('-')
  return {
    kind: 'silver-city-save',
    schemaVersion: 1,
    appVersion: '1.4.559',
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
      matchLifetime: lifetime,
      matchSkillSeen: seen,
    },
  }
}

const MATCH_LINES = debugMiniGames()
  .filter((item) => item.play === 'panel-blast' && MATCH_CHIPS[item.lineId])
  .map((item) => item.lineId)

function storyPaths(board) {
  return board.lessonPlanted.map((text) => {
    const word = board.planted.find((item) => item.text === text)
    return { text, path: board.bonusPaths[word.id] }
  })
}

function chipPaths(board) {
  return board.words.map((word) => ({ text: word.text, path: board.paths[word.id] }))
}

function cellsOf(path) {
  return path.map((cell) => `${cell.r}:${cell.c}`)
}

function disjoint(paths) {
  const seen = new Set()
  for (const path of paths) {
    for (const key of cellsOf(path)) {
      if (seen.has(key)) return false
      seen.add(key)
    }
  }
  return true
}

function pickBoard() {
  for (const line of MATCH_LINES) {
    for (let seed = 0; seed < 60; seed += 1) {
      const board = buildGemPuzzle(line, seed)
      const story = storyPaths(board)
      if (story.length < 1) continue
      let generic = null
      for (const text of ['THE', 'ALL', 'ONE', 'PETS', 'ANNA']) {
        const path = findStraightSpelling(board.letters, text)
        if (path && !board.planted.some((word) => word.text === text)) {
          generic = { text, path }
          break
        }
      }
      if (!generic) continue
      const chips = chipPaths(board)
      const used = [...chips.map((c) => c.path), ...story.map((s) => s.path), generic.path]
      if (!disjoint(used)) continue
      if (!isBonusSpelling(generic.text, board)) continue
      return { line, seed, board, chips, story, generic }
    }
  }
  throw new Error('check-gem-pop-live: no pinned board')
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

async function swipe(page, path) {
  const centre = async (cell) => {
    const box = await page.locator(`[data-gem-cell][data-r="${cell.r}"][data-c="${cell.c}"]`).boundingBox()
    assert.ok(box, `cell ${cell.r}:${cell.c} has no box`)
    return { x: box.x + box.width / 2, y: box.y + box.height / 2 }
  }
  const first = await centre(path[0])
  await page.mouse.move(first.x, first.y)
  await page.mouse.down()
  for (const cell of path.slice(1)) {
    const at = await centre(cell)
    await page.mouse.move(at.x, at.y, { steps: 4 })
  }
  await page.mouse.up()
}

async function openLesson(page, origin, lineId, seed) {
  await page.goto(withPlaytest1(`${origin}?gemSeed=${seed}`))
  await page.getByRole('main', { name: 'Home' }).waitFor()
  await pointerClick(page, page.getByRole('button', { name: 'Settings', exact: true }))
  await pointerClick(page, page.locator('details.settings-debug summary'))
  await pointerClick(page, page.locator('details.settings-debug').getByRole('button', { name: new RegExp(`^${lineId} ·`) }).first())
  await page.locator('.gem-board').waitFor()
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

async function popOverlapHit(page) {
  return page.evaluate((popSelector) => {
    const cells = [...document.querySelectorAll('[data-gem-cell]')].map((el) => el.getBoundingClientRect())
    const pops = [...document.querySelectorAll(popSelector)]
      .filter((el) => {
        const style = getComputedStyle(el)
        return style.display !== 'none' && style.visibility !== 'hidden' && Number(style.opacity) > 0.05
      })
      .map((el) => ({ rect: el.getBoundingClientRect(), cls: el.className }))
    for (const pop of pops) {
      const { rect } = pop
      if (rect.width < 1 || rect.height < 1) continue
      for (const cell of cells) {
        if (cell.width < 1) continue
        if (cell.left < rect.right && cell.right > rect.left && cell.top < rect.bottom && cell.bottom > rect.top) {
          return pop.cls
        }
      }
    }
    return null
  }, POP_SELECTOR)
}

async function popHintOverlapHit(page) {
  return page.evaluate((popSelector) => {
    const hint = document.querySelector('.gem-hint-slot .gem-start-hint')
    if (!hint) return null
    const hintStyle = getComputedStyle(hint)
    if (hintStyle.display === 'none' || hintStyle.visibility === 'hidden' || Number(hintStyle.opacity) < 0.05) {
      return null
    }
    const hintRect = hint.getBoundingClientRect()
    if (hintRect.height < 2 || hintRect.width < 2) return null
    const pops = [...document.querySelectorAll(popSelector)].filter((el) => {
      const style = getComputedStyle(el)
      return style.display !== 'none' && style.visibility !== 'hidden' && Number(style.opacity) > 0.05
    })
    for (const el of pops) {
      const rect = el.getBoundingClientRect()
      if (rect.width < 1 || rect.height < 1) continue
      if (
        hintRect.left < rect.right &&
        hintRect.right > rect.left &&
        hintRect.top < rect.bottom &&
        hintRect.bottom > rect.top
      ) {
        return `${el.className} ∩ gem-start-hint`
      }
    }
    return null
  }, POP_SELECTOR)
}

async function popPopOverlapHit(page) {
  return page.evaluate((popSelector) => {
    const pops = [...document.querySelectorAll(popSelector)]
      .filter((el) => {
        const style = getComputedStyle(el)
        return style.display !== 'none' && style.visibility !== 'hidden' && Number(style.opacity) > 0.05
      })
      .map((el) => ({ rect: el.getBoundingClientRect(), cls: el.className }))
    for (let i = 0; i < pops.length; i += 1) {
      const a = pops[i].rect
      if (a.width < 1 || a.height < 1) continue
      for (let j = i + 1; j < pops.length; j += 1) {
        const b = pops[j].rect
        if (b.width < 1 || b.height < 1) continue
        if (a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top) {
          return `${pops[i].cls} ∩ ${pops[j].cls}`
        }
      }
    }
    return null
  }, POP_SELECTOR)
}

async function assertPopsClear(page, tag) {
  const hit = await popOverlapHit(page)
  assert.equal(hit, null, `${tag} pop outside cells (hit ${hit ?? 'none'})`)
  const popHit = await popPopOverlapHit(page)
  assert.equal(popHit, null, `${tag} pops disjoint (hit ${popHit ?? 'none'})`)
  const hintHit = await popHintOverlapHit(page)
  assert.equal(hintHit, null, `${tag} pops clear hint line (hit ${hintHit ?? 'none'})`)
}

async function goldCueOffenders(page) {
  return page.evaluate(() => {
    const gold = /rgba?\(255, 204, 51(?:, [\d.]+)?\)|rgba?\(255, 159, 26(?:, [\d.]+)?\)/
    const props = [
      'color', 'backgroundColor', 'backgroundImage', 'borderTopColor', 'borderRightColor', 'borderBottomColor',
      'borderLeftColor', 'outlineColor', 'boxShadow', 'textShadow', 'filter', 'fill', 'stroke',
    ]
    const root = document.querySelector('.play.is-gem-search')
    if (!root) return ['no play root']
    const hits = []
    for (const node of [root, ...root.querySelectorAll('*')]) {
      const lockIn = node.closest('button')
      if (lockIn && /Lock In next/.test(lockIn.textContent || '')) continue
      const box = node.getBoundingClientRect()
      const own = getComputedStyle(node)
      if (own.display === 'none' || own.visibility === 'hidden' || Number(own.opacity) === 0) continue
      if (box.width === 0 && box.height === 0) continue
      for (const pseudo of [null, '::before', '::after']) {
        const style = pseudo ? getComputedStyle(node, pseudo) : own
        if (pseudo && style.content === 'none') continue
        for (const prop of props) {
          if (!gold.test(style[prop])) continue
          if (prop === 'backgroundColor' && node.classList.contains('gem-cell') && !pseudo) continue
          hits.push(`${node.tagName.toLowerCase()}.${String(node.className).trim().split(/\s+/).join('.')}${pseudo ?? ''}:${prop}`)
        }
      }
    }
    return hits
  })
}

async function assertOneGoldCue(page, tag) {
  const playGold = (await goldCueOffenders(page)).filter(
    (item) => !/is-start-gold|gem-cell\.[^:]*is-bonus-burst|bonus-banner|gem-combo|gem-find-pop|bonus-plus|match-toast/.test(item),
  )
  assert.deepEqual(playGold, [], `${tag} one gold cue (start cell only) during pop (${playGold.join(' | ')})`)
}

async function samplePopMoments(page, tag, delays, { gold = false } = {}) {
  for (const ms of delays) {
    await page.waitForTimeout(ms)
    await assertPopsClear(page, `${tag} @+${ms}ms`)
    if (gold) await assertOneGoldCue(page, `${tag} @+${ms}ms`)
  }
}

async function boardTopY(page) {
  return page.evaluate(() => document.querySelector('.gem-board')?.getBoundingClientRect().top ?? NaN)
}

async function assertBoardTopStable(page, y0, tag, label) {
  const y = await boardTopY(page)
  assert.ok(Number.isFinite(y), `${tag} board top readable (${label})`)
  assert.ok(Math.abs(y - y0) <= 1, `${tag} board Y within 1px (${label}: ${y0.toFixed(1)} -> ${y.toFixed(1)})`)
}

async function sampleBoardStable(page, y0, tag, delays) {
  for (const ms of delays) {
    if (ms > 0) await page.waitForTimeout(ms)
    await assertBoardTopStable(page, y0, tag, `+${ms}ms`)
  }
}

async function foundChipCount(page) {
  return page.locator('.match-teach-chip.is-found').count()
}

async function assertStepDragThenSteps(page, origin, w, { shot = false } = {}) {
  await openLesson(page, origin, 'ob-tuning', 0)
  const board = buildGemPuzzle('ob-tuning', 0)
  const steps = board.words.find((word) => word.text === 'STEPS')
  assert.ok(steps, 'ob-tuning STEPS chip')
  const full = board.paths[steps.id]
  const stepPath = full.slice(0, 4)
  await swipe(page, stepPath)
  await page.waitForTimeout(800)
  assert.equal(await page.locator('.miss-banner').count(), 0, 'STEP drag release scores without Miss')
  assert.ok((await page.locator('.bonus-banner').count()) >= 1, 'STEP drag scores bonus banner')
  assert.equal(await foundChipCount(page), 0, 'STEP is bonus not a chip find')
  await swipe(page, full)
  await page.waitForTimeout(900)
  assert.equal(await foundChipCount(page), 1, 'STEPS chip scores after STEP bonus')
  if (shot) {
    await page.screenshot({ path: join(POP_SHOT_ROOT, `ob-tuning-${w}-step-then-steps.png`) })
  }
}

async function playPopScenario(page, origin, viewport, main) {
  const [w, h] = viewport
  const tag = `${main.line}-${w}x${h}`
  await openLesson(page, origin, main.line, main.seed)
  await page.waitForTimeout(200)
  const boardY0 = await boardTopY(page)
  await assertBoardTopStable(page, boardY0, tag, 'idle')

  await swipe(page, main.story[0].path)
  await samplePopMoments(page, `${tag} story-toast`, [120, 320, 700], { gold: true })
  await sampleBoardStable(page, boardY0, `${tag} story-toast`, [0])

  await swipe(page, main.generic.path)
  await page.waitForTimeout(180)
  await assertPopsClear(page, `${tag} combo+bonus peak`)
  await assertOneGoldCue(page, `${tag} combo+bonus peak`)
  await sampleBoardStable(page, boardY0, `${tag} combo+bonus`, [0, 80, 220, 320, 500, 700, 1100])
  if (w === 375 || w === 390) {
    await page.screenshot({ path: join(POP_SHOT_ROOT, `${main.line}-${w}-combo-bonus-peak.png`) })
  }
  if (w === 375 && h === 667) {
    const scroll = await page.evaluate(() => ({
      docH: document.documentElement.scrollHeight,
      vh: window.innerHeight,
      scrollY: window.scrollY,
    }))
    assert.ok(scroll.docH <= scroll.vh + 2 && scroll.scrollY === 0, `${tag} no page scroll at 375×667`)
  }

  await samplePopMoments(page, `${tag} bonus-banner`, [200, 600, 1200], { gold: true })
  await sampleBoardStable(page, boardY0, `${tag} after-bonus`, [0])

  for (let i = 0; i < main.chips.length; i += 1) {
    await swipe(page, main.chips[i].path)
    const delays = i === 1 ? [80, 220, 320, 500] : [100, 280]
    await samplePopMoments(page, `${tag} chip-${i + 1}`, delays)
  }
}

async function assertJarOrbMissesCount(page, tag) {
  const bad = await page.evaluate(() => {
    const count = document.querySelector('[data-gem-jar-count]')
    if (!count) return ''
    const cr = count.getBoundingClientRect()
    if (cr.width < 1 || cr.height < 1) return ''
    for (const orb of document.querySelectorAll('.gem-jar-orb')) {
      const style = getComputedStyle(orb)
      if (style.display === 'none' || style.visibility === 'hidden' || Number(style.opacity) < 0.05) continue
      const or = orb.getBoundingClientRect()
      if (or.width < 1 || or.height < 1) continue
      if (cr.left < or.right && cr.right > or.left && cr.top < or.bottom && cr.bottom > or.top) {
        return 'gem-jar-orb overlaps +N count'
      }
    }
    for (const pop of document.querySelectorAll(
      '.gem-hint-slot .gem-combo, .gem-hint-slot .bonus-banner, .gem-hint-slot .gem-find-pop, .gem-hint-slot .bonus-plus, .gem-hint-slot .match-toast',
    )) {
      const style = getComputedStyle(pop)
      if (style.display === 'none' || style.visibility === 'hidden' || Number(style.opacity) < 0.05) continue
      const pr = pop.getBoundingClientRect()
      if (pr.width < 1 || pr.height < 1) continue
      if (cr.left < pr.right && cr.right > pr.left && cr.top < pr.bottom && cr.bottom > pr.top) {
        return 'score pop overlaps gem-jar count'
      }
    }
    return ''
  })
  assert.equal(bad, '', `${tag} jar count clear (${bad || 'ok'})`)
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

async function playWinHome(page, origin, lineId, viewport) {
  const [w, h] = viewport
  const board = buildGemPuzzle(lineId, 0)
  await openLesson(page, origin, lineId, 0)
  const letters = board.letters
  const words = board.words.map((word) => word.text)
  for (const word of words) {
    const path = locateWord(letters, word)
    assert.ok(path, `${lineId} locates ${word}`)
    await swipe(page, path)
    await page.waitForTimeout(700)
  }
  await page.locator('.play.is-gem-search.is-win').waitFor({ timeout: 8000 })
  await page.waitForTimeout(1100)
  await assertJarOrbMissesCount(page, `${lineId} ${w}x${h} mid-orb`)
  await page.waitForTimeout(600)
  const boardHeader = await page.evaluate(() => {
    const topbar = document.querySelector('.topbar')
    const board = document.querySelector('.play.is-gem-search.is-win .gem-board')
    const tb = topbar?.getBoundingClientRect()
    const bb = board?.getBoundingClientRect()
    return {
      headerBottom: tb ? tb.bottom : 0,
      boardTop: bb ? bb.top : 0,
    }
  })
  assert.ok(
    boardHeader.boardTop >= boardHeader.headerBottom - 1,
    `${lineId} board top below header at ${w}x${h} (board ${boardHeader.boardTop.toFixed(1)} header ${boardHeader.headerBottom.toFixed(1)})`,
  )
  const home = page.locator('.play.is-gem-search.is-win .cta-dock .btn').filter({ hasText: /^Home$/ })
  await home.waitFor()
  const box = await home.boundingBox()
  assert.ok(box, `${lineId} Home button has a box`)
  assert.ok(
    box.y >= -0.5 && box.y + box.height <= h + 0.5,
    `${lineId} Home fully visible at ${w}x${h} (y=${box.y.toFixed(1)} h=${box.height.toFixed(1)})`,
  )
  await assertWinNoScroll(page, `${lineId} ${w}x${h}`)
  await assertJarOrbMissesCount(page, `${lineId} ${w}x${h} win-home`)
  await page.screenshot({ path: join(POP_SHOT_ROOT, `${lineId}-${w}-win-home.png`) })
}

export async function checkGemPopLive() {
  mkdirSync(POP_SHOT_ROOT, { recursive: true })
  const main = pickBoard()
  const server = await createServer({
    server: { host: '127.0.0.1', port: 0 },
    cacheDir: 'node_modules/.vite-gem-pop',
    logLevel: 'warn',
  })
  await server.listen()
  const address = server.httpServer?.address()
  const port = address && typeof address === 'object' ? address.port : 0
  assert.ok(port > 0, 'gem pop server has a port')
  const origin = `http://127.0.0.1:${port}/`
  const browser = await launchBrowser()
  const errors = []
  try {
    for (const viewport of VIEWPORTS) {
      const context = await browser.newContext({
        viewport: { width: viewport[0], height: viewport[1] },
        isMobile: true,
      })
      await context.addInitScript(({ key, payload }) => {
        window.localStorage.setItem(key, JSON.stringify(payload))
      }, { key: STORAGE_KEY, payload: savePayload() })
      const page = await context.newPage()
      page.on('pageerror', (err) => errors.push(String(err)))
      await playPopScenario(page, origin, viewport, main)
      await context.close()
    }
    for (const w of STEP_DRAG_SHOTS) {
      const context = await browser.newContext({
        viewport: { width: w, height: w === 375 ? 667 : 844 },
        isMobile: true,
      })
      await context.addInitScript(({ key, payload }) => {
        window.localStorage.setItem(key, JSON.stringify(payload))
      }, { key: STORAGE_KEY, payload: savePayload() })
      const page = await context.newPage()
      page.on('pageerror', (err) => errors.push(String(err)))
      await assertStepDragThenSteps(page, origin, w, { shot: true })
      await context.close()
    }
    for (const viewport of WIN_VIEWPORTS) {
      for (const lineId of WIN_HOME_LINES) {
        const context = await browser.newContext({
          viewport: { width: viewport[0], height: viewport[1] },
          isMobile: true,
        })
        await context.addInitScript(({ key, payload }) => {
          window.localStorage.setItem(key, JSON.stringify(payload))
        }, { key: STORAGE_KEY, payload: savePayload() })
        const page = await context.newPage()
        page.on('pageerror', (err) => errors.push(String(err)))
        await playWinHome(page, origin, lineId, viewport)
        await context.close()
      }
    }
  } finally {
    await browser.close()
    await server.close()
  }
  assert.equal(errors.join('\n'), '', 'gem pop live: no page errors')
  console.log('check-gem-pop-live: ok', POP_SHOT_ROOT)
}

if (import.meta.url.startsWith('file:') && process.argv[1]?.endsWith('check-gem-pop-live.mjs')) {
  await checkGemPopLive()
}
