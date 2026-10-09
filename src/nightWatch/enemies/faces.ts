import type { WalkerKind } from '../../types.ts'

/**
 * Portraits already in the repo. The climb roster reuses these six;
 * guys 7–13 do not have their own drawings.
 * Order is the first six climb guys, so a fresh wave walks that line.
 */
export const WALKER_FACE_POOL: readonly WalkerKind[] = [
  'skeptic',
  'image-bearer',
  'spiritual',
  'pagan',
  'physical',
  'metaphysical',
]

/** Every portrait file is this square. */
export const WALKER_PORTRAIT_PX = 384

/**
 * Head window in portrait pixels. The road circle stays the same size and place.
 * This window sits the head in that circle. The pointing hand stays outside it.
 */
export const WALKER_HEAD_X = 112
export const WALKER_HEAD_SIZE = 160
export const WALKER_HEAD_VIEW = `${WALKER_HEAD_X} 0 ${WALKER_HEAD_SIZE} ${WALKER_HEAD_SIZE}`

/**
 * Face for this spawn. Skips any face already on the road.
 * Same wave, spawn index, and live faces always return the same portrait,
 * so a 1× night and a 3× night show the same heads.
 * Kind, HP, gait, and the boss stay on the walker. This only picks the picture.
 */
export function pickWalkerFace(
  waveIndex: number,
  spawnIndex: number,
  liveFaces: readonly string[],
): WalkerKind {
  const wave = Number.isFinite(waveIndex) ? Math.max(0, Math.floor(waveIndex)) : 0
  const spawn = Number.isFinite(spawnIndex) ? Math.max(0, Math.floor(spawnIndex)) : 0
  const busy = new Set(liveFaces)
  const start = (wave + spawn) % WALKER_FACE_POOL.length
  for (let step = 0; step < WALKER_FACE_POOL.length; step++) {
    const face = WALKER_FACE_POOL[(start + step) % WALKER_FACE_POOL.length]
    if (!busy.has(face)) return face
  }
  return WALKER_FACE_POOL[start]
}
