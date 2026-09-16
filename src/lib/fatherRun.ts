/** Father-run timing dash — close the gap before the hired-hand speech is done. */

export const FATHER_RUN_LINE = 'ph-father'

/** Locked Easy Hold claim — do not rewrite. */
export const FATHER_RUN_CLAIM = 'The father runs with mercy before the speech is done.'

export const FATHER_RUN_HINT = 'The run comes before the apology is done.'

export const FATHER_RUN_WIN = 'Hugged!'

export const FATHER_RUN_AGAIN = 'One more run'

export const FATHER_RUN_DASH_SCORE = 25
export const FATHER_RUN_HUG_SCORE = 100

/** Luke 15 hired-hand speech — the clock. Hug before the last phrase lands. */
export const HIRED_HAND_SPEECH = [
  'Father, I have sinned against heaven',
  'and before you.',
  'I am no longer worthy to be called your son.',
  'Make me like one of your hired servants.',
] as const

export const SPEECH_PHRASE_MS = 2600
export const HOLD_SPEED = 0.078
export const HOLD_SPEED_REDUCED = 0.12
export const DASH_BOOST = 0.16
export const DASH_PERIOD_MS = 2300
export const DASH_WINDOW_MS = 560
export const RETRY_CLOSER = 0.18
export const MIN_START_GAP = 0.42

export type FatherRunPhase = 'ready' | 'run' | 'hug' | 'miss'

export function speechDurationMs(): number {
  return HIRED_HAND_SPEECH.length * SPEECH_PHRASE_MS
}

export function fatherStartProgress(attempt: number): number {
  if (attempt <= 0) return 0
  return Math.min(1 - MIN_START_GAP, attempt * RETRY_CLOSER)
}

export function speechIndexAt(elapsedMs: number): number {
  if (elapsedMs < 0) return 0
  return Math.min(HIRED_HAND_SPEECH.length, Math.floor(elapsedMs / SPEECH_PHRASE_MS))
}

export function speechPhraseAt(elapsedMs: number): string {
  const index = Math.min(HIRED_HAND_SPEECH.length - 1, speechIndexAt(elapsedMs))
  return HIRED_HAND_SPEECH[index] ?? HIRED_HAND_SPEECH[0]
}

export function speechFinished(elapsedMs: number): boolean {
  return elapsedMs >= speechDurationMs()
}

export function dashPhase(elapsedMs: number): { inWindow: boolean; travel: number } {
  if (elapsedMs < 0) return { inWindow: false, travel: 0 }
  const cycle = elapsedMs % DASH_PERIOD_MS
  const windowStart = DASH_PERIOD_MS - DASH_WINDOW_MS
  if (cycle < windowStart) {
    return { inWindow: false, travel: cycle / windowStart }
  }
  return {
    inWindow: true,
    travel: windowStart === 0 ? 1 : 1,
  }
}

export function holdStep(
  progress: number,
  dtSec: number,
  holding: boolean,
  reduced = false,
): number {
  if (!holding || dtSec <= 0) return progress
  const speed = reduced ? HOLD_SPEED_REDUCED : HOLD_SPEED
  return Math.min(1, progress + speed * dtSec)
}

export function applyDash(progress: number): number {
  return Math.min(1, progress + DASH_BOOST)
}

/** How many story beats are open. First beat is up before the run; hug opens the last. */
export function beatsOpened(progress: number, beatCount: number): number {
  if (beatCount <= 0) return 0
  if (progress >= 1) return beatCount
  if (beatCount === 1) return 1
  const opened = 1 + Math.floor(progress * (beatCount - 1))
  return Math.min(beatCount - 1, Math.max(1, opened))
}

export function fatherReached(progress: number): boolean {
  return progress >= 1
}

/** Win = hug lands while the hired-hand speech is still unfinished. */
export function hugBeforeSpeech(progress: number, elapsedMs: number): boolean {
  return fatherReached(progress) && !speechFinished(elapsedMs)
}

export function runOutcome(
  progress: number,
  elapsedMs: number,
): 'run' | 'hug' | 'miss' {
  if (hugBeforeSpeech(progress, elapsedMs)) return 'hug'
  if (speechFinished(elapsedMs) && !fatherReached(progress)) return 'miss'
  return 'run'
}
