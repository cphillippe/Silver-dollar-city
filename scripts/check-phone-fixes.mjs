/**
 * Phone Night Watch (1.4.478).
 * The map sheet, the clear-bar buttons, and a walker beside a lamp.
 */
import assert from 'node:assert/strict'
import { mkdirSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createServer } from 'vite'
import { chromium } from '@playwright/test'
import { SAVE_KIND } from '../src/lib/save.ts'
import { SAVE_SCHEMA_VERSION, STORAGE_KEY } from '../src/config/app.ts'
import { LAMP_GLYPH_COLOR } from '../src/nightWatch/lampGlyph.ts'
import { LAMP_ART_HALF_UNITS, LAMP_ART_UP_UNITS } from '../src/nightWatch/lampGlyphPlace.ts'
import { BRIGHT_LINE, LESSON_LOCK, PATH_LINE, TREE_LOCK } from '../src/nightWatch/upgradeTree.ts'
import { EASY } from '../src/lib/easyUi.ts'
import { shortestMazePath } from '../src/lib/roadMaze.ts'
import { withPlaytest1 } from './dev-ui-playtest.mjs'

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
  [390, 844],
  [412, 915],
  [412, 732],
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

const SHOTS = join(tmpdir(), 'cursor-phone-fixes-shots')
mkdirSync(SHOTS, { recursive: true })

async function assertHeavenClear(page, label, shot = '') {
  const read = () =>
    page.evaluate(() => {
      const sign = document.querySelector('g.defend-heaven')
      const a = sign?.getBoundingClientRect()
      const rail = document.querySelector('.nw-rail .defend-abilities')
      const b = rail?.getBoundingClientRect()
      if (!a || !b || a.width < 1 || b.width < 1) return { hit: 'missing' }
      const label = sign.querySelector('.defend-heaven-label')
      const text = label && getComputedStyle(label).display !== 'none' ? label.getBoundingClientRect() : null
      const markers = [...document.querySelectorAll('.nw-spawn-marker')]
        .map((el) => el.getBoundingClientRect())
        .filter((box) => box.width > 1 && box.height > 1)
      return {
        hit: a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top,
        labelGap: text ? b.left - text.right : null,
        marker: markers.some((m) => a.left < m.right && a.right > m.left && a.top < m.bottom && a.bottom > m.top),
      }
    })
  let seen = await read()
  for (let i = 0; i < 10 && seen.hit !== false; i += 1) {
    await page.waitForTimeout(100)
    seen = await read()
  }
  assert.equal(seen.hit, false, `#792 ${label} Heaven sign clear of the lamp rail`)
  if (seen.labelGap !== null) assert.ok(seen.labelGap >= 4, `#792 ${label} Heaven label ends 4px left of the rail (${seen.labelGap})`)
  assert.equal(seen.marker, false, `#792 ${label} Heaven sign stays off the spawn arches`)
  if (shot) await page.screenshot({ path: `${SHOTS}/${shot}.png` })
}

async function assertReadoutClear(page, label) {
  const hit = await page.evaluate(() => {
    const pill = document.querySelector('.nw-tap-readout')?.getBoundingClientRect()
    if (!pill || pill.width < 2 || pill.height < 2) return false
    return [...document.querySelectorAll('.defend-clear-lamp')].some((lamp) => {
      const box = lamp.getBoundingClientRect()
      return box.width > 1 && pill.left < box.right && pill.right > box.left && pill.top < box.bottom && pill.bottom > box.top
    })
  })
  assert.equal(hit, false, `#792 ${label} readout pill avoids the lamp pins`)
}

async function openNight(page) {
  await page.goto('/?playtest=1&nwCam=0')
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


const NW_MAPS = ['a2', 'far-hills', 'map03', 'map04', 'map05', 'map06']
const NW_LIVE = { a2: 5, 'far-hills': 8, map03: 11, map04: 7, map05: 3, map06: 7 }
const NW_SIZES = [
  [375, 667],
  [390, 844],
  [412, 915],
]
/** Dead seat paint on 1.4.510 main. B6 only changes when it shows. */
const DEAD_FILL = 'rgba(72, 76, 86, 0.5)'
const DEAD_STROKE = 'rgba(154, 158, 168, 0.78)'
/** Measured on 1.4.528 main: clear to an enabled Continue. */
/** Begin → first walker on a2 round 2 with motion (#756): mean ~2390 ms on 2026-10-28 main (NWUI-8 regression band only). */
const MAIN_FIRST_WALKER_MS = 2390
const MAIN_CONTINUE_MS = 0
const FIRST_WALKER_VISIBLE_CEILING_MS = 35_000
/** Measured .nw-hud strip height on live 1.4.551 Easy at 375×667 (border box). */
const EASY_HUD_STRIP_HEIGHT_MAIN_375 = 48

/** Hearts, wave pill, TAP line, and pace chip stay on one row without overlapping. */
async function assertHudCrowding(page, label) {
  const read = await page.evaluate(() => {
    const pick = (sel) => {
      const node = document.querySelector(sel)
      if (!node) return null
      const st = getComputedStyle(node)
      if (st.display === 'none' || st.visibility === 'hidden') return null
      const b = node.getBoundingClientRect()
      if (b.width < 2 || b.height < 2) return null
      return { sel, left: b.left, top: b.top, right: b.right, bottom: b.bottom }
    }
    const parts = [
      pick('.defend-hearts'),
      pick('.nw-wave-overlay .defend-wave'),
      pick('.defend-count'),
      pick('.nw-hud > .nw-pace'),
    ].filter(Boolean)
    const clashes = []
    for (let i = 0; i < parts.length; i += 1) {
      for (let j = i + 1; j < parts.length; j += 1) {
        const a = parts[i]
        const b = parts[j]
        const ox = Math.min(a.right, b.right) - Math.max(a.left, b.left)
        const oy = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top)
        if (ox > 0.5 && oy > 0.5) clashes.push([a.sel, b.sel, ox, oy])
      }
    }
    const hud = document.querySelector('.nw-hud')?.getBoundingClientRect()
    return {
      parts: parts.map((p) => p.sel),
      clashes,
      hudHeight: hud ? hud.height : null,
      hudBottom: hud ? hud.bottom : null,
    }
  })
  assert.deepEqual(read.clashes, [], `#868 ${label} HUD row has no overlaps ${JSON.stringify(read)}`)
  assert.ok(read.parts.length >= 3, `#868 ${label} HUD row parts render ${JSON.stringify(read.parts)}`)
  return read
}

async function panBoard(page, dx, dy) {
  const pan = page.locator('.nw-pan').first()
  const box = (await pan.count()) ? await pan.boundingBox() : await page.locator('.defend-frame').boundingBox()
  assert.ok(box, 'nw-pan for camera drag')
  const x0 = box.x + box.width * 0.5
  const y0 = box.y + box.height * 0.35
  await page.mouse.move(x0, y0)
  await page.mouse.down()
  await page.mouse.move(x0 + dx, y0 + dy, { steps: 12 })
  await page.mouse.up()
  await page.waitForTimeout(120)
}

/** After Begin, wait until a walker has a visible box (not a fixed run-in delay). */
async function waitForFirstWalkerVisible(page, ceilingMs = FIRST_WALKER_VISIBLE_CEILING_MS) {
  const t0 = Date.now()
  while (Date.now() - t0 < ceilingMs) {
    const seen = await page.evaluate(() => {
      for (const node of document.querySelectorAll('.easy-walker, [data-walker-id], [data-walker-tap]')) {
        const b = node.getBoundingClientRect()
        if (b.width > 1 && b.height > 1) return true
      }
      return false
    })
    if (seen) return Date.now() - t0
    await page.waitForTimeout(50)
  }
  assert.fail(`first walker visible within ${ceilingMs}ms`)
}

async function openMap(browser, port, width, height, map, { motion = false, search = '?playtest=1&nwSeed=2' } = {}) {
  const context = await browser.newContext({
    baseURL: `http://127.0.0.1:${port}/`,
    viewport: { width, height },
    deviceScaleFactor: 1,
    reducedMotion: motion ? 'no-preference' : 'reduce',
  })
  await context.addInitScript(
    (payload) => localStorage.setItem(payload.key, JSON.stringify(payload.save)),
    { key: STORAGE_KEY, save: SAVE },
  )
  const page = await context.newPage()
  const query = search.includes('nwCam=') ? search : `${search}&nwCam=0`
  await page.goto(map === 'a2' ? `/${query}` : `${query}&nwMap=${map}`)
  await page.getByRole('button', { name: 'Settings' }).click()
  await page.locator('summary', { hasText: 'Developer' }).click()
  await page.getByRole('button', { name: 'Jump · Night Watch' }).click()
  await page.locator('.defend-board').waitFor()
  if (await page.locator('[data-map-overlay]').count()) {
    await page.locator(`[data-map="${map}"]`).click()
    await page.locator('[data-map-overlay]').waitFor({ state: 'detached' })
  }
  return { context, page }
}

/** Client point of the first live seat that takes the tap (finger sits 26 units under the seat). */
async function firstLiveSeat(page) {
  const seat = await page.evaluate(() => {
    const svg = document.querySelector('.defend-board')
    const ctm = svg?.getScreenCTM()
    if (!svg || !ctm) return null
    for (const ring of document.querySelectorAll('.defend-plant-ground circle.is-live')) {
      const p = svg.createSVGPoint()
      p.x = Number(ring.getAttribute('cx'))
      p.y = Number(ring.getAttribute('cy')) - 26
      const q = p.matrixTransform(ctm)
      const hit = document.elementFromPoint(q.x, q.y)
      if (hit && hit.closest('.defend-board') && !hit.closest('button, .nw-rail, .nw-docks')) return { x: q.x, y: q.y }
    }
    return null
  })
  assert.ok(seat, '#792b a live seat takes the tap')
  return seat
}

function inside(box, frame, slack = 1) {
  return box.left >= frame.left - slack && box.right <= frame.right + slack && box.top >= frame.top - slack && box.bottom <= frame.bottom + slack
}

async function frameBoxes(page, selector) {
  return page.evaluate(
    ([sel]) => {
      const frame = document.querySelector('.defend-frame').getBoundingClientRect()
      const f = { left: frame.left, right: frame.right, top: frame.top, bottom: frame.bottom }
      const boxes = [...document.querySelectorAll(sel)]
        .filter((node) => node.getClientRects().length > 0)
        .map((node) => {
          const b = node.getBoundingClientRect()
          return { left: b.left, right: b.right, top: b.top, bottom: b.bottom, width: b.width, height: b.height }
        })
        .filter((b) => b.width > 1 && b.height > 1)
      return { frame: f, boxes }
    },
    [selector],
  )
}

async function assertArchInside(page, label) {
  for (let i = 0; i < 4; i += 1) {
    const { frame, boxes } = await frameBoxes(page, '.nw-spawn-marker')
    for (const box of boxes) assert.ok(inside(box, frame), `#792b B8 ${label} spawn arch is inside the frame ${JSON.stringify({ box, frame })}`)
    await page.waitForTimeout(200)
  }
}

/** B6 + NW1 + NW2 + B8 on every map, plant step. */
async function check792bPlant(browser, port, errors) {
  for (const map of NW_MAPS) {
    for (const [width, height] of NW_SIZES) {
      const label = `${map} ${width}x${height}`
      const { context, page } = await openMap(browser, port, width, height, map)
      page.on('pageerror', (error) => errors.push(`${label} ${error}`))
      const root = page.locator('.defend-page')
      assert.equal(await root.getAttribute('data-lamp-picked'), null, `#792b B6 ${label} no lamp is picked yet`)
      const before = await page.evaluate(() =>
        [...document.querySelectorAll('.defend-plant-ground circle.is-dead')].map((c) => getComputedStyle(c).display),
      )
      assert.ok(before.every((d) => d === 'none'), `#792b B6 ${label} grey rings are hidden before a lamp is picked ${before}`)
      await assertArchInside(page, `${label} plant`)

      await page.locator('[data-type="love"]').click()
      await root.and(page.locator('[data-lamp-picked="yes"]')).waitFor()
      const seen = await page.evaluate(
        ([deadFill, deadStroke]) => {
          const svg = document.querySelector('.defend-board')
          const rings = [...document.querySelectorAll('.defend-plant-ground circle')].filter((c) => c.getClientRects().length > 0)
          const dead = rings.filter((c) => c.classList.contains('is-dead'))
          const paint = dead.map((c) => ({ fill: getComputedStyle(c).fill, stroke: getComputedStyle(c).stroke }))
          let through = null
          for (const ring of dead) {
            const b = ring.getBoundingClientRect()
            const x = b.left + b.width / 2
            const y = b.top + b.height / 2
            const hit = document.elementFromPoint(x, y)
            if (!hit || hit.closest('button, .nw-rail, .nw-docks, .nw-balloon-slot')) continue
            through = { inRing: Boolean(hit.closest('.defend-plant-ground')), onBoard: Boolean(hit.closest('.defend-board')) }
            break
          }
          return {
            live: document.querySelectorAll('.defend-plant-ground circle.is-live').length,
            deadCount: dead.length,
            paintOk: paint.every((p) => p.fill === deadFill && p.stroke === deadStroke),
            paint: paint[0],
            through,
            ptr: rings.every((c) => getComputedStyle(c).pointerEvents === 'none'),
            hasBoard: Boolean(svg),
          }
        },
        [DEAD_FILL, DEAD_STROKE],
      )
      assert.equal(seen.live, NW_LIVE[map], `#792b NW1 ${label} keeps every live seat (${seen.live})`)
      assert.equal(seen.paintOk, true, `#792b B6 ${label} dead rings paint as on main ${JSON.stringify(seen.paint)}`)
      assert.equal(seen.ptr, true, `#792b B6 ${label} rings take no pointer`)
      if (seen.through) {
        assert.equal(seen.through.inRing, false, `#792b B6 ${label} a tap at a dead seat centre reaches the board, not the ring`)
        assert.equal(seen.through.onBoard, true, `#792b B6 ${label} the node under a dead ring is the board`)
      }
      const rings = await frameBoxes(page, '.defend-plant-ground circle')
      for (const box of rings.boxes) assert.ok(inside(box, rings.frame), `#792b NW1 ${label} every rendered ring is inside the frame ${JSON.stringify(box)}`)

      const hud = await page.evaluate(() => {
        const box = (sel) => {
          const node = document.querySelector(sel)
          if (!node) return null
          const b = node.getBoundingClientRect()
          return { left: b.left, right: b.right, top: b.top, bottom: b.bottom, width: b.width, height: b.height }
        }
        const tray = [...document.querySelectorAll('.nw-skill-tray .btn')].map((n) => {
          const b = n.getBoundingClientRect()
          return { left: b.left, right: b.right, top: b.top, bottom: b.bottom }
        })
        return { balloon: box('.nw-balloon'), candle: box('.defend-candle-lamp'), cross: box('.defend-cross-lamp'), tray }
      })
      if (map !== 'a2') {
        assert.ok(hud.candle && hud.balloon, `#792b NW2 ${label} has Candle and the Sparks balloon`)
        assert.ok(hud.candle.top >= hud.balloon.bottom + 4 - 0.5, `#792b NW2 ${label} Candle sits 4px below the Sparks balloon ${JSON.stringify(hud)}`)
      }
      if (hud.cross) {
        for (const btn of hud.tray) {
          const hit = hud.cross.left < btn.right && hud.cross.right > btn.left && hud.cross.top < btn.bottom && hud.cross.bottom > btn.top
          assert.equal(hit, false, `#792b NW2 ${label} Cross stays off the skill tray`)
        }
      }
      await context.close()
    }
  }
}

/** B7 on the plant step: the Sparks stack, its neighbours, and the minimum type size. */
async function assertSparksStack(page, label) {
  const read = await page.evaluate(() => {
    const box = (node) => {
      const b = node.getBoundingClientRect()
      return { left: b.left, right: b.right, top: b.top, bottom: b.bottom, width: b.width, height: b.height }
    }
    const one = (sel) => {
      const node = document.querySelector(sel)
      return node ? { ...box(node), font: Number.parseFloat(getComputedStyle(node).fontSize), shown: getComputedStyle(node).display !== 'none' && getComputedStyle(node).visibility !== 'hidden' } : null
    }
    const others = ['.nw-coin', '.defend-candle-lamp', '.nw-wave-count', '.nw-wave-survived', '.nw-tap-readout', '.match-toast', '[data-place-toast]']
      .map((sel) => [sel, [...document.querySelectorAll(sel)].map(box).filter((b) => b.width > 1 && b.height > 1)])
    return { orb: one('.nw-balloon-orb'), count: one('.nw-balloon-count'), label: one('.nw-balloon-label'), others }
  })
  assert.ok(read.orb && read.count && read.label, `#792b B7 ${label} the Sparks orb, count and label render`)
  for (const part of [read.orb, read.count, read.label]) assert.equal(part.shown, true, `#792b B7 ${label} the Sparks stack is visible`)
  assert.ok(read.count.font >= 11.2 - 0.1, `#792b B7 ${label} the count keeps its main font size (${read.count.font})`)
  assert.ok(read.label.font >= 9.28 - 0.1, `#792b B7 ${label} the label keeps its main font size (${read.label.font})`)
  const hit = (a, b) => a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top
  for (const [sel, boxes] of read.others) {
    for (const other of boxes) {
      for (const part of [read.orb, read.count, read.label]) assert.equal(hit(part, other), false, `#792b B7 ${label} the Sparks stack clears ${sel}`)
    }
  }
}

/** First plant: the card stays off Begin and short (NWUI-5). */
async function check792bPlantCard(browser, port, errors) {
  for (const [width, height] of [[375, 667], [390, 844]]) {
    for (const map of ['map06', 'a2']) {
      const label = `${map} ${width}x${height}`
      const { context, page } = await openMap(browser, port, width, height, map)
      page.on('pageerror', (error) => errors.push(`${label} ${error}`))
      await page.locator('[data-type="love"]').click()
      const seat = await firstLiveSeat(page)
      await page.mouse.click(seat.x, seat.y)
      await page.locator('[data-tower-type]').first().waitFor()
      await page.locator('.defend-clear-lamp').first().click()
      await page.locator('.defend-tower-card').waitFor()
      const read = await page.evaluate(() => {
        const card = document.querySelector('.defend-tower-card').getBoundingClientRect()
        const go = document.querySelector('.defend-go').getBoundingClientRect()
        const hit = document.elementFromPoint(go.left + go.width / 2, go.top + go.height / 2)
        const lines = [...document.querySelectorAll('.defend-tower-card .defend-path-line')].map((n) => ({
          display: getComputedStyle(n).display,
          width: n.getBoundingClientRect().width,
        }))
        const buys = [...document.querySelectorAll('.defend-tower-card .defend-path-buy')].map((n) => n.getBoundingClientRect().height)
        return { cardBottom: card.bottom, cardHeight: card.height, goTop: go.top, begin: Boolean(hit?.closest('.defend-go')), lines, buys }
      })
      assert.ok(read.cardBottom <= read.goTop - 8, `#792b NWUI-5 ${label} the card ends 8px above Begin ${JSON.stringify(read)}`)
      assert.equal(read.begin, true, `#792b NWUI-5 ${label} Begin takes the tap at its centre`)
      assert.ok(read.cardHeight < 260, `#792b NWUI-5 ${label} the card is short (${read.cardHeight})`)
      for (const line of read.lines) {
        assert.notEqual(line.display, 'none', `#792b NWUI-5 ${label} the reach lines stay in the page for scan readers`)
        assert.ok(line.width <= 1, `#792b NWUI-5 ${label} the reach lines are clipped, not shown`)
      }
      for (const h of read.buys) assert.ok(h >= 44, `#792b NWUI-5 ${label} buy buttons stay 44px (${h})`)
      await page.locator('.defend-go').click()
      await page.locator('.defend-page.is-easy-tap').waitFor()
      await context.close()
    }
  }
}

/** #768 / NWUI-2: the pace chip must never sit on top of a walker tap centre (cam on or off). */
async function check768WalkerTapProbe(browser, port, errors) {
  const rows = []
  for (const [width, height] of [
    [375, 667],
    [390, 844],
  ]) {
    for (const camOn of [true, false]) {
      for (const map of NW_MAPS) {
        const label = `${map} ${width}x${height} cam=${camOn ? 'on' : 'off'}`
        const { context, page } = await openMap(browser, port, width, height, map, {
          motion: true,
          search: `?playtest=1&nwSeed=2&nwRound=5&nwLamps=0&nwCam=${camOn ? '1' : '0'}`,
        })
        page.on('pageerror', (error) => errors.push(`${label} ${error}`))
        if (await page.locator('#defend-plant-first').count()) {
          await page.locator('[data-type="love"]').click()
          const seat = await firstLiveSeat(page)
          assert.ok(seat, `#768 ${label} has a live seat for the first plant`)
          await page.mouse.click(seat.x, seat.y)
          await page.locator('[data-tower-type]').first().waitFor({ timeout: 30_000 })
        }
        await page.locator('.defend-go').click()
        await page.locator('.defend-page.is-easy-tap').waitFor({ timeout: 120_000 })
        await waitForFirstWalkerVisible(page)
        await page.locator('.defend-walker-tap').first().waitFor({ timeout: 60_000 })
        let samples = 0
        let covers = 0
        for (let tick = 0; tick < 90; tick += 1) {
          if (tick > 0) await page.waitForTimeout(150)
          const read = await page.evaluate(() => {
            const taps = [...document.querySelectorAll('.defend-walker-tap')].filter((node) => {
              const b = node.getBoundingClientRect()
              return b.width > 1 && b.height > 1
            })
            let samples = 0
            let covers = 0
            for (const btn of taps) {
              const b = btn.getBoundingClientRect()
              const visLeft = Math.max(b.left, 0)
              const visRight = Math.min(b.right, window.innerWidth)
              const visTop = Math.max(b.top, 0)
              const visBottom = Math.min(b.bottom, window.innerHeight)
              if (visRight - visLeft < 8 || visBottom - visTop < 8) continue
              const x = (visLeft + visRight) / 2
              const y = (visTop + visBottom) / 2
              const top = document.elementFromPoint(x, y)
              samples += 1
              if (top?.closest('.nw-pace') || top?.closest('.nw-hud')) covers += 1
            }
            return { samples, covers }
          })
          samples += read.samples
          covers += read.covers
        }
        assert.ok(samples > 0, `#768 ${label} sampled walker tap centres during the wave (${samples})`)
        assert.equal(covers, 0, `#768 ${label} pace chip covers (${covers}) must be 0`)
        rows.push({ map, width, height, cam: camOn ? 'on' : 'off', samples, covers })
        if (camOn && map === 'a2') {
          await page.screenshot({
            path: join(SHOTS, `nw-pace-hud-${width}x${height}-cam-on.png`),
            fullPage: false,
          })
        }
        await context.close()
      }
    }
  }
  console.log('#768 walker tap probe (samples / pace covers):')
  for (const row of rows) {
    console.log(
      `  ${row.map} ${row.width}x${row.height} cam=${row.cam} samples=${row.samples} covers=${row.covers}`,
    )
  }
}

/** Read stage / HUD / chrome layout for #868 cam-on regression checks. */
async function measure868CamOnLayout(page) {
  return page.evaluate(() => {
    const box = (node) => {
      if (!node) return null
      const st = getComputedStyle(node)
      if (st.display === 'none' || st.visibility === 'hidden') return null
      const b = node.getBoundingClientRect()
      if (b.width < 1 || b.height < 1) return null
      return { top: b.top, bottom: b.bottom, left: b.left, right: b.right }
    }
    const overlaps = (a, b) =>
      Boolean(a && b && a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top)
    const hud = box(document.querySelector('.nw-hud'))
    const stage = box(document.querySelector('.nw-stage'))
    const balloon =
      box(document.querySelector('.nw-balloon-slot')) || box(document.querySelector('.nw-balloon'))
    const railNode =
      document.querySelector('.nw-rail .defend-abilities button') ||
      document.querySelector('.nw-rail .defend-abilities [data-type]')
    const rail = box(railNode)
    const pace = box(document.querySelector('.nw-hud > .nw-pace'))
    const wave = box(document.querySelector('.nw-wave-overlay .defend-wave'))
    const walkers = [...document.querySelectorAll('.defend-walker-tap')]
      .map((btn) => {
        const b = btn.getBoundingClientRect()
        if (b.width < 8 || b.height < 8) return null
        return { cx: (b.left + b.right) / 2, cy: (b.top + b.bottom) / 2 }
      })
      .filter(Boolean)
    return { hud, stage, balloon, rail, pace, wave, walkers, viewportH: window.innerHeight }
  })
}

function rectsOverlap(a, b) {
  return Boolean(a && b && a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top)
}

function assert868CamOnLayout(
  read,
  label,
  { hudBottomLimit = 89.5, requirePace = true, requireWave = true, requireWalkers = true } = {},
) {
  assert.ok(read.hud && read.stage, `#868 ${label} HUD and stage render`)
  assert.ok(
    read.stage.top >= read.hud.bottom - 0.5,
    `#868 ${label} stage top ${read.stage.top} sits at or below HUD bottom ${read.hud.bottom}`,
  )
  assert.ok(
    read.hud.bottom <= hudBottomLimit + 0.5,
    `#868 ${label} HUD bottom ${read.hud.bottom} <= ${hudBottomLimit}`,
  )
  if (read.balloon) {
    assert.ok(read.balloon.top >= -0.5, `#868 ${label} Sparks balloon top on screen (${read.balloon.top})`)
    assert.ok(
      read.balloon.bottom <= read.viewportH + 0.5,
      `#868 ${label} Sparks balloon bottom on screen (${read.balloon.bottom})`,
    )
    assert.ok(!rectsOverlap(read.balloon, read.hud), `#868 ${label} Sparks balloon clear of HUD`)
    if (read.pace) {
      assert.ok(!rectsOverlap(read.balloon, read.pace), `#868 ${label} Sparks balloon clear of pace chip`)
    }
  }
  assert.ok(read.rail, `#868 ${label} first rail card renders`)
  assert.ok(!rectsOverlap(read.rail, read.hud), `#868 ${label} first rail card clear of HUD`)
  if (read.pace) {
    assert.ok(!rectsOverlap(read.rail, read.pace), `#868 ${label} first rail card clear of pace chip`)
  } else if (requirePace) {
    assert.fail(`#868 ${label} pace chip renders in the HUD`)
  }
  if (read.wave) {
    assert.ok(
      !rectsOverlap(read.wave, read.hud),
      `#868 ${label} wave pill clear of HUD (${JSON.stringify(read.wave)} / hud ${read.hud.bottom})`,
    )
  } else if (requireWave) {
    assert.fail(`#868 ${label} wave pill renders`)
  }
  if (requireWalkers) {
    const underHud = read.walkers.filter((w) => w.cy < read.hud.bottom - 0.5)
    assert.deepEqual(
      underHud,
      [],
      `#868 ${label} no walker tap centre above HUD bottom ${read.hud.bottom} (${JSON.stringify(underHud)})`,
    )
  }
}

/** #868 cam on at 375/390: stage stays put at Begin; chrome stays visible under the pass-through HUD. */
async function check868Map04HudWalkerTap(browser, port, errors) {
  const stageTopLog = []
  for (const [width, height] of [
    [375, 667],
    [390, 844],
  ]) {
    const label = `a2 ${width}x${height} cam=on`
    const { context, page } = await openMap(browser, port, width, height, 'a2', {
      motion: true,
      search: '?playtest=1&nwSeed=2&nwRound=3&nwCam=1',
    })
    page.on('pageerror', (error) => errors.push(`${label} ${error}`))
    if (await page.locator('#defend-plant-first').count()) {
      await page.locator('[data-type="love"]').click()
      const seat = await firstLiveSeat(page)
      assert.ok(seat, `#868 ${label} has a live seat for the first plant`)
      await page.mouse.click(seat.x, seat.y)
      await page.locator('[data-tower-type]').first().waitFor({ timeout: 30_000 })
    }
    await page.waitForTimeout(400)
    const before = await measure868CamOnLayout(page)
    assert868CamOnLayout(before, `${label} pre-Begin`, { requirePace: false, requireWave: false, requireWalkers: false })

    await page.locator('.defend-go').click({ force: true, timeout: 120_000 })
    await page.locator('.defend-page.is-easy-tap').waitFor({ timeout: 120_000 })
    await page.locator('.nw-pace').waitFor({ timeout: 60_000 })
    await waitForFirstWalkerVisible(page)
    await page.locator('.defend-walker-tap').first().waitFor({ timeout: 60_000 })
    await page.waitForTimeout(400)
    const after = await measure868CamOnLayout(page)
    assert868CamOnLayout(after, `${label} mid-wave`)

    assert.ok(
      Math.abs(before.stage.top - after.stage.top) <= 1,
      `#868 ${label} stage top stable pre-Begin ${before.stage.top} -> mid-wave ${after.stage.top}`,
    )
    stageTopLog.push({
      size: `${width}x${height}`,
      preBegin: before.stage.top,
      midWave: after.stage.top,
      hudBottom: after.hud.bottom,
    })
    await page.screenshot({ path: `${SHOTS}/nw-hud-crowd-${width}x${height}-cam-on.png` })
    await context.close()
  }
  console.log('#868 cam-on stage tops (pre-Begin -> mid-wave, HUD bottom):')
  for (const row of stageTopLog) {
    console.log(`  ${row.size} stage ${row.preBegin} -> ${row.midWave} hudBottom=${row.hudBottom}`)
  }
}

/** #768 Easy cam-off: board drags must not tap or plant; jittery slow taps still hit walkers. */
async function check768CamOffEasyDragGuard(browser, port, errors) {
  const width = 768
  const height = 1024
  const label = `a2 ${width}x${height} cam=off`
  const { context, page } = await openMap(browser, port, width, height, 'a2', {
    motion: true,
    search: '?playtest=1&nwSeed=2&nwRound=3&nwCam=0',
  })
  page.on('pageerror', (error) => errors.push(`${label} ${error}`))
  if (await page.locator('#defend-plant-first').count()) {
    await page.locator('[data-type="love"]').click()
    const seat = await firstLiveSeat(page)
    assert.ok(seat, `#768 ${label} has a live seat for the first plant`)
    await page.mouse.click(seat.x, seat.y)
    await page.locator('[data-tower-type]').first().waitFor({ timeout: 30_000 })
  }
  await page.locator('.defend-go').waitFor({ state: 'visible', timeout: 60_000 })
  await page.waitForTimeout(400)
  await page.locator('.defend-go').click({ force: true, timeout: 120_000 })
  await page.locator('.defend-page.is-easy-tap').waitFor({ timeout: 120_000 })
  await waitForFirstWalkerVisible(page)

  const stats = async () => {
    const taps = await tapTotals(page)
    const lamps = await page.locator('[data-tower-type]').count()
    return { ...taps, lamps }
  }

  const start = await stats()
  const frame = await page.locator('.defend-frame').boundingBox()
  assert.ok(frame, `#768 ${label} defend-frame drag surface renders`)
  const dragPaths = [
    [120, 0],
    [-140, 40],
    [0, 160],
    [90, -120],
    [-100, -80],
  ]
  for (const [dx, dy] of dragPaths) {
    const x0 = frame.x + frame.width * 0.52
    const y0 = frame.y + frame.height * 0.42
    await page.mouse.move(x0, y0)
    await page.mouse.down()
    await page.mouse.move(x0 + dx, y0 + dy, { steps: 14 })
    await page.mouse.up()
    await page.waitForTimeout(120)
  }
  const afterDrags = await stats()
  assert.equal(afterDrags.hits, start.hits, `#768 ${label} drags keep hits at ${start.hits}`)
  assert.equal(afterDrags.misses, start.misses, `#768 ${label} drags keep misses at ${start.misses}`)
  assert.equal(afterDrags.lamps, start.lamps, `#768 ${label} drags keep lamp count at ${start.lamps}`)

  let spot = null
  const huntStart = Date.now()
  while (Date.now() - huntStart < 45_000 && !spot) {
    spot = await page.evaluate(() => {
      for (const btn of document.querySelectorAll('.defend-walker-tap')) {
        const b = btn.getBoundingClientRect()
        if (b.width < 8 || b.height < 8) continue
        const x = (b.left + b.right) / 2
        const y = (b.top + b.bottom) / 2
        const stack = document.elementsFromPoint(x, y)
        if (stack.some((node) => node.closest?.('.defend-walker-tap'))) return { x, y }
      }
      return null
    })
    if (!spot) await page.waitForTimeout(200)
  }
  assert.ok(spot, `#768 ${label} finds a walker for the jitter tap`)
  await page.waitForTimeout(450)
  const beforeTap = await stats()
  await page.mouse.move(spot.x, spot.y)
  await page.mouse.click(spot.x + 3, spot.y + 2, { delay: 250 })
  await page.waitForFunction(
    (b) => {
      const node = document.querySelector('[data-tap-hits]')
      const hits = Number(node?.getAttribute('data-tap-hits') ?? '0')
      const misses = Number(node?.getAttribute('data-tap-misses') ?? '0')
      return hits + misses > b.hits + b.misses
    },
    beforeTap,
    { timeout: 5000 },
  )
  await context.close()
}

/** #868 HUD strip height + crowding shots at 375/390, cam on/off. */
async function check868HudStrip(browser, port, errors) {
  for (const [width, height] of [
    [375, 667],
    [390, 844],
  ]) {
    for (const camOn of [true, false]) {
      const label = `a2 ${width}x${height} cam=${camOn ? 'on' : 'off'}`
      const { context, page } = await openMap(browser, port, width, height, 'a2', {
        motion: true,
        search: `?playtest=1&nwRound=3&nwCam=${camOn ? '1' : '0'}`,
      })
      page.on('pageerror', (error) => errors.push(`${label} ${error}`))
      await page.locator('.defend-go').click()
      await page.locator('.defend-page.is-easy-tap').waitFor()
      await page.locator('.nw-pace').waitFor()
      await page.waitForTimeout(400)
      const hud = await page.evaluate(() => {
        const box = document.querySelector('.nw-hud')?.getBoundingClientRect()
        return box ? { height: box.height, bottom: box.bottom, top: box.top } : null
      })
      assert.ok(hud, `#868 ${label} HUD strip renders`)
      if (width === 375 && height === 667) {
        assert.ok(
          hud.height <= EASY_HUD_STRIP_HEIGHT_MAIN_375 + 0.5,
          `#868 ${label} HUD strip height ${hud.height} <= main ${EASY_HUD_STRIP_HEIGHT_MAIN_375}`,
        )
        assert.ok(hud.bottom <= 89.5, `#868 ${label} HUD bottom ${hud.bottom} <= 89.5`)
      }
      await assertHudCrowding(page, label)
      await page.screenshot({
        path: join(SHOTS, `nw-hud-crowd-${width}x${height}-cam-${camOn ? 'on' : 'off'}.png`),
        fullPage: false,
      })
      await context.close()
    }
  }
}

/** Mid-wave at round 3: pace chip (NWUI-2), strip buttons (NWUI-6), spawn arch (B8). */
async function check792bWave(browser, port, errors) {
  for (const [width, height] of [[375, 667], [390, 844]]) {
    const label = `a2 ${width}x${height}`
    const { context, page } = await openMap(browser, port, width, height, 'a2', { motion: true, search: '?playtest=1&nwRound=3' })
    page.on('pageerror', (error) => errors.push(`${label} ${error}`))
    await page.locator('.defend-go').click()
    await page.locator('.defend-page.is-easy-tap').waitFor()
    await page.locator('.nw-pace').waitFor()
    const pacePlacement = await page.evaluate(() => {
      const pace = document.querySelector('.nw-pace')
      const parent = pace?.parentElement
      return {
        inHud: Boolean(parent?.classList.contains('nw-hud')),
        directChild: Boolean(pace?.matches('.nw-hud > .nw-pace')),
      }
    })
    assert.equal(pacePlacement.directChild, true, `#792b NWUI-2 ${label} pace is .nw-hud > .nw-pace (${JSON.stringify(pacePlacement)})`)
    const openPaceGold = await page.evaluate(() => {
      const pace = document.querySelector('.nw-pace.is-open, .nw-pace[data-state="open"]')
      if (!pace) return null
      const st = getComputedStyle(pace)
      const border = st.borderTopColor
      const goldish = (c) => /rgb\(\s*255,\s*20[04],\s*5/.test(c) || /rgb\(\s*255,\s*204,\s*51/.test(c)
      return { border, gold: goldish(border) }
    })
    if (openPaceGold) {
      assert.equal(openPaceGold.gold, false, `#792b NWUI-2 ${label} open pace border is not gold (${JSON.stringify(openPaceGold)})`)
    }
    await assertArchInside(page, `${label} wave`)
    await page.waitForTimeout(800)
    let ownHits = 0
    for (let frame = 0; frame < 10; frame += 1) {
      const read = await page.evaluate(() => {
        const pace = document.querySelector('.nw-pace').getBoundingClientRect()
        const hit = (b) => pace.left < b.right && pace.right > b.left && pace.top < b.bottom && pace.bottom > b.top
        const clash = []
        for (const sel of [
          '.nw-skill-tray',
          '.defend-tower-card',
          '.nw-cam-recenter',
          '.easy-walker',
          '[data-walker-tap]',
          '.nw-rail',
        ]) {
          for (const node of document.querySelectorAll(sel)) {
            const b = node.getBoundingClientRect()
            if (b.width > 1 && b.height > 1 && hit(b)) clash.push(sel)
          }
        }
        const clusterParts = ['.nw-balloon-orb', '.nw-balloon-count', '.nw-balloon-label', '.nw-balloon']
          .flatMap((sel) => [...document.querySelectorAll(sel)])
          .map((node) => node.getBoundingClientRect())
          .filter((b) => b.width > 1 && b.height > 1)
        const cluster = clusterParts.reduce(
          (acc, b) => ({
            left: Math.min(acc.left, b.left),
            top: Math.min(acc.top, b.top),
            right: Math.max(acc.right, b.right),
            bottom: Math.max(acc.bottom, b.bottom),
          }),
          { left: Infinity, top: Infinity, right: -Infinity, bottom: -Infinity },
        )
        const bboxGap = (a, b) => {
          const ox = Math.min(a.right, b.right) - Math.max(a.left, b.left)
          const oy = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top)
          if (ox > 0 && oy > 0) return -1
          const dx = ox > 0 ? 0 : a.right <= b.left ? b.left - a.right : a.left - b.right
          const dy = oy > 0 ? 0 : a.bottom <= b.top ? b.top - a.bottom : a.top - b.bottom
          return Math.hypot(dx, dy)
        }
        const sparksGap = clusterParts.length ? bboxGap(pace, cluster) : null
        const tray = document.querySelector('.nw-skill-tray')?.getBoundingClientRect()
        const trayGap = tray && tray.width > 1 ? bboxGap(pace, tray) : null
        const top = document.elementFromPoint(pace.left + pace.width / 2, pace.top + pace.height / 2)
        return { w: pace.width, h: pace.height, clash, sparksGap, trayGap, own: Boolean(top?.closest('.nw-pace')) }
      })
      assert.ok(read.w >= 44 && read.h >= 44, `#792b NWUI-2 ${label} the pace chip is 44px (${read.w}x${read.h})`)
      assert.deepEqual(read.clash, [], `#792b NWUI-2 ${label} the pace chip clears the tray and card chrome (frame ${frame})`)
      assert.ok(read.sparksGap === null || read.sparksGap >= 8 - 0.5, `#792b NWUI-2 ${label} the pace chip clears the Sparks cluster (${read.sparksGap}px)`)
      assert.ok(read.trayGap === null || read.trayGap >= 8 - 0.5, `#792b NWUI-2 ${label} the pace chip stays 8px clear of the skill tray (${read.trayGap}px)`)
      if (read.own) ownHits += 1
      await page.waitForTimeout(250)
    }
    assert.equal(ownHits, 10, `#792b NWUI-2 ${label} a tap at the chip centre reaches the chip (${ownHits}/10 frames)`)
    await page.locator('.defend-clear-lamp').first().click()
    await page.locator('.defend-tower-card').waitFor()
    const strip = await page.evaluate(() => {
      const card = document.querySelector('.defend-tower-card').getBoundingClientRect()
      return {
        w: card.width,
        h: card.height,
        buys: [...document.querySelectorAll('.defend-tower-card .defend-path-buy')].map((n) => n.getBoundingClientRect().height),
      }
    })
    assert.equal(strip.buys.length, 2, `#792b NWUI-6 ${label} both buy buttons render`)
    for (const h of strip.buys) assert.ok(h >= 44 - 0.5, `#792b NWUI-6 ${label} strip buttons are 44px (${h})`)
    assert.ok(Math.abs(strip.w - 112) <= 1 && Math.abs(strip.h - 96) <= 1, `#792b NWUI-6 ${label} the strip stays 112x96 ${JSON.stringify(strip)}`)
    await context.close()
  }
}

async function enabledWithin(locator, ms) {
  const t0 = Date.now()
  while (Date.now() - t0 < ms) {
    if (await locator.isEnabled()) return Date.now() - t0
    await locator.page().waitForTimeout(15)
  }
  return null
}

/** NWUI-8: the banner holds, takes no tap, and delays nothing. Round 2 on a2, motion on. */
export async function check792bSurvived(browser, port, errors, width, height) {
  const label = `a2 ${width}x${height}`
  const { context, page } = await openMap(browser, port, width, height, 'a2', { motion: true, search: '?playtest=1&nwRound=2' })
  page.on('pageerror', (error) => errors.push(`${label} ${error}`))
  const begun = Date.now()
  await page.locator('.defend-go').click()
  await page.waitForSelector('.easy-walker, [data-walker-id]', { state: 'attached', timeout: 20_000 })
  const firstWalker = Date.now() - begun
  assert.ok(Math.abs(firstWalker - MAIN_FIRST_WALKER_MS) <= 150, `#792b NWUI-8 ${label} Begin to first walker matches main (${firstWalker}ms)`)
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
  const clearAt = Date.now()
  const cont = page.locator('.defend-continue')
  await cont.waitFor()
  const enabled = await enabledWithin(cont, 2000)
  assert.ok(enabled !== null && enabled - MAIN_CONTINUE_MS <= 150, `#792b NWUI-8 ${label} Continue is enabled at the clear as on main (${enabled}ms)`)

  const banner = page.locator('.nw-wave-survived')
  await page.waitForTimeout(Math.max(0, clearAt + 2000 - Date.now()))
  assert.equal(await banner.count(), 1, `#792b NWUI-8 ${label} the burst is still up at 2.0s`)
  assert.ok(Number(await banner.evaluate((n) => getComputedStyle(n).opacity)) > 0.5, `#792b NWUI-8 ${label} the burst is readable at 2.0s`)
  const ptr = await banner.evaluate((n) => {
    const all = [n, ...n.querySelectorAll('*')]
    return {
      nodes: all.map((el) => getComputedStyle(el).pointerEvents),
      before: getComputedStyle(n, '::before').pointerEvents,
      after: getComputedStyle(n, '::after').pointerEvents,
    }
  })
  for (const value of [...ptr.nodes, ptr.before, ptr.after]) assert.equal(value, 'none', `#792b NWUI-8 ${label} the burst takes no pointer`)
  const spots = await page.evaluate(() => {
    const centre = (n) => {
      const b = n.getBoundingClientRect()
      return { x: b.left + b.width / 2, y: b.top + b.height / 2 }
    }
    const nodes = [
      ...document.querySelectorAll('.defend-pad, .defend-clear-lamp, .defend-continue, .defend-go, .easy-walker, [data-walker-tap], .defend-plant-ground circle'),
    ].filter((n) => n.getClientRects().length > 0)
    return nodes.map((n) => ({ ...centre(n), name: n.getAttribute('class') }))
  })
  const underWith = await page.evaluate((pts) => pts.map((p) => {
    const el = document.elementFromPoint(p.x, p.y)
    return el ? `${el.tagName}.${el.getAttribute('class') || ''}` : 'none'
  }), spots)
  await page.addStyleTag({ content: '.nw-wave-survived{display:none !important}' })
  const underWithout = await page.evaluate((pts) => pts.map((p) => {
    const el = document.elementFromPoint(p.x, p.y)
    return el ? `${el.tagName}.${el.getAttribute('class') || ''}` : 'none'
  }), spots)
  assert.deepEqual(underWith, underWithout, `#792b NWUI-8 ${label} the burst covers no seat, lamp, Continue or Begin`)
  const logic = await page.locator('[data-type="logic"]').boundingBox()
  await page.mouse.click(logic.x + logic.width / 2, logic.y + logic.height / 2)
  const armed = await page.evaluate(() => ({
    selected: document.querySelector('[data-type="logic"]')?.getAttribute('data-lamp-selected'),
    note: document.querySelector('.defend-clear-note')?.textContent || '',
    pressed: document.querySelector('[data-type="logic"]')?.getAttribute('aria-pressed'),
  }))
  assert.ok(armed.selected === 'yes' || armed.pressed === 'true' || /Need \d+ sparks/.test(armed.note), `#792b NWUI-8 ${label} placing a lamp works while the burst shows ${JSON.stringify(armed)}`)
  await page.waitForTimeout(2600)
  assert.equal(await banner.count(), 0, `#792b NWUI-8 ${label} the burst is gone by 2.6s`)
  await context.close()

  // A tap at ~300ms advances while the banner is still up.
  const early = await openMap(browser, port, width, height, 'a2', { motion: true, search: '?playtest=1&nwRound=2' })
  early.page.on('pageerror', (error) => errors.push(`${label} early ${error}`))
  await early.page.locator('.defend-go').click()
  const t1 = Date.now()
  while (Date.now() - t1 < 90_000 && (await early.page.locator('.defend-page.is-boost').count()) < 1) {
    const cue = await early.page.evaluate(() => {
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
    if (cue) await early.page.mouse.click(cue.x, cue.y)
    await early.page.waitForTimeout(80)
  }
  await early.page.locator('.defend-page.is-boost').waitFor()
  await early.page.waitForTimeout(300)
  assert.equal(await early.page.locator('.nw-wave-survived').count(), 1, `#792b NWUI-8 ${label} the banner is up at 300ms`)
  await early.page.locator('.defend-continue').click()
  await early.page.locator('.defend-page:not(.is-boost)').waitFor({ timeout: 3000 })
  await early.context.close()
}

const MAP_NOTE_WIDTHS = [
  [375, 667],
  [390, 844],
  [412, 915],
  [768, 1024],
]
const MAP_NOTE_SHOTS = join(tmpdir(), 'nw-map-note-562')

function mapNoteWidths() {
  const raw = process.env.NW_MAP_WIDTHS
  if (!raw) return MAP_NOTE_WIDTHS
  return raw.split(',').map((pair) => pair.split('x').map((part) => Number(part)))
}

function mapNoteRounds() {
  const raw = process.env.NW_MAP_ROUNDS
  if (!raw) return [1, 2, 3, 4, 5, 6, 7, 8]
  return raw.split(',').map((part) => Number(part))
}

async function mapGoldCues(page) {
  return page.evaluate(() => {
    const root = document.querySelector('.defend-page')
    if (!root) return []
    const gold = (value) => {
      const re = /rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*([\d.]+))?/g
      let match
      while ((match = re.exec(value || ''))) {
        const r = Number(match[1])
        const g = Number(match[2])
        const b = Number(match[3])
        const a = match[4] === undefined ? 1 : Number(match[4])
        if (a >= 0.3 && r > 190 && g > 140 && b < 120 && r > b + 60 && g > b + 30) return true
      }
      return false
    }
    const chrome = 'button, .defend-abilities, .defend-boost, .defend-tower-card, .defend-path-pip, .nw-balloon-orb, .defend-wave, .defend-ability-stock'
    return [...root.querySelectorAll(chrome)]
      .filter((node) => !node.closest('.defend-nw-debug'))
      .filter((node) => {
        const box = node.getBoundingClientRect()
        const style = getComputedStyle(node)
        return box.width > 1 && box.height > 1 && style.display !== 'none' && style.visibility !== 'hidden' && Number(style.opacity) > 0
      })
      .filter((node) => {
        const style = getComputedStyle(node)
        const text = [...node.childNodes].some((child) => child.nodeType === 3 && child.textContent.trim())
        const border = ['Top', 'Right', 'Bottom', 'Left'].some((side) => style[`border${side}Width`] !== '0px' && gold(style[`border${side}Color`]))
        return gold(style.backgroundImage) || gold(style.backgroundColor) || border || gold(style.boxShadow) || (text && gold(style.color))
      })
      .map((node) => `${node.tagName}.${node.getAttribute('class') || ''}`.slice(0, 80))
  })
}

async function visibleHardText(page) {
  return page.evaluate(() => {
    const hits = []
    const walk = (node) => {
      if (node.nodeType === 3) {
        const text = node.textContent || ''
        if (!/\bHard\b/.test(text)) return
        const parent = node.parentElement
        if (!parent || parent.closest('.defend-nw-debug')) return
        const style = getComputedStyle(parent)
        const box = parent.getBoundingClientRect()
        const clip = style.clipPath || ''
        const clipped = clip !== 'none' && clip.includes('inset')
        const seen =
          style.display !== 'none' &&
          style.visibility !== 'hidden' &&
          Number(style.opacity) > 0 &&
          box.width > 2 &&
          box.height > 2 &&
          !clipped
        if (seen) hits.push(text.replace(/\s+/g, ' ').trim().slice(0, 80))
        return
      }
      if (node.nodeType === 1) {
        for (const child of node.childNodes) walk(child)
      }
    }
    walk(document.body)
    return hits
  })
}

async function openMapRound(browser, port, width, height, round, errors) {
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
  const label = `${width}x${height} r${round}`
  page.on('pageerror', (error) => errors.push(`${label} ${error}`))
  page.on('console', (msg) => {
    if (msg.type() !== 'error') return
    const text = msg.text()
    if (text.includes('Encountered two children with the same key')) return
    errors.push(`${label} ${text}`)
  })
  await page.goto(`/?playtest=1&nwCam=0&nwRound=${round}`)
  await page.getByRole('button', { name: 'Settings' }).click()
  await page.locator('summary', { hasText: 'Developer' }).click()
  await page.getByRole('button', { name: 'Jump · Night Watch' }).click()
  await page.locator('.defend-board').waitFor()
  if (await page.locator('[data-map-overlay]').count()) {
    await page.locator('[data-map="a2"]').click()
    await page.locator('[data-map-overlay]').waitFor({ state: 'detached' })
  }
  return { context, page, label }
}

async function cuePoint(page) {
  return page.evaluate(() => {
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
}

async function clearToBoost(page, label) {
  const go = page.locator('.defend-go')
  if (await go.isVisible().catch(() => false)) {
    try {
      await go.click({ timeout: 4000 })
    } catch {
      await go.click({ force: true })
    }
  }
  const started = Date.now()
  while (Date.now() - started < 120_000) {
    if (await page.locator('.defend-page.is-boost').count()) return
    if (await page.locator('.defend-page.is-lost').count()) assert.fail(`${label} the round was lost`)
    const cue = await cuePoint(page)
    if (cue) await page.mouse.click(cue.x, cue.y)
    await page.waitForTimeout(60)
  }
  assert.fail(`${label} the round did not clear`)
}

/** Drag on open map, not on the card or the rail, so the camera follows the finger. */
async function panOnBoard(page, dx, dy) {
  const at = await page.evaluate(() => {
    const cam = document.querySelector('.nw-cam')?.getBoundingClientRect()
    if (!cam) return null
    for (let y = cam.bottom - 80; y > cam.top + 70; y -= 28) {
      for (let x = cam.left + 78; x < cam.right - 78; x += 36) {
        const node = document.elementFromPoint(x, y)
        if (node && node.closest('.nw-cam') && !node.closest('button, .defend-tower-card, .nw-rail, .nw-docks, .nw-hud, .defend-go, .defend-continue')) {
          return { x, y }
        }
      }
    }
    return null
  })
  assert.ok(at, 'a map point takes the camera drag')
  await page.mouse.move(at.x, at.y)
  await page.mouse.down()
  await page.mouse.move(at.x + dx, at.y + dy, { steps: 14 })
  await page.mouse.up()
  await page.waitForTimeout(250)
}

/** Begin, then pause each cue so a boss round can be tapped out without a leak. */
async function clearTypeLabelRound(page, label) {
  const go = page.locator('.defend-go')
  if (await go.isVisible().catch(() => false)) {
    try {
      await go.click({ timeout: 4000 })
    } catch {
      await go.click({ force: true })
    }
  }
  await page.locator('.defend-page.is-easy-tap, .defend-page.is-boost').waitFor({ timeout: 10_000 })
  const started = Date.now()
  while (Date.now() - started < 90_000) {
    if (await page.locator('.defend-page.is-boost').count()) return
    if (await page.locator('.defend-page.is-lost').count()) assert.fail(`${label} the round was lost`)
    const mode = await page.evaluate(() => {
      const button = [...document.querySelectorAll('button')].find((node) => /^(Pause|Resume) walkers$/.test((node.textContent || '').trim()))
      return {
        pause: button ? (button.textContent || '').trim() : '',
        cue: document.querySelectorAll('.defend-raider.is-easy-cue').length,
        alive: document.querySelectorAll('.defend-raider:not(.is-turned)').length,
      }
    })
    if (mode.cue > 0 && mode.pause === 'Pause walkers') await page.getByRole('button', { name: 'Pause walkers' }).click()
    else if (mode.alive === 0 && mode.pause === 'Resume walkers') await page.getByRole('button', { name: 'Resume walkers' }).click()
    const tap = page.locator('.defend-walker-tap.is-cue')
    if (await tap.count()) await tap.first().click({ force: true, timeout: 1000 }).catch(() => {})
    await page.waitForTimeout(30)
  }
  assert.fail(`${label} the round did not clear`)
}

async function readMapNote(page) {
  return page.evaluate(() => {
    const node = document.querySelector('.nw-map-toast')
    if (!node) return null
    const style = getComputedStyle(node)
    const box = node.getBoundingClientRect()
    const chip = document.querySelector('.nw-pace')
    const chipBox = chip ? chip.getBoundingClientRect() : null
    return {
      text: (node.textContent || '').replace(/\s+/g, ' ').trim(),
      w: box.width,
      h: box.height,
      x: box.x,
      y: box.y,
      right: box.right,
      bottom: box.bottom,
      font: parseFloat(style.fontSize),
      top: style.top,
      opacity: Number(style.opacity),
      display: style.display,
      visibility: style.visibility,
      events: style.pointerEvents,
      chip: chipBox
        ? { x: chipBox.x, y: chipBox.y, w: chipBox.width, h: chipBox.height, right: chipBox.right, bottom: chipBox.bottom }
        : null,
    }
  })
}

function boxesOverlap(a, b) {
  return a.x < b.right && a.right > b.x && a.y < b.bottom && a.bottom > b.y
}

async function checkHomeBadge(browser, port, errors) {
  const cases = [
    { name: 'round 8', defense: { cleared: 1, nights: ['2026-10-14'], mazeBeat: ['a2'], mapBest: { a2: 8 } }, badge: true },
    { name: 'old flag', defense: { cleared: 1, nights: ['2026-10-14'], farHills: true }, badge: true },
    { name: 'round 7', defense: { cleared: 1, nights: ['2026-10-14'], mapBest: { a2: 7 } }, badge: false },
  ]
  for (const item of cases) {
    const context = await browser.newContext({
      baseURL: `http://127.0.0.1:${port}/`,
      viewport: { width: 375, height: 667 },
      deviceScaleFactor: 1,
    })
    await context.addInitScript(
      (payload) => localStorage.setItem(payload.key, JSON.stringify(payload.save)),
      {
        key: STORAGE_KEY,
        save: {
          ...SAVE,
          progress: { ...SAVE.progress, easyHeld: ['ph-road'], defense: item.defense },
        },
      },
    )
    const page = await context.newPage()
    page.on('pageerror', (error) => errors.push(`home ${item.name} ${error}`))
    await page.goto('/?playtest=1', { waitUntil: 'domcontentloaded' })
    const badge = page.locator('.easy-night-watch .nw-area-badge')
    if (item.badge) {
      await badge.waitFor({ timeout: 60_000 })
      assert.equal((await badge.textContent()).trim(), 'Far Hills', `1.4.562 Home shows Far Hills for ${item.name}`)
      const box = await badge.boundingBox()
      assert.ok(box && box.width > 10 && box.height > 8, `1.4.562 the Far Hills badge is visible for ${item.name}`)
    } else {
      await page.locator('.easy-night-watch').waitFor()
      assert.equal(await badge.count(), 0, `1.4.562 Home hides Far Hills for ${item.name}`)
    }
    await context.close()
  }
}

/** 1.4.562: the Easy round-8 map note is visible, and earlier clears do not show it. */
async function checkMapNote(browser, port, errors) {
  mkdirSync(MAP_NOTE_SHOTS, { recursive: true })
  await checkHomeBadge(browser, port, errors)
  const rounds = mapNoteRounds()
  for (const [width, height] of mapNoteWidths()) {
    for (const round of rounds) {
      const { context, page, label } = await openMapRound(browser, port, width, height, round, errors)
      if (round === 1) {
        const skill = await page.locator('.nw-skill-toast:not(.nw-map-toast)').first().evaluate((node) => {
          const box = node.getBoundingClientRect()
          return { w: box.width, h: box.height, text: (node.textContent || '').trim() }
        })
        assert.ok(skill.w <= 2 && skill.h <= 2, `${label} skill notes stay hidden (${skill.w}x${skill.h} ${skill.text})`)
      }
      assert.equal(await page.locator('.nw-map-toast').count(), 0, `${label} the map note is absent before the clear`)
      const hardBefore = await visibleHardText(page)
      assert.deepEqual(hardBefore, [], `${label} no Hard text before the clear ${hardBefore}`)
      await clearToBoost(page, label)
      if (round < 8) {
        assert.equal(await page.locator('.nw-map-toast').count(), 0, `${label} no map note after round ${round}`)
        await page.waitForTimeout(400)
        assert.equal(await page.locator('.nw-map-toast').count(), 0, `${label} the map note stays absent after round ${round}`)
        await context.close()
        continue
      }
      const seenAt = Date.now()
      await page.locator('.nw-map-toast').waitFor()
      const first = await readMapNote(page)
      assert.ok(first, `${label} the map note is mounted`)
      assert.equal(first.text, 'New map unlocked: The Far Hills!', `${label} the note names The Far Hills`)
      assert.ok(first.w >= 100, `${label} the note is at least 100px wide (${first.w})`)
      assert.ok(first.h > 8, `${label} the note has a visible height (${first.h})`)
      assert.ok(first.font >= 14, `${label} the note text is at least 14px (${first.font})`)
      assert.equal(first.top, '108px', `${label} the note sits at 108px`)
      assert.equal(first.events, 'none', `${label} the note does not take taps`)
      assert.ok(first.opacity > 0.9 && first.visibility !== 'hidden' && first.display !== 'none', `${label} the note is visible`)
      const center = width / 2
      assert.ok(Math.abs(first.x + first.w / 2 - center) <= 12, `${label} the note is centered ${JSON.stringify(first)}`)
      assert.ok(first.chip, `${label} the pace chip is on screen`)
      if (width === 375) {
        assert.ok(Math.abs(first.chip.w - 44) <= 4 && Math.abs(first.chip.h - 44) <= 4, `${label} pace chip is ~44px ${JSON.stringify(first.chip)}`)
        assert.ok(Math.abs(first.chip.right - width) <= 16, `${label} pace chip sits at the right edge ${JSON.stringify(first.chip)}`)
        assert.ok(Math.abs(first.chip.y - 49) <= 16, `${label} pace chip y ~49 (${first.chip.y})`)
      }
      assert.equal(boxesOverlap(first, first.chip), false, `${label} the note does not cover the pace chip ${JSON.stringify({ note: first, chip: first.chip })}`)
      const gold = await mapGoldCues(page)
      assert.equal(gold.length, 1, `${label} exactly one gold cue ${JSON.stringify(gold)}`)
      const hit = await page.evaluate(() => {
        const chip = document.querySelector('.nw-pace')
        const box = chip.getBoundingClientRect()
        const x = box.x + box.width / 2
        const y = box.y + box.height / 2
        const node = document.elementFromPoint(x, y)
        return Boolean(node?.closest?.('.nw-pace'))
      })
      assert.equal(hit, true, `${label} a tap at the pace chip center hits the chip`)
      const paceBefore = await page.locator('.nw-pace').getAttribute('data-state')
      const chipBox = await page.locator('.nw-pace').boundingBox()
      await page.mouse.click(chipBox.x + chipBox.width / 2, chipBox.y + chipBox.height / 2)
      const paceAfter = await page.locator('.nw-pace').getAttribute('data-state')
      assert.notEqual(paceAfter, paceBefore, `${label} the pace chip takes the tap (${paceBefore} -> ${paceAfter})`)
      const hard = await visibleHardText(page)
      assert.deepEqual(hard, [], `${label} no Hard text a player can see ${hard}`)
      if (width === 375 || width === 390) {
        await page.screenshot({ path: join(MAP_NOTE_SHOTS, `note-${width}x${height}.png`) })
      }
      let lastWide = Date.now()
      while (Date.now() - seenAt < 7000) {
        const note = await readMapNote(page)
        if (!note || note.w < 100) break
        assert.equal(boxesOverlap(note, note.chip), false, `${label} the note stays off the pace chip`)
        lastWide = Date.now()
        await page.waitForTimeout(150)
      }
      const held = lastWide - seenAt
      assert.ok(held >= 3600 && held <= 5200, `${label} the note stays wide for about 4.2s (${held}ms)`)
      assert.equal(await page.locator('.nw-map-toast').count(), 0, `${label} the note leaves after the hold`)
      console.log(`${label} map note ${Math.round(first.w)}x${Math.round(first.h)} at ${Math.round(first.x)},${Math.round(first.y)} held ${held}ms chip ${JSON.stringify(first.chip)}`)
      await context.close()
    }
  }
}

function overlapArea(a, b) {
  if (!a || !b) return 0
  const w = Math.max(0, Math.min(a.right, b.right) - Math.max(a.x, b.x))
  const h = Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.y, b.y))
  return w * h
}

/** 1.4.565: sample the leak banner against the map note on every frame. */
async function checkLeakBanner(browser, port, errors) {
  const shots = join(tmpdir(), 'nw-leak-banner-565')
  mkdirSync(shots, { recursive: true })
  const sizes = [
    [375, 667],
    [375, 812],
    [390, 844],
  ]
  for (const [width, height] of sizes) {
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
    const label = `${width}x${height}`
    page.on('pageerror', (error) => errors.push(`${label} leak ${error}`))
    await page.goto(`/?playtest=1&nwCam=0&nwRound=8`)
    await page.getByRole('button', { name: 'Settings' }).click()
    await page.locator('summary', { hasText: 'Developer' }).click()
    await page.getByRole('button', { name: 'Jump · Night Watch' }).click()
    await page.locator('.defend-board').waitFor()
    if (await page.locator('[data-map-overlay]').count()) {
      await page.locator('[data-map="a2"]').click()
      await page.locator('[data-map-overlay]').waitFor({ state: 'detached' })
    }
    await page.evaluate(() => {
      const box = (node) => {
        if (!node) return null
        const r = node.getBoundingClientRect()
        if (r.width < 2 || r.height < 2) return null
        return { x: r.x, y: r.y, right: r.right, bottom: r.bottom, w: r.width, h: r.height }
      }
      window.__leakFrames = []
      const tick = () => {
        const banner = document.querySelector('.nw-power-banner.is-still')
        if (banner) {
          const style = getComputedStyle(banner)
          const bannerBox = box(banner)
          if (bannerBox) {
            window.__leakFrames.push({
              t: performance.now(),
              banner: bannerBox,
              note: box(document.querySelector('.nw-map-toast')),
              round: box(document.querySelector('.nw-wave-survived-round')),
              title: box(document.querySelector('.nw-wave-survived-title')),
              chip: box(document.querySelector('.nw-pace')),
              hearts: box(document.querySelector('.defend-hearts')),
              cont: box(document.querySelector('.defend-continue')),
              font: parseFloat(style.fontSize),
              space: style.whiteSpace,
              opacity: Number(style.opacity),
            })
          }
        }
        requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
    })
    const go = page.locator('.defend-go')
    if (await go.count()) await go.click()
    const started = Date.now()
    let shot = false
    let tapped = false
    while (Date.now() - started < 90_000) {
      const frame = await page.evaluate(() => {
        const lost = Boolean(document.querySelector('.defend-page.is-lost'))
        const count = (document.querySelector('.defend-count')?.textContent || '').replace(/\s+/g, ' ').trim()
        const face = document.querySelector('.defend-raider.is-easy-cue')
        let cue = null
        if (face) {
          const id = face.getAttribute('data-walker-id')
          const tap = document.querySelector(`[data-walker-tap="${id}"]`)
          if (tap) {
            const box = tap.getBoundingClientRect()
            const x = box.x + box.width / 2
            const y = box.y + box.height / 2
            const node = document.elementFromPoint(x, y)
            if (node?.closest?.('[data-walker-tap]')?.getAttribute('data-walker-tap') === id) cue = { x, y }
          }
        }
        const both = Boolean(document.querySelector('.nw-map-toast') && document.querySelector('.nw-power-banner.is-still'))
        return { lost, count, cue, both }
      })
      if (frame.lost) assert.fail(`${label} the round was lost before the leak banner`)
      if (frame.both && !tapped) {
        const before = await page.locator('.nw-pace').getAttribute('data-state')
        const chip = await page.locator('.nw-pace').boundingBox()
        assert.ok(chip, `${label} the pace chip is on screen with the note`)
        await page.mouse.click(chip.x + chip.width / 2, chip.y + chip.height / 2)
        const after = await page.locator('.nw-pace').getAttribute('data-state')
        assert.notEqual(after, before, `${label} the pace chip takes the tap during the note`)
        tapped = true
      }
      if (!shot) {
        const opaque = await page.evaluate(() => (window.__leakFrames || []).some((frame) => frame.opacity > 0.9 && frame.note))
        if (opaque) {
          await page.screenshot({ path: join(shots, `leak-${width}x${height}.png`) })
          shot = true
        }
      }
      const left = Number((frame.count.match(/\b(\d+) left\b/) || [])[1] || 99)
      if (left > 2 && frame.cue) await page.mouse.click(frame.cue.x, frame.cue.y)
      const done = await page.evaluate(() => {
        const frames = window.__leakFrames || []
        if (!frames.length) return false
        const last = frames[frames.length - 1]
        return performance.now() - last.t > 400 && !document.querySelector('.nw-power-banner.is-still')
      })
      if (done && shot) break
      await page.waitForTimeout(16)
    }
    const frames = await page.evaluate(() => window.__leakFrames || [])
    assert.ok(frames.length >= 15, `${label} sampled the banner (${frames.length} frames)`)
    const span = frames[frames.length - 1].t - frames[0].t
    assert.ok(span >= 1000, `${label} the sample covers the banner lifetime (${Math.round(span)}ms)`)
    let maxNote = 0
    let maxRound = 0
    let maxTitle = 0
    let maxChip = 0
    let maxHearts = 0
    let maxCont = 0
    let minY = Infinity
    for (const [index, frame] of frames.entries()) {
      assert.ok(frame.note, `${label} frame ${index} the note is up with the banner`)
      const note = overlapArea(frame.banner, frame.note)
      const round = overlapArea(frame.banner, frame.round)
      const title = overlapArea(frame.banner, frame.title)
      const chip = overlapArea(frame.banner, frame.chip)
      const hearts = overlapArea(frame.banner, frame.hearts)
      const cont = overlapArea(frame.banner, frame.cont)
      maxNote = Math.max(maxNote, note)
      maxRound = Math.max(maxRound, round)
      maxTitle = Math.max(maxTitle, title)
      maxChip = Math.max(maxChip, chip)
      maxHearts = Math.max(maxHearts, hearts)
      maxCont = Math.max(maxCont, cont)
      minY = Math.min(minY, frame.banner.y)
      assert.equal(note, 0, `${label} frame ${index} banner/note overlap ${note}`)
      assert.equal(round, 0, `${label} frame ${index} banner/round overlap ${round}`)
      assert.equal(title, 0, `${label} frame ${index} banner/title overlap ${title}`)
      assert.equal(chip, 0, `${label} frame ${index} banner/chip overlap ${chip}`)
      assert.equal(hearts, 0, `${label} frame ${index} banner/hearts overlap ${hearts}`)
      assert.equal(cont, 0, `${label} frame ${index} banner/continue overlap ${cont}`)
      assert.ok(frame.banner.y >= 268, `${label} frame ${index} banner top ${frame.banner.y} is under 268`)
      assert.ok(frame.font >= 13, `${label} frame ${index} banner font ${frame.font}`)
      assert.equal(frame.space, 'nowrap', `${label} frame ${index} banner stays one line`)
      assert.ok(frame.banner.h <= 52, `${label} frame ${index} banner is one line tall (${frame.banner.h})`)
    }
    assert.equal(tapped, true, `${label} the pace chip was tapped`)
    const rows = frames.map((frame, index) => ({
      i: index,
      y: Math.round(frame.banner.y * 10) / 10,
      h: Math.round(frame.banner.h * 10) / 10,
      note: overlapArea(frame.banner, frame.note),
      op: Math.round(frame.opacity * 100) / 100,
    }))
    console.log(`${label} leak frames ${frames.length} span ${Math.round(span)}ms minY ${minY.toFixed(1)} maxNote ${maxNote} maxRound ${maxRound} maxTitle ${maxTitle} maxChip ${maxChip} maxHearts ${maxHearts} maxCont ${maxCont}`)
    console.log(`${label} leak per-frame ${JSON.stringify(rows)}`)
    await context.close()
  }
}

const GLYPH_SIZES = [
  [375, 667],
  [375, 812],
  [390, 844],
  [412, 915],
  [768, 1024],
]

/** Round 24 on the playtest jump: enough sparks for two full ladders, the late steps open, no lamps yet. */
const GLYPH_SEARCH = '?playtest=1&nwSeed=2&nwRound=24&nwLamps=0'
const GLYPH_TOOLS = ['love', 'logic', 'reason', 'science']
const GLYPH_NAME = { love: 'Love', logic: 'Logic', reason: 'Reason', science: 'Science' }

/**
 * Eight real buys on one lamp, one click each on the open card.
 * Stage n is the count of buys, so the mark must read 1 through 8 in this order.
 */
const GLYPH_LADDER = [
  { path: 'strong' },
  { path: 'strong' },
  { path: 'strong' },
  { path: 'far' },
  { bright: true },
  { path: 'strong' },
  { path: 'strong' },
  { path: 'far' },
]

function glyphArea(a, b) {
  if (!a || !b) return 0
  const w = Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left))
  const h = Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top))
  return w * h
}

/** Clear space between two boxes along the nearer axis. 0 when they touch or overlap. */
function glyphGap(a, b) {
  if (!a || !b) return Infinity
  const dx = Math.max(0, Math.max(a.left, b.left) - Math.min(a.right, b.right))
  const dy = Math.max(0, Math.max(a.top, b.top) - Math.min(a.bottom, b.bottom))
  return Math.max(dx, dy)
}

const GLYPH_MIN_GAP = 4

function glyphInside(box, frame, slack = 0.5) {
  return box.left >= frame.left - slack && box.right <= frame.right + slack && box.top >= frame.top - slack && box.bottom <= frame.bottom + slack
}

function hexToRgb(hex) {
  const n = Number.parseInt(hex.slice(1), 16)
  return `rgb(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255})`
}

/**
 * One new piece, sampled on every frame. It has to draw: the drawn share starts low,
 * is not done in the first two frames, only goes up, and takes at least 150ms.
 */
function assertDrawOn(frames, piece, label) {
  const seen = frames
    .map((frame) => ({ t: frame.t, item: frame.draw.find((item) => item.stage === piece) }))
    .filter((row) => row.item)
  assert.ok(seen.length >= 3, `${label} the new piece shows ${seen.length} drawing frames`)
  for (const row of seen) {
    assert.equal(row.item.dash, 1, `${label} piece dash is ${row.item.dash}`)
    assert.equal(row.item.len, '1', `${label} piece pathLength is ${row.item.len}`)
  }
  const shares = seen.map((row) => row.item.share)
  assert.ok(shares[0] < 0.97 && shares[1] < 0.97, `${label} the piece is not complete in the first 2 frames (${shares.slice(0, 2).map((v) => v.toFixed(2))})`)
  for (let i = 1; i < shares.length; i += 1) {
    assert.ok(shares[i] >= shares[i - 1] - 0.001, `${label} drawn share only goes up (${shares.map((v) => v.toFixed(2))})`)
  }
  assert.ok(new Set(shares.map((v) => v.toFixed(2))).size >= 3, `${label} the share takes several values (${shares.map((v) => v.toFixed(2))})`)
  const start = seen[0].t
  const done = frames.find((frame) => frame.t > start && (!frame.draw.some((item) => item.stage === piece) || frame.draw.find((item) => item.stage === piece).share >= 0.99))
  assert.ok(done, `${label} the piece finishes drawing`)
  const span = done.t - start
  assert.ok(span >= 150, `${label} the piece draws over ${Math.round(span)}ms, not a pop`)
  return { span, first: Math.max(shares[0], shares[1]), count: seen.length }
}

async function glyphSetup(page) {
  await page.evaluate(() => {
    const box = (el) => {
      if (!el) return null
      const style = getComputedStyle(el)
      if (style.display === 'none' || style.visibility === 'hidden' || Number(style.opacity) === 0) return null
      const rect = el.getBoundingClientRect()
      if (rect.width < 1 || rect.height < 1) return null
      return { left: rect.left, top: rect.top, right: rect.right, bottom: rect.bottom, w: rect.width, h: rect.height }
    }
    const many = (sel, root = document) => [...root.querySelectorAll(sel)].map(box).filter(Boolean)
    window.__glyphSample = (tool) => {
      const pad = document.querySelector(`.defend-pad[data-tower-type="${tool}"]`)
      const glyph = pad?.querySelector('.lamp-upgrade-glyph[data-glyph-variant="map"]') ?? null
      const draw = glyph
        ? [...glyph.querySelectorAll('[data-glyph-draw="yes"]')].map((el) => {
            const style = getComputedStyle(el)
            const offset = parseFloat(style.strokeDashoffset)
            return {
              stage: Number(el.getAttribute('data-glyph-piece')),
              dash: parseFloat(style.strokeDasharray),
              len: el.getAttribute('pathLength'),
              share: 1 - Math.min(1, Math.max(0, offset)),
            }
          })
        : []
      return {
        t: performance.now(),
        glyph: box(glyph),
        stage: glyph?.getAttribute('data-glyph-stage') ?? null,
        draw,
        card: box(document.querySelector('.defend-tower-card')),
        stem: (() => {
          const el = document.querySelector('.defend-tower-card')
          if (!el) return null
          const content = getComputedStyle(el, '::after').content
          if (content === 'none' || content === 'normal') return null
          const rect = el.getBoundingClientRect()
          const x = rect.left + parseFloat(el.style.getPropertyValue('--stem'))
          if (!Number.isFinite(x)) return null
          const above = el.classList.contains('is-above')
          return { left: x - 8, right: x + 8, top: above ? rect.bottom : rect.top - 8, bottom: above ? rect.bottom + 8 : rect.top, w: 16, h: 8 }
        })(),
        header: (() => {
          const mark = document.querySelector('.defend-tower-card [data-glyph-header="yes"]')
          const svg = mark?.querySelector('.lamp-upgrade-glyph')
          if (!mark || !svg) return null
          return {
            stage: svg.getAttribute('data-glyph-stage'),
            pieces: svg.querySelectorAll('.is-stroke, .is-gap').length,
            box: box(svg),
          }
        })(),
        board: box(document.querySelector('.defend-board')),
        frame: box(document.querySelector('.defend-frame')),
        plate: box(document.querySelector('.defend-tower-card')?.offsetParent ?? null),
        hearts: many('.defend-hearts'),
        lamp: pad ? many('.defend-tower-lamp, .defend-type-mark', pad) : [],
        buttons: many('.nw-rail .defend-ability'),
        notes: many('.defend-clear-note, #defend-plant-first, .nw-miss-toast, .defend-plant-first'),
        banners: many('.nw-power-banner, .defend-boost-status, .nw-wave-count'),
        pace: many('.nw-pace'),
        begin: many('.defend-go'),
        beginHit: (() => {
          const go = document.querySelector('.defend-go')
          const at = box(go)
          if (!go || !at) return null
          const hit = document.elementFromPoint(at.left + at.w / 2, at.top + at.h / 2)
          return Boolean(hit && go.contains(hit))
        })(),
        rail: box(document.querySelector('.nw-rail')),
        clearButtons: many('.defend-clear-row button'),
        place: (() => {
          const raw = document.querySelector('.defend-tower-card')?.getAttribute('data-place')
          if (!raw) return null
          const [x, y, h, reserve] = raw.split(',').map(Number)
          return { x, y, h, reserve: reserve || 0 }
        })(),
        cont: many('.defend-continue'),
        kit: many('.defend-kits button'),
        newLamp: many('.defend-new-lamp'),
        recenter: many('.nw-cam-recenter'),
        wave: Boolean(document.querySelector('.defend-page.is-easy-tap')),
        open: Boolean(document.querySelector('.defend-pad.is-upgrade-open')),
        strip: document.querySelector('.defend-tower-card')?.getAttribute('data-strip') === 'yes',
        // What the card paints: boxes that are really on screen, not the 1px clipped words.
        body: (() => {
          const el = document.querySelector('.defend-tower-card')
          if (!el) return null
          // Ink only: a button, an image, or an element with its own words. Empty wrappers paint nothing.
          const inks = [...el.querySelectorAll('*')].filter((node) => {
            if (node.closest('svg') && node.tagName.toLowerCase() !== 'svg') return false
            const style = getComputedStyle(node)
            if (style.visibility === 'hidden' || style.display === 'none' || Number(style.opacity) === 0) return false
            if (['BUTTON', 'IMG'].includes(node.tagName) || node.tagName.toLowerCase() === 'svg') return true
            return [...node.childNodes].some((child) => child.nodeType === 3 && child.textContent.trim().length > 0)
          })
          // An ancestor that clips (the 1px clipped words, the card's own edge) cuts what is really painted.
          const seen = (node) => {
            const own = node.getBoundingClientRect()
            let left = own.left
            let top = own.top
            let right = own.right
            let bottom = own.bottom
            for (let up = node.parentElement; up; up = up.parentElement) {
              const style = getComputedStyle(up)
              if (style.clipPath !== 'none' && style.clipPath.includes('inset(50%')) return null
              if (style.overflow !== 'visible' || style.clipPath !== 'none') {
                const box = up.getBoundingClientRect()
                left = Math.max(left, box.left)
                top = Math.max(top, box.top)
                right = Math.min(right, box.right)
                bottom = Math.min(bottom, box.bottom)
              }
              if (up === el) break
            }
            return right - left >= 8 && bottom - top >= 8 ? { left, top, right, bottom, w: right - left, h: bottom - top } : null
          }
          const parts = inks.map((node) => seen(node)).filter(Boolean)
          if (parts.length === 0) return { count: 0, h: 0 }
          return { count: parts.length, h: Math.max(...parts.map((r) => r.bottom)) - Math.min(...parts.map((r) => r.top)) }
        })(),
        rowTop: (() => {
          const rows = [...many('.defend-go'), ...many('.defend-kits button'), ...many('.defend-continue')]
          return rows.length ? Math.min(...rows.map((r) => r.top)) : null
        })(),
        own: [
          ...(pad ? many('text.defend-type-label', pad) : []),
          ...many(`.defend-type-chip.is-${tool}`),
        ],
        nbBodies: [...document.querySelectorAll('.defend-pad.is-planted')]
          .filter((node) => node !== pad)
          .map((node) => {
            const parts = [...node.querySelectorAll('.defend-lamp-sprite, image.defend-type-mark')].map(box).filter(Boolean)
            if (!parts.length) return null
            return {
              left: Math.min(...parts.map((r) => r.left)),
              top: Math.min(...parts.map((r) => r.top)),
              right: Math.max(...parts.map((r) => r.right)),
              bottom: Math.max(...parts.map((r) => r.bottom)),
            }
          })
          .filter(Boolean),
        nbLabels: [
          ...[...document.querySelectorAll('.defend-pad.is-planted')].filter((node) => node !== pad).flatMap((node) => many('text.defend-type-label', node)),
          ...many(`.defend-type-chip:not(.is-${tool})`),
        ],
        typeLabels: [...document.querySelectorAll('text.defend-type-label')].map(box).filter(Boolean),
        nbMarks: [...document.querySelectorAll('.defend-pad.is-planted')].filter((node) => node !== pad).flatMap((node) => many('image.defend-type-mark', node)),
        // The mark is painted above the names when a second copy of it sits in a layer over every chip.
        above: (() => {
          if (!glyph?.id) return false
          const top = document.querySelector(`svg.defend-glyph-top use[href="#${CSS.escape(glyph.id)}"]`)
          const layer = top?.ownerSVGElement
          const at = box(top)
          const own = box(glyph)
          if (!top || !layer || !at || !own) return false
          if (Math.abs(at.left - own.left) > 1 || Math.abs(at.top - own.top) > 1) return false
          const chips = [...document.querySelectorAll('.defend-type-chip')]
          const z = Number(getComputedStyle(layer).zIndex)
          if (!(z > Math.max(0, ...chips.map((chip) => Number(getComputedStyle(chip).zIndex) || 0)))) return false
          return chips.every((chip) => Boolean(chip.compareDocumentPosition(layer) & Node.DOCUMENT_POSITION_FOLLOWING))
        })(),
        aboveWhy: (() => {
          if (!glyph?.id) return 'no glyph id'
          const top = document.querySelector(`svg.defend-glyph-top use[href="#${CSS.escape(glyph.id)}"]`)
          const at = box(top)
          const own = box(glyph)
          if (!top || !at || !own) return `overlay ${Boolean(top)} at ${JSON.stringify(at)} own ${JSON.stringify(own)}`
          return `overlay offset ${(at.left - own.left).toFixed(2)},${(at.top - own.top).toFixed(2)} z ${getComputedStyle(top.ownerSVGElement).zIndex}`
        })(),
        others: [...document.querySelectorAll('.defend-pad .lamp-upgrade-glyph[data-glyph-variant="map"]')]
          .filter((node) => node !== glyph)
          // A lamp panned off the top of the frame has no art on screen to sit over; only lamps in view count.
          .filter((node) => {
            const art = node.closest('.defend-pad')?.querySelector('.defend-tower-lamp')?.getBoundingClientRect()
            const frameBox = document.querySelector('.defend-frame')?.getBoundingClientRect()
            return Boolean(art && frameBox && art.top >= frameBox.top && art.bottom <= frameBox.bottom)
          })
          .map(box)
          .filter(Boolean),
        // 1.4.576: every painted text line. Hidden lines use visibility:hidden and are skipped here.
        lines: window.__compactLines ? (() => {
          const card = document.querySelector('.defend-tower-card')
          if (!card) return []
          const out = []
          for (const node of card.querySelectorAll('*')) {
            const direct = [...node.childNodes].some((child) => child.nodeType === 3 && child.textContent.trim().length > 0)
            if (!direct) continue
            const style = getComputedStyle(node)
            if (style.display === 'none' || style.visibility === 'hidden' || Number(style.opacity) === 0) continue
            const rect = node.getBoundingClientRect()
            if (rect.width < 1 || rect.height < 1) continue
            const text = (node.textContent || '').replace(/\s+/g, ' ').trim()
            if (!text) continue
            let kind = 'text'
            if (node.matches('.defend-path-lock')) kind = 'lock'
            else if (node.matches('.defend-bright-line')) kind = 'bright'
            else if (node.matches('.defend-path-line')) kind = 'path'
            else if (node.matches('.defend-tower-road')) kind = 'road'
            out.push({
              kind,
              path: node.closest('[data-path]')?.getAttribute('data-path') || '',
              text,
              overflow: style.textOverflow,
              scroll: node.scrollWidth,
              client: node.clientWidth,
              scrollH: node.scrollHeight,
              clientH: node.clientHeight,
            })
          }
          return out
        })() : [],
      }
    }
    window.__glyphRun = null
    window.__glyphStart = (tool) => {
      const run = { frames: [], stop: false }
      window.__glyphRun = run
      const tick = () => {
        run.frames.push(window.__glyphSample(tool))
        if (!run.stop) requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
    }
    window.__glyphEnd = () => {
      const run = window.__glyphRun
      run.stop = true
      return run.frames
    }
  })
}

/** Gold painted anywhere on the board page, and on the one mark under test. Same rule as before 1.4.568. */
function readGold(page) {
  return page.evaluate(() => {
    const goldish = (value) => {
      const re = /rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*([\d.]+))?/g
      let match
      while ((match = re.exec(value || ''))) {
        const r = +match[1]
        const g = +match[2]
        const b = +match[3]
        const a = match[4] === undefined ? 1 : +match[4]
        if (a > 0.05 && r > 190 && g > 140 && b < 120 && r > b + 60 && g > b + 30) return true
      }
      return false
    }
    const pieceGold = []
    for (const el of document.querySelectorAll('.lamp-upgrade-glyph .is-stroke, .lamp-upgrade-glyph .is-gap, .lamp-upgrade-glyph .is-dot')) {
      const style = getComputedStyle(el)
      if (goldish(style.stroke) || goldish(style.fill)) pieceGold.push(el.getAttribute('class'))
    }
    const gold = []
    for (const el of document.querySelectorAll('.defend-page *')) {
      if (el.closest('path.defend-road, path.defend-heaven-wall, [hidden]')) continue
      const style = getComputedStyle(el)
      if (style.display === 'none' || style.visibility === 'hidden' || Number(style.opacity) === 0) continue
      const rect = el.getBoundingClientRect()
      if (rect.width <= 0 || rect.height <= 0 || rect.right <= 0 || rect.bottom <= 0 || rect.left >= innerWidth || rect.top >= innerHeight) continue
      let why = false
      if (el instanceof SVGElement) {
        if (style.stroke !== 'none' && parseFloat(style.strokeWidth) > 0 && goldish(style.stroke)) why = true
        if (style.fill !== 'none' && goldish(style.fill)) why = true
      } else if (goldish(style.backgroundImage) || goldish(style.backgroundColor)) why = true
      else if (['Top', 'Right', 'Bottom', 'Left'].some((side) => parseFloat(style[`border${side}Width`]) > 0 && style[`border${side}Style`] !== 'none' && goldish(style[`border${side}Color`]))) why = true
      else if (goldish(style.boxShadow)) why = true
      if (why) gold.push(`${el.tagName.toLowerCase()}.${String(el.getAttribute('class') ?? '').split(/\s+/).slice(0, 2).join('.')}`)
    }
    return { gold, pieceGold }
  })
}

/** What one lamp shows right now: its mark, the card, and how they sit. */
function readGlyphStage(page, tool) {
  return page.evaluate((toolId) => {
    const frame = window.__glyphSample(toolId)
    const glyph = document.querySelector(`.defend-pad[data-tower-type="${toolId}"] .lamp-upgrade-glyph[data-glyph-variant="map"]`)
    const strokes = glyph ? [...glyph.querySelectorAll('.is-stroke, .is-gap')] : []
    return {
      ...frame,
      pieces: strokes.length,
      tone: glyph?.getAttribute('data-glyph-tone') ?? null,
      colors: [...new Set(strokes.map((el) => getComputedStyle(el).stroke))],
      rails: [...document.querySelectorAll('.defend-ability-tier.is-glyph .lamp-upgrade-glyph')].map((node) => {
        const rect = node.getBoundingClientRect()
        return { stage: node.getAttribute('data-glyph-stage'), w: rect.width, h: rect.height }
      }),
    }
  }, tool)
}

async function checkRingArcDraw(browser, port, errors) {
  const context = await browser.newContext({
    baseURL: `http://127.0.0.1:${port}/`,
    viewport: { width: 375, height: 667 },
    deviceScaleFactor: 1,
    reducedMotion: 'no-preference',
  })
  await context.addInitScript(
    (payload) => localStorage.setItem(payload.key, JSON.stringify(payload.save)),
    { key: STORAGE_KEY, save: SAVE },
  )
  const page = await context.newPage()
  page.on('pageerror', (error) => errors.push(`glyph arcs ${error}`))
  await page.goto('/?playtest=1')
  await page.getByRole('button', { name: 'Settings' }).click()
  await page.locator('summary', { hasText: 'Developer' }).click()
  const top = await page.locator('.lamp-glyph-preview figure').count()
  const arcs = page.locator(`.lamp-glyph-preview figure[data-preview-stage="${top - 1}"] path.is-stroke[d*="A"]`)
  assert.equal(await arcs.count(), 4, 'ring arcs: the top stage has four arc pieces')
  const lengths = await arcs.evaluateAll((nodes) => nodes.map((node) => node.getAttribute('pathLength')))
  assert.deepEqual(lengths, ['1', '1', '1', '1'], 'ring arcs: every arc has pathLength 1')
  const frames = await page.evaluate(async () => {
    const arc = document.querySelector('.lamp-glyph-preview figure:last-child path.is-stroke[d*="A"]')
    const rows = []
    arc.setAttribute('data-glyph-piece', '10')
    arc.setAttribute('data-glyph-draw', 'yes')
    arc.classList.add('is-draw')
    await new Promise((resolve) => {
      const start = performance.now()
      const tick = (now) => {
        const style = getComputedStyle(arc)
        rows.push({
          t: now,
          draw: [
            {
              stage: 10,
              dash: parseFloat(style.strokeDasharray),
              len: arc.getAttribute('pathLength'),
              share: 1 - Math.min(1, Math.max(0, parseFloat(style.strokeDashoffset))),
            },
          ],
        })
        if (now - start < 500) requestAnimationFrame(tick)
        else resolve()
      }
      requestAnimationFrame(tick)
    })
    return rows
  })
  const arc = assertDrawOn(frames, 10, 'ring arc')
  console.log(`checkLampGlyph ok ring arcs pathLength 1 on 4/4 arcs draw-on ${Math.round(arc.span)}ms over ${arc.count} frames first share ${arc.first.toFixed(2)}`)
  await context.close()
}

/**
 * One gold cue per screen. A bank of sparks lights the New lamp buttons (#924, out of scope),
 * so this runs on the plain night with no sparks: pick a lamp, plant it, open its card.
 * Zero gold and two or more gold both fail. The selected-lamp state is a second lamp picked while one is planted.
 */
async function checkGlyphOneGold(browser, port, errors, width, height) {
  const label = `${width}x${height}`
  const { context, page } = await openMap(browser, port, width, height, 'a2', { motion: true, search: '?playtest=1&nwSeed=2&nwCam=1' })
  page.on('pageerror', (error) => errors.push(`glyph gold ${label} ${error}`))
  await assertGlyphCamera(page, `${label} one gold`)
  const selected = () =>
    page.evaluate(() => [...document.querySelectorAll('.nw-rail .defend-ability.is-on')].map((node) => (node.textContent || '').trim()))
  const plant = async (tool) => {
    const seat = await glyphNextSeat(page, `${label} one gold`)
    await page.mouse.click(seat.x, seat.y)
    await page.locator(`.defend-pad[data-tower-type="${tool}"] .lamp-upgrade-glyph[data-glyph-variant="map"]`).waitFor()
    await page.waitForTimeout(150)
  }
  const first = await selected()
  assert.ok(first.length === 1 && first[0].startsWith('Love'), `${label} Love starts selected ${JSON.stringify(first)}`)
  await plant('love')
  const plantedGold = await readGold(page, 'love')
  assert.deepEqual(plantedGold.pieceGold, [], `${label} planted glyph paint is gold`)
  assert.equal(plantedGold.gold.length, 1, `${label} planted lamp has exactly one gold cue ${JSON.stringify(plantedGold.gold)}`)
  // The selected-lamp state: a second lamp is picked on the rail, nothing planted for it yet.
  await page.locator('.nw-rail .defend-ability').nth(1).click()
  const picked = await selected()
  assert.equal(picked.length, 1, `${label} one lamp is selected ${JSON.stringify(picked)}`)
  assert.ok(picked[0].startsWith('Logic'), `${label} Logic is the selected lamp ${JSON.stringify(picked)}`)
  const selectedGold = await readGold(page)
  assert.equal(selectedGold.gold.length, 1, `${label} selected lamp has exactly one gold cue ${JSON.stringify(selectedGold.gold)}`)
  await plant('logic')
  await glyphPanToPad(page, 'logic')
  await page.locator('.defend-pad[data-tower-type="logic"]').click({ force: true })
  await page.locator('.defend-tower-card').waitFor()
  const openGold = await readGold(page, 'logic')
  assert.deepEqual(openGold.pieceGold, [], `${label} open-card glyph paint is gold`)
  assert.equal(openGold.gold.length, 1, `${label} open upgrade card has exactly one gold cue ${JSON.stringify(openGold.gold)}`)
  await context.close()
  return { selected: selectedGold.gold.length, planted: plantedGold.gold.length, open: openGold.gold.length }
}

/** The card is 176 wide, its pointer 16x8, the glyph keeps 6px, Begin 8px, the plate edge 2px. Same rules the placer follows. */
const CARD_W = 176
const SOLVER_GLYPH_ZONE = 6
const SOLVER_BEGIN_GAP = 8
/** Begin bobs up 2px on a wide screen (defend-go keyframes); the solver keeps that bob past the asserted gap, as the placer does. */
const SOLVER_BREATH = 2
const SOLVER_EDGE = 2
const SOLVER_FLOOR_MARGIN = 8
const glyphSpotCache = new Map()

/** Every measured box grows by half a pixel before the search, as the placer does, so a rounded box cannot touch a card. */
const SOLVER_EPS = 0.5
const growBox = (box) => ({ left: box.left - SOLVER_EPS, top: box.top - SOLVER_EPS, right: box.right + SOLVER_EPS, bottom: box.bottom + SOLVER_EPS })

/**
 * Every 1px card spot on the plate that clears the glyph plus 6 (body and pointer), Begin minus 8, the whole rail,
 * every rail, clear-row, skill kit and New lamp button, the open lamp's own name, every other lamp (art and type
 * mark) and every other lamp's name, and stays 8px above the bottom row. Counts them. Other lamps' art counts since
 * 1.4.571: a spot that covers a neighbour is not a clear spot.
 * Independent of the placer: it reads only measured boxes.
 */
function glyphClearSpots(frame) {
  const { card, glyph, place, plate } = frame
  if (!card || !glyph || !place || !plate) return null
  const round = (box) => (box ? [box.left, box.top, box.right, box.bottom].map((n) => Math.round(n * 10) / 10) : null)
  const key = JSON.stringify([
    round(plate), round(glyph), Math.round(card.h * 10) / 10, place, round(frame.begin[0]), round(frame.rail), frame.buttons.map(round), frame.clearButtons.map(round),
    frame.kit.map(round), frame.newLamp.map(round), frame.recenter.map(round), frame.rowTop, frame.own.map(round), frame.nbBodies.map(round), frame.nbLabels.map(round),
  ])
  if (glyphSpotCache.has(key)) return glyphSpotCache.get(key)
  const H = card.h
  const zone = { left: glyph.left - SOLVER_GLYPH_ZONE, right: glyph.right + SOLVER_GLYPH_ZONE, top: glyph.top - SOLVER_GLYPH_ZONE, bottom: glyph.bottom + SOLVER_GLYPH_ZONE }
  const blocks = []
  const begin = frame.begin[0]
  if (begin) blocks.push({ left: begin.left, right: begin.right, top: begin.top - SOLVER_BEGIN_GAP - SOLVER_BREATH, bottom: begin.bottom })
  if (frame.rail) blocks.push(growBox(frame.rail))
  blocks.push(...[...frame.buttons, ...frame.clearButtons, ...frame.kit, ...frame.newLamp, ...frame.recenter, ...frame.own].map(growBox))
  if (frame.rowTop != null) blocks.push({ left: -1e6, right: 1e6, top: frame.rowTop - SOLVER_BEGIN_GAP - SOLVER_BREATH, bottom: 1e6 })
  blocks.push(...[...frame.nbBodies, ...frame.nbLabels].map(growBox))
  const pointLeft = plate.left + place.x
  const pointTop = plate.top + place.y
  const hits = (l, t, r, b, box) => l < box.right && r > box.left && t < box.bottom && b > box.top
  let count = 0
  const minLeft = Math.ceil(plate.left + SOLVER_EDGE)
  const maxLeft = Math.floor(plate.right - CARD_W - SOLVER_EDGE)
  const minTop = Math.ceil(plate.top + SOLVER_EDGE)
  // The card never enters the bottom reserve: its bottom stays the reserve and the 8px margin above the plate floor.
  const maxTop = Math.floor(plate.bottom - place.reserve - SOLVER_FLOOR_MARGIN - H)
  for (let top = minTop; top <= maxTop; top += 1) {
    for (let left = minLeft; left <= maxLeft; left += 1) {
      const right = left + CARD_W
      const bottom = top + H
      if (hits(left, top, right, bottom, zone)) continue
      if (blocks.some((box) => hits(left, top, right, bottom, box))) continue
      if (pointLeft >= left + 8 && pointLeft <= right - 8) {
        const above = top + place.h <= pointTop
        const stemTop = above ? bottom : top - 8
        if (hits(pointLeft - 8, stemTop, pointLeft + 8, stemTop + 8, zone)) continue
      }
      count += 1
    }
  }
  glyphSpotCache.set(key, count)
  if (count === 0 && process.env.NW_DEBUG_SPOTS) {
    console.log('NO SPOT', JSON.stringify({ plate: round(plate), glyph: round(glyph), H, place, begin: round(begin), rail: round(frame.rail), buttons: frame.buttons.map(round), newLamp: frame.newLamp.map(round), kit: frame.kit.map(round), rowTop: frame.rowTop, own: frame.own.map(round), nbBodies: frame.nbBodies.map(round), nbLabels: frame.nbLabels.map(round) }))
  }
  return count
}

/**
 * The 1.4.571 rules. They assert, unless NW_GLYPH_COLLECT=1: then a miss is counted by rule so a run against an
 * older build lists every rule it breaks instead of stopping at the first.
 */
const glyphMisses = new Map()
function glyphRule(rule, ok, message) {
  if (ok) return
  if (process.env.NW_GLYPH_COLLECT !== '1') assert.fail(message)
  const row = glyphMisses.get(rule) ?? { count: 0, first: message }
  row.count += 1
  glyphMisses.set(rule, row)
}

function newGlyphStats() {
  return {
    minTip: Infinity, buys: 0, frames: 0, minSpan: Infinity, maxSpan: 0, maxFirst: 0, maxCard: 0, maxHearts: 0, maxEdge: 0, bothSeen: 0,
    minGap: Infinity, headerFrames: 0, headerSettled: 0, brightGold: 0, brightBuys: 0,
    solved: 0, spotsMin: Infinity, noSpot: new Set(), headerBy: new Map(), headerSpotsMax: 0, reserveFrames: 0, reserveMinSlack: Infinity,
    beginFrames: 0, beginMaxOverlap: 0, beginMinSlack: Infinity, beginHitBad: 0, railFrames: 0, railMaxOverlap: 0, clearFrames: 0, clearMaxOverlap: 0,
    nbFrames: 0, nbMaxOverlap: 0, nbHeaderOverlap: 0, nbOverFrames: 0, aboveFrames: 0, underFrames: 0,
    newLampFrames: 0, newLampMaxOverlap: 0, kitFrames: 0, kitMaxOverlap: 0, ownMaxOverlap: 0, ownHeaderOverlap: 0,
    rowFrames: 0, rowMinSlack: Infinity, stripFrames: 0, stripMinSlack: Infinity, bodyFrames: 0, bodyMinH: Infinity, suppressed: 0,
  }
}

function mergeGlyphStats(total, part) {
  for (const key of ['buys', 'frames', 'bothSeen', 'headerFrames', 'headerSettled', 'brightGold', 'brightBuys', 'solved', 'reserveFrames', 'beginFrames', 'beginHitBad', 'railFrames', 'clearFrames', 'nbFrames', 'nbOverFrames', 'aboveFrames', 'underFrames', 'newLampFrames', 'kitFrames', 'rowFrames', 'stripFrames', 'bodyFrames', 'suppressed']) total[key] += part[key]
  for (const key of ['maxFirst', 'maxCard', 'maxHearts', 'maxEdge', 'maxSpan', 'beginMaxOverlap', 'railMaxOverlap', 'clearMaxOverlap', 'nbMaxOverlap', 'nbHeaderOverlap', 'newLampMaxOverlap', 'kitMaxOverlap', 'ownMaxOverlap', 'ownHeaderOverlap']) total[key] = Math.max(total[key], part[key])
  for (const key of ['minSpan', 'minGap', 'minTip', 'spotsMin', 'beginMinSlack', 'reserveMinSlack', 'rowMinSlack', 'stripMinSlack', 'bodyMinH']) total[key] = Math.min(total[key], part[key])
  for (const entry of part.noSpot) total.noSpot.add(entry)
  for (const [key, count] of part.headerBy) total.headerBy.set(key, (total.headerBy.get(key) ?? 0) + count)
  total.headerSpotsMax = Math.max(total.headerSpotsMax, part.headerSpotsMax)
}

/**
 * The rules every frame with the card open must pass.
 * The header copy shows only when the solver finds 0 clear spots for this card; when a spot exists the card
 * clears the glyph (0px2, gap >= 4 with the pointer). Always: the card never covers Begin, a rail lamp button
 * or a clear-row button, and Begin's centre still takes the tap.
 */
function glyphCardRules(frame, where, stats, stageKey, { settled = false } = {}) {
  const card = frame.card
  if (!card) return
  // The card stays out of the bottom reserve: its bottom is at or above the plate floor minus the reserve.
  if (frame.plate && frame.place) {
    const slack = frame.plate.bottom - frame.place.reserve - card.bottom
    stats.reserveFrames += 1
    stats.reserveMinSlack = Math.min(stats.reserveMinSlack, slack)
    assert.ok(slack >= -0.01, `${where}: card bottom ${card.bottom.toFixed(1)} is ${(-slack).toFixed(2)}px inside the bottom reserve (plate floor ${frame.plate.bottom.toFixed(1)} minus reserve ${frame.place.reserve})`)
  }
  // A wave hides the map mark, so a frame without one has only the tap rules to pass.
  if (frame.glyph) {
    const spots = glyphClearSpots(frame)
    assert.ok(spots !== null, `${where}: the solver has no boxes to read (place ${JSON.stringify(frame.place)}, plate ${JSON.stringify(frame.plate)})`)
    stats.solved += 1
    if (spots > 0) stats.spotsMin = Math.min(stats.spotsMin, spots)
    else stats.noSpot.add(stageKey)
    // A neighbour's name, badge or type mark that sits on the mark and is painted over it hides the mark.
    const labelBoxes = [...frame.nbLabels, ...frame.nbMarks]
    const overLabel = labelBoxes.filter((box) => glyphArea(frame.glyph, box) > 0).length
    const under = overLabel > 0 && !frame.above
    if (overLabel > 0) {
      stats.nbOverFrames += 1
      if (frame.above) stats.aboveFrames += 1
    }
    if (under) stats.underFrames += 1
    const typeOver = (frame.typeLabels ?? []).reduce((max, box) => Math.max(max, glyphArea(frame.glyph, box)), 0)
    assert.ok(
      typeOver === 0 || frame.header,
      `${where}: a .defend-type-label overlaps the glyph by ${typeOver}px2 and the card shows no header copy, glyph ${JSON.stringify(frame.glyph)} labels ${JSON.stringify((frame.typeLabels ?? []).filter((box) => glyphArea(frame.glyph, box) > 0))}`,
    )
    if (frame.header) {
      const labelOnMark = frame.nbLabels.some((box) => glyphArea(frame.glyph, box) > 0)
      glyphRule('header copy while a clear spot exists', spots === 0 || labelOnMark, `${where}: the header copy shows while ${spots} card spots clear the glyph+6, Begin-8, the rail, its buttons, the New lamp buttons, the neighbour lamps and their names, glyph ${JSON.stringify(frame.glyph)} card ${JSON.stringify(card)}`)
      if (!labelOnMark) stats.headerSpotsMax = Math.max(stats.headerSpotsMax, spots)
      stats.headerBy.set(stageKey, (stats.headerBy.get(stageKey) ?? 0) + 1)
      if (settled) stats.headerSettled += 1
      else stats.headerFrames += 1
    } else {
      glyphRule('mark under a neighbour name', !under, `${where}: the mark sits under a neighbour name or type mark that paints over it and the card shows no header copy (${frame.aboveWhy}), glyph ${JSON.stringify(frame.glyph)} over ${JSON.stringify(labelBoxes.filter((box) => glyphArea(frame.glyph, box) > 0))}`)
      const covered = glyphArea(frame.glyph, card)
      const gap = glyphGap(frame.glyph, card)
      stats.maxCard = Math.max(stats.maxCard, covered)
      assert.equal(covered, 0, `${where}: card covers the glyph by ${covered}px2 and shows no header copy, glyph ${JSON.stringify(frame.glyph)} card ${JSON.stringify(card)} (${spots} clear spots)`)
      assert.ok(gap >= GLYPH_MIN_GAP, `${where}: card is ${gap.toFixed(2)}px from the glyph and shows no header copy, glyph ${JSON.stringify(frame.glyph)} card ${JSON.stringify(card)}`)
      stats.minGap = Math.min(stats.minGap, gap)
      if (frame.stem) {
        const tip = glyphGap(frame.glyph, frame.stem)
        assert.ok(tip >= GLYPH_MIN_GAP, `${where}: the card pointer is ${tip.toFixed(2)}px from the glyph, glyph ${JSON.stringify(frame.glyph)} pointer ${JSON.stringify(frame.stem)}`)
        stats.minTip = Math.min(stats.minTip, tip)
      }
    }
  }
  const begin = frame.begin[0]
  if (begin) {
    stats.beginFrames += 1
    const over = glyphArea(card, begin)
    stats.beginMaxOverlap = Math.max(stats.beginMaxOverlap, over)
    assert.equal(over, 0, `${where}: card covers Begin by ${over}px2, card ${JSON.stringify(card)} Begin ${JSON.stringify(begin)}`)
    const slack = begin.top - card.bottom
    stats.beginMinSlack = Math.min(stats.beginMinSlack, slack)
    assert.ok(slack >= SOLVER_BEGIN_GAP - 0.01, `${where}: card bottom ${card.bottom.toFixed(1)} is ${slack.toFixed(2)}px above Begin (${begin.top.toFixed(1)}), needs ${SOLVER_BEGIN_GAP}, place ${JSON.stringify(frame.place)} card ${JSON.stringify(card)}`)
    if (frame.beginHit !== true) stats.beginHitBad += 1
    assert.equal(frame.beginHit, true, `${where}: Begin's centre does not land inside .defend-go`)
  }
  if (frame.buttons.length > 0) stats.railFrames += 1
  for (const button of frame.buttons) {
    const over = glyphArea(card, button)
    stats.railMaxOverlap = Math.max(stats.railMaxOverlap, over)
    assert.equal(over, 0, `${where}: card covers a rail lamp button by ${over}px2, card ${JSON.stringify(card)} button ${JSON.stringify(button)}`)
  }
  if (frame.clearButtons.length > 0) stats.clearFrames += 1
  for (const button of frame.clearButtons) {
    const over = glyphArea(card, button)
    stats.clearMaxOverlap = Math.max(stats.clearMaxOverlap, over)
    assert.equal(over, 0, `${where}: card covers a clear-row button by ${over}px2, card ${JSON.stringify(card)} button ${JSON.stringify(button)}`)
  }
  // 1.4.571: New lamp and skill kit buttons are tap targets, the open lamp's own name is never covered, and the card
  // never paints an empty body.
  if (frame.newLamp.length > 0) stats.newLampFrames += 1
  for (const button of frame.newLamp) {
    const over = glyphArea(card, button)
    stats.newLampMaxOverlap = Math.max(stats.newLampMaxOverlap, over)
    glyphRule('card over a New lamp button', over === 0, `${where}: card covers a New lamp button by ${over}px2, card ${JSON.stringify(card)} button ${JSON.stringify(button)}`)
  }
  if (frame.kit.length > 0) stats.kitFrames += 1
  for (const button of frame.kit) {
    const over = glyphArea(card, button)
    stats.kitMaxOverlap = Math.max(stats.kitMaxOverlap, over)
    glyphRule('card over a skill kit button', over === 0, `${where}: card covers a skill kit button by ${over}px2, card ${JSON.stringify(card)} button ${JSON.stringify(button)}`)
  }
  // The open lamp's own name is never covered, unless the frame has no spot that clears it and every tap target:
  // then the card says so with the header copy (the solver counts the name as an obstacle).
  for (const label of frame.own) {
    const over = glyphArea(card, label)
    if (frame.header) {
      stats.ownHeaderOverlap = Math.max(stats.ownHeaderOverlap, over)
      continue
    }
    stats.ownMaxOverlap = Math.max(stats.ownMaxOverlap, over)
    glyphRule('card over the open lamp own name', over === 0, `${where}: card covers the open lamp's own name by ${over}px2 and shows no header copy, card ${JSON.stringify(card)} name ${JSON.stringify(label)}`)
  }
  if (frame.nbBodies.length + frame.nbLabels.length > 0) stats.nbFrames += 1
  for (const [name, list] of [['lamp', frame.nbBodies], ['name', frame.nbLabels]]) {
    for (const box of list) {
      const over = glyphArea(card, box)
      if (frame.header) {
        stats.nbHeaderOverlap = Math.max(stats.nbHeaderOverlap, over)
        continue
      }
      stats.nbMaxOverlap = Math.max(stats.nbMaxOverlap, over)
      glyphRule(`card over a neighbour ${name}`, over === 0, `${where}: card covers a neighbour ${name} by ${over}px2 and shows no header copy, card ${JSON.stringify(card)} ${name} ${JSON.stringify(box)}`)
    }
  }
  if (frame.rowTop != null) {
    const slack = frame.rowTop - card.bottom
    stats.rowFrames += 1
    stats.rowMinSlack = Math.min(stats.rowMinSlack, slack)
    glyphRule('card bottom above the bottom row', slack >= SOLVER_BEGIN_GAP - 0.01, `${where}: card bottom ${card.bottom.toFixed(1)} is ${slack.toFixed(2)}px above the bottom row (${frame.rowTop.toFixed(1)}: Begin, skill kit or Continue), needs ${SOLVER_BEGIN_GAP}`)
  }
  if (frame.strip) {
    stats.stripFrames += 1
    stats.stripMinSlack = Math.min(stats.stripMinSlack, frame.rowTop == null ? -Infinity : frame.rowTop - card.bottom)
    assert.ok(frame.rowTop != null, `${where}: the mid-wave strip has a bottom row to sit above`)
    assert.equal(frame.header, null, `${where}: the mid-wave strip shows a header copy`)
  }
  stats.bodyFrames += 1
  stats.bodyMinH = Math.min(stats.bodyMinH, frame.body?.h ?? 0)
  glyphRule('empty card body', Boolean(frame.body && frame.body.count > 0 && frame.body.h > 0), `${where}: the card paints an empty body (content ${JSON.stringify(frame.body)}, card ${JSON.stringify(card)})`)
}

/**
 * Plants and upgrades through real taps and keeps score. One driver per page so the same
 * per-frame rules run on the shared night and on every single seat.
 */
function glyphDriver(page, label, errors) {
  const stats = newGlyphStats()

  const selected = () =>
    page.evaluate(() => [...document.querySelectorAll('.nw-rail .defend-ability.is-on')].map((node) => (node.textContent || '').trim()))
  const closeCard = async () => {
    if (await page.locator('.defend-tower-card').count()) {
      await page.keyboard.press('Escape')
      await page.locator('.defend-tower-card').waitFor({ state: 'detached' })
    }
  }
  const openCard = async (tool) => {
    await closeCard()
    await glyphPanToPad(page, tool)
    await page.locator(`.defend-pad[data-tower-type="${tool}"]`).click({ force: true })
    await page.locator('.defend-tower-card').waitFor()
    await page.waitForTimeout(450)
  }

  /**
   * The card may sit on the map mark only when it shows its own copy of the mark in the header:
   * same stage, same pieces, a full 28px, inside the card, no gold. Otherwise the card keeps 4px clear.
   */
  const assertHeaderCopy = (view, tool, stage, what) => {
    const header = view.header
    const where = `${label} ${tool} stage ${stage} ${what}`
    assert.ok(header, `${where}: no card slot clears the glyph and no header copy is shown`)
    assert.equal(header.stage, String(stage), `${where}: header copy shows stage ${header.stage}`)
    assert.equal(header.pieces, view.pieces, `${where}: header copy has ${header.pieces} pieces, the map mark has ${view.pieces}`)
    assert.ok(header.box && Math.abs(header.box.w - 28) <= 1 && Math.abs(header.box.h - 28) <= 1, `${where}: header copy is ${JSON.stringify(header.box)}`)
    assert.ok(glyphInside(header.box, view.card), `${where}: header copy ${JSON.stringify(header.box)} is outside the card ${JSON.stringify(view.card)}`)
  }

  /** Mark and card are both on screen, the mark is on the board, and nothing sits on it. */
  const assertSettled = async (tool, stage, what) => {
    const view = await readGlyphStage(page, tool)
    const where = `${label} ${tool} stage ${stage} ${what}`
    assert.ok(view.glyph, `${where}: map glyph is present`)
    assert.ok(view.card, `${where}: upgrade card is present`)
    assert.ok(view.glyph.w >= 18 && view.glyph.h >= 18, `${where}: map glyph is ${view.glyph.w}x${view.glyph.h}`)
    if (view.header) assertHeaderCopy(view, tool, stage, what)
    glyphCardRules(view, where, stats, `${tool}@${stage}`, { settled: true })
    assert.ok(glyphInside(view.glyph, view.board), `${where}: glyph ${JSON.stringify(view.glyph)} is outside the board ${JSON.stringify(view.board)}`)
    assert.ok(glyphInside(view.glyph, view.frame), `${where}: glyph is outside the frame`)
    for (const hearts of view.hearts) {
      assert.equal(glyphArea(view.glyph, hearts), 0, `${where}: glyph overlaps hearts`)
    }
    stats.bothSeen += 1
    return view
  }

  const ladder = async (tool, steps) => {
    let rail = 0
    for (let at = 0; at < steps.length; at += 1) {
      const stage = at + 1
      const step = steps[at]
      await openCard(tool)
      const before = await assertSettled(tool, stage - 1, 'card open before the buy')
      assert.equal(before.stage, String(stage - 1), `${label} ${tool} stage before buy ${stage}`)
      const openPaint = await readGold(page)
      assert.deepEqual(openPaint.pieceGold, [], `${label} ${tool} stage ${stage} card open: glyph paint is gold`)
      const brightGold = openPaint.gold.filter((entry) => entry.includes('defend-bright-buy'))
      stats.brightGold += brightGold.length
      assert.deepEqual(brightGold, [], `${label} ${tool} stage ${stage} card open: the Bright buy is gold`)
      await page.evaluate((id) => window.__glyphStart(id), tool)
      const buy = step.bright
        ? page.locator('.defend-tower-card .defend-bright-buy')
        : page.locator(`.defend-tower-card button.defend-path-buy[data-path-buy="${step.path}"]`)
      assert.equal(await buy.count(), 1, `${label} ${tool} stage ${stage} the card offers the real buy ${JSON.stringify(step)}`)
      if (step.bright) stats.brightBuys += 1
      await buy.click()
      await page.waitForTimeout(520)
      const frames = await page.evaluate(() => window.__glyphEnd())
      stats.buys += 1
      stats.frames += frames.length
      assert.ok(frames.length >= 10, `${label} ${tool} stage ${stage} sampled ${frames.length} frames`)

      let cardFrames = 0
      for (const [index, frame] of frames.entries()) {
        const where = `${label} ${tool} stage ${stage} frame ${index}`
        assert.ok(frame.glyph, `${where}: glyph missing`)
        assert.ok(frame.board, `${where}: board missing`)
        assert.ok(glyphInside(frame.glyph, frame.board), `${where}: glyph ${JSON.stringify(frame.glyph)} left the board ${JSON.stringify(frame.board)}`)
        stats.maxEdge = Math.max(stats.maxEdge, Math.max(frame.board.left - frame.glyph.left, frame.board.top - frame.glyph.top, frame.glyph.right - frame.board.right, frame.glyph.bottom - frame.board.bottom, 0))
        if (frame.card) {
          cardFrames += 1
          if (frame.header) {
            const shown = Number(frame.header.stage)
            assert.ok(shown === stage || shown === stage - 1, `${where}: header copy shows stage ${frame.header.stage}`)
          }
          glyphCardRules(frame, where, stats, `${tool}@${stage}`)
        }
        for (const hearts of frame.hearts) {
          const area = glyphArea(frame.glyph, hearts)
          stats.maxHearts = Math.max(stats.maxHearts, area)
          assert.equal(area, 0, `${where}: glyph overlaps hearts by ${area}px2`)
        }
        const neighbors = [
          ...frame.lamp.map((rect) => ['lamp', rect]),
          ...frame.buttons.map((rect) => ['ability', rect]),
          ...frame.notes.map((rect) => ['note', rect]),
          ...frame.banners.map((rect) => ['banner', rect]),
          ...frame.pace.map((rect) => ['chip', rect]),
          ...frame.begin.map((rect) => ['begin', rect]),
          ...frame.cont.map((rect) => ['continue', rect]),
          ...frame.others.map((rect) => ['glyph', rect]),
        ]
        for (const [name, rect] of neighbors) {
          assert.equal(glyphArea(frame.glyph, rect), 0, `${where}: glyph overlaps ${name} ${JSON.stringify(frame.glyph)} vs ${JSON.stringify(rect)}`)
        }
      }
      assert.ok(cardFrames > 0, `${label} ${tool} stage ${stage} the card was on screen during the buy`)
      const drew = assertDrawOn(frames, stage, `${label} ${tool} stage ${stage}`)
      stats.minSpan = Math.min(stats.minSpan, drew.span)
      stats.maxSpan = Math.max(stats.maxSpan, drew.span)
      stats.maxFirst = Math.max(stats.maxFirst, drew.first)

      await page.waitForFunction(
        ([id, want]) => document.querySelector(`.defend-pad[data-tower-type="${id}"] .lamp-upgrade-glyph[data-glyph-variant="map"]`)?.getAttribute('data-glyph-stage') === want,
        [tool, String(stage)],
      )
      // The card may stay open or close after a buy. Either way, open it and check both again.
      await page.waitForTimeout(300)
      await openCard(tool)
      const after = await assertSettled(tool, stage, 'card open after the real buy')
      assert.equal(after.stage, String(stage), `${label} ${tool} stage attr after buy ${stage}`)
      assert.equal(after.pieces, stage, `${label} ${tool} stage ${stage} drawn pieces`)
      assert.ok(after.rails.some((row) => row.stage === String(stage) && Math.abs(row.w - 28) <= 1 && Math.abs(row.h - 28) <= 1), `${label} ${tool} stage ${stage} rail glyph ${JSON.stringify(after.rails)}`)
      const paint = await readGold(page)
      assert.deepEqual(paint.pieceGold, [], `${label} ${tool} stage ${stage} glyph paint is gold ${paint.pieceGold}`)
      assert.deepEqual(paint.gold.filter((entry) => entry.includes('defend-bright-buy')), [], `${label} ${tool} stage ${stage} the Bright buy is gold`)
      if (after.tone === 'strong') {
        assert.deepEqual(after.colors, [hexToRgb(LAMP_GLYPH_COLOR.strong)], `${label} ${tool} stage ${stage} strong arms paint ${after.colors}`)
      }
      rail = stage
    }
    await closeCard()
    return rail
  }

  return { stats, selected, closeCard, openCard, ladder }
}

function glyphStatsLine(label, what, stats, gold) {
  const spots = stats.spotsMin === Infinity ? 'n/a' : stats.spotsMin
  const noSpot = [...stats.noSpot]
  return (
    `checkLampGlyph ok ${label} ${what} real buys ${stats.buys} frames ${stats.frames} ` +
    `draw-span ${Math.round(stats.minSpan)}-${Math.round(stats.maxSpan)}ms max first-2-frames share ${stats.maxFirst.toFixed(2)} ` +
    `card/glyph overlap max ${stats.maxCard}px2 min gap ${stats.minGap === Infinity ? 'n/a' : `${stats.minGap.toFixed(2)}px`} pointer tip min gap ${stats.minTip === Infinity ? 'n/a' : `${stats.minTip.toFixed(2)}px`} ` +
    `(card+glyph both present ${stats.bothSeen}x) header copy ${stats.headerFrames} frames ${stats.headerSettled} settled, solver spots on header frames max ${stats.headerSpotsMax} (must be 0), by seat/stage [${[...stats.headerBy].map(([key, count]) => `${key}x${count}`).join(' ') || 'none'}] ` +
    `solver ${stats.solved} card frames, clear spots min ${spots}, ${noSpot.length} stages with no clear spot${noSpot.length ? ` [${noSpot.join(' ')}]` : ''} ` +
    `reserve ${stats.reserveFrames} frames min card-bottom-to-reserve ${stats.reserveMinSlack === Infinity ? 'n/a' : `${stats.reserveMinSlack.toFixed(2)}px`} (>=0) ` +
    `Begin ${stats.beginFrames} frames overlap max ${stats.beginMaxOverlap}px2 min card-bottom-to-Begin ${stats.beginMinSlack === Infinity ? 'n/a' : `${stats.beginMinSlack.toFixed(2)}px`} (>=8) centre tap miss ${stats.beginHitBad} ` +
    `rail buttons ${stats.railFrames} frames overlap max ${stats.railMaxOverlap}px2 clear-row buttons ${stats.clearFrames} frames overlap max ${stats.clearMaxOverlap}px2 ` +
    `neighbours ${stats.nbFrames} frames card overlap max ${stats.nbMaxOverlap}px2 (header-copy frames max ${stats.nbHeaderOverlap}px2) ` +
    `mark under a name ${stats.underFrames} frames, painted above the names on ${stats.aboveFrames} of ${stats.nbOverFrames} frames where a name sits on it ` +
    `New lamp buttons ${stats.newLampFrames} frames overlap max ${stats.newLampMaxOverlap}px2 skill kit ${stats.kitFrames} frames overlap max ${stats.kitMaxOverlap}px2 own name overlap max ${stats.ownMaxOverlap}px2 (header-copy frames max ${stats.ownHeaderOverlap}px2) ` +
    `bottom row ${stats.rowFrames} frames min card-bottom-to-row ${stats.rowMinSlack === Infinity ? 'n/a' : `${stats.rowMinSlack.toFixed(2)}px`} (>=8) empty-body frames 0 of ${stats.bodyFrames} min content ${stats.bodyMinH === Infinity ? 'n/a' : `${stats.bodyMinH.toFixed(0)}px`} ` +
    `glyph outside board max ${stats.maxEdge.toFixed(1)}px hearts overlap max ${stats.maxHearts}px2 ` +
    `bright buys ${stats.brightBuys} bright gold===${stats.brightGold}` +
    (gold ? ` selected-lamp gold===${gold.selected} planted gold===${gold.planted} open-card gold===${gold.open}` : '')
  )
}

/** Every glyph and card session runs with the camera on, as it is for a player. A camera-off pass proves nothing here. */
async function assertGlyphCamera(page, where) {
  const camera = await page.evaluate(() => /[?&]nwCam=1\b/.test(location.search) && (Boolean(document.querySelector('.nw-zoom')) || document.querySelector('.defend-board')?.getBoundingClientRect().left < 0))
  assert.ok(camera, `${where} the camera is on (nwCam=1), as it is for a player`)
}

const SEAT_SWEEP_SIZES = ['375x667', '390x844', '412x915', '320x568', '300x540']
/** The live state: camera on (the default on a phone), banked sparks from the jump, lamps already planted around the seat. */
const GLYPH_LIVE_SEARCH = `${GLYPH_SEARCH}&nwCam=1`
const GLYPH_NEIGHBOR_TYPES = ['logic', 'reason', 'science', 'candle']
/** The seat the 1.4.569 live prove caught: 375x667, board units. Its tall stages have no spot clear of the glyph, Begin and the rail. */
const FAILING_SEAT = { size: '375x667', cx: 464, cy: 768 }

function glyphSeatPoint(page, ring) {
  return page.evaluate((seat) => {
    const svg = document.querySelector('.defend-board')
    const ctm = svg?.getScreenCTM()
    if (!svg || !ctm) return null
    const p = svg.createSVGPoint()
    p.x = seat.cx
    p.y = seat.cy - 26
    const q = p.matrixTransform(ctm)
    const hit = document.elementFromPoint(q.x, q.y)
    if (!hit || !hit.closest('.defend-board') || hit.closest('button, .nw-rail, .nw-docks')) return null
    return { x: q.x, y: q.y }
  }, ring)
}

/** Drag the map, as a player does, until the seat takes a tap. */
async function glyphReachSeat(page, ring, label) {
  let point = await glyphSeatPoint(page, ring)
  for (let attempt = 0; attempt < 8 && !point; attempt += 1) {
    const at = await page.evaluate((seat) => {
      const svg = document.querySelector('.defend-board')
      const p = svg.createSVGPoint()
      p.x = seat.cx
      p.y = seat.cy - 26
      const q = p.matrixTransform(svg.getScreenCTM())
      return { x: q.x, y: q.y, w: innerWidth, h: innerHeight }
    }, ring)
    const cx = at.w / 2
    const cy = at.h / 2
    const dx = Math.max(-150, Math.min(150, cx - at.x))
    const dy = Math.max(-250, Math.min(250, cy - at.y))
    await page.mouse.move(cx, cy)
    await page.mouse.down()
    await page.mouse.move(cx + dx / 2, cy + dy / 2, { steps: 5 })
    await page.mouse.move(cx + dx, cy + dy, { steps: 5 })
    await page.mouse.up()
    await page.waitForTimeout(1300)
    point = await glyphSeatPoint(page, ring)
  }
  assert.ok(point, `${label} seat ${ring.cx},${ring.cy} takes a real tap after dragging the map`)
  return point
}

/** The next free seat, panned into reach with real drags. Camera on, so a seat may start off screen. */
async function glyphNextSeat(page, label) {
  const ring = await page.evaluate(() => {
    const node = document.querySelector('.defend-plant-ground circle.is-live')
    return node ? { cx: Number(node.getAttribute('cx')), cy: Number(node.getAttribute('cy')) } : null
  })
  assert.ok(ring, `${label} a live seat is left to plant`)
  return glyphReachSeat(page, ring, label)
}

/** Drag the map until a planted lamp sits well inside the frame, so a real tap on it lands. */
async function glyphPanToPad(page, tool) {
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const at = await page.evaluate((id) => {
      const pad = document.querySelector(`.defend-pad[data-tower-type="${id}"]`)
      const frame = document.querySelector('.defend-frame')?.getBoundingClientRect()
      if (!pad || !frame) return null
      const box = pad.getBoundingClientRect()
      const x = box.left + box.width / 2
      const y = box.top + box.height / 2
      const inside = x > frame.left + 50 && x < frame.right - 90 && y > frame.top + 60 && y < frame.bottom - 120
      return { x, y, inside, w: innerWidth, h: innerHeight }
    }, tool)
    if (!at || at.inside) return
    const cx = at.w / 2
    const cy = at.h / 2
    const dx = Math.max(-150, Math.min(150, cx - at.x))
    const dy = Math.max(-250, Math.min(250, cy - at.y))
    await page.mouse.move(cx, cy)
    await page.mouse.down()
    await page.mouse.move(cx + dx / 2, cy + dy / 2, { steps: 5 })
    await page.mouse.move(cx + dx, cy + dy, { steps: 5 })
    await page.mouse.up()
    await page.waitForTimeout(1300)
  }
}

async function glyphPlantAt(page, tool, ring, label) {
  if (await page.locator('.defend-tower-card').count()) {
    await page.keyboard.press('Escape')
    await page.locator('.defend-tower-card').waitFor({ state: 'detached' })
  }
  if (tool === 'candle') {
    await page.locator('[data-candle-lamp="yes"]').click()
  } else {
    const index = GLYPH_TOOLS.indexOf(tool)
    const on = await page.evaluate(() => [...document.querySelectorAll('.nw-rail .defend-ability.is-on')].map((node) => (node.textContent || '').trim()))
    if (!(on.length === 1 && on[0].startsWith(GLYPH_NAME[tool]))) await page.locator('.nw-rail .defend-ability').nth(index).click()
  }
  const point = await glyphReachSeat(page, ring, label)
  await page.mouse.click(point.x, point.y)
  await page.waitForFunction(
    (seat) => ![...document.querySelectorAll('.defend-plant-ground circle.is-live')].some((node) => Number(node.getAttribute('cx')) === seat.cx && Number(node.getAttribute('cy')) === seat.cy),
    ring,
  )
  await page.waitForTimeout(250)
  if (await page.locator('.defend-tower-card').count()) {
    await page.keyboard.press('Escape')
    await page.locator('.defend-tower-card').waitFor({ state: 'detached' })
  }
}

/**
 * The live state, once per seat: camera on, banked sparks, a lamp planted on every other seat, then the tested
 * lamp on this seat and the full eight real buys. The card never covers the map mark (body or pointer) at
 * 375, 390 and 412. Only the narrowest phone may fall back to the header copy.
 */
async function checkGlyphSeatSweep(browser, port, errors, width, height) {
  const label = `${width}x${height}`
  const probe = await openMap(browser, port, width, height, 'a2', { motion: true, search: GLYPH_LIVE_SEARCH })
  const rings = await probe.page.evaluate(() =>
    [...document.querySelectorAll('.defend-plant-ground circle.is-live')].map((ring) => ({ cx: Number(ring.getAttribute('cx')), cy: Number(ring.getAttribute('cy')) })),
  )
  await probe.context.close()
  assert.ok(rings.length >= 3, `${label} seat sweep finds ${rings.length} live seats`)
  if (label === FAILING_SEAT.size) {
    assert.ok(rings.some((ring) => ring.cx === FAILING_SEAT.cx && ring.cy === FAILING_SEAT.cy), `${label} the 1.4.569 failing seat ${FAILING_SEAT.cx},${FAILING_SEAT.cy} is a live seat ${JSON.stringify(rings)}`)
  }
  const total = newGlyphStats()
  const seen = []
  let neighbors = 0
  for (const ring of rings) {
    if (process.env.NW_GLYPH_SEAT && process.env.NW_GLYPH_SEAT !== `${ring.cx},${ring.cy}`) continue
    const where = `${label} seat ${ring.cx},${ring.cy}`
    const { context, page } = await openMap(browser, port, width, height, 'a2', { motion: true, search: GLYPH_LIVE_SEARCH })
    page.on('pageerror', (error) => errors.push(`glyph seat ${where} ${error}`))
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(`glyph seat ${where} ${msg.text()}`)
    })
    await glyphSetup(page)
    await assertGlyphCamera(page, where)
    const sparks = await page.evaluate(() => Number((document.body.innerText.match(/(\d+)\s*\n?\s*Sparks/) || [])[1] || 0))
    assert.ok(sparks >= 95, `${where} starts with banked sparks (${sparks})`)
    const others = rings.filter((other) => other !== ring)
    for (const [index, other] of others.entries()) {
      await glyphPlantAt(page, GLYPH_NEIGHBOR_TYPES[index % GLYPH_NEIGHBOR_TYPES.length], other, where)
      neighbors += 1
    }
    const planted = await page.locator('.defend-pad').count()
    assert.equal(planted, others.length, `${where} ${others.length} other lamps are planted around the seat (${planted})`)
    await glyphPlantAt(page, 'love', ring, where)
    const driver = glyphDriver(page, where, errors)
    assert.equal(await page.locator('.defend-pad[data-tower-type="love"]').count(), 1, `${where} one tested lamp`)
    assert.equal(await page.locator('.defend-new-lamp').count() > 0, true, `${where} the New lamp buttons show with banked sparks`)
    assert.equal(await driver.ladder('love', GLYPH_LADDER), 8, `${where} reached stage 8 by real buys`)
    driver.stats.noSpot = new Set([...driver.stats.noSpot].map((entry) => `${ring.cx},${ring.cy}:${entry}`))
    mergeGlyphStats(total, driver.stats)
    const headerHere = driver.stats.headerFrames + driver.stats.headerSettled
    seen.push(`${ring.cx},${ring.cy}${headerHere > 0 ? ' header' : ''}`)
    // 1.4.571: with four neighbour lamps around the seat (they are soft obstacles) a plate may have no spot that clears
    // the mark, the taps and every neighbour. Then the header copy is allowed, and only then: glyphCardRules makes the
    // solver find 0 spots on every header frame. The counts are reported per size, not capped.
    if (label === FAILING_SEAT.size && ring.cx === FAILING_SEAT.cx && ring.cy === FAILING_SEAT.cy) {
      assert.equal(headerHere, 0, `${where} the compact card keeps a clear spot, so the header copy stays off (${headerHere} header frames, ${driver.stats.noSpot.size} stages with no spot)`)
      assert.equal(driver.stats.noSpot.size, 0, `${where} every stage has a clear spot`)
    }
    await context.close()
  }
  assert.ok(total.solved > 0, `${label} seat sweep ran the clear-spot solver`)
  assert.ok(total.beginFrames > 0 && total.railFrames > 0, `${label} seat sweep saw Begin on ${total.beginFrames} frames and the rail on ${total.railFrames}`)
  assert.ok(Number.isFinite(total.minGap) || total.headerSettled > 0, `${label} seat sweep measured a card gap`)
  if (Number.isFinite(total.minGap)) assert.ok(total.minGap >= GLYPH_MIN_GAP, `${label} seat sweep min gap ${total.minGap.toFixed(2)}px`)
  if (Number.isFinite(total.minTip)) assert.ok(total.minTip >= GLYPH_MIN_GAP, `${label} seat sweep pointer tip gap ${total.minTip.toFixed(2)}px`)
  console.log(glyphStatsLine(label, `live state seat sweep camera on, banked sparks, ${rings.length} seats with ${neighbors / rings.length} neighbour lamps each [${seen.join(' | ')}]`, total))
}

/**
 * The wave and its clear row. A lamp planted on the hardest seat, Begin pressed, the card open mid-wave, then the
 * wave cleared by real taps on the walkers and the card open over the clear row (Continue, New lamp).
 * Every frame passes the same card rules: glyph clear or header copy with no spot, never over a tap target.
 */
async function checkGlyphClearRow(browser, port, errors, width, height) {
  const label = `${width}x${height}`
  const { context, page } = await openMap(browser, port, width, height, 'a2', { motion: true, search: '?playtest=1&nwSeed=2&nwRound=2&nwLamps=0&nwCam=1' })
  const where = `${label} clear row`
  page.on('pageerror', (error) => errors.push(`glyph ${where} ${error}`))
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(`glyph ${where} ${msg.text()}`)
  })
  await glyphSetup(page)
  await assertGlyphCamera(page, where)
  const rings = await page.evaluate(() =>
    [...document.querySelectorAll('.defend-plant-ground circle.is-live')].map((ring) => ({ cx: Number(ring.getAttribute('cx')), cy: Number(ring.getAttribute('cy')) })),
  )
  assert.ok(rings.length >= 3, `${where} finds ${rings.length} live seats`)
  const ring = rings.find((entry) => entry.cx === FAILING_SEAT.cx && entry.cy === FAILING_SEAT.cy) ?? rings[rings.length - 1]
  await glyphPlantAt(page, 'love', ring, where)
  const stats = newGlyphStats()
  const sample = async (stageKey, wait) => {
    for (let attempt = 0; attempt < 6 && (await page.locator('.defend-tower-card').count()) < 1; attempt += 1) {
      await page.locator('.defend-pad[data-tower-type="love"]').click({ force: true })
      await page.waitForTimeout(350)
    }
    await page.locator('.defend-tower-card').waitFor({ timeout: 5000 })
    await page.waitForTimeout(400)
    await page.evaluate(() => window.__glyphStart('love'))
    await page.waitForTimeout(wait)
    const frames = await page.evaluate(() => window.__glyphEnd())
    assert.ok(frames.length >= 10, `${where} ${stageKey} sampled ${frames.length} frames`)
    let n = 0
    for (const [index, frame] of frames.entries()) {
      if (!frame.card) continue
      n += 1
      glyphCardRules(frame, `${where} ${stageKey} frame ${index}`, stats, `${stageKey}`)
    }
    assert.ok(n > 0, `${where} ${stageKey} the card was open (${frames.length} frames, card ${frames.filter((f) => f.card).length}, glyph ${frames.filter((f) => f.glyph).length}, place ${frames.filter((f) => f.place).length})`)
    await page.keyboard.press('Escape')
    await page.locator('.defend-tower-card').waitFor({ state: 'detached' })
    return n
  }
  await page.locator('.defend-go').click()
  await page.waitForSelector('.easy-walker, [data-walker-id]', { state: 'attached', timeout: 20_000 })
  const wave = await sample('mid-wave', 700)
  glyphRule('mid-wave buy strip placed above the bottom row', stats.stripFrames > 0, `${where} mid-wave the card is the placed buy strip (${stats.stripFrames} strip frames)`)
  const strip = { frames: stats.stripFrames, slack: stats.stripMinSlack }
  const railDuringWave = stats.railFrames
  assert.ok(railDuringWave > 0 && stats.clearFrames === 0, `${where} mid-wave the rail shows and the clear row does not (${railDuringWave} rail frames, ${stats.clearFrames} clear-row frames)`)
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
  await page.locator('.defend-continue').waitFor()
  await page.waitForTimeout(600)
  const clear = await sample('clear-row', 900)
  assert.ok(stats.clearFrames > 0, `${where} the clear row buttons were on screen with the card open`)
  assert.equal(stats.beginHitBad, 0, `${where} Begin centre tap`)
  console.log(
    `checkLampGlyph ok ${label} clear-row session seat ${ring.cx},${ring.cy} mid-wave card frames ${wave} clear-row card frames ${clear} ` +
      `nwCam=1 reserve ${stats.reserveFrames} frames min card-bottom-to-reserve ${stats.reserveMinSlack === Infinity ? 'n/a' : `${stats.reserveMinSlack.toFixed(2)}px`} (>=0) ` +
      `rail buttons ${stats.railFrames} frames overlap max ${stats.railMaxOverlap}px2 clear-row buttons ${stats.clearFrames} frames overlap max ${stats.clearMaxOverlap}px2 ` +
      `mid-wave strip ${strip.frames} frames min card-bottom-to-row ${strip.slack.toFixed(2)}px (>=8) New lamp ${stats.newLampFrames} frames overlap max ${stats.newLampMaxOverlap}px2 ` +
      `neighbours ${stats.nbFrames} frames overlap max ${stats.nbMaxOverlap}px2 bottom row ${stats.rowFrames} frames min slack ${stats.rowMinSlack.toFixed(2)}px empty-body frames 0 of ${stats.bodyFrames} min content ${stats.bodyMinH.toFixed(0)}px ` +
      `Begin frames ${stats.beginFrames} overlap max ${stats.beginMaxOverlap}px2 header copy ${stats.headerFrames} frames solver spots on header frames max ${stats.headerSpotsMax} (must be 0) by stage [${[...stats.headerBy].map(([key, count]) => `${key}x${count}`).join(' ') || 'none'}] ` +
      `clear spots min ${stats.spotsMin === Infinity ? 'n/a' : stats.spotsMin} stages with no clear spot ${stats.noSpot.size} ` +
      `card/glyph overlap max ${stats.maxCard}px2 min gap ${stats.minGap === Infinity ? 'n/a' : `${stats.minGap.toFixed(2)}px`}`,
  )
  await context.close()
}

/**
 * A lamp bought to its last step, then a wave with its card tapped open. Nothing is left to buy, so no card
 * frame is painted: every frame either has no card or a card with content. Never an empty purple box.
 */
const MAXWAVE_TOOL = process.env.NW_MAXWAVE_TOOL || 'science'

async function checkGlyphMaxWave(browser, port, errors, width, height) {
  const label = `${width}x${height}`
  const where = `${label} max lamp wave`
  const { context, page } = await openMap(browser, port, width, height, 'a2', { motion: true, search: GLYPH_LIVE_SEARCH })
  page.on('pageerror', (error) => errors.push(`glyph ${where} ${error}`))
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(`glyph ${where} ${msg.text()}`)
  })
  await glyphSetup(page)
  await assertGlyphCamera(page, where)
  const rings = await page.evaluate(() =>
    [...document.querySelectorAll('.defend-plant-ground circle.is-live')].map((ring) => ({ cx: Number(ring.getAttribute('cx')), cy: Number(ring.getAttribute('cy')) })),
  )
  assert.ok(rings.length >= 3, `${where} finds ${rings.length} live seats`)
  const ring = rings.find((entry) => entry.cx === FAILING_SEAT.cx && entry.cy === FAILING_SEAT.cy) ?? rings[rings.length - 1]
  await glyphPlantAt(page, MAXWAVE_TOOL, ring, where)
  const driver = glyphDriver(page, where, errors)
  assert.equal(await driver.ladder(MAXWAVE_TOOL, GLYPH_LADDER), 8, `${where} reached stage 8 by real buys`)
  await driver.closeCard()
  await page.locator('.defend-go').click()
  await page.waitForSelector('.easy-walker, [data-walker-id]', { state: 'attached', timeout: 20_000 })
  const stats = newGlyphStats()
  let openFrames = 0
  let noCard = 0
  let cardFrames = 0
  for (let attempt = 0; attempt < 4 && openFrames < 5; attempt += 1) {
    await page.locator('.defend-clear-lamp').first().click({ force: true })
    await page.waitForTimeout(350)
    await page.evaluate((id) => window.__glyphStart(id), MAXWAVE_TOOL)
    await page.waitForTimeout(900)
    const frames = await page.evaluate(() => window.__glyphEnd())
    if (process.env.NW_DEBUG_CARD) console.log('CARD', await page.evaluate(() => document.querySelector('.defend-tower-card')?.outerHTML.slice(0, 3000)))
    assert.ok(frames.length >= 10, `${where} sampled ${frames.length} frames`)
    for (const [index, frame] of frames.entries()) {
      if (!frame.wave || !frame.open) continue
      openFrames += 1
      if (!frame.card) {
        noCard += 1
        continue
      }
      cardFrames += 1
      glyphCardRules(frame, `${where} frame ${index}`, stats, 'max-wave')
    }
  }
  assert.ok(openFrames >= 5, `${where} the lamp was open for ${openFrames} wave frames`)
  stats.suppressed = noCard
  console.log(
    `checkLampGlyph ok ${label} max-lamp wave seat ${ring.cx},${ring.cy} nwCam=1 lamp open ${openFrames} wave frames, card painted on ${cardFrames}, card not shown on ${noCard} (nothing left to buy) ` +
      `empty-body frames 0 of ${stats.bodyFrames} min content ${stats.bodyMinH === Infinity ? 'n/a' : `${stats.bodyMinH.toFixed(0)}px`} ` +
      `bottom row ${stats.rowFrames} frames min card-bottom-to-row ${stats.rowMinSlack === Infinity ? 'n/a' : `${stats.rowMinSlack.toFixed(2)}px`} (>=8) reserve ${stats.reserveFrames} frames`,
  )
  await context.close()
}

/** Love at 464,360 with Reason on the seat above. The 1.4.571 live fail: Reason's name sits on the Love mark. */
const LABEL_OVER_SEATS = { love: { cx: 464, cy: 360 }, reason: { cx: 464, cy: 224 } }
const LABEL_OVER_SEARCH = '?playtest=1&nwSeed=2&nwMap=a2&nwRound=18&nwLamps=0&nwCam=1'
const LABEL_OVER_SIZES = (process.env.NW_LABEL_SIZE || '375x667,390x844,412x915').split(',').map((size) => size.split('x').map(Number))

async function checkLabelOverGlyph(browser, port, errors) {
  for (const [width, height] of LABEL_OVER_SIZES) {
    const label = `${width}x${height}`
    const where = `${label} label over glyph`
    const { context, page } = await openMap(browser, port, width, height, 'a2', { motion: true, search: LABEL_OVER_SEARCH })
    page.on('pageerror', (error) => errors.push(`label over glyph ${where} ${error}`))
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(`label over glyph ${where} ${msg.text()}`)
    })
    await glyphSetup(page)
    await assertGlyphCamera(page, where)
    const rings = await page.evaluate(() =>
      [...document.querySelectorAll('.defend-plant-ground circle.is-live')].map((ring) => ({ cx: Number(ring.getAttribute('cx')), cy: Number(ring.getAttribute('cy')) })),
    )
    for (const seat of [LABEL_OVER_SEATS.reason, LABEL_OVER_SEATS.love]) {
      assert.ok(rings.some((ring) => ring.cx === seat.cx && ring.cy === seat.cy), `${where} seat ${seat.cx},${seat.cy} is live ${JSON.stringify(rings)}`)
    }
    await glyphPlantAt(page, 'reason', LABEL_OVER_SEATS.reason, where)
    await glyphPlantAt(page, 'love', LABEL_OVER_SEATS.love, where)
    assert.equal(await page.locator('.defend-pad[data-tower-type="reason"]').count(), 1, `${where} Reason is planted`)
    assert.equal(await page.locator('.defend-pad[data-tower-type="love"]').count(), 1, `${where} Love is planted`)
    const driver = glyphDriver(page, where, errors)
    assert.equal(await driver.ladder('love', GLYPH_LADDER), 8, `${where} reached stage 8 by real buys`)
    await driver.closeCard()
    await glyphPanToPad(page, 'love')
    // 923e framed Love's mark near x=140. Centered, the card has no clear spot, so the header hides the label overlap.
    for (let nudge = 0; nudge < 4; nudge += 1) {
      const at = await page.evaluate(() => {
        const box = document.querySelector('.defend-pad[data-tower-type="love"] .lamp-upgrade-glyph[data-glyph-variant="map"]')?.getBoundingClientRect()
        return box ? { left: box.left, w: innerWidth, h: innerHeight } : null
      })
      if (!at || Math.abs(at.left - 140) < 8) break
      const dx = Math.max(-140, Math.min(140, 140 - at.left))
      const cx = at.w / 2
      const cy = at.h / 2
      await page.mouse.move(cx, cy)
      await page.mouse.down()
      await page.mouse.move(cx + dx, cy, { steps: 6 })
      await page.mouse.up()
      await page.waitForTimeout(500)
    }
    await page.evaluate(() => window.__glyphStart('love'))
    await page.locator('.defend-pad[data-tower-type="love"]').click({ force: true })
    await page.locator('.defend-tower-card').waitFor()
    await page.waitForTimeout(520)
    const frames = await page.evaluate(() => window.__glyphEnd())
    const stats = newGlyphStats()
    let n = 0
    let maxOver = 0
    for (const [index, frame] of frames.entries()) {
      if (!frame.card || !frame.glyph) continue
      n += 1
      const over = (frame.typeLabels ?? []).reduce((max, box) => Math.max(max, glyphArea(frame.glyph, box)), 0)
      maxOver = Math.max(maxOver, over)
      assert.ok(
        over === 0 || frame.header,
        `${where} pop frame ${index}: a .defend-type-label overlaps the glyph by ${over}px2 and the card shows no header copy, glyph ${JSON.stringify(frame.glyph)} labels ${JSON.stringify(frame.typeLabels)} header ${JSON.stringify(frame.header)}`,
      )
      glyphCardRules(frame, `${where} pop frame ${index}`, stats, 'pop')
    }
    assert.ok(n >= 8, `${where} sampled ${n} card-open frames (need every pop-in frame, not one)`)
    assert.equal(stats.beginHitBad, 0, `${where} Begin centre tap`)
    assert.ok(stats.beginFrames > 0 && stats.railFrames > 0, `${where} saw Begin and the rail with the card open`)
    const shotDir = process.env.NW_LABEL_SHOT_DIR
    if (shotDir && width === 375) {
      mkdirSync(shotDir, { recursive: true })
      await page.screenshot({ path: join(shotDir, '375-card-open.png') })
      const clip = await page.evaluate(() => {
        const glyph = document.querySelector('.defend-pad[data-tower-type="love"] .lamp-upgrade-glyph[data-glyph-variant="map"]')?.getBoundingClientRect()
        const label = [...document.querySelectorAll('text.defend-type-label')].find((node) => (node.textContent || '').includes('Reason'))?.getBoundingClientRect()
        if (!glyph) return null
        const left = Math.max(0, Math.min(glyph.left, label?.left ?? glyph.left) - 40)
        const top = Math.max(0, Math.min(glyph.top, label?.top ?? glyph.top) - 40)
        const right = Math.min(innerWidth, Math.max(glyph.right, label?.right ?? glyph.right) + 40)
        const bottom = Math.min(innerHeight, Math.max(glyph.bottom, label?.bottom ?? glyph.bottom) + 56)
        return { x: left, y: top, width: Math.max(8, right - left), height: Math.max(8, bottom - top) }
      })
      if (clip) await page.screenshot({ path: join(shotDir, '375-glyph-crop.png'), clip })
    }
    console.log(`checkLabelOverGlyph ok ${label} frames=${n}`)
    if (maxOver > 0) console.log(`checkLabelOverGlyph ${label} header covered label overlap max ${maxOver.toFixed(2)}px2`)
    await context.close()
  }
}

const OFFTOP_SIZES = [
  [375, 667],
  [390, 844],
  [412, 915],
]

/** Drag the camera. Content follows the finger: up (negative dy) sends lamps toward the top of the clip. */
async function offTopDrag(page, dy) {
  const box = await page.locator('.nw-cam').boundingBox()
  assert.ok(box, 'off-top pan needs the camera')
  const x0 = box.x + Math.min(box.width * 0.42, box.width - 90)
  const y0 = box.y + box.height * 0.5
  const y1 = Math.max(box.y + 24, Math.min(box.y + box.height - 24, y0 + dy))
  await page.mouse.move(x0, y0)
  await page.mouse.down()
  await page.mouse.move(x0, y1, { steps: 8 })
  await page.mouse.up()
  await page.waitForTimeout(40)
}

/**
 * #932: a lamp whose art is fully above the clip paints no map mark, and two marks never overlap.
 * Pan one lamp off the top, then both, then bring one back. Sample every frame.
 */
async function checkOffTopGlyph(browser, port, errors) {
  for (const [width, height] of OFFTOP_SIZES) {
    const label = `${width}x${height}`
    const { context, page } = await openMap(browser, port, width, height, 'a2', {
      motion: true,
      search: '?playtest=1&nwSeed=2&nwRound=24&nwLamps=0&nwCam=1',
    })
    page.on('pageerror', (error) => errors.push(`off top ${label} ${error}`))
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(`off top ${label} ${msg.text()}`)
    })
    await assertGlyphCamera(page, `${label} off top`)
    const plan = await page.evaluate(() => {
      const cam = document.querySelector('.nw-cam')
      const zoom = document.querySelector('.nw-zoom')
      const seats = [...document.querySelectorAll('.defend-plant-ground circle.is-live')].map((node) => ({
        cx: Number(node.getAttribute('cx')),
        cy: Number(node.getAttribute('cy')),
      }))
      if (!cam || !zoom) return { seats, yMax: null }
      const camW = cam.clientWidth
      const camH = cam.clientHeight
      const s0 = Number.parseFloat(zoom.style.width) / 798
      const z = Number.parseFloat((String(zoom.style.transform).match(/scale\(([^)]+)\)/) || [])[1] || '1')
      const k = s0 * z
      const tyMin = camH - 1134 * k
      return { seats, yMax: k > 0 ? -tyMin / k : null, camW, camH, k }
    })
    assert.ok(plan.yMax != null, `${label} camera pan limit`)
    const able = plan.seats.filter((seat) => seat.cy <= plan.yMax - 4).sort((a, b) => a.cy - b.cy || a.cx - b.cx)
    const high = able[0]
    const low = able.find((seat) => high && seat.cy >= high.cy + 40)
    assert.ok(
      high && low,
      `${label} needs two live seats that can pan fully above the clip (yMax ${plan.yMax == null ? 'n/a' : plan.yMax.toFixed(1)}, seats ${JSON.stringify(plan.seats)})`,
    )
    await glyphPlantAt(page, 'love', high, `${label} off top`)
    await glyphPlantAt(page, 'logic', low, `${label} off top`)
    assert.equal(await page.locator('.defend-pad[data-tower-type="love"]').count(), 1, `${label} Love is planted`)
    assert.equal(await page.locator('.defend-pad[data-tower-type="logic"]').count(), 1, `${label} Logic is planted`)
    for (const tool of ['love', 'logic']) {
      await glyphPanToPad(page, tool)
      for (let step = 0; step < 3; step += 1) {
        if ((await page.locator('.defend-tower-card').count()) < 1) {
          await page.locator(`.defend-pad[data-tower-type="${tool}"]`).click({ force: true })
          await page.locator('.defend-tower-card').waitFor()
        }
        await page.locator('.defend-tower-card button.defend-path-buy[data-path-buy="strong"]').click()
        // A path buy ignores a second tap for 350ms. Wait that out before Escape.
        await page.waitForTimeout(420)
      }
      const card = page.locator('.defend-tower-card')
      await page.keyboard.press('Escape')
      for (let attempt = 0; attempt < 3 && (await card.count()); attempt += 1) {
        await page.waitForTimeout(120)
        await page.keyboard.press('Escape')
      }
      await card.waitFor({ state: 'detached' })
    }
    await page.evaluate(
      ({ half, up }) => {
        const boxOf = (el) => {
          if (!el) return null
          const rect = el.getBoundingClientRect()
          if (rect.width < 1 || rect.height < 1) return null
          return { left: rect.left, top: rect.top, right: rect.right, bottom: rect.bottom }
        }
        const overlap = (a, b) => {
          const w = Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left))
          const h = Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top))
          return w * h
        }
        window.__offTopSample = () => {
          const board = document.querySelector('.defend-board')
          const frame = board?.closest('.defend-frame')?.getBoundingClientRect()
          const edge = board?.getBoundingClientRect()
          const ctm = board?.getScreenCTM()
          if (!board || !edge || !ctm) return null
          const clip = {
            left: Math.max(edge.left, frame?.left ?? edge.left),
            top: Math.max(edge.top, frame?.top ?? edge.top),
            right: Math.min(edge.right, frame?.right ?? edge.right),
            bottom: Math.min(edge.bottom, frame?.bottom ?? edge.bottom),
          }
          const scale = Math.hypot(ctm.a, ctm.b)
          const lamps = [...document.querySelectorAll('.defend-pad.is-planted')].map((pad) => {
            const feet = pad.getScreenCTM()
            if (!feet) return null
            const art = {
              left: feet.e - half * scale,
              right: feet.e + half * scale,
              top: feet.f - up * scale,
              bottom: feet.f,
            }
            const glyphEl = pad.querySelector('.lamp-upgrade-glyph[data-glyph-variant="map"]')
            const glyph = boxOf(glyphEl)
            const above = art.bottom <= clip.top
            return {
              id: pad.getAttribute('data-tower-type'),
              above,
              glyph: Boolean(glyphEl),
              box: glyph,
            }
          }).filter(Boolean)
          const visible = lamps.map((lamp) => lamp.box).filter(Boolean)
          let glyphOverlap = 0
          for (let i = 0; i < visible.length; i += 1) {
            for (let j = i + 1; j < visible.length; j += 1) glyphOverlap += overlap(visible[i], visible[j])
          }
          return {
            t: performance.now(),
            aboveCount: lamps.filter((lamp) => lamp.above).length,
            offTopGlyphs: lamps.filter((lamp) => lamp.above && lamp.glyph).length,
            glyphOverlap,
            back: lamps.filter((lamp) => !lamp.above && lamp.glyph).map((lamp) => lamp.id),
          }
        }
        const run = { frames: [], stop: false }
        window.__offTopRun = run
        const tick = () => {
          const frame = window.__offTopSample()
          if (frame) run.frames.push(frame)
          if (!run.stop) requestAnimationFrame(tick)
        }
        requestAnimationFrame(tick)
      },
      { half: LAMP_ART_HALF_UNITS, up: LAMP_ART_UP_UNITS },
    )
    let sawOne = false
    let sawBoth = false
    for (let step = 0; step < 24 && !sawBoth; step += 1) {
      await offTopDrag(page, -48)
      const now = await page.evaluate(() => window.__offTopSample())
      if (now?.aboveCount === 1) sawOne = true
      if (now?.aboveCount >= 2) sawBoth = true
    }
    assert.ok(sawOne, `${label} panning sends one lamp fully above the clip before the other`)
    assert.ok(sawBoth, `${label} panning sends both lamps fully above the clip`)
    const shotDir = process.env.NW_OFFTOP_SHOT_DIR
    if (shotDir && width === 375) {
      mkdirSync(shotDir, { recursive: true })
      const tag = process.env.NW_OFFTOP_SHOT_TAG || 'shot'
      const clip = await page.evaluate(() => {
        const frame = document.querySelector('.defend-frame')?.getBoundingClientRect()
        const top = Math.max(0, (frame?.top ?? 0) - 6)
        return {
          x: 0,
          y: top,
          width: Math.min(375, window.innerWidth),
          height: Math.min(132, Math.max(88, window.innerHeight - top)),
        }
      })
      await page.screenshot({
        path: join(shotDir, `375-off-top-${tag}.png`),
        clip: { x: clip.x, y: clip.y, width: clip.width, height: clip.height },
      })
    }
    let broughtBack = false
    for (let step = 0; step < 24 && !broughtBack; step += 1) {
      await offTopDrag(page, 48)
      const now = await page.evaluate(() => window.__offTopSample())
      if (now && now.aboveCount < 2 && now.back.length > 0) broughtBack = true
    }
    assert.ok(broughtBack, `${label} a lamp panned back into the clip gets its map mark again`)
    const frames = await page.evaluate(() => {
      window.__offTopRun.stop = true
      return window.__offTopRun.frames
    })
    assert.ok(frames.length >= 8, `${label} sampled ${frames.length} frames`)
    const offTopGlyphs = frames.reduce((sum, frame) => sum + frame.offTopGlyphs, 0)
    const glyphOverlap = frames.reduce((max, frame) => Math.max(max, frame.glyphOverlap), 0)
    const detail = `${label} frames=${frames.length} offTopGlyphs=${offTopGlyphs} glyphOverlap=${glyphOverlap}`
    assert.equal(offTopGlyphs, 0, `checkOffTopGlyph ${detail}`)
    assert.equal(glyphOverlap, 0, `checkOffTopGlyph ${detail}`)
    console.log(`checkOffTopGlyph ok ${label} frames=${frames.length} offTopGlyphs=0 glyphOverlap=0`)
    await context.close()
  }
}

async function checkLampGlyph(browser, port, errors) {
  if (process.env.NW_OFFTOP_ONLY === '1') {
    await checkOffTopGlyph(browser, port, errors)
    return
  }
  if (process.env.NW_LABEL_ONLY === '1') {
    await checkLabelOverGlyph(browser, port, errors)
    return
  }
  await checkLabelOverGlyph(browser, port, errors)
  await checkOffTopGlyph(browser, port, errors)
  const only = process.env.NW_GLYPH_SIZE
  for (const [width, height] of GLYPH_SIZES.filter(([w, h]) => process.env.NW_GLYPH_SWEEP_ONLY !== '1' && (!only || only === `${w}x${h}`))) {
    const label = `${width}x${height}`
    const gold = await checkGlyphOneGold(browser, port, errors, width, height)
    const { context, page } = await openMap(browser, port, width, height, 'a2', {
      motion: true,
      search: GLYPH_LIVE_SEARCH,
    })
    page.on('pageerror', (error) => errors.push(`glyph ${label} ${error}`))
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(`glyph ${label} ${msg.text()}`)
    })
    await glyphSetup(page)
    await assertGlyphCamera(page, `${label} shared night`)
    const { stats, selected, ladder } = glyphDriver(page, label, errors)

    // Plant one lamp of each type. Every pick is a real tap on the rail, then a real tap on a seat.
    for (const [index, tool] of GLYPH_TOOLS.entries()) {
      let now = await selected()
      if (!(now.length === 1 && now[0].startsWith(GLYPH_NAME[tool]))) {
        await page.locator('.nw-rail .defend-ability').nth(index).click()
        now = await selected()
      }
      assert.equal(now.length, 1, `${label} ${tool} exactly one lamp is selected ${JSON.stringify(now)}`)
      assert.ok(now[0].startsWith(GLYPH_NAME[tool]), `${label} ${tool} is the selected lamp ${JSON.stringify(now)}`)
      const seat = await glyphNextSeat(page, `${label} shared night`)
      await page.mouse.click(seat.x, seat.y)
      await page.locator(`.defend-pad[data-tower-type="${tool}"] .lamp-upgrade-glyph[data-glyph-variant="map"]`).waitFor()
      await page.waitForTimeout(250)
      if (await page.locator('.defend-tower-card').count()) {
        await page.keyboard.press('Escape')
        await page.locator('.defend-tower-card').waitFor({ state: 'detached' })
      }
    }

    assert.equal(await ladder(GLYPH_TOOLS[0], GLYPH_LADDER), 8, `${label} top lamp reached stage 8 by real buys`)
    for (const tool of GLYPH_TOOLS.slice(1, -1)) {
      assert.equal(await ladder(tool, GLYPH_LADDER.slice(0, 1)), 1, `${label} ${tool} reached stage 1 by a real buy`)
    }
    assert.equal(await ladder(GLYPH_TOOLS[GLYPH_TOOLS.length - 1], GLYPH_LADDER), 8, `${label} lowest lamp reached stage 8 by real buys`)

    console.log(glyphStatsLine(label, 'shared night', stats, gold))
    await context.close()
  }
  for (const size of SEAT_SWEEP_SIZES.filter((entry) => !only || only === entry)) {
    const [width, height] = size.split('x').map(Number)
    if (process.env.NW_GLYPH_CLEARROW_ONLY !== '1' && process.env.NW_GLYPH_MAXWAVE_ONLY !== '1') await checkGlyphSeatSweep(browser, port, errors, width, height)
    if (process.env.NW_GLYPH_MAXWAVE_ONLY !== '1') await checkGlyphClearRow(browser, port, errors, width, height)
    await checkGlyphMaxWave(browser, port, errors, width, height)
  }

  if (process.env.NW_GLYPH_COLLECT === '1') {
    console.log(`checkLampGlyph collected ${glyphMisses.size} broken 1.4.571 rules`)
    for (const [rule, row] of glyphMisses) console.log(`  BROKEN ${rule}: ${row.count} frames, first: ${row.first.slice(0, 420)}`)
    return
  }
  await checkRingArcDraw(browser, port, errors)

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
  hardPage.on('pageerror', (error) => errors.push(`glyph hard ${error}`))
  await hardPage.goto('/?playtest=1')
  await hardPage.getByRole('button', { name: 'Hold the night' }).click()
  await hardPage.locator('.defend-board').waitFor()
  const hardMarks = await hardPage.evaluate(() => ({
    glyphs: document.querySelectorAll('.lamp-upgrade-glyph').length,
    romans: [...document.querySelectorAll('text.defend-level-pip')].map((node) => (node.textContent || '').trim()),
  }))
  assert.equal(hardMarks.glyphs, 0, `Hard renders ${hardMarks.glyphs} glyph elements`)
  assert.ok(hardMarks.romans.length > 0, 'Hard still renders the roman level pip')
  console.log(`checkLampGlyph ok hard glyphs ${hardMarks.glyphs} romans ${hardMarks.romans.join(',')}`)
  await hard.close()
}

// #905: Night Run maze fixes, live. Real touch (CDP touch events) and mouse clicks drive every action;
// page.evaluate only sets up a scene (place the walker, add a robber) and reads numbers back.
async function nr905Open(browser, port, width, height, errors, tag) {
  const context = await browser.newContext({
    baseURL: `http://127.0.0.1:${port}/`,
    viewport: { width, height },
    isMobile: true,
    hasTouch: true,
    deviceScaleFactor: 2,
  })
  const page = await context.newPage()
  const pageErrors = []
  page.on('pageerror', (error) => {
    pageErrors.push(String(error))
    errors.push(`nightRun905 ${tag} ${error}`)
  })
  page.on('console', (msg) => {
    if (msg.type() === 'error') pageErrors.push(msg.text())
  })
  const cdp = await context.newCDPSession(page)
  await page.goto('/night-run/index.html')
  await page.waitForFunction(() => window.NR && window.NR.S)
  await page.locator('#go').tap()
  await page.waitForTimeout(400)
  // Close any story card the same way a kid would get past it: the scene setup below needs a free board.
  await page.evaluate(() => {
    document.querySelectorAll('.card').forEach((c) => (c.style.display = 'none'))
    window.NR.S.paused = false
  })
  return { context, page, cdp, pageErrors }
}

const nr905Sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

async function nr905Touch(cdp, x, y, ms) {
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] })
  await nr905Sleep(ms)
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
}

async function nr905Frames(page, n = 2) {
  await page.evaluate((n) => new Promise((r) => {
    const step = () => { n -= 1; if (n <= 0) r(); else requestAnimationFrame(step) }
    requestAnimationFrame(step)
  }), n)
}

// Wait until any snap tween has finished. Two rAF first so pointerup can start S.tw
// before we look; a short poll then waitForFunction so a hold (no tween) still proceeds.
async function nr905AfterTurn(page) {
  await nr905Frames(page, 2)
  const deadline = Date.now() + 400
  while (Date.now() < deadline) {
    if (await page.evaluate(() => Boolean(window.NR.S.tw))) break
    await nr905Frames(page, 1)
  }
  await page.waitForFunction(() => !window.NR.S.tw, null, { timeout: 5000 })
  await nr905Frames(page, 1)
}

// Press a Night Run button with CDP touch, but only start the hold-ms clock after the
// page has seen pointerdown (class "down"). That keeps a 60ms tap under the 250ms snap cutoff.
async function nr905Press(page, cdp, id, ms) {
  const p = await nr905Center(page, id)
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: p.x, y: p.y }] })
  await page.waitForFunction((id) => document.getElementById(id)?.classList.contains('down'), id, { timeout: 2000 })
  if (ms > 0) await page.waitForTimeout(ms)
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
  await page.waitForFunction((id) => !document.getElementById(id)?.classList.contains('down'), id, { timeout: 2000 })
  await nr905AfterTurn(page)
}

async function nr905Center(page, id) {
  const b = await page.locator('#' + id).boundingBox()
  return { x: b.x + b.width / 2, y: b.y + b.height / 2 }
}

async function nr905Corridor(page, needTrap) {
  return page.evaluate((needTrap) => {
    const NR = window.NR, S = NR.S, M = NR.MAP, DX = [0, 1, 0, -1], DY = [-1, 0, 1, 0]
    const ok = (x, y) => NR.open(x, y) && !'PLHJK'.includes(M[y][x])
    for (let y = 1; y < NR.H - 1; y++) for (let x = 1; x < NR.W - 1; x++) for (let d = 0; d < 4; d++) {
      if (!ok(x, y) || NR.trapAt(x, y) >= 0) continue
      const a = [x + DX[d], y + DY[d]], b = [x + 2 * DX[d], y + 2 * DY[d]]
      if (!ok(...a) || !ok(...b)) continue
      const ta = NR.trapAt(...a) >= 0
      if (needTrap ? !ta : ta || NR.trapAt(...b) >= 0) continue
      if (needTrap && NR.trapAt(...b) >= 0) continue
      if (!S.robbers.every((r) => Math.abs(r.x - x) + Math.abs(r.y - y) > 6)) continue
      return { x, y, d, a, b }
    }
    return null
  }, needTrap)
}

async function nr905Place(page, c) {
  await page.evaluate((c) => {
    const NR = window.NR, S = NR.S
    S.tw = null; S.x = c.x; S.y = c.y; S.px = c.x + 0.5; S.py = c.y + 0.5; S.dir = c.d
    S.ang = (c.d * Math.PI) / 2 - Math.PI / 2; S.hist = []; S.inv = 0; S.hearts = 3
    NR.CTRL.fwd = 0; NR.CTRL.bt = 0
  }, c)
  await nr905Sleep(150)
}

async function nr905Clean(page) {
  await page.evaluate(() => {
    const S = window.NR.S
    S.robbers.forEach((r) => { r.gone = 1e9; r.strike = null })
    S.inv = 0; S.hearts = 3; S.paused = false
  })
}

async function nr905AddRobber(page, cell, extra) {
  return page.evaluate(([c, o]) => {
    const S = window.NR.S
    S.robbers.push(Object.assign({ sx: c[0], sy: c[1], x: c[0], y: c[1], px: c[0] + 0.5, py: c[1] + 0.5, gone: 0, hold: 99, amb: 1 }, o || {}))
    return S.robbers.length - 1
  }, [cell, extra])
}

async function nr905RobberAt(page, i) {
  return page.evaluate((i) => {
    const NR = window.NR, S = NR.S, r = S.robbers[i]
    const q = S.rects.find((q) => q.ref === r && q.kind === 'robber')
    if (!q) return null
    const b = document.getElementById('view').getBoundingClientRect()
    return { x: b.left + ((q.x0 + q.x1) / 2 / NR.RW) * b.width, y: b.top + ((q.y0 + q.y1) / 2 / NR.RH) * b.height }
  }, i)
}

const nr905State = (page) => page.evaluate(() => { const S = window.NR.S; return { hearts: S.hearts, pops: S.pops, x: S.x, y: S.y } })

async function nr905Restart(page) {
  await page.reload()
  await page.waitForFunction(() => window.NR && window.NR.S)
  await page.locator('#go').tap()
  await page.waitForTimeout(400)
  await page.evaluate(() => {
    document.querySelectorAll('.card').forEach((c) => (c.style.display = 'none'))
    window.NR.S.paused = false
  })
}

async function nr905Fix1(page, cdp) {
  const c = await nr905Corridor(page, false)
  const R = {}
  for (const kind of ['lunge', 'slow', 'quick', 'mouse', 'noTap']) {
    await nr905Clean(page)
    await nr905Place(page, c)
    const i = await nr905AddRobber(page, c.a)
    await nr905Sleep(400)
    const p = await nr905RobberAt(page, i)
    const s0 = await nr905State(page)
    if (kind === 'lunge' || kind === 'noTap') await page.evaluate((i) => { const S = window.NR.S, r = S.robbers[i]; r.x = S.x; r.y = S.y }, i)
    if (p && kind === 'mouse') await page.mouse.click(p.x, p.y)
    else if (p && kind !== 'noTap') await nr905Touch(cdp, p.x, p.y, kind === 'slow' ? 450 : 60)
    await nr905Sleep(1500)
    const s1 = await nr905State(page)
    R[kind] = { lost: s0.hearts - s1.hearts, popped: s1.pops - s0.pops }
  }
  const fails = []
  for (const k of ['lunge', 'slow', 'quick', 'mouse']) {
    if (R[k].lost !== 0) fails.push(`fix1 ${k} tap on a robber lost ${R[k].lost} hearts (want 0)`)
    if (R[k].popped !== 1) fails.push(`fix1 ${k} tap popped ${R[k].popped} robbers (want 1)`)
  }
  if (R.noTap.lost !== 1) fails.push(`fix1 no tap lost ${R.noTap.lost} hearts (want exactly 1)`)
  return { fails, line: `fix1 lunge ${R.lunge.lost}/${R.lunge.popped} slow ${R.slow.lost}/${R.slow.popped} quick ${R.quick.lost}/${R.quick.popped} mouse ${R.mouse.lost}/${R.mouse.popped} noTap lost ${R.noTap.lost}` }
}

async function nr905Fix2(page, cdp) {
  const fails = []
  // Trap: wait on it. A popped robber far away must stay popped through the hit.
  const t = await nr905Corridor(page, true)
  await nr905Clean(page)
  await nr905Place(page, { x: t.a[0], y: t.a[1], d: t.d })
  const far = await nr905AddRobber(page, [t.a[0], t.a[1]], { gone: 8, hold: 99 })
  const s0 = await nr905State(page)
  await nr905Sleep(4000)
  const trap = await page.evaluate(([s0, far]) => {
    const NR = window.NR, S = NR.S
    return { lost: s0.hearts - S.hearts, moved: Math.abs(S.x - s0.x) + Math.abs(S.y - s0.y), onTrap: NR.trapAt(S.x, S.y) >= 0, farGone: +(S.robbers[far].gone || 0).toFixed(2) }
  }, [s0, far])
  if (trap.lost !== 1) fails.push(`fix2 trap wait lost ${trap.lost} hearts (want 1)`)
  if (trap.moved !== 1 || trap.onTrap) fails.push(`fix2 trap hit moved ${trap.moved} squares, on trap ${trap.onTrap} (want 1, off)`)
  if (!(trap.farGone > 0)) fails.push(`fix2 a popped robber woke on the hit (gone ${trap.farGone}, want > 0)`)
  // Chase: a robber in your square.
  await nr905Restart(page)
  const c = await nr905Corridor(page, false)
  await nr905Clean(page)
  await nr905Place(page, c)
  await nr905AddRobber(page, c.a, { hold: 0, x: c.x, y: c.y, px: c.x + 0.5, py: c.y + 0.5 })
  await nr905Sleep(5000)
  const a5 = await nr905State(page)
  const chase = { hearts5s: a5.hearts }
  if (chase.hearts5s < 2) fails.push(`fix2 5s chase left ${chase.hearts5s} hearts (want >= 2)`)
  // Hideout: a popped robber stays hidden while you stand next to its home.
  await nr905Clean(page)
  const h = await page.evaluate(() => {
    const NR = window.NR, M = NR.MAP, DX = [0, 1, 0, -1], DY = [-1, 0, 1, 0]
    const ok = (x, y) => NR.open(x, y) && NR.trapAt(x, y) < 0 && !'PLHJK'.includes(M[y][x])
    for (let y = 1; y < NR.H - 1; y++) for (let x = 1; x < NR.W - 1; x++) for (let d = 0; d < 4; d++) {
      const nx = x + DX[d], ny = y + DY[d]
      if (ok(x, y) && ok(nx, ny) && window.NR.S.robbers.every((r) => r.gone > 1e6 || Math.abs(r.x - x) + Math.abs(r.y - y) > 6)) return { home: [x, y], x: nx, y: ny, d: (d + 2) % 4 }
    }
    return null
  })
  await nr905Place(page, h)
  await nr905AddRobber(page, h.home, { gone: 0.3, hold: 0 })
  await nr905Sleep(2500)
  const hide = { lost: 3 - (await nr905State(page)).hearts }
  if (hide.lost !== 0) fails.push(`fix2 standing by a hideout lost ${hide.lost} hearts (want 0)`)
  // Retry at a lamp: real tap on Try again.
  await nr905Restart(page)
  await nr905Clean(page)
  const cp = await page.evaluate(() => {
    const NR = window.NR, S = NR.S, M = NR.MAP, DX = [0, 1, 0, -1], DY = [-1, 0, 1, 0], r = S.robbers[0]
    for (let d = 0; d < 4; d++) { const x = r.sx + DX[d], y = r.sy + DY[d]; if (NR.open(x, y) && NR.trapAt(x, y) < 0 && !'PLHJK'.includes(M[y][x])) return { x, y, dir: d } }
    return null
  })
  await page.evaluate((cp) => {
    const S = window.NR.S
    S.cp = cp; S.hearts = 1; S.inv = 0; S.x = cp.x; S.y = cp.y; S.px = cp.x + 0.5; S.py = cp.y + 0.5; S.tw = null
    S.robbers.push({ sx: cp.x, sy: cp.y, x: cp.x, y: cp.y, px: cp.x + 0.5, py: cp.y + 0.5, gone: 0, hold: 0, amb: 1 })
  }, cp)
  await nr905Sleep(1200)
  const failShown = await page.evaluate(() => getComputedStyle(document.getElementById('cFail')).display)
  let retryHearts = -1
  if (failShown === 'block') {
    const p = await nr905Center(page, 'retry')
    await page.mouse.click(p.x, p.y)
    await nr905Sleep(3000)
    retryHearts = (await nr905State(page)).hearts
  }
  if (failShown !== 'block') fails.push(`fix2 the lamp fail card did not show (${failShown})`)
  else if (retryHearts !== 3) fails.push(`fix2 Try again at a lamp has ${retryHearts} hearts after 3s (want 3)`)
  return { fails, line: `fix2 trap lost ${trap.lost} moved ${trap.moved} poppedStays ${trap.farGone > 0} chase5s hearts ${chase.hearts5s} hideout lost ${hide.lost} retry3s hearts ${retryHearts}` }
}

async function nr905Fix3(page) {
  await nr905Restart(page)
  await nr905Clean(page)
  const r = await page.evaluate(() => {
    const NR = window.NR, DX = [0, 1, 0, -1], DY = [-1, 0, 1, 0], M = NR.MAP, S = NR.S
    const walk = (x, y) => NR.open(x, y) || (M[y] && M[y][x] === 'K')
    const reach = (sx, sy, t) => {
      const seen = new Set([sx + ',' + sy]), q = [[sx, sy]]
      while (q.length) {
        const [x, y] = q.shift()
        if (x === t.x && y === t.y) return true
        for (let d = 0; d < 4; d++) {
          const nx = x + DX[d], ny = y + DY[d], k = nx + ',' + ny
          if (seen.has(k) || !(walk(nx, ny) || (nx === t.x && ny === t.y))) continue
          seen.add(k); q.push([nx, ny])
        }
      }
      return false
    }
    const set = (x, y) => { S.x = x; S.y = y; S.px = x + 0.5; S.py = y + 0.5 }
    let seed = 7
    const rnd = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648
    let x = S.x, y = S.y, prev = null, flips = 0, steps = 0
    for (let k = 0; k < 4000; k++) {
      const nb = []
      for (let d = 0; d < 4; d++) { const nx = x + DX[d], ny = y + DY[d]; if (NR.open(nx, ny) && !'PLHJ'.includes(M[ny][nx])) nb.push([nx, ny]) }
      if (!nb.length) break
      ;[x, y] = nb[(rnd() * nb.length) | 0]; set(x, y); steps++
      const hi = NR.hintInfo()
      const lab = hi && hi.t ? hi.t.n + '@' + hi.t.x + ',' + hi.t.y : 'Explore'
      if (prev !== null && lab !== prev) flips++
      prev = lab
    }
    const seen = new Set([x + ',' + y]), q = [[x, y]]
    let unreach = 0, badStep = 0, cells = 0
    while (q.length) {
      const [cx, cy] = q.shift(); cells++; S.gk = null; set(cx, cy)
      const hi = NR.hintInfo()
      if (hi && hi.t) {
        if (!reach(cx, cy, hi.t)) unreach++
        if (!(walk(hi.n.x, hi.n.y) || (hi.n.x === hi.t.x && hi.n.y === hi.t.y))) badStep++
      }
      for (let d = 0; d < 4; d++) {
        const nx = cx + DX[d], ny = cy + DY[d], kk = nx + ',' + ny
        if (seen.has(kk) || !walk(nx, ny) || 'PL'.includes(M[ny][nx])) continue
        seen.add(kk); q.push([nx, ny])
      }
    }
    return { flips, steps, cells, unreach, badStep }
  })
  const fails = []
  if (r.flips !== 0) fails.push(`fix3 FIND label flipped ${r.flips} times over ${r.steps} steps (want 0)`)
  if (r.unreach !== 0 || r.badStep !== 0) fails.push(`fix3 ${r.unreach} unreachable goals and ${r.badStep} bad next steps over ${r.cells} squares (want 0, 0)`)
  if (r.cells !== 295) fails.push(`fix3 walked ${r.cells} squares (want 295)`)
  return { fails, line: `fix3 flips ${r.flips}/${r.steps} steps cells ${r.cells} unreach ${r.unreach} badStep ${r.badStep}` }
}

async function nr905Fix4(page, cdp) {
  await nr905Clean(page)
  await nr905Place(page, await nr905Corridor(page, false))
  const R = {}
  for (const [k, id, ms] of [['tapRight', 'br', 60], ['tapLeft', 'bl', 60], ['hold', 'br', 700]]) {
    const a0 = await page.evaluate(() => window.NR.S.ang)
    await nr905Press(page, cdp, id, ms)
    R[k] = +((await page.evaluate(() => window.NR.S.ang)) - a0).toFixed(2)
  }
  const fails = []
  if (Math.abs(R.tapRight - Math.PI / 2) > 0.05) fails.push(`fix4 a tap on Turn right turned ${R.tapRight} rad (want 1.57)`)
  if (Math.abs(R.tapLeft + Math.PI / 2) > 0.05) fails.push(`fix4 a tap on Turn left turned ${R.tapLeft} rad (want -1.57)`)
  if (!(R.hold > 0.3)) fails.push(`fix4 holding Turn turned ${R.hold} rad (want > 0.3)`)
  return { fails, line: `fix4 tapRight ${R.tapRight} tapLeft ${R.tapLeft} hold ${R.hold}` }
}

async function nr905Fix5(page, cdp) {
  await nr905Clean(page)
  const t = await nr905Corridor(page, true)
  await nr905Place(page, t)
  const ti = await page.evaluate((t) => window.NR.trapAt(t.a[0], t.a[1]), t)
  await page.waitForFunction((ti) => { const c = (window.NR.S.t + ti * 1.6) % 3.2; return c > 2.45 && c < 2.6 }, ti, { timeout: 10_000 })
  const p = await nr905Center(page, 'bf')
  await nr905Touch(cdp, p.x, p.y, 40)
  let mism = 0
  for (let k = 0; k < 26; k++) {
    await nr905Sleep(45)
    const s = await page.evaluate(() => {
      const tt = document.getElementById('toast')
      return { b: document.getElementById('bf').textContent, w: tt.textContent === 'Wait for green…' && tt.style.opacity !== '0' }
    })
    if (s.b.startsWith('GO!') && s.w) mism++
  }
  await page.waitForFunction(() => document.getElementById('bf').textContent.startsWith('GO!'), null, { timeout: 5000 })
  const x0 = await nr905State(page)
  await nr905Touch(cdp, p.x, p.y, 40)
  await nr905Sleep(800)
  const x1 = await nr905State(page)
  const moved = Math.abs(x1.x - x0.x) + Math.abs(x1.y - x0.y)
  const fails = []
  if (mism !== 0) fails.push(`fix5 ${mism} frames showed GO! with Wait for green (want 0)`)
  if (moved !== 2) fails.push(`fix5 a GO press dashed ${moved} squares (want 2)`)
  return { fails, line: `fix5 goWaitFrames ${mism} dash ${moved}` }
}

// Night Run has one play tier (no Hard switch in public/night-run/index.html); this smoke plays it
// untouched with real input only: Start, Go forward, turns, and checks that a hit costs one heart.
async function nr905Hard(browser, port, errors) {
  const { context, page, cdp, pageErrors } = await nr905Open(browser, port, 375, 667, errors, 'hard')
  const fails = []
  const s0 = await nr905State(page)
  await nr905Clean(page)
  await nr905Place(page, await nr905Corridor(page, false))
  const fwd = await nr905Center(page, 'bf')
  const right = await nr905Center(page, 'br')
  let moves = 0
  for (let k = 0; k < 8; k++) {
    const a = await nr905State(page)
    await nr905Touch(cdp, fwd.x, fwd.y, 600)
    await nr905Sleep(400)
    const b = await nr905State(page)
    if (a.x !== b.x || a.y !== b.y) moves++
    else { await nr905Touch(cdp, right.x, right.y, 60); await nr905Sleep(400) }
  }
  const painted = (await page.locator('#view').screenshot()).length
  // A robber walks into you (scene setup), you do nothing: exactly one heart goes.
  await nr905Clean(page)
  const c = await nr905Corridor(page, false)
  await nr905Place(page, c)
  const i = await nr905AddRobber(page, c.a)
  await page.evaluate((i) => { const S = window.NR.S, r = S.robbers[i]; r.x = S.x; r.y = S.y }, i)
  await nr905Sleep(1500)
  const lost = 3 - (await nr905State(page)).hearts
  if (moves < 2) fails.push(`hard real Go presses moved ${moves} times (want >= 2)`)
  if (painted < 8000) fails.push(`hard the maze canvas shot is ${painted} bytes (want a drawn maze, >= 8000)`)
  if (lost !== 1) fails.push(`hard a robber hit cost ${lost} hearts (want 1)`)
  if (pageErrors.length) fails.push(`hard console errors: ${pageErrors.join(' | ').slice(0, 300)}`)
  await context.close()
  return { fails, line: `nightRun905 ok hard 375x667 moves ${moves} canvasPng ${painted}B hitLost ${lost} consoleErrors ${pageErrors.length} startHearts ${s0.hearts}` }
}

export async function checkNightRun905(browser, port, errors = []) {
  const all = []
  for (const [width, height] of [[375, 667], [390, 844]]) {
    const { context, page, cdp, pageErrors } = await nr905Open(browser, port, width, height, errors, `${width}`)
    const lines = []
    for (const fix of [nr905Fix1, nr905Fix2, nr905Fix3, nr905Fix4, nr905Fix5]) {
      let r
      try { r = await fix(page, cdp) } catch (error) { r = { fails: [`${fix.name} threw ${String(error).slice(0, 200)}`], line: `${fix.name} threw` } }
      lines.push(r.line)
      for (const f of r.fails) { all.push(`${width}x${height} ${f}`); console.log(`nightRun905 FAIL ${width}x${height} ${f}`) }
    }
    if (pageErrors.length) all.push(`${width}x${height} console errors ${pageErrors.join(' | ').slice(0, 300)}`)
    await context.close()
    if (!all.some((f) => f.startsWith(`${width}x${height}`))) console.log(`nightRun905 ok ${width}x${height} ${lines.join(' | ')}`)
  }
  let hard
  try { hard = await nr905Hard(browser, port, errors) } catch (error) { hard = { fails: [`hard threw ${String(error).slice(0, 200)}`], line: '' } }
  for (const f of hard.fails) { all.push(f); console.log(`nightRun905 FAIL ${f}`) }
  if (!hard.fails.length) console.log(hard.line)
  assert.equal(all.length, 0, `#905 Night Run checks failed:\n${all.join('\n')}`)
}

const COMPACT_SIZES = [[375, 667], [390, 844], [412, 915]]
const COMPACT_SEATS = [
  { cx: 600, cy: 88 },
  { cx: 464, cy: 224 },
  { cx: 464, cy: 360 },
  { cx: 464, cy: 768 },
  { cx: 600, cy: 904 },
]
const COMPACT_NEIGHBORS = ['logic', 'reason', 'science', 'candle']

function blankCompact() {
  return {
    frames: 0,
    cardH: 0,
    header: 0,
    overlap: 0,
    minGap: Infinity,
    minTip: Infinity,
    beginFrames: 0,
    beginSlack: Infinity,
    beginHitBad: 0,
    railFrames: 0,
    railOver: 0,
    clearFrames: 0,
    clearOver: 0,
    waveFrames: 0,
    goldBad: 0,
    goldSample: '',
    goldCounts: new Set(),
    clipped: 0,
    clipSample: [],
    clipSeen: new Set(),
    lineFrames: 0,
    lineNotes: [],
    lineSeen: new Set(),
    reasons: new Map(),
  }
}

/** Reason lines the compact card paints. Same strings the tree and the road note use. */
const COMPACT_LOCKS = new Set([
  TREE_LOCK,
  LESSON_LOCK,
  'This path is full.',
  'Finish this lamp first.',
  'Bright is on.',
  'One path goes to two. This one stops at one.',
])
const COMPACT_ROADS = new Set([
  'Reaches on Far step 1',
  'Reaches on Far step 2',
  'Reaches on Far step 3',
  'Too far from the road',
])

function compactReasonSource(line) {
  if (line.kind === 'bright') return BRIGHT_LINE
  if (line.kind === 'path') return PATH_LINE[line.path] || ''
  if (line.kind === 'lock') return COMPACT_LOCKS.has(line.text) ? line.text : ''
  if (line.kind === 'road') return COMPACT_ROADS.has(line.text) ? line.text : ''
  return null
}

/** Count card-open frames. Header copy, glyph gap (pointer included), Begin, rail and clear-row. */
function eatCompact(stats, frames) {
  let n = 0
  for (const frame of frames) {
    if (!frame.card) continue
    n += 1
    stats.frames += 1
    stats.cardH = Math.max(stats.cardH, frame.card.h)
    if (frame.header) stats.header += 1
    if (frame.glyph) {
      stats.overlap = Math.max(stats.overlap, glyphArea(frame.glyph, frame.card))
      stats.minGap = Math.min(stats.minGap, glyphGap(frame.glyph, frame.card))
      if (frame.stem) stats.minTip = Math.min(stats.minTip, glyphGap(frame.glyph, frame.stem))
    }
    const begin = frame.begin[0]
    if (begin) {
      stats.beginFrames += 1
      stats.beginSlack = Math.min(stats.beginSlack, begin.top - frame.card.bottom)
      if (frame.beginHit !== true) stats.beginHitBad += 1
    }
    if (frame.buttons.length) stats.railFrames += 1
    for (const button of frame.buttons) stats.railOver = Math.max(stats.railOver, glyphArea(frame.card, button))
    if (frame.clearButtons.length) stats.clearFrames += 1
    for (const button of frame.clearButtons) stats.clearOver = Math.max(stats.clearOver, glyphArea(frame.card, button))
    if (frame.wave) stats.waveFrames += 1
    if (frame.lines?.length) {
      stats.lineFrames += 1
      for (const line of frame.lines) {
        const source = compactReasonSource(line)
        const cut = line.scroll > line.client + 1 || line.scrollH > line.clientH + 1
        const ellipsis = line.overflow === 'ellipsis'
        const marker = line.text.includes('…') || line.text.endsWith('...')
        const mismatch = source !== null && source !== line.text
        const note = `${line.kind}|${line.overflow}|${line.scroll}|${line.client}|${line.scrollH}|${line.clientH}|${line.text}`
        if (line.kind !== 'text' && !stats.lineSeen.has(note) && stats.lineNotes.length < 24) {
          stats.lineSeen.add(note)
          stats.lineNotes.push(
            `${line.kind} overflow=${line.overflow} scroll=${line.scroll} client=${line.client} scrollH=${line.scrollH} clientH=${line.clientH} text=${JSON.stringify(line.text)}`,
          )
        }
        if (cut || ellipsis || marker || mismatch) {
          stats.clipped += 1
          if (!stats.clipSeen.has(line.text) && stats.clipSample.length < 8) {
            stats.clipSeen.add(line.text)
            stats.clipSample.push(
              `${line.kind} ${JSON.stringify(line.text)} overflow=${line.overflow} scroll=${line.scroll} client=${line.client} scrollH=${line.scrollH} clientH=${line.clientH} source=${JSON.stringify(source)}`,
            )
          }
        }
        if (source !== null) stats.reasons.set(line.text, source)
      }
    }
  }
  return n
}

function compactDetail(label, stats) {
  const gap = stats.minGap === Infinity ? 'n/a' : stats.minGap.toFixed(2)
  const tip = stats.minTip === Infinity ? 'n/a' : stats.minTip.toFixed(2)
  const slack = stats.beginSlack === Infinity ? 'n/a' : stats.beginSlack.toFixed(2)
  return (
    `${label} frames=${stats.frames} cardH=${Math.round(stats.cardH)} header=${stats.header} ` +
    `overlap=${stats.overlap}px2 gap=${gap}px tip=${tip}px beginSlack=${slack}px beginHitBad=${stats.beginHitBad} ` +
    `railOver=${stats.railOver}px2 clearOver=${stats.clearOver}px2 waveFrames=${stats.waveFrames} goldBad=${stats.goldBad} ${stats.goldSample}`
  )
}

async function compactBuy(page, where, index) {
  if ((await page.locator('.defend-tower-card').count()) < 1) {
    await glyphPanToPad(page, 'love')
    await page.locator('.defend-pad[data-tower-type="love"]').click({ force: true })
    await page.locator('.defend-tower-card').waitFor()
  }
  const step = GLYPH_LADDER[index]
  const buy = step.bright
    ? page.locator('.defend-tower-card .defend-bright-buy')
    : page.locator(`.defend-tower-card button.defend-path-buy[data-path-buy="${step.path}"]`)
  assert.equal(await buy.count(), 1, `${where} stage ${index} offers ${JSON.stringify(step)}`)
  const before = await page.evaluate(() => ({
    stage: document.querySelector('.defend-pad[data-tower-type="love"] .lamp-upgrade-glyph[data-glyph-variant="map"]')?.getAttribute('data-glyph-stage'),
    buys: [...document.querySelectorAll('.defend-tower-card .defend-path-buy, .defend-tower-card .defend-bright-buy')].map((node) => ({
      path: node.getAttribute('data-path-buy') || node.getAttribute('data-bright-buy'),
      disabled: node.disabled,
      text: (node.textContent || '').trim().slice(0, 40),
    })),
  }))
  await buy.click()
  try {
    await page.waitForFunction(
      (want) => document.querySelector('.defend-pad[data-tower-type="love"] .lamp-upgrade-glyph[data-glyph-variant="map"]')?.getAttribute('data-glyph-stage') === want,
      String(index + 1),
      { timeout: 8_000 },
    )
  } catch (error) {
    const after = await page.evaluate(() => document.querySelector('.defend-pad[data-tower-type="love"] .lamp-upgrade-glyph[data-glyph-variant="map"]')?.getAttribute('data-glyph-stage'))
    throw new Error(`${where} buy ${index} stayed at stage ${after} (before ${JSON.stringify(before)}) ${error.message}`)
  }
  // A path buy ignores a second tap for 350ms. Wait that out before the next one.
  await page.waitForTimeout(420)
}

/** Card pop-in frames, from the tap that opens it. */
async function compactPop(page) {
  if (await page.locator('.defend-tower-card').count()) {
    await page.keyboard.press('Escape')
    await page.locator('.defend-tower-card').waitFor({ state: 'detached' })
  }
  await glyphPanToPad(page, 'love')
  await page.evaluate(() => window.__glyphStart('love'))
  const lamp = page.locator('.defend-clear-lamp[data-tower-type="love"]')
  for (let attempt = 0; attempt < 6 && (await page.locator('.defend-tower-card').count()) < 1; attempt += 1) {
    if (await lamp.count()) await lamp.click({ force: true })
    else await page.locator('.defend-pad[data-tower-type="love"]').click({ force: true })
    await page.waitForTimeout(280)
  }
  await page.locator('.defend-tower-card').waitFor({ timeout: 8000 })
  await page.waitForTimeout(520)
  return page.evaluate(() => window.__glyphEnd())
}

async function compactFonts(page, where) {
  if (process.env.NW_LAMP_CARD_573 === '1') return
  const small = await page.evaluate(() => {
    const sels = ['.defend-tower-tool', '.defend-path-name', '.defend-path-line', '.defend-path-lock', '.defend-path-pip', '.defend-path-buy', '.defend-bright-buy', '.defend-bright-line', '.defend-bright-on', '.defend-tower-road']
    const out = []
    for (const sel of sels) {
      for (const node of document.querySelectorAll(`.defend-tower-card ${sel}`)) {
        const px = parseFloat(getComputedStyle(node).fontSize)
        if (px < 13 - 0.05) out.push(`${sel} ${px.toFixed(2)}px`)
      }
    }
    return out
  })
  assert.deepEqual(small, [], `${where} font floor stays >= 13px ${JSON.stringify(small)}`)
}

/**
 * The one filled gold cue. Begin while it is up, the walker ring mid-wave, Continue on the clear.
 * The card, its buys and the lamp mark must not add a second one. Neighbour paint and the New lamp
 * buttons stay out of this count: a spark bank lights those (#924) and this sweep banks sparks.
 * Zero and two-or-more both fail.
 */
async function compactGold(page, stats, where) {
  const paint = await page.evaluate(() => {
    const goldish = (value) => {
      const re = /rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*([\d.]+))?/g
      let match
      while ((match = re.exec(value || ''))) {
        const r = +match[1]
        const g = +match[2]
        const b = +match[3]
        const a = match[4] === undefined ? 1 : +match[4]
        if (a > 0.05 && r > 190 && g > 140 && b < 120 && r > b + 60 && g > b + 30) return true
      }
      return false
    }
    const names = []
    const sels = '.defend-go, .defend-continue, .defend-raider.is-easy-cue .defend-raider-face, .defend-path-buy, .defend-bright-buy, .defend-tower-card, .lamp-upgrade-glyph .is-stroke, .lamp-upgrade-glyph .is-gap, .lamp-upgrade-glyph .is-dot'
    for (const el of document.querySelectorAll(sels)) {
      const style = getComputedStyle(el)
      if (style.display === 'none' || style.visibility === 'hidden' || Number(style.opacity) === 0) continue
      const rect = el.getBoundingClientRect()
      if (rect.width <= 0 || rect.height <= 0) continue
      let why = false
      if (el instanceof SVGElement) {
        if (style.stroke !== 'none' && parseFloat(style.strokeWidth) > 0 && goldish(style.stroke)) why = true
        if (style.fill !== 'none' && goldish(style.fill)) why = true
        if (goldish(style.filter)) why = true
      } else if (goldish(style.backgroundImage) || goldish(style.backgroundColor) || goldish(style.boxShadow) || goldish(style.borderTopColor) || goldish(style.filter)) why = true
      if (why) names.push(String(el.getAttribute('class') || el.tagName).split(/\s+/).slice(0, 3).join('.'))
    }
    return names
  })
  stats.goldCounts.add(paint.length)
  if (paint.length !== 1) {
    stats.goldBad += 1
    stats.goldSample = `${where} gold ${paint.length} ${JSON.stringify(paint)}`
    const cue = await page.evaluate(() => {
      const face = document.querySelector('.defend-raider.is-easy-cue .defend-raider-face')
      const go = document.querySelector('.defend-go')
      return {
        cues: document.querySelectorAll('.defend-raider.is-easy-cue').length,
        face: face ? getComputedStyle(face).filter.slice(0, 180) : null,
        go: go ? getComputedStyle(go).display : null,
      }
    })
    console.log(`checkCompactLampCard gold ${stats.goldSample} cue ${JSON.stringify(cue)}`)
  }
}

const HINT_SIZES = [[375, 667], [390, 844], [412, 915]]
const HINT_SAMPLE_MS = 1500
const HINT_GAP_MIN = 4
const HINT_SHOTS = process.env.GEM_HINT_SHOT_DIR || join(tmpdir(), 'gem-hint-slot')

function hintSave() {
  const now = new Date()
  const today = [now.getFullYear(), String(now.getMonth() + 1).padStart(2, '0'), String(now.getDate()).padStart(2, '0')].join('-')
  return {
    kind: SAVE_KIND,
    schemaVersion: SAVE_SCHEMA_VERSION,
    appVersion: '1.4.574',
    savedAt: now.toISOString(),
    progress: {
      started: true,
      easyMode: true,
      lastDailyDate: today,
      dailyDates: [today],
      completed: [],
      held: [],
      easyTaught: [],
      easyHeld: [],
      taught: [],
      journal: [],
      learnings: [],
      memory: {},
      matchLifetime: 5000,
      matchSkillSeen: 2,
    },
  }
}

async function hintPointer(page, locator) {
  await locator.scrollIntoViewIfNeeded()
  const box = await locator.boundingBox()
  assert.ok(box && box.width > 0 && box.height > 0, 'Easy Match pointer target has no box')
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
  await page.mouse.down()
  await page.mouse.up()
}

/** Story-docked Easy panel-blast. Same open as check-gem-pop-live: ?gemSeed, Settings debug, wait for the board. */
async function openEasyMatch(page, lineId, seed) {
  await page.goto(withPlaytest1(`/?gemSeed=${seed}`))
  await page.getByRole('main', { name: 'Home' }).waitFor()
  await hintPointer(page, page.getByRole('button', { name: 'Settings', exact: true }))
  await hintPointer(page, page.locator('details.settings-debug summary'))
  await hintPointer(page, page.locator('details.settings-debug').getByRole('button', { name: new RegExp(`^${lineId} ·`) }).first())
  await page.locator('.gem-board').waitFor()
  await page.locator('.gem-hint-slot').waitFor()
}

/**
 * #899. Easy Match open, story-docked panel-blast, html[data-easy=on].
 * From the first board-visible frame through at least 1.5s: the hint slot stays at least
 * HINT_GAP_MIN px above the board (overlap 0) at 375, 390 and 412, and its top stays at or
 * below the word-search header and any Gem Jar above it (topGap >= 0). A centre tap on the
 * jar or a header button lands on that element, not the slot. Letters stay >= 16.5px,
 * exactly one hint slot. Every painted text node in the slot must fit its own box
 * (scrollWidth/scrollHeight within 1px of the client box, whatever text-overflow is),
 * show no ellipsis, and paint the source string.
 * Gold cues use the mapGoldCues color test on the play screen. Tile fills are palette.
 * 1.4.564 removed the preselected gold cell; check-gem-tap-live locks goldCues at 0.
 */
export async function checkGemHintSlot(browser, port, errors = []) {
  const pending = []
  for (const [width, height] of HINT_SIZES) {
    const label = `${width}x${height}`
    const context = await browser.newContext({
      baseURL: `http://127.0.0.1:${port}/`,
      viewport: { width, height },
      deviceScaleFactor: 1,
      isMobile: true,
    })
    await context.addInitScript(
      ({ key, save }) => localStorage.setItem(key, JSON.stringify(save)),
      { key: STORAGE_KEY, save: hintSave() },
    )
    const page = await context.newPage()
    page.on('pageerror', (error) => errors.push(`hint ${label} ${error}`))
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(`hint ${label} ${msg.text()}`)
    })
    await openEasyMatch(page, 'ob-tuning', 0)
    const sample = await page.evaluate(async ({ minMs, how, tap }) => {
      // Same gold test as mapGoldCues, rooted on the Easy Match play screen.
      const gold = (value) => {
        const re = /rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*([\d.]+))?/g
        let match
        while ((match = re.exec(value || ''))) {
          const r = Number(match[1])
          const g = Number(match[2])
          const b = Number(match[3])
          const a = match[4] === undefined ? 1 : Number(match[4])
          if (a >= 0.3 && r > 190 && g > 140 && b < 120 && r > b + 60 && g > b + 30) return true
        }
        return false
      }
      const shown = (el) => {
        if (!el) return false
        const style = getComputedStyle(el)
        const box = el.getBoundingClientRect()
        return style.display !== 'none' && style.visibility !== 'hidden' && Number(style.opacity) > 0 && box.width > 1 && box.height > 1
      }
      const overlapOf = (a, b) => {
        const wide = Math.min(a.right, b.right) - Math.max(a.left, b.left)
        const tall = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top)
        return wide > 0 && tall > 0 ? wide * tall : 0
      }
      const playGoldCues = () => {
        const root = document.querySelector('.play.is-gem-search')
        if (!root) return []
        const names = []
        for (const node of root.querySelectorAll('*')) {
          if (!shown(node)) continue
          const style = getComputedStyle(node)
          const text = [...node.childNodes].some((child) => child.nodeType === 3 && child.textContent.trim())
          const border = ['Top', 'Right', 'Bottom', 'Left'].some((side) => style[`border${side}Width`] !== '0px' && gold(style[`border${side}Color`]))
          const tile = node.classList.contains('gem-cell')
          // Board tile fills are palette, not a cue (same skip as the Match gold helpers).
          const fill = tile ? false : gold(style.backgroundImage) || gold(style.backgroundColor)
          const glow = gold(style.boxShadow) || (text && gold(style.color))
          if (fill || border || glow) {
            names.push(`${node.tagName}.${node.getAttribute('class') || ''}`.replace(/\s+/g, '.').slice(0, 80))
          }
        }
        return names
      }
      const norm = (value) => String(value || '').replace(/\s+/g, ' ').trim()
      const hintLines = () => {
        const slot = document.querySelector('.gem-hint-slot')
        if (!shown(slot)) return []
        const out = []
        for (const node of slot.querySelectorAll('*')) {
          const directs = [...node.childNodes].filter((child) => child.nodeType === 3 && child.textContent && child.textContent.trim())
          if (!directs.length) continue
          const style = getComputedStyle(node)
          if (style.display === 'none' || style.visibility === 'hidden' || Number(style.opacity) === 0) continue
          const rect = node.getBoundingClientRect()
          if (rect.width < 1 || rect.height < 1) continue
          const dom = norm(directs.map((child) => child.textContent).join(''))
          const source = node.classList.contains('gem-start-hint')
            ? (node.classList.contains('is-tap-next') ? tap : how)
            : dom
          const padL = parseFloat(style.paddingLeft) || 0
          const padR = parseFloat(style.paddingRight) || 0
          const padT = parseFloat(style.paddingTop) || 0
          const padB = parseFloat(style.paddingBottom) || 0
          const content = {
            left: rect.left + (parseFloat(style.borderLeftWidth) || 0) + padL - 1,
            right: rect.right - (parseFloat(style.borderRightWidth) || 0) - padR + 1,
            top: rect.top + (parseFloat(style.borderTopWidth) || 0) + padT - 1,
            bottom: rect.bottom - (parseFloat(style.borderBottomWidth) || 0) - padB + 1,
          }
          const range = document.createRange()
          let rendered = ''
          for (const child of directs) {
            const raw = child.textContent
            for (let i = 0; i < raw.length; i += 1) {
              const ch = raw[i]
              if (!ch.trim()) {
                rendered += ch
                continue
              }
              range.setStart(child, i)
              range.setEnd(child, i + 1)
              let painted = false
              for (const box of range.getClientRects()) {
                if (box.width <= 0 || box.height <= 0) continue
                if (box.left >= content.left && box.right <= content.right && box.top >= content.top && box.bottom <= content.bottom) {
                  painted = true
                  break
                }
              }
              if (painted) rendered += ch
            }
          }
          out.push({
            source,
            dom,
            rendered: norm(rendered),
            overflow: style.textOverflow,
            scroll: node.scrollWidth,
            client: node.clientWidth,
            scrollH: node.scrollHeight,
            clientH: node.clientHeight,
          })
        }
        return out
      }
      // Word-search header (top bar and story dock) is the neighbour above the slot even when the
      // slot's translate covers it. The Gem Jar counts only when it sits above the slot; on a win it
      // replaces the score line under the board and is not a top neighbour.
      const aboveBottom = (slotBox) => {
        let maxBottom = null
        const take = (box) => {
          maxBottom = maxBottom == null ? box.bottom : Math.max(maxBottom, box.bottom)
        }
        for (const el of document.querySelectorAll('header.topbar, .story-strip.is-dock, .match-teach-dock')) {
          if (!shown(el)) continue
          take(el.getBoundingClientRect())
        }
        const slotMid = slotBox.top + slotBox.height / 2
        for (const el of document.querySelectorAll('.gem-jar-slot, [data-gem-jar]')) {
          if (!shown(el)) continue
          const box = el.getBoundingClientRect()
          if (box.top + box.height / 2 < slotMid) take(box)
        }
        return maxBottom
      }
      const coverCheck = (slot) => {
        const bad = []
        let checked = 0
        for (const el of document.querySelectorAll('header.topbar button, .match-teach-dock button, .match-teach-dock [role="button"], .story-strip.is-dock, [data-gem-jar]')) {
          if (!shown(el)) continue
          const box = el.getBoundingClientRect()
          const x = box.left + box.width / 2
          const y = box.top + box.height / 2
          if (x < 0 || y < 0 || x > innerWidth || y > innerHeight) continue
          const hit = document.elementFromPoint(x, y)
          checked += 1
          const stolen = !hit || hit === slot || Boolean(slot && slot.contains(hit)) || !el.contains(hit)
          if (stolen) {
            const name = `${el.tagName}.${String(el.getAttribute('class') || '').split(/\s+/).slice(0, 2).join('.')}`
            const seen = hit ? `${hit.tagName}.${String(hit.getAttribute('class') || '').split(/\s+/).slice(0, 2).join('.')}` : 'none'
            bad.push(`${name} -> ${seen}`)
          }
        }
        return { checked, bad }
      }
      const frames = []
      let started = 0
      const giveUp = performance.now() + 8000
      while (performance.now() < giveUp) {
        await new Promise((resolve) => requestAnimationFrame(resolve))
        const slot = document.querySelector('.gem-hint-slot')
        const board = document.querySelector('.gem-board')
        if (!shown(board)) {
          if (started) break
          continue
        }
        const now = performance.now()
        if (!started) started = now
        const slotBox = shown(slot) ? slot.getBoundingClientRect() : null
        const boardBox = board.getBoundingClientRect()
        const above = slotBox ? aboveBottom(slotBox) : null
        const cover = coverCheck(slot)
        const sizes = [...document.querySelectorAll('.gem-board .gem-letter, .gem-board .gem-cell')]
          .map((el) => parseFloat(getComputedStyle(el).fontSize))
          .filter((n) => Number.isFinite(n) && n > 0)
        const cues = playGoldCues()
        frames.push({
          t: now - started,
          goldCues: cues.length,
          goldNames: cues.slice(0, 8),
          slots: [...document.querySelectorAll('.gem-hint-slot')].filter(shown).length,
          slotTop: slotBox ? slotBox.top : null,
          slotBottom: slotBox ? slotBox.bottom : null,
          aboveBottom: above,
          topGap: slotBox && above != null ? slotBox.top - above : null,
          hitChecked: cover.checked,
          hitBad: cover.bad,
          boardTop: boardBox.top,
          overlap: slotBox ? overlapOf(slotBox, boardBox) : null,
          letterMin: sizes.length ? Math.min(...sizes) : null,
          easy: document.documentElement.dataset.easy === 'on',
          docked: Boolean(document.querySelector('html[data-easy="on"] .play.is-gem-search.is-panel-blast.is-story-docked')),
          lines: hintLines(),
        })
        if (now - started >= minMs) break
      }
      const span = frames.length ? frames[frames.length - 1].t - frames[0].t : 0
      return { frames, span }
    }, { minMs: HINT_SAMPLE_MS, how: EASY.gemHow, tap: EASY.gemTapNext })
    const frames = sample.frames
    assert.ok(frames.length >= 20, `${label} sampled ${frames.length} frames across ${sample.span.toFixed(0)}ms`)
    assert.ok(sample.span >= HINT_SAMPLE_MS, `${label} sampled ${sample.span.toFixed(0)}ms from the first board frame (need ${HINT_SAMPLE_MS})`)
    let letterMin = Infinity
    let gapMin = Infinity
    let topGapMin = Infinity
    let clipped = 0
    let hitBad = 0
    const goldSeen = new Set()
    const hitSample = []
    const loggedLines = new Set()
    const clipSample = []
    const seenCopy = new Set()
    for (const [index, frame] of frames.entries()) {
      assert.equal(frame.easy, true, `${label} frame ${index} html[data-easy=on]`)
      assert.equal(frame.docked, true, `${label} frame ${index} story-docked panel-blast`)
      assert.equal(frame.slots, 1, `${label} frame ${index} hint slot count === 1 (saw ${frame.slots})`)
      assert.equal(
        frame.goldCues,
        0,
        `${label} frame ${index} goldCues === 0 (locked by check-gem-tap-live) (saw ${frame.goldCues} ${frame.goldNames.join(' | ')})`,
      )
      assert.ok(frame.slotTop != null && frame.slotBottom != null, `${label} frame ${index} hint slot has a rect`)
      assert.ok(frame.aboveBottom != null, `${label} frame ${index} header or gem jar sits above the hint`)
      assert.ok(frame.slotBottom <= frame.boardTop, `${label} frame ${index} slot bottom ${frame.slotBottom} <= board top ${frame.boardTop}`)
      topGapMin = Math.min(topGapMin, frame.topGap)
      assert.ok(frame.hitChecked >= 1, `${label} frame ${index} checked a header button or the gem jar`)
      if (frame.hitBad.length) {
        hitBad += frame.hitBad.length
        for (const item of frame.hitBad) {
          if (hitSample.length < 4 && !hitSample.includes(item)) hitSample.push(item)
        }
      }
      assert.equal(frame.overlap, 0, `${label} frame ${index} overlap area ${frame.overlap}`)
      assert.ok(frame.letterMin >= 16.5, `${label} frame ${index} letter ${frame.letterMin}px >= 16.5`)
      letterMin = Math.min(letterMin, frame.letterMin)
      gapMin = Math.min(gapMin, frame.boardTop - frame.slotBottom)
      goldSeen.add(frame.goldCues)
      if (!frame.lines.length) {
        clipped += 1
        if (clipSample.length < 4) clipSample.push(`frame ${index} painted no text`)
      }
      for (const line of frame.lines) {
        const cut = line.scroll > line.client + 1 || line.scrollH > line.clientH + 1
        const ellipsis = line.overflow === 'ellipsis' || line.rendered.includes('…') || (line.rendered.includes('...') && !line.source.includes('...'))
        const mismatch = line.rendered !== line.source || line.dom !== line.source
        const note = `${line.overflow}|${line.scroll}|${line.client}|${line.scrollH}|${line.clientH}|${line.rendered}|${line.source}`
        if (!loggedLines.has(note)) {
          loggedLines.add(note)
          console.log(
            `checkGemHintSlot line ${label} overflow=${line.overflow} scroll=${line.scroll} client=${line.client} scrollH=${line.scrollH} clientH=${line.clientH} rendered=${JSON.stringify(line.rendered)} source=${JSON.stringify(line.source)}`,
          )
        }
        seenCopy.add(line.source)
        if (cut || ellipsis || mismatch) {
          clipped += 1
          if (clipSample.length < 4) {
            clipSample.push(
              `overflow=${line.overflow} scroll=${line.scroll} client=${line.client} scrollH=${line.scrollH} clientH=${line.clientH} rendered=${JSON.stringify(line.rendered)} source=${JSON.stringify(line.source)}`,
            )
          }
        }
      }
    }
    assert.equal(goldSeen.size, 1, `${label} gold cue count changed across frames ${[...goldSeen].join(',')}`)
    assert.ok(
      seenCopy.has(EASY.gemHow) || seenCopy.has(EASY.gemTapNext),
      `${label} painted hint copy was not ${EASY.gemHow}`,
    )
    if (process.env.GEM_HINT_SHOT_DIR && width === 375) {
      mkdirSync(HINT_SHOTS, { recursive: true })
      const clip = await page.evaluate(() => {
        const slot = document.querySelector('.gem-hint-slot')?.getBoundingClientRect()
        const board = document.querySelector('.gem-board')?.getBoundingClientRect()
        if (!slot || !board) return null
        const top = Math.max(0, Math.min(slot.top, board.top) - 8)
        const bottom = Math.min(innerHeight, board.top + 48)
        return { x: 0, y: top, width: innerWidth, height: Math.max(8, bottom - top) }
      })
      if (clip) await page.screenshot({ path: join(HINT_SHOTS, '375-after.png'), clip })
    }
    const gap = Number(gapMin.toFixed(2))
    const topGap = Number(topGapMin.toFixed(2))
    const letters = Number(letterMin.toFixed(2))
    const gold = frames[0].goldCues
    if (gap < HINT_GAP_MIN) {
      const msg = `checkGemHintSlot fail ${label} frames=${frames.length} gap=${gap} < ${HINT_GAP_MIN}`
      console.log(msg)
      pending.push(msg)
    }
    if (!(topGap >= 0)) {
      const msg = `checkGemHintSlot fail ${label} frames=${frames.length} topGap=${topGap} < 0`
      console.log(msg)
      pending.push(msg)
    }
    if (clipped !== 0) {
      const msg = `checkGemHintSlot fail ${label} frames=${frames.length} gap=${gap} clipped=${clipped} ${clipSample.join(' | ')}`
      console.log(msg)
      pending.push(msg)
    }
    if (hitBad !== 0) {
      const msg = `checkGemHintSlot fail ${label} frames=${frames.length} headerHit=${hitBad} ${hitSample.join(' | ')}`
      console.log(msg)
      pending.push(msg)
    }
    if (gap >= HINT_GAP_MIN && topGap >= 0 && clipped === 0 && hitBad === 0) {
      console.log(`checkGemHintSlot ok ${label} frames=${frames.length} gap=${gap} clipped=0 topGap=${topGap} letterMin=${letters} gold=${gold}`)
    }
    await context.close()
  }
  assert.equal(pending.length, 0, pending.join('\n'))
}

/**
 * 1.4.574 (#933). Live sweep at 375, 390 and 412: camera on, banked sparks, four neighbour lamps,
 * seats 600,88 | 464,224 | 464,360 | 464,768 | 600,904, love stages 2–7. The header glyph copy
 * never shows. NW_LAMP_CARD_573=1 restores the 1.4.573 card height, which fails this check.
 */
async function checkCompactLampCard(browser, port, errors) {
  const onlySize = process.env.NW_COMPACT_SIZE
  const onlySeat = process.env.NW_COMPACT_SEAT
  const tall = process.env.NW_LAMP_CARD_573 === '1'
  const clipFails = []
  for (const [width, height] of COMPACT_SIZES) {
    const label = `${width}x${height}`
    if (onlySize && onlySize !== label) continue
    const stats = blankCompact()
    let waved = false
    for (const seat of COMPACT_SEATS) {
      const seatKey = `${seat.cx},${seat.cy}`
      if (onlySeat && onlySeat !== seatKey) continue
      const where = `${label} seat ${seatKey}`
      const { context, page } = await openMap(browser, port, width, height, 'a2', { motion: true, search: GLYPH_LIVE_SEARCH })
      page.on('pageerror', (error) => errors.push(`compact ${where} ${error}`))
      page.on('console', (msg) => {
        if (msg.type() === 'error') errors.push(`compact ${where} ${msg.text()}`)
      })
      if (tall) await page.evaluate(() => document.documentElement.classList.add('is-lamp-card-573'))
      await glyphSetup(page)
      await page.evaluate(() => { window.__compactLines = true })
      await assertGlyphCamera(page, where)
      const rings = await page.evaluate(() =>
        [...document.querySelectorAll('.defend-plant-ground circle.is-live')].map((ring) => ({ cx: Number(ring.getAttribute('cx')), cy: Number(ring.getAttribute('cy')) })),
      )
      for (const want of COMPACT_SEATS) {
        assert.ok(rings.some((ring) => ring.cx === want.cx && ring.cy === want.cy), `${where} seat ${want.cx},${want.cy} is live ${JSON.stringify(rings)}`)
      }
      const sparks = await page.evaluate(() => Number((document.body.innerText.match(/(\d+)\s*\n?\s*Sparks/) || [])[1] || 0))
      assert.ok(sparks >= 95, `${where} starts with banked sparks (${sparks})`)
      const others = COMPACT_SEATS.filter((other) => other !== seat)
      for (const [index, other] of others.entries()) {
        await glyphPlantAt(page, COMPACT_NEIGHBORS[index], other, where)
      }
      assert.equal(await page.locator('.defend-pad').count(), 4, `${where} four neighbour lamps`)
      await glyphPlantAt(page, 'love', seat, where)
      assert.equal(await page.locator('.defend-pad[data-tower-type="love"]').count(), 1, `${where} Love is planted`)
      for (let step = 0; step < 2; step += 1) await compactBuy(page, where, step)
      for (let stage = 2; stage <= 7; stage += 1) {
        const frames = await compactPop(page)
        const n = eatCompact(stats, frames)
        const placedBad = frames.filter((frame) => frame.card && (frame.header || (frame.glyph && glyphArea(frame.glyph, frame.card) > 0)))
        if (placedBad.length) {
          const worst = placedBad.reduce((best, frame) => Math.max(best, frame.glyph ? glyphArea(frame.glyph, frame.card) : 0), 0)
          console.log(`checkCompactLampCard place ${where} love@${stage} headerFrames=${placedBad.filter((frame) => frame.header).length} overlap=${worst.toFixed(1)}px2`)
        }
        assert.ok(n >= 8, `${where} love@${stage} sampled ${n} card frames`)
        const shown = await page.evaluate(() => document.querySelector('.defend-pad[data-tower-type="love"] .lamp-upgrade-glyph[data-glyph-variant="map"]')?.getAttribute('data-glyph-stage'))
        assert.equal(shown, String(stage), `${where} card opened on love@${stage}`)
        await compactGold(page, stats, `${where} love@${stage}`)
        await compactFonts(page, `${where} love@${stage}`)
        if (process.env.NW_REASON_SHOT === '1' && width === 375 && seat.cx === 464 && seat.cy === 360 && (stage === 4 || stage === 7)) {
          const dir = process.env.NW_REASON_SHOT_DIR || join(tmpdir(), 'nw-reason-shots')
          mkdirSync(dir, { recursive: true })
          const clip = await page.evaluate(() => {
            const card = document.querySelector('.defend-tower-card')?.getBoundingClientRect()
            if (!card) return null
            const left = Math.max(0, card.left - 8)
            const top = Math.max(0, card.top - 8)
            const right = Math.min(innerWidth, card.right + 8)
            const bottom = Math.min(innerHeight, card.bottom + 8)
            return { x: left, y: top, width: Math.max(8, right - left), height: Math.max(8, bottom - top) }
          })
          if (clip) await page.screenshot({ path: join(dir, `375-love-${stage}.png`), clip })
        }
        if (process.env.NW_COMPACT_SHOT === '1' && width === 375 && seat.cx === 464 && seat.cy === 768 && stage === 4) {
          const dir = process.env.NW_COMPACT_SHOT_DIR || join(tmpdir(), 'nw-compact-shots')
          mkdirSync(dir, { recursive: true })
          const name = tall ? '375-love4-before' : '375-love4-after'
          await page.screenshot({ path: join(dir, `${name}.png`) })
          const clip = await page.evaluate(() => {
            const card = document.querySelector('.defend-tower-card')?.getBoundingClientRect()
            const glyph = document.querySelector('.defend-pad[data-tower-type="love"] .lamp-upgrade-glyph[data-glyph-variant="map"]')?.getBoundingClientRect()
            if (!card) return null
            const left = Math.max(0, Math.min(card.left, glyph?.left ?? card.left) - 12)
            const top = Math.max(0, Math.min(card.top, glyph?.top ?? card.top) - 12)
            const right = Math.min(innerWidth, Math.max(card.right, glyph?.right ?? card.right) + 12)
            const bottom = Math.min(innerHeight, Math.max(card.bottom, glyph?.bottom ?? card.bottom) + 16)
            return { x: left, y: top, width: Math.max(8, right - left), height: Math.max(8, bottom - top) }
          })
          if (clip) await page.screenshot({ path: join(dir, `${name}-crop.png`), clip })
        }
        if (stage < 7) await compactBuy(page, where, stage)
      }
      if (!waved && seat.cx === 464 && seat.cy === 768 && process.env.NW_COMPACT_SKIP_WAVE !== '1') {
        if (await page.locator('.defend-tower-card').count()) {
          await page.keyboard.press('Escape')
          await page.locator('.defend-tower-card').waitFor({ state: 'detached' })
        }
        await page.locator('.defend-go').click()
        await page.waitForSelector('.easy-walker, [data-walker-id]', { state: 'attached', timeout: 20_000 })
        const waveFrames = await compactPop(page)
        const waveN = eatCompact(stats, waveFrames)
        const waveBad = waveFrames.filter((frame) => frame.card && (frame.header || (frame.glyph && glyphArea(frame.glyph, frame.card) > 0)))
        if (waveBad.length) {
          const worst = waveBad.reduce((best, frame) => Math.max(best, frame.glyph ? glyphArea(frame.glyph, frame.card) : 0), 0)
          console.log(`checkCompactLampCard place ${where} mid-wave headerFrames=${waveBad.filter((frame) => frame.header).length} overlap=${worst.toFixed(1)}px2`)
        }
        assert.ok(waveN >= 8, `${where} mid-wave sampled ${waveN} card frames`)
        await page.locator('.defend-raider.is-easy-cue').waitFor({ timeout: 8_000 }).catch(() => {})
        await compactGold(page, stats, `${where} mid-wave`)
        await page.keyboard.press('Escape')
        await page.locator('.defend-tower-card').waitFor({ state: 'detached' })
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
        await page.locator('.defend-continue').waitFor()
        await page.waitForTimeout(400)
        const clearFrames = await compactPop(page)
        const clearN = eatCompact(stats, clearFrames)
        const clearBad = clearFrames.filter((frame) => frame.card && (frame.header || (frame.glyph && glyphArea(frame.glyph, frame.card) > 0)))
        if (clearBad.length) {
          const worst = clearBad.reduce((best, frame) => Math.max(best, frame.glyph ? glyphArea(frame.glyph, frame.card) : 0), 0)
          console.log(`checkCompactLampCard place ${where} clear-row headerFrames=${clearBad.filter((frame) => frame.header).length} overlap=${worst.toFixed(1)}px2`)
        }
        assert.ok(clearN >= 8, `${where} clear-row sampled ${clearN} card frames`)
        await compactGold(page, stats, `${where} clear-row`)
        if (!tall) await compactFonts(page, `${where} clear-row`)
        waved = true
      }
      await context.close()
    }
    const detail = compactDetail(label, stats)
    console.log(`checkCompactLampCard measure ${detail}`)
    assert.equal(stats.header, 0, `checkCompactLampCard header-copy frames ${detail}`)
    assert.equal(stats.overlap, 0, `checkCompactLampCard card intersects glyph ${detail}`)
    assert.ok(stats.minGap >= GLYPH_MIN_GAP, `checkCompactLampCard gap ${detail}`)
    if (Number.isFinite(stats.minTip)) assert.ok(stats.minTip >= GLYPH_MIN_GAP, `checkCompactLampCard pointer tip ${detail}`)
    assert.ok(stats.beginFrames > 0 && stats.beginSlack >= SOLVER_BEGIN_GAP - 0.01, `checkCompactLampCard Begin card bottom <= goTop-8 ${detail}`)
    assert.equal(stats.beginHitBad, 0, `checkCompactLampCard Begin centre hits .defend-go ${detail}`)
    assert.ok(stats.railFrames > 0 && stats.railOver === 0, `checkCompactLampCard rail overlap ${detail}`)
    if (process.env.NW_COMPACT_SKIP_WAVE !== '1') {
      assert.ok(stats.clearFrames > 0 && stats.clearOver === 0, `checkCompactLampCard clear-row overlap ${detail}`)
      assert.ok(stats.waveFrames > 0, `checkCompactLampCard mid-wave frames ${detail}`)
    }
    assert.equal(stats.goldBad, 0, `checkCompactLampCard gold count === 1 ${detail}`)
    assert.deepEqual([...stats.goldCounts], [1], `checkCompactLampCard gold === 1 ${detail}`)
    console.log(`checkCompactLampCard gold ${label} gold=1`)
    assert.ok(stats.frames > 0, `checkCompactLampCard sampled no card frames ${detail}`)
    assert.ok(stats.lineFrames > 0, `checkCompactLampCard sampled no text lines ${detail}`)
    for (const [rendered, source] of stats.reasons) {
      console.log(`checkCompactLampCard reason ${label} rendered=${JSON.stringify(rendered)} source=${JSON.stringify(source)}`)
    }
    for (const note of stats.lineNotes) console.log(`checkCompactLampCard line ${label} ${note}`)
    if (stats.clipped !== 0) {
      const msg = `checkCompactLampCard clip ${label} clipped=${stats.clipped} ${stats.clipSample.join(' | ')}`
      console.log(msg)
      clipFails.push(msg)
    } else {
      console.log(`checkCompactLampCard ok ${label} frames=${stats.frames} cardH=${Math.round(stats.cardH)} clipped=0`)
    }
    assert.equal(stats.reasons.get(TREE_LOCK), TREE_LOCK, `${label} path lock renders ${TREE_LOCK}`)
    assert.equal(stats.reasons.get(BRIGHT_LINE), BRIGHT_LINE, `${label} Bright line renders ${BRIGHT_LINE}`)
  }
  assert.equal(clipFails.length, 0, clipFails.join('\n'))
}

/** 1.4.576 Easy pre-plant, camera off, reduced motion. Begin, live seats, the rail, and the rail tower taps. */
const TABLET_BEGIN_MAIN = {
  '375x667': {
    begin: { x: 67.5, y: 602.6, w: 240, h: 56.4 },
    rail: { x: 310, y: 98, w: 60, h: 216 },
    seats: [
      { x: 266, y: 114.3, w: 46.6, h: 46.6 },
      { x: 197.1, y: 183.1, w: 46.6, h: 46.6 },
      { x: 197.1, y: 251.9, w: 46.6, h: 46.6 },
      { x: 197.1, y: 458.5, w: 46.6, h: 46.6 },
      { x: 266, y: 527.3, w: 46.6, h: 46.6 },
    ],
    towers: [
      { x: 316, y: 104, w: 48, h: 48 },
      { x: 316, y: 156, w: 48, h: 48 },
      { x: 316, y: 208, w: 48, h: 48 },
      { x: 316, y: 260, w: 48, h: 48 },
    ],
  },
  '390x844': {
    begin: { x: 75, y: 779.6, w: 240, h: 56.4 },
    rail: { x: 325, y: 98, w: 60, h: 216 },
    seats: [
      { x: 297.6, y: 120.8, w: 60.9, h: 60.9 },
      { x: 207.6, y: 210.9, w: 60.9, h: 60.9 },
      { x: 207.6, y: 300.9, w: 60.9, h: 60.9 },
      { x: 207.6, y: 571.1, w: 60.9, h: 60.9 },
      { x: 297.6, y: 661.2, w: 60.9, h: 60.9 },
    ],
    towers: [
      { x: 331, y: 104, w: 48, h: 48 },
      { x: 331, y: 156, w: 48, h: 48 },
      { x: 331, y: 208, w: 48, h: 48 },
      { x: 331, y: 260, w: 48, h: 48 },
    ],
  },
  '412x915': {
    begin: { x: 86, y: 850.6, w: 240, h: 56.4 },
    rail: { x: 347, y: 98, w: 60, h: 216 },
    seats: [
      { x: 318.4, y: 123.4, w: 66.7, h: 66.7 },
      { x: 219.8, y: 222, w: 66.7, h: 66.7 },
      { x: 219.8, y: 320.6, w: 66.7, h: 66.7 },
      { x: 219.8, y: 616.4, w: 66.7, h: 66.7 },
      { x: 318.4, y: 714.9, w: 66.7, h: 66.7 },
    ],
    towers: [
      { x: 353, y: 104, w: 48, h: 48 },
      { x: 353, y: 156, w: 48, h: 48 },
      { x: 353, y: 208, w: 48, h: 48 },
      { x: 353, y: 260, w: 48, h: 48 },
    ],
  },
  '768x1024': {
    begin: { x: 77.8, y: 934, w: 162, h: 56 },
    rail: { x: 674, y: 113, w: 76, h: 311.3 },
    seats: [
      { x: 505.3, y: 140.7, w: 72, h: 72 },
      { x: 398.9, y: 247.1, w: 72, h: 72 },
      { x: 398.9, y: 353.5, w: 72, h: 72 },
      { x: 398.9, y: 672.8, w: 72, h: 72 },
      { x: 505.3, y: 779.2, w: 72, h: 72 },
    ],
    towers: [
      { x: 682, y: 121, w: 60, h: 69.3 },
      { x: 682, y: 196.3, w: 60, h: 69.3 },
      { x: 682, y: 271.6, w: 60, h: 69.3 },
      { x: 682, y: 346.9, w: 60, h: 69.3 },
    ],
  },
}

const TABLET_BEGIN_SIZES = [
  [375, 667],
  [390, 844],
  [412, 915],
  [768, 1024],
]

function rectDelta(now, was) {
  return {
    x: now.x - was.x,
    y: now.y - was.y,
    w: now.w - was.w,
    h: now.h - was.h,
  }
}

function maxRectDelta(pairs) {
  let worst = 0
  for (const { now, was } of pairs) {
    const d = rectDelta(now, was)
    for (const key of ['x', 'y', 'w', 'h']) worst = Math.max(worst, Math.abs(d[key]))
  }
  return worst
}

/**
 * 1.4.577 (#884a). Easy pre-plant Begin is grey on a tablet, same as a phone.
 * One gold cue (the first-seat ring). Begin is not in mapGoldCues.
 * `nwLamps=0` is the playtest bare path and paints Begin live (`is-after-plant`), so this opens
 * the filed camera-off pre-plant night instead.
 */
async function checkTabletBeginGold(browser, port, errors) {
  const only = process.env.NW_BEGIN_SIZE
  for (const [width, height] of TABLET_BEGIN_SIZES) {
    const label = `${width}x${height}`
    if (only && only !== label) continue
    const { context, page } = await openMap(browser, port, width, height, 'a2', {
      search: '?playtest=1&nwSeed=2&nwCam=0',
    })
    page.on('pageerror', (error) => errors.push(`begin-gold ${label} ${error}`))
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(`begin-gold ${label} ${msg.text()}`)
    })
    await page.locator('.defend-go.is-awaiting-plant').waitFor()
    const sampled = await page.evaluate(async () => {
      const gold = (value) => {
        const re = /rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*([\d.]+))?/g
        let match
        while ((match = re.exec(value || ''))) {
          const r = Number(match[1])
          const g = Number(match[2])
          const b = Number(match[3])
          const a = match[4] === undefined ? 1 : Number(match[4])
          if (a >= 0.3 && r > 190 && g > 140 && b < 120 && r > b + 60 && g > b + 30) return true
        }
        return false
      }
      const round = (n) => Math.round(n * 10) / 10
      const box = (el) => {
        if (!el) return null
        const r = el.getBoundingClientRect()
        if (r.width < 1 || r.height < 1) return null
        return { x: round(r.x), y: round(r.y), w: round(r.width), h: round(r.height) }
      }
      const read = () => {
        const root = document.querySelector('.defend-page')
        const chrome = 'button, .defend-abilities, .defend-boost, .defend-tower-card, .defend-path-pip, .nw-balloon-orb, .defend-wave, .defend-ability-stock'
        const names = !root
          ? []
          : [...root.querySelectorAll(chrome)]
              .filter((node) => !node.closest('.defend-nw-debug'))
              .filter((node) => {
                const rect = node.getBoundingClientRect()
                const style = getComputedStyle(node)
                return rect.width > 1 && rect.height > 1 && style.display !== 'none' && style.visibility !== 'hidden' && Number(style.opacity) > 0
              })
              .filter((node) => {
                const style = getComputedStyle(node)
                const text = [...node.childNodes].some((child) => child.nodeType === 3 && child.textContent.trim())
                const border = ['Top', 'Right', 'Bottom', 'Left'].some((side) => style[`border${side}Width`] !== '0px' && gold(style[`border${side}Color`]))
                return gold(style.backgroundImage) || gold(style.backgroundColor) || border || gold(style.boxShadow) || (text && gold(style.color))
              })
              .map((node) => `${node.tagName}.${node.getAttribute('class') || ''}`.slice(0, 80))
        const rings = [...document.querySelectorAll('.defend-plant-ground circle')].filter((node) => {
          const rect = node.getBoundingClientRect()
          const style = getComputedStyle(node)
          if (rect.width <= 1 || rect.height <= 1 || style.display === 'none' || style.visibility === 'hidden' || Number(style.opacity) === 0) return false
          return gold(style.stroke) || gold(style.fill) || gold(style.filter)
        })
        const go = document.querySelector('.defend-go')
        const goStyle = go ? getComputedStyle(go) : null
        const goGold = Boolean(
          goStyle &&
            (gold(goStyle.backgroundImage) ||
              gold(goStyle.backgroundColor) ||
              gold(goStyle.color) ||
              gold(goStyle.boxShadow) ||
              ['Top', 'Right', 'Bottom', 'Left'].some((side) => goStyle[`border${side}Width`] !== '0px' && gold(goStyle[`border${side}Color`]))),
        )
        return {
          names,
          rings: rings.length,
          gold: names.length + rings.length,
          beginGold: names.some((name) => name.includes('defend-go')) || goGold ? 1 : 0,
          awaiting: go?.classList.contains('is-awaiting-plant') ? 1 : 0,
          text: (go?.textContent || '').replace(/\s+/g, ' ').trim(),
          begin: box(go),
          rail: box(document.querySelector('.nw-rail')),
          seats: [...document.querySelectorAll('.defend-plant-ground circle.is-live')].map(box).filter(Boolean),
          towers: [...document.querySelectorAll('.nw-rail .defend-ability, button.defend-new-lamp, .defend-pad')].map(box).filter(Boolean),
        }
      }
      const frames = []
      const start = performance.now()
      await new Promise((resolve) => {
        const tick = () => {
          frames.push(read())
          if (performance.now() - start < 1500) requestAnimationFrame(tick)
          else resolve()
        }
        requestAnimationFrame(tick)
      })
      return { frames, ms: Math.round(performance.now() - start) }
    })
    const cues = await mapGoldCues(page)
    const last = sampled.frames.at(-1)
    assert.ok(last, `${label} sampled no pre-plant frames`)
    assert.deepEqual(
      cues.filter((name) => name.includes('defend-go')),
      last.names.filter((name) => name.includes('defend-go')),
      `${label} mapGoldCues Begin membership matches the last frame`,
    )
    assert.ok(sampled.ms >= 1500, `${label} sampled ${sampled.ms}ms, want at least 1500`)
    assert.ok(sampled.frames.length >= 30, `${label} sampled ${sampled.frames.length} frames`)
    const goldCounts = [...new Set(sampled.frames.map((frame) => frame.gold))]
    const beginCounts = [...new Set(sampled.frames.map((frame) => frame.beginGold))]
    const nameSet = [...new Set(sampled.frames.flatMap((frame) => frame.names))]
    console.log(
      `checkTabletBeginGold measure ${label} frames=${sampled.frames.length} ms=${sampled.ms} gold=${goldCounts.join('|')} beginGold=${beginCounts.join('|')} rings=${last.rings} names=${nameSet.join(' | ') || '(none)'}`,
    )
    const main = TABLET_BEGIN_MAIN[label]
    const worst = { begin: 0, seat: 0, rail: 0, tower: 0 }
    for (const frame of sampled.frames) {
      assert.equal(frame.awaiting, 1, `${label} Begin stays is-awaiting-plant`)
      assert.equal(frame.text, 'Begin the watch', `${label} Begin copy stays Begin the watch`)
      assert.equal(frame.seats.length, main.seats.length, `${label} live seat count`)
      assert.equal(frame.towers.length, main.towers.length, `${label} tower tap count`)
      assert.ok(frame.begin && frame.rail, `${label} Begin and rail have rects`)
      worst.begin = Math.max(worst.begin, maxRectDelta([{ now: frame.begin, was: main.begin }]))
      worst.rail = Math.max(worst.rail, maxRectDelta([{ now: frame.rail, was: main.rail }]))
      worst.seat = Math.max(
        worst.seat,
        maxRectDelta(frame.seats.map((now, index) => ({ now, was: main.seats[index] }))),
      )
      worst.tower = Math.max(
        worst.tower,
        maxRectDelta(frame.towers.map((now, index) => ({ now, was: main.towers[index] }))),
      )
    }
    const fmt = (n) => n.toFixed(1)
    console.log(
      `checkTabletBeginGold delta ${label} begin=${fmt(worst.begin)} seat=${fmt(worst.seat)} rail=${fmt(worst.rail)} tower=${fmt(worst.tower)}`,
    )
    assert.ok(worst.begin <= 1 && worst.seat <= 1 && worst.rail <= 1 && worst.tower <= 1, `${label} tap targets moved more than 1px`)
    const badGold = sampled.frames.filter((frame) => frame.gold !== 1 || frame.beginGold !== 0)
    if (process.env.NW_BEGIN_SHOT === '1' && (width === 375 || width === 768)) {
      const dir = process.env.NW_BEGIN_SHOT_DIR || join(tmpdir(), 'nw-begin-gold')
      mkdirSync(dir, { recursive: true })
      const tag = process.env.NW_BEGIN_SHOT_TAG || 'shot'
      await page.screenshot({ path: join(dir, `${width}-preplant-FREEZE-${tag}.png`) })
      const clip = await page.evaluate(() => {
        const go = document.querySelector('.defend-go')?.getBoundingClientRect()
        if (!go) return null
        const left = Math.max(0, go.left - 16)
        const top = Math.max(0, go.top - 24)
        const right = Math.min(innerWidth, go.right + 16)
        const bottom = Math.min(innerHeight, go.bottom + 16)
        return { x: left, y: top, width: Math.max(8, right - left), height: Math.max(8, bottom - top) }
      })
      if (clip) await page.screenshot({ path: join(dir, `${width}-preplant-begin-${tag}.png`), clip })
    }
    if (badGold.length) {
      console.log(
        `checkTabletBeginGold fail ${label} frames=${badGold.length} gold=${goldCounts.join('|')} beginGold=${beginCounts.join('|')} names=${nameSet.join(' | ') || '(none)'}`,
      )
    }
    assert.equal(badGold.length, 0, `${label} gold must be 1 and beginGold 0 on every frame (gold=${goldCounts.join('|')} beginGold=${beginCounts.join('|')})`)
    console.log(`checkTabletBeginGold ok ${label} gold=1 beginGold=0`)
    await context.close()
  }
}

const EASY_ONE_GOLD_SIZES = [[375, 667], [390, 844], [412, 915]]

const EASY_ONE_GOLD_MS = 1500

/**
 * Viewport rects of the gold button and the buttons this hop touches, measured on 1.4.579
 * at scroll 0 (settings included). Rounded to 0.1px. Null until that measure is pinned.
 */
const EASY_GOLD_BASE_1579 = {
  '375x667 home-first': { '2 Help': { x: 131, y: 561, w: 113, h: 48 } },
  '375x667 home-after-l1': { '3 Lock In': { x: 250, y: 584.1, w: 113, h: 48 } },
  '375x667 settings-more': {
    'Open Profile': { x: 41, y: 1406.5, w: 130, h: 52 },
    Candy: { x: 41, y: 1814.6, w: 84, h: 52 },
    'Dusk town': { x: 133, y: 1814.6, w: 112, h: 52 },
    'Clean parchment': { x: 41, y: 1874.6, w: 162, h: 52 },
    'Export JSON': { x: 41, y: 2177.9, w: 132, h: 52 },
    'Import pasted save': { x: 41, y: 2423.7, w: 176, h: 52 },
  },
  '390x844 home-first': { '2 Help': { x: 136, y: 738, w: 118, h: 48 } },
  '390x844 home-after-l1': { '3 Lock In': { x: 260, y: 761.1, w: 118, h: 48 } },
  '390x844 settings-more': {
    'Open Profile': { x: 41, y: 1407.9, w: 130, h: 52 },
    Candy: { x: 41, y: 1816, w: 84, h: 52 },
    'Dusk town': { x: 133, y: 1816, w: 112, h: 52 },
    'Clean parchment': { x: 41, y: 1876, w: 162, h: 52 },
    'Export JSON': { x: 41, y: 2154.5, w: 132, h: 52 },
    'Import pasted save': { x: 41, y: 2400.3, w: 176, h: 52 },
  },
  '412x915 home-first': { '2 Help': { x: 143.3, y: 809, w: 125.3, h: 48 } },
  '412x915 home-after-l1': { '3 Lock In': { x: 274.7, y: 832.1, w: 125.3, h: 48 } },
  '412x915 settings-more': {
    'Open Profile': { x: 41, y: 1360.7, w: 130, h: 52 },
    Candy: { x: 41, y: 1768.8, w: 84, h: 52 },
    'Dusk town': { x: 133, y: 1768.8, w: 112, h: 52 },
    'Clean parchment': { x: 41, y: 1828.8, w: 162, h: 52 },
    'Export JSON': { x: 41, y: 2107.3, w: 132, h: 52 },
    'Import pasted save': { x: 41, y: 2353.1, w: 176, h: 52 },
  },
}

function easyGoldRound(n) {
  return Math.round(n * 10) / 10
}

function assertEasyGoldRects(size, screen, rects) {
  const base = EASY_GOLD_BASE_1579[`${size} ${screen}`] || {}
  const shifts = []
  for (const [name, was] of Object.entries(base)) {
    const rect = rects[name]
    assert.ok(rect, `${size} ${screen} missing 1.4.579 rect for ${name}`)
    const d = {
      x: easyGoldRound(rect.x - was.x),
      y: easyGoldRound(rect.y - was.y),
      w: easyGoldRound(rect.w - was.w),
      h: easyGoldRound(rect.h - was.h),
    }
    assert.equal(d.x, 0, `${size} ${screen} ${name} x delta vs 1.4.579 is ${d.x}`)
    assert.equal(d.w, 0, `${size} ${screen} ${name} w delta vs 1.4.579 is ${d.w}`)
    assert.equal(d.h, 0, `${size} ${screen} ${name} h delta vs 1.4.579 is ${d.h}`)
    if (screen === 'settings-more' && name !== 'Open Profile') shifts.push(d.y)
    else assert.equal(d.y, 0, `${size} ${screen} ${name} y delta vs 1.4.579 is ${d.y}`)
  }
  if (shifts.length) {
    assert.equal(new Set(shifts).size, 1, `${size} ${screen} button y shift is not one What's new growth ${shifts.join(',')}`)
  }
}

/**
 * #916. Easy only. One gold cue per screen: a filled button or a ring/halo/glow.
 * Same gold color test as mapGoldCues. Rings use the home halo selector set
 * (stroke, fill, filter). A hairline --line border or gold text is not a cue.
 */
async function readEasyGold(page) {
  return page.evaluate(async (minMs) => {
    const gold = (value) => {
      const re = /rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*([\d.]+))?/g
      let match
      while ((match = re.exec(value || ''))) {
        const r = Number(match[1])
        const g = Number(match[2])
        const b = Number(match[3])
        const a = match[4] === undefined ? 1 : Number(match[4])
        if (a >= 0.3 && r > 190 && g > 140 && b < 120 && r > b + 60 && g > b + 30) return true
      }
      return false
    }
    const shown = (el) => {
      const style = getComputedStyle(el)
      const box = el.getBoundingClientRect()
      return style.display !== 'none' && style.visibility !== 'hidden' && Number(style.opacity) > 0 && box.width > 1 && box.height > 1
    }
    const inView = (box) => box.bottom > 0 && box.right > 0 && box.top < innerHeight && box.left < innerWidth
    const round = (n) => Math.round(n * 10) / 10
    const boxOf = (el) => {
      const r = el.getBoundingClientRect()
      const scroller = document.querySelector('.app-body')
      const x = r.x + (scroller ? scroller.scrollLeft : 0)
      const y = r.y + (scroller ? scroller.scrollTop : 0)
      return { x: round(x), y: round(y), w: round(r.width), h: round(r.height), vx: r.x, vy: r.y }
    }
    const labelOf = (el) => {
      const parts = []
      const walk = (node) => {
        if (node.nodeType === 3) {
          const text = node.textContent.replace(/\s+/g, ' ').trim()
          if (text) parts.push(text)
          return
        }
        if (node.nodeType === 1) {
          for (const child of node.childNodes) walk(child)
        }
      }
      walk(el)
      const aria = el.getAttribute('aria-label')
      const text = parts.join(' ') || (aria || '').replace(/\s+/g, ' ').trim()
      return text.slice(0, 48)
    }
    const nameOf = (el) => {
      const cls = String(el.getAttribute('class') || '').split(/\s+/).filter(Boolean).slice(0, 4).join('.')
      const text = labelOf(el)
      return `${el.tagName.toLowerCase()}.${cls}${text ? ` "${text}"` : ''}`
    }
    const norm = (value) => String(value || '').replace(/\s+/g, ' ').trim()
    const lineOf = (el) => {
      const directs = [...el.childNodes].filter((child) => child.nodeType === 3 && child.textContent && child.textContent.trim())
      if (!directs.length || !shown(el)) return null
      const style = getComputedStyle(el)
      const rect = el.getBoundingClientRect()
      const source = norm(directs.map((child) => child.textContent).join(''))
      const padL = parseFloat(style.paddingLeft) || 0
      const padR = parseFloat(style.paddingRight) || 0
      const padT = parseFloat(style.paddingTop) || 0
      const padB = parseFloat(style.paddingBottom) || 0
      const content = {
        left: rect.left + (parseFloat(style.borderLeftWidth) || 0) + padL - 1,
        right: rect.right - (parseFloat(style.borderRightWidth) || 0) - padR + 1,
        top: rect.top + (parseFloat(style.borderTopWidth) || 0) + padT - 1,
        bottom: rect.bottom - (parseFloat(style.borderBottomWidth) || 0) - padB + 1,
      }
      const range = document.createRange()
      let rendered = ''
      for (const child of directs) {
        const raw = child.textContent
        for (let i = 0; i < raw.length; i += 1) {
          const ch = raw[i]
          if (!ch.trim()) {
            rendered += ch
            continue
          }
          range.setStart(child, i)
          range.setEnd(child, i + 1)
          let painted = false
          for (const bit of range.getClientRects()) {
            if (bit.width <= 0 || bit.height <= 0) continue
            if (bit.left >= content.left && bit.right <= content.right && bit.top >= content.top && bit.bottom <= content.bottom) {
              painted = true
              break
            }
          }
          if (painted) rendered += ch
        }
      }
      return {
        name: nameOf(el),
        source,
        rendered: norm(rendered),
        overflow: style.textOverflow,
        scroll: el.scrollWidth,
        client: el.clientWidth,
        scrollH: el.scrollHeight,
        clientH: el.clientHeight,
      }
    }
    const cues = () => {
      const names = []
      const buttons = []
      for (const el of document.querySelectorAll('button, a.btn')) {
        if (!(el instanceof HTMLElement)) continue
        if (el.closest('[hidden], .easy-core')) continue
        if (!shown(el) || !inView(el.getBoundingClientRect())) continue
        const style = getComputedStyle(el)
        const fill = gold(style.backgroundImage) || gold(style.backgroundColor)
        const glow = gold(style.boxShadow)
        if (!fill && !glow) continue
        names.push(nameOf(el))
        buttons.push(el)
      }
      const rings = []
      for (const el of document.querySelectorAll('.city-next-halo, .city-plot-select, .city-plot.is-ready .city-plot-hit, [class*="halo"], [class*="glow"]')) {
        if (el.closest('[hidden]')) continue
        if (!shown(el) || !inView(el.getBoundingClientRect())) continue
        const style = getComputedStyle(el)
        const stroke = style.stroke !== 'none' && parseFloat(style.strokeWidth) > 0 && gold(style.stroke)
        const fill = style.fill !== 'none' && gold(style.fill)
        const filter = gold(style.filter)
        const glow = gold(style.boxShadow)
        if (!stroke && !fill && !filter && !glow) continue
        const name = nameOf(el)
        if (!names.includes(name)) names.push(name)
        rings.push(el)
      }
      return { names, buttons }
    }
    const touched = () => {
      const out = []
      const take = (el) => {
        if (!(el instanceof HTMLElement) || out.includes(el)) return
        if (el.closest('[hidden], .easy-core')) return
        if (!shown(el)) return
        out.push(el)
      }
      for (const el of document.querySelectorAll('.theme-picks .btn, button')) {
        const text = labelOf(el)
        if (text === 'Import pasted save' || text === 'Export JSON') take(el)
      }
      for (const el of document.querySelectorAll('.theme-picks .btn')) take(el)
      for (const el of cues().buttons) take(el)
      return out
    }
    const read = () => {
      const found = cues()
      const theme = document.querySelector('.theme-picks')
      const themeBox = theme ? theme.getBoundingClientRect() : null
      const themeVisible = Boolean(themeBox && themeBox.height > 1 && inView(themeBox) && themeBox.bottom > 8 && themeBox.top < innerHeight - 8)
      const hits = []
      const rects = {}
      const lines = []
      for (const el of touched()) {
        const name = nameOf(el)
        const rect = boxOf(el)
        rects[labelOf(el)] = rect
        const cx = rect.vx + rect.w / 2
        const cy = rect.vy + rect.h / 2
        const barBottom = document.querySelector('.topbar')?.getBoundingClientRect().bottom ?? 0
        const centerIn = cy > barBottom + 1 && cy < innerHeight - 1 && cx > 1 && cx < innerWidth - 1
        if (centerIn) {
          const node = document.elementFromPoint(cx, cy)
          const hit = node === el || (node && el.contains(node))
          if (!hit) hits.push(`${name} -> ${node ? nameOf(node) : 'none'}`)
          const walk = (node) => {
            const line = lineOf(node)
            if (line) lines.push(line)
            for (const child of node.children) walk(child)
          }
          walk(el)
        }
      }
      return { names: found.names, gold: found.names.length, theme: themeVisible, hits, rects, lines }
    }
    const frames = []
    const start = performance.now()
    await new Promise((resolve) => {
      const tick = () => {
        frames.push(read())
        if (performance.now() - start < minMs) requestAnimationFrame(tick)
        else resolve()
      }
      requestAnimationFrame(tick)
    })
    return { frames, ms: Math.round(performance.now() - start) }
  }, EASY_ONE_GOLD_MS)
}

function easyGoldReport(size, screen, sampled) {
  const frames = sampled.frames
  const counts = [...new Set(frames.map((frame) => frame.gold))]
  const names = [...new Set(frames.flatMap((frame) => frame.names))]
  const themeFrames = frames.filter((frame) => frame.theme)
    const bad = frames.filter((frame) => (screen === 'settings-more' ? frame.gold >= 2 : frame.gold !== 1))
  const sawOne = frames.some((frame) => frame.gold === 1)
  const themeOk = screen !== 'settings-more' || (
    themeFrames.length > 0 &&
    themeFrames.some((frame) => frame.gold === 1) &&
    themeFrames.every((frame) => frame.gold < 2)
  )
  const ok = bad.length === 0 && sawOne && themeOk && sampled.ms >= EASY_ONE_GOLD_MS && frames.length >= 20
  const goldLabel = ok ? '1' : (bad.length ? [...new Set(bad.map((frame) => frame.gold))].join('|') : counts.join('|') || '0')
  const nameLabel = names.join(' | ') || '(none)'
  const line = ok
    ? `checkEasyOneGold ok ${size} ${screen} frames=${frames.length} gold=1 names=${nameLabel}`
    : `checkEasyOneGold fail ${size} ${screen} frames=${frames.length} gold=${goldLabel} names=${nameLabel}`
  return { ok, line, frames, names }
}

async function finishEasyLessonOne(page) {
  await page.locator('.easy-home-steps li.is-now .easy-coach-step').click()
  await page.locator('[data-maze-cell].is-here').waitFor({ timeout: 20_000 })
  const read = async (sel) => {
    const loc = page.locator(sel).first()
    return {
      r: Number(await loc.getAttribute('data-r')),
      c: Number(await loc.getAttribute('data-c')),
    }
  }
  const tap = async (cell) => {
    const loc = page.locator(`[data-maze-cell][data-r="${cell.r}"][data-c="${cell.c}"]`)
    const box = await loc.boundingBox()
    if (!box) throw new Error(`maze cell ${cell.r},${cell.c} has no box`)
    await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2)
  }
  const walk = async (target) => {
    for (let guard = 0; guard < 40; guard += 1) {
      if ((await page.locator('[data-maze-cell].is-here').count()) === 0) return
      const at = await read('[data-maze-cell].is-here')
      if (at.r === target.r && at.c === target.c) return
      const path = shortestMazePath(at, target)
      if (!path || path.length < 2) throw new Error(`no road from ${at.r},${at.c} to ${target.r},${target.c}`)
      await tap(path[1])
      if (path[1].r === target.r && path[1].c === target.c) {
        await page.locator('.play.is-road-maze.is-helped, .play.is-road-maze.is-win, [data-maze-dock]').first().waitFor({ timeout: 4000 }).catch(() => {})
        return
      }
      await page.waitForFunction(
        ({ r, c }) => {
          const here = document.querySelector('[data-maze-cell].is-here')
          return here?.getAttribute('data-r') === String(r) && here?.getAttribute('data-c') === String(c)
        },
        path[1],
        { timeout: 4000 },
      )
    }
    throw new Error(`maze walk did not reach ${target.r},${target.c}`)
  }
  await walk(await read('[data-maze-cell].is-hurt'))
  await page.locator('.play.is-road-maze.is-helped, .play.is-road-maze.is-win').first().waitFor({ timeout: 4000 })
  await walk(await read('[data-maze-cell].is-inn'))
  await page.locator('[data-maze-dock]').waitFor({ timeout: 8000 })
  await page.locator('[data-maze-dock] button', { hasText: 'Home' }).click()
  await page.locator('main.hub.is-easy-home').waitFor()
}

async function sampleEasyScreen(page, size, screen, fails) {
  const sampled = await readEasyGold(page)
  const report = easyGoldReport(size, screen, sampled)
  console.log(report.line)
  const rects = report.frames[0]?.rects || {}
  for (const [name, rect] of Object.entries(rects)) {
    console.log(`checkEasyOneGold rect ${size} ${screen} ${name} x=${rect.x} y=${rect.y} w=${rect.w} h=${rect.h}`)
  }
  const logged = new Set()
  let clipped = 0
  for (const frame of report.frames) {
    for (const line of frame.lines) {
      const note = `${line.name}|${line.overflow}|${line.scroll}|${line.client}|${line.scrollH}|${line.clientH}|${line.rendered}|${line.source}`
      if (!logged.has(note)) {
        logged.add(note)
        console.log(
          `checkEasyOneGold line ${size} ${screen} ${line.name} overflow=${line.overflow} scroll=${line.scroll} client=${line.client} scrollH=${line.scrollH} clientH=${line.clientH} rendered=${JSON.stringify(line.rendered)} source=${JSON.stringify(line.source)}`,
        )
      }
      const cut = line.scroll > line.client + 1 || line.scrollH > line.clientH + 1
      if (cut || line.overflow === 'ellipsis' || line.rendered !== line.source) clipped += 1
    }
    for (const miss of frame.hits) {
      assert.equal(miss, '', `${size} ${screen} centre tap missed ${miss}`)
    }
  }
  assert.equal(clipped, 0, `${size} ${screen} clipped text`)
  assert.ok(sampled.ms >= EASY_ONE_GOLD_MS, `${size} ${screen} sampled ${sampled.ms}ms`)
  assert.ok(report.frames.length >= 20, `${size} ${screen} sampled ${report.frames.length} frames`)
  assertEasyGoldRects(size, screen, rects)
  if (!report.ok) fails.push(report.line)
}

/**
 * 1.4.581 (#916). Fresh Easy save. One gold cue on Home (first view and after lesson 1)
 * and on Settings → More at every scroll stop that shows a gold cue or the Look row.
 */
async function checkEasyOneGold(browser, port, errors) {
  const only = process.env.EASY_ONE_GOLD_SIZE
  const fails = []
  for (const [width, height] of EASY_ONE_GOLD_SIZES) {
    const size = `${width}x${height}`
    if (only && only !== size) continue
    const context = await browser.newContext({
      baseURL: `http://127.0.0.1:${port}/`,
      viewport: { width, height },
      deviceScaleFactor: 1,
      reducedMotion: 'reduce',
    })
    await context.addInitScript(() => localStorage.clear())
    const page = await context.newPage()
    page.on('pageerror', (error) => errors.push(`easy-gold ${size} ${error}`))
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(`easy-gold ${size} ${msg.text()}`)
    })
    await page.goto('/?playtest=1')
    await page.getByRole('button', { name: 'Start Easy' }).click()
    await page.locator('main.hub.is-easy-home').waitFor()
    await page.locator('.city-next-halo, .easy-home-steps li.is-now').first().waitFor()
    await sampleEasyScreen(page, size, 'home-first', fails)
    await finishEasyLessonOne(page)
    await page.locator('.easy-home-steps li.is-now').waitFor()
    await sampleEasyScreen(page, size, 'home-after-l1', fails)
    await page.getByRole('button', { name: 'Settings' }).click()
    await page.locator('summary', { hasText: 'More' }).click()
    await page.locator('.theme-picks').waitFor()
    const stops = []
    let guard = 0
    let lastTop = -1
    while (guard < 16) {
      const top = await page.evaluate(() => {
        const scroller = document.querySelector('.app-body')
        return scroller ? scroller.scrollTop : 0
      })
      if (guard > 0 && Math.abs(top - lastTop) < 2) break
      lastTop = top
      const sampled = await readEasyGold(page)
      stops.push(sampled)
      const moved = await page.evaluate(() => {
        const scroller = document.querySelector('.app-body')
        if (!scroller) return false
        const before = scroller.scrollTop
        scroller.scrollTop = before + Math.round(scroller.clientHeight * 0.7)
        return scroller.scrollTop !== before
      })
      guard += 1
      if (!moved) break
    }
    const frames = stops.flatMap((stop) => stop.frames)
    const merged = { frames, ms: stops.reduce((sum, stop) => sum + stop.ms, 0) }
    const report = easyGoldReport(size, 'settings-more', merged)
    console.log(report.line)
    const rects = {}
    for (const stop of stops) Object.assign(rects, stop.frames[0]?.rects || {})
    for (const [name, rect] of Object.entries(rects)) {
      console.log(`checkEasyOneGold rect ${size} settings-more ${name} x=${rect.x} y=${rect.y} w=${rect.w} h=${rect.h}`)
    }
    assertEasyGoldRects(size, 'settings-more', rects)
    const logged = new Set()
    let clipped = 0
    for (const frame of frames) {
      for (const line of frame.lines) {
        const note = `${line.name}|${line.rendered}|${line.source}|${line.scroll}|${line.client}`
        if (logged.has(note)) continue
        logged.add(note)
        console.log(
          `checkEasyOneGold line ${size} settings-more ${line.name} overflow=${line.overflow} scroll=${line.scroll} client=${line.client} scrollH=${line.scrollH} clientH=${line.clientH} rendered=${JSON.stringify(line.rendered)} source=${JSON.stringify(line.source)}`,
        )
        const cut = line.scroll > line.client + 1 || line.scrollH > line.clientH + 1
        if (cut || line.overflow === 'ellipsis' || line.rendered !== line.source) clipped += 1
      }
      for (const miss of frame.hits) assert.equal(miss, '', `${size} settings-more centre tap missed ${miss}`)
    }
    assert.equal(clipped, 0, `${size} settings-more clipped text`)
    assert.ok(frames.some((frame) => frame.theme), `${size} settings-more never showed the Look row`)
    if (!report.ok) fails.push(report.line)
    await context.close()
  }
  assert.equal(fails.length, 0, fails.join('\n'))
}

const NW_DOCK_GOLD_SIZES = [
  [375, 667],
  [390, 844],
  [412, 915],
  [768, 1024],
]
const NW_DOCK_GOLD_MS = 1500
const NW_DOCK_GOLD_SEARCH = '?playtest=1&nwSeed=2&nwMap=a2&nwRound=18&nwLamps=0'

/**
 * Viewport rects of Begin, the rail, the four docks and the open card actions,
 * measured on unmodified 1.4.581 (the live fail). Rounded to 0.1px.
 * The pressed Candle dock sits 1px lower; that shift is the existing press, not this hop.
 */
const NW_DOCK_GOLD_BASE = {
  '375x667': {
    plant: {
      begin: { x: 67.5, y: 602.6, w: 240, h: 56.4 },
      rail: { x: 310, y: 98, w: 60, h: 216 },
      docks: {
        'dock-candle': { x: 6, y: 177, w: 52, h: 53.1 },
        'dock-bell': { x: 6, y: 235, w: 52, h: 53.1 },
        'dock-incense': { x: 6, y: 293, w: 52, h: 53.1 },
        'dock-cross': { x: 6, y: 351, w: 52, h: 53.1 },
      },
      card: {},
    },
    selected: {
      begin: { x: 67.5, y: 602.6, w: 240, h: 56.4 },
      rail: { x: 310, y: 98, w: 60, h: 216 },
      docks: {
        'dock-candle': { x: 6, y: 178, w: 52, h: 53.1 },
        'dock-bell': { x: 6, y: 235, w: 52, h: 53.1 },
        'dock-incense': { x: 6, y: 293, w: 52, h: 53.1 },
        'dock-cross': { x: 6, y: 351, w: 52, h: 53.1 },
      },
      card: {},
    },
    planted: {
      begin: { x: 67.5, y: 602.6, w: 240, h: 56.4 },
      rail: { x: 310, y: 98, w: 60, h: 216 },
      docks: {
        'dock-candle': { x: 6, y: 177, w: 52, h: 53.1 },
        'dock-bell': { x: 6, y: 235, w: 52, h: 53.1 },
        'dock-incense': { x: 6, y: 293, w: 52, h: 53.1 },
        'dock-cross': { x: 6, y: 351, w: 52, h: 53.1 },
      },
      card: {},
    },
    card: {
      begin: { x: 67.5, y: 602.6, w: 240, h: 56.4 },
      rail: { x: 310, y: 98, w: 60, h: 216 },
      docks: {
        'dock-candle': { x: 6, y: 177, w: 52, h: 53.1 },
        'dock-bell': { x: 6, y: 235, w: 52, h: 53.1 },
        'dock-incense': { x: 6, y: 293, w: 52, h: 53.1 },
        'dock-cross': { x: 6, y: 351, w: 52, h: 53.1 },
      },
      card: {
        pull: { x: 194.5, y: 167.7, w: 32, h: 32 },
        'pip-far': { x: 66.5, y: 202.1, w: 18, h: 16 },
        'buy-far': { x: 146.5, y: 177.3, w: 46, h: 44 },
        'pip-strong': { x: 66.5, y: 247.1, w: 18, h: 16 },
        'buy-strong': { x: 146.5, y: 222.3, w: 46, h: 44 },
      },
    },
  },
  '390x844': {
    plant: {
      begin: { x: 75, y: 779.6, w: 240, h: 56.4 },
      rail: { x: 325, y: 98, w: 60, h: 216 },
      docks: {
        'dock-candle': { x: 6, y: 177, w: 52, h: 53.1 },
        'dock-bell': { x: 6, y: 235, w: 52, h: 53.1 },
        'dock-incense': { x: 6, y: 293, w: 52, h: 53.1 },
        'dock-cross': { x: 6, y: 351, w: 52, h: 53.1 },
      },
      card: {},
    },
    selected: {
      begin: { x: 75, y: 779.6, w: 240, h: 56.4 },
      rail: { x: 325, y: 98, w: 60, h: 216 },
      docks: {
        'dock-candle': { x: 6, y: 178, w: 52, h: 53.1 },
        'dock-bell': { x: 6, y: 235, w: 52, h: 53.1 },
        'dock-incense': { x: 6, y: 293, w: 52, h: 53.1 },
        'dock-cross': { x: 6, y: 351, w: 52, h: 53.1 },
      },
      card: {},
    },
    planted: {
      begin: { x: 75, y: 779.6, w: 240, h: 56.4 },
      rail: { x: 325, y: 98, w: 60, h: 216 },
      docks: {
        'dock-candle': { x: 6, y: 177, w: 52, h: 53.1 },
        'dock-bell': { x: 6, y: 235, w: 52, h: 53.1 },
        'dock-incense': { x: 6, y: 293, w: 52, h: 53.1 },
        'dock-cross': { x: 6, y: 351, w: 52, h: 53.1 },
      },
      card: {},
    },
    card: {
      begin: { x: 75, y: 779.6, w: 240, h: 56.4 },
      rail: { x: 325, y: 98, w: 60, h: 216 },
      docks: {
        'dock-candle': { x: 6, y: 177, w: 52, h: 53.1 },
        'dock-bell': { x: 6, y: 235, w: 52, h: 53.1 },
        'dock-incense': { x: 6, y: 293, w: 52, h: 53.1 },
        'dock-cross': { x: 6, y: 351, w: 52, h: 53.1 },
      },
      card: {
        pull: { x: 272.2, y: 130, w: 32, h: 32 },
        'pip-far': { x: 144.2, y: 164.4, w: 18, h: 16 },
        'buy-far': { x: 224.2, y: 139.6, w: 46, h: 44 },
        'pip-strong': { x: 144.2, y: 209.4, w: 18, h: 16 },
        'buy-strong': { x: 224.2, y: 184.6, w: 46, h: 44 },
      },
    },
  },
  '412x915': {
    plant: {
      begin: { x: 86, y: 850.6, w: 240, h: 56.4 },
      rail: { x: 347, y: 98, w: 60, h: 216 },
      docks: {
        'dock-candle': { x: 6, y: 177, w: 52, h: 53.1 },
        'dock-bell': { x: 6, y: 235, w: 52, h: 53.1 },
        'dock-incense': { x: 6, y: 293, w: 52, h: 53.1 },
        'dock-cross': { x: 6, y: 351, w: 52, h: 53.1 },
      },
      card: {},
    },
    selected: {
      begin: { x: 86, y: 850.6, w: 240, h: 56.4 },
      rail: { x: 347, y: 98, w: 60, h: 216 },
      docks: {
        'dock-candle': { x: 6, y: 178, w: 52, h: 53.1 },
        'dock-bell': { x: 6, y: 235, w: 52, h: 53.1 },
        'dock-incense': { x: 6, y: 293, w: 52, h: 53.1 },
        'dock-cross': { x: 6, y: 351, w: 52, h: 53.1 },
      },
      card: {},
    },
    planted: {
      begin: { x: 86, y: 850.6, w: 240, h: 56.4 },
      rail: { x: 347, y: 98, w: 60, h: 216 },
      docks: {
        'dock-candle': { x: 6, y: 177, w: 52, h: 53.1 },
        'dock-bell': { x: 6, y: 235, w: 52, h: 53.1 },
        'dock-incense': { x: 6, y: 293, w: 52, h: 53.1 },
        'dock-cross': { x: 6, y: 351, w: 52, h: 53.1 },
      },
      card: {},
    },
    card: {
      begin: { x: 86, y: 850.6, w: 240, h: 56.4 },
      rail: { x: 347, y: 98, w: 60, h: 216 },
      docks: {
        'dock-candle': { x: 6, y: 177, w: 52, h: 53.1 },
        'dock-bell': { x: 6, y: 235, w: 52, h: 53.1 },
        'dock-incense': { x: 6, y: 293, w: 52, h: 53.1 },
        'dock-cross': { x: 6, y: 351, w: 52, h: 53.1 },
      },
      card: {
        pull: { x: 274.8, y: 130, w: 32, h: 32 },
        'pip-far': { x: 146.8, y: 164.4, w: 18, h: 16 },
        'buy-far': { x: 226.8, y: 139.6, w: 46, h: 44 },
        'pip-strong': { x: 146.8, y: 209.4, w: 18, h: 16 },
        'buy-strong': { x: 226.8, y: 184.6, w: 46, h: 44 },
      },
    },
  },
  '768x1024': {
    plant: {
      begin: { x: 77.8, y: 710, w: 162, h: 56 },
      rail: { x: 674, y: 113, w: 76, h: 311.3 },
      docks: {
        'dock-candle': { x: 77.8, y: 770, w: 162, h: 52 },
        'dock-bell': { x: 77.8, y: 826, w: 162, h: 52 },
        'dock-incense': { x: 77.8, y: 882, w: 162, h: 52 },
        'dock-cross': { x: 77.8, y: 938, w: 162, h: 52 },
      },
      card: {},
    },
    selected: {
      begin: { x: 77.8, y: 710, w: 162, h: 56 },
      rail: { x: 674, y: 113, w: 76, h: 311.3 },
      docks: {
        'dock-candle': { x: 77.8, y: 771, w: 162, h: 52 },
        'dock-bell': { x: 77.8, y: 826, w: 162, h: 52 },
        'dock-incense': { x: 77.8, y: 882, w: 162, h: 52 },
        'dock-cross': { x: 77.8, y: 938, w: 162, h: 52 },
      },
      card: {},
    },
    planted: {
      begin: { x: 77.8, y: 710, w: 162, h: 56 },
      rail: { x: 674, y: 113, w: 76, h: 311.3 },
      docks: {
        'dock-candle': { x: 77.8, y: 770, w: 162, h: 52 },
        'dock-bell': { x: 77.8, y: 826, w: 162, h: 52 },
        'dock-incense': { x: 77.8, y: 882, w: 162, h: 52 },
        'dock-cross': { x: 77.8, y: 938, w: 162, h: 52 },
      },
      card: {},
    },
    card: {
      begin: { x: 77.8, y: 710, w: 162, h: 56 },
      rail: { x: 674, y: 113, w: 76, h: 311.3 },
      docks: {
        'dock-candle': { x: 77.8, y: 770, w: 162, h: 52 },
        'dock-bell': { x: 77.8, y: 826, w: 162, h: 52 },
        'dock-incense': { x: 77.8, y: 882, w: 162, h: 52 },
        'dock-cross': { x: 77.8, y: 938, w: 162, h: 52 },
      },
      card: {
        pull: { x: 480.6, y: 121, w: 32, h: 32 },
        'pip-far': { x: 354.6, y: 170.8, w: 20, h: 20 },
        'buy-far': { x: 354.6, y: 196.8, w: 148, h: 52 },
        'pip-strong': { x: 354.6, y: 282.8, w: 20, h: 20 },
        'buy-strong': { x: 354.6, y: 308.8, w: 148, h: 52 },
      },
    },
  },
}

function nwDockRound(n) {
  return Math.round(n * 10) / 10
}

function nwDockRectDelta(now, was) {
  if (!now || !was) return null
  let worst = 0
  for (const key of ['x', 'y', 'w', 'h']) {
    worst = Math.max(worst, Math.abs(nwDockRound(now[key] - was[key])))
  }
  return worst
}

function nwDockGroupDelta(nowMap, wasMap) {
  const keys = new Set([...Object.keys(nowMap || {}), ...Object.keys(wasMap || {})])
  let worst = 0
  let missing = false
  for (const key of keys) {
    const delta = nwDockRectDelta(nowMap?.[key], wasMap?.[key])
    if (delta == null) missing = true
    else worst = Math.max(worst, delta)
  }
  return { worst, missing }
}

/**
 * #924. Easy R18 plant, debug freeze on, then Jump.
 * One gold cue per frame: computed background, border or lip (box-shadow) in the
 * same gold family as mapGoldCues, on a visible actionable control.
 * Never passes on 0 or on 2+.
 */
async function readNwDockGold(page) {
  return page.evaluate(async (minMs) => {
    const gold = (value) => {
      const re = /rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*([\d.]+))?/g
      let match
      while ((match = re.exec(value || ''))) {
        const r = Number(match[1])
        const g = Number(match[2])
        const b = Number(match[3])
        const a = match[4] === undefined ? 1 : Number(match[4])
        if (a >= 0.3 && r > 190 && g > 140 && b < 120 && r > b + 60 && g > b + 30) return true
      }
      return false
    }
    const visible = (el) => {
      const style = getComputedStyle(el)
      const box = el.getBoundingClientRect()
      return style.display !== 'none' && style.visibility !== 'hidden' && Number(style.opacity) > 0 && box.width > 1 && box.height > 1
    }
    const shown = (el) => visible(el) && getComputedStyle(el).pointerEvents !== 'none'
    const inView = (box) => box.bottom > 1 && box.right > 1 && box.top < innerHeight - 1 && box.left < innerWidth - 1
    const round = (n) => Math.round(n * 10) / 10
    const boxOf = (el) => {
      if (!el) return null
      const r = el.getBoundingClientRect()
      if (r.width < 1 || r.height < 1) return null
      return { x: round(r.x), y: round(r.y), w: round(r.width), h: round(r.height) }
    }
    const norm = (value) => String(value || '').replace(/\s+/g, ' ').trim()
    const nameOf = (el) => {
      const base = `${el.tagName}.${el.getAttribute('class') || ''}`.replace(/\s+/g, ' ').trim().slice(0, 80)
      const path = el.getAttribute('data-path-buy') || el.getAttribute('data-path-pip') || ''
      return path ? `${base} ${path}` : base
    }
    const tapKey = (el) => {
      if (el.classList.contains('defend-go')) return 'begin'
      if (el.classList.contains('defend-candle-lamp')) return 'dock-candle'
      if (el.classList.contains('defend-bell-lamp')) return 'dock-bell'
      if (el.classList.contains('defend-incense-lamp')) return 'dock-incense'
      if (el.classList.contains('defend-cross-lamp')) return 'dock-cross'
      if (el.classList.contains('defend-new-lamp')) return 'dock-new'
      const buy = el.getAttribute('data-path-buy')
      if (buy) return `buy-${buy}`
      const pip = el.getAttribute('data-path-pip')
      if (pip) return `pip-${pip}`
      if (el.classList.contains('defend-tower-pull')) return 'pull'
      if (el.classList.contains('defend-tower-upgrade')) return 'upgrade'
      if (el.classList.contains('defend-bright-buy')) return 'bright'
      if (el.classList.contains('defend-lesson-open')) return 'lesson'
      if (el.classList.contains('defend-pull-keep')) return 'keep'
      if (el.classList.contains('defend-pull-do')) return 'pull-do'
      return ''
    }
    const goldOf = (el) => {
      const style = getComputedStyle(el)
      const border = ['Top', 'Right', 'Bottom', 'Left'].some((side) => parseFloat(style[`border${side}Width`]) > 0 && gold(style[`border${side}Color`]))
      return gold(style.backgroundImage) || gold(style.backgroundColor) || border || gold(style.boxShadow)
    }
    const controls = () => [...document.querySelectorAll('button, a.btn, [role="button"]')].filter((el) => {
      if (!(el instanceof HTMLElement)) return false
      if (el.closest('.defend-nw-debug, [hidden]')) return false
      if (!shown(el)) return false
      return inView(el.getBoundingClientRect())
    })
    const lineOf = (el) => {
      const directs = [...el.childNodes].filter((child) => child.nodeType === 3 && child.textContent && child.textContent.trim())
      if (!directs.length || !visible(el)) return null
      if (el.closest('svg')) return null
      const style = getComputedStyle(el)
      const rect = el.getBoundingClientRect()
      if (rect.width < 2 || rect.height < 2) return null
      const source = norm(directs.map((child) => child.textContent).join(''))
      const range = document.createRange()
      let rendered = ''
      const host = { left: rect.left - 1, right: rect.right + 1, top: rect.top - 1, bottom: rect.bottom + 1 }
      for (const child of directs) {
        const raw = child.textContent
        for (let i = 0; i < raw.length; i += 1) {
          const ch = raw[i]
          if (!ch.trim()) {
            rendered += ch
            continue
          }
          range.setStart(child, i)
          range.setEnd(child, i + 1)
          let painted = false
          for (const bit of range.getClientRects()) {
            if (bit.width <= 0 || bit.height <= 0) continue
            if (bit.right > host.left && bit.left < host.right && bit.bottom > host.top && bit.top < host.bottom) {
              painted = true
              break
            }
          }
          if (painted) rendered += ch
        }
      }
      return {
        name: nameOf(el),
        source,
        rendered: norm(rendered),
        overflow: style.textOverflow,
        scroll: el.scrollWidth,
        client: el.clientWidth,
        scrollH: el.scrollHeight,
        clientH: el.clientHeight,
      }
    }
    const cardLines = () => {
      const card = document.querySelector('.defend-tower-card')
      if (!card) return []
      const lines = []
      for (const node of card.querySelectorAll('*')) {
        const line = lineOf(node)
        if (line) lines.push(line)
      }
      return lines
    }
    const read = () => {
      const found = controls().filter(goldOf)
      const names = found.map(nameOf)
      const rects = {}
      const hits = []
      const take = (key, el) => {
        if (!key || !el || rects[key]) return
        const rect = boxOf(el)
        if (!rect) return
        rects[key] = rect
        const cx = rect.x + rect.w / 2
        const cy = rect.y + rect.h / 2
        if (cx <= 1 || cy <= 1 || cx >= innerWidth - 1 || cy >= innerHeight - 1) {
          hits.push(`${key} offscreen`)
          return
        }
        const node = document.elementFromPoint(cx, cy)
        const hit = node === el || Boolean(node && el.contains(node))
        if (!hit) hits.push(`${key} -> ${node ? nameOf(node) : 'none'}`)
      }
      const rail = document.querySelector('.nw-rail')
      if (rail) {
        const rect = boxOf(rail)
        if (rect) rects.rail = rect
      }
      for (const el of document.querySelectorAll('.nw-rail .defend-ability')) {
        take(`rail-${el.getAttribute('data-type') || 'x'}`, el)
      }
      for (const key of Object.keys(rects)) {
        if (key.startsWith('rail-')) delete rects[key]
      }
      for (const el of controls()) take(tapKey(el), el)
      return {
        names,
        gold: names.length,
        rects,
        hits,
        lines: cardLines(),
        card: document.querySelector('.defend-tower-card') ? 1 : 0,
        docks: document.querySelectorAll('button.defend-new-lamp').length,
      }
    }
    const frames = []
    const start = performance.now()
    await new Promise((resolve) => {
      const tick = () => {
        frames.push(read())
        if (performance.now() - start < minMs) requestAnimationFrame(tick)
        else resolve()
      }
      requestAnimationFrame(tick)
    })
    return { frames, ms: Math.round(performance.now() - start) }
  }, NW_DOCK_GOLD_MS)
}

async function openNwDockGold(browser, port, width, height, errors) {
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
  page.on('pageerror', (error) => errors.push(`dock-gold ${label} ${error}`))
  page.on('console', (msg) => {
    if (msg.type() !== 'error') return
    const text = msg.text()
    if (text.includes('Encountered two children with the same key')) return
    errors.push(`dock-gold ${label} ${text}`)
  })
  await page.goto(`/${NW_DOCK_GOLD_SEARCH}`)
  await page.getByRole('button', { name: 'Settings' }).click()
  await page.locator('summary', { hasText: 'Developer' }).click()
  await page.getByRole('button', { name: 'Debug freeze · OFF' }).click()
  await page.getByRole('button', { name: 'Debug freeze · ON' }).waitFor()
  await page.getByRole('button', { name: 'Jump · Night Watch' }).click()
  await page.locator('.defend-board').waitFor()
  if (await page.locator('[data-map-overlay]').count()) {
    await page.locator('[data-map="a2"]').click()
    await page.locator('[data-map-overlay]').waitFor({ state: 'detached' })
  }
  await page.locator('.defend-go').waitFor()
  await page.locator('button.defend-new-lamp').nth(3).waitFor()
  const frozen = await page.evaluate(() => sessionStorage.getItem('silver-city-nw-debug-session'))
  assert.equal(frozen, 'on', `${label} debug freeze is on for this visit`)
  return { context, page, label }
}

async function nwDockSeat(page, label) {
  const ready = await page.evaluate(() => {
    const svg = document.querySelector('.defend-board')
    const ctm = svg?.getScreenCTM()
    if (!svg || !ctm) return null
    for (const ring of document.querySelectorAll('.defend-plant-ground circle.is-live')) {
      const p = svg.createSVGPoint()
      p.x = Number(ring.getAttribute('cx'))
      p.y = Number(ring.getAttribute('cy')) - 26
      const q = p.matrixTransform(ctm)
      if (q.x < 8 || q.y < 8 || q.x > innerWidth - 8 || q.y > innerHeight - 8) continue
      const hit = document.elementFromPoint(q.x, q.y)
      if (hit && hit.closest('.defend-board') && !hit.closest('button, .nw-rail, .nw-docks, .defend-tower-card')) {
        return { x: q.x, y: q.y }
      }
    }
    return null
  })
  if (ready) return ready
  return glyphNextSeat(page, label)
}

function nwDockSplit(rects) {
  const docks = {}
  const card = {}
  let begin = null
  let rail = null
  for (const [key, rect] of Object.entries(rects || {})) {
    if (key === 'begin') begin = rect
    else if (key === 'rail') rail = rect
    else if (key.startsWith('dock-')) docks[key] = rect
    else card[key] = rect
  }
  return { begin, rail, docks, card }
}

/**
 * #924a. Easy Night Watch keeps one gold cue on the R18 plant and on the
 * banked-spark selected, planted and card-open boards. Phone and tablet.
 */
async function checkNwDockGold(browser, port, errors) {
  const only = process.env.NW_DOCK_GOLD_SIZE
  const fails = []
  const clips = []
  const tapFails = []
  for (const [width, height] of NW_DOCK_GOLD_SIZES) {
    const size = `${width}x${height}`
    if (only && only !== size) continue
    const { context, page, label } = await openNwDockGold(browser, port, width, height, errors)
    const sparks = Number((await page.locator('.nw-balloon-count').innerText()).replace(/[^\d]/g, ''))
    const dockCount = await page.locator('button.defend-new-lamp').count()
    console.log(`checkNwDockGold sparks ${size} ${sparks} docks=${dockCount}`)
    if (dockCount !== 4) fails.push(`checkNwDockGold fail ${size} plant docks=${dockCount} want 4`)
    const seen = {}
    const sample = async (state) => {
      await page.waitForTimeout(80)
      const sampled = await readNwDockGold(page)
      const frames = sampled.frames
      assert.ok(sampled.ms >= NW_DOCK_GOLD_MS, `${label} ${state} sampled ${sampled.ms}ms`)
      assert.ok(frames.length >= 20, `${label} ${state} sampled ${frames.length} frames`)
      const counts = [...new Set(frames.map((frame) => frame.gold))]
      const names = [...new Set(frames.flatMap((frame) => frame.names))]
      const bad = frames.filter((frame) => frame.gold !== 1)
      const line = bad.length
        ? `checkNwDockGold fail ${size} ${state} frames=${frames.length} gold=${counts.join('|')} names=${names.join(' | ') || '(none)'}`
        : `checkNwDockGold ok ${size} ${state} frames=${frames.length} gold=1 names=${names.join(' | ') || '(none)'}`
      console.log(line)
      if (bad.length) fails.push(line)
      const rects = frames[0]?.rects || {}
      seen[state] = rects
      let move = 0
      for (const frame of frames) {
        const splitNow = nwDockSplit(frame.rects)
        const splitWas = nwDockSplit(rects)
        for (const group of ['begin', 'rail']) {
          const delta = nwDockRectDelta(splitNow[group], splitWas[group])
          if (delta == null) continue
          move = Math.max(move, delta)
        }
        move = Math.max(move, nwDockGroupDelta(splitNow.docks, splitWas.docks).worst, nwDockGroupDelta(splitNow.card, splitWas.card).worst)
      }
      if (move !== 0) tapFails.push(`${size} ${state} frame delta ${move}`)
      const wantHit = state === 'card'
        ? Object.keys(rects).filter((key) => !key.startsWith('dock-') && key !== 'rail' && key !== 'begin')
        : ['begin', 'dock-candle', 'dock-bell', 'dock-incense', 'dock-cross']
      const hitBad = new Set()
      for (const frame of frames) {
        for (const miss of frame.hits) {
          const key = miss.split(' ')[0]
          if (wantHit.includes(key) || (state !== 'card' && key.startsWith('rail-'))) hitBad.add(miss)
        }
      }
      if (hitBad.size) tapFails.push(`${size} ${state} ${[...hitBad].join(' | ')}`)
      console.log(`checkNwDockGold pin ${size} ${state} ${JSON.stringify(nwDockSplit(rects))}`)
      if (state === 'card') {
        const logged = new Set()
        let clipped = 0
        for (const frame of frames) {
          for (const row of frame.lines) {
            const note = `${row.name}|${row.overflow}|${row.scroll}|${row.client}|${row.scrollH}|${row.clientH}|${row.rendered}|${row.source}`
            if (!logged.has(note)) {
              logged.add(note)
              console.log(
                `checkNwDockGold line ${size} ${state} ${row.name} overflow=${row.overflow} scroll=${row.scroll} client=${row.client} scrollH=${row.scrollH} clientH=${row.clientH} rendered=${JSON.stringify(row.rendered)} source=${JSON.stringify(row.source)}`,
              )
            }
            if (row.scroll > row.client + 1 || row.scrollH > row.clientH + 1) clipped += 1
          }
        }
        if (logged.size === 0) clips.push(`checkNwDockGold clip ${size} card had no text lines`)
        if (clipped !== 0) clips.push(`checkNwDockGold clip ${size} clipped=${clipped}`)
        else if (logged.size) console.log(`checkNwDockGold clip ${size} clipped=0`)
      }
    }
    await sample('plant')
    await page.locator('button.defend-candle-lamp').click()
    await page.locator('button.defend-candle-lamp[aria-pressed="true"]').waitFor()
    await sample('selected')
    await page.locator('button.defend-candle-lamp[aria-pressed="true"]').click()
    await page.waitForFunction(() => !document.querySelector('button.defend-candle-lamp[aria-pressed="true"]'))
    await page.locator('.nw-rail .defend-ability[data-type="love"]').click()
    const seat = await nwDockSeat(page, `${label} plant`)
    await page.mouse.click(seat.x, seat.y)
    await page.locator('.defend-pad[data-tower-type="love"]').waitFor()
    if (await page.locator('.defend-tower-card').count()) {
      await page.keyboard.press('Escape')
      await page.locator('.defend-tower-card').waitFor({ state: 'detached' })
    }
    await sample('planted')
    await page.locator('.defend-pad[data-tower-type="love"]').click({ force: true })
    await page.locator('.defend-tower-card').waitFor()
    await sample('card')
    const base = NW_DOCK_GOLD_BASE[size]
    const worst = { begin: 0, rail: 0, dock: 0, card: 0 }
    for (const [state, rects] of Object.entries(seen)) {
      const split = nwDockSplit(rects)
      const pinned = base?.[state]
      if (!pinned) continue
      const begin = nwDockRectDelta(split.begin, pinned.begin)
      const rail = nwDockRectDelta(split.rail, pinned.rail)
      const dock = nwDockGroupDelta(split.docks, pinned.docks)
      const card = nwDockGroupDelta(split.card, pinned.card)
      if (begin == null || rail == null || dock.missing || card.missing) {
        tapFails.push(`${size} ${state} missing a pinned rect`)
      }
      worst.begin = Math.max(worst.begin, begin || 0)
      worst.rail = Math.max(worst.rail, rail || 0)
      worst.dock = Math.max(worst.dock, dock.worst)
      worst.card = Math.max(worst.card, card.worst)
    }
    const fmt = (n) => (n === 0 ? '0' : nwDockRound(n).toFixed(1))
    console.log(`checkNwDockGold delta ${size} begin=${fmt(worst.begin)} rail=${fmt(worst.rail)} dock=${fmt(worst.dock)} card=${fmt(worst.card)}`)
    if (base && (worst.begin !== 0 || worst.rail !== 0 || worst.dock !== 0 || worst.card !== 0)) {
      tapFails.push(`checkNwDockGold delta ${size} begin=${fmt(worst.begin)} rail=${fmt(worst.rail)} dock=${fmt(worst.dock)} card=${fmt(worst.card)}`)
    }
    await context.close()
  }
  const problems = [...fails, ...clips, ...tapFails]
  assert.equal(problems.length, 0, problems.join('\n'))
}

/** #949. Easy, camera on. Science sits on 464,768 and Love on 464,360. */
const TYPE_LABEL_SEARCH = '?playtest=1&nwSeed=2&nwMap=a2&nwRound=18&nwLamps=0&nwCam=1'
const TYPE_LABEL_SIZES = [
  [375, 667],
  [390, 844],
  [412, 915],
  [768, 1024],
]
const TYPE_LABEL_SEATS = [
  { type: 'love', cx: 464, cy: 360 },
  { type: 'logic', cx: 600, cy: 88 },
  { type: 'reason', cx: 464, cy: 224 },
  { type: 'science', cx: 464, cy: 768 },
]
/** Tap rects measured on this Easy night. Begin at 390 matches the 1.4.582 dock pin. */
const TYPE_LABEL_PINS = {
  '375x667': {
    planted: { begin: { x: 67.5, y: 602.6, w: 240, h: 56.4 }, continue: null, rail: { 'rail-love': { x: 316, y: 104, w: 48, h: 48 }, 'rail-logic': { x: 316, y: 156, w: 48, h: 48 }, 'rail-reason': { x: 316, y: 208, w: 48, h: 48 }, 'rail-science': { x: 316, y: 260, w: 48, h: 48 } }, docks: { 'dock-candle': { x: 6, y: 177, w: 52, h: 53.1 }, 'dock-bell': { x: 6, y: 235, w: 52, h: 53.1 }, 'dock-incense': { x: 6, y: 293, w: 52, h: 53.1 }, 'dock-cross': { x: 6, y: 351, w: 52, h: 53.1 } }, card: {} },
    card: { begin: { x: 67.5, y: 602.6, w: 240, h: 56.4 }, continue: null, rail: { 'rail-love': { x: 316, y: 104, w: 48, h: 48 }, 'rail-logic': { x: 316, y: 156, w: 48, h: 48 }, 'rail-reason': { x: 316, y: 208, w: 48, h: 48 }, 'rail-science': { x: 316, y: 260, w: 48, h: 48 } }, docks: { 'dock-candle': { x: 6, y: 177, w: 52, h: 53.1 }, 'dock-bell': { x: 6, y: 235, w: 52, h: 53.1 }, 'dock-incense': { x: 6, y: 293, w: 52, h: 53.1 }, 'dock-cross': { x: 6, y: 351, w: 52, h: 53.1 } }, card: { pull: { x: 216, y: 397.3, w: 32, h: 32 }, 'pip-far': { x: 88, y: 431.7, w: 18, h: 16 }, 'buy-far': { x: 168, y: 406.9, w: 46, h: 44 }, 'pip-strong': { x: 88, y: 476.7, w: 18, h: 16 }, 'buy-strong': { x: 168, y: 451.9, w: 46, h: 44 } } },
    r5: { begin: null, continue: { x: 125, y: 603, w: 125, h: 56 }, rail: { 'rail-love': { x: 316, y: 104, w: 48, h: 48 }, 'rail-logic': { x: 316, y: 156, w: 48, h: 48 }, 'rail-reason': { x: 316, y: 208, w: 48, h: 48 }, 'rail-science': { x: 316, y: 260, w: 48, h: 48 } }, docks: { 'dock-new': { x: 6, y: 321.9, w: 52, h: 53.1 }, 'dock-candle': { x: 6, y: 377.9, w: 52, h: 53.1 } }, card: {} },
    r1: { begin: null, continue: { x: 125, y: 603, w: 125, h: 56 }, rail: { 'rail-love': { x: 316, y: 104, w: 48, h: 48 }, 'rail-logic': { x: 316, y: 156, w: 48, h: 48 }, 'rail-reason': { x: 316, y: 208, w: 48, h: 48 }, 'rail-science': { x: 316, y: 260, w: 48, h: 48 } }, docks: { 'dock-new': { x: 6, y: 321.9, w: 52, h: 53.1 } }, card: {} },
  },
  '390x844': {
    planted: { begin: { x: 75, y: 779.6, w: 240, h: 56.4 }, continue: null, rail: { 'rail-love': { x: 331, y: 104, w: 48, h: 48 }, 'rail-logic': { x: 331, y: 156, w: 48, h: 48 }, 'rail-reason': { x: 331, y: 208, w: 48, h: 48 }, 'rail-science': { x: 331, y: 260, w: 48, h: 48 } }, docks: { 'dock-candle': { x: 6, y: 177, w: 52, h: 53.1 }, 'dock-bell': { x: 6, y: 235, w: 52, h: 53.1 }, 'dock-incense': { x: 6, y: 293, w: 52, h: 53.1 }, 'dock-cross': { x: 6, y: 351, w: 52, h: 53.1 } }, card: {} },
    card: { begin: { x: 75, y: 779.6, w: 240, h: 56.4 }, continue: null, rail: { 'rail-love': { x: 331, y: 104, w: 48, h: 48 }, 'rail-logic': { x: 331, y: 156, w: 48, h: 48 }, 'rail-reason': { x: 331, y: 208, w: 48, h: 48 }, 'rail-science': { x: 331, y: 260, w: 48, h: 48 } }, docks: { 'dock-candle': { x: 6, y: 177, w: 52, h: 53.1 }, 'dock-bell': { x: 6, y: 235, w: 52, h: 53.1 }, 'dock-incense': { x: 6, y: 293, w: 52, h: 53.1 }, 'dock-cross': { x: 6, y: 351, w: 52, h: 53.1 } }, card: { pull: { x: 233.3, y: 273, w: 32, h: 32 }, 'pip-far': { x: 105.3, y: 307.4, w: 18, h: 16 }, 'buy-far': { x: 185.3, y: 282.6, w: 46, h: 44 }, 'pip-strong': { x: 105.3, y: 352.4, w: 18, h: 16 }, 'buy-strong': { x: 185.3, y: 327.6, w: 46, h: 44 } } },
    r5: { begin: null, continue: { x: 132.5, y: 780, w: 125, h: 56 }, rail: { 'rail-love': { x: 331, y: 104, w: 48, h: 48 }, 'rail-logic': { x: 331, y: 156, w: 48, h: 48 }, 'rail-reason': { x: 331, y: 208, w: 48, h: 48 }, 'rail-science': { x: 331, y: 260, w: 48, h: 48 } }, docks: { 'dock-new': { x: 6, y: 498.9, w: 52, h: 53.1 }, 'dock-candle': { x: 6, y: 554.9, w: 52, h: 53.1 } }, card: {} },
    r1: { begin: null, continue: { x: 132.5, y: 780, w: 125, h: 56 }, rail: { 'rail-love': { x: 331, y: 104, w: 48, h: 48 }, 'rail-logic': { x: 331, y: 156, w: 48, h: 48 }, 'rail-reason': { x: 331, y: 208, w: 48, h: 48 }, 'rail-science': { x: 331, y: 260, w: 48, h: 48 } }, docks: { 'dock-new': { x: 6, y: 498.9, w: 52, h: 53.1 } }, card: {} },
  },
  '412x915': {
    planted: { begin: { x: 86, y: 850.6, w: 240, h: 56.4 }, continue: null, rail: { 'rail-love': { x: 353, y: 104, w: 48, h: 48 }, 'rail-logic': { x: 353, y: 156, w: 48, h: 48 }, 'rail-reason': { x: 353, y: 208, w: 48, h: 48 }, 'rail-science': { x: 353, y: 260, w: 48, h: 48 } }, docks: { 'dock-candle': { x: 6, y: 177, w: 52, h: 53.1 }, 'dock-bell': { x: 6, y: 235, w: 52, h: 53.1 }, 'dock-incense': { x: 6, y: 293, w: 52, h: 53.1 }, 'dock-cross': { x: 6, y: 351, w: 52, h: 53.1 } }, card: {} },
    card: { begin: { x: 86, y: 850.6, w: 240, h: 56.4 }, continue: null, rail: { 'rail-love': { x: 353, y: 104, w: 48, h: 48 }, 'rail-logic': { x: 353, y: 156, w: 48, h: 48 }, 'rail-reason': { x: 353, y: 208, w: 48, h: 48 }, 'rail-science': { x: 353, y: 260, w: 48, h: 48 } }, docks: { 'dock-candle': { x: 6, y: 177, w: 52, h: 53.1 }, 'dock-bell': { x: 6, y: 235, w: 52, h: 53.1 }, 'dock-incense': { x: 6, y: 293, w: 52, h: 53.1 }, 'dock-cross': { x: 6, y: 351, w: 52, h: 53.1 } }, card: { pull: { x: 226, y: 350.2, w: 32, h: 32 }, 'pip-far': { x: 98, y: 384.5, w: 18, h: 16 }, 'buy-far': { x: 178, y: 359.8, w: 46, h: 44 }, 'pip-strong': { x: 98, y: 429.5, w: 18, h: 16 }, 'buy-strong': { x: 178, y: 404.8, w: 46, h: 44 } } },
    r5: { begin: null, continue: { x: 143.5, y: 851, w: 125, h: 56 }, rail: { 'rail-love': { x: 353, y: 104, w: 48, h: 48 }, 'rail-logic': { x: 353, y: 156, w: 48, h: 48 }, 'rail-reason': { x: 353, y: 208, w: 48, h: 48 }, 'rail-science': { x: 353, y: 260, w: 48, h: 48 } }, docks: { 'dock-new': { x: 6, y: 569.9, w: 52, h: 53.1 }, 'dock-candle': { x: 6, y: 625.9, w: 52, h: 53.1 } }, card: {} },
    r1: { begin: null, continue: { x: 143.5, y: 851, w: 125, h: 56 }, rail: { 'rail-love': { x: 353, y: 104, w: 48, h: 48 }, 'rail-logic': { x: 353, y: 156, w: 48, h: 48 }, 'rail-reason': { x: 353, y: 208, w: 48, h: 48 }, 'rail-science': { x: 353, y: 260, w: 48, h: 48 } }, docks: { 'dock-new': { x: 6, y: 569.9, w: 52, h: 53.1 } }, card: {} },
  },
  '768x1024': {
    planted: { begin: { x: 77.8, y: 709, w: 162, h: 56 }, continue: null, rail: { 'rail-love': { x: 682, y: 121, w: 60, h: 69.3 }, 'rail-logic': { x: 682, y: 196.3, w: 60, h: 69.3 }, 'rail-reason': { x: 682, y: 271.6, w: 60, h: 69.3 }, 'rail-science': { x: 682, y: 346.9, w: 60, h: 69.3 } }, docks: { 'dock-candle': { x: 77.8, y: 770, w: 162, h: 52 }, 'dock-bell': { x: 77.8, y: 826, w: 162, h: 52 }, 'dock-incense': { x: 77.8, y: 882, w: 162, h: 52 }, 'dock-cross': { x: 77.8, y: 938, w: 162, h: 52 } }, card: {} },
    card: { begin: { x: 77.8, y: 709.5, w: 162, h: 56 }, continue: null, rail: { 'rail-love': { x: 682, y: 121, w: 60, h: 69.3 }, 'rail-logic': { x: 682, y: 196.3, w: 60, h: 69.3 }, 'rail-reason': { x: 682, y: 271.6, w: 60, h: 69.3 }, 'rail-science': { x: 682, y: 346.9, w: 60, h: 69.3 } }, docks: { 'dock-candle': { x: 77.8, y: 770, w: 162, h: 52 }, 'dock-bell': { x: 77.8, y: 826, w: 162, h: 52 }, 'dock-incense': { x: 77.8, y: 882, w: 162, h: 52 }, 'dock-cross': { x: 77.8, y: 938, w: 162, h: 52 } }, card: { pull: { x: 373.5, y: 305, w: 32, h: 32 }, 'pip-far': { x: 247.5, y: 354.8, w: 20, h: 20 }, 'buy-far': { x: 247.5, y: 380.8, w: 148, h: 52 }, 'pip-strong': { x: 247.5, y: 466.8, w: 20, h: 20 }, 'buy-strong': { x: 247.5, y: 492.8, w: 148, h: 52 } } },
    r5: { begin: null, continue: { x: 86.8, y: 937, w: 70, h: 40 }, rail: { 'rail-love': { x: 682, y: 121, w: 60, h: 69.3 }, 'rail-logic': { x: 682, y: 196.3, w: 60, h: 69.3 }, 'rail-reason': { x: 682, y: 271.6, w: 60, h: 69.3 }, 'rail-science': { x: 682, y: 346.9, w: 60, h: 69.3 } }, docks: { 'dock-new': { x: 160.8, y: 937, w: 95.5, h: 40 }, 'dock-candle': { x: 260.3, y: 937, w: 79.5, h: 40 } }, card: {} },
    r1: { begin: null, continue: { x: 86.8, y: 937, w: 70, h: 40 }, rail: { 'rail-love': { x: 682, y: 121, w: 60, h: 69.3 }, 'rail-logic': { x: 682, y: 196.3, w: 60, h: 69.3 }, 'rail-reason': { x: 682, y: 271.6, w: 60, h: 69.3 }, 'rail-science': { x: 682, y: 346.9, w: 60, h: 69.3 } }, docks: { 'dock-new': { x: 160.8, y: 937, w: 95.5, h: 40 } }, card: {} },
  },
}

function typeLabelRound(n) {
  return Math.round(n * 10) / 10
}

function typeLabelBoxDelta(now, was) {
  if (!now || !was) return null
  let worst = 0
  for (const key of ['x', 'y', 'w', 'h']) worst = Math.max(worst, Math.abs(typeLabelRound(now[key] - was[key])))
  return worst
}

function typeLabelSearch(round) {
  return TYPE_LABEL_SEARCH.replace('nwRound=18', `nwRound=${round}`)
}

async function sampleTypeLabelChrome(page) {
  return page.evaluate(async () => {
    const round = (n) => Math.round(n * 10) / 10
    const shown = (el) => {
      if (!el) return false
      const style = getComputedStyle(el)
      if (style.display === 'none' || style.visibility === 'hidden' || Number(style.opacity) === 0) return false
      const box = el.getBoundingClientRect()
      return box.width > 1 && box.height > 1
    }
    const boxOf = (el) => {
      const rect = el.getBoundingClientRect()
      return {
        left: rect.left,
        top: rect.top,
        right: rect.right,
        bottom: rect.bottom,
        x: round(rect.x),
        y: round(rect.y),
        w: round(rect.width),
        h: round(rect.height),
      }
    }
    const paintOf = (el) => {
      const rect = el.getBoundingClientRect()
      let left = rect.left
      let right = rect.right
      let top = rect.top
      let bottom = rect.bottom
      const range = document.createRange()
      for (const child of el.childNodes) {
        if (child.nodeType !== 3 || !(child.textContent || '').trim()) continue
        range.selectNodeContents(child)
        for (const bit of range.getClientRects()) {
          if (bit.width <= 0 || bit.height <= 0) continue
          left = Math.min(left, bit.left)
          right = Math.max(right, bit.right)
          top = Math.min(top, bit.top)
          bottom = Math.max(bottom, bit.bottom)
        }
      }
      const extraW = Math.max(0, el.scrollWidth - Math.max(el.clientWidth, right - left))
      const extraH = Math.max(0, el.scrollHeight - Math.max(el.clientHeight, bottom - top))
      left -= extraW / 2
      right += extraW / 2
      top -= extraH / 2
      bottom += extraH / 2
      return { left, top, right, bottom, x: round(left), y: round(top), w: round(right - left), h: round(bottom - top) }
    }
    const area = (a, b) => {
      const w = Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left))
      const h = Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top))
      return w * h
    }
    const union = (sel) => [...document.querySelectorAll(sel)].filter(shown).map(boxOf)
    const nameOf = (el) => `${el.tagName}.${el.getAttribute('class') || ''}`.replace(/\s+/g, ' ').trim().slice(0, 80)
    const norm = (value) => String(value || '').replace(/\s+/g, ' ').trim()
    const lineOf = (el) => {
      if (!shown(el)) return null
      const directs = [...el.childNodes].filter((child) => child.nodeType === 3 && child.textContent && child.textContent.trim())
      const style = getComputedStyle(el)
      const rect = el.getBoundingClientRect()
      const source = norm(directs.length ? directs.map((child) => child.textContent).join('') : el.textContent)
      const range = document.createRange()
      let rendered = ''
      const host = { left: rect.left - 1, right: rect.right + 1, top: rect.top - 1, bottom: rect.bottom + 1 }
      const nodes = directs.length ? directs : []
      for (const child of nodes) {
        const raw = child.textContent || ''
        for (let i = 0; i < raw.length; i += 1) {
          const ch = raw[i]
          if (!ch.trim()) {
            rendered += ch
            continue
          }
          range.setStart(child, i)
          range.setEnd(child, i + 1)
          let painted = false
          for (const bit of range.getClientRects()) {
            if (bit.width <= 0 || bit.height <= 0) continue
            if (bit.right > host.left && bit.left < host.right && bit.bottom > host.top && bit.top < host.bottom) {
              painted = true
              break
            }
          }
          if (painted) rendered += ch
        }
      }
      if (!nodes.length) rendered = source
      return {
        name: nameOf(el),
        source,
        rendered: norm(rendered),
        overflow: style.overflow,
        overflowX: style.overflowX,
        overflowY: style.overflowY,
        scroll: el.scrollWidth,
        client: el.clientWidth,
        scrollH: el.scrollHeight,
        clientH: el.clientHeight,
      }
    }
    const tapKey = (el) => {
      if (el.classList.contains('defend-go')) return 'begin'
      if (el.classList.contains('defend-continue')) return 'continue'
      if (el.classList.contains('defend-candle-lamp')) return 'dock-candle'
      if (el.classList.contains('defend-bell-lamp')) return 'dock-bell'
      if (el.classList.contains('defend-incense-lamp')) return 'dock-incense'
      if (el.classList.contains('defend-cross-lamp')) return 'dock-cross'
      if (el.classList.contains('defend-new-lamp')) return 'dock-new'
      const buy = el.getAttribute('data-path-buy')
      if (buy) return `buy-${buy}`
      const pip = el.getAttribute('data-path-pip')
      if (pip) return `pip-${pip}`
      if (el.classList.contains('defend-tower-pull')) return 'pull'
      if (el.classList.contains('defend-bright-buy')) return 'bright'
      if (el.classList.contains('defend-lesson-open')) return 'lesson'
      return ''
    }
    const read = () => {
      const labels = [...document.querySelectorAll('text.defend-type-label')].filter(shown).map((el) => ({
        text: norm(el.textContent),
        box: paintOf(el),
      }))
      const regions = {
        begin: union('.defend-go'),
        continue: union('.defend-continue'),
        rail: union('.nw-rail'),
        clearRow: union('.defend-clear-row button:not(.defend-continue), button.defend-new-lamp'),
        hud: union('.nw-hud, .nw-wave-overlay .defend-wave'),
      }
      const sum = (key) => Math.round(labels.reduce((total, label) => total + regions[key].reduce((hit, box) => hit + area(label.box, box), 0), 0))
      const rects = {}
      const hits = []
      const take = (key, el) => {
        if (!key || !el || !shown(el) || rects[key]) return
        const rect = boxOf(el)
        rects[key] = { x: rect.x, y: rect.y, w: rect.w, h: rect.h }
        const cx = rect.left + (rect.right - rect.left) / 2
        const cy = rect.top + (rect.bottom - rect.top) / 2
        if (cx <= 1 || cy <= 1 || cx >= innerWidth - 1 || cy >= innerHeight - 1) {
          hits.push(`${key} offscreen`)
          return
        }
        const node = document.elementFromPoint(cx, cy)
        const hit = node === el || Boolean(node && el.contains(node))
        if (!hit) hits.push(`${key} -> ${node ? nameOf(node) : 'none'}`)
      }
      for (const el of document.querySelectorAll('.nw-rail .defend-ability')) take(`rail-${el.getAttribute('data-type') || 'x'}`, el)
      for (const el of document.querySelectorAll('button, a.btn, [role="button"]')) {
        if (!(el instanceof HTMLElement)) continue
        if (el.closest('.defend-nw-debug, [hidden]')) continue
        take(tapKey(el), el)
      }
      const lines = [...document.querySelectorAll('text.defend-type-label')].map(lineOf).filter(Boolean)
      const pan = document.querySelector('.nw-pan')?.style?.transform || ''
      return {
        begin: sum('begin'),
        continue: sum('continue'),
        rail: sum('rail'),
        clearRow: sum('clearRow'),
        hud: sum('hud'),
        visibleLabels: labels.length,
        labels,
        rects,
        hits,
        lines,
        pan,
      }
    }
    const frames = []
    await new Promise((resolve) => {
      const tick = () => {
        frames.push(read())
        if (frames.length < 8) requestAnimationFrame(tick)
        else resolve()
      }
      requestAnimationFrame(tick)
    })
    return frames
  })
}

async function plantTypeLabelSeats(page, label) {
  const rings = await page.evaluate(() =>
    [...document.querySelectorAll('.defend-plant-ground circle.is-live')].map((ring) => ({
      cx: Number(ring.getAttribute('cx')),
      cy: Number(ring.getAttribute('cy')),
    })),
  )
  for (const seat of TYPE_LABEL_SEATS) {
    assert.ok(
      rings.some((ring) => ring.cx === seat.cx && ring.cy === seat.cy),
      `${label} seat ${seat.type}@${seat.cx},${seat.cy} is live ${JSON.stringify(rings)}`,
    )
    await glyphPlantAt(page, seat.type, seat, label)
  }
  assert.equal(await page.locator('.defend-pad').count(), 4, `${label} four lamps are planted`)
  if (process.env.NW_TYPE_LABEL_RECENTER === '1') {
    const recenter = page.getByRole('button', { name: 'Recenter map' })
    if (await recenter.count()) {
      await recenter.click()
      await page.waitForTimeout(250)
    }
  }
}

function typeLabelSplit(rects) {
  const docks = {}
  const card = {}
  const rail = {}
  let begin = null
  let cont = null
  for (const [key, rect] of Object.entries(rects || {})) {
    if (key === 'begin') begin = rect
    else if (key === 'continue') cont = rect
    else if (key.startsWith('rail-')) rail[key] = rect
    else if (key.startsWith('dock-')) docks[key] = rect
    else card[key] = rect
  }
  return { begin, continue: cont, rail, docks, card }
}

/**
 * #949. Easy type labels stay off Begin, Continue, the rail, the clear row and the HUD.
 * Phone and tablet. Reuses the Night Watch plant helpers and clearToBoost.
 */
async function checkNwTypeLabelChrome(browser, port, errors) {
  const only = process.env.NW_TYPE_LABEL_SIZE
  const wantStates = new Set((process.env.NW_TYPE_LABEL_STATE || 'planted,card,r5,r1').split(','))
  const problems = []
  const seenProblems = new Set()
  const fail = (line) => {
    if (seenProblems.has(line)) return
    seenProblems.add(line)
    problems.push(line)
  }
  for (const [width, height] of TYPE_LABEL_SIZES) {
    const size = `${width}x${height}`
    if (only && only !== size) continue
    const seen = {}
    const run = async (round, states) => {
      const { context, page } = await openMap(browser, port, width, height, 'a2', {
        motion: true,
        search: typeLabelSearch(round),
      })
      page.on('pageerror', (error) => errors.push(`type-label ${size} r${round} ${error}`))
      page.on('console', (msg) => {
        if (msg.type() !== 'error') return
        const text = msg.text()
        if (text.includes('Encountered two children with the same key')) return
        errors.push(`type-label ${size} r${round} ${text}`)
      })
      if (width <= 480) await assertGlyphCamera(page, `${size} r${round}`)
      await page.evaluate(() => document.fonts?.ready)
      await plantTypeLabelSeats(page, `${size} r${round}`)
      const sample = async (state) => {
        if (!wantStates.has(state)) return
        await page.waitForTimeout(80)
        const frames = await sampleTypeLabelChrome(page)
        assert.ok(frames.length >= 8, `${size} ${state} sampled ${frames.length} frames`)
        seen[state] = frames[0]?.rects || {}
        console.log(`checkNwTypeLabelChrome box ${size} ${state} pan=${JSON.stringify(frames[0]?.pan || '')} ${JSON.stringify(frames[0]?.labels || [])}`)
        let clipped = 0
        const logged = new Set()
        for (const frame of frames) {
          const line = `checkNwTypeLabelChrome ov ${size} ${state} begin=${frame.begin} continue=${frame.continue} rail=${frame.rail} clearRow=${frame.clearRow} hud=${frame.hud} visibleLabels=${frame.visibleLabels}`
          console.log(line)
          if (frame.begin !== 0 || frame.continue !== 0 || frame.rail !== 0 || frame.clearRow !== 0 || frame.hud !== 0) fail(line)
          if (frame.visibleLabels < 1) fail(`checkNwTypeLabelChrome ov ${size} ${state} visibleLabels=0`)
          for (const row of frame.lines) {
            const note = `${row.name}|${row.overflow}|${row.overflowX}|${row.overflowY}|${row.scroll}|${row.client}|${row.scrollH}|${row.clientH}|${row.rendered}|${row.source}`
            if (!logged.has(note)) {
              logged.add(note)
              console.log(
                `checkNwTypeLabelChrome line ${size} ${state} ${row.name} overflow=${row.overflow} overflowX=${row.overflowX} overflowY=${row.overflowY} scroll=${row.scroll} client=${row.client} scrollH=${row.scrollH} clientH=${row.clientH} rendered=${JSON.stringify(row.rendered)} source=${JSON.stringify(row.source)}`,
              )
            }
            if (row.scroll > row.client + 1 || row.scrollH > row.clientH + 1) clipped += 1
          }
          const wantHit = []
          if (frame.rects.begin) wantHit.push('begin')
          if (frame.rects.continue) wantHit.push('continue')
          for (const miss of frame.hits) {
            const key = miss.split(' ')[0]
            if (wantHit.includes(key)) fail(`checkNwTypeLabelChrome hit ${size} ${state} ${miss}`)
          }
        }
        if (clipped !== 0) fail(`checkNwTypeLabelChrome clip ${size} ${state} clipped=${clipped}`)
        else if (logged.size) console.log(`checkNwTypeLabelChrome clip ${size} ${state} clipped=0`)
        const centre = (key) => {
          if (!frames.some((frame) => frame.rects?.[key])) return 'absent'
          return frames.some((frame) => frame.hits.some((miss) => miss.startsWith(`${key} `))) ? 'miss' : 'button'
        }
        const beginHit = centre('begin')
        const continueHit = centre('continue')
        console.log(`checkNwTypeLabelChrome hit ${size} ${state} begin=${beginHit} continue=${continueHit}`)
        if (beginHit === 'miss' || continueHit === 'miss') fail(`checkNwTypeLabelChrome hit ${size} ${state} begin=${beginHit} continue=${continueHit}`)
        const worstOv = frames.reduce(
          (acc, frame) => ({
            begin: Math.max(acc.begin, frame.begin),
            continue: Math.max(acc.continue, frame.continue),
            rail: Math.max(acc.rail, frame.rail),
            clearRow: Math.max(acc.clearRow, frame.clearRow),
            hud: Math.max(acc.hud, frame.hud),
            visibleLabels: Math.min(acc.visibleLabels, frame.visibleLabels),
          }),
          { begin: 0, continue: 0, rail: 0, clearRow: 0, hud: 0, visibleLabels: frames[0].visibleLabels },
        )
        if (
          worstOv.begin === 0 &&
          worstOv.continue === 0 &&
          worstOv.rail === 0 &&
          worstOv.clearRow === 0 &&
          worstOv.hud === 0 &&
          worstOv.visibleLabels >= 1 &&
          clipped === 0 &&
          beginHit !== 'miss' &&
          continueHit !== 'miss'
        ) {
          console.log(
            `checkNwTypeLabelChrome ok ${size} ${state} frames=${frames.length} begin=0 continue=0 rail=0 clearRow=0 hud=0 visibleLabels=${worstOv.visibleLabels} clipped=0`,
          )
        }
        console.log(`checkNwTypeLabelChrome pin ${size} ${state} ${JSON.stringify(typeLabelSplit(frames[0]?.rects || {}))}`)
      }
      if (round === 18) {
        await sample('planted')
        if (wantStates.has('card')) {
          if (width === 375) await panOnBoard(page, -20, 240)
          await page.locator('.defend-clear-lamp[data-tower-type="love"]').click()
          await page.locator('.defend-tower-card').waitFor()
          await page.waitForTimeout(400)
          await sample('card')
        }
      } else {
        if (round === 5) await clearToBoost(page, `${size} r${round}`)
        else await clearTypeLabelRound(page, `${size} r${round}`)
        await page.locator('.defend-continue').waitFor()
        await page.waitForTimeout(300)
        await sample(round === 5 ? 'r5' : 'r1')
      }
      await context.close()
    }
    if (wantStates.has('planted') || wantStates.has('card')) await run(18, ['planted', 'card'])
    if (wantStates.has('r5')) await run(5, ['r5'])
    if (wantStates.has('r1')) await run(1, ['r1'])
    const worst = { begin: 0, continue: 0, rail: 0, dock: 0, card: 0 }
    const pin = TYPE_LABEL_PINS?.[size]
    for (const [state, rects] of Object.entries(seen)) {
      const split = typeLabelSplit(rects)
      const pinned = pin?.[state]
      if (!pinned) continue
      const lone = (key, now, was) => {
        const delta = typeLabelBoxDelta(now, was)
        if (delta == null) {
          if (!now && !was) return
          fail(`checkNwTypeLabelChrome delta ${size} ${state} missing ${key}`)
          return
        }
        worst[key] = Math.max(worst[key], delta)
      }
      lone('begin', split.begin, pinned.begin)
      lone('continue', split.continue, pinned.continue)
      for (const [key, now, was] of [
        ['rail', split.rail, pinned.rail],
        ['dock', split.docks, pinned.docks],
        ['card', split.card, pinned.card],
      ]) {
        const group = nwDockGroupDelta(now, was)
        if (group.missing) fail(`checkNwTypeLabelChrome delta ${size} ${state} missing ${key}`)
        worst[key] = Math.max(worst[key], group.worst)
      }
    }
    if (pin) {
      const fmt = (n) => typeLabelRound(n).toFixed(1)
      const line = `checkNwTypeLabelChrome delta ${size} begin=${fmt(worst.begin)} continue=${fmt(worst.continue)} rail=${fmt(worst.rail)} dock=${fmt(worst.dock)} card=${fmt(worst.card)}`
      console.log(line)
      if (worst.begin > 0.5 || worst.continue > 0.5 || worst.rail > 0.5 || worst.dock > 0.5 || worst.card > 0.5) fail(line)
    }
  }
  assert.equal(problems.length, 0, problems.join('\n'))
}

/** Easy map05 camera-off pre-plant. `nwLamps=0` paints Begin gold, so this night omits it. openMap adds nwMap. */
const MAP05_RING_SEARCH = '?playtest=1&nwSeed=2&nwCam=0'

const MAP05_RING_SIZES = [
  [375, 667],
  [390, 844],
  [412, 915],
  [768, 1024],
]

/** Tap rects on 1.4.583, camera off, before the Candle dock was added to the seat picker. */
const MAP05_RING_PINS = {
  '375x667': {
    begin: { x: 67.5, y: 602.6, w: 240, h: 56.4 },
    candle: { x: 6, y: 177, w: 52, h: 53.1 },
    rail: { x: 310, y: 98, w: 60, h: 216 },
    seats: [
      { x: 59.4, y: 183.1, w: 46.6, h: 46.6 },
      { x: 128.3, y: 527.3, w: 46.6, h: 46.6 },
      { x: 197.1, y: 527.3, w: 46.6, h: 46.6 },
    ],
  },
  '390x844': {
    begin: { x: 75, y: 779.6, w: 240, h: 56.4 },
    candle: { x: 6, y: 177, w: 52, h: 53.1 },
    rail: { x: 325, y: 98, w: 60, h: 216 },
    seats: [
      { x: 27.4, y: 210.9, w: 60.9, h: 60.9 },
      { x: 117.5, y: 661.2, w: 60.9, h: 60.9 },
      { x: 207.6, y: 661.2, w: 60.9, h: 60.9 },
    ],
  },
  '412x915': {
    begin: { x: 86, y: 850.6, w: 240, h: 56.4 },
    candle: { x: 6, y: 177, w: 52, h: 53.1 },
    rail: { x: 347, y: 98, w: 60, h: 216 },
    seats: [
      { x: 22.6, y: 222, w: 66.7, h: 66.7 },
      { x: 121.2, y: 714.9, w: 66.7, h: 66.7 },
      { x: 219.8, y: 714.9, w: 66.7, h: 66.7 },
    ],
  },
  '768x1024': {
    begin: { x: 77.8, y: 878, w: 162, h: 56 },
    candle: { x: 77.8, y: 938, w: 162, h: 52 },
    rail: { x: 674, y: 113, w: 76, h: 311.3 },
    seats: [
      { x: 186, y: 247.1, w: 72, h: 72 },
      { x: 292.5, y: 779.2, w: 72, h: 72 },
      { x: 398.9, y: 779.2, w: 72, h: 72 },
    ],
  },
}

/** Gold seat the camera-on picker used on 1.4.583 at 390. The cam-off stroke test must not move it. */
const MAP05_CAM_ON_GOLD = '328,904'

/** Camera-off gold seats. 375 and 768 were already clear on 192,224. */
const MAP05_GOLD_SEAT = {
  '375x667': '192,224',
  '390x844': '328,904',
  '412x915': '328,904',
  '768x1024': '192,224',
}

/** Camera-on map05 at 390. The picker must not move these. */
const MAP05_RING_CAM_ON = {
  begin: { x: 75, y: 779.6, w: 240, h: 56.4 },
  candle: { x: 6, y: 177, w: 52, h: 53.1 },
  rail: { x: 325, y: 98, w: 60, h: 216 },
  seats: [
    { x: -39.6, y: -42.4, w: 85.3, h: 85.3 },
    { x: 86.5, y: 588.1, w: 85.3, h: 85.3 },
    { x: 212.6, y: 588.1, w: 85.3, h: 85.3 },
  ],
}

function map05Round(n) {
  return Math.round(n * 10) / 10
}

function map05RectDelta(now, was) {
  if (!now || !was) return null
  let worst = 0
  for (const key of ['x', 'y', 'w', 'h']) worst = Math.max(worst, Math.abs(now[key] - was[key]))
  return worst
}

/**
 * #884b. Easy map05, camera off. The first-seat gold ring stays fully visible.
 * One gold cue. Begin stays grey. Candle, Begin, the rail, and the live seats do not move.
 */
async function checkMap05CamOffRing(browser, port, errors) {
  const only = process.env.NW_MAP05_RING_SIZE
  const problems = []
  const seen = new Set()
  const fail = (line) => {
    if (seen.has(line)) return
    seen.add(line)
    problems.push(line)
    console.log(line)
  }
  const sample = async (page) =>
    page.evaluate(async () => {
      const gold = (value) => {
        const re = /rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*([\d.]+))?/g
        let match
        while ((match = re.exec(value || ''))) {
          const r = Number(match[1])
          const g = Number(match[2])
          const b = Number(match[3])
          const a = match[4] === undefined ? 1 : Number(match[4])
          if (a >= 0.3 && r > 190 && g > 140 && b < 120 && r > b + 60 && g > b + 30) return true
        }
        return false
      }
      const round = (n) => Math.round(n * 10) / 10
      const box = (el) => {
        if (!el) return null
        const r = el.getBoundingClientRect()
        if (r.width < 1 && r.height < 1) return null
        return { x: round(r.x), y: round(r.y), w: round(r.width), h: round(r.height) }
      }
      const selectorOf = (el) => {
        if (!el) return 'none'
        const tag = el.tagName.toLowerCase()
        const cls = (el.getAttribute('class') || '')
          .trim()
          .split(/\s+/)
          .filter((part) => part && part !== 'btn')
          .slice(0, 4)
          .join('.')
        return cls ? `${tag}.${cls}` : tag
      }
      const lineOf = (el) => {
        if (!el) return null
        const style = getComputedStyle(el)
        const directs = [...el.childNodes].filter((child) => child.nodeType === 3 && child.textContent && child.textContent.trim())
        const source = directs.map((child) => child.textContent).join('').replace(/\s+/g, ' ').trim()
        const range = document.createRange()
        const host = el.getBoundingClientRect()
        let rendered = ''
        let left = Infinity
        let top = Infinity
        let right = -Infinity
        let bottom = -Infinity
        for (const child of directs) {
          const raw = child.textContent
          for (let i = 0; i < raw.length; i += 1) {
            const ch = raw[i]
            if (!ch.trim()) {
              rendered += ch
              continue
            }
            range.setStart(child, i)
            range.setEnd(child, i + 1)
            let painted = false
            for (const bit of range.getClientRects()) {
              if (bit.width <= 0 || bit.height <= 0) continue
              if (bit.right > host.left - 1 && bit.left < host.right + 1 && bit.bottom > host.top - 1 && bit.top < host.bottom + 1) {
                painted = true
                left = Math.min(left, bit.left)
                top = Math.min(top, bit.top)
                right = Math.max(right, bit.right)
                bottom = Math.max(bottom, bit.bottom)
                break
              }
            }
            if (painted) rendered += ch
          }
        }
        return {
          name: selectorOf(el),
          overflow: style.overflow,
          scroll: el.scrollWidth,
          client: el.clientWidth,
          scrollH: el.scrollHeight,
          clientH: el.clientHeight,
          rendered: rendered.replace(/\s+/g, ' ').trim(),
          source,
          box: left === Infinity ? null : { x: round(left), y: round(top), w: round(right - left), h: round(bottom - top) },
        }
      }
      const cssText = (value) => {
        if (!value || value === 'none' || value === 'normal') return ''
        const first = /^"((?:\\.|[^"\\])*)"/.exec(value)
        return first ? first[1].replace(/\\"/g, '"').replace(/\\\\/g, '\\') : ''
      }
      const paintBox = (text, style, host) => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        if (!ctx) return null
        const size = Number.isFinite(parseFloat(style.lineHeight)) ? `${style.fontSize}/${style.lineHeight}` : style.fontSize
        ctx.font = `${style.fontStyle} ${style.fontWeight} ${size} ${style.fontFamily}`
        const width = ctx.measureText(text).width
        const line = parseFloat(style.lineHeight)
        const height = Number.isFinite(line) && line > 0 ? line : parseFloat(style.fontSize) * 1.2
        const align = style.textAlign || 'center'
        let x = host.x
        if (align === 'center') x = host.x + (host.width - width) / 2
        else if (align === 'right' || align === 'end') x = host.right - width
        const y = host.y + (host.height - height) / 2
        return { x: round(x), y: round(y), w: round(width), h: round(height) }
      }
      const pseudoParts = (el) => {
        const host = el.getBoundingClientRect()
        const hostStyle = getComputedStyle(el)
        const parts = ['::before', '::after']
          .map((pseudo) => {
            const style = getComputedStyle(el, pseudo)
            const source = cssText(style.content).replace(/\s+/g, ' ').trim()
            if (!source) return null
            const painted =
              style.display !== 'none' &&
              style.visibility !== 'hidden' &&
              Number(style.opacity) > 0 &&
              parseFloat(style.fontSize) > 0 &&
              host.width > 1 &&
              host.height > 1
            const measured = paintBox(source, style, host)
            const cssW = parseFloat(style.width)
            const cssH = parseFloat(style.height)
            const w = Number.isFinite(cssW) && cssW > 0 ? cssW : measured?.w || 0
            const h = Number.isFinite(cssH) && cssH > 0 ? cssH : measured?.h || 0
            return { pseudo, style, source, painted, w, h, hostStyle, host }
          })
          .filter(Boolean)
        const column = hostStyle.display === 'flex' && hostStyle.flexDirection === 'column'
        const total = parts.reduce((sum, part) => sum + part.h, 0)
        let y = host.y + Math.max(0, (host.height - total) / 2)
        return parts.map((part) => {
          const x = host.x + Math.max(0, (host.width - part.w) / 2)
          const box = part.painted ? { x: round(x), y: round(column ? y : host.y + (host.height - part.h) / 2), w: round(part.w), h: round(part.h) } : null
          if (column) y += part.h
          return {
            name: `${selectorOf(el)}${part.pseudo}`,
            overflow: hostStyle.overflow,
            scroll: el.scrollWidth,
            client: el.clientWidth,
            scrollH: el.scrollHeight,
            clientH: el.clientHeight,
            rendered: part.painted ? part.source : '',
            source: part.source,
            box,
          }
        })
      }
      const linesFor = (el) => {
        if (!el) return []
        const pseudos = pseudoParts(el)
        if (pseudos.length) return pseudos
        const text = lineOf(el)
        return text ? [text] : []
      }
      const read = () => {
        const root = document.querySelector('.defend-page')
        const chrome = 'button, .defend-abilities, .defend-boost, .defend-tower-card, .defend-path-pip, .nw-balloon-orb, .defend-wave, .defend-ability-stock'
        const names = !root
          ? []
          : [...root.querySelectorAll(chrome)]
              .filter((node) => !node.closest('.defend-nw-debug'))
              .filter((node) => {
                const rect = node.getBoundingClientRect()
                const style = getComputedStyle(node)
                return rect.width > 1 && rect.height > 1 && style.display !== 'none' && style.visibility !== 'hidden' && Number(style.opacity) > 0
              })
              .filter((node) => {
                const style = getComputedStyle(node)
                const text = [...node.childNodes].some((child) => child.nodeType === 3 && child.textContent.trim())
                const border = ['Top', 'Right', 'Bottom', 'Left'].some((side) => style[`border${side}Width`] !== '0px' && gold(style[`border${side}Color`]))
                return gold(style.backgroundImage) || gold(style.backgroundColor) || border || gold(style.boxShadow) || (text && gold(style.color))
              })
              .map((node) => `${node.tagName}.${node.getAttribute('class') || ''}`.slice(0, 80))
        const ringNodes = [...document.querySelectorAll('.defend-plant-ground circle')].filter((node) => {
          const rect = node.getBoundingClientRect()
          const style = getComputedStyle(node)
          if (rect.width <= 1 || rect.height <= 1 || style.display === 'none' || style.visibility === 'hidden' || Number(style.opacity) === 0) return false
          return gold(style.stroke) || gold(style.fill) || gold(style.filter)
        })
        const go = document.querySelector('.defend-go')
        const goStyle = go ? getComputedStyle(go) : null
        const beginGold = Boolean(
          goStyle &&
            (gold(goStyle.backgroundImage) ||
              gold(goStyle.backgroundColor) ||
              gold(goStyle.color) ||
              gold(goStyle.boxShadow) ||
              ['Top', 'Right', 'Bottom', 'Left'].some((side) => goStyle[`border${side}Width`] !== '0px' && gold(goStyle[`border${side}Color`]))),
        )
        const first = document.querySelector('.defend-plant-ground circle.is-first-seat')
        const counts = {}
        let clear = 0
        let samples = 0
        if (first?.ownerSVGElement?.getScreenCTM()) {
          const svg = first.ownerSVGElement
          const ctm = svg.getScreenCTM()
          const radius = Number(first.getAttribute('r'))
          const cx = Number(first.getAttribute('cx'))
          const cy = Number(first.getAttribute('cy'))
          const point = svg.createSVGPoint()
          samples = 48
          for (let i = 0; i < 48; i += 1) {
            const angle = (i / 48) * Math.PI * 2
            point.x = cx + Math.cos(angle) * radius
            point.y = cy + Math.sin(angle) * radius
            const at = point.matrixTransform(ctm)
            if (at.x < 0 || at.y < 0 || at.x > innerWidth || at.y > innerHeight) {
              counts.offscreen = (counts.offscreen || 0) + 1
              continue
            }
            const top = document.elementFromPoint(at.x, at.y)
            const cover = top?.closest?.('button, .nw-rail, .nw-docks, .defend-hud, .defend-go')
            if (cover && !cover.closest('.defend-board')) counts[selectorOf(cover)] = (counts[selectorOf(cover)] || 0) + 1
            else if (top?.closest?.('.defend-board') || top === first) clear += 1
            else counts[selectorOf(top)] = (counts[selectorOf(top)] || 0) + 1
          }
        }
        const hitOf = (el) => {
          if (!el) return { hit: 'missing', on: 0, own: 0 }
          const rect = el.getBoundingClientRect()
          const cx = rect.x + rect.width / 2
          const cy = rect.y + rect.height / 2
          const on = cx > 1 && cy > 1 && cx < innerWidth - 1 && cy < innerHeight - 1 ? 1 : 0
          const node = on ? document.elementFromPoint(cx, cy) : null
          const own = node === el || Boolean(node && el.contains(node)) ? 1 : 0
          return { hit: node ? selectorOf(node) : 'offscreen', on, own }
        }
        const plateOf = (clientX, clientY) => {
          const svg = document.querySelector('.defend-board')
          const ctm = svg?.getScreenCTM()
          if (!svg || !ctm) return null
          const point = svg.createSVGPoint()
          point.x = clientX
          point.y = clientY
          const local = point.matrixTransform(ctm.inverse())
          return { x: local.x, y: local.y }
        }
        const nearestSeat = (clientX, clientY) => {
          const at = plateOf(clientX, clientY)
          if (!at) return ''
          let best = ''
          let bestD = 46
          for (const ring of document.querySelectorAll('.defend-plant-ground circle.is-live')) {
            const away = Math.hypot(at.x - Number(ring.getAttribute('cx')), at.y - Number(ring.getAttribute('cy')))
            if (away > bestD) continue
            bestD = away
            best = `${ring.getAttribute('cx')},${ring.getAttribute('cy')}`
          }
          return best
        }
        const seats = [...document.querySelectorAll('.defend-plant-ground circle.is-live')]
        const candle = document.querySelector('button.defend-candle-lamp')
        const railButtons = [...document.querySelectorAll('.nw-rail button.defend-ability')].filter((el) => {
          const rect = el.getBoundingClientRect()
          const style = getComputedStyle(el)
          return rect.width > 1 && rect.height > 1 && style.display !== 'none' && style.visibility !== 'hidden' && Number(style.opacity) > 0
        })
        const filed = [...document.querySelectorAll('.defend-plant-ground circle')].find(
          (node) => node.getAttribute('cx') === '192' && node.getAttribute('cy') === '224',
        )
        const filedBox = filed ? filed.getBoundingClientRect() : null
        const candleBox = candle ? candle.getBoundingClientRect() : null
        const pad = 4
        const padOverlap = Boolean(
          filedBox &&
            candleBox &&
            filedBox.left - pad < candleBox.right &&
            filedBox.right + pad > candleBox.left &&
            filedBox.top - pad < candleBox.bottom &&
            filedBox.bottom + pad > candleBox.top,
        )
        let strokeCovered = 0
        let strokeSelector = ''
        if (filed?.ownerSVGElement?.getScreenCTM()) {
          const svg = filed.ownerSVGElement
          const ctm = svg.getScreenCTM()
          const point = svg.createSVGPoint()
          const radius = Number(filed.getAttribute('r'))
          const strokeCounts = {}
          for (let i = 0; i < 48; i += 1) {
            const angle = (i / 48) * Math.PI * 2
            point.x = 192 + Math.cos(angle) * radius
            point.y = 224 + Math.sin(angle) * radius
            const at = point.matrixTransform(ctm)
            if (at.x < 0 || at.y < 0 || at.x > innerWidth || at.y > innerHeight) continue
            const top = document.elementFromPoint(at.x, at.y)
            const cover = top?.closest?.('button, .nw-rail, .nw-docks, .defend-hud, .defend-go')
            if (cover && !cover.closest('.defend-board')) {
              strokeCovered += 1
              const name = selectorOf(cover)
              strokeCounts[name] = (strokeCounts[name] || 0) + 1
            }
          }
          const ranked = Object.entries(strokeCounts).sort((a, b) => b[1] - a[1])
          strokeSelector = ranked[0]?.[0] || ''
        }
        const cueNames = ringNodes.length ? [...names, 'circle.is-first-seat'] : names
        return {
          names: cueNames,
          gold: names.length + ringNodes.length,
          beginGold: beginGold ? 1 : 0,
          awaiting: go?.classList.contains('is-awaiting-plant') ? 1 : 0,
          text: (go?.textContent || '').replace(/\s+/g, ' ').trim(),
          cam: document.querySelector('[data-nw-cam]')?.getAttribute('data-nw-cam') || '',
          map: root?.getAttribute('data-night-map') || '',
          arrow: document.querySelectorAll('.nw-seat-arrow').length,
          seat: first ? `${first.getAttribute('cx')},${first.getAttribute('cy')}` : '',
          clear,
          samples,
          counts,
          begin: box(go),
          candle: box(candle),
          rail: box(document.querySelector('.nw-rail')),
          seats: seats.map(box),
          hits: {
            begin: hitOf(go),
            candle: hitOf(candle),
            railCount: document.querySelectorAll('.nw-rail').length,
            railButtons: railButtons.map((el) => {
              const hit = hitOf(el)
              return { type: el.getAttribute('data-type') || '', hit: hit.hit, own: hit.own, on: hit.on }
            }),
            seats: seats.map((el) => {
              const hit = hitOf(el)
              const rect = el.getBoundingClientRect()
              const mapped = hit.on ? nearestSeat(rect.x + rect.width / 2, rect.y + rect.height / 2) : ''
              return { hit: hit.hit, on: hit.on, at: `${el.getAttribute('cx')},${el.getAttribute('cy')}`, mapped }
            }),
          },
          lines: [...linesFor(go), ...linesFor(candle)],
          ringLine: lineOf(first),
          cover: {
            ring: filedBox ? box(filed) : null,
            candle: candleBox ? box(candle) : null,
            padOverlap: padOverlap ? 1 : 0,
            strokeCovered,
            strokeSelector,
          },
        }
      }
      const frames = []
      const start = performance.now()
      await new Promise((resolve) => {
        const tick = () => {
          frames.push(read())
          if (performance.now() - start < 1500) requestAnimationFrame(tick)
          else resolve()
        }
        requestAnimationFrame(tick)
      })
      return { frames, ms: Math.round(performance.now() - start) }
    })

  const run = async (width, height, camOn) => {
    const size = `${width}x${height}`
    const label = camOn ? `${size} cam-on` : size
    if (only && only !== size && only !== label) return
    const search = camOn ? '?playtest=1&nwSeed=2&nwCam=1' : MAP05_RING_SEARCH
    const { context, page } = await openMap(browser, port, width, height, 'map05', { search })
    page.on('pageerror', (error) => errors.push(`map05-ring ${label} ${error}`))
    page.on('console', (msg) => {
      if (msg.type() !== 'error') return
      const text = msg.text()
      if (text.includes('Encountered two children with the same key')) return
      errors.push(`map05-ring ${label} ${text}`)
    })
    await page.locator('.defend-go.is-awaiting-plant').waitFor()
    await page.locator('.defend-plant-ground circle.is-first-seat').waitFor()
    const sampled = await sample(page)
    const frames = sampled.frames
    const last = frames.at(-1)
    assert.ok(last, `${label} sampled no frames`)
    assert.ok(sampled.ms >= 1500, `${label} sampled ${sampled.ms}ms, want at least 1500`)
    assert.ok(frames.length >= 30, `${label} sampled ${frames.length} frames`)
    const pin = camOn ? MAP05_RING_CAM_ON : MAP05_RING_PINS[size]
    const before = problems.length
    const worst = { begin: 0, candle: 0, rail: 0, seat: 0 }
    let clipped = 0
    const goldCounts = [...new Set(frames.map((frame) => frame.gold))]
    const nameSet = [...new Set(frames.flatMap((frame) => frame.names))]
    let coverSelector = ''
    let coverCount = 0
    let worstShare = 1
    for (const frame of frames) {
      assert.equal(frame.map, 'map05', `${label} stays on map05`)
      assert.equal(frame.cam, camOn ? 'on' : 'off', `${label} camera`)
      assert.equal(frame.awaiting, 1, `${label} Begin stays is-awaiting-plant`)
      assert.equal(frame.text, 'Begin the watch', `${label} Begin copy`)
      assert.equal(frame.arrow, 0, `${label} has no .nw-seat-arrow`)
      assert.equal(frame.seats.length, pin.seats.length, `${label} live seat count`)
      const beginDelta = map05RectDelta(frame.begin, pin.begin)
      const candleDelta = map05RectDelta(frame.candle, pin.candle)
      const railDelta = map05RectDelta(frame.rail, pin.rail)
      const seatDelta = frame.seats.reduce((acc, now, index) => {
        const delta = map05RectDelta(now, pin.seats[index])
        return delta == null ? acc : Math.max(acc, delta)
      }, 0)
      if (beginDelta == null || candleDelta == null || railDelta == null) fail(`checkMap05CamOffRing delta ${label} missing a tap rect`)
      worst.begin = Math.max(worst.begin, beginDelta || 0)
      worst.candle = Math.max(worst.candle, candleDelta || 0)
      worst.rail = Math.max(worst.rail, railDelta || 0)
      worst.seat = Math.max(worst.seat, seatDelta)
      const share = frame.samples ? frame.clear / frame.samples : 0
      worstShare = Math.min(worstShare, share)
      const covered = Object.entries(frame.counts)
      if (covered.length) {
        covered.sort((a, b) => b[1] - a[1])
        coverSelector = covered[0][0]
        coverCount = Math.max(coverCount, covered[0][1])
      }
      for (const row of [frame.ringLine, ...frame.lines]) {
        if (!row) continue
        if (row.scroll > row.client + 1 || row.scrollH > row.clientH + 1) clipped += 1
      }
      const own = (hit, token) => hit.on === 1 && hit.own === 1 && hit.hit.includes(token)
      const railMiss = frame.hits.railButtons.filter((hit) => hit.on !== 1 || hit.own !== 1)
      const seatMiss = frame.hits.seats.filter(
        (hit) => hit.on === 1 && (!hit.hit.includes('defend-board') || hit.mapped !== hit.at),
      )
      if (!own(frame.hits.begin, 'defend-go') || !own(frame.hits.candle, 'defend-candle-lamp') || railMiss.length || seatMiss.length) {
        const railText = frame.hits.railButtons.length
          ? frame.hits.railButtons.map((hit) => `${hit.type}:${hit.hit}`).join(',')
          : `absent buttons=0 rails=${frame.hits.railCount}`
        fail(
          `checkMap05CamOffRing hit ${label} begin=${frame.hits.begin.hit} candle=${frame.hits.candle.hit} rail=${railText} seats=${frame.hits.seats.map((hit) => (hit.on ? `${hit.hit}→${hit.mapped}` : 'offscreen')).join(',')}`,
        )
      }
    }
    const fmt = (n) => map05Round(n).toFixed(1)
    const deltaLine = `checkMap05CamOffRing delta ${label} begin=${fmt(worst.begin)} candle=${fmt(worst.candle)} rail=${fmt(worst.rail)} seat=${fmt(worst.seat)}`
    console.log(deltaLine)
    if (worst.begin > 0.5 || worst.candle > 0.5 || worst.rail > 0.5 || worst.seat > 0.5) fail(deltaLine)
    const logged = new Set()
    if (!last.lines.length) fail(`checkMap05CamOffRing line ${label} rendered="" source=""`)
    for (const row of last.lines) {
      if (!row || logged.has(row.name)) continue
      logged.add(row.name)
      const boxText = row.box ? `${row.box.x},${row.box.y},${row.box.w},${row.box.h}` : 'none'
      console.log(
        `checkMap05CamOffRing line ${label} ${row.name} overflow=${row.overflow} scroll=${row.scroll} client=${row.client} scrollH=${row.scrollH} clientH=${row.clientH} rendered=${JSON.stringify(row.rendered)} source=${JSON.stringify(row.source)} box=${boxText}`,
      )
      if (!row.rendered || row.rendered !== row.source) {
        fail(
          `checkMap05CamOffRing line ${label} ${row.name} rendered=${JSON.stringify(row.rendered)} source=${JSON.stringify(row.source)}`,
        )
      }
    }
    const cover = last.cover
    const ringText = cover.ring ? `${cover.ring.x},${cover.ring.y},${cover.ring.w},${cover.ring.h}` : 'none'
    const candleText = cover.candle ? `${cover.candle.x},${cover.candle.y},${cover.candle.w},${cover.candle.h}` : 'none'
    console.log(
      `checkMap05CamOffRing cover ${label} filed=192,224 ring=${ringText} candle=${candleText} padOverlap=${cover.padOverlap} strokeCovered=${cover.strokeCovered} selector=${cover.strokeSelector || 'none'}`,
    )
    if (clipped !== 0) fail(`checkMap05CamOffRing clip ${label} clipped=${clipped}`)
    else console.log(`checkMap05CamOffRing clip ${label} clipped=0`)
    const railText = last.hits.railButtons.length
      ? last.hits.railButtons.map((hit) => `${hit.type}:button.defend-ability`).join(',')
      : `absent buttons=0 rails=${last.hits.railCount}`
    const seatText = last.hits.seats.map((hit) => (hit.on ? `board→${hit.mapped}` : 'offscreen')).join(',')
    const hitLine = `checkMap05CamOffRing hit ${label} begin=${last.hits.begin.hit} candle=${last.hits.candle.hit} rail=${railText} seats=${seatText}`
    console.log(hitLine)
    const wantSeat = camOn ? MAP05_CAM_ON_GOLD : MAP05_GOLD_SEAT[size]
    if (wantSeat && last.seat !== wantSeat) fail(`checkMap05CamOffRing seat ${label} gold=${last.seat} want=${wantSeat}`)
    if (camOn) console.log(`checkMap05CamOffRing pin ${label} liveSeat=${MAP05_CAM_ON_GOLD}`)
    const nameLabel = nameSet.join(' | ') || '(none)'
    const badGold = frames.filter((frame) => frame.gold !== 1 || frame.beginGold !== 0)
    const covered = worstShare < 1 || coverSelector
    const localFail = problems.length > before
    if (badGold.length || covered) {
      const shareText = worstShare.toFixed(3)
      fail(
        `checkMap05CamOffRing fail ${label} frames=${frames.length} gold=${goldCounts.join('|')} names=${nameLabel} strokeShare=${shareText} covered=${coverCount} selector=${coverSelector || 'none'}`,
      )
    } else if (!localFail) {
      console.log(`checkMap05CamOffRing ok ${label} frames=${frames.length} gold=1 names=${nameLabel} seat=${last.seat}`)
    }
    await context.close()
  }

  for (const [width, height] of MAP05_RING_SIZES) await run(width, height, false)
  if (!only || only === '390x844' || only === '390x844 cam-on') await run(390, 844, true)
  assert.equal(problems.length, 0, problems.join('\n'))
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
    if (process.env.NR905_ONLY === '1') {
      await checkNightRun905(browser, port, errors)
      return
    }
    if (process.env.NW_LEAK_ONLY === '1') {
      await checkLeakBanner(browser, port, errors)
      assert.equal(errors.join('\n'), '', '1.4.565 leak banner nights stay free of console errors')
      return
    }
    if (process.env.NW_COMPACT_ONLY === '1') {
      await checkCompactLampCard(browser, port, errors)
      assert.equal(errors.join('\n'), '', '1.4.574 compact lamp card nights stay free of console errors')
      return
    }
    if (process.env.GEM_HINT_ONLY === '1') {
      await checkGemHintSlot(browser, port, errors)
      assert.equal(errors.join('\n'), '', 'hint slot nights stay free of console errors')
      return
    }
    if (process.env.NW_TABLET_BEGIN_ONLY === '1') {
      await checkTabletBeginGold(browser, port, errors)
      assert.equal(errors.join('\n'), '', '1.4.577 tablet Begin nights stay free of console errors')
      return
    }
    if (process.env.NW_OFFTOP_ONLY === '1') {
      await checkLampGlyph(browser, port, errors)
      assert.equal(errors.join('\n'), '', '1.4.578 off-top glyph nights stay free of console errors')
      return
    }
    if (process.env.EASY_ONE_GOLD_ONLY === '1') {
      await checkEasyOneGold(browser, port, errors)
      assert.equal(errors.join('\n'), '', 'easy one-gold screens stay free of console errors')
      return
    }
    if (process.env.NW_DOCK_GOLD_ONLY === '1') {
      await checkNwDockGold(browser, port, errors)
      assert.equal(errors.join('\n'), '', 'dock gold nights stay free of console errors')
      return
    }
    if (process.env.NW_TYPE_LABEL_ONLY === '1') {
      await checkNwTypeLabelChrome(browser, port, errors)
      assert.equal(errors.join('\n'), '', 'type label nights stay free of console errors')
      return
    }
    if (process.env.NW_MAP05_RING_ONLY === '1') {
      await checkMap05CamOffRing(browser, port, errors)
      assert.equal(errors.join('\n'), '', 'map05 camera-off ring nights stay free of console errors')
      return
    }
    if (process.env.NW_GLYPH_ONLY === '1' || process.env.NW_LABEL_ONLY === '1') {
      await checkLampGlyph(browser, port, errors)
      assert.equal(errors.join('\n'), '', '1.4.566 glyph nights stay free of console errors')
      return
    }
    await checkEasyOneGold(browser, port, errors)
    await checkGemHintSlot(browser, port, errors)
    await checkTabletBeginGold(browser, port, errors)
    await checkNightRun905(browser, port, errors)
    await checkLampGlyph(browser, port, errors)
    await checkCompactLampCard(browser, port, errors)
    await checkNwDockGold(browser, port, errors)
    await checkNwTypeLabelChrome(browser, port, errors)
    await checkMap05CamOffRing(browser, port, errors)
    if (process.env.NW_MAP_NOTE_ONLY !== '1') {
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
        assert.equal(text.startsWith('Beat round 8 on ') && text.endsWith(' to unlock'), true, `1.4.478 ${width} lock line ${text}`)
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
      await assertHeavenClear(
        page,
        `plant at ${width}x${height}`,
        height === 915 || height === 667 || height === 844 || (width === 768 && height === 1024)
          ? `nw-heaven-clear-${width}`
          : '',
      )
      await assertSparksStack(page, `plant at ${width}x${height}`)
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
      await assertHeavenClear(page, `wave at ${width}x${height}`)
      await assertReadoutClear(page, `wave at ${width}x${height}`)
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
      await assertHeavenClear(page, `round clear at ${width}x${height}`)
      await assertReadoutClear(page, `round clear at ${width}x${height}`)
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
    await check792bPlant(browser, port, errors)
    await check792bPlantCard(browser, port, errors)
    await check768CamOffEasyDragGuard(browser, port, errors)
    await check768WalkerTapProbe(browser, port, errors)
    await check868Map04HudWalkerTap(browser, port, errors)
    await check868HudStrip(browser, port, errors)
    await check792bWave(browser, port, errors)
    await check792bSurvived(browser, port, errors, 375, 667)
    await check792bSurvived(browser, port, errors, 390, 844)
    }
    await checkMapNote(browser, port, errors)
    await checkLeakBanner(browser, port, errors)
    assert.equal(errors.join('\n'), '', '1.4.478 phone nights stay free of console errors')
  } finally {
    await browser.close()
    await server.close()
  }
  console.log('check-phone-fixes: ok')
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  await checkPhoneFixes()
  const scoped = ['NW_LEAK_ONLY', 'NW_GLYPH_ONLY', 'NW_MAP_NOTE_ONLY', 'NW_LABEL_ONLY', 'NW_COMPACT_ONLY', 'GEM_HINT_ONLY', 'NW_TABLET_BEGIN_ONLY', 'NW_OFFTOP_ONLY', 'NW_DOCK_GOLD_ONLY', 'EASY_ONE_GOLD_ONLY', 'NW_TYPE_LABEL_ONLY', 'NW_MAP05_RING_ONLY'].some((name) => process.env[name] === '1')
  if (!scoped) {
    // 1.4.567 (#843): the City scans job runs this file, so the Lock In check rides along. A miss fails the job.
    await import('./check-lockin-843.mjs')
    console.log('check-lockin-843 ok')
  }
}
