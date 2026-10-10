import { bindLampGround } from '../../lib/lampPlace.ts'
import { A2_NIGHT_MAP } from './a2.ts'
import { FAR_HILLS_NIGHT_MAP } from './farHillsMap.ts'
import type { NightMapId } from './resolve.ts'

/** Point the walker road, the ghost, and the no-go lists at this map. */
export function applyNightMap(id: NightMapId) {
  if (id === 'far-hills') {
    bindLampGround(FAR_HILLS_NIGHT_MAP)
    return FAR_HILLS_NIGHT_MAP
  }
  bindLampGround(null)
  return A2_NIGHT_MAP
}
