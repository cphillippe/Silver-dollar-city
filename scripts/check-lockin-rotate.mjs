#!/usr/bin/env node
/**
 * Runtime Lock In encode rotation (#963). Reads only the live DOM.
 * Fails on main (all A, repeats=9). Passes after rotation ships.
 */
import assert from 'node:assert/strict'
import { createServer } from 'vite'
import { chromium } from '@playwright/test'
import { SAVE_KIND } from '../src/lib/save.ts'
import { SAVE_SCHEMA_VERSION, STORAGE_KEY } from '../src/config/app.ts'
import { APP_VERSION } from '../src/config/app.ts'
import { EASY_LINE_ORDER } from '../src/easyTrail/trail/loop.ts'
import { lociStampFor } from '../src/lib/lociStamp.ts'

/** Complete the Easy encode recall ask (any format) before the why slide. */
export async function advanceEncodeRecallAsk(page, lineId) {
  await page.locator('.recall-gate.is-lockin-recall').waitFor({ timeout: 20_000 })
  const format = await page.evaluate(() => {
    const gate = document.querySelector('.recall-gate.is-lockin-recall')
    if (!gate) return null
    const explicit =
      gate.getAttribute('data-encode-format') ||
      gate.querySelector('[data-encode-format]')?.getAttribute('data-encode-format')
    if (explicit) return explicit
    if (gate.querySelector('.lockin-encode-b')) return 'B'
    if (gate.querySelector('.quick-review-map')) return 'C'
    if (gate.querySelector('.lockin-recall.is-ask')) return 'A'
    return 'A'
  })
  if (format === 'A') {
    await page.locator('.lockin-recall-show').waitFor({ timeout: 8000 })
    await page.getByRole('button', { name: 'Show me' }).click()
  } else if (format === 'B') {
    await page.locator('.lockin-encode.is-reveal .lockin-recall-claim, .lockin-recall-claim').waitFor({ timeout: 8000 })
  } else {
    const id =
      lineId ||
      (await page.evaluate(
        () => document.querySelector('.recall-gate.is-lockin-recall')?.getAttribute('data-line-id') ?? '',
      ))
    const stamp = lociStampFor(id)
    await page.locator(`.quick-review-plot-hit[data-plot-id="${stamp.plotId}"]`).click()
    await page.locator('.lockin-recall-claim').waitFor({ timeout: 6000 })
  }
  await page.getByRole('button', { name: 'I had it' }).click()
  await page.locator('.why-blast, .why-chip').first().waitFor({ timeout: 12_000 })
}
function encodeRotationRepeats(formats) {
  let repeats = 0
  for (let i = 1; i < formats.length; i++) {
    if (formats[i] === formats[i - 1]) repeats += 1
  }
  return repeats
}
import { withPlaytest1 } from './dev-ui-playtest.mjs'

const LOCKIN_ROTATE_LINES = 10
const LOCKIN_ROTATE_SIZES = [
  [375, 667],
  [390, 844],
  [412, 915],
]

/** Branch / CI: format must come from data-encode-format on the recall gate (no DOM-shape guess). */
const readFormatStrictSource = `(() => {
  const gate = document.querySelector('.recall-gate.is-lockin-recall')
  if (!gate) return { format: null, source: 'no-gate' }
  const onGate = gate.getAttribute('data-encode-format')
  if (onGate) return { format: onGate, source: 'gate' }
  return { format: null, source: 'missing-data-encode-format' }
})()`

/** Main-fail proof only (EXPECT_ROTATE_FAIL=1): infer A/B/C when main has no attribute. */
const readFormatLegacySource = `(() => {
  const gate = document.querySelector('.recall-gate.is-lockin-recall')
  if (!gate) return { format: null, source: 'no-gate' }
  const onGate = gate.getAttribute('data-encode-format')
  if (onGate) return { format: onGate, source: 'gate' }
  const nested = gate.querySelector('[data-encode-format]')
  if (nested) return { format: nested.getAttribute('data-encode-format'), source: 'nested' }
  if (gate.querySelector('.lockin-encode-b, [data-encode-format="B"]')) return { format: 'B', source: 'dom-b' }
  if (gate.querySelector('.lockin-encode-c, .quick-review-map')) return { format: 'C', source: 'dom-c' }
  if (gate.querySelector('.lockin-recall.is-ask')) return { format: 'A', source: 'dom-a' }
  return { format: 'A', source: 'legacy-a' }
})()`

function lockInRotateSeed(index) {
  const ids = EASY_LINE_ORDER.slice(0, index + 1)
  return {
    kind: SAVE_KIND,
    schemaVersion: SAVE_SCHEMA_VERSION,
    appVersion: APP_VERSION,
    savedAt: new Date().toISOString(),
    progress: {
      started: true,
      easyMode: true,
      theme: 'candy',
      completed: ids,
      easyTaught: ids,
      easyHeld: ids.slice(0, index),
      held: ids.slice(0, index),
    },
  }
}

async function launchBrowser() {
  try {
    return await chromium.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] })
  } catch {
    return await chromium.launch({ channel: 'chrome', headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] })
  }
}

export async function runLockInRotateCheck(browser, port, errors = []) {
  const legacyFormatRead = process.env.EXPECT_ROTATE_FAIL === '1'
  const readFormatSource = legacyFormatRead ? readFormatLegacySource : readFormatStrictSource
  let sawFailLine = false
  for (const [width, height] of LOCKIN_ROTATE_SIZES) {
    const size = `${width}x${height}`
    const formats = []
    for (let index = 0; index < LOCKIN_ROTATE_LINES; index += 1) {
      const lineId = EASY_LINE_ORDER[index]
      const raw = JSON.stringify(lockInRotateSeed(index))
      const context = await browser.newContext({
        baseURL: `http://127.0.0.1:${port}/`,
        viewport: { width, height },
        deviceScaleFactor: 1,
        reducedMotion: 'reduce',
      })
      await context.addInitScript(
        ({ key, value }) => {
          localStorage.clear()
          localStorage.setItem(key, value)
        },
        { key: STORAGE_KEY, value: raw },
      )
      const page = await context.newPage()
      page.on('pageerror', (error) => errors.push(`lockin-rotate ${size} ${lineId} ${error}`))
      await page.goto(withPlaytest1('/'), { waitUntil: 'networkidle' })
      await page.locator('main.hub.is-easy-home').waitFor({ timeout: 30_000 })
      await page.getByRole('button', { name: /Lock In/ }).last().click()
      await page.locator('.recall-gate.is-lockin-recall').waitFor({ timeout: 20_000 })
      const read = await page.evaluate(readFormatSource)
      assert.ok(read.format, `${size} ${lineId}: no encode format in DOM (${read.source})`)
      const live = read.format
      formats.push(live)
      const gold = await page.evaluate(
        (liveFmt) => {
          const visible = (el) => {
            if (!(el instanceof HTMLElement)) return false
            const st = getComputedStyle(el)
            const box = el.getBoundingClientRect()
            return st.display !== 'none' && st.visibility !== 'hidden' && box.width > 2 && box.height > 2
          }
          if (liveFmt === 'B') return []
          if (liveFmt === 'C') {
            const cue = document.querySelector('.recall-gate.is-lockin-recall .quick-review-map-tap.is-now')
            return cue && visible(cue) ? ['map-tap'] : []
          }
          const btn = document.querySelector('.recall-gate.is-lockin-recall .lockin-recall-show')
          return btn && visible(btn) ? ['show-me'] : []
        },
        live,
      )
      const goldWant = live === 'B' ? 0 : 1
      assert.equal(gold.length, goldWant, `${size} ${lineId} format=${live} gold=${gold.length} want=${goldWant}`)
      console.log(`checkLockInRotate ok ${size} ${lineId} format=${live} gold=${goldWant}`)
      await context.close()
    }
    const repeats = encodeRotationRepeats(formats)
    if (repeats === 0) {
      console.log(`checkLockInRotate ok ${size} formats=[${formats.join(',')}] repeats=${repeats}`)
    } else {
      sawFailLine = true
      console.log(`checkLockInRotate fail ${size} formats=[${formats.join(',')}] repeats=${repeats}`)
    }
    assert.equal(repeats, 0, `${size} consecutive encode repeats=${repeats} formats=[${formats.join(',')}]`)
  }
  return { sawFailLine }
}

const isMain = process.argv[1]?.endsWith('check-lockin-rotate.mjs')

if (isMain) {
  const server = await createServer({ server: { host: '127.0.0.1', port: 0 } })
  await server.listen()
  const address = server.httpServer?.address()
  const port = address && typeof address === 'object' ? address.port : 0
  assert.ok(port > 0)
  const browser = await launchBrowser()
  const errors = []
  try {
    await runLockInRotateCheck(browser, port, errors)
    assert.equal(errors.join('\n'), '')
    console.log('check-lockin-rotate: ok')
  } catch (err) {
    if (process.env.EXPECT_ROTATE_FAIL === '1') {
      console.log('check-lockin-rotate: expected fail on main')
      process.exit(0)
    }
    throw err
  } finally {
    await browser.close()
    await server.close()
  }
}