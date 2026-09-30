import type { NightPoint } from '../types.ts'

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
  plate: null,
}

export interface NightBoardBox {
  w: number
  h: number
}

/** Map point → CSS px inside the rendered board (matches preserveAspectRatio="xMidYMid meet"). */
export function boardPoint(
  box: NightBoardBox,
  point: NightPoint,
  map: NightMapSurface = NIGHT_MAP,
): { left: number; top: number } {
  const scale = Math.min(box.w / map.width, box.h / map.height)
  return {
    left: (box.w - map.width * scale) / 2 + point.x * scale,
    top: (box.h - map.height * scale) / 2 + point.y * scale,
  }
}
