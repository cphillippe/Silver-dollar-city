/** Claim-merge arcade — Suika / merge-fruit bowl. Win is a big merge, not a quiz. */

export const CLAIM_MERGE_LINE = 'wb-creed'

/** Locked Easy Hold claim — do not rewrite. Shown as one takeaway after the arcade win. */
export const CLAIM_MERGE_CLAIM = 'Paul hands on an early public creed: died, buried, raised, appeared.'

export const CLAIM_MERGE_WIN = 'MERGED!'

export const CLAIM_MERGE_HINT = 'Drop candy. Smash two of a kind.'

export const MERGE_START_SCORE = 0
export const MERGE_MISS_PENALTY = 25
export const MERGE_MISS_FACE = 'Miss −25'

/** Bowl in layout pixels — phone-width candy bucket. */
export const BOWL_WIDTH = 360
export const BOWL_HEIGHT = 520
export const BOWL_WALL = 10
export const DANGER_Y = 72

export const GRAVITY = 2400
export const RESTITUTION = 0.16
export const FLOOR_FRICTION = 0.82
export const AIR_DRAG = 0.995
export const MAX_SPEED = 1600
export const REST_SPEED = 28
export const MERGE_GAP = 0.9
export const MERGE_ARM_MS = 90
export const COMBO_WINDOW_MS = 520
export const OVERFLOW_HOLD_MS = 900
export const WIN_RANK = 4
export const MAX_DROP_RANK = 2

export interface MergeSkin {
  rank: number
  label: string
  radius: number
  points: number
  hue: string
}

/**
 * Rank climb is the arcade fruit chain. Labels are Witness Square flavor skins
 * (died → buried → raised → appeared → creed). Matching rank is what merges.
 */
export const MERGE_SKINS: readonly MergeSkin[] = [
  { rank: 0, label: 'Pip', radius: 18, points: 8, hue: 'lime' },
  { rank: 1, label: 'Died', radius: 28, points: 20, hue: 'gold' },
  { rank: 2, label: 'Buried', radius: 38, points: 45, hue: 'berry' },
  { rank: 3, label: 'Raised', radius: 50, points: 90, hue: 'sky' },
  { rank: 4, label: 'Creed', radius: 66, points: 400, hue: 'lock' },
] as const

/** Next-drop bag — mostly small candy, like Suika. Never drops the lock fruit. */
export const DROP_BAG = [0, 0, 0, 1, 1, 1, 1, 2, 2] as const

export interface MergeBall {
  id: number
  rank: number
  x: number
  y: number
  vx: number
  vy: number
  r: number
  bornAt: number
  held: boolean
  dropping: boolean
}

export type MergeEventKind = 'merge' | 'miss' | 'win' | 'overflow' | 'drop'

export interface MergeEvent {
  kind: MergeEventKind
  x?: number
  y?: number
  rank?: number
  combo?: number
  points?: number
}

export interface MergeState {
  balls: MergeBall[]
  nextRank: number
  previewRank: number
  aimX: number
  score: number
  combo: number
  comboUntil: number
  won: boolean
  overflow: boolean
  overflowSince: number
  droppingId: number | null
  grabId: number | null
  nextId: number
  rng: number
  events: MergeEvent[]
}

export function mergeSkin(rank: number): MergeSkin {
  const clamped = Math.max(0, Math.min(WIN_RANK, Math.floor(rank)))
  return MERGE_SKINS[clamped] ?? MERGE_SKINS[0]
}

export function applyMergeMiss(score: number): number {
  return Math.max(0, score - MERGE_MISS_PENALTY)
}

export function mergePoints(nextRank: number, combo: number): number {
  const skin = mergeSkin(nextRank)
  return skin.points * Math.max(1, combo)
}

/** Tiny seeded RNG so tests and boards can repeat. */
export function mixSeed(seed: number): number {
  let t = seed + 0x6d2b79f5
  t = Math.imul(t ^ (t >>> 15), t | 1)
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}

export function pickDropRank(seed: number): { rank: number; nextSeed: number } {
  const roll = mixSeed(seed)
  const index = Math.floor(roll * DROP_BAG.length) % DROP_BAG.length
  const rank = DROP_BAG[index] ?? 0
  return { rank: Math.min(MAX_DROP_RANK, rank), nextSeed: seed + 1 }
}

function clampAim(x: number, radius: number): number {
  const min = BOWL_WALL + radius
  const max = BOWL_WIDTH - BOWL_WALL - radius
  return Math.min(max, Math.max(min, x))
}

function makeBall(
  id: number,
  rank: number,
  x: number,
  y: number,
  now: number,
  extra: Partial<MergeBall> = {},
): MergeBall {
  const skin = mergeSkin(rank)
  return {
    id,
    rank: skin.rank,
    x,
    y,
    vx: 0,
    vy: 0,
    r: skin.radius,
    bornAt: now,
    held: false,
    dropping: false,
    ...extra,
  }
}

function drawNext(seed: number): { rank: number; preview: number; nextSeed: number } {
  const first = pickDropRank(seed)
  const second = pickDropRank(first.nextSeed)
  return { rank: first.rank, preview: second.rank, nextSeed: second.nextSeed }
}

/** Two matching Died already in the bowl — smash them. Instant arcade, not a blank quiz. */
export function openingBalls(now = 0): MergeBall[] {
  const floor = BOWL_HEIGHT - BOWL_WALL
  const died = mergeSkin(1)
  const pip = mergeSkin(0)
  return [
    makeBall(1, 1, 92, floor - died.radius, now),
    makeBall(2, 1, 268, floor - died.radius, now),
    makeBall(3, 0, 180, floor - pip.radius, now),
  ]
}

export function createMergeGame(seed = 1, now = 0): MergeState {
  const draw = drawNext(seed)
  return {
    balls: openingBalls(now),
    nextRank: draw.rank,
    previewRank: draw.preview,
    aimX: BOWL_WIDTH / 2,
    score: MERGE_START_SCORE,
    combo: 0,
    comboUntil: 0,
    won: false,
    overflow: false,
    overflowSince: 0,
    droppingId: null,
    grabId: null,
    nextId: 4,
    rng: draw.nextSeed,
    events: [],
  }
}

export function aimMerge(state: MergeState, x: number): MergeState {
  if (state.won || state.overflow) return state
  return { ...state, aimX: clampAim(x, mergeSkin(state.nextRank).radius), events: [] }
}

export function canDrop(state: MergeState): boolean {
  return !state.won && !state.overflow && state.droppingId === null && state.grabId === null
}

export function dropNext(state: MergeState, now: number): MergeState {
  if (!canDrop(state)) return { ...state, events: [] }
  const skin = mergeSkin(state.nextRank)
  const x = clampAim(state.aimX, skin.radius)
  const ball = makeBall(state.nextId, state.nextRank, x, skin.radius + 8, now, {
    dropping: true,
    vy: 40,
  })
  const draw = drawNext(state.rng)
  return {
    ...state,
    balls: [...state.balls, ball],
    droppingId: ball.id,
    nextRank: draw.rank,
    previewRank: draw.preview,
    rng: draw.nextSeed,
    nextId: state.nextId + 1,
    events: [{ kind: 'drop', x, y: ball.y, rank: ball.rank }],
  }
}

export function ballAt(state: MergeState, x: number, y: number): MergeBall | null {
  let hit: MergeBall | null = null
  let best = Infinity
  for (const ball of state.balls) {
    const dx = ball.x - x
    const dy = ball.y - y
    const dist = Math.hypot(dx, dy)
    if (dist <= ball.r + 8 && dist < best) {
      best = dist
      hit = ball
    }
  }
  return hit
}

export function grabBall(state: MergeState, id: number): MergeState {
  if (state.won || state.overflow || state.droppingId !== null) return { ...state, events: [] }
  const target = state.balls.find((ball) => ball.id === id)
  if (!target || target.dropping) return { ...state, events: [] }
  return {
    ...state,
    grabId: id,
    balls: state.balls.map((ball) =>
      ball.id === id ? { ...ball, held: true, vx: 0, vy: 0 } : ball,
    ),
    events: [],
  }
}

export function dragGrab(state: MergeState, x: number, y: number): MergeState {
  if (state.grabId === null) return state
  const grabbed = state.balls.find((ball) => ball.id === state.grabId)
  if (!grabbed) return { ...state, grabId: null, events: [] }
  const nx = clampAim(x, grabbed.r)
  const ny = Math.min(BOWL_HEIGHT - BOWL_WALL - grabbed.r, Math.max(grabbed.r + 4, y))
  return {
    ...state,
    balls: state.balls.map((ball) =>
      ball.id === grabbed.id ? { ...ball, x: nx, y: ny, vx: 0, vy: 0, held: true } : ball,
    ),
    events: [],
  }
}

function overlapPair(a: MergeBall, b: MergeBall): number {
  const dist = Math.hypot(a.x - b.x, a.y - b.y)
  return a.r + b.r - dist
}

function nearestOther(balls: MergeBall[], grabbed: MergeBall): MergeBall | null {
  let hit: MergeBall | null = null
  let best = -Infinity
  for (const ball of balls) {
    if (ball.id === grabbed.id) continue
    const overlap = overlapPair(grabbed, ball)
    if (overlap > best) {
      best = overlap
      hit = ball
    }
  }
  if (!hit || best < hit.r * 0.18) return null
  return hit
}

function mergePair(
  state: MergeState,
  a: MergeBall,
  b: MergeBall,
  now: number,
): MergeState {
  const nextRank = Math.min(WIN_RANK, a.rank + 1)
  const combo = now <= state.comboUntil ? state.combo + 1 : 1
  const points = mergePoints(nextRank, combo)
  const x = (a.x + b.x) / 2
  const y = (a.y + b.y) / 2
  const spawned = makeBall(state.nextId, nextRank, x, y, now, {
    vx: (a.vx + b.vx) / 4,
    vy: Math.min(0, (a.vy + b.vy) / 4),
  })
  const won = nextRank >= WIN_RANK || state.won
  const events: MergeEvent[] = [
    { kind: 'merge', x, y, rank: nextRank, combo, points },
  ]
  if (won && !state.won) events.push({ kind: 'win', x, y, rank: nextRank, combo, points })
  return {
    ...state,
    balls: [...state.balls.filter((ball) => ball.id !== a.id && ball.id !== b.id), spawned],
    score: state.score + points,
    combo,
    comboUntil: now + COMBO_WINDOW_MS,
    won,
    grabId: null,
    droppingId:
      state.droppingId === a.id || state.droppingId === b.id ? null : state.droppingId,
    nextId: state.nextId + 1,
    events,
  }
}

export function releaseGrab(state: MergeState, now: number): MergeState {
  if (state.grabId === null) return { ...state, events: [] }
  const grabbed = state.balls.find((ball) => ball.id === state.grabId)
  if (!grabbed) return { ...state, grabId: null, events: [] }
  const other = nearestOther(state.balls, grabbed)
  if (other && other.rank === grabbed.rank && grabbed.rank < WIN_RANK) {
    return mergePair(
      {
        ...state,
        balls: state.balls.map((ball) =>
          ball.id === grabbed.id ? { ...ball, held: false } : ball,
        ),
      },
      { ...grabbed, held: false },
      other,
      now,
    )
  }
  if (other && other.rank !== grabbed.rank) {
    const dx = grabbed.x - other.x
    const dy = grabbed.y - other.y
    const dist = Math.max(1, Math.hypot(dx, dy))
    const nx = dx / dist
    const ny = dy / dist
    const push = 220
    return {
      ...state,
      score: applyMergeMiss(state.score),
      grabId: null,
      combo: 0,
      comboUntil: 0,
      balls: state.balls.map((ball) => {
        if (ball.id === grabbed.id) {
          return { ...ball, held: false, vx: nx * push, vy: ny * push }
        }
        if (ball.id === other.id) {
          return { ...ball, vx: -nx * push * 0.6, vy: -ny * push * 0.6 }
        }
        return ball
      }),
      events: [{ kind: 'miss', x: grabbed.x, y: grabbed.y }],
    }
  }
  return {
    ...state,
    grabId: null,
    balls: state.balls.map((ball) =>
      ball.id === grabbed.id ? { ...ball, held: false, dropping: true, vy: 80 } : ball,
    ),
    droppingId: state.droppingId ?? grabbed.id,
    events: [],
  }
}

function clampBall(ball: MergeBall): MergeBall {
  const minX = BOWL_WALL + ball.r
  const maxX = BOWL_WIDTH - BOWL_WALL - ball.r
  const minY = ball.r + 2
  const maxY = BOWL_HEIGHT - BOWL_WALL - ball.r
  let { x, y, vx, vy } = ball
  if (x < minX) {
    x = minX
    vx = Math.abs(vx) * RESTITUTION
  } else if (x > maxX) {
    x = maxX
    vx = -Math.abs(vx) * RESTITUTION
  }
  if (y > maxY) {
    y = maxY
    vy = -Math.abs(vy) * RESTITUTION * 0.4
    vx *= FLOOR_FRICTION
    if (Math.abs(vy) < REST_SPEED) vy = 0
    if (Math.abs(vx) < REST_SPEED * 0.4) vx = 0
  }
  if (y < minY && !ball.dropping && !ball.held) {
    y = minY
    vy = Math.abs(vy) * RESTITUTION
  }
  const speed = Math.hypot(vx, vy)
  if (speed > MAX_SPEED) {
    vx = (vx / speed) * MAX_SPEED
    vy = (vy / speed) * MAX_SPEED
  }
  return { ...ball, x, y, vx, vy }
}

function collide(a: MergeBall, b: MergeBall): void {
  if (a.held && b.held) return
  const dx = b.x - a.x
  const dy = b.y - a.y
  const dist = Math.hypot(dx, dy)
  const minDist = a.r + b.r
  if (dist === 0 || dist >= minDist) return
  const nx = dx / dist
  const ny = dy / dist
  const overlap = minDist - dist
  if (a.held) {
    b.x += nx * overlap
    b.y += ny * overlap
  } else if (b.held) {
    a.x -= nx * overlap
    a.y -= ny * overlap
  } else {
    const split = overlap / 2
    a.x -= nx * split
    a.y -= ny * split
    b.x += nx * split
    b.y += ny * split
  }
  const rv = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny
  if (rv >= 0) return
  const impulse = -(1 + RESTITUTION) * rv * 0.5
  if (!a.held) {
    a.vx -= impulse * nx
    a.vy -= impulse * ny
  }
  if (!b.held) {
    b.vx += impulse * nx
    b.vy += impulse * ny
  }
}

function findMerge(balls: MergeBall[], now: number): [MergeBall, MergeBall] | null {
  for (let i = 0; i < balls.length; i += 1) {
    const a = balls[i]
    if (!a || a.held || a.rank >= WIN_RANK || now - a.bornAt < MERGE_ARM_MS) continue
    for (let j = i + 1; j < balls.length; j += 1) {
      const b = balls[j]
      if (!b || b.held || b.rank !== a.rank || now - b.bornAt < MERGE_ARM_MS) continue
      const dist = Math.hypot(a.x - b.x, a.y - b.y)
      if (dist <= (a.r + b.r) * MERGE_GAP) return [a, b]
    }
  }
  return null
}

export function stepMerge(state: MergeState, dtSec: number, now: number): MergeState {
  if (state.won || state.overflow) return { ...state, events: [] }
  const dt = Math.min(0.032, Math.max(0, dtSec))
  const balls = state.balls.map((ball) => ({ ...ball }))

  for (const ball of balls) {
    if (ball.held) continue
    ball.vy += GRAVITY * dt
    ball.vx *= AIR_DRAG
    ball.vy *= AIR_DRAG
    ball.x += ball.vx * dt
    ball.y += ball.vy * dt
    Object.assign(ball, clampBall(ball))
  }

  for (let pass = 0; pass < 4; pass += 1) {
    for (let i = 0; i < balls.length; i += 1) {
      const a = balls[i]
      if (!a) continue
      for (let j = i + 1; j < balls.length; j += 1) {
        const b = balls[j]
        if (!b) continue
        collide(a, b)
        Object.assign(a, clampBall(a))
        Object.assign(b, clampBall(b))
      }
    }
  }

  let next: MergeState = {
    ...state,
    balls,
    events: [],
  }

  const dropping = next.balls.find((ball) => ball.id === next.droppingId)
  if (dropping) {
    const settled = !dropping.held && Math.hypot(dropping.vx, dropping.vy) < REST_SPEED * 1.4 && dropping.y > BOWL_HEIGHT * 0.35
    const stacked = next.balls.some(
      (ball) =>
        ball.id !== dropping.id &&
        overlapPair(dropping, ball) > dropping.r * 0.12 &&
        Math.abs(dropping.vy) < 220,
    )
    if (settled || stacked) {
      next = {
        ...next,
        droppingId: null,
        balls: next.balls.map((ball) =>
          ball.id === dropping.id ? { ...ball, dropping: false } : ball,
        ),
      }
    }
  }

  const pair = findMerge(next.balls, now)
  if (pair) {
    next = mergePair(next, pair[0], pair[1], now)
  }

  if (next.won) return next

  const danger = next.balls.some((ball) => {
    if (ball.held || ball.dropping) return false
    const slow = Math.hypot(ball.vx, ball.vy) < REST_SPEED
    return slow && ball.y - ball.r <= DANGER_Y
  })
  if (danger) {
    const since = next.overflowSince || now
    if (now - since >= OVERFLOW_HOLD_MS) {
      return {
        ...next,
        overflow: true,
        overflowSince: since,
        events: [...next.events, { kind: 'overflow' }],
      }
    }
    return { ...next, overflowSince: since }
  }

  return { ...next, overflowSince: 0 }
}

export function spawnMergeBall(
  state: MergeState,
  rank: number,
  x: number,
  y: number,
  now: number,
): MergeState {
  const ball = makeBall(state.nextId, rank, x, y, now)
  return {
    ...state,
    balls: [...state.balls, ball],
    nextId: state.nextId + 1,
    events: [],
  }
}

export function resetMergeRound(seed: number, now: number, keepScore = 0): MergeState {
  return { ...createMergeGame(seed, now), score: keepScore }
}

export function mergeBeatsOpened(highestRank: number, won: boolean): number {
  if (won) return 4
  if (highestRank >= 3) return 3
  if (highestRank >= 2) return 2
  return 1
}

export function highestMergeRank(balls: readonly MergeBall[]): number {
  return balls.reduce((max, ball) => Math.max(max, ball.rank), 0)
}
