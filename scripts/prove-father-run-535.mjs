/**
 * Father run 1.4.535 proof shots + scene % + gold census (Easy only).
 */
import assert from 'node:assert/strict'
import { mkdirSync, writeFileSync } from 'node:fs'
import { chromium } from 'playwright'
import { preview } from 'vite'
import { STORAGE_KEY } from '../src/config/app.ts'
import { SAVE_KIND, SAVE_SCHEMA_VERSION } from '../src/lib/save.ts'

const SHOTS = '/opt/cursor/artifacts/screenshots/father-run-535'
const SIZES = [[390, 844], [375, 667]]

function hopSave(progress) {
  return {
    kind: SAVE_KIND,
    schemaVersion: SAVE_SCHEMA_VERSION,
    appVersion: '1.4.535',
    savedAt: '2026-10-24T00:00:00.000Z',
    progress: {
      started: true,
      easyMode: true,
      theme: 'candy',
      completed: ['ph-road'],
      held: ['ph-road'],
      easyHeld: ['ph-road'],
      easyTaught: ['ph-road'],
      lastDailyDate: '2026-10-24',
      dailyDates: ['2026-10-24'],
      cityBuilt: { porch: 4, hollow: 2, bench: 1, observatory: 0, gate: 0, lookout: 0, journal: 0, lamps: 0 },
      ...progress,
    },
  }
}

function goldish(value) {
  if (!value || value === 'none' || value === 'transparent' || value === 'rgba(0, 0, 0, 0)') return false
  return /#ffcc33|#e09412|#ff9f1a|#ffe566|#fff6b8|#fffce8|255,\s*20[04],\s*5[01]|255,\s*204,\s*51|255,\s*159,\s*26/i.test(value)
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
      const pad = el.classList.contains('run-pad')
      if (!primary && !coach && !pad) continue
      hits.push((el.innerText || el.getAttribute('aria-label') || '').replace(/\s+/g, ' ').trim())
    }
    return hits
  })
}

async function countGoldElements(page) {
  return page.evaluate(() => {
    const goldish = (value) => {
      if (!value || value === 'none' || value === 'transparent' || value === 'rgba(0, 0, 0, 0)') return false
      return /#ffcc33|#e09412|#ff9f1a|#ffe566|#fff6b8|#fffce8|255,\s*20[04],\s*5[01]|255,\s*204,\s*51|255,\s*159,\s*26/i.test(value)
    }
    const root = document.querySelector('.play.is-father-run')
    if (!root) return { count: -1, hits: [] }
    const hits = []
    const visit = (el) => {
      if (!(el instanceof HTMLElement)) return
      const style = getComputedStyle(el)
      if (style.display === 'none' || style.visibility === 'hidden' || Number(style.opacity) === 0) return
      const box = el.getBoundingClientRect()
      if (box.width < 3 || box.height < 3) return
      const bag = [
        style.backgroundColor,
        style.backgroundImage,
        style.borderTopColor,
        style.borderColor,
        style.boxShadow,
        style.color,
        style.outlineColor,
        style.textShadow,
      ]
      if (bag.some(goldish)) {
        hits.push(`${el.tagName}.${[...el.classList].join('.')}`)
      }
    }
    visit(root)
    root.querySelectorAll('*').forEach(visit)
    return { count: hits.length, hits }
  })
}

async function measureScene(page) {
  return page.evaluate(() => {
    const scene = document.querySelector('.play.is-father-run .run-scene')
    const vh = window.innerHeight
    if (!scene) return { pct: 0, h: 0 }
    const h = scene.getBoundingClientRect().height
    return { pct: Math.round((h / vh) * 1000) / 10, h: Math.round(h) }
  })
}

async function openFather(browser, origin, width, height) {
  const ctx = await browser.newContext({ viewport: { width, height } })
  await ctx.addInitScript(
    ([storageKey, raw]) => {
      localStorage.clear()
      localStorage.setItem(storageKey, raw)
    },
    [STORAGE_KEY, JSON.stringify(hopSave({}))],
  )
  const page = await ctx.newPage()
  await page.goto(origin)
  await page.locator('main.hub').waitFor()
  await page.getByRole('button', { name: /Run/i }).first().click()
  await page.locator('.play.is-father-run').waitFor()
  return { ctx, page }
}

async function capture(page, state, sizeTag) {
  await page.waitForTimeout(150)
  await page.screenshot({ path: `${SHOTS}/${sizeTag}-${state}.png`, fullPage: false })
  const scene = await measureScene(page)
  const golds = await filledGolds(page)
  const census = await countGoldElements(page)
  assert.equal(golds.length, 1, `${state} ${sizeTag} filled golds: ${JSON.stringify(golds)}`)
  assert.equal(census.count, 1, `${state} ${sizeTag} gold census: ${census.count} ${JSON.stringify(census.hits)}`)
  return { state, size: sizeTag, scenePct: scene.pct, sceneH: scene.h, goldCount: census.count }
}

async function padCenter(page) {
  const pad = page.locator('[data-run-pad="hold"]')
  await pad.waitFor()
  const box = await pad.boundingBox()
  assert.ok(box)
  return { pad, x: box.x + box.width / 2, y: box.y + box.height / 2 }
}

async function stateReady(browser, origin, w, h) {
  const { ctx, page } = await openFather(browser, origin, w, h)
  const row = await capture(page, 'ready', `${w}x${h}`)
  await ctx.close()
  return row
}

async function stateHolding(browser, origin, w, h) {
  const { ctx, page } = await openFather(browser, origin, w, h)
  const { x, y } = await padCenter(page)
  await page.mouse.move(x, y)
  await page.mouse.down()
  await page.waitForTimeout(250)
  const row = await capture(page, 'holding', `${w}x${h}`)
  await page.mouse.up()
  await ctx.close()
  return row
}

async function stateMercy(browser, origin, w, h) {
  const { ctx, page } = await openFather(browser, origin, w, h)
  const { x, y } = await padCenter(page)
  await page.mouse.move(x, y)
  await page.mouse.down()
  const deadline = Date.now() + 15000
  while (Date.now() < deadline) {
    const toast = ((await page.locator('.match-toast strong').innerText().catch(() => '')) || '').trim()
    if (toast.includes('Mercy')) break
    if (await page.locator('.run-miss').count()) break
    await page.waitForTimeout(40)
  }
  const row = await capture(page, 'mercy', `${w}x${h}`)
  await page.mouse.up().catch(() => {})
  await ctx.close()
  return row
}

async function stateHug(browser, origin, w, h) {
  const { ctx, page } = await openFather(browser, origin, w, h)
  const { x, y } = await padCenter(page)
  await page.mouse.move(x, y)
  await page.mouse.down()
  await page.locator('.play.is-father-run.is-hug').waitFor({ timeout: 15000 })
  await page.mouse.up().catch(() => {})
  const row = await capture(page, 'hug', `${w}x${h}`)
  await ctx.close()
  return row
}

async function stateMiss(browser, origin, w, h) {
  const { ctx, page } = await openFather(browser, origin, w, h)
  const { x, y } = await padCenter(page)
  await page.mouse.move(x, y)
  await page.mouse.down()
  await page.waitForTimeout(120)
  await page.mouse.up()
  await page.locator('.run-miss').waitFor({ timeout: 20000 })
  await page.waitForTimeout(700)
  const row = await capture(page, 'miss', `${w}x${h}`)
  await ctx.close()
  return row
}

async function stateTwoMiss(browser, origin, w, h) {
  const { ctx, page } = await openFather(browser, origin, w, h)
  let { x, y } = await padCenter(page)
  await page.mouse.move(x, y)
  await page.mouse.down()
  await page.waitForTimeout(120)
  await page.mouse.up()
  await page.locator('.run-miss').waitFor({ timeout: 20000 })
  await page.waitForTimeout(700)
  await page.locator('.run-miss .btn.primary').first().click()
  await page.locator('[data-run-pad="hold"]').waitFor()
  ;({ x, y } = await padCenter(page))
  await page.mouse.move(x, y)
  await page.mouse.down()
  await page.waitForTimeout(120)
  await page.mouse.up()
  await page.locator('.run-miss').waitFor({ timeout: 20000 })
  await page.waitForTimeout(700)
  const row = await capture(page, '2-miss', `${w}x${h}`)
  await ctx.close()
  return row
}

async function main() {
  mkdirSync(SHOTS, { recursive: true })
  const server = await preview({ preview: { port: 4173, strictPort: true }, build: { outDir: 'dist' } })
  const origin = server.resolvedUrls?.local?.[0]?.replace(/\/$/, '') ?? 'http://localhost:4173'
  const browser = await chromium.launch({ headless: true, channel: 'chrome' }).catch(() => chromium.launch({ headless: true }))
  const all = []
  try {
    for (const [w, h] of SIZES) {
      for (const fn of [stateReady, stateHolding, stateMercy, stateHug, stateMiss, stateTwoMiss]) {
        all.push(await fn(browser, origin, w, h))
      }
    }
  } finally {
    await browser.close()
    await server.close()
  }
  writeFileSync(`${SHOTS}/metrics.json`, JSON.stringify(all, null, 2))
  console.log('prove-father-run-535 ok')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
