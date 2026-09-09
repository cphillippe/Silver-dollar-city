import { addLocalDays, localDateKey } from './dates'

export type StreakTone = 'first' | 'continue' | 'welcome-back' | 'already'

export interface StreakUpdate {
  streak: number
  tone: StreakTone
}

/** Consecutive local calendar days with a Daily Trail mark. A gap starts a new count; journal stays. */
export function streakAfterPlay(
  lastDailyDate: string | undefined,
  today: string,
  currentStreak: number,
): StreakUpdate {
  if (lastDailyDate === today) {
    return { streak: Math.max(1, currentStreak), tone: 'already' }
  }
  if (!lastDailyDate) {
    return { streak: 1, tone: 'first' }
  }
  if (lastDailyDate === addLocalDays(today, -1)) {
    return { streak: currentStreak + 1, tone: 'continue' }
  }
  return { streak: 1, tone: 'welcome-back' }
}

export function isStreakLive(lastDailyDate: string | undefined, today = localDateKey()): boolean {
  if (!lastDailyDate) return false
  return lastDailyDate === today || lastDailyDate === addLocalDays(today, -1)
}

export function trailDaysRequired(unlockAfter: string): number | null {
  const match = /^trail-days-(\d+)$/.exec(unlockAfter)
  return match ? Number(match[1]) : null
}
