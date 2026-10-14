/**
 * Developer jump into Night Watch (1.4.464).
 * The road paths load, a tap on open ground plants, and Begin starts round 1.
 */
import assert from 'node:assert/strict'
import { fileURLToPath } from 'node:url'
import { createServer } from 'vite'
import { chromium } from '@playwright/test'
import { SAVE_KIND } from '../src/lib/save.ts'
import { SAVE_SCHEMA_VERSION, STORAGE_KEY } from '../src/config/app.ts'

const SAVE = {
  kind: SAVE_KIND,
  schemaVersion: SAVE_SCHEMA_VERSION,
  appVersion: '1.4.464',
  savedAt: '2026-10-14T00:00:00.000Z',
  progress: {
    started: true,
    easyMode: true,
    theme: 'candy',
    completed: [],
    lastDailyDate: '2026-10-13',
    held: [],
  },
}

async function launchBrowser() {
  try {
    return await chromium.launch({ headless: true })
  } catch {
    return await chromium.launch({ headless: true, channel: 'chrome' })
  }
}

async function plantOpenGround(page) {
  const box = await page.locator('.defend-board').boundingBox()
  assert.ok(box, '1.4.464 the board is on screen after the jump')
  for (let gy = 0.16; gy <= 0.84; gy += 0.08) {
    for (let gx = 0.12; gx <= 0.7; gx += 0.08) {
      const x = box.x + box.width * gx
      const y = box.y + box.height * gy
      await page.mouse.move(x, y)
      const ghost = page.locator('.defend-ghost')
      const cls = (await ghost.count()) ? await ghost.getAttribute('class') : ''
      if (!cls || cls.includes('is-nogo') || cls.includes('is-good')) continue
      await page.mouse.click(x, y)
      if ((await page.locator('[data-tower-type]').count()) >= 1) return cls
    }
  }
  return ''
}

export async function checkNightJump() {
  const server = await createServer({ server: { host: '127.0.0.1', port: 0 } })
  await server.listen()
  const address = server.httpServer?.address()
  const port = address && typeof address === 'object' ? address.port : 0
  const browser = await launchBrowser()
  try {
    const page = await browser.newPage({
      viewport: { width: 375, height: 667 },
      deviceScaleFactor: 1,
      reducedMotion: 'reduce',
    })
    await page.addInitScript(
      (payload) => localStorage.setItem(payload.key, JSON.stringify(payload.save)),
      { key: STORAGE_KEY, save: SAVE },
    )
    await page.goto(`http://127.0.0.1:${port}/`)
    await page.getByRole('button', { name: 'Settings' }).click()
    await page.locator('summary', { hasText: 'Developer' }).click()
    await page.getByRole('button', { name: 'Jump · Night Watch' }).click()
    await page.locator('.defend-board').waitFor()
    const roads = await page.locator('.defend-road, .defend-road-bed, .defend-road-shine').evaluateAll((nodes) =>
      nodes.map((node) => node.getAttribute('d') || ''),
    )
    assert.equal(roads.length, 3, '1.4.464 the jump draws the three road layers')
    for (const d of roads) {
      assert.ok(d.startsWith('M') && d.includes(' L'), '1.4.464 the jump loads a road path')
    }
    await page.locator('[data-first-lamp="free"]').first().waitFor()
    assert.equal(await page.locator('.nw-balloon').getAttribute('aria-label'), 'Sparks: 0')
    assert.match(await page.locator('.defend-ability-claim').first().innerText(), /Free to plant/)
    const plantedOn = await plantOpenGround(page)
    assert.ok(plantedOn, '1.4.464 tapping open ground after the jump plants a lamp')
    assert.equal(await page.locator('.defend-count').innerText(), '1 planted')
    await page.locator('.defend-go').click()
    await page.locator('.defend-page.is-easy-tap').waitFor()
    assert.match(await page.locator('.defend-count').innerText(), /TAP \d+ left/)
    await page.close()
  } finally {
    await browser.close()
    await server.close()
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  await checkNightJump()
  console.log('check-night-jump: ok')
}
