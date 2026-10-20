#!/usr/bin/env node
/**
 * Play bundle, shop off. 375×667. Real pointer taps never reach a purchase.
 */
import assert from 'node:assert/strict'
import { existsSync, mkdirSync, readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { chromium } from 'playwright'
import { build, preview } from 'vite'
import { omitPlayBundle } from './android-play-shell.mjs'

process.env.VITE_PLAY_BUILD = '1'
process.env.VITE_PLAY_BILLING = '1'
delete process.env.VITE_PLAY_SHOP

const outDir = 'dist-play'
const shotDir = '/opt/cursor/artifacts'
const purchaseLabel =
  /(\bBuy\b|\bRestore\b|\bUnlock\b|Remove ads|\$\d|4\+|bundle|Street Packs|checkout|Ko-fi|\bTip\b)/i

await build({
  logLevel: 'warn',
  build: { outDir, emptyOutDir: true },
})
omitPlayBundle(outDir)

function walk(dir, acc = []) {
  for (const name of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, name.name)
    if (name.isDirectory()) walk(path, acc)
    else acc.push(path)
  }
  return acc
}

const bundled = walk(outDir)
assert.equal(
  bundled.some((file) => file.endsWith('qa-seed.html') || file.includes(`${join('night-run')}`)),
  false,
  'Play dist omits qa-seed and night-run',
)
assert.equal(existsSync(join(outDir, 'qa-seed.html')), false)
assert.equal(existsSync(join(outDir, 'night-run')), false)
const javascript = bundled
  .filter((file) => file.endsWith('.js'))
  .map((file) => readFileSync(file, 'utf8'))
  .join('\n')
assert.doesNotMatch(javascript, /ko-fi\.com/)
assert.doesNotMatch(javascript, /fonts\.googleapis\.com|fonts\.gstatic\.com/)
const html = readFileSync(join(outDir, 'index.html'), 'utf8')
assert.match(html, /fonts\/fonts\.css/)
assert.doesNotMatch(html, /fonts\.googleapis\.com|fonts\.gstatic\.com/)

const comingSrc = readFileSync(new URL('../src/components/city/ComingSoonPlots.tsx', import.meta.url), 'utf8')
assert.match(comingSrc, /Coming soon/)
assert.doesNotMatch(comingSrc, /checkoutOffer\(|purchaseOffer\(|priceLabel/)

async function launchBrowser() {
  try {
    return await chromium.launch({ headless: true })
  } catch {
    return await chromium.launch({ headless: true, channel: 'chrome' })
  }
}

async function purchaseCalls(page) {
  return page.evaluate(() => {
    const raw = sessionStorage.getItem('__silverPurchaseCalls')
    return raw ? JSON.parse(raw) : []
  })
}

async function assertNoPurchase(page, label) {
  const calls = await purchaseCalls(page)
  assert.deepEqual(calls, [], `${label} called ${JSON.stringify(calls)}`)
  const receipts = await page.evaluate(() => localStorage.getItem('silver-city-receipts-v1') || '')
  assert.doesNotMatch(receipts, /play-demo|web-demo/, `${label} wrote a demo grant`)
  assert.equal(await page.locator('.checkout-sheet').count(), 0, `${label} showed a purchase sheet`)
}

async function tapPurchaseControls(page) {
  for (let pass = 0; pass < 6; pass += 1) {
    const controls = page.locator('button, a')
    const count = await controls.count()
    let tapped = false
    for (let index = 0; index < count; index += 1) {
      const control = controls.nth(index)
      const visible = await control.isVisible().catch(() => false)
      if (!visible) continue
      const text = `${await control.innerText().catch(() => '')} ${await control.getAttribute('aria-label').catch(() => '')}`
      if (!purchaseLabel.test(text.replace(/\s+/g, ' '))) continue
      await control.click()
      tapped = true
      break
    }
    if (!tapped) return
    await page.waitForTimeout(150)
  }
}

async function dismissImport(page) {
  const later = page.getByRole('button', { name: 'Not now' })
  if (await later.isVisible().catch(() => false)) await later.click()
}

async function openTown(page) {
  await dismissImport(page)
  const start = page.getByRole('button', { name: 'Start Easy' })
  if (await start.isVisible().catch(() => false)) await start.click()
  await page.locator('[data-coming-streets]').waitFor({ timeout: 8000 })
}

async function tapStreet(page, id) {
  const plot = page.locator(`[data-coming-plot="${id}"]`)
  await plot.click()
  const sheet = page.locator(`[data-coming-sheet="${id}"]`)
  await sheet.waitFor()
  assert.deepEqual(await sheet.locator('p').allInnerTexts(), ['Coming soon'])
  assert.doesNotMatch(await sheet.innerText(), /\$|Buy|Unlock|Restore/)
  await sheet.getByRole('button', { name: 'Back' }).click()
  await sheet.waitFor({ state: 'hidden' })
}

const server = await preview({
  preview: { host: '127.0.0.1', port: 0 },
  build: { outDir },
  logLevel: 'warn',
})
const address = server.httpServer?.address()
const port = typeof address === 'object' && address ? address.port : 4173
const origin = `http://127.0.0.1:${port}`
const browser = await launchBrowser()

try {
  const page = await browser.newPage({ viewport: { width: 375, height: 667 } })
  const errors = []
  page.on('pageerror', (error) => errors.push(String(error)))
  await page.addInitScript(() => {
    const key = '__silverPurchaseCalls'
    const calls = JSON.parse(sessionStorage.getItem(key) || '[]')
    window.__silverPurchaseCalls = calls
    window.__silverPurchaseSpy = (kind) => {
      calls.push(kind)
      sessionStorage.setItem(key, JSON.stringify(calls))
    }
  })

  await page.goto(`${origin}/`)
  await page.locator('.welcome').waitFor()
  await dismissImport(page)
  await tapPurchaseControls(page)
  await assertNoPurchase(page, 'welcome')

  await openTown(page)
  const plotIds = await page.locator('[data-coming-plot]').evaluateAll((nodes) =>
    nodes.map((node) => node.getAttribute('data-coming-plot')),
  )
  assert.ok(plotIds.includes('mill-street'), `Mill Street plot missing: ${plotIds.join(',')}`)
  assert.ok(plotIds.includes('harbor-walk'), `Harbor Walk plot missing: ${plotIds.join(',')}`)
  const townText = await page.locator('body').innerText()
  assert.doesNotMatch(townText, /\$\d/)
  assert.doesNotMatch(townText, /\bBuy\b/)
  assert.doesNotMatch(townText, /Restore/)
  assert.doesNotMatch(townText, /Remove ads/)
  assert.equal(await page.getByText('Update available').count(), 0)
  assert.equal(await page.locator('a[href*="ko-fi"]').count(), 0)
  assert.equal(await page.getByText('Developer · mini-game jumps').count(), 0)

  for (const id of plotIds) await tapStreet(page, id)
  await tapPurchaseControls(page)
  await assertNoPurchase(page, 'street plots')

  mkdirSync(shotDir, { recursive: true })
  await page.locator('[data-coming-plot="mill-street"]').click()
  await page.locator('[data-coming-sheet="mill-street"]').waitFor()
  await page.screenshot({ path: join(shotDir, 'play-coming-soon-375x667.png') })
  await page.locator('[data-coming-sheet]').getByRole('button', { name: 'Back' }).click()

  await page.getByRole('button', { name: 'Settings' }).click()
  await page.locator('[data-play-about]').waitFor()
  const privacy = page.locator('[data-play-about] a')
  assert.equal(await privacy.getAttribute('href'), 'https://example.com/silver-city-privacy')
  assert.match(await privacy.innerText(), /Privacy policy/)
  assert.match(await page.locator('[data-play-about]').innerText(), /Shop opens soon/)
  assert.equal(await page.getByText('Developer · mini-game jumps').count(), 0)
  assert.equal(await page.getByText('Update available').count(), 0)
  assert.equal(await page.locator('a[href*="ko-fi"]').count(), 0)
  assert.doesNotMatch(await page.locator('body').innerText(), /\$\d|\bBuy\b|Restore|Remove ads/)
  await page.locator('[data-play-about]').scrollIntoViewIfNeeded()
  await page.screenshot({ path: join(shotDir, 'play-build-375x667.png') })
  await tapPurchaseControls(page)
  await assertNoPurchase(page, 'settings')

  const paths = [
    '/?shop=1&pack=mill-street&buy=1&playtest=1',
    '/?checkout=1&sku=city.silver.unending.pack.harbor&restore=1&bundle=4',
    '/?nwDebug=1',
    '/?view=shop&offer=mill-street',
    '/qa-seed.html',
    '/night-run/',
    '/night-run/index.html',
  ]
  for (const path of paths) {
    await page.goto(`${origin}${path}`)
    await page.waitForTimeout(250)
    await tapPurchaseControls(page)
    const streets = page.locator('[data-coming-plot]')
    if ((await streets.count()) > 0) {
      await streets.first().click()
      const back = page.locator('[data-coming-sheet]').getByRole('button', { name: 'Back' })
      if (await back.isVisible().catch(() => false)) await back.click()
    } else if (await page.locator('.welcome').isVisible().catch(() => false)) {
      await openTown(page)
      await tapStreet(page, 'harbor-walk')
    }
    const developer = page.getByText('Developer · mini-game jumps')
    if (await developer.isVisible().catch(() => false)) await developer.click()
    await tapPurchaseControls(page)
    await assertNoPurchase(page, path)
  }

  assert.deepEqual(await purchaseCalls(page), [])
  assert.deepEqual(errors, [], errors.join('\n'))
} finally {
  await browser.close()
  await server.close()
}

console.log('check-play-shop: ok')
