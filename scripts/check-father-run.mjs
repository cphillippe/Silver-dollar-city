import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { packLesson } from '../src/content/packCatalog.ts'
import {
  applyDash,
  beatsOpened,
  dashPhase,
  DASH_BOOST,
  DASH_PERIOD_MS,
  DASH_WINDOW_MS,
  fatherReached,
  fatherStartProgress,
  FATHER_RUN_CLAIM,
  FATHER_RUN_HINT,
  FATHER_RUN_LINE,
  FATHER_RUN_WIN,
  HIRED_HAND_SPEECH,
  holdStep,
  hugBeforeSpeech,
  MIN_START_GAP,
  RETRY_CLOSER,
  runOutcome,
  SPEECH_PHRASE_MS,
  speechDurationMs,
  speechFinished,
  speechIndexAt,
  speechPhraseAt,
} from '../src/lib/fatherRun.ts'
import { lessonStory, storyPlayFor } from '../src/lib/storyPlay.ts'
import { gemWordsFor } from '../src/lib/gemSearch.ts'
import { storyFromPanels, storyPanelsFor } from '../src/lib/storyPanels.ts'

assert.equal(FATHER_RUN_LINE, 'ph-father')
assert.equal(FATHER_RUN_CLAIM, 'The father runs with mercy before the speech is done.')
assert.equal(FATHER_RUN_HINT, 'The run comes before the apology is done.')
assert.equal(FATHER_RUN_WIN, 'Hugged!')
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
assert.equal(holdStep(0.95, 10, true), 1)
assert.equal(applyDash(0.5), 0.5 + DASH_BOOST)
assert.equal(applyDash(0.95), 1)

const earlyDash = dashPhase(100)
assert.equal(earlyDash.inWindow, false)
assert.ok(earlyDash.travel >= 0 && earlyDash.travel < 1)
const hotDash = dashPhase(DASH_PERIOD_MS - DASH_WINDOW_MS + 10)
assert.equal(hotDash.inWindow, true)

assert.equal(beatsOpened(0, 4), 1)
assert.equal(beatsOpened(0.4, 4), 2)
assert.equal(beatsOpened(1, 4), 4)

assert.equal(hugBeforeSpeech(1, speechDurationMs() - 1), true)
assert.equal(hugBeforeSpeech(1, speechDurationMs()), false)
assert.equal(hugBeforeSpeech(0.8, speechDurationMs() - 1), false)
assert.equal(runOutcome(1, speechDurationMs() - 40), 'hug')
assert.equal(runOutcome(0.7, speechDurationMs()), 'miss')
assert.equal(runOutcome(0.4, 800), 'run')

const holdOnly = holdStep(0, speechDurationMs() / 1000, true)
assert.ok(holdOnly < 1, 'hold-only first try should miss — dash is the juice')
assert.ok(hugBeforeSpeech(applyDash(applyDash(holdOnly)), speechDurationMs() - 1))
assert.ok(hugBeforeSpeech(holdStep(fatherStartProgress(2), speechDurationMs() / 1000, true), speechDurationMs() - 1))

const playSrc = readFileSync(
  new URL('../src/components/challenges/FatherRunPlay.tsx', import.meta.url),
  'utf8',
)
assert.match(playSrc, /is-father-run/)
assert.match(playSrc, /Hold to run/)
assert.match(playSrc, /onPadKeyDown/)
assert.match(playSrc, /panel-father-run/)
assert.match(playSrc, /Run again/)
assert.match(playSrc, /FATHER_RUN_HINT/)
assert.match(playSrc, /FATHER_RUN_CLAIM/)
assert.match(playSrc, /EASY\.holdNext/)
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
