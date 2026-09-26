import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import {
  CITY_HOLLOW_TO_WITNESS,
  CITY_PLOTS,
  MAP_PLATE,
  stageCam,
  cityAge,
  citySnapshot,
  cityUpgrades,
  fillGrows,
  fillSnapshot,
  heavenChip,
  heavenForm,
  newestStanding,
  nextGift,
  nextKicker,
  nextPlotId,
  plotFill,
  plotStage,
  SPINE_GROW,
} from '../src/lib/city.ts'
import { APP_VERSION } from '../src/config/app.ts'
import { lociStampFor } from '../src/lib/lociStamp.ts'
import { CAST } from '../src/content/story.ts'
import { CHANGELOG, latestChange } from '../src/content/changelog.ts'
import { CONTENT_PACKS } from '../src/content/packs.ts'
import { DAILY_POOL, dailyForDate } from '../src/content/daily.ts'
import { highLookout } from '../src/content/highLookout.ts'
import { observatory } from '../src/content/observatory.ts'
import { parableHollow } from '../src/content/parableHollow.ts'
import { witnessBench } from '../src/content/witnessBench.ts'
import {
  abilityRange,
  defendPads,
  EASY_CUE_HOLD_MS,
  EASY_WALKER_FACE_PX,
  EASY_WALKER_HIT_PX,
  easyTapFit,
  easyTapMode,
  easyTapPersonCount,
  easyTapTarget,
  heavenPoint,
  raidForWave,
  unlockedWatchAbilities,
  waveIsClear,
} from '../src/lib/defend.ts'
import {
  deployFit,
  toolForEvidence,
  toolTier,
  WALKER_LABEL,
  watchTool,
  WATCH_TOOLS,
} from '../src/lib/watchTools.ts'
import { ideaUnlocked, mindGraph, mindMapHasLit } from '../src/lib/mindMap.ts'
import { appendStreetLinks, easyStreetChallenge, hardStreetChallenge, linkCaption, linkClue, linkMiss, linkPicture, nextStreetWalk, STREET_CHALLENGE, STREET_FACT_IDS, STREET_LIGHTS, STREET_SKIP_IDS, STREET_TRIPLES, streetDecoyNodes, streetFactsLeft, streetIsComplete, streetTripleForLine, streetWalks, STREET_WHYS } from '../src/content/links.ts'
import { firstGate } from '../src/content/firstGate.ts'
import { easyPlaceSub, LOT_STORY, TOWN_PATH_EASY, TOWN_PATH_HARD } from '../src/content/lots.ts'
import {
  appliedTier,
  applyUpgrade,
  canUpgrade,
  earnedTier,
  emptyCityBuilt,
  lotTapWhy,
  easyTagsFit,
  easyPlotTag,
  easyTagMetrics,
  plotTag,
  EASY_FOLK_LIFT,
  EASY_FOLK_NUDGE,
} from '../src/lib/cityBuild.ts'
import { emptyProgress } from '../src/lib/save.ts'
import { EASY, EASY_LINE_ORDER, DIG_ARC, NAMES_ARC, STONE_ARC, INK_ARC, easyChromeLine, easyChromeNearDup, easyFacingLine, easyHomeFocus, easyHoldLine, easyHoldPractice, easyHoldView, easyLearnLine, easyLineHeld, easyLineLearned, easyLineTaught, easyLoopLine, easyMatchLine, easyMatchReady, markEasyHeld, markEasyTaught, easyWhoWhere, easyWhoWhereLine, easyWhyLine, easyWhyWordCount, easyWrongTap, uniqueHoldChoices } from '../src/lib/easy.ts'
import { WORDS, easyLead } from '../src/lib/words.ts'
import { deeperLinksFor, eraLabel } from '../src/content/deeper.ts'
import { allEvidenceIds, evidenceFor } from '../src/content/evidence.ts'
import { plainFor } from '../src/content/plain.ts'
import { profileInventory } from '../src/lib/profile.ts'
import { readAppCss } from './readAppCss.mjs'

const progressSrc = readFileSync(
  new URL('../src/store/progress.ts', import.meta.url),
  'utf8',
)
assert.match(progressSrc, /HOLLOW_WALKS_TO_WITNESS = 2/)
assert.equal(CITY_HOLLOW_TO_WITNESS, 2)

const empty = {
  started: false,
  completed: [],
  journal: [],
  firstTry: [],
  stars: {},
  dailyDates: [],
  streak: 0,
  bestStreak: 0,
  held: [],
  memory: {},
  elaborations: {},
}

assert.equal(plotStage('porch', empty), 'scaffold')
assert.equal(plotStage('hollow', empty), 'empty')
assert.equal(plotStage('bench', empty), 'empty')
assert.equal(plotStage('observatory', empty), 'empty')
assert.equal(plotStage('journal', empty), 'empty')
assert.equal(nextPlotId(empty, false), 'porch')
assert.equal(cityAge(empty), 'eden')
assert.equal(heavenForm('eden'), 'seed')
assert.equal(heavenChip('eden'), null)
assert.equal(heavenChip('village'), 'Heaven waits')
assert.equal(heavenChip('heaven'), 'City of Heaven')
assert.ok(SPINE_GROW.eden < SPINE_GROW.village)
assert.ok(SPINE_GROW.gold < SPINE_GROW.heaven)
assert.equal(heavenForm(cityAge(empty)), 'seed')

const afterDaily = {
  ...empty,
  started: true,
  dailyDates: ['2026-09-07'],
  lastDailyDate: '2026-09-07',
  streak: 1,
  bestStreak: 1,
}
assert.equal(plotStage('porch', afterDaily), 'built')
assert.equal(plotStage('hollow', afterDaily), 'scaffold')
assert.equal(nextPlotId(afterDaily, true), 'hollow')
assert.equal(cityAge(afterDaily), 'village')

const fromEmpty = citySnapshot(empty)
const fromDaily = citySnapshot(afterDaily)
const upgrades = cityUpgrades(fromEmpty, fromDaily)
assert.equal(upgrades[0].beat, 'Built!')
assert.equal(upgrades.some((item) => item.id === 'porch' && item.to === 'built'), true)
assert.equal(upgrades.some((item) => item.id === 'hollow' && item.to === 'scaffold'), true)

const mapSrc = readFileSync(new URL('../src/components/CityMap.tsx', import.meta.url), 'utf8')
const plotArtSrc = readFileSync(
  new URL('../src/components/city/CityPlotArt.tsx', import.meta.url),
  'utf8',
)
const mapArtSrc = `${mapSrc}\n${plotArtSrc}`
assert.match(mapSrc, /city-beat/)
assert.match(plotArtSrc, /is-rising/)
assert.match(mapSrc, /beat\.beat/)
assert.match(plotArtSrc, /city-folk/)
assert.match(mapSrc, /TownFolk/)
assert.match(plotArtSrc, /city-portrait-img/)
assert.match(plotArtSrc, /clipPath="url\(#city-face-clip\)"/)
assert.doesNotMatch(plotArtSrc, /foreignObject/)
assert.match(mapSrc, /tweenCam/)
assert.match(mapSrc, /Grew!/)
assert.match(mapSrc, /beatRank/)
assert.match(mapSrc, /maybeHomecoming/)
assert.match(mapSrc, /Still lit/)
assert.match(mapSrc, /city-morrow/)
assert.match(mapSrc, /city-gift/)
assert.match(mapSrc, /nextGift/)
assert.match(plotArtSrc, /city-home-pad/)
assert.match(plotArtSrc, /city-roof-tile/)
assert.match(plotArtSrc, /PlotArt/)
assert.match(plotArtSrc, /HollowArt/)
assert.match(plotArtSrc, /PorchArt/)
assert.match(plotArtSrc, /HeavenCity/)
assert.match(plotArtSrc, /EdenGrove/)
assert.match(plotArtSrc, /SpinePath/)
assert.match(mapArtSrc, /City of Heaven/)
assert.match(mapArtSrc, /Eden → City of Heaven/)
assert.match(plotArtSrc, /heavenForm/)
assert.match(plotArtSrc, /SPINE_GROW/)
assert.match(mapArtSrc, /Heaven waits/)
assert.doesNotMatch(mapSrc, /function (EdenGrove|HollowArt|PlotArt|TownFolk)/)
assert.match(plotArtSrc, /export function (EdenGrove|PlotGroup|TownFolk)/)
assert.match(mapSrc, /from '\.\/city\/CityPlotArt'/)

const twoHollow = {
  ...afterDaily,
  completed: ['ph-road', 'ph-father'],
  journal: ['j-ph-1', 'j-ph-2'],
  stars: { 'ph-road': 1, 'ph-father': 1 },
}
assert.equal(plotStage('hollow', twoHollow), 'built')
assert.equal(plotFill('hollow', twoHollow), 2)

const hollowOnce = {
  ...afterDaily,
  completed: ['ph-road'],
  journal: ['j-ph-1'],
  stars: { 'ph-road': 1 },
}
const hollowTwice = {
  ...hollowOnce,
  completed: ['ph-road', 'ph-father'],
  journal: ['j-ph-1', 'j-ph-2'],
  stars: { 'ph-road': 1, 'ph-father': 1 },
}
assert.equal(plotStage('hollow', hollowOnce), 'built')
assert.equal(plotStage('hollow', hollowTwice), 'built')
const grew = fillGrows(
  fillSnapshot(hollowOnce),
  fillSnapshot(hollowTwice),
  citySnapshot(hollowTwice),
  cityUpgrades(citySnapshot(hollowOnce), citySnapshot(hollowTwice)),
)
assert.equal(grew.some((item) => item.id === 'hollow' && item.beat === 'Grew!'), true)
assert.equal(plotStage('bench', twoHollow), 'scaffold')
assert.equal(nextPlotId(twoHollow, true), 'hollow')
assert.equal(cityAge(twoHollow), 'village')

const townish = {
  ...twoHollow,
  completed: ['ph-road', 'ph-father', 'wb-creed'],
}
assert.equal(cityAge(townish), 'town')

const goldish = {
  ...empty,
  started: true,
  dailyDates: ['2026-09-07'],
  completed: [
    'ph-road',
    'ph-father',
    'ph-seeds',
    'ph-debt',
    'wb-creed',
    'wb-early',
    'wb-method',
    'wb-women',
    'ob-tuning',
    'ob-design',
    'ob-leibniz',
    'ob-life',
    'fg-mover',
  ],
  held: ['ph-road', 'ph-father', 'ph-seeds'],
}
assert.equal(cityAge(goldish), 'gold')

const heavenish = {
  ...goldish,
  completed: [
    ...goldish.completed,
    'fg-contingent',
    'fg-kalam',
    'fg-limits',
    'hl-moral',
    'hl-mind',
    'hl-meaning',
    'hl-beauty',
  ],
  held: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'],
}
assert.equal(plotStage('lookout', heavenish), 'lit')
assert.equal(cityAge(heavenish), 'heaven')
assert.equal(heavenForm('heaven'), 'city')

const grown = {
  ...empty,
  started: true,
  completed: [
    'ph-road',
    'ph-father',
    'ph-seeds',
    'ph-debt',
    'wb-creed',
    'wb-early',
    'wb-method',
    'wb-women',
    'ob-tuning',
    'ob-design',
    'ob-leibniz',
    'ob-life',
    'fg-mover',
    'fg-contingent',
    'fg-kalam',
    'fg-limits',
    'hl-moral',
    'hl-mind',
    'hl-meaning',
    'hl-beauty',
  ],
  journal: Array.from({ length: 12 }, (_, i) => `j-${i}`),
  stars: Object.fromEntries(
    [
      'ph-road',
      'ph-father',
      'wb-creed',
      'ob-tuning',
      'fg-mover',
      'hl-moral',
    ].map((id) => [id, 3]),
  ),
  dailyDates: ['2026-09-05', '2026-09-06', '2026-09-07'],
  lastDailyDate: '2026-09-07',
  streak: 3,
  bestStreak: 3,
  held: ['ph-road'],
  memory: {},
  elaborations: {},
}

assert.equal(plotStage('porch', grown), 'lit')
assert.equal(plotStage('hollow', grown), 'lit')
assert.equal(plotStage('bench', grown), 'lit')
assert.equal(plotStage('observatory', grown), 'lit')
assert.equal(plotStage('gate', grown), 'lit')
assert.equal(plotStage('lookout', grown), 'lit')
assert.equal(plotStage('journal', grown), 'lit')
assert.equal(plotStage('lamps', grown), 'lit')

const hubSrc = readFileSync(new URL('../src/components/Hub.tsx', import.meta.url), 'utf8')
assert.match(hubSrc, /CityMap/)
assert.match(hubSrc, /The town/)
assert.match(hubSrc, /is-town/)
assert.match(hubSrc, /townVoice/)
assert.match(hubSrc, /street-drawer/)
assert.doesNotMatch(hubSrc, /STAR_KEY/)

const welcomeSrc = readFileSync(
  new URL('../src/components/Welcome.tsx', import.meta.url),
  'utf8',
)
assert.match(welcomeSrc, /welcome-hero/)
assert.match(welcomeSrc, /is-onescreen/)
assert.match(welcomeSrc, /EASY\.welcomeGoal/)
assert.match(welcomeSrc, /EASY\.welcomeNote/)
assert.doesNotMatch(welcomeSrc, /cityPromise/)
assert.doesNotMatch(welcomeSrc, /welcome-cast-late/)
assert.match(welcomeSrc, /YOU · RIVER/)
assert.match(welcomeSrc, /GUIDE · JUNIPER/)
assert.match(welcomeSrc, /name: 'hub'/)
assert.doesNotMatch(welcomeSrc, /name: 'link'/, 'Cold Start Easy must land hub (map+coach), not link/Match')
assert.doesNotMatch(welcomeSrc, /easyLineHeld/, '1.4.149 Home-first: no Mercy-held ternary on Welcome.begin')

const storySrc = readFileSync(
  new URL('../src/content/story.ts', import.meta.url),
  'utf8',
)
assert.match(
  storySrc,
  /A 60-second Christian reasoning game: sort ideas, choose one takeaway, and remember why it stands tomorrow\./,
)
assert.match(
  storySrc,
  /You are River\. Juniper is your guide\. Each day you practice one Christian idea\./,
)
assert.match(
  storySrc,
  /Goal: keep the lines that support today’s claim; toss the distractors; then choose the claim and reason you’ll remember\./,
)
assert.match(
  storySrc,
  /Choose the one-sentence takeaway you can repeat tomorrow, then choose why it stands\./,
)
assert.match(storySrc, /Lock in the sort\./)
assert.match(storySrc, /TOWN_VOICE/)
assert.match(storySrc, /Lamp’s ready/)

const sortSrc = readFileSync(
  new URL('../src/components/challenges/SortPlay.tsx', import.meta.url),
  'utf8',
)
assert.match(sortSrc, /STORY\.lockSort/)
assert.match(sortSrc, /sort-lock/)
assert.match(sortSrc, /is-ready/)
assert.match(sortSrc, /WinBurst/)
assert.match(sortSrc, /burstStyle/)
assert.doesNotMatch(sortSrc, /Snap the bins/)
assert.doesNotMatch(sortSrc, /Bins are full/)
assert.doesNotMatch(sortSrc, /this belongs/)
assert.match(sortSrc, /Toss<\/strong> a distractor/)
assert.match(sortSrc, /Keep · belongs/)
assert.match(sortSrc, /Toss · aside/)
assert.match(sortSrc, /is-gone/)
assert.match(sortSrc, /sort-seat/)
assert.match(sortSrc, /was-keep/)
assert.match(sortSrc, /was-toss/)
assert.match(sortSrc, /Return \$\{easy \? easyChromeLine\(home\.text\) : home\.text\} to its seat/)
assert.match(sortSrc, /\[slots, setSlots\]/)
assert.match(sortSrc, /bank is-sort/)
assert.doesNotMatch(sortSrc, /bank\.length/)
assert.match(sortSrc, /tile\.bin !== bin/)
assert.match(sortSrc, /Try again/)
assert.match(sortSrc, /showSortHow/)
assert.match(sortSrc, /plainFor\(challenge\.id\)/)

const sequenceSrc = readFileSync(
  new URL('../src/components/challenges/SequencePlay.tsx', import.meta.url),
  'utf8',
)
assert.match(sequenceSrc, /is-sequence/)
assert.match(sequenceSrc, /bank is-order/)
assert.match(sequenceSrc, /is-gone/)
assert.match(sequenceSrc, /sort-seat/)
assert.match(sequenceSrc, /tap the next stone/)
assert.match(sequenceSrc, /is-now/)
assert.match(sequenceSrc, /is-facedown/)
assert.match(sequenceSrc, /is-deal/)
assert.match(sequenceSrc, /decoyFor/)
assert.match(sequenceSrc, /keepDecoy/)
assert.match(sequenceSrc, /shake\) return/)
assert.match(sequenceSrc, /need\.id/)
assert.match(sequenceSrc, /Return \$\{home\.text\} to its seat/)
assert.match(sequenceSrc, /progressive && !live/)
assert.match(sequenceSrc, /if \(faceDown\) return null/)
assert.doesNotMatch(sequenceSrc, /Next step/)
assert.doesNotMatch(sequenceSrc, /bank\.filter/)
assert.match(sequenceSrc, /showEasyPuzzleHint/)
assert.match(sequenceSrc, /easyChromeNearDup/)
assert.match(sequenceSrc, /easyLeadLine/)
assert.match(sequenceSrc, /easyPlainHint/)
assert.match(
  sequenceSrc,
  /progressive \? null/,
  'Jericho two-pick must not render the empty 1–5 chain',
)

const buildSrc = readFileSync(
  new URL('../src/components/challenges/BuildArgumentPlay.tsx', import.meta.url),
  'utf8',
)
assert.match(buildSrc, /bank is-order/)
assert.match(buildSrc, /is-onescreen/)
assert.match(buildSrc, /is-gone/)
assert.match(buildSrc, /sort-seat/)
assert.doesNotMatch(buildSrc, /Drop here/)
assert.ok(
  buildSrc.indexOf('slot-list') < buildSrc.indexOf('bank is-order'),
  'slots sit above the bank so Premise 1 stays on-screen',
)
assert.match(buildSrc, /startsWith\('ob-'\)/)
assert.match(buildSrc, /Try again/)
assert.match(buildSrc, /setStatus\('idle'\)/)
assert.doesNotMatch(buildSrc, /setSlots\(\{\}\)/)
assert.match(buildSrc, /showSortHow/)
assert.match(buildSrc, /showEasyPuzzleHint/)
assert.match(buildSrc, /easyChromeNearDup/)
assert.match(buildSrc, /easyLeadLine/)
assert.match(buildSrc, /easyPlainHint/)
assert.match(buildSrc, /plainFor\(challenge\.id\)/)

const dailySrc = readFileSync(
  new URL('../src/content/daily.ts', import.meta.url),
  'utf8',
)
assert.match(dailySrc, /the heavens already speak of a Maker/)
assert.match(dailySrc, /why: 'A gift-shaped beauty/)
assert.match(dailySrc, /why: 'The sky speaks of a Maker/)
assert.doesNotMatch(dailySrc, /design inference/)
assert.doesNotMatch(dailySrc, /A multiverse is a peer to design/)
assert.doesNotMatch(dailySrc, /multiverse/)
assert.doesNotMatch(dailySrc, /necessity/)
assert.doesNotMatch(dailySrc, /asserted to cancel the surprise/)
assert.doesNotMatch(dailySrc, /not required to agree/)
assert.doesNotMatch(dailySrc, /you may disagree/)
assert.match(dailySrc, /Isaiah 53’s Servant is the Jesus the church confesses/)
assert.match(dailySrc, /Matthew 26:28; Luke 22:20/)
assert.doesNotMatch(dailySrc, /Mercy is poured, not earned/)
assert.equal([...dailySrc.matchAll(/\bwhy: '/g)].length, 12)
assert.match(dailySrc, /early: true/)
assert.match(dailySrc, /daily-gems/)
assert.match(dailySrc, /item\.early/)
assert.equal(dailyForDate('2026-09-09', 0).early, true)
assert.equal(dailyForDate('2026-09-10', 1).early, true)

function assertMatchPictures(label, pairs) {
  for (const pair of pairs) {
    assert.ok(pair.gem || pair.scene, `${label} ${pair.id} needs a picture gem or scene`)
  }
}

for (const area of [parableHollow, witnessBench, observatory, highLookout]) {
  for (const challenge of area.challenges) {
    if (challenge.kind === 'match') {
      assertMatchPictures(challenge.id, challenge.pairs)
    }
  }
}
for (const item of DAILY_POOL) {
  if (item.challenge.kind === 'match') {
    assertMatchPictures(item.challenge.id, item.challenge.pairs)
  }
}

const contentFiles = [
  'daily.ts',
  'parableHollow.ts',
  'witnessBench.ts',
  'observatory.ts',
  'firstGate.ts',
  'highLookout.ts',
]
for (const file of contentFiles) {
  const src = readFileSync(new URL(`../src/content/${file}`, import.meta.url), 'utf8')
  const kinds = [...src.matchAll(/\bkind: '/g)].length
  const ideas = [...src.matchAll(/\bidea: '/g)].length
  assert.equal(kinds, ideas, `${file} needs a plain idea on every puzzle`)
}

const dailyTrailSrc = readFileSync(
  new URL('../src/components/DailyTrail.tsx', import.meta.url),
  'utf8',
)
assert.match(dailyTrailSrc, /See the town/)
assert.match(dailyTrailSrc, /STORY\.tapTakeaway/)
assert.match(dailyTrailSrc, /TownReturn/)
assert.match(dailyTrailSrc, /afterJuice/)
assert.match(dailyTrailSrc, /savedWin/)
assert.match(dailyTrailSrc, /puzzle-title/)
assert.doesNotMatch(dailyTrailSrc, /AdSlot/)
assert.doesNotMatch(dailyTrailSrc, /district-flavor/)
assert.doesNotMatch(dailyTrailSrc, /Tomorrow:/)
assert.match(dailyTrailSrc, /TeachUnlock/)
assert.match(dailyTrailSrc, /is-teach/)
assert.match(dailyTrailSrc, /is-arming/)
assert.doesNotMatch(dailyTrailSrc, /morningReview/)
assert.doesNotMatch(dailyTrailSrc, /isReview/)

const puzzleLeadSrc = readFileSync(
  new URL('../src/components/challenges/PuzzleLead.tsx', import.meta.url),
  'utf8',
)
assert.match(puzzleLeadSrc, /challenge\.idea \?\? challenge\.prompt/)
assert.doesNotMatch(puzzleLeadSrc, /Today’s idea/)
assert.doesNotMatch(puzzleLeadSrc, /challenge\.prompt<\/p>/)

const recallSrc = readFileSync(
  new URL('../src/components/RecallGate.tsx', import.meta.url),
  'utf8',
)
assert.doesNotMatch(recallSrc, /phase === 'echo'/)
assert.doesNotMatch(recallSrc, /held-stamp/)
assert.match(recallSrc, /STORY\.takeaway/)
assert.match(recallSrc, /is-encode/)
assert.match(recallSrc, /is-own/)
assert.match(recallSrc, /takeawayLines/)
assert.match(recallSrc, /\[brief\.claim\]/)
assert.match(recallSrc, /pickClaim/)
assert.match(recallSrc, /recall-done/)
assert.match(recallSrc, /EASY.rememberSentence/)
assert.match(recallSrc, /is-easy-hold/)
assert.match(
  readFileSync(new URL('../src/components/challenges/WhyBlastPlay.tsx', import.meta.url), 'utf8'),
  /EASY\.keepThis/,
)
assert.match(recallSrc, /EASY\.tapWhy/)
assert.match(recallSrc, /easyWhyLine/)
{
  const easyHold = recallSrc.match(/if \(easyEncode\) \{\s*return \(([\s\S]*?)\n  \}/)?.[1] ?? ''
  assert.match(easyHold, /WhyBlastPlay/)
  assert.match(easyHold, /EASY\.rememberSentence/)
  // Easy Clear 1.4.142: claim-pick is one next-tap — no stacked mainIdeaTeach chip.
  assert.doesNotMatch(easyHold, /className=\"teach-chip\"/)
  assert.doesNotMatch(easyHold, /EASY\.mainIdeaTeach/)
  assert.doesNotMatch(easyHold, /reasonOptions\.map/)
  assert.doesNotMatch(easyHold, /EASY\.reasonTeach/)
  assert.doesNotMatch(easyHold, /EASY\.whyStands/)
}
assert.doesNotMatch(
  readFileSync(new URL('../src/components/RecallGate.tsx', import.meta.url), 'utf8'),
  /easy\s*\?\s*\n\s*EASY\.tapWhy/,
)
assert.doesNotMatch(
  readFileSync(new URL('../src/components/Journal.tsx', import.meta.url), 'utf8'),
  /<h1>\{focusedEntry\?\.title \?\? \(easy \? EASY\.rememberSentence/,
)
assert.match(recallSrc, /uniqueHoldChoices/)
assert.doesNotMatch(recallSrc, /Tap the sentence you still remember/)
assert.match(recallSrc, /reasonLocked/)
assert.match(recallSrc, /btn gold xl recall-done/)
assert.match(recallSrc, /That reason holds/)
assert.match(recallSrc, /Not today/)
assert.match(recallSrc, /Later/)
assert.match(recallSrc, /is-deeper/)
assert.match(recallSrc, /visits/)
assert.match(dailyTrailSrc, /tile\.bin === 'keep'/)

const matchSrc = readFileSync(
  new URL('../src/components/challenges/MatchPlay.tsx', import.meta.url),
  'utf8',
)
assert.match(matchSrc, /is-match/)
assert.match(matchSrc, /side: Side/)
assert.match(matchSrc, /shake \|\| locked/)
assert.match(matchSrc, /Tap a picture/)
assert.match(matchSrc, /stopPropagation/)
assert.match(matchSrc, /match-col-label/)
assert.match(matchSrc, /pair.gem/)
assert.match(matchSrc, /MatchScene/)
assert.match(matchSrc, /match-toast/)
assert.match(matchSrc, /aria-label=\{pair.left\}/)
assert.match(matchSrc, /match-caption/)
assert.doesNotMatch(matchSrc, /ResultPanel/)
assert.doesNotMatch(matchSrc, /pickedLeft/)
assert.match(matchSrc, /startsWith\('ob-'\)/)
assert.match(matchSrc, /Try again/)
assert.match(matchSrc, /decoyFor/)

const matchCss = readAppCss()
assert.match(matchCss, /match-toast/)
assert.match(matchCss, /match-scene/)
assert.match(matchCss, /grid-template-rows: subgrid/)
assert.match(matchCss, /\.match-card\.right/)

const obSrc = readFileSync(new URL('../src/content/observatory.ts', import.meta.url), 'utf8')
assert.match(obSrc, /scene: 'expand'/)
assert.match(obSrc, /scene: 'bind'/)
assert.match(obSrc, /scene: 'tidy'/)
assert.match(obSrc, /scene: 'dial'/)
assert.doesNotMatch(obSrc, /not yet a proof of a Designer/)
assert.doesNotMatch(obSrc, /not yet a Designer/)
assert.match(obSrc, /that fit points to a Designer/)
assert.match(obSrc, /Fine-tuning is best explained by a mind that intended a habitable world/)
assert.match(obSrc, /initial condition, not another force dial/)
assert.match(obSrc, /Designer who wants observers/)
assert.match(obSrc, /extravagantly narrow, habitable/)
assert.match(obSrc, /asserted to cancel the surprise — no evidence/)
assert.equal(
  [...obSrc.matchAll(/asserted to cancel the surprise — no evidence/g)].length,
  2,
  'one multiverse clause on ob-tuning and ob-design only',
)
assert.doesNotMatch(obSrc, /empty assertion/)
assert.doesNotMatch(obSrc, /Three replies get named/)
assert.doesNotMatch(obSrc, /peer to design/)
assert.doesNotMatch(obSrc, /named and dismissed/)
assert.doesNotMatch(obSrc, /Necessity does not oblige/)
assert.doesNotMatch(obSrc, /examine them/)
assert.doesNotMatch(obSrc, /Neither reply erases/)
assert.ok(
  !obSrc.slice(0, obSrc.indexOf("id: 'ob-tuning'")).includes('multiverse'),
  'area intro must not brief the triad',
)
const benchSrc = readFileSync(
  new URL('../src/content/witnessBench.ts', import.meta.url),
  'utf8',
)
assert.match(benchSrc, /scene: 'witnesses'/)
assert.match(benchSrc, /scene: 'reluctant'/)
assert.match(benchSrc, /scene: 'clock'/)
assert.match(benchSrc, /scene: 'judea'/)
assert.doesNotMatch(benchSrc, /None of these prove God/)
assert.match(benchSrc, /early public testimony, not a lab rerun/)
assert.doesNotMatch(benchSrc, /appearances list widened/)
assert.match(benchSrc, /1 Cor 15:3–5/)

const evidenceSrc = readFileSync(
  new URL('../src/content/evidence.ts', import.meta.url),
  'utf8',
)
assert.match(evidenceSrc, /The universe is finely tuned for life — that fit points to a Designer/)
assert.match(evidenceSrc, /The heavens already speak of a Maker; fine-tuning fits that voice/)
assert.match(evidenceSrc, /Psalm 19:1–4; Romans 1:20/)
assert.match(evidenceSrc, /The kingdom arrives in pictures, not slogans/)
assert.match(evidenceSrc, /Fine-tuning is best explained by a mind that intended a habitable world/)
assert.match(evidenceSrc, /Designer who wants people/)
assert.doesNotMatch(evidenceSrc, /name them honestly/)
assert.doesNotMatch(evidenceSrc, /not yet a proof of a Designer/)
assert.doesNotMatch(evidenceSrc, /not yet a Designer/)
assert.doesNotMatch(evidenceSrc, /peer explanation/)
assert.doesNotMatch(evidenceSrc, /multiverse/)
assert.doesNotMatch(evidenceSrc, /empty assertion/)
assert.match(evidenceSrc, /The fittedness is only a rumor in the numbers/)
assert.match(evidenceSrc, /export function takeawayLines/)
assert.doesNotMatch(evidenceSrc, /Beauty forbids/)
assert.doesNotMatch(evidenceSrc, /Wonder is the enemy of science/)
assert.doesNotMatch(evidenceSrc, /The sky is not worth looking at slowly/)
assert.doesNotMatch(evidenceSrc, /you may disagree/)
assert.doesNotMatch(evidenceSrc, /Tacitus still notes/)
assert.doesNotMatch(evidenceSrc, /does not deduct God/)
assert.doesNotMatch(evidenceSrc, /philosophical clue/)
assert.doesNotMatch(evidenceSrc, /Clean is not uncontested/)
assert.match(evidenceSrc, /Isaiah 53:4–12/)
assert.match(evidenceSrc, /A beginning has a Cause/)
assert.match(evidenceSrc, /Women were first to report Jesus’ empty tomb/)
assert.match(evidenceSrc, /The apostles first called them wrong/)
assert.doesNotMatch(evidenceSrc, /costly opening if the goal were instant respectability/)
assert.doesNotMatch(evidenceSrc, /if invented for respectability/)
assert.match(evidenceSrc, /Life’s specified information is a mark of mind/)
assert.match(evidenceSrc, /Matthew 26:28; Luke 22:20/)

const journalSrc = readFileSync(
  new URL('../src/content/journal.ts', import.meta.url),
  'utf8',
)
assert.doesNotMatch(journalSrc, /multiverse/)
assert.doesNotMatch(journalSrc, /asserted to cancel the surprise/)
assert.doesNotMatch(journalSrc, /Whatever one concludes/)
assert.match(journalSrc, /This is what the churches were already handing on/)
assert.doesNotMatch(journalSrc, /does not deduct God/)
assert.doesNotMatch(journalSrc, /Clean is not the same as uncontested/)
assert.doesNotMatch(journalSrc, /their critics/)
assert.doesNotMatch(journalSrc, /sneered out of court/)
assert.match(journalSrc, /Philoponus against an eternal world/)
assert.match(journalSrc, /Craig’s modern statement of the kalām syllogism/)
assert.match(journalSrc, /stands to be weighed/)

assert.doesNotMatch(hubSrc, /['"]Again['"]/)
assert.doesNotMatch(hubSrc, /Standing/)
assert.doesNotMatch(hubSrc, /Rising/)
assert.match(hubSrc, /STORY\.takeaway/)
assert.match(hubSrc, /rehearseGo/)
assert.match(hubSrc, /street-next/)

const areaSrc = readFileSync(
  new URL('../src/components/AreaView.tsx', import.meta.url),
  'utf8',
)
assert.doesNotMatch(areaSrc, /area\.intro\.map/)
assert.match(areaSrc, /Landmark/)
assert.doesNotMatch(areaSrc, /Next: \{next\.title\}/)
assert.match(areaSrc, /Keep building/)

const challengeSrc = readFileSync(
  new URL('../src/components/ChallengeScreen.tsx', import.meta.url),
  'utf8',
)
assert.match(challengeSrc, /TownReturn/)
assert.match(challengeSrc, /See the town/)
assert.match(challengeSrc, /onNavigate\(EASY_HOME\)/)
assert.match(challengeSrc, /afterJuice/)
assert.match(challengeSrc, /savedWin/)
assert.match(challengeSrc, /puzzle-title/)
assert.match(challengeSrc, /easy \? null : <h1 className="puzzle-title">/)
assert.match(challengeSrc, /tile\.bin === 'keep'/)
assert.match(challengeSrc, /TeachUnlock/)
assert.match(challengeSrc, /areaId === 'observatory'/)
assert.match(challengeSrc, /challenge.pairs.map/)
assert.match(challengeSrc, /kind === 'sequence'/)
assert.match(challengeSrc, /is-teach/)
assert.match(challengeSrc, /is-arming/)

const teachSrc = readFileSync(
  new URL('../src/components/TeachUnlock.tsx', import.meta.url),
  'utf8',
)
assert.match(teachSrc, /brief\.claim/)
assert.match(teachSrc, /brief\.reason/)
assert.match(teachSrc, /brief\.source/)
assert.match(teachSrc, /Unlock the sort/)
assert.match(teachSrc, /teach-beats/)
assert.doesNotMatch(teachSrc, /essay/)
const hollowSrc = readFileSync(
  new URL('../src/content/parableHollow.ts', import.meta.url),
  'utf8',
)
assert.match(hollowSrc, /The Good Samaritan/)
assert.match(hollowSrc, /kind: 'sequence'/)
assert.match(hollowSrc, /the kingdom arrives in pictures, not slogans/)
assert.match(hollowSrc, /id: 'ph-seeds'/)
assert.match(hollowSrc, /gem: 'seed'/)
assert.match(hollowSrc, /The father runs with mercy/)
assert.match(hollowSrc, /Luke 10:36/)

const cityLibSrc = readFileSync(new URL('../src/lib/city.ts', import.meta.url), 'utf8')
const cityModelSrc = readFileSync(new URL('../src/lib/cityModel.ts', import.meta.url), 'utf8')
const cityCodeSrc = `${cityLibSrc}\n${cityModelSrc}`
assert.doesNotMatch(cityCodeSrc, /Walk again/)
assert.match(cityCodeSrc, /Still lit/)
assert.match(cityCodeSrc, /Seven Seals/)
assert.doesNotMatch(cityCodeSrc, /Keep building/)
assert.match(cityLibSrc, /from '\.\/cityModel\.ts'/)
assert.match(cityModelSrc, /export function nextKicker/)
assert.equal(nextKicker('built', 'hollow', true), 'Still lit')
assert.equal(nextKicker('lit', 'porch', true), 'Still lit')
assert.equal(nextKicker('scaffold', 'hollow', true), 'Build next')
assert.equal(nextKicker('empty', 'bench', true), 'Build next')
assert.equal(nextKicker('built', 'porch', false), 'Walk next')
assert.equal(nextGift('hollow', 'scaffold', 0), 'Mercy’s cabin will stand')
assert.equal(nextGift('porch', 'scaffold', 0), 'Juniper’s porch roof will go on')
assert.equal(nextGift('hollow', 'built', 1), 'Another oak will rise')
assert.equal(nextGift('bench', 'scaffold', 0), 'Silas’s hall will stand')

const shellSrc = readFileSync(
  new URL('../src/components/AppShell.tsx', import.meta.url),
  'utf8',
)
assert.match(shellSrc, /view\.name === 'journal'/)
assert.match(shellSrc, /view\.name === 'hub'/)

const cssSrc = readAppCss()
assert.match(cssSrc, /--candy-lip/)
assert.match(cssSrc, /--candy-shine/)
assert.match(cssSrc, /#ffcc33/)
assert.match(cssSrc, /#ff5a7a/)
assert.match(cssSrc, /background: #3a1480/)
assert.doesNotMatch(cssSrc, /#1c1810/)
assert.match(cssSrc, /city-heaven/)
assert.match(cssSrc, /city-heaven-seed/)
assert.match(cssSrc, /is-age-town/)
assert.match(cssSrc, /city-spine/)
assert.match(cssSrc, /city-age-track/)
assert.match(cssSrc, /data-theme='parchment'/)
assert.match(cssSrc, /data-theme='dusk'/)
assert.match(
  cssSrc,
  /:root:not\(\[data-theme='dusk'\]\):not\(\[data-theme='parchment'\]\) \.city-overworld\.is-age-heaven/,
)
assert.match(cssSrc, /html\[data-theme='parchment'\] \.city-legend/)
assert.match(cssSrc, /html\[data-theme='dusk'\] \.city-legend/)
assert.match(cssSrc, /img\.gem-art/)
assert.match(cssSrc, /night-watch-gems/)
assert.doesNotMatch(cssSrc, /\.city-legend \{\n  margin-top: -/)
assert.doesNotMatch(cssSrc, /\.hub\.is-town \.city-legend \{\n  margin-top: -/)
assert.match(cssSrc, /\.hub\.is-town \.city-legend \{\n  margin-top: 8px/)
assert.match(cssSrc, /html\[data-theme='parchment'\] \.hub\.is-town \.night-watch/)
assert.match(cssSrc, /html\[data-theme='dusk'\] \.hub\.is-town \.night-watch/)
assert.match(cssSrc, /is-alive \.city-canopy\.is-sprout/)
assert.match(cssSrc, /is-alive \.city-folk\.is-waving/)
assert.match(cssSrc, /city-roof-kick/)
assert.match(cssSrc, /city-home-pad/)
assert.match(cssSrc, /city-roof-tile/)
assert.match(cssSrc, /city-gift/)
assert.match(cssSrc, /city-porch/)
assert.match(cssSrc, /city-plot\.is-built \.city-roof/)
assert.match(cssSrc, /city-street\.is-lit/)
assert.match(cssSrc, /tile-burst/)
assert.match(cssSrc, /win-spark/)
assert.match(cssSrc, /puzzle-title/)
assert.match(cssSrc, /win-flash 0\.9s ease-out both !important/)
assert.match(cssSrc, /win-ring/)
assert.match(cssSrc, /bin-clear/)
assert.match(cssSrc, /app\.is-town \.app-body/)
assert.match(cssSrc, /welcome\.is-onescreen/)
assert.match(cssSrc, /win-stamp-glow/)
assert.match(cssSrc, /is-homecoming/)
assert.match(cssSrc, /sort-tile\.is-gone/)
assert.match(cssSrc, /--sort-seat/)
assert.match(cssSrc, /bank\.is-sort/)
assert.match(cssSrc, /bank\.is-order/)
assert.match(cssSrc, /play\.is-sequence/)
assert.match(cssSrc, /play\.is-sequence\.is-deal/)
assert.match(cssSrc, /is-deal \.chain/)
assert.match(cssSrc, /next-glow/)
assert.match(cssSrc, /order-step\.is-now/)
assert.match(cssSrc, /stone-back/)
assert.match(cssSrc, /grid-template-rows: var\(--sort-seat\)/)
assert.doesNotMatch(
  cssSrc,
  /\.is-puzzle \.play \.bank \{/,
  '2×2 seat lock must target .bank.is-sort only — order paths cannot inherit a 2-row clip',
)
assert.match(cssSrc, /recall-gate\.is-encode/)
assert.match(cssSrc, /recall-gate\.is-own/)
assert.match(cssSrc, /teach-gate/)
assert.match(cssSrc, /--slot-seat/)
assert.match(cssSrc, /grid-template-rows: minmax\(0, 1fr\) auto/)
assert.match(cssSrc, /-webkit-line-clamp: 3/)
assert.match(cssSrc, /is-arming/)
assert.match(cssSrc, /play\.is-match/)
assert.match(cssSrc, /match-col-label/)
assert.match(cssSrc, /\.match-grid \{\s*[\s\S]*?grid-template-columns: 1fr 1fr/)
assert.doesNotMatch(
  cssSrc,
  /\.match-grid \{\s*grid-template-columns: 1fr;\s*\}/,
  'match stays two columns on a phone so pictures and claims stay neighbors',
)
assert.match(cssSrc, /play\.is-build \{\s*[\s\S]*?overflow: hidden/)
assert.match(cssSrc, /grid-template-columns: 5\.5rem minmax\(0, 1fr\)/)
assert.match(
  cssSrc,
  /\.is-puzzle \.play\.is-build \.chip\.in-slot \{\s*[\s\S]*?overflow: auto/,
  'long premise text scrolls inside the seat only',
)
assert.doesNotMatch(
  cssSrc,
  /\.play\.is-ready\s+\.bank\s*\{[^}]*display:\s*none/,
  'ready must not hide the 2×2 bank — chairs stay after the last Keep',
)
assert.match(
  cssSrc,
  /\.is-gone \.chip \{\s*opacity: 0\.55/,
  'gone chip stays as a faint ghost in its seat',
)
assert.match(cssSrc, /min-height: 64px/)

const juiceSrc = readFileSync(new URL('../src/lib/juice.ts', import.meta.url), 'utf8')
assert.match(cssSrc, /win-stamp/)

const burstSrc = readFileSync(
  new URL('../src/components/challenges/WinBurst.tsx', import.meta.url),
  'utf8',
)
assert.match(burstSrc, /Locked!/)
assert.match(burstSrc, /win-stamp is-badge/)
{
  const stampCss = cssSrc.match(/\/\* Overlay label[\s\S]*?\.win-stamp \{[\s\S]*?\n\}/)?.[0] ?? ''
  assert.match(stampCss, /\.win-stamp \{/)
  assert.doesNotMatch(
    stampCss,
    /#e09412|candy-lip|#fff6b8/,
    'win stamp must not share primary-button gold fill / candy lip',
  )
}
assert.match(juiceSrc, /WIN_BURST_MS = 1100/)
assert.match(juiceSrc, /useJuiceHandoff/)

const hintSrc = readFileSync(
  new URL('../src/components/challenges/PuzzleHint.tsx', import.meta.url),
  'utf8',
)
assert.match(hintSrc, /'Clue'/)
assert.doesNotMatch(hintSrc, /Peek a clue/)

const resultSrc = readFileSync(
  new URL('../src/components/challenges/ResultPanel.tsx', import.meta.url),
  'utf8',
)
assert.match(resultSrc, /tone === 'ok'\) return null/)

assert.equal(newestStanding(fromDaily), 'porch')

assert.match(mapSrc, /nextWalkView/)
assert.match(hubSrc, /nextWalkView/)
assert.match(progressSrc, /export function nextWalkView/)

assert.deepEqual(defendPads(empty), ['porch'])
assert.match(hubSrc, /Hold the night/)
assert.match(hubSrc, /night-watch/)
assert.match(hubSrc, /Held lines turn the night toward heaven/)
assert.match(hubSrc, /Why locked/)
assert.match(hubSrc, /street-lock/)
assert.doesNotMatch(hubSrc, /standing lot/i)
const defendCopy = readFileSync(
  new URL('../src/content/defend.ts', import.meta.url),
  'utf8',
)
assert.doesNotMatch(defendCopy, /standing lot/i)
const defendSrc = readFileSync(
  new URL('../src/components/DefendScreen.tsx', import.meta.url),
  'utf8',
)
assert.match(defendSrc, /The road is coming/)
assert.match(defendSrc, /EASY.nightDo/)
assert.match(defendSrc, /How to use Love/)
assert.match(defendSrc, /Love tip/)
assert.match(defendSrc, /loveHowTo/)
assert.doesNotMatch(defendSrc, /TeachUnlock/)
assert.doesNotMatch(defendSrc, /RecallGate/)
assert.match(defendSrc, /defendPads/)
assert.match(defendSrc, /afterJuiceRef/)
assert.match(defendSrc, /}, \[phase, easy, progress\.defense\.cleared\]/)
assert.match(defendSrc, /fireBest/)
const defendNightSrc = readFileSync(
  new URL('../src/components/DefendNightActors.tsx', import.meta.url),
  'utf8',
)
const defendSkySrc = readFileSync(
  new URL('../src/components/DefendNightSky.tsx', import.meta.url),
  'utf8',
)
const defendAbilitySrc = readFileSync(
  new URL('../src/components/DefendAbilityBar.tsx', import.meta.url),
  'utf8',
)
const defendBundleSrc = `${defendSrc}\n${defendNightSrc}\n${defendSkySrc}\n${defendAbilitySrc}`
assert.match(defendNightSrc, /defend-lantern/)
assert.match(defendSkySrc, /defend-ridge/)
assert.match(defendNightSrc, /defend-beam/)
assert.match(defendSkySrc, /defend-porch/)
assert.match(defendNightSrc, /defend-blast/)
assert.match(defendBundleSrc, /Night held!/)
assert.match(defendSrc, /comboRef/)
assert.match(defendBundleSrc, /Turn them toward heaven/)
assert.match(defendSrc, /unlockedWatchAbilities/)
assert.match(defendSrc, /heavenPoint/)
assert.match(defendAbilitySrc, /AbilityMark/)
assert.match(defendSrc, /easyTapFit/)
assert.match(defendSrc, /raidForWave/)
assert.match(defendNightSrc, /WALKER_LABEL/)
assert.match(defendBundleSrc, /learningForTool/)
assert.match(defendSrc, /recordNight/)
assert.doesNotMatch(defendSrc, /kind: 'encode'/)
assert.match(defendSrc, /WATCH_ABILITY_LABEL/)
assert.match(defendAbilitySrc, /WATCH_TOOLS\.map/)
assert.match(defendAbilitySrc, /TIER_MARK/)
assert.match(defendSkySrc, /defend-heaven-path/)
assert.match(defendBundleSrc, /Toward heaven/)
assert.match(defendCopy, /Plant love\. Turn cheap lines toward heaven\./)
assert.doesNotMatch(defendCopy, /Cheap lines walk the Jericho road/)
assert.deepEqual(unlockedWatchAbilities(empty), ['love'])
assert.equal(
  unlockedWatchAbilities({ ...empty, held: ['wb-creed'] }).includes('logic'),
  true,
)
assert.equal(
  unlockedWatchAbilities({ ...empty, completed: ['ob-tuning'] }).includes('science'),
  true,
)
assert.equal(heavenPoint({ x: 0, y: 0 }, 1).x, 572)
assert.match(
  readFileSync(new URL('../src/lib/defend.ts', import.meta.url), 'utf8'),
  /abilityRange/,
)
assert.match(hubSrc, /night-watch-glow/)
assert.match(hubSrc, /night-watch-gems/)
assert.match(hubSrc, /AbilityMark/)
assert.match(hubSrc, /WATCH_TOOLS\.map/)
assert.match(hubSrc, /Learn · hold · deploy/)
assert.match(hubSrc, /is-held/)
assert.match(hubSrc, /held\./)
assert.match(
  readFileSync(new URL('../src/lib/defend.ts', import.meta.url), 'utf8'),
  /prefersReducedMotion/,
)
assert.match(
  readFileSync(new URL('../src/store/ProgressProvider.tsx', import.meta.url), 'utf8'),
  /cleared: current\.defense\.cleared \+ 1/,
)
assert.match(burstSrc, /Locked!/)
assert.match(burstSrc, /stamp = 'Locked!'/)
assert.match(burstSrc, /win-gem/)
assert.match(juiceSrc, /GEM_BURST/)
assert.match(cssSrc, /win-gem/)
assert.match(cssSrc, /\.gem-lamp/)
assert.match(cssSrc, /city-beat-gems/)
assert.match(cssSrc, /defend-blast-ring/)
assert.match(cssSrc, /defend-shake/)
assert.match(cssSrc, /defend-board/)
assert.match(cssSrc, /defend-lantern/)
assert.match(cssSrc, /night-watch-glow/)
assert.match(sequenceSrc, /progressive && !live/)

const gemSrc = readFileSync(new URL('../src/components/GemMark.tsx', import.meta.url), 'utf8')
assert.match(gemSrc, /gem-art/)
assert.match(gemSrc, /assets\/gems\/heart\.png/)
assert.match(gemSrc, /assets\/gems\/ability-love\.png/)
assert.match(gemSrc, /assets\/gems\/ability-logic\.png/)
assert.match(gemSrc, /assets\/gems\/ability-reason\.png/)
assert.match(gemSrc, /assets\/gems\/ability-science\.png/)
assert.match(gemSrc, /AbilityMark/)

assert.equal(WATCH_TOOLS.length, 4)
assert.equal(WATCH_TOOLS[0].id, 'love')
assert.equal(deployFit('love', 'skeptic'), 'match')
assert.equal(deployFit('love', 'physical'), 'weak')
assert.equal(deployFit('science', 'physical'), 'match')
assert.equal(raidForWave(0, 0).kind !== 'physical', true)
assert.equal(raidForWave(2, 5).kind.length > 0, true)
assert.equal(toolTier(watchTool('love'), empty), 1)
assert.equal(abilityRange('love', 'built', empty), 640)
assert.equal(
  toolTier(watchTool('love'), {
    ...empty,
    held: ['td-watch'],
    learnings: [{ id: 'td-watch', toolId: 'love' }],
    memory: { 'td-watch': { reviews: 1 } },
  }),
  1,
)
assert.equal(
  toolTier(watchTool('love'), {
    ...empty,
    held: ['td-watch'],
    memory: { 'td-watch': { reviews: 2 } },
  }),
  2,
)
assert.equal(
  toolTier(watchTool('logic'), { ...empty, held: ['wb-creed', 'wb-early'] }),
  2,
)
assert.equal(
  toolTier(watchTool('logic'), {
    ...empty,
    held: ['wb-creed'],
    memory: { 'wb-creed': { reviews: 6 } },
  }),
  3,
)
assert.equal(
  abilityRange('logic', 'built', { ...empty, held: ['wb-creed', 'wb-early'] }),
  136,
)
assert.match(
  readFileSync(new URL('../src/components/TeachUnlock.tsx', import.meta.url), 'utf8'),
  /Lock in this line to deploy/,
)
assert.match(
  readFileSync(new URL('../src/components/Journal.tsx', import.meta.url), 'utf8'),
  /learning-store/,
)
assert.match(cssSrc, /learning-store/)
assert.equal(toolForEvidence('ph-road')?.id, 'love')
assert.equal(toolForEvidence('wb-creed')?.id, 'logic')
assert.equal(WALKER_LABEL.skeptic, 'Skeptic')
assert.equal(WALKER_LABEL.physical, 'Physical')
assert.match(
  cssSrc,
  /\.defend-abilities \{[\s\S]*?grid-template-columns: repeat\(2, minmax\(0, 1fr\)\)/,
)
assert.match(
  cssSrc,
  /\.defend-frame \{[\s\S]*?overflow: hidden/,
)
assert.match(
  cssSrc,
  /\.defend-abilities \{[\s\S]*?flex: 0 0 auto/,
)
assert.match(
  cssSrc,
  /\.defend-abilities \{[\s\S]*?z-index: 3/,
)
assert.match(cssSrc, /height: min\(34vh, 220px\)/)
assert.match(cssSrc, /defend-ability-pop/)
assert.match(cssSrc, /city-tap/)
assert.match(cssSrc, /lantern-breathe/)
assert.match(
  cssSrc,
  /\.is-puzzle \.play\.is-build \.result \{[\s\S]*?position: static/,
)
assert.match(cssSrc, /match-recover/)
assert.match(defendSkySrc, /preserveAspectRatio="xMidYMid meet"/)
assert.match(defendNightSrc, /walkerSrc/)
assert.match(
  readFileSync(new URL('../src/components/Avatar.tsx', import.meta.url), 'utf8'),
  /portrait-river/,
)
assert.doesNotMatch(
  readFileSync(new URL('../src/components/Avatar.tsx', import.meta.url), 'utf8'),
  /HairCap/,
)
assert.match(plotArtSrc, /is-tapped/)
assert.match(
  readFileSync(new URL('../src/components/Welcome.tsx', import.meta.url), 'utf8'),
  /is-alive/,
)
assert.match(
  readFileSync(new URL('../src/components/Welcome.tsx', import.meta.url), 'utf8'),
  /welcome-version/,
)
assert.match(
  readFileSync(new URL('../src/components/Settings.tsx', import.meta.url), 'utf8'),
  /whats-new/,
)
assert.equal(APP_VERSION, '1.4.240')
assert.equal(CAST.river.name, 'River')
assert.equal(CAST.juniper.name, 'Juniper Wick')
assert.equal(CAST.mercy.name, 'Mercy Wren')
assert.equal(CAST.silas.name, 'Silas Whitman')
assert.equal(CAST.nora.name, 'Nora Skye')
assert.equal(CAST.nora.role, 'Sky-watch keeper')
assert.equal(CAST.ansel.name, 'Ansel Gate')
assert.equal(CAST.ansel.role, 'Swinging-arch keeper')
assert.equal(CAST.ansel.id, 'ansel')
assert.equal(CAST.ansel.areaId, 'first-gate')
assert.equal(parableHollow.id, 'parable-hollow')
assert.equal(parableHollow.title, 'Story Creek')
assert.equal(parableHollow.shortTitle, 'Creek')
assert.equal(parableHollow.subtitle, 'Jesus stories that stick')
assert.equal(witnessBench.id, 'witness-bench')
assert.equal(witnessBench.title, 'Witness Square')
assert.equal(witnessBench.shortTitle, 'Witness')
assert.equal(witnessBench.subtitle, 'What can we know about events we did not see?')
assert.equal(observatory.id, 'observatory')
assert.equal(observatory.title, 'Sky Watch')
assert.equal(observatory.shortTitle, 'Sky')
assert.equal(firstGate.id, 'first-gate')
assert.equal(firstGate.title, 'Why Gate')
assert.equal(firstGate.shortTitle, 'Why')
assert.equal(firstGate.subtitle, 'Why is there a world at all?')
assert.equal(highLookout.id, 'high-lookout')
assert.equal(highLookout.title, 'Meaning Ridge')
assert.equal(highLookout.shortTitle, 'Meaning')
assert.equal(highLookout.subtitle, 'Mind, duty, meaning, and beauty')
assert.equal(CITY_PLOTS.find((plot) => plot.id === 'hollow')?.title, 'Story Creek')
assert.equal(CITY_PLOTS.find((plot) => plot.id === 'hollow')?.areaId, 'parable-hollow')
assert.equal(CITY_PLOTS.find((plot) => plot.id === 'bench')?.title, 'Witness Square')
assert.equal(CITY_PLOTS.find((plot) => plot.id === 'bench')?.areaId, 'witness-bench')
assert.equal(CITY_PLOTS.find((plot) => plot.id === 'observatory')?.title, 'Sky Watch')
assert.equal(CITY_PLOTS.find((plot) => plot.id === 'observatory')?.areaId, 'observatory')
assert.equal(CITY_PLOTS.find((plot) => plot.id === 'gate')?.title, 'Why Gate')
assert.equal(CITY_PLOTS.find((plot) => plot.id === 'gate')?.areaId, 'first-gate')
assert.equal(CITY_PLOTS.find((plot) => plot.id === 'lookout')?.title, 'Meaning Ridge')
assert.equal(CITY_PLOTS.find((plot) => plot.id === 'lookout')?.areaId, 'high-lookout')
assert.equal(plotTag('hollow'), 'Story Creek')
assert.equal(plotTag('bench'), 'Witness Square')
assert.equal(plotTag('observatory'), 'Sky Watch')
assert.equal(plotTag('gate'), 'Why Gate')
assert.equal(plotTag('lookout'), 'Meaning Ridge')
assert.equal(easyPlotTag('hollow'), 'Story Creek')
assert.equal(easyPlotTag('bench'), 'Witness Square')
assert.equal(easyPlaceSub('hollow'), 'Story Creek · Jesus stories')
assert.equal(easyPlaceSub('bench'), 'Witness Square · public names')
assert.equal(easyPlaceSub('observatory'), 'Nora’s Sky Watch')
assert.equal(easyPlaceSub('gate'), 'Swinging Arch · Bedrock Step')
assert.equal(easyPlaceSub('lookout'), 'Hope’s Meaning Ridge')
assert.equal(LOT_STORY.gate.path, 'Why a world')
assert.match(LOT_STORY.hollow.whyHard, /^Story Creek /)
assert.match(LOT_STORY.bench.whyHard, /^Witness Square /)
assert.match(LOT_STORY.observatory.whyHard, /^Sky Watch /)
assert.match(LOT_STORY.gate.whyHard, /^Why Gate /)
assert.match(LOT_STORY.lookout.whyHard, /^Meaning Ridge /)
assert.equal(CAST.hope.name, 'Hope Ridge')
assert.equal(CAST.hope.role, 'Meaning-ridge keeper')
assert.equal(CAST.juniper.id, 'juniper')
assert.equal(CAST.silas.id, 'silas')
assert.equal(
  STREET_CHALLENGE.nodes.find((node) => node.id === 'person-silas')?.text,
  'Silas Whitman',
)
assert.equal(
  STREET_CHALLENGE.nodes.find((node) => node.id === 'person-juniper')?.text,
  'Juniper Wick',
)
assert.equal(latestChange(APP_VERSION).version, APP_VERSION)
assert.equal(CONTENT_PACKS[0]?.id, 'core-v0')
assert.ok(CONTENT_PACKS[0]?.areaIds.includes('observatory'))
assert.ok(CONTENT_PACKS[0]?.areaIds.includes('ink-court'))
assert.ok(CHANGELOG.some((note) => note.title === 'TS peels for cheap hops'))
assert.match(
  readFileSync(new URL('../src/components/Hub.tsx', import.meta.url), 'utf8'),
  /is-inhabited/,
)
assert.match(
  readFileSync(new URL('../src/components/CityMap.tsx', import.meta.url), 'utf8'),
  /city-welcome-folk/,
)
assert.match(
  readFileSync(new URL('../src/components/CityMap.tsx', import.meta.url), 'utf8'),
  /is-alive/,
)
assert.match(cssSrc, /defend-ability-tier/)
assert.match(
  readFileSync(new URL('../src/lib/watchTools.ts', import.meta.url), 'utf8'),
  /Add later tools as rows/,
)
assert.match(gemSrc, /ability: string/)
assert.match(gemSrc, /watchTool\(ability\)\?\.gem/)
assert.match(
  readFileSync(new URL('../src/components/StoredLine.tsx', import.meta.url), 'utf8'),
  /Stored learning/,
)
assert.match(
  readFileSync(new URL('../src/components/StoredLine.tsx', import.meta.url), 'utf8'),
  /Say this out loud/,
)
assert.match(challengeSrc, /StoredLine/)
assert.match(cssSrc, /\.stored-line/)
assert.match(cssSrc, /\.memory-pipe/)
assert.match(
  readFileSync(new URL('../src/lib/learning.ts', import.meta.url), 'utf8'),
  /Acquire → Anchor → Picture → Store/,
)
assert.match(cssSrc, /object-fit: contain/)
assert.match(mapSrc, /city-map-hint/)
assert.match(cssSrc, /town-tools/)

assert.equal(STREET_CHALLENGE.kind, 'link')
assert.equal(STREET_CHALLENGE.id, 'ln-street')
assert.deepEqual([...STREET_LIGHTS], ['ph-road', 'wb-creed', 'daily-lantern'])
assert.equal(STREET_CHALLENGE.triples.length, STREET_TRIPLES.length)
assert.ok(STREET_CHALLENGE.triples.length > 3, 'Hard street is more than the early three triples')
assert.equal(STREET_CHALLENGE.triples.length, 45)
assert.equal(STREET_FACT_IDS.length, 45)
assert.equal(earnedTier('porch', empty), 1)
assert.equal(earnedTier('porch', afterDaily), 2)
assert.equal(earnedTier('hollow', hollowTwice), 3)
assert.equal(earnedTier('hollow', grown), 4)
assert.equal(earnedTier('journal', grown), 4)
{
  const managed = { ...afterDaily, cityBuilt: emptyCityBuilt() }
  assert.equal(appliedTier('porch', managed), 1)
  assert.equal(canUpgrade('porch', managed), true)
  const raised = applyUpgrade(managed, 'porch')
  assert.equal(appliedTier('porch', raised), 2)
  assert.equal(canUpgrade('porch', raised), false)
  assert.equal(applyUpgrade(raised, 'porch'), raised)
}
assert.equal(WORDS.upgrade.teach.includes('learning'), true)
assert.match(WORDS.upgrade.teach, /not by paying/)
assert.match(WORDS.deploy.teach, /claim you held/)
assert.match(
  readFileSync(new URL('../src/components/MindMap.tsx', import.meta.url), 'utf8'),
  /Build this/,
)
assert.match(mapSrc, /is-city-build/)
assert.match(plotArtSrc, /BUILD_SCALE/)
assert.match(cssSrc, /city-plot-tag/)
assert.match(cssSrc, /build-upgrade/)
assert.match(
  readFileSync(new URL('../src/components/Hub.tsx', import.meta.url), 'utf8'),
  /Manage/,
)
assert.deepEqual(
  Object.keys(LOT_STORY).sort(),
  ['bench', 'gate', 'hollow', 'journal', 'lamps', 'lookout', 'observatory', 'porch'],
)
assert.match(LOT_STORY.hollow.whyEasy, /creek/)
assert.match(LOT_STORY.bench.whyEasy, /square|ledger/)
assert.match(LOT_STORY.porch.whyEasy, /lamp/)
assert.match(LOT_STORY.observatory.whyHard, /telescope|ridge|sky/)
assert.match(STREET_CHALLENGE.context, /creek/)
assert.match(STREET_WHYS['mercy-hollow'].easy, /creek/)
assert.match(STREET_WHYS['silas-bench'].easy, /square|ledger/)
assert.match(STREET_WHYS['juniper-porch'].easy, /lamp|porch/)
assert.match(TOWN_PATH_EASY, /Porch lamp/)
assert.match(TOWN_PATH_EASY, /Manage/)
assert.match(TOWN_PATH_EASY, /Build this/)
assert.match(mapSrc, /TOWN_PATH_HARD/)
assert.match(plotArtSrc, /EASY_TAG_SLOT/)
assert.match(mapSrc, /setMindPlot\(id\)/)
assert.match(hubSrc, /EASY\.matchCta/)
assert.match(TOWN_PATH_HARD, /Heaven/)
assert.match(mapSrc, /TOWN_PATH_HARD/)
assert.match(
  readFileSync(new URL('../src/components/Landmark.tsx', import.meta.url), 'utf8'),
  /Story Creek/,
)
assert.match(
  readFileSync(new URL('../src/components/Landmark.tsx', import.meta.url), 'utf8'),
  /observatory: \{ label: 'Sky Watch'/,
)
assert.match(
  readFileSync(new URL('../src/components/Landmark.tsx', import.meta.url), 'utf8'),
  /gate: \{ label: 'Why Gate'/,
)
assert.match(
  readFileSync(new URL('../src/components/Landmark.tsx', import.meta.url), 'utf8'),
  /lookout: \{ label: 'Meaning Ridge'/,
)
assert.doesNotMatch(
  readFileSync(new URL('../src/components/Landmark.tsx', import.meta.url), 'utf8'),
  /cracked dome/,
)
assert.match(
  readFileSync(new URL('../src/components/Hub.tsx', import.meta.url), 'utf8'),
  /street-lot-why/,
)
assert.match(cssSrc, /street-whys/)
assert.match(STREET_CHALLENGE.nodes.find((node) => node.id === 'idea-mercy')?.text ?? '', /Neighbor/)
assert.equal(ideaUnlocked(empty, 'ph-road'), false)
assert.equal(ideaUnlocked({ ...empty, completed: ['ln-street'] }, 'ph-road'), true)
assert.equal(ideaUnlocked({ ...empty, held: ['wb-creed'] }, 'wb-creed'), true)
assert.equal(mindMapHasLit('hollow', { ...empty, completed: ['ln-street'] }), true)
assert.equal(mindGraph('hollow', { ...empty, completed: ['ph-road'] }).ideas.some((item) => item.id === 'ph-road' && item.lit), true)

const linkPlaySrc = readFileSync(
  new URL('../src/components/challenges/LinkPlay.tsx', import.meta.url),
  'utf8',
)
assert.match(linkPlaySrc, /is-link/)
assert.match(linkPlaySrc, /Try again/)
assert.match(linkPlaySrc, /match-recover/)
assert.match(linkPlaySrc, /setStatus\('idle'\)/)
assert.match(linkPlaySrc, /link-block/)
assert.match(linkPlaySrc, /All 3 links complete/)
assert.match(linkPlaySrc, /This link is complete/)
assert.match(linkPlaySrc, /WinBurst/)
assert.match(linkPlaySrc, /EASY\.matchDone/)
assert.match(linkPlaySrc, /EASY\.holdNext/)
assert.match(linkPlaySrc, /btn primary xl link-next/)
assert.match(linkPlaySrc, /EASY\.home/)
assert.match(linkPlaySrc, /onEasyStop/)
assert.match(linkPlaySrc, /kind === 'idea'/)
assert.doesNotMatch(linkPlaySrc, /setStep\('idea'\)\s*\n\s*setScreen\('choose'\)/)
assert.match(linkPlaySrc, /wizard-step/)
assert.match(linkPlaySrc, /EASY\.connectLink/)
assert.match(linkPlaySrc, /This one/)
assert.match(linkPlaySrc, /scrollIntoView/)
assert.match(linkPlaySrc, /is-not/)
assert.match(linkPlaySrc, /'choose' \| 'miss'/)
assert.doesNotMatch(linkPlaySrc, /'choose' \| 'miss' \| 'next'/)
assert.match(linkPlaySrc, /wantId/)
assert.match(linkPlaySrc, /is-wizard/)
assert.match(linkPlaySrc, /is-picture/)
assert.match(linkPlaySrc, /PlaceGlyph/)
assert.match(linkPlaySrc, /size="xl"/)
assert.match(linkPlaySrc, /streetDecoyNodes/)
assert.match(linkPlaySrc, /linkPicture/)
assert.match(linkPlaySrc, /Tonight’s street/)
assert.match(linkPlaySrc, /streetBeat/)
assert.match(linkPlaySrc, /link-art/)
assert.match(linkPlaySrc, /MATCH_ART/)
assert.match(linkPlaySrc, /neighbor-shows-mercy|matchArt/)
assert.match(cssSrc, /\.link-art/)
assert.doesNotMatch(cssSrc, /is-photo/)
assert.ok(
  existsSync(new URL('../src/assets/match/neighbor-shows-mercy.png', import.meta.url)),
  'Neighbor shows mercy Match art',
)
assert.match(
  readFileSync(new URL('../src/content/matchArt.ts', import.meta.url), 'utf8'),
  /ph-road/,
)
assert.match(
  readFileSync(new URL('../src/components/MatchScene.tsx', import.meta.url), 'utf8'),
  /mercy-road/,
)
assert.match(linkPlaySrc, /linkCaption/)
assert.match(linkPlaySrc, /linkClue/)
assert.match(linkPlaySrc, /linkMiss/)
assert.match(linkPlaySrc, /link-clue/)
assert.match(linkPlaySrc, /link-dock/)
assert.match(linkPlaySrc, /Wrong lot/)
assert.doesNotMatch(linkPlaySrc, /Those don/)
{
  const mercy = STREET_CHALLENGE.nodes.find((node) => node.id === 'idea-mercy')
  const creed = STREET_CHALLENGE.nodes.find((node) => node.id === 'idea-silas')
  const lamp = STREET_CHALLENGE.nodes.find((node) => node.id === 'idea-juniper')
    assert.equal(linkPicture(mercy, STREET_CHALLENGE).art, 'ph-road')
  assert.equal(linkPicture(mercy, STREET_CHALLENGE).plotId, undefined)
  assert.equal(linkPicture(creed, STREET_CHALLENGE).plotId, 'bench')
  assert.equal(linkPicture(lamp, STREET_CHALLENGE).plotId, 'porch')
  const creek = STREET_CHALLENGE.nodes.find((node) => node.id === 'place-hollow')
  assert.equal(linkPicture(creek, STREET_CHALLENGE).plotId, 'hollow')
  assert.equal(linkPicture(creek, STREET_CHALLENGE).art, undefined)
  assert.match(linkCaption(mercy, true), /mercy/i)
  assert.doesNotMatch(linkCaption(creed, false), /Paul hands on/)
  assert.match(linkClue('mercy-hollow', 'idea'), /Mercy|neighbor|road/)
  assert.match(linkClue('silas-bench', 'place'), /square/)
  assert.match(linkClue('juniper-porch', 'person'), /Juniper|porch/)
  assert.equal(easyWrongTap('Neighbor is the one who shows mercy.'), 'Wrong. Tap this one: Neighbor is the one who shows mercy.')
  assert.equal(linkMiss('mercy-hollow', 'idea'), easyWrongTap('Neighbor is the one who shows mercy.'))
  assert.doesNotMatch(linkMiss('mercy-hollow', 'idea'), /Tap This one\. Tap:/)
  assert.doesNotMatch(linkMiss('mercy-hollow', 'idea'), /neighbor-line/)
  assert.doesNotMatch(linkMiss('mercy-hollow', 'idea'), /This story is Mercy/)
  assert.match(linkMiss('silas-bench', 'place'), /^Wrong\. Tap this one: .+\.$/)
  assert.match(linkMiss('juniper-porch', 'person'), /^Wrong\. Tap this one: .+\.$/)
  const father = STREET_CHALLENGE.nodes.find((node) => node.id === 'idea-father')
  const women = easyStreetChallenge('wb-women').nodes.find((node) => node.id === 'idea-women')
  const stars = easyStreetChallenge('daily-stars').nodes.find((node) => node.id === 'idea-stars')
  const cosmos = easyStreetChallenge('daily-cosmos').nodes.find((node) => node.id === 'idea-cosmos')
  const moral = easyStreetChallenge('hl-moral').nodes.find((node) => node.id === 'idea-moral')
  const sky = easyStreetChallenge('daily-stars').nodes.find((node) => node.id === 'place-sky')
  const gate = easyStreetChallenge('daily-cosmos').nodes.find((node) => node.id === 'place-gate')
  const ridge = easyStreetChallenge('hl-moral').nodes.find((node) => node.id === 'place-lookout')
  assert.equal(streetTripleForLine('ph-father'), 'father-hollow')
  assert.equal(linkCaption(women, true), 'Women first saw the tomb.')
  assert.equal(linkCaption(stars, true), 'The heavens speak of a Maker.')
  assert.equal(linkCaption(cosmos, true), 'The world did not have to exist.')
  assert.equal(linkCaption(moral, true), 'Duty is more than taste.')
  assert.equal(linkPicture(stars, easyStreetChallenge('daily-stars')).plotId, 'observatory')
  assert.equal(linkPicture(cosmos, easyStreetChallenge('daily-cosmos')).plotId, 'gate')
  assert.equal(linkPicture(moral, easyStreetChallenge('hl-moral')).plotId, 'lookout')
  assert.equal(linkPicture(sky, easyStreetChallenge('daily-stars')).plotId, 'observatory')
  assert.equal(linkPicture(gate, easyStreetChallenge('daily-cosmos')).plotId, 'gate')
  assert.equal(linkPicture(ridge, easyStreetChallenge('hl-moral')).plotId, 'lookout')
  assert.equal(father?.evidenceId, 'ph-father')
  assert.match(linkClue('father-hollow', 'idea'), /father/)
  assert.match(linkClue('nora-sky', 'place'), /Sky Watch/)
  assert.match(linkMiss('father-hollow', 'idea'), /father runs with mercy/)
  assert.doesNotMatch(plainFor('daily-stars')?.teach ?? '', /multiverse/)
  assert.doesNotMatch(STREET_WHYS['nora-sky'].hard, /multiverse/)
  assert.match(STREET_WHYS['tuning-sky'].hard, /Designer/)
}
assert.match(
  readFileSync(new URL('../src/components/MindMap.tsx', import.meta.url), 'utf8'),
  /mind-map-dock/,
)
assert.match(
  readFileSync(new URL('../src/components/MindMap.tsx', import.meta.url), 'utf8'),
  /createPortal/,
)
assert.match(cssSrc, /position:\s*fixed/)
assert.match(cssSrc, /mind-map-dock/)
assert.match(cssSrc, /link-dock/)
assert.match(cssSrc, /cta-dock/)
assert.match(cssSrc, /is-easy-hold/)
{
  const dockCss = cssSrc.match(/\.cta-dock,\s*\n\.link-dock \{[\s\S]*?\n\}/)?.[0] ?? ''
  assert.match(dockCss, /rgba\(42, 13, 88, 0\.28\)/)
  assert.match(dockCss, /backdrop-filter: blur/)
  assert.doesNotMatch(dockCss, /#16062e/, 'sticky CTA docks must not be an opaque black slab')
}
assert.match(latestChange(APP_VERSION).items.join('\n'), /Story Snap|≤720|HUD|eyebrow|who·where|strip|pad/i)
{
  const storyCardCss = cssSrc.match(/\.easy-story-card,[\s\S]*?\.easy-story-card::before \{[\s\S]*?\n\}/)?.[0] ?? ''
  assert.match(storyCardCss, /border:\s*0/)
  assert.match(storyCardCss, /background:\s*transparent/)
  assert.match(storyCardCss, /content:\s*none/)
}
assert.match(cssSrc, /city-lock-toast/)
assert.match(
  readFileSync(new URL('../src/components/RecallGate.tsx', import.meta.url), 'utf8'),
  /cta-dock/,
)
{
  const fresh = emptyProgress()
  const benchWhy = lotTapWhy(
    'bench',
    fresh,
    true,
    false,
    'This street is locked. Finish 2 Jesus stories at the creek (0/2), then the square opens.',
    false,
  )
  assert.match(benchWhy ?? '', /locked/)
  assert.match(benchWhy ?? '', /2/)
  assert.equal(lotTapWhy('porch', fresh, true, true, '', false), null)
}

const puzzleSrc = readFileSync(
  new URL('../src/components/PuzzlePlay.tsx', import.meta.url),
  'utf8',
)
assert.match(puzzleSrc, /kind === 'link'/)
assert.match(puzzleSrc, /LinkPlay/)
assert.match(puzzleSrc, /GemSearchPlay/)
assert.match(puzzleSrc, /isEasy\(progress\)/)
assert.match(puzzleSrc, /SourceDigPlay/)
assert.match(puzzleSrc, /source-dig/)
assert.match(cssSrc, /gem-board/)
assert.match(cssSrc, /gem-cell\.is-burst/)
assert.match(cssSrc, /gem-shard/)

assert.match(teachSrc, /Unlock the links/)
assert.match(hubSrc, /Link the street/)
assert.match(hubSrc, /name: 'link'/)
assert.match(hubSrc, /street-link/)
assert.match(hubSrc, /Manage/)
assert.match(hubSrc, /setMindPlot/)
assert.match(hubSrc, /town-tools/)
assert.match(hubSrc, /RecallOffer/)
assert.match(
  readFileSync(new URL('../src/components/RecallOffer.tsx', import.meta.url), 'utf8'),
  /easyFacingLine/,
)
assert.match(hubSrc, /skipNotToday/)
assert.doesNotMatch(hubSrc, /dustOff/)
assert.match(
  readFileSync(new URL('../src/components/RecallOffer.tsx', import.meta.url), 'utf8'),
  /RECALL_SESSION_CAP/,
)
assert.match(
  readFileSync(new URL('../src/content/changelog.ts', import.meta.url), 'utf8'),
  /TS peels for cheap hops/,
)
assert.match(mapSrc, /setMindPlot/)
assert.match(mapSrc, /MindMap/)
assert.match(plotArtSrc, /EASY_TAG_SLOT/)
assert.match(mapSrc, /setMindPlot\(id\)/)
assert.match(plotArtSrc, /city-plot-hit/)
assert.match(
  readFileSync(new URL('../src/components/MindMap.tsx', import.meta.url), 'utf8'),
  /mind-map/,
)
assert.match(
  readFileSync(new URL('../src/components/LinkScreen.tsx', import.meta.url), 'utf8'),
  /Unlock the links/,
)
assert.match(
  readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8'),
  /view\.name === 'link'/,
)
assert.match(cssSrc, /mind-map/)
assert.match(cssSrc, /mind-web/)
assert.match(cssSrc, /link-grid/)
assert.match(cssSrc, /street-link/)
assert.match(cssSrc, /play\.is-link/)

const deeperSrc = readFileSync(new URL('../src/content/deeper.ts', import.meta.url), 'utf8')
assert.doesNotMatch(deeperSrc, /Rees/)
assert.doesNotMatch(deeperSrc, /Penrose/)
assert.doesNotMatch(deeperSrc, /infidels\.org/)
assert.doesNotMatch(deeperSrc, /reddit\.com/)
assert.doesNotMatch(deeperSrc, /wikipedia\.org/)
assert.doesNotMatch(deeperSrc, /Ehrman/)
assert.match(deeperSrc, /journalOnly/)
assert.match(deeperSrc, /Habermas/)
assert.match(deeperSrc, /Licona/)
assert.match(deeperSrc, /Robin Collins/)
assert.match(deeperSrc, /Edward Feser|Feser/)
assert.match(deeperSrc, /Philoponus/)
assert.match(deeperSrc, /Ghazālī|Ghazali/)
assert.doesNotMatch(deeperSrc, /Pre-Reformation/)
assert.doesNotMatch(deeperSrc, /pre-Reform/)
assert.equal(eraLabel('classic'), 'Classic')
assert.equal(eraLabel('modern'), 'Modern · believing')
assert.equal(eraLabel('scripture'), 'Scripture')
assert.equal(eraLabel('ancient'), 'Ancient')

const digParked = /^(papr-|aa-|psw-)/
for (const id of allEvidenceIds()) {
  if (digParked.test(id)) continue
  assert.ok(
    deeperLinksFor(id).length > 0,
    `Dig deeper missing for ${id}`,
  )
  assert.notEqual(deeperLinksFor(id)[0]?.era, 'modern', `${id} must not lead with a modern voice`)
}

const creed = deeperLinksFor('wb-creed')
assert.match(creed[0]?.href ?? '', /Corinthians/)
assert.match(creed[0]?.label ?? '', /1 Corinthians 15:3/)
assert.ok(creed.some((link) => /Ignatius|Smyrnaeans/.test(link.label)))
assert.ok(creed.some((link) => /Habermas/.test(link.label)))
assert.ok(
  creed.findIndex((link) => /Habermas/.test(link.label)) >
    creed.findIndex((link) => /Ignatius/.test(link.label)),
)

const stars = deeperLinksFor('daily-stars')
assert.ok(stars.every((link) => !/Collins|Rees|Feser|Craig|rintintin|reasonablefaith/i.test(`${link.label} ${link.href}`)))
assert.ok(stars.some((link) => /Psalm/.test(link.href)))
assert.ok(stars.some((link) => /Athanasius/.test(link.label)))

const tuning = deeperLinksFor('ob-tuning')
assert.ok(tuning.some((link) => /summa\/1002/.test(link.href)))
assert.ok(tuning.some((link) => /Collins/.test(link.label)))
assert.ok(tuning.every((link) => !/Rees|Penrose/i.test(`${link.label} ${link.href}`)))

const firstWay = deeperLinksFor('fg-mover')
assert.ok(firstWay.some((link) => /Aristotle/.test(link.label)))
assert.ok(firstWay.some((link) => /Feser/.test(link.label)))
assert.ok(
  firstWay.findIndex((link) => /Feser/.test(link.label)) >
    firstWay.findIndex((link) => /Aquinas/.test(link.label)),
)

const kalam = deeperLinksFor('fg-kalam')
assert.ok(kalam.some((link) => /Philoponus/.test(link.label)))
assert.ok(kalam.some((link) => /Ghaz/.test(link.label)))
assert.ok(kalam.some((link) => /Craig/.test(link.label)))
assert.ok(
  kalam.findIndex((link) => /Craig/.test(link.label)) >
    kalam.findIndex((link) => /Ghaz/.test(link.label)),
)

const womenHold = deeperLinksFor('wb-women', 'hold')
assert.ok(womenHold.every((link) => !/Tacitus|Josephus/i.test(link.label)))
const womenJournal = deeperLinksFor('wb-women', 'journal')
assert.ok(womenJournal.some((link) => /Tacitus/.test(link.label)))
assert.ok(womenJournal.some((link) => /Josephus/.test(link.label)))

const isaiah = deeperLinksFor('daily-isaiah')
assert.ok(isaiah.some((link) => /Isaiah/.test(link.href)))
assert.ok(isaiah.some((link) => /City of God XVIII/.test(link.label)))

assert.doesNotMatch(
  readFileSync(new URL('../src/components/DigDeeper.tsx', import.meta.url), 'utf8'),
  /Pre-Reformation|pre-Reform/,
)
const changelogSrc = readFileSync(new URL('../src/content/changelog.ts', import.meta.url), 'utf8')
assert.doesNotMatch(changelogSrc, /modern believing scholars only/)
assert.doesNotMatch(changelogSrc, /Pre-Reformation|pre-Reform/)
assert.match(changelogSrc, /TS peels for cheap hops/)
assert.match(
  readFileSync(new URL('../src/components/StoredLine.tsx', import.meta.url), 'utf8'),
  /DigDeeper/,
)
assert.match(
  readFileSync(new URL('../src/components/Journal.tsx', import.meta.url), 'utf8'),
  /DigDeeper/,
)
assert.match(
  readFileSync(new URL('../src/components/MindMap.tsx', import.meta.url), 'utf8'),
  /DigDeeper/,
)
assert.match(
  readFileSync(new URL('../src/components/Profile.tsx', import.meta.url), 'utf8'),
  /DigDeeper/,
)
assert.match(
  readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8'),
  /view\.name === 'profile'/,
)
assert.match(hubSrc, /name: 'profile'/)
assert.doesNotMatch(hubSrc, /Reset progress/)
assert.doesNotMatch(hubSrc, />Reset</)
assert.match(cssSrc, /\.dig-deeper/)
assert.match(cssSrc, /\.profile-unlock/)
assert.match(cssSrc, /max-width: 390px/)

const inv = profileInventory({
  ...empty,
  held: ['ph-road'],
  completed: ['ph-road', 'ln-street'],
  learnings: [],
  defense: { cleared: 0, nights: [] },
  theme: 'candy',
  easyMode: false,
})
assert.ok(inv.ideas.some((item) => item.id === 'ph-road'))
assert.equal(inv.streetLinked, true)
assert.ok(inv.links.length >= 3)
assert.ok(inv.places.some((plot) => plot.id === 'porch'))

assert.match(
  readFileSync(new URL('../src/content/plain.ts', import.meta.url), 'utf8'),
  /old shared belief/,
)
assert.match(
  readFileSync(new URL('../src/content/plain.ts', import.meta.url), 'utf8'),
  /Jesus story/,
)
assert.match(
  readFileSync(new URL('../src/lib/easyUi.ts', import.meta.url), 'utf8'),
  /Town \(soon\)/,
)
assert.match(
  readFileSync(new URL('../src/lib/easyUi.ts', import.meta.url), 'utf8'),
  /scrapbook of matches/,
)
const easyUiSrc = readFileSync(new URL('../src/lib/easyUi.ts', import.meta.url), 'utf8')
assert.match(easyUiSrc, /Read today’s story/)
assert.match(easyUiSrc, /Tap the main idea you kept/)
assert.match(easyUiSrc, /Tap why this is true/)
assert.match(easyUiSrc, /A reason is why this is true/)
assert.match(easyUiSrc, /Tap the sentence, then the place, then the person/)
assert.match(
  readFileSync(new URL('../src/lib/easy.ts', import.meta.url), 'utf8'),
  /Tap this next — short Jesus story/,
)
assert.match(easyUiSrc, /Save your picks/)
assert.match(
  readFileSync(new URL('../src/lib/easy.ts', import.meta.url), 'utf8'),
  /easyFacingLine/,
)
assert.match(easyUiSrc, /why this is true/)
assert.match(
  readFileSync(new URL('../src/lib/easy.ts', import.meta.url), 'utf8'),
  /easyJournalMeta/,
)
assert.match(
  readFileSync(new URL('../src/lib/easy.ts', import.meta.url), 'utf8'),
  /used as/,
)
assert.match(easyUiSrc, /Tap the sentence, then the place, then the person/)
assert.match(
  readFileSync(new URL('../src/lib/easy.ts', import.meta.url), 'utf8'),
  /Wrong\. Tap this one: \$\{label\}/,
)
assert.match(easyUiSrc, /Keep the right pictures/)
assert.match(
  readFileSync(new URL('../src/components/DigDeeper.tsx', import.meta.url), 'utf8'),
  /EASY\.reasonSense/,
)
assert.match(defendAbilitySrc, /easyFacingLine/)
assert.doesNotMatch(
  readFileSync(new URL('../src/content/plain.ts', import.meta.url), 'utf8'),
  /Keep the pictures\. Toss the slogans/,
)
assert.match(
  readFileSync(new URL('../src/lib/words.ts', import.meta.url), 'utf8'),
  /Toss the wrong picks/,
)
assert.match(
  readFileSync(new URL('../src/lib/cityBuild.ts', import.meta.url), 'utf8'),
  /easyPlotTag/,
)
assert.match(
  readFileSync(new URL('../src/lib/cityBuild.ts', import.meta.url), 'utf8'),
  /Story Creek/,
)
assert.match(
  readFileSync(new URL('../src/lib/cityBuild.ts', import.meta.url), 'utf8'),
  /Witness Square/,
)
assert.match(
  readFileSync(new URL('../src/lib/cityBuild.ts', import.meta.url), 'utf8'),
  /East porch/,
)
assert.match(
  readFileSync(new URL('../src/lib/cityBuild.ts', import.meta.url), 'utf8'),
  /Star lamps/,
)
assert.equal(easyPlotTag('lamps'), 'Star lamps')
assert.equal(easyPlotTag('journal'), 'Pages')
{
  const fit = easyTagsFit()
  assert.equal(fit.ok, true, fit.reason)
}
assert.match(cssSrc, /aspect-ratio: 640 \/ 420/)
assert.doesNotMatch(cssSrc, /min-height: 340px/)
assert.match(cssSrc, /html\[data-easy='on'\] \.city-plot-tag/)
assert.match(sortSrc, /EASY\.lockIn/)
assert.match(
  readFileSync(new URL('../src/components/TeachUnlock.tsx', import.meta.url), 'utf8'),
  /Skip reading/,
)
assert.doesNotMatch(hubSrc, /easyTapNext/)
assert.doesNotMatch(hubSrc, /tap-next-dock/)
assert.match(hubSrc, /is-easy-home/)
// Town soon stays parked off Easy Home (1.4.118+)
assert.match(hubSrc, /EASY\.saved/)
assert.match(hubSrc, /EASY\.matchCta/)
assert.doesNotMatch(hubSrc, /EASY\.nightSoon/)
{
  const easyHome = hubSrc.match(/is-easy-home[\s\S]*?<\/main>/)?.[0] ?? ''
  assert.match(easyHome, /easy-home-map/)
  assert.match(easyHome, /easy-home-dock/)
  assert.match(easyHome, /CityMap/)
  assert.match(easyHome, /easy-build-it/)
  assert.match(easyHome, /Build It/)
  assert.match(easyHome, /Build this/)
  assert.match(easyHome, /setPlot\(nextId\)/)
  assert.match(easyHome, /easy-coach/)
  assert.match(easyHome, /name: 'learn'/)
  assert.match(easyHome, /name: 'link'/)
  assert.match(easyHome, /EASY\.matchCta/)
  assert.match(easyHome, /EASY\.saved/)
  assert.match(easyHome, /matchReady/)
  assert.match(hubSrc, /nextGift/)
  assert.match(hubSrc, /anyUpgradeReady/)
  assert.match(cssSrc, /easy-build-it/)
  assert.match(cssSrc, /easy-home-dock/)
  assert.match(cssSrc, /\.hub\.is-easy-home \.easy-home-map[\s\S]{0,120}position:\s*absolute/)
  assert.match(cssSrc, /\.hub\.is-easy-home \.easy-home-map \.city-svg[\s\S]{0,200}max-height:\s*none/)
  assert.doesNotMatch(cssSrc, /max-height: min\(62vh, 520px\)/)
  {
    const easySvg =
      cssSrc.match(/\.hub\.is-easy-home \.easy-home-map \.city-svg \{[\s\S]*?\n\}/)?.[0] ?? ''
    assert.match(easySvg, /#c6a98b/)
    assert.match(easySvg, /#a8d070/)
    assert.doesNotMatch(easySvg, /#3a1480/, 'Easy Home map must not paint purple letterbox bands')
  }
  assert.match(easyHome, /fillStage/)
  assert.match(mapSrc, /fillStage\?:/)
  assert.match(mapSrc, /city-stage-bleed/)
  assert.match(mapSrc, /stageCam\(/)
  {
    const phone = stageCam(390 / 780)
    const lifted = stageCam(390 / 780, MAP_PLATE, 0.38)
    assert.ok(phone.y < 0, 'portrait stage adds sky above the plate')
    assert.ok(phone.y + phone.h > MAP_PLATE.y + MAP_PLATE.h, 'portrait stage adds meadow below the plate')
    assert.ok(lifted.y > phone.y, 'dock focus lifts the town above a centered camera')
    assert.ok(lifted.y <= MAP_PLATE.y + 0.01)
    assert.ok(lifted.y + lifted.h >= MAP_PLATE.y + MAP_PLATE.h - 0.01)
    assert.ok(phone.x <= MAP_PLATE.x + 0.01)
    assert.ok(phone.x + phone.w >= MAP_PLATE.x + MAP_PLATE.w - 0.01)
    assert.ok(phone.y <= MAP_PLATE.y + 0.01)
    assert.ok(Math.abs(phone.w / phone.h - 390 / 780) < 0.002)
    const wide = stageCam(2)
    assert.ok(wide.x < 0, 'wide stage adds valley beside the plate')
    assert.ok(wide.y <= MAP_PLATE.y + 0.01)
    assert.ok(wide.y + wide.h >= MAP_PLATE.y + MAP_PLATE.h - 0.01)
    const fitted = stageCam(MAP_PLATE.w / MAP_PLATE.h)
    assert.ok(Math.abs(fitted.w - MAP_PLATE.w) < 0.01)
    assert.ok(Math.abs(fitted.h - MAP_PLATE.h) < 0.01)
  }
  assert.match(cssSrc, /\.hub\.is-easy-home \.easy-extra-streets[\s\S]{0,120}display:\s*none/)
  assert.match(cssSrc, /\.hub\.is-easy-home \.easy-core[\s\S]{0,80}display:\s*none/)
  assert.match(cssSrc, /is-easy-soft/)
  assert.match(mapSrc, /xMidYMid meet/)
  assert.match(hubSrc, /easyMatchReady/)
  assert.match(easyHome, /focus === 'match' \|\| !matchReady \? 'is-now'/)
  assert.doesNotMatch(easyHome, /focus === 'learn' \|\| !matchReady/)
  assert.ok(
    easyHome.indexOf('easy-build-it') < easyHome.indexOf('easy-coach'),
    'Easy home dock: Build It before coach pills',
  )
  assert.ok(
    easyHome.indexOf('EASY.matchCta') < easyHome.indexOf('EASY.saved'),
    'Easy home order is Match before Hold',
  )
  {
    const coach = easyHome.slice(easyHome.indexOf('easy-coach'), easyHome.indexOf('easy-dock-play'))
    const iMatch = coach.indexOf('>Match<') >= 0 ? coach.indexOf('>Match<') : coach.search(/>\s*Match\s*</)
    const iLearn = coach.indexOf('>Learn<') >= 0 ? coach.indexOf('>Learn<') : coach.search(/>\s*Learn\s*</)
    const iLock = coach.search(/>\s*Lock In\s*</)
    assert.ok(iMatch >= 0 && iLearn >= 0 && iLock >= 0, 'cold coach has Match · Learn · Lock In')
    assert.ok(iMatch < iLearn && iLearn < iLock, 'cold coach order is Match → Learn → Lock In (#187)')
  }
  assert.doesNotMatch(easyHome, /Night Watch/)
  assert.doesNotMatch(easyHome, /EASY\.nightSoon/)
  assert.doesNotMatch(easyHome, /EASY\.nightDo/)
  assert.doesNotMatch(easyHome, /name: 'defend'/)
  assert.doesNotMatch(easyHome, /debugLine/)
  assert.doesNotMatch(easyHome, /mini-game jumps/)
  assert.doesNotMatch(easyHome, /debugPlayGroups/)
}
{
  const fresh = emptyProgress()
  assert.equal(easyLearnLine(fresh), 'ph-road')
  assert.equal(easyMatchLine(fresh), 'ph-road')
  assert.equal(easyHoldLine(fresh), 'ph-road')
  assert.equal(easyLoopLine(fresh), 'ph-road')
  assert.equal(easyMatchReady(fresh), true)
  assert.equal(easyHoldPractice(fresh), false)
  assert.equal(easyLineLearned(fresh, 'ph-road'), false)
  assert.equal(easyLineTaught(fresh, 'ph-road'), false)
  const hardPrior = {
    ...fresh,
    taught: ['ph-road', 'wb-creed'],
    completed: ['ph-road', 'wb-creed'],
    held: ['ph-road', 'wb-creed'],
    learnings: [{ id: 'ph-road' }],
  }
  assert.equal(easyLoopLine(hardPrior), 'ph-road')
  assert.equal(easyLearnLine(hardPrior), 'ph-road')
  assert.equal(easyMatchLine(hardPrior), 'ph-road')
  assert.equal(easyHoldLine(hardPrior), 'ph-road')
  assert.equal(easyMatchReady(hardPrior), true)
  assert.equal(easyLineHeld(hardPrior, 'ph-road'), false)
  const taughtMercy = { ...fresh, easyTaught: ['ph-road'] }
  assert.equal(easyLearnLine(taughtMercy), 'ph-road')
  assert.equal(easyMatchLine(taughtMercy), 'ph-road')
  assert.equal(easyHoldLine(taughtMercy), 'ph-road')
  assert.equal(easyMatchReady(taughtMercy), true)
  assert.equal(easyHoldPractice(taughtMercy), true)
  assert.deepEqual(easyHoldView(taughtMercy), {
    name: 'journal',
    focusId: 'ph-road',
    autoQuiz: true,
  })
  assert.equal(streetTripleForLine('ph-road'), 'mercy-hollow')
  assert.equal(easyStreetChallenge('ph-road').triples[0]?.id, 'mercy-hollow')
  assert.equal(easyStreetChallenge('ph-road').triples.length, 1)
  assert.equal(easyMatchReady({ ...fresh, completed: ['ph-road'] }), true)
  assert.equal(easyLearnLine({ ...fresh, taught: ['ph-road'], held: ['ph-road'] }), 'ph-road')
  const heldMercy = { ...fresh, easyTaught: ['ph-road'], easyHeld: ['ph-road'] }
  assert.equal(easyLineHeld(heldMercy, 'ph-road'), true)
  assert.equal(easyLearnLine(heldMercy), 'ph-father')
  assert.equal(easyMatchLine(heldMercy), 'ph-father')
  assert.equal(easyHoldLine(heldMercy), 'ph-father')
  assert.notEqual(easyLearnLine(heldMercy), 'wb-creed')
  assert.equal(easyMatchReady(heldMercy), true)
  assert.equal(easyHoldPractice(heldMercy), false)
  assert.equal(easyHomeFocus(fresh), 'match')
  assert.equal(easyHomeFocus(taughtMercy), 'hold')
  assert.equal(easyHomeFocus(heldMercy), 'match')
  const taughtFather = {
    ...fresh,
    easyTaught: ['ph-road', 'ph-father'],
    easyHeld: ['ph-road'],
  }
  assert.equal(easyLearnLine(taughtFather), 'ph-father')
  assert.equal(easyMatchLine(taughtFather), 'ph-father')
  assert.equal(easyHoldLine(taughtFather), 'ph-father')
  assert.equal(easyMatchReady(taughtFather), true)
  assert.deepEqual(markEasyTaught(fresh, 'ph-road'), ['ph-road'])
  assert.deepEqual(markEasyHeld(taughtMercy, 'ph-road'), ['ph-road'])
  assert.equal(streetTripleForLine('wb-creed'), 'silas-bench')
  assert.equal(easyStreetChallenge('wb-creed').triples[0]?.id, 'silas-bench')
  assert.equal(easyStreetChallenge('wb-creed').triples.length, 1)
  assert.deepEqual(easyWhoWhere('ph-road'), {
    who: 'Mercy',
    whoName: 'Mercy Wren',
    whoId: 'mercy',
    place: 'Story Creek',
  })
  assert.equal(easyWhoWhereLine('ph-road'), 'This idea lives at Story Creek, with Mercy.')
  assert.equal(easyWhoWhereLine('wb-creed'), 'This idea lives at Witness Square, with Silas.')
  assert.equal(easyWhoWhereLine('daily-lantern'), 'This idea lives at East porch, with Juniper.')
  assert.equal(easyWhoWhere('wb-creed').who, 'Silas')
  assert.equal(easyWhoWhere('wb-creed').place, 'Witness Square')
  assert.equal(easyWhoWhere('daily-lantern').who, 'Juniper')
  assert.equal(easyWhoWhere('daily-lantern').place, 'East porch')
  assert.equal(EASY_LINE_ORDER.length, 54)
  assert.equal(EASY_LINE_ORDER[0], 'ph-road')
  assert.equal(EASY_LINE_ORDER[1], 'ph-father')
  assert.ok(EASY_LINE_ORDER.indexOf('ph-father') < EASY_LINE_ORDER.indexOf('wb-creed'))
  assert.ok(EASY_LINE_ORDER.includes('ph-debt'))
  assert.ok(EASY_LINE_ORDER.includes('hl-moral'))
  assert.deepEqual([...DIG_ARC], ['wb-creed', 'wb-women', 'wb-early', 'wb-method'])
  assert.deepEqual([...NAMES_ARC], ['daily-names', 'daily-creed', 'daily-empty'])
  assert.deepEqual([...STONE_ARC], ['sc-tacitus', 'sc-james', 'sc-pliny'])
  assert.deepEqual([...INK_ARC], ['ic-trajan', 'ic-suetonius', 'ic-lucian'])
  assert.deepEqual(EASY_LINE_ORDER.slice(7, 14), [...DIG_ARC, ...NAMES_ARC])
  assert.deepEqual(EASY_LINE_ORDER.slice(39, 42), [...STONE_ARC])
  assert.deepEqual(EASY_LINE_ORDER.slice(42, 45), [...INK_ARC])
  const homes = {
    'ph-road': { who: 'Mercy', place: 'Story Creek' },
    'ph-father': { who: 'Mercy', place: 'Story Creek' },
    'ph-debt': { who: 'Mercy', place: 'Story Creek' },
    'wb-creed': { who: 'Silas', place: 'Witness Square' },
    'wb-women': { who: 'Silas', place: 'Witness Square' },
    'daily-lantern': { who: 'Juniper', place: 'East porch' },
    'daily-stars': { who: 'Nora', place: 'Sky Watch' },
    'daily-cosmos': { who: 'Ansel', place: 'Why Gate Arch' },
    'hl-moral': { who: 'Hope', place: 'Meaning Ridge' },
    'sc-tacitus': { who: 'Silas', place: 'Stone Court' },
    'sc-james': { who: 'Silas', place: 'Stone Court' },
    'sc-pliny': { who: 'Silas', place: 'Stone Court' },
    'ic-trajan': { who: 'Silas', place: 'Ink Court' },
    'ic-suetonius': { who: 'Silas', place: 'Ink Court' },
    'ic-lucian': { who: 'Silas', place: 'Ink Court' },
  }
  const triples = {
    'ph-road': 'mercy-hollow',
    'ph-father': 'father-hollow',
    'ph-debt': 'debt-hollow',
    'wb-creed': 'silas-bench',
    'wb-women': 'women-bench',
    'daily-lantern': 'juniper-porch',
    'daily-stars': 'nora-sky',
    'daily-cosmos': 'ansel-gate',
    'hl-moral': 'hope-lookout',
    'sc-tacitus': 'tacitus-court',
    'sc-james': 'james-court',
    'sc-pliny': 'pliny-court',
    'ic-trajan': 'trajan-ink',
    'ic-suetonius': 'suetonius-ink',
    'ic-lucian': 'lucian-ink',
  }
  let walked = []
  for (const id of EASY_LINE_ORDER) {
    if (homes[id]) {
      const home = easyWhoWhere(id)
      assert.equal(home.who, homes[id].who, `${id} who`)
      assert.equal(home.place, homes[id].place, `${id} place`)
      assert.match(easyWhoWhereLine(id), new RegExp(homes[id].place))
      assert.match(easyWhoWhereLine(id), new RegExp(homes[id].who))
    }
    assert.ok(plainFor(id)?.teach, `${id} Learn teach`)
    assert.ok(evidenceFor(id), `${id} evidence`)
    if (triples[id]) {
      assert.equal(streetTripleForLine(id), triples[id])
      const street = easyStreetChallenge(id)
      assert.equal(street.triples.length, 1, `${id} one Match triad`)
      assert.equal(street.triples[0]?.id, triples[id])
      const triple = STREET_TRIPLES.find((item) => item.id === triples[id])
      assert.ok(triple, `${id} street triple`)
      assert.ok(
        street.nodes.some((node) => node.id === triple.ideaId && node.evidenceId === id),
        `${id} idea node`,
      )
      assert.ok(street.nodes.some((node) => node.id === triple.placeId), `${id} place node`)
      assert.ok(street.nodes.some((node) => node.id === triple.personId), `${id} person node`)
      assert.ok(STREET_WHYS[triples[id]]?.easy, `${id} why`)
    } else {
      assert.equal(easyStreetChallenge(id).triples.length, 1, `${id} one Match triad`)
    }
    assert.equal(easyLoopLine({ easyTaught: walked, easyHeld: walked }), id)
    walked = [...walked, id]
  }
  assert.equal(easyLoopLine({ easyTaught: walked, easyHeld: walked }), 'ph-road')
  assert.equal(STREET_TRIPLES.length, 45)
  assert.equal(STREET_CHALLENGE.triples.length, 45)
  assert.equal(STREET_CHALLENGE.nodes.length, STREET_TRIPLES.length + 15)
  {
    const walks = streetWalks()
    const covered = walks.flatMap((walk) => walk.triples.map((item) => item.id))
    assert.equal(covered.length, 45)
    assert.equal(new Set(covered).size, 45)
    assert.ok(walks.every((walk) => walk.triples.length >= 3 && walk.triples.length <= 5))
    const first = nextStreetWalk([])
    assert.ok(first)
    assert.match(first.placeTitle, /Story Creek/)
    assert.ok(first.triples.length <= 5)
    assert.equal(hardStreetChallenge([]).triples.length, first.triples.length)
    assert.ok(hardStreetChallenge([]).triples.length < STREET_TRIPLES.length)
    const afterFirst = appendStreetLinks([], first.triples.map((item) => item.id))
    assert.equal(streetFactsLeft(afterFirst), 45 - first.triples.length)
    assert.equal(streetIsComplete({ streetLinked: afterFirst }), false)
    assert.equal(streetIsComplete({ completed: ['ln-street'] }), true)
    const second = nextStreetWalk(afterFirst)
    assert.ok(second)
    assert.notEqual(second.triples[0]?.id, first.triples[0]?.id)
    const ideas = STREET_CHALLENGE.nodes.filter((node) => node.kind === 'idea')
    assert.equal(
      streetDecoyNodes(ideas, 'idea-debt').some((node) => node.evidenceId === 'ph-road'),
      false,
    )
    assert.equal(
      streetDecoyNodes(ideas, 'idea-mercy').some((node) => node.evidenceId === 'ph-road'),
      false,
    )
    assert.notEqual(linkClue('mercy-hollow', 'place'), linkClue('father-hollow', 'place'))
    assert.notEqual(linkClue('mercy-hollow', 'person'), linkClue('debt-hollow', 'person'))
    assert.match(linkClue('mercy-hollow', 'place'), /Story Creek|neighbor-road/)
    assert.match(linkClue('father-hollow', 'place'), /Story Creek|father-run/)
    assert.match(linkClue('debt-hollow', 'place'), /Story Creek|debt/)
    assert.match(linkClue('mercy-hollow', 'person'), /Mercy Wren/)
    assert.match(linkClue('father-hollow', 'person'), /Mercy Wren/)
    assert.match(linkClue('debt-hollow', 'person'), /Mercy Wren/)
  }
  const skip = new Set(STREET_SKIP_IDS)
  const onStreet = new Set(STREET_FACT_IDS)
  for (const id of STREET_SKIP_IDS) {
    assert.equal(onStreet.has(id), false, `${id} stays off the street`)
  }
  for (const id of allEvidenceIds()) {
    if (skip.has(id) || digParked.test(id)) continue
    assert.ok(onStreet.has(id), `${id} belongs on the street`)
    const tripleId = streetTripleForLine(id)
    assert.notEqual(tripleId, undefined, `${id} triple`)
    const triple = STREET_TRIPLES.find((item) => item.id === tripleId)
    assert.ok(triple, `${id} street triple`)
    assert.ok(
      STREET_CHALLENGE.nodes.some((node) => node.id === triple.ideaId && node.evidenceId === id),
      `${id} Hard idea node`,
    )
    assert.ok(STREET_WHYS[tripleId]?.hard, `${id} Hard why`)
    assert.equal(easyStreetChallenge(id).triples[0]?.id, tripleId)
  }
  assert.equal(streetTripleForLine('ph-seeds'), 'seeds-hollow')
  assert.equal(streetTripleForLine('wb-early'), 'early-bench')
  assert.equal(streetTripleForLine('ob-tuning'), 'tuning-sky')
  assert.equal(streetTripleForLine('fg-mover'), 'mover-gate')
  assert.equal(streetTripleForLine('hl-beauty'), 'beauty-lookout')
  assert.equal(streetTripleForLine('daily-neighbor'), 'neighbor-porch')
  assert.equal(streetTripleForLine('daily-names'), 'names-bench')
  assert.equal(streetTripleForLine('daily-life'), 'daily-life-sky')
  assert.equal(streetTripleForLine('daily-scroll'), 'scroll-gate')
  assert.equal(streetTripleForLine('daily-grace'), 'grace-lookout')
  const seeds = STREET_CHALLENGE.nodes.find((node) => node.evidenceId === 'ph-seeds')
  const creed = STREET_CHALLENGE.nodes.find((node) => node.evidenceId === 'wb-creed')
  const tuning = STREET_CHALLENGE.nodes.find((node) => node.evidenceId === 'ob-tuning')
  const mover = STREET_CHALLENGE.nodes.find((node) => node.evidenceId === 'fg-mover')
  const beauty = STREET_CHALLENGE.nodes.find((node) => node.evidenceId === 'hl-beauty')
  const lantern = STREET_CHALLENGE.nodes.find((node) => node.evidenceId === 'daily-lantern')
  assert.equal(linkPicture(seeds, STREET_CHALLENGE).plotId, 'hollow')
  assert.equal(linkPicture(creed, STREET_CHALLENGE).plotId, 'bench')
  assert.equal(linkPicture(tuning, STREET_CHALLENGE).plotId, 'observatory')
  assert.equal(linkPicture(mover, STREET_CHALLENGE).plotId, 'gate')
  assert.equal(linkPicture(beauty, STREET_CHALLENGE).plotId, 'lookout')
  assert.equal(linkPicture(lantern, STREET_CHALLENGE).plotId, 'porch')
  assert.equal(linkPicture(seeds, STREET_CHALLENGE).art, undefined)
  assert.doesNotMatch(STREET_CHALLENGE.context, /maybe|perhaps God|if God exists/i)
}
{
  const settingsSrc = readFileSync(
    new URL('../src/components/Settings.tsx', import.meta.url),
    'utf8',
  )
  const easyReset = settingsSrc.match(/\? 'Reset this walk\?[^']+'/)?.[0] ?? ''
  const easyWipe = settingsSrc.match(/\? 'Wipe this walk[^']+'/)?.[0] ?? ''
  const easyMore = settingsSrc.match(
    /<details className=\{easy \? 'settings-advanced'[\s\S]*?<\/details>/,
  )?.[0] ?? ''
  assert.match(settingsSrc, /EASY\.townSoon/)
  assert.doesNotMatch(settingsSrc, /EASY\.nightSoon/)
  assert.doesNotMatch(settingsSrc, /aria-label="Night Watch"/)
  assert.doesNotMatch(easyReset, /Night Watch/)
  assert.doesNotMatch(easyWipe, /Night Watch/)
  assert.doesNotMatch(easyMore, /Night Watch/)
  assert.doesNotMatch(easyMore, /nightSoon/)
}
assert.match(
  readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8'),
  /easy && next\.name === 'defend'/,
)
assert.match(
  readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8'),
  /view\.name === 'defend' && !easy/,
)
assert.match(
  readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8'),
  /LearnScreen/,
)
assert.match(
  readFileSync(new URL('../src/components/LearnScreen.tsx', import.meta.url), 'utf8'),
  /easyLearnLine/,
)
assert.match(
  readFileSync(new URL('../src/components/LearnScreen.tsx', import.meta.url), 'utf8'),
  /name: 'link'/,
)
assert.match(
  readFileSync(new URL('../src/components/LinkScreen.tsx', import.meta.url), 'utf8'),
  /easyHoldView/,
)
assert.match(
  readFileSync(new URL('../src/components/LinkScreen.tsx', import.meta.url), 'utf8'),
  /easyStreetChallenge/,
)
assert.match(
  readFileSync(new URL('../src/components/LinkScreen.tsx', import.meta.url), 'utf8'),
  /STREET_PLACE_WHYS/,
)
assert.match(
  readFileSync(new URL('../src/components/LinkScreen.tsx', import.meta.url), 'utf8'),
  /recordTaught/,
)
assert.match(
  readFileSync(new URL('../src/components/LinkScreen.tsx', import.meta.url), 'utf8'),
  /onEasyStop=\{easyStop\}/,
)
assert.match(
  readFileSync(new URL('../src/components/LinkScreen.tsx', import.meta.url), 'utf8'),
  /hardStreetChallenge/,
)
assert.match(
  readFileSync(new URL('../src/components/LinkScreen.tsx', import.meta.url), 'utf8'),
  /recordStreetLinks/,
)
assert.match(
  readFileSync(new URL('../src/store/ProgressProvider.tsx', import.meta.url), 'utf8'),
  /recordStreetLinks/,
)
assert.match(
  readFileSync(new URL('../src/components/LinkScreen.tsx', import.meta.url), 'utf8'),
  /dest === 'hold'/,
)
assert.doesNotMatch(
  readFileSync(new URL('../src/components/LinkScreen.tsx', import.meta.url), 'utf8'),
  /name: 'defend'/,
)
assert.doesNotMatch(
  readFileSync(new URL('../src/components/Profile.tsx', import.meta.url), 'utf8'),
  /EASY\.nightSoon/,
)
assert.match(
  readFileSync(new URL('../src/components/Profile.tsx', import.meta.url), 'utf8'),
  /easy \? \(/,
)
assert.match(cssSrc, /is-easy-home/)
assert.match(cssSrc, /easy-core/)
assert.match(cssSrc, /easy-who-where/)
assert.match(cssSrc, /easy-place-chip/)
assert.match(cssSrc, /easy-match-lock/)
assert.match(hubSrc, /EASY\.connectLink/)
assert.match(
  readFileSync(new URL('../src/content/lots.ts', import.meta.url), 'utf8'),
  /Story Creek · Jesus stories/,
)
assert.match(easyUiSrc, /Love — when compassion moves you, help like the Samaritan/)
assert.match(
  readFileSync(new URL('../src/lib/easy.ts', import.meta.url), 'utf8'),
  /Love — tap the matching face\. A true line turns a cheap claim toward heaven/,
)
assert.doesNotMatch(
  readFileSync(new URL('../src/lib/easy.ts', import.meta.url), 'utf8'),
  /cheap lines/,
)
assert.doesNotMatch(
  readFileSync(new URL('../src/lib/easy.ts', import.meta.url), 'utf8'),
  /cheap line/,
)
assert.doesNotMatch(
  readFileSync(new URL('../src/lib/easy.ts', import.meta.url), 'utf8'),
  /neighbor-line/,
)
assert.doesNotMatch(
  readFileSync(new URL('../src/lib/easy.ts', import.meta.url), 'utf8'),
  /A true main idea can turn/,
)
assert.doesNotMatch(
  readFileSync(new URL('../src/content/plain.ts', import.meta.url), 'utf8'),
  /A true main idea can turn/,
)
assert.doesNotMatch(latestChange(APP_VERSION).items.join('\n'), /A true main idea can turn/)
assert.match(easyUiSrc, /Main idea = the short true line we keep/)
assert.match(defendNightSrc, /is-easy-walker/)
assert.match(defendSrc, /waveSpeed\(easy\)/)
assert.match(defendSrc, /easy && item.id === targetId/)
assert.match(defendNightSrc, /easy-walker-face/)
assert.doesNotMatch(defendSrc, /holdWalkers/)
assert.match(defendSrc, /holdSpawn/)
assert.equal(easyTapMode(true, 'wave', false), true)
assert.equal(easyTapMode(true, 'wave', true), false)
assert.equal(easyTapMode(true, 'lost', false), false)
assert.equal(easyTapMode(false, 'wave', false), false)
{
  const midWave1 = [{ id: 0, turned: 'love' }, { id: 1 }]
  const midWave3 = [
    { id: 0, turned: 'love' },
    { id: 1, turned: 'love' },
    { id: 2, turned: 'love' },
    { id: 3 },
    { id: 4 },
  ]
  assert.equal(easyTapPersonCount(midWave1), 1)
  assert.equal(easyTapPersonCount(midWave3), 1)
  assert.equal(easyTapTarget(midWave3)?.id, 3)
  assert.equal(easyTapPersonCount([{ id: 0, turned: 'love' }]), 0)
}
assert.equal(easyTapFit(true, 'love', 'physical'), 'match')
assert.equal(easyTapFit(true, 'love', 'pagan'), 'match')
assert.equal(easyTapFit(false, 'love', 'physical'), 'weak')
{
  let downed = 0
  for (let i = 0; i < 6; i += 1) {
    const cast = raidForWave(2, i)
    assert.equal(easyTapFit(true, 'love', cast.kind), 'match')
    downed += 1
  }
  assert.equal(downed, 6)
  assert.equal(waveIsClear(true, 6, 6, 1), true)
  assert.equal(waveIsClear(false, 6, 6, 1), false)
  assert.equal(waveIsClear(false, 6, 6, 0), true)
}
assert.equal(
  easyChromeLine('Received mercy makes refusing mercy a contradiction.'),
  'Forgiven a huge debt — do not choke a neighbor.',
)
assert.equal(
  easyChromeLine('Jesus is only reforming first-century banking.'),
  'Jesus is only talking about old money rules.',
)
assert.doesNotMatch(easyChromeLine('Keep the mercy. Toss the throttle.'), /throttle/)
assert.equal(
  easyChromeLine('The servant forgiven an unpayable debt then throttles a peer over a small sum.'),
  'He was forgiven much, then choked a neighbor.',
)
assert.equal(
  easyChromeLine('The first servant was right to demand prison.'),
  'He was right to refuse mercy.',
)
assert.equal(
  easyChromeLine(
    'Honor is spent so the son can be embraced; the older brother shows nearness without joy.',
  ),
  'The father hugs him first.',
)
assert.equal(
  easyChromeLine('The older brother is the hero for staying home.'),
  'The older brother is the hero just for staying.',
)
assert.equal(
  easyWhyLine(
    'Honor is spent so the son can be embraced; the older brother shows nearness without joy.',
  ),
  'The father hugs him first.',
)
assert.equal(
  easyWhyLine(
    'Jesus makes the listener identify with the wounded man, then with the Samaritan moved with compassion.',
  ),
  'First the hurt man, then help.',
)
assert.doesNotMatch(
  easyWhyLine(
    'Jesus makes the listener identify with the wounded man, then with the Samaritan moved with compassion.',
  ),
  /stands you with the hurt man/,
)
assert.equal(easyWhyWordCount('The father hugs him first.'), 5)
assert.ok(easyWhyWordCount(easyWhyLine('The servant forgiven an unpayable debt then throttles a peer over a small sum.')) <= 12)
{
  const faces = []
  for (const id of allEvidenceIds()) {
    const brief = evidenceFor(id)
    assert.ok(brief, id)
    const whyFaces = brief.reasonChoices.map((line) => easyWhyLine(line))
    assert.equal(new Set(whyFaces).size, whyFaces.length, `${id} duplicate Easy why faces`)
    for (const face of whyFaces) {
      const words = easyWhyWordCount(face)
      assert.ok(words <= 12, `${id} Easy why too long (${words}): ${face}`)
      assert.ok(words >= 3, `${id} Easy why too short: ${face}`)
      assert.doesNotMatch(face, /throttl/i)
      assert.doesNotMatch(face, /[.!?]\s+\S/, `${id} stacked Easy why: ${face}`)
      faces.push(face)
    }
  }
  assert.ok(faces.length > 20)
}
assert.equal(EASY.holdNext, 'Lock In next')
assert.equal(EASY.learnCta, 'Learn')
assert.equal(EASY.readStoryFirst, 'Read the story first')
assert.equal(EASY.learnThisFirst, 'Learn this first.')
assert.equal(EASY.matchDone, 'Match done')
assert.equal(EASY.matchWin, 'Matched!')
assert.equal(EASY.home, 'Home')
assert.doesNotMatch(
  easyChromeLine('The servant forgiven an unpayable debt then throttles a peer over a small sum.'),
  /throttles a peer/,
)
assert.doesNotMatch(EASY.loveCue, /mean line/)
assert.doesNotMatch(EASY.nightLead, /mean line|claim|throttle/)
assert.match(plotArtSrc, /EASY_FOLK_LIFT/)
assert.match(
  readFileSync(new URL('../src/components/Journal.tsx', import.meta.url), 'utf8'),
  /easy\s*\?\s*false/,
)
assert.equal(EASY_FOLK_LIFT, 24)
assert.ok(EASY_FOLK_NUDGE.porch?.y && EASY_FOLK_NUDGE.gate?.y)
{
  const folkPortraitY = -42
  const folkPortraitH = 44
  const folkY = { hollow: 352, lamps: 358, bench: 344, porch: 356 }
  for (const [id, y] of Object.entries(folkY)) {
    const nudgeY = EASY_FOLK_NUDGE[id]?.y ?? 0
    const portraitBottom = y - EASY_FOLK_LIFT + nudgeY + folkPortraitY + folkPortraitH
    const chipTop = easyTagMetrics(id).y0
    assert.ok(
      portraitBottom + 8 < chipTop,
      `${id} Easy portrait ${portraitBottom} covers chip ${chipTop}`,
    )
  }
}
assert.match(defendSrc, /spawnNow/)
assert.match(defendSrc, /waveIsClear/)
assert.match(defendSrc, /easyTapMode/)
assert.match(
  readFileSync(new URL('../src/components/challenges/SortPlay.tsx', import.meta.url), 'utf8'),
  /easyChromeLine/,
)
assert.match(sortSrc, /showSortHow/)
assert.match(sortSrc, /plainFor\(challenge\.id\)/)
assert.match(sortSrc, /easyPlainHint/)
assert.match(sortSrc, /showEasyPuzzleHint/)
assert.match(sortSrc, /easyChromeNearDup/)
assert.match(sortSrc, /easyLeadLine/)
assert.doesNotMatch(hubSrc, /slot="hub-banner"/)
assert.match(
  readFileSync(new URL('../src/components/Settings.tsx', import.meta.url), 'utf8'),
  /EASY\.supportTrail/,
)
assert.match(
  readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8'),
  /SceneAd/,
)
assert.match(
  readFileSync(new URL('../src/components/Settings.tsx', import.meta.url), 'utf8'),
  /settings-advanced/,
)
assert.match(
  readFileSync(new URL('../src/components/DigDeeper.tsx', import.meta.url), 'utf8'),
  /easyDigTaps/,
)
assert.match(
  readFileSync(new URL('../src/components/DigDeeper.tsx', import.meta.url), 'utf8'),
  /is-easy-dig/,
)
assert.match(plotArtSrc, /easy \? 'seed'/)
assert.match(mapSrc, /easy \? null : <SpinePath/)
assert.match(mapSrc, /easy \? null : \(\s*\n\s*<>[\s\S]*city-street-main/)
assert.match(mapSrc, /if \(isEasy\(progress\)\) return/)
assert.match(mapSrc, /if \(playing\.current && !isEasy\(progress\)\) return/)
assert.match(mapSrc, /Tap a building to Manage it/)
assert.match(latestChange(APP_VERSION).title, /Story Snap|HUD|≤720/i)
assert.match(latestChange(APP_VERSION).items.join('\n'), /Story Snap|≤720|HUD|eyebrow|who·where|strip|pad/i)
assert.match(cssSrc, /\.city-plot\.has-candy-img \.city-plot-img[\s\S]*?fill: none !important/)
assert.match(cssSrc, /\.city-plot\.has-candy-img\.is-built[\s\S]*?fill: none/)
assert.match(cssSrc, /\.city-plot\.has-candy-img \.city-plot-hit[\s\S]*?stroke: none/)
assert.match(mapSrc, /cityMapBg/)
assert.match(mapSrc, /city-portrait-img/)
assert.doesNotMatch(mapSrc, /foreignObject/)
assert.match(mapSrc, /city-map-bg\.webp/)
assert.ok(
  existsSync(new URL('../src/assets/city/city-map-bg.webp', import.meta.url)),
  'missing city-map-bg.webp',
)
assert.match(plotArtSrc, /PLOT_IMG/)
assert.match(plotArtSrc, /city-plot-img/)
assert.match(plotArtSrc, /has-candy-img/)
assert.match(cssSrc, /\.city-plot\.has-candy-img/)
assert.match(plotArtSrc, /preserveAspectRatio="xMidYMid meet"/)
assert.match(plotArtSrc, /type PackAPlotId = 'porch' \| 'gate' \| 'journal' \| 'hollow' \| 'bench'/)
assert.match(plotArtSrc, /bench:\s*\{[\s\S]*scaffold: plotBenchScaffold/)
assert.match(plotArtSrc, /if \(img\) return <PlotImageArt/)
assert.match(plotArtSrc, /id === 'bench'\) return <BenchArt/)
for (const id of ['porch', 'gate', 'journal', 'hollow', 'bench']) {
  for (const stage of ['scaffold', 'built', 'lit']) {
    assert.ok(
      existsSync(
        new URL(`../src/assets/city/plots/plot-${id}-${stage}.webp`, import.meta.url),
      ),
      `missing plot-${id}-${stage}.webp`,
    )
  }
}
const qaSeed = readFileSync(new URL('../public/qa-seed.html', import.meta.url), 'utf8')
const qaSeedDocs = readFileSync(new URL('../docs/qa-seed.html', import.meta.url), 'utf8')
assert.equal(qaSeedDocs, qaSeed, 'docs/qa-seed.html must match public/qa-seed.html')
assert.match(qaSeed, /silver-city-progress-v1/)
assert.match(qaSeed, /silver-city-seen-city-v1/)
assert.match(qaSeed, /silver-city-seen-fill-v1/)
assert.match(qaSeed, /ph-road/)
assert.match(qaSeed, /ph-father/)
assert.match(qaSeed, /plot-bench-scaffold\.webp/)
assert.match(qaSeed, /plot-bench-built\.webp/)
assert.match(qaSeed, /plot-bench-lit\.webp/)
assert.match(
  readFileSync(new URL('../vite.config.ts', import.meta.url), 'utf8'),
  /navigateFallbackDenylist:\s*\[\/\\\/qa-seed\\\.html\/\]/,
)
assert.match(defendSrc, /easyTapTarget/)
assert.match(defendNightSrc, /data-person-node="walker"/)
assert.doesNotMatch(defendSrc, /walkerCue|easySolo|clearWalkerCue|hideOther/)
assert.match(defendSrc, /loveHowTo/)
assert.equal(
  EASY.loveCue,
  'Love — when compassion moves you, help like the Samaritan. Tap the glowing face.',
)
assert.doesNotMatch(defendSrc, /is-dim/)
assert.match(linkPlaySrc, /is-need/)
assert.match(cssSrc, /easy-walker-face/)
assert.equal(EASY_WALKER_FACE_PX, 128)
assert.equal(EASY_WALKER_HIT_PX, 160)
assert.equal(EASY_CUE_HOLD_MS, 1800)
assert.doesNotMatch(
  readFileSync(new URL('../src/lib/easy.ts', import.meta.url), 'utf8'),
  /dossier|ledger|scaffold|proofs|Jesus-story walk/,
)
assert.doesNotMatch(LOT_STORY.hollow.whyEasy, /dossier|ledger|scaffold|proofs/)
assert.doesNotMatch(LOT_STORY.bench.whyEasy, /dossier|ledger|scaffold|proofs/)
assert.doesNotMatch(STREET_WHYS['silas-bench'].easy, /dossier|ledger|scaffold|proofs/)
assert.doesNotMatch(
  readFileSync(new URL('../src/content/links.ts', import.meta.url), 'utf8'),
  /neighbor-line/,
)
assert.doesNotMatch(
  readFileSync(new URL('../src/content/plain.ts', import.meta.url), 'utf8'),
  /neighbor-line/,
)
assert.doesNotMatch(hubSrc, /EASY\.nightWhat/)
assert.doesNotMatch(defendSrc, /EASY\.nightWhat/)
assert.match(defendSrc, /EASY\.nightTap/)
assert.match(easyUiSrc, /Tap the face/)
assert.match(easyUiSrc, /saved: 'Lock In'/)
assert.match(easyUiSrc, /connections: 'Connections'/)
assert.match(easyUiSrc, /Things you can use/)
assert.doesNotMatch(
  latestChange(APP_VERSION).items.join('\n'),
  /dossier|ledger|scaffold|proofs|offline-first|held ideas|Evidence Journal/i,
)
assert.match(defendSrc, /taught = true/)
assert.match(defendNightSrc, /easy-walker-cue-label/)
assert.match(defendSrc, /easy \? 'wave'/)
assert.match(cssSrc, /easy-walker-cue-label/)
assert.match(
  readFileSync(new URL('../src/components/Journal.tsx', import.meta.url), 'utf8'),
  /easyJournalMeta/,
)
assert.match(
  readFileSync(new URL('../src/components/Journal.tsx', import.meta.url), 'utf8'),
  /Juniper’s pages/,
)
assert.match(
  readFileSync(new URL('../src/components/Journal.tsx', import.meta.url), 'utf8'),
  /EASY\.saved/,
)
assert.match(
  readFileSync(new URL('../src/components/Journal.tsx', import.meta.url), 'utf8'),
  /is-easy-hold-practice/,
)
assert.match(hubSrc, /easyHomeFocus/)
assert.match(hubSrc, /easyHoldView/)
assert.match(hubSrc, /focus === 'match' \? 'is-dock-now'/)
assert.match(hubSrc, /midStreet/)
assert.match(hubSrc, /EASY\.continueStreet/)
assert.match(hubSrc, /Tonight’s street/)
assert.match(
  readFileSync(new URL('../src/components/challenges/LinkPlay.tsx', import.meta.url), 'utf8'),
  /of \$\{streetBeat\.total\} facts/,
)
assert.match(cssSrc, /is-easy-hold-practice/)
assert.match(
  readFileSync(new URL('../src/lib/easy.ts', import.meta.url), 'utf8'),
  /easyTaught/,
)
assert.match(
  readFileSync(new URL('../src/lib/easy.ts', import.meta.url), 'utf8'),
  /prefer the first line not yet held on Easy/i,
)
assert.match(
  readFileSync(new URL('../src/components/Welcome.tsx', import.meta.url), 'utf8'),
  /name: 'hub'/,
)
assert.doesNotMatch(
  readFileSync(new URL('../src/components/Welcome.tsx', import.meta.url), 'utf8'),
  /name: 'link'/,
)
assert.match(
  readFileSync(new URL('../src/components/Hub.tsx', import.meta.url), 'utf8'),
  /Mercy’s story at Story Creek/,
)
assert.match(
  readFileSync(new URL('../src/components/Hub.tsx', import.meta.url), 'utf8'),
  /EASY\.runHome/,
)
assert.match(
  readFileSync(new URL('../src/components/Hub.tsx', import.meta.url), 'utf8'),
  /storyPlayFor/,
)
assert.match(
  readFileSync(new URL('../src/store/ProgressProvider.tsx', import.meta.url), 'utf8'),
  /markEasyHeld/,
)
assert.match(
  readFileSync(new URL('../src/store/ProgressProvider.tsx', import.meta.url), 'utf8'),
  /markEasyTaught/,
)
assert.match(
  readFileSync(new URL('../src/components/Settings.tsx', import.meta.url), 'utf8'),
  /EASY\.saved/,
)
assert.match(
  readFileSync(new URL('../src/components/Settings.tsx', import.meta.url), 'utf8'),
  /This walk is saved on this device/,
)
assert.match(
  readFileSync(new URL('../src/components/Settings.tsx', import.meta.url), 'utf8'),
  /Settings · \$\{APP_VERSION\}/,
)
assert.match(
  readFileSync(new URL('../src/components/Settings.tsx', import.meta.url), 'utf8'),
  /EASY\.claimTeach/,
)
assert.match(
  readFileSync(new URL('../src/components/Welcome.tsx', import.meta.url), 'utf8'),
  /EASY\.claimTeach/,
)
assert.match(
  readFileSync(new URL('../src/components/TeachUnlock.tsx', import.meta.url), 'utf8'),
  /plain\.teach/,
)
assert.doesNotMatch(
  readFileSync(new URL('../src/components/TeachUnlock.tsx', import.meta.url), 'utf8'),
  /easyStoryCard/,
)
assert.match(cssSrc, /easy-steps/)
assert.match(
  readFileSync(new URL('../src/components/AppShell.tsx', import.meta.url), 'utf8'),
  /easy \? EASY_TOP\.lockIn : 'Journal'/,
)
assert.match(linkPlaySrc, /easy-steps/)
assert.match(linkPlaySrc, /1 · Sentence/)
assert.match(easyUiSrc, /Tap a sentence/)
assert.match(linkPlaySrc, /is-screen-\$\{screen\}/)
assert.doesNotMatch(defendSrc, /easyTap && tool\.id !== ability/)
assert.match(defendAbilitySrc, /WATCH_TOOLS\.map/)
assert.match(defendSrc, /EASY\.nightLead/)
assert.equal(EASY.nightLead, 'Tap the face six times.')
assert.equal(EASY.rememberSentence, 'Tap the main idea you kept.')
assert.equal(EASY.tapWhy, 'Tap why this is true.')
assert.equal(EASY.reasonTeach, 'A reason is why this is true.')
assert.equal(EASY.saved, 'Lock In')
assert.equal(EASY.savedSub, 'saved lines')
assert.equal(EASY.nightMiss, 'Wrong — tap the glowing face')
assert.match(defendSrc, /EASY\.nightMiss/)
assert.match(defendSrc, /TAP \$\{downed\}/)
assert.match(defendSrc, /You missed\. Tap the face/)
assert.match(defendSrc, /walking\.some\(\(item\) => !item\.turned\)/)
assert.doesNotMatch(defendSrc, /matching sentence/)
assert.doesNotMatch(
  readFileSync(new URL('../src/components/challenges/LinkPlay.tsx', import.meta.url), 'utf8'),
  /screen === 'next'/,
)
assert.doesNotMatch(
  readFileSync(new URL('../src/components/challenges/LinkPlay.tsx', import.meta.url), 'utf8'),
  /EasyScreen = 'choose' \| 'miss' \| 'next'/,
)
assert.match(
  readFileSync(new URL('../src/components/challenges/LinkPlay.tsx', import.meta.url), 'utf8'),
  />\s*Next\s*</,
)
assert.match(cssSrc, /link-clue/)
assert.match(
  readFileSync(new URL('../src/components/LinkScreen.tsx', import.meta.url), 'utf8'),
  /Start/,
)
assert.match(hubSrc, /Do this next/)
assert.match(hubSrc, /do-next/)
assert.doesNotMatch(hubSrc, /Tap this next/)
assert.match(hubSrc, /is-easy-home/)
assert.doesNotMatch(cssSrc, /tap-next-dock/)
assert.doesNotMatch(cssSrc, /is-easy-town/)
assert.match(defendSrc, /Tap the face/)
assert.match(defendSrc, /Porch flickered/)
assert.doesNotMatch(TOWN_PATH_EASY, /scrapbook/)
assert.match(
  readFileSync(new URL('../src/components/DigDeeper.tsx', import.meta.url), 'utf8'),
  /Dig the names/,
)
assert.match(
  readFileSync(new URL('../src/components/LinkScreen.tsx', import.meta.url), 'utf8'),
  /Match idea · place · person/,
)
assert.match(
  readFileSync(new URL('../src/components/LinkScreen.tsx', import.meta.url), 'utf8'),
  /link-demo/,
)
assert.match(
  readFileSync(new URL('../src/components/LinkScreen.tsx', import.meta.url), 'utf8'),
  /Tap idea → place → person/,
)
assert.match(
  readFileSync(new URL('../src/components/LinkScreen.tsx', import.meta.url), 'utf8'),
  /link-takeaway/,
)
assert.doesNotMatch(
  readFileSync(new URL('../src/components/LinkScreen.tsx', import.meta.url), 'utf8'),
  /Acquire · where/,
)
assert.doesNotMatch(
  readFileSync(new URL('../src/components/LinkScreen.tsx', import.meta.url), 'utf8'),
  /flat list only/,
)
assert.match(
  readFileSync(new URL('../src/components/LinkScreen.tsx', import.meta.url), 'utf8'),
  /Each match lights a spot on the town map/,
)
assert.match(
  readFileSync(new URL('../src/components/LinkScreen.tsx', import.meta.url), 'utf8'),
  /You’ll keep them in \$\{EASY\.saved\}/,
)
assert.match(cssSrc, /next-tap/)
assert.match(cssSrc, /link-demo/)

assert.equal(
  plainFor('ob-tuning')?.gloss,
  evidenceFor('ob-tuning')?.claim,
)
assert.equal(
  plainFor('ob-design')?.gloss,
  evidenceFor('ob-design')?.claim,
)
assert.equal(
  plainFor('ob-tuning')?.gloss,
  'The universe is finely tuned for life — that fit points to a Designer.',
)
assert.equal(
  plainFor('ob-design')?.gloss,
  'Fine-tuning is best explained by a mind that intended a habitable world.',
)
assert.match(
  readFileSync(new URL('../src/components/TeachUnlock.tsx', import.meta.url), 'utf8'),
  /brief\.claim/,
)
assert.match(matchSrc, /isEasy\(progress\) \|\| challenge\.id\.startsWith\('ob-'\)/)
assert.match(sortSrc, /is-easy-sort/)
assert.match(sortSrc, /sort-one/)
assert.match(linkPlaySrc, /focusIds/)
assert.match(linkPlaySrc, /currentTriple/)
assert.match(challengeSrc, /isEasy\(progress\) \|\| areaId === 'observatory'/)
assert.match(
  readFileSync(new URL('../src/components/Welcome.tsx', import.meta.url), 'utf8'),
  /welcome-easy/,
)
assert.match(
  readFileSync(new URL('../src/components/Welcome.tsx', import.meta.url), 'utf8'),
  /EASY\.welcomeGoal|welcomeGoal|Bigger taps/,
)
assert.match(
  readFileSync(new URL('../src/components/Settings.tsx', import.meta.url), 'utf8'),
  /Easy mode/,
)
assert.match(
  readFileSync(new URL('../src/components/Settings.tsx', import.meta.url), 'utf8'),
  /setEasyMode\(true\)/,
)
assert.match(
  readFileSync(new URL('../src/components/Settings.tsx', import.meta.url), 'utf8'),
  />\s*Hard\s*</,
)
assert.doesNotMatch(
  readFileSync(new URL('../src/components/Welcome.tsx', import.meta.url), 'utf8'),
  />\s*Hard\s*</,
  'Welcome must not show Hard — Easy-only first paint',
)
assert.match(
  readFileSync(new URL('../src/components/MindMap.tsx', import.meta.url), 'utf8'),
  /gateWalkArea/,
)
assert.match(
  readFileSync(new URL('../src/store/progress.ts', import.meta.url), 'utf8'),
  /export function gateWalkArea/,
)
assert.match(
  readFileSync(new URL('../src/components/SavedTree.tsx', import.meta.url), 'utf8'),
  /saved-tree-summary/,
)
assert.match(
  readFileSync(new URL('../src/components/Journal.tsx', import.meta.url), 'utf8'),
  /SavedTree/,
)
assert.match(
  readFileSync(new URL('../src/components/Journal.tsx', import.meta.url), 'utf8'),
  /label="Places"/,
)
assert.match(
  readFileSync(new URL('../src/components/Profile.tsx', import.meta.url), 'utf8'),
  /SavedTree/,
)
assert.match(
  readFileSync(new URL('../src/components/Profile.tsx', import.meta.url), 'utf8'),
  /saved-tree/,
)
assert.match(cssSrc, /saved-tree-summary/)
assert.match(cssSrc, /saved-tree-nested/)
assert.match(cssSrc, /saved-tree/)
assert.match(cssSrc, /html\[data-easy='on'\]/)
assert.match(cssSrc, /min-height: 52px/)
assert.match(
  cssSrc,
  /\.is-puzzle \.play\.is-build \.hint-peek \{[\s\S]*?display: none/,
)
assert.match(
  readFileSync(new URL('../src/lib/save.ts', import.meta.url), 'utf8'),
  /easyMode: parsed\.easyMode === true/,
)
assert.match(
  readFileSync(new URL('../src/lib/save.ts', import.meta.url), 'utf8'),
  /taught: asStringArray\(parsed\.taught\)/,
)
assert.match(
  readFileSync(new URL('../src/lib/save.ts', import.meta.url), 'utf8'),
  /easyTaught: asStringArray\(parsed\.easyTaught\)/,
)
assert.match(
  readFileSync(new URL('../src/lib/save.ts', import.meta.url), 'utf8'),
  /easyHeld: asStringArray\(parsed\.easyHeld\)/,
)
assert.match(
  readFileSync(new URL('../src/lib/save.ts', import.meta.url), 'utf8'),
  /streetLinked: asStringArray\(parsed\.streetLinked\)/,
)
assert.match(
  readFileSync(new URL('../src/lib/save.ts', import.meta.url), 'utf8'),
  /cityBuilt/,
)
assert.match(
  readFileSync(new URL('../src/config/app.ts', import.meta.url), 'utf8'),
  /SAVE_SCHEMA_VERSION = 1/,
)
assert.match(
  readFileSync(new URL('../src/lib/words.ts', import.meta.url), 'utf8'),
  /A claim is the main idea we hold to be true/,
)
assert.match(
  readFileSync(new URL('../src/lib/words.ts', import.meta.url), 'utf8'),
  /building block of an argument/,
)
assert.match(teachSrc, /WORDS\.claim\.teach/)
assert.match(teachSrc, /The claim you will lock in/)
assert.match(teachSrc, /Skip reading/)
assert.doesNotMatch(teachSrc, /The main idea you will keep/)
assert.doesNotMatch(teachSrc, /omitClaim/)
assert.match(teachSrc, /HeldTriad/)
assert.doesNotMatch(teachSrc, /A claim is the main idea we hold to be true/)
assert.ok(
  teachSrc.indexOf('teach-reason') < teachSrc.indexOf('brief.claim'),
  'teach story before the claim line',
)
assert.match(teachSrc, /LociStamp/)
assert.match(teachSrc, /lociStampFor/)
assert.doesNotMatch(teachSrc, /easy-who-where/)
assert.doesNotMatch(teachSrc, /easyWhoWhereLine/)
{
  const card = teachSrc.slice(
    teachSrc.indexOf('easy-story-card'),
    teachSrc.indexOf('easy-story-dock'),
  )
  assert.ok(card.includes('HeldTriad'), 'Easy Learn shows the claim·why·from triad')
  assert.ok(!card.includes('omitClaim'), 'Easy Learn full triad includes Main idea')
  assert.ok(!card.includes('The main idea you will keep'), 'no orphan Main idea kicker above triad')
  assert.ok(card.includes('LociStamp'), 'Easy Learn LociStamp hero is the who·where surface')
  assert.ok(card.includes('mode="hero"'), 'Easy Learn stamp is hero mode')
  assert.ok(!card.includes('easy-who-where'), 'Easy Learn omits who-where row when stamp present (1.4.160 #206)')
  assert.ok(
    card.indexOf('LociStamp') < card.indexOf('HeldTriad'),
    'Easy Learn stamp then story triad — one who·where surface',
  )
}
// Easy Clear 1.4.162: Learn short-story ≤720 peel — Fixes #208
assert.match(cssSrc, /1\.4\.162: Learn short-story ≤720 peel|Fixes #208/)
// Easy Clear 1.4.163: Story Snap drop Learn-lead teach reprint — Fixes #209
{
  const snapPlay = readFileSync(
    new URL('../src/components/challenges/StorySnapPlayView.tsx', import.meta.url),
    'utf8',
  )
  assert.doesNotMatch(snapPlay, /className="snap-teach"/, '1.4.163 peels snap-teach (#209)')
  assert.doesNotMatch(snapPlay, /\{STORY_SNAP_TEACH\}/, '1.4.163 no STORY_SNAP_TEACH JSX (#209)')
  assert.match(snapPlay, /easy-who-where-line/)
  assert.match(snapPlay, /1\.4\.163.*#209/)
}
// Easy Clear 1.4.164: Easy Build It gift wrap — Fixes #214
{
  const giftRule = cssSrc.match(/\.hub\.is-easy-home \.easy-build-gift \{([\s\S]*?)\n\}/)?.[1] ?? ''
  assert.match(cssSrc, /1\.4\.164.*#214|Fixes #214/)
  assert.match(giftRule, /white-space:\s*normal/, '1.4.164 gift wraps (#214)')
  assert.match(giftRule, /-webkit-line-clamp:\s*2/, '1.4.164 two-line clamp (#214)')
  assert.doesNotMatch(giftRule, /white-space:\s*nowrap/, '1.4.164 no nowrap clip (#214)')
  assert.doesNotMatch(giftRule, /text-overflow:\s*ellipsis/, '1.4.164 no ellipsis clip (#214)')
  assert.match(hubSrc, /A building is ready\. Tap it, then Build this\./)
}

// Easy Clear 1.4.165: Manage sheet peek + portrait dedupe — Fixes #220
{
  const manageCard = cssSrc.match(/\.mind-map\.is-manage \.mind-map-card \{([\s\S]*?)\n\}/)?.[1] ?? ''
  assert.match(cssSrc, /1\.4\.165.*#220|Fixes #220/)
  assert.match(manageCard, /max-height:\s*min\(42dvh/, '1.4.165 peek ~42dvh (#220)')
  assert.doesNotMatch(manageCard, /max-height:\s*min\(50dvh/, '1.4.165 no 50dvh wall (#220)')
  const manageHead = cssSrc.match(/\.mind-map\.is-manage \.mind-map-head \{([\s\S]*?)\n\}/)?.[1] ?? ''
  assert.match(manageHead, /grid-template-columns:\s*minmax\(0,\s*1fr\)\s+auto/, '1.4.165 head no avatar col (#220)')
  const mindMapSrc = readFileSync(new URL('../src/components/MindMap.tsx', import.meta.url), 'utf8')
  assert.match(mindMapSrc, /1\.4\.165/)
  // Header Avatar dropped; PERSON tile Avatar remains
  const headChunk = mindMapSrc.split('mind-map-head')[1]?.split('mind-map-scroll')[0] ?? ''
  assert.doesNotMatch(headChunk, /<Avatar\b/, '1.4.165 no header Avatar (#220)')
  assert.match(mindMapSrc, /mind-node is-person[\s\S]*?<Avatar\b/, '1.4.165 PERSON Avatar kept (#220)')
  // Easy eyebrow drops Manage admin chrome (Walk CTA aligns with place title)
  assert.doesNotMatch(mindMapSrc, /EASY\.manage/, '1.4.165 Easy eyebrow omits Manage (#220)')
  assert.match(mindMapSrc, /\$\{applied\} · \$\{tierTitle\(applied, easy\)\}/, '1.4.165 Easy level eyebrow (#220)')
}

// Easy Clear 1.4.167: Manage-open Hub chrome compress — Fixes #220 strata
{
  const hubSrc167 = readFileSync(new URL('../src/components/Hub.tsx', import.meta.url), 'utf8')
  assert.match(hubSrc167, /is-manage-open/, '1.4.167 hub manage-open class (#220)')
  assert.match(
    hubSrc167,
    /hub is-easy-home\$\{mindPlot \? ' is-manage-open' : ''\}/,
    '1.4.167 Easy Home class toggles manage-open (#220)',
  )
  assert.match(cssSrc, /1\.4\.167.*#220|Manage-open Hub chrome/, '1.4.167 CSS comment (#220)')
  assert.match(cssSrc, /\.hub\.is-manage-open \.easy-home-dock/, '1.4.167 hide Easy dock when manage (#220)')
  assert.match(
    cssSrc,
    /\.app:has\(\.hub\.is-manage-open\) \.topbar[\s\S]*?display:\s*none/,
    '1.4.167 hide topbar when manage open (#220)',
  )
  assert.match(
    cssSrc,
    /\.app:has\(\.hub\.is-manage-open\)[\s\S]*?grid-template-rows:\s*1fr/,
    '1.4.167 collapse topbar row (#220)',
  )
}

// Easy Clear 1.4.168: Easy Match ≤720 board-first how/say peel (invent Fun/Clear)
{
  const matchCss168 = readFileSync(new URL('../src/styles/match.css', import.meta.url), 'utf8')
  const gemPlay168 = readFileSync(
    new URL('../src/components/challenges/GemSearchPlay.tsx', import.meta.url),
    'utf8',
  )
  assert.match(matchCss168, /1\.4\.168: Easy Match \(gem \/ crossword\) ≤720 board-first/)
  assert.match(
    matchCss168,
    /@media \(max-height: 720px\) \{[\s\S]*?\.play\.is-gem-search\.is-panel-blast \.sort-how \{[\s\S]*?display: none/,
  )
  assert.match(
    matchCss168,
    /@media \(max-height: 720px\) \{[\s\S]*?\.match-teach-say \{[\s\S]*?display: none/,
  )
  assert.match(gemPlay168, /1\.4\.168: ≤720 peels how\/say chrome in match\.css/)
  assert.match(cssSrc, /1\.4\.168: Easy Match \(gem \/ crossword\) ≤720 board-first/)
}

// Easy Clear 1.4.170: Lock In WhyBlast ≤720 arena-first eyebrow/From peel (invent Fun/Clear)
{
  const holdCss170 = readFileSync(new URL('../src/styles/sortHold.css', import.meta.url), 'utf8')
  const whyPlay170 = readFileSync(
    new URL('../src/components/challenges/WhyBlastPlay.tsx', import.meta.url),
    'utf8',
  )
  assert.match(holdCss170, /1\.4\.170: Lock In WhyBlast ≤720 arena-first/)
  assert.match(
    holdCss170,
    /@media \(max-height: 720px\) \{[\s\S]*?\.recall-gate\.is-easy-hold\.is-why-blast:has\(\.why-blast\) > \.eyebrow \{[\s\S]*?display: none/,
  )
  assert.match(
    holdCss170,
    /@media \(max-height: 720px\) \{[\s\S]*?\.why-arena \.held-from\.quiet \{[\s\S]*?display: none/,
  )
  assert.match(whyPlay170, /1\.4\.170: ≤720 peels outer eyebrow/)
  assert.match(cssSrc, /1\.4\.170: Lock In WhyBlast ≤720 arena-first/)
}

// Easy Clear 1.4.173: Easy Father Dash ≤720 HUD peel (invent Fun/Clear)
{
  const fatherCss173 = readFileSync(new URL('../src/index.css', import.meta.url), 'utf8')
  const fatherPlay173 = readFileSync(
    new URL('../src/components/challenges/FatherRunPlay.tsx', import.meta.url),
    'utf8',
  )
  assert.match(fatherCss173, /1\.4\.173: Father Dash ≤720 HUD peel/)
  assert.match(
    fatherCss173,
    /@media \(max-height: 720px\) \{[\s\S]*?\.play\.is-father-run \.story-kicker,[\s\S]*?\.play\.is-father-run \.run-thumbs,[\s\S]*?\.play\.is-father-run \.story-caption \{[\s\S]*?display: none/,
  )
  assert.match(
    fatherCss173,
    /@media \(max-height: 720px\) \{[\s\S]*?\.play\.is-father-run \.match-score \{/,
  )
  assert.match(fatherPlay173, /1\.4\.173: ≤720 peels HUD/)
  assert.match(cssSrc, /1\.4\.173: Father Dash ≤720 HUD peel/)
}

// Easy Clear 1.4.175: Easy Story Creek maze ≤720 HUD peel (invent Fun/Clear)
{
  const mazeCss175 = readFileSync(new URL('../src/styles/maze.css', import.meta.url), 'utf8')
  const mazePlay175 = readFileSync(
    new URL('../src/components/challenges/RoadMazePlay.tsx', import.meta.url),
    'utf8',
  )
  assert.match(mazeCss175, /1\.4\.175: Story Creek maze ≤720 HUD peel/)
  assert.match(
    mazeCss175,
    /@media \(max-height: 720px\) \{[\s\S]*?\.play\.is-road-maze \.story-kicker,[\s\S]*?\.play\.is-road-maze \.run-thumbs,[\s\S]*?\.play\.is-road-maze \.story-caption \{[\s\S]*?display: none/,
  )
  assert.match(
    mazeCss175,
    /@media \(max-height: 720px\) \{[\s\S]*?\.play\.is-road-maze \.match-score \{/,
  )
  assert.match(mazePlay175, /1\.4\.175: ≤720 peels HUD/)
  assert.match(cssSrc, /1\.4\.175: Story Creek maze ≤720 HUD peel/)
}

// Easy Clear 1.4.177: Learn claim pill contrast + wrap (Fixes #231)
{
  const lociCss177 = readFileSync(new URL('../src/styles/loci-stamp.css', import.meta.url), 'utf8')
  const lociTs177 = readFileSync(new URL('../src/lib/lociStamp.ts', import.meta.url), 'utf8')
  assert.match(lociCss177, /1\.4\.177: force dark ink on cream stamp/)
  assert.match(lociCss177, /\.loci-stamp \{[\s\S]*?color: var\(--ink, #2a2118\)/)
  assert.match(lociCss177, /\.loci-stamp-idea \{[\s\S]*?color: var\(--ink, #1a140e\)/)
  assert.match(lociCss177, /1\.4\.177 #231/)
  assert.match(lociCss177, /\.loci-stamp\.is-hero \.loci-stamp-idea \{[\s\S]*?-webkit-line-clamp: 2/)
  assert.match(lociTs177, /1\.4\.177: 8 words/)
  assert.match(lociTs177, /maxWords = 8/)
  assert.match(cssSrc, /1\.4\.177: lift max-height/)
  assert.match(teachSrc, /1\.4\.177: cream stamp dark ink/)
  const stampRoad = lociStampFor('ph-road')
  assert.equal(stampRoad.ideaShort, 'Neighbor is the one who shows mercy')
}





// Easy Clear 1.4.171: Easy Sequence / BuildArgument ≤720 board-first how/lead/hint peel (invent Fun/Clear)
{
  const holdCss171 = readFileSync(new URL('../src/styles/sortHold.css', import.meta.url), 'utf8')
  const seqPlay171 = readFileSync(
    new URL('../src/components/challenges/SequencePlay.tsx', import.meta.url),
    'utf8',
  )
  const buildPlay171 = readFileSync(
    new URL('../src/components/challenges/BuildArgumentPlay.tsx', import.meta.url),
    'utf8',
  )
  assert.match(holdCss171, /1\.4\.171: Easy Sequence \/ BuildArgument ≤720 board-first/)
  assert.match(
    holdCss171,
    /@media \(max-height: 720px\) \{[\s\S]*?\.play\.is-sequence \.sort-how,[\s\S]*?\.play\.is-build \.sort-how \{[\s\S]*?display: none/,
  )
  assert.match(
    holdCss171,
    /@media \(max-height: 720px\) \{[\s\S]*?\.play\.is-sequence \.easy-hint,[\s\S]*?display: none/,
  )
  assert.match(
    holdCss171,
    /@media \(max-height: 720px\) \{[\s\S]*?\.play\.is-sequence \.prompt,[\s\S]*?-webkit-line-clamp: 2/,
  )
  assert.match(seqPlay171, /1\.4\.171: ≤720 peels how\/lead\/hint chrome in sortHold\.css/)
  assert.match(buildPlay171, /1\.4\.171: ≤720 peels how\/lead\/hint chrome in sortHold\.css/)
  assert.match(cssSrc, /1\.4\.171: Easy Sequence \/ BuildArgument ≤720 board-first/)
}




assert.match(
  cssSrc,
  /@media \(max-height: 720px\) \{[\s\S]*?\.easy-story-card\.teach-gate \{[\s\S]*?gap: 4px/,
)
assert.match(
  cssSrc,
  /@media \(max-height: 720px\) \{[\s\S]*?\.easy-story-card \.loci-stamp\.is-hero \{[\s\S]*?max-height: 56px/,
)
assert.match(
  cssSrc,
  /@media \(max-height: 720px\) \{[\s\S]*?\.easy-story-card > \.gem[\s\S]*?display: none/,
)
assert.match(
  cssSrc,
  /@media \(max-height: 720px\) \{[\s\S]*?\.easy-story-card \.teach-reason \{[\s\S]*?-webkit-line-clamp: 3/,
)
assert.match(
  cssSrc,
  /@media \(max-height: 720px\) \{[\s\S]*?\.easy-story-card \.held-triad \{[\s\S]*?gap: 3px/,
)

assert.match(matchSrc, /match-col-label/)
assert.match(matchSrc, /Main idea' : 'Claim'/)
assert.match(matchSrc, /EASY\.matchHow/)
assert.match(matchSrc, /easyChromeLine/)
assert.match(matchSrc, /showEasyPuzzleHint/)
assert.match(matchSrc, /plainFor\(challenge\.id\)/)
assert.match(matchSrc, /easyWrongTap/)
assert.match(matchSrc, /EASY\.holdNext/)
assert.doesNotMatch(matchSrc, /A claim is the main idea we hold to be true/)
assert.match(cssSrc, /\.word-school/)
assert.doesNotMatch(teachSrc, /Acquire · \$\{brief\.source\}/)

{
  const watch = evidenceFor('td-watch')
  assert.ok(watch)
  assert.equal(watch.claim, 'Love — tap the matching face. A true line turns a cheap claim toward heaven.')
  const claim = easyFacingLine(watch.id, watch.claim)
  const decoy = easyFacingLine(watch.id, watch.claimChoices[1])
  assert.equal(claim, EASY.loveCue)
  assert.equal(plainFor('td-watch')?.gloss, EASY.loveCue)
  assert.notEqual(decoy, claim)
  assert.equal(new Set(watch.claimChoices.map((line) => easyFacingLine(watch.id, line))).size, 3)
  assert.equal(evidenceFor('ph-road')?.claim, 'Neighbor is the one who shows mercy.')
  assert.match(EASY.loveCue, /compassion/)
  assert.match(EASY.loveCue, /^Love /)
  assert.doesNotMatch(EASY.loveCue, /A true main idea can turn/)
  const sameFace = uniqueHoldChoices(
    [watch.claim, watch.claim, watch.claimChoices[1], watch.claimChoices[1]],
    (line) => easyFacingLine(watch.id, line),
    watch.claim,
  )
  assert.deepEqual(
    sameFace.map((line) => easyFacingLine(watch.id, line)),
    [...new Set(sameFace.map((line) => easyFacingLine(watch.id, line)))],
  )
  assert.ok(sameFace.includes(watch.claim))
  assert.equal(sameFace.length, 2)

  const ident = uniqueHoldChoices(['Keep the line.', 'Keep the line.', 'A miss.'], (line) => line, 'Keep the line.')
  assert.deepEqual(ident, ['Keep the line.', 'A miss.'])

  const reasons = uniqueHoldChoices(
    [watch.reason, watch.reason, watch.reasonChoices[1]],
    (line) => line,
    watch.reason,
  )
  assert.ok(reasons.includes(watch.reason))
  assert.equal(reasons.length, 2)
  assert.equal(new Set(reasons).size, reasons.length)

  assert.equal(easyLead('ph-father', 'x'), 'Toss the wrong picks. Keep the father running to his son.')
  assert.equal(easyLead('ph-seeds', 'x'), 'Match each Jesus story to the short line it is making.')
  assert.equal(easyLead('daily-gems', 'x'), 'Match each picture to the short line.')
  assert.equal(easyLead('fg-kalam', 'x'), 'Keep the beginning argument. Toss the rest.')
  assert.equal(
    easyChromeNearDup(
      'Keep the lived trust. Toss the lucky pile.',
      'Keep the lived trust. Toss the lucky pile that will not name Christ.',
    ),
    true,
  )
  assert.equal(
    easyChromeNearDup(
      'Keep the law on the heart. Toss nature-as-enough.',
      'Keep the law on the heart. Toss nature-as-enough.',
    ),
    true,
  )
  assert.equal(
    easyChromeNearDup(
      'Keep the beginning argument. Toss the flattenings.',
      'Keep the beginning argument. Toss the rest.',
    ),
    false,
  )
  assert.equal(
    easyChromeNearDup(
      'Keep the ground. Toss the floating trick.',
      'Keep the ground. Toss the floating trick.',
    ),
    true,
  )
  assert.equal(
    easyChromeNearDup(
      'Keep the living God. Toss the dead brick.',
      'Keep the living God. Toss the dead brick.',
    ),
    true,
  )
  assert.equal(easyLead('fg-reason', 'x'), 'Keep the ground. Toss the floating trick.')
  assert.equal(easyLead('fg-ground', 'x'), 'Keep the living God. Toss the dead brick.')
}

console.log('check-city: ok')

// Easy Clear 1.4.180: Manage empty-lot header + compact sheet (Fixes #232)
{
  const hubSrc180 = readFileSync(new URL('../src/components/Hub.tsx', import.meta.url), 'utf8')
  const mindSrc180 = readFileSync(new URL('../src/components/MindMap.tsx', import.meta.url), 'utf8')
  assert.match(hubSrc180, /appliedTier/, '1.4.180 Hub imports appliedTier (#232)')
  assert.match(hubSrc180, /is-empty-lot/, '1.4.180 Hub is-empty-lot (#232)')
  assert.match(
    mindSrc180,
    /mind-map is-manage\$\{applied === 0 \? ' is-empty-lot' : ''\}/,
    '1.4.180 MindMap empty-lot class (#232)',
  )
  assert.match(mindSrc180, /1\.4\.180 — empty-lot omits place-sub/, '1.4.180 place-sub omit (#232)')
  assert.match(cssSrc, /1\.4\.180 — empty-lot keeps AppShell header/, '1.4.180 CSS header restore (#232)')
  assert.match(
    cssSrc,
    /\.app:has\(\.hub\.is-manage-open\.is-empty-lot\) \.topbar[\s\S]*?display:\s*flex/,
    '1.4.180 empty-lot shows topbar (#232)',
  )
  assert.match(
    cssSrc,
    /\.mind-map\.is-manage\.is-empty-lot \.mind-map-card[\s\S]*?max-height:\s*min\(30dvh/,
    '1.4.180 empty-lot sheet max-height (#232)',
  )
  assert.match(
    cssSrc,
    /\.mind-map\.is-manage\.is-empty-lot \.mind-web[\s\S]*?grid-template-columns:\s*1fr 1fr 1fr/,
    '1.4.180 empty-lot Place·Person·Tool row (#232)',
  )
  assert.doesNotMatch(
    latestChange(APP_VERSION).items.join('\n'),
    /full-bleed map|Witness Square candy|Fixes #217|Fixes #213/i,
    '1.4.180 must not claim Map Witness or #217 letterbox fix',
  )
}


// Easy Clear 1.4.182: Easy Story Snap ≤720 HUD peel (invent Fun/Clear)
{
  const snapCss182 = readFileSync(new URL('../src/styles/storySnap.css', import.meta.url), 'utf8')
  const snapPlay182 = readFileSync(
    new URL('../src/components/challenges/StorySnapPlayView.tsx', import.meta.url),
    'utf8',
  )
  assert.match(snapCss182, /1\.4\.182: Story Snap ≤720 HUD peel/)
  assert.match(
    snapCss182,
    /@media \(max-height: 720px\) \{[\s\S]*?\.play\.is-story-snap \.eyebrow \{[\s\S]*?display: none/,
  )
  assert.match(
    snapCss182,
    /@media \(max-height: 720px\) \{[\s\S]*?\.play\.is-story-snap \.easy-who-where-line \{[\s\S]*?display: none/,
  )
  assert.match(snapPlay182, /1\.4\.182: ≤720 peels HUD/)
  assert.doesNotMatch(
    latestChange(APP_VERSION).items.join('\n'),
    /Fixes #232|empty-lot|Fixes #217/i,
    '1.4.182 must not claim Manage 180 or Map letterbox',
  )
}


// Easy Clear 1.4.183: Easy Sort ≤720 board-first how/lead/hint peel (invent Fun/Clear)
{
  const holdCss183 = readFileSync(new URL('../src/styles/sortHold.css', import.meta.url), 'utf8')
  const sortPlay183 = readFileSync(
    new URL('../src/components/challenges/SortPlay.tsx', import.meta.url),
    'utf8',
  )
  assert.match(holdCss183, /1\.4\.183: Easy Sort ≤720 board-first/)
  assert.match(
    holdCss183,
    /@media \(max-height: 720px\) \{[\s\S]*?\.play\.is-easy-sort \.sort-how \{[\s\S]*?display: none/,
  )
  assert.match(
    holdCss183,
    /@media \(max-height: 720px\) \{[\s\S]*?\.play\.is-easy-sort \.easy-hint,[\s\S]*?display: none/,
  )
  assert.match(
    holdCss183,
    /@media \(max-height: 720px\) \{[\s\S]*?\.play\.is-easy-sort \.prompt \{[\s\S]*?-webkit-line-clamp: 2/,
  )
  assert.match(sortPlay183, /1\.4\.183: ≤720 peels how\/lead\/hint chrome in sortHold\.css/)
  assert.doesNotMatch(
    latestChange('1.4.183').items.join('\n'),
    /Story Snap|eyebrow|who·where|Creed merge|Fixes #232|empty-lot|Fixes #217/i,
    '1.4.183 must not claim Snap 182 / Creed 181 / Manage / letterbox',
  )
}


// Easy Clear 1.4.184: Easy Match ≤720 fill empty purple card (Fixes #238)
{
  const matchCss184 = readFileSync(new URL('../src/styles/match.css', import.meta.url), 'utf8')
  const matchPlay184 = readFileSync(
    new URL('../src/components/challenges/MatchPlay.tsx', import.meta.url),
    'utf8',
  )
  assert.match(matchCss184, /1\.4\.184: Easy Match \(picture · main idea\) ≤720 fill empty purple card/)
  assert.match(
    matchCss184,
    /@media \(max-height: 720px\) \{[\s\S]*?\.is-puzzle \.play\.is-match\.is-deal \.match-grid \{[\s\S]*?flex: 1 1 auto/,
  )
  assert.match(
    matchCss184,
    /@media \(max-height: 720px\) \{[\s\S]*?\.is-puzzle \.play\.is-match\.is-deal \.sort-how \{[\s\S]*?display: none/,
  )
  assert.match(
    matchCss184,
    /@media \(max-height: 720px\) \{[\s\S]*?grid-template-rows: auto minmax\(0, 1\.15fr\) minmax\(0, 1fr\)/,
  )
  assert.match(matchPlay184, /1\.4\.184: ≤720 fills empty purple card/)
  assert.match(latestChange('1.4.184').items.join('\n'), /Fixes #238/)
  assert.doesNotMatch(
    latestChange('1.4.184').items.join('\n'),
    /Fixes #239|Fixes #240|Samaritan|Lock In miss|Story Snap|eyebrow|Creed merge|Fixes #232|empty-lot|Fixes #217/i,
    '1.4.184 must not claim #239/#240 / Snap / Creed / Manage / letterbox',
  )
}


// Easy Clear 1.4.185: Easy Lock In ≤720 fill win-end purple void (Fixes #239)
{
  const holdCss185 = readFileSync(new URL('../src/styles/sortHold.css', import.meta.url), 'utf8')
  const stored185 = readFileSync(
    new URL('../src/components/StoredLine.tsx', import.meta.url),
    'utf8',
  )
  assert.match(holdCss185, /1\.4\.185: Lock In win-end \/ feedback ≤720 fill empty purple bottom/)
  assert.match(
    holdCss185,
    /@media \(max-height: 720px\) \{[\s\S]*?\.challenge-page\.is-after:has\(\.stored-line\) \.stored-line \{[\s\S]*?flex: 1 1 auto/,
  )
  assert.match(
    holdCss185,
    /@media \(max-height: 720px\) \{[\s\S]*?\.challenge-page\.is-after:has\(\.stored-line\) \.after-win \{[\s\S]*?flex: 1 1 auto/,
  )
  assert.match(
    holdCss185,
    /html\[data-easy='on'\] \.app\.is-play \.app-body:has\(\.challenge-page\.is-after \.stored-line\)/,
  )
  assert.match(stored185, /1\.4\.185: ≤720 fills empty purple bottom/)
  assert.match(latestChange('1.4.185').items.join('\n'), /Fixes #239/)
  assert.doesNotMatch(
    latestChange('1.4.185').items.join('\n'),
    /Fixes #238|Fixes #240|Samaritan|Match \(picture|empty purple card|Story Snap|eyebrow|Creed merge|Fixes #232|empty-lot|Fixes #217/i,
    '1.4.185 must not claim #238 Match / #240 Samaritan / Snap / Creed / Manage / letterbox',
  )
}

// Easy Clear 1.4.186: Easy Samaritan / Sequence ≤720 fill top-cluster purple void (Fixes #240)
{
  const holdCss186 = readFileSync(new URL('../src/styles/sortHold.css', import.meta.url), 'utf8')
  const seqPlay186 = readFileSync(
    new URL('../src/components/challenges/SequencePlay.tsx', import.meta.url),
    'utf8',
  )
  assert.match(holdCss186, /1\.4\.186: Easy Samaritan \/ Sequence order ≤720 fill top-cluster purple void/)
  assert.match(
    holdCss186,
    /@media \(max-height: 720px\) \{[\s\S]*?\.play\.is-sequence\.is-deal \.bank\.is-order \{[\s\S]*?flex: 1 1 auto/,
  )
  assert.match(
    holdCss186,
    /\.play\.is-sequence\.is-deal,[\s\S]*?flex: 1 1 auto/,
  )
  assert.match(seqPlay186, /1\.4\.186: ≤720 fills top-cluster purple void/)
  assert.match(latestChange('1.4.186').items.join('\n'), /Fixes #240/)
  assert.doesNotMatch(
    latestChange('1.4.186').items.join('\n'),
    /Fixes #238|Fixes #239|Lock In win-end|Match \(picture|empty purple card|Story Snap|eyebrow|Creed merge|Fixes #232|empty-lot|Fixes #217/i,
    '1.4.186 must not claim #238 Match / #239 Lock In / Snap / Creed / Manage / letterbox',
  )
}

// Easy Clear 1.4.187: Easy Build Argument ≤720 fill purple void (invent Fun/Clear)
{
  const holdCss187 = readFileSync(new URL('../src/styles/sortHold.css', import.meta.url), 'utf8')
  const buildPlay187 = readFileSync(
    new URL('../src/components/challenges/BuildArgumentPlay.tsx', import.meta.url),
    'utf8',
  )
  assert.match(holdCss187, /1\.4\.187: Easy Build Argument ≤720 fill purple void/)
  assert.match(
    holdCss187,
    /\.play\.is-build,[\s\S]*?flex: 1 1 auto/,
  )
  assert.match(
    holdCss187,
    /@media \(max-height: 720px\) \{[\s\S]*?\.play\.is-build\.is-deal \.bank\.is-order \{[\s\S]*?flex: 1 1 auto/,
  )
  assert.match(
    holdCss187,
    /@media \(max-height: 720px\) \{[\s\S]*?\.play\.is-build\.is-deal \.slot-list \{[\s\S]*?flex: 1 1 auto/,
  )
  assert.match(buildPlay187, /1\.4\.187: ≤720 fills purple void/)
  assert.match(latestChange('1.4.187').items.join('\n'), /Build Argument.*≤720|purple void under the deal/i)
  assert.doesNotMatch(
    latestChange('1.4.187').items.join('\n'),
    /Fixes #238|Fixes #239|Fixes #240|Lock In win-end|Match \(picture|empty purple card|Story Snap|eyebrow|Creed merge|Fixes #232|empty-lot|Fixes #217/i,
    '1.4.187 must not re-claim Match / Lock In / Samaritan issues / Snap / Creed / Manage / letterbox',
  )
}







// Easy Clear 1.4.188: Easy Link ≤720 fill purple void (invent Fun/Clear)
{
  const indexCss188 = readFileSync(new URL('../src/index.css', import.meta.url), 'utf8')
  const linkPlay188 = readFileSync(
    new URL('../src/components/challenges/LinkPlay.tsx', import.meta.url),
    'utf8',
  )
  assert.match(indexCss188, /1\.4\.188: Easy Link ≤720 fill purple void/)
  assert.match(
    indexCss188,
    /@media \(max-height: 720px\) \{[\s\S]*?\.play\.is-easy-link,[\s\S]*?flex: 1 1 auto/,
  )
  assert.match(
    indexCss188,
    /@media \(max-height: 720px\) \{[\s\S]*?\.play\.is-easy-link \.link-col \{[\s\S]*?grid-auto-rows: minmax\(0, 1fr\)/,
  )
  assert.match(
    indexCss188,
    /@media \(max-height: 720px\) \{[\s\S]*?\.play\.is-easy-link \.link-block\.is-picture \{[\s\S]*?min-height: 0/,
  )
  assert.match(linkPlay188, /1\.4\.188: ≤720 fills purple void/)
  assert.match(cssSrc, /1\.4\.188: Easy Link ≤720 fill purple void/)
  assert.match(latestChange('1.4.188').items.join('\n'), /Easy Link.*≤720|purple void under the deal/i)
  assert.doesNotMatch(
    latestChange('1.4.188').items.join('\n'),
    /Fixes #238|Fixes #239|Fixes #240|Lock In win-end|Match \(picture|empty purple card|Story Snap|eyebrow|Creed merge|Fixes #232|empty-lot|Fixes #217|Build Argument ≤720 fill/i,
    '1.4.188 must not re-claim Match / Lock In / Samaritan / Snap / Creed / Manage / letterbox / Build 187',
  )
}

// Easy Clear 1.4.189: Easy Father Dash ≤720 fill purple void (invent Fun/Clear)
{
  const indexCss189 = readFileSync(new URL('../src/index.css', import.meta.url), 'utf8')
  const fatherPlay189 = readFileSync(
    new URL('../src/components/challenges/FatherRunPlay.tsx', import.meta.url),
    'utf8',
  )
  assert.match(indexCss189, /1\.4\.189: Easy Father Dash ≤720 fill purple void/)
  assert.match(
    indexCss189,
    /@media \(max-height: 720px\) \{[\s\S]*?\.play\.is-father-run,[\s\S]*?flex: 1 1 auto/,
  )
  assert.match(
    indexCss189,
    /@media \(max-height: 720px\) \{[\s\S]*?\.play\.is-father-run \.run-scene \{[\s\S]*?flex: 1 1 auto/,
  )
  assert.match(
    indexCss189,
    /@media \(max-height: 720px\) \{[\s\S]*?\.play\.is-father-run \.run-scene \{[\s\S]*?height: auto/,
  )
  assert.match(fatherPlay189, /1\.4\.189: ≤720 fills purple void/)
  assert.match(cssSrc, /1\.4\.189: Easy Father Dash ≤720 fill purple void/)
  assert.match(latestChange('1.4.189').items.join('\n'), /Father Dash.*≤720|purple void under the pad/i)
  assert.doesNotMatch(
    latestChange('1.4.189').items.join('\n'),
    /Fixes #238|Fixes #239|Fixes #240|Lock In win-end|Match \(picture|empty purple card|Story Snap|eyebrow|Creed merge|Fixes #232|empty-lot|Fixes #217|Build Argument ≤720 fill|Easy Link ≤720 fill/i,
    '1.4.189 must not re-claim Match / Lock In / Samaritan / Snap / Creed / Manage / letterbox / Build / Link',
  )
}
// Easy Clear 1.4.190: Easy Hold ≤720 fill purple void (invent Fun/Clear)
{
  const holdCss190 = readFileSync(new URL('../src/styles/sortHold.css', import.meta.url), 'utf8')
  const whyPlay190 = readFileSync(
    new URL('../src/components/challenges/WhyBlastPlay.tsx', import.meta.url),
    'utf8',
  )
  assert.match(holdCss190, /1\.4\.190: Easy Hold ≤720 fill purple void/)
  assert.match(
    holdCss190,
    /@media \(max-height: 720px\) \{[\s\S]*?\.why-blast \{[\s\S]*?flex: 1 1 auto/,
  )
  assert.match(
    holdCss190,
    /@media \(max-height: 720px\) \{[\s\S]*?\.why-blast \.why-arena \{[\s\S]*?grid-template-rows: minmax\(0, 1fr\) auto minmax\(0, 1fr\)/,
  )
  assert.match(
    holdCss190,
    /@media \(max-height: 720px\) \{[\s\S]*?\.why-blast \.why-chip \{[\s\S]*?height: 100%/,
  )
  assert.match(whyPlay190, /1\.4\.190: ≤720 fills purple void/)
  assert.match(cssSrc, /1\.4\.190: Easy Hold ≤720 fill purple void/)
  assert.match(latestChange('1.4.190').items.join('\n'), /Easy Hold.*≤720|purple void under the CTA/i)
  assert.doesNotMatch(
    latestChange('1.4.190').items.join('\n'),
    /Fixes #238|Fixes #239|Fixes #240|Lock In win-end|Match \(picture|empty purple card|Story Snap|eyebrow|Creed merge|Fixes #232|empty-lot|Fixes #217|Build Argument ≤720 fill|Easy Link ≤720 fill|Father Dash ≤720 fill/i,
    '1.4.190 must not re-claim Match / Lock In win-end / Samaritan / Snap / Creed / Manage / letterbox / Build / Link / Father Dash',
  )
}



// Easy Clear 1.4.195: Lock In feedback / miss teach ≤720 fill purple void (Fixes #252)
{
  const holdCss195 = readFileSync(new URL('../src/styles/sortHold.css', import.meta.url), 'utf8')
  const whyPlay195 = readFileSync(
    new URL('../src/components/challenges/WhyBlastPlay.tsx', import.meta.url),
    'utf8',
  )
  assert.match(holdCss195, /1\.4\.195: Lock In feedback \/ miss teach ≤720 fill purple void/)
  assert.match(
    holdCss195,
    /@media \(max-height: 720px\) \{[\s\S]*?\.journal\.is-rehearse:has\(\.why-blast\.is-miss-teach\) \{[\s\S]*?flex: 1 1 auto/,
  )
  assert.match(
    holdCss195,
    /@media \(max-height: 720px\) \{[\s\S]*?\.journal\.is-rehearse:has\(\.why-blast\.is-miss-teach\) \.recall-gate\.is-easy-hold \{[\s\S]*?flex: 1 1 auto/,
  )
  assert.match(
    holdCss195,
    /@media \(max-height: 720px\) \{[\s\S]*?\.app\.is-play \.app-body:has\(\.journal\.is-rehearse \.why-blast\.is-miss-teach\) \{[\s\S]*?display: flex/,
  )
  assert.match(
    holdCss195,
    /@media \(max-height: 720px\) \{[\s\S]*?\.why-blast\.is-miss-teach \.why-miss-teach \{[\s\S]*?flex: 1 1 auto/,
  )
  assert.match(whyPlay195, /1\.4\.195: ≤720 grows journal miss-teach shell/)
  assert.match(cssSrc, /1\.4\.195: Lock In feedback \/ miss teach ≤720 fill purple void/)
  assert.match(latestChange('1.4.195').items.join('\n'), /Fixes #252|bottom third|purple void/i)
  assert.match(latestChange('1.4.195').title, /Lock In feedback|≤720|purple void/i)
  assert.doesNotMatch(
    latestChange('1.4.195').items.join('\n'),
    /Fixes #250|Fixes #251|Fixes #253|Lock In quiz|Father.*slider|grid→footer|Creed merge ≤720 fill|Story Creek ≤720 fill|Easy Hold.*≤720 fill|gem-board|Build Argument ≤720 fill|Easy Link ≤720 fill|Father Dash ≤720 fill|maze-board|merge-bowl|stored-line|Fixes #239/i,
    '1.4.195 must not pack #250/#251/#253 or re-claim quiz / Match / Hold arena / win-end / Creed / Story Creek / Link / Build / Father / maze / bowl',
  )
}

// Easy Clear 1.4.196: Father ≤720 slider→CTA purple gap (Fixes #253)
{
  const indexCss196 = readFileSync(new URL('../src/index.css', import.meta.url), 'utf8')
  const fatherPlay196 = readFileSync(
    new URL('../src/components/challenges/FatherRunPlay.tsx', import.meta.url),
    'utf8',
  )
  assert.match(indexCss196, /1\.4\.196: Easy Father ≤720 slider→CTA purple gap/)
  assert.match(
    indexCss196,
    /@media \(max-height: 720px\) \{[\s\S]*?\.play\.is-father-run \.cta-dock,[\s\S]*?margin-top: 0/,
  )
  assert.match(fatherPlay196, /1\.4\.196: ≤720 zeros cta-dock margin-top/)
  assert.match(cssSrc, /1\.4\.196: Easy Father ≤720 slider→CTA purple gap/)
  assert.match(latestChange('1.4.196').items.join('\n'), /Fixes #253|slider→CTA|purple void/i)
  assert.match(latestChange('1.4.196').title, /Father|≤720|slider→CTA|purple gap/i)
  assert.doesNotMatch(
    latestChange('1.4.196').items.join('\n'),
    /Fixes #250|Fixes #251|Fixes #252|Lock In quiz|Lock In feedback|grid→footer|Creed merge ≤720 fill|Story Creek ≤720 fill|Easy Hold.*≤720 fill|gem-board|Build Argument ≤720 fill|Easy Link ≤720 fill|maze-board|merge-bowl|stored-line|Fixes #239|why-miss-teach/i,
    '1.4.196 must not pack #250/#251/#252 or re-claim Match / Lock In / Hold / Creed / Story Creek / Link / Build / maze / bowl',
  )
}


// Easy Clear 1.4.197: Easy Story Snap ≤720 fill purple void (invent Fun/Clear)
{
  const snapCss197 = readFileSync(new URL('../src/styles/storySnap.css', import.meta.url), 'utf8')
  const snapPlay197 = readFileSync(
    new URL('../src/components/challenges/StorySnapPlayView.tsx', import.meta.url),
    'utf8',
  )
  assert.match(snapCss197, /1\.4\.197: Easy Story Snap ≤720 fill purple void/)
  assert.match(
    snapCss197,
    /@media \(max-height: 720px\) \{[\s\S]*?\.play\.is-story-snap \{[\s\S]*?flex: 1 1 auto/,
  )
  assert.match(
    snapCss197,
    /@media \(max-height: 720px\) \{[\s\S]*?\.play\.is-story-snap \.snap-stage \{[\s\S]*?flex: 1 1 auto/,
  )
  assert.match(snapPlay197, /1\.4\.197: ≤720 fills purple void/)
  assert.match(cssSrc, /1\.4\.197: Easy Story Snap ≤720 fill purple void/)
  assert.match(latestChange('1.4.197').items.join('\n'), /Story Snap.*≤720|purple void under the Hold pad/i)
  assert.match(latestChange('1.4.197').title, /Story Snap|≤720|purple void/i)
  assert.doesNotMatch(
    latestChange('1.4.197').items.join('\n'),
    /Fixes #250|Fixes #251|Fixes #252|Fixes #253|Lock In quiz|Lock In feedback|Father.*slider|grid→footer|Creed merge ≤720 fill|Story Creek ≤720 fill|Easy Hold.*≤720 fill|gem-board|Build Argument ≤720 fill|Easy Link ≤720 fill|Father Dash ≤720 fill|maze-board|merge-bowl|Easy Sort ≤720/i,
    '1.4.197 must not re-peel Shot 190 fails #250–#253 or Match / Lock In / Father / Hold / Creed / Story Creek / Sort / Build / Link / maze / bowl',
  )
}


// Easy Clear 1.4.198: Easy Sort ≤720 fill purple void (invent Fun/Clear)
{
  const holdCss198 = readFileSync(new URL('../src/styles/sortHold.css', import.meta.url), 'utf8')
  const sortPlay198 = readFileSync(
    new URL('../src/components/challenges/SortPlay.tsx', import.meta.url),
    'utf8',
  )
  assert.match(holdCss198, /1\.4\.198: Easy Sort ≤720 fill purple void/)
  assert.match(
    holdCss198,
    /@media \(max-height: 720px\) \{[\s\S]*?\.play\.is-easy-sort \{[\s\S]*?flex: 1 1 auto/,
  )
  assert.match(
    holdCss198,
    /@media \(max-height: 720px\) \{[\s\S]*?\.play\.is-easy-sort \.bank\.is-sort \{[\s\S]*?max-height: none/,
  )
  assert.match(
    holdCss198,
    /@media \(max-height: 720px\) \{[\s\S]*?\.play\.is-easy-sort \.sort-bins \{[\s\S]*?max-height: none/,
  )
  assert.match(sortPlay198, /1\.4\.198: ≤720 fills purple void/)
  assert.match(cssSrc, /1\.4\.198: Easy Sort ≤720 fill purple void/)
  assert.match(latestChange('1.4.198').items.join('\n'), /Easy Sort.*≤720|purple void under the bins/i)
  assert.match(latestChange('1.4.198').title, /Easy Sort|≤720|purple void/i)
  assert.doesNotMatch(
    latestChange('1.4.198').items.join('\n'),
    /Fixes #250|Fixes #251|Fixes #252|Fixes #253|Lock In quiz|Lock In feedback|Father.*slider|grid→footer|Creed merge ≤720 fill|Story Creek ≤720 fill|Easy Hold.*≤720 fill|gem-board|Build Argument ≤720 fill|Easy Link ≤720 fill|Father Dash ≤720 fill|maze-board|merge-bowl|Story Snap ≤720 fill|snap-stage/i,
    '1.4.198 must not re-peel Shot 190 fails #250–#253 or Story Snap 197 / Match / Lock In / Father / Hold / Creed / Story Creek / Build / Link / maze / bowl',
  )
}


// Easy Clear 1.4.199: Easy Link ≤720 close choices→CTA purple gap (invent Fun/Clear)
{
  const indexCss199 = readFileSync(new URL('../src/index.css', import.meta.url), 'utf8')
  const linkPlay199 = readFileSync(
    new URL('../src/components/challenges/LinkPlay.tsx', import.meta.url),
    'utf8',
  )
  assert.match(indexCss199, /1\.4\.199: Easy Link ≤720 close choices→CTA purple gap/)
  assert.match(
    indexCss199,
    /@media \(max-height: 720px\) \{[\s\S]*?\.play\.is-easy-link \.link-dock \{[\s\S]*?margin-top: 0/,
  )
  assert.match(linkPlay199, /1\.4\.199: ≤720 zeros link-dock margin-top/)
  assert.match(cssSrc, /1\.4\.199: Easy Link ≤720 close choices→CTA purple gap/)
  assert.match(latestChange('1.4.199').items.join('\n'), /choices→CTA|link-dock|purple void between the picture choices/i)
  assert.match(latestChange('1.4.199').title, /Easy Link|≤720|choices→CTA|purple gap/i)
  assert.doesNotMatch(
    latestChange('1.4.199').items.join('\n'),
    /Fixes #250|Fixes #251|Fixes #252|Fixes #253|Lock In quiz|Lock In feedback|Father.*slider|grid→footer|Creed merge ≤720 fill|Story Creek ≤720 fill|Easy Hold.*≤720 fill|gem-board|Build Argument ≤720 fill|Easy Sort ≤720 fill|Father Dash ≤720 fill|maze-board|merge-bowl|Story Snap ≤720 fill|snap-stage|bank\.is-sort|sort-bins/i,
    '1.4.199 must not re-peel Shot 190 fails #250–#253 or Sort 198 / Story Snap 197 / Match / Lock In / Father / Hold / Creed / Story Creek / Build / maze / bowl',
  )
}


// Easy Clear 1.4.200: Easy Creed ≤720 close bowl→CTA purple gap (invent Fun/Clear · Shot wake)
{
  const indexCss200 = readFileSync(new URL('../src/index.css', import.meta.url), 'utf8')
  const mergePlay200 = readFileSync(
    new URL('../src/components/challenges/ClaimMergePlay.tsx', import.meta.url),
    'utf8',
  )
  assert.match(indexCss200, /1\.4\.200: Easy Creed ≤720 close bowl→CTA purple gap/)
  assert.match(
    indexCss200,
    /@media \(max-height: 720px\) \{[\s\S]*?\.play\.is-claim-merge \.cta-dock \{[\s\S]*?margin-top: 0/,
  )
  assert.match(mergePlay200, /1\.4\.200: ≤720 zeros cta-dock margin-top/)
  assert.match(cssSrc, /1\.4\.200: Easy Creed ≤720 close bowl→CTA purple gap/)
  assert.match(latestChange('1.4.200').items.join('\n'), /bowl→CTA|cta-dock|purple void between the bowl/i)
  assert.match(latestChange('1.4.200').title, /Easy Creed|≤720|bowl→CTA|purple gap/i)
  assert.doesNotMatch(
    latestChange('1.4.200').items.join('\n'),
    /Fixes #250|Fixes #251|Fixes #252|Fixes #253|Lock In quiz|Lock In feedback|Father.*slider|grid→footer|Story Creek ≤720 fill|Easy Hold.*≤720 fill|gem-board|Build Argument ≤720 fill|Easy Sort ≤720 fill|Father Dash ≤720 fill|maze-board|Story Snap ≤720 fill|snap-stage|bank\.is-sort|sort-bins|choices→CTA|link-dock|Easy Link ≤720 fill/i,
    '1.4.200 must not re-peel Shot 190 fails #250–#253 or Link 199 / Sort 198 / Story Snap 197 / Match / Lock In / Father / Hold / Story Creek / Build / maze',
  )
}


// Easy Clear 1.4.201: Easy Story Creek ≤720 close board→CTA purple gap (invent Fun/Clear)
{
  const mazeCss201 = readFileSync(new URL('../src/styles/maze.css', import.meta.url), 'utf8')
  const mazePlay201 = readFileSync(
    new URL('../src/components/challenges/RoadMazePlay.tsx', import.meta.url),
    'utf8',
  )
  assert.match(mazeCss201, /1\.4\.201: Easy Story Creek ≤720 close board→CTA purple gap/)
  assert.match(
    mazeCss201,
    /@media \(max-height: 720px\) \{[\s\S]*?\.play\.is-road-maze \.cta-dock \{[\s\S]*?margin-top: 0/,
  )
  assert.match(mazePlay201, /1\.4\.201: ≤720 zeros cta-dock margin-top/)
  assert.match(cssSrc, /1\.4\.201: Easy Story Creek ≤720 close board→CTA purple gap/)
  assert.match(latestChange('1.4.201').items.join('\n'), /board→CTA|cta-dock|purple void between the board/i)
  assert.match(latestChange('1.4.201').title, /Story Creek|≤720|board→CTA|purple gap/i)
  assert.doesNotMatch(
    latestChange('1.4.201').items.join('\n'),
    /Fixes #250|Fixes #251|Fixes #252|Fixes #253|Lock In quiz|Lock In feedback|Father.*slider|grid→footer|Easy Hold.*≤720 fill|gem-board|Build Argument ≤720 fill|Easy Sort ≤720 fill|Father Dash ≤720 fill|Story Snap ≤720 fill|snap-stage|bank\.is-sort|sort-bins|choices→CTA|link-dock|Easy Link ≤720 fill|bowl→CTA|Easy Creed ≤720 fill|merge-bowl/i,
    '1.4.201 must not re-peel Shot 190 fails #250–#253 or Creed 200 / Link 199 / Sort 198 / Story Snap 197 / Match / Lock In / Father / Hold / Build',
  )
}


// Easy Clear 1.4.202: Easy Hold ≤720 close chips→CTA purple gap (invent Fun/Clear)
{
  const holdCss202 = readFileSync(new URL('../src/styles/sortHold.css', import.meta.url), 'utf8')
  const whyPlay202 = readFileSync(
    new URL('../src/components/challenges/WhyBlastPlay.tsx', import.meta.url),
    'utf8',
  )
  assert.match(holdCss202, /1\.4\.202: Easy Hold ≤720 close chips→CTA purple gap/)
  assert.match(
    holdCss202,
    /@media \(max-height: 720px\) \{[\s\S]*?\.why-blast \.cta-dock \{[\s\S]*?margin-top: 0/,
  )
  assert.match(whyPlay202, /1\.4\.202: ≤720 zeros cta-dock margin-top/)
  assert.match(cssSrc, /1\.4\.202: Easy Hold ≤720 close chips→CTA purple gap/)
  assert.match(latestChange('1.4.202').items.join('\n'), /chips→CTA|cta-dock|purple void between the chips/i)
  assert.match(latestChange('1.4.202').title, /Easy Hold|≤720|chips→CTA|purple gap/i)
  assert.doesNotMatch(
    latestChange('1.4.202').items.join('\n'),
    /Fixes #250|Fixes #251|Fixes #252|Fixes #253|Lock In quiz|Lock In feedback|Father.*slider|grid→footer|gem-board|Build Argument ≤720 fill|Easy Sort ≤720 fill|Father Dash ≤720 fill|Story Snap ≤720 fill|snap-stage|bank\.is-sort|sort-bins|choices→CTA|link-dock|Easy Link ≤720 fill|bowl→CTA|Easy Creed ≤720 fill|merge-bowl|board→CTA|Story Creek ≤720 fill|maze-board|Easy Hold.*≤720 fill/i,
    '1.4.202 must not re-peel Shot 190 fails #250–#253 or Story Creek 201 / Creed 200 / Link 199 / Sort 198 / Story Snap 197 / Match / Lock In quiz·miss / Father / Build / Hold fill',
  )
}


// Easy Clear 1.4.203: Easy Build ≤720 fill free-place purple void (invent Fun/Clear)
{
  const holdCss203 = readFileSync(new URL('../src/styles/sortHold.css', import.meta.url), 'utf8')
  const buildPlay203 = readFileSync(
    new URL('../src/components/challenges/BuildArgumentPlay.tsx', import.meta.url),
    'utf8',
  )
  assert.match(holdCss203, /1\.4\.203: Easy Build ≤720 fill free-place purple void/)
  assert.match(
    holdCss203,
    /@media \(max-height: 720px\) \{[\s\S]*?\.play\.is-build:not\(\.is-deal\) \.slot-list \{[\s\S]*?flex: 1 1 auto/,
  )
  assert.match(
    holdCss203,
    /@media \(max-height: 720px\) \{[\s\S]*?\.play\.is-build:not\(\.is-deal\) \.bank\.is-order \{[\s\S]*?max-height: none/,
  )
  assert.match(
    holdCss203,
    /@media \(max-height: 720px\) \{[\s\S]*?\.play\.is-build:not\(\.is-deal\) \.build-lock[\s\S]*?margin-top: 0/,
  )
  assert.match(buildPlay203, /1\.4\.203: ≤720 fills free-place purple void/)
  assert.match(cssSrc, /1\.4\.203: Easy Build ≤720 fill free-place purple void/)
  assert.match(latestChange('1.4.203').items.join('\n'), /free-place|non-deal|purple void under the lock/i)
  assert.match(latestChange('1.4.203').title, /Easy Build|≤720|free-place|purple void/i)
  assert.doesNotMatch(
    latestChange('1.4.203').items.join('\n'),
    /Fixes #250|Fixes #251|Fixes #252|Fixes #253|Lock In quiz|Lock In feedback|Father.*slider|grid→footer|gem-board|Easy Sort ≤720 fill|Father Dash ≤720 fill|Story Snap ≤720 fill|snap-stage|bank\.is-sort|sort-bins|choices→CTA|link-dock|Easy Link ≤720 fill|bowl→CTA|Easy Creed ≤720 fill|merge-bowl|board→CTA|Story Creek ≤720 fill|maze-board|chips→CTA|Easy Hold.*≤720 fill|Build Argument ≤720 fill/i,
    '1.4.203 must not re-peel Shot 190 fails #250–#253 or Hold 202 / Creek 201 / Creed 200 / Link 199 / Sort 198 / Snap 197 / Match / Lock In / Father / Hold / deal Build fill 187',
  )
}


// Easy Clear 1.4.204: Easy Father ≤720 close speech→rail purple gap (invent Fun/Clear)
{
  const indexCss204 = readFileSync(new URL('../src/index.css', import.meta.url), 'utf8')
  const fatherPlay204 = readFileSync(
    new URL('../src/components/challenges/FatherRunPlay.tsx', import.meta.url),
    'utf8',
  )
  assert.match(indexCss204, /1\.4\.204: Easy Father ≤720 close speech→rail purple gap/)
  assert.match(
    indexCss204,
    /@media \(max-height: 720px\) \{[\s\S]*?\.play\.is-father-run \.run-speech \{[\s\S]*?margin: 0/,
  )
  assert.match(
    indexCss204,
    /@media \(max-height: 720px\) \{[\s\S]*?\.play\.is-father-run \.run-rail \{[\s\S]*?margin: 0/,
  )
  assert.match(fatherPlay204, /1\.4\.204: ≤720 closes speech→rail purple gap/)
  assert.match(cssSrc, /1\.4\.204: Easy Father ≤720 close speech→rail purple gap/)
  assert.match(latestChange('1.4.204').items.join('\n'), /speech→rail|run-speech|purple band between the speech/i)
  assert.match(latestChange('1.4.204').title, /Easy Father|≤720|speech→rail|purple gap/i)
  assert.doesNotMatch(
    latestChange('1.4.204').items.join('\n'),
    /Fixes #250|Fixes #251|Fixes #252|Fixes #253|Lock In quiz|Lock In feedback|grid→footer|gem-board|Easy Sort ≤720 fill|Father Dash ≤720 fill|Story Snap ≤720 fill|snap-stage|bank\.is-sort|sort-bins|choices→CTA|link-dock|Easy Link ≤720 fill|bowl→CTA|Easy Creed ≤720 fill|merge-bowl|board→CTA|Story Creek ≤720 fill|maze-board|chips→CTA|Easy Hold.*≤720 fill|Build Argument ≤720 fill|free-place|slider→CTA/i,
    '1.4.204 must not re-peel Shot 190 fails #250–#253 or Build 203 / Hold 202 / Creek 201 / Creed 200 / Link 199 / Sort 198 / Snap 197 / Match / Lock In / Father fill·dock',
  )
}


// Easy Clear 1.4.205: Easy Sequence ≤720 close stones→result purple gap (invent Fun/Clear)
{
  const holdCss205 = readFileSync(new URL('../src/styles/sortHold.css', import.meta.url), 'utf8')
  const seqPlay205 = readFileSync(
    new URL('../src/components/challenges/SequencePlay.tsx', import.meta.url),
    'utf8',
  )
  assert.match(holdCss205, /1\.4\.205: Easy Sequence ≤720 close stones→result purple gap/)
  assert.match(
    holdCss205,
    /@media \(max-height: 720px\) \{[\s\S]*?\.play\.is-sequence\.is-deal \{[\s\S]*?gap: 2px/,
  )
  assert.match(
    holdCss205,
    /@media \(max-height: 720px\) \{[\s\S]*?\.play\.is-sequence\.is-deal \.result[\s\S]*?margin: 0/,
  )
  assert.match(seqPlay205, /1\.4\.205: ≤720 closes stones→result purple gap/)
  assert.match(cssSrc, /1\.4\.205: Easy Sequence ≤720 close stones→result purple gap/)
  assert.match(latestChange('1.4.205').items.join('\n'), /stones→result|ResultPanel|purple band between the stones/i)
  assert.match(latestChange('1.4.205').title, /Easy Sequence|≤720|stones→result|purple gap/i)
  assert.doesNotMatch(
    latestChange('1.4.205').items.join('\n'),
    /Fixes #250|Fixes #251|Fixes #252|Fixes #253|Lock In quiz|Lock In feedback|grid→footer|gem-board|Easy Sort ≤720 fill|Father Dash ≤720 fill|Story Snap ≤720 fill|snap-stage|bank\.is-sort|sort-bins|choices→CTA|link-dock|Easy Link ≤720 fill|bowl→CTA|Easy Creed ≤720 fill|merge-bowl|board→CTA|Story Creek ≤720 fill|maze-board|chips→CTA|Easy Hold.*≤720 fill|Build Argument ≤720 fill|free-place|slider→CTA|speech→rail|Easy Father ≤720 fill/i,
    '1.4.205 must not re-peel Shot 190 fails #250–#253 or Father 204 / Build 203 / Hold 202 / Creek 201 / Creed 200 / Link 199 / Sort 198 / Snap 197 / Match / Lock In',
  )
}

// Easy Clear 1.4.206: Easy Learn ≤720 fill held-clear purple void (invent Fun/Clear)
{
  const welcomeCss206 = readFileSync(new URL('../src/styles/welcome.css', import.meta.url), 'utf8')
  const teachUnlock206 = readFileSync(
    new URL('../src/components/TeachUnlock.tsx', import.meta.url),
    'utf8',
  )
  assert.match(welcomeCss206, /1\.4\.206: Easy Learn ≤720 fill held-clear purple void/)
  assert.match(
    welcomeCss206,
    /@media \(max-height: 720px\) \{[\s\S]*?\.challenge-page\.is-teach:has\(\.easy-story-card\) \{[\s\S]*?flex: 1/,
  )
  assert.match(
    welcomeCss206,
    /@media \(max-height: 720px\) \{[\s\S]*?\.easy-story-card \.held-triad \{[\s\S]*?flex: 1 1 auto/,
  )
  assert.match(
    welcomeCss206,
    /@media \(max-height: 720px\) \{[\s\S]*?\.easy-story-card \.easy-story-dock \{[\s\S]*?margin-top: 0/,
  )
  assert.match(teachUnlock206, /1\.4\.206: ≤720 fills held-clear purple void/)
  assert.match(cssSrc, /1\.4\.206: Easy Learn ≤720 fill held-clear purple void/)
  assert.match(latestChange('1.4.206').items.join('\n'), /held-clear|HeldTriad|claim·reason·source|easy-story-card/i)
  assert.match(latestChange('1.4.206').title, /Easy Learn|≤720|held-clear|purple void/i)
  assert.doesNotMatch(
    latestChange('1.4.206').items.join('\n'),
    /Fixes #250|Fixes #251|Fixes #252|Fixes #253|Lock In quiz|Lock In feedback|grid→footer|gem-board|Easy Sort ≤720 fill|Father Dash ≤720 fill|Story Snap ≤720 fill|snap-stage|bank\.is-sort|sort-bins|choices→CTA|link-dock|Easy Link ≤720 fill|bowl→CTA|Easy Creed ≤720 fill|merge-bowl|board→CTA|Story Creek ≤720 fill|maze-board|chips→CTA|Easy Hold.*≤720 fill|Build Argument ≤720 fill|free-place|slider→CTA|speech→rail|Easy Father ≤720 fill|stones→result|Easy Sequence ≤720/i,
    '1.4.206 must not re-peel Shot 190 fails #250–#253 or Sequence 205 / Father 204 / Build 203 / Hold 202 / Creek 201 / Creed 200 / Link 199 / Sort 198 / Snap 197 / Match / Lock In',
  )
}

// Easy Clear 1.4.207: Easy Match ≤720 close score→CTA purple gap (invent Fun/Clear)
{
  const matchCss207 = readFileSync(new URL('../src/styles/match.css', import.meta.url), 'utf8')
  const matchPlay207 = readFileSync(
    new URL('../src/components/challenges/MatchPlay.tsx', import.meta.url),
    'utf8',
  )
  assert.match(matchCss207, /1\.4\.207: Easy Match ≤720 close score→CTA purple gap/)
  assert.match(
    matchCss207,
    /@media \(max-height: 720px\) \{[\s\S]*?\.play\.is-match\.is-deal \.cta-dock \{[\s\S]*?margin-top: 0/,
  )
  assert.match(matchPlay207, /1\.4\.207: ≤720 zeros cta-dock margin-top so score→CTA close/)
  assert.match(cssSrc, /1\.4\.207: Easy Match ≤720 close score→CTA purple gap/)
  assert.match(latestChange('1.4.207').items.join('\n'), /score→CTA|cta-dock|match-score|purple band between the score/i)
  assert.match(latestChange('1.4.207').title, /Easy Match|≤720|score→CTA|purple gap/i)
  assert.doesNotMatch(
    latestChange('1.4.207').items.join('\n'),
    /Fixes #250|Fixes #251|Fixes #252|Fixes #253|Lock In quiz|Lock In feedback|grid→footer|gem-board|Easy Sort ≤720 fill|Father Dash ≤720 fill|Story Snap ≤720 fill|snap-stage|bank\.is-sort|sort-bins|choices→CTA|link-dock|Easy Link ≤720 fill|bowl→CTA|Easy Creed ≤720 fill|merge-bowl|board→CTA|Story Creek ≤720 fill|maze-board|chips→CTA|Easy Hold.*≤720 fill|Build Argument ≤720 fill|free-place|slider→CTA|speech→rail|Easy Father ≤720 fill|stones→result|Easy Sequence ≤720|held-clear|Easy Learn ≤720|empty purple card/i,
    '1.4.207 must not re-peel Shot 190 fails #250–#253 or Learn 206 / Sequence 205 / Father 204 / Build 203 / Hold 202 / Creek 201 / Creed 200 / Link 199 / Sort 198 / Snap 197 / Match fill 184 / Lock In',
  )
}

// Easy Clear 1.4.208: Easy Lock In win-end ≤720 close triad→Home purple gap (invent Fun/Clear)
{
  const holdCss208 = readFileSync(new URL('../src/styles/sortHold.css', import.meta.url), 'utf8')
  const storedLine208 = readFileSync(
    new URL('../src/components/StoredLine.tsx', import.meta.url),
    'utf8',
  )
  assert.match(holdCss208, /1\.4\.208: Easy Lock In win-end ≤720 close triad→Home purple gap/)
  assert.match(
    holdCss208,
    /@media \(max-height: 720px\) \{[\s\S]*?\.challenge-page\.is-after:has\(\.stored-line\) \.after-win \{[\s\S]*?gap: 2px/,
  )
  assert.match(
    holdCss208,
    /@media \(max-height: 720px\) \{[\s\S]*?\.stored-line \.held-triad \{[\s\S]*?gap: 6px/,
  )
  assert.match(storedLine208, /1\.4\.208: ≤720 closes triad→Home purple gap/)
  assert.match(cssSrc, /1\.4\.208: Easy Lock In win-end ≤720 close triad→Home purple gap/)
  assert.match(latestChange('1.4.208').items.join('\n'), /triad→Home|held-triad|TownReturn|StoredLine|purple band between the triad/i)
  assert.match(latestChange('1.4.208').title, /Lock In win-end|≤720|triad→Home|purple gap/i)
  assert.doesNotMatch(
    latestChange('1.4.208').items.join('\n'),
    /Fixes #250|Fixes #251|Fixes #252|Fixes #253|Lock In quiz|Lock In feedback|grid→footer|gem-board|Easy Sort ≤720 fill|Father Dash ≤720 fill|Story Snap ≤720 fill|snap-stage|bank\.is-sort|sort-bins|choices→CTA|link-dock|Easy Link ≤720 fill|bowl→CTA|Easy Creed ≤720 fill|merge-bowl|board→CTA|Story Creek ≤720 fill|maze-board|chips→CTA|Easy Hold.*≤720 fill|Build Argument ≤720 fill|free-place|slider→CTA|speech→rail|Easy Father ≤720 fill|stones→result|Easy Sequence ≤720|held-clear|Easy Learn ≤720|empty purple card|score→CTA|Easy Match ≤720/i,
    '1.4.208 must not re-peel Shot 190 fails #250–#253 or Match 207 / Learn 206 / Sequence 205 / Father 204 / Build 203 / Hold 202 / Creek 201 / Creed 200 / Link 199 / Sort 198 / Snap 197 / Lock In quiz·miss',
  )
}

// Easy Clear 1.4.209: Easy Story Snap ≤720 close pad→CTA purple gap (invent Fun/Clear)
{
  const snapCss209 = readFileSync(new URL('../src/styles/storySnap.css', import.meta.url), 'utf8')
  const snapPlay209 = readFileSync(
    new URL('../src/components/challenges/StorySnapPlayView.tsx', import.meta.url),
    'utf8',
  )
  assert.match(snapCss209, /1\.4\.209: Easy Story Snap ≤720 close pad→CTA purple gap/)
  assert.match(
    snapCss209,
    /@media \(max-height: 720px\) \{[\s\S]*?\.play\.is-story-snap \.cta-dock \{[\s\S]*?margin-top: 0/,
  )
  assert.match(
    snapCss209,
    /@media \(max-height: 720px\) \{[\s\S]*?\.play\.is-story-snap[\s\S]*?gap: 0\.12rem/,
  )
  assert.match(snapPlay209, /1\.4\.209: ≤720 zeros cta-dock margin-top so pad→CTA close/)
  assert.match(cssSrc, /1\.4\.209: Easy Story Snap ≤720 close pad→CTA purple gap/)
  assert.match(latestChange('1.4.209').items.join('\n'), /pad→CTA|cta-dock|Hold pad|purple band between the pad/i)
  assert.match(latestChange('1.4.209').title, /Story Snap|≤720|pad→CTA|purple gap/i)
  assert.doesNotMatch(
    latestChange('1.4.209').items.join('\n'),
    /Fixes #250|Fixes #251|Fixes #252|Fixes #253|Lock In quiz|Lock In feedback|grid→footer|gem-board|Easy Sort ≤720 fill|Father Dash ≤720 fill|Story Snap ≤720 fill|snap-stage|bank\.is-sort|sort-bins|choices→CTA|link-dock|Easy Link ≤720 fill|bowl→CTA|Easy Creed ≤720 fill|merge-bowl|board→CTA|Story Creek ≤720 fill|maze-board|chips→CTA|Easy Hold.*≤720 fill|Build Argument ≤720 fill|free-place|slider→CTA|speech→rail|Easy Father ≤720 fill|stones→result|Easy Sequence ≤720|held-clear|Easy Learn ≤720|empty purple card|score→CTA|Easy Match ≤720|triad→Home|Lock In win-end/i,
    '1.4.209 must not re-peel Shot 190 fails #250–#253 or Lock In win-end 208 / Match 207 / Learn 206 / Sequence 205 / Father 204 / Build 203 / Hold 202 / Creek 201 / Creed 200 / Link 199 / Sort 198 / Snap fill 197',
  )
}

// Easy Clear 1.4.210: Easy Hold ≤720 close hud→arena purple gap (invent Fun/Clear; Shot wake)
{
  const holdCss210 = readFileSync(new URL('../src/styles/sortHold.css', import.meta.url), 'utf8')
  const whyBlast210 = readFileSync(
    new URL('../src/components/challenges/WhyBlastPlay.tsx', import.meta.url),
    'utf8',
  )
  assert.match(holdCss210, /1\.4\.210: Easy Hold ≤720 close hud→arena purple gap/)
  assert.match(
    holdCss210,
    /@media \(max-height: 720px\) \{[\s\S]*?\.why-blast \{[\s\S]*?gap: 2px/,
  )
  assert.match(
    holdCss210,
    /@media \(max-height: 720px\) \{[\s\S]*?\.why-blast \.why-arena \{[\s\S]*?gap: 4px/,
  )
  assert.match(whyBlast210, /1\.4\.210: ≤720 closes hud→arena purple gap/)
  assert.match(cssSrc, /1\.4\.210: Easy Hold ≤720 close hud→arena purple gap/)
  assert.match(latestChange('1.4.210').items.join('\n'), /hud→arena|why-blast|why-arena|purple band between the hud/i)
  assert.match(latestChange('1.4.210').title, /Easy Hold|≤720|hud→arena|purple gap/i)
  assert.doesNotMatch(
    latestChange('1.4.210').items.join('\n'),
    /Fixes #250|Fixes #251|Fixes #252|Fixes #253|Lock In quiz|Lock In feedback|grid→footer|gem-board|Easy Sort ≤720 fill|Father Dash ≤720 fill|Story Snap ≤720 fill|snap-stage|bank\.is-sort|sort-bins|choices→CTA|link-dock|Easy Link ≤720 fill|bowl→CTA|Easy Creed ≤720 fill|merge-bowl|board→CTA|Story Creek ≤720 fill|maze-board|chips→CTA|Easy Hold.*≤720 fill|Build Argument ≤720 fill|free-place|slider→CTA|speech→rail|Easy Father ≤720 fill|stones→result|Easy Sequence ≤720|held-clear|Easy Learn ≤720|empty purple card|score→CTA|Easy Match ≤720|triad→Home|Lock In win-end|pad→CTA/i,
    '1.4.210 must not re-peel Shot 190 fails #250–#253 or Snap2 209 / StoredLine 208 / Match 207 / Learn 206 / Sequence 205 / Father 204 / Build 203 / Hold dock 202 / Creek 201 / Creed 200 / Link 199 / Sort 198 / Snap fill 197',
  )
}











// Easy Clear 1.4.194: Lock In quiz ≤720 fill purple void (Fixes #251)
{
  const holdCss194 = readFileSync(new URL('../src/styles/sortHold.css', import.meta.url), 'utf8')
  const whyPlay194 = readFileSync(
    new URL('../src/components/challenges/WhyBlastPlay.tsx', import.meta.url),
    'utf8',
  )
  assert.match(holdCss194, /1\.4\.194: Lock In quiz ≤720 fill purple void/)
  assert.match(
    holdCss194,
    /@media \(max-height: 720px\) \{[\s\S]*?\.journal\.is-rehearse:has\(\.why-blast:not\(\.is-miss-teach\):not\(\.is-win\)\) \{[\s\S]*?flex: 1 1 auto/,
  )
  assert.match(
    holdCss194,
    /@media \(max-height: 720px\) \{[\s\S]*?\.journal\.is-rehearse:has\(\.why-blast:not\(\.is-miss-teach\):not\(\.is-win\)\) \.recall-gate\.is-easy-hold \{[\s\S]*?flex: 1 1 auto/,
  )
  assert.match(
    holdCss194,
    /@media \(max-height: 720px\) \{[\s\S]*?\.app\.is-play \.app-body:has\(\.journal\.is-rehearse \.why-blast:not\(\.is-miss-teach\):not\(\.is-win\)\) \{[\s\S]*?display: flex/,
  )
  assert.match(whyPlay194, /1\.4\.194: ≤720 grows journal quiz shell/)
  assert.match(cssSrc, /1\.4\.194: Lock In quiz ≤720 fill purple void/)
  assert.match(latestChange('1.4.194').items.join('\n'), /Fixes #251|bottom third|purple void/i)
  assert.match(latestChange('1.4.194').title, /Lock In quiz|≤720|purple void/i)
  assert.doesNotMatch(
    latestChange('1.4.194').items.join('\n'),
    /Fixes #250|Fixes #252|Fixes #253|Lock In feedback|Father.*slider|grid→footer|Creed merge ≤720 fill|Story Creek ≤720 fill|Easy Hold.*≤720 fill|gem-board|Build Argument ≤720 fill|Easy Link ≤720 fill|Father Dash ≤720 fill|maze-board|merge-bowl/i,
    '1.4.194 must not pack #250/#252/#253 or re-claim Match / Hold arena / Creed / Story Creek / Link / Build / Father / maze / bowl',
  )
}

// Easy Clear 1.4.193: Easy Match ≤720 fill purple void (Fixes #250)
{
  const gemCss193 = readFileSync(new URL('../src/styles/gem.css', import.meta.url), 'utf8')
  const gemPlay193 = readFileSync(
    new URL('../src/components/challenges/GemSearchPlay.tsx', import.meta.url),
    'utf8',
  )
  assert.match(gemCss193, /1\.4\.193: Easy Match ≤720 fill purple void/)
  assert.match(
    gemCss193,
    /@media \(max-height: 720px\) \{[\s\S]*?\.play\.is-gem-search\.is-panel-blast\.is-story-docked \{[\s\S]*?flex: 1 1 auto/,
  )
  assert.match(
    gemCss193,
    /@media \(max-height: 720px\) \{[\s\S]*?\.play\.is-gem-search\.is-panel-blast\.is-story-docked \.gem-board \{[\s\S]*?max-height: none/,
  )
  assert.match(
    gemCss193,
    /@media \(max-height: 720px\) \{[\s\S]*?\.play\.is-gem-search\.is-panel-blast\.is-story-docked \.gem-board \{[\s\S]*?aspect-ratio: auto/,
  )
  assert.match(gemPlay193, /1\.4\.193: ≤720 fills purple void/)
  assert.match(cssSrc, /1\.4\.193: Easy Match ≤720 fill purple void/)
  assert.match(latestChange('1.4.193').items.join('\n'), /Fixes #250|grid.*footer|purple void between/i)
  assert.match(latestChange('1.4.193').title, /Easy Match|≤720|purple void/i)
  assert.doesNotMatch(
    latestChange('1.4.193').items.join('\n'),
    /Fixes #251|Fixes #252|Fixes #253|Lock In quiz|Lock In feedback|Father.*slider|Creed merge ≤720 fill|Story Creek ≤720 fill|Easy Hold.*≤720 fill|why-blast|Build Argument ≤720 fill|Easy Link ≤720 fill|Father Dash ≤720 fill|maze-board|merge-bowl/i,
    '1.4.193 must not pack #251/#252/#253 or re-claim Creed / Story Creek / Hold / Link / Build / Father / maze / bowl',
  )
}

// Easy Clear 1.4.192: Easy Creed merge ≤720 fill purple void (invent Fun/Clear)
{
  const mergeCss192 = readFileSync(new URL('../src/index.css', import.meta.url), 'utf8')
  const mergePlay192 = readFileSync(
    new URL('../src/components/challenges/ClaimMergePlay.tsx', import.meta.url),
    'utf8',
  )
  assert.match(mergeCss192, /1\.4\.192: Easy Creed merge ≤720 fill purple void/)
  assert.match(
    mergeCss192,
    /@media \(max-height: 720px\) \{[\s\S]*?\.play\.is-claim-merge \{[\s\S]*?flex: 1 1 auto/,
  )
  assert.match(
    mergeCss192,
    /@media \(max-height: 720px\) \{[\s\S]*?\.play\.is-claim-merge \.merge-bowl \{[\s\S]*?max-height: none/,
  )
  assert.match(
    mergeCss192,
    /@media \(max-height: 720px\) \{[\s\S]*?\.play\.is-claim-merge \.merge-bowl \{[\s\S]*?aspect-ratio: auto/,
  )
  assert.match(mergePlay192, /1\.4\.192: ≤720 fills purple void/)
  assert.match(cssSrc, /1\.4\.192: Easy Creed merge ≤720 fill purple void/)
  assert.match(latestChange('1.4.192').items.join('\n'), /Creed merge.*≤720|purple void under the bowl/i)
  assert.doesNotMatch(
    latestChange('1.4.192').items.join('\n'),
    /Fixes #238|Fixes #239|Fixes #240|Lock In win-end|Match \(picture|empty purple card|Story Snap|eyebrow|Fixes #232|empty-lot|Fixes #217|Build Argument ≤720 fill|Easy Link ≤720 fill|Father Dash ≤720 fill|Easy Hold.*≤720 fill|why-blast|Story Creek ≤720 fill|maze-board/i,
    '1.4.192 must not re-claim Match / Lock In / Samaritan / Snap / Story Creek / Manage / letterbox / Build / Link / Father / Hold',
  )
}

// Easy Clear 1.4.191: Easy Story Creek ≤720 fill purple void (invent Fun/Clear)
{
  const mazeCss191 = readFileSync(new URL('../src/styles/maze.css', import.meta.url), 'utf8')
  const mazePlay191 = readFileSync(
    new URL('../src/components/challenges/RoadMazePlay.tsx', import.meta.url),
    'utf8',
  )
  assert.match(mazeCss191, /1\.4\.191: Easy Story Creek ≤720 fill purple void/)
  assert.match(
    mazeCss191,
    /@media \(max-height: 720px\) \{[\s\S]*?\.play\.is-road-maze \{[\s\S]*?flex: 1 1 auto/,
  )
  assert.match(
    mazeCss191,
    /@media \(max-height: 720px\) \{[\s\S]*?\.play\.is-road-maze \.maze-board \{[\s\S]*?max-height: none/,
  )
  assert.match(
    mazeCss191,
    /@media \(max-height: 720px\) \{[\s\S]*?\.play\.is-road-maze \.maze-board \{[\s\S]*?aspect-ratio: auto/,
  )
  assert.match(mazePlay191, /1\.4\.191: ≤720 fills purple void/)
  assert.match(cssSrc, /1\.4\.191: Easy Story Creek ≤720 fill purple void/)
  assert.match(latestChange('1.4.191').items.join('\n'), /Story Creek.*≤720|purple void under the board/i)
  assert.doesNotMatch(
    latestChange('1.4.191').items.join('\n'),
    /Fixes #238|Fixes #239|Fixes #240|Lock In win-end|Match \(picture|empty purple card|Story Snap|eyebrow|Creed merge|Fixes #232|empty-lot|Fixes #217|Build Argument ≤720 fill|Easy Link ≤720 fill|Father Dash ≤720 fill|Easy Hold.*≤720 fill|why-blast/i,
    '1.4.191 must not re-claim Match / Lock In / Samaritan / Snap / Creed / Manage / letterbox / Build / Link / Father / Hold',
  )
}



// Easy Clear 1.4.181: Easy Creed merge ≤720 HUD peel (invent Fun/Clear)
{
  const mergeCss181 = readFileSync(new URL('../src/index.css', import.meta.url), 'utf8')
  const mergePlay181 = readFileSync(
    new URL('../src/components/challenges/ClaimMergePlay.tsx', import.meta.url),
    'utf8',
  )
  assert.match(mergeCss181, /1\.4\.181: Creed merge ≤720 HUD peel/)
  assert.match(
    mergeCss181,
    /@media \(max-height: 720px\) \{[\s\S]*?\.play\.is-claim-merge \.story-kicker \{[\s\S]*?display: none/,
  )
  assert.match(
    mergeCss181,
    /@media \(max-height: 720px\) \{[\s\S]*?\.play\.is-claim-merge \.merge-rung-name \{[\s\S]*?display: none/,
  )
  assert.match(mergePlay181, /1\.4\.181: ≤720 peels HUD/)
  assert.match(cssSrc, /1\.4\.181: Creed merge ≤720 HUD peel/)
}


// Easy Clear 1.4.211: Easy Match ≤720 close grid→status purple void (Fixes #273)
{
  const matchArtTight211 = readFileSync(
    new URL('../src/styles/match-art-tight.css', import.meta.url),
    'utf8',
  )
  const gemPlay211 = readFileSync(
    new URL('../src/components/challenges/GemSearchPlay.tsx', import.meta.url),
    'utf8',
  )
  assert.match(matchArtTight211, /1\.4\.211: Easy Match ≤720 close the grid→status purple void/)
  assert.match(
    matchArtTight211,
    /@media \(max-height: 720px\) \{[\s\S]*?\.play\.is-gem-search\.is-panel-blast\.is-story-docked \.gem-board \{[\s\S]*?height: 100%[\s\S]*?flex: 1 1 auto[\s\S]*?aspect-ratio: auto/,
  )
  assert.match(gemPlay211, /1\.4\.211: match-art-tight keeps the ≤720 board fill through the status counter/)
  assert.match(cssSrc, /1\.4\.211: Easy Match ≤720 close the grid→status purple void/)
  assert.match(latestChange('1.4.211').items.join('\n'), /Fixes #273|grid.*status|purple void/i)
  assert.match(latestChange('1.4.211').title, /Easy Match|≤720|grid→status|purple void/i)
  assert.doesNotMatch(
    latestChange('1.4.211').items.join('\n'),
    /Fixes #251|Fixes #252|Fixes #253|Lock In quiz|Lock In feedback|Father|Story Snap|Story Creek|Creed|Build Argument|Easy Link|Road maze|Claim merge|Source dig|Hold.*purple|pad→CTA|hud→arena/i,
    '1.4.211 must not fix other Shot 200 issues or climb another Easy surface',
  )
}


// Easy Clear 1.4.212: Easy Lock In quiz ≤720 close lower-third purple void (Fixes #274)
{
  const holdCss212 = readFileSync(new URL('../src/styles/sortHold.css', import.meta.url), 'utf8')
  const whyPlay212 = readFileSync(
    new URL('../src/components/challenges/WhyBlastPlay.tsx', import.meta.url),
    'utf8',
  )
  assert.match(holdCss212, /1\.4\.212: Easy Lock In quiz ≤720 close the lower-third purple void/)
  assert.match(
    holdCss212,
    /@media \(max-height: 720px\) \{[\s\S]*?\.app\.is-play \.app-body:has\(\.journal\.is-rehearse \.why-blast:not\(\.is-miss-teach\):not\(\.is-win\)\) \{[\s\S]*?padding-bottom: 0/,
  )
  assert.match(whyPlay212, /1\.4\.212: ≤720 mid-question quiz packs residual lower-third padding/)
  assert.match(cssSrc, /1\.4\.212: Easy Lock In quiz ≤720 close the lower-third purple void/)
  assert.match(latestChange('1.4.212').items.join('\n'), /Fixes #274|lower-third|purple band/i)
  assert.match(latestChange('1.4.212').title, /Lock In quiz|≤720|lower-third|purple void/i)
  assert.doesNotMatch(
    latestChange('1.4.212').items.join('\n'),
    /Fixes #250|Fixes #252|Fixes #253|#272|#275|#276|#277|miss teach|Father|Match|Story Creek|Creed|Build|Sort|Snap|Link|Road maze|Claim merge|Source dig/i,
    '1.4.212 must not fix other phone-fail issues or climb another Easy surface',
  )
}


// Easy Clear 1.4.213: Easy Lock In feedback ≤720 close bottom purple void (Fixes #275)
{
  const holdCss213 = readFileSync(new URL('../src/styles/sortHold.css', import.meta.url), 'utf8')
  const whyPlay213 = readFileSync(
    new URL('../src/components/challenges/WhyBlastPlay.tsx', import.meta.url),
    'utf8',
  )
  assert.match(holdCss213, /1\.4\.213: Easy Lock In feedback ≤720 close the bottom purple void/)
  assert.match(
    holdCss213,
    /@media \(max-height: 720px\) \{[\s\S]*?\.app\.is-play \.app-body:has\(\.journal\.is-rehearse \.why-blast\.is-miss-teach\) \{[\s\S]*?padding-bottom: 0/,
  )
  assert.match(whyPlay213, /1\.4\.213: ≤720 feedback packs residual bottom padding/)
  assert.match(cssSrc, /1\.4\.213: Easy Lock In feedback ≤720 close the bottom purple void/)
  assert.match(latestChange('1.4.213').items.join('\n'), /Fixes #275|feedback|bottom|purple band/i)
  assert.match(latestChange('1.4.213').title, /Lock In feedback|≤720|bottom|purple void/i)
  assert.doesNotMatch(
    latestChange('1.4.213').items.join('\n'),
    /Fixes #250|Fixes #251|Fixes #252|Fixes #253|#272|#274|#276|#277|quiz|Match|Father|Story Creek|Creed|Build|Sort|Snap|Link|Road maze|Claim merge|Source dig/i,
    '1.4.213 must not fix other phone-fail issues or climb another Easy surface',
  )
}


// Easy Clear 1.4.214: Easy Story Creek speech ≤720 slider→HOLD purple void (Fixes #272)
{
  const indexCss214 = readFileSync(new URL('../src/index.css', import.meta.url), 'utf8')
  const fatherPlay214 = readFileSync(
    new URL('../src/components/challenges/FatherRunPlay.tsx', import.meta.url),
    'utf8',
  )
  assert.match(indexCss214, /1\.4\.214: Easy Story Creek speech ≤720 slider→HOLD purple void/)
  assert.match(
    indexCss214,
    /@media \(max-height: 920px\) \{[\s\S]*?\.play\.is-father-run \.cta-dock,[\s\S]*?margin-top: 0/,
  )
  assert.match(
    indexCss214,
    /@media \(max-height: 920px\) \{[\s\S]*?\.play\.is-father-run \.run-scene \{[\s\S]*?flex: 1 1 auto/,
  )
  assert.match(fatherPlay214, /1\.4\.214: phone portrait extends fill\+dock so slider→HOLD closes/)
  assert.match(cssSrc, /1\.4\.214: Easy Story Creek speech ≤720 slider→HOLD purple void/)
  assert.match(latestChange('1.4.214').items.join('\n'), /Fixes #272|slider→HOLD|purple void/i)
  assert.match(latestChange('1.4.214').title, /Story Creek|≤720|slider→HOLD|purple void/i)
  assert.doesNotMatch(
    latestChange('1.4.214').items.join('\n'),
    /Fixes #250|Fixes #251|Fixes #252|Fixes #253|#273|#274|#275|#276|#277|#280|#283|Lock In|Match grid|Samaritan|Manage|Learn cream|Father Dash invent|Dig|Creed|Build|Sort|Snap|Link|Road maze|Claim merge|Source dig/i,
    '1.4.214 must not fix other phone-fail issues or climb another Easy surface',
  )
}

// Easy Clear 1.4.215: Easy Learn ≤720 / phone portrait CTA purple void (Fixes #280)
{
  const welcomeCss215 = readFileSync(new URL('../src/styles/welcome.css', import.meta.url), 'utf8')
  const teachUnlock215 = readFileSync(
    new URL('../src/components/TeachUnlock.tsx', import.meta.url),
    'utf8',
  )
  assert.match(welcomeCss215, /1\.4\.215: Easy Learn ≤720 \/ phone portrait CTA purple void/)
  assert.match(
    welcomeCss215,
    /@media \(max-height: 920px\) \{[\s\S]*?\.challenge-page\.is-teach:has\(\.easy-story-card\) \{[\s\S]*?flex: 1/,
  )
  assert.match(
    welcomeCss215,
    /@media \(max-height: 920px\) \{[\s\S]*?\.easy-story-card \.held-triad \{[\s\S]*?flex: 1 1 auto/,
  )
  assert.match(
    welcomeCss215,
    /@media \(max-height: 920px\) \{[\s\S]*?\.easy-story-card \.easy-story-dock \{[\s\S]*?margin-top: 0/,
  )
  assert.match(teachUnlock215, /1\.4\.215: phone portrait extends fill 206 so CTA dock closes/)
  assert.match(cssSrc, /1\.4\.215: Easy Learn ≤720 \/ phone portrait CTA purple void/)
  assert.match(latestChange('1.4.215').items.join('\n'), /Fixes #280|CTA|purple void|Learn|cream/i)
  assert.match(latestChange('1.4.215').title, /Easy Learn|≤720|CTA|purple void/i)
  assert.doesNotMatch(
    latestChange('1.4.215').items.join('\n'),
    /Fixes #250|Fixes #251|Fixes #252|Fixes #253|#272|#273|#274|#275|#276|#277|#281|#282|#283|Father Dash|Match grid|Samaritan|Manage|Lock In|Dig|Creed|Build|Sort|Snap|Link|Road maze|Claim merge|Source dig|Story Creek HOLD|slider→HOLD/i,
    '1.4.215 must not fix other phone-fail issues or climb another Easy surface',
  )
}

// Easy Clear 1.4.216: Easy Father Dash ≤720 / phone portrait timing-rail→CTA purple void (Fixes #283)
{
  const indexCss216 = readFileSync(new URL('../src/index.css', import.meta.url), 'utf8')
  const fatherPlay216 = readFileSync(
    new URL('../src/components/challenges/FatherRunPlay.tsx', import.meta.url),
    'utf8',
  )
  assert.match(indexCss216, /1\.4\.216: Easy Father Dash ≤720 \/ phone portrait timing-rail→CTA purple void/)
  assert.match(
    indexCss216,
    /@media \(max-height: 920px\) \{[\s\S]*?\.play\.is-father-run \.run-rail \{[\s\S]*?height: 14px/,
  )
  assert.match(
    indexCss216,
    /@media \(max-height: 920px\) \{[\s\S]*?\.play\.is-father-run \.cta-dock,[\s\S]*?margin-top: 0/,
  )
  assert.match(fatherPlay216, /1\.4\.216: phone portrait extends speech→rail\+pad so Dash rail→CTA closes/)
  assert.match(cssSrc, /1\.4\.216: Easy Father Dash ≤720 \/ phone portrait timing-rail→CTA purple void/)
  assert.match(latestChange('1.4.216').items.join('\n'), /Fixes #283|timing-rail→CTA|purple void|Father Dash/i)
  assert.match(latestChange('1.4.216').title, /Father Dash|≤720|timing-rail→CTA|purple void/i)
  assert.doesNotMatch(
    latestChange('1.4.216').items.join('\n'),
    /Fixes #250|Fixes #251|Fixes #252|Fixes #253|#272|#273|#274|#275|#276|#277|#280|#281|#282|Learn cream|Match grid|Samaritan|Manage|Lock In|Dig|Creed|Build|Sort|Snap|Link|Road maze|Claim merge|Source dig|Story Creek HOLD|slider→HOLD/i,
    '1.4.216 must not fix other phone-fail issues or climb another Easy surface',
  )
}

// Easy Clear 1.4.217: Easy Hold ≤720 / phone portrait hud→arena purple void (invent Fun/Clear)
{
  const holdCss217 = readFileSync(new URL('../src/styles/sortHold.css', import.meta.url), 'utf8')
  const whyBlast217 = readFileSync(
    new URL('../src/components/challenges/WhyBlastPlay.tsx', import.meta.url),
    'utf8',
  )
  assert.match(holdCss217, /1\.4\.217: Easy Hold ≤720 \/ phone portrait hud→arena purple void/)
  assert.match(
    holdCss217,
    /@media \(max-height: 920px\) \{[\s\S]*?\.why-blast \{[\s\S]*?gap: 2px/,
  )
  assert.match(
    holdCss217,
    /@media \(max-height: 920px\) \{[\s\S]*?\.why-blast \.why-arena \{[\s\S]*?gap: 4px/,
  )
  assert.match(
    holdCss217,
    /@media \(max-height: 920px\) \{[\s\S]*?\.why-blast \.cta-dock \{[\s\S]*?margin-top: 0/,
  )
  assert.match(whyBlast217, /1\.4\.217: phone portrait extends fill\+dock\+hud so Hold hud→arena closes/)
  assert.match(cssSrc, /1\.4\.217: Easy Hold ≤720 \/ phone portrait hud→arena purple void/)
  assert.match(latestChange('1.4.217').items.join('\n'), /hud→arena|phone portrait|purple void|Hold|WhyBlast|invent Fun\/Clear/i)
  assert.match(latestChange('1.4.217').title, /Easy Hold|≤720|hud→arena|purple void/i)
  assert.doesNotMatch(
    latestChange('1.4.217').items.join('\n'),
    /Fixes #250|Fixes #251|Fixes #252|Fixes #253|#272|#273|#274|#275|#276|#277|#280|#281|#282|#283|Father Dash|Learn cream|Match grid|Samaritan|Manage|Lock In quiz|Dig|Creed|Build|Sort|Snap|Link|Road maze|Claim merge|Source dig|Story Creek HOLD|slider→HOLD|timing-rail→CTA/i,
    '1.4.217 must not fix phone-fail issues or climb another Easy surface',
  )
}

// Easy Clear 1.4.218: Easy Sort ≤720 / phone portrait fill purple void (invent Fun/Clear)
{
  const sortCss218 = readFileSync(new URL('../src/styles/sortHold.css', import.meta.url), 'utf8')
  const sortPlay218 = readFileSync(
    new URL('../src/components/challenges/SortPlay.tsx', import.meta.url),
    'utf8',
  )
  assert.match(sortCss218, /1\.4\.218: Easy Sort ≤720 \/ phone portrait fill purple void/)
  assert.match(
    sortCss218,
    /@media \(max-height: 920px\) \{[\s\S]*?\.play\.is-easy-sort \{[\s\S]*?gap: 3px/,
  )
  assert.match(
    sortCss218,
    /@media \(max-height: 920px\) \{[\s\S]*?\.play\.is-easy-sort \.bank\.is-sort \{[\s\S]*?grid-template-rows: minmax\(0, 1fr\) minmax\(0, 1fr\)/,
  )
  assert.match(
    sortCss218,
    /@media \(max-height: 920px\) \{[\s\S]*?\.play\.is-easy-sort \.sort-bins \{[\s\S]*?max-height: none/,
  )
  assert.match(sortPlay218, /1\.4\.218: phone portrait extends fill so Keep·Toss bank\/bins close purple void/)
  assert.match(cssSrc, /1\.4\.218: Easy Sort ≤720 \/ phone portrait fill purple void/)
  assert.match(latestChange('1.4.218').items.join('\n'), /fill|phone portrait|purple void|Sort|Keep·Toss|invent Fun\/Clear/i)
  assert.match(latestChange('1.4.218').title, /Easy Sort|≤720|fill|purple void/i)
  assert.doesNotMatch(
    latestChange('1.4.218').items.join('\n'),
    /Fixes #250|Fixes #251|Fixes #252|Fixes #253|#272|#273|#274|#275|#276|#277|#280|#281|#282|#283|Father Dash|Learn cream|Match grid|Samaritan|Manage|Lock In quiz|Dig|Creed|Build|Hold|Snap|Link|Road maze|Claim merge|Source dig|Story Creek HOLD|slider→HOLD|timing-rail→CTA|hud→arena/i,
    '1.4.218 must not fix phone-fail issues or climb another Easy surface',
  )
}

// Easy Clear 1.4.219: Easy Link ≤720 / phone portrait fill + choices→CTA purple void (invent Fun/Clear)
{
  const linkCss219 = readFileSync(new URL('../src/index.css', import.meta.url), 'utf8')
  const linkPlay219 = readFileSync(
    new URL('../src/components/challenges/LinkPlay.tsx', import.meta.url),
    'utf8',
  )
  assert.match(linkCss219, /1\.4\.219: Easy Link ≤720 \/ phone portrait fill \+ choices→CTA purple void/)
  assert.match(
    linkCss219,
    /@media \(max-height: 920px\) \{[\s\S]*?\.play\.is-easy-link \{[\s\S]*?gap: 4px/,
  )
  assert.match(
    linkCss219,
    /@media \(max-height: 920px\) \{[\s\S]*?\.play\.is-easy-link \.link-col \{[\s\S]*?grid-auto-rows: minmax\(0, 1fr\)/,
  )
  assert.match(
    linkCss219,
    /@media \(max-height: 920px\) \{[\s\S]*?\.play\.is-easy-link \.link-dock \{[\s\S]*?margin-top: 0/,
  )
  assert.match(linkPlay219, /1\.4\.219: phone portrait extends fill\+dock so choices→CTA close purple void/)
  assert.match(cssSrc, /1\.4\.219: Easy Link ≤720 \/ phone portrait fill \+ choices→CTA purple void/)
  assert.match(latestChange('1.4.219').items.join('\n'), /fill|choices→CTA|phone portrait|purple void|Link|invent Fun\/Clear/i)
  assert.match(latestChange('1.4.219').title, /Easy Link|≤720|fill|choices→CTA|purple void/i)
  assert.doesNotMatch(
    latestChange('1.4.219').items.join('\n'),
    /Fixes #250|Fixes #251|Fixes #252|Fixes #253|#272|#273|#274|#275|#276|#277|#280|#281|#282|#283|Father Dash|Learn cream|Match grid|Samaritan|Manage|Lock In quiz|Dig|Creed|Build|Hold|Sort|Snap|Road maze|Claim merge|Source dig|Story Creek HOLD|slider→HOLD|timing-rail→CTA|hud→arena|Keep·Toss/i,
    '1.4.219 must not fix phone-fail issues or climb another Easy surface',
  )
}

// Easy Clear 1.4.220: Easy Creed ≤720 / phone portrait fill + bowl→CTA purple void (invent Fun/Clear · Shot wake)
{
  const creedCss220 = readFileSync(new URL('../src/index.css', import.meta.url), 'utf8')
  const creedPlay220 = readFileSync(
    new URL('../src/components/challenges/ClaimMergePlay.tsx', import.meta.url),
    'utf8',
  )
  assert.match(creedCss220, /1\.4\.220: Easy Creed ≤720 \/ phone portrait fill \+ bowl→CTA purple void/)
  assert.match(
    creedCss220,
    /@media \(max-height: 920px\) \{[\s\S]*?\.play\.is-claim-merge \{[\s\S]*?gap: 3px/,
  )
  assert.match(
    creedCss220,
    /@media \(max-height: 920px\) \{[\s\S]*?\.play\.is-claim-merge \.merge-bowl \{[\s\S]*?max-height: none/,
  )
  assert.match(
    creedCss220,
    /@media \(max-height: 920px\) \{[\s\S]*?\.play\.is-claim-merge \.cta-dock \{[\s\S]*?margin-top: 0/,
  )
  assert.match(creedPlay220, /1\.4\.220: phone portrait extends fill\+dock so bowl→CTA close purple void/)
  assert.match(cssSrc, /1\.4\.220: Easy Creed ≤720 \/ phone portrait fill \+ bowl→CTA purple void/)
  assert.match(latestChange('1.4.220').items.join('\n'), /fill|bowl→CTA|phone portrait|purple void|Creed|Shot wake|invent Fun\/Clear/i)
  assert.match(latestChange('1.4.220').title, /Easy Creed|≤720|fill|bowl→CTA|purple void|Shot wake/i)
  assert.doesNotMatch(
    latestChange('1.4.220').items.join('\n'),
    /Fixes #250|Fixes #251|Fixes #252|Fixes #253|#272|#273|#274|#275|#276|#277|#280|#281|#282|#283|Father Dash|Learn cream|Match grid|Samaritan|Manage|Lock In quiz|Dig|Build|Hold|Sort|Snap|Link|Road maze|Source dig|Story Creek HOLD|slider→HOLD|timing-rail→CTA|hud→arena|Keep·Toss|choices→CTA/i,
    '1.4.220 must not fix phone-fail issues or climb another Easy surface',
  )
}

// Easy Clear 1.4.221: Easy Build ≤720 / phone portrait fill purple void (invent Fun/Clear)
{
  const buildCss221 = readFileSync(new URL('../src/styles/sortHold.css', import.meta.url), 'utf8')
  const buildPlay221 = readFileSync(
    new URL('../src/components/challenges/BuildArgumentPlay.tsx', import.meta.url),
    'utf8',
  )
  assert.match(buildCss221, /1\.4\.221: Easy Build ≤720 \/ phone portrait fill purple void/)
  assert.match(
    buildCss221,
    /@media \(max-height: 920px\) \{[\s\S]*?\.play\.is-build\.is-deal \{[\s\S]*?gap: 6px/,
  )
  assert.match(
    buildCss221,
    /@media \(max-height: 920px\) \{[\s\S]*?\.play\.is-build\.is-deal \.slot-list \{[\s\S]*?flex: 1 1 auto/,
  )
  assert.match(
    buildCss221,
    /@media \(max-height: 920px\) \{[\s\S]*?\.play\.is-build:not\(\.is-deal\) \.bank\.is-order \{[\s\S]*?max-height: none/,
  )
  assert.match(
    buildCss221,
    /@media \(max-height: 920px\) \{[\s\S]*?\.play\.is-build:not\(\.is-deal\) \.build-lock[\s\S]*?margin-top: 0/,
  )
  assert.match(buildPlay221, /1\.4\.221: phone portrait extends deal\+free-place fill so slots·bank·lock close purple void/)
  assert.match(cssSrc, /1\.4\.221: Easy Build ≤720 \/ phone portrait fill purple void/)
  assert.match(latestChange('1.4.221').items.join('\n'), /fill|phone portrait|purple void|Build|slots|bank|invent Fun\/Clear/i)
  assert.match(latestChange('1.4.221').title, /Easy Build|≤720|fill|purple void/i)
  assert.doesNotMatch(
    latestChange('1.4.221').items.join('\n'),
    /Fixes #250|Fixes #251|Fixes #252|Fixes #253|#272|#273|#274|#275|#276|#277|#280|#281|#282|#283|Father Dash|Learn cream|Match grid|Samaritan|Manage|Lock In quiz|Dig|Creed|Hold|Sort|Snap|Link|Sequence|Road maze|Claim merge|Source dig|Story Creek HOLD|slider→HOLD|timing-rail→CTA|hud→arena|Keep·Toss|choices→CTA|bowl→CTA/i,
    '1.4.221 must not fix phone-fail issues or climb another Easy surface',
  )
}

// Easy Clear 1.4.222: Easy Sequence ≤720 / phone portrait fill + stones→result purple void (invent Fun/Clear)
{
  const seqCss222 = readFileSync(new URL('../src/styles/sortHold.css', import.meta.url), 'utf8')
  const seqPlay222 = readFileSync(
    new URL('../src/components/challenges/SequencePlay.tsx', import.meta.url),
    'utf8',
  )
  assert.match(seqCss222, /1\.4\.222: Easy Sequence ≤720 \/ phone portrait fill \+ stones→result purple void/)
  assert.match(
    seqCss222,
    /@media \(max-height: 920px\) \{[\s\S]*?\.play\.is-sequence\.is-deal \{[\s\S]*?gap: 2px/,
  )
  assert.match(
    seqCss222,
    /@media \(max-height: 920px\) \{[\s\S]*?\.play\.is-sequence\.is-deal \.bank\.is-order \{[\s\S]*?max-height: none/,
  )
  assert.match(
    seqCss222,
    /@media \(max-height: 920px\) \{[\s\S]*?\.play\.is-sequence\.is-deal \.result[\s\S]*?margin: 0/,
  )
  assert.match(seqPlay222, /1\.4\.222: phone portrait extends fill \+ stones→result so order bank·result close purple void/)
  assert.match(cssSrc, /1\.4\.222: Easy Sequence ≤720 \/ phone portrait fill \+ stones→result purple void/)
  assert.match(latestChange('1.4.222').items.join('\n'), /fill|stones→result|phone portrait|purple void|Sequence|order bank|invent Fun\/Clear/i)
  assert.match(latestChange('1.4.222').title, /Easy Sequence|≤720|fill|stones→result|purple void/i)
  assert.doesNotMatch(
    latestChange('1.4.222').items.join('\n'),
    /Fixes #250|Fixes #251|Fixes #252|Fixes #253|#272|#273|#274|#275|#276|#277|#280|#281|#282|#283|Father Dash|Learn cream|Match grid|Manage|Lock In quiz|Dig|Creed|Hold|Sort|Snap|Link|Build|Road maze|Claim merge|Source dig|Story Creek HOLD|slider→HOLD|timing-rail→CTA|hud→arena|Keep·Toss|choices→CTA|bowl→CTA/i,
    '1.4.222 must not fix phone-fail issues or climb another Easy surface',
  )
}

// Easy Clear 1.4.223: Easy Story Snap ≤720 / phone portrait fill + pad→CTA purple void (invent Fun/Clear)
{
  const snapCss223 = readFileSync(new URL('../src/styles/storySnap.css', import.meta.url), 'utf8')
  const snapPlay223 = readFileSync(
    new URL('../src/components/challenges/StorySnapPlayView.tsx', import.meta.url),
    'utf8',
  )
  assert.match(snapCss223, /1\.4\.223: Easy Story Snap ≤720 \/ phone portrait fill \+ pad→CTA purple void/)
  assert.match(
    snapCss223,
    /@media \(max-height: 920px\) \{[\s\S]*?\.play\.is-story-snap[\s\S]*?gap: 0\.12rem/,
  )
  assert.match(
    snapCss223,
    /@media \(max-height: 920px\) \{[\s\S]*?\.play\.is-story-snap \.snap-stage \{[\s\S]*?min-height: 0/,
  )
  assert.match(
    snapCss223,
    /@media \(max-height: 920px\) \{[\s\S]*?\.play\.is-story-snap \.cta-dock \{[\s\S]*?margin-top: 0/,
  )
  assert.match(snapPlay223, /1\.4\.223: phone portrait extends fill \+ pad→CTA so snap-stage·pad·CTA close purple void/)
  assert.match(cssSrc, /1\.4\.223: Easy Story Snap ≤720 \/ phone portrait fill \+ pad→CTA purple void/)
  assert.match(latestChange('1.4.223').items.join('\n'), /fill|pad→CTA|phone portrait|purple void|Story Snap|snap-stage|invent Fun\/Clear/i)
  assert.match(latestChange('1.4.223').title, /Story Snap|≤720|fill|pad→CTA|purple void/i)
  assert.doesNotMatch(
    latestChange('1.4.223').items.join('\n'),
    /Fixes #250|Fixes #251|Fixes #252|Fixes #253|#272|#273|#274|#275|#276|#277|#280|#281|#282|#283|Father Dash|Learn cream|Match grid|Manage|Lock In quiz|Dig|Creed|Hold|Sort|Link|Build|Sequence|Road maze|Claim merge|Source dig|Story Creek HOLD|slider→HOLD|timing-rail→CTA|hud→arena|Keep·Toss|choices→CTA|bowl→CTA|stones→result/i,
    '1.4.223 must not fix phone-fail issues or climb another Easy surface',
  )
}

// Easy Clear 1.4.224: Easy Learn ≤720 / phone portrait bottom-half purple void (Fixes #296)
{
  const welcomeCss224 = readFileSync(new URL('../src/styles/welcome.css', import.meta.url), 'utf8')
  const teachUnlock224 = readFileSync(
    new URL('../src/components/TeachUnlock.tsx', import.meta.url),
    'utf8',
  )
  assert.match(welcomeCss224, /1\.4\.224: Easy Learn ≤720 \/ phone portrait bottom-half purple void/)
  assert.match(
    welcomeCss224,
    /@media \(max-height: 920px\) \{[\s\S]*?\.app-body:has\(\.challenge-page\.is-teach \.easy-story-card\) \{[\s\S]*?padding-bottom: 0/,
  )
  assert.match(
    welcomeCss224,
    /@media \(max-height: 920px\) \{[\s\S]*?\.challenge-page\.is-teach:has\(\.easy-story-card\) \{[\s\S]*?flex: 1 1 0/,
  )
  assert.match(
    welcomeCss224,
    /@media \(max-height: 920px\) \{[\s\S]*?\.easy-story-card \.easy-story-dock \{[\s\S]*?margin-top: auto/,
  )
  assert.match(teachUnlock224, /1\.4\.224: phone portrait tightens fill 215/)
  assert.match(cssSrc, /1\.4\.224: Easy Learn ≤720 \/ phone portrait bottom-half purple void/)
  assert.match(latestChange('1.4.224').items.join('\n'), /Fixes #296|bottom-half|purple void|Learn|cream/i)
  assert.match(latestChange('1.4.224').title, /Easy Learn|≤720|bottom-half|purple void/i)
  assert.doesNotMatch(
    latestChange('1.4.224').items.join('\n'),
    /Fixes #250|Fixes #251|Fixes #252|Fixes #253|#272|#273|#274|#275|#276|#277|#280|#281|#282|#283|#297|#298|#299|#300|#301|#302|Father Dash|Match grid|Samaritan|Manage|Lock In|Dig|Creed|Build|Sort|Snap|Link|Road maze|Claim merge|Source dig|Story Creek HOLD|slider→HOLD|invent Fun\/Clear/i,
    '1.4.224 must not fix other phone-fail issues or climb another Easy surface',
  )
}

// Easy Clear 1.4.225: Easy Match ≤720 / phone portrait bottom-third purple void (Fixes #297)
{
  const matchArtTight225 = readFileSync(
    new URL('../src/styles/match-art-tight.css', import.meta.url),
    'utf8',
  )
  const gemPlay225 = readFileSync(
    new URL('../src/components/challenges/GemSearchPlay.tsx', import.meta.url),
    'utf8',
  )
  assert.match(matchArtTight225, /1\.4\.225: Easy Match ≤720 \/ phone portrait bottom-third purple void/)
  assert.match(
    matchArtTight225,
    /@media \(max-height: 920px\) \{[\s\S]*?\.play\.is-gem-search\.is-panel-blast\.is-story-docked \.gem-board \{[\s\S]*?height: 100%[\s\S]*?flex: 1 1 auto[\s\S]*?aspect-ratio: auto/,
  )
  assert.match(
    matchArtTight225,
    /@media \(max-height: 920px\) \{[\s\S]*?\.play\.is-gem-search\.is-panel-blast\.is-story-docked \.gem-scroll \{[\s\S]*?overflow: hidden/,
  )
  assert.match(gemPlay225, /1\.4\.225: phone portrait extends fill 193 \+ board stretch 211/)
  assert.match(cssSrc, /1\.4\.225: Easy Match ≤720 \/ phone portrait bottom-third purple void/)
  assert.match(latestChange('1.4.225').items.join('\n'), /Fixes #297|bottom-third|purple void|Match|gem/i)
  assert.match(latestChange('1.4.225').title, /Easy Match|≤720|bottom-third|purple void/i)
  assert.doesNotMatch(
    latestChange('1.4.225').items.join('\n'),
    /Fixes #250|Fixes #251|Fixes #252|Fixes #253|#272|#273|#274|#275|#276|#277|#280|#281|#282|#283|#296|#298|#299|#300|#301|#302|Father Dash|Learn cream|Samaritan|Manage|Lock In|Dig|Creed|Build|Sort|Snap|Link|Road maze|Claim merge|Source dig|Story Creek HOLD|slider→HOLD|invent Fun\/Clear/i,
    '1.4.225 must not fix other phone-fail issues or climb another Easy surface',
  )
}

// Easy Clear 1.4.226: Easy Lock In quiz ≤720 / phone portrait bottom-half purple void (Fixes #298)
{
  const holdCss226 = readFileSync(new URL('../src/styles/sortHold.css', import.meta.url), 'utf8')
  const whyPlay226 = readFileSync(
    new URL('../src/components/challenges/WhyBlastPlay.tsx', import.meta.url),
    'utf8',
  )
  assert.match(holdCss226, /1\.4\.226: Easy Lock In quiz ≤720 \/ phone portrait bottom-half purple void/)
  assert.match(
    holdCss226,
    /@media \(max-height: 920px\) \{[\s\S]*?\.app\.is-play \.app-body:has\(\.journal\.is-rehearse \.why-blast:not\(\.is-miss-teach\):not\(\.is-win\)\) \{[\s\S]*?padding-bottom: 0/,
  )
  assert.match(
    holdCss226,
    /@media \(max-height: 920px\) \{[\s\S]*?\.journal\.is-rehearse:has\(\.why-blast:not\(\.is-miss-teach\):not\(\.is-win\)\) \.recall-gate\.is-easy-hold \{[\s\S]*?flex: 1 1 auto/,
  )
  assert.match(whyPlay226, /1\.4\.226: phone portrait extends fill 194 \+ pad-zero 212/)
  assert.match(cssSrc, /1\.4\.226: Easy Lock In quiz ≤720 \/ phone portrait bottom-half purple void/)
  assert.match(latestChange('1.4.226').items.join('\n'), /Fixes #298|bottom-half|purple void|Lock In quiz/i)
  assert.match(latestChange('1.4.226').title, /Lock In quiz|≤720|bottom-half|purple void/i)
  assert.doesNotMatch(
    latestChange('1.4.226').items.join('\n'),
    /Fixes #250|Fixes #251|Fixes #252|Fixes #253|#272|#273|#274|#275|#276|#277|#280|#281|#282|#283|#296|#297|#299|#300|#301|#302|Father Dash|Learn cream|Match grid|Samaritan|Manage|miss teach|Dig|Creed|Build|Sort|Snap|Link|Road maze|Claim merge|Source dig|Story Creek HOLD|slider→HOLD|invent Fun\/Clear/i,
    '1.4.226 must not fix other phone-fail issues or climb another Easy surface',
  )
}

// Easy Clear 1.4.227: Easy Lock In feedback ≤720 / phone portrait bottom-half purple void (Fixes #299)
{
  const holdCss227 = readFileSync(new URL('../src/styles/sortHold.css', import.meta.url), 'utf8')
  const whyPlay227 = readFileSync(
    new URL('../src/components/challenges/WhyBlastPlay.tsx', import.meta.url),
    'utf8',
  )
  assert.match(holdCss227, /1\.4\.227: Easy Lock In feedback ≤720 \/ phone portrait bottom-half purple void/)
  assert.match(
    holdCss227,
    /@media \(max-height: 920px\) \{[\s\S]*?\.app\.is-play \.app-body:has\(\.journal\.is-rehearse \.why-blast\.is-miss-teach\) \{[\s\S]*?padding-bottom: 0/,
  )
  assert.match(
    holdCss227,
    /@media \(max-height: 920px\) \{[\s\S]*?\.why-blast\.is-miss-teach \.why-miss-teach \{[\s\S]*?flex: 1 1 auto/,
  )
  assert.match(
    holdCss227,
    /@media \(max-height: 920px\) \{[\s\S]*?\.why-blast\.is-miss-teach \.why-miss-teach \.cta-dock \{[\s\S]*?margin-top: auto/,
  )
  assert.match(whyPlay227, /1\.4\.227: phone portrait extends fill 195 \+ pad-zero 213/)
  assert.match(cssSrc, /1\.4\.227: Easy Lock In feedback ≤720 \/ phone portrait bottom-half purple void/)
  assert.match(latestChange('1.4.227').items.join('\n'), /Fixes #299|bottom-half|purple void|Lock In feedback/i)
  assert.match(latestChange('1.4.227').title, /Lock In feedback|≤720|bottom-half|purple void/i)
  assert.doesNotMatch(
    latestChange('1.4.227').items.join('\n'),
    /Fixes #250|Fixes #251|Fixes #252|Fixes #253|#272|#273|#274|#275|#276|#277|#280|#281|#282|#283|#296|#297|#298|#300|#301|#302|Father Dash|Learn cream|Match grid|Samaritan|Manage|Lock In quiz|Dig|Creed|Build|Sort|Snap|Link|Road maze|Claim merge|Source dig|Story Creek HOLD|slider→HOLD|invent Fun\/Clear/i,
    '1.4.227 must not fix other phone-fail issues or climb another Easy surface',
  )
}

// Easy Clear 1.4.228: Easy Samaritan ≤720 / phone portrait voids above/below board (Fixes #300)
{
  const mazeCss228 = readFileSync(new URL('../src/styles/maze.css', import.meta.url), 'utf8')
  const mazePlay228 = readFileSync(
    new URL('../src/components/challenges/RoadMazePlay.tsx', import.meta.url),
    'utf8',
  )
  assert.match(mazeCss228, /1\.4\.228: Easy Samaritan ≤720 \/ phone portrait voids above\/below board/)
  assert.match(
    mazeCss228,
    /@media \(max-height: 920px\) \{[\s\S]*?\.play\.is-road-maze \{[\s\S]*?flex: 1 1 auto/,
  )
  assert.match(
    mazeCss228,
    /@media \(max-height: 920px\) \{[\s\S]*?\.play\.is-road-maze \.maze-board \{[\s\S]*?max-height: none[\s\S]*?aspect-ratio: auto/,
  )
  assert.match(
    mazeCss228,
    /@media \(max-height: 920px\) \{[\s\S]*?\.play\.is-road-maze \.cta-dock \{[\s\S]*?margin-top: 0/,
  )
  assert.match(mazePlay228, /1\.4\.228: phone portrait extends fill 191 \+ board→CTA 201/)
  assert.match(cssSrc, /1\.4\.228: Easy Samaritan ≤720 \/ phone portrait voids above\/below board/)
  assert.match(latestChange('1.4.228').items.join('\n'), /Fixes #300|voids above|below the board|Samaritan|maze/i)
  assert.match(latestChange('1.4.228').title, /Samaritan|≤720|voids above|below board/i)
  assert.doesNotMatch(
    latestChange('1.4.228').items.join('\n'),
    /Fixes #250|Fixes #251|Fixes #252|Fixes #253|#272|#273|#274|#275|#276|#277|#280|#281|#282|#283|#296|#297|#298|#299|#301|#302|Father Dash|Learn cream|Match grid|Lock In|Manage|Sequence order|order bank|stones→result|Dig|Creed|Build|Sort|Snap|Link|Claim merge|Source dig|Story Creek HOLD|slider→HOLD|invent Fun\/Clear/i,
    '1.4.228 must not fix other phone-fail issues or climb another Easy surface',
  )
}

// Easy Clear 1.4.229: Easy Father Dash ≤720 / phone portrait timing-rail→CTA purple void (Fixes #301)
{
  const indexCss229 = readFileSync(new URL('../src/index.css', import.meta.url), 'utf8')
  const fatherPlay229 = readFileSync(
    new URL('../src/components/challenges/FatherRunPlay.tsx', import.meta.url),
    'utf8',
  )
  assert.match(indexCss229, /1\.4\.229: Easy Father Dash ≤720 \/ phone portrait timing-rail→CTA purple void/)
  assert.match(
    indexCss229,
    /@media \(max-height: 920px\) \{[\s\S]*?\.play\.is-father-run \{[\s\S]*?overflow: hidden/,
  )
  assert.match(
    indexCss229,
    /@media \(max-height: 920px\) \{[\s\S]*?\.play\.is-father-run \.run-scene \{[\s\S]*?flex: 1 1 0/,
  )
  assert.match(
    indexCss229,
    /@media \(max-height: 920px\) \{[\s\S]*?\.play\.is-father-run \.cta-dock,\s*\n\s*\.play\.is-father-run \.cta-dock\.run-dock \{[\s\S]*?position: static[\s\S]*?margin-top: 0/,
  )
  assert.match(fatherPlay229, /1\.4\.229: phone portrait strengthens fill/)
  assert.match(cssSrc, /1\.4\.229: Easy Father Dash ≤720 \/ phone portrait timing-rail→CTA purple void/)
  assert.match(latestChange('1.4.229').items.join('\n'), /Fixes #301|timing-rail→CTA|purple void|Father Dash/i)
  assert.match(latestChange('1.4.229').title, /Father Dash|≤720|timing-rail→CTA|purple void/i)
  assert.doesNotMatch(
    latestChange('1.4.229').items.join('\n'),
    /Fixes #250|Fixes #251|Fixes #252|Fixes #253|#272|#273|#274|#275|#276|#277|#280|#281|#282|#283|#296|#297|#298|#299|#300|#302|Learn cream|Match grid|Samaritan|Manage|Lock In|Dig|Creed|Build|Sort|Snap|Link|Road maze|Claim merge|Source dig|Story Creek HOLD|slider→HOLD|invent Fun\/Clear/i,
    '1.4.229 must not fix other phone-fail issues or climb another Easy surface',
  )
}

// Easy Clear 1.4.230: Easy Manage sheet phone width cutout / exposed purple (Fixes #302)
{
  const indexCss230 = readFileSync(new URL('../src/index.css', import.meta.url), 'utf8')
  const mindMap230 = readFileSync(new URL('../src/components/MindMap.tsx', import.meta.url), 'utf8')
  assert.match(indexCss230, /1\.4\.230: Easy Manage sheet phone width cutout/)
  assert.match(
    indexCss230,
    /@media \(max-width: 430px\) \{[\s\S]*?\.mind-map\.is-manage \{[\s\S]*?align-items: stretch/,
  )
  assert.match(
    indexCss230,
    /@media \(max-width: 430px\) \{[\s\S]*?\.mind-map\.is-manage \.mind-map-card \{[\s\S]*?width: 100vw[\s\S]*?max-width: none/,
  )
  assert.match(mindMap230, /1\.4\.230: phone portrait edge-to-edge sheet/)
  assert.match(cssSrc, /1\.4\.230: Easy Manage sheet phone width cutout/)
  assert.match(latestChange('1.4.230').items.join('\n'), /Fixes #302|width cutout|exposed purple|Manage/i)
  assert.match(latestChange('1.4.230').title, /Manage sheet|width cutout|exposed purple/i)
  assert.doesNotMatch(
    latestChange('1.4.230').items.join('\n'),
    /Fixes #250|Fixes #251|Fixes #252|Fixes #253|#272|#273|#274|#275|#276|#277|#280|#281|#282|#283|#296|#297|#298|#299|#300|#301|Father Dash|Learn cream|Match grid|Samaritan|Lock In|Dig|Creed|Build|Sort|Snap|Link|Road maze|Claim merge|Source dig|Story Creek HOLD|slider→HOLD|timing-rail→CTA|invent Fun\/Clear|letterbox|#217/i,
    '1.4.230 must not fix other phone-fail issues or climb another Easy surface',
  )
}

// Easy Clear 1.4.231: Easy Lock In win-end ≤720 / phone portrait fill + triad→Home purple void (invent Fun/Clear)
{
  const holdCss231 = readFileSync(new URL('../src/styles/sortHold.css', import.meta.url), 'utf8')
  const stored231 = readFileSync(new URL('../src/components/StoredLine.tsx', import.meta.url), 'utf8')
  assert.match(holdCss231, /1\.4\.231: Easy Lock In win-end ≤720 \/ phone portrait fill \+ triad→Home purple void/)
  assert.match(
    holdCss231,
    /@media \(max-height: 920px\) \{[\s\S]*?\.challenge-page\.is-after:has\(\.stored-line\) \.after-win \{[\s\S]*?flex: 1 1 auto[\s\S]*?gap: 2px/,
  )
  assert.match(
    holdCss231,
    /@media \(max-height: 920px\) \{[\s\S]*?\.challenge-page\.is-after:has\(\.stored-line\) \.stored-line \{[\s\S]*?flex: 1 1 auto[\s\S]*?gap: 4px/,
  )
  assert.match(
    holdCss231,
    /@media \(max-height: 920px\) \{[\s\S]*?\.challenge-page\.is-after:has\(\.stored-line\) \.town-return \{[\s\S]*?margin-top: 0/,
  )
  assert.match(stored231, /1\.4\.231: phone portrait extends fill 185 \+ triad→Home 208/)
  assert.match(cssSrc, /1\.4\.231: Easy Lock In win-end ≤720 \/ phone portrait fill \+ triad→Home purple void/)
  assert.match(latestChange('1.4.231').items.join('\n'), /fill|triad→Home|phone portrait|purple void|Lock In win-end|StoredLine|invent Fun\/Clear/i)
  assert.match(latestChange('1.4.231').title, /Lock In win-end|≤720|fill|triad→Home|purple void/i)
  assert.doesNotMatch(
    latestChange('1.4.231').items.join('\n'),
    /Fixes #250|Fixes #251|Fixes #252|Fixes #253|#272|#273|#274|#275|#276|#277|#280|#281|#282|#283|#296|#297|#298|#299|#300|#301|#302|Father Dash|Learn cream|Match grid|Samaritan|Manage|Lock In quiz|miss teach|Dig|Creed|Hold|Sort|Snap|Link|Build|Sequence|Road maze|Claim merge|Source dig|Story Creek HOLD|slider→HOLD|timing-rail→CTA|hud→arena|Keep·Toss|choices→CTA|bowl→CTA|stones→result/i,
    '1.4.231 must not fix phone-fail issues or climb another Easy surface',
  )
}

// Easy Clear 1.4.232: Easy Match ≤720 / phone portrait fill + score→CTA purple void (invent Fun/Clear)
{
  const matchCss232 = readFileSync(new URL('../src/styles/match.css', import.meta.url), 'utf8')
  const matchPlay232 = readFileSync(
    new URL('../src/components/challenges/MatchPlay.tsx', import.meta.url),
    'utf8',
  )
  assert.match(matchCss232, /1\.4\.232: Easy Match ≤720 \/ phone portrait fill \+ score→CTA purple void/)
  assert.match(
    matchCss232,
    /@media \(max-height: 920px\) \{[\s\S]*?\.play\.is-match\.is-deal \.match-grid \{[\s\S]*?flex: 1 1 auto/,
  )
  assert.match(
    matchCss232,
    /@media \(max-height: 920px\) \{[\s\S]*?\.play\.is-match\.is-deal \.match-scene \{[\s\S]*?aspect-ratio: auto/,
  )
  assert.match(
    matchCss232,
    /@media \(max-height: 920px\) \{[\s\S]*?\.play\.is-match\.is-deal \.cta-dock \{[\s\S]*?margin-top: 0/,
  )
  assert.match(matchPlay232, /1\.4\.232: phone portrait extends fill 184 \+ score→CTA 207/)
  assert.match(cssSrc, /1\.4\.232: Easy Match ≤720 \/ phone portrait fill \+ score→CTA purple void/)
  assert.match(latestChange('1.4.232').items.join('\n'), /fill|score→CTA|phone portrait|purple void|Match|match-grid|invent Fun\/Clear/i)
  assert.match(latestChange('1.4.232').title, /Easy Match|≤720|fill|score→CTA|purple void/i)
  assert.doesNotMatch(
    latestChange('1.4.232').items.join('\n'),
    /Fixes #250|Fixes #251|Fixes #252|Fixes #253|#272|#273|#274|#275|#276|#277|#280|#281|#282|#283|#296|#297|#298|#299|#300|#301|#302|Father Dash|Learn cream|Samaritan|Manage|Lock In|Dig|Creed|Hold|Sort|Snap|Link|Build|Sequence|Road maze|Claim merge|Source dig|Story Creek HOLD|slider→HOLD|timing-rail→CTA|hud→arena|Keep·Toss|choices→CTA|bowl→CTA|stones→result|triad→Home/i,
    '1.4.232 must not fix phone-fail issues or climb another Easy surface',
  )
}

// Easy Clear 1.4.233: Easy Creed Claim merge ≤720 / phone portrait HUD peel (invent Fun/Clear)
{
  const mergeCss233 = readFileSync(new URL('../src/index.css', import.meta.url), 'utf8')
  const mergePlay233 = readFileSync(
    new URL('../src/components/challenges/ClaimMergePlay.tsx', import.meta.url),
    'utf8',
  )
  assert.match(mergeCss233, /1\.4\.233: Easy Creed Claim merge ≤720 \/ phone portrait HUD peel/)
  assert.match(
    mergeCss233,
    /@media \(max-height: 920px\) \{[\s\S]*?\.play\.is-claim-merge \.story-kicker \{[\s\S]*?display: none/,
  )
  assert.match(
    mergeCss233,
    /@media \(max-height: 920px\) \{[\s\S]*?\.play\.is-claim-merge \.merge-rung-name \{[\s\S]*?display: none/,
  )
  assert.match(mergePlay233, /1\.4\.233: phone portrait extends HUD peel 181/)
  assert.match(cssSrc, /1\.4\.233: Easy Creed Claim merge ≤720 \/ phone portrait HUD peel/)
  assert.match(latestChange('1.4.233').items.join('\n'), /HUD peel|who·where|rung names|phone portrait|Claim merge|Creed|invent Fun\/Clear/i)
  assert.match(latestChange('1.4.233').title, /Easy Creed|≤720|Claim merge|HUD peel/i)
  assert.doesNotMatch(
    latestChange('1.4.233').items.join('\n'),
    /Fixes #250|Fixes #251|Fixes #252|Fixes #253|#272|#273|#274|#275|#276|#277|#280|#281|#282|#283|#296|#297|#298|#299|#300|#301|#302|Father Dash|Learn cream|Samaritan|Manage|Lock In|Dig|Hold|Sort|Snap|Link|Build|Sequence|Road maze|Source dig|Story Creek|Match picture|score→CTA|triad→Home|bowl→CTA|fill 192|dock 200/i,
    '1.4.233 must not fix phone-fail issues or climb another Easy surface',
  )
}

// Easy Clear 1.4.234: Easy Story Creek maze ≤720 / phone portrait HUD peel (invent Fun/Clear)
{
  const mazeCss234 = readFileSync(new URL('../src/styles/maze.css', import.meta.url), 'utf8')
  const mazePlay234 = readFileSync(
    new URL('../src/components/challenges/RoadMazePlay.tsx', import.meta.url),
    'utf8',
  )
  assert.match(mazeCss234, /1\.4\.234: Easy Story Creek maze ≤720 \/ phone portrait HUD peel/)
  assert.match(
    mazeCss234,
    /@media \(max-height: 920px\) \{[\s\S]*?\.play\.is-road-maze \.story-kicker,[\s\S]*?\.play\.is-road-maze \.run-thumbs,[\s\S]*?\.play\.is-road-maze \.story-caption \{[\s\S]*?display: none/,
  )
  assert.match(
    mazeCss234,
    /@media \(max-height: 920px\) \{[\s\S]*?\.play\.is-road-maze \.match-score \{[\s\S]*?font-size: 0\.68rem/,
  )
  assert.match(mazePlay234, /1\.4\.234: phone portrait extends HUD peel 175/)
  assert.match(cssSrc, /1\.4\.234: Easy Story Creek maze ≤720 \/ phone portrait HUD peel/)
  assert.match(latestChange('1.4.234').items.join('\n'), /HUD peel|who·where|thumbs|caption|phone portrait|Story Creek|maze|invent Fun\/Clear/i)
  assert.match(latestChange('1.4.234').title, /Easy Story Creek|≤720|maze HUD peel/i)
  assert.doesNotMatch(
    latestChange('1.4.234').items.join('\n'),
    /Fixes #250|Fixes #251|Fixes #252|Fixes #253|#272|#273|#274|#275|#276|#277|#280|#281|#282|#283|#296|#297|#298|#299|#300|#301|#302|Father Dash|Learn cream|Samaritan voids|Manage|Lock In|Dig|Hold|Sort|Snap|Link|Build|Sequence|Claim merge|Creed|Source dig|Match picture|score→CTA|triad→Home|bowl→CTA|fill 191|board→CTA/i,
    '1.4.234 must not fix phone-fail issues or climb another Easy surface',
  )
}

// Easy Clear 1.4.235: Easy Learn ≤720 / tall-phone bottom-half purple void (Fixes #314)
{
  const welcomeCss235 = readFileSync(new URL('../src/styles/welcome.css', import.meta.url), 'utf8')
  const teachUnlock235 = readFileSync(
    new URL('../src/components/TeachUnlock.tsx', import.meta.url),
    'utf8',
  )
  assert.match(welcomeCss235, /1\.4\.235: Easy Learn ≤720 \/ tall-phone bottom-half purple void/)
  assert.match(
    welcomeCss235,
    /@media \(max-height: 920px\) \{[\s\S]*?\.easy-story-card\.teach-gate \{[\s\S]*?height: 100%[\s\S]*?max-height: 100%/,
  )
  assert.match(
    welcomeCss235,
    /@media \(max-height: 920px\) \{[\s\S]*?\.easy-story-card \.held-triad \{[\s\S]*?align-content: space-evenly/,
  )
  assert.match(
    welcomeCss235,
    /@media \(max-height: 920px\) \{[\s\S]*?\.cta-dock\.easy-story-dock \{[\s\S]*?position: static[\s\S]*?margin-top: auto/,
  )
  assert.match(teachUnlock235, /1\.4\.235: tall-phone strengthens fill 224/)
  assert.match(cssSrc, /1\.4\.235: Easy Learn ≤720 \/ tall-phone bottom-half purple void/)
  assert.match(latestChange('1.4.235').items.join('\n'), /Fixes #314|bottom-half|purple void|Learn|tall-phone|space-evenly|position static/i)
  assert.match(latestChange('1.4.235').title, /Easy Learn|≤720|tall-phone|bottom-half|purple void|Fixes #314/i)
  assert.doesNotMatch(
    latestChange('1.4.235').items.join('\n'),
    /Fixes #250|Fixes #251|Fixes #252|Fixes #253|#272|#273|#274|#275|#276|#277|#280|#281|#282|#283|#296|#297|#298|#299|#300|#301|#302|#315|#316|#317|#318|#319|Father Dash|Match grid|Samaritan|Manage|Lock In|Dig|Creed|Build|Sort|Snap|Link|Road maze|Claim merge|Source dig|Story Creek|invent Fun\/Clear/i,
    '1.4.235 must not fix other phone-fail issues or climb another Easy surface',
  )
}

// Easy Clear 1.4.236: Easy Match ≤720 / tall-phone bottom-half purple void (Fixes #315)
{
  const matchCss236 = readFileSync(new URL('../src/styles/match.css', import.meta.url), 'utf8')
  const matchArtTight236 = readFileSync(
    new URL('../src/styles/match-art-tight.css', import.meta.url),
    'utf8',
  )
  const matchPlay236 = readFileSync(
    new URL('../src/components/challenges/MatchPlay.tsx', import.meta.url),
    'utf8',
  )
  const gemPlay236 = readFileSync(
    new URL('../src/components/challenges/GemSearchPlay.tsx', import.meta.url),
    'utf8',
  )
  assert.match(matchCss236, /1\.4\.236: Easy Match ≤720 \/ tall-phone bottom-half purple void/)
  assert.match(
    matchCss236,
    /@media \(max-height: 920px\) \{[\s\S]*?\.play\.is-match\.is-deal \{[\s\S]*?height: 100%[\s\S]*?max-height: 100%[\s\S]*?overflow: hidden/,
  )
  assert.match(
    matchCss236,
    /@media \(max-height: 920px\) \{[\s\S]*?\.play\.is-match\.is-deal \.match-grid \{[\s\S]*?flex: 1 1 0/,
  )
  assert.match(
    matchCss236,
    /@media \(max-height: 920px\) \{[\s\S]*?\.play\.is-match\.is-deal \.cta-dock \{[\s\S]*?position: static[\s\S]*?margin-top: auto/,
  )
  assert.match(matchArtTight236, /1\.4\.236: Easy Match gemSearch ≤720 \/ tall-phone bottom-half purple void/)
  assert.match(
    matchArtTight236,
    /@media \(max-height: 920px\) \{[\s\S]*?\.play\.is-gem-search\.is-panel-blast\.is-story-docked \.gem-board \{[\s\S]*?flex: 1 1 0/,
  )
  assert.match(
    matchArtTight236,
    /@media \(max-height: 920px\) \{[\s\S]*?\.play\.is-gem-search\.is-panel-blast\.is-story-docked \.cta-dock \{[\s\S]*?position: static[\s\S]*?margin-top: auto/,
  )
  assert.match(matchPlay236, /1\.4\.236: tall-phone strengthens fill 232/)
  assert.match(gemPlay236, /1\.4\.236: tall-phone strengthens fill 225/)
  assert.match(cssSrc, /1\.4\.236: Easy Match ≤720 \/ tall-phone bottom-half purple void/)
  assert.match(latestChange('1.4.236').items.join('\n'), /Fixes #315|bottom-half|purple void|Match|tall-phone|position static|flex 1 1 0/i)
  assert.match(latestChange('1.4.236').title, /Easy Match|≤720|tall-phone|bottom-half|purple void|Fixes #315/i)
  assert.doesNotMatch(
    latestChange('1.4.236').items.join('\n'),
    /Fixes #250|Fixes #251|Fixes #252|Fixes #253|#272|#273|#274|#275|#276|#277|#280|#281|#282|#283|#296|#297|#298|#299|#300|#301|#302|#314|#316|#317|#318|#319|Father Dash|Learn cream|Samaritan|Manage|Lock In|Dig|Creed|Build|Sort|Snap|Link|Road maze|Claim merge|Source dig|Story Creek|invent Fun\/Clear/i,
    '1.4.236 must not fix other phone-fail issues or climb another Easy surface',
  )
}

// Easy Clear 1.4.237: Easy Lock In quiz ≤720 / tall-phone bottom-half purple void (Fixes #316)
{
  const holdCss237 = readFileSync(new URL('../src/styles/sortHold.css', import.meta.url), 'utf8')
  const whyPlay237 = readFileSync(
    new URL('../src/components/challenges/WhyBlastPlay.tsx', import.meta.url),
    'utf8',
  )
  assert.match(holdCss237, /1\.4\.237: Easy Lock In quiz ≤720 \/ tall-phone bottom-half purple void/)
  assert.match(
    holdCss237,
    /@media \(max-height: 920px\) \{[\s\S]*?\.app\.is-play \.app-body:has\(\.journal\.is-rehearse \.why-blast:not\(\.is-miss-teach\):not\(\.is-win\)\) \{[\s\S]*?height: 100%[\s\S]*?max-height: 100%[\s\S]*?flex: 1 1 0/,
  )
  assert.match(
    holdCss237,
    /@media \(max-height: 920px\) \{[\s\S]*?\.why-blast:not\(\.is-miss-teach\):not\(\.is-win\) \.why-arena \{[\s\S]*?flex: 1 1 0/,
  )
  assert.match(
    holdCss237,
    /@media \(max-height: 920px\) \{[\s\S]*?\.why-blast:not\(\.is-miss-teach\):not\(\.is-win\) \.cta-dock[\s\S]*?position: static[\s\S]*?margin-top: auto/,
  )
  assert.match(whyPlay237, /1\.4\.237: tall-phone strengthens fill 226/)
  assert.match(cssSrc, /1\.4\.237: Easy Lock In quiz ≤720 \/ tall-phone bottom-half purple void/)
  assert.match(latestChange('1.4.237').items.join('\n'), /Fixes #316|bottom-half|purple void|Lock In quiz|tall-phone|position static|flex 1 1 0/i)
  assert.match(latestChange('1.4.237').title, /Easy Lock In quiz|≤720|tall-phone|bottom-half|purple void|Fixes #316/i)
  assert.doesNotMatch(
    latestChange('1.4.237').items.join('\n'),
    /Fixes #250|Fixes #251|Fixes #252|Fixes #253|#272|#273|#274|#275|#276|#277|#280|#281|#282|#283|#296|#297|#298|#299|#300|#301|#302|#314|#315|#317|#318|#319|Father Dash|Learn cream|Match grid|Samaritan|Manage|miss teach|Dig|Creed|Build|Sort|Snap|Link|Road maze|Claim merge|Source dig|Story Creek|invent Fun\/Clear/i,
    '1.4.237 must not fix other phone-fail issues or climb another Easy surface',
  )
}

// Easy Clear 1.4.238: Easy Lock In feedback ≤720 / tall-phone bottom-half purple void (Fixes #317)
{
  const holdCss238 = readFileSync(new URL('../src/styles/sortHold.css', import.meta.url), 'utf8')
  const whyPlay238 = readFileSync(
    new URL('../src/components/challenges/WhyBlastPlay.tsx', import.meta.url),
    'utf8',
  )
  assert.match(holdCss238, /1\.4\.238: Easy Lock In feedback ≤720 \/ tall-phone bottom-half purple void/)
  assert.match(
    holdCss238,
    /@media \(max-height: 920px\) \{[\s\S]*?\.app\.is-play \.app-body:has\(\.journal\.is-rehearse \.why-blast\.is-miss-teach\) \{[\s\S]*?height: 100%[\s\S]*?max-height: 100%[\s\S]*?flex: 1 1 0/,
  )
  assert.match(
    holdCss238,
    /@media \(max-height: 920px\) \{[\s\S]*?\.why-blast\.is-miss-teach \.why-miss-teach \{[\s\S]*?flex: 1 1 0/,
  )
  assert.match(
    holdCss238,
    /@media \(max-height: 920px\) \{[\s\S]*?\.why-blast\.is-miss-teach \.why-miss-teach \.cta-dock[\s\S]*?position: static[\s\S]*?margin-top: auto/,
  )
  assert.match(whyPlay238, /1\.4\.238: tall-phone strengthens fill 227/)
  assert.match(cssSrc, /1\.4\.238: Easy Lock In feedback ≤720 \/ tall-phone bottom-half purple void/)
  assert.match(latestChange('1.4.238').items.join('\n'), /Fixes #317|bottom-half|purple void|Lock In feedback|tall-phone|position static|flex 1 1 0/i)
  assert.match(latestChange('1.4.238').title, /Easy Lock In feedback|≤720|tall-phone|bottom-half|purple void|Fixes #317/i)
  assert.doesNotMatch(
    latestChange('1.4.238').items.join('\n'),
    /Fixes #250|Fixes #251|Fixes #252|Fixes #253|#272|#273|#274|#275|#276|#277|#280|#281|#282|#283|#296|#297|#298|#299|#300|#301|#302|#314|#315|#316|#318|#319|Father Dash|Learn cream|Match grid|Samaritan|Manage|Lock In quiz|Dig|Creed|Build|Sort|Snap|Link|Road maze|Claim merge|Source dig|Story Creek|invent Fun\/Clear/i,
    '1.4.238 must not fix other phone-fail issues or climb another Easy surface',
  )
}

// Easy Clear 1.4.239: Easy Samaritan / Story Creek road maze ≤720 / tall-phone voids above/below board (Fixes #318)
{
  const mazeCss239 = readFileSync(new URL('../src/styles/maze.css', import.meta.url), 'utf8')
  const roadPlay239 = readFileSync(
    new URL('../src/components/challenges/RoadMazePlay.tsx', import.meta.url),
    'utf8',
  )
  assert.match(mazeCss239, /1\.4\.239: Easy Samaritan \/ Story Creek road maze ≤720 \/ tall-phone voids above\/below board/)
  assert.match(
    mazeCss239,
    /@media \(max-height: 920px\) \{[\s\S]*?\.play\.is-road-maze \{[\s\S]*?height: 100%[\s\S]*?max-height: 100%[\s\S]*?overflow: hidden/,
  )
  assert.match(
    mazeCss239,
    /@media \(max-height: 920px\) \{[\s\S]*?\.play\.is-road-maze \.maze-stage \{[\s\S]*?flex: 1 1 0/,
  )
  assert.match(
    mazeCss239,
    /@media \(max-height: 920px\) \{[\s\S]*?\.play\.is-road-maze \.maze-board \{[\s\S]*?flex: 1 1 0[\s\S]*?aspect-ratio: auto/,
  )
  assert.match(
    mazeCss239,
    /@media \(max-height: 920px\) \{[\s\S]*?\.play\.is-road-maze \.cta-dock \{[\s\S]*?position: static/,
  )
  assert.match(roadPlay239, /1\.4\.239: tall-phone strengthens fill 228/)
  assert.match(cssSrc, /1\.4\.239: Easy Samaritan \/ Story Creek road maze ≤720 \/ tall-phone voids above\/below board/)
  assert.match(latestChange('1.4.239').items.join('\n'), /Fixes #318|voids above\/below|purple|Samaritan|tall-phone|position static|flex 1 1 0/i)
  assert.match(latestChange('1.4.239').title, /Easy Samaritan|≤720|tall-phone|voids above\/below|Fixes #318/i)
  assert.doesNotMatch(
    latestChange('1.4.239').items.join('\n'),
    /Fixes #250|Fixes #251|Fixes #252|Fixes #253|#272|#273|#274|#275|#276|#277|#280|#281|#282|#283|#296|#297|#298|#299|#300|#301|#302|#314|#315|#316|#317|#319|Father Dash|Learn cream|Match grid|Manage|Lock In|Dig|Creed|Build|Sort|Snap|Link|Claim merge|Source dig|invent Fun\/Clear|Sequence/i,
    '1.4.239 must not fix other phone-fail issues or climb another Easy surface',
  )
}

// Easy Clear 1.4.240: Easy Father Dash ≤720 / tall-phone rail→CTA purple void (Fixes #319)
{
  const indexCss240 = readFileSync(new URL('../src/index.css', import.meta.url), 'utf8')
  const fatherPlay240 = readFileSync(
    new URL('../src/components/challenges/FatherRunPlay.tsx', import.meta.url),
    'utf8',
  )
  assert.match(indexCss240, /1\.4\.240: Easy Father Dash ≤720 \/ tall-phone rail→CTA purple void/)
  assert.match(
    indexCss240,
    /@media \(max-height: 920px\) \{[\s\S]*?\.app-body:has\(\.play\.is-father-run\) \{[\s\S]*?height: 100%[\s\S]*?overflow: hidden/,
  )
  assert.match(
    indexCss240,
    /@media \(max-height: 920px\) \{[\s\S]*?\.play\.is-father-run \{[\s\S]*?height: 100%[\s\S]*?overflow: hidden/,
  )
  assert.match(
    indexCss240,
    /@media \(max-height: 920px\) \{[\s\S]*?\.play\.is-father-run \.run-scene \{[\s\S]*?flex: 1 1 0/,
  )
  assert.match(
    indexCss240,
    /@media \(max-height: 920px\) \{[\s\S]*?\.play\.is-father-run \.cta-dock,\s*\n\s*\.play\.is-father-run \.cta-dock\.run-dock \{[\s\S]*?position: static[\s\S]*?margin-top: 0/,
  )
  assert.match(fatherPlay240, /1\.4\.240: tall-phone strengthens fill 229/)
  assert.match(cssSrc, /1\.4\.240: Easy Father Dash ≤720 \/ tall-phone rail→CTA purple void/)
  assert.match(latestChange('1.4.240').items.join('\n'), /Fixes #319|rail→CTA|purple void|Father Dash|tall-phone|position static|flex 1 1 0/i)
  assert.match(latestChange('1.4.240').title, /Easy Father Dash|≤720|tall-phone|rail→CTA|purple void|Fixes #319/i)
  assert.doesNotMatch(
    latestChange('1.4.240').items.join('\n'),
    /Fixes #250|Fixes #251|Fixes #252|Fixes #253|#272|#273|#274|#275|#276|#277|#280|#281|#282|#283|#296|#297|#298|#299|#300|#301|#302|#314|#315|#316|#317|#318|Learn cream|Match grid|Samaritan|Manage|Lock In|Dig|Creed|Build|Sort|Snap|Link|Road maze|Claim merge|Source dig|Story Creek HOLD|slider→HOLD|invent Fun\/Clear|Sequence/i,
    '1.4.240 must not fix other phone-fail issues or climb another Easy surface',
  )
}
