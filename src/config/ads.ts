/**
 * Soft ads for V0 freemium.
 *
 * Live ad-network SDK is still off (`adsEnabledDefault`). Between-scene
 * pauses are in-app copy, dismissible, and never mount over Match / Hold /
 * arcade play. Remove-ads (supporter IAP / web stub) hides them.
 */

import { readCommerce } from '../lib/commerce.ts'

export const ADS_PREF_KEY = 'silver-city-ads'

/** Product flag for a later network SDK. false until a real unit is wired. */
export const adsEnabledDefault = false

/** Unpaid players see a dismissible pause between home and a lesson. */
export const softAdsDefault = true

export const AD_SLOTS = {
  'between-scenes': {
    id: 'between-scenes',
    label: 'Between scenes',
    where: 'Home ↔ lesson transitions only — never over Match, Hold, or arcade play',
  },
} as const

export type AdSlotId = keyof typeof AD_SLOTS

/** Controls and screens that must never be covered or replaced by an ad. */
export const ADS_NEVER_COVER = [
  'Keep / Toss tiles and Lock in the sort',
  'Takeaway / RecallGate claim chips',
  'Journal due cards and takeaway',
  'Held Journal / evidence pages',
  'Match boards (gem panel-blast and extras)',
  'Hold Why Blast chips',
  'Arcade play (claim-merge, panel-blast, father-run, road-maze, source-dig)',
  'Puzzle boards (sequence, match, sort, argument)',
  'What’s next footer on Map (ads sit between scenes, not as overlays on play)',
] as const

export type AdsPref = 'on' | 'off' | 'default'

export function readAdsPref(): AdsPref {
  if (typeof localStorage === 'undefined') return 'default'
  const raw = localStorage.getItem(ADS_PREF_KEY)
  if (raw === 'on' || raw === 'off') return raw
  return 'default'
}

export function softAdsVisible(
  pref: AdsPref = readAdsPref(),
  removeAds = readCommerce().removeAds,
): boolean {
  if (removeAds) return false
  if (pref === 'off') return false
  if (pref === 'on') return true
  return softAdsDefault
}

/** @deprecated Use softAdsVisible — kept so older tests/docs still compile. */
export function adsAreVisible(pref: AdsPref = readAdsPref()): boolean {
  return softAdsVisible(pref)
}

export function writeAdsPref(pref: AdsPref) {
  if (typeof localStorage === 'undefined') return
  if (pref === 'default') localStorage.removeItem(ADS_PREF_KEY)
  else localStorage.setItem(ADS_PREF_KEY, pref)
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('silver-city-ads'))
  }
}

export type ViewName = string

const HOME = new Set(['hub'])
const LESSON = new Set(['learn', 'link', 'daily', 'challenge', 'pack-street'])
const NEVER = new Set(['journal', 'settings', 'profile', 'shop', 'welcome', 'defend', 'vista', 'area'])

/** Soft ads only between home and a lesson — never Journal, never play chrome. */
export function isBetweenSceneTransition(fromName: ViewName, toName: ViewName): boolean {
  if (fromName === toName) return false
  if (NEVER.has(fromName) || NEVER.has(toName)) return false
  return (HOME.has(fromName) && LESSON.has(toName)) || (LESSON.has(fromName) && HOME.has(toName))
}
