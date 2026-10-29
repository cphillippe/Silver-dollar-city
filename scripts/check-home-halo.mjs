/**
 * Easy Home map: ground ring, porch fit, 13px labels, Build this, one gold.
 * Shots stay in the OS temp directory.
 */
import assert from 'node:assert/strict'
import { mkdirSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { inflateSync } from 'node:zlib'
import { fileURLToPath } from 'node:url'
import { chromium } from '@playwright/test'
import { createServer } from 'vite'
import { APP_VERSION, SAVE_SCHEMA_VERSION, STORAGE_KEY } from '../src/config/app.ts'
import { localDateKey } from '../src/lib/dates.ts'
import { emptyCityBuilt } from '../src/lib/cityBuild.ts'
import { SAVE_KIND } from '../src/lib/save.ts'

const SIZES = [
  [375, 667],
  [390, 844],
]
const SHOTS = join(tmpdir(), 'easy-home-halo')
const HOLLOW = ['ph-road', 'ph-father', 'ph-seeds', 'ph-debt']
const BENCH_TWO = ['wb-creed', 'wb-early']

function save(progress) {
  return {
    kind: SAVE_KIND,
    schemaVersion: SAVE_SCHEMA_VERSION,
    appVersion: APP_VERSION,
    savedAt: '2026-10-28T17:30:00.000Z',
    progress: {
      started: true,
      easyMode: true,
      theme: 'candy',
      completed: [],
      held: [],
      journal: [],
      stars: {},
      dailyDates: [],
      cityBuilt: emptyCityBuilt(),
      ...progress,
    },
  }
}

function builtBench() {
  const today = localDateKey()
  return save({
    lastDailyDate: today,
    dailyDates: ['2020-01-01', '2020-01-02', today],
    completed: [...HOLLOW, ...BENCH_TWO],
    cityBuilt: { ...emptyCityBuilt(), porch: 4, hollow: 4, bench: 2 },
  })
}

/** One past morning opens Home. Porch and the creek already show the look they earned. */
function opened(extra = {}) {
  return save({
    lastDailyDate: '2020-01-01',
    dailyDates: ['2020-01-01'],
    cityBuilt: { ...emptyCityBuilt(), porch: 2, hollow: 1 },
    ...extra,
  })
}

function starMap(total) {
  const stars = {}
  let left = total
  let n = 0
  while (left > 0) {
    const give = Math.min(3, left)
    stars[`s${n}`] = give
    left -= give
    n += 1
  }
  return stars
}

function lampsSave(stars) {
  return opened({
    stars: starMap(stars),
    cityBuilt: { ...emptyCityBuilt(), porch: 2, hollow: 1, lamps: 0 },
  })
}

async function launchBrowser() {
  try {
    return await chromium.launch({ headless: true })
  } catch {
    return await chromium.launch({ headless: true, channel: 'chrome' })
  }
}

function decodePng(buf) {
  let offset = 8
  let width = 0
  let height = 0
  let colorType = 6
  const parts = []
  while (offset < buf.length) {
    const len = buf.readUInt32BE(offset)
    const type = buf.toString('ascii', offset + 4, offset + 8)
    const data = buf.subarray(offset + 8, offset + 8 + len)
    if (type === 'IHDR') {
      width = data.readUInt32BE(0)
      height = data.readUInt32BE(4)
      colorType = data[9]
    } else if (type === 'IDAT') parts.push(data)
    else if (type === 'IEND') break
    offset += 12 + len
  }
  const channels = colorType === 6 ? 4 : colorType === 2 ? 3 : 0
  if (!channels || width < 1) throw new Error('png')
  const raw = inflateSync(Buffer.concat(parts))
  const stride = width * channels
  const out = Buffer.alloc(width * height * 4)
  let src = 0
  const prior = Buffer.alloc(stride)
  const row = Buffer.alloc(stride)
  const paeth = (a, b, c) => {
    const p = a + b - c
    const pa = Math.abs(p - a)
    const pb = Math.abs(p - b)
    const pc = Math.abs(p - c)
    if (pa <= pb && pa <= pc) return a
    if (pb <= pc) return b
    return c
  }
  for (let y = 0; y < height; y += 1) {
    const filter = raw[src]
    src += 1
    for (let i = 0; i < stride; i += 1) {
      const left = i >= channels ? row[i - channels] : 0
      const up = prior[i]
      const ul = i >= channels ? prior[i - channels] : 0
      const x = raw[src + i]
      let v = x
      if (filter === 1) v = (x + left) & 255
      else if (filter === 2) v = (x + up) & 255
      else if (filter === 3) v = (x + ((left + up) >> 1)) & 255
      else if (filter === 4) v = (x + paeth(left, up, ul)) & 255
      else if (filter !== 0) throw new Error(`filter ${filter}`)
      row[i] = v
    }
    src += stride
    row.copy(prior)
    const dest = y * width * 4
    if (channels === 4) row.copy(out, dest)
    else {
      for (let x = 0; x < width; x += 1) {
        out[dest + x * 4] = row[x * 3]
        out[dest + x * 4 + 1] = row[x * 3 + 1]
        out[dest + x * 4 + 2] = row[x * 3 + 2]
        out[dest + x * 4 + 3] = 255
      }
    }
  }
  return { width, height, data: out }
}

function changedPixels(a, b) {
  assert.equal(a.width, b.width)
  assert.equal(a.height, b.height)
  let n = 0
  for (let i = 0; i < a.data.length; i += 4) {
    if (
      a.data[i] !== b.data[i] ||
      a.data[i + 1] !== b.data[i + 1] ||
      a.data[i + 2] !== b.data[i + 2]
    ) n += 1
  }
  return n
}

async function openHome(browser, origin, payload, [width, height]) {
  const context = await browser.newContext({
    viewport: { width, height },
    deviceScaleFactor: 2,
    reducedMotion: 'reduce',
    hasTouch: true,
    isMobile: true,
  })
  await context.addInitScript(
    ([key, raw]) => {
      localStorage.clear()
      localStorage.setItem(key, raw)
    },
    [STORAGE_KEY, JSON.stringify(payload)],
  )
  const page = await context.newPage()
  const errors = []
  page.on('pageerror', (error) => errors.push(String(error)))
  await page.goto(origin)
  await page.locator('main.hub.is-easy-home').waitFor()
  await page.locator('.city-pan-viewport').waitFor()
  await page.locator('.city-next-halo').waitFor()
  await page.waitForTimeout(250)
  return { context, page, errors }
}

async function haloBox(page) {
  return page.evaluate(() => {
    const el = document.querySelector('.city-next-halo')
    const vp = document.querySelector('.city-pan-viewport').getBoundingClientRect()
    const r = el.getBoundingClientRect()
    const x = Math.max(vp.left, Math.floor(r.left))
    const y = Math.max(vp.top, Math.floor(r.top))
    const right = Math.min(vp.right, Math.ceil(r.right))
    const bottom = Math.min(vp.bottom, Math.ceil(r.bottom))
    return { x, y, width: Math.max(1, right - x), height: Math.max(1, bottom - y) }
  })
}

async function shotDiff(page, clip) {
  const before = decodePng(await page.screenshot({ clip }))
  await page.evaluate(() => {
    const el = document.querySelector('.city-next-halo')
    el.dataset.was = el.style.display
    el.style.display = 'none'
  })
  const after = decodePng(await page.screenshot({ clip }))
  await page.evaluate(() => {
    const el = document.querySelector('.city-next-halo')
    el.style.display = el.dataset.was || ''
  })
  return changedPixels(before, after)
}

function readHome() {
  const shown = (el) => {
    if (!el) return false
    const style = getComputedStyle(el)
    const box = el.getBoundingClientRect()
    return style.display !== 'none' && style.visibility !== 'hidden' && Number(style.opacity) > 0 && box.width > 0 && box.height > 0
  }
  const texts = []
  const root = document.querySelector('main.hub')
  const walk = (el) => {
    const style = getComputedStyle(el)
    if (style.display === 'none' || style.visibility === 'hidden' || Number(style.opacity) === 0) return
    const box = el.getBoundingClientRect()
    if (box.width < 1 || box.height < 1) return
    if (box.bottom < 0 || box.top > innerHeight || box.right < 0 || box.left > innerWidth) return
    const text = [...el.childNodes].filter((node) => node.nodeType === 3).map((node) => node.textContent.trim()).join(' ')
    if (text) {
      let px = parseFloat(style.fontSize)
      if (el instanceof SVGElement) {
        const ctm = el.getScreenCTM()
        if (ctm) px *= Math.hypot(ctm.a, ctm.b)
      }
      texts.push({ text: text.slice(0, 48), px: Math.round(px * 10) / 10 })
    }
    for (const child of el.children) walk(child)
  }
  if (root) walk(root)
  const bar = document.querySelector('.topbar')
  if (bar) walk(bar)
  const halo = document.querySelector('.city-next-halo')
  const mark = halo?.closest('g.city-next-mark')
  const porch = document.querySelector('g.city-plot[data-plot="porch"]')
  const porchImg = porch?.querySelector('.city-plot-img')?.getBoundingClientRect()
  const porchHit = porch?.querySelector('.city-plot-hit')?.getBoundingClientRect()
  const chip = [...document.querySelectorAll('.city-easy-chip')].find((el) => /East\s*porch/i.test(el.textContent || ''))
  const chipBox = chip?.getBoundingClientRect()
  const vp = document.querySelector('.city-pan-viewport')?.getBoundingClientRect()
  const dock = document.querySelector('.easy-home-dock')?.getBoundingClientRect()
  const haloBox = halo?.getBoundingClientRect()
  let face = null
  if (haloBox) {
    const hx = haloBox.x + haloBox.width / 2
    const hy = haloBox.y + haloBox.height / 2
    let best = 1e9
    for (const el of document.querySelectorAll('.city-portrait-img.is-resident')) {
      const r = el.getBoundingClientRect()
      if (r.width < 2) continue
      const dx = r.x + r.width / 2 - hx
      const dy = r.y + r.height / 2 - hy
      const d = dx * dx + dy * dy
      if (d < best) {
        best = d
        face = r
      }
    }
  }
  const ready = [...document.querySelectorAll('g.city-plot.is-ready')].map((el) => el.getAttribute('data-plot'))
  const goldButtons = [...document.querySelectorAll('button, a.btn')].filter((el) => {
    if (!(el instanceof HTMLElement) || el.closest('.easy-core') || el.closest('[hidden]')) return false
    if (!shown(el)) return false
    const primary = el.classList.contains('primary')
    const coach = el.classList.contains('easy-coach-step') && Boolean(el.closest('li.is-now'))
    return primary || coach
  }).map((el) => (el.innerText || '').replace(/\s+/g, ' ').trim())
  const mapGold = []
  if (shown(halo)) mapGold.push(halo.tagName.toLowerCase())
  for (const el of document.querySelectorAll('.city-plot.is-ready .city-plot-hit')) {
    const style = getComputedStyle(el)
    if (style.display !== 'none' && style.stroke !== 'none' && parseFloat(style.strokeWidth) > 0) mapGold.push('ready')
  }
  for (const el of document.querySelectorAll('.city-plot-select')) {
    if (getComputedStyle(el).display !== 'none') mapGold.push('select')
  }
  return {
    texts,
    haloTag: halo?.tagName.toLowerCase() ?? '',
    haloClass: halo?.getAttribute('class') ?? '',
    marks: document.querySelectorAll('.city-next-mark').length,
    markX: mark ? Number(/translate\(\s*([-\d.]+)/.exec(mark.getAttribute('transform') || '')?.[1]) : null,
    porchImg,
    porchHit,
    chipBox,
    vp,
    dockTop: dock?.top ?? innerHeight,
    ready,
    goldButtons,
    mapGold,
    gift: (document.querySelector('.easy-build-gift')?.textContent || '').replace(/\s+/g, ' ').trim(),
    build: Boolean(document.querySelector('.easy-dock-build')),
    face,
    halo: haloBox ?? null,
  }
}

export async function checkHomeHalo() {
  mkdirSync(SHOTS, { recursive: true })
  const root = fileURLToPath(new URL('..', import.meta.url))
  const server = await createServer({
    root,
    server: { host: '127.0.0.1', port: 0 },
    logLevel: 'error',
  })
  await server.listen()
  const port = server.httpServer?.address()?.port
  const origin = `http://127.0.0.1:${port}/`
  const browser = await launchBrowser()
  try {
    for (const size of SIZES) {
      const tag = `${size[0]}x${size[1]}`
      const built = await openHome(browser, origin, builtBench(), size)
      try {
        const home = await built.page.evaluate(readHome)
        assert.equal(home.ready.includes('bench'), true, `${tag} the built bench is the ready plot`)
        assert.equal(home.haloTag, 'ellipse', `${tag} the halo is a ground ellipse`)
        assert.match(home.haloClass, /is-easy-ground/, `${tag} the halo is the ground ring`)
        assert.equal(home.marks, 1, `${tag} exactly 1 gold ring`)
        assert.deepEqual(home.mapGold, ['ellipse'], `${tag} exactly 1 gold map cue ${home.mapGold.join(',')}`)
        assert.equal(home.goldButtons.length, 1, `${tag} exactly 1 gold ${JSON.stringify(home.goldButtons)}`)
        const diff = await shotDiff(built.page, await haloBox(built.page))
        assert.ok(diff >= 300, `${tag} the halo is visible on a built plot (${diff} px)`)
        const face = await built.page.evaluate(readHome)
        if (face.face && face.halo) {
          const cx = face.halo.x + face.halo.width / 2
          const cy = face.halo.y + face.halo.height / 2
          const rx = face.halo.width / 2
          const ry = face.halo.height / 2
          const fx = face.face.x + face.face.width / 2
          const fy = face.face.y + face.face.height / 2
          const cover = ((fx - cx) / rx) ** 2 + ((fy - cy) / ry) ** 2
          assert.ok(cover >= 1, `${tag} the ring does not cover a resident face (${cover.toFixed(2)})`)
        }
        await built.page.screenshot({ path: join(SHOTS, `halo-built-${tag}.png`) })
        assert.deepEqual(built.errors, [], `${tag} built page errors`)
      } finally {
        await built.context.close()
      }

      const fresh = await openHome(browser, origin, opened(), size)
      try {
        const home = await fresh.page.evaluate(readHome)
        assert.ok(home.porchImg && home.porchHit && home.vp, `${tag} porch art is on the map`)
        assert.ok(
          home.porchHit.x + home.porchHit.width / 2 >= home.porchImg.x &&
            home.porchHit.x + home.porchHit.width / 2 <= home.porchImg.x + home.porchImg.width &&
            home.porchHit.y + home.porchHit.height / 2 >= home.porchImg.y &&
            home.porchHit.y + home.porchHit.height / 2 <= home.porchImg.y + home.porchImg.height,
          `${tag} the porch anchor sits inside the plot`,
        )
        assert.ok(
          home.porchImg.right <= home.vp.right - 4,
          `${tag} porch art stays inside the screen (${home.porchImg.right.toFixed(1)} of ${home.vp.right})`,
        )
        assert.ok(home.chipBox, `${tag} East porch chip is drawn`)
        assert.ok(
          home.chipBox.left >= home.vp.left - 0.5 &&
            home.chipBox.right <= home.vp.right + 0.5 &&
            home.chipBox.top >= home.vp.top - 0.5 &&
            home.chipBox.bottom <= home.dockTop + 0.5,
          `${tag} East porch chip is fully on screen`,
        )
        const small = home.texts.filter((item) => item.px < 13)
        assert.deepEqual(small, [], `${tag} no Home label is under 13px ${JSON.stringify(small)}`)
        assert.equal(home.marks, 1, `${tag} exactly 1 gold ring on a fresh map`)
        assert.equal(home.goldButtons.length, 1, `${tag} exactly 1 gold ${JSON.stringify(home.goldButtons)}`)
        await fresh.page.screenshot({ path: join(SHOTS, `porch-${tag}.png`) })
        assert.deepEqual(fresh.errors, [], `${tag} fresh page errors`)
      } finally {
        await fresh.context.close()
      }

      const short = await openHome(browser, origin, lampsSave(3), size)
      try {
        const home = await short.page.evaluate(readHome)
        assert.equal(home.ready.includes('lamps'), false, `${tag} three stars do not offer a hidden lamp`)
        assert.equal(home.build, false, `${tag} three stars have no Build this`)
        assert.equal(home.markX, 548, `${tag} the cue stays on the porch`)
        assert.equal(home.goldButtons.length, 1, `${tag} exactly 1 gold with the lamps not ready`)
        assert.deepEqual(short.errors, [], `${tag} short page errors`)
      } finally {
        await short.context.close()
      }

      const ready = await openHome(browser, origin, lampsSave(4), size)
      try {
        const before = await ready.page.evaluate(readHome)
        assert.equal(before.ready.includes('lamps'), true, `${tag} four stars make the lamps ready`)
        assert.equal(before.markX, 208, `${tag} the halo opens on the lamps`)
        await ready.page.locator('g.city-plot[data-plot="lamps"]').click()
        await ready.page.getByRole('button', { name: /Build this/ }).click()
        await ready.page.waitForFunction(
          (key) => {
            const raw = localStorage.getItem(key)
            return raw ? JSON.parse(raw).progress?.cityBuilt?.lamps === 2 : false
          },
          STORAGE_KEY,
        )
        await ready.page.locator('g.city-plot[data-plot="lamps"] .city-plot-img').waitFor()
        const after = await ready.page.evaluate(() => {
          const img = document.querySelector('g.city-plot[data-plot="lamps"] .city-plot-img')
          const hit = document.querySelector('g.city-plot[data-plot="lamps"] .city-plot-hit')
          const vp = document.querySelector('.city-pan-viewport').getBoundingClientRect()
          const dock = document.querySelector('.easy-home-dock').getBoundingClientRect().top
          const ir = img.getBoundingClientRect()
          const hr = hit.getBoundingClientRect()
          const gift = (document.querySelector('.easy-build-gift')?.textContent || '').replace(/\s+/g, ' ').trim()
          const gold = [...document.querySelectorAll('button, a.btn')].filter((el) => {
            if (!(el instanceof HTMLElement) || el.closest('.easy-core') || el.closest('[hidden]')) return false
            const style = getComputedStyle(el)
            const box = el.getBoundingClientRect()
            if (style.display === 'none' || box.width < 1) return false
            const primary = el.classList.contains('primary')
            const coach = el.classList.contains('easy-coach-step') && Boolean(el.closest('li.is-now'))
            return primary || coach
          })
          return {
            href: img.getAttribute('href') || '',
            inView: hr.left < vp.right && hr.right > vp.left && hr.top < dock && hr.bottom > vp.top,
            artInView: ir.left < vp.right - 8 && ir.right > vp.left + 8 && ir.top < dock,
            gift,
            gold: gold.length,
          }
        })
        assert.match(after.href, /lamps-lit/, `${tag} after Build this, the built tier has art`)
        assert.equal(after.inView, true, `${tag} after Build this, the plot is in view`)
        assert.equal(after.artInView, true, `${tag} the lamp art is in view`)
        assert.doesNotMatch(after.gift, /Earn four stars/, `${tag} the dock does not ask for four stars after the build`)
        assert.equal(after.gold, 1, `${tag} exactly 1 gold after Build this`)
        await ready.page.screenshot({ path: join(SHOTS, `build-${tag}.png`) })
        assert.deepEqual(ready.errors, [], `${tag} build page errors`)
      } finally {
        await ready.context.close()
      }
    }

    const hard = await browser.newContext({
      viewport: { width: 375, height: 667 },
      deviceScaleFactor: 1,
      reducedMotion: 'reduce',
    })
    await hard.addInitScript(
      ([key, raw]) => {
        localStorage.clear()
        localStorage.setItem(key, raw)
      },
      [STORAGE_KEY, JSON.stringify(save({ easyMode: false, completed: ['ph-road'] }))],
    )
    const hardPage = await hard.newPage()
    const hardErrors = []
    hardPage.on('pageerror', (error) => hardErrors.push(String(error)))
    await hardPage.goto(origin)
    await hardPage.locator('main.hub.is-town').waitFor()
    await hardPage.locator('.city-next-halo').waitFor()
    const hardHome = await hardPage.evaluate(() => ({
      tag: document.querySelector('.city-next-halo')?.tagName.toLowerCase() ?? '',
      ground: document.querySelectorAll('.is-easy-ground').length,
      pan: document.querySelectorAll('.is-easy-pan').length,
      porch: Number(document.querySelector('g.city-plot[data-plot="porch"] .city-plot-hit')?.getAttribute('cx')),
    }))
    assert.equal(hardHome.tag, 'circle', 'Hard keeps the circle halo')
    assert.equal(hardHome.ground, 0, 'Hard has no ground ellipse')
    assert.equal(hardHome.pan, 0, 'Hard does not pan')
    assert.equal(hardHome.porch, 582, 'Hard keeps the porch anchor')
    assert.deepEqual(hardErrors, [], 'Hard page errors')
    await hardPage.screenshot({ path: join(SHOTS, 'hard-375.png') })
    await hard.close()
    writeFileSync(join(SHOTS, 'ok.txt'), 'easy-home-halo\n')
  } finally {
    await browser.close()
    await server.close()
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  await checkHomeHalo()
  console.log('check-home-halo: ok')
}
