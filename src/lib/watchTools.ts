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
      'fg-order',
      'fg-reason',
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
    unlockKeys: [
      'hl-moral',
      'hl-mind',
      'hl-meaning',
      'hl-beauty',
      'fg-ought',
      'fg-ground',
      'fg-limits',
    ],
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
  'image-bearer': 'Cold Heart',
  skeptic: 'Accuser',
  pagan: 'Tempter',
  physical: 'Despair',
  metaphysical: 'Whisper',
  spiritual: 'Mockery',
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

/** Night Watch Love brief — tool how-to, not a held apologetics claim. */
export function isToolHowTo(id: string): boolean {
  return id === 'td-watch'
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
  const fromKeys = keys.filter((id) => known.has(id))
  const fromStore = (progress.learnings ?? [])
    .filter((item) => item.toolId === tool.id)
    .map((item) => item.id)
  const held = new Set([...fromKeys, ...fromStore]).size
  const reviews = keys.reduce((sum, id) => sum + (progress.memory[id]?.reviews ?? 0), 0)
  const stars = keys.reduce((sum, id) => sum + (progress.stars[id] ?? 0), 0)
  return { held, reviews, stars }
}

/** Live tier = catalog floor + mastery extras. Later tools reuse this. */
export function toolTier(tool: WatchTool, progress: ProgressState): number {
  const { held, reviews, stars } = toolMastery(tool, progress)
  let extra = 0
  if (held >= 2 || reviews >= 2 || stars >= 4) extra = 1
  if (held >= 4 || reviews >= 6 || stars >= 8) extra = 2
  return Math.min(TOOL_TIER_MAX, tool.tier + extra)
}

/** Each night starts tools at I. Trail mastery stays on toolTier. */
export function freshRunTier(): Record<string, number> {
  return Object.fromEntries(WATCH_TOOLS.map((tool) => [tool.id, 1]))
}

/** Tier Night Watch combat reads this run. */
export function combatTier(toolId: string, runTier: Record<string, number>): number {
  const live = runTier[toolId] ?? 1
  return Math.min(TOOL_TIER_MAX, Math.max(1, Math.floor(live)))
}

/** Hard sparks to raise one step. Flat 1. Maxed tools cost nothing. */
export function boostCost(tier: number): number {
  return tier >= TOOL_TIER_MAX ? 0 : 1
}

/**
 * Easy spark price of each tier. Path-agnostic: index is the tier you buy.
 * 2 is II, 3 is III, 4 is the next step. Tier I is free.
 * Every path pays this same row, so a later 2-path tree can hang these
 * numbers on its branches without a new economy.
 */
export const EASY_TIER_COST: readonly number[] = [0, 0, 3, 6, 10]

/** Sparks to plant one more lamp after Begin. Lamps planted before Begin are free. */
export const EASY_LAMP_COST = 5

/** Sparks for the next Easy step. A maxed lamp costs nothing. The tier-4 price waits in `EASY_TIER_COST`. */
export function easyTierCost(tier: number): number {
  if (tier >= TOOL_TIER_MAX) return 0
  const buying = Math.floor(tier) + 1
  const listed = EASY_TIER_COST[buying]
  return listed ?? EASY_TIER_COST[EASY_TIER_COST.length - 1] ?? 0
}

export interface LampBuy {
  ok: boolean
  sparks: number
  cost: number
  note: string
}

/** Spend sparks for one extra lamp. Does not raise a tier. */
export function buyExtraLamp(sparks: number, cost = EASY_LAMP_COST): LampBuy {
  if (sparks < cost) return { ok: false, sparks, cost, note: 'Need a spark' }
  return { ok: true, sparks: sparks - cost, cost, note: 'Lamp planted' }
}

export interface BoostSpend {
  ok: boolean
  runTier: Record<string, number>
  sparks: number
  note: string
}

/**
 * Spend run sparks to bump I→II→III. Does not touch journal stars.
 * Hard pays `boostCost` (1). Easy pays `easyTierCost` (3, then 6).
 */
export function applyBoost(
  toolId: string,
  runTier: Record<string, number>,
  sparks: number,
  easy = false,
): BoostSpend {
  const label = watchTool(toolId)?.label ?? 'Tool'
  const tier = combatTier(toolId, runTier)
  if (tier >= TOOL_TIER_MAX) {
    return { ok: false, runTier, sparks, note: `${label} is ${TIER_MARK[TOOL_TIER_MAX]}` }
  }
  const cost = easy ? easyTierCost(tier) : boostCost(tier)
  if (sparks < cost) {
    return { ok: false, runTier, sparks, note: 'Need a spark' }
  }
  const next = tier + 1
  return {
    ok: true,
    runTier: { ...runTier, [toolId]: next },
    sparks: sparks - cost,
    note: `${label} ${TIER_MARK[next]}`,
  }
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
