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

/**
 * Scale a staging map pack (coords 0..1 of the canvas) into plate units.
 * Decor ellipses become the no-go houses. Side roads and porch icing stay empty.
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
  if (!pack || width == null || height == null || hpMul == null || !id || !name) {
    throw new Error('night map pack is missing canvas, name, or difficulty')
  }
  const paths = Array.isArray(pack.paths) ? pack.paths : []
  const main = plain(paths[0])
  const points = Array.isArray(main?.points) ? main.points : []
  const path: NightPoint[] = []
  for (const point of points) {
    const scaled = pair(point, width, height)
    if (scaled) path.push(scaled)
  }
  if (path.length < 2) throw new Error('night map pack has no road')
  const houses: LampGround['houses'][number][] = []
  const decor = Array.isArray(pack.decor) ? pack.decor : []
  for (const item of decor) {
    const row = plain(item)
    const x = num(row?.x)
    const y = num(row?.y)
    const rx = num(row?.rx)
    const ry = num(row?.ry)
    if (x == null || y == null || rx == null || ry == null) continue
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
    path,
    houses,
    features: [],
    extraRoads: [],
    porchPaths: [],
    seats,
  }
}
