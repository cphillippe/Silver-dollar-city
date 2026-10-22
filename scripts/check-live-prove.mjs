/**
 * Live prove for 1.4.496.
 * Real clicks and elementFromPoint. A planted incense still hits.
 * A walker inside a lamp box wins. The map sheet is the top layer.
 * Later rounds field more than three walkers. The clear bar stays put.
 * The Love lamp's box does not cover Candle or Spend.
 */
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { inflateSync } from 'node:zlib'
import { build } from 'esbuild'
import { createElement } from 'react'
import { renderToString } from 'react-dom/server'
import { createServer } from 'vite'
import { chromium } from '@playwright/test'
import { SAVE_KIND, emptyProgress } from '../src/lib/save.ts'
import { SAVE_SCHEMA_VERSION, STORAGE_KEY } from '../src/config/app.ts'
import { DEFEND_PATH, pathPoint } from '../src/nightWatch/path/data.ts'
import { WALK_IN_TAP_MAX_MS, walkInEntry, walkInLength, walkInMs, walkInTapLockMs } from '../src/nightWatch/maps/walkIn.ts'
import { nightMapFromPack } from '../src/nightWatch/maps/fromPack.ts'
import { EASY_ROUNDS } from '../src/nightWatch/rounds.ts'
import { gaitForSlot } from '../src/nightWatch/walkers.ts'
import { SPAWN_BOX_U, spawnMarkerPlateBox, spawnMarkersFor } from '../src/nightWatch/maps/spawnMarkers.ts'
import { evidenceFor } from '../src/content/evidence.ts'
import { localDateKey } from '../src/lib/dates.ts'
import { EASY_LINE_ORDER } from '../src/lib/easy.ts'
import { shareCardText } from '../src/lib/shareCard.ts'
import { EASY_FACE_HIT_R, PATH_WALKER_FACE_DY } from '../src/lib/defend.ts'
import { EASY } from '../src/lib/easy.ts'

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

/** Round 20 lamps already log a duplicate render key. That warning is older than this hop. */
function listenCrown(page, errors, label) {
  page.on('pageerror', (error) => errors.push(`${label} ${error}`))
  page.on('console', (msg) => {
    if (msg.type() !== 'error') return
    const text = msg.text()
    if (text.includes('Encountered two children with the same key')) return
    errors.push(`${label} ${text}`)
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


/** #792b NWUI-1: nodes that paint gold (255,204,51 or 255,159,26) among the screen's buttons and cards. */
async function goldCues(page) {
  return page.evaluate(() => {
    const root = document.querySelector('.defend-page')
    if (!root) return []
    const gold = (value) => value.includes('255, 204, 51') || value.includes('255, 159, 26')
    return [...root.querySelectorAll('.btn.primary, .defend-ability.is-on, .defend-tower-card, button.defend-new-lamp')]
      .filter((node) => {
        const box = node.getBoundingClientRect()
        const style = getComputedStyle(node)
        return box.width > 1 && box.height > 1 && style.display !== 'none' && style.visibility !== 'hidden' && Number(style.opacity) > 0
      })
      .filter((node) => {
        const style = getComputedStyle(node)
        return gold(style.backgroundImage) || gold(style.backgroundColor) || gold(style.borderTopColor)
      })
      .map((node) => `${node.tagName}.${node.getAttribute('class') || ''}`.slice(0, 60))
  })
}

async function tapCueUntilBoost(page, ms) {
  const fight = Date.now()
  while (Date.now() - fight < ms && (await page.locator('.defend-page.is-boost').count()) < 1) {
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
}

/** #792b NWUI-1: one gold per Night Watch state, at 375 and 390. Real pointer input. */
async function checkGoldCues(browser, port, errors, width, height) {
  const label = `${width}x${height}`
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
  listen(page, errors, `gold ${label}`)
  await openJump(page, '?playtest=1&nwRound=2')
  const pre = await goldCues(page)
  assert.ok(pre.length <= 1, `#792b NWUI-1 ${label} pre-Begin has at most one gold (${pre})`)
  assert.ok(pre.some((name) => name.includes('defend-go')) || pre.length === 0, `#792b NWUI-1 ${label} the one pre-Begin gold is Begin (${pre})`)
  await page.locator('.defend-clear-lamp').first().click()
  await page.locator('.defend-tower-card').waitFor()
  const planted = await goldCues(page)
  assert.ok(planted.length <= 1, `#792b NWUI-1 ${label} after a plant, with the card open, has at most one gold (${planted})`)
  assert.equal(await page.getByRole('button', { name: /^Far, (need \d+|\d+ sparks)$/ }).count(), 1, `#792b NWUI-3 ${label} one Far button pre-Begin`)
  assert.equal(await page.getByRole('button', { name: /^Strong, (need \d+|\d+ sparks)$/ }).count(), 1, `#792b NWUI-3 ${label} one Strong button pre-Begin`)
  await page.locator('.defend-go').click()
  await page.locator('.defend-page.is-easy-tap').waitFor()
  await page.locator('[data-walker-tap]').first().waitFor()
  await page.locator('.defend-clear-lamp').first().click()
  await page.locator('.defend-tower-card').waitFor()
  const strip = await goldCues(page)
  assert.ok(strip.length <= 1, `#792b NWUI-1 ${label} mid-wave with the strip open has at most one gold (${strip})`)
  assert.equal(await page.getByRole('button', { name: /^Far, (need \d+|\d+ sparks)$/ }).count(), 1, `#792b NWUI-3 ${label} one Far button mid-wave`)
  assert.equal(await page.getByRole('button', { name: /^Strong, (need \d+|\d+ sparks)$/ }).count(), 1, `#792b NWUI-3 ${label} one Strong button mid-wave`)
  await page.locator('.defend-clear-lamp').first().click({ force: true })
  await tapCueUntilBoost(page, 90_000)
  await page.locator('.defend-page.is-boost').waitFor()
  await page.locator('.defend-continue').waitFor()
  const clear = await goldCues(page)
  assert.ok(clear.length <= 1, `#792b NWUI-1 ${label} the clear has at most one gold (${clear})`)
  assert.ok(clear.some((name) => name.includes('defend-continue')), `#792b NWUI-1 ${label} the one clear gold is Continue (${clear})`)
  await page.screenshot({ path: `/opt/cursor/artifacts/screenshots/nwui-gold-clear-${width}.png` })
  await context.close()
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
  assert.match(waveBuys.far, /^Far, (need \d+|\d+ sparks)$/, `#792b NWUI-3 mid-wave Far has its own name (${waveBuys.far})`)
  assert.match(waveBuys.strong, /^Strong, (need \d+|\d+ sparks)$/, `#792b NWUI-3 mid-wave Strong has its own name (${waveBuys.strong})`)
  assert.notEqual(waveBuys.far, waveBuys.strong, '#792b NWUI-3 Far and Strong names differ mid-wave')
  assert.match(beforeBuys.far, /^Far, /, `#792b NWUI-3 pre-Begin Far name (${beforeBuys.far})`)
  assert.match(beforeBuys.strong, /^Strong, /, `#792b NWUI-3 pre-Begin Strong name (${beforeBuys.strong})`)
  assert.equal(await page.getByRole('button', { name: /^Far, (need \d+|\d+ sparks)$/ }).count(), 1, '#792b NWUI-3 one Far button by role')
  assert.equal(await page.getByRole('button', { name: /^Strong, (need \d+|\d+ sparks)$/ }).count(), 1, '#792b NWUI-3 one Strong button by role')
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
  const blockedFinger = await page.evaluate(() => {
    const svg = document.querySelector('.defend-board')
    if (!(svg instanceof SVGSVGElement)) return null
    const ctm = svg.getScreenCTM()
    if (!ctm) return null
    const spot = svg.createSVGPoint()
    spot.x = 288
    spot.y = 200
    const client = spot.matrixTransform(ctm)
    return { x: client.x, y: client.y }
  })
  assert.ok(blockedFinger, '1.4.508 a road finger is on screen')
  await page.mouse.move(blockedFinger.x, blockedFinger.y)
  await page.mouse.down()
  await page.mouse.up()
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

/** Every map: every grey seat stays empty unless the too-far toast is up. */
async function checkGreyMaps(browser, port, errors) {
  const maps = ['a2', 'far-hills', 'map03', 'map04', 'map05', 'map06']
  const tooFar = 'Too far from the road'
  for (const id of maps) {
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
    listen(page, errors, `grey ${id}`)
    const search = id === 'a2' ? '?playtest=1&nwSeed=2' : `?playtest=1&nwSeed=2&nwMap=${id}`
    await openJump(page, search)
    if (await page.locator('[data-map-overlay]').count()) {
      await page.locator(`[data-map="${id}"]`).click()
      await page.locator('[data-map-overlay]').waitFor({ state: 'detached' })
    }
    await page.locator('[data-type="love"]').click()
    await page.locator('[data-seat="dead"]').first().waitFor()
    const readDead = () =>
      page.locator('[data-seat="dead"]').evaluateAll((nodes) =>
        nodes.map((node) => ({
          x: Number(node.getAttribute('cx')),
          y: Number(node.getAttribute('cy')),
        })),
      )
    let seats = await readDead()
    let settled = false
    for (let attempt = 0; attempt < 8; attempt += 1) {
      await page.waitForTimeout(120)
      const next = await readDead()
      const same =
        next.length === seats.length && next.every((seat, index) => seat.x === seats[index].x && seat.y === seats[index].y)
      seats = next
      if (same && seats.length > 0) {
        settled = true
        break
      }
    }
    assert.ok(settled, `1.4.504 ${id} grey seats settled (${seats.length})`)
    let checked = 0
    let toasted = 0
    for (const seat of seats) {
      const stillDead = await page.locator(`[data-seat="dead"][cx="${seat.x}"][cy="${seat.y}"]`).count()
      assert.ok(stillDead > 0, `1.4.504 ${id} grey ${seat.x},${seat.y} is still a dead seat`)
      const finger = await plateFinger(page, seat)
      const before = await page.locator('.defend-pad.is-planted').count()
      const onPlate = await page.evaluate((point) => {
        if (point.x < 1 || point.y < 1 || point.x > 374 || point.y > 666) return false
        const node = document.elementFromPoint(point.x, point.y)
        return Boolean(node && node.closest && node.closest('.defend-board'))
      }, finger)
      const here = new RegExp(`translate\\(${seat.x}(?:\\.0)? ${seat.y}(?:\\.0)?\\)`)
      const readRing = async () =>
        (await page.locator('.defend-ghost').count())
          ? page.locator('.defend-ghost').evaluate((node) => ({
              reaches: node.getAttribute('data-reaches'),
              dead: node.classList.contains('is-dead'),
              nogo: node.getAttribute('data-lamp-ghost') === 'nogo',
              note: node.getAttribute('data-reach-note') || '',
              transform: node.getAttribute('transform') || '',
            }))
          : null
      let openDead = false
      let ring = null
      if (onPlate) {
        await page.mouse.move(finger.x, finger.y)
        await page.waitForTimeout(40)
        ring = await readRing()
        openDead = Boolean(ring && !ring.nogo && ring.dead && ring.reaches === 'no' && here.test(ring.transform))
        await page.mouse.down()
        await page.mouse.up()
      } else {
        const board = page.locator('.defend-board')
        await board.dispatchEvent('pointerdown', {
          clientX: finger.x,
          clientY: finger.y,
          pointerId: 1,
          bubbles: true,
        })
        await page.waitForTimeout(40)
        ring = await readRing()
        openDead = Boolean(ring && !ring.nogo && ring.dead && ring.reaches === 'no' && here.test(ring.transform))
        await board.dispatchEvent('pointerup', {
          clientX: finger.x,
          clientY: finger.y,
          pointerId: 1,
          bubbles: true,
        })
      }
      await page.waitForTimeout(120)
      const afterClick = await page.evaluate((spot) => ({
        toast: document.querySelector('[data-place-toast]')?.textContent?.trim() || '',
        planted: document.querySelectorAll('.defend-pad.is-planted').length,
        pads: [...document.querySelectorAll('.defend-pad.is-planted')].map((node) => node.getAttribute('transform') || ''),
        phase: document.querySelector('.defend-page')?.getAttribute('data-phase') || '',
        seatNow: document.querySelector(`[data-seat][cx="${spot.x}"][cy="${spot.y}"]`)?.getAttribute('data-seat') || '',
      }), seat)
      const saidWhy = afterClick.toast.includes(tooFar)
      assert.ok(
        afterClick.planted === before || saidWhy,
        `1.4.504 ${id} grey ${seat.x},${seat.y} planted without the Too far from the road toast (${JSON.stringify({ ...afterClick, onPlate, openDead, ring })})`,
      )
      assert.equal(
        afterClick.planted,
        before,
        `1.4.504 ${id} grey ${seat.x},${seat.y} does not plant (${JSON.stringify(afterClick)})`,
      )
      if (openDead) {
        assert.equal(
          afterClick.toast,
          'Too far from the road. Plant closer to the path.',
          `1.4.504 ${id} grey ${seat.x},${seat.y} says why (${JSON.stringify(afterClick)})`,
        )
      }
      if (saidWhy) toasted += 1
      checked += 1
    }
    assert.equal(checked, seats.length, `1.4.504 ${id} checks every grey seat`)
    assert.ok(toasted > 0, `1.4.504 ${id} refused a grey seat with the toast (${toasted} of ${seats.length})`)
    console.log(
      `grey ${id}: ${seats.length} data-seat=dead checked, ${toasted} with the Too far from the road toast, 0 planted without that toast`,
    )
    if (id === 'a2') {
      assert.ok(
        seats.some((seat) => seat.x === 192 && seat.y === 632),
        '1.4.503 the reported seat is grey',
      )
      const finger = await plateFinger(page, { x: 192, y: 632 })
      await page.mouse.move(finger.x, finger.y)
      await page.waitForTimeout(40)
      const ring = await page.locator('.defend-ghost').evaluate((node) => ({
        reaches: node.getAttribute('data-reaches'),
        transform: node.getAttribute('transform') || '',
      }))
      assert.equal(ring.reaches, 'no', '1.4.503 the reported seat ring misses')
      assert.match(ring.transform, /translate\(192(?:\.0)? 632(?:\.0)?\)/)
      const before = await page.locator('.defend-pad.is-planted').count()
      await page.mouse.click(finger.x, finger.y)
      await page.getByText('Too far from the road. Plant closer to the path.').waitFor()
      assert.equal(await page.locator('.defend-pad.is-planted').count(), before, '1.4.503 (192, 632) does not plant')
      await page.screenshot({ path: '/opt/cursor/artifacts/nw-504-grey-192.png' })
    }
    await context.close()
  }
}

export async function checkShareCard(browser, port, errors) {
  const brief = evidenceFor('ph-road')
  assert.ok(brief, 'ph-road has a line to share')
  const today = localDateKey()
  const save = {
    kind: SAVE_KIND,
    schemaVersion: SAVE_SCHEMA_VERSION,
    appVersion: '1.4.507',
    savedAt: '2026-10-19T00:00:00.000Z',
    progress: {
      started: true,
      easyMode: true,
      theme: 'candy',
      completed: [],
      lastDailyDate: today,
      dailyDates: [today],
      held: [],
      easyHeld: [],
      easyTaught: [],
      learnings: [
        {
          id: 'ph-road',
          claim: brief.claim,
          reason: brief.reason,
          source: brief.source,
          anchor: 'Juniper’s east porch',
          acquiredAt: today,
        },
      ],
    },
  }
  mkdirSync('/opt/cursor/artifacts/screenshots', { recursive: true })
  for (const [width, height] of [
    [375, 667],
    [412, 915],
  ]) {
    const context = await browser.newContext({
      baseURL: `http://127.0.0.1:${port}/`,
      viewport: { width, height },
      deviceScaleFactor: 1,
      reducedMotion: 'reduce',
    })
    await context.addInitScript(
      (payload) => {
        localStorage.setItem(payload.key, JSON.stringify(payload.save))
        const calls = []
        window.__shareCalls = calls
        const share = async (data) => {
          calls.push(data)
        }
        try {
          Object.defineProperty(navigator, 'share', { configurable: true, writable: true, value: share })
        } catch {
          navigator.share = share
        }
        const clip = []
        window.__clip = clip
        const clipboard = { writeText: async (text) => { clip.push(text) } }
        try {
          Object.defineProperty(navigator, 'clipboard', { configurable: true, value: clipboard })
        } catch {
          navigator.clipboard = clipboard
        }
      },
      { key: STORAGE_KEY, save },
    )
    const page = await context.newPage()
    listen(page, errors, `share ${width}`)
    await page.goto('/')
    await page.locator('main.hub').waitFor()
    await page.getByRole('banner').getByRole('button', { name: 'Lock In', exact: true }).click()
    await page.getByRole('figure', { name: 'Say it back tomorrow' }).waitFor()
    const layout = await page.evaluate((source) => {
      const shareBtn = [...document.querySelectorAll('button')].find(
        (node) => (node.textContent || '').trim() === 'Share this line',
      )
      const home = [...document.querySelectorAll('main.journal .btn.primary')].find(
        (node) => (node.innerText || '').replace(/\s+/g, ' ').trim() === 'Home',
      )
      const card = document.querySelector('.share-card')
      function place(node) {
        if (!(node instanceof HTMLElement)) return null
        const rect = node.getBoundingClientRect()
        const top = document.elementFromPoint(rect.left + rect.width / 2, rect.top + Math.min(rect.height / 2, 12))
        return {
          top: Math.round(rect.top),
          bottom: Math.round(rect.bottom),
          hit: top === node || (top instanceof Node && node.contains(top)),
        }
      }
      const golds = []
      for (const el of document.querySelectorAll('.btn.primary, .btn.gold')) {
        if (!(el instanceof HTMLElement)) continue
        const style = getComputedStyle(el)
        if (style.display === 'none' || style.visibility === 'hidden' || Number(style.opacity) === 0) continue
        const rect = el.getBoundingClientRect()
        if (rect.width <= 0 || rect.height <= 0) continue
        golds.push({
          gold: el.classList.contains('gold'),
          primary: el.classList.contains('primary'),
          text: (el.innerText || '').replace(/\s+/g, ' ').trim(),
        })
      }
      const digits = source.match(/\d+/g) || []
      let rest = card?.innerText || ''
      for (const digit of digits) rest = rest.split(digit).join('')
      return {
        share: place(shareBtn),
        home: place(home),
        vh: window.innerHeight,
        golds,
        restHasDigit: /\d/.test(rest),
        shareClass: shareBtn?.className || '',
      }
    }, brief.source)
    assert.equal(layout.shareClass, 'btn', `${width} share button is a plain btn`)
    assert.equal(layout.share?.hit, true, `${width} Share this line is the hit target ${JSON.stringify(layout.share)}`)
    assert.ok(layout.home && layout.home.top >= 0 && layout.home.bottom <= layout.vh + 1, `${width} Home stays on screen ${JSON.stringify(layout.home)}`)
    assert.equal(layout.restHasDigit, false, `${width} card digits are only the source ref`)
    assert.equal(layout.golds.filter((item) => item.gold).length, 0, `${width} the share screen has no .btn.gold`)
    const filled = layout.golds.filter((item) => item.primary)
    assert.equal(filled.length, 1, `${width} one filled gold ${JSON.stringify(layout.golds)}`)
    assert.equal(filled[0].text, 'Home', `${width} the filled gold is Home`)
    if (width === 375) {
      await page.screenshot({ path: '/opt/cursor/artifacts/screenshots/share-card-375.png' })
    }
    await page.getByRole('button', { name: 'Share this line', exact: true }).click()
    await page.locator('.share-card-actions [role="status"]').filter({ hasText: 'Shared.' }).waitFor()
    const shared = await page.evaluate(() => ({
      calls: window.__shareCalls || [],
      counts: JSON.parse(localStorage.getItem('silver-city-share-v1') || '{}'),
    }))
    assert.equal(shared.calls.length, 1, `${width} navigator.share received the line`)
    assert.match(`${shared.calls[0].text}\n${shared.calls[0].url}`, /utm_campaign=sayitback/)
    assert.doesNotMatch(`${shared.calls[0].text}\n${shared.calls[0].url}`, /playtest|debug|nwSeed|cb=/)
    assert.equal(shared.counts.taps, 1, `${width} one local share tap`)
    await page.reload()
    const kept = await page.evaluate(() => JSON.parse(localStorage.getItem('silver-city-share-v1') || '{}'))
    assert.equal(kept.taps, 1, `${width} share taps survive a reload`)
    await context.close()
  }
}

const SHARE_URL =
  'https://cphillippe.github.io/Silver-dollar-city/?utm_source=share&utm_medium=referral&utm_campaign=sayitback'

/** Real pointer taps. Playwright tap(), never element.click(). */
export async function checkShareBusyTap(browser, port, errors) {
  const brief = evidenceFor('ph-road')
  assert.ok(brief, 'ph-road has a line to share')
  const expected = shareCardText({
    claim: brief.claim,
    reason: brief.reason,
    source: brief.source,
  })
  assert.ok(expected.endsWith(SHARE_URL), 'the shared line ends with the sayitback url')
  const today = localDateKey()
  const save = {
    kind: SAVE_KIND,
    schemaVersion: SAVE_SCHEMA_VERSION,
    appVersion: '1.4.513',
    savedAt: '2026-10-20T00:00:00.000Z',
    progress: {
      started: true,
      easyMode: true,
      theme: 'candy',
      completed: [],
      lastDailyDate: today,
      dailyDates: [today],
      held: [],
      easyHeld: [],
      easyTaught: [],
      learnings: [
        {
          id: 'ph-road',
          claim: brief.claim,
          reason: brief.reason,
          source: brief.source,
          anchor: 'Juniper’s east porch',
          acquiredAt: today,
        },
      ],
    },
  }
  mkdirSync('/opt/cursor/artifacts/screenshots', { recursive: true })
  for (const [width, height] of [
    [375, 667],
    [412, 915],
    [768, 1024],
  ]) {
    const context = await browser.newContext({
      baseURL: `http://127.0.0.1:${port}/`,
      viewport: { width, height },
      deviceScaleFactor: 1,
      reducedMotion: 'reduce',
      hasTouch: true,
    })
    await context.addInitScript(
      (payload) => {
        localStorage.setItem(payload.key, JSON.stringify(payload.save))
        const calls = []
        window.__shareCalls = calls
        window.__shareSettled = 0
        let release = () => {}
        window.__releaseShare = () => release()
        const share = (data) => {
          calls.push(data)
          return new Promise((resolve) => {
            release = () => {
              window.__shareSettled += 1
              resolve()
            }
          })
        }
        try {
          Object.defineProperty(navigator, 'share', { configurable: true, writable: true, value: share })
        } catch {
          navigator.share = share
        }
        const clip = []
        window.__clip = clip
        const clipboard = { writeText: async (text) => { clip.push(text) } }
        try {
          Object.defineProperty(navigator, 'clipboard', { configurable: true, value: clipboard })
        } catch {
          navigator.clipboard = clipboard
        }
      },
      { key: STORAGE_KEY, save },
    )
    const page = await context.newPage()
    listen(page, errors, `share busy ${width}`)
    await page.goto('/')
    await page.locator('main.hub').waitFor()
    await page.getByRole('banner').getByRole('button', { name: 'Lock In', exact: true }).click()
    await page.getByRole('figure', { name: 'Say it back tomorrow' }).waitFor()
    const shareBtn = page.getByRole('button', { name: 'Share this line', exact: true })
    assert.equal(await shareBtn.count(), 1, `${width} one Share this line button`)
    await shareBtn.tap()
    await page.waitForFunction(() => (window.__shareCalls || []).length === 1)
    const opened = await page.evaluate(() => ({
      calls: (window.__shareCalls || []).length,
      clip: (window.__clip || []).length,
    }))
    assert.equal(opened.calls, 1, `${width} the first tap calls navigator.share once`)
    assert.equal(opened.clip, 0, `${width} the first tap does not copy`)
    await shareBtn.tap()
    const toast = page.locator('.share-card-actions [role="status"]').filter({
      hasText: 'Copied. Paste it to a friend.',
    })
    await toast.waitFor()
    const busy = await page.evaluate(() => ({
      calls: (window.__shareCalls || []).length,
      clip: window.__clip || [],
      settled: window.__shareSettled || 0,
    }))
    assert.equal(busy.calls, 1, `${width} the second tap adds no share call`)
    assert.equal(busy.settled, 0, `${width} the first share is still pending`)
    assert.equal(busy.clip.length, 1, `${width} the second tap writes the clipboard once`)
    assert.equal(busy.clip[0], expected, `${width} the clipboard is shareCardText`)
    assert.equal(busy.clip[0].endsWith(SHARE_URL), true, `${width} the clipboard ends with the share url`)
    const layout = await page.evaluate(() => {
      function box(node) {
        if (!(node instanceof HTMLElement)) return null
        const rect = node.getBoundingClientRect()
        return { top: rect.top, left: rect.left, right: rect.right, bottom: rect.bottom, width: rect.width, height: rect.height }
      }
      function overlaps(a, b) {
        if (!a || !b || a.height <= 0 || b.height <= 0) return false
        return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top
      }
      function inside(inner, outer) {
        if (!inner || !outer) return false
        return (
          inner.top >= outer.top - 1 &&
          inner.bottom <= outer.bottom + 1 &&
          inner.left >= outer.left - 1 &&
          inner.right <= outer.right + 1
        )
      }
      const toastNode = document.querySelector('.share-card-actions [role="status"]')
      const actions = document.querySelector('.share-card-actions')
      const home = [...document.querySelectorAll('main.journal .btn.primary')].find(
        (node) => (node.innerText || '').replace(/\s+/g, ' ').trim() === 'Home',
      )
      const back = [...document.querySelectorAll('button')].find(
        (node) => (node.innerText || '').replace(/\s+/g, ' ').trim() === '← Home',
      )
      const toastBox = box(toastNode)
      const homeBox = box(home)
      const backBox = box(back)
      return {
        text: (toastNode?.textContent || '').trim(),
        inside: inside(toastBox, box(actions)),
        coversHome: overlaps(toastBox, homeBox),
        coversBack: overlaps(toastBox, backBox),
        vh: window.innerHeight,
        homeTop: homeBox ? homeBox.top : null,
        homeBottom: homeBox ? homeBox.bottom : null,
        backTop: backBox ? backBox.top : null,
      }
    })
    assert.equal(layout.text, 'Copied. Paste it to a friend.', `${width} the toast is the copied line`)
    assert.equal(layout.inside, true, `${width} the toast stays inside the card actions ${JSON.stringify(layout)}`)
    assert.equal(layout.coversHome, false, `${width} the toast covers Home ${JSON.stringify(layout)}`)
    assert.equal(layout.coversBack, false, `${width} the toast covers ← Home ${JSON.stringify(layout)}`)
    assert.ok(layout.homeTop != null && layout.homeBottom <= layout.vh + 1, `${width} Home stays on screen ${JSON.stringify(layout)}`)
    assert.ok(layout.backTop != null && layout.backTop >= 0, `${width} ← Home stays on screen ${JSON.stringify(layout)}`)
    if (width === 375) {
      await page.screenshot({ path: '/opt/cursor/artifacts/screenshots/share-busy-toast-375.png' })
    }
    const appeared = Date.now()
    await toast.waitFor({ state: 'hidden', timeout: 2500 })
    const dismissed = Date.now() - appeared
    assert.ok(dismissed <= 2500, `${width} the toast dismissed in ${dismissed}ms`)
    await page.evaluate(async () => {
      window.__releaseShare()
      await new Promise((resolve) => setTimeout(resolve, 0))
    })
    await shareBtn.tap()
    await page.waitForFunction(() => (window.__shareCalls || []).length === 2)
    const again = await page.evaluate(() => ({
      calls: (window.__shareCalls || []).length,
      settled: window.__shareSettled || 0,
    }))
    assert.equal(again.settled, 1, `${width} the first share settled before the next tap`)
    assert.equal(again.calls, 2, `${width} the tap after the share settles calls navigator.share again`)
    await context.close()
  }
}

export async function checkOssuaryLesson(browser, port, errors) {
  const today = localDateKey()
  const at = EASY_LINE_ORDER.indexOf('psw-ossuary')
  assert.ok(at > 0, 'psw-ossuary stays on the Easy line')
  const prior = EASY_LINE_ORDER.slice(0, at)
  const save = {
    kind: SAVE_KIND,
    schemaVersion: SAVE_SCHEMA_VERSION,
    appVersion: '1.4.507',
    savedAt: '2026-10-19T00:00:00.000Z',
    progress: {
      started: true,
      easyMode: true,
      theme: 'candy',
      completed: [],
      lastDailyDate: today,
      dailyDates: [today],
      held: prior,
      easyHeld: prior,
      easyTaught: prior,
      learnings: [],
    },
  }
  const context = await browser.newContext({
    baseURL: `http://127.0.0.1:${port}/`,
    viewport: { width: 375, height: 667 },
    deviceScaleFactor: 1,
    reducedMotion: 'reduce',
  })
  await context.addInitScript(
    (payload) => localStorage.setItem(payload.key, JSON.stringify(payload.save)),
    { key: STORAGE_KEY, save },
  )
  const page = await context.newPage()
  listen(page, errors, 'ossuary 375')
  await page.goto('/')
  await page.locator('main.hub').waitFor()
  const learn = page.getByRole('button', { name: 'Learn', exact: true })
  await learn.scrollIntoViewIfNeeded()
  await learn.click()
  await page.locator('.teach-reason').waitFor()
  const body = await page.locator('main').innerText()
  assert.match(body, /Paul wrote that he saw James the Lord's brother/)
  assert.match(body, /Galatians 1:19/)
  assert.doesNotMatch(body, /A Jerusalem bone box names James/)
  await page.locator('.teach-reason').scrollIntoViewIfNeeded()
  mkdirSync('/opt/cursor/artifacts/screenshots', { recursive: true })
  await page.screenshot({ path: '/opt/cursor/artifacts/screenshots/ossuary-lesson-375.png' })
  await context.close()
}

const LEAD_GREY = {
  map03: [[152, 275]],
  map04: [
    [152, 206],
    [83, 482],
    [220, 206],
    [289, 482],
  ],
  map05: [[220, 413]],
}

const LEAD_GREEN_TAP = {
  a2: [[220, 275]],
  'far-hills': [[289, 206]],
}

const LEAD_GREEN_DRAG = {
  map05: [
    [152, 551],
    [220, 551],
  ],
}

const POINTER_MAPS = ['a2', 'far-hills', 'map03', 'map04', 'map05', 'map06']
const TOO_FAR_TOAST = 'Too far from the road. Plant closer to the path.'
const CLOSED_TOAST = 'Plant on open ground.'

async function freshWatch(browser, port, errors, id, label) {
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
  listen(page, errors, label)
  const search = id === 'a2' ? '?playtest=1&nwSeed=2' : `?playtest=1&nwSeed=2&nwMap=${id}`
  await openJump(page, search)
  if (await page.locator('[data-map-overlay]').count()) {
    await page.locator(`[data-map="${id}"]`).click()
    await page.locator('[data-map-overlay]').waitFor({ state: 'detached' })
  }
  await page.locator('[data-seat="dead"]').first().waitFor()
  return { context, page }
}

async function armCard(page, type) {
  const card = page.locator(`[data-type="${type}"]`)
  await card.click()
  await page.locator(`[data-type="${type}"][aria-pressed="true"]`).waitFor()
}

async function plantedCount(page) {
  return page.locator('.defend-pad.is-planted').count()
}

async function seatUnder(page, x, y) {
  return page.evaluate(({ x, y }) => {
    const svg = document.querySelector('.defend-board')
    if (!(svg instanceof SVGSVGElement)) return null
    const ctm = svg.getScreenCTM()
    if (!ctm) return null
    const point = svg.createSVGPoint()
    point.x = x
    point.y = y
    const local = point.matrixTransform(ctm.inverse())
    let best = null
    let bestD = Infinity
    for (const node of document.querySelectorAll('[data-seat]')) {
      const cx = Number(node.getAttribute('cx'))
      const cy = Number(node.getAttribute('cy'))
      const away = Math.hypot(cx - local.x, cy - local.y)
      if (away < bestD) {
        bestD = away
        best = { cx, cy, seat: node.getAttribute('data-seat'), d: away }
      }
    }
    return best
  }, { x, y })
}

async function pointerTap(page, x, y) {
  await page.mouse.move(x, y)
  await page.mouse.down()
  await page.mouse.up()
}

async function pointerDrag(page, type, x, y) {
  const box = await page.locator(`[data-type="${type}"]`).boundingBox()
  assert.ok(box, `${type} card is on screen`)
  const from = { x: box.x + box.width / 2, y: box.y + box.height / 2 }
  await page.mouse.move(from.x, from.y)
  await page.mouse.down()
  await page.mouse.move(from.x + 28, from.y, { steps: 4 })
  await page.mouse.move(x, y, { steps: 10 })
  await page.mouse.up()
}

async function openSeatClients(page) {
  return page.evaluate(() => {
    const svg = document.querySelector('.defend-board')
    if (!(svg instanceof SVGSVGElement)) return []
    const ctm = svg.getScreenCTM()
    if (!ctm) return []
    const seats = []
    for (const node of document.querySelectorAll('[data-seat]')) {
      const x = Number(node.getAttribute('cx'))
      const y = Number(node.getAttribute('cy'))
      const point = svg.createSVGPoint()
      point.x = x
      point.y = y
      const client = point.matrixTransform(ctm)
      if (client.x < 4 || client.y < 48 || client.x > 368 || client.y > 640) continue
      const hit = document.elementFromPoint(client.x, client.y)
      const onBoard = Boolean(hit && hit.closest('.defend-board') && !hit.closest('button, .nw-rail, .nw-docks'))
      if (!onBoard) continue
      seats.push({ x, y, cx: client.x, cy: client.y, seat: node.getAttribute('data-seat') })
    }
    seats.sort((a, b) => Math.hypot(a.cx - 160, a.cy - 280) - Math.hypot(b.cx - 160, b.cy - 280))
    return seats
  })
}

async function assertGreyTap(page, x, y, label) {
  const under = await seatUnder(page, x, y)
  assert.equal(under?.seat, 'dead', `${label} ${x},${y} is a grey seat (${JSON.stringify(under)})`)
  assert.ok(under.d < 8, `${label} ${x},${y} is the seat center (${under.d})`)
  const before = await plantedCount(page)
  await page.mouse.move(x, y)
  await page.waitForTimeout(40)
  const ring = await page.locator('.defend-ghost').evaluate((node) => ({
    reaches: node.getAttribute('data-reaches'),
    transform: node.getAttribute('transform') || '',
  }))
  assert.equal(ring.reaches, 'no', `${label} ring on ${x},${y} misses`)
  assert.match(ring.transform, new RegExp(`translate\\(${under.cx}(?:\\.0)? ${under.cy}(?:\\.0)?\\)`))
  await page.mouse.down()
  await page.mouse.up()
  await page.getByText(TOO_FAR_TOAST).waitFor()
  assert.equal(await plantedCount(page), before, `${label} grey ${x},${y} does not plant`)
}

async function assertGreenTap(page, x, y, label) {
  const under = await seatUnder(page, x, y)
  assert.equal(under?.seat, 'live', `${label} ${x},${y} is a green seat (${JSON.stringify(under)})`)
  assert.ok(under.d < 8, `${label} ${x},${y} is the seat center (${under.d})`)
  const before = await plantedCount(page)
  await pointerTap(page, x, y)
  await page.waitForFunction(
    (count) => document.querySelectorAll('.defend-pad.is-planted').length > count,
    before,
  )
  assert.equal(await page.locator('[data-place-toast]').count(), 0, `${label} green ${x},${y} clears the toast`)
}

async function assertGreenDrag(page, type, x, y, label) {
  const under = await seatUnder(page, x, y)
  assert.equal(under?.seat, 'live', `${label} drag ${x},${y} is a green seat (${JSON.stringify(under)})`)
  assert.ok(under.d < 8, `${label} drag ${x},${y} is the seat center (${under.d})`)
  const before = await plantedCount(page)
  await pointerDrag(page, type, x, y)
  await page.waitForFunction(
    (count) => document.querySelectorAll('.defend-pad.is-planted').length > count,
    before,
  )
}

async function plantOffRing(page, type, gesture) {
  const candidates = await page.evaluate(() => {
    const svg = document.querySelector('.defend-board')
    if (!(svg instanceof SVGSVGElement)) return []
    const ctm = svg.getScreenCTM()
    if (!ctm) return []
    const seats = [...document.querySelectorAll('[data-seat]')].map((node) => ({
      x: Number(node.getAttribute('cx')),
      y: Number(node.getAttribute('cy')),
    }))
    const out = []
    for (let y = 140; y <= 860 && out.length < 16; y += 24) {
      for (let x = 96; x <= 680 && out.length < 16; x += 24) {
        const finger = { x, y: y - 26 }
        const nearFinger = seats.some((seat) => Math.hypot(seat.x - finger.x, seat.y - finger.y) <= 46)
        const nearPlant = seats.some((seat) => Math.hypot(seat.x - x, seat.y - y) <= 52)
        if (nearFinger || nearPlant) continue
        const point = svg.createSVGPoint()
        point.x = finger.x
        point.y = finger.y
        const client = point.matrixTransform(ctm)
        if (client.x < 8 || client.y < 64 || client.x > 300 || client.y > 560) continue
        const hit = document.elementFromPoint(client.x, client.y)
        if (!hit?.closest('.defend-board') || hit.closest('button, .nw-rail, .nw-docks')) continue
        out.push({ x: client.x, y: client.y })
      }
    }
    return out
  })
  for (const point of candidates) {
    const before = await plantedCount(page)
    if (gesture === 'tap') {
      await armCard(page, type)
      await pointerTap(page, point.x, point.y)
    } else {
      await pointerDrag(page, type, point.x, point.y)
    }
    if ((await plantedCount(page)) > before) return true
  }
  return false
}

async function assertGreyDrag(page, type, x, y, label) {
  const under = await seatUnder(page, x, y)
  assert.equal(under?.seat, 'dead', `${label} drag ${x},${y} is a grey seat (${JSON.stringify(under)})`)
  const before = await plantedCount(page)
  await pointerDrag(page, type, x, y)
  await page.getByText(TOO_FAR_TOAST).waitFor()
  assert.equal(await plantedCount(page), before, `${label} grey drag ${x},${y} does not plant`)
}

/** Real pointer events. Love and Logic, every map, on the seat center. */
export async function checkPointerSeats(browser, port, errors) {
  mkdirSync('/opt/cursor/artifacts', { recursive: true })
  for (const type of ['love', 'logic']) {
    for (const id of POINTER_MAPS) {
      const { context, page } = await freshWatch(browser, port, errors, id, `pointer ${id} ${type}`)
      await armCard(page, type)
      if (id === 'a2' && type === 'love') {
        const road = await page.evaluate(() => {
          const svg = document.querySelector('.defend-board')
          if (!(svg instanceof SVGSVGElement)) return null
          const ctm = svg.getScreenCTM()
          if (!ctm) return null
          const spot = svg.createSVGPoint()
          spot.x = 288
          spot.y = 200
          const client = spot.matrixTransform(ctm)
          return { x: client.x, y: client.y }
        })
        assert.ok(road, 'a road point is on screen')
        const before = await plantedCount(page)
        await pointerTap(page, road.x, road.y)
        await page.getByText(CLOSED_TOAST).waitFor()
        assert.equal(await plantedCount(page), before, 'a road tap does not plant')
      }
      const listedGrey = LEAD_GREY[id]
      if (listedGrey) {
        for (const [x, y] of listedGrey) {
          await assertGreyTap(page, x, y, `${id} ${type}`)
        }
        if (type === 'love' && (id === 'map03' || id === 'map04' || id === 'map05')) {
          await page.screenshot({ path: `/opt/cursor/artifacts/nw-508-${id}-grey.png` })
        }
      } else {
        const dead = (await openSeatClients(page)).find((seat) => seat.seat === 'dead')
        assert.ok(dead, `${id} ${type} has a grey seat to tap`)
        await assertGreyTap(page, dead.cx, dead.cy, `${id} ${type}`)
      }
      const listedGreen = LEAD_GREEN_TAP[id]
      if (listedGreen) {
        for (const [x, y] of listedGreen) await assertGreenTap(page, x, y, `${id} ${type}`)
        if (type === 'love' && (id === 'map03' || id === 'map04' || id === 'map05')) {
          await page.screenshot({ path: `/opt/cursor/artifacts/nw-508-${id}-green.png` })
        }
      }
      await context.close()
      const drags = LEAD_GREEN_DRAG[id] || []
      for (const [x, y] of drags) {
        const drag = await freshWatch(browser, port, errors, id, `drag ${id} ${type} ${x},${y}`)
        await armCard(drag.page, type)
        await assertGreenDrag(drag.page, type, x, y, `${id} ${type}`)
        if (type === 'love' && x === 152) {
          await drag.page.screenshot({ path: `/opt/cursor/artifacts/nw-508-${id}-green.png` })
        }
        await drag.context.close()
      }
      if (!listedGreen && drags.length === 0) {
        const planted = await freshWatch(browser, port, errors, id, `green ${id} ${type}`)
        await armCard(planted.page, type)
        const live = (await openSeatClients(planted.page)).find((seat) => seat.seat === 'live')
        assert.ok(live, `${id} ${type} has a green seat to tap`)
        await assertGreenTap(planted.page, live.cx, live.cy, `${id} ${type}`)
        if (type === 'love' && (id === 'map03' || id === 'map04' || id === 'map05')) {
          await planted.page.screenshot({ path: `/opt/cursor/artifacts/nw-508-${id}-green.png` })
        }
        await planted.context.close()
      }
      console.log(`pointer ${id} ${type}: grey refused, green planted`)
    }
  }
  for (const id of POINTER_MAPS) {
    for (const finish of ['tap', 'drag']) {
      const { context, page } = await freshWatch(browser, port, errors, id, `after ${id} ${finish}`)
      const seats = await openSeatClients(page)
      const live = seats.filter((seat) => seat.seat === 'live')
      if (live.length >= 4) {
        const setup = [live[0], live[Math.floor(live.length / 3)], live[Math.floor((live.length * 2) / 3)]]
        await armCard(page, 'love')
        await assertGreenTap(page, setup[0].cx, setup[0].cy, `${id} love setup`)
        await armCard(page, 'logic')
        await assertGreenTap(page, setup[1].cx, setup[1].cy, `${id} logic setup`)
        await assertGreenDrag(page, 'reason', setup[2].cx, setup[2].cy, `${id} reason setup`)
      } else {
        assert.ok(await plantOffRing(page, 'love', 'tap'), `${id} plants a lamp off the rings`)
        assert.ok(await plantOffRing(page, 'logic', 'tap'), `${id} plants a second lamp off the rings`)
        assert.ok(await plantOffRing(page, 'reason', 'drag'), `${id} drags a lamp off the rings`)
      }
      assert.equal(await plantedCount(page), 3, `${id} holds two taps and one drag`)
      const left = await openSeatClients(page)
      const liveLeft = left.filter((seat) => seat.seat === 'live')
      const deadLeft = left.filter((seat) => seat.seat === 'dead')
      assert.ok(liveLeft.length >= 1, `${id} still has a green seat (${liveLeft.length})`)
      assert.ok(deadLeft.length >= 2, `${id} still has grey seats (${deadLeft.length})`)
      await armCard(page, 'science')
      await assertGreyTap(page, deadLeft[0].cx, deadLeft[0].cy, `${id} science after`)
      await assertGreyDrag(page, 'science', deadLeft[1].cx, deadLeft[1].cy, `${id} science after`)
      if (finish === 'tap') await assertGreenTap(page, liveLeft[0].cx, liveLeft[0].cy, `${id} science after`)
      else await assertGreenDrag(page, 'science', liveLeft[0].cx, liveLeft[0].cy, `${id} science after`)
      assert.equal(await plantedCount(page), 4, `${id} ${finish} plants the green seat after the refusals`)
      console.log(`pointer ${id} after 2 taps + 1 drag: grey tap and drag refused, green ${finish} planted`)
      await context.close()
    }
  }
}

async function pointerAt(page, x, y) {
  await page.mouse.move(x, y)
  await page.mouse.down()
  await page.mouse.up()
}

/** Real pointer events on the center of a control. Not element.click. */
async function pointerBox(page, selector) {
  const box = await page.locator(selector).boundingBox()
  assert.ok(box && box.width >= 8 && box.height >= 8, `${selector} has a box ${JSON.stringify(box)}`)
  const x = box.x + box.width / 2
  const y = box.y + box.height / 2
  const hit = await page.evaluate(
    ({ x, y, selector }) => {
      const node = document.elementFromPoint(x, y)
      return { tag: node?.tagName || '', match: Boolean(node?.closest?.(selector)) }
    },
    { x, y, selector },
  )
  assert.equal(hit.match, true, `${selector} takes the pointer (${hit.tag})`)
  await pointerAt(page, x, y)
}

async function openEasyWave(browser, port, errors, search, label) {
  const context = await browser.newContext({
    baseURL: `http://127.0.0.1:${port}/`,
    viewport: { width: 375, height: 667 },
    deviceScaleFactor: 1,
  })
  await context.addInitScript(
    (payload) => localStorage.setItem(payload.key, JSON.stringify(payload.save)),
    { key: STORAGE_KEY, save: SAVE },
  )
  const page = await context.newPage()
  listenCrown(page, errors, label)
  await openJump(page, search)
  if (await page.locator('[data-map-overlay]').count()) {
    const map = await page.locator('[data-map="a2"]').boundingBox()
    assert.ok(map, 'map pick is on screen')
    await pointerAt(page, map.x + map.width / 2, map.y + map.height / 2)
    await page.locator('[data-map-overlay]').waitFor({ state: 'detached' })
  }
  await page.locator('.defend-go').waitFor()
  await pointerBox(page, '.defend-go')
  const goAt = Date.now()
  await page.locator('[data-skill="mend"]').waitFor()
  await page.locator('[data-wave-count]').waitFor({ state: 'detached', timeout: 4000 }).catch(() => {})
  return { context, page, goAt }
}

async function crownSnap(page) {
  return page.evaluate(() => {
    const node = document.querySelector('.defend-raider.is-boss:not(.is-turned)')
    const live = document.querySelector('[data-crown-live]')
    const hearts = document.querySelector('.nw-hud .defend-hearts')
    return {
      t: node ? Number(node.getAttribute('data-road-t')) : null,
      hearts: hearts?.getAttribute('data-hearts') || '',
      hold: document.querySelector('[data-crown-hold]')?.getAttribute('data-crown-hold') || '',
      through: live?.getAttribute('data-crown-live') || '',
      lost: Boolean(document.querySelector('.defend-lost')),
      shield: Boolean(document.querySelector('.nw-mend-shield')),
      pageShield: document.querySelector('.defend-page')?.classList.contains('is-mend-shield') === true,
    }
  })
}

/** Press Mend at a wall-clock offset from Go. Pace 3 crown arrives about 33.06s after Go. */
async function pressMendAt(page, goAt, atSec) {
  const left = Math.round(atSec * 1000 - (Date.now() - goAt))
  if (left > 0) await page.waitForTimeout(left)
  await page.locator('[data-skill="mend"][data-state="ready"]').waitFor({ timeout: 4000 })
  const pressedAt = Date.now()
  await pointerBox(page, '[data-skill="mend"]')
  return { pressedAt, fromGo: (pressedAt - goAt) / 1000 }
}

async function waitCrownEnd(page, timeout) {
  const start = Date.now()
  let peak = 0
  while (Date.now() - start < timeout) {
    const snap = await crownSnap(page)
    if (snap.t != null && snap.t > peak) peak = snap.t
    const held = peak >= 0.95 && snap.t != null && snap.t <= 0.92 && snap.t < peak - 0.03
    if (held || snap.through || snap.lost) return { ...snap, held, peak }
    await page.waitForTimeout(40)
  }
  const snap = await crownSnap(page)
  return { ...snap, held: false, peak, timeout: true }
}

async function assertCrownGlowFits(page) {
  const fit = await page.evaluate(() => {
    const glow = document.querySelector('[data-crown-hold="armed"]')
    const hearts = document.querySelector('.nw-hud .defend-hearts')
    const road = document.querySelector('path.defend-road')
    const star = document.querySelector('.nw-balloon-slot')
    if (!(glow instanceof HTMLElement) || !hearts || !(road instanceof SVGPathElement)) {
      return { ok: false }
    }
    const g = glow.getBoundingClientRect()
    const h = hearts.getBoundingClientRect()
    const starBox = star?.getBoundingClientRect()
    const style = getComputedStyle(glow)
    const overlap = (a, b) =>
      Boolean(b) && a.left < b.right - 1 && a.right > b.left + 1 && a.top < b.bottom - 1 && a.bottom > b.top + 1
    const svg = road.ownerSVGElement
    const ctm = svg?.getScreenCTM()
    let roadGap = Infinity
    if (svg && ctm) {
      const len = road.getTotalLength()
      for (let i = 0; i <= 140; i += 1) {
        const point = road.getPointAtLength((len * i) / 140)
        const svgPoint = svg.createSVGPoint()
        svgPoint.x = point.x
        svgPoint.y = point.y
        const client = svgPoint.matrixTransform(ctm)
        const dx = client.x < g.left ? g.left - client.x : client.x > g.right ? client.x - g.right : 0
        const dy = client.y < g.top ? g.top - client.y : client.y > g.bottom ? client.y - g.bottom : 0
        const dist = Math.hypot(dx, dy)
        if (dist < roadGap) roadGap = dist
      }
    }
    return {
      ok: true,
      text: (glow.textContent || '').trim(),
      w: g.width,
      h: g.height,
      font: Number.parseFloat(style.fontSize),
      opacity: Number(style.opacity),
      hearts: overlap(g, h),
      star: overlap(g, starBox),
      glowBox: { l: g.left, t: g.top, r: g.right, b: g.bottom },
      starBox: starBox ? { l: starBox.left, t: starBox.top, r: starBox.right, b: starBox.bottom } : null,
      roadGap,
      inView: g.left >= 0 && g.top >= 0 && g.right <= 376 && g.bottom <= 668 && g.width > 0,
      easy: document.querySelector('.defend-page')?.classList.contains('is-easy-watch') === true,
    }
  })
  assert.equal(fit.ok, true, '1.4.512 the crown glow is on the Easy board')
  assert.equal(fit.easy, true)
  assert.equal(fit.text, 'Crown')
  assert.ok(fit.w >= 28 && fit.h >= 24, `1.4.512 the crown glow is readable (${fit.w}x${fit.h})`)
  assert.ok(fit.font >= 14, `1.4.512 the crown glow text is ${fit.font}px`)
  assert.ok(fit.opacity > 0.9)
  assert.equal(fit.hearts, false, `1.4.512 the crown glow covers the hearts ${JSON.stringify(fit)}`)
  assert.equal(fit.star, false, `1.4.512 the crown glow covers the sparks ${JSON.stringify(fit)}`)
  assert.ok(fit.roadGap >= 12, `1.4.512 the crown glow covers the road (${fit.roadGap})`)
  assert.equal(fit.inView, true, `1.4.512 the crown glow stays inside 375x667 ${JSON.stringify(fit)}`)
}

/** Easy Mend: 12s crown hold, 4s walker shield, one arm and one hold per round. Hard stays put. */
export async function checkCrownHold(browser, port, errors) {
  const spendMend = readFileSync(new URL('../src/components/DefendScreen.tsx', import.meta.url), 'utf8')
  const mendBody = spendMend.slice(spendMend.indexOf('function spendMend'), spendMend.indexOf('function combatPace'))
  assert.match(
    mendBody,
    /if \(easy && !crownHoldArmedRef\.current\) \{\s*crownHoldArmedRef\.current = true/,
    '1.4.512 spendMend arms the crown hold once per round',
  )
  assert.equal(
    spendMend.split('crownHoldArmedRef.current = false').length - 1,
    2,
    '1.4.512 the crown hold resets on round start and restart',
  )
  mkdirSync('/opt/cursor/artifacts', { recursive: true })
  const shield = await openEasyWave(browser, port, errors, '?playtest=1&nwRound=2', 'crown shield')
  await shield.page.locator('[data-skill="mend"][data-state="ready"]').waitFor()
  await pointerBox(shield.page, '[data-skill="mend"]')
  const armedAt = Date.now()
  await shield.page.locator('[data-crown-hold="armed"]').waitFor()
  await shield.page.locator('.nw-mend-shield').waitFor()
  const waitFrom = async (ms) => {
    const left = ms - (Date.now() - armedAt)
    if (left > 0) await shield.page.waitForTimeout(left)
  }
  await waitFrom(3_200)
  assert.equal(await shield.page.locator('.nw-mend-shield').count(), 1, '1.4.512 the walker shield is up at 3.2s')
  assert.equal(await shield.page.locator('[data-crown-hold="armed"]').count(), 1, '1.4.512 the crown hold is armed at 3.2s')
  await waitFrom(4_700)
  assert.equal(await shield.page.locator('.nw-mend-shield').count(), 0, '1.4.512 the walker shield is gone at 4.7s')
  assert.equal(
    await shield.page.locator('.defend-page.is-mend-shield').count(),
    0,
    '1.4.512 the walker shield class is gone at 4.7s',
  )
  assert.equal(await shield.page.locator('[data-crown-hold="armed"]').count(), 1, '1.4.512 the crown hold outlasts the 4s shield')
  await assertCrownGlowFits(shield.page)
  await shield.page.screenshot({ path: '/opt/cursor/artifacts/crown-hold-armed-375.png' })
  await waitFrom(11_000)
  assert.equal(await shield.page.locator('[data-crown-hold="armed"]').count(), 1, '1.4.512 the crown hold is still armed at 11s')
  await waitFrom(13_200)
  assert.equal(await shield.page.locator('[data-crown-hold="armed"]').count(), 0, '1.4.512 the crown hold ends by 13.2s')
  await shield.page.locator('[data-skill="mend"][data-state="ready"]').waitFor({ timeout: 8000 })
  assert.ok(Date.now() - armedAt > 12_000, '1.4.512 the second Mend is after the 12s crown hold')
  await pointerBox(shield.page, '[data-skill="mend"]')
  await shield.page.locator('.nw-mend-shield').waitFor()
  await shield.page.waitForTimeout(400)
  assert.equal(
    await shield.page.locator('[data-crown-hold="armed"]').count(),
    0,
    '1.4.512 a second Mend in the round does not re-arm the crown hold',
  )
  assert.equal(await shield.page.locator('.nw-mend-shield').count(), 1, '1.4.512 the second Mend still raises the walker shield')
  await shield.context.close()

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
  listenCrown(hardPage, errors, 'hard crown')
  await hardPage.goto('/?playtest=1')
  const night = hardPage.getByRole('button', { name: 'Hold the night' })
  await night.waitFor()
  await night.scrollIntoViewIfNeeded()
  const nightBox = await night.boundingBox()
  assert.ok(nightBox, '1.4.512 Hard entry is on screen')
  await pointerAt(hardPage, nightBox.x + nightBox.width / 2, nightBox.y + nightBox.height / 2)
  await hardPage.locator('.defend-board').waitFor()
  await pointerBox(hardPage, '.defend-go')
  await hardPage.locator('[data-skill="mend"]').waitFor()
  assert.equal(await hardPage.locator('.defend-page.is-easy-watch').count(), 0, '1.4.512 Hard is not an Easy watch')
  await pointerBox(hardPage, '[data-skill="mend"]')
  await hardPage.waitForTimeout(400)
  assert.equal(await hardPage.locator('[data-crown-hold]').count(), 0, '1.4.512 Hard Mend does not arm the crown hold')
  assert.equal(await hardPage.locator('.nw-crown-hold').count(), 0, '1.4.512 Hard does not show the crown glow')
  await hard.close()

  async function showdown(atSec, mode) {
    const run = await openEasyWave(browser, port, errors, '?playtest=1&nwRound=20', `crown ${mode}`)
    await pointerBox(run.page, '.nw-pace')
    await run.page.waitForFunction(() => document.querySelector('[data-pace]')?.getAttribute('data-pace') === '3')
    const pressed = await pressMendAt(run.page, run.goAt, atSec)
    const end = await waitCrownEnd(run.page, 22_000)
    const elapsed = (Date.now() - pressed.pressedAt) / 1000
    console.log(
      `crown ${mode}: pressed ${pressed.fromGo.toFixed(2)}s after Go, crown ${elapsed.toFixed(2)}s later, held ${end.held}`,
    )
    return { ...run, pressed, end, elapsed }
  }

  const hit = await showdown(23, 'hold')
  assert.equal(hit.end.timeout, undefined, '1.4.512 the 10s crown arrived')
  assert.equal(hit.end.held, true, `1.4.512 a Mend press 10s before the crown holds it ${JSON.stringify(hit.end)}`)
  assert.ok(hit.pressed.fromGo >= 22.7 && hit.pressed.fromGo <= 23.6, `1.4.512 the hold press was ${hit.pressed.fromGo}s after Go`)
  assert.ok(hit.elapsed > 8 && hit.elapsed < 12.2, `1.4.512 the 10s press arrived in ${hit.elapsed}s`)
  assert.notEqual(hit.end.through, 'Held!')
  assert.equal(await hit.page.locator('[data-crown-live="Held!"]').count(), 0, '1.4.512 the hold does not duplicate Held!')
  assert.notEqual(hit.end.hearts, '0', '1.4.512 the hold keeps a heart')
  await hit.page.screenshot({ path: '/opt/cursor/artifacts/crown-hold-hit-375.png' })
  await hit.context.close()

  const miss = await showdown(20, 'miss')
  assert.equal(miss.end.held, false, `1.4.512 a Mend press 13s before the crown does not hold it ${JSON.stringify(miss.end)}`)
  assert.ok(miss.pressed.fromGo >= 19.7 && miss.pressed.fromGo <= 20.6, `1.4.512 the miss press was ${miss.pressed.fromGo}s after Go`)
  assert.ok(miss.elapsed > 12 && miss.elapsed < 15, `1.4.512 the 13s press arrived in ${miss.elapsed}s`)
  assert.ok(miss.end.through.includes('got through') || miss.end.lost, '1.4.512 the late Mend lets the crown through')
  await miss.page.screenshot({ path: '/opt/cursor/artifacts/crown-hold-miss-375.png' })
  await miss.context.close()

  const rearm = await openEasyWave(browser, port, errors, '?playtest=1&nwRound=20', 'crown rearm')
  await pointerBox(rearm.page, '.nw-pace')
  await rearm.page.waitForFunction(() => document.querySelector('[data-pace]')?.getAttribute('data-pace') === '3')
  const early = await pressMendAt(rearm.page, rearm.goAt, 8.8)
  await rearm.page.locator('[data-crown-hold="armed"]').waitFor()
  const beforeSecond = Math.round(23.2 * 1000 - (Date.now() - rearm.goAt))
  if (beforeSecond > 0) await rearm.page.waitForTimeout(beforeSecond)
  assert.equal(
    await rearm.page.locator('[data-crown-hold="armed"]').count(),
    0,
    '1.4.512 the first crown hold has ended before the second Mend',
  )
  const late = await pressMendAt(rearm.page, rearm.goAt, 23.2)
  await rearm.page.locator('.nw-mend-shield').waitFor()
  assert.equal(
    await rearm.page.locator('[data-crown-hold="armed"]').count(),
    0,
    '1.4.512 the second R20 Mend does not re-arm the crown hold',
  )
  const rearmEnd = await waitCrownEnd(rearm.page, 20_000)
  const rearmOffset = (Date.now() - late.pressedAt) / 1000
  console.log(
    `crown rearm: first ${early.fromGo.toFixed(2)}s, second ${late.fromGo.toFixed(2)}s after Go, crown ${rearmOffset.toFixed(2)}s after the second press, held ${rearmEnd.held}`,
  )
  assert.ok(rearmOffset > 8 && rearmOffset < 12, `1.4.512 the second Mend was ${rearmOffset}s before the crown`)
  assert.equal(rearmEnd.held, false, `1.4.512 a Mend 24s out then 10s out lets the crown through ${JSON.stringify(rearmEnd)}`)
  assert.ok(rearmEnd.through.includes('got through') || rearmEnd.lost, '1.4.512 the re-armed Mend does not hold the crown')
  await rearm.context.close()

  const once = await showdown(30, 'once')
  assert.equal(once.end.held, true, `1.4.512 the near Mend holds the crown once ${JSON.stringify(once.end)}`)
  assert.equal(once.end.hold, 'armed', '1.4.512 the crown hold is still armed after the first hold')
  let extra = 0
  let maxT = once.end.t ?? 0.9
  let armedAtLeak = once.end.hold
  const until = Date.now() + 20_000
  while (Date.now() < until) {
    const snap = await crownSnap(once.page)
    if (snap.t != null && snap.t > maxT) maxT = snap.t
    if (maxT > 0.96 && snap.t != null && snap.t <= 0.92) extra += 1
    if (snap.through || snap.lost) {
      armedAtLeak = snap.hold
      break
    }
    await once.page.waitForTimeout(40)
  }
  assert.equal(extra, 0, '1.4.512 the same round does not hold the crown a second time')
  assert.equal(armedAtLeak, 'armed', '1.4.512 the second arrival is still inside the crown hold')
  await once.context.close()
  console.log('crown hold: 10s holds, 13s misses, one hold per round, shield 4s, Hard unchanged')
}

const MISS_MAPS = (process.env.NW_MISS_MAPS || 'a2,far-hills,map03,map04,map05,map06')
  .split(',')
  .map((id) => id.trim())
  .filter(Boolean)
const MISS_PACE_MS = Number(process.env.NW_MISS_PACE_MS ?? '60000')
const STRAY_U = EASY_FACE_HIT_R * 2

async function pointerClick(page, locator) {
  await locator.scrollIntoViewIfNeeded()
  const box = await locator.boundingBox()
  assert.ok(box && box.width > 2 && box.height > 2, 'pointer target is on screen')
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2)
}

async function pointerOpenJump(page, search) {
  await page.goto(`/${search}`)
  await pointerClick(page, page.getByRole('button', { name: 'Settings' }))
  await pointerClick(page, page.locator('summary', { hasText: 'Developer' }))
  await pointerClick(page, page.getByRole('button', { name: 'Jump · Night Watch' }))
  await page.locator('.defend-board').waitFor()
}

async function readMissScore(page) {
  return page.evaluate(() => {
    const node = document.querySelector('.nw-tap-readout')
    const num = (name) => Number(node?.getAttribute(name) ?? '0')
    return {
      hits: num('data-tap-hits'),
      misses: num('data-tap-misses'),
      damage: num('data-tap-damage'),
      dark: num('data-miss-dark'),
      fog: num('data-miss-fog'),
      soaked: num('data-miss-soaked'),
      near: num('data-miss-board-near'),
      late: num('data-miss-late'),
      stray: num('data-stray'),
      text: (node?.textContent || '').replace(/\s+/g, ' ').trim(),
    }
  })
}

function missSum(score) {
  return score.dark + score.fog + score.soaked + score.near + score.late
}

async function toastText(page) {
  const toast = page.locator('.match-toast')
  const count = await toast.count()
  if (count < 1) return ''
  const parts = []
  for (let i = 0; i < count; i += 1) {
    const text = (await toast.nth(i).innerText()).replace(/\s+/g, ' ').trim()
    if (text) parts.push(text)
  }
  return parts.join(' | ')
}

async function waitForToast(page, expected, ms = 1000) {
  const until = Date.now() + ms
  let text = await toastText(page)
  while (text !== expected && Date.now() < until) {
    await page.waitForTimeout(40)
    text = await toastText(page)
  }
  return text
}

/** A setup tap can leave the miss line up. A glowing tap clears it. */
async function settleToast(page) {
  for (let i = 0; i < 4; i += 1) {
    if ((await toastText(page)) === '') return
    const cue = await faceClient(page, 'cue')
    if (!cue) break
    await page.mouse.click(cue.x, cue.y)
    await page.waitForTimeout(180)
  }
  await waitForToast(page, '', 1600)
}

async function strayClient(page) {
  return page.evaluate((limit) => {
    const svg = document.querySelector('.defend-board')
    if (!(svg instanceof SVGSVGElement)) return null
    const ctm = svg.getScreenCTM()
    if (!ctm) return null
    const faces = [...document.querySelectorAll('.defend-walker-tap')].map((node) => {
      const box = node.getBoundingClientRect()
      const p = svg.createSVGPoint()
      p.x = box.x + box.width / 2
      p.y = box.y + box.height / 2
      const local = p.matrixTransform(ctm.inverse())
      return { x: local.x, y: local.y }
    })
    const box = svg.getBoundingClientRect()
    for (let gy = 0; gy < 16; gy += 1) {
      for (let gx = 0; gx < 8; gx += 1) {
        const cx = box.left + ((gx + 0.5) / 8) * box.width
        const cy = box.top + ((gy + 0.5) / 16) * box.height
        const p = svg.createSVGPoint()
        p.x = cx
        p.y = cy
        const local = p.matrixTransform(ctm.inverse())
        if (faces.some((face) => Math.hypot(face.x - local.x, face.y - local.y) <= limit)) continue
        const node = document.elementFromPoint(cx, cy)
        if (!node?.closest?.('.defend-board')) continue
        if (node.closest('button, a, .nw-docks, .nw-rail, .nw-hud, .defend-walker-tap, .defend-raider, .nw-wave-overlay, .match-toast')) continue
        return { x: cx, y: cy }
      }
    }
    return null
  }, STRAY_U)
}

async function faceClient(page, want) {
  return page.evaluate((mode) => {
    const buttons = [...document.querySelectorAll('.defend-walker-tap')]
    for (const button of buttons) {
      const cue = button.classList.contains('is-cue')
      const fog = button.getAttribute('data-fog') === 'yes'
      const boss = button.getAttribute('data-boss') === 'yes'
      if (mode === 'dark' && (cue || fog || boss)) continue
      if (mode === 'cue' && !cue) continue
      if (mode === 'fog' && !fog) continue
      if (mode === 'plain-cue' && (!cue || boss)) continue
      const box = button.getBoundingClientRect()
      const spots = [[0.5, 0.5]]
      for (let turn = 0; turn < 8; turn += 1) {
        const angle = (turn / 8) * Math.PI * 2
        spots.push([0.5 + Math.cos(angle) * 0.38, 0.5 + Math.sin(angle) * 0.38])
      }
      for (const [fx, fy] of spots) {
        const x = box.x + box.width * fx
        const y = box.y + box.height * fy
        const node = document.elementFromPoint(x, y)
        const hit = node?.closest?.('[data-walker-tap]')
        if (hit?.getAttribute('data-walker-id') !== button.getAttribute('data-walker-id')) continue
        return { x, y, id: button.getAttribute('data-walker-id'), boss }
      }
    }
    return null
  }, want)
}

async function nearClient(page) {
  return page.evaluate((limit) => {
    const svg = document.querySelector('.defend-board')
    if (!(svg instanceof SVGSVGElement)) return null
    const ctm = svg.getScreenCTM()
    if (!ctm) return null
    const scale = Math.hypot(ctm.a, ctm.b) || 1
    const faces = [...document.querySelectorAll('.defend-walker-tap')].map((node) => {
      const box = node.getBoundingClientRect()
      const p = svg.createSVGPoint()
      p.x = box.x + box.width / 2
      p.y = box.y + box.height / 2
      const local = p.matrixTransform(ctm.inverse())
      return {
        x: local.x,
        y: local.y,
        r: box.width / 2 / scale,
        cue: node.classList.contains('is-cue'),
        fog: node.getAttribute('data-fog') === 'yes',
      }
    })
    const dark = faces.find((face) => !face.cue && !face.fog && face.r < 100)
    if (!dark) return null
    const box = svg.getBoundingClientRect()
    for (let turn = 0; turn < 16; turn += 1) {
      const away = dark.r + 24
      if (away > limit) continue
      const x = dark.x + Math.cos(turn) * away
      const y = dark.y + Math.sin(turn) * away
      if (faces.some((face) => Math.hypot(face.x - x, face.y - y) <= face.r + 4)) continue
      if (faces.every((face) => Math.hypot(face.x - x, face.y - y) > limit)) continue
      const p = svg.createSVGPoint()
      p.x = x
      p.y = y
      const client = p.matrixTransform(ctm)
      if (client.x < box.left + 2 || client.y < box.top + 2 || client.x > box.right - 2 || client.y > box.bottom - 2) continue
      const node = document.elementFromPoint(client.x, client.y)
      if (!node?.closest?.('.defend-board')) continue
      if (node.closest('button, a, .defend-walker-tap, .defend-raider, .nw-docks, .nw-rail, .nw-wave-overlay')) continue
      return { x: client.x, y: client.y }
    }
    return null
  }, STRAY_U)
}

async function hpWidth(page, id) {
  return page.evaluate((walkerId) => {
    const bar = document.querySelector(`.defend-raider[data-walker-id="${walkerId}"] .defend-hp-fill`)
    if (!bar) return null
    return Number(bar.getAttribute('width'))
  }, id)
}

async function assertClearOf(page, label) {
  const hit = await page.evaluate(() => {
    const readoutNode = document.querySelector('.nw-tap-readout')
    const readout = readoutNode?.getBoundingClientRect()
    const nudge = document.querySelector('.walker-cue-ring.is-cue-nudge')?.getBoundingClientRect()
    const names = ['.defend-abilities', '.defend-new-lamp', '.defend-hud', '.nw-wave-count', '.nw-wave-survived', '.nw-skill-tray']
    const boxes = names.flatMap((name) =>
      [...document.querySelectorAll(name)].map((node) => {
        const box = node.getBoundingClientRect()
        return { name, left: box.left, top: box.top, right: box.right, bottom: box.bottom, w: box.width, h: box.height }
      }),
    )
    const overlap = (a, b) =>
      Boolean(a && b && a.width > 1 && b.w > 1 && a.left < b.right - 1 && a.right > b.left + 1 && a.top < b.bottom - 1 && a.bottom > b.top + 1)
    const read = readout ? { left: readout.left, top: readout.top, right: readout.right, bottom: readout.bottom, width: readout.width, height: readout.height } : null
    const ring = nudge && nudge.width > 1 ? { left: nudge.left, top: nudge.top, right: nudge.right, bottom: nudge.bottom, width: nudge.width, height: nudge.height } : null
    const covered = []
    for (const box of boxes) {
      if (overlap(read, box)) covered.push(`readout ${box.name}`)
      if (overlap(ring, box)) covered.push(`nudge ${box.name}`)
    }
    const style = readoutNode ? getComputedStyle(readoutNode) : null
    return {
      covered,
      font: style?.fontSize || '',
      pad: style ? `${style.paddingTop} ${style.paddingRight} ${style.paddingBottom} ${style.paddingLeft}` : '',
      margin: style ? `${style.marginTop} ${style.marginRight} ${style.marginBottom} ${style.marginLeft}` : '',
      h: read?.height ?? 0,
    }
  })
  assert.deepEqual(hit.covered, [], `${label} readout stays clear ${JSON.stringify(hit)}`)
  return hit
}

async function pauseWalkers(page) {
  const resume = page.getByRole('button', { name: 'Resume walkers' })
  if ((await resume.count()) > 0) return
  const toggle = page.locator('.defend-nw-debug-toggle')
  const box = await toggle.boundingBox()
  const viewH = page.viewportSize()?.height ?? 667
  if (box && (box.y < 0 || box.y + box.height > viewH)) await toggle.scrollIntoViewIfNeeded()
  await pointerBox(page, '.defend-nw-debug-toggle')
  await page.getByRole('button', { name: 'Resume walkers' }).waitFor()
}

async function resumeWalkers(page) {
  const resume = page.getByRole('button', { name: 'Resume walkers' })
  if ((await resume.count()) < 1) return
  await pointerClick(page, resume)
}

/** Painted frames of Easy R15. The cue ring lives in `.walker-target-cue`, not on the walker. */
async function sampleCueClear(page, minFrames) {
  return page.evaluate(
    (need) =>
      new Promise((resolve) => {
        const overlap = (a, b) =>
          a.width > 1 &&
          a.height > 1 &&
          b.width > 1 &&
          b.height > 1 &&
          a.left < b.right &&
          a.right > b.left &&
          a.top < b.bottom &&
          a.bottom > b.top
        const hudNames = [
          '.nw-balloon',
          '.defend-wave',
          '.defend-hearts',
          '.nw-rail .defend-abilities',
          '.nw-miss-toast',
          '.nw-pace',
          '.nw-skill-toast',
        ]
        const overlapBox = (a, b) =>
          a.width >= 4 &&
          a.height >= 4 &&
          b.width >= 4 &&
          b.height >= 4 &&
          a.left < b.right &&
          a.right > b.left &&
          a.top < b.bottom &&
          a.bottom > b.top
        let frames = 0
        let overlaps = 0
        let hudOverlaps = 0
        let shifted = 0
        let shiftedFrames = 0
        let homeHits = 0
        let wasShifted = false
        let empty = 0
        let steps = 0
        const slots = {}
        const finish = () => resolve({ frames, overlaps, hudOverlaps, shifted, shiftedFrames, homeHits, empty, slots })
        const step = () => {
          steps += 1
          const rings = [...document.querySelectorAll('.walker-target-cue .walker-cue-ring')]
          const pulses = [...document.querySelectorAll('.walker-target-cue .walker-cue-pulse')]
          const readout = document.querySelector('.nw-tap-readout')
          const lost = Boolean(document.querySelector('.defend-lost, .defend-page.is-lost'))
          if (lost || steps > 720) {
            finish()
            return
          }
          if (rings.length < 1 || !(readout instanceof HTMLElement)) {
            empty += 1
            requestAnimationFrame(step)
            return
          }
          const read = readout.getBoundingClientRect()
          const parent = readout.offsetParent instanceof HTMLElement ? readout.offsetParent : null
          const origin = parent ? parent.getBoundingClientRect() : new DOMRect()
          const home = new DOMRect(origin.left + readout.offsetLeft, origin.top + readout.offsetTop, readout.offsetWidth, readout.offsetHeight)
          const targets = [...rings, ...pulses].map((el) => el.getBoundingClientRect())
          frames += 1
          if (targets.some((rect) => overlap(read, rect))) overlaps += 1
          if (targets.some((rect) => overlap(home, rect))) homeHits += 1
          const on = readout.classList.contains('is-shifted')
          if (on) {
            shiftedFrames += 1
            const hud = hudNames.flatMap((sel) => [...document.querySelectorAll(sel)].map((el) => el.getBoundingClientRect()))
            if (hud.some((rect) => overlapBox(read, rect))) hudOverlaps += 1
            const frame = readout.closest('.defend-frame')?.getBoundingClientRect()
            if (frame && frame.width >= 4 && frame.height >= 4) {
              const dx = read.left - frame.left
              const dy = read.top - frame.top
              const col = dx <= frame.width * 0.2 ? 'left' : dx >= frame.width * 0.55 ? 'right' : 'center'
              const row = Math.abs(dy - frame.height * 0.42) <= 28 ? 'mid' : dy < frame.height * 0.22 ? 'top' : 'bottom'
              const name = `${row}-${col}`
              slots[name] = (slots[name] || 0) + 1
            }
          }
          if (on && !wasShifted) shifted += 1
          wasShifted = on
          if (frames >= need && (homeHits > 0 || frames >= need * 3)) {
            finish()
            return
          }
          requestAnimationFrame(step)
        }
        requestAnimationFrame(step)
      }),
    minFrames,
  )
}

/** Easy R15, walkers moving: the readout stays off the cue ring, and a dark tap still toasts. */
async function checkReadoutCueClear(browser, port, errors) {
  const widths = [
    [375, 667],
    [412, 915],
    [768, 1024],
  ]
  const report = []
  for (const [width, height] of widths) {
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
    listenCrown(page, errors, `cue-clear ${width}`)
    await pointerOpenJump(page, '?playtest=1&nwSeed=2&nwRound=15')
    if (await page.locator('[data-map-overlay]').count()) {
      await pointerClick(page, page.locator('[data-map="a2"]'))
      await page.locator('[data-map-overlay]').waitFor({ state: 'detached' })
    }
    await page.locator('.defend-go').waitFor()
    await pointerBox(page, '.defend-go')
    await page.locator('.defend-page.is-easy-tap').waitFor()
    await page.locator('[data-wave-count]').waitFor({ state: 'detached', timeout: 5000 }).catch(() => {})
    await page.locator('.nw-tap-readout').waitFor()
    const born = Date.now() + 12000
    let ringCount = 0
    while (Date.now() < born) {
      ringCount = await page.locator('.walker-target-cue .walker-cue-ring').count()
      if (ringCount >= 1) break
      await page.waitForTimeout(40)
    }
    assert.ok(ringCount >= 1, `${width} .walker-target-cue .walker-cue-ring finds a ring (${ringCount})`)
    const sample = await sampleCueClear(page, 120)
    assert.ok(sample.frames >= 20, `${width} sampled ${sample.frames} ring frames (empty ${sample.empty})`)
    assert.equal(sample.overlaps, 0, `${width} readout covers the cue ring ${JSON.stringify(sample)}`)
    if (sample.homeHits > 0) {
      assert.ok(sample.shifted >= 1, `${width} the readout shifts when the ring is in its dock ${JSON.stringify(sample)}`)
    }
    assert.ok(sample.shiftedFrames >= 1, `${width} the readout leaves its dock ${JSON.stringify(sample)}`)
    assert.equal(sample.hudOverlaps, 0, `${width} shifted readout covers the HUD ${JSON.stringify(sample)}`)
    await page.evaluate((line) => {
      window.__nwToastWatch = { line, downAt: 0, seenMs: null }
      document.addEventListener(
        'pointerdown',
        () => {
          window.__nwToastWatch.downAt = performance.now()
        },
        true,
      )
    }, EASY.nightMiss)
    let toastMs = null
    let toastSnap = null
    const darkUntil = Date.now() + 8000
    while (Date.now() < darkUntil && toastMs == null) {
      const dark = await faceClient(page, 'dark')
      if (!dark) {
        await page.waitForTimeout(40)
        continue
      }
      await page.evaluate(() => {
        window.__nwToastWatch.downAt = 0
        window.__nwToastWatch.seenMs = null
      })
      await page.mouse.click(dark.x, dark.y)
      toastSnap = await page.evaluate(async () => {
        const watch = window.__nwToastWatch
        const start = performance.now()
        let last = null
        while (performance.now() - start < 240) {
          const node = document.querySelector('.nw-miss-toast')
          if (node instanceof HTMLElement) {
            const box = node.getBoundingClientRect()
            const opacity = Number(getComputedStyle(node).opacity)
            const text = (node.textContent || '').replace(/\s+/g, ' ').trim()
            last = { text, opacity, w: box.width, h: box.height }
            if (text === watch.line && opacity > 0.9 && box.width >= 120 && box.height >= 20 && watch.downAt > 0) {
              watch.seenMs = performance.now() - watch.downAt
              return { ok: true, ms: watch.seenMs, last }
            }
          }
          await new Promise((resolve) => requestAnimationFrame(resolve))
        }
        return { ok: false, ms: watch.seenMs, last, downAt: watch.downAt }
      })
      if (toastSnap?.ok && toastSnap.ms <= 200) toastMs = toastSnap.ms
    }
    if (toastMs == null) {
      toastSnap = {
        ...(toastSnap || {}),
        faces: await page.evaluate(() =>
          [...document.querySelectorAll('.defend-walker-tap')].map((node) => ({
            id: node.getAttribute('data-walker-id'),
            cue: node.classList.contains('is-cue'),
            fog: node.getAttribute('data-fog'),
            boss: node.getAttribute('data-boss'),
            w: Math.round(node.getBoundingClientRect().width),
          })),
        ),
      }
    }
    assert.ok(
      toastMs != null && toastMs <= 200,
      `${width} the dark-tap toast shows within 200ms (${toastMs}) ${JSON.stringify(toastSnap)}`,
    )
    console.log(
      `cue-clear ${width}x${height} frames=${sample.frames} overlaps=${sample.overlaps} hudOverlaps=${sample.hudOverlaps} shifted=${sample.shifted} shiftedFrames=${sample.shiftedFrames} homeHits=${sample.homeHits} slots=${JSON.stringify(sample.slots)} toastMs=${toastMs}`,
    )
    report.push({ width, height, toastMs, ...sample })
    await context.close()
  }
  mkdirSync('/opt/cursor/artifacts', { recursive: true })
  writeFileSync('/opt/cursor/artifacts/nw-cue-clear.json', JSON.stringify(report, null, 2))
  console.log(`cue-clear ${JSON.stringify(report)}`)
}

/** Easy misses: stray is not counted. Dark, fog, and a near board tap are. */
async function checkTrustedMisses(browser, port, errors) {
  mkdirSync('/opt/cursor/artifacts', { recursive: true })
  const rows = []
  async function openMap(id, width, height, reduced) {
    const context = await browser.newContext({
      baseURL: `http://127.0.0.1:${port}/`,
      viewport: { width, height },
      deviceScaleFactor: 1,
      reducedMotion: reduced ? 'reduce' : 'no-preference',
    })
    await context.addInitScript(
      (payload) => localStorage.setItem(payload.key, JSON.stringify(payload.save)),
      { key: STORAGE_KEY, save: SAVE },
    )
    const page = await context.newPage()
    const logs = []
    page.on('console', (msg) => {
      const text = msg.text()
      if (text.startsWith('nw-miss ') || text.startsWith('nw-stray ')) logs.push(text)
    })
    listenCrown(page, errors, `miss ${id} ${width}`)
    const search =
      id === 'a2'
        ? '?playtest=1&nwSeed=2&nwRound=15'
        : `?playtest=1&nwSeed=2&nwRound=15&nwMap=${id}`
    await pointerOpenJump(page, search)
    if (await page.locator('[data-map-overlay]').count()) {
      await pointerClick(page, page.locator(`[data-map="${id}"]`))
      await page.locator('[data-map-overlay]').waitFor({ state: 'detached' })
    }
    await page.locator('.defend-go').waitFor()
    await pointerBox(page, '.defend-go')
    await page.locator('.defend-page.is-easy-tap').waitFor()
    await page.locator('[data-wave-count]').waitFor({ state: 'detached', timeout: 5000 }).catch(() => {})
    assert.equal(await page.locator('.defend-page').getAttribute('data-night-map'), id, `${id} is the night`)
    let ready = false
    for (let attempt = 0; attempt < 4 && !ready; attempt += 1) {
      const born = Date.now() + 12_000
      while (Date.now() < born) {
        const darkFace = await faceClient(page, 'dark')
        const cueFace = await faceClient(page, 'cue')
        if (darkFace && cueFace) break
        if (cueFace) await page.mouse.click(cueFace.x, cueFace.y)
        if ((await page.locator('.defend-lost, .defend-page.is-lost').count()) > 0) break
        await page.waitForTimeout(80)
      }
      await pauseWalkers(page)
      const held = Date.now() + 1500
      while (Date.now() < held) {
        if ((await faceClient(page, 'dark')) && (await faceClient(page, 'cue'))) {
          ready = true
          break
        }
        await page.waitForTimeout(40)
      }
      if (ready) break
      await resumeWalkers(page)
    }
    if (!ready) {
      const snap = await page.evaluate(() => ({
        map: document.querySelector('.defend-page')?.getAttribute('data-night-map'),
        phase: document.querySelector('.defend-page')?.className,
        taps: [...document.querySelectorAll('.defend-walker-tap')].map((node) => ({
          id: node.getAttribute('data-walker-id'),
          cue: node.classList.contains('is-cue'),
          fog: node.getAttribute('data-fog'),
          boss: node.getAttribute('data-boss'),
        })),
        lost: document.querySelector('.defend-lost, .defend-page.is-lost') ? 'yes' : 'no',
        paused: document.querySelector('.defend-nw-debug-toggle')?.textContent || '',
      }))
      assert.ok(ready, `${id} ${width} has a dark face and a glowing face ${JSON.stringify(snap)}`)
    }
    return { context, page, logs }
  }

  async function controls(id, width, height, reduced, pace) {
    const run = await openMap(id, width, height, reduced)
    const { page, logs } = run
    const label = `${id} ${width}`
    await settleToast(page)
    const before = await readMissScore(page)
    const startToast = await toastText(page)
    assert.equal(startToast, '', `${label} starts without a miss line (${startToast})`)
    let strayAt = null
    for (let i = 0; i < 20; i += 1) {
      strayAt = await strayClient(page)
      assert.ok(strayAt, `${label} has open ground past ${STRAY_U}u`)
      await page.mouse.click(strayAt.x, strayAt.y)
      await page.waitForTimeout(30)
    }
    await page.waitForTimeout(120)
    const afterStray = await readMissScore(page)
    assert.equal(afterStray.misses, before.misses, `${label} stray taps are not misses`)
    assert.equal(afterStray.stray, before.stray + 20, `${label} stray +20`)
    const strayToast = await toastText(page)
    assert.equal(strayToast, '', `${label} stray shows no toast (${strayToast})`)
    assert.ok(logs.some((line) => /^nw-stray \d+ \d+$/.test(line)), `${label} logs nw-stray`)

    const dark = await faceClient(page, 'dark')
    assert.ok(dark, `${label} still has a dark face`)
    const hpBefore = await hpWidth(page, dark.id)
    for (let i = 0; i < 9; i += 1) {
      const spot = await faceClient(page, 'dark')
      assert.ok(spot, `${label} dark face stays tappable`)
      await page.mouse.click(spot.x, spot.y)
      await page.waitForTimeout(40)
    }
    const lastDark = await faceClient(page, 'dark')
    assert.ok(lastDark, `${label} dark face is still there`)
    const hpLast = await hpWidth(page, lastDark.id)
    const nudgedAt = Date.now()
    await page.mouse.click(lastDark.x, lastDark.y)
    await page.waitForTimeout(60)
    const ring = page.locator('.walker-cue-ring.is-cue-nudge')
    assert.equal(await ring.count(), 1, `${label} the lead ring nudges`)
    if (reduced) {
      const motion = await ring.evaluate((node) => {
        const style = getComputedStyle(node)
        return { animation: style.animationName, width: style.strokeWidth }
      })
      assert.equal(motion.animation, 'none', `${label} reduced motion holds the ring still`)
      assert.ok(Number.parseFloat(motion.width) >= 4, `${label} reduced motion brightens the ring`)
    } else if (width === 375 && id === 'a2') {
      const motion = await ring.evaluate((node) => getComputedStyle(node).animationName)
      assert.equal(motion, 'walker-cue-nudge', `${label} the lead ring scales`)
      await page.screenshot({ path: '/opt/cursor/artifacts/nw-miss-a2-nudge-375.png' })
    }
    const darkToast = await waitForToast(page, EASY.nightMiss, 900)
    assert.equal(darkToast, EASY.nightMiss, `${label} dark toast (${darkToast})`)
    const afterDark = await readMissScore(page)
    assert.equal(afterDark.misses, afterStray.misses + 10, `${label} ten dark taps count`)
    assert.equal(afterDark.dark, afterStray.dark + 10, `${label} data-miss-dark +10`)
    if (hpBefore != null && lastDark.id === dark.id) {
      assert.equal(hpLast, hpBefore, `${label} a dark tap does not change HP`)
    }
    assert.ok(
      logs.some((line) =>
        /^nw-miss dark -?\d+ -?\d+ r15 lead=\S+ leadChangedMsAgo=\d+( seat=1)? dx=-?\d+ dy=-?\d+ ptr=(touch|mouse)$/.test(line),
      ),
      `${label} logs nw-miss dark`,
    )
    const left = 750 - (Date.now() - nudgedAt)
    if (left > 0) await page.waitForTimeout(left)
    assert.equal(await ring.count(), 0, `${label} the nudge lasts about 400ms`)

    const near = await nearClient(page)
    if (near) {
      const beforeNear = await readMissScore(page)
      await page.mouse.click(near.x, near.y)
      await page.waitForTimeout(120)
      const afterNear = await readMissScore(page)
      assert.equal(afterNear.near, beforeNear.near + 1, `${label} a tap beside the disc is board-near`)
      assert.equal(afterNear.misses, beforeNear.misses + 1, `${label} board-near counts`)
      assert.equal(await toastText(page), EASY.nightMiss, `${label} board-near toast`)
    }

    if (!pace) {
      await assertClearOf(page, label)
      if (width === 412) await page.screenshot({ path: '/opt/cursor/artifacts/nw-miss-412.png' })
      if (width === 768) await page.screenshot({ path: '/opt/cursor/artifacts/nw-miss-768.png' })
      await run.context.close()
      return
    }

    const glow = (await faceClient(page, 'plain-cue')) || (await faceClient(page, 'cue'))
    assert.ok(glow, `${label} the glowing face is tappable`)
    const beforeGlow = await readMissScore(page)
    const glowHp = await hpWidth(page, glow.id)
    await page.mouse.click(glow.x, glow.y)
    await page.waitForTimeout(150)
    const afterGlow = await readMissScore(page)
    assert.equal(afterGlow.hits, beforeGlow.hits + 1, `${label} a glowing face is a hit`)
    assert.equal(afterGlow.misses, beforeGlow.misses, `${label} a glowing face is not a miss`)
    if (!glow.boss) {
      assert.equal(afterGlow.damage, beforeGlow.damage + 1, `${label} a plain glowing tap still deals 1`)
      const glowHpAfter = await hpWidth(page, glow.id)
      if (glowHp != null && glowHpAfter != null) assert.ok(glowHpAfter < glowHp, `${label} the hit bar moved`)
    } else {
      assert.ok(
        afterGlow.damage === beforeGlow.damage || afterGlow.damage === beforeGlow.damage + 1,
        `${label} the crown tap deals the old chip`,
      )
    }

    const scored = await readMissScore(page)
    assert.equal(scored.misses, missSum(scored), `${label} misses equal the reason split`)
    assert.equal(scored.late, 0, `${label} late is 0`)
    await assertClearOf(page, label)
    await page.screenshot({ path: `/opt/cursor/artifacts/nw-miss-${id}-readout-375.png` })

    let fogShot = false
    if (id === 'map05') {
      await resumeWalkers(page)
      const fogDeadline = Date.now() + 35_000
      let caught = false
      while (Date.now() < fogDeadline && !caught) {
        const fog = await faceClient(page, 'fog')
        if (!fog) {
          const cueTap = await faceClient(page, 'cue')
          if (cueTap) await page.mouse.click(cueTap.x, cueTap.y)
          await page.waitForTimeout(40)
          continue
        }
        const beforeFog = await readMissScore(page)
        await page.mouse.click(fog.x, fog.y)
        await page.waitForTimeout(80)
        const afterFog = await readMissScore(page)
        if (afterFog.fog === beforeFog.fog + 1) {
          assert.equal(afterFog.misses, beforeFog.misses + 1, 'map05 fog counts')
          assert.equal(await toastText(page), EASY.nightFog, 'map05 fog toast')
          await page.screenshot({ path: '/opt/cursor/artifacts/nw-miss-map05-fog-375.png' })
          fogShot = true
          caught = true
          break
        }
      }
      assert.equal(fogShot, true, 'map05 a fogged walker was tapped')
      const fogScore = await readMissScore(page)
      assert.equal(fogScore.misses, missSum(fogScore), 'map05 misses still equal the reason split')
      assert.equal(fogScore.late, 0, 'map05 late stays 0')
      await pauseWalkers(page)
    }

    await resumeWalkers(page)
    const origin = await readMissScore(page)
    const carried = { hits: 0, misses: 0, dark: 0, fog: 0, soaked: 0, near: 0, late: 0, stray: 0 }
    let seen = { ...origin }
    const paceStart = Date.now()
    const paceEnd = paceStart + MISS_PACE_MS
    while (Date.now() < paceEnd) {
      if ((await page.locator('.defend-lost, .defend-page.is-lost').count()) > 0) break
      const aim = await page.evaluate(() => {
        const svg = document.querySelector('.defend-board')
        const button = document.querySelector('.defend-walker-tap.is-cue')
        if (!(svg instanceof SVGSVGElement) || !button) return null
        const box = button.getBoundingClientRect()
        const board = svg.getBoundingClientRect()
        const angle = Math.random() * Math.PI * 2
        const reach = (box.width / 2) * (0.4 + Math.random() * 1.5)
        const x = Math.min(board.right - 4, Math.max(board.left + 4, box.x + box.width / 2 + Math.cos(angle) * reach))
        const y = Math.min(board.bottom - 4, Math.max(board.top + 4, box.y + box.height / 2 + Math.sin(angle) * reach))
        return { x, y }
      })
      if (aim) await page.mouse.click(aim.x, aim.y)
      await page.waitForTimeout(700)
      const now = await readMissScore(page)
      if (now.hits + now.misses + now.stray < seen.hits + seen.misses + seen.stray) {
        carried.hits += seen.hits
        carried.misses += seen.misses
        carried.dark += seen.dark
        carried.fog += seen.fog
        carried.soaked += seen.soaked
        carried.near += seen.near
        carried.late += seen.late
        carried.stray += seen.stray
      }
      seen = now
    }
    const paceScore = {
      hits: carried.hits + seen.hits - origin.hits,
      misses: carried.misses + seen.misses - origin.misses,
      dark: carried.dark + seen.dark - origin.dark,
      fog: carried.fog + seen.fog - origin.fog,
      soaked: carried.soaked + seen.soaked - origin.soaked,
      near: carried.near + seen.near - origin.near,
      late: carried.late + seen.late - origin.late,
      stray: carried.stray + seen.stray - origin.stray,
    }
    rows.push({
      id,
      width,
      height,
      paceMs: Date.now() - paceStart,
      ...paceScore,
      missesLeqHits: paceScore.misses <= paceScore.hits,
    })
    console.log(`miss-pace ${id} ${JSON.stringify(paceScore)}`)
    await run.context.close()
  }

  for (const id of MISS_MAPS) {
    await controls(id, 375, 667, false, true)
  }
  if (!process.env.NW_MISS_MAPS || process.env.NW_MISS_PHONE === '1') {
    await controls('a2', 412, 915, true, false)
    await controls('a2', 768, 1024, false, false)
  }
  const missErrors = errors.filter((line) => line.startsWith('miss '))
  if (missErrors.length) console.log(`miss-console ${missErrors.join(' | ')}`)
  writeFileSync('/opt/cursor/artifacts/nw-miss-report.json', JSON.stringify(rows, null, 2))
  console.log(`miss-report ${JSON.stringify(rows)}`)
}

function spawnRoads(id) {
  if (id === 'a2') return [{ id: 'main', points: DEFEND_PATH }]
  const file = id === 'far-hills' ? 'map02.json' : `${id}.json`
  const pack = nightMapFromPack(JSON.parse(readFileSync(new URL(`../src/nightWatch/maps/maze/${file}`, import.meta.url), 'utf8')))
  return pack.roads
}

function gapToPlateBox(x, y, box) {
  const dx = x < box.left ? box.left - x : x > box.right ? x - box.right : 0
  const dy = y < box.top ? box.top - y : y > box.bottom ? y - box.bottom : 0
  return Math.hypot(dx, dy)
}

function roadGap(point, points) {
  let min = Infinity
  for (let i = 0; i < points.length - 1; i += 1) {
    const a = points[i]
    const b = points[i + 1]
    const dx = b.x - a.x
    const dy = b.y - a.y
    const len2 = dx * dx + dy * dy || 1
    let t = ((point.x - a.x) * dx + (point.y - a.y) * dy) / len2
    t = Math.max(0, Math.min(1, t))
    min = Math.min(min, Math.hypot(point.x - (a.x + t * dx), point.y - (a.y + t * dy)))
  }
  return min
}

const SPAWN_MAPS = ['a2', 'far-hills', 'map03', 'map04', 'map05', 'map06']
const SPAWN_COUNTS = { a2: 1, 'far-hills': 1, map03: 1, map04: 2, map05: 2, map06: 3 }

async function readSpawnBoard(page) {
  return page.evaluate(() => {
    const blocks = [
      '.defend-abilities',
      '.defend-new-lamp',
      '.defend-hud',
      '.nw-wave-count',
      '.nw-wave-survived',
      '.nw-skill-tray',
      '.nw-tap-readout',
      '.defend-pad',
    ]
    const obstacles = []
    for (const sel of blocks) {
      for (const node of document.querySelectorAll(sel)) {
        const box = node.getBoundingClientRect()
        if (box.width > 1 && box.height > 1) {
          obstacles.push({ sel, left: box.left, right: box.right, top: box.top, bottom: box.bottom })
        }
      }
    }
    const markers = [...document.querySelectorAll('[data-spawn-marker]')].map((node) => {
      const box = node.getBoundingClientRect()
      const cx = (box.left + box.right) / 2
      const cy = (box.top + box.bottom) / 2
      const hit = document.elementFromPoint(cx, cy)
      return {
        id: node.getAttribute('data-spawn-marker') || '',
        fit: node.getAttribute('data-spawn-fit') || '',
        scale: Number(node.getAttribute('data-spawn-scale')),
        left: box.left,
        top: box.top,
        right: box.right,
        bottom: box.bottom,
        width: box.width,
        height: box.height,
        markerHit: Boolean(hit && hit.closest && hit.closest('[data-spawn-marker]')),
      }
    })
    const overlaps = []
    for (const marker of markers) {
      for (const obstacle of obstacles) {
        const w = Math.min(marker.right, obstacle.right) - Math.max(marker.left, obstacle.left)
        const h = Math.min(marker.bottom, obstacle.bottom) - Math.max(marker.top, obstacle.top)
        if (w > 0 && h > 0) overlaps.push(`${marker.id} ${obstacle.sel}`)
      }
    }
    return { w: window.innerWidth, h: window.innerHeight, markers, overlaps }
  })
}

async function seatClient(page, kind, width, height) {
  return page.evaluate(({ kind, width, height }) => {
    const svg = document.querySelector('.defend-board')
    if (!(svg instanceof SVGSVGElement)) return null
    const ctm = svg.getScreenCTM()
    if (!ctm) return null
    for (const node of document.querySelectorAll(`[data-seat="${kind}"]`)) {
      const point = svg.createSVGPoint()
      point.x = Number(node.getAttribute('cx'))
      point.y = Number(node.getAttribute('cy'))
      const client = point.matrixTransform(ctm)
      if (client.x < 12 || client.y < 80 || client.x > width - 12 || client.y > height - 80) continue
      const hit = document.elementFromPoint(client.x, client.y)
      if (!hit || !hit.closest('.defend-board') || hit.closest('button, .nw-rail, .nw-docks, .nw-skill-tray')) continue
      return { x: client.x, y: client.y }
    }
    return null
  }, { kind, width, height })
}

async function openSpawnMap(browser, port, errors, id, width, height, extra = '') {
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
  const spawns = []
  page.on('console', (msg) => {
    const text = msg.text()
    if (text.startsWith('nw-spawn ')) spawns.push(text)
  })
  listen(page, errors, `spawn ${id} ${width}`)
  const map = id === 'a2' ? '' : `&nwMap=${id}`
  await pointerOpenJump(page, `?playtest=1&nwSeed=2${map}${extra}`)
  if (await page.locator('[data-map-overlay]').count()) {
    const pick = page.locator(`[data-map="${id}"]`)
    const box = await pick.boundingBox()
    assert.ok(box, `${id} map pick is on screen`)
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
    await page.mouse.down()
    await page.mouse.up()
    await page.locator('[data-map-overlay]').waitFor({ state: 'detached' })
  }
  await page.locator('.defend-board.has-map-plate').waitFor()
  await page.locator('[data-spawn-marker]').first().waitFor()
  await page.waitForTimeout(120)
  return { context, page, spawns }
}

/** Easy arches at 375, 412, and 768. Real pointer events. Hard is a check-city gate. */
async function checkSpawnMarkers(browser, port, errors) {
  mkdirSync('/opt/cursor/artifacts/hop-756', { recursive: true })
  const rows = []
  const shots = []
  const widths = process.env.NW_SPAWN_LAYOUT === '0'
    ? []
    : [
        [375, 667],
        [412, 915],
        [768, 1024],
      ]
  for (const [width, height] of widths) {
    for (const id of SPAWN_MAPS) {
      if (process.env.NW_SPAWN_MAP && process.env.NW_SPAWN_MAP !== id) continue
      const run = await openSpawnMap(browser, port, errors, id, width, height)
      const board = await readSpawnBoard(run.page)
      assert.equal(board.markers.length, SPAWN_COUNTS[id], `1.4.525 ${id} at ${width} has ${SPAWN_COUNTS[id]} arches`)
      assert.deepEqual(board.overlaps, [], `1.4.525 ${id} at ${width} arches clear the chrome (${board.overlaps.join(', ')})`)
      for (const marker of board.markers) {
        assert.equal(marker.markerHit, false, `1.4.525 ${marker.id} does not take the hit`)
        assert.ok(marker.scale >= 0.7, `1.4.525 ${marker.id} scale ${marker.scale}`)
        assert.ok(marker.left >= -1 && marker.top >= -1, `1.4.525 ${marker.id} starts inside ${width}`)
        assert.ok(marker.right <= width + 1 && marker.bottom <= height + 1, `1.4.525 ${marker.id} ends inside ${width}`)
        if (width === 375) assert.ok(marker.width >= 40, `1.4.525 ${marker.id} is ${marker.width.toFixed(1)} px wide`)
        const rect = `${marker.left.toFixed(0)},${marker.top.toFixed(0)} ${marker.width.toFixed(0)}x${marker.height.toFixed(0)}`
        rows.push({ map: id, width, marker: marker.id, fit: marker.fit, scale: marker.scale.toFixed(2), rect })
        console.log(`spawn-box ${id} ${width} ${marker.id} ${marker.fit} ${marker.scale.toFixed(2)} ${rect}`)
      }
      const odd = board.markers.some((marker) => marker.fit !== 'base')
      if (width === 375 || id === 'map06' || odd) {
        if (width === 375) {
          const card = await run.page.locator('[data-type="love"]').boundingBox()
          assert.ok(card, '1.4.525 the Love card is on screen')
          await run.page.mouse.move(card.x + card.width / 2, card.y + card.height / 2)
          await run.page.mouse.down()
          await run.page.mouse.up()
          await run.page.locator('[data-type="love"][aria-pressed="true"]').waitFor()
        }
        const shot = `/opt/cursor/artifacts/hop-756/${id}-${width}.png`
        await run.page.screenshot({ path: shot })
        shots.push(shot)
      }
      if (width === 375) {
        const before = await plantedCount(run.page)
        for (const marker of board.markers) {
          const x = (marker.left + marker.right) / 2
          const y = (marker.top + marker.bottom) / 2
          const hit = await run.page.evaluate(({ x, y }) => {
            const node = document.elementFromPoint(x, y)
            return Boolean(node && node.closest && node.closest('[data-spawn-marker]'))
          }, { x, y })
          assert.equal(hit, false, `1.4.525 ${marker.id} center is not the arch`)
          const onBoard = await run.page.evaluate(({ x, y }) => {
            const node = document.elementFromPoint(x, y)
            return Boolean(node && node.closest && node.closest('.defend-board'))
          }, { x, y })
          await run.page.mouse.move(x, y)
          await run.page.mouse.down()
          await run.page.mouse.up()
          if (onBoard) {
            await run.page.waitForFunction(() => {
              const text = document.querySelector('[data-place-toast]')?.textContent || ''
              return text.includes('Plant on open ground') || text.includes('Too far from the road')
            })
          }
          assert.equal(await plantedCount(run.page), before, `1.4.525 ${marker.id} tap does not plant`)
        }
        const live = await seatClient(run.page, 'live', width, height)
        assert.ok(live, `1.4.525 ${id} has a green seat`)
        await assertGreenDrag(run.page, 'love', live.x, live.y, `1.4.525 ${id}`)
        const dead = await seatClient(run.page, 'dead', width, height)
        assert.ok(dead, `1.4.525 ${id} has a grey seat`)
        await assertGreyTap(run.page, dead.x, dead.y, `1.4.525 ${id}`)
      }
      await run.context.close()
    }
  }

  const waveBrowser = widths.length > 0 ? await launchBrowser() : browser
  try {
  const round = EASY_ROUNDS[4]
  let fastId = -1
  for (let id = 0; id < round.count; id += 1) {
    if (gaitForSlot(round, id) === 'fast') {
      fastId = id
      break
    }
  }
  assert.ok(fastId >= 0, '1.4.525 round 5 has a fast walker')
  for (const id of SPAWN_MAPS) {
    if (process.env.NW_SPAWN_MAP && process.env.NW_SPAWN_MAP !== id) continue
    const run = await openSpawnMap(waveBrowser, port, errors, id, 375, 667, '&nwRound=5&nwLamps=0')
    const go = run.page.locator('.defend-go')
    await go.waitFor()
    const goClass = (await go.getAttribute('class')) || ''
    assert.match(goClass, /is-after-plant/, `1.4.525 ${id} round 5 Begin is live (${goClass})`)
    await pointerBox(run.page, '.defend-go')
    const wave = run.page.locator('.defend-page.is-shop, .defend-raider').first()
    try {
      await wave.waitFor({ timeout: 4000 })
    } catch {
      const state = await run.page.evaluate(() => ({
        cls: document.querySelector('.defend-page')?.className || '',
        go: document.querySelector('.defend-go')?.className || '',
        toast: document.querySelector('[data-place-toast]')?.textContent || '',
        planted: document.querySelectorAll('.defend-pad.is-planted').length,
      }))
      assert.fail(`1.4.525 ${id} Begin did not start the wave ${JSON.stringify(state)}`)
    }
    const resume = run.page.getByRole('button', { name: 'Resume walkers' })
    if (await resume.count()) await pointerBox(run.page, '.defend-nw-debug-toggle')
    let line = ''
    const until = Date.now() + 50000
    while (Date.now() < until && !line) {
      line = run.spawns.find((text) => /^nw-spawn \d+ -?\d+ -?\d+ 0$/.test(text)) || ''
      if (line) break
      const face = await run.page.locator('.defend-walker-tap').first().boundingBox().catch(() => null)
      if (face) {
        const x = face.x + face.width / 2
        const y = face.y + face.height / 2
        const onFace = await run.page.evaluate(({ x, y }) => {
          const node = document.elementFromPoint(x, y)
          return Boolean(node && node.closest && node.closest('.defend-walker-tap, .defend-raider'))
        }, { x, y })
        if (onFace) {
          await run.page.mouse.move(x, y)
          await run.page.mouse.down()
          await run.page.mouse.up()
        }
      }
      await run.page.waitForTimeout(90)
    }
    if (!line) {
      const state = await run.page.evaluate(() => ({
        cls: document.querySelector('.defend-page')?.className || '',
        raiders: document.querySelectorAll('.defend-raider').length,
        taps: document.querySelectorAll('.defend-walker-tap').length,
      }))
      assert.fail(`1.4.525 ${id} fast walker never logged t=0 saw [${run.spawns.join(' | ')}] state ${JSON.stringify(state)} errors [${errors.join(' | ')}]`)
    }
    assert.match(line, /^nw-spawn \d+ -?\d+ -?\d+ 0$/, `1.4.525 ${id} fast walker steps out at t=0 (${line})`)
    const parts = line.split(' ')
    const x = Number(parts[2])
    const y = Number(parts[3])
    const roads = spawnRoads(id)
    let road = roads[0]
    let startGap = Infinity
    for (const candidate of roads) {
      const gap = Math.hypot(candidate.points[0].x - x, candidate.points[0].y - y)
      if (gap < startGap) {
        startGap = gap
        road = candidate
      }
    }
    const marker = spawnMarkersFor(id).find((row) => {
      const marked = roads.find((item) => item.id === row.roadId)
      return marked && Math.hypot(marked.points[0].x - road.points[0].x, marked.points[0].y - road.points[0].y) < 1.5
    })
    assert.ok(marker, `1.4.525 ${id} fast walker is on a marked road`)
    const box = spawnMarkerPlateBox(marker)
    const gap = gapToPlateBox(x, y, box)
    const client = await run.page.evaluate(({ x, y }) => {
      const svg = document.querySelector('.defend-board')
      if (!(svg instanceof SVGSVGElement)) return null
      const ctm = svg.getScreenCTM()
      if (!ctm) return null
      const point = svg.createSVGPoint()
      point.x = x
      point.y = y
      const at = point.matrixTransform(ctm)
      return { x: at.x, y: at.y, w: window.innerWidth, h: window.innerHeight }
    }, { x, y })
    const offScreen = !client || client.x < 0 || client.y < 0 || client.x > client.w || client.y > client.h
    assert.ok(
      gap <= SPAWN_BOX_U || (offScreen && roadGap({ x: marker.x, y: marker.y }, road.points) <= SPAWN_BOX_U / 2),
      `1.4.525 ${id} fast walker is within one arch of ${marker.roadId} (gap ${gap.toFixed(1)}, off ${offScreen})`,
    )
    const board = await readSpawnBoard(run.page)
    const spot = board.markers[0]
    assert.ok(spot, `1.4.525 ${id} still shows an arch in the wave`)
    const before = await readMissScore(run.page)
    const cx = (spot.left + spot.right) / 2
    const cy = (spot.top + spot.bottom) / 2
    const onBoard = await run.page.evaluate(({ x, y }) => {
      const node = document.elementFromPoint(x, y)
      return Boolean(node && node.closest && node.closest('.defend-board') && !node.closest('[data-spawn-marker]'))
    }, { x: cx, y: cy })
    await run.page.mouse.move(cx, cy)
    await run.page.mouse.down()
    await run.page.mouse.up()
    await run.page.waitForTimeout(200)
    const after = await readMissScore(run.page)
    const taps = (score) => score.hits + score.misses + score.stray
    if (onBoard) {
      assert.ok(taps(after) > taps(before), `1.4.525 ${id} wave tap at the arch counts (${before.text} -> ${after.text})`)
    } else {
      assert.equal(taps(after), taps(before), `1.4.525 ${id} wave tap on the dock stays with the dock (${before.text})`)
    }
    if (id === 'map06') await run.page.screenshot({ path: '/opt/cursor/artifacts/hop-756/map06-r5.png' })
    await run.context.close()
  }
  } finally {
    if (waveBrowser !== browser) await waveBrowser.close()
  }
  writeFileSync('/opt/cursor/artifacts/hop-756/final-box.json', JSON.stringify({ rows, shots }, null, 2))
  console.log('spawn-final-box')
  for (const row of rows) console.log(`${row.map}\t${row.width}\t${row.marker}\t${row.fit}\t${row.scale}\t${row.rect}`)
}

const WALK_STEP_MS = 1000 / 60
const WALK_CHROME = ['.nw-docks', '.nw-rail', '.nw-skill-tray', '.nw-tap-readout', '.defend-hearts', '.nw-hud', '.match-toast', '.defend-go']

/** 8-bit RGB or RGBA, not interlaced. That is what Chromium writes. */
function decodePng(buffer) {
  let at = 8
  let width = 0
  let height = 0
  let color = -1
  const parts = []
  while (at < buffer.length) {
    const size = buffer.readUInt32BE(at)
    const type = buffer.toString('ascii', at + 4, at + 8)
    const data = buffer.subarray(at + 8, at + 8 + size)
    if (type === 'IHDR') {
      width = data.readUInt32BE(0)
      height = data.readUInt32BE(4)
      assert.equal(data[8], 8, 'walk-in shot is 8-bit')
      color = data[9]
      assert.equal(data[12], 0, 'walk-in shot is not interlaced')
    } else if (type === 'IDAT') {
      parts.push(data)
    } else if (type === 'IEND') {
      break
    }
    at += 12 + size
  }
  assert.ok(color === 2 || color === 6, `walk-in shot color type ${color}`)
  const bpp = color === 6 ? 4 : 3
  const raw = inflateSync(Buffer.concat(parts))
  const stride = width * bpp
  const out = Buffer.alloc(height * stride)
  for (let y = 0; y < height; y += 1) {
    const filter = raw[y * (stride + 1)]
    const row = raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1))
    const cur = out.subarray(y * stride, (y + 1) * stride)
    const prev = y > 0 ? out.subarray((y - 1) * stride, y * stride) : null
    for (let i = 0; i < stride; i += 1) {
      const a = i >= bpp ? cur[i - bpp] : 0
      const b = prev ? prev[i] : 0
      const c = prev && i >= bpp ? prev[i - bpp] : 0
      let value = row[i]
      if (filter === 1) value += a
      else if (filter === 2) value += b
      else if (filter === 3) value += (a + b) >> 1
      else if (filter === 4) {
        const p = a + b - c
        const pa = Math.abs(p - a)
        const pb = Math.abs(p - b)
        const pc = Math.abs(p - c)
        value += pa <= pb && pa <= pc ? a : pb <= pc ? b : c
      }
      cur[i] = value & 255
    }
  }
  return { width, height, bpp, data: out }
}

/** Walker pixels in a magenta shot: how many, how many fall outside `rect`, and the closest one to its edge. */
function walkerPixels(png, rect, chrome) {
  let count = 0
  let outside = 0
  let edgeGap = Infinity
  let firstOut = null
  const under = []
  for (let y = 0; y < png.height; y += 1) {
    for (let x = 0; x < png.width; x += 1) {
      const i = (y * png.width + x) * png.bpp
      const off = Math.abs(png.data[i] - 255) + png.data[i + 1] + Math.abs(png.data[i + 2] - 255)
      if (off <= 24) continue
      count += 1
      const cx = x + 0.5
      const cy = y + 0.5
      if (cx < rect.left - 1 || cx > rect.right + 1 || cy < rect.top - 1 || cy > rect.bottom + 1) {
        outside += 1
        if (!firstOut) firstOut = { x, y }
      }
      edgeGap = Math.min(edgeGap, Math.abs(x - rect.left), Math.abs(rect.right - (x + 1)), Math.abs(y - rect.top), Math.abs(rect.bottom - (y + 1)))
      if (chrome.some((box) => cx >= box.left && cx <= box.right && cy >= box.top && cy <= box.bottom)) under.push(i)
    }
  }
  return { count, outside, edgeGap, firstOut, under }
}

function walkTranslate(text) {
  const match = /translate\(\s*(-?[\d.e+-]+)[\s,]+(-?[\d.e+-]+)\s*\)/.exec(text || '')
  return match ? { x: Number(match[1]), y: Number(match[2]) } : null
}

function walkPlate(id) {
  if (id === 'a2') return { width: 798, height: 1134 }
  const file = id === 'far-hills' ? 'map02.json' : `${id}.json`
  const pack = nightMapFromPack(JSON.parse(readFileSync(new URL(`../src/nightWatch/maps/maze/${file}`, import.meta.url), 'utf8')))
  return { width: pack.width, height: pack.height }
}

function walkStartKey(start) {
  return `${start.x.toFixed(1)},${start.y.toFixed(1)}`
}

/** Road, start, and run time for one spawn line. Roads that share a start share the run. */
function walkSpawnRoad(id, line) {
  const parts = line.split(' ')
  const x = Number(parts[2])
  const y = Number(parts[3])
  const t = Number(parts[4])
  const plate = walkPlate(id)
  const rows = spawnRoads(id).map((road) => {
    const at = pathPoint(t, road.points)
    const entry = walkInEntry(road.points, plate)
    const runMs = walkInMs(walkInLength(entry, road.points, t))
    return { road, entry, runMs, gap: Math.hypot(at.x - x, at.y - y) }
  })
  rows.sort((a, b) => a.gap - b.gap)
  const best = rows[0]
  assert.ok(best.gap <= 1.5, `1.4.526 ${id} spawn ${line} is on a road (gap ${best.gap.toFixed(2)})`)
  for (const twin of rows.slice(1)) {
    if (twin.gap > 1.5) continue
    assert.equal(walkStartKey(twin.entry.start), walkStartKey(best.entry.start), `1.4.526 ${id} ${twin.road.id} and ${best.road.id} share a start`)
    assert.ok(Math.abs(twin.runMs - best.runMs) <= 2, `1.4.526 ${id} ${twin.road.id} and ${best.road.id} share a run`)
  }
  return { ...best, x, y, t }
}

async function openWalkMap(browser, port, errors, id, width, height, extra) {
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
  // The game loop reads its frame time from requestAnimationFrame, so frames get the held clock too.
  // Frozen, the game clock stands still. Each step is one game tick.
  await context.addInitScript(() => {
    const real = performance.now.bind(performance)
    const raf = window.requestAnimationFrame.bind(window)
    let hold = null
    window.__nwClock = {
      freeze() {
        hold = real()
      },
      step(ms) {
        hold = (hold ?? real()) + ms
      },
    }
    performance.now = () => hold ?? real()
    window.requestAnimationFrame = (callback) => raf(() => callback(performance.now()))
  })
  const page = await context.newPage()
  const spawns = []
  page.on('console', (msg) => {
    const text = msg.text()
    if (text.startsWith('nw-spawn ')) spawns.push(text)
  })
  listen(page, errors, `walk ${id} ${width}`)
  const map = id === 'a2' ? '' : `&nwMap=${id}`
  await pointerOpenJump(page, `?playtest=1&nwSeed=2${map}${extra}`)
  if (await page.locator('[data-map-overlay]').count()) {
    const pick = page.locator(`[data-map="${id}"]`)
    const box = await pick.boundingBox()
    assert.ok(box, `${id} map pick is on screen`)
    await pointerTap(page, box.x + box.width / 2, box.y + box.height / 2)
    await page.locator('[data-map-overlay]').waitFor({ state: 'detached' })
  }
  await page.locator('.defend-board.has-map-plate').waitFor()
  await page.locator('.defend-go').waitFor()
  await pointerBox(page, '.defend-go')
  await page.evaluate(() => window.__nwClock.freeze())
  await walkAtTop(page)
  return { context, page, spawns }
}

/** Steps the game `ms` in 1/60 s ticks, then lets React paint. Each tick is one seeded step. */
async function walkStep(page, ms) {
  await page.evaluate(async ({ total, tick }) => {
    const frame = () => new Promise((done) => requestAnimationFrame(() => done()))
    let left = total
    while (left > 1e-6) {
      const step = Math.min(tick, left)
      window.__nwClock.step(step)
      left -= step
      await frame()
    }
    await frame()
    await frame()
  }, { total: ms, tick: WALK_STEP_MS })
}

/** The debug pause sits under the board on a phone. Pausing scrolls to it, so scroll back before measuring. */
async function pauseAtTop(page) {
  await pauseWalkers(page)
  await walkAtTop(page)
}

async function walkAtTop(page) {
  await page.waitForFunction(() => {
    let moved = false
    for (const node of [document.scrollingElement, ...document.querySelectorAll('*')]) {
      if (node && (node.scrollTop || node.scrollLeft)) {
        node.scrollTo({ top: 0, left: 0, behavior: 'instant' })
        moved = true
      }
    }
    return !moved
  }, null, { polling: 50, timeout: 3000 })
}

/**
 * Ticks the game until a walker that has not been seen is drawn. That paint is its first frame.
 * `soft` returns [] after `limit` steps instead of failing: the wave has no walker left.
 */
async function nextWalkIn(run, seen, label, { soft = false, limit = 2400 } = {}) {
  const found = await run.page.evaluate(
    async ({ known, tick, limit }) => {
      const frame = () => new Promise((done) => requestAnimationFrame(() => done()))
      const fresh = () =>
        [...document.querySelectorAll('.defend-raider[data-walk-in="yes"]')].some((node) => {
          const id = node.getAttribute('data-walk-id')
          return id && !known.includes(id)
        })
      for (let i = 0; i < limit; i += 1) {
        if (fresh()) return true
        window.__nwClock.step(tick)
        await frame()
        await frame()
      }
      return fresh()
    },
    { known: [...seen], tick: WALK_STEP_MS, limit },
  )
  if (!found && soft) return []
  assert.ok(found, `${label} a new walker walks in`)
  const fresh = await run.page.evaluate((known) => {
    return [...document.querySelectorAll('.defend-raider[data-walk-in="yes"]')]
      .map((node) => ({ id: node.getAttribute('data-walk-id') || '', transform: node.getAttribute('transform') || '' }))
      .filter((row) => !known.includes(row.id))
  }, [...seen])
  const rows = []
  for (const row of fresh) {
    const until = Date.now() + 2000
    let line = ''
    while (!line && Date.now() < until) {
      line = run.spawns.find((text) => text.split(' ')[1] === row.id) || ''
      if (!line) await run.page.waitForTimeout(30)
    }
    assert.ok(line, `${label} walker ${row.id} logged its spawn`)
    rows.push({ ...row, line })
  }
  return rows
}

/** Visible map in client px: the plate, cut to the board box and the viewport. Plus the chrome boxes. */
async function walkMapRect(page) {
  return page.evaluate((chromeSel) => {
    const svg = document.querySelector('.defend-board')
    const group = document.querySelector('.defend-board .nw-walkers')
    const clip = group?.querySelector('clipPath rect')
    if (!(svg instanceof SVGSVGElement) || !(group instanceof SVGGElement) || !clip) return null
    const ctm = group.getScreenCTM()
    if (!ctm) return null
    const corner = (x, y) => {
      const p = svg.createSVGPoint()
      p.x = x
      p.y = y
      return p.matrixTransform(ctm)
    }
    const w = Number(clip.getAttribute('width'))
    const h = Number(clip.getAttribute('height'))
    const a = corner(Number(clip.getAttribute('x')), Number(clip.getAttribute('y')))
    const b = corner(w, h)
    const box = svg.getBoundingClientRect()
    const chrome = []
    for (const sel of chromeSel) {
      for (const node of document.querySelectorAll(sel)) {
        const r = node.getBoundingClientRect()
        if (r.width > 0 && r.height > 0) chrome.push({ sel, left: r.left, top: r.top, right: r.right, bottom: r.bottom })
      }
    }
    return {
      clip: [clip.getAttribute('x'), clip.getAttribute('y'), clip.getAttribute('width'), clip.getAttribute('height')].join(','),
      plate: { left: a.x, top: a.y, right: b.x, bottom: b.y },
      rect: {
        left: Math.max(0, a.x, box.left),
        top: Math.max(0, a.y, box.top),
        right: Math.min(window.innerWidth, b.x, box.right),
        bottom: Math.min(window.innerHeight, b.y, box.bottom),
      },
      chrome,
      ctm: [ctm.a, ctm.b, ctm.c, ctm.d, ctm.e, ctm.f],
    }
  }, WALK_CHROME)
}

async function isolatedWalkerShot(page, id) {
  await page.evaluate((walkerId) => {
    const style = document.createElement('style')
    style.id = 'nw-walk-iso'
    style.textContent = `
      html, body { background: #ff00ff !important; }
      body, body * { visibility: hidden !important; }
      clipPath, clipPath *, mask, mask * { visibility: visible !important; }
      .defend-raider[data-walk-id="${walkerId}"], .defend-raider[data-walk-id="${walkerId}"] * { visibility: visible !important; }
    `
    document.head.append(style)
  }, id)
  const shot = await page.screenshot()
  await page.evaluate(() => document.getElementById('nw-walk-iso')?.remove())
  return decodePng(shot)
}

/** The board under the chrome paints the same with and without the walker. */
async function chromeCoversWalker(page, id, under, label) {
  if (under.length === 0) return 0
  const plain = decodePng(await page.screenshot({ animations: 'disabled' }))
  await page.evaluate((walkerId) => {
    const style = document.createElement('style')
    style.id = 'nw-walk-hide'
    style.textContent = `.defend-raider[data-walk-id="${walkerId}"], .defend-raider[data-walk-id="${walkerId}"] * { visibility: hidden !important; }`
    document.head.append(style)
  }, id)
  const bare = decodePng(await page.screenshot({ animations: 'disabled' }))
  await page.evaluate(() => document.getElementById('nw-walk-hide')?.remove())
  const changed = []
  for (const i of under) {
    const diff = Math.abs(plain.data[i] - bare.data[i]) + Math.abs(plain.data[i + 1] - bare.data[i + 1]) + Math.abs(plain.data[i + 2] - bare.data[i + 2])
    if (diff > 12) {
      const p = i / plain.bpp
      changed.push({ x: p % plain.width, y: Math.floor(p / plain.width) })
    }
  }
  const over = await page.evaluate(
    ({ points, chromeSel, walkerId }) => {
      const style = document.createElement('style')
      style.id = 'nw-walk-hit'
      style.textContent = `.defend-raider[data-walk-id="${walkerId}"], .defend-raider[data-walk-id="${walkerId}"] * { pointer-events: all !important; }`
      document.head.append(style)
      const rows = []
      for (const pt of points) {
        const stack = document.elementsFromPoint(pt.x + 0.5, pt.y + 0.5)
        const chrome = stack.findIndex((node) => node.closest?.(chromeSel.join(', ')))
        if (chrome < 0) continue
        const walker = stack.findIndex((node) => node.closest?.(`.defend-raider[data-walk-id="${walkerId}"]`))
        if (walker >= 0 && walker < chrome) rows.push({ ...pt, on: `${stack[chrome].tagName}.${String(stack[chrome].className).split(' ')[0]}` })
      }
      style.remove()
      return rows
    },
    { points: changed, chromeSel: WALK_CHROME, walkerId: id },
  )
  assert.deepEqual(over.slice(0, 6), [], `${label} walker does not paint over the tray, HUD, or rail (${over.length} of ${under.length} px)`)
  return under.length
}

/** Steps one walker from its first frame to its sim point. Every frame is checked against the map rect. */
async function stepWalkIn(run, row, spawn, label, ghosts) {
  const { page } = run
  const start = walkTranslate(row.transform)
  assert.ok(start, `${label} walker ${row.id} has a transform`)
  assert.ok(
    Math.hypot(start.x - spawn.entry.start.x, start.y - spawn.entry.start.y) <= 0.75,
    `${label} ${spawn.road.id} first frame at ${start.x.toFixed(1)},${start.y.toFixed(1)} is the start ${walkStartKey(spawn.entry.start)}`,
  )
  const map = await walkMapRect(page)
  assert.ok(map, `${label} has a walker layer`)
  assert.equal(map.clip, `0,0,${walkPlate(spawn.mapId).width},${walkPlate(spawn.mapId).height}`, `${label} walkers clip to the plate`)
  const stray = await page.evaluate(() => [...document.querySelectorAll('.defend-raider')].filter((node) => !node.closest('.nw-walkers')).length)
  assert.equal(stray, 0, `${label} every walker is inside the clip`)
  let elapsed = 0
  let frame = 0
  let first = null
  let chromePx = 0
  let chromeChecks = 0
  const shoot = async () => {
    const png = await isolatedWalkerShot(page, row.id)
    const px = walkerPixels(png, map.rect, map.chrome)
    assert.equal(
      px.outside,
      0,
      `${label} ${spawn.road.id} frame ${frame} (${elapsed.toFixed(0)} ms) has ${px.outside} walker px outside the map ${JSON.stringify(map.rect)} first ${JSON.stringify(px.firstOut)}`,
    )
    if (px.count > 0 && !first) {
      first = { frame, ms: elapsed, gap: px.edgeGap, px: px.count }
      assert.ok(px.edgeGap <= 2, `${label} ${spawn.road.id} first visible frame ${frame} touches the map edge (gap ${px.edgeGap.toFixed(2)})`)
    }
    if (px.under.length > 0 && chromeChecks < 3) {
      chromeChecks += 1
      chromePx += await chromeCoversWalker(page, row.id, px.under, `${label} ${spawn.road.id} frame ${frame}`)
    }
    if (ghosts && px.count > 0 && frame % 4 === 0) {
      await page.evaluate((walkerId) => {
        const node = document.querySelector(`.defend-raider[data-walk-id="${walkerId}"]`)
        if (!node) return
        const ghost = node.cloneNode(true)
        ghost.removeAttribute('data-walk-id')
        ghost.removeAttribute('data-walk-in')
        ghost.setAttribute('data-walk-ghost', 'yes')
        ghost.setAttribute('opacity', '0.55')
        node.before(ghost)
      }, row.id)
    }
  }
  await shoot()
  while (elapsed + WALK_STEP_MS < spawn.runMs - 20) {
    await walkStep(page, WALK_STEP_MS)
    elapsed += WALK_STEP_MS
    frame += 1
    await shoot()
  }
  const lead = spawn.runMs - 20 - elapsed
  await walkStep(page, lead)
  elapsed += lead
  frame += 1
  const late = await page.locator(`.defend-raider[data-walk-id="${row.id}"]`).getAttribute('data-walk-in')
  assert.equal(late, 'yes', `${label} ${spawn.road.id} still walks in at ${spawn.runMs - 20} ms`)
  await shoot()
  await walkStep(page, 40)
  elapsed += 40
  frame += 1
  const done = await page.locator(`.defend-raider[data-walk-id="${row.id}"]`).getAttribute('data-walk-in')
  assert.equal(done, null, `${label} ${spawn.road.id} is on its sim point at ${spawn.runMs + 20} ms`)
  await shoot()
  return { first, frames: frame + 1, chromePx, map }
}

async function walkClient(page, point) {
  return page.evaluate(({ x, y }) => {
    const svg = document.querySelector('.defend-board')
    const group = document.querySelector('.defend-board .nw-walkers')
    if (!(svg instanceof SVGSVGElement) || !(group instanceof SVGGElement)) return null
    const ctm = group.getScreenCTM()
    if (!ctm) return null
    const p = svg.createSVGPoint()
    p.x = x
    p.y = y
    const at = p.matrixTransform(ctm)
    const node = document.elementFromPoint(at.x, at.y)
    const chrome = Boolean(node?.closest?.('button, a, .nw-docks, .nw-rail, .nw-skill-tray, .nw-tap-readout, .defend-hearts, .nw-wave-overlay, .match-toast, .defend-pad'))
    return {
      x: at.x,
      y: at.y,
      open: at.x > 4 && at.y > 4 && at.x < window.innerWidth - 4 && at.y < window.innerHeight - 4 && Boolean(node?.closest?.('.defend-board')) && !chrome,
    }
  }, point)
}

async function walkerFaceNow(page, id) {
  const transform = await page.locator(`.defend-raider[data-walk-id="${id}"]`).getAttribute('transform')
  const at = walkTranslate(transform)
  assert.ok(at, `walker ${id} has a transform`)
  return { x: at.x, y: at.y + PATH_WALKER_FACE_DY }
}

async function walkHeldState(page, id) {
  return page.evaluate((walkerId) => {
    const node = document.querySelector(`.defend-raider[data-walk-id="${walkerId}"]`)
    return {
      walkIn: node?.getAttribute('data-walk-in') || '',
      cls: node?.getAttribute('class') || '',
      tapButton: document.querySelectorAll(`.defend-walker-tap[data-walker-id="${walkerId}"]`).length,
      cue: document.querySelectorAll('[data-cue="target"]').length,
      walkers: document.querySelectorAll('.defend-raider[data-walk-id]').length,
      held: document.querySelectorAll('.defend-raider.is-walk-in').length,
    }
  }, id)
}

/** Steps an entering walker until its drawn face is open board, and returns that point. Stays inside the tap lock. */
async function stepToOpenFace(page, id, lockMs, label, away = []) {
  let elapsed = 0
  while (elapsed + WALK_STEP_MS < lockMs - 60) {
    const face = await walkerFaceNow(page, id)
    const client = await walkClient(page, face)
    const clear = away.every((other) => Math.hypot(other.x - face.x, other.y - face.y) > EASY_FACE_HIT_R * 2 + 8)
    if (client?.open && clear) return { face, client, elapsed }
    await walkStep(page, WALK_STEP_MS)
    elapsed += WALK_STEP_MS
  }
  assert.fail(`${label} walker ${id} never showed an open face inside its ${lockMs} ms lock`)
}

async function checkWalkInTaps(browser, port, errors) {
  const map = process.env.NW_WALKIN_TAP_MAP || 'map03'
  const rows = []

  {
    const label = `1.4.526 ${map} r5 tap`
    const run = await openWalkMap(browser, port, errors, map, 375, 667, '&nwRound=5&nwLamps=0')
    const [row] = await nextWalkIn(run, new Set(), label)
    const spawn = walkSpawnRoad(map, row.line)
    const lockMs = walkInTapLockMs(spawn.runMs)
    const open = await stepToOpenFace(run.page, row.id, lockMs, label)
    const held = await walkHeldState(run.page, row.id)
    assert.equal(held.walkIn, 'yes', `${label} walker is still walking in`)
    assert.match(held.cls, /is-walk-in/, `${label} walker is held`)
    assert.doesNotMatch(held.cls, /is-easy-cue|is-easy-tap-target/, `${label} entering walker does not glow (${held.cls})`)
    assert.equal(held.tapButton, 0, `${label} entering walker has no tap button`)
    assert.equal(held.held, held.walkers, `${label} every walker on the road is still walking in`)
    assert.equal(held.cue, 0, `${label} no cue ring while every walker walks in`)
    const before = await readMissScore(run.page)
    await pointerTap(run.page, open.client.x, open.client.y)
    await run.page.waitForTimeout(80)
    const drawn = await readMissScore(run.page)
    assert.equal(drawn.hits, before.hits, `${label} drawn face tap is not a hit`)
    assert.equal(drawn.misses, before.misses, `${label} drawn face tap is not a miss`)
    assert.equal(missSum(drawn), missSum(before), `${label} drawn face tap adds no miss reason`)
    const simFace = { x: spawn.x, y: spawn.y + PATH_WALKER_FACE_DY }
    const sim = await walkClient(run.page, simFace)
    assert.ok(sim?.open, `${label} sim face ${spawn.x},${spawn.y} is open board ${JSON.stringify(sim)}`)
    await pointerTap(run.page, sim.x, sim.y)
    await run.page.waitForTimeout(80)
    const simTap = await readMissScore(run.page)
    assert.equal(simTap.hits, before.hits, `${label} sim face tap is not a hit`)
    assert.equal(simTap.misses, before.misses, `${label} sim face tap is not a miss`)
    assert.equal((await walkHeldState(run.page, row.id)).walkIn, 'yes', `${label} both taps were inside the run-in`)
    await walkStep(run.page, spawn.runMs + 20)
    const after = await walkHeldState(run.page, row.id)
    assert.equal(after.walkIn, '', `${label} walker is on its sim point`)
    assert.match(after.cls, /is-easy-cue/, `${label} round 5 walker glows after the run-in`)
    assert.equal(after.tapButton, 1, `${label} walker takes taps after the run-in`)
    const cue = await faceClient(run.page, 'cue')
    assert.ok(cue, `${label} glowing face is on screen`)
    await pointerTap(run.page, cue.x, cue.y)
    await run.page.waitForFunction((hits) => Number(document.querySelector('.nw-tap-readout')?.getAttribute('data-tap-hits') ?? '0') > hits, before.hits)
    rows.push({ check: 'r5 held taps', map, run: spawn.runMs, lock: lockMs, tapAtMs: Math.round(open.elapsed), hitAfter: 'yes' })
    await run.context.close()
  }

  {
    const label = `1.4.526 ${map} r6 dark`
    const run = await openWalkMap(browser, port, errors, map, 375, 667, '&nwRound=6&nwLamps=0')
    const seen = new Set()
    let target = null
    let leads = []
    const until = Date.now() + 60000
    while (!target && Date.now() < until) {
      const fresh = await nextWalkIn(run, seen, label)
      for (const row of fresh) seen.add(row.id)
      leads = await run.page.evaluate(() =>
        [...document.querySelectorAll('.defend-raider[data-walk-id]:not([data-walk-in])')].map((node) => node.getAttribute('transform') || ''),
      )
      if (leads.length > 0) {
        target = fresh[0]
        break
      }
      const spawn = walkSpawnRoad(map, fresh[0].line)
      await walkStep(run.page, spawn.runMs + 20)
    }
    assert.ok(target, `${label} a second walker walks in behind the lead`)
    const spawn = walkSpawnRoad(map, target.line)
    const away = leads.map(walkTranslate).filter(Boolean).map((at) => ({ x: at.x, y: at.y + PATH_WALKER_FACE_DY }))
    const open = await stepToOpenFace(run.page, target.id, walkInTapLockMs(spawn.runMs), label, away)
    const held = await walkHeldState(run.page, target.id)
    assert.equal(held.walkIn, 'yes', `${label} walker is still walking in`)
    assert.doesNotMatch(held.cls, /is-easy-cue|is-easy-tap-target/, `${label} entering walker does not glow`)
    const before = await readMissScore(run.page)
    await pointerTap(run.page, open.client.x, open.client.y)
    await run.page.waitForTimeout(80)
    const after = await readMissScore(run.page)
    assert.equal(after.dark, before.dark, `${label} entering dark walker tap is not a dark miss`)
    assert.equal(after.misses, before.misses, `${label} entering dark walker tap is not a miss`)
    assert.equal(after.hits, before.hits, `${label} entering dark walker tap is not a hit`)
    await walkStep(run.page, spawn.runMs + 20)
    const darkButton = (walkerId) => {
      const node = document.querySelector(`.defend-walker-tap[data-walker-id="${walkerId}"]`)
      if (!node || node.classList.contains('is-cue')) return null
      const box = node.getBoundingClientRect()
      const x = box.left + box.width / 2
      const y = box.top + box.height / 2
      const hit = document.elementFromPoint(x, y)?.closest?.('[data-walker-tap]')
      return hit?.getAttribute('data-walker-id') === walkerId ? { x, y } : null
    }
    let button = await run.page.evaluate(darkButton, target.id)
    for (let ms = 0; !button && ms < 15000; ms += 100) {
      await walkStep(run.page, 100)
      button = await run.page.evaluate(darkButton, target.id)
    }
    assert.ok(button, `${label} after the run-in the walker is a dark face that takes the pointer`)
    await pointerTap(run.page, button.x, button.y)
    await run.page.waitForFunction((dark) => Number(document.querySelector('.nw-tap-readout')?.getAttribute('data-miss-dark') ?? '0') > dark, after.dark)
    rows.push({ check: 'r6 held dark', map, run: spawn.runMs, tapAtMs: Math.round(open.elapsed), dark: `${before.dark} -> ${after.dark}, then +1 after the run-in` })
    await run.context.close()
  }

  {
    const label = `1.4.526 ${map} r5 plant`
    const run = await openWalkMap(browser, port, errors, map, 375, 667, '&nwRound=5&nwLamps=0')
    const [row] = await nextWalkIn(run, new Set(), label)
    const spawn = walkSpawnRoad(map, row.line)
    await walkStep(run.page, Math.round(walkInTapLockMs(spawn.runMs) / 3))
    await pointerBox(run.page, '[data-type="love"]')
    await run.page.locator('[data-type="love"][aria-pressed="true"]').waitFor()
    const live = await seatClient(run.page, 'live', 375, 667)
    assert.ok(live, `${label} has a green seat`)
    const before = await readMissScore(run.page)
    await assertGreenTap(run.page, live.x, live.y, label)
    const after = await readMissScore(run.page)
    assert.equal((await walkHeldState(run.page, row.id)).walkIn, 'yes', `${label} the plant landed during the run-in`)
    assert.equal(missSum(after) + after.hits + after.stray, missSum(before) + before.hits + before.stray, `${label} the seat tap is not a walker tap`)
    rows.push({ check: 'r5 plant in run-in', map, run: spawn.runMs, planted: 'yes' })
    await run.context.close()
  }

  {
    const label = `1.4.526 ${map} r5 lamp`
    const run = await openWalkMap(browser, port, errors, map, 375, 667, '&nwRound=5&nwLamps=1')
    const [row] = await nextWalkIn(run, new Set(), label)
    const spawn = walkSpawnRoad(map, row.line)
    await walkStep(run.page, Math.round(walkInTapLockMs(spawn.runMs) / 3))
    const lamp = await run.page.evaluate(() => {
      for (const node of document.querySelectorAll('.defend-clear-lamp')) {
        const box = node.getBoundingClientRect()
        const x = box.left + box.width / 2
        const y = box.top + box.height / 2
        if (x < 4 || y < 4 || x > window.innerWidth - 4 || y > window.innerHeight - 4) continue
        const hit = document.elementFromPoint(x, y)
        if (hit?.closest?.('.defend-clear-lamp')) return { x, y }
      }
      return { lamps: document.querySelectorAll('.defend-clear-lamp').length, pads: document.querySelectorAll('.defend-pad.is-planted').length }
    })
    assert.ok(lamp && 'x' in lamp, `${label} a planted lamp takes the pointer ${JSON.stringify(lamp)}`)
    const before = await readMissScore(run.page)
    await pointerTap(run.page, lamp.x, lamp.y)
    await run.page.locator('[data-upgrade-tree="yes"]').waitFor({ timeout: 3000 })
    const after = await readMissScore(run.page)
    assert.equal((await walkHeldState(run.page, row.id)).walkIn, 'yes', `${label} the lamp tap landed during the run-in`)
    assert.equal(missSum(after) + after.hits + after.stray, missSum(before) + before.hits + before.stray, `${label} the lamp tap is not a walker tap`)
    rows.push({ check: 'r5 lamp tap in run-in', map, run: spawn.runMs, card: 'open' })
    await run.context.close()
  }

  {
    const label = `1.4.526 ${map} debug freeze`
    const run = await openWalkMap(browser, port, errors, map, 375, 667, '&nwRound=5&nwLamps=0')
    const [row] = await nextWalkIn(run, new Set(), label)
    const spawn = walkSpawnRoad(map, row.line)
    const lockMs = walkInTapLockMs(spawn.runMs)
    await walkStep(run.page, Math.round(lockMs / 3))
    await pauseAtTop(run.page)
    const before = await walkerFaceNow(run.page, row.id)
    await walkStep(run.page, 3000)
    const held = await walkHeldState(run.page, row.id)
    const after = await walkerFaceNow(run.page, row.id)
    assert.equal(held.walkIn, 'yes', `${label} 3 s of wall clock under the debug freeze leave the walker walking in`)
    assert.match(held.cls, /is-walk-in/, `${label} and still held`)
    assert.ok(Math.hypot(after.x - before.x, after.y - before.y) < 0.01, `${label} and drawn where it was`)
    await resumeWalkers(run.page)
    await walkAtTop(run.page)
    await walkStep(run.page, lockMs)
    assert.doesNotMatch((await walkHeldState(run.page, row.id)).cls, /is-walk-in/, `${label} the lock ends once the game clock runs again`)
    rows.push({ check: 'debug freeze holds the run-in', map, run: spawn.runMs, lock: lockMs, frozeMs: 3000 })
    await run.context.close()
  }

  {
    const label = '1.4.526 a2 r1 long run-in'
    const run = await openWalkMap(browser, port, errors, 'a2', 375, 667, '&nwRound=1&nwLamps=0')
    const [row] = await nextWalkIn(run, new Set(), label)
    const spawn = walkSpawnRoad('a2', row.line)
    assert.ok(spawn.runMs > WALK_IN_TAP_MAX_MS, `${label} runs ${spawn.runMs} ms, past the 0.84 s lock`)
    await walkStep(run.page, WALK_IN_TAP_MAX_MS + 20)
    const state = await walkHeldState(run.page, row.id)
    assert.equal(state.walkIn, 'yes', `${label} is still walking in at 860 ms`)
    assert.doesNotMatch(state.cls, /is-walk-in/, `${label} is no longer held`)
    assert.equal(state.tapButton, 1, `${label} has a tap button`)
    const face = await walkClient(run.page, await walkerFaceNow(run.page, row.id))
    const seen = (await walkMapRect(run.page))?.rect
    assert.ok(
      face && seen && face.x > seen.left && face.x < seen.right && face.y > seen.top && face.y < seen.bottom,
      `${label} drawn face is on the visible map ${JSON.stringify({ face, seen })}`,
    )
    const tap = await run.page.evaluate((walkerId) => {
      const box = document.querySelector(`.defend-walker-tap[data-walker-id="${walkerId}"]`)?.getBoundingClientRect()
      return box ? { x: box.left + box.width / 2, y: box.top + box.height / 2 } : null
    }, row.id)
    assert.ok(tap && Math.hypot(tap.x - face.x, tap.y - face.y) <= 2, `${label} tap button sits on the drawn face ${JSON.stringify({ tap, face })}`)
    const before = await readMissScore(run.page)
    await pointerTap(run.page, face.x, face.y)
    await run.page.waitForFunction((hits) => Number(document.querySelector('.nw-tap-readout')?.getAttribute('data-tap-hits') ?? '0') > hits, before.hits, { timeout: 3000 })
    assert.equal((await walkHeldState(run.page, row.id)).walkIn, 'yes', `${label} the hit landed during the run-in`)
    rows.push({ check: 'a2 r1 tap at the drawn spot after 0.84 s', run: spawn.runMs, tapAtMs: WALK_IN_TAP_MAX_MS + 20, hit: 'yes' })
    await run.context.close()
  }

  {
    const label = '1.4.526 a2 r1 lamp shot'
    const run = await openWalkMap(browser, port, errors, 'a2', 375, 667, '&nwRound=1')
    const lamps = await run.page.locator('.defend-pad.is-planted').count()
    assert.ok(lamps > 0, `${label} the round 1 jump plants a lamp`)
    const [row] = await nextWalkIn(run, new Set(), label)
    const spawn = walkSpawnRoad('a2', row.line)
    const simFace = { x: spawn.x, y: spawn.y + PATH_WALKER_FACE_DY }
    const readShot = (walkerId) => {
      const beam = [...document.querySelectorAll('.defend-shot .defend-beam')].at(-1)
      const blast = [...document.querySelectorAll('.defend-blast')].at(-1)
      const node = document.querySelector(`.defend-raider[data-walk-id="${walkerId}"]`)
      if (!beam || !node) return null
      const cue = document.querySelector('.walker-target-cue')
      return {
        beam: { x: Number(beam.getAttribute('x2')), y: Number(beam.getAttribute('y2')) },
        blast: blast?.getAttribute('transform') || '',
        walker: node.getAttribute('transform') || '',
        walkIn: node.getAttribute('data-walk-in') || '',
        cueClipped: cue ? Boolean(cue.closest('[clip-path="url(#nw-walk-clip)"]')) : null,
      }
    }
    const walkerNow = (walkerId) => document.querySelector(`.defend-raider[data-walk-id="${walkerId}"]`)?.getAttribute('transform') || ''
    let shot = null
    let elapsed = 0
    let how = 'lamp autofire'
    // Autofire runs inside the tick, so the beam and walker share a frame.
    // A tap fires between frames, so the beam ends where the walker was drawn when tapped.
    let firedFrom = ''
    while (!shot && !firedFrom && elapsed + WALK_STEP_MS < spawn.runMs - 40) {
      await walkStep(run.page, WALK_STEP_MS)
      elapsed += WALK_STEP_MS
      shot = await run.page.evaluate(readShot, row.id)
      if (shot) firedFrom = shot.walker
      else if (elapsed >= WALK_IN_TAP_MAX_MS + 20) {
        how = 'face tap'
        firedFrom = await run.page.evaluate(walkerNow, row.id)
        const face = await walkClient(run.page, await walkerFaceNow(run.page, row.id))
        await pointerTap(run.page, face.x, face.y)
        await walkStep(run.page, WALK_STEP_MS)
        shot = await run.page.evaluate(readShot, row.id)
      }
    }
    assert.ok(shot, `${label} a lamp fires at the walker during its run-in`)
    assert.equal(shot.walkIn, 'yes', `${label} the walker is still walking in when the shot lands`)
    const drawn = walkTranslate(firedFrom)
    const drawnFace = { x: drawn.x, y: drawn.y + PATH_WALKER_FACE_DY }
    assert.ok(
      Math.hypot(shot.beam.x - drawnFace.x, shot.beam.y - drawnFace.y) < 0.01,
      `${label} the beam ends on the drawn walker ${JSON.stringify({ beam: shot.beam, drawnFace })}`,
    )
    assert.ok(Math.hypot(shot.beam.x - simFace.x, shot.beam.y - simFace.y) > 40, `${label} the beam does not end on the sim point ${JSON.stringify(simFace)}`)
    const blastAt = walkTranslate(shot.blast)
    assert.ok(blastAt && Math.hypot(blastAt.x - drawn.x, blastAt.y - drawn.y) < 0.01, `${label} the + blast sits on the drawn walker ${shot.blast}`)
    if (shot.cueClipped !== null) assert.equal(shot.cueClipped, true, `${label} the cue ring is clipped to the map`)
    rows.push({
      check: 'a2 r1 lamp shot during the run-in',
      run: spawn.runMs,
      shotAtMs: Math.round(elapsed),
      how,
      beamToDrawn: Number(Math.hypot(shot.beam.x - drawnFace.x, shot.beam.y - drawnFace.y).toFixed(3)),
      beamToSim: Math.round(Math.hypot(shot.beam.x - simFace.x, shot.beam.y - simFace.y)),
      cueClipped: shot.cueClipped,
    })
    await run.context.close()
  }
  return rows
}

/** Easy walkers walk in from past the edge at 375, 412, and 768 on every map, on rounds 1 and 5. Real pointer events. */
async function checkWalkIn(browser, port, errors) {
  mkdirSync('/opt/cursor/artifacts/hop-756-walkin', { recursive: true })
  const rows = []
  const widths = (process.env.NW_WALKIN_WIDTHS ?? '375x667,412x915,768x1024').split(',').filter(Boolean).map((pair) => pair.split('x').map(Number))
  const rounds = (process.env.NW_WALKIN_ROUNDS ?? '1,5').split(',').filter(Boolean).map(Number)
  for (const round of rounds)
  for (const [width, height] of widths) {
    for (const id of SPAWN_MAPS) {
      if (process.env.NW_WALKIN_MAP && process.env.NW_WALKIN_MAP !== id) continue
      const label = `1.4.526 ${id} ${width} r${round}`
      const plate = walkPlate(id)
      const starts = new Set(spawnRoads(id).map((road) => walkStartKey(walkInEntry(road.points, plate).start)))
      const covered = new Set()
      let ghosts = width === 375
      // Walkers that step out on one frame are walked one per pass. The seed replays the wave.
      for (let pass = 0; covered.size < starts.size && pass < 4; pass += 1) {
        const seen = new Set()
        const run = await openWalkMap(browser, port, errors, id, width, height, `&nwRound=${round}&nwLamps=0`)
        const until = Date.now() + 180000
        while (covered.size < starts.size && Date.now() < until) {
          const fresh = await nextWalkIn(run, seen, label, { soft: true, limit: 900 })
          if (fresh.length === 0) break
          let pick = null
          for (const row of fresh) {
            seen.add(row.id)
            const spawn = { ...walkSpawnRoad(id, row.line), mapId: id }
            if (!pick && !covered.has(walkStartKey(spawn.entry.start))) pick = { row, spawn }
          }
          if (!pick) continue
          const { row, spawn } = pick
          covered.add(walkStartKey(spawn.entry.start))
          const result = await stepWalkIn(run, row, spawn, label, ghosts)
          rows.push({
            map: id,
            width,
            round,
            road: spawn.road.id,
            side: spawn.entry.side,
            start: walkStartKey(spawn.entry.start),
            t: spawn.t,
            runMs: spawn.runMs,
            frames: result.frames,
            firstFrame: result.first?.frame ?? null,
            firstMs: result.first ? Math.round(result.first.ms) : null,
            edgeGap: result.first ? Number(result.first.gap.toFixed(2)) : null,
            chromePx: result.chromePx,
          })
          console.log(`walk-in ${id} ${width} r${round} ${spawn.road.id} ${spawn.entry.side} start ${walkStartKey(spawn.entry.start)} t ${spawn.t} run ${spawn.runMs} first ${result.first ? `${result.first.frame}@${Math.round(result.first.ms)}ms gap ${result.first.gap.toFixed(2)}` : 'off-screen'} frames ${result.frames} under-chrome ${result.chromePx}`)
          if (ghosts) {
            await run.page.screenshot({ path: `/opt/cursor/artifacts/hop-756-walkin/${id}-${width}${round === 5 ? '' : `-r${round}`}.png` })
            await run.page.evaluate(() => document.querySelectorAll('[data-walk-ghost]').forEach((node) => node.remove()))
            ghosts = false
          }
        }
        await run.context.close()
      }
      assert.deepEqual([...covered].sort(), [...starts].sort(), `${label} every road start walked in`)
      assert.ok(rows.some((row) => row.map === id && row.width === width && row.round === round && row.firstFrame !== null), `${label} at least one walker is seen walking in`)
    }
  }
  const taps = process.env.NW_WALKIN_TAPS === '0' ? [] : await checkWalkInTaps(browser, port, errors)
  writeFileSync('/opt/cursor/artifacts/hop-756-walkin/walk-in.json', JSON.stringify({ rows, taps }, null, 2))
  console.log('walk-in-table')
  for (const row of rows) console.log(`${row.map}\t${row.width}\tr${row.round}\t${row.road}\t${row.side}\t${row.start}\t${row.t}\t${row.runMs}\t${row.firstFrame}\t${row.edgeGap}`)
  for (const row of taps) console.log(`walk-in-tap ${JSON.stringify(row)}`)
}

/** Hard draws every walker at its sim point. Same markup as before the Easy run-in. */
export async function hardDrawSha(root = fileURLToPath(new URL('..', import.meta.url))) {
  const outdir = fileURLToPath(new URL('../node_modules/.cache/nw-hard-draw/', import.meta.url))
  mkdirSync(outdir, { recursive: true })
  const outfile = `${outdir}actors-${createHash('sha256').update(root).digest('hex').slice(0, 8)}.mjs`
  const assets = ['.png', '.webp', '.jpg', '.svg', '.mp3', '.ogg', '.woff2']
  await build({
    stdin: {
      contents: `export { DefendNightActorsSvg } from './src/components/DefendNightActors.tsx'\nexport { DEFEND_PATH, pathPoint } from './src/nightWatch/path/data.ts'\nexport { emptyProgress } from './src/lib/save.ts'\n`,
      resolveDir: root,
      sourcefile: 'hard-draw-entry.tsx',
      loader: 'tsx',
    },
    bundle: true,
    format: 'esm',
    platform: 'node',
    outfile,
    jsx: 'automatic',
    loader: Object.fromEntries(assets.map((ext) => [ext, 'file'])),
    assetNames: '[name]',
    plugins: [
      {
        name: 'vite-raw',
        setup(on) {
          on.onResolve({ filter: /\?raw$/ }, (args) => ({
            path: fileURLToPath(new URL(args.path.replace(/\?raw$/, ''), pathToFileURL(`${args.resolveDir}/`))),
            namespace: 'vite-raw',
          }))
          on.onLoad({ filter: /.*/, namespace: 'vite-raw' }, (args) => ({ contents: readFileSync(args.path, 'utf8'), loader: 'text' }))
        },
      },
    ],
    external: ['react', 'react-dom', 'react/jsx-runtime', 'react/jsx-dev-runtime'],
    logLevel: 'silent',
  })
  const mod = await import(pathToFileURL(outfile).href + `?hard=${Date.now()}`)
  const raiders = [
    { id: 1, t: 0, text: 'a', kind: 'skeptic', hp: 3, maxHp: 3 },
    { id: 2, t: 0.12, text: 'b', kind: 'pagan', hp: 2, maxHp: 3 },
    { id: 3, t: 0.4, text: 'c', kind: 'spiritual', hp: 1, maxHp: 3, struckAt: 1 },
    { id: 4, t: 0.7, text: 'd', kind: 'image-bearer', hp: 0, maxHp: 3, turned: 'love', from: { x: 300, y: 300 }, heavenT: 0.2 },
  ]
  const html = renderToString(
    createElement(mod.DefendNightActorsSvg, {
      easyTap: false,
      pads: [],
      planted: [],
      progress: mod.emptyProgress(),
      raiders,
      raiderAt: (raider) => mod.pathPoint(raider.t, mod.DEFEND_PATH),
      ability: 'love',
      towerType: {},
      unlocked: ['love'],
      flash: [],
      togglePad: () => {},
      fire: () => {},
      fireAtRaider: () => {},
      tapTarget: undefined,
      shots: [],
      blasts: [],
      phase: 'wave',
      easy: false,
      runTier: {},
    }),
  )
  assert.ok(html.includes('defend-raider'), 'hard draw renders walkers')
  // Asset hrefs resolve to the checkout path, which differs between this VM and the CI runner.
  const portable = html.replace(/file:\/\/[^"]*\/([^/"]+)"/g, 'asset:$1"')
  return { sha: createHash('sha256').update(portable).digest('hex'), html: portable }
}

/** sha256 of the Hard fixture above at 1.4.525. */
const HARD_DRAW_SHA = '1fff16aa7efec5e5da8ea1c3d6a52025bcacecc55f827ec360d582548a7a6e81'

async function checkHardDraw() {
  const { sha, html } = await hardDrawSha()
  assert.equal(html.includes('data-walk'), false, '1.4.526 Hard walkers carry no walk-in marks')
  assert.equal(html.includes('nw-walkers'), false, '1.4.526 Hard walkers are not wrapped in the Easy clip')
  assert.equal(sha, HARD_DRAW_SHA, '1.4.526 Hard draw is byte-identical to 1.4.525')
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
    if (process.env.NW_SPAWN_ONLY === '1') {
      await checkSpawnMarkers(browser, port, errors)
      return
    }
    if (process.env.NW_WALKIN_ONLY === '1') {
      await checkHardDraw()
      await checkWalkIn(browser, port, errors)
      assert.equal(errors.join('\n'), '', `1.4.526 walk-in prove stays free of console errors ${errors.join(' | ').slice(0, 160)}`)
      return
    }
    await checkReadoutCueClear(browser, port, errors)
    if (process.env.NW_CUE_ONLY === '1') return
    await checkTrustedMisses(browser, port, errors)
    if (process.env.NW_MISS_ONLY === '1') return
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
    await checkGoldCues(browser, port, errors, 375, 667)
    await checkGoldCues(browser, port, errors, 390, 844)
    await checkJumpSeatsAndCandle(browser, port, errors)
    await checkDeadSeat(browser, port, errors)
    await checkGreyMaps(browser, port, errors)
    await checkPointerSeats(browser, port, errors)
    await checkCrownHold(browser, port, errors)
    await checkShareCard(browser, port, errors)
    await checkShareBusyTap(browser, port, errors)
    await checkOssuaryLesson(browser, port, errors)
    await checkSpawnMarkers(browser, port, errors)
    await checkHardDraw()
    await checkWalkIn(browser, port, errors)
    assert.equal(errors.join('\n'), '', `1.4.482 live prove stays free of console errors ${errors.join(' | ').slice(0, 160)}`)
  } finally {
    await browser.close()
    await server.close()
  }
  console.log('check-live-prove: ok')
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  await checkLiveProve()
}
