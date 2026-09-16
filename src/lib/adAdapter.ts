/**
 * Between-scene interstitial adapter. Runs only when adsEnabled + unit id
 * + plugin are present. Soft SceneAd pause is the fallback.
 * Never covers Match / Hold / arcade / source-dig / Journal.
 */

import { scenePauseMountsOn } from '../config/ads.ts'
import { storeFlags } from '../config/store.ts'
import { readCommerce } from './commerce.ts'

export type InterstitialResult = 'shown' | 'failed' | 'skipped'

export interface InterstitialPlugin {
  prepare(unitId: string): Promise<void>
  show(): Promise<InterstitialResult>
}

export type BetweenSceneAd = 'live' | 'soft' | 'skip'

let injected: InterstitialPlugin | undefined

export function setAdPluginForTest(plugin: InterstitialPlugin | undefined) {
  injected = plugin
}

function isPlugin(raw: unknown): raw is InterstitialPlugin {
  if (!raw || typeof raw !== 'object') return false
  const value = raw as Record<string, unknown>
  return typeof value.prepare === 'function' && typeof value.show === 'function'
}

function capacitorPlugin(): InterstitialPlugin | undefined {
  if (typeof window === 'undefined') return undefined
  const cap = (
    window as unknown as {
      Capacitor?: { Plugins?: Record<string, unknown> }
    }
  ).Capacitor
  const plugins = cap?.Plugins
  if (!plugins) return undefined
  const candidate = plugins.AdMob ?? plugins.InterstitialAd ?? plugins.Ads
  return isPlugin(candidate) ? candidate : undefined
}

export function readAdPlugin(): InterstitialPlugin | undefined {
  if (injected) return injected
  return capacitorPlugin()
}

export function liveInterstitialConfigured(): boolean {
  const flags = storeFlags()
  return flags.adsEnabled && flags.interstitialUnitId.length > 0
}

export function liveInterstitialReady(): boolean {
  if (readCommerce().removeAds) return false
  if (!liveInterstitialConfigured()) return false
  return Boolean(readAdPlugin())
}

function neverCover(viewName: string): boolean {
  return (
    viewName === 'link' ||
    viewName === 'journal' ||
    viewName === 'learn' ||
    viewName === 'daily' ||
    viewName === 'challenge' ||
    viewName === 'pack-street' ||
    viewName === 'defend'
  )
}

/**
 * Live unit only on Home. Anywhere else: skip (do not fall through to a
 * pause over Match / Hold / arcade / source-dig / Journal).
 */
export async function showBetweenSceneInterstitial(viewName: string): Promise<BetweenSceneAd> {
  if (!scenePauseMountsOn(viewName) || neverCover(viewName)) return 'skip'
  if (readCommerce().removeAds) return 'skip'
  if (!liveInterstitialReady()) return 'soft'
  const plugin = readAdPlugin()
  const unitId = storeFlags().interstitialUnitId
  if (!plugin || !unitId) return 'soft'
  try {
    await plugin.prepare(unitId)
    const shown = await plugin.show()
    if (shown === 'shown') return 'live'
    if (shown === 'skipped') return 'soft'
    return 'soft'
  } catch {
    return 'soft'
  }
}

export function resetAdAdapterForTest() {
  injected = undefined
}
