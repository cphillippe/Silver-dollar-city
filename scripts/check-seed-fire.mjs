/**
 * Seeded Night Watch through the real DefendScreen (1.4.457).
 * Plants four pillars, runs round 1 with no face taps, and checks the lamps hurt.
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
  appVersion: '1.4.457',
  savedAt: '2026-10-11T00:00:00.000Z',
  progress: {
    started: true,
    easyMode: true,
    theme: 'candy',
    completed: [],
    lastDailyDate: '2026-10-10',
    held: [],
  },
}

const TYPES = ['love', 'logic', 'reason', 'science']
/** Seats that reach the road. The picture sits 26 units above the finger. */
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

async function openNight(page, seed) {
  await page.goto(`/?playtest=1&nwSeed=${seed}`)
  const begin = page.getByRole('button', { name: 'Begin the watch' }).first()
  await begin.waitFor({ timeout: 20_000 })
  if ((await page.locator('.defend-page').count()) === 0) {
    await begin.click()
    await page.locator('.defend-page').waitFor()
  }
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
    const onBoard = Boolean(hit && hit.closest('.defend-board'))
    return { x: client.x, y: client.y, covered, onBoard }
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
  const types = await page.locator('[data-tower-type]').evaluateAll((nodes) =>
    nodes.map((node) => node.getAttribute('data-tower-type')),
  )
  assert.equal(placed, 4, `four pillars are on the road, saw ${types.join(',') || 'none'}`)
}

async function beginRound(page) {
  const go = page.locator('.defend-go')
  await go.click()
  await page.locator('.defend-page.is-easy-tap').waitFor()
}

async function facesSoFar(page, seen, ms) {
  const start = Date.now()
  while (Date.now() - start < ms && seen.length < 4) {
    const faces = await page.locator('[data-face]').evaluateAll((nodes) =>
      nodes.map((node) => node.getAttribute('data-face')).filter(Boolean),
    )
    for (const face of faces) {
      if (!seen.includes(face)) seen.push(face)
    }
    await page.waitForTimeout(200)
  }
  return seen
}

/** Round 1, four pillars, no face taps. Lamps must deal damage and clear the round. */
export async function checkSeedFire() {
  const server = await createServer({ server: { host: '127.0.0.1', port: 0 } })
  await server.listen()
  const address = server.httpServer?.address()
  const port = address && typeof address === 'object' ? address.port : 0
  assert.ok(port > 0, '1.4.457 seed-fire server has a port')
  const base = `http://127.0.0.1:${port}/`
  const browser = await launchBrowser()
  try {
    const context = await browser.newContext({
      baseURL: base,
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 1,
      reducedMotion: 'reduce',
    })
    await context.addInitScript(
      (payload) => {
        localStorage.setItem(payload.key, JSON.stringify(payload.save))
      },
      { key: STORAGE_KEY, save: SAVE },
    )
    const page = await context.newPage()
    const errors = []
    page.on('pageerror', (error) => errors.push(String(error)))
    await openNight(page, 2)
    await plantFour(page)
    await beginRound(page)
    const faces2 = []
    let sawShot = false
    const started = Date.now()
    let outcome = 'running'
    let lampDamage = 0
    let sparks = 0
    while (Date.now() - started < 70_000) {
      await facesSoFar(page, faces2, 250)
      if (!sawShot && (await page.locator('.defend-shot, .is-flash, .is-lamp-hit').count()) > 0) {
        sawShot = true
      }
      const snap = await page.evaluate(() => {
        const hud = document.querySelector('.defend-hud')
        const page = document.querySelector('.defend-page')
        const sparks = document.querySelector('[aria-label^="Sparks:"]')
        return {
          damage: Number(hud?.getAttribute('data-lamp-damage') ?? '0'),
          sparks: sparks?.getAttribute('aria-label') ?? '',
          boost: page?.classList.contains('is-boost') ?? false,
          lost: page?.classList.contains('is-lost') ?? false,
          wave: document.querySelector('.defend-wave')?.textContent ?? '',
        }
      })
      lampDamage = snap.damage
      const sparkCount = Number(snap.sparks.replace(/[^\d]/g, '') || '0')
      sparks = sparkCount
      if (snap.lost) {
        outcome = 'lost'
        break
      }
      if (snap.boost || snap.wave.includes('Round 2')) {
        outcome = 'clear'
        break
      }
    }
    assert.equal(errors.join('\n'), '', '1.4.457 seeded night stays free of page errors')
    assert.equal(outcome, 'clear', `1.4.457 seed 2 clears round 1 (saw ${outcome}, damage ${lampDamage})`)
    assert.ok(lampDamage > 0, `1.4.457 seed 2 lamp damage is above 0 (saw ${lampDamage})`)
    assert.equal(sawShot, true, '1.4.457 seed 2 shows a lamp shot')
    assert.ok(sparks > 0, `1.4.457 seed 2 earns sparks from the lamps (saw ${sparks})`)
    assert.ok(faces2.length > 0, '1.4.457 seed 2 shows a walker face')

    const other = await context.newPage()
    await openNight(other, 4)
    await plantFour(other)
    await beginRound(other)
    const faces4 = await facesSoFar(other, [], 8000)
    assert.ok(faces4.length > 0, '1.4.457 seed 4 shows a walker face')
    assert.notDeepEqual(faces2, faces4, `1.4.457 seeds 2 and 4 show different walkers (${faces2} vs ${faces4})`)
    console.log(
      `seed-fire: seed 2 damage ${lampDamage} sparks ${sparks} shot yes clear faces ${faces2.join(',')} | seed 4 faces ${faces4.join(',')}`,
    )

    const bossContext = await browser.newContext({
      baseURL: base,
      viewport: { width: 375, height: 667 },
      deviceScaleFactor: 1,
      reducedMotion: 'reduce',
    })
    await bossContext.addInitScript(
      (payload) => localStorage.setItem(payload.key, JSON.stringify(payload.save)),
      { key: STORAGE_KEY, save: SAVE },
    )
    const bossPage = await bossContext.newPage()
    bossPage.on('pageerror', (error) => errors.push(String(error)))
    await bossPage.goto('/?playtest=1&nwSeed=2&nwRound=5')
    const bossBegin = bossPage.getByRole('button', { name: 'Begin the watch' }).first()
    await bossBegin.waitFor({ timeout: 20_000 })
    if ((await bossPage.locator('.defend-page').count()) === 0) await bossBegin.click()
    await bossPage.locator('.defend-page').waitFor()
    const bossGo = bossPage.locator('.defend-go')
    if ((await bossGo.count()) && !(await bossGo.isDisabled())) await bossGo.click()
    await bossPage.locator('.defend-page.is-easy-tap').waitFor({ timeout: 20_000 })
    // 1.4.434 and 1.4.459 both let a round 5 boss take taps and lose no health.
    // The city scan opens the real Easy screen and fails if a glowing tap deals 0.
    const glowing = bossPage.locator('[data-boss="yes"].is-easy-cue').first()
    await glowing.waitFor({ timeout: 40_000 })
    const beforeHp = Number(await bossPage.locator('[data-boss-hp]').getAttribute('data-boss-hp'))
    const beforeDmg = Number((await bossPage.locator('[data-tap-damage]').getAttribute('data-tap-damage')) ?? '0')
    const face = await glowing.getAttribute('data-face')
    const walkerId = await glowing.getAttribute('data-walker-id')
    assert.ok(face, '1.4.460 the round 5 boss is wearing a head')
    assert.ok(walkerId, '1.4.460 the boss carries its walker id')
    assert.ok(beforeHp > 0, `1.4.460 the round 5 boss is on the road (saw ${beforeHp})`)
    const faceBox = await glowing.locator('.defend-raider-face').boundingBox()
    assert.ok(faceBox, '1.4.460 the glowing round 5 boss has a face to tap')
    const aim = { x: faceBox.x + faceBox.width / 2, y: faceBox.y + faceBox.height / 2 }
    const hit = await bossPage.evaluate(({ x, y }) => {
      const node = document.elementFromPoint(x, y)
      const walker = node?.closest?.('[data-boss="yes"]')
      return {
        className: node?.getAttribute?.('class') ?? '',
        boss: walker?.getAttribute('data-boss') ?? '',
        glowing: walker?.classList.contains('is-easy-cue') ?? false,
      }
    }, aim)
    assert.equal(hit.boss, 'yes', '1.4.460 the glowing tap lands on the round 5 boss')
    assert.equal(hit.glowing, true, '1.4.460 that boss is the glowing face')
    await bossPage.mouse.click(aim.x, aim.y)
    await bossPage.waitForTimeout(400)
    const afterHp = Number(await bossPage.locator('[data-boss-hp]').getAttribute('data-boss-hp'))
    const afterDmg = Number((await bossPage.locator('[data-tap-damage]').getAttribute('data-tap-damage')) ?? '0')
    const lost = beforeHp - afterHp
    assert.ok(
      lost > 0,
      `1.4.460 a glowing tap on the round 5 boss deals more than 0 damage (lost ${lost}, hp ${beforeHp} -> ${afterHp}, tap ${afterDmg - beforeDmg}, hit ${hit.className})`,
    )
    assert.equal(errors.join('\n'), '', '1.4.460 crowned boss tap stays free of page errors')
    console.log(`boss-tap: seed 2 face ${face} glowing ${beforeHp} -> ${afterHp} lost ${lost}`)
    await bossContext.close()
    await context.close()
  } finally {
    await browser.close()
    await server.close()
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  await checkSeedFire()
  console.log('check-seed-fire: ok')
}
