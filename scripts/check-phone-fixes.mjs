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

/** #868 map04 390×844 cam on: a walker panned under the HUD band must stay tappable (not eaten by the strip/chip). */
async function check868Map04HudWalkerTap(browser, port, errors) {
  const width = 390
  const height = 844
  const label = `map04 ${width}x${height} cam=on`
  const { context, page } = await openMap(browser, port, width, height, 'map04', {
    motion: true,
    search: '?playtest=1&nwSeed=2&nwRound=5&nwLamps=0&nwCam=1',
  })
  page.on('pageerror', (error) => errors.push(`${label} ${error}`))
  if (await page.locator('#defend-plant-first').count()) {
    await page.locator('[data-type="love"]').click()
    const seat = await firstLiveSeat(page)
    await page.mouse.click(seat.x, seat.y)
    await page.locator('[data-tower-type]').first().waitFor({ timeout: 30_000 })
  }
  await page.locator('.defend-go').click()
  await page.locator('.defend-page.is-easy-tap').waitFor({ timeout: 120_000 })
  await waitForFirstWalkerVisible(page)
  await page.locator('.defend-walker-tap').first().waitFor({ timeout: 60_000 })
  if (await page.locator('.nw-cam-recenter').count()) {
    const rc = await page.locator('.nw-cam-recenter').boundingBox()
    if (rc) await page.mouse.click(rc.x + rc.width / 2, rc.y + rc.height / 2)
    await page.waitForTimeout(150)
  }

  const probeX = 332
  const probeY = 73
  let target = null
  const panPattern = [
    [0, 160],
    [0, 140],
    [0, 120],
    [-80, 120],
    [80, 120],
    [0, 200],
    [0, -80],
  ]
  for (let attempt = 0; attempt < 96 && !target; attempt += 1) {
    target = await page.evaluate(({ x, y, yMin, yMax }) => {
      const hitWalker = (px, py) => {
        const stack = document.elementsFromPoint(px, py)
        return stack.some((node) => node.closest?.('.defend-walker-tap'))
      }
      if (hitWalker(x, y)) {
        return { x, y, onWalker: true, via: 'probe' }
      }
      for (const btn of document.querySelectorAll('.defend-walker-tap')) {
        const b = btn.getBoundingClientRect()
        if (b.width < 8 || b.height < 8) continue
        const cx = (b.left + b.right) / 2
        const cy = (b.top + b.bottom) / 2
        if (cy < yMin || cy > yMax) continue
        if (hitWalker(cx, cy)) return { x: cx, y: cy, onWalker: true, via: 'band' }
      }
      return null
    }, { x: probeX, y: probeY, yMin: 53, yMax: 89 })
    if (target?.onWalker) break
    target = null
    const [dx, dy] = panPattern[attempt % panPattern.length]
    await panBoard(page, dx, dy)
    await page.waitForTimeout(150)
  }
  if (!target?.onWalker) {
    target = await page.evaluate(({ yMin, yMax }) => {
      for (const btn of document.querySelectorAll('.defend-walker-tap')) {
        const b = btn.getBoundingClientRect()
        if (b.width < 8 || b.height < 8) continue
        const cx = (b.left + b.right) / 2
        const cy = (b.top + b.bottom) / 2
        if (cy < yMin || cy > yMax) continue
        const stack = document.elementsFromPoint(cx, cy)
        if (stack.some((node) => node.closest?.('.defend-walker-tap'))) return { x: cx, y: cy, onWalker: true, via: 'final-band' }
      }
      return null
    }, { yMin: 53, yMax: 89 })
  }
  assert.ok(target?.onWalker, `#868 ${label} walker under HUD (y 53–89 / probe ${probeX},${probeY}) stays tappable ${JSON.stringify(target)}`)

  const before = await page.evaluate(() => {
    const el = document.querySelector('.nw-tap-readout')
    return el ? el.textContent?.trim() ?? '' : ''
  })
  await page.mouse.click(target.x, target.y)
  await page.waitForTimeout(250)
  const after = await page.evaluate(() => {
    const el = document.querySelector('.nw-tap-readout')
    return el ? el.textContent?.trim() ?? '' : ''
  })
  assert.notEqual(after, before, `#868 ${label} tap under HUD registers on the walker (${before} -> ${after})`)
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
    await check768WalkerTapProbe(browser, port, errors)
    await check868Map04HudWalkerTap(browser, port, errors)
    await check868HudStrip(browser, port, errors)
    await check792bWave(browser, port, errors)
    await check792bSurvived(browser, port, errors, 375, 667)
    await check792bSurvived(browser, port, errors, 390, 844)
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
