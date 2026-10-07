import type { NightPoint } from '../types.ts'
import type { NightBoardBox, NightBoardView, NightMapSurface } from './surface.ts'

/** Same plate as NIGHT_MAP. Kept here so this camera does not load the image. */
const PHONE_PLATE: NightMapSurface = {
  width: 798,
  height: 1134,
  viewBox: '0 0 798 1134',
  plate: null,
}

/**
 * Easy phone camera (1.4.379).
 * The stage fills the screen. This window matches that box so the plate
 * paints edge to edge and the purple frame does not come back.
 * Desktop and Hard keep `boardView` (the whole plate).
 */
export function boardFill(box: NightBoardBox, map: NightMapSurface = PHONE_PLATE): NightBoardView {
  if (!(box.w > 0) || !(box.h > 0)) {
    return { x: 0, y: 0, w: map.width, h: map.height, scale: 1, left: 0, top: 0 }
  }
  const byW = box.w / map.width
  const byH = box.h / map.height
  const scale = byW > byH ? byW : byH
  const w = box.w / scale
  const h = box.h / scale
  return {
    x: (map.width - w) / 2,
    y: (map.height - h) / 2,
    w,
    h,
    scale,
    left: 0,
    top: 0,
  }
}

export function boardFillBox(box: NightBoardBox, map: NightMapSurface = PHONE_PLATE): string {
  const view = boardFill(box, map)
  return `${view.x} ${view.y} ${view.w} ${view.h}`
}

/** Map point → CSS px. Same window as `boardFillBox`. */
export function boardFillPoint(
  box: NightBoardBox,
  point: NightPoint,
  map: NightMapSurface = PHONE_PLATE,
): { left: number; top: number } {
  const view = boardFill(box, map)
  return {
    left: view.left + (point.x - view.x) * view.scale,
    top: view.top + (point.y - view.y) * view.scale,
  }
}
