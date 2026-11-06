#!/usr/bin/env node
/**
 * #843 Easy Lock In asks recall before it reveals.
 * Part A is source + data asserts. Part B drives a real phone-size browser at
 * 375x667, 375x812 and 390x844 (and 383x800 for the width proof).
 * Shots default to os.tmpdir(); set LOCKIN_843_SHOT_DIR to move them.
 */
import assert from 'node:assert/strict'
import { mkdirSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from '@playwright/test'
import { createServer } from 'vite'
import { APP_VERSION, STORAGE_KEY } from '../src/config/app.ts'
import { CHANGELOG } from '../src/content/changelog.ts'
import { evidenceForTier } from '../src/content/evidence.ts'
import { QUIET_PAUSE_BLOCKED_VIEWS, lockInQuizBlocksPause, quietPauseAllowed } from '../src/config/ads.ts'
import { scenePauseMountsOn } from '../src/config/ads.ts'
import { EASY_LINE_ORDER } from '../src/easyTrail/trail/loop.ts'
import { pickFormat } from '../src/easyTrail/review/reviewFormat.ts'
import { localDateKey } from '../src/lib/dates.ts'
import { easyFacingLine, easyWhyLine } from '../src/lib/easy.ts'
import { lociStampFor } from '../src/lib/lociStamp.ts'
import { SAVE_KIND, SAVE_SCHEMA_VERSION } from '../src/lib/save.ts'
import { LOCKIN_DECOYS, lockInWhyBoard, whyBlastPool } from '../src/lib/whyBlast.ts'
import {
  chipLooks,
  fontViolations,
  goldCues,
  phoneFit,
  probeInitSource,
  screenText,
  keptGoldCues,
  startFrameSampler,
  markFrameSampler,
  stopFrameSampler,
} from './lockin843-probe.mjs'

const root = fileURLToPath(new URL('..', import.meta.url))
const shotDir = process.env.LOCKIN_843_SHOT_DIR ?? join(tmpdir(), '843-lockin')
mkdirSync(shotDir, { recursive: true })

// ---------------------------------------------------------------------------
// Part A: data, source and route asserts
// ---------------------------------------------------------------------------

/** Copied verbatim from the Scholar list in the #843 spec. Do not retype. */
const SPEC_DECOYS = {
  'ph-road': ['The road went down to Jericho.', 'Robbers hurt a man on the road.', 'A lawyer asked Jesus a question.'],
  'ph-father': ['The son was hungry far from home.', 'The son had a speech ready.', 'The older brother was out in the field.'],
  'ob-tuning': ['There are many, many stars.', 'The earth goes around the sun.', 'Rain falls from the clouds.'],
  'ph-debt': ['The king checked who owed him money.', 'Peter asked Jesus a question first.', 'Other servants saw what he did.'],
  'fg-order': ['Colossians is a letter Paul wrote.', 'Trees grow from seeds.', 'Some things are big, and some are small.'],
}
const LINES = Object.keys(SPEC_DECOYS)
assert.deepEqual(EASY_LINE_ORDER.slice(0, 5), LINES, 'L1-L5 are the five spec lines, in order')
const FORBIDDEN = /set just right|fittedness|Stars look tiny|Jail him|Colossians never names Christ|The priest walked by on the other side/

function easyBrief(id) {
  const brief = evidenceForTier(id, 'easy')
  assert.ok(brief, `${id} easy brief`)
  return brief
}

for (const id of LINES) {
  assert.deepEqual([...LOCKIN_DECOYS[id]], SPEC_DECOYS[id], `${id} decoys are byte-equal to the spec`)
  const brief = easyBrief(id)
  for (const line of SPEC_DECOYS[id]) {
    assert.equal(easyWhyLine(line), line, `${id} easyWhyLine leaves "${line}" alone`)
    assert.doesNotMatch(line, FORBIDDEN, `${id} decoy "${line}"`)
  }
  const board = lockInWhyBoard(id, brief.reason)
  assert.ok(board, `${id} gets the Lock In board`)
  assert.deepEqual([...board].sort(), [brief.reason, ...SPEC_DECOYS[id]].sort(), `${id} board = right + 3 map lines`)
  assert.equal(board.length, 4)
  assert.equal(lockInWhyBoard(id, `${brief.reason} (other tier)`), null, `${id} other tiers keep their own board`)
  const medium = evidenceForTier(id, 'medium')
  if (medium && medium.reason !== brief.reason) {
    assert.equal(lockInWhyBoard(id, medium.reason), null, `${id} Medium board untouched`)
  }
}
assert.ok(LOCKIN_DECOYS['ph-road'].includes('A lawyer asked Jesus a question.'))
assert.ok(!LOCKIN_DECOYS['ph-road'].some((line) => /priest walked by/.test(line)))
assert.equal(
  easyBrief('fg-order').reason,
  'All things were created through him and hold together in him.',
  'L5 right card stays exact',
)
assert.equal(lockInWhyBoard('fg-reason', easyBrief('fg-reason').reason), null, 'L6+ keep today\'s pool')
assert.equal(whyBlastPool(easyBrief('fg-reason').reason, easyBrief('fg-reason').reasonChoices).length, 4)

// D2: the ph-debt Easy claim is read through the same functions the reveal uses. No wording is pinned here.
const debtClaim = easyFacingLine('ph-debt', easyBrief('ph-debt').claim)
assert.ok(debtClaim.length > 10, 'ph-debt Easy claim is live (D2)')

// Version, changelog.
assert.equal(APP_VERSION, '1.4.572')
assert.equal(JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')).version, APP_VERSION)
const lockInRow = CHANGELOG.find((note) => note.version === '1.4.567')
assert.ok(lockInRow, 'the 1.4.567 Lock In row is shipped')
assert.equal(lockInRow.title, 'Easy Lock In: remember first, then why')
assert.deepEqual(lockInRow.items, [
  'Lock In now asks for the main idea before it shows it.',
  'A wrong card now costs a try, and you see why before the next pick.',
  'The wrong cards are true story details now.',
  'Continue after Lock In goes straight Home.',
  'A line you already kept gets a quick review, not the same game.',
  'Refs #843.',
])

const src = (path) => readFileSync(join(root, path), 'utf8')
const blastSrc = src('src/components/challenges/WhyBlastPlay.tsx')
const recallSrc = src('src/components/RecallGate.tsx')
const holdSrc = src('src/easyTrail/lockIn/HoldPractice.tsx')
const recallStepSrc = src('src/easyTrail/lockIn/LockInRecall.tsx')
const journalSrc = src('src/components/Journal.tsx')

// B9: one navigation owner. The slide, the gate and the recall step never route.
for (const [name, text] of [['WhyBlastPlay', blastSrc], ['RecallGate', recallSrc], ['LockInRecall', recallStepSrc]]) {
  assert.doesNotMatch(text, /onNavigate/, `${name} never calls onNavigate`)
}
assert.match(holdSrc, /onNavigate\(\{ name: 'hub' \}\)/)
assert.match(journalSrc, /if \(easy\) \{\s*onNavigate\(\{ name: 'hub' \}\)\s*return\s*\}\s*setFace\('read'\)\s*setQuizAgain\(false\)/, 'Easy JournalCard goes Home; Hard keeps setFace(read)')
assert.match(journalSrc, /onNavigate=\{onNavigate\}/)
assert.match(journalSrc, /\(easy && debugLockIn\)/)

// sameProofRecap stays exported and unused.
function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name)
    return statSync(path).isDirectory() ? walk(path) : [path]
  })
}
const recapUses = walk(join(root, 'src'))
  .filter((path) => /\.(ts|tsx)$/.test(path))
  .filter((path) => /sameProofRecap\(/.test(readFileSync(path, 'utf8')) && !path.endsWith('trail/loop.ts'))
assert.deepEqual(recapUses, [], 'sameProofRecap has no caller')
assert.match(src('src/easyTrail/trail/loop.ts'), /export function sameProofRecap/, 'sameProofRecap stays exported')

// B4: the miss is one synchronous handler. No timer before teach, no toss.
const missBody = blastSrc.slice(blastSrc.indexOf('function miss('), blastSrc.indexOf('function retryAfterTeach'))
assert.match(missBody, /busyRef\.current = true/)
assert.match(missBody, /missesRef\.current \+= 1/)
assert.match(missBody, /setMissTeach\(true\)/)
assert.match(missBody, /applyHoldMiss/)
assert.match(missBody, /playGemPop\('miss'\)/)
assert.doesNotMatch(missBody.replace(/shakeTimer\.current = window\.setTimeout\(\(\) => setShake\(false\)[^\n]*\n/, ''), /setTimeout/, 'only the shake class waits on a timer')
assert.doesNotMatch(blastSrc, /is-toss|is-gone|tossing/)
assert.match(blastSrc, /if \(busyRef\.current/, 'picks are guarded by a ref lock')

// B1: no claim pick on Easy encode.
assert.doesNotMatch(recallSrc, /easySortClaimPick/)
assert.match(recallSrc, /<LockInRecall/)

// B11: encode write carries format A through the existing field.
assert.match(holdSrc, /kind: 'encode'[\s\S]*?format: 'A'/)

// B10: kept card is the shipped QuickReview with the Home gates.
assert.match(holdSrc, /<QuickReview[\s\S]*?formatsACOnly[\s\S]*?skipHonesty/)
assert.match(holdSrc, /practice=\{!\(trace && isDue\(trace, today\)\)\}/)

// R-c: the first review after Lock In is format C, never A or B.
for (const id of EASY_LINE_ORDER) {
  for (let day = 1; day <= 28; day += 1) {
    for (let interval = 0; interval <= 4; interval += 1) {
      const date = `2026-11-${String(day).padStart(2, '0')}`
      assert.equal(pickFormat(id, date, 'A', undefined, interval, { acOnly: true }), 'C', `${id} ${date} after A is C`)
    }
  }
}

// H7 / acceptance 18: no ad or quiet pause on the way out of Lock In.
assert.equal(quietPauseAllowed({ name: 'journal', autoQuiz: true }, { name: 'hub' }), false)
assert.equal(quietPauseAllowed({ name: 'journal', autoQuiz: true, debugLockIn: true }, { name: 'hub' }), false)
assert.equal(quietPauseAllowed({ name: 'quick-review' }, { name: 'hub' }), false)
assert.equal(quietPauseAllowed({ name: 'quick-review' }, { name: 'hub', afterScene: true }), false)
assert.ok(QUIET_PAUSE_BLOCKED_VIEWS.includes('quick-review'))
assert.equal(lockInQuizBlocksPause('journal', true), true)
assert.equal(scenePauseMountsOn('hub'), true)
for (const name of ['journal', 'quick-review', 'link', 'daily', 'challenge', 'settings']) {
  assert.equal(scenePauseMountsOn(name), false, `scene pause mounts only on hub (${name})`)
}
assert.doesNotMatch(blastSrc + recallSrc + holdSrc + recallStepSrc, /SceneAd|showBetweenSceneInterstitial/)

console.log('check-lockin-843: part A ok')

// ---------------------------------------------------------------------------
// Part B: real phone-size browser
// ---------------------------------------------------------------------------

const VIEWPORTS = [
  [375, 667],
  [375, 812],
  [390, 844],
]
const PROVE_WIDTH = [383, 800]
const today = localDateKey()
const yesterday = (() => {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return localDateKey(d)
})()

function save(progress) {
  return {
    kind: SAVE_KIND,
    schemaVersion: SAVE_SCHEMA_VERSION,
    appVersion: APP_VERSION,
    savedAt: new Date().toISOString(),
    progress: { started: true, easyMode: true, theme: 'candy', ...progress },
  }
}

/** Fresh Easy save with line `index` taught and the lines before it kept. */
function seedLine(index) {
  const ids = EASY_LINE_ORDER.slice(0, index + 1)
  return save({
    completed: ids,
    easyTaught: ids,
    easyHeld: ids.slice(0, index),
    held: ids.slice(0, index),
  })
}

/** L1 kept on Easy: best score >= tier, so Lock In is the kept card. */
function seedKept(nextReviewAt) {
  return save({
    completed: ['ph-road'],
    easyTaught: ['ph-road'],
    easyHeld: ['ph-road'],
    held: ['ph-road'],
    lessonScore: { 'ph-road': 10 },
    lessonTier: { 'ph-road': 'easy' },
    memory: {
      'ph-road': {
        id: 'ph-road',
        pillar: 'parable-hollow',
        intervalIndex: 1,
        nextReviewAt,
        lastReviewAt: yesterday,
        reviews: 1,
        cleanRecalls: 1,
        elaborated: false,
        lastFormat: 'A',
      },
    },
  })
}

const server = await createServer({ root, server: { host: '127.0.0.1', port: 0 }, logLevel: 'error' })
await server.listen()
const address = server.httpServer?.address()
const port = address && typeof address === 'object' ? address.port : 0
assert.ok(port > 0, 'dev server port')
const origin = `http://127.0.0.1:${port}`

async function launch() {
  try {
    return await chromium.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] })
  } catch {
    return await chromium.launch({ channel: 'chrome', args: ['--no-sandbox', '--disable-setuid-sandbox'] })
  }
}
const browser = await launch()
const consoleErrors = []

async function session({ viewport, reduced = false, seed, url = '/?playtest=1' }, fn) {
  const context = await browser.newContext({
    viewport: { width: viewport[0], height: viewport[1] },
    reducedMotion: reduced ? 'reduce' : 'no-preference',
  })
  await context.addInitScript(probeInitSource())
  await context.addInitScript(() => {
    window.__scrolls = 0
    const real = window.scrollTo.bind(window)
    window.scrollTo = (...args) => {
      window.__scrolls += 1
      return real(...args)
    }
  })
  if (seed) {
    await context.addInitScript(
      ({ key, raw }) => {
        if (!localStorage.getItem(key)) localStorage.setItem(key, raw)
      },
      { key: STORAGE_KEY, raw: JSON.stringify(seed) },
    )
  }
  const page = await context.newPage()
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text())
  })
  page.on('pageerror', (err) => consoleErrors.push(String(err)))
  try {
    await page.goto(`${origin}${url}`, { waitUntil: 'networkidle' })
    await page.locator('header').getByRole('button', { name: 'Settings', exact: true }).waitFor({ timeout: 30_000 })
    await fn(page)
  } finally {
    await context.close()
  }
}

const progressOf = (page) =>
  page.evaluate((key) => JSON.parse(localStorage.getItem(key) ?? 'null')?.progress ?? null, STORAGE_KEY)

async function openLockIn(page) {
  await page.getByRole('button', { name: /Lock In/ }).last().click()
  await page.locator('.lockin-recall.is-ask').waitFor()
}

async function domHas(page, text) {
  return page.evaluate(
    (needle) => document.body.textContent.includes(needle) || document.documentElement.outerHTML.includes(needle),
    text,
  )
}

/** One screen: one gold cue (and which one), font floors, no sideways scroll, 44px taps. */
async function assertScreen(page, label, goldMatch) {
  const gold = await page.evaluate(goldCues)
  assert.equal(gold.length, 1, `${label}: exactly one gold cue, got [${gold.join(' | ')}]`)
  assert.match(gold[0], goldMatch, `${label}: the gold cue is ${goldMatch}, got ${gold[0]}`)
  assert.deepEqual(await page.evaluate(fontViolations), [], `${label}: font floors`)
  const fit = await page.evaluate(phoneFit)
  assert.equal(fit.scrollOverflow, false, `${label}: no horizontal scroll`)
  assert.deepEqual(fit.smallTaps, [], `${label}: every tap target is 44px or more`)
}

async function shot(page, viewport, name) {
  await page.screenshot({ path: join(shotDir, `${name}-${viewport[0]}x${viewport[1]}.png`) })
}

const frameLog = []

/**
 * Per-frame asserts. `expect` maps a name to { selector, count, pointerNone?, windowMs? }.
 * Overlap is an error when an expected element never shows up at all.
 */
async function sample(page, label, expect, action, ms) {
  const selectors = Object.fromEntries(Object.entries(expect).map(([name, spec]) => [name, spec.selector]))
  await page.evaluate(startFrameSampler, selectors)
  await page.evaluate(markFrameSampler)
  await action()
  await page.waitForTimeout(ms)
  const frames = await page.evaluate(stopFrameSampler)
  assert.ok(frames.length >= 5, `${label}: sampled ${frames.length} frames`)
  const windows = {}
  const starts = {}
  for (const [name, spec] of Object.entries(expect)) {
    const ok = (frame) => {
      const list = frame.els[name] ?? []
      return (
        list.length >= spec.count &&
        list.every(
          (el) =>
            el.w > 1 &&
            el.h > 1 &&
            el.inView &&
            (!el.clipped || frame.shaking) &&
            el.opacity >= (spec.minOpacity ?? 0.99) &&
            (spec.pointerNone ? true : el.hit),
        )
      )
    }
    const first = frames.findIndex(ok)
    assert.ok(first >= 0, `${label}: "${name}" (${spec.selector}) never became present at full opacity; last frame ${JSON.stringify(frames.at(-1).els[name])}`)
    const mounted = frames.findIndex((frame) => (frame.els[name] ?? []).length >= spec.count)
    const startMs = frames[first].t
    const fadeMs = frames[first].t - frames[mounted].t
    assert.ok(fadeMs <= (spec.windowMs ?? 1000), `${label}: "${name}" takes ${Math.round(fadeMs)}ms from mounting to fully visible`)
    for (const frame of frames.slice(first)) {
      assert.ok(ok(frame), `${label}: "${name}" lost presence at ${Math.round(frame.t)}ms ${JSON.stringify(frame.els[name])}`)
    }
    windows[name] = Math.round(fadeMs)
    starts[name] = startMs
  }
  const settled = Math.max(...Object.values(starts), 0)
  for (const frame of frames) {
    assert.equal(frame.gold.length, 1, `${label}: one gold cue at ${Math.round(frame.t)}ms, got [${frame.gold.join(' | ')}]`)
    if (frame.t >= settled) assert.deepEqual(frame.fonts, [], `${label}: font floors at ${Math.round(frame.t)}ms`)
    const rects = frame.blocks.map((block) => ({ name: `${block.name}:${block.text}`, ...block }))
    for (const [name, spec] of Object.entries(expect)) {
      if (!spec.pointerNone) continue
      for (const el of frame.els[name] ?? []) rects.push({ name: `${name}(pointer-events:none)`, ...el, idx: -1 })
    }
    const nested = new Set(frame.nested)
    for (let i = 0; i < rects.length; i += 1) {
      for (let j = i + 1; j < rects.length; j += 1) {
        const a = rects[i]
        const b = rects[j]
        if (a.idx >= 0 && b.idx >= 0 && nested.has(`${a.idx}-${b.idx}`)) continue
        const w = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x)
        const h = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y)
        assert.ok(!(w > 0.5 && h > 0.5), `${label}: overlap at ${Math.round(frame.t)}ms between ${a.name} and ${b.name} (${w.toFixed(1)}x${h.toFixed(1)})`)
      }
    }
  }
  frameLog.push(`${label}: ${frames.length} frames, fade-in ms ${JSON.stringify(windows)}`)
  return frames
}

const FULL = { windowMs: 900 }
const slideExpect = (count) => ({
  cards: { selector: '.why-chip', count, ...FULL },
  claim: { selector: '.why-claim', count: 1, ...FULL },
  hud: { selector: '.why-blast-hud .next-tap', count: 1, ...FULL },
  score: { selector: '.why-score', count: 1, ...FULL },
  ref: { selector: '.why-arena .held-from', count: 1, minOpacity: 0.7, ...FULL },
  cue: { selector: '.why-slide-cue', count: 1, pointerNone: true, ...FULL },
})
const teachExpect = (button) => ({
  teach: { selector: 'article.why-miss-teach', count: 1, windowMs: 900 },
  badge: { selector: '.why-miss-badge', count: 1, windowMs: 900 },
  text: { selector: '.why-miss-hint, .why-miss-answer', count: 1, windowMs: 900 },
  button: { selector: button, count: 1, windowMs: 900 },
  score: { selector: '.why-score', count: 1, windowMs: 900 },
})
const lockedExpect = {
  stamp: { selector: '.win-stamp', count: 1, pointerNone: true, windowMs: 1200 },
  claim: { selector: '.why-keep-card .match-yes strong', count: 1, windowMs: 1200 },
  why: { selector: '.why-keep-card .match-yes > span:not(.held-from)', count: 1, windowMs: 1200 },
  ref: { selector: '.why-keep-card .held-from', count: 1, windowMs: 1200 },
  got: { selector: '.why-keep-card .why-got-it', count: 1, windowMs: 1200 },
  keep: { selector: '.why-keep-card', count: 1, windowMs: 1200 },
  next: { selector: '.recall-done', count: 1, windowMs: 1200 },
  score: { selector: '.why-score', count: 1, windowMs: 1200 },
}

function lineFacts(id) {
  const brief = easyBrief(id)
  return {
    id,
    brief,
    claim: easyFacingLine(id, brief.claim),
    claimBare: easyFacingLine(id, brief.claim).replace(/[.!?]+$/, ''),
    right: brief.reason,
    why: easyWhyLine(brief.reason).replace(/[.!?]+$/, ''),
    decoys: SPEC_DECOYS[id],
  }
}

function countOf(haystack, needle) {
  return haystack.split(needle).length - 1
}

/** Recall and reveal. Returns after the why slide is up. */
async function recallToSlide(page, viewport, facts, { notYet = false, shots = true, frames = true, tag = '' } = {}) {
  const claimProbe = facts.claimBare.split(/[.!?]/)[0]
  assert.ok(claimProbe.length > 12)
  // 1. recall
  assert.equal(await domHas(page, claimProbe), false, `${tag}recall: the claim is not in the DOM`)
  assert.equal(await page.locator('.recall-card, .recall-choices, .why-chip').count(), 0, `${tag}recall: no claim-pick cards`)
  assert.equal((await page.locator('.lockin-recall-prompt').innerText()).trim(), "What's the main idea?")
  assert.equal((await page.locator('.lockin-recall button').allInnerTexts()).join('|'), 'Show me')
  await assertScreen(page, `${tag}recall`, /lockin-recall-show/)
  if (shots) await shot(page, viewport, `${tag}1-recall`)
  const before = JSON.stringify(await progressOf(page))

  // 2. reveal
  const reveal = () => page.getByRole('button', { name: 'Show me' }).click()
  if (frames) {
    await sample(
      page,
      `${tag}recall→reveal`,
      {
        claim: { selector: '.lockin-recall-claim', count: 1, windowMs: 600 },
        had: { selector: '.lockin-recall-had', count: 1, windowMs: 600 },
        notYet: { selector: '.lockin-recall-not-yet', count: 1, windowMs: 600 },
      },
      reveal,
      700,
    )
  } else {
    await reveal()
  }
  const text = (await page.locator('.lockin-recall-claim').innerText()).trim()
  assert.equal(text, facts.claim, `${tag}reveal: shows the live Easy claim`)
  const claimSize = await page.locator('.lockin-recall-claim').evaluate((el) => parseFloat(getComputedStyle(el).fontSize))
  assert.ok(claimSize >= 14, `${tag}reveal: claim ${claimSize}px is 14px or more`)
  assert.equal((await page.locator('.lockin-recall button').allInnerTexts()).join('|'), 'I had it|Not yet')
  await assertScreen(page, `${tag}reveal`, /lockin-recall-had/)
  const notYetGold = await page.locator('.lockin-recall-not-yet').evaluate((el) => {
    const st = getComputedStyle(el)
    return { cls: el.className, bg: st.backgroundColor, border: st.borderTopWidth }
  })
  assert.doesNotMatch(notYetGold.cls, /btn|gold|primary/, `${tag}reveal: "Not yet" is not a gold button`)
  assert.equal(await page.locator('.lockin-recall-not-yet').evaluate((el) => getComputedStyle(el).backgroundColor), 'rgba(0, 0, 0, 0)')
  if (shots) await shot(page, viewport, `${tag}2-reveal`)

  // 3. both buttons open the slide; the self-mark writes nothing and is not a miss
  const open = () => page.getByRole('button', { name: notYet ? 'Not yet' : 'I had it' }).click()
  if (frames) await sample(page, `${tag}reveal→slide`, slideExpect(4), open, 1100)
  else {
    await open()
    await page.locator('.why-chip').first().waitFor()
  }
  assert.equal(await page.locator('.why-miss-teach').count(), 0, `${tag}self-mark opens no teach`)
  assert.equal((await page.locator('.why-score').innerText()).trim(), '100', `${tag}self-mark is no miss`)
  assert.equal(JSON.stringify(await progressOf(page)), before, `${tag}self-mark writes nothing`)
}

async function assertBoard(page, viewport, facts, count, tag = '') {
  const looks = await page.evaluate(chipLooks)
  assert.equal(looks.length, count, `${tag}board shows ${count} cards`)
  const shown = looks.map((look) => look.text)
  for (const text of shown) assert.ok([facts.right, ...facts.decoys].some((line) => easyWhyLine(line) === text), `${tag}card "${text}" is a board card`)
  if (count === 4) assert.deepEqual([...shown].sort(), [easyWhyLine(facts.right), ...facts.decoys].sort(), `${tag}board = right card + exactly the 3 map lines`)
  const [first, ...rest] = looks
  for (const look of rest) {
    for (const key of ['fontSize', 'color', 'background', 'border', 'shadow', 'width', 'height']) {
      assert.equal(look[key], first[key], `${tag}cards share ${key}: "${look.text}" vs "${first.text}"`)
    }
  }
  for (const text of shown.filter((line) => line !== easyWhyLine(facts.right))) {
    assert.doesNotMatch(text, FORBIDDEN, `${tag}no wrong card has spec-forbidden text: ${text}`)
  }
  assert.equal((await page.evaluate(goldCues)).filter((entry) => entry.includes('why-chip')).length, 0, `${tag}no card is gold before a pick`)
}

// ----- Flow A: recall, "Not yet", slide, miss 1, retry, press-and-lock (clean=false) -----
async function flowA(viewport, reduced) {
  const tag = reduced ? 'rm-' : ''
  await session({ viewport, reduced, seed: seedLine(0) }, async (page) => {
    const facts = lineFacts('ph-road')
    await openLockIn(page)
    await recallToSlide(page, viewport, facts, { notYet: true, tag, shots: !reduced })
    await assertBoard(page, viewport, facts, 4, tag)
    await assertScreen(page, `${tag}slide`, /why-slide-cue/)
    if (!reduced) await shot(page, viewport, '3-slide')

    // wrong pick #1: counted miss + teach in the same handler tick, no free elimination
    const wrongText = facts.decoys[0]
    const tick = await sample(
      page,
      `${tag}wrong pick 1`,
      teachExpect('.why-miss-retry'),
      async () => {
        const result = await page.evaluate(async (wrong) => {
          const chips = [...document.querySelectorAll('.why-chip')]
          const target = chips.find((chip) => chip.textContent.trim() === wrong)
          target.click()
          // A second and third tap in the same task: the ref lock must drop them.
          for (const other of chips) if (other !== target) other.click()
          await new Promise((resolve) => queueMicrotask(resolve))
          return {
            teach: Boolean(document.querySelector('article.why-miss-teach')),
            shake: Boolean(document.querySelector('.why-blast.is-shake')),
            miss: Boolean(document.querySelector('.why-blast.is-miss')),
            score: document.querySelector('.why-score')?.textContent.trim(),
            toss: document.querySelectorAll('.is-toss, .is-gone').length,
          }
        }, wrongText)
        assert.equal(result.teach, true, `${tag}teach is open in the same tick (no timer)`)
        assert.equal(result.shake, true, `${tag}is-shake fired`)
        assert.equal(result.miss, true, `${tag}is-miss flash fired`)
        assert.equal(result.score, '75', `${tag}one miss = Miss −25 (score 100→75), a double tap is not counted`)
        assert.equal(result.toss, 0, `${tag}no is-toss / is-gone node`)
      },
      1000,
    )
    assert.ok(tick.some((frame) => frame.els.teach?.length === 1), `${tag}teach seen in frames`)
    assert.equal(await page.locator('.why-chip').count(), 0)
    assert.equal(await domHas(page, wrongText), false, `${tag}picked card is gone from the DOM`)
    for (const line of facts.decoys) assert.equal(await domHas(page, line), false, `${tag}no wrong-card text on the miss sheet: ${line}`)
    const hint = page.locator('.why-miss-hint')
    assert.equal(await page.locator('.why-miss-answer').count(), 0)
    assert.ok(parseFloat(await hint.evaluate((el) => getComputedStyle(el).fontSize)) >= 14, `${tag}hint is 14px or more`)
    assert.equal((await page.locator('.why-miss-retry').innerText()).trim(), 'Try again')
    await assertScreen(page, `${tag}miss 1`, /why-miss-retry/)
    if (!reduced) await shot(page, viewport, '4-miss1')
    assert.equal((await page.locator('.why-score').innerText()).trim(), '75')

    // Try again: exactly 3 cards remain, same look
    await sample(page, `${tag}try again`, slideExpect(3), () => page.locator('.why-miss-retry').click(), 1000)
    assert.equal(await page.locator('.why-chip').count(), 3, `${tag}3 cards remain after Try again`)
    await assertBoard(page, viewport, facts, 3, tag)
    assert.equal(await domHas(page, wrongText), false)
    await assertScreen(page, `${tag}retry board`, /why-slide-cue/)
    if (!reduced) await shot(page, viewport, '5-retry-board')

    // press the right card: the selected state has one gold cue (the pressed card), then lock
    const right = page.locator('.why-chip', { hasText: easyWhyLine(facts.right) })
    const box = await right.boundingBox()
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
    await sample(
      page,
      `${tag}pressed card`,
      { cards: { selector: '.why-chip', count: 3, windowMs: 900 }, claim: { selector: '.why-claim', count: 1, windowMs: 900 } },
      () => page.mouse.down(),
      500,
    )
    const pressed = await page.evaluate(goldCues)
    assert.equal(pressed.length, 1, `${tag}pressed: one gold cue, got [${pressed.join(' | ')}]`)
    assert.match(pressed[0], /why-chip/, `${tag}pressed: the gold cue is the pressed card`)
    assert.equal(await page.locator('.why-slide-cue').count(), 0, `${tag}pressed: the slide cue steps aside`)
    if (!reduced) await shot(page, viewport, '6-pressed')
    await sample(page, `${tag}LOCKED!`, lockedExpect, () => page.mouse.up(), 1600)

    // LOCKED!, clean=false after one miss
    assert.equal(await page.locator('.why-chip').count(), 0, `${tag}no card is left on LOCKED!`)
    for (const line of [...facts.decoys]) assert.equal(await domHas(page, line), false, `${tag}no wrong-card text on LOCKED!: ${line}`)
    const locked = await page.evaluate(screenText)
    assert.equal(countOf(locked, facts.claimBare), 1, `${tag}LOCKED! shows the claim once`)
    assert.equal(countOf(locked, facts.why), 1, `${tag}LOCKED! shows the why once`)
    assert.equal(countOf(locked, easyBrief('ph-road').source), 1, `${tag}LOCKED! shows the ref once`)
    const ref = await page.locator('.why-blast.is-win .why-keep-card .held-from').evaluate((el) => {
      let opacity = 1
      for (let node = el; node; node = node.parentElement) opacity *= parseFloat(getComputedStyle(node).opacity)
      return { size: parseFloat(getComputedStyle(el).fontSize), opacity }
    })
    assert.ok(ref.size >= 14, `${tag}ref is ${ref.size}px (14px or more)`)
    assert.equal(ref.opacity, 1, `${tag}ref opacity is 1`)
    await assertScreen(page, `${tag}LOCKED!`, /recall-done/)
    if (!reduced) await shot(page, viewport, '7-locked')
    let state = await progressOf(page)
    assert.deepEqual(state.lessonScore ?? {}, {}, `${tag}after a miss the tier does not advance`)

    // Continue goes Home through one route change
    await page.evaluate(() => {
      window.__scrolls = 0
    })
    await page.locator('.why-blast.is-win .cta-dock button.recall-done').click()
    await page.locator('main[aria-label="Home"]').waitFor()
    await page.waitForTimeout(400)
    assert.equal(await page.evaluate(() => window.__scrolls), 1, `${tag}Continue makes exactly one route change`)
    state = await progressOf(page)
    assert.equal(state.memory['ph-road'].lastFormat, 'A', `${tag}encode write sets lastFormat A`)
    assert.ok(state.held.includes('ph-road'))
    assert.deepEqual(state.lessonScore ?? {}, {}, `${tag}clean=false: no tier advance after Continue`)
    assert.notEqual(state.lessonTier?.['ph-road'], 'medium')
    assert.equal(await page.locator('.scene-ad, .interstitial, [data-scene-ad]').count(), 0, `${tag}no scene ad after Lock In`)
  })
}

// ----- Flow B: two misses end the slide, no LOCKED!, Home -----
async function flowB(viewport) {
  await session({ viewport, seed: seedLine(0) }, async (page) => {
    const facts = lineFacts('ph-road')
    await openLockIn(page)
    await recallToSlide(page, viewport, facts, { shots: false, frames: false, tag: 'b-' })
    await page.locator('.why-chip', { hasText: facts.decoys[0] }).click()
    await page.locator('.why-miss-retry').click()
    assert.equal(await page.locator('.why-chip').count(), 3)
    await sample(
      page,
      'wrong pick 2',
      teachExpect('.why-miss-continue'),
      () => page.locator('.why-chip', { hasText: facts.decoys[1] }).click(),
      1000,
    )
    assert.equal((await page.locator('.why-score').innerText()).trim(), '50', 'two misses = 50')
    assert.equal(await page.locator('.why-miss-answer').count(), 1)
    const answer = (await page.locator('.why-miss-answer').innerText()).trim()
    assert.ok(answer.includes(facts.claimBare) && answer.includes(facts.why), `the answer shows the claim and the why: ${answer}`)
    assert.ok(parseFloat(await page.locator('.why-miss-answer').evaluate((el) => getComputedStyle(el).fontSize)) >= 14)
    assert.equal(await page.locator('.why-chip').count(), 0, 'a 2-card board never shows')
    assert.equal(await page.locator('.win-burst, .why-keep-card').count(), 0, 'no WinBurst, no keep card')
    assert.equal((await page.evaluate(screenText)).includes('LOCKED!'), false, 'no LOCKED!')
    for (const line of facts.decoys) assert.equal(await domHas(page, line), false, `no wrong-card text on miss 2: ${line}`)
    await assertScreen(page, 'miss 2', /why-miss-continue/)
    await shot(page, viewport, '8-miss2')
    await page.evaluate(() => {
      window.__scrolls = 0
    })
    await page.locator('button.why-miss-continue').click()
    await page.locator('main[aria-label="Home"]').waitFor()
    await page.waitForTimeout(400)
    assert.equal(await page.evaluate(() => window.__scrolls), 1, 'miss 2 Continue is one route change')
    const state = await progressOf(page)
    assert.deepEqual(state.lessonScore ?? {}, {}, 'miss 2: tier not advanced')
    assert.notEqual(state.lessonTier?.['ph-road'], 'medium')
    assert.equal(state.memory['ph-road'].lastFormat, 'A')
  })
}

// ----- Flow C: a clean run advances the tier -----
async function flowC(viewport) {
  await session({ viewport, seed: seedLine(0) }, async (page) => {
    const facts = lineFacts('ph-road')
    await openLockIn(page)
    await recallToSlide(page, viewport, facts, { shots: false, frames: false, tag: 'c-' })
    await page.locator('.why-chip', { hasText: easyWhyLine(facts.right) }).click()
    await page.locator('.recall-done').waitFor()
    await page.waitForTimeout(1300)
    assert.equal(await page.locator('.why-chip').count(), 0)
    await assertScreen(page, 'clean LOCKED!', /recall-done/)
    await page.evaluate(() => {
      window.__scrolls = 0
    })
    // a double tap on Continue is still one route change
    await page.locator('.recall-done').evaluate((el) => {
      el.click()
      el.click()
    })
    await page.locator('main[aria-label="Home"]').waitFor()
    await page.waitForTimeout(400)
    assert.equal(await page.evaluate(() => window.__scrolls), 1)
    const state = await progressOf(page)
    assert.ok(state.lessonScore?.['ph-road'] > 0, 'a clean slide advances the tier score')
    assert.equal(state.lessonTier['ph-road'], 'medium')
    assert.equal(state.memory['ph-road'].lastFormat, 'A')
  })
}

for (const viewport of [...VIEWPORTS, PROVE_WIDTH]) {
  await flowA(viewport, false)
  await flowA(viewport, true)
  await flowB(viewport)
  await flowC(viewport)
  console.log(`check-lockin-843: ${viewport[0]}x${viewport[1]} ok`)
}

// ----- L1-L5: boards, reveal claims, forbidden text -----
for (let index = 0; index < 5; index += 1) {
  const id = EASY_LINE_ORDER[index]
  await session({ viewport: VIEWPORTS[0], seed: seedLine(index) }, async (page) => {
    const facts = lineFacts(id)
    await openLockIn(page)
    await recallToSlide(page, VIEWPORTS[0], facts, { shots: false, frames: false, tag: `${id}-` })
    await assertBoard(page, VIEWPORTS[0], facts, 4, `${id} `)
    await assertScreen(page, `${id} slide`, /why-slide-cue/)
    if (id === 'ph-debt') assert.equal(facts.claim, debtClaim, 'ph-debt reveal reads the live Easy claim')
  })
}

// ----- Settings debug jump: fresh save and kept save -----
async function openDebugLockIn(page) {
  await page.locator('header').getByRole('button', { name: 'Settings', exact: true }).click()
  await page.locator('details.settings-debug > summary').click()
  await page.getByRole('button', { name: /ph-road · Lock In Why Blast/ }).click()
}

await session({ viewport: VIEWPORTS[0], seed: seedLine(0) }, async (page) => {
  const facts = lineFacts('ph-road')
  await openDebugLockIn(page)
  await page.locator('.lockin-recall.is-ask').waitFor()
  await recallToSlide(page, VIEWPORTS[0], facts, { shots: false, frames: false, tag: 'debug-fresh-' })
  await page.locator('.why-chip', { hasText: easyWhyLine(facts.right) }).click()
  await page.locator('.recall-done').waitFor()
  await page.evaluate(() => {
    window.__scrolls = 0
  })
  await page.locator('.why-blast.is-win .cta-dock button.recall-done').click()
  await page.locator('main[aria-label="Home"]').waitFor()
  await page.waitForTimeout(300)
  assert.equal(await page.evaluate(() => window.__scrolls), 1)
})

async function keptCase(nextReviewAt, due, viewport = VIEWPORTS[0]) {
  await session({ viewport, seed: seedKept(nextReviewAt) }, async (page) => {
    await openDebugLockIn(page)
    await page.locator('.quick-review').waitFor()
    await page.waitForTimeout(400)
    await shot(page, viewport, due ? '9-kept-review' : '9-kept-practice')
    assert.equal(await page.locator('.why-blast, .recall-gate, .lockin-recall, .story-strip, .is-story-strip').count(), 0, 'kept card never mounts the slide, the gate or a story strip')
    const before = await progressOf(page)
    const stamp = lociStampFor('ph-road')
    const format = (await page.locator('.quick-review-plot-hit').count()) > 0 ? 'C' : (await page.locator('.quick-review-flip').count()) > 0 ? 'A' : 'B'
    assert.equal(format, 'C', `after format A the kept review is C (never A, never B), got ${format}`)
    const keptGold = await page.evaluate(keptGoldCues)
    assert.equal(keptGold.length, 1, `kept card (${due ? 'due' : 'not due'}): exactly one gold cue, got [${keptGold.join(' | ')}]`)
    assert.match(keptGold[0], /quick-review-map-tap/, `kept card (${due ? 'due' : 'not due'}): the gold cue is the map tap line`)
    assert.ok(await page.locator('.quick-review-map-tap.is-now').isVisible(), `kept card (${due ? 'due' : 'not due'}): the gold cue is on screen`)
    assert.equal(await page.evaluate(fontViolations).then((list) => list.length), 0, 'kept card font floors')
    await page.locator(`.quick-review-plot-hit[data-plot-id="${stamp.plotId}"]`).click()
    await page.getByRole('button', { name: 'I had it' }).waitFor()
    assert.deepEqual(await page.evaluate(fontViolations), [], 'kept card reveal font floors')
    const revealGold = await page.evaluate(goldCues)
    assert.equal(revealGold.length, 1, `kept card reveal: one gold cue, got [${revealGold.join(' | ')}]`)
    assert.match(revealGold[0], /btn/, 'kept card reveal: the gold cue is the I had it button')
    assert.ok(await page.getByRole('button', { name: 'I had it' }).isVisible(), 'kept card reveal: the gold button is on screen')
    await page.evaluate(() => {
      window.__scrolls = 0
    })
    await page.getByRole('button', { name: 'I had it' }).click()
    await page.locator('main[aria-label="Home"]').waitFor()
    await page.waitForTimeout(400)
    assert.equal(await page.evaluate(() => window.__scrolls), 1, 'kept card ends with one route change to Home')
    const after = await progressOf(page)
    assert.deepEqual(after.lessonScore, before.lessonScore, 'kept card never touches the tier score')
    assert.deepEqual(after.lessonTier, before.lessonTier, 'kept card never touches the tier')
    assert.deepEqual(after.held, before.held, 'kept card never calls recordHeld')
    if (due) {
      assert.equal(after.memory['ph-road'].reviews, before.memory['ph-road'].reviews + 1, 'due: one recall review write')
      assert.equal(after.memory['ph-road'].lastFormat, 'C')
    } else {
      assert.deepEqual(after.memory, before.memory, 'not due: practice writes nothing')
    }
  })
}
await keptCase(yesterday, true)
await keptCase('2099-01-01', false)
await keptCase(yesterday, true, VIEWPORTS[2])

// ----- Hard save keeps the Hard gate -----
await session(
  {
    viewport: VIEWPORTS[0],
    seed: save({
      easyMode: false,
      completed: ['ph-road'],
      held: [],
      memory: {},
    }),
  },
  async (page) => {
    const easyOn = await page.evaluate(() => document.documentElement.getAttribute('data-easy'))
    assert.notEqual(easyOn, 'on', 'Hard save is not Easy')
    assert.equal(await page.locator('.lockin-recall, .why-blast').count(), 0, 'Hard Home shows no Easy Lock In')
  },
)
assert.match(recallSrc, /phase === 'claim'[\s\S]*?recall-choices/, 'Hard RecallGate still asks the claim first')
assert.match(recallSrc, /setPhase\('teach'\)/, 'Hard RecallGate still teaches')

assert.deepEqual(consoleErrors, [], `console errors: ${consoleErrors.join(' | ')}`)
await browser.close()
await server.close()

console.log(frameLog.join('\n'))
console.log(`check-lockin-843: shots in ${shotDir}`)
console.log('check-lockin-843: ok')
