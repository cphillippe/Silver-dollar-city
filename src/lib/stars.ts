export type StarCount = 1 | 2 | 3

/** Keep the higher mastery mark. New meaning: 1 encode, 2 spaced recall, 3 spaced + teach-back. */
export function bestStars(current: StarCount | undefined, next: StarCount): StarCount {
  return (current && current > next ? current : next) as StarCount
}

export function districtMastery(
  challengeIds: string[],
  stars: Record<string, StarCount>,
): { earned: number; possible: number } {
  const earned = challengeIds.reduce((sum, id) => sum + (stars[id] ?? 0), 0)
  return { earned, possible: challengeIds.length * 3 }
}

export function starLegend(count: StarCount | 0): string {
  if (count >= 3) return 'Held after a rest, and said back'
  if (count === 2) return 'Held after a rest'
  if (count === 1) return 'First walk'
  return 'Not yet walked'
}
