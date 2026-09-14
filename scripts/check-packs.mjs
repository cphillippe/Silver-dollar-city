import assert from 'node:assert/strict'
import { statSync } from 'node:fs'
import { emptyProgress } from '../src/lib/save.ts'
import { PACK_CATALOG, PACK_ISSUES, packLesson } from '../src/content/packCatalog.ts'
import { PACK_SCHEMA_VERSION } from '../src/content/packTypes.ts'
import { EASY_LINE_ORDER, easyHomeFocus, easyHoldPractice, easyLineTaught, easyLoopLine, easyMatchReady, easyWhoWhere } from '../src/lib/easy.ts'
import {
  applyHoldFail,
  applyHoldSuccess,
  currentLessonTier,
  journalPoints,
  journalTierCounts,
  lessonPoints,
  needsTierHold,
} from '../src/lib/tiers.ts'
import { STREET_FACT_IDS } from '../src/content/links.ts'
import { evidenceFor, evidenceForTier } from '../src/content/evidence.ts'

assert.equal(PACK_ISSUES.length, 0, PACK_ISSUES.map((item) => `${item.file}: ${item.message}`).join('\n'))
assert.equal(PACK_CATALOG.schemaVersion, PACK_SCHEMA_VERSION)
assert.equal(PACK_CATALOG.lessons.length, 35)
assert.ok(statSync(new URL('../src/content/packs/parable-hollow.xml', import.meta.url)).size > 50000)
assert.ok(statSync(new URL('../src/content/packs/witness-bench.xml', import.meta.url)).size > 50000)
assert.ok(statSync(new URL('../src/content/packs/observatory.xml', import.meta.url)).size > 50000)
assert.ok(statSync(new URL('../src/content/packs/first-gate.xml', import.meta.url)).size > 50000)
assert.ok(statSync(new URL('../src/content/packs/high-lookout.xml', import.meta.url)).size > 50000)
assert.deepEqual(
  PACK_CATALOG.lessons.map((lesson) => lesson.easy.easyOrder).sort((a, b) => (a ?? 0) - (b ?? 0)),
  Array.from({ length: 35 }, (_, i) => i + 1),
)
assert.equal(EASY_LINE_ORDER.length, 35)
assert.deepEqual(EASY_LINE_ORDER.slice(0, 9), [
  'ph-road',
  'ph-father',
  'ph-debt',
  'wb-creed',
  'wb-women',
  'daily-lantern',
  'daily-stars',
  'daily-cosmos',
  'hl-moral',
])
assert.equal(EASY_LINE_ORDER[0], 'ph-road')
assert.equal(EASY_LINE_ORDER[1], 'ph-father')
assert.ok(EASY_LINE_ORDER.indexOf('ph-father') < EASY_LINE_ORDER.indexOf('wb-creed'))
assert.deepEqual([...EASY_LINE_ORDER].sort(), [...STREET_FACT_IDS].sort())

const mercy = packLesson('ph-road')
assert.ok(mercy)
assert.equal(mercy.claim, 'Neighbor is the one who shows mercy.')
assert.equal(mercy.easy.points, 10)
assert.equal(mercy.medium.points, 12)
assert.equal(mercy.hard.points, 15)
assert.equal(mercy.easy.hold.levelUpTo, 'medium')
assert.equal(mercy.medium.hold.levelUpTo, 'hard')
assert.equal(mercy.easy.hold.onFail, 'easy')
assert.equal(mercy.medium.hold.onFail, 'easy')
assert.equal(mercy.hard.hold.onFail, 'easy')
assert.equal(mercy.easy.match.sentence, mercy.claim)
assert.equal(mercy.medium.match.sentence, mercy.claim)
assert.equal(mercy.hard.match.sentence, mercy.claim)
assert.match(mercy.easy.learn, /Samaritan/)
assert.ok(mercy.hard.learn.length > mercy.easy.learn.length)

const father = packLesson('ph-father')
assert.ok(father)
assert.equal(
  father.easy.learn,
  'Jesus tells about a son who takes his share early and wastes it far from home. Hungry and ashamed, he starts a hired-hand speech to ask for work. But his father sees him while he is still a long way off and runs — mercy before the speech is done. He hugs the son. Honor is spent so the lost one can be welcomed; the feast is the father’s idea.',
)

const stars = packLesson('daily-stars')
assert.ok(stars)
assert.match(stars.claim, /Maker/)
assert.doesNotMatch(stars.claim, /multiverse/i)
assert.doesNotMatch(stars.easy.learn, /multiverse/i)

const tuning = packLesson('ob-tuning')
assert.ok(tuning)
assert.match(tuning.claim, /Designer/)

for (const lesson of PACK_CATALOG.lessons) {
  assert.equal(lesson.easy.points, 10, `${lesson.id} Easy points`)
  assert.equal(lesson.medium.points, 12, `${lesson.id} Medium points`)
  assert.equal(lesson.hard.points, 15, `${lesson.id} Hard points`)
  assert.equal(lesson.easy.match.sentence, lesson.claim, `${lesson.id} Easy match claim`)
  assert.equal(lesson.medium.match.sentence, lesson.claim, `${lesson.id} Medium match claim`)
  assert.equal(lesson.hard.match.sentence, lesson.claim, `${lesson.id} Hard match claim`)
  assert.equal(lesson.easy.hold.onFail, 'easy')
  const brief = evidenceFor(lesson.id)
  assert.equal(brief?.claim, lesson.claim)
  const easyBrief = evidenceForTier(lesson.id, 'easy')
  assert.equal(easyBrief?.claim, lesson.claim)
}

const fresh = emptyProgress()
assert.equal(easyLoopLine(fresh), 'ph-road')
assert.equal(easyMatchReady(fresh), true)
assert.equal(Object.keys(fresh.lessonScore).length, 0)
assert.equal(currentLessonTier(fresh, 'ph-road'), 'easy')

let hold = applyHoldSuccess(fresh, 'ph-road')
assert.equal(hold.lessonScore['ph-road'], 10)
assert.equal(hold.lessonTier['ph-road'], 'medium')
assert.equal(journalPoints(hold), 10)
assert.deepEqual(journalTierCounts(hold), { easy: 1, medium: 0, hard: 0 })

hold = applyHoldSuccess({ ...fresh, ...hold }, 'ph-road')
assert.equal(hold.lessonScore['ph-road'], 12)
assert.equal(hold.lessonTier['ph-road'], 'hard')
assert.equal(lessonPoints('medium', 'ph-road'), 12)

hold = applyHoldSuccess({ ...fresh, ...hold }, 'ph-road')
assert.equal(hold.lessonScore['ph-road'], 15)
assert.equal(hold.lessonTier['ph-road'], 'hard')

const failed = applyHoldFail({ ...fresh, ...hold }, 'ph-road')
assert.equal(failed.lessonTier['ph-road'], 'easy')
assert.equal(hold.lessonScore['ph-road'], 15)

const taughtMercy = { ...fresh, easyTaught: ['ph-road'] }
assert.equal(easyLineTaught(taughtMercy, 'ph-road'), true)
assert.equal(easyHomeFocus(taughtMercy), 'hold')

const heldMercy = { ...fresh, easyTaught: ['ph-road'], easyHeld: ['ph-road'] }
assert.equal(easyLoopLine(heldMercy), 'ph-father')
assert.equal(easyHomeFocus(heldMercy), 'match')

const trailDone = {
  ...fresh,
  easyTaught: [...EASY_LINE_ORDER],
  easyHeld: [...EASY_LINE_ORDER],
  lessonScore: Object.fromEntries(EASY_LINE_ORDER.map((id) => [id, 10])),
  lessonTier: Object.fromEntries(EASY_LINE_ORDER.map((id) => [id, 'medium'])),
}
assert.equal(easyLoopLine(trailDone), 'ph-road')
assert.equal(currentLessonTier(trailDone, 'ph-road'), 'medium')
assert.equal(easyLineTaught(trailDone, 'ph-road'), false)
assert.equal(needsTierHold(trailDone, 'ph-road'), true)
assert.equal(easyHoldPractice({ ...trailDone, tierTaught: { 'ph-road': 'medium' } }), true)

assert.deepEqual(easyWhoWhere('ph-road'), {
  who: 'Mercy',
  whoName: 'Mercy Wren',
  whoId: 'mercy',
  place: 'Story Creek',
})
assert.equal(easyWhoWhere('daily-lantern').whoId, 'juniper')
assert.equal(easyWhoWhere('daily-lantern').place, 'East porch')

const areaIds = new Set(PACK_CATALOG.areas.map((area) => area.id))
assert.ok(areaIds.has('parable-hollow'))
assert.ok(areaIds.has('witness-bench'))
assert.ok(areaIds.has('observatory'))
assert.ok(areaIds.has('first-gate'))
assert.ok(areaIds.has('high-lookout'))

console.log('check-packs: ok')
