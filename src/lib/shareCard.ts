import { PAGES_APP_URL } from '../config/shell.ts'

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

/**
 * Share the line, then the clipboard.
 * A cancel is not a failure: it falls through the same way Share a morning does.
 * A canvas image is skipped; measuring text for a 1080×1350 PNG is a later pass.
 */
export async function shareLine(learning: ShareLine): Promise<ShareResult> {
  const text = shareCardText(learning)
  const url = shareCardUrl()
  const title = 'Say it back tomorrow'
  try {
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      await navigator.share({ title, text, url })
      return 'shared'
    }
  } catch {
    /* cancel or unsupported — try the clipboard */
  }
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
