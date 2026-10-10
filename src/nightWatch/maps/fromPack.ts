import type { BoundRoad } from '../path/data.ts'
import type { NightPoint } from '../types.ts'
import type { LampGround } from '../../lib/lampPlace.ts'

export interface NightMapSeat {
  id: string
  x: number
  y: number
}

/** One playable night map. Coordinates are plate units. */
export interface NightMapPack extends LampGround {
  id: string
  name: string
  badge: string
  width: number
  height: number
  hpMul: number
  /** `maze-v1` on the maze maps. Anything else, including a missing field, is A2. */
  rules: 'a2' | 'maze-v1'
  seats: NightMapSeat[]
}

function plain(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  return value as Record<string, unknown>
}

function num(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null
}

function pair(value: unknown, w: number, h: number): NightPoint | null {
  if (!Array.isArray(value) || value.length < 2) return null
  const x = num(value[0])
  const y = num(value[1])
  if (x == null || y == null) return null
  return { x: x * w, y: y * h }
}

function pointsOf(value: unknown, w: number, h: number): NightPoint[] {
  if (!Array.isArray(value)) return []
  const points: NightPoint[] = []
  for (const point of value) {
    const scaled = pair(point, w, h)
    if (scaled) points.push(scaled)
  }
  return points
}

/**
 * Scale a staging map pack (coords 0..1 of the canvas) into plate units.
 * Every walker path is loaded. Decor ellipses become the no-go houses.
 * Side roads and porch icing stay empty.
 * Blueberry Bog's three roads take an even share of the walkers.
 */
export function nightMapFromPack(raw: unknown): NightMapPack {
  const pack = plain(raw)
  const canvas = plain(pack?.canvas)
  const difficulty = plain(pack?.difficulty)
  const width = num(canvas?.w)
  const height = num(canvas?.h)
  const hpMul = num(difficulty?.hpMul)
  const id = typeof pack?.id === 'string' ? pack.id : ''
  const name = typeof pack?.name === 'string' ? pack.name : ''
  const badge = typeof pack?.badge === 'string' ? pack.badge : ''
  const rules = difficulty?.rules === 'maze-v1' ? 'maze-v1' : 'a2'
  if (!pack || width == null || height == null || hpMul == null || !id || !name) {
    throw new Error('night map pack is missing canvas, name, or difficulty')
  }
  const pathRows = Array.isArray(pack.paths) ? pack.paths : []
  const roads: BoundRoad[] = []
  for (const item of pathRows) {
    const row = plain(item)
    const points = pointsOf(row?.points, width, height)
    if (points.length < 2) continue
    const via = Array.isArray(row?.via)
      ? row.via.filter((part): part is string => typeof part === 'string' && part.length > 0)
      : []
    const share = num(row?.share)
    roads.push({
      id: typeof row?.id === 'string' && row.id ? row.id : `road-${roads.length + 1}`,
      share: share != null && share > 0 ? share : 0,
      via,
      points,
    })
  }
  if (roads.length < 1) throw new Error('night map pack has no road')
  if (id === 'map06' && roads.length === 3) {
    for (const road of roads) road.share = 1 / 3
  }
  const shareSum = roads.reduce((sum, road) => sum + road.share, 0)
  if (!(shareSum > 0)) {
    const even = 1 / roads.length
    for (const road of roads) road.share = even
  } else if (Math.abs(shareSum - 1) > 1e-6) {
    for (const road of roads) road.share /= shareSum
  }
  const segments: Record<string, NightPoint[]> = {}
  const segmentRows = plain(pack.segments)
  if (segmentRows) {
    for (const [key, value] of Object.entries(segmentRows)) {
      const points = pointsOf(value, width, height)
      if (points.length >= 2) segments[key] = points
    }
  }
  const path = roads[0].points
  const houses: LampGround['houses'][number][] = []
  const decor = Array.isArray(pack.decor) ? pack.decor : []
  for (const item of decor) {
    const row = plain(item)
    const x = num(row?.x)
    const y = num(row?.y)
    const rx = num(row?.rx)
    const ry = num(row?.ry)
    if (x == null || y == null || rx == null || ry == null) continue
    // Border hedges and hill masses are much bigger than a cottage. They are
    // scenery, and the authored seats sit inside them.
    if (rx > 0.2 || ry > 0.15) continue
    houses.push({ x: x * width, y: y * height, rx: rx * width, ry: ry * height })
  }
  const seats: NightMapSeat[] = []
  const seatRows = Array.isArray(pack.seats) ? pack.seats : []
  for (const item of seatRows) {
    const row = plain(item)
    const x = num(row?.x)
    const y = num(row?.y)
    const seatId = typeof row?.id === 'string' ? row.id : ''
    if (!seatId || x == null || y == null) continue
    seats.push({ id: seatId, x: x * width, y: y * height })
  }
  return {
    id,
    name,
    badge,
    width,
    height,
    hpMul,
    rules,
    path,
    roads,
    segments,
    houses,
    features: [],
    extraRoads: [],
    porchPaths: [],
    seats,
  }
}
