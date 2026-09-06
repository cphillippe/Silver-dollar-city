export type ChallengeKind =
  | 'multiple-choice'
  | 'sequence'
  | 'build-argument'
  | 'match'
  | 'scenario'

export interface Choice {
  id: string
  text: string
  correct: boolean
  teach: string
}

export interface MultipleChoiceChallenge {
  kind: 'multiple-choice'
  id: string
  title: string
  prompt: string
  context?: string
  choices: Choice[]
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

export interface ScenarioChallenge {
  kind: 'scenario'
  id: string
  title: string
  scene: string
  prompt: string
  choices: Choice[]
  deeper?: string
}

export type Challenge =
  | MultipleChoiceChallenge
  | SequenceChallenge
  | BuildArgumentChallenge
  | MatchChallenge
  | ScenarioChallenge

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

export interface ProgressState {
  started: boolean
  completed: string[]
  journal: string[]
  firstTry: string[]
  lastAreaId?: string
  lastChallengeId?: string
}

export type View =
  | { name: 'welcome' }
  | { name: 'hub' }
  | { name: 'area'; areaId: string }
  | { name: 'challenge'; areaId: string; challengeId: string }
  | { name: 'journal'; focusId?: string }
  | { name: 'vista' }
