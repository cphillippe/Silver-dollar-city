import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { CORE_PACK_ID, PLAY_SKUS, SHOP_PACKS, paidPacks } from '../src/config/commerce.ts'
import {
  adsEnabledDefault,
  isBetweenSceneTransition,
  softAdsVisible,
} from '../src/config/ads.ts'
import {
  emptyCommerce,
  grantPack,
  grantRemoveAds,
  normalizeCommerce,
  packIsUnlocked,
  readCommerce,
  restoreCommerce,
  writeCommerce,
} from '../src/lib/commerce.ts'
import { PAID_STREETS } from '../src/content/paidStreets.ts'
import { EASY_LINE_ORDER, easyLoopLine, FOUNDATION_ARC } from '../src/lib/easy.ts'
import { emptyProgress } from '../src/lib/save.ts'
import { evidenceFor } from '../src/content/evidence.ts'

assert.equal(CORE_PACK_ID, 'core-v0')
assert.equal(PLAY_SKUS.removeAds, 'city.silver.unending.removeads')
assert.equal(SHOP_PACKS[0].included, true)
assert.equal(SHOP_PACKS[0].id, CORE_PACK_ID)
assert.ok(paidPacks().every((pack) => !pack.included))
assert.equal(paidPacks().length, 2)

writeCommerce(emptyCommerce())
assert.equal(readCommerce(), readCommerce(), 'commerce snapshot stays referentially stable')
assert.equal(packIsUnlocked(CORE_PACK_ID), true)
assert.equal(packIsUnlocked('mill-street'), false)
assert.equal(packIsUnlocked('harbor-walk'), false)
assert.equal(softAdsVisible('default', false), true)
assert.equal(softAdsVisible('default', true), false)
assert.equal(adsEnabledDefault, false)

const grantedAds = grantRemoveAds()
assert.equal(grantedAds.removeAds, true)
assert.equal(readCommerce(), grantedAds)
assert.equal(readCommerce(), readCommerce())
assert.equal(softAdsVisible('on', grantedAds.removeAds), false)

const mill = grantPack('mill-street')
assert.equal(packIsUnlocked('mill-street', mill), true)
assert.equal(packIsUnlocked('harbor-walk', mill), false)
assert.deepEqual(grantPack(CORE_PACK_ID).unlockedPacks, mill.unlockedPacks)

const restored = restoreCommerce()
assert.equal(restored.removeAds, true)
assert.ok(restored.unlockedPacks.includes('mill-street'))

const proto = normalizeCommerce({
  removeAds: true,
  unlockedPacks: ['mill-street', '__proto__', 'core-v0', 'harbor-walk'],
})
assert.equal(proto.removeAds, true)
assert.deepEqual(proto.unlockedPacks.sort(), ['harbor-walk', 'mill-street'])

writeCommerce(emptyCommerce())

assert.equal(EASY_LINE_ORDER.length, 39)
assert.equal(EASY_LINE_ORDER[0], 'ph-road')
assert.deepEqual(FOUNDATION_ARC, ['fg-order', 'fg-reason', 'fg-ought', 'fg-ground'])
for (const street of PAID_STREETS) {
  assert.equal(EASY_LINE_ORDER.includes(street.id), false)
  assert.ok(evidenceFor(street.id))
  assert.match(street.brief.claim, /[A-Za-z]/)
}

const fresh = emptyProgress()
assert.equal(easyLoopLine(fresh), 'ph-road')
assert.equal(
  easyLoopLine({ ...fresh, easyHeld: ['ms-bread', 'hw-hope'] }),
  'ph-road',
  'Paid streets must not skip Mercy on Easy',
)
assert.equal(
  easyLoopLine({ ...fresh, easyHeld: ['ph-road'] }),
  'ph-father',
)

assert.equal(isBetweenSceneTransition('hub', 'link'), true)
assert.equal(isBetweenSceneTransition('hub', 'journal'), false)
assert.equal(isBetweenSceneTransition('link', 'learn'), false)

const appSrc = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8')
assert.match(appSrc, /SceneAd/)
assert.match(appSrc, /isBetweenSceneTransition/)
assert.match(appSrc, /view\.name === 'shop'/)
assert.match(appSrc, /pack-street/)
assert.match(appSrc, /name === 'journal'/)
assert.doesNotMatch(appSrc, /hub-banner/)

const hubSrc = readFileSync(new URL('../src/components/Hub.tsx', import.meta.url), 'utf8')
assert.match(hubSrc, /EASY\.matchCta|EASY\.mazeMatch|EASY\.runMatch|EASY\.mergeMatch|EASY\.digMatch/)
assert.match(hubSrc, /EASY\.saved/)
assert.match(hubSrc, /EASY\.supportTrail/)
assert.match(hubSrc, /extraStreetPacks/)
assert.doesNotMatch(hubSrc, /slot="hub-banner"/)
assert.doesNotMatch(hubSrc, /slot="between-districts"/)
assert.ok(
  hubSrc.indexOf('easy-core') < hubSrc.indexOf('easy-extra-streets'),
  'Core Easy play stays above extra streets',
)

const adSlotSrc = readFileSync(new URL('../src/components/AdSlot.tsx', import.meta.url), 'utf8')
assert.match(adSlotSrc, /EMPTY_COMMERCE/)
assert.doesNotMatch(adSlotSrc, /unlockedPacks: \[\] as string\[\]/)

const shopSrc = readFileSync(new URL('../src/components/Shop.tsx', import.meta.url), 'utf8')
assert.match(shopSrc, /Unlock on this device/)
assert.match(shopSrc, /Restore/)
assert.match(shopSrc, /grantRemoveAds/)
assert.match(shopSrc, /grantPack/)
assert.match(shopSrc, /Walk the free trail/)
assert.match(shopSrc, /packPaywallLine/)
assert.match(shopSrc, /TRAIL_SUBTITLE/)
assert.match(shopSrc, /TRAIL_NAME/)
assert.doesNotMatch(shopSrc, /hard paywall/i)

const welcomeSrc = readFileSync(new URL('../src/components/Welcome.tsx', import.meta.url), 'utf8')
assert.match(welcomeSrc, /TRAIL_SUBTITLE/)

const sceneAdSrc = readFileSync(new URL('../src/components/SceneAd.tsx', import.meta.url), 'utf8')
assert.match(sceneAdSrc, /SCENE_PAUSE_COPY/)
assert.match(sceneAdSrc, /REMOVE_ADS_PRODUCT\.title/)

const settingsSrc = readFileSync(new URL('../src/components/Settings.tsx', import.meta.url), 'utf8')
assert.match(settingsSrc, /SETTINGS_SUPPORT_LINE/)
assert.match(settingsSrc, /Street Packs/)

const journalSrc = readFileSync(new URL('../src/components/Journal.tsx', import.meta.url), 'utf8')
assert.doesNotMatch(journalSrc, /SceneAd/)
assert.doesNotMatch(journalSrc, /AdSlot/)

const matchSrc = readFileSync(new URL('../src/components/challenges/MatchPlay.tsx', import.meta.url), 'utf8')
const holdSrc = readFileSync(new URL('../src/components/challenges/WhyBlastPlay.tsx', import.meta.url), 'utf8')
const mergeSrc = readFileSync(new URL('../src/components/challenges/ClaimMergePlay.tsx', import.meta.url), 'utf8')
const runSrc = readFileSync(new URL('../src/components/challenges/FatherRunPlay.tsx', import.meta.url), 'utf8')
const mazeSrc = readFileSync(new URL('../src/components/challenges/RoadMazePlay.tsx', import.meta.url), 'utf8')
const digPlaySrc = readFileSync(new URL('../src/components/challenges/SourceDigPlay.tsx', import.meta.url), 'utf8')
for (const src of [matchSrc, holdSrc, mergeSrc, runSrc, mazeSrc, digPlaySrc]) {
  assert.doesNotMatch(src, /SceneAd/)
  assert.doesNotMatch(src, /AdSlot/)
}

const commerceCfg = readFileSync(new URL('../src/config/commerce.ts', import.meta.url), 'utf8')
assert.match(commerceCfg, /Play Billing/)
assert.match(commerceCfg, /grantRemoveAds/)
assert.match(commerceCfg, /grantPack/)
assert.match(commerceCfg, /A quiet pause on the trail/)
assert.match(commerceCfg, /title: 'Keep the quiet trail — Remove ads'/)
assert.match(commerceCfg, /New street. Same trail/)
assert.match(commerceCfg, /Street Packs · Remove ads/)
assert.match(commerceCfg, /Puzzle trail. Fold the page/)
assert.match(commerceCfg, /Silver City: Unending Evidence/)

console.log('check-commerce: ok')
