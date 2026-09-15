import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { EASY_LINE_ORDER } from '../src/lib/easy.ts'
import { packLesson } from '../src/content/packCatalog.ts'
import {
  BONUS_WORD_MAX,
  BONUS_WORD_MIN,
  COMMON_BONUS_COUNT,
  COMMON_BONUS_WORDS,
  PLANTED_EXTRAS,
} from '../src/lib/commonBonusWords.ts'
import {
  bonusWordsFor,
  buildGemPuzzle,
  findStraightSpelling,
  gemWordsFor,
  isBonusSpelling,
  isStraightPath,
  matchBonusWord,
  matchGemWord,
  pathLetters,
  tryAddToPath,
} from '../src/lib/gemSearch.ts'
import {
  applyMatchBonus,
  applyMatchMiss,
  bonusFace,
  consumeMatchExtra,
  MATCH_BONUS_POINTS,
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

const mercyWords = gemWordsFor('ph-road')
assert.ok(mercyWords.some((word) => word.text === 'MERCY'), 'Mercy the person')
assert.ok(mercyWords.some((word) => word.text === 'CREEK'), 'Story Creek place')
assert.ok(mercyWords.some((word) => word.text === 'NEIGHBOR'), 'claim word')
assert.ok(mercyWords.some((word) => word.kind === 'person'))
assert.ok(mercyWords.some((word) => word.kind === 'place'))
assert.ok(mercyWords.some((word) => word.kind === 'idea'))
assert.ok(mercyWords.length >= 3 && mercyWords.length <= 4)

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
assert.equal(MATCH_MISS_POINTS, 25)
const planted = mercy.bonus.filter((word) => (mercy.bonusPaths[word.id] ?? []).length === word.text.length)
assert.ok(planted.length >= 5, 'mercy plants bonus words')
assert.ok(mercy.planted.length >= 5, 'planted extras on the board')
assert.ok(
  mercy.planted.some((word) => word.text === 'GAP' || word.text === 'ROAD' || word.text === 'HELP'),
)
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
assert.equal(COMMON_BONUS_COUNT, COMMON_BONUS_WORDS.size)
assert.ok(COMMON_BONUS_COUNT >= 900, `dict too thin: ${COMMON_BONUS_COUNT}`)
for (const word of COMMON_BONUS_WORDS) {
  assert.ok(word.length >= 3 && word.length <= 6, `${word} length band`)
}
assert.deepEqual([...PLANTED_EXTRAS], ['BED', 'CAT', 'HAT', 'RUN', 'SON', 'GAP', 'YES', 'NET'])

const fatherBoard = buildGemPuzzle('ph-father')
assert.ok(fatherBoard.planted.some((word) => word.text === 'GAP'), 'father plants Gap')
assert.ok(fatherBoard.planted.some((word) => word.text === 'BED'), 'father plants Bed')
assert.equal(isBonusSpelling('GAP', fatherBoard), true)
assert.equal(isBonusSpelling('BED', fatherBoard), true)
assert.equal(isBonusSpelling('QQQ', fatherBoard), false)
assert.equal(isBonusSpelling('FAT', fatherBoard), false, 'FAT is a piece of FATHER')
assert.equal(isBonusSpelling('NEIGHBOR', fatherBoard), false, '7+ letters stay off the bonus band')
const gapPath =
  fatherBoard.bonusPaths[fatherBoard.planted.find((word) => word.text === 'GAP')?.id ?? ''] ??
  findStraightSpelling(fatherBoard.letters, 'GAP')
assert.ok(gapPath && gapPath.length === 3, 'Gap sits on the father board')
assert.equal(pathLetters(gapPath, fatherBoard.letters), 'GAP')
assert.equal(matchBonusWord(gapPath, fatherBoard, [])?.text, 'GAP')
assert.equal(matchGemWord(gapPath, fatherBoard, []), null)
assert.equal(matchBonusWord([...gapPath].reverse(), fatherBoard, [])?.text, 'GAP')
const bedPath =
  fatherBoard.bonusPaths[fatherBoard.planted.find((word) => word.text === 'BED')?.id ?? ''] ??
  findStraightSpelling(fatherBoard.letters, 'BED')
assert.ok(bedPath && bedPath.length === 3, 'Bed sits on the father board')
assert.equal(pathLetters(bedPath, fatherBoard.letters), 'BED')
assert.equal(matchBonusWord(bedPath, fatherBoard, [])?.text, 'BED')
assert.equal(matchGemWord(bedPath, fatherBoard, []), null)
assert.equal(matchBonusWord([...bedPath].reverse(), fatherBoard, [])?.text, 'BED')
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

for (const id of EASY_LINE_ORDER) {
  const puzzle = buildGemPuzzle(id)
  assert.ok(puzzle.words.length >= 3, `${id} has words`)
  assert.ok(puzzle.size >= 6 && puzzle.size <= 8, `${id} board size`)
  assert.ok(
    puzzle.words.every((word) => word.text !== 'BED'),
    `${id} does not require Bed as a chip`,
  )
  assert.ok(puzzle.planted.some((word) => word.text === 'BED'), `${id} plants Bed`)
  assert.ok(puzzle.planted.length >= 5, `${id} plants several extras`)
  assert.ok(
    new Set(puzzle.planted.map((word) => word.text)).size >= 4,
    `${id} plants distinct extras`,
  )
  for (const word of puzzle.words) {
    assert.ok(word.text.length >= 3 && word.text.length <= 8, `${id} ${word.text} length`)
    const path = puzzle.paths[word.id]
    assert.ok(path && path.length === word.text.length, `${id} ${word.text} placed`)
    assert.equal(pathLetters(path, puzzle.letters), word.text, `${id} ${word.text} letters`)
    assert.equal(isStraightPath(path), true, `${id} ${word.text} straight`)
  }
}

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
assert.match(playSrc, /StoryStrip/)
assert.match(playSrc, /onClear/)
assert.match(playSrc, /revealPanel/)
assert.match(playSrc, /winStamp/)
assert.match(playSrc, /recordMatchBonus/)
assert.match(playSrc, /recordMatchMiss/)
assert.match(playSrc, /EASY\.moreMatch/)
assert.match(playSrc, /bonus-banner/)
assert.match(playSrc, /EASY\.bonusHint/)
assert.match(playSrc, /is-bonus/)
assert.match(playSrc, /\+100/)
assert.match(playSrc, /bonus-plus/)
assert.match(playSrc, /match-yes/)
assert.match(playSrc, /matchBonusWord/)
assert.match(playSrc, /EASY\.bonusMissWord/)
assert.match(playSrc, /EASY\.bonusMissStraight/)
assert.match(playSrc, /EASY\.missPenalty/)
assert.match(playSrc, /miss-banner/)
assert.match(
  readFileSync(new URL('../src/lib/easy.ts', import.meta.url), 'utf8'),
  /Not a bonus word/,
)
assert.match(
  readFileSync(new URL('../src/lib/easy.ts', import.meta.url), 'utf8'),
  /Try a full straight word/,
)
assert.match(
  readFileSync(new URL('../src/lib/easy.ts', import.meta.url), 'utf8'),
  /Miss −25/,
)

const debtBoard = buildGemPuzzle('ph-debt')
assert.ok(debtBoard.planted.some((word) => word.text === 'BED'), 'debt gem board plants Bed')
assert.equal(isBonusSpelling('BED', debtBoard), true)
const debtBed =
  debtBoard.bonusPaths[debtBoard.planted.find((word) => word.text === 'BED')?.id ?? ''] ??
  findStraightSpelling(debtBoard.letters, 'BED')
assert.ok(debtBed && debtBed.length === 3)
assert.equal(matchBonusWord(debtBed, debtBoard, [])?.text, 'BED')
assert.match(
  readFileSync(new URL('../src/components/Journal.tsx', import.meta.url), 'utf8'),
  /\+100 bonus|bonusFace/,
)
assert.match(
  readFileSync(new URL('../src/components/RecallGate.tsx', import.meta.url), 'utf8'),
  /holdSuccessBeat/,
)
assert.match(
  readFileSync(new URL('../src/components/RecallGate.tsx', import.meta.url), 'utf8'),
  /WinBurst/,
)
assert.match(
  readFileSync(new URL('../src/components/RecallGate.tsx', import.meta.url), 'utf8'),
  /playGemPop/,
)
assert.match(
  readFileSync(new URL('../src/components/RecallGate.tsx', import.meta.url), 'utf8'),
  /match-yes/,
)
assert.match(matchClearBeat('ph-road').why, /hurt man|help|mercy/i)
assert.match(
  readFileSync(new URL('../src/lib/easy.ts', import.meta.url), 'utf8'),
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
assert.doesNotMatch(puzzleSrc, /timing-dash|road-swipe|claim-merge|story-night/)

const fatherStory = packLesson('ph-father')?.easy.learn ?? ''
const fatherPanels = storyPanelsFor('ph-father', gemWordsFor('ph-father').length)
assert.equal(storyFromPanels(fatherPanels), fatherStory)
assert.ok(fatherPanels.length >= 3 && fatherPanels.length <= 4)

const mercyStory = packLesson('ph-road')?.easy.learn ?? ''
const mercyPanels = storyPanelsFor('ph-road', mercyWords.length)
assert.equal(storyFromPanels(mercyPanels), mercyStory)
assert.ok(mercyPanels.some((panel) => panel.scene === 'help' || panel.scene === 'hurt'))
assert.ok(mercyPanels.every((panel) => panel.media.kind === 'still' && panel.beatId.includes('ph-road')))
assert.equal(splitStorySentences(mercyStory).length, 5)

for (const id of EASY_LINE_ORDER) {
  const puzzle = buildGemPuzzle(id)
  const panels = storyPanelsFor(id, puzzle.words.length)
  const story = lessonStory(id, puzzle.words.length)
  const play = id === 'ph-father' ? 'father-run' : id === 'ph-road' ? 'road-maze' : 'panel-blast'
  assert.equal(storyPlayFor(id), play, `${id} play`)
  assert.equal(story.play, play)
  assert.deepEqual(story.beats, panels)
  assert.equal(panels.length, Math.max(3, Math.min(4, puzzle.words.length)), `${id} panel count`)
  assert.ok(panels.every((panel) => panel.text.trim().length > 0), `${id} panel text`)
  assert.ok(panels.every((panel) => panel.media && panel.beatId), `${id} beat + media`)
}

console.log(`check-gem-search: ok (bonus dict ${COMMON_BONUS_COUNT} words, 3–6)`)
