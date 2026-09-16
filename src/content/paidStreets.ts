import type { EvidenceBrief } from './evidence.ts'
import { SHOP_PACKS } from '../config/commerce.ts'

export interface PaidStreetLesson {
  packId: string
  id: string
  title: string
  place: string
  who: string
  story: string
  brief: EvidenceBrief
}

function streetBrief(
  id: string,
  claim: string,
  reason: string,
  source: string,
  claimMissA: string,
  claimMissB: string,
  reasonMissA: string,
  reasonMissB: string,
): EvidenceBrief {
  return {
    id,
    claim,
    reason,
    source,
    claimChoices: [claim, claimMissA, claimMissB],
    reasonChoices: [reason, reasonMissA, reasonMissB],
  }
}

/**
 * Extra streets sold as packs. Not part of the free 45-fact Easy trail.
 * Plain claims; apologist voice — no slogans, no pew-lock.
 */
export const PAID_STREETS: PaidStreetLesson[] = [
  {
    packId: 'mill-street',
    id: 'ms-bread',
    title: 'Daily bread',
    place: 'Mill Street',
    who: 'Juniper',
    story:
      'On Mill Street the mill turns because grain was given, not because we paid God a wage. Jesus teaches a short ask: give us today our daily bread. That is gift language. Work is real. The loaf is still from the Father’s hand.',
    brief: streetBrief(
      'ms-bread',
      'Daily bread is a gift we ask for, not a wage from God.',
      'Jesus teaches us to ask the Father for bread today.',
      'Matthew 6:9–11',
      'Bread is a paycheck we earn from heaven.',
      'Prayer is how we skip ordinary work.',
      'The Father only feeds people who already paid.',
      'Ask once, then never need a loaf again.',
    ),
  },
  {
    packId: 'harbor-walk',
    id: 'hw-hope',
    title: 'Hope that waits',
    place: 'Harbor Walk',
    who: 'Hope',
    story:
      'Harbor Walk looks out over water you cannot hurry. Paul says hope that is seen is not hope. We wait with patience for what is not yet in hand. That wait is not empty — it stands because the promise stands.',
    brief: streetBrief(
      'hw-hope',
      'Hope waits for what we do not yet see, and still stands.',
      'Paul says we wait with patience for what is unseen.',
      'Romans 8:24–25',
      'Hope is only a feeling when the harbor is pretty.',
      'If you cannot see it, it is not real.',
      'Patience means pretending nothing is promised.',
      'Hope is a slogan you shout at the water.',
    ),
  },
]

export function paidStreetForPack(packId: string): PaidStreetLesson | undefined {
  return PAID_STREETS.find((street) => street.packId === packId)
}

export function paidStreetForLine(id: string): PaidStreetLesson | undefined {
  return PAID_STREETS.find((street) => street.id === id)
}

export function extraStreetPacks() {
  return SHOP_PACKS.filter((pack) => !pack.included)
}
