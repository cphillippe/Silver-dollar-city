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
import { DAILY_POOL, dailyForDate } from '../src/content/daily.ts'
import { highLookout } from '../src/content/highLookout.ts'
import { observatory } from '../src/content/observatory.ts'
import { parableHollow } from '../src/content/parableHollow.ts'
import { witnessBench } from '../src/content/witnessBench.ts'
import { abilityRange, defendPads, heavenPoint, raidForWave, unlockedWatchAbilities } from '../src/lib/defend.ts'
import {
  deployFit,
  toolForEvidence,
  toolTier,
  WALKER_LABEL,
  watchTool,
  WATCH_TOOLS,
} from '../src/lib/watchTools.ts'

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

const dailySrc = readFileSync(
  new URL('../src/content/daily.ts', import.meta.url),
  'utf8',
)
assert.match(dailySrc, /faith and science can share the same sky/)
assert.match(dailySrc, /why: 'A gift-shaped beauty/)
assert.match(dailySrc, /why: 'Psalm 19 treats the sky as speech/)
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

const matchCss = readFileSync(new URL('../src/index.css', import.meta.url), 'utf8')
assert.match(matchCss, /match-toast/)
assert.match(matchCss, /match-scene/)
assert.match(matchCss, /grid-template-rows: subgrid/)
assert.match(matchCss, /\.match-card\.right/)

const obSrc = readFileSync(new URL('../src/content/observatory.ts', import.meta.url), 'utf8')
assert.match(obSrc, /scene: 'cosmos'/)
assert.match(obSrc, /scene: 'atom'/)
assert.match(obSrc, /scene: 'origin'/)
assert.match(obSrc, /scene: 'balance'/)

const evidenceSrc = readFileSync(
  new URL('../src/content/evidence.ts', import.meta.url),
  'utf8',
)
assert.match(evidenceSrc, /Wonder and measurement can share a roof/)
assert.match(evidenceSrc, /Psalm 19 treats the sky as speech/)
assert.match(evidenceSrc, /The kingdom arrives in pictures, not slogans/)
assert.match(evidenceSrc, /export function takeawayLines/)
assert.doesNotMatch(evidenceSrc, /Beauty forbids/)
assert.doesNotMatch(evidenceSrc, /Wonder is the enemy of science/)
assert.doesNotMatch(evidenceSrc, /The sky is not worth looking at slowly/)

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
assert.match(defendSrc, /Unlock the lamps/)
assert.match(defendSrc, /TeachUnlock/)
assert.match(defendSrc, /RecallGate/)
assert.match(defendSrc, /defendPads/)
assert.match(defendSrc, /afterJuiceRef/)
assert.match(defendSrc, /}, \[phase\]/)
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
assert.match(defendSrc, /preserveAspectRatio="xMidYMid meet"/)
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
assert.match(cssSrc, /\.stored-line/)
assert.match(cssSrc, /\.memory-pipe/)
assert.match(
  readFileSync(new URL('../src/lib/learning.ts', import.meta.url), 'utf8'),
  /Acquire → Anchor → Picture → Store/,
)
assert.match(challengeSrc, /StoredLine/)

console.log('check-city: ok')
