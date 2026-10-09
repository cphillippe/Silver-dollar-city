import assert from 'node:assert/strict'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
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
import { easyLoopLine as easyLoopFromLib, easyTrailView as easyTrailViewFromLib } from '../src/lib/easy.ts'
import {
  easyLoopLine as easyLoopFromShelf,
  easyTrailView as easyTrailViewFromShelf,
} from '../src/easyTrail/trail/index.ts'
import * as easyLib from '../src/lib/easy.ts'
import * as trailLoopHome from '../src/easyTrail/trail/loop.ts'
import * as trailShelf from '../src/easyTrail/trail/index.ts'
import { normalizeProgress } from '../src/lib/save.ts'
import { nightWatchJumpAllowed, nightWatchRoundJump } from '../src/lib/nightWatchDebug.ts'
import {
  PH_ROAD_SHOW_IT,
  SHOW_IT_LINE,
  SHOW_IT_PROMPT,
  SHOW_IT_WORD_CAP,
  showItWordCount,
} from '../src/content/showIt.ts'
import { lociStampFor } from '../src/lib/lociStamp.ts'
import { CAST } from '../src/content/story.ts'
import { CHANGELOG, latestChange } from '../src/content/changelog.ts'
import { sortMissCopy } from '../src/lib/sortFeedback.ts'
import { CONTENT_PACKS } from '../src/content/packs.ts'
import { DAILY_POOL, dailyForDate } from '../src/content/daily.ts'
import { highLookout } from '../src/content/highLookout.ts'
import { observatory } from '../src/content/observatory.ts'
import { parableHollow } from '../src/content/parableHollow.ts'
import { witnessBench } from '../src/content/witnessBench.ts'
import {
  abilityRange,
  DEFEND_ANCHOR,
  DEFEND_PATH,
  DEFEND_NIGHT_WAVES,
  DEFEND_WAVE_SIZE,
  defendPads,
  EASY_CUE_HOLD_MS,
  EASY_FACE_HIT_R,
  EASY_MISS_HOLD_MS,
  EASY_WALKER_FACE_PX,
  DEFEND_HEARTS,
  applyGateLeaks,
  easyFaceHitPx,
  faceTapStrike,
  EASY_WALKER_HIT_PX,
  PATH_WALKER_FACE_U,
  PATH_WALKER_HIT_R,
  EASY_WAVE_LIVE,
  easyHoldSpawn,
  easySpawnT,
  easyTapFit,
  easyTapMode,
  easyTapPersonCount,
  easyTapTarget,
  heavenPoint,
  padStage,
  pathClearance,
  pathPoint,
  NIGHT_CAST,
  normalizeMet,
  RAID_CAST,
  raidForWave,
  unlockedWatchAbilities,
  nightLength,
  waveCombat,
  waveIsClear,
  wavePackSize,
} from '../src/lib/defend.ts'
import { EASY_ROUND_SPEED_CAP, EASY_ROUNDS, roundMark } from '../src/nightWatch/rounds.ts'
import { scoreEasyRoad, scoreEasyTree } from '../src/nightWatch/roundScore.ts'
import {
  applyPathStep,
  canTake,
  freshRunPaths,
  lampStrike,
  spendTreeNight,
  stepLocked,
  TREE_LOCK,
  TREE_STEP_COST,
} from '../src/nightWatch/upgradeTree.ts'
import { boardFill, boardFillPoint } from '../src/nightWatch/map/phoneFill.ts'
import {
  commitLamp,
  dragGhostClient,
  clampGhostHintLeft,
  LAMP_DRAG_LIFT_PX,
  LAMP_DRAG_START_PX,
  LAMP_TOO_FAR,
  lampReachesRoad,
  lampRoadNote,
  lampSpotBlocked,
  previewLamp,
  roadCoverD,
} from '../src/lib/lampPlace.ts'
import { nightEnemies as nightEnemiesMod } from '../src/nightWatch/enemies/index.ts'
import { nightParts as nightPartsMod } from '../src/nightWatch/parts/index.ts'
import { nightPath as nightPathMod } from '../src/nightWatch/path/index.ts'
import { nightTowers as nightTowersMod, lampReach, lampReadyToFire, FREE_LAMP_RANGE_BONUS, LAMP_ROAD_OVERLAP, SHOT_JUICE_MS, sparkAwardForHit } from '../src/nightWatch/towers/index.ts'
import {
  applyBoost,
  boostCost,
  buyExtraLamp,
  EASY_LAMP_COST,
  EASY_TIER_COST,
  easyTierCost,
  combatTier,
  deployFit,
  freshRunTier,
  toolForEvidence,
  toolTier,
  WALKER_LABEL,
  watchTool,
  WATCH_TOOLS,
} from '../src/lib/watchTools.ts'
import {
  applyKitBuy,
  freshRunKits,
  KIT_IDS,
  kitSparkCost,
  STILL_MS,
  unturnedStep,
  useMend,
  useStill,
} from '../src/lib/nightKits.ts'
import {
  MEND_SHIELD_MS,
  SKILL_COOLDOWN_MS,
  SKILL_UNLOCK_WAVE,
  cooldownFill,
  mendPower,
  secondsLeft,
  skillFace,
  skillStatusLabel,
  skillUnlockOnWave,
  skillUnlocked,
} from '../src/lib/nightSkills.ts'
import {
  NIGHT_PACE_FAST,
  NIGHT_PACE_NORMAL,
  PACE_UNLOCK_WAVE,
  paceAria,
  paceFace,
  paceNote,
  paceRateLabel,
  paceScale,
  paceUnlocked,
  pacedCooldown,
  pacedDt,
} from '../src/lib/nightPace.ts'
import {
  EASY_PLANT_PADS,
  isTowerType,
  lampUpgradeTool,
  nightPlantTypes,
  plantType,
  pullPlant,
  selectUpgradeLamp,
  slotLeft,
  starterPlants,
  UPGRADE_GHOST_MS,
  UPGRADE_TAP_ECHO_MS,
  upgradeSpendAllowed,
} from '../src/lib/nightPlants.ts'
import {
  placeTowerCard,
  upgradeControlsHitLamp,
} from '../src/lib/towerCardPlace.ts'
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
  lampsBuildGift,
  visualSnapshot,
  visualStage,
  lotTapWhy,
  easyTagsFit,
  easyPlotTag,
  easyTagMetrics,
  plotTag,
  tierJob,
  nextUpgradeNeed,
  readyUpgradeId,
  EASY_FOLK_LIFT,
  EASY_FOLK_NUDGE,
} from '../src/lib/cityBuild.ts'
import { emptyProgress, progressAfterReset } from '../src/lib/save.ts'
import { EASY, EASY_LINE_ORDER, DIG_ARC, FOUNDATION_ARC, NAMES_ARC, STONE_ARC, INK_ARC, easyChromeLine, easyChromeNearDup, easyFacingLine, easyHomeFocus, easyHoldFields, easyHoldLine, easyHoldPractice, easyHoldView, easyLockInExit, easyLearnLine, easyLineHeld, easyLineLearned, easyLineTaught, easyLoopLine, easyMatchLine, easyMatchReady, easyTeachFields, easyTrailView, markEasyHeld, markEasyTaught, progressAfterMatchTaught, sameProofRecap, easyWhoWhere, easyWhoWhereLine, easyWhyLine, easyWhyWordCount, easyWrongTap, uniqueHoldChoices } from '../src/lib/easy.ts'
import { storyPlayFor } from '../src/lib/storyPlay.ts'
import { DEBUG_LAYER_LINES, debugJumpView } from '../src/lib/debugPlays.ts'
import { FATHER_RUN_LINE } from '../src/lib/fatherRun.ts'
import * as fatherRunHome from '../src/easyTrail/father/fatherRun.ts'
import * as fatherRunShim from '../src/lib/fatherRun.ts'
import { EASY_HOME } from '../src/lib/easyNav.ts'
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
assert.match(sequenceSrc, /is-story-strip/)
assert.match(sequenceSrc, /Tap what comes next/)
assert.match(sequenceSrc, /is-now/)
assert.match(sequenceSrc, /Check order/)
assert.match(sequenceSrc, /playGemPop/)
assert.match(sequenceSrc, /need\.id/)
assert.match(sequenceSrc, /misses >= 2/)
assert.match(
  readFileSync(new URL('../src/styles/storyStrip.css', import.meta.url), 'utf8'),
  /touch-action:\s*manipulation/,
)
assert.doesNotMatch(sequenceSrc, /Next step/)
assert.doesNotMatch(sequenceSrc, /is-deal/)

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
for (const rel of ['../src/components/Journal.tsx', '../src/easyTrail/lockIn/HoldPractice.tsx']) {
  assert.doesNotMatch(
    readFileSync(new URL(rel, import.meta.url), 'utf8'),
    /<h1>\{focusedEntry\?\.title \?\? \(easy \? EASY\.rememberSentence/,
  )
}
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
assert.match(challengeSrc, /onNavigate\(\{ name: 'hub', afterScene: true \}\)/)
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
const NIGHT_WATCH_FILES = [
  'index.ts',
  'types.ts',
  'ui/index.ts',
  'ui/UiShell.tsx',
  'map/index.ts',
  'map/surface.ts',
  'map/MapPlate.tsx',
  'path/index.ts',
  'parts/index.ts',
  'towers/index.ts',
  'enemies/index.ts',
]
const nightWatchSrc = NIGHT_WATCH_FILES.map((file) =>
  readFileSync(new URL(`../src/nightWatch/${file}`, import.meta.url), 'utf8'),
).join('\n')
/** DefendScreen composes src/nightWatch seams — scan both as one Night Watch screen bundle. */
const defendScreenOnlySrc = readFileSync(
  new URL('../src/components/DefendScreen.tsx', import.meta.url),
  'utf8',
)
const defendSrc = `${defendScreenOnlySrc}\n${nightWatchSrc}`
assert.match(defendSrc, /The road is coming/)
assert.match(defendSrc, /EASY.nightDo/)
assert.match(defendSrc, /FarHillsUnlock/)
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
assert.match(defendNightSrc, /defend-tower-lamp/)
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
assert.match(defendCopy, /Plant lamps\. Push the dark back\./)
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
assert.match(sequenceSrc, /strip-tray/)
assert.doesNotMatch(sequenceSrc, /progressive && !live/)

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
assert.equal(raidForWave(2, 5).kind.length > 0, true)
assert.equal(toolTier(watchTool('love'), empty), 1)
assert.equal(abilityRange('love', 'built', empty), 118)
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
assert.equal(WALKER_LABEL.skeptic, 'Accuser')
assert.equal(WALKER_LABEL.physical, 'Despair')
assert.match(
  cssSrc,
  /\.defend-abilities \{\s*display: flex;\s*flex-direction: column;/,
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
assert.doesNotMatch(cssSrc, /--nw-frame-h/)
assert.match(cssSrc, /defend-ability-pop/)
assert.match(cssSrc, /city-tap/)
assert.match(cssSrc, /lantern-breathe/)
assert.match(
  cssSrc,
  /\.is-puzzle \.play\.is-build \.result \{[\s\S]*?position: static/,
)
assert.match(cssSrc, /match-recover/)
assert.match(defendSkySrc, /preserveAspectRatio="xMidYMid meet"/)
assert.match(defendNightSrc, /nightEnemies\.faceSrc|walkerSrc/)
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
assert.equal(APP_VERSION, '1.4.407')
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
  assert.equal(nextPlotId(managed, true), 'hollow', 'Bill #438: next lot is hollow while porch can still raise')
  const billPorchReady = { ...managed, cityBuilt: { ...emptyCityBuilt(), porch: 1, hollow: 1 } }
  assert.equal(canUpgrade('hollow', billPorchReady), false)
  assert.equal(canUpgrade('porch', billPorchReady), true)
  assert.equal(
    readyUpgradeId(billPorchReady, 'hollow'),
    'porch',
    'Easy Build this must raise porch, not open hollow Walk',
  )
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
assert.match(
  latestChange('1.4.316').items.join('\n'),
  /Fixes #418|prayer watch|dark|taunt|Guardian|Messenger|walker/i,
)
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
const matchRegistrySrc = readFileSync(
  new URL('../src/easyTrail/match/registry.tsx', import.meta.url),
  'utf8',
)
assert.match(puzzleSrc, /kind === 'link'/)
assert.match(puzzleSrc, /LinkPlay/)
assert.match(puzzleSrc, /renderStoryPlay/, '1.4.333 Easy link Match mounts through the registry')
assert.match(matchRegistrySrc, /GemSearchPlay/)
assert.match(puzzleSrc, /isEasy\(progress\)/)
assert.match(matchRegistrySrc, /SourceDigPlay/)
assert.match(matchRegistrySrc, /source-dig/)
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
  assert.match(easyHome, /onClick=\{easyBuildThis\}/)
  assert.match(hubSrc, /function easyBuildThis\(\)[\s\S]*upgradeBuilding\(readyId\)/)
  {
    const easyBuildFn = hubSrc.match(/function easyBuildThis\(\) \{[\s\S]*?\n    \}/)?.[0] ?? ''
    assert.ok(easyBuildFn.length > 0, 'easyBuildThis handler present')
    assert.doesNotMatch(easyBuildFn, /setPlot\(nextId\)/)
  }
  assert.match(hubSrc, /upgradeReadyId/)
  assert.match(easyHome, /upgradeReadyId \?/)
  assert.match(easyHome, /easy-dock-walk/)
  assert.match(easyHome, /name: 'daily'/)
  assert.doesNotMatch(easyHome, /onClick=\{\(\) => setPlot\(nextId\)\}/)
  assert.match(easyHome, /easy-coach/)
  assert.match(easyHome, /name: 'learn'/)
  assert.match(easyHome, /name: 'link'/)
  assert.match(easyHome, /EASY\.matchCta/)
  assert.match(easyHome, /EASY\.saved/)
  assert.match(easyHome, /matchReady/)
  assert.match(hubSrc, /nextUpgradeNeed/)
  assert.match(hubSrc, /readyUpgradeId/)
  assert.match(cssSrc, /easy-build-it/)
  assert.match(cssSrc, /easy-dock-walk/)
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
  assert.match(easyHome, /readNow \? 'is-now'/)
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
    const coach = easyHome.slice(easyHome.indexOf('easy-home-steps'), easyHome.indexOf('Night Watch'))
    const iRead = coach.search(/>\s*Read\s*</)
    const iMatch = coach.indexOf('EASY.matchCta')
    const iLearn = coach.search(/>\s*Learn\s*</)
    const iLock = coach.indexOf('EASY.saved')
    assert.ok(iRead >= 0 && iMatch >= 0 && iLearn >= 0 && iLock >= 0, 'home steps have Read · Match · Learn · Lock In')
    assert.ok(iRead < iMatch && iMatch < iLearn && iLearn < iLock, 'home order is Read → Match/Learn → Lock In')
  }
  assert.match(easyHome, /Night Watch/)
  assert.doesNotMatch(easyHome, /EASY\.nightSoon/)
  assert.match(easyHome, /EASY\.nightDo/)
  assert.match(easyHome, /EASY\.nightLead/)
  assert.match(easyHome, /name: 'defend'/)
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
  // Fixes #448 — fresh Easy offers Match, not Lock In auto-quiz.
  assert.deepEqual(easyTrailView(fresh), { name: 'link' })
  assert.equal(easyHoldView(fresh).autoQuiz, undefined)
  assert.deepEqual(easyTrailView(progressAfterMatchTaught(fresh, 'ph-road')), {
    name: 'journal',
    focusId: 'ph-road',
    autoQuiz: true,
  })
  const quizWalk = {
    ...fresh,
    taught: ['ph-road', 'wb-women'],
    held: ['ph-road', 'wb-women'],
    completed: ['ph-road', 'wb-women'],
  }
  assert.deepEqual(easyTeachFields(quizWalk, 'ph-road', false).easyTaught, [])
  assert.deepEqual(easyTeachFields(quizWalk, 'wb-women', false).tierTaught, {})
  assert.deepEqual(easyHoldFields(quizWalk, 'ph-road'), [])
  assert.equal(easyHomeFocus(quizWalk), 'match')
  assert.deepEqual(easyTrailView(quizWalk), { name: 'link' })
  const matchedWomen = {
    ...quizWalk,
    ...easyTeachFields(quizWalk, 'wb-women', true),
  }
  assert.deepEqual(matchedWomen.easyTaught, ['wb-women'])
  assert.equal(matchedWomen.tierTaught['wb-women'], 'easy')
  assert.deepEqual(easyHoldFields(matchedWomen, 'wb-women'), ['wb-women'])
  const atDig = {
    ...fresh,
    easyHeld: ['ph-road', 'ph-father', 'ph-debt', ...FOUNDATION_ARC, 'wb-creed'],
  }
  assert.equal(easyLoopLine(atDig), 'wb-women')
  assert.equal(storyPlayFor('wb-women'), 'source-dig')
  assert.equal(easyHomeFocus(atDig), 'match')
  assert.deepEqual(easyTrailView(atDig), { name: 'link' })
  assert.notEqual(easyHoldView(atDig).autoQuiz, true)
  const dirtyWalk = {
    ...fresh,
    theme: 'dusk',
    easyMode: true,
    taught: ['ph-road', 'wb-women'],
    held: ['ph-road'],
    easyTaught: ['ph-road', 'wb-women'],
    easyHeld: ['ph-road'],
    tierTaught: { 'ph-road': 'easy', 'wb-women': 'medium' },
    lessonTier: { 'ph-road': 'medium' },
    lessonScore: { 'ph-road': 12 },
  }
  const wiped = progressAfterReset(dirtyWalk)
  assert.deepEqual(wiped.easyTaught, [])
  assert.deepEqual(wiped.easyHeld, [])
  assert.deepEqual(wiped.tierTaught, {})
  assert.deepEqual(wiped.taught, [])
  assert.deepEqual(wiped.held, [])
  assert.equal(wiped.easyMode, true)
  assert.equal(wiped.theme, 'dusk')
  assert.equal(easyHomeFocus(wiped), 'match')
  assert.deepEqual(easyTrailView(wiped), { name: 'link' })
  const registrySrc448 = readFileSync(
    new URL('../src/easyTrail/match/registry.tsx', import.meta.url),
    'utf8',
  )
  assert.match(registrySrc448, /'source-dig': \(story, wire\) => \(\s*<SourceDigPlay/, '1.4.333 source-dig entry moved to the registry')
  assert.match(
    readFileSync(new URL('../src/components/LinkScreen.tsx', import.meta.url), 'utf8'),
    /recordTaught\(lineId, true\)/,
  )
  assert.match(
    readFileSync(new URL('../src/store/ProgressProvider.tsx', import.meta.url), 'utf8'),
    /easyTeachFields\(current, evidenceId, fromMatch\)/,
  )
  assert.match(
    readFileSync(new URL('../src/components/CityMap.tsx', import.meta.url), 'utf8'),
    /easyTrailView\(progress\)/,
  )
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
assert.doesNotMatch(
  readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8'),
  /easy && next\.name === 'defend'/,
)
assert.match(
  readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8'),
  /view\.name === 'defend' \? <DefendScreen/,
)
assert.doesNotMatch(
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
assert.match(easyUiSrc, /Love — tap the dark face\. Prayer turns a lie toward heaven/)
assert.match(
  readFileSync(new URL('../src/lib/easy.ts', import.meta.url), 'utf8'),
  /Love — tap the matching face\. A true line turns a lie toward heaven/,
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
assert.match(defendSrc, /(waveSpeed|nightEnemies\.speed)\(easy\)/)
assert.match(defendSrc, /easyHoldSpawn/)
assert.match(defendSrc, /easySpawnT/)
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
    { id: 3, t: 0.55 },
    { id: 4, t: 0.2 },
  ]
  assert.equal(easyTapPersonCount(midWave1), 1)
  assert.equal(easyTapPersonCount(midWave3), 1)
  assert.equal(easyTapTarget(midWave3)?.id, 3)
  assert.equal(EASY_WAVE_LIVE, 3)
  assert.equal(easyHoldSpawn(2), false)
  assert.equal(easyHoldSpawn(3), true)
  assert.equal(easySpawnT(0), 0)
  assert.equal(easySpawnT(1), 0)
  assert.equal(easySpawnT(2), 0)
  assert.equal(easySpawnT(3), 0)
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
// Easy Clear 1.4.272: Easy Lock In hub opens stored lines (Fixes #384) — was collapsed (`easy ? false`).
assert.match(
  readFileSync(new URL('../src/components/Journal.tsx', import.meta.url), 'utf8'),
  /startOpen=\{easy \? true :/,
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
assert.match(latestChange('1.4.316').title, /Night Watch|PARTS|parts|sprite|registry/i)
assert.match(
  latestChange('1.4.316').items.join('\n'),
  /PartsModule|lot|lamp|face|defend|#418/i,
)
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
assert.match(
  plotArtSrc,
  /type CandyPlotId =[\s\S]*'porch'[\s\S]*'bench'[\s\S]*'lamps'[\s\S]*'observatory'[\s\S]*'lookout'/,
)
assert.match(plotArtSrc, /bench:\s*\{[\s\S]*scaffold: plotBenchScaffold/)
assert.match(plotArtSrc, /lamps:\s*\{[\s\S]*scaffold: plotLampsScaffold/)
assert.match(plotArtSrc, /observatory:\s*\{[\s\S]*scaffold: plotObservatoryScaffold/)
assert.match(plotArtSrc, /lookout:\s*\{[\s\S]*scaffold: plotLookoutScaffold/)
assert.match(plotArtSrc, /if \(img\) return <PlotImageArt/)
assert.match(plotArtSrc, /id === 'bench'\) return <BenchArt/)
assert.match(plotArtSrc, /id === 'observatory'\) return <ObservatoryArt/)
assert.match(plotArtSrc, /id === 'lookout'\) return <LookoutArt/)
for (const id of [
  'porch',
  'gate',
  'journal',
  'hollow',
  'bench',
  'lamps',
  'observatory',
  'lookout',
]) {
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
assert.match(defendNightSrc, /data-person-node=\{isTap \? 'walker'/)
assert.doesNotMatch(defendSrc, /walkerCue|easySolo|clearWalkerCue|hideOther/)
assert.match(defendSrc, /loveHowTo/)
assert.equal(
  EASY.loveCue,
  'Love — tap the dark face. Prayer turns a lie toward heaven.',
)
assert.doesNotMatch(defendSrc, /is-dim/)
assert.match(linkPlaySrc, /is-need/)
assert.match(cssSrc, /easy-walker-face/)
assert.equal(EASY_WALKER_FACE_PX, 44)
assert.equal(EASY_WALKER_HIT_PX, 72)
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
assert.match(defendNightSrc, /EASY\.nightTap/)
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
assert.match(defendSrc, /useState<NightPhase>\('plant'\)/)
assert.match(defendSrc, /EASY\.nightPlant/)
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
  readFileSync(new URL('../src/easyTrail/lockIn/HoldPractice.tsx', import.meta.url), 'utf8'),
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
  readFileSync(new URL('../src/easyTrail/trail/loop.ts', import.meta.url), 'utf8'),
  /easyTaught/,
  '1.4.336 Easy loop source lives in the trail home',
)
assert.match(
  readFileSync(new URL('../src/easyTrail/trail/loop.ts', import.meta.url), 'utf8'),
  /prefer the first line not yet held on Easy/i,
  '1.4.336 Easy loop source lives in the trail home',
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
  /easyHoldFields/,
)
assert.match(
  readFileSync(new URL('../src/store/ProgressProvider.tsx', import.meta.url), 'utf8'),
  /easyTeachFields/,
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
assert.equal(EASY.nightLead, 'Tap the dark face.')
assert.equal(EASY.rememberSentence, 'Tap the main idea you kept.')
assert.equal(EASY.tapWhy, 'Tap why this is true.')
assert.equal(EASY.reasonTeach, 'A reason is why this is true.')
assert.equal(EASY.saved, 'Lock In')
assert.equal(EASY.savedSub, 'saved lines')
assert.equal(EASY.nightMiss, 'Wrong — tap the glowing face')
assert.match(defendSrc, /EASY\.nightMiss/)
assert.match(defendSrc, /TAP \$\{remaining\} left/)
assert.match(defendSrc, /You missed\. Tap the face/)
assert.match(defendSrc, /(easyHoldSpawn|nightEnemies\.holdSpawn)\(unturnedLive\)/)
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
    new URL('../src/easyTrail/father/FatherRunPlay.tsx', import.meta.url),
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
  /@media \(max-height: 720px\) \{[\s\S]*?\.easy-story-card \.teach-reason \{[\s\S]*?-webkit-line-clamp:\s*unset/,
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
  assert.equal(watch.claim, 'Love — tap the matching face. A true line turns a lie toward heaven.')
  const claim = easyFacingLine(watch.id, watch.claim)
  const decoy = easyFacingLine(watch.id, watch.claimChoices[1])
  assert.equal(claim, EASY.loveCue)
  assert.equal(plainFor('td-watch')?.gloss, EASY.loveCue)
  assert.notEqual(decoy, claim)
  assert.equal(new Set(watch.claimChoices.map((line) => easyFacingLine(watch.id, line))).size, 3)
  assert.equal(evidenceFor('ph-road')?.claim, 'Neighbor is the one who shows mercy.')
  assert.match(EASY.loveCue, /dark face/)
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

// Night Watch 1.4.347: lamp and power shots respect range (#490).
{
  const defendLib347 = readFileSync(new URL('../src/lib/defend.ts', import.meta.url), 'utf8')
  const porchStage = padStage('porch', empty)
  const porchRange = abilityRange('love', porchStage, empty, { love: 1 })
  const farWalker = pathPoint(0)
  const porch = DEFEND_ANCHOR.porch
  const farDist = Math.hypot(porch.x - farWalker.x, porch.y - farWalker.y)
  assert.ok(farDist > porchRange, '1.4.347 porch Love I should not reach the gate spawn')
  assert.equal(
    abilityRange('love', 'built', empty, { love: 1 }),
    abilityRange('logic', 'built', empty, { logic: 1 }),
    '1.4.347 Love range follows the lamp like other tools',
  )
  assert.doesNotMatch(
    defendLib347,
    /if \(ability === 'love'\) return 640/,
    '1.4.347 drops the whole-map Love reach',
  )
  assert.ok(CHANGELOG.some((note) => note.version === '1.4.347'), '1.4.347 changelog row')
  assert.match(latestChange('1.4.347').title, /Night Watch|range/i)
  assert.doesNotMatch(
    latestChange('1.4.347').items.join('\n'),
    /Fixes #490|Closes #490|Resolves #490/i,
    '1.4.347 changelog avoids GitHub close keywords',
  )
  assert.match(defendNightSrc, /nightTowers\.inRange/)
  assert.match(defendSrc, /dist\(at, raiderAt/)
  assert.match(defendSrc, /d <= range/)
}

// Night Watch 1.4.348: porch lamp reach covers the road in front of it (#490).
{
  const porchStage = padStage('porch', empty)
  const porchReach =
    abilityRange('love', porchStage, empty, { love: 1 }) + pathClearance(DEFEND_ANCHOR.porch)
  const gateWalker = pathPoint(0)
  const porch = DEFEND_ANCHOR.porch
  const gateDist = Math.hypot(porch.x - gateWalker.x, porch.y - gateWalker.y)
  assert.ok(gateDist > porchReach, '1.4.348 porch Love I still misses the gate walker')
  const frontRoad = pathPoint(0.72)
  const frontDist = Math.hypot(porch.x - frontRoad.x, porch.y - frontRoad.y)
  assert.ok(
    frontDist <= porchReach,
    '1.4.348 porch Love I reaches a walker on the upper road in front of the lamp',
  )
  assert.ok(CHANGELOG.some((note) => note.version === '1.4.348'), '1.4.348 changelog row')
  assert.match(latestChange('1.4.348').title, /Night Watch|porch|road|range/i)
  assert.doesNotMatch(
    latestChange('1.4.348').items.join('\n'),
    /Fixes #490|Closes #490|Resolves #490/i,
    '1.4.348 changelog avoids GitHub close keywords',
  )
  assert.match(readFileSync(new URL('../src/nightWatch/towers/index.ts', import.meta.url), 'utf8'), /pathClearance/)
}

// Easy Match 1.4.350: road maze closes on HELPED! (#514 — no mid-Match hurt-man respawn).
{
  const mazePlaySrc = readFileSync(
    new URL('../src/components/challenges/RoadMazePlay.tsx', import.meta.url),
    'utf8',
  )
  const mazeCss350 = readFileSync(new URL('../src/styles/maze.css', import.meta.url), 'utf8')
  const registry350 = readFileSync(
    new URL('../src/easyTrail/match/registry.tsx', import.meta.url),
    'utf8',
  )
  assert.match(
    mazePlaySrc,
    /1\.4\.350: HELPED! closes the maze grid; teach clear runs after the stamp \(#514\)/,
  )
  assert.match(mazePlaySrc, /useEffect\(\(\) => \{\s*setMazePreset\(attempt\)/)
  assert.doesNotMatch(mazePlaySrc, /\n  setMazePreset\(attempt\)\n/)
  assert.match(mazePlaySrc, /stampTimer/)
  assert.match(
    mazePlaySrc,
    /setWinStamp\(true\)[\s\S]*?if \(!cleared\.current\) \{[\s\S]*?onClear\?\.\(\)/,
  )
  assert.match(mazePlaySrc, /maze-win-end/)
  assert.match(mazeCss350, /1\.4\.350: Easy road Match ends on HELPED!/)
  assert.match(registry350, /'road-maze': \(story, wire\) => \([\s\S]*?<RoadMazePlay[\s\S]*?key=\{story\.lineId\}/)
  assert.ok(CHANGELOG.some((note) => note.version === '1.4.350'), '1.4.350 changelog row')
  assert.match(latestChange('1.4.350').title, /HELPED|Match ends/i)
  assert.doesNotMatch(
    latestChange('1.4.350').items.join('\n'),
    /Fixes #514|Closes #514|Resolves #514|Fixes #470|Closes #470|Resolves #470/i,
    '1.4.350 changelog avoids GitHub close keywords',
  )
}

// Easy Lock In 1.4.351: sort encode rehearses pack hold, not sort tile sub-lines (#501).
{
  const recall351 = readFileSync(
    new URL('../src/components/RecallGate.tsx', import.meta.url),
    'utf8',
  )
  assert.match(recall351, /easySortClaimPick/)
  assert.match(recall351, /easySortClaimPick[\s\S]*brief\.claimChoices/)
  assert.match(recall351, /setChosen\(\{ claim: brief\.claim, reason: brief\.reason \}\)/)
  assert.ok(CHANGELOG.some((note) => note.version === '1.4.351'), '1.4.351 changelog row')
  assert.match(latestChange('1.4.351').title, /Lock In|story hold/i)
  assert.doesNotMatch(
    latestChange('1.4.351').items.join('\n'),
    /Fixes #501|Closes #501|Resolves #501|Fixes #470|Closes #470|Resolves #470/i,
    '1.4.351 changelog avoids GitHub close keywords',
  )
}

// Easy Father Dash 1.4.352: HOLD TO RUN long-press must not open the browser menu or select text (#515).
{
  const father352 = readFileSync(
    new URL('../src/easyTrail/father/FatherRunPlay.tsx', import.meta.url),
    'utf8',
  )
  const css352 = readFileSync(new URL('../src/index.css', import.meta.url), 'utf8')
  assert.match(father352, /function blockHoldMenu/)
  assert.match(father352, /onContextMenu=\{blockHoldMenu\}/)
  assert.match(father352, /selectstart/)
  assert.match(css352, /\.run-pad \{[\s\S]*?-webkit-touch-callout:\s*none/)
  assert.match(css352, /\.run-pad \{[\s\S]*?-webkit-user-select:\s*none/)
  assert.match(css352, /\.play\.is-father-run \{[\s\S]*?-webkit-user-select:\s*none/)
  assert.match(css352, /\.play\.is-father-run \.btn/)
  assert.ok(CHANGELOG.some((note) => note.version === '1.4.352'), '1.4.352 changelog row')
  assert.match(latestChange('1.4.352').title, /Hold to run|phone menu/i)
  assert.doesNotMatch(
    latestChange('1.4.352').items.join('\n'),
    /Fixes #515|Closes #515|Resolves #515|Fixes #470|Closes #470|Resolves #470/i,
    '1.4.352 changelog avoids GitHub close keywords',
  )
}

// Easy Lock In 1.4.355: Lock In exit recites the proof just kept. The Hurt Man maze stays on Match.
{
  const fresh355 = { ...emptyProgress(), easyMode: true }
  assert.deepEqual(easyLockInExit(fresh355), { name: 'journal' }, '1.4.355 fresh Lock In is a recap, not the maze')
  assert.notEqual(easyLockInExit(fresh355).name, 'link')
  const taughtMercy355 = progressAfterMatchTaught(fresh355, 'ph-road')
  assert.deepEqual(easyLockInExit(taughtMercy355), {
    name: 'journal',
    focusId: 'ph-road',
    autoQuiz: true,
  })
  const seeded355 = {
    ...fresh355,
    held: ['daily-seed'],
    learnings: [{ id: 'daily-seed' }],
  }
  assert.deepEqual(easyLockInExit(seeded355), {
    name: 'journal',
    focusId: 'learn-daily-seed',
  })
  const afterMercy355 = {
    ...fresh355,
    easyTaught: ['ph-road'],
    easyHeld: ['ph-road'],
    held: ['ph-road'],
    learnings: [{ id: 'ph-road' }],
  }
  assert.equal(easyLoopLine(afterMercy355), 'ph-father')
  assert.deepEqual(easyLockInExit(afterMercy355), { name: 'link' }, '1.4.355 a later beat still opens from Lock In')
  const hub355 = readFileSync(new URL('../src/components/Hub.tsx', import.meta.url), 'utf8')
  const shell355 = readFileSync(new URL('../src/components/AppShell.tsx', import.meta.url), 'utf8')
  assert.match(hub355, /easyLockInExit\(progress\)/)
  assert.doesNotMatch(hub355, /easyHoldView\(progress\) : \{ name: 'link' \}/)
  assert.match(shell355, /easyLockInExit\(progress\)/)
  assert.doesNotMatch(shell355, /easyTrailView/)
  assert.match(
    readFileSync(new URL('../src/components/CityMap.tsx', import.meta.url), 'utf8'),
    /easyTrailView\(progress\)/,
    '1.4.355 map enter still opens Match',
  )
  assert.ok(CHANGELOG.some((note) => note.version === '1.4.355'), '1.4.355 changelog row')
  assert.match(latestChange('1.4.355').title, /Lock In/i)
  assert.doesNotMatch(
    latestChange('1.4.355').items.join('\n'),
    /Fixes #504|Closes #504|Resolves #504|Fixes #520|Closes #520|Fixes #508|Closes #508/i,
    '1.4.355 changelog avoids GitHub close keywords',
  )
}

// Easy Keep/Toss 1.4.356: first miss with empty Toss + a pending line is unfinished (#527).
{
  const kept356 = [{ bin: 'keep' }, { bin: 'keep' }, { bin: 'keep' }]
  const firstMiss = sortMissCopy({
    status: 'wrong',
    misses: 1,
    pending: 1,
    keep: kept356,
    discard: [],
    easy: true,
    teachOnWrong: 'Jesus names loss and hearing in the same breath.',
  })
  assert.equal(firstMiss.kicker, 'Still sorting')
  assert.equal(firstMiss.title, 'This line is not sorted yet.')
  assert.doesNotMatch(`${firstMiss.kicker} ${firstMiss.title}`, /wrong bin|mix/i)
  assert.match(firstMiss.body ?? '', /Keep what belongs/)
  const firstMissMixed = sortMissCopy({
    status: 'wrong',
    misses: 1,
    pending: 1,
    keep: kept356,
    discard: [{ bin: 'keep' }],
    easy: true,
    teachOnWrong: 'teach',
  })
  assert.equal(firstMissMixed.kicker, 'A line is in the wrong bin')
  assert.match(firstMissMixed.title, /Keep vs toss/)
  const firstMissClear = sortMissCopy({
    status: 'wrong',
    misses: 1,
    pending: 0,
    keep: kept356,
    discard: [],
    easy: true,
    teachOnWrong: 'teach',
  })
  assert.equal(firstMissClear.kicker, 'Still sorting')
  assert.equal(firstMissClear.title, 'Keep and toss are not locked yet.')
  assert.ok(CHANGELOG.some((note) => note.version === '1.4.356'), '1.4.356 changelog row')
  assert.match(latestChange('1.4.356').title, /Keep\/Toss|first miss/i)
  assert.doesNotMatch(
    latestChange('1.4.356').items.join('\n'),
    /Fixes #527|Closes #527|Resolves #527|Fixes #503|Closes #503|Fixes #520|Closes #520|Fixes #508|Closes #508/i,
    '1.4.356 changelog avoids GitHub close keywords',
  )
}

// Easy Home 1.4.357: numbered Read → Match → Lock In, one gold step (#505).
{
  const hub357 = readFileSync(new URL('../src/components/Hub.tsx', import.meta.url), 'utf8')
  const css357 = readFileSync(new URL('../src/index.css', import.meta.url), 'utf8')
  assert.match(hub357, /easy-home-steps/)
  assert.match(hub357, /const readNow = !doneToday && focus !== 'hold'/)
  assert.match(hub357, /disabled=\{playLater \|\| \(!matchReady && !lockNow\)\}/)
  assert.match(hub357, /disabled=\{!lockNow\}/)
  assert.match(hub357, /easyLockInExit\(progress\)/)
  assert.match(hub357, /name: 'daily'/)
  assert.match(hub357, /name: 'learn'/)
  assert.match(hub357, /name: 'link'/)
  assert.match(css357, /1\.4\.357: Easy Home next step/)
  assert.match(css357, /\.easy-home-steps li\.is-now \.easy-coach-step/)
  assert.match(css357, /\.easy-home-steps li\.is-later \.easy-coach-step:disabled/)
  assert.ok(CHANGELOG.some((note) => note.version === '1.4.357'), '1.4.357 changelog row')
  assert.match(latestChange('1.4.357').title, /Home|next/i)
  assert.match(latestChange('1.4.357').items.join('\n'), /Read/)
  assert.match(latestChange('1.4.357').items.join('\n'), /Lock In/)
  assert.doesNotMatch(
    latestChange('1.4.357').items.join('\n'),
    /Fixes #505|Closes #505|Resolves #505|Fixes #527|Closes #527|Fixes #520|Closes #520|Fixes #508|Closes #508/i,
    '1.4.357 changelog avoids GitHub close keywords',
  )
}

// Easy Match 1.4.358: inn arrival stamps HELPED! and does not restart the round (#531).
{
  const maze358 = readFileSync(
    new URL('../src/components/challenges/RoadMazePlay.tsx', import.meta.url),
    'utf8',
  )
  assert.match(maze358, /1\.4\.358: inn arrival keeps HELPED!/)
  assert.match(maze358, /winStamp && dockLive/)
  const gateAt = maze358.indexOf('winStamp && dockLive')
  const dockAt = maze358.indexOf('data-maze-dock')
  const againAt = maze358.indexOf('data-maze-again')
  assert.ok(gateAt !== -1 && gateAt < dockAt && dockAt < againAt, 'One more road waits for HELPED! and a finished touch')
  assert.match(
    maze358,
    /setWinStamp\(true\)[\s\S]*?if \(!cleared\.current\) \{[\s\S]*?onClear\?\.\(\)/,
    'teach clear still runs after the HELPED! stamp',
  )
  assert.doesNotMatch(
    maze358.slice(maze358.indexOf('function finishIfWon')),
    /function finishIfWon[\s\S]*?function landOn[\s\S]*?\breplay\(/,
    'inn arrival does not restart the round',
  )
  assert.match(maze358, /Find the hurt man/)
  assert.ok(CHANGELOG.some((note) => note.version === '1.4.358'), '1.4.358 changelog row')
  assert.match(latestChange('1.4.358').title, /inn|Match|Helped/i)
  assert.match(latestChange('1.4.358').items.join('\n'), /Helped!/)
  assert.match(latestChange('1.4.358').items.join('\n'), /Find the hurt man/)
  assert.doesNotMatch(
    latestChange('1.4.358').items.join('\n'),
    /Fixes #531|Closes #531|Resolves #531|Fixes #505|Closes #505|Resolves #505/i,
    '1.4.358 changelog avoids GitHub close keywords',
  )
}

// Easy Match 1.4.359: fast maze taps keep the walker on the path (#509). Leave the issue open.
{
  const maze359 = readFileSync(
    new URL('../src/components/challenges/RoadMazePlay.tsx', import.meta.url),
    'utf8',
  )
  const mazeCss359 = readFileSync(new URL('../src/styles/maze.css', import.meta.url), 'utf8')
  assert.match(maze359, /1\.4\.359: fast taps stay on the road/)
  assert.match(maze359, /passive: false/)
  assert.match(maze359, /setPointerCapture/)
  assert.match(maze359, /winStamp && dockLive/)
  assert.match(mazeCss359, /1\.4\.359: fast road taps/)
  assert.match(mazeCss359, /\.play\.is-road-maze \.maze-board \{[\s\S]*?touch-action: none/)
  assert.match(mazeCss359, /transform: none/)
  assert.ok(CHANGELOG.some((note) => note.version === '1.4.359'), '1.4.359 changelog row')
  assert.match(latestChange('1.4.359').title, /maze|thumb/i)
  assert.match(latestChange('1.4.359').items.join('\n'), /walker/)
  assert.doesNotMatch(
    latestChange('1.4.359').items.join('\n'),
    /Fixes #509|Closes #509|Resolves #509|Fixes #531|Closes #531|Resolves #531/i,
    '1.4.359 changelog avoids GitHub close keywords',
  )
}

// Easy Lock In 1.4.361: phone LOCKED! sits above the card stack (#511). Leave the issue open.
{
  const hold361 = readFileSync(new URL('../src/styles/sortHold.css', import.meta.url), 'utf8')
  const blast361 = readFileSync(
    new URL('../src/components/challenges/WhyBlastPlay.tsx', import.meta.url),
    'utf8',
  )
  assert.match(hold361, /1\.4\.361: phone LOCKED! sits above the card stack/)
  assert.match(hold361, /@media \(max-width: 720px\)/)
  assert.match(hold361, /\.why-blast\.is-win > \.win-burst \{/)
  assert.match(hold361, /\.why-blast\.is-win > \.win-burst \.win-stamp-wrap \{/)
  assert.match(hold361, /\.why-blast\.is-win \.why-chip\.is-clear:not\(\.is-lock\)/)
  assert.match(hold361, /\.why-blast\.is-win \.why-claim \{/)
  assert.match(blast361, /1\.4\.361: phone LOCKED! sits above the card stack/)
  assert.ok(CHANGELOG.some((note) => note.version === '1.4.361'), '1.4.361 changelog row')
  assert.match(latestChange('1.4.361').title, /Lock In|locked cards/i)
  assert.match(latestChange('1.4.361').items.join('\n'), /LOCKED!/)
  assert.match(latestChange('1.4.361').items.join('\n'), /main idea/i)
  assert.doesNotMatch(
    latestChange('1.4.361').items.join('\n'),
    /Fixes #511|Closes #511|Resolves #511|Fixes #510|Closes #510|Resolves #510|Fixes #509|Closes #509|Resolves #509|Fixes #531|Closes #531|Resolves #531/i,
    '1.4.361 changelog avoids GitHub close keywords',
  )
}

// Easy Lock In 1.4.362: correct why → LOCKED! → same-proof recap. Quiet pause waits until after that recap. Leave #511 open.
{
  assert.deepEqual(sameProofRecap('ph-road'), {
    name: 'journal',
    focusId: 'learn-ph-road',
    sceneRecap: true,
  })
  assert.notEqual(sameProofRecap('ph-road').name, 'hub')
  assert.notEqual(sameProofRecap('ph-road').name, 'link')
  const hold362 = readFileSync(
    new URL('../src/easyTrail/lockIn/HoldPractice.tsx', import.meta.url),
    'utf8',
  )
  const app362 = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8')
  const journal362 = readFileSync(new URL('../src/components/Journal.tsx', import.meta.url), 'utf8')
  const ads362 = readFileSync(new URL('../src/config/ads.ts', import.meta.url), 'utf8')
  assert.match(hold362, /onNavigate\(sameProofRecap\(quizBrief\.id\)\)/)
  assert.doesNotMatch(hold362, /onNavigate\(EASY_HOME\)/)
  assert.match(ads362, /export function lockInQuizBlocksPause/)
  assert.match(app362, /quietPauseAllowed\(/)
  assert.match(journal362, /focusId === `learn-\$\{learning\.id\}`/)
  assert.match(journal362, /<StoredLine/)
  assert.doesNotMatch(
    readFileSync(new URL('../src/styles/sortHold.css', import.meta.url), 'utf8'),
    /1\.4\.362/,
    '1.4.362 does not touch the LOCKED! phone stack',
  )
  assert.ok(CHANGELOG.some((note) => note.version === '1.4.362'), '1.4.362 changelog row')
  assert.match(latestChange('1.4.362').title, /Lock In/i)
  assert.match(latestChange('1.4.362').items.join('\n'), /LOCKED!/)
  assert.match(latestChange('1.4.362').items.join('\n'), /Say this tomorrow/)
  assert.match(latestChange('1.4.362').items.join('\n'), /quiet pause/i)
  assert.doesNotMatch(
    latestChange('1.4.362').items.join('\n'),
    /Fixes #511|Closes #511|Resolves #511|Fixes #504|Closes #504|Resolves #504|Fixes #441|Closes #441|Resolves #441|Fixes #510|Closes #510|Resolves #510|Fixes #509|Closes #509|Resolves #509|Fixes #531|Closes #531|Resolves #531/i,
    '1.4.362 changelog avoids GitHub close keywords',
  )
}

// Quiet pause 1.4.363: allow-list is clean Home after a finished scene. Leave play screens alone.
{
  const app363 = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8')
  const ads363 = readFileSync(new URL('../src/config/ads.ts', import.meta.url), 'utf8')
  assert.match(ads363, /export function quietPauseAllowed/)
  assert.match(ads363, /QUIET_PAUSE_BLOCKED_VIEWS/)
  assert.match(ads363, /QUIET_PAUSE_SCENE_RETURNS/)
  assert.match(app363, /quietPauseAllowed\(view, next\)/)
  assert.doesNotMatch(app363, /isLessonEnterView/)
  assert.doesNotMatch(app363, /lockInQuizBlocksPause\(/)
  assert.match(
    readFileSync(new URL('../src/easyTrail/trail/loop.ts', import.meta.url), 'utf8'),
    /sceneRecap: true/,
  )
  assert.doesNotMatch(
    readFileSync(new URL('../src/styles/sortHold.css', import.meta.url), 'utf8'),
    /1\.4\.363/,
    '1.4.363 does not touch the LOCKED! phone stack',
  )
  assert.ok(CHANGELOG.some((note) => note.version === '1.4.363'), '1.4.363 changelog row')
  assert.match(latestChange('1.4.363').items.join('\n'), /quiet pause/i)
  assert.match(latestChange('1.4.363').items.join('\n'), /Home/)
  assert.doesNotMatch(
    latestChange('1.4.363').items.join('\n'),
    /Fixes #|Closes #|Resolves #/i,
    '1.4.363 changelog avoids GitHub close keywords',
  )
}

// Phone Easy play-through 1.4.364: thin Playwright spec. Core checks stay browser-free.
{
  const pkg364 = JSON.parse(
    readFileSync(new URL('../package.json', import.meta.url), 'utf8'),
  )
  assert.equal(typeof pkg364.scripts['test:e2e'], 'string')
  assert.match(pkg364.devDependencies['@playwright/test'], /.+/)
  assert.doesNotMatch(
    readFileSync(new URL('./run-checks.mjs', import.meta.url), 'utf8'),
    /easy-phone/,
    '1.4.364 keeps the phone play-through out of npm test',
  )
  const spec364 = readFileSync(new URL('../e2e/easy-phone.spec.ts', import.meta.url), 'utf8')
  assert.match(spec364, /375/)
  assert.match(spec364, /667/)
  assert.match(spec364, /A quiet pause/)
  assert.match(spec364, /One more road/)
  assert.match(spec364, /Lock In next/)
  assert.match(spec364, /Say this tomorrow/)
  assert.match(spec364, /Find the hurt man/)
  assert.match(spec364, /Helped!/)
  assert.ok(existsSync(new URL('../playwright.config.ts', import.meta.url)))
  assert.ok(existsSync(new URL('./test-e2e.mjs', import.meta.url)))
  assert.doesNotMatch(
    readFileSync(new URL('../src/styles/sortHold.css', import.meta.url), 'utf8'),
    /1\.4\.364/,
    '1.4.364 does not touch the LOCKED! phone stack',
  )
  assert.ok(CHANGELOG.some((note) => note.version === '1.4.364'), '1.4.364 changelog row')
  assert.match(latestChange('1.4.364').items.join('\n'), /Phone checks keep the Easy walk honest/)
  assert.doesNotMatch(
    latestChange('1.4.364').items.join('\n'),
    /Fixes #|Closes #|Resolves #/i,
    '1.4.364 changelog avoids GitHub close keywords',
  )
}

// Easy Build It 1.4.365: Star lamps change picture and the prompt moves (#512). Leave the issue open.
{
  const eight = {
    ...emptyProgress(),
    easyMode: true,
    stars: { a: 3, b: 3, c: 2 },
    cityBuilt: { ...emptyCityBuilt(), lamps: 2 },
  }
  assert.equal(earnedTier('lamps', eight), 3, '1.4.365 eight stars earn the lamp tier that used to redraw built')
  assert.equal(visualStage('lamps', 2), 'built')
  assert.equal(visualSnapshot(eight).lamps, 'built')
  assert.equal(lampsBuildGift(eight, false, 'lamps'), 'Star lamps are up. Build this lights them.')
  const lit = applyUpgrade(eight, 'lamps')
  assert.equal(appliedTier('lamps', lit), 3)
  assert.equal(visualSnapshot(lit).lamps, 'lit', '1.4.365 Star lamps light on that beat')
  assert.equal(canUpgrade('lamps', lit), false)
  const afterEight = lampsBuildGift(lit, false, null)
  assert.equal(afterEight, 'Catch twelve stars, or keep a night.')
  assert.doesNotMatch(afterEight ?? '', /raise the building/)

  const twelve = {
    ...emptyProgress(),
    easyMode: true,
    stars: { a: 3, b: 3, c: 3, d: 3 },
    cityBuilt: { ...emptyCityBuilt(), lamps: 2 },
  }
  assert.equal(earnedTier('lamps', twelve), 4)
  const jumped = applyUpgrade(twelve, 'lamps')
  assert.equal(appliedTier('lamps', jumped), 4, '1.4.365 one beat reaches the lit picture')
  assert.equal(visualSnapshot(jumped).lamps, 'lit')
  assert.match(lampsBuildGift(jumped, false, null) ?? '', /lamps stay on/)

  const first = {
    ...emptyProgress(),
    easyMode: true,
    stars: { a: 1 },
    cityBuilt: {
      ...emptyCityBuilt(),
      porch: 4,
      hollow: 4,
      bench: 4,
      observatory: 4,
      gate: 4,
      lookout: 4,
      journal: 4,
      lamps: 0,
    },
  }
  assert.equal(readyUpgradeId(first, 'porch'), 'lamps')
  assert.equal(visualSnapshot(first).lamps, 'empty')
  assert.equal(lampsBuildGift(first, false, 'lamps'), null)
  const scaffold = applyUpgrade(first, 'lamps')
  assert.equal(visualSnapshot(scaffold).lamps, 'scaffold')
  assert.equal(lampsBuildGift(scaffold, false, null), 'Earn four stars.')

  const porch = {
    ...emptyProgress(),
    dailyDates: ['2020-01-01'],
    cityBuilt: emptyCityBuilt(),
  }
  assert.equal(appliedTier('porch', applyUpgrade(porch, 'porch')), 2, '1.4.365 porch still raises one look')
  assert.equal(lampsBuildGift({ ...emptyProgress(), easyMode: true }, false, null), null)

  assert.ok(CHANGELOG.some((note) => note.version === '1.4.365'), '1.4.365 changelog row')
  assert.match(latestChange('1.4.365').title, /Star lamps/)
  assert.match(latestChange('1.4.365').items.join('\n'), /Star lamps show up after you build/)
  assert.doesNotMatch(
    latestChange('1.4.365').items.join('\n'),
    /Fixes #|Closes #|Resolves #/i,
    '1.4.365 changelog avoids GitHub close keywords',
  )
}

// Easy story 1.4.368: short-story body wraps on a phone (#517). Leave the issue open.
{
  const welcome368 = readFileSync(new URL('../src/styles/welcome.css', import.meta.url), 'utf8')
  assert.match(welcome368, /1\.4\.368: read the whole short story/)
  assert.match(
    welcome368,
    /1\.4\.368: read the whole short story[\s\S]*?\.easy-story-card \.teach-reason \{[\s\S]*?-webkit-line-clamp:\s*unset[\s\S]*?overflow:\s*visible[\s\S]*?white-space:\s*normal/,
  )
  assert.doesNotMatch(
    welcome368,
    /\.easy-story-card \.teach-reason \{[^}]*-webkit-line-clamp:\s*3/,
  )
  assert.doesNotMatch(welcome368, /1\.4\.368[\s\S]{0,240}Fixes #|1\.4\.368[\s\S]{0,240}Closes #|1\.4\.368[\s\S]{0,240}Resolves #/i)
  assert.ok(CHANGELOG.some((note) => note.version === '1.4.368'), '1.4.368 changelog row')
  assert.match(latestChange('1.4.368').title, /Easy story lines stay whole/)
  assert.match(latestChange('1.4.368').items.join('\n'), /short story wraps/)
  assert.doesNotMatch(
    latestChange('1.4.368').items.join('\n'),
    /Fixes #|Closes #|Resolves #/i,
    '1.4.368 changelog avoids GitHub close keywords',
  )
}

// Easy Keep/Toss 1.4.369: sorted cards wrap on spaces (#518). Leave the issue open.
{
  const hold369 = readFileSync(new URL('../src/styles/sortHold.css', import.meta.url), 'utf8')
  assert.match(hold369, /1\.4\.369: Easy Keep\/Toss sorted cards wrap on spaces/)
  assert.match(
    hold369,
    /1\.4\.369: Easy Keep\/Toss sorted cards wrap on spaces[\s\S]*?html\[data-easy='on'\] \.play\.is-easy-sort \.chip\.in-bin \{[\s\S]*?overflow-wrap:\s*normal[\s\S]*?word-break:\s*normal[\s\S]*?hyphens:\s*none/,
  )
  assert.doesNotMatch(
    hold369,
    /html\[data-easy='on'\] \.play\.is-easy-sort \.chip\.in-bin \{[^}]*overflow-wrap:\s*anywhere/,
  )
  assert.doesNotMatch(
    hold369,
    /html\[data-easy='on'\] \.play\.is-easy-sort \.chip\.in-bin \{[^}]*word-break:\s*break-all/,
  )
  assert.doesNotMatch(hold369, /1\.4\.369[\s\S]{0,400}Fixes #|1\.4\.369[\s\S]{0,400}Closes #|1\.4\.369[\s\S]{0,400}Resolves #/i)
  assert.ok(CHANGELOG.some((note) => note.version === '1.4.369'), '1.4.369 changelog row')
  assert.match(latestChange('1.4.369').title, /Easy Keep\/Toss keeps long words whole/)
  assert.match(latestChange('1.4.369').items.join('\n'), /wrap on spaces/)
  assert.match(latestChange('1.4.369').items.join('\n'), /guaranteed/)
  assert.doesNotMatch(
    latestChange('1.4.369').items.join('\n'),
    /Fixes #|Closes #|Resolves #/i,
    '1.4.369 changelog avoids GitHub close keywords',
  )
}

// Night Watch 1.4.382: porch→road candy art. Thick icing and gumdrops, not thin dashes.
{
  const defendCss382 = readFileSync(new URL('../src/styles/defend.css', import.meta.url), 'utf8')
  const plate382 = readFileSync(new URL('../src/nightWatch/map/MapPlate.tsx', import.meta.url), 'utf8')
  const candyUrl = new URL('../src/assets/defend/nw-porch-candy.svg', import.meta.url)
  const candy382 = readFileSync(candyUrl, 'utf8')
  assert.ok(existsSync(candyUrl), '1.4.382 ships the porch candy asset')
  assert.match(plate382, /nw-porch-candy\.svg/, '1.4.382 paints candy on the night plate')
  assert.match(plate382, /defend-porch-candy/)
  assert.match(candy382, /Cottage porches|cottage porches/i)
  assert.equal((candy382.match(/<path /g) ?? []).length, 12, '1.4.382 four porch paths, three candy layers')
  assert.match(candy382, /gum-pink/)
  assert.match(candy382, /gum-lilac/)
  assert.match(candy382, /gum-mint/)
  assert.doesNotMatch(candy382, /stroke-dasharray/)
  assert.match(defendCss382, /1\.4\.382: porch→road connectors are the candy image/)
  assert.match(defendCss382, /\.defend-porch-candy/)
  assert.match(defendCss382, /\.defend-heaven-path \{[^}]*stroke:\s*none/s)
  assert.doesNotMatch(
    defendCss382.slice(defendCss382.indexOf('.defend-heaven-path'), defendCss382.indexOf('.defend-heaven-glow')),
    /stroke-dasharray:\s*7\s+8/,
    '1.4.382 heaven hook is not the thin dash',
  )
  assert.match(defendSkySrc, /defend-heaven-path/, '1.4.382 keeps the heaven path hook')
  assert.match(defendCss382, /1\.4\.381: unlockable 3× speed/, '1.4.382 keeps 3× speed')
  assert.match(defendCss382, /1\.4\.380: skills pack/, '1.4.382 keeps the skill pack')
  assert.match(defendCss382, /1\.4\.379: Easy phone SE chrome/, '1.4.382 keeps the phone chrome rules')
  assert.match(defendCss382, /1\.4\.378: Easy plant rings/, '1.4.382 keeps the gold plant rings')
  assert.equal(WATCH_TOOLS.length, 4, '1.4.382 does not add a rail tool')
  assert.equal(PACE_UNLOCK_WAVE, 2, '1.4.382 3× still opens on wave 3')
  assert.deepEqual(
    [0, 1, 2].map((wave) => skillUnlockOnWave(wave)),
    ['still', 'mend', null],
    '1.4.382 skills still open one per wave',
  )
  assert.ok(CHANGELOG.some((note) => note.version === '1.4.382'), '1.4.382 changelog row')
  assert.match(latestChange('1.4.382').title, /candy/)
  assert.match(latestChange('1.4.382').items.join('\n'), /porch/)
  assert.match(latestChange('1.4.382').items.join('\n'), /yellow road/)
  assert.doesNotMatch(
    latestChange('1.4.382').items.join('\n'),
    /Fixes #|Closes #|Resolves #|monkey|balloon/i,
    '1.4.382 changelog avoids GitHub close keywords',
  )
}

// Night Watch 1.4.383: Begin stays readable until the first plant. Accuser stays off Sparks.
{
  const defendCss383 = readFileSync(new URL('../src/styles/defend.css', import.meta.url), 'utf8')
  const defendSrc383 = readFileSync(new URL('../src/components/DefendScreen.tsx', import.meta.url), 'utf8')
  assert.match(defendCss383, /1\.4\.383: Begin stays readable until the first plant/)
  assert.match(defendCss383, /Wave start alone does not fade it/)
  assert.match(
    defendCss383,
    /\.defend-go\.is-awaiting-plant:disabled \{[^}]*opacity:\s*1/,
  )
  assert.match(
    defendCss383,
    /\.defend-go\.is-after-plant \{[^}]*opacity:\s*0\.42/,
  )
  assert.match(defendCss383, /1\.4\.383: Sparks stay clear of Accuser/)
  assert.match(
    defendCss383,
    /\.defend-page\.is-easy-watch \.nw-walker-slide\.easy-walker-roster \{[^}]*top:\s*152px/,
  )
  assert.match(defendCss383, /1\.4\.379: Easy phone SE chrome/, '1.4.383 keeps the phone chrome rules')
  assert.match(
    defendCss383,
    /\.defend-page\.is-easy-watch \.nw-walker-slide\.easy-walker-roster \{[^}]*max-height:\s*26px/,
    '1.4.383 keeps the one-line name rule',
  )
  assert.match(defendSrc383, /is-awaiting-plant/)
  assert.match(defendSrc383, /is-after-plant/)
  assert.match(defendSrc383, /phase === 'plant' \|\| planted\.length < 1/)
  assert.equal(WATCH_TOOLS.length, 4, '1.4.383 does not add a rail tool')
  assert.ok(CHANGELOG.some((note) => note.version === '1.4.383'), '1.4.383 changelog row')
  assert.match(latestChange('1.4.383').title, /Begin/)
  assert.match(latestChange('1.4.383').items.join('\n'), /first lamp/)
  assert.match(latestChange('1.4.383').items.join('\n'), /Sparks/)
  assert.doesNotMatch(
    latestChange('1.4.383').items.join('\n'),
    /Fixes #|Closes #|Resolves #|monkey|balloon/i,
    '1.4.383 changelog avoids GitHub close keywords',
  )
}

// Night Watch 1.4.384: a far lamp cannot skip the exit leak. Hearts fall, then the night fails.
{
  const defendSrc384 = readFileSync(new URL('../src/components/DefendScreen.tsx', import.meta.url), 'utf8')
  const defendCss384 = readFileSync(new URL('../src/styles/defend.css', import.meta.url), 'utf8')
  const benchGap = pathClearance(DEFEND_ANCHOR.bench)
  const benchRange = nightTowersMod.range('bench', 'logic', empty, { logic: 1 })
  assert.ok(benchGap > 70, '1.4.384 Witness Square still sits off the road')
  assert.ok(benchRange < benchGap, '1.4.384 Witness Square Logic stays short of the road')
  assert.equal(
    lampReach('bench', 96, benchGap),
    Math.min(96, benchGap - 1),
    '1.4.384 a thin nick does not cover the road',
  )
  assert.equal(LAMP_ROAD_OVERLAP, 24, '1.4.384 overlap floor stays a small nick')
  const porchBase = abilityRange('love', padStage('porch', empty), empty, { love: 1 })
  const porchGap = pathClearance(DEFEND_ANCHOR.porch)
  assert.equal(
    nightTowersMod.range('porch', 'love', empty, { love: 1 }),
    porchBase + porchGap,
    '1.4.384 porch keeps the seat-to-road bridge',
  )
  const porch = DEFEND_ANCHOR.porch
  const porchReach = porchBase + porchGap
  const gateDist = Math.hypot(porch.x - pathPoint(0).x, porch.y - pathPoint(0).y)
  const frontDist = Math.hypot(porch.x - pathPoint(0.72).x, porch.y - pathPoint(0.72).y)
  assert.ok(gateDist > porchReach, '1.4.384 porch still misses the gate spawn')
  assert.ok(frontDist <= porchReach, '1.4.384 porch still reaches the upper road')
  const hollowGap = pathClearance(DEFEND_ANCHOR.hollow)
  const hollowRange = nightTowersMod.range('hollow', 'love', empty, { love: 1 })
  assert.ok(hollowRange >= hollowGap, '1.4.384 Story Creek still reaches its bend')
  const one = applyGateLeaks(DEFEND_HEARTS, 1, false)
  assert.equal(one.hearts, DEFEND_HEARTS - 1, '1.4.384 one leak drops one heart')
  assert.equal(one.failed, false, '1.4.384 one leak does not end a full night')
  const emptyNight = applyGateLeaks(1, 1, false)
  assert.equal(emptyNight.hearts, 0, '1.4.384 the last heart can reach zero')
  assert.equal(emptyNight.failed, true, '1.4.384 zero hearts fails the night')
  const held = applyGateLeaks(DEFEND_HEARTS, 1, true)
  assert.equal(held.hearts, DEFEND_HEARTS, '1.4.384 Mend shield still forgives a leak')
  assert.equal(held.failed, false, '1.4.384 a forgiven leak is not a fail')
  assert.match(defendSrc384, /applyGateLeaks\(live\.current\.hearts, leaked, shielded\)/)
  assert.match(defendSrc384, /gate\.failed \|\| live\.current\.hearts <= 0/)
  assert.match(defendSrc384, /setPhase\('lost'\)/)
  assert.match(defendSrc384, /You missed/)
  assert.match(defendCss384, /1\.4\.383: Begin stays readable until the first plant/, '1.4.384 keeps Begin')
  assert.match(defendCss384, /1\.4\.381: unlockable 3× speed/, '1.4.384 keeps 3× speed')
  assert.match(defendCss384, /1\.4\.380: skills pack/, '1.4.384 keeps the skill pack')
  assert.equal(WATCH_TOOLS.length, 4, '1.4.384 does not add a rail tool')

  // Fresh Easy, one Logic lamp on Witness Square, no taps: walkers finish the road.
  const tune = waveCombat(0, true)
  const at = DEFEND_ANCHOR.bench
  let spawned = 0
  let downed = 0
  let hearts = DEFEND_HEARTS
  let failed = false
  let spawnAt = 0
  let spawnNow = false
  let cool = -999
  const raiders = []
  let time = 0
  const dt = 1 / 60
  while (time < 180 && !failed) {
    spawnAt += dt
    for (const raider of raiders) {
      if (!raider.dead) raider.t += 0.01 * dt
    }
    let leaked = 0
    for (const raider of raiders) {
      if (raider.dead) continue
      if (raider.t >= 1) {
        raider.dead = true
        leaked += 1
      }
    }
    const gate = applyGateLeaks(hearts, leaked, false)
    hearts = gate.hearts
    if (gate.failed) failed = true
    const live = raiders.filter((raider) => !raider.dead)
    if (spawned < tune.size && live.length < 3 && (spawnNow || spawnAt >= 3.8 || spawned === 0)) {
      spawnNow = false
      spawnAt = 0
      raiders.push({ t: easySpawnT(spawned), hp: 2, dead: false })
      spawned += 1
    }
    if (!failed && time >= cool) {
      let best = null
      let bestD = benchRange
      for (const raider of live) {
        const point = pathPoint(Math.min(1, raider.t))
        const dist = Math.hypot(at.x - point.x, at.y - point.y)
        if (dist <= bestD) {
          best = raider
          bestD = dist
        }
      }
      if (best) {
        cool = time + 0.7
        best.hp -= 1
        if (best.hp <= 0) {
          best.dead = true
          downed += 1
          spawnNow = true
        }
      }
    }
    if (downed >= tune.size) break
    time += dt
  }
  assert.equal(failed, true, '1.4.384 a far Logic lamp loses the night')
  assert.equal(hearts, 0, '1.4.384 the far lamp drains the hearts')
  assert.ok(downed < tune.size, '1.4.384 the far lamp does not clear the wave')
  assert.ok(CHANGELOG.some((note) => note.version === '1.4.384'), '1.4.384 changelog row')
  assert.match(latestChange('1.4.384').title, /heart/)
  assert.match(latestChange('1.4.384').items.join('\n'), /heart/)
  assert.match(latestChange('1.4.384').items.join('\n'), /Witness Square/)
  assert.doesNotMatch(
    latestChange('1.4.384').items.join('\n'),
    /Fixes #|Closes #|Resolves #|monkey|balloon/i,
    '1.4.384 changelog avoids GitHub close keywords',
  )
}

// Night Watch 1.4.385: glowing-face tap is a hit. Wrong only when the tap misses.
{
  const defendSrc385 = readFileSync(new URL('../src/components/DefendScreen.tsx', import.meta.url), 'utf8')
  const defendNight385 = readFileSync(
    new URL('../src/components/DefendNightActors.tsx', import.meta.url),
    'utf8',
  )
  const defendCss385 = readFileSync(new URL('../src/styles/defend.css', import.meta.url), 'utf8')
  assert.equal(faceTapStrike(true, true, false), 'hit', '1.4.385 Easy face tap hits outside lamp range')
  assert.equal(faceTapStrike(true, true, true), 'hit', '1.4.385 Easy face tap hits inside lamp range')
  assert.equal(faceTapStrike(true, false, true), 'miss', '1.4.385 an off-face tap is a miss')
  assert.equal(faceTapStrike(false, true, false), 'miss', '1.4.385 Hard still needs a lamp in range')
  assert.equal(faceTapStrike(false, true, true), 'hit')
  assert.equal(EASY_FACE_HIT_R, 80)
  assert.ok(EASY_FACE_HIT_R > PATH_WALKER_HIT_R, '1.4.385 face disc is fatter than the old feet hit')
  assert.ok(EASY_FACE_HIT_R > PATH_WALKER_FACE_U * 0.5, '1.4.385 disc covers the gold ring')
  const phone = boardFill({ w: 375, h: 520 })
  assert.ok(easyFaceHitPx(phone.scale) >= 64, '1.4.385 face hit is a thumb on a 375-wide phone')
  assert.equal(easyFaceHitPx(0), 0)
  assert.equal(EASY_MISS_HOLD_MS, 1400, '1.4.385 Wrong fades')
  assert.match(defendSrc385, /faceTapStrike\(easy, true, inRange !== null\)/)
  assert.match(defendSrc385, /fire\(lamp, raiderId, easy\)/)
  assert.match(defendSrc385, /if \(!manual && \(live\.current\.cool\[id\]/)
  assert.match(defendSrc385, /if \(forced && \(manual \|\| dist/)
  assert.match(defendSrc385, /if \(!manual\) live\.current\.cool\[id\] = now/)
  assert.match(defendSrc385, /dismissMiss\(\)/)
  assert.match(defendSrc385, /showMiss\(\)/)
  assert.match(defendSrc385, /EASY_MISS_HOLD_MS/)
  assert.match(defendSrc385, /faceTapStrike\(easy, false, false\)/)
  assert.doesNotMatch(
    defendSrc385,
    /setToolLock\(EASY\.nightMiss\)/,
    '1.4.385 Wrong is timed, not sticky',
  )
  assert.match(defendNight385, /cy=\{isTap \? PATH_WALKER_FACE_DY : 0\}/)
  assert.match(defendNight385, /r=\{isTap \? EASY_FACE_HIT_R : PATH_WALKER_HIT_R\}/)
  assert.match(defendNight385, /walker-cue-pad/)
  assert.match(defendNight385, /data-face-hit=\{isTap \? 'easy' : undefined\}/)
  assert.match(defendCss385, /1\.4\.385: gold pad fills the ring/)
  assert.match(defendCss385, /\.defend-blast \{[^}]*pointer-events:\s*none/)
  assert.match(defendCss385, /1\.4\.385: the fat face disc is the only tap/)
  assert.match(
    defendCss385,
    /1\.4\.383: Begin stays readable until the first plant/,
    '1.4.385 keeps Begin',
  )
  assert.match(defendCss385, /1\.4\.381: unlockable 3× speed/, '1.4.385 keeps 3× speed')
  assert.match(defendCss385, /1\.4\.380: skills pack/, '1.4.385 keeps the skill pack')
  assert.match(defendCss385, /1\.4\.379: Easy phone SE chrome/, '1.4.385 keeps the phone chrome')
  assert.ok(
    nightTowersMod.range('bench', 'logic', empty, { logic: 1 }) < pathClearance(DEFEND_ANCHOR.bench),
    '1.4.385 Witness Square still misses the road',
  )
  assert.equal(
    applyGateLeaks(DEFEND_HEARTS, 1, false).hearts,
    DEFEND_HEARTS - 1,
    '1.4.385 a leak still drops a heart',
  )
  assert.equal(WATCH_TOOLS.length, 4, '1.4.385 does not add a rail tool')
  assert.ok(CHANGELOG.some((note) => note.version === '1.4.385'), '1.4.385 changelog row')
  assert.match(latestChange('1.4.385').title, /face/)
  assert.match(latestChange('1.4.385').items.join('\n'), /glowing face/)
  assert.match(latestChange('1.4.385').items.join('\n'), /Wrong/)
  assert.doesNotMatch(
    latestChange('1.4.385').items.join('\n'),
    /Fixes #|Closes #|Resolves #|monkey|balloon/i,
    '1.4.385 changelog avoids GitHub close keywords',
  )
}

// Night Watch 1.4.386: Upgrade spends on the lamp just opened, not the previous one.
{
  const defendSrc386 = readFileSync(new URL('../src/components/DefendScreen.tsx', import.meta.url), 'utf8')
  const board386 = readFileSync(new URL('../src/components/DefendNightBoard.tsx', import.meta.url), 'utf8')
  const card386 = readFileSync(new URL('../src/components/DefendTowerCard.tsx', import.meta.url), 'utf8')
  const css386 = readFileSync(new URL('../src/styles/defend.css', import.meta.url), 'utf8')
  const plants = { porch: 'love', hollow: 'logic', journal: 'reason', bench: 'science' }
  assert.equal(lampUpgradeTool('hollow', plants), 'logic', '1.4.386 Logic lamp spends on Logic')
  assert.equal(lampUpgradeTool('porch', plants), 'love')
  assert.equal(lampUpgradeTool('lookout', plants), null, '1.4.386 an empty plot does not fall back to Love')
  assert.equal(lampUpgradeTool(null, plants), null)
  assert.equal(selectUpgradeLamp('porch', 'hollow', false), 'hollow', '1.4.386 opening Logic leaves Love')
  assert.equal(selectUpgradeLamp('hollow', 'hollow', true), 'hollow', '1.4.386 a repeated open stays on Logic')
  assert.equal(selectUpgradeLamp('hollow', 'hollow', false), null, '1.4.386 a later tap on the open lamp closes')
  assert.equal(selectUpgradeLamp(null, 'porch', false), 'porch')
  assert.equal(UPGRADE_TAP_ECHO_MS, 400)
  assert.equal(UPGRADE_GHOST_MS, 48)
  assert.equal(upgradeSpendAllowed('hollow', 'porch', 1_000, 2_000), false, '1.4.386 Love’s button cannot spend after Logic is open')
  assert.equal(upgradeSpendAllowed('hollow', 'hollow', 1_000, 1_020), false, '1.4.386 the open tap does not also spend')
  assert.equal(upgradeSpendAllowed('hollow', 'hollow', 1_000, 1_000 + UPGRADE_GHOST_MS), true)
  assert.equal(upgradeSpendAllowed(null, 'hollow', 0, 1_000), false)
  let open = selectUpgradeLamp(null, 'porch', false)
  let tier = { love: 1, logic: 1, reason: 1, science: 1 }
  let sparks = 4
  let spent = applyBoost(lampUpgradeTool(open, plants), tier, sparks)
  assert.equal(spent.ok, true)
  tier = spent.runTier
  sparks = spent.sparks
  assert.equal(tier.love, 2)
  assert.equal(tier.logic, 1)
  open = selectUpgradeLamp(open, 'hollow', false)
  open = selectUpgradeLamp(open, 'hollow', true)
  assert.equal(upgradeSpendAllowed('porch', 'porch', 5_000, 5_010), false)
  assert.equal(upgradeSpendAllowed(open, 'porch', 5_000, 5_200), false, '1.4.386 sticky Love card cannot spend')
  assert.equal(upgradeSpendAllowed(open, open, 5_000, 5_200), true)
  spent = applyBoost(lampUpgradeTool(open, plants), tier, sparks)
  assert.equal(spent.runTier.logic, 2, '1.4.386 Logic I→II')
  assert.equal(spent.runTier.love, 2, '1.4.386 Love stays II')
  for (const phone of [
    { w: 375, h: 520 },
    { w: 375, h: 620 },
  ]) {
    const scale = boardFill(phone).scale
    const seats = Object.fromEntries(
      EASY_PLANT_PADS.map((id) => [id, boardFillPoint(phone, DEFEND_ANCHOR[id])]),
    )
    for (const id of EASY_PLANT_PADS) {
      const others = EASY_PLANT_PADS.filter((other) => other !== id)
      const placed = placeTowerCard(
        seats[id],
        phone,
        others.map((other) => seats[other]),
        scale,
      )
      for (const other of others) {
        assert.equal(
          upgradeControlsHitLamp(placed, seats[other], scale),
          false,
          `1.4.386 ${id} Upgrade stays off ${other} at ${phone.w}×${phone.h}`,
        )
      }
    }
  }
  assert.match(defendSrc386, /upgradeAtRef/)
  assert.match(defendSrc386, /selectUpgradeLamp\(upgradeAtRef\.current, id, echoed\)/)
  assert.match(defendSrc386, /lampUpgradeTool\(plotId, plantsRef\.current\)/)
  assert.match(defendSrc386, /upgradeSpendAllowed\(/)
  assert.doesNotMatch(
    defendSrc386.slice(defendSrc386.indexOf('function boostSelectedTool')),
    /unlocked\.includes\(ability\)[\s\S]{0,80}: 'love'/,
    '1.4.386 the card spend does not fall back to Love',
  )
  assert.match(board386, /onBoostTower\?\.\(upgradeAt as CityPlotId\)/)
  assert.match(board386, /clearOf/)
  assert.match(board386, /towerType\[upgradeAt\]/)
  assert.doesNotMatch(board386, /: ability\) \?\? ability/)
  assert.match(card386, /data-upgrade-plot=\{plotId\}/)
  assert.match(card386, /placeTowerCard\(point, board, clearOf, cameraScale\)/)
  assert.match(css386, /1\.4\.386: the card body does not eat a lamp underneath/)
  assert.match(css386, /\.defend-tower-card \{[^}]*pointer-events:\s*none/)
  assert.match(css386, /\.defend-tower-card \.defend-tower-upgrade,\s*\.defend-tower-card \.defend-tower-pull \{[^}]*pointer-events:\s*auto/)
  assert.match(css386, /1\.4\.385: gold pad fills the ring/, '1.4.386 keeps face taps')
  assert.match(css386, /1\.4\.383: Begin stays readable until the first plant/, '1.4.386 keeps Begin')
  assert.equal(WATCH_TOOLS.length, 4, '1.4.386 does not add a rail tool')
  assert.equal(
    applyGateLeaks(DEFEND_HEARTS, 1, false).hearts,
    DEFEND_HEARTS - 1,
    '1.4.386 a leak still drops a heart',
  )
  assert.ok(CHANGELOG.some((note) => note.version === '1.4.386'), '1.4.386 changelog row')
  assert.match(latestChange('1.4.386').title, /lamp you opened/)
  assert.match(latestChange('1.4.386').items.join('\n'), /Logic/)
  assert.doesNotMatch(
    latestChange('1.4.386').items.join('\n'),
    /Fixes #|Closes #|Resolves #|monkey|balloon/i,
    '1.4.386 changelog avoids GitHub close keywords',
  )
}

// Night Watch 1.4.387: Easy hides the stuck Insight diamond. Rail 1s stay the plant slots.
{
  const defendSrc387 = readFileSync(new URL('../src/components/DefendScreen.tsx', import.meta.url), 'utf8')
  const css387 = readFileSync(new URL('../src/styles/defend.css', import.meta.url), 'utf8')
  assert.match(
    defendSrc387,
    /1\.4\.387: Easy hides Insight[\s\S]*?easy \? null : <CoinRead count=\{insightScore\(progress\)\} label="Insight" \/>/,
    '1.4.387 Easy omits the diamond; other watches still read journal insight',
  )
  assert.doesNotMatch(defendSrc387, /setCoins|wallet|coins:/i, '1.4.387 does not invent a gold wallet')
  assert.match(defendSrc387, /balloon=\{<MoneyBalloon count=\{runSparks\} label="Sparks"/, '1.4.387 sparks stay on the star')
  assert.match(defendAbilitySrc, /data-slot-badge="1"/, '1.4.387 rail gold 1 stays the plant slot')
  assert.match(defendSrc387, /pullPlant\(plants, id, pads\)/, '1.4.387 Pull still returns a slot')
  assert.match(defendSrc387, /lampUpgradeTool\(plotId, plantsRef\.current\)/, '1.4.387 upgrade still spends on the open lamp')
  assert.match(css387, /1\.4\.385: gold pad fills the ring/, '1.4.387 keeps face taps')
  assert.match(css387, /1\.4\.383: Begin stays readable until the first plant/, '1.4.387 keeps Begin')
  assert.equal(WATCH_TOOLS.length, 4, '1.4.387 does not add a rail tool')
  assert.equal(
    applyGateLeaks(DEFEND_HEARTS, 1, false).hearts,
    DEFEND_HEARTS - 1,
    '1.4.387 a leak still drops a heart',
  )
  assert.equal(slotLeft({}, 'love'), 1, '1.4.387 an unplanted lamp still shows 1')
  assert.equal(slotLeft({ porch: 'love' }, 'love'), 0, '1.4.387 planting still spends that 1')
  const returned = pullPlant({ porch: 'love', hollow: 'logic' }, 'porch', EASY_PLANT_PADS)
  assert.equal(slotLeft(returned, 'love'), 1, '1.4.387 Pull still puts the 1 back')
  assert.ok(CHANGELOG.some((note) => note.version === '1.4.387'), '1.4.387 changelog row')
  assert.match(latestChange('1.4.387').title, /diamond/)
  assert.match(latestChange('1.4.387').items.join('\n'), /gold 1/)
  assert.doesNotMatch(
    latestChange('1.4.387').items.join('\n'),
    /Fixes #|Closes #|Resolves #|monkey|balloon/i,
    '1.4.387 changelog avoids GitHub close keywords',
  )
}

// Night Watch 1.4.388: 0 sparks greys Upgrade and the column Tap (Fixes #566).
{
  const defendSrc388 = readFileSync(new URL('../src/components/DefendScreen.tsx', import.meta.url), 'utf8')
  const card388 = readFileSync(new URL('../src/components/DefendTowerCard.tsx', import.meta.url), 'utf8')
  const css388 = readFileSync(new URL('../src/styles/defend.css', import.meta.url), 'utf8')
  assert.match(card388, /disabled=\{!canSpend\}/, '1.4.388 Upgrade stays disabled without a spark')
  assert.match(card388, /Need a spark/, '1.4.388 the card still says Need a spark')
  assert.match(card388, /aria-describedby=\{canSpend \? undefined : 'defend-tower-need'\}/)
  assert.match(
    css388,
    /1\.4\.388: 0 sparks — Upgrade is a flat grey control[\s\S]*?\.defend-tower-card \.btn\.primary\.defend-tower-upgrade:disabled \{[\s\S]*?opacity:\s*1[\s\S]*?background:\s*linear-gradient\(180deg, #e4deea/,
    '1.4.388 disabled Upgrade is grey, not a faded gold pill',
  )
  assert.doesNotMatch(
    css388,
    /\.defend-tower-upgrade:disabled \{\s*opacity:\s*0\.72/,
    '1.4.388 drops the faded-gold disabled Upgrade',
  )
  assert.match(defendAbilitySrc, /is-spark-dry/, '1.4.388 dry columns drop the live rail')
  assert.match(defendAbilitySrc, /disabled=\{spendDry\}/, '1.4.388 a dry column is not tappable')
  assert.match(defendAbilitySrc, /'Need a spark'/, '1.4.388 the column still says Need a spark')
  assert.match(
    defendAbilitySrc,
    /easy\s*\?\s*'Paths'\s*:\s*'↑ spark'/,
    '1.4.405 a planted Easy card opens the path panel',
  )
  assert.match(defendSrc388, /sparks=\{runSparks\}/, '1.4.388 the rail reads this night’s sparks')
  assert.match(defendSrc388, /is-spark-broke/, '1.4.388 the rail frame rests at 0 sparks')
  assert.match(css388, /\.defend-ability\.is-spark-dry/, '1.4.388 dry columns are styled')
  assert.match(css388, /1\.4\.388: 0 sparks — the rail is not a live spend tray/)
  assert.match(defendSrc388, /lampUpgradeTool\(plotId, plantsRef\.current\)/, '1.4.388 upgrade still spends on the open lamp')
  assert.match(css388, /1\.4\.385: gold pad fills the ring/, '1.4.388 keeps face taps')
  assert.match(css388, /1\.4\.383: Begin stays readable until the first plant/, '1.4.388 keeps Begin')
  assert.match(defendSrc388, /balloon=\{<MoneyBalloon count=\{runSparks\} label="Sparks"/, '1.4.388 sparks stay on the star')
  assert.match(defendAbilitySrc, /data-slot-badge="1"/, '1.4.388 rail gold 1 stays the plant slot')
  assert.equal(WATCH_TOOLS.length, 4, '1.4.388 does not add a rail tool')
  assert.equal(boostCost(1), 1, '1.4.388 one spark still buys the next level')
  assert.equal(applyBoost('logic', { logic: 1 }, 0).note, 'Need a spark', '1.4.388 a dry spend still refuses')
  assert.equal(applyBoost('logic', { logic: 1 }, 1).ok, true, '1.4.388 a spark still spends')
  assert.equal(
    applyGateLeaks(DEFEND_HEARTS, 1, false).hearts,
    DEFEND_HEARTS - 1,
    '1.4.388 a leak still drops a heart',
  )
  assert.equal(slotLeft({}, 'love'), 1, '1.4.388 an unplanted lamp still shows 1')
  const returned388 = pullPlant({ porch: 'love' }, 'porch', EASY_PLANT_PADS)
  assert.equal(slotLeft(returned388, 'love'), 1, '1.4.388 Pull still puts the 1 back')
  assert.ok(CHANGELOG.some((note) => note.version === '1.4.388'), '1.4.388 changelog row')
  assert.match(latestChange('1.4.388').title, /spark/)
  assert.match(latestChange('1.4.388').items.join('\n'), /Need a spark/)
  assert.match(latestChange('1.4.388').items.join('\n'), /Tap/)
  assert.doesNotMatch(
    latestChange('1.4.388').items.join('\n'),
    /Fixes #|Closes #|Resolves #|monkey|balloon/i,
    '1.4.388 changelog avoids GitHub close keywords',
  )
}

// Night Watch 1.4.389: Begin is pale at 0 planted and solid gold once a lamp stands.
{
  const defendSrc389 = readFileSync(new URL('../src/components/DefendScreen.tsx', import.meta.url), 'utf8')
  const css389 = readFileSync(new URL('../src/styles/defend.css', import.meta.url), 'utf8')
  const easy389 = readFileSync(new URL('../src/lib/easyUi.ts', import.meta.url), 'utf8')
  assert.match(css389, /1\.4\.389: Begin follows the planted count/)
  assert.match(css389, /Ring slots do not drive this/)
  assert.match(
    css389,
    /1\.4\.389: Begin follows the planted count[\s\S]*?\.defend-go\.is-awaiting-plant:disabled \{[\s\S]*?opacity:\s*1[\s\S]*?background:\s*linear-gradient\(180deg, #e4deea/,
    '1.4.389 a waiting Begin is pale grey, not bright gold',
  )
  assert.match(
    css389,
    /1\.4\.389: Begin follows the planted count[\s\S]*?\.defend-go\.is-after-plant \{[\s\S]*?opacity:\s*1[\s\S]*?#ffcc33/,
    '1.4.389 a planted Begin is solid gold',
  )
  assert.match(css389, /@keyframes nw-lamp-nudge/)
  assert.match(css389, /\.is-need-lamp \.nw-rail \.defend-abilities \{[\s\S]*?nw-lamp-nudge/)
  assert.match(
    css389,
    /@media \(prefers-reduced-motion: reduce\) \{[\s\S]*?\.is-need-lamp \.nw-rail \.defend-abilities \{[\s\S]*?animation:\s*none/,
    '1.4.389 the lamp-card nudge rests when motion is reduced',
  )
  assert.match(easy389, /nightPlantFirst: 'Plant a lamp first'/)
  assert.match(defendSrc389, /const awaitingLamp = planted\.length < 1/)
  assert.match(
    defendSrc389,
    /awaitingLamp \? ' is-awaiting-plant' : ' is-after-plant'/,
    '1.4.389 Begin state follows the planted count',
  )
  assert.match(defendSrc389, /EASY\.nightPlantFirst/)
  assert.match(defendSrc389, /easy && phase === 'plant' && awaitingLamp \? 'is-need-lamp'/)
  assert.match(css389, /1\.4\.383: Begin stays readable until the first plant/, '1.4.389 keeps the earlier Begin marker')
  assert.match(css389, /1\.4\.388: 0 sparks — Upgrade is a flat grey control/, '1.4.389 leaves Upgrade grey')
  assert.match(defendSrc389, /lampUpgradeTool\(plotId, plantsRef\.current\)/, '1.4.389 upgrade still spends on the open lamp')
  assert.equal(WATCH_TOOLS.length, 4, '1.4.389 does not add a rail tool')
  assert.ok(CHANGELOG.some((note) => note.version === '1.4.389'), '1.4.389 changelog row')
  assert.match(latestChange('1.4.389').title, /Begin/)
  assert.match(latestChange('1.4.389').items.join('\n'), /Plant a lamp first/)
  assert.match(latestChange('1.4.389').items.join('\n'), /solid gold/)
  assert.doesNotMatch(
    latestChange('1.4.389').items.join('\n'),
    /Fixes #|Closes #|Resolves #|monkey|balloon/i,
    '1.4.389 changelog avoids GitHub close keywords',
  )
}

// Night Watch 1.4.390: Easy lamps plant on open ground. The drawn ring is the hit ring.
{
  const placeSrc = readFileSync(new URL('../src/lib/lampPlace.ts', import.meta.url), 'utf8')
  const actors390 = readFileSync(new URL('../src/components/DefendNightActors.tsx', import.meta.url), 'utf8')
  const defendSrc390 = readFileSync(new URL('../src/components/DefendScreen.tsx', import.meta.url), 'utf8')
  const css390 = readFileSync(new URL('../src/styles/defend.css', import.meta.url), 'utf8')
  const ability390 = readFileSync(new URL('../src/components/DefendAbilityBar.tsx', import.meta.url), 'utf8')
  const tier = freshRunTier()
  const road = pathPoint(0.45)
  assert.equal(lampSpotBlocked(road), true, '1.4.390 the road refuses a lamp')
  assert.equal(lampSpotBlocked({ x: 192, y: 537 }), true, '1.4.390 a house refuses a lamp')
  const refused = commitLamp({}, road, 'love', emptyProgress(), tier)
  assert.equal(refused.ok, false, '1.4.390 a blocked tap places nothing')
  assert.deepEqual(refused.plants, {})
  let open = null
  for (let y = 360; y <= 860 && !open; y += 6) {
    for (let x = 240; x <= 520 && !open; x += 6) {
      const point = { x, y }
      if (lampSpotBlocked(point)) continue
      const gap = pathClearance(point)
      if (gap >= 50 && gap <= 68) open = point
    }
  }
  assert.ok(open, '1.4.390 open ground sits beside the road')
  const placed = commitLamp({}, open, 'love', emptyProgress(), tier)
  assert.equal(placed.ok, true, '1.4.390 an open tap plants')
  assert.equal(placed.plants[placed.preview.spot], 'love')
  const seat = placed.preview.at
  const range = nightTowersMod.range(placed.preview.spot, 'love', emptyProgress(), tier)
  assert.equal(placed.preview.range, range, '1.4.390 the ghost ring is the combat range')
  assert.ok(pathClearance(seat) <= range, '1.4.390 a roadside lamp reaches the road')
  assert.equal(
    nightTowersMod.inRange(placed.preview.spot, 'love', emptyProgress(), {
      x: seat.x + range - 1,
      y: seat.y,
    }, tier),
    true,
    '1.4.390 a walker inside the ring is hit',
  )
  assert.equal(
    nightTowersMod.inRange(placed.preview.spot, 'love', emptyProgress(), {
      x: seat.x + range + 2,
      y: seat.y,
    }, tier),
    false,
    '1.4.390 a walker outside the ring is not hit',
  )
  assert.match(actors390, /easy \|\| easyTap \? planted : pads/)
  assert.match(actors390, /data-lamp-ghost/)
  assert.match(actors390, /data-plant-ring="gold"/, '1.4.390 hard still has the ring markup')
  assert.match(defendSrc390, /previewLamp\(/)
  assert.match(defendSrc390, /commitLamp\(/)
  assert.match(defendSrc390, /const awaitingLamp = planted\.length < 1/)
  assert.match(ability390, /data-lamp-selected/)
  assert.doesNotMatch(ability390, /draggable|onDragStart/, '1.4.390 does not drag from the card')
  assert.match(css390, /1\.4\.390: tap a card, then the map/)
  assert.match(css390, /\.defend-ghost\.is-nogo \.defend-ghost-ring \{[^}]*rgba\(226, 48, 64/)
  assert.match(css390, /1\.4\.389: Begin follows the planted count/, '1.4.390 keeps Begin on the planted count')
  assert.match(placeSrc, /export function commitLamp/)
  assert.match(placeSrc, /export function previewLamp/)
  assert.doesNotMatch(placeSrc, /onDrag|pointer drag from the card/)
  assert.equal(WATCH_TOOLS.length, 4, '1.4.390 does not add a rail tool')
  assert.ok(CHANGELOG.some((note) => note.version === '1.4.390'), '1.4.390 changelog row')
  assert.match(latestChange('1.4.390').title, /open ground/)
  assert.match(latestChange('1.4.390').items.join('\n'), /red lamp/)
  assert.match(latestChange('1.4.390').items.join('\n'), /solid gold/)
  assert.doesNotMatch(
    latestChange('1.4.390').items.join('\n'),
    /Fixes #|Closes #|Resolves #|monkey|balloon/i,
    '1.4.390 changelog avoids GitHub close keywords',
  )
}

// Night Watch 1.4.391: drag a lamp from its card. A short tap still selects.
{
  const ability391 = readFileSync(new URL('../src/components/DefendAbilityBar.tsx', import.meta.url), 'utf8')
  const defendSrc391 = readFileSync(new URL('../src/components/DefendScreen.tsx', import.meta.url), 'utf8')
  const css391 = readFileSync(new URL('../src/styles/defend.css', import.meta.url), 'utf8')
  const placeSrc391 = readFileSync(new URL('../src/lib/lampPlace.ts', import.meta.url), 'utf8')
  assert.equal(LAMP_DRAG_START_PX, 10, '1.4.391 a short card press stays a tap')
  assert.equal(LAMP_DRAG_LIFT_PX, 0, '1.4.400 a dragged lamp lands under the finger')
  assert.deepEqual(dragGhostClient(80, 240), { x: 80, y: 240 - LAMP_DRAG_LIFT_PX })
  assert.match(ability391, /onPointerDown/)
  assert.match(ability391, /LAMP_DRAG_START_PX/)
  assert.match(ability391, /touchAction: 'none'/)
  assert.match(ability391, /setAbility\(tool\.id\)/, '1.4.391 a short tap still selects the card')
  assert.doesNotMatch(ability391, /draggable|onDragStart/, '1.4.391 uses pointer events, not a native drag image')
  assert.match(defendSrc391, /function onLampDrag/)
  assert.match(defendSrc391, /previewLamp\(/)
  assert.match(defendSrc391, /commitLamp\(/)
  assert.match(defendSrc391, /overTowerCards/)
  assert.match(defendSrc391, /lampDragLive/)
  assert.match(defendSrc391, /if \(!next\.ok\) return/)
  assert.match(placeSrc391, /export function dragGhostClient/)
  assert.match(placeSrc391, /export function overTowerCards/)
  assert.match(css391, /1\.4\.391: the drag starts on a tower card/)
  assert.match(
    css391,
    /\.defend-page\.is-placing \.nw-rail \.defend-ability \{[^}]*touch-action: none/,
  )
  assert.match(css391, /1\.4\.389: Begin follows the planted count/, '1.4.391 keeps Begin on the planted count')
  assert.match(css391, /\.defend-ghost\.is-nogo \.defend-ghost-ring \{[^}]*rgba\(226, 48, 64/)
  assert.match(defendSrc391, /const awaitingLamp = planted\.length < 1/)
  assert.match(defendSrc391, /EASY\.nightPlantFirst/)
  assert.equal(WATCH_TOOLS.length, 4, '1.4.391 does not add a rail tool')
  assert.ok(CHANGELOG.some((note) => note.version === '1.4.391'), '1.4.391 changelog row')
  assert.match(latestChange('1.4.391').title, /drag/)
  assert.match(latestChange('1.4.391').items.join('\n'), /red/)
  assert.match(latestChange('1.4.391').items.join('\n'), /short tap/)
  assert.match(latestChange('1.4.391').items.join('\n'), /solid gold/)
  assert.doesNotMatch(
    latestChange('1.4.391').items.join('\n'),
    /Fixes #|Closes #|Resolves #|monkey|balloon/i,
    '1.4.391 changelog avoids GitHub close keywords',
  )
}

// Night Watch 1.4.393: gate spawn, upgrade reach notes, a wave lamp tap is not a miss.
{
  const actors393 = readFileSync(new URL('../src/components/DefendNightActors.tsx', import.meta.url), 'utf8')
  const board393 = readFileSync(new URL('../src/components/DefendNightBoard.tsx', import.meta.url), 'utf8')
  const card393 = readFileSync(new URL('../src/components/DefendTowerCard.tsx', import.meta.url), 'utf8')
  const defendSrc393 = readFileSync(new URL('../src/components/DefendScreen.tsx', import.meta.url), 'utf8')
  const css393 = readFileSync(new URL('../src/styles/defend.css', import.meta.url), 'utf8')
  const tier = freshRunTier()
  const progress = emptyProgress()
  assert.equal(easySpawnT(0), 0, '1.4.393 the first walker starts at the gate')
  assert.equal(easySpawnT(1), 0, '1.4.393 the second walker starts at the gate')
  assert.equal(easySpawnT(5), 0, '1.4.393 later walkers start at the gate')
  assert.match(defendSrc393, /t: nightEnemies\.spawnT\(id\)/, '1.4.393 Easy and Hard share the gate spawn')
  assert.doesNotMatch(defendSrc393, /t: easy \? nightEnemies\.spawnT/, '1.4.393 Easy no longer starts up the road')
  assert.match(css393, /@keyframes defend-gate-in/)
  assert.match(css393, /animation: defend-gate-in 250ms ease-out both/)
  assert.match(css393, /prefers-reduced-motion: reduce\) \{[\s\S]*?\.defend-raider \{[\s\S]*?animation: none/)
  assert.match(actors393, /data-lamp-wave-hit="yes"/)
  assert.match(actors393, /scenery && on/)
  assert.match(css393, /\.defend-pad\.is-tower-scenery \.defend-hit\[data-lamp-wave-hit\] \{[^}]*pointer-events: all/)
  assert.match(board393, /lampRoadNote/)
  assert.match(card393, /data-road-note/)
  assert.match(css393, /\.defend-tower-road \{[^}]*#ffd27a/)
  assert.equal(FREE_LAMP_RANGE_BONUS, 18, '1.4.393 level I stays the modest free bonus')
  assert.equal(
    nightTowersMod.range('bench', 'logic', progress, tier) < pathClearance(DEFEND_ANCHOR.bench),
    true,
    '1.4.393 Witness Square stays short of the road',
  )

  function offsetPoint(t, dist, sign) {
    const a = pathPoint(Math.max(0, t - 0.004))
    const b = pathPoint(Math.min(1, t + 0.004))
    const dx = b.x - a.x
    const dy = b.y - a.y
    const len = Math.hypot(dx, dy) || 1
    const p = pathPoint(t)
    return { x: p.x + (-dy / len) * dist * sign, y: p.y + (dx / len) * dist * sign }
  }
  function findSeat(minGap, maxGap) {
    for (let t = 0.08; t <= 0.92; t += 0.02) {
      for (const sign of [1, -1]) {
        for (let dist = minGap; dist <= maxGap; dist += 2) {
          const point = offsetPoint(t, dist, sign)
          if (point.x < 24 || point.y < 24 || point.x > 774 || point.y > 1110) continue
          const gap = pathClearance(point)
          if (gap < minGap || gap > maxGap) continue
          if (lampSpotBlocked(point)) continue
          return point
        }
      }
    }
    return null
  }

  const gold = findSeat(70, 88)
  assert.ok(gold, '1.4.393 open ground sits inside level I')
  const goldLook = previewLamp(gold, 'love', progress, tier)
  assert.equal(goldLook.blocked, false)
  assert.equal(goldLook.reaches, true, '1.4.393 level I reaches')
  assert.equal(goldLook.note, '', '1.4.393 a reaching lamp has no upgrade note')
  assert.match(goldLook.road, /^M/)

  const later = findSeat(94, 106)
  assert.ok(later, '1.4.393 open ground sits in the level II band')
  const laterLook = previewLamp(later, 'love', progress, tier)
  assert.equal(laterLook.reaches, false, '1.4.393 level I misses the set-back seat')
  assert.equal(laterLook.note, 'Reaches at Level II')
  assert.equal(laterLook.road, '')
  assert.equal(laterLook.blocked, false, '1.4.393 the set-back seat still plants')
  assert.equal(lampRoadNote(laterLook.spot, 'love', progress, { love: 2 }), '')
  assert.equal(
    nightTowersMod.range(laterLook.spot, 'love', progress, { love: 2 }) >= pathClearance(laterLook.at),
    true,
    '1.4.393 level II uses the combat range',
  )

  const third = findSeat(112, 124)
  assert.ok(third, '1.4.393 open ground sits in the level III band')
  const thirdLook = previewLamp(third, 'love', progress, tier)
  assert.equal(thirdLook.note, 'Reaches at Level III')
  assert.equal(lampRoadNote(thirdLook.spot, 'love', progress, { love: 2 }), 'Reaches at Level III')
  assert.equal(lampRoadNote(thirdLook.spot, 'love', progress, { love: 3 }), '')

  const farPoint = findSeat(140, 180)
  assert.ok(farPoint, '1.4.393 open ground sits beyond level III')
  const far = previewLamp(farPoint, 'love', progress, tier)
  assert.equal(far.blocked, false)
  assert.equal(far.reaches, false)
  assert.equal(far.note, LAMP_TOO_FAR)
  assert.equal(lampRoadNote(far.spot, 'love', progress, { love: 3 }), LAMP_TOO_FAR)
  assert.equal(easyGateResult(4, 1, 0.7), 'clear', '1.4.393 gate entry lets Love I hold wave 5 taps')

  const road = pathPoint(0.4)
  assert.equal(previewLamp(road, 'love', progress, tier).note, '', '1.4.393 a red no-go has no reach note')

  assert.ok(CHANGELOG.some((note) => note.version === '1.4.393'), '1.4.393 changelog row')
  assert.match(latestChange('1.4.393').title, /gate/)
  assert.match(latestChange('1.4.393').items.join('\n'), /Reaches at Level II/)
  assert.match(latestChange('1.4.393').items.join('\n'), /Too far from the road/)
  assert.doesNotMatch(
    latestChange('1.4.393').items.join('\n'),
    /Fixes #|Closes #|Resolves #|monkey|balloon/i,
    '1.4.393 changelog avoids GitHub close keywords',
  )
}

// Night Watch 1.4.400: Easy upgrade prices and a paid lamp after Begin.
{
  const defendSrc396 = readFileSync(new URL('../src/components/DefendScreen.tsx', import.meta.url), 'utf8')
  const card396 = readFileSync(new URL('../src/components/DefendTowerCard.tsx', import.meta.url), 'utf8')
  const ability396 = readFileSync(new URL('../src/components/DefendAbilityBar.tsx', import.meta.url), 'utf8')
  const board396 = readFileSync(new URL('../src/components/DefendNightBoard.tsx', import.meta.url), 'utf8')
  assert.deepEqual(EASY_TIER_COST.slice(2), [3, 6, 10], '1.4.400 tier prices stay path-agnostic')
  assert.equal(easyTierCost(1), 3, '1.4.400 I→II costs 3')
  assert.equal(easyTierCost(2), 6, '1.4.400 II→III costs 6')
  assert.equal(easyTierCost(3), 0, '1.4.400 a maxed lamp has nothing to buy yet')
  assert.equal(EASY_TIER_COST[4], 10, '1.4.400 the next tier step is priced for the tree')
  assert.equal(boostCost(1), 1, '1.4.400 Hard still spends one spark')
  assert.equal(boostCost(2), 1, '1.4.400 Hard II still spends one spark')
  assert.equal(EASY_LAMP_COST, 5, '1.4.400 an extra lamp costs 5')
  const w1 = wavePackSize(0)
  assert.equal(w1, 4, '1.4.400 wave 1 still pays 4 sparks')
  const first = applyBoost('science', freshRunTier(), w1, true)
  assert.equal(first.ok, true, '1.4.400 wave 1 can raise one lamp')
  assert.equal(first.runTier.science, 2)
  assert.equal(first.sparks, 1)
  const second = applyBoost('reason', first.runTier, first.sparks, true)
  assert.equal(second.ok, false, '1.4.400 wave 1 cannot raise both lamps')
  const topped = applyBoost('science', first.runTier, first.sparks, true)
  assert.equal(topped.ok, false, '1.4.400 wave 1 cannot buy III')
  assert.equal(applyBoost('logic', { logic: 1 }, 1).ok, true, '1.4.400 Hard still buys II for one spark')
  assert.equal(buyExtraLamp(4).ok, false)
  assert.equal(buyExtraLamp(5).sparks, 0)
  const income = [0, 1, 2, 3, 4].map((wave) => wavePackSize(wave))
  assert.deepEqual(income, [4, 4, 5, 5, 8])
  const bothMax = easyTierCost(1) * 2 + easyTierCost(2) * 2
  assert.equal(bothMax, 18)
  assert.ok(income[0] < bothMax, '1.4.400 two free lamps cannot both reach Max off wave 1')
  const bank = income.reduce((sum, pay) => sum + pay, 0) - bothMax - EASY_LAMP_COST - easyTierCost(1)
  assert.ok(bank < 20, '1.4.400 a normal spend does not bank 20 sparks')
  assert.equal(bank, 0, '1.4.400 maxing two lamps, buying one, and raising it spends the night')
  let sparks = 0
  const tiers = [1, 1]
  income.forEach((pay) => {
    sparks += pay
    let spent = false
    const cheap = tiers
      .map((tier, index) => ({ index, cost: easyTierCost(tier) }))
      .filter((step) => step.cost > 0 && step.cost <= sparks)
      .sort((a, b) => a.cost - b.cost)[0]
    if (cheap) {
      sparks -= cheap.cost
      tiers[cheap.index] += 1
      spent = true
    } else if (tiers.length < 4 && sparks >= EASY_LAMP_COST) {
      sparks -= EASY_LAMP_COST
      tiers.push(1)
      spent = true
    }
    assert.equal(spent, true, '1.4.400 every wave clear can spend')
  })
  assert.ok(sparks < 20, '1.4.400 the greedy night stays under 20 sparks')
  assert.match(defendSrc396, /buyExtraLamp\(sparksRef\.current\)/, '1.4.400 a new lamp spends sparks')
  assert.match(
    defendSrc396,
    /applyBoost\(id, runTierRef\.current, sparksRef\.current, false\)/,
    '1.4.400 Hard upgrades still spend one spark',
  )
  assert.match(defendSrc396, /placeArmRef/, '1.4.400 a paid plant is armed, not the old rings')
  assert.match(ability396, /paidPlace && !placed/, '1.4.400 an unplanted card places instead of upgrading')
  assert.match(ability396, /onBoost\(tool\.id\)/, '1.4.400 a planted card can still upgrade')
  assert.match(card396, /boostCost\(tier\)/, '1.4.400 Hard card still prices one spark')
  assert.match(board396, /clampGhostHintLeft/, '1.4.400 the reach note stays on screen')
  assert.ok(clampGhostHintLeft(360, 375) + 96 <= 375 - 8, '1.4.400 Too far from the road clears the right edge')
  assert.equal(clampGhostHintLeft(180, 375), 180, '1.4.400 a centered note stays put')
  assert.match(defendSrc396, /finishPlace\(/, '1.4.400 drag and tap share one plant')
  assert.ok(CHANGELOG.some((note) => note.version === '1.4.400'), '1.4.400 changelog row')
  assert.match(latestChange('1.4.400').title, /spark/)
  assert.match(latestChange('1.4.400').items.join('\n'), /3 sparks/)
  assert.match(latestChange('1.4.400').items.join('\n'), /5 sparks/)
  assert.doesNotMatch(
    latestChange('1.4.400').items.join('\n'),
    /Fixes #|Closes #|Resolves #|monkey|balloon/i,
    '1.4.400 changelog avoids GitHub close keywords',
  )
}

// Night Watch 1.4.402: the first six Easy rounds. Later slices append; they do not retune these.
{
  assert.deepEqual(
    EASY_ROUNDS.slice(0, 6).map((round) => round.count),
    [4, 4, 5, 5, 6, 6],
    '1.4.402 walker counts rise and round 1 still pays 4',
  )
  assert.deepEqual(
    EASY_ROUNDS.slice(0, 6).map((round) => [round.speed, round.hp, round.spawn]),
    [
      [1, 0, 1],
      [1.35, 0, 0.95],
      [1.8, 1, 0.9],
      [2.6, 2, 0.85],
      [5.5, 3, 0.75],
      [6.4, 7, 0.72],
    ],
    '1.4.402 the first six rounds stay put',
  )
  assert.equal(nightLength(false), DEFEND_NIGHT_WAVES, '1.4.402 Hard stays five waves')
  for (let index = 1; index < 6; index += 1) {
    assert.ok(EASY_ROUNDS[index].speed >= EASY_ROUNDS[index - 1].speed)
    assert.ok(EASY_ROUNDS[index].hp >= EASY_ROUNDS[index - 1].hp)
    assert.ok(EASY_ROUNDS[index].spawn <= EASY_ROUNDS[index - 1].spawn)
  }
  assert.equal(waveCombat(0, true).size, 4)
  assert.equal(waveCombat(0, true).hpBonus, 0)
  assert.equal(waveCombat(4, false).speedScale, 1, '1.4.402 Hard speed stays flat')
  assert.equal(waveCombat(4, false).hpBonus, 0, '1.4.402 Hard HP stays flat')
  assert.equal(roundMark(2, 6, true), 'Round 3 of 6')
  assert.equal(roundMark(2, 5, false), 'Wave 3/5')
  for (let index = 0; index < 4; index += 1) {
    assert.equal(scoreEasyRoad(index, [1, 1], 0), 'clear', `1.4.402 round ${index + 1} holds on Level I`)
  }
  assert.equal(scoreEasyRoad(4, [1, 1], 0), 'lost', '1.4.402 round 5 leaks without taps')
  assert.equal(scoreEasyRoad(4, [1, 1], 1), 'clear', '1.4.402 round 5 holds when Level I taps')
  assert.equal(scoreEasyRoad(4, [2, 1], 1), 'clear', '1.4.402 round 5 holds with a Level II lamp')
  assert.equal(scoreEasyRoad(5, [1, 1], 0), 'lost', '1.4.402 round 6 fails at Level I')
  assert.equal(scoreEasyRoad(5, [1, 1], 1), 'lost', '1.4.402 round 6 still fails when Level I taps')
  assert.equal(scoreEasyRoad(5, [2, 1], 1), 'clear', '1.4.402 round 6 holds with one Level II lamp')
  const pay = EASY_ROUNDS.slice(0, 6).map((round) => round.count)
  let sparks = 0
  const tiers = [1, 1]
  for (const income of pay) {
    sparks += income
    let spent = false
    const cheap = tiers
      .map((tier, index) => ({ index, cost: easyTierCost(tier) }))
      .filter((step) => step.cost > 0 && step.cost <= sparks)
      .sort((a, b) => a.cost - b.cost)[0]
    if (cheap) {
      sparks -= cheap.cost
      tiers[cheap.index] += 1
      spent = true
    } else if (tiers.length < 4 && sparks >= EASY_LAMP_COST) {
      sparks -= EASY_LAMP_COST
      tiers.push(1)
      spent = true
    }
    assert.equal(spent, true, '1.4.402 every round clear can spend')
  }
  assert.ok(sparks < 20, '1.4.402 a spending night stays under 20 sparks')
  assert.match(
    readFileSync(new URL('../src/styles/defend.css', import.meta.url), 'utf8'),
    /\.defend-page\.is-easy-watch \.nw-wave-overlay \.defend-wave \{[^}]*font-size:\s*16px/,
    '1.4.402 the round label is readable on the phone',
  )
  assert.match(
    readFileSync(new URL('../src/components/DefendScreen.tsx', import.meta.url), 'utf8'),
    /The night held after round/,
  )
  assert.ok(CHANGELOG.some((note) => note.version === '1.4.402'), '1.4.402 changelog row')
  assert.match(latestChange('1.4.402').title, /round/i)
  assert.doesNotMatch(
    latestChange('1.4.402').items.join('\n'),
    /Fixes #|Closes #|Resolves #/,
    '1.4.402 changelog avoids GitHub close keywords',
  )
}

// Night Watch 1.4.404: Easy climbs to 25 rounds. R1–R6 stay the 1.4.402 table.
{
  assert.equal(EASY_ROUNDS.length, 25, '1.4.404 Easy is 25 rounds')
  assert.equal(nightLength(true), 25)
  assert.equal(nightLength(false), DEFEND_NIGHT_WAVES, '1.4.404 Hard stays five waves')
  assert.equal(roundMark(11, 25, true), 'Round 12 of 25')
  assert.equal(roundMark(24, 25, true), 'Round 25 of 25')
  assert.ok(EASY_ROUNDS.every((round) => round.speed <= EASY_ROUND_SPEED_CAP))
  assert.equal(EASY_ROUNDS[24].speed, EASY_ROUND_SPEED_CAP)
  for (const index of [7, 11, 15, 19, 23]) {
    const prev = EASY_ROUNDS[index - 1]
    const rest = EASY_ROUNDS[index]
    assert.ok(rest.count <= prev.count && rest.speed <= prev.speed && rest.hp <= prev.hp && rest.spawn >= prev.spawn)
    assert.ok(rest.count < prev.count || rest.speed < prev.speed || rest.hp < prev.hp || rest.spawn > prev.spawn)
  }
  assert.equal(scoreEasyRoad(6, [3, 3, 2], 1), 'clear', '1.4.404 round 7 holds for the build that just left round 6')
  assert.equal(scoreEasyRoad(9, [2, 2], 1), 'lost', '1.4.404 round 10 leaks on two Level II lamps')
  assert.equal(scoreEasyRoad(9, [3, 3], 1), 'clear', '1.4.404 round 10 holds on two Level III lamps')
  assert.equal(scoreEasyRoad(9, [2, 2, 2, 2], 1), 'clear', '1.4.404 round 10 holds on four Level II lamps')
  assert.equal(scoreEasyRoad(9, [1, 1, 1, 1], 1), 'lost', '1.4.404 round 10 leaks on four Level I lamps')
  assert.equal(scoreEasyRoad(14, [2, 2, 2, 2], 1), 'lost', '1.4.404 round 15 leaks on four Level II lamps')
  assert.equal(scoreEasyRoad(14, [3, 3], 1), 'lost', '1.4.404 round 15 leaks on two Level III lamps')
  assert.equal(scoreEasyRoad(14, [3, 3, 3], 1), 'lost', '1.4.404 round 15 leaks without the fourth lamp')
  assert.equal(scoreEasyRoad(14, [3, 3, 3, 2], 1), 'clear', '1.4.404 round 15 holds with three Level III and one Level II')
  assert.equal(scoreEasyRoad(14, [3, 3, 3, 3], 1), 'clear', '1.4.404 round 15 holds with four Level III lamps')
  assert.equal(scoreEasyRoad(19, [2, 2, 2, 2], 1), 'lost', '1.4.404 round 20 still leaks on four Level II lamps')
  assert.equal(scoreEasyRoad(19, [3, 3, 3], 1), 'clear', '1.4.404 round 20 is a breather for three Level III lamps')
  assert.equal(scoreEasyRoad(19, [3, 3, 3, 2], 1), 'clear', '1.4.404 round 20 holds with three Level III and one Level II')
  assert.equal(scoreEasyRoad(19, [3, 3, 3, 3], 1), 'clear', '1.4.404 round 20 holds with four Level III lamps')
  assert.equal(scoreEasyRoad(24, [2, 2, 2, 2], 1), 'lost', '1.4.404 round 25 leaks on four Level II lamps')
  assert.equal(scoreEasyRoad(24, [3, 3, 3], 1), 'lost', '1.4.404 round 25 leaks without the fourth lamp')
  assert.equal(scoreEasyRoad(24, [3, 3, 3, 2], 1), 'lost', '1.4.404 round 25 leaks if one lamp is still Level II')
  assert.equal(scoreEasyRoad(24, [3, 3, 3, 3], 1), 'clear', '1.4.404 round 25 holds with four Level III lamps')
  let sparks = 0
  const tiers = [1, 1]
  for (let index = 0; index < 12; index += 1) {
    sparks += EASY_ROUNDS[index].count
    const cheap = tiers
      .map((tier, lamp) => ({ lamp, cost: easyTierCost(tier) }))
      .filter((step) => step.cost > 0 && step.cost <= sparks)
      .sort((a, b) => a.cost - b.cost)[0]
    if (cheap) {
      sparks -= cheap.cost
      tiers[cheap.lamp] += 1
    } else if (tiers.length < 4 && sparks >= EASY_LAMP_COST) {
      sparks -= EASY_LAMP_COST
      tiers.push(1)
    }
    assert.ok(sparks < 20, `1.4.404 the retired linear prices stay under 20 sparks after round ${index + 1}`)
  }
  assert.deepEqual(tiers, [3, 3, 3, 3], '1.4.404 the retired linear prices max by round 12')
  assert.match(
    readFileSync(new URL('../src/components/DefendScreen.tsx', import.meta.url), 'utf8'),
    /Reached round \$\{waveIndex \+ 1\}\. You missed\. Tap the face\./,
  )
  assert.match(
    readFileSync(new URL('../src/styles/defend.css', import.meta.url), 'utf8'),
    /\.defend-page\.is-easy-watch \.nw-docks \.defend-lost p \{[^}]*font-size:\s*16px/,
  )
  assert.ok(CHANGELOG.some((note) => note.version === '1.4.404'), '1.4.404 changelog row')
  assert.match(latestChange('1.4.404').title, /25/)
  assert.doesNotMatch(
    latestChange('1.4.404').items.join('\n'),
    /Fixes #|Closes #|Resolves #/,
    '1.4.404 changelog avoids GitHub close keywords',
  )
}

// Night Watch 1.4.405: Easy 2-path tree. Hard stays on the linear spark bump.
{
  const zero = { far: 0, strong: 0 }
  const strong = (n) => ({ far: 0, strong: n })
  const far = (n) => ({ far: n, strong: 0 })
  assert.deepEqual(TREE_STEP_COST, [3, 6, 12], '1.4.405 steps cost 3, then 6, then 12')
  assert.equal(canTake(zero, 'strong').cost, 3)
  assert.equal(canTake(zero, 'far').cost, 3)
  assert.equal(canTake({ far: 0, strong: 1 }, 'strong').cost, 6)
  assert.equal(canTake({ far: 0, strong: 2 }, 'strong').cost, 12)
  assert.equal(canTake({ far: 3, strong: 1 }, 'strong').ok, false)
  assert.equal(canTake({ far: 3, strong: 1 }, 'far').ok, false)
  assert.equal(canTake({ far: 3, strong: 0 }, 'strong').ok, true, '1.4.405 the short path can still take step 1')
  assert.equal(canTake({ far: 3, strong: 1 }, 'strong').reason, TREE_LOCK)
  assert.equal(stepLocked({ far: 3, strong: 0 }, 'strong', 1), false)
  assert.equal(stepLocked({ far: 3, strong: 0 }, 'strong', 2), true)
  assert.equal(stepLocked({ far: 3, strong: 0 }, 'strong', 3), true)
  assert.equal(canTake({ far: 2, strong: 2 }, 'far').ok, false, '1.4.405 a lamp cannot be 2 and 2')
  const first = applyPathStep('love', freshRunPaths(), 4, 'strong')
  assert.equal(first.ok, true)
  assert.equal(first.sparks, 1)
  assert.equal(first.paths.love.strong, 1)
  assert.equal(applyPathStep('love', first.paths, first.sparks, 'strong').ok, false, '1.4.405 step 2 needs 6')
  assert.equal(lampStrike(zero).damage, 1)
  assert.equal(lampStrike(zero).rangeBonus, 0)
  assert.equal(lampStrike(zero).cooldownMs, 700)
  assert.equal(lampStrike(strong(1)).damage, 1)
  assert.equal(lampStrike(strong(1)).splash, 1)
  assert.equal(lampStrike(strong(2)).damage, 2)
  assert.equal(lampStrike(strong(3)).damage, 3)
  assert.equal(lampStrike(far(1)).rangeBonus, 0)
  assert.equal(lampStrike(far(1)).outer, 1)
  assert.equal(lampStrike(far(2)).rangeBonus, 24)
  assert.equal(lampStrike(far(3)).rangeBonus, 40)
  assert.equal(lampStrike(far(3)).damage, 2)
  assert.equal(applyBoost('logic', { logic: 1 }, 1).ok, true, '1.4.405 Hard still buys a step for one spark')
  for (let index = 0; index < 4; index += 1) {
    assert.equal(scoreEasyTree(index, [zero, zero], 0), 'clear', `1.4.405 round ${index + 1} holds with no steps`)
  }
  assert.equal(scoreEasyTree(4, [zero, zero], 0), 'lost', '1.4.405 round 5 leaks without taps')
  assert.equal(scoreEasyTree(4, [zero, zero], 1), 'clear', '1.4.405 round 5 holds when taps')
  assert.equal(scoreEasyTree(5, [zero, zero], 1), 'lost', '1.4.405 round 6 fails with no steps')
  assert.equal(scoreEasyTree(5, [strong(1), strong(1)], 1), 'lost', '1.4.405 round 6 fails on Strong step 1')
  assert.equal(scoreEasyTree(5, [far(1), far(1)], 1), 'lost', '1.4.405 round 6 fails on Far step 1')
  assert.equal(scoreEasyTree(5, [strong(2), zero], 0), 'lost', '1.4.405 round 6 still needs taps')
  assert.equal(scoreEasyTree(5, [strong(2), zero], 1), 'clear', '1.4.405 one Strong step 2 holds round 6')
  assert.equal(scoreEasyTree(5, [far(2), zero], 0), 'lost', '1.4.405 Far step 2 still needs taps')
  assert.equal(scoreEasyTree(5, [far(2), zero], 1), 'clear', '1.4.405 one Far step 2 holds round 6')
  assert.equal(scoreEasyTree(9, [strong(2), strong(2)], 1), 'lost', '1.4.405 round 10 leaks on two Strong step 2 lamps')
  assert.equal(scoreEasyTree(9, [strong(2), strong(2), strong(2)], 1), 'clear', '1.4.405 round 10 holds on three Strong step 2 lamps')
  assert.equal(scoreEasyTree(14, [strong(2), strong(2), strong(2), strong(2)], 1), 'lost', '1.4.405 round 15 leaks if every lamp stopped at step 2')
  assert.equal(scoreEasyTree(14, [strong(3), strong(3), strong(3)], 1), 'clear', '1.4.405 round 15 holds on three Strong step 3 lamps')
  assert.equal(scoreEasyTree(24, [strong(3), strong(3), strong(3)], 1), 'lost', '1.4.405 round 25 leaks without the fourth lamp')
  assert.equal(scoreEasyTree(24, [strong(3), strong(3), strong(3), strong(3)], 1), 'clear', '1.4.405 round 25 holds on four Strong step 3 lamps')
  assert.equal(scoreEasyTree(24, [far(3), far(3), far(3)], 1), 'lost', '1.4.405 round 25 leaks on three Far step 3 lamps')
  assert.equal(scoreEasyTree(24, [far(3), far(3), far(3), far(3)], 1), 'clear', '1.4.405 round 25 holds on four Far step 3 lamps')
  const spent = spendTreeNight(EASY_ROUNDS.map((round) => round.count), EASY_LAMP_COST)
  assert.equal(spent.doneAt, 18, '1.4.405 a spender finishes on round 18')
  for (const row of spent.rows) {
    if (row.round <= 18) assert.ok(row.sparks < 20, `1.4.405 bank stays under 20 after round ${row.round}`)
  }
  assert.equal(spent.rows[17].open, false)
  assert.ok(spent.rows[16].open, '1.4.405 round 17 still has a step to buy')
  const enter = (round) => spent.rows[round - 2].lamps
  assert.equal(scoreEasyTree(5, enter(6), 1), 'clear', '1.4.405 the spender holds round 6')
  assert.equal(scoreEasyTree(9, enter(10), 1), 'clear', '1.4.405 the spender holds round 10')
  assert.equal(scoreEasyTree(14, enter(15), 1), 'clear', '1.4.405 the spender holds round 15')
  assert.equal(scoreEasyTree(24, enter(25), 1), 'clear', '1.4.405 the spender holds round 25')
  assert.match(
    readFileSync(new URL('../src/components/DefendTowerCard.tsx', import.meta.url), 'utf8'),
    /data-upgrade-tree="yes"/,
  )
  assert.match(
    readFileSync(new URL('../src/components/DefendScreen.tsx', import.meta.url), 'utf8'),
    /applyPathStep\(/,
  )
  assert.match(
    readFileSync(new URL('../src/components/DefendAbilityBar.tsx', import.meta.url), 'utf8'),
    /onOpenTree\?\.\(tool\.id\)/,
  )
  assert.match(
    readFileSync(new URL('../src/styles/defend.css', import.meta.url), 'utf8'),
    /\.defend-path-pip\.is-locked/,
  )
  assert.ok(CHANGELOG.some((note) => note.version === '1.4.405'), '1.4.405 changelog row')
  assert.match(latestChange('1.4.405').title, /path/i)
  assert.match(latestChange('1.4.405').items.join('\n'), /3, then 6, then 12/)
  assert.doesNotMatch(
    latestChange('1.4.405').items.join('\n'),
    /Fixes #|Closes #|Resolves #/,
    '1.4.405 changelog avoids GitHub close keywords',
  )
}

// Night Watch 1.4.406: Easy round 25 unlocks the Far Hills teaser. Hard stays on the old win.
{
  assert.equal(nightWatchRoundJump('?playtest=1&nwRound=25', 25, true), 24, '1.4.406 round 25 is wave index 24')
  assert.equal(nightWatchRoundJump('?nwRound=25', 25, false), null, '1.4.406 a normal visit ignores nwRound')
  assert.equal(nightWatchRoundJump('?nwRound=26', 25, true), null, '1.4.406 nwRound stays inside the night')
  assert.equal(nightWatchRoundJump('?nwRound=0', 25, true), null, '1.4.406 round 0 is not a jump')
  const opened = normalizeProgress({ defense: { cleared: 1, nights: [], farHills: true } })
  assert.equal(opened.defense.farHills, true, '1.4.406 the Far Hills flag loads')
  const plain = normalizeProgress({ defense: { cleared: 1, nights: [] } })
  assert.notEqual(plain.defense.farHills, true, '1.4.406 an old save is not unlocked')
  const junk = normalizeProgress({ defense: { cleared: 1, nights: [], farHills: 'yes' } })
  assert.notEqual(junk.defense.farHills, true, '1.4.406 only a real true flag unlocks')
  const screen406 = readFileSync(new URL('../src/components/DefendScreen.tsx', import.meta.url), 'utf8')
  assert.match(screen406, /The night held after round/)
  assert.match(screen406, /readNightWatchRoundJump\(nightLength\(true\)\)/)
  assert.match(screen406, /recordNight\(today, easy\)/)
  const hills406 = readFileSync(new URL('../src/nightWatch/farHills.ts', import.meta.url), 'utf8')
  assert.match(hills406, /New place unlocked!/)
  assert.match(hills406, /The Far Hills/)
  assert.match(hills406, /Coming soon/)
  assert.match(
    readFileSync(new URL('../src/components/Hub.tsx', import.meta.url), 'utf8'),
    /nw-area-badge/,
  )
  assert.match(
    readFileSync(new URL('../src/styles/defend.css', import.meta.url), 'utf8'),
    /\.nw-far-hills-home/,
  )
  assert.ok(CHANGELOG.some((note) => note.version === '1.4.406'), '1.4.406 changelog row')
  assert.match(latestChange('1.4.406').title, /Far Hills/)
  assert.doesNotMatch(
    latestChange('1.4.406').items.join('\n'),
    /Fixes #|Closes #|Resolves #/,
  )
}

// Night Watch 1.4.407: nwRound only with playtest=1 on this URL, or debug freeze explicitly on.
{
  const proveUrl = '?cb=burn406e&nwRound=25'
  assert.equal(nightWatchJumpAllowed(proveUrl, false), false, '1.4.407 the prove URL is not a pass')
  assert.equal(
    nightWatchRoundJump(proveUrl, 25, nightWatchJumpAllowed(proveUrl, false)),
    null,
    '1.4.407 nwRound without playtest=1 stays at round 1',
  )
  assert.equal(nightWatchJumpAllowed('?playtest=1&nwRound=25', false), true, '1.4.407 playtest=1 allows the jump')
  assert.equal(
    nightWatchRoundJump('?playtest=1&nwRound=25', 25, nightWatchJumpAllowed('?playtest=1&nwRound=25', false)),
    24,
    '1.4.407 playtest=1 opens round 25',
  )
  assert.equal(nightWatchJumpAllowed('?nwRound=25', true), true, '1.4.407 debug freeze on allows the jump')
  assert.equal(
    nightWatchRoundJump('?nwRound=25', 25, nightWatchJumpAllowed('?nwRound=25', true)),
    24,
    '1.4.407 debug freeze on opens round 25',
  )
  assert.equal(nightWatchJumpAllowed('?nwRound=25', false), false, '1.4.407 neither flag ignores nwRound')
  assert.equal(nightWatchJumpAllowed('?playtest=true&nwRound=25', false), false, '1.4.407 playtest=true is not a pass')
  assert.equal(
    nightWatchRoundJump('?nwRound=25', 25, nightWatchJumpAllowed('?nwRound=25', false)),
    null,
    '1.4.407 a later URL does not keep an old playtest flag',
  )
  const gateSrc = readFileSync(new URL('../src/lib/nightWatchDebug.ts', import.meta.url), 'utf8')
  assert.doesNotMatch(gateSrc, /import\.meta\.env/, '1.4.407 the jump does not read the dev flag')
  assert.match(gateSrc, /get\('playtest'\) === '1'/)
  assert.ok(CHANGELOG.some((note) => note.version === '1.4.407'), '1.4.407 changelog row')
  assert.doesNotMatch(latestChange('1.4.407').items.join('\n'), /Fixes #|Closes #|Resolves #/)
}

// Night Watch 1.4.392: reach cue, a longer level-I free lamp, and a plant pin.
{
  const actors392 = readFileSync(new URL('../src/components/DefendNightActors.tsx', import.meta.url), 'utf8')
  const board392 = readFileSync(new URL('../src/components/DefendNightBoard.tsx', import.meta.url), 'utf8')
  const defendSrc392 = readFileSync(new URL('../src/components/DefendScreen.tsx', import.meta.url), 'utf8')
  const css392 = readFileSync(new URL('../src/styles/defend.css', import.meta.url), 'utf8')
  const placeSrc392 = readFileSync(new URL('../src/lib/lampPlace.ts', import.meta.url), 'utf8')
  const tier = freshRunTier()
  const progress = emptyProgress()
  assert.equal(FREE_LAMP_RANGE_BONUS, 18, '1.4.392 free lamps add 18 to every tier')
  assert.equal(abilityRange('love', 'empty', progress, tier), 96, '1.4.392 city seats stay at 96')
  assert.equal(96 + FREE_LAMP_RANGE_BONUS - LAMP_ROAD_OVERLAP, 90, '1.4.392 level I covers a 90 gap')
  assert.equal(LAMP_DRAG_LIFT_PX, 0, '1.4.400 the drag no longer lifts the lamp off the finger')
  assert.equal(LAMP_TOO_FAR, 'Too far from the road')

  function offsetPoint(t, dist, sign) {
    const a = pathPoint(Math.max(0, t - 0.004))
    const b = pathPoint(Math.min(1, t + 0.004))
    const dx = b.x - a.x
    const dy = b.y - a.y
    const len = Math.hypot(dx, dy) || 1
    const p = pathPoint(t)
    return { x: p.x + (-dy / len) * dist * sign, y: p.y + (dx / len) * dist * sign }
  }
  function findSeat(minGap, maxGap) {
    for (let t = 0.08; t <= 0.92; t += 0.02) {
      for (const sign of [1, -1]) {
        for (let dist = minGap; dist <= maxGap; dist += 4) {
          const point = offsetPoint(t, dist, sign)
          if (point.x < 24 || point.y < 24 || point.x > 774 || point.y > 1110) continue
          const gap = pathClearance(point)
          if (gap < minGap || gap > maxGap) continue
          if (lampSpotBlocked(point)) continue
          return point
        }
      }
    }
    return null
  }

  const beside = findSeat(52, 70)
  assert.ok(beside, '1.4.392 open ground sits beside the road')
  const near = previewLamp(beside, 'love', progress, tier)
  assert.equal(near.blocked, false)
  assert.equal(near.reaches, true, '1.4.392 a lamp beside the road reaches')
  assert.equal(near.range, 96 + FREE_LAMP_RANGE_BONUS, '1.4.392 level I free range is 114')
  assert.equal(
    nightTowersMod.range(near.spot, 'love', progress, { love: 2 }),
    114 + FREE_LAMP_RANGE_BONUS,
    '1.4.392 level II stays 18 above level I',
  )
  assert.equal(
    nightTowersMod.range(near.spot, 'love', progress, { love: 3 }),
    132 + FREE_LAMP_RANGE_BONUS,
    '1.4.392 level III stays 18 above level II',
  )
  assert.equal(roadCoverD(near.at, near.range), near.road)
  assert.match(near.road, /^M/, '1.4.392 the reached stretch is a road path')
  const cover = near.road.match(/-?\d+\.?\d*/g).map(Number)
  assert.ok(
    Math.hypot(cover[0] - near.at.x, cover[1] - near.at.y) <= near.range + 0.2,
    '1.4.392 the highlighted road sits inside the combat ring',
  )
  assert.equal(lampReachesRoad(near.at, near.range), true)

  const band = findSeat(78, 88)
  assert.ok(band, '1.4.392 open ground sits about 40px off the path')
  const mid = previewLamp(band, 'love', progress, tier)
  assert.equal(mid.blocked, false)
  assert.equal(mid.reaches, true, '1.4.392 a lamp up to ~45 CSS px still reaches')
  assert.ok(pathClearance(mid.at) <= 90)

  const farPoint = findSeat(130, 170)
  assert.ok(farPoint, '1.4.392 open ground sits far from the road')
  const far = previewLamp(farPoint, 'love', progress, tier)
  assert.equal(far.blocked, false, '1.4.392 a far lamp is still allowed')
  assert.equal(far.reaches, false, '1.4.392 a far lamp does not reach')
  assert.equal(far.road, '')
  const plantedFar = commitLamp({}, farPoint, 'love', progress, tier)
  assert.equal(plantedFar.ok, true, '1.4.392 too far still plants')

  const road = pathPoint(0.45)
  const refused = previewLamp(road, 'love', progress, tier)
  assert.equal(refused.blocked, true, '1.4.392 the road is still a red no-go')
  assert.equal(refused.reaches, false)
  assert.equal(commitLamp({}, road, 'love', progress, tier).ok, false)

  assert.ok(
    nightTowersMod.range('bench', 'logic', progress, tier) < pathClearance(DEFEND_ANCHOR.bench),
    '1.4.392 Witness Square stays short of the road',
  )
  assert.match(actors392, /data-plant-pin="yes"/)
  assert.match(actors392, /data-road-cover="yes"/)
  assert.match(actors392, /data-reaches=/)
  assert.match(actors392, /is-nogo/)
  assert.match(actors392, /data-lamp-ghost=\{ghost\.blocked \? 'nogo' : 'open'\}/)
  assert.match(board392, /ghost\.note/)
  assert.match(placeSrc392, /export function roadCoverD/)
  assert.match(defendSrc392, /dragGhostClient/)
  assert.match(defendSrc392, /const awaitingLamp = planted\.length < 1/)
  assert.match(defendSrc392, /EASY\.nightPlantFirst/)
  assert.match(css392, /1\.4\.392: gold ring when the combat range meets the road/)
  assert.match(css392, /\.defend-ghost\.is-short \.defend-ghost-ring \{[^}]*rgba\(232, 140, 36/)
  assert.match(css392, /\.defend-ghost\.is-nogo \.defend-ghost-ring \{[^}]*rgba\(226, 48, 64/)
  assert.match(css392, /1\.4\.389: Begin follows the planted count/, '1.4.392 keeps Begin on the planted count')
  assert.match(css392, /\.defend-plant-shadow \{[^}]*rgba\(36, 12, 64/)
  assert.doesNotMatch(css392.slice(css392.indexOf('1.4.392:')), /#fff|background:\s*#fff|background:\s*white/)
  assert.equal(WATCH_TOOLS.length, 4, '1.4.392 does not add a rail tool')
  assert.ok(CHANGELOG.some((note) => note.version === '1.4.392'), '1.4.392 changelog row')
  assert.match(latestChange('1.4.392').title, /road/)
  assert.match(latestChange('1.4.392').items.join('\n'), /Too far from the road/)
  assert.match(latestChange('1.4.392').items.join('\n'), /gold dot/)
  assert.doesNotMatch(
    latestChange('1.4.392').items.join('\n'),
    /Fixes #|Closes #|Resolves #|monkey|balloon/i,
    '1.4.392 changelog avoids GitHub close keywords',
  )
}

// Night Watch 1.4.381: unlockable 3× speed. Starts at 1×. Locked until wave 3. Player taps it on.
{
  const defendCss381 = readFileSync(new URL('../src/styles/defend.css', import.meta.url), 'utf8')
  const paceUi = readFileSync(
    new URL('../src/components/NightPaceControl.tsx', import.meta.url),
    'utf8',
  )
  assert.equal(PACE_UNLOCK_WAVE, 2, '1.4.381 3× opens on wave 3, after Still and Mend')
  assert.equal(paceUnlocked(0), false, '1.4.381 wave 1 stays locked')
  assert.equal(paceUnlocked(1), false, '1.4.381 wave 2 stays locked')
  assert.equal(paceUnlocked(2), true)
  assert.equal(paceFace(false, true), 'locked', '1.4.381 a locked wave cannot start fast')
  assert.equal(paceFace(true, false), 'open')
  assert.equal(paceFace(true, true), 'fast')
  assert.equal(paceScale(false, true), NIGHT_PACE_NORMAL)
  assert.equal(paceScale(true, false), NIGHT_PACE_NORMAL, '1.4.381 unlock does not force 3×')
  assert.equal(paceScale(true, true), NIGHT_PACE_FAST)
  assert.equal(NIGHT_PACE_FAST, 3)
  assert.equal(paceRateLabel('locked'), '3×')
  assert.equal(paceRateLabel('open'), '1×')
  assert.equal(paceRateLabel('fast'), '3×')
  assert.equal(paceNote('locked'), 'Locked')
  assert.equal(paceNote('open'), 'Available')
  assert.equal(paceNote('fast'), 'Active')
  assert.match(paceAria('locked'), /Locked until wave 3/)
  assert.match(paceAria('open'), /1×/)
  assert.match(paceAria('fast'), /3× active/)
  assert.ok(Math.abs(pacedDt(0.016, 1) - 0.016) < 1e-9)
  assert.equal(pacedDt(0.1, 1), 0.05, '1.4.381 1× keeps the old step cap')
  assert.ok(Math.abs(pacedDt(0.016, 3) - 0.048) < 1e-9)
  assert.ok(Math.abs(pacedDt(0.1, 3) - 0.15) < 1e-9, '1.4.381 3× stretches the capped step')
  assert.equal(pacedDt(-1, 3), 0)
  assert.equal(pacedCooldown(700, 1), 700)
  assert.ok(Math.abs(pacedCooldown(700, 3) - 700 / 3) < 0.001)
  assert.equal(pacedCooldown(700, 9), 700, '1.4.381 unknown scales stay at 1×')
  assert.match(defendScreenOnlySrc, /const \[fastOn, setFastOn\] = useState\(false\)/)
  assert.match(defendScreenOnlySrc, /paceScale\(paceUnlocked\(waveIndexRef\.current\), fastOnRef\.current\)/)
  assert.match(defendScreenOnlySrc, /pacedDt\(wallDt, pace\)/)
  assert.match(defendScreenOnlySrc, /pacedCooldown\(nightTowers\.cooldown/)
  assert.match(defendScreenOnlySrc, /showPace = easy && \(phase === 'wave' \|\| phase === 'boost'\) && !won/)
  assert.match(defendScreenOnlySrc, /NightPaceControl/)
  assert.match(defendScreenOnlySrc, /fastOnRef\.current = false/)
  assert.match(paceUi, /data-state=\{face\}/)
  assert.match(paceUi, /paceUnlocked/)
  assert.match(defendCss381, /1\.4\.381: unlockable 3× speed/)
  assert.match(defendCss381, /\.nw-pace\.is-locked/)
  assert.match(defendCss381, /\.nw-pace\.is-open/)
  assert.match(defendCss381, /\.nw-pace\.is-fast/)
  assert.match(defendCss381, /1\.4\.380: skills pack/, '1.4.381 keeps the skill pack')
  assert.match(defendCss381, /1\.4\.379: Easy phone SE chrome/, '1.4.381 keeps the phone chrome rules')
  assert.match(defendCss381, /1\.4\.378: Easy plant rings/, '1.4.381 keeps the gold plant rings')
  assert.doesNotMatch(
    defendAbilitySrc,
    /NightPace|paceScale|fastOn/,
    '1.4.381 speed stays off the tower rail',
  )
  assert.equal(WATCH_TOOLS.length, 4, '1.4.381 does not add a rail tool')
  assert.deepEqual(
    [0, 1, 2, 3, 4].map((wave) => skillUnlockOnWave(wave)),
    ['still', 'mend', null, null, null],
    '1.4.381 skills still open one per wave',
  )
  assert.ok(CHANGELOG.some((note) => note.version === '1.4.381'), '1.4.381 changelog row')
  assert.match(latestChange('1.4.381').title, /3×/)
  assert.match(latestChange('1.4.381').items.join('\n'), /normal speed/)
  assert.match(latestChange('1.4.381').items.join('\n'), /wave 3/)
  assert.match(latestChange('1.4.381').items.join('\n'), /Locked/)
  assert.match(latestChange('1.4.381').items.join('\n'), /Available/)
  assert.match(latestChange('1.4.381').items.join('\n'), /Active/)
  assert.doesNotMatch(
    latestChange('1.4.381').items.join('\n'),
    /Fixes #|Closes #|Resolves #|monkey|balloon/i,
    '1.4.381 changelog avoids GitHub close keywords',
  )
}

// Night Watch 1.4.380: skills pack — recharge taps, Mend power, unlock one at a time, first-unlock splash.
{
  const defendCss380 = readFileSync(new URL('../src/styles/defend.css', import.meta.url), 'utf8')
  const splash380 = readFileSync(
    new URL('../src/components/NightSkillSplash.tsx', import.meta.url),
    'utf8',
  )
  const tray380 = readFileSync(
    new URL('../src/components/NightSkillTray.tsx', import.meta.url),
    'utf8',
  )
  assert.deepEqual(
    [0, 1, 2, 3, 4].map((wave) => skillUnlockOnWave(wave)),
    ['still', 'mend', null, null, null],
    '1.4.380 skills open one per wave',
  )
  assert.equal(skillUnlocked('still', 0), true)
  assert.equal(skillUnlocked('mend', 0), false, '1.4.380 Mend stays locked on wave 1')
  assert.equal(skillUnlocked('mend', 1), true)
  assert.equal(SKILL_UNLOCK_WAVE.still, 0)
  assert.equal(SKILL_UNLOCK_WAVE.mend, 1)
  assert.ok(SKILL_COOLDOWN_MS.still >= 8_000 && SKILL_COOLDOWN_MS.still <= 20_000)
  assert.ok(SKILL_COOLDOWN_MS.mend >= 8_000 && SKILL_COOLDOWN_MS.mend <= 20_000)
  assert.ok(MEND_SHIELD_MS >= 3_000 && MEND_SHIELD_MS <= 5_000, '1.4.380 Mend holds the gate')
  const now = 5_000
  assert.equal(skillFace(false, 0, now), 'locked')
  assert.equal(skillFace(true, 0, now), 'ready')
  assert.equal(skillFace(true, now + SKILL_COOLDOWN_MS.still, now), 'cooling')
  assert.ok(cooldownFill(now + 12_000, now, 12_000) > 0.99)
  assert.equal(cooldownFill(now, now, 12_000), 0)
  assert.equal(secondsLeft(now + 2_500, now), 3)
  assert.equal(skillStatusLabel('locked', 0, now, 1), 'Wave 2')
  assert.equal(skillStatusLabel('ready', 0, now, 0), 'TAP')
  assert.equal(skillStatusLabel('cooling', now + 2_500, now, 0), '3s')
  const empty = mendPower(0)
  assert.equal(empty.hearts, DEFEND_HEARTS)
  assert.equal(empty.gained, DEFEND_HEARTS)
  assert.equal(empty.shield, true)
  assert.equal(empty.note, 'Mend +3')
  const one = mendPower(2)
  assert.equal(one.hearts, 3)
  assert.equal(one.gained, 1)
  assert.equal(one.note, 'Mend +1')
  const full = mendPower(DEFEND_HEARTS)
  assert.equal(full.gained, 0)
  assert.equal(full.hearts, DEFEND_HEARTS)
  assert.equal(full.shield, true, '1.4.380 a full bar still mends')
  assert.equal(full.note, 'Mend')
  assert.equal(WATCH_TOOLS.length, 4, '1.4.380 does not add a rail tool')
  assert.match(defendScreenOnlySrc, /skillHoldRef/)
  assert.match(defendScreenOnlySrc, /skillUnlockOnWave/)
  assert.match(defendScreenOnlySrc, /mendShieldUntilRef/)
  assert.match(defendScreenOnlySrc, /if \(leaked && now < mendShieldUntilRef\.current\)/)
  assert.match(defendScreenOnlySrc, /setPowerBanner\('Held'\)/)
  assert.match(defendScreenOnlySrc, /NightSkillSplash/)
  assert.match(defendScreenOnlySrc, /NightSkillTray/)
  assert.match(splash380, /role="dialog"/)
  assert.match(splash380, /New skill/)
  assert.match(splash380, /SKILL_BLURB/)
  assert.match(tray380, /data-state=\{face\}/)
  assert.match(tray380, /nw-skill-ring-fill/)
  assert.match(defendCss380, /1\.4\.380: skills pack/)
  assert.match(defendCss380, /\.nw-skill\.is-ready/)
  assert.match(defendCss380, /\.defend-page\.is-mend \.defend-board/)
  assert.match(defendCss380, /\.nw-still-veil/)
  assert.match(defendCss380, /\.nw-mend-shield/)
  assert.match(defendScreenOnlySrc, /nw-still-veil/)
  assert.match(defendScreenOnlySrc, /nw-mend-shield/)
  assert.match(defendScreenOnlySrc, /nw-mend-hold/)
  assert.match(tray380, /nw-skill-count/)
  assert.match(defendCss380, /\.defend-page\.is-easy-watch \.nw-docks \.defend-kits\.nw-skill-tray/)
  assert.match(defendCss380, /1\.4\.379: Easy phone SE chrome/, '1.4.380 keeps the phone chrome rules')
  assert.match(defendCss380, /1\.4\.378: Easy plant rings/, '1.4.380 keeps the gold plant rings')
  assert.doesNotMatch(defendAbilitySrc, /NightSkill|mendPower|skillHoldRef/, '1.4.380 skills stay off the tower rail')
  assert.equal(easyGateResult(4, 1, 0.7), 'clear', '1.4.393 gate entry lets Love I hold wave 5 taps')
  assert.equal(easyGateResult(4, 2, 0.7), 'clear', '1.4.380 Love II still holds wave 5')
  assert.ok(CHANGELOG.some((note) => note.version === '1.4.380'), '1.4.380 changelog row')
  assert.match(latestChange('1.4.380').title, /skills recharge/)
  assert.match(latestChange('1.4.380').items.join('\n'), /Still/)
  assert.match(latestChange('1.4.380').items.join('\n'), /Mend/)
  assert.match(latestChange('1.4.380').items.join('\n'), /recharges/)
  assert.doesNotMatch(
    latestChange('1.4.380').items.join('\n'),
    /Fixes #|Closes #|Resolves #|monkey|balloon/i,
    '1.4.380 changelog avoids GitHub close keywords',
  )
}

// Night Watch 1.4.379: Easy phone SE chrome — bezel reclaimed, roster tiny, icons, wave on the map.
{
  const css379 = readFileSync(new URL('../src/styles/defend.css', import.meta.url), 'utf8')
  const fill379 = readFileSync(new URL('../src/nightWatch/map/phoneFill.ts', import.meta.url), 'utf8')
  assert.match(css379, /1\.4\.379: Easy phone SE chrome/)
  assert.match(
    css379,
    /\.app\.is-play:has\(\.defend-page\.is-easy-watch\) \.app-body \{[^}]*width:\s*100%/,
    '1.4.379 Easy phone playfield has no side inset',
  )
  assert.match(
    css379,
    /\.defend-page\.is-easy-watch \.defend-board \{[^}]*border-radius:\s*0/,
    '1.4.379 Easy phone board drops the rounded frame',
  )
  assert.match(
    css379,
    /\.defend-page\.is-easy-watch \.defend-frame \{[^}]*width:\s*100%;[^}]*height:\s*100%;[^}]*aspect-ratio:\s*auto/,
    '1.4.379 Easy phone frame fills the stage',
  )
  assert.match(
    css379,
    /\.defend-page\.is-easy-watch \.nw-walker-slide\.easy-walker-roster \{[^}]*max-height:\s*26px/,
    '1.4.379 walker names stay one small line',
  )
  assert.match(
    css379,
    /\.defend-page\.is-easy-watch \.defend-ability-label \{[^}]*clip:\s*rect\(0 0 0 0\)/,
    '1.4.379 rail labels are off the icons',
  )
  assert.match(css379, /\.defend-page\.is-easy-watch \.nw-hud \.defend-wave \{[^}]*display:\s*none/)
  assert.match(css379, /\.defend-page\.is-easy-watch \.nw-wave-overlay \{[^}]*position:\s*absolute/)
  assert.match(defendScreenOnlySrc, /nw-wave-overlay/)
  assert.match(defendScreenOnlySrc, /plateFill \? boardFillBox\(boardBox\) : boardViewBox\(boardBox\)/)
  assert.match(defendScreenOnlySrc, /if \(!plateFill\) return mapBoardPoint\(boardBox,/)
  assert.match(fill379, /const scale = byW > byH \? byW : byH/)
  assert.doesNotMatch(fill379, /Math\.max\(box\.w/)
  const se379 = boardFill({ w: 375, h: 580 })
  assert.ok(se379.x > 0 && Math.abs(se379.y) < 0.05, '1.4.379 SE crops the dark side edges, not the road ends')
  assert.ok(se379.w < 798 && Math.abs(se379.h - 1134) < 0.05)
  assert.ok(632 > se379.x && 632 < se379.x + se379.w, '1.4.379 gate seat stays on the filled map')
  assert.ok(388 > se379.x && 72 > se379.y && 72 < se379.y + se379.h, '1.4.379 road end stays on the filled map')
  assert.match(css379, /1\.4\.378: Easy plant rings/, '1.4.379 keeps the gold plant rings')
  assert.ok(CHANGELOG.some((note) => note.version === '1.4.379'), '1.4.379 changelog row')
  assert.match(latestChange('1.4.379').title, /phone map uses the screen/)
  assert.match(latestChange('1.4.379').items.join('\n'), /icons/)
  assert.match(latestChange('1.4.379').items.join('\n'), /wave count sits on the map/)
  assert.doesNotMatch(
    latestChange('1.4.379').items.join('\n'),
    /Fixes #|Closes #|Resolves #|monkey|balloon/i,
    '1.4.379 changelog avoids GitHub close keywords',
  )
}

// Night Watch 1.4.378: Easy plants all four from Wave 1. Face-tap does not gate the rail.
{
  const actors378 = readFileSync(
    new URL('../src/components/DefendNightActors.tsx', import.meta.url),
    'utf8',
  )
  const ability378 = readFileSync(
    new URL('../src/components/DefendAbilityBar.tsx', import.meta.url),
    'utf8',
  )
  const css378 = readFileSync(new URL('../src/styles/defend.css', import.meta.url), 'utf8')
  assert.equal(EASY_PLANT_PADS.length, 4, '1.4.378 one ring per type')
  assert.deepEqual(nightPlantTypes(true, ['love']), ['love', 'logic', 'reason', 'science'])
  assert.deepEqual(nightPlantTypes(false, ['love']), ['love'], '1.4.378 hard still waits on Lock In')
  const hand = {}
  for (const id of ['love', 'logic', 'reason', 'science']) {
    assert.equal(slotLeft(hand, id), 1, '1.4.378 each type starts with 1')
  }
  let board = hand
  EASY_PLANT_PADS.forEach((pad, index) => {
    const type = ['love', 'logic', 'reason', 'science'][index]
    board = plantType(board, pad, type)
  })
  assert.equal(slotLeft(board, 'love'), 0, '1.4.378 planting spends the 1')
  assert.equal(slotLeft(board, 'science'), 0)
  assert.equal(board.porch, 'love')
  assert.equal(board.hollow, 'logic')
  assert.equal(board.journal, 'reason')
  assert.equal(board.bench, 'science')
  const freed = pullPlant(board, 'porch', EASY_PLANT_PADS)
  assert.equal(freed.porch, undefined)
  assert.equal(slotLeft(freed, 'love'), 1, '1.4.378 Pull returns that type’s 1')
  assert.equal(freed.hollow, 'logic')
  const onlyLove = { porch: 'love' }
  const pulledLast = pullPlant(onlyLove, 'porch', EASY_PLANT_PADS)
  assert.deepEqual(pulledLast, {}, '1.4.378 Pull frees the last lamp when another ring is open')
  assert.equal(slotLeft(pulledLast, 'love'), 1)
  assert.equal(
    pullPlant({ porch: 'love' }, 'porch', ['porch']),
    null,
    '1.4.378 the last lamp stays only when no empty ring remains',
  )
  assert.match(defendScreenOnlySrc, /nightPlantTypes/)
  assert.match(defendScreenOnlySrc, /EASY_PLANT_PADS/)
  assert.match(defendScreenOnlySrc, /pullPlant\(plants, id, pads\)/)
  assert.match(defendScreenOnlySrc, /easy \? \{\} : starterPlants/)
  assert.doesNotMatch(ability378, /nightMiss/, '1.4.378 rail tap is not the face-tap miss')
  assert.match(ability378, /easy \|\| unlocked\.includes/)
  assert.match(ability378, /data-slot-badge="1"/)
  assert.match(actors378, /data-plant-ring="gold"/)
  assert.match(css378, /1\.4\.378: Easy plant rings/)
  assert.ok(CHANGELOG.some((note) => note.version === '1.4.378'), '1.4.378 changelog row')
  assert.match(latestChange('1.4.378').title, /all four/)
  assert.match(latestChange('1.4.378').items.join('\n'), /gold ring/)
  assert.match(latestChange('1.4.378').items.join('\n'), /Pull/)
  assert.doesNotMatch(
    latestChange('1.4.378').items.join('\n'),
    /Fixes #|Closes #|Resolves #|monkey|balloon/i,
    '1.4.378 changelog avoids GitHub close keywords',
  )
}

// Night Watch 1.4.377: plantable towers are Love, Logic, Reason, Science.
{
  const actors377 = readFileSync(
    new URL('../src/components/DefendNightActors.tsx', import.meta.url),
    'utf8',
  )
  const ability377 = readFileSync(
    new URL('../src/components/DefendAbilityBar.tsx', import.meta.url),
    'utf8',
  )
  const css377 = readFileSync(new URL('../src/styles/defend.css', import.meta.url), 'utf8')
  const pads = ['porch', 'hollow', 'bench', 'observatory', 'gate']
  const open = ['love', 'logic', 'reason', 'science']
  const started = starterPlants(pads, open)
  assert.deepEqual(started, {
    porch: 'love',
    hollow: 'logic',
    bench: 'reason',
    observatory: 'science',
  })
  assert.equal(started.gate, undefined, '1.4.377 does not invent a fifth tower')
  assert.equal(slotLeft(started, 'love'), 0)
  assert.equal(slotLeft(started, 'logic'), 0)
  const moved = plantType(started, 'gate', 'love')
  assert.equal(moved.gate, 'love')
  assert.equal(moved.porch, undefined, '1.4.377 planting spends the one Love slot')
  assert.equal(moved.hollow, 'logic')
  assert.equal(slotLeft(moved, 'love'), 0)
  assert.equal(slotLeft({ porch: 'love' }, 'science'), 1)
  assert.equal(isTowerType('love'), true)
  assert.equal(isTowerType('still'), false)
  assert.deepEqual(plantType({ porch: 'love' }, 'bench', 'still'), { porch: 'love' })
  const pulled = pullPlant(moved, 'gate')
  assert.equal(pulled.gate, undefined)
  assert.equal(slotLeft(pulled, 'love'), 1, '1.4.377 pull puts the slot back')
  assert.equal(pullPlant({ porch: 'love' }, 'porch'), null, '1.4.377 the last tower stays')
  assert.match(defendScreenOnlySrc, /starterPlants/)
  assert.match(defendScreenOnlySrc, /plantType/)
  assert.match(defendScreenOnlySrc, /pullPlant/)
  assert.match(defendScreenOnlySrc, /towerAbility/)
  assert.match(defendScreenOnlySrc, /planted\.length <= 1/)
  assert.match(defendScreenOnlySrc, /Keep at least one lamp/)
  assert.match(defendScreenOnlySrc, /onBoostTower=\{boostSelectedTool\}/)
  assert.match(actors377, /data-tower-type/)
  assert.match(actors377, /defend-type-mark/)
  assert.match(actors377, /defend-tower-lamp/)
  assert.match(actors377, /'Upgrade' : 'Plant'\} lamp at/)
  assert.match(ability377, /defend-ability-tier/)
  assert.match(ability377, /TIER_MARK\[tier\]/)
  assert.match(ability377, /defend-ability-stock/)
  assert.match(ability377, /data-slot/)
  assert.match(css377, /1\.4\.377: planted towers are Love, Logic, Reason, Science/)
  assert.match(css377, /\.defend-pad\.is-love/)
  assert.match(css377, /\.defend-pad\.is-logic/)
  assert.match(css377, /\.defend-pad\.is-reason/)
  assert.match(css377, /\.defend-pad\.is-science/)
  assert.match(css377, /\.defend-type-chip\.is-love/)
  assert.ok(CHANGELOG.some((note) => note.version === '1.4.377'), '1.4.377 changelog row')
  assert.match(latestChange('1.4.377').title, /Love, Logic, Reason, and Science/)
  assert.match(latestChange('1.4.377').items.join('\n'), /slot/)
  assert.match(latestChange('1.4.377').items.join('\n'), /I to II/)
  assert.doesNotMatch(
    latestChange('1.4.377').items.join('\n'),
    /Fixes #|Closes #|Resolves #|monkey|balloon/i,
    '1.4.377 changelog avoids GitHub close keywords',
  )
}

// Night Watch 1.4.376: Easy walkers stay spaced. 1.4.393 starts every walker at the
// gate; the lead is still ahead because it spawned earlier.
{
  const step = 0.01 * 3.8
  const at = [0, 1, 2].map((index) => easySpawnT(index) + step * (2 - index))
  assert.equal(easySpawnT(0), 0)
  assert.equal(easySpawnT(1), 0)
  assert.equal(easySpawnT(2), 0)
  assert.ok(at[0] > at[1] && at[1] > at[2], '1.4.376 the first walker stays ahead of the third')
  assert.ok(at[0] - at[2] >= step * 2 - 1e-9, '1.4.376 two spawn gaps separate the lead from the third')
  assert.ok(CHANGELOG.some((note) => note.version === '1.4.376'), '1.4.376 changelog row')
  assert.match(latestChange('1.4.376').title, /spawn/)
  assert.match(latestChange('1.4.376').items.join('\n'), /face/)
  assert.doesNotMatch(
    latestChange('1.4.376').items.join('\n'),
    /Fixes #|Closes #|Resolves #|monkey|balloon/i,
    '1.4.376 changelog avoids GitHub close keywords',
  )
}

// Night Watch 1.4.375: Upgrade on a planted lamp plays a level-up burst.
{
  const defendCss375 = readFileSync(new URL('../src/styles/defend.css', import.meta.url), 'utf8')
  const towerCard375 = readFileSync(
    new URL('../src/components/DefendTowerCard.tsx', import.meta.url),
    'utf8',
  )
  const actors375 = readFileSync(
    new URL('../src/components/DefendNightActors.tsx', import.meta.url),
    'utf8',
  )
  const chrome375 = readFileSync(new URL('../src/nightWatch/ui/Chrome.tsx', import.meta.url), 'utf8')
  assert.match(defendCss375, /1\.4\.375: level-up burst when Upgrade spends a spark/)
  assert.match(defendCss375, /@keyframes defend-level-grow/)
  assert.match(defendCss375, /@keyframes defend-burst-spark/)
  assert.match(defendCss375, /@keyframes defend-level-bump/)
  assert.match(defendCss375, /\.defend-level-pip\.is-bump/)
  assert.match(defendCss375, /\.defend-spark-spend/)
  assert.match(defendCss375, /\.nw-spark-spend/)
  assert.match(towerCard375, /data-level-bump/)
  assert.match(towerCard375, /defend-level-to/)
  assert.match(towerCard375, /−1✦/)
  assert.match(towerCard375, /TIER_MARK\[next\]/)
  assert.match(towerCard375, /defend-tower-upgrade/)
  assert.match(towerCard375, /defend-tower-pull/)
  assert.match(actors375, /defend-level-burst/)
  assert.match(actors375, /defend-level-pip/)
  assert.match(actors375, /defend-burst-spark/)
  assert.match(actors375, /defend-lamp-sprite/)
  assert.match(defendCss375, /\.defend-pad\.is-up \.defend-lamp-sprite/)
  assert.match(actors375, /className=\{`defend-tower-lamp/)
  assert.match(defendScreenOnlySrc, /LEVEL_BURST_MS/)
  assert.match(defendScreenOnlySrc, /setLevelBurst/)
  assert.match(defendScreenOnlySrc, /setSparkSpend\(true\)/)
  assert.match(defendScreenOnlySrc, /applyBoost/)
  assert.match(chrome375, /nw-spark-spend/)
  assert.match(chrome375, /−1✦/)
  assert.ok(CHANGELOG.some((note) => note.version === '1.4.375'), '1.4.375 changelog row')
  assert.match(latestChange('1.4.375').title, /lamp levels up/)
  assert.match(latestChange('1.4.375').items.join('\n'), /burst/)
  assert.match(latestChange('1.4.375').items.join('\n'), /I to II/)
  assert.match(latestChange('1.4.375').items.join('\n'), /−1✦/)
  assert.doesNotMatch(
    latestChange('1.4.375').items.join('\n'),
    /Fixes #|Closes #|Resolves #|monkey|balloon/i,
    '1.4.375 changelog avoids GitHub close keywords',
  )
}

// Night Watch 1.4.374: the upgrade card's small trash pulls a lamp after a wave clears too.
{
  const defendCss374 = readFileSync(new URL('../src/styles/defend.css', import.meta.url), 'utf8')
  assert.match(defendCss374, /1\.4\.374: that trash stays on the card after a wave clears/)
  assert.match(defendCss374, /\.defend-tower-pull/)
  assert.match(defendScreenOnlySrc, /phase === 'plant' \|\| phase === 'boost'/)
  assert.match(defendScreenOnlySrc, /if \(phase !== 'plant' && phase !== 'boost'\) return/)
  assert.match(defendScreenOnlySrc, /pullUpgradeLamp/)
  assert.match(defendScreenOnlySrc, /planted\.length <= 1/)
  assert.match(defendScreenOnlySrc, /EASY\.nightKeepLamp/)
  assert.match(defendScreenOnlySrc, /Keep at least one lamp/)
  assert.ok(CHANGELOG.some((note) => note.version === '1.4.374'), '1.4.374 changelog row')
  assert.match(latestChange('1.4.374').title, /lamp card can pull/)
  assert.match(latestChange('1.4.374').items.join('\n'), /trash/)
  assert.match(latestChange('1.4.374').items.join('\n'), /last lamp/i)
  assert.doesNotMatch(
    latestChange('1.4.374').items.join('\n'),
    /Fixes #|Closes #|Resolves #|monkey|balloon/i,
    '1.4.374 changelog avoids GitHub close keywords',
  )
}

// Night Watch 1.4.373: tap a planted lamp for an upgrade card. Pull is a small trash control.
{
  const defendCss373 = readFileSync(new URL('../src/styles/defend.css', import.meta.url), 'utf8')
  const towerCard373 = readFileSync(
    new URL('../src/components/DefendTowerCard.tsx', import.meta.url),
    'utf8',
  )
  const easyUi373 = readFileSync(new URL('../src/lib/easyUi.ts', import.meta.url), 'utf8')
  assert.match(defendCss373, /1\.4\.373: tap a planted lamp/)
  assert.match(defendCss373, /\.defend-tower-card/)
  assert.match(defendCss373, /\.defend-tower-upgrade/)
  assert.match(defendCss373, /\.defend-tower-pull/)
  assert.match(towerCard373, /data-upgrade-card/)
  assert.match(towerCard373, /defend-tower-upgrade/)
  assert.match(towerCard373, /defend-tower-pull/)
  assert.match(towerCard373, /Pull lamp at/)
  assert.match(towerCard373, /Range ↑  ·  Damage ↑/)
  assert.match(towerCard373, /boostCost/)
  assert.match(towerCard373, /TIER_MARK\[next\]/)
  assert.match(towerCard373, /Upgrade/)
  assert.match(defendNightSrc, /onOpenUpgrade\?\.\(id\)/)
  assert.match(defendNightSrc, /phase === 'boost' && on\)/)
  assert.match(defendNightSrc, /'Upgrade' : 'Plant'\} lamp at/)
  assert.doesNotMatch(defendNightSrc, /'Pull'/)
  assert.match(defendScreenOnlySrc, /onBoostTower=\{boostSelectedTool\}/)
  assert.match(defendScreenOnlySrc, /openUpgrade/)
  assert.match(defendScreenOnlySrc, /pullUpgradeLamp/)
  assert.match(defendScreenOnlySrc, /applyBoost/)
  assert.match(easyUi373, /make it stronger/)
  assert.doesNotMatch(easyUi373, /Tap a lamp to pull it/)
  assert.ok(CHANGELOG.some((note) => note.version === '1.4.373'), '1.4.373 changelog row')
  assert.match(latestChange('1.4.373').title, /upgrade card/)
  assert.match(latestChange('1.4.373').items.join('\n'), /gold Upgrade/)
  assert.match(latestChange('1.4.373').items.join('\n'), /trash/)
  assert.match(latestChange('1.4.373').items.join('\n'), /spark/)
  assert.doesNotMatch(
    latestChange('1.4.373').items.join('\n'),
    /Fixes #|Closes #|Resolves #|monkey|balloon/i,
    '1.4.373 changelog avoids GitHub close keywords',
  )
}

// Night Watch 1.4.372: the lead walker glows so a kid knows which face to tap.
{
  const defendCss372 = readFileSync(new URL('../src/styles/defend.css', import.meta.url), 'utf8')
  assert.match(defendCss372, /1\.4\.372: the lead walker glows/)
  assert.match(defendCss372, /1\.4\.372: idle walkers stay quieter/)
  assert.match(defendNightSrc, /walker-target-cue/)
  assert.match(defendNightSrc, /data-cue="target"/)
  assert.match(defendNightSrc, /walker-cue-pulse/)
  assert.match(defendNightSrc, /walker-cue-arrow/)
  assert.match(defendNightSrc, /walker-cue-ring/)
  const ringRule = defendCss372.match(/\.walker-cue-ring \{[\s\S]*?\}/)
  assert.ok(ringRule, '1.4.372 cue ring')
  assert.match(ringRule[0], /stroke:\s*#ffcc33/)
  assert.match(ringRule[0], /stroke-width:\s*8/)
  assert.match(ringRule[0], /vector-effect:\s*non-scaling-stroke/)
  assert.match(defendCss372, /\.walker-cue-pulse[\s\S]*?animation:\s*walker-cue-pulse/)
  assert.match(defendCss372, /\.walker-cue-arrow[\s\S]*?animation:\s*walker-cue-bob/)
  assert.match(
    defendCss372,
    /\.defend-page\.is-easy-tap \.defend-raider\.is-easy-cue \.defend-raider-face \{[\s\S]*?drop-shadow\(0 0 16px #ff9f1a\)/,
  )
  assert.match(
    defendCss372,
    /\.defend-page\.is-easy-tap \.defend-raider\.is-easy-tap-target:not\(\.is-easy-cue\):not\(\.is-lamp-hit\) \{[\s\S]*?opacity:\s*0\.72/,
  )
  assert.match(
    defendCss372,
    /\.defend-page\.is-easy-tap \.defend-raider\.is-easy-cue\.is-lamp-hit \.defend-raider-face[\s\S]*?brightness\(2\.8\)/,
    '1.4.372 keeps the white hit flash on the lead walker',
  )
  assert.ok(CHANGELOG.some((note) => note.version === '1.4.372'), '1.4.372 changelog row')
  assert.match(latestChange('1.4.372').title, /walker to tap/)
  assert.match(latestChange('1.4.372').items.join('\n'), /gold ring/)
  assert.match(latestChange('1.4.372').items.join('\n'), /arrow/)
  assert.match(latestChange('1.4.372').items.join('\n'), /beam/)
  assert.doesNotMatch(
    latestChange('1.4.372').items.join('\n'),
    /Fixes #|Closes #|Resolves #|monkey|balloon/i,
    '1.4.372 changelog avoids GitHub close keywords',
  )
}

// Night Watch 1.4.371: auto-fire juice stays readable on a phone.
{
  const defendCss371 = readFileSync(new URL('../src/styles/defend.css', import.meta.url), 'utf8')
  const firingRule = defendCss371.match(/\.defend-range\.is-firing \{[\s\S]*?\}/)
  const beamRule = defendCss371.match(/\.defend-beam \{[\s\S]*?\}/)
  assert.ok(firingRule, '1.4.371 firing range rule')
  assert.ok(beamRule, '1.4.371 beam rule')
  assert.match(defendCss371, /1\.4\.371: phone shot juice/)
  assert.match(firingRule[0], /stroke-dasharray:\s*100000/)
  assert.doesNotMatch(firingRule[0], /stroke-dasharray:\s*none/)
  assert.match(beamRule[0], /vector-effect:\s*non-scaling-stroke/)
  assert.match(beamRule[0], /animation:\s*none/)
  assert.match(defendCss371, /\.defend-beam-halo/)
  assert.match(defendCss371, /\.defend-face-flash/)
  assert.match(defendNightSrc, /defend-face-flash/)
  assert.match(defendNightSrc, /easy-hit-flash/)
  assert.match(defendCss371, /\.easy-hit-flash/)
  assert.match(defendNightSrc, /defend-beam-halo/)
  assert.match(defendNightSrc, /strokeDasharray: '100000'/)
  assert.match(defendScreenOnlySrc, /SHOT_JUICE_MS/)
  assert.match(defendScreenOnlySrc, /lightPad/)
  assert.ok(SHOT_JUICE_MS >= 400, '1.4.371 shot juice lasts long enough to see')
  assert.ok(CHANGELOG.some((note) => note.version === '1.4.371'), '1.4.371 changelog row')
  assert.match(latestChange('1.4.371').title, /shots you can see/)
  assert.match(latestChange('1.4.371').items.join('\n'), /solid/)
  assert.match(latestChange('1.4.371').items.join('\n'), /beam/)
  assert.match(latestChange('1.4.371').items.join('\n'), /flash/)
  assert.match(latestChange('1.4.371').items.join('\n'), /spark/)
  assert.doesNotMatch(
    latestChange('1.4.371').items.join('\n'),
    /Fixes #|Closes #|Resolves #|monkey|balloon/i,
    '1.4.371 changelog avoids GitHub close keywords',
  )
}

// Night Watch 1.4.370: planted lamps auto-fire at walkers in range.
{
  const defendCss370 = readFileSync(new URL('../src/styles/defend.css', import.meta.url), 'utf8')
  assert.match(defendCss370, /1\.4\.370: lamp range/)
  assert.match(defendCss370, /\.defend-range\.is-firing/)
  assert.match(defendCss370, /\.defend-raider\.is-lamp-hit/)
  assert.match(defendCss370, /\.defend-spark-pop/)
  assert.match(defendCss370, /\.nw-spark-float/)
  assert.match(defendScreenOnlySrc, /lampReadyToFire/)
  assert.match(defendScreenOnlySrc, /sparkAwardForHit/)
  assert.match(defendScreenOnlySrc, /autoFireRef\.current\(now, debugHold\)/)
  assert.match(defendNightSrc, /defend-range/)
  assert.match(defendNightSrc, /is-lamp-hit/)
  assert.match(defendNightSrc, /defend-puff/)
  assert.match(defendNightSrc, /defend-spark-pop/)
  assert.match(defendNightSrc, /\+spark/)
  assert.equal(lampReadyToFire(0, 699, 700, false), false)
  assert.equal(lampReadyToFire(0, 700, 700, false), true)
  assert.equal(lampReadyToFire(0, 5000, 700, true), false, 'debug pause holds the shot')
  assert.equal(sparkAwardForHit(false), 0)
  assert.equal(sparkAwardForHit(true), 1)
  assert.ok(CHANGELOG.some((note) => note.version === '1.4.370'), '1.4.370 changelog row')
  assert.match(latestChange('1.4.370').title, /lamps fight/)
  assert.match(latestChange('1.4.370').items.join('\n'), /shoot walkers in range/)
  assert.match(latestChange('1.4.370').items.join('\n'), /spark/)
  assert.doesNotMatch(
    latestChange('1.4.370').items.join('\n'),
    /Fixes #|Closes #|Resolves #|monkey|money balloon/i,
    '1.4.370 changelog avoids GitHub close keywords',
  )
}

// Easy Home 1.4.367: phone top bar stays one line (#516). Leave the issue open.
{
  const topCss367 = readFileSync(new URL('../src/styles/easyTopbar.css', import.meta.url), 'utf8')
  const main367 = readFileSync(new URL('../src/main.tsx', import.meta.url), 'utf8')
  const shell367 = readFileSync(new URL('../src/components/AppShell.tsx', import.meta.url), 'utf8')
  assert.match(main367, /easyTopbar\.css/, '1.4.367 peel is imported')
  assert.match(topCss367, /1\.4\.367/)
  assert.match(topCss367, /max-width:\s*720px/)
  assert.match(topCss367, /data-easy='on'/)
  assert.match(topCss367, /\.topbar \{[\s\S]*?flex-wrap:\s*nowrap/)
  assert.match(topCss367, /\.topbar \{[\s\S]*?min-width:\s*0/)
  assert.match(topCss367, /\.topbar nav \{[\s\S]*?flex-wrap:\s*nowrap/)
  assert.match(topCss367, /text-overflow:\s*ellipsis/)
  assert.match(topCss367, /white-space:\s*nowrap/)
  assert.match(shell367, /brand-name/)
  assert.match(shell367, /Silver City/)
  assert.doesNotMatch(topCss367, /Fixes #|Closes #|Resolves #/i)
  assert.ok(CHANGELOG.some((note) => note.version === '1.4.367'), '1.4.367 changelog row')
  assert.match(latestChange('1.4.367').title, /Home top bar stays readable/)
  assert.match(latestChange('1.4.367').items.join('\n'), /Home top bar stays readable on a phone/)
  assert.doesNotMatch(
    latestChange('1.4.367').items.join('\n'),
    /Fixes #|Closes #|Resolves #/i,
    '1.4.367 changelog avoids GitHub close keywords',
  )
}

// Easy Father Run 1.4.366: fail-reset press-the-glow toast is readable on a phone (#513). Leave the issue open.
{
  const hintCss366 = readFileSync(new URL('../src/styles/fatherRunHint.css', import.meta.url), 'utf8')
  const main366 = readFileSync(new URL('../src/main.tsx', import.meta.url), 'utf8')
  const play366 = readFileSync(
    new URL('../src/easyTrail/father/FatherRunPlay.tsx', import.meta.url),
    'utf8',
  )
  assert.match(main366, /fatherRunHint\.css/, '1.4.366 peel is imported')
  assert.match(hintCss366, /1\.4\.366/)
  assert.match(hintCss366, /max-width:\s*720px/)
  assert.match(hintCss366, /max-height:\s*720px/)
  assert.match(
    hintCss366,
    /html\[data-easy='on'\] \.play\.is-father-run \.match-toast \{[\s\S]*?background:\s*#2a1408/,
  )
  assert.match(
    hintCss366,
    /html\[data-easy='on'\] \.play\.is-father-run \.match-toast \{[\s\S]*?color:\s*#fff6e8/,
  )
  assert.match(hintCss366, /font-size:\s*1\.32rem/)
  assert.match(play366, /Hold — then press the glow/)
  assert.doesNotMatch(hintCss366, /Fixes #|Closes #|Resolves #/i)
  assert.ok(CHANGELOG.some((note) => note.version === '1.4.366'), '1.4.366 changelog row')
  assert.match(latestChange('1.4.366').title, /Run fail hint is easier to read/)
  assert.match(latestChange('1.4.366').items.join('\n'), /Run fail hint is easier to read/)
  assert.doesNotMatch(
    latestChange('1.4.366').items.join('\n'),
    /Fixes #|Closes #|Resolves #/i,
    '1.4.366 changelog avoids GitHub close keywords',
  )
}

// Easy Match 1.4.360: win plate shows the kept line and a readable Lock In next (#510). Leave the issue open.
{
  const maze360 = readFileSync(
    new URL('../src/components/challenges/RoadMazePlay.tsx', import.meta.url),
    'utf8',
  )
  const mazeCss360 = readFileSync(new URL('../src/styles/maze.css', import.meta.url), 'utf8')
  const matchWin360 = readFileSync(new URL('../src/styles/matchWin.css', import.meta.url), 'utf8')
  assert.match(maze360, /1\.4\.360: the win plate shows the kept line/)
  assert.match(maze360, /roadCtaLabel/)
  assert.match(maze360, /maze-win-cta/)
  assert.match(maze360, /winStamp && dockLive/)
  assert.match(maze360, /setPointerCapture/)
  assert.match(mazeCss360, /1\.4\.360: Easy road win plate holds the kept line/)
  assert.match(matchWin360, /maze-win-cta/)
  assert.ok(CHANGELOG.some((note) => note.version === '1.4.360'), '1.4.360 changelog row')
  assert.match(latestChange('1.4.360').title, /win screen|next step/i)
  assert.match(latestChange('1.4.360').items.join('\n'), /Helped!/)
  assert.match(latestChange('1.4.360').items.join('\n'), /Lock In next/)
  assert.doesNotMatch(
    latestChange('1.4.360').items.join('\n'),
    /Fixes #510|Closes #510|Resolves #510|Fixes #509|Closes #509|Resolves #509|Fixes #531|Closes #531|Resolves #531/i,
    '1.4.360 changelog avoids GitHub close keywords',
  )
}

// Easy Keep/Toss 1.4.354: empty Toss + a pending line is unfinished, not mixed bins (#503).
{
  const sortPlay354 = readFileSync(
    new URL('../src/components/challenges/SortPlay.tsx', import.meta.url),
    'utf8',
  )
  assert.match(sortPlay354, /sortMissCopy/)
  assert.match(sortPlay354, /1\.4\.354: empty Toss/)
  const kept = [{ bin: 'keep' }, { bin: 'keep' }, { bin: 'keep' }]
  const unfinished = sortMissCopy({
    status: 'wrong',
    misses: 2,
    pending: 1,
    keep: kept,
    discard: [],
    easy: true,
    teachOnWrong: 'Jesus names loss and hearing in the same breath.',
  })
  assert.equal(unfinished.kicker, 'Still sorting')
  assert.equal(unfinished.title, 'This line is not sorted yet.')
  assert.doesNotMatch(unfinished.title, /mix/i)
  assert.match(unfinished.body ?? '', /Keep what belongs/)
  const mixed = sortMissCopy({
    status: 'wrong',
    misses: 2,
    pending: 0,
    keep: [{ bin: 'discard' }],
    discard: [{ bin: 'keep' }],
    easy: true,
    teachOnWrong: 'teach',
  })
  assert.equal(mixed.kicker, 'One more look')
  assert.equal(mixed.title, 'Those bins still mix.')
  assert.match(mixed.body ?? '', /Keep what belongs/)
  const mixedWhilePending = sortMissCopy({
    status: 'wrong',
    misses: 2,
    pending: 1,
    keep: kept,
    discard: [{ bin: 'keep' }],
    easy: false,
    teachOnWrong: 'A keep line is sitting in Toss.',
  })
  assert.equal(mixedWhilePending.title, 'Those bins still mix.')
  assert.equal(mixedWhilePending.body, 'A keep line is sitting in Toss.')
  assert.ok(CHANGELOG.some((note) => note.version === '1.4.354'), '1.4.354 changelog row')
  assert.match(latestChange('1.4.354').title, /Keep\/Toss|unfinished/i)
  assert.doesNotMatch(
    latestChange('1.4.354').items.join('\n'),
    /Fixes #503|Closes #503|Resolves #503|Fixes #520|Closes #520|Fixes #508|Closes #508/i,
    '1.4.354 changelog avoids GitHub close keywords',
  )
}

// Easy Lock In 1.4.353: phone why chips stay still so a thumb hits a fixed target (#502).
{
  const hold353 = readFileSync(new URL('../src/styles/sortHold.css', import.meta.url), 'utf8')
  const blast353 = readFileSync(
    new URL('../src/components/challenges/WhyBlastPlay.tsx', import.meta.url),
    'utf8',
  )
  assert.match(hold353, /1\.4\.353: phone why chips stay still/)
  assert.match(hold353, /animation: why-float 2\.4s ease-in-out infinite/)
  assert.match(
    hold353,
    /@media \(max-width: 900px\), \(pointer: coarse\) \{\s*\.why-chip \{\s*animation: none;/,
  )
  assert.match(blast353, /1\.4\.353: phone why chips stay still/)
  assert.ok(CHANGELOG.some((note) => note.version === '1.4.353'), '1.4.353 changelog row')
  assert.match(latestChange('1.4.353').title, /why choices stay still|Lock In/i)
  assert.doesNotMatch(
    latestChange('1.4.353').items.join('\n'),
    /Fixes #502|Closes #502|Resolves #502|Fixes #470|Closes #470|Resolves #470/i,
    '1.4.353 changelog avoids GitHub close keywords',
  )
}

// Night Watch 1.4.349: debug freeze harness for playtests (Bill — read cue without racing walkers).
{
  const nwDebugSrc = readFileSync(new URL('../src/lib/nightWatchDebug.ts', import.meta.url), 'utf8')
  const defendScreenSrc = readFileSync(new URL('../src/components/DefendScreen.tsx', import.meta.url), 'utf8')
  const settingsSrc = readFileSync(new URL('../src/components/Settings.tsx', import.meta.url), 'utf8')
  assert.match(nwDebugSrc, /readNightWatchDebug/)
  assert.match(nwDebugSrc, /nightWatchDebugFrozen/)
  assert.match(defendScreenSrc, /nightWatchDebugFrozen/)
  assert.match(defendScreenSrc, /is-nw-debug-freeze/)
  assert.match(settingsSrc, /writeNightWatchDebug/)
  assert.match(settingsSrc, /debugNightWatchJump/)
  assert.ok(CHANGELOG.some((note) => note.version === '1.4.349'), '1.4.349 changelog row')
  assert.match(latestChange('1.4.349').title, /Night Watch|debug|freeze|playtest/i)
  assert.doesNotMatch(
    latestChange('1.4.349').items.join('\n'),
    /Fixes #508|Closes #508|Resolves #508|Fixes #470|Closes #470|Resolves #470/i,
    '1.4.349 changelog avoids GitHub close keywords',
  )
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
    new URL('../src/easyTrail/father/FatherRunPlay.tsx', import.meta.url),
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
    new URL('../src/easyTrail/father/FatherRunPlay.tsx', import.meta.url),
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
    new URL('../src/easyTrail/father/FatherRunPlay.tsx', import.meta.url),
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
    new URL('../src/easyTrail/father/FatherRunPlay.tsx', import.meta.url),
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
    new URL('../src/easyTrail/father/FatherRunPlay.tsx', import.meta.url),
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
    new URL('../src/easyTrail/father/FatherRunPlay.tsx', import.meta.url),
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
    new URL('../src/easyTrail/father/FatherRunPlay.tsx', import.meta.url),
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

// Easy Clear 1.4.241: Easy Story Snap ≤720 / phone portrait HUD peel (invent Fun/Clear)
{
  const snapCss241 = readFileSync(new URL('../src/styles/storySnap.css', import.meta.url), 'utf8')
  const snapPlay241 = readFileSync(
    new URL('../src/components/challenges/StorySnapPlayView.tsx', import.meta.url),
    'utf8',
  )
  assert.match(snapCss241, /1\.4\.241: Easy Story Snap ≤720 \/ phone portrait HUD peel/)
  assert.match(
    snapCss241,
    /@media \(max-height: 920px\) \{[\s\S]*?\.play\.is-story-snap \.eyebrow \{[\s\S]*?display: none/,
  )
  assert.match(
    snapCss241,
    /@media \(max-height: 920px\) \{[\s\S]*?\.play\.is-story-snap \.easy-who-where-line \{[\s\S]*?display: none/,
  )
  assert.match(snapPlay241, /1\.4\.241: phone portrait extends HUD peel 182/)
  assert.match(cssSrc, /1\.4\.241: Easy Story Snap ≤720 \/ phone portrait HUD peel/)
  assert.match(latestChange('1.4.241').items.join('\n'), /HUD peel|eyebrow|who·where|phone portrait|Story Snap|invent Fun\/Clear/i)
  assert.match(latestChange('1.4.241').title, /Easy Story Snap|≤720|HUD peel/i)
  assert.doesNotMatch(
    latestChange('1.4.241').items.join('\n'),
    /Fixes #250|Fixes #251|Fixes #252|Fixes #253|#272|#273|#274|#275|#276|#277|#280|#281|#282|#283|#296|#297|#298|#299|#300|#301|#302|#314|#315|#316|#317|#318|#319|Father Dash|Learn cream|Samaritan|Manage|Lock In|Dig|Hold|Sort|Link|Build|Sequence|Claim merge|Creed|Source dig|Story Creek|Match picture|score→CTA|triad→Home|bowl→CTA|fill 197|pad→CTA/i,
    '1.4.241 must not fix phone-fail issues or climb another Easy surface',
  )
}

// Easy Clear 1.4.242: Easy Hold ≤720 / phone portrait HUD peel (invent Fun/Clear)
{
  const holdCss242 = readFileSync(new URL('../src/styles/sortHold.css', import.meta.url), 'utf8')
  const whyBlast242 = readFileSync(
    new URL('../src/components/challenges/WhyBlastPlay.tsx', import.meta.url),
    'utf8',
  )
  assert.match(holdCss242, /1\.4\.242: Easy Hold ≤720 \/ phone portrait HUD peel/)
  assert.match(
    holdCss242,
    /@media \(max-height: 920px\) \{[\s\S]*?\.recall-gate\.is-easy-hold\.is-why-blast:has\(\.why-blast\) > \.eyebrow \{[\s\S]*?display: none/,
  )
  assert.match(
    holdCss242,
    /@media \(max-height: 920px\) \{[\s\S]*?\.why-arena \.held-from\.quiet \{[\s\S]*?display: none/,
  )
  assert.match(whyBlast242, /1\.4\.242: phone portrait extends HUD peel 170/)
  assert.match(cssSrc, /1\.4\.242: Easy Hold ≤720 \/ phone portrait HUD peel/)
  assert.match(latestChange('1.4.242').items.join('\n'), /HUD peel|eyebrow|quiet From|phone portrait|Hold|invent Fun\/Clear/i)
  assert.match(latestChange('1.4.242').title, /Easy Hold|≤720|HUD peel/i)
  assert.doesNotMatch(
    latestChange('1.4.242').items.join('\n'),
    /Fixes #250|Fixes #251|Fixes #252|Fixes #253|#272|#273|#274|#275|#276|#277|#280|#281|#282|#283|#296|#297|#298|#299|#300|#301|#302|#314|#315|#316|#317|#318|#319|Father Dash|Learn cream|Samaritan|Manage|Lock In|Dig|Sort|Link|Build|Sequence|Claim merge|Creed|Source dig|Story Creek|Story Snap|Match picture|score→CTA|triad→Home|bowl→CTA|fill 190|dock 202|hud→arena/i,
    '1.4.242 must not fix phone-fail issues or climb another Easy surface',
  )
}


// Easy Clear 1.4.243: Easy Sequence / Build ≤720 / phone portrait board-first HUD peel (invent Fun/Clear)
{
  const seqBuildCss243 = readFileSync(new URL('../src/styles/sortHold.css', import.meta.url), 'utf8')
  const seqPlay243 = readFileSync(
    new URL('../src/components/challenges/SequencePlay.tsx', import.meta.url),
    'utf8',
  )
  const buildPlay243 = readFileSync(
    new URL('../src/components/challenges/BuildArgumentPlay.tsx', import.meta.url),
    'utf8',
  )
  assert.match(seqBuildCss243, /1\.4\.243: Easy Sequence \/ Build ≤720 \/ phone portrait board-first HUD peel/)
  assert.match(
    seqBuildCss243,
    /@media \(max-height: 920px\) \{[\s\S]*?\.play\.is-sequence,\s*\n\s*\.play\.is-build \{[\s\S]*?gap: 3px/,
  )
  assert.match(
    seqBuildCss243,
    /@media \(max-height: 920px\) \{[\s\S]*?\.play\.is-sequence \.sort-how,\s*\n\s*\.play\.is-build \.sort-how \{[\s\S]*?display: none/,
  )
  assert.match(
    seqBuildCss243,
    /@media \(max-height: 920px\) \{[\s\S]*?\.play\.is-sequence \.easy-hint,\s*\n\s*\.play\.is-build \.easy-hint/,
  )
  assert.match(seqPlay243, /1\.4\.243: phone portrait extends board-first HUD peel 171/)
  assert.match(buildPlay243, /1\.4\.243: phone portrait extends board-first HUD peel 171/)
  assert.match(cssSrc, /1\.4\.243: Easy Sequence \/ Build ≤720 \/ phone portrait board-first HUD peel/)
  assert.match(latestChange('1.4.243').items.join('\n'), /board-first|HUD peel|how|hint|phone portrait|Sequence|Build|invent Fun\/Clear/i)
  assert.match(latestChange('1.4.243').title, /Easy Sequence|Build|≤720|board-first|HUD/i)
  assert.doesNotMatch(
    latestChange('1.4.243').items.join('\n'),
    /Fixes #250|Fixes #251|Fixes #252|Fixes #253|#272|#273|#274|#275|#276|#277|#280|#281|#282|#283|#296|#297|#298|#299|#300|#301|#302|#314|#315|#316|#317|#318|#319|Father Dash|Learn cream|Samaritan|Manage|Lock In|Dig|Sort|Link|Hold|Claim merge|Creed|Source dig|Story Creek|Story Snap|Match picture|score→CTA|triad→Home|bowl→CTA|fill 221|fill 222|stones→result/i,
    '1.4.243 must not fix phone-fail issues or climb another Easy surface',
  )
}


// Easy Clear 1.4.244: Easy Sort ≤720 / phone portrait board-first HUD peel (invent Fun/Clear)
{
  const sortCss244 = readFileSync(new URL('../src/styles/sortHold.css', import.meta.url), 'utf8')
  const sortPlay244 = readFileSync(
    new URL('../src/components/challenges/SortPlay.tsx', import.meta.url),
    'utf8',
  )
  assert.match(sortCss244, /1\.4\.244: Easy Sort ≤720 \/ phone portrait board-first HUD peel/)
  assert.match(
    sortCss244,
    /@media \(max-height: 920px\) \{[\s\S]*?\.play\.is-easy-sort \{[\s\S]*?gap: 3px/,
  )
  assert.match(
    sortCss244,
    /@media \(max-height: 920px\) \{[\s\S]*?\.play\.is-easy-sort \.sort-how \{[\s\S]*?display: none/,
  )
  assert.match(
    sortCss244,
    /@media \(max-height: 920px\) \{[\s\S]*?\.play\.is-easy-sort \.easy-hint,\s*\n\s*\.play\.is-easy-sort \.hint-peek/,
  )
  assert.match(sortPlay244, /1\.4\.244: phone portrait extends board-first HUD peel 183/)
  assert.match(cssSrc, /1\.4\.244: Easy Sort ≤720 \/ phone portrait board-first HUD peel/)
  assert.match(latestChange('1.4.244').items.join('\n'), /board-first|HUD peel|how|hint|phone portrait|Sort|Keep|invent Fun\/Clear/i)
  assert.match(latestChange('1.4.244').title, /Easy Sort|≤720|board-first|HUD/i)
  assert.doesNotMatch(
    latestChange('1.4.244').items.join('\n'),
    /Fixes #250|Fixes #251|Fixes #252|Fixes #253|#272|#273|#274|#275|#276|#277|#280|#281|#282|#283|#296|#297|#298|#299|#300|#301|#302|#314|#315|#316|#317|#318|#319|Father Dash|Learn cream|Samaritan|Manage|Lock In|Dig|Sequence|Build|Hold|Claim merge|Creed|Source dig|Story Creek|Story Snap|Match picture|score→CTA|triad→Home|bowl→CTA|fill 198|fill 218|stones→result/i,
    '1.4.244 must not fix phone-fail issues or climb another Easy surface',
  )
}


// Easy Clear 1.4.245: Easy Learn ≤720 / tall-phone bottom purple void residual (Fixes #331)
{
  const welcomeCss245 = readFileSync(new URL('../src/styles/welcome.css', import.meta.url), 'utf8')
  const teachUnlock245 = readFileSync(
    new URL('../src/components/TeachUnlock.tsx', import.meta.url),
    'utf8',
  )
  assert.match(welcomeCss245, /1\.4\.245: Easy Learn ≤720 \/ tall-phone bottom purple void residual/)
  assert.match(
    welcomeCss245,
    /@media \(max-height: 920px\) \{[\s\S]*?\.easy-story-card\.teach-gate \{[\s\S]*?background: var\(--parchment/,
  )
  assert.match(
    welcomeCss245,
    /@media \(max-height: 920px\) \{[\s\S]*?\.easy-story-card \.held-triad \{[\s\S]*?align-content: space-between/,
  )
  assert.match(
    welcomeCss245,
    /@media \(max-height: 920px\) \{[\s\S]*?\.cta-dock\.easy-story-dock \{[\s\S]*?position: static[\s\S]*?margin-top: auto/,
  )
  assert.match(teachUnlock245, /1\.4\.245: tall-phone cream-card fill/)
  assert.match(cssSrc, /1\.4\.245: Easy Learn ≤720 \/ tall-phone bottom purple void residual/)
  assert.match(latestChange('1.4.245').items.join('\n'), /Fixes #331|purple void|cream|parchment|Learn|tall-phone|space-between/i)
  assert.match(latestChange('1.4.245').title, /Easy Learn|≤720|tall-phone|purple void|Fixes #331/i)
  assert.doesNotMatch(
    latestChange('1.4.245').items.join('\n'),
    /Fixes #250|Fixes #251|Fixes #252|Fixes #253|#272|#273|#274|#275|#276|#277|#280|#281|#282|#283|#296|#297|#298|#299|#300|#301|#302|#314|#315|#316|#317|#318|#319|Father Dash|Match grid|Samaritan|Manage|Lock In|Dig|Creed|Build|Sort|Snap|Link|Road maze|Claim merge|Source dig|Story Creek|invent Fun\/Clear/i,
    '1.4.245 must not fix other phone-fail issues or climb another Easy surface',
  )
}

// Easy Clear 1.4.246: Easy Match ≤720 / tall-phone grid→footer purple void residual (Fixes #332)
{
  const matchCss246 = readFileSync(new URL('../src/styles/match.css', import.meta.url), 'utf8')
  const matchArtTight246 = readFileSync(
    new URL('../src/styles/match-art-tight.css', import.meta.url),
    'utf8',
  )
  const matchPlay246 = readFileSync(
    new URL('../src/components/challenges/MatchPlay.tsx', import.meta.url),
    'utf8',
  )
  const gemPlay246 = readFileSync(
    new URL('../src/components/challenges/GemSearchPlay.tsx', import.meta.url),
    'utf8',
  )
  assert.match(matchCss246, /1\.4\.246: Easy Match ≤720 \/ tall-phone grid→footer purple void residual/)
  assert.match(
    matchCss246,
    /@media \(max-height: 920px\) \{[\s\S]*?\.play\.is-match\.is-deal \.match-grid \{[\s\S]*?background: var\(--parchment/,
  )
  assert.match(
    matchCss246,
    /@media \(max-height: 920px\) \{[\s\S]*?\.play\.is-match\.is-deal \.cta-dock \{[\s\S]*?position: static[\s\S]*?margin-top: auto/,
  )
  assert.match(matchArtTight246, /1\.4\.246: Easy Match gemSearch ≤720 \/ tall-phone grid→footer purple void residual/)
  assert.match(
    matchArtTight246,
    /@media \(max-height: 920px\) \{[\s\S]*?\.play\.is-gem-search\.is-panel-blast\.is-story-docked \.gem-scroll \{[\s\S]*?background: var\(--parchment/,
  )
  assert.match(
    matchArtTight246,
    /@media \(max-height: 920px\) \{[\s\S]*?\.play\.is-gem-search\.is-panel-blast\.is-story-docked \.gem-board \{[\s\S]*?aspect-ratio: auto/,
  )
  assert.match(
    matchArtTight246,
    /@media \(max-height: 920px\) \{[\s\S]*?\.play\.is-gem-search\.is-panel-blast\.is-story-docked \.cta-dock \{[\s\S]*?position: static[\s\S]*?margin-top: auto/,
  )
  assert.match(matchPlay246, /1\.4\.246: tall-phone cream-card fill/)
  assert.match(gemPlay246, /1\.4\.246: tall-phone cream board-plate fill/)
  assert.match(cssSrc, /1\.4\.246: Easy Match ≤720 \/ tall-phone grid→footer purple void residual/)
  assert.match(latestChange('1.4.246').items.join('\n'), /Fixes #332|purple void|cream|parchment|Match|tall-phone|board/i)
  assert.match(latestChange('1.4.246').title, /Easy Match|≤720|tall-phone|purple void|Fixes #332/i)
  assert.doesNotMatch(
    latestChange('1.4.246').items.join('\n'),
    /Fixes #250|Fixes #251|Fixes #252|Fixes #253|#272|#273|#274|#275|#276|#277|#280|#281|#282|#283|#296|#297|#298|#299|#300|#301|#302|#314|#315|#316|#317|#318|#319|#331|Father Dash|Learn cream|Samaritan|Manage|Lock In|Dig|Creed|Build|Sort|Snap|Link|Road maze|Claim merge|Source dig|Story Creek|invent Fun\/Clear/i,
    '1.4.246 must not fix other phone-fail issues or climb another Easy surface',
  )
}

// Easy Clear 1.4.247: Easy Lock In quiz ≤720 / tall-phone bottom-half purple void residual (Fixes #333)
{
  const holdCss247 = readFileSync(new URL('../src/styles/sortHold.css', import.meta.url), 'utf8')
  const whyPlay247 = readFileSync(
    new URL('../src/components/challenges/WhyBlastPlay.tsx', import.meta.url),
    'utf8',
  )
  assert.match(holdCss247, /1\.4\.247: Easy Lock In quiz ≤720 \/ tall-phone bottom-half purple void residual/)
  assert.match(
    holdCss247,
    /\.journal\.is-rehearse:has\(\.why-blast:not\(\.is-miss-teach\):not\(\.is-win\)\) \.recall-gate\.is-easy-hold \{[\s\S]*?background: var\(--parchment/,
  )
  assert.match(
    holdCss247,
    /@media \(max-height: 920px\) \{[\s\S]*?\.why-blast:not\(\.is-miss-teach\):not\(\.is-win\) \.why-arena \{[\s\S]*?flex: 1 1 0/,
  )
  assert.match(
    holdCss247,
    /@media \(max-height: 920px\) \{[\s\S]*?\.why-blast:not\(\.is-miss-teach\):not\(\.is-win\) \.cta-dock[\s\S]*?position: static[\s\S]*?margin-top: auto/,
  )
  assert.match(whyPlay247, /1\.4\.247: tall-phone cream-card fill/)
  assert.match(cssSrc, /1\.4\.247: Easy Lock In quiz ≤720 \/ tall-phone bottom-half purple void residual/)
  assert.match(latestChange('1.4.247').items.join('\n'), /Fixes #333|purple void|cream|parchment|Lock In quiz|tall-phone/i)
  assert.match(latestChange('1.4.247').title, /Easy Lock In quiz|≤720|tall-phone|purple void|Fixes #333/i)
  assert.doesNotMatch(
    latestChange('1.4.247').items.join('\n'),
    /Fixes #250|Fixes #251|Fixes #252|Fixes #253|#272|#273|#274|#275|#276|#277|#280|#281|#282|#283|#296|#297|#298|#299|#300|#301|#302|#314|#315|#316|#317|#318|#319|#331|#332|Father Dash|Learn cream|Match grid|Samaritan|Manage|miss teach|Dig|Creed|Build|Sort|Snap|Link|Road maze|Claim merge|Source dig|Story Creek|invent Fun\/Clear/i,
    '1.4.247 must not fix other phone-fail issues or climb another Easy surface',
  )
}

// Easy Clear 1.4.248: Easy Lock In feedback ≤720 / tall-phone bottom-half purple void residual (Fixes #334)
{
  const holdCss248 = readFileSync(new URL('../src/styles/sortHold.css', import.meta.url), 'utf8')
  const whyPlay248 = readFileSync(
    new URL('../src/components/challenges/WhyBlastPlay.tsx', import.meta.url),
    'utf8',
  )
  assert.match(holdCss248, /1\.4\.248: Easy Lock In feedback ≤720 \/ tall-phone bottom-half purple void residual/)
  assert.match(
    holdCss248,
    /\.journal\.is-rehearse:has\(\.why-blast\.is-miss-teach\) \.recall-gate\.is-easy-hold \{[\s\S]*?background: var\(--parchment/,
  )
  assert.match(
    holdCss248,
    /@media \(max-height: 920px\) \{[\s\S]*?\.why-blast\.is-miss-teach \.why-miss-teach \{[\s\S]*?background: transparent/,
  )
  assert.match(
    holdCss248,
    /@media \(max-height: 920px\) \{[\s\S]*?\.why-blast\.is-miss-teach \.why-miss-teach \.cta-dock[\s\S]*?position: static[\s\S]*?margin-top: auto/,
  )
  assert.match(whyPlay248, /1\.4\.248: tall-phone cream-card fill/)
  assert.match(cssSrc, /1\.4\.248: Easy Lock In feedback ≤720 \/ tall-phone bottom-half purple void residual/)
  assert.match(latestChange('1.4.248').items.join('\n'), /Fixes #334|purple void|cream|parchment|Lock In feedback|miss-teach|tall-phone/i)
  assert.match(latestChange('1.4.248').title, /Easy Lock In feedback|≤720|tall-phone|purple void|Fixes #334/i)
  assert.doesNotMatch(
    latestChange('1.4.248').items.join('\n'),
    /Fixes #250|Fixes #251|Fixes #252|Fixes #253|#272|#273|#274|#275|#276|#277|#280|#281|#282|#283|#296|#297|#298|#299|#300|#301|#302|#314|#315|#316|#317|#318|#319|#331|#332|#333|Father Dash|Learn cream|Match grid|Samaritan|Manage|live quiz|Dig|Creed|Build|Sort|Snap|Link|Road maze|Claim merge|Source dig|Story Creek|invent Fun\/Clear/i,
    '1.4.248 must not fix other phone-fail issues or climb another Easy surface',
  )
}

// Easy Clear 1.4.249: Easy Samaritan / Story Creek road maze ≤720 / tall-phone voids above/below board residual (Fixes #335)
{
  const mazeCss249 = readFileSync(new URL('../src/styles/maze.css', import.meta.url), 'utf8')
  const roadPlay249 = readFileSync(
    new URL('../src/components/challenges/RoadMazePlay.tsx', import.meta.url),
    'utf8',
  )
  assert.match(mazeCss249, /1\.4\.249: Easy Samaritan \/ Story Creek road maze ≤720 \/ tall-phone voids above\/below board residual/)
  assert.match(
    mazeCss249,
    /\.play\.is-road-maze \.maze-stage \{[\s\S]*?background: var\(--parchment/,
  )
  assert.match(
    mazeCss249,
    /@media \(max-height: 920px\) \{[\s\S]*?\.play\.is-road-maze \.maze-board \{[\s\S]*?aspect-ratio: auto[\s\S]*?background: color-mix\(in srgb, var\(--parchment/,
  )
  assert.match(
    mazeCss249,
    /@media \(max-height: 920px\) \{[\s\S]*?\.play\.is-road-maze \.cta-dock \{[\s\S]*?position: static[\s\S]*?margin-top: auto/,
  )
  assert.match(roadPlay249, /1\.4\.249: tall-phone cream board-plate fill/)
  assert.match(cssSrc, /1\.4\.249: Easy Samaritan \/ Story Creek road maze ≤720 \/ tall-phone voids above\/below board residual/)
  assert.match(latestChange('1.4.249').items.join('\n'), /Fixes #335|purple void|cream|parchment|Samaritan|tall-phone|board/i)
  assert.match(latestChange('1.4.249').title, /Easy Samaritan|≤720|tall-phone|voids above\/below|Fixes #335/i)
  assert.doesNotMatch(
    latestChange('1.4.249').items.join('\n'),
    /Fixes #250|Fixes #251|Fixes #252|Fixes #253|#272|#273|#274|#275|#276|#277|#280|#281|#282|#283|#296|#297|#298|#299|#300|#301|#302|#314|#315|#316|#317|#318|#319|#331|#332|#333|#334|Father Dash|Learn cream|Match grid|Manage|Lock In|Dig|Creed|Build|Sort|Snap|Link|Claim merge|Source dig|invent Fun\/Clear|Sequence/i,
    '1.4.249 must not fix other phone-fail issues or climb another Easy surface',
  )
}

// Easy Clear 1.4.250: Easy Father Dash ≤720 / tall-phone rail→CTA purple void residual (Fixes #336)
{
  const indexCss250 = readFileSync(new URL('../src/index.css', import.meta.url), 'utf8')
  const fatherPlay250 = readFileSync(
    new URL('../src/easyTrail/father/FatherRunPlay.tsx', import.meta.url),
    'utf8',
  )
  assert.match(indexCss250, /1\.4\.250: Easy Father Dash ≤720 \/ tall-phone rail→CTA purple void residual/)
  assert.match(
    indexCss250,
    /1\.4\.250: Easy Father Dash ≤720 \/ tall-phone rail→CTA purple void residual[\s\S]*?\.play\.is-father-run,[\s\S]*?background: var\(--parchment/,
  )
  assert.match(
    indexCss250,
    /@media \(max-height: 920px\) \{[\s\S]*?\.play\.is-father-run \.run-scene \{[\s\S]*?flex: 1 1 0/,
  )
  assert.match(
    indexCss250,
    /@media \(max-height: 920px\) \{[\s\S]*?\.play\.is-father-run \.cta-dock,\s*\n\s*\.play\.is-father-run \.cta-dock\.run-dock \{[\s\S]*?position: static[\s\S]*?margin-top: auto/,
  )
  assert.match(fatherPlay250, /1\.4\.250: tall-phone cream plate fill/)
  assert.match(cssSrc, /1\.4\.250: Easy Father Dash ≤720 \/ tall-phone rail→CTA purple void residual/)
  assert.match(latestChange('1.4.250').items.join('\n'), /Fixes #336|purple void|cream|parchment|Father Dash|tall-phone|rail→CTA/i)
  assert.match(latestChange('1.4.250').title, /Easy Father Dash|≤720|tall-phone|rail→CTA|purple void|Fixes #336/i)
  assert.doesNotMatch(
    latestChange('1.4.250').items.join('\n'),
    /Fixes #250|Fixes #251|Fixes #252|Fixes #253|#272|#273|#274|#275|#276|#277|#280|#281|#282|#283|#296|#297|#298|#299|#300|#301|#302|#314|#315|#316|#317|#318|#319|#331|#332|#333|#334|#335|Learn cream|Match grid|Samaritan|Manage|Lock In|Dig|Creed|Build|Sort|Snap|Link|Claim merge|Source dig|invent Fun\/Clear|Sequence|Story Creek HOLD/i,
    '1.4.250 must not fix other phone-fail issues or climb another Easy surface',
  )
}

// Easy Clear 1.4.251: Easy Home dock Learn / Lock In contrast (Fixes #343)
{
  const indexCss251 = readFileSync(new URL('../src/index.css', import.meta.url), 'utf8')
  const hub251 = readFileSync(new URL('../src/components/Hub.tsx', import.meta.url), 'utf8')
  assert.match(indexCss251, /1\.4\.251: Easy Home dock Learn \/ Lock In contrast/)
  assert.match(
    indexCss251,
    /1\.4\.251: Easy Home dock Learn \/ Lock In contrast[\s\S]*?\.hub\.is-easy-home \.easy-coach-step,[\s\S]*?color: var\(--parchment/,
  )
  assert.match(
    indexCss251,
    /\.hub\.is-easy-home \.easy-coach-step,[\s\S]*?-webkit-text-fill-color: var\(--parchment/,
  )
  assert.match(
    indexCss251,
    /\.hub\.is-easy-home \.easy-coach-step,[\s\S]*?opacity: 1[\s\S]*?border-color: rgba\(255, 204, 51, 0\.55\)/,
  )
  assert.match(hub251, /1\.4\.251: parchment coach labels/)
  assert.match(cssSrc, /1\.4\.251: Easy Home dock Learn \/ Lock In contrast/)
  assert.match(latestChange('1.4.251').items.join('\n'), /Fixes #343|contrast|parchment|Learn|Lock In|coach|dock/i)
  assert.match(latestChange('1.4.251').title, /Easy Home|Learn|Lock In|contrast|Fixes #343/i)
  assert.doesNotMatch(
    latestChange('1.4.251').items.join('\n'),
    /Fixes #250|Fixes #251|Fixes #252|Fixes #253|#272|#273|#274|#275|#276|#277|#280|#281|#282|#283|#296|#297|#298|#299|#300|#301|#302|#314|#315|#316|#317|#318|#319|#331|#332|#333|#334|#335|#336|Learn cream|Match grid|Samaritan|Manage|Father Dash|Dig|Creed|Build|Sort|Snap|Link|Claim merge|Source dig|invent Fun\/Clear|Sequence|Story Creek HOLD|purple void residual/i,
    '1.4.251 must not fix other phone-fail issues or climb another Easy surface',
  )
}

// Easy Clear 1.4.252: Easy Learn ≤720 / tall-phone purple void residual after cream 245 (Fixes #344)
{
  const welcomeCss252 = readFileSync(new URL('../src/styles/welcome.css', import.meta.url), 'utf8')
  const teachUnlock252 = readFileSync(
    new URL('../src/components/TeachUnlock.tsx', import.meta.url),
    'utf8',
  )
  assert.match(welcomeCss252, /1\.4\.252: Easy Learn ≤720 \/ tall-phone purple void residual after cream 245/)
  assert.match(
    welcomeCss252,
    /1\.4\.252: Easy Learn ≤720 \/ tall-phone purple void residual after cream 245[\s\S]*?\.app-body:has\(\.challenge-page\.is-teach \.easy-story-card\) \{[\s\S]*?background: #fff6e8/,
  )
  assert.match(
    welcomeCss252,
    /1\.4\.252: Easy Learn ≤720 \/ tall-phone purple void residual after cream 245[\s\S]*?\.challenge-page\.is-teach:has\(\.easy-story-card\) \{[\s\S]*?background: #fff6e8/,
  )
  assert.match(
    welcomeCss252,
    /1\.4\.252: Easy Learn ≤720 \/ tall-phone purple void residual after cream 245[\s\S]*?\.recall-gate\.easy-story-card\.teach-gate[\s\S]*?background-image: none[\s\S]*?background: #fff6e8/,
  )
  assert.match(
    welcomeCss252,
    /1\.4\.252: Easy Learn ≤720 \/ tall-phone purple void residual after cream 245[\s\S]*?\.cta-dock\.easy-story-dock \{[\s\S]*?position: static[\s\S]*?margin-top: auto[\s\S]*?background: #fff6e8/,
  )
  assert.match(teachUnlock252, /1\.4\.252: tall-phone cream shell fill/)
  assert.match(cssSrc, /1\.4\.252: Easy Learn ≤720 \/ tall-phone purple void residual after cream 245/)
  assert.match(latestChange('1.4.252').items.join('\n'), /Fixes #344|purple void|cream|parchment|Learn|tall-phone|teach-gate|shell/i)
  assert.match(latestChange('1.4.252').title, /Easy Learn|≤720|tall-phone|purple void|Fixes #344/i)
  assert.doesNotMatch(
    latestChange('1.4.252').items.join('\n'),
    /Fixes #250|Fixes #251|Fixes #252|Fixes #253|#272|#273|#274|#275|#276|#277|#280|#281|#282|#283|#296|#297|#298|#299|#300|#301|#302|#314|#315|#316|#317|#318|#319|#331|#332|#333|#334|#335|#336|#343|Match grid|Samaritan|Manage|Father Dash|Lock In|Dig|Creed|Build|Sort|Snap|Link|Claim merge|Source dig|invent Fun\/Clear|Sequence|Story Creek HOLD|Home dock|coach/i,
    '1.4.252 must not fix other phone-fail issues or climb another Easy surface',
  )
}

// Easy Clear 1.4.253: Easy Match ≤720 / tall-phone purple void residual after cream 246 (Fixes #345)
{
  const matchCss253 = readFileSync(new URL('../src/styles/match.css', import.meta.url), 'utf8')
  const matchArtTight253 = readFileSync(
    new URL('../src/styles/match-art-tight.css', import.meta.url),
    'utf8',
  )
  const matchPlay253 = readFileSync(
    new URL('../src/components/challenges/MatchPlay.tsx', import.meta.url),
    'utf8',
  )
  const gemPlay253 = readFileSync(
    new URL('../src/components/challenges/GemSearchPlay.tsx', import.meta.url),
    'utf8',
  )
  assert.match(matchArtTight253, /1\.4\.253: Easy Match gemSearch ≤720 \/ tall-phone purple void residual after cream 246/)
  assert.match(
    matchArtTight253,
    /1\.4\.253: Easy Match gemSearch ≤720 \/ tall-phone purple void residual after cream 246[\s\S]*?\.app-body:has\(\.play\.is-gem-search\.is-panel-blast\.is-story-docked\) \{[\s\S]*?background: #fff6e8/,
  )
  assert.match(
    matchArtTight253,
    /1\.4\.253: Easy Match gemSearch ≤720 \/ tall-phone purple void residual after cream 246[\s\S]*?\.play\.is-gem-search\.is-panel-blast\.is-story-docked,[\s\S]*?background-image: none[\s\S]*?background: #fff6e8/,
  )
  assert.match(
    matchArtTight253,
    /1\.4\.253: Easy Match gemSearch ≤720 \/ tall-phone purple void residual after cream 246[\s\S]*?\.gem-scroll \{[\s\S]*?background: #fff6e8/,
  )
  assert.match(
    matchArtTight253,
    /1\.4\.253: Easy Match gemSearch ≤720 \/ tall-phone purple void residual after cream 246[\s\S]*?\.gem-board \{[\s\S]*?aspect-ratio: auto/,
  )
  assert.match(
    matchArtTight253,
    /1\.4\.253: Easy Match gemSearch ≤720 \/ tall-phone purple void residual after cream 246[\s\S]*?\.cta-dock \{[\s\S]*?position: static[\s\S]*?background: #fff6e8/,
  )
  assert.match(matchCss253, /1\.4\.253: Easy Match picture-deal ≤720 \/ tall-phone purple void residual after cream 246/)
  assert.match(
    matchCss253,
    /1\.4\.253: Easy Match picture-deal ≤720 \/ tall-phone purple void residual after cream 246[\s\S]*?\.play\.is-match\.is-deal[\s\S]*?background: #fff6e8/,
  )
  assert.match(
    matchCss253,
    /1\.4\.253: Easy Match picture-deal ≤720 \/ tall-phone purple void residual after cream 246[\s\S]*?\.match-grid \{[\s\S]*?background: #fff6e8/,
  )
  assert.match(gemPlay253, /1\.4\.253: tall-phone cream shell fill/)
  assert.match(matchPlay253, /1\.4\.253: tall-phone cream shell fill/)
  assert.match(cssSrc, /1\.4\.253: Easy Match gemSearch ≤720 \/ tall-phone purple void residual after cream 246/)
  assert.match(latestChange('1.4.253').items.join('\n'), /Fixes #345|purple void|cream|parchment|Match|tall-phone|gem-scroll|shell|board/i)
  assert.match(latestChange('1.4.253').title, /Easy Match|≤720|tall-phone|purple void|Fixes #345/i)
  assert.doesNotMatch(
    latestChange('1.4.253').items.join('\n'),
    /Fixes #250|Fixes #251|Fixes #252|Fixes #253|#272|#273|#274|#275|#276|#277|#280|#281|#282|#283|#296|#297|#298|#299|#300|#301|#302|#314|#315|#316|#317|#318|#319|#331|#332|#333|#334|#335|#336|#343|#344|Learn cream|teach-gate|Samaritan|Manage|Father Dash|Lock In|Dig|Creed|Build|Sort|Snap|Link|Claim merge|Source dig|invent Fun\/Clear|Sequence|Story Creek HOLD|Home dock|coach/i,
    '1.4.253 must not fix other phone-fail issues or climb another Easy surface',
  )
}

// Easy Clear 1.4.254: Easy Lock In quiz ≤720 / tall-phone purple void residual after cream 247 (Fixes #346)
{
  const holdCss254 = readFileSync(new URL('../src/styles/sortHold.css', import.meta.url), 'utf8')
  const whyPlay254 = readFileSync(
    new URL('../src/components/challenges/WhyBlastPlay.tsx', import.meta.url),
    'utf8',
  )
  assert.match(holdCss254, /1\.4\.254: Easy Lock In quiz ≤720 \/ tall-phone purple void residual after cream 247/)
  assert.match(
    holdCss254,
    /1\.4\.254: Easy Lock In quiz ≤720 \/ tall-phone purple void residual after cream 247[\s\S]*?\.app-body:has\(\.journal\.is-rehearse \.why-blast:not\(\.is-miss-teach\):not\(\.is-win\)\) \{[\s\S]*?background: #fff6e8/,
  )
  assert.match(
    holdCss254,
    /1\.4\.254: Easy Lock In quiz ≤720 \/ tall-phone purple void residual after cream 247[\s\S]*?\.journal\.is-rehearse:has\(\.why-blast:not\(\.is-miss-teach\):not\(\.is-win\)\) \{[\s\S]*?background: #fff6e8/,
  )
  assert.match(
    holdCss254,
    /1\.4\.254: Easy Lock In quiz ≤720 \/ tall-phone purple void residual after cream 247[\s\S]*?\.recall-gate\.is-easy-hold \{[\s\S]*?background-image: none[\s\S]*?background: #fff6e8/,
  )
  assert.match(
    holdCss254,
    /1\.4\.254: Easy Lock In quiz ≤720 \/ tall-phone purple void residual after cream 247[\s\S]*?\.cta-dock[\s\S]*?position: static[\s\S]*?margin-top: auto[\s\S]*?background: #fff6e8/,
  )
  assert.match(whyPlay254, /1\.4\.254: tall-phone cream shell fill/)
  assert.match(cssSrc, /1\.4\.254: Easy Lock In quiz ≤720 \/ tall-phone purple void residual after cream 247/)
  assert.match(latestChange('1.4.254').items.join('\n'), /Fixes #346|purple void|cream|parchment|Lock In quiz|tall-phone|recall-gate|shell/i)
  assert.match(latestChange('1.4.254').title, /Easy Lock In quiz|≤720|tall-phone|purple void|Fixes #346/i)
  assert.doesNotMatch(
    latestChange('1.4.254').items.join('\n'),
    /Fixes #250|Fixes #251|Fixes #252|Fixes #253|#272|#273|#274|#275|#276|#277|#280|#281|#282|#283|#296|#297|#298|#299|#300|#301|#302|#314|#315|#316|#317|#318|#319|#331|#332|#333|#334|#335|#336|#343|#344|#345|#347|Learn cream|teach-gate|Match grid|gem-scroll|Samaritan|Manage|Father Dash|miss teach|Dig|Creed|Build|Sort|Snap|Link|Claim merge|Source dig|invent Fun\/Clear|Sequence|Story Creek HOLD|Home dock|coach/i,
    '1.4.254 must not fix other phone-fail issues or climb another Easy surface',
  )
}

// Easy Clear 1.4.255: Easy Lock In feedback ≤720 / tall-phone purple void + left clip residual after cream 248 (Fixes #347)
{
  const holdCss255 = readFileSync(new URL('../src/styles/sortHold.css', import.meta.url), 'utf8')
  const whyPlay255 = readFileSync(
    new URL('../src/components/challenges/WhyBlastPlay.tsx', import.meta.url),
    'utf8',
  )
  assert.match(holdCss255, /1\.4\.255: Easy Lock In feedback ≤720 \/ tall-phone purple void \+ left clip residual after cream 248/)
  assert.match(
    holdCss255,
    /1\.4\.255: Easy Lock In feedback ≤720 \/ tall-phone purple void \+ left clip residual after cream 248[\s\S]*?\.app-body:has\(\.journal\.is-rehearse \.why-blast\.is-miss-teach\) \{[\s\S]*?background: #fff6e8/,
  )
  assert.match(
    holdCss255,
    /1\.4\.255: Easy Lock In feedback ≤720 \/ tall-phone purple void \+ left clip residual after cream 248[\s\S]*?\.journal\.is-rehearse:has\(\.why-blast\.is-miss-teach\) \{[\s\S]*?background: #fff6e8/,
  )
  assert.match(
    holdCss255,
    /1\.4\.255: Easy Lock In feedback ≤720 \/ tall-phone purple void \+ left clip residual after cream 248[\s\S]*?\.recall-gate\.is-easy-hold \{[\s\S]*?background-image: none[\s\S]*?background: #fff6e8/,
  )
  assert.match(
    holdCss255,
    /1\.4\.255: Easy Lock In feedback ≤720 \/ tall-phone purple void \+ left clip residual after cream 248[\s\S]*?\.cta-dock[\s\S]*?position: static[\s\S]*?margin-top: auto[\s\S]*?background: #fff6e8/,
  )
  assert.match(
    holdCss255,
    /1\.4\.255: Easy Lock In feedback ≤720 \/ tall-phone purple void \+ left clip residual after cream 248[\s\S]*?\.app-body:has\(\.journal\.is-rehearse \.why-blast\.is-miss-teach\) \{[\s\S]*?overflow-x: hidden[\s\S]*?max-width: 100%/,
  )
  assert.match(whyPlay255, /1\.4\.255: tall-phone cream shell fill/)
  assert.match(cssSrc, /1\.4\.255: Easy Lock In feedback ≤720 \/ tall-phone purple void \+ left clip residual after cream 248/)
  assert.match(latestChange('1.4.255').items.join('\n'), /Fixes #347|purple void|cream|parchment|Lock In feedback|miss-teach|tall-phone|recall-gate|shell|left/i)
  assert.match(latestChange('1.4.255').title, /Easy Lock In feedback|≤720|tall-phone|purple void|Fixes #347/i)
  assert.doesNotMatch(
    latestChange('1.4.255').items.join('\n'),
    /Fixes #250|Fixes #251|Fixes #252|Fixes #253|#272|#273|#274|#275|#276|#277|#280|#281|#282|#283|#296|#297|#298|#299|#300|#301|#302|#314|#315|#316|#317|#318|#319|#331|#332|#333|#334|#335|#336|#343|#344|#345|#346|Learn cream|teach-gate|Match grid|gem-scroll|Samaritan|Manage|Father Dash|live quiz|Dig|Creed|Build|Sort|Snap|Link|Claim merge|Source dig|invent Fun\/Clear|Sequence|Story Creek HOLD|Home dock|coach/i,
    '1.4.255 must not fix other phone-fail issues or climb another Easy surface',
  )
}

// Easy Clear 1.4.256: Easy Samaritan / road maze ≤720 / tall-phone purple voids + top clip residual after cream 249 (Fixes #348)
{
  const mazeCss256 = readFileSync(new URL('../src/styles/maze.css', import.meta.url), 'utf8')
  const roadPlay256 = readFileSync(
    new URL('../src/components/challenges/RoadMazePlay.tsx', import.meta.url),
    'utf8',
  )
  assert.match(mazeCss256, /1\.4\.256: Easy Samaritan \/ road maze ≤720 \/ tall-phone purple voids \+ top clip residual after cream 249/)
  assert.match(
    mazeCss256,
    /1\.4\.256: Easy Samaritan \/ road maze ≤720 \/ tall-phone purple voids \+ top clip residual after cream 249[\s\S]*?\.app-body:has\(\.play\.is-road-maze\) \{[\s\S]*?background: #fff6e8/,
  )
  assert.match(
    mazeCss256,
    /1\.4\.256: Easy Samaritan \/ road maze ≤720 \/ tall-phone purple voids \+ top clip residual after cream 249[\s\S]*?\.play\.is-road-maze,[\s\S]*?background: #fff6e8/,
  )
  assert.match(
    mazeCss256,
    /1\.4\.256: Easy Samaritan \/ road maze ≤720 \/ tall-phone purple voids \+ top clip residual after cream 249[\s\S]*?\.maze-stage \{[\s\S]*?background-image: none[\s\S]*?background: #fff6e8/,
  )
  assert.match(
    mazeCss256,
    /1\.4\.256: Easy Samaritan \/ road maze ≤720 \/ tall-phone purple voids \+ top clip residual after cream 249[\s\S]*?\.match-score,[\s\S]*?\.cta-dock \{[\s\S]*?position: static[\s\S]*?margin-top: auto[\s\S]*?background: #fff6e8/,
  )
  assert.match(
    mazeCss256,
    /1\.4\.256: Easy Samaritan \/ road maze ≤720 \/ tall-phone purple voids \+ top clip residual after cream 249[\s\S]*?\.maze-beats \{[\s\S]*?padding-top: 2px/,
  )
  assert.match(roadPlay256, /1\.4\.256: tall-phone cream shell fill/)
  assert.match(cssSrc, /1\.4\.256: Easy Samaritan \/ road maze ≤720 \/ tall-phone purple voids \+ top clip residual after cream 249/)
  assert.match(latestChange('1.4.256').items.join('\n'), /Fixes #348|purple void|cream|parchment|Samaritan|tall-phone|maze-stage|shell|top/i)
  assert.match(latestChange('1.4.256').title, /Easy Samaritan|≤720|tall-phone|purple void|Fixes #348/i)
  assert.doesNotMatch(
    latestChange('1.4.256').items.join('\n'),
    /Fixes #250|Fixes #251|Fixes #252|Fixes #253|#272|#273|#274|#275|#276|#277|#280|#281|#282|#283|#296|#297|#298|#299|#300|#301|#302|#314|#315|#316|#317|#318|#319|#331|#332|#333|#334|#335|#336|#343|#344|#345|#346|#347|Learn cream|teach-gate|Match grid|gem-scroll|Manage|Father Dash|Lock In|Dig|Creed|Build|Sort|Snap|Link|Claim merge|Source dig|invent Fun\/Clear|Sequence|Story Creek HOLD|Home dock|coach/i,
    '1.4.256 must not fix other phone-fail issues or climb another Easy surface',
  )
}

// Easy Clear 1.4.257: Easy Father Dash ≤720 / tall-phone rail→CTA purple void residual after cream 250 (Fixes #349)
{
  const indexCss257 = readFileSync(new URL('../src/index.css', import.meta.url), 'utf8')
  const fatherPlay257 = readFileSync(
    new URL('../src/easyTrail/father/FatherRunPlay.tsx', import.meta.url),
    'utf8',
  )
  assert.match(indexCss257, /1\.4\.257: Easy Father Dash ≤720 \/ tall-phone rail→CTA purple void residual after cream 250/)
  assert.match(
    indexCss257,
    /1\.4\.257: Easy Father Dash ≤720 \/ tall-phone rail→CTA purple void residual after cream 250[\s\S]*?\.app-body:has\(\.play\.is-father-run\) \{[\s\S]*?background: #fff6e8/,
  )
  assert.match(
    indexCss257,
    /1\.4\.257: Easy Father Dash ≤720 \/ tall-phone rail→CTA purple void residual after cream 250[\s\S]*?\.play\.is-father-run,[\s\S]*?background-image: none[\s\S]*?background: #fff6e8/,
  )
  assert.match(
    indexCss257,
    /1\.4\.257: Easy Father Dash ≤720 \/ tall-phone rail→CTA purple void residual after cream 250[\s\S]*?\.play\.is-father-run \.run-scene \{[\s\S]*?flex: 1 1 0/,
  )
  assert.match(
    indexCss257,
    /1\.4\.257: Easy Father Dash ≤720 \/ tall-phone rail→CTA purple void residual after cream 250[\s\S]*?\.play\.is-father-run \.cta-dock,\s*\n\s*\.play\.is-father-run \.cta-dock\.run-dock \{[\s\S]*?position: static[\s\S]*?margin-top: auto[\s\S]*?background: #fff6e8/,
  )
  assert.match(fatherPlay257, /1\.4\.257: tall-phone cream shell fill/)
  assert.match(cssSrc, /1\.4\.257: Easy Father Dash ≤720 \/ tall-phone rail→CTA purple void residual after cream 250/)
  assert.match(latestChange('1.4.257').items.join('\n'), /Fixes #349|purple void|cream|parchment|Father Dash|tall-phone|rail→CTA|shell/i)
  assert.match(latestChange('1.4.257').title, /Easy Father Dash|≤720|tall-phone|rail→CTA|purple void|Fixes #349/i)
  assert.doesNotMatch(
    latestChange('1.4.257').items.join('\n'),
    /Fixes #250|Fixes #251|Fixes #252|Fixes #253|#272|#273|#274|#275|#276|#277|#280|#281|#282|#283|#296|#297|#298|#299|#300|#301|#302|#314|#315|#316|#317|#318|#319|#331|#332|#333|#334|#335|#336|#343|#344|#345|#346|#347|#348|Learn cream|teach-gate|Match grid|gem-scroll|Manage|Samaritan|Lock In|Dig|Creed|Build|Sort|Snap|Link|Claim merge|Source dig|invent Fun\/Clear|Sequence|Story Creek HOLD|Home dock|coach/i,
    '1.4.257 must not fix other phone-fail issues or climb another Easy surface',
  )
}


// Easy Clear 1.4.258: Easy Manage lot sheet tall-phone black void / bottom cutout (Fixes #350)
{
  const indexCss258 = readFileSync(new URL('../src/index.css', import.meta.url), 'utf8')
  const mindMap258 = readFileSync(new URL('../src/components/MindMap.tsx', import.meta.url), 'utf8')
  assert.match(indexCss258, /1\.4\.258: Easy Manage lot sheet tall-phone black void \/ bottom cutout/)
  assert.match(
    indexCss258,
    /1\.4\.258: Easy Manage lot sheet tall-phone black void \/ bottom cutout[\s\S]*?body:has\(\.mind-map\.is-manage\) \{[\s\S]*?background: #12062e/,
  )
  assert.match(
    indexCss258,
    /1\.4\.258: Easy Manage lot sheet tall-phone black void \/ bottom cutout[\s\S]*?\.mind-map\.is-manage \{[\s\S]*?height: 100dvh[\s\S]*?min-height: 100svh/,
  )
  assert.match(
    indexCss258,
    /1\.4\.258: Easy Manage lot sheet tall-phone black void \/ bottom cutout[\s\S]*?\.mind-map\.is-manage::after \{[\s\S]*?background: #241050/,
  )
  assert.match(
    indexCss258,
    /1\.4\.258: Easy Manage lot sheet tall-phone black void \/ bottom cutout[\s\S]*?\.mind-map\.is-manage \.mind-map-card \{[\s\S]*?max-height: min\(52dvh, 460px\)/,
  )
  assert.match(mindMap258, /1\.4\.258: tall-phone opaque bottom belt \+ viewport pin/)
  assert.match(cssSrc, /1\.4\.258: Easy Manage lot sheet tall-phone black void \/ bottom cutout/)
  assert.match(latestChange('1.4.258').items.join('\n'), /Fixes #350|black void|bottom cutout|Manage|opaque|tall-phone/i)
  assert.match(latestChange('1.4.258').title, /Easy Manage|black void|bottom cutout|Fixes #350/i)
  assert.doesNotMatch(
    latestChange('1.4.258').items.join('\n'),
    /Fixes #250|Fixes #251|Fixes #252|Fixes #253|#272|#273|#274|#275|#276|#277|#280|#281|#282|#283|#296|#297|#298|#299|#300|#301|#302|#314|#315|#316|#317|#318|#319|#331|#332|#333|#334|#335|#336|#343|#344|#345|#346|#347|#348|#349|Learn cream|teach-gate|Match grid|gem-scroll|Samaritan|Father Dash|Lock In|Dig|Creed|Build|Sort|Snap|Link|Claim merge|Source dig|invent Fun\/Clear|Sequence|Story Creek HOLD|Home dock|coach|width cutout/i,
    '1.4.258 must not fix other phone-fail issues or climb another Easy surface',
  )
}

// Easy Clear 1.4.259: Easy panel-blast / SNAG bonus ≤720 / phone portrait HUD peel (invent Fun/Clear)
{
  const matchCss259 = readFileSync(new URL('../src/styles/match.css', import.meta.url), 'utf8')
  const snagCss259 = readFileSync(new URL('../src/styles/gem-less-waste.css', import.meta.url), 'utf8')
  const gemPlay259 = readFileSync(
    new URL('../src/components/challenges/GemSearchPlay.tsx', import.meta.url),
    'utf8',
  )
  assert.match(matchCss259, /1\.4\.259: Easy panel-blast \/ SNAG bonus ≤720 \/ phone portrait HUD peel/)
  assert.match(
    matchCss259,
    /@media \(max-height: 920px\) \{[\s\S]*?\.play\.is-gem-search\.is-panel-blast \{[\s\S]*?gap: 3px/,
  )
  assert.match(
    matchCss259,
    /@media \(max-height: 920px\) \{[\s\S]*?\.play\.is-gem-search\.is-panel-blast \.sort-how \{[\s\S]*?display: none/,
  )
  assert.match(
    matchCss259,
    /@media \(max-height: 920px\) \{[\s\S]*?\.play\.is-gem-search\.is-panel-blast\.is-story-docked \.match-teach-say \{[\s\S]*?display: none/,
  )
  assert.match(snagCss259, /1\.4\.259: Easy panel-blast SNAG bonus tall-phone HUD juice/)
  assert.match(
    snagCss259,
    /@media \(max-height: 920px\) \{[\s\S]*?\.play\.is-gem-search\.is-panel-blast \.gem-stage \.bonus-banner \{[\s\S]*?#ffcc33/,
  )
  assert.match(gemPlay259, /1\.4\.259: phone portrait extends board-first HUD peel 168/)
  assert.match(cssSrc, /1\.4\.259: Easy panel-blast \/ SNAG bonus ≤720 \/ phone portrait HUD peel/)
  assert.match(latestChange('1.4.259').items.join('\n'), /board-first|HUD peel|SNAG|panel-blast|phone portrait|BONUS|invent Fun\/Clear/i)
  assert.match(latestChange('1.4.259').title, /panel-blast|SNAG|≤720|HUD/i)
  assert.doesNotMatch(
    latestChange('1.4.259').items.join('\n'),
    /Fixes #250|Fixes #251|Fixes #252|Fixes #253|#272|#273|#274|#275|#276|#277|#280|#281|#282|#283|#296|#297|#298|#299|#300|#301|#302|#314|#315|#316|#317|#318|#319|#331|#332|#333|#334|#335|#336|#343|#344|#345|#346|#347|#348|#349|#350|Father Dash|Learn cream|Samaritan|Manage|Lock In|Dig|Sequence|Build|Hold|Claim merge|Creed|Source dig|Story Creek|Story Snap|Sort|Link|Match picture|score→CTA|triad→Home|bowl→CTA|Home dock|coach|cream shell fill 253/i,
    '1.4.259 must not fix phone-fail issues or climb another Easy surface',
  )
}
// Easy Clear 1.4.260: Easy Creed Claim merge ≤720 / phone portrait HUD deepen (invent Fun/Clear · Shot wake)
{
  const mergeCss260 = readFileSync(new URL('../src/index.css', import.meta.url), 'utf8')
  const mergePlay260 = readFileSync(
    new URL('../src/components/challenges/ClaimMergePlay.tsx', import.meta.url),
    'utf8',
  )
  assert.match(mergeCss260, /1\.4\.260: Easy Creed Claim merge ≤720 \/ phone portrait HUD deepen/)
  assert.match(
    mergeCss260,
    /@media \(max-height: 920px\) \{[\s\S]*?\.play\.is-claim-merge \.merge-score \{[\s\S]*?font-size: 0\.95rem/,
  )
  assert.match(
    mergeCss260,
    /@media \(max-height: 920px\) \{[\s\S]*?\.play\.is-claim-merge \.merge-mini \{[\s\S]*?width: 28px/,
  )
  assert.match(
    mergeCss260,
    /@media \(max-height: 920px\) \{[\s\S]*?\.play\.is-claim-merge \.merge-drop-chip \{[\s\S]*?font-size: 0\.58rem/,
  )
  assert.match(mergePlay260, /1\.4\.260: phone portrait deepens HUD peel 181/)
  assert.match(cssSrc, /1\.4\.260: Easy Creed Claim merge ≤720 \/ phone portrait HUD deepen/)
  assert.match(latestChange('1.4.260').items.join('\n'), /HUD deepen|score|mini|Drop|phone portrait|Claim merge|Creed|invent Fun\/Clear|Shot wake/i)
  assert.match(latestChange('1.4.260').title, /Easy Creed|Claim merge|HUD deepen|Shot wake/i)
  assert.doesNotMatch(
    latestChange('1.4.260').items.join('\n'),
    /Fixes #250|Fixes #251|Fixes #252|Fixes #253|#272|#273|#274|#275|#276|#277|#280|#281|#282|#283|#296|#297|#298|#299|#300|#301|#302|#314|#315|#316|#317|#318|#319|#331|#332|#333|#334|#335|#336|#343|#344|#345|#346|#347|#348|#349|#350|Father Dash|Learn cream|Samaritan|Manage|Lock In|Dig|Hold|Sort|Snap|Link|Build|Sequence|Story Creek|Match picture|panel-blast|SNAG|one-more win-end|Home dock|coach|cream shell/i,
    '1.4.260 must not fix phone-fail issues or climb another Easy surface',
  )
}

// Easy Clear 1.4.261: Easy Learn ≤720 / tall residual purple void after cream 252 (Fixes #361)
{
  const welcomeCss261 = readFileSync(new URL('../src/styles/welcome.css', import.meta.url), 'utf8')
  const teachUnlock261 = readFileSync(
    new URL('../src/components/TeachUnlock.tsx', import.meta.url),
    'utf8',
  )
  assert.match(welcomeCss261, /1\.4\.261: Easy Learn ≤720 \/ tall residual purple void after cream 252/)
  assert.match(
    welcomeCss261,
    /1\.4\.261: Easy Learn ≤720 \/ tall residual purple void after cream 252[\s\S]*?@media \(max-height: 920px\), \(min-height: 921px\)/,
  )
  assert.match(
    welcomeCss261,
    /1\.4\.261: Easy Learn ≤720 \/ tall residual purple void after cream 252[\s\S]*?\.app-body:has\(\.challenge-page\.is-teach \.easy-story-card\)[\s\S]*?background: #fff6e8/,
  )
  assert.match(
    welcomeCss261,
    /1\.4\.261: Easy Learn ≤720 \/ tall residual purple void after cream 252[\s\S]*?\.recall-gate\.is-encode\.teach-gate\.easy-story-card[\s\S]*?background-image: none[\s\S]*?background: #fff6e8[\s\S]*?color: #2a2118/,
  )
  assert.match(
    welcomeCss261,
    /1\.4\.261: Easy Learn ≤720 \/ tall residual purple void after cream 252[\s\S]*?\.cta-dock\.easy-story-dock \{[\s\S]*?margin-top: auto[\s\S]*?background: #fff6e8/,
  )
  assert.match(teachUnlock261, /1\.4\.261: tall residual cream floor/)
  assert.match(cssSrc, /1\.4\.261: Easy Learn ≤720 \/ tall residual purple void after cream 252/)
  assert.match(latestChange('1.4.261').items.join('\n'), /Fixes #361|purple void|cream|Learn|phone portrait|teach/i)
  assert.match(latestChange('1.4.261').title, /Easy Learn|≤720|purple void|Fixes #361/i)
  assert.doesNotMatch(
    latestChange('1.4.261').items.join('\n'),
    /Fixes #250|Fixes #251|Fixes #252|Fixes #253|#272|#273|#274|#275|#276|#277|#280|#281|#282|#283|#296|#297|#298|#299|#300|#301|#302|#314|#315|#316|#317|#318|#319|#331|#332|#333|#334|#335|#336|#343|#344|#345|#346|#347|#348|#349|#350|Father Dash|Samaritan|Manage|Lock In|Dig|Creed|Build|Sort|Snap|Link|Claim merge|Source dig|invent Fun\/Clear|Sequence|Story Creek HOLD|Home dock|coach|Match grid/i,
    '1.4.261 must not fix other phone-fail issues or climb another Easy surface',
  )
}

// Easy Clear 1.4.262: Easy Match gemSearch ≤720 / tall residual purple void after cream 253 (Fixes #362)
{
  const welcomeCss262 = readFileSync(new URL('../src/styles/welcome.css', import.meta.url), 'utf8')
  const gemPlay262 = readFileSync(
    new URL('../src/components/challenges/GemSearchPlay.tsx', import.meta.url),
    'utf8',
  )
  assert.match(welcomeCss262, /1\.4\.262: Easy Match gemSearch ≤720 \/ tall residual purple void after cream 253/)
  assert.match(
    welcomeCss262,
    /1\.4\.262: Easy Match gemSearch ≤720 \/ tall residual purple void after cream 253[\s\S]*?@media \(max-height: 920px\), \(min-height: 921px\)/,
  )
  assert.match(
    welcomeCss262,
    /1\.4\.262: Easy Match gemSearch ≤720 \/ tall residual purple void after cream 253[\s\S]*?\.app-body:has\(\.play\.is-gem-search\.is-panel-blast\.is-story-docked\)[\s\S]*?background: #fff6e8/,
  )
  assert.match(
    welcomeCss262,
    /1\.4\.262: Easy Match gemSearch ≤720 \/ tall residual purple void after cream 253[\s\S]*?\.play\.is-gem-search\.is-panel-blast\.is-story-docked[\s\S]*?background-image: none[\s\S]*?background: #fff6e8/,
  )
  assert.match(
    welcomeCss262,
    /1\.4\.262: Easy Match gemSearch ≤720 \/ tall residual purple void after cream 253[\s\S]*?\.gem-scroll[\s\S]*?background: #fff6e8/,
  )
  assert.match(
    welcomeCss262,
    /1\.4\.262: Easy Match gemSearch ≤720 \/ tall residual purple void after cream 253[\s\S]*?\.match-score \{[\s\S]*?margin-top: auto[\s\S]*?background: #fff6e8/,
  )
  assert.match(gemPlay262, /1\.4\.262: tall residual cream floor/)
  assert.match(cssSrc, /1\.4\.262: Easy Match gemSearch ≤720 \/ tall residual purple void after cream 253/)
  assert.match(latestChange('1.4.262').items.join('\n'), /Fixes #362|purple void|cream|Match|phone portrait|gem-scroll/i)
  assert.match(latestChange('1.4.262').title, /Easy Match|≤720|purple void|Fixes #362/i)
  assert.doesNotMatch(
    latestChange('1.4.262').items.join('\n'),
    /Fixes #250|Fixes #251|Fixes #252|Fixes #253|#272|#273|#274|#275|#276|#277|#280|#281|#282|#283|#296|#297|#298|#299|#300|#301|#302|#314|#315|#316|#317|#318|#319|#331|#332|#333|#334|#335|#336|#343|#344|#346|#347|#348|#349|#350|#361|Father Dash|Learn cream|Samaritan|Manage|Lock In|Dig|Creed|Build|Sort|Snap|Link|Claim merge|Source dig|invent Fun\/Clear|Sequence|Story Creek HOLD|Home dock|coach/i,
    '1.4.262 must not fix other phone-fail issues or climb another Easy surface',
  )
}

// Easy Clear 1.4.263: Easy Lock In quiz ≤720 / tall residual purple void after cream 254 (Fixes #363)
{
  const welcomeCss263 = readFileSync(new URL('../src/styles/welcome.css', import.meta.url), 'utf8')
  const whyBlast263 = readFileSync(
    new URL('../src/components/challenges/WhyBlastPlay.tsx', import.meta.url),
    'utf8',
  )
  assert.match(welcomeCss263, /1\.4\.263: Easy Lock In quiz ≤720 \/ tall residual purple void after cream 254/)
  assert.match(
    welcomeCss263,
    /1\.4\.263: Easy Lock In quiz ≤720 \/ tall residual purple void after cream 254[\s\S]*?@media \(max-height: 920px\), \(min-height: 921px\)/,
  )
  assert.match(
    welcomeCss263,
    /1\.4\.263: Easy Lock In quiz ≤720 \/ tall residual purple void after cream 254[\s\S]*?\.app-body:has\(\.journal\.is-rehearse \.why-blast:not\(\.is-miss-teach\):not\(\.is-win\)\)[\s\S]*?background: #fff6e8/,
  )
  assert.match(
    welcomeCss263,
    /1\.4\.263: Easy Lock In quiz ≤720 \/ tall residual purple void after cream 254[\s\S]*?\.recall-gate\.is-easy-hold[\s\S]*?background-image: none[\s\S]*?background: #fff6e8/,
  )
  assert.match(
    welcomeCss263,
    /1\.4\.263: Easy Lock In quiz ≤720 \/ tall residual purple void after cream 254[\s\S]*?\.why-chip[\s\S]*?color: #2a2118/,
  )
  assert.match(whyBlast263, /1\.4\.263: tall residual cream floor/)
  assert.match(cssSrc, /1\.4\.263: Easy Lock In quiz ≤720 \/ tall residual purple void after cream 254/)
  assert.match(latestChange('1.4.263').items.join('\n'), /Fixes #363|purple void|cream|Lock In|phone portrait|recall-gate/i)
  assert.match(latestChange('1.4.263').title, /Easy Lock In|≤720|purple void|Fixes #363/i)
  assert.doesNotMatch(
    latestChange('1.4.263').items.join('\n'),
    /Fixes #250|Fixes #251|Fixes #252|Fixes #253|#272|#273|#274|#275|#276|#277|#280|#281|#282|#283|#296|#297|#298|#299|#300|#301|#302|#314|#315|#316|#317|#318|#319|#331|#332|#333|#334|#335|#336|#343|#344|#345|#346|#347|#348|#349|#350|#361|#362|#364|Father Dash|Learn cream|Samaritan|Manage|Match grid|Dig|Creed|Build|Sort|Snap|Link|Claim merge|Source dig|invent Fun\/Clear|Sequence|Story Creek HOLD|Home dock|coach|miss-teach/i,
    '1.4.263 must not fix other phone-fail issues or climb another Easy surface',
  )
}

// Easy Clear 1.4.264: Easy Lock In feedback ≤720 / tall residual purple void after cream 255 (Fixes #364)
{
  const welcomeCss264 = readFileSync(new URL('../src/styles/welcome.css', import.meta.url), 'utf8')
  const whyBlast264 = readFileSync(
    new URL('../src/components/challenges/WhyBlastPlay.tsx', import.meta.url),
    'utf8',
  )
  assert.match(welcomeCss264, /1\.4\.264: Easy Lock In feedback ≤720 \/ tall residual purple void after cream 255/)
  assert.match(
    welcomeCss264,
    /1\.4\.264: Easy Lock In feedback ≤720 \/ tall residual purple void after cream 255[\s\S]*?@media \(max-height: 920px\), \(min-height: 921px\)/,
  )
  assert.match(
    welcomeCss264,
    /1\.4\.264: Easy Lock In feedback ≤720 \/ tall residual purple void after cream 255[\s\S]*?\.app-body:has\(\.journal\.is-rehearse \.why-blast\.is-miss-teach\)[\s\S]*?background: #fff6e8/,
  )
  assert.match(
    welcomeCss264,
    /1\.4\.264: Easy Lock In feedback ≤720 \/ tall residual purple void after cream 255[\s\S]*?\.recall-gate\.is-easy-hold[\s\S]*?background-image: none[\s\S]*?background: #fff6e8/,
  )
  assert.match(
    welcomeCss264,
    /1\.4\.264: Easy Lock In feedback ≤720 \/ tall residual purple void after cream 255[\s\S]*?\.why-miss-teach[\s\S]*?background-image: none[\s\S]*?background: #fff6e8/,
  )
  assert.match(
    welcomeCss264,
    /1\.4\.264: Easy Lock In feedback ≤720 \/ tall residual purple void after cream 255[\s\S]*?\.why-claim[\s\S]*?color: #2a2118/,
  )
  assert.match(
    welcomeCss264,
    /1\.4\.264: Easy Lock In feedback ≤720 \/ tall residual purple void after cream 255[\s\S]*?\.cta-dock[\s\S]*?margin-top: auto[\s\S]*?background: #fff6e8/,
  )
  assert.match(
    welcomeCss264,
    /1\.4\.264: Easy Lock In feedback ≤720 \/ tall residual purple void after cream 255[\s\S]*?overflow-x: hidden/,
  )
  assert.match(whyBlast264, /1\.4\.264: tall residual cream floor/)
  assert.match(cssSrc, /1\.4\.264: Easy Lock In feedback ≤720 \/ tall residual purple void after cream 255/)
  assert.match(latestChange('1.4.264').items.join('\n'), /Fixes #364|purple void|cream|Lock In|phone portrait|recall-gate|miss-teach/i)
  assert.match(latestChange('1.4.264').title, /Easy Lock In feedback|≤720|purple void|Fixes #364/i)
  assert.doesNotMatch(
    latestChange('1.4.264').items.join('\n'),
    /Fixes #250|Fixes #251|Fixes #252|Fixes #253|#272|#273|#274|#275|#276|#277|#280|#281|#282|#283|#296|#297|#298|#299|#300|#301|#302|#314|#315|#316|#317|#318|#319|#331|#332|#333|#334|#335|#336|#343|#344|#345|#346|#347|#348|#349|#350|#361|#362|#363|Father Dash|Learn cream|Samaritan|Manage|Match grid|Dig|Creed|Build|Sort|Snap|Link|Claim merge|Source dig|invent Fun\/Clear|Sequence|Story Creek HOLD|Home dock|coach|live quiz/i,
    '1.4.264 must not fix other phone-fail issues or climb another Easy surface',
  )
}

// Easy Clear 1.4.265: Easy Samaritan / road maze ≤720 / tall residual purple void after cream 256 (Fixes #365)
{
  const welcomeCss265 = readFileSync(new URL('../src/styles/welcome.css', import.meta.url), 'utf8')
  const roadPlay265 = readFileSync(
    new URL('../src/components/challenges/RoadMazePlay.tsx', import.meta.url),
    'utf8',
  )
  assert.match(welcomeCss265, /1\.4\.265: Easy Samaritan \/ road maze ≤720 \/ tall residual purple void after cream 256/)
  assert.match(
    welcomeCss265,
    /1\.4\.265: Easy Samaritan \/ road maze ≤720 \/ tall residual purple void after cream 256[\s\S]*?@media \(max-height: 920px\), \(min-height: 921px\)/,
  )
  assert.match(
    welcomeCss265,
    /1\.4\.265: Easy Samaritan \/ road maze ≤720 \/ tall residual purple void after cream 256[\s\S]*?\.app-body:has\(\.play\.is-road-maze\)[\s\S]*?background: #fff6e8/,
  )
  assert.match(
    welcomeCss265,
    /1\.4\.265: Easy Samaritan \/ road maze ≤720 \/ tall residual purple void after cream 256[\s\S]*?\.play\.is-road-maze[\s\S]*?background-image: none[\s\S]*?background: #fff6e8/,
  )
  assert.match(
    welcomeCss265,
    /1\.4\.265: Easy Samaritan \/ road maze ≤720 \/ tall residual purple void after cream 256[\s\S]*?\.maze-stage[\s\S]*?background-image: none[\s\S]*?background: #fff6e8/,
  )
  assert.match(
    welcomeCss265,
    /1\.4\.265: Easy Samaritan \/ road maze ≤720 \/ tall residual purple void after cream 256[\s\S]*?\.maze-board[\s\S]*?background-image: none[\s\S]*?background: #fff6e8/,
  )
  assert.match(
    welcomeCss265,
    /1\.4\.265: Easy Samaritan \/ road maze ≤720 \/ tall residual purple void after cream 256[\s\S]*?\.match-score[\s\S]*?margin-top: auto[\s\S]*?background: #fff6e8/,
  )
  assert.match(roadPlay265, /1\.4\.265: tall residual cream floor/)
  assert.match(cssSrc, /1\.4\.265: Easy Samaritan \/ road maze ≤720 \/ tall residual purple void after cream 256/)
  assert.match(latestChange('1.4.265').items.join('\n'), /Fixes #365|purple void|cream|Samaritan|phone portrait|maze-stage/i)
  assert.match(latestChange('1.4.265').title, /Easy Samaritan|≤720|purple void|Fixes #365/i)
  assert.doesNotMatch(
    latestChange('1.4.265').items.join('\n'),
    /Fixes #250|Fixes #251|Fixes #252|Fixes #253|#272|#273|#274|#275|#276|#277|#280|#281|#282|#283|#296|#297|#298|#299|#300|#301|#302|#314|#315|#316|#317|#318|#319|#331|#332|#333|#334|#335|#336|#343|#344|#345|#346|#347|#348|#349|#350|#361|#362|#363|#364|Father Dash|Learn cream|Lock In|Manage|Match grid|Dig|Creed|Build|Sort|Snap|Link|Claim merge|Source dig|invent Fun\/Clear|Sequence|Story Creek HOLD|Home dock|coach|live quiz|miss-teach/i,
    '1.4.265 must not fix other phone-fail issues or climb another Easy surface',
  )
}

// Easy Clear 1.4.266: Easy Father Dash ≤720 / tall residual purple void after cream 257 (Fixes #366)
{
  const welcomeCss266 = readFileSync(new URL('../src/styles/welcome.css', import.meta.url), 'utf8')
  const fatherPlay266 = readFileSync(
    new URL('../src/easyTrail/father/FatherRunPlay.tsx', import.meta.url),
    'utf8',
  )
  assert.match(welcomeCss266, /1\.4\.266: Easy Father Dash ≤720 \/ tall residual purple void after cream 257/)
  assert.match(
    welcomeCss266,
    /1\.4\.266: Easy Father Dash ≤720 \/ tall residual purple void after cream 257[\s\S]*?@media \(max-height: 920px\), \(min-height: 921px\)/,
  )
  assert.match(
    welcomeCss266,
    /1\.4\.266: Easy Father Dash ≤720 \/ tall residual purple void after cream 257[\s\S]*?\.app-body:has\(\.play\.is-father-run\)[\s\S]*?background: #fff6e8/,
  )
  assert.match(
    welcomeCss266,
    /1\.4\.266: Easy Father Dash ≤720 \/ tall residual purple void after cream 257[\s\S]*?\.play\.is-father-run[\s\S]*?background-image: none[\s\S]*?background: #fff6e8/,
  )
  assert.match(
    welcomeCss266,
    /1\.4\.266: Easy Father Dash ≤720 \/ tall residual purple void after cream 257[\s\S]*?\.run-rail-track[\s\S]*?background: rgba\(42, 33, 24, 0\.35\)/,
  )
  assert.match(
    welcomeCss266,
    /1\.4\.266: Easy Father Dash ≤720 \/ tall residual purple void after cream 257[\s\S]*?\.cta-dock[\s\S]*?margin-top: auto[\s\S]*?background: #fff6e8/,
  )
  assert.match(fatherPlay266, /1\.4\.266: tall residual cream floor/)
  assert.match(cssSrc, /1\.4\.266: Easy Father Dash ≤720 \/ tall residual purple void after cream 257/)
  assert.match(latestChange('1.4.266').items.join('\n'), /Fixes #366|purple void|cream|Father Dash|phone portrait|rail/i)
  assert.match(latestChange('1.4.266').title, /Easy Father Dash|≤720|purple void|Fixes #366/i)
  assert.doesNotMatch(
    latestChange('1.4.266').items.join('\n'),
    /Fixes #250|Fixes #251|Fixes #252|Fixes #253|#272|#273|#274|#275|#276|#277|#280|#281|#282|#283|#296|#297|#298|#299|#300|#301|#302|#314|#315|#316|#317|#318|#319|#331|#332|#333|#334|#335|#336|#343|#344|#345|#346|#347|#348|#349|#350|#361|#362|#363|#364|#365|Learn cream|Lock In|Samaritan|Manage|Match grid|Dig|Creed|Build|Sort|Snap|Link|Claim merge|Source dig|invent Fun\/Clear|Sequence|Story Creek HOLD|Home dock|coach|live quiz|miss-teach|maze-stage/i,
    '1.4.266 must not fix other phone-fail issues or climb another Easy surface',
  )
}

// Easy Clear 1.4.267: Easy Manage lot sheet purple bar / misalign after black-void 258 (Fixes #367)
{
  const welcomeCss267 = readFileSync(new URL('../src/styles/welcome.css', import.meta.url), 'utf8')
  const mindMap267 = readFileSync(new URL('../src/components/MindMap.tsx', import.meta.url), 'utf8')
  assert.match(
    welcomeCss267,
    /1\.4\.267: Easy Manage lot sheet purple bar \/ misalign after black-void 258/,
  )
  assert.match(
    welcomeCss267,
    /1\.4\.267: Easy Manage lot sheet purple bar \/ misalign after black-void 258[\s\S]*?@media \(max-height: 920px\), \(min-height: 921px\)/,
  )
  assert.match(
    welcomeCss267,
    /1\.4\.267: Easy Manage lot sheet purple bar \/ misalign after black-void 258[\s\S]*?html\[data-easy='on'\] \.mind-map\.is-manage \{[\s\S]*?width: auto[\s\S]*?align-items: stretch/,
  )
  assert.match(
    welcomeCss267,
    /1\.4\.267: Easy Manage lot sheet purple bar \/ misalign after black-void 258[\s\S]*?html\[data-easy='on'\] \.mind-map\.is-manage::after \{[\s\S]*?content: none/,
  )
  assert.match(
    welcomeCss267,
    /1\.4\.267: Easy Manage lot sheet purple bar \/ misalign after black-void 258[\s\S]*?html\[data-easy='on'\] \.mind-map\.is-manage \.mind-map-card \{[\s\S]*?width: 100%[\s\S]*?background-color: #241050/,
  )
  assert.match(
    welcomeCss267,
    /1\.4\.267: Easy Manage lot sheet purple bar \/ misalign after black-void 258[\s\S]*?:not\(\.is-empty-lot\) \.mind-map-card \{[\s\S]*?env\(safe-area-inset-bottom, 0px\)/,
  )
  assert.match(mindMap267, /1\.4\.267: full-bleed Easy sheet/)
  assert.match(cssSrc, /1\.4\.267: Easy Manage lot sheet purple bar \/ misalign after black-void 258/)
  assert.match(
    latestChange('1.4.267').items.join('\n'),
    /Fixes #367|purple bar|Manage|phone portrait|safe-area|920/i,
  )
  assert.match(latestChange('1.4.267').title, /Easy Manage|≤720|purple bar|Fixes #367/i)
  assert.doesNotMatch(
    latestChange('1.4.267').items.join('\n'),
    /Fixes #250|Fixes #251|Fixes #252|Fixes #253|#272|#273|#274|#275|#276|#277|#280|#281|#282|#283|#296|#297|#298|#299|#300|#301|#302|#314|#315|#316|#317|#318|#319|#331|#332|#333|#334|#335|#336|#343|#344|#345|#346|#347|#348|#349|#361|#362|#363|#364|#365|#366|Learn cream|Lock In|Samaritan|Father Dash|Match grid|Dig|Creed|Build|Sort|Snap|Link|Claim merge|Source dig|invent Fun\/Clear|Sequence|Story Creek HOLD|Home dock|coach|live quiz|miss-teach|maze-stage/i,
    '1.4.267 must not fix other phone-fail issues or climb another Easy surface',
  )
}

// Easy Fun 1.4.268: Easy Hold dock arcade punch on tall phone (invent Fun/Clear)
{
  const welcomeCss268 = readFileSync(new URL('../src/styles/welcome.css', import.meta.url), 'utf8')
  const whyBlast268 = readFileSync(
    new URL('../src/components/challenges/WhyBlastPlay.tsx', import.meta.url),
    'utf8',
  )
  assert.match(welcomeCss268, /1\.4\.268: Easy Hold dock arcade punch/)
  assert.match(
    welcomeCss268,
    /1\.4\.268: Easy Hold dock arcade punch[\s\S]*?@media \(max-height: 920px\), \(min-height: 921px\)/,
  )
  assert.match(
    welcomeCss268,
    /1\.4\.268: Easy Hold dock arcade punch[\s\S]*?\.why-blast:not\(\.is-miss-teach\) \{[\s\S]*?gap: 6px/,
  )
  assert.match(
    welcomeCss268,
    /1\.4\.268: Easy Hold dock arcade punch[\s\S]*?\.why-score \{[\s\S]*?#ffcc33/,
  )
  assert.match(
    welcomeCss268,
    /1\.4\.268: Easy Hold dock arcade punch[\s\S]*?\.why-claim \{[\s\S]*?color: #2a2118/,
  )
  assert.match(
    welcomeCss268,
    /1\.4\.268: Easy Hold dock arcade punch[\s\S]*?\.why-chip \{[\s\S]*?min-height: 56px/,
  )
  assert.match(
    welcomeCss268,
    /1\.4\.268: Easy Hold dock arcade punch[\s\S]*?\.cta-dock \.btn \{[\s\S]*?min-height: 64px/,
  )
  assert.match(whyBlast268, /1\.4\.268: tall-phone Hold dock arcade punch/)
  assert.match(cssSrc, /1\.4\.268: Easy Hold dock arcade punch/)
  assert.match(
    latestChange('1.4.268').items.join('\n'),
    /HUD peel|phone portrait|Hold dock|timing juice|invent Fun\/Clear|claim stays readable/i,
  )
  assert.match(latestChange('1.4.268').title, /Easy Hold|≤720|arcade punch|HUD/i)
  assert.doesNotMatch(
    latestChange('1.4.268').items.join('\n'),
    /Fixes #|Father Dash|Learn cream|Samaritan|Manage|Lock In|Dig|Creed|Build|Sort|Snap|Link|Claim merge|Source dig|Sequence|Match grid|Home dock|coach|miss-teach|maze-stage/i,
    '1.4.268 must not fix phone-fail issues or climb another Easy surface',
  )
}

// Easy Fun 1.4.269: Easy Story Snap residual juice on tall phone (invent Fun/Clear)
{
  const snapCss269 = readFileSync(new URL('../src/styles/storySnap.css', import.meta.url), 'utf8')
  const snapPlay269 = readFileSync(
    new URL('../src/components/challenges/StorySnapPlayView.tsx', import.meta.url),
    'utf8',
  )
  assert.match(snapCss269, /1\.4\.269: Easy Story Snap residual juice/)
  assert.match(
    snapCss269,
    /1\.4\.269: Easy Story Snap residual juice[\s\S]*?@media \(max-height: 920px\), \(min-height: 921px\)/,
  )
  assert.match(
    snapCss269,
    /1\.4\.269: Easy Story Snap residual juice[\s\S]*?display: flex/,
  )
  assert.match(
    snapCss269,
    /1\.4\.269: Easy Story Snap residual juice[\s\S]*?\.eyebrow,[\s\S]*?display: none/,
  )
  assert.match(
    snapCss269,
    /1\.4\.269: Easy Story Snap residual juice[\s\S]*?\.snap-chip \{[\s\S]*?font-size: 0\.68rem/,
  )
  assert.match(
    snapCss269,
    /1\.4\.269: Easy Story Snap residual juice[\s\S]*?\.snap-pad \{[\s\S]*?#ffcc33/,
  )
  assert.match(
    snapCss269,
    /1\.4\.269: Easy Story Snap residual juice[\s\S]*?\.match-score \{[\s\S]*?#ffcc33/,
  )
  assert.match(
    snapCss269,
    /1\.4\.269: Easy Story Snap residual juice[\s\S]*?\.is-shake \.match-score \{[\s\S]*?#ff5a7a/,
  )
  assert.match(
    snapCss269,
    /1\.4\.269: Easy Story Snap residual juice[\s\S]*?\.match-toast \{[\s\S]*?position: absolute/,
  )
  assert.match(snapPlay269, /1\.4\.269: tall-phone Story Snap residual juice/)
  assert.match(cssSrc, /1\.4\.269: Easy Story Snap residual juice/)
  assert.match(
    latestChange('1.4.269').items.join('\n'),
    /HUD peel|phone portrait|snap CTA|score|miss|invent Fun\/Clear|snap board/i,
  )
  assert.match(latestChange('1.4.269').title, /Easy Story Snap|≤720|residual juice|HUD/i)
  assert.doesNotMatch(
    latestChange('1.4.269').items.join('\n'),
    /Fixes #|Father Dash|Learn cream|Samaritan|Manage|Lock In|Dig|Creed|Build|Sort|Link|Claim merge|Source dig|Sequence|Match grid|Home dock|coach|miss-teach|maze-stage|Hold dock/i,
    '1.4.269 must not fix phone-fail issues or climb another Easy surface',
  )
}

// Easy Fun 1.4.270: Easy one-more win-end dock on tall phone (invent Fun/Clear · Shot wake)
{
  const winCss270 = readFileSync(new URL('../src/styles/matchWin.css', import.meta.url), 'utf8')
  const gem270 = readFileSync(
    new URL('../src/components/challenges/GemSearchPlay.tsx', import.meta.url),
    'utf8',
  )
  const snap270 = readFileSync(
    new URL('../src/components/challenges/StorySnapPlayView.tsx', import.meta.url),
    'utf8',
  )
  const stored270 = readFileSync(new URL('../src/components/StoredLine.tsx', import.meta.url), 'utf8')
  const match270 = readFileSync(
    new URL('../src/components/challenges/MatchPlay.tsx', import.meta.url),
    'utf8',
  )
  assert.match(winCss270, /1\.4\.270: Easy one-more win-end dock/)
  assert.match(
    winCss270,
    /1\.4\.270: Easy one-more win-end dock[\s\S]*?@media \(max-height: 920px\), \(min-height: 921px\)/,
  )
  assert.match(
    winCss270,
    /1\.4\.270: Easy one-more win-end dock[\s\S]*?\.held-triad dd \{[\s\S]*?#fff6e8/,
  )
  assert.match(
    winCss270,
    /1\.4\.270: Easy one-more win-end dock[\s\S]*?\.town-return \.btn \{[\s\S]*?min-height: 64px/,
  )
  assert.match(
    winCss270,
    /1\.4\.270: Easy one-more win-end dock[\s\S]*?\.play\.is-match\.is-win \.cta-dock \.btn \{[\s\S]*?min-height: 64px/,
  )
  assert.match(
    winCss270,
    /1\.4\.270: Easy one-more win-end dock[\s\S]*?\.match-yes strong \{[\s\S]*?color: #2a2118/,
  )
  assert.match(
    winCss270,
    /1\.4\.270: Easy one-more win-end dock[\s\S]*?\.btn\.more-match \{[\s\S]*?min-height: 64px[\s\S]*?#ffcc33/,
  )
  assert.match(
    winCss270,
    /1\.4\.270: Easy one-more win-end dock[\s\S]*?\.snap-claim \{[\s\S]*?color: #2a2118/,
  )
  assert.match(
    winCss270,
    /1\.4\.270: Easy one-more win-end dock[\s\S]*?\.text-link \{[\s\S]*?min-height: 60px/,
  )
  assert.match(gem270, /1\.4\.270: tall-phone one-more win-end dock/)
  assert.match(snap270, /1\.4\.270: tall-phone one-more win-end dock/)
  assert.match(stored270, /1\.4\.270: tall-phone one-more win-end dock/)
  assert.match(match270, /1\.4\.270: tall-phone one-more win-end dock/)
  assert.match(cssSrc, /1\.4\.270: Easy one-more win-end dock/)
  assert.match(
    latestChange('1.4.270').items.join('\n'),
    /win-end|one-more|phone portrait|invent Fun\/Clear|Shot wake|claim/i,
  )
  assert.match(latestChange('1.4.270').title, /one-more|win-end|≤720|Shot wake/i)
  assert.doesNotMatch(
    latestChange('1.4.270').items.join('\n'),
    /Fixes #|Father Dash|Learn cream|Samaritan|Manage|Dig|Creed|Night Watch|Home map|Hold dock|panel-blast|SNAG|miss-teach|maze-stage/i,
    '1.4.270 must not fix phone-fail issues or climb another Easy surface',
  )
}

// Easy Clear 1.4.271: Easy Match tall residual cream gap between objective tabs and the tile grid (Fixes #378)
{
  const welcomeCss271 = readFileSync(new URL('../src/styles/welcome.css', import.meta.url), 'utf8')
  const gemPlay271 = readFileSync(
    new URL('../src/components/challenges/GemSearchPlay.tsx', import.meta.url),
    'utf8',
  )
  const mazePlay271 = readFileSync(
    new URL('../src/components/challenges/RoadMazePlay.tsx', import.meta.url),
    'utf8',
  )
  assert.match(welcomeCss271, /1\.4\.271: Easy Match tall residual cream gap/)
  assert.match(
    welcomeCss271,
    /1\.4\.271: Easy Match tall residual cream gap[\s\S]*?@media \(max-height: 920px\), \(min-height: 921px\)/,
  )
  assert.match(
    welcomeCss271,
    /1\.4\.271: Easy Match tall residual cream gap[\s\S]*?\.play\.is-road-maze \.maze-stage \{[\s\S]*?justify-content: flex-start/,
  )
  assert.match(
    welcomeCss271,
    /1\.4\.271: Easy Match tall residual cream gap[\s\S]*?\.play\.is-gem-search\.is-panel-blast\.is-story-docked \.gem-stage \{[\s\S]*?justify-content: flex-start/,
  )
  assert.match(
    welcomeCss271,
    /1\.4\.271: Easy Match tall residual cream gap[\s\S]*?\.gem-board \{[\s\S]*?margin-top: 0/,
  )
  assert.match(gemPlay271, /1\.4\.271: pack gem-stage flex-start/)
  assert.match(mazePlay271, /1\.4\.271: pack maze-stage flex-start/)
  assert.match(cssSrc, /1\.4\.271: Easy Match tall residual cream gap/)
  assert.match(
    latestChange('1.4.271').items.join('\n'),
    /Fixes #378|cream|Match|phone portrait|gem-search|grid/i,
  )
  assert.match(latestChange('1.4.271').title, /Easy Match|≤720|cream gap|Fixes #378/i)
  assert.doesNotMatch(
    latestChange('1.4.271').items.join('\n'),
    /Fixes #250|Fixes #251|Fixes #252|Fixes #253|#272|#273|#274|#275|#276|#277|#280|#281|#282|#283|#296|#297|#298|#299|#300|#301|#302|#314|#315|#316|#317|#318|#319|#331|#332|#333|#334|#335|#336|#343|#344|#345|#346|#347|#348|#349|#350|#361|#362|#363|#364|#365|#366|#367|#381|Father Dash|Learn cream|Samaritan pill|Manage|Lock In|Dig|Creed|Build|Sort|Snap|Link|Claim merge|Source dig|invent Fun\/Clear|Sequence|Story Creek HOLD|Home dock|coach|Night Watch|Home map/i,
    '1.4.271 must not fix other phone-fail issues or climb another Easy surface',
  )
}

// Easy Clear 1.4.272: Easy Lock In hub empty purple void — stored list opens on cream (Fixes #384)
{
  const welcomeCss272 = readFileSync(new URL('../src/styles/welcome.css', import.meta.url), 'utf8')
  const journalSrc272 = readFileSync(new URL('../src/components/Journal.tsx', import.meta.url), 'utf8')
  assert.match(welcomeCss272, /1\.4\.272: Easy Lock In hub empty purple void/)
  assert.match(
    welcomeCss272,
    /1\.4\.272: Easy Lock In hub empty purple void[\s\S]*?@media \(max-height: 920px\), \(min-height: 921px\)/,
  )
  assert.match(
    welcomeCss272,
    /1\.4\.272: Easy Lock In hub empty purple void[\s\S]*?\.journal\.is-easy-hold \{[\s\S]*?justify-content: flex-start[\s\S]*?background: #fff6e8[\s\S]*?color: #2a2118/,
  )
  assert.match(
    welcomeCss272,
    /1\.4\.272: Easy Lock In hub empty purple void[\s\S]*?\.held-triad dd[\s\S]*?color: #2a2118/,
  )
  assert.match(journalSrc272, /1\.4\.272: hub list opens stored lines/)
  assert.match(journalSrc272, /startOpen=\{easy \? true :/)
  assert.match(cssSrc, /1\.4\.272: Easy Lock In hub empty purple void/)
  assert.match(
    latestChange('1.4.272').items.join('\n'),
    /Fixes #384|cream|Lock In|phone portrait|hub/i,
  )
  assert.match(latestChange('1.4.272').title, /Lock In|≤720|purple void|Fixes #384/i)
  assert.doesNotMatch(
    latestChange('1.4.272').items.join('\n'),
    /Fixes #379|Fixes #378|Fixes #380|Fixes #381|Fixes #382|mid-quiz|Match candy|Dig deeper|Night Watch|Town|Star lamps/i,
    '1.4.272 must stay on the Easy Lock In hub and must not claim Fixes #379',
  )
}

// Easy Clear 1.4.273: Easy Star lamps Manage sheet kid-clear copy + light head→job compress
{
  const welcomeCss273 = readFileSync(new URL('../src/styles/welcome.css', import.meta.url), 'utf8')
  const mindMap273 = readFileSync(new URL('../src/components/MindMap.tsx', import.meta.url), 'utf8')
  const lampsRooms = {
    ...emptyProgress(),
    stars: { walk: 8 },
    cityBuilt: { ...emptyCityBuilt(), lamps: 3 },
  }
  assert.equal(tierJob(3, true), 'More room here for ideas you kept.')
  assert.equal(
    tierJob(3, false),
    'Rooms for more ideas. Dig deeper opens on lines you have kept.',
  )
  assert.equal(
    nextUpgradeNeed('lamps', lampsRooms, true).line,
    'Catch twelve stars, or keep a night.',
  )
  assert.equal(
    nextUpgradeNeed('lamps', lampsRooms, false).line,
    'Twelve stars and nights remembered light the street.',
  )
  assert.equal(easyPlaceSub('lamps'), 'Juniper’s street light')
  assert.equal(LOT_STORY.lamps.path, 'Remember')
  assert.match(mindMap273, /function easyPlaceTile/)
  assert.match(mindMap273, /1\.4\.273 — Easy PLACE uses the path role/)
  assert.match(mindMap273, /easy \? easyPlaceTile\(plotId, graph\.placeTitle\)/)
  assert.match(welcomeCss273, /1\.4\.273: Easy Manage sheet head→job gap/)
  assert.match(
    welcomeCss273,
    /1\.4\.273: Easy Manage sheet head→job gap[\s\S]*?html\[data-easy='on'\] \.mind-map\.is-manage \.mind-map-head \{[\s\S]*?padding-bottom:\s*0/,
  )
  assert.match(
    welcomeCss273,
    /1\.4\.273: Easy Manage sheet head→job gap[\s\S]*?html\[data-easy='on'\] \.mind-map\.is-manage \.mind-map-card \{[\s\S]*?gap:\s*0/,
  )
  assert.match(cssSrc, /1\.4\.273: Easy Manage sheet head→job gap/)
  assert.match(latestChange('1.4.273').title, /Star lamps|≤720|kid-clear/)
  assert.match(
    latestChange('1.4.273').items.join('\n'),
    /phone portrait|Remember|ideas you kept|street light/i,
  )
  assert.doesNotMatch(
    latestChange('1.4.273').items.join('\n'),
    /Fixes #379|Fixes #380|Fixes #381|Fixes #382|Match candy|Night Watch|Dig deeper/i,
    '1.4.273 must stay on Easy Star lamps Manage copy',
  )
}

// Easy Clear 1.4.274: Easy Manage sheet hide web scrollbar + last TOOL card clip
{
  const indexCss274 = readFileSync(new URL('../src/index.css', import.meta.url), 'utf8')
  const gradle274 = readFileSync(new URL('../android/app/build.gradle', import.meta.url), 'utf8')
  assert.match(indexCss274, /1\.4\.274: Easy Manage hide web scrollbar/)
  assert.match(
    indexCss274,
    /1\.4\.274: Easy Manage hide web scrollbar[\s\S]*?html\[data-easy='on'\] \.mind-map\.is-manage \.mind-map-scroll \{[\s\S]*?scrollbar-width:\s*none[\s\S]*?-ms-overflow-style:\s*none[\s\S]*?padding-bottom:\s*12px[\s\S]*?scroll-padding-bottom:\s*12px/,
  )
  assert.match(
    indexCss274,
    /html\[data-easy='on'\] \.mind-map\.is-manage \.mind-map-scroll::-webkit-scrollbar \{[\s\S]*?display:\s*none[\s\S]*?width:\s*0[\s\S]*?height:\s*0/,
  )
  assert.match(
    indexCss274,
    /\.mind-map\.is-manage \.mind-map-scroll \{[\s\S]*?overflow:\s*auto/,
  )
  assert.match(gradle274, /versionName "1\.4\.113"/)
  assert.match(latestChange('1.4.274').title, /Manage|≤720|scrollbar|clip/)
  assert.match(
    latestChange('1.4.274').items.join('\n'),
    /phone portrait|scrollbar|TOOL|scroll/i,
  )
  assert.doesNotMatch(
    latestChange('1.4.274').items.join('\n'),
    /Fixes #380|map glitch|Night Watch|Dig deeper|typography/i,
    '1.4.274 must stay on Easy Manage scroll chrome',
  )
}

// Easy Clear 1.4.275: Easy Manage header scroll mask — opaque plate + top fade
{
  const indexCss275 = readFileSync(new URL('../src/index.css', import.meta.url), 'utf8')
  const gradle275 = readFileSync(new URL('../android/app/build.gradle', import.meta.url), 'utf8')
  assert.match(indexCss275, /1\.4\.275: Manage head stays above scroll/)
  assert.match(
    indexCss275,
    /1\.4\.275: Manage head stays above scroll[\s\S]*?html\[data-easy='on'\] \.mind-map\.is-manage \.mind-map-card > \.mind-map-head \{[\s\S]*?position:\s*relative[\s\S]*?z-index:\s*3[\s\S]*?background-color:\s*#48188c[\s\S]*?background-image:\s*none[\s\S]*?padding-bottom:\s*6px/,
  )
  assert.match(
    indexCss275,
    /1\.4\.274: Easy Manage hide web scrollbar[\s\S]*?padding-bottom:\s*12px[\s\S]*?scroll-padding-bottom:\s*12px/,
  )
  assert.match(gradle275, /versionName "1\.4\.113"/)
  assert.match(latestChange('1.4.275').title, /Manage|≤720|header|mask/)
  assert.match(
    latestChange('1.4.275').items.join('\n'),
    /phone portrait|header|scroll|TOOL/i,
  )
  assert.doesNotMatch(
    latestChange('1.4.275').items.join('\n'),
    /Fixes #380|map glitch|Night Watch|Dig deeper|typography|Shot 270/i,
    '1.4.275 must stay on Easy Manage header scroll mask',
  )
}

// Easy Clear 1.4.276: Easy Manage smooth header fade — 56px multi-stop mask
{
  const indexCss276 = readFileSync(new URL('../src/index.css', import.meta.url), 'utf8')
  const gradle276 = readFileSync(new URL('../android/app/build.gradle', import.meta.url), 'utf8')
  assert.match(indexCss276, /1\.4\.276: Smooth Header Fade/)
  assert.match(
    indexCss276,
    /1\.4\.276: Smooth Header Fade[\s\S]*?html\[data-easy='on'\] \.mind-map\.is-manage \.mind-map-scroll \{[\s\S]*?padding-top:\s*56px[\s\S]*?scroll-padding-top:\s*56px[\s\S]*?rgba\(0, 0, 0, 0\.1\) 18px[\s\S]*?rgba\(0, 0, 0, 0\.6\) 40px[\s\S]*?#000 56px/,
  )
  assert.match(
    indexCss276,
    /1\.4\.275: Manage head stays above scroll[\s\S]*?background-color:\s*#48188c/,
  )
  assert.match(gradle276, /versionName "1\.4\.113"/)
  assert.match(latestChange('1.4.276').title, /Manage|≤720|smooth|fade|header/i)
  assert.match(
    latestChange('1.4.276').items.join('\n'),
    /phone portrait|fade|header|scroll|TOOL/i,
  )
  assert.doesNotMatch(
    latestChange('1.4.276').items.join('\n'),
    /Fixes #380|map glitch|Night Watch|Dig deeper|typography|Shot 270/i,
    '1.4.276 must stay on Easy Manage smooth header fade',
  )
}

// Easy Clear 1.4.277: Easy Lock In miss-teach nested framing collapse (Fixes #380)
{
  const welcomeCss277 = readFileSync(new URL('../src/styles/welcome.css', import.meta.url), 'utf8')
  const whyBlast277 = readFileSync(
    new URL('../src/components/challenges/WhyBlastPlay.tsx', import.meta.url),
    'utf8',
  )
  assert.match(welcomeCss277, /1\.4\.277: Easy Lock In miss-teach nested framing \+ stretch void \(Fixes #380\)/)
  assert.match(
    welcomeCss277,
    /1\.4\.277: Easy Lock In miss-teach nested framing \+ stretch void \(Fixes #380\)[\s\S]*?@media \(max-height: 920px\), \(min-height: 921px\)/,
  )
  assert.match(
    welcomeCss277,
    /1\.4\.277: Easy Lock In miss-teach nested framing \+ stretch void \(Fixes #380\)[\s\S]*?\.why-miss-teach \{[\s\S]*?flex: 0 1 auto[\s\S]*?border: none/,
  )
  assert.match(
    welcomeCss277,
    /1\.4\.277: Easy Lock In miss-teach nested framing \+ stretch void \(Fixes #380\)[\s\S]*?\.cta-dock[\s\S]*?margin-top: 1\.5rem/,
  )
  assert.match(
    cssSrc,
    /1\.4\.277: Easy Lock In miss-teach kill tall-phone stretch void \(Fixes #380\)/,
  )
  assert.match(
    cssSrc,
    /1\.4\.277: Easy Lock In miss-teach kill tall-phone stretch void \(Fixes #380\)[\s\S]*?@media \(max-height: 720px\)[\s\S]*?\.why-blast\.is-miss-teach \{[\s\S]*?flex: 0 1 auto[\s\S]*?justify-content: flex-start/,
  )
  assert.match(
    cssSrc,
    /1\.4\.277: Easy Lock In miss-teach kill tall-phone stretch void \(Fixes #380\)[\s\S]*?@media \(max-height: 920px\)[\s\S]*?\.why-miss-teach \.cta-dock[\s\S]*?margin-top: 1\.5rem/,
  )
  assert.match(
    cssSrc,
    /1\.4\.277: miss-teach collapses duplicate LOCK IN chrome \(Fixes #380\)[\s\S]*?\.recall-gate\.is-easy-hold > \.eyebrow \{[\s\S]*?display: none/,
  )
  assert.match(whyBlast277, /1\.4\.277: miss-teach nested framing/)
  assert.match(latestChange('1.4.277').title, /Easy Lock In miss-teach|nested framing|Fixes #380/i)
  assert.match(
    latestChange('1.4.277').items.join('\n'),
    /Fixes #380|nested|LOCK IN|Try again|cream/i,
  )
  assert.doesNotMatch(
    latestChange('1.4.277').items.join('\n'),
    /Fixes #381|Fixes #382|Match candy|Night Watch|Dig deeper|Manage|Shot 270/i,
    '1.4.277 must stay on Easy Lock In miss-teach nested framing',
  )
}

// Easy Clear 1.4.278: Easy Lock In miss-teach one LOCK IN section label (#380 prove A)
{
  assert.match(
    cssSrc,
    /1\.4\.278: miss-teach keep ONE LOCK IN section label \(#380 prove A\)/,
  )
  assert.match(
    cssSrc,
    /1\.4\.278: miss-teach keep ONE LOCK IN section label \(#380 prove A\)[\s\S]*?@media \(max-height: 920px\)[\s\S]*?\.rehearse-anchor > \.eyebrow \{[\s\S]*?display: block/,
  )
  assert.match(
    cssSrc,
    /1\.4\.278: miss-teach keep ONE LOCK IN section label \(#380 prove A\)[\s\S]*?@media \(max-height: 720px\)[\s\S]*?\.rehearse-anchor > \.eyebrow \{[\s\S]*?display: block/,
  )
  assert.match(
    cssSrc,
    /1\.4\.278: miss-teach keep ONE LOCK IN section label \(#380 prove A\)[\s\S]*?\.why-blast\.is-miss-teach\)[\s\S]*?\.rehearse-anchor > \.eyebrow/,
  )
  assert.match(latestChange('1.4.278').title, /Easy Lock In miss-teach|LOCK IN|Fixes #380/i)
  assert.match(
    latestChange('1.4.278').items.join('\n'),
    /Fixes #380|LOCK IN|outer|HUD|277|prove A/i,
  )
  assert.doesNotMatch(
    latestChange('1.4.278').items.join('\n'),
    /Fixes #381|Fixes #382|Match candy|Night Watch|Dig deeper|Manage|Shot 270/i,
    '1.4.278 must stay on Easy Lock In miss-teach one LOCK IN label',
  )
}

// Easy Clear 1.4.279: Easy Samaritan beat pill contrast (Fixes #381)
{
  const welcomeCss279 = readFileSync(new URL('../src/styles/welcome.css', import.meta.url), 'utf8')
  assert.match(welcomeCss279, /1\.4\.279: Samaritan beat pill contrast \(Fixes #381\)/)
  assert.match(
    welcomeCss279,
    /1\.4\.279: Samaritan beat pill contrast \(Fixes #381\)[\s\S]*?html\[data-easy='on'\] \.play\.is-road-maze \.maze-beat\.is-got,[\s\S]*?html\[data-easy='on'\] \.play\.is-road-maze \.maze-beat\.is-now \{[\s\S]*?color: #3a2618/,
  )
  assert.match(latestChange('1.4.279').title, /Easy Samaritan|pill contrast|Fixes #381/i)
  assert.match(
    latestChange('1.4.279').items.join('\n'),
    /Fixes #381|HURT MAN|HELP|beat pill|Samaritan/i,
  )
  assert.doesNotMatch(
    latestChange('1.4.279').items.join('\n'),
    /Fixes #382|Match candy|Night Watch|Dig deeper|Manage|Lock In/i,
    '1.4.279 must stay on Easy Samaritan beat pill contrast',
  )
}

// Easy Clear 1.4.280: Easy Father Dash tall residual cream gap between timing rail and HOLD TO RUN (Fixes #382)
{
  const welcomeCss280 = readFileSync(new URL('../src/styles/welcome.css', import.meta.url), 'utf8')
  assert.match(welcomeCss280, /1\.4\.280: Father Dash tall residual cream gap \(Fixes #382\)/)
  assert.match(
    welcomeCss280,
    /1\.4\.280: Father Dash tall residual cream gap \(Fixes #382\)[\s\S]*?@media \(max-height: 920px\), \(min-height: 921px\)/,
  )
  assert.match(
    welcomeCss280,
    /1\.4\.280: Father Dash tall residual cream gap \(Fixes #382\)[\s\S]*?\.play\.is-father-run \.cta-dock[\s\S]*?margin-top: 16px[\s\S]*?margin-bottom: auto/,
  )
  assert.match(
    welcomeCss280,
    /1\.4\.280: Father Dash tall residual cream gap \(Fixes #382\)[\s\S]*?not speech-hold dock/,
  )
  assert.match(cssSrc, /1\.4\.280: Father Dash tall residual cream gap \(Fixes #382\)/)
  assert.match(
    latestChange('1.4.280').items.join('\n'),
    /Fixes #382|cream|Father Dash|phone portrait|rail|HOLD TO RUN/i,
  )
  assert.match(latestChange('1.4.280').title, /Easy Father Dash|≤720|cream gap|Fixes #382/i)
  assert.doesNotMatch(
    latestChange('1.4.280').items.join('\n'),
    /Fixes #250|Fixes #251|Fixes #252|Fixes #253|#272|#273|#274|#275|#276|#277|#281|#283|#296|#297|#298|#299|#300|#301|#302|#314|#315|#316|#317|#318|#319|#331|#332|#333|#334|#335|#336|#343|#344|#345|#346|#347|#348|#349|#350|#361|#362|#363|#364|#365|#366|#367|#381|Learn cream|Lock In|Samaritan|Manage|Match grid|Dig|Creed|Build|Sort|Snap|Link|Claim merge|Source dig|invent Fun\/Clear|Sequence|Story Creek HOLD|Home dock|coach|live quiz|miss-teach|maze-stage|Night Watch|Town/i,
    '1.4.280 must not fix other phone-fail issues or climb another Easy surface',
  )
}

// Easy Fun 1.4.281: Match gem tactile press invent (invent Fun/Clear · Shot wake)
{
  const gemCss281 = readFileSync(new URL('../src/styles/gem.css', import.meta.url), 'utf8')
  assert.match(gemCss281, /1\.4\.281: Match gem tactile press invent/)
  assert.match(
    gemCss281,
    /1\.4\.281: Match gem tactile press invent[\s\S]*?html\[data-easy='on'\] \.play\.is-gem-search \.gem-cell:active:not\(\.is-sel\):not\(\.is-burst\)/,
  )
  assert.match(
    gemCss281,
    /1\.4\.281: Match gem tactile press invent[\s\S]*?transform: scale\(0\.92\) translateZ\(0\)/,
  )
  assert.match(
    gemCss281,
    /1\.4\.281: Match gem tactile press invent[\s\S]*?transition: transform 0\.05s ease-out/,
  )
  assert.match(cssSrc, /1\.4\.281: Match gem tactile press invent/)
  assert.match(
    latestChange('1.4.281').items.join('\n'),
    /tactile|gem|squish|invent Fun\/Clear|finger|touch|Shot wake/i,
  )
  assert.match(latestChange('1.4.281').title, /Easy Match|gem|tactile|invent/i)
  assert.doesNotMatch(
    latestChange('1.4.281').items.join('\n'),
    /Fixes #|Dig deeper|Match candy|HUD peel|peels closed|Father Dash|Learn cream|Samaritan|Manage|Lock In|Night Watch|Town|Dig|Creed|Build|Sort|Snap|Link|Claim merge|Source dig|Sequence|Home dock|coach|miss-teach|maze-stage/i,
    '1.4.281 must stay on Easy Match gem tactile invent',
  )
}

// Easy Fun 1.4.282: Father Hold-to-Run arcade spring invent (invent Fun/Clear · Shot wake)
{
  const indexCss282 = readFileSync(new URL('../src/index.css', import.meta.url), 'utf8')
  assert.match(indexCss282, /1\.4\.282: Father Hold-to-Run arcade spring invent/)
  assert.match(
    indexCss282,
    /1\.4\.282: Father Hold-to-Run arcade spring invent[\s\S]*?html\[data-easy='on'\] \.play\.is-father-run \.cta-dock\.run-dock \.run-pad\.is-held/,
  )
  assert.match(
    indexCss282,
    /1\.4\.282: Father Hold-to-Run arcade spring invent[\s\S]*?transform: scale\(0\.96\) translateY\(6px\)/,
  )
  assert.match(
    indexCss282,
    /1\.4\.282: Father Hold-to-Run arcade spring invent[\s\S]*?html\[data-easy='on'\] \.play\.is-father-run \.cta-dock\.run-dock \.run-pad\.is-held\.is-glow/,
  )
  assert.match(cssSrc, /1\.4\.282: Father Hold-to-Run arcade spring invent/)
  assert.match(
    latestChange('1.4.282').items.join('\n'),
    /HOLD TO RUN|run-pad|arcade|spring|invent Fun\/Clear|Shot wake|held|glow/i,
  )
  assert.match(latestChange('1.4.282').title, /Easy Father|Hold-to-Run|arcade spring|invent/i)
  assert.doesNotMatch(
    latestChange('1.4.282').items.join('\n'),
    /Fixes #|Dig deeper|Match candy|HUD peel|peels closed|Learn cream|Samaritan|Manage|Lock In|Night Watch|Town|Dig|Creed|Build|Sort|Snap|Link|Claim merge|Source dig|Sequence|Home dock|coach|miss-teach|maze-stage|gem tactile|squish/i,
    '1.4.282 must stay on Easy Father Hold-to-Run arcade spring invent',
  )
}

// Easy Fun 1.4.283: Samaritan maze road-tile arcade press invent (invent Fun/Clear · Shot wake)
{
  const mazeCss283 = readFileSync(new URL('../src/styles/maze.css', import.meta.url), 'utf8')
  assert.match(mazeCss283, /1\.4\.283: Samaritan maze road-tile arcade press invent/)
  assert.match(
    mazeCss283,
    /1\.4\.283: Samaritan maze road-tile arcade press invent[\s\S]*?html\[data-easy='on'\] \.play\.is-road-maze \.maze-cell\.is-road:active/,
  )
  assert.match(
    mazeCss283,
    /html\[data-easy='on'\] \.play\.is-road-maze \.maze-cell\.is-road:active[\s\S]*?transform: none/,
    '1.4.359: road press must not scale the tile — that stuck the walker',
  )
  assert.match(cssSrc, /1\.4\.283: Samaritan maze road-tile arcade press invent/)
  assert.match(
    latestChange('1.4.283').items.join('\n'),
    /road|maze|squish|arcade|invent Fun\/Clear|Shot wake|road tile|walkable|rock/i,
  )
  assert.match(latestChange('1.4.283').title, /Easy Samaritan|road-tile|arcade press|invent/i)
  assert.doesNotMatch(
    latestChange('1.4.283').items.join('\n'),
    /Fixes #|Dig deeper|Match candy|HUD peel|peels closed|Learn cream|Manage|Lock In|Night Watch|Town|Dig|Creed|Build|Sort|Snap|Link|Claim merge|Source dig|Sequence|Home dock|coach|miss-teach|maze-stage|gem tactile|Hold-to-Run|run-pad/i,
    '1.4.283 must stay on Easy Samaritan maze road-tile arcade press invent',
  )
}

// Easy Fun 1.4.284: Lock In why-chip tactile press invent (invent Fun/Clear · Shot wake)
{
  const holdCss284 = readFileSync(new URL('../src/styles/sortHold.css', import.meta.url), 'utf8')
  assert.match(holdCss284, /1\.4\.284: Lock In why-chip tactile press invent/)
  assert.match(
    holdCss284,
    /1\.4\.284: Lock In why-chip tactile press invent[\s\S]*?html\[data-easy='on'\] \.journal\.is-rehearse \.why-blast:not\(\.is-win\):not\(\.is-miss-teach\) \.why-chip:active:not\(\.is-gone\):not\(\.is-toss\)/,
  )
  assert.match(
    holdCss284,
    /html\[data-easy='on'\] \.journal\.is-rehearse \.why-blast:not\(\.is-win\):not\(\.is-miss-teach\) \.why-chip:active:not\(\.is-gone\):not\(\.is-toss\)[\s\S]*?animation: none[\s\S]*?transform: scale\(0\.92\) translateY\(2px\)/,
  )
  assert.match(cssSrc, /1\.4\.284: Lock In why-chip tactile press invent/)
  assert.match(
    latestChange('1.4.284').items.join('\n'),
    /why-chip|Lock In|squish|float|invent Fun\/Clear|Shot wake|finger|press/i,
  )
  assert.match(latestChange('1.4.284').title, /Easy Lock In|why-chip|tactile press|invent/i)
  assert.doesNotMatch(
    latestChange('1.4.284').items.join('\n'),
    /Fixes #|Dig deeper|Match candy|HUD peel|peels closed|Learn cream|Manage|Night Watch|Town|Dig|Creed|Build|Sort|Snap|Link|Claim merge|Source dig|Sequence|Home dock|coach|maze-stage|gem tactile|Hold-to-Run|run-pad|road tile|Samaritan maze/i,
    '1.4.284 must stay on Easy Lock In why-chip tactile press invent',
  )
}

// Easy Fun 1.4.285: Sort tile arcade squish invent (invent Fun/Clear · Shot wake)
{
  const holdCss285 = readFileSync(new URL('../src/styles/sortHold.css', import.meta.url), 'utf8')
  assert.match(holdCss285, /1\.4\.285: Sort tile arcade squish invent/)
  assert.match(
    holdCss285,
    /1\.4\.285: Sort tile arcade squish invent[\s\S]*?html\[data-easy='on'\] \.play\.is-easy-sort \.sort-tile:not\(\.is-gone\)/,
  )
  assert.match(
    holdCss285,
    /html\[data-easy='on'\] \.play\.is-easy-sort \.sort-tile:active:not\(\.is-gone\)[\s\S]*?transform: scale\(0\.92\) translateY\(2px\)/,
  )
  assert.match(cssSrc, /1\.4\.285: Sort tile arcade squish invent/)
  assert.match(
    latestChange('1.4.285').items.join('\n'),
    /sort tile|squish|arcade|invent Fun\/Clear|Shot wake|finger|press|gone/i,
  )
  assert.match(latestChange('1.4.285').title, /Easy Sort|tile|arcade squish|invent/i)
  assert.doesNotMatch(
    latestChange('1.4.285').items.join('\n'),
    /Fixes #|Dig deeper|Match candy|HUD peel|peels closed|Learn cream|Manage|Night Watch|Town|Dig|Creed|Build|Snap|Link|Claim merge|Source dig|Sequence|Home dock|coach|miss-teach|maze-stage|gem tactile|Hold-to-Run|run-pad|road tile|Samaritan maze|Lock In|why-chip/i,
    '1.4.285 must stay on Easy Sort tile arcade squish invent',
  )
}

// Easy Fun 1.4.286: Sort bin gulp press invent (invent Fun/Clear · Shot wake)
{
  const holdCss286 = readFileSync(new URL('../src/styles/sortHold.css', import.meta.url), 'utf8')
  assert.match(holdCss286, /1\.4\.286: Sort bin gulp press invent/)
  assert.match(
    holdCss286,
    /1\.4\.286: Sort bin gulp press invent[\s\S]*?html\[data-easy='on'\] \.play\.is-easy-sort \.sort-bins \.bin\s*\{/,
  )
  assert.match(
    holdCss286,
    /html\[data-easy='on'\] \.play\.is-easy-sort \.sort-bins \.bin:active[\s\S]*?transform: scale\(0\.94\) translateY\(3px\)/,
  )
  assert.match(cssSrc, /1\.4\.286: Sort bin gulp press invent/)
  assert.match(
    latestChange('1.4.286').items.join('\n'),
    /bin|gulp|squish|Keep|Toss|invent Fun\/Clear|Shot wake|press/i,
  )
  assert.match(latestChange('1.4.286').title, /Easy Sort|bin|gulp press|invent/i)
  assert.doesNotMatch(
    latestChange('1.4.286').items.join('\n'),
    /Fixes #|Dig deeper|Match candy|HUD peel|peels closed|Learn cream|Manage|Night Watch|Town|Dig|Creed|Build|Snap|Link|Claim merge|Source dig|Sequence|Home dock|coach|miss-teach|maze-stage|gem tactile|Hold-to-Run|run-pad|road tile|Samaritan maze|Lock In|why-chip|sort tile|gone tile/i,
    '1.4.286 must stay on Easy Sort bin gulp press invent',
  )
}

// Easy Fun 1.4.287: Learn story-dock arcade punch invent (invent Fun/Clear · Shot wake)
{
  const welcomeCss287 = readFileSync(new URL('../src/styles/welcome.css', import.meta.url), 'utf8')
  assert.match(welcomeCss287, /1\.4\.287: Learn story-dock arcade punch invent/)
  assert.match(
    welcomeCss287,
    /1\.4\.287: Learn story-dock arcade punch invent[\s\S]*?html\[data-easy='on'\] \.challenge-page\.is-teach \.easy-story-card \.cta-dock\.easy-story-dock \.btn \{/,
  )
  assert.match(
    welcomeCss287,
    /html\[data-easy='on'\] \.challenge-page\.is-teach \.easy-story-card \.cta-dock\.easy-story-dock \.btn:active[\s\S]*?transform: scale\(0\.94\) translateY\(3px\)/,
  )
  assert.match(cssSrc, /1\.4\.287: Learn story-dock arcade punch invent/)
  assert.match(
    latestChange('1.4.287').items.join('\n'),
    /story-dock|unlock|squish|invent Fun\/Clear|Shot wake|press/i,
  )
  assert.match(latestChange('1.4.287').title, /Easy Learn|story-dock|arcade punch|invent/i)
  assert.doesNotMatch(
    latestChange('1.4.287').items.join('\n'),
    /Fixes #|Dig deeper|Match candy|HUD peel|peels closed|Learn cream|Manage|Night Watch|Town|Dig|Creed|Build|Snap|Link|Claim merge|Source dig|Sequence|Home dock|coach|miss-teach|maze-stage|gem tactile|Hold-to-Run|run-pad|road tile|Samaritan maze|Lock In|why-chip|sort tile|gone tile|bin gulp|Keep\/Toss/i,
    '1.4.287 must stay on Easy Learn story-dock arcade punch invent',
  )
}

// Easy Fun 1.4.288: City streets button arcade press invent (invent Fun/Clear · Shot wake)
{
  const cityCss288 = readFileSync(new URL('../src/styles/city.css', import.meta.url), 'utf8')
  assert.match(cityCss288, /1\.4\.288: City streets button arcade press invent/)
  assert.match(
    cityCss288,
    /1\.4\.288: City streets button arcade press invent[\s\S]*?html\[data-easy='on'\] \.city-streets button \{/,
  )
  assert.match(
    cityCss288,
    /html\[data-easy='on'\] \.city-streets button:active[\s\S]*?transform: scale\(0\.94\) translateY\(2px\)/,
  )
  assert.match(cssSrc, /1\.4\.288: City streets button arcade press invent/)
  assert.match(
    latestChange('1.4.288').items.join('\n'),
    /street|squish|invent Fun\/Clear|Shot wake|press/i,
  )
  assert.match(latestChange('1.4.288').title, /Easy City|streets button|arcade press|invent/i)
  assert.doesNotMatch(
    latestChange('1.4.288').items.join('\n'),
    /Fixes #|Dig deeper|Match candy|HUD peel|peels closed|Learn cream|Manage|Night Watch|Town|Dig|Creed|Build|Snap|Link|Claim merge|Source dig|Sequence|Home dock|coach|miss-teach|maze-stage|gem tactile|Hold-to-Run|run-pad|road tile|Samaritan maze|Lock In|why-chip|sort tile|gone tile|bin gulp|Keep\/Toss|story-dock|unlock CTA/i,
    '1.4.288 must stay on Easy City streets button arcade press invent',
  )
}

// Easy Fun 1.4.289: LociStamp arcade squish invent (invent Fun/Clear · Shot wake)
{
  const lociCss289 = readFileSync(new URL('../src/styles/loci-stamp.css', import.meta.url), 'utf8')
  assert.match(lociCss289, /1\.4\.289: LociStamp arcade squish invent/)
  assert.match(
    lociCss289,
    /1\.4\.289: LociStamp arcade squish invent[\s\S]*?html\[data-easy='on'\] button\.loci-stamp \{/,
  )
  assert.match(
    lociCss289,
    /html\[data-easy='on'\] button\.loci-stamp:active[\s\S]*?transform: scale\(0\.92\) rotate\(-3deg\)/,
  )
  assert.match(cssSrc, /1\.4\.289: LociStamp arcade squish invent/)
  assert.match(
    latestChange('1.4.289').items.join('\n'),
    /loci stamp|squish|invent Fun\/Clear|Shot wake|press|glow/i,
  )
  assert.match(latestChange('1.4.289').title, /Easy LociStamp|arcade squish|invent/i)
  assert.doesNotMatch(
    latestChange('1.4.289').items.join('\n'),
    /Fixes #|Dig deeper|Match candy|HUD peel|peels closed|Learn cream|Manage|Night Watch|Town|Dig|Creed|Build|Snap|Link|Claim merge|Source dig|Sequence|Home dock|coach|miss-teach|maze-stage|gem tactile|Hold-to-Run|run-pad|road tile|Samaritan maze|Lock In|why-chip|sort tile|gone tile|bin gulp|Keep\/Toss|story-dock|unlock CTA|street|city streets|streets button/i,
    '1.4.289 must stay on Easy LociStamp arcade squish invent',
  )
}

// Easy Fun 1.4.290: Story Snap pad arcade squish invent (invent Fun/Clear · Shot wake)
{
  const snapCss290 = readFileSync(new URL('../src/styles/storySnap.css', import.meta.url), 'utf8')
  assert.match(snapCss290, /1\.4\.290: Story Snap pad arcade squish invent/)
  assert.match(
    snapCss290,
    /1\.4\.290: Story Snap pad arcade squish invent[\s\S]*?html\[data-easy='on'\] \.play\.is-story-snap button\.snap-pad \{/,
  )
  assert.match(
    snapCss290,
    /html\[data-easy='on'\] \.play\.is-story-snap button\.snap-pad:active[\s\S]*?transform: scale\(0\.94\) translateY\(3px\)/,
  )
  assert.match(cssSrc, /1\.4\.290: Story Snap pad arcade squish invent/)
  assert.match(
    latestChange('1.4.290').items.join('\n'),
    /Story Snap|snap pad|squish|invent Fun\/Clear|Shot wake|press|glow/i,
  )
  assert.match(latestChange('1.4.290').title, /Easy Story Snap|pad|arcade squish|invent/i)
  assert.doesNotMatch(
    latestChange('1.4.290').items.join('\n'),
    /Fixes #|Dig deeper|Match candy|HUD peel|peels closed|Learn cream|Manage|Night Watch|Town|Dig|Creed|Build|Link|Claim merge|Source dig|Sequence|Home dock|coach|miss-teach|maze-stage|gem tactile|Hold-to-Run|run-pad|road tile|Samaritan maze|Lock In|why-chip|sort tile|gone tile|bin gulp|Keep\/Toss|story-dock|unlock CTA|street|city streets|streets button|loci stamp|LociStamp/i,
    '1.4.290 must stay on Easy Story Snap pad arcade squish invent',
  )
}

// Easy Clear 1.4.291: Easy Match teach-dock unclamp (Fixes #404)
{
  const matchCss291 = readFileSync(new URL('../src/styles/match.css', import.meta.url), 'utf8')
  assert.match(matchCss291, /1\.4\.291: Easy Match teach-dock unclamp \(Fixes #404\)/)
  assert.match(
    matchCss291,
    /1\.4\.291: Easy Match teach-dock unclamp \(Fixes #404\)[\s\S]*?@media \(max-height: 920px\)[\s\S]*?html\[data-easy='on'\] \.play\.is-gem-search\.is-panel-blast\.is-story-docked \.match-teach-dock \{[\s\S]*?max-height: none/,
  )
  assert.match(
    matchCss291,
    /html\[data-easy='on'\] \.play\.is-gem-search\.is-panel-blast\.is-story-docked \.match-teach-dock \{[\s\S]*?overflow: visible/,
  )
  assert.match(cssSrc, /1\.4\.291: Easy Match teach-dock unclamp \(Fixes #404\)/)
  assert.match(
    latestChange('1.4.291').items.join('\n'),
    /Fixes #404|teach-dock|72px|LociStamp|WHO|WHERE|IDEA|KEEP|overlap|claim/i,
  )
  assert.match(latestChange('1.4.291').title, /Easy Match|teach-dock|unclamp|Fixes #404/i)
  assert.doesNotMatch(
    latestChange('1.4.291').items.join('\n'),
    /Fixes #379|Fixes #405|Fixes #406|Dig deeper|Night Watch|Town|Manage|Father Dash|Lock In quiz|invent Fun\/Clear|Shot wake|Story Snap|gem tactile|Samaritan|Sort tile|Hold-to-Run|road tile|why-chip|streets button|LociStamp squish/i,
    '1.4.291 must stay on Easy Match teach-dock unclamp Fixes #404',
  )
}

// Easy Clear 1.4.292: Easy Lock In quiz cream void fill (Fixes #379)
{
  const holdCss292 = readFileSync(new URL('../src/styles/sortHold.css', import.meta.url), 'utf8')
  assert.match(holdCss292, /1\.4\.292: Easy Lock In quiz cream void fill \(Fixes #379\)/)
  assert.match(
    holdCss292,
    /1\.4\.292: Easy Lock In quiz cream void fill \(Fixes #379\)[\s\S]*?html\[data-easy='on'\] \.journal\.is-rehearse \.recall-gate\.is-easy-hold \.why-blast:not\(\.is-miss-teach\):not\(\.is-win\)[\s\S]*?flex: 1 1 auto[\s\S]*?flex-direction: column/,
  )
  assert.match(
    holdCss292,
    /html\[data-easy='on'\] \.journal\.is-rehearse \.recall-gate\.is-easy-hold \.why-blast:not\(\.is-miss-teach\):not\(\.is-win\) \.why-arena[\s\S]*?flex: 1 1 auto[\s\S]*?justify-content: center[\s\S]*?align-content: center/,
  )
  assert.match(cssSrc, /1\.4\.292: Easy Lock In quiz cream void fill \(Fixes #379\)/)
  assert.match(
    latestChange('1.4.292').items.join('\n'),
    /Fixes #379|Lock In|quiz|why-blast|why-arena|cream void|claim|chips|portrait/i,
  )
  assert.match(latestChange('1.4.292').title, /Easy Lock In|quiz|cream void|Fixes #379/i)
  assert.doesNotMatch(
    latestChange('1.4.292').items.join('\n'),
    /Fixes #404|Fixes #405|Fixes #406|Dig deeper|Night Watch|Town|Manage|Father Dash|Match|invent Fun\/Clear|Shot wake|Story Snap|gem tactile|Samaritan|Sort tile|Hold-to-Run|road tile|why-chip|streets button|LociStamp|miss-teach/i,
    '1.4.292 must stay on Easy Lock In live quiz cream void fill Fixes #379',
  )
}

// Easy Clear 1.4.293: Easy Lock In miss-teach cream void fill (Fixes #405)
{
  const holdCss293 = readFileSync(new URL('../src/styles/sortHold.css', import.meta.url), 'utf8')
  assert.match(holdCss293, /1\.4\.293: Easy Lock In miss-teach cream void fill \(Fixes #405\)/)
  assert.match(
    holdCss293,
    /1\.4\.293: Easy Lock In miss-teach cream void fill \(Fixes #405\)[\s\S]*?html\[data-easy='on'\] \.journal\.is-rehearse \.recall-gate\.is-easy-hold \.why-blast\.is-miss-teach[\s\S]*?flex: 1 1 auto[\s\S]*?flex-direction: column/,
  )
  assert.match(
    holdCss293,
    /html\[data-easy='on'\] \.journal\.is-rehearse \.recall-gate\.is-easy-hold \.why-blast\.is-miss-teach \.why-miss-teach[\s\S]*?flex: 1 1 auto[\s\S]*?justify-content: center/,
  )
  assert.match(cssSrc, /1\.4\.293: Easy Lock In miss-teach cream void fill \(Fixes #405\)/)
  assert.match(
    latestChange('1.4.293').items.join('\n'),
    /Fixes #405|Lock In|miss-teach|why-blast|why-miss-teach|cream void|Main idea|Try again|portrait/i,
  )
  assert.match(latestChange('1.4.293').title, /Easy Lock In|miss-teach|cream void|Fixes #405/i)
  assert.doesNotMatch(
    latestChange('1.4.293').items.join('\n'),
    /Fixes #379|Fixes #404|Fixes #406|Dig deeper|Night Watch|Town|Manage|Father Dash|Match|invent Fun\/Clear|Shot wake|Story Snap|gem tactile|Samaritan|Sort tile|Hold-to-Run|road tile|why-chip|streets button|LociStamp|live quiz|why-arena|claim · chips/i,
    '1.4.293 must stay on Easy Lock In miss-teach cream void fill Fixes #405',
  )
}

// Easy Clear 1.4.294: Easy Lock In miss-teach cream void residual (Fixes #405)
{
  const welcomeCss294 = readFileSync(new URL('../src/styles/welcome.css', import.meta.url), 'utf8')
  assert.match(welcomeCss294, /1\.4\.294: Easy Lock In miss-teach cream void residual \(Fixes #405\)/)
  assert.match(
    welcomeCss294,
    /1\.4\.294: Easy Lock In miss-teach cream void residual \(Fixes #405\)[\s\S]*?\.journal\.is-rehearse:has\(\.why-blast\.is-miss-teach\) \{[\s\S]*?flex: 1 1 0/,
  )
  assert.match(
    welcomeCss294,
    /1\.4\.294: Easy Lock In miss-teach cream void residual \(Fixes #405\)[\s\S]*?\.why-miss-teach \{[\s\S]*?justify-content: center/,
  )
  assert.match(cssSrc, /1\.4\.294: Easy Lock In miss-teach cream void residual \(Fixes #405\)/)
  assert.match(
    latestChange('1.4.294').items.join('\n'),
    /Fixes #405|Lock In|miss-teach|journal|recall-gate|#380|Main idea|Try again|portrait|cream void/i,
  )
  assert.match(latestChange('1.4.294').title, /Easy Lock In|miss-teach|cream void|residual/i)
  assert.doesNotMatch(
    latestChange('1.4.294').items.join('\n'),
    /Fixes #379|Fixes #404|Fixes #406|Dig deeper|Night Watch|Town|Manage|Father Dash|Match|invent Fun\/Clear|Shot wake|Story Snap|gem tactile|Samaritan|Sort tile|Hold-to-Run|road tile|why-chip|streets button|LociStamp|live quiz|why-arena|claim · chips|Father/i,
    '1.4.294 must stay on Easy Lock In miss-teach cream void residual Fixes #405',
  )
}

// Easy Clear 1.4.295: Father Dash HOLD TO RUN cream void fill (Fixes #406)
{
  const welcomeCss295 = readFileSync(new URL('../src/styles/welcome.css', import.meta.url), 'utf8')
  assert.match(
    welcomeCss295,
    /1\.4\.295: Father Dash HOLD TO RUN cream void fill \(Fixes #406\)/,
  )
  assert.match(
    welcomeCss295,
    /1\.4\.295: Father Dash HOLD TO RUN cream void fill \(Fixes #406\)[\s\S]*?\.play\.is-father-run \.run-speech[\s\S]*?flex: 1 1 auto/,
  )
  assert.match(
    welcomeCss295,
    /1\.4\.295: Father Dash HOLD TO RUN cream void fill \(Fixes #406\)[\s\S]*?\.play\.is-father-run \.cta-dock[\s\S]*?margin-bottom: 0/,
  )
  assert.match(cssSrc, /1\.4\.295: Father Dash HOLD TO RUN cream void fill \(Fixes #406\)/)
  assert.match(
    latestChange('1.4.295').items.join('\n'),
    /Fixes #406|Father Dash|#382|run-speech|HOLD TO RUN|cream void/i,
  )
  assert.match(latestChange('1.4.295').title, /Father Dash|HOLD TO RUN|cream void|Fixes #406/i)
  assert.doesNotMatch(
    latestChange('1.4.295').items.join('\n'),
    /Fixes #405|Fixes #379|Fixes #404|Dig deeper|Night Watch|Town|Manage|Match|invent Fun\/Clear|Shot wake|Story Snap|gem tactile|Samaritan|Sort tile|Lock In|miss-teach|why-arena|claim · chips/i,
    '1.4.295 must stay on Father Dash HOLD TO RUN cream void fill Fixes #406',
  )
}

// Easy Clear 1.4.296: Easy Samaritan less-is-more + smash + route variety (Fixes #414 #412 #413)
{
  assert.match(
    latestChange('1.4.296').items.join('\n'),
    /Fixes #414|Fixes #412|Fixes #413|Samaritan|route variety|hurt man|always right/i,
  )
  assert.match(latestChange('1.4.296').title, /Samaritan|less-is-more|route variety|Fixes #414/i)
  assert.doesNotMatch(
    latestChange('1.4.296').items.join('\n'),
    /Fixes #406|Fixes #405|Fixes #404|Father Dash|Lock In|Match teach|Story Snap|Dig deeper|Night Watch|Town|Manage/i,
    '1.4.296 must stay on Easy Samaritan less-is-more smash route variety Fixes #414 #412 #413',
  )
  assert.match(cssSrc, /1\.4\.296: Samaritan less-is-more \+ smash fix/)
  assert.match(cssSrc, /#d8b888/)
  assert.match(
    readFileSync(new URL('../src/lib/roadMaze.ts', import.meta.url), 'utf8'),
    /MAZE_PRESETS/,
  )
  assert.match(
    readFileSync(new URL('../src/components/challenges/RoadMazePlay.tsx', import.meta.url), 'utf8'),
    /setMazePreset/,
  )
}

// Easy Dig 1.4.297: tap verse ref → RSV in-app (Fixes #416)
{
  const deeperSrc = readFileSync(new URL('../src/content/deeper.ts', import.meta.url), 'utf8')
  const digSrc = readFileSync(new URL('../src/components/DigDeeper.tsx', import.meta.url), 'utf8')
  const rsvSrc = readFileSync(new URL('../src/content/rsvBites.ts', import.meta.url), 'utf8')
  const welcomeCss297 = readFileSync(new URL('../src/styles/welcome.css', import.meta.url), 'utf8')
  assert.match(deeperSrc, /rsvBite/)
  assert.match(deeperSrc, /quote\?: string/)
  assert.match(rsvSrc, /export function rsvBite/)
  assert.match(digSrc, /dig-bite is-verse/)
  assert.match(digSrc, /Open full/)
  assert.match(welcomeCss297, /1\.4\.297: in-app RSV verse reveal/)
  assert.match(welcomeCss297, /\.dig-bite\.is-verse/)
  assert.match(
    latestChange('1.4.297').items.join('\n'),
    /Fixes #416|RSV|Dig|verse|BibleGateway|parchment/i,
  )
  assert.match(latestChange('1.4.297').title, /Dig|RSV|verse|Fixes #416/i)
  assert.doesNotMatch(
    latestChange('1.4.297').items.join('\n'),
    /Fixes #414|Fixes #412|Fixes #413|Samaritan|Father Dash|Lock In|Match teach|Night Watch|Town|Manage/i,
    '1.4.297 must stay on Easy Dig RSV verse reveal Fixes #416',
  )
  const genesis = deeperLinksFor('daily-cosmos').find((l) => l.label === 'Genesis 1:1')
  assert.ok(genesis?.quote, 'Genesis 1:1 must ship in-app RSV quote')
}

// Night Watch 1.4.298: Phase 1 fantasy reskin (Fixes #418)
{
  const defend298 = readFileSync(new URL('../src/content/defend.ts', import.meta.url), 'utf8')
  const defendCss298 = readFileSync(new URL('../src/styles/defend.css', import.meta.url), 'utf8')
  assert.match(defend298, /Prayer watch/)
  assert.match(defend298, /Plant lamps\. Push the dark back\./)
  assert.match(defend298, /Guardian near · Messenger help/)
  assert.match(defendCss298, /Night Watch Phase 1/)
  assert.match(defendCss298, /\.defend-angel-help/)
  assert.match(defendSrc, /defend-angel-help/)
  assert.equal(WALKER_LABEL['image-bearer'], 'Cold Heart')
  assert.equal(WALKER_LABEL.skeptic, 'Accuser')
  assert.equal(WALKER_LABEL.pagan, 'Tempter')
  assert.equal(WALKER_LABEL.physical, 'Despair')
  assert.equal(WALKER_LABEL.metaphysical, 'Whisper')
  assert.equal(WALKER_LABEL.spiritual, 'Mockery')
  assert.equal(RAID_CAST.length, 8)
  assert.deepEqual(
    RAID_CAST.map((item) => item.text),
    [
      'Mercy is optional',
      'Only your own',
      'Keep walking',
      'Trade your lamp',
      'Only atoms speak',
      'Mind is weather',
      "You're wrong",
      'Many tired gods',
    ],
  )
  assert.match(
    latestChange('1.4.298').items.join('\n'),
    /Fixes #418|prayer watch|dark|taunt|Guardian|Messenger|walker/i,
  )
  assert.match(latestChange('1.4.298').title, /Night Watch|Phase 1|fantasy|Fixes #418/i)
  assert.doesNotMatch(
    latestChange('1.4.298').items.join('\n'),
    /Fixes #416|RSV|Dig verse|Father Dash|Samaritan smash/i,
    '1.4.298 must stay on Night Watch Phase 1 fantasy reskin Fixes #418',
  )
}

// Night Watch 1.4.299: Easy unpark (Fixes #418 residual)
{
  const app299 = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8')
  const hub299 = readFileSync(new URL('../src/components/Hub.tsx', import.meta.url), 'utf8')
  assert.doesNotMatch(app299, /easy && next\.name === 'defend'/)
  assert.doesNotMatch(app299, /view\.name === 'defend' && !easy/)
  assert.match(app299, /view\.name === 'defend' \? <DefendScreen/)
  assert.match(hub299, /easy-night-watch/)
  assert.match(hub299, /EASY\.nightDo/)
  assert.match(hub299, /EASY\.nightLead/)
  assert.match(hub299, /name: 'defend'/)
  assert.match(latestChange('1.4.299').title, /Night Watch|Easy|unpark|Fixes #418/i)
  assert.match(
    latestChange('1.4.299').items.join('\n'),
    /Fixes #418|Easy|Night Watch|unpark|prove/i,
  )
  assert.doesNotMatch(
    latestChange('1.4.299').items.join('\n'),
    /prayer watch|dark fantasy|Phase 1 fantasy reskin/i,
    '1.4.299 must stay on Easy Night Watch unpark Fixes #418 residual',
  )
}

// Night Watch 1.4.300: Easy TAP Phase 1 taunt (Fixes #418 residual)
{
  const defendCss300 = readFileSync(new URL('../src/styles/defend.css', import.meta.url), 'utf8')
  // 1.4.326 moved the on-path chip into the left roster (Fixes #460).
  assert.match(defendNightSrc, /nw-walker-slide/)
  assert.match(defendNightSrc, /easy-walker-kind/)
  assert.match(defendNightSrc, /easy-walker-taunt/)
  assert.match(defendNightSrc, /WALKER_LABEL\[raider\.kind\]/)
  assert.match(defendNightSrc, /raider\.text/)
  assert.match(defendCss300, /Easy TAP Phase 1 taunt bubble/)
  assert.match(defendCss300, /\.easy-walker-call/)
  assert.match(defendCss300, /\.easy-walker-kind/)
  assert.match(defendCss300, /\.easy-walker-taunt/)
  assert.match(latestChange('1.4.300').title, /Night Watch|TAP|Phase 1|taunt|Fixes #418/i)
  assert.match(
    latestChange('1.4.300').items.join('\n'),
    /Fixes #418|Easy|Night Watch|TAP|taunt|kind/i,
  )
  assert.doesNotMatch(
    latestChange('1.4.300').items.join('\n'),
    /unpark|prayer watch|dark fantasy reskin/i,
    '1.4.300 must stay on Easy Night Watch TAP Phase 1 taunt Fixes #418 residual',
  )
}

// Night Watch 1.4.301: Phase 2 hop 1 Easy TAP juice (Fixes #418)
{
  const defendCss301 = readFileSync(new URL('../src/styles/defend.css', import.meta.url), 'utf8')
  const defendScreen301 = readFileSync(
    new URL('../src/components/DefendScreen.tsx', import.meta.url),
    'utf8',
  )
  assert.match(defendScreen301, /tapJuice/)
  assert.match(defendScreen301, /setTapJuice/)
  assert.match(defendNightSrc, /easy-tap-plus/)
  assert.match(defendNightSrc, /easy-tap-combo/)
  assert.match(defendNightSrc, /tapJuice/)
  assert.match(defendCss301, /Phase 2 hop 1 — Easy TAP juice/)
  assert.match(defendCss301, /\.easy-tap-plus/)
  assert.match(defendCss301, /easy-tap-heaven/)
  assert.match(latestChange('1.4.301').title, /Night Watch|Phase 2|TAP|juice|Fixes #418/i)
  assert.match(
    latestChange('1.4.301').items.join('\n'),
    /Fixes #418|squash|heaven|Combo|\+ flash/i,
  )
  assert.doesNotMatch(
    latestChange('1.4.301').items.join('\n'),
    /Phase 1 taunt|unpark|tower/i,
    '1.4.301 must stay on Easy Night Watch Phase 2 hop 1 TAP juice Fixes #418',
  )
}

// Night Watch 1.4.302: Easy little wave on path (Fixes #418 / Bill redirect)
{
  const defendCss302 = readFileSync(new URL('../src/styles/defend.css', import.meta.url), 'utf8')
  const defendScreen302 = defendSrc
  assert.doesNotMatch(defendNightSrc, /easy\s*\?\s*null\s*:\s*raiders\.map/)
  assert.match(defendNightSrc, /fireAtRaider/)
  assert.match(defendNightSrc, /is-easy-tap-target/)
  assert.match(defendNightSrc, /easy-walkers-path-cue/)
  assert.match(defendScreen302, /easyHoldSpawn/)
  assert.match(defendScreen302, /easySpawnT/)
  assert.match(defendScreen302, /fireAtRaider/)
  assert.doesNotMatch(defendScreen302, /freezeTarget/)
  assert.match(defendCss302, /Easy little wave on path/)
  assert.match(latestChange('1.4.302').title, /Easy|Night Watch|little wave|path|Fixes #418/i)
  assert.match(
    latestChange('1.4.302').items.join('\n'),
    /Fixes #418|walker|path|wave|Bill redirect/i,
  )
  assert.doesNotMatch(
    latestChange('1.4.302').items.join('\n'),
    /watch tower|range ring|tower feel/i,
    '1.4.302 must stay on Easy Night Watch little wave on path Fixes #418',
  )
}

// Night Watch 1.4.303: FRAME — UiShell + module seams (src/nightWatch)
{
  const nw = (file) => readFileSync(new URL(`../src/nightWatch/${file}`, import.meta.url), 'utf8')
  const shell303 = nw('ui/UiShell.tsx')
  const surface303 = nw('map/surface.ts')
  const path303 = nw('path/index.ts')
  const towers303 = nw('towers/index.ts')
  const enemies303 = nw('enemies/index.ts')
  const parts303 = nw('parts/index.ts')
  assert.match(shell303, /defend-frame/)
  assert.match(shell303, /docks/)
  assert.match(surface303, /readonly plate:/, '1.4.303 Frame must not drop the A2 plate slot')
  assert.match(surface303, /viewBox: '0 0 \d+ \d+'/)
  assert.match(path303, /points: DEFEND_PATH/)
  assert.match(path303, /DEFEND_ANCHOR\[id\]/)
  assert.match(towers303, /defendPads/)
  assert.match(towers303, /abilityRange/)
  assert.match(towers303, /dist\(/)
  assert.match(enemies303, /raidForWave/)
  assert.match(enemies303, /heavenPoint/)
  assert.match(parts303, /NightPartId = 'lot' \| 'lamp' \| 'face'/, '1.4.303 parts seam ids')
  for (const src of [path303, towers303, enemies303, parts303, surface303]) {
    assert.doesNotMatch(src, /from 'react'|components\//, 'Night Watch data seams stay React-free')
  }
  assert.match(defendScreenOnlySrc, /<UiShell/)
  assert.doesNotMatch(defendScreenOnlySrc, /className=\{`defend-frame/)
  assert.doesNotMatch(defendScreenOnlySrc, /DEFEND_ANCHOR|pathPoint\(|interface Raider/)
  assert.match(defendScreenOnlySrc, /useState<NightPhase>/)
  assert.match(defendSkySrc, /<MapPlate \/>/)
  assert.match(defendSkySrc, /nightPath\.roadD/)
  assert.match(defendNightSrc, /nightTowers\.inRange/)
  assert.deepEqual(nightPathMod.points, DEFEND_PATH)
  assert.deepEqual(nightPathMod.pointAt(0), DEFEND_PATH[0])
  assert.deepEqual(nightPathMod.pointAt(1), DEFEND_PATH[DEFEND_PATH.length - 1])
  assert.deepEqual(nightEnemiesMod.at({ id: 0, t: 0.5, text: '', kind: 'skeptic' }), pathPoint(0.5))
  assert.equal(nightEnemiesMod.waveSize, DEFEND_WAVE_SIZE)
  assert.equal(
    nightTowersMod.range('porch', 'love', empty),
    abilityRange('love', padStage('porch', empty), empty) + pathClearance(DEFEND_ANCHOR.porch),
  )
  assert.match(latestChange('1.4.303').title, /Night Watch|frame/i)
  assert.match(latestChange('1.4.303').items.join('\n'), /Night Watch|module|#418/i)
  assert.doesNotMatch(
    latestChange('1.4.303').items.join('\n'),
    /plate|candy cottage|yellow road|tower plant|auto-fire|spawn table/i,
    '1.4.303 must stay Frame only (no A2 map fill claims)',
  )
}

// Night Watch 1.4.304: MAP — A2 playfield plate under the board
{
  const nw = (file) => readFileSync(new URL(`../src/nightWatch/${file}`, import.meta.url), 'utf8')
  const surface304 = nw('map/surface.ts')
  const mapPlate304 = nw('map/MapPlate.tsx')
  const plateAsset = new URL('../src/assets/defend/nw-map-plate.webp', import.meta.url)
  assert.ok(existsSync(plateAsset), '1.4.304 ships nw-map-plate asset')
  assert.match(surface304, /nw-map-plate/, '1.4.304 wires NIGHT_MAP.plate import')
  assert.doesNotMatch(surface304, /plate: null/, '1.4.304 must fill the A2 plate')
  assert.match(mapPlate304, /defend-map-plate/)
  assert.match(defendSkySrc, /<MapPlate \/>/)
  assert.match(defendSkySrc, /has-map-plate/)
  const defendCss304 = readFileSync(new URL('../src/styles/defend.css', import.meta.url), 'utf8')
  assert.match(defendCss304, /has-map-plate|defend-map-plate/, 'defend.css must style A2 plate under board')
  assert.match(defendCss304, /\.defend-board\.has-map-plate/)
  assert.match(defendCss304, /\.defend-map-plate/)
  assert.match(latestChange('1.4.304').title, /Night Watch|map|plate|A2/i)
  assert.match(latestChange('1.4.304').items.join('\n'), /plate|map|#418/i)
  assert.doesNotMatch(
    latestChange('1.4.304').items.join('\n'),
    /tower plant|auto-fire|spawn table|HUD/i,
    '1.4.304 must stay MAP plate only',
  )
}

// Night Watch 1.4.305: PATH — A2 yellow road polyline (src/nightWatch/path)
{
  const path305 = readFileSync(new URL('../src/nightWatch/path/data.ts', import.meta.url), 'utf8')
  assert.match(path305, /A2 candy plate/)
  assert.match(path305, /polyline only/)
  assert.doesNotMatch(nightPathMod.roadD, /C /)
  assert.match(latestChange('1.4.305').title, /path|Night Watch|A2|yellow/i)
  assert.match(latestChange('1.4.305').items.join('\n'), /yellow road|path|#418/i)
  assert.doesNotMatch(
    latestChange('1.4.305').items.join('\n'),
    /plate drop|tower plant|spawn table|auto-fire/i,
    '1.4.305 must stay PATH only',
  )
}

// Night Watch 1.4.306: PARTS — PartsModule sprite registry (lot / lamp / face cutouts)
{
  const parts306 = readFileSync(new URL('../src/nightWatch/parts/index.ts', import.meta.url), 'utf8')
  const defendAsset = (name) =>
    existsSync(new URL(`../src/assets/defend/${name}`, import.meta.url))
  assert.ok(defendAsset('nw-lot-empty.png'), 'missing nw-lot-empty.png')
  assert.ok(defendAsset('nw-tower-lamp-idle.png'), 'missing nw-tower-lamp-idle.png')
  assert.ok(defendAsset('nw-tower-lamp-firing.png'), 'missing nw-tower-lamp-firing.png')
  assert.ok(defendAsset('nw-dark-face.png'), 'missing nw-dark-face.png')
  assert.match(parts306, /assets\/defend\/nw-lot-empty\.png/)
  assert.match(parts306, /assets\/defend\/nw-tower-lamp-idle\.png/)
  assert.match(parts306, /assets\/defend\/nw-tower-lamp-firing\.png/)
  assert.match(parts306, /assets\/walkers\/walker-skeptic\.png/)
  assert.doesNotMatch(parts306, /nw-dark-face\.png/, '1.4.322 faces are per-kind portraits')
  assert.match(parts306, /lot:[\s\S]*empty: lotEmpty/)
  assert.match(parts306, /lamp:[\s\S]*firing: lampFiring/)
  assert.equal(nightPartsMod.src('lot', 'empty'), nightPartsMod.src('lot', 'default'))
  assert.ok(nightPartsMod.src('lamp', 'idle'))
  assert.ok(nightPartsMod.src('lamp', 'firing'))
  assert.ok(nightPartsMod.src('face', 'skeptic'))
  assert.ok(nightPartsMod.src('face', 'image-bearer'))
  assert.doesNotMatch(parts306, /from 'react'|components\//, 'Parts registry stays React-free')
  assert.match(latestChange('1.4.306').title, /Night Watch|PARTS|parts|sprite/i)
  assert.match(latestChange('1.4.306').items.join('\n'), /PartsModule|lot|lamp|face|#418/i)
  assert.doesNotMatch(
    latestChange('1.4.306').items.join('\n'),
    /plate|candy cottage|yellow road|wave table|plant UX|auto-fire/i,
    '1.4.306 must stay PARTS registry only',
  )
}

// Night Watch 1.4.307: TOWERS — plant toys via TowersModule (lamp sprites on pads)
{
  const nw307 = (file) => readFileSync(new URL(`../src/nightWatch/${file}`, import.meta.url), 'utf8')
  const towers307 = nw307('towers/index.ts')
  const defendCss307 = readFileSync(new URL('../src/styles/defend.css', import.meta.url), 'utf8')
  assert.match(towers307, /lampSrc/)
  assert.match(towers307, /nw-tower-lamp-idle-cut\.png/)
  assert.match(towers307, /nw-tower-lamp-firing-cut\.png/)
  assert.match(towers307, /nightParts\.src\('lamp'/)
  assert.doesNotMatch(towers307, /from 'react'|components\//, '1.4.307 towers seam stays React-free')
  assert.match(defendNightSrc, /defend-tower-lamp/)
  assert.match(defendNightSrc, /nightTowers\.lampSrc/)
  assert.match(defendNightSrc, /is-tower-scenery/)
  assert.match(defendCss307, /1\.4\.307: tower lamp sprites/)
  assert.ok(
    existsSync(new URL('../src/assets/night-watch/nw-tower-lamp-idle-cut.png', import.meta.url)),
    'idle lamp sprite must ship in src/assets',
  )
  assert.ok(
    existsSync(new URL('../src/assets/night-watch/nw-tower-lamp-firing-cut.png', import.meta.url)),
    'firing lamp sprite must ship in src/assets',
  )
  assert.equal(nightTowersMod.lampSrc('idle'), nightPartsMod.src('lamp', 'idle'))
  assert.equal(nightTowersMod.lampSrc('firing'), nightPartsMod.src('lamp', 'firing'))
  assert.equal(nightTowersMod.lampPose(true), 'firing')
  assert.equal(nightTowersMod.lampPose(false), 'idle')
  assert.match(latestChange('1.4.307').title, /Night Watch|tower|lamp/i)
  assert.match(latestChange('1.4.307').items.join('\n'), /Night Watch|lamp|tower|#418/i)
  assert.doesNotMatch(
    latestChange('1.4.307').items.join('\n'),
    /HP|turret|pathfind|map plate|yellow road|candy cottage/i,
    '1.4.307 must stay Towers plant toys only',
  )
}

// Night Watch 1.4.308: ENEMIES — dark-face walkers on path (Fixes #418)
{
  const nw308 = (file) => readFileSync(new URL(`../src/nightWatch/${file}`, import.meta.url), 'utf8')
  const enemies308 = nw308('enemies/index.ts')
  assert.match(enemies308, /NIGHT_DARK_FACE/)
  assert.match(enemies308, /RAID_CAST/)
  assert.match(enemies308, /faceSrc/)
  assert.match(enemies308, /nightParts\.src\('face'/)
  assert.match(enemies308, /nw-dark-face-cut/)
  assert.equal(nightEnemiesMod.taunts.length, RAID_CAST.length)
  assert.equal(nightEnemiesMod.faceSrc('skeptic', true), nightPartsMod.src('face', 'skeptic'))
  assert.equal(nightEnemiesMod.faceSrc('pagan', true), nightPartsMod.src('face', 'pagan'))
  assert.match(defendNightSrc, /nightEnemies\.faceSrc/)
  assert.doesNotMatch(defendNightSrc, /nightParts\.src\('face'/)
  assert.doesNotMatch(defendNightSrc, /easy-walker is-easy-walker is-cue/)
  // 1.4.326 moved the on-path taunt chip into the left roster (Fixes #460).
  assert.match(defendNightSrc, /nw-walker-slide/)
  assert.match(defendNightSrc, /easy-walker-taunt/)
  assert.match(defendNightSrc, /is-dark-face/)
  assert.ok(
    existsSync(new URL('../src/assets/night-watch/nw-dark-face-cut.png', import.meta.url)),
    'missing nw-dark-face-cut.png',
  )
  assert.match(latestChange('1.4.308').title, /Night Watch|ENEMIES|dark|walker/i)
  assert.match(
    latestChange('1.4.308').items.join('\n'),
    /dark-face|RAID_CAST|path|face-circle|#418/i,
  )
  assert.doesNotMatch(
    latestChange('1.4.308').items.join('\n'),
    /plate|candy cottage|tower plant|auto-fire|spawn table/i,
    '1.4.308 must stay ENEMIES fill only',
  )
}

// Night Watch 1.4.309: MAP+PATH — walkers on the A2 plate's painted yellow road (geometry superseded by 1.4.315 whole plate)
{
  const nw309 = (file) => readFileSync(new URL(`../src/nightWatch/${file}`, import.meta.url), 'utf8')
  assert.match(nw309('map/MapPlate.tsx'), /preserveAspectRatio="xMidYMid meet"/)
  assert.doesNotMatch(nw309('map/MapPlate.tsx'), /slice/)
  assert.equal(nightPathMod.roadD, '', '1.4.309 plate paints the road; neon overlay stays empty')
  assert.ok(DEFEND_PATH.length >= 30, '1.4.309 enough points to hug the S-curve')
  const segs = DEFEND_PATH.slice(1).map((p, i) => Math.hypot(p.x - DEFEND_PATH[i].x, p.y - DEFEND_PATH[i].y))
  assert.ok(Math.max(...segs) < 1.5 * Math.min(...segs), '1.4.309 even spacing keeps pathPoint speed steady')
  assert.match(latestChange('1.4.309').title, /Night Watch|Map|Path|yellow road/i)
  assert.match(latestChange('1.4.309').items.join('\n'), /yellow road|centerline|#418/i)
  assert.doesNotMatch(
    latestChange('1.4.309').items.join('\n'),
    /tower plant|auto-fire|spawn table|HP|pathfind/i,
    '1.4.309 must stay Map+Path only',
  )
}

// Night Watch 1.4.310: UiShell — right C&C rail + chrome HUD + money balloon (A2 plate)
{
  const nw310 = (file) => readFileSync(new URL(`../src/nightWatch/${file}`, import.meta.url), 'utf8')
  const shell310 = nw310('ui/UiShell.tsx')
  const chrome310 = nw310('ui/Chrome.tsx')
  const css310 = readFileSync(new URL('../src/styles/defend.css', import.meta.url), 'utf8')
  for (const slot of ['hud', 'coin', 'balloon', 'rail', 'docks']) {
    assert.match(shell310, new RegExp(`\\b${slot}\\?: ReactNode`), `1.4.310 UiShell exposes a ${slot} slot`)
  }
  assert.match(shell310, /className="nw-stage"[\s\S]*defend-frame[\s\S]*nw-rail/, '1.4.310 rail sits beside the frame')
  assert.doesNotMatch(shell310, /useState|useEffect|useRef/, '1.4.310 UiShell owns no combat state')
  assert.match(chrome310, /MoneyBalloon/)
  assert.match(chrome310, /CoinRead/)
  assert.match(chrome310, /gem="coin"/)
  assert.match(defendScreenOnlySrc, /rail=\{rail\}/)
  assert.match(defendScreenOnlySrc, /balloon=\{<MoneyBalloon count=\{runSparks\} label="Sparks"/)
  assert.match(
    defendScreenOnlySrc,
    /coin=\{[\s\S]*?<CoinRead count=\{insightScore\(progress\)\}/,
    '1.4.310 coin still reads journal insight',
  )
  assert.doesNotMatch(
    defendScreenOnlySrc,
    /progress\.stars/,
    '1.4.327 sparks are not journal stars',
  )
  assert.doesNotMatch(defendScreenOnlySrc, /wallet|setCoins|coins:/i, '1.4.310 no shop economy')
  const docksBlock = defendScreenOnlySrc.match(/const docks = \([\s\S]*?\n {2}\)\n/)?.[0] ?? ''
  assert.ok(docksBlock, '1.4.310 docks block present')
  assert.doesNotMatch(docksBlock, /DefendAbilityBar/, '1.4.310 ability dock is not a bottom dock')
  assert.match(defendAbilitySrc, /WATCH_TOOLS\.map/)
  assert.doesNotMatch(css310, /grid-template-columns: repeat\(2, minmax\(0, 1fr\)\)/, '1.4.310 no 2×2 dock grid')
  assert.match(css310, /1\.4\.310 UiShell chrome/)
  assert.match(css310, /\.nw-stage \{[\s\S]*?grid-template-columns: minmax\(0, 1fr\)/)
  assert.match(css310, /\.defend-ability-claim \{[\s\S]*?clip: rect\(0 0 0 0\)/)
  assert.match(latestChange('1.4.310').title, /UiShell/)
  assert.match(latestChange('1.4.310').items.join('\n'), /right rail|C&C|Love \/ Logic/i)
  assert.doesNotMatch(
    latestChange('1.4.310').items.join('\n'),
    /tower plant|auto-fire|spawn table|pathfind|new tool/i,
    '1.4.310 must stay UiShell / docks / HUD only',
  )
}

// Night Watch 1.4.311: playfield full-bleed under chrome — stage fills (projection superseded by 1.4.312 contain)
{
  const css311 = readFileSync(new URL('../src/styles/defend.css', import.meta.url), 'utf8')
  assert.doesNotMatch(css311, /--nw-frame-h|58dvh/, '1.4.311 no aspect / dvh cap on the stage')
  assert.match(css311, /\.nw-shell \{[\s\S]*?flex: 1 1 auto/, '1.4.311 shell takes the rest of the page')
  assert.match(css311, /\.nw-stage \{[\s\S]*?flex: 1 1 0/, '1.4.311 stage takes the rest of the shell')
  assert.match(css311, /\.nw-stage \{[\s\S]*?grid-template-rows: minmax\(0, 1fr\)/)
  assert.match(defendScreenOnlySrc, /mapBoardPoint\(boardBox,/, '1.4.311 overlays share the measured box')
  assert.match(latestChange('1.4.311').title, /full-bleed/i)
  assert.doesNotMatch(
    latestChange('1.4.311').items.join('\n'),
    /tower plant|auto-fire|spawn table|pathfind|new tool|HP/,
    '1.4.311 must stay layout + projection only',
  )
}

// Night Watch 1.4.312: whole plate visible — full-bleed stage, contain camera on the plate (plate size per 1.4.315)
{
  const surface312 = readFileSync(new URL('../src/nightWatch/map/surface.ts', import.meta.url), 'utf8')
  const css312 = readFileSync(new URL('../src/styles/defend.css', import.meta.url), 'utf8')
  assert.match(css312, /\.nw-stage \{[\s\S]*?flex: 1 1 0/, '1.4.312 keeps the 1.4.311 full-bleed stage')
  assert.match(defendSkySrc, /preserveAspectRatio="xMidYMid meet"/, '1.4.312 board contains, never slices')
  assert.doesNotMatch(defendSkySrc, /slice/)
  assert.match(
    defendScreenOnlySrc,
    /viewBox=\{plateFill \? boardFillBox\(boardBox\) : boardViewBox\(boardBox\)\}/,
    '1.4.312 contain camera stays; 1.4.379 Easy phone fills the stage',
  )
  assert.match(surface312, /Math\.min\(box\.w \/ map\.width, box\.h \/ map\.height\)/, '1.4.312 contain scale')
  assert.doesNotMatch(surface312, /Math\.max\(box\.w|ROAD_KEEP|cropStart/, '1.4.312 no cover crop')
  assert.match(surface312, /x: 0,\s*y: 0,\s*w: map\.width,\s*h: map\.height/, '1.4.312 viewBox is always the whole plate')
  assert.match(surface312, /const view = boardView\(box, map\)[\s\S]*?view\.left \+ \(point\.x - view\.x\) \* view\.scale/, '1.4.312 boardPoint shares the viewBox camera')
  const [, plateW312, plateH312] = (surface312.match(/viewBox: '0 0 (\d+) (\d+)'/) ?? []).map(Number)
  assert.ok(plateW312 > 0 && plateH312 > 0, '1.4.312 NIGHT_MAP declares its plate size')
  for (const p of DEFEND_PATH) {
    assert.ok(p.x >= 0 && p.x <= plateW312 && p.y >= 0 && p.y <= plateH312, `1.4.312 walker road point ${p.x},${p.y} on the plate`)
  }
  const phone = { w: 300, h: 560 }
  const scale = Math.min(phone.w / plateW312, phone.h / plateH312)
  assert.ok(plateW312 * scale <= phone.w && plateH312 * scale <= phone.h, '1.4.312 phone stage holds the whole plate')
  assert.match(latestChange('1.4.312').title, /whole plate/i)
  assert.doesNotMatch(
    latestChange('1.4.312').items.join('\n'),
    /tower plant|auto-fire|spawn table|pathfind|new tool|HP/,
    '1.4.312 must stay layout + projection only',
  )
}

// Night Watch 1.4.313: compact chrome — docks overlay the stage, Easy drops the title stack
{
  const shell313 = readFileSync(new URL('../src/nightWatch/ui/UiShell.tsx', import.meta.url), 'utf8')
  const css313 = readFileSync(new URL('../src/styles/defend.css', import.meta.url), 'utf8')
  const frame313 = shell313.match(/<div className=\{`defend-frame[\s\S]*?\n {8}<\/div>/)?.[0] ?? ''
  assert.match(frame313, /nw-docks/, '1.4.313 docks render inside the frame, not under the stage')
  assert.doesNotMatch(shell313, /<\/div>\s*\{docks\}\s*<\/div>/, '1.4.313 no stacked footer docks')
  assert.match(css313, /\.nw-docks \{[\s\S]*?position: absolute/, '1.4.313 docks overlay the stage')
  const docksBlock313 = defendScreenOnlySrc.match(/const docks = \([\s\S]*?\n {2}\)\n/)?.[0] ?? ''
  for (const part of ['defend-lost', 'defend-go', 'match-toast', 'defend-tip', 'defend-angel-help']) {
    assert.match(docksBlock313, new RegExp(part), `1.4.313 ${part} lives in the overlay docks`)
  }
  assert.doesNotMatch(docksBlock313, /DefendAbilityBar/, '1.4.313 right C&C rail stays out of the docks')
  const shellTail313 = defendScreenOnlySrc.slice(defendScreenOnlySrc.indexOf('</UiShell>'))
  assert.doesNotMatch(shellTail313, /defend-tip|defend-lost/, '1.4.313 nothing stacks under the shell')
  assert.doesNotMatch(defendScreenOnlySrc, /defend-tip">\{EASY\.nightTap\}/, '1.4.313 Easy tip does not duplicate the on-map cue')
  assert.match(defendScreenOnlySrc, /nw-sr-only">\{EASY\.nightLead\}/, '1.4.313 Easy title stays for screen readers only')
  assert.match(css313, /\.nw-sr-only \{[\s\S]*?clip: rect\(0 0 0 0\)/)
  assert.match(css313, /\.nw-stage \{[\s\S]*?flex: 1 1 0/, '1.4.313 stage takes the reclaimed height')
  assert.match(defendSkySrc, /preserveAspectRatio="xMidYMid meet"/, '1.4.313 keeps the 1.4.312 contain plate')
  assert.match(latestChange('1.4.313').title, /compact chrome/i)
  assert.doesNotMatch(
    latestChange('1.4.313').items.join('\n'),
    /tower plant|auto-fire|spawn table|pathfind|new tool|HP/,
    '1.4.313 must stay chrome layout only',
  )
}

// Night Watch 1.4.314: C&C cutaway floats over the full-width map (no reserved rail column)
{
  const shell314 = readFileSync(new URL('../src/nightWatch/ui/UiShell.tsx', import.meta.url), 'utf8')
  const css314 = readFileSync(new URL('../src/styles/defend.css', import.meta.url), 'utf8')
  const stage314 = css314.match(/\n\.nw-stage \{[\s\S]*?\n\}/)?.[0] ?? ''
  const rail314 = css314.match(/\n\.nw-rail \{[\s\S]*?\n\}/)?.[0] ?? ''
  assert.match(stage314, /grid-template-columns: minmax\(0, 1fr\);/, '1.4.314 stage is one full-width column')
  assert.doesNotMatch(stage314, /minmax\(0, 1fr\) auto|gap:/, '1.4.314 no reserved rail column beside the frame')
  assert.match(stage314, /position: relative/, '1.4.314 stage anchors the floating rail')
  assert.match(rail314, /position: absolute/, '1.4.314 C&C floats over the map')
  assert.match(rail314, /right: /, '1.4.314 C&C sits on the right edge')
  assert.doesNotMatch(rail314, /bottom: /, '1.4.314 C&C does not move to the bottom')
  assert.match(rail314, /pointer-events: none/, '1.4.314 map stays tappable around the dock')
  assert.match(css314, /\.nw-rail \.defend-ability \{[\s\S]*?pointer-events: auto/, '1.4.314 C&C buttons stay tappable')
  assert.match(shell314, /className="nw-stage"[\s\S]*defend-frame[\s\S]*nw-rail/, '1.4.314 rail still hosted by UiShell')
  assert.match(defendScreenOnlySrc, /rail=\{rail\}/)
  assert.match(defendAbilitySrc, /WATCH_TOOLS\.map/, '1.4.314 keeps Love / Logic / Reason / Science')
  assert.match(defendScreenOnlySrc, /balloon=\{<MoneyBalloon/, '1.4.314 keeps the money balloon')
  assert.match(defendScreenOnlySrc, /coin=\{[\s\S]*?<CoinRead/, '1.4.314 keeps the coin HUD')
  assert.match(css314, /\.nw-docks \{[\s\S]*?position: absolute/, '1.4.314 keeps the 1.4.313 overlay docks')
  assert.match(defendSkySrc, /preserveAspectRatio="xMidYMid meet"/, '1.4.314 keeps the 1.4.312 contain plate')
  assert.doesNotMatch(defendSkySrc, /slice/, '1.4.314 no cover crop')
  assert.match(latestChange('1.4.314').title, /C&C float over map/)
  assert.doesNotMatch(
    latestChange('1.4.314').items.join('\n'),
    /tower plant|auto-fire|spawn table|pathfind|new tool|HP/,
    '1.4.314 must stay chrome layout only',
  )
}

// Night Watch 1.4.315: whole locked A2 plate (portrait), path retraced gate → top cottage
{
  const nw315 = (file) => readFileSync(new URL(`../src/nightWatch/${file}`, import.meta.url), 'utf8')
  const surface315 = nw315('map/surface.ts')
  const plateUrl315 = new URL('../src/assets/defend/nw-map-plate.webp', import.meta.url)
  assert.ok(!existsSync(new URL('../src/assets/defend/nw-map-plate.png', import.meta.url)), '1.4.315 landscape crop plate is gone')
  assert.match(surface315, /assets\/defend\/nw-map-plate\.webp/)
  assert.match(surface315, /width: 798,\s*height: 1134,\s*viewBox: '0 0 798 1134'/, '1.4.315 NIGHT_MAP is the whole A2 plate')
  const webp = readFileSync(plateUrl315)
  assert.equal(webp.toString('ascii', 0, 4), 'RIFF')
  assert.equal(webp.toString('ascii', 8, 16), 'WEBPVP8 ', '1.4.315 plate is lossy WebP')
  assert.equal(webp.readUInt16LE(26) & 0x3fff, 798, '1.4.315 plate pixels match NIGHT_MAP width')
  assert.equal(webp.readUInt16LE(28) & 0x3fff, 1134, '1.4.315 plate pixels match NIGHT_MAP height')
  assert.match(surface315, /Math\.min\(box\.w \/ map\.width, box\.h \/ map\.height\)/, '1.4.315 keeps contain')
  assert.doesNotMatch(surface315, /Math\.max\(box\.w/, '1.4.315 no cover-zoom')
  assert.match(nw315('map/MapPlate.tsx'), /preserveAspectRatio="xMidYMid meet"/)
  assert.equal(nightPathMod.roadD, '', '1.4.315 plate paints the road')

  const start = DEFEND_PATH[0]
  const end = DEFEND_PATH[DEFEND_PATH.length - 1]
  assert.equal(start.x, 798, '1.4.315 walkers enter off the right edge over the gate slabs')
  assert.ok(start.y > 1080 && start.y < 1110, '1.4.315 entry sits on the painted stone slabs')
  assert.ok(
    DEFEND_PATH.some((p) => p.x > 690 && p.x < 730 && p.y > 1050 && p.y < 1075),
    '1.4.315 walkers pass through the painted gate opening',
  )
  assert.ok(end.x > 370 && end.x < 410 && end.y > 60 && end.y < 90, '1.4.315 road ends under the top cottage roof')
  assert.ok(DEFEND_PATH.length >= 60, '1.4.315 enough points to hug the long portrait S-road')
  assert.ok(Math.max(...DEFEND_PATH.map((p) => p.x)) > 570, '1.4.315 upper bend reaches the painted top curve')
  assert.ok(
    DEFEND_PATH.some((p) => p.x < 300 && p.y > 690 && p.y < 760),
    '1.4.315 lower S-bend swings left past the bottom cottage',
  )
  assert.ok(
    !DEFEND_PATH.some((p) => p.x < 400 && p.y > 960),
    '1.4.315 walkers skip the fork arm to the bottom cottage',
  )
  const toRoad315 = (q) =>
    Math.min(
      ...DEFEND_PATH.slice(1).map((b, i) => {
        const a = DEFEND_PATH[i]
        const dx = b.x - a.x
        const dy = b.y - a.y
        const t = Math.max(0, Math.min(1, ((q.x - a.x) * dx + (q.y - a.y) * dy) / (dx * dx + dy * dy)))
        return Math.hypot(q.x - (a.x + dx * t), q.y - (a.y + dy * t))
      }),
    )
  const seats315 = Object.entries(DEFEND_ANCHOR)
  for (const [id, seat] of seats315) {
    const d = toRoad315(seat)
    assert.ok(d > 36 && d < 110, `1.4.315 ${id} seat sits beside the road (d=${d.toFixed(0)})`)
    assert.ok(seat.y - 64 >= 0 && seat.x >= 38 && seat.x <= 798 - 38, `1.4.315 ${id} lamp fits on the plate`)
    assert.ok(!(seat.x > 640 && seat.y < 480), `1.4.315 ${id} seat stays clear of the right C&C float`)
  }
  for (const [i, [a, p]] of seats315.entries()) {
    for (const [b, q] of seats315.slice(i + 1)) {
      assert.ok(Math.hypot(p.x - q.x, p.y - q.y) >= 90, `1.4.315 ${a} / ${b} lamps don't overlap`)
    }
  }

  const css315 = readFileSync(new URL('../src/styles/defend.css', import.meta.url), 'utf8')
  assert.match(css315, /\.defend-board\.has-map-plate > \.defend-gate,/, '1.4.315 plate paints the gate; vector gate glyph hides')
  const rail315 = css315.match(/\n\.nw-rail \{[\s\S]*?\n\}/)?.[0] ?? ''
  assert.match(rail315, /position: absolute/, '1.4.315 keeps the 1.4.314 C&C float')
  assert.match(defendAbilitySrc, /WATCH_TOOLS\.map/, '1.4.315 keeps Love / Logic / Reason / Science')
  assert.match(defendScreenOnlySrc, /balloon=\{<MoneyBalloon/, '1.4.315 keeps the money balloon')
  assert.match(defendScreenOnlySrc, /coin=\{[\s\S]*?<CoinRead/, '1.4.315 keeps the coin HUD')
  assert.match(latestChange('1.4.315').title, /whole locked A2 plate/)
  assert.doesNotMatch(
    latestChange('1.4.315').items.join('\n'),
    /tower plant|auto-fire|spawn table|pathfind|new tool|HP|bezel|letterbox/,
    '1.4.315 must stay art plate + path only',
  )
}

// Night Watch 1.4.316: enemy HP — enemies module owns the table + hit; match damages, weak pushes back
{
  const hpSrc316 = readFileSync(new URL('../src/nightWatch/enemies/hp.ts', import.meta.url), 'utf8')
  assert.doesNotMatch(hpSrc316, /from 'react'|components\//, '1.4.316 HP seam stays React-free')
  const kinds316 = ['image-bearer', 'skeptic', 'pagan', 'physical', 'metaphysical', 'spiritual']
  const hard316 = kinds316.map((kind) => nightEnemiesMod.maxHp(kind, false))
  const easy316 = kinds316.map((kind) => nightEnemiesMod.maxHp(kind, true))
  assert.deepEqual([...new Set(hard316)].sort(), [2, 3, 4], '1.4.316 Hard swarm 2 / mid 3 / tank 4')
  assert.ok(easy316.every((hp) => hp >= 2 && hp <= 3), '1.4.316 Easy walkers take 2–3 hits')
  assert.equal(easy316.filter((hp) => hp === 3).length, 1, '1.4.316 one Easy tank kind at 3')
  for (const cast of RAID_CAST) {
    assert.ok(nightEnemiesMod.maxHp(cast.kind, true) > 1, `1.4.316 Easy ${cast.kind} needs more than one tap`)
  }

  let walker316 = { id: 0, t: 0.4, text: '', kind: 'skeptic', hp: 2, maxHp: 2 }
  const first316 = nightEnemiesMod.hit(walker316)
  assert.equal(first316.raider.hp, 1)
  assert.equal(first316.down, false, '1.4.316 first hit does not turn a 2-HP walker')
  assert.equal(walker316.hp, 2, '1.4.316 hit returns a copy')
  walker316 = first316.raider
  const second316 = nightEnemiesMod.hit(walker316)
  assert.equal(second316.raider.hp, 0)
  assert.equal(second316.down, true, '1.4.316 HP 0 → soft-turn')
  assert.equal(nightEnemiesMod.hit(second316.raider).raider.hp, 0, '1.4.316 HP floors at 0')

  assert.match(defendScreenOnlySrc, /nightEnemies\.maxHp\(cast\.kind, easy\)/, '1.4.316 spawn seeds HP from enemies')
  assert.match(
    defendScreenOnlySrc,
    /const struck = nightEnemies\.hit\(best(?:, tier)?\)/,
    '1.4.316 match hit goes through enemies.hit',
  )
  assert.match(defendScreenOnlySrc, /struck\.down\s*\?\s*\{ \.\.\.struck\.raider, turned: using, from: to, heavenT: 0/, '1.4.316 keeps soft-turn verb at HP 0')
  assert.match(defendScreenOnlySrc, /if \(struck\.down\) \{\s*live\.current\.downed \+= 1/, '1.4.316 downed counts only turned walkers')
  assert.match(defendScreenOnlySrc, /t: Math\.max\(0, item\.t - 0\.22\)/, '1.4.316 weak stays pushback')
  assert.match(defendNightSrc, /tapJuice\.down === false/, '1.4.316 Easy juice lifts heavenward only on the last hit')
  assert.match(latestChange('1.4.316').title, /Night Watch enemy HP/)
  assert.doesNotMatch(
    latestChange('1.4.316').items.join('\n'),
    /pathfind|tower HP|projectile|bezel|letterbox|new walker/i,
    '1.4.316 stays enemy HP only',
  )
}

// Easy Match 1.4.318: person/place variety on MATCH_CHIPS (#444)
{
  assert.match(latestChange('1.4.318').title, /Easy Match person and place/)
  assert.match(latestChange('1.4.318').items.join('\n'), /Fixes #444/)
  assert.doesNotMatch(
    latestChange('1.4.318').items.join('\n'),
    /Night Watch|enemy HP|board juice/i,
    '1.4.318 stays Easy Match person and place variety',
  )
}

// Easy show-it 1.4.319: ph-road Learn plays the clip, then a picture tap (Fixes #439)
{
  assert.equal(SHOW_IT_LINE, 'ph-road')
  assert.equal(SHOW_IT_PROMPT, 'Who helped?')
  assert.ok(showItWordCount(SHOW_IT_PROMPT) <= SHOW_IT_WORD_CAP, '1.4.319 prompt stays within 6 words')
  assert.equal(showItWordCount(SHOW_IT_PROMPT), 2)
  assert.equal(PH_ROAD_SHOW_IT.correctId, '03-compassion-helps')
  assert.deepEqual(
    PH_ROAD_SHOW_IT.choices.map((choice) => choice.id),
    ['01-hurt-road', '02-walk-past', '03-compassion-helps'],
  )
  assert.match(PH_ROAD_SHOW_IT.clip, /assets\/show-it\/ph-road-showit\.webm$/)
  assert.match(PH_ROAD_SHOW_IT.poster, /assets\/show-it\/ph-road-showit-poster\.jpg$/)
  for (const choice of PH_ROAD_SHOW_IT.choices) {
    assert.match(choice.src, new RegExp(`assets/panel-blast/ph-road/${choice.id}@1024\\.webp$`))
  }
  for (const rel of [
    'public/assets/show-it/ph-road-showit.webm',
    'public/assets/show-it/ph-road-showit-poster.jpg',
    'docs/assets/show-it/ph-road-showit.webm',
    'docs/assets/show-it/ph-road-showit-poster.jpg',
  ]) {
    assert.ok(existsSync(new URL(`../${rel}`, import.meta.url)), `1.4.319 missing ${rel}`)
  }

  const showSrc319 = readFileSync(new URL('../src/components/ShowItTeach.tsx', import.meta.url), 'utf8')
  const teachSrc319 = readFileSync(new URL('../src/components/TeachUnlock.tsx', import.meta.url), 'utf8')
  assert.match(teachSrc319, /brief\.id === SHOW_IT_LINE/)
  assert.match(teachSrc319, /<ShowItTeach onUnlock=\{onUnlock\} \/>/)
  assert.ok(
    teachSrc319.indexOf('SHOW_IT_LINE') < teachSrc319.indexOf('easy-story-card'),
    '1.4.319 show-it replaces the ph-road card; other Easy lessons keep easy-story-card',
  )
  assert.match(teachSrc319, /Skip reading/)
  assert.match(teachSrc319, /LociStamp/)
  assert.match(teachSrc319, /HeldTriad/)
  assert.match(showSrc319, /onEnded=\{\(\) => setPhase\('pick'\)\}/)
  assert.match(showSrc319, /onUnlock\(\)/)
  assert.match(showSrc319, /is-shake/)
  assert.match(showSrc319, /\{PH_ROAD_SHOW_IT\.prompt\}/)
  assert.doesNotMatch(showSrc319, /Skip reading|Short story|HeldTriad|teach-reason|Unlock the/)
  assert.match(
    readFileSync(new URL('../src/main.tsx', import.meta.url), 'utf8'),
    /showIt\.css/,
  )
  assert.match(cssSrc, /\.show-it-choice\.is-shake/)
  assert.match(latestChange('1.4.319').title, /Who helped/)
  assert.match(latestChange('1.4.319').items.join('\n'), /Fixes #439/)
  assert.match(latestChange('1.4.319').items.join('\n'), /ph-road/)
  assert.doesNotMatch(
    latestChange('1.4.319').items.join('\n'),
    /Night Watch|Dig Scripture|board plant|#443|#444/i,
    '1.4.319 stays the ph-road show-it pilot',
  )
}

// Match 1.4.321: board stays planted after the first find (Fixes #443)
{
  const play321 = readFileSync(
    new URL('../src/components/challenges/GemSearchPlay.tsx', import.meta.url),
    'utf8',
  )
  const gemCss321 = readFileSync(new URL('../src/styles/gem.css', import.meta.url), 'utf8')
  const juice321 = readFileSync(new URL('../src/styles/gem-less-waste.css', import.meta.url), 'utf8')
  assert.match(latestChange('1.4.321').title, /Match board stays planted/)
  assert.match(latestChange('1.4.321').items.join('\n'), /Fixes #443/)
  assert.doesNotMatch(
    latestChange('1.4.321').items.join('\n'),
    /Night Watch|Dig deeper|Hard trail|Town/i,
    '1.4.321 stays Match board plant',
  )
  assert.doesNotMatch(play321, /setStripMode\('hero'\)/, '1.4.321 no hero layout push')
  assert.doesNotMatch(play321, /is-live/, '1.4.321 no board-wide is-live')
  assert.match(play321, /className=\{`play is-gem-search is-panel-blast is-story-docked/)
  assert.doesNotMatch(gemCss321, /\.gem-cell\.is-live\s*\{/)
  assert.doesNotMatch(gemCss321, /@keyframes gem-board-thump/)
  assert.doesNotMatch(juice321, /animation:\s*gem-board-thump/)
  assert.match(
    juice321,
    /\.play\.is-gem-search\.is-find-pop \.gem-board,\s*\n\.play\.is-gem-search\.is-boom \.gem-board \{\s*\n\s*animation:\s*none/,
  )
  assert.match(juice321, /\.play\.is-gem-search \.match-teach-chip\.is-found \{[\s\S]*?box-shadow:\s*0 1px 0/)
  assert.match(juice321, /\.gem-cell\.is-burst/)
}

// Night Watch 1.4.322: per-kind walker portraits (Fixes #450)
{
  const parts322 = readFileSync(new URL('../src/nightWatch/parts/index.ts', import.meta.url), 'utf8')
  const kinds = ['image-bearer', 'skeptic', 'pagan', 'physical', 'metaphysical', 'spiritual']
  const faces = kinds.map((kind) => nightPartsMod.src('face', kind))
  assert.equal(new Set(faces).size, kinds.length, '1.4.322 each walker kind has its own face')
  for (const kind of kinds) {
    const file = `walker-${kind}.png`
    assert.match(parts322, new RegExp(`assets/walkers/${file.replace('.', '\\.')}`))
    assert.match(String(nightPartsMod.src('face', kind)), new RegExp(file.replace('.', '\\.')))
    assert.equal(nightEnemiesMod.faceSrc(kind, true), nightPartsMod.src('face', kind))
    assert.equal(nightEnemiesMod.faceSrc(kind, false), nightPartsMod.src('face', kind))
    assert.doesNotMatch(String(nightPartsMod.src('face', kind)), /nw-dark-face/)
  }
  assert.doesNotMatch(parts322, /nw-dark-face\.png/)
  assert.match(latestChange('1.4.322').title, /Night Watch walker portraits/)
  assert.match(latestChange('1.4.322').items.join('\n'), /Fixes #450/)
  assert.match(latestChange('1.4.322').items.join('\n'), /Tap the face/)
  assert.doesNotMatch(
    latestChange('1.4.322').items.join('\n'),
    /HP bar|enemies remaining|#451|#452|#453|Dig deeper|Hard trail|Town/i,
    '1.4.322 stays walker portraits',
  )
}

// Night Watch 1.4.323: enemy HP bar (Fixes #451). 1.4.331 thins the capsule (Fixes #472).
{
  const defendCss323 = readFileSync(new URL('../src/styles/defend.css', import.meta.url), 'utf8')
  assert.match(defendNightSrc, /const HP_TRACK = \{[\s\S]*?w: PATH_WALKER_FACE_U/, '1.4.331 track is face-scale')
  assert.match(defendNightSrc, /const HP_FILL = \{ inset: 2, h: 6, rx: 3 \}/, '1.4.331 fill sits inside the thin track')
  assert.ok((10 * 390) / 798 <= 10, '1.4.331 track is at most ~10px tall on a 390px phone')
  assert.ok((6 * 390) / 798 <= 10, '1.4.331 gold fill stays a thin line on a 390px phone')
  assert.ok(PATH_WALKER_FACE_U >= 36, '1.4.345 path face stays readable on the portrait plate')
  assert.match(defendNightSrc, /className="defend-hp-bar"/, '1.4.323 HP bar group')
  assert.match(defendNightSrc, /className="defend-hp-track"/, '1.4.323 HP track under the face')
  assert.match(defendNightSrc, /className="defend-hp-fill"/, '1.4.323 HP fill')
  assert.match(
    defendNightSrc,
    /\(\(HP_TRACK\.w - HP_FILL\.inset \* 2\) \* raider\.hp\) \/ \(raider\.maxHp \?\? 1\)/,
    '1.4.323 fill width is hp/maxHp',
  )
  assert.match(defendNightSrc, /!raider\.turned && \(raider\.maxHp \?\? 0\) > 1/, '1.4.323 bar is on living walkers')
  assert.doesNotMatch(defendNightSrc, /defend-hp-pip/, '1.4.323 replaces the ~5px pips')
  assert.match(defendCss323, /\.defend-hp-track \{[\s\S]*?fill: rgba\(42, 13, 88, 0\.92\)/, '1.4.323 dark track')
  assert.match(defendCss323, /\.defend-hp-fill \{[\s\S]*?fill: #ffcc33/, '1.4.323 gold fill')
  assert.doesNotMatch(defendCss323, /\.defend-hp-pip/, '1.4.323 pip CSS is gone')
  assert.match(latestChange('1.4.323').title, /Night Watch HP bar/)
  assert.match(latestChange('1.4.323').items.join('\n'), /Fixes #451/)
  assert.match(latestChange('1.4.323').items.join('\n'), /Easy and Hard/)
  assert.doesNotMatch(
    latestChange('1.4.323').items.join('\n'),
    /#450|#452|#453|varieties|enemies remaining|Dig deeper|Hard trail|Town|tower HP|pathfind/i,
    '1.4.323 stays the HP bar',
  )
}

// Night Watch 1.4.324: HUD shows enemies remaining (Fixes #453).
{
  assert.match(
    defendSrc,
    /const remaining = waveSize - downed/,
    '1.4.324 remaining is the live wave pack minus downed',
  )
  assert.match(defendSrc, /TAP \$\{remaining\} left/, '1.4.324 Easy TAP names how many are left')
  assert.match(defendSrc, /\$\{remaining\} left · TAP/, '1.4.324 Hard names how many are left')
  assert.match(defendSrc, /×\$\{combo\}  \$\{remaining\} left/, '1.4.324 combo keeps the remaining total')
  assert.doesNotMatch(defendSrc, /TAP \$\{downed\}/, '1.4.324 HUD is not cleared/total')
  assert.doesNotMatch(
    defendSrc,
    /\$\{downed\}\/\$\{DEFEND_WAVE_SIZE\}/,
    '1.4.324 no cleared/total fraction',
  )
  assert.match(latestChange('1.4.324').title, /Night Watch enemies remaining/)
  assert.match(latestChange('1.4.324').items.join('\n'), /Fixes #453/)
  assert.match(latestChange('1.4.324').items.join('\n'), /left/)
  assert.doesNotMatch(
    latestChange('1.4.324').items.join('\n'),
    /#450|#451|#452|HP bar|varieties|Dig deeper|Hard trail|Town|tower HP|pathfind/i,
    '1.4.324 stays enemies remaining',
  )
}

// Night Watch 1.4.325: Easy night 0 sees all six walker kinds, names readable (Fixes #452).
{
  assert.deepEqual(
    RAID_CAST.slice(0, 6).map((item) => item.kind),
    ['skeptic', 'image-bearer', 'spiritual', 'pagan', 'physical', 'metaphysical'],
    '1.4.325 first six cast slots are Accuser through Whisper',
  )
  assert.doesNotMatch(
    readFileSync(new URL('../src/lib/defend.ts', import.meta.url), 'utf8'),
    /loveKinds/,
    '1.4.325 drops the night-0 loveKinds filter',
  )
  assert.match(defendNightSrc, /WALKER_LABEL\[call\.kind\]/, '1.4.325 Easy call keeps WALKER_LABEL')
  assert.match(defendNightSrc, /easy-walker-kind/, '1.4.325 kind name stays in the HTML call')
  assert.match(latestChange('1.4.325').title, /Night Watch enemy varieties/)
  assert.match(latestChange('1.4.325').items.join('\n'), /Fixes #452/)
  assert.match(latestChange('1.4.325').items.join('\n'), /Whisper/)
  assert.doesNotMatch(
    latestChange('1.4.325').items.join('\n'),
    /Dig deeper|Hard trail|Town|#450|#451|#453|new portrait|HP bar/i,
    '1.4.325 stays enemy varieties',
  )
}

// Night Watch 1.4.326: descriptors off the path, left slide-out (Fixes #460).
{
  const defendCss326 = readFileSync(new URL('../src/styles/defend.css', import.meta.url), 'utf8')
  assert.match(defendNightSrc, /nw-walker-slide/, '1.4.326 left slide-out')
  assert.match(defendNightSrc, /easy-walker-roster/, '1.4.326 roster lists living walkers')
  assert.match(defendNightSrc, /WALKER_LABEL\[call\.kind\]/, '1.4.326 roster uses kind labels')
  assert.match(defendNightSrc, /\{call\.text\}/, '1.4.326 roster keeps the taunt')
  assert.match(defendSrc, /filter\(\(raider\) => !raider\.turned\)/, '1.4.326 roster is living walkers')
  assert.doesNotMatch(defendNightSrc, /is-on-map/, '1.4.326 no on-path call anchor')
  assert.doesNotMatch(defendNightSrc, /KIND_CALL/, '1.4.326 no Hard on-path kind chip')
  assert.doesNotMatch(defendNightSrc, /defend-raider-call/, '1.4.326 SVG kind chip is gone')
  assert.match(defendNightSrc, /width=\{PATH_WALKER_FACE_U\}/, '1.4.326 face uses path viewBox units')
  assert.match(defendNightSrc, /height=\{PATH_WALKER_FACE_U\}/, '1.4.326 face uses path viewBox units')
  assert.equal(EASY_WALKER_FACE_PX, 44, '1.4.330 juice face stays small; path face stays separate')
  assert.doesNotMatch(defendNightSrc, /easy-walker-arrow is-path-cue/, '1.4.346 no TAP chevron on the cue face')
  assert.match(defendNightSrc, /easy-walker-cue-label is-path-cue/, '1.4.326 tap teach stays on the cue face')
  assert.match(defendSrc, /phase === 'wave' && !won/, '1.4.326 roster is mid-wave for Easy and Hard')
  assert.doesNotMatch(
    defendSrc,
    /walkerCalls: EasyWalkerCall\[\] = easyTap/,
    '1.4.326 Hard shares the off-path roster',
  )
  assert.match(defendCss326, /\.nw-walker-slide\.easy-walker-roster \{[\s\S]*?left:\s*0/, '1.4.326 roster hugs the left edge')
  assert.match(defendCss326, /\.easy-walker-roster/)
  assert.doesNotMatch(defendCss326, /\.easy-walker-call\.is-on-map/, '1.4.326 on-map call CSS is gone')
  assert.doesNotMatch(defendCss326, /font-size:\s*32px/, '1.4.326 giant on-path kind size is gone')
  assert.match(latestChange('1.4.326').title, /Night Watch/)
  assert.match(latestChange('1.4.326').items.join('\n'), /Fixes #460/)
  assert.match(latestChange('1.4.326').items.join('\n'), /left/)
  assert.doesNotMatch(
    latestChange('1.4.326').items.join('\n'),
    /#461|#462|#463|#464|Dig deeper|Hard trail|Town|bezel|tower upgrade/i,
    '1.4.326 stays the side roster',
  )
}

// Night Watch 1.4.327: run sparks boost Love / Logic / Reason / Science (Fixes #461).
{
  const types327 = readFileSync(new URL('../src/nightWatch/types.ts', import.meta.url), 'utf8')
  const watch327 = readFileSync(new URL('../src/lib/watchTools.ts', import.meta.url), 'utf8')
  const hp327 = readFileSync(new URL('../src/nightWatch/enemies/hp.ts', import.meta.url), 'utf8')
  assert.match(types327, /'plant' \| 'wave' \| 'boost' \| 'lost'/, '1.4.327 boost phase')
  assert.match(watch327, /export function combatTier/)
  assert.match(watch327, /export function applyBoost/)
  assert.match(defendScreenOnlySrc, /runTier/)
  assert.match(defendScreenOnlySrc, /runSparks/)
  assert.match(defendScreenOnlySrc, /setRunSparks\(\(count\) => count \+ 1\)/, '1.4.327 a down earns a spark')
  assert.match(defendScreenOnlySrc, /setPhase\('boost'\)/, '1.4.327 wave clear opens boost')
  assert.match(defendScreenOnlySrc, /continueFromBoost/, '1.4.327 boost can continue')
  assert.match(defendScreenOnlySrc, /nightEnemies\.hit\(best, tier\)/, '1.4.327 hit damage is the tier')
  assert.match(defendScreenOnlySrc, /combatTier\(/)
  assert.match(defendScreenOnlySrc, /label="Sparks"/)
  assert.doesNotMatch(defendScreenOnlySrc, /progress\.stars/, '1.4.327 does not drain journal stars')
  assert.doesNotMatch(defendScreenOnlySrc, /name: 'shop'/, '1.4.327 no store')
  assert.match(defendAbilitySrc, /defend-ability-tier/)
  assert.match(defendAbilitySrc, /TIER_MARK\[tier\]/)
  assert.match(
    readFileSync(new URL('../src/styles/defend.css', import.meta.url), 'utf8'),
    /\.defend-ability-tier \{[\s\S]*?background: rgba\(18, 6, 46/,
    '1.4.327 tier mark is a readable pill on the Easy rail',
  )
  assert.match(defendAbilitySrc, /if \(boosting\)/)
  assert.match(defendAbilitySrc, /onBoost\(tool\.id\)/)
  assert.match(defendAbilitySrc, /setAbility\(tool\.id\)/)
  assert.doesNotMatch(defendAbilitySrc, /easyTap \? null/, '1.4.327 Easy rail shows the tier mark')
  assert.equal(easyTapMode(true, 'boost', false), false, '1.4.327 boost is not mid-wave TAP')
  assert.equal(boostCost(1), 1)
  assert.equal(boostCost(2), 1)
  assert.equal(boostCost(3), 0)
  assert.deepEqual(freshRunTier(), { love: 1, logic: 1, reason: 1, science: 1 })
  assert.equal(combatTier('love', {}), 1)
  assert.equal(combatTier('love', { love: 2 }), 2)
  assert.equal(combatTier('love', { love: 9 }), 3)
  assert.equal(abilityRange('love', 'built', empty, { love: 1 }), 118)
  assert.equal(abilityRange('love', 'built', empty, { love: 2 }), 136)
  assert.equal(abilityRange('love', 'built', empty, { love: 3 }), 154)
  assert.equal(
    abilityRange('logic', 'built', { ...empty, held: ['wb-creed', 'wb-early'] }, { logic: 1 }),
    118,
    '1.4.327 run tier ignores trail mastery',
  )
  const spent = applyBoost('love', { love: 1, logic: 1, reason: 1, science: 1 }, 1)
  assert.equal(spent.ok, true)
  assert.equal(spent.sparks, 0)
  assert.equal(spent.runTier.love, 2)
  assert.equal(spent.note, 'Love II')
  const broke = applyBoost('love', { love: 1 }, 0)
  assert.equal(broke.ok, false)
  assert.equal(broke.note, 'Need a spark')
  assert.equal(broke.runTier.love, 1)
  const maxed = applyBoost('love', { love: 3 }, 4)
  assert.equal(maxed.ok, false)
  assert.equal(maxed.note, 'Love is III')
  assert.equal(maxed.sparks, 4)
  const tank = { id: 0, t: 0, text: '', kind: 'physical', hp: 3, maxHp: 3 }
  assert.equal(nightEnemiesMod.hit(tank, 1).raider.hp, 2)
  assert.equal(nightEnemiesMod.hit(tank, 1).down, false)
  assert.equal(nightEnemiesMod.hit(tank, 2).raider.hp, 1)
  assert.equal(nightEnemiesMod.hit(tank, 3).down, true, '1.4.327 III one-shots an Easy tank')
  assert.match(hp327, /damage = 1/)
  assert.match(latestChange('1.4.327').title, /Night Watch/)
  assert.match(latestChange('1.4.327').items.join('\n'), /Fixes #461/)
  assert.match(latestChange('1.4.327').items.join('\n'), /spark/)
  assert.doesNotMatch(
    latestChange('1.4.327').items.join('\n'),
    /#460|#462|#463|#464|Dig deeper|Hard trail|Town|bezel/i,
    '1.4.327 stays the tower upgrade path',
  )
}

// Night Watch 1.4.328: five-wave night + climb cast and first-meet lore (Fixes #462, #464).
{
  assert.equal(DEFEND_NIGHT_WAVES, 5)
  assert.equal(NIGHT_CAST.length, 13)
  assert.deepEqual(
    [...DEFEND_WAVE_PACK_CHECK()],
    [4, 4, 5, 5, 8],
  )
  assert.ok(wavePackSize(0) < 6 && wavePackSize(1) < 6 && wavePackSize(2) < 6 && wavePackSize(3) < 6)
  assert.ok(wavePackSize(4) > DEFEND_WAVE_SIZE, '1.4.328 wave 5 is denser than the old six')
  assert.equal(waveCombat(0, true).hpBonus, 0)
  assert.equal(waveCombat(0, true).speedScale, 1, '1.4.328 round 1 keeps the soft pace')
  assert.ok(waveCombat(4, true).speedScale > waveCombat(0, true).speedScale, '1.4.328 the late round is faster')
  assert.ok(waveCombat(4, true).spawnScale < 1, '1.4.328 the late round spawns sooner')
  assert.equal(waveCombat(4, false).hpBonus, 0, '1.4.328 Hard keeps its own HP; Easy is the gate')

  for (let index = 0; index < 8; index += 1) {
    const guy = raidForWave(0, index, index === 7 ? 4 : 0)
    assert.equal(guy.id, NIGHT_CAST[0].id, '1.4.328 night 0 only spawns guy 1')
    assert.equal(guy.kind, 'skeptic')
  }
  const level2 = new Set(Array.from({ length: 6 }, (_, index) => raidForWave(1, index).id))
  assert.deepEqual([...level2].sort(), ['accuser', 'cold-heart'])
  const reached = new Set(Array.from({ length: 13 }, (_, index) => raidForWave(12, index).id))
  assert.equal(reached.size, 13, '1.4.328 a cleared-12 night can reach all 13 guys')
  assert.equal(raidForWave(12, 12).id, 'doubt')
  assert.equal(raidForWave(12, 0, 4).kind, 'physical', '1.4.328 wave 5 biases tanks inside the unlocked pool')
  assert.equal(raidForWave(0, 0, 4).id, 'accuser', '1.4.328 wave 5 does not invent a locked tank')

  assert.deepEqual(normalizeMet(['nope', 'accuser', 'accuser', 'doubt']), ['accuser', 'doubt'])
  assert.deepEqual(normalizeMet(undefined), [])
  const metSave = normalizeProgress({
    defense: { cleared: 3, nights: ['2026-10-01'], met: ['nope', 'accuser', 'accuser', 'doubt'] },
  })
  assert.deepEqual(metSave.defense.met, ['accuser', 'doubt'])
  assert.equal(metSave.defense.cleared, 3)
  assert.deepEqual(normalizeProgress({ defense: { cleared: 1, nights: [] } }).defense.met, [])

  const boostFn = defendScreenOnlySrc.slice(
    defendScreenOnlySrc.indexOf('function continueFromBoost'),
    defendScreenOnlySrc.indexOf('function continueFromBoost') + 420,
  )
  assert.match(boostFn, /waveIndex \+ 1 < nightLength\(easy\)/)
  assert.match(boostFn, /setWaveIndex\(\(i\) => i \+ 1\)/, '1.4.328 Continue advances the wave')
  assert.match(boostFn, /setPhase\('wave'\)/)
  assert.match(boostFn, /setWon\(true\)/)
  assert.doesNotMatch(boostFn, /freshRunTier|setRunSparks\(0\)|recordNight/, '1.4.328 sparks and tier persist between waves')
  assert.match(defendScreenOnlySrc, /setRunSparks\(\(count\) => count \+ 1\)/)
  assert.match(defendScreenOnlySrc, /applyBoost/)
  assert.match(defendScreenOnlySrc, /setWaveIndex\(0\)/, '1.4.328 a lost night resets the wave')
  assert.match(defendScreenOnlySrc, /setRunTier\(freshRunTier\(\)\)/)
  assert.match(defendScreenOnlySrc, /roundMark\(waveIndex, rounds, easy\)/)
  assert.match(defendScreenOnlySrc, /Wave \$\{waveIndex \+ 1\} clear · spend sparks/)
  assert.match(defendScreenOnlySrc, /Round \$\{waveIndex \+ 1\} clear · spend sparks/)
  assert.match(defendScreenOnlySrc, /markMetRef\.current\(cast\.id\)/)
  assert.match(
    readFileSync(new URL('../src/store/ProgressProvider.tsx', import.meta.url), 'utf8'),
    /\.\.\.current\.defense,\s*cleared: current\.defense\.cleared \+ 1/,
    '1.4.328 a full night keeps met when cleared increments',
  )
  assert.match(defendNightSrc, /easy-walker-lore/)
  assert.match(defendNightSrc, /is-new/)
  assert.match(defendNightSrc, /call\.label \?\? WALKER_LABEL\[call\.kind\]/)
  assert.doesNotMatch(defendNightSrc, /is-on-map/)
  assert.match(
    readFileSync(new URL('../src/styles/defend.css', import.meta.url), 'utf8'),
    /\.easy-walker-lore/,
  )
  assert.doesNotMatch(
    readFileSync(new URL('../src/nightWatch/enemies/cast.ts', import.meta.url), 'utf8'),
    /\.png/,
    '1.4.328 reuses the six portraits',
  )

  assert.equal(easyGateResult(0, 1, 0.7), 'clear', '1.4.328 waves 1–4 hold on Love I')
  assert.equal(easyGateResult(3, 1, 0.7), 'clear', '1.4.328 wave 4 holds on Love I')
  assert.equal(easyGateResult(4, 1, 0.7), 'clear', '1.4.393 gate entry lets Love I hold wave 5 taps')
  assert.equal(easyGateResult(4, 2, 0.7), 'clear', '1.4.328 wave 5 holds after Love II')
  assert.equal(easyGateResult(4, 2, 0.7, 3), 'clear', '1.4.328 a tank wave 5 still holds on Love II')

  assert.match(latestChange('1.4.328').title, /Night Watch/)
  assert.match(latestChange('1.4.328').items.join('\n'), /Fixes #462/)
  assert.match(latestChange('1.4.328').items.join('\n'), /Fixes #464/)
  assert.match(latestChange('1.4.328').items.join('\n'), /five waves|5/)
  assert.doesNotMatch(
    latestChange('1.4.328').items.join('\n'),
    /#463|bezel|Dig deeper|Hard trail|Town|consumable|new portrait/i,
    '1.4.328 stays multi-wave and the climb cast',
  )
}

// Night Watch 1.4.329: Still + Mend session kits (Fixes #463). Wave-5 gate stays on tier.
{
  assert.deepEqual([...KIT_IDS], ['still', 'mend'])
  assert.equal(kitSparkCost, 1)
  assert.ok(STILL_MS >= 1600 && STILL_MS <= 2000, '1.4.329 Still is a short freeze')
  assert.equal(useStill(1_000), 1_000 + STILL_MS)
  assert.deepEqual(freshRunKits(), { still: 0, mend: 0 })
  const broke = applyKitBuy('still', freshRunKits(), 0)
  assert.equal(broke.ok, false)
  assert.equal(broke.note, 'Need a spark')
  assert.equal(broke.sparks, 0)
  assert.equal(broke.kits.still, 0)
  const bought = applyKitBuy('mend', freshRunKits(), 2)
  assert.equal(bought.ok, true)
  assert.equal(bought.sparks, 1)
  assert.equal(bought.kits.mend, 1)
  assert.equal(bought.kits.still, 0)
  assert.equal(bought.note, 'Mend ready')
  const again = applyKitBuy('still', bought.kits, bought.sparks)
  assert.equal(again.ok, true)
  assert.equal(again.sparks, 0)
  assert.equal(again.kits.still, 1)
  assert.equal(again.kits.mend, 1)
  const mend = useMend(2)
  assert.equal(mend.healed, true)
  assert.equal(mend.hearts, 3)
  assert.equal(mend.note, 'Mend')
  const full = useMend(DEFEND_HEARTS)
  assert.equal(full.healed, false)
  assert.equal(full.hearts, DEFEND_HEARTS)
  assert.equal(full.note, 'Hearts full')
  assert.equal(unturnedStep(0.42, 0.08, true), 0.42, '1.4.329 freeze holds an unturned walker')
  assert.equal(unturnedStep(0.42, 0.08, false), 0.5)
  assert.equal(WATCH_TOOLS.length, 4, '1.4.329 does not add a fifth rail tool')
  assert.match(defendScreenOnlySrc, /useStill\(performance\.now\(\)\)/)
  assert.match(defendScreenOnlySrc, /mendPower\(live\.current\.hearts\)/)
  assert.match(defendScreenOnlySrc, /unturnedStep\(/)
  assert.match(defendScreenOnlySrc, /freezeUntil/)
  assert.match(defendScreenOnlySrc, /nightWatchDebugFrozen\(/)
  assert.match(defendScreenOnlySrc, /if \(!frozen\) spawnAt \+= dt/)
  assert.match(defendScreenOnlySrc, /if \(item\.turned\)/, '1.4.329 heaven flyaway still advances')
  assert.match(defendScreenOnlySrc, /className="defend-kits/)
  assert.match(
    readFileSync(new URL('../src/components/NightSkillTray.tsx', import.meta.url), 'utf8'),
    /className="defend-kit-buys"/,
    '1.4.380 skill manager keeps the kit row',
  )
  assert.doesNotMatch(defendAbilitySrc, /applyKitBuy|defend-kit|useMend|useStill/, '1.4.329 kits stay off the rail')
  assert.match(
    readFileSync(new URL('../src/styles/defend.css', import.meta.url), 'utf8'),
    /\.defend-kits/,
  )
  assert.equal(easyGateResult(4, 1, 0.7), 'clear', '1.4.393 gate entry lets Love I hold wave 5 taps')
  assert.equal(easyGateResult(4, 2, 0.7), 'clear', '1.4.329 Love II still holds wave 5')
  assert.match(latestChange('1.4.329').title, /Still/)
  assert.match(latestChange('1.4.329').items.join('\n'), /Fixes #463/)
  assert.match(latestChange('1.4.329').items.join('\n'), /Still/)
  assert.match(latestChange('1.4.329').items.join('\n'), /Mend/)
  assert.doesNotMatch(
    latestChange('1.4.329').items.join('\n'),
    /Burst|bezel|Dig deeper|Hard trail|Town|fifth/i,
    '1.4.329 stays Still and Mend',
  )
}

// Night Watch 1.4.330: Easy tap juice stays near the path face (Fixes #469).
{
  const defendCss330 = readFileSync(new URL('../src/styles/defend.css', import.meta.url), 'utf8')
  const juiceFaceRule = defendCss330.match(
    /img\.walker-face\.easy-walker-face,[\s\S]*?\.easy-walker-face \{[\s\S]*?\n\}/,
  )
  const juiceWrapRule = defendCss330.match(/\.easy-walker \{[\s\S]*?\n\}/)
  assert.ok(juiceFaceRule, '1.4.330 juice face rule')
  assert.ok(juiceWrapRule, '1.4.330 juice wrapper rule')
  assert.equal(EASY_WALKER_FACE_PX, 44)
  assert.ok(EASY_WALKER_FACE_PX <= 48, '1.4.330 juice face stays near the path face')
  assert.equal(EASY_WALKER_HIT_PX, 72)
  assert.match(juiceFaceRule[0], /width:\s*44px/)
  assert.match(juiceFaceRule[0], /height:\s*44px/)
  assert.doesNotMatch(juiceFaceRule[0], /128px|!important/)
  assert.match(juiceWrapRule[0], /width:\s*72px/)
  assert.match(juiceWrapRule[0], /height:\s*72px/)
  assert.doesNotMatch(juiceWrapRule[0], /160px/)
  assert.match(defendNightSrc, /width=\{PATH_WALKER_FACE_U\}/, '1.4.330 path face stays in viewBox units')
  assert.match(defendNightSrc, /height=\{PATH_WALKER_FACE_U\}/, '1.4.330 path face stays in viewBox units')
  assert.match(defendNightSrc, /is-squash/, '1.4.330 squash juice stays')
  assert.match(defendNightSrc, /is-heaven/, '1.4.330 heaven juice stays')
  assert.match(defendNightSrc, /easy-tap-plus/, '1.4.330 plus stays')
  assert.match(defendNightSrc, /easy-walkers-path-cue/, '1.4.330 TAP cue stays')
  assert.match(defendCss330, /easy-tap-squash/)
  assert.match(defendCss330, /easy-tap-heaven/)
  assert.match(latestChange('1.4.330').title, /Night Watch/)
  assert.match(latestChange('1.4.330').items.join('\n'), /Fixes #469/)
  assert.match(latestChange('1.4.330').items.join('\n'), /small/)
  assert.doesNotMatch(
    latestChange('1.4.330').items.join('\n'),
    /#472|#470|#471|Dig deeper|Hard trail|Town|bezel|portrait/i,
    '1.4.330 stays the tap-juice face',
  )
}

// Night Watch 1.4.331: thin HP bar so it does not ride the walker (Fixes #472).
{
  const defendCss331 = readFileSync(new URL('../src/styles/defend.css', import.meta.url), 'utf8')
  const enemies331 = readFileSync(new URL('../src/nightWatch/enemies/index.ts', import.meta.url), 'utf8')
  const gradle331 = readFileSync(new URL('../android/app/build.gradle', import.meta.url), 'utf8')
  assert.match(defendNightSrc, /const HP_TRACK = \{[\s\S]*?w: PATH_WALKER_FACE_U/, '1.4.331 thin track')
  assert.match(defendNightSrc, /const HP_FILL = \{ inset: 2, h: 6, rx: 3 \}/, '1.4.331 thin fill')
  assert.ok((10 * 390) / 798 <= 10, '1.4.331 track ≤ ~10px tall on a 390px phone')
  assert.ok(PATH_WALKER_FACE_U >= 36, '1.4.345 path face is at least the old 36-wide chip')
  assert.match(
    defendNightSrc,
    /\(\(HP_TRACK\.w - HP_FILL\.inset \* 2\) \* raider\.hp\) \/ \(raider\.maxHp \?\? 1\)/,
    '1.4.331 fill width stays proportional to hp/maxHp',
  )
  assert.match(defendCss331, /\.defend-hp-track \{[\s\S]*?stroke-width:\s*0\.75/, '1.4.331 stroke is a hairline')
  assert.doesNotMatch(
    defendCss331,
    /\.defend-hp-track \{[^}]*stroke-width:\s*2\b/,
    '1.4.331 track stroke is not the old halo',
  )
  assert.match(
    enemies331,
    /faceSrc: \(kind, easy\) =>\s*nightParts\.src\('face', kind\)/,
    '1.4.331 keeps kind portraits on the road',
  )
  assert.match(gradle331, /versionName "1\.4\.113"/, '1.4.331 Android versionName stays 1.4.113')
  assert.match(latestChange('1.4.331').title, /Night Watch/)
  assert.match(latestChange('1.4.331').items.join('\n'), /Fixes #472/)
  assert.match(latestChange('1.4.331').items.join('\n'), /thin/)
  assert.doesNotMatch(
    latestChange('1.4.331').items.join('\n'),
    /#470|#471|Dig deeper|Hard trail|Town|bezel|dark face|portrait/i,
    '1.4.331 stays the thin HP bar',
  )
}

// Easy Trail 1.4.332: FRAME — empty shelves (src/easyTrail). Fixes #476. (Match shelf + PuzzlePlay import superseded by 1.4.333 A1 registry; Father shelf paths superseded by 1.4.334 A2 home; Lock In shelf + Journal import superseded by 1.4.335 A3 peel; trail shelf + Lock In hold-helper source superseded by 1.4.336 A4 trail peel)
{
  const et = (file) => readFileSync(new URL(`../src/easyTrail/${file}`, import.meta.url), 'utf8')
  const barrel332 = et('index.ts')
  const types332 = et('types.ts')
  const trail332 = et('trail/index.ts')
  const match332 = et('match/index.ts')
  const father332 = et('father/index.ts')
  const lockIn332 = et('lockIn/index.ts')
  const gradle332 = readFileSync(new URL('../android/app/build.gradle', import.meta.url), 'utf8')
  for (const file of [
    'index.ts',
    'types.ts',
    'trail/index.ts',
    'match/index.ts',
    'father/index.ts',
    'lockIn/index.ts',
  ]) {
    assert.ok(existsSync(new URL(`../src/easyTrail/${file}`, import.meta.url)), `1.4.332 shelf ${file}`)
  }
  assert.match(barrel332, /do not fork/, '1.4.332 barrel wraps and does not fork')
  assert.match(barrel332, /from '\.\/trail\/index\.ts'/)
  assert.match(barrel332, /from '\.\/match\/index\.ts'/)
  assert.match(barrel332, /from '\.\/father\/index\.ts'/)
  assert.match(barrel332, /from '\.\/lockIn\/index\.ts'/)
  assert.match(barrel332, /A1 Match registry/)
  assert.match(barrel332, /A2 Father home/)
  assert.match(barrel332, /A3 Lock In peel: hold practice lives in lockIn\/HoldPractice\.tsx/, '1.4.335 barrel names the A3 Lock In home')
  assert.match(barrel332, /A4 trail peel/)
  assert.match(types332, /EasyHomeFocus as EasyTrailFocus/)
  assert.match(trail332, /from '\.\/loop\.ts'/, '1.4.336 trail shelf exports its own home')
  assert.doesNotMatch(trail332, /A4 trail peel is later/, '1.4.336 supersedes the 1.4.332 "A4 later" pin')
  assert.match(trail332, /easyLoopLine/)
  assert.match(trail332, /easyTrailView/)
  assert.doesNotMatch(trail332, /PuzzlePlay|FatherRunPlay|RecallGate/)
  assert.match(match332, /export \{ PuzzlePlay \} from '\.\.\/\.\.\/components\/PuzzlePlay'/)
  assert.match(match332, /from '\.\.\/\.\.\/lib\/storyPlay\.ts'/)
  assert.match(match332, /storyPlayFor/)
  assert.match(match332, /A1 Match registry \(registry\.tsx\)/, '1.4.333 Match shelf names the A1 registry')
  assert.doesNotMatch(match332, /MATCH_CHIPS|gemSearchGrid/, '1.4.333 Match shelf does not reach into the gem grid')
  assert.match(father332, /export \{ FatherRunPlay \} from '\.\/FatherRunPlay'/, '1.4.334 Father shelf exports its own play')
  assert.match(father332, /from '\.\/fatherRun\.ts'/, '1.4.334 Father shelf exports its own timing')
  assert.match(father332, /FATHER_RUN_LINE/)
  assert.match(father332, /Father home \(A2\)/, '1.4.334 Father shelf is the A2 home')
  assert.match(lockIn332, /export \{ RecallGate \} from '\.\.\/\.\.\/components\/RecallGate'/)
  assert.match(lockIn332, /easyHoldPractice/)
  assert.match(lockIn332, /from '\.\.\/trail\/loop\.ts'/, '1.4.336 Lock In shelf exports the hold helpers from the trail home')
  assert.match(lockIn332, /Lock In home \(A3\)/, '1.4.335 Lock In shelf is the A3 home')
  assert.match(lockIn332, /^export \{ HoldPractice \} from '\.\/HoldPractice'$/m, '1.4.335 Lock In shelf exports its own hold practice')
  assert.doesNotMatch(lockIn332, /A3 Lock In peel is later/, '1.4.335 supersedes the 1.4.332 "A3 later" pin')
  assert.doesNotMatch(lockIn332, /from ['"][^'"]*Journal/, '1.4.332 Lock In shelf does not import Journal')
  assert.equal(easyLoopFromShelf, easyLoopFromLib, '1.4.336 trail shelf and lib/easy share one easyLoopLine (the trail home)')
  assert.equal(easyTrailViewFromShelf, easyTrailViewFromLib, '1.4.336 trail shelf and lib/easy share one easyTrailView (the trail home)')
  for (const rel of [
    '../src/App.tsx',
    '../src/components/ChallengeScreen.tsx',
    '../src/components/LinkScreen.tsx',
    '../src/components/DailyTrail.tsx',
    '../src/components/PackStreet.tsx',
    '../src/components/RecallGate.tsx',
  ]) {
    const src = readFileSync(new URL(rel, import.meta.url), 'utf8')
    assert.doesNotMatch(src, /easyTrail/, `${rel} keeps its current imports`)
  }
  assert.match(
    et('match/registry.tsx'),
    /from '\.\.\/father\/FatherRunPlay'/,
    '1.4.334 Match registry mounts FatherRunPlay from the Father home',
  )
  assert.match(
    readFileSync(new URL('../src/components/Journal.tsx', import.meta.url), 'utf8'),
    /from '\.\/RecallGate'/,
  )
  assert.match(gradle332, /versionName "1\.4\.113"/, '1.4.332 Android versionName stays 1.4.113')
  assert.match(latestChange('1.4.332').title, /Easy Trail|frame/i)
  assert.match(latestChange('1.4.332').items.join('\n'), /Fixes #476/)
  assert.match(latestChange('1.4.332').items.join('\n'), /shelves/)
  assert.match(latestChange('1.4.332').items.join('\n'), /later/)
  assert.doesNotMatch(
    latestChange('1.4.332').items.join('\n'),
    /registry|peel|SceneAd|#475|Pack B|Dig deeper/i,
    '1.4.332 must stay FRAME / shelves only (no Match registry or Lock In peel claims)',
  )
}

// Easy Trail 1.4.333: A1 — Match StoryPlayKind registry (src/easyTrail/match/registry.tsx). Fixes #476.
{
  const src333 = (rel) => readFileSync(new URL(`../src/${rel}`, import.meta.url), 'utf8')
  const registry333 = src333('easyTrail/match/registry.tsx')
  const match333 = src333('easyTrail/match/index.ts')
  const puzzle333 = src333('components/PuzzlePlay.tsx')
  const kinds333 = [
    ...(src333('lib/storyPlay.ts').match(/export type StoryPlayKind = ([^\n]+)/)?.[1] ?? '').matchAll(/'([a-z-]+)'/g),
  ].map((m) => m[1])
  const mounts333 = {
    'panel-blast': 'GemSearchPlay',
    'father-run': 'FatherRunPlay',
    'road-maze': 'RoadMazePlay',
    'claim-merge': 'ClaimMergePlay',
    'source-dig': 'SourceDigPlay',
    'story-snap': 'StorySnapPlay',
  }
  assert.deepEqual(kinds333, Object.keys(mounts333), '1.4.333 StoryPlayKind is the six Match kinds')

  assert.match(
    registry333,
    /export const STORY_PLAY_REGISTRY: Record<StoryPlayKind, StoryPlayMount> = \{/,
    '1.4.333 Record<StoryPlayKind> — tsc rejects a missing kind',
  )
  const body333 = registry333.match(/export const STORY_PLAY_REGISTRY[^=]*= \{\n([\s\S]*?)\n\}\n/)?.[1] ?? ''
  const entries333 = [
    ...body333.matchAll(/^ {2}'([a-z-]+)': \(story, wire\) => \(\n\s*<(\w+)\n([\s\S]*?)\/>\n {2}\),$/gm),
  ]
  assert.deepEqual(
    entries333.map((m) => m[1]),
    kinds333,
    '1.4.333 registry lists every StoryPlayKind explicitly (panel-blast too)',
  )
  const attr333 = /(\w+)=\{([^}]+)\}/g
  for (const [, kind, mount, propsSrc] of entries333) {
    assert.equal(mount, mounts333[kind], `1.4.333 ${kind} mounts ${mounts333[kind]}`)
    assert.equal(propsSrc.replace(attr333, '').trim(), '', `1.4.333 ${kind} has only braced props`)
    assert.deepEqual(
      Object.fromEntries([...propsSrc.matchAll(attr333)].map((m) => [m[1], m[2]])),
      {
        lineId: 'story.lineId',
        ...(kind === 'source-dig' ? { easy: 'wire.easy' } : { beats: 'story.beats' }),
        onMiss: 'wire.onMiss',
        onClear: 'wire.onClear',
        onEasyStop: 'wire.onEasyStop',
      },
      `1.4.333 ${kind} keeps the pre-registry props`,
    )
  }
  assert.match(
    registry333,
    /STORY_PLAY_REGISTRY\[story\.play\] \?\? STORY_PLAY_REGISTRY\['panel-blast'\]/,
    '1.4.333 panel-blast stays the fallback',
  )
  assert.doesNotMatch(registry333, /\buse[A-Z]\w*\(/, '1.4.333 mounts run inside PuzzlePlay render — no hooks')
  assert.doesNotMatch(
    registry333,
    /from '[^']*PuzzlePlay'|from '\.\/index/,
    '1.4.333 registry does not import PuzzlePlay or the shelf (no cycle)',
  )

  assert.match(puzzle333, /import \{ renderStoryPlay \} from '\.\.\/easyTrail\/match\/registry'/)
  assert.match(
    puzzle333,
    /if \(isEasy\(progress\) \|\| lineId\) \{\s*const story = lessonStory\(lineId \?\? easyMatchLine\(progress\)\)\s*return renderStoryPlay\(story, \{\s*easy: isEasy\(progress\),\s*onMiss,\s*onClear: onSolved,\s*onEasyStop,\s*\}\)/,
    '1.4.333 PuzzlePlay Easy/link branch calls the registry with the same wiring',
  )
  assert.doesNotMatch(puzzle333, /switch \(story\.play\)|case '/, '1.4.333 no kind switch left in PuzzlePlay')
  for (const mount of Object.values(mounts333)) {
    assert.doesNotMatch(puzzle333, new RegExp(`\\b${mount}\\b`), `1.4.333 PuzzlePlay no longer imports ${mount}`)
  }
  for (const kept of ['SortPlay', 'SequencePlay', 'BuildArgumentPlay', 'LinkPlay', 'MatchPlay']) {
    assert.match(puzzle333, new RegExp(`<${kept}\\b`), `1.4.333 PuzzlePlay still owns ${kept}`)
  }
  assert.match(puzzle333, /<LinkPlay[\s\S]*?onPeek=\{onPeek\}[\s\S]*?streetBeat=\{streetBeat\}/, '1.4.333 Hard link unchanged')

  assert.match(match333, /export \{ STORY_PLAY_REGISTRY, renderStoryPlay \} from '\.\/registry'/)
  assert.match(match333, /export type \{ StoryPlayWiring \} from '\.\/registry'/)
  assert.match(match333, /export \{ PuzzlePlay \} from '\.\.\/\.\.\/components\/PuzzlePlay'/)
  assert.match(match333, /export \{ lessonStory, storyPlayFor \} from '\.\.\/\.\.\/lib\/storyPlay\.ts'/)

  for (const kind of kinds333) {
    assert.equal(storyPlayFor(DEBUG_LAYER_LINES[kind]), kind, `1.4.333 ${kind} is reachable from a real line`)
  }
  assert.equal(storyPlayFor(FATHER_RUN_LINE), 'father-run')
  assert.deepEqual(
    debugJumpView({ lineId: FATHER_RUN_LINE, play: 'father-run', name: '' }),
    { name: 'link', debugLine: FATHER_RUN_LINE },
    '1.4.333 Developer Father jump still opens Match (LinkScreen)',
  )
  const viewUnion333 = src333('types.ts').match(/export type View =([\s\S]*?)(?:\n\n|\n?$)/)?.[1] ?? ''
  assert.match(viewUnion333, /name: 'link'; debugLine\?: string/)
  assert.doesNotMatch(viewUnion333, /father|run/i, '1.4.333 no Father-only App view')
  assert.doesNotMatch(src333('App.tsx'), /FatherRunPlay|name === 'father/, '1.4.333 App has no Father route')
  const srcRoot333 = new URL('../src/', import.meta.url)
  const fatherMounts333 = readdirSync(srcRoot333, { recursive: true })
    .map((rel) => String(rel).replaceAll('\\', '/'))
    .filter((rel) => rel.endsWith('.tsx') && /<FatherRunPlay\b/.test(readFileSync(new URL(rel, srcRoot333), 'utf8')))
  assert.deepEqual(fatherMounts333, ['easyTrail/match/registry.tsx'], '1.4.333 FatherRunPlay mounts only from Match')

  assert.match(
    readFileSync(new URL('../android/app/build.gradle', import.meta.url), 'utf8'),
    /versionName "1\.4\.113"/,
    '1.4.333 Android versionName stays 1.4.113',
  )
  assert.ok(CHANGELOG.some((note) => note.version === '1.4.333'), '1.4.333 row stays (no longer CHANGELOG[0] after 1.4.334)')
  const items333 = latestChange('1.4.333').items.join('\n')
  assert.match(latestChange('1.4.333').title, /Match/)
  assert.match(items333, /Fixes #476/)
  assert.match(items333, /plays the same/)
  assert.match(items333, /Father run is still a Match game/)
  assert.doesNotMatch(
    items333,
    /registry|StoryPlayKind|PuzzlePlay|Lock In|#475|Pack B|Dig deeper|new screen/i,
    '1.4.333 stays kid-plain and A1 only',
  )
}

// Easy Trail 1.4.334: A2 — Father home (src/easyTrail/father). Old paths are re-export shims. Fixes #476.
{
  const src334 = (rel) => readFileSync(new URL(`../src/${rel}`, import.meta.url), 'utf8')
  const srcRoot334 = new URL('../src/', import.meta.url)
  const home334 = src334('easyTrail/father/FatherRunPlay.tsx')
  const timing334 = src334('easyTrail/father/fatherRun.ts')
  const shelf334 = src334('easyTrail/father/index.ts')
  const registry334 = src334('easyTrail/match/registry.tsx')

  for (const rel of ['easyTrail/father/index.ts', 'easyTrail/father/FatherRunPlay.tsx', 'easyTrail/father/fatherRun.ts']) {
    assert.ok(existsSync(new URL(rel, srcRoot334)), `1.4.334 Father home has ${rel}`)
  }
  assert.match(home334, /^export function FatherRunPlay\(\{$/m, '1.4.334 FatherRunPlay is defined in the home')
  assert.match(timing334, /^export function runOutcome\($/m, '1.4.334 Father timing is defined in the home')
  assert.doesNotMatch(timing334, /^import /m, '1.4.334 Father timing stays a leaf module')
  assert.deepEqual(
    Object.fromEntries(Object.entries(fatherRunHome).filter(([, value]) => typeof value === 'number' || Array.isArray(value))),
    {
      DASH_BOOST: 0.22,
      DASH_PERIOD_MS: 2100,
      DASH_WINDOW_MS: 500,
      FATHER_RUN_DASH_SCORE: 25,
      FATHER_RUN_HUG_SCORE: 100,
      HIRED_HAND_SPEECH: [
        'Father, I have sinned against heaven',
        'and before you.',
        'I am no longer worthy to be called your son.',
        'Make me like one of your hired servants.',
      ],
      HOLD_CAP: 0.58,
      HOLD_SPEED: 0.05,
      HOLD_SPEED_REDUCED: 0.062,
      MIN_DASHES_TO_HUG: 2,
      MIN_START_GAP: 0.5,
      RETRY_CLOSER: 0.1,
      SPEECH_PHRASE_MS: 2600,
      STALL_AFTER_MS: 900,
      STALL_FACTOR: 0.38,
      STUMBLE: 0.05,
    },
    '1.4.334 hold / dash / speech clock tuning is unchanged by the move',
  )
  const fatherDir334 = new URL('easyTrail/father/', srcRoot334)
  const homeDeps334 = [...home334.matchAll(/ from '([^']+)'/g)].map(([, spec]) =>
    spec.startsWith('.') ? new URL(spec, fatherDir334).href.slice(srcRoot334.href.length) : spec,
  )
  assert.deepEqual(
    homeDeps334,
    [
      'react',
      'lib/easy',
      'lib/successBeat',
      'components/HeldTriad',
      'easyTrail/father/fatherRun',
      'lib/juice',
      'lib/storyPanels',
      'components/StoryPanelArt',
      'content/panelBlast',
      'components/challenges/WinBurst',
    ],
    '1.4.334 moved play reads the same modules (timing from its home, not the shim)',
  )

  const code334 = (src) =>
    src
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line && !/^(\/\*\*|\*|\/\/)/.test(line))
  assert.deepEqual(
    code334(src334('components/challenges/FatherRunPlay.tsx')),
    ["export { FatherRunPlay } from '../../easyTrail/father/FatherRunPlay'"],
    '1.4.334 components/challenges/FatherRunPlay.tsx is a re-export shim',
  )
  assert.deepEqual(
    code334(src334('lib/fatherRun.ts')),
    ["export * from '../easyTrail/father/fatherRun.ts'"],
    '1.4.334 lib/fatherRun.ts is a re-export shim',
  )
  assert.deepEqual(Object.keys(fatherRunShim).sort(), Object.keys(fatherRunHome).sort(), '1.4.334 shim keeps every timing export')
  for (const [name, value] of Object.entries(fatherRunHome)) {
    assert.equal(fatherRunShim[name], value, `1.4.334 lib/fatherRun ${name} is the home binding`)
  }

  assert.match(shelf334, /^export \{ FatherRunPlay \} from '\.\/FatherRunPlay'$/m)
  const shelfTiming334 = (shelf334.match(/^export \{\n([\s\S]*?)\n\} from '\.\/fatherRun\.ts'$/m)?.[1] ?? '')
    .split(',')
    .map((name) => name.trim())
    .filter(Boolean)
  assert.deepEqual(
    shelfTiming334,
    ['FATHER_RUN_AGAIN', 'FATHER_RUN_CLAIM', 'FATHER_RUN_HINT', 'FATHER_RUN_LINE', 'FATHER_RUN_WIN', 'fatherReached', 'hugBeforeSpeech', 'runOutcome'],
    '1.4.334 Father shelf exports the same timing symbols as 1.4.332',
  )
  for (const name of shelfTiming334) assert.ok(name in fatherRunHome, `1.4.334 shelf ${name} comes from the home`)
  assert.match(shelf334, /^export type \{ FatherRunPhase \} from '\.\/fatherRun\.ts'$/m)
  assert.doesNotMatch(code334(shelf334).join('\n'), /components\/challenges|lib\/fatherRun/, '1.4.334 shelf exports the home, not the shims')

  assert.match(registry334, /^import \{ FatherRunPlay \} from '\.\.\/father\/FatherRunPlay'$/m, '1.4.334 Match registry imports Father from the home')
  assert.doesNotMatch(registry334, /from '[^']*components\/challenges\/FatherRunPlay'/, '1.4.334 registry skips the shim')
  assert.match(
    registry334,
    /'father-run': \(story, wire\) => \(\n {4}<FatherRunPlay\n {6}lineId=\{story\.lineId\}\n {6}beats=\{story\.beats\}\n {6}onMiss=\{wire\.onMiss\}\n {6}onClear=\{wire\.onClear\}\n {6}onEasyStop=\{wire\.onEasyStop\}\n {4}\/>\n {2}\),/,
    '1.4.334 father-run keeps the same props',
  )

  const srcFiles334 = readdirSync(srcRoot334, { recursive: true })
    .map((rel) => String(rel).replaceAll('\\', '/'))
    .filter((rel) => /\.tsx?$/.test(rel))
  const filesWith334 = (pattern) =>
    srcFiles334.filter((rel) => pattern.test(readFileSync(new URL(rel, srcRoot334), 'utf8'))).sort()
  assert.deepEqual(filesWith334(/export function FatherRunPlay\b/), ['easyTrail/father/FatherRunPlay.tsx'], '1.4.334 one FatherRunPlay')
  assert.deepEqual(filesWith334(/export function runOutcome\b/), ['easyTrail/father/fatherRun.ts'], '1.4.334 one Father timing')
  assert.deepEqual(filesWith334(/<FatherRunPlay\b/), ['easyTrail/match/registry.tsx'], '1.4.334 FatherRunPlay mounts only from Match')
  assert.deepEqual(
    filesWith334(/(?:import|export) \{[^}]*\bFatherRunPlay\b[^}]*\} from/),
    ['components/challenges/FatherRunPlay.tsx', 'easyTrail/father/index.ts', 'easyTrail/match/registry.tsx'],
    '1.4.334 FatherRunPlay is wired only by the shim, the Father shelf, and the Match registry',
  )

  assert.doesNotMatch(src334('App.tsx'), /FatherRunPlay|easyTrail\/father|name === 'father/, '1.4.334 App has no Father route')
  const viewUnion334 = src334('types.ts').match(/export type View =([\s\S]*?)(?:\n\n|\n?$)/)?.[1] ?? ''
  assert.match(viewUnion334, /name: 'link'; debugLine\?: string/)
  assert.doesNotMatch(viewUnion334, /father|run/i, '1.4.334 no Father-only App view')
  assert.equal(storyPlayFor(FATHER_RUN_LINE), 'father-run', '1.4.334 Father line is still the father-run Match kind')
  assert.deepEqual(
    debugJumpView({ lineId: FATHER_RUN_LINE, play: 'father-run', name: '' }),
    { name: 'link', debugLine: FATHER_RUN_LINE },
    '1.4.334 Developer Father jump still opens Match (LinkScreen)',
  )

  assert.match(
    readFileSync(new URL('../android/app/build.gradle', import.meta.url), 'utf8'),
    /versionName "1\.4\.113"/,
    '1.4.334 Android versionName stays 1.4.113',
  )
  assert.ok(CHANGELOG.some((note) => note.version === '1.4.334'), '1.4.334 changelog row')
  const items334 = latestChange('1.4.334').items.join('\n')
  assert.match(latestChange('1.4.334').title, /Father/)
  assert.match(items334, /Fixes #476/)
  assert.match(items334, /plays the same/)
  assert.match(items334, /Father run is still a Match game/)
  assert.doesNotMatch(
    items334,
    /registry|shim|StoryPlayKind|PuzzlePlay|FatherRunPlay|fatherRun|easyTrail|Lock In|#475|Pack B|Dig deeper|new screen/i,
    '1.4.334 stays kid-plain and A2 only',
  )
}

// Easy Trail 1.4.335: A3 — Lock In peel. Journal's hold practice lives in src/easyTrail/lockIn/HoldPractice.tsx. Fixes #476. (lib/easy hold-helper source superseded by 1.4.336 A4 trail peel)
{
  const src335 = (rel) => readFileSync(new URL(`../src/${rel}`, import.meta.url), 'utf8')
  const srcRoot335 = new URL('../src/', import.meta.url)
  const home335 = src335('easyTrail/lockIn/HoldPractice.tsx')
  const shelf335 = src335('easyTrail/lockIn/index.ts')
  const journal335 = src335('components/Journal.tsx')
  const [journalMain335, journalCard335 = ''] = journal335.split('\nfunction JournalCard(')

  assert.deepEqual(
    readdirSync(new URL('easyTrail/lockIn/', srcRoot335)).sort(),
    ['HoldPractice.tsx', 'index.ts'],
    '1.4.335 Lock In home is HoldPractice + shelf only (no new stylesheet)',
  )
  assert.match(
    home335,
    /^export function HoldPractice\(\{ quizBrief, focusedEntry, today, setLater, onNavigate \}: HoldPracticeProps\) \{$/m,
    '1.4.335 HoldPractice is defined in the home with the Journal hand-off props',
  )
  assert.deepEqual(
    [...(home335.match(/interface HoldPracticeProps \{\n([\s\S]*?)\n\}/)?.[1] ?? '').matchAll(/^ {2}(\w+)\??:/gm)].map((m) => m[1]),
    ['quizBrief', 'focusedEntry', 'today', 'setLater', 'onNavigate'],
    '1.4.335 HoldPractice takes only what the Journal branch closed over',
  )
  assert.deepEqual(
    [...home335.matchAll(/\buse[A-Z]\w*\(/g)].map((m) => m[0]),
    ['useProgress('],
    '1.4.335 HoldPractice adds no state or effects',
  )
  const lockInDir335 = new URL('easyTrail/lockIn/', srcRoot335)
  assert.deepEqual(
    [...home335.matchAll(/ from '([^']+)'/g)].map(([, spec]) =>
      spec.startsWith('.') ? new URL(spec, lockInDir335).href.slice(srcRoot335.href.length) : spec,
    ),
    [
      'react',
      'content',
      'content/evidence',
      'content/story',
      'lib/easy',
      'lib/recall',
      'lib/supportToast',
      'lib/tiers',
      'components/EasyBack',
      'components/RecallGate',
      'store/progress',
      'types',
    ],
    '1.4.335 moved hold practice reads the same modules Journal did',
  )

  // #448 teach-gate stays in Journal, unchanged; HoldPractice never re-gates.
  assert.ok(
    journalMain335.includes(
      [
        '  const quizBrief = holdId',
        '    ? evidenceForTier(holdId, currentLessonTier(progress, holdId)) ?? evidenceFor(holdId)',
        '    : undefined',
        '',
        '  const openLine = easyLoopLine(progress)',
        '  const quizReplacesMatch =',
        '    easy &&',
        '    (holdId === openLine || focusId === openLine) &&',
        '    !easyLineTaught(progress, openLine)',
        '  const holdPractice =',
        '    Boolean(autoQuiz && quizBrief && !quizReplacesMatch && (easy || !focusedEntry || focusedOpen))',
        '',
        '  if (holdPractice && quizBrief) {',
        '    return (',
        '      <HoldPractice',
        '        quizBrief={quizBrief}',
        '        focusedEntry={focusedEntry}',
        '        today={today}',
        '        setLater={setLater}',
        '        onNavigate={onNavigate}',
        '      />',
        '    )',
        '  }',
      ].join('\n'),
    ),
    '1.4.335 Journal keeps the same quizBrief / #448 quizReplacesMatch / holdPractice gate, then renders HoldPractice',
  )
  assert.doesNotMatch(home335, /quizReplacesMatch|easyLineTaught|easyLoopLine|autoQuiz/, '1.4.335 HoldPractice does not re-gate')
  {
    const fresh = { ...emptyProgress(), easyMode: true }
    const openLine = easyLoopLine(fresh)
    assert.equal(openLine, 'ph-road')
    assert.equal(easyLineTaught(fresh, openLine), false, '1.4.335 fresh open line is untaught (quizReplacesMatch → Match first)')
    assert.deepEqual(easyTrailView(fresh), { name: 'link' }, '1.4.335 fresh Easy still goes to Match')
    const taught = progressAfterMatchTaught(fresh, openLine)
    assert.equal(easyLineTaught(taught, openLine), true, '1.4.335 taught open line lets Lock In through')
    assert.deepEqual(
      easyTrailView(taught),
      { name: 'journal', focusId: 'ph-road', autoQuiz: true },
      '1.4.335 taught Easy still opens Lock In practice',
    )
  }

  // Easy advancing encode: save in the same order, then Home.
  assert.match(
    home335,
    /const advancing = firstHold \|\| needsTierHold\(progress, quizBrief\.id\)[\s\S]*?mode=\{easy && advancing \? 'encode' : 'review'\}/,
  )
  assert.match(
    home335,
    /if \(easy && advancing\) \{\n\s*recordHeld\(quizBrief\.id\)\n\s*recordReview\(\{\n\s*id: quizBrief\.id,\n\s*pillar,\n\s*kind: 'encode',\n\s*today,\n\s*clean: result\.clean,\n\s*peeked: false,\n\s*elaborated: false,\n\s*\}\)\n\s*recordLessonHold\(quizBrief\.id, result\.clean\)\n\s*offerSupportToast\(\)\n\s*onNavigate\(sameProofRecap\(quizBrief\.id\)\)\n\s*return\n\s*\}/,
    '1.4.362 Easy encode records held / review / lesson hold / support toast, then the same-proof recap',
  )
  assert.deepEqual(EASY_HOME, { name: 'hub' }, '1.4.335 EASY_HOME is still Easy Home')
  assert.match(home335, /onNavigate\(\n\s*easy\n\s*\? \{ name: 'hub' \}/, '1.4.335 Easy review still lands Home')

  // Move-only layout: same main, no wrapper, no new classes or inline styles.
  assert.match(
    home335,
    /\) \{\n(?: {2}const [^\n]+\n)+ {2}return \(\n {4}<main className=\{`journal is-rehearse \$\{easy \? 'is-easy-hold-practice' : ''\}`\}>\n/,
    '1.4.335 HoldPractice returns the rehearse main directly',
  )
  assert.match(home335, /\n {4}<\/main>\n {2}\)\n\}\n$/, '1.4.335 nothing wraps or follows the rehearse main')
  assert.deepEqual(
    [...home335.matchAll(/className=(?:"([^"]+)"|\{`([^`]+)`\})/g)].map((m) => m[1] ?? m[2]),
    ["journal is-rehearse ${easy ? 'is-easy-hold-practice' : ''}", 'text-link', 'rehearse-anchor', 'eyebrow'],
    '1.4.335 HoldPractice keeps the same practice classes',
  )
  assert.doesNotMatch(home335, /style=|\.css'/, '1.4.335 no inline style or stylesheet on the moved practice')
  assert.match(home335, /<section className="rehearse-anchor">\n\s*<p className="eyebrow">\{easy \? EASY\.saved : 'Takeaway'\}<\/p>\n\s*\{easy \? null : <h1>\{focusedEntry\?\.title \?\? STORY\.tapTakeaway\}<\/h1>\}\n\s*<RecallGate\n/)

  // Journal no longer inlines the rehearse / RecallGate encode tree.
  assert.doesNotMatch(
    journalMain335,
    /<RecallGate|is-rehearse|rehearse-anchor|is-easy-hold-practice|EASY_HOME|offerSupportToast|needsTierHold|kind: 'encode'/,
    '1.4.335 Journal thin-gates only',
  )
  assert.equal(journalCard335.match(/<RecallGate\b/g)?.length, 1, '1.4.335 Journal keeps only the page-card recall')
  assert.deepEqual(
    [...journal335.matchAll(/ from '(\.\.\/easyTrail[^']*)'/g)].map((m) => m[1]),
    ['../easyTrail/lockIn/HoldPractice'],
    '1.4.335 Journal imports only HoldPractice from Easy Trail',
  )

  const srcFiles335 = readdirSync(srcRoot335, { recursive: true })
    .map((rel) => String(rel).replaceAll('\\', '/'))
    .filter((rel) => /\.tsx?$/.test(rel))
  const filesWith335 = (pattern) =>
    srcFiles335.filter((rel) => pattern.test(readFileSync(new URL(rel, srcRoot335), 'utf8'))).sort()
  assert.deepEqual(filesWith335(/export function HoldPractice\b/), ['easyTrail/lockIn/HoldPractice.tsx'], '1.4.335 one HoldPractice')
  assert.deepEqual(filesWith335(/<HoldPractice\b/), ['components/Journal.tsx'], '1.4.335 only Journal mounts HoldPractice')
  assert.deepEqual(
    filesWith335(/(?:import|export) \{[^}]*\bHoldPractice\b[^}]*\} from/),
    ['components/Journal.tsx', 'easyTrail/lockIn/index.ts'],
    '1.4.335 HoldPractice is wired only by Journal and the Lock In shelf',
  )
  assert.deepEqual(filesWith335(/export function RecallGate\b/), ['components/RecallGate.tsx'], '1.4.335 one RecallGate')
  assert.match(home335, /^import \{ RecallGate \} from '\.\.\/\.\.\/components\/RecallGate'$/m)
  assert.match(shelf335, /^export \{ RecallGate \} from '\.\.\/\.\.\/components\/RecallGate'$/m)
  assert.match(
    shelf335,
    /^export \{ easyHoldFields, easyHoldPractice, easyHoldView \} from '\.\.\/trail\/loop\.ts'$/m,
    '1.4.336 hold helpers moved from lib/easy to the trail home (A4)',
  )
  assert.doesNotMatch(src335('easyTrail/index.ts'), /Later hops?: A3/, '1.4.335 barrel no longer lists A3 as later')
  assert.doesNotMatch(src335('easyTrail/types.ts'), /later hop/, '1.4.335 types no longer say Lock In is later')

  // No App rewrite: Journal is still the only Lock In route.
  assert.doesNotMatch(src335('App.tsx'), /HoldPractice|easyTrail/, '1.4.335 App has no Lock In route')
  assert.match(
    src335('App.tsx'),
    /\{view\.name === 'journal' \? \(\n\s*<Journal\n\s*focusId=\{view\.focusId\}\n\s*autoQuiz=\{view\.autoQuiz\}\n\s*onNavigate=\{go\}\n\s*\/>\n\s*\) : null\}/,
    '1.4.335 App still mounts Journal the same way',
  )
  assert.match(src335('types.ts'), /\| \{ name: 'journal'; focusId\?: string; autoQuiz\?: boolean \}/)
  const viewUnion335 = src335('types.ts').match(/export type View =([\s\S]*?)(?:\n\n|\n?$)/)?.[1] ?? ''
  assert.doesNotMatch(viewUnion335, /lock|hold|practice/i, '1.4.335 no Lock In-only App view')

  assert.match(
    readFileSync(new URL('../android/app/build.gradle', import.meta.url), 'utf8'),
    /versionName "1\.4\.113"/,
    '1.4.335 Android versionName stays 1.4.113',
  )
  assert.ok(CHANGELOG.some((note) => note.version === '1.4.335'), '1.4.335 changelog row')
  const items335 = latestChange('1.4.335').items.join('\n')
  assert.match(latestChange('1.4.335').title, /Lock In/)
  assert.match(items335, /Fixes #476/)
  assert.match(items335, /works the same/)
  assert.match(items335, /starts with Match/)
  assert.doesNotMatch(
    items335,
    /HoldPractice|RecallGate|Journal|easyTrail|registry|shim|peel|gate|#475|Pack B|Dig deeper|new screen/i,
    '1.4.335 stays kid-plain and A3 only',
  )
}

// Easy Trail 1.4.336: A4 — trail peel. The Easy loop lives in src/easyTrail/trail/loop.ts; lib/easy.ts re-exports the same bindings. Fixes #476.
{
  const src336 = (rel) => readFileSync(new URL(`../src/${rel}`, import.meta.url), 'utf8')
  const srcRoot336 = new URL('../src/', import.meta.url)
  const loop336 = src336('easyTrail/trail/loop.ts')
  const shelf336 = src336('easyTrail/trail/index.ts')
  const easy336 = src336('lib/easy.ts')
  const TRAIL336 = [
    'EASY_LINE_ORDER',
    'EASY_MATCH_LINE',
    'FOUNDATION_ARC',
    'digReady',
    'easyHoldFields',
    'easyHoldLine',
    'easyHoldPractice',
    'easyHoldView',
    'easyHomeFocus',
    'easyLearnLine',
    'easyLineHeld',
    'easyLineLearned',
    'easyLineTaught',
    'easyLoopLine',
    'easyMatchLine',
    'easyMatchReady',
    'easyTeachFields',
    'easyTrailView',
    'foundationPrior',
    'foundationReady',
    'inkReady',
    'markEasyHeld',
    'markEasyTaught',
    'namesReady',
    'progressAfterMatchTaught',
    'stoneReady',
  ]

  // Trail home: loop.ts + shelf, every trail name defined there.
  assert.deepEqual(
    readdirSync(new URL('easyTrail/trail/', srcRoot336)).sort(),
    ['index.ts', 'loop.ts'],
    '1.4.336 trail home is loop + shelf only',
  )
  assert.deepEqual(Object.keys(trailLoopHome).sort(), TRAIL336, '1.4.336 trail home exports exactly the loop API')
  for (const name of TRAIL336) {
    assert.match(loop336, new RegExp(`^export (?:function|const) ${name}\\b`, 'm'), `1.4.336 ${name} is defined in the trail home`)
  }
  assert.match(loop336, /^export type EasyHomeFocus = 'learn' \| 'match' \| 'hold'$/m, '1.4.336 EasyHomeFocus moves with easyHomeFocus')
  assert.match(loop336, /^type EasyLoopProgress = Pick<$/m, '1.4.336 EasyLoopProgress stays private to the loop')
  const trailDir336 = new URL('easyTrail/trail/', srcRoot336)
  assert.deepEqual(
    [...loop336.matchAll(/ from '([^']+)'/g)].map(([, spec]) => new URL(spec, trailDir336).href.slice(srcRoot336.href.length)),
    ['types.ts', 'content/packCatalog.ts', 'lib/tiers.ts', 'lib/sourceDig.ts'],
    '1.4.336 trail home reads only types / pack order / tiers / Source Dig priors — never lib/easy (no cycle)',
  )

  // lib/easy is the compatibility shim: same bindings, no second definition, no loop logic left.
  const shim336 = easy336.match(/^export \{\n([^}]*)\n\} from '\.\.\/easyTrail\/trail\/loop\.ts'$/m)?.[1] ?? ''
  assert.deepEqual(
    shim336.split(',').map((name) => name.trim()).filter(Boolean),
    TRAIL336,
    '1.4.336 lib/easy re-exports every trail name from the home',
  )
  assert.match(easy336, /^export type \{ EasyHomeFocus \} from '\.\.\/easyTrail\/trail\/loop\.ts'$/m)
  for (const name of TRAIL336) {
    assert.equal(easyLib[name], trailLoopHome[name], `1.4.336 lib/easy ${name} is the trail home binding`)
    assert.doesNotMatch(easy336, new RegExp(`^(?:export )?(?:function|const) ${name}\\b`, 'm'), `1.4.336 lib/easy does not redefine ${name}`)
  }
  assert.doesNotMatch(
    easy336,
    /currentLessonTier|needsTierHold|packEasyOrder|EasyLoopProgress|easyTaught|easyHeld/,
    '1.4.336 no loop logic left in lib/easy',
  )
  for (const name of [
    'isEasy',
    'easyLinkStep',
    'easyWrongTap',
    'loveHowTo',
    'easyMainIdea',
    'easyChromeLine',
    'easyWhyLine',
    'easyJournalMeta',
    'easyFacingLine',
    'uniqueHoldChoices',
    'easyTapNext',
    'easyStoryCard',
    'easyWhoWhere',
    'easyWhoWhereLine',
    'scrapbookLabel',
  ]) {
    assert.match(easy336, new RegExp(`^export function ${name}\\(`, 'm'), `1.4.336 ${name} stays defined in lib/easy`)
  }
  assert.match(easy336, /^export \{\n {2}DIG_ARC,[\s\S]*?\n\} from '\.\/sourceDig\.ts'$/m, '1.4.336 Source Dig arcs still re-export from sourceDig')

  const srcFiles336 = readdirSync(srcRoot336, { recursive: true })
    .map((rel) => String(rel).replaceAll('\\', '/'))
    .filter((rel) => /\.tsx?$/.test(rel))
  const filesWith336 = (pattern) =>
    srcFiles336.filter((rel) => pattern.test(readFileSync(new URL(rel, srcRoot336), 'utf8'))).sort()
  for (const name of TRAIL336) {
    assert.deepEqual(filesWith336(new RegExp(`(?:function|const|let|var) ${name}\\b`)), ['easyTrail/trail/loop.ts'], `1.4.336 one ${name}`)
  }

  // Shelves export the home with the same names as before.
  assert.deepEqual(
    Object.keys(trailShelf).sort(),
    [
      'EASY_LINE_ORDER',
      'EASY_MATCH_LINE',
      'easyHoldLine',
      'easyHomeFocus',
      'easyLearnLine',
      'easyLineHeld',
      'easyLineLearned',
      'easyLineTaught',
      'easyLoopLine',
      'easyMatchLine',
      'easyMatchReady',
      'easyTrailView',
    ],
    '1.4.336 trail shelf exports the same names as 1.4.332',
  )
  for (const [name, value] of Object.entries(trailShelf)) {
    assert.equal(value, trailLoopHome[name], `1.4.336 trail shelf ${name} is the home binding`)
  }
  assert.match(shelf336, /Trail home \(A4\)/)
  assert.doesNotMatch(shelf336, /lib\/easy\.ts'/, '1.4.336 trail shelf exports the home, not the shim')
  assert.match(
    src336('easyTrail/lockIn/index.ts'),
    /^export \{ easyHoldFields, easyHoldPractice, easyHoldView \} from '\.\.\/trail\/loop\.ts'$/m,
    '1.4.336 Lock In shelf hold helpers come from the trail home',
  )
  assert.doesNotMatch(src336('easyTrail/lockIn/index.ts'), /lib\/easy/, '1.4.336 Lock In shelf no longer points at lib/easy')
  assert.match(src336('easyTrail/types.ts'), /^export type \{ EasyHomeFocus as EasyTrailFocus \} from '\.\/trail\/loop\.ts'$/m)
  assert.match(
    src336('easyTrail/index.ts'),
    /A4 trail peel: the Easy loop lives in trail\/loop\.ts; lib\/easy\.ts re-exports the same bindings\./,
  )
  for (const rel of ['easyTrail/index.ts', 'easyTrail/types.ts', 'easyTrail/trail/index.ts', 'easyTrail/lockIn/index.ts']) {
    assert.doesNotMatch(src336(rel), /Later hop|later/i, `1.4.336 ${rel} no longer lists a later hop`)
  }

  // No caller fan-out: lib/easy is the only file outside Easy Trail that reaches the home.
  assert.deepEqual(filesWith336(/from '[^']*easyTrail\/trail\b/), ['lib/easy.ts'], '1.4.336 only lib/easy imports the trail home')
  for (const [rel, names] of [
    ['components/Hub.tsx', ['easyHomeFocus', 'easyHoldView', 'easyLoopLine']],
    ['components/CityMap.tsx', ['easyTrailView']],
    ['components/LinkScreen.tsx', ['easyHoldView', 'progressAfterMatchTaught']],
    ['components/Journal.tsx', ['easyLineTaught', 'easyLoopLine']],
    ['store/ProgressProvider.tsx', ['easyHoldFields', 'easyTeachFields']],
  ]) {
    const src = src336(rel)
    const fromEasy = src.match(/^import \{([^}]*)\} from '\.\.\/lib\/easy'$/m)?.[1] ?? ''
    for (const name of names) {
      assert.match(fromEasy, new RegExp(`\\b${name}\\b`), `1.4.336 ${rel} still imports ${name} from lib/easy`)
    }
    assert.doesNotMatch(src, /easyTrail\/trail/, `1.4.336 ${rel} is not rewritten onto the trail home`)
  }

  // Same trail: Match teaches, Lock In holds, Home opens the next line — every line, in teach order (#448).
  {
    const order = trailLoopHome.EASY_LINE_ORDER
    assert.equal(trailLoopHome.EASY_MATCH_LINE, order[0])
    assert.equal(trailLoopHome.EASY_MATCH_LINE, 'ph-road', '1.4.336 the Easy trail still starts at the mercy road')
    assert.deepEqual(EASY_HOME, { name: 'hub' }, '1.4.336 Lock In still lands on Easy Home')
    let walk = { ...emptyProgress(), easyMode: true }
    const walked = []
    for (let step = 0; step < order.length; step += 1) {
      const id = trailLoopHome.easyLoopLine(walk)
      assert.equal(trailLoopHome.easyHomeFocus(walk), 'match', `1.4.336 ${id} Home focus is Match`)
      assert.deepEqual(trailLoopHome.easyTrailView(walk), { name: 'link' }, `1.4.336 ${id} opens Match first`)
      assert.deepEqual(trailLoopHome.easyHoldFields(walk, id), walk.easyHeld ?? [], `1.4.336 ${id} cannot be held before Match`)
      assert.deepEqual(
        trailLoopHome.easyTeachFields(walk, id, false),
        { easyTaught: walk.easyTaught ?? [], tierTaught: walk.tierTaught ?? {} },
        `1.4.336 only Match teaches ${id}`,
      )
      assert.deepEqual(
        trailLoopHome.easyHoldView(trailLoopHome.progressAfterMatchTaught(walk, id)),
        { name: 'journal', focusId: id, autoQuiz: true },
        `1.4.336 ${id} Match clear hands off to Lock In`,
      )
      walk = { ...walk, ...trailLoopHome.easyTeachFields(walk, id, true) }
      assert.deepEqual(
        trailLoopHome.easyTrailView(walk),
        { name: 'journal', focusId: id, autoQuiz: true },
        `1.4.336 ${id} taught → Lock In`,
      )
      walk = { ...walk, easyHeld: trailLoopHome.easyHoldFields(walk, id) }
      walked.push(id)
    }
    assert.deepEqual(walked, [...order], '1.4.336 Match → Lock In → Home walks every line in teach order')
    assert.equal(trailLoopHome.easyLoopLine(walk), order[0], '1.4.336 a finished Easy trail loops back to the first line')
  }

  assert.match(
    readFileSync(new URL('../android/app/build.gradle', import.meta.url), 'utf8'),
    /versionName "1\.4\.113"/,
    '1.4.336 Android versionName stays 1.4.113',
  )
  assert.ok(CHANGELOG.some((note) => note.version === '1.4.336'), '1.4.336 changelog row')
  const items336 = latestChange('1.4.336').items.join('\n')
  assert.match(latestChange('1.4.336').title, /trail/i)
  assert.match(items336, /Fixes #476/)
  assert.match(items336, /works the same/)
  assert.match(items336, /starts with Match/)
  assert.match(items336, /back Home/)
  assert.doesNotMatch(
    items336,
    /loop\.ts|lib\/easy|easyTrail|re-export|binding|shim|peel|registry|gate|#475|#480|#438|Pack B|Dig deeper|new screen/i,
    '1.4.336 stays kid-plain and A4 only',
  )
}

// Easy Build It 1.4.337: Home Build this raises when ready — Fixes #438
{
  const hub337 = readFileSync(new URL('../src/components/Hub.tsx', import.meta.url), 'utf8')
  assert.match(hub337, /function easyBuildThis\(\)/, '1.4.337 Easy dock Build handler (#438)')
  assert.match(hub337, /upgradeBuilding\(readyId\)/, '1.4.337 calls upgradeBuilding when ready (#438)')
  assert.match(hub337, /upgradeReadyId/, '1.4.337 gift tied to ready upgrade (#438)')
  assert.ok(CHANGELOG.some((note) => note.version === '1.4.337'), '1.4.337 changelog row')
  const items337 = latestChange('1.4.337').items.join('\n')
  assert.match(items337, /Fixes #438/)
  assert.match(items337, /Build this/i)
  assert.match(latestChange('1.4.337').title, /build/i)
}

// Easy Build It 1.4.338: honest walk-before-build on Easy Home — Fixes #438
{
  const hub338 = readFileSync(new URL('../src/components/Hub.tsx', import.meta.url), 'utf8')
  assert.match(hub338, /upgradeReadyId \?/, '1.4.338 gates gold Build this on ready (#438)')
  assert.match(hub338, /easy-dock-walk/, '1.4.338 walk CTA when story not done (#438)')
  assert.match(hub338, /name: 'daily'/, '1.4.338 sends to DailyTrail when not ready (#438)')
  {
    const easyBuildFn338 =
      hub338.match(/function easyBuildThis\(\) \{[\s\S]*?\n    \}/)?.[0] ?? ''
    assert.ok(easyBuildFn338.length > 0, '1.4.338 easyBuildThis handler present (#438)')
    assert.doesNotMatch(
      easyBuildFn338,
      /setPlot\(nextId\)/,
      '1.4.338 must not gold-CTA into Walk Manage when not ready (#438)',
    )
  }
  assert.match(hub338, /upgradeBuilding\(readyId\)/, '1.4.338 ready path still raises (#438)')
  assert.ok(CHANGELOG.some((note) => note.version === '1.4.338'), '1.4.338 changelog row')
  const items338 = latestChange('1.4.338').items.join('\n')
  assert.match(items338, /Fixes #438/)
  assert.match(items338, /story|walk/i)
  assert.match(latestChange('1.4.338').title, /walk|build/i)
}

// SceneAd 1.4.339: Remove ads stays on Home — Fixes #475
{
  const app339 = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8')
  assert.doesNotMatch(app339, /supportFromAd[\s\S]*?name: 'settings'/, '1.4.339 supportFromAd must not open Settings (#475)')
  assert.match(
    app339,
    /function supportFromAd\(\) \{[\s\S]*?const dest = pending \?\? \{ name: 'hub' as const \}[\s\S]*?setSceneAd\(false\)[\s\S]*?setPending\(null\)[\s\S]*?setView\(dest\)/,
    '1.4.339 supportFromAd dismisses SceneAd and honors pending like continueFromAd (#475)',
  )
  assert.match(app339, /offerStoresComingNotice\(\)/, '1.4.339 Remove ads offers stores-coming notice (#475)')
  assert.match(
    app339,
    /function continueFromAd\(\) \{[\s\S]*?const dest = pending \?\? \{ name: 'hub' as const \}/,
    '1.4.339 continueFromAd still honors pending (#475)',
  )
  const hub339 = readFileSync(new URL('../src/components/Hub.tsx', import.meta.url), 'utf8')
  assert.match(hub339, /StoresComingNotice/, '1.4.339 hub shows stores-coming notice (#475)')
  assert.match(app339, /scenePauseMountsOn\(view\.name\)/, '1.4.339 SceneAd still mounts only on hub (#475)')
  const notice339 = readFileSync(new URL('../src/components/StoresComingNotice.tsx', import.meta.url), 'utf8')
  assert.match(notice339, /STORES_COMING/, '1.4.339 notice reuses STORES_COMING (#475)')
  assert.ok(CHANGELOG.some((note) => note.version === '1.4.339'), '1.4.339 changelog row')
  const items339 = latestChange('1.4.339').items.join('\n')
  assert.match(items339, /Fixes #475/)
  assert.match(items339, /Settings|Home/i)
  assert.match(latestChange('1.4.339').title, /Remove ads|Home/i)
}

// Easy win verse contrast 1.4.340: Father HUGGED + Road HELPED post-play takeaway (Fixes #480)
{
  const winCss340 = readFileSync(new URL('../src/styles/matchWin.css', import.meta.url), 'utf8')
  assert.match(winCss340, /1\.4\.340: Easy Father HUGGED \+ Road HELPED win verse contrast \(Fixes #480\)/)
  assert.match(
    winCss340,
    /1\.4\.340: Easy Father HUGGED \+ Road HELPED win verse contrast \(Fixes #480\)[\s\S]*?html\[data-easy='on'\] \.play\.is-father-run\.is-win \.match-yes,[\s\S]*?html\[data-easy='on'\] \.play\.is-road-maze\.is-win \.match-yes \{[\s\S]*?color: var\(--ink, #2a2118\)/,
  )
  assert.match(
    winCss340,
    /1\.4\.340: Easy Father HUGGED \+ Road HELPED win verse contrast \(Fixes #480\)[\s\S]*?\.play\.is-father-run\.is-win \.match-yes strong,[\s\S]*?\.play\.is-road-maze\.is-win \.match-yes strong \{[\s\S]*?#2a2118/,
  )
  assert.match(cssSrc, /1\.4\.340: Easy Father HUGGED \+ Road HELPED win verse contrast/)
  assert.ok(CHANGELOG.some((note) => note.version === '1.4.340'), '1.4.340 changelog row')
  const items340 = latestChange('1.4.340').items.join('\n')
  assert.match(items340, /Fixes #480/)
  assert.match(items340, /Father|HUGGED|HELPED|read/i)
  assert.match(latestChange('1.4.340').title, /read|verse|win/i)
}

// Night Watch 1.4.342: Easy plant step before wave (Fixes #492).
{
  const easyUi342 = readFileSync(new URL('../src/lib/easyUi.ts', import.meta.url), 'utf8')
  assert.doesNotMatch(defendScreenOnlySrc, /easy \? 'wave' : 'plant'/, '1.4.342 Easy opens plant like Hard')
  assert.match(defendScreenOnlySrc, /useState<NightPhase>\('plant'\)/, '1.4.342 run starts in plant')
  assert.match(defendScreenOnlySrc, /setPhase\('plant'\)/, '1.4.342 retry returns to plant')
  assert.match(defendScreenOnlySrc, /EASY\.nightPlant/, '1.4.342 Easy plant tip')
  assert.match(defendScreenOnlySrc, /EASY\.nightKeepLamp/, '1.4.342 last-lamp toast')
  assert.match(easyUi342, /nightPlant:/)
  assert.match(easyUi342, /nightKeepLamp:/)
  assert.equal(easyTapMode(true, 'plant', false), false, '1.4.342 plant pads are tappable on Easy')
  assert.ok(CHANGELOG.some((note) => note.version === '1.4.342'), '1.4.342 changelog row')
  assert.match(latestChange('1.4.342').items.join('\n'), /Fixes #492/)
  assert.match(latestChange('1.4.342').title, /Night Watch|plant|lamp/i)
  assert.doesNotMatch(
    latestChange('1.4.342').items.join('\n'),
    /#491|#493|upgrade|skill choice|Dig deeper|Hard trail|Town|Pack B/i,
    '1.4.342 stays the Easy plant peel',
  )
}

// Night Watch 1.4.343: planted lamps + rail spend sparks on Easy phone (Fixes #491).
{
  const easyUi343 = readFileSync(new URL('../src/lib/easyUi.ts', import.meta.url), 'utf8')
  const defendNight343 = readFileSync(
    new URL('../src/components/DefendNightActors.tsx', import.meta.url),
    'utf8',
  )
  const defendAbility343 = readFileSync(
    new URL('../src/components/DefendAbilityBar.tsx', import.meta.url),
    'utf8',
  )
  const defendCss343 = readFileSync(new URL('../src/styles/defend.css', import.meta.url), 'utf8')
  assert.match(defendScreenOnlySrc, /EASY\.nightBoost/, '1.4.343 Easy boost tip')
  assert.match(defendScreenOnlySrc, /onBoostTower=\{boostSelectedTool\}/, '1.4.343 map boost wired')
  assert.match(defendScreenOnlySrc, /is-boost/, '1.4.343 boost phase chrome')
  assert.match(defendNight343, /phase === 'boost' && on\)/, '1.4.343 planted lamp tap spends sparks')
  assert.match(defendNight343, /is-boost-pick/, '1.4.343 boost pick styling hook')
  assert.match(defendAbility343, /defend-ability-boost/, '1.4.343 rail shows spark spend cue')
  assert.match(easyUi343, /nightBoost:/)
  assert.match(defendCss343, /1\.4\.343: planted lamps spend sparks/)
  assert.equal(easyTapMode(true, 'boost', false), false, '1.4.343 boost lamps are not scenery')
  assert.ok(CHANGELOG.some((note) => note.version === '1.4.343'), '1.4.343 changelog row')
  assert.match(latestChange('1.4.343').items.join('\n'), /Fixes #491/)
  assert.match(latestChange('1.4.343').title, /Night Watch|tower|level/i)
  assert.doesNotMatch(
    latestChange('1.4.343').items.join('\n'),
    /#492|#493|Dig deeper|Hard trail|Town|Pack B/i,
    '1.4.343 stays the tower upgrade peel',
  )
}

// Night Watch 1.4.344: boost skills read as pick-one choices (Fixes #493).
// 1.4.380 moved the tiles into the skill tray; the boost group and labels stay.
{
  const easyUi344 = readFileSync(new URL('../src/lib/easyUi.ts', import.meta.url), 'utf8')
  const defendCss344 = readFileSync(new URL('../src/styles/defend.css', import.meta.url), 'utf8')
  const skillTray344 = readFileSync(
    new URL('../src/components/NightSkillTray.tsx', import.meta.url),
    'utf8',
  )
  const skillUi344 = `${defendScreenOnlySrc}\n${skillTray344}`
  assert.match(defendScreenOnlySrc, /defend-spark-choices/, '1.4.344 boost skill choice group')
  assert.match(skillUi344, /defend-kit-choice/, '1.4.344 kit choice tiles')
  assert.match(defendScreenOnlySrc, /EASY\.nightBoostPick/, '1.4.344 Easy pick label')
  assert.match(skillUi344, /defend-kit-name/, '1.4.344 kit name row')
  assert.match(skillUi344, /defend-kit-cost/, '1.4.344 kit spark cost row')
  assert.match(defendAbilitySrc, /easy \? 'Tap' : '↑ spark'/, '1.4.344 Easy rail tap cue')
  assert.match(easyUi344, /nightBoostPick:/)
  assert.match(defendCss344, /1\.4\.344: Still \/ Mend \+ rail spend read as pick-one skills \(Fixes #493\)/)
  assert.match(defendCss344, /\.defend-kit-choice/)
  assert.match(defendCss344, /defend-boost-choice-pulse/)
  assert.ok(CHANGELOG.some((note) => note.version === '1.4.344'), '1.4.344 changelog row')
  assert.match(latestChange('1.4.344').items.join('\n'), /Fixes #493/)
  assert.match(latestChange('1.4.344').title, /Night Watch|skill|choice/i)
  assert.doesNotMatch(
    latestChange('1.4.344').items.join('\n'),
    /#491|#492|Dig deeper|Hard trail|Town|Pack B/i,
    '1.4.344 stays the skill choice peel',
  )
}

// Night Watch 1.4.345: stable path walker scale on tall phones (Fixes #488).
{
  const defendCss345 = readFileSync(new URL('../src/styles/defend.css', import.meta.url), 'utf8')
  const defendTs345 = readFileSync(new URL('../src/lib/defend.ts', import.meta.url), 'utf8')
  assert.equal(PATH_WALKER_FACE_U, 72, '1.4.345 portrait plate path face')
  assert.equal(PATH_WALKER_HIT_R, (PATH_WALKER_FACE_U * 22) / 36, '1.4.345 hit tracks the face')
  assert.match(defendTs345, /export const PATH_WALKER_FACE_U/)
  assert.match(defendNightSrc, /PATH_WALKER_FACE_U/)
  assert.match(defendNightSrc, /PATH_WALKER_HIT_R/)
  assert.match(defendCss345, /1\.4\.345: whole portrait plate — width-led contain/)
  assert.match(defendCss345, /container-type: inline-size/)
  assert.match(defendCss345, /min-height: calc\(100cqi \* 1134 \/ 798\)/)
  assert.match(defendCss345, /aspect-ratio: 798 \/ 1134/)
  assert.match(defendScreenOnlySrc, /useLayoutEffect/)
  assert.match(defendScreenOnlySrc, /rect\.width < 1 \|\| rect\.height < 1/)
  assert.doesNotMatch(defendScreenOnlySrc, /useState\(\{ w: 640, h: 420 \}/)
  const phoneW = 390
  const shortH = 220
  const tallH = 580
  const shortScale = Math.min(phoneW / 798, shortH / 1134)
  const tallScale = Math.min(phoneW / 798, tallH / 1134)
  assert.ok(tallScale > shortScale * 1.4, '1.4.345 tall stage is not stuck on height-limited meet')
  const tallFacePx = PATH_WALKER_FACE_U * tallScale
  assert.ok(tallFacePx >= 34, '1.4.345 walkers stay readable at width-led contain')
  assert.equal(EASY_WALKER_FACE_PX, 44, '1.4.345 tap juice stays small (Fixes #469 regression)')
  assert.ok(EASY_WALKER_FACE_PX <= 48, '1.4.345 no giant tap portrait')
  assert.ok(CHANGELOG.some((note) => note.version === '1.4.345'), '1.4.345 changelog row')
  assert.match(latestChange('1.4.345').items.join('\n'), /Fixes #488/)
  assert.match(latestChange('1.4.345').title, /Night Watch|walker|size/i)
  assert.doesNotMatch(
    latestChange('1.4.345').items.join('\n'),
    /#469|#470|#491|#492|#493|Dig deeper|Hard trail|Town|Pack B|triangle|range/i,
    '1.4.345 stays path walker scale only',
  )
}

// Night Watch 1.4.346: drop the TAP chevron on path faces (Fixes #489).
{
  assert.doesNotMatch(defendNightSrc, /▼/, '1.4.346 no down-arrow chevron on the path cue')
  assert.doesNotMatch(defendNightSrc, /easy-walker-arrow is-path-cue/, '1.4.346 chevron marker is gone')
  assert.match(defendNightSrc, /easy-walker-cue-label is-path-cue/, '1.4.346 tap teach label can stay below the face')
  assert.match(defendNightSrc, /easy-walkers-path-cue/, '1.4.346 path cue shell stays')
  assert.match(defendNightSrc, /tapTarget\?\.id === call\.id \? ' is-cue'/, '1.4.346 left roster still marks the cue walker')
  assert.equal(EASY_WALKER_FACE_PX, 44, '1.4.346 tap juice face stays small')
  assert.equal(PATH_WALKER_FACE_U, 72, '1.4.346 path face scale stays from 1.4.345')
  assert.ok(CHANGELOG.some((note) => note.version === '1.4.346'), '1.4.346 changelog row')
  assert.match(latestChange('1.4.346').items.join('\n'), /Fixes #489/)
  assert.match(latestChange('1.4.346').title, /Night Watch|chevron|triangle/i)
  assert.doesNotMatch(
    latestChange('1.4.346').items.join('\n'),
    /#488|#490|#470|Dig deeper|Hard trail|Town|Pack B|range|scale pop/i,
    '1.4.346 stays the path chevron peel',
  )
}

function DEFEND_WAVE_PACK_CHECK() {
  return [0, 1, 2, 3, 4].map((index) => wavePackSize(index))
}

/** Starter-porch taps: one shot per cooldown, focused on the front walker. */
function easyGateResult(waveIndex, damage, cooldown, baseHp = 2) {
  const tune = waveCombat(waveIndex, true)
  const speed = 0.01 * tune.speedScale
  const spawnEvery = 3.8 * tune.spawnScale
  const hp0 = baseHp + tune.hpBonus
  const spawnT = (index) => easySpawnT(index)
  let spawned = 0
  let downed = 0
  let hearts = 3
  let spawnAt = 0
  let spawnNow = false
  let coolUntil = 0
  const raiders = []
  let time = 0
  const dt = 1 / 60
  while (time < 180) {
    spawnAt += dt
    let leaked = 0
    for (const raider of raiders) {
      if (raider.dead) continue
      raider.t += speed * dt
      if (raider.t >= 1) {
        raider.dead = true
        leaked += 1
      }
    }
    hearts -= leaked
    if (hearts <= 0) return 'lost'
    const live = raiders.filter((raider) => !raider.dead).length
    const hold = live >= 3
    if (spawned < tune.size && !hold && (spawnNow || spawnAt >= spawnEvery || spawned === 0)) {
      spawnNow = false
      spawnAt = 0
      raiders.push({ t: spawnT(spawned), hp: hp0, dead: false })
      spawned += 1
    }
    if (time >= coolUntil) {
      const target = raiders.filter((raider) => !raider.dead).sort((a, b) => b.t - a.t)[0]
      if (target) {
        target.hp -= damage
        coolUntil = time + cooldown
        if (target.hp <= 0) {
          target.dead = true
          downed += 1
          spawnNow = true
        }
      }
    }
    if (downed >= tune.size) return 'clear'
    if (spawned >= tune.size && raiders.every((raider) => raider.dead) && downed < tune.size) return 'lost'
    time += dt
  }
  return 'timeout'
}
