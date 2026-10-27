import type { EvidenceBrief } from '../../content/evidence.ts'
import { hashString } from '../../lib/dates.ts'

export type ReviewFormatId = 'A' | 'B' | 'C' | 'F'

export type ReviewRung = 'claim' | 'reason' | 'source'

const WEIGHTS: Record<'A' | 'B' | 'C', number> = { C: 55, B: 30, A: 15 }

export function reviewRung(intervalIndex: number): ReviewRung {
  if (intervalIndex <= 1) return 'claim'
  if (intervalIndex === 2) return 'reason'
  return 'source'
}

export function reviewPrompt(intervalIndex: number): string {
  const rung = reviewRung(intervalIndex)
  if (rung === 'claim') return "What's the main idea?"
  if (rung === 'reason') return 'Why is it true?'
  return "Where's it from?"
}

export function reviewTargetLine(brief: EvidenceBrief, intervalIndex: number): string {
  const rung = reviewRung(intervalIndex)
  if (rung === 'claim') return brief.claim
  if (rung === 'reason') return brief.reason
  return brief.source
}

export interface ReviewSitting {
  bUsed?: boolean
}

/** Seeded weighted pick — F is reserved for #846. */
export function pickFormat(
  id: string,
  today: string,
  lastFormat?: ReviewFormatId,
  sitting?: ReviewSitting,
  intervalIndex = 0,
): Exclude<ReviewFormatId, 'F'> {
  let pool: Array<'A' | 'B' | 'C'> = ['C', 'B', 'A']
  if (lastFormat && lastFormat !== 'F') {
    pool = pool.filter((format) => format !== lastFormat)
  }
  if (sitting?.bUsed) {
    pool = pool.filter((format) => format !== 'B')
  }
  if (reviewRung(intervalIndex) === 'source') {
    pool = pool.filter((format) => format !== 'B')
  }
  if (pool.length === 0) return 'A'

  const seed = hashString(`review:${today}:${id}`)
  const total = pool.reduce((sum, format) => sum + WEIGHTS[format], 0)
  let roll = seed % total
  for (const format of pool) {
    roll -= WEIGHTS[format]
    if (roll < 0) return format
  }
  return pool[pool.length - 1] ?? 'A'
}

export function honestyCheckDue(id: string, today: string, intervalIndex: number): boolean {
  if (reviewRung(intervalIndex) === 'source') return false
  return hashString(`check:${today}:${id}`) % 3 === 0
}
