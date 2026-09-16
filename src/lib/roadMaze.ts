/** Good Samaritan road-maze — find the hurt man, help him, take him to the inn. */

export const ROAD_MAZE_LINE = 'ph-road'

/** Locked Easy Hold claim — do not rewrite. */
export const ROAD_MAZE_CLAIM = 'Neighbor is the one who shows mercy.'

export const ROAD_MAZE_WIN = 'Helped!'

export const ROAD_MAZE_HINT = 'Stay on the open road.'

export const ROAD_MAZE_AGAIN = 'One more road'

/** Tiny Luke 10 flavor after Help — never a collectible headline. */
export const MAZE_CARE_WHY = 'You bind his wounds.'

export const MAZE_FIND_SCORE = 25
export const MAZE_HELP_SCORE = 50
export const MAZE_INN_SCORE = 100

export type MazeBeatId = 'hurt' | 'help' | 'inn'

export interface MazeCoord {
  r: number
  c: number
}

export interface MazeBeat {
  id: MazeBeatId
  label: string
  hint: string
}

/** Mercy arc the player can read at a glance — not an inventory. */
export const MAZE_BEATS: readonly MazeBeat[] = [
  { id: 'hurt', label: 'Hurt man', hint: 'Find the hurt man.' },
  { id: 'help', label: 'Help', hint: 'Stop and help him.' },
  { id: 'inn', label: 'Inn', hint: 'Take him to the inn.' },
] as const

export const MAZE_COLS = 5
export const MAZE_ROWS = 7

export const MAZE_START: MazeCoord = { r: 0, c: 0 }
export const MAZE_HURT: MazeCoord = { r: 4, c: 4 }
export const MAZE_INN: MazeCoord = { r: 6, c: 0 }

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

export function mazeBeatAt(cell: MazeCoord): MazeBeat | null {
  if (mazeSame(cell, MAZE_HURT)) return MAZE_BEATS[0] ?? null
  if (mazeSame(cell, MAZE_INN)) return MAZE_BEATS[2] ?? null
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

/** Finger moved this far before it counts as a maze step, not a fidget. */
export const MAZE_SWIPE_MIN = 28

/** Play-chrome scroll of this many px is a look, not a miss. */
export const MAZE_LOOK_SCROLL = 8

/** Scroll / off-road pan to peek Hurt man · Help · Inn — not a path swipe. */
export function isMazeLookPan(input: {
  dx: number
  dy: number
  scrolled: number
  startedOnRoad: boolean
}): boolean {
  if (Math.abs(input.scrolled) >= MAZE_LOOK_SCROLL) return true
  if (!input.startedOnRoad) return true
  return false
}

/** Intentional step: started on the open road, did not scroll the play, moved far enough. */
export function isMazePathSwipe(input: {
  dx: number
  dy: number
  scrolled: number
  startedOnRoad: boolean
}): boolean {
  if (isMazeLookPan(input)) return false
  return Math.abs(input.dx) >= MAZE_SWIPE_MIN || Math.abs(input.dy) >= MAZE_SWIPE_MIN
}

export interface MazeGoal {
  kind: MazeBeatId
  at: MazeCoord
  label: string
  hint: string
}

export function mazeGoal(found: boolean, helped: boolean): MazeGoal {
  if (!found) {
    return { kind: 'hurt', at: MAZE_HURT, label: 'Hurt man', hint: 'Find the hurt man.' }
  }
  if (!helped) {
    return { kind: 'help', at: MAZE_HURT, label: 'Help', hint: 'Stop and help him.' }
  }
  return { kind: 'inn', at: MAZE_INN, label: 'Inn', hint: 'Take him to the inn.' }
}

/** Help is the mercy verb at the man — not an inventory gate. */
export function canHelp(found: boolean, helped: boolean): boolean {
  return found && !helped
}

export function canWin(helped: boolean, at: MazeCoord): boolean {
  return helped && mazeSame(at, MAZE_INN)
}

export function mazeBlockedHint(at: MazeCoord, found: boolean, helped: boolean): string {
  if (mazeSame(at, MAZE_INN) && !helped) return 'Help the hurt man first.'
  if (mazeSame(at, MAZE_HURT) && found && !helped) return 'Stop and help him.'
  return ROAD_MAZE_HINT
}

/** Story panels: hurt → walk-past → help → neighbor. */
export function mazeBeatsOpened(found: boolean, helped: boolean, won: boolean): number {
  if (won) return 4
  if (helped) return 3
  if (found) return 2
  return 1
}

export function mazeCaption(found: boolean, helped: boolean, won: boolean): string {
  if (won) return ROAD_MAZE_CLAIM
  if (helped) return 'Take him to the inn.'
  if (found) return 'Stop. Help the hurt man.'
  return 'Find the hurt man.'
}

export function mazeBeatDone(id: MazeBeatId, found: boolean, helped: boolean, won: boolean): boolean {
  if (id === 'hurt') return found
  if (id === 'help') return helped
  return won
}
