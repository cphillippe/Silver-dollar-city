import { mkdirSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawn } from 'node:child_process'
import { chromium } from '@playwright/test'
import { APP_VERSION } from '../src/config/app.ts'
import { STORAGE_KEY } from '../src/config/app.ts'
import { SAVE_KIND, SAVE_SCHEMA_VERSION, wrapSave } from '../src/lib/save.ts'

const outDir = process.env.HOP841_SHOTS_DIR ?? join(tmpdir(), 'hop-841-quickreview')
mkdirSync(outDir, { recursive: true })

function seedProgress(extra = {}) {
  return {
      started: true,
      easyMode: true,
      theme: 'candy',
      completed: ['ph-road', 'ph-father'],
      lastDailyDate: '2026-10-01',
      held: ['ph-road'],
      memory: {
        'ph-road': {
          id: 'ph-road',
          pillar: 'parable-hollow',
          intervalIndex: 1,
          nextReviewAt: '2099-01-01',
          reviews: 1,
          cleanRecalls: 1,
          elaborated: false,
        },
        'ph-father': {
          id: 'ph-father',
          pillar: 'parable-hollow',
          intervalIndex: 2,
          nextReviewAt: '2099-01-01',
          reviews: 2,
          cleanRecalls: 2,
          elaborated: false,
        },
      },
      ...extra,
  }
}

function seedSave(extra = {}) {
  return wrapSave(seedProgress(extra))
}

async function metrics(page, scope) {
  return page.evaluate((scopeSel) => {
    const root = document.querySelector(scopeSel)
    const goldRoot = root ?? document.body
    const gold = goldRoot.querySelectorAll('.btn.gold, .is-now').length
    let minFont = 999
    let minTap = 999
    ;(root ?? document.body).querySelectorAll('button, .match-card, .text-link, .quick-review-prompt, .quick-review-reveal-line').forEach((el) => {
      const st = getComputedStyle(el)
      const fs = parseFloat(st.fontSize)
      if (fs > 0 && fs < minFont) minFont = fs
      const r = el.getBoundingClientRect()
      if (r.width > 20 && r.height > 20) {
        const tap = Math.min(r.width, r.height)
        if (tap < minTap) minTap = tap
      }
    })
    return {
      gold,
      minFontSizePx: minFont === 999 ? 0 : minFont,
      minTapTargetPx: minTap === 999 ? 0 : minTap,
      scrollOverflow: document.documentElement.scrollWidth > window.innerWidth,
    }
  }, scope)
}

async function snap(page, name, viewport, scope = '.quick-review') {
  await page.setViewportSize(viewport)
  await page.waitForTimeout(400)
  const meta = await metrics(page, scope)
  const file = `${name}-${viewport.width}x${viewport.height}.png`
  await page.screenshot({ path: join(outDir, file), fullPage: false })
  return { file, viewport, version: APP_VERSION, ...meta }
}

const root = fileURLToPath(new URL('..', import.meta.url))
const preview = spawn('npx', ['vite', 'preview', '--host', '127.0.0.1', '--port', '4173'], {
  cwd: root,
  stdio: 'ignore',
})
await new Promise((resolve) => setTimeout(resolve, 2500))
const port = 4173
const browser = await chromium.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] })
const shots = []

try {
  for (const viewport of [
    { width: 375, height: 812 },
    { width: 390, height: 844 },
  ]) {
    const context = await browser.newContext()
    await context.addInitScript(
      ({ key, raw }) => {
        localStorage.setItem(key, raw)
      },
      { key: STORAGE_KEY, raw: JSON.stringify(seedSave()) },
    )
    const page = await context.newPage()
    await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: 'networkidle' })
    await page.locator('main[aria-label="Home"]').waitFor({ timeout: 60_000 })
    shots.push(await snap(page, '10-home-unchanged', viewport, 'ol.easy-home-steps'))

    await page.goto(
      `http://127.0.0.1:${port}/?quickReview=ph-father&reviewFormat=C`,
      { waitUntil: 'networkidle' },
    )
    await page.locator('.quick-review-plot-hit.is-now').waitFor()
    shots.push(await snap(page, '01-C-prompt', viewport))
    await page.locator('.quick-review-plot-hit.is-now').click()
    await page.getByRole('button', { name: 'I had it' }).waitFor()
    shots.push(await snap(page, '02-C-reveal', viewport))

    await page.goto(
      `http://127.0.0.1:${port}/?quickReview=ph-father&reviewFormat=B`,
      { waitUntil: 'networkidle' },
    )
    await page.getByText('Think first…').waitFor()
    shots.push(await snap(page, '03-B-think', viewport))
    await page.waitForTimeout(3200)
    await page.locator('.quick-review-drain-bar.is-now').waitFor()
    shots.push(await snap(page, '04-B-drain', viewport))
    await page.locator('.match-card.recall-card').first().click()
    await page.getByRole('button', { name: 'Next' }).waitFor()
    shots.push(await snap(page, '05-B-reveal', viewport))

    await page.goto(
      `http://127.0.0.1:${port}/?quickReview=ph-father&reviewFormat=A`,
      { waitUntil: 'networkidle' },
    )
    await page.getByRole('button', { name: 'Show me' }).waitFor()
    shots.push(await snap(page, '06-A-prompt', viewport))
    await page.getByRole('button', { name: 'Show me' }).click()
    await page.getByRole('button', { name: 'I had it' }).waitFor()
    shots.push(await snap(page, '07-A-reveal', viewport))

    await page.goto(`http://127.0.0.1:${port}/?quickReview=ph-road&reviewFormat=C`, {
      waitUntil: 'networkidle',
    })
    await page.locator('.quick-review-plot-hit.is-now').click()
    await page.getByRole('button', { name: 'I had it' }).click()
    await page.locator('.quick-review-prompt.is-now').waitFor()
    shots.push(await snap(page, '08-honesty-check', viewport))

    await page.goto(
      `http://127.0.0.1:${port}/?quickReview=ph-father&reviewFormat=C&reviewStreak=2`,
      { waitUntil: 'networkidle' },
    )
    await page.locator('.quick-review-plot-hit.is-now').click()
    await page.getByRole('button', { name: 'I had it' }).click()
    await page.getByText('3 in a row').waitFor()
    await page.locator('.win-burst').waitFor()
    shots.push(await snap(page, '09-streak-winburst', viewport))

    await context.close()
  }
} finally {
  await browser.close()
  preview.kill('SIGTERM')
}

writeFileSync(join(outDir, 'shots.json'), JSON.stringify({ version: APP_VERSION, shots }, null, 2))
console.log(`hop-841 shots → ${outDir} (${shots.length} files)`)
