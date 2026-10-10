import map02 from '../../assets/night-watch/maps/map02.webp'
import map03 from '../../assets/night-watch/maps/map03.webp'
import map04 from '../../assets/night-watch/maps/map04.webp'
import map05 from '../../assets/night-watch/maps/map05.webp'
import map06 from '../../assets/night-watch/maps/map06.webp'
import type { NightMapSurface } from '../map/surface.ts'
import type { NightMapId } from './chain.ts'
import { nightMapFromPack, type NightMapPack } from './fromPack.ts'
import pack02 from './maze/map02.json?raw'
import pack03 from './maze/map03.json?raw'
import pack04 from './maze/map04.json?raw'
import pack05 from './maze/map05.json?raw'
import pack06 from './maze/map06.json?raw'

export interface PlayableNightMap extends NightMapPack {
  porchCandy: false
  plate: NightMapSurface
}

function load(text: string, plate: string): PlayableNightMap {
  const pack = nightMapFromPack(JSON.parse(text))
  return {
    ...pack,
    porchCandy: false,
    plate: {
      width: pack.width,
      height: pack.height,
      viewBox: `0 0 ${pack.width} ${pack.height}`,
      plate,
    },
  }
}

export const FAR_HILLS_NIGHT_MAP = load(pack02, map02)
export const FAR_HILLS_PLATE = FAR_HILLS_NIGHT_MAP.plate

export const MAZE_NIGHT_MAPS: Record<Exclude<NightMapId, 'a2'>, PlayableNightMap> = {
  'far-hills': FAR_HILLS_NIGHT_MAP,
  map03: load(pack03, map03),
  map04: load(pack04, map04),
  map05: load(pack05, map05),
  map06: load(pack06, map06),
}

export function playableNightMap(id: NightMapId): PlayableNightMap | null {
  if (id === 'a2') return null
  return MAZE_NIGHT_MAPS[id]
}
