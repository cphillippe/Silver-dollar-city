import type { NightMapId } from '../nightWatch/maps/chain.ts'

/** Plate size the Night Watch maps are drawn on. */
const PLATE_W = 798
const PLATE_H = 1134

/** A pointer that moves less than this many CSS px is still a tap. */
export const NW_TAP_SLOP = 8

/** Zoom on top of the fill scale `s0`, by map. */
export const NW_CAMERA_ZOOM: Record<NightMapId, number> = {
  a2: 1.4,
  'far-hills': 1.6,
  map03: 1.5,
  map04: 1.5,
  map05: 1.4,
  map06: 1.45,
}

/** Plate point the camera opens on, by map. */
export const NW_CAMERA_FOCUS: Record<NightMapId, { x: number; y: number }> = {
  a2: { x: 560, y: 900 },
  'far-hills': { x: 300, y: 900 },
  map03: { x: 399, y: 880 },
  map04: { x: 399, y: 880 },
  map05: { x: 399, y: 880 },
  map06: { x: 399, y: 880 },
}

/** Screen px. Top and the rail band are measured from the viewport top, bottom and right from its edges. */
export const NW_CAMERA_INSETS = { top: 97, bottom: 116, right: 65, rightBand: [98, 314] as readonly [number, number] }

export interface CamInsets {
  top: number
  bottom: number
  right: number
  rightBand: readonly [number, number]
}

export interface CamWorld {
  s0: number
  w: number
  h: number
}

export function camWorld(W: number, H: number, z: number): CamWorld {
  const s0 = Math.max(W / PLATE_W, H / PLATE_H)
  return { s0, w: PLATE_W * s0 * z, h: PLATE_H * s0 * z }
}

/** Plate point to px inside `.nw-zoom`, before the zoom and pan. */
export function camPoint(s0: number) {
  return (_box: unknown, p: { x: number; y: number }) => ({ left: p.x * s0, top: p.y * s0 })
}

/** Screen point to plate point. The same answer as `clientToMap` on the board svg. */
export function camToPlate(
  clientX: number,
  clientY: number,
  frameRect: { left: number; top: number },
  tx: number,
  ty: number,
  s0: number,
  z: number,
): { x: number; y: number } {
  return {
    x: (clientX - frameRect.left - tx) / (s0 * z),
    y: (clientY - frameRect.top - ty) / (s0 * z),
  }
}

function clamp(value: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, value))
}

/** The plain plate clamp. No void ever shows, and the insets never loosen it. */
export function camClamp(tx: number, ty: number, W: number, H: number, world: { w: number; h: number }): [number, number] {
  return [clamp(tx, W - world.w, 0), clamp(ty, H - world.h, 0)]
}

/** Viewport-px insets to frame px. */
export function camFrameInsets(frameTop: number, insets: CamInsets = NW_CAMERA_INSETS): CamInsets {
  return {
    top: insets.top - frameTop,
    bottom: insets.bottom,
    right: insets.right,
    rightBand: [insets.rightBand[0] - frameTop, insets.rightBand[1] - frameTop],
  }
}

/** Pan that puts plate point `p` in the middle of the clear window, then clamps. */
export function focusPan(
  p: { x: number; y: number },
  W: number,
  H: number,
  s0: number,
  z: number,
  insets: CamInsets,
): [number, number] {
  const world = camWorld(W, H, z)
  const k = s0 * z
  const [, ty] = camClamp(0, (insets.top + (H - insets.bottom)) / 2 - p.y * k, W, H, world)
  const screenY = ty + p.y * k
  const inBand = screenY >= insets.rightBand[0] && screenY <= insets.rightBand[1]
  const right = W - (inBand ? insets.right : 0)
  return camClamp(right / 2 - p.x * k, ty, W, H, world)
}

export function camTransform(tx: number, ty: number): string {
  return `translate3d(${tx}px, ${ty}px, 0)`
}

/** Easy, phone width, and not switched off by `VITE_NW_CAMERA=off` or `?nwCam=0`. */
export function nwCameraOn(easy: boolean, phoneSe: boolean, search: string): boolean {
  if (!easy || !phoneSe) return false
  const env = (import.meta as { env?: Record<string, string | undefined> }).env
  if (env?.VITE_NW_CAMERA === 'off') return false
  return new URLSearchParams(search).get('nwCam') !== '0'
}
