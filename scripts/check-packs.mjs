import assert from 'node:assert/strict'
import { readFileSync, statSync } from 'node:fs'
import { emptyProgress } from '../src/lib/save.ts'
import { PACK_CATALOG, PACK_ISSUES, packLesson } from '../src/content/packCatalog.ts'
import { PACK_SCHEMA_VERSION } from '../src/content/packTypes.ts'
import { EASY_LINE_ORDER, FOUNDATION_ARC, DIG_ARC, easyHomeFocus, easyHoldPractice, easyLineTaught, easyLoopLine, easyMatchReady, easyWhoWhere } from '../src/lib/easy.ts'
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
assert.equal(PACK_CATALOG.lessons.length, 39)
assert.ok(statSync(new URL('../src/content/packs/parable-hollow.xml', import.meta.url)).size > 50000)
assert.ok(statSync(new URL('../src/content/packs/witness-bench.xml', import.meta.url)).size > 50000)
assert.ok(statSync(new URL('../src/content/packs/observatory.xml', import.meta.url)).size > 50000)
assert.ok(statSync(new URL('../src/content/packs/first-gate.xml', import.meta.url)).size > 50000)
assert.ok(statSync(new URL('../src/content/packs/high-lookout.xml', import.meta.url)).size > 50000)
assert.deepEqual(
  PACK_CATALOG.lessons.map((lesson) => lesson.easy.easyOrder).sort((a, b) => (a ?? 0) - (b ?? 0)),
  Array.from({ length: 39 }, (_, i) => i + 1),
)
assert.equal(EASY_LINE_ORDER.length, 39)
assert.deepEqual(EASY_LINE_ORDER.slice(0, 7), [
  'ph-road',
  'ph-father',
  'ph-debt',
  'fg-order',
  'fg-reason',
  'fg-ought',
  'fg-ground',
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
assert.equal(
  journalPoints({ ...hold, matchBonus: { 'ph-road': 100 } }),
  110,
)
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

assert.deepEqual([...FOUNDATION_ARC], ['fg-order', 'fg-reason', 'fg-ought', 'fg-ground'])
assert.deepEqual([...DIG_ARC], ['wb-creed', 'wb-women', 'wb-early', 'wb-method'])
assert.ok(EASY_LINE_ORDER.indexOf('ph-debt') < EASY_LINE_ORDER.indexOf('fg-order'))
assert.ok(EASY_LINE_ORDER.indexOf('fg-ground') < EASY_LINE_ORDER.indexOf('wb-creed'))
assert.ok(EASY_LINE_ORDER.indexOf('fg-ground') < EASY_LINE_ORDER.indexOf('fg-mover'))
assert.ok(EASY_LINE_ORDER.indexOf('ob-tuning') < EASY_LINE_ORDER.indexOf('fg-mover'))
assert.deepEqual(EASY_LINE_ORDER.slice(7, 12), [
  'wb-creed',
  'wb-women',
  'wb-early',
  'wb-method',
  'daily-lantern',
])

const creekHeld = {
  ...emptyProgress(),
  easyTaught: ['ph-road', 'ph-father', 'ph-debt'],
  easyHeld: ['ph-road', 'ph-father', 'ph-debt'],
}
assert.equal(easyLoopLine(creekHeld), 'fg-order')
assert.equal(easyLoopLine({ ...creekHeld, easyHeld: [...creekHeld.easyHeld, 'fg-order'] }), 'fg-reason')
assert.equal(
  easyLoopLine({ ...creekHeld, easyHeld: [...creekHeld.easyHeld, 'fg-order', 'fg-reason'] }),
  'fg-ought',
)
assert.equal(
  easyLoopLine({
    ...creekHeld,
    easyHeld: [...creekHeld.easyHeld, 'fg-order', 'fg-reason', 'fg-ought'],
  }),
  'fg-ground',
)
assert.equal(
  easyLoopLine({
    ...creekHeld,
    easyHeld: [...creekHeld.easyHeld, ...FOUNDATION_ARC],
  }),
  'wb-creed',
)
assert.equal(
  easyLoopLine({
    ...creekHeld,
    easyHeld: [...creekHeld.easyHeld, ...FOUNDATION_ARC, 'wb-creed'],
  }),
  'wb-women',
)
assert.equal(
  easyLoopLine({
    ...creekHeld,
    easyHeld: [...creekHeld.easyHeld, ...FOUNDATION_ARC, ...DIG_ARC],
  }),
  'daily-lantern',
)

const order = packLesson('fg-order')
assert.ok(order)
assert.match(order.claim, /Christ/)
assert.match(order.source, /Colossians 1:16/)
assert.doesNotMatch(order.claim, /Designer/)
assert.doesNotMatch(order.easy.learn, /fine-tun/i)
assert.doesNotMatch(order.easy.learn, /Pre-Reformation/i)

const reason = packLesson('fg-reason')
assert.ok(reason)
assert.match(reason.source, /John 1:1/)
assert.match(reason.source, /Romans 1:19/)
assert.match(reason.claim, /mind you already trust/)
assert.doesNotMatch(reason.claim, /The reason you already trust/)
assert.doesNotMatch(reason.easy.learn, /Pre-Reformation/i)

const ought = packLesson('fg-ought')
assert.ok(ought)
assert.match(ought.source, /Romans 2:14/)
assert.match(ought.claim, /Rocks cannot write/)
assert.doesNotMatch(ought.claim, /Finite nature/)
assert.doesNotMatch(ought.easy.learn, /fine-tun/i)
assert.doesNotMatch(ought.easy.learn, /Pre-Reformation/i)

const ground = packLesson('fg-ground')
assert.ok(ground)
assert.match(ground.claim, /living God/)
assert.match(ground.source, /Acts 17:24/)
assert.doesNotMatch(ground.claim, /might be/i)
assert.doesNotMatch(ground.easy.learn, /fine-tun/i)
assert.doesNotMatch(ground.easy.learn, /Pre-Reformation/i)

assert.deepEqual(easyWhoWhere('fg-order'), {
  who: 'Ansel',
  whoName: 'Ansel Gate',
  whoId: 'ansel',
  place: 'Why Gate',
})

assert.match(tuning.claim, /Designer/)
assert.notEqual(tuning.claim, ground.claim)

const creed = packLesson('wb-creed')
assert.ok(creed)
assert.equal(creed.claim, 'Paul hands on an early public creed: died, buried, raised, appeared.')
assert.match(creed.easy.hold.why, /Christ was buried and seen/)
assert.doesNotMatch(creed.easy.hold.why, /resists a merely/)

const women = packLesson('wb-women')
assert.ok(women)
assert.match(women.claim, /Jesus/)
assert.doesNotMatch(women.claim, /if invented/)
assert.doesNotMatch(women.easy.hold.why, /if the goal were/)
assert.doesNotMatch(women.easy.learn, /If you only wanted/)

const early = packLesson('wb-early')
assert.ok(early)
assert.match(early.claim, /Christ/)
assert.doesNotMatch(early.claim, /late legend/)
assert.doesNotMatch(early.easy.hold.why, /received formula/)

const method = packLesson('wb-method')
assert.ok(method)
assert.match(method.claim, /Jesus/)
assert.match(method.source, /Luke 1:1/)
assert.doesNotMatch(method.source, /Standard historical method/)
assert.doesNotMatch(method.claim, /Ordinary historical tools/)
assert.doesNotMatch(method.easy.hold.why, /Multiple attestation/)

for (const id of DIG_ARC) {
  const lesson = packLesson(id)
  assert.ok(lesson, id)
  assert.doesNotMatch(lesson.claim, /if invented|late legend|pious novel/i, `${id} claim hedge`)
  assert.doesNotMatch(lesson.easy.hold.why, /if invented|if the goal were/i, `${id} reason hedge`)
}

const teachSrc = readFileSync(new URL('../src/components/TeachUnlock.tsx', import.meta.url), 'utf8')
assert.match(teachSrc, /HeldTriad/)
assert.match(teachSrc, /omitClaim/)
const storeSrc = readFileSync(new URL('../src/components/StoredLine.tsx', import.meta.url), 'utf8')
assert.match(storeSrc, /HeldTriad/)
assert.match(storeSrc, /sayTomorrow/)
const journalSrc = readFileSync(new URL('../src/components/Journal.tsx', import.meta.url), 'utf8')
assert.match(journalSrc, /HeldTriad/)
assert.match(journalSrc, /claim, why, and from/)
const blastSrc = readFileSync(
  new URL('../src/components/challenges/WhyBlastPlay.tsx', import.meta.url),
  'utf8',
)
assert.match(blastSrc, /EASY\.sayFrom/)
assert.match(blastSrc, /source/)
assert.doesNotMatch(blastSrc, /One more/)

console.log('check-packs: ok')
