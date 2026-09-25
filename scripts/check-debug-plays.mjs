import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import {
  DEBUG_LAYER_LINES,
  debugJumpView,
  debugMiniGames,
  debugPlayGroups,
  debugPlayLabel,
} from '../src/lib/debugPlays.ts'
import { storyPlayFor } from '../src/lib/storyPlay.ts'
import { readAppCss } from './readAppCss.mjs'

const games = debugMiniGames()
const groups = debugPlayGroups()
const plays = new Set(games.map((item) => item.play))

assert.equal(DEBUG_LAYER_LINES['road-maze'], 'ph-road')
assert.equal(DEBUG_LAYER_LINES['father-run'], 'ph-father')
assert.equal(DEBUG_LAYER_LINES['story-snap'], 'daily-lantern')
assert.equal(DEBUG_LAYER_LINES['panel-blast'], 'ph-debt')
assert.equal(DEBUG_LAYER_LINES['claim-merge'], 'wb-creed')
assert.equal(DEBUG_LAYER_LINES['source-dig'], 'wb-women')
assert.equal(DEBUG_LAYER_LINES['names-dig'], 'daily-names')
assert.equal(DEBUG_LAYER_LINES['stone-dig'], 'sc-tacitus')
assert.equal(DEBUG_LAYER_LINES['ink-dig'], 'ic-trajan')
assert.equal(DEBUG_LAYER_LINES['why-blast'], 'ph-road')

assert.equal(storyPlayFor('ph-road'), 'road-maze')
assert.equal(storyPlayFor('ph-father'), 'father-run')
assert.equal(storyPlayFor('daily-lantern'), 'story-snap')
assert.equal(storyPlayFor('ph-debt'), 'panel-blast')
assert.equal(storyPlayFor('wb-creed'), 'claim-merge')
assert.equal(storyPlayFor('wb-women'), 'source-dig')
assert.equal(storyPlayFor('daily-names'), 'source-dig')
assert.equal(storyPlayFor('sc-tacitus'), 'source-dig')
assert.equal(storyPlayFor('ic-trajan'), 'source-dig')

assert.ok(plays.has('road-maze'), 'debug lists road-maze')
assert.ok(plays.has('father-run'), 'debug lists father-run')
assert.ok(plays.has('story-snap'), 'debug lists story-snap')
assert.ok(plays.has('panel-blast'), 'debug lists gem Match / panel-blast')
assert.ok(plays.has('claim-merge'), 'debug lists claim-merge')
assert.ok(plays.has('source-dig'), 'debug lists source-dig')
assert.ok(plays.has('why-blast'), 'debug lists Lock In Why Blast')

const maze = games.find((item) => item.lineId === 'ph-road' && item.play === 'road-maze')
const run = games.find((item) => item.lineId === 'ph-father')
const snap = games.find((item) => item.lineId === 'daily-lantern' && item.play === 'story-snap')
const match = games.find((item) => item.lineId === 'ph-debt')
const merge = games.find((item) => item.lineId === 'wb-creed')
const dig = games.find((item) => item.lineId === 'wb-women')
const names = games.find((item) => item.lineId === 'daily-names')
const ink = games.find((item) => item.lineId === 'ic-trajan')
const hold = games.find((item) => item.play === 'why-blast')

assert.ok(maze)
assert.ok(run)
assert.ok(snap)
assert.ok(match)
assert.ok(merge)
assert.ok(dig)
assert.ok(names)
assert.ok(ink)
assert.ok(hold)

assert.match(debugPlayLabel(maze), /^ph-road · /)
assert.match(debugPlayLabel(run), /^ph-father · /)
assert.match(debugPlayLabel(snap), /^daily-lantern · /)
assert.match(debugPlayLabel(match), /^ph-debt · /)
assert.match(debugPlayLabel(merge), /^wb-creed · /)
assert.match(debugPlayLabel(dig), /^wb-women · /)
assert.match(debugPlayLabel(names), /^daily-names · /)
assert.match(debugPlayLabel(hold), /^ph-road · Lock In Why Blast/)

assert.deepEqual(debugJumpView(maze), { name: 'link', debugLine: 'ph-road' })
assert.deepEqual(debugJumpView(run), { name: 'link', debugLine: 'ph-father' })
assert.deepEqual(debugJumpView(snap), { name: 'link', debugLine: 'daily-lantern' })
assert.deepEqual(debugJumpView(match), { name: 'link', debugLine: 'ph-debt' })
assert.deepEqual(debugJumpView(merge), { name: 'link', debugLine: 'wb-creed' })
assert.deepEqual(debugJumpView(dig), { name: 'link', debugLine: 'wb-women' })
assert.deepEqual(debugJumpView(hold), {
  name: 'journal',
  focusId: 'ph-road',
  autoQuiz: true,
})

assert.deepEqual(
  groups.map((group) => group.play),
  ['road-maze', 'father-run', 'story-snap', 'panel-blast', 'claim-merge', 'source-dig', 'why-blast'],
)
assert.ok(games.filter((item) => item.play === 'source-dig').length >= 2)

const settingsSrc = readFileSync(
  new URL('../src/components/Settings.tsx', import.meta.url),
  'utf8',
)
assert.match(settingsSrc, /settings-debug/)
assert.match(settingsSrc, /Developer · mini-game jumps/)
assert.match(settingsSrc, /debugPlayGroups/)
assert.match(settingsSrc, /debugJumpView/)
assert.match(settingsSrc, /setEasyMode\(true\)/)
assert.ok(
  settingsSrc.indexOf('Danger zone') < settingsSrc.indexOf('Developer · mini-game jumps'),
  'Debug sits after Reset, same burial',
)
assert.match(settingsSrc, /settings-card settings-danger settings-debug/)

const hubSrc = readFileSync(new URL('../src/components/Hub.tsx', import.meta.url), 'utf8')
const easyHome = hubSrc.match(/className="hub is-easy-home"[\s\S]*?<\/main>/)?.[0] ?? ''
assert.doesNotMatch(easyHome, /debugLine/)
assert.doesNotMatch(easyHome, /Developer/)
assert.doesNotMatch(easyHome, /mini-game jumps/)
assert.doesNotMatch(easyHome, /debugPlayGroups/)

const typesSrc = readFileSync(new URL('../src/types.ts', import.meta.url), 'utf8')
assert.match(typesSrc, /name: 'link'; debugLine\?: string/)

const appSrc = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8')
assert.match(appSrc, /debugLine=\{view\.debugLine\}/)

const linkSrc = readFileSync(
  new URL('../src/components/LinkScreen.tsx', import.meta.url),
  'utf8',
)
assert.match(linkSrc, /debugLine/)
assert.match(linkSrc, /lineId=\{easy \? lineId : undefined\}/)
assert.match(linkSrc, /debugToSettings=\{Boolean\(debugLine\)\}/)
assert.match(linkSrc, /name: 'settings'/)

const puzzleSrc = readFileSync(
  new URL('../src/components/PuzzlePlay.tsx', import.meta.url),
  'utf8',
)
assert.match(puzzleSrc, /lineId \?\? easyMatchLine\(progress\)/)
assert.match(puzzleSrc, /isEasy\(progress\) \|\| lineId/)

const cssSrc = readAppCss()
assert.match(cssSrc, /\.settings-debug /)

console.log('check-debug-plays: ok')
