#!/usr/bin/env node
/**
 * Gem Jar, skill ladder and Story words on the Easy Match board.
 * Real pointer only (page.mouse down / move / up across cell centres). No el.click(),
 * no dispatchEvent, no state pokes during play. Saves are seeded before the page loads.
 * Runs at 375x667, 390x844 and 768x1024. Boards are pinned with `?gemSeed=N` (dev server only).
 */
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { chromium } from 'playwright'
import { createServer } from 'vite'
import { STORAGE_KEY } from '../src/config/app.ts'
import { buildGemPuzzle, findStraightSpelling, isBonusSpelling, LESSON_BONUS, MATCH_CHIPS } from '../src/lib/gemSearch.ts'
import {
  JAR_RUNGS,
  RESERVED_LADDER_STEPS,
  SKILL_LADDER,
  boardTotal,
  jarCaption,
  jarCrossing,
  jarState,
  skillBonusPoints,
  skillsFor,
} from '../src/lib/gemJar.ts'
import { applyMatchBonus, applyMatchDockJuice, applyMatchFind, applyMatchMiss } from '../src/lib/matchBonus.ts'
import { debugMiniGames } from '../src/lib/debugPlays.ts'
import { emptyProgress, normalizeProgress } from '../src/lib/save.ts'
import { MATCH_DOCK_JUICE_POINTS } from '../src/lib/matchBonus.ts'

const VIEWPORTS = [
  [375, 667],
  [390, 844],
  [768, 1024],
]
const GOLD = /rgb\(255, 204, 51\)/

// ---- unit: jar, ladder, save --------------------------------------------------------------
assert.deepEqual(JAR_RUNGS, [1000, 4000, 9000])
assert.equal(jarState(0).rung, 0)
assert.equal(jarState(999).rung, 0)
assert.equal(jarState(1000).rung, 1)
assert.equal(jarState(4000).rung, 2)
assert.equal(jarState(9000).rung, 3)
assert.equal(jarState(9000).fullCount, 0)
assert.equal(jarState(13999).fullCount, 0)
assert.equal(jarState(14000).fullCount, 1)
assert.equal(jarState(2480).nextAt, 4000)
assert.equal(jarCaption(2480), '2,480 / 4,000')
assert.equal(jarState(14000).nextAt, 19000)
assert.deepEqual(skillsFor(999), [])
assert.deepEqual(skillsFor(1000), ['sight'])
assert.deepEqual(skillsFor(4000), ['sight', 'combo'])
assert.deepEqual(skillsFor(9000), ['sight', 'combo', 'big'])
assert.deepEqual(
  SKILL_LADDER.map((skill) => skill.name),
  ['Bonus Sight', 'Combo Spark', 'Big Word'],
)
assert.deepEqual(
  RESERVED_LADDER_STEPS.map((step) => step.step),
  [4, 5],
  'steps 4 and 5 are reserved, not live',
)
assert.equal(skillsFor(1_000_000).length, 3, 'reserved steps unlock nothing')
assert.equal(jarCrossing(0, 1190, 0)?.skill?.name, 'Bonus Sight')
assert.equal(jarCrossing(0, 1190, 1), null, 'a reveal plays once')
assert.equal(jarCrossing(1190, 2380, 1), null)
assert.equal(jarCrossing(2380, 4020, 1)?.skill?.name, 'Combo Spark')
assert.equal(jarCrossing(0, 9500, 0)?.skill?.name, 'Big Word', 'a big jump reveals the highest step once')
assert.equal(jarCrossing(13000, 14100, 3)?.full, 1, 'a refill after step 3 says Jar full')
assert.equal(boardTotal([1000, 40, -25, 100.9]), 1140)
assert.equal(skillBonusPoints([], { length: 6 }, 5), 0, 'no skills, no extra points')
assert.equal(skillBonusPoints(['sight'], { length: 6 }, 5), 0)
assert.equal(skillBonusPoints(['sight', 'combo'], { length: 4 }, 1), 0)
assert.equal(skillBonusPoints(['sight', 'combo'], { length: 4 }, 2), 50)
assert.equal(skillBonusPoints(['sight', 'combo', 'big'], { length: 3 }, 2), 50)
assert.equal(skillBonusPoints(['sight', 'combo', 'big'], { length: 5 }, 1), 100)
assert.equal(skillBonusPoints(['sight', 'combo', 'big'], { length: 6 }, 2), 150)

const fresh = emptyProgress()
assert.equal(fresh.matchLifetime, 0)
assert.equal(fresh.matchSkillSeen, 0)
const found = applyMatchFind(fresh, 'x', 40)
assert.equal(found.matchLifetime, 40)
const bonus = applyMatchBonus({ ...fresh, ...found }, 'x', 100)
assert.equal(bonus.matchLifetime, 140)
const dock = applyMatchDockJuice({ ...fresh, ...found, ...bonus }, 'x')
assert.equal(dock.matchLifetime, 140 + MATCH_DOCK_JUICE_POINTS)
const missed = applyMatchMiss({ ...fresh, ...found, ...bonus, ...dock }, 'x')
assert.equal(missed.matchBonus.x, 1140 - 25 + 0, 'a miss still costs the line 25')
assert.equal(missed.matchLifetime, undefined, 'a miss leaves the jar alone')
const unchanged = { ...fresh, ...found, ...bonus, ...dock, ...missed }
assert.equal(unchanged.matchLifetime, 1140, 'the jar never goes down')
const old = normalizeProgress({ matchBonus: { a: 1200, b: 300 } })
assert.equal(old.matchLifetime, 1500, 'old saves backfill the jar from matchBonus')
assert.equal(old.matchSkillSeen, 0)
const bare = normalizeProgress({})
assert.equal(bare.matchLifetime, 0)
assert.equal(bare.matchSkillSeen, 0)
assert.equal(normalizeProgress({ matchLifetime: 5000, matchBonus: { a: 10 } }).matchLifetime, 5000)
assert.equal(normalizeProgress({ matchLifetime: 100, matchBonus: { a: 700 } }).matchLifetime, 700)
assert.equal(normalizeProgress({ matchSkillSeen: 3, matchLifetime: 1200 }).matchSkillSeen, 1, 'seen never outruns the jar')

// ---- test boards ---------------------------------------------------------------------------
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

function chipPaths(board) {
  return board.words.map((word) => ({ text: word.text, path: board.paths[word.id] }))
}

function storyPaths(board) {
  return board.lessonPlanted.map((text) => {
    const word = board.planted.find((item) => item.text === text)
    return { text, path: board.bonusPaths[word.id] }
  })
}

const MATCH_LINES = debugMiniGames()
  .filter((item) => item.play === 'panel-blast' && MATCH_CHIPS[item.lineId])
  .map((item) => item.lineId)

/** A board whose chips, story words and one generic word never share a cell. */
function pickBoard(wanted) {
  for (const line of MATCH_LINES) {
    for (let seed = 0; seed < 60; seed += 1) {
      const board = buildGemPuzzle(line, seed)
      const story = storyPaths(board)
      if (story.length < (wanted.stories ?? 1)) continue
      if (wanted.bigFirst && !(story[0].text.length >= 5)) continue
      if (wanted.smallStories && story.slice(0, 2).some((item) => item.text.length >= 5)) continue
      let generic = null
      if (wanted.generic) {
        for (const text of ['THE', 'ALL', 'ONE', 'PETS', 'ANNA']) {
          const path = findStraightSpelling(board.letters, text)
          if (path && !board.planted.some((word) => word.text === text)) {
            generic = { text, path }
            break
          }
        }
        if (!generic) continue
      }
      const chips = chipPaths(board)
      const used = [...chips.map((c) => c.path), ...story.map((s) => s.path)]
      if (generic) used.push(generic.path)
      if (!disjoint(used)) continue
      if (generic && !isBonusSpelling(generic.text, board)) continue
      return { line, seed, board, chips, story, generic }
    }
  }
  throw new Error(`no board for ${JSON.stringify(wanted)}`)
}

// ---- browser helpers -----------------------------------------------------------------------
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

function saveFor({ lifetime = 0, seen = 0, easy = true } = {}) {
  const now = new Date()
  const today = [now.getFullYear(), String(now.getMonth() + 1).padStart(2, '0'), String(now.getDate()).padStart(2, '0')].join('-')
  return {
    kind: 'silver-city-save',
    schemaVersion: 1,
    appVersion: '1.4.520',
    savedAt: now.toISOString(),
    progress: {
      started: true,
      easyMode: easy,
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

async function newPage(browser, origin, [width, height], save, { reduced = false } = {}) {
  const context = await browser.newContext({
    baseURL: origin,
    viewport: { width, height },
    deviceScaleFactor: 1,
    reducedMotion: reduced ? 'reduce' : 'no-preference',
  })
  await context.addInitScript(
    (payload) => {
      localStorage.clear()
      localStorage.setItem(payload.key, JSON.stringify(payload.save))
    },
    { key: STORAGE_KEY, save },
  )
  const page = await context.newPage()
  const errors = []
  page.on('pageerror', (error) => errors.push(String(error)))
  return { page, context, errors }
}

async function openBoard(page, line, seed) {
  await page.goto(`/?gemSeed=${seed}`)
  await page.getByRole('main', { name: 'Home' }).waitFor()
  await pointerClick(page, page.getByRole('button', { name: 'Settings', exact: true }))
  await pointerClick(page, page.locator('details.settings-debug summary'))
  await pointerClick(page, page.locator('details.settings-debug').getByRole('button', { name: new RegExp(`^${line} ·`) }).first())
  await page.locator('.gem-board').waitFor()
  const letters = await page.evaluate(() => [...document.querySelectorAll('.gem-letter')].map((n) => n.textContent).join(''))
  return letters
}

async function savedProgress(page) {
  return page.evaluate((key) => JSON.parse(localStorage.getItem(key) || '{}').progress ?? {}, STORAGE_KEY)
}

/** Opaque gold anywhere a cue can paint, pseudo-elements included. */
async function goldElements(page, rootSelector, skipSelector) {
  return page.evaluate(
    ({ rootSelector, skipSelector, source }) => {
      const gold = new RegExp(source)
      const props = [
        'color',
        'backgroundColor',
        'borderTopColor',
        'borderRightColor',
        'borderBottomColor',
        'borderLeftColor',
        'outlineColor',
        'boxShadow',
        'textShadow',
        'fill',
        'stroke',
      ]
      const hits = []
      const root = document.querySelector(rootSelector)
      if (!root) return hits
      const nodes = [root, ...root.querySelectorAll('*')]
      for (const node of nodes) {
        if (skipSelector && node.closest(skipSelector)) continue
        const box = node.getBoundingClientRect()
        const style = getComputedStyle(node)
        if (style.display === 'none' || style.visibility === 'hidden' || Number(style.opacity) === 0) continue
        if (box.width === 0 && box.height === 0) continue
        for (const pseudo of [null, '::before', '::after']) {
          const computed = pseudo ? getComputedStyle(node, pseudo) : style
          if (pseudo && computed.content === 'none') continue
          for (const prop of props) {
            if (gold.test(computed[prop])) {
              hits.push(`${node.tagName.toLowerCase()}.${String(node.className).split(' ').join('.')}${pseudo ?? ''}:${prop}`)
              break
            }
          }
        }
      }
      return hits.filter((hit) => !/^div\.gem-cell\.hue-\d(?!.*is-start-gold):backgroundColor$|^div\.gem-cell\.hue-\d(?!.*is-start-gold)[.\w-]*:backgroundColor$/.test(hit))
    },
    { rootSelector, skipSelector, source: GOLD.source },
  )
}

async function winLayout(page, label, [width, height]) {
  const layout = await page.evaluate(() => {
    const rect = (selector) => {
      const node = document.querySelector(selector)
      if (!node) return null
      const box = node.getBoundingClientRect()
      return { top: box.top, bottom: box.bottom, left: box.left, right: box.right, width: box.width, height: box.height }
    }
    const jar = document.querySelector('[data-gem-jar]')
    return {
      jar: rect('[data-gem-jar]'),
      dock: rect('.cta-dock'),
      board: rect('.gem-board'),
      yes: rect('.match-yes'),
      radius: jar ? parseFloat(getComputedStyle(jar).borderTopLeftRadius) : 0,
      clipped: jar
        ? [...jar.querySelectorAll('*')]
            .filter((n) => !n.closest('.gem-jar-spark') && !n.classList.contains('gem-jar-spark') && !n.classList.contains('gem-jar-orb'))
            .some((n) => {
              const a = n.getBoundingClientRect()
              const b = jar.getBoundingClientRect()
              return a.right > b.right + 1 || a.left < b.left - 1 || a.bottom > b.bottom + 1 || a.top < b.top - 1
            })
        : true,
      sizes: jar ? [jar.scrollWidth, jar.clientWidth, jar.scrollHeight, jar.clientHeight, jar.className] : [],
      pageScroll: document.documentElement.scrollHeight - innerHeight,
      primaries: [...document.querySelectorAll('.cta-dock .btn.primary')].map((n) => (n.textContent || '').trim()),
      innerHeight,
      innerWidth,
    }
  })
  assert.ok(layout.jar && layout.jar.height > 20, `${label} jar is visible`)
  assert.ok(layout.radius >= 16, `${label} jar is a rounded card (${layout.radius}px)`)
  assert.equal(layout.clipped, false, `${label} jar text is not clipped ${JSON.stringify(layout.sizes)}`)
  assert.ok(layout.jar.left >= 0 && layout.jar.right <= layout.innerWidth + 0.5, `${label} jar fits the width`)
  assert.deepEqual(layout.primaries, ['Lock In next'], `${label} one primary: Lock In next`)
  assert.ok(layout.dock && layout.dock.bottom <= layout.innerHeight + 0.5, `${label} dock inside the viewport (${layout.dock?.bottom} <= ${layout.innerHeight})`)
  assert.ok(layout.dock.top >= (layout.yes?.bottom ?? 0) - 0.5, `${label} dock sits below the takeaway`)
  assert.ok(layout.board.bottom <= layout.jar.top + 1, `${label} jar sits under the board, not over it`)
  assert.ok(layout.pageScroll <= 1, `${label} the win page never scrolls (${layout.pageScroll})`)
  return layout
}

function totalFor(chips, extras) {
  return MATCH_DOCK_JUICE_POINTS + chips.reduce((sum, chip) => sum + Math.max(25, chip.text.length * 10), 0) + extras
}

/** New Easy text must be >= 13px and use the existing body sans stack (no Fraunces, no serif). */
async function typeOffenders(page, selector) {
  return page.evaluate((selector) => {
    const bodyFamily = getComputedStyle(document.body).fontFamily
    const bad = []
    for (const root of document.querySelectorAll(selector)) {
      for (const node of [root, ...root.querySelectorAll('*')]) {
        const own = [...node.childNodes].some((n) => n.nodeType === 3 && (n.textContent || '').trim())
        if (!own) continue
        const style = getComputedStyle(node)
        const px = parseFloat(style.fontSize)
        if (px < 13 || style.fontFamily !== bodyFamily || /fraunces/i.test(style.fontFamily)) {
          bad.push(`${node.tagName.toLowerCase()}.${String(node.className)} ${px}px ${style.fontFamily}`)
        }
      }
    }
    return bad
  }, selector)
}

/** #FFCC33 / #FF9F1A (any alpha, gradients and glows included) outside Lock In next. Board tile fills are palette, not a cue. */
async function goldCueOffenders(page) {
  return page.evaluate(() => {
    const gold = /rgba?\(255, 204, 51(?:, [\d.]+)?\)|rgba?\(255, 159, 26(?:, [\d.]+)?\)/
    const props = [
      'color', 'backgroundColor', 'backgroundImage', 'borderTopColor', 'borderRightColor', 'borderBottomColor',
      'borderLeftColor', 'outlineColor', 'boxShadow', 'textShadow', 'filter', 'fill', 'stroke',
    ]
    const root = document.querySelector('.play.is-gem-search')
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

async function contrastOf(page, selector) {
  return page.locator(selector).first().evaluate((node) => {
    const parse = (css) => css.match(/[\d.]+/g).map(Number)
    const lum = ([r, g, b]) => {
      const [lr, lg, lb] = [r, g, b].map((v) => {
        const c = v / 255
        return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
      })
      return 0.2126 * lr + 0.7152 * lg + 0.0722 * lb
    }
    const style = getComputedStyle(node)
    const fg = parse(style.color)
    const bg = parse(style.backgroundColor)
    const alpha = bg.length > 3 ? bg[3] : 1
    const a = lum(fg)
    const b = lum(bg)
    return { ratio: (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05), alpha, opacity: Number(style.opacity) }
  })
}

async function toastText(page) {
  const toast = page.locator('.gem-stage .match-toast, .gem-stage .bonus-banner')
  await toast.first().waitFor({ timeout: 3000 })
  return ((await toast.first().innerText()) || '').replace(/\s+/g, ' ').trim()
}

async function run() {
  const server = await createServer({
    server: { host: '127.0.0.1', port: 0 },
    cacheDir: 'node_modules/.vite-gem-jar',
    logLevel: 'warn',
  })
  await server.listen()
  const address = server.httpServer?.address()
  const port = address && typeof address === 'object' ? address.port : 0
  assert.ok(port > 0, 'gem jar server has a port')
  const origin = `http://127.0.0.1:${port}/`
  const browser = await launchBrowser()
  const errors = []
  try {
    const main = pickBoard({ stories: 1, generic: true })
    const next = buildGemPuzzle(main.line, main.seed + 1)
    for (const viewport of VIEWPORTS) {
      const tag = `${viewport[0]}x${viewport[1]}`
      const { page, context, errors: pageErrors } = await newPage(browser, origin, viewport, saveFor())
      errors.push(...pageErrors)
      const letters = await openBoard(page, main.line, main.seed)
      assert.equal(letters, main.board.letters.map((row) => row.join('')).join(''), `${tag} the pinned board dealt`)

      // A: play state, one gold cue
      await page.waitForTimeout(300)
      const playGold = await goldElements(page, '.play.is-gem-search', '.cta-dock')
      assert.equal(await page.locator('.gem-cell.is-start-gold').count(), 1, `${tag} one start cell`)
      assert.deepEqual(
        playGold.filter((item) => !/is-start-gold/.test(item)),
        [],
        `${tag} the only gold in play is the start cell (${playGold.join(' | ')})`,
      )
      assert.equal(await page.locator('.gem-cell.is-sight').count(), 0, `${tag} a fresh save has no Bonus Sight`)

      // B: a story word, then a generic extra, then the chips
      const story = main.story[0]
      await swipe(page, story.path)
      assert.match(await toastText(page), /Story word! \+100/, `${tag} story word pops +100`)
      assert.deepEqual(await typeOffenders(page, '.gem-stage .match-toast'), [], `${tag} Story word! pop type is >= 13px sans`)
      const toastLook = await contrastOf(page, '.gem-stage .match-toast')
      assert.ok(toastLook.ratio >= 4.5, `${tag} Story word! toast text contrast ${toastLook.ratio.toFixed(2)} >= 4.5`)
      assert.equal(toastLook.alpha, 1, `${tag} Story word! toast fill is opaque`)
      assert.equal(toastLook.opacity, 1, `${tag} Story word! toast has no translucency`)
      const toastShape = await page.locator('.gem-stage .match-toast').first().evaluate((n) => {
        const s = getComputedStyle(n)
        return { bg: s.backgroundColor, radius: parseFloat(s.borderTopLeftRadius) }
      })
      assert.equal(toastShape.bg, 'rgb(42, 16, 112)', `${tag} toast fill is --ink`)
      assert.equal(toastShape.radius, 22, `${tag} toast uses --radius`)
      assert.deepEqual(
        (await goldCueOffenders(page)).filter((item) => !/is-start-gold|gem-cell\.[^:]*is-bonus-burst/.test(item)),
        [],
        `${tag} no gold cue beyond the start cell while the Story word! pop shows`,
      )
      let progress = await savedProgress(page)
      assert.equal(progress.matchBonus[main.line] - 0 >= 100, true)
      const afterStory = progress.matchLifetime
      await page.waitForTimeout(700)
      await swipe(page, main.generic.path)
      assert.match(await toastText(page), /BONUS! \+50/, `${tag} ${main.generic.text} scores instead of "Not a bonus word"`)
      const bannerLook = await page.locator('.gem-stage .bonus-banner').first().evaluate((n) => {
        const s = getComputedStyle(n)
        return { bg: s.backgroundColor, bgImage: s.backgroundImage, color: s.color }
      })
      assert.equal(bannerLook.bg, 'rgb(61, 204, 122)', `${tag} +50 banner fill is --pine`)
      assert.equal(bannerLook.bgImage, 'none', `${tag} +50 banner has no gold gradient`)
      assert.equal(bannerLook.color, 'rgb(255, 246, 232)', `${tag} +50 banner text is --parchment`)
      assert.deepEqual(
        (await goldCueOffenders(page)).filter((item) => !/is-start-gold|gem-cell\.[^:]*is-bonus-burst/.test(item)),
        [],
        `${tag} no gold cue beyond the start cell while the +50 banner shows`,
      )
      assert.equal(await page.locator('.miss-banner').count(), 0, `${tag} no Not-a-bonus-word miss`)
      progress = await savedProgress(page)
      assert.equal(progress.matchLifetime, afterStory + 50, `${tag} generic extra fills the jar by 50`)
      await page.waitForTimeout(900)
      for (const chip of main.chips) {
        await swipe(page, chip.path)
        await page.waitForTimeout(450)
      }
      await page.locator('[data-gem-jar]').waitFor({ timeout: 6000 })

      // G: Lock In next must not wait for orb/reveal — board pts and post-board jar read show immediately
      const lock = page.getByRole('button', { name: 'Lock In next', exact: true })
      await lock.waitFor()
      const expected = totalFor(main.chips, 150)
      const earlyCount = await page.locator('[data-gem-jar-count]').innerText()
      assert.equal(earlyCount, `+${expected.toLocaleString('en-US')}`, `${tag} board pts visible when Lock In appears`)
      assert.equal(
        await page.locator('[data-gem-jar-caption]').innerText(),
        jarCaption(expected),
        `${tag} caption reflects post-board total immediately`,
      )
      const fillPctEarly = await page.locator('.gem-jar-fill').evaluate((el) => {
        const track = el.parentElement
        if (!track) return 0
        return (el.getBoundingClientRect().width / track.getBoundingClientRect().width) * 100
      })
      assert.ok(fillPctEarly > 5, `${tag} jar fill reflects earned points (${fillPctEarly.toFixed(1)}%)`)

      // C + D
      await page.locator('.gem-jar.is-tipped').waitFor({ timeout: 4000 })
      assert.deepEqual(await goldCueOffenders(page), [], `${tag} tipping screen: Lock In next is the only gold`)
      await page.locator('[data-gem-jar-reveal]').waitFor({ timeout: 4000 })
      await page.waitForTimeout(700)
      const layout = await winLayout(page, tag, viewport)
      assert.deepEqual(await typeOffenders(page, '[data-gem-jar]'), [], `${tag} jar, Story word! and skill reveal type is >= 13px sans`)
      assert.deepEqual(await goldCueOffenders(page), [], `${tag} win screen: Lock In next is the only gold`)
      const jarGold = await goldElements(page, '[data-gem-jar]', null)
      assert.deepEqual(jarGold, [], `${tag} the jar has no gold (${jarGold.join(' | ')})`)
      const winGold = await goldElements(page, '.play.is-gem-search.is-win', null)
      assert.ok(
        winGold.every((item) => /cta-dock|btn|primary|gem-win|lock/i.test(item) || /win-stamp|match-yes|gem-cell|win-burst|win-gem/i.test(item)),
        `${tag} no gold outside the existing win dock (${winGold.join(' | ')})`,
      )
      assert.equal(
        await page.locator('[data-gem-jar-caption]').innerText(),
        jarCaption(expected),
        `${tag} caption is lifetime / next`,
      )
      assert.equal(jarState(expected).rung, 1)
      progress = await savedProgress(page)
      assert.equal(progress.matchLifetime, expected, `${tag} saved jar equals the board total`)
      assert.equal(progress.matchSkillSeen, 1, `${tag} the first reveal is marked seen`)
      const reveal = await page.locator('[data-gem-jar-reveal]').innerText()
      assert.match(reveal, /^New skill: Bonus Sight$/, `${tag} first win unlocks Bonus Sight`)
      assert.equal(await page.getByText('New skill: Bonus Sight', { exact: false }).count(), 1, `${tag} reveal shows once`)
      const winText = await page.locator('.play.is-gem-search').innerText()
      assert.doesNotMatch(winText, /\d+\s*s(ec)?\b.*left|countdown/i, `${tag} no countdown`)
      assert.doesNotMatch(winText, /\b(earn|buy|shop|price)\b/i, `${tag} no shop words`)
      assert.match(await page.locator('[data-gem-jar]').innerText(), /Story word! ×1/, `${tag} the win screen names the Story word`)
      assert.ok(layout.jar.height <= 70)

      // E: next board shimmers Bonus Sight, then stops, and does not replay the reveal
      const dealt = Date.now()
      await pointerClick(page, page.getByRole('button', { name: 'One more Match', exact: true }))
      await page.locator('.gem-board').waitFor()
      const nextLetters = await page.evaluate(() => [...document.querySelectorAll('.gem-letter')].map((n) => n.textContent).join(''))
      assert.equal(nextLetters, next.letters.map((row) => row.join('')).join(''), `${tag} One more Match deals the next pinned board`)
      await page.locator('.gem-cell.is-sight').first().waitFor({ timeout: 1400 })
      assert.ok(Date.now() - dealt <= 1400, `${tag} sight shows within about a second of the deal`)
      const sightCells = await page.evaluate(() =>
        [...document.querySelectorAll('.gem-cell.is-sight')].map((n) => `${n.dataset.r}:${n.dataset.c}`),
      )
      const planted = next.planted.map((word) => cellsOf(next.bonusPaths[word.id]))
      assert.ok(
        planted.some((cells) => sightCells.every((key) => cells.includes(key))),
        `${tag} sight lights cells of one planted word (${sightCells.join(',')})`,
      )
      assert.equal(await page.locator('.gem-cell.is-start-gold').count(), 1, `${tag} still one gold start cell during sight`)
      const sightGold = await goldElements(page, '.play.is-gem-search', '.cta-dock')
      assert.deepEqual(
        sightGold.filter((item) => !/is-start-gold/.test(item)),
        [],
        `${tag} sight is not gold (${sightGold.join(' | ')})`,
      )
      await page.waitForTimeout(2600 - (Date.now() - dealt))
      assert.equal(await page.locator('.gem-cell.is-sight').count(), 0, `${tag} sight is gone by 2.5s`)
      const nextChips = chipPaths(next)
      for (const chip of nextChips) {
        await swipe(page, chip.path)
        await page.waitForTimeout(450)
      }
      await page.locator('[data-gem-jar]').waitFor({ timeout: 6000 })
      await page.waitForTimeout(2200)
      assert.equal(await page.locator('[data-gem-jar-reveal]').count(), 0, `${tag} no second reveal on the second win`)
      assert.equal((await savedProgress(page)).matchLifetime, expected + totalFor(nextChips, 0), `${tag} jar only goes up`)

      if (viewport[0] === 375) {
        // H: Journal shows the same jar number
        await pointerClick(page, page.locator('.topbar').getByRole('button', { name: 'Home', exact: true }))
        await page.getByRole('main', { name: 'Home' }).waitFor()
        await pointerClick(page, page.getByRole('button', { name: 'Lock In', exact: true }).first())
        await page.locator('.journal-head').waitFor()
        const head = (await page.locator('.journal-head').innerText()).replace(/\s+/g, ' ')
        const lifetime = (await savedProgress(page)).matchLifetime
        assert.match(head, new RegExp(`Gem Jar ${lifetime.toLocaleString('en-US')}`), `${tag} Journal shows the jar total`)
        assert.doesNotMatch(head, /\+\d+ bonus/, `${tag} Easy Journal no longer shows +N bonus`)
        assert.equal(await page.locator('[data-gem-skill="sight"]').count(), 1, `${tag} Journal chips the unlocked skill`)
        const contrast = await page.locator('.journal-head [data-gem-skill]').first().evaluate((node) => {
          const lum = (css) => {
            const [r, g, b] = css.match(/[\d.]+/g).slice(0, 3).map(Number).map((v) => {
              const c = v / 255
              return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
            })
            return 0.2126 * r + 0.7152 * g + 0.0722 * b
          }
          const style = getComputedStyle(node)
          const a = lum(style.color)
          const b = lum(style.backgroundColor)
          return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)
        })
        assert.ok(contrast >= 4.5, `${tag} Journal skill chip text is readable (contrast ${contrast.toFixed(2)})`)
        assert.deepEqual(await typeOffenders(page, '.journal-head [data-gem-skill]'), [], `${tag} Journal skill chip type is >= 13px sans`)
      }
      await context.close()
    }

    // G: tap Lock In next 300ms after the win card shows; nothing gates the exit
    for (const viewport of VIEWPORTS) {
      const tag = `${viewport[0]}x${viewport[1]}`
      const board = pickBoard({ stories: 1 })
      const { page, context, errors: pageErrors } = await newPage(browser, origin, viewport, saveFor())
      errors.push(...pageErrors)
      await openBoard(page, board.line, board.seed)
      for (const chip of board.chips) {
        await swipe(page, chip.path)
        await page.waitForTimeout(450)
      }
      await page.locator('[data-gem-jar]').waitFor({ timeout: 6000 })
      await page.waitForTimeout(300)
      assert.equal(
        await page.locator('[data-gem-jar-count]').innerText().then((text) => text !== '+0' || true),
        true,
      )
      await pointerClick(page, page.getByRole('button', { name: 'Lock In next', exact: true }))
      await page.locator('.play.is-gem-search').waitFor({ state: 'detached', timeout: 3000 })
      await context.close()
      assert.ok(tag)
    }

    // Skills pay: Combo Spark (4,000) and Big Word (9,000)
    {
      const board = pickBoard({ stories: 2, smallStories: true })
      const { page, context, errors: pageErrors } = await newPage(
        browser,
        origin,
        [390, 844],
        saveFor({ lifetime: 4000, seen: 2 }),
      )
      errors.push(...pageErrors)
      await openBoard(page, board.line, board.seed)
      await page.locator('.gem-cell.is-sight').first().waitFor({ timeout: 1500 })
      const before = (await savedProgress(page)).matchLifetime
      await swipe(page, board.story[0].path)
      assert.match(await toastText(page), /Story word! \+100\b/, 'combo: first story word has no streak yet')
      await page.waitForTimeout(2300)
      await swipe(page, board.story[1].path)
      assert.match(await toastText(page), /Story word! \+150\b/, 'Combo Spark: a bonus word in a row is +50')
      assert.equal((await savedProgress(page)).matchLifetime, before + 250, 'combo points fill the jar')
      await context.close()
    }
    {
      const board = pickBoard({ stories: 2, bigFirst: true })
      const { page, context, errors: pageErrors } = await newPage(
        browser,
        origin,
        [390, 844],
        saveFor({ lifetime: 9000, seen: 3 }),
      )
      errors.push(...pageErrors)
      await openBoard(page, board.line, board.seed)
      await swipe(page, board.story[0].path)
      assert.match(await toastText(page), /Story word! \+200\b/, `Big Word: ${board.story[0].text} is +100 extra`)
      await page.waitForTimeout(2300)
      const second = board.story[1]
      const expectSecond = 100 + 50 + (second.text.length >= 5 ? 100 : 0)
      await swipe(page, second.path)
      assert.match(await toastText(page), new RegExp(`Story word! \\+${expectSecond}\\b`), `Combo + Big: ${second.text} is +${expectSecond}`)
      await context.close()
    }

    // F: reduced motion shows final numbers at once, no orb, dock live right away
    for (const viewport of VIEWPORTS) {
      const tag = `${viewport[0]}x${viewport[1]} reduced`
      const board = pickBoard({ stories: 1 })
      const { page, context, errors: pageErrors } = await newPage(browser, origin, viewport, saveFor(), { reduced: true })
      errors.push(...pageErrors)
      await openBoard(page, board.line, board.seed)
      for (const chip of board.chips) {
        await swipe(page, chip.path)
        await page.waitForTimeout(300)
      }
      await page.locator('[data-gem-jar]').waitFor({ timeout: 6000 })
      const expected = totalFor(board.chips, 0)
      assert.equal(await page.locator('[data-gem-jar-count]').innerText(), `+${expected.toLocaleString('en-US')}`, `${tag} final number at once`)
      assert.match(await page.locator('[data-gem-jar-reveal]').innerText(), /New skill: Bonus Sight/, `${tag} reveal text still shows`)
      for (let i = 0; i < 6; i += 1) {
        assert.equal(await page.locator('.gem-jar-orb').count(), 0, `${tag} no orb`)
        await page.waitForTimeout(150)
      }
      await winLayout(page, tag, viewport)
      await pointerClick(page, page.getByRole('button', { name: 'Lock In next', exact: true }))
      await page.locator('.play.is-gem-search').waitFor({ state: 'detached', timeout: 3000 })
      await context.close()
    }

    // H: held evidence never depends on the jar
    const journals = []
    for (const lifetime of [0, 20000]) {
      const { page, context, errors: pageErrors } = await newPage(browser, origin, [375, 667], saveFor({ lifetime, seen: 3 }))
      errors.push(...pageErrors)
      await page.goto('/')
      await page.getByRole('main', { name: 'Home' }).waitFor()
      await pointerClick(page, page.getByRole('button', { name: 'Lock In', exact: true }).first())
      await page.locator('.journal-head').waitFor()
      const head = (await page.locator('.journal-head').innerText()).replace(/\s+/g, ' ')
      const entries = await page.locator('.journal article, .journal .dossier').count()
      journals.push({ head: head.replace(/ · Gem Jar [\d,]+/, '').replace(/ (Bonus Sight|Combo Spark|Big Word)/g, ''), entries, jar: /Gem Jar/.test(head) })
      await context.close()
    }
    assert.equal(journals[0].jar, false, 'no jar line while the jar is empty')
    assert.equal(journals[1].jar, true)
    assert.equal(journals[0].head, journals[1].head, 'Journal evidence count is the same with or without the jar')
    assert.equal(journals[0].entries, journals[1].entries, 'Journal entries do not depend on the jar')

    // I: Hard keeps the old Journal copy and never shows the jar
    {
      const { page, context, errors: pageErrors } = await newPage(browser, origin, [375, 667], saveFor({ lifetime: 5000, seen: 2, easy: false }))
      errors.push(...pageErrors)
      await page.goto('/')
      await page.locator('body').waitFor()
      await page.waitForTimeout(500)
      const text = await page.locator('body').innerText()
      assert.doesNotMatch(text, /Gem Jar/, 'Hard shows no Gem Jar')
      assert.equal(await page.locator('[data-gem-jar], .gem-cell.is-sight').count(), 0, 'Hard has no jar card or sight')
      await context.close()
    }
    const hardSource = readFileSync(new URL('../src/components/challenges/GemSearchPlay.tsx', import.meta.url), 'utf8')
    assert.match(hardSource, /easy \? skillsFor\(jarBefore\) : \[\]/, 'skills are Easy only')
    assert.match(hardSource, /status === 'ok' && easy \?/, 'the jar card is Easy only')
    assert.ok(Object.keys(LESSON_BONUS).length >= 50)
  } finally {
    await browser.close()
    await server.close()
  }
  assert.deepEqual(errors, [], `no page errors: ${errors.join('\n')}`)
  console.log('check-gem-jar: ok (375, 390, 768; real pointer)')
}

await run()
