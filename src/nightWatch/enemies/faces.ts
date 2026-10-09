/**
 * Easy portrait pool. The first six are the climb kinds.
 * The next six are extra heads, not new kinds, so hits and health stay put.
 * Order is stable: the same wave and spawn index pick the same portrait.
 */
export const WALKER_FACE_POOL = [
  'skeptic',
  'image-bearer',
  'spiritual',
  'pagan',
  'physical',
  'metaphysical',
  'grandma-scarf',
  'curly-youth',
  'bald-merchant',
  'braids-girl',
  'fisher-cap',
  'scholar-beard',
] as const

export type WalkerFaceId = (typeof WALKER_FACE_POOL)[number]

/** Every portrait file is this square. */
export const WALKER_PORTRAIT_PX = 384

/**
 * The road circle shows this whole square, then the face clip rounds it.
 * A window like "112 0 160 160" sits on the badge and cuts the face off.
 */
export const WALKER_HEAD_VIEW = `0 0 ${WALKER_PORTRAIT_PX} ${WALKER_PORTRAIT_PX}`

const faceUrl = (file: string) => new URL(`../../assets/walkers/${file}`, import.meta.url).href

export const WALKER_FACE_SRC: Record<WalkerFaceId, string> = {
  skeptic: faceUrl('walker-skeptic.png'),
  'image-bearer': faceUrl('walker-image-bearer.png'),
  spiritual: faceUrl('walker-spiritual.png'),
  pagan: faceUrl('walker-pagan.png'),
  physical: faceUrl('walker-physical.png'),
  metaphysical: faceUrl('walker-metaphysical.png'),
  'grandma-scarf': faceUrl('walker-grandma-scarf.png'),
  'curly-youth': faceUrl('walker-curly-youth.png'),
  'bald-merchant': faceUrl('walker-bald-merchant.png'),
  'braids-girl': faceUrl('walker-braids-girl.png'),
  'fisher-cap': faceUrl('walker-fisher-cap.png'),
  'scholar-beard': faceUrl('walker-scholar-beard.png'),
}

export function walkerFaceSrc(id: string): string | undefined {
  if ((WALKER_FACE_POOL as readonly string[]).includes(id)) {
    return WALKER_FACE_SRC[id as WalkerFaceId]
  }
  return undefined
}

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
): WalkerFaceId {
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
