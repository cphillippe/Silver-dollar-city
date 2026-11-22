import { EASY_LINE_ORDER } from '../trail/loop.ts'
import type { ReviewFormatId } from './reviewFormat.ts'

export type EncodeFormatId = Exclude<ReviewFormatId, 'F'>

/** Quick Review pool — C map, B think-first, A flip card. */
const POOL: EncodeFormatId[] = ['C', 'B', 'A']

function bCountInWindow(schedule: EncodeFormatId[], index: number): number {
  return schedule.slice(Math.max(0, index - 2), index).filter((format) => format === 'B').length
}

/**
 * Deterministic encode format per golden-path lesson index.
 * No two consecutive lessons share a format; B shows at most once in any three in a row.
 */
export function pickEncodeFormat(lessonIndex: number): EncodeFormatId {
  let last: EncodeFormatId | undefined
  const schedule: EncodeFormatId[] = []
  for (let i = 0; i <= lessonIndex; i++) {
    const bUsed = bCountInWindow(schedule, i) >= 1
    let picked: EncodeFormatId | undefined
    for (let j = 0; j < POOL.length; j++) {
      const format = POOL[(i + j) % POOL.length]
      if (format === last) continue
      if (format === 'B' && bUsed) continue
      picked = format
      break
    }
    if (!picked) {
      for (const format of POOL) {
        if (format === last) continue
        picked = format
        break
      }
    }
    schedule.push(picked ?? 'A')
    last = schedule[i]
  }
  return schedule[lessonIndex] ?? 'A'
}

export function easyLessonIndex(lineId: string): number {
  const index = EASY_LINE_ORDER.indexOf(lineId)
  return index < 0 ? 0 : index
}

export function encodeFormatForLine(lineId: string): EncodeFormatId {
  return pickEncodeFormat(easyLessonIndex(lineId))
}

export function encodeFormatsThrough(count: number): EncodeFormatId[] {
  return Array.from({ length: count }, (_, index) => pickEncodeFormat(index))
}

export function encodeRotationRepeats(formats: EncodeFormatId[]): number {
  let repeats = 0
  for (let i = 1; i < formats.length; i++) {
    if (formats[i] === formats[i - 1]) repeats += 1
  }
  return repeats
}