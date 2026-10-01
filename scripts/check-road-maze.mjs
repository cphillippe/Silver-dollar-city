import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import {
  canHelp,
  canWin,
  MAZE_BEATS,
  MAZE_HURT,
  MAZE_INN,
  MAZE_PRESETS,
  MAZE_START,
  mazePresetIndex,
  setMazePreset,
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
  isAdjacentRoadStep,
  isMazeRoad,
  mazeStepToward,
} from '../src/lib/roadMaze.ts'
import { EASY } from '../src/lib/easy.ts'
import { lessonStory, storyPlayFor } from '../src/lib/storyPlay.ts'
import { mazeWinBeat } from '../src/lib/successBeat.ts'
import { readAppCss } from './readAppCss.mjs'

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
assert.equal(MAZE_PRESETS.length, 3)
assert.equal(mazePresetIndex(0), 0)
assert.equal(mazePresetIndex(3), 0)
assert.equal(mazePresetIndex(-1), 2)

for (let i = 0; i < MAZE_PRESETS.length; i += 1) {
  setMazePreset(i)
  assert.ok(shortestMazePath(MAZE_START, MAZE_HURT), `preset ${i}: start→hurt`)
  assert.ok(shortestMazePath(MAZE_HURT, MAZE_INN), `preset ${i}: hurt→inn`)
  assert.equal(isMazeRoad(MAZE_START), true, `preset ${i}: start is road`)
}
setMazePreset(0)
assert.equal(shortestMazePath(MAZE_START, { r: 0, c: 2 }), null)

assert.equal(mazeSame(MAZE_HURT, MAZE_INN), false, 'hurt and inn are distinct cells')
assert.equal(mazeSame(mazeGoal(true, false).at, mazeGoal(true, true).at), false, 'help locus ≠ inn')

setMazePreset(0)
assert.ok(swipeStep(MAZE_START, 1, 0), 'preset A: first move may go down')
assert.ok(swipeStep(MAZE_START, 0, 1), 'preset A: first move may go right')
assert.equal(isAdjacentRoadStep(MAZE_START, MAZE_HURT), false)
assert.equal(isAdjacentRoadStep(MAZE_START, MAZE_INN), false)
const stepA = mazeStepToward(MAZE_START, MAZE_HURT)
assert.ok(stepA && isAdjacentRoadStep(MAZE_START, stepA))

setMazePreset(1)
assert.ok(swipeStep(MAZE_START, 1, 0), 'preset B: first move down')
assert.equal(swipeStep(MAZE_START, 0, 1), null, 'preset B: not right-only')

setMazePreset(2)
assert.ok(swipeStep(MAZE_START, 1, 0), 'preset C: first move down')
assert.equal(swipeStep(MAZE_START, 0, 1), null, 'preset C: not right-only')

setMazePreset(0)

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
assert.doesNotMatch(
  playSrc,
  /shortestMazePath\(/,
  'play must not auto-path / teleport on tap',
)
assert.match(playSrc, /mazeStepToward/)
assert.match(playSrc, /maze-board/)
assert.match(playSrc, /onBoardKey/)
assert.doesNotMatch(
  playSrc,
  /EASY\.mazeHunt/,
  'Easy Clear 1.4.143: omit mazeHunt .sort-how — beats + caption + score teach the road',
)
assert.match(playSrc, /EASY\.holdNext/)
assert.match(playSrc, /ROAD_MAZE_AGAIN/)
assert.ok(playSrc.lastIndexOf('EASY.holdNext') < playSrc.lastIndexOf('ROAD_MAZE_AGAIN'))
assert.match(playSrc, /function replay/)
assert.match(playSrc, /mazeCaption/)
assert.match(playSrc, /story-caption/)
assert.match(playSrc, /maze-beats/)
assert.match(playSrc, /maze-cell-label/)
assert.match(playSrc, /mazeStepToward/)
assert.match(playSrc, /setMazePreset/)
assert.match(playSrc, /maze-you-token/)
assert.doesNotMatch(playSrc, /walkPath\(\s*shortestMazePath/)
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
  readAppCss(),
  /maze-cell\.is-rock \{[\s\S]*touch-action: pan-y/,
)
const mazeCss = readAppCss()
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
const registrySrc = readFileSync(new URL('../src/easyTrail/match/registry.tsx', import.meta.url), 'utf8')
assert.match(puzzleSrc, /renderStoryPlay/)
assert.match(registrySrc, /'road-maze': \(story, wire\) => \(\s*<RoadMazePlay/)
assert.match(registrySrc, /'father-run': \(story, wire\) =>/)
assert.match(registrySrc, /'panel-blast': \(story, wire\) =>/)
assert.match(registrySrc, /'claim-merge': \(story, wire\) =>/)
assert.doesNotMatch(`${puzzleSrc}\n${registrySrc}`, /timing-dash|road-swipe|story-night/)

const hubSrc = readFileSync(new URL('../src/components/Hub.tsx', import.meta.url), 'utf8')
assert.match(hubSrc, /EASY\.mazeHome/)
assert.match(hubSrc, /EASY\.mazeMatch/)
assert.match(hubSrc, /EASY\.mazeMatch/)
assert.match(hubSrc, /EASY\.matchCta/)

// Easy Clear 1.4.155: Home whisper short next-step (not full mazeHunt) — Fixes #192
const easyUiMaze = readFileSync(new URL('../src/lib/easyUi.ts', import.meta.url), 'utf8')
assert.match(easyUiMaze, /mazeHome: 'One more road\.'/)
assert.doesNotMatch(easyUiMaze, /mazeHome: 'Find the hurt man/)
assert.match(hubSrc, /1\.4\.155.*whisper|#192/)

// Easy Clear 1.4.153: default board-first chrome compress (not only .is-help-phase) — Fixes #190
assert.match(
  mazeCss,
  /1\.4\.153 default board-first|peel help-phase chrome compress/,
)
assert.match(
  mazeCss,
  /play\.is-road-maze \.run-thumb \{[\s\S]*max-height: 26px/,
)
assert.match(
  mazeCss,
  /@media \(max-height: 720px\) \{[\s\S]*play\.is-road-maze/,
)
assert.match(
  mazeCss,
  /max-height: min\(62dvh, 540px\)/,
)
assert.match(playSrc, /1\.4\.153.*board-first|#190/)

// Easy Clear 1.4.296: Samaritan less-is-more + smash + route variety (Fixes #414 #412 #413)
assert.match(mazeCss, /1\.4\.296: Samaritan less-is-more \+ smash fix/)
assert.match(mazeCss, /#d8b888/)
assert.match(mazeCss, /aspect-ratio: 1 \/ 1/)
assert.match(
  mazeCss,
  /\.play\.is-road-maze \.maze-actor img,[\s\S]*?object-fit: contain/,
)
assert.match(mazeCss, /maze-you-token/)


// Easy Clear 1.4.175: Story Creek maze ≤720 HUD peel — hide kicker/thumbs/caption; keep beats (invent Fun/Clear)
assert.match(mazeCss, /1\.4\.175: Story Creek maze ≤720 HUD peel/)
assert.match(
  mazeCss,
  /@media \(max-height: 720px\) \{[\s\S]*?play\.is-road-maze \.story-kicker,[\s\S]*?play\.is-road-maze \.run-thumbs,[\s\S]*?play\.is-road-maze \.story-caption \{[\s\S]*?display: none/,
)
assert.match(
  mazeCss,
  /@media \(max-height: 720px\) \{[\s\S]*?play\.is-road-maze \.match-score \{/,
)
assert.match(playSrc, /1\.4\.175: ≤720 peels HUD/)


// Easy Clear 1.4.191: Story Creek ≤720 fill purple void — stretch maze-board (invent Fun/Clear)
{
  assert.match(mazeCss, /1\.4\.191: Easy Story Creek ≤720 fill purple void/)
  assert.match(
    mazeCss,
    /@media \(max-height: 720px\) \{[\s\S]*?play\.is-road-maze \.maze-board \{[\s\S]*?max-height: none/,
  )
  assert.match(
    mazeCss,
    /@media \(max-height: 720px\) \{[\s\S]*?play\.is-road-maze \.maze-board \{[\s\S]*?aspect-ratio: auto/,
  )
  assert.match(playSrc, /1\.4\.191: ≤720 fills purple void/)
}

console.log('check-road-maze: ok')
