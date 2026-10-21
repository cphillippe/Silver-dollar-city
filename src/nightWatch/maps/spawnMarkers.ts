import type { NightMapId } from './chain.ts'

/** Plate units. 192 px art drawn at 2 px per unit. */
export const SPAWN_BOX_U = 96
/** HUD fallback stops shrinking here. */
export const SPAWN_MIN_SCALE = 0.7
/** CSS pixels to step inward from path point 0 when the tray still covers a 0.70 arch. */
export const SPAWN_EDGE_INSET_PX = 8

export interface SpawnMarker {
  mapId: NightMapId
  roadId: string
  /** Center, plate units. */
  x: number
  y: number
  rotationDeg: number
  asset: string
}

/**
 * One arch per distinct road start. map03 west+east share west.
 * map05 eastIn+eastOut share eastIn. Plate is 798×1134.
 */
export const SPAWN_MARKERS: readonly SpawnMarker[] = [
  { mapId: 'a2', roadId: 'main', x: 623, y: 1010, rotationDeg: -90, asset: 'spawn_a2.png' },
  { mapId: 'far-hills', roadId: 'main', x: 171, y: 1054, rotationDeg: 0, asset: 'spawn_far-hills.png' },
  { mapId: 'map03', roadId: 'west', x: 399, y: 1053, rotationDeg: 0, asset: 'spawn_map03.png' },
  { mapId: 'map04', roadId: 'a', x: 313, y: 1054, rotationDeg: 0, asset: 'spawn_map04.png' },
  { mapId: 'map04', roadId: 'b', x: 485, y: 1054, rotationDeg: 0, asset: 'spawn_map04.png' },
  { mapId: 'map05', roadId: 'west', x: 175, y: 1052, rotationDeg: 0, asset: 'spawn_map05.png' },
  { mapId: 'map05', roadId: 'eastIn', x: 621, y: 1055, rotationDeg: 0, asset: 'spawn_map05.png' },
  { mapId: 'map06', roadId: 'w', x: 171, y: 1015, rotationDeg: 74.2, asset: 'spawn_map06.png' },
  { mapId: 'map06', roadId: 'c', x: 403, y: 1054, rotationDeg: 0, asset: 'spawn_map06.png' },
  { mapId: 'map06', roadId: 'e', x: 672, y: 1052, rotationDeg: -74.2, asset: 'spawn_map06.png' },
]

export function spawnMarkersFor(mapId: NightMapId): readonly SpawnMarker[] {
  return SPAWN_MARKERS.filter((row) => row.mapId === mapId)
}

/** Hard mounts nothing. A board without a plate mounts nothing. */
export function spawnMarkersMounted(easy: boolean, hasPlate: boolean): boolean {
  return easy === true && hasPlate === true
}

export interface SpawnPlateBox {
  left: number
  right: number
  top: number
  bottom: number
}

/** Axis-aligned plate box of the rotated square. */
export function spawnMarkerPlateBox(marker: SpawnMarker, scale = 1): SpawnPlateBox {
  const half = (SPAWN_BOX_U / 2) * scale
  const rad = (marker.rotationDeg * Math.PI) / 180
  const ext = half * (Math.abs(Math.cos(rad)) + Math.abs(Math.sin(rad)))
  return {
    left: marker.x - ext,
    right: marker.x + ext,
    top: marker.y - ext,
    bottom: marker.y + ext,
  }
}

export interface SpawnHudRect {
  left: number
  right: number
  top: number
  bottom: number
}

/** Client pixels of the plate camera. `origin` is plate (0, 0). */
export interface SpawnCamera {
  vbX: number
  vbY: number
  /** CSS px per plate unit. */
  scale: number
  originX: number
  originY: number
}

export interface SpawnEntry {
  x: number
  y: number
  /** Unit step from path point 0 toward the next point. */
  nx: number
  ny: number
}

export interface SpawnFit {
  x: number
  y: number
  scale: number
  step: 'base' | 'scaled' | 'edge'
}

function clientBox(x: number, y: number, scale: number, rotationDeg: number, camera: SpawnCamera): SpawnHudRect {
  const half = (SPAWN_BOX_U / 2) * scale * camera.scale
  const rad = (rotationDeg * Math.PI) / 180
  const ext = half * (Math.abs(Math.cos(rad)) + Math.abs(Math.sin(rad)))
  const cx = camera.originX + x * camera.scale
  const cy = camera.originY + y * camera.scale
  return { left: cx - ext, right: cx + ext, top: cy - ext, bottom: cy + ext }
}

function overlaps(a: SpawnHudRect, b: SpawnHudRect): boolean {
  const w = Math.min(a.right, b.right) - Math.max(a.left, b.left)
  const h = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top)
  return w > 0 && h > 0
}

function hitsHud(
  x: number,
  y: number,
  scale: number,
  rotationDeg: number,
  camera: SpawnCamera,
  hud: readonly SpawnHudRect[],
): boolean {
  const box = clientBox(x, y, scale, rotationDeg, camera)
  return hud.some((rect) => overlaps(box, rect))
}

/**
 * 1. Place at the authored center, scale 1.
 * 2. If that box meets the Still/Mend tray or the hearts, shrink around the center down to 0.70.
 * 3. If 0.70 still meets them, sit on the road's spawn edge, 8 CSS px inland, at 0.70.
 */
export function resolveSpawnFit(
  marker: SpawnMarker,
  camera: SpawnCamera,
  hud: readonly SpawnHudRect[],
  entry: SpawnEntry,
): SpawnFit {
  if (!(camera.scale > 0)) {
    return { x: marker.x, y: marker.y, scale: 1, step: 'base' }
  }
  if (!hitsHud(marker.x, marker.y, 1, marker.rotationDeg, camera, hud)) {
    return { x: marker.x, y: marker.y, scale: 1, step: 'base' }
  }
  for (let cents = 99; cents >= 70; cents -= 1) {
    const scale = cents / 100
    if (!hitsHud(marker.x, marker.y, scale, marker.rotationDeg, camera, hud)) {
      return { x: marker.x, y: marker.y, scale, step: 'scaled' }
    }
  }
  const inset = SPAWN_EDGE_INSET_PX / camera.scale
  return {
    x: Math.round((entry.x + entry.nx * inset) * 100) / 100,
    y: Math.round((entry.y + entry.ny * inset) * 100) / 100,
    scale: SPAWN_MIN_SCALE,
    step: 'edge',
  }
}

/**
 * The lamp rail and the round label sit on the board at wide windows.
 * Push the arch off them by the smallest move. Tray and hearts are already
 * handled by `resolveSpawnFit`.
 */
export function slideSpawnOffHud(
  marker: SpawnMarker,
  fit: SpawnFit,
  camera: SpawnCamera,
  hud: readonly SpawnHudRect[],
): SpawnFit {
  if (!(camera.scale > 0) || hud.length < 1) return fit
  let x = fit.x
  let y = fit.y
  let moved = false
  for (let pass = 0; pass < 4; pass += 1) {
    const box = clientBox(x, y, fit.scale, marker.rotationDeg, camera)
    let dx = 0
    let dy = 0
    for (const rect of hud) {
      if (!overlaps(box, rect)) continue
      const options = [
        { x: rect.left - box.right, y: 0 },
        { x: rect.right - box.left, y: 0 },
        { x: 0, y: rect.top - box.bottom },
        { x: 0, y: rect.bottom - box.top },
      ]
      options.sort((a, b) => Math.abs(a.x) + Math.abs(a.y) - (Math.abs(b.x) + Math.abs(b.y)))
      const push = options[0]
      if (!push || (push.x === 0 && push.y === 0)) continue
      dx += push.x
      dy += push.y
    }
    if (dx === 0 && dy === 0) break
    x += dx / camera.scale
    y += dy / camera.scale
    moved = true
  }
  if (!moved) return fit
  return {
    x: Math.round(x * 100) / 100,
    y: Math.round(y * 100) / 100,
    scale: fit.scale,
    step: fit.step === 'base' ? 'edge' : fit.step,
  }
}

/**
 * Tall phones crop the plate sides. A rotated side arch can leave the window
 * even when the tray and hearts are clear. Slide it in, and keep the HUD step
 * unless this slide is what moved it.
 */
export function nudgeSpawnIntoView(
  marker: SpawnMarker,
  fit: SpawnFit,
  camera: SpawnCamera,
  view: { width: number; height: number },
): SpawnFit {
  if (!(camera.scale > 0) || !(view.width > 0) || !(view.height > 0)) return fit
  const box = clientBox(fit.x, fit.y, fit.scale, marker.rotationDeg, camera)
  let dx = 0
  let dy = 0
  if (box.left < 0) dx = -box.left
  else if (box.right > view.width) dx = view.width - box.right
  if (box.top < 0) dy = -box.top
  else if (box.bottom > view.height) dy = view.height - box.bottom
  if (dx === 0 && dy === 0) return fit
  return {
    x: Math.round((fit.x + dx / camera.scale) * 100) / 100,
    y: Math.round((fit.y + dy / camera.scale) * 100) / 100,
    scale: fit.scale,
    step: fit.step === 'base' ? 'edge' : fit.step,
  }
}
