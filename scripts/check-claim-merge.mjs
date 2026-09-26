import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { packLesson } from '../src/content/packCatalog.ts'
import {
  applyMergeMiss,
  aimMerge,
  ballAt,
  BOWL_HEIGHT,
  BOWL_WIDTH,
  canDrop,
  CLAIM_MERGE_CLAIM,
  CLAIM_MERGE_HINT,
  CLAIM_MERGE_LINE,
  CLAIM_MERGE_WIN,
  createMergeGame,
  dropNext,
  DROP_BAG,
  grabBall,
  dragGrab,
  highestMergeRank,
  MERGE_GAP,
  MERGE_MISS_FACE,
  MERGE_MISS_PENALTY,
  MERGE_SKINS,
  MISS_PUSH,
  mergeBeatsOpened,
  mergePoints,
  mergeSkin,
  openingBalls,
  pickDropRank,
  releaseGrab,
  resetMergeRound,
  spawnMergeBall,
  stepMerge,
  WIN_RANK,
} from '../src/lib/claimMerge.ts'
import { lessonStory, storyPlayFor } from '../src/lib/storyPlay.ts'
import { mergeWinBeat } from '../src/lib/successBeat.ts'
import { EASY } from '../src/lib/easy.ts'
import { readAppCss } from './readAppCss.mjs'

assert.equal(CLAIM_MERGE_LINE, 'wb-creed')
assert.equal(CLAIM_MERGE_CLAIM, 'Paul hands on an early public creed: died, buried, raised, appeared.')
assert.equal(CLAIM_MERGE_WIN, 'MERGED!')
assert.equal(CLAIM_MERGE_HINT, 'Drop candy. Smash two of a kind.')
assert.match(EASY.mergeHunt, /Drop candy/)
assert.match(EASY.mergeHome, /Make the creed/)
assert.equal(storyPlayFor('wb-creed'), 'claim-merge')
assert.equal(storyPlayFor('ph-road'), 'road-maze')
assert.equal(storyPlayFor('ph-father'), 'father-run')
assert.equal(storyPlayFor('ph-debt'), 'panel-blast')
assert.equal(lessonStory('wb-creed').play, 'claim-merge')
assert.equal(lessonStory('ph-road').play, 'road-maze')

const harvest = packLesson('wb-creed')
assert.equal(harvest?.claim, CLAIM_MERGE_CLAIM)
assert.equal(harvest?.easy.match.sentence, CLAIM_MERGE_CLAIM)
assert.equal(harvest?.source, '1 Corinthians 15:3–8')

assert.equal(MERGE_SKINS.length, WIN_RANK + 1)
assert.equal(mergeSkin(0).label, 'Pip')
assert.equal(mergeSkin(1).label, 'Died')
assert.equal(mergeSkin(2).label, 'Buried')
assert.equal(mergeSkin(3).label, 'Raised')
assert.equal(mergeSkin(4).label, 'Creed')
assert.ok(DROP_BAG.every((rank) => rank <= 2))
assert.ok(
  DROP_BAG.filter((rank) => rank === 1).length >= DROP_BAG.filter((rank) => rank === 0).length,
  'next-drop bag leans Died so Creed climbs are not a pip slog',
)
assert.ok(MISS_PUSH >= 400, 'wrong-smash bounce is a fair pop, not a nudge')
assert.ok(MERGE_GAP >= 1, 'merge on contact, not after a deep overlap')
assert.equal(mergePoints(2, 1), mergeSkin(2).points)
assert.equal(mergePoints(2, 3), mergeSkin(2).points * 3)
assert.equal(applyMergeMiss(40), 15)
assert.equal(applyMergeMiss(10), 0)
assert.equal(MERGE_MISS_FACE, `Miss −${MERGE_MISS_PENALTY}`)

const first = pickDropRank(1)
assert.ok(first.rank >= 0 && first.rank <= 2)
const second = pickDropRank(first.nextSeed)
assert.ok(second.rank >= 0 && second.rank <= 2)

const open = openingBalls(0)
assert.equal(open.length, 3)
assert.equal(open.filter((ball) => ball.rank === 1).length, 2)
assert.ok(open.every((ball) => ball.x > 0 && ball.x < BOWL_WIDTH))
assert.ok(open.every((ball) => ball.y < BOWL_HEIGHT))
const diedPair = open.filter((ball) => ball.rank === 1)
const diedGap = Math.abs((diedPair[0]?.x ?? 0) - (diedPair[1]?.x ?? 0))
assert.ok(diedGap <= 90, 'opening Died pair is close enough to smash on a phone')
assert.ok(diedGap >= mergeSkin(1).radius * 2, 'opening Died pair does not auto-merge')

let game = createMergeGame(3, 0)
assert.equal(canDrop(game), true)
assert.equal(game.score, 0)
assert.equal(game.won, false)
const aimed = aimMerge(game, 40)
assert.ok(aimed.aimX >= mergeSkin(game.nextRank).radius)
const dropped = dropNext(aimed, 0)
assert.equal(dropped.balls.length, game.balls.length + 1)
assert.equal(dropped.droppingId, dropped.nextId - 1)
assert.equal(canDrop(dropped), false)

const hit = ballAt(game, open[0].x, open[0].y)
assert.equal(hit?.id, open[0].id)

const other = game.balls.find((ball) => ball.rank === 1 && ball.id !== hit?.id)
assert.ok(other)
let smash = grabBall(game, hit.id)
smash = dragGrab(smash, other.x, other.y)
smash = releaseGrab(smash, 400)
assert.equal(smash.events[0]?.kind, 'merge')
assert.ok(smash.balls.some((ball) => ball.rank === 2))
assert.ok(smash.score > 0)
assert.equal(smash.combo, 1)

let climb = createMergeGame(1, 0)
climb = { ...climb, balls: [] }
climb = spawnMergeBall(climb, 3, 160, 400, 0)
climb = spawnMergeBall(climb, 3, 170, 400, 0)
const locked = releaseGrab(
  dragGrab(grabBall(climb, climb.balls[0].id), climb.balls[1].x, climb.balls[1].y),
  500,
)
assert.equal(locked.won, true)
assert.ok(locked.balls.some((ball) => ball.rank === WIN_RANK))
assert.ok(locked.events.some((event) => event.kind === 'win'))

let miss = createMergeGame(1, 0)
const pip = miss.balls.find((ball) => ball.rank === 0)
const died = miss.balls.find((ball) => ball.rank === 1)
assert.ok(pip && died)
miss = releaseGrab(dragGrab(grabBall(miss, pip.id), died.x, died.y), 200)
assert.equal(miss.events[0]?.kind, 'miss')
assert.equal(miss.score, 0)
assert.equal(miss.won, false)
assert.equal(miss.balls.length, 3)
const bounced = miss.balls.find((ball) => ball.id === pip.id)
assert.ok(bounced)
assert.ok(
  Math.hypot(bounced.vx, bounced.vy) >= 400,
  'wrong smash bounces off instead of sticking',
)

let gravity = createMergeGame(8, 0)
gravity = { ...gravity, balls: [] }
gravity = spawnMergeBall(gravity, 1, 180, 80, 0)
for (let i = 0; i < 90; i += 1) {
  gravity = stepMerge(gravity, 1 / 60, i * 16)
}
const fallen = gravity.balls[0]
assert.ok(fallen)
assert.ok(fallen.y > 200, 'gravity pulls candy down')

assert.equal(mergeBeatsOpened(0, false), 1)
assert.equal(mergeBeatsOpened(2, false), 2)
assert.equal(mergeBeatsOpened(3, false), 3)
assert.equal(mergeBeatsOpened(4, true), 4)
assert.equal(highestMergeRank([{ ...open[0], rank: 3 }]), 3)

const again = resetMergeRound(4, 0, 80)
assert.equal(again.score, 80)
assert.equal(again.won, false)
assert.equal(again.balls.length, 3)

assert.match(mergeWinBeat().title, /MERGED/)
assert.match(mergeWinBeat().why, /Christ was buried and seen/)
assert.match(mergeWinBeat().from ?? '', /1 Cor/)

const playSrc = readFileSync(
  new URL('../src/components/challenges/ClaimMergePlay.tsx', import.meta.url),
  'utf8',
)
assert.match(playSrc, /MatchTakeaway/)
assert.match(playSrc, /is-claim-merge/)
assert.match(playSrc, /merge-bowl/)
assert.match(playSrc, /COMBO/)
assert.match(playSrc, /merge-drop-guide/)
assert.match(playSrc, /merge-drop-chip/)
assert.match(playSrc, /merge-ghost is-loud/)
assert.match(playSrc, /Smash the Died pair/)
assert.doesNotMatch(
  playSrc,
  /EASY\.mergeHunt/,
  'Easy Clear 1.4.147: omit mergeHunt .sort-how — Drop · smash · ladder teach the bowl',
)
assert.match(playSrc, /WinBurst play=\{view\.won\}/)
const mergeCss = readAppCss()
assert.match(mergeCss, /merge-drop-chip/)
assert.match(
  mergeCss,
  /\.play\.is-claim-merge \.win-stamp-wrap[\s\S]{0,280}transform:\s*translateX\(-50%\)/,
  'MERGED! stamp stays centered in the bowl, not shifted off the left rim',
)
assert.match(playSrc, /One more bowl/)
assert.match(playSrc, /btn primary xl snap-bins/)
assert.ok(
  playSrc.indexOf("EASY.holdNext") < playSrc.indexOf('One more bowl'),
  'Hold next is the first tap after the takeaway',
)
assert.match(playSrc, /Merge again/)
assert.ok(
  playSrc.indexOf('Merge again') > playSrc.indexOf('view.overflow'),
  'Bowl full still offers Merge again',
)
assert.match(playSrc, /onBowlKey/)
assert.match(playSrc, /CLAIM_MERGE_WIN/)
assert.match(playSrc, /EASY\.holdNext/)
assert.match(playSrc, /cta-dock/)
assert.match(playSrc, /onClear/)
assert.match(playSrc, /MERGE_MISS_FACE/)
assert.doesNotMatch(playSrc, /tapWhy|Tap why|claimChoices|reasonChoices|whyCorrect/)
assert.doesNotMatch(playSrc, /Unlock the|multiple choice|Tap the line you kept/)
assert.doesNotMatch(playSrc, /road-swipe|story-night/)

const puzzleSrc = readFileSync(new URL('../src/components/PuzzlePlay.tsx', import.meta.url), 'utf8')
assert.match(puzzleSrc, /ClaimMergePlay/)
assert.match(puzzleSrc, /case 'claim-merge'/)
assert.match(puzzleSrc, /case 'father-run'/)
assert.match(puzzleSrc, /case 'road-maze'/)
assert.match(puzzleSrc, /case 'panel-blast'/)
assert.doesNotMatch(puzzleSrc, /timing-dash|road-swipe|story-night/)

const hubSrc = readFileSync(new URL('../src/components/Hub.tsx', import.meta.url), 'utf8')
assert.match(hubSrc, /EASY\.mergeHome/)
assert.match(hubSrc, /EASY\.mergeMatch/)

const teachSrc = readFileSync(new URL('../src/components/TeachUnlock.tsx', import.meta.url), 'utf8')
assert.match(teachSrc, /EASY\.mergeCta/)

console.log('check-claim-merge: ok')
