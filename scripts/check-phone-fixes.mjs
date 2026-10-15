/**
 * Phone Night Watch (1.4.478).
 * The map sheet, the clear-bar buttons, and a walker beside a lamp.
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
  appVersion: '1.4.478',
  savedAt: '2026-10-15T00:00:00.000Z',
  progress: {
    started: true,
    easyMode: true,
    theme: 'candy',
    completed: [],
    lastDailyDate: '2026-10-14',
    held: [],
  },
}

const WIDTHS = [
  [375, 667],
  [412, 915],
  [768, 1024],
]

const TYPES = ['love', 'logic', 'reason', 'science']
const SEATS = [
  { x: 430, y: 160 - 26 },
  { x: 250, y: 300 - 26 },
  { x: 230, y: 440 - 26 },
  { x: 310, y: 580 - 26 },
  { x: 420, y: 430 - 26 },
  { x: 450, y: 210 - 26 },
  { x: 210, y: 740 - 26 },
]

async function launchBrowser() {
  try {
    return await chromium.launch({ headless: true })
  } catch {
    return await chromium.launch({ headless: true, channel: 'chrome' })
  }
}

async function noScroll(page, label) {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  )
  assert.ok(overflow <= 1, `${label} horizontal scroll ${overflow}`)
}

async function openNight(page) {
  await page.goto('/?playtest=1')
  await page.getByRole('button', { name: 'Settings' }).click()
  await page.locator('summary', { hasText: 'Developer' }).click()
  await page.getByRole('button', { name: 'Jump · Night Watch' }).click()
  await page.locator('[data-map-overlay]').waitFor()
}

async function clientSeat(page, seat) {
  return page.evaluate((spot) => {
    const svg = document.querySelector('.defend-board')
    if (!(svg instanceof SVGSVGElement)) return null
    const ctm = svg.getScreenCTM()
    if (!ctm) return null
    const point = svg.createSVGPoint()
    point.x = spot.x
    point.y = spot.y
    const client = point.matrixTransform(ctm)
    const hud = [...document.querySelectorAll('.nw-rail, .nw-docks, .nw-balloon-slot, .nw-wave-overlay')]
    const covered = hud.some((node) => {
      const box = node.getBoundingClientRect()
      return (
        box.width > 1 &&
        client.x >= box.left &&
        client.x <= box.right &&
        client.y >= box.top &&
        client.y <= box.bottom
      )
    })
    const hit = document.elementFromPoint(client.x, client.y)
    return { x: client.x, y: client.y, covered, onBoard: Boolean(hit && hit.closest('.defend-board')) }
  }, seat)
}

async function plantFour(page) {
  await page.locator('.defend-board').waitFor()
  let placed = 0
  for (const seat of SEATS) {
    if (placed >= 4) break
    const point = await clientSeat(page, seat)
    if (!point || point.covered || !point.onBoard) continue
    const type = TYPES[placed]
    await page.locator(`[data-type="${type}"]`).click()
    await page.locator(`[data-type="${type}"][aria-pressed="true"]`).waitFor()
    await page.mouse.click(point.x, point.y)
    const count = await page.locator('[data-tower-type]').count()
    if (count > placed) placed = count
  }
  assert.equal(placed, 4, '1.4.478 four lamps are planted after the map panel closes')
}

function findWalker(besideIcon) {
  const lamps = [...document.querySelectorAll('[data-lamp-icon]')]
  const rings = [...document.querySelectorAll('.defend-range')]
  const card = document.querySelector('.defend-tower-card')?.getBoundingClientRect()
  const walkers = [...document.querySelectorAll('[data-walker-id]')]
  for (const walker of walkers) {
    const face = walker.querySelector('.defend-raider-hit')
    if (!face) continue
    const box = face.getBoundingClientRect()
    const x = box.x + box.width / 2
    const y = box.y + box.height / 2
    if (x < 0 || y < 0) continue
    const onIcon = lamps.some((lamp) => {
      const icon = lamp.getBoundingClientRect()
      return x >= icon.left && x <= icon.right && y >= icon.top && y <= icon.bottom
    })
    if (besideIcon && onIcon) continue
    if (!besideIcon && card) {
      const inside =
        x >= card.left && x <= card.right && y >= card.top && y <= card.bottom
      if (inside) continue
    }
    const inRing = rings.some((ring) => {
      const ringBox = ring.getBoundingClientRect()
      const cx = ringBox.x + ringBox.width / 2
      const cy = ringBox.y + ringBox.height / 2
      const radius = ringBox.width / 2
      return Math.hypot(x - cx, y - cy) <= radius * 0.92
    })
    if (besideIcon && !inRing) continue
    const node = document.elementFromPoint(x, y)
    const hit = node?.closest?.('[data-walker-id]')
    if (!hit) continue
    return { x, y, id: hit.getAttribute('data-walker-id') }
  }
  return null
}

async function tapTotals(page) {
  return page.evaluate(() => {
    const node = document.querySelector('[data-tap-hits]')
    return {
      hits: Number(node?.getAttribute('data-tap-hits') ?? '0'),
      misses: Number(node?.getAttribute('data-tap-misses') ?? '0'),
    }
  })
}

async function tapWalker(page, spot, label) {
  const before = await tapTotals(page)
  await page.mouse.click(spot.x, spot.y)
  await page.waitForTimeout(250)
  const after = await tapTotals(page)
  assert.ok(
    after.hits + after.misses > before.hits + before.misses,
    `${label} reaches the walker through the glow gate (${before.hits}+${before.misses} -> ${after.hits}+${after.misses})`,
  )
}

async function buttonRects(page) {
  return page.locator('.defend-clear-row button').evaluateAll((nodes) =>
    nodes.map((node) => {
      const rect = node.getBoundingClientRect()
      return {
        name: node.getAttribute('aria-label') || node.textContent.trim(),
        x: rect.x,
        y: rect.y,
        w: rect.width,
        h: rect.height,
      }
    }),
  )
}

export async function checkPhoneFixes() {
  const server = await createServer({ server: { host: '127.0.0.1', port: 0 } })
  await server.listen()
  const address = server.httpServer?.address()
  const port = address && typeof address === 'object' ? address.port : 0
  assert.ok(port > 0, '1.4.478 phone server has a port')
  const browser = await launchBrowser()
  const errors = []
  try {
    for (const [width, height] of WIDTHS) {
      const context = await browser.newContext({
        baseURL: `http://127.0.0.1:${port}/`,
        viewport: { width, height },
        deviceScaleFactor: 1,
        reducedMotion: 'reduce',
      })
      await context.addInitScript(
        (payload) => localStorage.setItem(payload.key, JSON.stringify(payload.save)),
        { key: STORAGE_KEY, save: SAVE },
      )
      const page = await context.newPage()
      page.on('pageerror', (error) => errors.push(`${width} ${error}`))
      page.on('console', (msg) => {
        if (msg.type() === 'error') errors.push(`${width} ${msg.text()}`)
      })
      await openNight(page)
      await noScroll(page, `1.4.478 map sheet at ${width}`)
      const locked = page.locator('[data-map-locked="yes"]')
      assert.equal(await locked.count(), 5, `1.4.478 ${width} locks every map after Silver City`)
      const reasons = []
      for (let index = 0; index < 5; index += 1) {
        const reason = locked.nth(index).locator('[data-map-reason]')
        const text = (await reason.innerText()).replace(/\s+/g, ' ').trim()
        assert.match(text, /^Beat round 10 on .+ to unlock$/, `1.4.478 ${width} lock line ${text}`)
        reasons.push(text)
        const seen = await reason.evaluate((node) => {
          const rect = node.getBoundingClientRect()
          return {
            clipped: node.scrollWidth > node.clientWidth + 1 || node.scrollHeight > node.clientHeight + 1,
            inView:
              rect.width > 8 &&
              rect.height > 8 &&
              rect.top >= -1 &&
              rect.left >= -1 &&
              rect.right <= window.innerWidth + 1 &&
              rect.bottom <= window.innerHeight + 1,
          }
        })
        assert.equal(seen.clipped, false, `1.4.478 ${width} reason is fully visible: ${text}`)
        assert.equal(seen.inView, true, `1.4.478 ${width} reason is on screen: ${text}`)
      }
      assert.equal(new Set(reasons).size, reasons.length, `1.4.478 ${width} each locked map has its own reason`)
      const overlap = await page.locator('[data-map-pick] button').evaluateAll((nodes) => {
        const boxes = nodes.map((node) => node.getBoundingClientRect())
        for (let i = 0; i < boxes.length; i += 1) {
          for (let j = i + 1; j < boxes.length; j += 1) {
            const a = boxes[i]
            const b = boxes[j]
            const wide = Math.min(a.right, b.right) - Math.max(a.left, b.left)
            const tall = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top)
            if (wide > 1 && tall > 1) return true
          }
        }
        return false
      })
      assert.equal(overlap, false, `1.4.478 ${width} map pills do not cover each other`)
      await page.locator('[data-map="a2"]').click()
      await page.locator('[data-map-overlay]').waitFor({ state: 'detached' })
      await page.locator('#defend-plant-first').waitFor()
      const reached = await page.evaluate(() => {
        const road = document.querySelector('.defend-board')
        if (!road) return false
        const box = road.getBoundingClientRect()
        const node = document.elementFromPoint(box.x + box.width * 0.42, box.y + box.height * 0.45)
        return Boolean(node?.closest?.('.defend-board')) && !node?.closest?.('[data-map-overlay]')
      })
      assert.equal(reached, true, `1.4.478 ${width} a pick clears the panel and taps reach the map`)
      await noScroll(page, `1.4.478 after the pick at ${width}`)

      await plantFour(page)
      await page.locator('.defend-go').click()
      await page.locator('.defend-page.is-easy-tap').waitFor()
      let beside = null
      const started = Date.now()
      while (Date.now() - started < 30_000 && !beside) {
        beside = await page.evaluate(findWalker, true)
        if (!beside) await page.waitForTimeout(200)
      }
      assert.ok(beside, `1.4.478 ${width} a walker stands in a lamp ring beside the icon`)
      await tapWalker(page, beside, `1.4.478 ${width} walker beside the lamp`)
      const iconAt = await page.evaluate(() => {
        const lamps = [...document.querySelectorAll('[data-lamp-icon]')]
        for (const lamp of lamps) {
          const box = lamp.getBoundingClientRect()
          if (box.width < 8 || box.height < 8) continue
          const x = box.x + box.width / 2
          const y = box.y + box.height / 2
          const node = document.elementFromPoint(x, y)
          if (node?.closest?.('[data-lamp-icon]') === lamp) return { x, y, id: lamp.getAttribute('data-clear-lamp') }
        }
        const first = lamps[0]
        const box = first?.getBoundingClientRect()
        const x = box ? box.x + box.width / 2 : 0
        const y = box ? box.y + box.height / 2 : 0
        const node = document.elementFromPoint(x, y)
        return {
          x,
          y,
          id: '',
          miss: `${node?.tagName ?? 'none'}.${node?.className?.toString?.() ?? ''}`.slice(0, 80),
        }
      })
      assert.ok(iconAt?.id, `1.4.478 ${width} the icon tap lands on the lamp (${iconAt?.miss ?? 'none'})`)
      await page.mouse.click(iconAt.x, iconAt.y)
      await page.locator('.defend-tower-card').waitFor()
      let outside = null
      const cardStarted = Date.now()
      while (Date.now() - cardStarted < 8_000 && !outside) {
        outside = await page.evaluate(findWalker, false)
        if (!outside) await page.waitForTimeout(200)
      }
      assert.ok(outside, `1.4.478 ${width} a walker outside the open card can be tapped`)
      await tapWalker(page, outside, `1.4.478 ${width} walker outside the card`)
      await page.locator(`[data-clear-lamp="${iconAt.id}"]`).click({ force: true })
      await page.locator('.defend-tower-card').waitFor({ state: 'detached' })

      await page.locator('.defend-page.is-boost').waitFor({ timeout: 70_000 })
      await noScroll(page, `1.4.478 clear bar at ${width}`)
      const sparks = await page.locator('.nw-balloon').getAttribute('aria-label')
      const sparkCount = Number((sparks ?? '').replace(/[^\d]/g, '') || '0')
      assert.ok(sparkCount < 5, `1.4.478 ${width} round 1 leaves fewer than 5 sparks (saw ${sparkCount})`)
      const before = await buttonRects(page)
      assert.ok(before.length >= 3, `1.4.478 ${width} the clear bar has its buttons`)
      await page.locator('[data-new-lamp="yes"]').click()
      await page.locator('[data-clear-note="yes"]').waitFor()
      const note = (await page.locator('.defend-clear-note').innerText()).trim()
      assert.match(note, /^Need \d+ sparks$/, `1.4.478 ${width} the clear bar says ${note}`)
      const noteBox = await page.locator('.defend-clear-note').boundingBox()
      assert.ok(noteBox && noteBox.y >= -1 && noteBox.x >= -1, `1.4.478 ${width} the spark note is on screen`)
      const after = await buttonRects(page)
      assert.equal(after.length, before.length, `1.4.478 ${width} the clear bar keeps its buttons`)
      for (const was of before) {
        const now = after.find((item) => item.name === was.name)
        assert.ok(now, `1.4.478 ${width} still has ${was.name}`)
        assert.ok(Math.abs(now.x - was.x) <= 1 && Math.abs(now.y - was.y) <= 1, `1.4.478 ${width} ${was.name} stays put`)
        assert.ok(Math.abs(now.w - was.w) <= 1 && Math.abs(now.h - was.h) <= 1, `1.4.478 ${width} ${was.name} keeps its size`)
      }
      await noScroll(page, `1.4.478 spark note at ${width}`)
      await context.close()
    }
    assert.equal(errors.join('\n'), '', '1.4.478 phone nights stay free of console errors')
  } finally {
    await browser.close()
    await server.close()
  }
  console.log('check-phone-fixes: ok')
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  await checkPhoneFixes()
}
