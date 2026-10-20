import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { parableHollow } from '../src/content/parableHollow.ts'
import { observatory } from '../src/content/observatory.ts'
import { EASY_OPEN_DAY_KEY, easyNightWatchOnHome } from '../src/content/goldenPath.ts'
import { EASY_LINE_ORDER, easyWordsHomeLine } from '../src/lib/easy.ts'
import { storyPlayFor } from '../src/lib/storyPlay.ts'

const progressSrc = readFileSync(new URL('../src/store/progress.ts', import.meta.url), 'utf8')
assert.match(progressSrc, /HOLLOW_WALKS_TO_WITNESS = 2/)
assert.match(progressSrc, /area\.id === 'witness-bench'/)
assert.match(progressSrc, /autoQuiz: true/)
assert.match(progressSrc, /title: STORY\.tapTakeaway/)
assert.match(progressSrc, /export function rehearseGo/)
assert.doesNotMatch(progressSrc, /walk a path again/)
assert.doesNotMatch(progressSrc, /walk a district again/)

const HOLLOW_WALKS_TO_WITNESS = 2

function hollowWalksDone(completed) {
  return parableHollow.challenges.filter((challenge) =>
    completed.includes(challenge.id),
  ).length
}

function isWitnessUnlocked(completed) {
  return hollowWalksDone(completed) >= HOLLOW_WALKS_TO_WITNESS
}

assert.equal(isWitnessUnlocked([]), false)
assert.equal(isWitnessUnlocked(['ph-road']), false)
assert.equal(isWitnessUnlocked(['ph-road', 'ph-father']), true)
assert.equal(isWitnessUnlocked(['ph-road', 'ph-father', 'ph-seeds']), true)
assert.equal(isWitnessUnlocked(['ph-debt']), false)
assert.equal(
  observatory.order > 2,
  true,
  'later districts still sit behind Witness',
)

const journalSrc = readFileSync(
  new URL('../src/components/Journal.tsx', import.meta.url),
  'utf8',
)
const holdPracticeSrc = readFileSync(
  new URL('../src/easyTrail/lockIn/HoldPractice.tsx', import.meta.url),
  'utf8',
)
assert.match(journalSrc, /autoQuiz && quizBrief/)
assert.match(holdPracticeSrc, /kicker=\{STORY\.tapTakeaway\}/)
assert.doesNotMatch(journalSrc, /Quiz me again/)
assert.doesNotMatch(holdPracticeSrc, /Quiz me again/)

assert.equal(easyWordsHomeLine('ob-tuning'), 'Find the words at Sky Watch.')
assert.equal(easyWordsHomeLine('ph-debt'), 'Find the words at Story Creek.')
assert.equal(easyWordsHomeLine('fg-order'), 'Find the words at Why Gate Arch.')
assert.equal(easyWordsHomeLine('fg-reason'), 'More words at Why Gate Arch, part 2.')
assert.match(easyWordsHomeLine('fg-ought'), /More words at Why Gate Arch, part 3\./)
for (let i = 0; i < EASY_LINE_ORDER.length - 1; i += 1) {
  const left = EASY_LINE_ORDER[i]
  const right = EASY_LINE_ORDER[i + 1]
  if (storyPlayFor(left) !== 'panel-blast' || storyPlayFor(right) !== 'panel-blast') continue
  assert.notEqual(
    easyWordsHomeLine(left),
    easyWordsHomeLine(right),
    `${left} and ${right} share a Home headline`,
  )
}

const hubSrc = readFileSync(new URL('../src/components/Hub.tsx', import.meta.url), 'utf8')
assert.match(hubSrc, /easyNightWatchOnHome\(/)
const nightAt = hubSrc.indexOf('easy-night-watch')
assert.equal(
  hubSrc.slice(0, nightAt).includes('(progress.easyHeld ?? []).length > 0 ? ('),
  false,
  'Home Night Watch uses easyNightWatchOnHome',
)

const nightStore = new Map()
globalThis.localStorage = {
  getItem(key) {
    return nightStore.has(key) ? nightStore.get(key) : null
  },
  setItem(key, value) {
    nightStore.set(key, String(value))
  },
}
assert.equal(easyNightWatchOnHome({ easyHeld: [] }, '2026-10-20'), false)
assert.equal(easyNightWatchOnHome({ easyHeld: ['ph-road'] }, '2026-10-20'), true)
localStorage.setItem(EASY_OPEN_DAY_KEY, '2026-10-20')
assert.equal(easyNightWatchOnHome({ easyHeld: ['ph-road'] }, '2026-10-20'), false)
assert.equal(easyNightWatchOnHome({ easyHeld: ['ph-road'] }, '2026-10-21'), true)

console.log('check-progress: ok')
