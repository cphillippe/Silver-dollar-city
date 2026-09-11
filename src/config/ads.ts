/**
 * Ad placements for a later network. Playtest default is off.
 * Never mount these over Keep/Toss, the takeaway step, RecallGate, or Journal due cards.
 */

export const ADS_PREF_KEY = 'silver-city-ads'

/** Product flag. false until a real unit is wired. */
export const adsEnabledDefault = false

export const AD_SLOTS = {
  'hub-banner': {
    id: 'hub-banner',
    label: 'Hub banner',
    where: 'Map, under Today’s Trail, above the district list',
  },
  'between-districts': {
    id: 'between-districts',
    label: 'Between districts',
    where: 'Map, once between Story Creek and Witness Square',
  },
  'after-daily': {
    id: 'after-daily',
    label: 'After Daily complete',
    where: 'Today’s Trail teaser screen only — after the takeaway is chosen',
  },
} as const

export type AdSlotId = keyof typeof AD_SLOTS

/** Controls and screens that must never be covered or replaced by an ad. */
export const ADS_NEVER_COVER = [
  'Keep / Toss tiles and Lock in the sort',
  'Takeaway / RecallGate claim chips',
  'Journal due cards and takeaway',
  'Puzzle boards (sequence, match, sort, argument)',
  'What’s next footer on Map (ads sit in flow, not as overlays)',
] as const

export type AdsPref = 'on' | 'off' | 'default'

export function readAdsPref(): AdsPref {
  if (typeof localStorage === 'undefined') return 'default'
  const raw = localStorage.getItem(ADS_PREF_KEY)
  if (raw === 'on' || raw === 'off') return raw
  return 'default'
}

export function adsAreVisible(pref: AdsPref = readAdsPref()): boolean {
  if (pref === 'on') return true
  if (pref === 'off') return false
  return adsEnabledDefault
}

export function writeAdsPref(pref: AdsPref) {
  if (typeof localStorage === 'undefined') return
  if (pref === 'default') localStorage.removeItem(ADS_PREF_KEY)
  else localStorage.setItem(ADS_PREF_KEY, pref)
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('silver-city-ads'))
  }
}
