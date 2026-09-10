import type { Area, Challenge, JournalEntry } from '../types'
import { DAILY_POOL } from './daily'
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
export { CHANGELOG, latestChange } from './changelog'
export { CONTENT_PACKS, packForArea } from './packs'

export function getArea(id: string): Area | undefined {
  return areas.find((area) => area.id === id)
}

export function getChallenge(
  areaId: string,
  challengeId: string,
): Challenge | undefined {
  return getArea(areaId)?.challenges.find((challenge) => challenge.id === challengeId)
}

export function findPlayable(
  id: string,
): { areaId: string; challenge: Challenge } | undefined {
  for (const area of areas) {
    const challenge = area.challenges.find((item) => item.id === id)
    if (challenge) return { areaId: area.id, challenge }
  }
  const daily = DAILY_POOL.find((item) => item.challenge.id === id)
  if (daily) {
    return { areaId: pillarFor(id), challenge: daily.challenge }
  }
  return undefined
}

const DAILY_PILLAR: Record<string, string> = {
  'daily-lantern': 'parable-hollow',
  'daily-gems': 'parable-hollow',
  'daily-seed': 'parable-hollow',
  'daily-neighbor': 'parable-hollow',
  'daily-names': 'witness-bench',
  'daily-creed': 'witness-bench',
  'daily-empty': 'witness-bench',
  'daily-stars': 'observatory',
  'daily-life': 'observatory',
  'daily-cosmos': 'observatory',
  'daily-scroll': 'first-gate',
  'daily-isaiah': 'first-gate',
  'daily-grace': 'high-lookout',
  'daily-rest': 'high-lookout',
  'daily-door': 'high-lookout',
}

export function pillarFor(id: string): string {
  for (const area of areas) {
    if (area.challenges.some((challenge) => challenge.id === id)) return area.id
  }
  if (DAILY_PILLAR[id]) return DAILY_PILLAR[id]
  if (id === 'td-watch') return 'parable-hollow'
  const entry = journalEntries.find((item) => item.id === id || item.unlockAfter === id)
  if (entry) return entry.areaId
  return 'daily-trail'
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
