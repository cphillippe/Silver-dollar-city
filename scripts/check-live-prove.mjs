/**
 * Live prove for 1.4.491.
 * Real clicks and elementFromPoint. A planted incense still hits.
 * A walker inside a lamp box wins. The map sheet is the top layer.
 * Later rounds field more than three walkers. The clear bar stays put.
 * The Love lamp's box does not cover Candle or Spend.
 */
import assert from 'node:assert/strict'
import { mkdirSync } from 'node:fs'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { build } from 'esbuild'
import { createElement } from 'react'
import { renderToString } from 'react-dom/server'
import { createServer } from 'vite'
import { chromium } from '@playwright/test'
import { SAVE_KIND } from '../src/lib/save.ts'
import { SAVE_SCHEMA_VERSION, STORAGE_KEY } from '../src/config/app.ts'
import { DEFEND_PATH } from '../src/nightWatch/path/data.ts'

const SAVE = {
  kind: SAVE_KIND,
  schemaVersion: SAVE_SCHEMA_VERSION,
  appVersion: '1.4.491',
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
    assert.ok(sheet && sheet.w > 200 && sheet.h > 120, `1.4.482 ${width} map sheet has a size`)
    assert.equal(sheet.top, true, `1.4.482 ${width} the map sheet is the top layer`)
    for (const [id, reason] of Object.entries(LOCKS)) {
      const button = page.locator(`[data-map="${id}"]`)
      const text = (await button.locator('[data-map-reason="yes"]').innerText()).replace(/\s+/g, ' ').trim()
      assert.equal(text, reason, `1.4.482 ${width} ${id} says why it is locked`)
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
      assert.equal(hit.inView, true, `1.4.482 ${width} ${reason} is on screen`)
      assert.equal(hit.overlay, true, `1.4.482 ${width} ${reason} is on the map sheet`)
      assert.equal(hit.map, id, `1.4.482 ${width} a tap on the reason hits ${id}`)
    }
    if (width === 375) {
      const live = await page.evaluate(() => {
        const overlay = document.querySelector('[data-map-overlay="yes"]')
        const rule = document.querySelector('.nw-map-rule')
        const style = overlay instanceof HTMLElement ? getComputedStyle(overlay) : null
        const ruleBox = rule?.getBoundingClientRect()
        const overlayBox = overlay?.getBoundingClientRect()
        const reasons = [...document.querySelectorAll('[data-map-reason="yes"]')].map((node) => {
          const rect = node.getBoundingClientRect()
          const x = rect.x + Math.min(rect.width / 2, 24)
          const y = rect.y + rect.height / 2
          const top = document.elementFromPoint(x, y)
          return {
            text: (node.textContent ?? '').replace(/\s+/g, ' ').trim(),
            w: rect.width,
            h: rect.height,
            left: rect.left,
            right: rect.right,
            top: rect.top,
            bottom: rect.bottom,
            inOverlay: Boolean(
              overlayBox &&
                rect.top >= overlayBox.top - 1 &&
                rect.bottom <= overlayBox.bottom + 1 &&
                rect.left >= overlayBox.left - 1 &&
                rect.right <= overlayBox.right + 1,
            ),
            hit: top?.closest?.('[data-map-reason="yes"]') ? top.closest('[data-map]')?.getAttribute('data-map') ?? '' : '',
          }
        })
        return {
          display: style?.display ?? '',
          visibility: style?.visibility ?? '',
          opacity: Number(style?.opacity ?? '0'),
          rule: (rule?.textContent ?? '').replace(/\s+/g, ' ').trim(),
          ruleIn: Boolean(
            ruleBox && ruleBox.height > 8 && ruleBox.top >= -1 && ruleBox.bottom <= window.innerHeight + 1,
          ),
          reasons,
          vh: window.innerHeight,
          vw: window.innerWidth,
        }
      })
      assert.equal(live.display, 'flex', '1.4.483 Easy at 375 shows the map list')
      assert.equal(live.visibility, 'visible', '1.4.483 Easy at 375 the map list is visible')
      assert.ok(live.opacity > 0.5, '1.4.483 Easy at 375 the map list is not faded out')
      assert.equal(live.rule, 'Choose a map', '1.4.483 Easy at 375 says Choose a map')
      assert.equal(live.ruleIn, true, '1.4.483 Choose a map is on screen at 375')
      assert.equal(live.reasons.length, Object.keys(LOCKS).length, '1.4.483 every locked map has a reason at 375')
      for (const reason of live.reasons) {
        assert.ok(reason.w > 8 && reason.h > 8, `1.4.483 ${reason.text} has a box at 375`)
        assert.ok(reason.top >= -1 && reason.bottom <= live.vh + 1, `1.4.483 ${reason.text} is fully on screen at 375`)
        assert.ok(reason.left >= -1 && reason.right <= live.vw + 1, `1.4.483 ${reason.text} is inside the 375 width`)
        assert.equal(reason.inOverlay, true, `1.4.483 ${reason.text} is inside the map list at 375`)
        assert.ok(reason.hit, `1.4.483 ${reason.text} is the top layer at 375`)
      }
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
  assert.equal(await page.locator('#defend-plant-first').count(), 0, '1.4.482 playtest nwLamps=0 hides Plant a lamp first')
  assert.equal(await page.locator('.defend-go').getAttribute('disabled'), null, '1.4.482 playtest nwLamps=0 Begin is live')
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
  assert.equal(await page.locator('#defend-plant-first').count(), 0, '1.4.482 round 17 with nwLamps=0 can begin')
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
  assert.match(waiting, /left/, `1.4.482 round 17 still shows walkers left (${waiting})`)
  assert.ok(peak >= 4, `1.4.482 round 17 fields more than three walkers (saw ${peak})`)
  assert.equal(sawFast, true, '1.4.482 a fast walker reaches the road on round 17')
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
  assert.ok(lampHit?.top, `1.4.482 a walker stands inside a real lamp box ${JSON.stringify(lampHit)}`)
  assert.ok(lampHit.lampW >= 24, `1.4.482 the lamp box is the planted icon (${lampHit.lampW}px)`)
  assert.ok(lampHit.dist < lampHit.lampW * 0.75, `1.4.482 the tap is inside the ${lampHit.lampW}px lamp box`)
  await setPaused(page, true)
  const still = await page.evaluate((spot) => {
    const node = document.elementFromPoint(spot.x, spot.y)
    const top = node?.closest?.('[data-walker-tap]')?.getAttribute('data-walker-tap') ?? ''
    return top === spot.top
  }, lampHit)
  assert.equal(still, true, '1.4.482 the walker still owns the lamp box after the pause')
  const before = await tapTotals(page)
  await page.mouse.click(lampHit.x, lampHit.y)
  await page.waitForTimeout(250)
  const after = await tapTotals(page)
  assert.equal(after.hits, before.hits + 1, '1.4.482 a tap inside the lamp box hits')
  assert.equal(after.misses, before.misses, '1.4.482 a tap inside the lamp box is not a miss')
  assert.ok(after.damage > before.damage, '1.4.482 a tap inside the lamp box applies damage')
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
  const incenseBuy = page.locator('.nw-skill-tray [data-incense-lamp="yes"]')
  await incenseBuy.waitFor({ state: 'attached' })
  assert.equal(await incenseBuy.evaluate((node) => getComputedStyle(node).display), 'none', '1.4.488 the wave hides the Incense buy')
  await incenseBuy.evaluate((node) => {
    if (node instanceof HTMLElement) node.click()
  })
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
  assert.equal(planted, true, '1.4.482 incense plants near (160, 380) and the cloud covers the road')

  await page.getByRole('button', { name: 'Resume walkers' }).click()
  const beforeCloud = await tapTotals(page)
  const inside = await waitCue(page, true, 18_000)
  assert.ok(inside?.top, '1.4.482 the cloud tap lands on the walker')
  assert.equal(inside.top, inside.id, '1.4.482 elementFromPoint in the cloud is the walker')
  await page.mouse.click(inside.x, inside.y)
  await page.waitForTimeout(200)
  const afterCloud = await tapTotals(page)
  assert.equal(afterCloud.hits, beforeCloud.hits + 1, '1.4.482 a tap in the incense cloud hits')
  assert.equal(afterCloud.misses, beforeCloud.misses, '1.4.482 a tap in the incense cloud is not a miss')
  assert.equal(afterCloud.damage, beforeCloud.damage + 2, '1.4.482 a tap in the incense cloud applies the +1')

  await page.getByRole('button', { name: 'Resume walkers' }).click()
  const beforeOut = await tapTotals(page)
  const outside = await waitCue(page, false, 18_000)
  assert.ok(outside?.top, '1.4.482 a tap outside the cloud lands on the walker')
  assert.equal(outside.top, outside.id, '1.4.482 elementFromPoint outside the cloud is the walker')
  await page.mouse.click(outside.x, outside.y)
  await page.waitForTimeout(200)
  const afterOut = await tapTotals(page)
  assert.equal(afterOut.hits, beforeOut.hits + 1, '1.4.482 a tap outside the incense cloud hits')
  assert.equal(afterOut.misses, beforeOut.misses, '1.4.482 a tap outside the incense cloud is not a miss')
  assert.equal(afterOut.damage, beforeOut.damage + 1, '1.4.482 a tap outside the cloud stays a plain hit')
  await context.close()
}

async function checkClearBar(browser, port, errors, width, height, probeClick) {
  const context = await browser.newContext({
    baseURL: `http://127.0.0.1:${port}/`,
    viewport: { width, height },
    deviceScaleFactor: 1,
  })
  await context.addInitScript(
    (payload) => localStorage.setItem(payload.key, JSON.stringify(payload.save)),
    { key: STORAGE_KEY, save: SAVE },
  )
  const page = await context.newPage()
  listen(page, errors, `clear ${width}`)
  await openJump(page, '?playtest=1&nwRound=9')
  const begin = await page.locator('.defend-go').boundingBox()
  assert.ok(begin && begin.height > 10, `1.4.483 ${width} Begin is on screen`)
  if (width === 375) {
    const planted = await page.evaluate(() => {
      const read = (node) => {
        const style = getComputedStyle(node)
        const rect = node.getBoundingClientRect()
        return { display: style.display, w: rect.width, text: (node.textContent || '').trim() }
      }
      return [...document.querySelectorAll('span.defend-type-chip')].map(read)
    })
    assert.ok(
      planted.some((chip) => chip.display !== 'none' && chip.w > 0),
      '1.4.489 Easy at 375 shows the name chips while planting',
    )
  }
  await page.mouse.click(begin.x + begin.width / 2, begin.y + begin.height / 2)
  await page.locator('.defend-page.is-easy-tap').waitFor()
  if (width === 375) {
    const names = await page.evaluate(() => {
      const read = (node) => {
        const style = getComputedStyle(node)
        const rect = node.getBoundingClientRect()
        return {
          display: style.display,
          w: rect.width,
          h: rect.height,
          text: (node.textContent || '').trim(),
        }
      }
      return {
        chips: [...document.querySelectorAll('span.defend-type-chip')].map(read),
        labels: [...document.querySelectorAll('text.defend-type-label')].map(read),
      }
    })
    assert.ok(names.chips.length > 0, '1.4.489 Easy at 375 still has map name chips in the page')
    for (const chip of names.chips) {
      assert.equal(chip.display, 'none', `1.4.489 Easy at 375 hides the ${chip.text} chip mid-wave`)
      assert.equal(chip.w, 0, `1.4.489 Easy at 375 the ${chip.text} chip has no box mid-wave`)
    }
    assert.ok(names.labels.length > 0, '1.4.489 Easy at 375 still has SVG lamp words in the page')
    for (const label of names.labels) {
      assert.equal(label.display, 'none', `1.4.489 Easy at 375 hides the ${label.text} lamp word mid-wave`)
      assert.equal(label.w, 0, `1.4.489 Easy at 375 the ${label.text} lamp word has no box mid-wave`)
    }
  }
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
  const candleShown = await candle.evaluate((node) => getComputedStyle(node).display)
  assert.notEqual(candleShown, 'none', `1.4.488 ${width} the clear panel still shows Candle`)
  if (width === 375) {
    const back = await page.evaluate(() => {
      const read = (node) => {
        const style = getComputedStyle(node)
        const rect = node.getBoundingClientRect()
        return { display: style.display, w: rect.width, text: (node.textContent || '').trim() }
      }
      return {
        chips: [...document.querySelectorAll('span.defend-type-chip')].map(read),
        labels: [...document.querySelectorAll('text.defend-type-label')].map(read),
      }
    })
    assert.ok(
      back.chips.some((chip) => chip.display !== 'none' && chip.w > 0),
      '1.4.489 Easy at 375 shows the name chips on the clear',
    )
    assert.ok(
      back.labels.some((label) => label.display !== 'none' && label.w > 0),
      '1.4.489 Easy at 375 shows the SVG lamp words on the clear',
    )
  }
  const spend = page.locator('.defend-clear-spend')
  const before = await spend.boundingBox()
  assert.ok(before && before.height > 10, '1.4.482 Spend is on the round 9 clear bar')
  const overlap = await page.evaluate(() => {
    const boxOf = (node) => {
      if (!node) return null
      const rect = node.getBoundingClientRect()
      return { x: rect.x, y: rect.y, w: rect.width, h: rect.height, right: rect.right, bottom: rect.bottom, top: rect.top, left: rect.left }
    }
    const crosses = (a, b) => {
      if (!a || !b) return false
      const wide = Math.min(a.right, b.right) - Math.max(a.left, b.left)
      const tall = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top)
      return wide > 1 && tall > 1
    }
    const love = document.querySelector('.defend-clear-lamp[data-tower-type="love"]')
    const art = document.querySelector('.defend-pad.is-love .defend-tower-lamp')
    const button = document.querySelector('.defend-clear-row [data-candle-lamp="yes"]')
    const spend = document.querySelector('.defend-clear-spend')
    const dock = document.querySelector('.nw-docks')
    if (!love || !button || !art || !spend || !dock) return null
    const lamps = [...document.querySelectorAll('.defend-clear-lamp')].map((node) => boxOf(node))
    const a = boxOf(love)
    const artBox = boxOf(art)
    const b = boxOf(button)
    const spendBox = boxOf(spend)
    const dockBox = boxOf(dock)
    const x = b.x + b.w / 2
    const y = b.y + b.h / 2
    const node = document.elementFromPoint(x, y)
    return {
      hit: crosses(a, b),
      artHit: crosses(artBox, b),
      spendHit: crosses(a, spendBox) || lamps.some((lamp) => crosses(lamp, spendBox) || crosses(lamp, b)),
      edge: a.bottom - dockBox.top,
      artEdge: artBox.bottom - dockBox.top,
      top: node?.closest?.('[data-candle-lamp]') ? 'candle' : (node?.className?.toString?.() ?? '').slice(0, 40),
      x,
      y,
      love: a,
      art: artBox,
      candle: b,
    }
  })
  assert.ok(overlap, `1.4.483 ${width} the round 9 clear panel has a Love upgrade icon and a Candle button`)
  assert.ok(overlap.love.h > 8 && overlap.art.h > 8, `1.4.483 ${width} the Love lamp still has a box`)
  assert.ok(overlap.love.bottom > 40, `1.4.483 ${width} the Love lamp stays on the map`)
  assert.equal(overlap.hit, false, `1.4.483 ${width} the Love upgrade icon does not overlap the Candle button ${JSON.stringify(overlap)}`)
  assert.equal(overlap.artHit, false, `1.4.483 ${width} the Love lamp art does not overlap the Candle button ${JSON.stringify(overlap)}`)
  assert.equal(overlap.spendHit, false, `1.4.483 ${width} lamp icons do not overlap Candle or Spend ${JSON.stringify(overlap)}`)
  assert.ok(overlap.edge <= 1, `1.4.483 ${width} the Love lamp sits above the clear panel (${overlap.edge})`)
  assert.ok(overlap.artEdge <= 1, `1.4.483 ${width} the Love lamp art sits above the clear panel (${overlap.artEdge})`)
  assert.equal(overlap.top, 'candle', `1.4.483 ${width} the Candle button takes the click`)
  if (probeClick) {
    await page.mouse.click(overlap.x, overlap.y)
    await page.waitForTimeout(200)
    const armed = await candle.getAttribute('aria-pressed')
    const note = (await page.locator('.defend-clear-note').textContent()) ?? ''
    assert.ok(
      armed === 'true' || /Need \d+ sparks|Six candles/.test(note),
      `1.4.482 a click on the overlapped Candle button reaches Candle (${armed ?? 'unset'} / ${note})`,
    )
    await page.locator('[data-new-lamp="yes"]').click()
    await page.waitForTimeout(150)
    const after = await spend.boundingBox()
    assert.ok(after && after.height > 10, '1.4.482 Spend stays visible after a lamp is picked')
    assert.ok(Math.abs(after.x - before.x) <= 1 && Math.abs(after.y - before.y) <= 1, '1.4.482 Spend stays put')
    assert.ok(Math.abs(after.width - before.width) <= 1 && Math.abs(after.height - before.height) <= 1, '1.4.482 Spend keeps its size')
  }
  await context.close()
}

function pathPips(html, path) {
  const start = html.indexOf(`data-path="${path}"`)
  assert.ok(start >= 0, `1.4.486 the card has a ${path} path`)
  const rest = html.slice(start + 1)
  const next = rest.indexOf('data-path=')
  const chunk = next >= 0 ? rest.slice(0, next) : rest
  return [...chunk.matchAll(/data-step="(\d+)"/g)].map((match) => Number(match[1]))
}

/** The lesson-locked card, rendered the way the wave and the clear each show it. */
async function checkCardCut() {
  const outfile = fileURLToPath(new URL('../node_modules/.cache/nw-card-bundle.mjs', import.meta.url))
  mkdirSync(fileURLToPath(new URL('../node_modules/.cache/', import.meta.url)), { recursive: true })
  await build({
    stdin: {
      contents: `export { DefendTowerCard } from './src/components/DefendTowerCard.tsx'\n`,
      resolveDir: fileURLToPath(new URL('..', import.meta.url)),
      sourcefile: 'card-entry.tsx',
      loader: 'tsx',
    },
    bundle: true,
    format: 'esm',
    platform: 'node',
    outfile,
    jsx: 'automatic',
    external: ['react', 'react-dom', 'react/jsx-runtime', 'react/jsx-dev-runtime'],
    logLevel: 'silent',
  })
  const { DefendTowerCard } = await import(pathToFileURL(outfile).href + `?cut=${Date.now()}`)
  const card = (midWave) =>
    renderToString(
      createElement(DefendTowerCard, {
        plotId: 'porch',
        ability: 'love',
        runTier: { love: 1 },
        sparks: 40,
        point: { left: 240, top: 320 },
        board: { w: 800, h: 1100 },
        onUpgrade: () => {},
        onUpgradePath: () => {},
        onClose: () => {},
        paths: { far: 0, strong: 3 },
        easy: true,
        midWave,
        gate: { lessons: 0, playtest: false },
      }),
    )
  const wave = card(true)
  const clear = card(false)
  assert.deepEqual(pathPips(wave, 'strong'), [1, 2, 3], '1.4.486 mid-wave Strong shows the filled steps only')
  assert.deepEqual(pathPips(wave, 'far'), [1], '1.4.486 mid-wave Far shows the next buy and hides the locked prices')
  assert.equal(wave.includes('Learn in Lock In'), false, '1.4.486 mid-wave hides the Lock In line')
  assert.equal(wave.includes('data-lesson-open'), false, '1.4.486 mid-wave hides the Lock In button')
  assert.equal(wave.includes('data-mid-wave="yes"'), true, '1.4.486 the wave card is marked')
  assert.deepEqual(pathPips(clear, 'strong'), [1, 2, 3, 4], '1.4.486 the clear still shows the locked Strong price')
  assert.equal(clear.includes('Learn in Lock In'), true, '1.4.486 the clear still says Learn in Lock In')
  assert.equal(clear.includes('data-lesson-open'), true, '1.4.486 the clear still offers the lessons button')
  const fresh = renderToString(
    createElement(DefendTowerCard, {
      plotId: 'porch',
      ability: 'love',
      runTier: { love: 1 },
      sparks: 0,
      point: { left: 240, top: 320 },
      board: { w: 800, h: 1100 },
      onUpgrade: () => {},
      onUpgradePath: () => {},
      onClose: () => {},
      paths: { far: 0, strong: 0 },
      easy: true,
      midWave: true,
      gate: { lessons: 0, playtest: false },
    }),
  )
  assert.deepEqual(pathPips(fresh, 'strong'), [1], '1.4.486 a new lamp mid-wave shows one Strong pip')
  assert.deepEqual(pathPips(fresh, 'far'), [1], '1.4.486 a new lamp mid-wave shows one Far pip')
  const hard = renderToString(
    createElement(DefendTowerCard, {
      plotId: 'porch',
      ability: 'love',
      runTier: { love: 1 },
      sparks: 3,
      point: { left: 240, top: 320 },
      board: { w: 800, h: 1100 },
      onUpgrade: () => {},
      onClose: () => {},
      easy: false,
      midWave: true,
    }),
  )
  assert.equal(hard.includes('data-upgrade-tree'), false, '1.4.486 Hard keeps the single upgrade card')
  assert.equal(hard.includes('Learn in Lock In'), false, '1.4.486 Hard has no Lock In card line')
}

async function readTreePips(page) {
  return page.evaluate(() => {
    const card = document.querySelector('[data-upgrade-tree="yes"]')
    if (!card) return null
    return {
      mid: card.getAttribute('data-mid-wave'),
      lesson: card.querySelectorAll('[data-lesson-open]').length,
      text: card.textContent ?? '',
      paths: [...card.querySelectorAll('[data-path]')].map((node) => ({
        path: node.getAttribute('data-path'),
        rank: Number(node.getAttribute('data-rank') ?? '0'),
        steps: [...node.querySelectorAll('[data-step]')].map((pip) => Number(pip.getAttribute('data-step'))),
        locked: node.querySelectorAll('[data-locked="yes"]').length,
      })),
    }
  })
}

async function tapLoveLamp(page) {
  await page.locator('.defend-clear-lamp[data-tower-type="love"]').evaluate((node) => {
    if (node instanceof HTMLElement) node.click()
  })
}

async function openLoveCard(page) {
  await tapLoveLamp(page)
  await page.locator('[data-upgrade-tree="yes"]').waitFor()
}

/** A real Easy wave, not the rendered card. Plant still shows the stack. */
async function checkWaveCard(browser, port, errors) {
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
  listen(page, errors, 'pips')
  await openJump(page, '?playtest=1&nwRound=1&nwLamps=0')
  await page.locator('.defend-go.is-after-plant').waitFor()
  await mapClick(page, { x: 507, y: 598 })
  await page.locator('.defend-clear-lamp[data-tower-type="love"]').waitFor()
  await openLoveCard(page)
  const plant = await readTreePips(page)
  assert.ok(plant, '1.4.486 the plant card opens')
  assert.notEqual(plant.mid, 'yes', '1.4.486 planting is not a wave')
  for (const path of plant.paths) {
    assert.ok(path.steps.length > path.rank + 1, `1.4.486 plant still shows later ${path.path} prices (${path.steps})`)
  }
  await page.waitForTimeout(450)
  await tapLoveLamp(page)
  await page.locator('[data-upgrade-tree="yes"]').waitFor({ state: 'detached' })
  await page.locator('.defend-go.is-after-plant').click()
  await page.locator('.defend-page.is-easy-tap').waitFor()
  await setPaused(page, true)
  await openLoveCard(page)
  const wave = await readTreePips(page)
  assert.ok(wave, '1.4.486 the wave card opens')
  assert.equal(wave.mid, 'yes', '1.4.486 the open card is mid-wave')
  assert.equal(wave.lesson, 0, '1.4.486 mid-wave Easy has no Lock In button')
  assert.equal(/Learn in Lock In/.test(wave.text), false, '1.4.486 mid-wave Easy has no Lock In line')
  assert.ok(wave.paths.length >= 2, '1.4.486 the wave card has Far and Strong')
  for (const path of wave.paths) {
    assert.ok(
      path.steps.length <= path.rank + 1,
      `1.4.486 mid-wave ${path.path} shows at most filled plus next (rank ${path.rank}, steps ${path.steps})`,
    )
    assert.equal(path.locked, 0, `1.4.486 mid-wave ${path.path} hides locked prices`)
    if (path.rank === 0) assert.equal(path.steps.length, 1, `1.4.486 mid-wave ${path.path} shows the next pip`)
  }
  const cut = await page.evaluate(() => {
    const pageNode = document.querySelector('.defend-page')
    const rules = []
    for (const sheet of document.styleSheets) {
      let list
      try {
        list = sheet.cssRules
      } catch {
        continue
      }
      for (const rule of list) {
        const text = rule.selectorText || ''
        if (!text.includes('.defend-path-pip.is-locked') && !text.includes('.defend-lesson-cue')) continue
        if (!text.includes('display') && rule.style?.display !== 'none') continue
        rules.push({ text, display: rule.style?.display ?? '' })
      }
    }
    return {
      easy: pageNode?.classList.contains('is-easy-watch') === true,
      wave: pageNode?.classList.contains('is-easy-tap') === true,
      rules,
    }
  })
  assert.equal(cut.easy, true, '1.4.486 the live night is Easy')
  assert.equal(cut.wave, true, '1.4.486 the live night is mid-wave')
  assert.ok(
    cut.rules.some(
      (rule) =>
        rule.display === 'none' &&
        rule.text.includes('.defend-page.is-easy-watch') &&
        rule.text.includes('.is-easy-tap') &&
        rule.text.includes('.defend-path-pip.is-locked') &&
        rule.text.includes('.defend-lesson-cue'),
    ),
    `1.4.486 the Easy wave stylesheet hides locked pips and the Lock In cue ${JSON.stringify(cut.rules)}`,
  )
  await context.close()
}

/** Mid-wave Easy hides names, dotted rings, the left buys, and rail badges. Pips match. */
async function checkShopTags(browser, port, errors) {
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
  listen(page, errors, 'shop')
  await openJump(page, '?playtest=1&nwRound=10')
  await page.locator('.defend-go.is-after-plant').click()
  await page.locator('.defend-page.is-easy-tap').waitFor()
  await setPaused(page, true)
  const shop = await page.evaluate(() => {
    const shown = (node) => (node ? getComputedStyle(node).display : 'missing')
    return {
      candle: shown(document.querySelector('.nw-skill-tray [data-candle-lamp="yes"]')),
      bell: shown(document.querySelector('.nw-skill-tray [data-bell-lamp="yes"]')),
      incense: shown(document.querySelector('.nw-skill-tray [data-incense-lamp="yes"]')),
      label: shown(document.querySelector('.defend-type-label')),
      ring: shown(document.querySelector('.defend-range:not(.is-firing):not(.is-bell-pulse):not(.is-incense-cloud)')),
      tier: shown(document.querySelector('.nw-rail .defend-ability-tier')),
      clearCandle: document.querySelectorAll('.defend-clear-row [data-candle-lamp="yes"]').length,
    }
  })
  assert.equal(shop.candle, 'none', '1.4.488 the wave hides the Candle buy')
  assert.equal(shop.bell, 'none', '1.4.488 the wave hides the Bell buy')
  assert.equal(shop.incense, 'none', '1.4.488 the wave hides the Incense buy')
  assert.equal(shop.label, 'none', '1.4.488 the wave hides lamp names')
  assert.equal(shop.ring, 'none', '1.4.488 the wave hides dotted reach rings')
  assert.equal(shop.tier, 'none', '1.4.488 the wave hides right-rail badges')
  assert.equal(shop.clearCandle, 0, '1.4.488 the clear row is not on the wave')
  await openLoveCard(page)
  const pips = await page.evaluate(() => {
    const box = (node) => {
      if (!node) return null
      const style = getComputedStyle(node)
      return { radius: style.borderRadius, w: style.width, h: style.height }
    }
    return {
      on: box(document.querySelector('.defend-tower-card .defend-path-pip.is-on')),
      buy: box(document.querySelector('.defend-tower-card button.defend-path-pip.is-buy')),
    }
  })
  assert.ok(pips.on && pips.buy, `1.4.488 the wave card has a filled pip and a next pip ${JSON.stringify(pips)}`)
  assert.equal(pips.on.radius, pips.buy.radius, '1.4.488 filled and next pips share a radius')
  assert.equal(pips.on.w, pips.buy.w, '1.4.488 filled and next pips share a width')
  assert.equal(pips.on.h, pips.buy.h, '1.4.488 filled and next pips share a height')
  await context.close()
}

export async function checkLiveProve() {
  const server = await createServer({ server: { host: '127.0.0.1', port: 0 } })
  await server.listen()
  const address = server.httpServer?.address()
  const port = address && typeof address === 'object' ? address.port : 0
  assert.ok(port > 0, '1.4.482 live prove server has a port')
  const browser = await launchBrowser()
  const errors = []
  try {
    await checkCardCut()
    await checkMaps(browser, port, errors)
    await checkWaveCard(browser, port, errors)
    await checkShopTags(browser, port, errors)
    await checkBareBegin(browser, port, errors)
    await checkCrowd(browser, port, errors)
    await checkLampBox(browser, port, errors)
    await checkTaps(browser, port, errors)
    await checkClearBar(browser, port, errors, 375, 667, false)
    await checkClearBar(browser, port, errors, 412, 915, true)
    await checkClearBar(browser, port, errors, 768, 1024, false)
    assert.equal(errors.join('\n'), '', '1.4.482 live prove stays free of console errors')
  } finally {
    await browser.close()
    await server.close()
  }
  console.log('check-live-prove: ok')
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  await checkLiveProve()
}
