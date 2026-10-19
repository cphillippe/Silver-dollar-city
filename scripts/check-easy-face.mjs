import assert from 'node:assert/strict'
import { createServer } from 'vite'
import { chromium } from '@playwright/test'
import { fileURLToPath } from 'node:url'
import { easyFacingLine } from '../src/lib/easy.ts'
import { evidenceFor } from '../src/content/evidence.ts'
import { findPlayable } from '../src/content/index.ts'

const SIZES = [
  [375, 667],
  [412, 915],
  [768, 1024],
]

const SAVE = {
  kind: 'silver-city-save',
  schemaVersion: 1,
  appVersion: '1.4.471',
  savedAt: '2026-10-14T00:00:00.000Z',
  progress: {
    started: true,
    easyMode: true,
    theme: 'candy',
    completed: [],
    lastDailyDate: '2026-10-10',
    held: [],
  },
}

const FACE = {
  'fg-reason': 'Your mind works because God gives it light.',
  'fg-ought': 'God wrote right and wrong on your heart.',
}

function readFace() {
  const text = (el) => (el ? el.textContent.replace(/\s+/g, ' ').trim() : '')
  const shown = (el) => {
    if (!el) return false
    const style = getComputedStyle(el)
    const box = el.getBoundingClientRect()
    return style.display !== 'none' && style.visibility !== 'hidden' && box.height > 8 && box.width > 8
  }
  const root = document.documentElement
  return {
    header: text(document.querySelector('.loci-stamp-idea')),
    say: text(document.querySelector('.match-teach-say')),
    who: text(document.querySelector('.merge-who-where .is-who .match-teach-label')),
    where: text(document.querySelector('.merge-who-where .is-where .match-teach-label')),
    whoShown: shown(document.querySelector('.merge-who-where')),
    docX: root.scrollWidth - root.clientWidth,
  }
}

async function launchBrowser() {
  try {
    return await chromium.launch({ headless: true })
  } catch {
    return await chromium.launch({ headless: true, channel: 'chrome' })
  }
}

function linesFor(id) {
  const found = findPlayable(id)
  assert.ok(found && found.challenge.kind === 'sequence', `${id} is a story strip`)
  return found.challenge.items.map((item) => item.easyText || item.text)
}

function readGuide() {
  const kicker = document.querySelector('.strip-kicker')
  const style = kicker ? getComputedStyle(kicker) : null
  const box = kicker ? kicker.getBoundingClientRect() : null
  return {
    text: kicker ? kicker.innerText.replace(/\s+/g, ' ').trim() : '',
    top: box ? box.top : -1,
    bottom: box ? box.bottom : 9999,
    left: box ? box.left : -1,
    right: box ? box.right : 9999,
    height: box ? box.height : 0,
    display: style ? style.display : 'none',
    innerH: window.innerHeight,
    innerW: window.innerWidth,
    withCount: document.querySelectorAll('.strip-with').length,
  }
}

function readCreedWin() {
  const play = document.querySelector('.play.is-story-strip')
  const page = document.querySelector('.daily-page, .challenge-page')
  const body = document.querySelector('.app-body')
  const chip = document.querySelector('.why-chip')
  const withLine = document.querySelector('.strip-with')
  const cite = document.querySelector('.strip-verse cite')
  const citeStyle = cite ? getComputedStyle(cite) : null
  const citeBox = cite ? cite.getBoundingClientRect() : null
  return {
    text: play ? play.innerText.replace(/\s+/g, ' ') : '',
    withText: withLine ? withLine.innerText.replace(/\s+/g, ' ').trim() : '',
    withLines: withLine ? withLine.getClientRects().length : 0,
    cite: cite ? cite.innerText.replace(/\s+/g, ' ').trim() : '',
    citeShown: Boolean(
      cite &&
        citeStyle &&
        citeStyle.display !== 'none' &&
        citeStyle.visibility !== 'hidden' &&
        citeBox &&
        citeBox.height > 8 &&
        citeBox.width > 8 &&
        citeBox.top >= 0 &&
        citeBox.bottom <= window.innerHeight + 0.5,
    ),
    pageScroll: page ? page.scrollHeight - page.clientHeight : 99,
    bodyScroll: body ? body.scrollHeight - body.clientHeight : 99,
    chipBottom: chip ? chip.getBoundingClientRect().bottom : 9999,
    innerH: window.innerHeight,
  }
}

function readRoadCaps() {
  return [...document.querySelectorAll('.strip-board.is-win .strip-slot')].map((slot) => {
    const cap = slot.querySelector('.strip-cap')
    const art = slot.querySelector('.strip-art')
    const text = slot.querySelector('.strip-cap-text')
    const capStyle = cap ? getComputedStyle(cap) : null
    const textStyle = text ? getComputedStyle(text) : null
    const clamp = textStyle ? textStyle.getPropertyValue('-webkit-line-clamp') : ''
    return {
      slotH: slot.getBoundingClientRect().height,
      capH: cap ? cap.getBoundingClientRect().height : 0,
      artH: art ? art.getBoundingClientRect().height : 0,
      capOver: cap ? cap.scrollHeight - cap.clientHeight : 99,
      textOver: text ? text.scrollHeight - text.clientHeight : 99,
      ellipsis:
        capStyle?.textOverflow === 'ellipsis' ||
        textStyle?.textOverflow === 'ellipsis' ||
        (clamp !== '' && clamp !== 'none' && clamp !== 'unset'),
      capText: text ? text.innerText.replace(/\s+/g, ' ').trim() : '',
    }
  })
}

async function openRegion(page, region, id) {
  await page.goto('/', { waitUntil: 'domcontentloaded' })
  await page.getByRole('button', { name: 'Settings', exact: true }).click()
  await page.getByText('Developer · mini-game jumps').click()
  await page.getByRole('region', { name: region }).getByRole('button', { name: new RegExp(`^${id} ·`) }).click()
}

async function openStrip(page, id) {
  await openRegion(page, 'Story Strip', id)
  await page.locator('[data-testid="story-strip"]').waitFor()
}

async function finishStrip(page, id) {
  for (const line of linesFor(id)) {
    await page.getByRole('button', { name: line, exact: true }).click()
  }
  await page.locator('.strip-verse blockquote').waitFor()
  await page.locator('.why-chip').first().waitFor()
}

/** Easy header/takeaway, creed place, and the father Hold button. */
export async function checkEasyFace() {
  for (const id of Object.keys(FACE)) {
    const claim = evidenceFor(id)?.claim
    assert.ok(claim)
    assert.equal(easyFacingLine(id, claim), FACE[id], `${id} takeaway face`)
  }
  assert.notEqual(evidenceFor('fg-reason')?.claim, FACE['fg-reason'])
  assert.match(evidenceFor('fg-ought')?.claim ?? '', /Rocks cannot write/)

  const root = fileURLToPath(new URL('..', import.meta.url))
  const server = await createServer({
    root,
    server: { host: '127.0.0.1', port: 0 },
    logLevel: 'error',
  })
  await server.listen()
  const address = server.httpServer?.address()
  const port = address && typeof address === 'object' ? address.port : 0
  assert.ok(port > 0, '1.4.471 easy-face server has a port')
  const browser = await launchBrowser()
  try {
    for (const [width, height] of SIZES) {
      const context = await browser.newContext({
        baseURL: `http://127.0.0.1:${port}/`,
        viewport: { width, height },
        deviceScaleFactor: 1,
        reducedMotion: 'reduce',
      })
      await context.addInitScript((save) => {
        localStorage.setItem('silver-city-progress-v1', JSON.stringify(save))
      }, SAVE)
      const page = await context.newPage()
      const errors = []
      page.on('pageerror', (err) => errors.push(String(err)))
      page.on('console', (msg) => {
        if (msg.type() === 'error') errors.push(msg.text())
      })

      for (const id of Object.keys(FACE)) {
        await openRegion(page, 'Gem Match / word search', id)
        await page.locator('.loci-stamp-idea').waitFor()
        const face = await page.evaluate(readFace)
        assert.equal(face.header, FACE[id], `${id} header at ${width}`)
        assert.equal(face.say, FACE[id], `${id} takeaway at ${width}`)
        assert.ok(face.docX <= 1, `${id} horizontal scroll at ${width}`)
      }

      await openRegion(page, 'Claim merge', 'wb-creed')
      await page.locator('.merge-who-where').waitFor()
      const creed = await page.evaluate(readFace)
      assert.equal(creed.who, 'Silas', `creed guide at ${width}`)
      assert.equal(creed.where, 'Witness Square', `creed place at ${width}`)
      assert.equal(creed.whoShown, true, `creed who/where card at ${width}`)
      assert.ok(creed.docX <= 1, `creed horizontal scroll at ${width}`)

      await openRegion(page, 'Father run', 'ph-father')
      await page.locator('[data-run-pad="hold"]').waitFor()
      await page.evaluate(() => {
        const pad = document.querySelector('[data-run-pad="hold"]')
        pad.dataset.mark = 'stay'
      })
      const pad = page.locator('[data-run-pad="hold"]')
      await pad.hover()
      await page.mouse.down()
      await page.waitForTimeout(60)
      await page.mouse.up()
      for (let tap = 1; tap <= 3; tap += 1) {
        await page.waitForFunction(
          () => document.querySelector('[data-run-pad="hold"]')?.getAttribute('aria-label') === 'Tap',
          null,
          { timeout: 8000 },
        )
        const same = await page.evaluate(() => {
          const live = document.querySelector('[data-run-pad="hold"]')
          const marked = document.querySelector('[data-mark="stay"]')
          return Boolean(live && marked === live && live.isConnected)
        })
        assert.equal(same, true, `father pad stays connected at ${width} tap ${tap}`)
        await pad.click({ delay: 30 })
        await page.waitForTimeout(40)
        const score = Number((await page.locator('.match-score').innerText()).replace(/\D/g, ''))
        assert.equal(score, tap * 25, `father tap ${tap}/3 at ${width}`)
        if (tap < 3) {
          await page.waitForFunction(
            () => document.querySelector('[data-run-pad="hold"]')?.getAttribute('aria-label') === 'Hold',
            null,
            { timeout: 8000 },
          )
        }
      }
      const fatherX = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
      assert.ok(fatherX <= 1, `father horizontal scroll at ${width}`)

      await openStrip(page, 'wb-creed')
      const intro = await page.evaluate(readGuide)
      assert.match(intro.text, /Silas/, `creed intro guide at ${width}`)
      assert.match(intro.text, /Witness Square/, `creed intro place at ${width}`)
      const introRef = (await page.locator('.play.is-story-strip .strip-kicker').nth(1).innerText()).replace(/\s+/g, ' ')
      assert.match(introRef, /1 Corinthians 15:3/, `creed intro keeps the verse ref at ${width}`)
      assert.notEqual(intro.display, 'none', `creed intro kicker is visible at ${width}`)
      assert.ok(intro.height > 8, `creed intro kicker has a box at ${width}`)
      assert.ok(
        intro.top >= 0 && intro.bottom <= intro.innerH + 0.5 && intro.left >= 0 && intro.right <= intro.innerW + 0.5,
        `creed intro kicker is in view at ${width}`,
      )

      await finishStrip(page, 'wb-creed')
      const creedWin = await page.evaluate(readCreedWin)
      assert.match(creedWin.text, /Silas/, `creed win names Silas at ${width}`)
      assert.match(creedWin.withText, /With Silas at Witness Square/, `creed win line at ${width}`)
      assert.match(creedWin.cite, /1 Corinthians 15:3/, `creed win shows the verse ref at ${width}`)
      assert.equal(creedWin.citeShown, true, `creed win verse ref is on screen at ${width}`)
      if (width === 375) assert.equal(creedWin.withLines, 1, 'creed win line is one line at 375')
      assert.ok(
        creedWin.pageScroll <= 1 && creedWin.bodyScroll <= 1,
        `creed win fits without inner scroll at ${width} (page ${Math.round(creedWin.pageScroll)}px, body ${Math.round(creedWin.bodyScroll)}px)`,
      )
      assert.ok(
        creedWin.chipBottom <= creedWin.innerH + 0.5,
        `creed first why choice stays on screen at ${width} (${Math.round(creedWin.chipBottom)} of ${creedWin.innerH})`,
      )

      await openStrip(page, 'ph-road')
      await finishStrip(page, 'ph-road')
      const cards = await page.evaluate(readRoadCaps)
      assert.equal(cards.length, 5, `ph-road win cards at ${width}`)
      for (const card of cards) {
        assert.ok(card.capH <= card.slotH * 0.4 + 0.5, `ph-road caption stays under 40% at ${width} (${Math.round(card.capH)} of ${Math.round(card.slotH)})`)
        assert.ok(card.artH >= card.slotH * 0.6 - 0.5, `ph-road art keeps 60% at ${width} (${Math.round(card.artH)} of ${Math.round(card.slotH)})`)
        assert.ok(card.capOver <= 1 && card.textOver <= 1, `ph-road caption is not cut at ${width} (${card.capText})`)
        assert.equal(card.ellipsis, false, `ph-road caption has no ellipsis at ${width}`)
      }

      assert.deepEqual(errors, [], `console errors at ${width}`)
      await context.close()

      const hardContext = await browser.newContext({
        baseURL: `http://127.0.0.1:${port}/`,
        viewport: { width, height },
        deviceScaleFactor: 1,
        reducedMotion: 'reduce',
      })
      await hardContext.addInitScript((save) => {
        const hardSave = { ...save, progress: { ...save.progress, easyMode: false } }
        localStorage.setItem('silver-city-progress-v1', JSON.stringify(hardSave))
      }, SAVE)
      const hardPage = await hardContext.newPage()
      const hardErrors = []
      hardPage.on('pageerror', (err) => hardErrors.push(String(err)))
      hardPage.on('console', (msg) => {
        if (msg.type() === 'error') hardErrors.push(msg.text())
      })
      await hardPage.goto('/?playtest=1&sequence=wb-creed', { waitUntil: 'domcontentloaded' })
      await hardPage.getByRole('button', { name: 'Unlock the order' }).click()
      await hardPage.locator('[data-testid="story-strip"]').waitFor()
      const hard = await hardPage.evaluate(readGuide)
      const hardEasy = await hardPage.evaluate(() => document.documentElement.dataset.easy)
      assert.equal(hardEasy, 'off', `Hard creed stays Hard at ${width}`)
      assert.equal(hard.withCount, 0, `Hard creed has no guide line at ${width}`)
      assert.doesNotMatch(hard.text, /Silas/, `Hard creed has no new guide text at ${width}`)
      assert.deepEqual(hardErrors, [], `Hard console errors at ${width}`)
      await hardContext.close()
    }
  } finally {
    await browser.close()
    await server.close()
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  await checkEasyFace()
  console.log('check-easy-face: ok')
}
