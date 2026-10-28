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

async function withPage(url, fn, { seed } = {}) {
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
        ({ key, save }) => {
          localStorage.setItem(key, JSON.stringify(save))
        },
        { key: STORAGE_KEY, save: seed },
      )
    }
    await page.goto(`http://127.0.0.1:${port}${url}`, { waitUntil: 'networkidle' })
    await fn(page)
  } finally {
    await browser.close()
    await server.close()
  }
}

function seedSave(intervalIndex = 1, lastFormat) {
  return {
    kind: SAVE_KIND,
    schemaVersion: SAVE_SCHEMA_VERSION,
    appVersion: '1.4.549',
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

await withPage(
  `/?quickReview=ph-road&reviewFormat=C&${PLAYTEST}`,
  async (page) => {
  const promptGold = await page.locator('.quick-review-plot-hit.is-now').count()
  assert.equal(promptGold, 1)
  await page.locator('.quick-review-plot-hit.is-now').click()
  await page.getByRole('button', { name: 'I had it' }).waitFor()
  const revealGold = await page.locator('.btn.gold, .is-now').count()
  assert.equal(revealGold, 1)
  },
  { seed: seedSave(1) },
)

await withPage(
  `/?quickReview=ph-road&reviewFormat=B&${PLAYTEST}`,
  async (page) => {
    await page.getByText('Think first…').waitFor()
    await page.waitForTimeout(3200)
    const drainGold = await page.locator('.quick-review-drain-bar.is-now').count()
    assert.equal(drainGold, 1)
    await page.locator('.match-card.recall-card').first().click()
    await page.getByRole('button', { name: 'Next' }).waitFor()
    const revealGold = await page.locator('.btn.gold').count()
    assert.equal(revealGold, 1)
  },
  { seed: seedSave(2) },
)

await withPage(
  `/?quickReview=ph-road&reviewFormat=A&${PLAYTEST}`,
  async (page) => {
  const faceGold = await page.locator('.quick-review-flip.is-now').count()
  assert.equal(faceGold, 1)
  await page.getByRole('button', { name: 'Show me' }).click()
  await page.getByRole('button', { name: 'I had it' }).waitFor()
  assert.equal(await page.locator('.btn.gold').count(), 1)
  },
  { seed: seedSave(1) },
)

const brief = evidenceFor('ph-road')
assert.ok(brief)
const digest = createHash('sha256').update(brief.claim).digest('hex')
assert.ok(digest.length === 64)

console.log('check-quick-review: ok')
