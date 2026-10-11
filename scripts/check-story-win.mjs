import assert from 'node:assert/strict'
import { mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { createServer } from 'vite'
import { chromium } from '@playwright/test'
import { findPlayable } from '../src/content/index.ts'
import { storyStripLines } from '../src/lib/debugPlays.ts'

/** Phone and tablet sizes from the Easy story-win playtest. */
const SIZES = [
  [375, 667],
  [412, 915],
  [768, 1024],
]

const SAVE = {
  kind: 'silver-city-save',
  schemaVersion: 1,
  appVersion: '1.4.449',
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

function linesFor(id) {
  const found = findPlayable(id)
  assert.ok(found && found.challenge.kind === 'sequence', `${id} is an Easy story strip`)
  return found.challenge.items.map((item) => item.easyText || item.text)
}

async function launchBrowser() {
  try {
    return await chromium.launch({ headless: true })
  } catch {
    return await chromium.launch({ headless: true, channel: 'chrome' })
  }
}

function readWin() {
  function box(el) {
    if (!el) return null
    const r = el.getBoundingClientRect()
    return { top: r.top, bottom: r.bottom, left: r.left, width: r.width, height: r.height }
  }
  const board = document.querySelector('.strip-board')
  const stamp = document.querySelector('.strip-stamp')
  const stars = document.querySelector('.strip-stars')
  const storySets = [...document.querySelectorAll('.strip-stamp, .win-stamp')].flatMap((el) => {
    const style = getComputedStyle(el)
    const r = el.getBoundingClientRect()
    const hidden =
      style.display === 'none' ||
      style.visibility === 'hidden' ||
      Number(style.opacity) === 0 ||
      r.width < 8 ||
      r.height < 8 ||
      r.bottom < 0 ||
      r.top > window.innerHeight
    if (hidden) return []
    const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2)
    if (!hit || (hit !== el && !el.contains(hit))) return []
    return [{ kind: el.classList.contains('strip-stamp') ? 'badge' : 'overlay', top: r.top }]
  })
  const verse = document.querySelector('.strip-verse')
  const quote = document.querySelector('.strip-verse blockquote')
  const home = document.querySelector('.town-return .btn')
  const chip = document.querySelector('.why-chip')
  const link = document.querySelector('.daily-page > .text-link, .challenge-page > .text-link')
  const topbar = document.querySelector('.topbar')
  const imgs = [...document.querySelectorAll('.strip-board img')].map((img) => box(img))
  const slots = [...document.querySelectorAll('.strip-board .strip-slot')].map((slot) => box(slot))
  const hit = (el) => {
    if (!el) return false
    const r = el.getBoundingClientRect()
    const node = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2)
    return Boolean(node && (node === el || el.contains(node)))
  }
  return {
    innerWidth: window.innerWidth,
    innerHeight: window.innerHeight,
    board: box(board),
    stamp: stamp ? { ...box(stamp), text: stamp.textContent, hit: hit(stamp) } : null,
    storySets,
    stars: stars ? { ...box(stars), text: stars.textContent, hit: hit(stars) } : null,
    verse: box(verse),
    quote: quote
      ? { ...box(quote), clip: quote.scrollHeight - quote.clientHeight, text: quote.textContent }
      : null,
    home: box(home),
    chip: chip ? { ...box(chip), hit: hit(chip) } : null,
    link: link ? { ...box(link), text: link.textContent } : null,
    topbar: box(topbar),
    imgs,
    slots,
    n: Number(document.querySelector('.play.is-story-strip')?.getAttribute('data-n') || 0),
  }
}

function assertWin(id, width, height, win, widths) {
  const where = `${id} at ${width}×${height}`
  assert.ok(win.board, `${where} has a strip`)
  assert.ok(win.board.height > 120, `${where} strip stays above 120px (${Math.round(win.board.height)}px)`)
  assert.ok(
    win.board.width >= win.innerWidth - 16,
    `${where} strip keeps its width (${Math.round(win.board.width)} of ${win.innerWidth})`,
  )
  assert.ok(Math.max(...widths) - Math.min(...widths) <= 2, `${where} strip width stays put (${widths.join(' → ')})`)
  assert.equal(win.slots.length, win.n, `${where} shows every picture`)
  for (const slot of win.slots) {
    assert.ok(slot.height > 40 && slot.width > 20, `${where} picture is on screen`)
  }
  if (win.imgs.length > 0) {
    assert.equal(win.imgs.length, win.n, `${where} shows every picture`)
    for (const img of win.imgs) {
      assert.ok(img.height > 40 && img.width > 20, `${where} picture is on screen`)
    }
  }
  assert.ok(win.stamp && /STORY SET/.test(win.stamp.text), `${where} shows STORY SET`)
  assert.ok(win.stamp.width >= 80 && win.stamp.height >= 20 && win.stamp.hit, `${where} STORY SET is visible`)
  assert.equal(win.storySets.length, 1, `${where} shows exactly one STORY SET`)
  assert.equal(win.storySets[0]?.kind, 'badge', `${where} keeps the gold badge`)
  assert.ok(
    win.stamp.top + win.stamp.height / 2 >= win.board.bottom - 2,
    `${where} STORY SET sits below the pictures`,
  )
  assert.ok(win.stars && /★/.test(win.stars.text), `${where} shows the stars`)
  assert.ok(win.stars.width >= 48 && win.stars.height >= 12 && win.stars.hit, `${where} stars are visible`)
  assert.ok(win.quote && win.verse && win.home, `${where} has the verse and Home`)
  assert.ok(win.quote.clip <= 1, `${where} quote is fully drawn`)
  assert.ok(win.verse.bottom <= win.home.top + 0.5, `${where} quote stays above Home`)
  assert.ok(win.quote.top >= 0 && win.quote.bottom <= win.innerHeight + 0.5, `${where} quote is in view`)
  assert.ok(win.chip, `${where} has a follow-up choice`)
  assert.ok(
    win.chip.top >= 0 && win.chip.bottom <= win.innerHeight + 0.5 && win.chip.hit,
    `${where} first choice is in view`,
  )
  assert.ok(win.link && win.topbar, `${where} has the back link`)
  assert.ok(win.link.top >= win.topbar.bottom - 1, `${where} back link is below the top bar`)
  assert.match(win.link.text, /Settings/, `${where} playtest link says Settings`)
}

async function openWin(page, id, lines) {
  await page.goto('/', { waitUntil: 'domcontentloaded' })
  await page.getByRole('button', { name: 'Settings', exact: true }).click()
  await page.getByText('Developer · mini-game jumps').click()
  await page.getByRole('region', { name: 'Story Strip' }).getByRole('button', { name: new RegExp(`^${id} ·`) }).click()
  await page.locator('[data-testid="story-strip"]').waitFor()
  for (const line of lines) {
    await page.getByRole('button', { name: line, exact: true }).click()
  }
  await page.locator('.strip-verse blockquote').waitFor()
  await page.locator('.why-chip').first().waitFor()
  await page.waitForFunction(() => {
    const slots = [...document.querySelectorAll('.strip-board .strip-slot')]
    return slots.length > 0 && slots.every((slot) => slot.getBoundingClientRect().height > 40)
  })
}

/** Renders every Easy story strip's win after the follow-up. */
export async function checkStoryWins() {
  const root = fileURLToPath(new URL('..', import.meta.url))
  const server = await createServer({
    root,
    server: { host: '127.0.0.1', port: 0 },
    logLevel: 'error',
  })
  await server.listen()
  const address = server.httpServer?.address()
  const port = address && typeof address === 'object' ? address.port : 0
  assert.ok(port > 0, '1.4.449 story-win server has a port')
  const base = `http://127.0.0.1:${port}/`
  const shots = process.env.STORY_WIN_SHOTS
  if (shots) mkdirSync(shots, { recursive: true })
  const browser = await launchBrowser()
  try {
    const strips = storyStripLines()
    assert.ok(strips.length >= 3, '1.4.449 Easy story strips are listed')
    for (const [width, height] of SIZES) {
      const context = await browser.newContext({
        baseURL: base,
        viewport: { width, height },
        deviceScaleFactor: 1,
        reducedMotion: 'reduce',
      })
      await context.addInitScript((save) => {
        localStorage.setItem('silver-city-progress-v1', JSON.stringify(save))
      }, SAVE)
      for (const strip of strips) {
        const page = await context.newPage()
        const lines = linesFor(strip.lineId)
        await openWin(page, strip.lineId, lines)
        const first = await page.evaluate(readWin)
        await page.waitForTimeout(400)
        const second = await page.evaluate(readWin)
        assertWin(strip.lineId, width, height, second, [
          Math.round(first.board?.width ?? 0),
          Math.round(second.board?.width ?? 0),
        ])
        if (shots && width === 375 && (strip.lineId === 'daily-lantern' || strip.lineId === 'daily-creed')) {
          await page.screenshot({ path: `${shots}/${strip.lineId}-375-win.png` })
        }
        await page.close()
      }
      await context.close()
    }
  } finally {
    await browser.close()
    await server.close()
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  await checkStoryWins()
  console.log('check-story-win: ok')
}
