/**
 * Easy first session (#963): each lesson’s full Lock In at most once when the claim is kept.
 */
import assert from 'node:assert/strict'
import { chromium } from '@playwright/test'
import { createServer } from 'vite'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { APP_VERSION, STORAGE_KEY } from '../src/config/app.ts'
import { EASY_OPEN_DAY_KEY } from '../src/content/goldenPath.ts'
import { evidenceForTier } from '../src/content/evidence.ts'
import { easyHoldPractice, easyHoldView, easyFirstSessionDay, easySkipRepeatLockIn } from '../src/easyTrail/trail/loop.ts'
import { localDateKey } from '../src/lib/dates.ts'
import { easyWhyLine } from '../src/lib/easy.ts'
import { SAVE_KIND, SAVE_SCHEMA_VERSION } from '../src/lib/save.ts'
import { goldCues, probeInitSource } from './lockin843-probe.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

const FIRST_SESSION_LESSONS = ['ph-road', 'ph-father', 'ob-tuning', 'wb-creed', 'wb-women']

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
assert.equal(easySkipRepeatLockIn(skipHeld, 'ph-father', '2099-12-31'), false)
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

async function tapMazeCell(page, cell) {
  await page
    .locator(`[data-maze-cell][data-r="${cell.r}"][data-c="${cell.c}"]`)
    .click({ timeout: 8000 })
  await page.waitForTimeout(120)
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
  await page.locator('.play.is-road-maze.is-helped').waitFor({ timeout: 8000 })
  await tapMazeCell(page, hurt)
  here = hurt
  const innPath = await mazeRoadPath(page, here, inn)
  assert.ok(innPath && innPath.length >= 2, 'road path to inn')
  for (const cell of innPath.slice(1)) await tapMazeCell(page, cell)
  await page.locator('.play.is-road-maze.is-win').waitFor({ timeout: 12_000 })
  await page.locator('[data-maze-next]').waitFor({ timeout: 8000 })
}

async function passRecall(page) {
  await page.locator('.lockin-recall-show').waitFor({ timeout: 8000 })
  await page.getByRole('button', { name: 'Show me' }).click()
  await page.getByRole('button', { name: 'I had it' }).click()
}

async function finishEasyLockIn(page, id) {
  await page.locator('.lockin-recall.is-ask').waitFor({ timeout: 8000 })
  await passRecall(page)
  const brief = evidenceForTier(id, 'easy')
  assert.ok(brief, id)
  const why = easyWhyLine(brief.reason)
  await page.locator('button.why-chip', { hasText: why }).first().click()
  await page.locator('.why-blast.is-yes, .why-blast.is-win').first().waitFor({ timeout: 8000 })
  await page.locator('.recall-done').click()
  await page.locator('main[aria-label="Home"]').waitFor({ timeout: 8000 })
}

async function lockInVisible(page) {
  return page
    .locator('.lockin-recall.is-ask')
    .waitFor({ timeout: 2500 })
    .then(() => true)
    .catch(() => false)
}

async function openRoadMaze(page, { debug = false } = {}) {
  if ((await page.locator('.play.is-road-maze').count()) > 0) return
  if (debug) {
    if ((await page.locator('main[aria-label="Settings"]').count()) === 0) {
      await page.locator('header').getByRole('button', { name: 'Settings', exact: true }).click()
    }
    await page.locator('details.settings-danger > summary').click()
    await page.locator('section[aria-label="Road maze"] button', { hasText: 'ph-road' }).click({ timeout: 15_000 })
  } else {
    await page.locator('main[aria-label="Home"]').waitFor({ timeout: 8000 })
    await page.locator('.easy-home-steps > li').nth(1).locator('.easy-coach-step').click({ timeout: 8000 })
    const start = page.getByRole('button', { name: 'Start' })
    if (await start.count()) await start.click({ timeout: 8000 })
  }
  await page.locator('[data-maze-cell]').first().waitFor({ timeout: 12_000 })
}

export async function checkEasyFirstSessionLockInOnce() {
  const today = localDateKey()
  for (const id of FIRST_SESSION_LESSONS) {
    const held = {
      easyTaught: [id],
      easyHeld: [id],
      held: [id],
      lessonScore: {},
      lessonTier: {},
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
      const counts = Object.fromEntries(FIRST_SESSION_LESSONS.map((id) => [id, 0]))
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
      await openRoadMaze(page, { debug: false })
      await winRoadMaze(page)
      await page.locator('[data-maze-next]').click()
      if (await lockInVisible(page)) {
        counts['ph-road'] += 1
        await finishEasyLockIn(page, 'ph-road')
      }
      await page.locator('main[aria-label="Home"]').waitFor({ timeout: 8000 })
      await page.locator('header').getByRole('button', { name: 'Settings', exact: true }).click()
      await openRoadMaze(page, { debug: true })
      await winRoadMaze(page)
      await page.locator('[data-maze-next]').click()
      if (await lockInVisible(page)) counts['ph-road'] += 1
      await page.locator('main[aria-label="Home"]').waitFor({ timeout: 8000 })
      const golds = await page.evaluate(goldCues)
      assert.equal(golds.length, 1, `home one gold got [${golds.join(' | ')}]`)
      await context.close()
      for (const id of FIRST_SESSION_LESSONS) {
        assert.ok((counts[id] ?? 0) <= 1, `${viewport.join('x')} ${id} lock in ${counts[id]}`)
      }
      assert.equal(counts['ph-road'], 1, `${viewport.join('x')} first road win runs Lock In once`)
      console.log(
        `checkEasyFirstSessionLockInOnce ok ${viewport[0]}x${viewport[1]} counts=${JSON.stringify(counts)} gold=1`,
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