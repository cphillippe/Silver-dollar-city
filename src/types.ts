export type ChallengeKind = 'sequence' | 'build-argument' | 'match' | 'sort'

export interface SortTile {
  id: string
  text: string
  bin: 'keep' | 'discard'
}

export interface SortChallenge {
  kind: 'sort'
  id: string
  title: string
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
}

export interface SequenceChallenge {
  kind: 'sequence'
  id: string
  title: string
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
}

export interface MatchChallenge {
  kind: 'match'
  id: string
  title: string
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
}

export type View =
  | { name: 'welcome' }
  | { name: 'hub' }
  | { name: 'daily' }
  | { name: 'area'; areaId: string }
  | { name: 'challenge'; areaId: string; challengeId: string }
  | { name: 'journal'; focusId?: string; autoQuiz?: boolean }
  | { name: 'vista' }
