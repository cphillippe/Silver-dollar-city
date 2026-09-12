import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import {
  CITY_HOLLOW_TO_WITNESS,
  CITY_PLOTS,
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
import { linkCaption, linkClue, linkMiss, linkPicture, STREET_CHALLENGE, STREET_LIGHTS, STREET_WHYS } from '../src/content/links.ts'
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
} from '../src/lib/cityBuild.ts'
import { emptyProgress } from '../src/lib/save.ts'
import { EASY, easyChromeLine, easyFacingLine, easyWrongTap, uniqueHoldChoices } from '../src/lib/easy.ts'
import { WORDS, easyLead } from '../src/lib/words.ts'
import { deeperLinksFor, eraLabel } from '../src/content/deeper.ts'
import { allEvidenceIds, evidenceFor } from '../src/content/evidence.ts'
import { plainFor } from '../src/content/plain.ts'
import { profileInventory } from '../src/lib/profile.ts'

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
assert.match(mapSrc, /city-beat/)
assert.match(mapSrc, /is-rising/)
assert.match(mapSrc, /beat\.beat/)
assert.match(mapSrc, /city-folk/)
assert.match(mapSrc, /TownFolk/)
assert.match(mapSrc, /city-portrait/)
assert.match(mapSrc, /tweenCam/)
assert.match(mapSrc, /Grew!/)
assert.match(mapSrc, /beatRank/)
assert.match(mapSrc, /maybeHomecoming/)
assert.match(mapSrc, /Still lit/)
assert.match(mapSrc, /city-morrow/)
assert.match(mapSrc, /city-gift/)
assert.match(mapSrc, /nextGift/)
assert.match(mapSrc, /city-home-pad/)
assert.match(mapSrc, /city-roof-tile/)
assert.match(mapSrc, /PlotArt/)
assert.match(mapSrc, /HollowArt/)
assert.match(mapSrc, /PorchArt/)
assert.match(mapSrc, /HeavenCity/)
assert.match(mapSrc, /EdenGrove/)
assert.match(mapSrc, /SpinePath/)
assert.match(mapSrc, /City of Heaven/)
assert.match(mapSrc, /Eden → City of Heaven/)
assert.match(mapSrc, /heavenForm/)
assert.match(mapSrc, /SPINE_GROW/)
assert.match(mapSrc, /Heaven waits/)

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
assert.match(welcomeSrc, /STORY\.purpose/)
assert.match(welcomeSrc, /STORY\.who/)
assert.doesNotMatch(welcomeSrc, /cityPromise/)
assert.doesNotMatch(welcomeSrc, /welcome-cast-late/)
assert.match(welcomeSrc, /YOU · RIVER/)
assert.match(welcomeSrc, /GUIDE · JUNIPER/)

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

const dailySrc = readFileSync(
  new URL('../src/content/daily.ts', import.meta.url),
  'utf8',
)
assert.match(dailySrc, /the heavens already speak of a Maker/)
assert.match(dailySrc, /why: 'A gift-shaped beauty/)
assert.match(dailySrc, /why: 'Scripture treats the created order/)
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
assert.match(recallSrc, /EASY\.keepThis/)
assert.match(recallSrc, /EASY\.tapWhy/)
assert.match(recallSrc, /easyChromeLine/)
{
  const easyHold = recallSrc.match(/if \(easyEncode\) \{\s*return \(([\s\S]*?)\n  \}/)?.[1] ?? ''
  assert.match(easyHold, /EASY\.tapWhy/)
  assert.match(easyHold, /EASY\.rememberSentence/)
  assert.match(easyHold, /reasonOptions\.map/)
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

const matchCss = readFileSync(new URL('../src/index.css', import.meta.url), 'utf8')
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
assert.match(evidenceSrc, /Designer who wants observers/)
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
assert.match(evidenceSrc, /That yields a Cause of the beginning/)
assert.match(evidenceSrc, /costly opening if the goal were instant respectability/)
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
assert.match(challengeSrc, /onNavigate\(\{ name: 'hub' \}\)/)
assert.match(challengeSrc, /afterJuice/)
assert.match(challengeSrc, /savedWin/)
assert.match(challengeSrc, /puzzle-title/)
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
assert.doesNotMatch(cityLibSrc, /Walk again/)
assert.match(cityLibSrc, /Still lit/)
assert.match(cityLibSrc, /Seven Seals/)
assert.doesNotMatch(cityLibSrc, /Keep building/)
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

const cssSrc = readFileSync(new URL('../src/index.css', import.meta.url), 'utf8')
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
assert.match(defendSrc, /defend-lantern/)
assert.match(defendSrc, /defend-ridge/)
assert.match(defendSrc, /defend-beam/)
assert.match(defendSrc, /defend-porch/)
assert.match(defendSrc, /defend-blast/)
assert.match(defendSrc, /Night held!/)
assert.match(defendSrc, /comboRef/)
assert.match(defendSrc, /Turn them toward heaven/)
assert.match(defendSrc, /unlockedWatchAbilities/)
assert.match(defendSrc, /heavenPoint/)
assert.match(defendSrc, /AbilityMark/)
assert.match(defendSrc, /easyTapFit/)
assert.match(defendSrc, /raidForWave/)
assert.match(defendSrc, /WALKER_LABEL/)
assert.match(defendSrc, /learningForTool/)
assert.match(defendSrc, /recordNight/)
assert.doesNotMatch(defendSrc, /kind: 'encode'/)
assert.match(defendSrc, /WATCH_ABILITY_LABEL/)
assert.match(defendSrc, /WATCH_TOOLS\.map/)
assert.match(defendSrc, /TIER_MARK/)
assert.match(defendSrc, /defend-heaven-path/)
assert.match(defendSrc, /Toward heaven/)
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
  /Hold this line to deploy/,
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
assert.match(defendSrc, /preserveAspectRatio="xMidYMid meet"/)
assert.match(defendSrc, /walkerSrc/)
assert.match(
  readFileSync(new URL('../src/components/Avatar.tsx', import.meta.url), 'utf8'),
  /portrait-river/,
)
assert.doesNotMatch(
  readFileSync(new URL('../src/components/Avatar.tsx', import.meta.url), 'utf8'),
  /HairCap/,
)
assert.match(
  readFileSync(new URL('../src/components/CityMap.tsx', import.meta.url), 'utf8'),
  /is-tapped/,
)
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
assert.equal(APP_VERSION, '1.4.42')
assert.equal(CAST.river.name, 'River')
assert.equal(CAST.juniper.name, 'Juniper Wick')
assert.equal(CAST.mercy.name, 'Mercy Wren')
assert.equal(CAST.silas.name, 'Silas Whitman')
assert.equal(CAST.nora.name, 'Nora Skye')
assert.equal(CAST.nora.role, 'Sky-watch keeper')
assert.equal(CAST.ansel.name, 'Ansel Gate')
assert.equal(CAST.ansel.role, 'Why-gate keeper')
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
assert.equal(easyPlaceSub('gate'), 'Ansel’s why-a-world gate')
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
assert.ok(CHANGELOG.some((note) => note.title === 'V0 launch'))
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
assert.equal(STREET_CHALLENGE.triples.length, 3)
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
assert.match(mapSrc, /BUILD_SCALE/)
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
assert.match(mapSrc, /EASY_TAG_SLOT/)
assert.match(mapSrc, /setMindPlot\(id\)/)
assert.match(hubSrc, /EASY\.matchCta/)
assert.match(TOWN_PATH_HARD, /Heaven/)
assert.match(mapSrc, /TOWN_PATH/)
assert.match(
  readFileSync(new URL('../src/components/Landmark.tsx', import.meta.url), 'utf8'),
  /Story Creek/,
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
assert.match(linkPlaySrc, /wizard-step/)
assert.match(linkPlaySrc, /EASY\.connectLink/)
assert.match(linkPlaySrc, /This one/)
assert.match(linkPlaySrc, /scrollIntoView/)
assert.match(linkPlaySrc, /is-not/)
assert.match(linkPlaySrc, /'choose' \| 'miss' \| 'next'/)
assert.match(linkPlaySrc, /wantId/)
assert.match(linkPlaySrc, /is-wizard/)
assert.match(linkPlaySrc, /is-picture/)
assert.match(linkPlaySrc, /PlaceGlyph/)
assert.match(linkPlaySrc, /size="xl"/)
assert.match(linkPlaySrc, /linkPicture/)
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
  assert.equal(easyWrongTap('Neighbor shows mercy.'), 'Wrong. Tap this one: Neighbor shows mercy.')
  assert.equal(linkMiss('mercy-hollow', 'idea'), easyWrongTap('Neighbor shows mercy.'))
  assert.doesNotMatch(linkMiss('mercy-hollow', 'idea'), /Tap This one\. Tap:/)
  assert.doesNotMatch(linkMiss('mercy-hollow', 'idea'), /neighbor-line/)
  assert.doesNotMatch(linkMiss('mercy-hollow', 'idea'), /This story is Mercy/)
  assert.match(linkMiss('silas-bench', 'place'), /^Wrong\. Tap this one: .+\.$/)
  assert.match(linkMiss('juniper-porch', 'person'), /^Wrong\. Tap this one: .+\.$/)
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
  /A sitting is about 3 pages/,
)
assert.match(mapSrc, /setMindPlot/)
assert.match(mapSrc, /MindMap/)
assert.match(mapSrc, /EASY_TAG_SLOT/)
assert.match(mapSrc, /setMindPlot\(id\)/)
assert.match(mapSrc, /city-plot-hit/)
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

for (const id of allEvidenceIds()) {
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
assert.match(
  changelogSrc,
  /Dig deeper: Scripture and older witnesses when they fit; later faithful sources welcome when they help\./,
)
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
  readFileSync(new URL('../src/lib/easy.ts', import.meta.url), 'utf8'),
  /Town \(soon\)/,
)
assert.match(
  readFileSync(new URL('../src/lib/easy.ts', import.meta.url), 'utf8'),
  /scrapbook of matches/,
)
assert.match(
  readFileSync(new URL('../src/lib/easy.ts', import.meta.url), 'utf8'),
  /Read today’s story/,
)
assert.match(
  readFileSync(new URL('../src/lib/easy.ts', import.meta.url), 'utf8'),
  /Tap the line you kept/,
)
assert.match(
  readFileSync(new URL('../src/lib/easy.ts', import.meta.url), 'utf8'),
  /Tap why this is true/,
)
assert.match(
  readFileSync(new URL('../src/lib/easy.ts', import.meta.url), 'utf8'),
  /A reason is why this is true/,
)
assert.match(
  readFileSync(new URL('../src/lib/easy.ts', import.meta.url), 'utf8'),
  /Tap the sentence, then the place, then the person/,
)
assert.match(
  readFileSync(new URL('../src/lib/easy.ts', import.meta.url), 'utf8'),
  /Tap this next — short Jesus story/,
)
assert.match(
  readFileSync(new URL('../src/lib/easy.ts', import.meta.url), 'utf8'),
  /Save your picks/,
)
assert.match(
  readFileSync(new URL('../src/lib/easy.ts', import.meta.url), 'utf8'),
  /easyFacingLine/,
)
assert.match(
  readFileSync(new URL('../src/lib/easy.ts', import.meta.url), 'utf8'),
  /why this is true/,
)
assert.match(
  readFileSync(new URL('../src/lib/easy.ts', import.meta.url), 'utf8'),
  /easyJournalMeta/,
)
assert.match(
  readFileSync(new URL('../src/lib/easy.ts', import.meta.url), 'utf8'),
  /used as/,
)
assert.match(
  readFileSync(new URL('../src/lib/easy.ts', import.meta.url), 'utf8'),
  /Tap the sentence, then the place, then the person/,
)
assert.match(
  readFileSync(new URL('../src/lib/easy.ts', import.meta.url), 'utf8'),
  /Wrong\. Tap this one: \$\{label\}/,
)
assert.match(
  readFileSync(new URL('../src/lib/easy.ts', import.meta.url), 'utf8'),
  /Keep the right pictures/,
)
assert.match(
  readFileSync(new URL('../src/components/DigDeeper.tsx', import.meta.url), 'utf8'),
  /EASY\.reasonSense/,
)
assert.match(defendSrc, /easyFacingLine/)
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
assert.match(hubSrc, /EASY\.townSoon/)
assert.match(hubSrc, /EASY\.saved/)
assert.match(hubSrc, /EASY\.matchCta/)
assert.match(hubSrc, /EASY\.nightSoon/)
{
  const easyHome = hubSrc.match(/if \(easy\) \{\s*return \(([\s\S]*?)\n  \}/)?.[1] ?? ''
  assert.match(easyHome, /EASY\.matchCta/)
  assert.match(easyHome, /EASY\.saved/)
  assert.match(easyHome, /EASY\.townSoon/)
  assert.match(easyHome, /EASY\.nightSoon/)
  assert.doesNotMatch(easyHome, /EASY\.nightDo/)
  assert.doesNotMatch(easyHome, /name: 'defend'/)
  assert.doesNotMatch(easyHome, /className="btn gold xl"[\s\S]*Night Watch/)
}
assert.match(
  readFileSync(new URL('../src/components/Settings.tsx', import.meta.url), 'utf8'),
  /EASY\.townSoon/,
)
assert.match(
  readFileSync(new URL('../src/components/Settings.tsx', import.meta.url), 'utf8'),
  /EASY\.nightSoon/,
)
assert.match(latestChange(APP_VERSION).items.join('\n'), /Town \(soon\)/)
assert.match(latestChange(APP_VERSION).items.join('\n'), /Night Watch hidden until Match→Hold/)
assert.equal(EASY.nightSoon, 'Night Watch (soon)')
assert.match(
  readFileSync(new URL('../src/components/LinkScreen.tsx', import.meta.url), 'utf8'),
  /easy \? \{ name: 'journal' \} : \{ name: 'hub' \}/,
)
assert.doesNotMatch(
  readFileSync(new URL('../src/components/LinkScreen.tsx', import.meta.url), 'utf8'),
  /name: 'defend'/,
)
assert.match(
  readFileSync(new URL('../src/components/Profile.tsx', import.meta.url), 'utf8'),
  /EASY\.nightSoon/,
)
assert.match(
  readFileSync(new URL('../src/components/Profile.tsx', import.meta.url), 'utf8'),
  /easy \? \(/,
)
assert.match(cssSrc, /is-easy-home/)
assert.match(cssSrc, /easy-core/)
assert.match(hubSrc, /EASY\.connectLink/)
assert.match(
  readFileSync(new URL('../src/content/lots.ts', import.meta.url), 'utf8'),
  /Story Creek · Jesus stories/,
)
assert.match(
  readFileSync(new URL('../src/lib/easy.ts', import.meta.url), 'utf8'),
  /Love — when compassion moves you, help like the Samaritan/,
)
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
assert.match(
  readFileSync(new URL('../src/lib/easy.ts', import.meta.url), 'utf8'),
  /Main idea = the short true line we keep/,
)
assert.match(defendSrc, /is-easy-walker/)
assert.match(defendSrc, /waveSpeed\(easy\)/)
assert.match(defendSrc, /easy && item.id === targetId/)
assert.match(defendSrc, /easy-walker-face/)
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
  'If you were forgiven a huge debt, you cannot choke a neighbor over a small one.',
)
assert.equal(
  easyChromeLine('Jesus is only reforming first-century banking.'),
  'Jesus is only talking about old money rules.',
)
assert.doesNotMatch(easyChromeLine('Keep the mercy. Toss the throttle.'), /throttle/)
assert.equal(
  easyChromeLine('The servant forgiven an unpayable debt then throttles a peer over a small sum.'),
  'He was forgiven a huge debt, then choked a neighbor over a small one.',
)
assert.equal(
  easyChromeLine('The first servant was right to demand prison.'),
  'Jail him over a tiny debt.',
)
assert.doesNotMatch(
  easyChromeLine('The servant forgiven an unpayable debt then throttles a peer over a small sum.'),
  /throttles a peer/,
)
assert.doesNotMatch(EASY.loveCue, /mean line/)
assert.doesNotMatch(EASY.nightLead, /mean line|claim|throttle/)
assert.match(mapSrc, /EASY_FOLK_LIFT/)
assert.match(mapSrc, /easy\s*\?\s*false/)
assert.equal(EASY_FOLK_LIFT, 56)
{
  const folkY = { hollow: 352, lamps: 358, bench: 344, porch: 356 }
  for (const [id, y] of Object.entries(folkY)) {
    const portraitBottom = y - EASY_FOLK_LIFT - 50 + 44
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
assert.match(hubSrc, /easy \? null : <AdSlot slot="hub-banner"/)
assert.match(
  readFileSync(new URL('../src/components/Settings.tsx', import.meta.url), 'utf8'),
  /settings-advanced/,
)
assert.match(
  readFileSync(new URL('../src/components/DigDeeper.tsx', import.meta.url), 'utf8'),
  /if \(easy\) return null/,
)
assert.match(mapSrc, /easy \? 'seed'/)
assert.match(mapSrc, /easy \? null : <SpinePath/)
assert.match(mapSrc, /if \(isEasy\(progress\)\) return/)
assert.match(mapSrc, /if \(playing\.current && !isEasy\(progress\)\) return/)
assert.match(mapSrc, /Tap a building to Manage it/)
assert.doesNotMatch(latestChange(APP_VERSION).title, /Heaven/)
assert.match(latestChange(APP_VERSION).title, /core/)
assert.match(latestChange(APP_VERSION).items.join('\n'), /6\/6/)
assert.match(latestChange(APP_VERSION).items.join('\n'), /Match/)
assert.match(latestChange(APP_VERSION).items.join('\n'), /Story Creek/)
assert.match(latestChange(APP_VERSION).items.join('\n'), /Witness Square/)
assert.match(latestChange(APP_VERSION).items.join('\n'), /Sky Watch/)
assert.match(latestChange(APP_VERSION).items.join('\n'), /Meaning Ridge/)
assert.match(defendSrc, /easyTapTarget/)
assert.match(defendSrc, /data-person-node="walker"/)
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
assert.match(
  readFileSync(new URL('../src/lib/easy.ts', import.meta.url), 'utf8'),
  /Tap the face/,
)
assert.match(
  readFileSync(new URL('../src/lib/easy.ts', import.meta.url), 'utf8'),
  /saved: 'Hold'/,
)
assert.match(
  readFileSync(new URL('../src/lib/easy.ts', import.meta.url), 'utf8'),
  /Connections/,
)
assert.match(
  readFileSync(new URL('../src/lib/easy.ts', import.meta.url), 'utf8'),
  /Things you can use/,
)
assert.doesNotMatch(
  latestChange(APP_VERSION).items.join('\n'),
  /dossier|ledger|scaffold|proofs|offline-first|schema|mind-map|held ideas|Evidence Journal/i,
)
assert.match(defendSrc, /taught = true/)
assert.match(defendSrc, /easy-walker-cue-label/)
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
  /easyStoryCard/,
)
assert.match(cssSrc, /easy-steps/)
assert.match(
  readFileSync(new URL('../src/components/AppShell.tsx', import.meta.url), 'utf8'),
  /easy \? EASY\.saved : 'Journal'/,
)
assert.match(linkPlaySrc, /easy-steps/)
assert.match(linkPlaySrc, /1 · Sentence/)
assert.match(
  readFileSync(new URL('../src/lib/easy.ts', import.meta.url), 'utf8'),
  /Tap a sentence/,
)
assert.match(linkPlaySrc, /is-screen-\$\{screen\}/)
assert.doesNotMatch(defendSrc, /easyTap && tool\.id !== ability/)
assert.match(defendSrc, /WATCH_TOOLS\.map/)
assert.match(defendSrc, /EASY\.nightLead/)
assert.equal(EASY.nightLead, 'Tap the face six times.')
assert.equal(EASY.rememberSentence, 'Tap the line you kept.')
assert.equal(EASY.tapWhy, 'Tap why this is true.')
assert.equal(EASY.reasonTeach, 'A reason is why this is true.')
assert.equal(EASY.saved, 'Hold')
assert.equal(EASY.savedSub, 'saved lines')
assert.equal(EASY.nightMiss, 'Wrong — tap the glowing face')
assert.match(defendSrc, /EASY\.nightMiss/)
assert.match(defendSrc, /TAP \$\{downed\}/)
assert.match(defendSrc, /You missed\. Tap the face/)
assert.match(defendSrc, /walking\.some\(\(item\) => !item\.turned\)/)
assert.doesNotMatch(defendSrc, /matching sentence/)
assert.match(
  readFileSync(new URL('../src/components/challenges/LinkPlay.tsx', import.meta.url), 'utf8'),
  /screen === 'next'/,
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
  /Read more/,
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
  /Easier words/,
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
assert.match(
  readFileSync(new URL('../src/components/Welcome.tsx', import.meta.url), 'utf8'),
  />\s*Hard\s*</,
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
assert.match(teachSrc, /The claim you will hold/)
assert.match(teachSrc, /Skip reading/)
assert.match(teachSrc, /The main idea you will keep/)
assert.doesNotMatch(teachSrc, /A claim is the main idea we hold to be true/)
assert.ok(
  teachSrc.indexOf('teach-reason') < teachSrc.indexOf('brief.claim'),
  'teach story before the claim line',
)
assert.match(matchSrc, /match-col-label/)
assert.match(matchSrc, /Main idea' : 'Claim'/)
assert.match(matchSrc, /EASY\.matchHow/)
assert.match(matchSrc, /easyWrongTap/)
assert.match(matchSrc, /EASY\.lockIn/)
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
  assert.match(latestChange(APP_VERSION).items.join('\n'), /tool how-to, not a claim/)
  assert.match(latestChange(APP_VERSION).items.join('\n'), /Luke 10/)

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
}

assert.match(
  latestChange(APP_VERSION).items.join('\n'),
  /Tap the line you kept/,
)
assert.match(
  latestChange(APP_VERSION).items.join('\n'),
  /Tap why this is true/,
)
assert.match(
  latestChange(APP_VERSION).items.join('\n'),
  /Wrong — tap the glowing face/,
)

console.log('check-city: ok')
