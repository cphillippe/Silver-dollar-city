import { useSyncExternalStore } from 'react'
import {
  adsAreVisible,
  readAdsPref,
  type AdSlotId,
  AD_SLOTS,
} from '../config/ads'
import { EMPTY_COMMERCE, readCommerce } from '../lib/commerce'
import { SCENE_PAUSE_COPY } from '../config/commerce'

function subscribeAds(onStoreChange: () => void) {
  if (typeof window === 'undefined') return () => {}
  window.addEventListener('storage', onStoreChange)
  window.addEventListener('silver-city-ads', onStoreChange)
  window.addEventListener('silver-city-commerce', onStoreChange)
  return () => {
    window.removeEventListener('storage', onStoreChange)
    window.removeEventListener('silver-city-ads', onStoreChange)
    window.removeEventListener('silver-city-commerce', onStoreChange)
  }
}

export function useAdsVisible() {
  return useSyncExternalStore(subscribeAds, adsAreVisible, () => false)
}

export function useAdsPref() {
  return useSyncExternalStore(subscribeAds, readAdsPref, () => 'default' as const)
}

export function useRemoveAds() {
  return useSyncExternalStore(
    subscribeAds,
    () => readCommerce().removeAds,
    () => false,
  )
}

export function useCommerce() {
  return useSyncExternalStore(subscribeAds, readCommerce, () => EMPTY_COMMERCE)
}

interface AdSlotProps {
  slot: AdSlotId
}

/** Static labeled placeholder — never a live network creative. */
export function AdSlot({ slot }: AdSlotProps) {
  const visible = useAdsVisible()
  if (!visible) return null
  const spec = AD_SLOTS[slot]
  return (
    <aside className={`ad-slot ad-slot-${slot}`} aria-label={`${spec.label} placeholder`}>
      <p className="eyebrow">A quiet pause · not a live ad yet</p>
      <p className="ad-slot-label">{spec.label}</p>
      <p className="quiet">{spec.where}</p>
      <p className="quiet">{SCENE_PAUSE_COPY}</p>
    </aside>
  )
}
