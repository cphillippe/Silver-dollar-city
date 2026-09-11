import { DAILY_POOL } from '../content/daily.ts'
import { evidenceFor } from '../content/evidence.ts'
import { firstGate } from '../content/firstGate.ts'
import { highLookout } from '../content/highLookout.ts'
import { observatory } from '../content/observatory.ts'
import { parableHollow } from '../content/parableHollow.ts'
import { CAST, guideForArea } from '../content/story.ts'
import { witnessBench } from '../content/witnessBench.ts'
import type { Learning, ProgressState } from '../types.ts'
import { CITY_PLOTS } from './city.ts'
import type { ReviewEvent } from './memory.ts'
import { isDue } from './memory.ts'
import { isToolHowTo, learningPicture, toolForEvidence, watchTool } from './watchTools.ts'

/**
 * Memory-science spine for every learning.
 * Acquire → Anchor → Picture → Store → spaced Recall → Deploy.
 * Schema stays 1: optional `beat` is derived when an old save omitted it.
 */
export const MEMORY_STAGES = [
  'acquire',
  'anchor',
  'picture',
  'store',
  'recall',
  'deploy',
] as const

export type MemoryStage = (typeof MEMORY_STAGES)[number]

export function upsertLearning(list: Learning[], next: Learning): Learning[] {
  const without = list.filter((item) => item.id !== next.id)
  return [...without, next]
}

const AREA_WALKS = [parableHollow, witnessBench, observatory, firstGate, highLookout]

function pillarOf(id: string): string {
  for (const area of AREA_WALKS) {
    if (area.challenges.some((challenge) => challenge.id === id)) return area.id
  }
  if (id === 'td-watch') return 'parable-hollow'
  if (id.startsWith('daily-')) return 'daily-trail'
  return 'daily-trail'
}

function ideaOf(id: string): string | undefined {
  for (const area of AREA_WALKS) {
    const hit = area.challenges.find((challenge) => challenge.id === id)
    if (hit?.idea) return hit.idea
  }
  return DAILY_POOL.find((item) => item.challenge.id === id)?.challenge.idea
}

export function plotForEvidence(id: string) {
  const pillar = pillarOf(id)
  if (id.startsWith('daily-') || pillar === 'daily-trail') {
    return CITY_PLOTS.find((plot) => plot.id === 'porch') ?? CITY_PLOTS[0]
  }
  return (
    CITY_PLOTS.find((plot) => plot.areaId === pillar) ??
    CITY_PLOTS.find((plot) => plot.id === 'porch') ??
    CITY_PLOTS[0]
  )
}

export function whoForEvidence(id: string) {
  const pillar = pillarOf(id)
  if (id.startsWith('daily-') || pillar === 'daily-trail') return CAST.juniper
  return guideForArea(pillar)
}

/** Dual-code story beat — the short picture that rides with the gem. */
export function learningBeat(id: string): string {
  const idea = ideaOf(id)
  if (idea) return idea
  if (id === 'td-watch') return 'when compassion moves you, help like the Samaritan'
  const tool = toolForEvidence(id)
  return tool ? `a picture you can still hold for ${tool.label}` : 'a picture you can still hold'
}

/** Prior held claim, town lot, and the person who walks that lot. */
export function learningAnchor(progress: ProgressState, id: string): string {
  const who = whoForEvidence(id)
  const lot = plotForEvidence(id)
  const priorId = [...(progress.held ?? [])].filter((item) => item !== id).at(-1)
  const prior = priorId ? evidenceFor(priorId) : undefined
  const place = `${who.name} · ${lot.title}`
  if (!prior?.claim) return place
  const clip = prior.claim.length > 72 ? `${prior.claim.slice(0, 69)}…` : prior.claim
  return `${place} · after “${clip}”`
}

export function learningFromReview(
  event: ReviewEvent,
  progress: ProgressState,
): Learning | undefined {
  if (isToolHowTo(event.id)) return undefined
  const brief = evidenceFor(event.id)
  if (!brief) return undefined
  const tool = toolForEvidence(event.id)
  return {
    id: event.id,
    claim: brief.claim,
    reason: brief.reason,
    source: brief.source,
    anchor: learningAnchor(progress, event.id),
    picture: learningPicture(event.id, tool),
    beat: learningBeat(event.id),
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

/** Newest stored line that deploys this tool — what you remember on the road. */
export function learningForTool(
  progress: ProgressState,
  toolId: string,
): Learning | undefined {
  const hits = (progress.learnings ?? []).filter(
    (item) => item.toolId === toolId && !isToolHowTo(item.id),
  )
  return hits.at(-1)
}

export function storedLearnings(progress: ProgressState): Learning[] {
  return [...(progress.learnings ?? [])].filter((item) => !isToolHowTo(item.id)).reverse()
}

export function withLearningBeat(learning: Learning): Learning {
  return learning.beat ? learning : { ...learning, beat: learningBeat(learning.id) }
}

export function deployLabel(learning: Learning): string | undefined {
  if (!learning.toolId) return undefined
  return watchTool(learning.toolId)?.label ?? learning.toolId
}

export function recallLane(
  progress: ProgressState,
  id: string,
  today: string,
): 'same-day' | 'daily' | 'interval' | 'resting' {
  const trace = progress.memory[id]
  if (!trace) return 'resting'
  if (!isDue(trace, today)) return 'resting'
  if (trace.reviews === 0) return 'same-day'
  if (trace.intervalIndex <= 1) return 'daily'
  return 'interval'
}
