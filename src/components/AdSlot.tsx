import { useSyncExternalStore } from 'react'
import {
  adsAreVisible,
  readAdsPref,
  type AdSlotId,
  AD_SLOTS,
} from '../config/ads'

function subscribeAds(onStoreChange: () => void) {
  if (typeof window === 'undefined') return () => {}
  window.addEventListener('storage', onStoreChange)
  window.addEventListener('silver-city-ads', onStoreChange)
  return () => {
    window.removeEventListener('storage', onStoreChange)
    window.removeEventListener('silver-city-ads', onStoreChange)
  }
}

export function useAdsVisible() {
  return useSyncExternalStore(subscribeAds, adsAreVisible, () => false)
}

export function useAdsPref() {
  return useSyncExternalStore(subscribeAds, readAdsPref, () => 'default' as const)
}

interface AdSlotProps {
  slot: AdSlotId
}

export function AdSlot({ slot }: AdSlotProps) {
  const visible = useAdsVisible()
  if (!visible) return null
  const spec = AD_SLOTS[slot]
  return (
    <aside className={`ad-slot ad-slot-${slot}`} aria-label={`${spec.label} placeholder`}>
      <p className="eyebrow">Ad slot · not live</p>
      <p className="ad-slot-label">{spec.label}</p>
      <p className="quiet">{spec.where}</p>
    </aside>
  )
}
