import type { Area, Challenge, JournalEntry } from '../types'
import { firstGate } from './firstGate'
import { highLookout } from './highLookout'
import { journalEntries } from './journal'
import { observatory } from './observatory'
import { parableHollow } from './parableHollow'
import { witnessBench } from './witnessBench'

export const areas: Area[] = [
  parableHollow,
  witnessBench,
  observatory,
  firstGate,
  highLookout,
]

export { journalEntries }

export function getArea(id: string): Area | undefined {
  return areas.find((area) => area.id === id)
}

export function getChallenge(
  areaId: string,
  challengeId: string,
): Challenge | undefined {
  return getArea(areaId)?.challenges.find((challenge) => challenge.id === challengeId)
}

export function getJournalEntry(id: string): JournalEntry | undefined {
  return journalEntries.find((entry) => entry.id === id)
}

export function journalForChallenge(challengeId: string): JournalEntry | undefined {
  return journalEntries.find((entry) => entry.unlockAfter === challengeId)
}

export function journalForArea(areaId: string): JournalEntry[] {
  return journalEntries.filter((entry) => entry.areaId === areaId)
}

export const totalChallenges = areas.reduce(
  (sum, area) => sum + area.challenges.length,
  0,
)

export const totalJournal = journalEntries.length
