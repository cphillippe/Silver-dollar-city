/**
 * Easy Home phone: porch fits, labels stay readable, Build this draws a look.
 * One filled gold on the phone. Wide and Hard frames keep the old porch anchor.
 * Shots stay in the OS temp directory.
 */
import assert from 'node:assert/strict'
import { mkdirSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from '@playwright/test'
import { createServer } from 'vite'
import { APP_VERSION, SAVE_SCHEMA_VERSION, STORAGE_KEY } from '../src/config/app.ts'
import { emptyCityBuilt } from '../src/lib/cityBuild.ts'
import { SAVE_KIND } from '../src/lib/save.ts'

const PHONE = [
  [375, 667],
  [390, 844],
]
const SHOTS = join(tmpdir(), 'easy-home-porch')

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

async function openSeed(browser, origin, payload, viewport, { mobile = true } = {}) {
  const context = await browser.newContext({
    viewport: { width: viewport[0], height: viewport[1] },
    deviceScaleFactor: mobile ? 2 : 1,
    reducedMotion: 'reduce',
    hasTouch: mobile,
    isMobile: mobile,
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
  return { context, page, errors }
}

function readPhone() {
  const shown = (el) => {
    if (!el) return false
    const style = getComputedStyle(el)
    const box = el.getBoundingClientRect()
    return style.display !== 'none' && style.visibility !== 'hidden' && Number(style.opacity) > 0 && box.width > 0 && box.height > 0
  }
  const texts = []
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
  const root = document.querySelector('main.hub')
  if (root) walk(root)
  const bar = document.querySelector('.topbar')
  if (bar) walk(bar)
  const porch = document.querySelector('g.city-plot[data-plot="porch"]')
  const porchImg = porch?.querySelector('.city-plot-img')?.getBoundingClientRect() ?? null
  const porchHit = porch?.querySelector('.city-plot-hit')?.getBoundingClientRect() ?? null
  const chip = [...document.querySelectorAll('.city-easy-chip')].find((el) => /East\s*porch/i.test(el.textContent || ''))
  const vp = document.querySelector('.city-pan-viewport')?.getBoundingClientRect() ?? null
  const dockTop = document.querySelector('.easy-home-dock')?.getBoundingClientRect().top ?? innerHeight
  const goldButtons = [...document.querySelectorAll('button, a.btn')].filter((el) => {
    if (!(el instanceof HTMLElement) || el.closest('.easy-core') || el.closest('[hidden]')) return false
    if (!shown(el)) return false
    const primary = el.classList.contains('primary')
    const coach = el.classList.contains('easy-coach-step') && Boolean(el.closest('li.is-now'))
    return primary || coach
  }).map((el) => (el.innerText || '').replace(/\s+/g, ' ').trim())
  return {
    texts,
    porchImg,
    porchHit,
    porchCx: Number(porch?.querySelector('.city-plot-hit')?.getAttribute('cx')),
    chipBox: chip?.getBoundingClientRect() ?? null,
    vp,
    dockTop,
    ready: [...document.querySelectorAll('g.city-plot.is-ready')].map((el) => el.getAttribute('data-plot')),
    next: document.querySelector('g.city-plot.is-next')?.getAttribute('data-plot') ?? '',
    marks: document.querySelectorAll('.city-next-mark').length,
    goldButtons,
    build: Boolean(document.querySelector('.easy-dock-build')),
    pan: document.querySelectorAll('.is-easy-pan').length,
  }
}

export async function checkHomePorch() {
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
  const gold = {}
  try {
    for (const size of PHONE) {
      const tag = `${size[0]}x${size[1]}`
      const fresh = await openSeed(browser, origin, opened(), size)
      try {
        await fresh.page.locator('main.hub.is-easy-home').waitFor()
        await fresh.page.locator('.city-pan-viewport').waitFor()
        await fresh.page.waitForTimeout(300)
        const home = await fresh.page.evaluate(readPhone)
        assert.ok(home.porchImg && home.porchHit && home.vp, `${tag} porch art is on the map`)
        assert.equal(home.porchCx, 548, `${tag} the porch uses the phone anchor`)
        const ax = home.porchHit.x + home.porchHit.width / 2
        const ay = home.porchHit.y + home.porchHit.height / 2
        assert.ok(
          ax >= home.porchImg.x && ax <= home.porchImg.x + home.porchImg.width && ay >= home.porchImg.y && ay <= home.porchImg.y + home.porchImg.height,
          `${tag} the porch anchor sits inside the plot`,
        )
        assert.ok(home.porchImg.right <= home.vp.right - 4, `${tag} porch art stays inside the screen (${home.porchImg.right.toFixed(1)} of ${home.vp.right})`)
        assert.ok(home.chipBox, `${tag} East porch chip is drawn`)
        assert.ok(
          home.chipBox.left >= home.vp.left - 0.5 && home.chipBox.right <= home.vp.right + 0.5 && home.chipBox.top >= home.vp.top - 0.5 && home.chipBox.bottom <= home.dockTop + 0.5,
          `${tag} East porch chip is fully on screen`,
        )
        const small = home.texts.filter((item) => item.px < 13)
        assert.deepEqual(small, [], `${tag} no Home label is under 13px ${JSON.stringify(small)}`)
        assert.equal(home.marks, 1, `${tag} exactly 1 gold ring`)
        assert.equal(home.goldButtons.length, 1, `${tag} exactly 1 gold ${JSON.stringify(home.goldButtons)}`)
        gold[tag] = home.goldButtons
        await fresh.page.screenshot({ path: join(SHOTS, `porch-${tag}.png`) })
        assert.deepEqual(fresh.errors, [], `${tag} porch page errors`)
      } finally {
        await fresh.context.close()
      }

      const short = await openSeed(browser, origin, lampsSave(3), size)
      try {
        await short.page.locator('.city-pan-viewport').waitFor()
        await short.page.waitForTimeout(250)
        const home = await short.page.evaluate(readPhone)
        assert.equal(home.ready.includes('lamps'), false, `${tag} three stars do not offer a hidden lamp`)
        assert.equal(home.build, false, `${tag} three stars have no Build this`)
        assert.equal(home.next, 'porch', `${tag} the cue stays on the porch`)
        assert.equal(home.goldButtons.length, 1, `${tag} exactly 1 gold with the lamps not ready`)
        assert.deepEqual(short.errors, [], `${tag} short page errors`)
      } finally {
        await short.context.close()
      }

      const ready = await openSeed(browser, origin, lampsSave(4), size)
      try {
        await ready.page.locator('.city-pan-viewport').waitFor()
        await ready.page.waitForTimeout(250)
        const before = await ready.page.evaluate(readPhone)
        assert.equal(before.ready.includes('lamps'), true, `${tag} four stars make the lamps ready`)
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
          const goldCount = [...document.querySelectorAll('button, a.btn')].filter((el) => {
            if (!(el instanceof HTMLElement) || el.closest('.easy-core') || el.closest('[hidden]')) return false
            const style = getComputedStyle(el)
            const box = el.getBoundingClientRect()
            if (style.display === 'none' || box.width < 1) return false
            const primary = el.classList.contains('primary')
            const coach = el.classList.contains('easy-coach-step') && Boolean(el.closest('li.is-now'))
            return primary || coach
          }).length
          return {
            href: img.getAttribute('href') || '',
            inView: hr.left < vp.right && hr.right > vp.left && hr.top < dock && hr.bottom > vp.top,
            artInView: ir.left < vp.right - 8 && ir.right > vp.left + 8 && ir.top < dock,
            gift,
            goldCount,
          }
        })
        assert.match(after.href, /lamps-lit/, `${tag} after Build this, the built tier has art`)
        assert.equal(after.inView, true, `${tag} after Build this, the plot is in view`)
        assert.equal(after.artInView, true, `${tag} the lamp art is in view`)
        assert.doesNotMatch(after.gift, /Earn four stars/, `${tag} the dock does not ask for four stars after the build`)
        assert.equal(after.goldCount, 1, `${tag} exactly 1 gold after Build this`)
        await ready.page.screenshot({ path: join(SHOTS, `build-${tag}.png`) })
        assert.deepEqual(ready.errors, [], `${tag} build page errors`)
      } finally {
        await ready.context.close()
      }
    }

    const wide = await openSeed(browser, origin, opened(), [768, 1024], { mobile: false })
    try {
      await wide.page.locator('main.hub.is-easy-home').waitFor()
      await wide.page.locator('.city-svg').waitFor()
      await wide.page.waitForTimeout(300)
      const home = await wide.page.evaluate(readPhone)
      assert.equal(home.pan, 0, '768 does not pan')
      assert.equal(home.porchCx, 582, '768 keeps the porch anchor')
      assert.equal(home.goldButtons.length, 1, `768 exactly 1 gold ${JSON.stringify(home.goldButtons)}`)
      await wide.page.screenshot({ path: join(SHOTS, 'wide-768.png') })
      assert.deepEqual(wide.errors, [], '768 page errors')
    } finally {
      await wide.context.close()
    }

    const hard = await openSeed(browser, origin, save({ easyMode: false, completed: ['ph-road'] }), [375, 667], { mobile: false })
    try {
      await hard.page.locator('main.hub.is-town').waitFor()
      await hard.page.locator('.city-next-halo').waitFor()
      const home = await hard.page.evaluate(() => ({
        tag: document.querySelector('.city-next-halo')?.tagName.toLowerCase() ?? '',
        pan: document.querySelectorAll('.is-easy-pan').length,
        porch: Number(document.querySelector('g.city-plot[data-plot="porch"] .city-plot-hit')?.getAttribute('cx')),
      }))
      assert.equal(home.tag, 'circle', 'Hard keeps the circle')
      assert.equal(home.pan, 0, 'Hard does not pan')
      assert.equal(home.porch, 582, 'Hard keeps the porch anchor')
      await hard.page.screenshot({ path: join(SHOTS, 'hard-375.png') })
      assert.deepEqual(hard.errors, [], 'Hard page errors')
    } finally {
      await hard.context.close()
    }
    writeFileSync(join(SHOTS, 'gold.json'), `${JSON.stringify(gold)}\n`)
  } finally {
    await browser.close()
    await server.close()
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  await checkHomePorch()
  console.log('check-home-porch: ok')
}
