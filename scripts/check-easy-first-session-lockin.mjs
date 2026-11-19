/**
 * Easy first session (#963): Kid 8 golden path — road, run, word searches, merge, dig.
 * Each played lesson gets at most one full Lock In encode (Show me / main idea).
 */
import assert from 'node:assert/strict'
import { chromium } from '@playwright/test'
import { createServer } from 'vite'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { APP_VERSION, STORAGE_KEY } from '../src/config/app.ts'
import { EASY_OPEN_DAY_KEY } from '../src/content/goldenPath.ts'
import { evidenceForTier } from '../src/content/evidence.ts'
import {
  EASY_LINE_ORDER,
  easyHoldPractice,
  easyHoldView,
  easyFirstSessionDay,
  easyLoopLine,
  easySkipRepeatLockIn,
} from '../src/easyTrail/trail/loop.ts'
import { localDateKey } from '../src/lib/dates.ts'
import { easyWhyLine } from '../src/lib/easy.ts'
import { findStraightSpelling, gemWordsFor } from '../src/lib/gemSearch.ts'
import { needsTierHold } from '../src/lib/tiers.ts'
import { storyPlayFor } from '../src/lib/storyPlay.ts'
import { SAVE_KIND, SAVE_SCHEMA_VERSION } from '../src/lib/save.ts'
import { goldCues, probeInitSource } from './lockin843-probe.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

/** Golden path through merge + first dig (Witness women). */
const KID8_END_LINE = 'wb-women'
const KID8_END_INDEX = EASY_LINE_ORDER.indexOf(KID8_END_LINE)
assert.ok(KID8_END_INDEX >= 0, 'wb-women on golden path')
const KID8_ROUTE = EASY_LINE_ORDER.slice(0, KID8_END_INDEX + 1)

const KID8_ANCHORS = {
  road: 'ph-road',
  run: 'ph-father',
  wordA: 'ob-tuning',
  wordB: 'ph-debt',
  merge: 'wb-creed',
  dig: 'wb-women',
}

/** Main 428a83d3: after hold, needsTierHold still true with empty lessonScore → a second win replays the full encode. */
function main428a83d3WouldReplayEncode(id) {
  const afterHoldNoScore = { held: [id], easyHeld: [id], lessonScore: {}, lessonTier: {} }
  return needsTierHold(afterHoldNoScore, id)
}
assert.equal(main428a83d3WouldReplayEncode('ph-road'), true, 'main 428a83d3 replays encode when held without score')
/** Issue #963 Kid 8 first session on main 428a83d3: ~8 duplicate full Lock In screens in one sit (local repro note). */
const BEFORE_MAIN_ISSUE963_DUPES = 8
console.log(
  `checkEasyFirstSessionLockInOnce beforeMain428a83d3 kid8DuplicateFullLockIn≈${BEFORE_MAIN_ISSUE963_DUPES} (issue #963 / main 428a83d3 held+needsTierHold)`,
)

function save(progress) {
  return {
    kind: SAVE_KIND,
    schemaVersion: SAVE_SCHEMA_VERSION,
    appVersion: APP_VERSION,
    savedAt: new Date().toISOString(),
    progress: { started: true, easyMode: true, theme: 'candy', ...progress },
  }
}

assert.equal(easyFirstSessionDay('2099-12-31'), true)
const skipHeld = { held: ['ph-road'], easyHeld: ['ph-road'] }
assert.equal(easySkipRepeatLockIn(skipHeld, 'ph-road', '2099-12-31'), true)
const heldNoScore = {
  easyTaught: ['ph-road'],
  easyHeld: ['ph-road'],
  held: ['ph-road'],
  lessonScore: {},
  lessonTier: {},
}
assert.deepEqual(easyHoldView(heldNoScore, '2099-12-31', 'ph-road'), { name: 'hub' })
assert.equal(easyHoldPractice(heldNoScore, '2099-12-31'), false)

async function launch() {
  try {
    return await chromium.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] })
  } catch {
    return await chromium.launch({ channel: 'chrome', args: ['--no-sandbox', '--disable-setuid-sandbox'] })
  }
}

async function readProgress(page) {
  return page.evaluate((key) => JSON.parse(localStorage.getItem(key) || 'null')?.progress ?? null, STORAGE_KEY)
}

async function tapMazeCell(page, cell) {
  await page
    .locator(`[data-maze-cell][data-r="${cell.r}"][data-c="${cell.c}"]`)
    .click({ timeout: 8000 })
  await page.waitForTimeout(100)
}

async function mazeRoadPath(page, from, to) {
  return page.evaluate(
    ({ from, to }) => {
      const roads = new Set(
        [...document.querySelectorAll('[data-maze-cell].is-road')].map(
          (el) => `${el.getAttribute('data-r')}:${el.getAttribute('data-c')}`,
        ),
      )
      const key = (c) => `${c.r}:${c.c}`
      const dirs = [
        { r: -1, c: 0 },
        { r: 1, c: 0 },
        { r: 0, c: -1 },
        { r: 0, c: 1 },
      ]
      const queue = [[from]]
      const seen = new Set([key(from)])
      while (queue.length) {
        const path = queue.shift()
        const last = path[path.length - 1]
        if (last.r === to.r && last.c === to.c) return path
        for (const d of dirs) {
          const next = { r: last.r + d.r, c: last.c + d.c }
          const k = key(next)
          if (!roads.has(k) || seen.has(k)) continue
          seen.add(k)
          queue.push([...path, next])
        }
      }
      return null
    },
    { from, to },
  )
}

async function winRoadMaze(page) {
  let here = await page.evaluate(() => {
    const el = document.querySelector('[data-maze-cell].is-here')
    return { r: Number(el?.getAttribute('data-r')), c: Number(el?.getAttribute('data-c')) }
  })
  const hurt = await page.evaluate(() => {
    const el = document.querySelector('[data-maze-cell].is-hurt')
    return { r: Number(el?.getAttribute('data-r')), c: Number(el?.getAttribute('data-c')) }
  })
  const inn = await page.evaluate(() => {
    const el = document.querySelector('[data-maze-cell].is-inn')
    return { r: Number(el?.getAttribute('data-r')), c: Number(el?.getAttribute('data-c')) }
  })
  const hurtPath = await mazeRoadPath(page, here, hurt)
  assert.ok(hurtPath && hurtPath.length >= 2, 'road path to hurt')
  for (const cell of hurtPath.slice(1)) await tapMazeCell(page, cell)
  await page.locator('.play.is-road-maze.is-helped').waitFor({ timeout: 10_000 })
  await tapMazeCell(page, hurt)
  here = hurt
  const innPath = await mazeRoadPath(page, here, inn)
  assert.ok(innPath && innPath.length >= 2, 'road path to inn')
  for (const cell of innPath.slice(1)) await tapMazeCell(page, cell)
  await page.locator('.play.is-road-maze.is-win').waitFor({ timeout: 15_000 })
}

async function winFatherRun(page) {
  const pad = page.locator('[data-run-pad="hold"]')
  await pad.waitFor({ timeout: 15_000 })
  await pad.scrollIntoViewIfNeeded()
  const box = await pad.boundingBox()
  assert.ok(box, 'run pad box')
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
  await page.mouse.down()
  const start = Date.now()
  while (Date.now() - start < 14_000) {
    if (await page.locator('.play.is-father-run.is-win').count()) {
      await page.mouse.up().catch(() => {})
      return
    }
    if (await page.locator('.run-miss').count()) {
      await page.mouse.up().catch(() => {})
      throw new Error('father run missed')
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

async function dragGemWord(page, path) {
  const points = await page.evaluate((cells) => {
    return cells.map(({ r, c }) => {
      const el = document.querySelector(`[data-gem-cell][data-r="${r}"][data-c="${c}"]`)
      const box = el?.getBoundingClientRect()
      return box ? { x: box.left + box.width / 2, y: box.top + box.height / 2, r, c } : null
    })
  }, path)
  if (points.some((p) => !p)) throw new Error('gem cell missing for drag')
  await page.mouse.move(points[0].x, points[0].y)
  await page.mouse.down()
  for (let i = 1; i < points.length; i += 1) {
    const from = points[i - 1]
    const to = points[i]
    const diagonal = path[i].r !== path[i - 1].r && path[i].c !== path[i - 1].c
    if (diagonal) {
      await page.mouse.move(from.x + (to.x - from.x) * 0.28, from.y + (to.y - from.y) * 0.28)
      await page.mouse.move(to.x, to.y)
    } else {
      await page.mouse.move(to.x, to.y, { steps: 6 })
    }
  }
  await page.mouse.up()
}

async function winGemSearch(page, lineId) {
  await page.locator('[data-gem-cell]').first().waitFor({ timeout: 12_000 })
  const words = gemWordsFor(lineId).map((w) => w.text)
  for (const word of words) {
    if (await page.locator('.play.is-gem-search.is-win').count()) return
    let letters = await readGrid(page)
    for (let attempt = 0; attempt < 8; attempt += 1) {
      await page.waitForTimeout(40)
      const next = await readGrid(page)
      if (JSON.stringify(next) === JSON.stringify(letters)) break
      letters = next
    }
    const path = findStraightSpelling(letters, word)
    if (!path) throw new Error(`${lineId} word ${word} missing on board`)
    const foundBefore = await page.locator('.match-teach-chip.is-found').count()
    await dragGemWord(page, path)
    await page
      .waitForFunction(
        (count) =>
          document.querySelectorAll('.match-teach-chip.is-found').length > count ||
          Boolean(document.querySelector('.play.is-gem-search.is-win')),
        foundBefore,
        { timeout: 3000 },
      )
      .catch(async () => {
        await dragGemWord(page, path)
        await page.waitForFunction(
          (count) =>
            document.querySelectorAll('.match-teach-chip.is-found').length > count ||
            Boolean(document.querySelector('.play.is-gem-search.is-win')),
          foundBefore,
          { timeout: 3000 },
        )
      })
  }
  await page.locator('.play.is-gem-search.is-win').waitFor({ timeout: 10_000 })
}

async function winClaimMerge(page) {
  const bowl = page.locator('.play.is-claim-merge .merge-bowl')
  await bowl.waitFor({ timeout: 12_000 })
  await bowl.focus()
  for (let i = 0; i < 320; i += 1) {
    if (await page.locator('.play.is-claim-merge.is-win').count()) break
    await page.keyboard.press(' ')
    await page.waitForTimeout(90)
  }
  await page.locator('.play.is-claim-merge.is-win').waitFor({ timeout: 5000 })
}

async function winSourceDig(page) {
  const tablets = page.locator('[data-dig-tablet]')
  await tablets.first().waitFor({ timeout: 12_000 })
  const n = await tablets.count()
  for (let i = 0; i < n; i += 1) {
    const el = tablets.nth(i)
    if (!(await el.isVisible())) continue
    const box = await el.boundingBox()
    if (!box) continue
    const cx = box.x + box.width / 2
    const cy = box.y + box.height / 2
    await page.mouse.move(cx, cy)
    await page.mouse.down()
    for (let s = 0; s < 24; s += 1) await page.mouse.move(cx + s * 5, cy, { steps: 1 })
    await page.mouse.up()
    await page.waitForTimeout(80)
    if (await page.locator('.play.is-source-dig.is-win').count()) return
  }
  await page.locator('.play.is-source-dig.is-win').waitFor({ timeout: 15_000 })
}

async function winPlay(page, lineId) {
  const kind = storyPlayFor(lineId)
  if (kind === 'road-maze') await winRoadMaze(page)
  else if (kind === 'father-run') await winFatherRun(page)
  else if (kind === 'panel-blast') await winGemSearch(page, lineId)
  else if (kind === 'claim-merge') await winClaimMerge(page)
  else if (kind === 'source-dig') await winSourceDig(page)
  else throw new Error(`Kid 8 route does not automate ${kind} for ${lineId}`)
}

async function tapLockInNext(page) {
  const winDock = page.locator(
    '.play.is-win .cta-dock .btn.primary, [data-maze-next], .play.is-father-run.is-win .btn.primary, .play.is-gem-search.is-win .btn.primary, .play.is-claim-merge.is-win .btn.primary, .play.is-source-dig.is-win .btn.primary',
  )
  await winDock.first().waitFor({ timeout: 10_000 })
  await winDock.first().click()
}

async function passRecall(page) {
  await page.locator('.lockin-recall-show').waitFor({ timeout: 8000 })
  await page.getByRole('button', { name: 'Show me' }).click()
  await page.getByRole('button', { name: 'I had it' }).click()
}

async function finishEasyLockIn(page, id) {
  await page.locator('.lockin-recall.is-ask').waitFor({ timeout: 8000 })
  const prompt = (await page.locator('.lockin-recall-prompt').innerText()).trim()
  assert.match(prompt, /main idea/i, 'encode screen asks for main idea')
  await passRecall(page)
  const brief = evidenceForTier(id, 'easy')
  assert.ok(brief, id)
  const why = easyWhyLine(brief.reason)
  await page.locator('button.why-chip', { hasText: why }).first().click()
  await page.locator('.why-blast.is-yes, .why-blast.is-win').first().waitFor({ timeout: 8000 })
  await page.locator('.recall-done').click()
  await page.locator('main[aria-label="Home"]').waitFor({ timeout: 12_000 })
}

async function isFullEncode(page) {
  if ((await page.locator('.lockin-recall.is-ask').count()) === 0) return false
  const prompt = (await page.locator('.lockin-recall-prompt').innerText().catch(() => '')).trim()
  return /main idea/i.test(prompt)
}

async function openMatchFromHub(page) {
  await page.locator('main[aria-label="Home"]').waitFor({ timeout: 12_000 })
  await page.locator('.easy-home-steps > li:nth-child(2) .easy-coach-step').click({ timeout: 8000 })
  const start = page.getByRole('button', { name: 'Start' })
  if (await start.count()) await start.click({ timeout: 8000 })
}

async function playLessonBeat(page, lineId, counts) {
  await openMatchFromHub(page)
  await winPlay(page, lineId)
  await tapLockInNext(page)
  await page.waitForTimeout(350)
  if (await isFullEncode(page)) {
    counts[lineId] = (counts[lineId] ?? 0) + 1
    await finishEasyLockIn(page, lineId)
  } else {
    await page.locator('main[aria-label="Home"]').waitFor({ timeout: 10_000 })
  }
}

async function driveKid8Session(page) {
  const counts = {}
  const played = []
  let guard = 0
  while (guard++ < KID8_ROUTE.length + 2) {
    const progress = await readProgress(page)
    assert.ok(progress, 'save progress')
    const held = progress.easyHeld ?? []
    if (held.includes(KID8_END_LINE) && played.includes(KID8_END_LINE)) break
    const lineId = easyLoopLine(progress)
    assert.ok(KID8_ROUTE.includes(lineId), `golden path line ${lineId}`)
    assert.ok(!played.includes(lineId), `did not replay lesson ${lineId} before holding`)
    played.push(lineId)
    await playLessonBeat(page, lineId, counts)
  }
  assert.ok((await readProgress(page))?.easyHeld?.includes(KID8_END_LINE), 'dig lesson held')
  return { played, counts }
}

export async function checkEasyFirstSessionLockInOnce() {
  const today = localDateKey()
  for (const id of KID8_ROUTE) {
    const held = {
      easyTaught: [id],
      easyHeld: [id],
      held: [id],
      lessonScore: { [id]: 10 },
      lessonTier: { [id]: 'easy' },
    }
    assert.deepEqual(easyHoldView(held, today, id), { name: 'hub' }, `${id} skips repeat hold view`)
    assert.equal(easyHoldPractice(held, today), false, `${id} skips repeat hold practice`)
  }

  const server = await createServer({ root, server: { host: '127.0.0.1', port: 0 }, logLevel: 'error' })
  await server.listen()
  const address = server.httpServer?.address()
  const port = address && typeof address === 'object' ? address.port : 0
  assert.ok(port > 0)
  const origin = `http://127.0.0.1:${port}`
  const browser = await launch()
  const VIEWPORTS = [
    [375, 667],
    [390, 844],
    [412, 915],
  ]
  try {
    for (const viewport of VIEWPORTS) {
      const context = await browser.newContext({ viewport: { width: viewport[0], height: viewport[1] } })
      await context.addInitScript(probeInitSource())
      await context.addInitScript(
        ({ key, raw, openKey, day }) => {
          localStorage.setItem(key, raw)
          localStorage.setItem(openKey, day)
        },
        {
          key: STORAGE_KEY,
          raw: JSON.stringify(save({})),
          openKey: EASY_OPEN_DAY_KEY,
          day: today,
        },
      )
      const page = await context.newPage()
      await page.goto(`${origin}/?playtest=1`, { waitUntil: 'networkidle' })
      const startEasy = page.getByRole('button', { name: 'Start Easy' })
      if (await startEasy.count()) await startEasy.click()
      await page.locator('header').getByRole('button', { name: 'Settings', exact: true }).waitFor({ timeout: 30_000 })

      const { played, counts } = await driveKid8Session(page)

      for (const key of Object.keys(KID8_ANCHORS)) {
        const id = KID8_ANCHORS[key]
        assert.ok(played.includes(id), `Kid 8 anchor ${key} (${id}) was played`)
      }
      for (const id of played) {
        assert.equal(counts[id] ?? 0, 1, `${viewport.join('x')} ${id} full encode count`)
      }
      const total = played.reduce((sum, id) => sum + (counts[id] ?? 0), 0)
      assert.equal(total, played.length, 'total encodes equals lessons played')

      await page.locator('main[aria-label="Home"]').waitFor({ timeout: 8000 })
      const golds = await page.evaluate(goldCues)
      assert.equal(golds.length, 1, `home one gold got [${golds.join(' | ')}]`)

      await context.close()
      console.log(
        `checkEasyFirstSessionLockInOnce ok ${viewport[0]}x${viewport[1]} played=[${played.join(',')}] counts=${JSON.stringify(counts)} total=${total} beforeMain≈${BEFORE_MAIN_ISSUE963_DUPES} gold=1`,
      )
    }
  } finally {
    await browser.close()
    await server.close()
  }
  console.log('check-easy-first-session-lockin: ok')
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  await checkEasyFirstSessionLockInOnce()
}