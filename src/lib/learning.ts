import { evidenceFor } from '../content/evidence.ts'
import type { Learning, ProgressState } from '../types.ts'
import type { ReviewEvent } from './memory.ts'
import { learningPicture, toolForEvidence } from './watchTools.ts'

/** Acquire → Anchor → Picture → Store. Interval recall lives on MemoryTrace. */
export function upsertLearning(list: Learning[], next: Learning): Learning[] {
  const without = list.filter((item) => item.id !== next.id)
  return [...without, next]
}

export function learningFromReview(
  event: ReviewEvent,
  progress: ProgressState,
): Learning | undefined {
  const brief = evidenceFor(event.id)
  if (!brief) return undefined
  const tool = toolForEvidence(event.id)
  const priorId = [...(progress.held ?? [])].filter((id) => id !== event.id).at(-1)
  const prior = priorId ? evidenceFor(priorId) : undefined
  return {
    id: event.id,
    claim: brief.claim,
    reason: brief.reason,
    source: brief.source,
    anchor: prior?.claim ?? 'Juniper’s east porch',
    picture: learningPicture(event.id, tool),
    toolId: tool?.id,
    acquiredAt: event.today,
  }
}

export function findLearning(
  progress: ProgressState,
  id: string,
): Learning | undefined {
  return (progress.learnings ?? []).find((item) => item.id === id)
}
