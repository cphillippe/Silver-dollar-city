/**
 * Live prove for 1.4.480.
 * Real clicks and elementFromPoint. A planted incense still hits.
 * A walker inside a lamp box wins. The map sheet is the top layer.
 * Later rounds field more than three walkers. The clear bar stays put.
 */
import assert from 'node:assert/strict'
import { fileURLToPath } from 'node:url'
import { createServer } from 'vite'
import { chromium } from '@playwright/test'
import { SAVE_KIND } from '../src/lib/save.ts'
import { SAVE_SCHEMA_VERSION, STORAGE_KEY } from '../src/config/app.ts'
import { DEFEND_PATH } from '../src/nightWatch/path/data.ts'

const SAVE = {
  kind: SAVE_KIND,
  schemaVersion: SAVE_SCHEMA_VERSION,
  appVersion: '1.4.480',
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

const LOCKS = {
  'far-hills': 'Beat round 10 on Silver City to unlock',
  map03: 'Beat round 10 on The Far Hills to unlock',
  map04: 'Beat round 10 on Peppermint Pass to unlock',
  map05: 'Beat round 10 on Caramel Canyon to unlock',
  map06: 'Beat round 10 on Licorice Woods to unlock',
}

/** Near (160, 380), close enough to the road that the cloud covers walkers. */
const INCENSE_SEATS = [
  { x: 233, y: 368 },
  { x: 220, y: 370 },
  { x: 244, y: 398 },
  { x: 160, y: 380 },
]

async function launchBrowser() {
  try {
    return await chromium.launch({ headless: true })
  } catch {
    return await chromium.launch({ headless: true, channel: 'chrome' })
  }
}

function listen(page, errors, label) {
  page.on('pageerror', (error) => errors.push(`${label} ${error}`))
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(`${label} ${msg.text()}`)
  })
}

async function openJump(page, search) {
  await page.goto(`/${search}`)
  await page.getByRole('button', { name: 'Settings' }).click()
  await page.locator('summary', { hasText: 'Developer' }).click()
  await page.getByRole('button', { name: 'Jump · Night Watch' }).click()
  await page.locator('.defend-board').waitFor()
}

async function tapTotals(page) {
  return page.evaluate(() => {
    const node = document.querySelector('[data-tap-hits]')
    return {
      hits: Number(node?.getAttribute('data-tap-hits') ?? '0'),
      misses: Number(node?.getAttribute('data-tap-misses') ?? '0'),
      damage: Number(node?.getAttribute('data-tap-damage') ?? '0'),
    }
  })
}

async function mapClick(page, spot) {
  const point = await page.evaluate((map) => {
    const svg = document.querySelector('.defend-board')
    if (!(svg instanceof SVGSVGElement)) return null
    const ctm = svg.getScreenCTM()
    if (!ctm) return null
    const p = svg.createSVGPoint()
    p.x = map.x
    p.y = map.y
    const client = p.matrixTransform(ctm)
    return { x: client.x, y: client.y }
  }, spot)
  assert.ok(point, 'map point is on screen')
  await page.mouse.click(point.x, point.y)
}

async function cloudCoversRoad(page) {
  return page.evaluate((path) => {
    const cloud = document.querySelector('[data-incense-cloud="yes"]')
    const svg = document.querySelector('.defend-board')
    if (!(cloud instanceof SVGGraphicsElement) || !(svg instanceof SVGSVGElement)) return null
    const ctm = svg.getScreenCTM()
    if (!ctm) return null
    const box = cloud.getBoundingClientRect()
    const cx = box.x + box.width / 2
    const cy = box.y + box.height / 2
    const radius = box.width / 2
    let nearest = Infinity
    for (const spot of path) {
      const p = svg.createSVGPoint()
      p.x = spot.x
      p.y = spot.y
      const client = p.matrixTransform(ctm)
      nearest = Math.min(nearest, Math.hypot(client.x - cx, client.y - cy))
    }
    return { nearest, radius, covers: nearest < radius - 4 }
  }, DEFEND_PATH)
}

async function setPaused(page, paused) {
  const name = paused ? 'Pause walkers' : 'Resume walkers'
  const button = page.getByRole('button', { name })
  if ((await button.count()) > 0) await button.click()
}

async function waitCue(page, inside, ms) {
  return page.evaluate(
    ({ wantInside, ms: limit }) =>
      new Promise((resolve) => {
        const started = performance.now()
        const look = () => {
          const cloud = document.querySelector('[data-incense-cloud="yes"]')
          const cue = document.querySelector('.defend-raider.is-easy-cue')
          if (!cloud || !cue) return null
          const id = cue.getAttribute('data-walker-id')
          const face = document.querySelector(`[data-walker-tap="${id}"]`)
          if (!face) return null
          const cloudBox = cloud.getBoundingClientRect()
          const faceBox = face.getBoundingClientRect()
          const cx = cloudBox.x + cloudBox.width / 2
          const cy = cloudBox.y + cloudBox.height / 2
          const radius = cloudBox.width / 2 - 2
          const fx = faceBox.x + faceBox.width / 2
          const fy = faceBox.y + faceBox.height / 2
          const faceR = faceBox.width / 2
          // Feet sit a few pixels under the face. The bonus reads the feet, so the face
          // has to be clearly inside or clearly outside the cloud.
          const faceDist = Math.hypot(fx - cx, fy - cy)
          if (wantInside ? faceDist > radius - 16 : faceDist < radius + 16) return null
          const step = Math.max(8, faceR / 4)
          for (let y = faceBox.top + 4; y < faceBox.bottom; y += step) {
            for (let x = faceBox.left + 4; x < faceBox.right; x += step) {
              if (Math.hypot(x - fx, y - fy) > faceR - 2) continue
              const inCloud = Math.hypot(x - cx, y - cy) <= radius
              if (inCloud !== wantInside) continue
              const node = document.elementFromPoint(x, y)
              const top = node?.closest?.('[data-walker-tap]')?.getAttribute('data-walker-tap') ?? ''
              if (top !== id) continue
              return { x, y, id, inCloud, top }
            }
          }
          return null
        }
        const tick = () => {
          const found = look()
          if (found) {
            const pause = [...document.querySelectorAll('button')].find((button) =>
              (button.textContent ?? '').includes('Pause walkers'),
            )
            pause?.click()
            requestAnimationFrame(() => {
              requestAnimationFrame(() => resolve(look() ?? found))
            })
            return
          }
          if (performance.now() - started > limit) {
            resolve(null)
            return
          }
          requestAnimationFrame(tick)
        }
        tick()
      }),
    { wantInside: inside, ms },
  )
}

async function checkMaps(browser, port, errors) {
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
    listen(page, errors, `map ${width}`)
    await page.goto('/')
    await page.locator('.easy-night-watch button').click()
    await page.locator('[data-map-overlay="yes"]').waitFor()
    const sheet = await page.evaluate(() => {
      const overlay = document.querySelector('[data-map-overlay="yes"]')
      if (!overlay) return null
      const box = overlay.getBoundingClientRect()
      const x = box.x + box.width / 2
      const y = box.y + Math.min(box.height / 2, 80)
      const node = document.elementFromPoint(x, y)
      return {
        w: box.width,
        h: box.height,
        top: Boolean(node?.closest?.('[data-map-overlay="yes"]')),
      }
    })
    assert.ok(sheet && sheet.w > 200 && sheet.h > 120, `1.4.480 ${width} map sheet has a size`)
    assert.equal(sheet.top, true, `1.4.480 ${width} the map sheet is the top layer`)
    for (const [id, reason] of Object.entries(LOCKS)) {
      const button = page.locator(`[data-map="${id}"]`)
      const text = (await button.locator('[data-map-reason="yes"]').innerText()).replace(/\s+/g, ' ').trim()
      assert.equal(text, reason, `1.4.480 ${width} ${id} says why it is locked`)
      const hit = await button.locator('[data-map-reason="yes"]').evaluate((node) => {
        const rect = node.getBoundingClientRect()
        const x = rect.x + rect.width / 2
        const y = rect.y + rect.height / 2
        const top = document.elementFromPoint(x, y)
        return {
          inView: rect.width > 8 && rect.height > 8 && rect.top >= -1 && rect.bottom <= window.innerHeight + 1,
          overlay: Boolean(top?.closest?.('[data-map-overlay="yes"]')),
          map: top?.closest?.('[data-map]')?.getAttribute('data-map') ?? '',
        }
      })
      assert.equal(hit.inView, true, `1.4.480 ${width} ${reason} is on screen`)
      assert.equal(hit.overlay, true, `1.4.480 ${width} ${reason} is on the map sheet`)
      assert.equal(hit.map, id, `1.4.480 ${width} a tap on the reason hits ${id}`)
    }
    await context.close()
  }
}

async function checkBareBegin(browser, port, errors) {
  const context = await browser.newContext({
    baseURL: `http://127.0.0.1:${port}/`,
    viewport: { width: 412, height: 915 },
    deviceScaleFactor: 1,
  })
  await context.addInitScript(
    (payload) => localStorage.setItem(payload.key, JSON.stringify(payload.save)),
    { key: STORAGE_KEY, save: SAVE },
  )
  const page = await context.newPage()
  listen(page, errors, 'bare')
  await openJump(page, '?playtest=1&nwLamps=0')
  await page.locator('[data-map="a2"]').click()
  await page.locator('[data-map-overlay]').waitFor({ state: 'detached' })
  await page.locator('.defend-go.is-after-plant').waitFor()
  assert.equal(await page.locator('#defend-plant-first').count(), 0, '1.4.480 playtest nwLamps=0 hides Plant a lamp first')
  assert.equal(await page.locator('.defend-go').getAttribute('disabled'), null, '1.4.480 playtest nwLamps=0 Begin is live')
  await context.close()
}

async function checkCrowd(browser, port, errors) {
  const context = await browser.newContext({
    baseURL: `http://127.0.0.1:${port}/`,
    viewport: { width: 412, height: 915 },
    deviceScaleFactor: 1,
  })
  await context.addInitScript(
    (payload) => localStorage.setItem(payload.key, JSON.stringify(payload.save)),
    { key: STORAGE_KEY, save: SAVE },
  )
  const page = await context.newPage()
  listen(page, errors, 'crowd')
  await openJump(page, '?playtest=1&nwRound=17&nwLamps=0')
  await page.locator('.defend-go.is-after-plant').waitFor()
  assert.equal(await page.locator('#defend-plant-first').count(), 0, '1.4.480 round 17 with nwLamps=0 can begin')
  await page.locator('.defend-go').click()
  await page.locator('.defend-page.is-easy-tap').waitFor()
  let peak = 0
  let sawFast = false
  let waiting = ''
  const started = Date.now()
  while (Date.now() - started < 28_000) {
    const snap = await page.evaluate(() => {
      const live = document.querySelectorAll('.defend-raider:not(.is-turned):not(.is-mini)')
      const fast = document.querySelectorAll('.defend-raider.is-fast:not(.is-turned), .defend-raider[data-gait="fast"]:not(.is-turned)')
      return {
        live: live.length,
        fast: fast.length,
        label: document.querySelector('.defend-count')?.textContent ?? '',
      }
    })
    peak = Math.max(peak, snap.live)
    if (snap.fast > 0) sawFast = true
    waiting = snap.label
    if (peak >= 6 && sawFast) break
    await page.waitForTimeout(200)
  }
  assert.match(waiting, /left/, `1.4.480 round 17 still shows walkers left (${waiting})`)
  assert.ok(peak >= 4, `1.4.480 round 17 fields more than three walkers (saw ${peak})`)
  assert.equal(sawFast, true, '1.4.480 a fast walker reaches the road on round 17')
  await context.close()
}

async function checkLampBox(browser, port, errors) {
  const context = await browser.newContext({
    baseURL: `http://127.0.0.1:${port}/`,
    viewport: { width: 375, height: 667 },
    deviceScaleFactor: 1,
    reducedMotion: 'reduce',
  })
  await context.addInitScript(
    (payload) => localStorage.setItem(payload.key, JSON.stringify(payload.save)),
    { key: STORAGE_KEY, save: SAVE },
  )
  const page = await context.newPage()
  listen(page, errors, 'lamp')
  await openJump(page, '?playtest=1&nwRound=1&nwLamps=0')
  await page.locator('.defend-go.is-after-plant').waitFor()
  // Spawn t is 0.50. This seat's icon contains that face, and the spot is open ground.
  await mapClick(page, { x: 507, y: 598 })
  await page.locator('.defend-clear-lamp[data-tower-type="love"]').waitFor()
  await page.locator('.defend-go.is-after-plant').click()
  await page.locator('.defend-page.is-easy-tap').waitFor()
  const lampHit = await page.evaluate(
    () =>
      new Promise((resolve) => {
        const started = performance.now()
        let closest = Infinity
        const look = () => {
          const cue = document.querySelector('.defend-raider.is-easy-cue')
          const id = cue?.getAttribute('data-walker-id')
          if (!id) return null
          for (const lamp of document.querySelectorAll('.defend-clear-lamp:not([data-incense-icon="yes"])')) {
            const lampBox = lamp.getBoundingClientRect()
            if (lampBox.width < 16 || lampBox.height < 16) continue
            const cx = lampBox.x + lampBox.width / 2
            const cy = lampBox.y + lampBox.height / 2
            const faceBox = document.querySelector(`[data-walker-tap="${id}"]`)?.getBoundingClientRect()
            if (faceBox) {
              const fx = faceBox.x + faceBox.width / 2
              const fy = faceBox.y + faceBox.height / 2
              closest = Math.min(closest, Math.hypot(fx - cx, fy - cy))
            }
            const step = Math.max(4, Math.min(10, lampBox.width / 4))
            for (let y = lampBox.top + 2; y < lampBox.bottom - 1; y += step) {
              for (let x = lampBox.left + 2; x < lampBox.right - 1; x += step) {
                const node = document.elementFromPoint(x, y)
                const top = node?.closest?.('[data-walker-tap]')?.getAttribute('data-walker-tap') ?? ''
                if (top !== id) continue
                return {
                  x,
                  y,
                  dist: Math.hypot(x - cx, y - cy),
                  lampW: Math.round(lampBox.width),
                  top,
                }
              }
            }
          }
          return null
        }
        const tick = () => {
          const found = look()
          if (found) {
            resolve(found)
            return
          }
          if (performance.now() - started > 30_000) {
            const cue = document.querySelector('.defend-raider.is-easy-cue')
            const id = cue?.getAttribute('data-walker-id')
            const face = id ? document.querySelector(`[data-walker-tap="${id}"]`) : null
            const faceBox = face?.getBoundingClientRect()
            const lamps = [...document.querySelectorAll('.defend-clear-lamp')].map((lamp) => {
              const box = lamp.getBoundingClientRect()
              return { w: Math.round(box.width), x: Math.round(box.x), y: Math.round(box.y), h: Math.round(box.height) }
            })
            const board = document.querySelector('.defend-board')?.getBoundingClientRect()
            resolve({
              miss: true,
              id: id ?? '',
              taps: document.querySelectorAll('[data-walker-tap]').length,
              closest: Math.round(closest),
              face: faceBox ? { x: Math.round(faceBox.x), y: Math.round(faceBox.y), w: Math.round(faceBox.width) } : null,
              lamps,
              board: board ? { x: Math.round(board.x), y: Math.round(board.y), w: Math.round(board.width), h: Math.round(board.height) } : null,
            })
            return
          }
          requestAnimationFrame(tick)
        }
        tick()
      }),
  )
  assert.ok(lampHit?.top, `1.4.480 a walker stands inside a real lamp box ${JSON.stringify(lampHit)}`)
  assert.ok(lampHit.lampW >= 24, `1.4.480 the lamp box is the planted icon (${lampHit.lampW}px)`)
  assert.ok(lampHit.dist < lampHit.lampW * 0.75, `1.4.480 the tap is inside the ${lampHit.lampW}px lamp box`)
  await setPaused(page, true)
  const still = await page.evaluate((spot) => {
    const node = document.elementFromPoint(spot.x, spot.y)
    const top = node?.closest?.('[data-walker-tap]')?.getAttribute('data-walker-tap') ?? ''
    return top === spot.top
  }, lampHit)
  assert.equal(still, true, '1.4.480 the walker still owns the lamp box after the pause')
  const before = await tapTotals(page)
  await page.mouse.click(lampHit.x, lampHit.y)
  await page.waitForTimeout(250)
  const after = await tapTotals(page)
  assert.equal(after.hits, before.hits + 1, '1.4.480 a tap inside the lamp box hits')
  assert.equal(after.misses, before.misses, '1.4.480 a tap inside the lamp box is not a miss')
  assert.ok(after.damage > before.damage, '1.4.480 a tap inside the lamp box applies damage')
  await context.close()
}

async function checkTaps(browser, port, errors) {
  const context = await browser.newContext({
    baseURL: `http://127.0.0.1:${port}/`,
    viewport: { width: 412, height: 915 },
    deviceScaleFactor: 1,
    reducedMotion: 'reduce',
  })
  await context.addInitScript(
    (payload) => localStorage.setItem(payload.key, JSON.stringify(payload.save)),
    { key: STORAGE_KEY, save: SAVE },
  )
  const page = await context.newPage()
  listen(page, errors, 'taps')
  await openJump(page, '?playtest=1&nwSeed=2&nwRound=17&nwLamps=1')
  await page.locator('.defend-go.is-after-plant').click()
  await page.locator('.defend-page.is-easy-tap').waitFor()
  await setPaused(page, true)
  await page.locator('[data-incense-lamp="yes"]').click()
  let planted = false
  for (const seat of INCENSE_SEATS) {
    await mapClick(page, seat)
    await page.waitForTimeout(200)
    if ((await page.locator('[data-tower-type="incense"]').count()) > 0) {
      const cover = await cloudCoversRoad(page)
      if (cover?.covers) {
        planted = true
        break
      }
    }
  }
  assert.equal(planted, true, '1.4.480 incense plants near (160, 380) and the cloud covers the road')

  await page.getByRole('button', { name: 'Resume walkers' }).click()
  const beforeCloud = await tapTotals(page)
  const inside = await waitCue(page, true, 18_000)
  assert.ok(inside?.top, '1.4.480 the cloud tap lands on the walker')
  assert.equal(inside.top, inside.id, '1.4.480 elementFromPoint in the cloud is the walker')
  await page.mouse.click(inside.x, inside.y)
  await page.waitForTimeout(200)
  const afterCloud = await tapTotals(page)
  assert.equal(afterCloud.hits, beforeCloud.hits + 1, '1.4.480 a tap in the incense cloud hits')
  assert.equal(afterCloud.misses, beforeCloud.misses, '1.4.480 a tap in the incense cloud is not a miss')
  assert.equal(afterCloud.damage, beforeCloud.damage + 2, '1.4.480 a tap in the incense cloud applies the +1')

  await page.getByRole('button', { name: 'Resume walkers' }).click()
  const beforeOut = await tapTotals(page)
  const outside = await waitCue(page, false, 18_000)
  assert.ok(outside?.top, '1.4.480 a tap outside the cloud lands on the walker')
  assert.equal(outside.top, outside.id, '1.4.480 elementFromPoint outside the cloud is the walker')
  await page.mouse.click(outside.x, outside.y)
  await page.waitForTimeout(200)
  const afterOut = await tapTotals(page)
  assert.equal(afterOut.hits, beforeOut.hits + 1, '1.4.480 a tap outside the incense cloud hits')
  assert.equal(afterOut.misses, beforeOut.misses, '1.4.480 a tap outside the incense cloud is not a miss')
  assert.equal(afterOut.damage, beforeOut.damage + 1, '1.4.480 a tap outside the cloud stays a plain hit')
  await context.close()
}

async function checkClearBar(browser, port, errors) {
  const context = await browser.newContext({
    baseURL: `http://127.0.0.1:${port}/`,
    viewport: { width: 412, height: 915 },
    deviceScaleFactor: 1,
  })
  await context.addInitScript(
    (payload) => localStorage.setItem(payload.key, JSON.stringify(payload.save)),
    { key: STORAGE_KEY, save: SAVE },
  )
  const page = await context.newPage()
  listen(page, errors, 'clear')
  await openJump(page, '?playtest=1&nwRound=9')
  await page.locator('.defend-go').click()
  await page.locator('.defend-page.is-easy-tap').waitFor()
  const started = Date.now()
  while (Date.now() - started < 90_000 && (await page.locator('.defend-page.is-boost').count()) < 1) {
    const cue = await page.evaluate(() => {
      const face = document.querySelector('.defend-raider.is-easy-cue')
      if (!face) return null
      const id = face.getAttribute('data-walker-id')
      const tap = document.querySelector(`[data-walker-tap="${id}"]`)
      if (!tap) return null
      const box = tap.getBoundingClientRect()
      const x = box.x + box.width / 2
      const y = box.y + box.height / 2
      const node = document.elementFromPoint(x, y)
      if (node?.closest?.('[data-walker-tap]')?.getAttribute('data-walker-tap') !== id) return null
      return { x, y }
    })
    if (cue) await page.mouse.click(cue.x, cue.y)
    await page.waitForTimeout(80)
  }
  await page.locator('.defend-page.is-boost').waitFor()
  const candle = page.locator('.defend-clear-row [data-candle-lamp="yes"]')
  await candle.waitFor()
  const spend = page.locator('.defend-clear-spend')
  const before = await spend.boundingBox()
  assert.ok(before && before.height > 10, '1.4.480 Spend is on the round 9 clear bar')
  const overlap = await page.evaluate(() => {
    const love = document.querySelector('[data-tower-type="love"]')
    const button = document.querySelector('.defend-clear-row [data-candle-lamp="yes"]')
    if (!love || !button) return null
    const a = love.getBoundingClientRect()
    const b = button.getBoundingClientRect()
    const wide = Math.min(a.right, b.right) - Math.max(a.left, b.left)
    const tall = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top)
    const x = b.x + b.width / 2
    const y = b.y + b.height / 2
    const node = document.elementFromPoint(x, y)
    return {
      hit: wide > 1 && tall > 1,
      top: node?.closest?.('[data-candle-lamp]') ? 'candle' : (node?.className?.toString?.() ?? '').slice(0, 40),
    }
  })
  assert.equal(overlap?.hit, true, '1.4.480 the Love icon overlaps the Candle button')
  assert.equal(overlap?.top, 'candle', '1.4.480 the Candle button takes the click')
  await page.locator('[data-new-lamp="yes"]').click()
  await page.waitForTimeout(150)
  const after = await spend.boundingBox()
  assert.ok(after && after.height > 10, '1.4.480 Spend stays visible after a lamp is picked')
  assert.ok(Math.abs(after.x - before.x) <= 1 && Math.abs(after.y - before.y) <= 1, '1.4.480 Spend stays put')
  assert.ok(Math.abs(after.width - before.width) <= 1 && Math.abs(after.height - before.height) <= 1, '1.4.480 Spend keeps its size')
  await context.close()
}

export async function checkLiveProve() {
  const server = await createServer({ server: { host: '127.0.0.1', port: 0 } })
  await server.listen()
  const address = server.httpServer?.address()
  const port = address && typeof address === 'object' ? address.port : 0
  assert.ok(port > 0, '1.4.480 live prove server has a port')
  const browser = await launchBrowser()
  const errors = []
  try {
    await checkMaps(browser, port, errors)
    await checkBareBegin(browser, port, errors)
    await checkCrowd(browser, port, errors)
    await checkLampBox(browser, port, errors)
    await checkTaps(browser, port, errors)
    await checkClearBar(browser, port, errors)
    assert.equal(errors.join('\n'), '', '1.4.480 live prove stays free of console errors')
  } finally {
    await browser.close()
    await server.close()
  }
  console.log('check-live-prove: ok')
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  await checkLiveProve()
}
