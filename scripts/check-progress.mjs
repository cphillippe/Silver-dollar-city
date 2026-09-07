import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { parableHollow } from '../src/content/parableHollow.ts'
import { observatory } from '../src/content/observatory.ts'

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
assert.match(journalSrc, /autoQuiz && quizBrief/)
assert.match(journalSrc, /kicker=\{STORY\.takeaway\}/)
assert.doesNotMatch(journalSrc, /Quiz me again/)

console.log('check-progress: ok')
