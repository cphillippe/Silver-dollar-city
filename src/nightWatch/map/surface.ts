import type { NightPoint } from '../types.ts'
import { DEFEND_PATH } from '../path/data.ts'
import nwMapPlate from '../../assets/defend/nw-map-plate.png'

export interface NightMapSurface {
  readonly width: number
  readonly height: number
  readonly viewBox: string
  /** Painted playfield plate in viewBox units. null keeps the SVG dusk board. */
  readonly plate: string | null
  /** Cover crops centre here (clamped to the plate) so the road stays in frame. */
  readonly focus: NightPoint
}

function pathCentre(points: readonly NightPoint[]): NightPoint {
  const xs = points.map((point) => point.x)
  const ys = points.map((point) => point.y)
  return {
    x: (Math.min(...xs) + Math.max(...xs)) / 2,
    y: (Math.min(...ys) + Math.max(...ys)) / 2,
  }
}

export const NIGHT_MAP: NightMapSurface = {
  width: 640,
  height: 420,
  viewBox: '0 0 640 420',
  plate: nwMapPlate,
  focus: pathCentre(DEFEND_PATH),
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

/** Cover crop of the plate for a board box: fills the box edge-to-edge, never past the plate. */
export function boardView(box: NightBoardBox, map: NightMapSurface = NIGHT_MAP): NightBoardView {
  if (!(box.w > 0 && box.h > 0)) return { x: 0, y: 0, w: map.width, h: map.height }
  const scale = Math.max(box.w / map.width, box.h / map.height)
  const w = Math.min(map.width, box.w / scale)
  const h = Math.min(map.height, box.h / scale)
  return {
    x: clamp(map.focus.x - w / 2, 0, map.width - w),
    y: clamp(map.focus.y - h / 2, 0, map.height - h),
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
