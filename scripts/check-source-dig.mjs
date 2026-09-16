import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { packLesson } from '../src/content/packCatalog.ts'
import { easyDigTaps } from '../src/content/deeper.ts'
import { emptyProgress } from '../src/lib/save.ts'
import { DIG_ARC, EASY, EASY_LINE_ORDER, FOUNDATION_ARC, easyLoopLine } from '../src/lib/easy.ts'
import {
  DIG_ARC as SOURCE_DIG_ARC,
  SOURCE_DIG_AGAIN,
  SOURCE_DIG_HINT,
  SOURCE_DIG_MISS,
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
assert.deepEqual([...DIG_ARC], ['wb-creed', 'wb-women', 'wb-early', 'wb-method'])
assert.equal(storyPlayFor('wb-creed'), 'claim-merge')
assert.equal(storyPlayFor('wb-women'), 'source-dig')
assert.equal(storyPlayFor('wb-early'), 'source-dig')
assert.equal(storyPlayFor('wb-method'), 'source-dig')
assert.equal(storyPlayFor('ph-debt'), 'panel-blast')
assert.ok(!isSourceDigLine('wb-creed'))
assert.ok(isSourceDigLine('wb-women'))

assert.equal(SOURCE_DIG_WIN, 'DUG!')
assert.equal(SOURCE_DIG_AGAIN, 'One more dig')
assert.equal(EASY.digAgain, SOURCE_DIG_AGAIN)
assert.equal(SOURCE_DIG_TAP_SCORE, 25)
assert.equal(SOURCE_DIG_WIN_SCORE, 100)
assert.equal(SOURCE_DIG_HINT, 'Tap the glowing tablet.')
assert.equal(SOURCE_DIG_MISS, 'Miss −25')

for (const id of ['wb-women', 'wb-early', 'wb-method']) {
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

assert.match(digTablets('wb-early')[0]?.bite ?? '', /Christ/)
assert.match(digTablets('wb-method')[1]?.bite ?? '', /Christ/)

assert.ok(EASY_LINE_ORDER.indexOf('fg-ground') < EASY_LINE_ORDER.indexOf('wb-creed'))
assert.deepEqual(EASY_LINE_ORDER.slice(7, 12), [
  'wb-creed',
  'wb-women',
  'wb-early',
  'wb-method',
  'daily-lantern',
])

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
  'daily-lantern',
)

const playSrc = readFileSync(
  new URL('../src/components/challenges/SourceDigPlay.tsx', import.meta.url),
  'utf8',
)
assert.match(playSrc, /is-source-dig/)
assert.match(playSrc, /dig-tablet/)
assert.match(playSrc, /SOURCE_DIG_WIN/)
assert.match(playSrc, /EASY\.holdNext/)
assert.match(playSrc, /SOURCE_DIG_AGAIN/)
assert.ok(playSrc.lastIndexOf('EASY.holdNext') < playSrc.lastIndexOf('SOURCE_DIG_AGAIN'))
assert.match(playSrc, /function replay/)
assert.match(playSrc, /data-dig-again/)
assert.match(playSrc, /dig-shard/)
assert.match(playSrc, /Combo/)
assert.doesNotMatch(playSrc, /tapWhy|claimChoices|reasonChoices|whyCorrect/)

const puzzleSrc = readFileSync(new URL('../src/components/PuzzlePlay.tsx', import.meta.url), 'utf8')
assert.match(puzzleSrc, /case 'source-dig'/)
assert.match(puzzleSrc, /SourceDigPlay/)

const digSrc = readFileSync(new URL('../src/components/DigDeeper.tsx', import.meta.url), 'utf8')
assert.match(digSrc, /easyDigTaps/)
assert.match(digSrc, /is-easy-dig/)
assert.match(digSrc, /Dig the names/)
assert.doesNotMatch(digSrc, /if \(easy\) return null/)
assert.doesNotMatch(digSrc, /newadvent\.org/)

assert.equal(easyDigTaps('wb-early')[0]?.source.includes('Christ'), true)

console.log('check-source-dig: ok')
