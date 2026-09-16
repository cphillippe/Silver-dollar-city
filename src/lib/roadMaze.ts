/** Good Samaritan road-maze — collect help, then take him to the inn. */

export const ROAD_MAZE_LINE = 'ph-road'

/** Locked Easy Hold claim — do not rewrite. */
export const ROAD_MAZE_CLAIM = 'Neighbor is the one who shows mercy.'

export const ROAD_MAZE_WIN = 'Helped!'

export const ROAD_MAZE_HINT = 'Stay on the open road.'

export const ROAD_MAZE_AGAIN = 'One more road'

export const MAZE_ITEM_SCORE = 25
export const MAZE_HELP_SCORE = 50
export const MAZE_INN_SCORE = 100

export type MazeItemId = 'oil' | 'cloth' | 'coin'

export interface MazeCoord {
  r: number
  c: number
}

export interface MazeItem {
  id: MazeItemId
  label: string
  yes: string
  why: string
}

/** Luke 10:34–35 — oil, bind the wounds, two denarii for the inn. */
export const MAZE_ITEMS: readonly MazeItem[] = [
  { id: 'oil', label: 'Oil', yes: 'Yes · Oil', why: 'He pours oil on the wounds.' },
  { id: 'cloth', label: 'Cloth', yes: 'Yes · Cloth', why: 'He binds the hurt man.' },
  { id: 'coin', label: 'Coin', yes: 'Yes · Coin', why: 'He pays the inn to keep him.' },
] as const

export const MAZE_COLS = 5
export const MAZE_ROWS = 7

export const MAZE_START: MazeCoord = { r: 0, c: 0 }
export const MAZE_HURT: MazeCoord = { r: 4, c: 4 }
export const MAZE_INN: MazeCoord = { r: 6, c: 0 }

export const MAZE_ITEM_AT: Record<MazeItemId, MazeCoord> = {
  oil: { r: 0, c: 4 },
  cloth: { r: 2, c: 4 },
  coin: { r: 6, c: 2 },
}

/** 1 = open road. Authored Jericho-road bend — not a random junk maze. */
export const MAZE_ROADS: readonly (readonly number[])[] = [
  [1, 1, 0, 1, 1],
  [0, 1, 1, 1, 0],
  [1, 1, 0, 1, 1],
  [1, 0, 0, 1, 0],
  [1, 1, 1, 1, 1],
  [0, 1, 0, 1, 0],
  [1, 1, 1, 1, 0],
]

const DIRS: MazeCoord[] = [
  { r: -1, c: 0 },
  { r: 1, c: 0 },
  { r: 0, c: -1 },
  { r: 0, c: 1 },
]

export function mazeSame(a: MazeCoord, b: MazeCoord): boolean {
  return a.r === b.r && a.c === b.c
}

export function mazeKey(cell: MazeCoord): string {
  return `${cell.r}:${cell.c}`
}

export function isMazeRoad(cell: MazeCoord): boolean {
  return MAZE_ROADS[cell.r]?.[cell.c] === 1
}

export function mazeNeighbors(cell: MazeCoord): MazeCoord[] {
  return DIRS.map((dir) => ({ r: cell.r + dir.r, c: cell.c + dir.c })).filter(isMazeRoad)
}

export function mazeItemAt(cell: MazeCoord): MazeItem | null {
  for (const item of MAZE_ITEMS) {
    if (mazeSame(cell, MAZE_ITEM_AT[item.id])) return item
  }
  return null
}

export function shortestMazePath(from: MazeCoord, to: MazeCoord): MazeCoord[] | null {
  if (!isMazeRoad(from) || !isMazeRoad(to)) return null
  if (mazeSame(from, to)) return [from]
  const seen = new Set<string>([mazeKey(from)])
  const queue: MazeCoord[][] = [[from]]
  while (queue.length) {
    const trail = queue.shift()
    if (!trail) break
    const last = trail[trail.length - 1]
    if (!last) break
    for (const next of mazeNeighbors(last)) {
      const key = mazeKey(next)
      if (seen.has(key)) continue
      const walk = [...trail, next]
      if (mazeSame(next, to)) return walk
      seen.add(key)
      queue.push(walk)
    }
  }
  return null
}

export function swipeStep(from: MazeCoord, dr: number, dc: number): MazeCoord | null {
  if ((dr === 0 && dc === 0) || (dr !== 0 && dc !== 0)) return null
  const step = { r: from.r + Math.sign(dr), c: from.c + Math.sign(dc) }
  return isMazeRoad(step) ? step : null
}

export interface MazeGoal {
  kind: 'item' | 'hurt' | 'inn'
  id?: MazeItemId
  at: MazeCoord
  hint: string
}

export function mazeGoal(got: readonly MazeItemId[], helped: boolean): MazeGoal {
  if (!got.includes('oil')) {
    return { kind: 'item', id: 'oil', at: MAZE_ITEM_AT.oil, hint: 'Get the oil first.' }
  }
  if (!got.includes('cloth')) {
    return { kind: 'item', id: 'cloth', at: MAZE_ITEM_AT.cloth, hint: 'Get the cloth next.' }
  }
  if (!helped) {
    return { kind: 'hurt', at: MAZE_HURT, hint: 'Now go to the hurt man.' }
  }
  if (!got.includes('coin')) {
    return { kind: 'item', id: 'coin', at: MAZE_ITEM_AT.coin, hint: 'The inn needs the coin.' }
  }
  return { kind: 'inn', at: MAZE_INN, hint: 'Take him to the inn.' }
}

export function canHelp(got: readonly MazeItemId[]): boolean {
  return got.includes('oil') && got.includes('cloth')
}

export function canWin(got: readonly MazeItemId[], helped: boolean, at: MazeCoord): boolean {
  return helped && got.includes('coin') && mazeSame(at, MAZE_INN)
}

export function mazeBlockedHint(at: MazeCoord, got: readonly MazeItemId[], helped: boolean): string {
  if (mazeSame(at, MAZE_HURT) && !canHelp(got)) return 'Get oil and cloth first.'
  if (mazeSame(at, MAZE_INN) && !helped) return 'Help the hurt man first.'
  if (mazeSame(at, MAZE_INN) && helped && !got.includes('coin')) return 'The inn needs the coin.'
  return ROAD_MAZE_HINT
}

/** Story panels: hurt → walk-past → help → neighbor. */
export function mazeBeatsOpened(got: readonly MazeItemId[], helped: boolean, won: boolean): number {
  if (won) return 4
  if (helped) return 3
  if (got.length >= 1) return 2
  return 1
}

export function mazeCaption(
  got: readonly MazeItemId[],
  helped: boolean,
  won: boolean,
): string {
  if (won) return ROAD_MAZE_CLAIM
  if (helped && !got.includes('coin')) return 'He is on the road. The inn needs the coin.'
  if (helped) return 'Take him to the inn.'
  if (canHelp(got)) return 'You have what he needs. Go to him.'
  return mazeGoal(got, helped).hint
}
