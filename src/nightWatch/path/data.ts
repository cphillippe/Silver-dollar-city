import type { CityPlotId } from '../../lib/city.ts'
import type { NightPoint } from '../types.ts'

/**
 * A2 candy plate — painted yellow-road centerline, polyline only.
 * Enters off the right edge over the gate's stone slabs, passes through the painted
 * gate, takes the fork's up-arm (not the spur to the bottom cottage), S-curves up past
 * the teal / red / lilac cottages, and ends where the road tucks under the top cottage roof.
 * Points are evenly spaced (~20 units) because `pathPoint` gives each segment equal t.
 */
export const DEFEND_PATH: NightPoint[] = [
  { x: 798, y: 1097 },
  { x: 778, y: 1093 },
  { x: 759, y: 1087 },
  { x: 742, y: 1079 },
  { x: 724, y: 1069 },
  { x: 706, y: 1061 },
  { x: 688, y: 1052 },
  { x: 671, y: 1043 },
  { x: 654, y: 1032 },
  { x: 637, y: 1021 },
  { x: 621, y: 1009 },
  { x: 606, y: 997 },
  { x: 591, y: 983 },
  { x: 575, y: 971 },
  { x: 558, y: 962 },
  { x: 539, y: 955 },
  { x: 520, y: 948 },
  { x: 510, y: 932 },
  { x: 509, y: 912 },
  { x: 506, y: 892 },
  { x: 499, y: 874 },
  { x: 488, y: 857 },
  { x: 473, y: 844 },
  { x: 457, y: 833 },
  { x: 439, y: 824 },
  { x: 421, y: 816 },
  { x: 402, y: 809 },
  { x: 383, y: 802 },
  { x: 365, y: 794 },
  { x: 347, y: 787 },
  { x: 329, y: 778 },
  { x: 312, y: 767 },
  { x: 298, y: 753 },
  { x: 290, y: 735 },
  { x: 289, y: 715 },
  { x: 296, y: 697 },
  { x: 308, y: 682 },
  { x: 324, y: 670 },
  { x: 342, y: 661 },
  { x: 361, y: 654 },
  { x: 380, y: 648 },
  { x: 399, y: 642 },
  { x: 417, y: 634 },
  { x: 435, y: 625 },
  { x: 452, y: 615 },
  { x: 466, y: 601 },
  { x: 475, y: 583 },
  { x: 478, y: 564 },
  { x: 474, y: 544 },
  { x: 465, y: 527 },
  { x: 451, y: 512 },
  { x: 435, y: 501 },
  { x: 418, y: 491 },
  { x: 400, y: 483 },
  { x: 382, y: 474 },
  { x: 364, y: 466 },
  { x: 346, y: 456 },
  { x: 330, y: 444 },
  { x: 316, y: 431 },
  { x: 306, y: 413 },
  { x: 303, y: 394 },
  { x: 306, y: 374 },
  { x: 314, y: 356 },
  { x: 326, y: 341 },
  { x: 341, y: 328 },
  { x: 358, y: 317 },
  { x: 376, y: 308 },
  { x: 394, y: 300 },
  { x: 413, y: 293 },
  { x: 431, y: 286 },
  { x: 450, y: 279 },
  { x: 469, y: 272 },
  { x: 487, y: 265 },
  { x: 506, y: 258 },
  { x: 524, y: 249 },
  { x: 541, y: 239 },
  { x: 557, y: 227 },
  { x: 571, y: 213 },
  { x: 579, y: 195 },
  { x: 581, y: 175 },
  { x: 578, y: 156 },
  { x: 569, y: 138 },
  { x: 556, y: 123 },
  { x: 540, y: 111 },
  { x: 522, y: 102 },
  { x: 504, y: 95 },
  { x: 484, y: 90 },
  { x: 465, y: 88 },
  { x: 445, y: 86 },
  { x: 425, y: 85 },
  { x: 406, y: 80 },
  { x: 388, y: 72 },
]

/** Lot seats on the A2 plate — open ground beside the road, clear of the right C&C float. */
export const DEFEND_ANCHOR: Record<CityPlotId, NightPoint> = {
  lookout: { x: 505, y: 172 },
  observatory: { x: 412, y: 904 },
  hollow: { x: 244, y: 424 },
  journal: { x: 572, y: 540 },
  bench: { x: 214, y: 706 },
  lamps: { x: 392, y: 392 },
  gate: { x: 632, y: 956 },
  porch: { x: 248, y: 288 },
}

/** The plate paints the road; the SVG road layers stay empty so they don't fight it. */
export const NIGHT_ROAD_D = ''

export function pathPoint(t: number): NightPoint {
  const clamped = Math.min(1, Math.max(0, t))
  const scaled = clamped * (DEFEND_PATH.length - 1)
  const i = Math.min(DEFEND_PATH.length - 2, Math.floor(scaled))
  const local = scaled - i
  const a = DEFEND_PATH[i]
  const b = DEFEND_PATH[i + 1]
  return { x: a.x + (b.x - a.x) * local, y: a.y + (b.y - a.y) * local }
}
