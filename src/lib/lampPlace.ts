import type { ProgressState } from '../types.ts'
import { nightTowers } from '../nightWatch/towers/index.ts'
import { DEFEND_PATH, freeSpotId, isFreeSpot, lampAnchor } from '../nightWatch/path/data.ts'
import type { NightPoint } from '../nightWatch/types.ts'
import { isTowerType, plantType } from './nightPlants.ts'

/**
 * Easy lamp placement (1.4.390).
 * Tap a tower card, then tap open ground. The same two calls place a lamp
 * bought mid-night, and a later drag-from-card drop. This file does not drag.
 */
export type { NightPoint }
export { freeSpotId, isFreeSpot, lampAnchor }

export interface LampPreview {
  spot: string
  at: NightPoint
  range: number
  blocked: boolean
}

/** Painted yellow road, plus a small margin so a lamp does not sit on the lip. */
const ROAD_BLOCK = 46
/** Porch icing and the side paths are thinner than the main road. */
const PATH_BLOCK = 26
/** Two lamps need a gap so each one stays tappable. */
const LAMP_BODY = 46

interface Ellipse {
  x: number
  y: number
  rx: number
  ry: number
}

interface Disc {
  x: number
  y: number
  r: number
}

/**
 * Cottages, the gate, and the creek, measured on the A2 plate.
 * Ellipses cover the building, not the purple ground beside the road.
 */
const HOUSES: readonly Ellipse[] = [
  { x: 331, y: 147, rx: 100, ry: 92 },
  { x: 192, y: 537, rx: 92, ry: 90 },
  { x: 560, y: 375, rx: 88, ry: 78 },
  { x: 200, y: 856, rx: 100, ry: 96 },
  { x: 560, y: 678, rx: 78, ry: 72 },
  { x: 345, y: 1002, rx: 100, ry: 40 },
  { x: 730, y: 1050, rx: 70, ry: 62 },
]

/** Dark trees and the creek water that sits with the teal cottage. */
const FEATURES: readonly Disc[] = [
  { x: 300, y: 220, r: 26 },
  { x: 450, y: 430, r: 24 },
  { x: 520, y: 450, r: 24 },
  { x: 160, y: 570, r: 22 },
  { x: 250, y: 575, r: 22 },
  { x: 520, y: 790, r: 28 },
  { x: 545, y: 700, r: 36 },
]

/** Side yellow path on the left edge, and the fork spur the walkers do not take. */
const EXTRA_ROADS: readonly (readonly NightPoint[])[] = [
  [
    { x: 40, y: 240 },
    { x: 90, y: 264 },
    { x: 140, y: 292 },
    { x: 176, y: 324 },
    { x: 192, y: 360 },
  ],
  [
    { x: 250, y: 968 },
    { x: 320, y: 988 },
    { x: 400, y: 992 },
    { x: 470, y: 970 },
    { x: 520, y: 952 },
  ],
]

/** Candy icing from a porch to the road. Samples of the plate curves. */
const PORCH_PATHS: readonly (readonly NightPoint[])[] = [
  quad({ x: 238, y: 492 }, { x: 325, y: 525 }, { x: 306, y: 448 }),
  quad({ x: 262, y: 808 }, { x: 288, y: 802 }, { x: 304, y: 774 }),
  quad({ x: 552, y: 302 }, { x: 560, y: 276 }, { x: 528, y: 260 }),
  quad({ x: 498, y: 662 }, { x: 488, y: 646 }, { x: 460, y: 622 }),
]

function quad(a: NightPoint, c: NightPoint, b: NightPoint): NightPoint[] {
  const points: NightPoint[] = []
  for (let i = 0; i <= 6; i++) {
    const t = i / 6
    const u = 1 - t
    points.push({
      x: u * u * a.x + 2 * u * t * c.x + t * t * b.x,
      y: u * u * a.y + 2 * u * t * c.y + t * t * b.y,
    })
  }
  return points
}

function polyClearance(from: NightPoint, poly: readonly NightPoint[]): number {
  let min = Infinity
  for (let i = 0; i < poly.length - 1; i++) {
    min = Math.min(min, segDist(from, poly[i], poly[i + 1]))
  }
  return min
}

function segDist(p: NightPoint, a: NightPoint, b: NightPoint): number {
  const dx = b.x - a.x
  const dy = b.y - a.y
  const len2 = dx * dx + dy * dy
  if (len2 === 0) return Math.hypot(p.x - a.x, p.y - a.y)
  let t = ((p.x - a.x) * dx + (p.y - a.y) * dy) / len2
  t = Math.max(0, Math.min(1, t))
  return Math.hypot(p.x - (a.x + t * dx), p.y - (a.y + t * dy))
}

function inEllipse(point: NightPoint, house: Ellipse): boolean {
  const dx = (point.x - house.x) / house.rx
  const dy = (point.y - house.y) / house.ry
  return dx * dx + dy * dy <= 1
}

/** Road, houses, trees, water, and the plate edge. HUD is a separate client check. */
export function lampSpotBlocked(
  point: NightPoint,
  plants: Record<string, string> = {},
  ignoreAbility?: string,
): boolean {
  if (point.x < 16 || point.y < 16 || point.x > 782 || point.y > 1118) return true
  if (polyClearance(point, DEFEND_PATH) <= ROAD_BLOCK) return true
  for (const road of EXTRA_ROADS) {
    if (polyClearance(point, road) <= PATH_BLOCK + 8) return true
  }
  for (const road of PORCH_PATHS) {
    if (polyClearance(point, road) <= PATH_BLOCK) return true
  }
  for (const house of HOUSES) {
    if (inEllipse(point, house)) return true
  }
  for (const feature of FEATURES) {
    if (Math.hypot(point.x - feature.x, point.y - feature.y) <= feature.r) return true
  }
  for (const [id, ability] of Object.entries(plants)) {
    if (ability === ignoreAbility) continue
    const at = lampAnchor(id)
    if (Math.hypot(point.x - at.x, point.y - at.y) <= LAMP_BODY) return true
  }
  return false
}

/**
 * Buttons and readouts that float on the map. A tap in one of these boxes
 * is a no-go even when the box lets the tap fall through to the plate.
 */
export function hudCoversPoint(clientX: number, clientY: number, doc: Document): boolean {
  const nodes = doc.querySelectorAll('.nw-rail, .nw-docks, .nw-balloon-slot, .nw-wave-overlay')
  for (const node of nodes) {
    const box = node.getBoundingClientRect()
    if (box.width < 1 || box.height < 1) continue
    if (clientX >= box.left && clientX <= box.right && clientY >= box.top && clientY <= box.bottom) {
      return true
    }
  }
  return false
}

/** Map point under a finger, in the board's current viewBox. */
export function clientToMap(
  svg: SVGSVGElement,
  clientX: number,
  clientY: number,
): NightPoint | null {
  const ctm = svg.getScreenCTM()
  if (!ctm) return null
  const point = svg.createSVGPoint()
  point.x = clientX
  point.y = clientY
  const local = point.matrixTransform(ctm.inverse())
  if (!Number.isFinite(local.x) || !Number.isFinite(local.y)) return null
  return { x: local.x, y: local.y }
}

/**
 * Ghost at this touch. `range` is `nightTowers.range` for the seat that
 * would be planted, which is the radius combat uses.
 */
export function previewLamp(
  point: NightPoint,
  ability: string,
  progress: ProgressState,
  runTier: Record<string, number> | undefined,
  plants: Record<string, string> = {},
  hudBlocked = false,
): LampPreview {
  const spot = freeSpotId(point)
  const at = lampAnchor(spot)
  const range = nightTowers.range(spot, ability, progress, runTier)
  const blocked =
    hudBlocked ||
    !isTowerType(ability) ||
    lampSpotBlocked(at, plants, ability)
  return { spot, at, range, blocked }
}

/** Place when the spot is open. A blocked spot returns the same map. */
export function commitLamp(
  plants: Record<string, string>,
  point: NightPoint,
  ability: string,
  progress: ProgressState,
  runTier: Record<string, number> | undefined,
  hudBlocked = false,
): { ok: boolean; plants: Record<string, string>; preview: LampPreview } {
  const preview = previewLamp(point, ability, progress, runTier, plants, hudBlocked)
  if (preview.blocked) return { ok: false, plants, preview }
  return { ok: true, plants: plantType(plants, preview.spot, ability), preview }
}
