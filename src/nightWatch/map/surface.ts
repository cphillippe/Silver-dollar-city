import type { NightPoint } from '../types.ts'
import nwMapPlate from '../../assets/defend/nw-map-plate.png'

export interface NightMapSurface {
  readonly width: number
  readonly height: number
  readonly viewBox: string
  /** Painted playfield plate in viewBox units. null keeps the SVG dusk board. */
  readonly plate: string | null
}

export const NIGHT_MAP: NightMapSurface = {
  width: 640,
  height: 420,
  viewBox: '0 0 640 420',
  plate: nwMapPlate,
}

export interface NightBoardBox {
  w: number
  h: number
}

/** Contain camera: the whole plate, scaled by `scale` and centred at `left`/`top` CSS px in the box. */
export interface NightBoardView {
  x: number
  y: number
  w: number
  h: number
  scale: number
  left: number
  top: number
}

/**
 * Whole plate, never cropped: fits the box and letterboxes the leftover stage
 * (matches preserveAspectRatio="xMidYMid meet").
 */
export function boardView(box: NightBoardBox, map: NightMapSurface = NIGHT_MAP): NightBoardView {
  const scale = box.w > 0 && box.h > 0 ? Math.min(box.w / map.width, box.h / map.height) : 1
  return {
    x: 0,
    y: 0,
    w: map.width,
    h: map.height,
    scale,
    left: (box.w - map.width * scale) / 2,
    top: (box.h - map.height * scale) / 2,
  }
}

export function boardViewBox(box: NightBoardBox, map: NightMapSurface = NIGHT_MAP): string {
  const view = boardView(box, map)
  return `${view.x} ${view.y} ${view.w} ${view.h}`
}

/** Map point → CSS px inside the rendered board (same contain camera as `boardViewBox`). */
export function boardPoint(
  box: NightBoardBox,
  point: NightPoint,
  map: NightMapSurface = NIGHT_MAP,
): { left: number; top: number } {
  const view = boardView(box, map)
  return {
    left: view.left + (point.x - view.x) * view.scale,
    top: view.top + (point.y - view.y) * view.scale,
  }
}
