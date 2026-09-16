/**
 * Store / ads connect flags. Blank env keeps the 1.4.75 demo path
 * (`cannotCharge`). Fill once in App Store Connect + Play Console + AdMob
 * — no weekly Bill work. Do not claim store money until a plugin AND these
 * flags are live.
 */

import { adsEnabledDefault } from './ads.ts'
import { PLAY_SKUS } from './commerce.ts'
import { storeSurface } from '../lib/nativeStore.ts'

export interface StoreFlags {
  playBilling: boolean
  storeKit: boolean
  adsEnabled: boolean
  admobAppId: string
  admobAppIdIos: string
  interstitialUnitId: string
  interstitialUnitIdIos: string
}

const EMPTY_FLAGS: StoreFlags = {
  playBilling: false,
  storeKit: false,
  adsEnabled: false,
  admobAppId: '',
  admobAppIdIos: '',
  interstitialUnitId: '',
  interstitialUnitIdIos: '',
}

let testFlags: Partial<StoreFlags> | null = null

function readVite(key: string): string {
  try {
    const env = (import.meta as ImportMeta).env as Record<string, string | undefined>
    const raw = env?.[key]
    return typeof raw === 'string' ? raw.trim() : ''
  } catch {
    return ''
  }
}

function truthy(raw: string): boolean {
  const value = raw.toLowerCase()
  return value === '1' || value === 'true' || value === 'yes' || value === 'on'
}

export function setStoreFlagsForTest(next: Partial<StoreFlags> | null) {
  testFlags = next
}

export function storeFlags(): StoreFlags {
  return {
    playBilling: testFlags?.playBilling ?? truthy(readVite('VITE_PLAY_BILLING')),
    storeKit: testFlags?.storeKit ?? truthy(readVite('VITE_STOREKIT')),
    adsEnabled:
      testFlags?.adsEnabled ?? (adsEnabledDefault || truthy(readVite('VITE_ADS_ENABLED'))),
    admobAppId: testFlags?.admobAppId ?? readVite('VITE_ADMOB_APP_ID'),
    admobAppIdIos: testFlags?.admobAppIdIos ?? readVite('VITE_ADMOB_APP_ID_IOS'),
    interstitialUnitId: testFlags?.interstitialUnitId ?? readVite('VITE_ADMOB_INTERSTITIAL_ID'),
    interstitialUnitIdIos:
      testFlags?.interstitialUnitIdIos ?? readVite('VITE_ADMOB_INTERSTITIAL_ID_IOS'),
  }
}

/** App id / interstitial for the current store. iOS prefers the _IOS keys. */
export function liveAdmobIds(surface = storeSurface()): { appId: string; unitId: string } {
  const flags = storeFlags()
  if (surface === 'app-store') {
    return {
      appId: flags.admobAppIdIos || flags.admobAppId,
      unitId: flags.interstitialUnitIdIos || flags.interstitialUnitId,
    }
  }
  return { appId: flags.admobAppId, unitId: flags.interstitialUnitId }
}

/** SKUs Play Console and App Store Connect must match. Env does not rename them. */
export function billedSkus(): string[] {
  return [PLAY_SKUS.removeAds, PLAY_SKUS.millStreet, PLAY_SKUS.harborWalk]
}

export function resetStoreFlagsForTest() {
  testFlags = null
}

export { EMPTY_FLAGS }
