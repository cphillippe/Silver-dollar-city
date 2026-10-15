import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { createServer } from 'vite'
import { chromium } from '@playwright/test'
import { localDateKey } from '../src/lib/dates.ts'
import { EASY } from '../src/lib/easy.ts'
import { EASY_LINE_ORDER, easyMatchLine, progressAfterMatchTaught } from '../src/easyTrail/trail/loop.ts'
import {
  BEAT_TRAVEL_MS,
  DEMO_HOLD_MS,
  EASY_SNAP_MS,
  GATE_AT,
  SNAP_SCORE,
  SNAP_WINDOW,
  SNAPS_TO_OPEN,
  STORY_SNAP_AGAIN,
  STORY_SNAP_BEATS,
  STORY_SNAP_CLAIM,
  STORY_SNAP_LINE,
  STORY_SNAP_WIN,
  allBeatsLocked,
  applyDemoSnap,
  beatPastGate,
  beatProgress,
  beatCoversGate,
  demoCountsLocked,
  demoTravelMs,
  easySnapStars,
  flyPastIsMiss,
  inSnapWindow,
  lockedAfterDemo,
  snapLabelLit,
  WIN_INPUT_LOCK_MS,
  winReplayBlocked,
  lockedAfterMiss,
  missOnFlyPast,
  missPointsLost,
  missToast,
  nextBeatIndex,
  snapWindowFraction,
  travelMs,
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
assert.equal(snapWindowFraction(BEAT_TRAVEL_MS, false), SNAP_WINDOW)
const easyWindow = snapWindowFraction(BEAT_TRAVEL_MS, true)
assert.ok(Math.abs(easyWindow * BEAT_TRAVEL_MS - EASY_SNAP_MS) < 1, 'Easy snap window is about 0.6s')
assert.ok(easyWindow > SNAP_WINDOW, 'Easy window is wider than Hard')
assert.equal(inSnapWindow(0.5, easyWindow), true)
assert.equal(beatPastGate(GATE_AT + easyWindow / 2 + 0.01, easyWindow), true)
assert.equal(beatPastGate(0.5, easyWindow), false)
assert.equal(missOnFlyPast(false), false, 'Easy fly-past with no tap is not a miss')
assert.equal(missOnFlyPast(true), true, 'a tap outside the window is a miss')
assert.equal(flyPastIsMiss(false, true), false, 'Easy ignores an untapped fly-past')
assert.equal(flyPastIsMiss(false, false), true, 'Hard still counts an untapped fly-past as a miss')
assert.equal(flyPastIsMiss(true, false), true, 'Hard still counts a tapped fly-past as a miss')
assert.equal(flyPastIsMiss(true, true), true, 'Easy still counts a tap outside the window as a miss')
assert.equal(easySnapStars(0), '☆☆☆')
assert.equal(easySnapStars(1), '★☆☆')
assert.equal(easySnapStars(3), '★★★')
assert.deepEqual(lockedAfterDemo(['lamp']), ['lamp'])
assert.deepEqual(lockedAfterDemo([]), [], 'the demo does not grant a star')
assert.equal(WIN_INPUT_LOCK_MS >= 800, true, 'the win ignores a quick second tap')
assert.equal(winReplayBlocked(400), true)
assert.equal(winReplayBlocked(WIN_INPUT_LOCK_MS), false)
assert.equal(snapLabelLit(true, false, true), false, 'Easy SNAP stays dark until the card is under the gate')
assert.equal(snapLabelLit(true, true, true), true)
assert.equal(snapLabelLit(false, true, true), false)
assert.equal(snapLabelLit(true, false, false), true, 'Hard SNAP still follows the timing window')
assert.equal(beatCoversGate(0, 100, 50), true)
assert.equal(beatCoversGate(0, 100, 10), false, 'an edge clip is not under the gate')
assert.equal(/\d/.test(easySnapStars(3)), false, 'Easy stars have no digit')
assert.ok(demoTravelMs(false) > travelMs(false), 'the demo crosses slower than a player beat')
assert.ok(DEMO_HOLD_MS >= 600, 'the demo rests under the gate long enough to read')
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
assert.match(
  playSrc,
  /: easy \? \(\s*<div className="snap-pad snap-pad-slot" aria-hidden="true" \/>\s*\) : null/,
  'Hard has no .snap-pad-slot on the win screen',
)
assert.match(
  playSrc,
  /recycleBeat\(flyPastIsMiss\(tappedRef\.current, easyRef\.current\)\)/,
  'the fly-past miss is gated on Easy',
)
assert.doesNotMatch(playSrc, /recycleBeat\(missOnFlyPast\(/)

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
assert.match(
  snapCss,
  /html\[data-easy='on'\] \.play\.is-story-snap \.snap-pad-slot/,
  'the SNAP placeholder is Easy only',
)
assert.doesNotMatch(
  snapCss,
  /(^|\n)\.play\.is-story-snap \.snap-pad-slot \{/,
  'Hard does not keep the SNAP placeholder gap',
)
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
    stamp: text(card?.querySelector('.snap-result-win')),
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
      let started = false
      let unfair = 0
      let last = ''
      function coversGate() {
        const beat = document.querySelector('.snap-beat')?.getBoundingClientRect()
        const gate = document.querySelector('.snap-gate')?.getBoundingClientRect()
        if (!beat || !gate || beat.right <= beat.left) return false
        const inset = (beat.right - beat.left) * 0.22
        const gateX = gate.left + gate.width / 2
        return gateX >= beat.left + inset && gateX <= beat.right - inset
      }
      function poke() {
        frames += 1
        const label = (pad?.textContent || '').replace(/\s+/g, ' ').trim()
        last = label
        const arm = label.includes('Tap to start') && !started
        if (arm) started = true
        if (label.includes('SNAP!') && !coversGate()) unfair += 1
        if (arm || label.includes('SNAP!')) {
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
          resolve({ ok: true, frames, clicks, unfair })
          return
        }
        if (frames > 700) {
          resolve({
            ok: false,
            frames,
            clicks,
            unfair,
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
  if (outcome.unfair) throw new Error(`SNAP lit off the gate ${JSON.stringify(outcome)}`)
}

/** Easy Story Snap: demo hand, then the win card stays at least 5s. */
export async function checkSnapHold() {
  const today = localDateKey()
  const save = {
    kind: 'silver-city-save',
    schemaVersion: 1,
    appVersion: '1.4.481',
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
  assert.ok(port > 0, '1.4.481 story-snap server has a port')
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
      const aim = await page.evaluate(() => {
        const hand = document.querySelector('.snap-ghost')?.getBoundingClientRect()
        const gate = document.querySelector('.snap-gate')?.getBoundingClientRect()
        const score = document.querySelector('.match-score')?.getBoundingClientRect()
        const stage = document.querySelector('.snap-stage')?.getBoundingClientRect()
        if (!hand || !gate || !score || !stage) return null
        const gateX = gate.left + gate.width / 2
        const handX = hand.left + hand.width / 2
        const midL = score.left + score.width / 3
        const midR = score.right - score.width / 3
        const coversMid =
          hand.right > midL && hand.left < midR && hand.bottom > score.top && hand.top < score.bottom
        const fingerY = hand.bottom
        const gateY = gate.top + gate.height / 2
        const scoreY = score.top + score.height / 2
        return {
          nearGate: Math.abs(handX - gateX) < 36,
          coversMid,
          closerToGate: Math.abs(fingerY - gateY) < Math.abs(fingerY - scoreY),
          inStage: hand.top >= stage.top - 1 && hand.bottom <= stage.bottom + 8,
        }
      })
      assert.ok(aim, `${where} ghost hand is on the lane`)
      assert.equal(aim.nearGate, true, `${where} the hand points at the gate`)
      assert.equal(aim.coversMid, false, `${where} the hand does not cover the middle star`)
      assert.equal(aim.closerToGate, true, `${where} the hand aims at the gate, not the stars`)
      assert.equal(aim.inStage, true, `${where} the hand stays on the lane`)
      await page.locator('.snap-pad').click()
      const seen = { tap: false, still: false, score: '' }
      const started = Date.now()
      while (Date.now() - started < 8000) {
        const snap = await page.evaluate(() => ({
          tap: Boolean(document.querySelector('.snap-ghost.is-tap')),
          still: Boolean(document.querySelector('.snap-ghost.is-still')),
          locked: document.querySelectorAll('.snap-chip.is-locked').length,
          score: document.querySelector('.match-score')?.textContent?.trim() ?? '',
          ghost: Boolean(document.querySelector('.snap-ghost')),
          pad: (document.querySelector('.snap-pad')?.textContent || '').replace(/\s+/g, ' ').trim(),
        }))
        if (snap.tap) seen.tap = true
        if (snap.still) seen.still = true
        if (!snap.ghost && snap.pad.includes('Tap to start')) {
          seen.score = snap.score
          break
        }
        await page.waitForTimeout(30)
      }
      assert.equal(seen.score, easySnapStars(0), `${where} stars start empty`)
      assert.equal(/\d/.test(seen.score), false, `${where} in-play score has no digit`)
      if (reduceMotion) {
        assert.equal(seen.still, true, `${where} static hand hint`)
        assert.equal(seen.tap, false, `${where} static hand does not tap`)
      } else {
        assert.equal(seen.tap, true, `${where} ghost hand taps`)
      }
      assert.equal(await page.locator('.snap-chip.is-locked').count(), 0, `${where} the demo grants no star`)
      await page.locator('.snap-pad', { hasText: 'Tap to start' }).waitFor()
      const waiting = await page.evaluate(() => ({
        toast: document.querySelector('.match-toast')?.textContent || '',
        locked: document.querySelectorAll('.snap-chip.is-locked').length,
        pad: (document.querySelector('.snap-pad')?.textContent || '').replace(/\s+/g, ' ').trim(),
      }))
      assert.doesNotMatch(waiting.toast, /Miss/, `${where} demo does not miss`)
      assert.match(waiting.pad, /Tap to start/, `${where} first beat waits`)
      await page.waitForTimeout(1800)
      const stillWaiting = await page.evaluate(() => ({
        toast: document.querySelector('.match-toast')?.textContent || '',
        locked: document.querySelectorAll('.snap-chip.is-locked').length,
        pad: (document.querySelector('.snap-pad')?.textContent || '').replace(/\s+/g, ' ').trim(),
      }))
      assert.doesNotMatch(stillWaiting.toast, /Miss/, `${where} no tap is not a miss`)
      assert.equal(stillWaiting.locked, 0, `${where} the next beat does not fly on its own`)
      assert.match(stillWaiting.pad, /Tap to start/, `${where} pad still waits for the first tap`)
      await snapOnce(page)
      await snapOnce(page)
      await snapOnce(page)
      await page.locator('.snap-result').waitFor()
      const first = await page.evaluate(readCard)
      assert.equal(first.hold, 'open', `${where} holds the open card`)
      assert.equal(first.stamp, STORY_SNAP_WIN, `${where} shows STORY OPEN`)
      assert.deepEqual(first.beats, ['Lamp', 'Hill', 'Seen'], `${where} shows the three snaps`)
      assert.equal(first.claim, STORY_SNAP_CLAIM, `${where} shows the claim`)
      assert.equal(first.score, easySnapStars(SNAPS_TO_OPEN), `${where} win shows stars, not 150`)
      assert.equal(/\d/.test(first.score), false, `${where} win score has no digit`)
      assert.equal(
        await page.getByRole('button', { name: EASY.holdNext }).count(),
        1,
        `${where} one Lock In next`,
      )
      assert.equal(await page.locator('button.snap-pad').count(), 0, `${where} the snap button is gone on the win`)
      const againSpot = await page.evaluate(() => {
        const again = document.querySelector('.snap-again')?.getBoundingClientRect()
        const slot = document.querySelector('.snap-pad-slot')?.getBoundingClientRect()
        if (!again || !slot) return null
        const overlap =
          again.bottom > slot.top &&
          again.top < slot.bottom &&
          again.right > slot.left &&
          again.left < slot.right
        return { overlap, againH: again.height }
      })
      assert.ok(againSpot, `${where} One more snap sits beside a held SNAP spot`)
      assert.equal(againSpot.overlap, false, `${where} One more snap is not on the SNAP spot`)
      assert.ok(againSpot.againH < 48, `${where} One more snap is not a SNAP-sized button`)
      await page.evaluate(() => {
        document.querySelector('.snap-again')?.dispatchEvent(
          new MouseEvent('click', { bubbles: true, cancelable: true }),
        )
      })
      assert.equal(await page.locator('.snap-result').count(), 1, `${where} replay is locked on the win`)
      assert.equal(
        await page.locator('.snap-stage .win-stamp').count(),
        0,
        `${where} no stamp sits in the lane`,
      )
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
        assert.equal(
          await page.getByRole('button', { name: EASY.holdNext }).count(),
          1,
          `${where} Lock In next stays one button`,
        )
        assert.equal(
          await page.locator('.snap-stage .win-stamp').count(),
          0,
          `${where} the lane stays clear`,
        )
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
