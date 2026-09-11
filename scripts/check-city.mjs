import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import {
  CITY_HOLLOW_TO_WITNESS,
  cityAge,
  citySnapshot,
  cityUpgrades,
  fillGrows,
  fillSnapshot,
  newestStanding,
  nextGift,
  nextKicker,
  nextPlotId,
  plotFill,
  plotStage,
} from '../src/lib/city.ts'
import { APP_VERSION } from '../src/config/app.ts'
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
  heavenPoint,
  raidForWave,
  unlockedWatchAbilities,
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
import { LOT_STORY, TOWN_PATH_EASY, TOWN_PATH_HARD } from '../src/content/lots.ts'
import {
  appliedTier,
  applyUpgrade,
  canUpgrade,
  earnedTier,
  emptyCityBuilt,
  lotTapWhy,
} from '../src/lib/cityBuild.ts'
import { emptyProgress } from '../src/lib/save.ts'
import { WORDS } from '../src/lib/words.ts'
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
assert.match(mapSrc, /city-age-track/)

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
assert.match(sortSrc, /Return \$\{home\.text\} to its seat/)
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
assert.match(recallSrc, /Read why this is true, then tap Done/)
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
assert.match(hubSrc, /EASY.nightDo/)
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
assert.match(defendSrc, /Unlock the lamps/)
assert.match(defendSrc, /TeachUnlock/)
assert.match(defendSrc, /RecallGate/)
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
assert.match(defendSrc, /deployFit/)
assert.match(defendSrc, /raidForWave/)
assert.match(defendSrc, /WALKER_LABEL/)
assert.match(defendSrc, /learningForTool/)
assert.match(defendSrc, /kind: 'encode'/)
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
assert.equal(APP_VERSION, '1.4.20')
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
assert.match(TOWN_PATH_HARD, /Heaven/)
assert.match(mapSrc, /TOWN_PATH/)
assert.match(
  readFileSync(new URL('../src/components/Landmark.tsx', import.meta.url), 'utf8'),
  /Parable Hollow/,
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
assert.match(linkPlaySrc, /is-wizard/)
assert.match(linkPlaySrc, /is-picture/)
assert.match(linkPlaySrc, /PlaceGlyph/)
assert.match(linkPlaySrc, /size="xl"/)
assert.match(linkPlaySrc, /linkPicture/)
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
  assert.equal(linkPicture(mercy, STREET_CHALLENGE).plotId, 'hollow')
  assert.equal(linkPicture(creed, STREET_CHALLENGE).plotId, 'bench')
  assert.equal(linkPicture(lamp, STREET_CHALLENGE).plotId, 'porch')
  assert.match(linkCaption(mercy, true), /mercy/i)
  assert.doesNotMatch(linkCaption(creed, false), /Paul hands on/)
  assert.match(linkClue('mercy-hollow', 'idea'), /Mercy|neighbor|road/)
  assert.match(linkClue('silas-bench', 'place'), /square/)
  assert.match(linkClue('juniper-porch', 'person'), /Juniper|porch/)
  assert.match(linkMiss('mercy-hollow', 'idea'), /Wrong\. Tap this one: Neighbor shows mercy\./)
  assert.doesNotMatch(linkMiss('mercy-hollow', 'idea'), /Tap This one\. Tap:/)
  assert.doesNotMatch(linkMiss('mercy-hollow', 'idea'), /neighbor-line/)
  assert.doesNotMatch(linkMiss('mercy-hollow', 'idea'), /This story is Mercy/)
  assert.match(linkMiss('silas-bench', 'place'), /Wrong\. Tap this one:/)
  assert.match(linkMiss('juniper-porch', 'person'), /Wrong\. Tap this one:/)
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
assert.match(hubSrc, /EASY\.nightDo/)
assert.match(cssSrc, /mind-map-dock/)
assert.match(cssSrc, /link-dock/)
assert.match(cssSrc, /cta-dock/)
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
assert.match(mapSrc, /mindMapHasLit/)
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
  /scrapbook of matches/,
)
assert.match(
  readFileSync(new URL('../src/lib/easy.ts', import.meta.url), 'utf8'),
  /Read today’s story/,
)
assert.match(
  readFileSync(new URL('../src/lib/easy.ts', import.meta.url), 'utf8'),
  /Choose the main idea to remember/,
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
  /Wrong match — try again/,
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
  /Parable Hollow/,
)
assert.match(
  readFileSync(new URL('../src/lib/cityBuild.ts', import.meta.url), 'utf8'),
  /Witness Bench/,
)
assert.match(
  readFileSync(new URL('../src/lib/cityBuild.ts', import.meta.url), 'utf8'),
  /East porch/,
)
assert.match(cssSrc, /font-size: 20px/)
assert.match(sortSrc, /EASY\.lockIn/)
assert.match(
  readFileSync(new URL('../src/components/TeachUnlock.tsx', import.meta.url), 'utf8'),
  /Skip reading/,
)
assert.match(hubSrc, /easyTapNext/)
assert.match(hubSrc, /EASY\.linkStreet/)
assert.match(
  readFileSync(new URL('../src/content/lots.ts', import.meta.url), 'utf8'),
  /Mercy’s creek · Jesus stories/,
)
assert.doesNotMatch(
  readFileSync(new URL('../src/lib/easy.ts', import.meta.url), 'utf8'),
  /toward heaven/,
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
assert.match(
  readFileSync(new URL('../src/lib/easy.ts', import.meta.url), 'utf8'),
  /mean line around/,
)
assert.match(
  readFileSync(new URL('../src/lib/easy.ts', import.meta.url), 'utf8'),
  /Main idea = the short true line we keep/,
)
assert.match(defendSrc, /is-easy-walker/)
assert.match(defendSrc, /waveSpeed\(easy\)/)
assert.match(defendSrc, /holdWalkers/)
assert.match(defendSrc, /easy-walker-face/)
assert.match(defendSrc, /EASY_CUE_HOLD_MS/)
assert.match(defendSrc, /holdSpawn/)
assert.match(defendSrc, /hideOther/)
assert.match(defendSrc, /is-cue-solo/)
assert.match(defendSrc, /data-person-node/)
assert.match(defendSrc, /Love — tap the person/)
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
  /Tap this person/,
)
assert.match(
  readFileSync(new URL('../src/lib/easy.ts', import.meta.url), 'utf8'),
  /Saved sentences/,
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
assert.match(defendSrc, /useState\(easy\)/)
assert.match(defendSrc, /walkerCue/)
assert.match(defendSrc, /walker-cue/)
assert.match(defendSrc, /easy \? 'wave'/)
assert.match(cssSrc, /walker-cue-pulse/)
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
  readFileSync(new URL('../src/components/AppShell.tsx', import.meta.url), 'utf8'),
  /easy \? 'Saved' : 'Journal'/,
)
assert.match(
  readFileSync(new URL('../src/components/challenges/LinkPlay.tsx', import.meta.url), 'utf8'),
  /easyLinkStep/,
)
assert.match(
  readFileSync(new URL('../src/components/challenges/LinkPlay.tsx', import.meta.url), 'utf8'),
  /is-easy-miss/,
)
assert.match(
  readFileSync(new URL('../src/lib/easy.ts', import.meta.url), 'utf8'),
  /Tap a sentence/,
)
assert.match(cssSrc, /is-easy-miss/)
assert.match(defendSrc, /easySolo && tool\.id !== ability/)
assert.match(defendSrc, /walking\.some\(\(item\) => !item\.turned\)/)
assert.doesNotMatch(defendSrc, /matching sentence/)
assert.match(
  readFileSync(new URL('../src/components/challenges/LinkPlay.tsx', import.meta.url), 'utf8'),
  /awaitNext/,
)
assert.match(
  readFileSync(new URL('../src/components/challenges/LinkPlay.tsx', import.meta.url), 'utf8'),
  /Tap Next/,
)
assert.match(cssSrc, /link-clue/)
assert.match(
  readFileSync(new URL('../src/components/LinkScreen.tsx', import.meta.url), 'utf8'),
  /Start/,
)
assert.match(hubSrc, /Do this next/)
assert.match(hubSrc, /do-next/)
assert.match(hubSrc, /Tap this next/)
assert.match(hubSrc, /is-easy-town/)
assert.match(cssSrc, /tap-next-dock/)
assert.match(defendSrc, /You missed the walker/)
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
  /You’ll reopen them from Town/,
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
assert.match(matchSrc, /EASY\.matchMiss/)
assert.match(matchSrc, /EASY\.lockIn/)
assert.doesNotMatch(matchSrc, /A claim is the main idea we hold to be true/)
assert.match(cssSrc, /\.word-school/)
assert.doesNotMatch(teachSrc, /Acquire · \$\{brief\.source\}/)

console.log('check-city: ok')
