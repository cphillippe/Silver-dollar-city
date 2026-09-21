import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { packLesson } from '../src/content/packCatalog.ts'
import { easyDigTaps } from '../src/content/deeper.ts'
import { emptyProgress } from '../src/lib/save.ts'
import { DIG_ARC, EASY, EASY_LINE_ORDER, FOUNDATION_ARC, NAMES_ARC, STONE_ARC, INK_ARC, easyLoopLine } from '../src/lib/easy.ts'
import {
  DIG_ARC as SOURCE_DIG_ARC,
  NAMES_ARC as SOURCE_NAMES_ARC,
  STONE_ARC as SOURCE_STONE_ARC,
  INK_ARC as SOURCE_INK_ARC,
  SOURCE_DIG_AGAIN,
  SOURCE_DIG_HINT,
  SOURCE_DIG_MISS,
  SOURCE_DIG_SCRUB_PX,
  SOURCE_DIG_SCRUB_THRESHOLD,
  SOURCE_DIG_TIMEOUT,
  SOURCE_DIG_TIMER_EASY_MS,
  SOURCE_DIG_TIMER_HARD_MS,
  SOURCE_DIG_TAP_SCORE,
  SOURCE_DIG_WIN,
  SOURCE_DIG_WIN_SCORE,
  digClaim,
  digTablets,
  isSourceDigLine,
  seatTablets,
} from '../src/lib/sourceDig.ts'
import { storyPlayFor } from '../src/lib/storyPlay.ts'

assert.deepEqual([...SOURCE_DIG_ARC], [...DIG_ARC])
assert.deepEqual([...SOURCE_NAMES_ARC], [...NAMES_ARC])
assert.deepEqual([...SOURCE_STONE_ARC], [...STONE_ARC])
assert.deepEqual([...SOURCE_INK_ARC], [...INK_ARC])
assert.deepEqual([...DIG_ARC], ['wb-creed', 'wb-women', 'wb-early', 'wb-method'])
assert.deepEqual([...NAMES_ARC], ['daily-names', 'daily-creed', 'daily-empty'])
assert.deepEqual([...STONE_ARC], ['sc-tacitus', 'sc-james', 'sc-pliny'])
assert.deepEqual([...INK_ARC], ['ic-trajan', 'ic-suetonius', 'ic-lucian'])
assert.equal(storyPlayFor('wb-creed'), 'claim-merge')
assert.equal(storyPlayFor('wb-women'), 'source-dig')
assert.equal(storyPlayFor('wb-early'), 'source-dig')
assert.equal(storyPlayFor('wb-method'), 'source-dig')
assert.equal(storyPlayFor('daily-names'), 'source-dig')
assert.equal(storyPlayFor('daily-creed'), 'source-dig')
assert.equal(storyPlayFor('daily-empty'), 'source-dig')
assert.equal(storyPlayFor('sc-tacitus'), 'source-dig')
assert.equal(storyPlayFor('sc-james'), 'source-dig')
assert.equal(storyPlayFor('sc-pliny'), 'source-dig')
assert.equal(storyPlayFor('ic-trajan'), 'source-dig')
assert.equal(storyPlayFor('ic-suetonius'), 'source-dig')
assert.equal(storyPlayFor('ic-lucian'), 'source-dig')
assert.equal(storyPlayFor('ph-debt'), 'panel-blast')
assert.ok(!isSourceDigLine('wb-creed'))
assert.ok(isSourceDigLine('wb-women'))
assert.ok(isSourceDigLine('daily-names'))
assert.ok(isSourceDigLine('daily-empty'))
assert.ok(isSourceDigLine('sc-tacitus'))
assert.ok(isSourceDigLine('sc-pliny'))
assert.ok(isSourceDigLine('ic-trajan'))
assert.ok(isSourceDigLine('ic-lucian'))

assert.equal(SOURCE_DIG_WIN, 'DUG!')
assert.equal(SOURCE_DIG_AGAIN, 'One more dig')
assert.equal(EASY.digAgain, SOURCE_DIG_AGAIN)
assert.equal(SOURCE_DIG_TAP_SCORE, 25)
assert.equal(SOURCE_DIG_WIN_SCORE, 100)
assert.equal(SOURCE_DIG_HINT, 'Scrub the dirt off each tablet.')
assert.equal(SOURCE_DIG_TIMEOUT, 'Buried!')
assert.equal(SOURCE_DIG_TIMER_EASY_MS, 20000)
assert.equal(SOURCE_DIG_TIMER_HARD_MS, 12000)
assert.ok(SOURCE_DIG_SCRUB_PX >= 100 && SOURCE_DIG_SCRUB_PX <= 300)
assert.equal(SOURCE_DIG_SCRUB_THRESHOLD, 0.55)
assert.equal(SOURCE_DIG_MISS, 'Miss −25')
assert.match(EASY.digHunt, /Scrub the dirt/)
assert.doesNotMatch(EASY.digHunt, /glowing tablet/)

for (const id of ['wb-women', 'wb-early', 'wb-method', ...NAMES_ARC]) {
  const tablets = digTablets(id)
  assert.equal(tablets.length, 3, `${id} has three tablets`)
  assert.equal(tablets[0]?.era, 'scripture', `${id} leads with Scripture`)
  assert.ok(tablets.some((row) => row.era === 'ancient'), `${id} has an ancient tap`)
  assert.equal(digClaim(id), packLesson(id)?.claim)
  const taps = easyDigTaps(id)
  assert.ok(taps.length >= 2 && taps.length <= 3, `${id} Dig the names is 2–3 taps`)
  assert.ok(
    taps.every((row) => row.era === 'scripture' || row.era === 'ancient'),
    `${id} Easy taps stay scripture/ancient`,
  )
  const seated = seatTablets(id, 7)
  assert.equal(seated.length, 3)
  assert.deepEqual(
    [...seated].map((row) => row.id).sort(),
    [0, 1, 2],
  )
}

for (const id of STONE_ARC) {
  const tablets = digTablets(id)
  assert.equal(tablets.length, 3, `${id} has three tablets`)
  assert.equal(tablets[0]?.era, 'ancient', `${id} leads with an ancient name`)
  assert.ok(tablets.some((row) => row.era === 'scripture'), `${id} has a Scripture support tap`)
  assert.equal(digClaim(id), packLesson(id)?.claim)
  assert.match(digClaim(id), /Christ/)
  const taps = easyDigTaps(id)
  assert.ok(taps.length >= 2 && taps.length <= 3, `${id} Dig the names is 2–3 taps`)
  assert.ok(
    taps.every((row) => row.era === 'scripture' || row.era === 'ancient'),
    `${id} Easy taps stay scripture/ancient`,
  )
  const seated = seatTablets(id, 7)
  assert.equal(seated.length, 3)
  assert.deepEqual(
    [...seated].map((row) => row.id).sort(),
    [0, 1, 2],
  )
}

for (const id of INK_ARC) {
  const tablets = digTablets(id)
  assert.equal(tablets.length, 3, `${id} has three tablets`)
  assert.equal(tablets[0]?.era, 'ancient', `${id} leads with an ancient name`)
  assert.ok(tablets.some((row) => row.era === 'scripture'), `${id} has a Scripture support tap`)
  assert.equal(digClaim(id), packLesson(id)?.claim)
  assert.match(digClaim(id), /Christ/)
  const taps = easyDigTaps(id)
  assert.ok(taps.length >= 2 && taps.length <= 3, `${id} Dig the names is 2–3 taps`)
  assert.ok(
    taps.every((row) => row.era === 'scripture' || row.era === 'ancient'),
    `${id} Easy taps stay scripture/ancient`,
  )
  const seated = seatTablets(id, 7)
  assert.equal(seated.length, 3)
  assert.deepEqual(
    [...seated].map((row) => row.id).sort(),
    [0, 1, 2],
  )
}

assert.match(digTablets('wb-women')[2]?.bite ?? '', /Luke still writes/)
assert.doesNotMatch(digTablets('wb-women')[2]?.bite ?? '', /If the churches invented/)
assert.match(digTablets('wb-early')[0]?.bite ?? '', /Christ/)
assert.match(digTablets('wb-method')[1]?.bite ?? '', /Christ/)

assert.match(digTablets('daily-names')[0]?.bite ?? '', /Christ/)
assert.match(digTablets('daily-creed')[0]?.bite ?? '', /Christ/)
assert.match(digTablets('daily-empty')[0]?.bite ?? '', /Jesus/)
assert.doesNotMatch(digTablets('daily-creed')[0]?.bite ?? '', /If the creed is early/)

assert.match(digTablets('sc-tacitus')[0]?.bite ?? '', /Christus|Pilate|Christ/)
assert.doesNotMatch(digTablets('sc-tacitus')[0]?.bite ?? '', /empty tomb/)
assert.match(digTablets('sc-james')[0]?.bite ?? '', /Christ/)
assert.doesNotMatch(digTablets('sc-james')[0]?.bite ?? '', /18\.63|Testimonium/)
assert.match(digTablets('sc-pliny')[0]?.bite ?? '', /Christ/)
assert.match(digTablets('ic-trajan')[0]?.bite ?? '', /Christ/)
assert.match(digTablets('ic-suetonius')[0]?.bite ?? '', /Christ/)
assert.match(digTablets('ic-lucian')[0]?.bite ?? '', /Christ/)
assert.doesNotMatch(digTablets('ic-suetonius')[0]?.bite ?? '', /Chrestus/)
assert.doesNotMatch(digTablets('ic-lucian')[0]?.bite ?? '', /believed/)

assert.ok(EASY_LINE_ORDER.indexOf('fg-ground') < EASY_LINE_ORDER.indexOf('wb-creed'))
assert.deepEqual(EASY_LINE_ORDER.slice(7, 14), [...DIG_ARC, ...NAMES_ARC])
assert.ok(EASY_LINE_ORDER.indexOf('daily-empty') < EASY_LINE_ORDER.indexOf('daily-lantern'))
assert.ok(EASY_LINE_ORDER.indexOf('daily-door') < EASY_LINE_ORDER.indexOf('sc-tacitus'))
assert.deepEqual(EASY_LINE_ORDER.slice(39, 42), [...STONE_ARC])
assert.deepEqual(EASY_LINE_ORDER.slice(42, 45), [...INK_ARC])

const creek = {
  ...emptyProgress(),
  easyTaught: ['ph-road', 'ph-father', 'ph-debt', ...FOUNDATION_ARC],
  easyHeld: ['ph-road', 'ph-father', 'ph-debt', ...FOUNDATION_ARC],
}
assert.equal(easyLoopLine(creek), 'wb-creed')
assert.equal(easyLoopLine({ ...creek, easyHeld: [...creek.easyHeld, 'wb-creed'] }), 'wb-women')
assert.equal(
  easyLoopLine({ ...creek, easyHeld: [...creek.easyHeld, 'wb-creed', 'wb-women'] }),
  'wb-early',
)
assert.equal(
  easyLoopLine({ ...creek, easyHeld: [...creek.easyHeld, 'wb-creed', 'wb-women', 'wb-early'] }),
  'wb-method',
)
assert.equal(
  easyLoopLine({ ...creek, easyHeld: [...creek.easyHeld, ...DIG_ARC] }),
  'daily-names',
)
assert.equal(
  easyLoopLine({ ...creek, easyHeld: [...creek.easyHeld, ...DIG_ARC, 'daily-names'] }),
  'daily-creed',
)
assert.equal(
  easyLoopLine({ ...creek, easyHeld: [...creek.easyHeld, ...DIG_ARC, 'daily-names', 'daily-creed'] }),
  'daily-empty',
)
assert.equal(
  easyLoopLine({ ...creek, easyHeld: [...creek.easyHeld, ...DIG_ARC, ...NAMES_ARC] }),
  'daily-lantern',
)

const afterDoor = {
  ...emptyProgress(),
  easyHeld: [...EASY_LINE_ORDER.slice(0, 39)],
}
assert.equal(easyLoopLine(afterDoor), 'sc-tacitus')
assert.equal(easyLoopLine({ ...afterDoor, easyHeld: [...afterDoor.easyHeld, 'sc-tacitus'] }), 'sc-james')
assert.equal(
  easyLoopLine({ ...afterDoor, easyHeld: [...afterDoor.easyHeld, 'sc-tacitus', 'sc-james'] }),
  'sc-pliny',
)
assert.equal(
  easyLoopLine({ ...afterDoor, easyHeld: [...EASY_LINE_ORDER.slice(0, 42)] }),
  'ic-trajan',
)

const playSrc = readFileSync(
  new URL('../src/components/challenges/SourceDigPlay.tsx', import.meta.url),
  'utf8',
)
assert.match(playSrc, /is-source-dig/)
assert.match(playSrc, /dig-tablet/)
assert.match(playSrc, /SOURCE_DIG_WIN/)
assert.match(playSrc, /MatchTakeaway/)
assert.match(playSrc, /EASY\.holdNext/)
assert.match(playSrc, /SOURCE_DIG_AGAIN/)
assert.ok(playSrc.lastIndexOf('EASY.holdNext') < playSrc.lastIndexOf('SOURCE_DIG_AGAIN'))
assert.match(playSrc, /function replay/)
assert.match(playSrc, /data-dig-again/)
assert.match(playSrc, /dig-shard/)
assert.match(playSrc, /Combo/)
assert.match(playSrc, /dig-dirt/)
assert.match(playSrc, /SOURCE_DIG_SCRUB_PX/)
assert.match(playSrc, /SOURCE_DIG_SCRUB_THRESHOLD/)
assert.match(playSrc, /SOURCE_DIG_TIMEOUT/)
assert.match(playSrc, /SOURCE_DIG_TIMER_EASY_MS/)
assert.match(playSrc, /setPointerCapture/)
assert.match(playSrc, /role="timer"/)
assert.doesNotMatch(playSrc, /nextId|is-glow|Tap the glow/)
assert.doesNotMatch(playSrc, /tapWhy|claimChoices|reasonChoices|whyCorrect/)

const puzzleSrc = readFileSync(new URL('../src/components/PuzzlePlay.tsx', import.meta.url), 'utf8')
assert.match(puzzleSrc, /case 'source-dig'/)
assert.match(puzzleSrc, /SourceDigPlay/)
assert.match(puzzleSrc, /easy=\{isEasy\(progress\)\}/)

const digSrc = readFileSync(new URL('../src/components/DigDeeper.tsx', import.meta.url), 'utf8')
assert.match(digSrc, /easyDigTaps/)
assert.match(digSrc, /is-easy-dig/)
assert.match(digSrc, /Dig the names/)
assert.doesNotMatch(digSrc, /if \(easy\) return null/)
assert.doesNotMatch(digSrc, /newadvent\.org/)

assert.equal(easyDigTaps('wb-early')[0]?.source.includes('Christ'), true)

console.log('check-source-dig: ok')
