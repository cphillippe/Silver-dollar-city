/** Story Snap timing lane — beats fly under a gate; snap three → story opens → Hold. */

export const STORY_SNAP_LINE = 'daily-lantern'

/** Locked Easy Hold claim — do not rewrite. */
export const STORY_SNAP_CLAIM = 'A lamp is meant to be seen.'

export const STORY_SNAP_HINT = 'Tap when a beat is under the gate.'

export const STORY_SNAP_WIN = 'STORY OPEN!'

export const STORY_SNAP_SNAP = 'SNAP!'

export const STORY_SNAP_AGAIN = 'One more snap'

/** 1–2 line teach lead (already shown on Learn; echo only — do not replace shortStory). */
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

/** Snap window as fraction of travel (center of lane). */
export const SNAP_WINDOW = 0.14

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

/** Progress 0→1 along the fly lane. */
export function beatProgress(elapsedMs: number, durationMs: number): number {
  if (durationMs <= 0) return 1
  if (elapsedMs <= 0) return 0
  return Math.min(1, elapsedMs / durationMs)
}

/** True when the beat center is inside the snap gate window. */
export function inSnapWindow(progress: number): boolean {
  const half = SNAP_WINDOW / 2
  return progress >= GATE_AT - half && progress <= GATE_AT + half
}

export function beatPastGate(progress: number): boolean {
  return progress > GATE_AT + SNAP_WINDOW / 2
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
