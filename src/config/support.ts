/**
 * Store-free Pages support. Bill can edit the constants below, or set
 * VITE_TIP_URL / VITE_MILL_PACK_URL / VITE_HARBOR_PACK_URL.
 * Do not flip VITE_PLAY_BILLING / VITE_STOREKIT / VITE_ADS_ENABLED here.
 */

export const TIP_URL = 'https://ko-fi.com/'
export const MILL_PACK_URL = 'https://ko-fi.com/'
export const HARBOR_PACK_URL = 'https://ko-fi.com/'

export const SUPPORT_HEADING = 'Support Silver City'
export const SUPPORT_LINE = 'Tip · Packs (external) · stores coming later'
export const TIP_CTA = 'Tip'
export const TIP_BLURB =
  'A small tip keeps the trail growing. Easy stays free. Journal stays open.'
export const STORES_COMING = 'Remove ads · Coming with stores'
export const TIP_TOAST = 'A tip keeps the trail growing. Easy stays free.'
export const MILL_PACK_CTA = 'Mill Street'
export const HARBOR_PACK_CTA = 'Harbor Walk'
export const PACKS_EXTERNAL_LINE =
  'Street Packs: Mill Street and Harbor Walk are extra streets. Until stores return, these open a wishlist page — not a paywall.'

function readVite(key: string): string {
  try {
    const env = (import.meta as ImportMeta).env as Record<string, string | undefined>
    const raw = env?.[key]
    return typeof raw === 'string' ? raw.trim() : ''
  } catch {
    return ''
  }
}

export function supportUrls(): { tip: string; mill: string; harbor: string } {
  return {
    tip: readVite('VITE_TIP_URL') || TIP_URL,
    mill: readVite('VITE_MILL_PACK_URL') || MILL_PACK_URL,
    harbor: readVite('VITE_HARBOR_PACK_URL') || HARBOR_PACK_URL,
  }
}
