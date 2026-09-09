import type { GemId, ProgressState, WalkerKind, WatchTool } from '../types.ts'

/**
 * Expandable Night Watch catalog.
 * Add later tools as rows. This climb ships four. Seven Seals stays parked.
 * Unlock is keyed to held / completed claims. Live tier grows with mastery.
 */
export const TOOL_TIER_MAX = 3

export const WATCH_TOOLS: WatchTool[] = [
  {
    id: 'love',
    label: 'Love',
    gem: 'heart',
    unlockKeys: [],
    counters: ['image-bearer', 'spiritual', 'skeptic'],
    tier: 1,
  },
  {
    id: 'logic',
    label: 'Logic',
    gem: 'star',
    unlockKeys: [
      'wb-creed',
      'wb-early',
      'wb-method',
      'wb-women',
      'fg-mover',
      'fg-contingent',
      'fg-kalam',
      'daily-creed',
      'daily-names',
    ],
    counters: ['skeptic', 'metaphysical'],
    tier: 1,
  },
  {
    id: 'reason',
    label: 'Reason',
    gem: 'cup',
    unlockKeys: ['hl-moral', 'hl-mind', 'hl-meaning', 'hl-beauty', 'fg-limits'],
    counters: ['pagan', 'metaphysical'],
    tier: 1,
  },
  {
    id: 'science',
    label: 'Science',
    gem: 'lamp',
    unlockKeys: [
      'ob-tuning',
      'ob-design',
      'ob-leibniz',
      'ob-life',
      'daily-stars',
      'daily-life',
      'daily-cosmos',
    ],
    counters: ['physical', 'metaphysical'],
    tier: 1,
  },
]

export const WALKER_KINDS: WalkerKind[] = [
  'image-bearer',
  'skeptic',
  'pagan',
  'physical',
  'metaphysical',
  'spiritual',
]

export const WALKER_LABEL: Record<WalkerKind, string> = {
  'image-bearer': 'Image-bearer',
  skeptic: 'Skeptic',
  pagan: 'Pagan',
  physical: 'Physical',
  metaphysical: 'Metaphysical',
  spiritual: 'Spiritual',
}

export const TIER_MARK = ['', 'I', 'II', 'III'] as const

export function watchTool(id: string): WatchTool | undefined {
  return WATCH_TOOLS.find((tool) => tool.id === id)
}

export function toolUnlocked(tool: WatchTool, progress: ProgressState): boolean {
  if (tool.unlockKeys.length === 0) return true
  const held = new Set(progress.held ?? [])
  const completed = new Set(progress.completed ?? [])
  return tool.unlockKeys.some((id) => held.has(id) || completed.has(id))
}

/** Starter tools with no unlockKeys grow from the night brief + stored learnings. */
export function masteryKeys(tool: WatchTool): string[] {
  if (tool.unlockKeys.length > 0) return tool.unlockKeys
  return ['td-watch']
}

export function toolMastery(
  tool: WatchTool,
  progress: ProgressState,
): { held: number; reviews: number; stars: number } {
  const keys = masteryKeys(tool)
  const known = new Set([...(progress.held ?? []), ...(progress.completed ?? [])])
  const held = keys.filter((id) => known.has(id)).length
  const stored = (progress.learnings ?? []).filter((item) => item.toolId === tool.id).length
  const reviews = keys.reduce((sum, id) => sum + (progress.memory[id]?.reviews ?? 0), 0)
  const stars = keys.reduce((sum, id) => sum + (progress.stars[id] ?? 0), 0)
  return { held: held + stored, reviews, stars }
}

/** Live tier = catalog floor + mastery extras. Later tools reuse this. */
export function toolTier(tool: WatchTool, progress: ProgressState): number {
  const { held, reviews, stars } = toolMastery(tool, progress)
  let extra = 0
  if (held >= 2 || reviews >= 2 || stars >= 4) extra = 1
  if (held >= 4 || reviews >= 6 || stars >= 8) extra = 2
  return Math.min(TOOL_TIER_MAX, tool.tier + extra)
}

export function unlockedWatchTools(progress: ProgressState): WatchTool[] {
  return WATCH_TOOLS.filter((tool) => toolUnlocked(tool, progress))
}

export function deployFit(toolId: string, kind: WalkerKind): 'match' | 'weak' {
  const tool = watchTool(toolId)
  if (!tool) return 'weak'
  return tool.counters.includes(kind) ? 'match' : 'weak'
}

export function toolForEvidence(evidenceId: string): WatchTool | undefined {
  const keyed = WATCH_TOOLS.find((tool) => tool.unlockKeys.includes(evidenceId))
  if (keyed) return keyed
  return watchTool('love')
}

export function learningPicture(evidenceId: string, tool?: WatchTool): GemId | undefined {
  if (evidenceId.includes('seed')) return 'seed'
  if (evidenceId.includes('lamp') || evidenceId.includes('lantern')) return 'lamp'
  if (evidenceId.includes('grace') || evidenceId.includes('cup')) return 'cup'
  return tool?.gem
}
