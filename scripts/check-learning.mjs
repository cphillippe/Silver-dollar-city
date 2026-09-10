import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { emptyProgress } from '../src/lib/save.ts'
import {
  applySuccess,
  emptyTrace,
  isDue,
  nextGapLabel,
} from '../src/lib/memory.ts'
import {
  learningAnchor,
  learningBeat,
  learningFromReview,
  MEMORY_STAGES,
} from '../src/lib/learning.ts'

assert.deepEqual(MEMORY_STAGES, [
  'acquire',
  'anchor',
  'picture',
  'store',
  'recall',
  'deploy',
])

const empty = emptyProgress()
const event = {
  id: 'ph-road',
  pillar: 'parable-hollow',
  kind: 'encode',
  today: '2026-09-09',
  clean: true,
  peeked: false,
  elaborated: false,
}

const stored = learningFromReview(event, empty)
assert.equal(stored?.id, 'ph-road')
assert.match(stored?.claim ?? '', /Neighbor/)
assert.match(stored?.reason ?? '', /Samaritan/)
assert.match(stored?.source ?? '', /Luke/)
assert.match(stored?.anchor ?? '', /Mercy Wren/)
assert.match(stored?.anchor ?? '', /Parable Hollow/)
assert.equal(stored?.picture, 'heart')
assert.match(stored?.beat ?? '', /neighbor/i)
assert.equal(stored?.toolId, 'love')

const linked = learningFromReview(event, { ...empty, held: ['wb-creed'] })
assert.match(linked?.anchor ?? '', /after/)
assert.match(linked?.anchor ?? '', /creed/)

assert.match(learningBeat('td-watch'), /cheap line/)
assert.match(learningAnchor(empty, 'td-watch'), /Mercy Wren/)

const fresh = emptyTrace('ph-road', 'parable-hollow', '2026-09-09')
assert.equal(fresh.nextReviewAt, '2026-09-09')
assert.equal(fresh.reviews, 0)
assert.equal(isDue(fresh, '2026-09-09'), true)
assert.equal(nextGapLabel(fresh, '2026-09-09'), 'Dust off today')

const afterSameDay = applySuccess(fresh, '2026-09-09')
assert.equal(isDue(afterSameDay, '2026-09-09'), false)
assert.equal(afterSameDay.nextReviewAt, '2026-09-10')
assert.equal(afterSameDay.reviews, 1)
assert.equal(nextGapLabel(afterSameDay, '2026-09-09'), 'Returns tomorrow')

const afterDaily = applySuccess(afterSameDay, '2026-09-10')
assert.equal(afterDaily.nextReviewAt, '2026-09-13')

const oldMorning = {
  ...fresh,
  lastReviewAt: '2026-09-08',
  reviews: 1,
  nextReviewAt: '2026-09-09',
}
assert.equal(isDue(oldMorning, '2026-09-09'), true)

const journalSrc = readFileSync(
  new URL('../src/components/Journal.tsx', import.meta.url),
  'utf8',
)
assert.match(journalSrc, /stored-chapter/)
assert.match(journalSrc, /Stored lines/)
assert.match(journalSrc, /pictured as/)

const storeSrc = readFileSync(
  new URL('../src/components/StoredLine.tsx', import.meta.url),
  'utf8',
)
assert.match(storeSrc, /Say this out loud/)
assert.match(storeSrc, /stored-claim/)
assert.match(storeSrc, /DigDeeper/)

const teachSrc = readFileSync(
  new URL('../src/components/TeachUnlock.tsx', import.meta.url),
  'utf8',
)
assert.match(teachSrc, /Acquire/)
assert.match(teachSrc, /Hold this line to deploy/)
assert.match(teachSrc, /A claim is what we hold to be true/)
assert.match(teachSrc, /Learn first/)
assert.ok(
  teachSrc.indexOf('teach-reason') < teachSrc.indexOf('brief.claim'),
  'TeachUnlock must tell the story before the claim line',
)

const hubSrc = readFileSync(
  new URL('../src/components/Hub.tsx', import.meta.url),
  'utf8',
)
assert.match(hubSrc, /Dust off today’s line/)
assert.match(hubSrc, /sameDay/)
assert.match(hubSrc, /held\./)
assert.match(hubSrc, /Learn · hold · deploy/)

const recallSrc = readFileSync(
  new URL('../src/components/RecallGate.tsx', import.meta.url),
  'utf8',
)
assert.match(recallSrc, /Picture this/)
assert.match(recallSrc, /Rebuild the map/)

assert.equal(
  readFileSync(new URL('../src/config/app.ts', import.meta.url), 'utf8').includes(
    'SAVE_SCHEMA_VERSION = 1',
  ),
  true,
)

console.log('check-learning: ok')
