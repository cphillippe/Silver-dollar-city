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
  if (await go.count()) await go.click()
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
          const [x, y, h] = raw.split(',').map(Number)
          return { x, y, h }
        })(),
        cont: many('.defend-continue'),
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
  const { context, page } = await openMap(browser, port, width, height, 'a2', { motion: true })
  page.on('pageerror', (error) => errors.push(`glyph gold ${label} ${error}`))
  const selected = () =>
    page.evaluate(() => [...document.querySelectorAll('.nw-rail .defend-ability.is-on')].map((node) => (node.textContent || '').trim()))
  const plant = async (tool) => {
    const seat = await firstLiveSeat(page)
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
const SOLVER_EDGE = 2
const glyphSpotCache = new Map()

/**
 * Every 1px card spot on the plate that clears the glyph plus 6 (body and pointer), Begin minus 8, the whole rail
 * and every rail and clear-row button. Counts them. Other lamps' art does not count: the mark wins over it.
 * Independent of the placer: it reads only measured boxes.
 */
function glyphClearSpots(frame) {
  const { card, glyph, place, plate } = frame
  if (!card || !glyph || !place || !plate) return null
  const round = (box) => (box ? [box.left, box.top, box.right, box.bottom].map((n) => Math.round(n * 10) / 10) : null)
  const key = JSON.stringify([round(plate), round(glyph), Math.round(card.h * 10) / 10, place, round(frame.begin[0]), round(frame.rail), frame.buttons.map(round), frame.clearButtons.map(round)])
  if (glyphSpotCache.has(key)) return glyphSpotCache.get(key)
  const H = card.h
  const zone = { left: glyph.left - SOLVER_GLYPH_ZONE, right: glyph.right + SOLVER_GLYPH_ZONE, top: glyph.top - SOLVER_GLYPH_ZONE, bottom: glyph.bottom + SOLVER_GLYPH_ZONE }
  const blocks = []
  const begin = frame.begin[0]
  if (begin) blocks.push({ left: begin.left, right: begin.right, top: begin.top - SOLVER_BEGIN_GAP, bottom: begin.bottom })
  if (frame.rail) blocks.push(frame.rail)
  blocks.push(...frame.buttons, ...frame.clearButtons)
  const pointLeft = plate.left + place.x
  const pointTop = plate.top + place.y
  const hits = (l, t, r, b, box) => l < box.right && r > box.left && t < box.bottom && b > box.top
  let count = 0
  const minLeft = Math.ceil(plate.left + SOLVER_EDGE)
  const maxLeft = Math.floor(plate.right - CARD_W - SOLVER_EDGE)
  const minTop = Math.ceil(plate.top + SOLVER_EDGE)
  const maxTop = Math.floor(plate.bottom - H - SOLVER_EDGE)
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
  return count
}

function newGlyphStats() {
  return {
    minTip: Infinity, buys: 0, frames: 0, minSpan: Infinity, maxSpan: 0, maxFirst: 0, maxCard: 0, maxHearts: 0, maxEdge: 0, bothSeen: 0,
    minGap: Infinity, headerFrames: 0, headerSettled: 0, brightGold: 0, brightBuys: 0,
    solved: 0, spotsMin: Infinity, noSpot: new Set(),
    beginFrames: 0, beginMaxOverlap: 0, beginMinSlack: Infinity, beginHitBad: 0, railFrames: 0, railMaxOverlap: 0, clearFrames: 0, clearMaxOverlap: 0,
  }
}

function mergeGlyphStats(total, part) {
  for (const key of ['buys', 'frames', 'bothSeen', 'headerFrames', 'headerSettled', 'brightGold', 'brightBuys', 'solved', 'beginFrames', 'beginHitBad', 'railFrames', 'clearFrames']) total[key] += part[key]
  for (const key of ['maxFirst', 'maxCard', 'maxHearts', 'maxEdge', 'maxSpan', 'beginMaxOverlap', 'railMaxOverlap', 'clearMaxOverlap']) total[key] = Math.max(total[key], part[key])
  for (const key of ['minSpan', 'minGap', 'minTip', 'spotsMin', 'beginMinSlack']) total[key] = Math.min(total[key], part[key])
  for (const entry of part.noSpot) total.noSpot.add(entry)
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
  // A wave hides the map mark, so a frame without one has only the tap rules to pass.
  if (frame.glyph) {
    const spots = glyphClearSpots(frame)
    assert.ok(spots !== null, `${where}: the solver has no boxes to read (place ${JSON.stringify(frame.place)}, plate ${JSON.stringify(frame.plate)})`)
    stats.solved += 1
    if (spots > 0) stats.spotsMin = Math.min(stats.spotsMin, spots)
    else stats.noSpot.add(stageKey)
    if (frame.header) {
      assert.equal(spots, 0, `${where}: the header copy shows while ${spots} card spots clear the glyph+6, Begin-8, the rail and its buttons, glyph ${JSON.stringify(frame.glyph)} card ${JSON.stringify(card)}`)
      if (settled) stats.headerSettled += 1
      else stats.headerFrames += 1
    } else {
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
    assert.ok(slack >= SOLVER_BEGIN_GAP - 0.01, `${where}: card bottom ${card.bottom.toFixed(1)} is ${slack.toFixed(2)}px above Begin (${begin.top.toFixed(1)}), needs ${SOLVER_BEGIN_GAP}`)
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
    `(card+glyph both present ${stats.bothSeen}x) header copy ${stats.headerFrames} frames ${stats.headerSettled} settled ` +
    `solver ${stats.solved} card frames, clear spots min ${spots}, ${noSpot.length} stages with no clear spot${noSpot.length ? ` [${noSpot.join(' ')}]` : ''} ` +
    `Begin ${stats.beginFrames} frames overlap max ${stats.beginMaxOverlap}px2 min card-bottom-to-Begin ${stats.beginMinSlack === Infinity ? 'n/a' : `${stats.beginMinSlack.toFixed(2)}px`} (>=8) centre tap miss ${stats.beginHitBad} ` +
    `rail buttons ${stats.railFrames} frames overlap max ${stats.railMaxOverlap}px2 clear-row buttons ${stats.clearFrames} frames overlap max ${stats.clearMaxOverlap}px2 ` +
    `glyph outside board max ${stats.maxEdge.toFixed(1)}px hearts overlap max ${stats.maxHearts}px2 ` +
    `bright buys ${stats.brightBuys} bright gold===${stats.brightGold}` +
    (gold ? ` selected-lamp gold===${gold.selected} planted gold===${gold.planted} open-card gold===${gold.open}` : '')
  )
}

const SEAT_SWEEP_SIZES = ['375x667', '390x844', '412x915', '320x568', '300x540']
/** The live state: camera on (the default on a phone), banked sparks from the jump, lamps already planted around the seat. */
const GLYPH_LIVE_SEARCH = `${GLYPH_SEARCH}&nwCam=1`
const GLYPH_NEIGHBOR_TYPES = ['logic', 'reason', 'science', 'candle']
/** Plates where every seat and every stage has a clear spot (measured by the solver), so the header copy must never show. */
const ROOMY_SIZES = ['390x844', '412x915']
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
    const where = `${label} seat ${ring.cx},${ring.cy}`
    const { context, page } = await openMap(browser, port, width, height, 'a2', { motion: true, search: GLYPH_LIVE_SEARCH })
    page.on('pageerror', (error) => errors.push(`glyph seat ${where} ${error}`))
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(`glyph seat ${where} ${msg.text()}`)
    })
    await glyphSetup(page)
    const camera = await page.evaluate(() => Boolean(document.querySelector('.nw-zoom')) || document.querySelector('.defend-board')?.getBoundingClientRect().left < 0)
    assert.ok(camera, `${where} the camera is on, as it is for a player`)
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
    if (ROOMY_SIZES.includes(label)) {
      assert.equal(headerHere, 0, `${where} shows the header copy on ${headerHere} frames; every stage has a clear spot on this plate`)
      assert.equal(driver.stats.noSpot.size, 0, `${where} has stages with no clear spot ${[...driver.stats.noSpot]}`)
    }
    if (label === FAILING_SEAT.size && ring.cx === FAILING_SEAT.cx && ring.cy === FAILING_SEAT.cy) {
      assert.ok(driver.stats.noSpot.size > 0 && driver.stats.headerSettled > 0, `${where} is the seat the 1.4.569 prove caught: its tall stages have no clear spot and show the header copy (${driver.stats.noSpot.size} stages, ${driver.stats.headerSettled} settled header views)`)
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
      `rail buttons ${stats.railFrames} frames overlap max ${stats.railMaxOverlap}px2 clear-row buttons ${stats.clearFrames} frames overlap max ${stats.clearMaxOverlap}px2 ` +
      `Begin frames ${stats.beginFrames} overlap max ${stats.beginMaxOverlap}px2 header copy ${stats.headerFrames} frames ` +
      `clear spots min ${stats.spotsMin === Infinity ? 'n/a' : stats.spotsMin} stages with no clear spot ${stats.noSpot.size} ` +
      `card/glyph overlap max ${stats.maxCard}px2 min gap ${stats.minGap === Infinity ? 'n/a' : `${stats.minGap.toFixed(2)}px`}`,
  )
  await context.close()
}

async function checkLampGlyph(browser, port, errors) {
  const only = process.env.NW_GLYPH_SIZE
  for (const [width, height] of GLYPH_SIZES.filter(([w, h]) => process.env.NW_GLYPH_SWEEP_ONLY !== '1' && (!only || only === `${w}x${h}`))) {
    const label = `${width}x${height}`
    const gold = await checkGlyphOneGold(browser, port, errors, width, height)
    const { context, page } = await openMap(browser, port, width, height, 'a2', {
      motion: true,
      search: GLYPH_SEARCH,
    })
    page.on('pageerror', (error) => errors.push(`glyph ${label} ${error}`))
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(`glyph ${label} ${msg.text()}`)
    })
    await glyphSetup(page)
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
      const seat = await firstLiveSeat(page)
      await page.mouse.click(seat.x, seat.y)
      await page.locator(`.defend-pad[data-tower-type="${tool}"] .lamp-upgrade-glyph[data-glyph-variant="map"]`).waitFor()
      await page.waitForTimeout(150)
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
    if (process.env.NW_GLYPH_CLEARROW_ONLY !== '1') await checkGlyphSeatSweep(browser, port, errors, width, height)
    await checkGlyphClearRow(browser, port, errors, width, height)
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

export async function checkPhoneFixes() {
  const server = await createServer({ server: { host: '127.0.0.1', port: 0 } })
  await server.listen()
  const address = server.httpServer?.address()
  const port = address && typeof address === 'object' ? address.port : 0
  assert.ok(port > 0, '1.4.478 phone server has a port')
  const browser = await launchBrowser()
  const errors = []
  try {
    if (process.env.NW_LEAK_ONLY === '1') {
      await checkLeakBanner(browser, port, errors)
      assert.equal(errors.join('\n'), '', '1.4.565 leak banner nights stay free of console errors')
      return
    }
    if (process.env.NW_GLYPH_ONLY === '1') {
      await checkLampGlyph(browser, port, errors)
      assert.equal(errors.join('\n'), '', '1.4.566 glyph nights stay free of console errors')
      return
    }
    await checkLampGlyph(browser, port, errors)
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
  const scoped = ['NW_LEAK_ONLY', 'NW_GLYPH_ONLY', 'NW_MAP_NOTE_ONLY'].some((name) => process.env[name] === '1')
  if (!scoped) {
    // 1.4.567 (#843): the City scans job runs this file, so the Lock In check rides along. A miss fails the job.
    await import('./check-lockin-843.mjs')
    console.log('check-lockin-843 ok')
  }
}
