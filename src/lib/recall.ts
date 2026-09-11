import type { MemoryTrace, ProgressState } from '../types.ts'
import { evidenceFor } from '../content/evidence.ts'
import { isToolHowTo } from './watchTools.ts'
import {
  dueTraces,
  pickSessionDue,
  recallsDoneToday,
} from './memory.ts'

export const RECALL_SESSION_CAP = 3
export const RECALL_LATER_KEY = 'silver-city-recall-later-v1'

export interface RecallLaterState {
  day: string
  ids: string[]
  dismissed: boolean
}

export function emptyLater(today: string): RecallLaterState {
  return { day: today, ids: [], dismissed: false }
}

export function readLater(today: string): RecallLaterState {
  if (typeof sessionStorage === 'undefined') return emptyLater(today)
  try {
    const raw = sessionStorage.getItem(RECALL_LATER_KEY)
    if (!raw) return emptyLater(today)
    const parsed = JSON.parse(raw) as Partial<RecallLaterState>
    if (parsed.day !== today) return emptyLater(today)
    return {
      day: today,
      ids: Array.isArray(parsed.ids)
        ? parsed.ids.filter((id): id is string => typeof id === 'string')
        : [],
      dismissed: parsed.dismissed === true,
    }
  } catch {
    return emptyLater(today)
  }
}

export function writeLater(state: RecallLaterState): RecallLaterState {
  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.setItem(RECALL_LATER_KEY, JSON.stringify(state))
  }
  return state
}

export function markLater(
  today: string,
  ids: string[] = [],
  dismiss = true,
): RecallLaterState {
  const prior = readLater(today)
  const next = writeLater({
    day: today,
    ids: [...new Set([...prior.ids, ...ids])],
    dismissed: dismiss || prior.dismissed,
  })
  return next
}

export function playableDue(progress: ProgressState, today: string): MemoryTrace[] {
  return dueTraces(progress.memory, today).filter(
    (trace) => Boolean(evidenceFor(trace.id)) && !isToolHowTo(trace.id),
  )
}

/** Due items for this sitting: skip Later ids, cap leftover slots at 3. */
export function sessionDue(
  progress: ProgressState,
  today: string,
  later: RecallLaterState = readLater(today),
): MemoryTrace[] {
  if (later.dismissed) return []
  const done = recallsDoneToday(progress.memory, today)
  const left = Math.max(0, RECALL_SESSION_CAP - done)
  if (left === 0) return []
  const due = playableDue(progress, today).filter((trace) => !later.ids.includes(trace.id))
  return pickSessionDue(due, today, progress.lastReviewPillar, left)
}
