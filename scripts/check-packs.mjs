import assert from 'node:assert/strict'
import { readFileSync, statSync } from 'node:fs'
import { emptyProgress } from '../src/lib/save.ts'
import { PACK_CATALOG, PACK_ISSUES, packLesson } from '../src/content/packCatalog.ts'
import { PACK_SCHEMA_VERSION } from '../src/content/packTypes.ts'
import { EASY_LINE_ORDER, FOUNDATION_ARC, DIG_ARC, NAMES_ARC, STONE_ARC, INK_ARC, easyHomeFocus, easyHoldPractice, easyLineTaught, easyLoopLine, easyMatchReady, easyWhoWhere } from '../src/lib/easy.ts'
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
assert.equal(PACK_CATALOG.lessons.length, 45)
assert.ok(statSync(new URL('../src/content/packs/parable-hollow.xml', import.meta.url)).size > 50000)
assert.ok(statSync(new URL('../src/content/packs/witness-bench.xml', import.meta.url)).size > 50000)
assert.ok(statSync(new URL('../src/content/packs/observatory.xml', import.meta.url)).size > 50000)
assert.ok(statSync(new URL('../src/content/packs/first-gate.xml', import.meta.url)).size > 50000)
assert.ok(statSync(new URL('../src/content/packs/high-lookout.xml', import.meta.url)).size > 50000)
assert.ok(statSync(new URL('../src/content/packs/stone-court.xml', import.meta.url)).size > 20000)
assert.ok(statSync(new URL('../src/content/packs/ink-court.xml', import.meta.url)).size > 20000)
assert.deepEqual(
  PACK_CATALOG.lessons.map((lesson) => lesson.easy.easyOrder).sort((a, b) => (a ?? 0) - (b ?? 0)),
  Array.from({ length: 45 }, (_, i) => i + 1),
)
assert.equal(EASY_LINE_ORDER.length, 45)
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
assert.ok(areaIds.has('stone-court'))
assert.ok(areaIds.has('ink-court'))

assert.deepEqual([...FOUNDATION_ARC], ['fg-order', 'fg-reason', 'fg-ought', 'fg-ground'])
assert.deepEqual([...DIG_ARC], ['wb-creed', 'wb-women', 'wb-early', 'wb-method'])
assert.deepEqual([...NAMES_ARC], ['daily-names', 'daily-creed', 'daily-empty'])
assert.deepEqual([...STONE_ARC], ['sc-tacitus', 'sc-james', 'sc-pliny'])
assert.deepEqual([...INK_ARC], ['ic-trajan', 'ic-suetonius', 'ic-lucian'])
assert.ok(EASY_LINE_ORDER.indexOf('ph-debt') < EASY_LINE_ORDER.indexOf('fg-order'))
assert.ok(EASY_LINE_ORDER.indexOf('fg-ground') < EASY_LINE_ORDER.indexOf('wb-creed'))
assert.ok(EASY_LINE_ORDER.indexOf('fg-ground') < EASY_LINE_ORDER.indexOf('fg-mover'))
assert.ok(EASY_LINE_ORDER.indexOf('ob-tuning') < EASY_LINE_ORDER.indexOf('fg-mover'))
assert.ok(EASY_LINE_ORDER.indexOf('wb-method') < EASY_LINE_ORDER.indexOf('daily-names'))
assert.ok(EASY_LINE_ORDER.indexOf('daily-empty') < EASY_LINE_ORDER.indexOf('daily-lantern'))
assert.ok(EASY_LINE_ORDER.indexOf('daily-stars') > EASY_LINE_ORDER.indexOf('daily-lantern'))
assert.deepEqual(EASY_LINE_ORDER.slice(7, 14), [...DIG_ARC, ...NAMES_ARC])

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
  'daily-names',
)
assert.equal(
  easyLoopLine({
    ...creekHeld,
    easyHeld: [...creekHeld.easyHeld, ...FOUNDATION_ARC, ...DIG_ARC, 'daily-names'],
  }),
  'daily-creed',
)
assert.equal(
  easyLoopLine({
    ...creekHeld,
    easyHeld: [...creekHeld.easyHeld, ...FOUNDATION_ARC, ...DIG_ARC, 'daily-names', 'daily-creed'],
  }),
  'daily-empty',
)
assert.equal(
  easyLoopLine({
    ...creekHeld,
    easyHeld: [...creekHeld.easyHeld, ...FOUNDATION_ARC, ...DIG_ARC, ...NAMES_ARC],
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
assert.match(reason.easy.hold.why, /Christ/)
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
assert.match(packLesson('fg-limits')?.easy.hold.why ?? '', /Christ/)
assert.doesNotMatch(packLesson('fg-limits')?.easy.hold.why ?? '', /not yet the whole gospel/)
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

const names = packLesson('daily-names')
assert.ok(names)
assert.match(names.claim, /Christ/)
assert.doesNotMatch(names.claim, /resurrection claim stacks/i)

const creedClose = packLesson('daily-creed')
assert.ok(creedClose)
assert.match(creedClose.claim, /Christ/)
assert.doesNotMatch(creedClose.claim, /creed sits between/i)
assert.doesNotMatch(creedClose.easy.hold.why, /If the formula is early/i)
assert.doesNotMatch(creedClose.easy.learn, /If that short line is early/i)

const emptyTomb = packLesson('daily-empty')
assert.ok(emptyTomb)
assert.match(emptyTomb.claim, /Jesus/)
assert.match(emptyTomb.easy.hold.why, /stone rolled away/)
assert.doesNotMatch(emptyTomb.easy.hold.why, /does not sand/i)

for (const id of NAMES_ARC) {
  const lesson = packLesson(id)
  assert.ok(lesson, id)
  assert.doesNotMatch(lesson.claim, /if invented|if the formula is early|late legend/i, `${id} claim hedge`)
  assert.doesNotMatch(lesson.easy.hold.why, /If the formula is early|does not sand/i, `${id} reason hedge`)
}

const debtLine = packLesson('ph-debt')
assert.ok(debtLine)
assert.match(debtLine.claim, /Forgiven much/)
assert.doesNotMatch(debtLine.claim, /contradiction/)
assert.doesNotMatch(debtLine.easy.hold.why, /throttl|contradiction/i)
assert.doesNotMatch(debtLine.easy.learn, /contradiction/)
assert.doesNotMatch(debtLine.easy.gloss ?? '', /^If /)

const moral = packLesson('hl-moral')
assert.ok(moral)
assert.match(moral.claim, /Duty is more than taste/)
assert.doesNotMatch(moral.claim, /theism/i)

const mind = packLesson('hl-mind')
assert.ok(mind)
assert.match(mind.easy.hold.why, /Mind is there at the start/)
assert.doesNotMatch(mind.easy.hold.why, /Theism/)

const meaning = packLesson('hl-meaning')
assert.ok(meaning)
assert.equal(meaning.claim, 'Meaning is received, not only built.')
assert.doesNotMatch(meaning.claim, /asks whether/)

const leibniz = packLesson('ob-leibniz')
assert.ok(leibniz)
assert.equal(leibniz.claim, 'Something is here — it did not have to be.')
assert.match(leibniz.source, /Psalm 8/)
assert.match(leibniz.easy.hold.why, /Psalm 8/)
assert.doesNotMatch(leibniz.claim, /cosmological model/)
assert.doesNotMatch(leibniz.easy.hold.why, /model still starts/)

const lantern = packLesson('daily-lantern')
assert.ok(lantern)
assert.equal(lantern.claim, 'A lamp is meant to be seen.')
assert.match(lantern.easy.hold.why, /city on a hill cannot be hidden/)
assert.doesNotMatch(lantern.easy.hold.why, /lamp and a hill city are meant to be seen/)

const beauty = packLesson('hl-beauty')
assert.ok(beauty)
assert.match(beauty.claim, /that hunger names a real country/)
assert.doesNotMatch(beauty.claim, /usually/)
assert.match(beauty.easy.hold.why, /Psalm 19/)
assert.doesNotMatch(beauty.easy.hold.why, /sunset wakes a hunger/)

const lifeMark = packLesson('ob-life')
assert.ok(lifeMark)
assert.match(lifeMark.easy.hold.why, /way a mind writes/)
assert.doesNotMatch(lifeMark.easy.hold.why, /looks like/)

const dailyLife = packLesson('daily-life')
assert.ok(dailyLife)
assert.match(dailyLife.easy.hold.why, /gifts from a Maker/)
assert.doesNotMatch(dailyLife.easy.hold.why, /look given/)

const grace = packLesson('daily-grace')
assert.ok(grace)
assert.match(grace.easy.hold.why, /God moves first/)
assert.doesNotMatch(grace.easy.hold.why, /The claim is that/)

const door = packLesson('daily-door')
assert.ok(door)
assert.match(door.easy.hold.why, /Jesus is the door/)
assert.doesNotMatch(door.easy.hold.why, /lock you in a pew/)

const tacitus = packLesson('sc-tacitus')
assert.ok(tacitus)
assert.match(tacitus.claim, /Christus/)
assert.match(tacitus.claim, /Pilate/)
assert.match(tacitus.source, /Annals 15\.44/)
assert.doesNotMatch(tacitus.claim, /empty tomb/)
assert.doesNotMatch(tacitus.easy.hold.why, /empty tomb/)
assert.doesNotMatch(tacitus.easy.learn, /^If /)

const james = packLesson('sc-james')
assert.ok(james)
assert.match(james.claim, /Jesus/)
assert.match(james.claim, /Christ/)
assert.match(james.source, /20\.200/)
assert.doesNotMatch(james.source, /18\.63/)
assert.doesNotMatch(james.claim, /Testimonium/)
assert.doesNotMatch(james.easy.hold.why, /disputed/)
assert.doesNotMatch(james.easy.learn, /^If /)

const pliny = packLesson('sc-pliny')
assert.ok(pliny)
assert.match(pliny.claim, /Christ/)
assert.match(pliny.source, /10\.96/)
assert.doesNotMatch(pliny.claim, /hide/)
assert.doesNotMatch(pliny.easy.learn, /^If /)

for (const id of STONE_ARC) {
  const lesson = packLesson(id)
  assert.ok(lesson, id)
  assert.match(lesson.claim, /Christ/)
  assert.doesNotMatch(lesson.claim, /if invented|might be|perhaps/i, `${id} claim hedge`)
  assert.doesNotMatch(lesson.easy.hold.why, /If |might be|perhaps/i, `${id} reason hedge`)
}

assert.deepEqual(easyWhoWhere('sc-tacitus'), {
  who: 'Silas',
  whoName: 'Silas Whitman',
  whoId: 'silas',
  place: 'Stone Court',
})
assert.equal(easyWhoWhere('sc-james').place, 'Stone Court')
assert.equal(easyWhoWhere('sc-pliny').place, 'Stone Court')
assert.ok(EASY_LINE_ORDER.indexOf('daily-door') < EASY_LINE_ORDER.indexOf('sc-tacitus'))
assert.deepEqual(EASY_LINE_ORDER.slice(39, 42), [...STONE_ARC])
assert.equal(
  easyLoopLine({
    ...emptyProgress(),
    easyHeld: [...EASY_LINE_ORDER.slice(0, 39)],
  }),
  'sc-tacitus',
)
assert.equal(
  easyLoopLine({
    ...emptyProgress(),
    easyHeld: [...EASY_LINE_ORDER.slice(0, 39), 'sc-tacitus'],
  }),
  'sc-james',
)
assert.equal(
  easyLoopLine({
    ...emptyProgress(),
    easyHeld: [...EASY_LINE_ORDER.slice(0, 39), 'sc-tacitus', 'sc-james'],
  }),
  'sc-pliny',
)
assert.deepEqual(EASY_LINE_ORDER.slice(42, 45), [...INK_ARC])
assert.equal(easyWhoWhere('ic-trajan').place, 'Ink Court')
assert.equal(easyWhoWhere('ic-suetonius').place, 'Ink Court')
assert.equal(easyWhoWhere('ic-lucian').place, 'Ink Court')
const trajan = packLesson('ic-trajan')
assert.ok(trajan)
assert.match(trajan.claim, /do not hunt/)
assert.match(trajan.source, /10\.97/)
assert.doesNotMatch(trajan.easy.learn, /^If /)
const suetonius = packLesson('ic-suetonius')
assert.ok(suetonius)
assert.match(suetonius.claim, /Nero/)
assert.match(suetonius.source, /16\.2/)
assert.doesNotMatch(suetonius.claim, /Chrestus/)
assert.doesNotMatch(suetonius.easy.learn, /^If /)
const lucian = packLesson('ic-lucian')
assert.ok(lucian)
assert.match(lucian.claim, /crucified/)
assert.match(lucian.source, /Peregrinus/)
assert.doesNotMatch(lucian.claim, /believed/)
assert.doesNotMatch(lucian.easy.learn, /^If /)

for (const id of INK_ARC) {
  const lesson = packLesson(id)
  assert.ok(lesson, id)
  assert.match(lesson.claim, /Christ/)
  assert.doesNotMatch(lesson.claim, /if invented|might be|perhaps/i, `${id} claim hedge`)
  assert.doesNotMatch(lesson.easy.hold.why, /If |might be|perhaps/i, `${id} reason hedge`)
}
assert.equal(
  easyLoopLine({
    ...emptyProgress(),
    easyHeld: [...EASY_LINE_ORDER.slice(0, 42)],
  }),
  'ic-trajan',
)
assert.equal(
  easyLoopLine({
    ...emptyProgress(),
    easyHeld: [...EASY_LINE_ORDER.slice(0, 42), 'ic-trajan'],
  }),
  'ic-suetonius',
)
assert.equal(
  easyLoopLine({
    ...emptyProgress(),
    easyHeld: [...EASY_LINE_ORDER.slice(0, 42), 'ic-trajan', 'ic-suetonius'],
  }),
  'ic-lucian',
)

const kalam = packLesson('fg-kalam')
assert.ok(kalam)
assert.match(kalam.claim, /What begins has a cause/)
assert.doesNotMatch(kalam.claim, /^If /)
assert.doesNotMatch(kalam.easy.learn, /^If /)

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
assert.match(blastSrc, /why-claim[\s\S]*?\{locked[\s\S]*?EASY\.sayFrom/)
assert.match(blastSrc, /MatchTakeaway/)
assert.doesNotMatch(blastSrc, /One more/)
const recallSrc = readFileSync(new URL('../src/components/RecallGate.tsx', import.meta.url), 'utf8')
assert.match(recallSrc, /phase === 'teach'[\s\S]*?EASY\.sayFrom/)

console.log('check-packs: ok')
