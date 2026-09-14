export const PACK_SCHEMA_VERSION = 3

export type LessonTierId = 'easy' | 'medium' | 'hard'

export const TIER_POINTS: Record<LessonTierId, number> = {
  easy: 10,
  medium: 12,
  hard: 15,
}

export const TIER_LEVEL_UP: Record<LessonTierId, LessonTierId | undefined> = {
  easy: 'medium',
  medium: 'hard',
  hard: undefined,
}

export interface PackLoci {
  place: string
  person: string
  plotId: string
  who: string
}

export interface PackMatch {
  sentence: string
  place: string
  person: string
}

export interface PackHold {
  levelUpTo?: LessonTierId
  onFail: 'easy'
  why: string
  claimMisses: string[]
  whyMisses: string[]
}

export interface PackWord {
  term: string
  sense: string
}

export interface PackTier {
  id: LessonTierId
  points: number
  easyOrder?: number
  learn: string
  gloss?: string
  word?: PackWord
  hint?: string
  match: PackMatch
  hold: PackHold
}

export interface PackJournal {
  id?: string
  title: string
  kicker: string
  body: string[]
  sources: string[]
  unlockAfter?: string
}

export interface PackLesson {
  id: string
  areaId: string
  title: string
  idea?: string
  claim: string
  plain: string
  source: string
  loci: PackLoci
  journal?: PackJournal
  easy: PackTier
  medium: PackTier
  hard: PackTier
}

export interface PackArea {
  id: string
  file: string
  order: number
  title: string
  shortTitle: string
  subtitle: string
  blurb: string
  intro: string[]
  icon: string
  accent: string
  lessons: PackLesson[]
}

export interface PackIndex {
  schemaVersion: number
  id: string
  title: string
  files: { file: string; id: string }[]
  easyShelf: string[]
}

export interface PackCatalog {
  schemaVersion: number
  id: string
  title: string
  areas: PackArea[]
  lessons: PackLesson[]
}

export function isLessonTier(value: string | undefined): value is LessonTierId {
  return value === 'easy' || value === 'medium' || value === 'hard'
}

export function tierFromScore(score: number | undefined): LessonTierId | undefined {
  if (!score) return undefined
  if (score >= TIER_POINTS.hard) return 'hard'
  if (score >= TIER_POINTS.medium) return 'medium'
  if (score >= TIER_POINTS.easy) return 'easy'
  return undefined
}

export function lessonTier(lesson: PackLesson, id: LessonTierId): PackTier {
  return lesson[id]
}
