import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { EASY_LINE_ORDER } from '../src/lib/easy.ts'
import { packLesson } from '../src/content/packCatalog.ts'
import {
  BONUS_WORD_MAX,
  BONUS_WORD_MIN,
  COMMON_BONUS_COUNT,
  COMMON_BONUS_WORDS,
  isKidFriendlyBonusWord,
  isPlantableBonusWord,
} from '../src/lib/commonBonusWords.ts'
import {
  bonusWordsFor,
  buildGemPuzzle,
  cellKey,
  cellsNeededByOpenPlanted,
  findStraightSpelling,
  gemWordsFor,
  matchChipsFor,
  isBonusSpelling,
  isStraightPath,
  matchBonusWord,
  matchGemWord,
  MAX_BONUS_PLANT,
  MIN_BONUS_PLANT,
  pathLetters,
  plantCandidates,
  shouldMissAfterSwipe,
  snapFingerPath,
  tryAddToPath,
} from '../src/lib/gemSearch.ts'
import {
  applyMatchBonus,
  applyMatchMiss,
  bonusFace,
  consumeMatchExtra,
  MATCH_BONUS_POINTS,
  MATCH_DOCK_JUICE_POINTS,
  MATCH_MISS_POINTS,
} from '../src/lib/matchBonus.ts'
import { gemBonusBeat, gemTargetBeat, matchClearBeat } from '../src/lib/successBeat.ts'
import {
  splitStorySentences,
  resolveStoryMedia,
  storyFromPanels,
  storyPanelsFor,
} from '../src/lib/storyPanels.ts'
import { lessonStory, storyPlayFor } from '../src/lib/storyPlay.ts'
import { isSourceDigLine } from '../src/lib/sourceDig.ts'
import { readAppCss } from './readAppCss.mjs'

const mercyWords = gemWordsFor('ph-road')
assert.deepEqual(
  mercyWords.map((word) => word.text),
  ['MERCY', 'CREEK', 'NEIGHBOR', 'CARE'],
  'ph-road authored MATCH_CHIPS',
)
assert.deepEqual(
  mercyWords.map((word) => word.role),
  ['who', 'where', 'idea', 'keep'],
  'ph-road mind-map roles',
)
assert.ok(mercyWords.some((word) => word.kind === 'person'))
assert.ok(mercyWords.some((word) => word.kind === 'place'))
assert.ok(mercyWords.some((word) => word.kind === 'idea'))
assert.match(matchChipsFor('ph-road')?.say ?? '', /neighbor.*care/i)

const creedWords = gemWordsFor('wb-creed')
assert.deepEqual(creedWords.map((w) => w.text), ['SILAS', 'SQUARE', 'CREED', 'CHRIST'])
assert.match(matchChipsFor('wb-creed')?.say ?? '', /creed.*Christ/i)

const lanternWords = gemWordsFor('daily-lantern')
assert.deepEqual(lanternWords.map((w) => w.text), ['JUNIPER', 'PORCH', 'LAMP', 'SEEN'])
assert.match(matchChipsFor('daily-lantern')?.say ?? '', /lamp.*seen/i)

const tuningWords = gemWordsFor('ob-tuning')
assert.deepEqual(tuningWords.map((w) => w.text), ['NORA', 'SKY', 'TUNING', 'DESIGNER'])
assert.match(matchChipsFor('ob-tuning')?.say ?? '', /tuning.*Designer/i)

for (const id of EASY_LINE_ORDER) {
  const chips = matchChipsFor(id)
  assert.ok(chips, `${id} has MATCH_CHIPS`)
  assert.equal(chips.words.length, 4, `${id} four chips`)
  assert.equal(gemWordsFor(id).length, 4, `${id} gemWords from chips`)
}

const orderWords = gemWordsFor('fg-order')
assert.deepEqual(
  orderWords.map((word) => word.text),
  ['ANSEL', 'ARCH', 'ORDER', 'CHRIST'],
  'fg-order authored MATCH_CHIPS',
)
assert.deepEqual(
  orderWords.map((word) => word.role),
  ['who', 'where', 'idea', 'keep'],
  'fg-order mind-map roles',
)

const groundWords = gemWordsFor('fg-ground')
assert.deepEqual(
  groundWords.map((word) => word.text),
  ['COSMO', 'ROCK', 'GROUND', 'GOD'],
  'fg-ground authored MATCH_CHIPS (connected teach unit)',
)
assert.equal(matchChipsFor('fg-ground')?.say.includes('living God'), true, 'fg-ground say teaches')


const mercy = buildGemPuzzle('ph-road')
assert.equal(mercy.size, 8)
assert.equal(mercy.letters.length, 8)
assert.equal(mercy.letters[0]?.length, 8)
assert.deepEqual(
  buildGemPuzzle('ph-road').letters,
  mercy.letters,
  'same lesson, same board',
)

for (const word of mercy.words) {
  const path = mercy.paths[word.id]
  assert.ok(path && path.length === word.text.length, `${word.text} path`)
  assert.equal(pathLetters(path, mercy.letters), word.text)
  assert.equal(isStraightPath(path), true)
  assert.equal(matchGemWord(path, mercy, [])?.id, word.id)
}

const grown = tryAddToPath(
  [mercy.paths[mercy.words[0].id][0]],
  mercy.paths[mercy.words[0].id][1],
)
assert.equal(grown.length, 2)

const mercyBonusPool = bonusWordsFor('ph-road')
assert.ok(mercyBonusPool.includes('ROAD'), 'road is a mercy bonus')
assert.ok(mercyBonusPool.includes('HELP'), 'help is a mercy bonus')
assert.ok(
  mercyBonusPool.every((word) => !mercyWords.some((target) => target.text === word)),
  'bonus is not a required chip',
)
assert.equal(MATCH_BONUS_POINTS, 100)
assert.equal(MATCH_DOCK_JUICE_POINTS, 1000)
assert.equal(MATCH_MISS_POINTS, 25)
const planted = mercy.bonus.filter((word) => (mercy.bonusPaths[word.id] ?? []).length === word.text.length)
assert.ok(planted.length >= MIN_BONUS_PLANT, 'mercy plants bonus words')
assert.ok(mercy.planted.length >= MIN_BONUS_PLANT, 'planted extras on the board')
assert.ok(mercy.planted.length <= MAX_BONUS_PLANT + 2, 'planted extras stay a handful')
assert.ok(mercyBonusPool.includes('GAP'), 'gap is a shared extra')
assert.equal(BONUS_WORD_MIN, 3)
assert.equal(BONUS_WORD_MAX, 6)
assert.ok(COMMON_BONUS_WORDS.has('BED'), 'BED is in the shipped bonus dictionary')
assert.ok(COMMON_BONUS_WORDS.has('CAT'))
assert.ok(COMMON_BONUS_WORDS.has('HAT'))
assert.ok(COMMON_BONUS_WORDS.has('RUN'))
assert.ok(COMMON_BONUS_WORDS.has('SON'))
assert.ok(COMMON_BONUS_WORDS.has('YES'))
assert.ok(COMMON_BONUS_WORDS.has('NET'))
assert.equal(isKidFriendlyBonusWord('BED'), true)
assert.equal(isKidFriendlyBonusWord('NUDE'), false)
assert.equal(isKidFriendlyBonusWord('SUCK'), false)
assert.equal(isKidFriendlyBonusWord('HELL'), false)
assert.equal(isKidFriendlyBonusWord('SNAG'), true, 'SNAG is a real English bonus')
assert.equal(isKidFriendlyBonusWord('SNAP'), true)
assert.equal(isKidFriendlyBonusWord('SNOW'), true)
assert.equal(isPlantableBonusWord('BED'), true)
assert.equal(isPlantableBonusWord('NUDE'), false)
assert.equal(isPlantableBonusWord('SNAG'), true, 'SNAG plants and scores')
assert.equal(isPlantableBonusWord('FAT'), false)
assert.equal(isPlantableBonusWord('HOLE'), false, 'HOLE stays on the crude skip list')
assert.equal(COMMON_BONUS_COUNT, COMMON_BONUS_WORDS.size)
assert.ok(COMMON_BONUS_COUNT >= 900, `dict too thin: ${COMMON_BONUS_COUNT}`)
for (const word of COMMON_BONUS_WORDS) {
  assert.ok(word.length >= 3 && word.length <= 6, `${word} length band`)
}

const fatherBoard = buildGemPuzzle('ph-father')
assert.ok(fatherBoard.planted.length >= MIN_BONUS_PLANT, 'father plants several extras')
assert.equal(isBonusSpelling('BED', fatherBoard), true, 'Bed stays in the bonus dict')
assert.equal(isBonusSpelling('QQQ', fatherBoard), false)
assert.equal(isBonusSpelling('FAT', fatherBoard), false, 'FAT stays on the rude skip list')
assert.equal(isBonusSpelling('SNAG', fatherBoard), true, 'SNAG scores as a bonus')
assert.equal(isBonusSpelling('NEIGHBOR', fatherBoard), false, '7+ letters stay off the bonus band')
assert.equal(isBonusSpelling('NUDE', fatherBoard), false, 'rude extras do not score')
assert.ok(COMMON_BONUS_WORDS.has('GET'), 'GET is in the shipped bonus dictionary')
assert.ok(COMMON_BONUS_WORDS.has('HER'), 'HER is in the shipped bonus dictionary')
assert.equal(isKidFriendlyBonusWord('GET'), true)
assert.equal(isKidFriendlyBonusWord('HER'), true)
assert.equal(isBonusSpelling('GET', fatherBoard), true, 'GET is not skipped as too common')
assert.equal(isBonusSpelling('HER', fatherBoard), true, 'HER is not skipped as too common')

function lettersFromRows(rows) {
  return Array.from({ length: 8 }, (_, r) =>
    Array.from({ length: 8 }, (_, c) => rows[r]?.[c] ?? 'X'),
  )
}

function puzzleFrom(letters, words = []) {
  return {
    id: 'get-her',
    size: 8,
    words,
    letters,
    paths: {},
    bonusPool: [],
    bonus: [],
    planted: [],
    bonusPaths: {},
  }
}

const nestedBoard = puzzleFrom(lettersFromRows(['FATHERXX', 'TARGETXX']), [
  { id: 'idea-father', text: 'FATHER', label: 'Father', kind: 'idea' },
  { id: 'idea-target', text: 'TARGET', label: 'Target', kind: 'idea' },
])
const herPath = [
  { r: 0, c: 3 },
  { r: 0, c: 4 },
  { r: 0, c: 5 },
]
const getPath = [
  { r: 1, c: 3 },
  { r: 1, c: 4 },
  { r: 1, c: 5 },
]
assert.equal(pathLetters(herPath, nestedBoard.letters), 'HER')
assert.equal(pathLetters(getPath, nestedBoard.letters), 'GET')
assert.equal(isBonusSpelling('HER', nestedBoard), true, 'HER scores even inside FATHER')
assert.equal(isBonusSpelling('GET', nestedBoard), true, 'GET scores even inside TARGET')
assert.equal(matchBonusWord(herPath, nestedBoard, [])?.text, 'HER')
assert.equal(matchBonusWord(getPath, nestedBoard, [])?.text, 'GET')
assert.equal(matchBonusWord([...herPath].reverse(), nestedBoard, [])?.text, 'HER')
assert.equal(matchBonusWord([...getPath].reverse(), nestedBoard, [])?.text, 'GET')
assert.equal(matchGemWord(herPath, nestedBoard, []), null)
assert.equal(matchGemWord(getPath, nestedBoard, []), null)
const wobbleGet = [
  { r: 1, c: 3 },
  { r: 1, c: 4 },
  { r: 2, c: 4 },
  { r: 1, c: 5 },
]
const wobbleHer = [
  { r: 0, c: 3 },
  { r: 1, c: 3 },
  { r: 0, c: 4 },
  { r: 0, c: 5 },
]
assert.equal(pathLetters(snapFingerPath(wobbleGet, 8), nestedBoard.letters), 'GET')
assert.equal(pathLetters(snapFingerPath(wobbleHer, 8), nestedBoard.letters), 'HER')
assert.equal(matchBonusWord(wobbleGet, nestedBoard, [])?.text, 'GET', 'wobbly GET still scores')
assert.equal(matchBonusWord(wobbleHer, nestedBoard, [])?.text, 'HER', 'wobbly HER still scores')
assert.equal(isStraightPath(wobbleGet), false)
assert.equal(isStraightPath(snapFingerPath(wobbleGet, 8)), true)
const missPath = [
  { r: 0, c: 0 },
  { r: 0, c: 1 },
  { r: 0, c: 2 },
]
assert.equal(pathLetters(missPath, lettersFromRows(['QQQXXXXX'])), 'QQQ')
assert.equal(isBonusSpelling('QQQ', puzzleFrom(lettersFromRows(['QQQXXXXX']))), false)
assert.equal(matchBonusWord(missPath, puzzleFrom(lettersFromRows(['QQQXXXXX'])), []), null)

const snagBoard = puzzleFrom(lettersFromRows(['SNAGXXXX']))
const snagPath = [
  { r: 0, c: 0 },
  { r: 0, c: 1 },
  { r: 0, c: 2 },
  { r: 0, c: 3 },
]
assert.equal(pathLetters(snagPath, snagBoard.letters), 'SNAG')
assert.equal(isBonusSpelling('SNAG', snagBoard), true, 'SNAG is a dict bonus')
assert.equal(matchBonusWord(snagPath, snagBoard, [])?.text, 'SNAG')
assert.equal(matchBonusWord([...snagPath].reverse(), snagBoard, [])?.text, 'SNAG')
assert.equal(matchBonusWord(snagPath, snagBoard, ['bonus-snag']), null, 'already-found SNAG does not rematch')
assert.equal(shouldMissAfterSwipe(true, 4), false, 'already scored — no Miss on finger-up')
assert.equal(shouldMissAfterSwipe(true, 0), false, 'empty path after a successful clear — no Miss')
assert.equal(shouldMissAfterSwipe(false, 0), false)
assert.equal(shouldMissAfterSwipe(false, 1), false)
assert.equal(shouldMissAfterSwipe(false, 4), true, 'unscored swipe of 4 can miss')

const overlapBoard = {
  ...puzzleFrom(lettersFromRows(['CATXXXXX', 'XXRXXXXX', 'XXRXXXXX'])),
  planted: [
    { id: 'bonus-cat', text: 'CAT', label: 'Cat', kind: 'idea' },
    { id: 'bonus-car', text: 'CAR', label: 'Car', kind: 'idea' },
  ],
  bonusPaths: {
    'bonus-cat': [
      { r: 0, c: 0 },
      { r: 0, c: 1 },
      { r: 0, c: 2 },
    ],
    'bonus-car': [
      { r: 0, c: 2 },
      { r: 1, c: 2 },
      { r: 2, c: 2 },
    ],
  },
}
const afterCat = cellsNeededByOpenPlanted(overlapBoard, ['bonus-cat'])
assert.equal(afterCat.has(cellKey({ r: 0, c: 2 })), true, 'shared C stays needed for CAR')
assert.equal(afterCat.has(cellKey({ r: 1, c: 2 })), true)
assert.equal(afterCat.has(cellKey({ r: 0, c: 0 })), false, 'exclusive CAT cells drop after CAT is found')
assert.equal(cellsNeededByOpenPlanted(overlapBoard, ['bonus-cat', 'bonus-car']).size, 0)
const fatherSample = fatherBoard.planted[0]
assert.ok(fatherSample, 'father has a planted extra')
const fatherSamplePath = fatherBoard.bonusPaths[fatherSample.id] ?? findStraightSpelling(fatherBoard.letters, fatherSample.text)
assert.ok(fatherSamplePath && fatherSamplePath.length === fatherSample.text.length, 'planted extra sits on the father board')
assert.equal(pathLetters(fatherSamplePath, fatherBoard.letters), fatherSample.text)
assert.equal(matchBonusWord(fatherSamplePath, fatherBoard, [])?.text, fatherSample.text)
assert.equal(matchGemWord(fatherSamplePath, fatherBoard, []), null)
assert.equal(matchBonusWord([...fatherSamplePath].reverse(), fatherBoard, [])?.text, fatherSample.text)
const mercyChip = fatherBoard.words.find((word) => word.text === 'MERCY')
if (mercyChip) {
  assert.equal(matchGemWord(fatherBoard.paths[mercyChip.id], fatherBoard, [])?.text, 'MERCY')
  assert.equal(matchBonusWord(fatherBoard.paths[mercyChip.id], fatherBoard, []), null)
}
const reverseHelp = [...(mercy.bonusPaths[mercy.planted[0].id] ?? [])].reverse()
assert.equal(matchBonusWord(reverseHelp, mercy, [])?.text, mercy.planted[0].text)
for (const word of planted) {
  assert.equal(pathLetters(mercy.bonusPaths[word.id], mercy.letters), word.text)
  assert.equal(isStraightPath(mercy.bonusPaths[word.id]), true)
  assert.equal(matchBonusWord(mercy.bonusPaths[word.id], mercy, [])?.text, word.text)
  assert.equal(matchGemWord(mercy.bonusPaths[word.id], mercy, []), null)
}
const awarded = applyMatchBonus({ matchBonus: {}, matchExtra: {} }, 'ph-road')
assert.equal(awarded.matchBonus['ph-road'], 100)
assert.equal(awarded.matchExtra['ph-road'], 1)
const afterMiss = applyMatchMiss(awarded, 'ph-road')
assert.equal(afterMiss.matchBonus['ph-road'], 75)
assert.equal(awarded.matchExtra['ph-road'], 1, 'miss does not spend extra tries')
assert.equal(applyMatchMiss({ matchBonus: {} }, 'ph-road').matchBonus['ph-road'], undefined)
assert.equal(applyMatchMiss({ matchBonus: { 'ph-road': 20 } }, 'ph-road').matchBonus['ph-road'], undefined)
assert.equal(bonusFace(100), '+100 bonus')
assert.equal(bonusFace(75), '+75 bonus')
assert.equal(bonusFace(0), '')
assert.equal(consumeMatchExtra(awarded, 'ph-road').matchExtra['ph-road'], undefined)
assert.match(gemBonusBeat('Help').title, /BONUS! \+100/)
assert.match(gemBonusBeat('Help').why, /Extra try/)
assert.match(gemTargetBeat(mercyWords[0]).title, /Yes/)
assert.match(matchClearBeat('ph-road').title, /Neighbor/)
assert.match(matchClearBeat('ph-road').from ?? '', /Luke 10/)

for (const id of EASY_LINE_ORDER) {
  const puzzle = buildGemPuzzle(id)
  assert.ok(puzzle.words.length >= 3, `${id} has words`)
  assert.ok(puzzle.size >= 6 && puzzle.size <= 8, `${id} board size`)
  assert.ok(
    puzzle.words.every((word) => word.text !== 'BED'),
    `${id} does not require Bed as a chip`,
  )
  assert.ok(puzzle.planted.length >= MIN_BONUS_PLANT, `${id} plants several extras`)
  assert.ok(puzzle.planted.length <= MAX_BONUS_PLANT + 2, `${id} does not flood extras`)
  assert.ok(
    new Set(puzzle.planted.map((word) => word.text)).size >= MIN_BONUS_PLANT,
    `${id} plants distinct extras`,
  )
  const chips = new Set(puzzle.words.map((word) => word.text))
  for (const word of puzzle.planted) {
    assert.equal(isPlantableBonusWord(word.text), true, `${id} ${word.text} from dict`)
    assert.equal(isKidFriendlyBonusWord(word.text), true, `${id} ${word.text} kid-friendly`)
    assert.equal(chips.has(word.text), false, `${id} ${word.text} is not a required chip`)
    assert.ok(
      ![...chips].some((chip) => chip.includes(word.text)),
      `${id} ${word.text} is not inside a chip`,
    )
    const path = puzzle.bonusPaths[word.id]
    assert.ok(path && path.length === word.text.length, `${id} ${word.text} placed`)
    assert.equal(pathLetters(path, puzzle.letters), word.text, `${id} ${word.text} letters`)
    assert.equal(isStraightPath(path), true, `${id} ${word.text} straight`)
    assert.equal(matchBonusWord(path, puzzle, [])?.text, word.text)
    assert.equal(matchGemWord(path, puzzle, []), null)
    assert.equal(matchBonusWord([...path].reverse(), puzzle, [])?.text, word.text)
  }
  for (const word of puzzle.words) {
    assert.ok(word.text.length >= 3 && word.text.length <= 8, `${id} ${word.text} length`)
    const path = puzzle.paths[word.id]
    assert.ok(path && path.length === word.text.length, `${id} chip ${word.text} planted before fill`)
    assert.equal(pathLetters(path, puzzle.letters), word.text, `${id} ${word.text} letters`)
    assert.equal(isStraightPath(path), true, `${id} ${word.text} straight`)
  }
}

const leftoverFive = ['BED', 'GAP', 'CAT', 'HAT', 'RUN']
const plantedSets = [0, 1, 2, 3, 4, 5, 6, 7].map((salt) =>
  buildGemPuzzle('ph-debt', salt)
    .planted.map((word) => word.text)
    .sort()
    .join(','),
)
assert.ok(new Set(plantedSets).size >= 5, 'extra-try salt reshuffles planted extras')
assert.notEqual(
  buildGemPuzzle('ph-debt').planted.map((word) => word.text).sort().join(','),
  buildGemPuzzle('wb-creed').planted.map((word) => word.text).sort().join(','),
  'lessons draw different planted extras',
)
assert.deepEqual(
  buildGemPuzzle('ph-debt', 4).planted.map((word) => word.text),
  buildGemPuzzle('ph-debt', 4).planted.map((word) => word.text),
  'same lesson + salt stays stable',
)
const alwaysLeftover = plantedSets.every((set) => leftoverFive.every((word) => set.split(',').includes(word)))
assert.equal(alwaysLeftover, false, 'not the leftover Bed/Gap/Cat/Hat/Run set forever')
assert.ok(plantCandidates(new Set(['NEIGHBOR']), () => 0.3).length >= 100, 'dict-sized plant pool')

const playSrc = readFileSync(
  new URL('../src/components/challenges/GemSearchPlay.tsx', import.meta.url),
  'utf8',
)
assert.match(playSrc, /is-gem-search/)
assert.match(playSrc, /is-burst/)
assert.match(playSrc, /onCellDown/)
assert.match(playSrc, /applyCell/)
assert.match(playSrc, /EASY\.matchWin/)
assert.match(playSrc, /EASY\.holdNext/)
assert.match(playSrc, /EASY\.matchHunt/)
assert.match(playSrc, /Try this word/)
assert.match(playSrc, /is-panel-blast/)
assert.match(playSrc, /is-story-docked/)
assert.match(playSrc, /recordMatchDockJuice/)
assert.match(playSrc, /MATCH_DOCK_JUICE_POINTS/)
assert.match(playSrc, /StoryStrip/)
assert.match(playSrc, /onClear/)
assert.match(playSrc, /revealPanel/)
assert.match(playSrc, /winStamp/)
assert.match(playSrc, /recordMatchBonus/)
assert.match(playSrc, /recordMatchMiss/)
assert.match(playSrc, /EASY\.moreMatch/)
assert.match(playSrc, /function replay/)
assert.match(playSrc, /data-match-again/)
assert.match(playSrc, /Combo/)
assert.ok(playSrc.lastIndexOf('EASY.holdNext') < playSrc.lastIndexOf('EASY.moreMatch'))
assert.match(playSrc, /function closeSheet/)
assert.match(playSrc, /function endDrag/)
assert.match(playSrc, /heroFlash/)
assert.match(
  playSrc,
  /match-score[\s\S]*?<\/p>\s*<\/div>\s*\{status === 'ok' \?/,
  'Lock In stays outside the hidden board scroller',
)
const winCss = readFileSync(new URL('../src/styles/matchWin.css', import.meta.url), 'utf8')
assert.match(winCss, /\.play\.is-gem-search\.is-win \.cta-dock \.btn\.primary/)
assert.match(winCss, /font-weight:\s*800/)
assert.doesNotMatch(playSrc, /extras > 0/)
assert.match(playSrc, /Date\.now\(\)/)
assert.match(playSrc, /setRound\(\(current\) => current \+ 1\)/)
assert.match(playSrc, /bonus-banner/)
assert.match(playSrc, /EASY\.bonusHint/)
assert.match(playSrc, /bonusHint=\{EASY\.bonusHint\}/)
assert.match(playSrc, /bonusWords=/)
assert.match(playSrc, /useState<'hero' \| 'dock' \| 'sheet'>\('dock'\)/)
assert.doesNotMatch(playSrc, /gem-words is-bonus/, 'no multi-row bonus grid above the board')
assert.match(
  readFileSync(new URL('../src/components/StoryStrip.tsx', import.meta.url), 'utf8'),
  /story-dock-extras/,
)
assert.match(
  readFileSync(new URL('../src/components/StoryStrip.tsx', import.meta.url), 'utf8'),
  /gem-word is-bonus/,
)
assert.match(playSrc, /cellsNeededByOpenPlanted/)
assert.match(playSrc, /bonusGhosted/)
assert.match(playSrc, /is-cracked/)
assert.match(playSrc, /setBonusGhosted\(\[\]\)/)
assert.match(playSrc, /\+100/)
assert.match(playSrc, /bonus-plus/)
assert.match(playSrc, /MatchTakeaway/)
assert.match(playSrc, /matchBonusWord/)
assert.match(playSrc, /EASY\.bonusMissWord/)
assert.match(playSrc, /EASY\.bonusMissStraight/)
assert.match(playSrc, /EASY\.missPenalty/)
assert.match(playSrc, /miss-banner/)
assert.match(playSrc, /scoredThisGesture/)
assert.match(playSrc, /scoredThisGesture\.current = true/)
assert.match(playSrc, /scoredThisGesture\.current = false/)
assert.match(playSrc, /if \(scoredThisGesture\.current\) return/)
assert.match(playSrc, /shouldMissAfterSwipe/)
assert.match(playSrc, /nextPath\.length >= 3/)
assert.match(playSrc, /snapFingerPath/)
assert.match(playSrc, /gem-stage/)
assert.match(
  playSrc,
  /className="gem-stage"[\s\S]*miss-banner[\s\S]*className="gem-board"/,
)
const gemCss = readAppCss()
assert.match(gemCss, /play\.is-gem-search\.is-shake \{\s*animation: none/)
assert.match(gemCss, /gem-stage \.miss-banner/)
assert.match(gemCss, /gem-overlay-pop/)
assert.match(gemCss, /pointer-events: none/)
assert.match(gemCss, /is-story-docked/)
assert.match(gemCss, /grid-template-rows:\s*repeat\(var\(--gem-size/)
assert.match(gemCss, /is-story-docked[\s\S]{0,900}flex:\s*0\s+1\s+auto/)
const tightCss = readFileSync(new URL('../src/styles/match-art-tight.css', import.meta.url), 'utf8')
assert.match(tightCss, /is-story-docked[\s\S]{0,500}aspect-ratio:\s*unset/)
assert.match(tightCss, /is-story-docked[\s\S]{0,500}gap:\s*0/)
assert.match(gemCss, /\.story-strip\.is-dock/)
assert.match(gemCss, /writing-mode:\s*horizontal-tb/)
assert.match(gemCss, /story-dock-word[\s\S]*white-space:\s*nowrap/)
assert.doesNotMatch(gemCss, /is-story-docked[\s\S]{0,400}74dvh|is-story-docked[\s\S]{0,800}76dvh/, 'board must not use viewport-dvh that overflows under the dock')
assert.match(gemCss, /justify-content:\s*flex-start/)
assert.match(gemCss, /position:\s*relative;\s*\/\* never absolute/)
assert.match(gemCss, /\.story-sheet/)
assert.match(gemCss, /story-dock-extras/)
assert.match(gemCss, /display: none !important/)
assert.match(gemCss, /\.gem-cell\.is-cracked \{/)
const crackedRule = gemCss.match(/\.gem-cell\.is-cracked \{[^}]+\}/)?.[0] ?? ''
assert.match(crackedRule, /opacity: 0\.55/)
assert.doesNotMatch(crackedRule, /pointer-events/, 'cracked bonus cells stay swipeable')
assert.match(
  readFileSync(new URL('../src/lib/easyUi.ts', import.meta.url), 'utf8'),
  /Not a bonus word/,
)
assert.match(
  readFileSync(new URL('../src/lib/easyUi.ts', import.meta.url), 'utf8'),
  /Try a full straight word/,
)
assert.match(
  readFileSync(new URL('../src/lib/easyUi.ts', import.meta.url), 'utf8'),
  /Miss −25/,
)

const debtBoard = buildGemPuzzle('ph-debt')
assert.ok(debtBoard.planted.length >= MIN_BONUS_PLANT, 'debt gem board plants extras')
assert.equal(isBonusSpelling('BED', debtBoard), true, 'Bed still counts if it appears')
const debtSample = debtBoard.planted[0]
assert.ok(debtSample)
const debtPath =
  debtBoard.bonusPaths[debtSample.id] ?? findStraightSpelling(debtBoard.letters, debtSample.text)
assert.ok(debtPath && debtPath.length === debtSample.text.length)
assert.equal(matchBonusWord(debtPath, debtBoard, [])?.text, debtSample.text)
assert.match(
  readFileSync(new URL('../src/components/Journal.tsx', import.meta.url), 'utf8'),
  /\+100 bonus|bonusFace/,
)
assert.match(
  readFileSync(new URL('../src/components/challenges/WhyBlastPlay.tsx', import.meta.url), 'utf8'),
  /holdSuccessBeat/,
)
assert.match(
  readFileSync(new URL('../src/components/challenges/WhyBlastPlay.tsx', import.meta.url), 'utf8'),
  /WinBurst/,
)
assert.match(
  readFileSync(new URL('../src/components/RecallGate.tsx', import.meta.url), 'utf8'),
  /playGemPop/,
)
assert.match(
  readFileSync(new URL('../src/components/challenges/WhyBlastPlay.tsx', import.meta.url), 'utf8'),
  /MatchTakeaway/,
)
assert.match(matchClearBeat('ph-road').why, /hurt man|help|mercy/i)
assert.match(
  readFileSync(new URL('../src/lib/easyUi.ts', import.meta.url), 'utf8'),
  /Yes — keep this/,
)
assert.match(
  readFileSync(new URL('../src/components/StoryStrip.tsx', import.meta.url), 'utf8'),
  /story-hero/,
)
assert.match(
  readFileSync(new URL('../src/components/StoryStrip.tsx', import.meta.url), 'utf8'),
  /story-thumbs/,
)
assert.doesNotMatch(playSrc, /Tap a sentence/)

const artSrc = readFileSync(
  new URL('../src/components/StoryPanelArt.tsx', import.meta.url),
  'utf8',
)
assert.match(artSrc, /panel-hurt\.webp/)
assert.match(artSrc, /panel-father-run\.webp/)
assert.match(artSrc, /panel-speech\.webp/)
assert.match(artSrc, /panel-help\.webp/)
assert.match(artSrc, /<video/)
assert.match(artSrc, /playsInline/)
assert.equal(resolveStoryMedia({ kind: 'still' }).kind, 'still')
assert.equal(resolveStoryMedia({ kind: 'still', loop: 'beat.webm' }).kind, 'loop')
assert.equal(resolveStoryMedia({ kind: 'still', loop: 'beat.webm' }).loop, 'beat.webm')

const puzzleSrc = readFileSync(new URL('../src/components/PuzzlePlay.tsx', import.meta.url), 'utf8')
assert.match(puzzleSrc, /GemSearchPlay/)
assert.match(puzzleSrc, /isEasy\(progress\)/)
assert.match(puzzleSrc, /onClear=\{onSolved\}/)
assert.match(puzzleSrc, /lessonStory/)
assert.match(puzzleSrc, /panel-blast/)
assert.match(puzzleSrc, /FatherRunPlay/)
assert.match(puzzleSrc, /father-run/)
assert.match(puzzleSrc, /claim-merge/)
assert.match(puzzleSrc, /source-dig/)
assert.match(puzzleSrc, /SourceDigPlay/)
assert.doesNotMatch(puzzleSrc, /timing-dash|road-swipe|story-night/)

const fatherStory = packLesson('ph-father')?.easy.learn ?? ''
const fatherPanels = storyPanelsFor('ph-father', gemWordsFor('ph-father').length)
assert.equal(storyFromPanels(fatherPanels), fatherStory)
assert.equal(fatherPanels.length, 5)
assert.deepEqual(
  fatherPanels.map((panel) => panel.scene),
  ['son-leave', 'hungry', 'speech', 'father-run', 'hug'],
)

const mercyStory = packLesson('ph-road')?.easy.learn ?? ''
const mercyPanels = storyPanelsFor('ph-road', mercyWords.length)
assert.equal(storyFromPanels(mercyPanels), mercyStory)
assert.ok(mercyPanels.some((panel) => panel.scene === 'help' || panel.scene === 'hurt'))
assert.ok(mercyPanels.every((panel) => panel.media.kind === 'still' && panel.beatId.includes('ph-road')))
assert.ok(
  mercyPanels.every((panel) => panel.media.still?.includes('panel-blast/ph-road/') && panel.media.thumb?.includes('@512.webp')),
  'ph-road Easy Match panels use panel-blast stills',
)
assert.ok(fatherPanels[2]?.media.still?.includes('03-speech-road@1024.webp'), 'father B3 is 03-speech-road')
assert.equal(splitStorySentences(mercyStory).length, 5)

for (const id of EASY_LINE_ORDER) {
  const puzzle = buildGemPuzzle(id)
  const panels = storyPanelsFor(id, puzzle.words.length)
  const story = lessonStory(id, puzzle.words.length)
  const play =
    id === 'ph-father'
      ? 'father-run'
      : id === 'ph-road'
        ? 'road-maze'
        : id === 'wb-creed'
          ? 'claim-merge'
          : id === 'daily-lantern'
            ? 'story-snap'
            : isSourceDigLine(id)
              ? 'source-dig'
              : 'panel-blast'
  assert.equal(storyPlayFor(id), play, `${id} play`)
  assert.equal(story.play, play)
  assert.deepEqual(story.beats, panels)
  const expect =
    id === 'ph-father' ? 5 : Math.max(3, Math.min(4, puzzle.words.length))
  assert.equal(panels.length, expect, `${id} panel count`)
  assert.ok(panels.every((panel) => panel.text.trim().length > 0), `${id} panel text`)
  assert.ok(panels.every((panel) => panel.media && panel.beatId), `${id} beat + media`)
}

const gemSearchSrc = readFileSync(new URL('../src/lib/gemSearch.ts', import.meta.url), 'utf8')
const gemGridSrc = readFileSync(new URL('../src/lib/gemSearchGrid.ts', import.meta.url), 'utf8')
assert.match(gemSearchSrc, /from '\.\/gemSearchGrid\.ts'/)
assert.match(gemGridSrc, /export function (fillGrid|snapFingerPath|tryPlaceWord)/)
assert.doesNotMatch(gemSearchSrc, /function emptyGrid\(/)

console.log(`check-gem-search: ok (bonus dict ${COMMON_BONUS_COUNT} words, 3–6)`)
