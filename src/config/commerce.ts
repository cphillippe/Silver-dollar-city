/**
 * Freemium SKUs and shop copy.
 *
 * StoreKit + Play Billing adapters (`src/lib/iapAdapter.ts`):
 * 1. One-time: add the store plugin, set VITE_PLAY_BILLING=1 (Android) or
 *    VITE_STOREKIT=1 (iOS). Same SKUs. Same grantRemoveAds / grantPack.
 * 2. Product IDs below must match Play Console and App Store Connect.
 * 3. On purchase or restore success, call `grantRemoveAds()` or `grantPack(id)`
 *    — CheckoutSheet / checkoutOffer already do that. Do not add a second gate.
 * 4. Core Easy trail (Learn → play → Hold, 45 facts) ignores these flags except
 *    to hide between-scene ads and to open extra streets.
 * Blank flags keep the cannotCharge demo. No store money until plugin + flags.
 */

export const COMMERCE_KEY = 'silver-city-commerce-v1'

export const PLAY_SKUS = {
  removeAds: 'city.silver.unending.removeads',
  millStreet: 'city.silver.unending.pack.mill',
  harborWalk: 'city.silver.unending.pack.harbor',
} as const

export const CORE_PACK_ID = 'core-v0'

export interface ShopPack {
  id: string
  sku: string
  title: string
  street: string
  blurb: string
  priceLabel: string
  included: boolean
  lineId?: string
}

export const SHOP_PACKS: ShopPack[] = [
  {
    id: CORE_PACK_ID,
    sku: 'core_trail_free',
    title: 'Core Easy trail',
    street: 'Story Creek → Hold',
    blurb: 'Learn → play → Hold. Mercy, creed, and the foundation walks stay free. Never a paywall.',
    priceLabel: 'Free',
    included: true,
  },
  {
    id: 'mill-street',
    sku: PLAY_SKUS.millStreet,
    title: 'Mill Street',
    street: 'Mill Street',
    blurb: 'New street. Same trail. More lines you can still say tomorrow.',
    priceLabel: '$1.99',
    included: false,
    lineId: 'ms-bread',
  },
  {
    id: 'harbor-walk',
    sku: PLAY_SKUS.harborWalk,
    title: 'Harbor Walk',
    street: 'Harbor Walk',
    blurb: 'New street. Same trail. More lines you can still say tomorrow.',
    priceLabel: '$1.99',
    included: false,
    lineId: 'hw-hope',
  },
]

export const TRAIL_NAME = 'Silver City: Unending Evidence'
export const TRAIL_SUBTITLE = 'Puzzle trail. Fold the page. Keep the evidence.'
export const SCENE_PAUSE_COPY =
  'A quiet pause on the trail. The walk continues in a moment.'
export const PACK_LINE =
  'New street. Same trail. More lines you can still say tomorrow.'
export const SETTINGS_SUPPORT_LINE =
  'Tip · Packs (external) · stores coming later'

export function packPaywallLine(packName: string): string {
  return `You’ve kept the first streets. Unlock ${packName} for new walks — everything you’ve already held stays free.`
}

export const REMOVE_ADS_PRODUCT = {
  id: 'remove-ads',
  sku: PLAY_SKUS.removeAds,
  title: 'Keep the quiet trail — Remove ads',
  blurb: 'Keep the quiet trail — Remove ads. Soft pauses between home and a lesson go away. Journal, Hold, and the core trail stay open either way.',
  priceLabel: '$2.99',
} as const

export function paidPacks(): ShopPack[] {
  return SHOP_PACKS.filter((pack) => !pack.included)
}

export function shopPack(id: string): ShopPack | undefined {
  return SHOP_PACKS.find((pack) => pack.id === id)
}
