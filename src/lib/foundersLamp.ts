import type { ProgressState } from '../types'

/** Last local day that still receives the free Founder's Lamp. */
export const FOUNDERS_LAMP_UNTIL = '2027-01-06'

export const FOUNDERS_GIFT_LINE =
  "A gift: the Founder's Lamp is yours. Thank you for coming early."

/**
 * True when this save's first local day is on or before Jan 6, 2027.
 * Web and Play use the same rule. It is not a purchase.
 */
export function foundersLamp(progress: { firstSeen?: string }): boolean {
  return Boolean(progress.firstSeen && progress.firstSeen <= FOUNDERS_LAMP_UNTIL)
}

export function activeLampStyle(
  progress: Pick<ProgressState, 'firstSeen' | 'lampStyle'>,
): 'classic' | 'founders' {
  return progress.lampStyle === 'founders' && foundersLamp(progress) ? 'founders' : 'classic'
}
