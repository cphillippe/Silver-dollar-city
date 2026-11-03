import assert from 'node:assert/strict'
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { emptyProgress } from '../src/lib/save.ts'
import { GOLDEN, GOLDEN_SCREEN_TARGETS, PLAY_SCREEN_IDS, REPLAY_GOLDS } from '../src/content/goldenPath.ts'
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
import { plainFor } from '../src/content/plain.ts'
import { evidenceFor, evidenceForTier } from '../src/content/evidence.ts'
import { EASY_CHROME, easyKidVerses } from '../src/lib/easyChrome.ts'
import { matchChipsFor } from '../src/lib/gemSearch.ts'
import { lociStampFor } from '../src/lib/lociStamp.ts'
import { lineTakeaway, matchClearBeat } from '../src/lib/successBeat.ts'
import { APP_VERSION } from '../src/config/app.ts'
import { PACK_XML } from '../src/content/packEmbedded.ts'

assert.equal(PACK_ISSUES.length, 0, PACK_ISSUES.map((item) => `${item.file}: ${item.message}`).join('\n'))
assert.equal(PACK_CATALOG.schemaVersion, PACK_SCHEMA_VERSION)

const packDir = join(dirname(fileURLToPath(import.meta.url)), '../src/content/packs')
const indexXml = readFileSync(new URL('../src/content/packs/index.xml', import.meta.url), 'utf8')
const goldenXml = readFileSync(new URL('../src/content/packs/golden-path.xml', import.meta.url), 'utf8')
const indexLines = [...goldenXml.matchAll(/<line\s+id="([^"]+)"\s+pack="([^"]+)"\s*\/>/g)].map(
  (match, index) => ({ id: match[1], easyOrder: index + 1, pack: match[2] }),
)
const indexIds = indexLines.map((line) => line.id)
assert.doesNotMatch(indexXml, /<easyShelf[\s>]/, 'index.xml easyShelf moved to golden-path.xml')
assert.equal(new Set(indexIds).size, indexIds.length, 'index lesson ids are unique')
const shelf = [...indexLines].sort((a, b) => a.easyOrder - b.easyOrder).map((line) => line.id)
const declaredCount = [...indexXml.matchAll(/\blessonCount="(\d+)"/g)]
  .map((match) => Number(match[1]))
  .reduce((sum, count) => sum + count, 0)
assert.equal(declaredCount, shelf.length, 'pack lessonCount matches the index lines')
assert.equal(PACK_CATALOG.lessons.length, shelf.length, 'every index lesson loads')
const catalogIds = PACK_CATALOG.lessons.map((lesson) => lesson.id)
assert.equal(new Set(catalogIds).size, catalogIds.length, 'loaded lesson ids are unique')
assert.deepEqual([...catalogIds].sort(), [...indexIds].sort())
for (const line of indexLines) {
  const lesson = packLesson(line.id)
  assert.ok(lesson, `${line.id} loads`)
  assert.equal(lesson.areaId, line.pack, `${line.id} has its index pillar`)
}
assert.ok(statSync(new URL('../src/content/packs/parable-hollow.xml', import.meta.url)).size > 50000)
assert.ok(statSync(new URL('../src/content/packs/witness-bench.xml', import.meta.url)).size > 50000)
assert.ok(statSync(new URL('../src/content/packs/observatory.xml', import.meta.url)).size > 50000)
assert.ok(statSync(new URL('../src/content/packs/first-gate.xml', import.meta.url)).size > 50000)
assert.ok(statSync(new URL('../src/content/packs/high-lookout.xml', import.meta.url)).size > 50000)
assert.ok(statSync(new URL('../src/content/packs/stone-court.xml', import.meta.url)).size > 20000)
assert.ok(statSync(new URL('../src/content/packs/ink-court.xml', import.meta.url)).size > 20000)
assert.deepEqual(
  PACK_CATALOG.lessons.map((lesson) => lesson.easy.easyOrder).sort((a, b) => (a ?? 0) - (b ?? 0)),
  Array.from({ length: shelf.length }, (_, i) => i + 1),
)
assert.equal(EASY_LINE_ORDER.length, shelf.length)
assert.deepEqual([...EASY_LINE_ORDER], shelf)
assert.deepEqual(EASY_LINE_ORDER.slice(0, 7), [
  'ph-road',
  'ph-father',
  'ob-tuning',
  'ph-debt',
  'fg-order',
  'fg-reason',
  'fg-ought',
])
assert.equal(EASY_LINE_ORDER[0], 'ph-road')
assert.equal(EASY_LINE_ORDER[1], 'ph-father')
assert.equal(EASY_LINE_ORDER[2], 'ob-tuning')
assert.ok(EASY_LINE_ORDER.indexOf('ph-father') < EASY_LINE_ORDER.indexOf('wb-creed'))
for (const id of STREET_FACT_IDS) {
  assert.ok(shelf.includes(id), `${id} is an index lesson`)
}

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

const EASY_CLAIM = 'The world is set just right for life. God made it that way on purpose.'
const EASY_REASON =
  "Life needs many things set just right, all at once. Luck can't do that. God, the Maker, can."
const EASY_STORY =
  "Space grows at just the right speed. Tiny bits stick together just right. Change one a little, and there's no life. God set them all on purpose."
const EASY_CLUE = 'God set the world just right for life, on purpose.'
const EASY_CHROME_46 = 'God wanted people, so He made the world just right.'
const PSALM_KID =
  'The sky tells how great God is. It shows the work of His hands. (Psalm 19:1, kid words)'
const ROMANS_KID =
  'Since God made the world, we can clearly see His forever power in the things He made. (Romans 1:20, kid words)'
const OLD_CLAIM = 'The universe is finely tuned for life — that fit points to a Designer.'
const OLD_REASON = 'Life needs tight numbers — chance does not explain that.'
const OLD_STORY =
  'Life needs very tight numbers: how fast space expands, how atoms stick, how tidy the start was. Design predicts a world we can live in. Blind chance does not.'
const MULTIVERSE_BS =
  'Some say luck did it with lots of other worlds. No one has ever seen even one of those worlds.'

assert.equal(tuning.easy.learn, EASY_STORY)

// #821 BS Oct 28: Easy GATE_WRONG copies use the new kid lines; the old ones are gone.
{
  const OLD_GATE_WRONG = [
    'The settings for life could be almost anything, so luck explains it.',
    "The numbers for life aren't special at all.",
  ]
  const NEW_GATE_WRONG = ['Stars look tiny because they are far away.', 'The sun comes up every morning.']
  const root = join(dirname(fileURLToPath(import.meta.url)), '..')
  const nr = readFileSync(join(root, 'public/night-run/index.html'), 'utf8')
  const gw = nr.match(/GATE_WRONG:(\[[^\]]*\])/)
  assert.ok(gw, 'Night Run COPY.GATE_WRONG missing')
  assert.deepEqual(JSON.parse(gw[1].replace(/'/g, '"')), NEW_GATE_WRONG, 'Night Run COPY.GATE_WRONG must be the BS Oct 28 lines')
  const cm = nr.match(/const CONTENT=(\{.*?\});\n/s)
  assert.ok(cm, 'Night Run CONTENT missing')
  const obt = JSON.parse(cm[1]).ART.find((a) => a.id === 'ob-tuning')
  assert.deepEqual(obt?.gate?.wrong, NEW_GATE_WRONG, 'Night Run CONTENT ob-tuning gate.wrong must be the BS Oct 28 lines')
  const ec = readFileSync(join(root, 'src/lib/easyChrome.ts'), 'utf8')
  for (const old of OLD_GATE_WRONG) {
    assert.ok(!nr.includes(old) && !nr.includes(old.replace("'", "\\'")), `old GATE_WRONG still in Night Run: ${old}`)
    assert.ok(!ec.includes(old) && !ec.includes(old.replace("'", "\\'")), `old GATE_WRONG still in easyChrome.ts: ${old}`)
    assert.ok(!Object.values(EASY_CHROME).includes(old), `old GATE_WRONG still an EASY_CHROME value: ${old}`)
  }
  assert.equal(
    EASY_CHROME['Life-permitting ranges are wide; blank chance predicts a habitable cosmos just as well.'],
    NEW_GATE_WRONG[0],
    'easyChrome kid swap for the wide-ranges miss must be the BS Oct 28 line',
  )
}
assert.equal(tuning.easy.gloss, EASY_CLAIM)
assert.equal(tuning.easy.match.sentence, EASY_CLAIM)
assert.equal(tuning.easy.hold.claim, EASY_CLAIM)
assert.equal(tuning.easy.hold.why, EASY_REASON)
assert.equal(evidenceForTier('ob-tuning', 'easy')?.claim, EASY_CLAIM)
assert.equal(evidenceForTier('ob-tuning', 'easy')?.reason, EASY_REASON)
assert.deepEqual(easyKidVerses('ob-tuning'), [PSALM_KID, ROMANS_KID])
for (const line of easyKidVerses('ob-tuning')) {
  assert.equal(line.includes('"'), false, 'kid paraphrases have no quote marks')
  assert.match(line, /, kid words\)$/)
}
assert.equal(
  EASY_CHROME[
    'Life-permitting ranges are extravagantly narrow; a Designer who wants observers leads us to expect that fit — blank indifference does not.'
  ],
  EASY_CHROME_46,
)
assert.match(matchChipsFor('ob-tuning')?.say ?? '', new RegExp(EASY_CLUE.replace(/[.]/g, '\\.')))
assert.equal(matchClearBeat('ob-tuning').title, `Yes · ${EASY_CLAIM.replace(/\.$/, '')}`)
assert.equal(matchClearBeat('ob-tuning').why, EASY_REASON)

const easyXml = readFileSync(new URL('../src/content/packs/observatory.xml', import.meta.url), 'utf8')
const tuningStart = easyXml.indexOf('<lesson id="ob-tuning"')
const easyBlock = easyXml.slice(
  easyXml.indexOf('<easy', tuningStart),
  easyXml.indexOf('<medium', tuningStart),
)
const forbidden = ['finely tuned', 'Designer', 'tight numbers', 'chance does not explain']
for (const phrase of forbidden) {
  assert.equal(easyBlock.includes(phrase), false, `Easy lesson 3 still has ${phrase}`)
}
assert.equal(easyBlock.includes('maybe'), false)
assert.equal(easyBlock.includes('some think'), false)
assert.equal(easyBlock.includes('not a proof'), false)
assert.equal(easyBlock.includes(MULTIVERSE_BS), false, 'Easy does not show the three-way multiverse choice')
assert.equal(easyBlock.includes('multiverse'), false)

assert.equal(
  tuning.medium.learn,
  'Life needs very tight numbers: how fast space expands, how atoms stick, how tidy the start was. Those life-permitting ranges are extravagantly narrow. Design predicts a world we can live in; blind chance does not. The fit points to a Designer.',
)
assert.equal(tuning.medium.gloss, OLD_CLAIM)
assert.equal(tuning.medium.match.sentence, OLD_CLAIM)
assert.equal(tuning.medium.hold.claim, OLD_CLAIM)
assert.equal(tuning.medium.hold.why, OLD_REASON)
assert.equal(tuning.hard.match.sentence, OLD_CLAIM)
assert.equal(tuning.hard.hold.claim, OLD_CLAIM)
assert.equal(tuning.hard.hold.why, OLD_REASON)
assert.match(tuning.hard.learn, /The universe is finely tuned for life — that fit points to a Designer\./)
assert.match(tuning.hard.learn, /Life needs tight numbers — chance does not explain that\./)
assert.equal(evidenceForTier('ob-tuning', 'medium')?.claim, OLD_CLAIM)
assert.equal(evidenceForTier('ob-tuning', 'medium')?.reason, OLD_REASON)
assert.equal(evidenceForTier('ob-tuning', 'hard')?.claim, OLD_CLAIM)
assert.equal(evidenceForTier('ob-tuning', 'hard')?.reason, OLD_REASON)
assert.equal(tuning.medium.learn.includes(EASY_STORY), false)
assert.equal(tuning.hard.learn.includes(EASY_CLAIM), false)
assert.equal(OLD_STORY === tuning.easy.learn, false)

function tierHoldClaim(lesson, tier) {
  return lesson[tier].hold.claim || lesson.claim
}

for (const lesson of PACK_CATALOG.lessons) {
  assert.equal(lesson.easy.points, 10, `${lesson.id} Easy points`)
  assert.equal(lesson.medium.points, 12, `${lesson.id} Medium points`)
  assert.equal(lesson.hard.points, 15, `${lesson.id} Hard points`)
  assert.equal(lesson.easy.match.sentence, tierHoldClaim(lesson, 'easy'), `${lesson.id} Easy match claim`)
  assert.equal(lesson.medium.match.sentence, tierHoldClaim(lesson, 'medium'), `${lesson.id} Medium match claim`)
  assert.equal(lesson.hard.match.sentence, tierHoldClaim(lesson, 'hard'), `${lesson.id} Hard match claim`)
  assert.equal(lesson.easy.hold.onFail, 'easy')
  const brief = evidenceFor(lesson.id)
  assert.equal(brief?.claim, tierHoldClaim(lesson, 'medium'), `${lesson.id} medium brief claim`)
  const easyBrief = evidenceForTier(lesson.id, 'easy')
  assert.equal(easyBrief?.claim, tierHoldClaim(lesson, 'easy'), `${lesson.id} easy brief claim`)
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
assert.deepEqual(EASY_LINE_ORDER.slice(8, 15), [...DIG_ARC, ...NAMES_ARC])

const creekHeld = {
  ...emptyProgress(),
  easyTaught: ['ph-road', 'ph-father', 'ob-tuning', 'ph-debt'],
  easyHeld: ['ph-road', 'ph-father', 'ob-tuning', 'ph-debt'],
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
  place: 'Why Gate Arch',
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

const DEBT_EASY = 'God forgives us a huge debt. So we forgive others.'
const ORDER_EASY = 'Christ made all things, and he holds them together.'
const DEBT_MH = 'Forgiven much, you cannot choke a neighbor over a little debt.'
const ORDER_MH = 'You already trust that the world holds together in Christ.'
const DEBT_STAMP = 'Forgiven much, you cannot choke a neighbor over'
const ORDER_STAMP = 'World holds in Christ'

function easySurfaces(id) {
  const lesson = packLesson(id)
  const tier = currentLessonTier(emptyProgress(), id)
  const journalEasy = evidenceForTier(id, tier)
  const lockIn = evidenceForTier(id, 'easy')
  const take = lineTakeaway(id)
  return {
    trail: plainFor(id)?.gloss ?? '',
    say: matchChipsFor(id)?.say ?? '',
    journalEasy: journalEasy?.claim ?? '',
    lockIn: lockIn?.claim ?? '',
    hold: lesson?.easy.hold.claim ?? '',
    match: lesson?.easy.match.sentence ?? '',
    gloss: lesson?.easy.gloss ?? '',
    takeaway: take.claim,
    win: matchClearBeat(id).title,
    choices: lockIn?.claimChoices ?? [],
  }
}

const debtCard = easyWhoWhere('ph-debt')
const debtSay = `${debtCard.whoName} marks the line at ${debtCard.place}: ${DEBT_EASY}`
const debtEasy = easySurfaces('ph-debt')
const orderEasy = easySurfaces('fg-order')

assert.equal(debtLine.easy.hold.claim, DEBT_EASY)
assert.equal(debtLine.easy.match.sentence, DEBT_EASY)
assert.equal(debtLine.easy.gloss, DEBT_EASY)
assert.equal(evidenceForTier('ph-debt', 'easy')?.claim, DEBT_EASY)
assert.equal(debtEasy.say, debtSay)
assert.equal(debtEasy.trail, DEBT_EASY)
assert.equal(debtEasy.journalEasy, DEBT_EASY)
assert.equal(debtEasy.lockIn, DEBT_EASY)
assert.equal(currentLessonTier(emptyProgress(), 'ph-debt'), 'easy')

const orderLine = packLesson('fg-order')
assert.ok(orderLine)
assert.equal(orderLine.easy.hold.claim, ORDER_EASY)
assert.equal(orderLine.easy.match.sentence, ORDER_EASY)
assert.equal(orderLine.easy.gloss, ORDER_EASY)
assert.equal(evidenceForTier('fg-order', 'easy')?.claim, ORDER_EASY)
assert.equal(orderEasy.trail, ORDER_EASY)
assert.equal(orderEasy.journalEasy, ORDER_EASY)
assert.equal(orderEasy.lockIn, ORDER_EASY)

for (const [id, easyClaim, oldClaim, surfaces] of [
  ['ph-debt', DEBT_EASY, DEBT_MH, debtEasy],
  ['fg-order', ORDER_EASY, ORDER_MH, orderEasy],
]) {
  const lesson = packLesson(id)
  for (const tier of ['medium', 'hard']) {
    assert.equal(lesson[tier].hold.claim, oldClaim, `${id} ${tier} claim stays`)
    assert.equal(lesson[tier].match.sentence, oldClaim, `${id} ${tier} match stays`)
    assert.equal(evidenceForTier(id, tier)?.claim, oldClaim, `${id} ${tier} brief stays`)
    const misses = [
      ...lesson[tier].hold.claimMisses,
      ...(evidenceForTier(id, tier)?.claimChoices ?? []),
    ]
    assert.equal(misses.includes(easyClaim), false, `${id} ${tier} has no Easy claim card`)
  }
  const easyMisses = [
    ...lesson.easy.hold.claimMisses,
    ...surfaces.choices.filter((line) => line !== easyClaim),
  ]
  assert.equal(easyMisses.includes(oldClaim), false, `${id} Easy has no Medium/Hard claim card`)
  assert.equal(easyMisses.includes(easyClaim), false, `${id} Easy claim is not a wrong card`)
  for (const [name, text] of Object.entries(surfaces)) {
    if (name === 'choices') continue
    assert.equal(String(text).includes(oldClaim), false, `${id} ${name} still has the old Easy claim`)
  }
}

assert.equal(lociStampFor('ph-debt').ideaShort, DEBT_STAMP)
assert.equal(lociStampFor('fg-order').ideaShort, ORDER_STAMP)
assert.equal(debtEasy.say.includes(DEBT_EASY), true)
assert.equal(orderEasy.say.includes(ORDER_MH), false)

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
assert.match(teachSrc, /claim=\{brief\.claim\}/)
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

assert.equal(GOLDEN.order.length, EASY_LINE_ORDER.length, 'golden-path order is the Easy line')
assert.deepEqual(
  GOLDEN.order.map((line) => line.id),
  [...EASY_LINE_ORDER],
  'EASY_LINE_ORDER is golden-path.xml order',
)
assert.equal(GOLDEN.firstSessionReadFirst, false, 'first session must not be Read-first')
assert.equal(GOLDEN.returningDayReadFirst, true, 'a returning day may gold the daily Read')
assert.ok(!PACK_CATALOG.areas.some((area) => area.id === 'golden-path' || area.file === 'golden-path.xml'), 'golden-path.xml is not a street')

const knownScreens = Object.keys(GOLDEN_SCREEN_TARGETS)
const seenScreens = new Set()
for (const screen of GOLDEN.screens) {
  assert.ok(!seenScreens.has(screen.id), `duplicate screen ${screen.id}`)
  seenScreens.add(screen.id)
  const allowed = GOLDEN_SCREEN_TARGETS[screen.id]
  assert.ok(allowed, `unknown screen id ${screen.id}`)
  assert.ok(allowed.includes(screen.gold), `unknown gold target ${screen.gold} on ${screen.id}`)
  const play = PLAY_SCREEN_IDS.includes(screen.id)
  if (play) {
    assert.equal(screen.gold, 'none', `${screen.id} is a play screen and must gold none`)
  } else {
    assert.notEqual(screen.gold, 'none', `${screen.id} needs one gold`)
    assert.equal(screen.gold.split(/[\s,]+/).filter(Boolean).length, 1, `${screen.id} has more than one gold`)
  }
  assert.notEqual(screen.gold, 'buildThis', 'buildThis is never gold')
  assert.notEqual(screen.gold, 'nightWatch', 'nightWatch is never gold')
  if (screen.id.endsWith('-win')) {
    assert.ok(!REPLAY_GOLDS.includes(screen.gold), `${screen.id} gold ${screen.gold} would loop`)
  }
}
for (const id of knownScreens) {
  assert.ok(seenScreens.has(id), `screen ${id} is missing from golden-path.xml`)
}
assert.equal(seenScreens.size, knownScreens.length, 'screen list does not match the code-known screens')

for (const name of readdirSync(packDir)) {
  if (!name.endsWith('.xml')) continue
  const xml = readFileSync(join(packDir, name), 'utf8')
  assert.doesNotMatch(
    xml,
    /<easyShelf[\s>]/,
    `${name} has a second <easyShelf>. The Easy order lives only in golden-path.xml`,
  )
}

function packAppVersion(xml, name) {
  const match = xml.match(/<(?:goldenPath|silverCityPackIndex|areaPack)\b[^>]*\bappVersion="([^"]+)"/)
  assert.ok(match, `${name} has a root appVersion`)
  return match[1]
}

const releasePacks = ['golden-path.xml', 'index.xml']
const packXmlNames = readdirSync(packDir).filter((name) => name.endsWith('.xml')).sort()
assert.deepEqual(
  releasePacks.filter((name) => !packXmlNames.includes(name)),
  [],
  'golden-path.xml and index.xml are pack XML files',
)
for (const name of packXmlNames) {
  const disk = packAppVersion(readFileSync(join(packDir, name), 'utf8'), name)
  const embeddedXml = PACK_XML[name]
  assert.equal(typeof embeddedXml, 'string', `${name} is embedded`)
  const embedded = packAppVersion(embeddedXml, `embedded ${name}`)
  assert.equal(embedded, disk, `${name} embedded appVersion matches the pack XML`)
  if (!releasePacks.includes(name)) continue
  assert.equal(disk, APP_VERSION, `${name} appVersion equals APP_VERSION`)
  assert.equal(embedded, APP_VERSION, `${name} embedded appVersion equals APP_VERSION`)
}

console.log('check-packs: ok')
