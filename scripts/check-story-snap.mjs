import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { createServer } from 'vite'
import { chromium } from '@playwright/test'
import { localDateKey } from '../src/lib/dates.ts'
import { EASY } from '../src/lib/easy.ts'
import { EASY_LINE_ORDER, easyMatchLine, progressAfterMatchTaught } from '../src/easyTrail/trail/loop.ts'
import {
  GATE_AT,
  SNAP_SCORE,
  SNAPS_TO_OPEN,
  STORY_SNAP_AGAIN,
  STORY_SNAP_BEATS,
  STORY_SNAP_CLAIM,
  STORY_SNAP_LINE,
  STORY_SNAP_WIN,
  allBeatsLocked,
  applyDemoSnap,
  beatProgress,
  demoCountsLocked,
  inSnapWindow,
  lockedAfterMiss,
  missPointsLost,
  missToast,
  nextBeatIndex,
} from '../src/lib/storySnap.ts'
import { lessonStory, storyPlayFor } from '../src/lib/storyPlay.ts'

assert.equal(STORY_SNAP_LINE, 'daily-lantern')
assert.equal(STORY_SNAP_CLAIM, 'A lamp is meant to be seen.')
assert.equal(STORY_SNAP_WIN, 'STORY OPEN!')
assert.equal(STORY_SNAP_AGAIN, 'One more snap')
assert.equal(EASY.snapAgain, STORY_SNAP_AGAIN)
assert.equal(SNAPS_TO_OPEN, 3)
assert.equal(STORY_SNAP_BEATS.length, 3)
assert.equal(storyPlayFor('daily-lantern'), 'story-snap')
assert.equal(lessonStory('daily-lantern').play, 'story-snap')
assert.equal(storyPlayFor('ph-debt'), 'panel-blast')
assert.equal(GATE_AT, 0.5)
assert.equal(beatProgress(0, 2200), 0)
assert.equal(beatProgress(2200, 2200), 1)
assert.equal(inSnapWindow(0.5), true)
assert.equal(inSnapWindow(0), false)
assert.equal(nextBeatIndex([]), 0)
assert.equal(nextBeatIndex(['lamp']), 1)
assert.equal(allBeatsLocked(['lamp', 'hill', 'seen']), true)
assert.equal(allBeatsLocked(['lamp']), false)

for (const score of [0, 25, 100]) {
  const lost = missPointsLost(score, true)
  assert.equal(lost, 0, `Easy miss at ${score} has delta 0`)
  assert.equal(/\d/.test(missToast(lost)), false, 'Easy miss toast has no digit')
}
const hardAtZero = missPointsLost(0, false)
assert.equal(hardAtZero, 0)
assert.equal(missToast(hardAtZero).includes('25'), false, 'Hard miss at 0 drops the 25')
assert.equal(missPointsLost(SNAP_SCORE, false), SNAP_SCORE)
assert.match(missToast(SNAP_SCORE), /25/)

const kept = ['lamp', 'hill']
const afterMiss = lockedAfterMiss(kept)
assert.deepEqual(afterMiss, kept)
assert.ok(afterMiss.length >= kept.length, 'Easy miss never shrinks the locked list')
assert.deepEqual(lockedAfterMiss([]), [])

assert.equal(applyDemoSnap(0), 0, 'demo beat gives 0 points')
assert.equal(applyDemoSnap(40), 40)
const demoLocked = demoCountsLocked([], 'lamp')
assert.deepEqual(demoLocked, ['lamp'], 'demo beat counts as locked')
assert.equal(demoCountsLocked(demoLocked, 'lamp').length, demoLocked.length)

const lanternAt = EASY_LINE_ORDER.indexOf(STORY_SNAP_LINE)
assert.ok(lanternAt > 0)
const priorLines = EASY_LINE_ORDER.slice(0, lanternAt)
const lanternLoop = { easyHeld: [...priorLines], easyTaught: [...priorLines] }
assert.equal(easyMatchLine(lanternLoop), STORY_SNAP_LINE)
assert.equal(
  easyMatchLine(progressAfterMatchTaught(lanternLoop, STORY_SNAP_LINE)),
  STORY_SNAP_LINE,
  'teaching the lantern does not move the Easy line',
)

const playSrc = readFileSync(
  new URL('../src/components/challenges/StorySnapPlayView.tsx', import.meta.url),
  'utf8',
)
assert.match(playSrc, /is-story-snap/)
assert.match(playSrc, /STORY OPEN/)

const wire = readFileSync(new URL('../src/lib/storyPlay.ts', import.meta.url), 'utf8')
assert.match(wire, /STORY_SNAP_LINE/)
assert.match(wire, /story-snap/)

assert.match(playSrc, /STORY_SNAP_HINT/)
assert.doesNotMatch(
  playSrc,
  /className="quiet">\{STORY_SNAP_HINT\}/,
  'pad owns how — no quiet STORY_SNAP_HINT chrome (#189)',
)
assert.match(playSrc, /claimShown \? \(/)

// Easy Clear 1.4.163: omit Learn-lead STORY_SNAP_TEACH reprint — Fixes #209
assert.doesNotMatch(
  playSrc,
  /className="snap-teach"/,
  'Snap play peels Learn-lead snap-teach (#209)',
)
assert.doesNotMatch(
  playSrc,
  /\{STORY_SNAP_TEACH\}/,
  'no STORY_SNAP_TEACH in Snap play JSX (#209)',
)
assert.match(playSrc, /easy-who-where-line/, 'quiet who·place stays')
assert.match(playSrc, /1\.4\.163.*#209|#209.*omit STORY_SNAP_TEACH/)

const snapCss = readFileSync(new URL('../src/styles/storySnap.css', import.meta.url), 'utf8')
assert.match(snapCss, /max-height:\s*720px/)
assert.match(snapCss, /\.snap-teach/)
assert.match(snapCss, /-webkit-line-clamp:\s*2/)


// Easy Clear 1.4.157: Home whisper short next-step (not full snapHunt) — Fixes #203
const easyUiSnap = readFileSync(new URL('../src/lib/easyUi.ts', import.meta.url), 'utf8')
const hubSnapSrc = readFileSync(new URL('../src/components/Hub.tsx', import.meta.url), 'utf8')
assert.match(easyUiSnap, /snapHome: 'One more snap\.'/)
assert.doesNotMatch(easyUiSnap, /snapHome: 'Tap when a beat/)
assert.match(hubSnapSrc, /EASY\.snapHome/)
assert.match(hubSnapSrc, /1\.4\.157.*whisper|#203/)


// Easy Clear 1.4.182: Story Snap ≤720 HUD peel — hide eyebrow + who·where (invent Fun/Clear)
assert.match(playSrc, /1\.4\.182: ≤720 peels HUD/)
assert.match(snapCss, /1\.4\.182: Story Snap ≤720 HUD peel/)
assert.match(
  snapCss,
  /@media \(max-height: 720px\) \{[\s\S]*?\.play\.is-story-snap \.eyebrow \{[\s\S]*?display: none/,
)
assert.match(
  snapCss,
  /@media \(max-height: 720px\) \{[\s\S]*?\.play\.is-story-snap \.easy-who-where-line \{[\s\S]*?display: none/,
)

const SIZES = [
  [375, 667, false],
  [412, 915, true],
  [768, 1024, true],
]

function readCard() {
  const root = document.documentElement
  const card = document.querySelector('.snap-result')
  const text = (el) => (el ? el.textContent.replace(/\s+/g, ' ').trim() : '')
  return {
    hold: card?.getAttribute('data-snap-hold') ?? '',
    stamp: text(card?.querySelector('.win-stamp')),
    beats: [...document.querySelectorAll('.snap-result-beats li')].map((el) => el.textContent.trim()),
    claim: text(card?.querySelector('.snap-claim')),
    score: text(card?.querySelector('.snap-result-score')),
    again: text(document.querySelector('.cta-dock .text-link')),
    docX: root.scrollWidth - root.clientWidth,
    win: document.querySelector('.play.is-story-snap.is-win') != null,
  }
}

async function launchBrowser() {
  try {
    return await chromium.launch({ headless: true })
  } catch {
    return await chromium.launch({ headless: true, channel: 'chrome' })
  }
}

async function snapOnce(page) {
  const before = await page.locator('.snap-chip.is-locked').count()
  const outcome = await page.evaluate((prev) => {
    return new Promise((resolve) => {
      const pad = document.querySelector('.snap-pad')
      let frames = 0
      let clicks = 0
      let last = ''
      function poke() {
        frames += 1
        const label = (pad?.textContent || '').replace(/\s+/g, ' ').trim()
        last = label
        if (label.includes('SNAP!')) {
          clicks += 1
          pad.dispatchEvent(
            new PointerEvent('pointerdown', {
              bubbles: true,
              cancelable: true,
              pointerId: 1,
              pointerType: 'mouse',
              isPrimary: true,
            }),
          )
        }
        const locked = document.querySelectorAll('.snap-chip.is-locked').length
        if (locked > prev) {
          resolve({ ok: true, frames, clicks })
          return
        }
        if (frames > 700) {
          resolve({
            ok: false,
            frames,
            clicks,
            last,
            toast: document.querySelector('.match-toast')?.textContent || '',
          })
          return
        }
        requestAnimationFrame(poke)
      }
      requestAnimationFrame(poke)
    })
  }, before)
  if (!outcome.ok) throw new Error(`snap did not lock from ${before} ${JSON.stringify(outcome)}`)
}

/** Easy Story Snap: demo hand, then the win card stays at least 5s. */
export async function checkSnapHold() {
  const today = localDateKey()
  const save = {
    kind: 'silver-city-save',
    schemaVersion: 1,
    appVersion: '1.4.477',
    savedAt: `${today}T12:00:00.000Z`,
    progress: {
      started: true,
      easyMode: true,
      theme: 'candy',
      completed: [],
      lastDailyDate: today,
      held: [],
      easyHeld: [...priorLines],
      easyTaught: [...priorLines],
    },
  }
  const root = fileURLToPath(new URL('..', import.meta.url))
  const server = await createServer({
    root,
    server: { host: '127.0.0.1', port: 0 },
    logLevel: 'error',
  })
  await server.listen()
  const address = server.httpServer?.address()
  const port = address && typeof address === 'object' ? address.port : 0
  assert.ok(port > 0, '1.4.477 story-snap server has a port')
  const browser = await launchBrowser()
  try {
    for (const [width, height, reduceMotion] of SIZES) {
      const where = `${width}×${height}`
      const context = await browser.newContext({
        baseURL: `http://127.0.0.1:${port}/`,
        viewport: { width, height },
        deviceScaleFactor: 1,
        reducedMotion: reduceMotion ? 'reduce' : 'no-preference',
      })
      await context.addInitScript((payload) => {
        localStorage.setItem('silver-city-progress-v1', JSON.stringify(payload))
      }, save)
      const page = await context.newPage()
      const errors = []
      page.on('pageerror', (err) => errors.push(String(err)))
      page.on('console', (msg) => {
        if (msg.type() === 'error') errors.push(msg.text())
      })
      await page.goto('/', { waitUntil: 'domcontentloaded' })
      await page.getByRole('button', { name: /Snap/ }).click()
      await page.locator('.play.is-story-snap').waitFor()
      await page.locator('.snap-ghost').waitFor()
      const ghost = await page.evaluate(() => {
        const el = document.querySelector('.snap-ghost')
        return {
          hidden: el?.getAttribute('aria-hidden') ?? '',
          svg: Boolean(el?.querySelector('svg')),
          img: el?.querySelector('img') != null,
        }
      })
      assert.equal(ghost.hidden, 'true', `${where} ghost hand is hidden from assistive tech`)
      assert.equal(ghost.svg, true, `${where} ghost hand is drawn`)
      assert.equal(ghost.img, false, `${where} ghost hand is not an image`)
      await page.locator('.snap-pad').click()
      const seen = { tap: false, still: false, score: '' }
      const started = Date.now()
      while (Date.now() - started < 8000) {
        const snap = await page.evaluate(() => ({
          tap: Boolean(document.querySelector('.snap-ghost.is-tap')),
          still: Boolean(document.querySelector('.snap-ghost.is-still')),
          locked: document.querySelectorAll('.snap-chip.is-locked').length,
          score: document.querySelector('.match-score')?.textContent?.trim() ?? '',
        }))
        if (snap.tap) seen.tap = true
        if (snap.still) seen.still = true
        if (snap.locked >= 1) {
          seen.score = snap.score
          break
        }
        await page.waitForTimeout(30)
      }
      assert.equal(seen.score, '0', `${where} demo beat gives 0 points`)
      if (reduceMotion) {
        assert.equal(seen.still, true, `${where} static hand hint`)
        assert.equal(seen.tap, false, `${where} static hand does not tap`)
      } else {
        assert.equal(seen.tap, true, `${where} ghost hand taps`)
      }
      assert.equal(await page.locator('.snap-chip.is-locked').count(), 1, `${where} demo counts as locked`)
      await snapOnce(page)
      await snapOnce(page)
      await page.locator('.snap-result').waitFor()
      const first = await page.evaluate(readCard)
      assert.equal(first.hold, 'open', `${where} holds the open card`)
      assert.equal(first.stamp, STORY_SNAP_WIN, `${where} shows STORY OPEN`)
      assert.deepEqual(first.beats, ['Lamp', 'Hill', 'Seen'], `${where} shows the three snaps`)
      assert.equal(first.claim, STORY_SNAP_CLAIM, `${where} shows the claim`)
      assert.equal(first.score, '150', `${where} final score counts the demo as 0`)
      assert.equal(first.win, true, `${where} stays on the win`)
      assert.ok(first.docX <= 1, `${where} has no horizontal scroll`)
      for (let sample = 0; sample < 10; sample += 1) {
        await page.waitForTimeout(500)
        const next = await page.evaluate(readCard)
        assert.equal(next.stamp, first.stamp, `${where} win card stays`)
        assert.deepEqual(next.beats, first.beats, `${where} snapped beats stay`)
        assert.equal(next.claim, first.claim, `${where} claim stays`)
        assert.equal(next.score, first.score, `${where} score stays`)
        assert.equal(next.hold, 'open', `${where} win card stays at least 5s`)
        assert.ok(next.docX <= 1, `${where} has no horizontal scroll`)
      }
      if (width === 375) {
        await page.getByRole('button', { name: STORY_SNAP_AGAIN }).click()
        await page.locator('.snap-pad', { hasText: 'Tap to start' }).waitFor()
        assert.equal(await page.locator('.snap-result').count(), 0, `${where} one more snap replays`)
        await page.waitForTimeout(1200)
        assert.equal(await page.locator('.snap-result').count(), 0, `${where} replay does not open on a timer`)
      }
      if (width === 768) {
        await page.locator('.cta-dock .btn.primary').click()
        await page.locator('.journal.is-easy-hold-practice').waitFor()
        assert.equal(await page.locator('.play.is-story-snap').count(), 0, `${where} Lock In next leaves the snap`)
      }
      assert.deepEqual(errors, [], `${where} has 0 console errors`)
      await context.close()
    }
  } finally {
    await browser.close()
    await server.close()
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  await checkSnapHold()
  console.log('check-story-snap: ok')
}
