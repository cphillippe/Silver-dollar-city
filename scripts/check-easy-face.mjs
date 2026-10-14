import assert from 'node:assert/strict'
import { createServer } from 'vite'
import { chromium } from '@playwright/test'
import { fileURLToPath } from 'node:url'
import { easyFacingLine } from '../src/lib/easy.ts'
import { evidenceFor } from '../src/content/evidence.ts'

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

async function openRegion(page, region, id) {
  await page.goto('/', { waitUntil: 'domcontentloaded' })
  await page.getByRole('button', { name: 'Settings', exact: true }).click()
  await page.getByText('Developer · mini-game jumps').click()
  await page.getByRole('region', { name: region }).getByRole('button', { name: new RegExp(`^${id} ·`) }).click()
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
          () => document.querySelector('[data-run-pad="hold"]')?.getAttribute('aria-label') === 'Let go — press now!',
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
            () => document.querySelector('[data-run-pad="hold"]')?.getAttribute('aria-label') === 'Hold to run',
            null,
            { timeout: 8000 },
          )
        }
      }
      const fatherX = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
      assert.ok(fatherX <= 1, `father horizontal scroll at ${width}`)
      assert.deepEqual(errors, [], `console errors at ${width}`)
      await context.close()
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
