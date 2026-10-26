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
  /** Sparks / Candle column: frame px from the left edge (viewport x below this). */
  hudColumnRight: number
  /** Sparks / Candle column: frame px from the top of the cam frame down to this y. */
  hudColumnBottom: number
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

/** Viewport px: left dock column (Sparks badge + Candle) blocks rings and arrows. */
export const NW_HUD_COLUMN_LEFT = 80
/** Viewport px from the top of the screen through the dock column. */
export const NW_HUD_COLUMN_VIEWPORT_BOTTOM = 290

/** Viewport-px insets to frame px. */
export function camFrameInsets(
  frameTop: number,
  insets: Pick<CamInsets, 'top' | 'bottom' | 'right' | 'rightBand'> = NW_CAMERA_INSETS,
): CamInsets {
  return {
    top: insets.top - frameTop,
    bottom: insets.bottom,
    right: insets.right,
    rightBand: [insets.rightBand[0] - frameTop, insets.rightBand[1] - frameTop],
    hudColumnRight: NW_HUD_COLUMN_LEFT,
    hudColumnBottom: Math.max(0, NW_HUD_COLUMN_VIEWPORT_BOTTOM - frameTop),
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

export interface CamSeatView {
  W: number
  H: number
  s0: number
  z: number
  tx: number
  ty: number
}

/** Plate radius of a seat ring. */
const SEAT_R = 46

/** Plate radius of the Easy glowing-face tap disc (matches `EASY_FACE_HIT_R`). */
export const NW_CUE_FACE_R = 80

/** Frame px box of a plate marker at this pan. */
function markerBox(point: { x: number; y: number }, radiusPlate: number, view: CamSeatView) {
  const k = view.s0 * view.z
  const r = radiusPlate * k
  const left = view.tx + point.x * k - r
  const top = view.ty + point.y * k - r
  return { left, top, right: left + 2 * r, bottom: top + 2 * r }
}

function seatBox(seat: { x: number; y: number }, view: CamSeatView) {
  return markerBox(seat, SEAT_R, view)
}

function markerOverlapsHudColumn(
  box: { left: number; top: number; right: number; bottom: number },
  insets: CamInsets,
): boolean {
  if (insets.hudColumnBottom <= 0) return false
  const w = Math.min(box.right, insets.hudColumnRight) - Math.max(box.left, 0)
  const h = Math.min(box.bottom, insets.hudColumnBottom) - Math.max(box.top, 0)
  return w > 0 && h > 0
}

/** The ring sits whole inside the clear window: off the header, Begin, the lamp rail, and the dock column. */
export function camSeatClear(seat: { x: number; y: number }, view: CamSeatView, insets: CamInsets): boolean {
  const box = seatBox(seat, view)
  const inBand = box.bottom >= insets.rightBand[0] && box.top <= insets.rightBand[1]
  if (markerOverlapsHudColumn(box, insets)) return false
  return (
    box.left >= 0 &&
    box.right <= view.W &&
    box.right <= view.W - (inBand ? insets.right : 0) &&
    box.top >= insets.top &&
    box.bottom <= view.H - insets.bottom
  )
}

/** A ring counts as in view when at least this share of it sits in the clear window. */
export const NW_RING_MIN_SHARE = 0.9

/** A glowing face counts as in view at the same share as the first-seat ring. */
export const NW_CUE_MIN_SHARE = NW_RING_MIN_SHARE

/** Hide the walker edge arrow once at least this much of the face disc is visible. */
export const NW_CUE_ARROW_HIDE_SHARE = 0.5

/** After map or face touch, auto-follow waits this long before panning again. */
export const NW_CAM_TOUCH_HOLD_MS = 1000

/** Share of a marker (0 to 1) inside the clear window: off the header, Begin and the lamp rail. */
export function camMarkerShare(
  point: { x: number; y: number },
  radiusPlate: number,
  view: CamSeatView,
  insets: CamInsets,
): number {
  const box = markerBox(point, radiusPlate, view)
  const inBand = box.bottom >= insets.rightBand[0] && box.top <= insets.rightBand[1]
  const clearLeft =
    insets.hudColumnBottom > 0 && box.top < insets.hudColumnBottom
      ? Math.max(0, insets.hudColumnRight)
      : 0
  const clearRight = view.W - (inBand ? insets.right : 0)
  const w = Math.min(box.right, clearRight) - Math.max(box.left, clearLeft)
  const h = Math.min(box.bottom, view.H - insets.bottom) - Math.max(box.top, insets.top)
  if (w <= 0 || h <= 0) return 0
  return (w * h) / ((box.right - box.left) * (box.bottom - box.top))
}

/** Share of the ring (0 to 1) inside the clear window: off the header, Begin and the lamp rail. */
export function camSeatShare(seat: { x: number; y: number }, view: CamSeatView, insets: CamInsets): number {
  return camMarkerShare(seat, SEAT_R, view, insets)
}

/**
 * The one seat that wears the gold first-seat ring before the first lamp.
 * (a) the held seat while at least NW_RING_MIN_SHARE of its ring shows;
 * (b) else the first live seat whole in the clear window;
 * (c) else the live seat with the most ring at or above NW_RING_MIN_SHARE;
 * (d) else null (edge arrow is the gold cue).
 */
export function camFirstSeat<T extends { x: number; y: number; live?: boolean }>(
  seats: readonly T[],
  view: CamSeatView,
  insets: CamInsets,
  keep: { x: number; y: number } | null = null,
): T | null {
  const held = keep ? seats.find((seat) => seat.live && seat.x === keep.x && seat.y === keep.y) : undefined
  if (held && camSeatShare(held, view, insets) >= NW_RING_MIN_SHARE) return held
  for (const seat of seats) {
    if (seat.live && camSeatClear(seat, view, insets)) return seat
  }
  let best: T | null = null
  let bestShare = NW_RING_MIN_SHARE
  for (const seat of seats) {
    if (!seat.live) continue
    const share = camSeatShare(seat, view, insets)
    if (share + 1e-9 < NW_RING_MIN_SHARE) continue
    if (best === null || share > bestShare + 1e-9) {
      best = seat
      bestShare = share
    }
  }
  return best
}

/** Radius of the edge arrow, and how far its centre stays from the screen edge. */
export const NW_ARROW_R = 22
export const NW_EDGE_ARROW_PAD = 18

function camArrowWindow(view: CamSeatView, insets: CamInsets) {
  const left = NW_EDGE_ARROW_PAD + NW_ARROW_R
  const top = insets.top + NW_ARROW_R + NW_EDGE_ARROW_PAD
  const bottom = view.H - insets.bottom - NW_ARROW_R - NW_EDGE_ARROW_PAD
  const rightBelowRail = view.W - NW_ARROW_R - NW_EDGE_ARROW_PAD
  const rightInBand = view.W - insets.right - NW_ARROW_R - NW_EDGE_ARROW_PAD
  return { left, top, bottom, rightBelowRail, rightInBand, rightBand: insets.rightBand }
}

function camEdgeArrowAt(
  cx: number,
  cy: number,
  tx: number,
  ty: number,
  left: number,
  top: number,
  right: number,
  bottom: number,
): { x: number; y: number; angle: number } | null {
  const dx = tx - cx
  const dy = ty - cy
  if (!(Math.abs(dx) + Math.abs(dy) > 1e-6)) return null
  const steps: number[] = []
  if (dx > 0) steps.push((right - cx) / dx)
  else if (dx < 0) steps.push((left - cx) / dx)
  if (dy > 0) steps.push((bottom - cy) / dy)
  else if (dy < 0) steps.push((top - cy) / dy)
  let t = Infinity
  for (const value of steps) {
    if (value > 0 && Number.isFinite(value) && value < t) t = value
  }
  if (!(t > 0 && Number.isFinite(t))) return null
  return { x: cx + dx * t, y: cy + dy * t, angle: (Math.atan2(dy, dx) * 180) / Math.PI }
}

/** Frame px centre of the edge arrow and the way it points (degrees, 0 is right), toward the nearest open seat. */
export function camSeatArrow<T extends { x: number; y: number; live?: boolean }>(
  seats: readonly T[],
  view: CamSeatView,
  insets: CamInsets,
): { x: number; y: number; angle: number; seat: T } | null {
  const k = view.s0 * view.z
  const win = camArrowWindow(view, insets)
  if (win.rightBelowRail <= win.left || win.bottom <= win.top) return null
  const cx = (win.left + win.rightBelowRail) / 2
  const cy = (win.top + win.bottom) / 2
  let near: T | null = null
  let nearDist = Infinity
  for (const seat of seats) {
    if (!seat.live) continue
    const sx = view.tx + seat.x * k
    const sy = view.ty + seat.y * k
    const dist = Math.hypot(sx - cx, sy - cy)
    if (dist < nearDist) {
      near = seat
      nearDist = dist
    }
  }
  if (!near) return null
  const ty = view.ty + near.y * k
  const seatRight = ty >= win.rightBand[0] && ty <= win.rightBand[1] ? win.rightInBand : win.rightBelowRail
  const at = camEdgeArrowAt(
    cx,
    cy,
    view.tx + near.x * k,
    ty,
    win.left,
    win.top,
    seatRight,
    win.bottom,
  )
  if (!at) return null
  return { ...at, seat: near }
}

/** Edge arrow toward one plate point (glowing walker fallback when auto-pan cannot fit it). */
export function camPointArrow(
  point: { x: number; y: number },
  view: CamSeatView,
  insets: CamInsets,
): { x: number; y: number; angle: number } | null {
  const k = view.s0 * view.z
  const win = camArrowWindow(view, insets)
  const py = view.ty + point.y * k
  const right = py >= win.rightBand[0] && py <= win.rightBand[1] ? win.rightInBand : win.rightBelowRail
  if (right <= win.left || win.bottom <= win.top) return null
  const cx = (win.left + right) / 2
  const cy = (win.top + win.bottom) / 2
  return camEdgeArrowAt(cx, cy, view.tx + point.x * k, py, win.left, win.top, right, win.bottom)
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
