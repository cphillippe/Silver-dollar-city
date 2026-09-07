export type StarCount = 1 | 2 | 3

/** 3 = clean (no miss, no peek). 2 = one slip. 1 = both a miss and a peek. */
export function starsFromAttempt(missed: boolean, peeked: boolean): StarCount {
  if (!missed && !peeked) return 3
  if (missed && peeked) return 1
  return 2
}

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
