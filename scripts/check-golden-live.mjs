/**
 * Built-app gold follower. Fresh save, 375×667 and 390×844.
 * Taps only the one visible filled gold. Play screens are scripted.
 */
import assert from 'node:assert/strict'
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { chromium } from 'playwright'
import { build, preview } from 'vite'
import { evidenceForTier } from '../src/content/evidence.ts'
import { DAILY_POOL, dailyForDate } from '../src/content/daily.ts'
import { findStraightSpelling } from '../src/lib/gemSearchGrid.ts'
import { gemWordsFor } from '../src/lib/gemSearch.ts'
import { EASY, easyChromeLine, easyFacingLine, easyReasonHint, easyWhyLine, easyMatchMiss } from '../src/lib/easy.ts'
import { FATHER_RUN_HINT } from '../src/easyTrail/father/fatherRun.ts'
import { localDateKey } from '../src/lib/dates.ts'
import { SAVE_KIND } from '../src/lib/save.ts'
import { SAVE_SCHEMA_VERSION, STORAGE_KEY } from '../src/config/app.ts'
import { EASY_OPEN_DAY_KEY } from '../src/content/goldenPath.ts'
import { camClamp, camFrameInsets, camToPlate, focusPan, NW_CAMERA_FOCUS, NW_CAMERA_ZOOM } from '../src/components/nwCamera.ts'
import { boardFillBox } from '../src/nightWatch/map/phoneFill.ts'
import { proveMazeDragAcceptance } from './check-maze-drag-live.mjs'

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

async function lockInTabFilledGolds(page) {
  return page.evaluate(() => {
    const hits = []
    for (const el of document.querySelectorAll('button, a.btn')) {
      if (!(el instanceof HTMLElement)) continue
      if (el.closest('[hidden]')) continue
      const style = getComputedStyle(el)
      if (style.display === 'none' || style.visibility === 'hidden' || Number(style.opacity) === 0) continue
      const box = el.getBoundingClientRect()
      if (box.width <= 0 || box.height <= 0) continue
      const primary = el.classList.contains('primary')
      const coach = el.classList.contains('easy-coach-step') && Boolean(el.closest('li.is-now'))
      if (!primary && !coach) continue
      hits.push((el.innerText || el.getAttribute('aria-label') || '').replace(/\s+/g, ' ').trim())
    }
    return hits
  })
}

const LOCK_IN_EMPTY_HOME =
  '.journal.is-lock-in-empty .cta-dock .btn.primary'

async function waitForAnimationsSettled(page, selector) {
  await page.locator(selector).first().waitFor()
  await page.evaluate(async (sel) => {
    const el = document.querySelector(sel)
    if (!(el instanceof HTMLElement)) return
    const minMs = 800
    const start = performance.now()
    const settled = () => {
      const anims = el.getAnimations({ subtree: true })
      return anims.length === 0 || anims.every((a) => a.playState === 'finished' || a.playState === 'idle')
    }
    while (!settled() && performance.now() - start < minMs) {
      await new Promise((resolve) => requestAnimationFrame(resolve))
    }
    const elapsed = performance.now() - start
    if (elapsed < minMs) {
      await new Promise((resolve) => setTimeout(resolve, minMs - elapsed))
    }
  }, selector)
}

async function assertPrimaryButtonRendered(page, selector, where) {
  await waitForAnimationsSettled(page, selector)
  const stats = await page.locator(selector).first().evaluate((el) => {
    const parseRgb = (css) => {
      const m = css.match(/rgba?\(([^)]+)\)/)
      if (!m) return null
      const parts = m[1].split(',').map((s) => parseFloat(s.trim()))
      if (parts.length === 4 && parts[3] <= 0.02) return null
      return parts.slice(0, 3)
    }
    const hexToRgb = (hex) => {
      const n = hex.replace('#', '')
      return [parseInt(n.slice(0, 2), 16), parseInt(n.slice(2, 4), 16), parseInt(n.slice(4, 6), 16)]
    }
    const relLum = ([r, g, b]) => {
      const [lr, lg, lb] = [r, g, b].map((v) => {
        const c = v / 255
        return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
      })
      return 0.2126 * lr + 0.7152 * lg + 0.0722 * lb
    }
    const contrast = (fg, bg) => {
      const a = relLum(fg)
      const b = relLum(bg)
      return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)
    }
    const gradientStops = (bgImage) => {
      if (!bgImage || bgImage === 'none') return []
      const stops = []
      for (const m of bgImage.matchAll(/#([0-9a-fA-F]{6})/g)) stops.push(hexToRgb(`#${m[1]}`))
      for (const m of bgImage.matchAll(/rgb\(([^)]+)\)/g)) {
        stops.push(m[1].split(',').map((s) => parseFloat(s.trim())))
      }
      return stops
    }
    const style = getComputedStyle(el)
    const fg = parseRgb(style.color)
    let bg = parseRgb(style.backgroundColor)
    if (!bg) {
      const stops = gradientStops(style.backgroundImage)
      if (stops.length) {
        bg = stops.reduce((darkest, stop) => (relLum(stop) < relLum(darkest) ? stop : darkest), stops[0])
      }
    }
    const opacity = Number(style.opacity)
    const ratio = fg && bg ? contrast(fg, bg) : 0
    return {
      fg: style.color,
      bg: style.backgroundColor,
      bgImage: style.backgroundImage,
      fs: parseFloat(style.fontSize),
      fw: style.fontWeight,
      text: (el.textContent || '').replace(/\s+/g, ' ').trim(),
      classes: el.className,
      opacity,
      ratio,
    }
  })
  assert.ok(stats, `${where} primary button`)
  assert.match(stats.classes, /\bprimary\b/)
  assert.match(stats.classes, /\bsnap-bins\b/)
  assert.doesNotMatch(stats.classes, /\bgold\b/, `${where} is primary like gem-win Lock In next`)
  assert.ok(stats.fs >= 16, `${where} label ≥16px (${stats.fs})`)
  assert.equal(stats.opacity, 1, `${where} computed opacity is 1 (${stats.opacity})`)
  assert.ok(stats.ratio >= 4.5, `${where} rendered text/background contrast ${stats.ratio.toFixed(2)} ≥4.5 (fg=${stats.fg} bg=${stats.bg} img=${stats.bgImage})`)
  assert.doesNotMatch(stats.bgImage, /200,\s*107,\s*255|purple/i, `${where} is not the pale .btn.gold wash`)
  return stats
}

async function assertLockInEmptyDockClear(page, where) {
  const dock = await page.locator('.journal.is-lock-in-empty .cta-dock').first().evaluate((el) => {
    const s = getComputedStyle(el)
    return {
      bg: s.backgroundColor,
      img: s.backgroundImage,
      backdrop: s.backdropFilter,
      boxShadow: s.boxShadow,
    }
  })
  const alpha = dock.bg.match(/[\d.]+/g)?.map(Number).at(-1)
  assert.ok(
    dock.bg === 'transparent' || alpha === 0,
    `${where} cta-dock background is transparent (${dock.bg})`,
  )
  assert.equal(dock.img, 'none', `${where} cta-dock has no background plate (${dock.img})`)
  assert.equal(dock.backdrop, 'none', `${where} cta-dock has no backdrop-filter (${dock.backdrop})`)
  assert.equal(dock.boxShadow, 'none', `${where} cta-dock has no plate shadow (${dock.boxShadow})`)
}

async function assertLockInEmptyHomeButton(page, where) {
  await assertLockInEmptyDockClear(page, where)
  const stats = await assertPrimaryButtonRendered(page, LOCK_IN_EMPTY_HOME, where)
  assert.match(stats.bgImage, /linear-gradient/, `${where} Home keeps its primary gradient glow`)
  const btnGlow = await page.locator(LOCK_IN_EMPTY_HOME).first().evaluate((el) => getComputedStyle(el).boxShadow)
  assert.notEqual(btnGlow, 'none', `${where} Home button keeps box-shadow glow (${btnGlow})`)
}

async function tapLockInTab(page) {
  const tab = page.getByRole('banner').getByRole('button', { name: 'Lock In', exact: true })
  await tab.waitFor()
  await tab.scrollIntoViewIfNeeded()
  const box = await tab.boundingBox()
  assert.ok(box, 'Lock In tab has a box')
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2)
}

async function openEasyHome(page, origin) {
  await page.goto(origin)
  if (await page.locator('.welcome').count()) {
    await tapFilledGold(page)
  }
  await page.locator('main.hub').waitFor({ timeout: 30_000 })
}

async function openGemTuningViaDebug(page) {
  await page.locator('main.hub').waitFor({ timeout: 30_000 })
  await pointerClick(page, page.getByRole('button', { name: 'Settings' }))
  const summary = page.locator('summary', { hasText: 'Developer · mini-game jumps' })
  await summary.waitFor()
  await pointerClick(page, summary)
  const jump = page.getByRole('button', { name: /ob-tuning ·/ })
  await jump.waitFor()
  await pointerClick(page, jump)
}

async function captureGemWinLockInReference(browser, origin, shotsDir) {
  const freshSave = {
    kind: SAVE_KIND,
    schemaVersion: SAVE_SCHEMA_VERSION,
    appVersion: '1.4.547',
    savedAt: '2026-10-27T00:00:00.000Z',
    progress: { started: true, easyMode: true, theme: 'candy', completed: [] },
  }
  const ctx = await browser.newContext({ viewport: { width: 375, height: 667 } })
  await ctx.addInitScript(
    ([key, raw]) => {
      localStorage.clear()
      localStorage.setItem(key, raw)
    },
    [STORAGE_KEY, JSON.stringify(freshSave)],
  )
  const page = await ctx.newPage()
  await openEasyHome(page, origin)
  await openGemTuningViaDebug(page)
  await page.locator('.play.is-gem-search').waitFor({ timeout: 30_000 })
  await playGem(page, 'ob-tuning')
  await page.locator('.play.is-gem-search.is-win .cta-dock .btn.primary').waitFor()
  await assertPrimaryButtonRendered(page, '.play.is-gem-search.is-win .cta-dock .btn.primary', '375x667 gem-win Lock In next')
  await page.screenshot({ path: join(shotsDir, 'gem-win-lock-in-next-375x667.png') })
  await ctx.close()
  return join(shotsDir, 'gem-win-lock-in-next-375x667.png')
}

async function proveLockInEmptyTab(browser, origin) {
  const traces = []
  const shotsDir = join(tmpdir(), 'lock-in-empty-shots')
  mkdirSync(shotsDir, { recursive: true })
  for (const [width, height] of [
    [375, 667],
    [390, 844],
  ]) {
    const freshSave = {
      kind: SAVE_KIND,
      schemaVersion: SAVE_SCHEMA_VERSION,
      appVersion: '1.4.547',
      savedAt: '2026-10-27T00:00:00.000Z',
      progress: { started: true, easyMode: true, theme: 'candy', completed: [] },
    }
    const ctx = await browser.newContext({ viewport: { width, height } })
    await ctx.addInitScript(
      ([key, raw]) => {
        localStorage.clear()
        localStorage.setItem(key, raw)
      },
      [STORAGE_KEY, JSON.stringify(freshSave)],
    )
    const page = await ctx.newPage()
    await openEasyHome(page, origin)
    await tapLockInTab(page)
    await page.locator('.journal.is-lock-in-empty').waitFor()
    assert.match(await page.locator('.journal.is-lock-in-empty .journal-head').innerText(), /Nothing to lock in yet\./)
    assert.equal(await page.locator('.run-pad').count(), 0, 'empty Lock In has no Run pad')
    assert.equal(await page.locator('.play.is-father-run').count(), 0, 'empty Lock In has no Run play')
    const golds = await lockInTabFilledGolds(page)
    assert.deepEqual(golds, ['Home'], `${width}x${height} fresh empty Lock In one gold Home ${JSON.stringify(golds)}`)
    await assertLockInEmptyHomeButton(page, `${width}x${height} no-read`)
    assert.equal(await page.locator('.journal.is-lock-in-empty .text-link').count(), 0, 'fresh empty has no Read')
    await waitForAnimationsSettled(page, LOCK_IN_EMPTY_HOME)
    const noReadShot = join(shotsDir, `lock-in-empty-no-read-${width}x${height}.png`)
    await page.screenshot({ path: noReadShot })
    traces.push(`shot ${noReadShot}`)
    traces.push(`${width}x${height} lock-in-empty-no-read ok`)
    await ctx.close()

    const readSave = {
      kind: SAVE_KIND,
      schemaVersion: SAVE_SCHEMA_VERSION,
      appVersion: '1.4.547',
      savedAt: '2026-10-27T00:00:00.000Z',
      progress: {
        started: true,
        easyMode: true,
        theme: 'candy',
        completed: [],
        easyTaught: ['ph-road'],
        easyHeld: ['ph-road'],
        held: ['ph-road'],
        learnings: [{ id: 'ph-road' }],
        lastDailyDate: '2020-01-01',
        dailyDates: ['2020-01-01'],
      },
    }
    const readCtx = await browser.newContext({ viewport: { width, height } })
    await readCtx.addInitScript(
      ([key, raw, openKey]) => {
        localStorage.clear()
        localStorage.setItem(key, raw)
        localStorage.setItem(openKey, '2020-01-01')
      },
      [STORAGE_KEY, JSON.stringify(readSave), EASY_OPEN_DAY_KEY],
    )
    const readPage = await readCtx.newPage()
    await openEasyHome(readPage, origin)
    await tapLockInTab(readPage)
    await readPage.locator('.journal.is-lock-in-empty').waitFor()
    assert.equal(await readPage.locator('.journal.is-lock-in-empty .text-link').count(), 1, 'Read link when Read is open')
    assert.match(await readPage.locator('.journal.is-lock-in-empty .text-link').innerText(), /^Read$/)
    const readGolds = await lockInTabFilledGolds(readPage)
    assert.deepEqual(readGolds, ['Home'], `${width}x${height} empty with Read still one gold ${JSON.stringify(readGolds)}`)
    await assertLockInEmptyHomeButton(readPage, `${width}x${height} with-read`)
    await waitForAnimationsSettled(readPage, LOCK_IN_EMPTY_HOME)
    const withReadShot = join(shotsDir, `lock-in-empty-with-read-${width}x${height}.png`)
    await readPage.screenshot({ path: withReadShot })
    traces.push(`shot ${withReadShot}`)
    traces.push(`${width}x${height} lock-in-empty-with-read ok`)
    await readCtx.close()

    const holdSave = {
      kind: SAVE_KIND,
      schemaVersion: SAVE_SCHEMA_VERSION,
      appVersion: '1.4.547',
      savedAt: '2026-10-27T00:00:00.000Z',
      progress: {
        started: true,
        easyMode: true,
        theme: 'candy',
        completed: [],
        easyTaught: ['ph-road'],
        tierTaught: { 'ph-road': 'easy' },
      },
    }
    const holdCtx = await browser.newContext({ viewport: { width, height } })
    await holdCtx.addInitScript(
      ([key, raw]) => {
        localStorage.clear()
        localStorage.setItem(key, raw)
      },
      [STORAGE_KEY, JSON.stringify(holdSave)],
    )
    const holdPage = await holdCtx.newPage()
    await openEasyHome(holdPage, origin)
    await tapLockInTab(holdPage)
    await holdPage.locator('.why-blast, .journal.is-rehearse').first().waitFor()
    assert.equal(await holdPage.locator('.journal.is-lock-in-empty').count(), 0, 'pending hold opens practice')
    assert.equal(await holdPage.locator('.play.is-father-run').count(), 0, 'pending hold is not Run')
    const holdShot = join(shotsDir, `lock-in-pending-hold-${width}x${height}.png`)
    await holdPage.screenshot({ path: holdShot })
    traces.push(`${width}x${height} lock-in-pending-hold ok`)
    traces.push(`shot ${holdShot}`)
    await holdCtx.close()
  }
  const gemRef = await captureGemWinLockInReference(browser, origin, shotsDir)
  traces.push(`shot ${gemRef}`)
  return traces.join('\n')
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

async function homeLine(page) {
  return page.evaluate(() => ((document.querySelector('.easy-home-whisper') || document.querySelector('.easy-build-gift'))?.textContent || '').replace(/\s+/g, ' ').trim())
}

async function signature(page) {
  const id = await screenId(page)
  const golds = await filledGolds(page)
  const detail = await page.evaluate(() => {
    const claim = document.querySelector('.why-claim, .recall-line, .teach-reason')?.textContent || ''
    const whisper = (document.querySelector('.easy-home-whisper') || document.querySelector('.easy-build-gift'))?.textContent || ''
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

/** #792b B1: pageerror, console.error, failed requests and same-origin HTTP >= 400 all count. */
function watchSameOrigin(page, errors, origin) {
  const host = new URL(origin).origin
  const own = (url) => {
    try {
      return new URL(url).origin === host
    } catch {
      return false
    }
  }
  page.on('pageerror', (error) => errors.push(`pageerror ${String(error)}`))
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(`console.error ${message.text()}`)
  })
  page.on('requestfailed', (request) => {
    if (own(request.url())) errors.push(`requestfailed ${request.url()}`)
  })
  page.on('response', (response) => {
    if (own(response.url()) && response.status() >= 400) errors.push(`http ${response.status()} ${response.url()}`)
  })
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

async function lockInGoldCues(page) {
  return page.evaluate(() => {
    const goldish = (value) => {
      const re = /rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/g
      let m
      while ((m = re.exec(value || ''))) {
        const r = +m[1], g = +m[2], b = +m[3]
        if (r > 190 && g > 140 && b < 120 && r > b + 60 && g > b + 30) return true
      }
      return false
    }
    const sel = '.why-blast .why-slide-cue, .why-blast .why-chip, .why-blast .why-claim, .why-blast .why-score, .why-blast .next-tap, .why-blast .held-from, .why-blast .btn.primary'
    return [...document.querySelectorAll(sel)].filter((el) => {
      const s = getComputedStyle(el)
      const box = el.getBoundingClientRect()
      if (s.display === 'none' || s.visibility === 'hidden' || box.width < 2 || box.height < 2) return false
      return goldish(s.backgroundImage) || goldish(s.backgroundColor) || goldish(s.borderTopColor) || goldish(s.boxShadow)
    }).map((el) => el.className.toString())
  })
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
  const here = await page.evaluate(() => {
    const root = document.documentElement
    const was = root.dataset.easy
    const read = () => getComputedStyle(document.querySelector('[data-maze-cell].is-here')).boxShadow
    const easy = read()
    root.dataset.easy = 'off'
    const hard = read()
    if (was === undefined) delete root.dataset.easy
    else root.dataset.easy = was
    return { easy, hard }
  })
  assert.match(here.hard, /rgba\(61, 204, 122/, `#792b A2 Hard pawn glow is green (${here.hard})`)
  assert.equal(isGoldPaint(here.hard), false, '#792b A2 Hard pawn glow has no gold')
  assert.match(here.easy, /rgba\(90, 160, 255/, `#792b A2 Easy pawn glow stays blue (${here.easy})`)
  assert.equal(isGoldPaint(here.easy), false, '#792b A2 Easy pawn glow has no gold')
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

async function playRoadAdjacent(page, opts = {}) {
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
  if (opts.mazeDragPhase2) {
    await proveMazeDragAcceptance(page, { label: opts.mazeDragPhase2, avoidInn: true })
  }
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

async function assertNoSideScroll(page, label) {
  if (page.viewportSize()?.width !== 375) return
  const extra = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
  assert.ok(extra <= 1, `${label} has no horizontal scroll at 375 (${extra})`)
}

async function assertGemWinFold(page, label) {
  await assertNoSideScroll(page, `${label} MATCHED!`)
  const view = page.viewportSize()
  if (view?.width !== 375 || view?.height !== 667) return
  await page.evaluate(() => {
    document.querySelector('.play.is-gem-search.is-win').scrollTop = 0
    window.scrollTo(0, 0)
  })
  const buttons = await page.locator('.play.is-gem-search.is-win .cta-dock .btn').evaluateAll((els) =>
    els.map((el) => ({
      text: (el.innerText || '').replace(/\s+/g, ' ').trim(),
      bottom: el.getBoundingClientRect().bottom,
      height: el.getBoundingClientRect().height,
      innerHeight: window.innerHeight,
    })),
  )
  assert.ok(buttons.length >= 2, `${label} win dock has buttons ${JSON.stringify(buttons)}`)
  assert.ok(buttons.some((button) => button.text === 'Home'), `${label} win dock has Home`)
  for (const button of buttons) {
    assert.ok(button.height > 0, `${label} ${button.text} is rendered`)
    assert.ok(button.bottom <= button.innerHeight + 1, `${label} ${button.text} above the 667 fold (${button.bottom})`)
  }
  const golds = await filledGolds(page)
  assert.equal(golds.length, 1, `${label} win fold one gold ${JSON.stringify(golds)}`)
  assert.match(golds[0].text, /Lock In next/)
  const extras = await page.locator('.play.is-gem-search.is-win .cta-dock .btn:not(.primary)').evaluateAll((els) =>
    els.map((el) => {
      const style = getComputedStyle(el)
      return { text: (el.innerText || '').replace(/\s+/g, ' ').trim(), border: style.borderTopColor, bg: style.backgroundColor, img: style.backgroundImage }
    }),
  )
  for (const button of extras) {
    assert.equal(isGoldPaint(button.border), false, `${label} ${button.text} border is not gold at 375 (${button.border})`)
    assert.equal(isGoldPaint(button.bg) || isGoldPaint(button.img), false, `${label} ${button.text} fill is not gold at 375`)
  }
  await page.screenshot({ path: `${SHOTS}/matched-fold-${label}-375.png` })
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
      await assertNoSideScroll(page, `${lineId} word search start`)
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
          if (pop) {
            const popStyle = getComputedStyle(pop)
            window.__gemPopInk = `${popStyle.textShadow} ${popStyle.webkitTextStroke}`
          }
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
      const startHint = page.locator('[data-gem-start]')
      assert.equal(await startHint.count(), 1, `${lineId} start hint slot stays reserved after the first find`)
      assert.match((await startHint.innerText()).trim(), /^\s*$/, `${lineId} start hint text clears on the first find`)
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
        assert.match(cells[0].shadow, /rgb\(42, 33, 24\)/, `${lineId} pulse has an ink ring`)
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
      if (juice.pop) {
        const popInk = await page.evaluate(() => window.__gemPopInk || '')
        assert.match(popInk, /rgb\(42, 33, 24\)/, `${lineId} find pop has an ink outline (${popInk})`)
      }
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
  const start = await lockInGoldCues(page)
  assert.equal(start.length, 1, `${id} Lock In start has one gold ${JSON.stringify(start)}`)
  assert.match(start[0], /why-slide-cue/, `${id} the one gold is the slide cue`)
  const claimGold = await page.locator('.why-claim').evaluate((el) => getComputedStyle(el).borderTopColor)
  assert.equal(isGoldPaint(claimGold), false, `${id} MAIN IDEA outline is not gold (${claimGold})`)
  const cueGeo = await page.evaluate(() => {
    const cue = document.querySelector('.why-slide-cue')?.getBoundingClientRect()
    const claim = document.querySelector('.why-claim')?.getBoundingClientRect()
    if (!cue || !claim) return null
    return {
      dx: Math.abs(cue.left + cue.width / 2 - (claim.left + claim.width / 2)),
      below: cue.bottom - claim.top,
    }
  })
  assert.ok(cueGeo, `${id} slide cue and claim have boxes`)
  assert.ok(cueGeo.dx <= 6, `${id} slide cue is centred on MAIN IDEA (${cueGeo.dx})`)
  assert.ok(cueGeo.below >= -2 && cueGeo.below <= 8, `${id} slide cue sits on the MAIN IDEA top edge (${cueGeo.below})`)
  if (page.viewportSize()?.width === 375) {
    assert.equal(face.descender, true, `${id} keeps the g descender (${face.lineHeight})`)
    await page.screenshot({ path: `${SHOTS}/lock-in-slide-cue-375.png` })
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
  const mid = await lockInGoldCues(page)
  assert.equal(mid.length, 1, `${id} mid-drag has one gold ${JSON.stringify(mid)}`)
  assert.match(mid[0], /why-chip.*is-pressed|is-pressed.*why-chip/, `${id} mid-drag gold is the pressed card`)
  assert.equal(await page.locator('.why-slide-cue').count(), 0, 'cue hides while dragging')
  if (page.viewportSize()?.width === 375) await page.screenshot({ path: `${SHOTS}/lock-in-pressed-375.png` })
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
    const claimCards = page.locator('.recall-gate.is-easy-hold button.recall-card')
    if ((await claimCards.count()) && !quizOpen) {
      const brief = evidenceForTier(puzzle.challenge.id, 'easy')
      assert.ok(brief, `evidence for ${puzzle.challenge.id}`)
      await pointerClick(page, claimCards.filter({ hasText: easyFacingLine(puzzle.challenge.id, brief.claim) }).first())
      await page.waitForTimeout(250)
      continue
    }
    const lockIn = page.locator('.play.is-easy-sort .sort-lock .snap-bins')
    if (await lockIn.count()) {
      await lockIn.click()
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

async function openSeeded(browser, origin, progress, viewport = { width: 375, height: 667 }) {
  const context = await browser.newContext({ viewport })
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

  for (const viewport of [{ width: 375, height: 667 }, { width: 390, height: 844 }]) {
    const blast = await openSeeded(browser, origin, {}, viewport)
    try {
      await openRoadLockIn(blast.page)
      await blast.page.locator('button.why-chip').first().waitFor()
      const startCue = await lockInGoldCues(blast.page)
      assert.equal(startCue.length, 1, `Lock In start one gold ${JSON.stringify(startCue)}`)
      await tapWrongWhy(blast.page, why)
      await blast.page.locator('.why-miss-hint').waitFor()
      const firstHint = ((await blast.page.locator('.why-miss-hint').innerText()) || '').replace(/\s+/g, ' ').trim()
      assert.equal(firstHint, hint, 'first miss hints from the reason')
      assert.equal(await blast.page.locator('.why-miss-answer').count(), 0, 'first miss hides the right card')
      assert.ok(firstHint.length < why.length, 'the hint is shorter than the right card')
      const firstGolds = await filledGolds(blast.page)
      assert.equal(firstGolds.length, 1, `first miss one gold ${JSON.stringify(firstGolds)}`)
      assert.equal(firstGolds[0].text, 'Try again')
      if (viewport.width === 375) await blast.page.screenshot({ path: `${SHOTS}/not-quite-first-375.png` })
      await pointerClick(blast.page, blast.page.locator('.why-miss-retry'))
      await blast.page.locator('button.why-chip:not(.is-gone)').first().waitFor()
      const retryCue = await lockInGoldCues(blast.page)
      assert.equal(retryCue.length, 1, `Lock In after Try again has one gold ${JSON.stringify(retryCue)}`)
      assert.match(retryCue[0], /why-slide-cue/, 'after Try again the slide cue is back')
      await tapWrongWhy(blast.page, why)
      await blast.page.locator('.why-miss-answer').waitFor()
      const second = ((await blast.page.locator('.why-miss-answer').innerText()) || '').replace(/\s+/g, ' ').trim()
      assert.equal(second, answer, 'second miss shows claim and reason on one line')
      assert.equal(await blast.page.locator('.why-miss-retry').count(), 0, 'second miss has no third retry')
      const secondGolds = await filledGolds(blast.page)
      assert.equal(secondGolds.length, 1, `second miss one gold ${JSON.stringify(secondGolds)}`)
      assert.equal(secondGolds[0].text, 'Continue')
      if (viewport.width === 375) await blast.page.screenshot({ path: `${SHOTS}/not-quite-second-375.png` })
      await pointerClick(blast.page, blast.page.locator('.why-miss-continue'))
      await blast.page.locator('main.hub').waitFor()
      const after = await filledGolds(blast.page)
      assert.equal(after.length, 1, `Home after 2nd miss has one gold ${JSON.stringify(after)}`)
      assert.match(after[0].text, /Run/, '2nd-miss Continue moves on to the next step (L2 Run)')
      const saved = await blast.page.evaluate((k) => JSON.parse(localStorage.getItem(k)), STORAGE_KEY)
      const p = saved.progress ?? saved
      assert.ok(p.easyHeld.includes('ph-road'), '2nd miss still moves the trail on')
      assert.equal(p.lessonScore?.['ph-road'], undefined, '2nd miss does not lock (no score)')
      assert.equal(blast.errors.join('\n'), '', 'why-blast miss page errors')
    } finally {
      await blast.context.close()
    }
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
    assert.equal(toast, easyMatchMiss(pair.right))
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

async function touchDrag(page, from, to, steps = 8, gap = 0) {
  const cdp = await page.context().newCDPSession(page)
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: from.x, y: from.y }] })
  for (let i = 1; i <= steps; i += 1) {
    const x = from.x + ((to.x - from.x) * i) / steps
    const y = from.y + ((to.y - from.y) * i) / steps
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y }] })
    if (gap) await page.waitForTimeout(gap)
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
    await page.waitForTimeout(150)
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

/** #792b: Home faces, the Pages chip, staked lots and the parked stores toast, on Easy at every Home size. */
async function prove792bHome(browser, origin, size, errorsOut) {
  const where = `${size[0]}x${size[1]}`
  const late = await openHome(browser, origin, 'late', size)
  try {
    await settleHome(late.page)
    const faces = await late.page.evaluate(() =>
      [...document.querySelectorAll('.easy-home-map .city-folk .city-portrait-img')].map((el) => {
        const r = el.getBoundingClientRect()
        return { left: r.left, right: r.right, top: r.top, bottom: r.bottom }
      }),
    )
    assert.ok(faces.length >= 2, `#792b BH7 ${where} late seed shows several faces`)
    for (let a = 0; a < faces.length; a++) {
      for (let b = a + 1; b < faces.length; b++) {
        const x = Math.min(faces[a].right, faces[b].right) - Math.max(faces[a].left, faces[b].left)
        const y = Math.min(faces[a].bottom, faces[b].bottom) - Math.max(faces[a].top, faces[b].top)
        assert.ok(!(x > 2 && y > 2), `#792b BH7 ${where} faces ${a} and ${b} overlap by ${x.toFixed(1)}x${y.toFixed(1)}`)
      }
    }
    const chip = await late.page.evaluate(() => {
      const label = [...document.querySelectorAll('.easy-home-map g.city-easy-chip')].find((el) => /Pages/.test(el.textContent || ''))
      const art = document.querySelector('.easy-home-map g.city-plot[data-plot="journal"] .city-plot-img')
      if (!label || !art) return null
      const a = label.getBoundingClientRect()
      const b = art.getBoundingClientRect()
      return { x: Math.min(a.right, b.right) - Math.max(a.left, b.left), y: Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) }
    })
    assert.ok(chip, `#792b BH8 ${where} the Pages chip and the journal still both render`)
    assert.ok(!(chip.x > 0 && chip.y > 0), `#792b BH8 ${where} the Pages chip stays off the journal roof (${JSON.stringify(chip)})`)
  } finally {
    errorsOut.push(...late.errors)
    await late.ctx.close()
  }

  for (const kind of ['fresh', 'hollow-next', 'bench-next', 'late']) {
    const { ctx, page, errors } = await openHome(browser, origin, kind, size)
    try {
      await settleHome(page)
      const plain = await page.evaluate(() =>
        [...document.querySelectorAll('.easy-home-map .city-plot.is-easy-lot')]
          .filter((el) => !el.classList.contains('has-candy-img') && !el.classList.contains('is-next') && !el.classList.contains('is-ready'))
          .filter((el) => getComputedStyle(el).display !== 'none').length,
      )
      assert.equal(plain, 0, `#792b B2 ${where} ${kind} no visible white plate lot`)
    } finally {
      errorsOut.push(...errors)
      await ctx.close()
    }
  }

  const pages = await openHome(browser, origin, 'fresh', size, {}, { journal: ['j-ph-1'], cityBuilt: { porch: 0, hollow: 0, bench: 0, observatory: 0, gate: 0, lookout: 0, journal: 0, lamps: 0 } })
  try {
    await settleHome(pages.page)
    const ready = pages.page.locator('g.city-plot[data-plot="journal"].is-ready')
    if ((await ready.count()) > 0) {
      let spot = null
      for (const side of ['mid', 'left', 'right']) {
        if (side !== 'mid') await panExtreme(pages.page, side)
        spot = await plotCenter(pages.page, 'journal').catch(() => null)
        if (spot) break
      }
      assert.ok(spot, `#792b B2 ${where} the ready journal lot can be panned to a clear point`)
      await mouseTap(pages.page, spot, 0)
      assert.equal(await pages.page.locator('.city-plot.is-selected').count(), 1, `#792b B2 ${where} the ready journal lot takes a real tap`)
    }
    assert.equal(await pages.page.locator('.easy-home-map .city-lot').count(), 0, `#792b BH5 ${where} no staked vector lot`)
  } finally {
    errorsOut.push(...pages.errors)
    await pages.ctx.close()
  }

  for (const easyMode of [true, false]) {
    const notice = await browser.newContext({ viewport: { width: size[0], height: size[1] } })
    await notice.addInitScript(
      ([storageKey, raw]) => {
        localStorage.clear()
        localStorage.setItem(storageKey, raw)
        sessionStorage.setItem('silver-city-stores-coming-notice-v1', 'pending')
      },
      [STORAGE_KEY, JSON.stringify(hopSave({ ...homeProgress('late'), easyMode }))],
    )
    const page = await notice.newPage()
    const errors = []
    page.on('pageerror', (error) => errors.push(String(error)))
    try {
      await page.goto(origin)
      await page.locator('main.hub').waitFor()
      await page.waitForTimeout(300)
      const shown = await page.locator('[data-stores-coming-notice]').count()
      if (easyMode) assert.equal(shown, 0, `#792b B3 ${where} Easy Home shows no stores-coming toast`)
    } finally {
      errorsOut.push(...errors)
      await notice.close()
    }
  }
}

// Mid-trail Home with Night Watch showing: the quiet Begin the watch button carries no gold border.
async function proveHomeBeginRim(browser, origin, size, errorsOut) {
  const where = `${size[0]}x${size[1]}`
  const { ctx, page, errors } = await openHome(browser, origin, 'tall-dock', size)
  try {
    await settleHome(page)
    const quiet = page.locator('.easy-night-watch .easy-nw-quiet')
    await quiet.waitFor()
    const paint = await quiet.evaluate((el) => {
      const style = getComputedStyle(el)
      return { border: style.borderTopColor, width: style.borderTopWidth, bg: style.backgroundImage + style.backgroundColor }
    })
    assert.equal(isGoldPaint(paint.border), false, `${where} Begin the watch border is not gold (${paint.border})`)
    assert.equal(isGoldPaint(paint.bg), false, `${where} Begin the watch is not filled gold`)
    const { cues } = await mapGoldCues(page)
    const filled = await filledGolds(page)
    assert.equal(cues.length + filled.length, 2, `${where} mid-trail Home gold: one map halo plus the one dock button (${JSON.stringify({ cues, filled })})`)
    assert.equal(filled.length, 1, `${where} mid-trail Home keeps one filled gold`)
    return { cues: cues.length, filled: filled.length }
  } finally {
    errorsOut.push(...errors)
    await ctx.close()
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
    const rim = await proveHomeBeginRim(browser, origin, size, errors)
    lines.push(`home mid-trail gold ${size[0]}x${size[1]}: map ${rim.cues}, dock ${rim.filled}, Begin rim 0`)
    await proveHomeTapSlop(browser, origin, size, errors)
    await proveHomeClampAndCenter(browser, origin, size, errors)
    await proveHomeKeys(browser, origin, size, errors)
    await proveHomeTabFocus(browser, origin, size, errors)
    await proveHomeChips(browser, origin, size, errors)
    await prove792bHome(browser, origin, size, errors)
    lines.push(`home-pan ${size[0]}x${size[1]} ok`)
  }
  await proveHomeWideAndHard(browser, origin, errors)
  assert.deepEqual(errors, [], `homePan page errors: ${errors.join('\n')}`)
  lines.push('home-pan wide and hard ok')
  return lines
}

// ---------------------------------------------------------------------------
// Night Watch phone camera (#818). Real pointer, touch and key input only. Never el.click().
// ---------------------------------------------------------------------------
const NW_SIZES = [
  [375, 667],
  [390, 844],
]
const NW_HEAVEN_SIZES = [
  [375, 667],
  [390, 844],
  [412, 915],
]
const NW_SLUGS = ['a2', 'far-hills', 'map02', 'map03', 'map04', 'map05', 'map06']
const NW_SLUG_ID = { map02: 'far-hills' }
const nwId = (slug) => NW_SLUG_ID[slug] ?? slug
const NW_CHROME = ['.nw-hud', '.nw-rail', '.defend-go', '.nw-skill-tray']

async function nwOpen(browser, origin, [width, height], slug, { query = '', touch = false } = {}) {
  const ctx = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1, hasTouch: touch })
  await ctx.addInitScript(
    ([storageKey, raw]) => {
      localStorage.clear()
      localStorage.setItem(storageKey, raw)
    },
    [STORAGE_KEY, JSON.stringify(hopSave({}))],
  )
  const page = await ctx.newPage()
  const errors = []
  const consoleErrors = []
  page.on('pageerror', (error) => errors.push(String(error)))
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text())
  })
  await page.goto(`${origin}?playtest=1&nwSeed=2&nwMap=${slug}${query}`)
  await page.getByRole('button', { name: 'Settings' }).click()
  await page.locator('summary', { hasText: 'Developer' }).click()
  await page.getByRole('button', { name: 'Jump · Night Watch' }).click()
  await page.locator('.defend-board').waitFor()
  if (await page.locator('[data-map-overlay]').count()) {
    await page.locator(`[data-map="${nwId(slug)}"]`).click()
    await page.locator('[data-map-overlay]').waitFor({ state: 'detached' })
  }
  await page.locator('.nw-cam').waitFor()
  await page.waitForTimeout(450)
  return { ctx, page, errors, consoleErrors, width, height }
}

function nwK(view) {
  return { s0: Math.max(view.W / 798, view.H / 1134) }
}

async function nwView(page) {
  return page.evaluate(() => {
    const cam = document.querySelector('.nw-cam')
    if (!cam) return null
    const pan = cam.querySelector('.nw-pan')
    const zoom = cam.querySelector('.nw-zoom')
    const m = new DOMMatrix(getComputedStyle(pan).transform)
    const z = new DOMMatrix(getComputedStyle(zoom).transform).a
    const f = cam.getBoundingClientRect()
    const plate = document.querySelector('.defend-map-plate')?.getBoundingClientRect()
    const box = (r) => (r ? { left: r.left, top: r.top, right: r.right, bottom: r.bottom } : null)
    return {
      on: cam.getAttribute('data-nw-cam'),
      W: cam.clientWidth,
      H: cam.clientHeight,
      tx: m.m41,
      ty: m.m42,
      z,
      frame: box(f),
      world: { w: 798 * Math.max(cam.clientWidth / 798, cam.clientHeight / 1134) * z, h: 1134 * Math.max(cam.clientWidth / 798, cam.clientHeight / 1134) * z },
      plate: box(plate),
      vw: window.innerWidth,
      vh: window.innerHeight,
    }
  })
}

/** Rect of the n-th visible match, or null. */
async function nwRect(page, selector, index = 0) {
  return page.evaluate(
    ([sel, i]) => {
      const nodes = [...document.querySelectorAll(sel)].filter((node) => {
        const r = node.getBoundingClientRect()
        return r.width > 0.5 && r.height > 0.5
      })
      const node = nodes[i]
      if (!node) return null
      const r = node.getBoundingClientRect()
      return { left: r.left, top: r.top, right: r.right, bottom: r.bottom, width: r.width, height: r.height, cx: r.left + r.width / 2, cy: r.top + r.height / 2 }
    },
    [selector, index],
  )
}

async function nwCount(page, selector) {
  return page.locator(selector).count()
}

async function nwTaps(page) {
  return page.evaluate(() => {
    const node = document.querySelector('.nw-tap-readout')
    return {
      hits: Number(node?.getAttribute('data-tap-hits') ?? '0'),
      misses: Number(node?.getAttribute('data-tap-misses') ?? '0'),
    }
  })
}

async function nwGesture(page, points, steps = 3) {
  await page.mouse.move(points[0].x, points[0].y)
  await page.mouse.down()
  for (const p of points.slice(1)) await page.mouse.move(p.x, p.y, { steps })
  await page.mouse.up()
  await page.waitForTimeout(70)
}

/** +1 when the map has room to slide right, else -1, so a drag is never eaten by the clamp. */
const nwDir = (view) => (-view.tx >= 60 ? 1 : -1)

const nwClamp = (value, lo, hi) => Math.min(hi, Math.max(lo, value))

/** Drag the map until its pan is (tx, ty). Each drag starts on open ground well inside the frame. */
async function nwPanTo(page, tx, ty) {
  for (let i = 0; i < 16; i += 1) {
    const v = await nwView(page)
    const dx = tx - v.tx
    const dy = ty - v.ty
    if (Math.abs(dx) < 0.75 && Math.abs(dy) < 0.75) return v
    const sx = nwClamp(dx, -200, 200)
    const sy = nwClamp(dy, -200, 200)
    const c = { x: v.frame.left + v.W * 0.42, y: v.frame.top + v.H * 0.4 }
    const from = { x: c.x - sx / 2, y: c.y - sy / 2 }
    const to = { x: c.x + sx / 2, y: c.y + sy / 2 }
    // A move under the slop would be a tap. Swing out first so the pan always starts.
    const swing = { x: from.x + (Math.abs(sx) < 20 ? 30 : 0), y: from.y + (Math.abs(sy) < 20 ? 30 : 0) }
    await nwGesture(page, [from, swing, to], 3)
  }
  const last = await nwView(page)
  assert.ok(Math.abs(tx - last.tx) < 1.5 && Math.abs(ty - last.ty) < 1.5, `nwPan could not reach ${tx.toFixed(1)},${ty.toFixed(1)} (at ${last.tx.toFixed(1)},${last.ty.toFixed(1)}; W ${last.W} H ${last.H} world ${last.world.w.toFixed(1)}x${last.world.h.toFixed(1)})`)
  return last
}

async function nwPanMid(page) {
  const v = await nwView(page)
  return nwPanTo(page, (v.W - v.world.w) / 2, (v.H - v.world.h) / 2)
}

/** The pan that puts a plate point where the page wants it on screen. */
function nwPanFor(v, plate, screen) {
  const k = nwK(v).s0 * v.z
  return camClamp(screen.x - v.frame.left - plate.x * k, screen.y - v.frame.top - plate.y * k, v.W, v.H, v.world)
}

function nwPlateOf(v, client) {
  return camToPlate(client.x, client.y, v.frame, v.tx, v.ty, nwK(v).s0, v.z)
}

/** Pan until the first match sits where a finger can reach it, and return where it is. */
async function nwBring(page, selector, index = 0) {
  const spots = [
    [0.4, 0.3],
    [0.3, 0.45],
    [0.45, 0.2],
    [0.5, 0.5],
    [0.25, 0.25],
    [0.6, 0.4],
  ]
  for (const [fx, fy] of spots) {
    const v = await nwView(page)
    const r = await nwRect(page, selector, index)
    assert.ok(r, `nwBring: ${selector} is in the page`)
    const plate = nwPlateOf(v, { x: r.cx, y: r.cy })
    const [tx, ty] = nwPanFor(v, plate, { x: v.frame.left + v.W * fx, y: v.frame.top + v.H * fy })
    await nwPanTo(page, tx, ty)
    const now = await nwRect(page, selector, index)
    const hit = await page.evaluate(
      ([sel, x, y]) => {
        const top = document.elementFromPoint(x, y)
        return Boolean(top && top.closest(sel))
      },
      [selector, now.cx, now.cy],
    )
    if (hit) return now
  }
  throw new Error(`nwBring: ${selector} never came clear`)
}

/** A point of open map, `room` px from every frame edge and off every control and actor. */
async function nwOpenGround(page, room = 70) {
  const v = await nwView(page)
  const point = await page.evaluate(
    ([f, r]) => {
      for (let y = f.top + f.H * 0.28; y < f.top + f.H * 0.72; y += 18) {
        for (let x = f.left + r; x < f.left + f.W - r; x += 18) {
          const top = document.elementFromPoint(x, y)
          if (!top || !top.closest('.defend-board')) continue
          if (top.closest('.defend-raider, .defend-pad, .defend-walker-tap, .defend-clear-lamp, .defend-tower-card, .nw-rail, .nw-docks, .nw-hud, .nw-balloon-slot')) continue
          let clear = true
          for (const [dx, dy] of [[0, -r], [0, r], [-r, 0], [r, 0]]) {
            const near = document.elementFromPoint(x + dx, y + dy)
            if (!near || near.closest('.nw-docks, .nw-rail, .nw-hud, .defend-tower-card')) clear = false
          }
          if (clear) return { x, y }
        }
      }
      return null
    },
    [{ top: v.frame.top, left: v.frame.left, W: v.W, H: v.H }, room],
  )
  assert.ok(point, 'nwOpenGround: open ground to start a drag')
  return point
}

function nwNear(a, b, tol, label) {
  assert.ok(Math.abs(a - b) <= tol, `${label}: ${a.toFixed(2)} vs ${b.toFixed(2)} (±${tol})`)
}

function nwHits(a, b, pad = 0) {
  return a.left < b.right + pad && a.right > b.left - pad && a.top < b.bottom + pad && a.bottom > b.top - pad
}

async function nwHeavenRail(page) {
  return page.evaluate(() => {
    const sign = document.querySelector('.defend-board g.defend-heaven')
    const rail = document.querySelector('.nw-rail')
    if (!sign || !rail) return { area: 0, shown: false }
    const a = sign.getBoundingClientRect()
    const b = rail.getBoundingClientRect()
    const shown = a.width > 0.5
    if (!shown) return { area: 0, shown: false }
    const left = Math.max(a.left, b.left)
    const right = Math.min(a.right, b.right)
    const top = Math.max(a.top, b.top)
    const bottom = Math.min(a.bottom, b.bottom)
    const area = left < right && top < bottom ? (right - left) * (bottom - top) : 0
    return { area, shown: true }
  })
}

async function nwHeavenWatch(page, stop = false) {
  if (!stop) {
    await page.evaluate(() => {
      window.__nwHeavenMax = 0
      window.__nwHeavenHid = 0
      let running = true
      window.__nwHeavenStop = () => {
        running = false
      }
      const tick = () => {
        if (!running) return
        const sign = document.querySelector('.defend-board g.defend-heaven')
        const rail = document.querySelector('.nw-rail')
        if (sign && rail) {
          const a = sign.getBoundingClientRect()
          const b = rail.getBoundingClientRect()
          const shown = a.width > 0.5
          if (!shown) window.__nwHeavenHid += 1
          else {
            const left = Math.max(a.left, b.left)
            const right = Math.min(a.right, b.right)
            const top = Math.max(a.top, b.top)
            const bottom = Math.min(a.bottom, b.bottom)
            const area = left < right && top < bottom ? (right - left) * (bottom - top) : 0
            if (area > window.__nwHeavenMax) window.__nwHeavenMax = area
          }
        }
        requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
    })
    return null
  }
  return page.evaluate(() => {
    window.__nwHeavenStop?.()
    return { max: window.__nwHeavenMax ?? 0, hid: window.__nwHeavenHid ?? 0 }
  })
}

/** Seats and arches the clamp keeps under the bottom chrome: judged by their centre, and counted. */
const nwEdgeCases = []

/** Whole bbox clears the chrome. At a clamp edge the pan cannot go further, so the centre (a tap on the seat) must stay off the chrome instead. */
function nwClears(view, rect, boxes, label) {
  const edge =
    Math.abs(view.tx) < 1 || Math.abs(view.tx - (view.W - view.world.w)) < 1 || Math.abs(view.ty) < 1 || Math.abs(view.ty - (view.H - view.world.h)) < 1
  const mid = { left: (rect.left + rect.right) / 2, right: (rect.left + rect.right) / 2, top: (rect.top + rect.bottom) / 2, bottom: (rect.top + rect.bottom) / 2 }
  for (const sel of NW_CHROME) {
    const box = boxes[sel]
    if (!box) continue
    if (!nwHits(rect, box, 8)) continue
    assert.ok(edge, `${label} clears ${sel}`)
    assert.equal(nwHits(mid, box, 0), false, `${label} centre is not under ${sel} at the clamp edge`)
    nwEdgeCases.push(`${label} ${sel}`)
  }
}

async function nwChrome(page) {
  const out = {}
  for (const sel of NW_CHROME) out[sel] = await nwRect(page, sel)
  return out
}

async function nwBegin(page, where = '') {
  const started = () => page.locator('.defend-page.is-easy-tap').waitFor({ timeout: 2500 }).then(() => true, () => false)
  // A jump seeds one lamp. On a map where it cannot reach the road Begin warns, so plant on real seats until it can.
  const seatCount = await page.locator('.defend-plant-ground circle.is-live').count()
  for (let seat = -1; seat < seatCount; seat += 1) {
    if (seat >= 0) {
      const v = await nwView(page)
      const at = await page.evaluate((i) => {
        const c = [...document.querySelectorAll('.defend-plant-ground circle.is-live')].filter((n) => n.getBoundingClientRect().width > 1)[i]
        return c ? { x: Number(c.getAttribute('cx')), y: Number(c.getAttribute('cy')) } : null
      }, seat)
      if (!at) break
      const [tx, ty] = focusPan(at, v.W, v.H, nwK(v).s0, v.z, camFrameInsets(v.frame.top))
      await nwPanTo(page, tx, ty)
      const now = await nwView(page)
      const k = nwK(now).s0 * now.z
      await page.mouse.click(now.frame.left + now.tx + at.x * k, now.frame.top + now.ty + at.y * k)
      await page.waitForTimeout(250)
    }
    await page.locator('.defend-go').click()
    if (await started()) return
  }
  throw new Error(`${where} the wave did not start`)
}

/** Wave started under ?nwDebug=1, so the countdown and walkers sit still until Resume. */
async function nwWalkers(page, want = 3) {
  await page.getByRole('button', { name: 'Resume walkers' }).click()
  await page.waitForFunction(
    (n) => document.querySelectorAll('.defend-walker-tap').length >= n,
    want,
    { timeout: 30_000 },
  )
  await page.getByRole('button', { name: 'Pause walkers' }).click()
  await page.waitForTimeout(150)
}

async function nwPlantOne(page, v, seat) {
  const k = nwK(v).s0 * v.z
  return { x: seat.cx, y: seat.cy + 26 * k }
}

// -- 1. Plant step: on state, seats, clamp, inverse, insets, reach ----------------------------

async function proveNwPlant(browser, origin, size, slug, errorsOut) {
  const where = `${slug} ${size[0]}x${size[1]}`
  const id = nwId(slug)
  const { ctx, page, errors, consoleErrors } = await nwOpen(browser, origin, size, slug)
  try {
    const v = await nwView(page)
    assert.equal(v.on, 'on', `nwPan on: ${where} camera is on`)
    nwNear(v.z, NW_CAMERA_ZOOM[id], 1e-6, `${where} zoom`)
    assert.ok(Math.abs(v.world.w - 798 * nwK(v).s0 * NW_CAMERA_ZOOM[id]) < 0.5, `${where} world width ${v.world.w}`)
    const drawn = await page.evaluate(() => document.querySelector('.nw-zoom').offsetWidth)
    assert.ok(Math.abs(drawn - 798 * nwK(v).s0) < 1, `${where} the board draws ${drawn} wide`)
    const open = focusPan(NW_CAMERA_FOCUS[id], v.W, v.H, nwK(v).s0, v.z, camFrameInsets(v.frame.top))
    nwNear(v.tx, open[0], 1, `${where} opens on the focus (x)`)
    nwNear(v.ty, open[1], 1, `${where} opens on the focus (y)`)

    const rc = await nwRect(page, '.nw-cam-recenter')
    assert.ok(rc, `${where} Recenter shows`)
    nwNear(rc.width, 48, 0.5, `${where} Recenter width`)
    nwNear(rc.height, 48, 0.5, `${where} Recenter height`)
    nwNear(v.frame.right - rc.right, 8, 1, `${where} Recenter right gap`)
    nwNear(v.frame.bottom - rc.bottom, 8, 1, `${where} Recenter bottom gap`)
    assert.equal(await page.locator('.nw-cam-recenter').getAttribute('aria-label'), 'Recenter map')
    assert.equal(await page.getByRole('button', { name: 'Recenter map' }).count(), 1, `${where} Recenter has its name`)
    const paint = await page.evaluate(() => {
      const st = getComputedStyle(document.querySelector('.nw-cam-recenter'))
      return { bg: st.backgroundColor, border: st.borderTopColor, img: st.backgroundImage }
    })
    assert.equal(isGoldPaint(paint.bg) || isGoldPaint(paint.border), false, `${where} Recenter is not gold ${JSON.stringify(paint)}`)
    const chrome = await nwChrome(page)
    for (const sel of ['.defend-go', '.nw-skill-tray', '.nw-rail']) {
      const box = await nwRect(page, sel)
      if (box) assert.equal(nwHits(rc, box), false, `${where} Recenter clears ${sel}`)
    }

    // 2. Seats are fingertip size.
    const floor = size[0] === 375 ? 64 : 44
    const seats = await page.evaluate(() =>
      [...document.querySelectorAll('.defend-plant-ground circle.is-live')]
        .map((c) => {
          const r = c.getBoundingClientRect()
          return { w: r.width, h: r.height, cx: Number(c.getAttribute('cx')), cy: Number(c.getAttribute('cy')) }
        })
        .filter((s) => s.w > 1),
    )
    assert.ok(seats.length > 0, `${where} has live seats`)
    for (const seat of seats) assert.ok(seat.w >= floor && seat.h >= floor, `nwPan seats: ${where} a seat is ${seat.w.toFixed(1)}x${seat.h.toFixed(1)}`)

    // 14. Insets hold.
    assert.ok(chrome['.nw-hud'].bottom <= 89.5, `nwPan insets: ${where} hud bottom ${chrome['.nw-hud'].bottom}`)
    assert.ok(chrome['.defend-go'].top >= (size[0] === 375 ? 602 : 779) - 0.5, `${where} Begin top ${chrome['.defend-go'].top}`)
    assert.ok(chrome['.nw-rail'].left >= (size[0] === 375 ? 310 : 325) - 0.5, `${where} rail left ${chrome['.nw-rail'].left}`)
    if (size[0] === 390) assert.ok(chrome['.nw-rail'].bottom <= 314.5, `${where} rail bottom ${chrome['.nw-rail'].bottom}`)

    // 15. Reach, plant step: every live seat can be centred clear of the chrome.
    for (const seat of seats) {
      const now = await nwView(page)
      const [tx, ty] = focusPan({ x: seat.cx, y: seat.cy }, now.W, now.H, nwK(now).s0, now.z, camFrameInsets(now.frame.top))
      await nwPanTo(page, tx, ty)
      const ring = await page.evaluate(
        ([cx, cy]) => {
          const c = [...document.querySelectorAll('.defend-plant-ground circle.is-live')].find(
            (n) => Number(n.getAttribute('cx')) === cx && Number(n.getAttribute('cy')) === cy,
          )
          const r = c?.getBoundingClientRect()
          return r ? { left: r.left, top: r.top, right: r.right, bottom: r.bottom } : null
        },
        [seat.cx, seat.cy],
      )
      assert.ok(ring, `${where} seat ${seat.cx},${seat.cy} is drawn`)
      const fr = (await nwView(page)).frame
      assert.ok(ring.left >= fr.left - 0.5 && ring.right <= fr.right + 0.5 && ring.top >= fr.top - 0.5 && ring.bottom <= fr.bottom + 0.5, `nwPan reach: ${where} seat ${seat.cx},${seat.cy} is in view ${JSON.stringify(ring)}`)
      const boxes = await nwChrome(page)
      nwClears(await nwView(page), ring, boxes, `${where} seat ${seat.cx},${seat.cy}`)
    }

    // 3. Clamp: about 2000 px of drag each way.
    const reachX = v.W - 90
    const reachY = Math.round(v.H * 0.6)
    const clampRead = async (label) => {
      const now = await nwView(page)
      assert.ok(now.tx <= 0.6 && now.tx >= v.W - now.world.w - 0.6, `nwPan clamp: ${where} ${label} tx ${now.tx}`)
      assert.ok(now.ty <= 0.6 && now.ty >= v.H - now.world.h - 0.6, `${where} ${label} ty ${now.ty}`)
      assert.ok(now.plate.left <= now.frame.left + 0.6 && now.plate.right >= now.frame.right - 0.6, `${where} ${label} no void left/right`)
      assert.ok(now.plate.top <= now.frame.top + 0.6 && now.plate.bottom >= now.frame.bottom - 0.6, `${where} ${label} no void top/bottom`)
      return now
    }
    const y = v.frame.top + v.H * 0.5
    const x = v.frame.left + v.W * 0.4
    for (let i = 0; i < Math.ceil(2000 / reachX); i += 1) await nwGesture(page, [{ x: v.frame.left + 30, y }, { x: v.frame.left + 30 + reachX, y }], 4)
    let edge = await clampRead('dragged right')
    nwNear(edge.tx, 0, 0.6, `${where} stops at the left plate edge`)
    for (let i = 0; i < Math.ceil(2000 / reachX); i += 1) await nwGesture(page, [{ x: v.frame.left + 30 + reachX, y }, { x: v.frame.left + 30, y }], 4)
    edge = await clampRead('dragged left')
    nwNear(edge.tx, v.W - edge.world.w, 0.6, `${where} stops at the right plate edge`)
    for (let i = 0; i < Math.ceil(2000 / reachY); i += 1) await nwGesture(page, [{ x, y: v.frame.top + 70 }, { x, y: v.frame.top + 70 + reachY }], 4)
    edge = await clampRead('dragged down')
    nwNear(edge.ty, 0, 0.6, `${where} stops at the top plate edge`)
    for (let i = 0; i < Math.ceil(2000 / reachY); i += 1) await nwGesture(page, [{ x, y: v.frame.top + 70 + reachY }, { x, y: v.frame.top + 70 }], 4)
    edge = await clampRead('dragged up')
    nwNear(edge.ty, v.H - edge.world.h, 0.6, `${where} stops at the bottom plate edge`)

    // 4. Inverse transform: the svg matrix and camToPlate agree.
    await nwPanMid(page)
    await nwGesture(page, [{ x: v.frame.left + v.W * 0.5, y: v.frame.top + v.H * 0.5 }, { x: v.frame.left + v.W * 0.5 - 60, y: v.frame.top + v.H * 0.5 - 80 }], 5)
    const moved = await nwView(page)
    const pts = [[0.2, 0.2], [0.8, 0.2], [0.5, 0.5], [0.2, 0.8], [0.8, 0.8]].map(([fx, fy]) => ({ x: moved.frame.left + moved.W * fx, y: moved.frame.top + moved.H * fy }))
    const real = await page.evaluate((list) => {
      const svg = document.querySelector('.defend-board')
      const inv = svg.getScreenCTM().inverse()
      return list.map((p) => {
        const q = svg.createSVGPoint()
        q.x = p.x
        q.y = p.y
        const r = q.matrixTransform(inv)
        return { x: r.x, y: r.y }
      })
    }, pts)
    pts.forEach((p, i) => {
      const mine = nwPlateOf(moved, p)
      nwNear(real[i].x, mine.x, 0.5, `nwPan inverse: ${where} point ${i} x`)
      nwNear(real[i].y, mine.y, 0.5, `${where} point ${i} y`)
    })
    // Recenter puts it back.
    const rcBox = await nwRect(page, '.nw-cam-recenter')
    await page.mouse.click(rcBox.cx, rcBox.cy)
    await page.waitForTimeout(100)
    const home = await nwView(page)
    nwNear(home.tx, open[0], 1, `${where} Recenter restores x`)
    nwNear(home.ty, open[1], 1, `${where} Recenter restores y`)
  } finally {
    assert.deepEqual(errors, [], `${where} page errors`)
    errorsOut.push(...consoleErrors.filter((text) => !/Failed to load resource/.test(text)))
    await ctx.close()
  }
}

// -- 2. Mid-wave: tray inset and spawn arch reach ----------------------------------------------

async function proveNwWaveReach(browser, origin, size, slug, errorsOut) {
  const where = `${slug} ${size[0]}x${size[1]} wave`
  const { ctx, page, errors, consoleErrors } = await nwOpen(browser, origin, size, slug, { query: '&nwRound=3&nwDebug=1' })
  try {
    await nwBegin(page, where)
    const tray = await nwRect(page, '.nw-skill-tray')
    const hud = await nwRect(page, '.nw-hud')
    const rail = await nwRect(page, '.nw-rail')
    assert.ok(tray && hud && rail, `${where} chrome is up`)
    assert.ok(hud.bottom <= 89.5, `nwPan insets: ${where} hud bottom ${hud.bottom}`)
    if (size[0] === 375 && size[1] === 667) {
      await page.screenshot({ path: `${SHOTS}/nw-easy-hud-wave-375x667.png` })
    }
    assert.ok(tray.top >= (size[0] === 390 ? 736 : 736 - (844 - size[1])) - 0.5, `${where} tray top ${tray.top}`)
    assert.ok(rail.left >= (size[0] === 375 ? 310 : 325) - 0.5, `${where} rail left ${rail.left}`)
    const markers = await page.evaluate(() =>
      [...document.querySelectorAll('[data-spawn-marker]')].map((node) => ({
        id: node.getAttribute('data-spawn-marker'),
        x: Number(node.getAttribute('x')) + Number(node.getAttribute('width')) / 2,
        y: Number(node.getAttribute('y')) + Number(node.getAttribute('height')) / 2,
      })),
    )
    assert.ok(markers.length > 0, `${where} has spawn arches`)
    for (const marker of markers) {
      const now = await nwView(page)
      const [tx, ty] = focusPan(marker, now.W, now.H, nwK(now).s0, now.z, camFrameInsets(now.frame.top))
      await nwPanTo(page, tx, ty)
      const box = await page.evaluate((mid) => {
        const node = document.querySelector(`[data-spawn-marker="${mid}"]`)
        const r = node.getBoundingClientRect()
        return { left: r.left, top: r.top, right: r.right, bottom: r.bottom }
      }, marker.id)
      const fr = (await nwView(page)).frame
      assert.ok(box.left >= fr.left - 0.5 && box.right <= fr.right + 0.5 && box.top >= fr.top - 0.5 && box.bottom <= fr.bottom + 0.5, `nwPan reach: ${where} arch ${marker.id} is in view ${JSON.stringify(box)}`)
      const boxes = await nwChrome(page)
      nwClears(await nwView(page), box, boxes, `${where} arch ${marker.id}`)
    }
  } finally {
    assert.deepEqual(errors, [], `${where} page errors`)
    errorsOut.push(...consoleErrors.filter((text) => !/Failed to load resource/.test(text)))
    await ctx.close()
  }
}

// -- 3. Plant-step gestures --------------------------------------------------------------------

async function proveNwPlantGestures(browser, origin, size, slug, errorsOut) {
  const where = `${slug} ${size[0]}x${size[1]} plant`
  const { ctx, page, errors, consoleErrors } = await nwOpen(browser, origin, size, slug)
  try {
    const lamps = () => nwCount(page, '.defend-clear-lamp')
    const ghosts = () => nwCount(page, '.defend-ghost')
    const seatSpot = async (index) => {
      const v = await nwView(page)
      const seat = await page.evaluate((i) => {
        const c = [...document.querySelectorAll('.defend-plant-ground circle.is-live')].filter((n) => n.getBoundingClientRect().width > 1)[i]
        return c ? { cx: Number(c.getAttribute('cx')), cy: Number(c.getAttribute('cy')) } : null
      }, index)
      assert.ok(seat, `${where} live seat ${index}`)
      const [tx, ty] = focusPan({ x: seat.cx, y: seat.cy }, v.W, v.H, nwK(v).s0, v.z, camFrameInsets(v.frame.top))
      await nwPanTo(page, tx, ty)
      const now = await nwView(page)
      const k = nwK(now).s0 * now.z
      return { x: now.frame.left + now.tx + seat.cx * k, y: now.frame.top + now.ty + (seat.cy + 26) * k }
    }
    assert.equal(await lamps(), 0, `${where} starts with no lamp`)

    // 7. A drag from a seat plants nothing and leaves no ghost.
    let spot = await seatSpot(0)
    let before = await nwView(page)
    let d = nwDir(before)
    await nwGesture(page, [spot, { x: spot.x + d * 15, y: spot.y - 15 }, { x: spot.x + d * 40, y: spot.y - 10 }], 4)
    let after = await nwView(page)
    assert.ok(Math.abs(after.tx - before.tx) + Math.abs(after.ty - before.ty) > 20, `nwPan drag: ${where} a 40px drag from a seat pans`)
    assert.equal(await lamps(), 0, `${where} the drag plants nothing`)
    assert.equal(await ghosts(), 0, `${where} the drag leaves no ghost`)
    assert.equal(await nwCount(page, '.defend-tower-card'), 0, `${where} the drag opens no card`)

    // 6. Slop edge: 9 px pans, 7 px plants.
    spot = await seatSpot(0)
    before = await nwView(page)
    d = nwDir(before)
    await nwGesture(page, [spot, { x: spot.x + d * 9, y: spot.y }], 2)
    after = await nwView(page)
    assert.ok(Math.abs(after.tx - before.tx - d * 9) < 1, `nwPan slop: ${where} a 9px move pans (${after.tx - before.tx})`)
    assert.equal(await lamps(), 0, `${where} a 9px move plants nothing`)
    spot = await seatSpot(0)
    before = await nwView(page)
    await nwGesture(page, [spot, { x: spot.x + 7, y: spot.y }], 2)
    after = await nwView(page)
    assert.equal(after.tx, before.tx, `${where} a 7px move does not pan`)
    await page.waitForFunction(() => document.querySelectorAll('.defend-clear-lamp').length === 1, null, { timeout: 3000 })
    assert.equal(await lamps(), 1, `${where} a 7px move is a tap and plants`)

    // 11. Upgrade strip closes on a pan. 8. A drag from a lamp opens no card.
    const lamp = await nwBring(page, '.defend-clear-lamp')
    await page.mouse.click(lamp.cx, lamp.cy)
    await page.locator('.defend-tower-card').waitFor({ timeout: 3000 })
    assert.equal(await nwCount(page, '.defend-tower-card'), 1, `${where} a tap on the lamp opens its card`)
    const ground = await nwOpenGround(page, 40)
    await nwGesture(page, [ground, { x: ground.x - 20, y: ground.y }], 3)
    assert.equal(await nwCount(page, '.defend-tower-card'), 0, `nwPan strip: ${where} a 20px pan closes the card`)
    const pinned = await nwBring(page, '.defend-clear-lamp')
    before = await nwView(page)
    d = nwDir(before)
    await nwGesture(page, [{ x: pinned.cx, y: pinned.cy }, { x: pinned.cx + d * 10, y: pinned.cy }, { x: pinned.cx + d * 20, y: pinned.cy }], 2)
    after = await nwView(page)
    assert.ok(Math.abs(after.tx - before.tx) > 10, `${where} a drag from the lamp pans`)
    assert.equal(await nwCount(page, '.defend-tower-card'), 0, `${where} a drag from the lamp opens no card`)

    // 10. Recenter in the plant step plants nothing.
    const count = await lamps()
    const rc = await nwRect(page, '.nw-cam-recenter')
    await page.mouse.click(rc.cx, rc.cy)
    await page.waitForTimeout(150)
    assert.equal(await lamps(), count, `nwPan recenter: ${where} a Recenter tap plants nothing`)
    const v = await nwView(page)
    const open = focusPan(NW_CAMERA_FOCUS[nwId(slug)], v.W, v.H, nwK(v).s0, v.z, camFrameInsets(v.frame.top))
    nwNear(v.tx, open[0], 1, `${where} Recenter restores x`)

    // 13. Tab onto an off-screen lamp pans it into the clear window.
    await nwPanTo(page, v.tx > (v.W - v.world.w) / 2 ? 0 : v.W - v.world.w, v.ty > (v.H - v.world.h) / 2 ? 0 : v.H - v.world.h)
    const far = await page.evaluate(() => {
      const r = document.querySelector('.defend-clear-lamp').getBoundingClientRect()
      const f = document.querySelector('.nw-cam').getBoundingClientRect()
      return r.left < f.left || r.right > f.right || r.top < f.top || r.bottom > f.bottom
    })
    assert.ok(far, `${where} the lamp starts off-screen`)
    await page.locator('.nw-cam').focus()
    let landed = false
    for (let i = 0; i < 12 && !landed; i += 1) {
      await page.keyboard.press('Tab')
      landed = await page.evaluate(() => document.activeElement?.classList.contains('defend-clear-lamp'))
    }
    assert.ok(landed, `${where} Tab reaches the lamp`)
    await page.waitForTimeout(100)
    const seen = await nwRect(page, '.defend-clear-lamp')
    const sv = await nwView(page)
    const insets = camFrameInsets(sv.frame.top)
    assert.ok(seen.left >= sv.frame.left - 1 && seen.right <= sv.frame.right + 1, `nwPan keys: ${where} Tab brings the lamp in across ${JSON.stringify(seen)}`)
    assert.ok(seen.top >= sv.frame.top + insets.top - 1 && seen.bottom <= sv.frame.bottom - insets.bottom + 1, `${where} Tab brings the lamp inside the clear window ${JSON.stringify(seen)}`)

    // 9. Chrome never pans (last: a rail drag may start a lamp drag).
    const t0 = await nwView(page)
    for (const sel of ['.defend-go', '.nw-balloon-slot', '.nw-cam-recenter', '.nw-rail']) {
      const box = await nwRect(page, sel)
      assert.ok(box, `${where} ${sel} is up`)
      // The balloon slot lets taps through to the map, so only a button the finger can land on is chrome.
      const lands = await page.evaluate(([q, x, y]) => Boolean(document.elementFromPoint(x, y)?.closest(q)), [sel, box.cx, box.cy])
      if (!lands) continue
      // A release back inside the button is a click, so a button drag ends outside it.
      const to = { x: box.cx, y: box.cy - box.height / 2 - 24 }
      await nwGesture(page, [{ x: box.cx, y: box.cy }, to], 4)
      const t1 = await nwView(page)
      assert.deepEqual([t1.tx, t1.ty], [t0.tx, t0.ty], `nwPan chrome: ${where} a drag from ${sel} leaves the map`)
    }
  } finally {
    assert.deepEqual(errors, [], `${where} page errors`)
    errorsOut.push(...consoleErrors.filter((text) => !/Failed to load resource/.test(text)))
    await ctx.close()
  }
}

// -- 4. Mid-wave gestures, walkers paused ------------------------------------------------------

async function proveNwWaveGestures(browser, origin, size, slug, errorsOut) {
  const where = `${slug} ${size[0]}x${size[1]} wave`
  const { ctx, page, errors, consoleErrors } = await nwOpen(browser, origin, size, slug, { query: '&nwRound=3&nwDebug=1' })
  try {
    await nwBegin(page)
    await nwWalkers(page, 3)
    const id = nwId(slug)

    // 12. The world moves with the pan. The chrome does not.
    await nwPanMid(page)
    const track = ['image.nw-feature', '[data-spawn-marker]', '.defend-clear-lamp', '.defend-walker-tap', '.nw-hud', '.nw-rail', '.nw-skill-tray']
    const pos = async () => {
      const out = {}
      for (const sel of track) out[sel] = await nwRect(page, sel)
      return out
    }
    const was = await pos()
    const v0 = await nwView(page)
    const ground = await nwOpenGround(page)
    await nwGesture(page, [ground, { x: ground.x - 30, y: ground.y - 40 }, { x: ground.x - 60, y: ground.y - 80 }], 3)
    const v1 = await nwView(page)
    nwNear(v1.tx - v0.tx, -60, 1, `nwPan moves: ${where} pan x`)
    nwNear(v1.ty - v0.ty, -80, 1, `${where} pan y`)
    const now = await pos()
    for (const sel of ['[data-spawn-marker]', '.defend-clear-lamp', '.defend-walker-tap']) {
      assert.ok(was[sel] && now[sel], `${where} ${sel} is on the map`)
      nwNear(now[sel].left - was[sel].left, -60, 1, `${where} ${sel} moves x`)
      nwNear(now[sel].top - was[sel].top, -80, 1, `${where} ${sel} moves y`)
    }
    if (was['image.nw-feature'] && now['image.nw-feature']) {
      nwNear(now['image.nw-feature'].left - was['image.nw-feature'].left, -60, 1, `${where} feature moves x`)
      nwNear(now['image.nw-feature'].top - was['image.nw-feature'].top, -80, 1, `${where} feature moves y`)
    }
    for (const sel of ['.nw-hud', '.nw-rail', '.nw-skill-tray']) {
      assert.deepEqual(now[sel], was[sel], `${where} ${sel} stays put`)
    }

    // 5. A tap with a 3px wobble pops a face.
    let face = await nwBring(page, '.defend-walker-tap')
    let taps = await nwTaps(page)
    await page.mouse.move(face.cx, face.cy)
    await page.mouse.down()
    await page.mouse.move(face.cx + 3, face.cy, { steps: 2 })
    await page.mouse.up()
    await page.waitForTimeout(200)
    let next = await nwTaps(page)
    assert.equal(next.hits, taps.hits + 1, `nwPan tap: ${where} a 3px wobble pops the face`)
    assert.equal(next.misses, taps.misses, `${where} the pop is no miss`)

    // 6. A 7px move is a tap, a 9px move is a pan.
    face = await nwBring(page, '.defend-walker-tap')
    taps = await nwTaps(page)
    let before = await nwView(page)
    await page.mouse.move(face.cx, face.cy)
    await page.mouse.down()
    await page.mouse.move(face.cx + 7, face.cy, { steps: 2 })
    await page.mouse.up()
    await page.waitForTimeout(200)
    next = await nwTaps(page)
    assert.equal(next.hits, taps.hits + 1, `nwPan slop: ${where} a 7px move still pops`)
    assert.equal((await nwView(page)).tx, before.tx, `${where} a 7px move does not pan`)
    face = await nwBring(page, '.defend-walker-tap')
    taps = await nwTaps(page)
    before = await nwView(page)
    const d9 = nwDir(before)
    await nwGesture(page, [{ x: face.cx, y: face.cy }, { x: face.cx + d9 * 9, y: face.cy }], 2)
    next = await nwTaps(page)
    assert.ok(Math.abs((await nwView(page)).tx - before.tx - d9 * 9) < 1, `${where} a 9px move pans`)
    assert.deepEqual(next, taps, `${where} a 9px move pops nothing and misses nothing`)

    // 7. A 40px drag from open ground moves the map and taps nothing.
    const g2 = await nwOpenGround(page)
    taps = await nwTaps(page)
    const lamps = await nwCount(page, '.defend-clear-lamp')
    before = await nwView(page)
    const d7 = nwDir(before)
    await nwGesture(page, [g2, { x: g2.x + d7 * 20, y: g2.y }, { x: g2.x + d7 * 40, y: g2.y }], 3)
    const dragged = await nwView(page)
    assert.ok(Math.abs(dragged.tx - before.tx) > 20, `nwPan drag: ${where} a 40px drag moves the map`)
    assert.deepEqual(await nwTaps(page), taps, `${where} the drag is no hit and no miss`)
    assert.equal(await nwCount(page, '.defend-clear-lamp'), lamps, `${where} the drag plants nothing`)
    assert.equal(await nwCount(page, '.defend-tower-card'), 0, `${where} the drag opens no card`)

    // 8. A 20px drag from a face pans and pops nothing. A drag from a lamp opens no card.
    face = await nwBring(page, '.defend-walker-tap')
    taps = await nwTaps(page)
    before = await nwView(page)
    const d8 = nwDir(before)
    await nwGesture(page, [{ x: face.cx, y: face.cy }, { x: face.cx + d8 * 10, y: face.cy + 4 }, { x: face.cx + d8 * 20, y: face.cy + 8 }], 2)
    assert.ok(Math.abs((await nwView(page)).tx - before.tx) > 10, `nwPan walker: ${where} a drag from a face pans`)
    assert.deepEqual(await nwTaps(page), taps, `${where} the drag from a face pops nothing and misses nothing`)
    const lamp = await nwBring(page, '.defend-clear-lamp')
    before = await nwView(page)
    const d8l = nwDir(before)
    await nwGesture(page, [{ x: lamp.cx, y: lamp.cy }, { x: lamp.cx + d8l * 10, y: lamp.cy }, { x: lamp.cx + d8l * 20, y: lamp.cy }], 2)
    assert.ok(Math.abs((await nwView(page)).tx - before.tx) > 10, `${where} a drag from a lamp pans`)
    assert.equal(await nwCount(page, '.defend-tower-card'), 0, `${where} the drag from a lamp opens no card`)

    // 10. Recenter mid-wave is not a miss.
    taps = await nwTaps(page)
    const rc = await nwRect(page, '.nw-cam-recenter')
    await page.mouse.click(rc.cx, rc.cy)
    await page.waitForTimeout(150)
    assert.deepEqual(await nwTaps(page), taps, `nwPan recenter: ${where} a Recenter tap is not a miss`)
    const home = await nwView(page)
    const open = focusPan(NW_CAMERA_FOCUS[id], home.W, home.H, nwK(home).s0, home.z, camFrameInsets(home.frame.top))
    nwNear(home.tx, open[0], 1, `${where} Recenter restores x`)
    nwNear(home.ty, open[1], 1, `${where} Recenter restores y`)

    // 13. Keys.
    await nwPanMid(page)
    await page.locator('.nw-cam').focus()
    const k0 = await nwView(page)
    await page.keyboard.press('ArrowRight')
    const lo = k0.W - k0.world.w
    nwNear((await nwView(page)).tx, Math.max(lo, k0.tx - 40), 0.5, `nwPan keys: ${where} ArrowRight`)
    await page.keyboard.press('Shift+ArrowRight')
    nwNear((await nwView(page)).tx, Math.max(lo, k0.tx - 160), 0.5, `${where} Shift+ArrowRight`)
    await page.keyboard.press('ArrowDown')
    nwNear((await nwView(page)).ty, Math.max(k0.H - k0.world.h, k0.ty - 40), 0.5, `${where} ArrowDown`)
    await page.keyboard.press('Home')
    const k1 = await nwView(page)
    nwNear(k1.tx, open[0], 1, `${where} Home restores x`)
    nwNear(k1.ty, open[1], 1, `${where} Home restores y`)

    // 9. Chrome never pans mid-wave either.
    const t0 = await nwView(page)
    for (const sel of ['.nw-skill-tray .btn', '.nw-pace', '.nw-cam-recenter', '.nw-balloon-slot']) {
      const box = await nwRect(page, sel)
      assert.ok(box, `${where} ${sel} is up`)
      const lands = await page.evaluate(([q, x, y]) => Boolean(document.elementFromPoint(x, y)?.closest(q)), [sel, box.cx, box.cy])
      if (!lands) continue
      await nwGesture(page, [{ x: box.cx, y: box.cy }, { x: box.cx, y: box.cy - box.height / 2 - 24 }], 4)
      const t1 = await nwView(page)
      assert.deepEqual([t1.tx, t1.ty], [t0.tx, t0.ty], `nwPan chrome: ${where} a drag from ${sel} leaves the map`)
    }
  } finally {
    assert.deepEqual(errors, [], `${where} page errors`)
    errorsOut.push(...consoleErrors.filter((text) => !/Failed to load resource/.test(text)))
    await ctx.close()
  }

  const touch = await nwOpen(browser, origin, size, slug, { query: '&nwRound=3&nwDebug=1', touch: true })
  try {
    await nwBegin(touch.page)
    await nwWalkers(touch.page, 3)
    let face = await nwBring(touch.page, '.defend-walker-tap')
    const before = await nwView(touch.page)
    await touchDrag(touch.page, { x: face.cx, y: face.cy }, { x: face.cx + nwDir(before) * 40, y: face.cy })
    const after = await nwView(touch.page)
    assert.ok(Math.abs(after.tx - before.tx) > 20, `${where} a finger drag from a face pans`)
    const taps = await nwTaps(touch.page)
    // Chromium swallows a tap that follows a scroll gesture within a beat.
    await touch.page.waitForTimeout(700)
    face = await nwBring(touch.page, '.defend-walker-tap')
    await touch.page.touchscreen.tap(face.cx, face.cy)
    await touch.page.waitForTimeout(250)
    const next = await nwTaps(touch.page)
    assert.equal(next.hits, taps.hits + 1, `${where} a finger tap pops the face`)
    assert.equal(next.misses, taps.misses, `${where} the finger tap is no miss`)
  } finally {
    assert.deepEqual(touch.errors, [], `${where} touch page errors`)
    errorsOut.push(...touch.consoleErrors.filter((text) => !/Failed to load resource/.test(text)))
    await touch.ctx.close()
  }
}

// -- 4b. Heaven sign vs rail and Recenter after edge drags (#818) --------------------------------

async function proveNwHeavenSteps(page, slug, size, errorsOut, { wave = false } = {}) {
  const where = `${slug} ${size[0]}x${size[1]}`
  const v0 = await nwView(page)
  let open = await nwHeavenRail(page)
  assert.equal(open.area, 0, `nwPan heaven: ${where} at open the sign is clear of the rail ${JSON.stringify(open)}`)
  assert.equal(open.shown, true, `nwPan heaven: ${where} at open the sign is visible`)

  const txStar = await page.evaluate(({ tx, W, worldW }) => {
    const sign = document.querySelector('.defend-board g.defend-heaven')?.getBoundingClientRect()
    const rail = document.querySelector('.nw-rail')?.getBoundingClientRect()
    if (!sign || !rail) return (W - worldW) / 2
    const star = tx + (rail.left + rail.width / 2 - (sign.left + sign.width / 2))
    const lo = W - worldW
    return Math.min(0, Math.max(lo, star))
  }, { tx: v0.tx, W: v0.W, worldW: v0.world.w })
  const pans = [
    [0, 0],
    [v0.W - v0.world.w, 0],
    [(v0.W - v0.world.w) / 2, 0],
    [txStar, 0],
    [v0.W - v0.world.w, v0.H - v0.world.h],
  ]

  for (const [tx, ty] of pans) {
    await nwPanTo(page, tx, ty)
    await page.waitForTimeout(80)
    const read = await nwHeavenRail(page)
    assert.equal(read.area, 0, `nwPan heaven: ${where} at tx=${tx.toFixed(0)},ty=${ty.toFixed(0)} ${JSON.stringify(read)}`)
  }

  await nwPanTo(page, 0, 0)
  await nwHeavenWatch(page, false)
  const frame = (await nwView(page)).frame
  const W = size[0]
  const H = size[1]
  for (let drag = 0; drag < 6; drag += 1) {
    const v = await nwView(page)
    if (Math.abs(v.tx - (v.W - v.world.w)) < 1) break
    await nwGesture(
      page,
      [
        { x: frame.left + W * 0.85, y: frame.top + H * 0.4 },
        { x: frame.left + W * 0.05, y: frame.top + H * 0.4 },
      ],
      40,
    )
    await page.waitForTimeout(80)
  }
  for (let drag = 0; drag < 6; drag += 1) {
    const v = await nwView(page)
    if (Math.abs(v.tx) < 1) break
    await nwGesture(
      page,
      [
        { x: frame.left + W * 0.05, y: frame.top + H * 0.4 },
        { x: frame.left + W * 0.85, y: frame.top + H * 0.4 },
      ],
      40,
    )
    await page.waitForTimeout(80)
  }
  const sample = await nwHeavenWatch(page, true)
  assert.equal(sample.max, 0, `nwPan heaven: ${where} live sweep max overlap ${JSON.stringify(sample)}`)
  assert.ok(sample.hid > 0, `nwPan heaven: ${where} sweep hid the sign at least once ${JSON.stringify(sample)}`)

  const rc = await nwRect(page, '.nw-cam-recenter')
  if (rc) await page.mouse.click(rc.cx, rc.cy)
  await page.waitForTimeout(200)
  const after = await nwHeavenRail(page)
  assert.equal(after.shown, true, `nwPan heaven: ${where} sign shows again after Recenter`)
  return wave ? 'wave ok' : 'plant ok'
}

async function proveNwHeaven(browser, origin, size, slug, errorsOut, { query = '' } = {}) {
  const where = `${slug} ${size[0]}x${size[1]}${query ? ' wave' : ''}`
  const { ctx, page, errors, consoleErrors } = await nwOpen(browser, origin, size, slug, { query })
  try {
    assert.equal(await page.locator('[data-nw-cam="on"]').count(), 1, `${where} camera on`)
    if (query.includes('nwRound=6')) await nwBegin(page, where)
    await proveNwHeavenSteps(page, slug, size, errorsOut, { wave: query.includes('nwRound=6') })
    return where
  } finally {
    assert.deepEqual(errors, [], `${where} page errors`)
    errorsOut.push(...consoleErrors.filter((text) => !/Failed to load resource/.test(text)))
    await ctx.close()
  }
}

async function proveNwHeavenBoost(browser, origin, size, slug, errorsOut) {
  const where = `${slug} ${size[0]}x${size[1]} boost`
  const { ctx, page, errors, consoleErrors } = await nwOpen(browser, origin, size, slug, { query: '&nwRound=6' })
  try {
    await nwBegin(page, where)
    const started = Date.now()
    while (Date.now() - started < 90_000 && (await page.locator('.defend-page.is-boost').count()) < 1) {
      const cue = await page.evaluate(() => {
        const face = document.querySelector('.defend-raider.is-easy-cue')
        if (!face) return null
        const id = face.getAttribute('data-walker-id')
        const tap = document.querySelector(`[data-walker-tap="${id}"]`)
        if (!tap) return null
        const box = tap.getBoundingClientRect()
        const x = box.x + box.width / 2
        const y = box.y + box.height / 2
        const node = document.elementFromPoint(x, y)
        if (node?.closest?.('[data-walker-tap]')?.getAttribute('data-walker-tap') !== id) return null
        return { x, y }
      })
      if (cue) await page.mouse.click(cue.x, cue.y)
      await page.waitForTimeout(80)
    }
    assert.ok((await page.locator('.defend-page.is-boost').count()) >= 1, 'R6 boost not reached')
    await proveNwHeavenSteps(page, slug, size, errorsOut, { wave: true })
    return where
  } finally {
    assert.deepEqual(errors, [], `${where} page errors`)
    errorsOut.push(...consoleErrors.filter((text) => !/Failed to load resource/.test(text)))
    await ctx.close()
  }
}

async function proveNwRecenterAfterEdge(browser, origin, size, slug, { swallow = false } = {}) {
  const where = `${slug} ${size[0]}x${size[1]}${swallow ? ' swallow' : ''}`
  const { ctx, page, errors, consoleErrors } = await nwOpen(browser, origin, size, slug, { touch: true })
  try {
    await page.evaluate((on) => {
      window.__nwSwallow = 0
      window.__nwRailClick = 0
      window.__nwSwallowOn = on
      window.addEventListener(
        'click',
        (event) => {
          if (event.target instanceof Element && event.target.closest('.nw-cam-recenter')) {
            if (window.__nwSwallowOn) {
              window.__nwSwallow += 1
              window.__nwSwallowOn = false
              event.stopImmediatePropagation()
              event.preventDefault()
            }
          }
          if (event.target instanceof Element && event.target.closest('.nw-rail button.defend-ability')) {
            window.__nwRailClick += 1
          }
        },
        true,
      )
    }, swallow)

    await nwPanTo(page, 0, 0)
    const v0 = await nwView(page)
    const frame = v0.frame
    const W = size[0]
    const H = size[1]
    const from = { x: frame.left + W * 0.4, y: frame.top + H * 0.45 }
    const to = { x: from.x + 300, y: from.y + 300 }
    await touchDrag(page, from, to, 10, 12)
    await touchDrag(page, from, to, 10, 12)
    const pinned = await nwView(page)
    nwNear(pinned.tx, 0, 1, `${where} pinned x`)
    nwNear(pinned.ty, 0, 1, `${where} pinned y`)

    await page.waitForTimeout(800)
    const lampsBefore = await nwCount(page, '.defend-clear-lamp')
    const tapsBefore = await nwTaps(page)
    const rc = await nwRect(page, '.nw-cam-recenter')
    assert.ok(rc, `${where} Recenter visible`)
    await page.touchscreen.tap(rc.cx, rc.cy)
    await page.waitForTimeout(300)
    const v1 = await nwView(page)
    const open = focusPan(NW_CAMERA_FOCUS[nwId(slug)], v1.W, v1.H, nwK(v1).s0, v1.z, camFrameInsets(v1.frame.top))
    nwNear(v1.tx, open[0], 1, `${where} Recenter pan x`)
    nwNear(v1.ty, open[1], 1, `${where} Recenter pan y`)
    assert.equal(await nwCount(page, '.defend-clear-lamp'), lampsBefore, `${where} Recenter plants nothing`)
    assert.deepEqual(await nwTaps(page), tapsBefore, `${where} Recenter is not a miss`)
    assert.equal(await nwCount(page, '.defend-tower-card'), 0, `${where} no tower card`)

    await page.touchscreen.tap(rc.cx, rc.cy)
    await page.waitForTimeout(100)
    const vDedupe = await nwView(page)
    nwNear(vDedupe.tx, open[0], 1, `${where} dedupe pan x`)
    nwNear(vDedupe.ty, open[1], 1, `${where} dedupe pan y`)

    if (!swallow) {
      await page.waitForTimeout(850)
      await nwGesture(page, [{ x: frame.left + W * 0.5, y: frame.top + H * 0.5 }, { x: frame.left + W * 0.5 + 40, y: frame.top + H * 0.5 }], 4)
      await page.mouse.click(rc.cx, rc.cy)
      await page.waitForTimeout(200)
      const vRecent = await nwView(page)
      nwNear(vRecent.tx, open[0], 1, `${where} mouse Recenter x`)
      await nwGesture(page, [{ x: frame.left + W * 0.5, y: frame.top + H * 0.5 }, { x: frame.left + W * 0.5 + 40, y: frame.top + H * 0.5 }], 4)
      await page.waitForTimeout(500)
      const vStay = await nwView(page)
      assert.ok(Math.abs(vStay.tx - vRecent.tx) > 5 || Math.abs(vStay.ty - vRecent.ty) > 5, `${where} no second fallback recenter`)
    }

    if (swallow) {
      await nwPanTo(page, 0, 0)
      await touchDrag(page, from, to, 10, 12)
      await touchDrag(page, from, to, 10, 12)
      await page.waitForTimeout(800)
      await page.evaluate(() => {
        window.__nwSwallowOn = true
      })
      await page.touchscreen.tap(rc.cx, rc.cy)
      await page.waitForTimeout(300)
      const vSw = await nwView(page)
      nwNear(vSw.tx, open[0], 1, `${where} swallow fallback x`)
      const swallowed = await page.evaluate(() => window.__nwSwallow)
      assert.ok(swallowed >= 1, `${where} click was swallowed`)
    }

    await nwPanTo(page, 0, 0)
    await touchDrag(page, from, to, 10, 12)
    await touchDrag(page, from, to, 10, 12)
    await page.waitForTimeout(800)
    const railBtn = page.locator('.nw-rail button.defend-ability').first()
    const railBox = await railBtn.boundingBox()
    assert.ok(railBox, `${where} rail ability`)
    await page.evaluate(() => {
      window.__nwRailClick = 0
    })
    await page.touchscreen.tap(railBox.x + railBox.width / 2, railBox.y + railBox.height / 2)
    await page.waitForTimeout(200)
    const railClicks = await page.evaluate(() => window.__nwRailClick)
    assert.ok(railClicks >= 1, `${where} rail button got a click after edge drags`)

    return where
  } finally {
    assert.deepEqual(errors, [], `${where} page errors`)
    await ctx.close()
  }
}

// -- 5. Off paths ------------------------------------------------------------------------------

async function assertNwHeavenOff(page, label) {
  const read = await page.evaluate(() => {
    const sign = document.querySelector('.defend-board g.defend-heaven')
    const tuck = sign?.getAttribute('data-heaven-tuck')
    const a = sign?.getBoundingClientRect()
    const rail = document.querySelector('.nw-rail .defend-abilities')?.getBoundingClientRect()
    const hit =
      a && rail && a.width > 0.5 && a.left < rail.right && a.right > rail.left && a.top < rail.bottom && a.bottom > rail.top
    return { tuck, shown: (a?.width ?? 0) > 0.5, hit }
  })
  assert.notEqual(read.tuck, 'hide', `${label} Heaven never uses camera hide tuck`)
  assert.equal(read.shown, true, `${label} Heaven sign is visible`)
  assert.equal(read.hit, false, `${label} Heaven sign clear of the lamp rail`)
}

async function proveNwOff(browser, origin, errorsOut) {
  for (const size of NW_SIZES) {
    const where = `${size[0]}x${size[1]}`
    const { ctx, page, errors, consoleErrors } = await nwOpen(browser, origin, size, 'a2', { query: '&nwCam=0' }).catch((error) => {
      throw new Error(`nwCam=0 at ${where}: ${error.message}`)
    })
    try {
      assert.equal(await page.locator('.nw-cam').getAttribute('data-nw-cam'), 'off', `nwPan off: ${where} ?nwCam=0 turns the camera off`)
      assert.equal(await page.locator('.nw-cam-recenter').count(), 0, `${where} no Recenter when off`)
      const read = await page.evaluate(() => {
        const svg = document.querySelector('.defend-board')
        const r = svg.getBoundingClientRect()
        return { vb: svg.getAttribute('viewBox'), w: r.width, h: r.height }
      })
      assert.equal(read.vb, boardFillBox({ w: read.w, h: read.h }), `${where} the viewBox is boardFillBox`)
      await assertNwHeavenOff(page, `nwPan off: ${where}`)
    } finally {
      assert.deepEqual(errors, [], `${where} page errors`)
      errorsOut.push(...consoleErrors.filter((text) => !/Failed to load resource/.test(text)))
      await ctx.close()
    }
  }

  const wide = await nwOpen(browser, origin, [768, 1024], 'a2')
  try {
    assert.equal(await wide.page.locator('.nw-cam').getAttribute('data-nw-cam'), 'off', 'nwPan off: 768 keeps the camera off')
    assert.equal(await wide.page.locator('.nw-cam-recenter').count(), 0, '768 has no Recenter')
    await assertNwHeavenOff(wide.page, 'nwPan off: 768')
  } finally {
    assert.deepEqual(wide.errors, [], '768 page errors')
    errorsOut.push(...wide.consoleErrors.filter((text) => !/Failed to load resource/.test(text)))
    await wide.ctx.close()
  }

  // Hard: save with easyMode false (no Settings toggle). The Developer jump forces Easy.
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 })
  await ctx.addInitScript(
    ([storageKey, raw]) => {
      localStorage.clear()
      localStorage.setItem(storageKey, raw)
    },
    [STORAGE_KEY, JSON.stringify(hopSave({ easyMode: false }))],
  )
  const page = await ctx.newPage()
  const errors = []
  const consoleErrors = []
  page.on('pageerror', (error) => errors.push(String(error)))
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text())
  })
  try {
    await page.goto(`${origin}?playtest=1`)
    await page.getByRole('button', { name: 'Town' }).first().click()
    await page.getByRole('button', { name: 'Hold the night' }).first().click()
    await page.locator('.defend-board').waitFor()
    assert.equal(await page.locator('.defend-page.is-easy-watch').count(), 0, 'nwPan hard: this is the Hard night')
    assert.equal(await page.locator('[data-nw-cam="on"]').count(), 0, 'nwPan hard: Hard has no camera')
    assert.equal(await page.locator('.defend-page').getAttribute('data-night-map'), 'a2', 'Hard loads A2')
    assert.equal(await page.locator('.nw-seat-arrow, .nw-cam-recenter').count(), 0, 'Hard has no camera chrome and no edge arrow')
    const savedMode = await page.evaluate((key) => (({ progress, easyMode }) => progress?.easyMode ?? easyMode)(JSON.parse(localStorage.getItem(key) ?? '{}')), STORAGE_KEY)
    assert.equal(savedMode, false, 'the saved mode is Hard (easyMode false in save), not the Developer jump Easy')
    // The Begin button pulses, so tap its middle by hand and again if the first press lands on a still-moving frame.
    for (let attempt = 0; attempt < 6 && (await page.locator('.defend-go').count()); attempt += 1) {
      const box = await page.getByRole('button', { name: 'The road is coming' }).boundingBox()
      if (box) await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2)
      await page.waitForTimeout(700)
    }
    assert.equal(await page.locator('.defend-go').count(), 0, 'Hard: the round starts')
    await page.waitForTimeout(500)
    assert.equal(await page.locator('[data-nw-cam="on"]').count(), 0, 'Hard still has no camera once a round starts')
    const hardHeaven = await page.evaluate(() => {
      const sign = document.querySelector('g.defend-heaven')
      return { tuck: sign?.getAttribute('data-heaven-tuck') ?? null, cam: document.querySelector('[data-nw-cam="on"]') }
    })
    assert.equal(hardHeaven.cam, null, 'Hard has no camera on node')
    assert.equal(hardHeaven.tuck, null, 'Hard Heaven has no data-heaven-tuck')
    assert.deepEqual(errors, [], 'Hard page errors')
    assert.deepEqual(consoleErrors.filter((text) => !/Failed to load resource/.test(text)), [], 'Hard console errors')
  } finally {
    await ctx.close()
  }
}

// -- 6. Gold first seat and tower taps in the top and bottom bands (#834) -----------------------

/** #818 C: the first-seat ring and its painted stroke sit fully inside the screen (no edge clip). Null when no ring. */
async function nwRingInScreen(page) {
  return page.evaluate(() => {
    const n = document.querySelector('.defend-plant-ground circle.is-first-seat')
    if (!n) return null
    const r = n.getBoundingClientRect()
    const f = document.querySelector('.nw-cam').getBoundingClientRect()
    const pad = (parseFloat(getComputedStyle(n).strokeWidth) / 2) * (r.width / 92)
    const left = Math.max(f.left, 0)
    const right = Math.min(f.right, innerWidth)
    return {
      ok: r.left - pad >= left - 0.5 && r.right + pad <= right + 0.5,
      box: [r.left - pad, r.right + pad].map((x) => +x.toFixed(1)),
      screen: [left, right],
      slide: n.getAttribute('transform'),
    }
  })
}

/** Gold first-seat rings, and how many of them sit whole in the clear window (frame minus header, Begin, rail, tray, Recenter). */
async function nwGoldCues(page) {
  const chrome = await nwChrome(page)
  const rc = await nwRect(page, '.nw-cam-recenter')
  const v = await nwView(page)
  const rings = await page.evaluate(() =>
    [...document.querySelectorAll('.defend-plant-ground circle.is-first-seat')].map((n) => {
      const r = n.getBoundingClientRect()
      const st = getComputedStyle(n)
      return { left: r.left, top: r.top, right: r.right, bottom: r.bottom, stroke: st.stroke }
    }),
  )
  const boxes = [...Object.values(chrome), rc].filter(Boolean)
  const visible = rings.filter(
    (r) =>
      r.left >= v.frame.left &&
      r.right <= v.frame.right &&
      r.top >= Math.max(v.frame.top, chrome['.nw-hud']?.bottom ?? 0) &&
      r.bottom <= v.frame.bottom &&
      !boxes.some((b) => nwHits(r, b, 0)),
  )
  return { total: rings.length, visible: visible.length, rings }
}

/**
 * Every gold cue showing in the viewport: gradients, backgrounds, borders, shadows and outlines on HTML (and its ::before/::after),
 * strokes and fills on SVG. Same gold test as isGoldPaint. The map road is board art, not a cue, so it is left out.
 */
async function nwAllGold(page) {
  return page.evaluate(() => {
    const goldish = (value) => {
      const re = /rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*([\d.]+))?/g
      let m
      while ((m = re.exec(value || ''))) {
        const r = +m[1], g = +m[2], b = +m[3], a = m[4] === undefined ? 1 : +m[4]
        if (a > 0.05 && r > 190 && g > 140 && b < 120 && r > b + 60 && g > b + 30) return true
      }
      return false
    }
    const found = []
    for (const el of document.querySelectorAll('.defend-page *')) {
      if (el.closest('path.defend-road, [hidden]')) continue
      for (const pseudo of [null, '::before', '::after']) {
        const s = getComputedStyle(el, pseudo)
        if (pseudo && s.content === 'none') continue
        if (s.display === 'none' || s.visibility === 'hidden' || Number(s.opacity) === 0) continue
        const r = el.getBoundingClientRect()
        if (r.width <= 0 || r.height <= 0 || r.right <= 0 || r.bottom <= 0 || r.left >= innerWidth || r.top >= innerHeight) continue
        const why = []
        if (el instanceof SVGElement) {
          if (s.stroke !== 'none' && parseFloat(s.strokeWidth) > 0 && goldish(s.stroke)) why.push('stroke')
          if (s.fill !== 'none' && goldish(s.fill)) why.push('fill')
        } else {
          if (goldish(s.backgroundImage)) why.push('gradient')
          if (goldish(s.backgroundColor)) why.push('background')
          if (['Top', 'Right', 'Bottom', 'Left'].some((side) => parseFloat(s[`border${side}Width`]) > 0 && s[`border${side}Style`] !== 'none' && goldish(s[`border${side}Color`]))) why.push('border')
          if (goldish(s.boxShadow)) why.push('shadow')
          if (parseFloat(s.outlineWidth) > 0 && s.outlineStyle !== 'none' && goldish(s.outlineColor)) why.push('outline')
        }
        if (why.length) found.push(`${el.tagName.toLowerCase()}.${String(el.getAttribute('class') ?? '').split(' ').filter(Boolean).slice(0, 3).join('.')}${pseudo ?? ''} (${why.join('+')})`)
      }
    }
    return found
  })
}

const NW_CORNERS = ['TL', 'TR', 'BL', 'BR']

/** Pan target for a corner of the world: the clamp's own limits. */
function nwCornerPan(v, corner) {
  const far = camClamp(-1e6, -1e6, v.W, v.H, v.world)
  const near = camClamp(1e6, 1e6, v.W, v.H, v.world)
  return [corner.endsWith('L') ? near[0] : far[0], corner.startsWith('T') ? near[1] : far[1]]
}

/** Share of a client rect that sits in the clear window (frame minus header, Begin, rail and tray), as the page counts it. */
function nwShareClear(v, rect) {
  const ins = camFrameInsets(v.frame.top)
  const left = rect.left - v.frame.left
  const top = rect.top - v.frame.top
  const right = rect.right - v.frame.left
  const bottom = rect.bottom - v.frame.top
  const inBand = bottom >= ins.rightBand[0] && top <= ins.rightBand[1]
  const w = Math.min(right, v.W - (inBand ? ins.right : 0)) - Math.max(left, 0)
  const h = Math.min(bottom, v.H - ins.bottom) - Math.max(top, ins.top)
  return w <= 0 || h <= 0 ? 0 : (w * h) / ((right - left) * (bottom - top))
}

/** Pan to each corner. One gold cue each time: a ring at 90% or more, or the arrow when no ring qualifies. */
async function proveNwCorners(page, where) {
  const rows = []
  for (const corner of NW_CORNERS) {
    const v0 = await nwView(page)
    const [tx, ty] = nwCornerPan(v0, corner)
    await nwPanTo(page, tx, ty)
    await page.waitForTimeout(120)
    const v = await nwView(page)
    const gold = await nwAllGold(page)
    assert.equal(gold.length, 1, `nwPan corner gold: ${where} ${corner} exactly one gold cue, saw ${gold.length}: ${gold.join(' | ')}`)
    const rings = await page.evaluate(() =>
      [...document.querySelectorAll('.defend-plant-ground circle.is-first-seat')].map((n) => {
        const r = n.getBoundingClientRect()
        return { left: r.left, top: r.top, right: r.right, bottom: r.bottom }
      }),
    )
    const arrow = await nwRect(page, '.nw-seat-arrow')
    if (rings.length) {
      assert.equal(rings.length, 1, `${where} ${corner} one ring`)
      assert.equal(arrow, null, `nwPan corner gold: ${where} ${corner} the arrow hides while a ring is in view`)
      assert.match(gold[0], /circle\..*is-first-seat/, `${where} ${corner} the gold is the ring`)
      const share = nwShareClear(v, rings[0])
      assert.ok(share >= 0.9 - 1e-6, `nwPan corner gold: ${where} ${corner} the ring shows ${(share * 100).toFixed(0)}% (needs 90%)`)
      const edge = await nwRingInScreen(page)
      assert.ok(edge?.ok, `nwPan corner gold: ${where} ${corner} the ring and its stroke sit inside the screen ${JSON.stringify(edge)}`)
      rows.push({ corner, kind: 'ring', share })
    } else {
      assert.ok(arrow, `nwPan corner gold: ${where} ${corner} no ring in view, so the arrow shows`)
      assert.match(gold[0], /button\.nw-seat-arrow/, `${where} ${corner} the gold is the arrow`)
      const boxes = [...Object.values(await nwChrome(page)), await nwRect(page, '.nw-cam-recenter'), await nwRect(page, '.nw-pace')].filter(Boolean)
      for (const box of boxes) assert.equal(nwHits(arrow, box, 0), false, `${where} ${corner} the arrow clears the chrome`)
      for (const button of await page.locator('.nw-docks button:not(.nw-seat-arrow)').all()) {
        const r = await button.boundingBox()
        if (r) assert.equal(nwHits(arrow, { left: r.x, top: r.y, right: r.x + r.width, bottom: r.y + r.height }, 0), false, `${where} ${corner} the arrow clears the docks`)
      }
      assert.ok(arrow.left >= v.frame.left && arrow.right <= v.frame.right && arrow.top >= v.frame.top && arrow.bottom <= v.frame.bottom, `${where} ${corner} the arrow is on screen`)
      rows.push({ corner, kind: 'arrow', share: 0 })
    }
  }
  // Tapping the arrow brings the seat back: one ring again, the arrow gone.
  const away = rows.find((row) => row.kind === 'arrow')
  if (away) {
    const v0 = await nwView(page)
    const [tx, ty] = nwCornerPan(v0, away.corner)
    await nwPanTo(page, tx, ty)
    await page.waitForTimeout(120)
    const box = await nwRect(page, '.nw-seat-arrow')
    assert.ok(box, `${where} the arrow is up for its recenter tap`)
    await page.mouse.click(box.cx, box.cy)
    await page.waitForTimeout(200)
    assert.equal(await nwCount(page, '.nw-seat-arrow'), 0, `${where} tapping the arrow brings a seat into view`)
    const back = await nwAllGold(page)
    assert.equal(back.length, 1, `${where} one gold cue after the arrow tap, saw ${back.join(' | ')}`)
  }
  return rows
}

/** Pre-plant, a real default view: exactly one gold first-seat ring, in view, and Recenter is not gold. */
async function proveNwGold(browser, origin, size, slug, errorsOut) {
  const where = `${slug} ${size[0]}x${size[1]} gold`
  const { ctx, page, errors, consoleErrors } = await nwOpen(browser, origin, size, slug)
  try {
    assert.equal(await nwCount(page, '.defend-clear-lamp'), 0, `${where} starts with no lamp`)
    assert.ok(await page.locator('.defend-page.is-need-lamp').count(), `${where} is waiting for the first lamp`)
    const gold = await nwGoldCues(page)
    assert.equal(gold.total, 1, `nwPan gold: ${where} one first-seat ring (${gold.total})`)
    assert.equal(gold.visible, 1, `nwPan gold: ${where} the ring is in view and clear of the chrome ${JSON.stringify(gold.rings)}`)
    const everyGold = await nwAllGold(page)
    assert.equal(everyGold.length, 1, `nwPan all gold: ${where} exactly one gold cue before planting, saw ${everyGold.length}: ${everyGold.join(' | ')}`)
    assert.match(everyGold[0], /circle\..*is-first-seat/, `${where} the one gold cue is the first-seat ring`)
    const edge = await nwRingInScreen(page)
    assert.ok(edge?.ok, `nwPan gold: ${where} the ring and its stroke sit inside the screen ${JSON.stringify(edge)}`)
    const paint = await page.evaluate(() => {
      const st = getComputedStyle(document.querySelector('.nw-cam-recenter'))
      return { bg: st.backgroundColor, border: st.borderTopColor }
    })
    assert.equal(isGoldPaint(paint.bg) || isGoldPaint(paint.border), false, `${where} Recenter is not gold`)
    // After a pan the ring is picked again: still exactly one, still in view.
    const v = await nwView(page)
    const to = await nwPanTo(page, nwClamp(v.tx - 120, v.W - v.world.w, 0), nwClamp(v.ty - 90, v.H - v.world.h, 0))
    const moved = await nwGoldCues(page)
    assert.ok(moved.total <= 1, `${where} at most one ring after a pan (${to.tx.toFixed(0)},${to.ty.toFixed(0)})`)
    const pannedGold = await nwAllGold(page)
    assert.equal(pannedGold.length, 1, `nwPan all gold: ${where} exactly one gold cue after a pan, saw ${pannedGold.length}: ${pannedGold.join(' | ')}`)
    // Corner pans: exactly one gold cue each, a ring that shows at least 90% of itself or else the edge arrow, never both.
    const corners = await proveNwCorners(page, where)
    return { total: gold.total, visible: gold.visible, panned: moved.visible, every: everyGold.length, everyPanned: pannedGold.length, corners }
  } finally {
    assert.deepEqual(errors, [], `${where} page errors`)
    errorsOut.push(...consoleErrors.filter((text) => !/Failed to load resource/.test(text)))
    await ctx.close()
  }
}

/**
 * Begin after a corner pan starts the night exactly once. `swallow` drops the click the way the lost-click device did
 * (pointer and touch events fire, no click follows), so the pointer-up fallback has to carry it.
 */
async function proveNwBegin(browser, origin, size, slug, corner, { swallow = false, touch = false } = {}) {
  const where = `${slug} ${size[0]}x${size[1]} ${corner} ${touch ? 'touch' : 'mouse'}${swallow ? ' no-click' : ''}`
  const { ctx, page, errors, consoleErrors } = await nwOpen(browser, origin, size, slug, { touch })
  try {
    await page.evaluate(() => {
      window.__nwStarts = 0
      const page = document.querySelector('.defend-page')
      let tapMode = page.classList.contains('is-easy-tap')
      new MutationObserver(() => {
        const now = page.classList.contains('is-easy-tap')
        if (now && !tapMode) window.__nwStarts += 1
        tapMode = now
      }).observe(page, { attributes: true, attributeFilter: ['class'] })
      window.__nwSwallow = 0
      window.addEventListener(
        'click',
        (event) => {
          if (window.__nwSwallowOn && event.target instanceof Element && event.target.closest('.defend-go')) {
            window.__nwSwallow += 1
            window.__nwSwallowOn = false
            event.stopImmediatePropagation()
            event.preventDefault()
          }
        },
        true,
      )
    })
    const seatCount = await page.locator('.defend-plant-ground circle.is-live').count()
    let started = false
    for (let seat = -1; seat < seatCount && !started; seat += 1) {
      if (seat >= 0) {
        const v = await nwView(page)
        const at = await page.evaluate((i) => {
          const c = [...document.querySelectorAll('.defend-plant-ground circle.is-live')].filter((n) => n.getBoundingClientRect().width > 1)[i]
          return c ? { x: Number(c.getAttribute('cx')), y: Number(c.getAttribute('cy')) } : null
        }, seat)
        if (!at) break
        const [px, py] = focusPan(at, v.W, v.H, nwK(v).s0, v.z, camFrameInsets(v.frame.top))
        await nwPanTo(page, px, py)
        const now = await nwView(page)
        const k = nwK(now).s0 * now.z
        await page.mouse.click(now.frame.left + now.tx + at.x * k, now.frame.top + now.ty + at.y * k)
        await page.waitForTimeout(250)
      }
      const v0 = await nwView(page)
      const [tx, ty] = nwCornerPan(v0, corner)
      await nwPanTo(page, tx, ty)
      await page.waitForTimeout(150)
      const go = await nwRect(page, '.defend-go')
      assert.ok(go, `${where} Begin is up after the pan`)
      await page.evaluate((on) => {
        window.__nwSwallowOn = on
      }, swallow)
      if (touch) await page.touchscreen.tap(go.cx, go.cy)
      else await page.mouse.click(go.cx, go.cy)
      started = await page.locator('.defend-page.is-easy-tap').waitFor({ timeout: 1800 }).then(() => true, () => false)
      await page.evaluate(() => {
        window.__nwSwallowOn = false
      })
    }
    assert.ok(started, `nwPan begin: ${where} the night starts after a corner pan`)
    await page.waitForTimeout(900)
    const read = await page.evaluate(() => ({ starts: window.__nwStarts, swallowed: window.__nwSwallow, go: document.querySelectorAll('.defend-go').length }))
    assert.equal(read.starts, 1, `nwPan begin: ${where} the night starts exactly once (saw ${read.starts})`)
    assert.equal(read.go, 0, `${where} Begin is gone once the night runs`)
    if (swallow) assert.ok(read.swallowed >= 1, `${where} the click really was dropped, so the fallback did the start`)
    return `${where} started once${swallow ? ' by the pointer-up fallback' : ''}`
  } finally {
    assert.deepEqual(errors, [], `${where} page errors`)
    await ctx.close()
  }
}

/** A tap (under the slop) on a planted lamp opens its card in the top and bottom bands, and never moves the camera. */
async function proveNwTapBands(browser, origin, size, slug, band, errorsOut, touch) {
  const where = `${slug} ${size[0]}x${size[1]} ${touch ? 'touch' : 'mouse'} ${band} band`
  const { ctx, page, errors, consoleErrors } = await nwOpen(browser, origin, size, slug, { touch })
  const tap = async (x, y) => {
    if (touch) await page.touchscreen.tap(x, y)
    else await page.mouse.click(x, y)
  }
  try {
    const v0 = await nwView(page)
    const seats = await page.evaluate(() =>
      [...document.querySelectorAll('.defend-plant-ground circle.is-live')].map((c) => ({ cx: Number(c.getAttribute('cx')), cy: Number(c.getAttribute('cy')) })),
    )
    assert.ok(seats.length > 0, `${where} has live seats`)
    // The top band needs a lamp that stands high on the plate, the bottom band one that stands low.
    const seat = seats.reduce((best, s) => ((band === 'top' ? s.cy < best.cy : s.cy > best.cy) ? s : best))
    const [px, py] = focusPan({ x: seat.cx, y: seat.cy }, v0.W, v0.H, nwK(v0).s0, v0.z, camFrameInsets(v0.frame.top))
    const at = await nwPanTo(page, px, py)
    const k0 = nwK(at).s0 * at.z
    await tap(at.frame.left + at.tx + seat.cx * k0, at.frame.top + at.ty + (seat.cy + 26) * k0)
    await page.waitForFunction(() => document.querySelectorAll('.defend-clear-lamp').length === 1, null, { timeout: 3000 })
    const insets = camFrameInsets(v0.frame.top)
    const v = await nwView(page)
    const k = nwK(v).s0 * v.z
    const first = await nwRect(page, '.defend-clear-lamp')
    const lampPlate = nwPlateOf(v, { x: first.cx, y: first.cy })
    const want = {
      x: v.frame.left + v.W * 0.4,
      y: band === 'top' ? v.frame.top + insets.top + 6 : v.frame.top + v.H - insets.bottom + 6,
    }
    const [tx, ty] = camClamp(want.x - v.frame.left - lampPlate.x * k, want.y - v.frame.top - lampPlate.y * k, v.W, v.H, v.world)
    await nwPanTo(page, tx, ty)
    await page.waitForTimeout(150)
    const lamp = await nwRect(page, '.defend-clear-lamp')
    const now = await nwView(page)
    const outside = lamp.top < now.frame.top + insets.top || lamp.bottom > now.frame.top + now.H - insets.bottom
    const hit = await page.evaluate(([x, y]) => Boolean(document.elementFromPoint(x, y)?.closest('.defend-clear-lamp')), [lamp.cx, lamp.cy])
    if (!outside || !hit) return `${band}: not reachable on this map (lamp y ${lamp.cy.toFixed(0)})`
    let held = lamp
    for (const wiggle of [0, 4]) {
      assert.equal(await nwCount(page, '.defend-tower-card'), 0, `${where} no card before the tap`)
      const before = await nwView(page)
      if (wiggle && !touch) await nwGesture(page, [{ x: held.cx, y: held.cy }, { x: held.cx + wiggle, y: held.cy }], 2)
      else await tap(held.cx, held.cy)
      await page.waitForTimeout(250)
      const after = await nwView(page)
      assert.equal(await nwCount(page, '.defend-tower-card'), 1, `nwPan tap band: ${where} tap at y ${held.cy.toFixed(0)} opens the card`)
      assert.deepEqual([after.tx, after.ty], [before.tx, before.ty], `${where} the tap leaves the camera`)
      // A pan closes the card. Put the lamp back in the band for the next tap.
      const ground = await nwOpenGround(page, 40)
      await nwGesture(page, [ground, { x: ground.x - nwDir(after) * 10, y: ground.y }, { x: ground.x - nwDir(after) * 20, y: ground.y }], 3)
      assert.equal(await nwCount(page, '.defend-tower-card'), 0, `${where} a pan closes the card`)
      await nwPanTo(page, tx, ty)
      await page.waitForTimeout(150)
      held = await nwRect(page, '.defend-clear-lamp')
    }
    // A drag from the lamp past the slop still pans.
    const lampNow = await nwBring(page, '.defend-clear-lamp')
    const before = await nwView(page)
    const d = nwDir(before)
    await nwGesture(page, [{ x: lampNow.cx, y: lampNow.cy }, { x: lampNow.cx + d * 12, y: lampNow.cy }, { x: lampNow.cx + d * 30, y: lampNow.cy }], 2)
    const after = await nwView(page)
    assert.ok(Math.abs(after.tx - before.tx) > 10, `${where} a drag from the lamp pans`)
    return `${band}: tap ok at y ${lamp.cy.toFixed(0)}`
  } finally {
    assert.deepEqual(errors, [], `${where} page errors`)
    errorsOut.push(...consoleErrors.filter((text) => !/Failed to load resource/.test(text)))
    await ctx.close()
  }
}

export async function proveNwPan(browser, origin) {
  const errors = []
  const lines = []
  for (const size of NW_SIZES) {
    for (const slug of NW_SLUGS) {
      await proveNwPlant(browser, origin, size, slug, errors)
      await proveNwWaveReach(browser, origin, size, slug, errors)
      lines.push(`nw-pan ${slug} ${size[0]}x${size[1]} ok`)
      const gold = await proveNwGold(browser, origin, size, slug, errors)
      lines.push(`nw-gold ${slug} ${size[0]}x${size[1]} first-seat cues in view ${gold.visible} of ${gold.total}, after a pan ${gold.panned}; all gold cues pre-plant ${gold.every}, panned ${gold.everyPanned}`)
      lines.push(
        `nw-gold-corners ${slug} ${size[0]}x${size[1]} ${gold.corners.map((row) => `${row.corner} ${row.kind}${row.kind === 'ring' ? ` ${(row.share * 100).toFixed(0)}%` : ''} (1 gold)`).join(', ')}`,
      )
    }
    for (const slug of ['a2', 'map05']) {
      for (const touch of [false, true]) {
        for (const band of ['top', 'bottom']) {
          const line = await proveNwTapBands(browser, origin, size, slug, band, errors, touch)
          if (band === 'bottom' || slug === 'a2') assert.ok(line.includes('tap ok'), `nwPan tap band: ${slug} ${size[0]}x${size[1]} ${line}`)
          lines.push(`nw-tap-bands ${slug} ${size[0]}x${size[1]} ${touch ? 'touch' : 'mouse'} ${line}`)
        }
      }
    }
    for (const slug of ['a2', 'far-hills']) {
      await proveNwPlantGestures(browser, origin, size, slug, errors)
      await proveNwWaveGestures(browser, origin, size, slug, errors)
      lines.push(`nw-pan gestures ${slug} ${size[0]}x${size[1]} ok`)
    }
  }
  for (const size of NW_SIZES) {
    // Every map, every corner, with the click dropped (the lost-click signature): the night starts exactly once.
    for (const slug of NW_SLUGS) {
      for (const corner of NW_CORNERS) lines.push(`nw-begin ${await proveNwBegin(browser, origin, size, slug, corner, { swallow: true })}`)
    }
    // And a normal click from a corner, so click and fallback never double up.
    for (const [slug, corner] of [['far-hills', 'TL'], ['map03', 'TL'], ['a2', 'BR']]) {
      lines.push(`nw-begin ${await proveNwBegin(browser, origin, size, slug, corner, { swallow: false })}`)
    }
    lines.push(`nw-begin ${await proveNwBegin(browser, origin, size, 'far-hills', 'TL', { touch: true })}`)
    lines.push(`nw-begin ${await proveNwBegin(browser, origin, size, 'map03', 'TL', { touch: true, swallow: true })}`)
  }
  for (const size of NW_HEAVEN_SIZES)
    for (const slug of NW_SLUGS) lines.push(`nw-heaven ${await proveNwHeaven(browser, origin, size, slug, errors)}`)
  for (const size of NW_HEAVEN_SIZES)
    for (const slug of ['a2', 'map05'])
      lines.push(`nw-heaven wave ${await proveNwHeaven(browser, origin, size, slug, errors, { query: '&nwRound=6&nwDebug=1' })}`)
  for (const size of [
    [390, 844],
    [412, 915],
  ])
    lines.push(`nw-heaven boost ${await proveNwHeavenBoost(browser, origin, size, 'a2', errors)}`)
  for (const size of [
    [375, 667],
    [412, 915],
  ])
    for (const slug of ['a2', 'far-hills'])
      for (const swallow of [false, true])
        lines.push(`nw-recenter-edge ${await proveNwRecenterAfterEdge(browser, origin, size, slug, { swallow })}`)
  await proveNwOff(browser, origin, errors)
  lines.push('nw-pan off paths and Hard ok')
  assert.deepEqual(errors, [], `nwPan console errors: ${errors.join('\n')}`)
  lines.push(`nw-pan clamp-edge cases judged by centre: ${nwEdgeCases.length}${nwEdgeCases.length ? `\n  ${nwEdgeCases.join('\n  ')}` : ''}`)
  return lines
}


export async function checkGoldenLive() {
  if ((process.env.GOLDEN_HOME_ONLY !== '1' && process.env.GOLDEN_NW_ONLY !== '1') || !existsSync('dist/sw.js')) await build({ logLevel: 'warn' })
  assert.ok(existsSync('dist/sw.js'), 'dist/sw.js exists')
  assert.equal(existsSync('dist/qa-seed.html'), false, 'dist/qa-seed.html is not shipped')
  for (const file of ['sw.js', ...readdirSync('dist').filter((name) => /^workbox-.*\.js$/.test(name))]) {
    // sw.js names qa-seed.html once in navigateFallbackDenylist on purpose. Only a precache entry is a leak.
    const text = readFileSync(`dist/${file}`, 'utf8')
    assert.doesNotMatch(text, /url:\s*["'`][^"'`]*qa-seed/, `dist/${file} does not precache qa-seed`)
  }
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
    if (process.env.GOLDEN_HOME_ONLY === '1') {
      console.log((await proveHomePan(browser, origin)).join('\n'))
      return
    }
    if (process.env.GOLDEN_NW_ONLY === '1') {
      console.log((await proveNwPan(browser, origin)).join('\n'))
      return
    }
    for (const [width, height] of SIZES) {
      const trace = []
      const seen = new Set()
      const context = await browser.newContext({ viewport: { width, height } })
      const page = await context.newPage()
      const errors = []
      watchSameOrigin(page, errors, origin)
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
      const freshDock = await homeLine(page)
      const freshGift = (await page.locator('.easy-build-gift').innerText()).replace(/\s+/g, ' ').trim()
      assert.equal(freshDock, 'Start your first road.', 'first Home dock is a first road')
      assert.equal(freshGift, 'Start your first road.', 'first Home gift matches the dock')
      const dupes = await page.locator('.easy-home-dock').evaluate((dock) =>
        [...dock.querySelectorAll('p')].filter((p) => p.textContent.trim() === 'Start your first road.' && p.getBoundingClientRect().height > 0).length)
      assert.equal(dupes, 1, 'Home 1 says Start your first road. once')
      assert.equal(await page.locator('.easy-home-whisper').count(), 0, 'no duplicate whisper on Home 1')
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
      }
      if ((width === 375 && height === 667) || (width === 390 && height === 844)) {
        await proveMazeDragAcceptance(page, {
          label: `${width}x${height} phase 1`,
          capture375: width === 375 && height === 667,
          origin,
        })
      }
      const mazeDragPhase2 =
        (width === 375 && height === 667) || (width === 390 && height === 844)
          ? `${width}x${height} phase 2`
          : undefined
      if (width === 375 || width === 768) await playRoadAdjacent(page, { mazeDragPhase2 })
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
      assert.equal(await page.locator('.easy-home-map .city-gift').count(), 0, 'Easy Home has no hidden town legend line')
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
      const tuningWhisper = await homeLine(page)
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
      await assertGemWinFold(page, 'ob-tuning')
      assertGemWinOneGold(page, 'ob-tuning')
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
        const creek = await homeLine(page)
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
        await assertGemWinFold(page, 'ph-debt')
        assertGemWinOneGold(page, 'ph-debt')
        await tapFilledGold(page)
        await page.locator('.why-blast').waitFor()
        await dragWhy(page, 'ph-debt')
        await assertLocked(page, 'ph-debt')
        await tapFilledGold(page)
        await page.locator('main.hub').waitFor()
        shot = await stamp('home-5')
        await assertNoNightWatch(page, 'home-5')
        assert.equal(shot.golds.length, 1, 'Home 5 has one gold')
        const home5 = await homeLine(page)
        assert.match(home5, /Find the words at Why Gate Arch\./)
        await shotHop(page, 'home-5')

        await tapFilledGold(page)
        await page.locator('.play.is-gem-search').waitFor()
        await playGem(page, 'fg-order', { checkStart: true })
        await page.locator('.play.is-gem-search.is-win .btn.primary').waitFor()
        await assertGemWinFold(page, 'fg-order')
        assertGemWinOneGold(page, 'fg-order')
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
        const home6 = await homeLine(page)
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
      assert.equal(errors.join('\n'), '', `${width}x${height} console/network errors`)
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
      await homeLine(humanPage),
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

    traces.push(await proveLockInEmptyTab(browser, origin))

    await proveNotQuite(browser, origin)
    await proveGemToast(browser, origin)
    traces.push('hop-b not-quite and gem toast')
    traces.push((await proveHomePan(browser, origin)).join('\n'))
    traces.push((await proveNwPan(browser, origin)).join('\n'))
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

export { proveLockInEmptyTab }

async function checkLockInEmptyOnly() {
  await build({ logLevel: 'warn' })
  const server = await preview({
    preview: { host: '127.0.0.1', port: 0 },
    logLevel: 'warn',
  })
  const address = server.httpServer?.address()
  const port = typeof address === 'object' && address ? address.port : 4173
  const origin = `http://127.0.0.1:${port}/`
  const browser = await launchBrowser()
  try {
    const text = await proveLockInEmptyTab(browser, origin)
    console.log(text)
    console.log('check-lock-in-empty: ok')
  } finally {
    await browser.close()
    await server.close()
  }
}

if (process.argv[1] && import.meta.url.endsWith(process.argv[1].split('/').pop())) {
  if (process.env.GOLDEN_LOCK_IN_EMPTY_ONLY === '1') await checkLockInEmptyOnly()
  else await checkGoldenLive()
}
