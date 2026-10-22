/**
 * Gem Jar: the lifetime score sink for Easy Match. Pure, no UI.
 * Every positive Match point fills the jar and it never drains. Each jar step
 * permanently unlocks one skill. Rungs are the lifetime points where the jar tips.
 */

export type SkillId = 'sight' | 'combo' | 'big'

export interface LadderSkill {
  id: SkillId
  /** 1-based ladder step. */
  step: number
  name: string
  /** Lifetime jar points where this skill unlocks. */
  at: number
  /** Kid line shown on the reveal: "New skill: <name> — <line>" */
  line: string
}

/** Live ladder. Steps 4 and 5 are reserved below and unlock nothing yet. */
export const SKILL_LADDER: readonly LadderSkill[] = [
  { id: 'sight', step: 1, name: 'Bonus Sight', at: 1000, line: 'a bonus word shimmers at the start.' },
  { id: 'combo', step: 2, name: 'Combo Spark', at: 4000, line: 'bonus words in a row score +50.' },
  { id: 'big', step: 3, name: 'Big Word', at: 9000, line: '5 and 6 letter bonus words score +100.' },
]

/**
 * Room for the next ladder steps. Not live: skillsFor never returns them and the
 * jar does not tip for them. To ship one, add it to SKILL_LADDER with a threshold.
 */
export const RESERVED_LADDER_STEPS = [
  { step: 4, id: 'head-start', name: 'Head Start' },
  { step: 5, id: 'helper', name: 'Dove helper' },
] as const

export const JAR_RUNGS: readonly number[] = SKILL_LADDER.map((skill) => skill.at)
export const JAR_LADDER_STEPS = JAR_RUNGS.length
export const JAR_REFILL = 5000

export interface JarState {
  /** Ladder steps reached, 0..3. */
  rung: number
  /** 0..100 toward nextAt. */
  fillPct: number
  /** The lifetime number the jar is filling toward. */
  nextAt: number
  /** Jars filled after the last live rung. */
  fullCount: number
}

export function jarState(lifetime: number): JarState {
  const points = Math.max(0, Math.floor(Number.isFinite(lifetime) ? lifetime : 0))
  const last = JAR_RUNGS[JAR_RUNGS.length - 1] ?? 0
  let rung = 0
  for (const at of JAR_RUNGS) {
    if (points >= at) rung += 1
  }
  if (rung < JAR_RUNGS.length) {
    const nextAt = JAR_RUNGS[rung] ?? last
    return { rung, fillPct: Math.min(100, (points / nextAt) * 100), nextAt, fullCount: 0 }
  }
  const over = points - last
  const fullCount = Math.floor(over / JAR_REFILL)
  return {
    rung,
    fillPct: ((over % JAR_REFILL) / JAR_REFILL) * 100,
    nextAt: last + (fullCount + 1) * JAR_REFILL,
    fullCount,
  }
}

export function skillsFor(lifetime: number): SkillId[] {
  return SKILL_LADDER.filter((skill) => lifetime >= skill.at).map((skill) => skill.id)
}

export function skillAtStep(step: number): LadderSkill | undefined {
  return SKILL_LADDER.find((skill) => skill.step === step)
}

export interface JarCrossing {
  /** New highest ladder step reached (only set the first time). */
  step: number
  skill: LadderSkill | undefined
  /** Set after the last live rung: a refill completed. */
  full: number
}

/**
 * The jar tipped between two lifetime totals. `seen` is the highest step whose reveal already played.
 * This is the single hook for jar steps: the win card calls it and shows the reveal.
 */
export function jarCrossing(before: number, after: number, seen: number): JarCrossing | null {
  const was = jarState(before)
  const now = jarState(after)
  if (now.rung > seen) {
    return { step: now.rung, skill: skillAtStep(now.rung), full: 0 }
  }
  if (now.fullCount > was.fullCount) {
    return { step: now.rung, skill: undefined, full: now.fullCount }
  }
  return null
}

export function boardTotal(awards: readonly number[]): number {
  return awards.reduce((sum, value) => sum + (value > 0 ? Math.floor(value) : 0), 0)
}

export function jarCaption(lifetime: number): string {
  return `${lifetime.toLocaleString('en-US')} / ${jarState(lifetime).nextAt.toLocaleString('en-US')}`
}

/** Extra points a skill adds to a bonus word. Easy only; callers gate on the easy flag. */
export function skillBonusPoints(
  skills: readonly SkillId[],
  word: { length: number },
  comboCount: number,
): number {
  let extra = 0
  if (skills.includes('combo') && comboCount >= 2) extra += 50
  if (skills.includes('big') && word.length >= 5) extra += 100
  return extra
}
