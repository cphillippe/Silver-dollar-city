import type { NightPoint } from '../types.ts'

/** Plate units past the road's off-map edge where a new Easy walker is first drawn. */
export const WALK_IN_LEAD_U = 96
export const WALK_IN_MIN_MS = 600
export const WALK_IN_MAX_MS = 1800
/** Drawn run-in speed in plate units per second, before the 600–1800 ms clamp. */
export const WALK_IN_U_PER_S = 900
/**
 * A walker cannot take a tap for this long at most, in game ms.
 * The fastest Easy walker covers 0.1 of its road in this time: 0.1 / (0.01 × 6.8 × 1.75) s.
 */
export const WALK_IN_TAP_MAX_MS = 840
/** Walker hit radius in plate units; tap unlocks once this much of the body is on the plate. */
export const WALK_IN_WALKER_R = 24
/** Live spawns never start past this t (`EASY_ON_SCREEN_T`). The time table is checked up to here. */
export const WALK_IN_SPAWN_T_CAP = 0.55

export type WalkInSide = 'bottom' | 'top' | 'left' | 'right'

export interface WalkInPlate {
  width: number
  height: number
}

export interface WalkInEntry {
  /** Where the road leaves the plate. */
  edge: NightPoint
  /** Unit step from point 0 toward point 1. */
  nx: number
  ny: number
  /** First drawn point. `WALK_IN_LEAD_U` past `edge`, against `n`. */
  start: NightPoint
  side: WalkInSide
}

const EDGE_EPS = 0.5

function onOrOutside(point: NightPoint, plate: WalkInPlate): boolean {
  return (
    point.x <= EDGE_EPS ||
    point.y <= EDGE_EPS ||
    point.x >= plate.width - EDGE_EPS ||
    point.y >= plate.height - EDGE_EPS
  )
}

function sideOf(point: NightPoint, nx: number, ny: number, plate: WalkInPlate): WalkInSide {
  const gaps: [WalkInSide, number][] = [
    ['bottom', Math.abs(point.y - plate.height)],
    ['top', Math.abs(point.y)],
    ['left', Math.abs(point.x)],
    ['right', Math.abs(point.x - plate.width)],
  ]
  gaps.sort((a, b) => a[1] - b[1])
  if (gaps[0][1] < gaps[1][1] - EDGE_EPS) return gaps[0][0]
  if (Math.abs(ny) >= Math.abs(nx)) return ny < 0 ? 'bottom' : 'top'
  return nx > 0 ? 'left' : 'right'
}

/**
 * Entry for one walker road. Point 0 on or past the plate edge is the edge.
 * A road that starts inside the plate is traced back along -n to the rect.
 */
export function walkInEntry(points: readonly NightPoint[], plate: WalkInPlate): WalkInEntry {
  const a = points[0] ?? { x: plate.width / 2, y: plate.height }
  const b = points[1] ?? { x: a.x, y: a.y - 1 }
  const len = Math.hypot(b.x - a.x, b.y - a.y) || 1
  const nx = (b.x - a.x) / len
  const ny = (b.y - a.y) / len
  let edge = { x: a.x, y: a.y }
  if (!onOrOutside(a, plate)) {
    let back = Infinity
    if (nx > 0) back = Math.min(back, a.x / nx)
    if (nx < 0) back = Math.min(back, (a.x - plate.width) / nx)
    if (ny > 0) back = Math.min(back, a.y / ny)
    if (ny < 0) back = Math.min(back, (a.y - plate.height) / ny)
    if (Number.isFinite(back)) edge = { x: a.x - nx * back, y: a.y - ny * back }
  }
  return {
    edge,
    nx,
    ny,
    start: { x: edge.x - nx * WALK_IN_LEAD_U, y: edge.y - ny * WALK_IN_LEAD_U },
    side: sideOf(edge, nx, ny, plate),
  }
}

/** Road polyline from point 0 to `t`, with `pathPoint`'s equal t per segment. */
function roadTrail(points: readonly NightPoint[], t: number): NightPoint[] {
  if (points.length < 2) return points.length ? [points[0]] : []
  const scaled = Math.min(1, Math.max(0, t)) * (points.length - 1)
  const i = Math.min(points.length - 2, Math.floor(scaled))
  const local = scaled - i
  const a = points[i]
  const b = points[i + 1]
  const trail = points.slice(0, i + 1)
  trail.push({ x: a.x + (b.x - a.x) * local, y: a.y + (b.y - a.y) * local })
  return trail
}

/** Start, edge, then the road to the sim point at `t`. */
export function walkInTrail(entry: WalkInEntry, points: readonly NightPoint[], t: number): NightPoint[] {
  const trail = [entry.start, entry.edge]
  for (const point of roadTrail(points, t)) {
    const last = trail[trail.length - 1]
    if (Math.hypot(point.x - last.x, point.y - last.y) > 1e-6) trail.push(point)
  }
  return trail
}

function trailLength(trail: readonly NightPoint[]): number {
  let total = 0
  for (let i = 1; i < trail.length; i += 1) {
    total += Math.hypot(trail[i].x - trail[i - 1].x, trail[i].y - trail[i - 1].y)
  }
  return total
}

export function walkInLength(entry: WalkInEntry, points: readonly NightPoint[], t: number): number {
  return trailLength(walkInTrail(entry, points, t))
}

/** The trail at `WALK_IN_U_PER_S`, kept inside 600–1800 ms. */
export function walkInMs(lengthU: number): number {
  const raw = (Math.max(0, Number(lengthU) || 0) * 1000) / WALK_IN_U_PER_S
  return Math.min(WALK_IN_MAX_MS, Math.max(WALK_IN_MIN_MS, Math.round(raw)))
}

/** Slow across the edge, quick through the middle, settled on the sim point. */
export function walkInEase(progress: number): number {
  const p = Math.min(1, Math.max(0, progress))
  return p * p * (3 - 2 * p)
}

/** Inverse of {@link walkInEase}: six bisection steps, no dependency. */
function walkInEaseInverse(f: number): number {
  const target = Math.min(1, Math.max(0, f))
  let lo = 0
  let hi = 1
  for (let i = 0; i < 6; i += 1) {
    const mid = (lo + hi) / 2
    if (walkInEase(mid) < target) lo = mid
    else hi = mid
  }
  return (lo + hi) / 2
}

/** Tap lock until the walker is on the plate by one radius; capped by {@link WALK_IN_TAP_MAX_MS}. */
export function walkInTapLockMs(runMs: number, lengthU: number): number {
  if (!(lengthU > 0) || !(runMs > 0)) return 0
  const f = (WALK_IN_LEAD_U + WALK_IN_WALKER_R) / lengthU
  if (f >= 1) return Math.min(WALK_IN_TAP_MAX_MS, runMs)
  const p = walkInEaseInverse(f)
  return Math.min(WALK_IN_TAP_MAX_MS, Math.max(0, Math.round(runMs * p)))
}

/** Point `f` of the way along the trail. `f` = 1 is the sim point. */
export function walkInPoint(entry: WalkInEntry, points: readonly NightPoint[], t: number, f: number): NightPoint {
  const trail = walkInTrail(entry, points, t)
  const end = trail[trail.length - 1]
  if (!(f < 1)) return { x: end.x, y: end.y }
  let left = Math.max(0, f) * trailLength(trail)
  for (let i = 1; i < trail.length; i += 1) {
    const a = trail[i - 1]
    const b = trail[i]
    const seg = Math.hypot(b.x - a.x, b.y - a.y)
    if (left <= seg && seg > 0) {
      const k = left / seg
      return { x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k }
    }
    left -= seg
  }
  return { x: end.x, y: end.y }
}

export interface WalkInWalker {
  id: number
  t: number
  turned?: string
  mini?: boolean
  pathId?: string
}

interface WalkInSeen {
  at: number
  runMs: number
  lockMs: number
}

/**
 * First-draw times for one wave. Draw only: nothing here reaches the sim.
 * `now` is the Easy game clock in ms, so 3× pace, holds, and the debug freeze all apply.
 * A walker that is turned, a mini, or already past the spawn cap draws at its sim point.
 */
export interface WalkInClock {
  reset(): void
  /** Notes the walker on first sight and returns its run-in, or null when it has none. */
  see(walker: WalkInWalker, now: number): WalkInSeen | null
  entering(walker: WalkInWalker, now: number): boolean
  tapLocked(walker: WalkInWalker, now: number): boolean
  drawAt(walker: WalkInWalker, sim: NightPoint, now: number): NightPoint
}

export function createWalkInClock(
  roadOf: (pathId: string | undefined) => readonly NightPoint[],
  plate: () => WalkInPlate,
): WalkInClock {
  let seen = new Map<number, WalkInSeen | null>()
  const see = (walker: WalkInWalker, now: number): WalkInSeen | null => {
    if (seen.has(walker.id)) return seen.get(walker.id) ?? null
    let row: WalkInSeen | null = null
    if (!walker.turned && !walker.mini && walker.t <= WALK_IN_SPAWN_T_CAP) {
      const points = roadOf(walker.pathId)
      const entry = walkInEntry(points, plate())
      const lengthU = walkInLength(entry, points, walker.t)
      const runMs = walkInMs(lengthU)
      row = { at: now, runMs, lockMs: walkInTapLockMs(runMs, lengthU) }
    }
    seen.set(walker.id, row)
    return row
  }
  const progress = (walker: WalkInWalker, now: number): number => {
    const row = see(walker, now)
    if (!row || walker.turned) return 1
    return Math.min(1, Math.max(0, (now - row.at) / row.runMs))
  }
  return {
    reset() {
      seen = new Map()
    },
    see,
    entering: (walker, now) => progress(walker, now) < 1,
    tapLocked(walker, now) {
      const row = see(walker, now)
      if (!row || walker.turned) return false
      return now - row.at < row.lockMs
    },
    drawAt(walker, sim, now) {
      const p = progress(walker, now)
      if (!(p < 1)) return sim
      const points = roadOf(walker.pathId)
      return walkInPoint(walkInEntry(points, plate()), points, walker.t, walkInEase(p))
    },
  }
}
