import { easyWhyLine, uniqueHoldChoices } from './easy.ts'
import { shuffle } from './shuffle.ts'

/** Easy Hold why-board — four chips on phone width. */
export const WHY_CHIP_COUNT = 4

/** Mini-game score. Miss −25 floors at 0. Not the journal 10/12/15. */
export const HOLD_BLAST_START = 100
export const HOLD_MISS_PENALTY = 25
export const HOLD_MISS_FACE = 'Miss −25'
export const HOLD_LOCKED_STAMP = 'LOCKED!'

/**
 * Authored extra why-misses when a pack Hold only has two.
 * Still orthodox: false readings, not hedges.
 */
export const WHY_BLAST_EXTRAS: Record<string, string[]> = {
  'ph-road': ['The priest is the hero just for staying.'],
  'ph-father': ['The son earned the feast with a speech.'],
  'ph-debt': ['Jail him over a tiny debt.'],
  'ph-seeds': ['Every picture maps every tiny detail.'],
  'wb-creed': ['Buried is only poetic decoration.'],
  'wb-women': ['The first report was a tidy win.'],
  'wb-early': ['Distance in time is the only question.'],
  'wb-method': ['A late pious novel is just as strong.'],
  'daily-lantern': ['A lamp is meant to stay hidden.'],
  'daily-stars': ['The sky is silent decoration.'],
  'daily-cosmos': ['Chance is enough for a livable world.'],
  'hl-moral': ['Duty is only a private feeling.'],
  'daily-names': ['Paul names no one who was alive.'],
  'daily-creed': ['The line is late, far from the event.'],
  'daily-empty': ['The tomb story is only a vision.'],
  'daily-gems': ['Pictures do not tell the story.'],
  'daily-seed': ['The parable flatters every field.'],
  'daily-neighbor': ['Neighbor means whoever already looks like you.'],
  'ob-tuning': ['The fittedness is only a rumor.'],
  'ob-design': ['Likelihood arguments are always dishonest.'],
  'ob-leibniz': ['Nothing needs a reason to exist.'],
  'ob-life': ['We should end research now.'],
  'daily-life': ['Minds that do science need no home.'],
  'fg-order': ['The world is a lucky pile with no holder.'],
  'fg-reason': ['Reason floats with no ground.'],
  'fg-ought': ['Nature as a pile is enough.'],
  'fg-ground': ['The foundation is a dead brick.'],
  'fg-mover': ['Things change themselves with no mover.'],
  'fg-contingent': ['It just is — that is enough.'],
  'fg-kalam': ['A beginning needs no Cause.'],
  'fg-limits': ['The first-cause walk is the whole gospel.'],
  'daily-scroll': ['Later hands never compare the copies.'],
  'daily-isaiah': ['The Servant answers with a sword.'],
  'hl-mind': ['Mind is a late accident at the end.'],
  'hl-meaning': ['Work and fun are the last good.'],
  'hl-beauty': ['The sunset feeds the hunger it wakes.'],
  'daily-grace': ['Grace is a wage you earned.'],
  'daily-rest': ['The invitation is a steeper program.'],
  'daily-door': ['The image is a wall, not a door.'],
}

const GENERIC_WHY_MISSES = [
  'The story is only a slogan.',
  'Nothing here asks us to change.',
  'This line is only about old rules.',
  'Names and dates do not matter.',
]

export function applyHoldMiss(score: number): number {
  return Math.max(0, score - HOLD_MISS_PENALTY)
}

export function whyBlastExtras(id: string): string[] {
  return WHY_BLAST_EXTRAS[id] ?? []
}

function uniqueWhyLines(
  lines: readonly string[],
  face: (line: string) => string,
  keep: string,
): string[] {
  return uniqueHoldChoices(lines, face, keep)
}

/** Keep first, then enough unique misses for a 4-chip board. No shuffle. */
export function whyBlastPool(
  keep: string,
  packMisses: readonly string[],
  extras: readonly string[] = [],
  face: (line: string) => string = easyWhyLine,
): string[] {
  const raw = [keep, ...packMisses.filter((line) => line && line !== keep), ...extras, ...GENERIC_WHY_MISSES]
  const unique = uniqueWhyLines(raw, face, keep)
  const keepFace = face(keep).trim()
  const misses = unique.filter((line) => face(line).trim() !== keepFace)
  return [keep, ...misses.slice(0, WHY_CHIP_COUNT - 1)]
}

/** Shuffled 4-chip why board. One correct. */
export function whyBlastChoices(
  keep: string,
  packMisses: readonly string[],
  extras: readonly string[] = [],
  face: (line: string) => string = easyWhyLine,
): string[] {
  return shuffle(whyBlastPool(keep, packMisses, extras, face))
}
