/**
 * Freemium SKUs and shop copy.
 *
 * Play Billing plug-in (later — do not add a second gate):
 * 1. Add a Play Billing plugin (for example @capacitor-community/in-app-purchases).
 * 2. Product IDs below must match Play Console. Do not rename without a migration.
 * 3. On purchase or restore success, call `grantRemoveAds()` or `grantPack(id)`
 *    in `src/lib/commerce.ts`. Those are the same flags the web stub sets.
 * 4. Core Easy trail (Learn → play → Hold, 39 facts) ignores these flags except
 *    to hide between-scene ads and to open extra streets.
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
  'Street Packs · Remove ads · Progress stays on this device (export/import)'

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
