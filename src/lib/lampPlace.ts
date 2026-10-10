import type { ProgressState } from '../types.ts'
import { nightTowers, TOWER_LAMP_SPRITE } from '../nightWatch/towers/index.ts'
import { DEFEND_PATH, freeSpotId, isFreeSpot, lampAnchor, pathClearance, pathPoint } from '../nightWatch/path/data.ts'
import type { NightPoint } from '../nightWatch/types.ts'
import { isTowerType, plantType } from './nightPlants.ts'
import { combatTier, TIER_MARK, TOOL_TIER_MAX } from './watchTools.ts'

/**
 * Easy lamp placement (1.4.390).
 * Tap a tower card, then tap open ground. A card press that slides uses the
 * same preview and commit. The reach cue (1.4.392) uses the combat range
 * and still lets a far lamp plant.
 */
export type { NightPoint }
export { freeSpotId, isFreeSpot, lampAnchor }

/** Shown when even level III cannot meet the walker path. The spot can still be planted. */
export const LAMP_TOO_FAR = 'Too far from the road'

export interface LampPreview {
  spot: string
  at: NightPoint
  range: number
  blocked: boolean
  /** Combat range meets the walker path at the current level. A red no-go is never a reach. */
  reaches: boolean
  /** Road stretch inside the combat ring. Empty when the ring misses the road. */
  road: string
  /**
   * How much of the walker road sits in the ring.
   * `good` is a long stretch, `some` is a nick, `far` misses.
   * Empty on a red no-go.
   */
  cover: '' | 'good' | 'some' | 'far'
  /**
   * Empty when the current level reaches. Otherwise the soonest upgrade that
   * would, or `LAMP_TOO_FAR` when level III still misses. Empty on a red no-go.
   */
  note: string
}

/** Road length that counts as a real stretch, not a nick. Plate units. */
export const ROAD_GOOD_LEN = 140
/** Shorter than this and the ring does not meet the road. */
export const ROAD_SOME_LEN = 18

const PATH_LEN = DEFEND_PATH.reduce((sum, point, index) => {
  const next = DEFEND_PATH[index + 1]
  if (!next) return sum
  return sum + Math.hypot(next.x - point.x, next.y - point.y)
}, 0)

/** Length of the walker road inside this ring. */
export function roadCoverLength(at: NightPoint, range: number): number {
  if (!(range > 0) || !(PATH_LEN > 0)) return 0
  const steps = 240
  let hit = 0
  for (let i = 0; i <= steps; i += 1) {
    const point = pathPoint(i / steps)
    if (Math.hypot(at.x - point.x, at.y - point.y) <= range + 0.5) hit += 1
  }
  return (hit / (steps + 1)) * PATH_LEN
}

export function roadCoverRank(length: number): 'good' | 'some' | 'far' {
  if (length >= ROAD_GOOD_LEN) return 'good'
  if (length >= ROAD_SOME_LEN) return 'some'
  return 'far'
}

export const ROAD_COVER_WORD = {
  good: 'Good',
  some: 'Some',
  far: 'Too far',
} as const

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

/** A card press shorter than this stays a tap. Past it, the lamp follows the finger. */
export const LAMP_DRAG_START_PX = 10

/**
 * CSS pixels the ghost sits above the fingertip.
 * 0 keeps the client point. The picture itself sits above the lot anchor,
 * so the plant point is shifted in map units (`lampUnderFinger`).
 */
export const LAMP_DRAG_LIFT_PX = 0

/**
 * Half of the widest reach note ("Too far from the road" / "Reaches on Far step 3")
 * at the hint's 12px weight, plus a little room for a larger phone font.
 */
export const GHOST_HINT_HALF = 108

/** Padding between the hint and the screen edge. */
export const GHOST_HINT_EDGE = 8

/**
 * Width the lamp cards take on the right.
 * Phone cards are a gem. Tablet cards add the type name.
 */
export function ghostHintRail(boardW: number): number {
  if (boardW >= 700) return 128
  if (boardW >= 400) return 96
  return 80
}

/**
 * Keep a centered reach note on the phone. The right inset clears the lamp cards.
 */
export function clampGhostHintLeft(left: number, boardW: number): number {
  const edge = GHOST_HINT_EDGE
  const rail = ghostHintRail(boardW)
  if (!(boardW > 0)) return left
  const min = Math.min(GHOST_HINT_HALF + edge, boardW / 2)
  const max = Math.max(min, boardW - rail - GHOST_HINT_HALF)
  return Math.min(max, Math.max(min, left))
}

/** Client point the ghost uses. The picture shift happens in map units. */
export function dragGhostClient(clientX: number, clientY: number): { x: number; y: number } {
  return { x: clientX, y: clientY - LAMP_DRAG_LIFT_PX }
}

/**
 * ViewBox units from the lot anchor up to the lamp picture's center.
 * The sprite hangs above its feet, so a plant at the fingertip draws the
 * lamp that far above the finger.
 */
export function lampArtAboveAnchor(): number {
  const { h, footY } = TOWER_LAMP_SPRITE
  return h / 2 - footY
}

/**
 * Map point that puts the lamp picture's center on this finger.
 * Ghost and commit both use it, so the picture that follows the finger
 * is the picture that plants.
 */
export function lampUnderFinger(point: NightPoint): NightPoint {
  return { x: point.x, y: point.y + lampArtAboveAnchor() }
}

/**
 * True when this control is allowed to spend a path step.
 * A rail card opens the tree. The buy button and its step pip spend.
 */
export function pathSpendControl(className: string): boolean {
  const names = className.split(/\s+/).filter(Boolean)
  return names.includes('defend-path-buy') || names.includes('defend-path-pip')
}

/**
 * Between rounds, picking a new lamp folds the clear panel.
 * The map can take the plant, and the ring still shows.
 */
export function clearPanelFolded(boosting: boolean, armed: string | null | undefined): boolean {
  return boosting && Boolean(armed)
}

/**
 * Continue and Begin start the next round. A lamp card does not.
 * `className` is the control that received the tap.
 */
export function roundStartKind(className: string): 'continue' | 'begin' | 'card' | null {
  const names = className.split(/\s+/).filter(Boolean)
  if (names.includes('defend-ability') || names.includes('defend-tower-card')) return 'card'
  if (names.includes('defend-continue')) return 'continue'
  if (names.includes('defend-go')) return 'begin'
  return null
}

/** A card tap, a path pip, and a map tap leave the clear where it is. */
export function startsNextRound(kind: ReturnType<typeof roundStartKind>): boolean {
  return kind === 'continue' || kind === 'begin'
}

/** True when the fingertip is back on the tower cards. That drop cancels. */
export function overTowerCards(clientX: number, clientY: number, doc: Document): boolean {
  const nodes = doc.querySelectorAll('.nw-rail .defend-abilities')
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

/** True when this combat radius meets the walker path. */
export function lampReachesRoad(at: NightPoint, range: number): boolean {
  return range > 0 && pathClearance(at) <= range
}

/**
 * Same reach function combat uses, at the current tier and at each upgrade.
 * Gold (empty note) when this level already meets the road. The soonest
 * higher tier that would meet it is named. Level III still short is too far.
 */
export function lampRoadNote(
  spot: string,
  ability: string,
  progress: ProgressState,
  runTier: Record<string, number> | undefined,
  /** Easy tree: the ring grows on Far step 2, then Far step 3. Hard keeps Level II / III. */
  easyTree = false,
  /**
   * Reach this lamp already has in combat (Easy Far steps).
   * The note names a later step only when the current shot still misses.
   */
  extra = 0,
): string {
  const tierMap = runTier ?? {}
  const at = lampAnchor(spot)
  const held = Math.max(0, extra)
  const now = nightTowers.range(spot, ability, progress, tierMap, held)
  if (lampReachesRoad(at, now)) return ''
  if (easyTree) {
    if (held < 24) {
      const far2 = nightTowers.range(spot, ability, progress, tierMap, 24)
      if (lampReachesRoad(at, far2)) return 'Reaches on Far step 2'
    }
    if (held < 40) {
      const far3 = nightTowers.range(spot, ability, progress, tierMap, 40)
      if (lampReachesRoad(at, far3)) return 'Reaches on Far step 3'
    }
    return LAMP_TOO_FAR
  }
  const current = combatTier(ability, tierMap)
  for (let tier = current + 1; tier <= TOOL_TIER_MAX; tier++) {
    const bumped = nightTowers.range(spot, ability, progress, { ...tierMap, [ability]: tier })
    if (lampReachesRoad(at, bumped)) return `Reaches at Level ${TIER_MARK[tier]}`
  }
  return LAMP_TOO_FAR
}

/**
 * SVG path of the walker road inside the combat ring.
 * One subpath per covered stretch, in plate units.
 */
export function roadCoverD(at: NightPoint, range: number): string {
  if (!(range > 0)) return ''
  const parts: string[] = []
  let open = false
  let last: NightPoint | null = null
  for (let i = 0; i < DEFEND_PATH.length - 1; i++) {
    const hit = coverSegment(at, range, DEFEND_PATH[i], DEFEND_PATH[i + 1])
    if (!hit) {
      open = false
      last = null
      continue
    }
    const [start, end] = hit
    const joins = open && last != null && Math.hypot(last.x - start.x, last.y - start.y) < 0.6
    if (joins) parts.push(`L${end.x.toFixed(1)} ${end.y.toFixed(1)}`)
    else parts.push(`M${start.x.toFixed(1)} ${start.y.toFixed(1)} L${end.x.toFixed(1)} ${end.y.toFixed(1)}`)
    open = true
    last = end
  }
  return parts.join(' ')
}

/** Portion of one road segment that sits inside the ring, or null. */
function coverSegment(
  at: NightPoint,
  range: number,
  a: NightPoint,
  b: NightPoint,
): [NightPoint, NightPoint] | null {
  const r2 = range * range
  const gap2 = (p: NightPoint) => {
    const dx = p.x - at.x
    const dy = p.y - at.y
    return dx * dx + dy * dy
  }
  const inside = (p: NightPoint) => gap2(p) <= r2 + 1e-4
  const dx = b.x - a.x
  const dy = b.y - a.y
  const fx = a.x - at.x
  const fy = a.y - at.y
  const qa = dx * dx + dy * dy
  const qb = 2 * (fx * dx + fy * dy)
  const qc = fx * fx + fy * fy - r2
  const ts: number[] = []
  if (qa > 1e-8) {
    const disc = qb * qb - 4 * qa * qc
    if (disc >= 0) {
      const root = Math.sqrt(disc)
      for (const t of [(-qb - root) / (2 * qa), (-qb + root) / (2 * qa)]) {
        if (t >= -1e-4 && t <= 1 + 1e-4) ts.push(Math.min(1, Math.max(0, t)))
      }
    }
  }
  ts.sort((p, q) => p - q)
  const atT = (t: number): NightPoint => ({ x: a.x + dx * t, y: a.y + dy * t })
  const aIn = inside(a)
  const bIn = inside(b)
  let start: NightPoint | null = null
  let end: NightPoint | null = null
  if (aIn && bIn) {
    start = a
    end = b
  } else if (aIn && ts.length) {
    start = a
    end = atT(ts[ts.length - 1])
  } else if (bIn && ts.length) {
    start = atT(ts[0])
    end = b
  } else if (ts.length >= 2) {
    start = atT(ts[0])
    end = atT(ts[ts.length - 1])
  }
  if (!start || !end) return null
  if (Math.hypot(end.x - start.x, end.y - start.y) < 0.4) return null
  return [start, end]
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
  easyTree = false,
  /** Same Far bonus combat adds before the road-overlap rule. */
  extra = 0,
): LampPreview {
  const spot = freeSpotId(point)
  const at = lampAnchor(spot)
  const range = nightTowers.range(spot, ability, progress, runTier, Math.max(0, extra))
  const blocked =
    hudBlocked ||
    !isTowerType(ability) ||
    lampSpotBlocked(at, plants, ability)
  const reaches = !blocked && lampReachesRoad(at, range)
  const note = blocked ? '' : lampRoadNote(spot, ability, progress, runTier, easyTree, extra)
  const length = blocked ? 0 : roadCoverLength(at, range)
  const cover = blocked ? '' : roadCoverRank(length)
  return {
    spot,
    at,
    range,
    blocked,
    reaches,
    cover,
    road: cover === 'far' || cover === '' ? '' : roadCoverD(at, range),
    note,
  }
}

/** Place when the spot is open. A blocked spot returns the same map. */
export function commitLamp(
  plants: Record<string, string>,
  point: NightPoint,
  ability: string,
  progress: ProgressState,
  runTier: Record<string, number> | undefined,
  hudBlocked = false,
  easyTree = false,
  extra = 0,
): { ok: boolean; plants: Record<string, string>; preview: LampPreview } {
  const preview = previewLamp(point, ability, progress, runTier, plants, hudBlocked, easyTree, extra)
  if (preview.blocked) return { ok: false, plants, preview }
  return { ok: true, plants: plantType(plants, preview.spot, ability), preview }
}
