import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { fileURLToPath } from 'node:url'
import { createServer } from 'vite'
import { chromium } from '@playwright/test'
import { EASY_LINE_ORDER } from '../src/easyTrail/trail/loop.ts'
import { evidenceFor } from '../src/content/evidence.ts'
import { hashString, localDateKey } from '../src/lib/dates.ts'
import {
  applyMiss,
  applySuccess,
  emptyTrace,
} from '../src/lib/memory.ts'
import { needsTierHold } from '../src/lib/tiers.ts'
import {
  honestyCheckDue,
  pickFormat,
  reviewPrompt,
  reviewRung,
  reviewTargetLine,
} from '../src/easyTrail/review/reviewFormat.ts'
import { STORAGE_KEY } from '../src/config/app.ts'
import { lociStampFor } from '../src/lib/lociStamp.ts'
import { SAVE_KIND, SAVE_SCHEMA_VERSION } from '../src/lib/save.ts'

const quickSrc = readFileSync(
  new URL('../src/easyTrail/review/QuickReview.tsx', import.meta.url),
  'utf8',
)
assert.doesNotMatch(quickSrc, /recordHeld|recordLessonHold/)

const appSrc = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8')
assert.match(appSrc, /if \(isPlayBuild\(\)\) return null/, 'quickReviewBoot blocks Play builds')
assert.match(
  appSrc,
  /nightWatchJumpAllowed\(search, readNightWatchDebug\(\)\)/,
  'quickReviewBoot uses playtest gate',
)
const settingsSrc = readFileSync(new URL('../src/components/Settings.tsx', import.meta.url), 'utf8')
assert.match(settingsSrc, /nightWatchJumpAllowed\(/, 'Settings Quick review uses playtest gate')

const allowed = new Set([
  "What's the main idea?",
  "Where's it from?",
  'Show me',
  'I had it',
  'Not yet',
  'Why is it true?',
  'Think first…',
  '2 in a row',
  '3 in a row',
  'Next',
  'Home',
  'No review brief for this line.',
  'Settings',
  'Tap where you learned it',
  'Not here, try another spot.',
])

for (const id of EASY_LINE_ORDER.slice(0, 12)) {
  for (let interval = 0; interval <= 4; interval += 1) {
    assert.equal(reviewPrompt(interval), reviewPrompt(interval))
    const rung = reviewRung(interval)
    if (interval <= 1) assert.equal(reviewPrompt(interval), "What's the main idea?")
    if (interval === 2) assert.equal(reviewPrompt(interval), 'Why is it true?')
    if (interval >= 3) assert.equal(reviewPrompt(interval), "Where's it from?")
    const brief = evidenceFor(id)
    assert.ok(brief, id)
    const target = reviewTargetLine(brief, interval)
    if (rung === 'claim') assert.equal(target, brief.claim)
    if (rung === 'reason') assert.equal(target, brief.reason)
    if (rung === 'source') assert.equal(target, brief.source)
  }
}

for (let i = 0; i < 1000; i += 1) {
  const id = EASY_LINE_ORDER[i % EASY_LINE_ORDER.length]
  const today = `2026-01-${String((i % 28) + 1).padStart(2, '0')}`
  const last = i % 3 === 0 ? 'C' : i % 3 === 1 ? 'B' : 'A'
  const picked = pickFormat(id, today, last, undefined, 0)
  assert.notEqual(picked, last)
  assert.notEqual(picked, 'F')
}

let bCount = 0
for (let card = 0; card < 3; card += 1) {
  const sitting = { bUsed: bCount > 0 }
  const fmt = pickFormat('ph-road', '2026-10-27', card === 0 ? undefined : 'C', sitting, 0)
  if (fmt === 'B') bCount += 1
}
assert.ok(bCount <= 1, 'B at most once per 3-card sitting')

for (const id of EASY_LINE_ORDER.slice(0, 8)) {
  assert.notEqual(pickFormat(id, '2026-10-27', undefined, undefined, 4), 'B', `${id} source never B`)
}

for (let i = 0; i < 300; i += 1) {
  const id = EASY_LINE_ORDER[i % EASY_LINE_ORDER.length]
  assert.notEqual(
    pickFormat(id, '2026-10-28', i % 2 ? 'C' : 'A', { bUsed: i % 5 === 0 }, 0, { acOnly: true }),
    'B',
    'Home route never picks B',
  )
}

const weightCounts = { C: 0, B: 0, A: 0 }
for (let i = 0; i < 1000; i += 1) {
  const id = `line-${i}`
  const fmt = pickFormat(id, '2026-03-01', undefined, undefined, 0)
  weightCounts[fmt] += 1
}
for (const [fmt, expect] of [
  ['C', 55],
  ['B', 30],
  ['A', 15],
]) {
  const pct = (weightCounts[fmt] / 1000) * 100
  assert.ok(Math.abs(pct - expect) <= 5, `${fmt} weight ${pct} vs ${expect}`)
}

let honestyHits = 0
for (let i = 0; i < 900; i += 1) {
  const id = EASY_LINE_ORDER[i % EASY_LINE_ORDER.length]
  const today = `2026-02-${String((i % 28) + 1).padStart(2, '0')}`
  if (honestyCheckDue(id, today, 0)) honestyHits += 1
}
assert.ok(honestyHits > 250 && honestyHits < 350, `honesty ~1/3 got ${honestyHits}`)
assert.equal(honestyCheckDue('ph-road', '2026-10-27', 4), false)

const today = localDateKey()
const trace = emptyTrace('ph-road', 'parable-hollow', today)
const beforeHold = needsTierHold({ lessonScore: {}, lessonTier: {}, easyHeld: [] }, 'ph-road')
const afterSuccess = applySuccess(trace, today)
assert.equal(afterSuccess.intervalIndex, trace.intervalIndex + 1)
const afterMiss = applyMiss(trace, today)
assert.ok(afterMiss.nextReviewAt > today)
const afterHold = needsTierHold({ lessonScore: {}, lessonTier: {}, easyHeld: [] }, 'ph-road')
assert.equal(beforeHold, afterHold)

async function launchBrowser() {
  return chromium.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] })
}

async function withPage(url, fn, { seed, openDay } = {}) {
  const root = fileURLToPath(new URL('..', import.meta.url))
  const server = await createServer({
    root,
    server: { host: '127.0.0.1', port: 0 },
    logLevel: 'error',
  })
  await server.listen()
  const address = server.httpServer?.address()
  const port = address && typeof address === 'object' ? address.port : 0
  assert.ok(port > 0)
  const browser = await launchBrowser()
  const page = await browser.newPage()
  try {
    if (seed) {
      await page.addInitScript(
        ({ key, save, openDayKey, openDayValue }) => {
          localStorage.setItem(key, JSON.stringify(save))
          if (openDayValue) localStorage.setItem(openDayKey, openDayValue)
        },
        {
          key: STORAGE_KEY,
          save: seed,
          openDayKey: 'silver-city-easy-open-v1',
          openDayValue: openDay ?? '',
        },
      )
    }
    await page.goto(`http://127.0.0.1:${port}${url}`, { waitUntil: 'networkidle' })
    await fn(page)
  } finally {
    await browser.close()
    await server.close()
  }
}

function seedSave(intervalIndex = 1, lastFormat = undefined) {
  return {
    kind: SAVE_KIND,
    schemaVersion: SAVE_SCHEMA_VERSION,
    savedAt: new Date().toISOString(),
    progress: {
      started: true,
      easyMode: true,
      theme: 'candy',
      completed: ['ph-road'],
      memory: {
        'ph-road': {
          id: 'ph-road',
          pillar: 'parable-hollow',
          intervalIndex,
          nextReviewAt: today,
          reviews: intervalIndex,
          cleanRecalls: intervalIndex,
          elaborated: false,
          ...(lastFormat ? { lastFormat } : {}),
        },
      },
    },
  }
}

const PLAYTEST = 'playtest=1'

const hubSrc = readFileSync(new URL('../src/components/Hub.tsx', import.meta.url), 'utf8')
assert.match(hubSrc, /nightWatchJumpAllowed\(/, 'Hub Read review uses playtest gate')
assert.match(hubSrc, /from: 'home'/, 'Hub Read navigates home quick-review')

async function countGoldCues(page, scope = '.quick-review') {
  return page.evaluate(
    (scopeSel) => {
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
      const visible = (el) => {
        const st = getComputedStyle(el)
        const box = el.getBoundingClientRect()
        return st.display !== 'none' && st.visibility !== 'hidden' && box.width > 2 && box.height > 2
      }
      const root = document.querySelector(scopeSel) ?? document.body
      let cues = 0
      for (const sel of [
        '.btn.gold',
        '.quick-review-plot-hit.is-now',
        '.quick-review-prompt-panel.is-now',
        '.quick-review-flip.is-now',
        '.quick-review-drain-bar.is-now',
        '.quick-review-prompt.is-now',
      ]) {
        const el = root.querySelector(sel)
        if (el && visible(el)) cues += 1
      }
      for (const el of root.querySelectorAll('.text-link')) {
        if (!visible(el)) continue
        if (goldish(getComputedStyle(el).color)) cues += 1
      }
      for (const el of root.querySelectorAll('.quick-review-streak-pip.is-lit')) {
        if (!visible(el)) continue
        const st = getComputedStyle(el)
        if (goldish(st.backgroundColor) || goldish(st.boxShadow)) cues += 1
      }
      return cues
    },
    scope,
  )
}

async function assertOneGold(page, label) {
  const gold = await countGoldCues(page)
  assert.equal(gold, 1, `${label} has one gold cue (got ${gold})`)
}

const hubSeed = seedSave(1)

await withPage(
  '/',
  async (page) => {
    await page.getByRole('main', { name: 'Home' }).waitFor()
    const settings = page.locator('header').getByRole('button', { name: 'Settings', exact: true })
    await settings.scrollIntoViewIfNeeded()
    await settings.click()
    await page.locator('details.settings-debug summary').click()
    assert.equal(await page.locator('section[aria-label="Quick review"]').count(), 0)
  },
  { seed: hubSeed },
)

await withPage(
  '/?quickReview=ph-road',
  async (page) => {
    await page.getByRole('main', { name: 'Home' }).waitFor()
    assert.equal(await page.locator('.quick-review-prompt').count(), 0)
  },
  { seed: hubSeed },
)

async function assertFormatCBeforeTap(page, lineId) {
  assert.equal(await page.locator('.quick-review-plot-hit.is-now').count(), 0, 'no plot ring before tap')
  assert.equal(
    await page.locator('.quick-review-map-plate .quick-review-avatar').count(),
    0,
    'no guide portrait on map before tap',
  )
  await assertOneGold(page, `${lineId} format C prompt`)
}

async function assertFormatCReveal(page, lineId) {
  const briefLine = evidenceFor(lineId)
  assert.ok(briefLine, lineId)
  const claimEl = page.locator('.quick-review-reveal-claim')
  await claimEl.waitFor()
  assert.match((await claimEl.textContent()) ?? '', new RegExp(briefLine.claim.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))
  const claimPx = await claimEl.evaluate((el) => parseFloat(getComputedStyle(el).fontSize))
  assert.ok(claimPx >= 18, `claim font ${claimPx}px`)
  const sourceEl = page.locator('.quick-review-reveal-source')
  if (await sourceEl.count()) {
    assert.match((await sourceEl.textContent()) ?? '', new RegExp(briefLine.source.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))
  }
  await assertOneGold(page, `${lineId} format C reveal`)
}

async function tapCorrectPlot(page, lineId) {
  const plotId = lociStampFor(lineId).plotId
  await page.locator(`[data-plot-id="${plotId}"]`).click()
}

for (const viewport of [
  { width: 375, height: 667 },
  { width: 390, height: 844 },
]) {
  await withPage(
    `/?quickReview=ph-road&reviewFormat=C&${PLAYTEST}`,
    async (page) => {
      await page.setViewportSize(viewport)
      await assertFormatCBeforeTap(page, 'ph-road')
      await tapCorrectPlot(page, 'ph-road')
      await page.getByRole('button', { name: 'I had it' }).waitFor()
      await assertFormatCReveal(page, 'ph-road')
    },
    { seed: seedSave(1, 'A') },
  )
}

await withPage(
  `/?quickReview=ph-road&reviewFormat=B&${PLAYTEST}`,
  async (page) => {
    await page.getByText('Think first…').waitFor()
    await page.waitForTimeout(3200)
    await assertOneGold(page, 'format B drain')
    await page.locator('.match-card.recall-card').first().click()
    await page.getByRole('button', { name: 'Next' }).waitFor()
    await assertOneGold(page, 'format B reveal')
  },
  { seed: seedSave(2) },
)

await withPage(
  `/?quickReview=ph-road&reviewFormat=A&${PLAYTEST}`,
  async (page) => {
  await assertOneGold(page, 'format A prompt')
  await page.getByRole('button', { name: 'Show me' }).click()
  await page.getByRole('button', { name: 'I had it' }).waitFor()
  await assertOneGold(page, 'format A reveal')
  },
  { seed: seedSave(1) },
)

await withPage(
  `/?${PLAYTEST}`,
  async (page) => {
    await page.getByRole('main', { name: 'Home' }).waitFor()
    await page.getByRole('button', { name: /Read/i }).click()
    await page.locator('.quick-review').waitFor()
    await assertOneGold(page, 'Home Read queue card 1')
  },
  {
    seed: {
      kind: SAVE_KIND,
      schemaVersion: SAVE_SCHEMA_VERSION,
      appVersion: '1.4.551',
      savedAt: new Date().toISOString(),
      progress: {
        started: true,
        easyMode: true,
        theme: 'candy',
        completed: ['ph-road', 'ph-father'],
        easyHeld: ['ph-road'],
        lastDailyDate: '2026-01-01',
        memory: {
          'ph-road': {
            id: 'ph-road',
            pillar: 'parable-hollow',
            intervalIndex: 1,
            nextReviewAt: today,
            reviews: 1,
            cleanRecalls: 1,
            elaborated: false,
          },
        },
      },
    },
    openDay: '2026-01-01',
  },
)

await withPage(
  `/?quickReview=ph-father&reviewFormat=C&${PLAYTEST}`,
  async (page) => {
    await tapCorrectPlot(page, 'ph-father')
    await page.getByRole('button', { name: 'I had it' }).click()
    await page.getByText("Where's it from?").waitFor()
    assert.equal(await page.locator('.quick-review-reveal-panel').count(), 0)
    await assertFormatCBeforeTap(page, 'ph-father')
  },
  {
    seed: {
      kind: SAVE_KIND,
      schemaVersion: SAVE_SCHEMA_VERSION,
      appVersion: '1.4.551',
      savedAt: new Date().toISOString(),
      progress: {
        started: true,
        easyMode: true,
        theme: 'candy',
        completed: ['ph-road', 'ph-father'],
        memory: {
          'ph-father': {
            id: 'ph-father',
            pillar: 'parable-hollow',
            intervalIndex: 2,
            nextReviewAt: today,
            reviews: 2,
            cleanRecalls: 2,
            elaborated: false,
          },
        },
      },
    },
  },
)

await withPage(
  `/?quickReview=ph-father&reviewFormat=C&reviewStreak=2&${PLAYTEST}`,
  async (page) => {
    await page.locator('.quick-review-streak').waitFor()
    await tapCorrectPlot(page, 'ph-father')
    await page.getByRole('button', { name: 'I had it' }).waitFor()
    await assertFormatCReveal(page, 'ph-father')
    const pipGold = await page.evaluate(() => {
      const pip = document.querySelector('.quick-review-streak-pip.is-lit')
      if (!pip) return true
      const bg = getComputedStyle(pip).backgroundColor
      return /246,\s*194,\s*85|f6c255/i.test(bg)
    })
    assert.equal(pipGold, false, 'lit streak pips are not gold')
  },
  { seed: seedSave(1) },
)

const brief = evidenceFor('ph-road')
assert.ok(brief)
const digest = createHash('sha256').update(brief.claim).digest('hex')
assert.ok(digest.length === 64)

console.log('check-quick-review: ok')
