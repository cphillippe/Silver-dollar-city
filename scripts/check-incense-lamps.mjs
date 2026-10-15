/**
 * Incense cloud taps and playtest nwLamps (1.4.478).
 * One phone width. The cloud is not the hit. nwLamps=0..2 trims a jump.
 */
import assert from 'node:assert/strict'
import { fileURLToPath } from 'node:url'
import { createServer } from 'vite'
import { chromium } from '@playwright/test'

const SAVE = {
  kind: 'silver-city-save',
  schemaVersion: 1,
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

const SEATS = [
  { x: 470, y: 483 },
  { x: 540, y: 560 },
  { x: 360, y: 700 },
  { x: 310, y: 554 },
]

async function launchBrowser() {
  try {
    return await chromium.launch({ headless: true })
  } catch {
    return await chromium.launch({ headless: true, channel: 'chrome' })
  }
}

async function openNight(page, search) {
  await page.addInitScript((save) => {
    localStorage.setItem('silver-city-progress-v1', JSON.stringify(save))
  }, SAVE)
  await page.goto(`/${search}`)
  await page.getByRole('button', { name: 'Settings' }).click()
  await page.locator('summary', { hasText: 'Developer' }).click()
  await page.getByRole('button', { name: 'Jump · Night Watch' }).click()
  await page.locator('.defend-board').waitFor()
}

async function plantedCount(page) {
  return page.locator('.defend-pad.is-planted').count()
}

export async function checkIncenseLamps() {
  const server = await createServer({ server: { host: '127.0.0.1', port: 0 } })
  await server.listen()
  const address = server.httpServer?.address()
  const port = address && typeof address === 'object' ? address.port : 0
  assert.ok(port > 0, '1.4.478 incense server has a port')
  const browser = await launchBrowser()
  const errors = []
  try {
    const cases = [
      ['?playtest=1&nwRound=15&nwLamps=0', 0],
      ['?playtest=1&nwRound=15&nwLamps=1', 1],
      ['?playtest=1&nwRound=15&nwLamps=2', 2],
      ['?playtest=1&nwRound=15', 4],
      ['?playtest=1&nwRound=15&nwLamps=4', 4],
    ]
    for (const [search, want] of cases) {
      const context = await browser.newContext({
        baseURL: `http://127.0.0.1:${port}/`,
        viewport: { width: 412, height: 915 },
        deviceScaleFactor: 1,
      })
      const page = await context.newPage()
      page.on('pageerror', (err) => errors.push(String(err)))
      page.on('console', (msg) => {
        if (msg.type() === 'error') errors.push(msg.text())
      })
      await openNight(page, search)
      assert.equal(await plantedCount(page), want, `1.4.478 ${search} pre-plants ${want} lamps`)
      if (want === 0) {
        await page.locator('.defend-go.is-after-plant').waitFor()
        assert.equal(await page.locator('#defend-plant-first').count(), 0, '1.4.478 nwLamps=0 can begin')
        const disabled = await page.locator('.defend-go').getAttribute('disabled')
        assert.equal(disabled, null, '1.4.478 nwLamps=0 Begin is live')
      }
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      )
      assert.ok(overflow <= 1, `1.4.478 ${search} has no horizontal scroll`)
      await context.close()
    }

    const context = await browser.newContext({
      baseURL: `http://127.0.0.1:${port}/`,
      viewport: { width: 412, height: 915 },
      deviceScaleFactor: 1,
      reducedMotion: 'reduce',
    })
    const page = await context.newPage()
    page.on('pageerror', (err) => errors.push(String(err)))
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text())
    })
    await openNight(page, '?playtest=1&nwRound=15')
    await page.locator('[data-incense-lamp="yes"]').click()
    let plantedIncense = false
    for (const seat of SEATS) {
      const point = await page.evaluate((spot) => {
        const svg = document.querySelector('.defend-board')
        if (!(svg instanceof SVGSVGElement)) return null
        const ctm = svg.getScreenCTM()
        if (!ctm) return null
        const p = svg.createSVGPoint()
        p.x = spot.x
        p.y = spot.y
        const client = p.matrixTransform(ctm)
        return { x: client.x, y: client.y }
      }, seat)
      if (!point) continue
      await page.mouse.click(point.x, point.y)
      await page.waitForTimeout(150)
      if ((await page.locator('[data-tower-type="incense"]').count()) > 0) {
        plantedIncense = true
        break
      }
    }
    assert.equal(plantedIncense, true, '1.4.478 incense plants beside the road')
    await page.locator('[data-incense-icon="yes"]').click()
    await page.locator('.defend-tower-card').waitFor()
    await page.waitForTimeout(80)
    await page.keyboard.press('Escape')
    await page.locator('.defend-tower-card').waitFor({ state: 'detached' })
    await page.locator('.defend-go').click()
    await page.locator('[data-incense-cloud="yes"]').waitFor()
    const sizes = await page.evaluate(() => {
      const cloud = document.querySelector('[data-incense-cloud="yes"]')
      const icon = document.querySelector('[data-incense-icon="yes"]')
      const cloudBox = cloud.getBoundingClientRect()
      const iconBox = icon.getBoundingClientRect()
      return {
        cloud: Math.round(cloudBox.width),
        icon: Math.round(iconBox.width),
        cloudPe: getComputedStyle(cloud).pointerEvents,
        iconPe: getComputedStyle(icon).pointerEvents,
        fill: getComputedStyle(cloud).fill,
      }
    })
    const cloudAlpha = Number(/rgba?\([^)]+,\s*([\d.]+)\s*\)/.exec(sizes.fill)?.[1] ?? '0')
    assert.ok(cloudAlpha >= 0.3, `1.4.478 the incense cloud stays visible (${sizes.fill})`)
    assert.ok(sizes.cloud >= 90, `1.4.478 the incense cloud is the wide ring (${sizes.cloud}px)`)
    assert.ok(sizes.icon <= 48, `1.4.478 the incense target is the icon (${sizes.icon}px)`)
    assert.equal(sizes.cloudPe, 'none', '1.4.478 the cloud does not take a tap')
    assert.equal(sizes.iconPe, 'none', '1.4.478 the incense button lets the wave through')

    const edge = await page.evaluate(() => {
      const cloud = document.querySelector('[data-incense-cloud="yes"]').getBoundingClientRect()
      const cx = cloud.x + cloud.width / 2
      const cy = cloud.y + cloud.height / 2
      const radius = cloud.width / 2
      for (const turn of [0.4, 1.2, 2.1, 2.8, 3.6, 4.5, 5.4]) {
        const x = cx + Math.cos(turn) * radius * 0.72
        const y = cy + Math.sin(turn) * radius * 0.72
        const node = document.elementFromPoint(x, y)
        const lamp = Boolean(node?.closest?.('[data-lamp-icon], [data-incense-hit], .defend-pad'))
        const walker = Boolean(node?.closest?.('[data-walker-id]'))
        const cloudHit = node?.getAttribute?.('data-incense-cloud') === 'yes'
        if (lamp || walker || cloudHit) continue
        return { x, y, ok: true }
      }
      return { ok: false }
    })
    assert.equal(edge.ok, true, '1.4.478 a spot in the cloud is not the lamp')
    await page.mouse.click(edge.x, edge.y)
    await page.waitForTimeout(200)
    assert.equal(await page.locator('.defend-tower-card').count(), 0, '1.4.478 the cloud does not open the card')

    let caught = null
    const deadline = Date.now() + 25000
    while (Date.now() < deadline && !caught) {
      caught = await page.evaluate(() => {
        const icon = document.querySelector('[data-incense-icon="yes"]')
        const readout = document.querySelector('[data-tap-hits]')
        if (!icon || !readout) return null
        const iconBox = icon.getBoundingClientRect()
        const x = iconBox.x + iconBox.width / 2
        const y = iconBox.y + iconBox.height / 2
        const walkers = [...document.querySelectorAll('[data-walker-id]')]
        for (const walker of walkers) {
          if (walker.getAttribute('data-boss') === 'yes') continue
          if (!walker.classList.contains('is-easy-cue')) continue
          const face = walker.querySelector('.defend-raider-hit')
          if (!face) continue
          const box = face.getBoundingClientRect()
          const radius = box.width / 2
          const fx = box.x + box.width / 2
          const fy = box.y + box.height / 2
          if (Math.hypot(x - fx, y - fy) > radius * 0.85) continue
          const node = document.elementFromPoint(x, y)
          if (node?.closest?.('[data-walker-id]') !== walker) continue
          const before = {
            hits: Number(readout.getAttribute('data-tap-hits') ?? '0'),
            misses: Number(readout.getAttribute('data-tap-misses') ?? '0'),
            damage: Number(readout.getAttribute('data-tap-damage') ?? '0'),
          }
          walker.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, clientX: x, clientY: y }))
          return {
            before,
            after: {
              hits: Number(readout.getAttribute('data-tap-hits') ?? '0'),
              misses: Number(readout.getAttribute('data-tap-misses') ?? '0'),
              damage: Number(readout.getAttribute('data-tap-damage') ?? '0'),
            },
          }
        }
        return null
      })
      if (!caught) await page.waitForTimeout(200)
    }
    assert.ok(caught, '1.4.478 a walker on the incense lamp takes the tap')
    assert.ok(
      caught.after.hits + caught.after.misses > caught.before.hits + caught.before.misses,
      '1.4.478 a walker on the incense lamp still runs the glow gate',
    )

    let iconAt = null
    const iconDeadline = Date.now() + 8000
    while (Date.now() < iconDeadline && !iconAt) {
      iconAt = await page.evaluate(() => {
        const icon = document.querySelector('[data-incense-hit="icon"]')
        if (!icon) return null
        const box = icon.getBoundingClientRect()
        const x = box.x + box.width / 2
        const y = box.y + box.height / 2
        const node = document.elementFromPoint(x, y)
        if (node?.closest?.('[data-walker-id]')) return null
        const pad = node?.closest?.('.defend-pad.is-incense')
        if (!pad && node !== icon) return null
        return { x, y }
      })
      if (!iconAt) await page.waitForTimeout(200)
    }
    assert.ok(iconAt, '1.4.478 the incense icon can be tapped when the lamp is clear')
    await page.mouse.click(iconAt.x, iconAt.y)
    await page.waitForTimeout(300)
    assert.equal(await page.locator('.defend-tower-card').count(), 0, '1.4.478 the incense icon stays shut during a wave')
    await context.close()
    assert.equal(errors.join('\n'), '', '1.4.478 incense nights stay free of console errors')
  } finally {
    await browser.close()
    await server.close()
  }
  console.log('check-incense-lamps: ok')
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  await checkIncenseLamps()
}
