import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { EASY_LINE_ORDER, easyWhyLine, easyWhyWordCount } from '../src/lib/easy.ts'
import { evidenceFor, evidenceForTier } from '../src/content/evidence.ts'
import { packLesson } from '../src/content/packCatalog.ts'
import {
  applyHoldMiss,
  HOLD_BLAST_START,
  HOLD_LOCKED_STAMP,
  HOLD_MISS_FACE,
  HOLD_MISS_PENALTY,
  WHY_CHIP_COUNT,
  whyBlastChoices,
  whyBlastExtras,
  whyBlastPool,
} from '../src/lib/whyBlast.ts'

assert.equal(HOLD_MISS_PENALTY, 25)
assert.equal(applyHoldMiss(HOLD_BLAST_START), 75)
assert.equal(applyHoldMiss(20), 0)
assert.equal(applyHoldMiss(0), 0)
assert.equal(HOLD_MISS_FACE, 'Miss −25')
assert.equal(HOLD_LOCKED_STAMP, 'LOCKED!')
assert.equal(WHY_CHIP_COUNT, 4)

const debt = evidenceForTier('ph-debt', 'easy') ?? evidenceFor('ph-debt')
assert.ok(debt)
const debtPool = whyBlastPool(debt.reason, debt.reasonChoices, whyBlastExtras('ph-debt'))
assert.equal(debtPool.length, 4)
assert.equal(debtPool[0], debt.reason)
assert.ok(debtPool.includes('Jail him over a tiny debt.'))
const debtFaces = debtPool.map((line) => easyWhyLine(line))
assert.equal(new Set(debtFaces).size, 4)
assert.match(easyWhyLine(debt.reason), /choked a neighbor/)
assert.doesNotMatch(debtFaces.filter((face) => face !== easyWhyLine(debt.reason)).join('\n'), /choked a neighbor/)

for (const id of EASY_LINE_ORDER) {
  const lesson = packLesson(id)
  assert.ok(lesson, id)
  const brief = evidenceForTier(id, 'easy') ?? evidenceFor(id)
  assert.ok(brief, id)
  const extras = whyBlastExtras(id)
  const pool = whyBlastPool(brief.reason, brief.reasonChoices, extras)
  assert.equal(pool.length, 4, `${id} why-blast chips`)
  assert.equal(pool[0], brief.reason)
  const faces = pool.map((line) => easyWhyLine(line))
  assert.equal(new Set(faces).size, 4, `${id} unique why faces`)
  for (const face of faces) {
    const words = easyWhyWordCount(face)
    assert.ok(words >= 3 && words <= 12, `${id} why length ${words}: ${face}`)
    assert.doesNotMatch(face, /throttl/i)
  }
  const shuffled = whyBlastChoices(brief.reason, brief.reasonChoices, extras)
  assert.equal(shuffled.length, 4)
  assert.ok(shuffled.includes(brief.reason))
}

const blastSrc = readFileSync(
  new URL('../src/components/challenges/WhyBlastPlay.tsx', import.meta.url),
  'utf8',
)
assert.match(blastSrc, /why-blast/)
assert.match(blastSrc, /HOLD_MISS_FACE/)
assert.match(blastSrc, /HOLD_LOCKED_STAMP/)
assert.match(blastSrc, /applyHoldMiss/)
assert.match(blastSrc, /why-chip/)
assert.match(blastSrc, /is-toss/)
assert.match(blastSrc, /match-yes/)
assert.match(blastSrc, /holdSuccessBeat/)
assert.match(blastSrc, /WinBurst/)
assert.match(blastSrc, /playGemPop\('miss'\)/)
assert.match(blastSrc, /playGemPop\('win'\)/)

const recallSrc = readFileSync(
  new URL('../src/components/RecallGate.tsx', import.meta.url),
  'utf8',
)
assert.match(recallSrc, /WhyBlastPlay/)
assert.match(recallSrc, /is-why-blast/)
assert.doesNotMatch(recallSrc, /pool\.find\(\(line\) => line !== correct\)/)

const gemSrc = readFileSync(
  new URL('../src/components/challenges/GemSearchPlay.tsx', import.meta.url),
  'utf8',
)
assert.match(gemSrc, /matchBonusWord/)
assert.match(gemSrc, /planted/)
assert.doesNotMatch(gemSrc, /Miss −25/)

const gemLib = readFileSync(new URL('../src/lib/gemSearch.ts', import.meta.url), 'utf8')
assert.match(gemLib, /MIN_LEN = 3/)
assert.match(gemLib, /BONUS_MAX_LEN = 6/)
assert.match(gemLib, /\bBED\b/)
assert.match(gemLib, /planted/)

console.log('check-why-blast: ok')
