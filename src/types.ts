export type ChallengeKind = 'sequence' | 'build-argument' | 'match' | 'sort' | 'link'

/** Candy picture-marks for early boards. Later walks may omit these. */
export type GemId = 'lamp' | 'seed' | 'heart' | 'star' | 'cup' | 'tree' | 'door' | 'coin'

/** Full-tile match pictures. Names are the readable idea, not a gem catalog. */
export type MatchSceneId =
  | GemId
  | 'expand'
  | 'bind'
  | 'tidy'
  | 'dial'
  | 'witnesses'
  | 'reluctant'
  | 'clock'
  | 'judea'
  | 'redness'
  | 'aboutness'
  | 'mindgap'
  | 'truenorth'
  | 'crowd'
  | 'cells'
  | 'band'
  | 'pasture'
  | 'first'
  | 'twelve'
  | 'welcome'
  | 'mindsky'

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
  scene?: MatchSceneId
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

export type LinkKind = 'idea' | 'place' | 'person'

export interface LinkNode {
  id: string
  kind: LinkKind
  text: string
  /** Person chip — candy portrait. */
  who?: 'river' | 'juniper' | 'mercy' | 'silas' | 'nora' | 'ansel' | 'hope'
  /** Place chip — town plot. */
  plotId?: string
  /** Idea chip — existing evidence / walk id. */
  evidenceId?: string
}

export interface LinkTriple {
  id: string
  ideaId: string
  placeId: string
  personId: string
}

export interface LinkChallenge {
  kind: 'link'
  id: string
  title: string
  idea?: string
  prompt: string
  context?: string
  nodes: LinkNode[]
  triples: LinkTriple[]
  teachOnWrong: string
  deeper?: string
}

export type Challenge =
  | SequenceChallenge
  | BuildArgumentChallenge
  | MatchChallenge
  | SortChallenge
  | LinkChallenge

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

/** One saved learning: claim · reason · source · anchor · picture/beat · tool. */
export interface Learning {
  id: string
  claim: string
  reason: string
  source: string
  anchor: string
  picture?: GemId
  /** Dual-code story beat. Optional on old saves; derive via learningBeat. */
  beat?: string
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
   * Easier words and bigger taps. Optional on old saves; normalize defaults to false.
   * Schema stays 1 — do not wipe.
   */
  easyMode: boolean
  /**
   * Encoded learnings (Acquire→Store). Optional on old saves;
   * normalize fills []. Schema stays 1 — do not wipe.
   */
  learnings: Learning[]
  /**
   * Applied building looks (0–4) per lot. Optional on old saves;
   * normalize snapshots what learning already earned so the city does not vanish.
   * Schema stays 1 — do not wipe. Further looks are tapped as Upgrade.
   */
  cityBuilt: Record<string, number>
}

export type View =
  | { name: 'welcome' }
  | { name: 'hub'; mindPlot?: string }
  | { name: 'daily' }
  | { name: 'area'; areaId: string }
  | { name: 'challenge'; areaId: string; challengeId: string }
  | { name: 'journal'; focusId?: string; autoQuiz?: boolean }
  | { name: 'vista' }
  | { name: 'settings' }
  | { name: 'defend' }
  | { name: 'link' }
  | { name: 'profile' }
