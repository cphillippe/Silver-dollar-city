import {
  DEFEND_WAVE_SIZE,
  easyHoldSpawn,
  easySpawnT,
  easyTapFit,
  easyTapTarget,
  heavenPoint,
  heavenSpeed,
  RAID_CAST,
  raidForWave,
  waveIsClear,
  waveSpawnEvery,
  waveSpeed,
} from '../../lib/defend.ts'
import type { WalkerKind } from '../../types.ts'
import { walkerFaceSrc } from './faces.ts'
import { nightParts } from '../parts/index.ts'
import { nightPath } from '../path/index.ts'
import type { NightPoint, NightRaider } from '../types.ts'
import { enemyHit, enemyMaxHp } from './hp.ts'

export * from './hp.ts'

const asset = (path: string) => new URL(path, import.meta.url).href

/** ENEMIES fallback when Parts face registry has no entry for this kind. */
export const NIGHT_DARK_FACE = asset('../../assets/night-watch/nw-dark-face-cut.png')

const KIND_FACES: Record<WalkerKind, string> = {
  'image-bearer': asset('../../assets/walkers/walker-image-bearer.png'),
  skeptic: asset('../../assets/walkers/walker-skeptic.png'),
  pagan: asset('../../assets/walkers/walker-pagan.png'),
  physical: asset('../../assets/walkers/walker-physical.png'),
  metaphysical: asset('../../assets/walkers/walker-metaphysical.png'),
  spiritual: asset('../../assets/walkers/walker-spiritual.png'),
}

export interface NightEnemiesModule {
  readonly waveSize: number
  /** RAID_CAST taunts — cast() picks the line per wave index. */
  readonly taunts: typeof RAID_CAST
  /** Portrait pool first, then the Parts face, then the dark cutout or kind portrait. */
  faceSrc(id: string, easy: boolean): string
  /** Who walks next in this wave. Climb pool, with a wave-5 tank bias. */
  cast(
    cleared: number,
    index: number,
    waveIndex?: number,
    easy?: boolean,
  ): { text: string; kind: WalkerKind; id: string; label: string; lore: string }
  /** Easy: where on the road a new walker appears. */
  spawnT(index: number): number
  /** Easy: hold the next spawn while this many unturned walkers are live. */
  holdSpawn(liveUnturned: number): boolean
  spawnEvery(easy: boolean): number
  speed(easy: boolean): number
  heavenSpeed(tier: number, easy: boolean): number
  /** Walker position: on the road, or lifting toward heaven once turned. */
  at(raider: NightRaider): NightPoint
  /** Front-most unturned walker (Easy cue on path, not a lone HTML face). */
  cueTarget<T extends NightRaider>(raiders: T[]): T | undefined
  fit(easy: boolean, toolId: string, kind: WalkerKind): 'match' | 'weak'
  /** Spawn HP: swarm / mid / tank role per kind, lower on Easy. */
  maxHp(kind: WalkerKind, easy: boolean): number
  /** Matching hit only (weak stays pushback). `down` → caller soft-turns heavenward. */
  hit<T extends NightRaider>(raider: T, damage?: number): { raider: T; down: boolean }
  isClear(easy: boolean, downed: number, spawned: number, walking: number, size?: number): boolean
}

export const nightEnemies: NightEnemiesModule = {
  waveSize: DEFEND_WAVE_SIZE,
  taunts: RAID_CAST,
  faceSrc: (id, easy) =>
    walkerFaceSrc(id) ??
    nightParts.src('face', id) ??
    (easy ? NIGHT_DARK_FACE : (KIND_FACES[id as WalkerKind] ?? NIGHT_DARK_FACE)),
  cast: raidForWave,
  spawnT: easySpawnT,
  holdSpawn: easyHoldSpawn,
  spawnEvery: waveSpawnEvery,
  speed: waveSpeed,
  heavenSpeed,
  at: (raider) =>
    raider.turned && raider.from
      ? heavenPoint(raider.from, raider.heavenT ?? 0)
      : nightPath.pointAt(raider.t),
  cueTarget: easyTapTarget,
  fit: easyTapFit,
  maxHp: enemyMaxHp,
  hit: enemyHit,
  isClear: (easy, downed, spawned, walking, size) =>
    waveIsClear(easy, downed, spawned, walking, size),
}
