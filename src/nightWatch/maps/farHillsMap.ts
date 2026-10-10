import plate from '../../assets/night-watch/maps/far-hills.webp'
import type { NightMapSurface } from '../map/surface.ts'
import { nightMapFromPack } from './fromPack.ts'
import packText from './far-hills.json?raw'

const pack = nightMapFromPack(JSON.parse(packText))

export const FAR_HILLS_PLATE: NightMapSurface = {
  width: pack.width,
  height: pack.height,
  viewBox: `0 0 ${pack.width} ${pack.height}`,
  plate,
}

export const FAR_HILLS_NIGHT_MAP = {
  ...pack,
  porchCandy: false as const,
  plate: FAR_HILLS_PLATE,
}
