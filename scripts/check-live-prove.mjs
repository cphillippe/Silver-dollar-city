/**
 * Live prove for 1.4.496.
 * Real clicks and elementFromPoint. A planted incense still hits.
 * A walker inside a lamp box wins. The map sheet is the top layer.
 * Later rounds field more than three walkers. The clear bar stays put.
 * The Love lamp's box does not cover Candle or Spend.
 */
import assert from 'node:assert/strict'
import { mkdirSync, readFileSync } from 'node:fs'
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
  appVersion: '1.4.496',
  savedAt: '2026-10-15T00:00:00.000Z',
  progress: {
    started: true,
    easyMode: true,
    theme: 'candy',
    completed: [],
    lastDailyDate: '2026-10-14',
    held: [],
    easyHeld: ['ph-road'],
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

async function readLevelPips(page) {
  return page.evaluate(() =>
    [...document.querySelectorAll('text.defend-level-pip')].map((node) => {
      const style = getComputedStyle(node)
      const rect = node.getBoundingClientRect()
      return { display: style.display, w: rect.width, text: (node.textContent || '').trim() }
    }),
  )
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
    const plantPips = await readLevelPips(page)
    assert.ok(
      plantPips.some((pip) => pip.text && pip.display !== 'none' && pip.w > 0),
      `1.4.495 Easy at 375 shows lamp level tags while planting ${JSON.stringify(plantPips)}`,
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
    const wavePips = await readLevelPips(page)
    assert.ok(wavePips.some((pip) => pip.text), `1.4.495 Easy at 375 still has lamp level tags in the page ${JSON.stringify(wavePips)}`)
    for (const pip of wavePips) {
      assert.equal(pip.display, 'none', `1.4.495 Easy at 375 hides the ${pip.text || 'empty'} level tag mid-wave`)
      assert.equal(pip.w, 0, `1.4.495 Easy at 375 the ${pip.text || 'empty'} level tag has no box mid-wave`)
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
    const clearPips = await readLevelPips(page)
    assert.ok(
      clearPips.some((pip) => pip.text && pip.display !== 'none' && pip.w > 0),
      `1.4.495 Easy at 375 shows lamp level tags on the clear ${JSON.stringify(clearPips)}`,
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
    const idle = [...document.querySelectorAll('.defend-range:not(.is-firing):not(.is-bell-pulse):not(.is-incense-cloud)')]
    const paint = (node) => {
      const style = getComputedStyle(node)
      return { display: style.display, opacity: style.opacity }
    }
    const sample = idle[0]
    const withClass = (name) => {
      if (!sample) return { display: 'missing', opacity: '' }
      sample.classList.add(name)
      const look = paint(sample)
      sample.classList.remove(name)
      return look
    }
    const board = document.querySelector('.defend-board')
    const host = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    host.setAttribute('class', 'defend-ghost')
    const ring = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
    ring.setAttribute('class', 'defend-ghost-ring')
    ring.setAttribute('r', '48')
    host.appendChild(ring)
    board?.appendChild(host)
    const ghost = paint(ring)
    host.remove()
    return {
      candle: shown(document.querySelector('.nw-skill-tray [data-candle-lamp="yes"]')),
      bell: shown(document.querySelector('.nw-skill-tray [data-bell-lamp="yes"]')),
      incense: shown(document.querySelector('.nw-skill-tray [data-incense-lamp="yes"]')),
      label: shown(document.querySelector('.defend-type-label')),
      ring: shown(sample ?? null),
      range: {
        count: idle.length,
        idle: idle.map(paint),
        firing: withClass('is-firing'),
        bell: withClass('is-bell-pulse'),
        incense: withClass('is-incense-cloud'),
        ghost,
      },
      tier: shown(document.querySelector('.nw-rail .defend-ability-tier')),
      clearCandle: document.querySelectorAll('.defend-clear-row [data-candle-lamp="yes"]').length,
    }
  })
  assert.equal(shop.candle, 'none', '1.4.488 the wave hides the Candle buy')
  assert.equal(shop.bell, 'none', '1.4.488 the wave hides the Bell buy')
  assert.equal(shop.incense, 'none', '1.4.488 the wave hides the Incense buy')
  assert.equal(shop.label, 'none', '1.4.488 the wave hides lamp names')
  assert.equal(shop.ring, 'none', '1.4.488 the wave hides dotted reach rings')
  assert.ok(shop.range.count > 0, '1.4.496 the wave still has idle range rings')
  for (const ring of shop.range.idle) {
    assert.equal(ring.opacity, '0', '1.4.496 the idle yellow range line is hidden mid-wave')
  }
  assert.equal(shop.range.firing.opacity, '1', '1.4.496 a shot ring stays visible')
  assert.notEqual(shop.range.firing.display, 'none', '1.4.496 a shot ring is not the idle hide')
  assert.equal(shop.range.bell.opacity, '1', '1.4.496 the bell pulse stays visible')
  assert.equal(shop.range.incense.opacity, '1', '1.4.496 the incense cloud stays visible')
  assert.equal(shop.range.ghost.opacity, '1', '1.4.496 the placement ghost ring is not the idle hide')
  assert.notEqual(shop.range.ghost.display, 'none', '1.4.496 the placement ghost ring still draws')
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

/** 375×667 taps from docs/nw-prove-seats.md. The lamp feet are the plate anchor. */
const SEAT_TAPS = [
  { type: 'love', x: 111.0, y: 225.5, feet: 'translate(248 288)', doc: '111.0 | 225.5' },
  { type: 'logic', x: 109.0, y: 294.4, feet: 'translate(244 424)', doc: '109.0 | 294.4' },
  { type: 'reason', x: 275.1, y: 353.1, feet: 'translate(572 540)', doc: '275.1 | 353.1' },
  { type: 'science', x: 93.8, y: 437.1, feet: 'translate(214 706)', doc: '93.8 | 437.1' },
]

const GROUND_TAPS = [
  { attr: 'bell', round: 10, x: 46.3, y: 125.2, feet: 'translate(120 90)', doc: '46.3 | 125.2' },
  { attr: 'incense', round: 13, x: 86.8, y: 130.3, feet: 'translate(200 100)', doc: '86.8 | 130.3' },
  { attr: 'cross', round: 13, x: 36.1, y: 160.7, feet: 'translate(100 160)', doc: '36.1 | 160.7' },
]

/** Porch, hollow, journal, bench. The free-spot id is those feet. */
const NAMED_SEATS = [
  { id: 'porch', type: 'love', feet: 'translate(248 288)', word: 'LOVE' },
  { id: 'hollow', type: 'logic', feet: 'translate(244 424)', word: 'LOGIC' },
  { id: 'journal', type: 'reason', feet: 'translate(572 540)', word: 'REASON' },
  { id: 'bench', type: 'science', feet: 'translate(214 706)', word: 'SCIENCE' },
]

function namedLampId(feet) {
  const match = /translate\((\d+) (\d+)\)/.exec(feet)
  assert.ok(match, `named seat feet ${feet}`)
  return `at:${match[1]}:${match[2]}`
}

async function pathBuyNames(page) {
  const names = {}
  for (const path of ['far', 'strong']) {
    const snap = await page
      .locator(`.defend-tower-card .defend-path[data-path="${path}"] button.defend-path-buy`)
      .ariaSnapshotJSON()
    const nodes = Array.isArray(snap) ? snap : [snap]
    const button = nodes.find((node) => node && node.role === 'button')
    names[path] = button && typeof button.name === 'string' ? button.name : ''
  }
  return names
}

async function openNamedUpgrades(page, when) {
  let names = null
  for (const seat of NAMED_SEATS) {
    const lamp = namedLampId(seat.feet)
    const button = page.locator(`[data-clear-lamp="${lamp}"]`)
    await button.waitFor()
    const hit = await button.evaluate((node) => {
      const box = node.getBoundingClientRect()
      const x = box.x + box.width / 2
      const y = box.y + box.height / 2
      const top = document.elementFromPoint(x, y)
      return top?.closest?.('[data-clear-lamp]')?.getAttribute('data-clear-lamp') || ''
    })
    assert.equal(hit, lamp, `1.4.497 ${seat.id} takes the tap ${when}`)
    await button.click()
    const card = (await page.locator('.defend-tower-card').innerText()).replace(/\s+/g, ' ')
    assert.match(card, new RegExp(seat.word), `1.4.497 ${seat.id} opens its upgrade ${when} (${card.slice(0, 40)})`)
    if (!names) names = await pathBuyNames(page)
    await page.waitForTimeout(450)
    await button.evaluate((node) => node.click())
    await page.locator('.defend-tower-card').waitFor({ state: 'hidden' })
  }
  return names
}

function cueClearance(page, selector) {
  return page.evaluate(({ sel, path }) => {
    const node = document.querySelector(sel)
    const svg = document.querySelector('.defend-board')
    if (!(node instanceof Element) || !(svg instanceof SVGSVGElement)) return null
    const box = node.getBoundingClientRect()
    const ctm = svg.getScreenCTM()
    if (!ctm || box.width < 1) return null
    let nearest = Infinity
    for (const spot of path) {
      const p = svg.createSVGPoint()
      p.x = spot.x
      p.y = spot.y
      const at = p.matrixTransform(ctm)
      const dx = at.x < box.left ? box.left - at.x : at.x > box.right ? at.x - box.right : 0
      const dy = at.y < box.top ? box.top - at.y : at.y > box.bottom ? at.y - box.bottom : 0
      nearest = Math.min(nearest, Math.hypot(dx, dy))
    }
    const style = getComputedStyle(node)
    const midX = box.x + box.width / 2
    const midY = box.y + box.height / 2
    const top = document.elementFromPoint(midX, midY)
    return {
      nearest,
      events: style.pointerEvents,
      text: (node.textContent || '').replace(/\s+/g, ' ').trim(),
      digit: node.getAttribute('data-wave-count'),
      discs: document.querySelectorAll('[data-walker-tap]').length,
      hit: top === node || Boolean(top?.closest?.(sel)) ? 'cue' : (top?.tagName || ''),
      cx: midX,
      cy: midY,
    }
  }, { sel: selector, path: DEFEND_PATH })
}

async function checkWaveCues(browser, port, errors) {
  const seatDoc = readFileSync(new URL('../docs/nw-prove-seats.md', import.meta.url), 'utf8')
  for (const tap of [...SEAT_TAPS, ...GROUND_TAPS]) {
    assert.ok(seatDoc.includes(tap.doc), `1.4.496 the seat doc lists ${tap.doc}`)
  }
  mkdirSync('/opt/cursor/artifacts', { recursive: true })
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
  listen(page, errors, 'cue 375')
  await openJump(page, '?playtest=1')
  await page.locator('[data-map="a2"]').click()
  await page.locator('[data-map-overlay]').waitFor({ state: 'detached' })
  assert.equal(await page.locator('.defend-page.is-easy-tap').count(), 0, '1.4.496 planting is outside the mid-wave hide')
  await page.locator('[data-type="love"]').click()
  await page.mouse.move(SEAT_TAPS[0].x, SEAT_TAPS[0].y)
  const ghost = await page.locator('.defend-ghost-ring').evaluate((node) => {
    const style = getComputedStyle(node)
    const box = node.getBoundingClientRect()
    return { opacity: style.opacity, display: style.display, w: box.width }
  })
  assert.equal(ghost.opacity, '1', '1.4.496 the placement preview stays visible while placing')
  assert.notEqual(ghost.display, 'none', '1.4.496 the placement preview is not the idle range hide')
  assert.ok(ghost.w > 10, `1.4.496 the placement preview has a ring (${ghost.w})`)
  for (const tap of SEAT_TAPS) {
    await page.locator(`[data-type="${tap.type}"]`).click()
    await page.mouse.click(tap.x, tap.y)
    await page.waitForTimeout(80)
  }
  const planted = await page.evaluate(() =>
    [...document.querySelectorAll('.defend-pad')].map((node) => ({
      type: node.getAttribute('data-tower-type'),
      transform: node.getAttribute('transform'),
    })),
  )
  for (const tap of SEAT_TAPS) {
    assert.ok(
      planted.some((pad) => pad.type === tap.type && pad.transform === tap.feet),
      `1.4.496 ${tap.type} plants on its seat ${JSON.stringify(planted)}`,
    )
  }
  const beforeBuys = await openNamedUpgrades(page, 'pre-Begin')
  const started = Date.now()
  await page.locator('.defend-go').click()
  await page.locator('[data-wave-count="3"]').waitFor()
  const count = await cueClearance(page, '[data-wave-count="3"]')
  assert.ok(count, '1.4.496 Easy shows the 3')
  assert.equal(count.digit, '3', '1.4.496 the first number is 3')
  assert.equal(count.events, 'none', '1.4.496 the count does not take a tap')
  const digit = await page.locator('[data-wave-count="3"]').evaluate((node) => {
    const style = getComputedStyle(node)
    const box = node.getBoundingClientRect()
    const x = box.x + box.width / 2
    const y = box.y + box.height / 2
    const top = document.elementFromPoint(x, y)
    return {
      text: (node.textContent || '').trim(),
      events: style.pointerEvents,
      display: style.display,
      visibility: style.visibility,
      opacity: Number(style.opacity),
      font: Number.parseFloat(style.fontSize),
      w: box.width,
      h: box.height,
      visible: typeof node.checkVisibility === 'function' ? node.checkVisibility() : true,
      board: Boolean(top && top.closest('.defend-board')),
      blocked: Boolean(top && (top === node || top.closest('[data-wave-count]'))),
    }
  })
  assert.equal(digit.text, '3', '1.4.497 the countdown digit reads 3')
  assert.equal(digit.events, 'none', '1.4.497 the countdown digit does not take a tap')
  assert.notEqual(digit.display, 'none', '1.4.497 the countdown digit is shown')
  assert.equal(digit.visibility, 'visible', '1.4.497 the countdown digit is visible')
  assert.ok(digit.opacity > 0 && digit.w > 8 && digit.h > 8 && digit.visible, '1.4.497 the countdown digit is on screen')
  assert.ok(digit.visible && digit.font >= 90 && digit.font <= 102, `1.4.499 the countdown digit is about 96px and visible (${digit.font})`)
  const skills = await page.locator('.nw-skill').evaluateAll((nodes) =>
    nodes.map((node) => {
      const box = node.getBoundingClientRect()
      return { id: node.getAttribute('data-skill'), w: box.width, h: box.height }
    }),
  )
  for (const id of ['still', 'mend']) {
    const hit = skills.find((skill) => skill.id === id)
    assert.ok(hit && hit.w >= 44 && hit.h >= 44, `1.4.499 ${id} hit area is at least 44px (${hit?.w}x${hit?.h})`)
  }
  assert.equal(digit.blocked, false, '1.4.497 the countdown digit does not catch the tap')
  assert.equal(digit.board, true, '1.4.497 a walker tap during the count lands on the board')
  assert.equal(count.discs, 0, '1.4.496 the count is up before any hit disc')
  assert.notEqual(count.hit, 'cue', '1.4.496 a tap on the 3 falls through')
  assert.ok(count.nearest > 16, `1.4.496 the count stays off the road (${count.nearest})`)
  const idle = await page.evaluate(() =>
    [...document.querySelectorAll('.defend-range:not(.is-firing):not(.is-bell-pulse):not(.is-incense-cloud)')].map((node) => {
      const style = getComputedStyle(node)
      return { opacity: style.opacity, display: style.display }
    }),
  )
  assert.ok(idle.length > 0, '1.4.496 Easy at 375 still has lamp range rings during the count')
  for (const ring of idle) {
    assert.equal(ring.opacity, '0', '1.4.496 Easy at 375 hides the idle yellow range line')
    assert.equal(ring.display, 'none', '1.4.496 Easy at 375 the idle range line has no box')
  }
  await page.screenshot({ path: '/opt/cursor/artifacts/nw-496-countdown.png' })
  const before = await tapTotals(page)
  await page.mouse.click(count.cx, count.cy)
  await page.waitForTimeout(40)
  const after = await tapTotals(page)
  assert.equal(after.misses, before.misses, '1.4.496 a tap on the count is not a miss')
  assert.equal(await page.locator('.defend-raider').count(), 0, '1.4.496 walkers wait until the count ends')
  await page.locator('.defend-raider').waitFor({ timeout: 4000 })
  const spawned = Date.now() - started
  assert.ok(spawned >= 1500, `1.4.496 walkers spawn after the count (${spawned}ms)`)
  assert.ok(spawned < 3200, `1.4.496 walkers spawn when the count ends (${spawned}ms)`)
  await page.locator('[data-walker-tap]').first().waitFor()
  const lamp = await page.evaluate(() => {
    const lamps = [...document.querySelectorAll('[data-lamp-icon]')]
    for (const node of lamps) {
      const box = node.getBoundingClientRect()
      if (box.width < 8 || box.height < 8) continue
      const x = box.x + box.width / 2
      const y = box.y + box.height / 2
      const top = document.elementFromPoint(x, y)
      if (top?.closest?.('[data-lamp-icon]') === node) {
        return { x, y, id: node.getAttribute('data-clear-lamp') }
      }
    }
    return null
  })
  assert.ok(lamp?.id, '1.4.500 a planted lamp still opens during the wave')
  await page.mouse.click(lamp.x, lamp.y)
  await page.locator('.defend-tower-card').waitFor()
  const strip = await page.evaluate(() => {
    const card = document.querySelector('.defend-tower-card')
    const road = document.querySelector('.defend-road')
    if (!(card instanceof HTMLElement) || !(road instanceof SVGGeometryElement)) return null
    const rect = card.getBoundingClientRect()
    const svg = road.ownerSVGElement
    const ctm = svg?.getScreenCTM()
    if (!ctm) return null
    const length = road.getTotalLength()
    const step = length / 393
    let roadHits = 0
    for (let i = 0; i < 394; i += 1) {
      const at = road.getPointAtLength(Math.min(length, i * step))
      const point = svg.createSVGPoint()
      point.x = at.x
      point.y = at.y
      const spot = point.matrixTransform(ctm)
      if (spot.x >= rect.left && spot.x <= rect.right && spot.y >= rect.top && spot.y <= rect.bottom) roadHits += 1
    }
    const crosses = (node) => {
      const box = node.getBoundingClientRect()
      return (
        box.width > 1 &&
        box.height > 1 &&
        box.right > rect.left &&
        box.left < rect.right &&
        box.bottom > rect.top &&
        box.top < rect.bottom
      )
    }
    const walkers = [...document.querySelectorAll('[data-walker-tap]')].filter(crosses).length
    const still = [...document.querySelectorAll('.nw-skill[data-skill="still"]')].filter(crosses).length
    const mend = [...document.querySelectorAll('.nw-skill[data-skill="mend"]')].filter(crosses).length
    const buy = document.querySelector('.defend-path-buy')
    const buyBox = buy?.getBoundingClientRect()
    const bx = buyBox ? buyBox.x + buyBox.width / 2 : 0
    const by = buyBox ? buyBox.y + buyBox.height / 2 : 0
    const hit = buyBox ? document.elementFromPoint(bx, by) : null
    const marks = [...document.querySelectorAll('.defend-path-buy')].map((node) => ({
      path: node.closest('[data-path]')?.getAttribute('data-path') || '',
      mark: getComputedStyle(node, '::before').content.replace(/^["']|["']$/g, ''),
    }))
    return {
      w: rect.width,
      h: rect.height,
      roadHits,
      walkersOnBoard: document.querySelectorAll('[data-walker-tap]').length,
      walkers,
      still,
      mend,
      buy: Boolean(hit?.closest?.('.defend-path-buy')),
      marks,
    }
  })
  assert.ok(strip, '1.4.500 the mid-wave card is open at 375')
  assert.ok(strip.h <= 100, `1.4.500 the mid-wave card is at most 100px tall (${strip.h})`)
  assert.equal(strip.roadHits, 0, `1.4.500 the card overlaps 0 road points (${strip.roadHits})`)
  assert.ok(strip.walkersOnBoard > 0, '1.4.500 a walker tap target is on the board')
  assert.equal(strip.walkers, 0, `1.4.500 the card overlaps 0 walker tap targets (${strip.walkers})`)
  assert.equal(strip.still, 0, '1.4.500 the card does not cover Still')
  assert.equal(strip.mend, 0, '1.4.500 the card does not cover Mend')
  assert.equal(strip.buy, true, '1.4.500 the buy button still takes the tap')
  const farMark = strip.marks.find((item) => item.path === 'far')
  const strongMark = strip.marks.find((item) => item.path === 'strong')
  assert.ok(
    farMark && strongMark && farMark.mark && strongMark.mark && farMark.mark !== 'none' && strongMark.mark !== 'none' && farMark.mark !== strongMark.mark,
    `1.4.501 Far and Strong each show a distinct mark (${JSON.stringify(strip.marks)})`,
  )
  const waveBuys = await pathBuyNames(page)
  for (const path of ['far', 'strong']) {
    assert.ok(beforeBuys[path], `1.4.501 ${path} has a pre-Begin buy name (${beforeBuys[path]})`)
    assert.equal(
      waveBuys[path],
      beforeBuys[path],
      `1.4.501 ${path} mid-wave name matches pre-Begin with no mark letter (${waveBuys[path]} vs ${beforeBuys[path]})`,
    )
  }
  await page.locator(`[data-clear-lamp="${lamp.id}"]`).click({ force: true })
  await page.locator('.defend-tower-card').waitFor({ state: 'hidden' })
  const fight = Date.now()
  while (Date.now() - fight < 40_000 && (await page.locator('.defend-page.is-boost').count()) < 1) {
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
    await page.waitForTimeout(70)
  }
  await page.locator('[data-wave-survived]').waitFor()
  const burst = await cueClearance(page, '[data-wave-survived]')
  assert.ok(burst, '1.4.496 Easy shows the clear burst')
  assert.match(burst.text, /Wave survived!/)
  assert.match(burst.text, /Round 1/)
  assert.equal(burst.events, 'none', '1.4.496 the burst does not take a tap')
  assert.ok(burst.nearest > 16, `1.4.496 the burst stays off the road (${burst.nearest})`)
  const kept = await page.evaluate(() => {
    const button = document.querySelector('.defend-continue')
    if (!button) return null
    const box = button.getBoundingClientRect()
    const burstBox = document.querySelector('[data-wave-survived]')?.getBoundingClientRect()
    const x = box.x + box.width / 2
    const y = box.y + box.height / 2
    const node = document.elementFromPoint(x, y)
    const wide = burstBox ? Math.min(box.right, burstBox.right) - Math.max(box.left, burstBox.left) : 0
    const tall = burstBox ? Math.min(box.bottom, burstBox.bottom) - Math.max(box.top, burstBox.top) : 0
    return {
      top: node?.closest?.('.defend-continue') ? 'continue' : '',
      overlap: wide > 1 && tall > 1,
    }
  })
  assert.equal(kept?.top, 'continue', '1.4.496 Continue still takes the click')
  assert.equal(kept?.overlap, false, '1.4.496 the burst does not cover Continue')
  await openNamedUpgrades(page, 'at round clear')
  await page.screenshot({ path: '/opt/cursor/artifacts/nw-496-survived.png' })
  await context.close()

  for (const tap of GROUND_TAPS) {
    const ground = await browser.newContext({
      baseURL: `http://127.0.0.1:${port}/`,
      viewport: { width: 375, height: 667 },
      deviceScaleFactor: 1,
    })
    await ground.addInitScript(
      (payload) => localStorage.setItem(payload.key, JSON.stringify(payload.save)),
      { key: STORAGE_KEY, save: SAVE },
    )
    const leaf = await ground.newPage()
    listen(leaf, errors, `${tap.attr} 375`)
    await openJump(leaf, `?playtest=1&nwRound=${tap.round}`)
    const button = leaf.locator(`[data-${tap.attr}-lamp="yes"]`).last()
    await button.click()
    assert.equal(await button.getAttribute('aria-pressed'), 'true', `1.4.496 ${tap.attr} arms`)
    await leaf.mouse.click(tap.x, tap.y)
    await leaf.waitForTimeout(150)
    const pads = await leaf.evaluate(() =>
      [...document.querySelectorAll('.defend-pad')].map((node) => ({
        type: node.getAttribute('data-tower-type'),
        transform: node.getAttribute('transform'),
      })),
    )
    assert.ok(
      pads.some((pad) => pad.type === tap.attr && pad.transform === tap.feet),
      `1.4.496 ${tap.attr} plants on its free spot ${JSON.stringify(pads)}`,
    )
    await ground.close()
  }

  const hardSave = { ...SAVE, progress: { ...SAVE.progress, easyMode: false } }
  const hard = await browser.newContext({
    baseURL: `http://127.0.0.1:${port}/`,
    viewport: { width: 375, height: 667 },
    deviceScaleFactor: 1,
  })
  await hard.addInitScript(
    (payload) => localStorage.setItem(payload.key, JSON.stringify(payload.save)),
    { key: STORAGE_KEY, save: hardSave },
  )
  const hardPage = await hard.newPage()
  listen(hardPage, errors, 'hard 375')
  await hardPage.goto('/?playtest=1')
  await hardPage.getByRole('button', { name: 'Hold the night' }).click()
  await hardPage.locator('.defend-board').waitFor()
  const hardGo = await hardPage.locator('.defend-go').boundingBox()
  assert.ok(hardGo, '1.4.496 Hard Begin is on screen')
  const hardStart = Date.now()
  await hardPage.mouse.click(hardGo.x + hardGo.width / 2, hardGo.y + hardGo.height / 2)
  let sawWalker = false
  while (Date.now() - hardStart < 2200) {
    assert.equal(await hardPage.locator('[data-wave-count]').count(), 0, '1.4.496 Hard has no count')
    assert.equal(await hardPage.locator('[data-wave-survived]').count(), 0, '1.4.496 Hard has no burst')
    if ((await hardPage.locator('.defend-raider').count()) > 0) {
      sawWalker = true
      break
    }
    await hardPage.waitForTimeout(80)
  }
  assert.equal(sawWalker, true, '1.4.496 Hard sends a walker without the Easy count')
  const hardRange = await hardPage.evaluate(() => {
    const pageNode = document.querySelector('.defend-page')
    const node = document.querySelector('.defend-range:not(.is-firing):not(.is-bell-pulse):not(.is-incense-cloud)')
    const style = node ? getComputedStyle(node) : null
    return {
      easy: pageNode?.classList.contains('is-easy-watch') === true,
      opacity: style?.opacity ?? '',
      display: style?.display ?? '',
    }
  })
  assert.equal(hardRange.easy, false, '1.4.496 Hard is outside the Easy range hide')
  if (hardRange.opacity) {
    assert.notEqual(hardRange.opacity, '0', '1.4.496 Hard still shows the idle range line')
    assert.notEqual(hardRange.display, 'none', '1.4.496 Hard does not take the Easy range hide')
  }
  await hard.close()
}

async function checkJumpSeatsAndCandle(browser, port, errors) {
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
  listen(page, errors, 'jump seats 375')
  await openJump(page, '?playtest=1&nwRound=20&nwLamps=0')
  if (await page.locator('[data-map-overlay]').count()) {
    await page.locator('[data-map="a2"]').click()
    await page.locator('[data-map-overlay]').waitFor({ state: 'detached' })
  }
  for (const seat of NAMED_SEATS) {
    const tap = SEAT_TAPS.find((item) => item.type === seat.type)
    await page.locator(`[data-type="${seat.type}"]`).click()
    await page.mouse.click(tap.x, tap.y)
    await page.waitForTimeout(80)
  }
  const planted = await page.evaluate(() =>
    [...document.querySelectorAll('.defend-pad.is-planted')].map((node) => ({
      type: node.getAttribute('data-tower-type'),
      transform: node.getAttribute('transform'),
    })),
  )
  for (const seat of NAMED_SEATS) {
    assert.ok(
      planted.some((pad) => pad.type === seat.type && pad.transform === seat.feet),
      `1.4.497 ${seat.id} is planted after the nwRound jump ${JSON.stringify(planted)}`,
    )
  }
  await openNamedUpgrades(page, 'pre-Begin after an nwRound jump')
  const candle = page.locator('.nw-docks:has(.defend-go) button.defend-candle-lamp')
  await candle.click()
  assert.equal(await candle.getAttribute('aria-pressed'), 'true', '1.4.497 Candle arms from the chip')
  await page.mouse.move(180, 280)
  await page.waitForTimeout(80)
  assert.ok((await page.locator('.defend-ghost-ring').count()) >= 1, '1.4.497 an armed Candle shows where it will plant')
  await context.close()
}

async function plateFinger(page, plate) {
  const point = await page.evaluate((spot) => {
    const svg = document.querySelector('.defend-board')
    if (!(svg instanceof SVGSVGElement)) return null
    const ctm = svg.getScreenCTM()
    if (!ctm) return null
    const p = svg.createSVGPoint()
    p.x = spot.x
    p.y = spot.y - 26
    const client = p.matrixTransform(ctm)
    return { x: client.x, y: client.y }
  }, plate)
  assert.ok(point, '1.4.503 the plate finger is on screen')
  return point
}

function rgbParts(fill) {
  const match = /rgba?\((\d+),\s*(\d+),\s*(\d+)/.exec(fill || '')
  assert.ok(match, `fill ${fill}`)
  return { r: Number(match[1]), g: Number(match[2]), b: Number(match[3]) }
}

/** Easy 375. A dead seat is refused with the toast. A live seat plants. */
async function checkDeadSeat(browser, port, errors) {
  mkdirSync('/opt/cursor/artifacts', { recursive: true })
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
  listen(page, errors, 'dead seat 375')
  await openJump(page, '?playtest=1')
  if (await page.locator('[data-map-overlay]').count()) {
    await page.locator('[data-map="a2"]').click()
    await page.locator('[data-map-overlay]').waitFor({ state: 'detached' })
  }
  await page.locator('[data-type="love"]').click()
  const tint = await page.evaluate(() => {
    const fill = (node) => (node ? getComputedStyle(node).fill : '')
    return {
      live: document.querySelectorAll('[data-seat="live"]').length,
      dead: document.querySelectorAll('[data-seat="dead"]').length,
      liveFill: fill(document.querySelector('[data-seat="live"]')),
      deadFill: fill(document.querySelector('[data-seat="dead"]')),
      armed: document.querySelector('.defend-page')?.classList.contains('is-placing') === true,
    }
  })
  assert.equal(tint.armed, true, '1.4.503 the card is armed while the seats tint')
  assert.ok(tint.live > 0, `1.4.503 a live seat is tinted (${tint.live})`)
  assert.ok(tint.dead > 0, `1.4.503 a dead seat is tinted (${tint.dead})`)
  const liveRgb = rgbParts(tint.liveFill)
  const deadRgb = rgbParts(tint.deadFill)
  assert.ok(liveRgb.g > liveRgb.r && liveRgb.g > liveRgb.b, `1.4.503 live seats are green (${tint.liveFill})`)
  assert.ok(
    Math.abs(deadRgb.r - deadRgb.g) < 30 && Math.abs(deadRgb.g - deadRgb.b) < 30 && deadRgb.r < 140,
    `1.4.503 dead seats are grey (${tint.deadFill})`,
  )
  await page.screenshot({ path: '/opt/cursor/artifacts/nw-503-armed.png' })
  const deadPlate = { x: 56, y: 88 }
  const deadFinger = await plateFinger(page, deadPlate)
  await page.mouse.move(deadFinger.x, deadFinger.y)
  await page.waitForTimeout(80)
  const ring = await page.locator('.defend-ghost').evaluate((node) => ({
    reaches: node.getAttribute('data-reaches'),
    note: node.getAttribute('data-reach-note'),
    dead: node.classList.contains('is-dead'),
    transform: node.getAttribute('transform'),
  }))
  assert.equal(ring.reaches, 'no', '1.4.503 the finger ring says the dead seat misses')
  assert.equal(ring.note, 'Too far from the road', '1.4.503 the dead seat stays too far')
  assert.equal(ring.dead, true, '1.4.503 the dead ring is marked')
  assert.match(ring.transform || '', /translate\(56(?:\.0)? 88(?:\.0)?\)/, `1.4.503 the ring sits on the dead seat (${ring.transform})`)
  await page.mouse.click(deadFinger.x, deadFinger.y)
  await page.getByText('Too far from the road. Plant closer to the path.').waitFor()
  assert.equal(await page.locator('.defend-pad.is-planted').count(), 0, '1.4.503 the dead seat does not plant')
  await page.screenshot({ path: '/opt/cursor/artifacts/nw-503-dead-toast.png' })
  const blockedFinger = await plateFinger(page, { x: 340, y: 656 })
  await page.mouse.click(blockedFinger.x, blockedFinger.y)
  await page.getByText('Plant on open ground.').waitFor()
  assert.equal(await page.locator('.defend-pad.is-planted').count(), 0, '1.4.503 a blocked seat does not plant')
  const livePlate = await page.evaluate(() => {
    const svg = document.querySelector('.defend-board')
    if (!(svg instanceof SVGSVGElement)) return null
    const ctm = svg.getScreenCTM()
    if (!ctm) return null
    for (const node of document.querySelectorAll('[data-seat="live"]')) {
      const x = Number(node.getAttribute('cx'))
      const y = Number(node.getAttribute('cy'))
      const p = svg.createSVGPoint()
      p.x = x
      p.y = y - 26
      const client = p.matrixTransform(ctm)
      const hit = document.elementFromPoint(client.x, client.y)
      const onBoard = Boolean(hit && hit.closest('.defend-board') && !hit.closest('button, .nw-rail, .nw-docks'))
      if (onBoard) return { x, y }
    }
    return null
  })
  assert.ok(livePlate, '1.4.503 a live seat can take the tap')
  const liveFinger = await plateFinger(page, livePlate)
  await page.mouse.move(liveFinger.x, liveFinger.y)
  await page.waitForTimeout(80)
  const liveRing = await page.locator('.defend-ghost').evaluate((node) => node.getAttribute('data-reaches'))
  assert.equal(liveRing, 'yes', '1.4.503 the finger ring says the live seat reaches')
  await page.mouse.click(liveFinger.x, liveFinger.y)
  await page.waitForTimeout(120)
  const planted = await page.locator('.defend-pad.is-planted').evaluateAll((nodes) =>
    nodes.map((node) => ({
      label: node.getAttribute('aria-label'),
      transform: node.getAttribute('transform'),
    })),
  )
  assert.equal(planted.length, 1, `1.4.503 the live seat plants ${JSON.stringify(planted)}`)
  assert.match(planted[0].label || '', /Upgrade lamp at open ground/, '1.4.503 the planted lamp keeps its name')
  await page.locator('[data-place-toast]').waitFor({ state: 'detached', timeout: 1000 })
  assert.equal(await page.locator('[data-place-toast]').count(), 0, '1.4.503 a live plant clears the refusal')
  await page.screenshot({ path: '/opt/cursor/artifacts/nw-503-live-plant.png' })
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
    await checkWaveCues(browser, port, errors)
    await checkJumpSeatsAndCandle(browser, port, errors)
    await checkDeadSeat(browser, port, errors)
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
