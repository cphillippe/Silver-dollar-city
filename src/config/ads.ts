/**
 * Soft ads for V0 freemium.
 *
 * Live interstitial runs only from `src/lib/adAdapter.ts` when adsEnabled
 * + a unit id + plugin are present. The quiet pause is an allow-list:
 * it may run only on a clean Home return after a finished scene, once the
 * win plate / Lock In recap is already closed, and only after cooldown.
 * It never starts on the way into a lesson, and never during or on the way
 * out of Match, Lock In, Dig, Journal, Night Watch, arcade, source-dig,
 * teach, settings, or first run. Remove-ads hides both.
 */

import { readCommerce } from '../lib/commerce.ts'

export const ADS_PREF_KEY = 'silver-city-ads'

/** Product flag for a later network SDK. false until a real unit is wired. */
export const adsEnabledDefault = false

/** Unpaid players may see a dismissible pause after a finished scene lands Home. */
export const softAdsDefault = true

export const AD_SLOTS = {
  'between-scenes': {
    id: 'between-scenes',
    label: 'Between scenes',
    where:
      'Home only, after a finished scene — never over Match, Lock In, Dig, Journal, Night Watch, arcade, source-dig, teach, settings, or first run',
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
  'Arcade play (claim-merge, panel-blast, father-run, road-maze, source-dig, story-snap)',
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

/**
 * Route slice `go()` can see. Play mechanics are not their own views:
 * Match, arcade, and source-dig all use `link`. Lock In quiz is `journal`
 * with `autoQuiz`. Say this tomorrow is `journal` with `sceneRecap`.
 */
export interface QuietPauseRoute {
  name: string
  autoQuiz?: boolean
  focusId?: string
  /**
   * Set only by the Lock In same-proof recap. Home from that screen is the
   * clean landing after LOCKED! and Say this tomorrow. Opening a stored
   * line from the map does not set this.
   */
  sceneRecap?: boolean
  /**
   * Set only by a finished daily or challenge Town return. A back button
   * during the scene leaves this off, so the pause does not fire mid-play.
   */
  afterScene?: boolean
}

/**
 * BLOCK — never during, and never on the way out (including Home).
 * `link` is Match plus every arcade and source-dig mechanic.
 * Dig deeper has no route; it sits on these screens.
 * `learn` is teach. `journal` is Lock In, Journal, and the recap
 * (the recap’s Home landing is the one exception in `quietPauseAllowed`).
 * `defend` is Night Watch. `welcome` is first run.
 */
export const QUIET_PAUSE_BLOCKED_VIEWS = [
  'link',
  'learn',
  'journal',
  'defend',
  'settings',
  'welcome',
  'shop',
  'profile',
  'vista',
  'area',
  'pack-street',
] as const

/** Mechanics that share `link`. Leaving any of them is leaving Match’s view. */
export const QUIET_PAUSE_LINK_PLAYS = [
  'match',
  'panel-blast',
  'father-run',
  'road-maze',
  'claim-merge',
  'story-snap',
  'source-dig',
] as const

/**
 * ALLOW — Home returns after the scene’s own win line is already up.
 * Daily and challenge keep the takeaway on that view, then Town return
 * sets `afterScene`. Anything else stays denied.
 */
export const QUIET_PAUSE_SCENE_RETURNS = ['daily', 'challenge'] as const

const BLOCKED = new Set<string>(QUIET_PAUSE_BLOCKED_VIEWS)
const SCENE_RETURNS = new Set<string>(QUIET_PAUSE_SCENE_RETURNS)

/**
 * Easy Lock In quiz is not a between-scene break.
 * A correct why must show LOCKED!, then the same-proof recap.
 * The quiet pause does not run on the way out of that quiz.
 */
export function lockInQuizBlocksPause(viewName: ViewName, autoQuiz = false): boolean {
  return viewName === 'journal' && autoQuiz
}

/**
 * Quiet pause may start for this navigation.
 * Cooldown, ads pref, and remove-ads stay in `App.go()` — this is only the allow-list.
 *
 * Allow:
 * - Lock In same-proof recap → Home (`sceneRecap`). The recap closes and Home
 *   is what mounts; the pause is not on the quiz or on Say this tomorrow.
 * - Finished daily or challenge → Home (`afterScene`). Not the back button.
 *
 * Block:
 * - Home → lesson (no enter pause).
 * - Match / arcade / source-dig (`link`), teach (`learn`), Night Watch (`defend`).
 * - Lock In quiz (`journal` + autoQuiz), Journal list, and a stored line that
 *   is not the Lock In recap.
 * - Settings, first run, shop, profile, vista, area, pack street.
 * - Dig: no view of its own; source-dig is `link`, and Dig deeper is on blocked screens.
 */
export function quietPauseAllowed(from: QuietPauseRoute, to: QuietPauseRoute): boolean {
  if (to.name !== 'hub') return false
  if (from.name === to.name) return false
  if (lockInQuizBlocksPause(from.name, from.autoQuiz === true)) return false
  if (from.name === 'journal' && from.sceneRecap === true) return true
  if (BLOCKED.has(from.name)) return false
  return SCENE_RETURNS.has(from.name) && to.afterScene === true
}

/**
 * Name-only pair. Recap and Town-return flags are invisible here, so this
 * stays false for every bare view name. Prefer `quietPauseAllowed`.
 */
export function isBetweenSceneTransition(fromName: ViewName, toName: ViewName): boolean {
  return quietPauseAllowed({ name: fromName }, { name: toName })
}

/** SceneAd may mount only on Home — never over Match, Hold, arcade, source-dig, Journal. */
export function scenePauseMountsOn(viewName: ViewName): boolean {
  return viewName === 'hub'
}
