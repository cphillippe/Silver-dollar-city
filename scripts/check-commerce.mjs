import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { CORE_PACK_ID, PLAY_SKUS, SHOP_PACKS, paidPacks } from '../src/config/commerce.ts'
import {
  adsEnabledDefault,
  isBetweenSceneTransition,
  scenePauseMountsOn,
  softAdsVisible,
} from '../src/config/ads.ts'
import { billedSkus, liveAdmobIds, resetStoreFlagsForTest, setStoreFlagsForTest, storeFlags } from '../src/config/store.ts'
import {
  HARBOR_PACK_URL,
  MILL_PACK_URL,
  STORES_COMING,
  SUPPORT_HEADING,
  SUPPORT_LINE,
  TIP_CTA,
  TIP_URL,
  supportUrls,
} from '../src/config/support.ts'
import {
  markSupportToastShown,
  offerSupportToast,
  resetSupportToastForTest,
  supportToastPending,
} from '../src/lib/supportToast.ts'
import {
  liveInterstitialReady,
  resetAdAdapterForTest,
  setAdPluginForTest,
  showBetweenSceneInterstitial,
} from '../src/lib/adAdapter.ts'
import { iapCanCharge, resetIapAdapterForTest, setBillingPluginForTest } from '../src/lib/iapAdapter.ts'
import {
  resetStoreSurfaceForTest,
  setStoreSurfaceForTest,
  storeSurface,
} from '../src/lib/nativeStore.ts'
import {
  emptyCommerce,
  grantPack,
  grantRemoveAds,
  normalizeCommerce,
  packIsUnlocked,
  readCommerce,
  writeCommerce,
} from '../src/lib/commerce.ts'
import {
  cannotCharge,
  checkoutOffer,
  packStreetLocked,
  purchaseOffer,
  readReceipts,
  resetBilling,
  restoreFromStore,
  restorePurchases,
} from '../src/lib/billing.ts'
import { PAID_STREETS } from '../src/content/paidStreets.ts'
import { EASY_LINE_ORDER, easyLoopLine, FOUNDATION_ARC } from '../src/lib/easy.ts'
import { emptyProgress } from '../src/lib/save.ts'
import { evidenceFor } from '../src/content/evidence.ts'
import { readAppCss } from './readAppCss.mjs'

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
assert.equal(packStreetLocked('mill-street'), true)
assert.equal(packStreetLocked(CORE_PACK_ID), false)
assert.equal(softAdsVisible('default', false), true)
assert.equal(softAdsVisible('default', true), false)
assert.equal(adsEnabledDefault, false)
assert.equal(cannotCharge(), true)

resetBilling()
const boughtAds = purchaseOffer({ kind: 'remove-ads' })
assert.equal(boughtAds.status, 'purchased')
assert.equal(boughtAds.cannotCharge, true)
assert.equal(boughtAds.commerce.removeAds, true)
assert.equal(boughtAds.receipt?.sku, PLAY_SKUS.removeAds)
assert.equal(readReceipts().length, 1)
assert.equal(purchaseOffer({ kind: 'remove-ads' }).status, 'already')
assert.equal(softAdsVisible('on', boughtAds.commerce.removeAds), false)

const millBuy = purchaseOffer({ kind: 'pack', packId: 'mill-street' })
assert.equal(millBuy.status, 'purchased')
assert.equal(packIsUnlocked('mill-street', millBuy.commerce), true)
assert.equal(packStreetLocked('mill-street', millBuy.commerce), false)
assert.equal(packIsUnlocked('harbor-walk', millBuy.commerce), false)
assert.equal(purchaseOffer({ kind: 'pack', packId: CORE_PACK_ID }).status, 'unavailable')

writeCommerce(emptyCommerce())
assert.equal(readCommerce().removeAds, false)
assert.equal(packIsUnlocked('mill-street'), false)
const restored = restorePurchases()
assert.equal(restored.removeAds, true)
assert.ok(restored.unlockedPacks.includes('mill-street'))
assert.equal(readReceipts().length, 2)

const grantedAds = grantRemoveAds()
assert.equal(grantedAds.removeAds, true)

const mill = grantPack('mill-street')
assert.equal(packIsUnlocked('mill-street', mill), true)
assert.deepEqual(grantPack(CORE_PACK_ID).unlockedPacks, mill.unlockedPacks)

const proto = normalizeCommerce({
  removeAds: true,
  unlockedPacks: ['mill-street', '__proto__', 'core-v0', 'harbor-walk'],
})
assert.equal(proto.removeAds, true)
assert.deepEqual(proto.unlockedPacks.sort(), ['harbor-walk', 'mill-street'])

writeCommerce(emptyCommerce())

assert.equal(EASY_LINE_ORDER.length, 54)
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
assert.equal(isBetweenSceneTransition('link', 'journal'), false)
assert.equal(isBetweenSceneTransition('link', 'hub'), true)
assert.equal(isBetweenSceneTransition('journal', 'hub'), true)
assert.equal(isBetweenSceneTransition('pack-street', 'hub'), true)
assert.equal(scenePauseMountsOn('hub'), true)
assert.equal(scenePauseMountsOn('link'), false)
assert.equal(scenePauseMountsOn('journal'), false)

const appSrc = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8')
assert.match(appSrc, /SceneAd/)
assert.match(appSrc, /isBetweenSceneTransition/)
assert.match(appSrc, /view\.name === 'shop'/)
assert.match(appSrc, /pack-street/)
assert.match(appSrc, /name === 'journal'/)
assert.match(appSrc, /scenePauseMountsOn/)
assert.match(appSrc, /isSceneLeaveView/)
assert.match(appSrc, /liveInterstitialReady/)
assert.match(appSrc, /showBetweenSceneInterstitial/)
assert.doesNotMatch(appSrc, /hub-banner/)

const hubSrc = readFileSync(new URL('../src/components/Hub.tsx', import.meta.url), 'utf8')
assert.match(hubSrc, /EASY\.matchCta|EASY\.mazeMatch|EASY\.runMatch|EASY\.mergeMatch|EASY\.digMatch/)
assert.match(hubSrc, /EASY\.saved/)
assert.match(hubSrc, /SupportToast/)
assert.match(hubSrc, /name: 'settings'/)
// Easy Home (1.4.120+) parks Extra streets / pack-street paywall chrome off the home dock
assert.match(hubSrc, /easy-extra-streets/)
assert.match(hubSrc, /easy-core/)
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
assert.match(shopSrc, /checkoutOffer/)
assert.match(shopSrc, /restoreFromStore/)
assert.match(shopSrc, /CheckoutSheet/)
assert.match(shopSrc, /Walk the free trail/)
assert.match(shopSrc, /packPaywallLine/)
assert.match(shopSrc, /TRAIL_SUBTITLE/)
assert.match(shopSrc, /TRAIL_NAME/)
assert.match(shopSrc, /is-locked/)
assert.doesNotMatch(shopSrc, /window\.confirm/)
assert.match(shopSrc, /App Store/)
assert.match(shopSrc, /StoreKit/)

const checkoutSrc = readFileSync(new URL('../src/components/CheckoutSheet.tsx', import.meta.url), 'utf8')
assert.match(checkoutSrc, /cannotCharge/)
assert.match(checkoutSrc, /Unlock on this device/)
assert.match(checkoutSrc, /this device cannot charge/)
assert.match(checkoutSrc, /App Store/)
assert.match(checkoutSrc, /StoreKit/)

const packStreetSrc = readFileSync(new URL('../src/components/PackStreet.tsx', import.meta.url), 'utf8')
assert.match(packStreetSrc, /CheckoutSheet/)
assert.match(packStreetSrc, /checkoutOffer/)
assert.match(packStreetSrc, /pack\.sku/)
assert.match(packStreetSrc, /is-locked/)
assert.doesNotMatch(packStreetSrc, /window\.confirm/)

const welcomeSrc = readFileSync(new URL('../src/components/Welcome.tsx', import.meta.url), 'utf8')
assert.match(welcomeSrc, /TRAIL_SUBTITLE/)

const sceneAdSrc = readFileSync(new URL('../src/components/SceneAd.tsx', import.meta.url), 'utf8')
assert.match(sceneAdSrc, /SCENE_PAUSE_COPY/)
assert.match(sceneAdSrc, /REMOVE_ADS_PRODUCT\.title/)

const settingsSrc = readFileSync(new URL('../src/components/Settings.tsx', import.meta.url), 'utf8')
assert.match(settingsSrc, /EASY\.supportTrail/)
assert.match(settingsSrc, /SETTINGS_SUPPORT_LINE/)
assert.match(settingsSrc, /Street Packs/)
assert.match(settingsSrc, /Support Silver City/)
assert.match(settingsSrc, /TIP_CTA|EASY\.tip/)
assert.match(settingsSrc, /data-support-tip/)
assert.match(settingsSrc, /data-support-mill/)
assert.match(settingsSrc, /data-support-harbor/)
assert.match(settingsSrc, /STORES_COMING/)
assert.match(settingsSrc, /disabled/)
assert.doesNotMatch(settingsSrc, /Subscribe/)
assert.doesNotMatch(settingsSrc, /VITE_PLAY_BILLING\s*=\s*1/)

const journalSrc = readFileSync(new URL('../src/components/Journal.tsx', import.meta.url), 'utf8')
assert.doesNotMatch(journalSrc, /SceneAd/)
assert.doesNotMatch(journalSrc, /AdSlot/)
assert.match(journalSrc, /offerSupportToast/)
assert.doesNotMatch(journalSrc, /data-support-toast/)

const matchSrc = readFileSync(new URL('../src/components/challenges/MatchPlay.tsx', import.meta.url), 'utf8')
const holdSrc = readFileSync(new URL('../src/components/challenges/WhyBlastPlay.tsx', import.meta.url), 'utf8')
const mergeSrc = readFileSync(new URL('../src/components/challenges/ClaimMergePlay.tsx', import.meta.url), 'utf8')
const runSrc = readFileSync(new URL('../src/components/challenges/FatherRunPlay.tsx', import.meta.url), 'utf8')
const mazeSrc = readFileSync(new URL('../src/components/challenges/RoadMazePlay.tsx', import.meta.url), 'utf8')
const digPlaySrc = readFileSync(new URL('../src/components/challenges/SourceDigPlay.tsx', import.meta.url), 'utf8')
for (const src of [matchSrc, holdSrc, mergeSrc, runSrc, mazeSrc, digPlaySrc]) {
  assert.doesNotMatch(src, /SceneAd/)
  assert.doesNotMatch(src, /AdSlot/)
  assert.doesNotMatch(src, /SupportToast/)
  assert.doesNotMatch(src, /data-support-toast/)
}

const commerceCfg = readFileSync(new URL('../src/config/commerce.ts', import.meta.url), 'utf8')
assert.match(commerceCfg, /StoreKit \+ Play Billing/)
assert.match(commerceCfg, /grantRemoveAds/)
assert.match(commerceCfg, /grantPack/)
assert.match(commerceCfg, /A quiet pause on the trail/)
assert.match(commerceCfg, /title: 'Keep the quiet trail — Remove ads'/)
assert.match(commerceCfg, /New street. Same trail/)
assert.match(commerceCfg, /Tip · wishlist packs/)
assert.match(commerceCfg, /Puzzle trail. Fold the page/)
assert.match(commerceCfg, /Silver City: Unending Evidence/)

const billingSrc = readFileSync(new URL('../src/lib/billing.ts', import.meta.url), 'utf8')
assert.match(billingSrc, /RECEIPTS_KEY/)
assert.match(billingSrc, /purchaseOffer/)
assert.match(billingSrc, /checkoutOffer/)
assert.match(billingSrc, /restorePurchases/)
assert.match(billingSrc, /restoreFromStore/)
assert.match(billingSrc, /cannotCharge/)
assert.match(billingSrc, /web-demo/)
assert.match(billingSrc, /app-store/)
assert.match(billingSrc, /paidSource/)

const adapterSrc = readFileSync(new URL('../src/lib/iapAdapter.ts', import.meta.url), 'utf8')
assert.match(adapterSrc, /iapCanCharge/)
assert.match(adapterSrc, /InAppPurchases/)
assert.match(adapterSrc, /StoreKit/)
assert.match(adapterSrc, /VITE_STOREKIT/)

const storeSrc = readFileSync(new URL('../src/config/store.ts', import.meta.url), 'utf8')
assert.match(storeSrc, /VITE_PLAY_BILLING/)
assert.match(storeSrc, /VITE_STOREKIT/)
assert.match(storeSrc, /VITE_ADMOB_INTERSTITIAL_ID/)
assert.match(storeSrc, /VITE_ADMOB_INTERSTITIAL_ID_IOS/)
assert.match(storeSrc, /liveAdmobIds/)

const adAdapterSrc = readFileSync(new URL('../src/lib/adAdapter.ts', import.meta.url), 'utf8')
assert.match(adAdapterSrc, /liveInterstitialReady/)
assert.match(adAdapterSrc, /showBetweenSceneInterstitial/)
assert.match(adAdapterSrc, /scenePauseMountsOn/)
assert.match(adAdapterSrc, /liveAdmobIds/)

assert.deepEqual(billedSkus(), [
  PLAY_SKUS.removeAds,
  PLAY_SKUS.millStreet,
  PLAY_SKUS.harborWalk,
])
assert.equal(storeFlags().playBilling, false)
assert.equal(storeFlags().storeKit, false)
assert.equal(storeFlags().adsEnabled, false)
assert.equal(iapCanCharge(), false)
assert.equal(storeSurface(), 'web')

assert.equal(TIP_CTA, 'Tip')
assert.equal(SUPPORT_HEADING, 'Support Silver City')
assert.match(SUPPORT_LINE, /Tip/)
assert.match(SUPPORT_LINE, /Easy stays free/)
assert.doesNotMatch(TIP_CTA, /Subscribe/)
assert.doesNotMatch(SUPPORT_HEADING, /Subscribe/)
assert.match(TIP_URL, /^https:\/\//)
assert.match(MILL_PACK_URL, /^https:\/\//)
assert.match(HARBOR_PACK_URL, /^https:\/\//)
assert.equal(supportUrls().tip, TIP_URL)
assert.equal(supportUrls().mill, MILL_PACK_URL)
assert.equal(supportUrls().harbor, HARBOR_PACK_URL)
assert.match(STORES_COMING, /Coming with stores/)

const toastCss = readAppCss()
assert.match(toastCss, /\.support-toast[\s\S]{0,400}color:\s*#2a1a0e/)
assert.doesNotMatch(toastCss, /var\(--card/)

resetSupportToastForTest()
assert.equal(supportToastPending(), false)
offerSupportToast()
assert.equal(supportToastPending(), true)
markSupportToastShown()
assert.equal(supportToastPending(), false)
offerSupportToast()
assert.equal(supportToastPending(), false, 'toast is once per session')
resetSupportToastForTest()
assert.deepEqual(liveAdmobIds(), { appId: '', unitId: '' })
assert.equal(liveInterstitialReady(), false)
assert.equal(await showBetweenSceneInterstitial('hub'), 'soft')
assert.equal(await showBetweenSceneInterstitial('link'), 'skip')
assert.equal(await showBetweenSceneInterstitial('journal'), 'skip')

setStoreFlagsForTest({ playBilling: true })
const pluginSkus = []
setBillingPluginForTest({
  async purchase(sku) {
    pluginSkus.push(sku)
    return { sku, orderId: 'GPA.test-1', token: 'tok-1' }
  },
  async restore() {
    return [
      { sku: PLAY_SKUS.removeAds, orderId: 'GPA.rest-ads', token: 'tok-ads' },
      { sku: PLAY_SKUS.millStreet, orderId: 'GPA.rest-mill', token: 'tok-mill' },
    ]
  },
})
assert.equal(iapCanCharge(), true)
assert.equal(cannotCharge(), false)
resetBilling()
const liveBuy = await checkoutOffer({ kind: 'remove-ads' })
assert.equal(liveBuy.status, 'purchased')
assert.equal(liveBuy.cannotCharge, false)
assert.equal(liveBuy.receipt?.source, 'play')
assert.equal(liveBuy.commerce.removeAds, true)
assert.deepEqual(pluginSkus, [PLAY_SKUS.removeAds])
assert.equal(await checkoutOffer({ kind: 'remove-ads' }).then((row) => row.status), 'already')

writeCommerce(emptyCommerce())
assert.equal(readCommerce().removeAds, false)
const liveRestored = await restoreFromStore()
assert.equal(liveRestored.removeAds, true)
assert.ok(liveRestored.unlockedPacks.includes('mill-street'))

setBillingPluginForTest({
  async purchase() {
    throw new Error('user canceled')
  },
  async restore() {
    return []
  },
})
resetBilling()
const canceled = await checkoutOffer({ kind: 'pack', packId: 'mill-street' })
assert.equal(canceled.status, 'canceled')
assert.equal(canceled.cannotCharge, false)
assert.equal(packIsUnlocked('mill-street'), false, 'plugin cancel must not demo-grant')

setBillingPluginForTest(undefined)
resetStoreFlagsForTest()
resetIapAdapterForTest()
assert.equal(cannotCharge(), true)
resetBilling()
const demoAgain = await checkoutOffer({ kind: 'pack', packId: 'harbor-walk' })
assert.equal(demoAgain.status, 'purchased')
assert.equal(demoAgain.cannotCharge, true)
assert.equal(demoAgain.receipt?.source, 'web-demo')

setStoreSurfaceForTest('app-store')
setStoreFlagsForTest({ storeKit: true })
setBillingPluginForTest({
  async purchase(sku) {
    return { sku, orderId: '100000001', token: 'sk-tok-1' }
  },
  async restore() {
    return []
  },
})
assert.equal(storeSurface(), 'app-store')
assert.equal(iapCanCharge(), true)
resetBilling()
const appleBuy = await checkoutOffer({ kind: 'remove-ads' })
assert.equal(appleBuy.status, 'purchased')
assert.equal(appleBuy.cannotCharge, false)
assert.equal(appleBuy.receipt?.source, 'app-store')
assert.equal(appleBuy.commerce.removeAds, true)
resetStoreSurfaceForTest()
setBillingPluginForTest(undefined)
resetStoreFlagsForTest()
resetIapAdapterForTest()
resetBilling()
assert.equal(cannotCharge(), true)

setStoreFlagsForTest({ adsEnabled: true, interstitialUnitId: 'ca-app-pub-test/interstitial' })
assert.equal(liveInterstitialReady(), false)
let shown = 0
setAdPluginForTest({
  async prepare(unitId) {
    assert.equal(unitId, 'ca-app-pub-test/interstitial')
  },
  async show() {
    shown += 1
    return 'shown'
  },
})
assert.equal(liveInterstitialReady(), true)
assert.equal(await showBetweenSceneInterstitial('hub'), 'live')
assert.equal(shown, 1)
assert.equal(await showBetweenSceneInterstitial('link'), 'skip')
assert.equal(await showBetweenSceneInterstitial('journal'), 'skip')
assert.equal(await showBetweenSceneInterstitial('learn'), 'skip')
assert.equal(shown, 1, 'live interstitial never runs over Match/Hold/arcade')
grantRemoveAds()
assert.equal(liveInterstitialReady(), false)

setAdPluginForTest(undefined)
resetAdAdapterForTest()
resetStoreFlagsForTest()
resetBilling()

setStoreSurfaceForTest('app-store')
setStoreFlagsForTest({
  adsEnabled: true,
  interstitialUnitId: 'ca-app-pub-android/interstitial',
  interstitialUnitIdIos: 'ca-app-pub-ios/interstitial',
})
assert.deepEqual(liveAdmobIds(), {
  appId: '',
  unitId: 'ca-app-pub-ios/interstitial',
})
let iosShown = 0
setAdPluginForTest({
  async prepare(unitId) {
    assert.equal(unitId, 'ca-app-pub-ios/interstitial')
  },
  async show() {
    iosShown += 1
    return 'shown'
  },
})
assert.equal(liveInterstitialReady(), true)
assert.equal(await showBetweenSceneInterstitial('hub'), 'live')
assert.equal(iosShown, 1)
assert.equal(await showBetweenSceneInterstitial('link'), 'skip')
resetStoreSurfaceForTest()
setAdPluginForTest(undefined)
resetAdAdapterForTest()
resetStoreFlagsForTest()
resetBilling()

const pkgJson = JSON.parse(
  readFileSync(new URL('../package.json', import.meta.url), 'utf8'),
)
assert.equal(pkgJson.scripts['ios:sync']?.includes('cap-sync.mjs ios'), true)
assert.equal(pkgJson.scripts['android:sync']?.includes('cap-sync.mjs android'), true)
assert.ok(pkgJson.dependencies['@capacitor/ios'])
assert.ok(pkgJson.dependencies['@capacitor/android'])

const envExample = readFileSync(new URL('../.env.example', import.meta.url), 'utf8')
assert.match(envExample, /VITE_STOREKIT=/)
assert.match(envExample, /VITE_ADMOB_APP_ID_IOS=/)
assert.match(envExample, /VITE_ADMOB_INTERSTITIAL_ID_IOS=/)
assert.match(envExample, /VITE_TIP_URL=/)
assert.match(envExample, /VITE_MILL_PACK_URL=/)
assert.match(envExample, /VITE_HARBOR_PACK_URL=/)
assert.match(envExample, /VITE_PLAY_BILLING=\n/)
assert.doesNotMatch(envExample, /VITE_PLAY_BILLING=1/)
assert.doesNotMatch(envExample, /VITE_STOREKIT=1/)
assert.doesNotMatch(envExample, /VITE_ADS_ENABLED=1/)

const capSrc = readFileSync(new URL('../capacitor.config.ts', import.meta.url), 'utf8')
assert.match(capSrc, /ios:/)
assert.match(capSrc, /allowMixedContent:\s*false/)

const manifestSrc = readFileSync(new URL('../android/app/src/main/AndroidManifest.xml', import.meta.url), 'utf8')
assert.match(manifestSrc, /com\.android\.vending\.BILLING/)

const iosPlist = readFileSync(new URL('../ios/App/App/Info.plist', import.meta.url), 'utf8')
assert.match(iosPlist, /Silver City/)
assert.match(iosPlist, /ITSAppUsesNonExemptEncryption/)
const iosProj = readFileSync(
  new URL('../ios/App/App.xcodeproj/project.pbxproj', import.meta.url),
  'utf8',
)
assert.match(iosProj, /PRODUCT_BUNDLE_IDENTIFIER = city.silver.unending/)
assert.match(iosProj, /MARKETING_VERSION = 1.4.87/)
assert.match(iosProj, /CURRENT_PROJECT_VERSION = 99/)

resetBilling()

console.log('check-commerce: ok')
