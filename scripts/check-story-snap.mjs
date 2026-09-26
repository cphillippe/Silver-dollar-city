import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { EASY } from '../src/lib/easy.ts'
import {
  GATE_AT,
  SNAPS_TO_OPEN,
  STORY_SNAP_AGAIN,
  STORY_SNAP_BEATS,
  STORY_SNAP_CLAIM,
  STORY_SNAP_LINE,
  STORY_SNAP_WIN,
  allBeatsLocked,
  beatProgress,
  inSnapWindow,
  nextBeatIndex,
} from '../src/lib/storySnap.ts'
import { lessonStory, storyPlayFor } from '../src/lib/storyPlay.ts'

assert.equal(STORY_SNAP_LINE, 'daily-lantern')
assert.equal(STORY_SNAP_CLAIM, 'A lamp is meant to be seen.')
assert.equal(STORY_SNAP_WIN, 'STORY OPEN!')
assert.equal(STORY_SNAP_AGAIN, 'One more snap')
assert.equal(EASY.snapAgain, STORY_SNAP_AGAIN)
assert.equal(SNAPS_TO_OPEN, 3)
assert.equal(STORY_SNAP_BEATS.length, 3)
assert.equal(storyPlayFor('daily-lantern'), 'story-snap')
assert.equal(lessonStory('daily-lantern').play, 'story-snap')
assert.equal(storyPlayFor('ph-debt'), 'panel-blast')
assert.equal(GATE_AT, 0.5)
assert.equal(beatProgress(0, 2200), 0)
assert.equal(beatProgress(2200, 2200), 1)
assert.equal(inSnapWindow(0.5), true)
assert.equal(inSnapWindow(0), false)
assert.equal(nextBeatIndex([]), 0)
assert.equal(nextBeatIndex(['lamp']), 1)
assert.equal(allBeatsLocked(['lamp', 'hill', 'seen']), true)
assert.equal(allBeatsLocked(['lamp']), false)

const playSrc = readFileSync(
  new URL('../src/components/challenges/StorySnapPlayView.tsx', import.meta.url),
  'utf8',
)
assert.match(playSrc, /is-story-snap/)
assert.match(playSrc, /STORY OPEN/)

const wire = readFileSync(new URL('../src/lib/storyPlay.ts', import.meta.url), 'utf8')
assert.match(wire, /STORY_SNAP_LINE/)
assert.match(wire, /story-snap/)

assert.match(playSrc, /STORY_SNAP_HINT/)
assert.doesNotMatch(
  playSrc,
  /className="quiet">\{STORY_SNAP_HINT\}/,
  'pad owns how — no quiet STORY_SNAP_HINT chrome (#189)',
)
assert.match(playSrc, /claimShown \? \(/)

// Easy Clear 1.4.163: omit Learn-lead STORY_SNAP_TEACH reprint — Fixes #209
assert.doesNotMatch(
  playSrc,
  /className="snap-teach"/,
  'Snap play peels Learn-lead snap-teach (#209)',
)
assert.doesNotMatch(
  playSrc,
  /\{STORY_SNAP_TEACH\}/,
  'no STORY_SNAP_TEACH in Snap play JSX (#209)',
)
assert.match(playSrc, /easy-who-where-line/, 'quiet who·place stays')
assert.match(playSrc, /1\.4\.163.*#209|#209.*omit STORY_SNAP_TEACH/)

const snapCss = readFileSync(new URL('../src/styles/storySnap.css', import.meta.url), 'utf8')
assert.match(snapCss, /max-height:\s*720px/)
assert.match(snapCss, /\.snap-teach/)
assert.match(snapCss, /-webkit-line-clamp:\s*2/)


// Easy Clear 1.4.157: Home whisper short next-step (not full snapHunt) — Fixes #203
const easyUiSnap = readFileSync(new URL('../src/lib/easyUi.ts', import.meta.url), 'utf8')
const hubSnapSrc = readFileSync(new URL('../src/components/Hub.tsx', import.meta.url), 'utf8')
assert.match(easyUiSnap, /snapHome: 'One more snap\.'/)
assert.doesNotMatch(easyUiSnap, /snapHome: 'Tap when a beat/)
assert.match(hubSnapSrc, /EASY\.snapHome/)
assert.match(hubSnapSrc, /1\.4\.157.*whisper|#203/)


// Easy Clear 1.4.182: Story Snap ≤720 HUD peel — hide eyebrow + who·where (invent Fun/Clear)
assert.match(playSrc, /1\.4\.182: ≤720 peels HUD/)
assert.match(snapCss, /1\.4\.182: Story Snap ≤720 HUD peel/)
assert.match(
  snapCss,
  /@media \(max-height: 720px\) \{[\s\S]*?\.play\.is-story-snap \.eyebrow \{[\s\S]*?display: none/,
)
assert.match(
  snapCss,
  /@media \(max-height: 720px\) \{[\s\S]*?\.play\.is-story-snap \.easy-who-where-line \{[\s\S]*?display: none/,
)

console.log('check-story-snap: ok')
