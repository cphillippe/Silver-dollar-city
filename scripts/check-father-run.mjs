import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { packLesson } from '../src/content/packCatalog.ts'
import { EASY } from '../src/lib/easy.ts'
import {
  applyDash,
  beatsOpened,
  dashPhase,
  DASH_BOOST,
  DASH_PERIOD_MS,
  DASH_WINDOW_MS,
  fatherReached,
  fatherStartProgress,
  FATHER_RUN_AGAIN,
  FATHER_RUN_CLAIM,
  FATHER_RUN_DASH_SCORE,
  FATHER_RUN_HINT,
  FATHER_RUN_HUG_SCORE,
  FATHER_RUN_LINE,
  FATHER_RUN_WIN,
  HIRED_HAND_SPEECH,
  HOLD_CAP,
  holdStep,
  hugBeforeSpeech,
  MIN_DASHES_TO_HUG,
  MIN_START_GAP,
  RETRY_CLOSER,
  runOutcome,
  SPEECH_PHRASE_MS,
  speechDurationMs,
  speechFinished,
  speechIndexAt,
  speechPhraseAt,
  STALL_AFTER_MS,
  stumbleIfHeldThrough,
} from '../src/lib/fatherRun.ts'
import { lessonStory, storyPlayFor } from '../src/lib/storyPlay.ts'
import { gemWordsFor } from '../src/lib/gemSearch.ts'
import { storyFromPanels, storyPanelsFor } from '../src/lib/storyPanels.ts'

assert.equal(FATHER_RUN_LINE, 'ph-father')
assert.equal(FATHER_RUN_CLAIM, 'The father runs with mercy before the speech is done.')
assert.equal(FATHER_RUN_HINT, 'The run comes before the apology is done.')
assert.equal(FATHER_RUN_WIN, 'Hugged!')
assert.equal(FATHER_RUN_AGAIN, 'One more run')
assert.equal(EASY.runAgain, FATHER_RUN_AGAIN)
assert.equal(FATHER_RUN_DASH_SCORE, 25)
assert.equal(FATHER_RUN_HUG_SCORE, 100)
assert.equal(storyPlayFor('ph-father'), 'father-run')
assert.equal(storyPlayFor('ph-road'), 'road-maze')
assert.equal(storyPlayFor('ph-debt'), 'panel-blast')
assert.equal(lessonStory('ph-father').play, 'father-run')
assert.equal(lessonStory('ph-road').play, 'road-maze')

const harvest = packLesson('ph-father')?.easy.learn ?? ''
assert.match(harvest, /hired-hand speech/)
assert.match(harvest, /still a long way off/)
assert.equal(storyFromPanels(storyPanelsFor('ph-father', gemWordsFor('ph-father').length)), harvest)
assert.equal(packLesson('ph-father')?.claim, FATHER_RUN_CLAIM)
assert.equal(packLesson('ph-father')?.easy.match.sentence, FATHER_RUN_CLAIM)
assert.equal(packLesson('ph-father')?.medium.match.sentence, FATHER_RUN_CLAIM)
assert.equal(packLesson('ph-father')?.hard.match.sentence, FATHER_RUN_CLAIM)

assert.equal(HIRED_HAND_SPEECH.length, 4)
assert.match(HIRED_HAND_SPEECH[HIRED_HAND_SPEECH.length - 1], /hired/)
assert.equal(speechDurationMs(), HIRED_HAND_SPEECH.length * SPEECH_PHRASE_MS)
assert.equal(speechIndexAt(0), 0)
assert.equal(speechPhraseAt(0), HIRED_HAND_SPEECH[0])
assert.equal(speechIndexAt(SPEECH_PHRASE_MS), 1)
assert.equal(speechFinished(speechDurationMs() - 1), false)
assert.equal(speechFinished(speechDurationMs()), true)

assert.equal(fatherStartProgress(0), 0)
assert.equal(fatherStartProgress(1), RETRY_CLOSER)
assert.ok(fatherStartProgress(1) < fatherStartProgress(2))
assert.ok(fatherStartProgress(8) <= 1 - MIN_START_GAP)
assert.equal(fatherReached(1), true)
assert.equal(fatherReached(0.99), false)

assert.equal(holdStep(0, 1, false), 0)
assert.ok(holdStep(0, 1, true) > 0)
assert.ok(holdStep(0, 20, true) <= HOLD_CAP + 1e-9, 'sit-forever cannot crawl past the cap')
assert.equal(applyDash(0.5), 0.5 + DASH_BOOST)
assert.equal(applyDash(0.95), 1)
assert.equal(MIN_DASHES_TO_HUG, 2)

const holdForever = holdStep(0, speechDurationMs() / 1000, true, false, speechDurationMs())
assert.ok(holdForever < 1, 'hold-only first try should miss — dash is the juice')
assert.ok(holdForever <= HOLD_CAP + 1e-9)
const holdRetry = holdStep(fatherStartProgress(8), speechDurationMs() / 1000, true, false, speechDurationMs())
assert.ok(holdRetry < 1, 'retries still cannot sit-to-hug')
assert.equal(hugBeforeSpeech(1, speechDurationMs() - 1, 0), false, 'a hug still needs timed presses')
assert.equal(hugBeforeSpeech(1, speechDurationMs() - 1, MIN_DASHES_TO_HUG), true)
const skilled = applyDash(applyDash(HOLD_CAP))
assert.ok(skilled >= 1)
assert.ok(hugBeforeSpeech(Math.min(1, skilled), speechDurationMs() - 1, MIN_DASHES_TO_HUG))
assert.equal(
  stumbleIfHeldThrough(0.5, true, false, true, false) < 0.5,
  true,
  'holding through a glow without a fresh press stumbles',
)
assert.equal(stumbleIfHeldThrough(0.5, true, false, true, true), 0.5)
assert.ok(STALL_AFTER_MS > 0)

assert.equal(hugBeforeSpeech(1, speechDurationMs()), false)
assert.equal(hugBeforeSpeech(0.8, speechDurationMs() - 1, 2), false)
assert.equal(runOutcome(1, speechDurationMs() - 40, MIN_DASHES_TO_HUG), 'hug')
assert.equal(runOutcome(1, speechDurationMs() - 40, 0), 'run')
assert.equal(runOutcome(0.7, speechDurationMs(), 2), 'miss')
assert.equal(runOutcome(0.4, 800, 0), 'run')

const earlyDash = dashPhase(100)
assert.equal(earlyDash.inWindow, false)
assert.ok(earlyDash.travel >= 0 && earlyDash.travel < 1)
const hotDash = dashPhase(DASH_PERIOD_MS - DASH_WINDOW_MS + 10)
assert.equal(hotDash.inWindow, true)

assert.equal(beatsOpened(0, 4), 1)
assert.equal(beatsOpened(0.4, 4), 2)
assert.equal(beatsOpened(1, 4), 4)

assert.equal(hugBeforeSpeech(1, speechDurationMs() - 1, MIN_DASHES_TO_HUG), true)
assert.equal(hugBeforeSpeech(1, speechDurationMs(), MIN_DASHES_TO_HUG), false)
assert.equal(hugBeforeSpeech(0.8, speechDurationMs() - 1, MIN_DASHES_TO_HUG), false)
assert.equal(runOutcome(1, speechDurationMs() - 40, MIN_DASHES_TO_HUG), 'hug')
assert.equal(runOutcome(0.7, speechDurationMs()), 'miss')
assert.equal(runOutcome(0.4, 800), 'run')

const holdOnly = holdStep(0, speechDurationMs() / 1000, true)
assert.ok(holdOnly < 1, 'hold-only first try should miss — dash is the juice')
assert.ok(hugBeforeSpeech(applyDash(applyDash(holdOnly)), speechDurationMs() - 1, MIN_DASHES_TO_HUG) || applyDash(applyDash(HOLD_CAP)) >= 1)
assert.ok(
  holdStep(fatherStartProgress(2), speechDurationMs() / 1000, true, false, speechDurationMs()) < 1,
  'retry hold-forever still stalls',
)

const playSrc = readFileSync(
  new URL('../src/components/challenges/FatherRunPlay.tsx', import.meta.url),
  'utf8',
)
assert.match(playSrc, /is-father-run/)
assert.match(playSrc, /Hold to run/)
assert.match(playSrc, /Let go — press now/)
assert.match(playSrc, /stumbleIfHeldThrough/)
assert.match(playSrc, /MIN_DASHES_TO_HUG/)
assert.match(playSrc, /onPadKeyDown/)
assert.match(playSrc, /panel-blast|FATHER_RUN_FACE/)
assert.match(playSrc, /04-father-runs|FATHER_RUN_FACE/)
assert.match(playSrc, /Run again/)
assert.match(playSrc, /FATHER_RUN_HINT/)
assert.match(playSrc, /FATHER_RUN_CLAIM/)
assert.match(playSrc, /EASY\.holdNext/)
assert.match(playSrc, /FATHER_RUN_AGAIN/)
assert.ok(playSrc.lastIndexOf('EASY.holdNext') < playSrc.lastIndexOf('FATHER_RUN_AGAIN'))
assert.match(playSrc, /function replay/)
assert.match(playSrc, /resetRound\(0\)/)
assert.match(playSrc, /data-run-again/)
assert.match(playSrc, /run-shard/)
assert.match(playSrc, /Combo/)
assert.match(playSrc, /run-hug-art/)
assert.match(playSrc, /FATHER_RUN_WIN/)
assert.match(playSrc, /cta-dock/)
assert.match(playSrc, /onClear/)
assert.doesNotMatch(playSrc, /road-swipe|story-night/)

const puzzleSrc = readFileSync(new URL('../src/components/PuzzlePlay.tsx', import.meta.url), 'utf8')
assert.match(puzzleSrc, /FatherRunPlay/)
assert.match(puzzleSrc, /case 'father-run'/)
assert.match(puzzleSrc, /case 'panel-blast'/)
assert.match(puzzleSrc, /case 'claim-merge'/)
assert.doesNotMatch(puzzleSrc, /timing-dash|road-swipe|story-night/)

const xml = readFileSync(new URL('../src/content/packs/parable-hollow.xml', import.meta.url), 'utf8')
assert.match(
  xml,
  /<shortStory>Jesus tells about a son who takes his share early and wastes it far from home\. Hungry and ashamed, he starts a hired-hand speech to ask for work\. But his father sees him while he is still a long way off and runs — mercy before the speech is done\. He hugs the son\. Honor is spent so the lost one can be welcomed; the feast is the father’s idea\.<\/shortStory>/,
)

console.log('check-father-run: ok')
