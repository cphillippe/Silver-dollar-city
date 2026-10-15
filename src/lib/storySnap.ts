/** Story Snap timing lane — beats fly under a gate; snap three → story opens → Lock In. */

export const STORY_SNAP_LINE = 'daily-lantern'

/** Locked Easy Hold claim — do not rewrite. */
export const STORY_SNAP_CLAIM = 'A lamp is meant to be seen.'

export const STORY_SNAP_HINT = 'Tap when a beat is under the gate.'

export const STORY_SNAP_WIN = 'STORY OPEN!'

export const STORY_SNAP_SNAP = 'SNAP!'

export const STORY_SNAP_AGAIN = 'One more snap'

/** Learn shortStory lead — play peels reprint (1.4.163 / #209). Kept for reference; do not wire into Snap play. */
export const STORY_SNAP_TEACH =
  'Jesus talks about an ordinary lamp and a city on a hill. Light is meant to be seen.'

export const SNAP_SCORE = 25
export const STORY_OPEN_SCORE = 100
export const MISS_PENALTY = 25

/** Beats needed to open the story. */
export const SNAPS_TO_OPEN = 3

/** How long a beat takes to cross the lane (ms). Father-run–adjacent timing feel. */
export const BEAT_TRAVEL_MS = 2200
export const BEAT_TRAVEL_MS_REDUCED = 2800

/** Snap window as fraction of travel (center of lane). Hard stays this wide. */
export const SNAP_WINDOW = 0.14

/** Easy snap window in milliseconds. About twice the hard gate. */
export const EASY_SNAP_MS = 600

/** Ghost-hand travel. Slower than a player beat so the tap reads. */
export const DEMO_TRAVEL_MS = 3600
export const DEMO_TRAVEL_MS_REDUCED = 4200

/** How long the demo beat rests under the gate before it locks. */
export const DEMO_HOLD_MS = 900

/** Gate sits at mid-lane. */
export const GATE_AT = 0.5

export type StorySnapPhase = 'ready' | 'fly' | 'snap' | 'open' | 'miss'

export interface StorySnapBeat {
  id: string
  text: string
  /** Short chip on the flying card. */
  label: string
}

/** Lantern parable beats — three snaps release the story strip. */
export const STORY_SNAP_BEATS: readonly StorySnapBeat[] = [
  {
    id: 'lamp',
    label: 'Lamp',
    text: 'An ordinary lamp is set where it can shine.',
  },
  {
    id: 'hill',
    label: 'Hill',
    text: 'A city on a hill cannot be hidden.',
  },
  {
    id: 'seen',
    label: 'Seen',
    text: 'Light is meant to be seen — so others can find their way.',
  },
] as const

export function travelMs(reduced = false): number {
  return reduced ? BEAT_TRAVEL_MS_REDUCED : BEAT_TRAVEL_MS
}

export function demoTravelMs(reduced = false): number {
  return reduced ? DEMO_TRAVEL_MS_REDUCED : DEMO_TRAVEL_MS
}

/**
 * Snap window as a fraction of this beat's travel.
 * Hard keeps SNAP_WINDOW. Easy is about EASY_SNAP_MS wide.
 */
export function snapWindowFraction(durationMs: number, easy: boolean): number {
  if (!easy) return SNAP_WINDOW
  if (durationMs <= 0) return SNAP_WINDOW
  return Math.min(0.8, EASY_SNAP_MS / durationMs)
}

/** Progress 0→1 along the fly lane. */
export function beatProgress(elapsedMs: number, durationMs: number): number {
  if (durationMs <= 0) return 1
  if (elapsedMs <= 0) return 0
  return Math.min(1, elapsedMs / durationMs)
}

/** True when the beat center is inside the snap gate window. */
export function inSnapWindow(progress: number, windowFraction = SNAP_WINDOW): boolean {
  const half = windowFraction / 2
  return progress >= GATE_AT - half && progress <= GATE_AT + half
}

export function beatPastGate(progress: number, windowFraction = SNAP_WINDOW): boolean {
  return progress > GATE_AT + windowFraction / 2
}

/** Easy only: a fly-past is a miss when the player tapped outside the gate. */
export function missOnFlyPast(playerTapped: boolean): boolean {
  return playerTapped
}

/** Hard still counts every fly-past as a miss. Easy uses missOnFlyPast. */
export function flyPastIsMiss(playerTapped: boolean, easy: boolean): boolean {
  return easy ? missOnFlyPast(playerTapped) : true
}

/** Easy score. Filled stars are snaps already locked. No digits. */
export function easySnapStars(lockedCount: number): string {
  const n = Math.max(0, Math.min(SNAPS_TO_OPEN, Math.floor(lockedCount)))
  return `${'★'.repeat(n)}${'☆'.repeat(SNAPS_TO_OPEN - n)}`
}

export function snapsDone(locked: number): boolean {
  return locked >= SNAPS_TO_OPEN
}

export function applySnapScore(score: number): number {
  return score + SNAP_SCORE
}

export function applyOpenScore(score: number): number {
  return score + STORY_OPEN_SCORE
}

export function applyMissScore(score: number): number {
  return Math.max(0, score - MISS_PENALTY)
}

/** Easy miss copy. No points, so no digit. */
export const MISS_TRY_AGAIN = 'Miss — try again'

/** Shown when the ghost hand finishes the first beat. */
export const DEMO_TURN = 'Your turn!'

/** Points a miss actually takes. Easy stays put. Hard uses applyMissScore. */
export function missPointsLost(score: number, easy: boolean): number {
  if (easy) return 0
  return Math.max(0, score - applyMissScore(score))
}

/** Toast for a miss. A zero loss, Easy or Hard, names no number. */
export function missToast(lost: number): string {
  if (lost <= 0) return MISS_TRY_AGAIN
  return `Miss −${lost}`
}

/** A miss keeps every beat already locked. */
export function lockedAfterMiss<T>(lockedIds: readonly T[]): T[] {
  return [...lockedIds]
}

/** The demo snap adds nothing. */
export function applyDemoSnap(score: number): number {
  return score
}

/** The demo beat counts as locked, same as a player snap. */
export function demoCountsLocked(lockedIds: readonly string[], beatId: string): string[] {
  if (lockedIds.includes(beatId)) return [...lockedIds]
  return [...lockedIds, beatId]
}

/** Next unlocked beat index; wraps / recycles misses via caller queue. */
export function nextBeatIndex(lockedIds: readonly string[]): number {
  for (let i = 0; i < STORY_SNAP_BEATS.length; i += 1) {
    const id = STORY_SNAP_BEATS[i]?.id
    if (id && !lockedIds.includes(id)) return i
  }
  return 0
}

export function beatByIndex(index: number): StorySnapBeat {
  const beat = STORY_SNAP_BEATS[index % STORY_SNAP_BEATS.length]
  return beat ?? STORY_SNAP_BEATS[0]
}

export function allBeatsLocked(lockedIds: readonly string[]): boolean {
  return STORY_SNAP_BEATS.every((beat) => lockedIds.includes(beat.id))
}
