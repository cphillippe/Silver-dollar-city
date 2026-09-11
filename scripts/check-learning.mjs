import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { emptyProgress } from '../src/lib/save.ts'
import {
  applySnooze,
  applySuccess,
  emptyTrace,
  isDue,
  nextGapLabel,
  pickSessionDue,
  recallsDoneToday,
} from '../src/lib/memory.ts'
import { RECALL_SESSION_CAP, sessionDue } from '../src/lib/recall.ts'
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

assert.match(learningBeat('td-watch'), /unkind sentence/)
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
assert.match(teachSrc, /WORDS\.claim\.teach/)
assert.match(teachSrc, /The main idea you will keep/)
assert.doesNotMatch(teachSrc, /A claim is the main idea we hold to be true/)
assert.match(teachSrc, /Short story/)
assert.match(teachSrc, /Skip reading/)
assert.ok(
  teachSrc.indexOf('teach-reason') < teachSrc.indexOf('brief.claim'),
  'TeachUnlock must tell the story before the claim line',
)

const hubSrc = readFileSync(
  new URL('../src/components/Hub.tsx', import.meta.url),
  'utf8',
)
assert.match(hubSrc, /RecallOffer/)
assert.doesNotMatch(hubSrc, /dustOff/)
assert.match(hubSrc, /Learn · hold · deploy/)

const recallSrc = readFileSync(
  new URL('../src/components/RecallGate.tsx', import.meta.url),
  'utf8',
)
assert.match(recallSrc, /Picture this/)
assert.match(recallSrc, /Rebuild the map/)
assert.match(recallSrc, /Not today/)
assert.match(recallSrc, /is-deeper/)
assert.match(recallSrc, /A new angle/)

const fiveDue = ['a', 'b', 'c', 'd', 'e'].map((id, index) =>
  emptyTrace(id, `pillar-${index}`, '2026-09-10'),
)
assert.equal(pickSessionDue(fiveDue, '2026-09-10', undefined, RECALL_SESSION_CAP).length, 3)
assert.equal(pickSessionDue(fiveDue, '2026-09-10', undefined, 1).length, 1)

const snoozed = applySnooze(emptyTrace('ph-road', 'parable-hollow', '2026-09-10'), '2026-09-10')
assert.equal(snoozed.nextReviewAt, '2026-09-11')
assert.equal(snoozed.reviews, 0)
assert.equal(isDue(snoozed, '2026-09-10'), false)

const reviewed = applySuccess(emptyTrace('ph-road', 'parable-hollow', '2026-09-10'), '2026-09-10')
assert.equal(recallsDoneToday({ 'ph-road': reviewed }, '2026-09-10'), 1)

const loaded = emptyProgress()
loaded.memory = {
  'ph-road': emptyTrace('ph-road', 'parable-hollow', '2026-09-10'),
}
assert.ok(sessionDue(loaded, '2026-09-10').length <= RECALL_SESSION_CAP)
assert.deepEqual(
  sessionDue(loaded, '2026-09-10', { day: '2026-09-10', ids: [], dismissed: true }),
  [],
)

assert.equal(
  readFileSync(new URL('../src/config/app.ts', import.meta.url), 'utf8').includes(
    'SAVE_SCHEMA_VERSION = 1',
  ),
  true,
)

console.log('check-learning: ok')
