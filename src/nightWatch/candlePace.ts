import { previewLamp } from '../lib/lampPlace.ts'
import {
  CANDLE_BODY,
  CANDLE_ID,
  CANDLE_LINK,
  candlePlateReach,
  candleRowSize,
  candleStrike,
  freshCandlePaths,
} from './candle.ts'
import { pathPoint } from './path/data.ts'
import { paceExtraNight, type PaceShot } from './livePace.ts'

/** A zero-tap night is longer than one round, so no glow taps land. */
const ZERO_TAP = 1e9

/** The ghost calls this seat Good and open. Same check the pad uses. */
export function candleGhostGood(point: CandleSeat, plants: Record<string, string> = {}): boolean {
  const look = previewLamp(point, CANDLE_ID, {} as never, {}, plants)
  return !look.blocked && look.cover === 'good'
}

function roadT(at: CandleSeat): number {
  let best = 0
  let bestD = Infinity
  for (let i = 0; i <= 48; i += 1) {
    const p = pathPoint(i / 48)
    const d = Math.hypot(p.x - at.x, p.y - at.y)
    if (d < bestD) {
      bestD = d
      best = i / 48
    }
  }
  return best
}

function remember(found: CandleSeat[], seen: Set<string>, at: { x: number; y: number }, t?: number): void {
  const id = `${at.x}:${at.y}`
  if (seen.has(id)) return
  seen.add(id)
  found.push({ x: at.x, y: at.y, t: t ?? roadT(at) })
}

/** Good seats on the lip of the bound road, both sides, nearest gap first. */
function candleLipSeats(): CandleSeat[] {
  const found: CandleSeat[] = []
  const seen = new Set<string>()
  const gaps = [52, 60, 70, 80, 90]
  for (let i = 0; i <= 96; i += 1) {
    const t = i / 96
    const p = pathPoint(t)
    const prev = pathPoint(Math.max(0, t - 0.008))
    const next = pathPoint(Math.min(1, t + 0.008))
    const dx = next.x - prev.x
    const dy = next.y - prev.y
    const len = Math.hypot(dx, dy) || 1
    const nx = -dy / len
    const ny = dx / len
    for (const sign of [1, -1]) {
      for (const gap of gaps) {
        const at = { x: p.x + nx * sign * gap, y: p.y + ny * sign * gap }
        const look = previewLamp(at, CANDLE_ID, {} as never, {}, {})
        if (look.blocked || look.cover !== 'good') continue
        remember(found, seen, look.at, roadT(look.at))
        break
      }
    }
  }
  found.sort((a, b) => (a.t ?? 0) - (b.t ?? 0))
  return found
}

/** Good candle seats on the map that is bound right now. The lip comes first. */
export function candleGoodSeats(step = 14): CandleSeat[] {
  const found = candleLipSeats()
  const seen = new Set(found.map((seat) => `${seat.x}:${seat.y}`))
  for (let y = 20; y <= 1200; y += step) {
    for (let x = 20; x <= 1000; x += step) {
      const look = previewLamp({ x, y }, CANDLE_ID, {} as never, {}, {})
      if (look.blocked || look.cover !== 'good') continue
      if (look.at.x < 36 || look.at.y < 36 || look.at.x > 980 || look.at.y > 1120) continue
      remember(found, seen, look.at)
    }
  }
  found.sort((a, b) => (a.t ?? 0) - (b.t ?? 0))
  return found
}

function fits(seat: CandleSeat, plants: Record<string, string>, previous: readonly CandleSeat[]): boolean {
  for (const old of previous) {
    const d = Math.hypot(old.x - seat.x, old.y - seat.y)
    if (d <= CANDLE_BODY) return false
  }
  if (previous.length > 0) {
    const linked = previous.some((old) => Math.hypot(old.x - seat.x, old.y - seat.y) <= CANDLE_LINK)
    if (!linked) return false
  }
  if (!candleGhostGood(seat, plants)) return false
  const id = `at:${seat.x}:${seat.y}`
  const next = { ...plants, [id]: CANDLE_ID }
  return candleRowSize(id, next) === previous.length + 1
}

function inBand(seat: CandleSeat, band: readonly [number, number]): boolean {
  const t = seat.t ?? 0
  return t >= band[0] && t <= band[1]
}

/** Nearest forward Good seat, starting from one lip seat. */
function chainFrom(goods: readonly CandleSeat[], start: number, count: number): CandleSeat[] | null {
  const minStep = CANDLE_BODY + 6
  const row: CandleSeat[] = [goods[start]]
  let plants: Record<string, string> = { [`at:${goods[start].x}:${goods[start].y}`]: CANDLE_ID }
  while (row.length < count) {
    const prev = row[row.length - 1]
    let best = -1
    let bestD = Infinity
    for (let i = 0; i < goods.length; i += 1) {
      const seat = goods[i]
      if ((seat.t ?? 0) <= (prev.t ?? 0) + 0.012) continue
      const d = Math.hypot(seat.x - prev.x, seat.y - prev.y)
      if (d <= minStep || d > CANDLE_LINK || d >= bestD) continue
      if (!fits(seat, plants, row)) continue
      best = i
      bestD = d
    }
    if (best < 0) break
    const seat = goods[best]
    row.push(seat)
    plants = { ...plants, [`at:${seat.x}:${seat.y}`]: CANDLE_ID }
  }
  return row.length === count ? row : null
}

function chainRow(goods: readonly CandleSeat[], count: number): CandleSeat[] | null {
  for (let start = 0; start < goods.length; start += 1) {
    const row = chainFrom(goods, start, count)
    if (row) return row
  }
  return null
}

/** Lip rows in order. Later starts that repeat an earlier row are skipped. */
function lipChains(count: number, band: readonly [number, number], limit: number): CandleSeat[][] {
  const goods = candleLipSeats().filter((seat) => inBand(seat, band))
  const out: CandleSeat[][] = []
  const seen = new Set<string>()
  for (let start = 0; start < goods.length && out.length < limit; start += 1) {
    const row = chainFrom(goods, start, count)
    if (!row) continue
    const key = row.map((seat) => `${seat.x}:${seat.y}`).join('|')
    if (seen.has(key)) continue
    seen.add(key)
    out.push(row)
  }
  return out
}

/**
 * A Good lip row of three whose zero-tap night lasts two or three rounds
 * longer than three Good candles that do not share a row.
 */
export function candleAheadRow(): CandleSeat[] | null {
  const spread = candlePlantSpread(3)
  const spreadDead = spread ? paceCandleNight(spread, 'none', false).dead : null
  if (spreadDead == null) return null
  for (const row of lipChains(3, [0.2, 0.8], 80)) {
    const night = paceCandleNight(row, 'none', false)
    if (night.dead == null) continue
    const gap = night.dead - spreadDead
    if (gap === 2 || gap === 3) return row
  }
  return null
}

/**
 * A row the ghost will accept, planted one Good seat at a time.
 * Null when this map has no such row.
 */
export function candlePlantRow(count: number, step = 18, band: readonly [number, number] = [0.2, 0.8]): CandleSeat[] | null {
  const lip = chainRow(
    candleLipSeats().filter((seat) => inBand(seat, band)),
    count,
  )
  if (lip) return lip
  return chainRow(
    candleGoodSeats(step).filter((seat) => inBand(seat, band)),
    count,
  )
}

function spreadFrom(goods: readonly CandleSeat[], count: number): CandleSeat[] | null {
  const picked: CandleSeat[] = []
  let plants: Record<string, string> = {}
  for (const seat of goods) {
    if (picked.some((old) => Math.hypot(old.x - seat.x, old.y - seat.y) <= CANDLE_LINK)) continue
    if (picked.some((old) => Math.abs((seat.t ?? 0) - (old.t ?? 0)) < 0.18)) continue
    if (!candleGhostGood(seat, plants)) continue
    picked.push(seat)
    plants = { ...plants, [`at:${seat.x}:${seat.y}`]: CANDLE_ID }
    if (picked.length === count) return picked
  }
  return null
}

/** Good seats far enough apart that none of them share a row. */
export function candlePlantSpread(count: number, step = 18, band: readonly [number, number] = [0.12, 0.9]): CandleSeat[] | null {
  const lip = spreadFrom(
    candleLipSeats().filter((seat) => inBand(seat, band)),
    count,
  )
  if (lip) return lip
  return spreadFrom(
    candleGoodSeats(step).filter((seat) => inBand(seat, band)),
    count,
  )
}

export interface CandleSeat {
  x: number
  y: number
  /** 0–1 along the bound road. Omitted on a hand-built seat. */
  t?: number
}

/** Shots for these seats. A row shares one factor. Spread seats stay at the lone hit. */
export function candleShots(seats: readonly CandleSeat[]): PaceShot[] {
  const plants: Record<string, string> = {}
  for (const seat of seats) plants[`at:${seat.x}:${seat.y}`] = CANDLE_ID
  return seats.map((seat) => {
    const id = `at:${seat.x}:${seat.y}`
    const strike = candleStrike(freshCandlePaths(), candleRowSize(id, plants))
    return {
      x: seat.x,
      y: seat.y,
      damage: strike.damage,
      range: candlePlateReach(id, 0),
      cooldownMs: strike.cooldownMs,
    }
  })
}

/**
 * Pillars stay on the same plan. `taps` false is the zero-tap compare.
 * `dead` is the round the night stops, or null when all 25 clear.
 */
export function paceCandleNight(
  seats: readonly CandleSeat[],
  kind: 'none' | 'natural',
  taps: boolean,
): { dead: number | null; dealt: number } {
  const shots = candleShots(seats)
  return taps ? paceExtraNight(kind, shots) : paceExtraNight(kind, shots, ZERO_TAP)
}
