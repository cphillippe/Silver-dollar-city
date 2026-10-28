import { mkdirSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawn } from 'node:child_process'
import { chromium } from '@playwright/test'
import { APP_VERSION } from '../src/config/app.ts'
import { STORAGE_KEY } from '../src/config/app.ts'
import { SAVE_KIND, SAVE_SCHEMA_VERSION } from '../src/lib/save.ts'
import { lociStampFor } from '../src/lib/lociStamp.ts'

const outDir = process.env.HOP842_SHOTS_DIR ?? join(tmpdir(), '842-home-read-shots')
mkdirSync(outDir, { recursive: true })

function homeSeed() {
  return {
    kind: SAVE_KIND,
    schemaVersion: SAVE_SCHEMA_VERSION,
    appVersion: APP_VERSION,
    savedAt: new Date().toISOString(),
    progress: {
      started: true,
      easyMode: true,
      theme: 'candy',
      completed: ['ph-road', 'ph-father', 'ob-tuning'],
      easyHeld: ['ph-road'],
      lastDailyDate: '2026-01-01',
      memory: {
        'ph-road': {
          id: 'ph-road',
          pillar: 'parable-hollow',
          intervalIndex: 1,
          nextReviewAt: '2026-01-01',
          reviews: 1,
          cleanRecalls: 1,
          elaborated: false,
          lastFormat: 'A',
        },
        'ph-father': {
          id: 'ph-father',
          pillar: 'parable-hollow',
          intervalIndex: 2,
          nextReviewAt: '2026-01-01',
          reviews: 2,
          cleanRecalls: 2,
          elaborated: false,
          lastFormat: 'A',
        },
        'ob-tuning': {
          id: 'ob-tuning',
          pillar: 'observatory',
          intervalIndex: 1,
          nextReviewAt: '2026-01-01',
          reviews: 1,
          cleanRecalls: 1,
          elaborated: false,
          lastFormat: 'A',
        },
      },
    },
  }
}

async function snap(page, name, viewport) {
  await page.setViewportSize(viewport)
  await page.waitForTimeout(450)
  const file = `${name}-${viewport.width}x${viewport.height}.png`
  const path = join(outDir, file)
  await page.screenshot({ path, fullPage: false })
  return path
}

function tapPlot(page, lineId) {
  const plotId = lociStampFor(lineId).plotId
  return page.locator(`[data-plot-id="${plotId}"]`).click()
}

const root = fileURLToPath(new URL('..', import.meta.url))
const preview = spawn('npx', ['vite', 'preview', '--host', '127.0.0.1', '--port', '4173'], {
  cwd: root,
  stdio: 'ignore',
})
await new Promise((resolve) => setTimeout(resolve, 2500))
const port = 4173
const browser = await chromium.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] })
const paths = []

try {
  const context = await browser.newContext()
  await context.addInitScript(
    ({ key, raw, openDay }) => {
      localStorage.setItem(key, raw)
      localStorage.setItem('silver-city-easy-open-v1', openDay)
    },
    {
      key: STORAGE_KEY,
      raw: JSON.stringify(homeSeed()),
      openDay: '2026-01-01',
    },
  )
  const page = await context.newPage()

  const queue = 'ph-road,ph-father,ob-tuning'
  const reviewUrl = `http://127.0.0.1:${port}/?playtest=1&from=home&reviewQueue=${queue}&quickReview=ph-road`
  const formatAUrl = `http://127.0.0.1:${port}/?playtest=1&from=home&quickReview=ph-road&reviewFormat=A`
  const formatCUrl = `http://127.0.0.1:${port}/?playtest=1&from=home&quickReview=ph-road&reviewFormat=C`

  for (const viewport of [
    { width: 375, height: 667 },
    { width: 390, height: 844 },
  ]) {
    await page.goto(`http://127.0.0.1:${port}/?playtest=1`, { waitUntil: 'networkidle' })
    await page.getByRole('main', { name: 'Home' }).waitFor()
    paths.push(await snap(page, '842-home-read-entry', viewport))

    await page.goto(reviewUrl, { waitUntil: 'networkidle' })
    await page.locator('.quick-review').waitFor()
    await page.locator('.quick-review-prompt-panel').waitFor()
    paths.push(await snap(page, '842-home-card1-prompt', viewport))
    await tapPlot(page, 'ph-road')
    await page.getByRole('button', { name: 'I had it' }).waitFor()
    paths.push(await snap(page, '842-home-card1-reveal', viewport))
    await page.getByRole('button', { name: 'I had it' }).click()

    await page.getByText('Why is it true?').waitFor()
    paths.push(await snap(page, '842-home-card2-why-prompt', viewport))
    await tapPlot(page, 'ph-father')
    await page.getByRole('button', { name: 'I had it' }).waitFor()
    await page.getByRole('button', { name: 'I had it' }).click()

    await page.getByText("Where's it from?").waitFor()
    await tapPlot(page, 'ph-father')
    await page.getByRole('button', { name: 'I had it' }).waitFor()
    paths.push(await snap(page, '842-home-card2-source-reveal', viewport))
    await page.getByRole('button', { name: 'I had it' }).click()

    await page.locator('.quick-review-streak').waitFor()
    await tapPlot(page, 'ob-tuning')
    await page.getByRole('button', { name: 'I had it' }).waitFor()
    paths.push(await snap(page, '842-home-streak-reveal-actions', viewport))

    await page.goto(formatCUrl, { waitUntil: 'networkidle' })
    await page.locator('.quick-review-prompt-panel').waitFor()
    paths.push(await snap(page, '842-coach-C-prompt-before-tap', viewport))
    await tapPlot(page, 'ph-road')
    await page.getByRole('button', { name: 'I had it' }).waitFor()
    paths.push(await snap(page, '842-coach-C-reveal', viewport))

    await page.goto(formatAUrl, { waitUntil: 'networkidle' })
    await page.getByRole('button', { name: 'Show me' }).click()
    await page.getByRole('button', { name: 'I had it' }).waitFor()
    paths.push(await snap(page, '842-coach-A-reveal', viewport))
  }

  await context.close()
} finally {
  await browser.close()
  preview.kill('SIGTERM')
}

writeFileSync(join(outDir, 'paths.json'), JSON.stringify({ version: APP_VERSION, paths }, null, 2))
console.log(`842-home shots → ${outDir}`)
for (const p of paths) console.log(p)
