import { pillarFor } from '../content/index.ts'
import { isToolHowTo } from '../lib/watchTools.ts'
import { BONUS_LESSONS } from './upgradeTree.ts'

export { BONUS_LESSONS }

/**
 * Lock In areas that grow one lamp (1.4.440).
 * `pillarFor` in src/content/index.ts is the lesson→area map, including daily lines.
 * Love is Story Creek. Logic is Witness Square. Science is Sky Watch.
 * Reason takes Why Gate and Meaning Ridge, the two areas whose lessons are reason's.
 */
export const LAMP_AREAS: Record<string, readonly string[]> = {
  love: ['parable-hollow'],
  logic: ['witness-bench'],
  science: ['observatory'],
  reason: ['first-gate', 'high-lookout'],
}

/** How many held lines sit on this lamp's pillar. A how-to does not count. */
export function samePillarLessons(toolId: string, held: readonly string[] | undefined): number {
  const areas = LAMP_AREAS[toolId]
  if (!areas || !held) return 0
  const open = new Set(areas)
  let count = 0
  for (const id of held) {
    if (!id || isToolHowTo(id)) continue
    if (open.has(pillarFor(id))) count += 1
  }
  return count
}

export function bonusStepOpen(lessons: number): boolean {
  return lessons >= BONUS_LESSONS
}

/** Area the Lock In button opens. Prefer a pillar that still has room to learn. */
export function lessonAreaFor(toolId: string, held: readonly string[] | undefined): string {
  const areas = LAMP_AREAS[toolId] ?? LAMP_AREAS.love
  const owned = new Set(held ?? [])
  let best = areas[0]
  let bestCount = Number.POSITIVE_INFINITY
  for (const area of areas) {
    let count = 0
    for (const id of owned) {
      if (isToolHowTo(id)) continue
      if (pillarFor(id) === area) count += 1
    }
    if (count < bestCount) {
      best = area
      bestCount = count
    }
  }
  return best
}
