export type ChallengeKind = 'sequence' | 'build-argument' | 'match' | 'sort'

/** Candy picture-marks for early boards. Later walks may omit these. */
export type GemId = 'lamp' | 'seed' | 'heart' | 'star' | 'cup' | 'tree' | 'door' | 'coin'

export interface SortTile {
  id: string
  text: string
  bin: 'keep' | 'discard'
  gem?: GemId
  /** Why this Keep can be today’s takeaway — required when several Keeps share a board. */
  why?: string
}

export interface SortChallenge {
  kind: 'sort'
  id: string
  title: string
  idea?: string
  prompt: string
  context?: string
  keepLabel: string
  discardLabel: string
  tiles: SortTile[]
  teachOnWrong: string
  deeper?: string
}

export interface SequenceItem {
  id: string
  text: string
  gem?: GemId
}

export interface SequenceChallenge {
  kind: 'sequence'
  id: string
  title: string
  idea?: string
  prompt: string
  context?: string
  items: SequenceItem[]
  teachOnWrong: string
  deeper?: string
}

export interface ArgumentSlot {
  id: string
  role: 'premise' | 'conclusion'
  label: string
  correctCardId: string
}

export interface ArgumentCard {
  id: string
  text: string
  distractor?: boolean
}

export interface BuildArgumentChallenge {
  kind: 'build-argument'
  id: string
  title: string
  idea?: string
  prompt: string
  context?: string
  slots: ArgumentSlot[]
  cards: ArgumentCard[]
  teachOnWrong: string
  deeper?: string
}

export interface MatchPair {
  id: string
  left: string
  right: string
  gem?: GemId
}

export interface MatchChallenge {
  kind: 'match'
  id: string
  title: string
  idea?: string
  prompt: string
  context?: string
  pairs: MatchPair[]
  teachOnWrong: string
  deeper?: string
}

export type Challenge =
  | SequenceChallenge
  | BuildArgumentChallenge
  | MatchChallenge
  | SortChallenge

export interface Area {
  id: string
  order: number
  title: string
  shortTitle: string
  subtitle: string
  blurb: string
  intro: string[]
  icon: string
  accent: string
  challenges: Challenge[]
}

export interface JournalEntry {
  id: string
  areaId: string
  title: string
  kicker: string
  body: string[]
  sources: string[]
  unlockAfter: string
}

export type StarCount = 1 | 2 | 3

export interface MemoryTrace {
  id: string
  pillar: string
  intervalIndex: number
  nextReviewAt: string
  lastReviewAt?: string
  reviews: number
  cleanRecalls: number
  elaborated: boolean
}

export interface DefenseState {
  cleared: number
  nights: string[]
  lastNight?: string
}

export type AppTheme = 'candy' | 'dusk' | 'parchment'

/** Night Watch walker kinds — add rows later; first slice uses these six. */
export type WalkerKind =
  | 'image-bearer'
  | 'skeptic'
  | 'pagan'
  | 'physical'
  | 'metaphysical'
  | 'spiritual'

/** Expandable tool row. Ship four now; later tools are more rows, not new board code. */
export interface WatchTool {
  id: string
  label: string
  gem: GemId
  /** Evidence ids that unlock this tool. Empty = starter (Love). */
  unlockKeys: string[]
  counters: WalkerKind[]
  /** Catalog floor (1). Live tier grows with held/recall mastery, max 3. */
  tier: number
}

/** One saved learning: claim · reason · source · anchor · picture · tool. */
export interface Learning {
  id: string
  claim: string
  reason: string
  source: string
  anchor: string
  picture?: GemId
  toolId?: string
  acquiredAt: string
}

export interface ProgressState {
  started: boolean
  completed: string[]
  journal: string[]
  firstTry: string[]
  lastAreaId?: string
  lastChallengeId?: string
  stars: Record<string, StarCount>
  dailyDates: string[]
  lastDailyDate?: string
  streak: number
  bestStreak: number
  /** Evidence briefs successfully retrieved (claim + reason). */
  held: string[]
  memory: Record<string, MemoryTrace>
  elaborations: Record<string, string>
  lastReviewPillar?: string
  /** Night Watch — optional on old saves; normalize fills an empty watch. */
  defense: DefenseState
  /** Visual chrome. Optional on old saves; normalize defaults to candy. */
  theme: AppTheme
  /**
   * Encoded learnings (Acquire→Store). Optional on old saves;
   * normalize fills []. Schema stays 1 — do not wipe.
   */
  learnings: Learning[]
}

export type View =
  | { name: 'welcome' }
  | { name: 'hub' }
  | { name: 'daily' }
  | { name: 'area'; areaId: string }
  | { name: 'challenge'; areaId: string; challengeId: string }
  | { name: 'journal'; focusId?: string; autoQuiz?: boolean }
  | { name: 'vista' }
  | { name: 'settings' }
  | { name: 'defend' }
