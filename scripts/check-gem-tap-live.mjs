#!/usr/bin/env node
/**
 * Easy word search tap path + chip-prefix bonus guard (ph-seeds, ob-tuning, hl-mind).
 * Real pointer / touch only. Boards pinned with ?gemSeed=0.
 */
import assert from 'node:assert/strict'
import { mkdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { chromium } from '@playwright/test'
import { createServer } from 'vite'
import { APP_VERSION, STORAGE_KEY } from '../src/config/app.ts'
import { EASY } from '../src/lib/easyUi.ts'
import { buildGemPuzzle, extendStraightTap, GEM_TAP_MAX_MS, GEM_TAP_MAX_TRAVEL_PX, gemWordsFor } from '../src/lib/gemSearch.ts'
import { packLesson } from '../src/content/packCatalog.ts'
import { withPlaytest1 } from './dev-ui-playtest.mjs'

const LESSONS = ['ph-seeds', 'ob-tuning', 'hl-mind']
const VIEWPORTS = [
  [375, 667],
  [390, 844],
]
const SHOT_ROOT = process.env.GEM_TAP_SHOT_ROOT ?? join(tmpdir(), 'gemsearch-fix')
const POP_SHOT_ROOT =
  process.env.GEM_POP_SHOT_ROOT ?? join(tmpdir(), 'gemsearch-fix', 'pops')

function savePayload() {
  const now = new Date()
  const today = [now.getFullYear(), String(now.getMonth() + 1).padStart(2, '0'), String(now.getDate()).padStart(2, '0')].join('-')
  return {
    kind: 'silver-city-save',
    schemaVersion: 1,
    appVersion: '1.4.555',
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
    },
  }
}

async function launchBrowser() {
  try {
    return await chromium.launch({ headless: true })
  } catch {
    return await chromium.launch({ headless: true, channel: 'chrome' })
  }
}

async function pointerClick(page, locator) {
  await locator.scrollIntoViewIfNeeded()
  const box = await locator.boundingBox()
  assert.ok(box && box.width > 0 && box.height > 0, 'pointer target has no box')
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
  await page.mouse.down()
  await page.mouse.up()
}

async function openLesson(page, origin, lineId, seed = 0) {
  await page.goto(withPlaytest1(`${origin}?gemSeed=${seed}`))
  await page.getByRole('main', { name: 'Home' }).waitFor()
  await pointerClick(page, page.getByRole('button', { name: 'Settings', exact: true }))
  await pointerClick(page, page.locator('details.settings-debug summary'))
  const label = packLesson(lineId)?.title ?? lineId
  await pointerClick(
    page,
    page.locator('details.settings-debug').getByRole('button', { name: new RegExp(`^${lineId} ·`) }).first(),
  )
  await page.locator('.gem-board').waitFor()
  const board = buildGemPuzzle(lineId, seed)
  assert.equal(
    (await page.evaluate(() => [...document.querySelectorAll('.gem-letter')].map((n) => n.textContent).join(''))),
    board.letters.map((row) => row.join('')).join(''),
    `${lineId} board matches gemSeed ${seed}`,
  )
  return board
}

function locateWord(letters, word) {
  const size = letters.length
  for (let r = 0; r < size; r += 1) {
    for (let c = 0; c < size; c += 1) {
      for (const [dr, dc] of [
        [0, 1],
        [1, 0],
        [1, 1],
        [0, -1],
        [-1, 0],
        [-1, -1],
        [1, -1],
        [-1, 1],
      ]) {
        const path = []
        let ok = true
        for (let i = 0; i < word.length; i += 1) {
          const rr = r + dr * i
          const cc = c + dc * i
          if (rr < 0 || rr >= size || cc < 0 || cc >= size || letters[rr][cc] !== word[i]) {
            ok = false
            break
          }
          path.push({ r: rr, c: cc })
        }
        if (ok && path.length === word.length) return path
      }
    }
  }
  return null
}

async function cellCentre(page, cell) {
  const box = await page.locator(`[data-gem-cell][data-r="${cell.r}"][data-c="${cell.c}"]`).boundingBox()
  assert.ok(box, `cell ${cell.r}:${cell.c} has no box`)
  return { x: box.x + box.width / 2, y: box.y + box.height / 2 }
}

async function dragPath(page, path) {
  const steps = path.length <= 3 ? 12 : 5
  const first = await cellCentre(page, path[0])
  await page.mouse.move(first.x, first.y)
  await page.mouse.down()
  for (const cell of path.slice(1)) {
    const at = await cellCentre(page, cell)
    await page.mouse.move(at.x, at.y, { steps })
  }
  await page.waitForTimeout(40)
  await page.mouse.up()
}

async function tapPath(page, path, touch = false) {
  for (const cell of path) {
    const at = await cellCentre(page, cell)
    if (touch) {
      await page.touchscreen.tap(at.x, at.y)
    } else {
      await page.mouse.move(at.x, at.y)
      await page.mouse.down()
      await page.mouse.up()
    }
    await page.waitForTimeout(250)
  }
}

async function foundCount(page) {
  return page.locator('.match-teach-chip.is-found').count()
}

async function layoutMetrics(page) {
  return page.evaluate(() => {
    const cell = document.querySelector('[data-gem-cell]')
    const board = document.querySelector('.gem-board')
    const stage = document.querySelector('.gem-stage')
    const play = document.querySelector('.play.is-gem-search.is-panel-blast')
    const dock = document.querySelector('.match-teach-dock, .story-strip.is-dock')
    const score = document.querySelector('.match-score, .gem-jar-slot')
    const cb = cell?.getBoundingClientRect()
    const bb = board?.getBoundingClientRect()
    const sb = stage?.getBoundingClientRect()
    const pr = play?.getBoundingClientRect()
    const style = play ? getComputedStyle(play) : null
    const padL = style ? parseFloat(style.paddingLeft) || 0 : 0
    const padR = style ? parseFloat(style.paddingRight) || 0 : 0
    const playTop = dock?.getBoundingClientRect().bottom ?? pr?.top ?? 0
    const playBottom = score?.getBoundingClientRect().top ?? pr?.bottom ?? window.innerHeight
    const playH = Math.max(0, playBottom - playTop)
    return {
      cellW: cb ? Math.round(cb.width) : 0,
      cellH: cb ? Math.round(cb.height) : 0,
      boardH: bb ? Math.round(bb.height) : 0,
      boardW: bb ? Math.round(bb.width) : 0,
      boardLeft: bb ? Math.round(bb.left) : 0,
      boardRight: bb ? Math.round(bb.right) : 0,
      cardInnerLeft: pr ? Math.round(pr.left + padL) : 0,
      cardInnerRight: pr ? Math.round(pr.right - padR) : 0,
      playH: Math.round(playH),
      stageH: sb ? Math.round(sb.height) : 0,
      boardY: bb ? Math.round(bb.y) : 0,
      vh: window.innerHeight,
      docH: document.documentElement.scrollHeight,
      scrollY: window.scrollY,
    }
  })
}

async function assertBoardInCard(page, tag) {
  const m = await layoutMetrics(page)
  assert.ok(m.boardW > 0, `${tag} board has width`)
  assert.ok(
    m.boardLeft >= m.cardInnerLeft - 1 && m.boardRight <= m.cardInnerRight + 1,
    `${tag} board inside card padding (${m.boardLeft}-${m.boardRight} in ${m.cardInnerLeft}-${m.cardInnerRight})`,
  )
}

async function assertPlayAreaFill(page, tag) {
  const m = await layoutMetrics(page)
  assert.ok(m.playH > 0, `${tag} play band has height`)
  const innerW = m.cardInnerRight - m.cardInnerLeft
  const target = Math.min(innerW, m.playH)
  assert.ok(
    Math.min(m.boardW, m.boardH) >= target * 0.7 - 4,
    `${tag} board fills >=70% of dock-to-score band (${Math.min(m.boardW, m.boardH)}/${target})`,
  )
}

async function assertNoPopOverlap(page, tag) {
  const hit = await page.evaluate(() => {
    const cells = [...document.querySelectorAll('[data-gem-cell]')].map((el) => el.getBoundingClientRect())
    const pops = [
      ...document.querySelectorAll('.gem-hint-slot .gem-score-pop, .gem-hint-slot .gem-find-pop, .gem-hint-slot .bonus-plus'),
      ...document.querySelectorAll('.gem-hint-slot .gem-combo, .gem-hint-slot .bonus-banner, .gem-hint-slot .miss-banner, .gem-hint-slot .match-toast'),
      ...document.querySelectorAll('.gem-score-pop, .gem-find-pop, .bonus-plus'),
      ...document.querySelectorAll('.gem-stage .bonus-banner, .gem-stage .miss-banner, .gem-stage .match-toast'),
    ]
      .filter((el) => {
        const style = getComputedStyle(el)
        return style.display !== 'none' && style.visibility !== 'hidden' && Number(style.opacity) > 0.05
      })
      .map((el) => el.getBoundingClientRect())
    for (const pop of pops) {
      if (pop.width < 1 || pop.height < 1) continue
      for (const cell of cells) {
        if (cell.width < 1) continue
        if (cell.left < pop.right && cell.right > pop.left && cell.top < pop.bottom && cell.bottom > pop.top) {
          return true
        }
      }
    }
    return false
  })
  assert.equal(hit, false, `${tag} no score pop overlaps a cell`)
}

async function assertNoBannerOverlap(page, tag) {
  const hit = await page.evaluate(() => {
    const cells = [...document.querySelectorAll('[data-gem-cell]')].map((el) => el.getBoundingClientRect())
    const banners = [
      ...document.querySelectorAll('.gem-hint-slot .bonus-banner, .gem-hint-slot .miss-banner, .gem-hint-slot .match-toast, .gem-hint-slot .gem-combo'),
      ...document.querySelectorAll('.gem-stage .bonus-banner, .gem-stage .miss-banner, .gem-stage .match-toast'),
    ]
      .filter((el) => {
        const style = getComputedStyle(el)
        return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0'
      })
      .map((el) => el.getBoundingClientRect())
    for (const banner of banners) {
      if (banner.width < 1 || banner.height < 1) continue
      for (const cell of cells) {
        if (cell.width < 1) continue
        if (cell.left < banner.right && cell.right > banner.left && cell.top < banner.bottom && cell.bottom > banner.top) {
          return true
        }
      }
    }
    return false
  })
  assert.equal(hit, false, `${tag} no banner overlaps a cell`)
}

async function playWords(page, lineId, mode) {
  const letters = await page.evaluate(() => {
    const size = 8
    const grid = []
    for (let r = 0; r < size; r += 1) {
      const row = []
      for (let c = 0; c < size; c += 1) {
        const el = document.querySelector(`[data-gem-cell][data-r="${r}"][data-c="${c}"] .gem-letter`)
        row.push((el?.textContent ?? '').trim())
      }
      grid.push(row)
    }
    return grid
  })
  const words = gemWordsFor(lineId).map((w) => w.text)
  let boardY0 = null
  for (let i = 0; i < words.length; i += 1) {
    const word = words[i]
    const path = locateWord(letters, word)
    assert.ok(path, `${lineId} locates ${word}`)
    if (boardY0 == null) {
      boardY0 = (await layoutMetrics(page)).boardY
    }
    const before = await foundCount(page)
    if (mode === 'drag') await dragPath(page, path)
    else await tapPath(page, path, true)
    await page.waitForTimeout(mode === 'drag' ? 1100 : 900)
    let after = await foundCount(page)
    if (after === before && mode === 'drag') {
      await dragPath(page, path)
      await page.waitForTimeout(1100)
      after = await foundCount(page)
    }
    assert.equal(after, i + 1, `${lineId} ${mode} ${word} => ${i + 1}/4 (saw ${after})`)
    if (i === 0) {
      const after = await layoutMetrics(page)
      assert.equal(after.boardY, boardY0, `${lineId} board Y stable after first find (${boardY0} -> ${after.boardY})`)
      const hint = page.locator('[data-gem-start]')
      assert.equal(await hint.count(), 1, `${lineId} hint slot stays mounted`)
      assert.match((await hint.innerText()).trim(), /^\s*$/, `${lineId} hint text clears but slot remains`)
    }
    await assertNoBannerOverlap(page, `${lineId} ${word}`)
    await assertNoPopOverlap(page, `${lineId} ${word}`)
  }
  await page.locator('.play.is-gem-search.is-win').waitFor({ timeout: 15000 })
}

async function tapCell(page, cell) {
  const at = await cellCentre(page, cell)
  await page.touchscreen.tap(at.x, at.y)
}

async function assertWinNoScroll(page, tag) {
  await page.waitForTimeout(600)
  const bad = await page.evaluate(() => {
    const hits = []
    for (const sel of ['.challenge-page.is-puzzle', '.play.is-gem-search.is-win']) {
      const el = document.querySelector(sel)
      if (!el) continue
      if (el.scrollWidth > el.clientWidth + 1) hits.push(`${sel}-x`)
      if (el.scrollHeight > el.clientHeight + 1) hits.push(`${sel}-y`)
    }
    const card = document.querySelector('.play.is-gem-search.is-win .match-yes')
    if (card && (card.scrollWidth > card.clientWidth + 1 || card.scrollHeight > card.clientHeight + 1)) {
      hits.push('match-yes')
    }
    return hits
  })
  assert.deepEqual(bad, [], `${tag} win without scrollbars (${bad.join(', ')})`)
}

async function assertObTuningMisdragThenDrag(page, origin) {
  mkdirSync(POP_SHOT_ROOT, { recursive: true })
  await openLesson(page, origin, 'ob-tuning', 0)
  const board = buildGemPuzzle('ob-tuning', 0)
  const lark = board.words.find((word) => word.text === 'LARK')
  const steps = board.words.find((word) => word.text === 'STEPS')
  assert.ok(lark && steps, 'ob-tuning LARK and STEPS')
  await dragPath(page, board.paths[lark.id])
  await page.waitForTimeout(900)
  assert.equal(await foundCount(page), 1, 'LARK found by drag')
  const wrong = [
    { r: 0, c: 0 },
    { r: 0, c: 1 },
    { r: 0, c: 2 },
  ]
  await dragPath(page, wrong)
  await page.waitForTimeout(600)
  await dragPath(page, board.paths[steps.id])
  await page.waitForTimeout(1100)
  const after = await foundCount(page)
  if (after < 2) {
    await dragPath(page, board.paths[steps.id])
    await page.waitForTimeout(1100)
  }
  assert.equal(await foundCount(page), 2, 'STEPS drag works after mis-drag')
  await page.screenshot({ path: join(POP_SHOT_ROOT, 'ob-tuning-375-misdrag-then-drag.png') })
}

async function assertStepDragThenSteps(page, origin, w, shot = false) {
  mkdirSync(POP_SHOT_ROOT, { recursive: true })
  await openLesson(page, origin, 'ob-tuning', 0)
  const board = buildGemPuzzle('ob-tuning', 0)
  const steps = board.words.find((word) => word.text === 'STEPS')
  assert.ok(steps, 'ob-tuning STEPS chip')
  const full = board.paths[steps.id]
  const stepPath = full.slice(0, 4)
  await dragPath(page, stepPath)
  await page.waitForTimeout(800)
  assert.equal(await page.locator('.miss-banner').count(), 0, 'STEP drag release scores without Miss')
  assert.ok((await page.locator('.bonus-banner').count()) >= 1, 'STEP drag scores bonus banner')
  assert.equal(await foundCount(page), 0, 'STEP is bonus not a chip find')
  await dragPath(page, full)
  await page.waitForTimeout(900)
  assert.equal(await foundCount(page), 1, 'STEPS chip scores after STEP bonus')
  if (shot) {
    await page.screenshot({ path: join(POP_SHOT_ROOT, `ob-tuning-${w}-step-then-steps.png`) })
  }
}

async function assertStepPrefixThenStepsTap(page, origin) {
  await openLesson(page, origin, 'ob-tuning', 0)
  const board = buildGemPuzzle('ob-tuning', 0)
  const steps = board.words.find((word) => word.text === 'STEPS')
  const path = board.paths[steps.id]
  assert.ok(path.length >= 5, 'STEPS path length')
  for (const cell of path.slice(0, 4)) {
    await tapCell(page, cell)
    await page.waitForTimeout(300)
    assert.equal(await page.locator('.bonus-banner').count(), 0, 'STEP prefix tap scores no bonus banner')
  }
  await tapCell(page, path[4])
  await page.waitForTimeout(900)
  assert.equal(await foundCount(page), 1, 'STEPS completes after STEP prefix taps')
}

async function assertPrefixDragNoBonus(page, lineId, word) {
  const letters = await page.evaluate(() => {
    const size = 8
    const grid = []
    for (let r = 0; r < size; r += 1) {
      const row = []
      for (let c = 0; c < size; c += 1) {
        const el = document.querySelector(`[data-gem-cell][data-r="${r}"][data-c="${c}"] .gem-letter`)
        row.push((el?.textContent ?? '').trim())
      }
      grid.push(row)
    }
    return grid
  })
  const path = locateWord(letters, word)
  assert.ok(path && path.length >= 4, `${lineId} locates ${word}`)
  const prefix = path.slice(0, 3)
  const before = await foundCount(page)
  await dragPath(page, prefix)
  await page.waitForTimeout(700)
  assert.equal(await foundCount(page), before, `${lineId} ${word.slice(0, 3)} prefix drag scores no chip`)
  assert.equal(await page.locator('.bonus-banner').count(), 0, `${lineId} ${word.slice(0, 3)} prefix drag scores no bonus`)
  assert.equal(await page.locator('.miss-banner').count(), 0, `${lineId} ${word.slice(0, 3)} prefix drag scores no miss`)
}

const PH_SEEDS_STORY_SEED = 1793300000002
const OB_TUNING_STORY_SEED = 5
const HL_MIND_STORY_SEED = 0

function bonusPath(board, text) {
  const word = board.bonus.find((item) => item.text === text)
  assert.ok(word, `${text} is a bonus on the board`)
  return board.bonusPaths[word.id]
}

function plantedPath(board, text) {
  const word = board.planted.find((item) => item.text === text)
  assert.ok(word, `${text} is planted on the board`)
  return board.bonusPaths[word.id]
}

function denPathFromTuned(board) {
  const tuned = board.planted.find((item) => item.text === 'TUNED')
  assert.ok(tuned, 'TUNED is planted')
  return [...board.bonusPaths[tuned.id]].reverse().slice(0, 3)
}

async function assertStoryBonusRelease(page, tag, shortPath, storyPath, shortLabel, storyLabel) {
  await dragPath(page, shortPath)
  await page.waitForTimeout(800)
  assert.equal(await page.locator('.miss-banner').count(), 0, `${tag} ${shortLabel} release scores no Miss`)
  const bonusText = ((await page.locator('.bonus-banner').first().innerText()) || '').replace(/\s+/g, ' ')
  assert.match(bonusText, /BONUS! \+50\b/, `${tag} ${shortLabel} release scores BONUS +50 (${bonusText})`)
  await dragPath(page, storyPath)
  await page.waitForTimeout(900)
  const storyText = (
    (await page.locator('.gem-hint-slot .match-toast, .gem-hint-slot .bonus-banner').first().innerText()) || ''
  ).replace(/\s+/g, ' ')
  assert.match(storyText, /Story word! \+100\b/, `${tag} ${storyLabel} scores Story word! +100 (${storyText})`)
}

async function assertPhSeedsSeeSeed(page, origin, w, h) {
  await openLesson(page, origin, 'ph-seeds', PH_SEEDS_STORY_SEED)
  const board = buildGemPuzzle('ph-seeds', PH_SEEDS_STORY_SEED)
  const tag = `ph-seeds ${w}x${h}`
  await assertStoryBonusRelease(page, tag, bonusPath(board, 'SEE'), plantedPath(board, 'SEED'), 'SEE', 'SEED')
}

async function assertObTuningTuneTuned(page, origin, w, h) {
  await openLesson(page, origin, 'ob-tuning', OB_TUNING_STORY_SEED)
  const board = buildGemPuzzle('ob-tuning', OB_TUNING_STORY_SEED)
  const tag = `ob-tuning ${w}x${h} TUNE`
  await assertStoryBonusRelease(page, tag, bonusPath(board, 'TUNE'), plantedPath(board, 'TUNED'), 'TUNE', 'TUNED')
}

async function assertObTuningDenTuned(page, origin, w, h) {
  await openLesson(page, origin, 'ob-tuning', OB_TUNING_STORY_SEED)
  const board = buildGemPuzzle('ob-tuning', OB_TUNING_STORY_SEED)
  const tag = `ob-tuning ${w}x${h} DEN`
  await assertStoryBonusRelease(page, tag, denPathFromTuned(board), plantedPath(board, 'TUNED'), 'DEN', 'TUNED')
}

async function assertHlMindThinThink(page, origin, w, h) {
  await openLesson(page, origin, 'hl-mind', HL_MIND_STORY_SEED)
  const board = buildGemPuzzle('hl-mind', HL_MIND_STORY_SEED)
  const tag = `hl-mind ${w}x${h}`
  await assertStoryBonusRelease(page, tag, bonusPath(board, 'THIN'), plantedPath(board, 'THINK'), 'THIN', 'THINK')
}

async function statusLine(page) {
  return page.evaluate(() => {
    const nodes = [...document.querySelectorAll('.play.is-gem-search [role="status"]')]
    const visible = nodes.filter((node) => {
      const style = getComputedStyle(node)
      const box = node.getBoundingClientRect()
      return style.display !== 'none' && style.visibility !== 'hidden' && Number(style.opacity) > 0 && box.width > 0 && box.height > 0
    })
    const pick = visible[0] || nodes[0]
    return {
      text: (pick?.textContent || '').replace(/\s+/g, ' ').trim(),
      font: pick ? parseFloat(getComputedStyle(pick).fontSize) : 0,
    }
  })
}

async function selCount(page) {
  return page.locator('.gem-board .gem-cell.is-sel').count()
}

async function selAt(page) {
  const node = page.locator('.gem-board .gem-cell.is-sel')
  if ((await node.count()) !== 1) return null
  return { r: await node.getAttribute('data-r'), c: await node.getAttribute('data-c') }
}

function anchorCell(board) {
  const word = board.words[0]
  assert.ok(word, 'board has a word')
  const path = board.paths[word.id]
  assert.ok(path?.length, 'word has a path')
  return path[0]
}

function farFrom(cell) {
  for (let r = 0; r < 8; r += 1) {
    for (let c = 0; c < 8; c += 1) {
      if (Math.max(Math.abs(r - cell.r), Math.abs(c - cell.c)) > 1) return { r, c }
    }
  }
  return { r: 0, c: 0 }
}

async function touchTravel(page, from, dx, dy, ms) {
  const session = await page.context().newCDPSession(page)
  const travel = Math.hypot(dx, dy)
  try {
    await session.send('Input.dispatchTouchEvent', {
      type: 'touchStart',
      touchPoints: [{ x: from.x, y: from.y, id: 1 }],
    })
    if (dx !== 0 || dy !== 0) {
      const half = Math.floor(ms / 2)
      if (half > 0) await page.waitForTimeout(half)
      await session.send('Input.dispatchTouchEvent', {
        type: 'touchMove',
        touchPoints: [{ x: from.x + dx, y: from.y + dy, id: 1 }],
      })
      const rest = ms - half
      if (rest > 0) await page.waitForTimeout(rest)
    } else if (ms > 0) {
      await page.waitForTimeout(ms)
    }
    await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
  } finally {
    await session.detach()
  }
  await page.waitForTimeout(50)
  return travel
}

async function goldCueOffenders(page) {
  return page.evaluate(() => {
    const gold = /rgba?\(255, 204, 51(?:, [\d.]+)?\)|rgba?\(255, 159, 26(?:, [\d.]+)?\)/
    const props = [
      'color', 'backgroundColor', 'backgroundImage', 'borderTopColor', 'borderRightColor', 'borderBottomColor',
      'borderLeftColor', 'outlineColor', 'boxShadow', 'textShadow', 'filter', 'fill', 'stroke',
    ]
    const root = document.querySelector('.play.is-gem-search')
    if (!root) return ['no play root']
    const hits = []
    for (const node of [root, ...root.querySelectorAll('*')]) {
      const lockIn = node.closest('button')
      if (lockIn && /Lock In next/.test(lockIn.textContent || '')) continue
      const box = node.getBoundingClientRect()
      const own = getComputedStyle(node)
      if (own.display === 'none' || own.visibility === 'hidden' || Number(own.opacity) === 0) continue
      if (box.width === 0 && box.height === 0) continue
      for (const pseudo of [null, '::before', '::after']) {
        const style = pseudo ? getComputedStyle(node, pseudo) : own
        if (pseudo && style.content === 'none') continue
        for (const prop of props) {
          if (!gold.test(style[prop])) continue
          if (prop === 'backgroundColor' && node.classList.contains('gem-cell') && !pseudo) continue
          hits.push(`${node.tagName.toLowerCase()}.${String(node.className).trim().split(/\s+/).join('.')}${pseudo ?? ''}:${prop}`)
        }
      }
    }
    return hits
  })
}

async function assertOneGoldCue(page, tag) {
  const hits = await goldCueOffenders(page)
  const extra = hits.filter(
    (item) => !/is-sel|is-word-lit|gem-cell\.[^:]*is-bonus-burst|bonus-banner|gem-combo|gem-find-pop|bonus-plus|match-toast/.test(item),
  )
  assert.equal(await page.locator('.gem-cell.is-start-gold').count(), 0, `${tag} no preselected gold cell`)
  assert.deepEqual(extra, [], `${tag} no gold besides the live selection (${extra.join(' | ')})`)
}

function assertTapSource() {
  assert.equal(APP_VERSION, '1.4.564')
  assert.equal(GEM_TAP_MAX_TRAVEL_PX, 6)
  assert.equal(GEM_TAP_MAX_MS, 800)
  const kept = extendStraightTap([{ r: 2, c: 1 }], { r: 2, c: 4 }, 8)
  assert.deepEqual(
    kept,
    [
      { r: 2, c: 1 },
      { r: 2, c: 2 },
      { r: 2, c: 3 },
      { r: 2, c: 4 },
    ],
    'a tap from the start letter to the end fills the straight line',
  )
  assert.equal(extendStraightTap([{ r: 2, c: 1 }, { r: 2, c: 2 }], { r: 3, c: 2 }, 8), null, 'a tap off the line does not extend')
  const src = readFileSync(new URL('../src/components/challenges/GemSearchPlay.tsx', import.meta.url), 'utf8')
  assert.match(
    src,
    /dataset\.easy === 'on'[\s\S]{0,500}GEM_TAP_MAX_TRAVEL_PX/,
    'T10 GemSearchPlay gates the tap threshold on dataset.easy === on',
  )
  assert.match(src, /GEM_TAP_MAX_MS/, 'T10 duration threshold is named')
}

/** #881 Easy tap threshold at one viewport. Real CDP touches. */
async function proveTapThreshold(page, origin, tag, errors) {
  const errorAt = errors.length
  mkdirSync(SHOT_ROOT, { recursive: true })
  const shot = tag.replace(/\s+/g, '')

  const t1Board = await openLesson(page, origin, 'ph-seeds', 0)
  const t1Cell = anchorCell(t1Board)
  const t1 = await touchTravel(page, await cellCentre(page, t1Cell), 4, 3, 80)
  // 5px is inside the inclusive 6px tap, so the letter stays picked and the line appears.
  assert.equal(await selCount(page), 1, `${tag} T1 wiggle travel=${t1}px 80ms is-sel 1`)
  assert.equal((await statusLine(page)).text, EASY.gemTapNext, `${tag} T1 wiggle travel=${t1}px 80ms status`)
  await assertOneGoldCue(page, `${tag} T1`)
  await page.screenshot({ path: join(SHOT_ROOT, `881-T1-${shot}.png`) })

  const t2Board = await openLesson(page, origin, 'ph-seeds', 0)
  const t2 = await touchTravel(page, await cellCentre(page, farFrom(anchorCell(t2Board))), 5, 4, 100)
  assert.equal(await selCount(page), 0, `${tag} T2 over-travel travel=${t2}px 100ms is-sel 0`)

  const t3Board = await openLesson(page, origin, 'ph-seeds', 0)
  const t3 = await touchTravel(page, await cellCentre(page, anchorCell(t3Board)), 6, 0, 120)
  assert.equal(await selCount(page), 1, `${tag} T3 boundary travel=${t3}px 120ms is-sel 1`)

  const t4Board = await openLesson(page, origin, 'ph-seeds', 0)
  const t4 = await touchTravel(page, await cellCentre(page, farFrom(anchorCell(t4Board))), 0, 0, 900)
  assert.equal(await selCount(page), 0, `${tag} T4 long press travel=${t4}px 900ms is-sel 0`)
  await assertOneGoldCue(page, `${tag} T4`)

  const t5Board = await openLesson(page, origin, 'ph-seeds', 0)
  const start = anchorCell(t5Board)
  const t5 = await touchTravel(page, await cellCentre(page, start), 0, 0, 60)
  assert.equal(await selCount(page), 1, `${tag} T5 clean tap travel=${t5}px 60ms is-sel 1`)
  const afterTap = await statusLine(page)
  assert.equal(afterTap.text, EASY.gemTapNext, `${tag} T5 clean tap travel=${t5}px 60ms status`)
  assert.ok(afterTap.font >= 13, `${tag} T5 clean tap travel=${t5}px 60ms font ${afterTap.font}px`)
  await assertOneGoldCue(page, `${tag} T5`)
  await page.screenshot({ path: join(SHOT_ROOT, `881-T5-${shot}.png`) })

  const held = await selAt(page)
  const scoreBefore = await page.locator('.match-score').innerText()
  // A slip past 6px on another letter must not retarget the live path.
  const t6 = await touchTravel(page, await cellCentre(page, farFrom(start)), 5, 4, 80)
  assert.equal(await selCount(page), 1, `${tag} T6 live wiggle travel=${t6}px 80ms is-sel 1`)
  assert.deepEqual(await selAt(page), held, `${tag} T6 live wiggle travel=${t6}px 80ms same cell`)
  assert.equal((await statusLine(page)).text, afterTap.text, `${tag} T6 live wiggle travel=${t6}px 80ms status unchanged`)
  assert.equal(await page.locator('.miss-banner').count(), 0, `${tag} T6 live wiggle travel=${t6}px 80ms no miss`)
  assert.equal(await page.locator('.match-score').innerText(), scoreBefore, `${tag} T6 live wiggle travel=${t6}px 80ms score unchanged`)
  await page.screenshot({ path: join(SHOT_ROOT, `881-T6-${shot}.png`) })

  await openLesson(page, origin, 'ph-seeds', 0)
  const board = buildGemPuzzle('ph-seeds', 0)
  const first = board.words[0]
  const second = board.words[1]
  await tapPath(page, board.paths[first.id], true)
  await page.waitForTimeout(900)
  assert.equal(await foundCount(page), 1, `${tag} T7 tap-through finds ${first.text}`)
  const cleared = await statusLine(page)
  assert.equal(cleared.text.includes(EASY.gemTapNext), false, `${tag} T7 status cleared after the find (${cleared.text})`)
  await assertOneGoldCue(page, `${tag} T7`)

  await dragPath(page, board.paths[second.id])
  await page.waitForTimeout(1100)
  let found = await foundCount(page)
  if (found < 2) {
    await dragPath(page, board.paths[second.id])
    await page.waitForTimeout(1100)
    found = await foundCount(page)
  }
  assert.equal(found, 2, `${tag} T8 drag finds ${second.text}`)
  assert.equal(errors.length, errorAt, `${tag} page errors === 0 (${errors.slice(errorAt).join(' | ')})`)
}

async function hintText(page) {
  const hint = page.locator('[data-gem-start]')
  return ((await hint.innerText()) || '').replace(/\s+/g, ' ').trim()
}

async function assertCleanBoard(page, tag) {
  const hint = await hintText(page)
  assert.equal(hint, EASY.gemHow, `${tag} how-to before the first action`)
  assert.doesNotMatch(hint, /Try a full straight word/, `${tag} no error before the first action`)
  assert.equal(await page.locator('.miss-banner').count(), 0, `${tag} no miss banner`)
  assert.equal(await page.locator('.gem-cell.is-sel').count(), 0, `${tag} no selected cell`)
  assert.equal(await page.locator('.gem-cell.is-start-gold').count(), 0, `${tag} no gold outline`)
  assert.equal(await page.locator('.gem-cell.is-hint').count(), 0, `${tag} no hint outline`)
  const font = await page.locator('[data-gem-start]').evaluate((node) => parseFloat(getComputedStyle(node).fontSize))
  assert.ok(font >= 13, `${tag} how-to is ${font}px`)
}

async function holdTap(page, cell, ms) {
  const at = await cellCentre(page, cell)
  const session = await page.context().newCDPSession(page)
  try {
    await session.send('Input.dispatchTouchEvent', {
      type: 'touchStart',
      touchPoints: [{ x: Math.round(at.x), y: Math.round(at.y), id: 1 }],
    })
    if (ms > 0) await page.waitForTimeout(ms)
    await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
  } finally {
    await session.detach()
  }
  await page.waitForTimeout(40)
}

async function touchSlide(page, path) {
  const session = await page.context().newCDPSession(page)
  const points = []
  for (const cell of path) points.push(await cellCentre(page, cell))
  try {
    await session.send('Input.dispatchTouchEvent', {
      type: 'touchStart',
      touchPoints: [{ x: Math.round(points[0].x), y: Math.round(points[0].y), id: 1 }],
    })
    for (const point of points.slice(1)) {
      await session.send('Input.dispatchTouchEvent', {
        type: 'touchMove',
        touchPoints: [{ x: Math.round(point.x), y: Math.round(point.y), id: 1 }],
      })
      await page.waitForTimeout(30)
    }
    await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
  } finally {
    await session.detach()
  }
  await page.waitForTimeout(40)
}

async function assertWordFound(page, tag, word) {
  await page.waitForTimeout(900)
  const chip = page.locator('.match-teach-chip.is-found', { hasText: word.label })
  assert.equal(await chip.count(), 1, `${tag} ${word.text} chip stays found`)
  const score = ((await page.locator('.match-score').innerText()) || '').replace(/\s+/g, ' ')
  assert.match(score, /1\s*\/\s*\d+\s+found/i, `${tag} counter updated (${score})`)
  const lit = await page.locator('.gem-cell.is-word-lit').count()
  assert.ok(lit >= 1, `${tag} found word stays highlighted (${lit})`)
  const goldLit = await page.locator('.gem-cell.is-word-lit').evaluateAll((nodes) =>
    nodes.some((node) => /255,\s*204,\s*51|255,\s*159,\s*26|#ffcc33|#ff9f1a/i.test(getComputedStyle(node).boxShadow)),
  )
  assert.equal(goldLit, false, `${tag} found highlight is not gold`)
  assert.equal(await page.locator('.miss-banner').count(), 0, `${tag} a found word shows no error`)
}

/** #912 Easy word search: tap, slide, and a slow tap on a phone-size board. */
async function proveEasyWordInputs(page, origin, w, h) {
  const tag = `${w}x${h}`
  mkdirSync(SHOT_ROOT, { recursive: true })
  const board = await openLesson(page, origin, 'ob-tuning', 0)
  const word = board.words[0]
  const path = board.paths[word.id]
  assert.ok(path.length >= 3, `${tag} ${word.text} is a straight word`)
  await assertCleanBoard(page, tag)
  await page.screenshot({ path: join(SHOT_ROOT, `912-start-${w}.png`) })

  for (let i = 0; i < path.length; i += 1) {
    await holdTap(page, path[i], 70)
    await page.waitForTimeout(220)
    if (i === 1) {
      assert.equal(await selCount(page), 2, `${tag} tap-by-tap keeps both letters`)
      assert.equal(await page.locator('.miss-banner').count(), 0, `${tag} mid-word tap shows no error`)
      await page.screenshot({ path: join(SHOT_ROOT, `912-mid-tap-${w}.png`) })
    }
  }
  await assertWordFound(page, `${tag} tap-by-tap`, word)

  const endBoard = await openLesson(page, origin, 'ob-tuning', 0)
  const endWord = endBoard.words[0]
  const endPath = endBoard.paths[endWord.id]
  await assertCleanBoard(page, `${tag} start-end`)
  await holdTap(page, endPath[0], 80)
  await page.waitForTimeout(200)
  await holdTap(page, endPath[endPath.length - 1], 80)
  await assertWordFound(page, `${tag} tap start then end`, endWord)
  if (w === 375) await page.screenshot({ path: join(SHOT_ROOT, '912-found-375.png') })

  const slideBoard = await openLesson(page, origin, 'ob-tuning', 0)
  const slideWord = slideBoard.words[0]
  await assertCleanBoard(page, `${tag} touch slide`)
  await touchSlide(page, slideBoard.paths[slideWord.id])
  await assertWordFound(page, `${tag} touch slide`, slideWord)

  const mouseBoard = await openLesson(page, origin, 'ob-tuning', 0)
  const mouseWord = mouseBoard.words[0]
  await assertCleanBoard(page, `${tag} mouse slide`)
  await dragPath(page, mouseBoard.paths[mouseWord.id])
  await assertWordFound(page, `${tag} mouse slide`, mouseWord)

  const slowBoard = await openLesson(page, origin, 'ob-tuning', 0)
  const slowWord = slowBoard.words[0]
  const slowPath = slowBoard.paths[slowWord.id]
  await assertCleanBoard(page, `${tag} slow tap`)
  for (const cell of slowPath) {
    await holdTap(page, cell, 600)
    await page.waitForTimeout(180)
  }
  await assertWordFound(page, `${tag} slow 600ms tap`, slowWord)

  const missBoard = await openLesson(page, origin, 'ob-tuning', 0)
  await assertCleanBoard(page, `${tag} before miss`)
  const corner = [
    { r: 0, c: 0 },
    { r: 0, c: 1 },
    { r: 1, c: 0 },
  ]
  const spelled = corner.map((cell) => missBoard.letters[cell.r][cell.c]).join('')
  const straightWord = missBoard.words.some((item) => item.text === spelled || item.text === [...spelled].reverse().join(''))
  if (!straightWord) {
    await dragPath(page, corner)
    await page.waitForTimeout(400)
    const miss = page.locator('.miss-banner')
    assert.equal(await miss.count(), 1, `${tag} a failed swipe shows the miss`)
    const why = miss.locator('span')
    assert.match((await why.innerText()) || '', /Try a full straight word/)
    const whyFont = await why.evaluate((node) => parseFloat(getComputedStyle(node).fontSize))
    assert.ok(whyFont >= 13, `${tag} miss line is ${whyFont}px`)
    await holdTap(page, { r: 7, c: 7 }, 80)
    await page.waitForTimeout(80)
    assert.equal(await page.locator('.miss-banner').count(), 0, `${tag} the next tap clears the miss`)
  }
}

export async function checkGemTapLive() {
  assertTapSource()
  mkdirSync(SHOT_ROOT, { recursive: true })
  const server = await createServer({
    server: { host: '127.0.0.1', port: 0 },
    cacheDir: 'node_modules/.vite-gem-tap',
    logLevel: 'warn',
  })
  await server.listen()
  const address = server.httpServer?.address()
  const port = address && typeof address === 'object' ? address.port : 0
  assert.ok(port > 0, 'gem tap server has a port')
  const origin = `http://127.0.0.1:${port}/`
  const browser = await launchBrowser()
  const errors = []
  try {
    for (const [w, h] of VIEWPORTS) {
      const context = await browser.newContext({
        viewport: { width: w, height: h },
        hasTouch: true,
        isMobile: true,
      })
      await context.addInitScript(({ key, payload }) => {
        window.localStorage.setItem(key, JSON.stringify(payload))
      }, { key: STORAGE_KEY, payload: savePayload() })
      const page = await context.newPage()
      page.on('pageerror', (err) => errors.push(String(err)))
      await proveTapThreshold(page, origin, `${w}x${h}`, errors)
      await context.close()
    }
    for (const [w, h] of [
      [375, 812],
      [390, 844],
    ]) {
      const context = await browser.newContext({
        viewport: { width: w, height: h },
        hasTouch: true,
        isMobile: true,
      })
      await context.addInitScript(({ key, payload }) => {
        window.localStorage.setItem(key, JSON.stringify(payload))
      }, { key: STORAGE_KEY, payload: savePayload() })
      const page = await context.newPage()
      page.on('pageerror', (err) => errors.push(String(err)))
      await proveEasyWordInputs(page, origin, w, h)
      await context.close()
    }
    for (const [w, h] of VIEWPORTS) {
      for (const lineId of LESSONS) {
        for (const mode of ['tap', 'drag']) {
          const context = await browser.newContext({
            viewport: { width: w, height: h },
            hasTouch: mode === 'tap',
            isMobile: true,
          })
          await context.addInitScript(({ key, payload }) => {
            window.localStorage.setItem(key, JSON.stringify(payload))
          }, { key: STORAGE_KEY, payload: savePayload() })
          const page = await context.newPage()
          page.on('pageerror', (err) => errors.push(String(err)))
          await openLesson(page, origin, lineId, 0)
          const layout0 = await layoutMetrics(page)
          const minCellH = w >= 390 ? 44 : 42
          assert.ok(
            layout0.cellW >= 42 && layout0.cellH >= minCellH,
            `${lineId} ${w}x${h} cells >= 42×${minCellH} (${layout0.cellW}x${layout0.cellH})`,
          )
          assert.ok(Math.abs(layout0.cellW - layout0.cellH) <= 1, `${lineId} ${w}x${h} cells square (${layout0.cellW}x${layout0.cellH})`)
          await assertBoardInCard(page, `${lineId} ${w}x${h}`)
          await assertPlayAreaFill(page, `${lineId} ${w}x${h}`)
          assert.ok(layout0.docH <= layout0.vh + 2 && layout0.scrollY === 0, `${lineId} ${w}x${h} no page scroll`)
          await playWords(page, lineId, mode)
          await assertWinNoScroll(page, `${lineId} ${w}x${h} ${mode}`)
          await page.screenshot({ path: join(SHOT_ROOT, `${lineId}-${w}-win-${mode}.png`) })
          await context.close()
        }
        if (lineId === 'ph-seeds' && w === 375) {
          const context = await browser.newContext({ viewport: { width: w, height: h }, isMobile: true })
          await context.addInitScript(({ key, payload }) => {
            window.localStorage.setItem(key, JSON.stringify(payload))
          }, { key: STORAGE_KEY, payload: savePayload() })
          const page = await context.newPage()
          await openLesson(page, origin, lineId, 0)
          await dragPath(page, locateWord(buildGemPuzzle(lineId, 0).letters, 'MICAH'))
          await page.waitForTimeout(900)
          await assertBoardInCard(page, `${lineId} ${w}x${h} mid`)
          await assertPlayAreaFill(page, `${lineId} ${w}x${h} mid`)
          await page.screenshot({ path: join(SHOT_ROOT, `${lineId}-${w}-mid-after-find.png`) })
          await assertPrefixDragNoBonus(page, lineId, 'PARABLE')
          await assertPrefixDragNoBonus(page, lineId, 'KINGDOM')
          await context.close()
        }
        if (lineId === 'ob-tuning' && w === 390) {
          const context = await browser.newContext({ viewport: { width: w, height: h }, isMobile: true })
          await context.addInitScript(({ key, payload }) => {
            window.localStorage.setItem(key, JSON.stringify(payload))
          }, { key: STORAGE_KEY, payload: savePayload() })
          const page = await context.newPage()
          await openLesson(page, origin, lineId, 0)
          await dragPath(page, locateWord(buildGemPuzzle(lineId, 0).letters, 'LARK'))
          await page.waitForTimeout(900)
          await assertBoardInCard(page, `${lineId} ${w}x${h} mid`)
          await assertPlayAreaFill(page, `${lineId} ${w}x${h} mid`)
          await page.screenshot({ path: join(SHOT_ROOT, `${lineId}-${w}-mid-after-find.png`) })
          await context.close()
        }
      }
    }
    {
      const context = await browser.newContext({
        viewport: { width: 375, height: 812 },
        hasTouch: true,
        isMobile: true,
      })
      await context.addInitScript(({ key, payload }) => {
        window.localStorage.setItem(key, JSON.stringify(payload))
      }, { key: STORAGE_KEY, payload: savePayload() })
      const page = await context.newPage()
      page.on('pageerror', (err) => errors.push(String(err)))
      await assertObTuningMisdragThenDrag(page, origin)
      await context.close()
    }
    {
      const context = await browser.newContext({
        viewport: { width: 390, height: 844 },
        hasTouch: true,
        isMobile: true,
      })
      await context.addInitScript(({ key, payload }) => {
        window.localStorage.setItem(key, JSON.stringify(payload))
      }, { key: STORAGE_KEY, payload: savePayload() })
      const page = await context.newPage()
      page.on('pageerror', (err) => errors.push(String(err)))
      await assertStepPrefixThenStepsTap(page, origin)
      await context.close()
    }
    for (const w of [375, 390]) {
      const context = await browser.newContext({
        viewport: { width: w, height: w === 375 ? 667 : 844 },
        isMobile: true,
      })
      await context.addInitScript(({ key, payload }) => {
        window.localStorage.setItem(key, JSON.stringify(payload))
      }, { key: STORAGE_KEY, payload: savePayload() })
      const page = await context.newPage()
      page.on('pageerror', (err) => errors.push(String(err)))
      await assertStepDragThenSteps(page, origin, w, true)
      await context.close()
    }
    for (const [w, h] of VIEWPORTS) {
      for (const run of [
        (page, origin) => assertPhSeedsSeeSeed(page, origin, w, h),
        (page, origin) => assertObTuningTuneTuned(page, origin, w, h),
        (page, origin) => assertObTuningDenTuned(page, origin, w, h),
        (page, origin) => assertHlMindThinThink(page, origin, w, h),
      ]) {
        const context = await browser.newContext({
          viewport: { width: w, height: h },
          isMobile: true,
        })
        await context.addInitScript(({ key, payload }) => {
          window.localStorage.setItem(key, JSON.stringify(payload))
        }, { key: STORAGE_KEY, payload: savePayload() })
        const page = await context.newPage()
        page.on('pageerror', (err) => errors.push(String(err)))
        await run(page, origin)
        await context.close()
      }
    }
  } finally {
    await browser.close()
    await server.close()
  }
  assert.equal(errors.join('\n'), '', 'gem tap live: no page errors')
  console.log('check-gem-tap-live: ok')
}

if (import.meta.url.startsWith('file:') && process.argv[1]?.endsWith('check-gem-tap-live.mjs')) {
  await checkGemTapLive()
}
