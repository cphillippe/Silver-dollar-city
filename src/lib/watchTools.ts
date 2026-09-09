import type { GemId, ProgressState, WalkerKind, WatchTool } from '../types.ts'

/**
 * Expandable Night Watch catalog.
 * This climb ships four tools. Add later tools as rows — do not hard-code
 * new ability chips in the board. Seven Seals stays parked.
 */
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

export function watchTool(id: string): WatchTool | undefined {
  return WATCH_TOOLS.find((tool) => tool.id === id)
}

export function toolUnlocked(tool: WatchTool, progress: ProgressState): boolean {
  if (tool.unlockKeys.length === 0) return true
  const held = new Set(progress.held ?? [])
  const completed = new Set(progress.completed ?? [])
  return tool.unlockKeys.some((id) => held.has(id) || completed.has(id))
}

/** Ready for later mastery upgrades — this climb stays at catalog tier. */
export function toolTier(tool: WatchTool, _progress: ProgressState): number {
  return tool.tier
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
