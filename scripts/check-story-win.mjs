import assert from 'node:assert/strict'
import { mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { createServer } from 'vite'
import { chromium } from '@playwright/test'
import { evidenceFor } from '../src/content/evidence.ts'
import { findPlayable } from '../src/content/index.ts'
import { easyFacingLine, easyWhyLine } from '../src/lib/easy.ts'
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
  appVersion: '1.4.453',
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
  const chipEls = [...document.querySelectorAll('.why-chip')]
  const chip = chipEls[0] ?? null
  const chipBoxes = chipEls.map((el) => box(el)).filter(Boolean)
  const rowBottom = chipBoxes.length
    ? Math.max(
        ...chipBoxes
          .filter((item) => Math.abs(item.top - chipBoxes[0].top) < 12)
          .map((item) => item.bottom),
      )
    : 0
  const link = document.querySelector('.daily-page > .text-link, .challenge-page > .text-link')
  const page = document.querySelector('.daily-page, .challenge-page')
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
    rowBottom,
    scrollOverflow: page ? page.scrollHeight - page.clientHeight : 0,
    bodyOverflow: (() => {
      const body = document.querySelector('.app-body')
      return body ? body.scrollHeight - body.clientHeight : 0
    })(),
    docX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    tap: (document.querySelector('.why-blast-hud .next-tap')?.textContent ?? '').replace(/\s+/g, ' ').trim(),
    ...(() => {
      const header = document.querySelector('.why-blast-hud .next-tap')
      const chips = [...document.querySelectorAll('button.why-chip')].filter((el) => {
        const style = getComputedStyle(el)
        const box = el.getBoundingClientRect()
        return style.visibility !== 'hidden' && style.display !== 'none' && box.height > 4
      })
      const headerBox = header ? header.getBoundingClientRect() : null
      let headerCovered = false
      if (headerBox) {
        for (const card of chips) {
          const box = card.getBoundingClientRect()
          if (
            box.bottom > headerBox.top + 0.5 &&
            box.top < headerBox.bottom - 0.5 &&
            box.right > headerBox.left + 0.5 &&
            box.left < headerBox.right - 0.5
          ) {
            headerCovered = true
          }
        }
      }
      const marks = chips.map((el) => {
        const style = getComputedStyle(el)
        const classes = [...el.classList]
          .filter((name) => !/^slot-\d+$/.test(name) && !/^float-\d+$/.test(name))
          .sort()
          .join(' ')
        return [style.animationName, style.outlineStyle, style.outlineWidth, style.backgroundColor, classes].join('|')
      })
      return { headerCovered, uniqueHighlight: new Set(marks).size > 1 }
    })(),
    stored: document.querySelector('.stored-line')?.textContent ?? '',
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
  const widthFloor = width >= 700 ? win.innerWidth - 16 : win.innerWidth - 36
  assert.ok(
    win.board.width >= widthFloor,
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
  if (width <= 412) {
    assert.ok(
      win.rowBottom <= win.innerHeight + 0.5,
      `${where} first choice row is in view (${Math.round(win.rowBottom)} of ${win.innerHeight})`,
    )
  }
  if (width === 412) {
    assert.ok(
      win.scrollOverflow <= 1,
      `${where} follow-up fits without a scrollbar (${Math.round(win.scrollOverflow)}px)`,
    )
  }
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
  assert.ok(port > 0, '1.4.453 story-win server has a port')
  const base = `http://127.0.0.1:${port}/`
  const shots = process.env.STORY_WIN_SHOTS
  if (shots) mkdirSync(shots, { recursive: true })
  const browser = await launchBrowser()
  try {
    const strips = storyStripLines()
    assert.ok(strips.length >= 3, '1.4.453 Easy story strips are listed')
    for (const [width, height] of SIZES) {
      const context = await browser.newContext({
        baseURL: base,
        viewport: { width, height },
        deviceScaleFactor: 1,
        reducedMotion: 'reduce',
      })
      await context.addInitScript((save) => {
        localStorage.setItem('silver-city-progress-v1', JSON.stringify(save))
        const attach = () => {
          if (!document.documentElement || document.getElementById('story-win-scroll')) return
          const style = document.createElement('style')
          style.id = 'story-win-scroll'
          style.textContent = '::-webkit-scrollbar{width:15px;height:15px}*{scrollbar-width:auto}'
          document.documentElement.appendChild(style)
        }
        attach()
        document.addEventListener('DOMContentLoaded', attach)
      }, SAVE)
      for (const strip of strips) {
        const page = await context.newPage()
        const errors = []
        page.on('pageerror', (err) => errors.push(String(err)))
        page.on('console', (msg) => {
          if (msg.type() === 'error') errors.push(msg.text())
        })
        const lines = linesFor(strip.lineId)
        await openWin(page, strip.lineId, lines)
        const first = await page.evaluate(readWin)
        await page.waitForTimeout(400)
        const second = await page.evaluate(readWin)
        const shotIds = ['daily-lantern', 'daily-creed', 'fg-reason', 'daily-rest']
        if (shots && (width === 375 || width === 412) && shotIds.includes(strip.lineId)) {
          await page.screenshot({ path: `${shots}/${strip.lineId}-${width}-win.png` })
        }
        const brief = evidenceFor(strip.lineId)
        assert.ok(brief, `${strip.lineId} has a follow-up`)
        const fitContainer =
          strip.lineId === 'wb-creed' || (strip.lineId === 'daily-rest' && (width === 412 || width === 768))
        if (fitContainer) {
          assert.ok(
            second.bodyOverflow <= 1 && second.scrollOverflow <= 1,
            `${strip.lineId} at ${width}×${height} win fits its container (body ${Math.round(second.bodyOverflow)}px, page ${Math.round(second.scrollOverflow)}px)`,
          )
        }
        if (strip.lineId === 'wb-creed') {
          assert.equal(second.tap, 'Drag the card that shows why.', `${strip.lineId} at ${width}×${height} names the drag`)
          assert.equal(second.headerCovered, false, `${strip.lineId} at ${width}×${height} keeps cards under the header`)
          assert.equal(second.uniqueHighlight, false, `${strip.lineId} at ${width}×${height} gives no card a unique highlight`)
          assert.ok(
            second.bodyOverflow <= 0.5 && second.scrollOverflow <= 0.5,
            `${strip.lineId} at ${width}×${height} creed win overflow stays at 0 (body ${second.bodyOverflow}px, page ${second.scrollOverflow}px)`,
          )
        }
        if (strip.lineId === 'daily-rest') {
          assert.equal(second.tap, 'Drag the card that shows why.', `${strip.lineId} at ${width}×${height} names the drag`)
        }
        assert.ok(second.docX <= 1, `${strip.lineId} at ${width}×${height} has no horizontal scroll`)
        await page.getByRole('button', { name: easyWhyLine(brief.reason), exact: true }).click()
        await page.locator('.why-blast.is-win').waitFor()
        const mid = await page.evaluate(readWin)
        assert.equal(await page.locator('.why-blast.is-win').count(), 1, `${strip.lineId} mid-quiz is still the locked follow-up`)
        await page.getByRole('button', { name: 'Continue' }).click()
        await page.getByText('Say this tomorrow').waitFor()
        await page.waitForFunction(() => {
          const link = document.querySelector('.daily-page > .text-link, .challenge-page > .text-link')
          const body = document.querySelector('.app-body')
          return Boolean(link && link.getBoundingClientRect().top >= 0 && (body?.scrollTop ?? 0) <= 1)
        })
        const after = await page.evaluate(readWin)
        const widths = [
          Math.round(first.board?.width ?? 0),
          Math.round(second.board?.width ?? 0),
          Math.round(mid.board?.width ?? 0),
          Math.round(after.board?.width ?? 0),
        ]
        assertWin(strip.lineId, width, height, second, widths.slice(0, 2))
        assert.equal(
          new Set(widths).size,
          1,
          `${strip.lineId} at ${width}×${height} strip width is identical across win, mid-quiz and recap (${widths.join(' → ')})`,
        )
        assert.ok(after.link && after.link.top >= 0, `${strip.lineId} at ${width}×${height} keeps Settings on screen`)
        if (strip.lineId === 'daily-rest') {
          const kept = easyFacingLine(strip.lineId, brief.claim)
          assert.match(after.stored, /Say this tomorrow/i, `${strip.lineId} at ${width}×${height} says Say this tomorrow`)
          assert.match(after.stored, new RegExp(kept.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), `${strip.lineId} at ${width}×${height} keeps the line`)
        }
        assert.deepEqual(errors, [], `${strip.lineId} at ${width}×${height} has no console errors`)
        if (shotIds.includes(strip.lineId)) {
          console.log(`${strip.lineId} ${width}×${height} strip ${widths[0]}`)
        }
        if (shots && width === 375 && strip.lineId === 'daily-lantern') {
          await page.screenshot({ path: `${shots}/${strip.lineId}-375-after.png` })
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
