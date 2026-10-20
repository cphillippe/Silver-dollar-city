#!/usr/bin/env node
/**
 * Founder's Lamp gift. 375×667. Real pointer taps (never element.click).
 * Play shop flag off, then on. No price, SKU, or ledger.
 */
import assert from 'node:assert/strict'
import { mkdirSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { chromium } from 'playwright'
import { createServer } from 'vite'
import { FOUNDERS_GIFT_LINE } from '../src/lib/foundersLamp.ts'
import { SAVE_SCHEMA_VERSION } from '../src/config/app.ts'

const shotDir = '/opt/cursor/artifacts'
mkdirSync(shotDir, { recursive: true })

assert.equal(SAVE_SCHEMA_VERSION, 1)

const giftFiles = []
function walk(dir) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name)
    if (statSync(path).isDirectory()) {
      if (name === 'node_modules' || name === 'dist' || name === 'docs') continue
      walk(path)
      continue
    }
    if (!/\.(tsx|ts|css)$/.test(name)) continue
    const text = readFileSync(path, 'utf8')
    if (text.includes(FOUNDERS_GIFT_LINE)) giftFiles.push(path)
  }
}
walk('src')
assert.deepEqual(giftFiles, ['src/lib/foundersLamp.ts'])
assert.match(readFileSync('src/components/FoundersGift.tsx', 'utf8'), /FOUNDERS_GIFT_LINE/)
assert.match(readFileSync('src/components/Hub.tsx', 'utf8'), /FoundersGiftLine/)
assert.doesNotMatch(readFileSync('src/components/Journal.tsx', 'utf8'), /FoundersGift|FOUNDERS_GIFT_LINE/)
assert.doesNotMatch(
  readFileSync('src/components/challenges/MatchPlay.tsx', 'utf8'),
  /FoundersGift|FOUNDERS_GIFT_LINE/,
)
assert.doesNotMatch(readFileSync('src/components/RecallGate.tsx', 'utf8'), /FoundersGift|FOUNDERS_GIFT_LINE/)

const feature = [
  'src/lib/foundersLamp.ts',
  'src/components/FoundersGift.tsx',
  'src/lib/save.ts',
  'src/components/Settings.tsx',
  'src/styles/city.css',
]
  .map((file) => readFileSync(file, 'utf8'))
  .join('\n')
assert.doesNotMatch(feature, /spendLedger|priceLabel|VITE_PLAY_SHOP|\bSKU\b|checkoutOffer/)
assert.match(readFileSync('src/styles/city.css', 'utf8'), /is-style-founders/)
assert.doesNotMatch(readFileSync('src/styles/city.css', 'utf8'), /founders-lamp\.(png|webp|svg|jpe?g)/)

async function launchBrowser() {
  try {
    return await chromium.launch({ headless: true })
  } catch {
    return await chromium.launch({ headless: true, channel: 'chrome' })
  }
}

async function pointerClick(page, locator) {
  await locator.scrollIntoViewIfNeeded()
  const box = await locator.boundingBox()
  assert.ok(box && box.width > 0 && box.height > 0, 'pointer target has no box')
  const x = box.x + box.width / 2
  const y = box.y + box.height / 2
  await page.mouse.move(x, y)
  await page.mouse.down()
  await page.mouse.up()
}

async function startServer(shop) {
  if (shop) process.env.VITE_PLAY_SHOP = '1'
  else delete process.env.VITE_PLAY_SHOP
  process.env.VITE_PLAY_BUILD = '1'
  const server = await createServer({
    server: { host: '127.0.0.1', port: 0 },
    cacheDir: `node_modules/.vite-founders-${shop ? 'on' : 'off'}`,
    logLevel: 'warn',
  })
  await server.listen()
  const address = server.httpServer?.address()
  const port = address && typeof address === 'object' ? address.port : 0
  assert.ok(port > 0, 'founders lamp server has a port')
  return { server, origin: `http://127.0.0.1:${port}/` }
}

async function dismissImport(page) {
  const later = page.getByRole('button', { name: 'Not now' })
  if (await later.isVisible().catch(() => false)) await pointerClick(page, later)
}

async function openHome(page) {
  await page.goto('/')
  await page.locator('.welcome').waitFor()
  await dismissImport(page)
  await pointerClick(page, page.getByRole('button', { name: 'Start Easy' }))
  await page.locator('main.hub').waitFor()
}

function savedProgress(page) {
  return page.evaluate(() => {
    const raw = localStorage.getItem('silver-city-progress-v1')
    return raw ? JSON.parse(raw) : null
  })
}

function giftLine(page) {
  return page.getByRole('status').filter({ hasText: FOUNDERS_GIFT_LINE })
}

async function proveGrant(page, shop) {
  await openHome(page)
  const gift = giftLine(page)
  await gift.waitFor()
  const paint = await gift.evaluate((el) => {
    const color = getComputedStyle(el).color
    const probe = document.createElement('span')
    probe.style.color = 'var(--gold)'
    document.body.appendChild(probe)
    const gold = getComputedStyle(probe).color
    probe.remove()
    const step = document.querySelector('.easy-home-steps li.is-now > .easy-coach-step')
    const stepBox = step ? step.getBoundingClientRect() : null
    return {
      className: el.className,
      color,
      gold,
      stepTop: stepBox ? stepBox.top : -1,
      stepBottom: stepBox ? stepBox.bottom : -1,
    }
  })
  assert.doesNotMatch(paint.className, /gold/, 'the gift line is not a gold control')
  assert.notEqual(paint.color, paint.gold, 'the gift line does not use the gold color')
  assert.ok(paint.stepTop >= 0 && paint.stepBottom <= 667, 'the gold step stays on screen')
  if (shop === 'off') {
    await page.screenshot({ path: join(shotDir, 'founders-gift-375x667.png') })
  }
  await page.waitForFunction(() => {
    const raw = localStorage.getItem('silver-city-progress-v1')
    return Boolean(raw && JSON.parse(raw).progress.foundersGiftSeen === true)
  })
  const envelope = await savedProgress(page)
  assert.equal(envelope.schemaVersion, 1)
  assert.match(envelope.progress.firstSeen, /^\d{4}-\d{2}-\d{2}$/)
  assert.ok(envelope.progress.firstSeen <= '2027-01-06')

  await pointerClick(page, page.locator('.topbar').getByRole('button', { name: 'Lock In', exact: true }))
  await page.locator('main.hub').waitFor({ state: 'detached' })
  assert.equal(await giftLine(page).count(), 0)
  assert.equal(await page.getByText(FOUNDERS_GIFT_LINE).count(), 0)

  await pointerClick(page, page.locator('.topbar').getByRole('button', { name: 'Home', exact: true }))
  await page.locator('main.hub').waitFor()
  assert.equal(await giftLine(page).count(), 0, 'the gift line shows once')

  await pointerClick(page, page.locator('.topbar').getByRole('button', { name: 'Settings', exact: true }))
  await page.locator('main.settings').waitFor()
  assert.equal(await page.getByText(FOUNDERS_GIFT_LINE).count(), 0)
  const group = page.getByRole('radiogroup', { name: 'Lamp style' })
  await group.waitFor()
  const founder = page.getByRole('radio', { name: "Founder's Lamp" })
  await founder.waitFor()
  assert.equal(await page.getByRole('radio', { name: 'Classic' }).isChecked(), true)
  if (shop === 'off') {
    assert.match(await page.locator('[data-play-about]').innerText(), /Shop opens soon/)
  } else {
    assert.doesNotMatch(await page.locator('[data-play-about]').innerText(), /Shop opens soon/)
  }
  await pointerClick(page, founder)
  await page.waitForFunction(() => {
    const node = document.querySelector('.lamp-style input[name="lamp-style"]:checked')
    return node instanceof HTMLInputElement && (node.labels?.[0]?.textContent || '').includes("Founder's Lamp")
  })
  const styled = await savedProgress(page)
  assert.equal(styled.progress.lampStyle, 'founders')
  assert.equal(styled.schemaVersion, 1)

  await pointerClick(page, page.locator('.topbar').getByRole('button', { name: 'Home', exact: true }))
  await page.locator('.city-overworld.is-style-founders').waitFor()
  const star = await page.locator('.city-overworld.is-style-founders').evaluate((el) => {
    const badge = getComputedStyle(el, '::after')
    return { content: badge.content, width: Number.parseFloat(badge.width) }
  })
  assert.notEqual(star.content, 'none')
  assert.ok(star.width >= 14, `star badge width ${star.width}`)
  assert.equal(await page.getByText(FOUNDERS_GIFT_LINE).count(), 0)
  assert.equal(await page.locator('.checkout-sheet').count(), 0)
  if (shop === 'off') {
    await page.screenshot({ path: join(shotDir, 'founders-lamp-375x667.png') })
    assert.doesNotMatch(await page.locator('body').innerText(), /\$\d|\bBuy\b|\bSKU\b/)
  }
}

async function proveLate(page) {
  await openHome(page)
  assert.equal(await page.getByText(FOUNDERS_GIFT_LINE).count(), 0)
  const envelope = await savedProgress(page)
  assert.equal(envelope.progress.firstSeen, '2027-01-07')
  assert.equal(envelope.schemaVersion, 1)
  await pointerClick(page, page.locator('.topbar').getByRole('button', { name: 'Settings', exact: true }))
  await page.locator('main.settings').waitFor()
  assert.equal(await page.getByRole('radio', { name: "Founder's Lamp" }).count(), 0)
  assert.equal(await page.getByRole('radiogroup', { name: 'Lamp style' }).count(), 0)
  assert.equal(await page.locator('.city-overworld.is-style-founders').count(), 0)
}

async function withPage(browser, origin, run, { late = false } = {}) {
  const context = await browser.newContext({
    viewport: { width: 375, height: 667 },
    baseURL: origin,
  })
  if (late) {
    await context.addInitScript(() => {
      const fixed = new Date(2027, 0, 7, 12, 0, 0).getTime()
      const Original = Date
      function FakeDate(...args) {
        if (!new.target) return new Original(fixed).toString()
        if (args.length === 0) return new Original(fixed)
        return new Original(...args)
      }
      FakeDate.prototype = Original.prototype
      FakeDate.now = () => fixed
      FakeDate.parse = Original.parse.bind(Original)
      FakeDate.UTC = Original.UTC.bind(Original)
      window.Date = FakeDate
    })
  }
  const page = await context.newPage()
  const errors = []
  page.on('pageerror', (error) => errors.push(String(error)))
  try {
    await run(page)
    assert.deepEqual(errors, [], errors.join('\n'))
  } finally {
    await context.close()
  }
}

const browser = await launchBrowser()
try {
  const off = await startServer(false)
  try {
    await withPage(browser, off.origin, (page) => proveGrant(page, 'off'))
    await withPage(browser, off.origin, (page) => proveLate(page), { late: true })
  } finally {
    await off.server.close()
  }

  const on = await startServer(true)
  try {
    await withPage(browser, on.origin, (page) => proveGrant(page, 'on'))
  } finally {
    await on.server.close()
  }
} finally {
  await browser.close()
}

console.log('check-founders-lamp: ok')
