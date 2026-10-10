import { bindLampGround } from '../../lib/lampPlace.ts'
import { A2_NIGHT_MAP } from './a2.ts'
import type { NightMapId } from './chain.ts'
import { playableNightMap, type PlayableNightMap } from './mazeMaps.ts'

/** Point the walker roads, the ghost, and the no-go lists at this map. */
export function applyNightMap(id: NightMapId): PlayableNightMap | typeof A2_NIGHT_MAP {
  const maze = playableNightMap(id)
  if (maze) {
    bindLampGround(maze)
    return maze
  }
  bindLampGround(null)
  return A2_NIGHT_MAP
}
