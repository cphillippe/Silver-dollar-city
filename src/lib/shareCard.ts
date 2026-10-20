import { Share } from '@capacitor/share'
import { Capacitor } from '@capacitor/core'
import { inAndroidShell, PAGES_APP_URL } from '../config/shell.ts'

/** On-device share counts. Nothing is sent until a first-party counter exists. */
export const SHARE_COUNT_KEY = 'silver-city-share-v1'

export interface ShareCounts {
  recaps: number
  taps: number
}

const EMPTY: ShareCounts = { recaps: 0, taps: 0 }

export interface ShareLine {
  claim: string
  reason: string
  source: string
}

/** Pages origin plus the share-card campaign. Never the current location. */
export function shareCardUrl(): string {
  const url = new URL(PAGES_APP_URL)
  url.search = ''
  url.hash = ''
  url.searchParams.set('utm_source', 'share')
  url.searchParams.set('utm_medium', 'referral')
  url.searchParams.set('utm_campaign', 'sayitback')
  return url.toString()
}

/** Text handed to the share sheet or the clipboard. No score and no dare. */
export function shareCardText(learning: ShareLine): string {
  return `Say it back tomorrow:\n“${learning.claim}”\nWhy: ${learning.reason}\nFrom: ${learning.source}\n${shareCardUrl()}`
}

export function readShareCounts(): ShareCounts {
  try {
    const raw = globalThis.localStorage?.getItem(SHARE_COUNT_KEY)
    if (!raw) return { ...EMPTY }
    const parsed = JSON.parse(raw) as Partial<ShareCounts>
    const recaps = Number(parsed.recaps)
    const taps = Number(parsed.taps)
    return {
      recaps: Number.isFinite(recaps) && recaps > 0 ? recaps : 0,
      taps: Number.isFinite(taps) && taps > 0 ? taps : 0,
    }
  } catch {
    return { ...EMPTY }
  }
}

function writeShareCounts(next: ShareCounts) {
  try {
    globalThis.localStorage?.setItem(SHARE_COUNT_KEY, JSON.stringify(next))
  } catch {
    /* private mode */
  }
}

/** A recap card mounted. */
export function noteShareRecap() {
  const current = readShareCounts()
  writeShareCounts({ ...current, recaps: current.recaps + 1 })
}

/** The share button was pressed. */
export function noteShareTap() {
  const current = readShareCounts()
  writeShareCounts({ ...current, taps: current.taps + 1 })
}

/** taps / recaps. Zero when no recap has mounted. For a future dashboard. */
export function shareTapRate(): number {
  const { recaps, taps } = readShareCounts()
  if (recaps <= 0) return 0
  return taps / recaps
}

export type ShareResult = 'shared' | 'copied' | 'idle'

const SHARE_TITLE = 'Say it back tomorrow'
/** Native share must answer quickly. Old WebViews never get a bridge. */
export const SHARE_NATIVE_TIMEOUT_MS = 3000
let shareNativeTimeoutMs = SHARE_NATIVE_TIMEOUT_MS
/** True from the moment Share.share or navigator.share is called until it settles. */
let sharing = false

/** Tests shorten the hang. Production stays at SHARE_NATIVE_TIMEOUT_MS. */
export function setShareNativeTimeoutForTest(ms: number | null) {
  shareNativeTimeoutMs = ms == null ? SHARE_NATIVE_TIMEOUT_MS : ms
}

function injectedNativePlatform(): boolean | null {
  if (typeof window === 'undefined') return null
  const cap = (window as Window & { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor
  if (typeof cap?.isNativePlatform === 'function') return cap.isNativePlatform()
  if (typeof Capacitor.isNativePlatform === 'function') return Capacitor.isNativePlatform()
  return null
}

/** Android shell, and Capacitor's native check when that helper exists. */
function shouldUseNativeShare(): boolean {
  if (!inAndroidShell()) return false
  const native = injectedNativePlatform()
  return native !== false
}

/** The share-only listener is window.androidBridge. Missing means an old WebView. */
function nativeBridgePresent(): boolean {
  if (typeof window === 'undefined') return false
  return (window as Window & { androidBridge?: unknown }).androidBridge != null
}

function isShareTimeout(error: unknown): boolean {
  return error instanceof Error && error.name === 'ShareTimeout'
}

function withTimeout<T>(work: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      const error = new Error('share timed out')
      error.name = 'ShareTimeout'
      reject(error)
    }, ms)
    work.then(
      (value) => {
        clearTimeout(timer)
        resolve(value)
      },
      (error) => {
        clearTimeout(timer)
        reject(error)
      },
    )
  })
}

/** A closed sheet is not a failure and must not toast or copy. */
function isShareCancel(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false
  const name = 'name' in error ? String(error.name) : ''
  if (name === 'AbortError') return true
  const message = 'message' in error ? String(error.message) : ''
  const lower = message.toLowerCase()
  return lower.includes('cancel') || lower.includes('abort')
}

async function copyShareText(text: string): Promise<ShareResult> {
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
      return 'copied'
    }
  } catch {
    return 'idle'
  }
  return 'idle'
}

/** Website path: navigator.share, then the clipboard. A cancel stays quiet. */
async function shareOnTheWeb(title: string, text: string, url: string): Promise<ShareResult> {
  try {
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      sharing = true
      try {
        await navigator.share({ title, text, url })
        return 'shared'
      } finally {
        sharing = false
      }
    }
  } catch (error) {
    if (isShareCancel(error)) return 'idle'
  }
  return copyShareText(text)
}

/**
 * In the Android shell, open the share sheet through @capacitor/share.
 * On the web, use navigator.share, then the clipboard.
 * The 3s timer covers a bridge that never answers. Any reply, including the
 * launch ack, returns here and must not open a second sheet or copy.
 * A cancel shows nothing. A thrown native plugin falls back to the copied toast.
 * A second call while the sheet is still opening copies the same line.
 * A canvas image is skipped; measuring text for a 1080×1350 PNG is a later pass.
 */
export async function shareLine(learning: ShareLine): Promise<ShareResult> {
  if (sharing) return copyShareText(shareCardText(learning))
  const text = shareCardText(learning)
  const url = shareCardUrl()
  const title = SHARE_TITLE
  if (shouldUseNativeShare() && nativeBridgePresent()) {
    try {
      sharing = true
      try {
        await withTimeout(Share.share({ title, text, url }), shareNativeTimeoutMs)
        return 'shared'
      } finally {
        sharing = false
      }
    } catch (error) {
      if (isShareCancel(error)) return 'idle'
      if (!isShareTimeout(error)) return copyShareText(text)
    }
  }
  return shareOnTheWeb(title, text, url)
}
