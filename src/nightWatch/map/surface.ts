import type { NightPoint } from '../types.ts'
import { DEFEND_PATH } from '../path/data.ts'
import { HEAVEN_POINT } from '../../lib/defend.ts'
import nwMapPlate from '../../assets/defend/nw-map-plate.png'

export interface NightRect {
  readonly x0: number
  readonly y0: number
  readonly x1: number
  readonly y1: number
}

export interface NightMapSurface {
  readonly width: number
  readonly height: number
  readonly viewBox: string
  /** Painted playfield plate in viewBox units. null keeps the SVG dusk board. */
  readonly plate: string | null
  /** Cover crops never cut this (the walker road) while the crop is wide enough to hold it. */
  readonly keep: NightRect
  /** Cover crops centre on this when it fits beside `keep` (road + City of Heaven sign). */
  readonly reach: NightRect
}

const WALKER_PAD = 18

function pathRect(points: readonly NightPoint[], pad: number): NightRect {
  const xs = points.map((point) => point.x)
  const ys = points.map((point) => point.y)
  return {
    x0: Math.min(...xs) - pad,
    y0: Math.min(...ys) - pad,
    x1: Math.max(...xs) + pad,
    y1: Math.max(...ys) + pad,
  }
}

function union(a: NightRect, b: NightRect): NightRect {
  return {
    x0: Math.min(a.x0, b.x0),
    y0: Math.min(a.y0, b.y0),
    x1: Math.max(a.x1, b.x1),
    y1: Math.max(a.y1, b.y1),
  }
}

const ROAD_KEEP = pathRect(DEFEND_PATH, WALKER_PAD)
const HEAVEN_SIGN: NightRect = {
  x0: HEAVEN_POINT.x - 48,
  y0: HEAVEN_POINT.y - 36,
  x1: HEAVEN_POINT.x + 48,
  y1: HEAVEN_POINT.y + 36,
}

export const NIGHT_MAP: NightMapSurface = {
  width: 640,
  height: 420,
  viewBox: '0 0 640 420',
  plate: nwMapPlate,
  keep: ROAD_KEEP,
  reach: union(ROAD_KEEP, HEAVEN_SIGN),
}

export interface NightBoardBox {
  w: number
  h: number
}

export interface NightBoardView {
  x: number
  y: number
  w: number
  h: number
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

/** One axis of the crop: centre on reach, slide back to hold keep, then stay on the plate. */
function cropStart(size: number, limit: number, keep0: number, keep1: number, reach0: number, reach1: number) {
  let start = (reach0 + reach1) / 2 - size / 2
  if (size >= keep1 - keep0) start = clamp(start, keep1 - size, keep0)
  else start = (keep0 + keep1) / 2 - size / 2
  return clamp(start, 0, limit - size)
}

/** Cover crop of the plate for a board box: fills the box edge-to-edge, never past the plate. */
export function boardView(box: NightBoardBox, map: NightMapSurface = NIGHT_MAP): NightBoardView {
  if (!(box.w > 0 && box.h > 0)) return { x: 0, y: 0, w: map.width, h: map.height }
  const scale = Math.max(box.w / map.width, box.h / map.height)
  const w = Math.min(map.width, box.w / scale)
  const h = Math.min(map.height, box.h / scale)
  const { keep, reach } = map
  return {
    x: cropStart(w, map.width, keep.x0, keep.x1, reach.x0, reach.x1),
    y: cropStart(h, map.height, keep.y0, keep.y1, reach.y0, reach.y1),
    w,
    h,
  }
}

export function boardViewBox(box: NightBoardBox, map: NightMapSurface = NIGHT_MAP): string {
  const view = boardView(box, map)
  return `${view.x} ${view.y} ${view.w} ${view.h}`
}

/** Map point → CSS px inside the rendered board (same cover crop as `boardViewBox`). */
export function boardPoint(
  box: NightBoardBox,
  point: NightPoint,
  map: NightMapSurface = NIGHT_MAP,
): { left: number; top: number } {
  const view = boardView(box, map)
  const scale = box.w > 0 ? box.w / view.w : 1
  return {
    left: (point.x - view.x) * scale,
    top: (point.y - view.y) * scale,
  }
}
