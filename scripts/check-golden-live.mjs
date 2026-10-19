/**
 * Built-app gold follower. Fresh save, 375×667 and 390×844.
 * Taps only the one visible filled gold. Play screens are scripted.
 */
import assert from 'node:assert/strict'
import { mkdirSync, writeFileSync } from 'node:fs'
import { chromium } from 'playwright'
import { build, preview } from 'vite'
import { evidenceFor } from '../src/content/evidence.ts'
import { dailyForDate } from '../src/content/daily.ts'
import { findStraightSpelling } from '../src/lib/gemSearchGrid.ts'
import { easyChromeLine, easyWhyLine } from '../src/lib/easy.ts'
import { localDateKey } from '../src/lib/dates.ts'
import { SAVE_KIND } from '../src/lib/save.ts'
import { SAVE_SCHEMA_VERSION, STORAGE_KEY } from '../src/config/app.ts'

const GEM_WORDS = ['LARK', 'STEPS', 'TUNING', 'DESIGNER']
const SIZES = [
  [375, 667],
  [390, 844],
]
const SHOTS = '/opt/cursor/artifacts/screenshots'

function playScreens(id) {
  return id === 'maze' || id === 'run' || id === 'gem' || id === 'quiz' || id === 'sort' || id === 'match' || id === 'sequence'
}

async function launchBrowser() {
  try {
    return await chromium.launch({ headless: true })
  } catch {
    return await chromium.launch({ headless: true, channel: 'chrome' })
  }
}

async function filledGolds(page) {
  return page.evaluate(() => {
    const hits = []
    for (const el of document.querySelectorAll('button, a.btn')) {
      if (!(el instanceof HTMLElement)) continue
      if (el.closest('.easy-core')) continue
      if (el.closest('[hidden]')) continue
      const style = getComputedStyle(el)
      if (style.display === 'none' || style.visibility === 'hidden' || Number(style.opacity) === 0) continue
      const box = el.getBoundingClientRect()
      if (box.width <= 0 || box.height <= 0) continue
      const primary = el.classList.contains('primary')
      const coach = el.classList.contains('easy-coach-step') && Boolean(el.closest('li.is-now'))
      if (!primary && !coach) continue
      hits.push({
        text: (el.innerText || el.getAttribute('aria-label') || '').replace(/\s+/g, ' ').trim(),
        w: Math.round(box.width),
        h: Math.round(box.height),
        disabled: Boolean(el.disabled),
      })
    }
    return hits
  })
}

async function tapFilledGold(page) {
  const golds = await filledGolds(page)
  assert.equal(golds.length, 1, `one filled gold, saw ${JSON.stringify(golds)}`)
  await page.evaluate(() => {
    for (const el of document.querySelectorAll('button, a.btn')) {
      if (!(el instanceof HTMLElement)) continue
      if (el.closest('.easy-core')) continue
      if (el.closest('[hidden]')) continue
      const style = getComputedStyle(el)
      if (style.display === 'none' || style.visibility === 'hidden' || Number(style.opacity) === 0) continue
      const box = el.getBoundingClientRect()
      if (box.width <= 0 || box.height <= 0) continue
      const primary = el.classList.contains('primary')
      const coach = el.classList.contains('easy-coach-step') && Boolean(el.closest('li.is-now'))
      if (!primary && !coach) continue
      el.click()
      return
    }
    throw new Error('filled gold disappeared before the tap')
  })
  return golds[0]
}

async function screenId(page) {
  return page.evaluate(() => {
    const main = document.querySelector('main')
    if (document.querySelector('.defend-page')) return 'night-watch'
    if (document.querySelector('.welcome')) return 'welcome'
    if (document.querySelector('.play.is-road-maze.is-win')) return 'maze-win'
    if (document.querySelector('.play.is-road-maze')) return 'maze'
    if (document.querySelector('.play.is-father-run.is-win')) return 'run-win'
    if (document.querySelector('.run-miss')) return 'run-fail'
    if (document.querySelector('.play.is-father-run')) return 'run'
    if (document.querySelector('.play.is-gem-search.is-win')) return 'gem-win'
    if (document.querySelector('.play.is-gem-search')) return 'gem'
    if (document.querySelector('.play.is-easy-sort.is-win, .play.is-easy-sort.is-ready')) return 'sort-done'
    if (document.querySelector('.play.is-easy-sort')) return 'sort'
    if (document.querySelector('.play.is-match.is-win')) return 'match-win'
    if (document.querySelector('.play.is-match')) return 'match'
    if (document.querySelector('.strip-board.is-win')) return 'sequence-win'
    if (document.querySelector('.strip-board')) return 'sequence'
    if (document.querySelector('.why-blast.is-yes, .why-blast.is-win')) return 'quiz-done'
    if (document.querySelector('.why-blast')) return 'quiz'
    if (document.querySelector('.daily-page.is-teach, .teach-gate')) return 'read-teach'
    if (document.querySelector('.daily-page')) return 'read'
    if (main?.classList.contains('hub')) return 'home'
    if (document.querySelector('.settings, main.settings')) return 'settings'
    return main?.getAttribute('aria-label') || main?.className || 'unknown'
  })
}

async function signature(page) {
  const id = await screenId(page)
  const golds = await filledGolds(page)
  const detail = await page.evaluate(() => {
    const claim = document.querySelector('.why-claim, .recall-line, .teach-reason')?.textContent || ''
    const whisper = document.querySelector('.easy-home-whisper')?.textContent || ''
    return `${claim} ${whisper}`.replace(/\s+/g, ' ').trim().slice(0, 80)
  })
  return { id, golds, detail, sig: `${id}|${golds.map((gold) => gold.text).join('/')}||${detail}` }
}

function key(cell) {
  return `${cell.r}:${cell.c}`
}

function shortest(from, to, open) {
  const start = key(from)
  const goal = key(to)
  if (!open.has(start) || !open.has(goal)) return null
  if (start === goal) return [from]
  const dirs = [
    { r: -1, c: 0 },
    { r: 1, c: 0 },
    { r: 0, c: -1 },
    { r: 0, c: 1 },
  ]
  const seen = new Set([start])
  const queue = [[from]]
  while (queue.length) {
    const trail = queue.shift()
    const last = trail[trail.length - 1]
    for (const dir of dirs) {
      const next = { r: last.r + dir.r, c: last.c + dir.c }
      const nextKey = key(next)
      if (!open.has(nextKey) || seen.has(nextKey)) continue
      const walk = [...trail, next]
      if (nextKey === goal) return walk
      seen.add(nextKey)
      queue.push(walk)
    }
  }
  return null
}

async function readCell(loc) {
  const r = Number(await loc.getAttribute('data-r'))
  const c = Number(await loc.getAttribute('data-c'))
  if (!Number.isFinite(r) || !Number.isFinite(c)) throw new Error('maze cell has no coordinates')
  return { r, c }
}

async function tapMaze(page, cell) {
  const selector = `[data-maze-cell][data-r="${cell.r}"][data-c="${cell.c}"]`
  const loc = page.locator(selector)
  await loc.dispatchEvent('pointerdown', {
    bubbles: true,
    cancelable: true,
    pointerId: 1,
    pointerType: 'touch',
    isPrimary: true,
    button: 0,
    buttons: 1,
  })
  await page.evaluate((sel) => {
    const lift = (target) => {
      target.dispatchEvent(
        new PointerEvent('pointerup', {
          bubbles: true,
          cancelable: true,
          pointerId: 1,
          pointerType: 'touch',
          isPrimary: true,
        }),
      )
    }
    const node = document.querySelector(sel)
    if (node) lift(node)
    lift(window)
  }, selector)
}

async function playRoad(page) {
  await page.locator('[data-maze-cell].is-here').waitFor()
  const at = await readCell(page.locator('[data-maze-cell].is-here'))
  const cells = page.locator('[data-maze-cell].is-road')
  const count = await cells.count()
  for (let i = 0; i < count; i += 1) {
    const cell = await readCell(cells.nth(i))
    if (cell.r === at.r && cell.c === at.c) continue
    await tapMaze(page, cell)
    break
  }
  await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => resolve(undefined))))
  const hurt = await readCell(page.locator('[data-maze-cell].is-hurt'))
  const inn = await readCell(page.locator('[data-maze-cell].is-inn'))
  await walkUntil(page, hurt, false)
  await tapMaze(page, hurt)
  await page.locator('.play.is-road-maze.is-helped, .play.is-road-maze.is-win').waitFor()
  await walkUntil(page, inn, true)
  await page.locator('[data-maze-dock], .play.is-road-maze.is-win').first().waitFor({ timeout: 8000 })
}

async function walkUntil(page, target, winOnArrival) {
  for (let guard = 0; guard < 40; guard += 1) {
    const hereLoc = page.locator('[data-maze-cell].is-here')
    if ((await hereLoc.count()) === 0) return
    const at = await readCell(hereLoc)
    if (at.r === target.r && at.c === target.c) return
    const keys = await page.locator('[data-maze-cell].is-road').evaluateAll((nodes) =>
      nodes.map((node) => `${node.getAttribute('data-r')}:${node.getAttribute('data-c')}`),
    )
    const open = new Set(keys)
    const path = shortest(at, target, open)
    if (!path || path.length < 2) throw new Error(`no road from ${key(at)} to ${key(target)}`)
    const next = path[1]
    await tapMaze(page, next)
    if (winOnArrival && next.r === target.r && next.c === target.c) {
      await page.locator('.win-stamp', { hasText: 'Helped!' }).waitFor({ timeout: 8000 })
      return
    }
    await page.waitForFunction(
      ({ r, c }) => {
        const here = document.querySelector('[data-maze-cell].is-here')
        return here?.getAttribute('data-r') === String(r) && here?.getAttribute('data-c') === String(c)
      },
      next,
    )
  }
  throw new Error(`maze walk did not reach ${key(target)}`)
}

async function releaseRun(page, kind) {
  const pad = page.locator('[data-run-pad="hold"]')
  await pad.waitFor({ timeout: 15000 })
  await pad.scrollIntoViewIfNeeded()
  const box = await pad.boundingBox()
  if (!box) throw new Error('run pad has no box')
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
  await page.mouse.down()
  if (kind === 'late') {
    await page.waitForFunction(() => {
      const node = document.querySelector('[data-run-pad="hold"]')
      return (node?.getAttribute('aria-label') || '').includes('Now tap')
    })
    await page.waitForTimeout(500)
  } else {
    await page.waitForTimeout(160)
    const label = (await pad.getAttribute('aria-label')) || ''
    assert.doesNotMatch(label, /Now tap/, 'early release is before the glow')
  }
  await page.mouse.up()
  await page.locator('.run-miss').waitFor({ timeout: 16000 })
  await page.waitForTimeout(400)
}

async function tapRunFailGold(page) {
  const btn = page.locator('.run-miss .btn.primary')
  await btn.waitFor()
  const cls = (await btn.getAttribute('class')) || ''
  assert.match(cls, /\bprimary\b/, 'run-fail gold is .btn.primary')
  assert.doesNotMatch(cls, /\bgold\b/, 'run-fail gold is not the pale .btn.gold')
  const golds = await filledGolds(page)
  assert.equal(golds.length, 1, `run-fail has one filled gold ${JSON.stringify(golds)}`)
  await btn.click()
  await page.waitForTimeout(250)
  assert.equal(await page.locator('[aria-label="Choose a map"]').count(), 0, 'run-fail gold did not open Choose a map')
  assert.equal(await page.locator('.nw-map-overlay').count(), 0, 'run-fail gold did not open the map overlay')
  assert.equal(await page.locator('.defend-page').count(), 0, 'run-fail gold did not open Night Watch')
  assert.equal(await page.locator('.play.is-father-run').count(), 1, 'run-fail gold stays on the father run')
}

/** Gold-only. Miss 1 is a late glow release. Miss 2 is an early release, then Keep going. */
async function hugFatherHuman(page) {
  await releaseRun(page, 'late')
  const again = ((await page.locator('.run-miss .btn.primary').innerText()) || '').replace(/\s+/g, ' ').trim()
  assert.equal(again, 'Run again', 'miss 1 gold is Run again')
  assert.equal(await page.locator('[data-run-keep]').count(), 0, 'miss 1 has no Keep going')
  await tapRunFailGold(page)
  await page.locator('[data-run-pad="hold"]').waitFor()

  await releaseRun(page, 'early')
  const keep = page.locator('[data-run-keep]')
  const keepLabel = ((await keep.innerText()) || '').replace(/\s+/g, ' ').trim()
  assert.equal(keepLabel, 'Keep going', 'miss 2 gold is Keep going')
  const keepCls = (await keep.getAttribute('class')) || ''
  assert.match(keepCls, /\bprimary\b/, 'Keep going is .btn.primary')
  const plain = page.locator('.run-miss button', { hasText: /^Run again$/ })
  assert.equal(await plain.count(), 1, 'Run again stays visible')
  const plainCls = (await plain.getAttribute('class')) || ''
  assert.doesNotMatch(plainCls, /\bprimary\b/, 'Run again is a plain button on miss 2')
  const golds = await filledGolds(page)
  assert.equal(golds.length, 1, `miss 2 has one filled gold ${JSON.stringify(golds)}`)
  assert.match(golds[0].text, /Keep going/)
  await page.screenshot({ path: `${SHOTS}/run-fail-keep-going-375.png` })
  await tapRunFailGold(page)
  await page.locator('.play.is-father-run.is-win .btn.primary').waitFor({ timeout: 8000 })
}

async function hugFather(page) {
  const pad = page.locator('[data-run-pad="hold"]')
  await pad.waitFor({ timeout: 15000 })
  await pad.scrollIntoViewIfNeeded()
  const press = async () => {
    const box = await pad.boundingBox()
    if (!box) throw new Error('run pad has no box')
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
    await page.mouse.down()
  }
  await press()
  const start = Date.now()
  while (Date.now() - start < 12000) {
    if (await page.locator('.play.is-father-run.is-win').count()) {
      await page.mouse.up().catch(() => {})
      return
    }
    if (await page.locator('.run-miss').count()) {
      await page.mouse.up().catch(() => {})
      throw new Error('father run missed')
    }
    const label = await pad.getAttribute('aria-label')
    if (label && (label.includes('Now tap') || label.includes('Let go'))) {
      await page.mouse.up()
      await page.waitForTimeout(30)
      await press()
      await page.waitForTimeout(90)
    } else {
      await page.waitForTimeout(50)
    }
  }
  throw new Error('father run did not hug')
}

async function readGrid(page) {
  return page.evaluate(() => {
    const cells = [...document.querySelectorAll('[data-gem-cell]')]
    let size = 0
    for (const cell of cells) {
      size = Math.max(size, Number(cell.getAttribute('data-r')) + 1, Number(cell.getAttribute('data-c')) + 1)
    }
    const grid = Array.from({ length: size }, () => Array(size).fill(''))
    for (const cell of cells) {
      const r = Number(cell.getAttribute('data-r'))
      const c = Number(cell.getAttribute('data-c'))
      grid[r][c] = (cell.querySelector('.gem-letter')?.textContent || '').trim()
    }
    return grid
  })
}

async function dragPath(page, path) {
  const first = page.locator(`[data-gem-cell][data-r="${path[0].r}"][data-c="${path[0].c}"]`)
  const start = await first.boundingBox()
  if (!start) throw new Error('gem cell has no box')
  await page.mouse.move(start.x + start.width / 2, start.y + start.height / 2)
  await page.mouse.down()
  for (const cell of path.slice(1)) {
    const box = await page.locator(`[data-gem-cell][data-r="${cell.r}"][data-c="${cell.c}"]`).boundingBox()
    if (!box) throw new Error('gem step has no box')
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 6 })
  }
  await page.mouse.up()
}

async function playGem(page) {
  await page.locator('[data-gem-cell]').first().waitFor()
  for (const word of GEM_WORDS) {
    if (await page.locator('.play.is-gem-search.is-win').count()) return
    const letters = await readGrid(page)
    const path = findStraightSpelling(letters, word)
    if (!path) throw new Error(`ob-tuning word ${word} is not on the board`)
    await dragPath(page, path)
    await page.waitForTimeout(280)
  }
  await page.locator('.play.is-gem-search.is-win').waitFor({ timeout: 8000 })
}

async function answerQuiz(page, id) {
  const brief = evidenceFor(id)
  assert.ok(brief, `evidence for ${id}`)
  const why = easyWhyLine(brief.reason)
  const chip = page.locator('button.why-chip', { hasText: why }).first()
  await chip.waitFor({ timeout: 8000 })
  await chip.click()
  await page.locator('.why-blast.is-yes, .why-blast.is-win').first().waitFor({ timeout: 8000 })
}

async function solveMatch(page, challenge) {
  for (const pair of challenge.pairs) {
    const claim = page.locator('.match-col.is-claims button', { hasText: pair.right }).first()
    await claim.waitFor()
    await claim.click()
    await page.waitForTimeout(200)
  }
  const next = page.getByRole('button', { name: 'Lock In next' })
  if (await next.count()) await next.click()
}

async function solveSort(page, challenge) {
  for (let i = 0; i < challenge.tiles.length; i += 1) {
    const line = ((await page.locator('.sort-one-line').innerText()) || '').replace(/\s+/g, ' ')
    const tile = challenge.tiles.find((item) => {
      const face = easyChromeLine(item.text)
      return line.includes(face.slice(0, 28)) || line.includes(item.text.slice(0, 28))
    })
    if (!tile) throw new Error(`sort line not in the daily: ${line}`)
    await page.getByRole('button', { name: tile.bin === 'keep' ? 'Keep' : 'Toss', exact: true }).click()
    await page.waitForTimeout(150)
  }
}

async function solveSequence(page, challenge) {
  for (const item of challenge.items) {
    const label = item.easyText || item.text
    await page.getByRole('button', { name: label, exact: true }).click()
    await page.waitForTimeout(180)
  }
}

async function finishRead(page, puzzle) {
  const kind = puzzle.challenge.kind
  if (kind === 'match') await solveMatch(page, puzzle.challenge)
  else if (kind === 'sort') await solveSort(page, puzzle.challenge)
  else if (kind === 'sequence') await solveSequence(page, puzzle.challenge)
  else throw new Error(`day-2 daily kind ${kind} is not in the early pool solver`)
  for (let guard = 0; guard < 10; guard += 1) {
    if ((await page.locator('.daily-page').count()) === 0 && (await screenId(page)) === 'home') return
    const quizOpen = await page.locator('.why-blast').count()
    const quizWon = await page.locator('.why-blast.is-yes, .why-blast.is-win').count()
    if (quizOpen && !quizWon) {
      await answerQuiz(page, puzzle.challenge.id)
      continue
    }
    const step = page.locator('.why-blast .btn.primary, .town-return .btn.primary').first()
    if (await step.count()) {
      await step.click()
      await page.waitForTimeout(250)
      continue
    }
    await page.waitForTimeout(200)
  }
  assert.equal(await screenId(page), 'home', `day-2 Read returns Home (${puzzle.challenge.kind})`)
}

export async function checkGoldenLive() {
  await build({ logLevel: 'warn' })
  const server = await preview({
    preview: { host: '127.0.0.1', port: 0 },
    logLevel: 'warn',
  })
  const address = server.httpServer?.address()
  const port = typeof address === 'object' && address ? address.port : 4173
  const origin = `http://127.0.0.1:${port}/`
  const browser = await launchBrowser()
  const traces = []
  mkdirSync(SHOTS, { recursive: true })
  try {
    for (const [width, height] of SIZES) {
      const trace = []
      const seen = new Set()
      const context = await browser.newContext({ viewport: { width, height } })
      const page = await context.newPage()
      const errors = []
      page.on('pageerror', (error) => errors.push(String(error)))
      await page.goto(origin)
      await page.locator('.welcome').waitFor()

      async function stamp(label) {
        const shot = await signature(page)
        trace.push(`${width}x${height} ${label} ${shot.sig} n=${shot.golds.length}`)
        assert.ok(!seen.has(shot.sig), `repeated screen ${shot.sig}`)
        seen.add(shot.sig)
        assert.notEqual(shot.id, 'night-watch', 'gold follower opened Night Watch')
        assert.equal(await page.locator('.defend-page').count(), 0)
        if (playScreens(shot.id)) assert.equal(shot.golds.length, 0, `${label} play screen has a filled gold`)
        else assert.equal(shot.golds.length, 1, `${label} needs one filled gold ${JSON.stringify(shot.golds)}`)
        return shot
      }

      let shot = await stamp('welcome')
      assert.equal(shot.id, 'welcome')
      assert.equal(shot.golds[0].disabled, false)
      await tapFilledGold(page)
      await page.locator('main.hub').waitFor()

      shot = await stamp('home-fresh')
      assert.equal(shot.id, 'home')
      const freshDock = (await page.locator('.easy-home-whisper').innerText()).replace(/\s+/g, ' ').trim()
      const freshGift = (await page.locator('.easy-build-gift').innerText()).replace(/\s+/g, ' ').trim()
      assert.equal(freshDock, 'Start your first road.', 'first Home dock is a first road')
      assert.equal(freshGift, 'Start your first road.', 'first Home gift matches the dock')
      assert.doesNotMatch(`${freshDock} ${freshGift}`, /One more/, 'One more waits until a road is done')
      assert.doesNotMatch(shot.golds[0].text, /Read/, 'first session gold is not Read')
      assert.match(await page.locator('.easy-home-steps li').first().innerText(), /tomorrow/)
      assert.equal(shot.golds[0].disabled, false, 'session 1 lesson step stays enabled')
      assert.equal(await page.locator('.easy-night-watch').count(), 0, 'Night Watch is hidden before the first Lock In')
      if (width === 375) await page.screenshot({ path: `${SHOTS}/easy-home-fresh-375.png` })
      await tapFilledGold(page)

      await page.locator('.play.is-road-maze').waitFor()
      await stamp('maze')
      await playRoad(page)
      await page.locator('[data-maze-next]').waitFor()
      shot = await stamp('maze-win')
      assert.equal(shot.id, 'maze-win')
      assert.match(shot.golds[0].text, /Lock In/)
      await tapFilledGold(page)

      await page.locator('.why-blast').waitFor()
      await stamp('quiz-road')
      await answerQuiz(page, 'ph-road')
      await page.locator('.why-blast.is-yes .btn.primary, .why-blast.is-win .btn.primary').first().waitFor()
      shot = await stamp('quiz-road-done')
      assert.match(shot.golds[0].text, /Continue/)
      assert.match(await page.locator('.why-got-it').innerText(), /You got it/)
      if (width === 375) await page.screenshot({ path: `${SHOTS}/lock-in-you-got-it-375.png` })
      await tapFilledGold(page)

      await page.locator('main.hub').waitFor()
      shot = await stamp('home-after-road')
      assert.equal(await page.locator('.easy-night-watch').count(), 1, 'Night Watch returns after the first Lock In')
      const nwClass = await page.locator('.easy-night-watch button').getAttribute('class')
      assert.doesNotMatch(nwClass || '', /gold|primary/, 'Night Watch stays secondary')
      const roadGift = (await page.locator('.easy-build-gift').innerText()).replace(/\s+/g, ' ')
      assert.doesNotMatch(roadGift, /Build this/, 'Home gift does not say Build this while gold is Run')
      assert.match(roadGift, /run/i)
      assert.match(shot.golds[0].text, /Run/)
      if (width === 375) {
        await page.screenshot({ path: `${SHOTS}/easy-home-after-lock-in-375.png` })
        await page.screenshot({ path: `${SHOTS}/home-run-copy-375.png` })
      }
      await tapFilledGold(page)

      await page.locator('[data-run-pad], .play.is-father-run').first().waitFor()
      await stamp('run')
      await hugFather(page)
      await page.locator('.play.is-father-run.is-win .btn.primary').waitFor()
      shot = await stamp('run-win')
      assert.equal(shot.id, 'run-win')
      assert.match(shot.golds[0].text, /Lock In/)
      await tapFilledGold(page)
      await page.locator('.why-blast').waitFor()
      await stamp('quiz-father')
      await answerQuiz(page, 'ph-father')
      await page.locator('.why-blast.is-yes .btn.primary, .why-blast.is-win .btn.primary').first().waitFor()
      shot = await stamp('quiz-father-done')
      assert.match(shot.golds[0].text, /Continue/)
      assert.match(await page.locator('.why-got-it').innerText(), /You got it/)
      await tapFilledGold(page)

      await page.locator('main.hub').waitFor()
      shot = await stamp('home-tuning')
      assert.doesNotMatch(shot.golds[0].text, /Read/)
      await tapFilledGold(page)

      await page.locator('.play.is-gem-search').waitFor()
      await stamp('gem')
      await playGem(page)
      await page.locator('.play.is-gem-search.is-win .btn.primary').waitFor()
      shot = await stamp('gem-win')
      assert.equal(shot.id, 'gem-win')
      assert.match(shot.golds[0].text, /Lock In/)
      assert.doesNotMatch(shot.golds[0].text, /One more/)
      const homeInk = await page.locator('.cta-dock .btn', { hasText: 'Home' }).evaluate((el) => getComputedStyle(el).color)
      const channels = homeInk.match(/\d+/g)?.map(Number) ?? []
      assert.ok(channels.length >= 3 && Math.max(...channels.slice(0, 3)) < 90, `Home ink is readable (${homeInk})`)
      if (width === 375) await page.screenshot({ path: `${SHOTS}/gem-win-375.png` })
      await tapFilledGold(page)
      await page.locator('.why-blast').waitFor()
      shot = await stamp('quiz-tuning')
      assert.equal(shot.id, 'quiz', 'word-search gold opens the Lock In quiz')
      assert.equal(await page.locator('.play.is-gem-search').count(), 0, 'the gold tap did not replay the word search')

      if (width === 375) {
        await page.getByRole('button', { name: 'Settings' }).click()
        await page.locator('.settings-card').first().waitFor()
        const eyebrow = (await page.locator('.settings-card').first().locator('.eyebrow').innerText()).trim()
        assert.equal(eyebrow.toLowerCase(), 'reading', 'Settings opens on the Reading card')
        await page.screenshot({ path: `${SHOTS}/settings-reading-375.png` })
      }

      assert.equal(errors.join('\n'), '', `${width} page errors`)
      traces.push(trace.join('\n'))
      await context.close()
    }

    const today = localDateKey()
    const puzzle = dailyForDate(today, 1)
    const daySave = {
      kind: SAVE_KIND,
      schemaVersion: SAVE_SCHEMA_VERSION,
      appVersion: '1.4.503',
      savedAt: '2026-10-18T00:00:00.000Z',
      progress: {
        started: true,
        easyMode: true,
        theme: 'candy',
        completed: [],
        lastDailyDate: '2020-01-01',
        dailyDates: ['2020-01-01'],
        held: ['ph-road'],
        easyHeld: ['ph-road'],
      },
    }
    const context = await browser.newContext({ viewport: { width: 375, height: 667 } })
    await context.addInitScript(
      ([key, raw]) => {
        localStorage.clear()
        localStorage.setItem(key, raw)
      },
      [STORAGE_KEY, JSON.stringify(daySave)],
    )
    const page = await context.newPage()
    await page.goto(origin)
    await page.locator('main.hub').waitFor()
    const home = await signature(page)
    traces.push(`day-2 home ${home.sig} n=${home.golds.length} daily=${puzzle.challenge.kind}:${puzzle.challenge.id}`)
    assert.equal(home.golds.length, 1, 'day-2 home has one gold')
    assert.match(home.golds[0].text, /Read/, 'day-2 home gold is Read')
    assert.doesNotMatch(await page.locator('.easy-home-steps li').first().innerText(), /tomorrow/)
    await tapFilledGold(page)
    await page.locator('.daily-page, .teach-gate').first().waitFor()
    const teach = await signature(page)
    traces.push(`day-2 teach ${teach.sig} n=${teach.golds.length}`)
    assert.equal(teach.golds.length, 1, 'Read teach has one gold')
    await tapFilledGold(page)
    await finishRead(page, puzzle)
    await page.locator('main.hub').waitFor()
    if (await page.locator('.scene-ad').count()) {
      traces.push('day-2 quiet pause sits over Home; continue, then the lesson gold')
      await page.getByRole('button', { name: 'Continue the trail' }).click()
      await page.locator('.scene-ad').waitFor({ state: 'detached' })
    }
    const after = await signature(page)
    traces.push(`day-2 after-read ${after.sig} n=${after.golds.length}`)
    assert.equal(after.golds.length, 1, 'after Read, Home has one gold')
    assert.doesNotMatch(after.golds[0].text, /Read/, 'after Read, gold is the next Easy lesson')
    assert.equal(after.golds[0].disabled, false, 'the next lesson step is enabled after Read')
    await context.close()

    const human = await browser.newContext({ viewport: { width: 375, height: 667 } })
    const humanPage = await human.newPage()
    const humanErrors = []
    humanPage.on('pageerror', (error) => humanErrors.push(String(error)))
    await humanPage.goto(origin)
    await humanPage.locator('.welcome').waitFor()
    const humanTrace = []
    const humanSeen = new Set()
    async function humanStamp(label) {
      const shot = await signature(humanPage)
      humanTrace.push(`375x667 human ${label} ${shot.sig} n=${shot.golds.length}`)
      assert.ok(!humanSeen.has(shot.sig), `human repeated screen ${shot.sig}`)
      humanSeen.add(shot.sig)
      assert.notEqual(shot.id, 'night-watch', 'human gold follower opened Night Watch')
      if (playScreens(shot.id)) assert.equal(shot.golds.length, 0, `${label} play screen has a filled gold`)
      else assert.equal(shot.golds.length, 1, `${label} needs one filled gold ${JSON.stringify(shot.golds)}`)
      return shot
    }
    await humanStamp('welcome')
    await tapFilledGold(humanPage)
    await humanPage.locator('main.hub').waitFor()
    await humanStamp('home-fresh')
    const humanFresh = (await humanPage.locator('.easy-build-gift').innerText()).replace(/\s+/g, ' ').trim()
    assert.equal(humanFresh, 'Start your first road.')
    await tapFilledGold(humanPage)
    await humanPage.locator('.play.is-road-maze').waitFor()
    await humanStamp('maze')
    await playRoad(humanPage)
    await humanPage.locator('[data-maze-next]').waitFor()
    await humanStamp('maze-win')
    await tapFilledGold(humanPage)
    await humanPage.locator('.why-blast').waitFor()
    await humanStamp('quiz-road')
    await answerQuiz(humanPage, 'ph-road')
    await humanPage.locator('.why-blast.is-yes .btn.primary').waitFor()
    await humanStamp('quiz-road-done')
    await tapFilledGold(humanPage)
    await humanPage.locator('main.hub').waitFor()
    await humanStamp('home-after-road')
    await tapFilledGold(humanPage)
    await humanPage.locator('[data-run-pad], .play.is-father-run').first().waitFor()
    await humanStamp('run')
    await hugFatherHuman(humanPage)
    await humanStamp('run-win')
    await tapFilledGold(humanPage)
    await humanPage.locator('.why-blast').waitFor()
    await humanStamp('quiz-father')
    await answerQuiz(humanPage, 'ph-father')
    await humanPage.locator('.why-got-it').waitFor()
    const humanGot = await humanStamp('quiz-father-done')
    assert.match(humanGot.golds[0].text, /Continue/)
    await tapFilledGold(humanPage)
    await humanPage.locator('main.hub').waitFor()
    const humanHome = await humanStamp('home-tuning')
    const humanGift = (await humanPage.locator('.easy-build-gift').innerText()).replace(/\s+/g, ' ')
    assert.doesNotMatch(humanGift, /Build this/)
    assert.doesNotMatch(humanHome.golds[0].text, /Read/)
    await tapFilledGold(humanPage)
    await humanPage.locator('.play.is-gem-search').waitFor()
    await humanStamp('gem')
    await playGem(humanPage)
    await humanPage.locator('.play.is-gem-search.is-win .btn.primary').waitFor()
    const humanGem = await humanStamp('gem-win')
    assert.match(humanGem.golds[0].text, /Lock In/)
    await tapFilledGold(humanPage)
    await humanPage.locator('.why-blast').waitFor()
    const humanScience = await humanStamp('quiz-tuning')
    assert.equal(humanScience.id, 'quiz', 'human-like Run still reaches ob-tuning Lock In')
    assert.equal(await humanPage.locator('.play.is-gem-search').count(), 0)
    assert.equal(humanErrors.join('\n'), '', 'human page errors')
    traces.push(humanTrace.join('\n'))
    await human.close()
  } finally {
    await browser.close()
    await server.close()
  }
  const text = traces.join('\n\n')
  mkdirSync('/opt/cursor/artifacts', { recursive: true })
  writeFileSync('/opt/cursor/artifacts/golden-live-trace.txt', text)
  console.log(text)
  console.log('check-golden-live: ok')
}

if (process.argv[1] && import.meta.url.endsWith(process.argv[1].split('/').pop())) {
  await checkGoldenLive()
}
