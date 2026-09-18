import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import {
  canHelp,
  canWin,
  MAZE_BEATS,
  MAZE_HURT,
  MAZE_INN,
  MAZE_START,
  mazeBeatDone,
  mazeBeatsOpened,
  mazeBlockedHint,
  mazeCaption,
  mazeGoal,
  mazeSame,
  ROAD_MAZE_CLAIM,
  ROAD_MAZE_HINT,
  ROAD_MAZE_LINE,
  ROAD_MAZE_WIN,
  ROAD_MAZE_AGAIN,
  MAZE_CARE_WHY,
  MAZE_FIND_SCORE,
  MAZE_HELP_SCORE,
  MAZE_INN_SCORE,
  shortestMazePath,
  swipeStep,
  isMazeLookPan,
  isMazePathSwipe,
} from '../src/lib/roadMaze.ts'
import { EASY } from '../src/lib/easy.ts'
import { lessonStory, storyPlayFor } from '../src/lib/storyPlay.ts'
import { mazeWinBeat } from '../src/lib/successBeat.ts'

assert.equal(ROAD_MAZE_LINE, 'ph-road')
assert.equal(ROAD_MAZE_CLAIM, 'Neighbor is the one who shows mercy.')
assert.equal(ROAD_MAZE_WIN, 'Helped!')
assert.equal(ROAD_MAZE_AGAIN, 'One more road')
assert.equal(EASY.mazeAgain, ROAD_MAZE_AGAIN)
assert.equal(MAZE_FIND_SCORE, 25)
assert.equal(MAZE_HELP_SCORE, 50)
assert.equal(MAZE_INN_SCORE, 100)
assert.match(MAZE_CARE_WHY, /wounds/)
assert.equal(storyPlayFor('ph-road'), 'road-maze')
assert.equal(storyPlayFor('ph-father'), 'father-run')
assert.equal(storyPlayFor('ph-debt'), 'panel-blast')
assert.equal(lessonStory('ph-road').play, 'road-maze')
assert.equal(lessonStory('ph-father').play, 'father-run')

assert.deepEqual(
  MAZE_BEATS.map((beat) => beat.id),
  ['hurt', 'help', 'inn'],
)
assert.deepEqual(
  MAZE_BEATS.map((beat) => beat.label),
  ['Hurt man', 'Help', 'Inn'],
)
assert.ok(shortestMazePath(MAZE_START, MAZE_HURT))
assert.ok(shortestMazePath(MAZE_HURT, MAZE_INN))
assert.equal(shortestMazePath(MAZE_START, { r: 0, c: 2 }), null)

assert.equal(canHelp(false, false), false)
assert.equal(canHelp(true, false), true)
assert.equal(canHelp(true, true), false)
assert.equal(canWin(false, MAZE_INN), false)
assert.equal(canWin(true, MAZE_INN), true)
assert.equal(canWin(true, MAZE_HURT), false)

assert.equal(mazeGoal(false, false).kind, 'hurt')
assert.equal(mazeGoal(false, false).label, 'Hurt man')
assert.equal(mazeGoal(true, false).kind, 'help')
assert.equal(mazeGoal(true, false).label, 'Help')
assert.equal(mazeGoal(true, true).kind, 'inn')
assert.equal(mazeGoal(true, true).label, 'Inn')

assert.match(mazeBlockedHint(MAZE_INN, false, false), /hurt man/)
assert.match(mazeBlockedHint(MAZE_HURT, true, false), /help him/)
assert.equal(mazeBlockedHint(MAZE_START, false, false), ROAD_MAZE_HINT)
assert.match(mazeCaption(false, false, false), /hurt man/i)
assert.match(mazeCaption(true, false, false), /Help/)
assert.match(mazeCaption(true, true, false), /inn/i)

assert.equal(mazeBeatsOpened(false, false, false), 1)
assert.equal(mazeBeatsOpened(true, false, false), 2)
assert.equal(mazeBeatsOpened(true, true, false), 3)
assert.equal(mazeBeatsOpened(true, true, true), 4)
assert.equal(mazeBeatDone('hurt', true, false, false), true)
assert.equal(mazeBeatDone('help', true, false, false), false)
assert.equal(mazeBeatDone('inn', true, true, true), true)

assert.ok(swipeStep(MAZE_START, 0, 1))
assert.equal(swipeStep(MAZE_START, -1, 0), null)
assert.equal(mazeSame(MAZE_START, { r: 0, c: 0 }), true)
assert.equal(
  isMazeLookPan({ dx: 0, dy: 80, scrolled: 40, startedOnRoad: true }),
  true,
  'scrolling the play to peek is a look',
)
assert.equal(
  isMazePathSwipe({ dx: 0, dy: 80, scrolled: 40, startedOnRoad: true }),
  false,
  'a look-scroll is not a maze step',
)
assert.equal(
  isMazeLookPan({ dx: 12, dy: 90, scrolled: 0, startedOnRoad: false }),
  true,
  'panning off the road is a look',
)
assert.equal(
  isMazePathSwipe({ dx: 40, dy: 4, scrolled: 0, startedOnRoad: true }),
  true,
  'a swipe from the open road still steps',
)
assert.equal(
  isMazePathSwipe({ dx: 8, dy: 8, scrolled: 0, startedOnRoad: true }),
  false,
  'a fidget is not a step',
)

assert.match(mazeWinBeat().title, /Neighbor/)
assert.match(mazeWinBeat().why, /hurt man|help/i)
assert.match(mazeWinBeat().from ?? '', /Luke 10/)

const playSrc = readFileSync(
  new URL('../src/components/challenges/RoadMazePlay.tsx', import.meta.url),
  'utf8',
)
assert.match(playSrc, /is-road-maze/)
assert.match(playSrc, /maze-board/)
assert.match(playSrc, /onBoardKey/)
assert.match(playSrc, /EASY\.mazeHunt/)
assert.match(playSrc, /EASY\.holdNext/)
assert.match(playSrc, /ROAD_MAZE_AGAIN/)
assert.ok(playSrc.lastIndexOf('EASY.holdNext') < playSrc.lastIndexOf('ROAD_MAZE_AGAIN'))
assert.match(playSrc, /function replay/)
assert.match(playSrc, /maze-beats/)
assert.doesNotMatch(playSrc, /maze-cell-label/)
assert.doesNotMatch(playSrc, /maze-kit/)
assert.doesNotMatch(
  playSrc,
  /Oil|Cloth|Coin/,
  'inventory boxes are not the mercy story',
)
assert.match(playSrc, /markHelped/)
assert.match(EASY.mazeHunt, /hurt man/)
assert.match(playSrc, /ROAD_MAZE_WIN/)
assert.match(playSrc, /WinBurst play=\{winStamp\} stamp=\{ROAD_MAZE_WIN\}/)
assert.doesNotMatch(playSrc, /frame=\{ROAD_CLAIM_MEDIA/)
assert.doesNotMatch(playSrc, /maze-win-art/)
assert.match(playSrc, /panel-blast|ROAD_HELP_FACE/)
assert.match(playSrc, /panel-blast|ROAD_HURT_FACE/)
assert.match(playSrc, /01-hurt-road|ROAD_HURT_FACE/)
assert.match(playSrc, /03-compassion-helps|ROAD_HELP_FACE/)
assert.match(playSrc, /mazeWinBeat/)
assert.match(playSrc, /MatchTakeaway/)
assert.match(playSrc, /maze-stage/)
assert.match(playSrc, /isMazePathSwipe/)
assert.match(playSrc, /peeking/)
assert.doesNotMatch(
  playSrc,
  /if \(!road\) \{\s*event\.preventDefault\(\)\s*blocked/,
  'a rock pan is a look — not Stay on the open road',
)
assert.doesNotMatch(
  playSrc,
  /blocked\([\s\S]*onMiss\(\)/,
  'a blocked rock only reroutes — no lives',
)
assert.match(
  readFileSync(new URL('../src/index.css', import.meta.url), 'utf8'),
  /maze-cell\.is-rock \{[\s\S]*touch-action: pan-y/,
)
const mazeCss = readFileSync(new URL('../src/index.css', import.meta.url), 'utf8')
assert.match(
  mazeCss,
  /play\.is-road-maze \{[\s\S]*overflow: hidden/,
)
assert.match(
  mazeCss,
  /play\.is-road-maze\.is-win \.maze-cell \{[\s\S]*opacity: 0/,
)
assert.match(
  mazeCss,
  /play\.is-road-maze\.is-win \.maze-beats \{[\s\S]*display: none/,
)
assert.match(playSrc, /ROAD_MAZE_CLAIM/)
assert.doesNotMatch(playSrc, /road-swipe|story-night/)

const puzzleSrc = readFileSync(new URL('../src/components/PuzzlePlay.tsx', import.meta.url), 'utf8')
assert.match(puzzleSrc, /RoadMazePlay/)
assert.match(puzzleSrc, /case 'road-maze'/)
assert.match(puzzleSrc, /case 'father-run'/)
assert.match(puzzleSrc, /case 'panel-blast'/)
assert.match(puzzleSrc, /case 'claim-merge'/)
assert.doesNotMatch(puzzleSrc, /timing-dash|road-swipe|story-night/)

const hubSrc = readFileSync(new URL('../src/components/Hub.tsx', import.meta.url), 'utf8')
assert.match(hubSrc, /EASY\.mazeHome/)
assert.match(hubSrc, /EASY\.mazeMatch/)
assert.match(hubSrc, /EASY\.mazeMatch/)
assert.match(hubSrc, /EASY\.matchCta/)

console.log('check-road-maze: ok')
