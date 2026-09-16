/**
 * Store / ads connect flags. Blank env keeps the 1.4.75 demo path
 * (`cannotCharge`). Fill once in Play Console + AdMob — no weekly Bill work.
 * Do not claim store money until a plugin AND these flags are live.
 */

import { adsEnabledDefault } from './ads.ts'
import { PLAY_SKUS } from './commerce.ts'

export interface StoreFlags {
  playBilling: boolean
  adsEnabled: boolean
  admobAppId: string
  interstitialUnitId: string
}

const EMPTY_FLAGS: StoreFlags = {
  playBilling: false,
  adsEnabled: false,
  admobAppId: '',
  interstitialUnitId: '',
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
    adsEnabled:
      testFlags?.adsEnabled ?? (adsEnabledDefault || truthy(readVite('VITE_ADS_ENABLED'))),
    admobAppId: testFlags?.admobAppId ?? readVite('VITE_ADMOB_APP_ID'),
    interstitialUnitId: testFlags?.interstitialUnitId ?? readVite('VITE_ADMOB_INTERSTITIAL_ID'),
  }
}

/** SKUs Play Console must match. Env does not rename them — migration if they change. */
export function billedSkus(): string[] {
  return [PLAY_SKUS.removeAds, PLAY_SKUS.millStreet, PLAY_SKUS.harborWalk]
}

export function resetStoreFlagsForTest() {
  testFlags = null
}

export { EMPTY_FLAGS }
