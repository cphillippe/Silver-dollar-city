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
    blurb:
      'Learn → play → Lock In. Mercy, creed, and the foundation walks stay free. Everything you already held stays yours — never a paywall.',
    priceLabel: 'Free',
    included: true,
  },
  {
    id: 'mill-street',
    sku: PLAY_SKUS.millStreet,
    title: 'Mill Street',
    street: 'Mill Street',
    blurb:
      'Optional new street when you’re ready. Same trail home. Fresh lines you can still say tomorrow — Mill joins after you earn the early walks.',
    priceLabel: '$1.99',
    included: false,
    lineId: 'ms-bread',
  },
  {
    id: 'harbor-walk',
    sku: PLAY_SKUS.harborWalk,
    title: 'Harbor Walk',
    street: 'Harbor Walk',
    blurb:
      'Optional shore street when you’re ready. Same trail home. Fresh hope lines for tomorrow — Harbor joins after you earn the early walks.',
    priceLabel: '$1.99',
    included: false,
    lineId: 'hw-hope',
  },
]

export const TRAIL_NAME = 'Silver City: Unending Evidence'
export const TRAIL_SUBTITLE = 'Puzzle trail. Fold the page. Keep the evidence.'
export const SCENE_PAUSE_COPY =
  'A quiet pause between scenes. The walk continues in a moment — never over Match, Lock In, Dig, or Journal.'
export const PACK_LINE =
  'Optional new street. Same trail home. More lines you can still say tomorrow.'
export const SETTINGS_SUPPORT_LINE =
  'Tip anytime · wishlist Mill & Harbor · remove-ads Coming with stores'

export function packPaywallLine(packName: string): string {
  return `You’ve kept the first streets free. Unlock ${packName} for new walks when you’re ready — Journal and everything you’ve already held stay open.`
}

export const REMOVE_ADS_PRODUCT = {
  id: 'remove-ads',
  sku: PLAY_SKUS.removeAds,
  title: 'Keep the quiet trail — Remove ads',
  blurb:
    'Keep the quiet trail. Soft pauses between Home and a lesson go away. Journal, Lock In, and the core trail stay open either way.',
  priceLabel: '$2.99',
} as const

export function paidPacks(): ShopPack[] {
  return SHOP_PACKS.filter((pack) => !pack.included)
}

export function shopPack(id: string): ShopPack | undefined {
  return SHOP_PACKS.find((pack) => pack.id === id)
}
