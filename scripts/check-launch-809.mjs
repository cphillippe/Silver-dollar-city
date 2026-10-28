#!/usr/bin/env node
/**
 * Launch P1 #809. Real pointer only. 375×667 unless a step says otherwise.
 * Picture match, day-1 Read pill, who · place, word-search bonus, web refresh.
 */
import assert from 'node:assert/strict'
import { createServer } from 'node:http'
import { mkdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { chromium } from 'playwright'
import { build, preview } from 'vite'
import { DAILY_POOL } from '../src/content/daily.ts'
import {
  claimAutoReload,
  safeWebScreen,
  webRefreshAction,
  webRefreshSurface,
  waitForFreshWorker,
} from '../src/lib/webRefresh.ts'
import { assertMainEasyTypeBaselines } from './check-type-floor-baseline.mjs'

const shotDir = join(tmpdir(), 'silver-city-871-shots')
mkdirSync(shotDir, { recursive: true })

const DEV_MARKERS = [
  'Developer · mini-game jumps',
  'Night Watch · debug freeze',
  'this-device hide for playtest',
  'Behind the scenes',
  'Refs:',
]

async function assertNoDevCopy(page, label) {
  const hay = await page.evaluate(
    () =>
      `${document.body.textContent || ''} ${[...document.querySelectorAll('*')]
        .flatMap((el) => [...el.attributes].map((a) => a.value))
        .join(' ')}`,
  )
  const a2 = [
    [/Developer · mini-game jumps/, 'Developer · mini-game jumps'],
    [/\bDebug\b/, 'Debug'],
    [/Night Watch · debug freeze/, 'Night Watch · debug freeze'],
    [/debug freeze/i, 'debug freeze'],
    [/Jump · Night Watch/, 'Jump · Night Watch'],
    [/Playtest only/, 'Playtest only'],
    [/this-device hide for playtest/, 'playtest-hide copy'],
    [/Behind the scenes/, 'Behind the scenes'],
    [/\bRefs\b/, 'Refs'],
  ]
  for (const [re, name] of a2) {
    assert.ok(!re.test(hay), `#871 ${label} hay lacks ${name}`)
  }
  const html = await page.evaluate(() => document.body.innerHTML)
  for (const marker of DEV_MARKERS) {
    assert.ok(!html.includes(marker), `#871 ${label} innerHTML lacks ${marker}`)
  }
  assert.equal(await page.locator('details.settings-debug').count(), 0, `#871 ${label} no debug details`)
  const whatsNew = await page.evaluate(
    () => document.querySelector('.settings-card.whats-new')?.textContent ?? '',
  )
  assert.doesNotMatch(whatsNew, /\bRefs\b/, `#871 ${label} What's new has no Refs lines`)
}

async function visibleTinyType(page, scope = 'body') {
  return page.evaluate((scope) => {
    const roots =
      scope === 'body'
        ? [document.body]
        : scope.split(',').flatMap((part) => {
            const sel = part.trim()
            if (!sel) return []
            const nodes = [...document.querySelectorAll(sel)]
            return nodes.length ? nodes : [`missing root: ${sel}`]
          })
    if (roots.some((root) => typeof root === 'string')) return roots.filter((root) => typeof root === 'string')
    const bad = []
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
    let node
    while ((node = walker.nextNode())) {
      const raw = (node.textContent || '').replace(/\s+/g, ' ').trim()
      if (!raw) continue
      const el = node.parentElement
      if (!el || !roots.some((root) => root.contains(el))) continue
      if (el.closest('svg')) continue
      if (typeof el.checkVisibility === 'function' && !el.checkVisibility()) continue
      const style = getComputedStyle(el)
      if (style.display === 'none' || style.visibility === 'hidden' || Number(style.opacity) === 0) continue
      const elBox = el.getBoundingClientRect()
      if (elBox.width <= 0 || elBox.height <= 0) continue
      const range = document.createRange()
      range.selectNodeContents(node)
      for (const rect of range.getClientRects()) {
        if (rect.width <= 0 || rect.height <= 0) continue
        const px = parseFloat(style.fontSize)
        if (px + 0.05 < 13) {
          bad.push(`${raw.slice(0, 48)} (${px}px)`)
          break
        }
      }
    }
    return bad
  }, scope)
}

async function assertEasyTypeFloor(page, label, scope = 'body') {
  const bad = await visibleTinyType(page, scope)
  assert.deepEqual(bad, [], `#871 ${label} visible type >= 13px: ${bad.join('; ')}`)
}

const gems = DAILY_POOL.find((item) => item.challenge.id === 'daily-gems')
assert.ok(gems && gems.challenge.kind === 'match')
const gemLines = new Map(gems.challenge.pairs.map((pair) => [pair.id, pair.right]))

assert.equal(webRefreshSurface({ play: true, androidShell: false, native: false }), 'off')
assert.equal(webRefreshSurface({ play: false, androidShell: true, native: false }), 'off')
assert.equal(webRefreshSurface({ play: false, androidShell: false, native: true }), 'off')
assert.equal(webRefreshSurface({ play: false, androidShell: false, native: false }), 'web')
assert.equal(safeWebScreen('welcome'), true)
assert.equal(safeWebScreen('hub'), true)
assert.equal(safeWebScreen('settings'), true)
assert.equal(safeWebScreen('daily'), false)
assert.equal(safeWebScreen('link'), false)
assert.equal(webRefreshAction({ surface: 'web', safe: true, updateReady: true }), 'reload')
assert.equal(webRefreshAction({ surface: 'web', safe: false, updateReady: true }), 'prompt')
assert.equal(webRefreshAction({ surface: 'off', safe: true, updateReady: true }), 'none')
assert.equal(webRefreshAction({ surface: 'web', safe: true, updateReady: false }), 'none')
const fakeWorkers = (fireAfterMs) => {
  const listeners = new Set()
  const sw = {
    controller: {},
    addEventListener: (_type, fn) => listeners.add(fn),
    removeEventListener: (_type, fn) => listeners.delete(fn),
  }
  if (fireAfterMs != null) setTimeout(() => [...listeners].forEach((fn) => fn(new Event('controllerchange'))), fireAfterMs)
  return sw
}
const installing = { waiting: null, installing: {}, active: {} }
assert.equal(await waitForFreshWorker(fakeWorkers(20), installing, 2000), true, 'controllerchange means the new build is live')
assert.equal(await waitForFreshWorker(fakeWorkers(null), installing, 50), false, 'no takeover times out to the prompt')
assert.equal(await waitForFreshWorker(undefined, undefined, 50), true, 'no worker means nothing to wait for')
const swSrc = readFileSync(new URL('../src/components/WebBuildRefresh.tsx', import.meta.url), 'utf8')
assert.match(swSrc, /detail\?\.fresh !== false/, 'a stale worker shows the prompt instead of reloading')
const memory = new Map()
const storage = {
  getItem: (key) => memory.get(key) ?? null,
  setItem: (key, value) => memory.set(key, value),
}
assert.equal(claimAutoReload('1.4.520', storage), true)
assert.equal(claimAutoReload('1.4.520', storage), false)
const viteSrc = readFileSync(new URL('../vite.config.ts', import.meta.url), 'utf8')
assert.match(viteSrc, /skipWaiting:\s*true/)
assert.match(viteSrc, /clientsClaim:\s*true/)
const mainSrc = readFileSync(new URL('../src/main.tsx', import.meta.url), 'utf8')
assert.match(mainSrc, /webRefreshSurface/)
assert.match(mainSrc, /unregister\(\)/)

const outDir = 'dist-launch'
await build({ logLevel: 'warn', build: { outDir, emptyOutDir: true } })
const server = await preview({
  preview: { host: '127.0.0.1', port: 0 },
  build: { outDir },
  logLevel: 'warn',
})
const address = server.httpServer?.address()
const port = typeof address === 'object' && address ? address.port : 4173
const origin = `http://127.0.0.1:${port}`

async function launchBrowser() {
  try {
    return await chromium.launch({ headless: true })
  } catch {
    return await chromium.launch({ headless: true, channel: 'chrome' })
  }
}

async function pointerClick(page, locator) {
  const box = await locator.boundingBox()
  assert.ok(box, 'pointer target has no box')
  const x = box.x + box.width / 2
  const y = box.y + box.height / 2
  await page.mouse.move(x, y)
  await page.mouse.down()
  await page.mouse.up()
}

async function inView(page, locator, label) {
  const box = await locator.boundingBox()
  assert.ok(box && box.height > 2 && box.width > 2, `${label} has no box`)
  const view = page.viewportSize()
  assert.ok(view, 'viewport missing')
  assert.ok(box.y >= -1, `${label} top ${box.y}`)
  assert.ok(box.x >= -1, `${label} left ${box.x}`)
  assert.ok(box.y + box.height <= view.height + 1, `${label} bottom ${box.y + box.height} > ${view.height}`)
  assert.ok(box.x + box.width <= view.width + 1, `${label} right ${box.x + box.width}`)
  const shown = await locator.evaluate((node) => {
    const style = getComputedStyle(node)
    return style.display !== 'none' && style.visibility !== 'hidden' && Number(style.opacity) > 0
  })
  assert.equal(shown, true, `${label} is hidden`)
  return box
}

function seedEasy(page) {
  return page.addInitScript(() => {
    const now = new Date()
    const today = [
      now.getFullYear(),
      String(now.getMonth() + 1).padStart(2, '0'),
      String(now.getDate()).padStart(2, '0'),
    ].join('-')
    localStorage.clear()
    localStorage.setItem(
      'silver-city-progress-v1',
      JSON.stringify({
        kind: 'silver-city-save',
        schemaVersion: 1,
        appVersion: '1.4.520',
        savedAt: new Date().toISOString(),
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
      }),
    )
  })
}

async function openGems(page) {
  await page.goto(`${origin}/?sequence=daily-gems`)
  await page.getByRole('button', { name: 'Find the gems' }).waitFor()
  await pointerClick(page, page.getByRole('button', { name: 'Find the gems' }))
  await page.locator('[data-match-picture]').waitFor()
  await page.waitForFunction(() => !document.querySelector('.is-arming'))
  const how = await page.locator('.sort-how').evaluate((node) => (node.textContent || '').trim())
  assert.equal(how, 'Drag the picture to the line that matches it.')
}

async function currentPair(page) {
  const picture = page.locator('[data-match-picture]').first()
  await picture.waitFor()
  await page.waitForFunction(() =>
    document.querySelector('[data-match-picture]')?.classList.contains('is-selected'),
  )
  const id = await picture.getAttribute('data-match-picture')
  assert.ok(id && gemLines.has(id), `unknown picture ${id}`)
  const line = page.locator(`[data-match-line="${id}"]`)
  await line.waitFor()
  const text = (await line.innerText()).replace(/\s+/g, ' ').trim()
  assert.equal(text, gemLines.get(id))
  const selected = await picture.evaluate((node) => node.classList.contains('is-selected'))
  assert.equal(selected, true, 'fresh picture is not selected')
  return { id, picture, line }
}

const browser = await launchBrowser()

try {
  const match = await browser.newPage({ viewport: { width: 375, height: 667 } })
  await seedEasy(match)
  await openGems(match)
  const seen = []

  const first = await currentPair(match)
  await pointerClick(match, first.line)
  await match.waitForFunction(() => /1 of 3 matched/.test(document.querySelector('.match-score')?.textContent || ''))
  seen.push(first.id)

  const second = await currentPair(match)
  await pointerClick(match, second.picture)
  const still = await second.picture.evaluate((node) => node.classList.contains('is-selected'))
  assert.equal(still, true, 'tap on the selected picture stranded the board')
  assert.equal(await match.locator('[data-match-line]').count(), 2)
  await pointerClick(match, second.line)
  seen.push(second.id)

  const third = await currentPair(match)
  const from = await third.picture.boundingBox()
  const to = await third.line.boundingBox()
  assert.ok(from && to)
  await match.mouse.move(from.x + from.width / 2, from.y + from.height / 2)
  await match.mouse.down()
  await match.mouse.move(to.x + to.width / 2, to.y + to.height / 2, { steps: 12 })
  await match.mouse.up()
  await match.locator('.play.is-match.is-win').waitFor({ timeout: 4000 })
  seen.push(third.id)
  assert.equal(new Set(seen).size, 3, `pairs ${seen.join(',')}`)
  const score = await match.locator('.match-score').evaluate((node) => node.textContent || '')
  assert.match(score, /3 of 3 matched/)
  await match.screenshot({ path: join(shotDir, 'launch-809-match-375.png') })

  const drag = await browser.newPage({ viewport: { width: 375, height: 667 } })
  await seedEasy(drag)
  await openGems(drag)
  const fresh = await currentPair(drag)
  const start = await fresh.picture.boundingBox()
  const end = await fresh.line.boundingBox()
  assert.ok(start && end)
  await drag.mouse.move(start.x + start.width / 2, start.y + start.height / 2)
  await drag.mouse.down()
  await drag.mouse.move(end.x + end.width / 2, end.y + end.height / 2, { steps: 12 })
  await drag.mouse.up()
  await drag.waitForFunction(() => /1 of 3 matched/.test(document.querySelector('.match-score')?.textContent || ''))

  const home = await browser.newPage({ viewport: { width: 375, height: 667 } })
  await home.goto(`${origin}/`)
  await home.locator('.welcome').waitFor()
  await pointerClick(home, home.getByRole('button', { name: 'Start Easy' }))
  await home.getByRole('main', { name: 'Home' }).waitFor()
  const read = home.locator('li.is-tomorrow').filter({ hasText: 'Read' })
  const readButton = read.getByRole('button')
  assert.equal(await readButton.isDisabled(), true)
  assert.match(await read.innerText(), /tomorrow/)
  await pointerClick(home, readButton)
  await home.waitForTimeout(200)
  assert.equal(await home.getByRole('main', { name: 'Home' }).count(), 1)
  assert.equal(await home.locator('.daily-page').count(), 0)
  assert.equal(await home.locator('ol.easy-home-steps li.is-now').count(), 1)

  for (const viewport of [
    { width: 375, height: 667 },
    { width: 390, height: 844 },
  ]) {
    const audit = await browser.newPage({ viewport })
    await audit.goto(`${origin}/`)
    await audit.locator('.welcome').waitFor()
    await pointerClick(audit, audit.getByRole('button', { name: 'Start Easy' }))
    await audit.getByRole('main', { name: 'Home' }).waitFor()
    await assertEasyTypeFloor(audit, `Home ${viewport.width}`, 'main.hub.is-easy-home')
    const settingsBtn = audit.getByRole('button', { name: 'Settings', exact: true })
    await settingsBtn.scrollIntoViewIfNeeded()
    await pointerClick(audit, settingsBtn)
    await audit.locator('main.settings').waitFor()
    await assertNoDevCopy(audit, `Settings ${viewport.width}`)
    await assertEasyTypeFloor(audit, `Settings ${viewport.width}`, 'main.settings')
    await audit.evaluate(() => {
      const details = document.querySelector('details.settings-advanced')
      if (details instanceof HTMLDetailsElement) details.open = true
    })
    await assertNoDevCopy(audit, `Settings More open ${viewport.width}`)
    if (viewport.width === 375) {
      await audit.screenshot({ path: join(shotDir, '871-settings-no-flag-375x667.png') })
      await audit.locator('.settings-card.whats-new').scrollIntoViewIfNeeded()
      await audit.screenshot({ path: join(shotDir, '871-whats-new-no-flag-375x667.png') })
    }
    await audit.close()

    const page = await browser.newPage({ viewport })
    await page.goto(`${origin}/`)
    await page.locator('.welcome').waitFor()
    await pointerClick(page, page.getByRole('button', { name: 'Start Easy' }))
    await page.getByRole('main', { name: 'Home' }).waitFor()
    const help = page.locator('li.is-now').getByRole('button', { name: 'Help' })
    await pointerClick(page, help)
    await page.locator('.play.is-road-maze').waitFor()
    const kicker = page.locator('.play.is-road-maze .story-kicker')
    const kickerText = await kicker.evaluate((node) => (node.textContent || '').replace(/\s+/g, ' ').trim())
    assert.match(kickerText, /Mercy · Story Creek/)
    await inView(page, kicker, `L1 kicker ${viewport.width}`)
    await inView(page, page.locator('.maze-board'), `L1 board ${viewport.width}`)
    await assertEasyTypeFloor(page, `L1 maze ${viewport.width}`, '.play.is-road-maze')
    await walkMaze(page)
    await page.locator('[data-maze-next]').waitFor({ timeout: 8000 })
    await inView(page, kicker, `L1 kicker after win ${viewport.width}`)
    await inView(page, page.locator('[data-maze-next]'), `L1 gold ${viewport.width}`)
    if (viewport.width === 375) {
      await page.screenshot({ path: join(shotDir, 'launch-809-who-375.png') })
    }
    await page.goto(`${origin}/?playtest=1`)
    await page.getByRole('main', { name: 'Home' }).waitFor()
    const settings = page.getByRole('button', { name: 'Settings', exact: true })
    await settings.scrollIntoViewIfNeeded()
    await pointerClick(page, settings)
    await page.locator('details.settings-debug').waitFor()
    const summary = page.locator('details.settings-debug summary')
    await summary.scrollIntoViewIfNeeded()
    await pointerClick(page, summary)
    const fatherJump = page.getByRole('button', { name: /^ph-father ·/ })
    await fatherJump.scrollIntoViewIfNeeded()
    await pointerClick(page, fatherJump)
    await page.locator('.play.is-father-run').waitFor()
    const fatherKicker = page.locator('.play.is-father-run .story-kicker')
    const fatherText = await fatherKicker.evaluate((node) => (node.textContent || '').replace(/\s+/g, ' ').trim())
    assert.match(fatherText, /Mercy · Story Creek/)
    await inView(page, fatherKicker, `L2 kicker ${viewport.width}`)
    if (viewport.width === 375 && viewport.height === 667) {
      await assertMainEasyTypeBaselines(page, 'L2 father 375×667')
    }
    await assertEasyTypeFloor(
      page,
      `L2 father ${viewport.width}`,
      '.play.is-father-run .story-kicker, .play.is-father-run .story-caption, .play.is-father-run .run-speech, .play.is-father-run .match-score, .play.is-father-run .run-pad',
    )
    await inView(page, page.locator('.play.is-father-run .run-scene'), `L2 scene ${viewport.width}`)
    await inView(page, page.locator('[data-run-pad="hold"]'), `L2 pad ${viewport.width}`)
    await hugFather(page)
    await page.locator('.play.is-father-run.is-win').getByRole('button', { name: 'Lock In next' }).waitFor({ timeout: 8000 })
    await inView(page, fatherKicker, `L2 kicker after hug ${viewport.width}`)
    await inView(
      page,
      page.locator('.play.is-father-run.is-win').getByRole('button', { name: 'Lock In next' }),
      `L2 gold ${viewport.width}`,
    )
    await pointerClick(
      page,
      page.locator('.play.is-father-run.is-win').getByRole('button', { name: 'Lock In next' }),
    )
    await page.locator('.recall-gate.is-easy-hold').waitFor()
    await assertEasyTypeFloor(page, `Lock In ${viewport.width}`, '.recall-gate.is-easy-hold')
    await page.close()
  }

  const playtestSettings = await browser.newPage({ viewport: { width: 375, height: 667 } })
  await playtestSettings.goto(`${origin}/?playtest=1`)
  await playtestSettings.locator('.welcome').waitFor()
  await pointerClick(playtestSettings, playtestSettings.getByRole('button', { name: 'Start Easy' }))
  await playtestSettings.getByRole('main', { name: 'Home' }).waitFor()
  await pointerClick(playtestSettings, playtestSettings.getByRole('button', { name: 'Settings', exact: true }))
  await playtestSettings.locator('details.settings-debug summary').waitFor()
  assert.ok(
    (await playtestSettings.locator('details.settings-debug').count()) >= 1,
    '#871 playtest=1 keeps the dev section in the DOM',
  )
  await playtestSettings.screenshot({ path: join(shotDir, '871-settings-playtest-375x667.png') })
  await playtestSettings.close()

  const homeShot = await browser.newPage({ viewport: { width: 375, height: 667 } })
  await homeShot.goto(`${origin}/`)
  await homeShot.locator('.welcome').waitFor()
  await pointerClick(homeShot, homeShot.getByRole('button', { name: 'Start Easy' }))
  await homeShot.getByRole('main', { name: 'Home' }).waitFor()
  await homeShot.screenshot({ path: join(shotDir, '871-home-375x667.png') })
  await homeShot.close()

  const words = await browser.newPage({ viewport: { width: 375, height: 667 } })
  await words.goto(`${origin}/?playtest=1`)
  await words.locator('.welcome').waitFor()
  await pointerClick(words, words.getByRole('button', { name: 'Start Easy' }))
  await words.getByRole('main', { name: 'Home' }).waitFor()
  const wordSettings = words.getByRole('button', { name: 'Settings', exact: true })
  await wordSettings.scrollIntoViewIfNeeded()
  await pointerClick(words, wordSettings)
  const wordSummary = words.locator('details.settings-debug summary')
  await wordSummary.scrollIntoViewIfNeeded()
  await pointerClick(words, wordSummary)
  const tuning = words.getByRole('button', { name: /^ob-tuning ·/ })
  await tuning.scrollIntoViewIfNeeded()
  await pointerClick(words, tuning)
  await words.locator('.gem-board').waitFor()
  await assertMainEasyTypeBaselines(words, 'L3 word search 375×667')
  await assertEasyTypeFloor(
    words,
    'L3 word search 375',
    '.play.is-gem-search .match-teach-dock, .play.is-gem-search .match-score, .play.is-gem-search .sort-how, .play.is-gem-search .loci-stamp.is-dock, .play.is-gem-search .gem-hint-slot',
  )
  await words.screenshot({ path: join(shotDir, '871-l3-word-search-375x667.png') })
  const grid = await readGrid(words)
  const path = findWord(grid, 'LARK')
  assert.ok(path, 'LARK is not on the board')
  await dragCells(words, path)
  await words.locator('.bonus-pts').waitFor({ timeout: 4000 })
  const bonus = await words.locator('.bonus-pts').innerText()
  const award = Number(bonus.match(/\+(\d+)/)?.[1])
  assert.equal(award, Math.max(25, 'LARK'.length * 10))
  assert.ok(award < 500, `bonus looks like a running total ${bonus}`)
  assert.doesNotMatch(await words.locator('.match-score').innerText(), /\+1\d{3}/)
  const stray = grid[0][0] === 'L' ? { r: 0, c: 1 } : { r: 0, c: 0 }
  const strayBox = await words.locator(`[data-gem-cell][data-r="${stray.r}"][data-c="${stray.c}"]`).boundingBox()
  assert.ok(strayBox)
  await words.mouse.move(strayBox.x + strayBox.width / 2, strayBox.y + strayBox.height / 2)
  await words.mouse.down()
  await words.mouse.move(8, 8, { steps: 6 })
  await words.mouse.up()
  await words.waitForTimeout(500)
  assert.equal(await words.locator('.gem-cell.is-sel').count(), 0, 'off-board drag left a highlight')
  await words.screenshot({ path: join(shotDir, 'launch-809-bonus-375.png') })

  await proveStaleBuild(browser)

  const shellContext = await browser.newContext()
  const shell = await shellContext.newPage({ viewport: { width: 375, height: 667 } })
  const publishedShellCode = JSON.parse(
    readFileSync(new URL('../public/shell.json', import.meta.url), 'utf8'),
  ).versionCode
  await shell.addInitScript((code) => {
    window.SilverCityShell = { getVersionCode: () => code }
  }, publishedShellCode)
  let shellLoads = 0
  shell.on('load', () => {
    shellLoads += 1
  })
  await shell.goto(`${origin}/`)
  await shell.locator('.welcome').waitFor()
  const loadsAtWelcome = shellLoads
  await shell.evaluate(() => {
    window.dispatchEvent(new CustomEvent('silver-city-web-update', { detail: { version: '9.9.9' } }))
  })
  await shell.waitForTimeout(300)
  assert.equal(await shell.locator('[data-web-refresh]').count(), 0)
  assert.equal(await shell.getByText('Update available').count(), 0)
  assert.equal(shellLoads, loadsAtWelcome)

  const lesson = await browser.newPage({ viewport: { width: 375, height: 667 } })
  await seedEasy(lesson)
  await openGems(lesson)
  const loadsBefore = await lesson.evaluate(() => performance.getEntriesByType('navigation').length)
  await lesson.evaluate(() => {
    window.dispatchEvent(new CustomEvent('silver-city-web-update', { detail: { version: '9.9.9' } }))
  })
  await lesson.locator('[data-web-refresh]').waitFor()
  assert.equal(await lesson.getByText('Update available').count(), 1)
  assert.equal(await lesson.getByRole('button', { name: 'Get the update' }).count(), 1)
  assert.equal(await lesson.getByRole('button', { name: 'Not now' }).count(), 1)
  await lesson.waitForTimeout(250)
  assert.equal(await lesson.locator('[data-match-picture]').count(), 1, 'refresh reloaded mid-lesson')
  assert.equal(await lesson.evaluate(() => performance.getEntriesByType('navigation').length), loadsBefore)
  await pointerClick(lesson, lesson.getByRole('button', { name: 'Not now' }))
  await lesson.locator('[data-web-refresh]').waitFor({ state: 'hidden' })

  const welcome = await browser.newPage({ viewport: { width: 375, height: 667 } })
  await welcome.goto(`${origin}/`)
  await welcome.locator('.welcome').waitFor()
  const reloaded = welcome.waitForEvent('load', { timeout: 4000 })
  await welcome.evaluate(() => {
    window.dispatchEvent(new CustomEvent('silver-city-web-update', { detail: { version: '9.9.9' } }))
  })
  await reloaded
  await welcome.locator('.welcome').waitFor()
  assert.equal(await welcome.evaluate(() => sessionStorage.getItem('silver-city-web-refresh')), '9.9.9')
} finally {
  await browser.close()
  await server.close()
}

console.log('check-launch-809: ok')

function key(cell) {
  return `${cell.r},${cell.c}`
}

function shortest(from, to, open) {
  if (key(from) === key(to)) return [from]
  const queue = [from]
  const prev = new Map([[key(from), null]])
  const dirs = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ]
  while (queue.length) {
    const at = queue.shift()
    for (const [dr, dc] of dirs) {
      const next = { r: at.r + dr, c: at.c + dc }
      const id = key(next)
      if (!open.has(id) || prev.has(id)) continue
      prev.set(id, at)
      if (id === key(to)) {
        const path = [next]
        let cursor = at
        while (cursor) {
          path.push(cursor)
          cursor = prev.get(key(cursor))
        }
        return path.reverse()
      }
      queue.push(next)
    }
  }
  return null
}

async function readCell(locator) {
  const r = Number(await locator.getAttribute('data-r'))
  const c = Number(await locator.getAttribute('data-c'))
  return { r, c }
}

async function walkMaze(page) {
  const board = page.locator('.maze-board')
  await board.waitFor()
  const roads = page.locator('[data-maze-cell].is-road')
  const count = await roads.count()
  const here = await readCell(page.locator('[data-maze-cell].is-here'))
  for (let index = 0; index < count; index += 1) {
    const cell = await readCell(roads.nth(index))
    if (cell.r === here.r && cell.c === here.c) continue
    await pointerClick(page, roads.nth(index))
    break
  }
  await page.waitForTimeout(50)
  const hurt = await readCell(page.locator('[data-maze-cell].is-hurt'))
  const inn = await readCell(page.locator('[data-maze-cell].is-inn'))
  await walkUntil(page, hurt)
  await page.locator('.play.is-road-maze.is-found').waitFor()
  await page.evaluate(() => {
    const hurt = document.querySelector('[data-maze-cell].is-hurt')
    if (!hurt) return
    hurt.classList.add('is-help-cue')
    if (!hurt.querySelector('.maze-cell-label')) {
      const span = document.createElement('span')
      span.className = 'maze-cell-label'
      span.textContent = 'Help'
      hurt.appendChild(span)
    }
  })
  await assertEasyTypeFloor(page, 'L1 maze help cue', '.play.is-road-maze .maze-cell.is-help-cue')
  const artRoot = process.env.SILVER_CITY_ARTIFACTS
  if (artRoot) {
    mkdirSync(artRoot, { recursive: true })
    const w = page.viewportSize()?.width ?? 0
    if (w === 375 || w === 390) {
      await page.screenshot({ path: join(artRoot, `871-maze-help-${w}.png`) })
    }
  }
  await pointerClick(page, page.locator('[data-maze-cell].is-hurt'))
  await page.locator('.play.is-road-maze.is-helped').waitFor()
  await walkUntil(page, inn, true)
}

async function walkUntil(page, target, winOnArrival = false) {
  for (let guard = 0; guard < 40; guard += 1) {
    const at = await readCell(page.locator('[data-maze-cell].is-here'))
    if (at.r === target.r && at.c === target.c) return
    const open = new Set()
    const roads = page.locator('[data-maze-cell].is-road')
    const count = await roads.count()
    for (let index = 0; index < count; index += 1) {
      open.add(key(await readCell(roads.nth(index))))
    }
    const path = shortest(at, target, open)
    assert.ok(path && path.length >= 2, `no road from ${key(at)} to ${key(target)}`)
    const next = path[1]
    const winning = winOnArrival && next.r === target.r && next.c === target.c
    await pointerClick(page, page.locator(`[data-maze-cell][data-r="${next.r}"][data-c="${next.c}"]`))
    if (winning) {
      await page.locator('.win-stamp', { hasText: 'Helped!' }).waitFor()
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

async function hugFather(page) {
  const pad = page.locator('[data-run-pad="hold"]')
  await pad.waitFor()
  const box = await pad.boundingBox()
  assert.ok(box, 'run pad left the screen')
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
  await page.mouse.down()
  const start = Date.now()
  while (Date.now() - start < 12000) {
    if (await page.locator('.play.is-father-run.is-win').count()) {
      await page.mouse.up().catch(() => {})
      return
    }
    await page.waitForTimeout(40)
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

function findWord(grid, word) {
  const dirs = [
    [0, 1],
    [1, 0],
    [0, -1],
    [-1, 0],
    [1, 1],
    [1, -1],
    [-1, 1],
    [-1, -1],
  ]
  const size = grid.length
  for (let r = 0; r < size; r += 1) {
    for (let c = 0; c < size; c += 1) {
      for (const [dr, dc] of dirs) {
        const path = []
        let ok = true
        for (let i = 0; i < word.length; i += 1) {
          const rr = r + dr * i
          const cc = c + dc * i
          if (rr < 0 || cc < 0 || rr >= size || cc >= size || grid[rr][cc] !== word[i]) {
            ok = false
            break
          }
          path.push({ r: rr, c: cc })
        }
        if (ok) return path
      }
    }
  }
  return null
}

async function dragCells(page, path) {
  const first = await page.locator(`[data-gem-cell][data-r="${path[0].r}"][data-c="${path[0].c}"]`).boundingBox()
  assert.ok(first)
  await page.mouse.move(first.x + first.width / 2, first.y + first.height / 2)
  await page.mouse.down()
  for (const cell of path.slice(1)) {
    const box = await page.locator(`[data-gem-cell][data-r="${cell.r}"][data-c="${cell.c}"]`).boundingBox()
    assert.ok(box)
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 4 })
  }
  await page.mouse.up()
}

function swSource(version) {
  const html = `<!doctype html><meta charset="utf-8"><p data-build="${version}">${version}</p>`
  return `const VERSION = ${JSON.stringify(version)};
const PAGE = ${JSON.stringify(html)};
self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open('city-' + VERSION);
    await cache.put('/', new Response(PAGE, { headers: { 'Content-Type': 'text/html; charset=utf-8' } }));
    await self.skipWaiting();
  })());
});
self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((key) => key !== 'city-' + VERSION).map((key) => caches.delete(key)));
    await self.clients.claim();
  })());
});
self.addEventListener('fetch', (event) => {
  const path = new URL(event.request.url).pathname;
  if (path !== '/' && path !== '/index.html') return;
  event.respondWith((async () => {
    const cache = await caches.open('city-' + VERSION);
    const hit = await cache.match('/');
    return hit || fetch(event.request);
  })());
});
`
}

async function proveStaleBuild(browser) {
  let version = '1.4.519'
  const refresh = createServer((req, res) => {
    const path = new URL(req.url || '/', 'http://127.0.0.1').pathname
    if (path === '/sw.js') {
      res.setHeader('content-type', 'text/javascript; charset=utf-8')
      res.setHeader('cache-control', 'no-store')
      res.end(swSource(version))
      return
    }
    res.setHeader('content-type', 'text/html; charset=utf-8')
    res.setHeader('cache-control', 'no-store')
    res.end(
      `<!doctype html><meta charset="utf-8"><p data-build="${version}">${version}</p><script>navigator.serviceWorker.register('/sw.js')</script>`,
    )
  })
  await new Promise((resolve) => refresh.listen(0, '127.0.0.1', resolve))
  const info = refresh.address()
  const refreshOrigin = `http://127.0.0.1:${info.port}`
  const page = await browser.newPage({ viewport: { width: 375, height: 667 } })
  try {
    await page.goto(`${refreshOrigin}/`)
    await page.locator('[data-build]').waitFor()
    assert.equal((await page.locator('[data-build]').innerText()).trim(), '1.4.519')
    await page.waitForFunction(() => navigator.serviceWorker.controller !== null)
    version = '1.4.520'
    await page.evaluate(
      () =>
        new Promise((resolve) => {
          navigator.serviceWorker.addEventListener('controllerchange', () => resolve(true), { once: true })
          void navigator.serviceWorker.getRegistration().then((reg) => reg?.update())
        }),
    )
    await page.reload()
    await page.locator('[data-build]').waitFor()
    assert.equal((await page.locator('[data-build]').innerText()).trim(), '1.4.520')
  } finally {
    await page.close()
    await new Promise((resolve) => refresh.close(resolve))
  }
}
