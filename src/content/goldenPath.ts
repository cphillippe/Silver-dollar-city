/**
 * Easy golden path. The XML in packs/golden-path.xml is the one lesson order
 * and the one filled-gold target per screen. Area packs do not own that order.
 */
import { PACK_XML } from './packEmbedded.ts'
import { parseGoldenPathXml, type GoldenPathData } from './packParse.ts'

/** Allowed gold targets. Play screens use "none". A win gold is never a replay. */
export const GOLDEN_SCREEN_TARGETS = {
  welcome: ['startEasy'],
  home: ['nextStep'],
  'read-teach': ['teachNext'],
  'sort-done': ['savePicks'],
  'maze-win': ['lockInNext'],
  'run-win': ['lockInNext'],
  'merge-win': ['lockInNext'],
  'dig-win': ['lockInNext'],
  'gem-win': ['lockInNext'],
  'recall-miss': ['tryAgain'],
  'read-recall-done': ['home'],
  'run-fail': ['runRetry'],
  maze: ['none'],
  run: ['none'],
  sort: ['none'],
  'word-search': ['none'],
  merge: ['none'],
  dig: ['none'],
  quiz: ['none'],
  'read-recall': ['none'],
} as const

export type GoldenScreenId = keyof typeof GOLDEN_SCREEN_TARGETS

export const PLAY_SCREEN_IDS = [
  'maze',
  'run',
  'sort',
  'word-search',
  'merge',
  'dig',
  'quiz',
  'read-recall',
] as const

/** Replay targets. A win screen that points at one of these loops. */
export const REPLAY_GOLDS = [
  'oneMore',
  'oneMoreRoad',
  'oneMoreMatch',
  'oneMoreBowl',
  'again',
  'runAgain',
  'digAgain',
  'replay',
] as const

export const EASY_OPEN_DAY_KEY = 'silver-city-easy-open-v1'

export const GOLDEN: GoldenPathData = parseGoldenPathXml(PACK_XML['golden-path.xml'] ?? '')

export function goldenScreenGold(screenId: string): string {
  return GOLDEN.screens.find((screen) => screen.id === screenId)?.gold ?? ''
}

/** Filled gold when this target is the screen's one gold. Otherwise a quiet xl button. */
export function goldButtonClass(screenId: string, target: string, rest = ''): string {
  const filled = goldenScreenGold(screenId) === target && target !== 'none'
  const base = filled ? 'btn primary xl' : 'btn xl'
  return rest ? `${base} ${rest}` : base
}

type ReadProgress = {
  easyHeld?: string[]
  lastDailyDate?: string
  dailyDates?: string[]
}

function storageGet(key: string): string {
  try {
    return globalThis.localStorage?.getItem(key) ?? ''
  } catch {
    return ''
  }
}

function storageSet(key: string, value: string) {
  try {
    globalThis.localStorage?.setItem(key, value)
  } catch {
    /* private mode */
  }
}

/**
 * Remember the calendar day of the first Easy Home, before any Lock In.
 * A later day can put Read on the gold step. The first day cannot.
 */
export function noteEasyOpenDay(today: string, heldCount: number) {
  if (heldCount > 0 || !today) return
  if (storageGet(EASY_OPEN_DAY_KEY)) return
  storageSet(EASY_OPEN_DAY_KEY, today)
}

function dailyDone(progress: ReadProgress, today: string): boolean {
  return progress.lastDailyDate === today || (progress.dailyDates ?? []).includes(today)
}

/**
 * Easy Home gold is Read only on a later calendar day, after a line is held,
 * when today's Read is still open. The first session stays on the Easy line.
 * Hard does not call this.
 */
export function easyReadIsHomeGold(progress: ReadProgress, today: string): boolean {
  if (dailyDone(progress, today)) return false
  const held = progress.easyHeld?.length ?? 0
  if (held === 0) return GOLDEN.firstSessionReadFirst
  if (!GOLDEN.returningDayReadFirst) return false
  const open = storageGet(EASY_OPEN_DAY_KEY)
  if (open === today) return false
  return true
}
