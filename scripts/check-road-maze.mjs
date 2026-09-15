import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import {
  canHelp,
  canWin,
  MAZE_HURT,
  MAZE_INN,
  MAZE_ITEM_AT,
  MAZE_ITEMS,
  MAZE_START,
  mazeBeatsOpened,
  mazeBlockedHint,
  mazeGoal,
  mazeItemAt,
  mazeSame,
  ROAD_MAZE_CLAIM,
  ROAD_MAZE_HINT,
  ROAD_MAZE_LINE,
  ROAD_MAZE_WIN,
  shortestMazePath,
  swipeStep,
} from '../src/lib/roadMaze.ts'
import { lessonStory, storyPlayFor } from '../src/lib/storyPlay.ts'
import { mazeWinBeat } from '../src/lib/successBeat.ts'

assert.equal(ROAD_MAZE_LINE, 'ph-road')
assert.equal(ROAD_MAZE_CLAIM, 'Neighbor is the one who shows mercy.')
assert.equal(ROAD_MAZE_WIN, 'Helped!')
assert.equal(storyPlayFor('ph-road'), 'panel-blast')
assert.equal(storyPlayFor('ph-father'), 'father-run')
assert.equal(storyPlayFor('ph-debt'), 'panel-blast')
assert.equal(lessonStory('ph-road').play, 'panel-blast')
assert.equal(lessonStory('ph-father').play, 'father-run')

assert.equal(MAZE_ITEMS.length, 3)
assert.deepEqual(
  MAZE_ITEMS.map((item) => item.id),
  ['oil', 'cloth', 'coin'],
)

for (const item of MAZE_ITEMS) {
  const path = shortestMazePath(MAZE_START, MAZE_ITEM_AT[item.id])
  assert.ok(path && path.length > 1, `${item.id} reachable`)
  assert.equal(mazeItemAt(MAZE_ITEM_AT[item.id])?.id, item.id)
}
assert.ok(shortestMazePath(MAZE_START, MAZE_HURT))
assert.ok(shortestMazePath(MAZE_HURT, MAZE_INN))
assert.ok(shortestMazePath(MAZE_ITEM_AT.coin, MAZE_INN))
assert.equal(shortestMazePath(MAZE_START, { r: 0, c: 2 }), null)

assert.equal(canHelp([]), false)
assert.equal(canHelp(['oil', 'cloth']), true)
assert.equal(canWin(['oil', 'cloth'], true, MAZE_INN), false)
assert.equal(canWin(['oil', 'cloth', 'coin'], true, MAZE_INN), true)
assert.equal(canWin(['oil', 'cloth', 'coin'], false, MAZE_INN), false)
assert.equal(canWin(['oil', 'cloth', 'coin'], true, MAZE_HURT), false)

assert.equal(mazeGoal([], false).id, 'oil')
assert.equal(mazeGoal(['oil'], false).id, 'cloth')
assert.equal(mazeGoal(['oil', 'cloth'], false).kind, 'hurt')
assert.equal(mazeGoal(['oil', 'cloth'], true).id, 'coin')
assert.equal(mazeGoal(['oil', 'cloth', 'coin'], true).kind, 'inn')

assert.match(mazeBlockedHint(MAZE_HURT, [], false), /oil and cloth/)
assert.match(mazeBlockedHint(MAZE_INN, ['oil', 'cloth'], false), /hurt man/)
assert.match(mazeBlockedHint(MAZE_INN, ['oil', 'cloth'], true), /coin/)
assert.equal(mazeBlockedHint(MAZE_START, [], false), ROAD_MAZE_HINT)

assert.equal(mazeBeatsOpened([], false, false), 1)
assert.equal(mazeBeatsOpened(['oil'], false, false), 2)
assert.equal(mazeBeatsOpened(['oil', 'cloth'], true, false), 3)
assert.equal(mazeBeatsOpened(['oil', 'cloth', 'coin'], true, true), 4)

assert.ok(swipeStep(MAZE_START, 0, 1))
assert.equal(swipeStep(MAZE_START, -1, 0), null)
assert.equal(mazeSame(MAZE_START, { r: 0, c: 0 }), true)

assert.match(mazeWinBeat().title, /Neighbor/)
assert.match(mazeWinBeat().why, /hurt man|help/i)

const playSrc = readFileSync(
  new URL('../src/components/challenges/RoadMazePlay.tsx', import.meta.url),
  'utf8',
)
assert.match(playSrc, /is-road-maze/)
assert.match(playSrc, /maze-board/)
assert.match(playSrc, /onBoardKey/)
assert.match(playSrc, /EASY\.mazeHunt/)
assert.match(playSrc, /EASY\.holdNext/)
assert.match(playSrc, /ROAD_MAZE_WIN/)
assert.match(playSrc, /panel-help/)
assert.match(playSrc, /panel-hurt/)
assert.match(playSrc, /mazeWinBeat/)
assert.match(playSrc, /maze-win-art/)
assert.match(playSrc, /ROAD_MAZE_CLAIM/)
assert.doesNotMatch(playSrc, /road-swipe|claim-merge|story-night/)

const puzzleSrc = readFileSync(new URL('../src/components/PuzzlePlay.tsx', import.meta.url), 'utf8')
assert.match(puzzleSrc, /RoadMazePlay/)
assert.match(puzzleSrc, /case 'road-maze'/)
assert.match(puzzleSrc, /case 'father-run'/)
assert.match(puzzleSrc, /case 'panel-blast'/)
assert.doesNotMatch(puzzleSrc, /timing-dash|road-swipe|claim-merge|story-night/)

const hubSrc = readFileSync(new URL('../src/components/Hub.tsx', import.meta.url), 'utf8')
assert.match(hubSrc, /EASY\.mazeHome/)
assert.match(hubSrc, /EASY\.mazeMatch/)
assert.match(hubSrc, /EASY\.matchCta/)

console.log('check-road-maze: ok')
